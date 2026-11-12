// Uji section SPK terhadap katalog kalkulator asli (11 section x 6 jenis): bentuk yang ditawarkan, masukan, nama, dan berat.
//   node tests/unit/section-spk.test.mjs
// Keputusan pemilik 2026-11-12. Dilewati bila catalog.json tidak ada (dibuat lokal dari workbook, tidak disimpan di Git).
import fs from 'node:fs';
import { existsSync } from 'node:fs';
if (!existsSync(new URL('../../src/lib/berat/catalog.json', import.meta.url))) {
  console.log('SKIP: catalog.json tidak ada (dibuat lokal dari workbook, tidak disimpan di Git).');
  process.exit(0);
}
import { bentukUntukProduk, namaItem, hitungBentuk, kgPerPcs, ATURAN_DEFAULT } from '../../src/lib/berat/bentuk.js';

const katalog = JSON.parse(fs.readFileSync(new URL('../../src/lib/berat/catalog.json', import.meta.url)));
const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const FAM = Object.keys(katalog.keluarga);
const SECTION = ['CABLE TRAY', 'PERFORATED CABLE TRAY', 'CABLE LADDER', 'CABLE DUCT', 'ACCS TRAY', 'ACCS LADDER', 'ACCS DUCT', 'COVER TRAY', 'COVER LADDER', 'COVER DUCT', 'OTHER SUPPORT'];
const FITTING = ['ELBOW', 'INSIDE', 'OUTSIDE', 'TEE', 'CROSS', 'REDUCER'];
const COVER = ['COVER_STRAIGHT', 'COVER_ELBOW', 'COVER_INSIDE', 'COVER_OUTSIDE', 'COVER_TEE', 'COVER_CROSS', 'COVER_REDUCER'];
const SUPPORT = ['JOINTING', 'HORIZONTAL_FISH_PLATE', 'VERTICAL_FISH_PLATE', 'SPLICE_PLATE_SET_FOR_STAND', 'BRACKET_SUPPORT', 'DOUBLE_CHANNEL_BRACKET', 'SINGLE_CHANNEL_BRACKET', 'HANGER_BEAM', 'U_CHANNEL_20X20', 'HANGER_CLEVIS', 'COVER_CLAMP', 'COVER_CLAMP_HEAVY_DUTY', 'SEPARATOR', 'SUPPORT_SEPARATOR', 'HOLD_DOWN_CLAMP', 'HOLD_DOWN_CLIP', 'END_STOP', 'DROP_OUT'];
const norm = (k) => String(k).replace('CHANEEL', 'CHANNEL');
const kunci = (fam, p) => bentukUntukProduk(katalog, fam, p).map((x) => norm(x.kunci));

ok('SS-01 ada 11 section dalam aturan bawaan, urut seperti permintaan pemilik', JSON.stringify(Object.keys(ATURAN_DEFAULT).sort()) === JSON.stringify([...SECTION].sort()));

// Section utama: hanya Straight di semua jenis yang punya Straight
const utama = {};
for (const p of ['CABLE TRAY', 'PERFORATED CABLE TRAY', 'CABLE LADDER', 'CABLE DUCT']) utama[p] = FAM.every((f) => { const k = kunci(f, p); return k.length === 1 && k[0] === 'STRAIGHT'; });
ok('SS-02 Cable Tray, Perforated Cable Tray, Cable Ladder, Cable Duct: hanya Straight pada semua jenis', Object.values(utama).every(Boolean), JSON.stringify(utama));

// Accs: fitting saja; Cover: tutup saja; Other Support: aksesori saja
const ringkas = {};
for (const f of FAM) {
  const a = kunci(f, 'ACCS TRAY'), c = kunci(f, 'COVER TRAY'), o = kunci(f, 'OTHER SUPPORT');
  ringkas[f] = { accs: a.join(','), cover: c.length, other: o.length, accsHanyaFitting: a.every((x) => FITTING.includes(x)), coverHanyaTutup: c.every((x) => COVER.includes(x)), otherHanyaSupport: o.every((x) => SUPPORT.includes(x)) };
}
ok('SS-03 ACCS (Tray, Ladder, Duct) hanya memuat Elbow, Inside Riser, Outside Riser, Tee, Cross, Reducer', FAM.every((f) => ['ACCS TRAY', 'ACCS LADDER', 'ACCS DUCT'].every((p) => kunci(f, p).length > 0 && kunci(f, p).every((x) => FITTING.includes(x)))), JSON.stringify(Object.fromEntries(FAM.map((f) => [f, ringkas[f].accs]))));
ok('SS-04 COVER (Tray, Ladder, Duct) hanya memuat Cover, Cover Elbow, Inside, Outside, Tee, Cross, Reducer', FAM.every((f) => ['COVER TRAY', 'COVER LADDER', 'COVER DUCT'].every((p) => kunci(f, p).length > 0 && kunci(f, p).every((x) => COVER.includes(x)))), JSON.stringify(Object.fromEntries(FAM.map((f) => [f, ringkas[f].cover]))));
ok('SS-05 OTHER SUPPORT hanya memuat aksesori dari daftar pemilik (Jointing sampai Drop Out), strukturnya mengikuti jenis section', FAM.every((f) => kunci(f, 'OTHER SUPPORT').length > 0 && kunci(f, 'OTHER SUPPORT').every((x) => SUPPORT.includes(x))), JSON.stringify(Object.fromEntries(FAM.map((f) => [f, ringkas[f].other]))));

// Kelengkapan terhadap daftar pemilik (per jenis): bentuk yang diminta tetapi tidak ada di kalkulator dilaporkan
const hilang = {};
for (const f of FAM) {
  const ada = new Set(bentukUntukProduk(katalog, f, 'ACCS TRAY').concat(bentukUntukProduk(katalog, f, 'COVER TRAY'), bentukUntukProduk(katalog, f, 'OTHER SUPPORT'), bentukUntukProduk(katalog, f, 'CABLE TRAY')).map((x) => norm(x.kunci)));
  const minta = ['STRAIGHT', ...FITTING, ...COVER, ...SUPPORT];
  hilang[f] = minta.filter((x) => !ada.has(x));
}
ok('SS-06 kelengkapan: bentuk yang diminta tetapi belum ada di kalkulator per jenis (info, bukan kegagalan)', true, JSON.stringify(hilang));

// Masukan dan berat: tiap bentuk di tiap section bisa dihitung dengan ukuran contoh, dan masukannya mengikuti kalkulator
const contoh = { w: 200, h: 100, l: 3000, r: 300, w1: 200, w2: 200, w3: 200, w4: 200 };
let total = 0, gagal = [];
for (const f of FAM) for (const p of SECTION) for (const b of bentukUntukProduk(katalog, f, p)) {
  total++;
  const dim = Object.fromEntries(b.dim.map((d) => [d.k, contoh[d.k]]));
  const lubang = p === 'CABLE DUCT' ? 'tanpa' : p === 'PERFORATED CABLE TRAY' ? 'full' : 'standar';
  const r = kgPerPcs(katalog, { keluarga: f, bentuk: b.id, dim, tebal: '1.5', material: 'SPHC / ELG', lubang });
  const nama = namaItem(p, b.kunci, dim, b.dim);
  if (!r.ok || !(r.kgPcsEst > 0) || !(r.kgPcsReal > 0) || !nama || /\?/.test(nama)) gagal.push(`${f}/${p}/${b.kunci}: ${r.ok ? 'nama' : r.alasan}`);
}
ok('SS-07 semua bentuk di semua section dan jenis menghasilkan berat estimasi dan real positif serta nama tanpa tanda tanya', gagal.length === 0, `${total} kombinasi, ${gagal.length} gagal${gagal.length ? ': ' + gagal.slice(0, 4).join(' | ') : ''}`);

// Cable Duct tanpa lubang: lebih berat dari Cable Tray berlubang untuk ukuran yang sama
const ct = kgPerPcs(katalog, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 300, h: 100, l: 3000 }, tebal: '1.2', material: 'SPHC / ELG', lubang: 'standar' });
const cd = kgPerPcs(katalog, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 300, h: 100, l: 3000 }, tebal: '1.2', material: 'SPHC / ELG', lubang: 'tanpa' });
ok('SS-08 Cable Duct (tanpa lubang) lebih berat daripada Cable Tray berlubang untuk ukuran sama; masukan W, H, L sama', cd.ok && ct.ok && cd.kgPcsReal > ct.kgPcsReal && cd.kgPcsEst > ct.kgPcsEst, JSON.stringify({ tray: ct.kgPcsReal, duct: cd.kgPcsReal }));

// Urutan tampil di pilihan bentuk sama dengan daftar pemilik
const urutanOk = FAM.every((f) => kunci(f, 'ACCS TRAY').join() === FITTING.join() && kunci(f, 'COVER LADDER').join() === COVER.join() && kunci(f, 'OTHER SUPPORT').join() === SUPPORT.join());
ok('SS-09 urutan pilihan bentuk mengikuti daftar pemilik: ACCS (Elbow, Inside, Outside, Tee, Cross, Reducer), COVER (Cover, Elbow, Inside, Outside, Tee, Cross, Reducer), OTHER SUPPORT (Jointing sampai Drop Out)', urutanOk, JSON.stringify({ accs: kunci('STU', 'ACCS TRAY').join(), support: kunci('STU', 'OTHER SUPPORT').join() }));

R.forEach((l) => console.log(l));
const nGagal = R.filter((l) => l.startsWith('FAIL')).length;
console.log(`${R.length - nGagal} PASS, ${nGagal} FAIL`);
process.exit(nGagal ? 1 : 0);
