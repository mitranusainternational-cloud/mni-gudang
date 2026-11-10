---
type: panduan
status: aktif
updated: 2026-11-10
---

# Cara sistem membaca rute produksi per item (dan cara mengaturnya)

Pertanyaan pemilik: SPK berisi item A dan item B, lewat Work Centre (WC) yang berbeda. Bagaimana sistem membaca dan mengatur supaya progres akurat dan tidak ada data yang terlewat?

## 1. Rute ditentukan per item, bukan per SPK

Setiap item mendapat rutenya sendiri saat SPK terbit, dengan urutan prioritas (yang pertama cocok menang):

1. **Rute kustom di item** (diatur di Master Data › Rute produksi, baris komponen, atau dicentang per komponen).
2. **Aturan khusus komponen** (Master Data › Aturan proses): kata di nama item, misalnya clamp atau hanger, jointing, cover.
3. **Rute standar produk** dari judul section (CABLE TRAY, CABLE LADDER, ACCS TRAY, dan seterusnya).
4. Tidak cocok sama sekali: item **tanpa rute**.

Rute disalin (snapshot) ke item saat SPK terbit. Mengubah Master Data sesudahnya tidak menggeser SPK yang sedang berjalan.

## 2. Progres dihitung per item per langkah

- Operator mencatat **hasil di sebuah WC untuk sebuah item** (jumlah selesai, reject).
- Item A rute Shearing, Punching, Bending: antrian Punching = yang sudah lolos Shearing dikurangi yang sudah selesai di Punching.
- Item B rute CNC Laser, Bending, Welding dihitung terpisah. Dua item hanya bertemu bila memakai WC yang sama (mis. Bending), dan di sana tiap item punya antrian dan progresnya sendiri.
- Jumlah yang dicatat tidak boleh melebihi yang tersedia dari langkah sebelumnya. Reject tidak lanjut dan kembali menambah antrian langkah pertama.
- Progres item = yang lolos langkah mesin terakhir. Finishing vendor dilacak lewat dokumen vendor.

## 3. Yang dilihat operator dan supervisor

| Layar | Isi |
|---|---|
| Produksi Hari Ini (per WC) | Antrian siap dikerjakan, dan **Akan datang ke WC** (item yang rutenya lewat sini tetapi belum sampai, lengkap dengan posisi sekarang) |
| Kinerja & Analisa › Progres WC | Tabel progres item per WC, matriks semua SPK × WC, CSV |
| Kinerja & Analisa › Work Center | Output, kapasitas, utilisasi, beban antrian |
| Cek Data | Peringatan SPK dengan item **tanpa rute** atau rute memakai **WC yang tidak ada** |

## 4. Titik rawan dan penjagaannya

| Risiko | Penjaga |
|---|---|
| Nama WC di rute beda dengan Master Data (mis. CNC Cutting vs CNC Laser) | Banner di Produksi Hari Ini dan Rute produksi, tombol **Tambahkan otomatis**, peringatan di Cek Data |
| Item tanpa rute tidak muncul di antrian mana pun | Cek Data tingkat tinggi per SPK; judul section harus memuat produk |
| Operator mencatat di WC di luar rute item | Ditolak validasi urutan; sistem mengusulkan menambah langkah bila memang terjadi |
| Jumlah melebihi yang tersedia | Validasi `periksaMasukan` menolak |
| Salah input | Catatan dapat dibatalkan (tetap tersimpan sebagai riwayat, tidak dihitung) |

## 5. Langkah setup yang disarankan (sekali, sebelum dipakai operator)

1. Master Data › **Work Centre**: pastikan ada Shearing, Punching, Bending, CNC Laser, Welding (nama persis sama dengan langkah rute). Bila banner muncul, tekan Tambahkan otomatis. Isi mesin dan kapasitas per hari.
2. Master Data › **Rute produksi**: periksa rute tiap produk dan komponen. Centang WC yang dilewati.
3. Master Data › **Aturan proses**: periksa aturan khusus (clamp, hanger, jointing, cover) dan pemetaan finishing ke vendor.
4. Terbitkan satu SPK uji dengan item beda rute, lalu cek di Produksi Hari Ini tiap WC dan di Progres WC.
5. Buka **Cek Data**: tidak boleh ada peringatan Produksi.

Uji otomatis: suite `produksihh` (PH-01 sampai PH-17), `matriksrute`, dan `produksi`. Bukti `verified in browser` pada mock; belum diuji di Supabase.
