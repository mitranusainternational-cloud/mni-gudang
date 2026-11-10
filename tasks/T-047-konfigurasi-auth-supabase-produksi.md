---
type: task
id: T-047
title: "Konfigurasi Auth Supabase produksi"
phase: P4
epic: E-05
release: v1.0
status: doing
priority: P0
env: main
effort_days: 1
depends: [T-042]
owner: "dev"
updated: 2026-11-06
---

# T-047 Konfigurasi Auth Supabase produksi

Epic: [[roadmap/epics/E-05-environment-cloud-dan-ci-cd|E-05]]  
Fase: P4 Environment cloud  
Bergantung pada: T-042

## Kriteria selesai

- [ ] SMTP produksi, redirect URL, rate limit OTP
- [ ] Self-signup nonaktif; user hanya dari muser

## Bukti

- Site URL benar dan pendaftaran bebas mati (diverifikasi 2026-11-03). Sisa: periksa tanda `*` pada Redirect URL; leaked password protection menunggu paket berbayar.
- Belum ada.

## Catatan

Prioritas naik: tanpa SMTP sendiri login OTP terkena batas email (HTTP 429) setelah beberapa permintaan, dan templat email perlu memuat {{ .Token }}. Lihat [[documentation/ENVIRONMENTS]].

-

> [!note] Audit 2026-11-06
> Sisa: Redirect URL tanpa tanda bintang, SMTP sendiri (batas email 429), proteksi password bocor (paket berbayar). Semua aksi pemilik di dashboard Supabase.
