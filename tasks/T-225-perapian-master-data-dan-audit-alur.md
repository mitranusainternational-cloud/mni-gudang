---
type: task
id: T-225
title: "Perapian Master Data (tanpa duplikasi, tanpa data tertanam) dan audit alur Master Data sampai Kinerja"
phase: P9
epic: E-16
release: v1.2
status: doing
priority: P1
env: dev
effort_days: 3
depends: [T-222, T-223, T-224]
owner: "dev + pemilik"
updated: 2026-11-09
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-225 Perapian Master Data dan audit alur

Audit: [[documentation/arsip/AUDIT_ALUR_2026-11-09|AUDIT_ALUR_2026-11-09]]

## Kriteria selesai

- [x] Kolom W, H, L di editor SPK ringkas (sekitar 64 px masing-masing), kolom Lubang terpisah
- [x] **Satu tab Rute produksi** (matriks produk dan komponen x Work Centre); tab Matriks rute dan tabel rute lama yang menduplikasi dihapus beserta kodenya
- [x] **Jenis material dan item bahan baku** dihubungkan eksplisit: form Ubah item punya pilihan Jenis material; item tanpa pilihan tetap ditebak dari kata kunci nama; penjelasan perbedaan Jenis material (massa jenis) dan Item bahan baku (barang gudang) di layar
- [x] **Aturan section** memuat semua produk dari Opsi SPK, bukan hanya tujuh produk bawaan kode
- [x] Satu sumber massa jenis: kalkulator SPK (kg estimasi dan real, dan baris teks bebas) memakai massa jenis Master Data lewat pengait; tabel di kode hanya cadangan bila Master Data tidak mengenali bahan. Diuji K-10, K-11 (unit) dan MD-06 (e2e)
- [x] Produksi Hari Ini membuka Work Centre yang punya antrian bila belum ada pilihan tersimpan (F-06). Diuji SP-07
- [x] Tab **Aturan proses** di Master Data (F-08): pemetaan finishing ke vendor, material tanpa vendor finishing, dan aturan khusus komponen (kata kunci, produk, rute, mesin alternatif, urutan prioritas) bisa diatur; bawaan tampil sebagai data yang bisa diubah, konfigurasi Master Data menggantikannya, dan Pulihkan bawaan. Validasi nama Work Centre, penolakan bila mengubah rute SPK lama yang sudah punya catatan produksi, dan pemeriksaan tiap Finishing di Opsi SPK (vendor jelas atau Belum dikenali). Diuji R-100..R-104 (unit) dan AP-01..AP-06 (e2e)
- [x] Gudang Barang Jadi: tab **Siap kirim customer** (turunan SPK customer, ceklis SPK lalu Buat surat jalan langsung, gabungan satu customer) dan tab **Siap masuk stok** (SPK stok selesai, tombol Terima). Diuji GK-01..GK-10 (F-09, F-10)
- [ ] Antrian Siap dikirim ke vendor dan serah terima WIP (F-11)
- [ ] Aturan Cek Data untuk plate, rute, dan WIP (F-14)

## Bukti

Tingkat bukti: `verified in browser` (mock). Suite `masterdata` MD-01..MD-05 (6 PASS) di `tests/e2e/master-data.mjs`; `matriksrute` dan `spkstruktur` disesuaikan ke satu tab rute; regresi penuh 29 suite, 0 FAIL. Audit alur dijalankan sebagai skenario satu SPK dari Terbit sampai Diterima customer (hasil di dokumen audit).

Batas yang jujur: belum diuji dengan katalog perusahaan dan Supabase.
