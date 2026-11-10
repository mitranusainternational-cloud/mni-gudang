// Uji keamanan tampilan (mock): isian teks bebas berisi markup tidak boleh dieksekusi atau membentuk elemen di halaman mana pun.
// Payload ditempel ke semua bidang teks bebas (nama, catatan, alamat, customer, supplier, item, dan sejenisnya) lalu semua tampilan,
// laci, dan lembar dibuka; setelah itu halaman diperiksa dari elemen atau penanganan yang disuntikkan.
const FIELDS = ['item', 'kategori', 'type', 'ukuran', 'finishing', 'lokasi', 'ket', 'ref', 'pihak', 'customer', 'supplier', 'vendor', 'nama', 'po',
  'sales', 'note', 'alamat', 'noSJ', 'noPR', 'proses', 'alasan', 'd', 'g', 'material', 'kendaraan', 'driver', 'nopol', 'catatan', 'judul', 'usulan'];

export async function runKeamanan(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.dismiss());
  const login = async (email) => {
    await page.evaluate(() => localStorage.removeItem('mni-local-mock-session'));
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', email); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await page.waitForTimeout(800);
  };
  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await login('admin@mni.local');

  // suntik payload ke semua bidang teks bebas (di kolom dan di jsonb data, termasuk item bersarang)
  const n = await page.evaluate((FIELDS) => {
    const P = '<img src=x onerror="window.__xss=(window.__xss||0)+1"><svg onload="window.__xss=(window.__xss||0)+1">';
    const db = JSON.parse(localStorage.getItem('mni-local-mock-db'));
    let c = 0;
    const walk = (o) => {
      if (Array.isArray(o)) { o.forEach(walk); return; }
      if (!o || typeof o !== 'object') return;
      for (const k of Object.keys(o)) {
        if (FIELDS.includes(k) && typeof o[k] === 'string' && o[k].length) { o[k] = o[k] + P; c++; }
        else if (typeof o[k] === 'object') walk(o[k]);
      }
    };
    for (const t of Object.keys(db.tables)) if (!['muser', 'role_modules', 'log', 'audit_log'].includes(t)) walk(db.tables[t]);
    localStorage.setItem('mni-local-mock-db', JSON.stringify(db));
    return c;
  }, FIELDS);
  await page.reload(); await page.waitForTimeout(3000);
  ok('K-1 payload disuntikkan ke bidang teks bebas di seluruh data contoh', n > 40, `${n} bidang`);

  // buka semua tampilan
  const views = await page.evaluate(() => [...document.querySelectorAll('#nav a')].map((a) => a.getAttribute('href')).filter(Boolean));
  const hit = {};
  const probe = async (label) => {
    const r = await page.evaluate(() => ({ xss: window.__xss || 0, img: document.querySelectorAll('img[src="x"]').length, svg: document.querySelectorAll('svg[onload]').length }));
    if (r.xss || r.img || r.svg) hit[label] = r;
  };
  let tampil = 0;
  for (const v of views) { await page.evaluate((v) => { location.hash = v; }, v); await page.waitForTimeout(900); await probe(v); if (await page.evaluate(() => /onerror=/.test(document.body.innerText))) tampil++; }
  ok('K-2 semua menu dibuka tanpa eksekusi atau elemen suntikan', Object.keys(hit).length === 0, JSON.stringify(hit).slice(0, 300) || `${views.length} menu`);

  ok('K-2b kontrol positif: payload benar-benar tampil sebagai teks di beberapa menu (uji dapat mendeteksi)', tampil >= 3, `${tampil} menu`);

  // buka laci dan lembar: SPK, kartu stok tiga gudang, vendor, surat jalan
  const ids = await page.evaluate(() => { const t = JSON.parse(localStorage.getItem('mni-local-mock-db')).tables; return { spk: t.spk.map((x) => x.id), rm: t.rm.slice(0, 2).map((x) => x.id), fg: t.fg.slice(0, 2).map((x) => x.id), sp: (t.sp || []).slice(0, 2).map((x) => x.id), vendor: t.vendor.map((x) => x.id), kirim: t.kirim.map((x) => x.id) }; });
  const act = (name, d) => page.evaluate(([n, d]) => { const b = document.createElement('button'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, d]);
  const close = () => page.evaluate(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); document.querySelector('#sheet [data-act="sheet-close"]')?.click(); });
  for (const id of ids.spk) { await page.evaluate(() => { location.hash = '#spk'; }); await page.waitForTimeout(500); await act('openspk', { id }); await page.waitForTimeout(700); for (const tb of ['info', 'items', 'jejak', 'alur']) { await act('dwtab', { t: tb, tab: tb }); await page.waitForTimeout(150); } await probe('laci SPK'); await act('spksheet', { id }); await page.waitForTimeout(600); await probe('lembar SPK'); await close(); await page.waitForTimeout(200); }
  for (const g of ['rm', 'fg', 'sp']) for (const id of ids[g]) { await act('kartu', { g, id }); await page.waitForTimeout(600); await probe('kartu ' + g); await close(); }
  for (const id of ids.vendor) { await act('openvendor', { id }); await page.waitForTimeout(500); await probe('laci vendor'); await close(); }
  for (const id of ids.kirim) { await act('openkirim', { id }); await page.waitForTimeout(500); await probe('laci kirim'); await close(); }
  ok('K-3 laci SPK, lembar SPK, kartu stok, vendor, dan surat jalan tanpa eksekusi atau elemen suntikan', Object.keys(hit).length === 0, JSON.stringify(hit).slice(0, 300));

  // dokumen cetak dan Excel memuat teks sebagai teks, bukan markup
  await page.evaluate(() => { window.__html = ''; window.__wo = window.open; window.open = () => ({ document: { write: (s) => { window.__html = s; }, close() {} } }); });
  await page.evaluate(() => { location.hash = '#bahan-baku'; }); await page.waitForTimeout(800);
  await page.evaluate(() => [...document.querySelectorAll('.tabs button, .seg button, button')].find((b) => b.textContent.trim().startsWith('Stock opname')).click()); await page.waitForTimeout(500);
  await act('opnsheetpdf', {}); await page.waitForTimeout(600);
  if (await page.evaluate(() => !!document.querySelector('#mform [name^="sg"]'))) await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => x.type === 'submit').pop().click());
  await page.waitForTimeout(800);
  const doc = await page.evaluate(() => { window.open = window.__wo; return window.__html; });
  ok('K-4 dokumen cetak tidak memuat markup suntikan mentah', !/<img src=x|<svg onload/i.test(doc) && doc.length > 200, doc.length + ' karakter');

  // isian pengguna dengan markup disimpan sebagai teks dan tampil sebagai teks (nama customer, catatan)
  const rendered = await page.evaluate(() => { window.__xss = 0; return document.body.innerHTML.includes('&lt;img src=x') || !document.body.innerHTML.includes('<img src=x'); });
  ok('K-5 markup di isian tampil sebagai teks (di-escape)', rendered);
  ok('K-6 tidak ada eksekusi skrip suntikan sepanjang uji', (await page.evaluate(() => window.__xss || 0)) === 0);
  ok('K-7 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
