---
type: task
id: T-209
title: "Gudang Bahan Baku: Posisi stok, lembar hitung opname, dan berita acara opname"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-196, T-207]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-209 Gudang Bahan Baku: Posisi stok, lembar hitung opname, dan berita acara opname

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-196, T-207

## Kriteria selesai

- [x] Posisi stok: grup "Belum dikenali" dengan peringatan, label jenis di samping nama item, tombol cepat Pakai, Terima, Ubah per baris, catatan asal kg per lembar (tebal x lebar x panjang / 1.000.000 x massa jenis)
- [x] Riwayat mutasi: filter Semua SPK, Tanpa SPK, atau SPK tertentu (membaca tautan dan teks referensi lama), keterangan multi-baris, total lembar dan kg langsung saat mengetik di form Pakai dan Terima
- [x] Stock opname: lembar hitung kosong (PDF dan Excel, terurut per jenis, kolom hitung fisik, selisih, catatan, tanda tangan) dan berita acara tiap sesi
- [x] Bukti Pengeluaran Bahan Baku per nomor PK dengan SPK, customer, tujuan, item, qty, kg

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd dan sebelumnya).
- Verified in browser (mock): 294 lulus pada saat itu (42, 12, 34, 134, 72); kini ditambah suite sparepart 35 menjadi 329.

## Catatan

- Tanpa migration.
