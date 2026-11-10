// Uji perbaikan logistik (T-221, mock): status surat jalan customer, pembatalan SJ, antrian Bongkar Muat yang tertaut,
// checklist Unloading dari penerimaan bahan baku, dan modul PR sparepart.
export async function runLogistikSj(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const jeda = () => page.waitForTimeout(900);
    const klik = async (act, id, to) => { await page.evaluate(([act, id, to]) => { const b = document.createElement('button'); b.dataset.act = act; b.dataset.id = id; if (to) b.dataset.to = to; document.body.appendChild(b); b.click(); b.remove(); }, [act, id, to]); await jeda(); };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);

    // data uji: dua SJ customer tanpa armada, satu SJ dengan armada, satu antrian Loading tertaut ke SJ tanpa noSJ
    const ids = await page.evaluate(async () => {
      const a = await addDoc('kirim', { spk: 'spk-uji-a', customer: 'PT Uji Logistik', tgl: today(), noSJ: 'SJ-UJI-1', kendaraan: '', nopol: '', driver: '', status: 'Disiapkan', tglTerima: '', items: [], ket: '', alamat: '', lebih: false });
      const b = await addDoc('kirim', { spk: 'spk-uji-b', customer: 'PT Uji Logistik', tgl: today(), noSJ: 'SJ-UJI-2', kendaraan: 'Truk', nopol: 'B 1 UJI', driver: '', status: 'Disiapkan', tglTerima: '', items: [], ket: '', alamat: '', lebih: false });
      const c = await addDoc('bongkar', { jenis: 'Loading', muatan: 'Barang Jadi', pihak: 'PT Uji Logistik', ref: 'uji', kendaraan: '', nopol: '', driver: '', tgl: today(), jamMasuk: '', jamMulai: '', jamSelesai: '', status: 'Antri', ket: '', link: { c: 'kirim' }, auto: true });
      await new Promise((r) => setTimeout(r, 900));
      const find = (tab, noSJ) => (S[tab].find((x) => x.noSJ === noSJ) || {})._id;
      return { a: (a && a._id) || find('kirim', 'SJ-UJI-1'), b: (b && b._id) || find('kirim', 'SJ-UJI-2'), c: (c && c._id) || (S.bongkar.find((x) => x.link && x.link.c === 'kirim' && !x.link.noSJ) || {})._id };
    });

    // LG-01 #20: berangkat tanpa no polisi ditolak; status tetap Disiapkan
    await klik('kstep', ids.a, 'Dalam Perjalanan');
    const st1 = await page.evaluate((id) => byId('kirim', id).status, ids.a);
    ok('LG-01 status berangkat tanpa no polisi ditolak; SJ tetap Disiapkan', st1 === 'Disiapkan', st1);

    // LG-02 dengan armada, status berangkat diterima
    await klik('kstep', ids.b, 'Dalam Perjalanan');
    const st2 = await page.evaluate((id) => byId('kirim', id).status, ids.b);
    ok('LG-02 SJ beratmada boleh berangkat', st2 === 'Dalam Perjalanan', st2);

    // LG-03 #15: SJ Dalam Perjalanan tidak bisa dibatalkan langsung
    await page.evaluate((id) => voidForm('kirim', id), ids.b); await wait(600);
    await page.evaluate(() => { const f = document.querySelector('#mform'); if (f && f.alasan) f.alasan.value = 'uji'; });
    await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); });
    await jeda();
    const st3 = await page.evaluate((id) => byId('kirim', id).status, ids.b);
    ok('LG-03 SJ Dalam Perjalanan tidak bisa dibatalkan langsung (status tetap)', st3 === 'Dalam Perjalanan', st3);
    await page.keyboard.press('Escape'); await wait(300);

    // LG-04 #12: membatalkan SJ tanpa noSJ tidak menyentuh antrian Bongkar Muat yang tidak tertaut ke SJ itu
    const pOpen = await page.evaluate(async (id) => { await updDoc('kirim', id, { noSJ: '' }); return true; }, ids.a);
    await jeda();
    await page.evaluate((id) => voidForm('kirim', id), ids.a); await wait(600);
    await page.evaluate(() => { const f = document.querySelector('#mform'); if (f && f.alasan) f.alasan.value = 'uji tanpa noSJ'; });
    await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); });
    await jeda();
    const bk4 = await page.evaluate((id) => (byId('bongkar', id) || {}).status, ids.c);
    ok('LG-04 SJ tanpa noSJ dibatalkan tanpa ikut membatalkan antrian Loading tak tertaut (status antrian tetap Antri)', bk4 === 'Antri', bk4);

    // LG-05 #8: checklist Unloading mengambil item dari dokumen penerimaan bahan baku
    const cek = await page.evaluate(async () => {
      const rm = await addDoc('rm', { item: 'Plat Checklist Uji', ukuran: '1.2 x 1219 x 2438', satuan: 'Lembar', buffer: 0, stokAwal: 0, tglStokAwal: today() });
      await new Promise((r) => setTimeout(r, 900));
      const rid = (rm && rm._id) || (S.rm.find((x) => x.item === 'Plat Checklist Uji') || {})._id;
      await addDoc('mutasi', { gudang: 'rm', item: rid, jenis: 'masuk', delta: 7, tgl: today(), noDok: 'RCV/UJI/LG05', ref: '', spk: '', pihak: 'Toko', ket: '' });
      await new Promise((r) => setTimeout(r, 900));
      const b = { link: { c: 'mutasi', noDok: 'RCV/UJI/LG05' } };
      return bmSrc(b).items.map((i) => i.q + ' ' + i.d).join(' | ');
    });
    ok('LG-05 checklist Unloading penerimaan bahan baku memuat item dan jumlahnya (tidak kosong)', /^7 Plat Checklist Uji/.test(cek), cek);

    // LG-06 #10: PR sparepart diperiksa dengan modul Sparepart, PR bahan baku tetap Bahan baku
    const mod = await page.evaluate(() => [modOf('pr', { gudang: 'sp' }, null), modOf('pr', { gudang: 'rm' }, null), modOf('mutasi', { gudang: 'sp' }, null)].join(','));
    ok('LG-06 modul PR sparepart = sparepart; PR bahan baku = bahan-baku; mutasi sparepart = sparepart', mod === 'sparepart,bahan-baku,sparepart', mod);
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('LG-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
