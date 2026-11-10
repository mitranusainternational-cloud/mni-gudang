---
name: gudang-stok-flow
description: Aturan stok, mutasi, dokumen, buffer, tren, SPK stok, dan penjaga hasil produksi untuk Gudang Bahan Baku, Barang Jadi, dan Sparepart MNI. Gunakan sebelum mengubah modul gudang, SPK stok, pengiriman, atau dokumen mutasi.
---

# Alur stok gudang dan SPK stok

Rujukan: `documentation/PRD_GUDANG.md` (aturan), `documentation/PETA_MODUL.md` (hulu ke hilir). Kode: `apps/gudang-logistik/assets/js/app.js`.

## Model data

- Stok tidak disimpan: `calc().stock[g][id]` = `stokAwal` + jumlah `mutasi.delta`. `mutasi.gudang` ∈ `rm`, `fg`, `sp`; `jenis` ∈ masuk, keluar, opname, koreksi; `spk` (id SPK), `noDok`, `pihak`, `ref`, `ket`.
- Koreksi = transaksi pembalik (`koreksiDari`); tidak ada hapus. Item: nonaktif (`aktif=false` atau `data.aktif`), bukan hapus.
- Item: `rm` (plat), `fg` (produk; `buffer` di `data`), `sp` (sparepart; `min`, `buffer`). PR: koleksi `pr`, sparepart bertanda `gudang='sp'`.
- SPK stok: `spk.stokReq=true`, customer `STOK MNI`, tiap baris `fg` = id produk, dibuat `spkStokBuat()`.

## Fungsi kunci

| Fungsi | Peran |
|---|---|
| `mvForm(g,j,item,prId)` | form masuk, keluar, opname; validasi stok, SPK, dan penjaga hasil produksi untuk SPK stok |
| `nextDocNo(kind,tgl)` + `DOCFMT` | nomor dokumen (RCV, PK, BJ-M, BJ-K, SP-M, SP-K, SP-OPN, PR, OPN) |
| `mvDoc`, `mvDocFg`, `mvDocSp` | model dokumen; `printMvDoc`, `exportMvXlsx` mencetak lewat `askSigners` |
| `gudangMutasi(g)` | riwayat mutasi sp dan fg (filter jenis, periode, SPK) |
| `movAgg`, `trenLabel`, `stockSeries`, `trenPanel`, `itemTrenHtml` | tren (ambang 25 persen; Data baru bila riwayat < 45 hari) |
| `fgSug`, `fgRencana`, `fgSpkPickForm`, `fgTerimaSpk` | rencana produksi, ceklis produk, SPK stok, terima di gudang jadi |
| `spSug`, `spBeli`, `spPrNewForm` | usulan dan PR sparepart |
| `fgSiapMap(s)`, `sisaLine(l,mode)`, `checkCap` | penjaga: siap = produksi efektif − di vendor + kembali dari vendor |
| `spkJn(s)`, `stLbl(s,stage)` | filter Semua/Customer/Stok dan label posisi SPK stok |

## Aturan yang tidak boleh dilanggar

1. Barang jadi dari SPK stok hanya diterima bila SPK terbit dan sebesar hasil produksi siap; SPK stok **tidak** dikirim ke customer (`spkSelect(...,noStok=true)` di form surat jalan).
2. Kirim ke customer dibatasi ke hasil produksi siap; override "kirim lebih" wajib keterangan.
3. Keluar tidak boleh melebihi stok sistem; salah input diperbaiki dengan koreksi.
4. Setiap pergerakan punya nomor dokumen dan, bila ada SPK, tertaut ke SPK; riwayat menampilkan SPK customer atau "untuk stok gudang".
5. Dokumen berbaris tanda tangan harus lewat `askSigners`; tambah kunci `DOCFMT` untuk jenis dokumen baru.
6. Data nyata (stok, harga) tidak masuk Git; impor lewat aplikasi (contoh Impor Excel sparepart).
7. Tampilan HP: tabel gudang berupa kartu (`table.spt`, `table.fgt`, `table.spo`) tanpa gulir samping.

## Setelah mengubah

`node scripts/extract-app.js`, regresi penuh dan unit 0 FAIL (skill `e2e-regression`), tambahkan uji di `tests/e2e/sparepart.mjs`, perbarui PETA_MODUL dan PRD_GUDANG, lalu skill `vault-progress`.
