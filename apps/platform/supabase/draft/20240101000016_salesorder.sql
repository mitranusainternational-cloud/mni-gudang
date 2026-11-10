-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (rencana T-194, lihat documentation/ERP_QUOTATION_ANALISIS.md)
-- MNI Gudang - Sales Order (penghubung Penawaran -> SPK)
-- ============================================================
-- Disimpan di folder `draft`, bukan `migrations`. Hanya MENAMBAH: satu tabel baru. Tanpa DROP dan tanpa mengubah tabel lama.
-- URUTAN: terapkan SETELAH draf 14 (produksi_log) dan 15 (penawaran). SO memuat snapshot harga dan biaya, jadi memakai hak
-- modul `penawaran` yang sama (harga rahasia). SPK tidak berubah: tautan ke SO dan penawaran disimpan di kolom data SPK.

CREATE TABLE IF NOT EXISTS public.salesorder (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  no         INTEGER NOT NULL,                                  -- urutan nomor SO (per tahun)
  tgl        DATE NOT NULL DEFAULT CURRENT_DATE,
  customer   TEXT NOT NULL DEFAULT '',
  po         TEXT,                                              -- nomor PO customer
  status     TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Dikonfirmasi', 'Batal')),
  rev        INTEGER NOT NULL DEFAULT 0 CHECK (rev >= 0),       -- nomor amandemen
  total      NUMERIC,                                           -- total saat PO (dari snapshot)
  due        DATE,                                              -- due date dari customer
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb                 -- nomor, item, snapshot, tautan penawaran dan SPK, amandemen
);
CREATE UNIQUE INDEX IF NOT EXISTS salesorder_no_uniq ON public.salesorder (EXTRACT(YEAR FROM tgl), no);
CREATE INDEX IF NOT EXISTS salesorder_status ON public.salesorder (status, tgl DESC);

ALTER TABLE public.salesorder ENABLE ROW LEVEL SECURITY;
-- Baca dan tulis hanya untuk pemegang modul penawaran (admin termasuk). Tanpa kebijakan DELETE: penghapusan ditolak (batalkan lewat status).
CREATE POLICY "salesorder_read"   ON public.salesorder FOR SELECT TO authenticated USING (public.can_mod('penawaran'));
CREATE POLICY "salesorder_insert" ON public.salesorder FOR INSERT TO authenticated WITH CHECK (public.can_mod('penawaran'));
CREATE POLICY "salesorder_update" ON public.salesorder FOR UPDATE TO authenticated USING (public.can_mod('penawaran')) WITH CHECK (public.can_mod('penawaran'));

CREATE TRIGGER trigger_salesorder_updated_at BEFORE UPDATE ON public.salesorder FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_audit ON public.salesorder;
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON public.salesorder FOR EACH ROW EXECUTE FUNCTION public.audit_row();

-- sidik tabel untuk sinkron antar pengguna: tambahkan salesorder ke daftar (fungsi sama dengan draf 15)
CREATE OR REPLACE FUNCTION public.table_stamps()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public, pg_temp AS $$
DECLARE
  t TEXT;
  v TEXT;
  res JSONB := '{}'::jsonb;
BEGIN
  FOREACH t IN ARRAY ARRAY['rm','fg','mutasi','spk','vendor','kirim','bongkar','master','mvendor','mcustomer',
                           'msupplier','marmada','rmhist','pr','opname','muser','log','mwc','produksi_log','penawaran','salesorder'] LOOP
    EXECUTE format(
      'SELECT count(*)::text || ''|'' || COALESCE(max(COALESCE(to_jsonb(x) ->> ''updated_at'', to_jsonb(x) ->> ''created_at'')), '''') FROM public.%I x', t)
      INTO v;
    res := res || jsonb_build_object(t, v);
  END LOOP;
  RETURN res;
END;
$$;
