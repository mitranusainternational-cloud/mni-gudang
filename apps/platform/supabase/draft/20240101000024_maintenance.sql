-- ============================================================
-- SIAP DITERAPKAN (BELUM DITERAPKAN di Supabase mana pun; menunggu perintah pemilik untuk menerapkan)
-- MNI Gudang - Modul Maintenance
-- ============================================================
-- Lihat documentation/SKEMA_MAINTENANCE.md dan documentation/RENCANA_MIGRATION_MAINTENANCE_DAN_HAK.md.
-- Hanya MENAMBAH: satu tabel baru, kebijakan, pemicu, baris hak peran, dan fungsi table_stamps() diperluas (CREATE OR REPLACE).
-- Aman diputar ulang. Tidak mengubah atau menghapus data yang ada. Pembatalan: 20240101000024_maintenance_rollback.sql.

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
  data        JSONB NOT NULL DEFAULT '{}'::jsonb      -- masalah, tindakan, mulai, selesai, biaya, parts[], foto[], rutin, tugas, interval, ket
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
-- Tidak ada kebijakan DELETE (konsisten dengan migration 13: data transaksi tidak dihapus permanen; catatan dibatalkan lewat status Batal).

DROP TRIGGER IF EXISTS trg_audit ON public.mtc;
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON public.mtc
  FOR EACH ROW EXECUTE FUNCTION public.audit_row();
DROP TRIGGER IF EXISTS trigger_mtc_updated_at ON public.mtc;
CREATE TRIGGER trigger_mtc_updated_at BEFORE UPDATE ON public.mtc
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Sinkron antar pengguna: 'mtc' ditambahkan ke daftar tabel table_stamps() (isi fungsi sama dengan yang berlaku di production
-- per 2026-11-12, hanya ditambah 'mtc').
CREATE OR REPLACE FUNCTION public.table_stamps()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  t TEXT;
  v TEXT;
  res JSONB := '{}'::jsonb;
BEGIN
  FOREACH t IN ARRAY ARRAY['rm','fg','mutasi','spk','vendor','kirim','bongkar','master','mvendor','mcustomer',
                           'msupplier','marmada','rmhist','pr','opname','muser','log','mwc','produksi_log','sp','mtc'] LOOP
    EXECUTE format(
      'SELECT count(*)::text || ''|'' || COALESCE(max(COALESCE(to_jsonb(x) ->> ''updated_at'', to_jsonb(x) ->> ''created_at'', to_jsonb(x) ->> ''at'')), '''') FROM public.%I x', t)
      INTO v;
    res := res || jsonb_build_object(t, v);
  END LOOP;
  RETURN res;
END;
$function$;

-- Hak peran baru (bentuk role_modules saat ini: role, module = hak ubah; migration 25 menambah kolom level dan hak lihat):
--   Maintenance: ubah modul maintenance dan sparepart (sparepart diperlukan untuk mencatat penggantian).
--   Gudang: ubah ketiga gudang. Logistik: kini juga memegang vendor.
INSERT INTO public.role_modules (role, module) VALUES
  ('maintenance', 'maintenance'), ('maintenance', 'sparepart'),
  ('gudang', 'bahan-baku'), ('gudang', 'barang-jadi'), ('gudang', 'sparepart'),
  ('logistik', 'vendor')
ON CONFLICT DO NOTHING;

-- Mutasi sparepart dari Maintenance memakai kebijakan mutasi yang sudah ada (gudang 'sp' mengikuti modul 'sparepart', migration 18):
-- pengguna yang mencatat maintenance dengan sparepart perlu hak ubah modul sparepart (peran Maintenance sudah memilikinya).
