// Uji hitungan Maintenance.  node tests/unit/maintenance.test.mjs
import { ringkas, perMesin, riwayatMesin, statusRutin, seringRusak, mtbfHari, tren, butirOtomatis, downtimeMenit } from '../../src/lib/maintenance/hitung.js';
import { periodeRentang } from '../../src/lib/produksi/statistik.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const c = (o) => ({ kind: 'catat', status: 'Selesai', jenis: 'Korektif', downtime: 0, parts: [], ...o });
const D = [
  c({ _id: 'a1', no: 'MTC/1', tgl: '2026-11-02', mesin: 'Bending 1', jenis: 'Korektif', downtime: 120, parts: [{ sp: 's1', nama: 'Seal hidrolik', q: 2 }], biaya: 150000 }),
  c({ _id: 'a2', no: 'MTC/2', tgl: '2026-11-06', mesin: 'Bending 1', jenis: 'Korektif', downtime: 60, parts: [{ sp: 's1', nama: 'Seal hidrolik', q: 1 }, { sp: 's2', nama: 'Oli hidrolik', q: 5 }] }),
  c({ _id: 'a3', no: 'MTC/3', tgl: '2026-11-10', mesin: 'Bending 1', jenis: 'Korektif', downtime: 90 }),
  c({ _id: 'a4', no: 'MTC/4', tgl: '2026-11-04', mesin: 'Shearing 01', jenis: 'Preventif', downtime: 30, rutin: 'r1', tindakan: 'Ganti pisau' }),
  c({ _id: 'a5', no: 'MTC/5', tgl: '2026-10-15', mesin: 'Punching 1', jenis: 'Inspeksi', downtime: 0 }),
  c({ _id: 'a6', no: 'MTC/6', tgl: '2026-11-11', mesin: 'Punching 1', jenis: 'Korektif', status: 'Menunggu sparepart', mulai: '2026-11-11T08:00:00', selesai: '2026-11-11T09:30:00' }),
  c({ _id: 'a7', no: 'MTC/7', tgl: '2026-11-11', mesin: 'Bending 1', jenis: 'Korektif', status: 'Batal' }),
  { kind: 'rutin', _id: 'r1', mesin: 'Shearing 01', tugas: 'Ganti pisau', interval: 30, mulai: '2026-10-01', aktif: true },
  { kind: 'rutin', _id: 'r2', mesin: 'Bending 1', tugas: 'Ganti oli hidrolik', interval: 90, mulai: '2026-11-15', aktif: true },
  { kind: 'rutin', _id: 'r3', mesin: 'Punching 1', tugas: 'Pelumasan', interval: 14, mulai: '2026-10-01', aktif: true },
  { kind: 'rutin', _id: 'r4', mesin: 'Punching 1', tugas: 'Nonaktif', interval: 14, mulai: '2026-10-01', aktif: false },
];
const hari = '2026-11-12';

const rs = ringkas(D, { dari: '2026-11-01', sampai: '2026-11-30' });
ok('M-01 ringkasan bulan: batal tidak dihitung, jumlah 6, korektif 4, preventif 1, mesin 3, downtime 300 + 90 (dari jam) menit, sparepart 8 qty dari 2 jenis, biaya', rs.jumlah === 5 && rs.jenis.Korektif === 4 && rs.jenis.Preventif === 1 && rs.mesin === 3 && rs.downtimeMenit === 390 && rs.sparepartQty === 8 && rs.sparepartJenis === 2 && rs.biaya === 150000 && rs.terbuka === 1, JSON.stringify(rs));
ok('M-02 downtime dari jam mulai dan selesai bila isian kosong, isian langsung menang', downtimeMenit({ mulai: '2026-11-11T08:00:00', selesai: '2026-11-11T09:30:00' }) === 90 && downtimeMenit({ downtime: 45, mulai: '2026-11-11T08:00:00', selesai: '2026-11-11T09:30:00' }) === 45 && downtimeMenit({}) === 0);
ok('M-03 hari ini dan semua data: periode berbeda memberi akumulasi berbeda', ringkas(D, periodeRentang('hari', hari)).jumlah === 0 && ringkas(D, periodeRentang('hari', '2026-11-11')).jumlah === 1 && ringkas(D, periodeRentang('semua', hari)).jumlah === 6 && ringkas(D, periodeRentang('minggu', hari)).jumlah === 2 && ringkas(D, periodeRentang('triwulan', hari)).jumlah === 6 && ringkas(D, periodeRentang('triwulanlalu', hari)).jumlah === 0);

const pm = perMesin(D, periodeRentang('semua', hari), ['Welding 1']);
ok('M-04 per mesin: Bending 1 paling sering (3 korektif), downtime 4,5 jam, sparepart diganti (Seal hidrolik 3, Oli hidrolik 5), mesin tanpa catatan tetap tampil', pm[0].mesin === 'Bending 1' && pm[0].korektif === 3 && pm[0].downtimeJam === 4.5 && eq(pm[0].partsDaftar, [{ nama: 'Oli hidrolik', q: 5 }, { nama: 'Seal hidrolik', q: 3 }]) && pm.some((x) => x.mesin === 'Welding 1' && x.jumlah === 0), pm.map((x) => x.mesin + ':' + x.jumlah).join(','));
ok('M-05 MTBF Bending 1: tiga korektif 02, 06, 10 Nov = rata-rata 4 hari; mesin dengan satu korektif null', mtbfHari(D, 'Bending 1') === 4 && mtbfHari(D, 'Punching 1') === null && pm[0].mtbfHari === 4);
ok('M-06 riwayat mesin terbaru dulu, tanpa catatan batal', eq(riwayatMesin(D, 'Bending 1').map((x) => x._id), ['a3', 'a2', 'a1']));

const sr = statusRutin(D, hari);
const by = Object.fromEntries(sr.map((x) => [x.rutin._id, x]));
ok('M-07 jadwal rutin: Shearing dikerjakan 4 Nov interval 30 hari jatuh tempo 4 Des (Aman); Bending belum pernah, mulai 15 Nov (Segera 3 hari); Punching belum pernah, mulai 1 Okt (Terlambat); jadwal nonaktif tidak ikut', by.r1.jatuhTempo === '2026-12-04' && by.r1.status === 'Aman' && by.r2.status === 'Segera' && by.r2.sisaHari === 3 && by.r3.status === 'Terlambat' && by.r3.sisaHari < 0 && !by.r4 && sr[0].rutin._id === 'r3', JSON.stringify(sr.map((x) => [x.rutin._id, x.status, x.sisaHari])));
ok('M-08 mesin sering rusak: 3 korektif dalam 30 hari = Bending 1', eq(seringRusak(D, hari, { hari: 30, min: 3 }), [{ mesin: 'Bending 1', korektif: 3, hari: 30 }]) && seringRusak(D, hari, { hari: 5, min: 3 }).length === 0);
const tr = tren(D, periodeRentang('semua', hari), 'bulan');
ok('M-09 tren per bulan dan butir otomatis', eq(tr.map((x) => x.kunci + ':' + x.jumlah), ['2026-10:1', '2026-11:5']) && butirOtomatis('2026-11-01', '2026-11-12') === 'hari' && butirOtomatis('2026-08-01', '2026-11-12') === 'minggu' && butirOtomatis('0000-00-00', hari) === 'bulan');

R.forEach((l) => console.log(l));
const n = R.filter((l) => l.startsWith('FAIL')).length; console.log(`${R.length - n} PASS, ${n} FAIL`); process.exit(n ? 1 : 0);
