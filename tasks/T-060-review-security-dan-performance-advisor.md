---
type: task
id: T-060
title: "Review security dan performance advisor"
phase: P6
epic: E-06
release: v1.0
status: review
priority: P0
env: main
effort_days: 1
depends: [T-042]
owner: "dev"
updated: 2026-11-06
---

# T-060 Review security dan performance advisor

Epic: [[roadmap/epics/E-06-uat-hardening-dan-go-live|E-06]]  
Fase: P6 Hardening dan rilis  
Bergantung pada: T-042

## Kriteria selesai

- [x] Temuan advisor dev dan prod ditinjau
- [ ] Kritis diperbaiki, lainnya diterima dengan alasan

## Bukti
- Advisor production 2026-11-06 (baca-saja): keamanan 8 WARN fungsi bantu RLS (`can_any`, `can_mod`, `can_view`, `get_user_role`, `is_admin`, `is_admin_or_manager`, `is_authenticated`, `mod_level`) yang disengaja karena dipakai kebijakan RLS, dan 1 WARN proteksi password bocor belum aktif (butuh paket berbayar, aksi pemilik). Performa: 3 WARN kebijakan permisif ganda (`muser`, `role_modules`, `ureq`), INFO 22 indeks belum terpakai dan 4 tabel arsip tanpa kunci primer (skema `arsip_20261105`). Tidak ada temuan kritis.

## Catatan

Advisor keamanan Supabase dev (2026-11-02): fungsi SECURITY DEFINER `get_user_role`, `is_authenticated`, `is_admin_or_manager` dapat dipanggil lewat RPC oleh anon dan authenticated; `pg_trgm` di schema public. Pertimbangkan memindahkan fungsi ke schema privat dan mencabut EXECUTE dari anon.

-

> [!note] Audit 2026-11-06
> Kriteria kedua (kritis diperbaiki, lainnya diterima dengan alasan) menunggu pemilik menerima temuan di atas.
