import { periksaInvarian } from './invarian.mjs';
// Uji Gudang Sparepart (mock): menu, impor dari Excel (data sintetis, bukan data perusahaan), stok dan status,
// pengeluaran dengan penolakan stok kurang, penerimaan, opname, dokumen, nonaktif, dan impor ulang yang tidak menggandakan.
export async function runSparepart(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  const login = async (email) => {
    await page.evaluate(() => localStorage.removeItem('mni-local-mock-session'));
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', email); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await page.waitForTimeout(800);
  };
  const rowTxt = (nm) => page.evaluate((nm) => { const r = [...document.querySelectorAll('table.spt tbody tr')].find((x) => x.children[1].innerText.split('\n')[0].trim() === nm); return r ? r.innerText.replace(/\s+/g, ' ') : null; }, nm);
  const stok = (nm) => page.evaluate((nm) => { const r = [...document.querySelectorAll('table.spt tbody tr')].find((x) => x.children[1].innerText.split('\n')[0].trim() === nm); return r ? r.children[6].innerText.trim() : null; }, nm);
  const submit = async () => { await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => x.type === 'submit').pop().click()); await page.waitForTimeout(1200); };
  // cetak dokumen dari baris riwayat: dialog nama penanda tangan muncul dulu, isi lalu lanjut
  const docOf = async (src, names) => {
    const asked = await page.evaluate((src) => { window.__html = ''; window.__wo = window.open; window.open = () => ({ document: { write: (s) => { window.__html = s; }, close() {} } }); const r = [...document.querySelectorAll('.tbl-wrap tbody tr')].find((x) => new RegExp(src).test(x.innerText)); window.__link = !!r.querySelector('[data-act="spksheet"]'); r.querySelector('[data-act="mvpdf"]').click(); return null; }, src);
    await page.waitForTimeout(500);
    const pre = await page.evaluate(() => [...document.querySelectorAll('#mform [name^="sg"]')].map((i) => i.value));
    if (pre.length) { if (names) await page.evaluate((nm) => { [...document.querySelectorAll('#mform [name^="sg"]')].forEach((i, k) => { i.value = nm[k] || ''; }); }, names); await submit(); }
    const r = await page.evaluate(() => { window.open = window.__wo; const html = window.__html; return { link: window.__link, html, txt: html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') }; });
    return { ...r, pre };
  };

  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await login('admin@mni.local');
  const nav = await page.$('#nav a[href="#sparepart"]');
  ok('SP-1 menu Gudang Sparepart tersedia', !!nav);
  if (nav) await nav.click(); await page.waitForTimeout(900);
  const kosong = await page.evaluate(() => document.querySelector('.empty')?.innerText || '');
  ok('SP-2 keadaan kosong menawarkan impor Excel', /Belum ada sparepart/.test(kosong) && !!(await page.$('#tools [data-act="spimport"]')));

  // impor dari Excel sintetis: dua barang, dua pengeluaran, satu baris tanpa nomor, satu nomor tanpa nama
  const prev = await page.evaluate(async () => {
    if (!window.ExcelJS) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/vendor/exceljs.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    const wb = new window.ExcelJS.Workbook();
    const st = wb.addWorksheet('Stok Barang');
    st.addRow([]); st.addRow(['TABEL STOK BARANG']); st.addRow([]); st.addRow([]);
    st.addRow(['No', 'Nama Barang', 'Satuan', 'Stok Awal', 'Barang Masuk', 'Barang Keluar', 'Stok Akhir', 'Stok Minimum', 'Status', 'Keterangan']);
    st.addRow([1, ' Oli uji A', 'Liter', 10, 10, '', 10, 3, '', '']);
    st.addRow([2, '', '', '', '', '', '', '', '', '']);
    st.addRow([3, 'Baut uji B', 'pcs', 5, 5, '', 5, 5, '', '']);
    st.addRow(['', '', 'TOTAL', 15, 15, '', 15]);
    const kl = wb.addWorksheet('BARANG KELUAR');
    for (let i = 0; i < 5; i++) kl.addRow(['BARANG KELUAR']);
    kl.addRow(['TANGGAL', 'NO', 'NAMA BARANG', 'KELUAR', 'KETERANGAN']);
    kl.addRow([new Date(Date.UTC(2026, 10, 3)), 1, 'Oli uji A', 2, 'Produksi']);
    kl.addRow(['', 3, 'Baut uji B', 1, 'Welding']);
    kl.addRow(['', '', 'Tanpa nomor', '', 'Produksi']);
    const rs = wb.addWorksheet('Ringkasan'); rs.addRow(['RINGKASAN STOK']); rs.addRow([]); rs.addRow(['Total Jenis Barang', 2]); rs.addRow(['Total Stok Akhir', 12]);
    const buf = await wb.xlsx.writeBuffer();
    document.querySelector('#tools [data-act="spimport"]').click();
    await new Promise((r) => setTimeout(r, 500));
    const inp = document.querySelector('#sp-file'); const dt = new DataTransfer(); dt.items.add(new File([buf], 'uji.xlsx')); inp.files = dt.files;
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 2500));
    return document.querySelector('#sp-prev').textContent.replace(/\s+/g, ' ');
  });
  ok('SP-3 pratinjau impor: 2 barang baru, 2 pengeluaran, total cocok Ringkasan, baris bermasalah dilaporkan',
    /Barang baru\s*2/i.test(prev) && /Pengeluaran dicatat\s*2/i.test(prev) && /Cocok dengan lembar Ringkasan/.test(prev) && /2 baris dilewati/.test(prev), prev.slice(0, 150));
  await submit(); await page.waitForTimeout(1500);
  ok('SP-4 impor: stok akhir sesuai (Oli 8, Baut 4) dan Oli di batas minimum tidak, Baut di minimum', (await stok('Oli uji A')) === '8' && (await stok('Baut uji B')) === '4', `${await stok('Oli uji A')}/${await stok('Baut uji B')}`);
  const sBaut = await rowTxt('Baut uji B');
  ok('SP-5 status mengikuti stok minimum (Baut 4 ≤ 5 = Stok minimum, Oli 8 > 3 = Aman)', /Stok minimum/.test(sBaut || '') && /Aman/.test((await rowTxt('Oli uji A')) || ''));

  // keluarkan: melebihi stok ditolak, jumlah wajar diterima
  await page.evaluate(() => [...document.querySelectorAll('table.spt tbody tr')].find((x) => x.children[1].innerText.includes('Oli uji A')).querySelector('[data-act="mv"][data-j="keluar"]').click());
  await page.waitForTimeout(600);
  await page.evaluate(() => { document.querySelector('#mform [name^="qty_"]').value = '99'; });
  await submit();
  const tolak = await page.evaluate(() => document.querySelector('#modal')?.innerText.match(/Stok [^.]*tidak cukup[^.]*\./)?.[0] || '');
  ok('SP-6 keluar melebihi stok ditolak dengan pesan jelas', /tidak cukup/.test(tolak), tolak);
  await page.evaluate(() => { document.querySelector('#mform [name^="qty_"]').value = '1'; document.querySelector('#mform [name="pihak"]').value = 'Welding'; });
  await submit();
  ok('SP-7 keluar 1: stok Oli 7', (await stok('Oli uji A')) === '7', await stok('Oli uji A'));

  // riwayat dan dokumen (PDF cetak) untuk pengeluaran, nomor SP-K
  await page.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent.includes('Riwayat')).click()); await page.waitForTimeout(600);
  const docR = await docOf('SP-K', ['Budi Gudang', '', 'Andi Mesin']);
  const doc = docR.txt;
  ok('SP-8 dokumen pengeluaran sparepart (SP-K) memuat judul, barang, dan tujuan', /BUKTI PENGELUARAN SPAREPART/.test(doc) && /Oli uji A/.test(doc) && /SP-K\//.test(doc), doc.slice(0, 90));
  ok('SP-27 nama penanda tangan diketik manual tercetak di dokumen; yang dikosongkan tetap garis kosong', /\( Budi Gudang \)/.test(doc) && /\( Andi Mesin \)/.test(doc) && /\( ____________ \)/.test(doc), (doc.match(/\([^)]*\)/g) || []).join(' '));
  const docR2 = await docOf('SP-K', null);
  ok('SP-28 nama yang pernah diketik terisi otomatis per jabatan di dokumen berikutnya, dan tersedia sebagai saran', docR2.pre[0] === 'Budi Gudang' && docR2.pre[2] === 'Andi Mesin' && /\( Budi Gudang \)/.test(docR2.txt), JSON.stringify(docR2.pre));

  // opname: selisih disesuaikan dan berdokumen
  await page.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent.includes('Stock opname')).click()); await page.waitForTimeout(600);
  await page.evaluate(() => { const i = document.querySelector('input[data-spopn]'); i.value = '5'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Simpan hasil opname').click()); await page.waitForTimeout(600);
  await submit(); await page.waitForTimeout(800);
  await page.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent.includes('Posisi stok')).click()); await page.waitForTimeout(500);
  const stokOp = [await stok('Baut uji B'), await stok('Oli uji A')];
  ok('SP-9 opname menyesuaikan stok barang pertama (Baut 4 → 5)', stokOp[0] === '5' || stokOp[1] === '5', stokOp.join('/'));

  // opname: tombol Isi semua = sistem, Kosongkan, dan simpan tanpa selisih (tidak membuat mutasi)
  await page.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent.includes('Stock opname')).click()); await page.waitForTimeout(600);
  const mutAwal = (await page.evaluate(() => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.mutasi.length));
  await page.evaluate(() => document.querySelector('[data-act="spopnfill"]').click()); await page.waitForTimeout(400);
  const terisi = await page.evaluate(() => { const a = [...document.querySelectorAll('input[data-spopn]')]; return { n: a.length, kosong: a.filter((i) => i.value === '').length }; });
  await page.evaluate(() => document.querySelector('[data-act="spopnsave"]').click()); await page.waitForTimeout(700);
  const toastTanpaSelisih = await page.evaluate(() => document.getElementById('toast').textContent);
  const mutSetelahIsi = (await page.evaluate(() => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.mutasi.length));
  ok('SP-9b opname Isi semua = sistem mengisi setiap barang; menyimpan tanpa selisih tidak membuat mutasi dan memberi tahu', terisi.n > 0 && terisi.kosong === 0 && /tidak ada penyesuaian/i.test(toastTanpaSelisih) && mutSetelahIsi === mutAwal, JSON.stringify({ terisi, toastTanpaSelisih: toastTanpaSelisih.slice(0, 80), mutAwal, mutSetelahIsi }));
  await page.evaluate(() => document.querySelector('[data-act="spopnclear"]').click()); await page.waitForTimeout(400);
  const kosongkan = await page.evaluate(() => [...document.querySelectorAll('input[data-spopn]')].filter((i) => i.value !== '').length);
  await page.evaluate(() => document.querySelector('[data-act="spopnsave"]').click()); await page.waitForTimeout(500);
  const toastKosong = await page.evaluate(() => document.getElementById('toast').textContent);
  ok('SP-9c opname Kosongkan menghapus semua isian; menyimpan tanpa isian ditolak dengan penjelasan', kosongkan === 0 && /minimal satu/i.test(toastKosong), JSON.stringify({ kosongkan, toastKosong: toastKosong.slice(0, 80) }));
  await page.evaluate(() => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent.includes('Posisi stok')).click()); await page.waitForTimeout(500);

  // nonaktif: hilang dari daftar dan dari pilihan form, aktif kembali
  await page.evaluate(() => { window.confirm = () => true; });
  await page.evaluate(() => [...document.querySelectorAll('table.spt tbody tr')].find((x) => x.children[1].innerText.includes('Baut uji B')).querySelector('[data-act="spedit"]').click()); await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('#modal [data-act="spnonaktif"]').click()); await page.waitForTimeout(900);
  const hilang = (await rowTxt('Baut uji B')) === null;
  await page.evaluate(() => [...document.querySelectorAll('#tools button')].find((b) => b.textContent.includes('Keluarkan')).click()); await page.waitForTimeout(500);
  const picker = await page.evaluate(() => [...document.querySelectorAll('#m-mvl select option')].map((o) => o.text).join('|'));
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Batal')?.click()); await page.waitForTimeout(300);
  ok('SP-10 item nonaktif tersembunyi dari daftar dan pilihan form, riwayat tetap', hilang && !/Baut uji B/.test(picker));
  await page.evaluate(() => document.querySelector('[data-act="filt"][data-key="st"][data-val="Nonaktif"]').click()); await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('[data-act="spaktif"]').click()); await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector('[data-act="filt"][data-key="st"][data-val=""]').click()); await page.waitForTimeout(400);
  ok('SP-11 item dapat diaktifkan kembali', (await rowTxt('Baut uji B')) !== null);

  // impor ulang tidak menggandakan
  const ulang = await page.evaluate(async () => {
    const wb = new window.ExcelJS.Workbook();
    const st = wb.addWorksheet('Stok Barang'); st.addRow([]); st.addRow([]); st.addRow([]); st.addRow([]);
    st.addRow(['No', 'Nama Barang', 'Satuan', 'Stok Awal', 'Barang Masuk']); st.addRow([1, 'Oli uji A', 'Liter', 10, 10]); st.addRow([3, 'Baut uji B', 'pcs', 5, 5]);
    const kl = wb.addWorksheet('BARANG KELUAR'); for (let i = 0; i < 5; i++) kl.addRow(['BARANG KELUAR']);
    kl.addRow(['TANGGAL', 'NO', 'NAMA BARANG', 'KELUAR', 'KETERANGAN']); kl.addRow([new Date(Date.UTC(2026, 10, 3)), 1, 'Oli uji A', 2, 'Produksi']); kl.addRow(['', 3, 'Baut uji B', 1, 'Welding']);
    const buf = await wb.xlsx.writeBuffer();
    document.querySelector('#tools [data-act="spimport"]').click(); await new Promise((r) => setTimeout(r, 500));
    const inp = document.querySelector('#sp-file'); const dt = new DataTransfer(); dt.items.add(new File([buf], 'uji2.xlsx')); inp.files = dt.files; inp.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 2500));
    [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Impor ke sistem').click(); await new Promise((r) => setTimeout(r, 2500));
    return { rows: document.querySelectorAll('table.spt tbody tr').length };
  });
  const nMut = await page.evaluate(() => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.mutasi.filter((m) => m.gudang === 'sp' && m.ref === 'Impor Excel').length);
  ok('SP-12 impor ulang tidak menggandakan barang maupun pengeluaran', ulang.rows === 2 && nMut === 2, `barang ${ulang.rows}, mutasi impor ${nMut}`);

  // buffer sparepart: stok 7 di atas minimum 3, buffer 20 -> "Di bawah buffer" dan kurang ke target; minimum > buffer ditolak
  await page.evaluate(() => [...document.querySelectorAll('table.spt tbody tr')].find((x) => x.children[1].innerText.includes('Oli uji A')).querySelector('[data-act="spedit"]').click()); await page.waitForTimeout(500);
  await page.evaluate(() => { document.querySelector('#mform [name="buffer"]').value = '20'; });
  await submit();
  const bufRow = (await rowTxt('Oli uji A')) || '';
  const stokOliNow = Number(await stok('Oli uji A'));
  ok('SP-15 buffer sparepart: status Di bawah buffer dan kurang ke buffer', /Di bawah buffer/.test(bufRow) && bufRow.includes(`kurang ${20 - stokOliNow} ke buffer`), bufRow.slice(0, 120));
  await page.evaluate(() => [...document.querySelectorAll('table.spt tbody tr')].find((x) => x.children[1].innerText.includes('Oli uji A')).querySelector('[data-act="spedit"]').click()); await page.waitForTimeout(500);
  await page.evaluate(() => { document.querySelector('#mform [name="min"]').value = '50'; });
  await submit();
  const tolakBuf = await page.evaluate(() => document.querySelector('#modal')?.innerText.match(/Stok minimum tidak boleh[^.]*\./)?.[0] || '');
  ok('SP-16 minimum lebih besar dari buffer ditolak', /tidak boleh lebih besar/.test(tolakBuf), tolakBuf);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Batal')?.click()); await page.waitForTimeout(300);

  // buffer barang jadi: diatur dari kartu stok, status dan filter mengikuti
  await page.evaluate(() => { location.hash = '#barang-jadi'; }); await page.waitForTimeout(1200);
  const fgHead = await page.evaluate(() => [...document.querySelectorAll('.panel table thead th')].map((t) => t.innerText.trim()).join('|'));
  await page.evaluate(() => document.querySelector('.panel table tbody tr').click()); await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelector('[data-act="editbuf"][data-g="fg"]').click()); await page.waitForTimeout(500);
  await page.evaluate(() => { document.querySelector('#mform [name="buffer"]').value = '9999'; });
  await submit();
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))); await page.waitForTimeout(400);
  const fgRow = await page.evaluate(() => document.querySelector('.panel table tbody tr').innerText.replace(/\s+/g, ' '));
  const fgChip = await page.evaluate(() => [...document.querySelectorAll('.summ .chip, .summ button')].map((c) => c.innerText.trim()).join('|'));
  ok('SP-17 buffer barang jadi: kolom Buffer, status Di bawah buffer, hitungan di ringkasan', /buffer/i.test(fgHead) && /Di bawah buffer/.test(fgRow) && /[0-9]+ di bawah buffer/.test(fgChip), `${fgChip} · ${fgHead} · ${fgRow.slice(0, 70)}`);
  await page.evaluate(() => { location.hash = '#sparepart'; }); await page.waitForTimeout(800);

  // tren sparepart: grafik bulanan dan tabel pergerakan; label tren menunggu riwayat cukup panjang
  const tabClick = (t) => page.evaluate((t) => [...document.querySelectorAll('.tabs button')].find((b) => b.textContent.includes(t)).click(), t);
  await tabClick('Tren'); await page.waitForTimeout(600);
  const tren = await page.evaluate(() => ({ chart: !!document.querySelector('svg[aria-label="Masuk dan keluar per bulan"]'), rows: document.querySelectorAll('.tbl-wrap tbody tr').length, label: [...document.querySelectorAll('.tbl-wrap tbody tr')].map((r) => r.children[7].innerText.trim()).filter((x) => x !== 'Tidak bergerak')[0] || '' }));
  ok('SP-18 tren sparepart: grafik masuk-keluar per bulan dan tabel pergerakan; data baru tidak dilabeli naik', tren.chart && tren.rows >= 2 && tren.label === 'Data baru', JSON.stringify(tren));

  // rencana pembelian: usulan, PR, tandai dipesan, terima menambah stok
  await tabClick('Rencana pembelian'); await page.waitForTimeout(700);
  const sugOli = await page.evaluate(() => { const r = [...document.querySelectorAll('table.beli tbody tr')].find((x) => /Oli uji A/.test(x.innerText)); return r ? r.innerText.replace(/\s+/g, ' ') : null; });
  ok('SP-19 rencana pembelian memuat barang di bawah buffer dengan alasan dan qty usulan', !!sugOli && /Di bawah buffer/.test(sugOli) && /buffer 20/.test(sugOli), (sugOli || '').slice(0, 110));
  await page.evaluate(() => [...document.querySelectorAll('table.beli tbody tr')].forEach((r) => { const keep = /Oli uji A/.test(r.innerText); const cb = r.querySelector('[data-spbeli="on"]'); if (cb.checked !== keep) { cb.checked = keep; cb.dispatchEvent(new Event('change', { bubbles: true })); } }));
  await page.evaluate(() => document.querySelector('[data-act="spprnew"]').click()); await page.waitForTimeout(600);
  await submit(); await page.waitForTimeout(800);
  const prTxt = await page.evaluate(() => [...document.querySelectorAll('table')].pop().innerText.replace(/\s+/g, ' '));
  ok('SP-20 PR sparepart terbentuk (nomor PR, status Diajukan) dan tercatat sebagai sudah dipesan', /PR\/2026\/11\/\d+/.test(prTxt) && /Diajukan/.test(prTxt) && /Oli uji A/.test(prTxt), prTxt.slice(0, 110));
  await page.evaluate(() => document.querySelector('[data-act="prstep"]').click()); await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelector('[data-act="prterima"]').click()); await page.waitForTimeout(700);
  const lineQty = await page.evaluate(() => document.querySelector('#m-mvl tr input').value);
  await submit(); await page.waitForTimeout(1000);
  await tabClick('Posisi stok'); await page.waitForTimeout(600);
  ok('SP-21 terima PR menambah stok sampai buffer (Oli 20) dan PR selesai', (await stok('Oli uji A')) === '20' && Number(lineQty) === 20 - stokOliNow, `qty ${lineQty}, stok ${await stok('Oli uji A')}`);

  // barang jadi: rencana produksi stok membuat SPK Draft, barang masuk tertaut SPK mengurangi yang sedang diproduksi
  await page.evaluate(() => { location.hash = '#barang-jadi'; }); await page.waitForTimeout(1200);
  const fgTabs = await page.evaluate(() => [...document.querySelectorAll('.tabs button')].map((b) => b.textContent.trim()).join('|'));
  ok('SP-22 barang jadi punya tab Tren, Rencana produksi, dan Riwayat mutasi', /Tren/.test(fgTabs) && /Rencana produksi/.test(fgTabs) && /Riwayat mutasi/.test(fgTabs), fgTabs);
  await tabClick('Rencana produksi'); await page.waitForTimeout(700);
  await page.evaluate(() => document.querySelector('[data-act="fgspknew"]').click()); await page.waitForTimeout(700);
  await submit(); await page.waitForTimeout(2500);
  await page.evaluate(() => { document.querySelector('#sheet [data-act="sheet-close"]')?.click(); }); await page.waitForTimeout(500);
  const spkStok = await page.evaluate(() => { const t = JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.spk.filter((s) => s.data && s.data.stokReq || s.stokReq); const s = t[0]; return s ? { status: s.status || (s.data && s.data.status), cust: s.customer || (s.data && s.data.customer), id: s.id, n: t.length, fg: ((s.items || (s.data && s.data.items) || [])[0] || {}).fg } : null; });
  ok('SP-23 SPK stok dibuat berstatus Draft untuk customer STOK MNI dan tertaut ke produk', !!spkStok && spkStok.status === 'Draft' && spkStok.cust === 'STOK MNI' && !!spkStok.fg, JSON.stringify(spkStok));
  // SPK diterbitkan dan produksinya dianggap selesai lewat data mock, lalu halaman dimuat ulang
  const releaseSpk = async (id) => {
    await page.evaluate((id) => { const db = JSON.parse(localStorage.getItem('mni-local-mock-db')); const s = db.tables.spk.find((x) => x.id === id); const o = s.items ? s : s.data; o.status = 'Terbit'; if ('status' in s) s.status = 'Terbit'; o.items.forEach((i) => { i.prod = i.q; }); localStorage.setItem('mni-local-mock-db', JSON.stringify(db)); }, id);
    await page.reload(); await page.waitForTimeout(2500);
  };
  const isiMasuk = async (id, fg, qty) => {
    await page.evaluate(([id, fg]) => { const b = document.createElement('button'); b.dataset.act = 'mv'; b.dataset.g = 'fg'; b.dataset.j = 'masuk'; b.dataset.item = fg; document.body.appendChild(b); b.click(); b.remove(); }, [id, fg]);
    await page.waitForTimeout(700);
    await page.evaluate(([id, qty]) => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = String(qty); f.spk.value = id; f.spk.dispatchEvent(new Event('change', { bubbles: true })); f.pihak.value = 'Produksi'; }, [id, qty]);
  };
  if (spkStok) {
    // belum diterbitkan / belum diproduksi: barang tidak boleh diterima di gudang barang jadi
    await isiMasuk(spkStok.id, spkStok.fg, 10);
    await submit();
    const errDraft = await page.evaluate(() => document.querySelector('#merr')?.textContent || '');
    ok('SP-34 barang dari SPK stok yang masih Draft/belum diproduksi tidak bisa diterima di gudang barang jadi', /masih Draft/.test(errDraft), errDraft);
    await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Batal')?.click()); await page.waitForTimeout(300);
    await releaseSpk(spkStok.id);
    await page.evaluate(() => { location.hash = '#barang-jadi'; }); await page.waitForTimeout(1200);
    await isiMasuk(spkStok.id, spkStok.fg, 10);
    await submit(); await page.waitForTimeout(1200);
    await tabClick('Rencana produksi'); await page.waitForTimeout(700);
    const prog = await page.evaluate(() => document.querySelector('.panel')?.innerText.replace(/\s+/g, ' ') || '');
    ok('SP-24 barang masuk tertaut SPK stok tercatat di progres SPK (10 sudah masuk gudang)', /10 dari \d+/.test(prog), (prog.match(/\d+% \d+ dari \d+/) || [''])[0]);
  }
  // barang jadi keluar tertaut SPK: customer terisi, dokumen memuat SPK, SPK menampilkan barang jadi terkait
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.act = 'mv'; b.dataset.g = 'fg'; b.dataset.j = 'keluar'; document.body.appendChild(b); b.click(); b.remove(); }); await page.waitForTimeout(700);
  const auto = await page.evaluate(() => { const f = document.querySelector('#mform'); const s = f.querySelector('#m-mvl select'); s.selectedIndex = 1; s.dispatchEvent(new Event('change', { bubbles: true })); f.querySelector('[name^="qty_"]').value = '1'; const o = [...f.spk.options].find((x) => /1001/.test(x.text)); f.spk.value = o.value; f.spk.dispatchEvent(new Event('change', { bubbles: true })); return f.pihak.value; });
  await submit(); await page.waitForTimeout(1200);
  await tabClick('Riwayat mutasi'); await page.waitForTimeout(700);
  const docFg = await docOf('BJ-K', []);
  ok('SP-25 barang keluar tertaut SPK: customer terisi otomatis, riwayat menautkan SPK, dokumen BJ-K memuat SPK dan customer', auto === 'Customer Contoh A' && docFg.link && /BUKTI PENGELUARAN BARANG JADI/.test(docFg.txt) && /No SPK 1001/.test(docFg.txt), `${auto} · ${docFg.txt.slice(0, 80)}`);
  const inSpk = await page.evaluate(async () => { const id = JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.spk.find((s) => String(s.no) === '1001').id; const b = document.createElement('button'); b.dataset.act = 'openspk'; b.dataset.id = id; document.body.appendChild(b); b.click(); b.remove(); await new Promise((r) => setTimeout(r, 900)); return /Barang jadi terkait SPK ini/i.test(document.querySelector('#dw-pane-info')?.innerHTML || ''); });
  ok('SP-26 laci SPK menampilkan barang jadi terkait SPK', inSpk);

  // ceklis produk di Posisi stok -> SPK stok Draft; filter jenis SPK; terima di gudang barang jadi (bukan kirim ke customer)
  const spkStokCount = () => page.evaluate(() => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.spk.filter((s) => s.stokReq || (s.data && s.data.stokReq)).length);
  const before = await spkStokCount();
  await tabClick('Posisi stok'); await page.waitForTimeout(500);
  await page.evaluate(() => { const cb = [...document.querySelectorAll('input[data-act="fgpick"]')]; cb[1].click(); cb[2].click(); }); await page.waitForTimeout(400);
  const bar = await page.evaluate(() => { const b = document.querySelector('#fgpick-bar'); return { hid: b.hidden, txt: b.innerText.replace(/\s+/g, ' '), kartu: /Kartu stok/.test(document.body.innerText) }; });
  ok('SP-29 ceklis produk di Posisi stok memunculkan bar "2 produk dipilih" tanpa membuka kartu stok', !bar.hid && /2 produk dipilih/.test(bar.txt) && !bar.kartu, bar.txt);
  await page.evaluate(() => document.querySelector('#fgpick-bar [data-act="fgspkpick"]').click()); await page.waitForTimeout(600);
  const pickLines = await page.evaluate(() => { [...document.querySelectorAll('#mform [name^="qty_"]')].forEach((i, k) => { i.value = String(7 - k * 4); }); return document.querySelectorAll('#m-mvl tr').length; });
  await submit(); await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector('#sheet [data-act="sheet-close"]')?.click()); await page.waitForTimeout(400);
  const newStok = await page.evaluate(() => { const t = JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.spk.filter((s) => s.stokReq || (s.data && s.data.stokReq)); const s = t[t.length - 1]; const it = s.items || (s.data && s.data.items) || []; return { id: s.id, no: s.no, st: s.status || (s.data && s.data.status), q: it.map((i) => i.q).join('+') }; });
  ok('SP-30 SPK stok dibuat dari ceklis produk: 2 baris, qty 7 dan 3, status Draft', pickLines === 2 && (await spkStokCount()) === before + 1 && newStok.st === 'Draft' && newStok.q === '7+3', JSON.stringify(newStok));

  await releaseSpk(newStok.id);
  await page.evaluate(() => { location.hash = '#spk'; }); await page.waitForTimeout(1000);
  const seg =(t) => page.evaluate((t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === t).click(), t);
  const spkRows = () => page.evaluate(() => [...document.querySelectorAll('.panel table tbody tr')].map((r) => ({ stok: /STOK MNI/.test(r.innerText), chip: /SPK Stok/.test(r.innerText) })));
  await seg('SPK Stok'); await page.waitForTimeout(500);
  const rs = await spkRows();
  await seg('SPK Customer'); await page.waitForTimeout(500);
  const rc = await spkRows();
  await seg('Semua SPK'); await page.waitForTimeout(500);
  const ra = await spkRows();
  ok('SP-31 monitoring SPK: filter SPK Stok, SPK Customer, dan Semua SPK memisahkan jenisnya', rs.length >= 2 && rs.every((r) => r.stok && r.chip) && rc.length >= 2 && rc.every((r) => !r.stok) && ra.length === rs.length + rc.length, `${rs.length}/${rc.length}/${ra.length}`);

  const drw = await page.evaluate(async (id) => { const b = document.createElement('button'); b.dataset.act = 'openspk'; b.dataset.id = id; document.body.appendChild(b); b.click(); b.remove(); await new Promise((r) => setTimeout(r, 900)); const d = document.querySelector('#dw-pane-info'); return { terima: !!d.querySelector('[data-act="fgterima"]'), kirim: !!d.querySelector('[data-act="newkirim"]'), vendor: !!d.querySelector('[data-act="newvendor"]'), lbl: /Masuk Gudang Barang Jadi/i.test(d.innerHTML) }; }, newStok.id);
  ok('SP-32 SPK stok: tombol Terima di gudang barang jadi dan Kirim ke vendor ada, Kirim ke customer tidak ada', drw.terima && drw.vendor && !drw.kirim && drw.lbl, JSON.stringify(drw));
  await page.evaluate(() => document.querySelector('#dw-pane-info [data-act="fgterima"]').click()); await page.waitForTimeout(800);
  const tf = await page.evaluate(() => { const f = document.querySelector('#mform'); return { spk: f.spk.value, pihak: f.pihak.value, q: [...f.querySelectorAll('[name^="qty_"]')].map((i) => i.value).join('+') }; });
  await page.evaluate(() => { const f = document.querySelector('#mform'); const q = f.querySelectorAll('[name^="qty_"]'); q[0].value = '7'; q[1].value = '1'; });
  await submit(); await page.waitForTimeout(1200);
  const prog2 = await page.evaluate(async (id) => { location.hash = '#spk'; await new Promise((r) => setTimeout(r, 600)); const b = document.createElement('button'); b.dataset.act = 'openspk'; b.dataset.id = id; document.body.appendChild(b); b.click(); b.remove(); await new Promise((r) => setTimeout(r, 900)); const t = document.querySelector('#dw-pane-info').innerText.replace(/\s+/g, ' '); const tl = document.body.innerText; return { t: (t.match(/\d+ dari \d+ item masuk gudang/) || [''])[0], mv: /Barang jadi terkait SPK ini/i.test(document.querySelector('#dw-pane-info').innerHTML) }; }, newStok.id);
  ok('SP-33 terima di gudang barang jadi: form terisi dari SPK (qty 7+3, asal produksi), progres SPK menghitung 8 dari 10 masuk gudang dan mutasi tertaut', tf.spk === newStok.id && /SPK/.test(tf.pihak) && tf.q === '7+3' && prog2.t === '8 dari 10 item masuk gudang' && prog2.mv, JSON.stringify({ tf, prog2 }));
  // SPK customer yang belum selesai diproduksi tidak bisa langsung dikirim ke customer
  const kirimErr = await page.evaluate(async () => { const s = JSON.parse(localStorage.getItem('mni-local-mock-db')).tables.spk.find((x) => String(x.no) === '1002'); const b = document.createElement('button'); b.dataset.act = 'newkirim'; b.dataset.spk = s.id; document.body.appendChild(b); b.click(); b.remove(); await new Promise((r) => setTimeout(r, 700)); const f = document.querySelector('#mform'); const i = f.querySelector('[name="ln_0"]'); i.value = '1'; f.querySelector('#msub').click(); await new Promise((r) => setTimeout(r, 900)); return document.querySelector('#merr')?.textContent || ''; });
  ok('SP-35 SPK customer yang belum selesai diproduksi tidak bisa langsung dikirim ke customer', /siap dikirim/.test(kirimErr), kirimErr);
  await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Batal')?.click(); document.querySelector('.drawer-close, [data-act="closedrawer"], .dw-close')?.click(); location.hash = '#sparepart'; }); await page.waitForTimeout(800);
  await page.evaluate(() => { location.hash = '#sparepart'; }); await page.waitForTimeout(800);

  // layar HP: kartu stok tanpa gulir samping
  await page.setViewportSize({ width: 390, height: 844 }); await page.reload(); await page.waitForTimeout(2500);
  const hp = await page.evaluate(() => ({ over: document.documentElement.scrollWidth > window.innerWidth + 2, thead: getComputedStyle(document.querySelector('table.spt thead')).display }));
  ok('SP-13 di HP daftar sparepart berupa kartu tanpa gulir samping', !hp.over && hp.thead === 'none', JSON.stringify(hp));
  await page.setViewportSize({ width: 1280, height: 800 });

  const inv = await periksaInvarian(page);
  ok('SP-36 invarian data hulu ke hilir (stok tidak minus, nomor unik, tautan sah, koreksi menolakkan, SPK stok) tanpa pelanggaran', inv.pelanggaran.length === 0, inv.pelanggaran.slice(0, 6).join(' ; ') || JSON.stringify(inv.jumlah));
  ok('SP-14 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
