---
type: task
id: T-222
title: "Input SPK per dimensi (W, H, L) dengan KG estimasi dan KG real"
phase: P9
epic: E-16
release: v1.2
status: doing
priority: P1
env: dev
effort_days: 5
depends: [T-220, T-221]
owner: "dev + pemilik"
updated: 2026-11-09
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-222 Input SPK per dimensi dengan KG estimasi dan KG real

Rancangan: [[documentation/RANCANGAN_INPUT_SPK_DIMENSI|RANCANGAN_INPUT_SPK_DIMENSI]]
Bergantung pada: T-220, T-221

## Kriteria selesai

- [x] Tahap 1: fungsi murni `kgPerPcs` (KG estimasi dan KG real per pcs, lubang standar atau full hole) dan `totalKg` (estimasi memakai qty - ambil, real memakai qty penuh) di `apps/platform/src/lib/berat/bentuk.js`. Diuji K-01..K-09 (`tests/unit/kg-item.test.mjs`, 9 PASS) memakai fixture sintetis
- [x] Tahap 2: layar input di balik bendera `spkDimBaru` (Opsi SPK, mati secara bawaan). Kolom W (mm), H (mm), L (mm) terpisah dan selalu terlihat untuk Cable Tray, Perforated, dan Ladder; bentuk Straight default; nama item terbentuk dari dimensi; kg estimasi dan real per pcs dan footer plate (est) dan barang jadi (real) muncul bila katalog terpasang. Tanpa katalog, kg belum dihitung (berat manual tetap ada). Diuji DM-01..DM-06 (spkdimensi, 6 PASS). Cover, ACCS, dan fitting di layar ini belum mengikuti layout baru; kebutuhan plate belum berpindah ke kg estimasi (tahap 3)
- [ ] Tahap 3: kebutuhan plate memakai `kgEstTotal` (bukan `w` lama), reservasi dan stok barang jadi memakai `kgRealTotal`
- [ ] Tahap 4: lembar SPK dan footer menampilkan dua total (estimasi plate dan real barang jadi); tonase siap kirim memakai real
- [ ] Tahap 5: verifikasi di Supabase dan rilis bertahap

## Keputusan (2026-11-09)

- Pemetaan kg: KG estimasi = plate kosong setelah lubang; KG real = setelah lubang dan susut tekuk
- Cakupan tahap pertama: straight dan cover. Fitting menyusul
- Mode lubang ditentukan per item
- Lembar SPK cetak: dua total di footer
- Lokasi katalog: belum diputuskan (tetap Master Data)

## Bukti

Tingkat bukti: `source-level` untuk tahap 1 (fungsi murni, fixture sintetis). Tidak ada perubahan UI. `tests/unit/bentuk.test.mjs` 16 PASS, `tests/unit/kg-item.test.mjs` 9 PASS, `npm run test:unit` 34 PASS, lint 0 error. Rumus perusahaan tidak masuk Git; nilai uji nyata belum dipakai.

Batas yang jujur: belum diuji dengan katalog perusahaan, belum di Supabase, dan belum ada layar input baru.
