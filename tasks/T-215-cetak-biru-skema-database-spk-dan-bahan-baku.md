---
type: task
id: T-215
title: "Cetak biru skema database: peruntukan SPK dan kebutuhan bahan baku (draf migration 19)"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P2
env: dev
effort_days: 2
depends: [T-192, T-194]
owner: "dev + pemilik"
updated: 2026-11-07
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-215 Cetak biru skema database: peruntukan SPK dan kebutuhan bahan baku

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-192, T-194
Rancangan: [[BLUEPRINT_DB_ERP]]

## Kriteria selesai

- [x] Cetak biru empat alur integrasi dengan pemetaan terhadap kenyataan sistem (nama tabel, stok turunan dari `mutasi`, status SPK) di [[BLUEPRINT_DB_ERP]]
- [x] Draf `supabase/draft/20240101000019_spk_peruntukan_materials.sql`: enum peruntukan, `customer_id`, batasan NOT VALID, pemicu penjaga, tabel `spk_materials`, RLS, audit, daftar periksa, uji, rollback (hanya menambah)
- [ ] Keputusan pemilik K-1 sampai K-4 di [[BLUEPRINT_DB_ERP]]
- [ ] Uji draf di project dev atau branch Supabase (bukan production), lalu regresi aplikasi
- [ ] Langkah 2 sampai 4 (cadangan dan potong stok di database, pipeline vendor, view dashboard dan realtime)

## Bukti

- `source-level`: berkas SQL ditulis terhadap kolom `spk` production yang dibaca 2026-11-07 dan pola draf 17 dan 18; belum dijalankan di database mana pun.

## Catatan

Penerapan ke production hanya setelah persetujuan eksplisit pemilik dan uji di dev. Tidak menggandakan T-192 (turunan di aplikasi): T-215 menambah jaminan di database.
