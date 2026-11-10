// Uji kapasitas aktual mesin.  node tests/unit/kapasitas.test.mjs
import { kinerjaMesinHari, trenMesin, ringkasWorkCenter } from '../../src/lib/produksi/kapasitas.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const T = '2026-11-05';
const h = (id, mesin, tgl, qty, menit, selesaiJam, reject = 0) => ({ id, jenis: 'hasil', wc: 'Punching', mesin, tgl, qty, reject, menit, selesai: `${tgl}T${String(selesaiJam).padStart(2, '0')}:30:00`, at: `${tgl}T${String(selesaiJam).padStart(2, '0')}:30:00` });
const jamLokal = (iso) => Number(String(iso).slice(11, 13));
const kej = [h(1, 'P1', T, 40, 60, 9), h(2, 'P1', T, 30, 90, 11, 2), h(3, 'P1', T, 10, null, 14), h(4, 'P2', T, 99, 30, 9), h(5, 'P1', '2026-11-04', 20, 60, 10)];

const k = kinerjaMesinHari({ kejadian: kej, sesi: [], mesin: 'P1', tgl: T, sekarang: T + 'T15:00:00', kapasitasHari: 160, jamDari: jamLokal });
ok('K-01 output dan reject hanya milik mesin dan tanggal itu', k.qty === 80 && k.reject === 2 && k.catatan === 3, JSON.stringify([k.qty, k.reject, k.catatan]));
ok('K-02 laju hanya dari catatan berdurasi: 70 pcs dalam 150 menit = 28 pcs/jam', k.lajuPerJam === 28, String(k.lajuPerJam));
ok('K-03 menit aktif = jumlah durasi tercatat (150) tanpa sesi berjalan', k.aktifMenit === 150 && Math.abs(k.utilisasi - 150 / 480) < 1e-9, JSON.stringify([k.aktifMenit, k.utilisasi]));
ok('K-04 target laju = kapasitas per hari dibagi 8 jam (20 pcs/jam); laju 140% dari target; capaian 50%', k.targetLaju === 20 && Math.abs(k.lajuVsTarget - 1.4) < 1e-9 && k.capaian === 0.5, JSON.stringify([k.targetLaju, k.lajuVsTarget, k.capaian]));
ok('K-05 output per jam dikelompokkan menurut jam selesai', k.perJam[9] === 40 && k.perJam[11] === 30 && k.perJam[14] === 10, JSON.stringify(k.perJam));
ok('K-06 proyeksi = output + laju x sisa menit shift (330 menit => +154) = 234', k.proyeksi === 234 && Math.abs(k.proyeksiVsTarget - 234 / 160) < 1e-9, String(k.proyeksi));

const s = kinerjaMesinHari({ kejadian: kej, sesi: [{ jenis: 'mulai', wc: 'Punching', mesin: 'P1', tgl: T, mulai: T + 'T14:30:00' }], mesin: 'P1', tgl: T, sekarang: T + 'T15:00:00', kapasitasHari: 160, jamDari: jamLokal });
ok('K-07 sesi yang sedang berjalan menambah menit aktif sebesar lamanya sampai sekarang (30)', s.aktifMenit === 180 && s.berjalan === 1, JSON.stringify([s.aktifMenit, s.berjalan]));

const kosong = kinerjaMesinHari({ kejadian: [], sesi: [], mesin: 'P9', tgl: T, sekarang: T + 'T10:00:00', jamDari: jamLokal });
ok('K-08 mesin tanpa catatan: nol, laju kosong, tanpa proyeksi dan tanpa target', kosong.qty === 0 && kosong.lajuPerJam === null && kosong.proyeksi === null && kosong.targetLaju === null && kosong.capaian === null);

const tr = trenMesin({ kejadian: kej, mesin: 'P1', sampai: T, hari: 3 });
ok('K-09 tren harian: urut lama ke baru, hari tanpa catatan tetap nol', tr.map((x) => x.tgl).join() === '2026-11-03,2026-11-04,2026-11-05' && tr[0].qty === 0 && tr[1].qty === 20 && tr[1].laju === 20 && tr[2].qty === 80, JSON.stringify(tr));

const rw = ringkasWorkCenter(['P1', 'P2'], (m) => kinerjaMesinHari({ kejadian: kej, sesi: [], mesin: m, tgl: T, sekarang: T + 'T15:00:00', kapasitasHari: m === 'P1' ? 160 : 100, jamDari: jamLokal }));
ok('K-10 ringkasan work center menjumlahkan output dan kapasitas mesinnya', rw.qty === 179 && rw.kapasitas === 260 && Math.abs(rw.capaian - 179 / 260) < 1e-9, JSON.stringify([rw.qty, rw.kapasitas]));

const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(fail ? `\n${fail} FAIL` : '\nSEMUA PASS (' + R.length + ')');
process.exit(fail ? 1 : 0);
