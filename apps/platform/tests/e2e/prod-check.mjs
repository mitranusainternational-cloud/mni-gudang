// Uji asap (smoke) terhadap lingkungan Supabase nyata lewat UI, dengan login manual oleh pemilik.
//
//   node tests/e2e/prod-check.mjs [url] [--tulis]
//
// - Membuka Chromium berjendela (profil sementara). PEMILIK login sendiri di jendela itu; skrip menunggu.
// - Tanpa --tulis: hanya membaca (10 modul, latensi, bentuk data). Dengan --tulis: menambah data uji berawalan
//   "UJI-PROD" (item bahan baku, terima material, pakai, opname, master vendor, SPK baru/tanpa due/duplikat) dan
//   memeriksa nomor dokumen, kolom relasi, dan kunci atomik langsung lewat REST dengan token sesi.
// - Tidak menyimpan atau mencetak kredensial. Data uji harus dibersihkan oleh pemilik sebelum dipakai tim.
import { chromium } from 'playwright';
import os from 'os';
import path from 'path';

const base = process.argv.find((a) => a.startsWith('http')) || 'http://127.0.0.1:5175/';
const WRITE = process.argv.includes('--tulis');
const R = [];
const ok = (id, pass, info = '') => { R.push({ id, pass, info }); console.log((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : '')); };
const T = {}; // durasi (ms)
const timed = async (name, fn) => { const t0 = Date.now(); try { return await fn(); } finally { T[name] = Date.now() - t0; } };

const ctx = await chromium.launchPersistentContext(path.join(os.tmpdir(), 'mni-prod-check'), { headless: false, viewport: { width: 1360, height: 900 } });
const page = ctx.pages()[0] || (await ctx.newPage());
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
await page.goto(base);

console.log('Menunggu login pemilik di jendela browser (maks 10 menit)…');
await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 5 && !/Tamu/.test((document.getElementById('who') || {}).innerText || 'Tamu'), null, { timeout: 600000 });
await page.waitForTimeout(3000);
const who = (await page.evaluate(() => document.getElementById('who').innerText)).replace(/\s+/g, ' ');
ok('P-00 login', /Admin/.test(who), who);

const rest = (t) => page.evaluate(async (t) => {
  const e = window.__ENV; const k = Object.keys(localStorage).find((x) => x.startsWith('sb-') && x.endsWith('-auth-token'));
  const tok = JSON.parse(localStorage.getItem(k)).access_token;
  const r = await fetch(e.SUPABASE_URL + '/rest/v1/' + t + '?select=*', { headers: { apikey: e.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + tok } });
  return r.ok ? await r.json() : { err: r.status };
}, t);
const cnt = async (t) => { const x = await rest(t); return Array.isArray(x) ? x.length : -1; };
const closeAll = async () => { await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); document.querySelector('#sheet [data-act="sheet-close"]')?.click(); if (!document.getElementById('editor').hidden) document.querySelector('#editor [data-act="ed-close"]')?.click(); }); await page.waitForTimeout(500); };
const go = async (r) => { await closeAll(); { const l = await page.$(`#nav a[href="#${r}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(300); if (r === 'spk') { const b = await page.$('#tools [data-view="spk"][data-val="list"]'); if (b) await b.click(); } } await page.waitForTimeout(1000); };
const opt = (sel, n) => page.evaluate(([s, n]) => [...document.querySelector(s).options].find((o) => o.text.includes(n))?.value, [sel, n]);
const dockOff = () => page.evaluate(() => { const d = document.getElementById('m-dock'); if (d && d.checked) d.click(); });
const submit = async (twice = false) => { for (let i = 0; i < (twice ? 2 : 1); i++) { await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(2200); if (await page.evaluate(() => document.getElementById('modal').hidden)) break; } };

// Latensi: median 5 permintaan ringan dan pemuatan 20 tabel
const lat = await page.evaluate(async () => {
  const e = window.__ENV; const k = Object.keys(localStorage).find((x) => x.startsWith('sb-') && x.endsWith('-auth-token'));
  const tok = JSON.parse(localStorage.getItem(k)).access_token; const ms = [];
  for (let i = 0; i < 5; i++) { const t0 = performance.now(); await fetch(e.SUPABASE_URL + '/rest/v1/role_modules?select=role&limit=1', { headers: { apikey: e.SUPABASE_ANON_KEY, Authorization: 'Bearer ' + tok } }); ms.push(Math.round(performance.now() - t0)); }
  ms.sort((a, b) => a - b); return { median: ms[2], semua: ms };
});
ok('P-01 latensi permintaan REST (median)', lat.median < 1500, lat.median + ' ms ' + JSON.stringify(lat.semua));

// 10 modul
const mods = [['dashboard', 'Dashboard'], ['bahan-baku', 'Gudang Bahan Baku'], ['barang-jadi', 'Gudang Barang Jadi'], ['bongkar-muat', 'Bongkar Muat'], ['vendor', 'Kirim ke Vendor'], ['pengiriman', 'Kirim ke Customer'], ['spk', 'Monitoring SPK'], ['produksi', 'Dashboard Produksi'], ['cek-data', 'Cek Data'], ['master-data', 'Master Data']];
for (const [r, l] of mods) {
  const e0 = errors.length;
  await timed('modul ' + r, () => go(r));
  const t = await page.evaluate(() => document.getElementById('ttl').textContent.trim());
  ok('P-02 modul ' + r, t === l && errors.length === e0, `${T['modul ' + r]} ms`);
}
const tabel = ['rm', 'fg', 'mutasi', 'spk', 'vendor', 'kirim', 'bongkar', 'master', 'mvendor', 'mcustomer', 'msupplier', 'marmada', 'rmhist', 'pr', 'opname', 'muser', 'ureq', 'log', 'uinv', 'mwc', 'role_modules'];
const bisaBaca = [];
for (const t of tabel) { const x = await rest(t); bisaBaca.push(Array.isArray(x)); }
ok('P-03 21 tabel dapat dibaca admin (REST + RLS)', bisaBaca.every(Boolean), bisaBaca.filter((v) => !v).length + ' gagal');

if (WRITE) {
  const stamp = 'UJI-PROD ' + new Date().toISOString().slice(5, 16).replace('T', ' ');
  try {
    await go('bahan-baku'); let n = await cnt('rm');
    await timed('simpan item RM', async () => { await page.click('#tools [data-act="newitem"]'); await page.waitForTimeout(500); await page.fill('#m-item', stamp + ' Plat'); await page.fill('#m-ukuran', '1.5×1000×2000'); await page.fill('#m-satuan', 'lbr'); await page.fill('#m-buffer', '5'); await page.fill('#m-stokAwal', '10'); await page.click('#modal button:has-text("Simpan")'); await page.waitForTimeout(2200); });
    ok('P-10 item bahan baku baru', (await cnt('rm')) === n + 1, T['simpan item RM'] + ' ms');
    n = await cnt('mutasi');
    await timed('terima material', async () => { await page.click('#tools [data-act="mv"]:has-text("Terima material")'); await page.waitForTimeout(600); await page.selectOption('#m-item-0', await opt('#m-item-0', stamp)); await page.fill('#m-qty-0', '6'); await page.fill('#m-pihak', 'Supplier UJI-PROD'); await dockOff(); await submit(true); });
    ok('P-11 terima material (nomor dokumen otomatis)', (await cnt('mutasi')) === n + 1, T['terima material'] + ' ms');
    await closeAll(); n = await cnt('mutasi');
    await page.click('#tools [data-act="mv"]:has-text("Terima material")'); await page.waitForTimeout(600); await page.selectOption('#m-item-0', await opt('#m-item-0', stamp)); await page.fill('#m-qty-0', '1'); await page.fill('#m-pihak', 'Supplier UJI-PROD'); await dockOff(); await submit(true); await closeAll();
    const rcv = (await rest('mutasi')).filter((m) => String(m.no_dok || '').startsWith('RCV/')).map((m) => m.no_dok);
    ok('P-12 dua penerimaan beruntun bernomor berbeda', rcv.length >= 2 && new Set(rcv).size === rcv.length, rcv.join(', '));
    await page.click('#tools [data-act="mv"]:has-text("Pakai produksi")'); await page.waitForTimeout(600); n = await cnt('mutasi');
    await page.selectOption('#m-item-0', await opt('#m-item-0', stamp)); await page.fill('#m-qty-0', '999'); await page.fill('#m-ket', 'UJI-PROD non-SPK'); await dockOff(); await submit();
    const tolak = (await cnt('mutasi')) === n; await page.fill('#m-qty-0', '2'); await submit();
    ok('P-13 pakai melebihi stok ditolak, pakai wajar tercatat', tolak && (await cnt('mutasi')) === n + 1);
    await closeAll();
    const mt = (await rest('mutasi')); ok('P-14 mutasi.item_id terisi', mt.filter((m) => m.gudang === 'rm').every((m) => m.item_id), '');
    await page.click('#body button[data-key="tab"][data-val="opname"]'); await page.waitForTimeout(800); n = await cnt('mutasi');
    const baris = await page.evaluate((s) => { const tr = [...document.querySelectorAll('#body table.opn tbody tr')].find((r) => r.innerText.includes(s)); return tr ? { sistem: +tr.children[2].innerText.replace(/[^0-9.-]/g, ''), id: tr.querySelector('[data-opn]').dataset.opn } : null; }, stamp);
    if (baris) { await page.fill(`[data-opn="${baris.id}"]`, String(baris.sistem + 1)); await page.click('#body [data-act="opnsave"]'); await page.waitForTimeout(800); await page.fill('#modal input[name="ket"]', 'Opname UJI-PROD'); await submit(); }
    ok('P-15 opname bahan baku (tab)', !!baris && (await cnt('mutasi')) === n + 1);
    await closeAll();
    await go('master-data'); await page.click('#tools [data-act="filt"][data-val="vendor"]'); await page.waitForTimeout(800); n = await cnt('mvendor');
    await page.click('#tools [data-act="mnew"]'); await page.waitForTimeout(600); await page.fill('#modal input[name="nama"]', 'Vendor ' + stamp); await page.click('#modal button:has-text("Simpan")'); await page.waitForTimeout(2200);
    ok('P-16 master vendor tambah', (await cnt('mvendor')) === n + 1);
    await closeAll(); await go('spk'); n = await cnt('spk');
    await timed('SPK baru', async () => { await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(1000); await page.fill('#ed-cust', 'Customer ' + stamp); await page.fill('#ed-po', 'PO-UJI'); await page.fill('#ed-due', '2026-12-30'); await page.fill('#ed-d-0-0', 'Hollow UJI-PROD'); await page.fill('#ed-q-0-0', '4'); await page.fill('#ed-u-0-0', 'Btg'); await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(3500); });
    ok('P-17 SPK baru terbit', (await cnt('spk')) === n + 1, T['SPK baru'] + ' ms');
    await closeAll(); await go('spk'); n = await cnt('spk');
    await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(1000); await page.fill('#ed-cust', 'Tanpa Due ' + stamp); await page.fill('#ed-due', ''); await page.fill('#ed-d-0-0', 'Item'); await page.fill('#ed-q-0-0', '1'); await page.fill('#ed-u-0-0', 'Btg'); await page.click('#editor [data-act="ed-save"]:has-text("draft")'); await page.waitForTimeout(3500);
    const nd = (await rest('spk')).find((s) => s.customer === 'Tanpa Due ' + stamp);
    ok('P-18 SPK draft tanpa due (due null)', (await cnt('spk')) === n + 1 && !!nd && nd.due === null);
    await closeAll();
    const locks = (await rest('master')).filter((x) => String(x.key).startsWith('lock:counter:')).map((x) => typeof x.value);
    ok('P-19 kunci penomoran atomik (objek)', locks.length > 0 && locks.every((t) => t === 'object'), locks.join(','));
  } catch (e) { ok('P-1x alur tulis', false, String(e.message).slice(0, 200)); }
}

ok('P-90 tanpa galat halaman (pageerror)', errors.length === 0, errors.slice(0, 3).join(' | '));
console.log('\nDURASI (ms):', JSON.stringify(T));
const fail = R.filter((x) => !x.pass).length;
console.log(`\n${R.length - fail} PASS, ${fail} FAIL`);
await ctx.close();
process.exit(fail ? 1 : 0);
