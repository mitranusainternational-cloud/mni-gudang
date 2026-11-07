---
type: task
id: T-185
title: "Papan jadwal v3 interaktif (tooltip, panel detail, zoom, geser, buka/lipat semua) dan urutan tab SPK"
phase: P2
epic: E-02
release: v0.9
status: done
priority: P1
env: dev
effort_days: 1
depends: [T-182]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-185 Papan jadwal v3 dan urutan tab SPK

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: [[T-182-papan-jadwal-v2-dan-rapikan-layout-spk]]
Kebutuhan: [[PRD_PRODUKSI]] bagian 15

Masukan pemilik: (1) urutan tab SPK menjadi Daftar SPK, Jadwal, Berjalan, KPI & Analisa, dengan Daftar SPK sebagai tampilan awal; (2) Gantt sudah bagus secara tampilan tetapi kaku dipakai, cari referensi terbaik agar progres mudah dilihat.

## Kriteria selesai

- [x] Urutan tab: Daftar SPK, Jadwal, Berjalan, KPI & Analisa; Daftar SPK menjadi tampilan awal
- [x] Referensi UX papan jadwal diperiksa (Bryntum, DHTMLX, Precursive, praktik Gantt manufaktur) dan dipetakan ke fitur
- [x] Hover batang menampilkan kartu keterangan (mesin, tanggal, hasil, reject, progres)
- [x] Klik batang membuka panel detail SPK: item, langkah mesin per tanggal dan jumlah, item yang diklik disorot, tombol Buka SPK; Enter pada batang yang difokus juga membuka
- [x] Penunjuk tanggal mengikuti kursor di atas garis waktu
- [x] Zoom tiga tingkat: Detail, Harian, Ringkas
- [x] Buka semua dan Lipat semua item
- [x] Geser garis waktu dengan drag mouse; baris menyala saat disorot
- [x] Uji e2e M-105, M-105b, M-148 sampai M-153; regresi penuh 0 FAIL
- [x] Ditinjau pemilik: papan v3 digantikan timeline bersih T-186 yang dinyatakan sesuai (2026-11-05); tampilan Rinci dan Per mesin tetap tersedia

## Bukti

`verified in browser` (mock, Playwright). E2E: regresi 42, role 12, akses 34, produksi 118, tampilan 72; alur lengkap SPK 15 (0 FAIL). Tangkapan layar: `documentation/screenshots/gantt-v3-hover.png` dan `gantt-v3-detail.png`. Bukan bukti Supabase.

## Catatan

Tidak ada perubahan skema dan tidak ada input baru; semua dari data yang sudah ada. Belum dibuat: geser batang untuk mengubah jadwal (jadwal diturunkan dari catatan produksi, bukan diatur tangan), panah ketergantungan antarlangkah, dan sentuhan khusus HP untuk tooltip (di layar sentuh, ketuk batang membuka panel detail). Dua langkah berurutan pada hari yang sama saling menumpuk satu hari di batang.
