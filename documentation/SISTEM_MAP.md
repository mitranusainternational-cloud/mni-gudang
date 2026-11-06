---
type: registry
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Peta sistem: nama baku, sumber daya, dan cara memantau

Satu halaman untuk menjawab "apa saja yang kita punya, namanya apa, dan di mana melihat statusnya". Perbarui halaman ini setiap kali sebuah sumber daya dibuat, diganti nama, atau dipindah. Ringkasan lingkungan: [[ENVIRONMENTS]]. Log kerja: [[PROJECT_PROGRESS]]. Kesiapan: [[AUDIT_KESIAPAN]].

## Konvensi nama

| Hal | Aturan | Contoh |
|---|---|---|
| Nama produk | **MNI Gudang & Logistik** | judul halaman, README |
| Slug (huruf kecil, tanda hubung) | **`mni-gudang`** untuk repo, project Vercel, dan folder kerja | `mni-gudang` |
| Nama tampilan Supabase | **MNI Gudang - {Environment}** | MNI Gudang - Production, MNI Gudang - Dev |
| Environment | Production, Staging (preview Vercel), Dev, Lokal (mock) | |
| Branch | `main` (stabil, hanya lewat PR), `development` (kerja), `docs` (cermin dokumentasi), `versi-awal` (beku) | |
| Commit | kalimat perintah Bahasa Indonesia, jelas satu perubahan; trailer Co-Authored-By bila dibantu Claude | "Perbaiki B-018: muat ulang setelah login" |
| Migration | `2024010100NNNN_nama_singkat.sql` berurutan, tidak mengubah yang sudah terpasang | `20240101000010_atomic_try_lock.sql` |
| Tugas / bug / keputusan | `T-nnn` (vault `tasks/`), `B-nnn` (TEST_MATRIX), keputusan bertanggal di DECISIONS | T-162, B-018 |
| Label GitHub | `area:*`, `env:*`, `prioritas:P0|P1|P2`, `jenis:tugas|temuan` | `area:database` |

## Daftar sumber daya

### GitHub

| Item | Nilai |
|---|---|
| Akun | `mitranusainternational-cloud` |
| Repo | **`mni-gudang`** (publik; dahulu `MNI-OS---Operational`, alamat lama dialihkan otomatis) |
| URL | https://github.com/mitranusainternational-cloud/mni-gudang |
| Branch | `main` (terproteksi: PR, 1 approval, CI wajib), `development`, `docs`, `versi-awal` |
| CI | `.github/workflows/ci.yml`: job "Vault (tautan dan properti)" dan "Aplikasi (build dan regresi mock)" |
| Keamanan | secret scanning dan push protection aktif; Dependabot alerts nonaktif (lihat AUDIT_KESIAPAN) |
| Template | PR ([[PULL_REQUEST_TEMPLATE]]) dan isu (`temuan`, `tugas`) di `.github/`; CODEOWNERS; kebijakan [[SECURITY]]; [[CHANGELOG]] |

### Vercel

| Item | Nilai |
|---|---|
| Tim | `mitranusainternational-8337` (Hobby) |
| Project | **`mni-gudang`** (dahulu `mni-os-operational`) |
| Domain production | **https://mni-gudang.vercel.app** (alias lama `mni-os-operational.vercel.app` masih aktif dan menuju deploy yang sama) |
| Root dan build | `apps/platform`, preset Vite; `vercel.json` (install `npm ci --ignore-scripts`, build `node scripts/extract-app.js && vite build`) |
| Pemetaan branch | `main` ke Production; branch lain (mis. `development`) ke Preview |
| Env | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable, Production dan Preview) |

### Supabase

| Item | Production | Dev lama |
|---|---|---|
| Nama | **MNI Gudang - Production** | MNI Gudang - Dev |
| Ref | `lggqigmvtefkquqjrjsb` | `inldyqigewmziwazalun` |
| URL | https://lggqigmvtefkquqjrjsb.supabase.co | https://inldyqigewmziwazalun.supabase.co |
| Akun / organisasi | mitranusainternational, "Software Devellopment" | akun pribadi pemilik (dipensiunkan setelah production terbukti) |
| Region | eu-central-1 (Frankfurt) | ap-southeast-1 (Singapura) |
| Konektor Claude | konektor Supabase kedua (id `72053749-…`) | konektor `plugin_supabase` |
| Isi | migration 1–13 terpasang (dicek 2026-11-06), 22 tabel ber-RLS, data operasional nyata | data uji saja |

Project lain di akun-akun itu (`MNI - Operational`, `MNI OS`, `MNI OS - Operational`, `Marketing OS - NIJ`) bukan bagian sistem ini: jangan disentuh.

### Lokal

| Item | Nilai |
|---|---|
| Folder kerja (repo dan vault) | saat ini masih `D:\Sistem Kerja\01_Kerja\01_Proyek_Aktif\12. Sistem MNI\mni-os\`; nama baku tujuan `mni-gudang\` (belum diganti karena folder masih dipakai proses lain; penggantian nama lewat skrip `ganti-nama-ke-mni-gudang.ps1` di folder induk, lihat [[T-164-samakan-nama-folder-lokal-ke-mni-gudang]]) |
| Arsip | `12. Sistem MNI\_Arsip\` (folder lama, tidak dikerjakan) |
| Server lokal | 5173 mock (data sintetis), 5174 Supabase dev lama, 5175 Supabase production; env di `apps/platform/.env.*.local` (tidak di Git) |
| Obsidian | vault = folder kerja; mulai dari [[Home]] |

### Akun dan konektor (pegangan agar tidak salah sasaran)

| Layanan | Akun yang dipakai |
|---|---|
| GitHub | mitranusainternational-cloud (login `gh`) |
| Vercel | mitranusainternational-8337 lewat Chrome pemilik; konektor Vercel Claude terhubung ke tim lain: jangan dipakai |
| Supabase production | akun mitranusainternational (konektor kedua) |
| Supabase dev lama | akun pribadi pemilik (konektor `plugin_supabase`, dipensiunkan: jangan dipakai untuk production) |
| Composio | belum terverifikasi untuk akun ini (2026-11-06); jangan dipakai sebelum dicocokkan |

## Alur data antar-lapisan

```text
folder lokal (mni-gudang)  --git push-->  GitHub (development)  --PR + CI-->  GitHub (main)
                                                                   |                |
                                                                   v                v
                                                          Vercel Preview     Vercel Production
                                                                   \                /
                                                                    v              v
                                                         Supabase (Production: MNI Gudang - Production)
```

Migration: file di `apps/platform/supabase/migrations/` (Git) lalu dipasang ke Supabase; hasilnya dicatat di [[ENVIRONMENTS]] dan [[TEST_MATRIX]].

## Cara memantau (satu tempat per pertanyaan)

| Pertanyaan | Lihat |
|---|---|
| Apa yang sedang dikerjakan dan sisanya? | [[PROGRESS_SNAPSHOT]], [[PROGRESS_DASHBOARD]], `tasks/` |
| Apa yang sudah diuji dan hasilnya? | [[TEST_MATRIX]] |
| Apakah siap dipakai tim? | [[AUDIT_KESIAPAN]]; rencana pemakaian: [[RENCANA_ADOPSI]] |
| Kode terakhir yang masuk dan CI-nya? | GitHub: tab Actions; `gh run list --repo mitranusainternational-cloud/mni-gudang` |
| Versi mana yang live? | Vercel: Deployments; `git log origin/main -1` harus sama dengan commit deploy Production |
| Skema, RLS, dan kesehatan database? | Supabase: Advisors, Migrations; cek jumlah migration sama dengan file repo |
| Siapa yang bisa masuk? | Supabase Auth Users dan tabel `muser` (harus berpasangan) |
| Perubahan dari versi ke versi? | [[CHANGELOG]] (di akar repo), [[PROJECT_PROGRESS]] |

### Rutinitas

| Kapan | Periksa |
|---|---|
| Harian (saat dipakai tim) | Vercel Production Ready; Supabase tidak dijeda; galat di Logs Vercel; `log` aktivitas aneh |
| Mingguan | CI hijau di `main`; advisor Supabase; PR terbuka; tugas `blocked`; jalankan `node scripts/sync-vault.mjs` |
| Setiap rilis | PR ke `main` hijau; migration baru diuji di project kosong atau branch; regresi dan uji role; catat di CHANGELOG dan TEST_MATRIX; cocokkan commit GitHub, deploy Vercel, dan jumlah migration Supabase |
| Setiap mengganti nama atau memindah sumber daya | perbarui halaman ini, [[ENVIRONMENTS]], `CLAUDE.md`, README, dan label atau konektor terkait |

## Riwayat penggantian nama

| Tanggal | Sumber daya | Dari | Ke |
|---|---|---|---|
| 2026-11-03 | Repo GitHub | `MNI-OS---Operational` | `mni-gudang` |
| 2026-11-03 | Project Vercel | `mni-os-operational` | `mni-gudang` (domain baru `mni-gudang.vercel.app`) |
| 2026-11-03 | Project Supabase production | "MNI-OS - Operational" | "MNI Gudang - Production" |

## Peta menu aplikasi (2026-11-04, lokal)

| Menu | Rute | Jenis | Sumber data |
|---|---|---|---|
| SPK Berjalan | `#spk` | Lihat dan buat SPK | `spk`, `produksi_log`, `vendor`, `kirim` |
| Produksi Hari Ini | `#mesin` | **Input** produksi | `produksi_log`, `mwc` |
| Kinerja & Analisa | `#produksi` | Lihat (tab Work Center, Laporan Produksi, Produk, Vendor, Pengiriman, Rincian harian) | `produksi_log`, `mwc`, `vendor`, `kirim`, `bongkar` |
| Papan Produksi, Laporan Produksi | `#papan`, `#laporan-produksi` | Lihat (tersembunyi) | `produksi_log` |

Kebutuhan dan pemetaan data: [[PRD_PRODUKSI]]. Nama menu lama (Monitoring SPK, Dashboard Produksi, Antrian Mesin) sudah digantikan.

Kolom klasifikasi produk pada `produksi_log` (draf migration 14): `kelompok`, `tipe`, `material`, `finishing`, diisi otomatis dari judul section SPK. Dipakai Laporan Produksi untuk pengelompokan Cable Tray, Cable Ladder, Cable Duct, Cover, dan Aksesoris beserta type dan material.

Tab Jadwal pada SPK Berjalan (`#spk`): bagan Gantt per SPK dari data yang sudah ada (SPK, `produksi_log`, vendor, kirim); mesin hitung `src/lib/produksi/jadwal.js`; tanpa tabel baru.

Menu penjualan (lokal, belum tayang, 2026-11-06): **Penawaran** (`#penawaran`, draf migration 15) dan **Sales Order** (`#salesorder`, draf migration 16). SPK Draft dibuat otomatis dari konfirmasi Sales Order, dan panel Kebutuhan material ada di Sales Order dan lembar SPK. Alur lengkap: [[HANDOFF]].
