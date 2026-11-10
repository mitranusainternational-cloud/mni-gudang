---
type: task
id: T-200
title: "Tren pergerakan stok (sparepart dan barang jadi) dan rencana pembelian PR sparepart"
phase: P2
epic: E-10
release: v1.1
status: review
priority: P2
env: dev
effort_days: 2
depends: [T-197, T-198]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-200 Tren pergerakan stok (sparepart dan barang jadi) dan rencana pembelian PR sparepart

Epic: [[roadmap/epics/E-10-kualitas-data-dan-kontrol-stok|E-10]]
Fase: P2
Bergantung pada: T-197, T-198

## Kriteria selesai

- [x] Tab Tren: grafik masuk dan keluar per bulan, sparkline per baris, label Naik, Turun, Stabil, Data baru (riwayat kurang dari 45 hari), Tidak bergerak
- [x] Kartu stok per item memuat tren pakai, keluar 30 hari, rata-rata per bulan, cukup untuk berapa hari, grafik pergerakan, dan grafik per bulan
- [x] Rencana pembelian sparepart: usulan sampai buffer (2x minimum bila buffer kosong) dikurangi yang sudah dipesan; buat PR (`pr.data.gudang=sp`), tandai dipesan, Excel, terima menambah stok
- [ ] Ambang tren (25 persen) dan pengali 2x minimum divalidasi pemilik data (lihat T-113)

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd).
- Verified in browser (mock): SP-18 sampai SP-21 lulus.

## Catatan

- Kebijakan `pr` untuk modul sparepart ada di draf migration 18.
