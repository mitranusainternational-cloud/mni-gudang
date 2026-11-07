// Uji audit alur: revisi SPK terbit yang sudah punya catatan, dan pembatalan SPK. Mock, data sintetis.
export async function runAuditFlow(page, base) {
  const R = [];
  try { return await isi(page, base, R); } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
    const fail = R.filter((x) => x.startsWith('FAIL')).length;
    return { pass: R.length - fail, fail, detail: R };
  }
}

async function isi(page, base, R) {
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(12000);
  const wait = (ms = 400) => page.waitForTimeout(ms);
  const go = async (h) => { await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('[data-act="sheet-close"]')?.click(); }); await page.evaluate((h) => { location.hash = h; }, h); await wait(800); };
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
    localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
  });
  await page.reload(); await wait(3500);

  const buatSpk = async (cust, items) => {
    await go('#spk');
    await page.click('#tools [data-act="newspk"]'); await wait(700);
    const due = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
    await page.fill('#ed-cust', cust); await page.fill('#ed-po', 'PO-' + cust.slice(-3)); await page.fill('#ed-due', due);
    await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 NON FINISHING'); await page.dispatchEvent('#ed-h-0', 'change'); await wait(300);
    for (let i = 0; i < items.length; i++) {
      await page.fill(`#ed-d-0-${i}`, items[i][0]); await page.fill(`#ed-q-0-${i}`, String(items[i][1])); await page.fill(`#ed-u-0-${i}`, 'Btg'); await page.fill(`#ed-w-0-${i}`, '5');
    }
    await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
    await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(300);
    return page.evaluate((c) => (S.spk.find((s) => s.customer === c) || {})._id, cust);
  };
  const catat = (sid, idx, wc, qty) => page.evaluate(async ([sid, idx, wc, qty]) => { const c = mesinCtx(sid + '|' + idx); await mesinHasil(c, { wc, mesin: wc }, { qty, reject: 0, mulai: null, selesai: new Date().toISOString(), operator: 'Operator Uji' }); }, [sid, idx, wc, qty]);
  const revisi = async (sid, ubah) => {
    await go('#spk'); await act('spkedit', { id: sid }); await page.waitForSelector('#ed-secs'); await wait(600);
    await ubah(); await page.fill('#ed-rev', 'uji revisi');
    await page.click('#editor button:has-text("Simpan revisi")'); await wait(1500);
    const err = await page.evaluate(() => (document.getElementById('ed-err') || { textContent: '' }).textContent);
    const buka = await page.evaluate(() => !!document.getElementById('ed-secs'));
    if (buka) await page.evaluate(() => document.querySelector('#editor [data-act="ed-close"]')?.click());
    await wait(500);
    return { err, buka };
  };
  const spkItems = (sid) => page.evaluate((sid) => byId('spk', sid).items.map((i) => i.d + ':' + i.q), sid);

  // ---------- revisi SPK terbit yang sudah punya catatan ----------
  const a = await buatSpk('PT Audit Satu', [['Cable Tray W100xH50xL3000', 100], ['Cable Tray W200xH50xL3000', 20], ['Cable Tray W300xH50xL3000', 10]]);
  ok('AF-00 SPK tiga item terbit', !!a);
  await catat(a, 1, 'Shearing', 15); await catat(a, 1, 'Punching', 12);

  const r1 = await revisi(a, async () => { await page.click('#ed-secs tr[data-l="1"] [data-act="ed-delline"]'); await wait(300); });
  ok('AF-01 item yang sudah punya hasil mesin tidak boleh dihapus lewat revisi', /tidak boleh dihapus|urutannya tidak boleh berubah/.test(r1.err) && r1.buka === false || /tidak boleh dihapus|urutannya tidak boleh berubah/.test(r1.err), JSON.stringify(r1) + ' ' + (await spkItems(a)).join('|'));

  const r2 = await revisi(a, async () => { await page.fill('#ed-q-0-1', '10'); });
  ok('AF-02 qty tidak boleh di bawah yang sudah diproduksi (Shearing 15)', /tidak boleh di bawah 15/.test(r2.err), JSON.stringify(r2));

  const r3 = await revisi(a, async () => { await page.fill('#ed-d-0-1', 'Nama baru item'); });
  ok('AF-03 item yang sudah punya catatan tidak boleh diganti nama', /nama dan section-nya tidak boleh diubah/.test(r3.err), JSON.stringify(r3));

  const r4 = await revisi(a, async () => { await page.fill('#ed-q-0-1', '30'); await page.fill('#ed-q-0-2', '4'); });
  const it4 = await spkItems(a);
  ok('AF-04 menaikkan qty item aktif dan mengubah item tanpa catatan diizinkan; catatan produksi tetap menempel pada item yang sama', r4.err === '' && it4.join('|') === 'Cable Tray W100xH50xL3000:100|Cable Tray W200xH50xL3000:30|Cable Tray W300xH50xL3000:4' && (await page.evaluate((a) => { const s = byId('spk', a); const st = itemState(s, s.items[1], 1); return st.kum.Shearing === 15 && st.kum.Punching === 12; }, a)), JSON.stringify({ r4, it4 }));

  const r5 = await revisi(a, async () => { await page.click('[data-act="ed-addline"]'); await wait(200); const n = await page.evaluate(() => document.querySelectorAll('#ed-secs tr[data-l]').length); const i = n - 1; await page.fill(`#ed-d-0-${i}`, 'Cable Tray W400xH50xL3000'); await page.fill(`#ed-q-0-${i}`, '6'); await page.fill(`#ed-u-0-${i}`, 'Btg'); });
  const it5 = await spkItems(a);
  ok('AF-05 menambah item baru di akhir diizinkan dan tidak menggeser catatan item lama', r5.err === '' && it5.length === 4 && it5[3].startsWith('Cable Tray W400') && (await page.evaluate((a) => { const s = byId('spk', a); const st = itemState(s, s.items[1], 1); return st.kum.Shearing === 15; }, a)), JSON.stringify({ r5, it5 }));

  // ---------- pembatalan SPK ----------
  const b = await buatSpk('PT Audit Dua', [['Cable Tray W100xH50xL3000', 10]]);
  const antriSebelum = await page.evaluate((b) => wcAktifItems().filter((x) => x.spkId === b).length, b);
  await go('#spk'); await act('void', { c: 'spk', id: b }); await wait(500);
  await page.fill('#m-alasan', 'dibuat salah'); await page.evaluate(() => document.getElementById('msub').click()); await wait(1200);
  const sb = await page.evaluate((b) => ({ status: byId('spk', b).status, st: calc().spk[b].st, antri: wcAktifItems().filter((x) => x.spkId === b).length, opsi: spkSelect('', true, false).includes('SPK ' + byId('spk', b).no + ' ') }), b);
  ok('AF-06 SPK dibatalkan: status Batal, hilang dari antrian mesin dan pilihan SPK untuk dokumen baru', antriSebelum === 1 && sb.status === 'Batal' && sb.st === 'Batal' && sb.antri === 0 && sb.opsi === false, JSON.stringify({ antriSebelum, sb }));
  await go('#spk');
  const aktifChip = await page.evaluate(() => document.querySelector('#body .summ')?.innerText.replace(/\s+/g, ' ') || '');
  ok('AF-07 daftar SPK menghitung Batal terpisah dan tidak sebagai aktif', /1 batal/.test(aktifChip), aktifChip);
  await act('openspk', { id: b }); await wait(800);
  const dr = await page.evaluate(() => (document.getElementById('drawer') || document.body).innerText.replace(/\s+/g, ' '));
  ok('AF-08 drawer SPK batal menampilkan alasan dan tombol Aktifkan kembali tanpa Edit, Kirim, atau Vendor', /SPK dibatalkan: dibuat salah/.test(dr) && /Aktifkan kembali/.test(dr) && !/Kirim ke customer/.test(dr) && !/Edit SPK/.test(dr), dr.slice(0, 300));
  await page.evaluate(() => document.querySelector('#drawer [data-act="closedrawer"]')?.click());
  await act('spkreopen', { id: b }); await wait(900);
  ok('AF-09 SPK diaktifkan kembali dan muncul lagi di antrian mesin', await page.evaluate((b) => byId('spk', b).status === 'Terbit' && wcAktifItems().some((x) => x.spkId === b), b));

  // SPK dengan surat jalan aktif tidak boleh dibatalkan
  await page.evaluate(async (b) => { const s = byId('spk', b); for (const w of ['Shearing', 'Punching', 'Bending']) { const c = mesinCtx(b + '|0'); await mesinHasil(c, { wc: w, mesin: w }, { qty: 10, reject: 0, mulai: null, selesai: new Date().toISOString(), operator: 'Uji' }); } void s; }, b);
  await page.evaluate(async (b) => { await addDoc('kirim', { spk: b, tgl: today(), noSJ: 'SJ-UJI-1', status: 'Terkirim', items: [{ d: byId('spk', b).items[0].d, q: 4, w: 5 }] }); }, b);
  await wait(600);
  await go('#spk'); await act('void', { c: 'spk', id: b }); await wait(500);
  await page.fill('#m-alasan', 'coba'); await page.evaluate(() => document.getElementById('msub').click()); await wait(1000);
  const tolak = await page.evaluate(() => (document.querySelector('#modal .err, #m-err, #modal [role="alert"]') || { textContent: '' }).textContent);
  ok('AF-10 SPK yang sudah punya surat jalan aktif ditolak dibatalkan dengan alasan jelas', /surat jalan vendor\/customer yang aktif/.test(tolak) && (await page.evaluate((b) => byId('spk', b).status !== 'Batal', b)), tolak);

  // ---------- snapshot rute: perubahan rute produk tidak menggeser SPK berjalan; item lama tanpa snapshot tetap dijaga ----------
  const snap = await page.evaluate((a) => byId('spk', a).items.map((i) => (i.rute || []).join('>')), a);
  ok('AF-11a SPK yang diterbitkan lewat editor membawa snapshot rute di tiap item', snap.length === 4 && snap.every((x) => x === 'Shearing>Punching>Bending'), JSON.stringify(snap));
  await go('#master-data');
  await page.click('[data-view="master-data"][data-key="tab"][data-val="rute"]'); await wait(600);
  await page.click('#rute-tabel input[data-rk="CABLE TRAY"][value="Punching"]'); await wait(900);
  const bebas = await page.evaluate((a) => { const s = byId('spk', a); const st = itemState(s, s.items[1], 1); return { master: ruteStd()['CABLE TRAY'].join('>'), itemRute: itemRute(s.items[1]).join('>'), kumPunching: st.kum.Punching }; }, a);
  ok('AF-11b rute master Cable Tray diubah (Punching dihapus) tanpa ditolak karena SPK berjalan memakai snapshot; rute dan progres SPK itu tidak bergeser', !/Punching/.test(bebas.master) && bebas.itemRute === 'Shearing>Punching>Bending' && bebas.kumPunching === 12, JSON.stringify(bebas));
  await page.click('#rute-tabel input[data-rk="CABLE TRAY"][value="Punching"]'); await wait(900);
  await page.evaluate(async (a) => { const s = byId('spk', a); await updDoc('spk', a, { items: s.items.map((i) => { const { rute: _r, alt: _a, ...sisa } = i; return sisa; }) }); }, a);
  await wait(700);
  await page.click('#rute-tabel input[data-rk="CABLE TRAY"][value="Punching"]'); await wait(900);
  const tolakRute = await page.evaluate(() => ({ toast: document.getElementById('toast').textContent, rute: ruteStd()['CABLE TRAY'].join('>'), cek: document.querySelector('#rute-tabel input[data-rk="CABLE TRAY"][value="Punching"]').checked }));
  ok('AF-11c item lama tanpa snapshot yang sudah punya catatan di Punching tetap dijaga: perubahan rute ditolak, rute dan centang tidak berubah', /Rute tidak diubah/.test(tolakRute.toast) && /Punching/.test(tolakRute.rute) && tolakRute.cek === true, JSON.stringify(tolakRute));
  await go('#spk'); await act('spkedit', { id: a }); await page.waitForSelector('#ed-secs'); await wait(600);
  await page.fill('#ed-rev', 'bekukan rute'); await page.click('#editor button:has-text("Simpan revisi")'); await wait(1500);
  ok('AF-11d menyimpan revisi membekukan rute item lama (snapshot dibuat dari rute berlaku; progres tidak berubah)', await page.evaluate((a) => { const s = byId('spk', a); const st = itemState(s, s.items[1], 1); return s.items.every((i) => Array.isArray(i.rute) && i.rute.length === 3) && st.kum.Punching === 12; }, a));
  await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="rute"]'); await wait(600);
  await page.click('#rute-tabel input[data-rk="CABLE DUCT"][value="Punching"]'); await wait(900);
  ok('AF-12 rute produk yang tidak dipakai SPK berjalan tetap bebas diubah', await page.evaluate(() => !ruteStd()['CABLE DUCT'].includes('Punching')));

  // ---------- surat jalan vendor yang sudah menerima barang kembali tidak boleh dibatalkan ----------
  const vid = await page.evaluate(async (b) => { const r = await addDoc('vendor', { spk: b, tgl: today(), vendor: 'Vendor Uji', proses: 'ELG', noSJ: 'SJV-UJI-1', status: 'Di Vendor', items: [{ d: byId('spk', b).items[0].d, q: 6, kembali: 2, reject: 1 }] }); return r && (r.id || r._id) || (S.vendor.find((v) => v.noSJ === 'SJV-UJI-1') || {})._id; }, b);
  await wait(600);
  await go('#vendor'); await act('void', { c: 'vendor', id: vid || (await page.evaluate(() => (S.vendor.find((v) => v.noSJ === 'SJV-UJI-1') || {})._id)) }); await wait(500);
  await page.fill('#m-alasan', 'coba'); await page.evaluate(() => document.getElementById('msub').click()); await wait(1000);
  const tolakV = await page.evaluate(() => ({ err: (document.querySelector('#modal .err, #m-err, #modal [role="alert"]') || { textContent: '' }).textContent, st: (S.vendor.find((v) => v.noSJ === 'SJV-UJI-1') || {}).status }));
  ok('AF-13 surat jalan vendor dengan barang kembali (2 OK + 1 reject) ditolak dibatalkan; status tetap', /sudah menerima 3 barang kembali/.test(tolakV.err) && tolakV.st !== 'Batal', JSON.stringify(tolakV));

  // ---------- Master Data > Opsi SPK memusatkan daftar produk, type, tebal, finishing, distribusi, penandatangan ----------
  await go('#master-data');
  await page.click('[data-view="master-data"][data-key="tab"][data-val="opsi"]'); await wait(600);
  const awalOpsi = await page.evaluate(() => ({ p: HB.p.length, sign: OPSI().signProc }));
  await page.fill('#op-p', (await page.inputValue('#op-p')) + '\nTANGGA KABEL');
  await page.fill('#op-tb', (await page.inputValue('#op-tb')) + '\n4.0');
  await page.fill('#op-dist', (await page.inputValue('#op-dist')) + '\nQuality Control');
  await page.fill('#op-signProc', 'Estimator Baru');
  await page.click('[data-act="opsisimpan"]'); await wait(900);
  const sesudahOpsi = await page.evaluate(() => ({ p: HB.p, tb: HB.tb, dist: OPSI().dist, sign: OPSI().signProc }));
  ok('AF-14 opsi SPK disimpan di Master Data dan langsung dipakai: produk, tebal, distribusi, dan penandatangan bawaan', sesudahOpsi.p.includes('TANGGA KABEL') && sesudahOpsi.tb.includes('4.0') && sesudahOpsi.dist.includes('Quality Control') && sesudahOpsi.sign === 'Estimator Baru' && awalOpsi.sign === 'Halimah', JSON.stringify({ awalOpsi, sign: sesudahOpsi.sign }));
  await page.click('[data-view="master-data"][data-key="tab"][data-val="rute"]'); await wait(600);
  const adaRute = await page.evaluate(() => [...document.querySelectorAll('#rute-tabel tbody tr b')].some((b) => b.textContent === 'TANGGA KABEL'));
  ok('AF-15 produk baru langsung muncul di tab Rute produksi untuk diatur work center-nya', adaRute);
  await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(500);
  const edOpsi = await page.evaluate(() => ({ prod: [...document.getElementById('ed-hp-0').options].map((o) => o.textContent), tb: [...document.querySelectorAll('#ed-secs select[data-hb="tb"] option')].map((o) => o.textContent), sign: document.getElementById('ed-sp').value }));
  ok('AF-16 editor SPK baru memakai opsi dari Master Data (produk, tebal, penandatangan)', edOpsi.prod.includes('TANGGA KABEL') && edOpsi.tb.includes('4.0') && edOpsi.sign === 'Estimator Baru', JSON.stringify(edOpsi).slice(0, 300));
  await page.evaluate(() => document.querySelector('#editor [data-act="ed-close"]')?.click()); await wait(400);
  await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="opsi"]'); await wait(500);
  await page.click('[data-act="opsireset"]'); await wait(900);
  ok('AF-17 Pulihkan bawaan mengembalikan semua opsi', await page.evaluate(() => !HB.p.includes('TANGGA KABEL') && OPSI().signProc === 'Halimah'));

  ok('AF-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
