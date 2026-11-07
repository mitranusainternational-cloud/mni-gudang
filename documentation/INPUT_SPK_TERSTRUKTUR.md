---
type: design
status: active
updated: 2026-11-07
---

<img src="assets/logo-mni.png" alt="PT Mitra Nusa Internasional" width="190">

# Input item SPK terstruktur

Permintaan pemilik (2026-11-07): input SPK jangan lagi mengetik deskripsi bebas. Pilih section (produk, type, tebal, finishing), lalu tiap baris cukup memilih **bentuk** dan mengisi **ukuran** (W, H, L; untuk aksesori W, H, R). Nama item, spesifikasi, berat per pcs, berat per item, dan tonase muncul otomatis dari kalkulator berat, sehingga kesalahan ketik berkurang. Tugas: [[T-214-input-item-spk-terstruktur-dan-kalkulator-full-hole]]. Kerangka hitung berat: [[KALKULATOR_BERAT]].

## 1. Cara kerja

```text
Section: CABLE TRAY  TYPE STU  1.2  ELECTRO GALVANIZED     (judul kuning, tetap seperti biasa)
   │  produk + type menentukan bentuk apa yang boleh dipilih (dari kalkulator Excel)
   ▼
Baris:  Bentuk [Straight ▾]   Spesifikasi [STU · 1.2 mm · ELG] (otomatis)   Ukuran W[100] H[50] L[3000]   Lubang [Bawah ▾]
        Nama item  →  "Cable Tray W100xH50xL3000"   (otomatis)
        Berat/pcs  →  dari kalkulator (bertanda auto)      Berat/item = qty × berat/pcs      Total kg dan ton di dasar layar
```

- **Bentuk per produk:** Cable Tray, Perforated Cable Tray, dan Cable Ladder menawarkan Straight, Elbow 90, Tee, Cross, Inside Riser, Outside Riser, Reducer. Cover Tray menawarkan bentuk Cover. ACCS (Tray, Ladder, Duct) menawarkan 18 aksesori (Jointing, Fish Plate, Bracket, Hanger, Clamp, Separator, End Stop, Drop Out dan lainnya). Cable Duct, Support Tray, dan Wiremesh tidak punya kalkulator sehingga tetap teks bebas.
- **Ukuran yang diminta mengikuti bentuk:** Straight W H L; Elbow, Inside, Outside W H R; Tee W1 W2 W3 H R; Cross W1 sampai W4 H R; Reducer W1 W2 H; aksesori sesuai rumus (mis. Hanger Beam hanya W). Tebal, massa jenis, dan "jika W yang kecil" dihitung otomatis.
- **Spesifikasi otomatis:** type, tebal, dan finishing diambil dari section dan ditampilkan di setiap baris; mengganti section menghitung ulang semua baris di dalamnya (massa jenis mengikuti material: baja 7,85, stainless 7,93 atau 7,98, aluminium 2,70).
- **Full hole:** kalkulator terbaru (`kalkulator penghitung berat MNI include full hole.xlsx`) menambah kolom "Total Full Hole (Bawah+Samping)" hanya untuk **Straight tray (STU dan STC)**. Baris itu mendapat pilihan **Lubang: Bawah / Full hole**. Full hole menambahkan kata "Full Hole" pada nama item (agar workshop tahu) dan memakai berat full hole yang lebih ringan.
- **Berat manual:** bila pengguna mengetik berat sendiri, berat itu tidak ditimpa saat ukuran berubah (bertanda manual). Ukuran yang belum lengkap tidak pernah dihitung; sistem menampilkan "Isi ukuran: R".
- **Teks bebas tetap ada:** pilihan "Teks bebas" per baris untuk item di luar kalkulator, tempel dari Excel, dan SPK lama. SPK lama dibuka apa adanya (baris teks); baris baru di section yang dikenali memakai bentuk.

## 2. Data

Item SPK membawa tambahan `sb` (id bentuk), `dim` (ukuran W, H, L, R, W1 sampai W4) dan `lubang` ('full' bila full hole). `d` (deskripsi teks) tetap dihasilkan dengan format SPK lama, sehingga lembar SPK, Excel, surat jalan, vendor, dan pelacakan item (yang memakai `d`) tidak berubah. `ws='k'` menandai berat dari kalkulator. Tidak ada kolom atau tabel baru.

## 3. Katalog

Katalog diambil dari workbook dengan `node scripts/build-weight-catalog.mjs "<xlsx>"` dan **tidak ada di Git** (rumus perusahaan). Setelah workbook baru:

1. Bangun ulang katalog lokal (uji unit berat memeriksa 192 bentuk terhadap nilai tersimpan Excel: lulus).
2. **Unggah ulang di production**: Master Data, Katalog berat (super admin). Tanpa itu pilihan full hole tidak muncul karena katalog lama tidak memuat kolomnya.

Uji CI memakai katalog sintetis `tests/e2e/fixtures/katalog-berat-uji.json` (bukan rumus perusahaan).

## 4. Keputusan yang menunggu pemilik

1. ~~Default lubang~~ **Diputuskan 2026-11-07:** Perforated Cable Tray otomatis **Full hole** (pada bentuk yang punya kolom full hole: Straight STU/STC); produk lain Bawah. Pengguna tetap bisa mengganti ke Bawah; pilihan manual dipertahankan saat section diganti produk dan saat SPK dibuka lagi. Uji S-19.
2. **Full hole untuk bentuk selain Straight** (Elbow, Tee, dan seterusnya): kalkulator belum memilikinya; perlu rumusnya bila dibutuhkan.
3. **Tahap 2 (routing) dibangun 2026-11-07** dengan asumsi bawaan yang menunggu koreksi pemilik (lihat bagian 4a). Menutup sebagian kriteria [[T-174-produksi-multi-work-center-rute-antrian-kapasitas|T-174]].

### 4a. Routing dan vendor (tahap 2)

- **Master Data, tab Rute produksi:** centang work center internal yang dilewati per produk; urutan langkah mengikuti urutan Work Centre. Setiap centang langsung tersimpan di `master/rute_produksi`. Minimal satu work center. **Rute khusus bentuk** (mis. Cable Tray · Elbow 90 tanpa Punching) ditambah dari pilihan bentuk kalkulator dan mengalahkan rute produk dan aturan kata di deskripsi untuk baris terstruktur dengan bentuk itu.
- **Vendor mengikuti material dari judul section:** baja (SPHC) ke vendor sesuai finishing (ELECTRO = ELG, HOTDIP = HDG, POWDER = PDC); stainless (SS, STAINLESS, SUS) dan aluminium tanpa vendor; Non Finishing tanpa vendor.
- **Pengecualian per baris** di editor SPK: Ikut aturan / Wajib ke vendor / Tanpa vendor (`vv` pada item). "Wajib ke vendor" pada stainless hanya berlaku bila judul memuat finishing.
- **Peringatan:** baja tanpa finishing dan bukan Non Finishing menampilkan peringatan di baris (vendor tidak terbentuk); tidak memblokir simpan.
- **Asumsi yang perlu dikoreksi pemilik bila salah:** (a) SPHC Non Finishing = tanpa vendor; (b) rute per produk + bentuk, bukan per rentang ukuran; (c) pengecualian vendor diatur oleh siapa pun yang boleh mengedit SPK; (d) pilihan vendor per baris hanya tampil untuk baris terstruktur (produk berkalkulator).
- **Catatan data:** mock lokal hanya punya 6 work center (tanpa Shearing, Punching, CNC Laser); pada data nyata, work center di rute yang tidak ada di daftar aktif tampil sebagai label kuning dan tidak bisa dicentang.

## 5. Uji

Unit: `tests/unit/bentuk.test.mjs` (11). E2E: `tests/e2e/spk-terstruktur.mjs` (24: S-19 sampai S-23 untuk full hole otomatis, vendor per baris, tab Rute produksi); `tests/unit/rute.test.mjs` R-90 sampai R-95 untuk aturan material dan rute bentuk: bentuk per produk, nama dan berat otomatis, full hole, ganti bentuk, ganti tebal, finishing, type, produk, berat manual, simpan dan buka lagi, aksesori, produk tanpa kalkulator, lembar SPK.

## 6. Melihat di pratinjau lokal

Input terstruktur muncul hanya bila katalog berat terpasang. Di database katalog dipasang dari Master Data › Katalog berat. Untuk pratinjau lokal, jalankan mock dengan `VITE_LOCAL_MOCK=1 VITE_KATALOG_LOKAL=1` (memakai `src/lib/berat/catalog.json` lokal yang diabaikan Git). Uji otomatis berjalan tanpa flag ini (katalog sintetis).
