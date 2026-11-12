---
type: task
id: T-230
title: "Master Data, Pengguna & Akses, dan Kinerja Tim selaras modul terbaru (angka punya dasar)"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-228, T-229]
owner: "dev + pemilik"
updated: 2026-11-12
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-230 Master Data, Pengguna, Kinerja Tim selaras

Permintaan pemilik 2026-11-12: Master Data disesuaikan dengan modul baru, seluruh sistem hulu ke hilir sesuai tanpa data yang tidak ada dasarnya, termasuk Pengguna & Akses dan Kinerja Tim; pastikan tidak ada bug.

## Temuan dan perbaikan

- **Kinerja Tim menampilkan satu orang dua baris** (akun dikenali lewat id di daftar pengguna dan lewat email di aktivitas). Kini akun dikenali lewat id atau email, satu orang satu baris.
- **Baris "Pengguna, Belum terdaftar" berisi 16 aktivitas data awal (`seed`)**, bukan orang. Data awal tidak lagi dihitung sebagai pengguna; identitas lain yang belum terdaftar tampil dengan emailnya.
- **Jejak laporan produksi admin** (Update produksi dan Alasan belum produksi) kini ikut aktivitas pelapornya.
- **Hasil produksi dilaporkan** dicocokkan dengan Laporan Produksi; selisih laporan tanpa nama pelapor ditampilkan ("N pcs tanpa nama pelapor"), tidak disembunyikan.
- **Master Data:** Opsi SPK memuat daftar **Alasan belum produksi** (dipakai admin di Update produksi); judul Master Data dan catatan Work Centre menjelaskan bahwa saat laporan dipegang admin, Work Centre dan mesin dipakai untuk rute, jadwal, kapasitas; tombol "Isi mesin sesuai form laporan" disembunyikan pada mode itu.
- Sapuan 15 tab Master Data dan 25 tampilan lain: tidak ada NaN, undefined, atau galat console.

## Bukti

`verified in browser` (mock). Uji PH-48 (produksihh 48 PASS), unit semua PASS, lint 0 error. Regresi penuh: lihat [[documentation/RENCANA_PERBAIKAN_LOKAL]]. Belum diuji di Supabase dengan login nyata.

## Tambahan: Type tanpa duplikasi (2026-11-12)

Temuan pemilik: Opsi SPK › Type berisi STU dan STC sekaligus C dan U, padahal C adalah STC dan U adalah STU. Perbaikan: bawaan Type kini STU, STC, SLU, SLHD, SLHDC, SLW; daftar lama yang berisi C atau U dilebur ke STC dan STU; semua daftar Opsi SPK dibuang nilai kembarnya; judul section "TYPE C" dan "TYPE U" dibaca sebagai STC dan STU (berat dan laporan). Uji PH-49, unit S-65.
