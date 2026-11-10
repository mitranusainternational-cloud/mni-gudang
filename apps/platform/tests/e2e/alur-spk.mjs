// Uji alur lengkap satu SPK dari awal sampai akhir (mock), dengan tangkapan layar tiap tahap.
//   node tests/e2e/alur-spk.mjs [url] [folder-tangkapan]
// Alur: SPK dibuat dan diterbitkan -> Jadwal (belum mulai) -> Shearing Mulai/Catat -> Punching -> Bending (progres)
//       -> Kirim ke Vendor -> Terima kembali -> Kirim ke Customer -> Diterima -> SPK selesai -> Jadwal dan Kinerja.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = process.argv[2] || 'http://127.0.0.1:5173/';
const out = process.argv[3] || path.resolve('../../documentation/screenshots/alur-spk');
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
const spkBaris = async () => (await tab('spk')).find((s) => /Alur Lengkap/.test(JSON.stringify(s)));
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

// 1. Buat SPK (satu item Cable Tray 20 btg) lalu terbitkan
await go('spk', 'list');
await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
const hari = new Date(); const due = new Date(hari.getTime() + 9 * 86400000).toISOString().slice(0, 10);
await page.fill('#ed-cust', 'PT Alur Lengkap Sejahtera'); await page.fill('#ed-po', 'PO-ALUR-01'); await page.fill('#ed-due', due);
await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'); await page.dispatchEvent('#ed-h-0', 'change'); await page.waitForTimeout(300);
await page.fill('#ed-d-0-0', 'Cable Tray W100xH100xL3000 1.2'); await page.fill('#ed-q-0-0', '20'); await page.fill('#ed-u-0-0', 'Btg');
await shot('01-form-spk-terisi');
const n0 = (await tab('spk')).length;
await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(1800);
const spk = (await tab('spk')).find((s) => /Alur Lengkap/.test(JSON.stringify(s)));
ok('A-01 SPK dibuat dan diterbitkan', (await tab('spk')).length === n0 + 1 && !!spk);
await go('spk', 'list'); await shot('02-daftar-spk-terbit');

// 2. Jadwal: SPK baru belum mulai
await go('spk', 'jadwal');
const j1 = await teks();
ok('A-02 SPK baru tampil di Jadwal dengan status Belum mulai', /Alur Lengkap/.test(j1) && /Belum mulai/.test(j1), j1.slice(0, 80));
await shot('03-jadwal-belum-mulai');

// 3. Antrian mesin: item muncul di Shearing dengan rute
await go('mesin'); await page.selectOption('#f-mesin', 'Shearing'); await page.waitForTimeout(600);
const rute = await page.$$eval('#mesin-antri .mcard:first-child .rchip', (a) => a.map((x) => x.textContent));
ok('A-03 item masuk antrian Shearing dengan rute Shearing, Punching, Bending, Vendor ELG', rute.join('>') === 'Shearing>Punching>Bending>Vendor ELG', rute.join('>'));
await shot('04-antrian-shearing');

// helper: Mulai lalu Catat semua lewat kartu sesi
const kerjakan = async (wc, tangkapMulai, tangkapSelesai) => {
  await go('mesin'); await page.selectOption('#f-mesin', wc); await page.waitForTimeout(600);
  await page.click('#mesin-antri .mcard:first-child [data-act="mesinmulai"]'); await page.waitForTimeout(1200);
  if (tangkapMulai) await shot(tangkapMulai);
  await page.click('.mesin-run [data-act="mesinsemua"]'); await page.waitForTimeout(300);
  if (tangkapSelesai) await shot(tangkapSelesai);
  await page.click('.mesin-run [data-act="mesinselesai"]'); await page.waitForTimeout(1500);
};

// 4. Shearing: Mulai (tangkap), Semua, Selesai
await kerjakan('Shearing', '05-shearing-sedang-dikerjakan', '06-shearing-isi-jumlah');
let ev = await hasilEv();
ok('A-04 Shearing 20 tercatat', ev.length === 1 && ev[0].wc === 'Shearing' && Number(ev[0].qty) === 20, JSON.stringify(ev.map((e) => [e.wc, e.qty])));
await go('spk', 'jadwal'); await shot('07-jadwal-setelah-shearing');
await keProgres(); await shot('07b-progres-setelah-shearing');
ok('A-05 Jadwal menandai SPK mulai produksi (status bukan Belum mulai)', !/Belum mulai/.test(await teks()) || (await page.$$eval('.gt-row:not(.gt-it) .gt-b.prod', (a) => a.length)) > 0);

// 5. Punching dan Bending
await kerjakan('Punching', null, null); ev = await hasilEv();
ok('A-06 Punching 20 tercatat', ev.length === 2 && ev[1].wc === 'Punching' && Number(ev[1].qty) === 20, JSON.stringify(ev.map((e) => [e.wc, e.qty])));
await go('mesin'); await page.selectOption('#f-mesin', 'Bending'); await page.waitForTimeout(600); await shot('08-antrian-bending-siap-20');
await kerjakan('Bending', null, null); ev = await hasilEv();
ok('A-07 Bending 20 tercatat; seluruh langkah internal selesai', ev.length === 3 && ev[2].wc === 'Bending' && Number(ev[2].qty) === 20, JSON.stringify(ev.map((e) => [e.wc, e.qty])));
await go('mesin', null); await shot('09-produksi-hari-ini-setelah-bending');

// 6. Progres di SPK Berjalan dan Jadwal
await go('spk', 'berjalan'); const tb = await teks();
ok('A-08 SPK Berjalan menampilkan SPK dengan progres produksi 100% dan siap kirim ke vendor', /Alur Lengkap/.test(tb) && /100/.test(tb), tb.replace(/\s+/g, ' ').slice(0, 160));
await shot('10-spk-berjalan-produksi-selesai');
await go('spk', 'jadwal'); await page.evaluate(() => [...document.querySelectorAll('.gt-row:not(.gt-it) .gt-nm')].find((x) => /Alur Lengkap/.test(x.innerText))?.click()); await page.waitForTimeout(500);
await shot('11-jadwal-produksi-selesai-item-dibuka');

// 7. Kirim ke Vendor
await go('vendor');
const nv0 = (await tab('vendor')).length;
await page.click('#tools [data-act="newvendor"]'); await page.waitForTimeout(500);
await page.fill('#m-vendor', 'Vendor ELG Alur'); await page.fill('#m-proses', 'ELG');
const optV = await page.evaluate(() => [...document.querySelectorAll('#m-spk option')].find((o) => /Alur Lengkap/.test(o.textContent))?.value || '');
await page.selectOption('#m-spk', optV); await page.waitForTimeout(500);
ok('A-09 kolom kirim vendor terisi 20 (hasil produksi)', (await page.inputValue('#m-ln_0')) === '20');
await shot('12-form-kirim-vendor');
await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(800);
await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500);
ok('A-10 kirim ke vendor tercatat', (await tab('vendor')).length === nv0 + 1);
await go('vendor'); await shot('13-daftar-vendor-di-vendor');
await go('spk', 'jadwal'); await shot('14-jadwal-di-vendor');

// 8. Terima kembali dari vendor
await go('vendor');
await page.click('#body tr.click:has-text("Alur")'); await page.waitForTimeout(700);
await shot('15-sheet-vendor');
const tombolTerima = await page.$('#modal [data-act="terima"], #sheet [data-act="terima"], .sheet [data-act="terima"]') || await page.locator('[data-act="terima"]').last().elementHandle();
if (tombolTerima) { await tombolTerima.click(); await page.waitForTimeout(700); await shot('16-form-terima-kembali'); }
const submitTerima = await page.$('#msub'); if (submitTerima) { await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1200); }
const vnd = (await tab('vendor')).slice(-1)[0];
ok('A-11 vendor ditandai selesai/diterima kembali', !!vnd && /Selesai|Diterima/i.test(vnd.status || '') , JSON.stringify([vnd && vnd.status]));
await closeAll();

// 9. Kirim ke Customer
await go('pengiriman');
const nk0 = (await tab('kirim')).length;
await page.click('#tools [data-act="newkirim"]'); await page.waitForTimeout(500);
const optK = await page.evaluate(() => [...document.querySelectorAll('#m-spk option')].find((o) => /Alur Lengkap/.test(o.textContent))?.value || '');
await page.selectOption('#m-spk', optK); await page.waitForTimeout(500);
await shot('17-form-surat-jalan');
await page.click('#modal button:has-text("Buat surat jalan")'); await page.waitForTimeout(1000);
ok('A-12 surat jalan dibuat', (await tab('kirim')).length === nk0 + 1);
await go('pengiriman'); await shot('18-daftar-pengiriman');

// 10. Tandai diterima customer
await page.click('#body tr.click:has-text("Alur")'); await page.waitForTimeout(600);
await shot('19-sheet-surat-jalan-customer'); await closeAll();
for (const to of ['Dalam Perjalanan', 'Diterima']) { const b = page.locator(`#body tr:has-text("Alur") [data-act="kstep"][data-to="${to}"]`); if (await b.count()) { await b.first().click(); await page.waitForTimeout(900); await shot(to === 'Diterima' ? '20-pengiriman-diterima' : '19b-pengiriman-berangkat'); } }
const kr = (await tab('kirim')).slice(-1)[0];
ok('A-13 pengiriman berstatus Diterima', !!kr && kr.status === 'Diterima', JSON.stringify([kr && kr.status]));
await closeAll();

// 11. SPK selesai: Jadwal, SPK Berjalan, Kinerja
await go('spk', 'jadwal'); await shot('21a-jadwal-filter-berjalan-spk-hilang');
const jb = await teks();
await page.click('#tools button:has-text("Selesai")'); await page.waitForTimeout(700);
const jf = await teks(); await shot('21-jadwal-spk-selesai');
ok('A-14 SPK selesai keluar dari filter Berjalan dan muncul di filter Selesai pada Jadwal', !/Alur Lengkap/.test(jb) && /1003/.test(jf) && /Selesai/.test(jf), jf.replace(/\s+/g, ' ').slice(0, 120));
await page.click('.gt-row:not(.gt-it) .gt-nm:has-text("1003")'); await page.waitForTimeout(500); await shot('21b-jadwal-item-spk-selesai');
await page.click('.gt-row:has-text("1003") >> text=Buka'); await page.waitForTimeout(900); await shot('22-detail-spk-selesai');
await closeAll();
await go('produksi', 'wc'); await shot('23-kinerja-analisa');
await go('mesin'); await shot('24-produksi-hari-ini-akhir');

ok('A-15 tanpa pageerror sepanjang alur', errs.length === 0, errs.slice(0, 2).join(' | '));
const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(R.join('\n')); console.log(`\n${R.length - fail} PASS, ${fail} FAIL · tangkapan: ${out}`);
await browser.close();
process.exit(fail ? 1 : 0);
