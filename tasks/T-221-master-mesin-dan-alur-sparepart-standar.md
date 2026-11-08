---
type: task
id: T-221
title: "Master Mesin dan alur sparepart standar (terima via PR, keluar ke mesin) serta audit lintas modul"
phase: P9
epic: E-16
release: v1.2
status: doing
priority: P1
env: dev
effort_days: 3
depends: [T-220]
owner: "dev + pemilik"
updated: 2026-11-08
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-221 Master Mesin dan alur sparepart standar

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-220

## Kriteria selesai

- [x] Master Data tab **Mesin**: daftar mesin produksi (dari Work Centre) dan peralatan pendukung (grup Utilitas & pendukung: forklift, kompresor, genset, crane) dengan kode aset, merek, lokasi, aktif/nonaktif; nama terkunci bila berasal dari Work Centre atau sudah punya riwayat. Disimpan di `master/setting` (`mesinInfo`, `mesinLain`) dan `mwc.mesin`, tanpa tabel baru dan tanpa migration. Mesin nonaktif hilang dari pilihan Produksi dan sparepart
- [x] Sparepart **keluar** ke mesin, bukan ke SPK: jenis pemakaian (perawatan rutin, perbaikan, penggantian komponen, tools/consumable produksi, umum), mesin wajib kecuali jenis Umum, nama pengambil wajib, keterangan wajib untuk perbaikan dan Umum. Tersimpan sebagai `mesin`, `mesinGrup`, `tujuan`, `oleh` di mutasi; kolom SPK dihapus dari form
- [x] Sparepart **masuk** lewat PR: pilih PR terbuka (baris dan pemasok terisi dari sisa PR), kelebihan dari sisa PR ditolak, PR terupdate (qTerima, status). Tanpa PR harus memilih alasan (pembelian langsung, retur, hibah/sample, penyesuaian) dan keterangan
- [x] Tab **Pemakaian mesin** di Gudang Sparepart (per mesin: jumlah pengeluaran, total unit, barang terbanyak, perawatan vs perbaikan, terakhir; tombol Riwayat), filter riwayat per mesin, dan dokumen SP-M/SP-K memuat No PR atau Mesin, jenis pemakaian, pengambil
- [x] Koreksi penerimaan yang berasal dari PR mengembalikan qTerima dan status PR (temuan audit: sebelumnya PR tetap Selesai walau stok dibalik)
- [x] Kebutuhan plat SPK terhubung ke master bahan baku: satuan Lembar tidak lagi membuat berat 0; kebutuhan dikurangi qty yang diambil dari stok barang jadi; SPK Draft dan Batal tidak ikut KPI dan analisa; koreksi penerimaan tidak dihitung sebagai pemakaian SPK; penerimaan PR dibatasi sisa PR. Diuji KP-01..KP-05 (kebutuhanplat, 7 PASS) dan regresi penuh 0 FAIL; skill keterhubungan-data dibuat
- [ ] Audit lintas modul **belum tuntas**: workflow audit 9 modul terhenti oleh batas pemakaian; audit ulang menghasilkan 20 temuan terbukti. Yang sudah diperbaiki: 5 di rantai kebutuhan plat dan PR, ditambah koreksi PR dari audit sebelumnya. Sisa 14 belum diperbaiki: logistik (SJ dari stok gagal untuk peran Logistik, pembatalan SJ tanpa penjaga status, antrian Loading yatim, siap kirim setelah rework, nomor SJ tanpa kunci, Berangkat tanpa no polisi), Bongkar Muat (checklist Unloading kosong, jam masuk), hak akses PR sparepart, nama item kembar, Gantt pecahan pcs, dan master customer yang dihapus permanen walau dipakai penawaran. Modul bahan baku, barang jadi, SPK, produksi, logistik, master/cek data, penawaran, dan akses/adapter perlu dijalankan ulang
- [x] Perbaikan logistik dari audit (2026-11-09): SJ customer dari stok memeriksa hak Barang jadi sebelum menulis dan stok dicek kumulatif per produk (#2, #14); SJ Dalam Perjalanan atau Diterima tidak bisa dibatalkan langsung (#15); pembatalan SJ hanya menyentuh antrian Bongkar Muat yang tertaut ke SJ itu dan belum selesai (#11, #12); berangkat atau diterima wajib no polisi (#20); checklist Unloading penerimaan bahan baku terisi (#8); PR sparepart masuk modul Sparepart (#10). Diuji LG-01..LG-06 (logistiksj, 7 PASS) dan F-25 disesuaikan
- [ ] Sisa temuan audit belum diperbaiki: #6 dan #7 (aturan Cek Data PR dan stok RM), #13 (siap kirim setelah rework ke vendor, perlu verifikasi angka), #16 (nomor SJ dibuat di klien tanpa kunci), #17 (opname memakai stok saat klik, prioritas rendah), #18 (antrian Unloading tanpa jam masuk)
- [ ] Penerimaan bahan baku lewat PR (sama seperti sparepart) dan aturan Cek Data untuk sparepart keluar tanpa mesin / mesin tidak terdaftar
- [ ] Penggunaan mesin di kebutuhan tools produksi pada SPK (belum dirancang)

## Bukti

Tingkat bukti: `verified in browser` (mock lokal), bukan Supabase. Suite baru `mesinsparepart` MS-01..MS-19 (20 PASS) di `tests/e2e/mesin-sparepart.mjs`; suite `sparepart` (38 PASS) disesuaikan ke form baru. Regresi penuh dijalankan setelah perubahan (lihat entri PROJECT_PROGRESS).

Batas yang jujur: data sparepart lama tetap terbaca (pengeluaran lama tanpa mesin tampil sebagai "Tanpa mesin" di Pemakaian mesin); field baru mutasi (`mesin`, `tujuan`, `oleh`, `dasar`) masuk kolom `data` jsonb, belum diuji di Supabase.
