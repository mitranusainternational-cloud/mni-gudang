-- ============================================================
-- DRAFT, BELUM DITERAPKAN DI DATABASE MANA PUN (2026-11-07, langkah 2 cetak biru database; keputusan K-1 = cadangan dulu)
-- MNI Gudang - Cadangan bahan baku saat SPK terbit, pelepasan saat batal atau selesai, sinkron pengeluaran fisik
-- ============================================================
-- Disimpan di folder `draft`. URUTAN: terapkan SETELAH draf 17 (stok tidak negatif) dan 19 (spk_materials).
-- Direvisi sesudah tinjauan adversarial empat sudut (konkurensi, semantik, Supabase/RLS, keselamatan migrasi) dan uji di Postgres
-- lokal (PGlite): lihat `tests/sql/cadangan.sql.test.mjs`.
--
-- Keputusan K-1: bahan DICADANGKAN saat SPK diterbitkan (Draft -> Terbit); pengurangan stok fisik tetap satu-satunya lewat baris
-- `mutasi` (jenis 'keluar', ditandai SPK di data.spk). Stok tidak punya kolom sendiri (turunan: stok_awal + jumlah delta mutasi).
--
-- Definisi (semua dihitung di database):
--   stok          = rm.stok_awal + SUM(mutasi.delta) untuk gudang 'rm' (sama dengan draf 17)
--   cadangan_sisa = untuk baris spk_materials berstatus 'dicadangkan': GREATEST(qty_butuh - qty_keluar, 0)
--   tersedia      = stok - SUM(cadangan_sisa semua SPK)
-- Status baris: rencana (SPK Draft) | dicadangkan | dikeluarkan (sudah keluar penuh) | lepas (dilepas karena SPK Batal/Selesai;
--   dihidupkan lagi saat SPK dibuka kembali) | batal (dibatalkan SENGAJA oleh pengguna; tidak pernah dihidupkan otomatis).
-- Aturan:
--   1. Draft -> Terbit: semua baris SPK itu dicadangkan sekaligus; bila ada bahan kurang SELURUH penerbitan gagal dengan pesan yang
--      menyebut bahan, kebutuhan, dan tersedia.
--   2. Baris baru atau kebutuhan yang dinaikkan pada SPK Terbit diperiksa dengan aturan yang sama (termasuk baris 'dikeluarkan'
--      yang kebutuhannya dinaikkan melewati yang sudah keluar).
--   3. SPK Batal: cadangan dilepas (baris 'lepas'). Batal atau Selesai -> Terbit: baris 'rencana', 'lepas', dan 'dikeluarkan' yang
--      belum penuh dicadangkan ulang (diperiksa stok); baris 'batal' tetap batal.
--   4. SPK Selesai: sisa cadangan dilepas; baris yang sudah keluar ditandai 'dikeluarkan'.
--   5. Pengeluaran fisik (mutasi gudang 'rm' bertanda SPK, termasuk koreksinya) dijumlahkan ulang ke qty_keluar (urut item, kelebihan
--      menumpuk di baris terakhir). Sinkron TIDAK PERNAH menggagalkan pergerakan stok: kegagalan kunci (deadlock) ditelan dan
--      dapat diperbaiki dengan public.spk_materials_hitung_ulang().
--   6. Semua pencadangan dan sinkron diserialkan oleh SATU kunci advisory global ('cadangan'); tidak ada urutan kunci per bahan
--      yang bisa saling bersilang. Beban pabrik kecil, jadi serialisasi global lebih aman daripada kunci per bahan.
--   7. Klien tidak boleh mengisi qty_keluar atau qty_dicadangkan, mengganti spk_id atau rm_id, atau membuat status 'dikeluarkan' atau
--      'lepas' langsung; hanya pemicu yang menetapkannya. Klien boleh: menambah baris, mengubah qty_butuh, membatalkan baris
--      ('batal') dan membuka baris batal kembali ('rencana').
--
-- Batas yang disengaja: pengeluaran fisik oleh SPK lain tidak diblokir walau memakan cadangan SPK lain (bahan sudah di tangan);
-- `tersedia` bisa negatif dan itu menjadi peringatan di view. Penolakan stok negatif tetap hanya di draf 17.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- fungsi hitung (SECURITY INVOKER: pemanggil hanya melihat yang diizinkan RLS) ----------
CREATE OR REPLACE FUNCTION public.rm_stok(p_rm uuid) RETURNS numeric
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT COALESCE((SELECT stok_awal FROM public.rm WHERE id = p_rm), 0)
       + COALESCE((SELECT SUM(delta) FROM public.mutasi WHERE gudang = 'rm' AND item_id = p_rm), 0);
$$;

CREATE OR REPLACE FUNCTION public.rm_cadangan(p_rm uuid, p_kecuali uuid DEFAULT NULL) RETURNS numeric
LANGUAGE sql STABLE SET search_path = public
AS $$
  SELECT COALESCE(SUM(GREATEST(qty_butuh - qty_keluar, 0)), 0)
    FROM public.spk_materials
   WHERE rm_id = p_rm AND status = 'dicadangkan' AND id IS DISTINCT FROM p_kecuali;
$$;

-- fungsi internal: dipakai pemicu (SECURITY DEFINER) agar hitungan tidak tergantung hak baca pengguna
CREATE OR REPLACE FUNCTION public._rm_stok_internal(p_rm uuid) RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE((SELECT stok_awal FROM public.rm WHERE id = p_rm), 0)
       + COALESCE((SELECT SUM(delta) FROM public.mutasi WHERE gudang = 'rm' AND item_id = p_rm), 0);
$$;

CREATE OR REPLACE FUNCTION public._rm_cadangan_internal(p_rm uuid, p_kecuali uuid DEFAULT NULL) RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(SUM(GREATEST(qty_butuh - qty_keluar, 0)), 0)
    FROM public.spk_materials
   WHERE rm_id = p_rm AND status = 'dicadangkan' AND id IS DISTINCT FROM p_kecuali;
$$;

CREATE OR REPLACE FUNCTION public._cadangan_kunci() RETURNS void
LANGUAGE sql SET search_path = public
AS $$ SELECT pg_advisory_xact_lock(hashtextextended('cadangan', 0)); $$;

-- ---------- 0. Jaga kolom yang hanya boleh diisi pemicu ----------
-- Berjalan sebelum pemicu cadangan (urutan nama pemicu). Aliran internal menyalakan 'mni.internal'.
CREATE OR REPLACE FUNCTION public.spk_materials_jaga_kolom() RETURNS trigger
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  IF COALESCE(current_setting('mni.internal', true), '0') = '1' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.qty_keluar := 0;
    NEW.qty_dicadangkan := 0;
    IF NEW.status NOT IN ('rencana', 'dicadangkan', 'batal') THEN
      NEW.status := 'rencana';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.spk_id IS DISTINCT FROM OLD.spk_id OR NEW.rm_id IS DISTINCT FROM OLD.rm_id THEN
    RAISE EXCEPTION 'SPK dan bahan pada baris kebutuhan tidak boleh diubah; batalkan baris ini lalu buat baris baru.' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.qty_keluar IS DISTINCT FROM OLD.qty_keluar OR NEW.qty_dicadangkan IS DISTINCT FROM OLD.qty_dicadangkan THEN
    RAISE EXCEPTION 'Jumlah dicadangkan dan jumlah keluar diisi sistem dari mutasi stok, tidak boleh diubah langsung.' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'batal' AND OLD.qty_keluar > 0 THEN
      RAISE EXCEPTION 'Baris sudah mengeluarkan % bahan; tidak bisa dibatalkan.', trim_scale(OLD.qty_keluar) USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.status NOT IN ('rencana', 'dicadangkan', 'batal') THEN
      RAISE EXCEPTION 'Status baris % hanya ditetapkan sistem.', NEW.status USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_spk_materials_a_jaga ON public.spk_materials;
CREATE TRIGGER trg_spk_materials_a_jaga
  BEFORE INSERT OR UPDATE ON public.spk_materials
  FOR EACH ROW EXECUTE FUNCTION public.spk_materials_jaga_kolom();

-- ---------- 1. Pemeriksaan dan pencadangan per baris ----------
CREATE OR REPLACE FUNCTION public.spk_materials_cadang() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_status text;
  v_no     text;
  v_perlu  numeric;
  v_stok   numeric;
  v_cad    numeric;
  v_item   text;
BEGIN
  -- sinkron pengeluaran tidak boleh gagal karena cadangan: lewati pemeriksaan stok selama sinkron
  IF COALESCE(current_setting('mni.sinkron', true), '0') = '1' THEN
    RETURN NEW;
  END IF;
  SELECT status, no INTO v_status, v_no FROM public.spk WHERE id = NEW.spk_id;

  -- SPK Draft: baris hanya rencana (belum mencadangkan apa pun)
  IF v_status = 'Draft' THEN
    IF NEW.status IN ('dicadangkan', 'dikeluarkan', 'lepas') THEN
      NEW.status := 'rencana';
    END IF;
    IF NEW.status = 'rencana' THEN
      NEW.qty_dicadangkan := 0;
    END IF;
    RETURN NEW;
  END IF;

  -- SPK Terbit: baris yang masih butuh bahan wajib dicadangkan penuh (sebesar kebutuhan dikurangi yang sudah keluar)
  IF v_status = 'Terbit' AND (NEW.status IN ('rencana', 'dicadangkan', 'lepas')
                              OR (NEW.status = 'dikeluarkan' AND NEW.qty_keluar < NEW.qty_butuh)) THEN
    v_perlu := GREATEST(NEW.qty_butuh - NEW.qty_keluar, 0);
    PERFORM public._cadangan_kunci();
    v_stok := public._rm_stok_internal(NEW.rm_id);
    v_cad  := public._rm_cadangan_internal(NEW.rm_id, NEW.id);
    IF v_perlu > v_stok - v_cad THEN
      SELECT item || ' ' || ukuran INTO v_item FROM public.rm WHERE id = NEW.rm_id;
      RAISE EXCEPTION 'Stok bahan tidak cukup untuk SPK %: % perlu %, tersedia % (stok %, sudah dicadangkan SPK lain %).',
        v_no, COALESCE(v_item, NEW.rm_id::text), trim_scale(v_perlu), trim_scale(GREATEST(v_stok - v_cad, 0)), trim_scale(v_stok), trim_scale(v_cad)
        USING ERRCODE = 'check_violation';
    END IF;
    NEW.status := 'dicadangkan';
    NEW.qty_dicadangkan := NEW.qty_butuh;
    RETURN NEW;
  END IF;

  -- SPK Batal atau Selesai: baris yang masih mencadangkan dilepas
  IF v_status IN ('Batal', 'Selesai') AND NEW.status IN ('rencana', 'dicadangkan') THEN
    NEW.status := CASE WHEN NEW.qty_keluar > 0 AND v_status = 'Selesai' THEN 'dikeluarkan' ELSE 'lepas' END;
    NEW.qty_dicadangkan := LEAST(NEW.qty_keluar, NEW.qty_butuh);
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_spk_materials_cadang ON public.spk_materials;
CREATE TRIGGER trg_spk_materials_cadang
  BEFORE INSERT OR UPDATE OF qty_butuh, status ON public.spk_materials
  FOR EACH ROW EXECUTE FUNCTION public.spk_materials_cadang();

-- ---------- 2. Perpindahan status SPK ----------
CREATE OR REPLACE FUNCTION public.spk_status_cadangan() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;
  IF NEW.status = 'Draft' AND OLD.status <> 'Draft' THEN
    RAISE EXCEPTION 'SPK % tidak boleh dikembalikan ke Draft setelah diterbitkan; batalkan SPK bila salah.', OLD.no USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status NOT IN ('Terbit', 'Batal', 'Selesai') THEN
    RETURN NEW;
  END IF;
  PERFORM public._cadangan_kunci();   -- kunci global lebih dulu, baru baris (urutan tetap di semua jalur)
  PERFORM set_config('mni.internal', '1', true);
  IF NEW.status = 'Terbit' THEN
    FOR r IN SELECT id FROM public.spk_materials
              WHERE spk_id = NEW.id
                AND (status IN ('rencana', 'lepas') OR (status = 'dikeluarkan' AND qty_keluar < qty_butuh))
              ORDER BY rm_id, id LOOP
      UPDATE public.spk_materials SET status = 'dicadangkan' WHERE id = r.id;  -- pemicu baris memeriksa stok; gagal = penerbitan batal
    END LOOP;
  ELSE
    FOR r IN SELECT id FROM public.spk_materials WHERE spk_id = NEW.id AND status IN ('rencana', 'dicadangkan') ORDER BY rm_id, id LOOP
      UPDATE public.spk_materials SET status = 'rencana' WHERE id = r.id;     -- dinormalkan pemicu baris sesuai status SPK
    END LOOP;
  END IF;
  PERFORM set_config('mni.internal', '0', true);
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_spk_status_cadangan ON public.spk;
CREATE TRIGGER trg_spk_status_cadangan
  AFTER UPDATE OF status ON public.spk
  FOR EACH ROW EXECUTE FUNCTION public.spk_status_cadangan();

-- ---------- 3. Pengeluaran fisik -> qty_keluar ----------
-- Dihitung ulang (bukan ditambah) agar koreksi, pembatalan, dan pencatatan ulang selalu menghasilkan angka yang sama.
-- Sasaran: baris yang tidak 'batal'; bila semuanya batal (SPK dibatalkan) baris batal ikut disinkron supaya angkanya segar
-- saat SPK dibuka kembali. Status berubah hanya pada SPK Terbit (SPK Selesai atau Batal tidak boleh menghidupkan cadangan).
CREATE OR REPLACE FUNCTION public.spk_materials_sinkron(p_spk uuid, p_rm uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total  numeric;
  v_sisa   numeric;
  v_isi    numeric;
  v_status text;
  v_aktif  boolean;
  r        record;
  v_last   uuid;
BEGIN
  PERFORM set_config('mni.sinkron', '1', true);
  PERFORM set_config('mni.internal', '1', true);
  SELECT status INTO v_status FROM public.spk WHERE id = p_spk;
  SELECT COALESCE(-SUM(delta), 0) INTO v_total
    FROM public.mutasi
   WHERE gudang = 'rm' AND item_id = p_rm AND jenis IN ('keluar', 'koreksi')
     AND (data ->> 'spk') = p_spk::text;
  v_total := GREATEST(v_total, 0);
  v_sisa := v_total;
  v_aktif := EXISTS (SELECT 1 FROM public.spk_materials WHERE spk_id = p_spk AND rm_id = p_rm AND status <> 'batal');
  FOR r IN SELECT id, qty_butuh FROM public.spk_materials
            WHERE spk_id = p_spk AND rm_id = p_rm AND (NOT v_aktif OR status <> 'batal')
            ORDER BY item_idx NULLS LAST, id LOOP
    v_isi := LEAST(v_sisa, r.qty_butuh);
    UPDATE public.spk_materials
       SET qty_keluar = v_isi,
           status = CASE WHEN v_status = 'Terbit' AND status = 'dicadangkan' AND v_isi >= qty_butuh THEN 'dikeluarkan'
                         WHEN v_status = 'Terbit' AND status = 'dikeluarkan' AND v_isi < qty_butuh THEN 'dicadangkan'
                         ELSE status END
     WHERE id = r.id
       AND (qty_keluar IS DISTINCT FROM v_isi
            OR (v_status = 'Terbit' AND status = 'dicadangkan' AND v_isi >= qty_butuh)
            OR (v_status = 'Terbit' AND status = 'dikeluarkan' AND v_isi < qty_butuh));
    v_sisa := v_sisa - v_isi;
    v_last := r.id;
  END LOOP;
  IF v_sisa > 0 AND v_last IS NOT NULL THEN
    UPDATE public.spk_materials SET qty_keluar = qty_keluar + v_sisa WHERE id = v_last;   -- kelebihan keluar menumpuk di baris terakhir
  END IF;
  PERFORM set_config('mni.sinkron', '0', true);
  PERFORM set_config('mni.internal', '0', true);
END
$$;

CREATE OR REPLACE FUNCTION public.mutasi_sinkron_spk() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT DISTINCT x.spk, x.rm FROM (
      SELECT OLD.data ->> 'spk' AS spk, OLD.item_id AS rm WHERE TG_OP <> 'INSERT' AND OLD.gudang = 'rm'
      UNION ALL
      SELECT NEW.data ->> 'spk', NEW.item_id WHERE TG_OP <> 'DELETE' AND NEW.gudang = 'rm'
    ) x WHERE x.spk ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND x.rm IS NOT NULL
  LOOP
    BEGIN
      PERFORM public._cadangan_kunci();
      PERFORM public.spk_materials_sinkron(r.spk::uuid, r.rm);
    EXCEPTION WHEN deadlock_detected OR lock_not_available THEN
      PERFORM set_config('mni.sinkron', '0', true);
      PERFORM set_config('mni.internal', '0', true);
      RAISE WARNING 'Sinkron cadangan bahan ditunda (kunci bentrok) untuk SPK % bahan %; jalankan spk_materials_hitung_ulang().', r.spk, r.rm;
    END;
  END LOOP;
  RETURN NULL;
END
$$;

DROP TRIGGER IF EXISTS trg_mutasi_sinkron_spk ON public.mutasi;
CREATE TRIGGER trg_mutasi_sinkron_spk
  AFTER INSERT OR UPDATE OF delta, item_id, jenis, data, gudang OR DELETE ON public.mutasi
  FOR EACH ROW EXECUTE FUNCTION public.mutasi_sinkron_spk();

-- Perbaikan massal (hanya service role / SQL Editor): hitung ulang qty_keluar semua baris atau satu SPK dari buku mutasi
CREATE OR REPLACE FUNCTION public.spk_materials_hitung_ulang(p_spk uuid DEFAULT NULL) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r record;
  n integer := 0;
BEGIN
  PERFORM public._cadangan_kunci();
  FOR r IN SELECT DISTINCT spk_id, rm_id FROM public.spk_materials WHERE p_spk IS NULL OR spk_id = p_spk ORDER BY rm_id, spk_id LOOP
    PERFORM public.spk_materials_sinkron(r.spk_id, r.rm_id);
    n := n + 1;
  END LOOP;
  RETURN n;
END
$$;

-- ---------- 4. Ketersediaan bahan (satu pembacaan untuk dashboard dan form) ----------
CREATE OR REPLACE VIEW public.v_rm_ketersediaan WITH (security_invoker = true) AS
SELECT r.id AS rm_id, r.item, r.ukuran, r.satuan, r.buffer,
       public.rm_stok(r.id)     AS stok,
       public.rm_cadangan(r.id) AS dicadangkan,
       public.rm_stok(r.id) - public.rm_cadangan(r.id) AS tersedia
  FROM public.rm r;

-- hak eksekusi: fungsi pemicu dan internal tidak bisa dipanggil klien lewat RPC
REVOKE EXECUTE ON FUNCTION public.spk_materials_jaga_kolom(), public.spk_materials_cadang(), public.spk_status_cadangan(),
  public.spk_materials_sinkron(uuid, uuid), public.mutasi_sinkron_spk(), public.spk_materials_hitung_ulang(uuid),
  public._rm_stok_internal(uuid), public._rm_cadangan_internal(uuid, uuid), public._cadangan_kunci() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rm_stok(uuid), public.rm_cadangan(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rm_stok(uuid), public.rm_cadangan(uuid, uuid) TO authenticated;
GRANT SELECT ON public.v_rm_ketersediaan TO authenticated;

-- ---------- Uji ----------
--   Otomatis di Postgres lokal: node tests/sql/cadangan.sql.test.mjs (pasang sekali: npm i --no-save @electric-sql/pglite).
--   Sebelum production: ulangi di project dev atau branch Supabase, termasuk dua sesi bersamaan (PGlite satu koneksi, tidak
--   menguji konkurensi sungguhan): dua penerbitan memperebutkan stok yang sama, penerbitan bersamaan dengan pengeluaran multi-baris.
--
-- Batalkan (rollback):
--   DROP VIEW IF EXISTS public.v_rm_ketersediaan;
--   DROP FUNCTION IF EXISTS public.spk_materials_hitung_ulang(uuid);
--   DROP TRIGGER IF EXISTS trg_mutasi_sinkron_spk ON public.mutasi;  DROP FUNCTION IF EXISTS public.mutasi_sinkron_spk();
--   DROP FUNCTION IF EXISTS public.spk_materials_sinkron(uuid, uuid);
--   DROP TRIGGER IF EXISTS trg_spk_status_cadangan ON public.spk;  DROP FUNCTION IF EXISTS public.spk_status_cadangan();
--   DROP TRIGGER IF EXISTS trg_spk_materials_cadang ON public.spk_materials;  DROP FUNCTION IF EXISTS public.spk_materials_cadang();
--   DROP TRIGGER IF EXISTS trg_spk_materials_a_jaga ON public.spk_materials;  DROP FUNCTION IF EXISTS public.spk_materials_jaga_kolom();
--   DROP FUNCTION IF EXISTS public._cadangan_kunci();  DROP FUNCTION IF EXISTS public._rm_cadangan_internal(uuid, uuid);
--   DROP FUNCTION IF EXISTS public._rm_stok_internal(uuid);  DROP FUNCTION IF EXISTS public.rm_cadangan(uuid, uuid);
--   DROP FUNCTION IF EXISTS public.rm_stok(uuid);
