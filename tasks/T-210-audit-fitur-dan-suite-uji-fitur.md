---
type: task
id: T-210
title: "Audit fitur dan rencana, suite uji fitur (aksi UI yang belum diuji)"
phase: P2
epic: E-03
release: v1.0
status: review
priority: P1
env: dev
effort_days: 1
depends: [T-204]
owner: "dev + pemilik"
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-210 Audit fitur dan rencana, suite uji fitur

Epic: [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data|E-03]]
Fase: P2
Bergantung pada: T-204

## Kriteria selesai

- [x] Inventaris aksi UI (167) dibandingkan dengan uji otomatis; cakupan langsung naik dari 46 persen ke 54 persen
- [x] Suite `tests/e2e/fitur.mjs` (13 uji, F-1 sampai F-14): koreksi, nonaktif, baris form, SPK Draft terbit, ceklis SPK stok, opname bahan baku, unduhan Excel, jenis material, alamat surat jalan; terdaftar di `run.mjs`
- [x] Audit rencana: deviasi, usul penyesuaian, dan risiko di [[FEATURE_AUDIT]]
- [x] Dokumen rencana dan panduan disegarkan (GO_LIVE_PLAN, INTEGRATION_PATH, ENVIRONMENTS, RELEASE_CHECKLIST, VERSION_STRATEGY, USER_GUIDE, INVENTORY, DEVELOPMENT, DATA_DICTIONARY, CHANGELOG, LOCAL_PREVIEW, README, AUDIT_KESIAPAN)
- [ ] Uji editor SPK (tambah baris, section, urut), Master Data (ganti nama, gabung), opname sparepart, dokumen kartu stok dan PR bahan baku

## Bukti

- Verified in browser (mock): `ONLY=fitur node tests/e2e/run.mjs http://127.0.0.1:5173/` 13 lulus, 0 gagal; tidak ada bug fungsional baru.
- Commit/branch: `fitur/produksi-multi-wc`.

## Catatan

- Aksi yang "belum diacu" adalah batas bawah (sebagian terpakai tidak langsung lewat klik teks); daftar dan prioritas ada di [[FEATURE_AUDIT]] bagian 1.3.
