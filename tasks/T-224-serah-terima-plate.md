---
type: task
id: T-224
title: "Serah terima plate gudang ke produksi"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 2
depends: [T-221, T-223]
owner: "dev + pemilik"
updated: 2026-11-09
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-224 Serah terima plate gudang ke produksi

Rancangan: [[documentation/RANCANGAN_ALUR_SPK_PLATE_PRODUKSI|RANCANGAN_ALUR_SPK_PLATE_PRODUKSI]]
Bergantung pada: T-221, T-223

## Kriteria selesai

- [x] **Status plate per SPK** dari kebutuhan bruto (kg, dari kg estimasi) dibanding yang sudah dikeluarkan untuk SPK itu: **Menunggu**, **Sebagian**, **Lengkap**. Memakai angka yang sama dengan panel Kebutuhan material (`rencanaMaterial`), jadi tidak ada hitungan kedua
- [x] Tab **Serah terima plate** di Gudang Bahan Baku (jumlah SPK di label tab): SPK terbit yang plate-nya belum lengkap, kebutuhan sisa per bahan dan tebal (lembar dan kg), diserahkan dibanding kebutuhan, status, dan tombol **Serahkan ke produksi**
- [x] Tombol Serahkan membuka form **Pakai untuk produksi** yang sudah terisi (SPK, item plate utama per bahan dan tebal, qty = sisa lembar, tujuan Produksi, keterangan). Disimpan sebagai pengeluaran bertanda SPK dengan nomor dokumen PK; bisa sebagian; penjaga stok tidak cukup tetap berlaku
- [x] **Peringatan saja** (keputusan 2026-11-09): chip "Plate belum diserahkan" atau "Plate sebagian" di daftar SPK dan di kartu antrian Produksi Hari Ini; produksi tidak dikunci. Hilang otomatis setelah plate lengkap
- [ ] Cek Data: SPK terbit yang plate-nya belum diserahkan lewat batas waktu (batas belum ditetapkan)
- [ ] Laporan susut: kg estimasi dibanding kg real per SPK dan per bahan
- [ ] Verifikasi di Supabase production (mutasi keluar bertanda SPK dan nama langkah rute)

## Bukti

Tingkat bukti: `verified in browser` (mock). Suite `serahplate` SP-01..SP-06 di `tests/e2e/serah-plate.mjs` (7 PASS): status Menunggu, Sebagian, Lengkap; tab dan label; chip di daftar SPK dan antrian produksi; form terisi; hilang setelah lengkap. Regresi penuh dan lint dicatat di PROJECT_PROGRESS.

Batas yang jujur: kebutuhan plate hanya bisa dihitung untuk item yang beratnya diketahui (kalkulator atau manual) dan bahan yang punya item di Master Data (item tanpa itu tampil "tanpa item RM" dan tidak bisa diserahkan lewat form). Plate yang diserahkan dihitung dari mutasi keluar bertanda SPK, bukan dari lembar fisik per nomor SPK. Belum diuji dengan katalog perusahaan dan Supabase.
