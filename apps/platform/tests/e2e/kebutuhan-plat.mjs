// Uji keterhubungan kebutuhan plat SPK (T-221, mock): stok bahan baku, kebutuhan dari SPK (dikurangi stok barang jadi yang diambil),
// koreksi penerimaan tidak dihitung sebagai pemakaian SPK, dan penerimaan PR tidak melebihi sisa PR.
export async function runKebutuhanPlat(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const modalErr = () => page.evaluate(() => (document.querySelector('#modal')?.innerText || '').replace(/\s+/g, ' '));
    const submit = async () => { await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); }); await wait(900); };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);

    // KP-01 item bahan baku bersatuan 'Lembar' (satuan bawaan form Item baru) tetap punya berat per lembar
    const id = await page.evaluate(async () => {
      const r = await addDoc('rm', { item: 'Plat SPHC Uji', ukuran: '1.2 x 1219 x 2438', satuan: 'Lembar', buffer: 0, stokAwal: 50, tglStokAwal: today() });
      await new Promise((res) => setTimeout(res, 900));
      return (r && r._id) || (S.rm.find((x) => x.item === 'Plat SPHC Uji') || {})._id;
    });
    await wait(800);
    const k1 = await page.evaluate((id) => matRmSiap().find((x) => x.id === id), id);
    ok('KP-01 item satuan Lembar: kg per lembar > 0 dan stok masuk ke kebutuhan plat', !!k1 && k1.kgPerLbr > 0 && k1.stok === 50, JSON.stringify(k1));

    // KP-02 kebutuhan plat SPK mengurangi qty yang diambil dari stok barang jadi (pemetaan yang sama dengan reservasi)
    const k2 = await page.evaluate(() => matSpkItems({ _id: 'uji-kp2', stokReq: false, items: [{ d: 'CABLE TRAY TYPE STU 1.2 ELG', g: 'CABLE TRAY TYPE STU 1.2 ELG', q: 10, w: 5, fg: 'fg-uji', ambil: 4 }] })[0]);
    ok('KP-02 SPK dengan 4 dari 10 diambil stok: kebutuhan produksi 6, bukan 10', k2 && k2.q === 6, JSON.stringify(k2));
    const k2b = await page.evaluate(() => matSpkItems({ _id: 'uji-kp2b', stokReq: true, items: [{ d: 'CABLE TRAY TYPE STU 1.2 ELG', g: 'CABLE TRAY TYPE STU 1.2 ELG', q: 10, w: 5, fg: 'fg-uji', ambil: 4 }] })[0]);
    ok('KP-02b SPK stok (stokReq) tidak mengurangi kebutuhan: tetap 10', k2b && k2b.q === 10, JSON.stringify(k2b));

    // KP-03 koreksi penerimaan bertanda SPK tidak dihitung sebagai pemakaian SPK; koreksi pengeluaran tetap dihitung
    const k3 = await page.evaluate(async (id) => {
      const SPK = 'SPK-UJI-KP3';
      const jeda = () => new Promise((res) => setTimeout(res, 900));
      const mvA = await addDoc('mutasi', { gudang: 'rm', item: id, jenis: 'masuk', delta: 10, tgl: today(), spk: SPK, ket: 'uji masuk', noDok: '', ref: '', pihak: 'Uji' });
      await jeda();
      const mvId = (mvA && mvA._id) || (S.mutasi.find((m) => m.item === id && m.jenis === 'masuk' && m.spk === SPK) || {})._id;
      const kA = await addDoc('mutasi', { gudang: 'rm', item: id, jenis: 'koreksi', delta: -10, tgl: today(), spk: SPK, koreksiDari: mvId, ket: 'salah', noDok: '', ref: '', pihak: '' });
      await jeda();
      const sumA = Object.values(matKeluarKg(SPK, matRmSiap())).reduce((a, b) => a + b, 0);
      await addDoc('mutasi', { gudang: 'rm', item: id, jenis: 'keluar', delta: -2, tgl: today(), spk: SPK, ket: 'uji keluar', noDok: '', ref: '', pihak: 'Produksi' });
      await jeda();
      const sumB = Object.values(matKeluarKg(SPK, matRmSiap())).reduce((a, b) => a + b, 0);
      const kg = matRmSiap().find((x) => x.id === id).kgPerLbr;
      return { sumA, sumB, kg };
    }, id);
    ok('KP-03 koreksi penerimaan SPK tidak menambah pemakaian; pengeluaran 2 lembar menambah 2 x kg per lembar', k3.sumA === 0 && Math.abs(k3.sumB - 2 * k3.kg) < 0.01, JSON.stringify(k3));

    // KP-04 terima PR bahan baku tidak boleh melebihi sisa PR (dibaca ulang dari data terkini)
    const pr = await page.evaluate(async (id) => {
      const r = await addDoc('pr', { noPR: 'PR/2026/11/777', tgl: today(), butuh: today(), supplier: '', items: [{ item: id, q: 5, qTerima: 0 }], status: 'Diajukan', ket: '' });
      await new Promise((res) => setTimeout(res, 900));
      return (r && r._id) || (S.pr.find((p) => p.noPR === 'PR/2026/11/777') || {})._id;
    }, id);
    await wait(800);
    await page.evaluate((pr) => mvForm('rm', 'masuk', null, pr), pr); await wait(700);
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '9'; f.pihak.value = 'Toko Uji'; });
    await submit();
    const e4 = await modalErr();
    ok('KP-04 terima PR 9 lembar padahal sisa 5 ditolak dengan pesan sisa PR', /diterima 9 melebihi sisa PR\/2026\/11\/777 \(5\)/.test(e4), e4.slice(e4.indexOf('melebihi') - 60, e4.indexOf('melebihi') + 60));

    // KP-05 terima sesuai sisa: PR selesai, qTerima 5, kebutuhan PR tidak lagi menghitung kekurangan
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '5'; });
    await submit(); await submit(); await wait(700);
    const p5 = await page.evaluate((pr) => { const p = byId('pr', pr); return { st: p.status, q: p.items.map((i) => i.qTerima).join('+') }; }, pr);
    ok('KP-05 terima sesuai sisa (5): qTerima 5 dan status PR Selesai', p5.q === '5' && p5.st === 'Selesai', JSON.stringify(p5));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('KP-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
