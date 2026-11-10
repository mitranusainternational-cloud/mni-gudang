---
type: task
id: T-186
title: "Berjalan memuat matriks posisi item; Jadwal menjadi timeline bersih per SPK dengan perkiraan otomatis"
phase: P2
epic: E-02
release: v0.9
status: done
priority: P1
env: dev
effort_days: 2
depends: [T-185]
owner: "dev + pemilik"
updated: 2026-11-05
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-186 Berjalan dan Jadwal dibedakan

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: [[T-185-papan-jadwal-v3-interaktif-dan-urutan-tab-spk]]
Kebutuhan: [[PRD_PRODUKSI]] bagian 16

Masukan pemilik (berurutan): (1) Gantt kurang bagus untuk memantau progres; (2) Jadwal dan Berjalan masih sama, Jadwal dibuat seperti papan jadwal Antlia tetapi lebih baik dan tidak kaku; (3) papan per work center dan per kotak terlalu membingungkan; (4) Jadwal cukup timeline biasa yang bersih dan modern dengan nama PT, rincian per work center sudah ada di Berjalan.

Pembedaan: **Berjalan** menjawab "sekarang di mana dan sudah berapa" (matriks posisi tiap item per langkah). **Jadwal** menjawab "kapan selesai dan apakah akan telat" (timeline, satu batang per SPK).

## Kriteria selesai

- [x] Berjalan memuat matriks: baris per item, kolom langkah Shearing sampai Kirim, centang, cincin posisi, label posisi dan nomor langkah, strip posisi (klik menyaring), penanda Diam N hari, mode Ringkas dan Rinci
- [x] Mesin perkiraan `src/lib/produksi/rencana.js` (kapasitas terbatas, urut due date, Senin sampai Jumat, vendor 3 hari kerja) dengan uji unit R-01 sampai R-10
- [x] Jadwal membuka Timeline: satu baris per SPK dengan nama customer, SPK, PO, status prediksi (Aman, Mepet due, Berisiko telat, Selesai) dan sisa hari; satu batang dari terbit sampai perkiraan siap kirim, isi batang = progres, bendera due date, bagian yang melewati due date bergaris merah, garis putus sisa waktu ke due date, garis hari ini
- [x] Tanpa rincian work center di Jadwal; klik batang atau nama membuka ringkasan SPK (progres, due, perkiraan, item dengan posisi) dengan tombol Buka SPK dan Lihat posisi di Berjalan
- [x] Navigasi minggu (panah, Hari ini), zoom 2 minggu, 1 bulan, 3 bulan
- [x] Rinci per item (Gantt lama) dan Per mesin tetap tersedia sebagai pilihan
- [x] Uji e2e M-100, M-142, M-154 sampai M-168 diperbarui atau ditambah; regresi penuh 0 FAIL
- [x] Ditinjau pemilik (Berjalan dan timeline Jadwal dinyatakan sesuai, 2026-11-05)

## Bukti

`verified in browser` (mock, Playwright) dan unit. Unit: rencana 11, jadwal 21, kapasitas 10, semua lainnya PASS. E2E: regresi 42, role 12, akses 34, produksi 134, tampilan 72; alur lengkap SPK 15 (0 FAIL). Tangkapan layar: `documentation/screenshots/timeline-v2-desktop.png`, `timeline-v2-detail.png`, `timeline-v2-hp.png`, `berjalan-v3-desktop.png`. Bukan bukti Supabase.

## Catatan

Tidak ada perubahan skema dan tidak ada input baru. Perkiraan siap kirim adalah usulan untuk dipantau: SPK dengan due date terdekat dikerjakan lebih dulu, kapasitas dari Master Data (work center tanpa kapasitas dianggap satu hari), Senin sampai Jumat, vendor 3 hari kerja. Versi awal (matriks terpisah, papan per work center, papan per SPK dengan kotak per work center) dibuang karena membingungkan.
