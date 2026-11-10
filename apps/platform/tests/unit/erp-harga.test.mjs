// Uji mesin harga penawaran.  node tests/unit/erp-harga.test.mjs
//  Bagian S (sintetis): selalu berjalan, memakai katalog buatan, aman untuk CI.
//  Bagian G (emas): membandingkan dengan nilai tersimpan Excel; hanya berjalan bila berkas katalog dan pembanding ada
//  (dibangun oleh scripts/build-quote-catalog.mjs; diabaikan Git karena memuat rumus dan harga perusahaan).
import fs from 'node:fs';
import { hitungBaris, totalPenawaran, kebutuhanKg, biayaPO, nilaiParam, masukanBentuk } from '../../src/lib/erp/harga.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const info = (t) => R.push('INFO ' + t);
const dekat = (a, b, tol = 1e-9) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ---------- S: katalog sintetis ----------
const keluaran = { harga: 'S', jumlah: 'U', estimasi: 'AF', estimasiQty: 'AG', real: 'AS', realQty: 'AT' };
const kat = {
  bentuk: [
    { id: 'T1', keluarga: 'X', judul: 'tes', no: 1, baris: 10, masukan: { D: 'w', F: 'h' }, qtyKolom: 'O', keluaran,
      rumus: { V: '(D10*F10*$AW$3*$AW$5)/1000000', AF: 'V10*$AW$6', S: 'ROUND(AF10*$AW$2,-2)', U: 'S10*O10', AG: 'AF10*O10', AS: '(D10*F10*$AW$4*$AW$5/1000000)*$AW$7', AT: 'AS10*O10' },
      param: ['AW2', 'AW3', 'AW4', 'AW5', 'AW6', 'AW7'] },
    { id: 'T2', keluarga: 'X', judul: 'tabel', no: 2, baris: 12, masukan: { D: 'w' }, qtyKolom: 'O', keluaran,
      rumus: { V: 'IF(D12>100,2,IF(D12>49,1,"Tidak Diketahui"))', AF: 'V12*$AW$6', S: 'ROUND(AF12*$AW$2,-2)', U: 'S12*O12', AG: 'AF12*O12', AS: 'V12*$AW$7', AT: 'AS12*O12' },
      param: ['AW2', 'AW6', 'AW7'] },
    { id: 'T3', keluarga: 'X', judul: 'tray', no: 3, baris: 14, masukan: {}, qtyKolom: 'O', keluaran,
      rumus: { V: '$AY$3*$AW$5', AF: 'V14', S: 'ROUND(AF14*$AY$2,-2)', U: 'S14*O14', AG: 'AF14*O14', AS: 'V14', AT: 'AS14*O14' },
      param: ['AY2', 'AY3', 'AW5'] },
  ],
};
const sk = { nama: 'uji', param: { AW2: { v: 40000 }, AW3: { v: 2 }, AW4: { v: 1.8 }, AW5: { v: 7.85 }, AW6: { v: 1.1 }, AW7: { v: 1.025 }, AY2: { v: null }, AY3: { v: null } } };

let h = hitungBaris(kat, sk, 'T1', { w: 100, h: 100 }, 0);
ok('S-01 berat dan harga satuan dari rumus: 0,157 kg × 1,1 = 0,1727 kg, harga dibulatkan ke ratusan', dekat(h.kgEstimasi, 0.1727) && h.hargaSatuan === 6900 && dekat(h.kgReal, (100 * 100 * 1.8 * 7.85 / 1e6) * 1.025), JSON.stringify(h));
h = hitungBaris(kat, sk, 'T1', { w: 100, h: 100 }, 7);
ok('S-02 qty menghasilkan jumlah dan kg total', h.jumlah === 6900 * 7 && dekat(h.kgEstimasiTotal, 0.1727 * 7) && dekat(h.kgRealTotal, h.kgReal * 7), JSON.stringify(h));
h = hitungBaris(kat, sk, 'T1', { w: 100 });
ok('S-03 ukuran kurang menghasilkan galat dan null, bukan angka tebakan', h.galat === 'Ukuran kurang: h' && h.hargaSatuan === undefined, JSON.stringify(h));
ok('S-04 bentuk tidak dikenal menghasilkan galat', /tidak dikenal/i.test(hitungBaris(kat, sk, 'XX', {}).galat));
h = hitungBaris(kat, sk, 'T2', { w: 10 });
ok('S-05 ukuran di luar tabel rumus menghasilkan null dengan alasan Tidak Diketahui', h.hargaSatuan === null && /Tidak Diketahui/.test(h.galat), JSON.stringify(h));
h = hitungBaris(kat, sk, 'T2', { w: 150 });
ok('S-05b ukuran di dalam tabel dihitung', h.hargaSatuan === Math.round(2 * 1.1 * 40000 / 100) * 100 && h.kgReal === 2 * 1.025, JSON.stringify(h));
h = hitungBaris(kat, { param: { ...sk.param, AW3: { v: null } } }, 'T1', { w: 1, h: 1 });
ok('S-06 parameter skenario kosong menghasilkan galat yang menyebut alamatnya', /AW3/.test(h.galat), h.galat);
const sk2 = { param: { ...sk.param, AY2: { v: null }, AY3: { v: null }, AW2: { v: 38000 }, AW3: { v: 2 } } };
ok('S-07 skenario tanpa kolom AY memakai kolom AW pada baris yang sama', nilaiParam(sk2, 'AY2') === 38000 && nilaiParam(sk2, 'AY3') === 2 && nilaiParam({ param: { AY2: { v: 5 }, AW2: { v: 9 } } }, 'AY2') === 5);
h = hitungBaris(kat, sk2, 'T3', {}, 3);
ok('S-07b bentuk tetap tanpa ukuran memakai parameter pengganti', h.kgEstimasi === 2 * 7.85 && h.hargaSatuan === Math.round(2 * 7.85 * 38000 / 100) * 100, JSON.stringify(h));
ok('S-08 nama ukuran tidak peka huruf besar dan spasi; daftar ukuran bentuk tersedia', hitungBaris(kat, sk, 'T1', { W: 100, ' H ': 100 }).hargaSatuan === 6900 && JSON.stringify(masukanBentuk(kat, 'T1')) === '["w","h"]' && JSON.stringify(masukanBentuk(kat, 'T3')) === '[]' && masukanBentuk(kat, 'XX') === null);
let t = totalPenawaran({ jumlah: [1000, 2500, null, 500.5], diskon: 0.3, ppn: 0.11 });
ok('S-09 total: subtotal, diskon 30%, dasar, PPN 11%, total', dekat(t.subtotal, 4000.5) && dekat(t.diskon, 1200.15) && dekat(t.dpp, 2800.35) && dekat(t.ppn, 308.0385) && dekat(t.total, 3108.3885), JSON.stringify(t));
t = totalPenawaran({ jumlah: [1000, 2500, 500.5], diskon: 0.3, ppn: 0.11, bulatkan: true });
ok('S-09b pembulatan Rupiah utuh bila diminta', t.diskon === 1200 && t.ppn === 308 && t.total === t.dpp + 308, JSON.stringify(t));
const kg = kebutuhanKg([{ kgEstimasiTotal: 10, kgRealTotal: 8 }, { kgEstimasiTotal: 2.5, kgRealTotal: 2 }, { galat: 'x' }, null]);
ok('S-10 kebutuhan kg menjumlah estimasi dan real, melewati baris galat', kg.estimasi === 12.5 && kg.real === 10, JSON.stringify(kg));
const bp = biayaPO({ kgReal: 100, biaya: { platPerKg: 10, hdgPerKg: 5, labourPerKg: 3, bautM10: 2, bautM6: 1 }, baut: { m10: 5, m6: 10 }, trading: 50, dpp: 4000, subtotal: 5000 });
ok('S-11 biaya PO: plat, hot dip, labour per kg; baut (set × faktor × harga); trading; modal; rasio dan harga titik 85', bp.plat === 1000 && bp.hdg === 500 && bp.labour === 300 && bp.baut === 5 * 4 * 2 + 10 * 2 * 1 && bp.modal === 1800 + 60 + 50 && dekat(bp.rasioModal, 1910 / 4000 - 1) && dekat(bp.hargaPoin, 1910 / 0.85) && dekat(bp.rasioPoin, 1910 / 0.85 / 5000 - 1) && dekat(bp.margin, 1 - 1910 / 4000), JSON.stringify(bp));
ok('S-11b tanpa dasar harga, rasio dan margin null (bukan galat bagi nol)', biayaPO({ kgReal: 10, biaya: { platPerKg: 1 }, dpp: 0, subtotal: 0 }).rasioModal === null && biayaPO({ kgReal: 10, biaya: { platPerKg: 1 } }).margin === null);

// ---------- G: uji emas terhadap Excel ----------
const baca = (f) => { try { return JSON.parse(fs.readFileSync(new URL(f, import.meta.url), 'utf8')); } catch { return null; } };
const katalog = baca('../../src/lib/erp/katalog-harga.json');
const skenario = baca('../../src/lib/erp/skenario-harga.json');
const harapan = baca('./erp-excel-expected.json');
const totals = baca('./erp-excel-totals.json');
if (!katalog || !skenario || !harapan) {
  info('G (uji emas) dilewati: berkas katalog atau pembanding Excel tidak ada di mesin ini (bangun dengan scripts/build-quote-catalog.mjs)');
} else {
  const sk1 = skenario.skenario[0]; const e1 = harapan[0].bentuk;
  let salah = 0, harga = 0, cek = 0, contoh = [];
  katalog.bentuk.forEach((b, i) => {
    const e = e1[i];
    const r = hitungBaris(katalog, sk1, b.id, e.masukan, 0, { semua: true });
    if (r.galat) { salah++; if (contoh.length < 4) contoh.push(b.id + ': ' + r.galat); return; }
    for (const [kol, nilai] of Object.entries(e.nilai)) {
      if (typeof nilai !== 'number') continue;
      cek++;
      if (!dekat(r.nilai[kol], nilai, 1e-9)) { salah++; if (contoh.length < 4) contoh.push(`${b.id} ${kol}: ${r.nilai[kol]} lawan ${nilai}`); }
    }
    if (r.hargaSatuan === e.nilai.S) harga++;
  });
  ok(`G-01 skenario utama: ${katalog.bentuk.length} bentuk, ${cek} nilai rumus sama dengan Excel`, salah === 0 && cek > 1500, `salah ${salah}; ${contoh.join(' | ')}`);
  ok('G-02 harga satuan sama persis dengan Excel untuk semua bentuk', harga === katalog.bentuk.length, `${harga} dari ${katalog.bentuk.length}`);
  ok('G-03 192 bentuk dari 6 keluarga × 32', katalog.bentuk.length === 192 && new Set(katalog.bentuk.map((b) => b.keluarga)).size === 6 && new Set(katalog.bentuk.map((b) => b.id)).size === 192);
  const ib = katalog.bentuk.findIndex((b) => b.id === 'SLW_HORIZONTAL_CROSS_EQUAL_COVER');
  if (ib >= 0 && katalog.bentuk[ib].perbaikan) {
    const m = { ...e1[ib].masukan, r: 400 }; const aw4 = nilaiParam(sk1, 'AW4'), aw5 = nilaiParam(sk1, 'AW5');
    const r400 = hitungBaris(katalog, sk1, katalog.bentuk[ib].id, m, 0, { semua: true });
    ok('G-03b cacat workbook diperbaiki: Cross Cover SLW mengikuti radius baris sendiri (Excel memakai sel baris lain dan tidak berubah)', dekat(r400.nilai.AJ, 3.14 * 400 * 400 * aw4 * aw5 / 1e6), String(r400.nilai.AJ));
  }
  if (totals) {
    const lines = Object.entries(totals.qty).map(([baris, q]) => { const i = katalog.bentuk.findIndex((b) => b.baris === +baris); return hitungBaris(katalog, sk1, katalog.bentuk[i].id, e1[i].masukan, q); });
    const jml = lines.map((x) => x.jumlah);
    const tt = totalPenawaran({ jumlah: jml, diskon: 0.3, ppn: 0.11 });
    ok('G-04 subtotal, diskon, dasar, PPN, total sama dengan Excel', dekat(tt.subtotal, totals.U426) && dekat(tt.diskon, totals.U427) && dekat(tt.dpp, totals.U428) && dekat(tt.ppn, totals.U429) && dekat(tt.total, totals.U430), JSON.stringify({ sub: tt.subtotal, xl: totals.U426 }));
    const kgq = kebutuhanKg(lines);
    ok('G-05 total kg estimasi dan real sama dengan Excel', dekat(kgq.estimasi, totals.AG15) && dekat(kgq.real, totals.AT15), `${kgq.estimasi} / ${kgq.real}`);
    const bp2 = biayaPO({ kgReal: kgq.real, biaya: sk1.biaya, dpp: tt.dpp, subtotal: tt.subtotal });
    ok('G-06 biaya PO: plat, hot dip, labour, modal, rasio modal, selisih, harga titik 85 sama dengan Excel', dekat(bp2.plat, totals.R458) && dekat(bp2.hdg, totals.R460) && dekat(bp2.labour, totals.R462) && dekat(bp2.perKg, totals.AG5) && dekat(bp2.modalBerat, totals.AT2) && dekat(bp2.modal, totals.AT6) && dekat(bp2.rasioModal, totals.AT8) && dekat(bp2.selisih, totals.AT9) && dekat(bp2.hargaPoin, totals.AG8) && dekat(bp2.rasioPoin, totals.AG9), JSON.stringify({ modal: bp2.modal, xl: totals.AT6 }));
  } else info('G-04 sampai G-06 dilewati: erp-excel-totals.json tidak ada');
  // skenario lain: rumus sheet 1 (terbaru) dengan parameter sheet lain, dibandingkan dengan nilai sheet itu di Excel
  for (let s = 1; s < skenario.skenario.length; s++) {
    const es = harapan[s].bentuk; let beda = 0, tak = 0, maks = 0;
    katalog.bentuk.forEach((b, i) => {
      const r = hitungBaris(katalog, skenario.skenario[s], b.id, es[i].masukan, 0);
      const x = es[i].nilai.S;
      if (typeof x !== 'number') return;
      if (r.hargaSatuan === null || r.hargaSatuan === undefined) { tak++; return; } // sheet itu memakai ukuran berbeda untuk bentuk ini
      if (r.hargaSatuan !== x) { beda++; if (x) maks = Math.max(maks, Math.abs(r.hargaSatuan / x - 1)); }
    });
    info(`G-07 ${skenario.skenario[s].nama}: dengan rumus sheet utama dan parameter sheet ini, ${beda} dari ${katalog.bentuk.length} harga satuan berbeda dari Excel sheet itu (selisih terbesar ${(maks * 100).toFixed(0)}%) dan ${tak} bentuk memakai ukuran berbeda; sheet ini memuat versi rumus yang lebih lama`);
  }
}

const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.filter((x) => x.startsWith('PASS')).length} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
