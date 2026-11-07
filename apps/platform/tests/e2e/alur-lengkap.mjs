// Uji alur hulu ke hilir untuk empat jenis SPK (mock, UI sungguhan):
//   A  SPK customer galvanis: produksi, vendor finishing, kirim ke customer (dua surat jalan)
//   B  SPK stok galvanis: produksi, vendor finishing, terima di gudang barang jadi, keluar ke customer
//   C  SPK customer stainless (tanpa vendor): produksi, langsung kirim ke customer
//   D  SPK stok aluminium (tanpa vendor): produksi, langsung masuk gudang barang jadi
//   const { pass, fail, detail } = await runAlurLengkap(page, 'http://127.0.0.1:5173/');
export async function runAlurLengkap(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  const wait = (ms = 400) => page.waitForTimeout(ms);
  const rows = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t].map((r) => ({ ...(r.data || {}), ...r })), t);
  const bersihkan = () => page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); document.querySelector('#sheet [data-act="sheet-close"]')?.click(); });
  const go = async (h) => { await bersihkan(); await wait(250); await page.evaluate((h) => { location.hash = h; }, h); await wait(700); };
  const act = (name, data = {}) => page.evaluate(([n, d]) => { const b = document.createElement('button'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);
  const submit = async () => { await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => x.type === 'submit').pop().click()); await wait(1100); };
  const toast = () => page.evaluate(() => document.getElementById('toast').textContent);
  const tutupLembar = async () => { await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(300); };
  const idSpk = (cust) => page.evaluate((c) => (S.spk.find((s) => s.customer === c) || {})._id, cust);
  const kondisi = (id) => page.evaluate((id) => { const x = calc().spk[id]; const f = flow(id); return { st: x.st, q: x.q, prod: x.prod, kir: x.kir, vo: x.vo, vb: x.vb, stage: f && f.stage, status: byId('spk', id).status, line: x.lines.map((l) => ({ prodEff: l.prodEff, vOut: l.vOut, vBack: l.vBack, kirim: l.kirim })) }; }, id);
  const platId = () => page.evaluate(() => S.rm.find((r) => r.item === 'Plat Besi' && String(r.ukuran).startsWith('1.2'))._id);
  const stokRm = () => page.evaluate(() => calc().stock.rm[S.rm.find((r) => r.item === 'Plat Besi' && String(r.ukuran).startsWith('1.2'))._id]);

  // pembantu dipasang dulu; langkah uji dibungkus agar kegagalan di tengah alur tercatat bersama hasil sebelumnya
  try {
  // ---------- awal: login, work center, data bersih, produk jadi contoh ----------
  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await page.goto(base); await page.reload();
  await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
  await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
  await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
  await wait(900);
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString(); const hari = (n) => { const d = new Date(Date.now() + n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const dua = [{ nama: 'Punching 1 (20 Ton)', operator: ['Operator C'], kapasitas: 25 }, { nama: 'Punching 2 (40 Ton)', operator: ['Operator D'], kapasitas: 25 }];
    s.tables.mwc = [['WC-1', 'Shearing', 1, 100, []], ['WC-2', 'Punching', 2, 50, dua], ['WC-3', 'Bending', 3, 40, []], ['WC-4', 'CNC Laser', 4, 60, []], ['WC-5', 'Welding', 5, 30, []]]
      .map(([kode, nama, urutan, kap, mesin]) => ({ id: crypto.randomUUID(), kode, nama, tipe: 'Internal', urutan, aktif: true, created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', data: { kapasitas: kap, mesin } }));
    ['spk', 'produksi_log', 'vendor', 'kirim', 'bongkar', 'mutasi'].forEach((t) => { s.tables[t] = []; });
    const fg = (kategori, type, ukuran, panjang, finishing, tebal, stok) => ({ id: crypto.randomUUID(), created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', kategori, type, ukuran, panjang, finishing, tebal, satuan: 'Btg', stok_awal: stok, tgl_stok_awal: hari(-30), aktif: true, data: {} });
    s.tables.fg = [fg('Cable Tray', 'STU', '100x50', 3000, 'ELG', 1.2, 10), fg('Cable Tray', 'STU', '100x50', 3000, 'Aluminium 1100', 2, 0)];
    localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
  });
  await page.reload(); await wait(3500);

  // ---------- pembantu alur ----------
  const buatSpk = async ({ cust, po, judul, desc, qty, berat }) => {
    await go('#spk');
    await page.click('#tools [data-act="newspk"]'); await wait(700);
    const due = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
    await page.fill('#ed-cust', cust); await page.fill('#ed-po', po); await page.fill('#ed-due', due);
    await page.fill('#ed-h-0', judul); await page.dispatchEvent('#ed-h-0', 'change'); await wait(300);
    await page.fill('#ed-d-0-0', desc); await page.fill('#ed-q-0-0', String(qty)); await page.fill('#ed-u-0-0', 'Btg'); await page.fill('#ed-w-0-0', String(berat));
    await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
    await tutupLembar();
    return idSpk(cust);
  };
  const kerjakan = async (wc) => {
    await go('#mesin'); await page.selectOption('#f-mesin', wc); await wait(600);
    await page.click('#mesin-antri .mcard:first-child [data-act="mesinmulai"]'); await wait(1100);
    await page.click('.mesin-run [data-act="mesinsemua"]'); await wait(300);
    await page.click('.mesin-run [data-act="mesinselesai"]'); await wait(1400);
  };
  const produksiPenuh = async (langkah) => { for (const w of langkah) await kerjakan(w); };
  const kirimVendor = async (cust, nama, proses) => {
    await go('#vendor');
    await page.click('#tools [data-act="newvendor"]'); await wait(500);
    await page.fill('#m-vendor', nama); await page.fill('#m-proses', proses);
    const opsi = await page.evaluate((c) => [...document.querySelectorAll('#m-spk option')].map((o) => [o.value, o.textContent]).find(([, tx]) => tx.includes(c)), cust);
    if (!opsi) { const diag = await page.evaluate((c) => { const s = S.spk.find((x) => x.customer === c); const x = s && calc().spk[s._id]; return { opsi: [...document.querySelectorAll('#m-spk option')].map((o) => o.textContent.slice(0, 40)), st: x && x.st, status: s && s.status, stage: s && flow(s._id).stage, prod: x && x.prod, q: x && x.q }; }, cust); ok('X-vendor SPK ' + cust + ' tersedia di pilihan Kirim ke Vendor', false, JSON.stringify(diag)); await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await wait(300); return false; }
    await page.selectOption('#m-spk', opsi[0]); await wait(500);
    await page.evaluate(() => document.getElementById('msub').click()); await wait(800);
    await page.evaluate(() => document.getElementById('msub')?.click()); await wait(1500);
  };
  const terimaVendor = async () => {
    await go('#vendor');
    await page.evaluate(() => document.querySelector('#body tr.click')?.click()); await wait(700);
    await page.evaluate(() => [...document.querySelectorAll('[data-act="terima"]')].pop()?.click()); await wait(700);
    await page.evaluate(() => document.getElementById('msub')?.click()); await wait(1300);
    await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await tutupLembar();
  };
  const suratJalan = async (id, qty) => {
    await go('#pengiriman');
    await page.click('#tools [data-act="newkirim"]'); await wait(500);
    if (!(await page.evaluate((id) => !!document.querySelector('#m-spk option[value="' + id + '"]'), id))) return 'TIDAK ADA DI PILIHAN SURAT JALAN';
    await page.selectOption('#m-spk', id); await wait(500);
    if (qty != null) await page.fill('#m-ln_0', String(qty));
    try { await page.click('#modal button:has-text("Buat surat jalan")', { timeout: 6000 }); } catch (e) { return 'FORM: ' + (await page.evaluate(() => (document.getElementById('modal') || { innerText: '' }).innerText.replace(/s+/g, ' ').slice(0, 400))); }
    await wait(1100);
    const galat = await page.evaluate(() => (document.getElementById('merr') || { textContent: '' }).textContent);
    return galat || (await toast());
  };
  const selesaikanKirim = async () => {
    await go('#pengiriman');
    for (const to of ['Dalam Perjalanan', 'Diterima']) {
      const b = page.locator(`#body [data-act="kstep"][data-to="${to}"]`);
      for (let i = await b.count(); i > 0; i--) { await b.first().click(); await wait(800); }
    }
  };

  // =====================================================================================
  // A. SPK customer galvanis: produksi, vendor, customer
  // =====================================================================================
  const idA = await buatSpk({ cust: 'PT Alur A Galvanis', po: 'PO-A-01', judul: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', desc: 'Cable Tray W100xH50xL3000', qty: 20, berat: 6.5 });
  const ruteA = await page.evaluate((id) => itemRute(byId('spk', id).items[0]), idA);
  ok('A-01 SPK customer galvanis terbit; rute internal diikuti langkah Vendor ELG', !!idA && (await kondisi(idA)).status === 'Terbit' && ruteA.join('>') === 'Shearing>Punching>Bending>Vendor ELG', ruteA.join('>'));
  const rmAwal = await stokRm();
  await go('#bahan-baku');
  const rmId = await platId();
  await act('mv', { g: 'rm', j: 'keluar', item: rmId }); await wait(700);
  await page.evaluate(([id]) => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '6'; f.spk.value = id; f.spk.dispatchEvent(new Event('change', { bubbles: true })); f.pihak.value = 'Shearing'; }, [idA]);
  await submit();
  const rmSetelah = await stokRm();
  const mutA = (await rows('mutasi')).find((m) => m.gudang === 'rm' && m.jenis === 'keluar' && m.spk === idA);
  ok('A-02 pakai bahan baku untuk SPK mengurangi stok plat dan tercatat tertaut SPK (nomor dokumen PK)', rmAwal - rmSetelah === 6 && !!mutA && /^PK/.test(mutA.noDok || mutA.no_dok || ''), JSON.stringify({ rmAwal, rmSetelah, dok: mutA && (mutA.noDok || mutA.no_dok) }));
  const tolakDini = await suratJalan(idA, null).catch(() => '');
  const sjDini = (await rows('kirim')).length;
  await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await wait(300);
  ok('A-03 surat jalan customer ditolak sebelum ada hasil produksi', sjDini === 0, JSON.stringify({ sjDini, tolakDini: String(tolakDini).slice(0, 80) }));
  await produksiPenuh(['Shearing', 'Punching', 'Bending']);
  const kA1 = await kondisi(idA);
  ok('A-04 tiga langkah mesin selesai: produksi 20 dari 20, tahap berikutnya vendor', kA1.prod === 20 && /vendor|Siap/i.test(String(kA1.stage)), JSON.stringify({ prod: kA1.prod, stage: kA1.stage }));
  const sjSebelumVendor = await suratJalan(idA, null);
  const sjCount1 = (await rows('kirim')).length;
  await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await wait(300);
  ok('A-05 rute memuat langkah vendor: barang belum kembali dari vendor tidak boleh dikirim ke customer', sjCount1 === 0, JSON.stringify({ sjCount1, pesan: String(sjSebelumVendor).slice(0, 100) }));
  await kirimVendor('PT Alur A Galvanis', 'Vendor ELG Alur', 'ELG');
  const kA2 = await kondisi(idA);
  ok('A-06 kirim ke vendor tercatat 20; SPK di vendor', kA2.vo === 20 && kA2.vb === 0, JSON.stringify({ vo: kA2.vo, vb: kA2.vb, stage: kA2.stage }));
  await terimaVendor();
  const kA3 = await kondisi(idA);
  ok('A-07 terima kembali dari vendor: kembali 20, siap dikirim ke customer', kA3.vb === 20, JSON.stringify({ vb: kA3.vb, stage: kA3.stage }));
  const pesanSJ1 = await suratJalan(idA, 12);
  const kA4 = await kondisi(idA);
  ok('A-08 surat jalan pertama 12 btg (partial): terkirim 12 dari 20, SPK belum selesai', kA4.kir === 12 && kA4.st !== 'Selesai', JSON.stringify({ kir: kA4.kir, st: kA4.st, pesan: String(pesanSJ1).slice(0, 60) }));
  await suratJalan(idA, 8);
  const kA5 = await kondisi(idA);
  ok('A-09 surat jalan kedua 8 btg: terkirim 20 dari 20', kA5.kir === 20, JSON.stringify({ kir: kA5.kir }));
  const pesanLebih = await suratJalan(idA, 1);
  const sjTotal = (await rows('kirim')).filter((k) => k.spk === idA && k.status !== 'Batal').length;
  await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await wait(300);
  ok('A-10 surat jalan ketiga ditolak (semua sudah terkirim); tetap dua surat jalan', sjTotal === 2, JSON.stringify({ sjTotal, pesan: String(pesanLebih).slice(0, 80) }));
  await selesaikanKirim();
  const kA6 = await kondisi(idA);
  ok('A-11 kedua surat jalan Diterima: SPK Selesai', kA6.st === 'Selesai', JSON.stringify({ st: kA6.st, stage: kA6.stage }));

  // =====================================================================================
  // B. SPK stok galvanis: produksi, vendor, gudang barang jadi, keluar ke customer
  // =====================================================================================
  await go('#barang-jadi');
  const fgElg = await page.evaluate(() => S.fg.find((r) => r.finishing === 'ELG')._id);
  const fgAwal = await page.evaluate((id) => calc().stock.fg[id], fgElg);
  await page.evaluate((id) => document.querySelector(`input[data-act="fgpick"][data-id="${id}"]`)?.click(), fgElg); await wait(300);
  await page.waitForSelector('#fgpick-bar:not([hidden])', { timeout: 8000 });
  await page.evaluate(() => document.querySelector('#fgpick-bar [data-act="fgspkpick"]').click()); await page.waitForSelector('#mform [name^="qty_"]', { timeout: 8000 }); await wait(300);
  await page.evaluate(() => { document.querySelector('#mform [name^="qty_"]').value = '15'; });
  await submit(); await wait(1500);
  await tutupLembar();
  const idB = await idSpk('STOK MNI');
  if (!idB) throw new Error('SPK stok B tidak terbentuk: ' + (await page.evaluate(() => JSON.stringify({ merr: (document.getElementById('merr') || {}).textContent, toast: document.getElementById('toast').textContent, modal: (document.getElementById('modal') || { innerText: '' }).innerText.replace(/s+/g, ' ').slice(0, 200), pick: Object.keys((F['barang-jadi'] || {}).pick || {}).length }))));
  const spkB0 = await page.evaluate((id) => { const s = byId('spk', id); return { st: s.status, stokReq: s.stokReq, g: s.items[0].g, d: s.items[0].d, w: s.items[0].w, rute: itemRute(s.items[0]) }; }, idB);
  ok('B-01 SPK stok dibuat dari produk gudang (Draft, customer STOK MNI, judul dan deskripsi mengikuti produk); rute memuat Vendor ELG', spkB0.st === 'Draft' && spkB0.stokReq === true && /^CABLE TRAY TYPE STU 1.2 ELECTRO/.test(spkB0.g) && spkB0.rute.join('>') === 'Shearing>Punching>Bending>Vendor ELG', JSON.stringify(spkB0));
  ok('B-02 SPK stok membawa berat per pcs dari kalkulator bila katalog tersedia (tanpa katalog: 0 dan terbaca "tanpa berat")', typeof spkB0.w === 'number', String(spkB0.w));
  await act('spkpub', { id: idB }); await wait(1300);
  ok('B-03 SPK stok diterbitkan PPIC: status Terbit', (await kondisi(idB)).status === 'Terbit');
  await produksiPenuh(['Shearing', 'Punching', 'Bending']);
  await act('fgterima', { spk: idB }); await wait(800);
  const batasDini = await toast();
  const modalTerbuka = await page.evaluate(() => !!document.querySelector('#modal #mform'));
  await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await wait(300);
  const kB1 = await kondisi(idB);
  ok('B-04 produksi 15 selesai tetapi belum dari vendor: terima di gudang tidak membuka isian siap (batas hasil kembali dari vendor)', kB1.prod === 15 && !modalTerbuka && /Belum ada hasil produksi yang siap diterima/.test(batasDini) && /Siap ke vendor/.test(String(kB1.stage)), JSON.stringify({ prod: kB1.prod, stage: kB1.stage, modalTerbuka, batasDini: batasDini.slice(0, 120) }));
  await kirimVendor('STOK MNI', 'Vendor ELG Stok', 'ELG');
  await terimaVendor();
  const kB2 = await kondisi(idB);
  ok('B-05 vendor menerima dan mengembalikan 15 barang SPK stok', kB2.vo === 15 && kB2.vb === 15, JSON.stringify({ vo: kB2.vo, vb: kB2.vb }));
  await go('#pengiriman'); await page.click('#tools [data-act="newkirim"]'); await wait(500);
  const opsiKirim = await page.evaluate(() => [...document.querySelectorAll('#m-spk option')].map((o) => o.textContent));
  await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await wait(300);
  ok('B-06 SPK stok tidak tersedia di pilihan surat jalan customer', !opsiKirim.some((t) => /STOK MNI/.test(t)), JSON.stringify(opsiKirim.map((t) => t.slice(0, 30))));
  await go('#barang-jadi'); await act('fgterima', { spk: idB }); await wait(800);
  await submit();
  const kB3 = await kondisi(idB);
  const fgSetelah = await page.evaluate((id) => calc().stock.fg[id], fgElg);
  const mFg = (await rows('mutasi')).find((m) => m.gudang === 'fg' && m.jenis === 'masuk' && m.spk === idB);
  ok('B-07 terima di gudang barang jadi 15: stok produk naik 15, dokumen BJ-M tertaut SPK, SPK stok Selesai', fgSetelah - fgAwal === 15 && kB3.kir === 15 && kB3.st === 'Selesai' && !!mFg && /^BJ-M/.test(mFg.noDok || mFg.no_dok || ''), JSON.stringify({ naik: fgSetelah - fgAwal, kir: kB3.kir, st: kB3.st, dok: mFg && (mFg.noDok || mFg.no_dok) }));
  await act('mv', { g: 'fg', j: 'keluar', item: fgElg }); await wait(700);
  await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '8'; f.pihak.value = 'PT Pembeli Stok'; });
  await submit();
  await submit();
  const galatB8 = await page.evaluate(() => (document.getElementById('merr') || { textContent: '' }).textContent);
  const fgKeluar = await page.evaluate((id) => calc().stock.fg[id], fgElg);
  const mKeluar = (await rows('mutasi')).find((m) => m.gudang === 'fg' && m.jenis === 'keluar');
  ok('B-08 barang jadi keluar ke customer dari stok: stok turun 8 (BJ-K), tercatat tujuan customer', fgSetelah - fgKeluar === 8 && !!mKeluar && /^BJ-K/.test(mKeluar.noDok || mKeluar.no_dok || '') && /Pembeli/.test(mKeluar.pihak || ''), JSON.stringify({ turun: fgSetelah - fgKeluar, galat: galatB8.slice(0, 160), dok: mKeluar && (mKeluar.noDok || mKeluar.no_dok) }));
  await act('mv', { g: 'fg', j: 'keluar', item: fgElg }); await wait(700);
  await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '9999'; f.pihak.value = 'PT Pembeli Stok'; });
  await submit();
  const galatKeluar = await page.evaluate(() => (document.getElementById('merr') || { textContent: '' }).textContent);
  const fgTetap = await page.evaluate((id) => calc().stock.fg[id], fgElg);
  await page.evaluate(() => document.querySelector('[data-act="closemodal"]')?.click()); await wait(300);
  ok('B-09 keluar melebihi stok ditolak dengan pesan; stok tidak berubah', fgTetap === fgKeluar && /tidak cukup|melebihi/i.test(galatKeluar), JSON.stringify({ galatKeluar: galatKeluar.slice(0, 100), fgTetap, fgKeluar }));

  // =====================================================================================
  // C. SPK customer stainless: tanpa vendor
  // =====================================================================================
  const idC = await buatSpk({ cust: 'PT Alur C Stainless', po: 'PO-C-01', judul: 'CABLE TRAY TYPE STU 1.5 STAINLESS STEEL 304', desc: 'Cable Tray W200xH100xL3000', qty: 10, berat: 12 });
  const infoC = await page.evaluate((id) => { const s = byId('spk', id); return { rute: itemRute(s.items[0]), material: s.material, fin: PXL().finishingDari(s.items[0].g) }; }, idC);
  ok('C-01 SPK stainless: rute hanya mesin internal (tanpa Vendor), material SS304, tanpa finishing', infoC.rute.join('>') === 'Shearing>Punching>Bending' && /SS304/.test(infoC.material) && infoC.fin === '', JSON.stringify(infoC));
  await produksiPenuh(['Shearing', 'Punching', 'Bending']);
  const kC1 = await kondisi(idC);
  ok('C-02 setelah mesin terakhir, SPK stainless langsung siap kirim ke customer (tidak menunggu vendor)', kC1.prod === 10 && /Siap/i.test(String(kC1.stage)), JSON.stringify({ prod: kC1.prod, stage: kC1.stage }));
  const pesanC = await suratJalan(idC, null);
  const kC2 = await kondisi(idC);
  ok('C-03 surat jalan customer 10 btg dibuat langsung tanpa vendor', kC2.kir === 10, JSON.stringify({ kir: kC2.kir, pesan: String(pesanC).slice(0, 60) }));
  await selesaikanKirim();
  const kC3 = await kondisi(idC);
  ok('C-04 diterima customer: SPK stainless Selesai', kC3.st === 'Selesai', JSON.stringify({ st: kC3.st }));
  await go('#vendor');
  const vendorC = (await rows('vendor')).filter((v) => v.spk === idC).length;
  ok('C-05 tidak ada dokumen vendor untuk SPK stainless', vendorC === 0);

  // =====================================================================================
  // D. SPK stok aluminium: tanpa vendor, langsung ke gudang barang jadi
  // =====================================================================================
  await go('#barang-jadi');
  const fgAlu = await page.evaluate(() => S.fg.find((r) => /Aluminium/.test(r.finishing))._id);
  const aluAwal = await page.evaluate((id) => calc().stock.fg[id], fgAlu);
  await page.evaluate((id) => { const c = document.createElement('input'); c.type = 'checkbox'; c.checked = false; c.dataset.act = 'fgpick'; c.dataset.id = id; document.body.appendChild(c); c.click(); c.remove(); }, fgAlu); await wait(300);
  await page.evaluate(() => { window.__beratAsli = window.MNIBerat; window.MNIBerat = { siap: () => true, hitungItem: () => ({ ok: true, beratSPK: 6.5 }) }; });
  await act('fgspkpick'); await wait(600);
  await page.evaluate(() => { document.querySelector('#mform [name^="qty_"]').value = '12'; });
  await submit(); await wait(1500); await tutupLembar();
  await page.evaluate(() => { window.MNIBerat = window.__beratAsli; });
  const idD = await page.evaluate((fg) => (S.spk.find((s) => s.stokReq && (s.items || []).some((i) => i.fg === fg)) || {})._id, fgAlu);
  const infoD = await page.evaluate((id) => { const s = byId('spk', id); return { g: s.items[0].g, rute: itemRute(s.items[0]), material: s.material }; }, idD);
  ok('D-01 SPK stok aluminium: judul memuat ALUMINIUM, rute tanpa Vendor', /ALUMINIUM/.test(infoD.g) && !infoD.rute.some((w) => /^Vendor/i.test(w)) && infoD.rute.length >= 3, JSON.stringify(infoD));
  const beratD = await page.evaluate((id) => { const it = byId('spk', id).items[0]; return { w: it.w, ws: it.ws }; }, idD);
  ok('D-01b SPK stok membawa berat per pcs dari kalkulator berat bila katalog tersedia (6,5 kg, bertanda otomatis)', beratD.w === 6.5 && beratD.ws === 'k', JSON.stringify(beratD));
  await act('spkpub', { id: idD }); await wait(1300);
  await produksiPenuh(['Shearing', 'Punching', 'Bending']);
  const kD1 = await kondisi(idD);
  ok('D-02 produksi 12 selesai: siap diterima gudang tanpa vendor', kD1.prod === 12, JSON.stringify({ prod: kD1.prod, stage: kD1.stage }));
  await go('#barang-jadi'); await act('fgterima', { spk: idD }); await wait(800); await submit();
  const kD2 = await kondisi(idD);
  const aluSetelah = await page.evaluate((id) => calc().stock.fg[id], fgAlu);
  ok('D-03 terima di gudang barang jadi: stok aluminium naik 12 dan SPK stok Selesai', aluSetelah - aluAwal === 12 && kD2.kir === 12 && kD2.st === 'Selesai', JSON.stringify({ naik: aluSetelah - aluAwal, kir: kD2.kir, st: kD2.st }));

  } catch (e) { ok('Z-henti alur berhenti karena galat uji', false, String(e.stack || e.message).split('\n').filter((l) => !/node_modules|internal/.test(l)).slice(0, 8).map((l) => l.replace(/.*alur-lengkap.mjs:/, 'L')).join(' / ').slice(0, 900)); }
  // ---------- keseluruhan ----------
  const inv = await page.evaluate(() => (typeof window.periksaInvarianApp === 'function' ? window.periksaInvarianApp() : null));
  const semuaSelesai = await page.evaluate(() => S.spk.filter((s) => (s.status || 'Terbit') === 'Terbit').map((s) => [s.no, calc().spk[s._id].st]));
  ok('Z-01 keempat SPK selesai; tidak ada SPK tertinggal di tengah alur', semuaSelesai.length === 4 && semuaSelesai.every(([, st]) => st === 'Selesai'), JSON.stringify(semuaSelesai));
  ok('Z-02 tanpa pageerror sepanjang alur', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R, inv };
}
