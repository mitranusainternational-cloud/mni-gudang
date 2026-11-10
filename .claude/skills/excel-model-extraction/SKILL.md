---
name: excel-model-extraction
description: Membaca model hitung di workbook Excel (.xls atau .xlsx) milik perusahaan dengan aman: salinan, hanya baca, makro mati, daftar sheet, parameter, rumus, dan nilai tersimpan sebagai fixture uji. Gunakan sebelum membangun mesin hitung dari workbook baru atau saat workbook diperbarui.
---

# Membongkar model Excel dengan aman

## Aturan keamanan
- Selalu bekerja di **salinan** dalam folder sementara (bukan di folder sumber). Buka dengan `ReadOnly`, `UpdateLinks=0`, `DisplayAlerts=false`, `AutomationSecurity=3` (makro mati), `EnableEvents=false`.
- Workbook penawaran berisi harga per kg, biaya, dan margin: data komersial. **Jangan menyalin angka itu ke Git, vault, atau tangkapan layar.** Repo GitHub bersifat publik. Struktur dan rumus boleh dijelaskan; nilai harga dan biaya disimpan di `data/private-sources/` (diabaikan Git) atau di tabel `master` database setelah login.
- Berkas .xlsx dapat dibaca langsung (zip + XML) seperti `apps/platform/scripts/build-weight-catalog.mjs`. Berkas .xls (BIFF) dibaca lewat Excel COM di Windows; bila perlu .xlsx, `SaveAs` pada salinan.

## Langkah baku
1. **Peta workbook**: jumlah sheet, rentang terpakai, sheet tersembunyi, jumlah sel berumus (`SpecialCells(xlCellTypeFormulas)`), `HasVBProject`, nama rentang (885 nama di workbook penawaran banyak yang `#REF!`: abaikan, jangan diwarisi).
2. **Zona**: kepala (pelanggan, nomor, syarat), tabel baris, kolom hitung tersembunyi di kanan, parameter (harga per kg, tebal estimasi dan real, massa jenis, waste, harga baut), blok total (subtotal, diskon, PPN), catatan, dan blok biaya saat PO.
3. **Pola baris**: pilih satu baris per keluarga produk dan baca rumusnya lengkap (nilai dan rumus berdampingan). Catat konstanta yang ditanam di rumus (mis. lebar flens, jarak anak tangga, faktor tikungan); itu kandidat parameter bernama.
4. **Fixture emas**: untuk tiap bentuk, simpan masukan (dimensi, parameter) dan nilai yang dihitung Excel (kg estimasi, kg real, harga satuan). Mesin kita harus menghasilkan angka yang sama (selisih pembulatan saja).
5. **Temuan mutu**: tulis rumus yang rapuh (referensi mutlak ke sel parameter yang berbeda per keluarga, `NOW()`, pembagi nol saat qty kosong, teks harga yang ditanam di catatan, salinan sheet yang hanya beda parameter).

## Keluaran
Dokumen analisis di `documentation/` (struktur, rumus, temuan, tanpa angka komersial), fixture di folder privat, dan tugas di `tasks/`. Jangan mengubah workbook sumber.

Rujukan: [[documentation/KALKULATOR_BERAT]], [[documentation/ERP_QUOTATION_ANALISIS]].
