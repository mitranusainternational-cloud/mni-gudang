---
type: task
id: T-194
title: "Sales Order: penghubung Penawaran dan SPK"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P2
env: dev
effort_days: 3
depends: [T-191]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-194 Sales Order: penghubung Penawaran dan SPK

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-191
Rancangan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]]

## Kriteria selesai

- [x] Sales Order (SO) dibuat dengan satu klik dari penawaran Disetujui: nomor otomatis NNN/SO/tahun, PO customer, tanggal PO, due date, alamat kirim, item dari varian terpilih, dan snapshot harga, berat, biaya saat PO
- [x] Tebal dan finishing per item di penawaran dan SO; konfirmasi ditolak bila kosong (menentukan rute produksi dan langkah vendor)
- [x] Konfirmasi SO mengunci PO dan membuat SPK Draft otomatis (judul section sesuai konvensi rute, jumlah, berat real, PO, due date, tautan SO dan penawaran, tanpa harga); PPIC memeriksa lalu menerbitkan
- [x] Amandemen SO bernomor Rev dengan alasan; konfirmasi ulang memuat perubahan ke SPK yang sama (jumlah produksi dipertahankan), snapshot tetap beku
- [x] Hak akses: SO memakai hak modul penawaran; Sales melihat tanpa tombol SPK; peran tanpa hak tidak melihat menu
- [x] Tabel baru sebagai migration draf 16; mock dan adapter diperluas; regresi penuh 0 FAIL dan tangkapan layar alur hulu ke hilir

## Bukti

- Kode: `apps/platform/src/lib/erp/salesorder.js` (mesin murni), UI di `apps/gudang-logistik/assets/js/app.js` (menu Sales Order, lembar, konfirmasi, SPK otomatis), draf `supabase/draft/20240101000016_salesorder.sql` (BELUM diterapkan).
- Uji: unit salesorder 10 PASS dan penawaran 25 PASS; e2e penawaran 37 PASS (N-28 sampai N-37 mencakup alur SO); alur hulu ke hilir `alur-penawaran.mjs` 7 PASS dengan tangkapan di documentation/screenshots/alur-penawaran; regresi penuh 0 FAIL (produksi 134, tampilan 72), alur-spk 15 PASS.
- Tingkat bukti: verified in browser (mock). Bukan bukti Supabase.

## Catatan

Menggantikan jalan pintas langsung penawaran ke SPK dari T-191 (mesin snapshot dan pembaruan dari revisi dipakai ulang, sumbernya kini SO). Satu SO membuat satu SPK; struktur data (daftar spk) siap untuk beberapa SPK per SO bila nanti diperlukan. Konfirmasi SO oleh pengguna tanpa hak ubah SPK tetap berhasil, SPK dibuat admin atau PPIC lewat tombol Buat SPK. Menunggu pemilik: konfirmasi pemetaan keluarga ke produk (ST* tray, SL* ladder) dengan katalog asli, dan apakah satu PO pernah dipecah ke beberapa SPK.
