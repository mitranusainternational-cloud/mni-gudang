---
type: task
id: T-202
title: "Sembunyikan modul Penawaran dan Sales Order, fokus ke operasional"
phase: P2
epic: E-16
release: v1.2
status: done
priority: P2
env: dev
effort_days: 0.25
depends: [T-194]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-202 Sembunyikan modul Penawaran dan Sales Order, fokus ke operasional

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P2
Bergantung pada: T-194

## Kriteria selesai

- [x] Menu Penawaran dan Sales Order tidak tampil dan alamatnya kembali ke Dashboard; saklar tunggal `MODUL_PENJUALAN=false` di `app.js`
- [x] Kode, data, dan draf migration 15 dan 16 dipertahankan; suite penawaran dilewati di `run.mjs`

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd). Verified in browser (mock): menu hilang, regresi 0 FAIL.

## Catatan

- Atas permintaan pemilik 2026-11-06. Ubah saklar ke `true` dan jalankan suite penawaran untuk menampilkan lagi. T-190 sampai T-194 tetap `review`; modul belum tayang.
