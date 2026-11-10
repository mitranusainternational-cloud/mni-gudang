---
type: task
id: T-020
title: "Verifikasi login OTP end-to-end (lokal)"
phase: P2
epic: E-03
release: v1.0
status: todo
priority: P0
env: development
effort_days: 1
depends: [T-012, T-013]
owner: "dev"
updated: 2026-11-06
---

# T-020 Verifikasi login OTP end-to-end (lokal)

Epic: [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data|E-03]]  
Fase: P2 Aplikasi siap uji  
Bergantung pada: T-012, T-013

## Kriteria selesai

- [ ] Kode OTP diterima (Inbucket) dan sesi terbentuk
- [ ] User tidak terdaftar di muser ditolak
- [ ] Logout dan refresh sesi bekerja

## Bukti

- Belum ada.

## Catatan

-

> [!note] Audit 2026-11-06
> Login OTP berjalan di production (pemilik dan pengguna terdaftar masuk); bukti uji end-to-end terdokumentasi di [[ENVIRONMENTS]] dan T-163. Verifikasi pada stack lokal tetap terhalang Docker (T-010).
