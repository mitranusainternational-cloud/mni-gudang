---
type: task
id: T-174
title: "Produksi multi work center: rute, antrian mesin, kapasitas, posisi, dan kualifikasi vendor"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 4
depends: [T-167]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-174 Produksi multi work center: rute, antrian mesin, kapasitas, posisi, dan kualifikasi vendor

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-167

## Kriteria selesai

- [x] Skema, aturan, dan keputusan di [[RUTE_PRODUKSI]]
- [x] Mesin rute dan kinerja (rute, antrian, validasi, beban, prediksi, posisi, lama proses, vendor) dengan uji unit
- [x] Dibangun di lokal (branch `fitur/produksi-multi-wc`): Antrian Mesin, beban per work center, posisi SPK, kualifikasi vendor, kapasitas di Master Data
- [x] Uji e2e mock: produksi 15 skenario, sapu tampilan 67, total 166 lulus
- [x] Konsep pelacakan disepakati 2026-11-04 (input harian, ditolak bila melebihi mesin sebelumnya, reject dicatat dan dibuat ulang); kolom reject, uji unit R-70 sampai R-74, e2e M-15 dan M-16, total e2e 169 lulus
- [x] Vendor sebagai langkah rute: batas kirim dari hasil mesin terakhir, posisi di vendor, catatan siap dikirim; uji unit R-80 sampai R-85, e2e M-17 sampai M-19c, total e2e 174 lulus
- [x] Pengganti form laporan harian: mesin di work center, Mulai dan Selesai, mesin alternatif, Laporan Produksi, jejak item di lembar SPK; unit 19 skenario laporan, total e2e 195 lulus
- [x] Input fleksibel berjalan bersamaan: banyak sesi, target, simpan sebagian, pembatalan catatan, pelindung dobel; unit 24 laporan, e2e produksi 53
- [ ] Keputusan pemilik: daftar WC, aturan khusus per bentuk, satuan kapasitas, siapa yang mengisi
- [ ] Pengecualian rute per item di editor SPK, tabel aturan dari aplikasi, usulan langkah dari kejadian
- [ ] Tinjau bersama PPIC dan operator dengan data contoh
- [ ] Terapkan migration 14 (`produksi_log`) dan tayangkan, hanya setelah persetujuan eksplisit pemilik

## Bukti

- Mock (verified in browser, bukan bukti Supabase) dan unit. Belum di-push ke GitHub dan belum ada migration di database mana pun.

- [x] Layar operator berbasis kartu (tombol besar, + dan −, satu tombol Selesai) dan Papan Produksi untuk supervisor; uji M-91 sampai M-98, total e2e 221 lulus

- [x] Tinjauan pemilik 2026-11-04: tampilan masih membingungkan, skema disederhanakan menjadi tiga menu ([[T-177-skema-produksi-tiga-pintu-spk-berjalan]]); tahap berikut [[T-178-kinerja-dan-analisa-produksi-tahap-2]]

## Catatan

Dibangun lokal sesuai permintaan pemilik ("jangan ditayangkan dulu"). Catatan alur kerja: perubahan ada di branch lokal `fitur/produksi-multi-wc`, tidak di `development`, agar tidak ikut tergabung ke `main` tanpa persetujuan.
