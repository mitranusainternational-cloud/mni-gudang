---
type: task
id: T-179
title: "Produksi Hari Ini v2 dan Laporan Produksi: input otomatis, analisa qty, tonase, kecepatan, produk bertingkat, KPI operator dan mesin"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 2
depends: [T-178]
owner: "dev + pemilik"
updated: 2026-11-04
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-179 Produksi Hari Ini v2 dan Laporan Produksi

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-178
Kebutuhan: [[PRD_PRODUKSI]] bagian 11

## Kriteria selesai

- [x] **Tata letak Produksi Hari Ini:** ringkasan tipis, kolom kiri sedang dikerjakan (menempel saat digulir), kolom kanan antrian berupa kartu; satu kolom di HP
- [x] **Input otomatis:** tanggal dan jam mulai terisi dari tombol Mulai; Catat hanya perlu jumlah (tanggal dan jam selesai otomatis, jam mulai opsional); tombol Selesai menyebut yang akan disimpan dan menyimpan semua yang siap bila jumlah dikosongkan
- [x] **Catatan terakhir** menyebut nama customer (PT) di samping nomor SPK
- [x] **Laporan Produksi baru:** periode (hari ini, minggu ini, 30 hari, bulan ini, tahun ini, semua), analisa by jumlah, tonase, atau kecepatan (pcs per jam, kg per jam, menit per pcs), tren per hari, minggu, atau bulan, unduh CSV
- [x] **Produk bertingkat:** Cable Tray, Cable Ladder, Cable Duct, Cover, Aksesoris, lalu type (STU, STC, SLU, SLW, SLHD), lalu material dan finishing; dibaca dari judul section SPK dan disimpan pada kejadian
- [x] **KPI operator dan mesin:** akumulasi hari ini, minggu ini, bulan ini, tahun ini, seluruhnya, rata-rata per hari aktif, dan hari terbaik, per operator, mesin, work center, atau kelompok produk
- [x] Rincian harian (laporan lama) tetap ada sebagai tab untuk cetak dan CSV
- [x] Uji unit statistik 34; e2e produksi 92, regresi 42, role 12, akses 34, tampilan 71 (mock, `verified in browser`, bukan bukti Supabase)
- [ ] Ditinjau pemilik di pratinjau lokal

## Bukti

Branch lokal `fitur/produksi-multi-wc`. Mesin hitung `src/lib/produksi/statistik.js` (periode, kelompok, pohon produk, tren, akumulasi). Data contoh memuat riwayat sampai 330 hari ke belakang untuk laporan mingguan, bulanan, dan tahunan.

## Catatan

Draf migration 14 ditambah kolom `kelompok`, `tipe`, `material`, `finishing` pada `produksi_log`; belum diterapkan. Belum di-push.
