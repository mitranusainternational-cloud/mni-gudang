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
- [ ] Audit lintas modul **belum tuntas**: workflow audit 9 modul terhenti oleh batas pemakaian; hanya modul PR dan sparepart selesai diperiksa (1 temuan terbukti, sudah diperbaiki). Modul bahan baku, barang jadi, SPK, produksi, logistik, master/cek data, penawaran, dan akses/adapter perlu dijalankan ulang
- [ ] Penerimaan bahan baku lewat PR (sama seperti sparepart) dan aturan Cek Data untuk sparepart keluar tanpa mesin / mesin tidak terdaftar
- [ ] Penggunaan mesin di kebutuhan tools produksi pada SPK (belum dirancang)

## Bukti

Tingkat bukti: `verified in browser` (mock lokal), bukan Supabase. Suite baru `mesinsparepart` MS-01..MS-19 (20 PASS) di `tests/e2e/mesin-sparepart.mjs`; suite `sparepart` (38 PASS) disesuaikan ke form baru. Regresi penuh dijalankan setelah perubahan (lihat entri PROJECT_PROGRESS).

Batas yang jujur: data sparepart lama tetap terbaca (pengeluaran lama tanpa mesin tampil sebagai "Tanpa mesin" di Pemakaian mesin); field baru mutasi (`mesin`, `tujuan`, `oleh`, `dasar`) masuk kolom `data` jsonb, belum diuji di Supabase.
