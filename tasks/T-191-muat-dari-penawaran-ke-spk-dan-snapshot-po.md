---
type: task
id: T-191
title: "Muat dari penawaran ke SPK dan snapshot PO"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P2
env: dev
effort_days: 3
depends: [T-190]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-191 Muat dari penawaran ke SPK dan snapshot PO

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-190
Rancangan: [[documentation/ERP_QUOTATION_ANALISIS]]

## Kriteria selesai

- [x] Tombol Muat ke SPK dari penawaran disetujui membuat SPK Draft idempoten (tidak ganda) dengan item, berat, customer, PO, due date, dan tautan penawaran
- [x] Snapshot harga, berat, dan biaya per komponen saat PO disimpan tidak berubah oleh perubahan skenario
- [x] Revisi penawaran memperbarui SPK sebagai revisi; SPK tetap bebas diubah pengguna
- [x] Uji alur hulu ke hilir (penawaran, SPK, produksi, vendor, kirim) dengan tangkapan layar

## Bukti

- Kode: mesin murni di `apps/platform/src/lib/erp/penawaran.js` (masalahMuatSpk, produkSpk, susunSpk, snapshotPO, perluPerbaruiSpk, gabungRevisiSpk); UI di `apps/gudang-logistik/assets/js/app.js` (tombol Muat ke SPK, Perbarui SPK dari Rev, Buka SPK, panel Snapshot PO, lencana Dari penawaran di lembar SPK).
- Uji: unit penawaran 25 PASS (P-19 sampai P-24); e2e penawaran 35 PASS (N-28 sampai N-35); alur hulu ke hilir `alur-penawaran.mjs` 6 PASS dengan tangkapan di documentation/screenshots/alur-penawaran; regresi penuh 0 FAIL.
- Tingkat bukti: verified in browser (mock). Bukan bukti Supabase.
- Rancangan: harga dan biaya hanya di snapshot dalam dokumen penawaran (modul rahasia); SPK hanya memuat jumlah, berat real per pcs, dan tautan (nomor, Rev, varian). Tidak ada kolom baru di tabel spk (tautan di kolom data). Tautan dua arah: penawaran menyimpan spkId, spkNo, spkRev, po, snapshot.
- Idempoten: penawaran yang sudah tertaut tidak bisa dimuat lagi; revisi yang disetujui lagi menawarkan Perbarui SPK, yang mempertahankan jumlah produksi menurut deskripsi dan melaporkan item lama yang hilang.
- Vendor, kirim, dan terima tidak bergantung asal SPK; urutannya tetap diuji di alur-spk.mjs.

## Catatan

Diperbarui 2026-11-06: jalan pintas penawaran ke SPK digantikan alur Penawaran, Sales Order, SPK ([[tasks/T-194-sales-order-penghubung-penawaran-dan-spk|T-194]]). Mesin snapshot, idempotensi, dan pembaruan dari revisi tetap dipakai; sumbernya kini Sales Order.

Muat ke SPK butuh hak modul penawaran sekaligus hak ubah SPK (praktisnya admin); Sales hanya melihat tautan. Tebal dan finishing tidak ada di penawaran, jadi dilengkapi di editor SPK (menentukan langkah vendor). Pemetaan keluarga ke judul produk SPK (ST* = tray, SL* = ladder, bentuk lurus = CABLE, lainnya ACCS) adalah dugaan yang perlu dikonfirmasi pemilik dengan katalog asli. Kolom referensi di tabel spk belum perlu migration; snapshot memakai kolom data penawaran (draf migration 15).

Tahap E2. Kolom referensi baru di tabel spk hanya ditayangkan pada tahap yang disetujui. Lokal dulu; tidak menyentuh production sebelum persetujuan eksplisit pemilik.
