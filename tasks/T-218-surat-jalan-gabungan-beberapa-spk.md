---
type: task
id: T-218
title: "Surat jalan vendor dan customer gabungan beberapa SPK dalam satu armada"
phase: P9
epic: E-16
release: v1.2
status: todo
priority: P1
env: dev
effort_days: 4
depends: [T-217]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-218 Surat jalan vendor dan customer gabungan beberapa SPK dalam satu armada

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-217

## Kriteria selesai

- [ ] Satu pengiriman ke vendor dapat memuat item dari beberapa SPK (SPK customer dan SPK stok) dalam satu armada, dengan pilihan SPK per baris
- [ ] Satu pengiriman ke customer dapat menggabungkan SPK stok dan SPK customer dalam satu armada
- [ ] Cetak surat jalan memuat struktur per SPK dengan subtotal
- [ ] Bongkar Muat mengikuti struktur yang sama (ceklis per SPK) dan centangnya muncul di surat jalan
- [ ] Status, sisa, dan progres tiap SPK tetap benar setelah pengiriman gabungan (uji neraca per SPK)

## Bukti

(belum ada)

## Catatan

Permintaan pemilik 2026-11-07. Saat ini satu dokumen vendor atau kirim terikat satu SPK (kolom spk_id); perlu perubahan model data secara hati-hati (draf migration, tanpa merusak data lama).
