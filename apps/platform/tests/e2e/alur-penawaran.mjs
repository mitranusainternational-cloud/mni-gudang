// Uji alur hulu ke hilir (mock): Penawaran -> disetujui -> Sales Order -> konfirmasi -> SPK Draft otomatis -> terbit -> Jadwal -> Shearing, dengan tangkapan layar.
//   node tests/e2e/alur-penawaran.mjs [url] [folder-tangkapan]
// Vendor, kirim, dan terima tidak bergantung asal SPK; urutan itu diuji di alur-spk.mjs.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] || 'http://127.0.0.1:5173/';
const out = process.argv[3] || path.resolve('../../documentation/screenshots/alur-penawaran');
fs.mkdirSync(out, { recursive: true });

const R = []; const ok = (id, pass, info = '') => { R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : '')); };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
let nomor = 0;
const shot = async (nama, sel) => { nomor++; const f = path.join(out, nama + '.png'); await page.waitForTimeout(350); if (sel && await page.$(sel)) await (await page.$(sel)).screenshot({ path: f }); else await page.screenshot({ path: f }); return f; };
const tab = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t] || [], t);
const closeAll = async () => { await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); document.querySelector('#sheet [data-act="sheet-close"]')?.click(); }); await page.waitForTimeout(300); };
const go = async (r, sub) => { await closeAll(); const l = await page.$(`#nav a[href="#${r}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(400); if (sub) { const b = await page.$(`#tools [data-view="${r}"][data-val="${sub}"]`); if (b) await b.click(); if (r === 'spk' && sub === 'jadwal') { await page.waitForTimeout(300); const v = await page.$('#tools [data-key="vw"][data-val="spk"]'); if (v) await v.click(); } } await page.waitForTimeout(800); };
const keProgres = async () => { const v = await page.$('#tools [data-key="vw"][data-val="prog"]'); if (v) await v.click(); await page.waitForTimeout(600); };
const teks = (s = '#body') => page.evaluate((s) => (document.querySelector(s) || { innerText: '' }).innerText, s);
const spkBaris = async () => (await tab('spk')).find((s) => /Alur Penawaran/.test(JSON.stringify(s)));
const hasilEv = async () => (await tab('produksi_log')).filter((e) => (e.jenis || 'hasil') === 'hasil');

// 0. login + work center standar
await page.goto(base); await page.evaluate(() => localStorage.clear());
await page.goto(base); await page.reload();
await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
await page.waitForTimeout(800);
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString();
  const dua = [{ nama: 'Punching 1 (20 Ton)', operator: ['Operator C'], kapasitas: 25 }, { nama: 'Punching 2 (40 Ton)', operator: ['Operator D'], kapasitas: 25 }];
  s.tables.mwc = [['WC-1', 'Shearing', 1, 100, []], ['WC-2', 'Punching', 2, 50, dua], ['WC-3', 'Bending', 3, 40, []], ['WC-4', 'CNC Laser', 4, 60, []], ['WC-5', 'Welding', 5, 30, []]]
    .map(([kode, nama, urutan, kap, mesin]) => ({ id: crypto.randomUUID(), kode, nama, tipe: 'Internal', urutan, aktif: true, created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', data: { kapasitas: kap, mesin } }));
  localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
});
await page.reload(); await page.waitForTimeout(3500);

// 1. Penawaran: pasang katalog uji, buat, kirim, setujui customer
const FX = new URL('./fixtures/', import.meta.url);
const berkas = (f) => fileURLToPath(new URL(f, FX));
const kirimModal = async () => { await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1200); };
await go('penawaran');
await page.click('#tools [data-act="pqkatalog"]'); await page.waitForSelector('#m-kh');
await page.setInputFiles('#m-kh', berkas('katalog-harga-uji.json')); await page.setInputFiles('#m-sh', berkas('skenario-harga-uji.json'));
await kirimModal();
await page.click('#tools [data-act="pqbaru"]'); await page.waitForTimeout(500);
await page.fill('#pq-cust', 'PT Alur Penawaran Jaya'); await page.fill('[data-pqh="proyek"]', 'Gedung Alur');
await page.fill('#pq-r-0 [data-pqu="w"]', '200'); await page.fill('#pq-r-0 [data-pqu="h"]', '50'); await page.fill('#pq-r-0 [data-pqu="l"]', '3000'); await page.fill('#pq-r-0 [data-pqq]', '12');
await page.waitForTimeout(300);
await shot('01-penawaran-lembar-draft');
await page.click('[data-act="pqkirim"]'); await page.waitForTimeout(900);
await page.click('[data-act="pqsetujucustomer"]'); await page.waitForTimeout(500);
if (await page.$('#m-varian')) { await page.selectOption('#m-varian', { index: 0 }); await kirimModal(); }
await page.waitForTimeout(400);
const st1 = await page.evaluate(() => (document.querySelector('.pq-tt .chip') || {}).textContent);
ok('H-01 penawaran dibuat, dikirim, dan disetujui customer', st1 === 'Disetujui', st1);
await shot('02-penawaran-disetujui-tombol-buat-so');

// 2. Buat Sales Order dari penawaran, lengkapi tebal dan finishing, konfirmasi -> SPK Draft otomatis
const n0 = (await tab('spk')).length;
await page.click('[data-act="pqbuatso"]'); await page.waitForSelector('#m-po'); await page.fill('#m-po', 'PO-HULU-01'); await page.fill('#m-due', new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10)); await page.fill('#m-alamat', 'Gudang Customer, Cikarang');
await shot('03-dialog-buat-sales-order'); await kirimModal();
await page.waitForSelector('#so-items'); await page.waitForTimeout(500);
for (const sel of ['[data-sot]', '[data-sof]']) for (const el of await page.$$('#so-items tbody ' + sel)) await el.selectOption(sel === '[data-sot]' ? '1.2' : 'ELECTRO GALVANIZED');
await page.click('[data-act="sosimpan"]'); await page.waitForTimeout(700);
await shot('04-sales-order-draft-snapshot');
await page.evaluate(() => document.querySelector('#mat-tbl')?.scrollIntoView({ block: 'center' })); await shot('04b-kebutuhan-material-di-sales-order');
await page.evaluate(() => window.scrollTo(0, 0));
ok('H-02 Sales Order Draft dibuat dari penawaran dengan PO, due date, item, dan snapshot; belum ada SPK', (await tab('salesorder')).length === 1 && (await tab('spk')).length === n0);
await page.click('[data-act="sokonfirmasi"]'); await page.waitForTimeout(2200);
const spk = (await tab('spk')).find((s) => /Alur Penawaran/.test(JSON.stringify(s)));
ok('H-03 Konfirmasi SO membuat SPK Draft otomatis dengan PO, tautan SO dan penawaran', (await tab('spk')).length === n0 + 1 && !!spk && spk.status === 'Draft' && spk.po === 'PO-HULU-01' && !!(spk.data || {}).so && !!(spk.data || {}).penawaran, JSON.stringify(((spk || {}).data || {}).so));
await shot('05-spk-draft-otomatis-dari-so');

// 3. SPK diperiksa PPIC lalu diterbitkan lewat editor yang sudah terisi (tanpa mengetik ulang)
await page.evaluate(() => document.querySelector('[data-act="spkedit"]')?.click()); await page.waitForTimeout(900);
const editorIsi = await page.evaluate(() => ({ buka: !document.getElementById('editor').hidden, cust: (document.getElementById('ed-cust') || {}).value, baris: document.querySelectorAll('#ed-secs tbody tr').length }));
await shot('06-editor-spk-terisi-dari-so');
if (editorIsi.buka) { await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(1800); }
const spk2 = (await tab('spk')).find((s) => /Alur Penawaran/.test(JSON.stringify(s)));
ok('H-04 PPIC cukup memeriksa dan menerbitkan: editor SPK sudah terisi dari SO, status menjadi Terbit', editorIsi.buka && /Alur Penawaran/.test(editorIsi.cust) && editorIsi.baris >= 1 && spk2.status === 'Terbit', JSON.stringify(editorIsi));
await closeAll();
await go('penawaran'); await page.evaluate(() => document.querySelector('[data-act="pqtutup"]')?.click()); await page.waitForTimeout(300);
await go('salesorder'); await page.waitForTimeout(400); await shot('07-daftar-sales-order');

// 4. SPK tampil di Jadwal; produksi lewat Shearing memakai rute dari judul (tebal dan finishing dari SO)
await go('spk', 'jadwal');
ok('H-05 SPK dari Sales Order tampil di Jadwal', /Alur Penawaran/.test(await teks()));
await shot('08-jadwal-spk-dari-so');
await go('mesin'); await page.selectOption('#f-mesin', 'Shearing'); await page.waitForTimeout(600);
await page.click('#mesin-antri .mcard:first-child [data-act="mesinmulai"]'); await page.waitForTimeout(1200);
await page.click('.mesin-run [data-act="mesinsemua"]'); await page.waitForTimeout(300);
await page.click('.mesin-run [data-act="mesinselesai"]'); await page.waitForTimeout(1500);
const ev = await hasilEv();
ok('H-06 Shearing mencatat seluruh jumlah dari SPK hasil Sales Order', ev.length === 1 && ev[0].wc === 'Shearing' && Number(ev[0].qty) === 12, JSON.stringify(ev.map((e) => [e.wc, e.qty])));
await go('spk', 'berjalan'); await shot('09-spk-berjalan-dari-so');
ok('H-07 tanpa pageerror sepanjang alur', errs.length === 0, errs.slice(0, 2).join(' | '));
const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`\n${R.length - fail} PASS, ${fail} FAIL · tangkapan: ${out}`);
await browser.close();
process.exit(fail ? 1 : 0);
