---
type: task
id: T-142
title: "Uji unit untuk kalkulasi stok dan SPK"
phase: P10
epic: E-13
release: v2.0
status: todo
priority: P2
env: development
effort_days: 4
depends: [T-065]
owner: "dev"
updated: 2026-11-06
---

# T-142 Uji unit untuk kalkulasi stok dan SPK

Epic: [[roadmap/epics/E-13-modernisasi-frontend-dan-pengujian|E-13]] · Rilis v2.0 · Fase P10 v2.0 Modernisasi dan perluasan
Bergantung pada: T-065

## Kriteria selesai

- [ ] Fungsi kalkulasi memiliki uji dengan kasus tepi
- [ ] Berjalan di CI

## Bukti

- Belum ada.

## Catatan

- Tugas pasca go-live: lingkup dan prioritas ditinjau ulang setelah hypercare (T-065) dan temuan UAT.

> [!note] Audit 2026-11-06
> Uji unit sudah ada untuk berat, harga, produksi, kinerja, laporan, rencana, material, penawaran, dan Sales Order (266 lulus), tetapi belum untuk kalkulasi stok dan SPK di `calc()` karena fungsinya tinggal di `app.js`. Bagian ini butuh pemisahan modul (T-141).
