---
type: registry
status: active
title: "Serah terima sesi (ganti akun Claude)"
updated: 2026-11-06
---

# Serah terima: melanjutkan proyek dengan akun Claude lain

Prompt siap tempel untuk akun lain: [[SERTIJOB]].

Catatan ini cukup untuk memulai sesi baru tanpa riwayat percakapan lama. Tidak memuat rahasia. Aturan kerja ada di [[AGENTS]] dan `CLAUDE.md`; dashboard di [[Home]]; peta koneksi di [[documentation/SISTEM_MAP]].

## 1. Posisi proyek (2026-11-06, setelah audit dokumentasi T-204)

- **Production (live):** `main` di `ad73c89` (PR 15, surat jalan: alamat, tabel partial, penomoran otomatis). Supabase production: migration 1 sampai 13; baris rm 24, fg 92, mutasi 19, spk 8, pr 0, kirim 7, vendor 5, user 10 (dicek baca-saja 2026-11-06). Vercel dan CI sukses.
- **Cabang kerja:** `fitur/produksi-multi-wc` di `35bf7f7` (lokal; sudah menggabung `main` terbaru, regresi penuh hijau). Pekerjaan setelah push terakhir (gudang bahan baku, sparepart, SPK stok, tren, dokumen, nama penanda tangan, penjaga kirim) **belum di-push** dan belum menyentuh production.
- **Pegangan utama:** [[PETA_MODUL]] (modul, hulu, hilir, migration, dokumen, status per lingkungan), [[PRD_GUDANG]] (aturan stok, buffer, SPK stok, penjaga, dokumen), [[PRD_PRODUKSI]], [[SISTEM_MAP]] (sumber daya).
- **Selesai di lokal (status `review`, menunggu pemilik):** produksi multi WC (T-174, T-177 sampai T-186), ERP hulu (T-190 sampai T-194, **disembunyikan** lewat `MODUL_PENJUALAN=false`, T-202), gudang bahan baku (T-196), sparepart (T-197), barang jadi dengan buffer dan rencana produksi (T-198), SPK stok ujung ke ujung dan penjaga hasil produksi (T-199), tren dan PR sparepart (T-200), nama penanda tangan dokumen (T-201).
- **Rilis ke production dijeda** atas permintaan pemilik (2026-11-06: fokus pemolesan lokal dahulu): [[T-203-rilis-paket-gudang-dan-produksi-ke-production]]. Rencananya: database dahulu (migration 14 lalu 18, hanya menambah; 17 tidak ikut), lalu PR ke `main`, deploy Vercel, verifikasi, dengan rollback Vercel siap.
- **Hal yang harus diketahui sebelum rilis:** cabang ini membawa 175 berkas dari `main` (bukan hanya gudang), dan penjaga kirim ke customer mengubah perilaku di production (SPK lama yang produksinya tidak pernah dicatat tertahan sampai dicatat atau override dipakai).
- Berikutnya (lokal): pemolesan modul per permintaan pemilik; tugas terbuka T-193 (monitoring estimasi lawan aktual, ditunda karena Penawaran disembunyikan), T-111 sampai T-113 (aturan Cek Data, opname terjadwal, validasi buffer).
- Tingkat bukti: semua fitur baru `verified in browser` (mock) dan unit; belum ada bukti Supabase untuk migration 14, 15, 16, 18. Uji (2026-11-07, semua 0 FAIL): regresi 42, role 12, akses 34, produksi 134, penawaran 42, sparepart 38, fitur 18, keamanan 8, aksesibilitas 3, menyeluruh 24, editor 17, alur lengkap 31, spk terstruktur 18, tampilan 72, unit 266, lint 0 galat dan 42 peringatan (batas CI 43). Audit silang: [[AUDIT_PROGRESS_2026-11-07]].

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
node tests/e2e/alur-penawaran.mjs                # alur hulu ke hilir (Penawaran, Sales Order, SPK)
ONLY=editor node tests/e2e/run.mjs http://127.0.0.1:5173/   # satu suite; Penawaran dinyalakan mock lewat kunci uji localStorage mni-uji-penjualan (production tetap tersembunyi)
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
8. Input SPK terstruktur ([[INPUT_SPK_TERSTRUKTUR]] bagian 4): full hole bentuk lain (default Perforated = full hole sudah diputuskan dan dibangun 2026-11-07), dan koreksi asumsi tahap routing yang sudah dibangun 2026-11-07 ([[INPUT_SPK_TERSTRUKTUR]] bagian 4a): SPHC Non Finishing tanpa vendor, rute per produk dan bentuk, pengecualian vendor per baris.
9. Unggah ulang katalog berat dari workbook baru di production (Master Data, Katalog berat) agar full hole muncul.

## 6. Tindakan yang menunggu persetujuan eksplisit pemilik

- ~~Push cabang `fitur/produksi-multi-wc`~~ sudah selesai (cabang fitur saja, bukan `main`).
- Menerapkan draf migration 14 (produksi_log), 15 (penawaran), 16 (salesorder) di Supabase, urutannya 14, 15, 16, dimulai dari dev lalu production.
- Menerapkan draf migration 17 (`supabase/draft/20240101000017_stok_tidak_negatif.sql`, pemicu anti stok negatif dan pengeluaran bersamaan). Belum pernah dijalankan di database mana pun; uji dulu di dev atau branch dengan 5 langkah uji di berkasnya, lalu production.
- Menerapkan draf migration 18 (`supabase/draft/20240101000018_sparepart.sql`): tabel `sp`, kebijakan mutasi/PR untuk modul sparepart, peran gbb. Belum diterapkan; nama pemicu stempel dan kebijakan sudah dicocokkan dengan production (baca-saja 2026-11-06) dan draf memuat `table_stamps` dengan `sp`. Terapkan setelah migration 14. Tanpa ini sparepart dan PR sparepart tidak bisa jalan di production.
- PR ke `main` (1 approval), deploy Vercel, DNS.
- Menghapus skema cadangan `arsip_20261105` di production setelah pemilik puas.
- Menjalankan skrip ganti nama folder (tutup Obsidian dan semua sesi/terminal di folder itu lebih dulu).

## 7. Kalimat pembuka untuk sesi baru

> Baca `CLAUDE.md`, `AGENTS.md`, dan `documentation/HANDOFF.md`. Baca juga `documentation/PETA_MODUL.md` dan `documentation/PRD_GUDANG.md`. Lanjutkan proyek MNI Gudang & Logistik dengan memoles modul sesuai permintaan saya (rilis ke production dijeda, lihat T-203), tetap lokal dan jangan menyentuh production tanpa persetujuan saya. Setiap perubahan diikuti regresi penuh 0 FAIL, vault diperbarui, dan `node scripts/sync-vault.mjs` OK sebelum commit.
