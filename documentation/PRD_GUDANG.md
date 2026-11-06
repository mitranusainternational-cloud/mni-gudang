---
type: prd
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Kebutuhan: Gudang Bahan Baku, Barang Jadi, Sparepart, dan SPK stok

Aturan yang berlaku untuk tiga gudang dan alur SPK stok. Dibuat dari permintaan pemilik sepanjang 2026-11-04 sampai 2026-11-06. Peta modul: [[PETA_MODUL]]. Produksi: [[PRD_PRODUKSI]]. Skill pegangan agen: `gudang-stok-flow`.

## 1. Prinsip

1. Sistem tidak kaku: jenis material, produk, dan nama dapat ditambah, diganti nama, dan dinonaktifkan dari aplikasi; perubahan master mengikuti semua modul.
2. Tidak ada hapus permanen data transaksi; salah input diperbaiki dengan transaksi **Koreksi** (pembalik), item dengan **nonaktif**.
3. Setiap pergerakan stok mempunyai **dokumen** bernomor dengan PDF dan Excel, dan nama penanda tangan dapat diketik atau terisi dari nama yang pernah diketik.
4. Setiap pergerakan dapat ditelusuri ke SPK (asal dan tujuan): SPK customer atau SPK stok.
5. Stok tidak disimpan: stok = stok awal + jumlah `mutasi.delta`.
6. Data nyata tidak masuk Git (repo publik); impor dari Excel lewat aplikasi.

## 2. Mutasi dan dokumen

| Gudang | Jenis | Nomor dokumen | Isi khusus |
|---|---|---|---|
| Bahan baku | Terima | RCV | supplier, PO atau SJ supplier, berat |
| Bahan baku | Pakai | PK | SPK, customer SPK, diserahkan ke, berat |
| Bahan baku, barang jadi, sparepart | Opname | OPN, OPN, SP-OPN | stok sistem, stok fisik, selisih, alasan wajib |
| Semua | Koreksi | nomor dokumen yang dikoreksi | transaksi pembalik, riwayat asli tetap |
| Barang jadi | Masuk | BJ-M | asal (produksi, finishing, vendor), No SPK, customer SPK atau "untuk stok gudang" |
| Barang jadi | Keluar | BJ-K | customer, No SPK; customer terisi otomatis dari SPK |
| Sparepart | Terima, Keluar | SP-M, SP-K | supplier atau PR; diambil oleh dan tujuan |
| Bahan baku, sparepart | PR | PR | usulan pembelian sampai buffer; terima menambah stok |

Riwayat mutasi tiap gudang: filter jenis, periode, dan SPK; tombol SPK membuka lembar SPK.

## 3. Minimum, buffer, usulan

- **Stok minimum** (sparepart): batas peringatan. **Buffer**: target yang dijaga. Minimum tidak boleh lebih besar dari buffer.
- Status: Habis, Stok minimum, Di bawah buffer, Aman (sparepart); Kosong, Di bawah buffer, Ada (barang jadi).
- **Usulan sparepart** = buffer dikurangi stok dikurangi yang sudah dipesan lewat PR terbuka; bila buffer kosong dipakai 2 kali minimum.
- **Usulan produksi stok (barang jadi)** = buffer dikurangi stok dikurangi yang sedang diproduksi lewat SPK stok.
- Bahan baku: usulan dari buffer dan titik pesan ulang (pemakaian harian rata-rata); lihat Rencana pembelian.

## 4. Tren

- Grafik masuk dan keluar per bulan (6 bulan), sparkline per baris, dan kartu per item (tren pakai, keluar 30 hari, rata-rata per bulan, cukup untuk berapa hari).
- Label: **Naik** bila keluar 30 hari terakhir lebih dari 125 persen rata-rata per 30 hari pada 60 hari sebelumnya; **Turun** bila kurang dari 75 persen; **Stabil**; **Data baru** bila riwayat kurang dari 45 hari; **Tidak bergerak** bila tidak ada keluar 90 hari. Ambang sementara, menunggu validasi pemilik (T-113).

## 5. SPK stok

1. **Buat**: di Gudang Barang Jadi, ceklis produk di Posisi stok (atau Rencana produksi atau tombol SPK stok) lalu Buat SPK stok. Hasilnya SPK **Draft**, customer **STOK MNI**, `stokReq=true`, tiap baris tertaut produk (`fg`).
2. **Terbit**: PPIC memeriksa dan menerbitkan SPK seperti biasa. Muncul di Monitoring SPK; filter **Semua SPK, SPK Customer, SPK Stok**.
3. **Produksi dan vendor**: tim produksi memperbarui progres seperti SPK biasa; kirim ke **vendor** finishing tetap ada.
4. **Terima di gudang barang jadi** (menggantikan Kirim ke customer): form terisi dari item SPK; hanya sebesar hasil produksi yang selesai, dikurangi yang masih di vendor, ditambah yang sudah kembali. Ditolak bila SPK masih Draft.
5. **Jejak**: BJ-M tertaut SPK, timeline SPK memuat dokumen masuk, Riwayat mutasi menandai "untuk stok gudang" atau customer.
6. Progres "Terkirim" pada SPK stok = barang masuk gudang jadi; SPK stok selesai bila seluruhnya masuk.

## 6. Penjaga kirim ke customer

Kirim ke customer hanya sebesar hasil produksi siap = produksi efektif − di vendor + kembali dari vendor − sudah terkirim. Pelanggaran ditolak dengan pesan "melebihi hasil produksi yang siap dikirim". Centang **kirim lebih** (ganti reject, bonus, atau produksi belum tercatat selesai) meloloskan dengan keterangan wajib. Dampak rilis: SPK lama yang produksinya tidak pernah dicatat tertahan sampai produksinya dicatat atau override dipakai.

## 7. Hak akses

Modul `bahan-baku`, `barang-jadi`, `sparepart` (baru) ikut `role_modules`; peran `gbb` mendapat `sparepart`. PR dipakai bersama bahan baku dan sparepart: pemegang hak salah satu dapat melihat dan membuat PR (draf migration 18). Membuat SPK stok butuh hak ubah modul SPK.

## 8. Di luar cakupan saat ini

Stok negatif dicegah di database (draf migration 17, belum diuji); reservasi stok otomatis saat SPK terbit (keputusan pemilik terbuka, lihat [[documentation/DECISIONS|DECISIONS]] 2026-11-06); notifikasi stok di bawah buffer (E-12).

## 9. Bukti

Mock dan browser: `tests/e2e/sparepart.mjs` (SP-1 sampai SP-35) plus regresi, role, akses, produksi, tampilan: lihat [[TEST_MATRIX]]. Belum ada bukti database untuk tabel `sp` dan kebijakan baru karena migration 18 belum diterapkan ([[T-197-gudang-sparepart-modul-baru]]).
