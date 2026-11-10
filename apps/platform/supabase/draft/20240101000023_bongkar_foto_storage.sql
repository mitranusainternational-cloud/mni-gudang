-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-07, menunggu persetujuan pemilik)
-- MNI Gudang - Penyimpanan foto bukti bongkar muat (T-217)
-- ============================================================
-- Disimpan di folder `draft`, bukan `migrations`. TIDAK DIUJI di Supabase (PGlite tidak punya skema `storage`).
--
-- Latar belakang:
--   Di aplikasi sekarang foto bukti disimpan LANGSUNG di dokumen bongkar (`bongkar.data.foto[].data` = data URL JPEG
--   terkompres, sisi terpanjang 1280 px, sekitar 100-250 KB per foto) dan ceklis di `bongkar.data.ceklis`. Itu cukup untuk
--   mock dan pemakaian kecil, tetapi di Supabase setiap foto ikut terkirim dalam setiap pembacaan dan notifikasi Realtime
--   tabel `bongkar`. Untuk production, foto dipindah ke Supabase Storage dan dokumen hanya menyimpan jalurnya
--   (`foto[].path`), sementara aplikasi memuat gambar lewat URL bertanda tangan berumur pendek.
--
-- Isi:
--   1. Bucket PRIVAT `bongkar-foto` (batas 1 MB per berkas, hanya JPEG/PNG/WebP).
--   2. Kebijakan objek: baca oleh pengguna yang boleh melihat modul bongkar-muat; tulis oleh pengguna yang boleh mengubahnya.
--      Tidak ada kebijakan DELETE untuk umum; pembersihan dilakukan pemilik lewat dasbor bila perlu.
--
-- Sisi aplikasi yang masih harus dikerjakan sebelum draf ini berguna (belum ada):
--   - `FOTO.mode = 'storage'`: unggah ke bucket, simpan `path`, ambil `createSignedUrl` saat tampil dan saat cetak.
--   - Migrasi foto inline lama (bila ada) ke bucket.
-- Fungsi `public.can_mod(text)` dan `public.can_view(text)` sudah ada (migration 06 dan 11).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bongkar-foto', 'bongkar-foto', false, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "bongkar_foto_read" ON storage.objects;
CREATE POLICY "bongkar_foto_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'bongkar-foto' AND public.can_view('bongkar-muat'));

DROP POLICY IF EXISTS "bongkar_foto_insert" ON storage.objects;
CREATE POLICY "bongkar_foto_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'bongkar-foto' AND public.can_mod('bongkar-muat'));

DROP POLICY IF EXISTS "bongkar_foto_update" ON storage.objects;
CREATE POLICY "bongkar_foto_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'bongkar-foto' AND public.can_mod('bongkar-muat'))
  WITH CHECK (bucket_id = 'bongkar-foto' AND public.can_mod('bongkar-muat'));
