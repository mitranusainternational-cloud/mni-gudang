-- ============================================================
-- DRAF (BELUM DITERAPKAN di Supabase mana pun; butuh persetujuan pemilik)
-- MNI Gudang - Modul Maintenance
-- ============================================================
-- Lihat documentation/SKEMA_MAINTENANCE.md.
-- Satu tabel `mtc` untuk dua jenis dokumen (kind 'catat' dan 'rutin'). Sparepart yang diganti memakai tabel `mutasi`
-- (gudang 'sp', jenis 'keluar', tujuan 'mesin') sehingga tidak ada tabel stok baru.
-- Pakai ulang aman (IF NOT EXISTS). Tidak ada kebijakan DELETE (konsisten dengan migration 13).

CREATE TABLE IF NOT EXISTS public.mtc (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind        TEXT NOT NULL DEFAULT 'catat' CHECK (kind IN ('catat', 'rutin')),
  no          TEXT,                                   -- MTC/2026/11/001 (catat)
  tgl         DATE,
  mesin       TEXT,
  wc          TEXT,
  jenis       TEXT,                                   -- Preventif, Korektif, Inspeksi, Kalibrasi
  status      TEXT,                                   -- Selesai, Dikerjakan, Menunggu sparepart, Batal
  downtime    NUMERIC NOT NULL DEFAULT 0,             -- menit
  teknisi     TEXT,
  aktif       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  TEXT,
  updated_by  TEXT,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb      -- masalah, tindakan, mulai, selesai, biaya, parts[], rutin, tugas, interval, ket
);
CREATE INDEX IF NOT EXISTS idx_mtc_mesin_tgl ON public.mtc (mesin, tgl DESC);
CREATE INDEX IF NOT EXISTS idx_mtc_kind ON public.mtc (kind);
CREATE UNIQUE INDEX IF NOT EXISTS uq_mtc_no ON public.mtc (no) WHERE no IS NOT NULL AND no <> '';

ALTER TABLE public.mtc ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mtc' AND policyname='mtc_read') THEN
    CREATE POLICY mtc_read ON public.mtc FOR SELECT TO authenticated USING (public.can_view('maintenance'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mtc' AND policyname='mtc_ins_v2') THEN
    CREATE POLICY mtc_ins_v2 ON public.mtc FOR INSERT TO authenticated WITH CHECK (public.can_mod('maintenance'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='mtc' AND policyname='mtc_upd_v2') THEN
    CREATE POLICY mtc_upd_v2 ON public.mtc FOR UPDATE TO authenticated
      USING (public.can_mod('maintenance')) WITH CHECK (public.can_mod('maintenance'));
  END IF;
END
$$;

DROP TRIGGER IF EXISTS trg_audit ON public.mtc;
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON public.mtc
  FOR EACH ROW EXECUTE FUNCTION public.audit_row();
DROP TRIGGER IF EXISTS trigger_mtc_updated_at ON public.mtc;
CREATE TRIGGER trigger_mtc_updated_at BEFORE UPDATE ON public.mtc
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- sinkron antar pengguna: tambahkan 'mtc' ke daftar tabel fungsi public.table_stamps() (migration 12), sama seperti 'sp'.

-- hak modul bawaan: peran baru Maintenance mengubah; Produksi, Gudang, PPIC, Logistik, dan Viewer melihat
-- (sesuaikan dengan bentuk tabel public.role_modules yang berlaku di production sebelum diterapkan)
-- INSERT INTO public.role_modules (role, modul, level) VALUES
--   ('maintenance','maintenance','ubah'), ('maintenance','sparepart','ubah'),
--   ('produksi','maintenance','lihat'), ('gbb','maintenance','lihat'), ('ppic','maintenance','lihat'), ('gbj','maintenance','lihat'), ('logistik','maintenance','lihat'), ('viewer','maintenance','lihat'),
--   -- peran baru: gudang (semua gudang) dan logistik yang memegang vendor
--   ('gudang','bahan-baku','ubah'), ('gudang','barang-jadi','ubah'), ('gudang','sparepart','ubah'),
--   ('logistik','vendor','ubah')
-- ON CONFLICT DO NOTHING;
