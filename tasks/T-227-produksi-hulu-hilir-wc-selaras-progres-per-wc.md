---
type: task
id: T-227
title: "Produksi hulu ke hilir: Work Centre selaras rute, item langsung terlihat di tiap WC, Progres WC"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-223, T-225, T-226]
owner: "dev + pemilik"
updated: 2026-11-10
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-227 Produksi hulu ke hilir

Temuan pemilik 2026-11-10: SPK terbit tetapi itemnya tidak langsung muncul di Work Centre (WC) lain selain Shearing, dan banner "Rute produksi memakai Work Centre yang belum ada di Master Data: Punching, CNC Laser".

## Penyebab

- Nama langkah rute (Shearing, Punching, Bending, CNC Laser, Welding) harus sama dengan nama WC di Master Data. Data awal (`seed.sql` dan mock) memakai "CNC Cutting" dan tidak punya Punching dan Shearing, sehingga antrian untuk langkah itu tidak pernah muncul.
- Antrian hanya menampilkan item yang sudah siap dikerjakan, jadi item yang baru terbit tidak terlihat di WC lanjutan.

## Kriteria selesai

- [x] Data awal (mock dan `seed.sql`) memuat Shearing, Punching, Bending, CNC Laser, Welding
- [x] Banner WC hilang punya tombol **Tambahkan otomatis** (membuat WC yang dipakai rute)
- [x] Produksi Hari Ini: bagian **Akan datang ke WC** (total, sudah sampai, belum sampai, posisi sekarang, due) langsung sejak SPK terbit
- [x] Kinerja & Analisa, tab **Progres WC**: ringkasan, tabel progres item per WC, matriks semua SPK × WC, CSV
- [x] Cek Data: peringatan SPK dengan item tanpa rute atau rute memakai WC yang tidak ada
- [x] Panduan [[documentation/CARA_KERJA_RUTE_PRODUKSI|CARA_KERJA_RUTE_PRODUKSI]] (cara sistem membaca rute per item dan langkah setup)
- [ ] Diuji di Supabase (belum). Data production memakai nama WC sendiri; cek lewat banner dan tombol Tambahkan otomatis setelah rilis

## Bukti

`verified in browser` (mock). Suite `produksihh` PH-01..PH-17 (dua item beda rute, item tanpa rute), matriks rute, spkdimensi, serah plate disesuaikan; regresi penuh 33 suite: 736 PASS, 1 FAIL kontras Cek Data (diperbaiki, aksesibilitas 4 PASS); lint 0 error.

Batas: tombol Tambahkan otomatis menambah WC baru; bila WC lama bernama beda (mis. CNC Cutting), ubah namanya di Master Data supaya tidak ganda.
