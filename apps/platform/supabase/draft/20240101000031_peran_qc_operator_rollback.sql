-- Rollback: kembalikan kebijakan insert produksi_log (hanya hak spk). Baris role_modules tambahan tidak dihapus otomatis.
DROP POLICY IF EXISTS "produksi_log_ins" ON public.produksi_log;
CREATE POLICY "produksi_log_ins" ON public.produksi_log FOR INSERT TO authenticated WITH CHECK (public.can_mod('spk') AND oleh = (SELECT auth.email()));
