---
type: task
id: T-220
title: "Aturan section SPK sesuai standar (Cable Tray, ACCS, Cover) dan keterangan pemakaian stok di editor"
phase: P9
epic: E-16
release: v1.2
status: review
priority: P1
env: dev
effort_days: 3
depends: [T-216, T-219]
owner: "dev + pemilik"
updated: 2026-11-08
---

<img src="../documentation/assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# T-220 Aturan section SPK sesuai standar dan keterangan pemakaian stok di editor

Epic: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]]
Fase: P9
Bergantung pada: T-216, T-219

## Kriteria selesai

- [x] Isi section mengikuti standar lembar SPK MNI: **Cable Tray, Perforated Cable Tray, dan Cable Ladder** hanya batang lurus (Straight); **ACCS Tray, ACCS Ladder, ACCS Duct** memuat fitting (Elbow 90, Tee, Cross, Inside/Outside Riser, Reducer) dan aksesori; **Cover Tray** memuat semua tutup
- [x] Aturan tidak lagi tertanam di kode: tab Master Data **Aturan section** (tabel bentuk x produk, simpan, pulihkan standar) menyimpan `master/setting.aturanSection`
- [x] SPK lama tetap aman: baris dengan bentuk di luar aturan (mis. Elbow di Cable Tray) tetap terbuka dan terhitung, hanya diberi tanda beserta saran section; mengganti produk section menukar Straight dan Cover Straight otomatis; baris kosong di section ACCS kembali ke teks bebas
- [x] Tombol **Section COVER** di editor (melengkapi Section dan Section ACCS)
- [x] Keterangan pemakaian stok selalu tampil di tiap baris editor SPK customer: "Stok cocok: <produk> · tersedia N" dengan tombol **Pakai stok**, atau "Tidak ada stok cocok · produksi semua"; pengguna tinggal menyesuaikan jumlah dari stok (sisanya produksi). Pencocokan memakai spesifikasi terstruktur (produk, type, tebal, finishing, W, H, L) selain nama item
- [x] Rute produksi fitting di section ACCS: Elbow/Tee/Cross/Riser/Reducer memakai rute produk ACCS (CNC Laser → Bending → Welding, sesuai `RUTE_PRODUKSI.md`) tanpa kunci per bentuk; Hanger/Clamp tetap aturan khusus; bila pemilik ingin rute berbeda untuk satu fitting, cukup tambah rute khusus bentuk (`ACCS TRAY|ELBOW`) di Master Data › Rute produksi. Diuji R-97..R-99 (kunci lama `CABLE TRAY|ELBOW` tetap berlaku untuk SPK lama)
- [ ] Pencocokan stok untuk fitting dan aksesori (saat ini hanya Straight dan Cover Straight yang dicocokkan otomatis; lainnya dipilih manual lewat daftar produk)

## Bukti

Tingkat bukti: `verified in browser` (mock lokal) dengan katalog berat sintetis uji, bukan katalog perusahaan dan bukan Supabase. Unit `tests/unit/bentuk.test.mjs` B-01..B-16 (16 PASS); e2e `spkaturan` AR-01..AR-17 (18 PASS) di `tests/e2e/spk-aturan.mjs`; `spk-terstruktur.mjs` disesuaikan (Elbow kini diuji lewat section ACCS TRAY, ditambah S-05a dan S-06b untuk kompatibilitas SPK lama).

Rancangan: `bentuk.js` memuat `ATURAN_DEFAULT` (token `@FITTING`, `@AKSESORI`, `@COVER`), `kelompokBentuk`, `bentukDiizinkan(produk, kunci, aturan)`, `bentukSemua`; adapter `MNIBerat.setAturan/bentukSemua/diizinkan/keluargaDaftar/produkBentuk`; editor memakai `cap.shapes` (boleh dipilih) dan `cap.all` (untuk membaca baris lama).

Peninjauan independen (workflow, 3 sudut pandang + verifikasi bantahan): 17 temuan, yang terbukti dan sudah diperbaiki: Section COVER dari section Ladder/Duct, aturan kustom yang mengosongkan produk (kini kembali ke standar dan edCap tetap terstruktur), tombol Pakai stok memilih stok terbanyak dan tidak ditawarkan bila habis, tautan stok dilepas saat Straight berganti Cover Straight, saran section mengikuti tray/ladder/duct, dan **nama fitting di ACCS memuat jenis dasar** ("Cable Tray Elbow 90 W100xH50xR300", "Cable Ladder Elbow 90 ...") agar unik antar produk dan sama dengan penamaan lama (kunci katalog berat nama|tebal dan pelacakan item memakai nama). Status stok tiga keadaan: cocok, tidak ada, fitting/aksesori tidak dicocokkan otomatis.

Batas yang jujur: kunci rute lama `CABLE TRAY|ELBOW` tetap berlaku untuk SPK lama tetapi tidak lagi muncul sebagai baris standar di Master Data › Rute produksi (muncul sebagai rute khusus bila sudah ada); simpan revisi SPK terbit dengan baris di luar aturan belum diuji ujung ke ujung; belum diuji dengan katalog perusahaan.
