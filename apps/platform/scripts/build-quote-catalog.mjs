// Membangun katalog harga penawaran dari workbook penawaran (xlsx hasil simpan salinan .xls).
//   node scripts/build-quote-catalog.mjs "<jalur xlsx>"
// Hasil (semuanya diabaikan Git karena memuat rumus dan harga perusahaan):
//   src/lib/erp/katalog-harga.json      rumus per bentuk apa adanya, nama masukan, kolom keluaran, alamat parameter
//   src/lib/erp/skenario-harga.json     nilai parameter tiap skenario (tiap sheet): harga per kg, tebal, waste, baut, ...
//   tests/unit/erp-excel-expected.json  masukan contoh dan nilai tersimpan Excel per bentuk per skenario (uji emas)
// Rumus tidak ditulis ulang: katalog memuat teks rumus Excel dan dievaluasi oleh src/lib/berat/formula.js.
import fs from 'node:fs';
import { bacaXlsx, colNum, splitAddr } from './lib/xlsx-baca.mjs';

const file = process.argv[2];
if (!file) { console.error('Pemakaian: node scripts/build-quote-catalog.mjs "<xlsx>"'); process.exit(2); }
const { sheets } = bacaXlsx(file);

const AWAL = 16, AKHIR = 423;
const slug = (s) => String(s).toUpperCase().replace(/\s+/g, ' ').trim();
const idDari = (s) => slug(s).replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
const str = (c) => (c && typeof c.v === 'string' ? c.v.trim() : '');
const num = (c) => (c && typeof c.v === 'number' ? c.v : null);

function bacaBentuk(cells) {
  const out = [];
  for (let r = AWAL; r <= AKHIR; r++) {
    const no = cells['B' + r];
    if (!no || typeof no.v !== 'number' || no.f) continue;
    const judul = str(cells['C' + (r - 1)]);
    const keluarga = slug(str(cells['A' + r]) || str(cells['A' + (r - 1)])).split(' ')[0];
    // masukan = angka tetap di kolom C..N yang punya judul teks di sebelah kirinya
    const masukan = {}; const contoh = {};
    for (let n = 3; n <= 14; n++) {
      const kol = String.fromCharCode(64 + n); const c = cells[kol + r];
      if (!c || c.f || typeof c.v !== 'number') continue;
      const kiri = str(cells[String.fromCharCode(63 + n) + r]);
      const nama = (kiri || 'x' + kol.toLowerCase()).toLowerCase().replace(/\s+/g, '');
      masukan[kol] = nama; contoh[nama] = c.v;
    }
    // rumus: seluruh sel berumus pada baris (kolom O sampai ke kanan)
    const rumus = {}; const nilai = {};
    for (const addr of Object.keys(cells)) {
      const [kol, rr] = splitAddr(addr);
      if (rr !== r || colNum(kol) < colNum('O') || !cells[addr].f) continue;
      rumus[kol] = cells[addr].f; nilai[kol] = cells[addr].v;
    }
    const param = [...new Set(Object.values(rumus).flatMap((f) => [...f.matchAll(/\$([A-Z]{1,3})\$(\d+)/g)].map((m) => m[1] + m[2])))].sort();
    // angka tetap tersembunyi di baris yang sama (di luar kolom ukuran) yang dirujuk rumus, mis. AA dan AB pada Reducer
    const konstanta = {};
    for (const f of Object.values(rumus)) {
      for (const m of f.matchAll(/(?<![A-Z$])\$?([A-Z]{1,3})\$?(\d+)(?![\d(])/g)) {
        if (+m[2] !== r) continue;
        const kol = m[1]; if (kol in masukan || kol in rumus || kol === 'O') continue;
        const c = cells[kol + r]; if (c && typeof c.v === 'number' && !c.f) konstanta[kol] = c.v;
      }
    }
    out.push({ id: idDari(keluarga + ' ' + judul), keluarga, judul, no: no.v, baris: r, masukan, konstanta, qtyKolom: 'O', rumus, param, keluaran: { harga: 'S', jumlah: 'U', estimasi: 'AF', estimasiQty: 'AG', real: 'AS', realQty: 'AT' }, _contoh: contoh, _nilai: nilai });
  }
  return out;
}

const hasil = sheets.map((s) => ({ nama: s.name, cells: s.cells, bentuk: bacaBentuk(s.cells) }));
const [utama, ...lain] = hasil;

// id unik dan konsistensi antar skenario
const dipakai = new Map();
for (const b of utama.bentuk) { const n = (dipakai.get(b.id) || 0) + 1; dipakai.set(b.id, n); if (n > 1) b.id += '_' + n; }

// Perbaikan cacat workbook yang sudah dibuktikan (rumus merujuk sel baris lain). Setiap perbaikan tercatat di katalog.
const PERBAIKAN = [
  { id: 'SLW_HORIZONTAL_CROSS_EQUAL_COVER', kolom: 'AJ', dari: 'J107', ke: 'L109', alasan: 'Rumus merujuk sel baris lain (J107); bentuk setara di SLU memakai radius baris sendiri (kolom L). Hasil Excel kebetulan sama pada radius 300 dan salah pada radius lain.' },
];
for (const p of PERBAIKAN) {
  const b = utama.bentuk.find((x) => x.id === p.id);
  if (!b || !b.rumus[p.kolom] || !b.rumus[p.kolom].includes(p.dari)) { console.error('Perbaikan tidak berlaku (workbook berubah?): ' + p.id); process.exit(3); }
  b.rumus[p.kolom] = b.rumus[p.kolom].split(p.dari).join(p.ke);
  (b.perbaikan || (b.perbaikan = [])).push({ kolom: p.kolom, dari: p.dari, ke: p.ke, alasan: p.alasan });
}
// peringatan: rujukan ke baris lain yang bukan parameter (tanda cacat serupa)
const luar = [];
for (const b of utama.bentuk) for (const [kol, f] of Object.entries(b.rumus)) for (const m of f.matchAll(/(?<![A-Z$])\$?([A-Z]{1,3})\$?(\d+)(?![\d(])/g)) { if (+m[2] !== b.baris && !f.includes('$' + m[1] + '$' + m[2]) && +m[2] > 12) luar.push(`${b.id} ${kol}: ${m[1]}${m[2]}`); }
const selisih = [];
for (const sc of lain) {
  if (sc.bentuk.length !== utama.bentuk.length) selisih.push(`${sc.nama}: jumlah bentuk ${sc.bentuk.length} (utama ${utama.bentuk.length})`);
  sc.bentuk.forEach((b, i) => {
    const u = utama.bentuk[i]; if (!u) return;
    const beda = Object.keys({ ...u.rumus, ...b.rumus }).filter((k) => u.rumus[k] !== b.rumus[k]);
    if (beda.length || JSON.stringify(u.masukan) !== JSON.stringify(b.masukan)) selisih.push(`${sc.nama} baris ${b.baris} (${u.id}): rumus berbeda di ${beda.join(',') || '-'}`);
  });
}

// parameter: alamat yang dirujuk rumus; label dari kolom AV pada baris yang sama
const alamat = [...new Set(utama.bentuk.flatMap((b) => b.param))].sort((a, b) => splitAddr(a)[1] - splitAddr(b)[1] || colNum(splitAddr(a)[0]) - colNum(splitAddr(b)[0]));
// biaya saat PO (blok parameter di sisi atas): biaya per kg dan harga baut real
const ADDR_BIAYA = { platPerKg: 'AG2', hdgPerKg: 'AG3', labourPerKg: 'AG4', bautM10: 'AW9', bautM6: 'AW10' };
const skenario = hasil.map((s) => ({
  nama: s.nama,
  param: Object.fromEntries(alamat.map((a) => { const [k, r] = splitAddr(a); const c = s.cells[a]; return [a, { label: str(s.cells['AV' + r]) || null, kolom: k, v: c && typeof c.v === 'number' ? c.v : null }]; })),
  biaya: Object.fromEntries(Object.entries(ADDR_BIAYA).map(([k, a]) => [k, num(s.cells[a])])),
}));

const katalog = { versi: 1, sumber: 'workbook penawaran', param: alamat, bentuk: utama.bentuk.map(({ _contoh, _nilai, ...b }) => b) };
const harapan = hasil.map((s) => ({ skenario: s.nama, bentuk: s.bentuk.map((b, i) => ({ id: (utama.bentuk[i] || b).id, baris: b.baris, masukan: b._contoh, nilai: b._nilai })) }));

fs.mkdirSync('src/lib/erp', { recursive: true });
fs.writeFileSync('src/lib/erp/katalog-harga.json', JSON.stringify(katalog));
fs.writeFileSync('src/lib/erp/skenario-harga.json', JSON.stringify({ versi: 1, skenario }));
fs.mkdirSync('tests/unit', { recursive: true });
fs.writeFileSync('tests/unit/erp-excel-expected.json', JSON.stringify(harapan));

const kel = {}; katalog.bentuk.forEach((b) => { kel[b.keluarga] = (kel[b.keluarga] || 0) + 1; });
console.log(`Katalog harga: ${katalog.bentuk.length} bentuk (${Object.entries(kel).map(([k, n]) => k + '=' + n).join(', ')}), ${alamat.length} parameter, ${hasil.length} skenario.`);
console.log(`Parameter: ${alamat.join(' ')}`);
console.log(selisih.length ? `Selisih rumus antar skenario: ${selisih.length}\n  ` + selisih.slice(0, 12).join('\n  ') : 'Rumus tiap skenario sama persis.');
console.log(`Perbaikan cacat workbook diterapkan: ${PERBAIKAN.length}. Rujukan baris lain yang tersisa: ${luar.length}${luar.length ? ' (' + luar.slice(0, 5).join('; ') + ')' : ''}`);
const tanpaNama = katalog.bentuk.filter((b) => Object.values(b.masukan).some((n) => /^x[a-z]$/.test(n)));
if (tanpaNama.length) console.log('Masukan tanpa judul pada: ' + tanpaNama.map((b) => b.id).join(', '));
