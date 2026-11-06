---
type: roadmap
status: active
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Roadmap MNI Gudang & Logistik

Roadmap ini menunjukkan urutan hasil yang perlu dibangun, bukan komitmen tanggal rilis. Perbarui status bersama bukti di [[PROJECT_PROGRESS|progress proyek]]. Jangan menandai item `Done` hanya karena file sudah dibuat.

> [!summary] Status Now — diperbarui 2026-11-02
> Arah produk: **MNI OS custom untuk kebutuhan tim Operasional MNI**. ERP eksternal bukan blueprint. Sumber kebutuhan adalah proses tim, bukti kerja yang diizinkan, dan validasi pemilik proses. Aplikasi **belum terhubung** ke Supabase; blocker teknis dan catatan lengkap ada di [[FOUNDATION_BASELINE|baseline fondasi]].

> [!info] Rencana detail
> Arah produk per rilis dan epic: [[roadmap/PRODUCT_ROADMAP]]. Langkah, dependensi, dan status per tugas ada di [[GO_LIVE_PLAN]] dan [[PROGRESS_DASHBOARD]]. Roadmap ini tetap menjadi urutan hasil tingkat tinggi.

## Now — fondasi dan bukti awal

- [x] Pertahankan salinan HTML sumber dan pisahkan implementasi aktif menjadi HTML, CSS, dan JavaScript.
- [x] Tetapkan branch awal `versi-awal`, `development`, `main`, dan `docs`.
- [x] Buat vault Obsidian di root repository dengan dashboard, progress, dan strategi versi.
- [x] Buat dokumentasi awal penggunaan, pengembangan, inventaris fitur/data, dan batas verifikasi dari source.
- [x] Terapkan struktur vault, dashboard, progress, roadmap, indeks screenshot, dan template Markdown.
- [x] Riset pola agent/skill dan susun model tim lokal, definisi agent, serta skill kerja per peran.
- [x] Aktifkan preview lokal di `http://localhost:8002/`; root melayani aplikasi dan CSS/JS memberi HTTP 200.
- [x] Tambahkan script preview Node lokal yang reproducible; Python tidak tersedia di mesin kerja.
- [ ] **Blocked — browser lokal dinonaktifkan untuk runner:** verifikasi render pascaperbaikan, console, navigasi, tema, dan ukuran layar.
- [ ] **Blocked — menunggu browser terdukung:** ambil screenshot dashboard, gudang, SPK, logistik, dan master data dengan data sintetis.
- [x] Catat runtime dan batas read/write: preview UI statis; hosted schema hanya dilihat lewat metadata/advisor; belum ada aplikasi ke Supabase.
- [x] Buat inventaris indikatif 20 collection dari source; dokumentasikan sebagai petunjuk teknis awal, bukan kebutuhan proses atau rancangan schema.
- [x] Susun katalog agent/skill lokal dan alur kerja Codex di [[TEAM_AND_SKILLS|model tim]].
- [x] Audit read-only project Supabase yang terlihat, migration ledger, advisor, kesiapan tools, dan dokumentasikan gap checkout (19 migration records; target belum dikonfirmasi).
- [x] Susun tahapan local-first untuk Supabase, vertical slice, Composio, GitHub, Vercel/domain, dan Docs.
- [x] Sediakan Supabase CLI `2.122.0` melalui `npx` dan inisialisasi `apps/gudang-logistik/supabase/config.toml`; seed nonaktif, project hosted belum di-link.
- [ ] **Blocked — virtualisasi BIOS nonaktif (T-010, lihat [[DOCKER_SETUP]]):** mulai Docker engine dan Supabase local stack, lalu buat migrations/seed sintetis setelah target schema/pilot disepakati.
- [ ] **Belum terhubung:** CLI project listing butuh login/token CLI; gunakan login lokal yang aman setelah Docker/local target siap. Management connector hanya membuktikan akses metadata read-only.
- [x] Simpan brief saldo gudang lama sebagai hipotesis pada [[apps/gudang-logistik/docs/PILOT_BRIEF|brief pilot]]; belum dipilih sebagai pilot custom.
- [x] Tinjau dan catat temuan security/performance advisor di [[FOUNDATION_BASELINE|baseline fondasi]]; perbaikan hosted belum dijalankan.
- [ ] Setelah requirement custom dan kebutuhan environment disepakati, tentukan apakah project hosted `MNI - Operational` relevan; bila iya, verifikasi owner, lineage, dan kecocokan sebelum dipakai. Jangan menyalin schema/migration sibling secara otomatis.
- [x] Tetapkan arah custom: tim Operasional adalah sumber kebutuhan utama; catat di [[documentation/DECISIONS|log keputusan]].
- [x] Buat register discovery dan template walkthrough/requirement di [[OPERATIONAL_DISCOVERY|register Operasional]].
- [x] Inventaris struktural enam workbook yang diberikan dan buat [[DATA_SOURCE_CATALOG|katalog sumber data]]; salinan kerja dikecualikan dari Git.
- [x] Audit read-only formula/cache, tipe nilai, candidate key, tanggal, dan contoh item SPK 438; temuan/batas ada di katalog.
- [x] Buat [[DATA_DICTIONARY|draft kamus data]] dari label sumber; definisi bisnis tetap menunggu validasi.
- [ ] Konfirmasi owner, periode cut-off, sumber resmi, definisi key/status, dan frekuensi pembaruan keenam sumber bersama tim.
- [ ] Tinjau formula error, kunci master berulang, aturan tanggal carry-forward, dan perbedaan key PPIC bersama pemilik data; rekonsiliasi nilai bisnis masih terbuka.
- [x] Sesuaikan status preview lokal agar tidak mengarahkan pengguna ke Claude atau mengklaim data tersinkron tanpa backend.
- [ ] Inventaris proses dan kebutuhan Operasional bersama pemilik proses: aktor, pemicu, langkah aktual, keputusan, pengecualian, kontrol, output, masalah, dan bukti sumber.
- [ ] Validasi serta prioritaskan kebutuhan dengan tim Operasional; tandai fakta, asumsi, opsi desain, keputusan, dan item yang ditunda secara terpisah.
- [ ] Revalidasi brief pilot saldo gudang dan mapping data lama; jangan anggap pilot atau hosted schema yang ada sebagai kebutuhan yang telah disetujui.

## Cara memakai tools dalam proyek

Checklist ini menjelaskan urutan kerja antar-tools. Status hanya dicentang jika bukti ada; koneksi aplikasi eksternal tidak diasumsikan aktif.

### Siklus kerja fitur

- [ ] **Codex koordinator:** catat tujuan, pengguna, ruang lingkup, risiko, dan acceptance criteria pada brief pekerjaan.
- [ ] **Discovery kebutuhan Operasional:** gunakan analis kebutuhan/proses untuk memetakan alur kerja tim MNI; ERP eksternal hanya sumber pola umum bila relevan, bukan spesifikasi.
- [ ] **Obsidian vault:** tautkan brief/keputusan ke [[PROJECT_PROGRESS|progress]], [[ROADMAP|roadmap]], dan halaman area terkait.
- [ ] **Git lokal:** periksa branch aktif dan diff; implementasikan perubahan pada `development`, simpan HTML awal sebagai acuan.
- [ ] **Preview lokal:** jalankan aplikasi dari folder yang benar, pastikan HTML/CSS/JS merespons, lalu validasi tampilan di browser.
- [ ] **Playwright QA:** setelah kriteria siap dan environment aman, jalankan alur normal/pengecualian yang diminta; catat hasil serta cakupan.
- [ ] **Dokumentator:** perbarui panduan pengguna/pengembang, screenshot aman, progress, dan tautan Obsidian.
- [ ] **Gate rilis:** tinjau diff, data, hasil browser, UAT, risiko, dan pemulihan sebelum promosi; ikuti [[RELEASE_CHECKLIST|checklist rilis]].

### Integrasi riset dan sumber data

- [ ] **Validasi lapangan:** lakukan walkthrough proses dengan anggota/pemilik proses Operasional; catat role, skenario, dokumen, keputusan, pengecualian, kontrol, dan bukti yang diizinkan.
- [ ] **Composio + Google Sheets:** konfirmasi koneksi aktif; tentukan workbook yang relevan; inventaris metadata/kolom/formula secara read-only sebelum menganalisis data.
- [ ] **Pemetaan data:** inventaris sumber operasional MNI yang relevan dan diizinkan (termasuk Sheets/sistem sumber bila dipakai tim), lalu dokumentasikan definisi dan kualitas tanpa menyalin data sensitif.
- [ ] **GitHub:** setelah susunan lokal ditinjau dan pemilik menyatakan siap, sinkronkan branch sesuai [[VERSION_STRATEGY|strategi versi]]. Jangan menganggap branch sebagai environment deployment.

## Versi dan deploy

- [x] Branch `versi-awal`, `development`, `main`, `docs` ada di GitHub; panduan di [[ENVIRONMENTS]].
- [x] Scaffold `apps/platform` masuk vault; build berhasil.
- [x] Perbaiki error runtime `app.js` pada `apps/platform` (bootstrap CSS/body/JS di `index.html`).
- [ ] Uji login OTP dan alur data `apps/platform` terhadap Supabase dev nyata.
- [ ] Buat Supabase dev dan prod terpisah; pasang secret per environment.
- [ ] Buat project Vercel (preview dari development, production dari main).
- [ ] Pilih generator situs docs dan publikasikan dari branch `docs`.

## Next — riset dan pemetaan proses/data

- [ ] Buat peta current-state per proses Operasional berbasis wawancara/walkthrough dan artefak yang diizinkan; catat sumber, tanggal, pemilik, serta ketidakpastian.
- [ ] Hubungkan Google Drive/Sheets melalui Composio setelah OAuth; buat inventaris file, pemilik, sheet, tanggal pembaruan, formula, validasi, dan referensi antar-file.
- [ ] Validasi [[apps/gudang-logistik/docs/DATA_INVENTORY|inventaris indikatif]] terhadap skema/backend aktual dan workbook yang diizinkan.
- [x] Susun draft data dictionary dari label/tipe yang terlihat; validasi definisi, unit, key, sumber resmi, dan aturan kualitas bersama owner masih terbuka.
- [ ] Buat requirement register dan keputusan desain custom; tiap item menyertakan masalah/outcome, pengguna terdampak, frekuensi/bukti, kontrol, dependensi, risiko, opsi, prioritas, acceptance criteria, dan persetujuan.
- [ ] Tentukan data yang boleh dipakai untuk prototipe, staging, pilot, dan produksi; tetapkan minimisasi, masking, retensi, dan akses.
- [ ] Pilih pekerjaan fitur pertama, tulis brief dan acceptance criteria dengan [[TEAM_AND_SKILLS|model tim kerja]].

## Later — desain, implementasi, dan kesiapan pengguna

- [ ] Implementasikan satu vertical slice website ↔ Supabase lokal, termasuk Auth/context dan satu alur read/write sintetis.
- [ ] Verifikasi RLS lintas user/tenant, permission, empty/error/offline behavior, audit, dan persistence pada local stack.
- [ ] Tentukan provider Composio berdasarkan kebutuhan pilot; mulai dengan integrasi read-only dan catat owner/scope/revocation.
- [ ] Lengkapi panduan penggunaan, pengembangan, env setup, database runbook, dan screenshot lokal terverifikasi.

## Later — GitHub, Vercel, UAT, dan domain

- [ ] Tinjau diff, migration, fixture, dokumentasi, dan secret handling sebelum commit/push source lokal ke GitHub.
- [ ] Siapkan Vercel Preview dari root `apps/gudang-logistik`; arahkan hanya ke Supabase Development.
- [ ] Verifikasi auth callback, asset/routing, environment variables, security, preview URL, dan smoke scenario.
- [ ] Tutup atau terima risiko security Supabase dengan review dan bukti; pastikan backup/restore dan rollback.
- [ ] Jalankan UAT dengan process owner; catat role, skenario, penerimaan, dan issue.
- [ ] Promosikan source ke `main` dan siapkan Vercel Production dengan database/config Main terpisah setelah persetujuan rilis.
- [ ] Kaitkan custom domain setelah checklist rilis; catat DNS owner, monitoring, support, dan rollback.
- [ ] Publikasikan Docs hanya setelah klasifikasi materi internal/publik dan jalur build/preview disepakati.

## Gate per tahap

1. **Need gate:** masalah, current-state, pemilik proses, requirement, kontrol, dan acceptance criteria Operasional tervalidasi sebelum desain fitur/schema.
2. **Target gate:** Supabase project, sumber schema/migration, pemilik, dan batas environment teridentifikasi sebelum `link`/migration.
3. **Evidence/data gate:** sumber, definisi field, kualitas, sensitivitas, dan dependensi tercatat sebelum pemindahan/penggunaan.
4. **Build gate:** workflow dan acceptance criteria terukur; vertical slice bekerja di local stack dengan synthetic data dan tenant access checks.
5. **Integration gate:** setiap Composio/Vercel/Supabase credential scoped ke environment dan role yang tepat; tidak pernah dimasukkan ke browser/repository.
6. **Release gate:** pemeriksaan, UAT, security, backup/rollback, domain, dan persetujuan rilis ditautkan dari [[RELEASE_CHECKLIST|checklist]].

## Dependency yang sedang menahan progress

- **Browser lokal:** server preview `localhost:8002` telah membuktikan respons 200 untuk halaman dan asset CSS/JS. Render visual/console belum terverifikasi oleh runner; screenshot pengguna sebelumnya memperlihatkan CSS belum termuat sebelum pemetaan server diperbaiki.
- **Docker/virtualisasi:** diagnosis 2026-11-02: `VirtualizationFirmwareEnabled=False`, hypervisor tidak ada, engine Docker tidak start. Panduan perbaikan: [[DOCKER_SETUP]]. Local Supabase stack belum dapat dijalankan.
- **Supabase CLI/app connection:** CLI belum authenticated dan `projects list` meminta access token; management connector hanya read-only. Project kandidat tidak memiliki development branch. App belum punya Supabase SDK/Auth atau backend connection.
- **Supabase target/schema lineage:** project hosted belum dipastikan sebagai backend checkout ini; SQL sibling menggunakan model `organizations`, bukan hosted `tenants`.
- **Discovery Operasional:** current-state, requirement, prioritas, dan pilot pertama belum divalidasi bersama tim/pemilik proses.
- **Discovery Operasional:** validasi proses langsung dari tim MNI dan pemilik proses belum dilakukan; backlog/pilot yang ada masih hipotesis.
- **Google Sheets:** koneksi Composio OAuth belum selesai; data workbook belum dibaca.
- **Backend aplikasi:** source bergantung pada adapter `window.claude`; server/database bersama belum diverifikasi.

## Produksi dan tracking (2026-11-04, lokal)

- [x] Skema tiga pintu: SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa ([[T-177-skema-produksi-tiga-pintu-spk-berjalan]])
- [x] Analisa per work center, produk, vendor, dan pengiriman termasuk loading dan unloading ([[T-178-kinerja-dan-analisa-produksi-tahap-2]]), lokal
- [x] Produksi Hari Ini v2 dan Laporan Produksi (input otomatis, analisa jumlah, tonase, kecepatan, produk bertingkat, KPI operator dan mesin) ([[T-179-produksi-hari-ini-v2-dan-laporan-produksi]]), lokal
- [x] Jadwal SPK (Gantt): garis waktu SPK berjalan dari terbit sampai due date ([[T-180-jadwal-spk-gantt]]), lokal
- [x] Uji alur lengkap SPK awal sampai akhir dengan tangkapan layar ([[T-181-uji-alur-spk-awal-sampai-akhir]], [[UJI_ALUR_SPK]]), lokal
- [x] Papan jadwal v2 (Per SPK dan Per mesin) dan perapian layout Berjalan, KPI & Analisa, Target ([[T-182-papan-jadwal-v2-dan-rapikan-layout-spk]]), lokal
- [x] Produksi Hari Ini: papan mesin dan kapasitas aktual ([[T-183-produksi-hari-ini-papan-mesin-dan-kapasitas-aktual]]), lokal
- [ ] Penayangan: migration 14, push, PR ke `main` setelah persetujuan pemilik. Kebutuhan: [[PRD_PRODUKSI]]
