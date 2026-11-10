---
type: audit
status: active
updated: 2026-11-05
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Audit progres proyek (2026-11-05)

Pemeriksaan silang vault (`tasks/`), git, GitHub, dan Supabase production. Angka tugas berasal dari [[PROGRESS_SNAPSHOT]]. Audit kesiapan teknis sebelumnya: [[AUDIT_KESIAPAN]]. Rencana: [[GO_LIVE_PLAN]], [[INTEGRATION_PATH]].

## Posisi singkat

Aplikasi dan infrastruktur cloud sudah live dan dipakai pemilik dengan data nyata sebagian. **Jalur proses dan data (walkthrough, pilot, UAT) belum dimulai**, dan itulah penentu go-live. Selama 4 hari terakhir pekerjaan terpusat pada fitur produksi multi work center yang **belum tayang**.

| Ukuran | Nilai |
|---|---|
| Tugas selesai | 29 dari 105 (28%) |
| Effort selesai | 27,75 dari 172,35 hari kerja (16%) |
| Cakupan go-live (P0 sampai P7) | 29 dari 83 tugas |
| Jalur kritis tersisa menuju go-live (T-065) | 26,5 hari kerja |
| Diblokir / dikerjakan / menunggu tinjauan | 1 / 4 / 13 |

## Per jalur ([[GO_LIVE_PLAN]])

| Jalur | Posisi | Bukti |
|---|---|---|
| A Teknis (aplikasi, login, RLS, CRUD) | Hampir selesai | Production Supabase `lggqigmvtefkquqjrjsb` memakai migration 1 sampai 13 (13 versi terdaftar, sama dengan berkas repo); RLS aktif di 22 tabel; regresi lokal 0 FAIL |
| C Cloud (repo, Supabase, Vercel, CI) | Hampir selesai | PR #7 sampai #14 digabung ke `main`; sisa: variabel Preview (T-044), SMTP dan redirect URL Auth (T-047), backup (T-061), secrets (T-045) |
| B Proses dan data | **Belum mulai** | T-030, T-031, T-032, T-035, T-036 belum dikerjakan; ini jalur kritis |
| Fitur tambahan produksi (T-174 sampai T-183) | Selesai di lokal, belum tayang | 110 commit di branch `fitur/produksi-multi-wc` di depan `main`, 24 di depan `origin/development`; migration 14 hanya draf di `apps/platform/supabase/draft/` |

## Data production hari ini

Diperiksa lewat database (`verified in database`), tanpa menyalin nilai bisnis.

| Tabel | Baris | Catatan |
|---|---|---|
| `rm` (bahan baku) | 23 | Dimuat dari workbook 27 Oktober, stok awal bertanggal 2026-10-27, total 408 lembar ([[T-184-muat-data-bahan-baku-oktober-ke-production]]); data uji RM lama dicadangkan di skema `arsip_20261105` lalu dihapus |
| `fg` (barang jadi) | 92 | Impor stok barang jadi (T-175) |
| `spk` | 7 | Masih ada SPK yang dibuat saat uji |
| `muser` | 9 | Pengguna terdaftar |
| `mcustomer`, `msupplier`, `mvendor`, `marmada` | 7, 1, 1, 2 | Master awal |
| `mutasi` | 1 | Bertambah sejak pembersihan, artinya aplikasi sedang dipakai |

## Temuan audit

1. **Aturan lingkup dilanggar sejak 4 Nov.** Aturan 3 Nov: tidak ada fitur baru sebelum pilot berjalan. T-174 sampai T-183 (rute, mesin, jadwal Gantt, kapasitas aktual, laporan produksi) adalah fitur baru besar. Alasan masuk akal (permintaan langsung pemilik), tetapi keputusan ini belum dicatat di [[documentation/DECISIONS]] dan jalur kritis tidak bergerak.
2. **Branch panjang berisiko.** `fitur/produksi-multi-wc` memuat 110 commit di atas `main`; makin lama tidak digabung, makin besar risiko konflik dan makin sulit ditinjau. Satu PR besar sulit di-approve.
3. **Dua tugas production masih `doing`:** T-044 (Vercel Preview dari development) dan T-047 (SMTP, redirect URL, nonaktifkan self-signup). Keduanya syarat go-live dan menunggu tindakan pemilik di dashboard.
4. **13 tugas menunggu tinjauan pemilik** (T-079, T-167 sampai T-171, T-177 sampai T-183). Status `review` bukan `done`, jadi hitungan selesai 29 belum mencerminkan pekerjaan yang sudah jadi.
5. **Bukti produksi masih lemah.** Fitur T-174 sampai T-183 hanya terbukti di mock (`verified in browser`); belum ada bukti Supabase karena migration 14 belum diterapkan.
6. **Risiko lama dari [[AUDIT_KESIAPAN]] yang masih terbuka:** backup terjadwal dan uji pemulihan (T-061), repo publik memuat dokumentasi internal, pendaftaran bebas Auth, hanya satu admin ditambah beberapa pengguna tanpa peta role yang disahkan (T-036).
7. **Data awal.** Bahan baku dan barang jadi sudah dimuat, tetapi rekonsiliasi (T-035) dan konfirmasi cut-off enam workbook (T-032) belum. Cut-off bahan baku kini 27 Oktober menurut file; catatan lama menyebut 17 Oktober.
8. **Cadangan sementara di production:** skema `arsip_20261105` harus dihapus setelah pemilik puas.

## Keputusan yang ditunggu pemilik

| # | Keputusan | Menggerakkan |
|---|---|---|
| 1 | Jadwalkan sesi walkthrough dan pilih pilot pertama | T-030, T-031 (jalur kritis) |
| 2 | Konfirmasi cut-off dan sumber resmi workbook | T-032, T-035 |
| 3 | Jam kerja standar dan target pcs/jam per work center atau mesin | KPI di T-183 |
| 4 | Aturan rute Jointing dan Clamp, kapasitas per mesin, nama mesin | T-174 |
| 5 | Izin menerapkan migration 14 dan menayangkan produksi multi-WC | T-174 |
| 6 | Isi SMTP, redirect URL, nonaktifkan self-signup di Auth | T-047 |
| 7 | Tinjau 13 tugas `review` agar bisa ditutup | hitungan selesai |

## Rekomendasi urutan kerja

1. **Tutup tinjauan** tugas `review` yang sudah dipakai pemilik (T-167 sampai T-171) supaya status mencerminkan kenyataan.
2. **Pecah jalur produksi multi-WC**: terapkan migration 14 ke production setelah persetujuan, gabungkan lewat PR bertahap (rute dan antrian dulu, lalu jadwal, lalu kapasitas) agar bisa ditinjau.
3. **Mulai jalur proses dan data** (T-030, T-031) paralel dengan itu; tanpanya UAT dan go-live tidak bisa jalan.
4. **Selesaikan sisa teknis kecil**: T-044, T-047, T-045, T-061.
5. **Tahan fitur baru** di luar produksi multi-WC sampai pilot berjalan, sesuai aturan lingkup 3 Nov.
