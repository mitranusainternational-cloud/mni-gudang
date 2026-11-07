---
type: task
id: T-216
title: "SPK customer memakai stok gudang barang jadi sebagian"
phase: P9
epic: E-16
release: v1.2
status: todo
priority: P1
env: dev
effort_days: 3
depends: [T-214]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-216 SPK customer memakai stok gudang barang jadi sebagian

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-214

## Kriteria selesai

- [ ] Di SPK customer, per item pengguna memilih berapa yang diambil dari stok gudang barang jadi dan berapa yang diproduksi (jumlah bisa diubah)
- [ ] Bagian dari stok dicadangkan untuk SPK itu (stok tersedia berkurang) dan keluar otomatis lewat mutasi bertanda SPK saat dikirim; sisanya mengalir lewat produksi
- [ ] Progres, status Selesai, dan surat jalan menjumlahkan stok dan produksi tanpa hitung ganda; uji neraca stok

## Bukti

(belum ada)

## Catatan

Permintaan pemilik 2026-11-07. Perlu rancangan: reservasi stok barang jadi (seperti cadangan bahan baku), tampilan di editor SPK, dan aturan bila stok kurang saat dikirim.
