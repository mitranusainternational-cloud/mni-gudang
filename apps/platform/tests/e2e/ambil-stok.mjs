// Uji SPK customer memakai stok Gudang Barang Jadi sebagian (T-216, mock): cadangan stok, target produksi hanya sisanya,
// keluar stok otomatis saat surat jalan customer dibuat, pembalikan saat dibatalkan, tanpa hitung ganda.
export async function runAmbilStok(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 400) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('[data-act="sheet-close"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); }); await page.evaluate((h) => { location.hash = h; }, h); await wait(800); };
    const act = (name, data = {}) => page.evaluate(([n, d]) => { const b = document.createElement('div'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString();
      s.tables.mwc = [['WC-1', 'Shearing', 1, 100], ['WC-2', 'Punching', 2, 50], ['WC-3', 'Bending', 3, 40]].map(([kode, nama, urutan, kap]) => ({ id: crypto.randomUUID(), kode, nama, tipe: 'Internal', urutan, aktif: true, created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', kapasitas: kap, data: { mesin: [] } }));
      ['spk', 'produksi_log', 'vendor', 'kirim', 'bongkar', 'mutasi'].forEach((t) => { s.tables[t] = []; });
      s.tables.fg = [{ id: crypto.randomUUID(), created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', kategori: 'Cable Tray', type: 'STU', ukuran: '400x100', panjang: 3000, finishing: 'NON', tebal: 1.2, satuan: 'Btg', stok_awal: 30, tgl_stok_awal: now.slice(0, 10), aktif: true, data: {} }];
      localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
    });
    await page.reload(); await wait(3500);
    const DESC = 'Cable Tray STU W400xH100xL3000';
    const fgId = await page.evaluate(() => S.fg[0]._id);

    // membuat SPK customer lewat editor, dengan bagian dari stok
    const buatSpk = async (cust, q, ambil) => {
      await go('#spk'); await page.click('#tools [data-act="newspk"]'); await wait(700);
      const due = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
      await page.fill('#ed-cust', cust); await page.fill('#ed-po', 'PO-' + cust.slice(-3)); await page.fill('#ed-due', due);
      await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 NON FINISHING'); await page.dispatchEvent('#ed-h-0', 'change'); await wait(300);
      await page.fill('#ed-d-0-0', DESC); await page.fill('#ed-q-0-0', String(q)); await page.fill('#ed-u-0-0', 'Btg'); await page.fill('#ed-w-0-0', '5');
      if (ambil != null) { await page.selectOption('#ed-fg-0-0', fgId); await wait(500); await page.fill('#ed-am-0-0', String(ambil)); await wait(200); }
      await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
      const err = await page.evaluate(() => (document.getElementById('ed-err') || { textContent: '' }).textContent);
      const buka = await page.evaluate(() => !!document.getElementById('ed-secs'));
      if (buka) await page.evaluate(() => document.querySelector('#editor [data-ed-close], #editor [data-act="ed-close"]')?.click());
      await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(500);
      return { err, buka, id: await page.evaluate((c) => (S.spk.find((s) => s.customer === c) || {})._id, cust) };
    };
    const info = () => page.evaluate((fg) => ({ stok: calc().stock.fg[fg], res: fgResMap()[fg] || 0, tersedia: fgTersedia(fg) }), fgId);

    // AM-01 SPK A: 20 btg, 12 dari stok
    const A = await buatSpk('Cust Ambil A', 20, 12);
    const a1 = await page.evaluate(([id]) => { const s = byId('spk', id); const it = s.items[0]; return { fg: !!it.fg, ambil: it.ambil, st: s.status }; }, [A.id]);
    const i1 = await info();
    ok('AM-01 SPK customer terbit dengan item "12 dari stok" dan stok tersedia turun 30 -> 18 (stok fisik tetap 30)', a1.fg && a1.ambil === 12 && a1.st === 'Terbit' && i1.stok === 30 && i1.res === 12 && i1.tersedia === 18, JSON.stringify({ a1, i1, err: A.err }));

    // AM-02 jumlah dari stok melebihi qty ditolak; melebihi stok tersedia ditolak
    const B1 = await buatSpk('Cust Ambil B', 10, 15);
    ok('AM-02a dari stok 15 untuk qty order 10 ditolak dengan pesan jelas', B1.buka && /melebihi qty order/.test(B1.err), B1.err);
    await page.fill('#ed-q-0-0', '30'); await page.fill('#ed-am-0-0', '25'); await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1200);
    const e2 = await page.evaluate(() => document.getElementById('ed-err').textContent);
    ok('AM-02b ambil 25 padahal tersedia 18 ditolak (stok sudah dicadangkan SPK A)', /Stok tersedia/.test(e2) && /18/.test(e2), e2);
    await page.fill('#ed-am-0-0', '18'); await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
    await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(400);
    const i2 = await info();
    ok('AM-02c ambil 18 (pas dengan tersedia) berhasil; stok tersedia menjadi 0', i2.res === 30 && i2.tersedia === 0, JSON.stringify(i2));
    const B = await page.evaluate(() => S.spk.find((s) => s.customer === 'Cust Ambil B')._id);

    // AM-03 target produksi hanya sisanya; progres menghitung bagian stok
    const p0 = await page.evaluate((id) => { const s = byId('spk', id); const st = itemState(s, s.items[0], 0); const x = calc().spk[id]; return { qtyProduksi: st.qty, prodEff: x.lines[0].prodEff, pP: x.pP, siapKirim: sisaLine(x.lines[0], 'kirim') }; }, A.id);
    ok('AM-03a SPK A: target produksi 8 (bukan 20), progres awal 60% dari bagian stok, siap kirim 12', p0.qtyProduksi === 8 && p0.prodEff === 12 && Math.abs(p0.pP - 0.6) < 1e-9 && p0.siapKirim === 12, JSON.stringify(p0));
    for (const w of ['Shearing', 'Punching', 'Bending']) await page.evaluate(async ([id, w]) => { const c = mesinCtx(id + '|0'); await mesinHasil(c, { wc: w, mesin: w }, { qty: 8, reject: 0, mulai: null, selesai: new Date().toISOString(), operator: 'Uji' }); }, [A.id, w]);
    await wait(600);
    const p1 = await page.evaluate((id) => { const x = calc().spk[id]; return { prodEff: x.lines[0].prodEff, pP: x.pP, siap: sisaLine(x.lines[0], 'kirim'), st: x.st }; }, A.id);
    ok('AM-03b setelah 8 btg selesai diproduksi: progres 100% (12 stok + 8 produksi), siap kirim 20, belum Selesai karena belum terkirim', p1.prodEff === 20 && p1.pP === 1 && p1.siap === 20 && p1.st !== 'Selesai', JSON.stringify(p1));

    // AM-04 surat jalan pertama 12 btg: stok fisik keluar 12 otomatis
    await go('#pengiriman'); await act('newkirim', { spk: A.id }); await page.waitForSelector('#mform'); await wait(500);
    await page.fill('[name="ln_0"]', '12'); await page.evaluate(() => { const s = document.querySelector('#mform [name="status"]'); if (s) s.value = 'Disiapkan'; });
    await page.evaluate(() => document.getElementById('msub').click()); await wait(1800);
    const k1 = await page.evaluate(([id, fg]) => { const m = S.mutasi.filter((x) => x.gudang === 'fg' && x.spk === id); return { n: m.length, delta: m.reduce((a, b) => a + (+b.delta || 0), 0), jenis: m.map((x) => x.jenis).join(','), noDok: m[0] && m[0].noDok, sj: S.kirim.filter((k) => k.spk === id).length, stok: calc().stock.fg[fg] }; }, [A.id, fgId]);
    const i4 = await info();
    ok('AM-04 surat jalan 12 btg membuat 1 mutasi keluar -12 bertanda SPK dan no SJ; stok fisik 18; cadangan A habis', k1.n === 1 && k1.delta === -12 && k1.jenis === 'keluar' && !!k1.noDok && k1.sj === 1 && k1.stok === 18 && i4.res === 18, JSON.stringify({ k1, i4 }));

    // AM-05 surat jalan kedua 8 btg (hasil produksi): tidak keluar stok lagi (tanpa hitung ganda)
    await go('#pengiriman'); await act('newkirim', { spk: A.id }); await page.waitForSelector('#mform'); await wait(500);
    await page.fill('[name="ln_0"]', '8'); await page.evaluate(() => document.getElementById('msub').click()); await wait(1800);
    const k2 = await page.evaluate(([id, fg]) => { const m = S.mutasi.filter((x) => x.gudang === 'fg' && x.spk === id && x.jenis === 'keluar'); const x = calc().spk[id]; return { n: m.length, delta: m.reduce((a, b) => a + (+b.delta || 0), 0), kir: x.kir, pK: x.pK, st: x.st, stok: calc().stock.fg[fg] }; }, [A.id, fgId]);
    ok('AM-05 surat jalan 8 btg dari produksi: tidak ada mutasi stok baru; terkirim 20/20 dan SPK Selesai; stok fisik tetap 18', k2.n === 1 && k2.delta === -12 && k2.kir === 20 && k2.pK === 1 && k2.st === 'Selesai' && k2.stok === 18, JSON.stringify(k2));

    // AM-06 batalkan surat jalan pertama: stok kembali, cadangan A pulih
    const sj1 = await page.evaluate((id) => S.kirim.filter((k) => k.spk === id).sort((a, b) => String(a.at).localeCompare(String(b.at)))[0]._id, A.id);
    await go('#pengiriman'); await act('void', { c: 'kirim', id: sj1 }); await page.waitForSelector('#mform'); await page.fill('#mform [name="alasan"]', 'uji batal'); await page.evaluate(() => document.getElementById('msub').click()); await wait(1800);
    const k3 = await page.evaluate(([id, fg]) => { const m = S.mutasi.filter((x) => x.gudang === 'fg' && x.spk === id); return { n: m.length, net: m.reduce((a, b) => a + (+b.delta || 0), 0), stok: calc().stock.fg[fg], dikoreksi: m.filter((x) => x.dikoreksi).length }; }, [A.id, fgId]);
    const i6 = await info();
    ok('AM-06 membatalkan surat jalan 12 btg membalik keluar stok: mutasi neto 0, stok fisik kembali 30, cadangan A 12 pulih (total cadangan 30)', k3.n === 2 && k3.net === 0 && k3.stok === 30 && k3.dikoreksi === 1 && i6.res === 30, JSON.stringify({ k3, i6 }));

    // AM-07 kartu stok barang jadi menampilkan cadangan
    await go('#barang-jadi'); await act('kartu', { g: 'fg', id: fgId }); await wait(800);
    const kartu = await page.evaluate(() => document.getElementById('drawer').innerText.replace(/\s+/g, ' '));
    ok('AM-07 kartu stok produk menampilkan "Dicadangkan SPK 30" dan "Tersedia 0"', /Dicadangkan SPK\s*30/i.test(kartu) && /Tersedia\s*0/i.test(kartu), kartu.slice(0, 200));

    // AM-08 editor SPK B: jumlah dari stok tidak boleh melebihi stok tersedia saat dinaikkan; mengurangi ambil yang belum keluar diizinkan
    await go('#spk'); await act('spkedit', { id: B }); await page.waitForSelector('#ed-secs'); await wait(700);
    const nilai = await page.evaluate(() => ({ fg: document.querySelector('#ed-fg-0-0').value, am: document.querySelector('#ed-am-0-0').value, hint: document.querySelector('#ed-sh-0-0').textContent }));
    ok('AM-08a editor SPK terbit menampilkan produk dan jumlah dari stok yang tersimpan beserta petunjuk', nilai.fg === fgId && nilai.am === '18' && /tersedia/.test(nilai.hint), JSON.stringify(nilai));
    await page.fill('#ed-am-0-0', '5'); await page.fill('#ed-rev', 'kurangi dari stok'); await page.click('#editor button:has-text("Simpan revisi")'); await wait(1500);
    const sesudah = await page.evaluate((id) => byId('spk', id).items[0].ambil, B);
    const i8 = await info();
    ok('AM-08b revisi menurunkan dari stok 18 -> 5: cadangan turun, stok tersedia naik', sesudah === 5 && i8.res === 17 && i8.tersedia === 13, JSON.stringify({ sesudah, i8 }));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('AM-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
