// Uji aksesibilitas (WCAG 2.0 A dan AA) dengan axe-core pada semua menu, dua tema, form, laci, dan kartu stok. Mock, data sintetis.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AXE = require.resolve('axe-core/axe.min.js');

export async function runAksesibilitas(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
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
  await page.addScriptTag({ path: AXE });
  const scan = async () => page.evaluate(async () => {
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
    return r.violations.map((v) => `${v.id}(${v.impact}):${v.nodes.length} ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' ; ')}`);
  });
  const theme = (t) => page.evaluate((t) => { const b = [...document.querySelectorAll('[data-theme-set]')].find((x) => x.dataset.themeSet === t); b && b.click(); }, t);
  const views = await page.evaluate(() => [...document.querySelectorAll('#nav a')].map((a) => a.getAttribute('href')).filter(Boolean).concat(['#pengguna', '#kinerja']));
  const bad = {};
  for (const th of ['dark', 'light']) {
    await theme(th); await page.waitForTimeout(300);
    for (const v of views) {
      await page.evaluate((v) => { location.hash = v; }, v); await page.waitForTimeout(900);
      const r = await scan(); if (r.length) bad[th + v] = r;
    }
  }
  ok(`A-1 ${views.length} menu x 2 tema tanpa pelanggaran WCAG 2 A dan AA`, Object.keys(bad).length === 0, JSON.stringify(bad).slice(0, 500));

  // form dan laci
  const act = (n, d = {}) => page.evaluate(([n, d]) => { const b = document.createElement('button'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [n, d]);
  const close = () => page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Batal')?.click(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
  const ids = await page.evaluate(() => { const t = JSON.parse(localStorage.getItem('mni-local-mock-db')).tables; return { spk: t.spk[0].id, rm: t.rm[0].id, fg: t.fg[0].id }; });
  const forms = [['mv', { g: 'rm', j: 'masuk' }], ['mv', { g: 'rm', j: 'keluar' }], ['mv', { g: 'fg', j: 'keluar' }], ['mv', { g: 'sp', j: 'masuk' }], ['mv', { g: 'rm', j: 'opname' }], ['newkirim', { spk: ids.spk }], ['newvendor', { spk: ids.spk }], ['newspk', {}], ['kartu', { g: 'rm', id: ids.rm }], ['kartu', { g: 'fg', id: ids.fg }], ['openspk', { id: ids.spk }]];
  const badForm = {};
  for (const th of ['dark', 'light']) {
    await theme(th);
    for (const [n, d] of forms) {
      await page.evaluate(() => { location.hash = '#bahan-baku'; }); await page.waitForTimeout(400);
      await act(n, d); await page.waitForTimeout(1000);
      const r = await scan(); if (r.length) badForm[`${th} ${n} ${JSON.stringify(d)}`] = r;
      await close(); await page.waitForTimeout(250);
    }
  }
  ok(`A-2 ${forms.length} form, laci, dan kartu x 2 tema tanpa pelanggaran`, Object.keys(badForm).length === 0, JSON.stringify(badForm).slice(0, 600));
  ok('A-3 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
