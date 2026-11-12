---
name: erp-flow-hulu-hilir
description: Kontrak data dan aturan alur hulu ke hilir MNI (Penawaran, PO, SPK, kebutuhan material, produksi, vendor, pengiriman, laporan) termasuk muat dari penawaran, snapshot saat PO, revisi, dan metrik estimasi lawan aktual. Gunakan saat menghubungkan modul atau merancang laporan dan monitoring operasional.
---

# Alur hulu ke hilir

```text
Penawaran (spesifikasi, qty, skenario harga)
   └─ estimasi: kg, harga, kebutuhan material, biaya
        └─ disetujui customer → PO  (snapshot: harga, berat, biaya plat, hot dip, labour, baut, trading)
             └─ SPK  ◄── "Muat dari penawaran" (item, spesifikasi, berat, due date)
                  ├─ kebutuhan material → reservasi bahan baku → PR bila kurang
                  ├─ produksi (rute, work center, hasil, reject, tonase)
                  ├─ vendor finishing (kirim, kembali, reject)
                  └─ pengiriman ke customer → selesai
Laporan: estimasi lawan aktual; ketepatan waktu; penggunaan material; margin
```

## Kontrak "muat dari penawaran"
- Masukan: penawaran berstatus **Disetujui** atau PO diterima. Keluaran: SPK Draft dengan item (deskripsi mengikuti pola yang dikenali parser berat, mis. `Cable Ladder W300xH100xL3000 mm`), jumlah, satuan, berat dari mesin harga, section menurut keluarga dan tebal, tautan `penawaran_id` dan nomor revisi.
- **Idempoten**: memuat ulang tidak membuat SPK kedua; yang ada diperbarui sebagai revisi bila penawaran berubah. Baris penawaran yang bukan produksi (jasa, transport, pembulatan) tidak menjadi item SPK.
- **Snapshot saat PO** disimpan tidak berubah: harga jual, berat estimasi, biaya per komponen. Perubahan skenario harga sesudahnya tidak mengubah snapshot.
- Customer, PO, sales, tanggal, due date turun dari penawaran; pengguna tetap boleh mengubah SPK (fleksibel) dan perubahan tercatat sebagai revisi SPK.

## Estimasi lawan aktual (monitoring)
| Ukuran | Estimasi (penawaran) | Aktual |
|---|---|---|
| Berat (kg) | berat estimasi | tonase dari catatan produksi dan pengiriman |
| Material (lembar atau kg) | kebutuhan dari mesin | pengeluaran gudang untuk SPK |
| Waste | waste estimasi | selisih kg masuk dan kg jadi |
| Biaya | biaya per komponen saat PO | pembelian dan biaya aktual bila dicatat |
| Waktu | target waktu proses | tanggal terbit, produksi, vendor, kirim |
| Margin | harga jual dikurangi biaya | berdasarkan nilai aktual |
Tampilkan selisih dan penyebab dugaan; jangan menyimpulkan tanpa data. Tonase dan hasil sudah tersedia di laporan produksi; hanya yang belum ada yang dicatat.

## Keadaan dan hak
Status penawaran: Draft, Terkirim, Revisi, Disetujui, Ditolak, Kedaluwarsa (berlaku satu minggu menurut catatan template). Hak akses per modul; harga dan biaya hanya terlihat untuk peran yang berhak (jangan tampil di tampilan produksi).

Rujukan: [[documentation/arsip/ERP_QUOTATION_ANALISIS]], [[documentation/PRD_PRODUKSI]], skill `erp-quotation-engine` dan `erp-module-boundary`.
