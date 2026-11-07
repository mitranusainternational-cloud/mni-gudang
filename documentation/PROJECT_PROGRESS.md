---
type: project-progress
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Progress MNI Gudang & Logistik

Halaman ini menyimpan pekerjaan, temuan, bukti, dan hambatan. Checklist berikutnya berada di [[ROADMAP|roadmap]].

## Ringkasan area

| Area | Status | Bukti/catatan |
|---|---|---|
| Struktur repository dan vault Obsidian | Fondasi lokal tersusun | Dashboard, panduan, roadmap, progress, riset, template, dan indeks screenshot di root workspace. |
| Source aplikasi | Source-level | HTML/CSS/JS dipisah di `apps/gudang-logistik/`; HTML sumber dipertahankan di `reference/`. |
| Preview lokal | HTTP terverifikasi | `http://localhost:8002/` menyajikan halaman dan assets melalui `scripts/preview-server.mjs`; render pascaperbaikan belum diverifikasi runner. |
| Database lokal | Scaffold dibuat, stack belum hidup | Supabase CLI `2.122.0` tersedia via `npx`; config lokal dibuat. Docker Desktop engine tidak tersedia dari sesi ini sehingga Supabase local stack belum berjalan. |
| Hosted Supabase | Metadata diperiksa read-only | Kandidat `MNI - Operational`: 80 tabel public ber-RLS pada metadata, 19 migration records sampai `020_seed_demo_data`, 0 row pada ringkasan. Target checkout dan lineage belum dipastikan; advisor warnings dicatat di [[FOUNDATION_BASELINE|baseline]]. |
| Mapping data | Inventaris observasi/hypothesis | [[apps/gudang-logistik/docs/DATA_MAPPING|Catatan mapping lama]] bukan spesifikasi; schema baru akan diturunkan dari requirement custom yang divalidasi. |
| Pilot aplikasi | Belum dipilih | [[apps/gudang-logistik/docs/PILOT_BRIEF|Brief lama saldo bahan baku]] dipertahankan sebagai hipotesis, bukan komitmen pilot. |
| Tim agent dan skill | Fondasi lokal tersedia | [[TEAM_AND_SKILLS|Model tim]] mencatat spesialisasi, batas, dan alur koordinasi. |
| Browser screenshot/QA | Blocked | Surface browser lokal untuk runner dinonaktifkan; screenshot pascaperbaikan belum dibuat. |
| Kebutuhan tim Operasional | Arah disepakati; discovery belum dilakukan | MNI OS akan dibangun custom sesuai proses, kontrol, data, dan prioritas Operasional. Backlog/pilot lama masih hipotesis sampai divalidasi bersama pemilik proses. |
| Workbook sumber Operasional | Profil read-only selesai; rekonsiliasi owner terbuka | Enam workbook dicatat di [[DATA_SOURCE_CATALOG|katalog data]]. Salinan lokal privat diabaikan Git; file asli tidak diubah. |
| Audit workbook | Profil teknis dan perbandingan awal selesai | 8.234/6.013/6.085 formula; cached errors 13/17/6. Raw RM: 22 key bersama, dashboard saling sama, stok berbeda pada 11 key terhadap file raw, satu key raw-only. Dua baris SPK 438 cocok terbatas pada deskripsi/qty/satuan. Sumber resmi/as-of dan saldo belum tervalidasi. |
| Google Sheets / Composio | Menunggu OAuth/scope | Workflow Composio yang diperiksa belum memiliki koneksi aktif Drive/Sheets/GitHub. Enam file Excel lokal telah dibaca read-only; Google Sheets cloud belum diakses. |
| GitHub/Vercel | Ditahan hingga local-ready | Belum ada commit/push/deployment untuk pekerjaan ini. |

## Fakta runtime dan batas akses

- Preview UI lokal hanya menyajikan file; `window.claude` di source masih adapter prototype, bukan koneksi Supabase.
- Project hosted diperiksa melalui metadata/schema summary, migration ledger, dan advisor; tidak ada baris data operasional yang dibaca atau diubah.
- `supabase/config.toml` dibuat tanpa remote project link, migration, env keys, atau seed. Seed dinonaktifkan sampai schema lokal ditinjau.
- Upaya menyalakan Docker Desktop tidak menghasilkan Docker engine; service Windows `com.docker.service` tidak dapat dibuka oleh sesi ini.
- `supabase projects list` gagal karena CLI belum memiliki access token. Connector manajemen Supabase dapat membaca metadata secara read-only; ini tidak mengautentikasi CLI atau aplikasi.
- `list_branches` untuk project kandidat menghasilkan daftar kosong; belum ada development branch Supabase. Aplikasi dan preview tetap belum tersambung.
- Browser lokal tidak tersedia bagi runner. HTTP 200 pada file tidak membuktikan render, console bersih, Auth, RLS runtime, atau persistence.
- Lihat [[FOUNDATION_BASELINE|baseline fondasi]] untuk daftar bukti, gap, advisor, dan gate berikutnya.

## Log kerja

### 2026-11-07 — K-3 diputuskan: SPK tanpa PO sah dengan alasan (T-215, draf lokal)
Draf 19 menambah kolom `tanpa_po_alasan` (sampel, komplain, garansi, lainnya) dan aturan tahap ketat customer_id dan (PO atau alasan); uji SQL lokal 52 PASS. UI editor SPK untuk memilih alasan belum dibuat. Belum diterapkan ke Supabase.

### 2026-11-07 — Langkah 2 database: cadangan bahan saat SPK terbit (T-215, draf lokal)
K-1 diputuskan (cadangan dulu). Draf migration 20 dan revisi draf 19 ditinjau empat peninjau independen (21 temuan, 19 nyata) lalu diperbaiki; diuji di Postgres lokal (PGlite) 48 PASS. Belum diterapkan ke Supabase mana pun; konkurensi sungguhan dan RLS peran asli belum teruji. Lihat [[BLUEPRINT_DB_ERP]].

### 2026-11-07 — Pemusatan opsi SPK di Master Data (lokal)
Tab Master Data Opsi SPK (`master/setting.spkOpsi`) menggantikan daftar yang tertanam di kode: produk, type, tebal, finishing, distribusi, lead time, penandatangan bawaan. Bukti: `verified in browser` (mock) AF-14..AF-17. Masih tertanam di kode (belum dipusatkan): singkatan finishing dan pemetaan vendor finishing berdasarkan kata kunci, massa jenis bawaan material, role, jam kerja shift 480 menit.

### 2026-11-07 — Audit alur hulu ke hilir: revisi, pembatalan, rute (B-032..B-035, lokal)
Empat celah alur ditutup dan diuji (suite `auditflow` AF-00..AF-13, mock): penjaga revisi SPK terbit, alur Batalkan/Aktifkan kembali SPK, penjaga perubahan rute produk terhadap SPK berjalan, penjaga pembatalan surat jalan vendor yang sudah menerima barang. Belum diaudit ulang: modul Penawaran dan Sales Order (tersembunyi) terhadap SPK yang dibatalkan, dan perilaku RLS di Supabase production.

### 2026-11-07 — Keseimbangan update produksi SPK dan Produksi Hari Ini (B-029..B-031, lokal)
Drawer SPK, riwayat, lembar, ekspor, dan alur lead time hanya membaca catatan lama; hasil mesin tidak terlihat. Kini memakai riwayat gabungan. Tombol Catat per langkah berantrian, item selesai dari progres efektif, total manual lama dipertahankan. Bukti: `verified in browser` (mock) suite baru `keseimbangan` K-00..K-10. Kode monitoring lama yang mati (`_bProduksiLama`) dihapus.

### 2026-11-07 — Routing dan vendor per material, Full hole otomatis Perforated (T-214, lokal)
Perforated Cable Tray otomatis Full hole (pilihan manual dipertahankan). Tab Master Data Rute produksi (per produk dan rute khusus bentuk), vendor mengikuti material (SPHC sesuai finishing; stainless dan aluminium tanpa), pilihan vendor per baris, peringatan baja tanpa finishing. Bukti: `verified in browser` (mock) E2E S-19..S-23 dan unit R-90..R-95; belum diuji di Supabase. Asumsi tahap 2 menunggu koreksi pemilik ([[INPUT_SPK_TERSTRUKTUR]] bagian 4a). Penyempurnaan: uji axe editor dan tab Rute (A-4), urutan langkah rute tidak diacak, kolom editor dirapikan.

### 2026-11-06 — Rumus sheet utama dinyatakan baku (T-189 selesai)

Pemilik menetapkan rumus sheet utama workbook penawaran sebagai baku; dua sheet lain hanya sumber parameter skenario. T-189 ditutup (done); pemuatan katalog dari tabel master setelah login dipindah ke T-190. Dicatat di [[documentation/DECISIONS]]. Langkah berikut: T-190 (modul Penawaran lokal). Production tidak disentuh.

### 2026-11-06 — Mesin harga penawaran dan uji emas (T-189, lokal)

Dibangun mesin murni harga dan estimasi di `apps/platform/src/lib/erp/harga.js` dan pembangun katalog dari workbook. Hasil uji emas terhadap Excel di skenario utama: 192 bentuk dan 2.195 nilai rumus sama (0 selisih), total, PPN, kg, dan biaya saat PO sama. Unit 22 PASS (15 sintetis untuk CI); semua uji unit lain tetap PASS. Temuan workbook: satu cacat rujukan baris lain (diperbaiki dan diuji), angka tetap tersembunyi di Straight Reducer, dua kolom parameter, dan dua sheet lain memuat rumus versi lama (302 sel berbeda; Straight Reducer di sana hampir dua kali harga sheet utama). Katalog, skenario, dan nilai pembanding diabaikan Git. Langkah berikut: pemilik mengonfirmasi rumus sheet utama sebagai baku, lalu T-190 (modul Penawaran lokal) termasuk memuat katalog dari master setelah login. Production tidak disentuh. Rincian di [[ERP_QUOTATION_ANALISIS]] bagian 10.

### 2026-11-06 — Cakupan modul Penawaran diputuskan pemilik

Enam pertanyaan di [[ERP_QUOTATION_ANALISIS]] dijawab pemilik: sistem ini menangani penawaran sampai produksi (akuntansi dan faktur di sistem lain); Sales membuat dengan nomor format lama; beberapa varian per penawaran; katalog awal 6 keluarga; batas diskon per peran dengan persetujuan; uji emas memakai workbook. Dicatat di [[documentation/DECISIONS]] dan tugas T-189 dan T-190. Langkah berikut: T-189 (mesin harga dan uji emas). Belum ada kode; production tidak disentuh.

### 2026-11-05 — Workbook penawaran dibedah dan skill serta agen ERP dibuat (T-187, T-188)

Pemilik menyerahkan workbook penawaran Cable Tray dan Ladder dan ingin penawaran menjadi hulu (SPK, material, monitoring turun darinya), dikerjakan sebagai modul terpisah, lokal dulu. Hasil pembacaan: tiga sheet = tiga skenario dengan tata letak sama; 192 produk per sheet (6 keluarga × 32 bentuk) dengan perhitungan estimasi dan real berdampingan; harga satuan = berat estimasi × harga per kg (dibulatkan) ditambah baut; total dengan diskon dan PPN; blok biaya saat PO. Strukturnya sama dengan kalkulator berat, sehingga fondasi sekitar 70% sudah ada. Dibuat: [[ERP_QUOTATION_ANALISIS]], epic [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]] dengan tugas T-187 sampai T-193, empat skill dan empat agen ERP di .claude, keputusan di [[documentation/DECISIONS]]. Bukti: source-level (isi workbook); belum ada kode. Production dan Vercel tidak disentuh. Langkah berikut: jawaban pemilik atas pertanyaan di analisis, lalu T-189 (mesin harga dan uji emas).

### 2026-11-05 — Berjalan dan Jadwal dibedakan (T-186, lokal)

Tinjauan pemilik berurutan: Gantt kurang bagus untuk memantau; Jadwal dan Berjalan masih sama; minta papan jadwal seperti Antlia (Production Calendar) tetapi lebih baik; papan per work center terlalu membingungkan; Jadwal cukup timeline bersih dengan nama PT. Hasil: **Berjalan** memuat matriks posisi tiap item per langkah (centang, cincin posisi, strip posisi, penanda Diam N hari, mode Ringkas dan Rinci); **Jadwal** menjadi timeline satu batang per SPK dengan nama customer, status prediksi, bendera due date, perkiraan siap kirim dari mesin baru rencana.js (kapasitas terbatas, urut due date), tanpa rincian work center; Rinci per item dan Per mesin tetap ada. Bukti: unit rencana 11 (semua unit PASS), e2e regresi 42, role 12, akses 34, produksi 134, tampilan 72, alur lengkap 15 (0 FAIL; mock, bukan bukti Supabase). Kebutuhan di [[PRD_PRODUKSI]] bagian 16. Belum ditayangkan; migration 14 tetap draf. Langkah berikut: tinjauan pemilik.

### 2026-11-05 — Papan jadwal v3 interaktif dan urutan tab SPK (T-185, lokal)

Tinjauan pemilik: urutan tab diubah menjadi Daftar SPK, Jadwal, Berjalan, KPI & Analisa (Daftar SPK dibuka lebih dulu); Gantt bagus secara tampilan tetapi kaku dipakai. Hasil: hover batang menampilkan kartu keterangan, klik batang membuka panel detail SPK (item dan langkah mesin), penunjuk tanggal mengikuti kursor, zoom Detail, Harian, Ringkas, Buka semua dan Lipat semua, geser garis waktu dengan drag. Bukti: e2e regresi 42, role 12, akses 34, produksi 118, tampilan 72, alur lengkap 15 (0 FAIL; mock, bukan bukti Supabase). Kebutuhan di [[PRD_PRODUKSI]] bagian 15. Belum ditayangkan; migration 14 tetap draf. Langkah berikut: tinjauan pemilik.

### 2026-11-05 — Audit progres proyek

- Selesai: audit silang vault, git, GitHub, dan Supabase production; laporan di [[AUDIT_PROGRESS_2026-11-05]]. Posisi: tugas selesai 29 dari 105 (28%), effort 16%, jalur kritis sisa 26,5 hari kerja menuju go-live.
- Temuan utama: jalur proses dan data (T-030 sampai T-036) belum mulai; fitur produksi multi-WC (T-174 sampai T-183) selesai di lokal tetapi belum tayang, 110 commit di depan `main`; aturan lingkup 3 Nov terlewati; 13 tugas menunggu tinjauan pemilik.
- Langkah berikut: keputusan pemilik pada tujuh butir di laporan audit.

### 2026-11-05 — Data bahan baku Oktober dimuat ke production (T-184)

- Selesai: data uji RM dicadangkan ke skema `arsip_20261105` lalu dihapus; 23 item plat dari workbook 27 Oktober dimuat (stok awal 2026-10-27, total 408). Aplikasi tidak diubah.
- Bukti: `verified in database`. Tampilan live belum diperiksa. Langkah berikut: pemilik memeriksa Gudang Bahan Baku.

### 2026-11-02 — Workspace dan dashboard

- Selesai: susun vault Obsidian di root repository beserta panduan workspace, roadmap, progress, riset, template, dan aturan screenshot.
- Selesai: pertahankan branch awal dan gunakan `development` untuk pekerjaan lokal; belum ada deployment atau isolasi database berdasarkan branch.
- Selesai: tulis panduan aplikasi source-level, inventaris fitur, dan inventaris 20 collection dari kode.

### 2026-11-02 — Model tim dan skill

- Selesai: rangkum empat sumber agent/skill dan buat empat agent serta empat skill lokal yang sesuai dengan stack dan batas akses.
- Selesai: pertahankan agent ERP read-only yang sudah ada.
- QA browser belum dijalankan; file agent/skill mendefinisikan workflow, bukan bukti pengujian.

### 2026-11-02 — Preview lokal

- Selesai: buat `apps/gudang-logistik/scripts/preview-server.mjs` untuk menjalankan preview Node pada loopback `127.0.0.1:8002`.
- HTTP 200 diverifikasi untuk halaman, CSS, dan JS dengan Content-Type sesuai.
- Temuan dan perbaikan: server awal memetakan HTML subfolder tetapi tidak URL asset relatif `/assets/...`; server kini memakai folder aplikasi langsung sebagai root.
- Belum diverifikasi: render browser, console, responsive layout, navigasi aktual, dan screenshot setelah perbaikan.

### 2026-11-02 — Supabase, integrasi, dan pilot foundation

- Selesai: audit read-only menemukan project hosted `MNI - Operational` berstatus aktif, Postgres 17, 80 tabel public ber-RLS dan 19 migration records. Nama project belum membuktikan bahwa ia target checkout ini.
- Selesai: catat security advisor findings: 3 mutable search-path functions, 1 `SECURITY DEFINER` RPC yang dapat dipanggil anon, 7 yang dapat dipanggil authenticated, dan leaked-password protection nonaktif. Performance advisor: 94 FK tanpa covering index, 20 auth init-plan findings, dan 109 unused-index notices.
- Selesai: bandingkan migration sibling `organizations`/`organization_members` dengan hosted `tenants`/`tenant_memberships`; lineage berbeda, tidak ada file yang disalin atau diterapkan.
- Selesai: jalankan Supabase CLI `2.122.0` via `npx`, lalu `supabase init` pada folder aplikasi. Config lokal tidak di-link ke hosted project; migrations dan seed belum dibuat.
- Blocked: Docker engine/service gagal diakses dari sesi Windows ini; Supabase local stack belum bisa dijalankan.
- Blocked: daftar project melalui CLI memerlukan Supabase CLI access token yang belum dikonfigurasi. Tidak ada token yang diminta atau disimpan. Management connector hanya dipakai untuk inspeksi read-only; project kandidat belum memiliki development branch.
- Selesai sebagai draft: [[apps/gudang-logistik/docs/PILOT_BRIEF|brief pilot baca saldo]] dan [[apps/gudang-logistik/docs/DATA_MAPPING|mapping awal]]. Butuh validasi process owner.
- Selesai: tulis [[FOUNDATION_BASELINE|baseline fondasi]], rencana integrasi, dan update checklist. Tidak ada perubahan hosted DB, OAuth, GitHub, atau Vercel.

### 2026-11-02 — Percobaan koneksi Supabase langsung

- Hasil: koneksi aplikasi ke Supabase **belum terbentuk**. UI masih memakai adapter `window.claude`; config Supabase hanya scaffold lokal.
- CLI `projects list` terhenti karena access token CLI belum dikonfigurasi; Docker engine tidak tersedia untuk menjalankan database lokal.
- Connector manajemen menunjukkan project kandidat aktif melalui pemeriksaan metadata read-only, tetapi target untuk checkout ini belum dikonfirmasi dan project tidak memiliki development branch.
- Ledger diverifikasi ulang: 19 record (versi terakhir `20261019231625`, nama `020_seed_demo_data`). Koreksi angka lama 20 pada dokumentasi.
- Tidak ada perubahan database hosted, linking, OAuth, migrasi, data operasional, GitHub, atau deployment.

### 2026-11-02 — Perubahan arah produk

- Keputusan pengguna: MNI OS tidak mengacu pada Antlia sebagai blueprint; sistem dikembangkan custom untuk menyelaraskan kebutuhan tim Operasional.
- Roadmap discovery diubah agar dimulai dari proses aktual, wawancara/walkthrough, dokumen dan data sumber yang diizinkan, kontrol, pengecualian, serta validasi pemilik proses.
- Dibuat [[OPERATIONAL_DISCOVERY|register discovery Operasional]] beserta [[templates/PROCESS_DISCOVERY_TEMPLATE|template walkthrough]] dan [[templates/REQUIREMENT_TEMPLATE|template requirement]]; register sengaja kosong karena belum ada kebutuhan yang tervalidasi.
- Rekomendasi generik dari riset eksternal hanya menjadi pola pembanding. Requirement, arsitektur data, dan prioritas wajib ditelusuri ke kebutuhan MNI yang telah divalidasi.
- Brief pilot saldo gudang, inventaris source code, mapping schema hosted, dan hasil riset lama tetap disimpan untuk jejak audit; statusnya hipotesis/provisional sampai divalidasi.
- Supabase target/schema untuk produk custom belum dipilih. Jangan menganggap project hosted kandidat atau model tabelnya sebagai rancangan final.

### 2026-11-02 — Koreksi pesan preview lokal

- Screenshot pengguna menunjukkan UI masih meminta dibuka melalui `claude.ai` dan menampilkan klaim penyimpanan/sinkronisasi bersama, padahal backend belum dikonfigurasi.
- Diperbarui copy status/loading/footer agar menyatakan ini pratinjau lokal, backend belum dikonfigurasi, dan data tidak dimuat/disimpan/disinkronkan. Error aksi simpan/pembuatan pengguna juga tidak lagi menyuruh login ke Claude.
- Status teknis tetap sama: ini koreksi keterangan UI, bukan koneksi Supabase atau implementasi backend. Browser visual tidak dijalankan pada sesi ini.

### 2026-11-02 — Intake workbook Operasional

- Selesai: inventaris struktural read-only terhadap enam workbook PPIC bulanan, raw material, stok barang, dan SPK individual. Header, pola sheet, perbedaan posisi header, tab revisi, dan keberadaan formula dirangkum di [[DATA_SOURCE_CATALOG|katalog sumber data]].
- Selesai: buat salinan lokal di `data/private-sources/`; sumber asli tetap di lokasi semula. Folder kerja dikecualikan dari Git; dokumentasi tidak menyimpan baris atau jumlah transaksi.
- Temuan awal: dashboard PPIC memiliki banyak tab SPK per snapshot; raw material muncul di workbook tersendiri dan dashboard; stok barang jadi memisahkan master `Straight` dari transaksi September/Oktober; SPK 438 memakai variasi struktur kolom.
- SPK 438 juga terdeteksi di tiga dashboard bulanan. Ia dapat menjadi contoh rekonsiliasi lintas sumber setelah owner mengizinkan dan menjelaskan revisi/status yang resmi.
- Belum dilakukan: profiling kualitas nilai, validasi formula/cached values, penetapan as-of/source of truth, rekonsiliasi saldo, atau pemilihan pilot. Perlu konfirmasi owner dan definisi data dari tim.
- Koreksi status setelah audit lanjutan: profiling nilai dan formula/cache telah dilakukan dan dicatat di bawah. Yang masih terbuka adalah owner/as-of/sumber resmi, penyebab dan penanganan formula error, rekonsiliasi saldo, dan pemilihan pilot.

### 2026-11-02 — Audit kualitas dan contoh lintas sumber

- Selesai: audit formula/cache untuk enam workbook. Tiga dashboard PPIC memiliki 13, 17, dan 6 hasil formula error tersimpan. Error mencakup referensi rusak, custom function `hitungwarna`/`hitungwarnahijau` yang tidak didefinisikan di workbook, serta tiga `#VALUE!` pada dashboard Agustus.
- Selesai: raw material memiliki 23 baris ber-ITEM dengan kolom ukuran/buffer/stok/satuan terisi, tidak ada nilai negatif pada buffer/stok atau duplikat kandidat ITEM+UKURAN.
- Selesai: master `Straight` memiliki 60 baris kandidat; satu kombinasi atribut produk berulang pada baris sumber 14 dan 69. Belum diketahui apakah itu duplikasi bisnis karena SKU tidak tersedia.
- Selesai: profil 66 baris transaksi September dan 38 Oktober. Nilai masuk/keluar numerik dan tidak negatif; tanggal kosong selalu mengikuti tanggal sebelumnya, dan format tanggal campuran. Aturan carry-forward belum disahkan.
- Selesai: dua baris item SPK 438 cocok berdasarkan deskripsi, qty, dan satuan pada dokumen individual serta ketiga snapshot. Milestone/status tidak direkonsiliasi.
- Ditambahkan [[DATA_DICTIONARY|draft kamus data]]. Tidak ada workbook diubah; kesimpulan mengenai sumber resmi, arti status, saldo, tanggal, dan key tetap menunggu owner.

### 2026-11-02 — Perbandingan raw material lintas sumber

- Selesai: cocokkan kandidat key `ITEM + UKURAN` pada file raw Oktober dan tiga snapshot dashboard. Ada 22 key bersama; ketiga dashboard sama pada field yang dibandingkan.
- Pada 22 key bersama, buffer dan satuan sama terhadap file raw; stok berbeda pada 11 key dan satu tanggal berbeda. Satu key hanya ada di file raw. Nilai mentah tidak disalin ke vault.
- Dicatat isu `DQ-RM-001` beserta lima isu data/proses lain di [[DATA_SOURCE_CATALOG|register isu data]]. Perbedaan tidak diklasifikasikan sebagai error sampai owner menetapkan cut-off dan sumber resmi.
- Koreksi scope: pemeriksaan tetap read-only; tidak ada workbook yang diubah, nilai bisnis yang dipindahkan, atau sinkronisasi eksternal.

## Fokus tindak lanjut

1. Mulai discovery bersama tim Operasional: pilih proses untuk walkthrough dan identifikasi pemilik proses, artefak, serta batas akses.
2. Dokumentasikan current-state dan requirement; validasi prioritas/outcome bersama pemilik proses. Brief saldo gudang lama tetap hipotesis.
3. Siapkan Docker/Supabase local stack secara terpisah agar siap dipakai setelah kebutuhan data dan environment disepakati.
4. Turunkan schema/migration serta seed sintetis dari requirement custom yang diterima; implementasikan Auth/RLS sebelum vertical slice.
5. Jika perlu akses CLI, gunakan mekanisme login Supabase yang aman di mesin lokal; jangan menempelkan token ke chat, repo, atau `.env` browser.
6. Minta surface browser lokal yang didukung untuk verifikasi visual/QA dan screenshot.

## Tautan kerja

- [[ROADMAP|Roadmap dan checklist]]
- [[FOUNDATION_BASELINE|Baseline fondasi dan bukti]]
- [[IMPLEMENTATION_PLAN|Rencana local-first]]
- [[TEAM_AND_SKILLS|Tim Codex dan skill]]
- [[apps/gudang-logistik/docs/DEVELOPMENT|Panduan pengembangan]]
- [[apps/gudang-logistik/docs/PILOT_BRIEF|Brief pilot]]
- [[apps/gudang-logistik/docs/DATA_MAPPING|Mapping data]]
- [[OPERATIONAL_DISCOVERY|Discovery dan requirement Operasional]]
- [[screenshots/README|Indeks screenshot]]

### 2026-11-02 — Integrasi scaffold mni-app dan tiga versi

- Selesai: salin `mni-app` ke `apps/platform` (tanpa `node_modules`/`.env`); `npm ci` dan `vite build` berhasil.
- Selesai: [[ENVIRONMENTS|panduan tiga versi]] (Development, Main, Docs). Branch sudah ada di GitHub; deploy dan database terpisah belum dibuat.
- Temuan: dev server memuat halaman login, tetapi `app.js` error saat load (lihat [[ENVIRONMENTS]]). Screenshot: [[screenshots/README]].
- Hambatan: `mni-gudang.html` asli tidak ada; extract dicoba dari file reference.
- Berikutnya: selidiki error `addEventListener`, putuskan target Supabase dev/prod, buat project Vercel dan situs docs.

### 2026-11-02 — Perbaikan bootstrap mni-app

- Selesai: `apps/platform/index.html` kini memuat `app.css`, menyisipkan `app-body.html`, lalu memuat `app.js`. Error `addEventListener` hilang.
- Bukti: browser (Playwright) di `127.0.0.1:5175`; screenshot [[screenshots/README]]. Sisa error console hanyalah akses ke Supabase dummy.
- Belum diverifikasi: login OTP, data nyata, RLS, tampilan setelah login. `public/app.*` dihasilkan `npm run extract` dan di-ignore Git.

### 2026-11-02 — Sistem tracking dan rencana go-live

- Selesai: 47 catatan tugas di `tasks/` (T-001 sampai T-074; 5 selesai), `scripts/progress-report.mjs`, [[PROGRESS_SNAPSHOT]], [[PROGRESS_DASHBOARD]] dengan Bases `documentation/dashboards/Tugas.base`, [[templates/TASK_TEMPLATE]], dan [[GO_LIVE_PLAN]].
- Hasil: jalur kritis sisa menuju go-live sekitar 26,5 hari kerja; jalur proses/data menentukan kecepatan.
- Bukti: skrip snapshot berjalan tanpa masalah data (source-level).
- Belum diverifikasi: tampilan Bases di Obsidian (butuh versi 1.9+ dengan core plugin Bases); estimasi effort belum divalidasi.
- Berikutnya: mulai T-010, T-030, T-032, T-040 yang sudah siap dikerjakan.

### 2026-11-02 — T-014 sumber UI mni-app

- Selesai: sumber kebenaran UI = `apps/gudang-logistik/` (reference hanya memakai 15 dari 20 koleksi). `extract-app.js` memakai sumber itu secara default dan reproducible dari klon bersih.
- Bukti: extract + `vite build` + muat di browser tanpa error console (verified in browser, UI saja). Keputusan: [[documentation/DECISIONS]].
- Dampak: T-021 kini menguji sumber yang benar-benar memakai 20 koleksi. Berikutnya: T-010 (Docker).

### 2026-11-02 — Terhubung ke GitHub

- Selesai: `gh` login sebagai `mitranusainternational-cloud` (push: true). Remote `origin` dipasang di `mni-os`; `development` dan `docs` di-push (fast-forward, `be457dc` ke `dfbc7a3`). Terverifikasi lewat GitHub API.
- Sisa T-041: default branch `main` dan branch protection. `main` belum berisi pekerjaan baru; promosi lewat [[RELEASE_CHECKLIST]].
- Catatan: push memakai `-c credential.helper="!gh auth git-credential"` karena Git Credential Manager menyimpan akun lama.

### 2026-11-02 — Roadmap produk dan perapian vault

- Selesai: [[roadmap/PRODUCT_ROADMAP]] (rilis v0.9, v1.0, v1.1, v1.2, v2.0), 14 epic di `roadmap/epics/`, 20 tugas pasca go-live (T-101 sampai T-152), properti `epic` dan `release` pada semua 67 tugas, tampilan Bases `Epic.base`, dan skrip snapshot yang menghitung progress per rilis dan epic.
- Selesai: `scripts/check-vault.mjs` dan [[VAULT_HEALTH]]; perbaiki 21 link rusak, 9 link ambigu, dan 9 catatan tanpa properti. Hasil akhir: 0 rusak, 0 ambigu, 0 properti hilang, 0 yatim (source-level).
- Selesai: Home ditulis ulang sebagai hub (status, "Saya ingin…", peta vault, ritme kerja); WORKSPACE_GUIDE dan indeks dokumentasi diperbarui.
- Belum diverifikasi: tampilan Bases dan embed `![[...#heading]]` di aplikasi Obsidian. Rilis v1.1 sampai v2.0 berisi hipotesis dan perlu ditinjau ulang di gerbang G5 setelah hypercare.

### 2026-11-02 — Proteksi branch main (T-041)

- Selesai: proteksi `main` di GitHub: PR wajib dengan 1 approval, dismiss stale review, percakapan harus selesai, force-push dan delete dilarang; `enforce_admins` mati. Terverifikasi lewat GitHub API.
- Dampak: `main` hanya berubah lewat PR dari `development` sesuai [[RELEASE_CHECKLIST]]. Required status check ditambahkan setelah CI ada (T-046). Karena pemilik repo juga satu-satunya pengembang, approval perlu akun kedua atau bypass admin; putuskan saat PR pertama.

### 2026-11-02 — Pratinjau lokal dan login (T-016)

- Selesai: mode mock lokal (`src/lib/local-supabase.js`, `VITE_LOCAL_MOCK=1`) dengan 5 akun dan data sintetis; adapter dimuat dinamis, bootstrap menunggu `window.claude`. Panduan: [[LOCAL_PREVIEW]].
- Bukti: verified in browser, login admin lalu dashboard dengan data contoh, 0 error console; screenshot di [[screenshots/README]].
- Temuan: Docker tidak bisa start karena virtualisasi CPU nonaktif di BIOS (T-010). Auth, RLS, dan Supabase sungguhan belum teruji.

### 2026-11-02 — Pratinjau lokal dan login (T-016)

- Selesai: mode mock lokal (`src/lib/local-supabase.js`, `VITE_LOCAL_MOCK=1`) dengan 5 akun dan data sintetis; adapter dimuat dinamis, bootstrap menunggu `window.claude`. Panduan: [[LOCAL_PREVIEW]].
- Bukti: verified in browser, login admin lalu dashboard dengan data contoh, 0 error console; screenshot di [[screenshots/README]].
- Temuan: Docker tidak bisa start karena virtualisasi CPU nonaktif di BIOS (T-010). Auth, RLS, dan Supabase sungguhan belum teruji.

### 2026-11-02 — Panduan virtualisasi/Docker dan sinkronisasi vault

- Selesai: [[DOCKER_SETUP]] (diagnosis mesin Lenovo 20R6, langkah BIOS, fitur Windows/WSL, Docker Desktop, `supabase start`). T-010 diubah ke `blocked` dengan pemilik tindakan (pemilik mesin) dan penyebab.
- Selesai: `scripts/sync-vault.mjs` menggabungkan snapshot dan cek kesehatan; aturan di `AGENTS.md`, Home, dashboard, dan WORKSPACE_GUIDE kini memakainya. ROADMAP, PRODUCT_ROADMAP, dan GO_LIVE_PLAN memuat blocker yang sama.
- Bukti: `node scripts/sync-vault.mjs` berakhir OK (69 tugas, 9 selesai, 0 link rusak). Diagnosis hardware: `VirtualizationFirmwareEnabled=False`.
- Berikutnya: setelah BIOS, fitur Windows, dan Docker beres, kerjakan T-011, T-012, T-013, lalu T-020.

### 2026-11-02 — Uji modul dan fitur (mock), 5 bug diperbaiki

- Selesai: uji asap 10 modul (10/10 PASS) dan 14 fitur inti (CRUD bahan baku/barang jadi/SPK/vendor/surat jalan/bongkar muat/master, validasi stok, ekspor CSV 9 modul). Matriks, bug, dan bukti: [[TEST_MATRIX]]. Tugas: T-018, T-019 selesai; T-026 (fitur belum tercakup) dijadwalkan.
- Bug diperbaiki: `USER.profiles` hilang, identitas pengguna tidak muncul setelah login, seed tidak sesuai bentuk data app, ekspor CSV/XLSX/PDF gagal karena `DLS.save` belum ada. B-001, B-002, dan B-005 berada di kode produksi.
- Bukti: verified in browser (mock, data sintetis), 0 pageerror. Skrip: `apps/platform/tests/e2e/modules.mjs`, `flows.mjs` (flows belum dijalankan sebagai berkas mandiri).
- Belum: Supabase nyata, login OTP nyata, RLS, realtime, XLSX/PDF, opname, edit/hapus. Menunggu Docker (T-010) dan T-026.

### 2026-11-02 — T-026 selesai: 30 fitur diuji, 4 bug tambahan

- Selesai: uji lanjutan UI mock (kartu stok, opname barang jadi, ubah item, master ubah/hapus, update produksi, revisi dan duplikat SPK, terima kembali dari vendor dengan reject, status surat jalan, siklus bongkar muat, ekspor Excel dan PDF, pencarian/filter, tema gelap, Back, mobile). Matriks: [[TEST_MATRIX]].
- Bug diperbaiki: B-006 tombol "set semua selesai"; B-007 id dokumen non-UUID; B-008 `spk.no` teks vs angka (edit SPK membuat baris ganda); B-009 dokumen `master/*` memakai kolom key. B-007 sampai B-009 adalah ketidakcocokan app dengan schema Postgres yang disembunyikan oleh mock; mock kini meniru batasan UUID.
- Bukti: verified in browser (mock, data sintetis), 0 pageerror. XLSX dan PDF diperiksa sebagai berkas valid.
- Risiko: perbaikan adapter belum teruji pada Postgres nyata, dijadwalkan T-028 (P0). Sisa fitur di T-027.

### 2026-11-02 — Agenda discovery disiapkan

- Selesai: [[DISCOVERY_AGENDA]] berisi tujuan, peran peserta, aturan sesi, 5 sesi (sekitar 5,5 jam) dengan rincian menit, pertanyaan kunci per topik yang ditautkan ke isu data DQ-*, tabel keputusan D-01 sampai D-10, dan langkah 24 jam setelah sesi. Catatan di T-030, T-031, T-032, dan T-036 menautkannya.
- Belum: tanggal, peserta, dan undangan (pemilik proyek). Sesi belum berlangsung; status tugas tetap todo.

### 2026-11-02 — Regresi penuh 33/33 dan peta koneksi berikutnya

- Selesai: regresi penuh pada pratinjau mock (login, 10 modul, 22 alur inti): 33 PASS, 0 FAIL, 0 pageerror. Regresi menemukan B-010 (lembar SPK kosong yang memblokir layar setelah menerbitkan SPK, akibat pemetaan id B-007); diperbaiki dengan alias id dan penjaga `openSheet`.
- Selesai: inventaris akun cloud hanya-baca: 3 project Supabase (dua aktif berskema ERP berbeda), Vercel team NIJ tanpa project. Opsi koneksi A/B/C tercatat di [[documentation/ENVIRONMENTS]].
- Berikutnya: keputusan pemilik akun atas opsi A (project Supabase baru) atau B (Docker lokal); lalu T-042, T-011, T-020, T-028, T-044.

### 2026-11-02 — Supabase dev dibuat dan schema diselaraskan (T-042 selesai)

- Selesai: project `MNI Gudang - Dev` (ref `inldyqigewmziwazalun`); `MNI OS - Operational` (kosong) dijeda atas persetujuan pemilik karena batas 2 project gratis. Tiga migration terpasang (20 tabel, 39 policy, realtime 17 tabel). Advisor keamanan: hanya peringatan (dicatat di T-060).
- Temuan penting: schema migration awal tidak cocok dengan bentuk dokumen app; ditambahkan model "kolom inti + JSONB `data`" (migration 3, adapter, [[documentation/DECISIONS]]). Mock diperketat meniru PostgREST/Postgres; regresi 33/33 PASS.
- Bukti: Postgres nyata menolak id non-UUID; sisipan SPK dengan JSONB berhasil. Belum: login OTP nyata dan uji app terhadap Supabase dev (T-029).
- Risiko: baris uji SPK `9999` tertinggal karena perintah hapus ditolak; harus dibersihkan sebelum SPK dibuat. Temuan RLS vs alur app dicatat di T-022.
- Berikutnya: email admin awal dari pemilik (T-029), lalu T-021, T-022, T-028, dan Vercel (T-044).

### 2026-11-02 — Admin awal dibuat; uji tingkat database di Supabase dev

- Selesai: admin awal `mitranusainternational@gmail.com` (muser admin + pengguna auth). Server dev ke Supabase berjalan di `http://127.0.0.1:5174/` (`npx vite --mode supabase-dev`). Halaman termuat tanpa respons 4xx setelah perbaikan B-011 (`master`/`log` tidak punya `created_at`).
- Bukti (database nyata, semua di-rollback): 12/12 penulisan bentuk dokumen app berhasil sebagai admin; pengguna tak terdaftar ditolak; matriks hak tulis per role terhitung ([[TEST_MATRIX]]). Pembacaan anonim ke tabel SPK = 0 baris.
- Belum: login OTP oleh pemilik (kode di email), hapus baris uji `9999`, dan uji alur lewat aplikasi pada Supabase (T-029, T-021, T-028).
- Temuan: matriks RLS belum selaras dengan alur app (produksi tidak dapat mencatat mutasi/surat jalan/bongkar; gudang dan produksi tidak dapat menulis kunci di `master`; viewer dapat menulis `log`) — bahan T-022 dan T-036.

### 2026-11-02 — Diagnosis login pertama di Supabase dev

- Temuan dari log Auth/REST: email yang diterima berisi tautan konfirmasi ke `localhost:3000` (bukan kode); permintaan kode ulang kena HTTP 429 (batas email); verifikasi kode 403; `last_sign_in_at` masih kosong dan baris uji `9999` belum terhapus. Seluruh pembacaan REST membalas 200.
- Perbaikan: B-012 (UI tidak lagi mengaku mengirim kode ketika ditolak) dan opsi "Masuk dengan password" untuk Supabase sebagai cadangan; panduan konfigurasi Auth di [[documentation/ENVIRONMENTS]].
- Berikutnya: pemilik mengatur password sendiri dan menghapus baris 9999 lewat SQL Editor, lalu uji alur lewat aplikasi (T-029, T-021, T-028).

### 2026-11-02 — Jalur integrasi, agen, dan skill proyek

- Selesai: [[INTEGRATION_PATH]] (tahap S0 sampai S6 dengan gerbang, aliran data, matriks environment, kriteria VPS), 7 skill dan 6 agen di `.claude/`, `CLAUDE.md`, regresi E2E tersimpan di `apps/platform/tests/e2e/`, epic E-15 (VPS) dan tugas T-075, T-076, T-077, T-160, T-161.
- Rekomendasi: urutan lokal → Supabase dev → GitHub CI → Vercel preview → UAT → production dipakai; CI dipasang sebelum Vercel; VPS menjadi opsi S6 dengan kriteria terukur (mulai dari layanan pendamping), bukan langkah otomatis.
- Bukti: source-level; agen dan skill belum dipanggil satu per satu. Regresi mock 33/33 (sebelumnya) tetap rujukan.
- Berikutnya: login nyata dan uji Supabase (T-029), lalu CI (T-046, T-077) dan Vercel preview (T-044).

### 2026-11-02 — Admin siap login (password sementara) dan baris uji dinetralkan

- Selesai (atas arahan pemilik): password sementara acak untuk `mitranusainternational@gmail.com` diatur dan email dikonfirmasi lewat SQL pada project dev; bcrypt dan identitas email diverifikasi. Password tidak disimpan di vault/Git dan harus diganti pemilik setelah login pertama.
- Baris uji SPK `9999` dinetralkan menjadi `UJI-9999` berstatus `Batal` karena perintah hapus ditolak oleh persetujuan SQL (tiga kali); penomoran SPK pertama akan 1. Hapus permanen oleh pemilik bila diinginkan.
- Belum: login pertama dan uji alur lewat aplikasi (T-029 → T-021, T-028, T-022). Agen tidak masuk sendiri dengan kredensial ini karena kredensial akan dikirim ke layanan cloud di luar pratinjau lokal.

### 2026-11-02 — Login nyata ke Supabase dev berhasil (T-029 selesai)

- Selesai: login password admin berhasil (15:38 UTC). Log API: token 200, `muser` per email 200, lalu 19 koleksi dimuat dengan semua respons 200 dan realtime tersambung (dua kali karena halaman dimuat ulang setelah login, sesuai B-002). RLS memberi admin akses baca.
- Bukti: verified in database + log (bukan hanya source-level). Belum ada penulisan lewat aplikasi.
- Berikutnya: pemilik menjalankan skenario U-01 sampai U-12 ([[UJI_SUPABASE_DEV]]); agen memverifikasi di database dan log, memperbaiki yang gagal, lalu T-021, T-028, T-022 diperbarui.

### 2026-11-02 — Uji tulis nyata di Supabase dev dan B-013

- Selesai: pemilik menjalankan alur di aplikasi yang tersambung ke Supabase dev. Log API dan isi tabel menunjukkan penulisan berhasil untuk rm, fg, mutasi (opname), spk (id UUID, no "1"), mcustomer, mwc, marmada, mvendor, vendor, kirim, bongkar, dan master (katalog, counter, lock). Ringkasan di [[TEST_MATRIX]].
- Temuan: B-013 — 16 dari sekitar 24 penulisan `log` ditolak karena string kosong pada kolom timestamp; kelas masalah yang sama mengancam `spk.due` kosong dan kolom numerik. Diperbaiki di adapter (`STRICT_COLS`), mock diperketat, regresi mock **36/36**; perlu uji ulang di Supabase. Noise 406 dari `.single()` diganti `maybeSingle()`.
- Catatan desain: `mutasi.item_id` NULL (item di `data`), kunci lock bertumpuk dan tidak dilepas; dicatat untuk normalisasi data setelah discovery (T-033).
- Berikutnya: pemilik memuat ulang aplikasi dan mengulang U-02, U-03, U-06 ([[UJI_SUPABASE_DEV]]); agen memverifikasi dan menutup T-021 dan T-028.

### 2026-11-02 — B-013 terverifikasi; terima/pakai material dan revisi SPK lulus di Supabase

- Selesai: ulangan pemilik di aplikasi (16:03–16:13 UTC). Semua `POST log` 201 (34 log, 0 `tgl` NULL), tanpa 400/406 dan tanpa galat Postgres; terima material (+7, `RCV/2026/11/001`), pakai produksi (-3, -1, `PK/2026/11/001`), revisi SPK (`rev = 1`, satu baris, alasan tersimpan), supplier dan counter otomatis tersimpan.
- Bukti: verified in database + log. T-021 dan T-028 berstatus `review` (sisa: duplikat SPK, pengaturan RM, delete, realtime, role selain admin).
- Berikutnya (tahap S2): CI GitHub (build + regresi, T-046, T-077), RLS per role vs alur (T-022, T-036), lalu Vercel preview (T-044). Jalur: [[INTEGRATION_PATH]].

### 2026-11-02 — Uji role pada RLS nyata dan model role selaras aplikasi

- Temuan: aplikasi sudah memuat model role sendiri (admin, ppic, gbb, gbj, logistik, viewer; hak per modul) yang tidak dipakai policy database. Uji alur × role pada RLS nyata (di-rollback) menunjukkan alur lintas peran gagal untuk role selain admin.
- Selesai: migration 4 (`role_modules`, `can_mod`/`can_any`/`is_admin`, policy `_v2` untuk semua tabel) terpasang. Matriks 16 baris × 6 role sesuai model aplikasi ([[TEST_MATRIX]]). Keputusan di [[documentation/DECISIONS]]. Peta role sementara sampai disahkan tim (T-036).
- Hambatan: migration 5 (DROP policy lama) ditolak oleh persetujuan SQL; viewer masih dapat menulis log sampai itu dijalankan (T-078, blocked, pemilik).
- Berikutnya: T-078 (pemilik), T-079 (akun uji per role), lalu CI GitHub (T-046, T-077).

### 2026-11-02 — Penyimpangan role ditutup dan role ditegakkan di UI

- Selesai (database): migration 6 `role_model_supersede` terpasang (ALTER POLICY, tanpa DROP). Uji rollback: viewer dan role lama tidak dapat menulis log atau tabel lain; ppic, gbb, gbj, logistik hanya menulis modulnya. Bukti: verified in database.
- Selesai (UI): peran dari backend dipakai `guard()` tanpa `ROLE_ON`; adapter hanya menganggap admin, ppic, gbb, gbj, logistik sebagai penulis; akun mock memakai role aplikasi (seed v6). Uji `roles.mjs`: 12 PASS di mock.
- Sisa: uji role lewat aplikasi di Supabase dengan akun per role (T-079, butuh akun dari pemilik); regresi penuh 36 diulang saat runner terpasang (T-077); pengesahan peta role oleh tim (T-036).
- Berikutnya: CI GitHub (T-046, T-077), lalu Vercel preview (T-044).

### 2026-11-03 — Uji final di mock dengan Playwright (runner terpasang)

- `playwright` terpasang sebagai devDependency di `apps/platform` (cara pasang diperiksa di dokumentasi resmi lewat Context7: `npm i playwright`, `npx playwright install chromium`, tambahkan `--with-deps` di CI Linux). `tests/e2e/run.mjs` kini menjalankan regresi dan uji role.
- Hasil, dua kali berturut-turut: regresi 36 PASS, 0 FAIL; role 12 PASS, 0 FAIL. Satu kegagalan sementara pada R-05 (jeda tulis) diperbaiki dengan menambah waktu tunggu di `roles.mjs`; tiga ulangan lain bersih.
- Belum: uji aplikasi di Supabase dengan akun per role (T-079, butuh akun dari pemilik) dan workflow CI (T-046).

### 2026-11-03 — Vault `mni-os` didaftarkan di Obsidian dan dirapikan

- Vault terdaftar dan terbuka. `.obsidian`: plugin inti (Bases, Properties, Templates, Bookmarks, Graph), folder template `documentation/templates`, lampiran ke `documentation/screenshots`, bookmark ke Home, Progress, Tugas, Epic, Roadmap, Log progres, Matriks uji, Keputusan, Kesehatan vault, graph berwarna per folder.
- `Home.md` diperbarui sesuai kondisi nyata (Supabase dev, RLS per role, uji Playwright, langkah berikutnya CI).

### 2026-11-03 — Rapikan struktur project

- `apps/mni-app` menjadi `apps/platform`; 55 rujukan di 30 berkas diperbarui; peta folder induk ditulis ulang. Folder lama dipindah ke `_Arsip/`.
- Uji dari lokasi baru: sync vault OK (0 tautan rusak), regresi 36 PASS, role 12 PASS, server Supabase dev 200.

### 2026-11-03 — Uji aplikasi di Supabase dev dari lokal; dua bug nyata ditemukan dan diperbaiki

- Uji lewat Playwright (sesi pemilik) di aplikasi lokal terhubung Supabase dev: alur admin lulus; role gbb, gbj, ppic, viewer diuji lewat aplikasi dengan mengganti role akun pemilik sementara dan memulihkannya ke admin (diverifikasi).
- Bug: B-014 (UI tidak memuat data baru setelah tulis) dan B-015 (nomor dokumen berulang karena counter dibaca salah). Keduanya diperbaiki di adapter; regresi 37 PASS dan role 12 PASS di mock.
- Sisa sebelum naik ke GitHub/Vercel: commit perbaikan, ubah dan hapus master, opname bahan baku (tombol tidak ada), Realtime antar sesi, `mutasi.item_id` kosong (keputusan model data).

### 2026-11-03 — Sisa temuan Supabase diselesaikan

- Diuji di Supabase dev: opname bahan baku (tab), ubah dan hapus master, master terpakai hanya nonaktif. Semua PASS.
- Diperbaiki: B-016 (kolom relasi terisi, migration 8 backfill), UI viewer (tombol catat tersembunyi, banner jelas, teks kaki sesuai koneksi). B-017: Realtime tidak mengirim event; polling 15 detik sebagai cadangan (terverifikasi ±14 detik); penyebab di T-162.
- Regresi 38 PASS, role 12 PASS di mock.

### 2026-11-03 — CI GitHub Actions berjalan (tahap S2)

- Workflow `.github/workflows/ci.yml`: job Vault dan job Aplikasi (build, regresi mock 38, uji role 12). Dicoba dulu di clone bersih lokal, lalu di GitHub: run pertama merah karena uji role, penyebabnya bug aplikasi nyata B-018 (login sangat cepat sebelum pendengar auth terpasang tidak memuat ulang halaman sehingga identitas "Tamu"). Diperbaiki di `index.html`; run berikutnya hijau (41558796125).
- Sisa S2: jadikan dua job itu required check pada `main` (pengaturan repo, butuh persetujuan pemilik). Berikutnya S3: Vercel preview (akun, butuh persetujuan).

### 2026-11-03 — Required check CI aktif pada main

- Atas persetujuan pemilik, proteksi `main` kini mewajibkan job "Vault (tautan dan properti)" dan "Aplikasi (build dan regresi mock)" lulus, selain aturan lama. Diverifikasi lewat API GitHub. T-046 dan T-077 selesai; tahap S2 selesai. Berikutnya S3: Vercel preview (akun, butuh persetujuan).

### 2026-11-03 — Merge ke main dan cross-check Supabase

- PR #1 (development ke main) digabung dengan hak admin atas persetujuan pemilik; main = development (11a2d40). Pemindaian rahasia bersih.
- Cross-check Supabase dev: migration, RLS, advisor, replikasi. Perbaikan: migration 9 (initplan, pg_trgm), migration 6 dibuat tahan-urutan untuk lingkungan baru. Hasil di [[ENVIRONMENTS]] dan [[TEST_MATRIX]].
- Berikutnya: PR kedua untuk perubahan ini, lalu persiapan Vercel preview (butuh akun dan persetujuan).

### 2026-11-03 — Persiapan Vercel preview (S3)

- Tinjauan konfigurasi menemukan dua masalah yang akan menggagalkan atau melemahkan deploy: (1) `vercel.json` memuat blok `env` yang merujuk secret Vercel lama (`@supabase-url`, `@supabase-anon-key`) sehingga build gagal; dihapus, variabel diisi di dashboard. (2) adapter memuat supabase-js dari CDN jsdelivr dengan versi mengambang `@2`; kini dibundel dari paket npm (versi terkunci lockfile), tanpa permintaan CDN saat runtime. `installCommand` diset `npm ci --ignore-scripts` seperti CI.
- Diuji: build produksi lokal, regresi 38, role 12, dan aplikasi mode Supabase (semua permintaan REST 200, tanpa permintaan jsdelivr).
- Catatan keamanan: `is_authenticated()` mensyaratkan baris `muser` aktif, jadi akun auth yang tidak terdaftar tidak dapat membaca data meski URL publik.

### 2026-11-03 — Vercel: project dibuat dan deploy pertama diperiksa

- Project `mni-os-operational` dibuat di tim Vercel `mitranusainternational-8337` (Hobby) lewat Chrome pemilik (setelah dua kali salah tempel kunci dari project Supabase lain yang terdeteksi dan dikoreksi sebelum deploy). Root `apps/platform`, preset Vite, env `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (kunci publishable project MNI Gudang - Dev). Production: https://mni-os-operational.vercel.app, deploy dari `main`; preview dari `development`.
- Pemeriksaan situs publik: host hanya Vercel, `inldyqigewmziwazalun.supabase.co`, dan Google Fonts; kunci berawalan `sb_publishable_d9B`; tidak ada mock aktif; X-Frame-Options dan nosniff aktif.
- Temuan dan perbaikan: placeholder `%VITE_LOCAL_MOCK%`/`%VITE_APP_VERSION%` tertinggal di HTML produksi (dikosongkan, versi default); sebelum login aplikasi meminta 20 tabel dan mendapat 401 (kini tidak meminta data tanpa sesi); ditambahkan CSP, HSTS, Permissions-Policy. Preview development bersih: CSP aktif, tanpa pelanggaran, tanpa permintaan data pra-login.
- Sisa: uji login di situs Vercel oleh pemilik (CSP dengan sesi, ekspor PDF/Excel), merge perbaikan ke main, atur Supabase Auth Site URL dan Redirect URL untuk domain Vercel bila memakai tautan email.

### 2026-11-03 — PR #4 digabung; production Vercel diperiksa ulang

- main = development (3b86bb0). Production https://mni-os-operational.vercel.app diperiksa dengan Playwright: host hanya Vercel dan Google Fonts sebelum login, 0 permintaan Supabase pra-login, 0 error konsol, CSP aktif, X-Frame-Options DENY, kunci `sb_publishable_d9B…`, mock kosong, versi 1.0.0. HSTS tidak tampak di domain `*.vercel.app` (Vercel mengelolanya; berlaku di domain sendiri).
- Sisa: login pemilik di situs Vercel untuk menguji CSP bersama sesi, modul, dan ekspor PDF/Excel; Site URL dan Redirect URL Supabase Auth untuk domain Vercel (bila memakai tautan email).

### 2026-11-03 — Audit kesiapan lokal, GitHub, Supabase, Vercel

- Hasil dan 12 risiko berurutan ada di [[AUDIT_KESIAPAN]]. Diperbaiki: penguncian nomor dokumen kini atomik (migration 10, `try_lock`); email pribadi dihapus dari dokumen publik; ekspor PDF/Excel terbukti jalan di bawah CSP.
- Penghalang sebelum data nyata: satu database dev berisi data uji, tanpa backup terverifikasi, Site URL Auth masih localhost, pendaftaran bebas aktif, hanya satu akun.

### 2026-11-03 — Production di akun Supabase mitranusainternational (pekerjaan database selesai)

- Project kosong `lggqigmvtefkquqjrjsb` diganti nama menjadi **MNI Gudang - Production**; migration 1–10 dijalankan berurutan dan hasilnya diperiksa dari fondasi: 21 tabel, RLS, satu set policy, matriks role (rollback), advisor, `try_lock`. Admin `muser` dibuat. Lihat [[ENVIRONMENTS]].
- Koreksi: kunci `sb_publishable_odc9Y44…` yang pemilik tempel ke Vercel sebelumnya ternyata kunci project ini; saya keliru menyebutnya salah project karena saat itu belum tahu project ini dibuat untuk production.
- Sisa (butuh pemilik): buat pengguna auth admin di project ini, atur Auth (Site URL, Redirect URL, sign-up, leaked password), perbarui env Vercel, lalu uji login dan alur penuh.

### 2026-11-03 — Penyamaan nama dan penataan lintas platform

- Nama baku **mni-gudang** (produk "MNI Gudang & Logistik"): repo GitHub `MNI-OS---Operational` menjadi `mni-gudang`; project Vercel `mni-os-operational` menjadi `mni-gudang` dengan domain production `mni-gudang.vercel.app` (alias lama tetap aktif); Supabase "MNI Gudang - Production". Folder kerja lokal masih `mni-os` (penggantian nama menunggu Obsidian dan terminal ditutup).
- GitHub: deskripsi, topik, homepage, label standar (`area:*`, `env:*`, `prioritas:*`, `jenis:*`), template PR dan isu, CODEOWNERS, SECURITY.md, CHANGELOG.md. Hapus-branch-otomatis sengaja tidak dinyalakan agar branch kerja tidak ikut terhapus saat merge.
- Vault: halaman [[SISTEM_MAP]] (daftar sumber daya, konvensi, rutinitas pemantauan, riwayat nama); rujukan nama lama di dokumen hidup diperbarui; Home, README, CLAUDE.md, skill dan agen Supabase disesuaikan.

### 2026-11-03 — Login admin dan uji baca di Supabase Production

- Pengguna admin dibuat pemilik di project MNI Gudang - Production (terkonfirmasi, berpasangan dengan `muser` admin). Login berhasil di server lokal mode production; 10 modul dan 21 tabel dibaca dengan benar; latensi median 233 ms ke Frankfurt. Lihat [[TEST_MATRIX]].
- Skrip baru `apps/platform/tests/e2e/prod-check.mjs` (login manual pemilik; opsi `--tulis` untuk data uji `UJI-PROD`). Chromium berjendela tidak dapat dijalankan dari proses asisten (spawn UNKNOWN), jadi uji putaran ini lewat browser pane.
- Sisa T-163: uji tulis di production (menunggu keputusan data uji), pengaturan Auth (Site URL, Redirect URL, sign-up, leaked password), env Vercel ke project production.

### 2026-11-03 — Uji tulis di Supabase Production

- Alur catat lengkap lulus di production (item, terima dua kali, pakai, opname, master tambah/ubah/hapus, tiga jenis SPK, kirim vendor, dua surat jalan, antrean bongkar otomatis); nomor dokumen, kolom relasi, dan kunci atomik benar; waktu simpan 0,6 sampai 1,5 detik. Detail di [[TEST_MATRIX]].
- Data uji `UJI-PROD` tertinggal; skrip pembersih bersyarat tersedia di `apps/platform/supabase/ops/bersihkan_data_uji.sql` (pemilik menjalankan sebelum go-live).
- Uji ganti role pada akun admin di production ditolak sebagai perubahan atas sumber daya bersama; tidak diulang.

### 2026-11-03 — Verifikasi go-live: Auth dan Vercel belum diubah

- Pemeriksaan langsung: Site URL production masih `http://localhost:3000` tanpa Redirect URL; `disable_signup=false`; env Vercel tidak berubah dan situs publik masih memakai database dev lama. Status rinci di [[ENVIRONMENTS]] (tabel "Status go-live production") dan tugas T-163.
- Langkah-langkah itu adalah pengaturan keamanan dan kunci yang hanya dapat dilakukan pemilik; halaman yang diperlukan dibuka di Chrome pemilik (grup tab Claude) agar tinggal menyimpan.

### 2026-11-03 — Posisi terhadap rencana go-live

**Tahap sekarang:** jalur teknis hampir tuntas; jalur proses dan data belum dimulai. Itu penentu go-live.

| Jalur ([[GO_LIVE_PLAN]]) | Posisi | Catatan |
|---|---|---|
| A Teknis (aplikasi, login, RLS, CRUD) | Hampir selesai | Aplikasi live di production, hak per modul, sinkron dua sesi sekitar 1 detik, 38 regresi + 12 role + 15 akses lulus di mock |
| C Cloud (repo, Supabase, Vercel, CI) | Hampir selesai | Sisa kecil: variabel Preview (T-044), Redirect URL (T-047), backup (T-061) |
| B Proses dan data | **Belum mulai** | T-030 walkthrough, T-031 pilot, T-032 sumber data, T-036 user awal; ini jalur kritis (sekitar 26 hari kerja) |

**Hasil sesi ini:** production Supabase baru (skema migration 1–12), nama baku `mni-gudang`, Auth dan env Vercel diarahkan, uji baca/tulis/login, data uji dibersihkan, rencana adopsi, hak akses per pengguna dan per modul, menu Pengguna & Akses, sinkron berbasis sidik.

**Aturan pengendalian lingkup mulai sekarang:** tidak ada fitur baru sebelum pilot berjalan. Hanya tiga jenis pekerjaan yang diterima: (1) syarat go-live di [[RENCANA_ADOPSI]], (2) perbaikan bug dari pilot, (3) hal yang diminta process owner. Permintaan lain dicatat sebagai tugas di rilis v1.1 atau v1.2 dan tidak dikerjakan lebih dulu. T-167 adalah satu-satunya penarikan maju dari v1.1.

**Tiga langkah berikutnya, berurutan:**
1. Sesi walkthrough dengan process owner (T-030, T-031): tentukan alur pilot dan kriteria terima. Agenda siap di [[DISCOVERY_AGENDA]].
2. Konfirmasi sumber data dan user awal (T-032, T-036): workbook mana yang resmi, siapa saja yang masuk pilot dan modul apa untuk tiap orang.
3. Sambil menunggu: tutup sisa teknis kecil (T-044, T-047, backup T-061) dan bersihkan data uji production.

### 2026-11-03 — Kesiapan pilot (T-170)

Menjawab penilaian kesiapan: data uji dibersihkan, cadangan dan pemulihan (unduh JSON, peringatan dashboard, skrip pulih, runbook), impor CSV master dan stok awal (templat, pratinjau, tanpa menimpa), akun saya dan ganti password, dashboard baru. Sisa tugas pemilik: SMTP kustom, admin kedua, jadwal cadangan dan latihan pulih, keputusan repo. Sisa yang butuh tim: walkthrough, sumber data resmi, peserta pilot. Lihat [[RENCANA_ADOPSI]] bagian status gerbang.

### 2026-11-04 — Stok barang jadi diimpor ke production (T-175)

Stok awal 92 item barang jadi (1.382 batang) dari file Stock Barang 2026 dimasukkan ke tabel `fg` di Supabase production, hanya data. Sumber: sheet Straight; sheet transaksi tidak diimpor agar tidak terhitung dua kali. Cut-off 2026-10-17 (asumsi, menunggu konfirmasi pemilik). Cocok dengan file per kategori. Bukti: `verified in database`. Detail di [[T-175-impor-stok-barang-jadi-oktober-2026]].

### 2026-11-04 — Filter Type di Gudang Barang Jadi tayang (T-176)

Dropdown Type (STU, STC, SLU, SLW, SLHD, lainnya, Tanpa type) mengikuti kategori. PR 14 digabung ke `main` oleh pemilik; production memuat kode filter. Regresi 150 lulus di mock. Detail di [[T-176-filter-type-gudang-barang-jadi]].

### 2026-11-04 — Skema produksi tiga pintu (T-177, lokal)

Hasil tinjauan pemilik: tampilan produksi membingungkan karena terlalu banyak menu dan tempat input. Pembanding: Operations Kanban Antlia. Skema baru: **SPK Berjalan**, **Produksi Hari Ini** (satu-satunya input produksi), dan **Kinerja & Analisa**. Kebutuhan lengkap di [[PRD_PRODUKSI]]; rancangan di [[RUTE_PRODUKSI]] bagian 17 dan 18. Uji e2e mock lulus (produksi 68, regresi 42, role 12, akses 34, tampilan 71). Belum ditayangkan; migration 14 tetap draf. Langkah berikut: tinjauan pemilik, lalu Tahap 2 ([[T-178-kinerja-dan-analisa-produksi-tahap-2]]).

### 2026-11-04 — Kinerja & Analisa lengkap (T-178, lokal)

Tahap 2 selesai di lokal: empat tab analisa baru di Kinerja & Analisa (Work Center, Produk, Vendor, Pengiriman) di samping Laporan harian. Pemeriksaan data: antrian Bongkar Muat sudah menyimpan jam masuk, mulai, dan selesai, sehingga loading dan unloading dianalisa tanpa input baru. Bukti: uji unit analisa 21 lulus; e2e produksi 74, regresi 42, role 12, akses 34, tampilan 71 (mock, bukan bukti Supabase). Kebutuhan dipetakan di [[PRD_PRODUKSI]] bagian 10; hitungan di [[RUTE_PRODUKSI]] bagian 19. Belum ditayangkan; migration 14 tetap draf. Langkah berikut: tinjauan pemilik, konfirmasi aturan rute Jointing dan Clamp serta kapasitas per mesin.

### 2026-11-04 — Produksi Hari Ini v2 dan Laporan Produksi (T-179, lokal)

Tinjauan pemilik: layout kaku, input masih merepotkan, catatan terakhir tanpa nama PT, laporan kurang analitis. Hasil: tata letak dua kolom dan kartu rapi; tanggal dan jam otomatis; Selesai satu ketukan; catatan terakhir dengan customer; Laporan Produksi baru (jumlah, tonase, kecepatan; periode hari sampai tahun; tren; produk bertingkat Cable Tray, Cable Ladder, Cable Duct, Aksesoris dan type STU, STC, SLU, SLW, SLHD serta material); akumulasi KPI operator dan mesin. Bukti: uji unit statistik 34 (total unit 125); e2e produksi 92, regresi 42, role 12, akses 34, tampilan 71 (mock, bukan bukti Supabase). Kebutuhan di [[PRD_PRODUKSI]] bagian 11; rancangan di [[RUTE_PRODUKSI]] bagian 20. Draf migration 14 ditambah kolom klasifikasi produk; belum diterapkan. Belum ditayangkan.

### 2026-11-04 — Jadwal SPK (Gantt) (T-180, lokal)

Permintaan pemilik: papan jadwal seperti timeline proyek untuk SPK berjalan, dengan input tetap mudah. Hasil: tab Jadwal di SPK Berjalan dengan batang rencana, produksi, vendor, pengiriman, due date, perkiraan selesai, dan garis hari ini; status Telat dan Berisiko telat; jadwal tiap item; skala minggu dan bulan; nyaman di HP. Tanpa input baru dan tanpa perubahan skema. Bukti: unit jadwal 17 (total unit 142); e2e produksi 100, regresi 42, role 12, akses 34, tampilan 71 (mock, bukan bukti Supabase). Kebutuhan di [[PRD_PRODUKSI]] bagian 12; rancangan di [[RUTE_PRODUKSI]] bagian 21. Belum ditayangkan.

### 2026-11-05 — Uji alur lengkap SPK dengan tangkapan layar (T-181, lokal)

Permintaan pemilik: uji dari SPK sampai akhir, ambil tangkapan layar, dan dokumentasikan. Hasil: skrip `alur-spk.mjs` menjalankan satu SPK dari terbit, Shearing, Punching, Bending, kirim dan terima kembali vendor, surat jalan customer, sampai Diterima, dengan 27 tangkapan layar. 15 PASS, 0 FAIL. Bukti: `verified in browser` (mock), bukan bukti Supabase. Temuan: Jadwal berfilter awal Berjalan sehingga SPK selesai tidak tampil sampai filter Selesai dipilih; seluruh alur satu hari sehingga batang pendek. Dokumen: [[UJI_ALUR_SPK]]; tugas [[T-181-uji-alur-spk-awal-sampai-akhir]].

### 2026-11-05 — Papan jadwal v2 dan perapian layout (T-182, lokal)

Masukan pemilik: jadwal kaku, layout Berjalan, KPI & Analisa, dan Target waktu proses kurang nyaman. Hasil: Jadwal menjadi schedule board dengan tampilan Per SPK (langkah mesin berwarna per work center) dan Per mesin (balok pekerjaan per mesin); kartu SPK Berjalan, KPI & Analisa, dan dialog Target dirapikan. Bukti: unit semua PASS (jadwal 21); e2e regresi 42, role 12, akses 34, produksi 106, tampilan 71, alur lengkap 15, semuanya 0 FAIL (mock, bukan bukti Supabase). Tangkapan layar di `documentation/screenshots/layout-v2/`. Tugas [[T-182-papan-jadwal-v2-dan-rapikan-layout-spk]]; kebutuhan [[PRD_PRODUKSI]] bagian 13.

### 2026-11-05 — Produksi Hari Ini: papan mesin dan kapasitas aktual (T-183, lokal)

Masukan pemilik: layar kaku; tujuan mengetahui kapasitas aktual mesin realtime sebagai dasar KPI per work center atau mesin. Hasil: kartu per mesin, panel Kapasitas aktual (output, laju pcs/jam, pemakaian mesin, proyeksi), grafik per jam dan tren 7 hari, kartu antrian lebih lapang; input tidak berubah. Bukti: unit kapasitas 10; e2e regresi 42, role 12, akses 34, produksi 111, tampilan 71 (0 FAIL; mock, bukan bukti Supabase). Keputusan terbuka: jam kerja standar dan target KPI per mesin. Tugas [[T-183-produksi-hari-ini-papan-mesin-dan-kapasitas-aktual]]; kebutuhan [[PRD_PRODUKSI]] bagian 14.

### 2026-11-06 — Modul Penawaran lokal (T-190, lokal)

Hasil: menu Penawaran dengan hak modul sendiri dan peran Sales; lembar penawaran dengan varian A sampai H, harga dan berat dari mesin T-189, diskon dan PPN, batas diskon per peran dengan status Menunggu persetujuan, nomor format lama dengan kunci atomik, revisi bernomor dengan riwayat, cetak untuk customer tanpa berat dan biaya. Tabel penawaran hanya berupa draf migration 15 (belum diterapkan). Bukti: verified in browser (mock); unit 18 PASS, e2e penawaran 27 PASS, regresi penuh 0 FAIL, alur-spk 15 PASS. Perbaikan: tanggal data contoh dan uji produksi memakai waktu lokal. Menunggu pemilik: nilai batas diskon, penyetuju, kode nomor, tinjauan tampilan. Langkah berikut: T-191 (muat dari penawaran ke SPK).

### 2026-11-06 — Muat dari penawaran ke SPK dan snapshot PO (T-191, lokal)

Hasil: penawaran Disetujui dapat dimuat ke SPK Draft (editor SPK terisi customer, PO, item per judul produk, jumlah, dan berat real per pcs) tanpa membawa harga; harga, berat, dan biaya saat PO dibekukan sebagai snapshot di penawaran dan tidak berubah oleh perubahan skenario. Tautan dua arah, idempoten, dan revisi penawaran yang disetujui lagi menawarkan Perbarui SPK (jumlah produksi dipertahankan). Bukti: verified in browser (mock); unit 25 PASS, e2e penawaran 35 PASS, alur hulu ke hilir 6 PASS dengan tangkapan layar, regresi penuh 0 FAIL. Ditemukan dan diperbaiki: judul section SPK harus mengikuti konvensi rute (CABLE LADDER TYPE SLU dan seterusnya), kalau tidak antrian mesin kosong. Menunggu pemilik: konfirmasi pemetaan keluarga ke produk dengan katalog asli. Langkah berikut: T-192 (kebutuhan material dan reservasi).

### 2026-11-06 — Sales Order sebagai penghubung Penawaran dan SPK (T-194, lokal)

Usul pemilik: input cukup di penawaran, lalu SO, lalu SPK menarik otomatis tanpa mengetik ulang. Hasil: menu Sales Order (hak modul penawaran); tombol Buat Sales Order di penawaran Disetujui; SO menyimpan PO, tanggal PO, due date, alamat, item yang bisa disesuaikan dengan PO, tebal dan finishing, serta snapshot harga dan biaya saat PO; konfirmasi SO membuat SPK Draft otomatis dengan judul section sesuai konvensi rute, lalu PPIC memeriksa dan menerbitkan; amandemen SO bernomor Rev memuat perubahan ke SPK yang sama. Bukti: verified in browser (mock); unit 10 + 25 PASS, e2e penawaran 37 PASS, alur hulu ke hilir 7 PASS dengan tangkapan layar, regresi penuh 0 FAIL. Draf migration 16 belum diterapkan. Menunggu pemilik: pemetaan keluarga ke produk dengan katalog asli. Langkah berikut: T-192 (kebutuhan material dan reservasi dari SO atau SPK).

### 2026-11-06 — Kebutuhan material dan reservasi (T-192, lokal)

Hasil: panel Kebutuhan material di Sales Order dan lembar SPK (netto, bruto dengan faktor sisa potong 1,1, lembar, stok fisik, reservasi SPK Terbit lain, tersedia, status Cukup, Kurang, Sudah dipesan, Tanpa item RM); tombol Buat PR untuk kekurangan; PR terbuka menutup kekurangan sehingga tidak ada PR ganda; faktor sisa potong dapat diatur. Pratinjau tidak mengubah stok; pengeluaran gudang dengan nomor SPK mengurangi reservasi. Bukti: verified in browser (mock); unit 12 PASS, e2e penawaran 42 PASS, regresi penuh 0 FAIL. Menunggu pemilik: stok berkurang otomatis saat SPK terbit atau tetap saat Pakai, faktor sisa potong sebenarnya, pencatatan sisa potongan, dan pencocokan dengan SPK nyata. Langkah berikut: T-193 (monitoring estimasi lawan aktual).

### 2026-11-06 — Pindah akun Claude dan validasi koneksi (read-only, tanpa perubahan production)

Konteks: pengembangan dilanjutkan dengan akun Claude lain; serah terima di [[HANDOFF]]. Aturan sesi: perubahan hanya di lokal; GitHub, Supabase production, dan Vercel yang tayang tidak diubah tanpa instruksi pemilik; deploy menunggu persetujuan setelah pemilik menilai hasil lokal.

Hasil validasi (semua baca-saja):
- GitHub: remote `mitranusainternational-cloud/mni-gudang`, `gh` aktif di akun itu. Cabang `fitur/produksi-multi-wc` sudah ada di GitHub (sama dengan lokal, 41 commit di depan `development`); `main` di `43e8da2` (PR 14), CI Vault dan Aplikasi sukses, status Vercel sukses.
- Supabase production (`lggqigmvtefkquqjrjsb`): 13 migration terpasang, sama dengan `apps/platform/supabase/migrations` 1–13; 22 tabel public ber-RLS. Migration 14, 15, 16 belum diterapkan (sesuai rencana). Bukti: verified in database (metadata).
- App live `mni-gudang.vercel.app`: login pemilik berhasil dan seluruh permintaan data menuju project production di atas. Bukti: verified in browser.
- Vercel: tim `mitranusainternational-8337`, project `mni-gudang`; variabel `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` hanya berlabel Production (belum Preview). Keputusan soal Preview ditunda sampai tahap deploy.
- Konektor Supabase `plugin_supabase` masih mengarah ke akun lama (dev, dipensiunkan): jangan dipakai untuk production. Konektor Vercel bawaan Claude tidak punya tim: tidak dipakai.
- Composio: tidak konklusif dari sesi ini (konektor membuat koneksi baru tiap panggilan); menunggu tangkapan layar Connected accounts dari pemilik.
- Pratinjau lokal mock (`localhost:5173`, admin@mni.local) dibuka dan berjalan; menu Penawaran dan Sales Order tampil, belum ada di versi live.

Menunggu pemilik: tangkapan layar Composio; keputusan variabel Preview Vercel; tujuh keputusan terbuka di [[HANDOFF]] bagian 5. Langkah berikut: T-193 (monitoring estimasi lawan aktual), tetap lokal.

### 2026-11-06 — Koreksi data production atas permintaan pemilik (satu baris)

Permintaan pemilik: salah input pada riwayat mutasi bahan baku. Satu baris `mutasi` di Supabase Production (SPK 639, keluar 4 lembar Plat SPHC 1.5 x 1200 x 3000, dok `PK/2026/11/004`, Shearing) diubah hanya pada kolom `ket` (keterangan lengkap: PO PT. Enindo, kegunaan plat Tray STU W 600 H 100 = 4 btg dan Jointing tray h100 = 16 pcs, pemakaian 4 lbr) dan `tgl` (06-11-2026 menjadi 04-11-2026). Jumlah (`delta` -4), dokumen, SPK, pihak, dan semua baris lain tidak diubah. Bukti: verified in database (UPDATE terbatas dengan id dan keterangan lama sebagai syarat, 1 baris). Tidak ada deploy, push, atau perubahan skema; kode aplikasi tidak disentuh.

### 2026-11-06 — Pencatatan pemakaian bahan baku SPK 640 dan 641 di production (atas permintaan pemilik)

Permintaan pemilik: dua SPK sudah selesai tetapi pemakaian bahan bakunya belum dilaporkan. Dua baris `mutasi` keluar ditambahkan di Supabase Production, meniru alur "Pakai produksi" aplikasi (satu dokumen PK per transaksi, counter `PK-202611` dinaikkan dari 5 ke 7):
- `PK/2026/11/006`, SPK 640 (PT Mandiri Plastindo): Plat SPHC 1.5 x 1200 x 3000, keluar 7 lembar (stok 66 menjadi 59), keterangan memuat potong side rail ladder H 100 dan rung ladder W 200 SLW serta plat sisa.
- `PK/2026/11/007`, SPK 641 (PT Waruna Shipyard Indonesia): Plate Strip 5.0 x 38 x 6000, keluar 6 batang (stok 6 menjadi 0).
Tanggal dicatat 04-11-2026 (tanggal SPK; tanggal pemakaian sebenarnya tidak disebut pemilik). Tujuan "Shearing" untuk SPK 640, kosong untuk SPK 641. Tidak ada baris lain, skema, atau kode yang diubah; tidak ada deploy. Bukti: verified in database (INSERT 2 baris dalam satu pernyataan, stok dihitung ulang dari `stok_awal` + mutasi).

## 2026-11-06 · Gudang Bahan Baku: massa jenis dapat diatur dan dokumen pengeluaran (lokal)

Permintaan pemilik, hanya di lokal (`fitur/produksi-multi-wc`), tidak ada deploy dan production tidak disentuh.

- Asal kg per lembar dijelaskan di tab Posisi stok: tebal × lebar × panjang (mm) ÷ 1.000.000 × massa jenis. Massa jenis bisa diubah di Pengaturan bahan baku (SPHC, SPCC, SS304, SS316, aluminium), disimpan di `master/setting.dens`; kosong memakai standar (baja 7,85).
- Riwayat mutasi: baris Keluar yang punya nomor dokumen kini punya tombol PDF (cetak/simpan PDF) dan Excel, yaitu Bukti Pengeluaran Bahan Baku per nomor PK (SPK, customer, tujuan, item, qty, kg, keterangan, tanda tangan).
- Bukti: `verified in browser` (mock): tombol muncul, isi PDF benar, Excel terunduh, massa jenis tersimpan dan tampil. Belum diuji di Supabase.

## 2026-11-06 · Gudang Bahan Baku: jenis material fleksibel (lokal)

Agar pemakaian di lapangan tidak kaku. Hanya lokal, tanpa migration (disimpan di `master/setting.mats`), production tidak disentuh.

- Pengaturan bahan baku: bagian "Jenis material lain" (nama jenis, kata kunci dipisah koma, massa jenis). Item yang namanya memuat kata kunci otomatis memakai massa jenis itu, tampil sebagai kelompok sendiri di Posisi stok/Analisa/Kartu Stok, dan muncul di filter material. Kata kunci buatan pengguna menang atas pengenalan bawaan.
- Cek Data: peringatan info bila ada item bahan baku berjenis "Lainnya" (berat dihitung seperti baja 7,85) dengan tombol ke Pengaturan.
- Bukti: `verified in browser` (mock): item tembaga 31,4 kg/lbr (baja) berubah ke 35,8 setelah jenis didaftarkan, kelompok dan filter muncul, peringatan Cek Data tampil, 0 galat konsol. Regresi penuh belum dijalankan. Berat manual per item belum dibuat (perlu kolom baru, menunggu keputusan).

Penyempurnaan (2026-11-06, lokal): jenis material kini dipilih saat **Item baru** (bukan hanya di Pengaturan). Form punya pilihan "Jenis material" (SPHC, SPCC, SS304, SS316, Aluminium, jenis buatan sendiri, atau "＋ Jenis material baru…" dengan nama dan massa jenis), pratinjau nama item dan berat per lembar langsung saat mengetik, dan jenis baru otomatis terdaftar di `master/setting.mats`. Bila nama item belum memuat kata kunci jenis, kata kunci ditambahkan ke nama agar pengenalan tetap konsisten tanpa kolom database baru. Pengaturan tetap dipakai untuk mengubah atau menghapus jenis. Bukti: `verified in browser` (mock), 0 galat konsol.

## 2026-11-06 · Master Data › Bahan baku (lokal)

Atas permintaan pemilik: pengaturan material dipusatkan di Master Data. Hanya lokal, tanpa migration, tanpa deploy.

- Tab baru **Bahan baku** di Master Data: (1) tabel Jenis material dan massa jenis (5 jenis bawaan bisa diubah massa jenisnya, jenis buatan sendiri bisa ditambah, diubah, dihapus bila tidak dipakai; kolom sumber, kata kunci, jumlah item), (2) tabel Item bahan baku (jenis, kg/lbr, satuan, min, buffer, lokasi, tombol Ubah dan Item baru). Item yang jenisnya belum dikenali ditandai.
- Pengaturan bahan baku kini hanya lead time, target stok, dan faktor sisa potong, dengan tautan ke Master Data › Bahan baku; Item baru tetap bisa membuat jenis baru langsung.
- Bukti: `verified in browser` (mock): ubah massa jenis, tambah jenis, hapus jenis tak terpakai, penolakan hapus jenis terpakai, 0 galat konsol. Regresi penuh belum dijalankan.

Penyempurnaan Master Data › Bahan baku (2026-11-06, lokal): semua jenis material kini punya tombol **Hapus**, termasuk jenis bawaan (disimpan sebagai `master/setting.jenisOff`, bisa **Pulihkan**); jenis yang masih dipakai item boleh dihapus setelah konfirmasi (itemnya menjadi "Belum dikenali"). Tabel Item bahan baku punya tombol **Hapus**: item tanpa riwayat mutasi dan tanpa PR dapat dihapus setelah konfirmasi, item yang punya riwayat ditolak dengan penjelasan agar riwayat stok tetap utuh. Bukti: `verified in browser` (mock), 0 galat konsol. Regresi penuh belum dijalankan; belum diuji di Supabase (penghapusan item memakai `delDoc`, perlu dicek terhadap RLS sebelum deploy).

## 2026-11-06 · Gudang Bahan Baku: perapian pemakaian lapangan (lokal)

Fokus hanya Gudang Bahan Baku; tanpa migration, tanpa deploy.

- Riwayat mutasi: filter **Semua SPK / Tanpa SPK / SPK tertentu** (membaca SPK dari tautan atau dari teks referensi, sehingga pencatatan lama ikut), chip SPK di kolom Dokumen, dan **keterangan multi-baris** tampil per baris (sebelumnya menyatu).
- Form Pakai produksi dan Terima material: **total lembar dan kg langsung** terhitung saat mengetik.
- Hasil cek read-only production (2026-11-06): izin hapus pada `rm` dan `rmhist` belum ada, jadi tombol Hapus item di Master Data akan ditolak database sampai ada migration kecil; jenis material dan massa jenis tidak butuh perubahan skema. Branch lokal juga mengandung migration 14–16 yang belum terpasang, jadi rilis disarankan sebagai paket kecil dari `main`.
- Bukti: `verified in browser` (mock), 0 galat konsol. Regresi penuh belum dijalankan.

## 2026-11-06 · Gudang Bahan Baku: dokumen untuk semua jenis mutasi (lokal)

Permintaan pemilik: setiap mutasi punya dokumen. Hanya lokal, tanpa migration, tanpa deploy.

- Di Riwayat mutasi, **setiap baris** (Masuk, Keluar, Opname, Koreksi) punya tombol **PDF** (cetak/simpan PDF) dan **Excel**. Satu nomor dokumen = satu dokumen berisi semua barisnya.
- Empat bentuk dokumen: **Bukti Penerimaan** (supplier, PO/SJ, qty, kg), **Bukti Pengeluaran** (SPK, customer, tujuan), **Berita Acara Stock Opname** (stok sistem, stok fisik, selisih lbr dan kg, kolom tanda tangan dihitung/diperiksa/disetujui), **Bukti Koreksi** (dokumen yang dikoreksi, qty dan kg pembalik, alasan).
- Mutasi tanpa nomor dokumen (mis. opname satu item) tetap bisa dicetak dengan kode sementara `MUT-xxxxxxxx`.
- Bukti: `verified in browser` (mock) untuk keempat jenis, Excel terunduh, 0 galat konsol. Regresi penuh belum dijalankan.

## 2026-11-06 · Surat Jalan ke customer: alamat dan dokumen baru (branch terpisah dari versi live)

Permintaan pemilik: kerjakan untuk versi yang sudah tayang, lokal dulu, tayangkan hanya setelah disetujui. Dikerjakan di worktree `../mni-gudang-sj`, branch lokal `fitur/surat-jalan` dari `origin/main` (43e8da2), terpisah dari `fitur/produksi-multi-wc`. Belum di-commit, belum di-push, tidak ada deploy, production tidak disentuh.

- **Alamat pengiriman:** isian baru di form Buat surat jalan (otomatis dari Master Data customer bila sudah ada, bisa diubah per surat jalan; kotak untuk menyimpan juga sebagai alamat customer) dan tombol **Ubah alamat** di laci surat jalan. Disimpan di bidang tambahan surat jalan (`kirim.data.alamat`), tanpa migration. Mengubah alamat tidak mengubah status pengiriman.
- **Status tidak lagi ikut di dokumen** PDF dan Excel.
- **Tampilan dokumen baru:** kop dengan logo dan alamat perusahaan, judul besar, kotak No. SJ dan tanggal, kotak Kepada (alamat multi-baris) dan Detail pengiriman (PO, SPK, kendaraan, no polisi, driver), tabel bergaris dengan header biru dan baris selang-seling, total, catatan, banner bila dibatalkan, pernyataan penerimaan, tiga kotak tanda tangan (Hormat kami, Pengemudi, Diterima oleh plus tanggal terima), footer halaman. Excel mengikuti tata letak yang sama dan siap cetak A4.
- Bukti: `verified in browser` (mock, port 5176): form, simpan alamat ke SJ dan master customer, preview, PDF dirender dan diperiksa visual, Excel dibaca ulang, status tetap Disiapkan. Tes unit lulus; regresi e2e penuh belum dijalankan.

Lanjutan Surat Jalan (2026-11-06, branch lokal `fitur/surat-jalan`, belum di-commit, tidak ada deploy):

- **Rincian pengiriman partial:** tabel otomatis muncul di preview, PDF, dan Excel hanya bila barang pada surat jalan itu dikirim bertahap (ada pengiriman sebelumnya atau jumlah belum memenuhi order SPK). Kolom Partial 1, Partial 2, dan seterusnya (maksimal 4 kolom, partial awal digabung bila lebih), Total terkirim, Sisa; kolom surat jalan ini diberi warna. Dihitung per barang sampai dengan surat jalan itu. Bila langsung penuh, tabel tidak tampil. Surat jalan batal tidak dihitung.
- **Penomoran surat jalan:** format default `{tahun 2 digit}/{bulan romawi}/MNI/{nomor urut}`, mis. `26/XI/MNI/1799`. Dikosongkan = otomatis melanjutkan nomor urut terbesar yang sudah ada (1799 jadi 1800, nol di depan dipertahankan, SJ batal ikut dihitung agar tidak dipakai ulang), tahun dan bulan mengikuti tanggal surat jalan. Nomor tetap bisa diketik manual. Asumsi: 26 = tahun, XI = bulan, 1799 = nomor urut; perlu dikonfirmasi pemilik. Awalan "# " pada nomor lama tidak ikut dibawa.
- Bukti: `verified in browser` (mock port 5176): tabel partial dua tahap (3 lalu 1 dari 10, sisa 6) pada preview, PDF (dirender), dan Excel; barang yang langsung penuh tidak muncul; nomor otomatis 1 menjadi 1800 setelah 1799. Regresi e2e penuh belum dijalankan.

Konfirmasi pemilik (2026-11-06): pada nomor surat jalan `26/XI/MNI/1799`, **26 = tahun**, XI = bulan romawi, 1799 = nomor urut. Asumsi penomoran otomatis di atas benar dan tidak perlu diubah.

## 2026-11-06 · Rilis ke live: fitur Surat Jalan (PR 15)

Atas perintah eksplisit pemilik ("Ya, gabungkan"). PR 15 `fitur/surat-jalan` digabung ke `main` oleh akun pemilik (merge commit `ad73c89`, 08:12 UTC) dengan melewati syarat 1 approval seperti PR 14; pemeriksaan wajib lulus semua sebelum digabung (Vault, Aplikasi build dan regresi mock, Vercel). Tes e2e lokal sebelum rilis: 34 lulus, 0 gagal.

- **Vercel:** deploy production selesai (status Success); situs https://mni-gudang.vercel.app melayani `app.js` baru (memuat `sjMniNext`, `sjPartial`, `simpanAlamatCustomer`, judul tabel partial).
- **Supabase production:** tidak ada migration atau perubahan skema; migration tetap 13. Jumlah baris dan `max(updated_at)` kirim, spk, mutasi, rm, master, mcustomer, vendor, fg sama persis dengan potret sebelum rilis (`verified in database`, baca-saja).
- **Isi rilis:** alamat pengiriman (+ Ubah alamat), PDF dan Excel baru tanpa status, tabel partial otomatis, nomor surat jalan otomatis format `26/XI/MNI/1800`.
- Catatan: pengujian fitur di live belum dilakukan dengan membuat data (agar tidak menambah data); pemakaian pertama oleh tim adalah uji lapangan. Kembali ke versi sebelumnya bisa lewat Vercel rollback ke deploy `43e8da2`, tanpa efek ke data.
- Worktree `../mni-gudang-sj` dan branch lokal `fitur/surat-jalan` masih ada untuk perbaikan lanjutan.

## 2026-11-06 · Gudang Bahan Baku: Posisi stok dan Stock opname dipoles (lokal)

Hanya lokal, tanpa migration, tanpa deploy.

- **Posisi stok:** barang yang jenisnya belum dikenali kini punya grup sendiri "Belum dikenali" dengan peringatan (sebelumnya tersembunyi di grup Baja sehingga total ton menyesatkan); label jenis (SPHC, SS304, dst.) di samping nama item; tombol cepat **Pakai**, **Terima**, **Ubah** di tiap baris (klik baris tetap membuka detail item); catatan kaki memberi tahu massa jenis kini diatur di Master Data › Bahan baku.
- **Stock opname:** **Lembar hitung kosong** (PDF dan Excel) berisi semua item terurut per jenis dengan kolom Stok sistem, Hitung fisik, Selisih, Catatan, dan tanda tangan, untuk dibawa petugas menghitung; **PDF/Excel berita acara** tiap sesi di Riwayat opname (sesi tanpa selisih diberi keterangan karena tidak menghasilkan mutasi).
- Bukti: `verified in browser` (mock): grup dan tombol baris, Pakai membuka form dengan item terpilih, lembar hitung PDF dan Excel, sesi opname dengan tombol dokumen, 0 galat konsol. Tes e2e penuh dijalankan terpisah.

Regresi penuh lokal (2026-11-06, setelah poles Posisi stok dan Stock opname): regresi 42, role 12, akses 34, produksi 134, tampilan 72, **total 294 PASS, 0 FAIL**; rangkaian Penawaran dilewati karena modul Penjualan disembunyikan. Runner `tests/e2e/run.mjs` diperbaiki: melewati Penawaran otomatis bila `MODUL_PENJUALAN=false`, satu rangkaian yang galat tidak menghentikan yang lain, dan `ONLY=nama,nama` memilih rangkaian tertentu. Belum di-commit.

## 2026-11-06 · Master Data › Bahan baku: nama jenis bisa diganti dan mengikuti semua modul (lokal)

Permintaan pemilik. Hanya lokal, tanpa migration, tanpa deploy.

- **Ubah jenis** kini mengizinkan mengganti **nama**, kata kunci, dan massa jenis untuk semua jenis, termasuk jenis bawaan. Jenis bawaan yang diganti nama disimpan sebagai jenis buatan dengan penanda `dasar` (jenis asal), sehingga perhitungan kebutuhan SPK (SPHC/SPCC, SS, Aluminium) tetap cocok; jenis asalnya disembunyikan. Mengganti kembali ke nama asal mengembalikan jenis bawaan.
- Karena jenis diturunkan dari kata kunci pada nama item, nama baru otomatis tampil di Posisi stok (judul grup dan label), filter material, Analisa, Kartu Stok, Rencana pembelian, Stock opname, Riwayat mutasi, dan dokumen, tanpa mengubah nama item. Form menampilkan jumlah item yang terdampak dan notifikasi simpan menyebutnya.
- Ganti nama customer, vendor, supplier di Master Data sudah memakai mekanisme `renameEverywhere` (SPK, surat jalan, mutasi, bongkar muat ikut berubah); diuji ulang di mock, SPK ikut mengikuti. Item bahan baku direferensikan lewat id sehingga perubahan item di Master Data langsung tampil di semua modul.
- Bukti: `verified in browser` (mock): ganti nama Aluminium menjadi Alumunium (grup, label, filter, Analisa, tabel item, berat tetap 10,8), hapus lalu pulihkan jenis bawaan, 0 galat konsol. Regresi dijalankan terpisah.

## 2026-11-06 · Audit mandiri dan perbaikan pemakaian di HP (lokal)

Pemilik menyerahkan penilaian "apa yang kurang". Hasil audit (baca-saja untuk production, pengujian di Playwright untuk aplikasi), semuanya lokal tanpa migration dan tanpa deploy.

**Temuan nyata (bukti `verified in browser`, layar 390 px)**
1. Tabel Posisi stok selebar 1.237 px: kolom **Stok** terpotong di luar layar HP, harus digeser ke samping.
2. Form Terima, Pakai, dan Barang masuk/keluar: kolom **Qty terpotong** di HP.
3. Form **Buat surat jalan** dan **Kirim ke vendor**: kolom **Qty kirim terpotong** (tabel 454 px di dalam 303 px).
4. Stock opname: kolom Hitung fisik berada di luar layar.
5. Tombol kecil (di bawah 32 px) sulit ditekan jari.

**Perbaikan (CSS dan label, tanpa mengubah logika)**
- Posisi stok di HP menjadi kartu per item: stok (lbr) besar, kg, status, tombol Pakai/Terima/Ubah.
- Baris item di form Terima/Pakai bertumpuk (material, lalu Qty dan stok, tombol hapus), placeholder "Qty".
- Item di form surat jalan dan kirim vendor menjadi kartu berlabel (Order, Terkirim, Sisa, Qty kirim) tanpa terpotong.
- Stock opname di HP: Stok sistem dan kolom hitung fisik berdampingan per item.
- Tombol dan isian minimal 36–40 px di layar sempit. Tampilan desktop tidak berubah.
- Audit otomatis 11 form utama di 6 modul pada 390 px: 0 isian terpotong setelah perbaikan.

**Pemeriksaan production (baca-saja):** penasihat keamanan Supabase hanya melaporkan 8 peringatan fungsi bantu RLS yang disengaja dan proteksi password bocor yang belum aktif (aksi pemilik). Tidak ada celah baru.

**Rekomendasi yang belum dikerjakan:** (a) paket library PDF/Excel dilayani dari aplikasi, bukan CDN, agar unduhan tidak gagal bila CDN terblokir; (b) status nonaktif untuk item bahan baku berriwayat; (c) aturan database untuk mencegah stok negatif dan penimpaan bersamaan (risiko 9 audit lama); (d) backup terjadwal, Dependabot, dan proteksi password bocor (aksi pemilik).

## 2026-11-06 · Tiga penyesuaian dari audit mandiri (lokal)

Atas perintah pemilik ("Kerjakan semua"). Hanya lokal, tanpa migration terpasang, tanpa deploy.

1. **Pustaka PDF dan Excel dari aplikasi sendiri:** ExcelJS 4.4.0, jsPDF 2.5.1, jsPDF-AutoTable 3.8.2, html2canvas 1.4.1 disimpan di `apps/platform/public/vendor/` (diunduh dari cdnjs dan jsDelivr, identik byte demi byte; versi, lisensi, dan hash di `public/vendor/README.md`). Pemuat mencoba `/vendor/` dulu, CDN sebagai cadangan. CSP production hanya mengizinkan cdnjs, jadi cadangan jsDelivr sebelumnya tidak berguna. Bukti: unduhan Excel memakai `/vendor/exceljs.min.js`; pustaka PDF dan html2canvas termuat lokal; 0 galat konsol.
2. **Status nonaktif untuk item bahan baku** (disimpan di kolom data tambahan `rm.data.aktif`, tanpa migration). Master Data › Bahan baku: tombol **Nonaktifkan** dan **Aktifkan**. Item nonaktif tidak muncul di Posisi stok, pilihan form, Stock opname, usulan pembelian, Analisa, dashboard, dan ekspor CSV; riwayat mutasi dan Kartu Stok tetap lengkap dengan penanda "nonaktif"; chip "Nonaktif · N" di Posisi stok menampilkannya dan tombol Aktifkan. Bukti: `verified in browser` (mock): nonaktif, tersembunyi di daftar, pilihan form, dan opname, riwayat tetap ada, aktifkan kembali.
   - **Koreksi:** tombol **Hapus item** di Master Data dihapus. Migration 13 (terpasang di production) sengaja mencabut izin hapus pada data transaksi termasuk bahan baku, jadi hapus akan ditolak database; nonaktif adalah cara yang benar. Pernyataan sebelumnya bahwa izin hapus "belum ada dan perlu migration" keliru sebagai kekurangan: itu desain.
3. **Draf migration 17 anti stok negatif** (`supabase/draft/20240101000017_stok_tidak_negatif.sql`): pemicu BEFORE pada `mutasi` yang memeriksa ulang stok di database, diserialkan per item dengan kunci advisory. Pengecekan production (baca-saja): tidak ada mutasi tanpa item_id, tidak ada gudang selain rm dan fg, tidak ada stok negatif saat ini. **Belum dijalankan di database mana pun dan belum diuji**; berkas memuat 5 langkah uji dan rollback. Ditambahkan ke daftar tindakan yang menunggu persetujuan di HANDOFF.

## 2026-11-06 · Gudang Sparepart (modul baru, lokal)

Atas permintaan pemilik: tambahkan gudang sparepart sesuai file "Tabel Stock Sparepart november 2026.xlsx", dulu di lokal. Tidak ada deploy, tidak ada perubahan pada production.

**Isi file sumber:** lembar *Stok Barang* (49 jenis: oli, spring dies, V-belt, nozzle, kontaktip, mata gerinda, baut, mur, dan lain-lain; kolom No, Nama, Satuan, Stok Awal, Barang Masuk, Barang Keluar, Stok Akhir, Stok Minimum, Status), lembar *BARANG KELUAR* (13 pengeluaran 2–5 November dengan tujuan), lembar *Ringkasan* (702 stok akhir, 5 barang stok minimum).

**Rancangan:** item di koleksi baru `sp`; pergerakan stok memakai `mutasi` dengan `gudang='sp'` (tidak ada CHECK atau FK yang menghalangi, diperiksa di production). Stok = stok awal + delta, sama seperti gudang lain. Hak akses modul baru `sparepart` (peran gbb mengubah, viewer melihat, per pengguna lewat Pengguna & Akses).

**Fitur:** menu Gudang Sparepart; KPI (jenis, stok minimum, habis, keluar 30 hari); Posisi stok (No, nama, satuan, stok awal, masuk, keluar, stok akhir, minimum, status Aman/Stok minimum/Habis; tombol Keluar, Terima, Ubah; kartu stok per item); Terima dan Keluarkan sparepart (nomor SP-M dan SP-K, penolakan stok kurang, tujuan/penerima); Stock opname (SP-OPN) berdokumen; Riwayat mutasi dengan PDF/Excel (bukti penerimaan, pengeluaran, berita acara opname, koreksi); Item baru/ubah/nonaktif (tanpa hapus permanen); CSV; **Impor Excel** (membaca lembar Stok Barang dan BARANG KELUAR, pratinjau, membandingkan total dengan lembar Ringkasan, melaporkan baris bermasalah, aman diulang). Tampilan HP berupa kartu. Data perusahaan tidak disimpan di repo: impor dilakukan dari file saat dipakai.

**Hasil impor file asli di mock:** 49 barang, 13 pengeluaran, total stok akhir 702 (cocok dengan lembar Ringkasan), stok minimum/habis 5 (cocok dengan Ringkasan: 3 stok minimum + 2 habis). 6 baris dilewati dan dilaporkan: nomor 2, 18, 42, 55, 56 tanpa nama barang di Stok Barang, dan baris "Kawat renceng" tanpa nomor barang di BARANG KELUAR.

**Draf database:** `supabase/draft/20240101000018_sparepart.sql` (tabel `sp`, RLS tanpa DELETE, audit, kebijakan `mutasi` diperluas, role gbb). Belum dijalankan di database mana pun. Adapter menandai `sp` opsional agar versi yang tayang tidak galat bila tabel belum ada.

**Bukti:** `verified in browser` (mock): impor file asli, transaksi, opname, dokumen, kartu stok, nonaktif, impor ulang, HP; tes e2e baru `tests/e2e/sparepart.mjs` 14 PASS (data sintetis). Tes penuh dijalankan terpisah.

## 2026-11-06 · Buffer di Gudang Sparepart dan Gudang Barang Jadi (lokal)

Permintaan pemilik: opsi mengatur buffer (target stok) di sparepart dan barang jadi, seperti di bahan baku. Lokal, tanpa deploy.

- **Sparepart:** kolom **Buffer** di Posisi stok; status baru **Di bawah buffer** (stok di atas minimum tetapi di bawah target) dengan keterangan "kurang N ke buffer"; kartu ringkasan **Di bawah buffer** (jumlah jenis dan total kekurangan); filter status; hitungan di lencana menu; kolom Buffer dan Kurang ke buffer di CSV. Diatur di form **Item baru/Ubah** (validasi minimum tidak boleh lebih besar dari buffer) dan di kartu stok lewat **Ubah minimum & buffer**. Kolom `buffer` ditambahkan ke tabel `sp` di draf migration 18 dan `schema-columns.js`.
- **Barang jadi:** kolom **Buffer**, status **Di bawah buffer**, filter "N di bawah buffer" di ringkasan (sebelumnya hanya bahan baku), field **Buffer stok (target)** di form Produk baru, dan tombol **Ubah buffer** di kartu stok. Tersimpan di kolom data tambahan `fg.data`, tanpa migration.
- **Bahan baku:** perilaku buffer tidak berubah; tombol Ubah buffer di kartu memakai fungsi umum yang sama.
- Bukti: `verified in browser` (mock) untuk sparepart (status, kurang ke buffer, validasi, kartu, KPI, filter, lencana menu) dan barang jadi (kolom, status, filter, produk baru); tes e2e `sparepart.mjs` ditambah SP-15 sampai SP-17. Tes penuh dijalankan terpisah.

## 2026-11-06 · Barang jadi & sparepart: dokumen mutasi, tren, PR, rencana produksi (lokal, belum rilis)
- **Barang jadi**: Riwayat mutasi punya nomor dokumen BJ-M/BJ-K, PDF/Excel, filter periode dan SPK. Barang keluar ditautkan ke SPK (customer terisi otomatis) dan laci SPK menampilkan "Barang jadi terkait SPK ini".
- **Rencana produksi (barang jadi)**: produk di bawah buffer diusulkan; tombol membuat SPK Draft untuk customer STOK MNI (`spk.data.stokReq`). Barang masuk yang ditautkan ke SPK itu mengurangi angka "sedang diproduksi".
- **Sparepart**: tab Rencana pembelian (usulan sampai buffer dikurangi yang sudah dipesan) membuat PR (`pr.data.gudang='sp'`), tandai dipesan, Excel, terima PR menambah stok.
- **Tren** (sparepart & barang jadi): grafik masuk/keluar per bulan, sparkline, label naik/turun; "Data baru" bila riwayat < 45 hari.
- Tes: sparepart.mjs SP-1..SP-26; regresi penuh hijau (regresi 42, role 12, akses 34, produksi 134, sparepart 26, tampilan 72).
- Catatan rilis: kebijakan `pr` untuk modul sparepart ada di draf migrasi 18 (belum diterapkan); membuat SPK stok butuh hak ubah modul SPK.

## 2026-11-06 · SPK stok end-to-end, filter jenis SPK, nama penanda tangan dokumen (lokal, belum rilis)
- **Buat SPK stok**: di Gudang Barang Jadi, ceklis produk di Posisi stok (atau tombol "SPK stok" di toolbar) lalu "Buat SPK stok" menghasilkan SPK Draft customer STOK MNI; qty bisa diisi per produk dan produk lain bisa ditambah.
- **Monitoring SPK**: filter Semua SPK / SPK Customer / SPK Stok di Daftar, Jadwal, dan Berjalan; SPK stok diberi chip "SPK Stok".
- **SPK stok tidak dikirim ke customer**: tombol diganti "Terima di gudang barang jadi" (form terisi dari item SPK, menghasilkan dokumen BJ-M bertaut SPK); Kirim ke vendor tetap ada. Progres "Terkirim" untuk SPK stok dihitung dari barang masuk gudang, label posisi menjadi Siap masuk gudang / Masuk sebagian / Masuk gudang, timeline menampilkan dokumen masuk. SPK stok tidak muncul di pilihan surat jalan customer.
- **Nama penanda tangan**: semua dokumen berbaris tanda tangan (mutasi bahan baku/barang jadi/sparepart, opname, PR, dokumen pusat seperti surat jalan dan laporan) menampilkan dialog nama; nama yang pernah diketik tersimpan di browser (per perangkat) sebagai saran dan terisi otomatis per jabatan. SPK mempunyai kolom tanda tangan sendiri; pratinjau surat jalan di layar belum memakai dialog ini.
- Perbaikan: teks progres di laci SPK ("N dari M item dikirim") selalu 0 karena memakai field yang salah; kini memakai jumlah terkirim sebenarnya.
- Tes: sparepart.mjs SP-1..SP-33; regresi penuh hijau.

## 2026-11-06 · Penerimaan dan pengiriman hanya untuk hasil produksi yang selesai (lokal, belum rilis)
- SPK stok: barang jadi hanya bisa diterima bila SPK sudah terbit dan produksinya selesai (dikurangi yang masih di vendor finishing, ditambah yang sudah kembali). Berlaku di tombol "Terima di gudang barang jadi" dan di form Barang masuk yang memilih SPK stok.
- SPK customer: kirim ke customer dibatasi ke hasil produksi yang siap (selesai produksi, kembali dari vendor). Ada centang "kirim lebih / sebelum produksi tercatat selesai" untuk kasus lapangan, wajib isi keterangan.
- Catatan rilis: SPK lama yang produksinya tidak pernah dicatat akan tertahan di pengiriman sampai produksinya dicatat atau centang override dipakai.
- Tes: SP-34 dan SP-35; sparepart.mjs 35 lulus.

## 2026-11-06 · Audit dokumentasi dan peta modul hulu ke hilir (T-204)

Atas permintaan pemilik ("kembali ke jalur", cross-check perencanaan, tugas, roadmap, dokumen, Obsidian, skill, dan agen; fokus lokal). Rilis ke production dijeda; tidak ada yang dideploy dan tidak ada migration diterapkan.

- **Temuan:** dokumen status tertinggal (PRODUCT_ROADMAP menulis belum ada Supabase production; ROADMAP bertanggal 2026-11-02; CLAUDE.md hanya memuat 8 skill dan 6 agen, padahal ada 12 dan 10; tidak ada catatan tugas untuk surat jalan, gudang, sparepart, SPK stok; tiga rencana berjalan tanpa peta modul). Cabang `fitur/produksi-multi-wc` ternyata membawa 175 berkas (bukan hanya gudang) sehingga "rilis kecil" tidak dapat dipotong bersih.
- **Dibuat:** [[PETA_MODUL]], [[PRD_GUDANG]], tugas T-195 sampai T-204; T-174 dikoreksi ke `review`.
- **Diperbarui:** ROADMAP, PRODUCT_ROADMAP, SISTEM_MAP (migration dan draf), HANDOFF, Home, CLAUDE.md, TEAM_AND_SKILLS (matriks agen dan skill), DECISIONS (4 keputusan), TEST_MATRIX (status uji terkini).
- **Skill dan agen:** skill `gudang-stok-flow` baru; `e2e-regression`, `adapter-contract`, `rls-roles`, `release-pipeline`, `vault-progress` dan agen `app-engineer`, `qa-regression`, `release-manager`, `progress-keeper`, `supabase-engineer` disegarkan.
- **Git:** merge `main` (surat jalan) ke `fitur/produksi-multi-wc` dengan satu konflik di form surat jalan (digabung: alamat dan nomor otomatis dari main ditambah penjaga hasil produksi); regresi setelah merge 0 FAIL; commit lokal 4be17cd, f62c395, 35bf7f7; belum di-push.
- **Pra-cek production (baca-saja):** baris rm 24, fg 92, mutasi 19, spk 8, pr 0, kirim 7, vendor 5, user 10; kebijakan `pr` dan `mutasi` serta pemicu `trigger_<tabel>_updated_at` cocok dengan draf 18; draf 18 dilengkapi pemicu `updated_at` dan `table_stamps` memuat `sp`.
- **Langkah berikut:** pemolesan modul sesuai arahan pemilik di lokal; rilis bertahap menunggu persetujuan ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]]).

## 2026-11-06 · Audit silang kedua: selesai vs belum, semua terdeteksi (T-204)

Permintaan pemilik: perbarui progress di Obsidian, cek mana yang belum dan sudah dikerjakan, pastikan semua terdeteksi. Laporan lengkap: [[AUDIT_PROGRESS_2026-11-06]].

- **Terdeteksi baru:** T-205 audit mandiri dan perbaikan HP, T-206 draf migration 17, T-207 Master Data bahan baku, T-208 pustaka PDF/Excel lokal, T-209 Posisi stok dan opname bahan baku (melengkapi T-195 sampai T-204).
- **Status dikoreksi:** T-102 done (dipenuhi T-172); T-103, T-101, T-023, T-060 ke review dengan bukti; T-133 dan T-143 ke doing; catatan keadaan terbaru pada T-011 sampai T-013, T-017, T-020, T-027, T-044, T-045, T-047, T-061, T-064, T-065, T-142, T-199, T-203.
- **Bukti baru production (baca-saja):** advisor keamanan 8 WARN fungsi bantu RLS (disengaja) dan proteksi password bocor belum aktif; advisor performa 3 WARN kebijakan permisif ganda, INFO 22 indeks belum terpakai dan 4 tabel arsip tanpa kunci primer; tidak ada temuan kritis.
- **Angka:** 130 tugas (37 done, 33 review, 6 doing, 1 blocked, 53 todo); selesai 37 dari 130 (28%), effort 40 dari 219,6 hari (18%); jalur kritis menuju go-live tetap 26,5 hari karena jalur proses dan data belum dimulai.
- **Tes terakhir:** regresi 42, role 12, akses 34, produksi 134, sparepart 35, tampilan 72 (329) dan unit 266, semua 0 FAIL.

## 2026-11-06 · Audit fitur dan rencana, suite uji fitur (T-210)

Permintaan pemilik: "update semua dan audit fitur dan plan". Laporan: [[FEATURE_AUDIT]].

- **Audit fitur:** 167 aksi UI dibandingkan dengan uji otomatis; yang diacu langsung naik dari 77 (46%) ke 91 (54%) lewat suite baru `tests/e2e/fitur.mjs` (13 uji: koreksi, nonaktif, baris form, SPK Draft terbit, ceklis SPK stok, opname bahan baku, unduhan Excel, jenis material, alamat surat jalan, tanpa pageerror), semua lulus; tidak ada bug fungsional baru. Prioritas uji berikut: editor SPK, Master Data (ganti nama, gabung), opname sparepart, dokumen kartu stok dan PR.
- **Audit rencana:** deviasi, usul penyesuaian (fase P2b, walkthrough memakai modul jadi, rilis bertahap setelah backup, tutup T-011 sampai T-013, sesi tinjauan per modul, aturan lingkup), dan risiko aktif dicatat; keputusan di pemilik.
- **Dokumen disegarkan:** GO_LIVE_PLAN, INTEGRATION_PATH (status S0 sampai S6), ENVIRONMENTS (keadaan terkini), RELEASE_CHECKLIST (rilis bertahap), VERSION_STRATEGY, USER_GUIDE (ditulis ulang per modul), INVENTORY, DEVELOPMENT, DATA_DICTIONARY (koleksi aplikasi), CHANGELOG (belum dirilis), LOCAL_PREVIEW, README, AUDIT_KESIAPAN, TEST_MATRIX, PETA_MODUL, HANDOFF, skill e2e-regression.
- **Tes:** regresi 42, role 12, akses 34, produksi 134, sparepart 35, fitur 13, tampilan 72 (342) dan unit 266.

## 2026-11-06 · Audit kerangka dan standar industri (T-211)

Permintaan pemilik: cek kerangka dan setiap fitur dari hulu ke hilir sampai tidak ada bug, kejanggalan, atau hal kurang bagus; jadikan sistem standar industri; kerjakan di lokal, buka di Playwright, dan pakai Context7. Laporan: [[STANDAR_INDUSTRI]].

- **Kerangka:** dokumentasi supabase-js dan Vite diperiksa lewat Context7; `npm audit --omit=dev` 0 kerentanan; 4 temuan hanya di alat pengembangan (CLI Supabase memakai `tar` rentan).
- **Keamanan:** uji XSS permanen `keamanan.mjs` (8 uji) lulus tanpa celah. CSP production masih `unsafe-inline`; rencana ada di T-211.
- **Aksesibilitas:** axe-core menemukan 5 kelas pelanggaran WCAG 2 A dan AA (kontras dua tema, select tanpa nama, isian tanpa label, tabel gulir tanpa fokus keyboard, avatar); semua dibenahi dan dikunci oleh `aksesibilitas.mjs` (0 pelanggaran).
- **Kualitas kode:** ESLint dipasang (0 galat, 43 peringatan kode mati), `npm run lint` dan `npm run test:unit` masuk CI; `kartu()` tidak lagi ditimpa; dua kunci ganda dibuang.
- **Bug fungsional (2):** pembaca angka berpemisah ribuan (F-16); koreksi barang masuk SPK stok tidak mengurangi progres (F-17).
- **Invarian data:** 10 invarian hulu ke hilir lulus pada data uji; alur SPK ujung ke ujung (alur-spk.mjs) 15 lulus bersama penjaga hasil produksi.
- **Dicoba dan dibuang:** minifikasi `app.js` (hemat 9 persen saja).
- **Kesenjangan standar industri** dan rencana pemenuhan: lihat [[STANDAR_INDUSTRI]] bagian 3 dan 5.

## 2026-11-07 · Uji menyeluruh semua modul hulu ke hilir (T-212)

Permintaan pemilik: buka di Playwright dan uji semuanya dari hulu ke hilir, semua modul dan fitur, sampai tidak ada bug. Laporan: [[STANDAR_INDUSTRI]] bagian 2.3, tugas [[T-212-uji-menyeluruh-semua-modul-dan-perbaikan-bug]].

- **Suite baru:** `menyeluruh.mjs` (24 uji) untuk aksi yang belum diacu uji lain; pemindai kejanggalan `kejanggalan.mjs` (16 menu desktop dan HP) di suite fitur dan menyeluruh; fitur bertambah ke 18 uji.
- **Bug ditemukan dan diperbaiki (4 kelompok, selain 2 dari T-211):** supplier diganti nama tidak mengikutkan PR; hitungan pemakaian master tidak lengkap sehingga supplier atau customer terpakai dapat terhapus permanen; ganti nama customer tidak mengikutkan Penawaran dan Sales Order; Dashboard memasukkan SPK stok ke Top customer, funnel pengiriman, dan hitungan telat.
- **Penelusuran visual Playwright:** Dashboard, Bahan Baku, Barang Jadi, Sparepart, SPK, Produksi Hari Ini ditinjau di tema terang; tidak ada kejanggalan lain. Alur SPK ujung ke ujung (15) lulus.
- **Catatan:** data contoh mock memakai nama material generik sehingga tampil "Belum dikenali" (bukan bug production).

## 2026-11-07 · Audit silang ketiga dan perbaikan bug (T-212)

Permintaan pemilik setelah berganti akun: audit fitur, cari bug hulu ke hilir, pastikan tidak ada tugas ganda dan status sesuai roadmap. Laporan: [[AUDIT_PROGRESS_2026-11-07]].

- **Verifikasi ulang:** seluruh angka uji sesi sebelumnya cocok; suite Penawaran yang terlewati dihidupkan (42 lulus).
- **Bug (7):** B-019 sampai B-025 ([[TEST_MATRIX]]): Work Center terpakai bisa dihapus dan diganti nama, penolakan hapus oleh database tampak berhasil, dialog tanpa perangkap fokus, jenis material kustom tak dikenali kebutuhan material, suite Penawaran terlewati, tugas selesai tanpa bukti.
- **Uji baru:** `editor.mjs` 17 uji, opname sparepart; aksi UI belum diuji turun dari 76 ke 43.
- **Tugas dan roadmap:** bukti ditulis (T-046, T-175, T-176, T-178); T-180 dan T-185 ditutup (digantikan T-186); kriteria ganda dirapikan; dependensi T-034 dilepas dari Docker; roadmap diselaraskan.
- **Belum:** keputusan pemilik di [[AUDIT_PROGRESS_2026-11-07]] bagian 4; semua bukti masih mock.

## 2026-11-07 · Uji alur SPK lengkap dan penjaga vendor berbasis rute (T-213)

Permintaan pemilik: uji dari buat SPK ke vendor ke customer, SPK stok ke vendor ke customer, dan SPK tanpa vendor (stainless dan aluminium), lalu sesuaikan. Tugas [[T-213-uji-alur-spk-lengkap-dan-penjaga-vendor-berbasis-rute]].

- **Suite baru** `alur-lengkap.mjs` 31 uji (empat alur, UI sungguhan, stabil tiga kali).
- **Bug:** B-026 (kirim ke customer atau terima gudang sebelum vendor), B-027 (tahap Siap kirim salah), B-028 (SPK stok 0 kg). Jalur tanpa vendor terbukti benar.
- **Belum:** keputusan pemilik untuk SPK lama; bukti masih mock.

## 2026-11-07 · Input item SPK terstruktur dan kalkulator full hole (T-214)

Permintaan pemilik: input SPK memakai bentuk dan ukuran (W H L, aksesori W H R) dengan nama, type, tebal, finishing, berat, dan tonase otomatis; routing per produk diatur di Master Data. Rancangan [[INPUT_SPK_TERSTRUKTUR]], tugas [[T-214-input-item-spk-terstruktur-dan-kalkulator-full-hole]].

- **Dikerjakan:** katalog dari kalkulator baru (full hole pada Straight STU dan STC), modul `bentuk.js` (unit 11), editor SPK terstruktur, uji `spk-terstruktur.mjs` 18.
- **Belum (tahap berikut):** routing per produk dan bentuk di Master Data, aturan vendor per material, pengecualian per item (kriteria terbuka T-174); menunggu jawaban pemilik; unggah katalog baru di production.
