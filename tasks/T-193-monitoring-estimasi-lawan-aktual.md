---
type: task
id: T-193
title: "Monitoring estimasi lawan aktual"
phase: P9
epic: E-16
release: v1.2
status: todo
priority: P2
env: dev
effort_days: 3
depends: [T-191, T-192]
owner: "dev + pemilik"
updated: 2026-11-05
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-193 Monitoring estimasi lawan aktual

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-191, T-192
Rancangan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]]

## Kriteria selesai

- [ ] Definisi ukuran tertulis: berat, material, waste, waktu, biaya, margin, ketepatan kirim (rumus, sumber, pemilik)
- [ ] Layar pemantauan bersih: SPK berisiko telat, item diam, material kurang, selisih estimasi dan aktual dengan penyebab dugaan
- [ ] Angka dicocokkan dengan hitungan manual pada beberapa SPK; selisih dicatat sebagai bug
- [ ] Angka yang belum bisa dihitung ditulis belum ada data, bukan 0

## Bukti

- Belum.

## Catatan

Dikerjakan agen ops-monitor-analyst (definisi dan pemeriksaan) lalu erp-integrator (layar). Lokal dulu; tidak menyentuh production sebelum persetujuan eksplisit pemilik.
