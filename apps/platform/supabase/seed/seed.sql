-- ============================================================
-- MNI Gudang - Seed Data (untuk development)
-- ============================================================

-- Insert default app settings
INSERT INTO master (key, value, ket) VALUES
  ('app_name', '"MNI Gudang"', 'Nama aplikasi'),
  ('app_version', '"1.0.0"', 'Versi aplikasi'),
  ('spk_counter', '1000', 'Counter untuk nomor SPK berikutnya'),
  ('pr_counter', '1', 'Counter untuk nomor PR berikutnya')
ON CONFLICT (key) DO NOTHING;

-- Insert default Work Centers (nama harus sama dengan langkah rute produksi: Shearing, Punching, Bending, CNC Laser, Welding)
INSERT INTO mwc (kode, nama, tipe, urutan, aktif) VALUES
  ('SHEARING', 'Shearing', 'Internal', 1, true),
  ('PUNCHING', 'Punching', 'Internal', 2, true),
  ('BENDING', 'Bending', 'Internal', 3, true),
  ('CNC', 'CNC Laser', 'Internal', 4, true),
  ('WELDING', 'Welding', 'Internal', 5, true),
  ('GRINDING', 'Grinding / Polishing', 'Internal', 4, true),
  ('COATING', 'Coating / Painting', 'Internal', 5, true),
  ('QC', 'Quality Control', 'Internal', 6, true),
  ('PACKING', 'Packing', 'Internal', 7, true),
  ('SUBCONT1', 'Vendor Subcont Umum', 'Subcont', 10, true)
ON CONFLICT (kode) DO NOTHING;

-- Admin user placeholder (email diisi sesuai akun Supabase)
-- INSERT INTO muser (email, nama, role, aktif) VALUES
--   ('admin@mni.co.id', 'Administrator', 'admin', true);
