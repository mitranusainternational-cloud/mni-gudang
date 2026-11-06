---
type: task
id: T-199
title: "SPK stok ujung ke ujung: ceklis produk, filter jenis SPK, terima di gudang barang jadi, penjaga hasil produksi"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 2.5
depends: [T-198, T-174]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-199 SPK stok ujung ke ujung: ceklis produk, filter jenis SPK, terima di gudang barang jadi, penjaga hasil produksi

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-198, T-174

## Kriteria selesai

- [x] Buat SPK stok dari ceklis produk di Posisi stok (atau tombol SPK stok); SPK Draft customer STOK MNI dengan `stokReq`
- [x] Monitoring SPK: filter Semua SPK, SPK Customer, SPK Stok pada Daftar, Jadwal, dan Berjalan; chip SPK Stok
- [x] SPK stok tidak dikirim ke customer: tombol Terima di gudang barang jadi menghasilkan BJ-M tertaut SPK; progres dan timeline mengikuti barang masuk gudang
- [x] Barang jadi hanya bisa diterima bila SPK terbit dan hasil produksi selesai (dikurangi yang di vendor finishing)
- [x] Kirim ke customer dibatasi ke hasil produksi yang siap, dengan override tercatat (kirim lebih, wajib keterangan)
- [x] Perbaikan: teks progres di laci SPK ("N dari M item dikirim") memakai jumlah terkirim sebenarnya
- [ ] Keputusan pemilik: perlakuan SPK lama yang produksinya tidak pernah dicatat saat penjaga kirim aktif di production

## Bukti

- Commit/branch: `fitur/produksi-multi-wc` (4be17cd, merge main 35bf7f7).
- Verified in browser (mock): SP-23 sampai SP-35 lulus; regresi penuh setelah merge main 0 FAIL (42, 12, 34, 134, 35, 72).

## Catatan

- Penjaga kirim mengubah perilaku di production begitu dirilis: SPK yang produksinya belum dicatat tertahan sampai dicatat atau override dipakai. Hitungan: siap = produksi efektif - di vendor + kembali dari vendor.
