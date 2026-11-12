---
type: task
id: T-190
title: "Modul Penawaran lokal (daftar, lembar, revisi, cetak)"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P2
env: dev
effort_days: 4
depends: [T-189]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-190 Modul Penawaran lokal (daftar, lembar, revisi, cetak)

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-189
Rancangan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]]

## Kriteria selesai

- [x] Menu Penawaran dengan hak modul sendiri; tampilan lama tidak berubah bagi yang tidak berhak
- [x] Lembar penawaran: kepala, item dari katalog dengan pratinjau harga dan berat, subtotal, diskon, PPN, catatan, status (Draft, Terkirim, Revisi, Disetujui, Ditolak, Kedaluwarsa)
- [x] Katalog dan skenario harga disimpan terkompresi di tabel master dan dimuat setelah login (mengikuti katalog_berat); katalog baku dari T-189
- [x] Varian per penawaran (A, B, C) dengan pemilihan satu varian oleh customer; SPK dimuat dari varian terpilih
- [x] Batas diskon per peran dan status Menunggu persetujuan bila melewati batas (nilai batas dan penyetuju ditetapkan pemilik); nomor otomatis format lama dengan kunci atomik
- [x] Revisi bernomor, cetak rapi (PDF atau cetak), harga hanya terlihat peran yang berhak
- [x] Tabel baru sebagai migration draf; mock dan adapter diperluas sesuai kontrak
- [x] Regresi penuh 0 FAIL dan tangkapan layar desktop dan HP

## Bukti

- Kode: `src/lib/erp/penawaran.js` (mesin status, varian, revisi, nomor, diskon), blok Penawaran di `apps/gudang-logistik/assets/js/app.js` dan `css/app.css`, draf `supabase/draft/20240101000015_penawaran.sql` (BELUM diterapkan), peran Sales di mock dan adapter.
- Uji: unit penawaran 18 PASS; e2e `penawaran.mjs` 27 PASS (N-01 sampai N-27, termasuk HP 390 px, hak akses, persetujuan diskon, revisi, cetak tanpa berat dan biaya); regresi penuh 0 FAIL (regresi 42, role 12, akses 34, produksi 134, penawaran 27, tampilan 72) dan alur-spk 15 PASS.
- Tingkat bukti: verified in browser (mock). Bukan bukti Supabase; migration 15 belum diterapkan di database mana pun.
- Tangkapan layar: documentation/screenshots/penawaran-v1-kosong.png dan penawaran-v1-lembar.png (data uji sintetis).
- Perbaikan sampingan: data contoh mock dan dua uji produksi memakai tanggal lokal, bukan UTC (gagal pada 00:00 sampai 07:00 WIB).

## Catatan

Menunggu pemilik: nilai batas diskon per peran dan penyetuju (sementara 30 persen untuk Sales, admin tanpa batas), kode nomor (sementara MNI, format NNN.KODE/MM/YYYY), dan peninjauan tampilan. Katalog harga asli dimuat admin dari berkas lokal ke master setelah login; tidak masuk Git.

Dikerjakan agen erp-integrator. Tahap E1. Tinjau dengan pemilik lewat tangkapan layar agar tampilan tidak membingungkan. Lokal dulu; tidak menyentuh production sebelum persetujuan eksplisit pemilik.
