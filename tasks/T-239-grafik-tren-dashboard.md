---
type: task
id: T-239
title: "Dashboard: grafik tren (output produksi harian, ketepatan kirim, pengiriman per minggu)"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P2
env: dev
effort_days: 1
depends: [T-238]
owner: "dev + pemilik"
updated: 2026-11-20
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-239 Grafik tren Dashboard

Dari repo WMS-MNI. Hanya tampilan: membaca data yang sama dengan layar lain, tidak menulis apa pun.

## Kriteria selesai

- [x] Grafik area **Output produksi harian** (ton, 30 hari; hasil di langkah akhir saja agar tidak dihitung ganda lintas Work Centre)
- [x] Cincin **Ketepatan kirim** (90 hari) dan batang **Pengiriman per minggu** (surat jalan customer, 8 minggu)
- [x] Keadaan kosong yang rapi bila belum ada data
- [ ] Penilaian pemilik dengan data nyata di mni-wms

## Bukti

`verified in browser` (mock). e2e `uiv2` UI-03; regresi 42, menyeluruh 24, tampilan 72, fitur 18, alurlengkap 31, 0 FAIL; lint 0 error.
