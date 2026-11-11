---
type: rencana-rilis
status: draf-menunggu-persetujuan
updated: 2026-11-11
---

# Rencana rilis WMS (draf, TIDAK dijalankan)

**Tidak ada yang dirilis, di-push, di-merge, atau diubah di Supabase dan Vercel sampai pemilik menyetujui tertulis di percakapan.** Dokumen ini hanya rencana. Mengikuti [[RENCANA_RILIS_BERTAHAP_2026-11-10]] dan [[release-pipeline]].

## 1. Apa yang berubah dibanding live

Cabang lokal `fitur/produksi-multi-wc` unggul puluhan commit dari `main` (live). Perubahan yang terlihat pengguna:

- **Dihapus:** Penawaran, Sales Order, peran Sales (tidak bisa dipilih), mesin harga, dan galat 404 `penawaran`/`salesorder` di konsol.
- **SPK:** editor input kembali ke versi sebelumnya (bawaan), tebal tampil di surat jalan dan dokumen terkait, status Terkirim memisahkan deskripsi item kembar.
- **Produksi:** laporan hasil oleh satu admin (tanpa tampilan per Work Centre), laporan qty dan tonase per tebal, tipe, material; Kinerja & Analisa tanpa tab per Work Centre.
- **Bahan baku:** PR otomatis saat SPK terbit, tab Susut, aturan Cek Data baru.
- **Barang jadi, vendor, sparepart:** Terima semua, panel Siap dikirim ke vendor dengan batas jumlah, PR sparepart otomatis, deteksi lonjakan pemakaian.
- **Pengguna dan tim:** hak akses berlaku seketika, Kinerja Tim memuat hasil produksi per orang.
- **Baru:** menu **Laporan** satu halaman dengan CSV, **Tindakan hari ini** di Dashboard.

## 2. Dampak database

- **Tidak ada migration baru.** Kolom tambahan PR (`auto`, `spk`, `gudang`) dan setting (`prOtomatis`, `produksiAdmin`) tersimpan di kolom `data` yang sudah ada. Draf migration 15 dan 16 dihapus (tidak pernah diterapkan di production).
- Draf 17 dan 19-23 **tidak ikut** rilis ini.
- Adapter kini mengambil ulang data pengguna (`muser`) pada tiap pengecekan hak: sedikit kueri tambahan; perlu dicek di Supabase dev.

## 3. Prasyarat sebelum rilis dibahas

1. Skenario uji pemilik ([[SKENARIO_UJI_PEMILIK]]) lolos, temuan diperbaiki.
2. Regresi penuh 0 FAIL pada commit akhir, plus lint 0 error dan uji unit lulus.
3. Perbaikan adapter hak akses diverifikasi di **Supabase dev** dengan login nyata (peran diubah, menu berubah).
4. Cadangan baru data production (semua tabel) disimpan di luar Git sebelum langkah apa pun.
5. Persetujuan eksplisit pemilik untuk tiap tahap di bawah.

## 4. Tahap (bila disetujui)

| Tahap | Tindakan | Gerbang |
|---|---|---|
| 0 | Cadangan baru semua tabel production (hanya membaca), catat jumlah baris | jumlah baris tercatat |
| 1 | Dorong cabang dan buka PR ke `main` | CI hijau (2 pekerjaan) |
| 2 | Merge ke `main` (butuh 1 approval; pemilik boleh `--admin` bila disetujui) | pemilik menyetujui |
| 3 | Vercel production otomatis membangun | deploy sukses, situs 200 |
| 4 | Verifikasi setelah login: menu, SPK live, surat jalan (tebal), Laporan, Kinerja Tim, konsol tanpa galat | semua sesuai, jumlah baris sama dengan cadangan |

## 5. Rollback

- **Kode:** di Vercel promosikan deployment sebelumnya (191eec9) atau revert merge di `main`; tanpa perubahan database tidak ada yang perlu dikembalikan.
- **Data:** tidak ada perubahan skema; cadangan Tahap 0 tersedia bila ada data yang berubah tak terduga.

## 6. Risiko yang diketahui

- PR otomatis membuat dokumen tanpa klik; dapat dimatikan lewat setting `prOtomatis=false`.
- Tonase dan susut bergantung berat per item; item tanpa berat ditandai di Cek Data, bukan dihitung nol diam-diam.
- Laporan per Work Centre dimatikan sementara; production masih punya Work Centre SHEARING dan CNC LASER saja, tidak berpengaruh pada mode admin.
- Peran `sales` lama di data pengguna tetap terbaca tetapi tidak bisa dipilih lagi.
