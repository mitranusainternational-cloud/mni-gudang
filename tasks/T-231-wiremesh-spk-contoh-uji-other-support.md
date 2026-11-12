---
type: task
id: T-231
title: "Section Cable Tray Wiremesh, SPK contoh uji (Tray, Ladder, Duct, Wiremesh), Other Support kelompok sendiri"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-229, T-230]
owner: "dev + pemilik"
updated: 2026-11-12
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-231 Wiremesh, SPK contoh uji, Other Support

Permintaan pemilik 2026-11-12: uji ulang dengan SPK dummy (Straight, Accs, Cover, Other Support untuk Cable Tray, Cable Ladder, Cable Duct), dan tambahkan section Cable Tray Wiremesh dengan metode input versi pertama (belum ada rumus berat), memakai Diameter serta finishing atau material.

## Kriteria selesai

- [x] Section **Cable Tray Wiremesh** (`WIREMESH CABLE TRAY`) di daftar section (12 section): judul memakai **Diameter** (pilihan di Master Data › Opsi SPK, bawaan 3 sampai 6 mm) dan finishing, tanpa Type dan Tebal; masukan teks bebas dengan berat manual (tanpa kalkulator); tidak muncul di Aturan section (tidak punya bentuk kalkulator)
- [x] Rute sementara Wiremesh: Shearing, Bending, Welding, lalu vendor finishing (**menunggu konfirmasi pemilik**; ubah di Master Data › Rute produksi)
- [x] Laporan: kelompok **Wiremesh** sendiri; **Other Support** kelompok sendiri (sebelumnya tergabung di Aksesoris)
- [x] Tombol **SPK contoh uji** (hanya pratinjau lokal, tab Daftar SPK): membuat 4 SPK (Tray, Ladder, Duct masing-masing 4 item Straight, Accs, Cover, Other Support dengan berat dari kalkulator katalog; Wiremesh 2 item teks bebas)
- [x] Audit alur dari SPK contoh: rute tiap item, vendor ELG, klasifikasi laporan, kebutuhan plat (netto sama dengan jumlah berat), draf PR gabungan menutup kekurangan semua SPK
- [ ] Diuji di Supabase (belum)

## Temuan saat uji

- Pembuat SPK contoh memakai nomor yang sama untuk SPK berurutan (nomor dihitung dari data yang belum tersinkron); diperbaiki dengan penomoran lokal berurutan.
- Data awal mock: item RM "Plat Stainless 1.0" bertanda bahan SPHC sehingga ikut dipakai untuk kebutuhan SPHC 1.0 (masalah data contoh, bukan kode).

## Bukti

`verified in browser` (mock). Regresi penuh sebelum perubahan ini: 32 suite, 730 PASS, 0 FAIL. Sesudahnya: produksihh 50 (PH-50), masterdata, spkstruktur 31, spkdimensi 13, editor 17, spkringkas 15, matriksrute 8, aturanproses 7, spkaturan 19, kebutuhanplat 7, unit semua PASS, lint 0 error.
