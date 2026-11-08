---
name: keterhubungan-data
description: Aturan keterhubungan data master, transaksi, dan kebutuhan material (plat) SPK di MNI Gudang & Logistik, dengan daftar cek silang sebelum perubahan dinyatakan valid. Gunakan sebelum mengubah master bahan baku, satuan, massa jenis, Master Data mesin, kebutuhan material SPK, reservasi, PR, atau koreksi mutasi.
---

# Keterhubungan data dan kebutuhan plat

Rujukan: `documentation/INDEKS_CEPAT.md`, `documentation/PRD_GUDANG.md`, `tasks/T-221-*.md`. Kode: `apps/gudang-logistik/assets/js/app.js` (baris kebutuhan material sekitar 781 sampai 810, dan `matReservasi`, `matKeluarKg`, `matSpkItems`).

## Rantai data (hulu ke hilir)

1. **Master Data bahan baku** (`rm`): item, ukuran `tebal x lebar x panjang`, satuan, jenis (grade), buffer, stok awal. Berat per lembar `kgLbr` dihitung dari ukuran dan massa jenis jenis di Master Data. Satuan `Lembar`, `Lbr`, atau bawaan lain tetap dihitung per lembar.
2. **SPK** (`spk.items`): `q` (qty total), `fg` dan `ambil` (qty dari stok barang jadi). Kebutuhan plat produksi = `q - ambil` (`ambilItem`). SPK stok tidak mengurangi.
3. **Status SPK yang ikut dihitung**: hanya `status === 'Terbit'` dan status turunan bukan `Selesai` atau `Batal`. Draft tidak masuk reservasi, KPI, atau analisa.
4. **Reservasi dan pengeluaran**: `matKeluarKg` memakai mutasi `keluar` bertanda SPK. Koreksi hanya dihitung bila membalik `keluar`; koreksi penerimaan (`masuk`) tidak menambah pemakaian SPK.
5. **PR bahan baku**: penerimaan tidak boleh melebihi sisa PR terkini (`q - qTerima`). Status PR dihitung ulang.

## Cek silang sebelum menyatakan valid

- [ ] Item baru dengan satuan bawaan form (`Lembar`) menghasilkan `kgPerLbr > 0` (`matRmSiap`).
- [ ] SPK dengan `ambil` mengurangi kebutuhan plat dengan jumlah yang sama (`matSpkItems`).
- [ ] SPK Draft dan Batal tidak menambah kebutuhan di KPI dan analisa.
- [ ] Koreksi penerimaan bertanda SPK tidak mengubah `matKeluarKg`.
- [ ] Penerimaan PR di atas sisa ditolak; penerimaan sesuai sisa menutup PR.
- [ ] Uji `kebutuhanplat` (KP-01..KP-05) dan regresi penuh 0 FAIL.

## Jangan

- Jangan menambah pengecekan satuan yang membuat item tertentu dilewati kebutuhan plat.
- Jangan membaca status SPK tanpa memeriksa `s.status` dan `sx.st` bersamaan.
- Jangan menyatakan selesai hanya dari mock. Catat tingkat bukti (`verified in browser` untuk mock).

## Batas yang masih terbuka (dari audit T-221)

Temuan logistik (SJ dari stok, pembatalan SJ, Bongkar Muat, siap kirim setelah rework) belum diperbaiki dan belum termasuk skill ini.
