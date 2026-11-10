// Uji kop dokumen dan tema per jenis dokumen (mock): kop diatur di Master Data (nama, alamat, kontak, warna, logo),
// dipakai pratinjau, PDF, dan Excel; tiap jenis dokumen punya kode dan warna sendiri.
export async function runKop(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 400) => page.waitForTimeout(ms);
    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.evaluate(() => { location.hash = '#master-data'; }); await wait(800);
    await page.evaluate(() => { F['master-data'].tab = 'kop'; renderBody(); }); await wait(500);

    const t1 = await page.evaluate(() => ({ nama: !!document.getElementById('kp-nama'), warna: !!document.getElementById('kp-warna'), file: !!document.getElementById('kp-file'), prev: (document.getElementById('kp-prev') || {}).innerText || '', save: !!document.querySelector('[data-act="kopsimpan"]') }));
    ok('KO-01 tab Kop dokumen di Master Data: isian nama, alamat, kontak, warna, logo, pratinjau, tombol simpan', t1.nama && t1.warna && t1.file && t1.save && /MITRA NUSA/i.test(t1.prev) && /SURAT JALAN/.test(t1.prev), JSON.stringify(t1).slice(0, 160));

    // logo kustom: PNG kecil dibuat di halaman
    const png = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = 300; c.height = 90; const x = c.getContext('2d'); x.fillStyle = '#c2410c'; x.fillRect(0, 0, 300, 90); x.fillStyle = '#fff'; x.font = '40px Arial'; x.fillText('UJI', 20, 60); return c.toDataURL('image/png').split(',')[1]; });
    await page.fill('#kp-nama', 'PT KOP UJI SEJAHTERA'); await page.fill('#kp-a1', 'Jl. Uji Coba No. 9'); await page.fill('#kp-a2', ''); await page.fill('#kp-kontak', 'Telp 021-555 · uji@kop.test');
    await page.evaluate(() => { const e = document.getElementById('kp-warna'); e.value = '#0f766e'; e.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.setInputFiles('#kp-file', { name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') }); await wait(700);
    const pv = await page.evaluate(() => ({ t: document.getElementById('kp-prev').innerText, img: (document.querySelector('#kp-prev img') || {}).src || '' }));
    ok('KO-02 pratinjau kop ikut berubah saat isian dan logo diganti (sebelum disimpan)', /KOP UJI SEJAHTERA/.test(pv.t) && /uji@kop\.test/.test(pv.t) && /^data:image\/png/.test(pv.img), pv.t.slice(0, 80));
    await page.click('[data-act="kopsimpan"]'); await wait(1200);
    const sv = await page.evaluate(() => { const k = KOP(); const raw = (byId('master', 'setting') || {}).kop || {}; return { nama: k.nama, a2: k.a2, warna: k.warna, custom: k.custom, w: raw.logoW, h: raw.logoH, ratio: k.logoRatio }; });
    ok('KO-03 simpan kop: tersimpan di master/setting.kop, logo kustom aktif, alamat baris 2 boleh kosong', sv.nama === 'PT KOP UJI SEJAHTERA' && sv.a2 === '' && sv.warna === '#0F766E' && sv.custom && sv.w === 300 && Math.abs(sv.ratio - 300 / 90) < 0.01, JSON.stringify(sv));

    // dokumen: PDF dan Excel memakai kop kustom
    const doc = await page.evaluate(async () => {
      const out = {};
      const base = (kind, title) => ({ kind, file: 'x', title, no: 'NO/UJI/1', date: '2026-11-08', meta: [['Kepada', 'Pihak Uji'], ['Tanggal', '8 November 2026'], ['Ref', 'SPK 1']], tables: [{ cols: [['No', 6, 'c'], ['Nama barang', 60, 'l'], ['Qty', 12, 'r'], ['Satuan', 10, 'c']], rows: [[1, 'Item uji satu', 5, 'Btg'], [2, 'Item uji dua', 7, 'Btg']], foot: ['', 'TOTAL', 12, ''] }], note: 'Catatan uji', signs: ['A,\nSatu', 'B', 'C,\nTiga'] });
      const X = await loadExcelJS();
      for (const [kind, title] of [['sjv', 'SURAT JALAN KE VENDOR'], ['btb', 'BUKTI TERIMA BARANG DARI VENDOR'], ['lpp', 'LAPORAN PROGRES PRODUKSI'], ['kpi', 'LAPORAN KPI']]) {
        const m = base(kind, title); const pdf = await docPdf(m), xl = await docXlsx(m);
        const wb = new X.Workbook(); await wb.xlsx.load(xl); const ws = wb.worksheets[0];
        out[kind] = { pdf: pdf.length > 5000 && String.fromCharCode(...pdf.slice(0, 4)) === '%PDF', c1: ws.getCell('C1').value, k: ws.getCell('A6').value, t: ws.getCell('B6').value, no: String(ws.getCell('A8').value) };
      }
      return out;
    });
    const kinds = Object.keys(doc);
    ok('KO-04 PDF dan Excel 4 jenis dokumen (SJ vendor, BTB, LPP, KPI) jadi dengan kop kustom di baris 1 dan kode dokumen di baris judul', kinds.length === 4 && kinds.every((k) => doc[k].pdf && doc[k].c1 === 'PT KOP UJI SEJAHTERA' && /NO\. DOKUMEN/.test(doc[k].no)), JSON.stringify(doc).slice(0, 200));
    ok('KO-05 kode dokumen pembeda per jenis di Excel', doc.sjv.k === 'SJV' && doc.btb.k === 'BTB' && doc.lpp.k === 'LPP' && doc.kpi.k === 'KPI', [doc.sjv.k, doc.btb.k, doc.lpp.k, doc.kpi.k].join(','));

    const sj = await page.evaluate(async () => {
      const d = { noSJ: '26/XI/MNI/9', tgl: '2026-11-08', customer: 'Cust Uji', alamat: 'Alamat uji', po: 'PO-1', spk: '1', kendaraan: 'Fuso', nopol: 'B 1 UJI', driver: 'Budi', items: [{ d: 'Barang uji', q: 3, u: 'Btg' }] };
      const pdf = await sjPdf(d), xl = await sjXlsx(d); const X = await loadExcelJS(); const wb = new X.Workbook(); await wb.xlsx.load(xl); const ws = wb.worksheets[0];
      return { pdf: pdf.length > 5000, c1: ws.getCell('C1').value, k: ws.getCell('A6').value, no: String(ws.getCell('A8').value) };
    });
    ok('KO-06 surat jalan customer (PDF dan Excel) memakai kop kustom dan kode SJ', sj.pdf && sj.c1 === 'PT KOP UJI SEJAHTERA' && sj.k === 'SJ' && /26\/XI\/MNI\/9/.test(sj.no), JSON.stringify(sj));

    const pr = await page.evaluate(() => { const v = sjvPreview({ noSJ: 'V-1', tgl: '2026-11-08', vendor: 'V', items: [{ d: 'x', q: 1, u: 'Btg' }] }, null), k = sjPreview({ noSJ: 'K-1', tgl: '2026-11-08', customer: 'C', items: [{ d: 'x', q: 1, u: 'Btg' }] }, null); return { v, k }; });
    ok('KO-07 pratinjau surat jalan vendor dan customer: kop kustom, kode dan warna tema berbeda', /KOP UJI SEJAHTERA/.test(pr.v) && /KOP UJI SEJAHTERA/.test(pr.k) && /--dc:#C2410C/.test(pr.v) && /--dc:#1F3A6E/.test(pr.k) && />SJV</.test(pr.v) && />SJ</.test(pr.k), '');

    const th = await page.evaluate(() => { const ks = ['sjc', 'sjv', 'btb', 'lpp', 'kpi', 'cek']; const t = ks.map((k) => docTh(k)); return { warna: new Set(t.map((x) => x.c)).size, kode: new Set(t.map((x) => x.k)).size }; });
    ok('KO-08 6 jenis dokumen punya warna dan kode yang semuanya berbeda', th.warna === 6 && th.kode === 6, JSON.stringify(th));

    // dokumen asli dari SPK contoh: laporan produksi
    const lpp = await page.evaluate(async () => { const s = S.spk[0]; if (!s) return null; const m = docModel('lpp', s._id); const pdf = await docPdf(m), xl = await docXlsx(m); return { kind: m.kind, pdf: pdf.length > 5000, xl: xl.length > 2000 }; });
    ok('KO-09 laporan produksi dari SPK nyata: model membawa jenis dokumen, PDF dan Excel jadi', !!lpp && lpp.kind === 'lpp' && lpp.pdf && lpp.xl, JSON.stringify(lpp));

    // pulihkan bawaan
    await page.evaluate(() => { F['master-data'].tab = 'kop'; renderBody(); }); await wait(400);
    await page.click('[data-act="kopreset"]'); await wait(1200);
    const rs = await page.evaluate(() => { const k = KOP(); return { nama: k.nama, custom: k.custom, a1: k.a1, warna: k.warna }; });
    ok('KO-10 pulihkan bawaan: nama, alamat, warna, dan logo kembali ke semula', /MITRA NUSA/.test(rs.nama) && !rs.custom && /Gravitas/.test(rs.a1) && rs.warna === '#1F3A6E', JSON.stringify(rs));

    // ---- dokumen gudang: mutasi, PR, kartu stok, lembar opname, penawaran ----
    const gd = await page.evaluate(async () => {
      const out = {}; const X = await loadExcelJS(); const rd = async (b) => { const wb = new X.Workbook(); await wb.xlsx.load(b); return wb.worksheets[0]; };
      const jenisList = ['masuk', 'keluar', 'opname', 'koreksi'];
      out.mv = [];
      for (const j of jenisList) {
        const d = { tgl: '2026-11-08', kode: 'MV-' + j, jenis: j, title: 'BUKTI UJI ' + j.toUpperCase(), meta: [['No dokumen', 'x'], ['Tanggal', 'y'], ['No SPK', '1001']], cols: [['Material', 'l'], ['Ukuran (t×l×p mm)', 'l'], ['Qty', 'r'], ['Selisih', 'r', 1]], body: [['SPHC 2mm', '1219x2438', 5, -3], ['SPHC 1.6', '1219x2438', 2, 4]], tot: ['TOTAL', '', 7, 1], signs: ['A', 'B', 'C'], ket: 'uji' };
        const m = mvModel(d); const pdf = await docPdf({ ...m, names: ['X', '', 'Z'] }); const xl = await docXlsx(m); const ws = await rd(xl);
        let fmtNeg = null, metaHasNo = false; ws.eachRow((row) => row.eachCell((c) => { if (c.value === -3) fmtNeg = c.numFmt; if (c.value === 'NO. DOKUMEN   MV-' + j) metaHasNo = true; }));
        out.mv.push({ j, kind: m.kind, k: ws.getCell('A6').value, pdf: pdf.length > 4000, fmtNeg, metaHasNo, metaN: m.meta.length });
      }
      // cetak jendela bertema (tanpa popup nyata)
      const wo = window.open; let html = ''; window.open = () => ({ document: { write: (s) => { html = s; }, close() {} } });
      printDocHtml(mvModel({ tgl: '2026-11-08', kode: 'MV-keluar', jenis: 'keluar', title: 'BUKTI PENGELUARAN BAHAN BAKU', meta: [['No SPK', '1001']], cols: [['Material', 'l'], ['Qty', 'r']], body: [['SPHC 2mm', 5]], tot: ['TOTAL', 5], signs: ['A', 'B'], ket: 'uji <b>x</b>' }), ['Budi', '']);
      window.open = wo;
      out.print = { txt: html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '), th: /--dc:#B91C1C/.test(html), esc: !/uji <b>x/.test(html) };
      const rm = S.rm[0];
      const ks = ksModel(rm._id); const ksPdf = await docPdf(ks), ksXl = await docXlsx(ks);
      out.ks = { kind: ks.kind, land: ks.landscape, rows: ks.tables[0].rows.length, pdf: ksPdf.length > 4000, xl: ksXl.length > 2000, code: (await rd(ksXl)).getCell('A6').value };
      const pr = prModel({ noPR: 'PR/UJI/1', tgl: '2026-11-08', butuh: '2026-11-10', supplier: 'Supplier Uji', gudang: 'rm', items: [{ item: rm._id, q: 3 }] });
      const prPdf = await docPdf(pr), prXl = await docXlsx(pr);
      out.pr = { kind: pr.kind, pdf: prPdf.length > 4000, code: (await rd(prXl)).getCell('A6').value, tot: pr.tables[0].foot[3] };
      const sp0 = S.sp && S.sp[0];
      if (sp0) { const ps = prModel({ noPR: 'PR/UJI/2', tgl: '2026-11-08', gudang: 'sp', items: [{ item: sp0._id, q: 2 }] }); out.prsp = { title: ps.title, pdf: (await docPdf(ps)).length > 4000, xl: (await docXlsx(ps)).length > 2000 }; }
      out.doct = (() => { const v = Object.values(DOCT); return { n: v.length, c: new Set(v.map((x) => x.c)).size, k: new Set(v.map((x) => x.k)).size }; })();
      return out;
    });
    ok('KO-11 dokumen mutasi (4 jenis): PDF dan Excel jadi, kode dan warna per jenis, kolom selisih bertanda +/- di Excel', gd.mv.length === 4 && gd.mv.every((x) => x.pdf && x.metaHasNo && x.fmtNeg && /\+/.test(x.fmtNeg)) && gd.mv.map((x) => x.k).join() === 'IN,OUT,OPN,KOR' && gd.mv.every((x) => x.metaN === 1), JSON.stringify(gd.mv).slice(0, 220));
    ok('KO-12 cetak jendela bertema: judul, isi, nama penanda tangan ( Budi ) dan ( ____________ ) tetap, markup di-escape, warna jenis OUT', /BUKTI PENGELUARAN BAHAN BAKU/.test(gd.print.txt) && /\( Budi \)/.test(gd.print.txt) && /\( ____________ \)/.test(gd.print.txt) && gd.print.th && gd.print.esc, gd.print.txt.slice(0, 100));
    ok('KO-13 kartu stok bahan baku: model landscape dengan baris saldo, PDF dan Excel jadi, kode KS', gd.ks.kind === 'ks' && gd.ks.land && gd.ks.rows >= 1 && gd.ks.pdf && gd.ks.xl && gd.ks.code === 'KS', JSON.stringify(gd.ks));
    ok('KO-14 PR bahan baku dan sparepart: PDF dan Excel jadi, kode PR, total qty benar', gd.pr.kind === 'pr' && gd.pr.pdf && gd.pr.code === 'PR' && gd.pr.tot === 3 && (!gd.prsp || (/SPAREPART/.test(gd.prsp.title) && gd.prsp.pdf && gd.prsp.xl)), JSON.stringify({ pr: gd.pr, sp: gd.prsp }));
    ok('KO-15 semua jenis dokumen terdaftar punya warna dan kode unik', gd.doct.n >= 13 && gd.doct.c === gd.doct.n && gd.doct.k === gd.doct.n, JSON.stringify(gd.doct));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('KO-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
