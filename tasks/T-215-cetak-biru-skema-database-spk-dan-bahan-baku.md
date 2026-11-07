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
- [x] K-1 diputuskan 2026-11-07: cadangan dulu
- [x] Draf `supabase/draft/20240101000020_spk_cadangan_bahan.sql` (cadangan, pelepasan, sinkron pengeluaran, view ketersediaan) ditinjau empat sudut dan diuji di Postgres lokal: 48 PASS ([[BLUEPRINT_DB_ERP]] bagian 6)
- [x] K-3 diputuskan 2026-11-07: ada SPK tanpa PO sah; kolom `tanpa_po_alasan` dan aturan tahap ketat diuji (K-01..K-04)
- [x] Langkah 3 draf `supabase/draft/20240101000021_pipeline_posisi_vendor.sql` (view vendor dan posisi, penjaga item vendor, penjaga SPK Selesai) diuji di Postgres lokal; total 67 PASS
- [ ] Kolom alasan tanpa PO di editor SPK (UI) sebelum tahap ketat dipasang
- [ ] Keputusan pemilik K-2 (SPK lama dengan nama customer tidak cocok master) dan K-4 (penerapan)
- [ ] Uji draf di project dev atau branch Supabase (bukan production), lalu regresi aplikasi
- [x] Langkah 4 draf `supabase/draft/20240101000022_dashboard_agregasi_realtime.sql` (view ringkasan dashboard, status dan progres SPK, bahan baku, OTD, Realtime) diuji di Postgres lokal; total 85 PASS
- [ ] Simpan snapshot rute per item saat SPK terbit (aplikasi) agar progres produksi di view akurat, lalu bandingkan angka view dengan layar di project dev
- [ ] Integrasi aplikasi: frontend membaca view dan berlangganan Realtime (setelah keputusan penerapan K-4)

## Bukti

- `verified in database` (Postgres lokal PGlite): `tests/sql/cadangan.sql.test.mjs` 85 PASS untuk draf 17, 19, 20, 21, 22. Belum di Supabase dev atau production.
- Tinjauan adversarial empat sudut: 21 temuan, 19 nyata, semua diperbaiki dan dikunci dengan uji.

## Catatan

Penerapan ke production hanya setelah persetujuan eksplisit pemilik dan uji di dev. Tidak menggandakan T-192 (turunan di aplikasi): T-215 menambah jaminan di database.
