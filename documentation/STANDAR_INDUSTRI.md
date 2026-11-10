---
type: audit
status: active
updated: 2026-11-06
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Audit kerangka dan standar industri (2026-11-06)

Pemeriksaan seluruh kerangka (build, dependensi, keamanan, aksesibilitas, kualitas kode, data) dan kesenjangan terhadap praktik umum sistem gudang dan logistik (WMS/ERP ringan). Dikerjakan lokal; tidak ada perubahan production. Rujukan: [[FEATURE_AUDIT]], [[PETA_MODUL]], [[PRD_GUDANG]], tugas [[T-211-audit-kerangka-dan-standar-industri]].

## 1. Ringkasan

| Bidang | Hasil | Tindakan hari ini |
|---|---|---|
| Kerangka dan dependensi | Vite 5.4.21, supabase-js 2.118; `npm audit --omit=dev` 0 kerentanan; audit penuh 4 temuan di alat pengembangan (CLI Supabase memakai `tar` rentan) | dicatat; bukan di bundel production |
| Kualitas kode | 0 galat ESLint kebenaran setelah perbaikan; 43 peringatan kode mati | ESLint dipasang, `npm run lint`, masuk CI dengan batas peringatan 43 |
| Pengujian | 342 uji UI + 266 unit sebelum audit | + keamanan (XSS) 8, + aksesibilitas 3, + invarian data, + fitur 16; unit masuk CI |
| Keamanan tampilan (XSS) | payload disuntikkan ke 53 bidang teks di seluruh data; semua menu, laci, lembar, kartu, dan dokumen: tidak ada eksekusi | uji permanen `keamanan.mjs` |
| Aksesibilitas | axe-core: 5 kelas pelanggaran WCAG 2 A dan AA | semua dibenahi; 16 menu x 2 tema dan 11 form, laci, kartu x 2 tema: 0 pelanggaran |
| Integritas data | 10 invarian hulu ke hilir (stok tidak minus, nomor unik, tautan sah, koreksi, SPK stok) | lulus; uji permanen `invarian.mjs` |
| Bug fungsional | 2 ditemukan | diperbaiki dan diuji (bagian 3) |
| Kinerja | `app.js` 778 KB (gzip 283 KB), satu berkas; minifikasi hanya menghemat 9 persen | tidak dipakai; modularisasi (T-141) lebih berarti |

## 2. Temuan dan perbaikan

### 2.1 Aksesibilitas (axe-core 4.10, WCAG 2 A dan AA)

| Temuan | Dampak | Perbaikan |
|---|---|---|
| Kontras teks kecil di tema gelap (label menu, status koneksi, tombol tab aktif) | sulit dibaca | aksen gelap `#5B8EF0` menjadi `#7BA5F5`; opasitas teks sidebar dibuang |
| Kontras di tema terang (teks sekunder, chip status, label) | sulit dibaca | warna `--ok`, `--warn`, `--crit`, `--info`, `--faint` digelapkan sampai rasio 4,5:1 |
| Pilihan (select) filter tanpa nama | pembaca layar tidak tahu fungsinya | nama dipasang otomatis dari judul atau opsi pertama |
| Isian form tidak terhubung ke labelnya | pembaca layar membaca isian tanpa nama | label dihubungkan otomatis; isian di tabel diberi nama dari placeholder |
| Tabel yang dapat digulir tidak dapat difokus keyboard | pengguna keyboard tidak dapat menggulir | tabel yang meluap diberi `tabindex` dan nama |
| Avatar dengan warna profil bebas dan teks putih | kontras 4,4:1 | lapisan gelap tipis di bawah huruf |

### 2.2 Kualitas kode

- Kunci ganda `Batal` di peta warna status dan `noSJ` di pemetaan kolom (identik, tidak berbahaya): dibuang.
- `kartu()` ditimpa ulang saat dimuat (`kartu=function`): dijadikan satu fungsi dengan cabang bahan baku.
- 34 variabel tak terpakai di `app.js` (kode mati dari fitur lama, mis. `_tProdLama`, `CAT_META`): tercatat, dibersihkan bertahap (batas peringatan CI menjaga agar tidak bertambah).

### 2.3 Bug fungsional

| Bug | Penyebab | Perbaikan dan uji |
|---|---|---|
| Pembaca angka salah untuk teks berpemisah ribuan: `1.500,75` terbaca 1,5 dan `1.000.000` terbaca 1 | `num0` hanya mengganti koma pertama lalu `parseFloat` | pembaca diperbaiki (koma desimal, titik ribuan, format en); uji F-16 |
| Koreksi barang masuk gudang jadi dari SPK stok tidak mengurangi progres SPK dan jumlah yang sedang diproduksi | penghitung hanya memuat transaksi `masuk`, bukan koreksi yang membalikkannya | satu fungsi `fgGot` dan hitungan `calc()` memuat koreksi; uji F-17 |

Satu perilaku dicatat, bukan bug: titik tunggal pada angka (`1.000`) dibaca desimal (1,0). Pada isian bertipe angka peramban sudah menormalkan; untuk tempelan teks perlu kehati-hatian.

Tambahan setelah uji menyeluruh ([[T-212-uji-menyeluruh-semua-modul-dan-perbaikan-bug]]):

| Bug | Penyebab | Perbaikan dan uji |
|---|---|---|
| Mengganti nama supplier di Master Data tidak mengubah supplier pada PR | pemetaan rujukan supplier tidak memuat PR | PR dimasukkan; uji M-6 |
| Supplier atau customer yang dipakai bisa dihapus permanen | hitungan pemakaian hanya memuat penerimaan bahan baku dan surat jalan | hitungan memuat sparepart masuk, PR, dan barang jadi keluar; uji M-4 dan M-5 |
| Ganti nama customer tidak mengikutkan Penawaran dan Sales Order | rujukan customer tidak memuatnya | dimasukkan (aman bila modul kosong) |
| Dashboard memasukkan SPK stok (customer STOK MNI) ke Top customer, funnel pengiriman, dan hitungan telat | SPK stok diperlakukan seperti SPK customer | SPK stok dikeluarkan dari ukuran pengiriman customer; uji F-18 |

### 2.4 Keamanan

- **XSS:** lulus, tidak ada celah ditemukan (semua keluaran lewat `esc()`; dokumen cetak aman).
- **Kebijakan keamanan konten (CSP) production:** `script-src` masih `'unsafe-inline'` karena tiga skrip inline di `index.html`, 12 penangan inline, dan halaman cetak (`document.write` dengan skrip pencetak). Menghapusnya memerlukan memindahkan skrip ke berkas, mengganti penangan inline, dan nonce atau hash untuk jendela cetak ([[T-211-audit-kerangka-dan-standar-industri]]).
- **Dependensi:** 0 kerentanan di dependensi production; 4 di alat pengembangan (`supabase` CLI membawa `tar` rentan): hanya berjalan di mesin pengembang; perbarui setelah rilis mayor CLI (3.x) diuji.
- **Data pribadi di repo publik:** nama default penanda tangan SPK (Halimah, Muin M.K.) tertulis di kode sebagai bawaan; sebaiknya dipindah ke pengaturan Master Data (keputusan pemilik karena mengubah isi SPK lama).
- Proteksi password bocor Supabase belum aktif (paket berbayar), Redirect URL perlu diperiksa ([[T-047-konfigurasi-auth-supabase-produksi]]).

## 3. Kesenjangan terhadap standar sistem gudang dan logistik

Penilaian: ada, sebagian, belum. Prioritas: A (menjaga kebenaran data atau keamanan), B (efisiensi harian), C (perluasan).

| Kemampuan standar | Status | Prioritas | Catatan |
|---|---|---|---|
| Buku besar stok bertransaksi, tanpa ubah langsung, koreksi pembalik | ada | A | mutasi dan koreksi; tanpa hapus (migration 13) |
| Jejak audit siapa, kapan, apa | ada | A | `audit_log` pemicu database |
| Hak akses per peran dan per modul | ada | A | uji role dan akses |
| Pencegahan stok minus di database dan penimpaan bersamaan | sebagian | A | UI menolak; pemicu database ditunda ([[T-206-anti-stok-negatif-dan-penimpaan-bersamaan-draf-migration-17]]) |
| Backup terjadwal dan uji pulih | belum | A | [[T-061-backup-restore-drill-dan-rencana-rollback]] |
| Nomor dokumen berurutan dan unik | ada | A | invarian terpantau |
| Minimum, buffer, titik pesan ulang, usulan pembelian | ada | B | bahan baku, sparepart, barang jadi |
| PR, penerimaan sebagian bertaut dokumen | ada | B | PR bahan baku dan sparepart |
| Stock opname dengan lembar hitung dan berita acara | ada | B | opname terjadwal belum ([[T-112-opname-terjadwal-dan-rekonsiliasi-berkala]]) |
| Persetujuan bertingkat (PR, pengeluaran besar, SPK) | belum | B | hanya SPK Draft ke Terbit |
| Notifikasi stok di bawah buffer dan SPK jatuh tempo | belum | B | [[T-132-notifikasi-spk-jatuh-tempo-dan-stok-di-bawah-buffe]] |
| Pemindaian barcode atau QR (terima, keluar, opname) | belum | B | mempercepat dan mengurangi salah input di lapangan |
| Lokasi rak atau bin per item, lebih dari satu gudang | sebagian | B | kolom lokasi bebas; multi-lokasi belum ([[T-151-studi-kebutuhan-multi-site-dan-gudang-tambahan]]) |
| Pelacakan lot, nomor heat atau sertifikat material (plat) | belum | B | penting untuk mutu dan telusur material |
| Inspeksi penerimaan (QC) dan retur supplier | belum | B | status karantina dan reject |
| Pemesanan stok (reservasi) per SPK | sebagian | B | reservasi turunan ([[T-192-kebutuhan-material-dan-reservasi-stok]]) |
| Nilai persediaan dan harga pokok | belum | C | di luar cakupan (akuntansi di sistem lain) |
| Konversi satuan (lembar, kg, meter) | sebagian | C | berat per lembar dihitung dari massa jenis |
| Laporan dan dashboard manajemen | sebagian | C | KPI ada; dashboard manajemen belum ([[T-131-dashboard-manajemen-dan-kinerja-tim]]) |
| Aplikasi seluler atau mode luring | belum | C | tampilan HP rapi; PWA belum ([[T-152-prototipe-pwa-dan-mode-offline-bongkar-muat]]) |
| API dan integrasi dengan sistem lain | belum | C | [[T-122-impor-terjadwal-ppic-rm-dengan-laporan-galat]] |
| Tanda tangan elektronik dan nama bersama | sebagian | C | nama diingat per perangkat ([[T-201-nama-penanda-tangan-dokumen]]) |
| Pemantauan galat dan ketersediaan | belum | A | tidak ada pelaporan galat produksi (mis. Sentry) atau pemeriksaan kesehatan |

## 4. Praktik rekayasa (kerangka)

| Praktik | Status |
|---|---|
| CI wajib untuk merge (lint, unit, build, regresi UI) | ada setelah audit ini; belum teruji di GitHub sampai dirilis |
| Versi semantik dan CHANGELOG | CHANGELOG ada; versi paket masih 1.0.0 |
| Peta lingkungan dan alur rilis | ada ([[SISTEM_MAP]], [[RELEASE_CHECKLIST]]) |
| Pemisahan konfigurasi per lingkungan | ada (variabel Vite); Preview belum |
| Rahasia tidak di repo | ada; pemindaian rahasia aktif |
| Modularitas kode | belum: satu berkas 5.700 baris ([[T-141-modularisasi-app-js-bertahap-es-modules]]) |
| Pengujian unit logika inti (stok, SPK) | sebagian: fungsi di `app.js` belum dapat diuji unit |
| Pemantauan | belum |

## 5. Rencana pemenuhan standar (urutan usulan)

1. **A, sekarang:** rilis bertahap dengan cadangan ([[T-203-rilis-paket-gudang-dan-produksi-ke-production]], T-061); pemicu anti stok negatif setelah uji ([[T-206-anti-stok-negatif-dan-penimpaan-bersamaan-draf-migration-17]]); pemantauan galat dan pemeriksaan kesehatan.
2. **A, keamanan:** CSP tanpa `unsafe-inline`; nama default penanda tangan ke pengaturan; perbarui CLI Supabase.
3. **B, mutu data lapangan:** pemindaian barcode atau QR untuk terima, keluar, opname; nomor lot atau heat plat; inspeksi penerimaan dan retur.
4. **B, kontrol:** persetujuan bertingkat PR dan pengeluaran besar; notifikasi buffer dan jatuh tempo; opname terjadwal.
5. **Rekayasa:** modularisasi `app.js` (ES modules), pembersihan 34 variabel mati, uji unit untuk `calc()`, hitung cakupan uji aksi UI naik di atas 80 persen.
6. **C:** multi-lokasi, PWA luring, API, dashboard manajemen.

Setiap butir menjadi tugas di `tasks/` setelah pemilik memilih urutan.
