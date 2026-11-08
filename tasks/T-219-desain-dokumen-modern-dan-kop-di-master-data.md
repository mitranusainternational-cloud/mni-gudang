---
type: task
id: T-219
title: "Desain dokumen modern bertema per jenis dan kop yang dapat diatur di Master Data"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 3
depends: [T-218]
owner: "dev + pemilik"
updated: 2026-11-08
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-219 Desain dokumen modern bertema per jenis dan kop yang dapat diatur di Master Data

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-218

## Kriteria selesai

- [x] Master Data punya tab **Kop dokumen**: nama perusahaan, alamat 2 baris, kontak, warna garis kop, dan logo (PNG/JPG, otomatis dikecilkan), dengan pratinjau langsung dan tombol pulihkan bawaan
- [x] Kop dipakai pratinjau, PDF, dan Excel untuk surat jalan customer, surat jalan vendor, BTB, laporan produksi, KPI, dan checklist Bongkar Muat; header SPK dan ekspor lain memakai nama dan logo dari kop
- [x] Tiap jenis dokumen punya kode dan warna pembeda (SJ, SJV, BTB, LPP, KPI, CL)
- [x] Tampilan PDF dan Excel bersih dan modern: kop, judul dengan lencana kode, kotak nomor dan tanggal, kartu info, tabel berwarna tema dengan baris selang-seling, kotak catatan, kotak tanda tangan, footer
- [x] PR (bahan baku dan sparepart, kini juga PDF), dokumen mutasi stok (masuk, keluar, opname, koreksi, lembar opname), kartu stok bahan baku (kini juga PDF), dan penawaran cetak memakai tema dan kop yang sama
- [ ] Lembar SPK memakai tema baru (sengaja dipertahankan sebagai formulir MNI; header kop sudah mengikuti Master Data)

## Bukti

Tingkat bukti: `verified in browser` (mock lokal), bukan Supabase. Suite e2e `kopdokumen` KO-01..KO-15 (16 PASS; KO-11..15 untuk mutasi, cetak jendela, kartu stok, PR, kode unik) di `tests/e2e/kop-dokumen.mjs`; PDF diperiksa visual (surat jalan vendor gabungan dan surat jalan customer). Tampilan file Excel diperiksa lewat uji struktur sel (kop, kode, judul, nomor), belum dibuka visual di Excel.

Rancangan: `KOP()` membaca `master/setting.kop` (nama, a1, a2, kontak, warna, logo data URL, logoW, logoH) dengan bawaan identitas MNI; `DOCT`/`docTh(kind)` memberi kode dan warna per jenis; helper bersama `pdfKop/pdfTitle/pdfMeta/pdfSigns/pdfFooter` dan `xlKop/xlT` dipakai `docPdf`, `docXlsx`, `sjPdf`, `sjXlsx`; pratinjau memakai `docHeadHtml` dengan variabel CSS `--dc` dan `--br`. Tanpa perubahan skema (kop di kolom data `master/setting`).

Perluasan: model `mvModel/prModel/ksModel` memakai mesin `docPdf/docXlsx`; cetak jendela memakai `printDocHtml`; penawaran memakai tema `pq` (PNW). Tombol PDF baru di daftar PR dan kartu stok. Kolom selisih/koreksi bertanda +/- di Excel.

Batas yang jujur: logo disimpan inline di pengaturan (maks. sekitar 300 KB); lembar SPK mempertahankan format formulir MNI; lembar SPK tetap berformat formulir MNI.
