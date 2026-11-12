-- ============================================================
-- DRAF (BELUM DITERAPKAN di Supabase mana pun; butuh persetujuan pemilik)
-- MNI Gudang - Hak modul ketat: pengguna hanya melihat modul yang diatur untuknya
-- ============================================================
-- Keputusan pemilik 2026-11-12: setiap peran atau pengguna hanya melihat modul yang diatur untuknya; hanya super admin melihat semua.
--
-- Keadaan sekarang (migration 11): bila muser.data tidak punya kunci 'modul', fungsi mod_level() memberi 'lihat' untuk SEMUA modul
-- (perilaku lama) dan 'ubah' untuk modul di role_modules. Pengguna yang dibuat dari form Tambah anggota sudah punya peta 'modul'
-- sehingga sudah ketat; yang belum punya peta (pengguna lama) masih melihat semua.
--
-- Perubahan ini:
--   1. role_modules mendapat kolom `level` ('ubah' atau 'lihat') sehingga paket peran bisa memuat hak lihat.
--   2. mod_level(): tanpa peta 'modul', pakai paket peran (role_modules): ada = level-nya; tidak ada = NULL (tidak terlihat).
--   3. Isi paket peran sama dengan ROLES di aplikasi (gudang, maintenance, logistik baru ikut).
-- LANGKAH SEBELUM DITERAPKAN: cadangkan data, periksa pengguna aktif tanpa peta 'modul' (daftar di bawah) agar tidak ada yang
-- kehilangan akses; bila perlu isi peta modulnya dari paket peran lebih dulu.
--
--   SELECT email, role FROM public.muser WHERE aktif AND role <> 'admin' AND jsonb_typeof(data -> 'modul') IS DISTINCT FROM 'object';

ALTER TABLE public.role_modules ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'ubah' CHECK (level IN ('ubah', 'lihat'));

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

-- Master data dan pengaturan tetap terbaca semua pengguna aktif sebagai pilihan formulir (migration 11); menu Master Data di aplikasi
-- hanya tampil untuk pemegang modul 'master-data'. Laporan dan Dashboard menampilkan hanya bagian dari modul yang boleh dilihat.
