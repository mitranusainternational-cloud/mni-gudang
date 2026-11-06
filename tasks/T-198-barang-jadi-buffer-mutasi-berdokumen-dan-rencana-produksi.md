---
type: task
id: T-198
title: "Gudang Barang Jadi: buffer, mutasi berdokumen tertaut SPK, rencana produksi stok"
phase: P2
epic: E-10
release: v1.1
status: review
priority: P1
env: dev
effort_days: 2
depends: [T-196]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-198 Gudang Barang Jadi: buffer, mutasi berdokumen tertaut SPK, rencana produksi stok

Epic: [[roadmap/epics/E-10-kualitas-data-dan-kontrol-stok|E-10]]
Fase: P2
Bergantung pada: T-196

## Kriteria selesai

- [x] Buffer per produk (`fg.data.buffer`), status Di bawah buffer, hitungan di ringkasan dan filter
- [x] Riwayat mutasi barang jadi dengan nomor dokumen BJ-M dan BJ-K, PDF dan Excel, filter periode dan SPK
- [x] Barang keluar tertaut SPK: customer terisi otomatis, laci SPK memuat "Barang jadi terkait SPK ini"
- [x] Tab Rencana produksi: usulan qty = buffer dikurangi stok dan yang sedang diproduksi lewat SPK stok

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd).
- Verified in browser (mock): SP-17 sampai SP-26 lulus; regresi penuh 0 FAIL.

## Catatan

- Tanpa migration: buffer di kolom `data` jsonb.
