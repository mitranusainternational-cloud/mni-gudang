---
type: task
id: T-183
title: "Produksi Hari Ini: papan mesin dan kapasitas aktual (output, laju, pemakaian mesin, proyeksi, tren)"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-179, T-182]
owner: "dev + pemilik"
updated: 2026-11-05
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-183 Produksi Hari Ini: papan mesin dan kapasitas aktual

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-179, T-182
Kebutuhan: [[PRD_PRODUKSI]] bagian 14

Masukan pemilik: layar Produksi Hari Ini terasa kaku; input tetap mudah, tetapi tujuannya mengetahui kapasitas aktual produksi di mesin secara realtime, tepat dan akurat, sebagai dasar menyusun KPI per work center atau mesin dan memantau output aktual per hari.

## Kriteria selesai

- [x] Papan mesin: satu kartu per mesin di work center terpilih (status Berjalan atau Kosong, pekerjaan sekarang, output hari ini terhadap kapasitas, laju, pemakaian); ketuk kartu memilih mesin
- [x] Panel Kapasitas aktual per mesin: output hari ini, laju aktual (pcs per jam), mesin dipakai (terhadap 8 jam kerja), proyeksi akhir shift, tonase dan reject
- [x] Grafik output per jam hari ini dan tren 7 hari
- [x] Mesin hitung `src/lib/produksi/kapasitas.js` (laju hanya dari catatan berdurasi; sesi berjalan ikut dihitung) dengan uji K-01 sampai K-10
- [x] Kartu antrian dan sesi berjalan dilonggarkan; cara input tidak berubah (Mulai, isi jumlah, Selesai)
- [x] Uji e2e M-143 sampai M-147; regresi penuh 0 FAIL, termasuk lebar HP 390 px
- [ ] Ditinjau pemilik
- [ ] Keputusan pemilik: jam kerja standar per mesin dan target KPI (pcs per jam) per work center atau mesin

## Bukti

`verified in browser` (mock). Bukan bukti Supabase. Unit: kapasitas 10, jadwal 21, semua lainnya tetap PASS. E2E: regresi 42, role 12, akses 34, produksi 111, tampilan 71 (0 FAIL). Tangkapan layar: `documentation/screenshots/produksi-hari-ini-v2/` memakai data contoh yang disuntik (beberapa jam hari ini dan 6 hari sebelumnya) agar grafik terisi.

## Catatan

Tidak ada perubahan skema dan tidak ada input baru. Target memakai kapasitas per hari yang sudah ada di Master Data Work Centre dan mesin. Jam kerja standar sementara tetap 8 jam (480 menit), sehingga target laju = kapasitas per hari / 8 dan persentase pemakaian dihitung terhadap 8 jam. Laju dihitung dari catatan yang punya jam mulai dan selesai; catatan manual tanpa durasi tidak ikut agar angka tidak menebak. Proyeksi mengandaikan mesin terus bekerja sampai 8 jam. Angka diperbarui saat data berubah dan saat layar dimuat ulang; belum ada penyegaran otomatis per menit selain penghitung lama sesi. Belum di-push.
