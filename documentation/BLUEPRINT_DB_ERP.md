---
type: design
status: active
updated: 2026-11-07
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Cetak biru database ERP (empat alur integrasi)

Permintaan pemilik 2026-11-07: merapikan versi lokal menjadi sistem terintegrasi (peruntukan SPK, stok bahan baku otomatis, pipeline vendor, dashboard agregat) lalu menayangkannya tanpa merusak data production. Dikerjakan **berurutan, satu langkah per persetujuan**. Semua DDL tinggal di `apps/platform/supabase/draft/` dan **tidak diterapkan ke database mana pun** sebelum pemilik menyetujui ([[INTEGRATION_PATH]], [[documentation/DECISIONS|DECISIONS]]).

## 1. Kenyataan sistem yang menentukan rancangan

| Asumsi di permintaan | Kenyataan (dicek di kode dan migration) | Akibat pada rancangan |
|---|---|---|
| Next.js | Aplikasi aktif JavaScript biasa (`apps/gudang-logistik`) lewat Vite, Supabase sebagai backend | Frontend tidak diganti; view dan realtime dipakai dari kode yang ada |
| Tabel `spk` baru | `spk` sudah ada di production (`no` TEXT unik, `customer` TEXT, `po`, `status` Draft/Terbit/Selesai/Batal, `items` JSONB, `data` JSONB berisi `stokReq`) | Hanya **menambah** kolom dan batasan; tidak membuat ulang tabel |
| `master_customer`, `master_bahan_baku` | Tabel bernama `mcustomer` dan `rm` | Relasi memakai nama yang ada |
| Stok dipotong dari `master_bahan_baku` | Stok bahan baku adalah **turunan** buku `mutasi` (stok awal + jumlah delta); tidak ada kolom stok yang dipotong | Potong stok = menambah baris `mutasi` keluar; kolom stok tidak ditambah (dua sumber kebenaran pasti selisih) |
| Tabel `log_stok` | Fungsinya sudah dipegang `mutasi` (dengan audit di `audit_row`) | Tidak dibuat tabel kedua |
| Status "Proses/Berjalan" | Aplikasi memakai `Terbit` untuk berjalan; posisi barang diturunkan dari catatan produksi, vendor, kirim | Enum `posisi_barang` tidak disimpan di SPK; diturunkan di view (langkah 3) |
| Trigger potong stok saat Draft → Berjalan | Material sudah dihitung dan dicadangkan sebagai turunan (T-192); pengeluaran fisik tercatat saat bahan benar-benar keluar | Cadangan pada penerbitan, potong fisik pada pengeluaran bertanda SPK (lihat keputusan K-1) |

## 2. Urutan langkah

1. **Skema SPK dan kebutuhan bahan** (draf `apps/platform/supabase/draft/20240101000019_spk_peruntukan_materials.sql` (migration 19)): enum `spk_peruntukan` ('customer', 'stok_buffer'), `customer_id` terhubung ke `mcustomer`, batasan (customer dan PO wajib untuk SPK customer terbit, stok tanpa customer, status valid, nomor angka), pemicu penjaga peruntukan dan nomor setelah terbit, tabel `spk_materials` (kebutuhan, cadangan, keluar per bahan dan item, unik per SPK-bahan-item, tanpa DELETE).
2. **Cadangan dan pemotongan stok di database**: pemicu saat SPK Draft → Terbit memeriksa stok tersedia (stok minus cadangan SPK lain) dan menulis cadangan; pengeluaran fisik tetap baris `mutasi` (sudah dijaga draf 17 agar stok tidak negatif dan diserialkan per item).
3. **Pipeline posisi dan vendor**: tabel `vendor_finishing_jobs` hanya bila perlu; saat ini `vendor` (dokumen kirim ke vendor dengan `items[].q/kembali/reject`) sudah memuat kirim dan kembali. View menurunkan posisi barang dan angka "kembali/kirim"; aturan SPK tidak boleh Selesai bila barang di vendor belum kembali.
4. **View agregasi dashboard dan realtime**: view untuk bahan baku kritis, SPK berjalan, progres, OTD; realtime hanya pada tabel yang perlu (`spk`, `vendor`, `produksi_log`).

## 3. Langkah 1: keputusan rancangan

- **Tambah, jangan ganti:** tidak ada DROP atau ubah tipe; aplikasi yang berjalan sekarang tetap bisa menyimpan SPK karena pemicu menyelaraskan `peruntukan` dengan `data.stokReq`.
- **Batasan NOT VALID:** aturan berlaku untuk baris baru dan yang diubah; baris lama tidak dipaksa. Setelah data lama dirapikan (daftar periksa ada di akhir berkas SQL) baru di-`VALIDATE`.
- **Customer tertaut:** `customer_id` diisi dari kecocokan nama persis dengan master customer aktif dan tidak ambigu; yang tidak cocok dibiarkan kosong dan dilaporkan, tidak ditebak.
- **Peruntukan dan nomor terkunci setelah terbit:** mengubahnya setelah produksi merusak stok dan penagihan.
- **`spk_materials`:** `qty_dicadangkan <= qty_butuh`, `qty_keluar <= qty_butuh`; unik per (SPK, bahan, item) selama tidak batal; tanpa kebijakan DELETE (batal lewat status); RLS mengikuti modul `spk` dan `bahan-baku`; audit dan stempel waktu seperti tabel lain.

## 4. Keputusan yang menunggu pemilik

- **K-1 Kapan stok bahan dipotong:** (a) cadangan saat Terbit, potong fisik saat pengeluaran bertanda SPK (disarankan: stok fisik tetap cocok dengan rak, SPK dibatalkan tinggal melepas cadangan); atau (b) potong langsung saat Terbit (stok fisik di sistem turun walau bahan belum diambil, pembatalan dan revisi perlu mutasi pembalik).
- **K-2 Customer wajib terdaftar:** SPK customer terbit harus memakai nama yang ada di master customer (tidak boleh teks bebas). Apakah ada SPK lama dengan nama customer tidak cocok yang harus dirapikan lebih dulu?
- **K-3 PO wajib** untuk SPK customer terbit: apakah ada SPK customer yang sah tanpa PO (mis. sampel, komplain)? Bila ada, perlu nilai khusus dan bukan dikosongkan.
- **K-4 Penerapan:** draf ini diuji dulu di project dev atau branch Supabase (bukan production), lalu rilis bertahap sesuai [[INTEGRATION_PATH]].

## 5. Status bukti

`source-level` saja: berkas SQL ditulis dan ditinjau terhadap skema production yang dibaca (kolom `spk`), belum dijalankan di database mana pun. Daftar uji ada di akhir berkas SQL.
