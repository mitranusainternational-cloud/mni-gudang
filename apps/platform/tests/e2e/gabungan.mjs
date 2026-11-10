// Uji surat jalan gabungan beberapa SPK dalam satu armada (T-218, mock): satu nomor surat jalan untuk beberapa SPK,
// cetak per SPK, ceklis Bongkar Muat mengikuti struktur SPK, dan pembatalan sebagian tidak merusak kelompok.
export async function runGabungan(page, base) {
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
    const fgId = await page.evaluate(() => S.fg[0]._id);

    const buatSpk = async (cust, desc, q, ambil) => {
      await go('#spk'); await page.click('#tools [data-act="newspk"]'); await wait(700);
      const due = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
      await page.fill('#ed-cust', cust); await page.fill('#ed-po', 'PO-' + desc.slice(-2)); await page.fill('#ed-due', due);
      await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 NON FINISHING'); await page.dispatchEvent('#ed-h-0', 'change'); await wait(300);
      await page.fill('#ed-d-0-0', desc); await page.fill('#ed-q-0-0', String(q)); await page.fill('#ed-u-0-0', 'Btg'); await page.fill('#ed-w-0-0', '5');
      if (ambil) { await page.selectOption('#ed-fg-0-0', fgId); await wait(500); await page.fill('#ed-am-0-0', String(ambil)); await wait(200); }
      await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
      await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(500);
      return page.evaluate((c) => (S.spk.find((s) => s.customer === c) || {})._id, cust);
    };
    const produksi = async (id, qty) => { for (const w of ['Shearing', 'Punching', 'Bending']) await page.evaluate(async ([id, w, qty]) => { const c = mesinCtx(id + '|0'); await mesinHasil(c, { wc: w, mesin: w }, { qty, reject: 0, mulai: null, selesai: new Date().toISOString(), operator: 'Uji' }); }, [id, w, qty]); await wait(400); };

    const A = await buatSpk('Gab Vendor', 'Item Gab A', 10, 0);
    const B = await buatSpk('Gab Vendor', 'Item Gab B', 6, 0);

    // GB-01 kirim ke vendor: dua SPK dalam satu surat jalan
    await go('#vendor'); await act('newvendor', { spk: A }); await page.waitForSelector('#mform'); await wait(500);
    await page.fill('[name="vendor"]', 'Vendor Gab'); await page.fill('[name="proses"]', 'HDG');
    await page.click('[data-act="addgx"]'); await wait(300);
    const opsiB = await page.evaluate((a) => [...document.querySelectorAll('[name="gspk_1"] option')].map((o) => o.value).filter(Boolean).includes(a), A);
    await page.selectOption('[name="gspk_1"]', B); await wait(400);
    await page.fill('[name="ln_0"]', '10'); await page.fill('[name="g1_ln_0"]', '6');
    await page.evaluate(() => { const o = document.getElementById('m-over'); if (!o.checked) o.click(); const dk = document.querySelector('#mform [name="dock"]'); if (dk && !dk.checked) dk.click(); });
    await page.fill('[name="ket"]', 'kirim gabungan uji');
    await page.evaluate(() => document.getElementById('msub').click()); await wait(1200);
    await page.evaluate(() => { const b = document.getElementById('msub'); if (b && !document.getElementById('modal').hidden) b.click(); }); await wait(1800);
    const merr = await page.evaluate(() => (document.getElementById('merr') || { textContent: '' }).textContent);
    const v = await page.evaluate(([A, B]) => { const xs = S.vendor.filter((x) => x.vendor === 'Vendor Gab'); return { n: xs.length, noSJ: [...new Set(xs.map((x) => x.noSJ))].length, spk: xs.map((x) => x.spk === A ? 'A' : x.spk === B ? 'B' : '?').sort().join(''), q: xs.map((x) => x.items.map((i) => i.q).join('+')).sort().join('|'), bm: S.bongkar.filter((b) => b.link && b.link.c === 'vendor').length, ref: (S.bongkar[0] || {}).ref }; }, [A, B]);
    ok('GB-01 kirim ke vendor 2 SPK dalam satu armada: 2 dokumen (satu per SPK) dengan 1 nomor surat jalan, 1 antrian Bongkar Muat', opsiB === false && v.n === 2 && v.noSJ === 1 && v.spk === 'AB' && v.q === '10|6' && v.bm === 1 && /SPK \d+, SPK \d+/.test(v.ref || ''), JSON.stringify({ opsiB, v, merr }));

    // GB-02 Bongkar Muat mengikuti struktur SPK, ceklis tersimpan
    const bid = await page.evaluate(() => S.bongkar.find((b) => b.link && b.link.c === 'vendor')._id);
    await go('#bongkar-muat'); await act('openbm', { id: bid }); await page.waitForSelector('.bm-ck'); await wait(500);
    const dr = await page.evaluate(() => ({ ck: document.querySelectorAll('.bm-ck').length, hdr: [...document.querySelectorAll('.bm-spk-h')].map((x) => x.innerText.trim()) }));
    await page.click('#bmck-0'); await wait(500); await page.click('#bmck-1'); await wait(600);
    const cm = await page.evaluate((id) => Object.keys(byId('bongkar', id).ceklis || {}).sort().join(','), bid);
    ok('GB-02 drawer Bongkar Muat: 2 butir dikelompokkan dengan 2 judul SPK, kedua butir bisa dicentang dan tersimpan', dr.ck === 2 && dr.hdr.length === 2 && cm === '0,1' && dr.hdr.every((h) => /^SPK \d+ · Gab Vendor/.test(h)), JSON.stringify({ dr, cm }));

    // GB-03 model cetak gabungan (dari dokumen SPK mana pun)
    const docs = await page.evaluate(([A, B]) => ({ a: S.vendor.find((x) => x.spk === A)._id, b: S.vendor.find((x) => x.spk === B)._id }), [A, B]);
    const m = await page.evaluate(async ([a, b]) => {
      const ma = docModel('sjv', a), mb = docModel('sjv', b), t = ma.tables[0];
      const pdf = await docPdf(ma), xl = await docXlsx(ma);
      return { hdr: t.hdr.length, no: t.rows.filter((r, i) => !t.hdr.includes(i)).map((r) => r[0]).join(','), cek: t.rows.filter((r, i) => !t.hdr.includes(i)).map((r) => r[r.length - 1]).join(''), total: t.foot[2], sama: JSON.stringify(ma.tables[0].rows) === JSON.stringify(mb.tables[0].rows), ref: ma.meta.find((x) => x[0] === 'Ref SPK')[1], note: /gabungan 2 SPK/.test(ma.note), pdf: String.fromCharCode(...pdf.slice(0, 4)), xl: String.fromCharCode(...xl.slice(0, 2)) };
    }, [docs.a, docs.b]);
    ok('GB-03 cetak surat jalan vendor gabungan: 2 baris judul SPK, nomor butir 1,2 berlanjut, ✓✓, total 16, sama dari dokumen SPK mana pun; PDF dan Excel jadi', m.hdr === 2 && m.no === '1,2' && m.cek === '✓✓' && m.total === 16 && m.sama && /,/.test(m.ref) && m.note && m.pdf === '%PDF' && m.xl === 'PK', JSON.stringify(m));

    // GB-04 pratinjau dokumen SPK kedua: ✓ pada butirnya sendiri dan catatan gabungan
    await go('#vendor'); await act('openvendor', { id: docs.b }); await wait(900);
    const pv = await page.evaluate(() => { const p = document.querySelector('#drawer .sj-prev'); return { tick: (p.querySelector('.sj-prev-tbl tbody').innerText.match(/✓/g) || []).length, note: /Surat jalan gabungan 2 SPK/.test(p.innerText) }; });
    ok('GB-04 pratinjau dokumen SPK kedua menampilkan ✓ miliknya (bukan milik SPK pertama) dan catatan "Surat jalan gabungan 2 SPK"', pv.tick === 1 && pv.note, JSON.stringify(pv));

    // GB-05 surat jalan customer gabungan, satu SPK memakai stok sebagian
    const K1 = await buatSpk('Gab Kirim', 'Item Gab K1', 10, 4);
    const K2 = await buatSpk('Gab Kirim', 'Item Gab K2', 5, 0);
    const C = await buatSpk('Gab Lain', 'Item Gab C', 3, 0);
    await produksi(K1, 6); await produksi(K2, 5);
    await go('#pengiriman'); await act('newkirim', { spk: K1 }); await page.waitForSelector('#mform'); await wait(500);
    await page.click('[data-act="addgx"]'); await wait(300);
    const opsiK = await page.evaluate(([K2, C]) => { const o = [...document.querySelectorAll('[name="gspk_1"] option')].map((x) => x.value); return { k2: o.includes(K2), c: o.includes(C) }; }, [K2, C]);
    await page.selectOption('[name="gspk_1"]', K2); await wait(400);
    await page.fill('[name="ln_0"]', '10'); await page.fill('[name="g1_ln_0"]', '5');
    await page.evaluate(() => { const dk = document.querySelector('#mform [name="dock"]'); if (dk && !dk.checked) dk.click(); });
    await page.evaluate(() => document.getElementById('msub').click()); await wait(2000);
    const k = await page.evaluate(([K1, K2]) => { const xs = S.kirim.filter((x) => x.customer === 'Gab Kirim'); const mut = S.mutasi.filter((x) => x.gudang === 'fg' && x.jenis === 'keluar'); return { n: xs.length, noSJ: [...new Set(xs.map((x) => x.noSJ))].length, mutasi: mut.map((x) => (x.spk === K1 ? 'K1' : x.spk === K2 ? 'K2' : '?') + x.delta).join(','), kir: [K1, K2].map((i) => calc().spk[i].kir).join('/') }; }, [K1, K2]);
    ok('GB-05 surat jalan customer 2 SPK satu customer: SPK customer lain tidak ditawarkan, 2 dokumen 1 nomor, stok keluar hanya milik K1 (-4)', opsiK.k2 && !opsiK.c && k.n === 2 && k.noSJ === 1 && k.mutasi === 'K1-4' && k.kir === '10/5', JSON.stringify({ opsiK, k }));

    // GB-06 model cetak customer gabungan
    const kd = await page.evaluate(() => S.kirim.find((x) => x.customer === 'Gab Kirim')._id);
    const sj = await page.evaluate(async (id) => { const m = docModel('sjc', id); const pdf = await sjPdf(m.sj), xl = await sjXlsx(m.sj); return { n: m.sj.items.length, hdr: m.sj.items.filter((i) => i.hdr).length, partial: m.sj.partial, po: m.sj.po, spk: m.sj.spk, pdf: String.fromCharCode(...pdf.slice(0, 4)), xl: String.fromCharCode(...xl.slice(0, 2)) }; }, kd);
    ok('GB-06 cetak surat jalan customer gabungan: 2 judul SPK + 2 butir, PO dan SPK digabung, tanpa rincian partial; PDF dan Excel jadi', sj.n === 4 && sj.hdr === 2 && sj.partial === null && /,/.test(sj.po) && /,/.test(sj.spk) && sj.pdf === '%PDF' && sj.xl === 'PK', JSON.stringify(sj));

    // GB-07 batalkan bagian K2: kelompok tersisa 1, antrian Bongkar Muat tetap hidup
    const kd2 = await page.evaluate((K2) => S.kirim.find((x) => x.spk === K2)._id, K2);
    await go('#pengiriman'); await act('void', { c: 'kirim', id: kd2 }); await page.waitForSelector('#mform'); await page.fill('#mform [name="alasan"]', 'uji batal bagian'); await page.evaluate(() => document.getElementById('msub').click()); await wait(1800);
    const bt = await page.evaluate(([K1]) => { const d = S.kirim.find((x) => x.spk === K1); const b = S.bongkar.find((x) => x.link && x.link.c === 'kirim'); return { grup: sjGrup('kirim', d).length, bm: b && b.status }; }, [K1]);
    ok('GB-07 membatalkan bagian SPK K2: kelompok tersisa 1 dokumen dan antrian Bongkar Muat surat jalan itu tidak ikut batal', bt.grup === 1 && bt.bm === 'Antri', JSON.stringify(bt));

    // GB-08 catatan penerimaan kembali (Unloading) tidak ikut tercetak sebagai ceklis surat jalan keluar
    const un = await page.evaluate(async (a) => { await addDoc('bongkar', { jenis: 'Unloading', muatan: 'Barang Setengah Jadi', pihak: 'Vendor Gab', nopol: 'B 9 UJI', tgl: today(), status: 'Proses', link: { c: 'vendor', id: a } }); await new Promise((r) => setTimeout(r, 500)); const b = bmFor('vendor', byId('vendor', a)); return b && b.jenis; }, docs.a);
    ok('GB-08 ceklis di surat jalan vendor hanya berasal dari catatan Loading (bukan Unloading penerimaan kembali)', un === 'Loading', String(un));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('GB-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
