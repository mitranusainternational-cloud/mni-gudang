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
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('KO-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
