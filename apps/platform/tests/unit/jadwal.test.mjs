// Uji Papan Jadwal (Gantt) SPK.  node tests/unit/jadwal.test.mjs
import { susunJadwal, perkiraanSelesai, selisihHari, geserHari, hasilBerlaku, sumbuTanggal, langkahItem, susunMesin } from '../../src/lib/produksi/jadwal.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const H = '2026-11-04';
const hasil = (id, spk, item, tgl, qty = 10) => ({ id, jenis: 'hasil', spk_id: spk, item_idx: item, tgl, qty, at: tgl + 'T05:00:00.000Z' });

ok('J-01 selisih dan geser hari melewati pergantian bulan', selisihHari('2026-10-30', '2026-11-02') === 3 && geserHari('2026-10-30', 3) === '2026-11-02');
ok('J-02 hasil yang dibatalkan (void) tidak dihitung', hasilBerlaku([hasil(1, 'a', 0, H), hasil(2, 'a', 0, H), { id: 3, jenis: 'void', ref: 2 }, { id: 4, jenis: 'mulai', spk_id: 'a' }]).map((e) => e.id).join() === '1');
ok('J-03 perkiraan selesai: progres 50% setelah 3 hari berarti 3 hari lagi', perkiraanSelesai('2026-11-02', H, 0.5) === geserHari(H, 3), String(perkiraanSelesai('2026-11-02', H, 0.5)));
ok('J-04 perkiraan kosong bila belum mulai atau sudah selesai', perkiraanSelesai(null, H, 0.5) === null && perkiraanSelesai('2026-11-02', H, 0) === null && perkiraanSelesai('2026-11-02', H, 1) === null);

const spk = [
  { id: 'a', no: '1001', customer: 'PT A', tgl: '2026-10-30', due: '2026-11-09', pP: 0.5, pK: 0, items: [{ idx: 0, d: 'Cable Tray', q: 100, u: 'Btg', pct: 0.5 }, { idx: 1, d: 'Cover', q: 50, u: 'Btg', pct: 0 }] },
  { id: 'b', no: '1002', customer: 'PT B', tgl: '2026-11-01', due: '2026-11-02', pP: 0.2, pK: 0, items: [{ idx: 0, d: 'Ladder', q: 10, u: 'Btg', pct: 0.2 }] },
  { id: 'c', no: '1003', customer: 'PT C', tgl: '2026-10-20', due: '2026-10-31', pP: 1, pK: 1, items: [{ idx: 0, d: 'Duct', q: 5, u: 'Btg', pct: 1 }] },
  { id: 'd', no: '1004', customer: 'PT D', tgl: '2026-11-03', due: '2026-11-20', pP: 0, pK: 0, items: [] },
  { id: 'e', no: '1005', customer: 'PT E', tgl: '2026-11-01', due: '2026-11-06', pP: 0.2, pK: 0, items: [] },
];
const kej = [hasil(1, 'a', 0, '2026-11-02'), hasil(2, 'a', 0, '2026-11-03'), hasil(3, 'b', 0, '2026-11-01'), hasil(4, 'c', 0, '2026-10-25'), hasil(5, 'c', 0, '2026-10-28'), hasil(6, 'e', 0, '2026-11-02'),
  { id: 7, jenis: 'mulai', spk_id: 'a', item_idx: 1, tgl: H, at: H + 'T02:00:00.000Z' }];
const vendor = [{ spk: 'c', vendor: 'ELG X', tgl: '2026-10-29', tglKembali: '2026-10-30', status: 'Selesai' }, { spk: 'a', vendor: 'HDG Y', tgl: '2026-11-03', tglKembali: null, status: 'Di Vendor' }];
const kirim = [{ spk: 'c', tgl: '2026-10-31', tglTerima: '2026-11-01', status: 'Diterima' }];
const j = susunJadwal({ spk, kejadian: kej, vendor, kirim, hariIni: H, aktif: new Set(['a']) });
const by = (id) => j.baris.find((b) => b.id === id);

ok('J-05 satu baris per SPK, urutan masukan dijaga', j.baris.map((b) => b.no).join() === '1001,1002,1003,1004,1005');
ok('J-06 produksi: dari kejadian pertama sampai hari ini bila belum selesai', by('a').prod.dari === '2026-11-02' && by('a').prod.sampai === H && by('a').prod.jalan === true);
ok('J-07 produksi selesai berakhir di hasil terakhir, bukan hari ini', by('c').prod.dari === '2026-10-25' && by('c').prod.sampai === '2026-10-28' && by('c').prod.jalan === false, JSON.stringify(by('c').prod));
ok('J-08 vendor terbuka memanjang sampai hari ini; yang kembali berhenti di tanggal kembali', by('a').vendor.terbuka === true && by('a').vendor.sampai === H && by('c').vendor.terbuka === false && by('c').vendor.sampai === '2026-10-30');
ok('J-09 pengiriman dibaca dari tanggal kirim sampai terima', by('c').kirim.dari === '2026-10-31' && by('c').kirim.sampai === '2026-11-01');
ok('J-10 status: selesai, telat, risiko telat, jalan, belum mulai', by('c').status === 'selesai' && by('b').status === 'telat' && by('e').status === 'risiko' && by('a').status === 'jalan' && by('d').status === 'belum', j.baris.map((b) => b.status).join());
ok('J-11 SPK selesai tidak punya perkiraan; telat menghitung sisa hari negatif', by('c').perkiraan === null && by('b').sisaHari === -2 && by('a').sisaHari === 5 && by('c').sisaHari === null);
ok('J-12 baris item: tanggal dari kejadian item itu, persen dari masukan, item belum mulai kosong', by('a').items[0].dari === '2026-11-02' && by('a').items[0].pct === 0.5 && by('a').items[1].dari === H && by('a').items[1].pct === 0);
ok('J-13 sedang dikerjakan ditandai dari himpunan aktif', by('a').sedang === true && by('b').sedang === false);
ok('J-14 rentang sumbu mencakup terbit paling awal, due paling akhir, dan hari ini plus satu minggu', j.awal === '2026-10-19' && j.akhir >= '2026-11-21' && j.hari === selisihHari(j.awal, j.akhir) + 1, j.awal + ' → ' + j.akhir);
ok('J-15 tanpa SPK tetap menghasilkan rentang di sekitar hari ini', (() => { const k = susunJadwal({ spk: [], hariIni: H }); return k.baris.length === 0 && k.awal < H && k.akhir > H; })());
const sm = sumbuTanggal('2026-11-01', '2026-11-22', 'minggu');
ok('J-16 sumbu minggu memberi label tiap Senin; tanggal awal dilewati bila terlalu dekat Senin pertama', sm.map((x) => x.tgl).join() === '2026-11-02,2026-11-09,2026-11-16' && sumbuTanggal('2026-11-05', '2026-11-22', 'minggu')[0].tgl === '2026-11-05', sm.map((x) => x.tgl).join());
ok('J-17 sumbu bulan memberi label tiap tanggal 1; awal ikut hanya bila lebih dari 14 hari dari tanggal 1 berikutnya', sumbuTanggal('2026-10-20', '2026-12-05', 'bulan').map((x) => x.tgl).join() === '2026-11-01,2026-12-01' && sumbuTanggal('2026-10-05', '2026-12-05', 'bulan').map((x) => x.tgl).join() === '2026-10-05,2026-11-01,2026-12-01');

// Langkah per work center dan papan per mesin
const hw = (id, spkId, item, tgl, wc, qty, mesin) => ({ id, jenis: 'hasil', spk_id: spkId, item_idx: item, tgl, wc, qty, mesin: mesin || wc, at: tgl + 'T05:00:00.000Z' });
const lk = langkahItem([hw(1, 'a', 0, '2026-11-02', 'Shearing', 10), hw(2, 'a', 0, '2026-11-03', 'Shearing', 10), hw(3, 'a', 0, '2026-11-03', 'Punching', 5, 'Punching 1')], [{ spk_id: 'a', item_idx: 0, wc: 'Bending', mesin: 'Bending 1', tgl: H }], H);
ok('J-18 langkah item: tanggal dan jumlah per work center, urut tanggal, sesi berjalan ditandai', lk.length === 3 && lk[0].wc === 'Shearing' && lk[0].dari === '2026-11-02' && lk[0].sampai === '2026-11-03' && lk[0].qty === 20 && lk[1].wc === 'Punching' && lk[1].mesin[0] === 'Punching 1' && lk[2].wc === 'Bending' && lk[2].live === true, JSON.stringify(lk.map((x) => [x.wc, x.dari, x.sampai, x.qty, x.live])));
const jj = susunJadwal({ spk: [{ id: 'a', no: '1', customer: 'X', tgl: '2026-11-01', due: '2026-11-09', pP: 0.2, pK: 0, items: [{ idx: 0, d: 'CT', q: 20, u: 'Btg', pct: 0.2 }] }], kejadian: [hw(1, 'a', 0, '2026-11-02', 'Shearing', 20)], hariIni: H, sesi: [{ spk_id: 'a', item_idx: 0, wc: 'Punching', mesin: 'Punching 1', tgl: H }] });
ok('J-19 baris item membawa langkah dan work center yang sedang aktif', jj.baris[0].items[0].langkah.length === 2 && jj.baris[0].items[0].wcAktif.join() === 'Punching');
const inf = { a: { no: '1001', customer: 'A', items: { 0: 'CT' } }, b: { no: '1002', customer: 'B', items: { 0: 'LD' } } };
const mm = susunMesin({ kejadian: [hw(1, 'a', 0, '2026-11-02', 'Shearing', 20, 'Shearing 1'), hw(2, 'b', 0, '2026-11-02', 'Shearing', 5, 'Shearing 1'), hw(3, 'b', 0, '2026-11-02', 'Punching', 5, 'Punching 2')], sesi: [{ spk_id: 'a', item_idx: 0, wc: 'Punching', mesin: 'Punching 1', tgl: H }], mesinMaster: [{ wc: 'Shearing', mesin: ['Shearing 1', 'Shearing 2'] }, { wc: 'Punching', mesin: ['Punching 1', 'Punching 2'] }], info: inf, hariIni: H });
const sh = mm.kelompok[0].baris, pu = mm.kelompok[1].baris;
ok('J-20 papan mesin: mesin tanpa pekerjaan tetap tampil kosong, urutan work center dari master', mm.kelompok.map((g) => g.wc).join() === 'Shearing,Punching' && sh.map((r) => r.mesin).join() === 'Shearing 1,Shearing 2' && sh[1].blok.length === 0 && sh[1].sedang === false);
ok('J-21 balok bertumpuk diberi lajur berbeda dan sesi berjalan memanjang sampai hari ini', sh[0].blok.length === 2 && sh[0].lajur === 2 && sh[0].blok[0].lajur !== sh[0].blok[1].lajur && pu[0].sedang === true && pu[0].blok[0].sampai === H && pu[0].blok[0].no === '1001', JSON.stringify(sh[0].blok.map((b) => [b.dari, b.sampai, b.lajur])));

const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(fail ? `\n${fail} FAIL` : '\nSEMUA PASS (' + R.length + ')');
process.exit(fail ? 1 : 0);
