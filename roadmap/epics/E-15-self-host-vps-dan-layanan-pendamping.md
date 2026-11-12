---
type: epic
id: E-15
title: "Self-host VPS dan layanan pendamping"
release: v2.0
theme: Platform
priority: P2
status: planned
progress: 0
tasks_total: 2
tasks_done: 0
updated: 2026-11-12
---

# E-15 Self-host VPS dan layanan pendamping

Rilis target: **v2.0** · Tema: Platform · Prioritas: P2
Induk: [[roadmap/PRODUCT_ROADMAP|Roadmap produk]] · Jalur: [[documentation/INTEGRATION_PATH]] (tahap S6)

## Hasil yang diinginkan

Keputusan berbasis bukti apakah VPS dipakai, dan bila ya, layanan pendamping (backup, monitoring, otomasi impor, situs Docs) berjalan di server sendiri dengan backup teruji. Memindahkan database ke self-host hanya bila ada alasan terukur.

## Risiko dan asumsi

Hipotesis; belum ada alasan terukur (biaya, data, perawat server). Satu server menjadi titik gagal; pembaruan Supabase self-host dan email OTP (SMTP) menambah beban perawatan.

## Tugas

- [ ] [[tasks/T-160-penilaian-kesiapan-vps-dan-keputusan|T-160]] Penilaian kesiapan VPS dan keputusan · todo · P2 · 1 hari
- [ ] [[tasks/T-161-layanan-pendamping-vps-backup-dan-monitoring|T-161]] Layanan pendamping VPS: backup dan monitoring · todo · P2 · 3 hari

> Properti status, progress, dan jumlah tugas serta daftar ini dibuat otomatis oleh `node scripts/progress-report.mjs`. Jangan ubah manual. Tampilan interaktif: [[PROGRESS_DASHBOARD]].
