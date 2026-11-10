---
type: audit
status: berjalan
updated: 2026-11-09
---

# Audit alur Master Data sampai Kinerja (2026-11-09)

Metode: satu SPK customer (Cable Tray Straight 300 x 100 x 3000, 10 pcs) dijalankan di mock dengan katalog lokal dari Terbit sampai Diterima customer, dengan snapshot angka di tiap modul. Bukti: `verified in browser` (mock). Belum diuji di Supabase.

## 1. Hasil per tahap

| Tahap | Hasil skenario | Status |
|---|---|---|
| Master Data → SPK | Rute item terbentuk dari rute produk (Shearing, Punching, Bending, Vendor ELG); kg estimasi 14,71 dan real 13,51 per pcs | Terhubung |
| SPK → kebutuhan plate | Status plate Menunggu; kebutuhan 6 lembar | Terhubung |
| Serah terima plate | Form terisi 6 lembar; setelah simpan status Lengkap; stok bahan baku turun 8,3 → 8,1 ton di Dashboard | Terhubung |
| Produksi | Antrian muncul berurutan di Shearing, Punching, Bending (10 pcs); stage berubah ke Siap ke vendor | Terhubung |
| Kirim ke vendor | Stage Di vendor; halaman vendor menampilkan 10 btg dan 0,1 ton di vendor | Terhubung |
| Kembali dari vendor | Stage Siap kirim, siapKirim 10 | Terhubung |
| Kirim ke customer | Stage Terkirim; Dashboard: 1 SJ, 0,1 ton, OTD 100% | Terhubung |
| Laporan | Kinerja & Analisa menghitung output per Work Centre; Kinerja Tim menghitung aktivitas per modul; Cek Data memberi skor | Terhubung |

## 2. Temuan

| ID | Temuan | Status |
|---|---|---|
| F-01 | Dua sumber massa jenis: kalkulator SPK memakai konstanta di kode, stok bahan baku memakai Master Data. Mengubah massa jenis di Master Data tidak mengubah berat SPK | Diperbaiki (satu sumber: Master Data; tabel di kode hanya cadangan) |
| F-02 | Jenis material item bahan baku hanya ditebak dari kata kunci di nama (6 item "Belum dikenali") | Diperbaiki (pilihan Jenis eksplisit di form Ubah) |
| F-03 | Tab Rute produksi dan Matriks rute menduplikasi fungsi | Diperbaiki (satu tab) |
| F-04 | Aturan section hanya memuat tujuh produk bawaan kode | Diperbaiki (semua produk Opsi SPK) |
| F-05 | Kolom W, H, L terlalu lebar | Diperbaiki |
| F-06 | Produksi Hari Ini membuka Work Centre pertama (kosong), bukan yang punya antrian | Diperbaiki (membuka Work Centre yang punya antrian) |
| F-07 | Nama langkah rute tidak sama dengan Work Centre master, antrian tidak muncul | Banner peringatan (T-223); cek Supabase production masih perlu |
| F-08 | Aturan khusus komponen (clamp, hanger, jointing, cover), pemetaan finishing ke vendor, dan material tanpa vendor (stainless, aluminium) tertanam di kode, tidak bisa diatur di Master Data | Diperbaiki (tab Aturan proses; bawaan tampil sebagai data) |
| F-09 | Gudang Barang Jadi tidak punya tampilan **siap kirim ke customer**; SPK customer tidak masuk gudang, hanya terlihat sebagai tahap di SPK | Diperbaiki (tab Siap kirim customer dengan ceklis dan Buat surat jalan langsung) |
| F-10 | SPK stok: barang masuk ke Gudang Barang Jadi stok lewat form Barang masuk manual setelah produksi, tidak otomatis | Diperbaiki (tab Siap masuk stok dengan tombol Terima) |
| F-11 | Serah terima WIP produksi ke vendor tidak punya antrian atau dokumen; hanya terbaca dari jumlah siap kirim | Terbuka |
| F-12 | SPK berstatus Selesai dan stage Terkirim saat surat jalan baru Dalam Perjalanan (qty kirim dihitung saat surat jalan dibuat) | Terbuka, perlu keputusan |
| F-13 | Tab Item SPK dan Judul section adalah katalog riwayat input teks bebas; menduplikasi input terstruktur | Terbuka |
| F-14 | Cek Data belum punya aturan untuk plate (lama belum diserahkan), rute (Work Centre hilang), dan WIP siap vendor yang lama menunggu | Terbuka |

## 3. Usulan pengerjaan berikutnya

1. Tab Master Data **Aturan proses** (F-08): aturan khusus komponen, pemetaan finishing ke vendor, dan material tanpa vendor jadi data yang bisa diatur.
2. Gudang Barang Jadi dua tampilan **Stok** dan **Siap kirim customer** (F-09), plus antrian **SPK stok siap masuk** (F-10).
3. Antrian **Siap dikirim ke vendor** dengan serah terima WIP (F-11).
4. Aturan Cek Data untuk plate, rute, dan WIP (F-14), dan laporan susut.
5. Keputusan F-12: kapan SPK dianggap Terkirim.
