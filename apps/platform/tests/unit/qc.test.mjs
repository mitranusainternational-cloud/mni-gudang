// Uji pustaka QC (DCS): standar dari SPK, toleransi, judgment, ringkasan, status, nomor dokumen.
import { penandaanItem, lapisanMin, tolTebalJis, tolUntuk, PROFIL_TOLERANSI, acuanToleransi, standarMaterial, tebalDariJudul, ukuranDariNama, standarItem, barisDariSpk, nilaiUkur, judgmentBaris, ringkasQC, statusQC, nomorQC, toleransiAktif, jumlahCacat } from '../../src/lib/qc/hitung.js';

let pass = 0, fail = 0;
const ok = (id, cond, info = '') => { if (cond) { pass++; console.log('PASS', id, info ? '· ' + info : ''); } else { fail++; console.log('FAIL', id, info ? '· ' + info : ''); } };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

ok('QC-01 tebal dari judul section', tebalDariJudul('CABLE TRAY TYPE STU 1.8 HOT DIP GALVANIZED') === 1.8 && tebalDariJudul('SUPPORT CAGE 1.2 STAINLESS STEEL 304') === 1.2 && tebalDariJudul('COVER TRAY TYPE STU 1.2 HOTDIP GALVANIZED') === 1.2 && tebalDariJudul('OTHER SUPPORT') === null && tebalDariJudul('PERFORATED CABLE TRAY TYPE STU 1,5 ELECTRO') === 1.5);
const u1 = ukuranDariNama('Cable Tray W400xH100xL3000 mm'), u2 = ukuranDariNama('Elbow Tray W50xH50xR150 mm'), u3 = ukuranDariNama('Cover Tray W400xL3000 mm'), u4 = ukuranDariNama('Bracket Mounting W50 mm');
ok('QC-02 ukuran dari nama item (W, H, L atau R)', eq(u1, { w: 400, h: 100, l: 3000 }) && eq(u2, { w: 50, h: 50, l: 150 }) && eq(u3, { w: 400, h: null, l: 3000 }) && eq(u4, { w: 50, h: null, l: null }), JSON.stringify([u1, u2, u3, u4]));
const s1 = standarItem({ d: 'Cable Tray W200xH50xL3000', g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', dim: { w: 200, h: 50, l: 3000 } });
ok('QC-03 standar item: tebal dari judul, W H L dari dimensi tersimpan', eq(s1, { t: 1.2, w: 200, h: 50, l: 3000 }), JSON.stringify(s1));
const spk = { items: [{ d: 'Cable Tray W100xH50xL3000', g: 'CABLE TRAY TYPE STU 1.2 HOT DIP', q: 10, u: 'Btg', w: 5 }, { d: 'Elbow Tray W100xH50xR300', g: 'ACCS TRAY TYPE STU 1.2 HOT DIP', q: 4, u: 'Pcs', w: 2 }] };
const baris = barisDariSpk(spk);
ok('QC-04 baris QC dari SPK: satu per item dengan standar otomatis', baris.length === 2 && eq(baris[0].std, { t: 1.2, w: 100, h: 50, l: 3000 }) && baris[1].std.l === 300 && baris[1].q === 4);
const tol = toleransiAktif({});
ok('QC-05 nilaiUkur: dalam dan di luar toleransi, kosong tidak dinilai', nilaiUkur(101.5, 100, tol.w).ok === true && nilaiUkur(103, 100, tol.w).ok === false && nilaiUkur('', 100, tol.w).ada === false && nilaiUkur('99,2', 100, tol.w).sel === -0.8);
const b0 = { ...baris[0] };
ok('QC-06 belum diisi = Belum', judgmentBaris(b0).judgment === 'Belum' && judgmentBaris(b0).qtyLulus === 0);
const bOk = { ...b0, proses: { t: 1.2, w: 100, h: 50, l: 3001 }, akhir: { t: 1.25, w: 100, h: 50, l: 3000 }, visual: { crack: 0, burr: 0 }, jointing: 'Ya' };
ok('QC-07 semua dalam toleransi tanpa cacat = OK dan seluruh qty lulus', judgmentBaris(bOk).judgment === 'OK' && judgmentBaris(bOk).qtyLulus === 10);
const bNg = { ...bOk, akhir: { ...bOk.akhir, w: 104 } };
ok('QC-08 ukuran di luar toleransi = NG, qty lulus 0, selisih tercatat', judgmentBaris(bNg).judgment === 'NG' && judgmentBaris(bNg).qtyLulus === 0 && judgmentBaris(bNg).luar[0].k === 'w' && judgmentBaris(bNg).luar[0].sel === 4);
const bRep = { ...bOk, visual: { scratch: 4 }, repaired: 4 };
ok('QC-09 cacat yang semuanya diperbaiki = OK setelah repair, qty lulus penuh', judgmentBaris(bRep).judgment === 'OK setelah repair' && judgmentBaris(bRep).qtyLulus === 10 && jumlahCacat(bRep.visual) === 4);
const bBelum = { ...bOk, visual: { burr: 3 }, repaired: 1 };
ok('QC-10 cacat belum semua diperbaiki = NG dan qty lulus dikurangi sisa cacat', judgmentBaris(bBelum).judgment === 'NG' && judgmentBaris(bBelum).sisaCacat === 2 && judgmentBaris(bBelum).qtyLulus === 8);
ok('QC-11 jointing tidak fit = NG', judgmentBaris({ ...bOk, jointing: 'Tidak' }).judgment === 'NG');
const bStd = { ...b0, sesuaiStandar: true };
ok('QC-12 "Sesuai standar" tanpa angka ukur = OK dan ditandai tanpa angka ukur', judgmentBaris(bStd).judgment === 'OK' && judgmentBaris(bStd).sesuaiStandar === true && judgmentBaris(bStd).qtyLulus === 10);
const doc = { baris: [bOk, { ...baris[1], sesuaiStandar: true }] };
const rk = ringkasQC(doc);
ok('QC-13 ringkasan dokumen: Lulus, 100 persen, tonase lulus = qty lulus x berat', rk.hasil === 'Lulus' && rk.pctLulus === 100 && rk.qtyLulus === 14 && rk.tonaseLulus === 58 && rk.sertifikat === true, JSON.stringify({ h: rk.hasil, p: rk.pctLulus, t: rk.tonaseLulus }));
const rk2 = ringkasQC({ baris: [bNg, bRep] });
ok('QC-14 satu item NG: dokumen Belum lulus, tidak ada sertifikat, persen lulus dihitung per qty, pareto cacat', rk2.hasil === 'Belum lulus' && !rk2.sertifikat && rk2.pctLulus === 50 && rk2.perCacat.scratch === 4 && rk2.cacatTotal === 4, JSON.stringify({ p: rk2.pctLulus, c: rk2.perCacat }));
ok('QC-15 dokumen sebagian diperiksa dan belum diperiksa', ringkasQC({ baris: [bOk, b0] }).hasil === 'Sebagian diperiksa' && ringkasQC({ baris: [b0] }).hasil === 'Belum diperiksa' && ringkasQC({ baris: [] }).hasil === 'Belum diperiksa');
ok('QC-16 status alur: Menunggu QC Proses, QC Proses berjalan, Menunggu QC Akhir, Selesai', statusQC({ baris: [b0, b0] }) === 'Menunggu QC Proses'
  && statusQC({ baris: [{ ...b0, proses: { w: 100 } }, b0] }) === 'QC Proses berjalan'
  && statusQC({ baris: [{ ...b0, proses: { w: 100 } }, { ...b0, proses: { w: 100 } }] }) === 'Menunggu QC Akhir'
  && statusQC({ baris: [bOk, bOk] }) === 'Selesai');
ok('QC-17 toleransi dapat diubah admin; nilai tidak valid diabaikan', toleransiAktif({ w: 5, h: 'x', t: -1 }).w === 5 && toleransiAktif({ w: 5, h: 'x', t: -1 }).h === 2 && toleransiAktif({ w: 5, h: 'x', t: -1 }).t === 0.15 && judgmentBaris(bNg, { w: 5 }).judgment === 'OK');
ok('QC-18 nomor QC: seri per bulan dan bulan baru mulai 001', nomorQC([], '2026-11-14') === 'QC/2026/11/001' && nomorQC(['QC/2026/11/001', 'QC/2026/11/007', 'QC/2026/10/050'], '2026-11-20') === 'QC/2026/11/008' && nomorQC(['QC/2026/11/007'], '2026-12-01') === 'QC/2026/12/001');
const ac = acuanToleransi({ profil: 'nema', w: 6, t: 0.15, h: 2, l: 3 });
ok('QC-19 profil toleransi dan acuannya: MNI (W 2, L 3) dan NEMA VE 1 (lebar 6) tercatat dengan sumber', PROFIL_TOLERANSI.mni.w === 2 && PROFIL_TOLERANSI.mni.l === 3 && PROFIL_TOLERANSI.nema.w === 6 && /1mm - 3mm/.test(PROFIL_TOLERANSI.mni.sumber) && /NEMA VE 1/.test(ac.label) && /W\/H ±6/.test(ac.angka), ac.angka);
ok('QC-20 standar material: SPHC ditulis dengan JIS G3131, material lain apa adanya', standarMaterial('SPHC / ELG') === 'SPHC (JIS G3131)' && standarMaterial('SS304') === 'SS304' && standarMaterial('') === '');
const tray = { d: 'Cable Tray W300xH100xL3000 mm', q: 5, w: 20, std: { t: 1.8, w: 300, h: 100, l: 3000 }, proses: { t: 1.97, w: 305, h: 108, l: 3012 }, visual: {}, jointing: 'Ya' };
const mni = { profil: 'mni' }, nema = { profil: 'nema' };
ok('QC-21 tebal 1,8 mm: batas JIS G 3193 ±0,19 (1,97 OK), bukan ±0,15; di bawah 1,6 mm tetap nilai awal', tolTebalJis(1.8) === 0.19 && tolTebalJis(2.0) === 0.2 && tolTebalJis(2.5) === 0.22 && tolTebalJis(1.2) === null && tolUntuk(tray, 't', mni) === 0.19 && tolUntuk({ std: { t: 1.2 } }, 't', mni) === 0.15);
ok('QC-22 profil NEMA untuk tray lurus: lebar ±6, kedalaman ±10, panjang 3 m ±15 (6 m dan 7,32 m ±19); profil MNI: W/H ±2, L ±3', tolUntuk(tray, 'w', nema) === 6 && tolUntuk(tray, 'h', nema) === 10 && tolUntuk(tray, 'l', nema) === 15 && tolUntuk({ ...tray, std: { ...tray.std, l: 6000 } }, 'l', nema) === 19 && tolUntuk({ ...tray, std: { ...tray.std, l: 3660 } }, 'l', nema) === 15 && tolUntuk(tray, 'w', mni) === 2 && tolUntuk(tray, 'l', mni) === 3);
ok('QC-23 ukuran yang sama dinilai berbeda menurut acuan: lebar +5, tinggi +8, panjang +12 lulus di NEMA tetapi NG di profil MNI', judgmentBaris(tray, nema).judgment === 'OK' && judgmentBaris(tray, mni).judgment === 'NG' && judgmentBaris(tray, mni).luar.length === 3, JSON.stringify(judgmentBaris(tray, mni).luar.map((x) => x.k)));
const elb = { d: 'Elbow Tray W300xH100xR300 mm', q: 1, w: 5, std: { t: 1.8, w: 300, h: 100, l: 300 }, proses: { w: 305 }, visual: {}, jointing: 'Ya' };
ok('QC-24 fitting (Elbow) tidak diatur NEMA: memakai nilai MNI (lebar +5 NG)', tolUntuk(elb, 'w', nema) === 2 && judgmentBaris(elb, nema).judgment === 'NG');
const hdg = barisDariSpk({ items: [{ d: 'Cable Tray W100xH50xL3000', g: 'CABLE TRAY TYPE STU 1.2 HOTDIP GALVANIZED', q: 4, u: 'Btg', w: 5 }, { d: 'Cable Tray W100xH50xL3000', g: 'CABLE TRAY TYPE STU 1.8 HOT DIP GALVANIZED', q: 4, u: 'Btg', w: 5 }, { d: 'Cable Tray W100xH50xL3000', g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', q: 4, u: 'Btg', w: 5 }] });
ok('QC-25 lapisan galvanis minimum ASTM A123: HDG tebal 1,2 mm = 45 µm, 1,8 mm = 65 µm, 3,2 mm ke atas = 75 µm; ELG tidak ada acuan', hdg[0].stdLap.min === 45 && hdg[1].stdLap.min === 65 && lapisanMin('X HDG', 3.2).min === 75 && lapisanMin('X HDG', 5).min === 75 && hdg[2].stdLap === null, JSON.stringify(hdg.map((b) => b.stdLap && b.stdLap.min)));
const bl = { ...hdg[1], proses: { w: 100 }, akhir: { t: 1.8, w: 100, h: 50, l: 3000 }, visual: {}, jointing: 'Ya' };
ok('QC-26 lapisan di bawah minimum = NG dengan selisih; memenuhi minimum = OK; kosong tidak dinilai', judgmentBaris({ ...bl, lapisan: 60 }).judgment === 'NG' && judgmentBaris({ ...bl, lapisan: 60 }).luar.some((x) => x.k === 'lap' && x.sel === -5) && judgmentBaris({ ...bl, lapisan: 70 }).judgment === 'OK' && judgmentBaris({ ...bl, lapisan: '' }).judgment === 'OK');
const iso = { stdLapisan: 'iso' };
ok('QC-27 standar lapisan EN ISO 1461: 1,2 mm = 45 rata-rata (35 lokal); 1,8 mm = 55 (45); 4 mm = 70 (55); ASTM tetap bawaan', lapisanMin('HDG', 1.2, iso).min === 45 && lapisanMin('HDG', 1.2, iso).lokal === 35 && lapisanMin('HDG', 1.8, iso).min === 55 && lapisanMin('HDG', 4, iso).min === 70 && lapisanMin('HDG', 1.8, {}).min === 65 && lapisanMin('HDG', 1.8, iso).standar === 'iso');
const bi = { ...hdg[1], proses: { w: 100 }, akhir: { t: 1.8, w: 100, h: 50, l: 3000 }, visual: {}, jointing: 'Ya', lapisan: 60 };
ok('QC-28 lapisan 60 µm pada 1,8 mm: NG menurut ASTM (min 65), OK menurut ISO (min 55)', judgmentBaris(bi, {}).judgment === 'NG' && judgmentBaris(bi, iso).judgment === 'OK');
const pn = penandaanItem('CABLE LADDER TYPE SLU 1.5 HOT DIP GALVANIZED', 'Cable Ladder W300xH100xL3000'), pe = penandaanItem('PERFORATED CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', ''), pd = penandaanItem('CABLE DUCT TYPE STU 1.2 NON FINISHING', '');
ok('QC-29 penandaan NEMA 6.1.2: Ladder HDG = Tipe 1 Ventilated; Perforated ELG = Tipe 3 Ventilated; Duct natural = Nonventilated; Cable Tray polos tidak ditebak', /Tipe 1/.test(pn.finishing) && pn.ventilasi === 'Ventilated' && /Tipe 3/.test(pe.finishing) && pe.ventilasi === 'Ventilated' && pd.ventilasi === 'Nonventilated' && /Natural/.test(pd.finishing) && penandaanItem('CABLE TRAY TYPE STU 1.2 NON FINISHING', '').ventilasi === '');
console.log(`${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
