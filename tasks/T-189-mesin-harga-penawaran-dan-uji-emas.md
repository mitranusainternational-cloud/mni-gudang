---
type: task
id: T-189
title: "Mesin harga penawaran dan uji emas"
phase: P9
epic: E-16
release: v1.2
status: done
priority: P2
env: dev
effort_days: 3
depends: [T-187]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-189 Mesin harga penawaran dan uji emas

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-187
Rancangan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]] (bagian 10)

## Kriteria selesai

- [x] Katalog harga diekstrak dari workbook (6 keluarga × 32 bentuk = 192) tanpa menulis ulang rumus manual (pembangun `scripts/build-quote-catalog.mjs`, pembaca xlsx bersama `scripts/lib/xlsx-baca.mjs`)
- [x] Lapisan harga murni di `src/lib/erp/harga.js`: harga satuan, baut, subtotal, diskon, PPN, total, kebutuhan kg, biaya saat PO
- [x] Satu model rumus baku dengan parameter per skenario (tiga sheet workbook menjadi tiga skenario parameter); skenario tanpa kolom AY memakai kolom AW
- [x] Uji emas terhadap nilai Excel: 192 bentuk, 2.195 nilai rumus, harga satuan, total, dan biaya PO sama; uji skenario, total, dan masukan tidak dikenali (null dengan alasan, bukan 0)
- [x] Pembanding uji adalah nilai hitung workbook penawaran (keputusan pemilik 2026-11-06)
- [x] Katalog, skenario, dan nilai pembanding nyata hanya di berkas yang diabaikan Git; uji CI memakai katalog sintetis dan melewati uji emas bila berkas tidak ada
- [x] Keputusan pemilik (2026-11-06): rumus sheet utama menjadi baku; dua sheet lain hanya sumber parameter skenario, harga lama Reducer, Hold Down Clamp, dan Cover Clamp di sana tidak dipakai
- [x] Pemuatan katalog dan skenario dari tabel master setelah login dipindah ke [[T-190-modul-penawaran-lokal]] (dibutuhkan saat modul dipakai)

## Bukti

`verified in browser` tidak berlaku (tanpa UI). Unit: `node tests/unit/erp-harga.test.mjs` 22 PASS, 0 FAIL (15 sintetis tanpa berkas katalog); semua uji unit lain tetap PASS (rencana 11, berat 6 dan 24, jadwal 21, kapasitas 10, dan lainnya). Pembanding: nilai tersimpan Excel pada salinan workbook, termasuk total dengan qty uji di sembilan baris.

Temuan: (1) cacat rujukan baris lain pada SLW Horizontal Cross Equal Cover kolom AJ, diperbaiki dan diuji; (2) angka tetap tersembunyi di Straight Reducer; (3) dua kolom parameter AW dan AY; (4) dua sheet lain memuat rumus versi lama (302 sel berbeda; Straight Reducer di sana hampir dua kali harga sheet utama).

## Catatan

Tahap E0 (mesin saja). Tidak ada perubahan pada aplikasi, database, maupun production. Rumus dan harga tidak masuk Git; hanya kode mesin, pembangun, dan uji sintetis.
