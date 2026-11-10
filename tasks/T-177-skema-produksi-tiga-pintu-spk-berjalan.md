---
type: task
id: T-177
title: "Skema produksi tiga pintu: SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa (Tahap 1)"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 1.5
depends: [T-174]
owner: "dev + pemilik"
updated: 2026-11-04
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-177 Skema produksi tiga pintu (Tahap 1)

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-174
Kebutuhan: [[PRD_PRODUKSI]]

## Kriteria selesai

- [x] Menu Produksi dipangkas menjadi tiga: **SPK Berjalan**, **Produksi Hari Ini**, **Kinerja & Analisa**; Papan Produksi dan Laporan Produksi menjadi rute tersembunyi
- [x] **Produksi Hari Ini**: satu kartu per item, angka siap dikerjakan besar, tombol Mulai besar, jumlah selesai dengan + dan − dan pintasan, satu tombol Selesai; satu kolom dan tombol minimal 44 px di HP
- [x] **SPK Berjalan** (tampilan awal SPK): kartu per SPK dengan status, progres, siapa mengerjakan, dan jalur tiap item sampai terkirim; filter Berjalan, Telat, Di vendor, Siap kirim, Selesai, Semua
- [x] **Kinerja & Analisa**: tab Work Center, Vendor, dan Laporan harian
- [x] Tombol Input di tabel SPK dihapus; lembar posisi per item menjadi tombol sekunder
- [x] Uji e2e mock (`verified in browser`, bukan bukti Supabase): produksi 68, regresi 42, role 12, akses 34, tampilan 71, seluruhnya lulus
- [ ] Ditinjau pemilik di pratinjau lokal

## Bukti

Branch lokal `fitur/produksi-multi-wc`. Pengamatan pembanding: papan Operations Kanban Antlia (2026-11-04). Tangkapan layar diperiksa di lebar HP 420 px dan desktop.

## Catatan

Belum di-push dan belum ada perubahan database. Dikerjakan lokal sesuai permintaan pemilik.
