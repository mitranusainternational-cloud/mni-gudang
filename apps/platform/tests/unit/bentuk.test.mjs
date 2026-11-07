// Uji input item SPK terstruktur (bentuk per produk, dimensi, nama otomatis, berat).  node tests/unit/bentuk.test.mjs
// Memakai katalog sintetis di tests/e2e/fixtures (bukan rumus perusahaan), sehingga aman dijalankan di CI.
import fs from 'node:fs';
import { kunciBentuk, namaBentuk, dimensiBentuk, bentukUntukProduk, namaItem, hitungBentuk } from '../../src/lib/berat/bentuk.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const kat = JSON.parse(fs.readFileSync(new URL('../e2e/fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));
const dekat = (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

ok('B-01 kunci bentuk tanpa akhiran keluarga dan nama tampilan', kunciBentuk('ELBOW_STU_R_D', 'STU') === 'ELBOW' && kunciBentuk('COVER_STRAIGHT_SLU', 'SLU') === 'COVER_STRAIGHT' && kunciBentuk('HANGER_BEAM_STU', 'STU') === 'HANGER_BEAM' && namaBentuk('ELBOW') === 'Elbow 90' && namaBentuk('XYZ_BARU') === 'Xyz Baru');
const utama = bentukUntukProduk(kat, 'STU', 'CABLE TRAY');
ok('B-02 produk utama menampilkan bentuk pipa lurus, elbow, reducer; cover dan aksesori terpisah menurut produk; produk tanpa kalkulator kosong', utama.map((x) => x.kunci).join() === 'STRAIGHT,ELBOW,REDUCER' && bentukUntukProduk(kat, 'STU', 'COVER TRAY').map((x) => x.kunci).join() === 'COVER_STRAIGHT' && bentukUntukProduk(kat, 'SLU', 'ACCS LADDER').map((x) => x.kunci).join() === 'HANGER_BEAM' && bentukUntukProduk(kat, 'STU', 'CABLE DUCT').length === 0 && bentukUntukProduk(kat, 'XXX', 'CABLE TRAY').length === 0 && bentukUntukProduk(kat, 'STU', 'PERFORATED CABLE TRAY').length === 3);
ok('B-03 dimensi diminta berurutan W, H, L atau R; tebal, massa jenis, dan "w yang kecil" tidak ditanyakan', utama[0].dim.map((d) => d.label).join('') === 'WHL' && utama[1].dim.map((d) => d.label).join('') === 'WHR' && utama[2].dim.map((d) => d.label).join('') === 'W1W2H' && dimensiBentuk(kat, 'STU', 'HANGER_BEAM_STU').map((d) => d.label).join('') === 'W');
ok('B-04 hanya Straight tray yang punya pilihan full hole', utama[0].fullHole === true && utama[1].fullHole === false && bentukUntukProduk(kat, 'SLU', 'CABLE LADDER')[0].fullHole === false);
ok('B-05 nama item otomatis mengikuti produk dan bentuk: lurus tanpa kata bentuk, bentuk lain disebut, aksesori tanpa awalan ACCS', namaItem('CABLE TRAY', 'STRAIGHT', { w: 100, h: 50, l: 3000 }, utama[0].dim) === 'Cable Tray W100xH50xL3000' && namaItem('CABLE TRAY', 'ELBOW', { w: 100, h: 50, r: 300 }, utama[1].dim) === 'Cable Tray Elbow 90 W100xH50xR300' && namaItem('ACCS TRAY', 'HANGER_BEAM', { w: 100 }, dimensiBentuk(kat, 'STU', 'HANGER_BEAM_STU')) === 'Hanger Beam W100' && namaItem('COVER TRAY', 'COVER_STRAIGHT', { w: 100, l: 3000 }, dimensiBentuk(kat, 'STU', 'COVER_STRAIGHT_STU')) === 'Cover Tray W100xL3000' && namaItem('CABLE TRAY', 'STRAIGHT', { w: 100 }, utama[0].dim) === 'Cable Tray W100xH?xL?');
// nilai harapan dihitung tangan dari rumus fixture
const w = 100, h = 50, l = 3000, t = 1.2, bj = 7.85;
const P = ((w + h) * t * l * bj / 1e6) * 1.2, AG = ((w + h) * t * l * bj / 1e6) * 1.05;
const AI = Math.min(Math.round(w / 50), 8) * (l / 200), AL = Math.min(Math.round(w / 50), 8) * (l / 200);
const realLubang = AG - AL * 90 * t * bj / 1e6;
const realFull = AG - ((AL + 2 * Math.min(Math.round(h / 50), 8) * Math.round(l / 200)) * 90 * t * bj / 1e6);
void P; void AI;
const std = hitungBentuk(kat, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w, h, l }, tebal: 1.2, material: 'SPHC / ELG' });
const full = hitungBentuk(kat, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w, h, l }, tebal: '1,2', material: 'SPHC', lubang: 'full' });
ok('B-06 berat standar = real dikurangi lubang bawah; full hole = real dikurangi lubang bawah dan samping (lebih ringan); tebal teks berkoma diterima', std.ok && dekat(std.beratSPK, realLubang) && !std.fullHole && full.ok && dekat(full.beratSPK, realFull) && full.fullHole && full.beratSPK < std.beratSPK, JSON.stringify([std.beratSPK, full.beratSPK]));
const cover = hitungBentuk(kat, { keluarga: 'STU', bentuk: 'COVER_STRAIGHT_STU', dim: { w: 100, l: 3000 }, tebal: 1.0, material: 'SS304' });
ok('B-07 bentuk tanpa lubang memakai real; material stainless memakai massa jenisnya; pilihan full hole diabaikan bila tidak tersedia', cover.ok && dekat(cover.beratSPK, (100 * 3000 * 1.0 * 7.93 / 1e6) * 1.04) && hitungBentuk(kat, { keluarga: 'STU', bentuk: 'COVER_STRAIGHT_STU', dim: { w: 100, l: 3000 }, tebal: 1.0, material: 'SS304', lubang: 'full' }).beratSPK === cover.beratSPK);
const red = hitungBentuk(kat, { keluarga: 'STU', bentuk: 'REDUCER_STU_L_R_C', dim: { w1: 200, w2: 100, h: 50 }, tebal: 1.2, material: 'SPHC' });
ok('B-08 "jika w yang kecil" dihitung otomatis dari W1 dan W2', red.ok && red.params['jika w yg kecil'] === 100);
const kurang = hitungBentuk(kat, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 100 }, tebal: 1.2, material: 'SPHC' });
ok('B-09 ukuran kurang ditolak dengan menyebut yang harus diisi; tidak pernah angka tebakan', !kurang.ok && /H, L/.test(kurang.alasan) && kurang.beratSPK === undefined);
ok('B-10 tebal kosong, material tak dikenal, atau bentuk tak ada ditolak dengan alasan', /Tebal/.test(hitungBentuk(kat, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w, h, l }, tebal: '', material: 'SPHC' }).alasan) && /Material/.test(hitungBentuk(kat, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w, h, l }, tebal: 1.2, material: 'Kayu' }).alasan) && /Bentuk/.test(hitungBentuk(kat, { keluarga: 'STU', bentuk: 'TIDAK_ADA', dim: {}, tebal: 1.2, material: 'SPHC' }).alasan) && !hitungBentuk(kat, { keluarga: 'XXX', bentuk: 'STRAIGHT_STU', dim: {}, tebal: 1.2, material: 'SPHC' }).ok);
ok('B-11 ukuran nol atau negatif dianggap belum diisi', !hitungBentuk(kat, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 0, h: 50, l: 3000 }, tebal: 1.2, material: 'SPHC' }).ok && !hitungBentuk(kat, { keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: -5, h: 50, l: 3000 }, tebal: 1.2, material: 'SPHC' }).ok);

const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
