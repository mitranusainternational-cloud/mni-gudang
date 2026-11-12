---
type: task
id: T-228
title: "Nama bentuk bisa diedit di Master Data, Elbow tanpa 90, susulan draf PR, rute Cable Duct, sapu bug dan perapian workspace"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-226, T-227]
owner: "dev + pemilik"
updated: 2026-11-12
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-228 Nama bentuk di Master Data, susulan PR, sapu bug

Permintaan pemilik 2026-11-12: Elbow cukup tertulis "Elbow" (tanpa 90), nama bentuk dan aturan section bisa diedit di Master Data dan terhubung ke editor SPK, cek silang keluaran tiap pergerakan SPK (bahan baku, produksi, kirim vendor, barang jadi, sparepart), cek hak akses, cari dan perbaiki bug, rapikan workspace.

## Kriteria selesai

- [x] Nama bentuk **Elbow** (tanpa 90) di pilihan bentuk, nama item otomatis, Master Data, dan uji. Teks lama "Elbow 90" tetap dikenali parser
- [x] Master Data › Aturan section: kolom **Bentuk** bisa diedit (`master/setting.namaBentuk`), dipakai editor SPK, dipulihkan bersama aturan. Uji AR-07
- [x] Cek silang 11 section dengan **katalog asli**: nama, berat, rute, vendor, klasifikasi laporan, kebutuhan plat (netto sama dengan jumlah berat item), tanpa NaN atau galat di 14 halaman
- [x] Bug 1: **Cable Duct** (tanpa lubang) masih memakai rute Punching; kini Shearing, Bending. Uji R-100
- [x] Bug 2: SPK yang diterbitkan **PPIC** (tanpa hak Gudang Bahan Baku) tidak pernah mendapat draf PR; kini disusul otomatis saat petugas gudang bahan baku atau admin membuka Bahan baku (SPK terbit 7 hari terakhir tanpa PR, tidak ganda). Uji PH-45
- [x] Audit hak akses aksi baru (ajukan PR, serahkan semua plate, terima semua barang jadi, hitung ulang berat): semuanya dijaga `need()` per modul; Laporan terbuka untuk semua peran
- [x] Workspace dirapikan: 3 berkas kosong Obsidian dihapus, gambar alur dipindah ke `documentation/screenshots/alur-spk`, 6 dokumen usang dipindah ke `documentation/arsip/`, tautan diperbarui, `sync-vault` OK (0 rusak)
- [ ] Diuji di Supabase dengan login nyata (belum)

## Bukti

`verified in browser` (mock). Unit 11 berkas PASS (R-100, B-01/B-16/B-21 disesuaikan), e2e spkaturan 19 PASS (AR-07), produksihh 45 PASS (PH-45), lint 0 error. Regresi penuh pada salinan beku: lihat catatan di [[documentation/RENCANA_PERBAIKAN_LOKAL]].

## Perlu keputusan pemilik

- Rute Cable Duct tanpa Punching adalah turunan dari "tanpa lubang"; konfirmasi bila Duct tetap perlu Punching (ubah di Master Data › Rute produksi).
- Rute Other Support masih bawaan sementara (CNC Laser, Bending, Welding).
