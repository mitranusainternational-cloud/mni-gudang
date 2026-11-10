// Uji kompatibilitas: aplikasi versi baru dibuka dengan SALINAN data production (dari backup lokal, bukan production).
// Jalankan: node tests/e2e/uji-data-live.mjs http://127.0.0.1:5175/ "<folder backup>"
// Hanya membaca: memuat salinan ke mock lokal, membuka semua menu, memastikan tanpa galat dan jumlah baris tidak berubah.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://127.0.0.1:5175/';
const dir = process.argv[3];
if (!dir || !fs.existsSync(dir)) { console.log('FAIL folder backup tidak ditemukan'); process.exit(2); }
const rd = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const salinan = { ...rd('01-master-vendor-customer-armada-user-vendor-kirim.json'), ...rd('02-rm-mutasi-master-bongkar-lainnya.json'), ...rd('03-spk-fg.json'), ...rd('04-log.json') };
const tabel = ['pr', 'mwc', 'kirim', 'vendor', 'marmada', 'mvendor', 'mcustomer', 'msupplier', 'rm', 'mutasi', 'master', 'bongkar', 'spk', 'fg', 'log'];

const R = []; const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errs = [];
page.on('pageerror', (e) => errs.push('pageerror: ' + String(e.message).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
try {
  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await page.goto(base); await page.reload();
  await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
  await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
  await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  // ganti isi tabel mock dengan salinan data production (muser dan sesi tetap milik mock agar bisa masuk)
  const hitung = await page.evaluate(([salinan, tabel]) => {
    const db = JSON.parse(localStorage.getItem('mni-local-mock-db'));
    for (const t of tabel) { const v = salinan[t]; if (Array.isArray(v)) db.tables[t] = v; }
    localStorage.setItem('mni-local-mock-db', JSON.stringify(db));
    return Object.fromEntries(tabel.map((t) => [t, (db.tables[t] || []).length]));
  }, [salinan, tabel]);
  await page.reload(); await page.waitForTimeout(4000);
  ok('LV-01 salinan data live termuat', Object.values(hitung).some((n) => n > 0), JSON.stringify(hitung));
  const isi = () => page.evaluate((tabel) => { const db = JSON.parse(localStorage.getItem('mni-local-mock-db')); const o = {}; for (const t of tabel) o[t] = JSON.stringify((Array.isArray(db.tables[t]) ? db.tables[t] : []).map((r) => { const c = { ...r }; delete c.updated_at; return c; })); return o; }, tabel);
  const isiAwal = await isi();
  const rute = await page.$$eval('#nav a', (a) => a.map((x) => x.getAttribute('href')));
  const hasil = [];
  for (const h of rute) {
    const before = errs.length;
    await page.evaluate((h) => { location.hash = h; }, h); await page.waitForTimeout(900);
    const teks = await page.evaluate(() => (document.querySelector('#body') || document.body).innerText.length);
    hasil.push({ h, galat: errs.length - before, teks });
  }
  ok('LV-02 semua menu terbuka tanpa galat dengan data live (' + rute.length + ' menu)', hasil.every((x) => x.galat === 0 && x.teks > 20), JSON.stringify(hasil.filter((x) => x.galat || x.teks <= 20)));
  // buka laci beberapa SPK dan lembar SPK
  const spkIds = await page.evaluate(() => S.spk.slice(0, 12).map((s) => s._id));
  let galatSpk = 0;
  for (const id of spkIds) {
    const b = errs.length;
    await page.evaluate((id) => { try { openSpk(id); } catch (e) { window.__e = String(e); } }, id); await page.waitForTimeout(500);
    await page.evaluate(() => { try { closeDrawer(); closeSheet(); closeEditor(); } catch (e) { /* abaikan */ } });
    galatSpk += errs.length - b;
  }
  ok('LV-03 laci ' + spkIds.length + ' SPK live terbuka tanpa galat', galatSpk === 0, 'galat ' + galatSpk);
  // data tidak berubah oleh pemakaian baca saja
  const sesudah = await page.evaluate((tabel) => { const db = JSON.parse(localStorage.getItem('mni-local-mock-db')); return Object.fromEntries(tabel.map((t) => [t, (db.tables[t] || []).length])); }, tabel);
  const isiAkhir = await isi();
  const beda = tabel.filter((x) => isiAwal[x] !== isiAkhir[x]);
  ok('LV-05 isi baris (bukan hanya jumlah) tidak berubah oleh pemakaian baca saja', beda.length === 0, 'tabel berubah: ' + beda.join(', '));
  ok('LV-04 jumlah baris tiap tabel tidak berubah setelah menjelajah', JSON.stringify(sesudah) === JSON.stringify(hitung), JSON.stringify(sesudah));
} catch (e) {
  R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
}
ok('LV-99 tanpa pageerror/console error', errs.length === 0, errs.slice(0, 5).join(' | '));
await browser.close();
for (const l of R) console.log(l);
const fail = R.filter((x) => x.startsWith('FAIL')).length;
console.log(`${R.length - fail} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
