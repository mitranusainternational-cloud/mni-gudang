---
type: task
id: T-011
title: "Jalankan Supabase local stack dan terapkan migration"
phase: P1
epic: E-02
release: v0.9
status: todo
priority: P0
env: development
effort_days: 0.5
depends: [T-010]
owner: "dev"
updated: 2026-11-06
---

# T-011 Jalankan Supabase local stack dan terapkan migration

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]  
Fase: P1 Fondasi lokal  
Bergantung pada: T-010

## Kriteria selesai

- [ ] npm run db:start sukses
- [ ] 20 tabel dan kebijakan RLS terpasang (db:status, psql)

## Bukti

- Belum ada.

## Catatan

-

> [!note] Audit 2026-11-06
> Terhalang Docker (T-010, virtualisasi BIOS nonaktif) dan kini tidak lagi di jalur kritis: aplikasi diuji di mock dan di Supabase production (baca-saja serta transaksi rollback). Usul: tutup sebagai digantikan atau biarkan menunggu keputusan pemilik atas jalur lokal.
