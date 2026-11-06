---
type: task
id: T-013
title: "Seed data sintetis per role"
phase: P1
epic: E-02
release: v0.9
status: todo
priority: P1
env: development
effort_days: 1
depends: [T-011]
owner: "dev"
updated: 2026-11-06
---

# T-013 Seed data sintetis per role

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]  
Fase: P1 Fondasi lokal  
Bergantung pada: T-011

## Kriteria selesai

- [ ] Satu user per role (admin, manager, produksi, gudang, viewer)
- [ ] Contoh RM, FG, SPK, vendor sintetis
- [ ] Tidak ada data nyata

## Bukti

- Belum ada.

## Catatan

-

> [!note] Audit 2026-11-06
> Terhalang Docker (T-010, virtualisasi BIOS nonaktif) dan kini tidak lagi di jalur kritis: aplikasi diuji di mock dan di Supabase production (baca-saja serta transaksi rollback). Usul: tutup sebagai digantikan atau biarkan menunggu keputusan pemilik atas jalur lokal.
