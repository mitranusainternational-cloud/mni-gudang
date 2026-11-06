---
type: task
id: T-207
title: "Master Data > Bahan baku: jenis material, massa jenis, hapus dan pulihkan, ganti nama mengikuti semua modul"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 2
depends: [T-196]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-207 Master Data > Bahan baku: jenis material, massa jenis, hapus dan pulihkan, ganti nama mengikuti semua modul

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-196

## Kriteria selesai

- [x] Tab Bahan baku di Master Data: tabel jenis material (massa jenis, kata kunci, sumber, jumlah item) dan tabel item (jenis, kg per lembar, satuan, min, buffer, lokasi)
- [x] Massa jenis dapat diatur per jenis (`master/setting.dens`); jenis baru dibuat dari Master Data atau langsung dari Item baru (`setting.mats`)
- [x] Semua jenis dapat dihapus (bawaan disimpan di `setting.jenisOff`, dapat dipulihkan); jenis yang masih dipakai item menjadi "Belum dikenali" dengan peringatan di Posisi stok dan Cek Data
- [x] Ganti nama jenis (termasuk bawaan) mengikuti Posisi stok, filter, Analisa, Kartu Stok, Rencana pembelian, opname, riwayat, dan dokumen; kebutuhan SPK tetap cocok lewat penanda `dasar`
- [x] Ganti nama customer, vendor, supplier mengikuti SPK, surat jalan, mutasi, dan bongkar muat (`renameEverywhere`)
- [x] Item bahan baku nonaktif (bukan hapus, mengikuti migration 13) lewat `rm.data.aktif`; tersembunyi di daftar dan pilihan form, riwayat tetap

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd dan sebelumnya).
- Verified in browser (mock): contoh Aluminium diganti Alumunium dan hapus lalu pulihkan jenis bawaan, 0 galat konsol; regresi penuh 0 FAIL. Tanpa migration.

## Catatan

- Berat manual per item (menimpa hitungan dari massa jenis) belum dibuat: perlu kolom baru dan keputusan pemilik.
