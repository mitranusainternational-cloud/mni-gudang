---
type: rencana-rilis
status: draf-menunggu-persetujuan
updated: 2026-11-11
---

# Rencana rilis WMS (draf, TIDAK dijalankan)

**Tidak ada yang dirilis, di-push, di-merge, atau diubah di Supabase dan Vercel sampai pemilik menyetujui tertulis di percakapan.** Dokumen ini hanya rencana. Mengikuti [[RENCANA_RILIS_BERTAHAP_2026-11-10]] dan [[documentation/INTEGRATION_PATH]].

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

## 7. Status persiapan (2026-11-12) — belum rilis

Pemilik menyetujui **persiapan** rilis, bukan rilisnya. Tidak ada push, PR, merge, migration, atau perubahan Supabase dan Vercel.

| Syarat | Status |
|---|---|
| Cabang bersih terhadap `main` | **Ya.** `main` tetap 191eec9, lokal unggul 30 commit, `git merge-tree` tanpa konflik |
| Baseline data production (baca saja) | **Selesai.** Jumlah baris dan md5 22 tabel di `data/private-sources/backup-prod-2026-11-12/` (di luar Git). `produksi_log` = 0 baris, jadi mode admin tidak mengganggu data laporan mesin |
| Salinan data lengkap | **Belum.** Cara mudah: admin menekan **Unduh cadangan** di aplikasi live (tombol di Dashboard). Rilis tidak mengubah database, jadi baseline checksum cukup untuk membuktikan data utuh; salinan penuh tetap disarankan |
| Regresi penuh pada commit akhir | **Berjalan** di salinan beku (commit hitung ulang berat); sebelumnya 717 PASS, 0 FAIL |
| Uji hak akses realtime di Supabase dev | **Belum.** Perlu login nyata (OTP email) oleh pemilik; bisa dilakukan di Vercel preview setelah PR dibuka |
| Skenario uji pemilik ([[SKENARIO_UJI_PEMILIK]]) | **Belum dijalankan** |
| Persetujuan eksplisit per tahap (push, PR, merge) | **Belum** |

Perhatian khusus rilis ini: **Hitung ulang berat** (Cek Data) mengubah data SPK production yang belum selesai. Tombol itu baru ada setelah rilis; menekannya adalah tindakan data terpisah yang butuh persetujuan lagi, dengan baseline checksum baru sebelumnya. Dari salinan backup: 12 SPK, 46 item berubah, tonase 5.253 kg menjadi 7.658 kg.

## 8. Draf deskripsi PR (belum dikirim)

**Judul:** WMS penuh: hapus Penawaran dan Sales Order, laporan produksi satu admin, bahan baku dan PR otomatis, susut, laporan satu pintu

**Ringkasan:** lingkup proyek menjadi WMS. Tanpa migration database baru.

- Dihapus: Penawaran, Sales Order, peran Sales (tidak bisa dipilih), mesin harga, galat 404 `penawaran` dan `salesorder` di konsol.
- SPK: editor versi sebelumnya, kebutuhan plat tampil di editor sebelum Terbit, tebal di surat jalan dan dokumen terkait, status Terkirim memisahkan deskripsi item kembar.
- Produksi: laporan hasil oleh satu admin (qty dan tonase per tebal, tipe, material), Kinerja & Analisa tanpa tab per Work Centre, mode per mesin tetap ada (`produksiAdmin=false`).
- Bahan baku: PR otomatis berstatus **Draf** (diajukan oleh user), waste tidak dihitung ganda (berat estimasi Excel sudah memuat waste), Serahkan semua, tab Susut, Hitung ulang berat SPK yang belum selesai.
- Barang jadi, vendor, sparepart: Terima semua, Siap dikirim ke vendor dengan batas jumlah, PR sparepart otomatis (Draf), lonjakan pemakaian.
- Pengguna dan tim: hak akses berlaku seketika, hasil produksi per orang di Kinerja Tim, menu Laporan, Tindakan hari ini.

**Bukti:** lint 0 error, uji unit 203 PASS, regresi penuh 32 suite 717 PASS 0 FAIL (commit sebelum hitung ulang berat); validasi data nyata pada salinan backup di mock.

**Risiko:** PR otomatis (matikan dengan `prOtomatis=false`); hak akses realtime baru terbukti di mock; hitung ulang berat mengubah data (aksi terpisah).

**Rollback:** promosikan deployment Vercel sebelumnya (191eec9) atau revert merge; tanpa perubahan skema.
