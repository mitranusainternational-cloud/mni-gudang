-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-19, menunggu persetujuan pemilik)
-- MNI Gudang - table_stamps() lebih ringan: baca kolom tanggal langsung, bukan mengubah tiap baris menjadi JSON
-- ============================================================
-- Disimpan di folder `draft`. Hanya MENGGANTI isi satu fungsi (CREATE OR REPLACE). Tidak menyentuh data, tabel, kebijakan, atau hak akses
-- (CREATE OR REPLACE mempertahankan GRANT yang ada).
--
-- Masalah (diukur di production 2026-11-19, baca saja):
--   * Fungsi lama memanggil to_jsonb(x) untuk SETIAP baris dari 21 tabel hanya untuk mengambil tanggal terbaru. Baris `bongkar` memuat foto
--     (data.foto, sekitar 6 MB untuk 76 baris), jadi seluruh foto ikut dibaca dan diubah ke JSON tiap panggilan.
--   * Dipanggil tiap 4 detik per pengguna: 91.003 panggilan, rata-rata 128 ms, total sekitar 3,2 jam waktu database.
--   * Satu panggilan terukur 62 ms (EXPLAIN ANALYZE, saat tidak sibuk).
--
-- Perubahan:
--   * Kolom tanggal dipilih sekali per tabel dari katalog (updated_at, lalu created_at, lalu at), lalu dibaca langsung: max(COALESCE(...)).
--     Kolom besar (data, items) tidak pernah dibaca.
--   * Daftar tabel dan bentuk sidik tetap "jumlah|waktu terbaru". Format waktu berubah dari teks JSON ke teks timestamp, jadi SETIAP klien
--     memuat ulang tabelnya satu kali setelah fungsi ini dipasang; sesudah itu normal.
--   * Tetap SECURITY INVOKER: dihitung dengan hak pemanggil (RLS berlaku), sama seperti sekarang.
--   * Tabel yang belum ada di database (mis. mtc sebelum migration 24) dilewati, bukan menggagalkan seluruh panggilan.
--
-- Uji: tests/sql/table-stamps.sql.test.mjs (PGlite). Verifikasi di production sesudah dipasang: bandingkan jumlah baris tiap tabel di sidik
-- dengan count(*) langsung, dan ukur ulang dengan EXPLAIN ANALYZE select public.table_stamps().
--
-- Batalkan: jalankan 20240101000026_table_stamps_cepat_rollback.sql (mengembalikan definisi lama persis).

CREATE OR REPLACE FUNCTION public.table_stamps()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  t   text;
  cols text;
  v   text;
  res jsonb := '{}'::jsonb;
BEGIN
  FOREACH t IN ARRAY ARRAY['rm','fg','mutasi','spk','vendor','kirim','bongkar','master','mvendor','mcustomer',
                           'msupplier','marmada','rmhist','pr','opname','muser','log','mwc','produksi_log','sp','mtc'] LOOP
    IF to_regclass('public.' || quote_ident(t)) IS NULL THEN
      CONTINUE;
    END IF;
    -- kolom tanggal yang ada, urut prioritas updated_at > created_at > at
    SELECT string_agg(quote_ident(c), ',' ORDER BY ord)
      INTO cols
      FROM unnest(ARRAY['updated_at','created_at','at']) WITH ORDINALITY AS k(c, ord)
     WHERE EXISTS (SELECT 1 FROM pg_attribute a
                    WHERE a.attrelid = to_regclass('public.' || quote_ident(t))
                      AND a.attname = k.c AND a.attnum > 0 AND NOT a.attisdropped);
    IF cols IS NULL THEN
      EXECUTE format('SELECT count(*)::text || ''|'' FROM public.%I', t) INTO v;
    ELSE
      EXECUTE format('SELECT count(*)::text || ''|'' || COALESCE(max(COALESCE(%s))::text, '''') FROM public.%I', cols, t) INTO v;
    END IF;
    res := res || jsonb_build_object(t, v);
  END LOOP;
  RETURN res;
END;
$function$;
