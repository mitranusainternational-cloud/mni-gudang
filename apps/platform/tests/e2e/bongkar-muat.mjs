// Uji Bongkar Muat (T-217, mock): ceklis digital tersimpan, foto bukti (kompres, pilih cetak), centang dan lampiran foto
// muncul di surat jalan vendor dan customer (pratinjau, PDF, Excel), serta tata letak antrian saat data banyak.
const PNG1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
export async function runBongkarMuat(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  const dialogs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.accept(); });
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 400) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); }); await page.evaluate((h) => { location.hash = h; }, h); await wait(800); };
    const act = (name, data = {}) => page.evaluate(([n, d]) => { const b = document.createElement('div'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString();
      ['spk', 'produksi_log', 'vendor', 'kirim', 'bongkar', 'mutasi'].forEach((t) => { s.tables[t] = []; });
      s.tables.fg = [{ id: crypto.randomUUID(), created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', kategori: 'Cable Tray', type: 'STU', ukuran: '400x100', panjang: 3000, finishing: 'HDG', tebal: 1.8, satuan: 'Btg', stok_awal: 0, tgl_stok_awal: now.slice(0, 10), aktif: true, data: {} }];
      localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
    });
    await page.reload(); await wait(3500);

    // data: satu SPK stok, satu surat jalan vendor (3 item) dan satu surat jalan customer (2 item), masing-masing dengan catatan bongkar muat
    const ids = await page.evaluate(async () => {
      await spkStokBuat([{ item: S.fg[0]._id, q: 20 }], {}); await new Promise((r) => setTimeout(r, 1200));
      const s = S.spk.find((x) => x.stokReq); await publishDraft(s._id);
      const t = today();
      await addDoc('vendor', { spk: s._id, tgl: t, vendor: 'Vendor Uji', proses: 'HDG', noSJ: 'SJV-BM-1', status: 'Di Vendor', items: [{ d: 'Item A', q: 5, u: 'Btg' }, { d: 'Item B', q: 6, u: 'Btg' }, { d: 'Item C', q: 7, u: 'Btg' }] });
      await addDoc('kirim', { spk: s._id, customer: 'Cust Uji', tgl: t, noSJ: '26/XI/MNI/901', kendaraan: 'Truk', nopol: 'B 1111 UJI', driver: 'Budi', status: 'Disiapkan', items: [{ d: 'Item X', q: 2, u: 'Btg' }, { d: 'Item Y', q: 3, u: 'Btg' }] });
      await new Promise((r) => setTimeout(r, 600));
      const v = S.vendor.find((x) => x.noSJ === 'SJV-BM-1'), k = S.kirim.find((x) => x.noSJ === '26/XI/MNI/901');
      await addDoc('bongkar', { jenis: 'Loading', muatan: 'Barang Setengah Jadi', pihak: 'Vendor Uji', ref: '', kendaraan: 'Truk', nopol: 'B 1111 UJI', driver: 'Budi', tgl: t, jamMasuk: '08:00', jamMulai: '08:10', jamSelesai: '', status: 'Proses', ket: '', link: { c: 'vendor', id: v._id, noSJ: 'SJV-BM-1' } });
      await addDoc('bongkar', { jenis: 'Loading', muatan: 'Barang Jadi', pihak: 'Cust Uji', ref: '', kendaraan: 'Truk', nopol: 'B 2222 UJI', driver: 'Budi', tgl: t, jamMasuk: '09:00', jamMulai: '09:10', jamSelesai: '', status: 'Proses', ket: '', link: { c: 'kirim', noSJ: '26/XI/MNI/901' } });
      await new Promise((r) => setTimeout(r, 600));
      return { v: v._id, k: k._id, bv: S.bongkar.find((b) => b.link.c === 'vendor')._id, bk: S.bongkar.find((b) => b.link.c === 'kirim')._id };
    });

    // BM-01 drawer: ceklis kosong, status 0 dari 3
    await go('#bongkar-muat'); await act('openbm', { id: ids.bv }); await page.waitForSelector('.bm-ck'); await wait(500);
    const awal = await page.evaluate(() => ({ n: document.querySelectorAll('.bm-ck').length, on: [...document.querySelectorAll('.bm-ck')].filter((x) => x.checked).length, st: document.querySelector('[id^="bm-ck-status-"]').innerText.replace(/\s+/g, ' ') }));
    ok('BM-01 drawer menampilkan 3 centang kosong dan status "0 dari 3 item dicek"', awal.n === 3 && awal.on === 0 && /0 dari 3/.test(awal.st), JSON.stringify(awal));

    // BM-02 centang tersimpan (bukan hanya di layar) dan tetap ada setelah muat ulang halaman
    await page.click('#bmck-0'); await wait(500); await page.click('#bmck-2'); await wait(600);
    const tersimpan = await page.evaluate((id) => { const b = byId('bongkar', id); return { keys: Object.keys(b.ceklis || {}).sort().join(','), by: !!(b.ceklis && b.ceklis[0] && b.ceklis[0].at), st: bmCekStat(b) }; }, ids.bv);
    await page.reload(); await wait(3500); await go('#bongkar-muat'); await act('openbm', { id: ids.bv }); await page.waitForSelector('.bm-ck'); await wait(500);
    const setelah = await page.evaluate(() => [...document.querySelectorAll('.bm-ck')].map((x) => x.checked ? 1 : 0).join(''));
    ok('BM-02 centang tersimpan di catatan (butir 0 dan 2, ada waktu) dan tetap tercentang setelah halaman dimuat ulang', tersimpan.keys === '0,2' && tersimpan.by && tersimpan.st.done === 2 && setelah === '101', JSON.stringify({ tersimpan, setelah }));

    // BM-03 kartu antrian memuat lencana ceklis
    await go('#bongkar-muat'); await wait(500);
    const kartu = await page.evaluate((id) => document.querySelector(`.bm-card[data-id="${id}"]`)?.innerText.replace(/\s+/g, ' ') || '', ids.bv);
    ok('BM-03 kartu di antrian menampilkan lencana "Cek 2/3"', /Cek 2\/3/.test(kartu), kartu.slice(0, 160));

    // BM-04 foto: unggah berkas gambar nyata lewat input, tersimpan sebagai JPEG terkompres
    await act('openbm', { id: ids.bv }); await page.waitForSelector('.bm-foto-in', { state: 'attached' }); await wait(400);
    await page.setInputFiles('.bm-foto-in >> nth=1', [{ name: 'bukti1.png', mimeType: 'image/png', buffer: PNG1 }, { name: 'bukti2.png', mimeType: 'image/png', buffer: PNG1 }]);
    await wait(1800);
    const foto = await page.evaluate((id) => { const b = byId('bongkar', id); return { n: (b.foto || []).length, jpeg: (b.foto || []).every((x) => /^data:image\/jpeg/.test(x.data)), cetak: (b.foto || []).every((x) => x.cetak !== false), tampil: document.querySelectorAll('.bm-foto img').length }; }, ids.bv);
    ok('BM-04 unggah 2 foto sekaligus: tersimpan sebagai JPEG, ikut dicetak secara bawaan, tampil di galeri drawer', foto.n === 2 && foto.jpeg && foto.cetak && foto.tampil === 2, JSON.stringify(foto));

    // BM-05 foto besar dikecilkan ke sisi terpanjang 1280 px
    const besar = await page.evaluate(async () => { const cv = document.createElement('canvas'); cv.width = 3000; cv.height = 2000; const x = cv.getContext('2d'); x.fillStyle = '#39c'; x.fillRect(0, 0, 3000, 2000); const bl = await new Promise((r) => cv.toBlob(r, 'image/png')); const r = await FOTO.baca(new File([bl], 'besar.png', { type: 'image/png' })); return { w: r.w, h: r.h }; });
    ok('BM-05 foto 3000x2000 dikompres otomatis menjadi 1280x853', besar.w === 1280 && besar.h === 853, JSON.stringify(besar));

    // BM-06 pilih foto yang ikut dicetak (jumlah ditentukan pengguna)
    const f2 = await page.evaluate((id) => byId('bongkar', id).foto[1].id, ids.bv);
    await page.evaluate(() => { document.querySelectorAll('[data-act="bmfotocetak"]')[1].click(); }); await wait(700);
    const cetak = await page.evaluate((id) => { const b = byId('bongkar', id); return { cetak: b.foto.map((x) => x.cetak !== false), terpilih: bmFotoCetak(b).length }; }, ids.bv);
    ok('BM-06 menonaktifkan "Sertakan di surat jalan" pada foto ke-2: hanya 1 dari 2 foto ikut dicetak', cetak.terpilih === 1 && cetak.cetak[0] === true && cetak.cetak[1] === false, JSON.stringify(cetak));

    // BM-07 selesai dengan ceklis belum lengkap meminta konfirmasi
    dialogs.length = 0;
    await act('bmstep', { id: ids.bv, to: 'Selesai' }); await wait(800);
    ok('BM-07 menyelesaikan bongkar muat saat baru 2 dari 3 item dicek meminta konfirmasi', dialogs.some((m) => /2 dari 3/.test(m)), dialogs.join(' | '));

    // BM-08 model surat jalan vendor: kolom Cek, centang, dan foto terpilih
    const sjv = await page.evaluate((id) => { const m = docModel('sjv', id); return { cols: m.tables[0].cols.map((c) => c[0]).join(','), cek: m.tables[0].rows.map((r) => r[r.length - 1]).join('|'), foto: m.foto.length, note: /2 dari 3/.test(m.note) }; }, ids.v);
    ok('BM-08 surat jalan vendor memuat kolom Cek (✓ pada butir 1 dan 3), 1 foto terpilih, dan catatan ceklis', /Cek$/.test(sjv.cols) && sjv.cek === '✓||✓' && sjv.foto === 1 && sjv.note, JSON.stringify(sjv));

    // BM-09 pratinjau surat jalan vendor di drawer vendor
    await go('#vendor'); await act('openvendor', { id: ids.v }); await wait(900);
    const prev = await page.evaluate(() => { const p = document.querySelector('#drawer .sj-prev'); return { th: /cek/i.test(p.querySelector('.sj-prev-tbl thead').innerText), tick: (p.querySelector('.sj-prev-tbl tbody').innerText.match(/✓/g) || []).length, img: p.querySelectorAll('.bm-prev-foto img').length, judul: /LAMPIRAN BUKTI BONGKAR MUAT/.test(p.innerText) }; });
    ok('BM-09 pratinjau surat jalan vendor menampilkan kolom Cek, 2 centang ✓, dan lampiran 1 foto', prev.th && prev.tick === 2 && prev.img === 1 && prev.judul, JSON.stringify(prev));

    // BM-10 PDF dan Excel surat jalan vendor jadi (dengan lampiran foto), lebih besar daripada tanpa foto
    const out = await page.evaluate(async (id) => {
      const m = docModel('sjv', id); const pdf = await docPdf(m), xl = await docXlsx(m);
      const m0 = { ...m, foto: [] }; const pdf0 = await docPdf(m0), xl0 = await docXlsx(m0);
      const head = (u) => String.fromCharCode(...u.slice(0, 4));
      return { pdf: head(pdf), xl: head(xl), pdfB: pdf.length, pdf0B: pdf0.length, xlB: xl.length, xl0B: xl0.length };
    }, ids.v);
    ok('BM-10 PDF dan Excel surat jalan vendor terbentuk dan memuat lampiran foto (ukuran bertambah)', out.pdf === '%PDF' && out.xl.startsWith('PK') && out.pdfB > out.pdf0B && out.xlB > out.xl0B, JSON.stringify(out));

    // BM-11 surat jalan customer: ceklis dan foto dari catatan bongkar muat customer
    await go('#bongkar-muat'); await act('openbm', { id: ids.bk }); await page.waitForSelector('.bm-ck'); await wait(500);
    await page.click('#bmck-1'); await wait(600);
    await page.setInputFiles('.bm-foto-in >> nth=1', [{ name: 'k1.png', mimeType: 'image/png', buffer: PNG1 }]); await wait(1500);
    const sjc = await page.evaluate(async (id) => {
      const m = docModel('sjc', id); const pdf = await sjPdf(m.sj), xl = await sjXlsx(m.sj);
      const m0 = { ...m.sj, foto: [], cek: null }; const pdf0 = await sjPdf(m0);
      return { cek: JSON.stringify(m.sj.cek), foto: m.sj.foto.length, pdf: String.fromCharCode(...pdf.slice(0, 4)), xl: String.fromCharCode(...xl.slice(0, 2)), lebih: pdf.length > pdf0.length };
    }, ids.k);
    ok('BM-11 surat jalan customer: centang butir 2 dan 1 foto terbawa ke PDF dan Excel', sjc.cek === '[false,true]' && sjc.foto === 1 && sjc.pdf === '%PDF' && sjc.xl === 'PK' && sjc.lebih, JSON.stringify(sjc));

    // BM-12 surat jalan tanpa catatan bongkar muat tidak berubah (tanpa kolom Cek, tanpa foto)
    const polos = await page.evaluate(async () => { await addDoc('vendor', { spk: S.spk[0]._id, tgl: today(), vendor: 'Vendor Lain', proses: 'ELG', noSJ: 'SJV-BM-2', status: 'Di Vendor', items: [{ d: 'Z', q: 1, u: 'Btg' }] }); await new Promise((r) => setTimeout(r, 500)); const v = S.vendor.find((x) => x.noSJ === 'SJV-BM-2'); const m = docModel('sjv', v._id); return { cols: m.tables[0].cols.length, foto: m.foto.length }; });
    ok('BM-12 surat jalan vendor tanpa catatan bongkar muat tetap 5 kolom dan tanpa foto', polos.cols === 5 && polos.foto === 0, JSON.stringify(polos));

    // BM-13 tata letak saat data banyak: 14 selesai, hanya 8 tampil, bisa dilihat semua, dan bisa dicari
    await page.evaluate(async () => { for (let i = 0; i < 14; i++) await addDoc('bongkar', { jenis: 'Unloading', muatan: 'Bahan Baku', pihak: 'Supplier ' + i, ref: '', kendaraan: 'Truk', nopol: 'B ' + (3000 + i) + ' ZZ', driver: '', tgl: today(), jamMasuk: '10:00', jamMulai: '10:05', jamSelesai: '10:40', status: 'Selesai', ket: '' }); });
    await wait(900); await go('#bongkar-muat'); await wait(500);
    const selesai = async () => page.evaluate(() => { const c = [...document.querySelectorAll('.bm-kanban .col')].find((x) => /^Selesai/.test(x.querySelector('h3').innerText)); return c.querySelectorAll('.bm-card').length; });
    const n8 = await selesai();
    await page.evaluate(() => document.querySelector('[data-act="filt"][data-key="all"]').click()); await wait(500);
    const nAll = await selesai();
    await page.fill('#q-bongkar-muat', '3007'); await wait(500);
    const nCari = await page.evaluate(() => document.querySelectorAll('.bm-kanban .bm-card').length);
    await page.fill('#q-bongkar-muat', ''); await wait(300);
    ok('BM-13 kolom Selesai menampilkan 8 terbaru dari 15 (14 baru + 1 yang diselesaikan di BM-07), "Tampilkan semua" memperlihatkan 15, pencarian plat 3007 menyisakan 1 kartu', n8 === 8 && nAll === 15 && nCari === 1, JSON.stringify({ n8, nAll, nCari }));

    // BM-14 hapus foto
    await act('openbm', { id: ids.bv }); await wait(700);
    await page.evaluate(() => document.querySelector('[data-act="bmfotodel"]').click()); await wait(800);
    ok('BM-14 hapus foto mengurangi jumlah foto dari 2 menjadi 1', await page.evaluate((id) => byId('bongkar', id).foto.length === 1, ids.bv));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('BM-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
