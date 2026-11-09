---
type: task
id: T-223
title: "Matriks rute produksi di Master Data (produk dan komponen x Work Centre)"
phase: P9
epic: E-16
release: v1.2
status: doing
priority: P1
env: dev
effort_days: 2
depends: [T-222]
owner: "dev + pemilik"
updated: 2026-11-09
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-223 Matriks rute produksi

Rancangan: [[documentation/RANCANGAN_ALUR_SPK_PLATE_PRODUKSI|RANCANGAN_ALUR_SPK_PLATE_PRODUKSI]]
Bergantung pada: T-222

## Kriteria selesai

- [x] Tab Master Data **Matriks rute**: satu layar, baris produk dan komponen (dari katalog berat dan aturan section), kolom Work Centre internal. Setiap baris menunjukkan sumber rute (**Kustom**, **Aturan khusus**, **Ikut produk**, **Belum ada rute**) dan urutan langkahnya
- [x] Mengubah centang pada baris komponen membuat rute kustom `PRODUK|BENTUK` untuk komponen itu saja; tombol **Pulihkan** menghapusnya (kembali ke aturan khusus atau rute produk). Rute minimal satu Work Centre. Perubahan ditolak bila SPK lama tanpa snapshot rute sudah punya catatan produksi dengan rute lama (penjaga `ruteDampak` yang sama dengan tab Rute produksi)
- [x] Banner bila rute memakai Work Centre yang tidak ada di Master Data (matriks dan Produksi Hari Ini); nama Work Centre yang hilang juga ditandai per baris
- [x] Komponen kecil yang belum ditetapkan tim (fish plate, bracket, separator, hold down, end stop, drop out, U channel, clevis) ikut rute ACCS sampai pemilik mengubahnya di matriks (keputusan 2026-11-09)
- [ ] Serah terima plate gudang ke produksi (antrian SPK menunggu plate, dokumen serah terima, status plate di SPK dan antrian produksi). Keputusan: peringatan saja, tidak mengunci produksi
- [ ] Cek Data: rute yang memakai Work Centre yang tidak ada, dan SPK terbit yang belum diserahi plate
- [ ] Laporan susut: kg estimasi dibanding kg real per SPK dan per bahan
- [ ] Verifikasi di Supabase production: daftar Work Centre di sana harus memuat nama langkah rute (Shearing, Punching, Bending, CNC Laser, Welding)

## Bukti

Tingkat bukti: `verified in browser` (mock) dengan katalog sintetis. Suite `matriksrute` MR-01..MR-07 di `tests/e2e/matriks-rute.mjs`. Tab Rute produksi yang lama tetap ada dan tidak diubah; keduanya menulis ke `master/rute_produksi` dengan kunci yang sama.

Batas yang jujur: daftar komponen di matriks butuh katalog berat terpasang (tanpa katalog hanya baris produk). Belum diuji dengan katalog perusahaan dan belum di Supabase.
