---
type: task
id: T-184
title: "Muat data bahan baku (plat) 27 Oktober ke Supabase production"
phase: P2
epic: E-02
release: v0.9
status: done
priority: P1
env: production
effort_days: 1
depends: []
owner: "dev + pemilik"
updated: 2026-11-05
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-184 Muat data bahan baku ke production

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2

Permintaan pemilik: perbarui data plat di Gudang Bahan Baku yang sudah live; aplikasi tidak diubah, hanya datanya.

## Kriteria selesai

- [x] Cadangan data uji RM ke skema `arsip_20261105` (rm 3, mutasi 11, opname 1, PR 2)
- [x] Data uji RM dihapus (keputusan pemilik: bersihkan lalu muat bersih)
- [x] 23 item dari workbook `DATA RAW MATERIAL oktober` dimuat, stok awal bertanggal 2026-10-27, total stok 408
- [x] Pemilik memeriksa tampilan Gudang Bahan Baku di aplikasi live (dikonfirmasi sesuai, 2026-11-05)

## Bukti

`verified in database` (production `lggqigmvtefkquqjrjsb`): rm 23 baris, jumlah stok awal 408 sama dengan workbook, mutasi/opname/PR RM 0. Tampilan aplikasi live belum diperiksa (butuh login pemilik).

## Catatan

Ejaan "Almunium" di workbook ditulis "Aluminium"; ukuran diseragamkan `t x l x p`. Pemulihan: salin dari skema `arsip_20261105` bila perlu. Skema arsip boleh dihapus setelah pemilik puas. Tanggal stok awal memakai tanggal di workbook (27 Oktober), bukan 17 Oktober pada catatan lama.
