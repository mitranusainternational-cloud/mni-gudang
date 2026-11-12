---
type: task
id: T-187
title: "Bedah workbook quotation dan rancang modul ERP"
phase: P9
epic: E-16
release: v1.2
status: done
priority: P1
env: dev
effort_days: 1
depends: []
owner: "dev + pemilik"
updated: 2026-11-05
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-187 Bedah workbook quotation dan rancang modul ERP

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: -
Rancangan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]]

## Kriteria selesai

- [x] Workbook penawaran dibaca dengan aman (salinan, hanya baca, makro mati): sheet, tata letak, parameter, rumus, total, blok biaya PO
- [x] Hubungan dengan kalkulator berat dipetakan (192 produk, estimasi dan real) dan komponen yang bisa dipakai ulang ditetapkan
- [x] Temuan mutu workbook, arsitektur modul terpisah, tangga E0 sampai E5, risiko, dan pertanyaan pemilik ditulis di dokumen analisis
- [x] Tidak ada angka harga atau biaya di Git atau vault

## Bukti

source-level: isi workbook dibaca lewat Excel COM pada salinan; hasil di [[documentation/arsip/ERP_QUOTATION_ANALISIS]]. Tidak ada kode dan tidak ada perubahan pada sistem live.

## Catatan

Pertanyaan terbuka untuk pemilik ada di bagian 9 dokumen analisis. Lokal dulu; tidak menyentuh production sebelum persetujuan eksplisit pemilik.
