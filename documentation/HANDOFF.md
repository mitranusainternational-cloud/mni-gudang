---
type: registry
status: active
title: "Serah terima sesi (ganti akun Claude)"
updated: 2026-11-06
---

# Serah terima: melanjutkan proyek dengan akun Claude lain

Catatan ini cukup untuk memulai sesi baru tanpa riwayat percakapan lama. Tidak memuat rahasia. Aturan kerja ada di [[AGENTS]] dan `CLAUDE.md`; dashboard di [[Home]]; peta koneksi di [[documentation/SISTEM_MAP]].

## 1. Posisi proyek (2026-11-06)

- Cabang kerja: `fitur/produksi-multi-wc`. **Sudah di-push ke GitHub** (diverifikasi 2026-11-06, sama dengan lokal, 41 commit di depan `development`). `development`, `main`, `docs`, `versi-awal` di GitHub masih versi lama yang sudah live; `main` di `43e8da2` (PR 14), Vercel dan CI sukses.
- Validasi koneksi 2026-11-06 (baca-saja): GitHub, Supabase production (13 migration = repo 1–13), dan Vercel yang tayang saling cocok; detail di [[PROJECT_PROGRESS]] entri terbaru. Composio belum terverifikasi; variabel Vercel baru berlabel Production.
- Semua pekerjaan terbaru **lokal, belum menyentuh production**: produksi multi WC (T-174 sampai T-186), ERP hulu E-16: mesin harga (T-189), Penawaran (T-190), muat ke SPK dan snapshot (T-191), Sales Order (T-194), kebutuhan material dan reservasi (T-192). Status `review`, menunggu pemilik.
- Alur hulu ke hilir yang sudah jalan di mock: Penawaran, disetujui customer, Buat Sales Order (PO, due date, tebal, finishing), Konfirmasi, SPK Draft otomatis, terbit, produksi, vendor, kirim. Panel Kebutuhan material ada di Sales Order dan lembar SPK.
- Berikutnya: **T-193** monitoring estimasi lawan aktual. Detail status per tugas ada di `tasks/` (sumber kebenaran).
- Tingkat bukti: semua fitur baru `verified in browser` (mock). Belum ada bukti Supabase untuk migration 14, 15, 16.

## 2. Yang HANYA ada di mesin ini (cadangkan sebelum ganti akun atau mesin)

Tidak ikut Git dan bukan milik akun Claude, jadi aman dari pergantian akun, tetapi hilang bila mesin rusak.

| Berkas | Isi | Catatan |
|---|---|---|
| `apps/platform/.env.local`, `.env.supabase-dev.local`, `.env.supabase-prod.local` | URL dan kunci publik Supabase | simpan di pengelola kata sandi, jangan di chat |
| `apps/platform/src/lib/erp/katalog-harga.json`, `skenario-harga.json` | rumus dan harga penawaran (rahasia perusahaan) | dibangun ulang dengan `node scripts/build-quote-catalog.mjs` dari workbook |
| `apps/platform/src/lib/berat/catalog.json` | katalog rumus berat | dibangun dari workbook berat |
| `apps/platform/tests/unit/erp-excel-expected.json`, `erp-excel-totals.json`, `berat-excel-expected.json` | nilai Excel untuk uji emas | dibangun ulang bersama katalog |
| Workbook sumber (di luar repo): Brilliant Quotation OK 1.xls, DATA RAW MATERIAL oktober | sumber katalog dan data | simpan salinan di tempat aman |
| `ganti-nama-ke-mni-gudang.ps1`, `tunggu-lalu-ganti-nama.ps1`, `ganti-nama.log` (folder induk) | rename folder `mni-os` ke `mni-gudang` (T-164) | belum berhasil karena folder dipakai proses lain |

Repo GitHub **publik**: jangan masukkan rumus, harga, biaya, margin, atau data operasional nyata ke Git atau vault.

## 3. Yang melekat pada akun Claude (perlu disambung ulang di akun baru)

- Konektor **Supabase kedua** untuk production `MNI Gudang - Production` (`lggqigmvtefkquqjrjsb`, akun mitranusainternational). Konektor lama `plugin_supabase` (dev lama `inldyqigewmziwazalun`) dipensiunkan.
- **Vercel**: hanya tim `mitranusainternational-8337`, dipakai lewat Chrome yang sudah login. Konektor Vercel bawaan Claude menunjuk tim lain; jangan dipakai.
- Ekstensi Claude in Chrome, plugin Playwright dan Context7 (opsional, untuk uji dan dokumentasi).
- `gh` sudah login sebagai `mitranusainternational-cloud` di mesin ini (bukan akun Claude), jadi push tetap bisa: `git -c credential.helper= -c "credential.helper=!gh auth git-credential" push origin <cabang>`.
- Yang tinggal di repo dan ikut otomatis: `CLAUDE.md`, `AGENTS.md`, `.claude/skills` (termasuk ERP: excel-model-extraction, erp-quotation-engine, erp-module-boundary, erp-flow-hulu-hilir), `.claude/agents` (erp-architect, pricing-engineer, erp-integrator, ops-monitor-analyst, dan lainnya).
- Riwayat percakapan lama tidak berpindah. Transkrip lokal ada di `C:\Users\welcome\.claude\projects\` (folder proyek ini).

## 4. Cara menjalankan

```bash
cd apps/platform
VITE_LOCAL_MOCK=1 npx.cmd vite --host 127.0.0.1 --port 5173 --strictPort   # pratinjau mock
node scripts/extract-app.js            # wajib setelah mengubah apps/gudang-logistik (app.js, app.css)
for f in tests/unit/*.test.mjs; do node "$f"; done
node tests/e2e/run.mjs http://127.0.0.1:5173/   # regresi penuh; lama, bisa dipecah per suite
node tests/e2e/alur-spk.mjs                      # alur SPK lama
node tests/e2e/alur-penawaran.mjs                # alur hulu ke hilir
cd ../.. && node scripts/sync-vault.mjs          # harus berakhir OK sebelum commit
```

Login mock: admin@mni.local, OTP 123456 (juga ppic, gbb, gbj, logistik, produksi, viewer, sales @mni.local). Setelah menjalankan `alur-spk.mjs`, pulihkan tangkapan: `git checkout -- documentation/screenshots/alur-spk`. Katalog harga uji tersedia di `apps/platform/tests/e2e/fixtures/` (sintetis, aman di Git).

Commit lokal dengan identitas `mitranusainternational-cloud` / `mitranusainternational@gmail.com`.

## 5. Keputusan pemilik yang masih terbuka

1. Nilai batas diskon per peran dan penyetuju (sementara 30% untuk Sales, admin tanpa batas) dan kode nomor penawaran (sementara `MNI`).
2. Pemetaan keluarga katalog ke produk SPK (sementara ST* tray, SL* ladder, bentuk lurus CABLE, lainnya ACCS) dengan katalog asli.
3. Apakah satu PO pernah dipecah ke beberapa SPK (sekarang satu SO sama dengan satu SPK).
4. Stok berkurang otomatis saat SPK terbit atau tetap saat gudang mencatat Pakai (sekarang: saat Pakai, dengan reservasi di antaranya).
5. Faktor sisa potong sebenarnya per produk (sementara 1,1) dan pencatatan sisa potongan.
6. Jam kerja dan target KPI per work center (T-183).
7. Tinjauan tampilan Penawaran dan Sales Order.

## 6. Tindakan yang menunggu persetujuan eksplisit pemilik

- ~~Push cabang `fitur/produksi-multi-wc`~~ sudah selesai (cabang fitur saja, bukan `main`).
- Menerapkan draf migration 14 (produksi_log), 15 (penawaran), 16 (salesorder) di Supabase, urutannya 14, 15, 16, dimulai dari dev lalu production.
- Menerapkan draf migration 17 (`supabase/draft/20240101000017_stok_tidak_negatif.sql`, pemicu anti stok negatif dan pengeluaran bersamaan). Belum pernah dijalankan di database mana pun; uji dulu di dev atau branch dengan 5 langkah uji di berkasnya, lalu production.
- Menerapkan draf migration 18 (`supabase/draft/20240101000018_sparepart.sql`): tabel `sp`, kebijakan mutasi/PR untuk modul sparepart, peran gbb. Belum diterapkan; cocokkan nama pemicu stempel dengan migration 12 dulu. Tanpa ini sparepart dan PR sparepart tidak bisa jalan di production.
- PR ke `main` (1 approval), deploy Vercel, DNS.
- Menghapus skema cadangan `arsip_20261105` di production setelah pemilik puas.
- Menjalankan skrip ganti nama folder (tutup Obsidian dan semua sesi/terminal di folder itu lebih dulu).

## 7. Kalimat pembuka untuk sesi baru

> Baca `CLAUDE.md`, `AGENTS.md`, dan `documentation/HANDOFF.md`. Lanjutkan proyek MNI Gudang & Logistik dari tugas T-193 (monitoring estimasi lawan aktual), tetap lokal dan jangan menyentuh production tanpa persetujuan saya. Setiap perubahan diikuti regresi penuh 0 FAIL, vault diperbarui, dan `node scripts/sync-vault.mjs` OK sebelum commit.
