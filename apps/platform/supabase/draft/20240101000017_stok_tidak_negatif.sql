-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-06, menunggu persetujuan pemilik)
-- MNI Gudang - Stok tidak boleh negatif, dijaga di database (audit risiko 9)
-- ============================================================
-- Disimpan di folder `draft`, bukan `migrations`, agar tidak ikut terpasang tanpa persetujuan pemilik.
--
-- Masalah: aplikasi menolak pengeluaran yang melebihi stok, tetapi pemeriksaannya hanya di browser. Dua pengguna yang
-- mengeluarkan item yang sama hampir bersamaan, atau pencatatan lewat jalur lain (SQL Editor, impor), bisa sama-sama
-- lolos dan membuat stok negatif.
--
-- Solusi: pemicu BEFORE pada `mutasi` yang memeriksa ulang di database. Pemeriksaan diserialkan per item dengan kunci
-- advisory (per transaksi) sehingga dua pengeluaran bersamaan diperiksa satu per satu. Hanya baris dengan delta negatif
-- yang diperiksa; penerimaan, opname naik, dan perubahan lain tidak terpengaruh.
--
-- Rumus stok sama dengan aplikasi dan dengan hasil pengecekan production: stok = stok_awal + jumlah delta mutasi item itu.
-- Pengecekan production 2026-11-06 (baca-saja): tidak ada item bermutasi tanpa item_id, tidak ada gudang selain rm dan fg,
-- dan tidak ada item dengan stok negatif saat ini (stok terendah 0), jadi pemicu tidak akan menolak data yang sudah ada.
--
-- Catatan perilaku:
--   * Koreksi (mutasi pembalik) yang akan membuat stok negatif, mis. membatalkan penerimaan yang sebagian sudah dipakai,
--     ikut ditolak dengan pesan jelas. Selesaikan dulu pemakaiannya (koreksi pemakaian) atau lakukan opname.
--   * Perubahan yang tidak mengubah delta, item, atau gudang tidak diperiksa ulang.
--   * Pengeditan langsung lewat SQL Editor (service role) juga melewati pemicu ini, itu disengaja agar aturan berlaku konsisten.
--
-- Uji sebelum dipasang (di project dev atau branch, bukan production):
--   1. keluar lebih besar dari stok -> galat "Stok tidak cukup".
--   2. keluar sama dengan stok -> berhasil, stok 0.
--   3. dua sesi bersamaan mengeluarkan item yang sama masing-masing 60% stok -> satu berhasil, satu ditolak.
--   4. masuk, opname, dan koreksi yang tidak membuat negatif -> berhasil.
--   5. jalankan regresi aplikasi (tes e2e) di database tersebut.
--
-- Batalkan (rollback):
--   DROP TRIGGER IF EXISTS trg_mutasi_jaga_stok ON public.mutasi;
--   DROP FUNCTION IF EXISTS public.mutasi_jaga_stok();

CREATE OR REPLACE FUNCTION public.mutasi_jaga_stok() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_awal numeric;
  v_sum  numeric;
  v_stok numeric;
BEGIN
  IF NEW.delta IS NULL OR NEW.delta >= 0 OR NEW.item_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE'
     AND NEW.delta   IS NOT DISTINCT FROM OLD.delta
     AND NEW.item_id IS NOT DISTINCT FROM OLD.item_id
     AND NEW.gudang  IS NOT DISTINCT FROM OLD.gudang THEN
    RETURN NEW;
  END IF;

  -- serialkan pemeriksaan per item (dilepas otomatis di akhir transaksi)
  PERFORM pg_advisory_xact_lock(hashtextextended('mutasi:' || COALESCE(NEW.gudang, '') || ':' || NEW.item_id::text, 0));

  IF NEW.gudang = 'rm' THEN
    SELECT COALESCE(stok_awal, 0) INTO v_awal FROM public.rm WHERE id = NEW.item_id;
  ELSIF NEW.gudang = 'fg' THEN
    SELECT COALESCE(stok_awal, 0) INTO v_awal FROM public.fg WHERE id = NEW.item_id;
  ELSE
    RETURN NEW;
  END IF;
  IF NOT FOUND THEN
    RETURN NEW;  -- item tidak ditemukan: biarkan batasan relasi yang menolak
  END IF;

  SELECT COALESCE(SUM(delta), 0) INTO v_sum
    FROM public.mutasi
   WHERE gudang = NEW.gudang AND item_id = NEW.item_id AND id IS DISTINCT FROM NEW.id;

  v_stok := v_awal + v_sum;
  IF v_stok + NEW.delta < 0 THEN
    RAISE EXCEPTION 'Stok tidak cukup: tersedia %, diminta %', v_stok, -NEW.delta
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_mutasi_jaga_stok ON public.mutasi;
CREATE TRIGGER trg_mutasi_jaga_stok
  BEFORE INSERT OR UPDATE OF delta, item_id, gudang ON public.mutasi
  FOR EACH ROW EXECUTE FUNCTION public.mutasi_jaga_stok();
