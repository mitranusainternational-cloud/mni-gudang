-- Rollback draf 27: cabut kebijakan foto. Bucket dan berkas TIDAK dihapus (hapus lewat dasbor bila memang perlu).
-- Foto yang sudah di Storage tidak bisa dibaca aplikasi setelah ini; matikan mode Storage dan pindahkan kembali dahulu bila perlu.
DROP POLICY IF EXISTS "foto_read" ON storage.objects;
DROP POLICY IF EXISTS "foto_insert" ON storage.objects;
