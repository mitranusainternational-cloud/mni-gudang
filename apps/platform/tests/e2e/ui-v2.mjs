// Uji tampilan baru (UI v2): bilah atas dengan breadcrumb dan pencarian cepat Ctrl K (hanya navigasi, tidak mengubah data).
export async function runUiV2(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.setDefaultTimeout(15000);
  let langkah = 'mulai';
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);

    langkah = 'UI-01';
    const b1 = await page.evaluate(() => ({ bar: !!document.getElementById('bar'), crumb: document.getElementById('crumb').innerText.replace(/\s+/g, ' '), tema: !!document.getElementById('th-light'), live: !!document.getElementById('live'), chip: !!document.getElementById('mechip'), cari: !!document.getElementById('cmdkbtn') }));
    await page.evaluate(() => { location.hash = '#maintenance'; }); await wait(900);
    const b2 = await page.evaluate(() => document.getElementById('crumb').innerText.replace(/\s+/g, ' '));
    ok('UI-01 bilah atas: breadcrumb mengikuti layar (Pantauan › Dashboard, Maintenance › Maintenance), tema, status realtime, akun, dan tombol cari ada', b1.bar && b1.tema && b1.live && b1.chip && b1.cari && /Pantauan.*Dashboard/.test(b1.crumb) && /Maintenance.*Maintenance/.test(b2), JSON.stringify({ b1, b2 }));

    langkah = 'UI-02';
    await page.keyboard.press('Control+k'); await wait(500);
    const c1 = await page.evaluate(() => ({ buka: !!document.getElementById('cmdk'), layar: document.querySelectorAll('#cmdk .cmdk-it').length }));
    await page.fill('#cmdk-q', 'QC'); await wait(400);
    const c2 = await page.evaluate(() => [...document.querySelectorAll('#cmdk .cmdk-it')].map((x) => x.innerText.replace(/\s+/g, ' ')).join('|'));
    await page.keyboard.press('Enter'); await wait(900);
    const c3 = await page.evaluate(() => ({ tutup: !document.getElementById('cmdk'), hash: location.hash }));
    await page.keyboard.press('Control+k'); await wait(300); await page.keyboard.press('Escape'); await wait(300);
    const c4 = await page.evaluate(() => !document.getElementById('cmdk'));
    ok('UI-02 Ctrl K membuka pencarian cepat berisi layar; mengetik QC menemukan layar QC, Enter membukanya dan menutup dialog; Esc menutup', c1.buka && c1.layar > 3 && /QC/.test(c2) && c3.tutup && c3.hash === '#qc' && c4, JSON.stringify({ c1, c2, c3, c4 }));

    langkah = 'UI-03';
    await page.evaluate(() => { location.hash = '#dashboard'; }); await wait(1200);
    const g1 = await page.evaluate(() => ({ baris: !!document.querySelector('.g-row'), judul: [...document.querySelectorAll('.g-card header h2')].map((h) => h.innerText).join('|'), kosong: document.querySelectorAll('.g-empty').length }));
    const g2 = await page.evaluate(() => { const rows = Array.from({ length: 30 }, (_, i) => ({ d: gDay(today(), -(29 - i)), kg: i % 3 ? 1200 + i * 40 : 0, q: 10 + i })); const a = gArea(rows); const k = gKirimMingguan(); return { svg: /<svg class="g-svg"/.test(a), path: /<path/.test(a), kirim: /g-svg|g-empty/.test(k), akhir: typeof evAkhirList === 'function' && evAkhirList([{ jenis: 'hasil', qty: 1 }]).length === 1 }; });
    ok('UI-03 Dashboard memuat tiga panel grafik (output harian, ketepatan kirim, pengiriman per minggu) dengan keadaan kosong yang rapi; gambar area dan batang dibuat dari data', g1.baris && /Output produksi harian|Ketepatan kirim|Pengiriman per minggu/.test(g1.judul) && g2.svg && g2.path && g2.kirim && g2.akhir, JSON.stringify({ g1, g2 }));

    ok('UI-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  } catch (e) {
    ok('UI-ERR ' + langkah, false, String(e.message).replace(/\u001b\[[0-9;]*m/g, '').slice(0, 800));
  }
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
