---
type: task
id: T-216
title: "SPK customer memakai stok gudang barang jadi sebagian"
phase: P9
epic: E-16
release: v1.2
status: review
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

- [x] Di SPK customer, per item pengguna memilih berapa yang diambil dari stok gudang barang jadi dan berapa yang diproduksi (jumlah bisa diubah)
- [x] Bagian dari stok dicadangkan untuk SPK itu (stok tersedia berkurang) dan keluar otomatis lewat mutasi bertanda SPK saat dikirim; sisanya mengalir lewat produksi
- [x] Progres, status Selesai, dan surat jalan menjumlahkan stok dan produksi tanpa hitung ganda; uji neraca stok

## Bukti

Tingkat bukti: `verified in browser` (mock lokal), bukan Supabase. Suite e2e `ambilstok` AM-01..AM-08 (13 PASS) di `tests/e2e/ambil-stok.mjs`.

Aturan yang berlaku:
- Item SPK customer membawa `fg` (produk Gudang Barang Jadi) dan `ambil` (jumlah dari stok; sisanya diproduksi). Editor SPK punya kolom **Dari stok**: pilih produk (yang cocok dengan nama item di urutan atas, stok tersedia ditampilkan) dan isi jumlah; petunjuk "tersedia n · produksi m".
- **Cadangan:** sejak SPK Terbit, `ambil` mengurangi stok *tersedia* (stok fisik tetap). SPK Draft tidak mencadangkan; SPK Batal melepas. Terbitkan atau revisi ditolak bila `ambil` melebihi qty order atau stok tersedia (stok dikurangi cadangan SPK lain); jumlah tidak bisa dikurangi di bawah yang sudah dikeluarkan.
- **Produksi:** target produksi dan vendor hanya qty − ambil; progres produksi dan "siap kirim" ditambah bagian stok. SPK Selesai tetap berarti semua sudah terkirim.
- **Keluar stok:** saat surat jalan customer dibuat, bagian stok (lebih dulu) keluar otomatis sebagai mutasi `keluar` bertanda SPK dan no surat jalan; pengiriman dari hasil produksi tidak menyentuh stok (tanpa hitung ganda). Membatalkan surat jalan membalik mutasi lewat koreksi.
- Kartu stok produk menampilkan Dicadangkan SPK dan Tersedia.

Batas yang jujur: pemeriksaan stok tersedia dilakukan di aplikasi (klien), tanpa penguncian di database; dua pengguna yang menerbitkan SPK bersamaan bisa sama-sama lolos. Pencocokan produk lewat pilihan manual atau kesamaan nama item. Belum ada draf migration untuk cadangan stok barang jadi di Supabase, dan cetak SPK belum menandai bagian dari stok.

## Catatan

Permintaan pemilik 2026-11-07. Perlu rancangan: reservasi stok barang jadi (seperti cadangan bahan baku), tampilan di editor SPK, dan aturan bila stok kurang saat dikirim.
