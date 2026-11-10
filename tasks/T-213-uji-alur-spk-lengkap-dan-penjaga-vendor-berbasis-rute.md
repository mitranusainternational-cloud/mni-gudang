---
type: task
id: T-213
title: "Uji alur SPK lengkap (customer, stok, tanpa vendor) dan penjaga vendor berbasis rute"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-199, T-212]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-213 Uji alur SPK lengkap dan penjaga vendor berbasis rute

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-199, T-212
Kebutuhan: [[PRD_GUDANG]] bagian 5 dan 6, [[PRD_PRODUKSI]]

Permintaan pemilik: uji semua modul mulai dari buat SPK, ke vendor, ke customer; SPK stok, ke vendor, ke customer; dan SPK tanpa vendor (material stainless steel dan aluminium); sesuaikan bila ada yang tidak cocok.

## Kriteria selesai

- [x] Suite `alur-lengkap.mjs` (31 uji, UI sungguhan) untuk empat jenis alur: **A** SPK customer galvanis (produksi tiga mesin, pakai bahan baku, vendor ELG, dua surat jalan partial), **B** SPK stok galvanis (produksi, vendor, terima di gudang barang jadi, keluar ke customer, penolakan keluar melebihi stok), **C** SPK customer stainless tanpa vendor (produksi lalu langsung surat jalan), **D** SPK stok aluminium tanpa vendor (produksi lalu langsung masuk gudang)
- [x] Rute mengikuti judul section: galvanis menambah langkah Vendor ELG; stainless, aluminium, dan Non Finishing tanpa vendor
- [x] **Bug diperbaiki:** SPK yang rutenya memuat Vendor ELG tampil "Siap kirim" dan boleh dikirim ke customer atau diterima gudang sebelum finishing di vendor. Kini hanya yang sudah kembali dari vendor; tahap baru **Siap ke vendor**
- [x] SPK stok memakai kalkulator berat bila katalog terpasang (sebelumnya selalu 0 kg)
- [x] Perilaku SPK lama (tanpa catatan produksi per mesin) tidak berubah; rute tanpa vendor tetap memakai produksi efektif dikurangi yang di vendor ditambah kembali
- [ ] Keputusan pemilik: perlakuan SPK galvanis aktif di production yang produksinya tidak tercatat per mesin (tetap lolos lewat aturan lama), lihat [[T-199-spk-stok-alur-ujung-ke-ujung]]

## Bukti

- `verified in browser` (mock, Playwright): `alur-lengkap.mjs` 31 lulus tiga kali berturut-turut; regresi penuh 0 FAIL (lihat [[AUDIT_PROGRESS_2026-11-07]]).
- Bukan bukti Supabase.

## Catatan

Dalam skenario D dan B-02, kalkulator berat ditiru lewat stub karena katalog asli tidak ada di Git. "Satu lagi" pada permintaan pemilik ditafsirkan sebagai SPK tanpa vendor (C dan D); bila maksudnya alur lain, tambahkan sebagai skenario E. Perubahan penjaga mengubah perilaku di production begitu dirilis ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]]).
