---
type: task
id: T-180
title: "Jadwal SPK (Gantt): garis waktu SPK berjalan dari terbit, produksi, vendor, kirim sampai due date"
phase: P2
epic: E-02
release: v0.9
status: done
priority: P1
env: dev
effort_days: 1
depends: [T-179]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-180 Jadwal SPK (Gantt)

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-179
Kebutuhan: [[PRD_PRODUKSI]] bagian 12

## Kriteria selesai

- [x] Tab **Jadwal** di menu SPK Berjalan: satu baris per SPK, batang rencana (terbit sampai due), produksi (isi = progres), vendor, pengiriman, penanda due date, perkiraan selesai, dan garis hari ini
- [x] **Tanpa input baru:** semua batang dibaca dari SPK, catatan produksi, dokumen vendor, dan pengiriman yang sudah ada; operator tetap hanya menekan Mulai, Selesai, atau Catat
- [x] Status per SPK: Selesai, Telat, Berisiko telat (perkiraan selesai melewati due date), Berjalan, Belum mulai
- [x] Ketuk nama SPK membuka jadwal tiap item; titik berkedip dan batang bertanda untuk yang sedang dikerjakan
- [x] Skala per minggu dan per bulan, filter status, pencarian, tombol Ke hari ini; di HP garis waktu bergulir di dalam kotaknya
- [x] Mesin hitung murni `src/lib/produksi/jadwal.js` dengan uji unit 17
- [x] Uji e2e M-129 sampai M-136; regresi penuh 0 FAIL (mock, `verified in browser`, bukan bukti Supabase)
- [x] Ditinjau pemilik: Gantt v1 digantikan timeline bersih T-186 yang dinyatakan sesuai (2026-11-05); Gantt rinci per item tetap tersedia sebagai pilihan

## Bukti

Branch lokal `fitur/produksi-multi-wc`. Unit: jadwal 17, rute 35, kinerja 11, laporan 24, analisa 21, statistik 34. E2E: regresi 42, role 12, akses 34, produksi 100, tampilan 71.

## Catatan

Persen produksi mengikuti definisi yang sama dengan layar lain (selesai di langkah internal terakhir), sehingga batang tidak bergerak untuk langkah antara sampai langkah terakhir terisi. Perkiraan selesai memakai laju sejauh ini dan hanya indikasi. Belum ada perubahan skema database. Belum di-push.
