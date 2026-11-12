-- ============================================================
-- SIAP DITERAPKAN (BELUM DITERAPKAN di Supabase mana pun; menunggu perintah pemilik untuk menerapkan; terapkan SETELAH migration 24)
-- MNI Gudang - Hak modul ketat: pengguna hanya melihat modul yang diatur untuknya
-- ============================================================
-- Keputusan pemilik 2026-11-12: setiap peran atau pengguna hanya melihat modul yang diatur untuknya; hanya super admin melihat semua.
-- Lihat documentation/RENCANA_MIGRATION_MAINTENANCE_DAN_HAK.md (pemeriksaan sebelum, langkah, verifikasi, pembatalan).
--
-- Keadaan sekarang (migration 11, diperiksa di production 2026-11-12): bila muser.data tidak punya kunci 'modul', mod_level()
-- memberi 'ubah' untuk modul di role_modules dan 'lihat' untuk SEMUA modul lain. Pengguna dengan peta 'modul' sudah ketat.
--
-- Perubahan:
--   1. role_modules mendapat kolom `level` ('ubah' atau 'lihat'); baris yang ada otomatis 'ubah' (tidak berubah perilakunya).
--   2. Paket peran (ubah dan lihat) diisi sama dengan ROLES di aplikasi, termasuk peran baru gudang dan maintenance.
--   3. Pengaman: migration berhenti dengan pesan jelas bila ada pengguna aktif (bukan admin) tanpa peta 'modul' yang perannya
--      tidak punya paket, karena orang itu akan kehilangan semua akses.
--   4. mod_level(): tanpa peta 'modul', pakai paket peran (level-nya); modul di luar paket = NULL (tidak terlihat).
-- Hanya mengubah satu fungsi (CREATE OR REPLACE) dan menambah kolom dan baris; tidak menghapus data. Aman diputar ulang.
-- Pembatalan: 20240101000025_hak_modul_ketat_rollback.sql.

ALTER TABLE public.role_modules ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'ubah';
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.role_modules'::regclass AND conname = 'role_modules_level_chk') THEN
    ALTER TABLE public.role_modules ADD CONSTRAINT role_modules_level_chk CHECK (level IN ('ubah', 'lihat'));
  END IF;
END
$$;

INSERT INTO public.role_modules (role, module, level) VALUES
  -- PPIC
  ('ppic','spk','ubah'), ('ppic','vendor','ubah'), ('ppic','bahan-baku','lihat'), ('ppic','barang-jadi','lihat'), ('ppic','pengiriman','lihat'), ('ppic','bongkar-muat','lihat'), ('ppic','maintenance','lihat'),
  -- Gudang (semua gudang)
  ('gudang','bahan-baku','ubah'), ('gudang','barang-jadi','ubah'), ('gudang','sparepart','ubah'), ('gudang','spk','lihat'), ('gudang','bongkar-muat','lihat'), ('gudang','vendor','lihat'), ('gudang','pengiriman','lihat'), ('gudang','maintenance','lihat'),
  -- Gudang Bahan Baku (khusus)
  ('gbb','bahan-baku','ubah'), ('gbb','bongkar-muat','ubah'), ('gbb','sparepart','ubah'), ('gbb','spk','lihat'), ('gbb','maintenance','lihat'),
  -- Gudang Barang Jadi (khusus)
  ('gbj','barang-jadi','ubah'), ('gbj','vendor','ubah'), ('gbj','pengiriman','ubah'), ('gbj','bongkar-muat','ubah'), ('gbj','spk','lihat'), ('gbj','maintenance','lihat'),
  -- Logistik
  ('logistik','bongkar-muat','ubah'), ('logistik','vendor','ubah'), ('logistik','pengiriman','ubah'), ('logistik','spk','lihat'), ('logistik','bahan-baku','lihat'), ('logistik','barang-jadi','lihat'), ('logistik','maintenance','lihat'),
  -- Produksi
  ('produksi','spk','ubah'), ('produksi','vendor','lihat'), ('produksi','maintenance','lihat'),
  -- Maintenance
  ('maintenance','maintenance','ubah'), ('maintenance','sparepart','ubah'), ('maintenance','spk','lihat'),
  -- Sales (peran lama)
  ('sales','spk','lihat'),
  -- Viewer
  ('viewer','bahan-baku','lihat'), ('viewer','barang-jadi','lihat'), ('viewer','sparepart','lihat'), ('viewer','vendor','lihat'), ('viewer','pengiriman','lihat'), ('viewer','spk','lihat'), ('viewer','bongkar-muat','lihat'), ('viewer','maintenance','lihat')
ON CONFLICT (role, module) DO UPDATE SET level = EXCLUDED.level;

-- Pengaman: jangan ketatkan bila ada pengguna aktif tanpa peta modul yang perannya tidak punya paket (akan kehilangan semua akses).
DO $$
DECLARE n INT; daftar TEXT;
BEGIN
  SELECT count(*), string_agg(u.email || ' (' || u.role || ')', ', ')
    INTO n, daftar
  FROM public.muser u
  WHERE u.aktif AND u.role <> 'admin'
    AND jsonb_typeof(u.data -> 'modul') IS DISTINCT FROM 'object'
    AND NOT EXISTS (SELECT 1 FROM public.role_modules r WHERE r.role = u.role);
  IF n > 0 THEN
    RAISE EXCEPTION 'Hak ketat dibatalkan: % pengguna aktif tanpa peta modul dan tanpa paket peran akan kehilangan semua akses: %. Isi peta modul mereka di Pengguna & Akses lebih dulu.', n, daftar;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.mod_level(m TEXT)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT CASE
    WHEN u.role = 'admin' THEN 'ubah'
    WHEN jsonb_typeof(u.data -> 'modul') = 'object' THEN
      CASE u.data -> 'modul' ->> m WHEN 'ubah' THEN 'ubah' WHEN 'lihat' THEN 'lihat' ELSE NULL END
    ELSE (SELECT r.level FROM public.role_modules r WHERE r.role = u.role AND r.module = m)
  END
  FROM public.muser u
  WHERE u.email = (SELECT auth.email()) AND u.aktif;
$$;

-- WAJIB diubah bersama: can_any() (migration 11) memakai "ada baris role_modules untuk peran ini" tanpa peta modul. Setelah paket peran memuat
-- baris 'lihat' (sales, viewer, dan hak lihat peran lain), peran yang hanya boleh melihat akan dianggap boleh mencatat. Maka hanya hak 'ubah' yang dihitung.
CREATE OR REPLACE FUNCTION public.can_any()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.muser u
    WHERE u.email = (SELECT auth.email()) AND u.aktif
      AND (u.role = 'admin'
        OR (jsonb_typeof(u.data -> 'modul') = 'object'
            AND EXISTS (SELECT 1 FROM jsonb_each_text(u.data -> 'modul') j WHERE j.value = 'ubah'))
        OR (jsonb_typeof(u.data -> 'modul') IS DISTINCT FROM 'object'
            AND EXISTS (SELECT 1 FROM public.role_modules r WHERE r.role = u.role AND r.level = 'ubah')))
  );
$$;

-- Master data dan pengaturan tetap terbaca semua pengguna aktif sebagai pilihan formulir (migration 11); menu Master Data di aplikasi
-- hanya tampil untuk pemegang modul 'master-data'.
