---
type: guide
status: draft
updated: 2026-11-06
---

<img src="../../../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Panduan penggunaan: MNI Gudang & Logistik

> Status: **draf operasional** berdasarkan aplikasi per 2026-11-06 (cabang lokal `fitur/produksi-multi-wc`; sebagian modul belum tayang, lihat [[documentation/PETA_MODUL|peta modul]]). Belum disahkan sebagai SOP oleh pemilik gudang dan logistik. Aturan rinci: [[documentation/PRD_GUDANG|PRD gudang]] dan [[documentation/PRD_PRODUKSI|PRD produksi]].

## 1. Masuk dan dasar pemakaian

- Buka alamat aplikasi, ketik email terdaftar, lalu kode OTP yang dikirim ke email. Hanya pengguna terdaftar yang dapat masuk. Menu yang tampil mengikuti hak akses Anda (peran dan modul); modul tanpa hak ubah hanya dapat dilihat.
- Indikator di pojok kanan atas menunjukkan koneksi data. Data dibagikan ke semua pengguna dan tersinkron tiap beberapa detik.
- **Tidak ada hapus permanen** pada transaksi. Salah input dibetulkan dengan **Koreksi** (sistem membuat transaksi pembalik, riwayat asli tetap), item yang tidak dipakai dengan **Nonaktifkan**.
- Di HP, tabel gudang tampil sebagai kartu; tombol aksi ada di setiap kartu.

## 2. Gudang Bahan Baku (plat dan material)

| Tab | Isi |
|---|---|
| Posisi stok | stok per jenis material, status (aman, minimum, habis), kg per lembar, tombol cepat Pakai, Terima, Ubah |
| Analisa | pemakaian, tren, kelas, pesan ulang |
| Kartu Stok | riwayat dan saldo satu item, ekspor PDF dan Excel |
| Rencana pembelian | usulan dari buffer dan pemakaian; buat PR, tandai dipesan, terima |
| Stock opname | isi hasil hitung fisik (Isi semua = sistem untuk mulai), simpan; cetak **lembar hitung kosong** untuk dibawa petugas |
| Riwayat mutasi | semua transaksi; filter jenis, periode, SPK; dokumen PDF dan Excel per nomor |

- **Terima material:** isi supplier (harus ada di Master Data; baru akan ditawarkan didaftarkan), No PO atau SJ supplier, item dan jumlah (boleh beberapa item per dokumen). Dokumen otomatis bernomor RCV.
- **Pakai untuk produksi:** pilih SPK (atau "Non-SPK" dengan keterangan wajib), diserahkan ke bagian atau mesin, item dan jumlah. Total lembar dan kg terhitung langsung. Dokumen bernomor PK memuat SPK, customer, dan berat.
- **Koreksi:** pada riwayat atau Kartu Stok, tombol Koreksi di baris transaksi, isi alasan. Koreksi yang membuat stok minus ditolak.
- **Jenis material dan massa jenis** diatur di Master Data > Bahan baku (lihat bagian 9).

## 3. Gudang Barang Jadi

- Tab: **Posisi stok**, **Tren**, **Rencana produksi**, **Riwayat mutasi**. Tombol: Barang masuk, Barang keluar, Stock opname, Item baru, **SPK stok**, CSV.
- **Barang keluar:** pilih customer dan SPK terkait; customer terisi otomatis dari SPK; dokumen BJ-K memuat No SPK. **Barang masuk:** asal (produksi, finishing, vendor) dan SPK; dokumen BJ-M.
- **Buffer:** atur dari kartu stok (Ubah buffer). Produk di bawah buffer diberi status dan muncul di Rencana produksi.
- **Membuat SPK untuk stok:** di Posisi stok **ceklis** produk yang mau diproduksi (atau Pilih semua yang di bawah buffer), lalu **Buat SPK stok**; isi qty dan due date. Hasilnya SPK Draft untuk customer STOK MNI (bagian 5).

## 4. Gudang Sparepart

- Daftar barang dengan stok awal, masuk, keluar, stok akhir, minimum, buffer, tren, dan status. Tab: Posisi stok, Tren, Rencana pembelian, Stock opname, Riwayat mutasi.
- **Impor Excel:** dari tabel stok sparepart; pratinjau menampilkan barang baru, pengeluaran yang dicatat, dan kecocokan total dengan lembar Ringkasan. Impor ulang tidak menggandakan data.
- **Terima** (dokumen SP-M), **Keluarkan** (SP-K; ditolak bila melebihi stok), **Opname** (SP-OPN), **Koreksi**, **Nonaktifkan**.
- **Rencana pembelian:** barang yang habis, di bawah minimum, atau di bawah buffer diusulkan beserta alasannya; ceklis lalu **Buat permintaan pembelian (PR)**; PR dapat ditandai dipesan, diunduh Excel, dan diterima (stok bertambah).

## 5. SPK dan SPK stok

- **SPK Berjalan:** tab Daftar SPK, Jadwal, Berjalan, KPI & Analisa. Filter **Semua SPK / SPK Customer / SPK Stok** di sebelah tab. SPK baru dibuat PPIC; SPK **Draft** diperiksa lalu **Terbit**.
- **SPK stok** (customer STOK MNI, chip "SPK Stok"): alurnya sama dengan SPK biasa sampai produksi dan vendor finishing. Bedanya, hasil **tidak dikirim ke customer** melainkan **Terima di gudang barang jadi** (tombol di laci SPK): form terisi dari item SPK dan menghasilkan dokumen BJ-M tertaut SPK. Progres "Masuk gudang" dihitung dari barang yang diterima.
- **Penjaga hasil produksi:** barang hanya dapat diterima di gudang barang jadi, atau dikirim ke customer, sebesar **hasil produksi yang selesai** (dikurangi yang masih di vendor finishing). SPK Draft tidak dapat menerima barang. Untuk kasus lapangan, form surat jalan memiliki centang **kirim lebih** (keterangan wajib).
- Dokumen SPK: Lihat format SPK, Excel, PDF; tanda tangan Produksi dan PPIC diisi di formulir SPK.

## 6. Produksi Hari Ini dan Kinerja & Analisa

- **Produksi Hari Ini:** operator mencatat hasil per mesin (Mulai, Selesai, qty, reject); sistem menolak catatan yang melebihi hasil mesin sebelumnya. Dapat berjalan beberapa sesi bersamaan.
- **Kinerja & Analisa:** per work center, produk, vendor, pengiriman, laporan produksi (qty, tonase, kecepatan), rincian harian.

## 7. Logistik

- **Kirim ke Vendor:** surat jalan vendor (SJ-V) dari item SPK yang siap; catat hasil kembali dan reject. **Kirim ke Customer:** surat jalan (alamat otomatis dari Master Data, bisa diubah; tabel **partial** muncul otomatis bila bertahap; nomor otomatis mengikuti format `tahun/bulan romawi/MNI/nomor`, boleh diketik manual). **Bongkar Muat:** antrean unloading dan loading beserta checklist.

## 8. Dokumen dan nama penanda tangan

- Setiap transaksi stok punya nomor dokumen (RCV, PK, BJ-M, BJ-K, SP-M, SP-K, OPN, SP-OPN, PR, SJ, SJ-V). Dokumen dapat dicetak atau disimpan PDF dan diunduh Excel dari Riwayat mutasi, Kartu Stok, atau laci SPK.
- Sebelum mencetak, muncul dialog **Nama penanda tangan**: ketik nama untuk tiap kolom tanda tangan, atau kosongkan untuk tulis tangan. Nama yang pernah diketik muncul sebagai saran dan terisi otomatis per jabatan di perangkat yang sama.

## 9. Master Data dan pengguna

- **Master Data:** customer, vendor, supplier, armada, work center, dan tab **Bahan baku** (jenis material dengan massa jenis, serta daftar item). Jenis material dapat ditambah, diganti nama, dihapus (bawaan dapat dipulihkan); perubahan mengikuti semua modul. Mengganti nama customer, vendor, atau supplier juga mengubah dokumen terkait.
- **Item bahan baku:** nonaktifkan lewat Master Data; item nonaktif tersembunyi dari daftar dan pilihan, riwayatnya tetap.
- **Pengguna & Akses** (admin): undang pengguna, atur peran dan hak per modul, riwayat perubahan.
- **Cek Data:** peringatan kualitas data (mis. item berjenis "Lainnya").

## 10. Peringatan

- Aturan stok, alur persetujuan, dan batas yang tertulis di sini perlu disahkan pemilik gudang dan logistik sebelum dipakai sebagai instruksi kerja.
- Jangan menguji tambah atau ubah pada data operasional nyata tanpa skenario uji dan persetujuan.
- Modul **Penawaran** dan **Sales Order** disembunyikan sementara.

Dokumen terkait: [[documentation/PETA_MODUL]], [[documentation/PRD_GUDANG]], [[apps/gudang-logistik/docs/DEVELOPMENT|panduan pengembangan]], [[documentation/screenshots/README|indeks screenshot]].
