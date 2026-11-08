// Uji mesin rute produksi multi work center.  node tests/unit/rute.test.mjs
import { finishingDari, langkahVendor, siapKirimVendor, usulanLangkah, tentukanRute, kumulatif, antrianPerLangkah, periksaMasukan, progresItem, bebanWC, prediksiSelesai, tambahHariKerja, throughputAktual, materialDari, vendorUntuk, perluFinishing, RUTE_STANDAR } from '../../src/lib/produksi/rute.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Rute standar sesuai uraian pemilik
ok('R-01 Cable Tray: Shearing, Punching, Bending', eq(tentukanRute({ judulSection: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', deskripsi: 'Cable Tray W100xH100xL3000 1.2' }).rute, ['Shearing', 'Punching', 'Bending']));
ok('R-02 Accs: CNC Laser, Bending, Welding', eq(tentukanRute({ judulSection: 'ACCS LADDER TYPE SLW 2.0 HOTDIP GALVANIZED', deskripsi: 'Horizontal Elbow Ladder W300xH100xR600 mm' }).rute, ['CNC Laser', 'Bending', 'Welding']));
ok('R-03 Ladder: Shearing, Punching, Bending, Welding', eq(tentukanRute({ judulSection: 'CABLE LADDER TYPE SLW 2.0 HOTDIP GALVANIZED', deskripsi: 'Cable Ladder W300xH100xL3000 mm' }).rute, ['Shearing', 'Punching', 'Bending', 'Welding']));
const cov = tentukanRute({ judulSection: 'CABLE LADDER TYPE SLW 2.0', deskripsi: 'Cover Ladder W300xL3000 mm' });
ok('R-04 Cover kondisional: tanpa punching dan welding', eq(cov.rute, ['Shearing', 'Bending']) && cov.sumber === 'aturan', cov.alasan);
ok('R-05 rute yang diatur pada item menang (fleksibel)', tentukanRute({ judulSection: 'CABLE TRAY TYPE STU', deskripsi: 'x', ruteItem: ['Shearing', 'Bending'] }).sumber === 'item');
ok('R-06 produk tak dikenal: belum ada rute', tentukanRute({ judulSection: 'LAIN-LAIN', deskripsi: 'x' }).sumber === 'belum');

// Progres kumulatif dan antrian: Cable Tray 16 btg, shearing 16, punching 10, bending 4
const rute = ['Shearing', 'Punching', 'Bending'];
const ev = [{ wc: 'Shearing', qty: 10 }, { wc: 'Shearing', qty: 6 }, { wc: 'Punching', qty: 10 }, { wc: 'Bending', qty: 4 }];
const kum = kumulatif(rute, ev);
ok('R-10 kumulatif per langkah', eq(kum, { Shearing: 16, Punching: 10, Bending: 4 }));
const aq = antrianPerLangkah(rute, kum, 16);
ok('R-11 antrian: shearing 0, punching 6, bending 6', aq[0].antri === 0 && aq[1].antri === 6 && aq[2].antri === 6, JSON.stringify(aq.map((x) => x.antri)));
ok('R-12 progres item = lolos langkah terakhir (kompatibel item.prod)', progresItem(rute, kum) === 4);

// Validasi masukan
ok('R-20 tidak bisa bending melebihi yang selesai punching', periksaMasukan(rute, kum, 16, 'Bending', 7).ok === false && periksaMasukan(rute, kum, 16, 'Bending', 6).ok === true);
ok('R-21 WC di luar rute ditolak', periksaMasukan(rute, kum, 16, 'Welding', 1).ok === false);
ok('R-22 jumlah nol atau negatif ditolak', periksaMasukan(rute, kum, 16, 'Punching', 0).ok === false);
ok('R-23 langkah pertama dibatasi qty SPK', periksaMasukan(rute, { Shearing: 16, Punching: 0, Bending: 0 }, 16, 'Shearing', 1).ok === false);

// Beban WC: dua SPK, kapasitas per hari
const kapasitas = { Shearing: 100, Punching: 50, Bending: 40, Welding: 30, 'CNC Laser': 60 };
const items = [
  { spk: 633, item: 'Cable Ladder', qty: 100, rute: ['Shearing', 'Punching', 'Bending', 'Welding'], kum: { Shearing: 100, Punching: 60, Bending: 20, Welding: 0 }, due: '2026-11-12' },
  { spk: 640, item: 'Cable Tray', qty: 200, rute, kum: { Shearing: 0, Punching: 0, Bending: 0 }, due: '2026-11-20' },
];
const b = bebanWC(items, kapasitas, [{ wc: 'Punching', qty: 25 }, { wc: 'Shearing', qty: 40 }]);
ok('R-30 antrian per WC (shearing 200, punching 40, bending 40, welding 20)', b.Shearing.antri === 200 && b.Punching.antri === 40 && b.Bending.antri === 40 && b.Welding.antri === 20, JSON.stringify(['Shearing', 'Punching', 'Bending', 'Welding'].map((w) => b[w].antri)));
ok('R-31 hari habis = antrian / kapasitas', Math.abs(b.Shearing.hariHabis - 2) < 1e-9 && Math.abs(b.Bending.hariHabis - 1) < 1e-9);
ok('R-32 status: Shearing Padat, Punching Normal, CNC Laser Kosong', b.Shearing.status === 'Padat' && b.Punching.status === 'Normal' && b['CNC Laser'].status === 'Kosong');
ok('R-33 selesai hari ini dari kejadian hari ini', b.Punching.selesaiHariIni === 25 && b.Shearing.selesaiHariIni === 40);
const tanpaKap = bebanWC(items, { Shearing: 100 }, []);
ok('R-34 kapasitas belum diatur ditandai, tidak dianggap tak terbatas', tanpaKap.Punching.status === 'Kapasitas belum diatur' && tanpaKap.Punching.hariHabis === null);

// Prediksi: SPK dengan due lebih dekat didahulukan
const p = prediksiSelesai(items, kapasitas);
ok('R-40 prediksi memakai antrian menurut due date (SPK 633 lebih dulu)', p[0].hari <= p[1].hari && p[0].hari > 0, JSON.stringify(p.map((x) => [x.spk, x.hari, x.penentu])));
ok('R-41 tanpa kapasitas: prediksi null dengan alasan', prediksiSelesai(items, { Shearing: 100 })[0].hari === null);
ok('R-42 tanggal selesai = hari ini + hari kerja (lewati akhir pekan)', tambahHariKerja('2026-11-06', 3) === '2026-11-11', tambahHariKerja('2026-11-06', 3)); // Jumat + 3 hk = Rabu

// Throughput aktual (dasar saran kapasitas)
const th = throughputAktual([{ wc: 'Shearing', qty: 80, tgl: '2026-11-02' }, { wc: 'Shearing', qty: 120, tgl: '2026-11-03' }, { wc: 'Bending', qty: 30, tgl: '2026-11-03' }, { wc: 'Shearing', qty: 999, tgl: '2026-10-01' }], '2026-11-01', '2026-11-05');
ok('R-50 throughput aktual: shearing 100 per hari (2 hari aktif)', th.Shearing.total === 200 && th.Shearing.rataPerHari === 100 && th.Bending.hariAktif === 1, JSON.stringify(th.Shearing));

// Belajar dari kejadian: welding dicatat untuk item yang rutenya tidak memuat welding -> usul sisip menurut urutan mesin
const us = usulanLangkah(['Shearing', 'Bending'], [{ wc: 'Welding', qty: 2 }, { wc: 'Bending', qty: 1 }], ['Shearing', 'Punching', 'Bending', 'Welding']);
// Reject di mesin: tidak lanjut dan dibuat ulang (Cable Tray 100 btg; Bending 55 baik + 5 reject)
const evR = [{ wc: 'Shearing', qty: 100 }, { wc: 'Punching', qty: 100 }, { wc: 'Bending', qty: 55, reject: 5 }];
const kumR = kumulatif(rute, evR);
ok('R-70 reject mencabut batang dari langkah sebelumnya', eq(kumR, { Shearing: 95, Punching: 95, Bending: 55 }), JSON.stringify(kumR));
const aqR = antrianPerLangkah(rute, kumR, 100);
ok('R-71 reject muncul lagi di antrian awal, sisa Bending 40', aqR[0].antri === 5 && aqR[1].antri === 0 && aqR[2].antri === 40, JSON.stringify(aqR.map((x) => x.antri)));
ok('R-72 progres item hanya menghitung yang baik', progresItem(rute, kumR) === 55);
ok('R-73 reject saja boleh, selesai plus reject tidak boleh melebihi yang siap', periksaMasukan(rute, kumR, 100, 'Bending', 0, 3).ok === true && periksaMasukan(rute, kumR, 100, 'Bending', 38, 3).ok === false && periksaMasukan(rute, kumR, 100, 'Bending', 0, 0).ok === false);
ok('R-74 reject di langkah pertama tetap di antrian awal', eq(kumulatif(rute, [{ wc: 'Shearing', qty: 40, reject: 2 }]), { Shearing: 40, Punching: 0, Bending: 0 }));

// Langkah vendor di rute: finishing dari judul section, batas kirim, tidak dihitung sebagai beban mesin
const rv = (j) => tentukanRute({ judulSection: j, deskripsi: 'Cable Tray W100' }, undefined, undefined, { vendor: true }).rute;
ok('R-80 ELECTRO, HOTDIP, POWDER menambah langkah vendor; NON FINISHING tidak', eq(rv('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'), [...rute, 'Vendor ELG']) && eq(rv('CABLE TRAY TYPE STU 1.2 HOTDIP GALVANIZED'), [...rute, 'Vendor HDG']) && eq(rv('CABLE TRAY TYPE STU 1.2 POWDER COATING WHITE'), [...rute, 'Vendor PDC']) && eq(rv('CABLE TRAY TYPE STU NON FINISHING'), rute));
ok('R-81 tanpa opsi vendor rute tetap tiga mesin (kompatibel)', eq(tentukanRute({ judulSection: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', deskripsi: 'x' }).rute, rute));
ok('R-82 rute yang diatur pada item tidak ditambah vendor', eq(tentukanRute({ judulSection: 'CABLE TRAY ELECTRO', deskripsi: 'x', ruteItem: ['Shearing', 'Bending'] }, undefined, undefined, { vendor: true }).rute, ['Shearing', 'Bending']));
const rVen = [...rute, 'Vendor ELG'];
const kV = { Shearing: 100, Punching: 100, Bending: 60, 'Vendor ELG': 0 };
ok('R-83 batas kirim vendor = hasil langkah mesin terakhir', siapKirimVendor(rVen, kV) === 60 && siapKirimVendor(rute, kV) === null);
ok('R-84 beban mesin mengabaikan langkah vendor', !('Vendor ELG' in bebanWC([{ spk: 1, item: 'x', qty: 100, rute: rVen, kum: kV, due: '2026-12-01' }], { Bending: 40 })));
ok('R-85 prediksi tidak butuh kapasitas vendor', prediksiSelesai([{ spk: 1, item: 'x', qty: 100, rute: rVen, kum: kV, due: '2026-12-01' }], { Shearing: 100, Punching: 100, Bending: 40 })[0].hari === 1, JSON.stringify(prediksiSelesai([{ spk: 1, item: 'x', qty: 100, rute: rVen, kum: kV, due: '2026-12-01' }], { Shearing: 100, Punching: 100, Bending: 40 })));

ok('R-86 progres item tidak menghitung langkah vendor (produksi = hasil mesin terakhir)', progresItem(rVen, { Shearing: 100, Punching: 100, Bending: 70, 'Vendor ELG': 0 }) === 70);
ok('R-60 usulan langkah dari kejadian nyata', us.length === 1 && us[0].wc === 'Welding' && JSON.stringify(us[0].ruteBaru) === JSON.stringify(['Shearing', 'Bending', 'Welding']), JSON.stringify(us));

// Aturan vendor menurut material dan rute khusus bentuk (tahap 2 input SPK terstruktur)
ok('R-90 material dari judul: stainless, aluminium, selain itu baja', materialDari('CABLE TRAY TYPE STU 1.2 SS304') === 'stainless' && materialDari('CABLE TRAY STAINLESS 316') === 'stainless' && materialDari('CABLE TRAY TYPE STU 2.0 ALUMINIUM') === 'aluminium' && materialDari('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED') === 'baja');
ok('R-91 SPHC ke vendor sesuai finishing; stainless dan aluminium tanpa vendor', vendorUntuk('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED') === 'ELG' && vendorUntuk('CABLE TRAY TYPE STU 2.0 HOTDIP GALVANIZED') === 'HDG' && vendorUntuk('CABLE TRAY TYPE STU 1.5 SS304') === '' && vendorUntuk('CABLE TRAY ALUMINIUM 2.0') === '' && vendorUntuk('CABLE TRAY TYPE STU 1.2 NON FINISHING') === '');
ok('R-92 pengecualian per item: tanpa vendor mematikan, wajib vendor menghidupkan finishing yang ada di judul', vendorUntuk('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', 'tidak') === '' && vendorUntuk('CABLE TRAY TYPE STU 1.5 SS304 HOTDIP', 'ya') === 'HDG' && vendorUntuk('CABLE TRAY TYPE STU 1.5 SS304', 'ya') === '');
ok('R-93 baja tanpa finishing dan bukan Non Finishing harus ditandai; Non Finishing, stainless, dan yang berfinishing tidak', perluFinishing('CABLE TRAY TYPE STU 1.2') === true && perluFinishing('CABLE TRAY TYPE STU 1.2 NON FINISHING') === false && perluFinishing('CABLE TRAY TYPE STU 1.5 SS304') === false && perluFinishing('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED') === false);
const peta = { ...RUTE_STANDAR, 'CABLE TRAY|ELBOW': ['Shearing', 'Bending'] };
const jd = 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED';
ok('R-94 rute khusus bentuk mengalahkan rute produk; bentuk lain tetap rute produk; vendor tetap ditambahkan', eq(tentukanRute({ judulSection: jd, deskripsi: 'x' }, peta, undefined, { vendor: true, bentuk: 'ELBOW' }).rute, ['Shearing', 'Bending', 'Vendor ELG']) && eq(tentukanRute({ judulSection: jd, deskripsi: 'x' }, peta, undefined, { vendor: true, bentuk: 'STRAIGHT' }).rute, ['Shearing', 'Punching', 'Bending', 'Vendor ELG']));
ok('R-95 kunci rute khusus bentuk tidak dianggap produk; vv tanpa vendor menghapus langkah vendor', eq(tentukanRute({ judulSection: 'CABLE TRAY 1.2 ELECTRO', deskripsi: 'x' }, peta, undefined, { vendor: true, vv: 'tidak' }).rute, ['Shearing', 'Punching', 'Bending']));

// Snapshot rute di item membawa mesin alternatif; master yang berubah tidak memengaruhi item bersnapshot
const snapRute = tentukanRute({ judulSection: 'ACCS TRAY TYPE STU 1.2 NON FINISHING', deskripsi: 'Hanger Beam W100' }, RUTE_STANDAR, undefined, { vendor: true });
const dariSnap = tentukanRute({ judulSection: 'ACCS TRAY TYPE STU 1.2 NON FINISHING', deskripsi: 'Hanger Beam W100', ruteItem: snapRute.rute, altItem: snapRute.alt }, { 'ACCS TRAY': ['Welding'] }, undefined, { vendor: true });
ok('R-96 snapshot membawa rute dan alt (Hanger: CNC Laser dengan alternatif Shearing); rute master yang berubah tidak memengaruhinya', eq(dariSnap.rute, ['CNC Laser', 'Bending']) && eq(dariSnap.alt, { 'CNC Laser': ['Shearing'] }) && dariSnap.sumber === 'item', JSON.stringify(dariSnap));

// Fitting di section ACCS (T-220): memakai rute produk ACCS tanpa kunci per bentuk; Hanger/Clamp tetap aturan khusus; rute khusus bentuk tetap bisa menimpa
const jdA = 'ACCS TRAY TYPE STU 1.2 ELECTRO GALVANIZED';
const ruteAccs = ['CNC Laser', 'Bending', 'Welding'];
ok('R-97 Elbow, Tee, Cross, Riser, Reducer di section ACCS memakai rute produk ACCS (CNC Laser, Bending, Welding) lalu vendor', ['ELBOW', 'TEE', 'CROSS', 'INSIDE_RISER', 'OUTSIDE_RISER', 'REDUCER'].every((b) => { const h = tentukanRute({ judulSection: jdA, deskripsi: 'Cable Tray Elbow 90 W100xH50xR300' }, RUTE_STANDAR, undefined, { vendor: true, bentuk: b }); return h.sumber === 'produk' && eq(h.rute, [...ruteAccs, 'Vendor ELG']); }));
ok('R-98 ACCS LADDER dan ACCS DUCT juga memakai rute produknya; Hanger Beam di ACCS tetap aturan khusus', eq(tentukanRute({ judulSection: 'ACCS LADDER TYPE STU 1.5 NON FINISHING', deskripsi: 'Cable Ladder Elbow 90 W100xH50xR300' }).rute, ruteAccs) && eq(tentukanRute({ judulSection: 'ACCS DUCT 1.2 NON FINISHING', deskripsi: 'Cable Duct Tee W100xH50' }).rute, ruteAccs) && tentukanRute({ judulSection: jdA, deskripsi: 'Hanger Beam W100' }).sumber === 'aturan');
ok('R-99 rute khusus bentuk ACCS TRAY|ELBOW (bila pemilik mengaturnya) menimpa rute produk, bentuk lain tidak terpengaruh', eq(tentukanRute({ judulSection: jdA, deskripsi: 'x' }, { ...RUTE_STANDAR, 'ACCS TRAY|ELBOW': ['CNC Laser', 'Bending'] }, undefined, { bentuk: 'ELBOW' }).rute, ['CNC Laser', 'Bending']) && eq(tentukanRute({ judulSection: jdA, deskripsi: 'x' }, { ...RUTE_STANDAR, 'ACCS TRAY|ELBOW': ['CNC Laser', 'Bending'] }, undefined, { bentuk: 'TEE' }).rute, ruteAccs));

const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n') + `\n${R.length - fail} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
