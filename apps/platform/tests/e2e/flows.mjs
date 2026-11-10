// Alur inti pada pratinjau lokal mode mock. Disusun dari skenario yang dijalankan
// lewat Playwright MCP pada 2026-11-02 (hasil di documentation/TEST_MATRIX.md).
// Catatan: berkas ini belum dijalankan sebagai skrip mandiri; runner dan CI menyusul (T-023, T-046).
//
//   import { runFlows } from './flows.mjs'; await runFlows(page, 'http://127.0.0.1:5173/')

import { login } from './modules.mjs';

const tableLen = (page, t) => page.evaluate((x) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[x].length, t);
const optVal = (page, sel, needle) => page.evaluate(([s, n]) => [...document.querySelector(s).options].find((o) => o.text.includes(n))?.value, [sel, needle]);
const closeOverlays = async (page) => {
  await page.evaluate(() => {
    document.querySelector('#sheet [data-act="sheet-close"]')?.click();
    const m = document.getElementById('modal');
    if (!m.hidden) m.querySelector('[data-act="closemodal"]')?.click();
  });
  await page.waitForTimeout(250);
};
const go = async (page, route) => { await closeOverlays(page); { const l = await page.$(`#nav a[href="#${route}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, route); await page.waitForTimeout(300); if (route === 'spk') { const b = await page.$('#tools [data-view="spk"][data-val="list"]'); if (b) await b.click(); } } await page.waitForTimeout(500); };

export async function runFlows(page, base) {
  const r = [];
  const check = (id, ok, info = '') => r.push({ id, status: ok ? 'PASS' : 'FAIL', info });
  await login(page, base);

  // F-02 bahan baku: item baru
  await go(page, 'bahan-baku');
  let n = await tableLen(page, 'rm');
  await page.click('#tools [data-act="newitem"]');
  await page.fill('#m-item', 'Plat Uji E2E'); await page.fill('#m-ukuran', '1.5×1000×2000');
  await page.fill('#m-satuan', 'lbr'); await page.fill('#m-buffer', '5'); await page.fill('#m-stokAwal', '10');
  await page.click('#modal button:has-text("Simpan")'); await page.waitForTimeout(800);
  check('F-02', (await tableLen(page, 'rm')) === n + 1);

  // F-03 terima material
  n = await tableLen(page, 'mutasi');
  await page.click('#tools [data-act="mv"]:has-text("Terima material")'); await page.waitForTimeout(400);
  await page.selectOption('#m-item-0', await optVal(page, '#m-item-0', 'Plat Uji E2E'));
  await page.fill('#m-qty-0', '7'); await page.fill('#m-pihak', 'Supplier Contoh A');
  await page.click('#modal button:has-text("Terima material")'); await page.waitForTimeout(800);
  check('F-03', (await tableLen(page, 'mutasi')) === n + 1);

  // F-05 pakai melebihi stok harus ditolak
  n = await tableLen(page, 'mutasi');
  await page.click('#tools [data-act="mv"]:has-text("Pakai produksi")'); await page.waitForTimeout(400);
  await page.selectOption('#m-spk', await optVal(page, '#m-spk', '1001'));
  await page.selectOption('#m-item-0', await optVal(page, '#m-item-0', 'Plat Uji E2E'));
  await page.fill('#m-qty-0', '999');
  await page.click('#modal button:has-text("Pakai untuk produksi")'); await page.waitForTimeout(700);
  check('F-05', (await tableLen(page, 'mutasi')) === n, 'mutasi tidak boleh bertambah');
  await page.fill('#m-qty-0', '3');
  await page.click('#modal button:has-text("Pakai untuk produksi")'); await page.waitForTimeout(800);
  check('F-04', (await tableLen(page, 'mutasi')) === n + 1);

  // F-10 SPK baru dan terbitkan
  await go(page, 'spk');
  n = await tableLen(page, 'spk');
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-cust', 'Customer Uji E2E'); await page.fill('#ed-po', 'PO-E2E-01');
  await page.fill('#ed-due', '2026-12-15'); await page.fill('#ed-mat', 'SPCC'); await page.fill('#ed-tebal', '1.2');
  await page.fill('#ed-d-0-0', 'Hollow Uji'); await page.fill('#ed-q-0-0', '4'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor button[data-act="ed-save"]:has-text("Terbitkan SPK")'); await page.waitForTimeout(1000);
  check('F-10', (await tableLen(page, 'spk')) === n + 1);

  // F-11 kirim ke vendor, F-12 kirim ke customer
  await go(page, 'vendor');
  n = await tableLen(page, 'vendor');
  await page.click('#tools [data-act="newvendor"]'); await page.waitForTimeout(400);
  await page.fill('#m-vendor', 'Vendor Finishing Contoh'); await page.fill('#m-proses', 'Powder coat');
  await page.selectOption('#m-spk', await optVal(page, '#m-spk', '1003')); await page.waitForTimeout(300);
  await page.click('#modal button:has-text("Kirim ke vendor")'); await page.waitForTimeout(800);
  check('F-11', (await tableLen(page, 'vendor')) === n + 1);

  await go(page, 'pengiriman');
  n = await tableLen(page, 'kirim');
  await page.click('#tools [data-act="newkirim"]'); await page.waitForTimeout(400);
  await page.selectOption('#m-spk', await optVal(page, '#m-spk', '1001')); await page.waitForTimeout(300);
  await page.click('#modal button:has-text("Buat surat jalan")'); await page.waitForTimeout(800);
  check('F-12', (await tableLen(page, 'kirim')) === n + 1);

  return r;
}
