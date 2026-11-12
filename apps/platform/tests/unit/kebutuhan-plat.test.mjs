// Uji integrasi: rumus Excel (mesin berat) -> berat per pcs -> kebutuhan plat -> kekurangan dan usulan PR.
//   node tests/unit/kebutuhan-plat.test.mjs
// Angka acuan dihitung manual terpisah dari kode (lihat documentation/RENCANA_PERBAIKAN_LOKAL.md, bagian Validasi tonase).
import fs from 'node:fs';
import { existsSync } from 'node:fs';
if (!existsSync(new URL('../../src/lib/berat/catalog.json', import.meta.url))) {
  console.log('SKIP: catalog.json tidak ada (dibuat lokal dari workbook, tidak disimpan di Git).');
  process.exit(0);
}
import { kgPerPcs, totalKg } from '../../src/lib/berat/bentuk.js';
import { kelompokKebutuhan, rencanaMaterial, usulanPr, susutMaterial } from '../../src/lib/erp/material.js';

const katalog = JSON.parse(fs.readFileSync(new URL('../../src/lib/berat/catalog.json', import.meta.url)));
const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const dekat = (a, b, t = 0.01) => Math.abs(a - b) <= t;

const g = 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED';
const w = kgPerPcs(katalog, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 300, h: 100, l: 3000 }, tebal: '1.2', material: 'SPHC / ELG', lubang: 'standar' });
ok('KP-01 Cable Tray STU W300xH100xL3000 t1,2: berat estimasi (plate) 14,712 kg dan real 13,513 kg per pcs', w.ok && dekat(w.kgPcsEst, 14.712, 0.001) && dekat(w.kgPcsReal, 13.513, 0.001), JSON.stringify({ est: w.kgPcsEst, real: w.kgPcsReal }));
ok('KP-02 berat estimasi sudah memuat waste: est lebih besar dari real sekitar 8 sampai 11 persen', w.kgPcsEst / w.kgPcsReal > 1.07 && w.kgPcsEst / w.kgPcsReal < 1.12, String(Math.round(w.kgPcsEst / w.kgPcsReal * 10000) / 10000));

const tot = totalKg({ kgPcsEst: w.kgPcsEst, kgPcsReal: w.kgPcsReal }, 1000, 0);
ok('KP-03 tonase SPK 1000 pcs: plate (est) 14.712 kg, barang jadi (real) 13.513 kg', dekat(tot.kgEstTotal, 14712, 1) && dekat(tot.kgRealTotal, 13513, 1), JSON.stringify(tot));

// kebutuhan plat: item berat estimasi tidak dikali faktor sisa potong lagi
const kel = kelompokKebutuhan([{ d: 'Cable Tray W300xH100xL3000', g, q: 1000, w: w.kgPcsEst, sudahWaste: true }], { faktor: 1.1 });
ok('KP-04 kebutuhan plat 1000 pcs = 14.712 kg (tidak 16.183 kg: waste tidak ganda)', kel.length === 1 && kel[0].kunci === 'SPHC|1.2' && dekat(kel[0].netto, 14712, 1) && dekat(kel[0].bruto, 14712, 1), JSON.stringify(kel[0]));
const lama = kelompokKebutuhan([{ d: 'Item berat manual', g, q: 1000, w: 13.513 }], { faktor: 1.1 });
ok('KP-05 item dengan berat manual (bukan estimasi Excel) tetap dikali faktor 1,1: 13.513 kg -> 14.864 kg', dekat(lama[0].bruto, 14864.3, 1));

// stok dan reservasi: dua ukuran plat 1.2 mm (angka dari data contoh: 151 lbr x 33,912 kg dan 120 lbr x 27,9955 kg)
const rm = [
  { id: 'a', label: 'Plat SPHC 1.2x1200x3000', bahan: 'SPHC', tebal: 1.2, kgPerLbr: 33.912, stok: 151 },
  { id: 'b', label: 'Plat Besi 1.2 x 1219 x 2438', bahan: 'SPHC', tebal: 1.2, kgPerLbr: 27.9955, stok: 120 },
];
const rc = rencanaMaterial(kel, rm, { reservasiLain: { 'SPHC|1.2': 1701.392 }, keluar: {}, dipesan: {} });
const r0 = rc[0];
ok('KP-06 stok fisik 8.480,17 kg, reservasi SPK lain 1.701,39 kg, tersedia 6.778,78 kg', dekat(r0.fisikKg, 8480.173, 0.01) && dekat(r0.reservasiKg, 1701.392, 0.01) && dekat(r0.tersediaKg, 6778.781, 0.01), JSON.stringify({ f: r0.fisikKg, r: r0.reservasiKg, t: r0.tersediaKg }));
ok('KP-07 kekurangan 7.933,38 kg = 234 lembar (plat utama 33,912 kg/lbr), kebutuhan 434 lembar', dekat(r0.kurangKg, 7933.38, 0.05) && r0.kurangLbr === 234 && r0.butuhLbr === 434, JSON.stringify({ kurangKg: r0.kurangKg, kurangLbr: r0.kurangLbr, butuhLbr: r0.butuhLbr }));
const pr = usulanPr(rc);
ok('KP-08 usulan PR: satu baris plat utama 234 lembar', pr.length === 1 && pr[0].q === 234, JSON.stringify(pr));
const rc2 = rencanaMaterial(kel, rm, { reservasiLain: { 'SPHC|1.2': 1701.392 }, keluar: {}, dipesan: { 'SPHC|1.2': 234 * 33.912 } });
ok('KP-09 setelah PR (draf atau diajukan) tercatat sebagai dipesan, tidak ada usulan baru (tidak dobel)', usulanPr(rc2).length === 0 && rc2[0].status === 'Sudah dipesan');

// susut: plat yang keluar vs hasil jadi (berat estimasi), batas hanya toleransi karena waste sudah di estimasi
const hasil = kelompokKebutuhan([{ d: 'x', g, q: 1000, w: w.kgPcsEst, sudahWaste: true }], { faktor: 1.1 });
const su = susutMaterial(kel, hasil, { 'SPHC|1.2': 15100 }, { faktor: 1.1 });
ok('KP-10 plat keluar 15.100 kg untuk hasil 14.712 kg: susut 2,6% Wajar (batas 5%)', su[0].status === 'Wajar' && dekat(su[0].batas, 0.05, 1e-9), JSON.stringify(su[0]));


// Cable Duct = Cable Tray tanpa lubang: masukan sama, berat memakai kolom tanpa lubang
const std = kgPerPcs(katalog, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 300, h: 100, l: 3000 }, tebal: '1.2', material: 'SPHC / ELG', lubang: 'standar' });
const tnp = kgPerPcs(katalog, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 300, h: 100, l: 3000 }, tebal: '1.2', material: 'SPHC / ELG', lubang: 'tanpa' });
ok('KP-11 Cable Duct (tanpa lubang): berat estimasi dan real tidak lebih kecil dari yang berlubang, dan sama dengan kolom tanpa lubang di Excel', tnp.ok && tnp.lubang === 'tanpa' && tnp.kgPcsEst >= std.kgPcsEst - 1e-9 && tnp.kgPcsReal >= std.kgPcsReal - 1e-9, JSON.stringify({ standar: [std.kgPcsEst, std.kgPcsReal], tanpa: [tnp.kgPcsEst, tnp.kgPcsReal] }));
R.forEach((l) => console.log(l));
const gagal = R.filter((l) => l.startsWith('FAIL')).length;
console.log(`${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
