-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-07, langkah 1 cetak biru database; menunggu persetujuan pemilik)
-- MNI Gudang - SPK: peruntukan (customer atau stok buffer), tautan customer, kebutuhan bahan baku per SPK (spk_materials)
-- ============================================================
-- Disimpan di folder `draft`, bukan `migrations`, agar tidak ikut terpasang tanpa persetujuan pemilik.
-- Prinsip rancangan:
--   * HANYA MENAMBAH. Tidak ada DROP, tidak ada ubah tipe kolom lama. Kolom lama (customer TEXT, po, status, data.stokReq)
--     tetap dibaca aplikasi yang berjalan sekarang; kolom baru diisi otomatis dari data lama (backfill dan pemicu sinkron).
--   * Aturan bisnis dipasang sebagai CHECK ... NOT VALID: berlaku untuk baris BARU dan yang DIUBAH, baris lama tidak dipaksa
--     (sampai dirapikan lalu di-VALIDATE; lihat bagian 'Setelah dipasang').
--   * Stok bahan baku TIDAK dipotong dari kolom stok. Stok adalah turunan dari buku mutasi (stok_awal + sum(delta)); satu-satunya
--     sumber kebenaran. spk_materials hanya mencatat KEBUTUHAN dan CADANGAN; pemotongan fisik tetap lewat baris `mutasi`
--     (jenis 'keluar', ref = nomor SPK). Pemicu pemotongan otomatis dirancang di langkah 2, bukan di berkas ini.
--   * Status SPK memakai nilai yang sudah dipakai aplikasi: 'Draft' | 'Terbit' | 'Selesai' | 'Batal'. 'Terbit' = berjalan.
--     Tahap posisi barang (Produksi, Di vendor, Siap kirim, dst.) diturunkan dari produksi_log, vendor, dan kirim (langkah 3).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- 1. Peruntukan SPK ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typname = 'spk_peruntukan') THEN
    CREATE TYPE public.spk_peruntukan AS ENUM ('customer', 'stok_buffer');
  END IF;
END
$$;

ALTER TABLE public.spk ADD COLUMN IF NOT EXISTS peruntukan  public.spk_peruntukan;
ALTER TABLE public.spk ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.mcustomer (id) ON DELETE RESTRICT;
-- SPK customer yang sah tanpa PO (keputusan pemilik K-3 2026-11-07: ada) wajib menyebut alasannya, bukan dikosongkan diam-diam.
-- Daftar alasan sengaja pendek dan bisa ditambah lewat migration berikutnya.
ALTER TABLE public.spk ADD COLUMN IF NOT EXISTS tanpa_po_alasan TEXT;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spk_tanpa_po_alasan_valid' AND conrelid = 'public.spk'::regclass) THEN
    ALTER TABLE public.spk ADD CONSTRAINT spk_tanpa_po_alasan_valid CHECK (tanpa_po_alasan IS NULL OR tanpa_po_alasan IN ('sampel', 'komplain', 'garansi', 'lainnya'));
  END IF;
END
$$;

-- Backfill dari data lama: SPK stok ditandai data.stokReq = true oleh aplikasi; selain itu SPK customer.
UPDATE public.spk
   SET peruntukan = CASE WHEN lower(coalesce(data ->> 'stokReq', 'false')) IN ('true', 't', '1') THEN 'stok_buffer'::public.spk_peruntukan
                         ELSE 'customer'::public.spk_peruntukan END
 WHERE peruntukan IS NULL;

ALTER TABLE public.spk ALTER COLUMN peruntukan SET DEFAULT 'customer';
ALTER TABLE public.spk ALTER COLUMN peruntukan SET NOT NULL;

-- Backfill tautan customer: cocokkan nama persis (abaikan huruf besar kecil dan spasi tepi) dengan master customer yang AKTIF
-- dan tidak ambigu. Yang tidak cocok dibiarkan NULL dan muncul di daftar periksa di bawah (jangan ditebak).
UPDATE public.spk s
   SET customer_id = m.id
  FROM (SELECT lower(btrim(nama)) AS k, (array_agg(id))[1] AS id
          FROM public.mcustomer WHERE aktif IS NOT FALSE
         GROUP BY lower(btrim(nama)) HAVING count(*) = 1) m
 WHERE s.customer_id IS NULL AND s.peruntukan = 'customer' AND lower(btrim(s.customer)) = m.k;

-- ---------- 2. Batasan SPK (berlaku untuk baris baru/diubah; baris lama tidak dipaksa) ----------
DO $$
DECLARE
  n_no integer;
  n_st integer;
  n_cu integer;
BEGIN
  -- Gerbang: batasan NOT VALID tetap MENOLAK UPDATE biasa pada baris lama yang melanggar (progres, revisi, batal), jadi migration
  -- berhenti dulu bila ada baris lama yang melanggar. Rapikan datanya, lalu jalankan ulang.
  SELECT count(*) INTO n_no FROM public.spk WHERE no !~ '^[0-9]{1,9}$';
  SELECT count(*) INTO n_st FROM public.spk WHERE status NOT IN ('Draft', 'Terbit', 'Selesai', 'Batal');
  SELECT count(*) INTO n_cu FROM public.spk WHERE status IN ('Terbit') AND peruntukan = 'customer' AND btrim(coalesce(customer, '')) = '';
  IF n_no + n_st + n_cu > 0 THEN
    RAISE EXCEPTION 'Migration 19 dihentikan: % SPK bernomor bukan angka, % berstatus di luar daftar, % SPK customer terbit tanpa nama customer. Rapikan dulu.', n_no, n_st, n_cu;
  END IF;
  -- nomor SPK hanya angka (aplikasi menyimpan teks angka); keunikan sudah dijamin UNIQUE(no) di skema awal
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spk_no_angka' AND conrelid = 'public.spk'::regclass) THEN
    ALTER TABLE public.spk ADD CONSTRAINT spk_no_angka CHECK (no ~ '^[0-9]{1,9}$') NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spk_status_valid' AND conrelid = 'public.spk'::regclass) THEN
    ALTER TABLE public.spk ADD CONSTRAINT spk_status_valid CHECK (status IN ('Draft', 'Terbit', 'Selesai', 'Batal')) NOT VALID;
  END IF;
  -- Tahap sekarang (kompatibel dengan aplikasi yang berjalan): SPK customer terbit wajib bernama customer. Penautan customer_id
  -- dilakukan otomatis oleh pemicu (cocok nama dengan master customer) dan wajib PO baru dipasang setelah UI menegakkannya;
  -- lihat bagian 'Tahap ketat' di akhir berkas.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spk_customer_wajib' AND conrelid = 'public.spk'::regclass) THEN
    ALTER TABLE public.spk ADD CONSTRAINT spk_customer_wajib
      CHECK (status <> 'Terbit' OR peruntukan <> 'customer' OR btrim(coalesce(customer, '')) <> '') NOT VALID;
  END IF;
  -- SPK stok buffer tidak boleh terikat customer (barang masuk gudang barang jadi internal)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spk_stok_tanpa_customer' AND conrelid = 'public.spk'::regclass) THEN
    ALTER TABLE public.spk ADD CONSTRAINT spk_stok_tanpa_customer CHECK (peruntukan <> 'stok_buffer' OR customer_id IS NULL) NOT VALID;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_spk_customer_id ON public.spk (customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_spk_peruntukan_status ON public.spk (peruntukan, status);

-- Pemicu: (a) menyelaraskan peruntukan dengan data.stokReq selama aplikasi lama masih menulis stokReq; (b) peruntukan dan nomor
-- tidak boleh berubah setelah SPK diterbitkan (mengubahnya setelah produksi akan merusak stok dan tagihan).
CREATE OR REPLACE FUNCTION public.spk_jaga_peruntukan() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- tautkan customer_id otomatis bila namanya cocok persis dengan satu master customer aktif (aplikasi lama hanya menulis nama)
  IF NEW.peruntukan = 'customer' AND NEW.customer_id IS NULL AND btrim(coalesce(NEW.customer, '')) <> '' THEN
    SELECT (array_agg(m.id))[1] INTO NEW.customer_id
      FROM public.mcustomer m
     WHERE lower(btrim(m.nama)) = lower(btrim(NEW.customer)) AND m.aktif IS NOT FALSE
    HAVING count(*) = 1;
  END IF;
  IF NEW.data ? 'stokReq' THEN
    NEW.peruntukan := CASE WHEN lower(coalesce(NEW.data ->> 'stokReq', 'false')) IN ('true', 't', '1')
                           THEN 'stok_buffer'::public.spk_peruntukan ELSE 'customer'::public.spk_peruntukan END;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status <> 'Draft' THEN
    IF NEW.peruntukan IS DISTINCT FROM OLD.peruntukan THEN
      RAISE EXCEPTION 'Peruntukan SPK % tidak boleh diubah setelah diterbitkan (% -> %).', OLD.no, OLD.peruntukan, NEW.peruntukan USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.no IS DISTINCT FROM OLD.no THEN
      RAISE EXCEPTION 'Nomor SPK % tidak boleh diubah setelah diterbitkan.', OLD.no USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_spk_jaga_peruntukan ON public.spk;
CREATE TRIGGER trg_spk_jaga_peruntukan BEFORE INSERT OR UPDATE ON public.spk
  FOR EACH ROW EXECUTE FUNCTION public.spk_jaga_peruntukan();

-- ---------- 3. Kebutuhan bahan baku per SPK ----------
-- Satu baris = satu bahan baku (rm) untuk satu SPK, opsional dikaitkan ke satu item SPK. Kebutuhan dihitung dari berat dan ukuran
-- (modul material) atau diisi manual; `qty_dicadangkan` dan `qty_keluar` dijaga oleh pemicu langkah 2, bukan diisi sembarang.
CREATE TABLE IF NOT EXISTS public.spk_materials (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spk_id           UUID NOT NULL REFERENCES public.spk (id) ON DELETE RESTRICT,
  rm_id            UUID NOT NULL REFERENCES public.rm (id) ON DELETE RESTRICT,
  item_idx         INTEGER CHECK (item_idx IS NULL OR item_idx >= 0),   -- urutan item SPK; NULL = untuk seluruh SPK
  qty_butuh        NUMERIC(14, 3) NOT NULL CHECK (qty_butuh > 0),       -- dalam satuan rm (lembar, batang, kg sesuai rm.satuan)
  qty_dicadangkan  NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (qty_dicadangkan >= 0),
  qty_keluar       NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (qty_keluar >= 0),
  sumber           TEXT NOT NULL DEFAULT 'manual' CHECK (sumber IN ('manual', 'hitung')),
  status           TEXT NOT NULL DEFAULT 'rencana' CHECK (status IN ('rencana', 'dicadangkan', 'dikeluarkan', 'lepas', 'batal')),
  ket              TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by       TEXT,
  updated_by       TEXT,
  -- cadangan tidak boleh melebihi kebutuhan. qty_keluar BOLEH melebihi kebutuhan (bahan keluar lebih banyak dari rencana tetap harus
  -- tercatat, bukan membuat pergerakan stok gagal); kelebihan terlihat dari qty_keluar > qty_butuh.
  CONSTRAINT spk_materials_batas CHECK (qty_dicadangkan <= qty_butuh),
  -- baris 'rencana' tidak mencadangkan apa pun; qty_keluar boleh terisi (bahan bisa keluar untuk SPK yang masih Draft)
  CONSTRAINT spk_materials_status_qty CHECK (status <> 'rencana' OR qty_dicadangkan = 0)
);

-- Tidak boleh ada dua baris untuk bahan dan item yang sama dalam satu SPK (mencegah kebutuhan terhitung ganda)
CREATE UNIQUE INDEX IF NOT EXISTS uq_spk_materials_spk_rm_item
  ON public.spk_materials (spk_id, rm_id, coalesce(item_idx, -1)) WHERE status <> 'batal';
CREATE INDEX IF NOT EXISTS idx_spk_materials_spk ON public.spk_materials (spk_id);
CREATE INDEX IF NOT EXISTS idx_spk_materials_rm  ON public.spk_materials (rm_id) WHERE status IN ('rencana', 'dicadangkan');

ALTER TABLE public.spk_materials ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'spk_materials' AND policyname = 'spk_materials_read') THEN
    CREATE POLICY spk_materials_read ON public.spk_materials FOR SELECT TO authenticated USING (public.can_view('spk') OR public.can_view('bahan-baku'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'spk_materials' AND policyname = 'spk_materials_ins') THEN
    CREATE POLICY spk_materials_ins ON public.spk_materials FOR INSERT TO authenticated WITH CHECK (public.can_mod('spk'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'spk_materials' AND policyname = 'spk_materials_upd') THEN
    CREATE POLICY spk_materials_upd ON public.spk_materials FOR UPDATE TO authenticated
      USING (public.can_mod('spk') OR public.can_mod('bahan-baku')) WITH CHECK (public.can_mod('spk') OR public.can_mod('bahan-baku'));
  END IF;
  -- sengaja tanpa kebijakan DELETE (konsisten dengan migration 13): baris dibatalkan lewat status 'batal'
END
$$;

DROP TRIGGER IF EXISTS trg_audit ON public.spk_materials;
CREATE TRIGGER trg_audit AFTER INSERT OR UPDATE OR DELETE ON public.spk_materials
  FOR EACH ROW EXECUTE FUNCTION public.audit_row();
DROP TRIGGER IF EXISTS trigger_spk_materials_updated_at ON public.spk_materials;
CREATE TRIGGER trigger_spk_materials_updated_at BEFORE UPDATE ON public.spk_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ---------- Tahap ketat (dipasang SETELAH UI mengisi customer_id dan PO; keputusan pemilik K-2 dan K-3) ----------
--   ALTER TABLE public.spk DROP CONSTRAINT IF EXISTS spk_customer_wajib;
--   ALTER TABLE public.spk ADD CONSTRAINT spk_customer_wajib
--     CHECK (status IN ('Draft', 'Batal', 'Selesai') OR peruntukan <> 'customer'
--            OR (customer_id IS NOT NULL AND (btrim(coalesce(po, '')) <> '' OR tanpa_po_alasan IS NOT NULL))) NOT VALID;
--   PO kosong hanya sah bila tanpa_po_alasan terisi ('sampel', 'komplain', 'garansi', 'lainnya'); alasan tanpa PO dicatat di kolom itu.
--   (Batal dan Selesai dikecualikan agar membatalkan atau menyelesaikan SPK lama tidak tertolak.)
--
-- ---------- Setelah dipasang: daftar periksa data lama (jalankan, perbaiki, baru VALIDATE) ----------
--   SPK customer yang belum tertaut ke master customer (nama tidak cocok persis):
--     SELECT no, customer, status FROM public.spk WHERE peruntukan = 'customer' AND customer_id IS NULL ORDER BY no;
--   SPK customer terbit tanpa PO:
--     SELECT no, customer FROM public.spk WHERE peruntukan = 'customer' AND status <> 'Draft' AND btrim(coalesce(po, '')) = '';
--   Setelah bersih, kunci aturan untuk semua baris lama:
--     ALTER TABLE public.spk VALIDATE CONSTRAINT spk_customer_wajib;
--     ALTER TABLE public.spk VALIDATE CONSTRAINT spk_stok_tanpa_customer;
--     ALTER TABLE public.spk VALIDATE CONSTRAINT spk_status_valid;
--     ALTER TABLE public.spk VALIDATE CONSTRAINT spk_no_angka;
--
-- Uji sebelum dipasang (project dev atau branch, bukan production):
--   1. Backfill: jumlah peruntukan = 'stok_buffer' sama dengan jumlah SPK yang data.stokReq = true.
--   2. Insert SPK customer terbit tanpa customer_id atau tanpa po -> ditolak; sebagai Draft -> diterima.
--   3. Insert SPK stok_buffer dengan customer_id -> ditolak.
--   4. Ubah peruntukan atau no pada SPK Terbit -> ditolak; pada Draft -> diterima.
--   5. spk_materials: dua baris (spk, rm, item) sama -> baris kedua ditolak; qty_butuh <= 0 -> ditolak; hapus lewat API -> 0 baris.
--   6. Jalankan regresi aplikasi (tes e2e) di database tersebut; aplikasi lama harus tetap bisa simpan SPK (pemicu menjaga peruntukan).
--
-- Batalkan (rollback), urutan terbalik:
--   DROP TABLE IF EXISTS public.spk_materials;
--   DROP TRIGGER IF EXISTS trg_spk_jaga_peruntukan ON public.spk;  DROP FUNCTION IF EXISTS public.spk_jaga_peruntukan();
--   ALTER TABLE public.spk DROP CONSTRAINT IF EXISTS spk_customer_wajib, DROP CONSTRAINT IF EXISTS spk_stok_tanpa_customer,
--     DROP CONSTRAINT IF EXISTS spk_status_valid, DROP CONSTRAINT IF EXISTS spk_no_angka;
--   ALTER TABLE public.spk DROP COLUMN IF EXISTS customer_id, DROP COLUMN IF EXISTS peruntukan;  DROP TYPE IF EXISTS public.spk_peruntukan;
