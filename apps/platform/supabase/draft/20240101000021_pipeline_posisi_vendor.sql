-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-07, langkah 3 cetak biru database)
-- MNI Gudang - Pipeline posisi barang, pelacakan kirim dan kembali vendor finishing, SPK tidak boleh Selesai bila barang masih di vendor
-- ============================================================
-- Disimpan di folder `draft`. URUTAN: terapkan SETELAH draf 19 (kolom peruntukan) dan 20; draf 14 (produksi_log) opsional:
-- bila ada saat berkas ini dijalankan, catatan produksi ikut menentukan posisi 'Produksi'; jalankan ulang berkas ini sesudah
-- draf 14 dipasang bila urutannya terbalik (aman diulang).
--
-- Keputusan rancangan:
--   * TIDAK membuat tabel `vendor_finishing_jobs`: tabel `vendor` yang sudah ada adalah pelacak job finishing (satu dokumen kirim ke
--     vendor berisi items[{d, q, kembali, reject}]). Dua tabel untuk hal yang sama pasti selisih. Angka "kembali/kirim" (mis. 0/231)
--     dihitung oleh view dari tabel itu.
--   * Posisi barang TIDAK disimpan di SPK (akan basi): diturunkan oleh view dari vendor, kirim, mutasi barang jadi, dan catatan
--     produksi. Ini pendekatan per item: Gudang Bahan Baku, Produksi, Di Vendor Finishing, Gudang Barang Jadi, Terkirim ke Customer.
--     Posisi per LANGKAH mesin (Shearing, Punching, Bending) tetap dihitung mesin rute di aplikasi karena rute belum ada di database.
--   * Penjaga di database: jumlah kembali + reject tidak boleh melebihi jumlah kirim pada satu item surat jalan vendor, dan SPK tidak
--     bisa menjadi 'Selesai' bila masih ada barang di vendor atau bila belum Terbit.
--   * Item dicocokkan lewat deskripsi (`d`), sama dengan cara aplikasi mencocokkan vendor dan kirim ke item SPK.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typname = 'posisi_barang') THEN
    CREATE TYPE public.posisi_barang AS ENUM ('Gudang Bahan Baku', 'Produksi', 'Di Vendor Finishing', 'Gudang Barang Jadi', 'Terkirim ke Customer');
  END IF;
END
$$;

-- bilangan aman dari JSON (angka atau teks angka; selain itu 0)
CREATE OR REPLACE FUNCTION public._num(v jsonb) RETURNS numeric
LANGUAGE sql IMMUTABLE SET search_path = public
AS $$
  SELECT CASE
    WHEN v IS NULL THEN 0
    WHEN jsonb_typeof(v) = 'number' THEN (v #>> '{}')::numeric
    WHEN jsonb_typeof(v) = 'string' AND (v #>> '{}') ~ '^-?[0-9]+(\.[0-9]+)?$' THEN (v #>> '{}')::numeric
    ELSE 0 END;
$$;

-- ---------- 1. Penjaga isi surat jalan vendor ----------
CREATE OR REPLACE FUNCTION public.vendor_jaga_item() RETURNS trigger
LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE
  it jsonb;
  q numeric; k numeric; x numeric;
BEGIN
  IF NEW.status = 'Batal' OR jsonb_typeof(NEW.items) <> 'array' THEN
    RETURN NEW;
  END IF;
  FOR it IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
    q := public._num(it -> 'q'); k := public._num(it -> 'kembali'); x := public._num(it -> 'reject');
    IF q < 0 OR k < 0 OR x < 0 THEN
      RAISE EXCEPTION 'Surat jalan vendor %: jumlah tidak boleh negatif (%)', COALESCE(NEW.no_sj, NEW.id::text), COALESCE(it ->> 'd', '?') USING ERRCODE = 'check_violation';
    END IF;
    IF k + x > q THEN
      RAISE EXCEPTION 'Surat jalan vendor %: "%" kembali % + reject % melebihi yang dikirim %.',
        COALESCE(NEW.no_sj, NEW.id::text), COALESCE(it ->> 'd', '?'), trim_scale(k), trim_scale(x), trim_scale(q) USING ERRCODE = 'check_violation';
    END IF;
  END LOOP;
  RETURN NEW;
END
$$;

-- Gerbang data lama: penjaga ini menolak UPDATE yang menyentuh baris yang melanggar, jadi berhenti dulu bila ada. Rapikan lalu ulangi.
DO $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n
    FROM public.vendor v CROSS JOIN LATERAL jsonb_array_elements(v.items) i
   WHERE v.status <> 'Batal' AND jsonb_typeof(v.items) = 'array'
     AND (public._num(i -> 'kembali') + public._num(i -> 'reject') > public._num(i -> 'q')
          OR public._num(i -> 'q') < 0 OR public._num(i -> 'kembali') < 0 OR public._num(i -> 'reject') < 0);
  IF n > 0 THEN
    RAISE EXCEPTION 'Draf 21 dihentikan: % item surat jalan vendor lama punya kembali + reject melebihi kirim atau angka negatif. Rapikan dulu (SELECT no_sj, items FROM vendor).', n;
  END IF;
END
$$;

DROP TRIGGER IF EXISTS trg_vendor_jaga_item ON public.vendor;
CREATE TRIGGER trg_vendor_jaga_item BEFORE INSERT OR UPDATE OF items, status ON public.vendor
  FOR EACH ROW EXECUTE FUNCTION public.vendor_jaga_item();

-- ---------- 2. SPK Selesai hanya dari Terbit dan tanpa barang tersisa di vendor ----------
CREATE OR REPLACE FUNCTION public.spk_jaga_selesai() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_kirim numeric;
  v_sisa  numeric;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status OR NEW.status <> 'Selesai' THEN
    RETURN NEW;
  END IF;
  IF OLD.status <> 'Terbit' THEN
    RAISE EXCEPTION 'SPK % tidak bisa Selesai dari status %; hanya SPK Terbit yang bisa diselesaikan.', OLD.no, OLD.status USING ERRCODE = 'check_violation';
  END IF;
  SELECT COALESCE(SUM(public._num(i -> 'q')), 0),
         COALESCE(SUM(GREATEST(public._num(i -> 'q') - public._num(i -> 'kembali') - public._num(i -> 'reject'), 0)), 0)
    INTO v_kirim, v_sisa
    FROM public.vendor v CROSS JOIN LATERAL jsonb_array_elements(v.items) i
   WHERE v.spk_id = NEW.id AND v.status <> 'Batal';
  IF v_sisa > 0 THEN
    RAISE EXCEPTION 'SPK % belum bisa Selesai: % dari % barang yang dikirim ke vendor belum kembali.', OLD.no, trim_scale(v_sisa), trim_scale(v_kirim) USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_spk_jaga_selesai ON public.spk;
CREATE TRIGGER trg_spk_jaga_selesai BEFORE UPDATE OF status ON public.spk
  FOR EACH ROW EXECUTE FUNCTION public.spk_jaga_selesai();

-- ---------- 3. View: vendor finishing per item dan per SPK (angka kembali/kirim) ----------
CREATE OR REPLACE VIEW public.v_vendor_item WITH (security_invoker = true) AS
SELECT v.spk_id, v.id AS vendor_id, v.vendor, v.proses, v.tgl, v.no_sj,
       i ->> 'd'                                  AS item_d,
       public._num(i -> 'q')                      AS q_kirim,
       public._num(i -> 'kembali')                AS q_kembali,
       public._num(i -> 'reject')                 AS q_reject,
       GREATEST(public._num(i -> 'q') - public._num(i -> 'kembali') - public._num(i -> 'reject'), 0) AS sisa
  FROM public.vendor v CROSS JOIN LATERAL jsonb_array_elements(v.items) i
 WHERE v.status <> 'Batal';

CREATE OR REPLACE VIEW public.v_spk_vendor WITH (security_invoker = true) AS
SELECT spk_id,
       count(DISTINCT vendor_id)::int AS jumlah_job,
       SUM(q_kirim)    AS kirim,
       SUM(q_kembali)  AS kembali,
       SUM(q_reject)   AS reject,
       SUM(sisa)       AS sisa,
       SUM(q_kembali)::text || '/' || SUM(q_kirim)::text AS kembali_dari_kirim,
       (SUM(sisa) = 0) AS vendor_selesai
  FROM public.v_vendor_item
 GROUP BY spk_id;

-- ---------- 4. View: posisi barang per item SPK ----------
-- Dibuat lewat SQL dinamis karena draf 14 (produksi_log) mungkin belum terpasang.
DO $$
DECLARE
  v_prod text;
BEGIN
  IF to_regclass('public.produksi_log') IS NOT NULL THEN
    v_prod := 'EXISTS (SELECT 1 FROM public.produksi_log p WHERE p.spk_id = s.id AND p.item_idx = (e.ord - 1)::int AND p.jenis = ''hasil'')';
  ELSE
    v_prod := 'false';
  END IF;
  EXECUTE format($v$
    CREATE OR REPLACE VIEW public.v_spk_item_posisi WITH (security_invoker = true) AS
    SELECT s.id AS spk_id, s.no, s.peruntukan, (e.ord - 1)::int AS item_idx, e.it ->> 'd' AS item_d,
           public._num(e.it -> 'q')           AS q,
           COALESCE(vi.kirim, 0)              AS vendor_kirim,
           COALESCE(vi.kembali, 0)            AS vendor_kembali,
           COALESCE(vi.reject, 0)             AS vendor_reject,
           COALESCE(vi.sisa, 0)               AS vendor_sisa,
           COALESCE(kc.q, 0)                  AS kirim_customer,
           COALESCE(fg.q, 0)                  AS fg_masuk,
           (public._num(e.it -> 'prod') > 0 OR %1$s) AS ada_produksi,
           (CASE
              WHEN s.peruntukan = 'stok_buffer' AND public._num(e.it -> 'q') > 0 AND COALESCE(fg.q, 0) >= public._num(e.it -> 'q') THEN 'Gudang Barang Jadi'
              WHEN s.peruntukan = 'customer'    AND public._num(e.it -> 'q') > 0 AND COALESCE(kc.q, 0) >= public._num(e.it -> 'q') THEN 'Terkirim ke Customer'
              WHEN COALESCE(vi.sisa, 0) > 0 THEN 'Di Vendor Finishing'
              WHEN public._num(e.it -> 'prod') > 0 OR %1$s THEN 'Produksi'
              ELSE 'Gudang Bahan Baku'
            END)::public.posisi_barang AS posisi
      FROM public.spk s
      CROSS JOIN LATERAL jsonb_array_elements(s.items) WITH ORDINALITY AS e(it, ord)
      LEFT JOIN LATERAL (
        SELECT SUM(x.q_kirim) AS kirim, SUM(x.q_kembali) AS kembali, SUM(x.q_reject) AS reject, SUM(x.sisa) AS sisa
          FROM public.v_vendor_item x WHERE x.spk_id = s.id AND x.item_d = e.it ->> 'd') vi ON true
      LEFT JOIN LATERAL (
        SELECT SUM(public._num(ki -> 'q')) AS q
          FROM public.kirim k CROSS JOIN LATERAL jsonb_array_elements(k.items) ki
         WHERE k.spk_id = s.id AND k.status <> 'Batal' AND ki ->> 'd' = e.it ->> 'd') kc ON true
      LEFT JOIN LATERAL (
        SELECT SUM(m.delta) AS q FROM public.mutasi m
         WHERE m.gudang = 'fg' AND m.jenis = 'masuk' AND (e.it ->> 'fg') IS NOT NULL AND m.item_id::text = e.it ->> 'fg'
           AND (m.data ->> 'spk') = s.id::text) fg ON true
     WHERE s.status <> 'Draft'
  $v$, v_prod);
END
$$;

GRANT SELECT ON public.v_vendor_item, public.v_spk_vendor, public.v_spk_item_posisi TO authenticated;
REVOKE EXECUTE ON FUNCTION public.vendor_jaga_item(), public.spk_jaga_selesai() FROM PUBLIC, anon, authenticated;

-- ---------- Uji ----------
--   Otomatis di Postgres lokal: node tests/sql/cadangan.sql.test.mjs (bagian V-xx). Konkurensi sungguhan dan RLS peran Supabase
--   tetap perlu diuji di project dev atau branch sebelum rilis.
--
-- Batalkan (rollback):
--   DROP VIEW IF EXISTS public.v_spk_item_posisi, public.v_spk_vendor, public.v_vendor_item;
--   DROP TRIGGER IF EXISTS trg_spk_jaga_selesai ON public.spk;  DROP FUNCTION IF EXISTS public.spk_jaga_selesai();
--   DROP TRIGGER IF EXISTS trg_vendor_jaga_item ON public.vendor;  DROP FUNCTION IF EXISTS public.vendor_jaga_item();
--   DROP FUNCTION IF EXISTS public._num(jsonb);  DROP TYPE IF EXISTS public.posisi_barang;
