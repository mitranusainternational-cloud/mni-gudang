-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-07, langkah 4 cetak biru database)
-- MNI Gudang - View agregasi dashboard (satu pembacaan untuk frontend) dan Realtime pada tabel yang perlu
-- ============================================================
-- Disimpan di folder `draft`. URUTAN: terapkan SETELAH draf 19, 20, 21; draf 14 (produksi_log) opsional (aman diulang sesudah 14).
--
-- Prinsip:
--   * Semua view SECURITY INVOKER: pengguna hanya melihat baris yang diizinkan RLS tabel dasarnya.
--   * Realtime Supabase hanya menyiarkan perubahan TABEL, bukan view. Frontend berlangganan perubahan spk, vendor, kirim,
--     produksi_log, spk_materials lalu membaca ulang SATU view (di-debounce beberapa ratus milidetik). Draf ini memastikan tabel-tabel
--     itu ada di publikasi `supabase_realtime`; aplikasi yang sekarang tetap memakai table_stamps dan tidak berubah.
--   * Hari ini dihitung menurut Asia/Jakarta (bukan UTC) agar SPK tidak "terlambat" pada pukul 00.00 sampai 07.00 WIB.
--
-- Batas yang disengaja (tertulis karena menentukan angka yang tampil):
--   * Progres PRODUKSI akurat hanya bila item SPK membawa snapshot rute (`items[].rute`, daftar nama work center). Hari ini aplikasi
--     belum menyimpan rute di item (dihitung ulang dari aturan di JavaScript), jadi untuk SPK tanpa snapshot progres hanya berasal
--     dari total manual (`items[].prod`) dan kolom `progres_sumber` menyebutnya. Bahan baku, vendor, kirim, dan OTD tidak
--     tergantung rute dan akurat.
--   * Status bahan baku mengikuti rumus aplikasi untuk bagian yang tersedia di database (pemakaian dari mutasi 90 hari terakhir,
--     titik pesan ulang, PR terbuka). Histori snapshot Excel (rmhist) tidak ikut dihitung, jadi bahan yang pemakaiannya baru terlihat
--     dari snapshot bisa berbeda tipis dari angka di aplikasi sampai riwayat mutasi cukup 60 hari.
--   * OTD memakai tanggal surat jalan (kirim.tgl) sebagai tanggal kirim.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.hari_ini() RETURNS date
LANGUAGE sql STABLE SET search_path = public
AS $$ SELECT (now() AT TIME ZONE 'Asia/Jakarta')::date $$;

-- ---------- 1. Progres produksi per item ----------
-- Dibuat lewat SQL dinamis: catatan produksi hanya dihitung bila draf 14 (produksi_log) terpasang.
DO $$
DECLARE
  v_ev text;
BEGIN
  IF to_regclass('public.produksi_log') IS NOT NULL THEN
    v_ev := $q$COALESCE((SELECT SUM(p.qty) FROM public.produksi_log p
                          WHERE p.spk_id = s.id AND p.item_idx = (e.ord - 1)::int AND p.jenis = 'hasil' AND p.wc = r.last_wc
                            AND NOT EXISTS (SELECT 1 FROM public.produksi_log vv WHERE vv.jenis = 'void' AND vv.ref = p.id::text)), 0)$q$;
  ELSE
    v_ev := '0';
  END IF;
  EXECUTE format($v$
    CREATE OR REPLACE VIEW public.v_item_produksi WITH (security_invoker = true) AS
    SELECT s.id AS spk_id, (e.ord - 1)::int AS item_idx, public._num(e.it -> 'q') AS q,
           public._num(e.it -> 'prod') AS manual, r.last_wc,
           (r.last_wc IS NOT NULL) AS ada_rute,
           %1$s AS events_last,
           LEAST(public._num(e.it -> 'q'), public._num(e.it -> 'prod') + %1$s) AS qty_selesai,
           CASE WHEN r.last_wc IS NOT NULL THEN 'rute' WHEN public._num(e.it -> 'prod') > 0 THEN 'manual' ELSE 'tidak_ada' END AS sumber
      FROM public.spk s
      CROSS JOIN LATERAL jsonb_array_elements(s.items) WITH ORDINALITY AS e(it, ord)
      CROSS JOIN LATERAL (
        SELECT (SELECT t.x FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(e.it -> 'rute') = 'array' THEN e.it -> 'rute' ELSE '[]'::jsonb END)
                          WITH ORDINALITY AS t(x, o) WHERE t.x !~* '^vendor' ORDER BY t.o DESC LIMIT 1) AS last_wc) r
  $v$, v_ev);
END
$$;

-- ---------- 2. Status dan progres per SPK ----------
CREATE OR REPLACE VIEW public.v_spk_status WITH (security_invoker = true) AS
SELECT s.id AS spk_id, s.no, s.customer, s.po, s.peruntukan, s.due, s.status AS status_db,
       COALESCE(a.q, 0)             AS q,
       COALESCE(a.produksi, 0)      AS qty_produksi,
       COALESCE(a.kirim, 0)         AS qty_kirim,
       COALESCE(a.fg, 0)            AS qty_fg_masuk,
       COALESCE(a.vendor_kirim, 0)  AS vendor_kirim,
       COALESCE(a.vendor_kembali, 0) AS vendor_kembali,
       COALESCE(a.vendor_sisa, 0)   AS vendor_sisa,
       CASE WHEN COALESCE(a.q, 0) > 0 THEN LEAST(a.produksi / a.q, 1) ELSE 0 END AS progres_produksi,
       CASE WHEN COALESCE(a.q, 0) > 0 THEN LEAST((CASE WHEN s.peruntukan = 'stok_buffer' THEN a.fg ELSE a.kirim END) / a.q, 1) ELSE 0 END AS progres_kirim,
       COALESCE(a.sumber_rute, false) AS progres_dari_rute,
       CASE
         WHEN s.status = 'Batal' THEN 'Batal'
         WHEN s.status = 'Draft' THEN 'Draft'
         WHEN COALESCE(a.q, 0) > 0 AND (CASE WHEN s.peruntukan = 'stok_buffer' THEN a.fg ELSE a.kirim END) >= a.q THEN 'Selesai'
         WHEN s.due IS NOT NULL AND s.due < public.hari_ini() THEN 'Terlambat'
         WHEN s.due IS NOT NULL AND s.due - public.hari_ini() <= 1 THEN 'Jatuh Tempo'
         ELSE 'Proses'
       END AS status_hitung
  FROM public.spk s
  LEFT JOIN LATERAL (
    SELECT SUM(p.q) AS q,
           SUM(GREATEST(LEAST(ip.qty_selesai, p.q), LEAST(p.vendor_kirim, p.q))) AS produksi,
           SUM(LEAST(p.kirim_customer, p.q)) AS kirim,
           SUM(LEAST(p.fg_masuk, p.q)) AS fg,
           SUM(p.vendor_kirim) AS vendor_kirim, SUM(p.vendor_kembali) AS vendor_kembali, SUM(p.vendor_sisa) AS vendor_sisa,
           BOOL_OR(ip.ada_rute) AS sumber_rute
      FROM public.v_spk_item_posisi p
      JOIN public.v_item_produksi ip ON ip.spk_id = p.spk_id AND ip.item_idx = p.item_idx
     WHERE p.spk_id = s.id) a ON true;

-- ---------- 3. Bahan baku: stok, cadangan, status (rumus aplikasi untuk bagian yang ada di database) ----------
CREATE OR REPLACE VIEW public.v_dash_bahan_baku WITH (security_invoker = true) AS
WITH st AS (
  SELECT COALESCE((SELECT NULLIF(value ->> 'leadBeli', '')::numeric FROM public.master WHERE key = 'setting'), 7)  AS lead,
         COALESCE((SELECT NULLIF(value ->> 'cover', '')::numeric FROM public.master WHERE key = 'setting'), 30)   AS cover
), pakai AS (
  SELECT m.item_id, GREATEST(-SUM(m.delta) FILTER (WHERE m.tgl > public.hari_ini() - 90), 0) AS u90
    FROM public.mutasi m LEFT JOIN public.mutasi o ON o.id::text = m.data ->> 'koreksiDari'
   WHERE m.gudang = 'rm' AND (m.jenis = 'keluar' OR (m.jenis = 'koreksi' AND o.jenis = 'keluar'))
   GROUP BY m.item_id
), po AS (
  SELECT i ->> 'item' AS item_id, SUM(GREATEST(public._num(i -> 'q') - public._num(i -> 'qTerima'), 0)) AS on_order
    FROM public.pr p CROSS JOIN LATERAL jsonb_array_elements(p.items) i
   WHERE p.status IN ('Diajukan', 'Dipesan')
   GROUP BY i ->> 'item'
), dasar AS (
  SELECT r.id AS rm_id, r.item, r.ukuran, r.satuan,
         COALESCE(r.buffer, 0) AS buf, COALESCE(NULLIF(r.data ->> 'min', '')::numeric, 0) AS min_stok,
         (COALESCE(r.data ->> 'aktif', 'true') = 'false') AS nonaktif,
         public.rm_stok(r.id) AS stok, public.rm_cadangan(r.id) AS cadangan,
         GREATEST(0, LEAST(90, public.hari_ini() - COALESCE(r.tgl_stok_awal, public.hari_ini())))::numeric AS hari_app,
         COALESCE(pk.u90, 0) AS u90, COALESCE(po.on_order, 0) AS on_order, st.lead, st.cover
    FROM public.rm r CROSS JOIN st
    LEFT JOIN pakai pk ON pk.item_id = r.id
    LEFT JOIN po ON po.item_id = r.id::text
), hit AS (
  SELECT d.*, CASE WHEN d.hari_app > 0 THEN d.u90 / d.hari_app ELSE 0 END AS rata_hari FROM dasar d
), rop AS (
  SELECT h.*, h.min_stok + h.rata_hari * h.lead AS titik_pesan,
         GREATEST(h.buf, h.min_stok + h.rata_hari * h.lead + h.rata_hari * h.cover) AS target FROM hit h
), usul AS (
  SELECT x.*, CASE WHEN x.stok < x.buf OR (x.rata_hari > 0 AND x.stok <= x.titik_pesan)
                   THEN ceil(GREATEST(0, x.target - x.stok - x.on_order)) ELSE 0 END AS usulan_order FROM rop x
)
SELECT u.rm_id, u.item, u.ukuran, u.satuan, u.stok, u.cadangan, u.stok - u.cadangan AS tersedia, u.buf AS buffer, u.min_stok,
       u.rata_hari, u.titik_pesan, u.on_order, CASE WHEN u.nonaktif THEN 0 ELSE u.usulan_order END AS usulan_order,
       CASE
         WHEN u.nonaktif THEN 'Nonaktif'
         WHEN u.stok <= 0 AND (u.buf > 0 OR u.min_stok > 0 OR u.rata_hari > 0) THEN 'Habis'
         WHEN u.stok <= 0 THEN 'Kosong'
         WHEN u.min_stok > 0 AND u.stok < u.min_stok THEN 'Kritis'
         WHEN u.usulan_order > 0 THEN 'Perlu order'
         WHEN u.rata_hari = 0 AND u.hari_app >= 30 THEN 'Tidak bergerak'
         ELSE 'Aman'
       END AS status
  FROM usul u;

-- ---------- 4. OTD: tanggal SPK customer terkirim penuh dibanding due ----------
CREATE OR REPLACE VIEW public.v_spk_otd WITH (security_invoker = true) AS
WITH kirim_item AS (
  SELECT k.spk_id, ki ->> 'd' AS d, k.tgl, k.id AS kid, public._num(ki -> 'q') AS q
    FROM public.kirim k CROSS JOIN LATERAL jsonb_array_elements(k.items) ki
   WHERE k.status <> 'Batal' AND k.spk_id IS NOT NULL
), kum AS (
  SELECT spk_id, d, tgl, SUM(q) OVER (PARTITION BY spk_id, d ORDER BY tgl, kid ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS c FROM kirim_item
), per_item AS (
  SELECT s.id AS spk_id, s.due, e.it ->> 'd' AS d,
         (SELECT MIN(kk.tgl) FROM kum kk WHERE kk.spk_id = s.id AND kk.d = e.it ->> 'd' AND kk.c >= public._num(e.it -> 'q')) AS tgl_penuh,
         public._num(e.it -> 'q') AS q
    FROM public.spk s CROSS JOIN LATERAL jsonb_array_elements(s.items) e(it)
   WHERE s.status NOT IN ('Draft', 'Batal') AND s.peruntukan = 'customer'
)
SELECT spk_id, due, MAX(tgl_penuh) AS tgl_penuh,
       (BOOL_AND(tgl_penuh IS NOT NULL OR q <= 0)) AS terkirim_penuh,
       CASE WHEN BOOL_AND(tgl_penuh IS NOT NULL OR q <= 0) AND due IS NOT NULL THEN MAX(tgl_penuh) <= due END AS tepat_waktu
  FROM per_item GROUP BY spk_id, due;

-- ---------- 5. Ringkasan dashboard (satu baris) ----------
CREATE OR REPLACE VIEW public.v_dash_ringkas WITH (security_invoker = true) AS
SELECT
  (SELECT count(*)::int FROM public.v_dash_bahan_baku WHERE status IN ('Habis', 'Kritis', 'Perlu order')) AS bahan_baku_kritis,
  (SELECT count(*)::int FROM public.v_dash_bahan_baku WHERE status = 'Habis')                               AS bahan_baku_habis,
  (SELECT count(*)::int FROM public.v_spk_status WHERE status_hitung NOT IN ('Selesai', 'Draft', 'Batal')) AS spk_berjalan,
  (SELECT count(*)::int FROM public.v_spk_status WHERE status_hitung = 'Terlambat')                        AS spk_terlambat,
  (SELECT COALESCE(SUM(sisa), 0) FROM public.v_vendor_item WHERE sisa > 0)                                  AS di_vendor_qty,
  (SELECT count(DISTINCT vendor_id)::int FROM public.v_vendor_item WHERE sisa > 0)                          AS di_vendor_job,
  (SELECT COALESCE(MAX(public.hari_ini() - tgl), 0)::int FROM public.v_vendor_item WHERE sisa > 0)          AS di_vendor_tertua_hari,
  (SELECT count(*)::int FROM public.kirim WHERE status <> 'Batal' AND date_trunc('month', tgl) = date_trunc('month', public.hari_ini())) AS kirim_bulan_ini,
  (SELECT COALESCE(SUM(public._num(ki -> 'q') * public._num(ki -> 'w')), 0)
     FROM public.kirim k CROSS JOIN LATERAL jsonb_array_elements(k.items) ki
    WHERE k.status <> 'Batal' AND date_trunc('month', k.tgl) = date_trunc('month', public.hari_ini()))     AS kirim_bulan_ini_kg,
  (SELECT count(*)::int FROM public.kirim WHERE status = 'Dalam Perjalanan')                               AS kirim_dalam_perjalanan,
  (SELECT count(*)::int FROM public.v_spk_otd WHERE terkirim_penuh AND tgl_penuh >= public.hari_ini() - 90) AS otd_terkirim_90,
  (SELECT count(*)::int FROM public.v_spk_otd WHERE tepat_waktu AND tgl_penuh >= public.hari_ini() - 90)    AS otd_tepat_90,
  (SELECT CASE WHEN count(*) FILTER (WHERE terkirim_penuh AND tgl_penuh >= public.hari_ini() - 90 AND tepat_waktu IS NOT NULL) > 0
               THEN round(100.0 * count(*) FILTER (WHERE tepat_waktu AND tgl_penuh >= public.hari_ini() - 90)
                          / count(*) FILTER (WHERE terkirim_penuh AND tgl_penuh >= public.hari_ini() - 90 AND tepat_waktu IS NOT NULL), 1) END
     FROM public.v_spk_otd)                                                                                  AS otd_persen_90,
  (SELECT COALESCE(jsonb_object_agg(posisi, n), '{}'::jsonb)
     FROM (SELECT p.posisi::text AS posisi, count(*) AS n
             FROM public.v_spk_item_posisi p JOIN public.spk s ON s.id = p.spk_id
            WHERE s.status NOT IN ('Draft', 'Batal') GROUP BY p.posisi) g)                                  AS item_per_posisi;

-- ---------- 6. Indeks pendukung (ringan, hanya pada baris aktif) ----------
CREATE INDEX IF NOT EXISTS idx_kirim_spk_aktif ON public.kirim (spk_id) WHERE status <> 'Batal';
CREATE INDEX IF NOT EXISTS idx_vendor_spk_aktif ON public.vendor (spk_id) WHERE status <> 'Batal';

-- ---------- 7. Realtime: tabel yang menggerakkan progres dan badge posisi ----------
DO $$
DECLARE
  t text;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    FOREACH t IN ARRAY ARRAY['spk', 'vendor', 'kirim', 'spk_materials', 'produksi_log'] LOOP
      IF to_regclass('public.' || t) IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END LOOP;
  END IF;
END
$$;

GRANT SELECT ON public.v_item_produksi, public.v_spk_status, public.v_dash_bahan_baku, public.v_spk_otd, public.v_dash_ringkas TO authenticated;
REVOKE EXECUTE ON FUNCTION public.hari_ini() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.hari_ini() TO authenticated;

-- ---------- Uji ----------
--   Otomatis di Postgres lokal: node tests/sql/cadangan.sql.test.mjs (bagian W-xx). Belum teruji: kinerja pada data besar (ukur dengan
--   EXPLAIN ANALYZE di project dev), RLS peran Supabase asli, dan Realtime sungguhan.
--
-- Batalkan (rollback):
--   DROP VIEW IF EXISTS public.v_dash_ringkas, public.v_spk_otd, public.v_dash_bahan_baku, public.v_spk_status, public.v_item_produksi;
--   DROP INDEX IF EXISTS public.idx_kirim_spk_aktif, public.idx_vendor_spk_aktif;  DROP FUNCTION IF EXISTS public.hari_ini();
--   (Realtime: ALTER PUBLICATION supabase_realtime DROP TABLE public.<tabel>; hanya untuk tabel yang ditambahkan berkas ini.)
