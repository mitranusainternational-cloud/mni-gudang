// Pemindai kejanggalan tampilan (mock): membuka semua menu di layar desktop dan HP dan mencari tanda cacat yang tidak perlu penegasan tertentu:
// teks "undefined", "NaN", "[object Object]", "null", gambar rusak, meluap ke samping di HP, tabel berkepala tanpa baris dan tanpa keadaan kosong,
// angka tidak terhingga, tanggal tidak sah, dan galat konsol.
export async function pindaiKejanggalan(page) {
  const views = await page.evaluate(() => [...document.querySelectorAll('#nav a')].map((a) => a.getAttribute('href')).filter(Boolean).concat(['#pengguna', '#kinerja']));
  const temuan = [];
  const konsol = [];
  const onConsole = (m) => { if (m.type() === 'error') konsol.push(m.text().slice(0, 140)); };
  page.on('console', onConsole);
  const asli = page.viewportSize();
  for (const [nama, vp] of [['desktop', { width: 1366, height: 900 }], ['hp', { width: 390, height: 844 }]]) {
    await page.setViewportSize(vp); await page.waitForTimeout(300);
    for (const v of views) {
      await page.evaluate((v) => { location.hash = v; }, v); await page.waitForTimeout(900);
      const r = await page.evaluate((hp) => {
        const T = document.body.innerText;
        const out = [];
        for (const re of [/\bundefined\b/, /\bNaN\b/, /\[object Object\]/, /\bnull\b/, /\bInfinity\b/, /Invalid Date/]) { const m = T.match(re); if (m) out.push('teks "' + m[0] + '"'); }
        const rusak = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.src && !i.src.endsWith('/')).length;
        if (rusak) out.push(rusak + ' gambar rusak');
        if (hp && document.documentElement.scrollWidth > window.innerWidth + 2) out.push('meluap ke samping ' + document.documentElement.scrollWidth + 'px');
        const kosong = [...document.querySelectorAll('table')].filter((t) => t.querySelector('thead') && t.querySelectorAll('tbody tr').length === 0 && getComputedStyle(t).display !== 'none' && t.getClientRects().length).length;
        if (kosong) out.push(kosong + ' tabel berkepala tanpa baris');
        return out;
      }, nama === 'hp');
      if (r.length) temuan.push(`${nama}${v}: ${r.join(', ')}`);
    }
  }
  await page.setViewportSize(asli || { width: 1280, height: 800 });
  page.off('console', onConsole);
  const galat = konsol.filter((x) => !/favicon|Failed to load resource.*(font|gstatic|googleapis)/i.test(x));
  return { temuan, galat, jumlahMenu: views.length };
}
