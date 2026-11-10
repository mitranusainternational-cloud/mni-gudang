-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (rencana T-190, lihat documentation/ERP_QUOTATION_ANALISIS.md)
-- MNI Gudang - Modul Penawaran (hulu alur penawaran ke SPK)
-- ============================================================
-- Disimpan di folder `draft`, bukan `migrations`, agar tidak ikut terpasang tanpa persetujuan pemilik (tahap E3 dan E5
-- skill erp-module-boundary). Hanya MENAMBAH: tabel baru, satu modul baru, satu peran baru. Tanpa DROP dan tanpa mengubah
-- tabel lama. Harga dan biaya rahasia: tabel hanya terbaca pengguna yang punya hak modul `penawaran` (atau admin).
-- Satu baris = satu penawaran beserta seluruh varian dan item (kolom JSONB `data`) dan riwayat revisinya.
-- URUTAN: terapkan SETELAH draf 14 (produksi_log); daftar table_stamps di bawah memuat produksi_log dan penawaran.

CREATE TABLE IF NOT EXISTS public.penawaran (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  no         INTEGER NOT NULL,                                  -- urutan nomor penawaran (per tahun)
  rev        INTEGER NOT NULL DEFAULT 0 CHECK (rev >= 0),       -- nomor revisi; nomor dasar tidak berubah
  tgl        DATE NOT NULL DEFAULT CURRENT_DATE,
  berlaku    DATE,                                              -- berlaku sampai
  customer   TEXT NOT NULL DEFAULT '',
  sales      TEXT,                                              -- email pembuat
  status     TEXT NOT NULL DEFAULT 'Draft'
             CHECK (status IN ('Draft', 'Menunggu persetujuan', 'Terkirim', 'Disetujui', 'Ditolak')),
  total      NUMERIC,                                           -- total varian terpilih atau terendah (untuk daftar)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb                 -- nomor (teks), attn, proyek, franco, varian, riwayat, dan lain-lain
);
CREATE UNIQUE INDEX IF NOT EXISTS penawaran_no_uniq ON public.penawaran (EXTRACT(YEAR FROM tgl), no);
CREATE INDEX IF NOT EXISTS penawaran_status ON public.penawaran (status, tgl DESC);

ALTER TABLE public.penawaran ENABLE ROW LEVEL SECURITY;
-- Baca dan tulis hanya untuk pemegang modul penawaran (admin termasuk). Tidak ada kebijakan DELETE: penghapusan ditolak.
CREATE POLICY "penawaran_read"   ON public.penawaran FOR SELECT TO authenticated USING (public.can_mod('penawaran'));
CREATE POLICY "penawaran_insert" ON public.penawaran FOR INSERT TO authenticated WITH CHECK (public.can_mod('penawaran'));
CREATE POLICY "penawaran_update" ON public.penawaran FOR UPDATE TO authenticated USING (public.can_mod('penawaran')) WITH CHECK (public.can_mod('penawaran'));

-- penanda waktu ubah dan jejak audit seperti tabel lain
CREATE TRIGGER trigger_penawaran_updated_at BEFORE UPDATE ON public.penawaran FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_audit ON public.penawaran;
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON public.penawaran FOR EACH ROW EXECUTE FUNCTION public.audit_row();

-- peran Sales dan modul penawaran (admin memiliki semua modul)
INSERT INTO public.role_modules (role, module) VALUES ('sales', 'penawaran') ON CONFLICT DO NOTHING;

-- sidik tabel untuk sinkron antar pengguna: tambahkan penawaran ke daftar (fungsi sama dengan migration 12)
CREATE OR REPLACE FUNCTION public.table_stamps()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  t TEXT;
  v TEXT;
  res JSONB := '{}'::jsonb;
BEGIN
  FOREACH t IN ARRAY ARRAY['rm','fg','mutasi','spk','vendor','kirim','bongkar','master','mvendor','mcustomer',
                           'msupplier','marmada','rmhist','pr','opname','muser','log','mwc','produksi_log','penawaran'] LOOP
    EXECUTE format(
      'SELECT count(*)::text || ''|'' || COALESCE(max(COALESCE(to_jsonb(x) ->> ''updated_at'', to_jsonb(x) ->> ''created_at'')), '''') FROM public.%I x', t)
      INTO v;
    res := res || jsonb_build_object(t, v);
  END LOOP;
  RETURN res;
END;
$$;
