---
type: task
id: T-234
title: "Modul Maintenance terhubung Gudang Sparepart: catatan, jadwal rutin, akumulasi, per mesin"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 2
depends: [T-233]
owner: "dev + pemilik"
updated: 2026-11-12
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-234 Modul Maintenance

Permintaan pemilik 2026-11-12: modul khusus Maintenance yang tersambung ke Gudang Sparepart untuk melacak mesin yang sudah dimaintenance, yang perlu maintenance rutin, yang sering maintenance, dan sparepart yang sudah diganti, dengan akumulasi hari, minggu, bulan, triwulan, tahun, dan selamanya. Skema lengkap: [[documentation/SKEMA_MAINTENANCE|SKEMA_MAINTENANCE]].

## Kriteria selesai

- [x] Skema: satu tabel `mtc` (kind `catat` dan `rutin`), sparepart lewat mutasi stok yang sudah ada (tujuan mesin); draf migration `20240101000024_maintenance.sql` (**belum diterapkan**)
- [x] Menu **Maintenance** dan modul akses `maintenance` (Produksi dan Gudang Bahan Baku ubah; PPIC, Gudang Barang Jadi, Logistik, Viewer lihat; admin semua), tampil di Pengguna & Akses dan Kinerja Tim
- [x] **Catat maintenance**: mesin (pilih atau ketik; mesin baru otomatis masuk Master Data), jenis (Preventif, Korektif, Inspeksi, Kalibrasi), status (Selesai, Dikerjakan, Menunggu sparepart), masalah, tindakan, teknisi, jam atau lama henti, biaya, dan sparepart yang diganti; sparepart otomatis keluar dari Gudang Sparepart (SP-K, ref MTC, tujuan mesin) dan qty tidak boleh melebihi stok
- [x] **Jadwal rutin** per mesin (tugas, interval hari, jatuh tempo pertama): status Terlambat, Segera, Aman; tombol Kerjakan membuka catatan terisi; jadwal bergeser setelah selesai
- [x] **Akumulasi** Hari ini, Minggu ini, 30 hari, Bulan ini, Triwulan ini, Triwulan lalu, Tahun ini, Semua: jumlah, preventif dan korektif, downtime (jam), sparepart diganti, belum selesai, tren
- [x] **Per mesin**: frekuensi, korektif, preventif, downtime, MTBF, sparepart diganti, ranking paling sering; riwayat satu mesin dengan sparepart yang pernah diganti
- [x] Tab **Sparepart diganti** (per item, kali, mesin) dengan tautan ke Gudang Sparepart (tab Pemakaian mesin dan Riwayat mutasi ikut menampilkan)
- [x] Cek Data (jadwal rutin terlambat, mesin sering rusak 3 kali dalam 30 hari, menunggu sparepart lebih dari 3 hari), badge menu, Tindakan hari ini di Dashboard
- [x] Unduh **PDF** dan **Excel** (ringkasan, per mesin, jadwal rutin, catatan, sparepart diganti)
- [ ] Diterapkan ke Supabase dev (migration draf; butuh persetujuan) dan diuji dengan login nyata
- [ ] Pembatalan catatan yang sudah memakai sparepart (koreksi stok otomatis): saat ini koreksi manual di Gudang Sparepart

## Bukti

`verified in browser` (mock; Playwright terlihat, data bersih). Unit `maintenance.test` 9 PASS (M-01..M-09), e2e `maintenance` 11 PASS (MT-01..MT-10, MT-99), lint 0 error. Regresi penuh: lihat catatan di [[documentation/RENCANA_PERBAIKAN_LOKAL]].
