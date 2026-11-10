---
type: design
status: draft
updated: 2026-11-05
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Analisis workbook Brilliant Quotation dan rancangan modul ERP Penawaran

Pembacaan workbook penawaran Cable Tray dan Ladder (salinan, hanya baca, makro mati) untuk menjawab: apakah ia bisa menjadi **hulu** sistem sehingga SPK, material, dan monitoring turun dari penawaran. Pembacaan memakai skill `excel-model-extraction`. **Angka harga, biaya, dan margin tidak dicatat di sini** (repo publik); hanya struktur dan rumus. Evidence: `source-level` (isi workbook), belum ada kode.

## 1. Isi workbook (fakta)

| Hal | Hasil |
|---|---|
| Format dan ukuran | `.xls`, tiga sheet, tanpa VBA. Sheet utama sekitar 2.200 sel berumus. Rentang terpakai sampai baris 1.270 dan kolom 161, tetapi isi nyata hanya di kolom A sampai AZ, baris 1 sampai sekitar 470; sisanya sisa format. |
| Sheet | `SSM-Cable Support System`, `ketebalan ke DUA`, `ketebalan ke Tiga`: tiga versi dengan tata letak sama. Sheet utama memuat rumus terbaru; dua sheet lain memuat **versi rumus yang lebih lama** dengan parameter (tebal, harga per kg, waste, harga baut) berbeda (lihat bagian 10). |
| Produk | 192 produk per sheet = 6 keluarga × 32 bentuk: Ladder SLU, SLW, SLHD, SLHDC dan Tray STC, STU. Bentuk: lurus, elbow, tee, cross, riser dalam dan luar, reducer, tutup untuk semuanya, jointing, fish plate horizontal dan vertikal, splice plate, bracket, hanger, U channel, clamp, separator, hold down, end stop, drop out. |
| Nama rentang | 885 nama, banyak yang rusak (`#REF!`); tidak berguna dan tidak diwarisi. |

## 2. Tata letak satu sheet

1. **Kepala penawaran** (kolom B sampai T): kepada, alamat, telepon, fax, attention, proyek, tanggal (`=NOW()`), nomor penawaran, revisi, waktu pengiriman, pembayaran (DP dan pelunasan), franco, catatan.
2. **Tabel baris** (baris 15 sampai 423): tipe, nomor, deskripsi dengan dimensi (W, H, L, R), qty, satuan, harga satuan, jumlah.
3. **Kolom hitung** di kanan (V sampai AT): dua perhitungan berdampingan, **ESTIMASI** (tebal estimasi, waste sekitar 10%) dan **REAL** (tebal real, tanpa waste tambahan), masing-masing berat per pcs dan dikali qty.
4. **Parameter** (AV sampai AY): harga per kg, tebal estimasi dan real, massa jenis, waste estimasi dan real, harga baut, faktor sudut (30, 45, 60 derajat), serta daftar acuan harga per kg menurut tebal dan finishing yang **ditulis sebagai teks catatan**. Ladder dan tray memakai kolom parameter berbeda.
5. **Total**: subtotal, diskon (tetap 30% di rumus), dasar PPN, PPN 11%, total.
6. **Catatan penawaran, tanda tangan** (diketahui dan konfirmasi), dan **blok biaya saat PO** (plat, hot dip, labour, baut, trading) yang dihitung dari berat real.
7. Ada perhitungan margin dan selisih (titik margin tertentu, diskon maksimum) di sisi parameter.

## 3. Cara harga dihitung

`harga satuan = bulatkan_ke_ratusan( berat_estimasi × harga_per_kg ) + (jumlah_baut × harga_baut)`; baut hanya untuk aksesori. Berat estimasi dan real berasal dari rumus bangun datar tiap bentuk (rel samping, anak tangga dengan jarak tertentu, tikungan, tutup) dan memakai tebal, lebar, tinggi, panjang, dan radius dari deskripsi. Selisih estimasi dan real adalah ukuran margin pengaman.

## 4. Hubungan dengan yang sudah ada

Struktur ini **sama dengan kalkulator berat** yang sudah dipakai untuk SPK ([[KALKULATOR_BERAT]]): 6 keluarga × 32 bentuk = 192, estimasi dan real berdampingan. Penawaran adalah **model berat yang sama ditambah lapisan harga**. Akibatnya:

| Komponen | Status |
|---|---|
| Evaluator rumus Excel, mesin, parser teks ke bentuk dan dimensi | Ada (`src/lib/berat`), diuji; bisa dipakai ulang |
| Katalog rumus dimuat dari database setelah login | Ada untuk berat; ditiru untuk harga |
| Lapisan harga (skenario, pembulatan, baut, subtotal, diskon, PPN) | Baru |
| Modul Penawaran (daftar, lembar, revisi, cetak) | Baru |
| Muat dari penawaran ke SPK, snapshot saat PO | Baru |
| Kebutuhan material dan reservasi stok | Baru (jawaban untuk diskusi material SPK) |
| Monitoring estimasi lawan aktual | Sebagian ada (tonase, laporan produksi); sisanya baru |

## 5. Temuan mutu workbook (yang tidak dibawa ke sistem)

- Rumus diulang di setiap baris dengan konstanta tertanam; ukuran dan jarak anak tangga tidak punya nama.
- Parameter ladder dan tray ada di kolom berbeda; mudah tertukar.
- Tiga sheet **bukan** sekadar salinan dengan parameter berbeda: rumusnya sudah berbeda di 302 sel (bagian 10). Di sistem cukup **satu model rumus yang baku, banyak skenario parameter**.
- Acuan harga menurut tebal dan finishing hanya teks; sistem butuh tabel harga yang bisa dicari.
- Diskon dan PPN tertanam; kolom margin menampilkan galat bagi nol saat qty kosong; tanggal `=NOW()` berubah tiap dibuka; nama rentang rusak.
- Aluminium dan stainless hanya ada sebagai catatan harga per kg, belum sebagai model berat sendiri.

## 6. Jawaban: apakah bisa menjadi hulu ERP

**Ya, dan fondasinya sudah sekitar 70% ada.** Alurnya:

```text
Penawaran ─► estimasi (kg, harga, kebutuhan material, biaya) ─► disetujui / PO (snapshot)
   ─► SPK (muat dari penawaran) ─► reservasi material (PR bila kurang)
   ─► produksi ─► vendor ─► kirim ─► laporan: estimasi lawan aktual
```

Penawaran menjadi sumber SPK: item, spesifikasi, berat, customer, PO, dan due date turun otomatis; pengguna tetap bebas mengubah SPK. Kebutuhan material dihitung dari mesin yang sama (berat per item, lalu lembar dengan faktor sisa potong), sehingga diskusi pengurangan bahan baku otomatis menjadi lanjutan alami.

## 7. Arsitektur modul terpisah (lokal dulu)

- Mesin murni di `apps/platform/src/lib/erp/` (harga, total, kebutuhan material) memakai `src/lib/berat`; uji emas terhadap nilai Excel.
- Tabel baru (draf migration): `penawaran`, `penawaran_item`, `harga_skenario`; katalog dan harga di `master` terkompresi, dimuat setelah login (rumus dan harga adalah aset perusahaan; repo publik).
- Satu menu baru **Penawaran** dengan hak modul sendiri; tampilan lama tidak berubah. Tautan ke SPK lewat kolom referensi opsional baru yang baru ditayangkan pada tahap disetujui.
- Tangga penayangan E0 (mesin), E1 (modul lokal), E2 (muat dari penawaran), E3 (Supabase dev), E4 (Vercel preview), E5 (production setelah persetujuan eksplisit). Rinci di skill `erp-module-boundary`.

## 8. Risiko dan batas

| Risiko | Penanganan |
|---|---|
| Lingkup besar bertabrakan dengan jalur pilot yang belum dimulai (T-030 dan seterusnya) | Epic terpisah (E-16, rilis v1.2), tidak mengubah jalur kritis; kerja lokal paralel |
| Rumus dan harga perusahaan di repo publik | Katalog dan harga di database setelah login; fixture nyata di folder privat; repo privat tetap rekomendasi ([[AUDIT_KESIAPAN]]) |
| Sebutan "ERP penuh" terlalu luas | Cakupan awal: Penawaran, estimasi, SPK, material, monitoring; akuntansi, faktur pajak, penggajian di luar cakupan sampai ada keputusan; cek tumpang tindih dengan sistem lain yang dipakai perusahaan |
| Angka tidak cocok dengan Excel | Uji emas per bentuk sebelum modul dipakai |
| Pengguna menolak layar yang rumit | Isian minimal, katalog otomatis, pratinjau, cetak rapi; tinjau dengan tangkapan layar |

## 9. Jawaban pemilik (2026-11-06)

| # | Pertanyaan | Jawaban | Konsekuensi |
|---|---|---|---|
| 1 | Batas dengan Antlia | Sistem ini menangani penawaran sampai produksi (penawaran, estimasi, SPK, material, produksi, vendor, kirim, monitoring); akuntansi dan faktur tetap di sistem lain | Tidak ada modul faktur atau piutang di E-16 |
| 2 | Pembuat dan nomor | Sales membuat; nomor otomatis mengikuti format lama (urutan.KODE/bulan/tahun); revisi bernomor Rev. tanpa mengubah nomor dasar | Hak modul penawaran untuk peran Sales; penomoran dengan kunci atomik seperti dokumen lain |
| 3 | Skenario per penawaran | Boleh beberapa varian (A, B, C) dalam satu penawaran; customer memilih satu; SPK dimuat dari varian terpilih | Tabel varian di penawaran; status dan pemilihan varian |
| 4 | Produk di luar workbook | Mulai dari 6 keluarga di workbook; produk lain menyusul setelah rumusnya ada | Katalog awal 192 bentuk; baris bebas bukan bagian tahap awal |
| 5 | Diskon dan persetujuan | Batas diskon per peran; di atas batas perlu persetujuan sebelum penawaran dikirim | Tabel batas diskon per peran; status Menunggu persetujuan; penyetuju tercatat |
| 6 | Data uji | Nilai hitung workbook ini menjadi pembanding (uji emas); angka nyata tetap di folder privat | Tidak perlu penawaran lama tambahan pada tahap E0 |

Pertanyaan yang masih terbuka: nilai batas diskon per peran dan siapa penyetujunya (diisi saat T-190), serta kode pada nomor penawaran (diambil dari format lama).

Tugas: [[roadmap/epics/E-16-erp-penawaran-estimasi-dan-monitoring|E-16]], [[T-187-bedah-workbook-quotation-dan-rancang-modul-erp]].

## 10. Hasil T-189: mesin harga dan uji emas (2026-11-06)

Mesin murni `apps/platform/src/lib/erp/harga.js` (memakai evaluator rumus yang sama dengan kalkulator berat) dan pembangun katalog `scripts/build-quote-catalog.mjs`. Katalog, skenario, dan nilai pembanding Excel diabaikan Git (rumus dan harga perusahaan). Bukti: unit (22 uji; 15 di antaranya sintetis dan berjalan di CI) dan uji emas terhadap Excel di mesin ini.

| Pemeriksaan | Hasil |
|---|---|
| Skenario utama: 192 bentuk, 2.195 nilai rumus (berat estimasi, berat real, harga satuan, dan kolom antara) | **Sama dengan Excel**, 0 selisih |
| Total: subtotal, diskon, dasar, PPN, total, kg estimasi dan real (qty uji di 9 baris) | Sama dengan Excel |
| Biaya saat PO: plat, hot dip, labour, modal, rasio modal, selisih, harga titik 85 | Sama dengan Excel |

### Temuan workbook yang harus diketahui
1. **Cacat rujukan baris lain.** Pada SLW Horizontal Cross Equal Cover, kolom AJ merujuk sel baris lain (J107), bukan radius baris sendiri seperti bentuk setaranya di SLU. Hasil Excel kebetulan benar pada radius 300 dan salah pada radius lain. Mesin kita memperbaikinya (tercatat di katalog dan diuji).
2. **Angka tetap tersembunyi.** Enam bentuk Straight Reducer memakai angka tetap di kolom AB (di luar kolom ukuran) yang dirujuk rumus; mesin membawanya sebagai konstanta bentuk.
3. **Dua kolom parameter.** Sheet utama memakai kolom AW (ladder) dan AY (tray dan aksesori) untuk parameter yang sama; dua sheet lain hanya punya AW. Mesin memakai AW bila AY kosong.
4. **Dua sheet lain memuat rumus lebih lama.** Dibanding sheet utama, 302 sel rumus berbeda (434 hanya beda rujukan parameter, sisanya konstanta atau bentuk rumus). Bila rumus sheet utama dipakai dengan parameter sheet lain, 6 dari 192 harga satuan berbeda dari Excel sheet itu, dan 5 bentuk (Cover Clamp Heavy Duty) memakai ukuran berbeda. Selisih terbesar sekitar 47%: **Straight Reducer** di dua sheet lama dihitung dua kali lipat berat rel (rumus mengalikan dua pada angka yang sudah dua sisi), sehingga harganya hampir dua kali. Hold Down Clamp (SLW) dan Cover Clamp (SLHD, SLHDC) berbeda 10% sampai 43%.

### Keputusan pemilik (2026-11-06): rumus sheet utama baku; keputusan semula yang diminta
- **Rumus mana yang baku?** Usulan: rumus sheet utama (paling baru, sudah memperbaiki Reducer). Dua sheet lain tetap menjadi sumber **parameter skenario** saja. Mohon konfirmasi bahwa harga Reducer, Hold Down Clamp, dan Cover Clamp di dua sheet lama tidak lagi dipakai.
- Bila pemilik justru ingin hasil dua sheet lama dipertahankan persis, rumusnya disimpan sebagai versi rumus tersendiri (lebih rumit); belum dilakukan.

Tugas: [[T-189-mesin-harga-penawaran-dan-uji-emas]].

**Keputusan:** pemilik menetapkan rumus sheet utama sebagai baku. Dua sheet lain hanya menjadi sumber parameter skenario; harga lama di sana untuk Straight Reducer, Hold Down Clamp, dan Cover Clamp tidak dipakai. Dicatat di [[documentation/DECISIONS]].
