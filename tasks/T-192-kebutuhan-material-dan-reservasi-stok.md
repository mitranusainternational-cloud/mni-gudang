---
type: task
id: T-192
title: "Kebutuhan material dan reservasi stok"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P2
env: dev
effort_days: 3
depends: [T-191, T-194]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-192 Kebutuhan material dan reservasi stok

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-191
Rancangan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]]

## Kriteria selesai

- [x] Panel Kebutuhan material di Sales Order dan lembar SPK (netto kg, bruto dengan faktor sisa potong, lembar), tanpa mengubah stok pada tahap pratinjau
- [x] Pemetaan kelompok (bahan, tebal) ke item bahan baku; reservasi saat SPK Terbit (turunan, tanpa tabel baru); stok tersedia = fisik dikurangi reservasi SPK lain
- [x] Pengeluaran gudang (Pakai dengan nomor SPK) mengurangi reservasi; revisi, selesai, dan batal SPK menyesuaikan otomatis karena reservasi dihitung dari keadaan terkini; PR dibuat satu klik bila kurang, PR terbuka menutup kekurangan
- [ ] Cocok dengan beberapa SPK nyata (angka di folder privat) — menunggu data dan konfirmasi pemilik

## Bukti

- Kode: mesin murni `apps/platform/src/lib/erp/material.js` (bahanTebal, kelompokKebutuhan, reservasiAktif, rencanaMaterial, usulanPr); UI di `apps/gudang-logistik/assets/js/app.js` (panel di Sales Order dan lembar SPK, Buat PR, faktor sisa potong di Pengaturan bahan baku).
- Uji: unit material 12 PASS (K-01 sampai K-12); e2e penawaran 42 PASS (N-39 sampai N-43: panel, stok rendah, PR, PR terbuka, reservasi SPK Terbit); regresi penuh 0 FAIL (regresi 42, role 12, akses 34, produksi 134, tampilan 72); tangkapan di documentation/screenshots/alur-penawaran/04b.
- Tingkat bukti: verified in browser (mock). Bukan bukti Supabase. Tanpa tabel atau migration baru: reservasi dihitung dari SPK Terbit dan mutasi bahan baku yang bertanda SPK.
- Keputusan sementara (belum dikonfirmasi pemilik): faktor sisa potong 1,1 (sama dengan Waste EST workbook; dapat diubah di Pengaturan bahan baku); bahan baku dipetakan per (bahan, tebal) dari judul section dan hanya item berlembar (satuan lbr); sisa potongan belum dikembalikan ke stok.

## Catatan

Lanjutan diskusi pengurangan bahan baku otomatis. Dikerjakan dengan keputusan sementara di atas. Menunggu pemilik: (1) apakah stok berkurang otomatis saat SPK terbit atau tetap saat gudang mencatat Pakai (sekarang: tetap saat Pakai, reservasi di antara keduanya); (2) faktor sisa potong sebenarnya per produk; (3) apakah sisa potongan (offcut) dicatat sebagai stok; (4) cocokkan dengan beberapa SPK nyata. Lokal dulu; tidak menyentuh production sebelum persetujuan eksplisit pemilik.
