// Uji perapian Master Data (T-225, mock): lebar kolom W H L, satu tab Rute produksi (tanpa duplikasi dengan matriks), Aturan section memuat semua produk
// dari Opsi SPK, dan jenis material yang dipilih eksplisit pada item bahan baku.
import fs from 'node:fs';

const kat = JSON.parse(fs.readFileSync(new URL('./fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));

export async function runMasterData(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(800); };
    const tab = async (v) => { await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="' + v + '"]'); await wait(700); };
    const submit = async () => { await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); }); await wait(1000); };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.evaluate(async () => { await saveSetting({ spkDimBaru: true }); }); await wait(500);
    await page.reload(); await wait(3500);
    await page.evaluate((c) => { window.MNIBerat.setKatalog(c); }, kat);

    // MD-01 kolom W, H, L ringkas (tidak melebar ratusan piksel)
    await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(600);
    await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(500);
    const lebar = await page.evaluate(() => ['w', 'h', 'l'].map((k) => Math.round(document.getElementById('ed-dm-0-0-' + k).closest('td').getBoundingClientRect().width)));
    ok('MD-01 lebar kolom W, H, L masing-masing maksimal 160 px', lebar.every((x) => x > 0 && x <= 160), JSON.stringify(lebar));
    await page.evaluate(() => { const b = document.querySelector('#editor [data-act="ed-close"]'); if (b) { b.click(); b.click(); } }); await wait(300);

    // MD-02 satu tab rute: tidak ada tab Matriks rute terpisah; tabel rute memuat baris komponen dan tanpa form tambah lama
    await tab('rute');
    const t2 = await page.evaluate(() => ({ tabs: [...document.querySelectorAll('.seg button')].map((b) => b.textContent.trim()), tabel: !!document.getElementById('rute-tabel'), lama: !!document.getElementById('rute-baru'), komponen: !!document.querySelector('#rute-tabel tr[data-rk="ACCS TRAY|ELBOW"]') }));
    ok('MD-02 satu tab Rute produksi (tanpa Matriks rute terpisah): tabel memuat produk dan komponen, form tambah lama hilang', t2.tabs.includes('Rute produksi') && !t2.tabs.includes('Matriks rute') && t2.tabel && !t2.lama && t2.komponen, JSON.stringify(t2));

    // MD-03 Aturan section memuat semua produk dari Opsi SPK (bukan hanya tujuh produk bawaan kode)
    await tab('aturan');
    const prod3 = await page.evaluate(() => [...new Set([...document.querySelectorAll('input[data-ar]')].map((c) => c.dataset.ar.split('|')[0]))]);
    ok('MD-03 Aturan section memuat 11 section bawaan dari Opsi SPK (termasuk Cable Duct, Cover Ladder, Cover Duct, Other Support)', ['CABLE DUCT', 'COVER LADDER', 'COVER DUCT', 'OTHER SUPPORT', 'CABLE TRAY'].every((x) => prod3.includes(x)) && prod3.length === 11, JSON.stringify(prod3));

    // MD-04 jenis material eksplisit pada item
    const id = await page.evaluate(async () => {
      const r = await addDoc('rm', { item: 'Plat Tanpa Kata Kunci', ukuran: '1.2 x 1219 x 2438', satuan: 'Lembar', buffer: 0, stokAwal: 5, tglStokAwal: today() });
      await new Promise((res) => setTimeout(res, 900));
      return (r && r._id) || (S.rm.find((x) => x.item === 'Plat Tanpa Kata Kunci') || {})._id;
    });
    const a4 = await page.evaluate((id) => grade(byId('rm', id)), id);
    await page.evaluate(async (id) => { await updDoc('rm', id, { jenis: 'SS304' }); }, id); await wait(900);
    const b4 = await page.evaluate((id) => ({ g: grade(byId('rm', id)), kg: kgLbr(byId('rm', id)) }), id);
    const harap = 1.2 * 1219 * 2438 * 7.93 / 1e6;
    ok('MD-04 item tanpa kata kunci = Lainnya; setelah jenis SS304 dipilih eksplisit: SS304 dan berat per lembar memakai massa jenisnya', a4 === 'Lainnya' && b4.g === 'SS304' && Math.abs(b4.kg - harap) < 0.05, JSON.stringify({ a4, b4, harap }));

    // MD-05 form Ubah item punya pilihan Jenis material dan menyimpannya
    await page.evaluate((id) => rmEditForm(id), id); await wait(700);
    const f5 = await page.evaluate(() => { const f = document.querySelector('#mform'); return f && f.jenis ? { ada: true, nilai: f.jenis.value, opsi: [...f.jenis.options].map((o) => o.textContent).slice(0, 3) } : { ada: false }; });
    await page.evaluate(() => { document.querySelector('#mform').jenis.value = 'SPCC'; });
    await submit();
    const j5 = await page.evaluate((id) => byId('rm', id).jenis, id);
    ok('MD-05 form Ubah item memuat pilihan Jenis material (SS304 terpilih); memilih SPCC tersimpan di item', f5.ada && f5.nilai === 'SS304' && j5 === 'SPCC', JSON.stringify({ f5, j5 }));
    // MD-06 satu sumber massa jenis: kalkulator SPK mengikuti massa jenis di Master Data
    const kg1 = await page.evaluate(() => { bjHook(); return window.MNIBerat.kgPerPcs({ keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 100, h: 50, l: 3000 }, tebal: '1.2', material: 'SPHC' }).kgPcsEst; });
    await page.evaluate(async () => { await saveSetting({ dens: { SPHC: 8.0 } }); }); await wait(900);
    const kg2 = await page.evaluate(() => window.MNIBerat.kgPerPcs({ keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 100, h: 50, l: 3000 }, tebal: '1.2', material: 'SPHC' }).kgPcsEst);
    ok('MD-06 massa jenis SPHC diubah di Master Data (7,85 → 8,0): kg per pcs di kalkulator SPK ikut naik sebanding', Math.abs(kg2 / kg1 - 8.0 / 7.85) < 1e-6, JSON.stringify({ kg1, kg2, rasio: kg2 / kg1 }));

  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('MD-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
