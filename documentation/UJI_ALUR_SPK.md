---
type: test
status: review
updated: 2026-11-05
---

# Uji Alur Lengkap SPK (awal sampai akhir)

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

Tanggal uji: 2026-11-05
Tingkat bukti: `verified in browser` (mode mock, Chromium headless). **Bukan bukti Supabase.**
Skrip: `apps/platform/tests/e2e/alur-spk.mjs` (`node tests/e2e/alur-spk.mjs [url] [folder]`). Hasil: **15 PASS, 0 FAIL**.
Tugas: [[T-181-uji-alur-spk-awal-sampai-akhir]]. Kebutuhan terkait: [[PRD_PRODUKSI]], [[RUTE_PRODUKSI]].

## Skenario

Satu SPK baru, satu item **Cable Tray W100xH100xL3000 1.2, 20 Btg**, customer *PT Alur Lengkap Sejahtera*. Rute otomatis dari produk: Shearing, Punching, Bending, lalu Vendor ELG. Semua langkah dikerjakan lewat layar yang dipakai pengguna sebenarnya (tanpa menulis data langsung ke database).

| No | Tahap | Layar | Hasil yang diperiksa | Uji |
|---|---|---|---|---|
| 1 | SPK dibuat dan diterbitkan | SPK Berjalan, Daftar SPK | SPK 1003 tersimpan dan terbit | A-01 |
| 2 | SPK baru di Jadwal | SPK Berjalan, tab Jadwal | Status Belum mulai, batang rencana terbit sampai due | A-02 |
| 3 | Item masuk antrian | Produksi Hari Ini, Shearing | Rute Shearing > Punching > Bending > Vendor ELG | A-03 |
| 4 | Shearing: Mulai lalu Selesai | Produksi Hari Ini | Hasil 20 tercatat dengan jam mulai dan durasi | A-04 |
| 5 | Jadwal menandai mulai produksi | Jadwal | Batang produksi muncul tanpa input di halaman jadwal | A-05 |
| 6 | Punching: Mulai lalu Selesai | Produksi Hari Ini | 20 tercatat, item pindah otomatis ke antrian Punching | A-06 |
| 7 | Bending: Mulai lalu Selesai | Produksi Hari Ini | 20 tercatat, seluruh langkah internal selesai | A-07 |
| 8 | Progres produksi 100% | SPK Berjalan, Jadwal | Muncul sebagai Siap kirim; item 20 Btg 100% | A-08 |
| 9 | Kirim ke Vendor | Kirim ke Vendor | Kolom kirim terisi 20 sesuai hasil produksi; dokumen tersimpan | A-09, A-10 |
| 10 | Terima kembali dari vendor | Kirim ke Vendor | Status vendor Selesai | A-11 |
| 11 | Surat jalan customer | Kirim ke Customer | Surat jalan dibuat | A-12 |
| 12 | Berangkat lalu Diterima | Kirim ke Customer | Status Diterima | A-13 |
| 13 | SPK selesai | Jadwal | Keluar dari filter Berjalan, muncul di filter Selesai | A-14 |
| 14 | Tanpa galat skrip | seluruh alur | 0 pageerror | A-15 |

## Tangkapan layar berurutan

### 1. Buat dan terbitkan SPK
![[screenshots/alur-spk/01-form-spk-terisi.png]]
![[screenshots/alur-spk/02-daftar-spk-terbit.png]]

### 2. Jadwal: belum mulai
![[screenshots/alur-spk/03-jadwal-belum-mulai.png]]

### 3. Produksi: antrian dan Shearing
![[screenshots/alur-spk/04-antrian-shearing.png]]
![[screenshots/alur-spk/05-shearing-sedang-dikerjakan.png]]
![[screenshots/alur-spk/06-shearing-isi-jumlah.png]]
![[screenshots/alur-spk/07-jadwal-setelah-shearing.png]]

### 4. Punching dan Bending
![[screenshots/alur-spk/08-antrian-bending-siap-20.png]]
![[screenshots/alur-spk/09-produksi-hari-ini-setelah-bending.png]]

### 5. Produksi selesai
![[screenshots/alur-spk/10-spk-berjalan-produksi-selesai.png]]
![[screenshots/alur-spk/11-jadwal-produksi-selesai-item-dibuka.png]]

### 6. Vendor
![[screenshots/alur-spk/12-form-kirim-vendor.png]]
![[screenshots/alur-spk/13-daftar-vendor-di-vendor.png]]
![[screenshots/alur-spk/14-jadwal-di-vendor.png]]
![[screenshots/alur-spk/15-sheet-vendor.png]]
![[screenshots/alur-spk/16-form-terima-kembali.png]]

### 7. Pengiriman ke customer
![[screenshots/alur-spk/17-form-surat-jalan.png]]
![[screenshots/alur-spk/18-daftar-pengiriman.png]]
![[screenshots/alur-spk/19-sheet-surat-jalan-customer.png]]
![[screenshots/alur-spk/19b-pengiriman-berangkat.png]]
![[screenshots/alur-spk/20-pengiriman-diterima.png]]

### 8. SPK selesai
![[screenshots/alur-spk/21a-jadwal-filter-berjalan-spk-hilang.png]]
![[screenshots/alur-spk/21-jadwal-spk-selesai.png]]
![[screenshots/alur-spk/21b-jadwal-item-spk-selesai.png]]
![[screenshots/alur-spk/22-detail-spk-selesai.png]]
![[screenshots/alur-spk/23-kinerja-analisa.png]]
![[screenshots/alur-spk/24-produksi-hari-ini-akhir.png]]

## Temuan dan batasan

- Seluruh alur dikerjakan pada **satu hari**, sehingga batang di Jadwal sangat pendek. Pada pemakaian nyata batang memanjang mengikuti tanggal tiap kejadian.
- Jadwal memakai filter awal **Berjalan**; SPK yang sudah selesai hilang dari tampilan itu dan baru terlihat di filter **Selesai** atau **Semua**. Ini sesuai rancangan, tetapi pemilik perlu tahu agar tidak mengira SPK hilang.
- Tombol status pengiriman (Berangkat, Tandai diterima) ada di baris daftar, bukan di lembar surat jalan.
- Uji ini memakai data contoh bawaan mock. Alur yang sama belum diuji di Supabase.

## Cara mengulang

```bash
cd apps/platform
VITE_LOCAL_MOCK=1 npx.cmd vite --host 127.0.0.1 --port 5173
node tests/e2e/alur-spk.mjs http://127.0.0.1:5173/
```
