---
type: task
id: T-195
title: "Surat jalan: alamat pengiriman, tabel partial, penomoran otomatis, dokumen baru"
phase: P2
epic: E-02
release: v0.9
status: done
priority: P1
env: production
effort_days: 1.5
depends: []
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-195 Surat jalan: alamat pengiriman, tabel partial, penomoran otomatis, dokumen baru

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: -

## Kriteria selesai

- [x] Alamat pengiriman pada surat jalan customer, otomatis dari Master Data customer, dapat disimpan kembali ke master
- [x] Tabel partial: hanya muncul bila pengiriman bertahap (partial pertama, kedua, dan seterusnya); pengiriman sekaligus tanpa tabel partial
- [x] Penomoran surat jalan MNI mengikuti format lama (contoh 6/XI/MNI/1799), dapat diubah, dan kosong berarti lanjut otomatis dari nomor sebelumnya
- [x] Dokumen surat jalan yang lebih rapi (PDF dan Excel); status SPK tidak ikut berubah ke Siap kirim
- [x] Dirilis ke production tanpa mengubah data

## Bukti

- Commit/branch: PR 15 `fitur/surat-jalan` digabung ke `main` (ad73c89, 2026-11-06).
- Verified in browser: Vercel deploy Ready dan alur surat jalan di production. Verified in database: skema tidak berubah (tanpa migration), jumlah baris sebelum dan sesudah sama.

## Catatan

- Pekerjaan dilakukan di worktree terpisah agar tidak menyentuh branch produksi multi WC.
