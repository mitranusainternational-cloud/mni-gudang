// Uji statistik Laporan Produksi.  node tests/unit/statistik.test.mjs
import { periodeRentang, kelompokkan, totalPeriode, butirOtomatis, tren, akumulasi, klasifikasi, pohonProduk, rincianProduk, bentukDari } from '../../src/lib/produksi/statistik.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// 2026-11-04 adalah hari Rabu
ok('S-01 periode: hari, minggu (Senin), bulan, tahun, 7 hari', eq(periodeRentang('hari', '2026-11-04'), { dari: '2026-11-04', sampai: '2026-11-04', label: 'Hari ini' })
  && periodeRentang('minggu', '2026-11-04').dari === '2026-11-02' && periodeRentang('bulan', '2026-11-04').dari === '2026-11-01' && periodeRentang('tahun', '2026-11-04').dari === '2026-01-01' && periodeRentang('7', '2026-11-04').dari === '2026-10-29');
ok('S-02 minggu pada hari Minggu mulai dari Senin sebelumnya', periodeRentang('minggu', '2026-11-08').dari === '2026-11-02' && periodeRentang('minggu', '2026-11-02').dari === '2026-11-02');
ok('S-03 butir otomatis: hari, minggu, bulan', butirOtomatis('2026-11-01', '2026-11-04') === 'hari' && butirOtomatis('2026-08-01', '2026-11-04') === 'minggu' && butirOtomatis('2026-01-01', '2026-11-04') === 'bulan');

const ev = (id, tgl, wc, mesin, op, cust, desc, qty, extra = {}) => ({ id, jenis: 'hasil', tgl, wc, mesin, operator: op, customer: cust, item_desc: desc, qty, at: tgl + 'T05:00:00.000Z', ...extra });
const kej = [
  ev(1, '2026-11-04', 'Punching', 'P1', 'Yana', 'PT A', 'Cable Tray W100', 60, { menit: 120, tonase: 480, reject: 3, selesai: '2026-11-04T05:00:00.000Z' }),
  ev(2, '2026-11-04', 'Punching', 'P2', 'Asep', 'PT B', 'Cable Ladder W300', 40, { menit: 60, tonase: 700 }),
  ev(3, '2026-11-03', 'Punching', 'P1', 'Yana', 'PT A', 'Cable Tray W100', 30, { menit: 60, tonase: 240, selesai: '2026-11-03T03:00:00.000Z' }),
  ev(4, '2026-11-02', 'Bending', 'B1', 'Yana', 'PT A', 'Cable Tray W100', 20, { tonase: 160 }),
  ev(5, '2026-10-15', 'Bending', 'B1', 'Asep', 'PT B', 'Cover W200', 50, { menit: 100, tonase: 200 }),
  ev(6, '2026-01-10', 'Shearing', 'S1', 'Yana', 'PT A', 'Cable Tray W100', 100, { tonase: 800 }),
  ev(7, '2026-11-04', 'Punching', 'P1', 'Yana', 'PT A', 'Cable Tray W100', 5, { tonase: 40 }), { id: 8, jenis: 'void', ref: 7, tgl: '2026-11-04' },
];

const w = kelompokkan(kej, { dari: '2026-11-01', sampai: '2026-11-04', by: 'wc' }); const pu = w.find((x) => x.nama === 'Punching');
ok('S-04 kelompok per work center: qty, tonase, hari aktif; yang dibatalkan dan di luar periode dibuang', pu.qty === 130 && pu.tonase === 1420 && pu.hariAktif === 2 && !w.find((x) => x.nama === 'Shearing'), JSON.stringify([pu.qty, pu.tonase, pu.hariAktif]));
ok('S-05 kecepatan: pcs per jam, kg per jam, dan menit per pcs hanya dari catatan berwaktu', pu.pcsPerJam === 32.5 && pu.kgPerJam === 355 && pu.menitPerPcs === 1.85, JSON.stringify([pu.pcsPerJam, pu.kgPerJam, pu.menitPerPcs]));
ok('S-06 rata-rata per hari aktif dan reject persen', pu.rataHari === 65 && pu.rejectPct === 0.02, JSON.stringify([pu.rataHari, pu.rejectPct]));
ok('S-07 pangsa qty dan tonase terhadap total, urut dari terbesar', w[0].nama === 'Punching' && pu.pangsaQty === 0.87 && pu.pangsaTonase === 0.9, JSON.stringify([w[0].nama, pu.pangsaQty, pu.pangsaTonase]));
ok('S-08 catatan tanpa waktu tidak masuk kecepatan: Bending tanpa menit tidak punya kecepatan', w.find((x) => x.nama === 'Bending').pcsPerJam === null && w.find((x) => x.nama === 'Bending').qty === 20);
ok('S-09 jeda pencatatan: selisih saat dicatat dan jam selesai (menit)', pu.jedaCatat === 60, String(pu.jedaCatat));

const op = kelompokkan(kej, { dari: '2026-11-01', sampai: '2026-11-04', by: 'operator' });
ok('S-10 per operator', op.find((x) => x.nama === 'Yana').qty === 110 && op.find((x) => x.nama === 'Asep').qty === 40);
const ms = kelompokkan(kej, { dari: '2026-11-01', sampai: '2026-11-04', by: 'mesin' });
ok('S-11 per mesin', ms.find((x) => x.nama === 'P1').qty === 90 && ms.find((x) => x.nama === 'P2').qty === 40);
const pr = kelompokkan(kej, { dari: '2026-11-01', sampai: '2026-11-04', by: 'produk' });
ok('S-12 per produk memakai dua kata pertama deskripsi', pr.find((x) => x.nama === 'CABLE TRAY').qty === 110 && pr.find((x) => x.nama === 'CABLE LADDER').qty === 40);
const cu = kelompokkan(kej, { dari: '2026-11-01', sampai: '2026-11-04', by: 'customer' });
ok('S-13 per customer', cu.find((x) => x.nama === 'PT A').qty === 110 && cu.find((x) => x.nama === 'PT B').tonase === 700);

const tp = totalPeriode(kej, { dari: '2026-11-01', sampai: '2026-11-04' });
ok('S-14 total periode: qty, tonase, hari aktif, rata-rata, kecepatan keseluruhan', tp.qty === 150 && tp.tonase === 1580 && tp.hariAktif === 3 && tp.rataHari === 50 && tp.pcsPerJam === 32.5, JSON.stringify(tp));

const t1 = tren(kej, { dari: '2026-11-01', sampai: '2026-11-04' });
ok('S-15 tren per hari memuat semua hari dalam rentang (termasuk yang nol)', t1.butir === 'hari' && t1.titik.length === 4 && t1.titik[0].qty === 0 && t1.titik[3].qty === 100 && t1.titik[1].qty === 20, JSON.stringify(t1.titik));
const t2 = tren(kej, { dari: '2026-10-01', sampai: '2026-11-04', butir: 'minggu' });
ok('S-16 tren per minggu berawal Senin dan menjumlah qty minggu itu', t2.titik[0].kunci === '2026-09-28' && t2.titik.find((x) => x.kunci === '2026-11-02').qty === 150 && t2.titik.find((x) => x.kunci === '2026-10-12').qty === 50, JSON.stringify(t2.titik.length));
const t3 = tren(kej, { dari: '0000-00-00', sampai: '2026-11-04', butir: 'bulan' });
ok('S-17 tren per bulan dari data pertama (semua data)', t3.titik[0].kunci === '2026-01' && t3.titik.length === 11 && t3.titik[10].qty === 150 && t3.titik[9].qty === 50, JSON.stringify(t3.titik.map((x) => x.qty)));
ok('S-18 tren dengan filter operator dan mesin', tren(kej, { dari: '2026-11-01', sampai: '2026-11-04', operator: 'Asep' }).titik[3].qty === 40 && tren(kej, { dari: '2026-11-01', sampai: '2026-11-04', mesin: 'P1' }).titik[3].qty === 60);

const ak = akumulasi(kej, { by: 'operator', sampai: '2026-11-04' }); const y = ak.baris.find((x) => x.nama === 'Yana');
ok('S-19 akumulasi operator: hari ini, minggu ini, bulan ini, tahun ini, total', y.hari.qty === 60 && y.minggu.qty === 110 && y.bulan.qty === 110 && y.tahun.qty === 210 && y.total.qty === 210, JSON.stringify([y.hari.qty, y.minggu.qty, y.bulan.qty, y.tahun.qty, y.total.qty]));
ok('S-20 akumulasi tonase tiap jendela', y.hari.tonase === 480 && y.minggu.tonase === 880 && y.total.tonase === 1680, JSON.stringify([y.hari.tonase, y.minggu.tonase, y.total.tonase]));
ok('S-21 rata-rata per hari aktif dan hari terbaik', y.hariAktif === 4 && y.rataHari === 52.5 && y.terbaik === 100, JSON.stringify([y.hariAktif, y.rataHari, y.terbaik]));
ok('S-22 jumlah semua operator per jendela, urut dari terbesar', ak.jumlah.hari.qty === 100 && ak.jumlah.total.qty === 300 && ak.baris[0].nama === 'Yana', JSON.stringify(ak.jumlah.total));
const am = akumulasi(kej, { by: 'mesin', sampai: '2026-11-04' });
ok('S-23 akumulasi per mesin', am.baris.find((x) => x.nama === 'P1').hari.qty === 60 && am.baris.find((x) => x.nama === 'B1').bulan.qty === 20 && am.baris.find((x) => x.nama === 'B1').tahun.qty === 70);
ok('S-24 data setelah tanggal acuan tidak ikut', akumulasi(kej, { by: 'operator', sampai: '2026-11-03' }).baris.find((x) => x.nama === 'Yana').hari.qty === 30);

// Klasifikasi dan pohon produk (kelompok, type, material)
const kl = (j, d, m) => klasifikasi(j, d, m);
ok('S-25 klasifikasi Cable Tray: type, finishing, material', eq(kl('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', 'Cable Tray W100', 'spcc'), { kelompok: 'Cable Tray', induk: '', tipe: 'STU', finishing: 'ELG', material: 'SPCC', produk: 'CABLE TRAY', bentuk: 'Straight' }));
ok('S-26 Cable Ladder dan Cable Duct dikenali; non finishing disebut', kl('CABLE LADDER TYPE SLW 2.0 HOTDIP GALVANIZED', 'x', '').kelompok === 'Cable Ladder' && kl('CABLE LADDER TYPE SLW 2.0 HOTDIP GALVANIZED', 'x', '').tipe === 'SLW' && kl('CABLE DUCT TYPE STU 1.5 NON FINISHING', 'x', 'SS304').finishing === 'Non finishing' && kl('CABLE DUCT TYPE STU 1.5 NON FINISHING', 'x', '').kelompok === 'Cable Duct');
ok('S-27 aksesoris dikenali dari judul ACCS (dengan induknya) atau dari deskripsi', kl('ACCS LADDER TYPE SLW 2.0 HOTDIP GALVANIZED', 'Horizontal Elbow', '').kelompok === 'Aksesoris' && kl('ACCS LADDER TYPE SLW 2.0 HOTDIP GALVANIZED', 'Horizontal Elbow', '').induk === 'Ladder' && kl('', 'Clamp Hanger 20', '').kelompok === 'Aksesoris');
ok('S-28 cover tidak tertukar dengan cable tray', kl('COVER CABLE TRAY 1.2 ELECTRO', 'Cover 200', '').kelompok === 'Cover' && kl('', 'sesuatu', '').kelompok === 'Lainnya');

const kk = (id, tgl, kel, tipe, mat, fin, qty, ton) => ({ id, jenis: 'hasil', tgl, wc: 'Punching', mesin: 'P1', operator: 'Yana', customer: 'PT A', item_desc: 'x', kelompok: kel, tipe, material: mat, finishing: fin, qty, tonase: ton, at: tgl + 'T05:00:00.000Z', menit: 60 });
const kp = [kk(1, '2026-11-04', 'Cable Tray', 'STU', 'SPCC', 'ELG', 100, 800), kk(2, '2026-11-04', 'Cable Tray', 'STU', 'SPCC', 'HDG', 50, 400), kk(3, '2026-11-04', 'Cable Tray', 'STC', 'SPCC', 'ELG', 30, 240),
  kk(4, '2026-11-04', 'Cable Ladder', 'SLW', 'SPCC', 'HDG', 60, 1050), kk(5, '2026-11-04', 'Aksesoris', 'SLW', 'SPCC', 'HDG', 20, 188), kk(6, '2026-11-04', 'Cable Duct', 'STU', 'SS304', '', 10, 150), kk(7, '2026-01-01', 'Cable Tray', 'STU', 'SPCC', 'ELG', 999, 1)];
const pk = pohonProduk(kp, { dari: '2026-11-01', sampai: '2026-11-04' });
const tray = pk.find((x) => x.depth === 0 && x.nama === 'Cable Tray');
ok('S-29 pohon: tingkat kelompok memuat jumlah qty dan tonase tiap kelompok, urut terbesar, di luar periode dibuang', pk.filter((x) => x.depth === 0).map((x) => x.nama + ':' + x.qty).join() === 'Cable Tray:180,Cable Ladder:60,Aksesoris:20,Cable Duct:10', pk.filter((x) => x.depth === 0).map((x) => x.nama + ':' + x.qty).join());
ok('S-30 pohon: type di bawah kelompok (STU 150, STC 30) dan material di bawah type', pk.filter((x) => x.depth === 1 && x.jalur.startsWith('Cable Tray')).map((x) => x.nama + ':' + x.qty).join() === 'STU:150,STC:30' && pk.filter((x) => x.depth === 2 && x.jalur.startsWith('Cable Tray > STU')).map((x) => x.nama + ':' + x.qty).join() === 'SPCC · ELG:100,SPCC · HDG:50');
ok('S-31 pangsa terhadap seluruh produksi dan kecepatan per simpul', tray.pangsaQty === 0.67 && tray.tonase === 1440 && tray.pcsPerJam === 60 && tray.punyaAnak === true && pk.find((x) => x.depth === 2).punyaAnak === false, JSON.stringify([tray.pangsaQty, tray.tonase, tray.pcsPerJam]));
ok('S-32 material tanpa finishing hanya menyebut material; kelompok bisa dipakai sebagai sumbu tunggal', pk.some((x) => x.nama === 'SS304') && pohonProduk(kp, { dari: '2026-11-01', sampai: '2026-11-04', sumbu: ['tipe'] }).map((x) => x.nama + ':' + x.qty).join() === 'STU:160,SLW:80,STC:30');

const akk = akumulasi(kp, { by: 'kelompok', sampai: '2026-11-04' });
ok('S-33 akumulasi per kelompok produk dan per type', akk.baris.find((x) => x.nama === 'Cable Tray').hari.qty === 180 && akk.baris.find((x) => x.nama === 'Cable Tray').total.qty === 1179 && akumulasi(kp, { by: 'tipe', sampai: '2026-11-04' }).baris.find((x) => x.nama === 'SLW').hari.qty === 80);
ok('S-34 kelompokkan per kelompok dan per material', kelompokkan(kp, { dari: '2026-11-01', sampai: '2026-11-04', by: 'kelompok' })[0].nama === 'Cable Tray' && kelompokkan(kp, { dari: '2026-11-01', sampai: '2026-11-04', by: 'material' }).some((x) => x.nama === 'SS304'));

// Laporan per jenis produk (permintaan pemilik 2026-11-12): triwulan, bentuk, tebal, finishing, tonase aktual dan estimasi
const evk = (kls, d, qty, ton, est, extra = {}) => ({ jenis: 'hasil', tgl: '2026-10-15', item_desc: d, qty, tonase: ton, tonaseEst: est, reject: 0, ...kls, ...extra });
const kA = (j, d, m) => ({ ...klasifikasi(j, d, m), tebal: '1.2' });
const evs2 = [
  evk(kA('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', 'Cable Tray W200xH50xL3000', 'SPHC'), 'Cable Tray W200xH50xL3000', 100, 1500, 1650),
  evk(kA('CABLE TRAY TYPE STC 1.2 ELECTRO GALVANIZED', 'Cable Tray W100xH50xL3000', 'SPHC'), 'Cable Tray W100xH50xL3000', 40, 400, 440),
  evk(kA('ACCS TRAY TYPE STU 1.2 ELECTRO GALVANIZED', 'Cable Tray Elbow W200xH50xR300', 'SPHC'), 'Cable Tray Elbow W200xH50xR300', 30, 150, 165),
  evk(kA('ACCS TRAY TYPE STU 1.2 ELECTRO GALVANIZED', 'Cable Tray Tee W1200xW2200xW3200xH50xR300', 'SPHC'), 'Cable Tray Tee W200', 10, 80, 88),
  evk(kA('OTHER SUPPORT TYPE STU 1.2 ELECTRO GALVANIZED', 'Hanger Beam W200', 'SPHC'), 'Hanger Beam W200', 500, 125, 130),
];
const rp = rincianProduk(evs2, { dari: '2026-10-01', sampai: '2026-12-31' });
ok('S-60 rincian produk: Cable Tray per type (STU dan STC terpisah), Aksesoris per bentuk (Elbow, Tee), Other Support (Hanger Beam), total qty dan tonase aktual', rp.baris.length === 5 && rp.total.qty === 680 && rp.total.tonase === 2255 && rp.total.tonaseEst === 2473 && rp.baris.some((r) => r.kelompok === 'Cable Tray' && r.tipe === 'STC' && r.qty === 40) && rp.baris.some((r) => r.bentuk === 'Elbow' && r.finishing === 'ELG') && rp.baris.some((r) => r.bentuk === 'Hanger Beam' && r.produk === 'OTHER SUPPORT' && r.qty === 500), JSON.stringify(rp.total));
ok('S-61 urutan rincian mengikuti kelompok: Cable Tray dulu, Aksesoris, lalu Other Support (kelompok Aksesoris)', rp.baris[0].kelompok === 'Cable Tray' && rp.baris[rp.baris.length - 1].produk === 'OTHER SUPPORT', rp.baris.map((r) => r.kelompok + '/' + r.bentuk).join(', '));
ok('S-62 periode triwulan berjalan dan triwulan lalu (lintas tahun benar)', eq(periodeRentang('triwulan', '2026-11-12'), { dari: '2026-10-01', sampai: '2026-11-12', label: 'Triwulan IV 2026 (berjalan)' }) && eq(periodeRentang('triwulanlalu', '2026-11-12'), { dari: '2026-07-01', sampai: '2026-09-30', label: 'Triwulan III 2026' }) && periodeRentang('triwulanlalu', '2026-02-03').dari === '2025-10-01' && periodeRentang('triwulanlalu', '2026-02-03').sampai === '2025-12-31');
ok('S-63 bentuk dari deskripsi: Elbow, Inside Riser, Tee, Hanger Beam, Cover Elbow, Straight, Perforated', bentukDari('Cable Tray Elbow W1', 'Aksesoris', 'ACCS TRAY') === 'Elbow' && bentukDari('Cable Ladder Inside Riser W1', 'Aksesoris', 'ACCS LADDER') === 'Inside Riser' && bentukDari('Hanger Beam W1', 'Aksesoris', 'OTHER SUPPORT') === 'Hanger Beam' && bentukDari('Cover Elbow W1', 'Cover', 'COVER LADDER') === 'Cover Elbow' && bentukDari('Cable Duct W1xH2xL3', 'Cable Duct', 'CABLE DUCT') === 'Straight' && bentukDari('Perforated Cable Tray W1', 'Cable Tray', 'PERFORATED CABLE TRAY') === 'Perforated (straight)');
const pb = pohonProduk(evs2, { dari: '2026-10-01', sampai: '2026-12-31', sumbu: ['kelompok', 'bentuk', 'tipe'] });
ok('S-64 pohon produk dengan sumbu bentuk: Aksesoris > Elbow > STU', pb.some((r) => r.depth === 0 && r.nama === 'Aksesoris') && pb.some((r) => r.depth === 1 && r.nama === 'Elbow') && pb.some((r) => r.jalur === 'Aksesoris > Elbow > STU'), pb.map((r) => r.jalur).join(' | '));

ok('S-65 Type C dan U adalah penulisan lain STC dan STU (tidak ada type ganda)', klasifikasi('CABLE TRAY TYPE C 1.2 ELECTRO GALVANIZED', 'x', 'SPHC').tipe === 'STC' && klasifikasi('CABLE TRAY TYPE U 1.2 ELECTRO GALVANIZED', 'x', 'SPHC').tipe === 'STU');
const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.length - fail} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
