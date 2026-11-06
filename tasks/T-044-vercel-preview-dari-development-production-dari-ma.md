---
type: task
id: T-044
title: "Vercel: preview dari development, production dari main"
phase: P4
epic: E-05
release: v1.0
status: doing
priority: P0
env: main
effort_days: 1
depends: [T-041, T-042]
owner: "dev"
updated: 2026-11-06
---

# T-044 Vercel: preview dari development, production dari main

Epic: [[roadmap/epics/E-05-environment-cloud-dan-ci-cd|E-05]]  
Fase: P4 Environment cloud  
Bergantung pada: T-041, T-042

## Kriteria selesai

- [ ] Preview memakai Supabase dev
- [ ] Production memakai Supabase prod
- [ ] Env var per environment

## Bukti

- Production dari `main` aktif di `mni-gudang.vercel.app`. Sisa: variabel Vercel untuk Preview.
- Belum ada.

## Catatan

Team Vercel NIJ sudah ada dengan 0 project (2026-11-02). Menghubungkan repo organisasi GitHub butuh izin aplikasi Vercel pada organisasi tersebut; dilakukan pemilik akun.

-

> [!note] Audit 2026-11-06
> Production dari `main` aktif. Sisa: variabel Vercel untuk Preview dan pemetaan cabang fitur ke Preview. Cabang kerja kini `fitur/<nama>` (bukan `development`).
