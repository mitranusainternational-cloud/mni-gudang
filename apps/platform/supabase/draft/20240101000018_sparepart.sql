-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-06, menunggu persetujuan pemilik)
-- MNI Gudang - Gudang Sparepart (modul baru)
-- ============================================================
-- Disimpan di folder `draft`, bukan `migrations`, agar tidak ikut terpasang tanpa persetujuan pemilik.
--
-- Isi:
--   1. Tabel `sp` (daftar sparepart). Pergerakan stok memakai tabel `mutasi` yang sudah ada dengan gudang = 'sp'
--      (mutasi.gudang tidak punya batasan CHECK dan item_id tanpa FK, sudah diperiksa di production 2026-11-06).
--   2. RLS: baca butuh hak lihat modul 'sparepart', tulis butuh hak ubah. Tidak ada kebijakan DELETE (konsisten dengan
--      migration 13: data transaksi tidak dihapus permanen; item dinonaktifkan lewat kolom aktif).
--   3. Pemicu audit dan stempel, sama seperti tabel lain.
--   4. Kebijakan `mutasi` diperluas agar gudang 'sp' mengikuti modul 'sparepart' (sebelumnya semua selain 'rm' dianggap
--      'barang-jadi').
--   5. role_modules: peran gbb (Gudang Bahan Baku) mendapat hak ubah modul sparepart.
--
-- Pakai ulang aman (IF NOT EXISTS, CREATE OR REPLACE, ALTER POLICY). Data awal tidak dimasukkan di sini: daftar dan stok
-- sparepart diimpor dari Excel lewat tombol "Impor Excel" di aplikasi agar tidak ada data operasional di repo publik.

CREATE TABLE IF NOT EXISTS public.sp (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode          TEXT,                                   -- nomor barang di tabel stok Excel (mis. 41)
  item          TEXT NOT NULL,                          -- nama barang
  satuan        TEXT,
  lokasi        TEXT,
  min           NUMERIC NOT NULL DEFAULT 0,             -- stok minimum
  buffer        NUMERIC NOT NULL DEFAULT 0,             -- target stok yang dijaga (usulan isi ulang sampai buffer)
  stok_awal     NUMERIC NOT NULL DEFAULT 0,
  tgl_stok_awal DATE,
  aktif         BOOLEAN NOT NULL DEFAULT true,
  ket           TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by    TEXT,
  updated_by    TEXT,
  data          JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_sp_item ON public.sp (lower(item));
CREATE UNIQUE INDEX IF NOT EXISTS uq_sp_kode ON public.sp (kode) WHERE kode IS NOT NULL AND kode <> '';

ALTER TABLE public.sp ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sp' AND policyname='sp_read') THEN
    CREATE POLICY sp_read ON public.sp FOR SELECT TO authenticated USING (public.can_view('sparepart'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sp' AND policyname='sp_ins_v2') THEN
    CREATE POLICY sp_ins_v2 ON public.sp FOR INSERT TO authenticated WITH CHECK (public.can_mod('sparepart'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='sp' AND policyname='sp_upd_v2') THEN
    CREATE POLICY sp_upd_v2 ON public.sp FOR UPDATE TO authenticated
      USING (public.can_mod('sparepart')) WITH CHECK (public.can_mod('sparepart'));
  END IF;
END
$$;

-- pemicu audit (fungsi public.audit_row dari migration 13) dan stempel waktu/pengguna (migration 12)
DROP TRIGGER IF EXISTS trg_audit ON public.sp;
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON public.sp
  FOR EACH ROW EXECUTE FUNCTION public.audit_row();

-- pemicu stempel updated_at, sama dengan tabel rm/fg/pr di production (diperiksa 2026-11-06: trigger_<tabel>_updated_at
-- memakai fungsi public.update_updated_at)
DROP TRIGGER IF EXISTS trigger_sp_updated_at ON public.sp;
CREATE TRIGGER trigger_sp_updated_at BEFORE UPDATE ON public.sp
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- mutasi: gudang 'sp' mengikuti modul 'sparepart'
ALTER POLICY mutasi_read ON public.mutasi
  USING (public.can_view(CASE WHEN gudang = 'rm' THEN 'bahan-baku' WHEN gudang = 'sp' THEN 'sparepart' ELSE 'barang-jadi' END));
ALTER POLICY mutasi_ins_v2 ON public.mutasi
  WITH CHECK (public.can_mod(CASE WHEN gudang = 'rm' THEN 'bahan-baku' WHEN gudang = 'sp' THEN 'sparepart' ELSE 'barang-jadi' END));
ALTER POLICY mutasi_upd_v2 ON public.mutasi
  USING (public.can_mod(CASE WHEN gudang = 'rm' THEN 'bahan-baku' WHEN gudang = 'sp' THEN 'sparepart' ELSE 'barang-jadi' END))
  WITH CHECK (public.can_mod(CASE WHEN gudang = 'rm' THEN 'bahan-baku' WHEN gudang = 'sp' THEN 'sparepart' ELSE 'barang-jadi' END));

-- PR (permintaan pembelian) dipakai bersama bahan baku dan sparepart (data.gudang = 'sp' membedakan). Pemegang hak modul
-- sparepart juga boleh melihat, membuat, dan mengubah PR. Pemegang hak bahan baku tidak berkurang.
ALTER POLICY pr_read   ON public.pr USING (public.can_view('bahan-baku') OR public.can_view('sparepart'));
ALTER POLICY pr_ins_v2 ON public.pr WITH CHECK (public.can_mod('bahan-baku') OR public.can_mod('sparepart'));
ALTER POLICY pr_upd_v2 ON public.pr USING (public.can_mod('bahan-baku') OR public.can_mod('sparepart')) WITH CHECK (public.can_mod('bahan-baku') OR public.can_mod('sparepart'));

-- peran Gudang Bahan Baku mengelola sparepart (pemilik dapat menyesuaikan per pengguna di Pengguna & Akses)
INSERT INTO public.role_modules (role, module) VALUES ('gbb', 'sparepart') ON CONFLICT DO NOTHING;

-- Sinkron antar pengguna: ikutkan sp dalam penanda perubahan (table_stamps). Daftar ini memuat produksi_log (migration 14)
-- sehingga aman diterapkan setelah migration 14.
CREATE OR REPLACE FUNCTION public.table_stamps()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  t TEXT;
  v TEXT;
  res JSONB := '{}'::jsonb;
BEGIN
  FOREACH t IN ARRAY ARRAY['rm','fg','mutasi','spk','vendor','kirim','bongkar','master','mvendor','mcustomer',
                           'msupplier','marmada','rmhist','pr','opname','muser','log','mwc','produksi_log','sp'] LOOP
    EXECUTE format(
      'SELECT count(*)::text || ''|'' || COALESCE(max(COALESCE(to_jsonb(x) ->> ''updated_at'', to_jsonb(x) ->> ''created_at'', to_jsonb(x) ->> ''at'')), '''') FROM public.%I x', t)
      INTO v;
    res := res || jsonb_build_object(t, v);
  END LOOP;
  RETURN res;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.table_stamps() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.table_stamps() TO authenticated;

-- Batalkan (rollback), hanya bila belum ada data:
--   DROP TABLE IF EXISTS public.sp;
--   (kembalikan tiga ALTER POLICY mutasi ke ekspresi tanpa cabang 'sp'; hapus baris role_modules gbb/sparepart)
