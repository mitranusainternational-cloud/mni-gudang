---
type: task
id: T-034
title: "Skrip impor terkontrol (dry-run dan laporan)"
phase: P3
epic: E-04
release: v1.0
status: todo
priority: P1
env: development
effort_days: 4
depends: [T-033]
owner: "dev"
updated: 2026-11-07
---

# T-034 Skrip impor terkontrol (dry-run dan laporan)

Epic: [[roadmap/epics/E-04-proses-data-dan-pilot|E-04]]  
Fase: P3 Data dan proses  
Bergantung pada: T-033, T-011

## Kriteria selesai

- [ ] Mode dry-run, validasi tipe/key/relasi, laporan error
- [ ] Idempotent
- [ ] Dijalankan lebih dulu pada salinan (branch atau project Supabase sementara), baru ke production setelah rekonsiliasi disetujui

## Bukti

- Belum ada.

## Catatan

-

## Catatan

Dependensi T-011 (Supabase lokal lewat Docker) dilepas pada 2026-11-07: Docker tetap terblokir (T-010) dan tidak lagi dibutuhkan karena production Supabase dipakai langsung dan project dev lama dipensiunkan. Tanpa perubahan ini jalur kritis menuju go-live bergantung pada tugas yang tidak akan dikerjakan. Pekerjaan impor yang sudah terjadi (T-175 stok barang jadi, T-184 bahan baku, T-170 impor CSV dengan pratinjau) bukan pengganti T-035 (rekonsiliasi dengan persetujuan owner data).
