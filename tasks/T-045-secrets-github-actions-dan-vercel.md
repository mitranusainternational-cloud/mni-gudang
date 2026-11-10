---
type: task
id: T-045
title: "Secrets GitHub Actions dan Vercel"
phase: P4
epic: E-05
release: v1.0
status: todo
priority: P0
env: main
effort_days: 0.5
depends: [T-044]
owner: "dev"
updated: 2026-11-06
---

# T-045 Secrets GitHub Actions dan Vercel

Epic: [[roadmap/epics/E-05-environment-cloud-dan-ci-cd|E-05]]  
Fase: P4 Environment cloud  
Bergantung pada: T-044

## Kriteria selesai

- [ ] VITE_SUPABASE_URL/ANON_KEY, VERCEL_* terpasang
- [ ] Service-role key tidak ada di client atau repo

## Bukti

- Belum ada.

## Catatan

-

> [!note] Audit 2026-11-06
> Variabel Vercel Production terpasang (publishable saja; kunci service-role tidak di klien atau repo). CI memakai variabel dummy. Sisa: pemeriksaan ulang daftar variabel per environment.
