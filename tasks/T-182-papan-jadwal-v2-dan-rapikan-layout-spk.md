---
type: task
id: T-182
title: "Papan jadwal v2 (per SPK dan per mesin) dan perapian layout Berjalan, KPI & Analisa, Target waktu proses"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-180, T-181]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-182 Papan jadwal v2 dan perapian layout

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-180, T-181
Kebutuhan: [[PRD_PRODUKSI]] bagian 13

Masukan pemilik setelah melihat tampilan: jadwal terlalu kaku dan perlu mengikuti standar schedule board agar pergerakan SPK dan material yang sedang diproduksi mudah dilihat; layout Berjalan, KPI & Analisa, dan Target waktu proses perlu disesuaikan.

## Kriteria selesai

- [x] Jadwal **Per SPK**: header bulan dan tanggal harian (hari kerja, akhir pekan, hari ini disorot), item terbuka sejak awal, langkah mesin per item berwarna per work center dengan isi sesuai jumlah selesai, penanda sedang berjalan
- [x] Jadwal **Per mesin**: kelompok work center, satu baris per mesin (termasuk yang kosong), balok pekerjaan per SPK dan item, balok bertumpuk diberi lajur, mesin yang sedang bekerja ditandai
- [x] Skala Harian dan Ringkas; filter status disembunyikan di tampilan Per mesin
- [x] SPK Berjalan: kartu bernada status, jalur item berbentuk baris dua kolom
- [x] KPI & Analisa: kartu tiga kolom dengan pengukur untuk persentase, bagian bernomor, tabel dan catatan dirapikan
- [x] Target waktu proses: dua kelompok, tiap isian dengan keterangan dan satuan hari kerja
- [x] Mesin hitung `langkahItem` dan `susunMesin` dengan uji J-18 sampai J-21
- [x] Uji e2e M-137 sampai M-142 dan penyesuaian M-131, M-135; regresi penuh 0 FAIL
- [ ] Ditinjau pemilik: KPI & Analisa dan Target waktu proses (bagian Berjalan dan Jadwal sudah dinyatakan sesuai lewat T-186, 2026-11-05)

## Bukti

`verified in browser` (mock). Bukan bukti Supabase. Unit semua PASS (jadwal 21). E2E: regresi 42, role 12, akses 34, produksi 106, tampilan 71, alur lengkap 15 (semua 0 FAIL). Tangkapan layar: `documentation/screenshots/layout-v2/`. Tidak ada perubahan skema database dan tidak ada input baru.

## Catatan

Data contoh terkumpul pada beberapa hari saja sehingga balok pendek; pada pemakaian nyata balok memanjang mengikuti tanggal. Warna work center mengikuti urutan di Master Data Work Centre (delapan warna bergilir). Tampilan Per mesin membaca nama mesin dari catatan produksi; mesin yang belum pernah dipakai tampil kosong bila terdaftar di master. Belum di-push.
