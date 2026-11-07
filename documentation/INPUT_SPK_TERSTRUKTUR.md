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
3. **Tahap berikutnya (routing)**: rute produksi per produk dan per bentuk diatur di Master Data (work center yang dilewati), aturan vendor per material (SPHC wajib vendor, stainless dan aluminium tidak), dan pengecualian per item. Bagian ini menutup kriteria terbuka [[T-174-produksi-multi-work-center-rute-antrian-kapasitas|T-174]]; pertanyaan yang perlu dijawab ada di [[HANDOFF]] bagian 5.

## 5. Uji

Unit: `tests/unit/bentuk.test.mjs` (11). E2E: `tests/e2e/spk-terstruktur.mjs` (20): bentuk per produk, nama dan berat otomatis, full hole, ganti bentuk, ganti tebal, finishing, type, produk, berat manual, simpan dan buka lagi, aksesori, produk tanpa kalkulator, lembar SPK.
