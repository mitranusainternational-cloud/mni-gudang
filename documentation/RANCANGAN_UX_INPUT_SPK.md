---
type: design
status: disetujui-dibangun
updated: 2026-11-10
---

# Rancangan UX input SPK: ringkas, berat langsung terlihat

Status: **disetujui pemilik 2026-11-10 dan dibangun (T-226)**. Melengkapi [[documentation/RANCANGAN_INPUT_SPK_DIMENSI|RANCANGAN_INPUT_SPK_DIMENSI]] (skema data). Dokumen ini hanya membahas layar: apa yang user lihat dan isi, dan kapan berat muncul.

## 1. Masalah di layar sekarang (dari tangkapan layar editor SPK 1011)

1. **Satu baris memuat terlalu banyak kolom**: No, bentuk, spesifikasi (chip STU, 1.2 mm, ELG, lalu dropdown "Ikut aturan"), W, H, L, lubang, catatan merah, qty, satuan, dari stok (dropdown, tombol "Ambil dari stok", dan teks bantu), berat/pcs, berat/item, keterangan, hapus. Tabel harus digeser ke samping.
2. **Informasi yang sama diulang**: header section sudah memilih STU, 1.2, dan ELG. Setiap baris mengulang chip yang sama, dan banner kuning mengulang judulnya lagi.
3. **Berat terpisah dan kecil**: nilai berat/pcs ada di sel kolom, "est" dan "real" muncul sebagai teks abu-abu kecil, lalu berat/item di kolom lain. User tidak bisa melihat dengan cepat berapa plate yang diambil dan berapa barang jadinya.
4. **Berat/pcs bisa diketik tetapi juga terhitung otomatis**. User tidak tahu mana yang dipakai.
5. **Kolom berubah per section** (R, W1 sampai W4 hanya di ACCS), sehingga mata harus menyesuaikan tiap kali pindah section.
6. **"Dari stok" membingungkan**: pesan "Tidak ada stok cocok · produksi semua" muncul di banyak baris, dan tombol "Ambil dari stok" terpisah dari dropdown.
7. **Total di footer kecil** (1.820,41 Kg dan plate 2.525,27 Kg), padahal itu angka utama SPK.

## 2. Prinsip

- **Satu baris = satu hal yang diisi user**: bentuk, dimensi, qty. Sisanya dihitung.
- **Berat terlihat tanpa menggulir**: dua angka tebal per baris (Kg estimasi dan Kg real total), dan satu ringkasan tetap di bawah layar.
- **Pengaturan yang diwarisi cukup sekali**: keluarga, tebal, dan finishing di header section. Baris tidak mengulangnya.
- **Yang jarang dipakai disembunyikan**, bukan dihapus: catatan merah, keterangan, dan stok.
- **Berat tidak diketik langsung**. Berat hanya dihitung dari dimensi. Pengecualian (lihat pertanyaan A).

## 3. Susunan baris (usulan)

| No | Bentuk dan nama | W | H | L | Qty | Dari stok | Kg/pcs | Kg est total | Kg real total | ⋯ |
|---|---|---|---|---|---|---|---|---|---|---|

- **Bentuk dan nama**: bentuk dipilih dari katalog, nama item tersusun otomatis (contoh: "Cable Tray Elbow 90 W300xH100xR300").
- **W, H, L, R, W1 sampai W4**: hanya kolom yang dipakai bentuk itu. Kolom lain tidak ditampilkan dalam baris itu, jadi tabel tidak melebar. Bila section punya beberapa bentuk, tiap baris menampilkan dimensinya sendiri dengan label kecil di sel.
- **Dari stok**: angka (jumlah yang diambil dari stok barang jadi), default 0. Bila ada stok cocok, muncul tanda kecil "stok 12" di sebelahnya. Tidak ada dropdown dan tidak ada tombol terpisah.
- **Kg/pcs**: satu angka, dengan keterangan "est X · real Y" di bawahnya dan bisa dibaca.
- **Kg est total** (plate yang diambil, sudah dikurangi stok) dan **Kg real total** (barang jadi): dua kolom tebal, selalu tampil.
- **⋯**: membuka catatan merah, keterangan, dan lubang (standar atau full). Baris tanpa isian tambahan tampak bersih.

Bila dimensi kurang atau di luar katalog, sel berkata apa yang kurang (mis. "isi H"), bukan kosong.

## 4. Header section

Satu baris: `Section 1 · [Cable Tray ▾] · [STU ▾] · [1.2 mm ▾] · [ELG ▾]`, lalu satu baris kecil berisi ringkasan section: jumlah item, Kg est, Kg real. Banner kuning dihapus; judul otomatis ditampilkan sekali di ringkasan section (lihat F-13 di audit).

Pilihan finishing di sini menentukan vendor secara otomatis ("→ vendor ELG"). Chip vendor per baris dihapus.

## 5. Ringkasan berat (sticky)

Panel tetap terlihat di bawah layar saat menggulir:

```
Kg est (plate)   1.820 Kg   ≈ 2.525 Kg plate    ← diambil dari gudang bahan baku
Kg real (WIP)    1.820 Kg                         ← barang jadi siap kirim
Stok dipakai     12 pcs    (tidak perlu plate)
Lembar plate     ~ 6 lembar 1.2 x 1200 x 3000
```

Setiap perubahan qty, dimensi, atau stok langsung memperbarui angka ini. Ringkasan juga menampilkan jumlah per section, supaya user tahu section mana yang berat.

## 6. Yang tidak berubah

- Rumus dan katalog tetap dari Master Data. User tidak melihat rumus.
- Kolom dan logika kebutuhan plate (`matSpkItems`) tetap memakai kg estimasi, sesuai rancangan skema.
- Lembar SPK (HTML, PDF, Excel) tetap menampilkan kedua kg, seperti sekarang.
- Teks bebas tetap ada di menu bentuk, tetapi tidak menjadi pilihan utama.

## 7. Pertanyaan untuk pemilik (keputusan sebelum kode)

A. **Berat boleh diubah manual?** Usulan: tidak, dan bila perlu, pakai tombol "Atur manual" yang wajib diberi alasan dan dicatat. Atau cukup dihitung saja?
B. **Dari stok sebagai angka** (usulan) atau tetap dropdown seperti sekarang?
C. **Kg est dan real di setiap baris** (usulan: keduanya tampil), atau real saja di baris dan est hanya di ringkasan?
D. **Layar lama**: diganti langsung, atau tetap bisa dipakai lewat bendera selama masa uji?

## 8. Pengujian yang diusulkan

- Uji e2e input baris: pilih bentuk, isi W H L, lalu Kg est dan real terisi tanpa menekan tombol apa pun.
- Uji ringkasan: menambah qty atau stok langsung mengubah total dan kebutuhan plate.
- Uji tampilan: tidak ada kolom yang tidak dipakai bentuk itu, dan tabel tidak menggulir horizontal pada lebar layar normal.
- Regresi penuh 0 FAIL, lint 0 error, dan bukti dicatat sebagai `verified in browser` (mock).

## 9. Fase yang diusulkan

1. Setujui pertanyaan A sampai D.
2. Buat ulang susunan baris dan header section di balik bendera, uji mock.
3. Tambah ringkasan sticky dan ubah tampilan baris SPK lama.
4. Hapus duplikasi (chip vendor, banner, dropdown stok) setelah uji lolos.

## 10. Keputusan pemilik dan hasil (2026-11-10)

- A: berat tidak diketik, hanya dihitung. Dibangun: kolom Kg/pcs terkunci bila katalog terpasang; manual hanya untuk Teks bebas atau tanpa katalog.
- B: stok sebagai angka, dengan tombol Pakai stok. Produk lain dipilih di menu ⋯.
- C: Kg est (permintaan plate ke Gudang Bahan Baku) dan Kg real (kirim ke vendor) tampil keduanya di baris, section, dan ringkasan.
- D: layar baru menggantikan yang lama (layout lama tetap ada di balik pengaturan untuk suite uji lama).
- Tambahan: user lama menyukai input teks. Deskripsi yang diketik atau ditempel dikenali otomatis (bentuk dan ukuran), dan ada tombol Tempel daftar dari Excel per section.

Bukti: [[tasks/T-226-ux-input-spk-ringkas-berat-otomatis|T-226]].
