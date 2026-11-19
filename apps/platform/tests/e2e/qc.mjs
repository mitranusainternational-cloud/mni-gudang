// Uji modul QC (Daily Check Sheet) dan peran Operator Produksi per work centre (mock).
// Alur: SPK terbit dan diproduksi -> QC: standar terisi dari SPK, judgment otomatis, simpan -> dokumen PDF/Excel/sertifikat -> hak peran QC.
export async function runQc(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept()); page.setDefaultTimeout(15000);
  const wait = (ms = 350) => page.waitForTimeout(ms);
  const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(900); };
  const login = async (email) => {
    await page.evaluate(() => localStorage.removeItem('mni-local-mock-session'));
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', email); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 0 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(1500);
  };
  const isi = async (path, ix, v) => { await page.fill(`.qc-it[data-ix="${ix}"] [data-qc="${path}"]`, String(v)); await wait(120); };
  try {
    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await login('admin@mni.local');
    await page.reload(); await wait(3000);
    // SPK 1 item: Cable Tray 10 btg, tebal 1.2 dari judul section, berat manual 5 kg/pcs
    await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(500);
    await page.fill('#ed-cust', 'PT Uji QC'); await page.fill('#ed-po', 'PO-QC-1');
    await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 NON FINISHING'); await page.dispatchEvent('#ed-h-0', 'change'); await wait(300);
    await page.fill('#ed-d-0-0', 'Cable Tray W100xH50xL3000'); await page.fill('#ed-q-0-0', '10'); await page.fill('#ed-u-0-0', 'Btg'); await page.fill('#ed-w-0-0', '5'); await wait(400);
    await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(2200);
    await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(400);
    const spkId = await page.evaluate(() => (S.spk.find((s) => s.customer === 'PT Uji QC') || {})._id);
    // produksi selesai lewat catatan hasil di langkah rute (Shearing, Punching, Bending) agar SPK masuk daftar QC
    await page.evaluate(async (id) => { const s = byId('spk', id); const rute = itemRute(s.items[0]); for (const wc of rute) await addDoc('produksi_log', { spk_id: id, item_idx: 0, item_desc: s.items[0].d, spk_no: String(s.no), customer: s.customer, wc, mesin: wc, operator: 'Uji', jenis: 'hasil', qty: 10, reject: 0, tgl: today(), mulai: new Date(Date.now() - 600000).toISOString(), selesai: new Date().toISOString(), menit: 10 }); }, spkId);
    await wait(1200);
    const off0 = await page.evaluate((id) => qcGerbang(id).wajib, spkId); await page.evaluate(async () => { await saveSetting({ qcWajib: true }); }); await wait(900);
    const gate0 = await page.evaluate(async (id) => { const g = qcGerbang(id); kirimForm(id); await new Promise((r) => setTimeout(r, 700)); document.getElementById('msub').click(); await new Promise((r) => setTimeout(r, 900)); const err = (document.getElementById('merr') || {}).textContent || ''; document.querySelector('#modal [data-act="closemodal"]')?.click(); return { wajib: g.wajib, ok: g.ok, err }; }, spkId);
    ok('QC-E00 QC wajib mati bawaan (alur kirim lama tidak berubah); setelah dinyalakan super admin, SPK yang belum diperiksa tidak bisa dibuatkan surat jalan customer', off0 === false && gate0.wajib && !gate0.ok && /QC wajib/.test(gate0.err), JSON.stringify(gate0));
    await go('#qc');
    const dasar = await page.evaluate((id) => { const k = document.querySelector('.qc-card[data-spk="' + id + '"]'); return { nav: [...document.querySelectorAll('#nav a')].some((a) => a.getAttribute('href') === '#qc'), ada: !!k, foot: k ? k.querySelector('footer').innerText : '' }; }, spkId);
    ok('QC-E01 menu QC ada; SPK yang selesai produksi muncul di Menunggu QC dengan tombol Mulai periksa', dasar.nav && dasar.ada && /Mulai periksa/.test(dasar.foot), JSON.stringify(dasar));
    await page.click('.qc-card[data-spk="' + spkId + '"] [data-act="qcperiksa"]'); await page.waitForSelector('.qc-it'); await wait(500);
    const std = await page.evaluate(() => document.querySelector('.qc-std').innerText.replace(/\s+/g, ' '));
    ok('QC-E02 standar terisi otomatis dari SPK (tebal dari judul section, W H L dari nama item)', /Thickness\s*1,2/.test(std) && /W\s*100/.test(std) && /H\s*50/.test(std) && /L\s*\/\s*R\s*3000/.test(std), std);
    await isi('proses.w', 0, 103); await wait(200);
    const ng1 = await page.evaluate(() => ({ jg: document.querySelector('[data-jg]').innerText, dv: document.querySelector('[data-dv="proses.w"]').innerText, ng: document.querySelector('.qc-it').classList.contains('ng') }));
    ok('QC-E03 W terukur 103 (standar 100, toleransi 2): selisih +3 merah, item NG', ng1.jg === 'NG' && /\+3/.test(ng1.dv) && ng1.ng, JSON.stringify(ng1));
    await isi('proses.w', 0, 101); await isi('proses.t', 0, 1.2); await isi('proses.h', 0, 50); await isi('proses.l', 0, 3001);
    await isi('akhir.t', 0, 1.25); await isi('akhir.w', 0, 100); await isi('akhir.h', 0, 50); await isi('akhir.l', 0, 3000);
    await page.click('.qc-it [data-act="qcjoint"][data-v="Ya"]'); await wait(150);
    const okj = await page.evaluate(() => document.querySelector('[data-jg]').innerText);
    ok('QC-E04 semua dalam toleransi, jointing Ya: judgment OK', okj === 'OK', okj);
    await isi('visual.scratch', 0, 2); await wait(150);
    const ng2 = await page.evaluate(() => document.querySelector('[data-jg]').innerText);
    await isi('repaired', 0, 2); await wait(150);
    const rep = await page.evaluate(() => document.querySelector('[data-jg]').innerText);
    ok('QC-E05 cacat scratch 2 belum diperbaiki = NG; setelah Repaired 2 = OK setelah repair', ng2 === 'NG' && rep === 'OK setelah repair', ng2 + ' -> ' + rep);
    const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await page.setInputFiles('.qc-it [data-qcfoto="0"]', { name: 'item.png', mimeType: 'image/png', buffer: PNG }); await wait(900);
    await page.setInputFiles('[data-qcfoto="-1"]', { name: 'umum.png', mimeType: 'image/png', buffer: PNG }); await wait(900);
    const thumbs = await page.evaluate(() => ({ item: document.querySelectorAll('#qc-fotos-0 .qc-th').length, umum: document.querySelectorAll('#qc-fotos-u .qc-th').length, sum: document.getElementById('qc-sum').innerText.replace(/\s+/g, ' ') }));
    ok('QC-E05b foto bukti: satu foto item dan satu foto umum tampil sebagai thumbnail dan terhitung di bilah ringkasan', thumbs.item === 1 && thumbs.umum === 1 && /2\s*foto bukti/.test(thumbs.sum), JSON.stringify(thumbs));
    await page.fill('[data-qcf="ppic"]', 'Budi PPIC'); await wait(150);
    await page.click('#tools [data-act="qcsimpan"]'); await wait(1500);
    const doc = await page.evaluate((id) => { const d = (S.qc || []).find((x) => x.spk === id); return d && { foto: (d.foto || []).length, fotoOk: (d.foto || []).every((x) => /^data:image\/jpeg/.test(x.data) && x.at && x.by), no: d.no, status: d.status, hasil: d.hasil, ins: d.inspector, ppic: d.ppic, n: d.baris.length, std: d.baris[0].std }; }, spkId);
    ok('QC-E06 hasil tersimpan: nomor QC/yyyy/mm/001, status Selesai, hasil Lulus, inspector dari akun, PPIC, standar ikut tersimpan', !!doc && /^QC\/\d{4}\/\d{2}\/001$/.test(doc.no) && doc.status === 'Selesai' && doc.hasil === 'Lulus' && doc.ins === 'Admin Lokal' && doc.ppic === 'Budi PPIC' && doc.std.t === 1.2 && doc.foto === 2 && doc.fotoOk, JSON.stringify(doc));
    const gate1 = await page.evaluate((id) => qcGerbang(id), spkId);
    ok('QC-E06b setelah QC Lulus gerbang terbuka (surat jalan dan penerimaan gudang diizinkan)', gate1.wajib && gate1.ok, JSON.stringify(gate1));
    const sj = await page.evaluate(async (id) => { const tunggu = (ms) => new Promise((r) => setTimeout(r, ms)); kirimForm(id); await tunggu(700); document.getElementById('msub').click(); await tunggu(1600); return { err: (document.getElementById('merr') || {}).textContent || '', n: S.kirim.filter((k) => k.spk === id && k.status !== 'Batal').length, qty: (S.kirim.find((k) => k.spk === id) || { items: [] }).items.reduce((a, i) => a + (+i.q || 0), 0) }; }, spkId);
    ok('QC-E06c alur nyata: setelah QC Lulus surat jalan customer berhasil dibuat dengan qty penuh (10 btg)', sj.n === 1 && sj.qty === 10 && !/QC wajib/.test(sj.err), JSON.stringify(sj));
    await page.evaluate(() => document.querySelector('#modal [data-act="closemodal"]')?.click());
    // dokumen
    const dok = await page.evaluate(async (id) => { const a = await qcPdf(id, false), c = await qcPdf(id, true), x = await qcXlsx(id); const h = (u) => String.fromCharCode(...u.slice(0, 4)); return { pdf: [a.length, h(a)], cert: [c.length, h(c)], xlsx: [x.length, h(x)] }; }, spkId);
    ok('QC-E07 Laporan QC (DCS) PDF, Sertifikat PDF, dan Excel dapat dibuat', dok.pdf[1] === '%PDF' && dok.pdf[0] > 4000 && dok.cert[1] === '%PDF' && dok.cert[0] > 3000 && dok.xlsx[1].startsWith('PK') && dok.xlsx[0] > 4000, JSON.stringify(dok));
    ok('QC-E07b setelah disimpan, toolbar inspeksi menampilkan PDF, Excel, dan Sertifikat', /PDF/.test(await page.evaluate(() => document.querySelector('#tools').innerText)) && /Sertifikat/.test(await page.evaluate(() => document.querySelector('#tools').innerText)));
    await page.click('#tools [data-act="qckembali"]'); await wait(500);
    await page.click('#tools [data-act="filt"][data-val="selesai"]'); await wait(600);
    const kartu = await page.evaluate((id) => { const k = document.querySelector('.qc-card[data-spk="' + id + '"]'); return k ? k.querySelector('footer').innerText : null; }, spkId);
    ok('QC-E08 SPK selesai QC menampilkan PDF, Excel, dan Sertifikat; KPI persentase lulus terisi', /PDF/.test(kartu || '') && /Excel/.test(kartu || '') && /Sertifikat/.test(kartu || '') && /100\s*%/.test(await page.evaluate(() => document.querySelector('.qc-kpis').innerText)), JSON.stringify({ kartu, kpi: await page.evaluate(() => document.querySelector('.qc-kpis').innerText.replace(/\s+/g, ' ')) }));
    // judgment NG tidak mendapat sertifikat
    const sert = await page.evaluate(async (id) => { const d = qcDoc(id); await updDoc('qc', d._id, { baris: d.baris.map((b) => ({ ...b, akhir: { ...b.akhir, w: 110 } })) }); await new Promise((r) => setTimeout(r, 800)); return qcModel(id).rk.sertifikat; }, spkId);
    ok('QC-E09 ukuran akhir di luar toleransi: hasil Belum lulus dan sertifikat tidak tersedia', sert === false);

    // acuan toleransi: profil NEMA VE 1-2017 mengubah penilaian tray lurus (lebar +5 mm lulus) dan tercatat di halaman inspeksi
    const nema = await page.evaluate(async (id) => {
      await saveSetting({ qcToleransi: { profil: 'nema', t: 0.15, w: 6, h: 10, l: 15 } }); await new Promise((r) => setTimeout(r, 700));
      qcBuka(id); await new Promise((r) => setTimeout(r, 500));
      const b = QCW.baris[0]; b.akhir = { t: 1.2, w: 105, h: 50, l: 3000 }; b.proses = { w: 105 };
      return { note: document.querySelector('.qc-note').innerText, jg: QCM().judgmentBaris(b, qcSet()).judgment, jgMni: QCM().judgmentBaris(b, { profil: 'mni' }).judgment };
    }, spkId);
    ok('QC-E09b profil NEMA VE 1-2017: acuan tercantum di halaman inspeksi, lebar +5 mm pada tray lurus OK (di profil MNI NG)', /NEMA VE 1-2017/.test(nema.note) && nema.jg !== 'NG' && nema.jgMni === 'NG', JSON.stringify({ jg: nema.jg, jgMni: nema.jgMni, acuan: /acuan: NEMA VE 1-2017/.test(nema.note) }));
    await page.evaluate(async () => { await saveSetting({ qcToleransi: { profil: 'mni', t: 0.15, w: 2, h: 2, l: 3 } }); F.qc.cur = null; QCW = null; });

    // peran QC
    await login('qc@mni.local');
    const qr = await page.evaluate(() => ({ nav: [...document.querySelectorAll('#nav a')].map((a) => a.getAttribute('href')), ubah: canMod('qc'), pengguna: viewOk('pengguna') }));
    ok('QC-E13 peran QC: menu QC tersedia dan boleh mengubah; tidak melihat Pengguna', qr.nav.includes('#qc') && qr.ubah && !qr.pengguna, JSON.stringify(qr));
    // halaman Standar & Panduan terbuka untuk peran QC, memuat NEMA VE 1 dan tabel toleransi dari pustaka yang sama dengan penilaian QC
    await go('#standar');
    const std1 = await page.evaluate(() => document.querySelector('#body').innerText.replace(/\s+/g, ' '));
    await page.click('#tools [data-val="ukuran"]'); await wait(500);
    const std2 = await page.evaluate(() => document.querySelector('#body').innerText.replace(/\s+/g, ' '));
    await page.click('#tools [data-val="material"]'); await wait(500);
    const std3 = await page.evaluate(() => document.querySelector('#body').innerText.replace(/\s+/g, ' '));
    ok('QC-E14 Standar & Panduan: peta standar (NEMA VE 1, IEC 61537, JIS G3131), toleransi NEMA (lebar ±6, kedalaman ±10, panjang ±15/±19), dan lapisan ASTM A123 dan ISO 1461 tampil', /Peta standar/.test(std1) && /IEC 61537/.test(std1) && /JIS G 3131/.test(std1) && /±6 mm/.test(std2) && /±10 mm/.test(std2) && /±15 mm/.test(std2) && /ASTM A123/.test(std3) && /EN ISO 1461/.test(std3), '');
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 400));
  }
  ok('QC-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
