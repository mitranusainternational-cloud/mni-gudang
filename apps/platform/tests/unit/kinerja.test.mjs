// Uji posisi, lama proses, dan kualifikasi vendor.  node tests/unit/kinerja.test.mjs
import { posisiItem, posisiSPK, lamaProsesWC, selisihHariKerja, kualifikasiVendor, perkiraanKembali } from '../../src/lib/produksi/kinerja.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const rute = ['Shearing', 'Punching', 'Bending'];
const j = (x) => JSON.stringify(x);

const pos = posisiItem(rute, { Shearing: 16, Punching: 10, Bending: 4 }, 16);
ok('K-01 posisi per batang: 6 menunggu punching, 6 menunggu bending, 4 selesai', j(pos.map((x) => [x.tempat, x.qty])) === j([['Punching', 6], ['Bending', 6], ['Selesai produksi', 4]]), j(pos.map((x) => [x.tempat, x.qty])));
const posV = posisiItem(['Shearing', 'Bending', 'Vendor HDG'], { Shearing: 20, Bending: 20, 'Vendor HDG': 5 }, 20, { 'Vendor HDG': 15 });
ok('K-02 posisi di vendor: 5 belum dikirim, 10 di vendor, 5 selesai', j(posV.map((x) => [x.jenis, x.qty])) === j([['vendor-siap-kirim', 5], ['di-vendor', 10], ['selesai', 5]]), j(posV.map((x) => [x.jenis, x.qty])));
const ringkas = posisiSPK([{ rute, kum: { Shearing: 16, Punching: 10, Bending: 4 }, qty: 16 }, { rute, kum: { Shearing: 0, Punching: 0, Bending: 0 }, qty: 10 }]);
ok('K-03 ringkasan posisi SPK diurutkan terbanyak', ringkas[0].tempat === 'Shearing' && ringkas[0].qty === 10, j(ringkas));

ok('K-10 selisih hari kerja melewati akhir pekan', selisihHariKerja('2026-11-06', '2026-11-09') === 1 && selisihHariKerja('2026-11-02', '2026-11-09') === 5);
const lama = lamaProsesWC([{ qty: 10, rute: ['Shearing', 'Punching'], tglSpk: '2026-11-02', kejadian: [{ wc: 'Shearing', qty: 10, at: '2026-11-03T09:00:00' }, { wc: 'Punching', qty: 4, at: '2026-11-04T09:00:00' }, { wc: 'Punching', qty: 6, at: '2026-11-05T09:00:00' }] }]);
ok('K-11 lama proses: shearing 1 hk, punching 2 hk', lama.Shearing.rataHari === 1 && lama.Punching.rataHari === 2, j(lama));
const belum = lamaProsesWC([{ qty: 10, rute: ['Shearing'], tglSpk: '2026-11-02', kejadian: [{ wc: 'Shearing', qty: 4, at: '2026-11-03T09:00:00' }] }]);
ok('K-12 belum tuntas: tidak dihitung (tanpa angka palsu)', !belum.Shearing);

const tgt = { HDG: 5, ELG: 3 };
const kv = kualifikasiVendor([
  { vendor: 'Berkah Jaya', proses: 'HDG', tglKirim: '2026-10-05', tglKembali: '2026-10-09', qty: 30, reject: 0 },
  { vendor: 'Berkah Jaya', proses: 'HDG', tglKirim: '2026-10-12', tglKembali: '2026-10-16', qty: 30, reject: 1 },
  { vendor: 'Berkah Jaya', proses: 'HDG', tglKirim: '2026-10-19', tglKembali: '2026-10-22', qty: 40, reject: 0 },
  { vendor: 'Berkah Jaya', proses: 'HDG', tglKirim: '2026-10-26', tglKembali: '2026-11-05', qty: 20, reject: 0 },
  { vendor: 'Berkah Jaya', proses: 'HDG', tglKirim: '2026-11-02', tglKembali: null, qty: 15, reject: 0 },
  { vendor: 'Vendor Baru', proses: 'ELG', tglKirim: '2026-11-02', tglKembali: '2026-11-04', qty: 10, reject: 0 },
], tgt, '2026-11-06');
const bj = kv.find((x) => x.vendor === 'Berkah Jaya');
ok('K-20 kecepatan vendor: rata-rata 4,75 hk, tepat waktu 75%, reject 0,83%', bj.selesai === 4 && Math.abs(bj.rataTAT - 4.75) < 1e-9 && bj.tepatWaktu === 0.75 && Math.abs(bj.rejectRate - 1 / 120) < 1e-9, j([bj.rataTAT, bj.tepatWaktu, bj.rejectRate]));
ok('K-21 kualifikasi B; vendor baru: data belum cukup', bj.nilai === 'B' && kv.find((x) => x.vendor === 'Vendor Baru').nilai === 'Data belum cukup');
ok('K-22 masih di vendor: 1 kiriman, umur tertua 4 hk', bj.masihDiVendor === 1 && bj.umurTertua === 4, String(bj.umurTertua));
const pk = perkiraanKembali('Berkah Jaya', 'HDG', '2026-11-06', kv, tgt);
ok('K-23 perkiraan kembali dari median vendor', pk && pk.dasar === 'median riwayat vendor' && pk.hari === 4 && pk.tanggal === '2026-11-12', j(pk));
const pk2 = perkiraanKembali('Vendor Baru', 'ELG', '2026-11-06', kv, tgt);
ok('K-24 vendor baru memakai target proses', pk2 && pk2.dasar === 'target proses' && pk2.hari === 3, j(pk2));

const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n') + `\n${R.length - fail} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
