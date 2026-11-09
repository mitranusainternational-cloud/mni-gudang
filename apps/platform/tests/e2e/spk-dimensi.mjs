// Uji layout SPK per dimensi (T-222 tahap 2, mock): bendera mati/hidup, kolom W H L terpisah, bentuk Straight sebagai default,
// nama item dari dimensi, dan kg estimasi/real bila katalog sintetis terpasang.
import fs from 'node:fs';

const kat = JSON.parse(fs.readFileSync(new URL('./fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));

export async function runSpkDimensi(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(700); };
    const bukaBaru = async () => { await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(500); };
    const heads = () => page.evaluate(() => [...document.querySelectorAll('#ed-secs table.edt thead th')].map((t) => t.textContent.replace(/\s+/g, ' ').trim()));
    const bendera = (on) => page.evaluate(async (on) => { await saveSetting({ spkDimBaru: on }); }, on);

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);

    // DM-00 tanpa pengaturan apa pun: layout per dimensi aktif secara bawaan (kolom W, H, L terpisah)
    await bukaBaru();
    await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(500);
    const h0 = await heads();
    ok('DM-00 bawaan (tanpa pengaturan): kolom W (mm), H (mm), L (mm) terpisah', h0.includes('W (mm)') && h0.includes('H (mm)') && h0.includes('L (mm)'), JSON.stringify(h0));
    await page.evaluate(() => { const b = document.querySelector('#editor [data-act="ed-close"]'); if (b) { b.click(); b.click(); } });
    await wait(300);

    // DM-01 bendera mati: header lama (Description), tanpa kolom W H L
    await bendera(false); await page.reload(); await wait(2500);
    await bukaBaru();
    await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(400);
    const h1 = await heads();
    ok('DM-01 bendera mati: header lama (Description) tetap dipakai', h1.some((x) => /Description/.test(x)) && !h1.some((x) => /^W/.test(x)), JSON.stringify(h1));
    await page.evaluate(() => document.querySelector('#editor [data-act="ed-close"]')?.click()); await wait(300);

    // aktifkan bendera
    await bendera(true); await page.reload(); await wait(2500);
    await bukaBaru();
    await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(500);

    // DM-02 bendera hidup, tanpa katalog: kolom W, H, L terpisah
    const h2 = await heads();
    ok('DM-02 bendera aktif: kolom W (mm), H (mm), L (mm) terpisah dan tanpa Description', h2.includes('W (mm)') && h2.includes('H (mm)') && h2.includes('L (mm)') && !h2.some((x) => /Description/.test(x)), JSON.stringify(h2));

    // DM-03 baris baru memakai bentuk Straight sebagai default dan punya input W, H, L
    await page.click('[data-act="ed-addline"][data-s="0"]'); await wait(400);
    const d3 = await page.evaluate(() => { const sel = document.getElementById('ed-sb-0-0'); return { bentuk: sel ? sel.options[sel.selectedIndex].text : null, w: !!document.getElementById('ed-dm-0-0-w'), h: !!document.getElementById('ed-dm-0-0-h'), l: !!document.getElementById('ed-dm-0-0-l') }; });
    ok('DM-03 baris pertama Cable Tray: bentuk Straight dipilih dan input W, H, L tersedia', d3.bentuk === 'Straight' && d3.w && d3.h && d3.l, JSON.stringify(d3));

    // DM-04 mengisi W, H, L membentuk nama item; tanpa katalog kg belum dihitung
    await page.fill('#ed-dm-0-0-w', '100'); await page.fill('#ed-dm-0-0-h', '50'); await page.fill('#ed-dm-0-0-l', '3000'); await page.fill('#ed-q-0-0', '10'); await wait(500);
    const d4 = await page.evaluate(() => ({ nama: (document.getElementById('ed-nm-0-0') || {}).textContent || '', kgsub: !!document.querySelector('#ed-secs .kgsub') }));
    ok('DM-04 W 100, H 50, L 3000 membentuk nama Cable Tray W100xH50xL3000; tanpa katalog tidak ada kg otomatis', /W100xH50xL3000/.test(d4.nama) && !d4.kgsub, JSON.stringify(d4));

    // DM-05 katalog terpasang: kg estimasi dan real muncul per baris dan di footer
    await page.evaluate((c) => { window.MNIBerat.setKatalog(c); }, kat);
    await page.evaluate(() => { const b = document.querySelector('#editor [data-act="ed-close"]'); if (b) { b.click(); b.click(); } });
    await wait(300);
    await bukaBaru();
    await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(500);
    await page.click('[data-act="ed-addline"][data-s="0"]'); await wait(300);
    await page.fill('#ed-dm-0-0-w', '100'); await page.fill('#ed-dm-0-0-h', '50'); await page.fill('#ed-dm-0-0-l', '3000'); await page.fill('#ed-q-0-0', '10'); await wait(700);
    const d5 = await page.evaluate(() => ({ kg: (document.querySelector('#ed-secs .kgsub') || {}).textContent || '', tot: (document.getElementById('ed-tot') || {}).textContent || '' }));
    ok('DM-05 katalog terpasang: baris menampilkan est dan real per pcs; footer menampilkan plate (est) dan barang jadi (real)', /est .* real .* Kg/.test(d5.kg) && /plate \(est\)/.test(d5.tot) && /barang jadi \(real\)/.test(d5.tot), JSON.stringify(d5));

    // DM-07 simpan draft: item menyimpan kg estimasi (wEst, plate) dan real (w, barang jadi) yang berbeda
    await page.fill('#ed-cust', 'PT Uji Dimensi'); await page.fill('#ed-po', 'PO-DIM-1'); await wait(300);
    await page.evaluate(() => { const b = [...document.querySelectorAll('#editor button')].find((x) => /Simpan draft/.test(x.textContent)); if (b) b.click(); });
    await wait(1500);
    const d7 = await page.evaluate(() => { const s = S.spk.filter((x) => x.customer === 'PT Uji Dimensi').pop(); const it = s && s.items && s.items[0]; return it ? { wEst: it.wEst, w: it.w, dEst: matSpkItems(s)[0].w } : null; });
    ok('DM-07 item tersimpan membawa wEst (plate, ~5,06) dan w (real, ~4,43); kebutuhan plate memakai wEst', !!d7 && Math.abs(d7.wEst - 5.06) < 0.01 && Math.abs(d7.w - 4.43) < 0.01 && Math.abs(d7.dEst - d7.wEst) < 1e-9, JSON.stringify(d7));

    // DM-08 item lama tanpa wEst tetap memakai berat lama (tidak berubah sebelum dibuka ulang)
    const d8 = await page.evaluate(() => matSpkItems({ _id: 'lama', stokReq: false, items: [{ d: 'X', g: 'CABLE TRAY', q: 4, w: 7.5 }] })[0].w);
    ok('DM-08 item lama tanpa wEst: kebutuhan plate memakai berat lama (7,5)', d8 === 7.5, String(d8));

    // DM-09 tonase dokumen vendor/kirim: item dokumen tanpa berat memakai berat real dari item SPK yang sama
    const d9 = await page.evaluate(() => { const s = S.spk.filter((x) => x.customer === 'PT Uji Dimensi').pop(); const it = s.items[0]; return { dari: wRealDok({ spk: s._id }, { d: it.d, q: 3 }), dokBerat: wRealDok({ spk: s._id }, { d: it.d, q: 3, w: 9 }), tidakAda: wRealDok({ spk: s._id }, { d: 'item tidak ada', q: 3 }), w: it.w }; });
    ok('DM-09 berat real dokumen: dari item SPK (4,43), berat dokumen didahulukan (9), item tak dikenal 0', Math.abs(d9.dari - d9.w) < 1e-9 && d9.dokBerat === 9 && d9.tidakAda === 0, JSON.stringify(d9));

    // DM-10 lembar SPK: baris dua total (estimasi plate dan real barang jadi) di atas footer
    await page.evaluate(() => { document.querySelector('#editor [data-act="ed-close"]')?.click(); });
    await wait(300);
    const sid = await page.evaluate(() => S.spk.filter((x) => x.customer === 'PT Uji Dimensi').pop()._id);
    await page.evaluate((id) => openSheet(id), sid); await wait(900);
    const d10 = await page.evaluate(() => (document.querySelector('#sheet .pp-kg') || {}).textContent || '');
    ok('DM-10 lembar SPK menampilkan Kg estimasi (plate) 50,61 dan Kg real (barang jadi) 44,26', /Kg estimasi \(plate\): 50,61/.test(d10) && /Kg real \(barang jadi\): 44,26/.test(d10), d10);

    // DM-11 SPK lama tanpa kg estimasi: tidak menampilkan baris dua total
    const d11 = await page.evaluate(() => spkKgDua({ items: [{ q: 2, w: 3 }, { q: 5, w: 1.5 }] }));
    ok('DM-11 SPK lama tanpa wEst: ada=false, total real 13,5 dan estimasi sama (tidak ada baris dua total)', d11.ada === false && Math.abs(d11.tr - 13.5) < 1e-9 && Math.abs(d11.te - 13.5) < 1e-9, JSON.stringify(d11));

    // DM-12 rute memakai Work Centre yang tidak ada di master: Produksi Hari Ini memberi peringatan
    await go('#mesin'); await wait(1200);
    const d12 = await page.evaluate(() => ({ hilang: ruteWcHilang(), teks: (document.querySelector('#body') || document.body).innerText.replace(/\s+/g, ' ') }));
    ok('DM-12 WC master tidak memuat Shearing dan Punching: banner peringatan muncul dan menyebut keduanya', d12.hilang.includes('Shearing') && d12.hilang.includes('Punching') && /Rute produksi memakai Work Centre yang belum ada di Master Data/.test(d12.teks), JSON.stringify(d12.hilang) + " | " + d12.teks.slice(0, 160));

    // DM-06 tidak ada pageerror
    await page.evaluate(() => { const b = document.querySelector('#editor [data-act="ed-close"]'); if (b) { b.click(); b.click(); } });
    await bendera(false);
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('DM-06 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
