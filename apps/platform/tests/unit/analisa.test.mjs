// Uji analisa produksi untuk manajemen.  node tests/unit/analisa.test.mjs
import { rentangHari, outputWC, lamaPerProduk, produkDari, ringkasVendor, menitJam, analisaDock } from '../../src/lib/produksi/analisa.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

ok('A-01 rentang hari berurutan dan berakhir di tanggal akhir', eq(rentangHari('2026-11-04', 3), ['2026-11-02', '2026-11-03', '2026-11-04']));
ok('A-02 rentang melewati pergantian bulan', eq(rentangHari('2026-11-02', 4), ['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']));

const ev = (id, wc, tgl, qty, extra = {}) => ({ id, jenis: 'hasil', wc, tgl, qty, at: tgl + 'T05:00:00.000Z', mesin: wc + ' 1', ...extra });
const kej = [
  ev(1, 'Punching', '2026-11-02', 40, { menit: 120, tonase: 300 }), ev(2, 'Punching', '2026-11-03', 60, { menit: 180, reject: 3, tonase: 450 }),
  ev(3, 'Bending', '2026-11-03', 20, { menit: 100 }), ev(4, 'Punching', '2026-10-01', 999),
  ev(5, 'Punching', '2026-11-04', 10), { id: 6, jenis: 'void', ref: 5, wc: 'Punching', tgl: '2026-11-04' },
];
const o = outputWC({ kejadian: kej, wcList: [{ nama: 'Punching', kapasitas: 50 }, { nama: 'Bending', kapasitas: 0 }, { nama: 'Welding', kapasitas: 30 }], sampai: '2026-11-04', hari: 7 });
const pu = o.find((x) => x.wc === 'Punching');
ok('A-03 output memakai kejadian dalam rentang saja (di luar rentang dan yang dibatalkan dibuang)', pu.qty === 100 && pu.hariAktif === 2, JSON.stringify([pu.qty, pu.hariAktif]));
ok('A-04 rata-rata per hari aktif, puncak, dan utilisasi terhadap kapasitas', pu.rataHari === 50 && pu.puncak === 60 && pu.utilisasi === 1 && pu.utilisasiPuncak === 1.2, JSON.stringify([pu.rataHari, pu.puncak, pu.utilisasi]));
ok('A-05 reject persen, menit per pcs, dan tonase', pu.rejectPct === 0.03 && pu.menitPerPcs === 3 && pu.tonase === 750, JSON.stringify([pu.rejectPct, pu.menitPerPcs, pu.tonase]));
ok('A-06 tren memuat setiap hari dalam rentang', pu.tren.length === 7 && pu.tren[pu.tren.length - 1].qty === 0 && pu.tren.find((t) => t.tgl === '2026-11-03').qty === 60);
ok('A-07 kapasitas kosong: utilisasi null; work center tanpa hasil: nol', o.find((x) => x.wc === 'Bending').utilisasi === null && o.find((x) => x.wc === 'Welding').qty === 0 && o.find((x) => x.wc === 'Welding').utilisasi === null);
ok('A-08 mesin diurutkan dari output terbanyak', pu.mesin[0].nama === 'Punching 1' && pu.mesin[0].qty === 100);

ok('A-09 jenis produk dari dua kata pertama deskripsi', produkDari('Cable Tray W100xH100xL3000 1.2') === 'CABLE TRAY' && produkDari('') === '-');
const rec = [
  { produk: 'CABLE TRAY', qty: 100, spkTgl: '2026-10-01', mulai: '2026-10-03T08:00:00Z', selesaiProduksi: '2026-10-07T08:00:00Z', vendorKirim: '2026-10-08', vendorKembali: '2026-10-14', terkirim: '2026-10-16' },
  { produk: 'CABLE TRAY', qty: 50, spkTgl: '2026-10-02', mulai: '2026-10-04T08:00:00Z', selesaiProduksi: '2026-10-06T08:00:00Z', vendorKirim: null, vendorKembali: null, terkirim: '2026-10-09' },
  { produk: 'COVER', qty: 20, spkTgl: '2026-10-05', mulai: '2026-10-06', selesaiProduksi: null, vendorKirim: null, vendorKembali: null, terkirim: null },
];
const lp = lamaPerProduk(rec); const ct = lp.find((x) => x.produk === 'CABLE TRAY'); const cv = lp.find((x) => x.produk === 'COVER');
ok('A-10 lama per tahap dirata-rata hanya dari item yang tahapnya terjadi', ct.item === 2 && ct.tunggu === 2.3 && ct.produksi === 3 && ct.vendor === 6 && ct.tungguVendor === 0.7, JSON.stringify(ct));
ok('A-11 total SPK sampai terkirim dan kirim customer dari vendor bila ada', ct.total === 11 && ct.kirim === 2.4 && ct.terkirim === 2, JSON.stringify([ct.total, ct.kirim]));
ok('A-12 item yang belum selesai tidak mengisi tahap berikutnya', cv.produksi === null && cv.total === null && cv.terkirim === 0 && cv.tunggu === 1);
ok('A-13 urut menurut jumlah item', lp[0].produk === 'CABLE TRAY');

const pg = [
  { vendor: 'V1', proses: 'HDG', tglKirim: '2026-11-02', tglKembali: '2026-11-06', qty: 30, reject: 1, noSJ: 'SJ1', sisa: 0 },
  { vendor: 'V1', proses: 'HDG', tglKirim: '2026-11-09', tglKembali: null, qty: 20, reject: 0, noSJ: 'SJ2', sisa: 20 },
  { vendor: 'V1', proses: 'ELG', tglKirim: '2026-11-03', tglKembali: '2026-11-04', qty: 10, reject: 0, noSJ: 'SJ3', sisa: 0 },
  { vendor: 'V2', proses: 'HDG', tglKirim: '2026-11-02', tglKembali: '2026-11-13', qty: 40, reject: 4, noSJ: 'SJ4', sisa: 0 },
];
const rv = ringkasVendor(pg, '2026-11-13'); const v1h = rv.baris.find((x) => x.vendor === 'V1' && x.proses === 'HDG');
ok('A-14 keluar, masuk, dan sisa per vendor dan proses', v1h.keluar === 50 && v1h.masuk === 30 && v1h.sisa === 20 && v1h.kiriman === 2 && v1h.selesai === 1, JSON.stringify(v1h));
ok('A-15 kecepatan: rata-rata, tercepat, dan terlama dalam hari kerja', v1h.rataTAT === 4 && rv.baris.find((x) => x.vendor === 'V2').rataTAT === 9 && rv.baris.find((x) => x.vendor === 'V2').terlama === 9);
ok('A-16 reject persen terhadap barang keluar', rv.baris.find((x) => x.vendor === 'V2').rejectPct === 0.1 && v1h.rejectPct === 0.02);
ok('A-17 daftar masih di vendor menyebut umur dalam hari kerja, terlama di atas', rv.terbuka.length === 1 && rv.terbuka[0].noSJ === 'SJ2' && rv.terbuka[0].umur === 4);

ok('A-18 menit antar jam, kosong atau terbalik menghasilkan null', menitJam('08:00', '09:30') === 90 && menitJam('', '09:00') === null && menitJam('10:00', '09:00') === null);
const dk = [
  { jenis: 'Loading', muatan: 'Barang Jadi', pihak: 'Cust A', tgl: '2026-11-03', jamMasuk: '08:00', jamMulai: '08:30', jamSelesai: '09:30', status: 'Selesai' },
  { jenis: 'Loading', muatan: 'Barang Jadi', pihak: 'Cust A', tgl: '2026-11-04', jamMasuk: '10:00', jamMulai: '10:10', jamSelesai: '10:50', status: 'Selesai' },
  { jenis: 'Unloading', muatan: 'Barang Setengah Jadi', pihak: 'V1', tgl: '2026-11-04', jamMasuk: '13:00', jamMulai: '13:05', jamSelesai: '13:35', status: 'Selesai' },
  { jenis: 'Loading', muatan: 'Barang Jadi', pihak: 'Cust B', tgl: '2026-11-04', jamMasuk: '', jamMulai: '', jamSelesai: '', status: 'Antri' },
  { jenis: 'Loading', muatan: 'Barang Jadi', pihak: 'Cust A', tgl: '2026-09-01', jamMasuk: '08:00', jamMulai: '08:00', jamSelesai: '20:00', status: 'Selesai' },
];
const ad = analisaDock(dk, '2026-11-01', '2026-11-04'); const lj = ad.perJenis.find((x) => x.jenis === 'Loading' && x.muatan === 'Barang Jadi');
ok('A-19 loading barang jadi: jumlah, rata-rata tunggu dan proses (menit), di luar rentang dibuang', lj.n === 3 && lj.rataTunggu === 20 && lj.rataProses === 50 && lj.terlama === 60, JSON.stringify(lj));
ok('A-20 unloading dari vendor dihitung terpisah', ad.perJenis.find((x) => x.jenis === 'Unloading').rataProses === 30);
ok('A-21 ringkasan antri, proses, dan selesai; per pihak menyebut customer', ad.antri === 1 && ad.selesai === 3 && ad.perPihak.some((x) => x.pihak === 'Cust A' && x.rataProses === 50));

const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.length - fail} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
