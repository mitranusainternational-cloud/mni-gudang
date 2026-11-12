---
type: skenario-uji
status: siap-dicoba
updated: 2026-11-11
---

# Skenario uji untuk pemilik (lokal)

Tujuan: memastikan alur WMS berjalan dari SPK sampai kirim, dengan input minimal dan laporan yang cocok. Dijalankan **di lokal** (data contoh, bukan production). Pelengkap [[SKEMA_LANJUTAN_WMS_MINIM_INPUT]] dan [[RENCANA_PERBAIKAN_LOKAL]].

## Cara membuka

Di `apps/platform` jalankan `npx vite --host 127.0.0.1 --port 5173` dengan `VITE_LOCAL_MOCK=1` dan `VITE_KATALOG_LOKAL=1`, lalu buka http://127.0.0.1:5173. Masuk otomatis sebagai Admin Lokal (super admin). Data contoh tersimpan di browser; hapus data situs untuk mengulang dari awal.

## Skenario

Tiap skenario: **lakukan** lalu **harus terlihat**. Catat hasilnya (lulus atau tidak) di kolom terakhir.

| # | Skenario | Lakukan | Harus terlihat | Hasil |
|---|---|---|---|---|
| 1 | SPK customer sampai terkirim | SPK Berjalan > SPK baru, isi item (berat otomatis dari katalog), Terbitkan. Produksi Hari Ini > Isi hasil, isi jumlah selesai. Kirim ke Customer > buat surat jalan | Dashboard **Tindakan hari ini** menampilkan tiap tahap; status SPK Terkirim hanya setelah semua item terkirim; surat jalan memuat tebal (t X mm) | |
| 2 | Permintaan bahan baku otomatis | Isi item SPK (berat otomatis dari katalog) dengan qty besar sampai melebihi stok, lihat footer editor, lalu Terbitkan | Editor SPK menampilkan kebutuhan plat (kg dan lembar), stok tersedia, dan kekurangan sebelum Terbit; setelah terbit muncul **PR berstatus Draf** di Gudang Bahan Baku (bertanda Otomatis, memuat nomor SPK, belum ada pengaju); tekan **Ajukan** (pengaju tercatat atas nama Anda, status Diajukan, tombol Terima baru muncul); menerbitkan ulang tidak membuat PR dobel; bahan tanpa item RM diberi peringatan | |
| 3 | Serah plate dan susut | Gudang Bahan Baku > Serah terima plate > Serahkan; isi hasil produksi item sampai selesai | Tab **Susut** menilai Wajar atau Berlebih per bahan dan tebal; susut berlebih muncul di Cek Data | |
| 4 | SPK stok | Gudang Barang Jadi > buat SPK stok; terbitkan; isi hasil | Tab Siap masuk stok > **Terima semua** mencatat barang masuk; stok bertambah; tombol hilang | |
| 5 | Vendor | Item dengan rute vendor dilaporkan selesai | Kirim ke Vendor > panel **Siap dikirim ke vendor**; kirim melebihi selesai **ditolak**; Terima kembali mengurangi yang di vendor | |
| 6 | Banyak SPK satu armada | Gudang Barang Jadi > Siap kirim customer > centang beberapa SPK satu customer > Buat surat jalan | Satu surat jalan memuat semua SPK; tiap SPK berubah sendiri | |
| 7 | Sparepart | Gudang Sparepart > Keluar (mesin, pengambil) sampai stok di bawah minimum | PR sparepart otomatis; Cek Data memberi info bila pemakaian melonjak | |
| 8 | Pengguna & Akses realtime | Pengguna & Akses > ubah peran akun yang sedang dipakai (atau hak modul) | Menu berubah **seketika** tanpa muat ulang dan muncul "Hak akses Anda diperbarui"; peran Sales tidak ada di pilihan | |
| 9 | Kinerja Tim dan KPI | Isi hasil produksi atas nama satu pengguna | Kinerja Tim menambah **Hasil produksi** (pcs dan kg) atas nama pengguna itu; Aktivitas bertambah | |
| 10 | Laporan satu pintu | Menu **Laporan**, ganti periode, Unduh CSV | Tujuh bagian; angka sama dengan layar sumbernya (mis. Hasil produksi = Kinerja & Analisa > Laporan Produksi); CSV terunduh | |
| 11 | Kesehatan data | Buka Cek Data | Tidak ada galat; temuan menyebut SPK atau item yang bisa diklik; tidak ada kata "undefined" | |
| 12 | Penawaran dan Sales Order | Telusuri semua menu dan Pengguna & Akses | **Tidak ada** Penawaran, Sales Order, atau peran Sales | |

## Cara melapor temuan

Tulis nomor skenario, langkah yang dilakukan, dan apa yang terlihat (screenshot bila perlu). Temuan dikerjakan satu per satu di lokal, lalu regresi diulang sebelum rilis dibahas.

## Batas yang perlu diketahui

- Data contoh bukan data production; susut dan tonase butuh berat per item (katalog terpasang untuk `VITE_KATALOG_LOKAL=1`).
- Laporan produksi diisi **satu admin** (tanpa laporan per Work Centre) sampai operator lapangan siap; mode per mesin tersimpan dan dapat dinyalakan kembali.
- Perubahan hak akses realtime sudah terbukti di mock; di Supabase perlu diverifikasi di lingkungan dev sebelum rilis.
