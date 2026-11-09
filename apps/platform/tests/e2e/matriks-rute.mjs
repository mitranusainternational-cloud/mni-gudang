// Uji Matriks rute di Master Data (T-223, mock): satu layar produk dan komponen x Work Centre, sumber rute (kustom, aturan khusus, ikut produk),
// rute kustom dari centang, tombol Pulihkan, batas minimal satu Work Centre, dan banner Work Centre yang belum ada. Memakai katalog sintetis.
import fs from 'node:fs';

const kat = JSON.parse(fs.readFileSync(new URL('./fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));

export async function runMatriksRute(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(700); };
    const bukaMatriks = async () => { await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="rute"]'); await wait(700); };
    const baris = (rk) => page.evaluate((rk) => { const tr = document.querySelector('#rute-tabel tr[data-rk="' + rk + '"]'); if (!tr) return null; return { sumber: (tr.querySelector('.chip') || {}).textContent, rute: (tr.querySelector('td.muted') || {}).textContent, ck: [...tr.querySelectorAll('input:checked')].map((i) => i.value) }; }, rk);
    const centang = async (rk, wc) => { await page.evaluate(([rk, wc]) => { document.querySelector('#rute-tabel input[data-rk="' + rk + '"][value="' + wc + '"]').click(); }, [rk, wc]); await wait(900); };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);
    await page.evaluate((c) => { window.MNIBerat.setKatalog(c); }, kat);

    // MR-01 banner: rute standar memakai Work Centre yang belum ada di master mock
    await bukaMatriks();
    const t1 = await page.evaluate(() => (document.querySelector('#body') || document.body).innerText.replace(/\s+/g, ' '));
    ok('MR-01 Work Centre master belum memuat Shearing, Punching, CNC Laser: banner menyebutnya', /Rute memakai Work Centre yang belum ada di Master Data/.test(t1) && /Shearing/.test(t1) && /CNC Laser/.test(t1), t1.slice(0, 200));

    // tambah Work Centre yang kurang
    await page.evaluate(async () => {
      for (const [i, nm] of ['Shearing', 'Punching', 'CNC Laser'].entries()) await addDoc('mwc', { kode: 'WC-MR' + i, nama: nm, tipe: 'Internal', urutan: i + 1, aktif: true, ket: '', mesin: [] });
    });
    await wait(1200);
    await bukaMatriks();

    // MR-02 matriks: baris produk dan komponen, banner hilang
    const m2 = await page.evaluate(() => ({ prod: !!document.querySelector('#rute-tabel tr[data-rk="ACCS TRAY"]'), elbow: !!document.querySelector('#rute-tabel tr[data-rk="ACCS TRAY|ELBOW"]'), banner: /belum ada di Master Data/.test((document.querySelector('#body') || document.body).innerText), kolom: [...document.querySelectorAll('#rute-tabel thead th')].map((t) => t.textContent.trim()) }));
    ok('MR-02 matriks memuat baris produk ACCS TRAY dan komponen Elbow; kolom Work Centre; banner hilang', m2.prod && m2.elbow && !m2.banner && m2.kolom.includes('Shearing') && m2.kolom.includes('CNC Laser'), JSON.stringify(m2));

    // MR-03 sumber rute: Elbow ikut produk ACCS; Hanger Beam aturan khusus (CNC Laser, Bending)
    const e3 = await baris('ACCS TRAY|ELBOW'); const h3 = await baris('ACCS TRAY|HANGER_BEAM'); const p3 = await baris('ACCS TRAY');
    ok('MR-03 Elbow = Ikut produk (rute ACCS), Hanger Beam = Aturan khusus (CNC Laser, Bending)', e3.sumber === 'Ikut produk' && e3.rute === p3.rute && h3.sumber === 'Aturan khusus' && h3.ck.includes('CNC Laser') && h3.ck.includes('Bending') && !h3.ck.includes('Welding'), JSON.stringify({ e3, h3 }));

    // MR-04 mengubah centang membuat rute kustom hanya untuk komponen itu
    await centang('ACCS TRAY|ELBOW', 'Welding');
    const peta4 = await page.evaluate(() => ruteStd());
    const e4 = await baris('ACCS TRAY|ELBOW'); const r4 = await baris('ACCS TRAY|REDUCER'); const p4 = await baris('ACCS TRAY');
    ok('MR-04 hapus Welding dari Elbow: rute kustom tanpa Welding; Reducer dan produk tidak berubah', Array.isArray(peta4['ACCS TRAY|ELBOW']) && !peta4['ACCS TRAY|ELBOW'].includes('Welding') && e4.sumber === 'Kustom' && r4.sumber === 'Ikut produk' && p4.ck.includes('Welding'), JSON.stringify({ k: peta4['ACCS TRAY|ELBOW'], e4: e4.sumber, r4: r4.sumber }));

    // MR-05 Pulihkan mengembalikan ke rute produk
    await page.evaluate(() => { document.querySelector('#rute-tabel button[data-act="rutedel"][data-rk="ACCS TRAY|ELBOW"]').click(); }); await wait(900);
    const peta5 = await page.evaluate(() => ruteStd()); const e5 = await baris('ACCS TRAY|ELBOW');
    ok('MR-05 Pulihkan menghapus rute kustom Elbow; kembali Ikut produk', peta5['ACCS TRAY|ELBOW'] === undefined && e5.sumber === 'Ikut produk', JSON.stringify(e5));

    // MR-06 rute minimal satu Work Centre
    await centang('ACCS TRAY|HANGER_BEAM', 'Bending');
    await centang('ACCS TRAY|HANGER_BEAM', 'CNC Laser');
    const peta6 = await page.evaluate(() => ruteStd()); const h6 = await baris('ACCS TRAY|HANGER_BEAM');
    ok('MR-06 Work Centre terakhir tidak bisa dicabut: rute tetap CNC Laser dan centang tetap', JSON.stringify(peta6['ACCS TRAY|HANGER_BEAM']) === JSON.stringify(['CNC Laser']) && h6.ck.length === 1 && h6.ck[0] === 'CNC Laser', JSON.stringify({ k: peta6['ACCS TRAY|HANGER_BEAM'], ck: h6.ck }));

    // MR-07 pencarian menyaring baris
    await page.evaluate(() => { const q = document.getElementById('q-master'); q.value = 'hanger'; q.dispatchEvent(new Event('input', { bubbles: true })); }); await wait(700);
    const s7 = await page.evaluate(() => [...document.querySelectorAll('#rute-tabel tbody tr')].map((tr) => tr.dataset.rk));
    ok('MR-07 pencarian "hanger": komponen Hanger Beam tampil dengan baris produk induknya; komponen lain (Elbow) tersaring', s7.some((k) => /HANGER_BEAM$/.test(k)) && s7.every((k) => /HANGER_BEAM$|^ACCS (TRAY|LADDER|DUCT)$/.test(k)) && !s7.some((k) => /ELBOW/.test(k)), JSON.stringify(s7));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('MR-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
