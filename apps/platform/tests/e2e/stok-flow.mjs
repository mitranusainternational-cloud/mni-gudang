// Uji alur SPK stok sampai masuk Gudang Barang Jadi (mock): tautan produk tidak hilang saat disimpan ulang, pemulihan tautan lama,
// penerimaan otomatis dari hasil produksi (termasuk yang kembali dari vendor), dan label khusus SPK stok.
export async function runStokFlow(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(12000);
  try {
    const wait = (ms = 400) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('[data-act="sheet-close"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); }); await page.evaluate((h) => { location.hash = h; }, h); await wait(800); };
    const act = (name, data = {}) => page.evaluate(([n, d]) => { const b = document.createElement('button'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);

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
      s.tables.fg = [{ id: crypto.randomUUID(), created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', kategori: 'Cable Tray', type: 'STU', ukuran: '400x100', panjang: 3000, finishing: 'HDG', tebal: 1.8, satuan: 'Btg', stok_awal: 0, tgl_stok_awal: now.slice(0, 10), aktif: true, data: {} }];
      localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
    });
    await page.reload(); await wait(3500);

    // SPK stok dibuat dari produk gudang, diterbitkan, diproduksi penuh, kembali dari vendor HDG
    await page.evaluate(async () => { const fg = S.fg[0]; await spkStokBuat([{ item: fg._id, q: 20 }], {}); });
    await wait(1500);
    const id = await page.evaluate(async () => { const s = S.spk.find((x) => x.stokReq); await publishDraft(s._id); return s._id; });
    await wait(900);
    const awal = await page.evaluate((id) => { const s = byId('spk', id); return { fg: s.items[0].fg, rute: (s.items[0].rute || []).join('>'), d: s.items[0].d, status: s.status }; }, id);
    ok('SF-01 SPK stok terbit membawa tautan produk (fg) dan snapshot rute dengan langkah vendor HDG', !!awal.fg && awal.rute === 'Shearing>Punching>Bending>Vendor HDG' && awal.status === 'Terbit', JSON.stringify(awal));
    for (const w of ['Shearing', 'Punching', 'Bending']) await page.evaluate(async ([id, w]) => { const c = mesinCtx(id + '|0'); await mesinHasil(c, { wc: w, mesin: w }, { qty: 20, reject: 0, mulai: null, selesai: new Date().toISOString(), operator: 'Uji' }); }, [id, w]);
    await page.evaluate(async (id) => { const s = byId('spk', id); await addDoc('vendor', { spk: id, tgl: today(), vendor: 'Vendor Uji', proses: 'HDG', noSJ: 'SJV-SF-1', status: 'Selesai', items: [{ d: s.items[0].d, q: 20, kembali: 20, reject: 0 }] }); }, id);
    await wait(700);

    // menyimpan ulang di editor tidak boleh menghilangkan tautan produk
    await go('#spk'); await act('spkedit', { id }); await page.waitForSelector('#ed-secs'); await wait(600);
    await page.fill('#ed-rev', 'uji simpan ulang'); await page.click('#editor button:has-text("Simpan revisi")'); await wait(1500);
    const sesudahEdit = await page.evaluate((id) => ({ fg: byId('spk', id).items[0].fg, stokReq: byId('spk', id).stokReq }), id);
    ok('SF-02 menyimpan ulang SPK stok di editor mempertahankan tautan produk (fg) dan penanda stok (sebelumnya hilang sehingga barang tidak bisa diterima)', sesudahEdit.fg === awal.fg && sesudahEdit.stokReq === true, JSON.stringify(sesudahEdit));

    // SPK lama yang tautannya sudah terlanjur hilang tetap bisa diterima
    await page.evaluate(async (id) => { const s = byId('spk', id); await updDoc('spk', id, { items: s.items.map((i) => { const { fg: _f, ...sisa } = i; return sisa; }) }); }, id);
    await wait(700);
    const pulih = await page.evaluate((id) => ({ baris: fgBarisTerima(byId('spk', id)), kir: calc().spk[id].kir }), id);
    ok('SF-03 tautan produk yang hilang dipulihkan lewat kecocokan nama item: 20 siap diterima', pulih.baris.length === 1 && pulih.baris[0].sisa === 20, JSON.stringify(pulih));

    // form Barang masuk: pilih SPK stok, baris dan jumlah terisi otomatis
    await go('#barang-jadi'); await act('mv', { g: 'fg', j: 'masuk' }); await page.waitForSelector('#mform'); await wait(500);
    await page.selectOption('#m-spk', id); await wait(700);
    const otomatis = await page.evaluate(() => ({ baris: document.querySelectorAll('#m-mvl tr').length, produk: document.querySelector('#m-mvl select').value, qty: document.querySelector('#m-mvl input').value, pihak: document.querySelector('#mform [name="pihak"]').value }));
    ok('SF-04 memilih SPK stok di Barang masuk mengisi produk dan jumlah otomatis (20) dan asal "Produksi / finishing · SPK n"', otomatis.baris === 1 && otomatis.produk === awal.fg && otomatis.qty === '20' && /SPK/.test(otomatis.pihak), JSON.stringify(otomatis));
    await page.evaluate(() => document.getElementById('msub').click()); await wait(1500);
    const masuk = await page.evaluate((id) => { const m = S.mutasi.filter((x) => x.gudang === 'fg' && x.spk === id); const x = calc().spk[id]; return { n: m.length, delta: m.reduce((a, b) => a + (+b.delta || 0), 0), kir: x.kir, pK: x.pK, st: x.st, fgTerpulih: byId('spk', id).items[0].fg || null }; }, id);
    ok('SF-05 penerimaan tersimpan: 20 masuk gudang, SPK stok 100% masuk dan Selesai', masuk.n === 1 && masuk.delta === 20 && masuk.kir === 20 && masuk.pK === 1 && masuk.st === 'Selesai', JSON.stringify(masuk));
    ok('SF-06 setelah semua diterima, tombol terima memberi alasan jelas (sudah diterima semua), bukan "belum ada hasil produksi"', await page.evaluate((id) => /sudah diterima/.test(fgAlasanKosong(byId('spk', id))), id));

    // label khusus stok
    await go('#spk'); await act('openspk', { id }); await wait(900);
    await page.evaluate(() => [...document.querySelectorAll('#drawer .tabs button, #drawer [role="tab"], #drawer button')].find((b) => /Jejak produksi/.test(b.textContent))?.click());
    await wait(600);
    const jejak = await page.evaluate(() => (document.getElementById('drawer') || document.body).innerText.replace(/\s+/g, ' '));
    ok('SF-07 jejak produksi SPK stok berakhir di "Masuk gudang barang jadi" (diterima di gudang barang jadi), bukan "Terkirim ke customer"', /Masuk gudang barang jadi/.test(jejak) && /diterima di gudang barang jadi/.test(jejak) && !/Terkirim ke customer/.test(jejak), jejak.slice(0, 300));
    await go('#spk'); await page.click('[data-view="spk"][data-key="tab"][data-val="berjalan"]'); await wait(600);
    await page.evaluate(() => { F.spk.fl = 'semua'; renderBody(); }); await wait(600);
    const berjalan = await page.evaluate(() => document.getElementById('body').innerText.replace(/\s+/g, ' '));
    ok('SF-08 tab Berjalan: kolom bernama "Kirim / masuk gudang" dan sel SPK stok memakai kata gudang barang jadi', /Kirim \/ masuk gudang/i.test(berjalan) && !/surat jalan customer/.test(berjalan.slice(berjalan.indexOf('SPK 1'))) || /gudang barang jadi/.test(berjalan), berjalan.slice(0, 260));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('SF-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
