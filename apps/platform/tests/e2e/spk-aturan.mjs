// Uji aturan section SPK (T-220, mock): bentuk per section sesuai standar (Cable Tray = straight, ACCS = fitting + aksesori, Cover = tutup),
// aturan dapat diubah di Master Data, section COVER, dan keterangan pemakaian stok barang jadi di editor SPK.
import fs from 'node:fs';

const kat = JSON.parse(fs.readFileSync(new URL('./fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));

export async function runSpkAturan(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(700); };
    const pasangKatalog = (c) => page.evaluate((c) => { window.MNIBerat.setKatalog(c); }, c);
    const bukaBaru = async () => { await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(500); };
    const opsi = (id) => page.evaluate((id) => [...document.getElementById(id).options].map((o) => o.textContent), id);
    const teks = (id) => page.evaluate((id) => (document.getElementById(id) || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim(), id);
    const tutupEditor = () => page.evaluate(() => { const b = document.querySelector('#editor [data-act="ed-close"]'); if (b) { b.click(); b.click(); } });

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500); await pasangKatalog(kat);
    // produk jadi di gudang: Cable Tray STU 100x50 L3000 ELG 1.2, stok 40
    await page.evaluate(async () => { await addDoc('fg', { kategori: 'Cable Tray', type: 'STU', ukuran: '100x50', panjang: 3000, finishing: 'ELG', tebal: '1.2', satuan: 'Btg', stokAwal: 40, tglStokAwal: today(), ket: '' }); });
    await wait(800);

    // AR-01 tab Aturan section
    await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="aturan"]'); await wait(600);
    const t1 = await page.evaluate(() => { const c = (k) => { const e = document.querySelector('input[data-ar="' + k + '"]'); return e ? e.checked : null; }; return { n: document.querySelectorAll('input[data-ar]').length, accsElbow: c('ACCS TRAY|ELBOW'), ctElbow: c('CABLE TRAY|ELBOW'), ctStraight: c('CABLE TRAY|STRAIGHT'), accsStraight: c('ACCS TRAY|STRAIGHT'), cover: c('COVER TRAY|COVER_STRAIGHT'), simpan: !!document.querySelector('[data-act="aturansimpan"]') }; });
    ok('AR-01 tab Aturan section: tabel bentuk x produk dengan standar MNI (Elbow di ACCS ya, di Cable Tray tidak; Straight di Cable Tray ya, di ACCS tidak)', t1.n >= 7 * 5 && t1.accsElbow === true && t1.ctElbow === false && t1.ctStraight === true && t1.accsStraight === false && t1.cover === true && t1.simpan, JSON.stringify(t1));

    // AR-02 editor mengikuti standar
    await bukaBaru();
    const o1 = await opsi('ed-sb-0-0');
    await page.selectOption('#ed-hp-0', 'ACCS TRAY'); await wait(500);
    await page.click('[data-act="ed-addsec"]'); await wait(300);
    await page.selectOption('#ed-hp-0', 'CABLE TRAY'); await wait(400);
    await tutupEditor(); await wait(300);
    ok('AR-02 section Cable Tray hanya menawarkan Straight', o1.join() === 'Teks bebas,Straight', o1.join());

    // AR-03 ACCS memuat fitting dan aksesori; COVER memuat tutup; tombol Section COVER
    await bukaBaru();
    await page.selectOption('#ed-hp-0', 'ACCS TRAY'); await wait(500);
    await page.selectOption('#ed-sb-0-0', { label: 'Elbow 90' }); await wait(300);
    const oA = await opsi('ed-sb-0-0');
    await page.click('[data-act="ed-addcov"]'); await wait(400);
    const cov = await page.evaluate(() => ({ h: document.getElementById('ed-h-1').value, p: document.getElementById('ed-hp-1').value }));
    await page.selectOption('#ed-hp-1', 'COVER TRAY'); await wait(400);
    const oC = await opsi('ed-sb-1-0').catch(() => []);
    await tutupEditor(); await wait(300);
    ok('AR-03 section ACCS TRAY menawarkan fitting dan aksesori (Elbow, Reducer, Hanger Beam)', ['Elbow 90', 'Reducer', 'Hanger Beam'].every((x) => oA.includes(x)) && !oA.includes('Straight'), oA.join());
    ok('AR-04 tombol Section COVER menambah section COVER TRAY yang menawarkan tutup', /^COVER TRAY/.test(cov.h) && cov.p === 'COVER TRAY' && oC.includes('Cover Straight') && !oC.includes('Elbow 90'), JSON.stringify({ cov, oC }));

    // AR-05 ubah aturan di Master Data lalu pulihkan
    await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="aturan"]'); await wait(500);
    await page.evaluate(() => { document.querySelector('input[data-ar="CABLE TRAY|ELBOW"]').click(); });
    await page.click('[data-act="aturansimpan"]'); await wait(1200);
    const sv = await page.evaluate(() => { const a = (byId('master', 'setting') || {}).aturanSection || null; return { ct: a && a['CABLE TRAY'], accs: a && a['ACCS TRAY'] }; });
    await bukaBaru(); const o2 = await opsi('ed-sb-0-0'); await tutupEditor(); await wait(300);
    ok('AR-05 aturan kustom tersimpan di master/setting.aturanSection dan langsung dipakai editor (Elbow kini tampil di Cable Tray)', sv.ct && sv.ct.includes('STRAIGHT') && sv.ct.includes('ELBOW') && Array.isArray(sv.accs) && o2.includes('Elbow 90') && o2.includes('Straight'), JSON.stringify({ sv: sv.ct, o2 }));
    await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="aturan"]'); await wait(500);
    await page.click('[data-act="aturanreset"]'); await wait(1200);
    await bukaBaru(); const o3 = await opsi('ed-sb-0-0'); await tutupEditor(); await wait(300);
    ok('AR-06 pulihkan standar: aturan kustom dihapus, Cable Tray kembali hanya Straight', o3.join() === 'Teks bebas,Straight' && (await page.evaluate(() => !((byId('master', 'setting') || {}).aturanSection))), o3.join());

    // AR-07..09 stok barang jadi di editor SPK
    await bukaBaru();
    await page.fill('#ed-cust', 'PT Aturan Uji'); await page.fill('#ed-po', 'PO-AT-1');
    await page.fill('#ed-dm-0-0-w', '100'); await page.fill('#ed-dm-0-0-h', '50'); await page.fill('#ed-dm-0-0-l', '3000'); await page.fill('#ed-q-0-0', '10'); await wait(500);
    const st1 = await teks('ed-ss-0-0');
    ok('AR-07 baris Cable Tray 100x50x3000 STU 1.2 ELG: editor menampilkan "Stok cocok" dengan stok tersedia 40 dan tombol Pakai stok (tanpa mengisi otomatis)', /Stok cocok/.test(st1) && /tersedia 40/.test(st1) && (await page.inputValue('#ed-fg-0-0')) === '', st1);
    await page.click('#ed-ss-0-0 [data-act="ed-stok-pakai"]'); await wait(500);
    const st2 = await page.evaluate(() => ({ fg: document.getElementById('ed-fg-0-0').value, am: document.getElementById('ed-am-0-0').value, hint: (document.getElementById('ed-sh-0-0') || {}).textContent }));
    ok('AR-08 Pakai stok: produk terpilih, jumlah dari stok = qty (10) karena stok cukup, petunjuk menyebut produksi 0', !!st2.fg && st2.am === '10' && /produksi 0/.test(st2.hint), JSON.stringify(st2));
    await page.fill('#ed-am-0-0', '4'); await wait(300);
    const st3 = await teks('ed-sh-0-0');
    ok('AR-09 pengguna menyesuaikan sebagian dari stok: 4 dari stok, 6 diproduksi', /tersedia 40/.test(st3) && /produksi 6/.test(st3), st3);
    await page.fill('#ed-dm-0-0-l', '2000'); await wait(300);
    // ubah ukuran setelah memilih stok tidak mengubah pilihan; baris baru dengan ukuran lain: tidak ada stok cocok
    await page.click('[data-act="ed-addline"][data-s="0"]'); await wait(300);
    await page.fill('#ed-dm-0-3-w', '200'); await page.fill('#ed-dm-0-3-h', '50'); await page.fill('#ed-dm-0-3-l', '3000'); await page.fill('#ed-q-0-3', '5'); await wait(500);
    const st4 = await page.evaluate(() => { const e = document.getElementById('ed-ss-0-3'); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; });
    ok('AR-10 ukuran tanpa stok cocok: keterangan "Tidak ada stok cocok · produksi semua"', /Tidak ada stok cocok/.test(st4), st4);
    await page.fill('#ed-dm-0-0-l', '3000'); await wait(300);
    await page.fill('#ed-dm-0-3-w', ''); await page.fill('#ed-dm-0-3-h', ''); await page.fill('#ed-dm-0-3-l', ''); await page.fill('#ed-q-0-3', ''); await wait(300);
    await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
    await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(500);
    const sp = await page.evaluate(() => { const s = S.spk.find((x) => x.customer === 'PT Aturan Uji'); const it = s && (s.items || [])[0]; return it ? { fg: !!it.fg, ambil: it.ambil, q: it.q, sb: it.sb } : null; });
    ok('AR-11 SPK terbit membawa pilihan stok (fg dan ambil 4 dari 10) dan bentuk Straight', !!sp && sp.fg && +sp.ambil === 4 && +sp.q === 10 && /^STRAIGHT/.test(sp.sb), JSON.stringify(sp));

    // AR-12 SPK lama: bentuk di luar aturan tetap terbuka dan terhitung
    const lama = await page.evaluate(async () => {
      const s = S.spk.find((x) => x.customer === 'PT Aturan Uji'); const items = JSON.parse(JSON.stringify(s.items));
      items[0].sb = 'ELBOW_STU_R_D'; items[0].dim = { w: 100, h: 50, r: 300 }; items[0].d = 'Cable Tray Elbow 90 W100xH50xR300';
      await updDoc('spk', s._id, { items }); return s._id;
    });
    await wait(600);
    await page.evaluate((id) => { const b = document.createElement('div'); b.dataset.act = 'spkedit'; b.dataset.id = id; document.body.appendChild(b); b.click(); }, lama); await page.waitForSelector('#ed-secs', { timeout: 8000 }).catch(() => {}); await wait(700);
    const lr = await page.evaluate(() => ({ sb: (document.getElementById('ed-sb-0-0') || {}).value, warn: (document.getElementById('ed-lr-0-0') || {}).textContent || '', w: (document.getElementById('ed-w-0-0') || {}).value }));
    await page.evaluate(() => document.querySelector('#editor [data-act="ed-save"]')?.click()); await wait(1500);
    const sv12 = await page.evaluate((id) => { const s = S.spk.find((x) => x._id === id); return { sb: (s.items[0] || {}).sb, ed: !document.getElementById('editor').hidden }; }, lama);
    await tutupEditor(); await wait(300);
    ok('AR-12 SPK lama dengan Elbow di section Cable Tray tetap terbuka: bentuk dipertahankan, diberi tanda di luar aturan dan saran section ACCS TRAY', /^ELBOW/.test(lr.sb) && /di luar aturan/.test(lr.warn) && /ACCS TRAY/.test(lr.warn) && lr.w !== '' && /^ELBOW/.test(sv12.sb || ''), JSON.stringify({ lr, sv12 }));

    // AR-13 Section COVER dari section Ladder/Duct
    await bukaBaru(); await page.selectOption('#ed-hp-0', 'CABLE LADDER'); await wait(400);
    await page.click('[data-act="ed-addcov"]'); await wait(400);
    const cv2 = await page.evaluate(() => ({ h: document.getElementById('ed-h-1').value, p: document.getElementById('ed-hp-1').value }));
    ok('AR-13 Section COVER dari section Cable Ladder menghasilkan COVER TRAY (bukan menyalin judul ladder)', /^COVER TRAY/.test(cv2.h) && cv2.p === 'COVER TRAY', JSON.stringify(cv2));
    await tutupEditor(); await wait(300);

    // AR-14 produk yang semua centangnya dicabut tidak disimpan kosong (kembali ke standar)
    await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="aturan"]'); await wait(500);
    await page.evaluate(() => { document.querySelectorAll('input[data-ar^="ACCS DUCT|"]').forEach((c) => { if (c.checked) c.click(); }); });
    await page.click('[data-act="aturansimpan"]'); await wait(1200);
    const kosong = await page.evaluate(() => { const a = (byId('master', 'setting') || {}).aturanSection || {}; return { duct: a['ACCS DUCT'], tray: Array.isArray(a['ACCS TRAY']) }; });
    ok('AR-14 produk yang semua centangnya dicabut tidak disimpan kosong (kembali ke standar)', kosong.duct === undefined && kosong.tray === true, JSON.stringify(kosong));
    await page.click('[data-act="aturanreset"]'); await wait(1000);

    // AR-15 dan AR-16 beberapa produk cocok: yang stoknya terbanyak dipakai; stok habis tanpa tombol
    await page.evaluate(async () => {
      const mk = (ukuran, stok) => addDoc('fg', { kategori: 'Cable Tray', type: 'STU', ukuran, panjang: 3000, finishing: 'ELG', tebal: '1.2', satuan: 'Btg', stokAwal: stok, tglStokAwal: today(), ket: '' });
      await mk('200x50', 0); await mk('200x50', 50); await mk('300x50', 0);
    });
    await wait(800);
    await bukaBaru();
    await page.fill('#ed-dm-0-0-w', '200'); await page.fill('#ed-dm-0-0-h', '50'); await page.fill('#ed-dm-0-0-l', '3000'); await page.fill('#ed-q-0-0', '5'); await wait(500);
    const s15 = await teks('ed-ss-0-0');
    await page.click('#ed-ss-0-0 [data-act="ed-stok-pakai"]'); await wait(500);
    const p15 = await page.evaluate(() => { const L = ED.sections[0].lines[0], r = byId('fg', L.fg); return { ambil: L.ambil, stok: r && r.stokAwal }; });
    ok('AR-15 dua produk cocok (stok 0 dan 50): status dan tombol memakai yang stoknya terbanyak, Pakai stok mengisi 5', /tersedia 50/.test(s15) && +p15.ambil === 5 && +p15.stok === 50, JSON.stringify({ s15, p15 }));
    await page.fill('#ed-dm-0-1-w', '300'); await page.fill('#ed-dm-0-1-h', '50'); await page.fill('#ed-dm-0-1-l', '3000'); await page.fill('#ed-q-0-1', '5'); await wait(500);
    const h15 = await page.evaluate(() => { const e = document.getElementById('ed-ss-0-1'); return { t: e ? e.textContent.replace(/\s+/g, ' ').trim() : '', btn: !!(e && e.querySelector('button')) }; });
    ok('AR-16 produk cocok tetapi stok habis: keterangan menyebut habis, tanpa tombol Pakai stok', /habis/.test(h15.t) && !h15.btn, JSON.stringify(h15));
    await tutupEditor(); await wait(300);

    // AR-17 ganti produk section Straight -> Cover Straight setelah memilih stok: tautan stok dilepas
    await bukaBaru();
    await page.fill('#ed-dm-0-0-w', '100'); await page.fill('#ed-dm-0-0-h', '50'); await page.fill('#ed-dm-0-0-l', '3000'); await page.fill('#ed-q-0-0', '10'); await wait(500);
    await page.click('#ed-ss-0-0 [data-act="ed-stok-pakai"]'); await wait(500);
    await page.selectOption('#ed-hp-0', 'COVER TRAY'); await wait(600);
    const cvs = await page.evaluate(() => ({ fg: document.getElementById('ed-fg-0-0').value, nm: (document.getElementById('ed-nm-0-0') || {}).textContent }));
    ok('AR-17 produk section diganti ke Cover Tray setelah memilih stok: tautan stok Straight dilepas', cvs.fg === '' && /Cover/.test(cvs.nm || ''), JSON.stringify(cvs));
    await tutupEditor(); await wait(300);
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('AR-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
