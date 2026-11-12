// Uji kebutuhan material dan reservasi.  node tests/unit/material.test.mjs
import { bahanDariJenis, FAKTOR_SISA_DEFAULT, faktorSisa, bahanTebal, kunciMaterial, kelompokKebutuhan, reservasiAktif, rencanaMaterial, usulanPr, susutMaterial } from '../../src/lib/erp/material.js';

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));

ok('K-01 faktor sisa: awal 1,1; nilai di luar 1 sampai 2 atau bukan angka diganti nilai awal', faktorSisa(undefined) === FAKTOR_SISA_DEFAULT && faktorSisa('1,25') === 1.25 && faktorSisa(0.5) === FAKTOR_SISA_DEFAULT && faktorSisa(3) === FAKTOR_SISA_DEFAULT && faktorSisa('abc') === FAKTOR_SISA_DEFAULT);
ok('K-02 bahan dan tebal dari judul section', JSON.stringify(bahanTebal('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED')) === '{"bahan":"SPHC","tebal":1.2}' && JSON.stringify(bahanTebal('CABLE LADDER TYPE SLU 2.0 HOTDIP GALVANIZED')) === '{"bahan":"SPHC","tebal":2}' && JSON.stringify(bahanTebal('CABLE TRAY TYPE STU 1.5 STAINLESS STEEL 304')) === '{"bahan":"SS304","tebal":1.5}' && bahanTebal('CABLE TRAY 1.0 STAINLESS STEEL 316L').bahan === 'SS316' && bahanTebal('CABLE TRAY 1.2 ALUMINIUM 1100').bahan === 'Aluminium' && bahanTebal('CABLE TRAY 1.2 ALUMINIUM 1100').tebal === 1.2);
ok('K-03 tebal cadangan dari tebal SPK bila judul tanpa angka tebal; kunci seragam', bahanTebal('ACCS TRAY', '1.6').tebal === 1.6 && bahanTebal('ACCS TRAY').tebal === 0 && kunciMaterial('SPHC', '1.20') === 'SPHC|1.2' && kunciMaterial('SS304', 2) === 'SS304|2');
const items = [
  { d: 'A', g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', q: 10, w: 6 },
  { d: 'B', g: 'ACCS TRAY TYPE STU 1.2 ELECTRO GALVANIZED', q: 4, w: 2.5 },
  { d: 'C', g: 'CABLE LADDER TYPE SLU 2.0 HOTDIP GALVANIZED', q: 5, w: 30 },
  { d: 'D', g: 'CABLE LADDER TYPE SLU 2.0 HOTDIP GALVANIZED', q: 2, w: 0 },
];
const kel = kelompokKebutuhan(items, { faktor: 1.1 });
ok('K-04 kelompok per bahan dan tebal: netto, bruto = netto x faktor, item tanpa berat dilaporkan', kel.length === 2 && kel[0].kunci === 'SPHC|1.2' && kel[0].netto === 70 && kel[0].bruto === 77 && kel[0].baris === 2 && kel[1].kunci === 'SPHC|2' && kel[1].netto === 150 && kel[1].bruto === 165 && JSON.stringify(kel[1].tanpaBerat) === '["D"]', JSON.stringify(kel.map((k) => [k.kunci, k.netto, k.bruto])));
ok('K-05 faktor tak sah memakai nilai awal', kelompokKebutuhan(items, { faktor: 9 })[0].bruto === 77 && kelompokKebutuhan(items, { faktor: 1 })[0].bruto === 70);
const rm = [
  { id: 'r1', label: 'Plat 1.2 x 1219 x 2438', bahan: 'SPHC', tebal: 1.2, kgPerLbr: 28, stok: 2 },
  { id: 'r2', label: 'Plat 1.2 x 1219 x 3000', bahan: 'SPHC', tebal: 1.2, kgPerLbr: 34, stok: 3 },
  { id: 'r3', label: 'Plat 2.0 x 1219 x 2438', bahan: 'SPHC', tebal: 2, kgPerLbr: 47, stok: 10 },
  { id: 'r4', label: 'Pipa', bahan: 'SPHC', tebal: 1.2, kgPerLbr: 0, stok: 99 },
];
const rc = rencanaMaterial(kel, rm, {});
ok('K-06 rencana: kandidat sama bahan dan tebal (tanpa kgPerLbr nol), stok fisik dijumlah dalam kg, status Kurang atau Cukup', rc[0].kandidat.join() === 'r1,r2' && rc[0].fisikKg === 158 && rc[0].status === 'Cukup' && rc[1].fisikKg === 470 && rc[1].status === 'Cukup' && rc[0].utama.id === 'r2' && rc[0].butuhLbr === 3, JSON.stringify(rc.map((r) => [r.status, r.fisikKg, r.butuhLbr])));
const rc2 = rencanaMaterial(kel, rm, { reservasiLain: { 'SPHC|1.2': 100, 'SPHC|2': 400 } });
ok('K-07 reservasi SPK lain mengurangi tersedia; kekurangan dalam kg dan lembar dari item utama', rc2[0].tersediaKg === 58 && rc2[0].kurangKg === 19 && rc2[0].status === 'Kurang' && rc2[0].kurangLbr === 1 && rc2[1].tersediaKg === 70 && rc2[1].kurangKg === 95 && rc2[1].kurangLbr === 3, JSON.stringify(rc2.map((r) => [r.tersediaKg, r.kurangKg, r.kurangLbr])));
const rc3 = rencanaMaterial(kel, rm, { keluar: { 'SPHC|1.2': 77 } });
ok('K-08 material yang sudah dikeluarkan gudang untuk dokumen ini mengurangi kebutuhan; semua keluar = Sudah dikeluarkan', rc3[0].status === 'Sudah dikeluarkan' && rc3[0].butuhKg === 0 && rencanaMaterial(kel, rm, { keluar: { 'SPHC|1.2': 30 } })[0].butuhKg === 47);
const rc4 = rencanaMaterial(kelompokKebutuhan([{ d: 'X', g: 'CABLE TRAY 1.5 STAINLESS STEEL 304', q: 1, w: 5 }]), rm, {});
ok('K-09 tanpa item bahan baku yang cocok: status Tanpa item RM dan tidak masuk usulan PR', rc4[0].status === 'Tanpa item RM' && rc4[0].utama === null && usulanPr(rc4).length === 0);
const pr = usulanPr(rc2);
ok('K-10 usulan PR hanya untuk yang Kurang: item utama, lembar, kg', pr.length === 2 && pr[0].item === 'r2' && pr[0].q === 1 && pr[0].kg === 34 && pr[1].item === 'r3' && pr[1].q === 3 && usulanPr(rc).length === 0);
const rs = reservasiAktif([
  { id: 'S1', aktif: true, kelompok: [{ kunci: 'SPHC|1.2', bruto: 77 }, { kunci: 'SPHC|2', bruto: 165 }], keluar: { 'SPHC|1.2': 30 } },
  { id: 'S2', aktif: true, kelompok: [{ kunci: 'SPHC|1.2', bruto: 20 }], keluar: {} },
  { id: 'S3', aktif: false, kelompok: [{ kunci: 'SPHC|1.2', bruto: 999 }], keluar: {} },
  { id: 'S4', aktif: true, kelompok: [{ kunci: 'SPHC|1.2', bruto: 10 }], keluar: { 'SPHC|1.2': 50 } },
]);
ok('K-11 reservasi aktif: sisa = bruto - keluar (tidak negatif), SPK tidak aktif diabaikan, total dan per SPK', rs.total['SPHC|1.2'] === 67 && rs.total['SPHC|2'] === 165 && rs.perSpk.S1['SPHC|1.2'] === 47 && rs.perSpk.S2['SPHC|1.2'] === 20 && !rs.perSpk.S3 && !('SPHC|1.2' in rs.perSpk.S4), JSON.stringify(rs.total));

const rc5 = rencanaMaterial(kel, rm, { reservasiLain: { 'SPHC|1.2': 100 }, dipesan: { 'SPHC|1.2': 19 } });
const rc6 = rencanaMaterial(kel, rm, { reservasiLain: { 'SPHC|1.2': 100 }, dipesan: { 'SPHC|1.2': 5 } });
ok('K-12 PR terbuka menutup kekurangan (status Sudah dipesan, tidak masuk usulan PR); PR sebagian hanya mengurangi kekurangan', rc5[0].status === 'Sudah dipesan' && rc5[0].kurangKg === 0 && usulanPr(rc5).length === 0 && rc6[0].status === 'Kurang' && rc6[0].kurangKg === 14 && usulanPr(rc6)[0].q === 1);

ok('K-13 jenis material bawaan dan kustom dipetakan ke bahan SPK: A5052 (massa jenis 2,68) dan AL6061 ke Aluminium, SUS304L dan 316L ke stainless, SPCC dan Lainnya ke SPHC', bahanDariJenis('A5052', 2.68) === 'Aluminium' && bahanDariJenis('AL6061', 0) === 'Aluminium' && bahanDariJenis('A1100', 0) === 'Aluminium' && bahanDariJenis('SUS304L', 7.93) === 'SS304' && bahanDariJenis('SS316L', 7.98) === 'SS316' && bahanDariJenis('SPCC') === 'SPHC' && bahanDariJenis('Lainnya') === 'SPHC' && bahanDariJenis('Aluminium') === 'Aluminium' && bahanDariJenis('Baja Karbon', 7.85) === 'SPHC' && bahanDariJenis('', 0) === 'SPHC');

// ---- susut bahan baku (T6) ----
{
  const rencana = [{ kunci: 'SPHC|1.2', bahan: 'SPHC', tebal: 1.2, netto: 1000 }, { kunci: 'SPHC|2|', bahan: 'SPHC', tebal: 2, netto: 500 }];
  const hasilSelesai = [{ kunci: 'SPHC|1.2', netto: 1000 }, { kunci: 'SPHC|2|', netto: 100 }];
  const s1 = susutMaterial(rencana, hasilSelesai, { 'SPHC|1.2': 1085, 'SPHC|2|': 150 }, { faktor: 1.1 });
  ok('K-S1 susut wajar: keluar 1085 kg, hasil 1000 kg = 7,8% (batas 14,1%); produksi belum selesai = Berjalan', s1[0].status === 'Wajar' && Math.abs(s1[0].susutKg - 85) < 0.01 && s1[0].pct < s1[0].batas && s1[1].status === 'Berjalan');
  const s2 = susutMaterial(rencana, hasilSelesai, { 'SPHC|1.2': 1400 }, { faktor: 1.1 });
  ok('K-S2 susut berlebih: keluar 1400 kg, hasil 1000 kg = 28,6% di atas batas', s2[0].status === 'Berlebih' && s2[0].pct > s2[0].batas);
  const s3 = susutMaterial(rencana, hasilSelesai, { 'SPHC|1.2': 900 }, { faktor: 1.1 });
  ok('K-S3 hasil melebihi plat yang tercatat keluar = Plat kurang catat; tanpa keluar dan tanpa hasil = Belum keluar', s3[0].status === 'Plat kurang catat' && susutMaterial(rencana, [], {}, {})[0].status === 'Belum keluar');
  ok('K-S4 batas mengikuti faktor sisa potong: faktor 1,2 menaikkan batas', susutMaterial(rencana, hasilSelesai, { 'SPHC|1.2': 1085 }, { faktor: 1.2 })[0].batas > s1[0].batas);
}

// ---- waste tidak dihitung dua kali (berat estimasi sudah memuat waste) ----
{
  const g = 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED';
  const campur = kelompokKebutuhan([{ d: 'A', g, q: 10, w: 10, sudahWaste: true }, { d: 'B', g, q: 10, w: 10 }], { faktor: 1.1 });
  ok('K-W1 item berat estimasi (sudahWaste) tidak dikali faktor; item berat biasa tetap dikali 1,1', campur.length === 1 && campur[0].netto === 200 && Math.abs(campur[0].bruto - 210) < 1e-9 && Math.abs(campur[0].faktorEfektif - 1.05) < 1e-9, JSON.stringify(campur[0]));
  const semuaEst = kelompokKebutuhan([{ d: 'A', g, q: 1000, w: 14.712, sudahWaste: true }], { faktor: 1.1 });
  ok('K-W2 1000 pcs berat estimasi 14,712 kg: bruto = 14.712 kg (bukan 16.183 kg)', semuaEst[0].netto === 14712 && semuaEst[0].bruto === 14712 && semuaEst[0].faktorEfektif === 1);
  const sm = susutMaterial(semuaEst, [{ kunci: semuaEst[0].kunci, netto: 14712 }], { [semuaEst[0].kunci]: 15000 }, { faktor: 1.1 });
  ok('K-W3 batas susut grup berat estimasi hanya toleransi 5%: keluar 15.000 kg vs hasil 14.712 kg = 1,9% Wajar; keluar 16.000 kg = 8,05% Berlebih', sm[0].status === 'Wajar' && Math.abs(sm[0].batas - 0.05) < 1e-9 && susutMaterial(semuaEst, [{ kunci: semuaEst[0].kunci, netto: 14712 }], { [semuaEst[0].kunci]: 16000 }, { faktor: 1.1 })[0].status === 'Berlebih');
}

const gagal = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`${R.length - gagal} PASS, ${gagal} FAIL`);
process.exit(gagal ? 1 : 0);
