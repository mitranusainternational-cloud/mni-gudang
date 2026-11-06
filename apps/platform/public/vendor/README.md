# Pustaka pihak ketiga (dilayani dari aplikasi sendiri)

Dipakai untuk membuat PDF dan Excel di browser. Dilayani dari `/vendor/` supaya unduhan dokumen tidak bergantung pada CDN
(jaringan gudang bisa memblokirnya). Aplikasi mencoba berkas lokal lebih dulu, lalu CDN sebagai cadangan.

| Berkas | Pustaka | Versi | Lisensi | Sumber |
|---|---|---|---|---|
| `exceljs.min.js` | ExcelJS | 4.4.0 | MIT | cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0 |
| `jspdf.umd.min.js` | jsPDF | 2.5.1 | MIT | cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1 |
| `jspdf.plugin.autotable.min.js` | jsPDF-AutoTable | 3.8.2 | MIT | cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2 |
| `html2canvas.min.js` | html2canvas | 1.4.1 | MIT | cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1 |

Keaslian: tiap berkas diunduh dari cdnjs dan dari jsDelivr dan keduanya identik byte demi byte (2026-11-06).

SHA-256 (16 karakter pertama): exceljs 7e49da68588e250d · jspdf 98ccf17aa10c20bb · autotable 27a9c3b61843c631 · html2canvas e87e550794322e57.

Memperbarui versi: unduh berkas baru, bandingkan dua sumber, ganti berkas dan versi di tabel ini, lalu ubah URL di `apps/gudang-logistik/assets/js/app.js` (`loadExcelJS`, `loadPdf`, `loadH2C`).
