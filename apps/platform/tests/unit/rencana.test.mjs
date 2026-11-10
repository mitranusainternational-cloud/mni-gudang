// Uji rencana jadwal otomatis.  node tests/unit/rencana.test.mjs
import { susunRencana } from '../../src/lib/produksi/rencana.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const T = '2026-11-05'; // Kamis; Sabtu 7 dan Minggu 8 libur
const it = (key, no, due, q, steps, extra = {}) => ({ key, spkId: 's' + no, no, customer: 'C' + no, due, idx: 0, d: 'Item ' + key, u: 'Btg', q, kir: 0, steps, ...extra });
const st = (w, val = 0, extra = {}) => ({ w, vend: false, val, out: 0, ...extra });
const tgls = (r, key, wc) => r.blok.filter((b) => b.key === key && b.wc === wc).map((b) => b.tgl + ':' + b.qty);

let r = susunRencana({ item: [it('A', 1, '2026-11-30', 100, [st('Shearing'), st('Punching')])], kapasitas: {}, hariIni: T });
ok('R-01 tanpa kapasitas: tiap langkah satu hari kerja berurutan, siap kirim hari kerja berikutnya (lewat akhir pekan)', tgls(r, 'A', 'Shearing')[0] === '2026-11-05:100' && tgls(r, 'A', 'Punching')[0] === '2026-11-06:100' && r.selesai.A.kirim === '2026-11-09', JSON.stringify([r.blok.map((b) => b.tgl), r.selesai.A]));
ok('R-10 langkah tanpa kapasitas ditandai', r.tanpaKap.includes('Shearing') && r.blok.every((b) => b.tanpaKap), JSON.stringify(r.tanpaKap));

r = susunRencana({ item: [it('A', 1, '2026-11-30', 100, [st('Shearing'), st('Punching')])], kapasitas: { Shearing: 60, Punching: 100 }, hariIni: T });
ok('R-02 kapasitas membagi pekerjaan ke beberapa hari; langkah berikut mulai setelah langkah sebelumnya selesai', JSON.stringify(tgls(r, 'A', 'Shearing')) === JSON.stringify(['2026-11-05:60', '2026-11-06:40']) && tgls(r, 'A', 'Punching')[0] === '2026-11-09:100', JSON.stringify(r.blok.map((b) => b.wc + b.tgl + b.qty)));
ok('R-09 beban harian tidak melebihi kapasitas', r.beban.Shearing['2026-11-05'].qty === 60 && r.beban.Shearing['2026-11-05'].kap === 60 && r.beban.Shearing['2026-11-06'].qty === 40, JSON.stringify(r.beban.Shearing));

r = susunRencana({ item: [it('B', 2, '2026-11-12', 100, [st('Shearing')]), it('A', 1, '2026-11-10', 100, [st('Shearing')])], kapasitas: { Shearing: 100 }, hariIni: T });
ok('R-03 due date lebih awal mendapat kapasitas lebih dulu', tgls(r, 'A', 'Shearing')[0] === '2026-11-05:100' && tgls(r, 'B', 'Shearing')[0] === '2026-11-06:100', JSON.stringify(r.blok.map((b) => b.key + b.tgl)));

r = susunRencana({ item: [it('A', 1, '2026-12-30', 150, [st('Shearing')])], kapasitas: { Shearing: 50 }, hariIni: T });
ok('R-04 akhir pekan dilewati: Kamis, Jumat, lalu Senin', JSON.stringify(tgls(r, 'A', 'Shearing')) === JSON.stringify(['2026-11-05:50', '2026-11-06:50', '2026-11-09:50']), JSON.stringify(tgls(r, 'A', 'Shearing')));

r = susunRencana({ item: [it('A', 1, '2026-12-30', 100, [st('Bending'), { w: 'Vendor ELG', vend: true, val: 0, out: 0 }])], kapasitas: { Bending: 100 }, hariIni: T, tatVendor: 3 });
const v1 = r.blok.find((b) => b.vendor);
ok('R-05 vendor belum dikirim: mulai setelah langkah terakhir, kembali tiga hari kerja kemudian', v1 && v1.dari === '2026-11-06' && v1.sampai === '2026-11-11', JSON.stringify(v1));
r = susunRencana({ item: [it('A', 1, '2026-12-30', 100, [st('Bending', 100), { w: 'Vendor ELG', vend: true, val: 0, out: 100 }])], kapasitas: { Bending: 100 }, hariIni: T, tatVendor: 3 });
const v2 = r.blok.find((b) => b.vendor);
ok('R-05b sudah di vendor: hitungan tiga hari kerja dari hari ini', v2 && v2.dari === '2026-11-05' && v2.sampai === '2026-11-10', JSON.stringify(v2));

r = susunRencana({ item: [it('A', 1, '2026-12-30', 100, [st('Shearing', 100), st('Punching', 40)])], kapasitas: { Shearing: 100, Punching: 50 }, hariIni: T });
ok('R-06 langkah selesai dilewati dan sisanya mulai hari ini', r.blok.every((b) => b.wc === 'Punching') && tgls(r, 'A', 'Punching')[0] === '2026-11-05:50' && tgls(r, 'A', 'Punching')[1] === '2026-11-06:10', JSON.stringify(tgls(r, 'A', 'Punching')));

const mk = (due) => susunRencana({ item: [it('A', 1, due, 100, [st('Shearing')])], kapasitas: { Shearing: 100 }, hariIni: T }).spk.s1;
ok('R-07 status SPK: telat bila perkiraan (6 Nov) lewat due, mepet bila sisa satu hari atau kurang, selisih benar', mk('2026-11-05').status === 'telat' && mk('2026-11-05').selisih === -1 && mk('2026-11-06').status === 'mepet' && mk('2026-11-06').selisih === 0 && mk('2026-11-07').status === 'mepet' && mk('2026-11-20').status === 'aman' && mk('2026-11-20').selisih === 14, JSON.stringify([mk('2026-11-05'), mk('2026-11-06'), mk('2026-11-20')]));

r = susunRencana({ item: [it('A', 1, '2026-12-30', 100, [st('Shearing', 100)], { kir: 100 })], kapasitas: {}, hariIni: T });
ok('R-08 item yang sudah terkirim penuh tidak dijadwalkan; SPK berstatus selesai', r.blok.length === 0 && r.selesai.A.selesai && r.spk.s1.status === 'selesai', JSON.stringify(r.spk));

const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
