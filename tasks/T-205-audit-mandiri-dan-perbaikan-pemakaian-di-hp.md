---
type: task
id: T-205
title: "Audit mandiri dan perbaikan pemakaian di HP (kartu per item, form tanpa terpotong)"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-196]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-205 Audit mandiri dan perbaikan pemakaian di HP (kartu per item, form tanpa terpotong)

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-196

## Kriteria selesai

- [x] Audit baca-saja production dan uji aplikasi di layar 390 px; lima temuan nyata dicatat (tabel selebar 1.237 px, Qty terpotong di form Terima, Pakai, surat jalan, kirim vendor, kolom opname di luar layar, tombol di bawah 32 px)
- [x] Posisi stok bahan baku di HP menjadi kartu per item; form Terima, Pakai, surat jalan, kirim vendor, dan opname tanpa isian terpotong; tombol minimal 36 sampai 40 px
- [x] Audit otomatis 11 form utama di 6 modul pada 390 px: 0 isian terpotong; desktop tidak berubah
- [x] Kartu per produk di HP untuk Posisi stok barang jadi dengan kotak ceklis SPK stok (2026-11-06)
- [ ] Dicoba pada perangkat HP nyata oleh tim lapangan

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd dan sebelumnya).
- Verified in browser (mock, Playwright 390 px); regresi tampilan 72 lulus. Pemeriksaan production hanya baca: penasihat keamanan 8 peringatan fungsi bantu RLS yang disengaja ditambah proteksi password bocor belum aktif.

## Catatan

- Rekomendasi audit yang dikerjakan: T-208 (pustaka lokal), T-196 (nonaktif), T-206 (draf anti stok negatif). Yang menunggu pemilik: backup terjadwal (T-061), Dependabot (T-166), proteksi password bocor (T-047).
