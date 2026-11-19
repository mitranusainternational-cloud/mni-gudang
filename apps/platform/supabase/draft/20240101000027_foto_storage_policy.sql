-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-19, menunggu persetujuan pemilik)
-- MNI Gudang - Kebijakan Storage untuk foto Bongkar Muat dan Maintenance (menggantikan kebijakan di draf 23)
-- ============================================================
-- Hanya MENAMBAH: bucket privat dan kebijakan objek. Tidak menyentuh tabel data dan tidak mengubah data.
-- TIDAK DIUJI otomatis (PGlite tidak punya skema `storage`); uji dengan unggah dan unduh nyata di staging.
--
-- Berkas disimpan dengan jalur  <awalan>/<id-foto>.jpg  :
--   bongkar/...  -> hak modul bongkar-muat  (baca = can_view, tulis = can_mod)
--   mtc/...      -> hak modul maintenance   (baca = can_view, tulis = can_mod)
-- Admin lolos lewat can_view/can_mod. Tidak ada kebijakan DELETE: berkas hanya dihapus pemilik lewat dasbor.
-- Aplikasi tetap memakai mode foto di dalam database selama super admin belum mengaktifkan mode Storage,
-- jadi menerapkan draf ini tidak mengubah perilaku apa pun sampai saat itu.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bongkar-foto', 'bongkar-foto', false, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Kebijakan lama dari draf 23 (jika sempat dipasang) diganti karena tidak membedakan Maintenance.
DROP POLICY IF EXISTS "bongkar_foto_read" ON storage.objects;
DROP POLICY IF EXISTS "bongkar_foto_insert" ON storage.objects;
DROP POLICY IF EXISTS "bongkar_foto_update" ON storage.objects;

DROP POLICY IF EXISTS "foto_read" ON storage.objects;
CREATE POLICY "foto_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'bongkar-foto' AND (
    ((storage.foldername(name))[1] = 'bongkar' AND public.can_view('bongkar-muat'))
    OR ((storage.foldername(name))[1] = 'mtc' AND public.can_view('maintenance'))));

DROP POLICY IF EXISTS "foto_insert" ON storage.objects;
CREATE POLICY "foto_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'bongkar-foto' AND (
    ((storage.foldername(name))[1] = 'bongkar' AND public.can_mod('bongkar-muat'))
    OR ((storage.foldername(name))[1] = 'mtc' AND public.can_mod('maintenance'))));
