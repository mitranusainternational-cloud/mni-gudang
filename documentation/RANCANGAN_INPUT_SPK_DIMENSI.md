---
type: design
status: draft-diskusi
updated: 2026-11-09
---

# Rancangan input SPK per dimensi (W, H, L) dengan KG estimasi dan KG real

Status: **draft untuk diskusi, belum ada kode**. Tujuan: menyepakati skema sebelum dikembangkan. Rumus perusahaan sengaja tidak dicantumkan di dokumen ini (repo publik); hanya strukturnya.

## 1. Kondisi sekarang (dari kode dan layar)

- Baris SPK default **Teks bebas**. Kolom dimensi (W, H, L) baru muncul setelah memilih bentuk (`edKolomItem`, `app.js` sekitar baris 4535). Akibatnya baris yang Anda lihat hanya berisi deskripsi, qty, dan berat per pcs manual.
- Item hanya menyimpan satu nilai berat (`w`, berat per pcs). Tidak ada pemisahan antara berat plate yang diambil dan berat barang jadi.
- Kebutuhan plat (`matSpkItems`, `kelompokKebutuhan`) memakai `w` itu. Jadi angka yang dipakai untuk pengambilan plate belum jelas bedanya dengan angka barang jadi.
- Mesin hitung berat sudah ada (`src/lib/berat`), dengan katalog rumus per keluarga dan bentuk. Katalog diunggah dari Master Data (tidak di-bundle), dan berkasnya di-ignore Git.

## 2. Definisi (sesuai permintaan)

| Istilah | Arti | Dipakai untuk |
|---|---|---|
| **KG estimasi** | Tonase plate yang diambil untuk produksi | Kebutuhan dan pengambilan plate, PR, reservasi |
| **KG real** | Tonase barang jadi (WIP) yang siap dikirim ke vendor finishing atau customer | Tonase siap kirim, nilai barang jadi, rekap pengiriman |

Pemetaan ke workbook (perlu dikonfirmasi, lihat pertanyaan A): KG estimasi = total setelah lubang dikurangi, pada sisi plate kosong. KG real = total setelah lubang dikurangi, setelah susut tekuk. Keduanya sudah tersedia di sheet tiap keluarga.

## 3. Skema data item SPK (usulan)

Setiap baris item menyimpan:

- `keluarga`: STU, STC, SLU, SLW, SLHD, SLHDC (dari header section).
- `bentuk`: kunci bentuk dari katalog (mis. STRAIGHT, ELBOW, TEE, CROSS, INSIDE, OUTSIDE, COVER, REDUCER, RISER).
- `dim`: nilai dimensi sesuai bentuk, dengan nama dari katalog (W/H/L, atau R, W1 sampai W4 untuk fitting).
- `tebal`, `bj`, `finishing`: dari header section, bisa ditimpa per baris bila perlu.
- `lubang`: `standar` atau `full` (lihat pertanyaan C).
- `kgPcsEst` dan `kgPcsReal`: hasil hitung, disimpan supaya laporan tidak bergantung pada katalog yang berubah.
- `qty`, `ambil` (qty dari stok barang jadi), `satuan`, `keterangan`.
- `w` (lama) tetap ada sebagai alias `kgPcsEst`, supaya SPK lama tidak rusak.

Turunan:

- `kgEstTotal = kgPcsEst x (qty - ambil)` untuk kebutuhan plate (bagian stok tidak butuh plate baru).
- `kgRealTotal = kgPcsReal x qty` untuk tonase barang jadi.

## 4. Layar input (usulan)

Kolom selalu tampil, tanpa memilih mode dulu:

`No | Bentuk | W | H | L | (kolom tambahan sesuai bentuk: R, W1–W4) | Tebal | Qty | Satuan | Dari stok | Kg/pcs estimasi | Kg/pcs real | Kg estimasi total | Kg real total | Keterangan`

- Default baris di section Cable Tray / Perforated / Ladder: bentuk STRAIGHT. Di section ACCS: pilih fitting dari daftar. Di section COVER: pilih cover.
- Header kolom menyesuaikan bentuk dari katalog, sehingga fitting tidak perlu kolom kosong.
- Kg per pcs terhitung otomatis saat W, H, L terisi. Bila dimensi kurang atau di luar rentang katalog, sel menampilkan alasan, bukan angka kosong.
- Teks bebas tetap ada sebagai pilihan di menu bentuk, tetapi bukan default. Baris teks bebas tidak masuk kebutuhan plate sampai diberi kg.
- Footer SPK menampilkan dua total: **Kg estimasi (plate)** dan **Kg real (barang jadi)**.
- Kolom "Dari stok" tetap seperti sekarang. Bila stok cocok, qty stok mengurangi kebutuhan estimasi.

## 5. Keterhubungan dengan modul lain

1. **Kebutuhan material**: `matSpkItems` dan `matReservasi` memakai `kgEstTotal`, bukan `w` lama. Ini menutup celah temuan audit sebelumnya.
2. **Stok barang jadi**: tonase barang jadi untuk stok memakai `kgRealTotal`. Nilai stok di laporan memakai satuan kg real.
3. **Surat jalan dan siap kirim**: tonase kirim memakai `kgRealTotal` per baris yang sudah siap.
4. **Master Data**: daftar bentuk dan rentang dimensi tetap dibaca dari katalog Master Data. Admin mengunggah katalog. Pengguna biasa hanya mengisi dimensi.
5. **Dokumen SPK**: lembar SPK menampilkan kedua kg. Format formulir tetap (lihat pertanyaan E).

## 6. Pengujian (wajib sebelum dinyatakan valid)

- Uji unit mesin hitung terhadap nilai tersimpan dari workbook, untuk setiap keluarga dan bentuk. Nilai uji **tidak** masuk Git: fixture sintetis di repo, dan nilai nyata dibaca dari berkas privat di luar repo.
- Uji e2e input baris baru: kolom selalu tampil, default STRAIGHT, kg terisi otomatis, dan kebutuhan plate berubah saat `ambil` diisi.
- Uji regresi penuh 0 FAIL, lint 0 error, dan `sync-vault` OK.
- Bukti tetap dicatat sebagai `verified in browser` (mock) sampai diuji dengan katalog perusahaan dan di Supabase.

## 7. Fase yang diusulkan

1. Skema dan fungsi murni (kg estimasi dan real per bentuk), dengan uji unit. Tanpa perubahan UI.
2. Layar input baru di belakang fitur bendera, uji mock.
3. Hubungkan ke kebutuhan plate, reservasi, dan stok.
4. Dokumen dan tonase siap kirim.
5. Verifikasi di Supabase, lalu rilis bertahap sesuai `release-pipeline`.

Migrasi data: SPK lama dibiarkan. Item lama tanpa `kgPcsReal` ditampilkan dengan tanda "belum dihitung ulang" dan tidak mengubah kebutuhan plate, sampai pengguna membukanya.

## 8. Pertanyaan untuk diputuskan

- **A. Pemetaan kg.** Apakah KG estimasi = total setelah lubang pada plate kosong, dan KG real = setelah susut tekuk juga? Mohon konfirmasi dengan contoh satu item dari workbook.
- **B. Cakupan bentuk tahap pertama.** Straight dan cover saja dulu, atau langsung fitting (elbow, tee, cross, riser, reducer)?
- **C. Lubang.** Pilihan `standar` atau `full` ditentukan per item atau per SPK? Workbook memisahkan dua mode itu.
- **D. Lokasi katalog.** Tetap diunggah dari Master Data (sekarang), atau disimpan sebagai tabel di database supaya bisa diversi?
- **E. Lembar SPK.** Cukup menampilkan dua total, atau setiap baris juga menampilkan kg estimasi dan real?

## 9. Catatan keamanan data

- Rumus, konstanta, dan nilai uji dari workbook tidak masuk Git. Katalog tetap di-ignore (`.gitignore` baris 34).
- Dokumen ini tidak memuat konstanta perusahaan. Jangan menambahkannya saat merevisi.

## 10. Keputusan (2026-11-09)

- A. Pemetaan kg: dikonfirmasi benar seperti bagian 2.
- B. Cakupan tahap pertama: straight dan cover. Fitting menyusul.
- C. Mode lubang: per item.
- E. Lembar SPK cetak: dua total saja di footer.
- D. Lokasi katalog: belum diputuskan (tetap Master Data untuk sekarang).

Lanjutan alur (serah terima plate, rute, antrian produksi): [[documentation/RANCANGAN_ALUR_SPK_PLATE_PRODUKSI]].
