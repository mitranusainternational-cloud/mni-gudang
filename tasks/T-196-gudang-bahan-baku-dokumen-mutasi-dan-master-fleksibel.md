---
type: task
id: T-196
title: "Gudang Bahan Baku: dokumen semua mutasi, jenis material fleksibel, item nonaktif, kartu HP"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 3
depends: [T-172]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-196 Gudang Bahan Baku: dokumen semua mutasi, jenis material fleksibel, item nonaktif, kartu HP

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-172

## Kriteria selesai

- [x] Setiap mutasi (terima, pakai, opname, koreksi, ubah plate) mempunyai nomor dokumen (RCV, PK, OPN) dengan PDF dan Excel; pakai produksi memuat SPK, customer, dan berat
- [x] Riwayat mutasi dapat difilter jenis, periode, dan SPK, dan menautkan SPK
- [x] Jenis material fleksibel: ditambah, diganti nama, dinonaktifkan dari Master Data; perubahan master mengikuti semua modul terkait
- [x] Item tidak dihapus permanen (migration 13); diganti item nonaktif yang tersembunyi dari daftar dan pilihan form
- [x] Tampilan HP berupa kartu tanpa gulir samping; pustaka PDF dan Excel dibundel di `public/vendor` agar tidak bergantung CDN
- [ ] Dirilis ke production (menunggu persetujuan pemilik, lihat T-203)

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd dan sebelumnya), belum di `main`.
- Verified in browser (mock): regresi penuh 0 FAIL; Playwright desktop dan HP. Bukan bukti Supabase.

## Catatan

- Tanpa perubahan skema; field tambahan memakai kolom `data` jsonb (`rm.data.aktif`).
