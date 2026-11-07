---
type: task
id: T-212
title: "Uji menyeluruh semua modul hulu ke hilir dan perbaikan bug yang ditemukan"
phase: P2
epic: E-03
release: v1.0
status: review
priority: P1
env: dev
effort_days: 1.5
depends: [T-211]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-212 Uji menyeluruh semua modul dan perbaikan bug

Epic: [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data|E-03]]
Fase: P2
Bergantung pada: T-211

## Kriteria selesai

- [x] Suite `menyeluruh.mjs` (24 uji): Master Data (buat, ganti nama berantai, gabung, hapus, daftar sales dan satuan), item dan pengaturan bahan baku, unduhan kartu stok, PR, CSV sparepart dan kinerja, antrean bongkar muat dari terima material (langkah, koreksi, cetak), kendala SPK terlambat, work center standar, invarian data
- [x] Pemindai kejanggalan tampilan (`kejanggalan.mjs`): 16 menu di desktop dan HP tanpa teks undefined, NaN, null, gambar rusak, meluap, tabel kosong tanpa keterangan, atau galat konsol; dipasang di suite fitur dan menyeluruh
- [x] Penelusuran visual di Playwright per modul (Dashboard, Bahan Baku, Barang Jadi, Sparepart, SPK, Produksi Hari Ini, dan lainnya) tanpa kejanggalan baru selain yang diperbaiki di bawah
- [x] Alur SPK ujung ke ujung (`alur-spk.mjs`) 15 lulus bersama penjaga hasil produksi
- [x] Bug diperbaiki dan diuji: (1) mengganti nama supplier tidak mengubah supplier pada PR (M-6); (2) hitungan pemakaian master tidak memuat sparepart, PR, dan barang jadi keluar sehingga supplier atau customer yang dipakai bisa terhapus permanen; (3) ganti nama customer tidak mengikutkan penawaran dan Sales Order; (4) Dashboard memasukkan SPK stok ke peringkat Top customer, funnel pengiriman, dan hitungan telat (F-18); (5) pembaca angka (F-16) dan koreksi barang masuk SPK stok (F-17) dari T-211
- [x] Uji editor SPK (tambah dan hapus baris, tambah, hapus, urut, dan aksesori section, simpan draft, terbit, revisi dengan alasan wajib) dan work center (ubah, hapus, nonaktif) lewat klik langsung: suite `editor.mjs` 17 uji (2026-11-07)
- [x] Uji opname sparepart (Isi semua = sistem, Kosongkan, simpan tanpa selisih): SP-9b dan SP-9c di `sparepart.mjs`
- [x] Audit silang 2026-11-07: klaim angka uji dibaca ulang (regresi 42, role 12, akses 34, produksi 134, sparepart, fitur 18, keamanan 8, aksesibilitas 3, menyeluruh 24, tampilan 72 cocok); suite Penawaran dihidupkan lagi (42); tujuh bug baru B-019 sampai B-025 ([[TEST_MATRIX]])
- [ ] Data contoh mock yang realistis (nama material memuat jenis agar tidak semua "Belum dikenali")

## Bukti

- Verified in browser (mock, Playwright): suite menyeluruh 24, fitur 18, keamanan 8, aksesibilitas 3, sparepart 36 dan lainnya lulus; lint 0 galat.
- Audit silang 2026-11-07 (mock, Playwright): editor 17, penawaran 42 (sebelumnya dilewati), sparepart 38, regresi penuh 0 FAIL; lint 0 galat dan 42 peringatan (batas 43).
- Bug yang ditemukan dan diperbaiki dengan uji: B-019 (WC terpakai bisa dihapus), B-020 (ganti nama WC memutus rute), B-021 (penolakan hapus oleh database tampak berhasil), B-022 (perangkap fokus dialog), B-023 (suite Penawaran terlewati), B-024 (done tanpa bukti dan kriteria ganda).
- Commit/branch: `fitur/produksi-multi-wc`.

## Catatan

- Temuan bukan bug: data contoh mock memakai nama material generik sehingga semua item tampil "Belum dikenali" di Posisi stok; di production nama memuat jenis (SPHC, SS304, A5052) sehingga tampil benar.
- Satu tangkapan layar Playwright sempat menampilkan dialog nama penanda tangan yang tidak ada di halaman; tidak dapat direproduksi (artefak tangkapan layar dari status halaman sebelumnya).
