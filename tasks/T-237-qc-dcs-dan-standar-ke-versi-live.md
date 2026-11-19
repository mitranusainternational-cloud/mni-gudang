---
type: task
id: T-237
title: "QC (Daily Check Sheet, sertifikat) dan Standar & Panduan dibawa ke versi live"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-234]
owner: "dev + pemilik"
updated: 2026-11-19
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-237 QC (DCS) dan Standar & Panduan

Latar: modul QC dan halaman Standar & Panduan dibangun di repo WMS-MNI (`nurilhamjn/mni-wms`, cabang `main`, 14 sampai 15 November 2026) yang terpisah dari jalur rilis ini. Tugas ini memindahkannya ke jalur live tanpa mengambil bagian yang dikeluarkan dari lingkup (Penawaran, Sales Order, harga). Rujukan desain: [[documentation/PRD_QC]], [[documentation/STANDAR_QC_REFERENSI]].

## Kriteria selesai

- [x] Menu **QC**: daftar SPK menunggu QC, inspeksi per item (ukuran standar terisi dari SPK, ukuran sebelum dan sesudah finishing, cacat visual, jointing, repaired), judgment otomatis dengan toleransi (profil MNI, NEMA VE 1, ASTM/ISO), foto bukti
- [x] Laporan QC (DCS) PDF dan Excel, **Sertifikat QC** PDF; ringkasan QC di rincian SPK
- [x] Peran baru **QC**; hak lihat QC untuk PPIC, Produksi, Gudang, Gudang Barang Jadi, Logistik, Viewer; PPIC boleh mengubah QC
- [x] Halaman **Standar & Panduan** (peta standar, toleransi, material dan lapisan, checklist QC, panduan per peran)
- [x] **Gerbang QC bawaan MATI** (berbeda dari repo asal): surat jalan customer dan penerimaan barang jadi tetap seperti sekarang sampai super admin mencentang "QC wajib" di QC > Toleransi
- [x] Adapter: koleksi `qc` opsional (backend tanpa tabel `qc` tidak error), `window.MNIQC`, peran menulis yang kurang (gudang, maintenance, qc)
- [x] Draf migration `20240101000030_qc.sql` dan `20240101000031_peran_qc_operator.sql` (+ rollback), **belum diterapkan**
- [ ] Draf 30 dan 31 diterapkan ke Supabase `mni-wms` lalu diuji login nyata per peran (butuh persetujuan); Edge Function `kelola-pengguna` perlu mengenali peran `qc`
- [ ] Keputusan pemilik: aktifkan QC wajib, dan jadwal membawa ke live (Vercel)

## Bukti

`verified in browser` (mock). Unit `qc.test` 29 PASS, e2e `qc` 18 PASS (QC-E00..E09b, E13, E14), lint 0 error, regresi penuh lihat PR. Tanpa tabel `qc` di database, modul QC tampil kosong dan tidak bisa menyimpan; mock bukan bukti Supabase.

## Tidak ikut dibawa (sengaja)

Penawaran dan Sales Order beserta harga (keputusan pemilik 2026-11-11); layar operator dan modul `lapor` (tugas terpisah).
