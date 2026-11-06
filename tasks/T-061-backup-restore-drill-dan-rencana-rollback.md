---
type: task
id: T-061
title: "Backup, restore drill, dan rencana rollback"
phase: P6
epic: E-06
release: v1.0
status: todo
priority: P0
env: main
effort_days: 1
depends: [T-043]
owner: "dev"
updated: 2026-11-06
---

# T-061 Backup, restore drill, dan rencana rollback

Epic: [[roadmap/epics/E-06-uat-hardening-dan-go-live|E-06]]  
Fase: P6 Hardening dan rilis  
Bergantung pada: T-043

## Kriteria selesai

- [ ] Restore berhasil pada project uji
- [ ] Rollback app (Vercel) dan DB tertulis

## Bukti

- Belum ada.

## Catatan

-

> [!note] Audit 2026-11-06
> Belum ada restore drill. Panduan ada di [[BACKUP_RESTORE]] dan cadangan data aplikasi lewat T-170. Backup terjadwal Supabase dan uji pulih adalah aksi pemilik; wajib sebelum rilis besar T-203 sebagai jaring pengaman (minimal ekspor tabel inti).
