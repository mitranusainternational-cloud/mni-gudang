---
type: task
id: T-012
title: "Hubungkan mni-app ke Supabase lokal"
phase: P1
epic: E-02
release: v0.9
status: todo
priority: P0
env: development
effort_days: 0.5
depends: [T-011, T-005]
owner: "dev"
updated: 2026-11-06
---

# T-012 Hubungkan mni-app ke Supabase lokal

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]  
Fase: P1 Fondasi lokal  
Bergantung pada: T-011, T-005

## Kriteria selesai

- [ ] .env.local terisi dari db:status
- [ ] App memuat tanpa error jaringan

## Bukti

- Belum ada.

## Catatan

-

> [!note] Audit 2026-11-06
> Terhalang Docker (T-010, virtualisasi BIOS nonaktif) dan kini tidak lagi di jalur kritis: aplikasi diuji di mock dan di Supabase production (baca-saja serta transaksi rollback). Usul: tutup sebagai digantikan atau biarkan menunggu keputusan pemilik atas jalur lokal.
