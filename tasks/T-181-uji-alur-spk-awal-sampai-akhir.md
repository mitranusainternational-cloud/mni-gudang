---
type: task
id: T-181
title: "Uji alur lengkap SPK dari terbit sampai selesai, dengan tangkapan layar dan dokumentasi"
phase: P2
epic: E-02
release: v0.9
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-180]
owner: "dev + pemilik"
updated: 2026-11-05
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-181 Uji alur lengkap SPK

Epic: [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]]
Fase: P2
Bergantung pada: T-180
Dokumentasi: [[UJI_ALUR_SPK]]

## Kriteria selesai

- [x] Skrip uji `apps/platform/tests/e2e/alur-spk.mjs`: SPK dibuat, diterbitkan, dikerjakan di Shearing, Punching, Bending, dikirim ke vendor dan diterima kembali, dikirim ke customer dan diterima
- [x] Tangkapan layar tiap tahap (27 gambar) di `documentation/screenshots/alur-spk/`
- [x] Dokumen [[UJI_ALUR_SPK]] berisi tabel tahap, hasil, tangkapan layar berurutan, temuan, dan cara mengulang
- [x] 15 uji PASS, 0 FAIL
- [ ] Ditinjau pemilik

## Bukti

`verified in browser` (mock). Bukan bukti Supabase. Commit lokal di branch `fitur/produksi-multi-wc`.

## Catatan

Seluruh alur dijalankan pada satu hari sehingga batang Jadwal pendek. Filter awal Jadwal adalah Berjalan, jadi SPK selesai tidak tampil sampai filter Selesai atau Semua dipilih. Belum di-push.
