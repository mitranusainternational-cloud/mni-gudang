// Uji penegakan role di UI (mock, VITE_LOCAL_MOCK=1): tiap role mencoba alurnya sendiri dan alur yang
// bukan haknya. Model role = ROLES di apps/gudang-logistik (admin, ppic, gbb, gbj, logistik, viewer).
//
//   const { pass, fail, detail } = await runRoles(page, 'http://127.0.0.1:5173/');
//
// Syarat sama dengan regression.mjs: dev server mock, SATU tab. Skrip mengosongkan localStorage di awal.

export async function runRoles(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
  const tab = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t], t);
  const count = async (t) => (await tab(t)).length;
  const opt = (sel, n) => page.evaluate(([s, n]) => [...document.querySelector(s).options].find((o) => o.text.includes(n))?.value, [sel, n]);
  const closeAll = async () => {
    await page.evaluate(() => {
      document.querySelector('#modal [data-act="closemodal"]')?.click();
      document.querySelector('#drawer [data-act="closedrawer"]')?.click();
    });
    await page.waitForTimeout(300);
  };
  const go = async (r) => { await closeAll(); { const l = await page.$(`#nav a[href="#${r}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(300); if (r === 'spk') { const b = await page.$('#tools [data-view="spk"][data-val="list"]'); if (b) await b.click(); } } await page.waitForTimeout(550); };
  const submit = async () => { await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500); };
  const login = async (email) => {
    await page.evaluate(() => localStorage.removeItem('mni-local-mock-session'));
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', email); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    // halaman dimuat ulang setelah login; tunggu sampai identitas pengguna terbaca (bukan "Tamu"), penting di runner CI yang lebih lambat
    await page.waitForTimeout(2000);
    try {
      await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 5 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    } catch (e) {
      const me = await page.evaluate(async () => { try { const u = await window.claude.use('user'); return u ? await u.me() : 'user=null'; } catch (e) { return 'galat: ' + e.message; } });
      const info = await page.evaluate(() => ({ url: location.href, who: (document.getElementById('who') || {}).innerText, nav: document.querySelectorAll('#nav a').length, auth: (document.body.innerText || '').slice(0, 200), session: localStorage.getItem('mni-local-mock-session') }));
      throw new Error('login ' + email + ' gagal: ' + JSON.stringify({ ...info, me, errs }));
    }
    await page.waitForTimeout(800);
  };
  // percobaan mencatat: hasil = jumlah baris mutasi bertambah
  const tryMove = async (route, label, item, qty) => {
    await go(route); await page.waitForTimeout(500); const n = await count('mutasi');
    const btn = await page.$(`#tools [data-act="mv"]:has-text("${label}")`);
    if (!btn || !(await btn.isVisible())) return 'tombol-tersembunyi';
    await btn.click(); await page.waitForTimeout(400);
    await page.selectOption('#m-item-0', await opt('#m-item-0', item)); await page.fill('#m-qty-0', String(qty));
    if (route === 'bahan-baku' && label === 'Terima material') await page.fill('#m-pihak', 'Supplier Contoh A');
    await submit();
    const ok2 = (await count('mutasi')) === n + 1;
    await closeAll();
    return ok2 ? 'tercatat' : 'ditolak';
  };

  await page.goto(base); await page.evaluate(() => localStorage.clear());

  // viewer: tidak boleh mencatat apa pun
  await login('viewer@mni.local');
  ok('R-01 viewer: nama tampil', (await page.evaluate(() => document.getElementById('who').innerText)).includes('Viewer Lokal'));
  ok('R-02 viewer: tombol terima material tersembunyi', (await tryMove('bahan-baku', 'Terima material', 'Plat', 5)) === 'tombol-tersembunyi');
  ok('R-03 viewer: tombol barang masuk tersembunyi', (await tryMove('barang-jadi', 'Barang masuk', '40x40', 5)) === 'tombol-tersembunyi');

  // gbb: bahan baku ya, barang jadi tidak
  await login('gbb@mni.local');
  ok('R-04 gbb: terima material tercatat', (await tryMove('bahan-baku', 'Terima material', 'Plat', 5)) === 'tercatat');
  ok('R-05 gbb: barang masuk ditolak', (await tryMove('barang-jadi', 'Barang masuk', '40x40', 5)) !== 'tercatat');

  // gbj: barang jadi ya, bahan baku tidak
  await login('gbj@mni.local');
  ok('R-06 gbj: barang masuk tercatat', (await tryMove('barang-jadi', 'Barang masuk', '40x40', 5)) === 'tercatat');
  ok('R-07 gbj: terima material ditolak', (await tryMove('bahan-baku', 'Terima material', 'Plat', 5)) !== 'tercatat');

  // logistik: tidak boleh bahan baku maupun barang jadi
  await login('logistik@mni.local');
  ok('R-08 logistik: terima material ditolak', (await tryMove('bahan-baku', 'Terima material', 'Plat', 5)) !== 'tercatat');
  ok('R-09 logistik: barang masuk ditolak', (await tryMove('barang-jadi', 'Barang masuk', '40x40', 5)) !== 'tercatat');

  // ppic: tidak boleh gudang
  await login('ppic@mni.local');
  ok('R-10 ppic: terima material ditolak', (await tryMove('bahan-baku', 'Terima material', 'Plat', 5)) !== 'tercatat');

  // admin: semua
  await login('admin@mni.local');
  ok('R-11 admin: terima material tercatat', (await tryMove('bahan-baku', 'Terima material', 'Plat', 5)) === 'tercatat');
  ok('R-12 admin: barang masuk tercatat', (await tryMove('barang-jadi', 'Barang masuk', '40x40', 5)) === 'tercatat');

  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
