---
type: task
id: T-101
title: "Tegakkan role di UI selaras RLS (ROLE_ON)"
phase: P8
epic: E-09
release: v1.1
status: review
priority: P1
env: development
effort_days: 3
depends: [T-065]
owner: "dev"
updated: 2026-11-06
---

# T-101 Tegakkan role di UI selaras RLS (ROLE_ON)

Epic: [[roadmap/epics/E-09-akses-peran-dan-audit|E-09]] · Rilis v1.1 · Fase P8 v1.1 Stabilisasi, akses, kualitas data
Bergantung pada: T-065

## Kriteria selesai

- [ ] Menu dan aksi UI mengikuti role admin, ppic, gbb, gbj, logistik, viewer
- [x] Percobaan aksi terlarang ditolak UI dan database (mock dan RLS; lihat TEST_MATRIX)
- [ ] Matriks role disetujui pemilik proses

## Bukti
- Penegakan UI per peran (`ROLES`, `guard()`) dan per pengguna terbukti di mock: roles.mjs 12 dan access.mjs 34 lulus; di production lewat T-167 dan T-079.

## Catatan

Sebagian dikerjakan lebih awal (2026-11-02): `guard()` aktif berdasarkan peran dari backend tanpa `ROLE_ON`; model role mengikuti `ROLES` aplikasi (bukan manager/produksi/gudang). Sisa: menu Pengguna & Akses, undangan, klaim (`ROLE_ON`), menyembunyikan tombol per modul, pesan galat database yang ramah.

- Tugas pasca go-live: lingkup dan prioritas ditinjau ulang setelah hypercare (T-065) dan temuan UAT.

> [!note] Audit 2026-11-06
> Tinggal pengesahan matriks peran oleh pemilik proses (T-036) dan pembahasan hak modul sparepart.
