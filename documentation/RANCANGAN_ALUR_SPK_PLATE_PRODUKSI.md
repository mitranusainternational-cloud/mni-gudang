---
type: design
status: draft-diskusi
updated: 2026-11-09
---

# Rancangan alur SPK, kebutuhan plate, serah terima, dan produksi

Status: **draft untuk diskusi**. Lanjutan [[documentation/RANCANGAN_INPUT_SPK_DIMENSI]] (tahap input dan kg sudah dikerjakan sebagai T-222). Dokumen ini tidak memuat rumus atau konstanta perusahaan.

## 1. Temuan pemeriksaan (mock dengan katalog lokal, 2026-11-09)

| Hal | Hasil |
|---|---|
| Input W x H x L | Aktif bawaan. Cable Tray, Perforated, dan Ladder = Straight (kolom W, H, L, dan Lubang). Section ACCS menampilkan 25 komponen kalkulator (Elbow, Tee, Cross, Inside/Outside Riser, Reducer, Jointing, Fish Plate, Splice, Bracket, Hanger Beam, U Channel, Clevis, Cover Clamp, Separator, Hold Down, End Stop, Drop Out) dengan kolom W, H, R, W1 sampai W4, L. Cover memuat bentuk tutup. Aturan section bisa diubah di Master Data. |
| Kg otomatis | Baris menampilkan est dan real per pcs; footer menampilkan plate (est) dan barang jadi (real). |
| Kebutuhan plate saat SPK terbit | Muncul di lembar SPK: netto kg, bruto kg (faktor sisa potong), jumlah lembar, stok, dan status (Cukup, Kurang, Tanpa item RM). Syaratnya item bahan baku di Master Data punya ukuran dan jenis. |
| Antrian produksi | **Tidak muncul** bila nama langkah rute tidak sama dengan nama Work Centre di Master Data. Contoh: rute Shearing dan Punching, sedangkan master hanya CNC Cutting, Bending, Welding. Begitu Work Centre yang sesuai ada, antrian muncul otomatis (SPK 1003: Shearing › Punching › Bending › Vendor ELG, 10 siap dikerjakan). Kini ada banner peringatan di Produksi Hari Ini. |
| Serah terima plate gudang ke produksi | **Belum ada sebagai alur.** Yang ada hanya "Pakai untuk produksi" di Gudang Bahan Baku (pengeluaran bertanda SPK). Tidak ada daftar SPK yang menunggu plate, dan produksi tidak tahu plate sudah diserahkan atau belum. |
| Rute komponen kecil | Rute standar per produk ada dan bisa diubah per bentuk di Master Data. Komponen kecil belum punya rute yang ditetapkan tim (lihat bagian 3). |

## 2. Alur yang diusulkan

1. **SPK terbit** → kebutuhan plate dihitung (lembar dan kg, per bahan dan tebal) dan SPK masuk antrian **Serah terima plate**.
2. **Gudang Bahan Baku** melihat daftar "SPK menunggu plate": bahan, tebal, jumlah lembar, kg, dan stok. Tombol **Serahkan ke produksi** membuat dokumen pengeluaran (PK) tertaut SPK dengan lembar yang diserahkan. Bisa sebagian.
3. SPK berstatus **Menunggu plate**, **Plate diserahkan sebagian**, atau **Plate lengkap**. Status ini tampil di daftar SPK dan di antrian produksi.
4. **Produksi**: antrian per Work Centre muncul otomatis dari rute item (sudah ada). Mulai, selesai, dan catat per mesin (sudah ada). Progres terhitung per langkah sampai vendor dan kirim.
5. **Laporan**: kg estimasi (plate) dibanding kg real (barang jadi) per SPK, selisihnya menjadi susut dan sisa potong.

## 3. Rute per jenis produk (kondisi sekarang, bisa diubah)

| Jenis | Rute sekarang | Catatan |
|---|---|---|
| Cable Tray, Perforated | Shearing → Punching → Bending | rute standar produk |
| Cable Ladder | Shearing → Punching → Bending → Welding | rute standar produk |
| Cover | Shearing → Bending | aturan khusus (bisa Laser pengganti Shearing) |
| ACCS Tray, Ladder, Duct (fitting) | CNC Laser → Bending → Welding | rute standar produk |
| Clamp, Hanger | CNC Laser → Bending | aturan khusus |
| Jointing, Splice | Shearing → Punching | aturan khusus |
| Fish plate, bracket, separator, hold down, end stop, drop out, U channel, clevis | ikut rute ACCS | **belum ditetapkan tim** |

Mesin tiap Work Centre diatur di Master Data › Work Centre dan Mesin. Tipe, material, dan finishing diatur di Opsi SPK dan Katalog berat.

## 4. Yang perlu dibangun

1. **Matriks rute** di Master Data: baris produk dan komponen, kolom Work Centre, satu layar untuk mengatur semuanya, dengan validasi nama Work Centre.
2. **Antrian serah terima plate** di Gudang Bahan Baku dan status plate di SPK.
3. **Cek Data**: rute yang memakai Work Centre yang tidak ada, dan SPK terbit yang belum diserahi plate.
4. **Laporan susut**: estimasi dibanding real per SPK dan per bahan.

## 5. Keputusan yang diperlukan

Lihat pertanyaan di sesi diskusi: apakah serah terima plate wajib atau peringatan, rute komponen kecil, dan urutan pengerjaan.

## 6. Keputusan (2026-11-09)

- Serah terima plate: **peringatan saja**. Produksi tetap bisa mulai; SPK yang belum diserahi plate ditandai.
- Rute komponen kecil: **pakai usulan dulu** (ikut rute ACCS), dikoreksi lewat tabel rute di Master Data.
- Urutan: **matriks rute dulu**, lalu serah terima plate, lalu Cek Data dan laporan susut.

Hasil audit alur lengkap: [[documentation/AUDIT_ALUR_2026-11-09]].
