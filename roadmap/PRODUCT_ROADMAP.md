---
type: product-roadmap
status: proposed
updated: 2026-11-06
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Roadmap produk MNI Gudang & Logistik

Roadmap ini mengurutkan **hasil** (bukan tanggal) dari kondisi sekarang sampai sistem dipakai dan berkembang. Status hidup dihitung otomatis dari catatan tugas: lihat [[PROGRESS_SNAPSHOT]] dan [[PROGRESS_DASHBOARD]]. Rencana operasional menuju rilis pertama: [[GO_LIVE_PLAN]]. Daftar periksa Now/Next/Later yang lebih rinci: [[ROADMAP]].

## 1. Posisi sekarang (fakta, 2026-11-06)

| Aspek          | Kondisi                                                                                                                                                                    | Bukti                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Kode aplikasi  | Vite + Supabase + Vercel; UI vanilla JS (sekitar 776 KB `app.js` terbangun) dengan mesin berat, produksi, dan harga di `apps/platform/src/lib`; 17 uji unit (266 lulus) | [[documentation/PETA_MODUL]], [[documentation/ENVIRONMENTS]] |
| Production     | **Tayang** di mni-gudang.vercel.app, Supabase Production migration 1 sampai 13, RLS per peran, riwayat perubahan, 10 pengguna; `main` ad73c89 (surat jalan)                | [[documentation/SISTEM_MAP]]                                |
| Lokal          | Cabang `fitur/produksi-multi-wc`: produksi multi WC, Gudang Bahan Baku, Barang Jadi, Sparepart, SPK stok, tren, dokumen; Penawaran dan Sales Order disembunyikan; belum dirilis | [[documentation/PETA_MODUL]], [[T-203-rilis-paket-gudang-dan-produksi-ke-production]] |
| Pengujian      | Regresi mock 2026-11-07 (semua 0 FAIL): regresi 42, role 12, akses 34, produksi 134, penawaran 42, sparepart 38, fitur 18, keamanan 8, aksesibilitas 3, menyeluruh 24, editor 17, tampilan 72; unit 266; lint 0 galat. Belum ada uji terhadap database nyata untuk migration 14 sampai 18 | [[documentation/TEST_MATRIX]]                               |
| Data           | Data bahan baku (T-184) dan stok barang jadi (T-175) dimuat ke production; saldo antar workbook belum direkonsiliasi                                                       | [[documentation/DATA_SOURCE_CATALOG]]                       |
| Kebutuhan      | Pemolesan berdasarkan masukan langsung pemilik; wawancara process owner bersama tim belum dilakukan; pilot memakai data nyata di production                                 | [[documentation/OPERATIONAL_DISCOVERY]], [[documentation/PRD_GUDANG]] |
| Repo dan versi | `main` terproteksi (PR, 1 approval, CI); kerja fitur di cabang `fitur/*`; `development` dan `docs` tertinggal                                                          | [[documentation/VERSION_STRATEGY]]                          |

Terverifikasi di mode mock (bukan Supabase): modul UI dan alur lintas modul ([[documentation/TEST_MATRIX]]). Terverifikasi di production (baca-saja): skema, kebijakan, jumlah baris.

> [!info] Jalur integrasi
> Tahap S0 sampai S6 (lokal → Supabase dev → GitHub CI → Vercel preview → UAT → production → VPS opsional), gerbang tiap tahap, dan kriteria VPS ada di [[documentation/INTEGRATION_PATH]]. Agen dan skill proyek: [[documentation/TEAM_AND_SKILLS]].

## 2. Prinsip

1. **Kebutuhan Operasional di atas fitur.** Sistem ini custom; fitur dan schema diturunkan dari proses aktual tim, bukan dari ERP lain.
2. **Pilot kecil dulu.** Satu alur diselesaikan penuh sebelum yang lain.
3. **Bukti sebelum klaim.** `done` hanya dengan bukti; bedakan source-level, verified in browser, dan verified in database.
4. **Data nyata hanya setelah UAT.** Development memakai data sintetis atau impor terkontrol; production tidak disentuh sebelum sign-off.
5. **Satu sumber status.** Catatan tugas di `tasks/`; epic dan rilis dihitung darinya.
6. **Rilis kecil dan dapat dibalik.** Setiap rilis punya rencana rollback.

## 3. Kereta rilis

```text
v0.9 Fondasi ──► v1.0 Pilot go-live ──► v1.1 Stabilisasi ──► v1.2 Integrasi & pelaporan ──► v2.0 Modernisasi & perluasan
 (sedang jalan)   (hasil utama)          (akses, kualitas)     (otomasi, nilai manajemen)     (teknik, hipotesis kebutuhan)
```

### v0.9 Fondasi (dilampaui kenyataan: production sudah tayang tanpa Docker lokal)
**Tujuan:** pengembang dapat menjalankan, menguji, dan melacak pekerjaan dengan andal.
**Epic:** [[roadmap/epics/E-01-fondasi-workspace-dan-repo|E-01]] workspace dan repo, [[roadmap/epics/E-02-aplikasi-berjalan-lokal|E-02]] aplikasi berjalan lokal.
**Keluar bila:** Supabase lokal hidup dengan 20 tabel, mni-app tersambung dan dapat login dengan user seed, `main` terproteksi.
**Catatan kenyataan (2026-11-07):** Docker lokal (T-010) tetap terblokir virtualisasi BIOS dan tidak lagi di jalur kritis karena production Supabase dipakai langsung; T-011, T-012, T-013 menunggu keputusan pemilik apakah ditutup sebagai digantikan. Proteksi `main` (T-041) selesai. Pratinjau lokal mock tersedia ([[documentation/LOCAL_PREVIEW]]).

### v1.0 Pilot go-live (rilis utama)
**Tujuan:** satu alur Operasional dipakai nyata oleh user awal di production.
**Epic:** [[roadmap/epics/E-03-kualitas-aplikasi-dan-keamanan-data|E-03]] kualitas dan keamanan, [[roadmap/epics/E-04-proses-data-dan-pilot|E-04]] proses/data/pilot, [[roadmap/epics/E-05-environment-cloud-dan-ci-cd|E-05]] cloud dan CI/CD, [[roadmap/epics/E-06-uat-hardening-dan-go-live|E-06]] UAT dan go-live, [[roadmap/epics/E-07-dokumentasi-dan-situs-docs|E-07]] dokumentasi, [[roadmap/epics/E-08-operasi-dan-dukungan|E-08]] operasi.
**Keluar bila:** enam syarat "siap dipakai" di [[GO_LIVE_PLAN]] terpenuhi dan hypercare lima hari tanpa isu kritis.
**Jalur kritis:** wawancara process owner → pemetaan data → impor → rekonsiliasi → UAT → sign-off → go-live (sekitar 26,5 hari kerja effort).
**Tidak termasuk:** integrasi otomatis workbook, notifikasi, dashboard manajemen, refactor besar.

### v1.1 Stabilisasi, akses, dan kualitas data
**Tujuan:** sistem tepercaya dalam pemakaian harian.
**Epic:** [[roadmap/epics/E-09-akses-peran-dan-audit|E-09]] akses, peran, audit; [[roadmap/epics/E-10-kualitas-data-dan-kontrol-stok|E-10]] kualitas data dan kontrol stok.
**Hasil:** role ditegakkan di UI dan database (prototipe memakai `ROLE_ON=false`), jejak audit, manajemen user dari UI, aturan Cek Data disepakati, opname terjadwal, buffer dan usulan pembelian divalidasi.
**Masuk bila:** hypercare selesai; backlog hypercare dan UAT ditriase.

### v1.2 Integrasi dan pelaporan
**Tujuan:** kurangi kerja manual dan beri nilai bagi manajemen.
**Epic:** [[roadmap/epics/E-11-integrasi-sumber-data|E-11]] integrasi sumber data, [[roadmap/epics/E-12-pelaporan-notifikasi-dan-dokumen|E-12]] pelaporan, notifikasi, dokumen. Ditambah [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]] ERP hulu: Penawaran, estimasi, dan monitoring (modul terpisah, lokal dulu; lihat [[documentation/arsip/ERP_QUOTATION_ANALISIS]]).
**Hasil (hipotesis):** impor terjadwal dari sumber resmi, satu sumber master data, dashboard kinerja, notifikasi SPK jatuh tempo dan stok di bawah buffer, dokumen cetak terstandar.
**Syarat masuk:** discovery integrasi (T-121) membuktikan kebutuhan, owner, dan scope; kanal notifikasi dipilih tim.

### v2.0 Modernisasi dan perluasan
**Tujuan:** biaya perubahan turun dan jangkauan naik.
**Epic:** [[roadmap/epics/E-13-modernisasi-frontend-dan-pengujian|E-13]] frontend dan pengujian, [[roadmap/epics/E-14-multi-site-dan-mobile|E-14]] multi-site dan mobile, [[roadmap/epics/E-15-self-host-vps-dan-layanan-pendamping|E-15]] self-host VPS dan layanan pendamping (hipotesis).
**Hasil (hipotesis):** modul ES, uji unit untuk kalkulasi, aset lokal tanpa CDN, CSP ketat; PWA/offline dan multi-gudang hanya bila kebutuhan terbukti.
**Syarat masuk:** keputusan T-144 (tetap vanilla JS atau migrasi) dan bukti kebutuhan T-151.

## 4. Sekarang, berikutnya, nanti

| Kolom | Isi | Pemicu pindah |
|---|---|---|
| **Sekarang** | Pemolesan modul lokal atas permintaan pemilik (E-02, E-03, E-10); jalur proses dan data (T-030 sampai T-036) belum dimulai dan tetap penentu go-live; rilis paket gudang dan produksi dijeda ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]]) | Persetujuan pemilik untuk rilis bertahap; jadwal walkthrough |
| **Berikutnya** | E-04, E-05 (hardening: T-044, T-047, T-061), lalu E-06 | Pilot dipilih; cadangan dan uji pulih (T-061) siap |
| **Lalu** | E-06, E-07, E-08 | UAT disetujui |
| **Kemudian** | E-09 sampai E-12 | Go-live dan hypercare |
| **Hipotesis** | E-13, E-14 | Keputusan dan bukti kebutuhan |

## 5. Gerbang keputusan

| Gerbang | Pertanyaan | Pemilik | Tugas | Dicatat di |
|---|---|---|---|---|
| G1 Basis aplikasi | Apakah `apps/platform` jalur produksi? | Pemilik proyek | T-031, T-033 | [[documentation/DECISIONS]] |
| G2 Pilot | Alur mana, kriteria terima apa? | Process owner | T-031 | [[documentation/OPERATIONAL_DISCOVERY]] |
| G3 Data | Sumber resmi, cut-off, siapa pemiliknya? | Owner data | T-032, T-035 | [[documentation/DATA_SOURCE_CATALOG]] |
| G4 Rilis | Siap ke production? | Pemilik proyek | T-064 | [[documentation/RELEASE_CHECKLIST]] |
| G5 Pasca go-live | Isi v1.1 sesuai temuan? | Tim | setelah T-065 | tinjau ulang roadmap ini |
| G6 Teknik | Vanilla atau framework? | Tim teknis | T-144 | [[documentation/DECISIONS]] |

## 6. Asumsi dan hipotesis (belum terbukti)

- Schema `mni-app` cukup untuk pilot (diturunkan dari kode prototipe, belum dari proses nyata).
- Vercel cocok sebagai hosting; alternatif VPS Docker tersedia di `apps/platform`.
- Integrasi workbook perlu otomatis (E-11) dan lewat Composio (T-121); bisa berubah.
- Multi-site dan offline (E-14) dibutuhkan; belum ada bukti.
- Estimasi effort indikatif; belum ada kecepatan historis.

## 7. Ukuran keberhasilan (target usulan; tetapkan baseline lebih dulu)

| Rilis | Ukuran teknis yang dapat diverifikasi | Ukuran bisnis (butuh baseline dari tim) |
|---|---|---|
| v0.9 | Seluruh migration terpasang, 0 error JS saat load, login seed berhasil | n/a |
| v1.0 | Matriks RLS 5 role lulus, smoke test hijau di CI, restore backup berhasil, saldo impor terekonsiliasi | Alur pilot dipakai harian oleh user awal; target dan metrik ditetapkan di T-031 |
| v1.1 | 100% mutasi stok dan perubahan SPK punya jejak audit; aturan Cek Data berjalan | Selisih opname dan isu data menurun terhadap baseline v1.0 |
| v1.2 | Impor terjadwal tanpa campur tangan manual; notifikasi terkirim | Waktu rekap manual menurun terhadap baseline |
| v2.0 | Cakupan uji kalkulasi inti; 0 dependensi CDN runtime | Sesuai hasil studi T-151 |

## 8. Risiko lintas rilis

| Risiko | Efek | Mitigasi |
|---|---|---|
| Waktu process owner terbatas | Jalur kritis mundur | Jadwalkan sesi di minggu pertama, mulai satu alur kecil |
| Data workbook tidak konsisten | Saldo awal salah | Rekonsiliasi tertulis dan persetujuan owner (T-035) |
| Schema prototipe tidak cocok dengan proses | Pengerjaan ulang | Migration bertahap; validasi pilot sebelum impor |
| Satu file `app.js` besar | Regresi saat ubah | Smoke test (T-023), kemudian uji unit dan modularisasi (E-13) |
| Ketergantungan CDN | Gagal saat jaringan terbatas | T-143 |
| Perubahan scope setelah UAT | Go-live mundur | Gerbang G5 dan triase backlog |

## 9. Cara memantau di Obsidian

1. Buka [[PROGRESS_DASHBOARD]] untuk tabel interaktif (rilis, epic, tugas) dan [[PROGRESS_SNAPSHOT]] untuk ringkasan.
2. Tiap epic berada di `roadmap/epics/` dengan properti `status`, `progress`, dan daftar tugas otomatis; tampilan Bases `Epic.base` menyusunnya per rilis.
3. Perbarui status tugas, jalankan `node scripts/progress-report.mjs`, lalu `node scripts/check-vault.mjs` untuk memastikan tidak ada link rusak.
4. Tinjau roadmap ini setiap akhir rilis dan di gerbang G5.

## 10. Catatan pembaruan: modul produksi (2026-11-04)

Modul produksi multi work center dibangun **lokal saja** (ditahan dari penayangan). Skema tiga pintu (SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa) selesai di Tahap 1 ([[T-177-skema-produksi-tiga-pintu-spk-berjalan]]); Tahap 2 (analisa per work center, produk, vendor, dan pengiriman, [[T-178-kinerja-dan-analisa-produksi-tahap-2]]) selesai di lokal pada 2026-11-04; disusul Produksi Hari Ini v2 dan Laporan Produksi ([[T-179-produksi-hari-ini-v2-dan-laporan-produksi]]) dan Jadwal SPK Gantt ([[T-180-jadwal-spk-gantt]]). Kebutuhan di [[PRD_PRODUKSI]]. Penayangan menunggu persetujuan pemilik: migration 14, push, lalu PR ke `main`.
