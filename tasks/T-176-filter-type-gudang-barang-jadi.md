---
type: task
id: T-176
title: "Filter Type di Gudang Barang Jadi (STU, STC, SLU, SLW, SLHD)"
phase: P2
epic: E-02
release: v0.9
status: done
priority: P2
env: dev
effort_days: 0.25
depends: []
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-176 Filter Type di Gudang Barang Jadi

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2

## Kriteria selesai

- [x] Dropdown **Semua type** setelah kategori; opsi mengikuti kategori terpilih, urutan baku STU, STC, SLU, SLW, SLHD lalu type lain; opsi **Tanpa type** untuk Cover dan Cable Cage
- [x] Ganti kategori yang tidak punya type terpilih mengembalikan type ke Semua
- [x] Uji e2e mock F-15 sampai F-18; regresi penuh 150 PASS, 0 FAIL (`source-level` dan mock, bukan bukti Supabase)
- [x] Dikerjakan di branch `fitur/filter-type-barang-jadi` dari `development`, terpisah dari produksi multi work center
- [x] PR 14 digabung ke `main` (commit 43e8da2) oleh pemilik; production memuat kode filter (`source-level`: berkas aplikasi di mni-gudang.vercel.app memuat f-type; tampilan belum dilihat penulis)

## Bukti

- `verified in browser` (mock): uji F-15 sampai F-18 lulus dan masih lulus pada regresi penuh 2026-11-07.
- `source-level` di production: berkas aplikasi di mni-gudang.vercel.app memuat filter Type (tayang lewat PR 14, CI hijau 2026-11-04). Tampilan di production belum dilihat penulis: belum `verified in browser` di production.
