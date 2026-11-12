---
type: decision-log
status: active
updated: 2026-11-02
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Log keputusan workspace

## 2026-11-03 — Migration tahan-urutan dan merge ke main

- **Konteks:** migration 5 (DROP policy lama) tidak dijalankan di dev, tetapi di lingkungan baru ia berjalan sebelum migration 6 yang meng-ALTER policy lama; tanpa pengaman, migration 6 akan gagal di project kosong (production).
- **Keputusan:** migration 6 dan 9 membungkus setiap ALTER dengan pemeriksaan keberadaan policy; migration 5 tetap berurutan. Advisor performa diperbaiki lewat migration 9 (initplan `auth.email()`, `pg_trgm` ke schema `extensions`). PR #1 development ke main digabung oleh pemilik dengan hak admin (syarat approval dilewati karena hanya satu akun), CI hijau.
- **Konsekuensi:** CI juga berjalan pada push ke main. Production wajib diuji penuh di project kosong sebelum dipakai.

## 2026-11-03 — CI wajib lulus sebelum merge ke main

- **Keputusan (pemilik):** job CI "Vault (tautan dan properti)" dan "Aplikasi (build dan regresi mock)" menjadi required status check pada `main`; strict (branch harus up to date) dimatikan; admin tidak dikecualikan secara berbeda dari sebelumnya.
- **Konsekuensi:** PR dari `development` ke `main` hanya bisa digabung bila kedua job hijau dan 1 approval ada. Mengubah nama job berarti memperbarui aturan ini.

## 2026-11-03 — Pembaruan data antar sesi memakai polling, bukan push Realtime

- **Konteks:** di Supabase dev channel Realtime SUBSCRIBED tetapi tidak ada event yang tiba (B-017). Diagnostik yang butuh melonggarkan hak fungsi untuk anon ditolak karena melemahkan keamanan.
- **Keputusan (pemilik):** pakai polling. Adapter memuat ulang tiap 15 detik saat tab terlihat dan saat tab kembali fokus (`POLL_MS` mengatur interval); render dilewati bila data sama.
- **Konsekuensi:** perubahan sesi lain tampil dalam sekitar 15 detik; beban sekitar 20 permintaan per tab tiap 15 detik. T-162 menjadi opsional (P2).

## 2026-11-03 — Struktur folder dibersihkan: satu kanonik, sisanya arsip

- **Konteks:** tiga folder bernama mirip (`mni-app`, `MNI OS - Dept. Operasional`, `MNI OS - Dept. Operational`) dan `apps/mni-app` di dalam repo membuat rancu mana yang aktif; Obsidian sempat membuka folder yang salah.
- **Keputusan:** `mni-os/` satu-satunya folder kerja (repo + vault). `apps/mni-app` diganti nama menjadi `apps/platform` (semua rujukan diperbarui). Folder lama dipindah ke `_Arsip/` di induk, tanpa dihapus.
- **Konsekuensi:** perintah dan dokumen memakai `apps/platform`; dev server dijalankan dari sana. Regresi 36 dan role 12 lulus dari lokasi baru.

## 2026-11-02 — Policy lama diganti isinya (ALTER), role ditegakkan di UI lewat peran dari backend

- **Konteks:** migration 5 (DROP POLICY) ditolak persetujuan SQL, sedangkan policy lama masih memberi hak pada role lama dan viewer dapat menulis log.
- **Keputusan:** migration 6 memakai `ALTER POLICY` (tanpa DROP) sehingga isi policy lama sama dengan padanan `_v2`. Migration 5 menjadi opsional. UI: bila adapter menyediakan `me().role` (mode Supabase dan mock), `myAcc()` memakai peran itu dan `guard()` aktif tanpa `ROLE_ON`; `ROLE_ON` (fitur menu Pengguna, undangan, klaim) tetap nonaktif sampai T-101 lanjutan. Akun mock diganti ke role aplikasi (ppic, gbb, gbj, logistik, viewer, admin).
- **Alasan:** satu model hak di UI dan database tanpa operasi destruktif; platform asli tidak terpengaruh.
- **Konsekuensi:** pengguna dengan role lama (manager/gudang/produksi) menjadi viewer di UI dan database; pindahkan akun ke role aplikasi. Seed mock naik ke versi 6.

## 2026-11-02 — Model role RLS mengikuti model role aplikasi (sementara)

- **Konteks:** policy awal memakai role admin/manager/gudang/produksi/viewer, sedangkan aplikasi mendefinisikan admin, ppic, gbb, gbj, logistik, viewer dengan hak per modul (`ROLES`, `modOf`; belum aktif karena `ROLE_ON=false`). Uji pada RLS nyata menunjukkan alur lintas peran gagal (mis. produksi tidak dapat mencatat mutasi atau surat jalan; kunci dokumen di tabel `master` tidak dapat ditulis non-admin; viewer dapat menulis log).
- **Keputusan:** hak tulis di database ditentukan tabel `role_modules` (role → modul) dan fungsi `can_mod(modul)`/`can_any()`/`is_admin()`; peta modul → tabel mengikuti `modOf`. Peta role ke modul adalah **model aplikasi apa adanya** dan **sementara** sampai disahkan tim Operasional (T-036). Migration 4 menambah (tanpa DROP); migration 5 menghapus policy lama dan menunggu persetujuan eksplisit.
- **Alasan:** satu model hak yang sama di UI dan database; mengubah hak cukup dengan mengisi `role_modules`, tanpa mengubah policy.
- **Konsekuensi:** role lama (manager, gudang, produksi) tidak lagi bermakna setelah migration 5; akun harus memakai role aplikasi. Pengguna tidak terdaftar tidak dapat membuat permintaan akses (login dibatasi ke `muser`).

## 2026-11-02 — Database dev: project Supabase baru dan model "kolom inti + JSONB data" (T-042)

- **Konteks:** akun Supabase sudah memiliki dua project aktif berskema ERP berbeda dan batas paket gratis (2 project aktif) penuh. Schema migration awal `mni-app` juga tidak cocok dengan bentuk dokumen yang ditulis app: mis. `bongkar` memakai jenis/muatan/pihak, `mutasi` memakai `item` (bukan `item_id` wajib), `log` memakai c/d/k/op, `vendor`/`kirim` memuat kendaraan, riwayat, dan referensi SPK.
- **Keputusan:** (1) buat project baru `MNI Gudang - Dev` (ref `inldyqigewmziwazalun`, ap-southeast-1) dan jeda project kosong `MNI OS - Operational` (0 baris data, bisa dipulihkan) agar muat di batas gratis, atas persetujuan pemilik; (2) tambahkan migration `20240101000003_app_shape_compat.sql`: kolom JSONB `data` di 19 tabel untuk bidang tambahan dan pelonggaran NOT NULL selain kunci bisnis (`muser.email`, `master.key`, `spk.no`); adapter memecah dan menggabungkan `data` berdasarkan `schema-columns.js`.
- **Alasan:** membuat app berjalan di Postgres nyata sekarang tanpa menebak model data final; model normal ditetapkan setelah discovery (T-033).
- **Konsekuensi:** kueri langsung ke bidang di `data` lebih sulit dan tanpa constraint; update parsial pada `data` adalah baca-ubah-tulis (tidak atomik). Normalisasi tabel kunci (SPK, mutasi, stok) menjadi pekerjaan lanjutan setelah pilot dipilih.

## 2026-11-02 — Sumber kebenaran UI untuk build mni-app (T-014)

- **Konteks:** `apps/platform` mengekstrak UI ke `public/app.*` dan semula meminta `mni-gudang.html` yang tidak ada. Dua kandidat sumber: `apps/gudang-logistik/reference/*.html` (salinan HTML lama) dan `apps/gudang-logistik/{index.html,assets/}` (sumber aktif).
- **Bukti (source-level):** setelah whitespace dinormalisasi, JS reference 224.784 karakter vs sumber aktif 369.415; reference hanya memakai 15 dari 20 koleksi di schema `mni-app` (tidak ada `mwc`, `log`, `uinv`, `muser`, `ureq`), sumber aktif memakai ke-20-nya.
- **Keputusan:** sumber kebenaran UI = `apps/gudang-logistik/` (index.html, assets/css/app.css, assets/js/app.js). `reference/` hanya arsip pembanding dan tidak dipakai build. `scripts/extract-app.js` memakai sumber itu secara default; `--source` dan `--input` tetap tersedia.
- **Alasan:** hanya sumber aktif yang sesuai dengan schema 20 tabel; perubahan UI dikerjakan di satu tempat; extract reproducible tanpa file di luar repo.
- **Konsekuensi:** `public/app.*` tetap dihasilkan dan di-ignore Git. Perubahan di `gudang-logistik` otomatis ikut build mni-app, jadi regresi harus dicek di keduanya. Verifikasi: ekstrak, build, dan muat di browser tanpa error JS (nav 15 item, `window.claude` ada).

## 2026-11-02 — MNI OS custom berdasarkan kebutuhan Operasional

- **Konteks:** arah sebelumnya terlalu menempatkan ERP Antlia dan praktik fit-gap vendor sebagai acuan produk.
- **Keputusan:** MNI OS dirancang sebagai sistem custom. Kebutuhan, proses aktual, kontrol, data, dan masukan tim Operasional MNI menjadi sumber utama desain dan prioritas. Antlia tidak menjadi blueprint atau daftar fitur wajib.
- **Cara memakai referensi eksternal:** praktik rekayasa, keamanan, UX, dan data boleh dipakai sebagai pola pembanding; keputusan alur dan fitur harus ditelusuri ke bukti serta validasi pemilik proses MNI.
- **Konsekuensi:** backlog, pilot saldo bahan baku, mapping schema hosted, dan usulan modul lama berstatus hipotesis sampai divalidasi. Model data Supabase lokal dirancang dari kebutuhan yang diterima, bukan diturunkan otomatis dari project hosted yang ditemukan.
- **Rujukan:** [[ROADMAP|Roadmap]], [[PROJECT_PROGRESS|Progress]], dan [[research/2026-11-02-erp-rationalization-best-practice|catatan riset yang dibingkai ulang]].

## 2026-11-02 — Source code dan vault berada di workspace yang sama

- **Konteks:** proyek mencakup website/aplikasi, panduan, progress, roadmap, riset, dan bukti visual; semua harus mudah ditinjau dari Obsidian.
- **Keputusan:** folder repository root dipakai sebagai vault; source tetap dalam `apps/` dan `websites/`; dokumen lintas proyek di `documentation/`; riset bertanggal di `research/`.
- **Alasan:** satu sumber Markdown yang bisa ditautkan ke kode dan dilacak di Git tanpa menyalin source ke vault kedua.
- **Konsekuensi:** pengaturan vault `.obsidian/` tetap lokal; preferensi pribadi tidak perlu masuk Git.

## 2026-11-02 — Markdown-first untuk progress dan roadmap

- **Konteks:** perlu melihat status kerja dan rencana tanpa harus memasang plugin pihak ketiga.
- **Keputusan:** Home adalah indeks; `PROJECT_PROGRESS.md` menyimpan status/bukti; `ROADMAP.md` menyimpan urutan hasil Now/Next/Later dan checklist.
- **Alasan:** properti, link internal, dan checklist Markdown bisa dibaca langsung, disimpan bersama source, serta menjadi basis untuk tampilan Bases bila kelak diperlukan.
- **Konsekuensi:** status harus dipelihara pada dokumen sumbernya; plugin/database view bersifat opsional.
- **Rujukan:** [[research/2026-11-02-obsidian-project-workspace-best-practice|Riset workflow Obsidian]].

## 2026-11-02 — Klaim harus menyebut tingkat bukti

- **Konteks:** source code menyebut data/runtime, tetapi browser, backend dan workbook aktual belum berhasil diakses pada sesi ini.
- **Keputusan:** label `source-level`, `verified in browser`, dan `verified in database` dipakai terpisah; screenshot aktual menunggu akses preview yang dapat diverifikasi.
- **Alasan:** mencegah inventaris kode atau screenshot UI dianggap sebagai bukti transaksi/persistence.
- **Rujukan:** [[PROJECT_PROGRESS|Progress proyek]] dan [[apps/gudang-logistik/docs/DATA_INVENTORY|inventaris data indikatif]].

## 2026-11-04 — Produksi dengan tiga menu dan input di tiga tempat

- **Konteks:** pemilik menilai menu produksi (Monitoring SPK, Dashboard Produksi, Antrian Mesin, Papan Produksi, Laporan Produksi, tombol Input per SPK) membingungkan; kebutuhan intinya hanya SPK yang berjalan, progres per item dan output per work center, serta posisi SPK.
- **Keputusan:** menu Produksi menjadi SPK Berjalan, Produksi Hari Ini, dan Kinerja & Analisa. Input hanya di Produksi Hari Ini (operator), Kirim ke Vendor, dan Bongkar Muat atau Kirim ke Customer; layar lain hanya untuk dilihat.
- **Alasan:** satu tempat input per jenis kejadian menghindari data ganda dan kebingungan operator; manajemen membaca semuanya dari kejadian yang sama.
- **Konsekuensi:** Papan Produksi dan Laporan Produksi menjadi rute tersembunyi (laporan harian pindah ke tab Kinerja & Analisa); tombol Input di tabel SPK dihapus. Tahap 2 menambah analisa per produk, vendor, dan pengiriman.
- **Rujukan:** [[PRD_PRODUKSI]], [[T-177-skema-produksi-tiga-pintu-spk-berjalan]].

## 2026-11-05 — Penawaran sebagai hulu ERP, modul terpisah dan lokal dulu

- **Konteks:** pemilik menyerahkan workbook penawaran Cable Tray dan Ladder dan ingin penawaran menjadi hulu sistem (SPK dibuat dari penawaran, material dan monitoring mengikuti). Workbook memakai model rumus yang sama dengan kalkulator berat (192 produk, estimasi dan real) ditambah lapisan harga.
- **Keputusan:** Penawaran dibangun sebagai **modul terpisah** (epic E-16, rilis v1.2) dengan tabel baru, menu baru berhak modul sendiri, dan mesin murni di apps/platform/src/lib/erp yang memakai kembali mesin berat. Dikerjakan **lokal dulu**, tanpa menyentuh Supabase production dan Vercel; ditayangkan bertahap E0 sampai E5, tahap terakhir hanya dengan persetujuan eksplisit. Cakupan awal: penawaran, estimasi, SPK dari penawaran, kebutuhan material, monitoring estimasi lawan aktual. Bukan ERP penuh (tanpa akuntansi, pajak, penggajian) sampai ada keputusan tertulis.
- **Alasan:** fondasi sekitar 70% sudah ada; satu mesin untuk berat dan harga menghindari rumus ganda; modul terpisah menjaga sistem live tetap aman.
- **Konsekuensi:** katalog rumus dan harga disimpan di database setelah login (rumus dan harga adalah aset perusahaan, repo publik); angka komersial tidak masuk Git. Jalur pilot (T-030 dan seterusnya) tetap prioritas dan tidak boleh tertahan. Aturan lingkup 2026-11-03 dikecualikan hanya untuk jalur lokal paralel ini atas permintaan pemilik.
- **Rujukan:** [[ERP_QUOTATION_ANALISIS]], [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]].

## 2026-11-06 — Jawaban pemilik untuk cakupan modul Penawaran

- **Konteks:** enam pertanyaan di [[ERP_QUOTATION_ANALISIS]] bagian 9.
- **Keputusan:** (1) sistem ini menangani penawaran sampai produksi, akuntansi dan faktur tetap di sistem lain; (2) Sales membuat penawaran, nomor mengikuti format lama, revisi bernomor Rev.; (3) satu penawaran boleh punya beberapa varian yang dipilih customer; (4) katalog awal 6 keluarga di workbook, produk lain menyusul; (5) batas diskon per peran dengan persetujuan di atas batas; (6) workbook ini menjadi pembanding uji emas.
- **Konsekuensi:** E-16 tidak memuat faktur atau piutang; T-190 memuat varian, status Menunggu persetujuan, dan batas diskon per peran; T-189 memakai nilai hitung workbook sebagai pembanding.
- **Rujukan:** [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]].

## 2026-11-06 — Rumus sheet utama menjadi baku untuk mesin harga

- **Konteks:** uji emas T-189 menunjukkan dua sheet lain di workbook penawaran memuat versi rumus lebih lama (302 sel berbeda; Straight Reducer hampir dua kali harga sheet utama).
- **Keputusan:** rumus sheet utama adalah model baku. Dua sheet lain dipakai hanya sebagai sumber parameter skenario (harga per kg, tebal, waste, harga baut). Harga lama di dua sheet itu untuk Straight Reducer, Hold Down Clamp, dan Cover Clamp tidak dipakai.
- **Alasan:** sheet utama paling baru dan sudah memperbaiki Reducer; satu model rumus mencegah hasil berbeda antar skenario.
- **Konsekuensi:** katalog harga dibangun dari sheet utama; satu cacat rujukan baris lain diperbaiki dan diuji; bila ada penawaran lama yang harus direproduksi persis dengan rumus lama, perlu versi rumus tersendiri (belum dikerjakan).
- **Rujukan:** [[ERP_QUOTATION_ANALISIS]] bagian 10, [[T-189-mesin-harga-penawaran-dan-uji-emas]].

## 2026-11-06 — Sales Order menjadi penghubung Penawaran dan SPK

- **Konteks:** pemilik bertanya apakah SPK sebaiknya otomatis menarik data dari penawaran atau dari Sales Order, seperti alur ERP baku.
- **Keputusan:** alur menjadi Penawaran, Sales Order (SO), SPK. SO dibuat dari penawaran Disetujui, memegang PO customer, due date, alamat, dan snapshot harga dan biaya. Konfirmasi SO membuat SPK Draft otomatis; PPIC memeriksa dan menerbitkan (gerbang terbit tetap manusia). Perubahan PO setelah deal lewat amandemen SO, bukan revisi penawaran. Tebal dan finishing diisi di penawaran atau SO agar rute produksi dan vendor terbentuk dari judul SPK.
- **Alasan:** PO customer dapat berbeda dari penawaran, satu penawaran dapat menjadi beberapa PO, dan harga yang dijanjikan harus terkunci di dokumen komitmen, bukan di penawaran.
- **Konsekuensi:** tabel salesorder (draf migration 16) memakai hak modul penawaran karena memuat harga; SPK tidak menyimpan harga; T-192 (kebutuhan material) dihitung dari SO atau SPK, bukan dari penawaran.
- **Rujukan:** [[tasks/T-194-sales-order-penghubung-penawaran-dan-spk|T-194]].

## 2026-11-06 — Reservasi material diturunkan dari SPK, bukan disimpan

- **Konteks:** T-192 butuh reservasi material saat SPK terbit tanpa mengubah stok fisik dan tanpa menambah tabel di production.
- **Keputusan:** reservasi dihitung dari SPK berstatus Terbit yang belum Selesai atau Batal: kebutuhan bruto (netto x faktor sisa potong 1,1) per (bahan, tebal) dikurangi material yang sudah dikeluarkan gudang untuk SPK itu (mutasi Pakai bertanda SPK). Stok tersedia = stok fisik dikurangi reservasi SPK lain. Stok fisik hanya berkurang saat gudang mencatat Pakai. PR terbuka dihitung sebagai pasokan yang menutup kekurangan.
- **Alasan:** tanpa tabel baru tidak ada migration dan tidak ada risiko reservasi menyimpang dari SPK; revisi, selesai, dan batal SPK otomatis tercermin.
- **Konsekuensi:** keputusan pemilik tentang pengurangan stok otomatis saat SPK terbit masih terbuka; bila dipilih, reservasi diubah menjadi mutasi otomatis. Faktor 1,1 dan pemetaan per (bahan, tebal) bersifat sementara.
- **Rujukan:** [[tasks/T-192-kebutuhan-material-dan-reservasi-stok|T-192]].

## 2026-11-06 — SPK stok tidak dikirim ke customer; hanya hasil produksi selesai yang dapat diterima atau dikirim

- **Konteks:** pemilik menemukan SPK stok yang belum diproduksi dan belum ke vendor sudah dapat "diterima" dan langsung menambah stok; SPK customer juga dapat langsung dikirim tanpa hasil produksi.
- **Keputusan:** SPK stok (`spk.stokReq`, customer STOK MNI) berakhir di **Gudang Barang Jadi** lewat Terima di gudang barang jadi (BJ-M tertaut SPK), bukan surat jalan customer. Penerimaan dan pengiriman dibatasi ke hasil produksi siap = produksi efektif − di vendor + kembali dari vendor; SPK Draft tidak dapat menerima. Kirim ke customer memiliki override "kirim lebih" dengan keterangan wajib.
- **Alasan:** stok hanya boleh bertambah bila barangnya benar ada; jejak SPK stok lawan SPK customer harus bisa dilacak.
- **Konsekuensi:** SPK lama yang produksinya tidak pernah dicatat tertahan di pengiriman sampai dicatat atau override dipakai; catat saat rilis ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]]).
- **Rujukan:** [[PRD_GUDANG]], [[T-199-spk-stok-alur-ujung-ke-ujung]].

## 2026-11-06 — Modul Penjualan disembunyikan, fokus operasional

- **Keputusan pemilik:** menu Penawaran dan Sales Order tidak tampil; kode, data, dan draf migration 15 dan 16 dipertahankan di balik saklar `MODUL_PENJUALAN`. T-193 ditunda.
- **Rujukan:** [[T-202-sembunyikan-modul-penjualan-fokus-operasional]].

## 2026-11-06 — Rilis bertahap, database dahulu, migration 17 tidak ikut

- **Konteks:** cabang `fitur/produksi-multi-wc` membawa 175 berkas selain gudang (produksi multi WC dan lainnya), sehingga rilis gudang saja tidak dapat dipotong bersih.
- **Keputusan:** rilis dilakukan bertahap: pra-cek baca-saja, merge `main` ke cabang dan regresi, migration 14 lalu 18 (hanya menambah; adapter memperlakukan `produksi_log` dan `sp` sebagai opsional), PR dan CI, deploy, verifikasi, rollback siap. Migration 17 (anti stok negatif) ditunda sampai diuji di branch database karena dapat menahan transaksi sah bila data lama memuat stok negatif. Pemilik menjeda rilis untuk memoles lokal terlebih dahulu.
- **Rujukan:** [[T-203-rilis-paket-gudang-dan-produksi-ke-production]], [[SISTEM_MAP]].

## 2026-11-06 — Nama penanda tangan dokumen disimpan per perangkat

- **Keputusan:** dialog nama sebelum cetak atau unduh; nama dan jabatannya diingat di `localStorage` (`mni-signers`) sebagai saran dan isian otomatis. Belum dibagi antar pengguna karena memerlukan tabel baru dan persetujuan.
- **Rujukan:** [[T-201-nama-penanda-tangan-dokumen]].

## 2026-11-09 — Production dibiarkan; migrasi data ditunda; pengembangan lokal dilanjutkan

- **Keputusan pemilik:** sistem yang sudah live (`main` ad73c89, Supabase production `lggqigmvtefkquqjrjsb`, Vercel `mni-gudang`) tidak diganggu. Migrasi data ke akun baru ditunda; pengembangan dilanjutkan di lokal. Koneksi ke Supabase dan GitHub baru disiapkan kemudian.
- **Alasan:** konektor Supabase sudah beralih ke akun baru (`nurilhamj@gmail.com`) dan project production tidak lagi terlihat dari sana; Vercel tim MNI juga belum bisa diakses dari konektor baru.
- **Konsekuensi:** tidak ada migration, deploy, atau perubahan di production. Tugas T-203 (rilis) tetap menunggu persetujuan. Saat migrasi nanti: ekspor data dari akun lama, buat project baru, migrasi 1 sampai 13 lalu draf 14 sampai 18 satu per satu, dan undang ulang pengguna karena akun login tidak bisa disalin lewat SQL.
- **Rujukan:** [[HANDOFF]], [[SERTIJOB]], [[T-203-rilis-paket-gudang-dan-produksi-ke-production]].

## 2026-11-11: Penawaran dan Sales Order dihapus, lingkup WMS penuh

- **Keputusan pemilik:** fokus ke WMS. Semua yang berkaitan dengan Penawaran, Sales Order, harga, dan sejenisnya dihilangkan dan dibersihkan dari sistem.
- **Dilakukan (lokal):** layar, menu, hak akses, pendengar, dan gaya Penawaran/Sales Order dari `app.js` dan `app.css`; mesin harga (`erp/harga.js`, `penawaran.js`, `salesorder.js`, katalog dan skenario harga), tabel `penawaran` dan `salesorder` di adapter, mock, dan skema; uji `penawaran`, `alur-penawaran`, dan unit terkait; skrip `build-quote-catalog.mjs`; draf migration 15 dan 16; skill `erp-quotation-engine` serta agen `pricing-engineer` dan `erp-integrator`.
- **Dipertahankan:** `erp/material.js` (kebutuhan plat dan reservasi, bagian WMS), kolom `po` dan `sales` pada SPK (nomor PO customer dan nama sales sebagai data SPK), peran `sales` hanya untuk membaca pengguna lama (tidak bisa dipilih).
- **Production tidak tersentuh:** tabel `penawaran` dan `salesorder` memang tidak pernah dibuat di production (migration 15 dan 16 tidak pernah diterapkan). Galat 404 di konsol live akan hilang setelah kode ini dirilis (butuh persetujuan terpisah).
- **Catatan riwayat:** catatan tugas lama (`tasks/`, `roadmap/`) yang menyebut Penawaran tidak diubah; itu riwayat.

## 2026-11-12: Section SPK dirapikan menjadi 11 section

- **Keputusan pemilik:** section SPK: (1) Cable Tray, (2) Perforated Cable Tray, (3) Cable Ladder, (4) **Cable Duct**: semuanya hanya **Straight**; Cable Duct seperti Cable Tray tanpa lubang dengan masukan berat yang sama; (5) sampai (7) **Accs Cable Tray, Ladder, Duct**: Elbow, Inside Riser, Outside Riser, Tee, Cross, Reducer; (8) sampai (10) **Cover Tray, Cover Ladder, Cover Duct**: Cover, Cover Elbow, Cover Inside Riser, Cover Outside Riser, Cover Tee, Cover Cross, Cover Reducer; (11) **Other Support**: Jointing, Horizontal dan Vertical Fish Plate, Splice Plate Set, Bracket Support, Double dan Single Channel Bracket, Hanger Beam, U Channel 20x20, Hanger Clevis, Cover Clamp, Cover Clamp Heavy Duty, Separator, Support Separator, Hold Down Clamp, Hold Down Clip, End Stop, Drop Out; strukturnya mengikuti jenis (type) section.
- **Nama item** tetap otomatis dari bentuk dan ukuran, tetapi **bisa diedit manual** (hanya nama); ukuran W, H, L, R mengikuti struktur kalkulator dan berat tetap dari kalkulator. Tombol "↺ otomatis" mengembalikan nama otomatis; penanda `nm` disimpan di item.
- **Dampak:** aksesori (Jointing dst.) pindah dari ACCS ke Other Support; SPK lama yang masih berisi aksesori di section ACCS tetap terbaca (ditandai "di luar aturan" dengan saran section). Produk lama SUPPORT TRAY dan WIREMESH CABLE TRAY tidak lagi di daftar tetapi SPK lamanya tetap bisa dibuka. Rute produksi standar: Cover Ladder dan Cover Duct seperti Cover Tray; **Other Support memakai rute yang sama dengan ACCS (CNC Laser, Bending, Welding) sebagai bawaan sementara**, dapat diubah di Master Data (Rute produksi). Production tidak punya pengaturan Opsi SPK atau aturan section yang menimpa (dicek), jadi bawaan baru langsung berlaku.
- **Catatan katalog:** di katalog asli bentuk Vertical Fish Plate jenis SLHDC berakhiran `SLHC` (salah ketik); kini ditoleransi.

## 2026-11-12: Nama bentuk bisa diedit, Elbow tanpa 90, Cable Duct tanpa Punching
- **Keputusan pemilik:** label bentuk cukup "Elbow" (bukan "Elbow 90"), dan nama bentuk dapat diubah di Master Data supaya terhubung ke editor SPK. Disimpan di `master/setting.namaBentuk` (kosong = nama standar); tanpa migration database.
- **Turunan (menunggu konfirmasi):** Cable Duct tanpa lubang, jadi rute standarnya Shearing, Bending tanpa Punching. Dapat diubah di Master Data › Rute produksi.
- **Draf PR susulan:** SPK yang diterbitkan peran tanpa hak Gudang Bahan Baku (mis. PPIC) mendapat draf PR saat petugas gudang bahan baku atau admin membuka Bahan baku; hanya SPK terbit 7 hari terakhir yang belum punya PR.

## 2026-11-12: Hak modul ketat (hanya modul yang diatur, kecuali super admin)
- **Keputusan pemilik:** setiap peran atau pengguna hanya melihat modul yang diatur untuknya; hanya super admin yang melihat semua. Yang diatur bisa dibuat sepenuhnya di Pengguna & Akses (peta modul per pengguna, atau paket peran sebagai titik awal).
- **Perilaku aplikasi:** tanpa peta modul pengguna, hak mengikuti paket peran (ubah, lihat, atau tidak tampil); sebelumnya modul di luar paket dianggap "lihat". Menu Master Data hanya untuk admin atau pemegang modul `master-data`. Laporan menampilkan hanya bagian dari modul yang boleh dilihat (Kesehatan data khusus admin). Dashboard (peringatan dan aktivitas) dan tab Vendor serta Pengiriman di Analisa Produksi mengikuti hak modul. Membuka alamat modul yang tidak diizinkan kembali ke Dashboard.
- **Pratinjau lokal:** pengguna contoh membawa peta modul sesuai paket peran, termasuk peran baru Gudang dan Maintenance.
- **Database:** draf `20240101000025_hak_modul_ketat.sql` membuat `mod_level()` ketat untuk pengguna tanpa peta modul (belum diterapkan; periksa pengguna lama tanpa peta modul sebelum diterapkan). Pengguna yang dibuat dari form Tambah anggota sudah punya peta modul sehingga sudah ketat di database.
