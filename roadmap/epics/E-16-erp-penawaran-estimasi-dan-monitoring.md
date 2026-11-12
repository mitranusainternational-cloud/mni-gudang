---
type: epic
id: E-16
title: "ERP hulu: Penawaran, estimasi, dan monitoring operasional"
release: v1.2
theme: Integrasi
priority: P2
status: active
progress: 8
tasks_total: 26
tasks_done: 4
updated: 2026-11-12
---

# E-16 ERP hulu: Penawaran, estimasi, dan monitoring operasional

Rilis target: **v1.2** · Tema: Integrasi · Prioritas: P2
Induk: [[roadmap/PRODUCT_ROADMAP|Roadmap produk]] · Rancangan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]]

## Hasil yang diinginkan

Penawaran menjadi hulu sistem: harga dan estimasi (berat, kebutuhan material, biaya) dihitung dari mesin yang sama dengan kalkulator berat, lalu SPK dibuat dengan **muat dari penawaran**, kebutuhan material tercadangkan, dan monitoring operasional menampilkan estimasi lawan aktual. Dikerjakan sebagai **modul terpisah, lokal dulu**, tanpa menyentuh sistem live, dan ditayangkan bertahap (E0 sampai E5, skill `erp-module-boundary`).

## Risiko dan asumsi

Bukan jalur pilot; tidak boleh menahan tugas go-live (T-030 dan seterusnya). Rumus dan harga adalah aset perusahaan dan repo bersifat publik, sehingga katalog dan harga di database. Cakupan awal bukan ERP penuh (tanpa akuntansi, pajak, penggajian). Pemilik sudah menjawab (2026-11-06): akuntansi dan faktur di luar cakupan, Sales membuat dengan nomor format lama, beberapa varian per penawaran, katalog awal 6 keluarga, batas diskon per peran dengan persetujuan, uji emas memakai workbook. Masih terbuka: nilai batas diskon dan penyetuju.

## Tugas

- [x] [[tasks/T-187-bedah-workbook-quotation-dan-rancang-modul-erp|T-187]] Bedah workbook quotation dan rancang modul ERP · done · P1 · 1 hari
- [x] [[tasks/T-188-skill-dan-agen-erp-di-claude|T-188]] Skill dan agen ERP di .claude · done · P1 · 0.5 hari
- [x] [[tasks/T-189-mesin-harga-penawaran-dan-uji-emas|T-189]] Mesin harga penawaran dan uji emas · done · P2 · 3 hari
- [ ] [[tasks/T-190-modul-penawaran-lokal|T-190]] Modul Penawaran lokal (daftar, lembar, revisi, cetak) · review · P2 · 4 hari
- [ ] [[tasks/T-191-muat-dari-penawaran-ke-spk-dan-snapshot-po|T-191]] Muat dari penawaran ke SPK dan snapshot PO · review · P2 · 3 hari
- [ ] [[tasks/T-192-kebutuhan-material-dan-reservasi-stok|T-192]] Kebutuhan material dan reservasi stok · review · P2 · 3 hari
- [ ] [[tasks/T-193-monitoring-estimasi-lawan-aktual|T-193]] Monitoring estimasi lawan aktual · todo · P2 · 3 hari
- [ ] [[tasks/T-194-sales-order-penghubung-penawaran-dan-spk|T-194]] Sales Order: penghubung Penawaran dan SPK · review · P2 · 3 hari
- [x] [[tasks/T-202-sembunyikan-modul-penjualan-fokus-operasional|T-202]] Sembunyikan modul Penawaran dan Sales Order, fokus ke operasional · done · P2 · 0.25 hari
- [ ] [[tasks/T-215-cetak-biru-skema-database-spk-dan-bahan-baku|T-215]] Cetak biru skema database: peruntukan SPK dan kebutuhan bahan baku (draf migration 19) · review · P2 · 2 hari
- [ ] [[tasks/T-216-spk-customer-memakai-stok-sebagian|T-216]] SPK customer memakai stok gudang barang jadi sebagian · review · P1 · 3 hari
- [ ] [[tasks/T-218-surat-jalan-gabungan-beberapa-spk|T-218]] Surat jalan vendor dan customer gabungan beberapa SPK dalam satu armada · review · P1 · 4 hari
- [ ] [[tasks/T-219-desain-dokumen-modern-dan-kop-di-master-data|T-219]] Desain dokumen modern bertema per jenis dan kop yang dapat diatur di Master Data · review · P1 · 3 hari
- [ ] [[tasks/T-220-aturan-section-spk-standar-dan-stok-di-editor|T-220]] Aturan section SPK sesuai standar (Cable Tray, ACCS, Cover) dan keterangan pemakaian stok di editor · review · P1 · 3 hari
- [ ] [[tasks/T-221-master-mesin-dan-alur-sparepart-standar|T-221]] Master Mesin dan alur sparepart standar (terima via PR, keluar ke mesin) serta audit lintas modul · doing · P1 · 3 hari
- [ ] [[tasks/T-222-input-spk-dimensi-kg-estimasi-real|T-222]] Input SPK per dimensi (W, H, L) dengan KG estimasi dan KG real · doing · P1 · 5 hari
- [ ] [[tasks/T-223-matriks-rute-produksi|T-223]] Matriks rute produksi di Master Data (produk dan komponen x Work Centre) · doing · P1 · 2 hari
- [ ] [[tasks/T-224-serah-terima-plate|T-224]] Serah terima plate gudang ke produksi · review · P1 · 2 hari
- [ ] [[tasks/T-225-perapian-master-data-dan-audit-alur|T-225]] Perapian Master Data (tanpa duplikasi, tanpa data tertanam) dan audit alur Master Data sampai Kinerja · doing · P1 · 3 hari
- [ ] [[tasks/T-226-ux-input-spk-ringkas-berat-otomatis|T-226]] Input SPK ringkas: berat estimasi dan real langsung tampil, tempel daftar dari Excel · doing · P1 · 2 hari
- [ ] [[tasks/T-227-produksi-hulu-hilir-wc-selaras-progres-per-wc|T-227]] Produksi hulu ke hilir: Work Centre selaras rute, item langsung terlihat di tiap WC, Progres WC · review · P1 · 1 hari
- [ ] [[tasks/T-228-nama-bentuk-master-data-susulan-pr-dan-sapu-bug|T-228]] Nama bentuk bisa diedit di Master Data, Elbow tanpa 90, susulan draf PR, rute Cable Duct, sapu bug dan perapian workspace · review · P1 · 1 hari
- [ ] [[tasks/T-229-laporan-produksi-per-jenis-produk-alasan-belum-produksi|T-229]] Laporan produksi per jenis produk (triwulan), alasan belum produksi, Ladder dan Duct tanpa lubang, posisi Berjalan satu langkah Produksi · review · P1 · 1 hari
- [ ] [[tasks/T-230-master-data-pengguna-kinerja-tim-selaras-modul|T-230]] Master Data, Pengguna & Akses, dan Kinerja Tim selaras modul terbaru (angka punya dasar) · review · P1 · 1 hari
- [ ] [[tasks/T-231-wiremesh-spk-contoh-uji-other-support|T-231]] Section Cable Tray Wiremesh, SPK contoh uji (Tray, Ladder, Duct, Wiremesh), Other Support kelompok sendiri · review · P1 · 1 hari
- [ ] [[tasks/T-232-laporan-per-bagian-pdf-excel|T-232]] Laporan per bagian: unduh PDF dan Excel dengan ringkasan dan tabel rinci untuk analisa dan bottleneck · review · P1 · 1 hari

> Properti status, progress, dan jumlah tugas serta daftar ini dibuat otomatis oleh `node scripts/progress-report.mjs`. Jangan ubah manual. Tampilan interaktif: [[PROGRESS_DASHBOARD]].
