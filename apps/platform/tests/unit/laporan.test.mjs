// Uji mesin dan laporan harian per mesin.  node tests/unit/laporan.test.mjs
import { sesiAktif, sesiAktifSemua, tanpaVoid, parseMesin, tulisMesin, sesiBerjalan, menitAntara, gabungWaktu, jamLokal, barisLaporan, totalLaporan, rekapMesin, waktuPerJenis, csvLaporan } from '../../src/lib/produksi/laporan.js';
import { tentukanRute, kumulatif, indeksLangkah, periksaMasukan, antrianPerLangkah } from '../../src/lib/produksi/rute.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const m = parseMesin('Punching 20 Ton | Yana, Supyan | 50\nPunching 40 Ton | Asep, Salam\n\nPunching 25 Ton #4 | | 60');
ok('L-01 daftar mesin dibaca: nama, operator, kapasitas', m.length === 3 && m[0].nama === 'Punching 20 Ton' && eq(m[0].operator, ['Yana', 'Supyan']) && m[0].kapasitas === 50 && m[1].kapasitas === 0 && m[2].kapasitas === 60, JSON.stringify(m));
ok('L-02 tulis dan baca bolak-balik', eq(parseMesin(tulisMesin(m)), m), tulisMesin(m));

const ev = [
  { id: 1, at: '2026-11-04T01:00:00.000Z', jenis: 'mulai', mesin: 'Punching 20 Ton', wc: 'Punching', spk_id: 'a', item_idx: 0 },
  { id: 2, at: '2026-11-04T02:00:00.000Z', jenis: 'hasil', mesin: 'Punching 20 Ton', wc: 'Punching', spk_id: 'a', item_idx: 0, qty: 8 },
  { id: 3, at: '2026-11-04T03:00:00.000Z', jenis: 'mulai', mesin: 'Punching 20 Ton', wc: 'Punching', spk_id: 'b', item_idx: 1 },
  { id: 4, at: '2026-11-04T03:10:00.000Z', jenis: 'mulai', mesin: 'Punching 40 Ton', wc: 'Punching', spk_id: 'c', item_idx: 0 },
];
ok('L-10 sesi berjalan: kejadian terakhir mesin itu bila berjenis mulai', sesiBerjalan(ev, 'Punching 20 Ton').spk_id === 'b' && sesiBerjalan(ev, 'Punching 40 Ton').spk_id === 'c');
ok('L-11 selesai atau batal mengakhiri sesi', sesiBerjalan(ev.slice(0, 2), 'Punching 20 Ton') === null && sesiBerjalan([...ev.slice(0, 3), { id: 9, at: '2026-11-04T03:30:00.000Z', jenis: 'batal', mesin: 'Punching 20 Ton', spk_id: 'b', item_idx: 1 }], 'Punching 20 Ton') === null);
ok('L-12 menit antara dua waktu', menitAntara('2026-11-04T01:00:00.000Z', '2026-11-04T02:45:30.000Z') === 105.5 && menitAntara('2026-11-04T02:00:00.000Z', '2026-11-04T01:00:00.000Z') === null);
const w = gabungWaktu('2026-11-04', '08:30');
ok('L-13 jam lokal bolak-balik', jamLokal(w) === '08:30' && gabungWaktu('2026-11-04', 'x') === null);

const hasil = [
  { id: 1, jenis: 'hasil', at: 'a', tgl: '2026-11-04', mulai: gabungWaktu('2026-11-04', '08:00'), selesai: gabungWaktu('2026-11-04', '09:45'), menit: 105, mesin: 'Punching 20 Ton', wc: 'Punching', spk_no: '434', customer: 'CV. ARTD', item_desc: 'CABLE TRAY W 250 H 50', tebal: '1.2', qty: 8, reject: 0, berat: 10, tonase: 80, operator: 'Yana' },
  { id: 2, jenis: 'hasil', at: 'b', tgl: '2026-11-04', mulai: gabungWaktu('2026-11-04', '10:00'), selesai: gabungWaktu('2026-11-04', '10:40'), menit: 40, mesin: 'Punching 20 Ton', wc: 'Punching', spk_no: '432', customer: 'PT. POINT', item_desc: 'CABLE TRAY W 200 H 150', tebal: '1.2', qty: 10, reject: 1, berat: 12, tonase: 120, operator: 'Yana' },
  { id: 3, jenis: 'hasil', at: 'c', tgl: '2026-11-04', mulai: gabungWaktu('2026-11-04', '08:00'), menit: 60, mesin: 'Punching 40 Ton', wc: 'Punching', item_desc: 'JOINTING W 150', qty: 150, reject: 0 },
  { id: 4, jenis: 'mulai', at: 'd', tgl: '2026-11-04', mesin: 'Punching 20 Ton', wc: 'Punching', qty: 0 },
];
const bl = barisLaporan(hasil, { tgl: '2026-11-04', mesin: 'Punching 20 Ton' });
ok('L-20 laporan satu mesin: baris urut jam mulai, hanya hasil', bl.length === 2 && bl[0].spk === '434' && bl[1].spk === '432' && bl[0].mulai === '08:00' && bl[0].selesai === '09:45');
ok('L-21 menit per pcs dan total', bl[0].menitPerPcs === 13.13 && eq(totalLaporan(bl), { qty: 18, reject: 1, menit: 145, tonase: 200 }), JSON.stringify(totalLaporan(bl)));
ok('L-22 laporan seluruh work center memuat semua mesin', barisLaporan(hasil, { tgl: '2026-11-04', wc: 'Punching' }).length === 3);
const rk = rekapMesin(hasil, '2026-11-01', '2026-11-30');
const r20 = rk.find((x) => x.mesin === 'Punching 20 Ton');
ok('L-30 rekap per mesin: hasil, reject, tonase, jam, menit per pcs', r20.qty === 18 && r20.reject === 1 && r20.tonase === 200 && r20.jam === 2.4 && r20.menitPerPcs === 8.06 && r20.hariAktif === 1, JSON.stringify(r20));
ok('L-31 waktu per jenis item di sebuah work center', waktuPerJenis(hasil).some((x) => x.wc === 'Punching' && x.jenis === 'CABLE TRAY' && x.menitPerPcs === 8.06), JSON.stringify(waktuPerJenis(hasil)));
const csv = csvLaporan(bl, { wc: 'Punching', mesin: 'Punching 20 Ton', tgl: '2026-11-04' });
ok('L-40 CSV: kepala, kolom form, dan total', csv.includes('No,Mulai,Selesai') && csv.includes('CV. ARTD') && csv.trim().split('\r\n').slice(-1)[0].includes(',200,'), csv.split('\r\n').slice(-1)[0]);

// Mesin alternatif: Cover dipotong di Shearing atau Laser
const cov = tentukanRute({ judulSection: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', deskripsi: 'COVER TRAY W 200 L 3000' }, undefined, undefined, { vendor: true });
ok('L-50 Cover: rute Shearing, Bending, Vendor dengan Laser sebagai alternatif Shearing', eq(cov.rute, ['Shearing', 'Bending', 'Vendor ELG']) && eq(cov.alt, { Shearing: ['CNC Laser'] }));
const jnt = tentukanRute({ judulSection: 'ACCS TRAY TYPE STU 1.2', deskripsi: 'JOINTING W 150' });
ok('L-51 Jointing: Shearing atau Laser lalu Punching', eq(jnt.rute, ['Shearing', 'Punching']) && eq(jnt.alt, { Shearing: ['CNC Laser'] }));
const clp = tentukanRute({ judulSection: 'CABLE TRAY TYPE STU 1.2', deskripsi: 'COVER CLAMP W 300 H 150' });
ok('L-52 Clamp: Laser atau Shearing lalu Bending (didahulukan dari aturan Cover)', eq(clp.rute, ['CNC Laser', 'Bending']) && eq(clp.alt, { 'CNC Laser': ['Shearing'] }));
const rc = cov.rute, altc = cov.alt;
ok('L-53 indeks langkah: mesin alternatif memenuhi langkahnya', indeksLangkah(rc, altc, 'CNC Laser') === 0 && indeksLangkah(rc, altc, 'Shearing') === 0 && indeksLangkah(rc, altc, 'Welding') === -1);
const kc = kumulatif(rc, [{ wc: 'CNC Laser', qty: 30 }, { wc: 'Shearing', qty: 20 }, { wc: 'Bending', qty: 10 }], altc);
ok('L-54 hasil di Laser dan Shearing sama-sama dihitung ke langkah pertama', eq(kc, { Shearing: 50, Bending: 10, 'Vendor ELG': 0 }), JSON.stringify(kc));
ok('L-55 operator Laser boleh mencatat untuk langkah Shearing, batas tetap dari qty SPK', periksaMasukan(rc, kc, 60, 'CNC Laser', 10, 0, altc).ok === true && periksaMasukan(rc, kc, 60, 'CNC Laser', 11, 0, altc).ok === false);
ok('L-56 antrian langkah pertama dibagi dua mesin alternatif', antrianPerLangkah(rc, kc, 60)[0].antri === 10);

// Beberapa sesi sekaligus: dua item di satu mesin, satu item di dua mesin
const par = [
  { id: 1, at: '2026-11-04T01:00:00.000Z', jenis: 'mulai', mesin: 'Punching 1', wc: 'Punching', spk_id: 'a', item_idx: 0, target: 30 },
  { id: 2, at: '2026-11-04T01:05:00.000Z', jenis: 'mulai', mesin: 'Punching 1', wc: 'Punching', spk_id: 'b', item_idx: 0, target: 5 },
  { id: 3, at: '2026-11-04T01:10:00.000Z', jenis: 'mulai', mesin: 'Punching 2', wc: 'Punching', spk_id: 'a', item_idx: 0, target: 10 },
];
ok('L-60 satu mesin boleh mengerjakan dua item sekaligus; satu item boleh di dua mesin', sesiAktif(par, 'Punching 1').length === 2 && sesiAktif(par, 'Punching 2').length === 1 && sesiAktifSemua(par).length === 3);
const par2 = [...par, { id: 4, at: '2026-11-04T02:00:00.000Z', jenis: 'hasil', mesin: 'Punching 1', wc: 'Punching', spk_id: 'a', item_idx: 0, qty: 10 }];
ok('L-61 hasil menutup hanya sesi item itu di mesin itu', sesiAktif(par2, 'Punching 1').length === 1 && sesiAktif(par2, 'Punching 1')[0].spk_id === 'b' && sesiAktif(par2, 'Punching 2').length === 1);
const par3 = [...par2, { id: 5, at: '2026-11-04T02:00:01.000Z', jenis: 'mulai', mesin: 'Punching 1', wc: 'Punching', spk_id: 'a', item_idx: 0, target: 20 }];
ok('L-62 selesai sebagian lalu lanjut: sesi baru terbuka untuk sisanya', sesiAktif(par3, 'Punching 1').length === 2);
// Pembatalan catatan
const evv = [{ id: 'x1', jenis: 'hasil', qty: 8, wc: 'Shearing' }, { id: 'x2', jenis: 'hasil', qty: 5, wc: 'Shearing' }, { id: 'v1', jenis: 'void', ref: 'x1', wc: 'Shearing' }];
ok('L-63 catatan yang dibatalkan dan catatan pembatalnya dibuang dari hitungan', eq(tanpaVoid(evv).map((e) => e.id), ['x2']));
ok('L-64 pembatalan membuat kumulatif kembali', kumulatif(['Shearing', 'Punching'], tanpaVoid(evv)).Shearing === 5 && kumulatif(['Shearing', 'Punching'], evv).Shearing === 13);

const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n') + `\n${R.length - fail} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
