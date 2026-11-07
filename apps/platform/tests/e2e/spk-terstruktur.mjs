// Uji input item SPK terstruktur (mock): pilih bentuk, isi ukuran W H L atau R, nama dan berat otomatis dari kalkulator.
// Memakai katalog berat sintetis (tests/e2e/fixtures/katalog-berat-uji.json); angka harapan dihitung oleh modul murni bentuk.js.
import fs from 'node:fs';
import { hitungBentuk } from '../../src/lib/berat/bentuk.js';

const kat = JSON.parse(fs.readFileSync(new URL('./fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));
const dekat = (a, b) => Math.abs(a - b) <= 0.0006;

export async function runSpkTerstruktur(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  const wait = (ms = 300) => page.waitForTimeout(ms);
  const rows = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t].map((r) => ({ ...(r.data || {}), ...r })), t);
  const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(700); };
  const pasangKatalog = (c) => page.evaluate((c) => { window.MNIBerat.setKatalog(c); }, c);
  const bukaBaru = async () => { await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(500); };
  const nilai = (id) => page.inputValue('#' + id);
  const teks = (id) => page.evaluate((id) => (document.getElementById(id) || { textContent: '' }).textContent.trim(), id);
  const opsi = (id) => page.evaluate((id) => [...document.getElementById(id).options].map((o) => o.textContent), id);
  const ada = (id) => page.evaluate((id) => !!document.getElementById(id), id);
  const berat = (keluarga, bentuk, dim, tebal, material, lubang) => hitungBentuk(kat, { keluarga, bentuk, dim, tebal, material, lubang });
  const tutupEditorBatal = async () => { await page.evaluate(() => document.querySelector('#editor [data-act="ed-close"], #editor [data-act="edclose"]')?.click()); };

  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await page.goto(base); await page.reload();
  await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
  await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
  await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
  await wait(900);

  // ---------- S-01 tanpa katalog berat: editor lama tidak berubah ----------
  await bukaBaru();
  const lama = await page.evaluate(() => ({ th: [...document.querySelectorAll('#ed-secs thead th')].map((x) => x.textContent), sb: !!document.getElementById('ed-sb-0-0'), d: !!document.getElementById('ed-d-0-0') }));
  ok('S-01 tanpa katalog berat editor memakai kolom Description lama (tanpa pilihan bentuk)', !lama.sb && lama.d && lama.th.includes('Description') && !lama.th.includes('Ukuran (mm)'), JSON.stringify(lama.th));
  await page.reload(); await wait(3000); await pasangKatalog(kat);

  // ---------- S-02 bentuk dan kolom otomatis ----------
  await bukaBaru();
  const o1 = await opsi('ed-sb-0-0');
  const kol = await page.evaluate(() => [...document.querySelectorAll('#ed-secs thead th')].map((x) => x.textContent));
  const spek = await page.evaluate(() => document.querySelector('#ed-secs tr[data-l="0"] .c-spec').textContent.replace(/\s+/g, ' ').trim());
  const dimLabel = await page.evaluate(() => [...document.querySelectorAll('#ed-secs tr[data-l="0"] .dm span')].map((x) => x.textContent));
  ok('S-02 section Cable Tray: pilihan bentuk dari kalkulator (Straight, Elbow 90, Reducer, dan Teks bebas), bentuk awal Straight, ukuran W H L, type, tebal, finishing otomatis', o1.join() === 'Teks bebas,Straight,Elbow 90,Reducer' && (await nilai('ed-sb-0-0')) !== '' && kol.includes('Ukuran (mm)') && /STU/.test(spek) && /1\.2 mm/.test(spek) && /ELG/.test(spek) && dimLabel.join() === 'W,H,L,Lubang', JSON.stringify({ o1, spek, dimLabel }));

  // ---------- S-03 isi ukuran: nama dan berat otomatis ----------
  await page.fill('#ed-dm-0-0-w', '100'); await page.fill('#ed-dm-0-0-h', '50'); await page.fill('#ed-dm-0-0-l', '3000'); await page.fill('#ed-q-0-0', '10'); await wait(300);
  const std = berat('STU', 'STRAIGHT_STU', { w: 100, h: 50, l: 3000 }, 1.2, 'SPHC / ELG', 'standar');
  const tag = await page.evaluate(() => (document.querySelector('#ed-secs tr[data-l="0"] .wtag') || {}).textContent);
  const tot = await teks('ed-tot');
  ok('S-03 mengisi W H L dan qty: nama item terbentuk otomatis, berat per pcs dari kalkulator bertanda auto, berat total dan tonase terisi', (await teks('ed-nm-0-0')) === 'Cable Tray W100xH50xL3000' && dekat(+(await nilai('ed-w-0-0')), std.beratSPK) && tag === 'auto' && new RegExp(String(Math.round(std.beratSPK * 10 * 100) / 100).replace('.', ',').slice(0, 4)).test(tot), JSON.stringify({ nama: await teks('ed-nm-0-0'), w: await nilai('ed-w-0-0'), std: std.beratSPK, tot }));

  // ---------- S-04 full hole ----------
  await page.selectOption('#ed-lb-0-0', 'full'); await wait(300);
  const full = berat('STU', 'STRAIGHT_STU', { w: 100, h: 50, l: 3000 }, 1.2, 'SPHC / ELG', 'full');
  ok('S-04 lubang Full hole: nama memuat "Full Hole" dan berat memakai kolom full hole (lebih ringan)', (await teks('ed-nm-0-0')) === 'Cable Tray W100xH50xL3000 Full Hole' && dekat(+(await nilai('ed-w-0-0')), full.beratSPK) && full.beratSPK < std.beratSPK);

  // ---------- S-05 ganti bentuk: ukuran yang diminta ikut berubah ----------
  await page.selectOption('#ed-sb-0-0', { label: 'Elbow 90' }); await wait(400);
  const dimElbow = await page.evaluate(() => [...document.querySelectorAll('#ed-secs tr[data-l="0"] .dm span')].map((x) => x.textContent));
  const galatElbow = await teks('ed-gl-0-0');
  ok('S-05 ganti ke Elbow 90: yang diminta W H R, isian W dan H dipertahankan, berat dikosongkan dan alasan ditampilkan sampai R diisi', dimElbow.join() === 'W,H,R' && (await nilai('ed-dm-0-0-w')) === '100' && (await nilai('ed-w-0-0')) === '' && /Isi ukuran: R/.test(galatElbow) && (await teks('ed-nm-0-0')) === 'Cable Tray Elbow 90 W100xH50xR?', JSON.stringify({ dimElbow, galatElbow, nama: await teks('ed-nm-0-0') }));
  await page.fill('#ed-dm-0-0-r', '300'); await wait(300);
  const elb = berat('STU', 'ELBOW_STU_R_D', { w: 100, h: 50, r: 300 }, 1.2, 'SPHC / ELG');
  ok('S-06 R diisi: berat Elbow muncul sesuai kalkulator', dekat(+(await nilai('ed-w-0-0')), elb.beratSPK) && (await teks('ed-gl-0-0')) === '', await nilai('ed-w-0-0'));

  // ---------- S-07 section berubah: tebal dan finishing menghitung ulang ----------
  await page.selectOption('#ed-sb-0-0', { label: 'Straight' }); await wait(300);
  await page.selectOption('#ed-htb-0', '2.0'); await wait(500);
  const std20 = berat('STU', 'STRAIGHT_STU', { w: 100, h: 50, l: 3000 }, 2, 'SPHC / ELG', 'standar');
  ok('S-07 tebal section diganti 1.2 ke 2.0: berat baris dihitung ulang otomatis', dekat(+(await nilai('ed-w-0-0')), std20.beratSPK) && std20.beratSPK > std.beratSPK && /2\.0 mm/.test(await page.evaluate(() => document.querySelector('#ed-secs tr[data-l="0"] .c-spec').textContent)), await nilai('ed-w-0-0'));
  await page.selectOption('#ed-htb-0', '1.2'); await wait(400);
  await page.selectOption('#ed-hf-0', 'STAINLESS STEEL 304'); await wait(500);
  const ss = berat('STU', 'STRAIGHT_STU', { w: 100, h: 50, l: 3000 }, 1.2, 'SS304', 'standar');
  ok('S-08 finishing diganti stainless 304: massa jenis 7,93 dipakai dan berat dihitung ulang', dekat(+(await nilai('ed-w-0-0')), ss.beratSPK) && ss.beratSPK > std.beratSPK, JSON.stringify([await nilai('ed-w-0-0'), ss.beratSPK]));
  await page.selectOption('#ed-hf-0', 'ELECTRO GALVANIZED'); await wait(400);

  // ---------- S-09 type SLU: tanpa pilihan lubang ----------
  await page.selectOption('#ed-ht-0', 'SLU'); await wait(500);
  const slu = berat('SLU', 'STRAIGHT_SLU', { w: 100, h: 50, l: 3000 }, 1.2, 'SPHC / ELG');
  ok('S-09 type STU ke SLU: bentuk dipetakan ke Straight SLU, pilihan lubang hilang (SLU tanpa full hole), berat dihitung ulang', !(await ada('ed-lb-0-0')) && dekat(+(await nilai('ed-w-0-0')), slu.beratSPK) && /SLU/.test(await page.evaluate(() => document.querySelector('#ed-secs tr[data-l="0"] .c-spec').textContent)), await nilai('ed-w-0-0'));
  await page.selectOption('#ed-ht-0', 'STU'); await wait(400);

  // ---------- S-10 produk Cover Tray ----------
  await page.selectOption('#ed-hp-0', 'COVER TRAY'); await wait(500);
  const optCover = await opsi('ed-sb-0-0');
  const dimCover = await page.evaluate(() => [...document.querySelectorAll('#ed-secs tr[data-l="0"] .dm span')].map((x) => x.textContent));
  ok('S-10 produk diganti Cover Tray: pilihan bentuk berganti ke Cover, ukuran W dan L', optCover.join() === 'Teks bebas,Cover Straight' && dimCover.join() === 'W,L' && (await teks('ed-nm-0-0')) === 'Cover Tray W100xL3000', JSON.stringify({ optCover, dimCover, nama: await teks('ed-nm-0-0') }));
  await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(400);

  // ---------- S-11 bentuk manual: berat manual tidak ditimpa ----------
  await page.fill('#ed-w-0-0', '7.5'); await wait(200);
  await page.fill('#ed-dm-0-0-l', '2500'); await wait(300);
  const tagM = await page.evaluate(() => (document.querySelector('#ed-secs tr[data-l="0"] .wtag') || {}).textContent);
  ok('S-11 berat yang diketik manual tidak ditimpa saat ukuran berubah (bertanda manual), tetapi nama mengikuti ukuran', (await nilai('ed-w-0-0')) === '7.5' && tagM === 'manual' && (await teks('ed-nm-0-0')).includes('L2500'), JSON.stringify({ w: await nilai('ed-w-0-0'), tagM }));
  await page.fill('#ed-w-0-0', ''); await page.fill('#ed-dm-0-0-l', '3000'); await wait(300);

  // ---------- S-12 simpan: baris tidak lengkap ditolak, baris kosong dilewati ----------
  await page.selectOption('#ed-lb-0-0', 'full'); await wait(300);
  await page.fill('#ed-cust', 'PT Struktur Uji');
  await page.fill('#ed-dm-0-1-w', '100'); await wait(300); // baris 2 hanya terisi sebagian
  await page.click('[data-act="ed-save"][data-mode="draft"]'); await wait(700);
  const galatSimpan = await page.evaluate(() => (document.getElementById('ed-err') || {}).textContent || '');
  ok('S-12 baris terstruktur yang ukurannya belum lengkap menolak simpan dan menyebut ukuran yang kurang', /ukuran H, L belum diisi/.test(galatSimpan), galatSimpan);
  await page.fill('#ed-dm-0-1-w', ''); await wait(300);
  const n0 = (await rows('spk')).length;
  await page.click('[data-act="ed-save"][data-mode="draft"]'); await wait(1800);
  await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(300);
  const sp = (await rows('spk')).filter((s) => s.customer === 'PT Struktur Uji').pop();
  const it = sp && sp.items[0];
  ok('S-13 simpan: baris kosong dilewati; item membawa bentuk, ukuran, lubang, berat otomatis, dan nama; hanya satu item', (await rows('spk')).length === n0 + 1 && sp.items.length === 1 && it.sb === 'STRAIGHT_STU' && it.dim.w === '100' && it.dim.r === undefined && it.d === 'Cable Tray W100xH50xL3000 Full Hole' && it.lubang === 'full' && it.ws === 'k' && dekat(it.w, full.beratSPK) && it.q === 10, JSON.stringify(it));

  // ---------- S-14 buka lagi untuk diubah: keadaan terstruktur kembali ----------
  await page.reload(); await wait(3000); await pasangKatalog(kat); await go('#spk');
  await page.evaluate((id) => document.querySelector(`[data-act="openspk"][data-id="${id}"]`)?.click(), sp.id); await wait(800);
  await page.evaluate(() => document.querySelector('[data-act="spkedit"]')?.click()); await wait(900);
  const balik = await page.evaluate(() => ({ sb: (document.getElementById('ed-sb-0-0') || {}).value, w: (document.getElementById('ed-dm-0-0-w') || {}).value, l: (document.getElementById('ed-dm-0-0-l') || {}).value, lub: (document.getElementById('ed-lb-0-0') || {}).value, nama: (document.getElementById('ed-nm-0-0') || {}).textContent, bw: (document.getElementById('ed-w-0-0') || {}).value }));
  ok('S-14 membuka SPK untuk diubah menampilkan bentuk, ukuran, lubang, dan berat seperti saat disimpan', balik.sb === 'STRAIGHT_STU' && balik.w === '100' && balik.l === '3000' && balik.lub === 'full' && /Full Hole/.test(balik.nama) && dekat(+balik.bw, full.beratSPK), JSON.stringify(balik));

  // ---------- S-15 aksesori: bentuk dipilih pengguna; produk tanpa kalkulator tetap teks ----------
  await page.click('[data-act="ed-addsec"]'); await wait(300);
  await page.selectOption('#ed-hp-1', 'ACCS TRAY'); await wait(500);
  const awalAccs = await nilai('ed-sb-1-0');
  const teksBebas = await ada('ed-d-1-0');
  await page.selectOption('#ed-sb-1-0', { label: 'Hanger Beam' }); await wait(400);
  await page.fill('#ed-dm-1-0-w', '150'); await page.fill('#ed-q-1-0', '4'); await wait(300);
  const hb = berat('STU', 'HANGER_BEAM_STU', { w: 150 }, 1.2, 'SPHC / ELG');
  ok('S-15 section aksesori: awalnya teks bebas (bentuk dipilih pengguna); Hanger Beam hanya meminta W; nama "Hanger Beam W150" dan berat otomatis', awalAccs === '' && teksBebas && (await teks('ed-nm-1-0')) === 'Hanger Beam W150' && dekat(+(await nilai('ed-w-1-0')), hb.beratSPK), JSON.stringify({ awalAccs, nama: await teks('ed-nm-1-0'), w: await nilai('ed-w-1-0') }));
  await page.selectOption('#ed-hp-1', 'CABLE DUCT'); await wait(500);
  ok('S-16 produk tanpa kalkulator (Cable Duct): kembali ke isian teks bebas tanpa pilihan bentuk', !(await ada('ed-sb-1-0')) && (await ada('ed-d-1-0')));

  // ---------- S-17 lembar SPK: nama, berat per pcs, berat per item, dan tonase ----------
  await page.evaluate(() => document.querySelector('#editor [data-act="ed-save"][data-mode="terbit"], #editor button:not([data-mode="draft"]).primary')?.click());
  await wait(200);
  const sheetTeks = await page.evaluate(async () => { const id = S.spk.find((s) => s.customer === 'PT Struktur Uji')._id; openSheet(id); await new Promise((r) => setTimeout(r, 900)); return (document.getElementById('sheet') || { innerText: '' }).innerText.replace(/\s+/g, ' '); });
  ok('S-17 lembar SPK memuat nama item otomatis, berat per pcs dan berat per item dari kalkulator', /Cable Tray W100xH50xL3000 Full Hole/.test(sheetTeks) && sheetTeks.includes(full.beratSPK.toFixed(2)) && sheetTeks.includes((Math.round(full.beratSPK * 1000) / 1000 * 10).toFixed(2)), sheetTeks.slice(Math.max(0, sheetTeks.indexOf('Cable Tray') - 150), Math.max(0, sheetTeks.indexOf('Cable Tray')) + 350));

  // ---------- S-19 Perforated Cable Tray: otomatis Full hole, tetap bisa diganti manual ----------
  await page.reload(); await wait(3000); await pasangKatalog(kat);
  await bukaBaru();
  const cekBawaan = async (prod) => { await page.selectOption('#ed-hp-0', prod); await wait(500); return page.evaluate(() => (document.getElementById('ed-lb-0-0') || { value: null }).value); };
  const lbCT = await cekBawaan('CABLE TRAY');
  const lbPCT = await cekBawaan('PERFORATED CABLE TRAY');
  await page.fill('#ed-dm-0-0-w', '100'); await page.fill('#ed-dm-0-0-h', '50'); await page.fill('#ed-dm-0-0-l', '3000'); await page.fill('#ed-q-0-0', '2'); await wait(300);
  const stdP = berat('STU', 'STRAIGHT_STU', { w: 100, h: 50, l: 3000 }, 1.2, 'SPHC / ELG', 'standar');
  const fullP = berat('STU', 'STRAIGHT_STU', { w: 100, h: 50, l: 3000 }, 1.2, 'SPHC / ELG', 'full');
  const namaP = await teks('ed-nm-0-0'); const beratP = +(await nilai('ed-w-0-0'));
  ok('S-19a Perforated Cable Tray langsung Full hole (Cable Tray biasa tetap Bawah); nama memuat Full Hole dan berat memakai kolom full hole', lbCT === 'standar' && lbPCT === 'full' && /Full Hole/.test(namaP) && dekat(beratP, fullP.beratSPK), JSON.stringify({ lbCT, lbPCT, namaP, beratP }));
  await page.selectOption('#ed-lb-0-0', 'standar'); await wait(300);
  await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(300); await page.selectOption('#ed-hp-0', 'PERFORATED CABLE TRAY'); await wait(500);
  const lbManual = await page.evaluate(() => document.getElementById('ed-lb-0-0').value);
  ok('S-19b pilihan Bawah yang dibuat pengguna dipertahankan walau section diganti produk lalu kembali; berat memakai kolom standar', lbManual === 'standar' && dekat(+(await nilai('ed-w-0-0')), stdP.beratSPK), JSON.stringify({ lbManual, w: await nilai('ed-w-0-0') }));

  // ---------- S-20 vendor per baris: bawaan mengikuti material, pengecualian dipilih di editor ----------
  const vvOpsi = await opsi('ed-vv-0-0');
  await page.selectOption('#ed-vv-0-0', 'tidak'); await wait(400);
  const vvState = await page.evaluate(() => ED.sections[0].lines[0].vv);
  ok('S-20 baris menampilkan pilihan vendor (bawaan ikut aturan material) dan pilihan tanpa vendor tersimpan di baris', /ikut aturan/.test(vvOpsi[0]) && /baja, ke vendor ELG/.test(vvOpsi[0]) && vvOpsi.length === 3 && vvState === 'tidak' && (await page.inputValue('#ed-vv-0-0')) === 'tidak', JSON.stringify({ vvOpsi, vvState }));

  // ---------- S-21 Master Data: rute per produk dan rute khusus bentuk memengaruhi rute item ----------
  await page.reload(); await wait(3000); await pasangKatalog(kat);
  await page.evaluate(async () => { for (const n of ['Shearing', 'Punching', 'CNC Laser']) if (!S.mwc.some((w) => w.nama === n)) await addDoc('mwc', { kode: 'WC-T-' + n.slice(0, 3).toUpperCase(), nama: n, tipe: 'Internal', urutan: S.mwc.length + 1, aktif: true, ket: '', mesin: [] }); });
  await wait(600);
  await go('#master-data');
  await page.click('[data-view="master-data"][data-key="tab"][data-val="rute"]'); await wait(500);
  const tabelAda = await ada('rute-tabel');
  const awal = await page.evaluate(() => itemRute({ g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', d: 'x', sb: 'ELBOW_STU_R_D' }));
  await page.selectOption('#rute-baru', 'CABLE TRAY|ELBOW'); await page.click('[data-act="ruteadd"]'); await wait(600);
  await page.click('#rute-tabel input[data-rk="CABLE TRAY|ELBOW"][value="Punching"]'); await wait(700);
  const sesudah = await page.evaluate(() => ({ elbow: itemRute({ g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', d: 'x', sb: 'ELBOW_STU_R_D' }), lurus: itemRute({ g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', d: 'x', sb: 'STRAIGHT_STU' }) }));
  ok('S-21 tab Rute produksi: rute khusus Elbow tanpa Punching berlaku untuk Elbow; Straight tetap rute produk; langkah vendor tetap mengikuti finishing', tabelAda && awal.includes('Punching') && !sesudah.elbow.includes('Punching') && sesudah.elbow.at(-1) === 'Vendor ELG' && sesudah.lurus.includes('Punching'), JSON.stringify({ awal, sesudah }));

  // ---------- S-22 rute produk diubah di Master Data; minimal satu work center ----------
  await page.click('#rute-tabel input[data-rk="CABLE DUCT"][value="Punching"]'); await wait(700);
  const duct = await page.evaluate(() => itemRute({ g: 'CABLE DUCT TYPE STU 1.2 NON FINISHING', d: 'x' }));
  const rowCb = await page.$$eval('#rute-tabel input[data-rk="COVER TRAY"]:checked', (x) => x.length);
  for (let i = 0; i < rowCb + 1; i++) { await page.evaluate(() => document.querySelector('#rute-tabel input[data-rk="COVER TRAY"]:checked')?.click()); await wait(500); }
  const coverMasih = await page.$$eval('#rute-tabel input[data-rk="COVER TRAY"]:checked', (x) => x.length);
  ok('S-22 rute produk dapat diubah per work center; mencentang terakhir dicabut ditolak (rute minimal satu langkah)', !duct.includes('Punching') && coverMasih === 1, JSON.stringify({ duct, coverMasih }));
  await page.click('[data-act="rutedel"][data-rk="CABLE TRAY|ELBOW"]'); await wait(600);
  const hapus = await page.evaluate(() => itemRute({ g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', d: 'x', sb: 'ELBOW_STU_R_D' }));
  ok('S-23 menghapus rute khusus bentuk mengembalikan bentuk itu ke rute produk', hapus.includes('Punching'), JSON.stringify(hapus));

  ok('S-18 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  void tutupEditorBatal;
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
