import { pindaiKejanggalan } from './kejanggalan.mjs';
import { periksaInvarian } from './invarian.mjs';
// Uji fitur yang sebelumnya tidak diacu langsung oleh uji lain (audit fitur 2026-11-06, mock, data sintetis):
// koreksi transaksi, nonaktif item, SPK Draft terbit, ceklis produk jadi SPK stok, baris tambahan di form mutasi,
// opname bahan baku (isi, kosongkan, lembar hitung), unduhan Excel, jenis material, alamat surat jalan.
export async function runFitur(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  const login = async (email) => {
    await page.evaluate(() => localStorage.removeItem('mni-local-mock-session'));
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', email); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await page.waitForTimeout(800);
  };
  const submit = async () => { await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => x.type === 'submit').pop().click()); await page.waitForTimeout(1200); };
  const act = (name, data = {}) => page.evaluate(([n, d]) => { const b = document.createElement('button'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);
  const rows = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t].map((r) => ({ ...(r.data || {}), ...r })), t);
  const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await page.waitForTimeout(1000); };
  const tab = (t) => page.evaluate((t) => [...document.querySelectorAll('.tabs button, .seg button, button')].find((b) => b.textContent.trim().startsWith(t)).click(), t);

  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await login('admin@mni.local');

  // F-1 koreksi transaksi stok: membuat transaksi pembalik dan menandai yang asli
  await go('#bahan-baku');
  const rm0 = (await rows('rm')).find((r) => r.aktif !== false);
  const sup = (await rows('msupplier'))[0].nama;
  await act('mv', { g: 'rm', j: 'masuk', item: rm0.id }); await page.waitForTimeout(700);
  await page.evaluate((sup) => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '5'; f.pihak.value = sup; }, sup);
  await submit(); await page.waitForTimeout(800);
  const m1 = (await rows('mutasi')).filter((m) => m.item === rm0.id && m.jenis === 'masuk' && m.delta === 5).pop();
  await act('koreksi', { id: m1.id }); await page.waitForTimeout(600);
  await page.evaluate(() => { document.querySelector('#mform [name="ket"]').value = 'salah input uji'; });
  await submit(); await page.waitForTimeout(800);
  const after1 = await rows('mutasi');
  const kor = after1.find((m) => m.jenis === 'koreksi' && (m.koreksiDari === m1.id));
  ok('F-1 koreksi membuat transaksi pembalik -5 yang menunjuk ke transaksi asli, dan yang asli ditandai dikoreksi', !!kor && kor.delta === -5 && after1.find((m) => m.id === m1.id).dikoreksi === true, JSON.stringify(kor && { d: kor.delta, k: kor.koreksiDari === m1.id }));

  // F-2 nonaktif dan aktifkan item bahan baku
  await act('rmnonaktif', { id: rm0.id }); await page.waitForTimeout(900);
  const off = (await rows('rm')).find((r) => r.id === rm0.id).aktif;
  await act('rmaktif', { id: rm0.id }); await page.waitForTimeout(900);
  const on = (await rows('rm')).find((r) => r.id === rm0.id).aktif;
  ok('F-2 item bahan baku dapat dinonaktifkan lalu diaktifkan kembali', off === false && on === true, `${off}/${on}`);

  // F-3 baris tambahan di form mutasi (mvadd) dan hapus baris (mvdel)
  await act('mv', { g: 'rm', j: 'keluar' }); await page.waitForTimeout(700);
  await act('mvadd', { g: 'rm' }); await page.waitForTimeout(200);
  const n2 = await page.evaluate(() => document.querySelectorAll('#m-mvl tr').length);
  await page.evaluate(() => document.querySelector('#m-mvl tr [data-act="mvdel"]').click()); await page.waitForTimeout(200);
  const n1 = await page.evaluate(() => document.querySelectorAll('#m-mvl tr').length);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Batal')?.click()); await page.waitForTimeout(300);
  ok('F-3 form mutasi: tombol item lain menambah baris, tombol x menghapusnya (minimal satu baris)', n2 === 2 && n1 === 1, `${n2}/${n1}`);

  // F-4 ceklis produk barang jadi menjadi SPK stok Draft, lalu diterbitkan (spkpub)
  await go('#barang-jadi');
  await page.evaluate(() => document.querySelector('input[data-act="fgpick"]').click()); await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('#fgpick-bar [data-act="fgspkpick"]').click()); await page.waitForTimeout(600);
  await page.evaluate(() => { document.querySelector('#mform [name^="qty_"]').value = '4'; });
  await submit(); await page.waitForTimeout(2500);
  await page.evaluate(() => document.querySelector('#sheet [data-act="sheet-close"]')?.click()); await page.waitForTimeout(400);
  const draft = (await rows('spk')).filter((s) => s.stokReq).pop();
  await act('spkpub', { id: draft.id }); await page.waitForTimeout(1200);
  const pub = (await rows('spk')).find((s) => s.id === draft.id);
  ok('F-4 ceklis produk menjadi SPK stok Draft (qty 4), lalu Terbitkan mengubah status dan mencatat waktu terbit', draft.status === 'Draft' && (draft.items || [])[0].q === 4 && pub.status === 'Terbit' && !!(pub.terbitAt || pub.terbit_at), `${draft.status}→${pub.status} q=${JSON.stringify((draft.items || []).map((i) => i.q))} terbit=${pub.terbitAt || pub.terbit_at}`);

  // F-17 koreksi barang masuk gudang jadi dari SPK stok: progres SPK ikut berkurang (koreksi membalik transaksi masuk)
  await page.evaluate((id) => { const db = JSON.parse(localStorage.getItem('mni-local-mock-db')); const s = db.tables.spk.find((x) => x.id === id); const o = s.items ? s : s.data; o.items.forEach((it) => { it.prod = it.q; }); localStorage.setItem('mni-local-mock-db', JSON.stringify(db)); }, draft.id);
  await page.reload(); await page.waitForTimeout(2500); await go('#barang-jadi');
  await act('mv', { g: 'fg', j: 'masuk', item: (draft.items || [])[0].fg }); await page.waitForTimeout(700);
  await page.evaluate((id) => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '3'; f.spk.value = id; f.spk.dispatchEvent(new Event('change', { bubbles: true })); f.pihak.value = 'Produksi'; }, draft.id);
  await submit(); await page.waitForTimeout(900);
  const kir1 = await page.evaluate((id) => calc().spk[id].kir, draft.id);
  // F-18 Dashboard: SPK stok (customer STOK MNI) tidak masuk peringkat customer dan funnel pengiriman customer
  await go('#dashboard');
  const topTxt = await page.evaluate(() => { const p = [...document.querySelectorAll('section.panel')].find((x) => /Top customer/.test(x.innerText)); return p ? p.innerText : ''; });
  ok('F-18 peringkat Top customer di Dashboard tidak memuat STOK MNI walau SPK stok sudah menerima barang', topTxt.length > 0 && !/STOK MNI/.test(topTxt), topTxt.replace(/\s+/g, ' ').slice(0, 90));
  await go('#barang-jadi');
  const mFg = (await rows('mutasi')).filter((m) => m.gudang === 'fg' && m.jenis === 'masuk' && m.spk === draft.id).pop();
  await act('koreksi', { id: mFg.id }); await page.waitForTimeout(600);
  await page.evaluate(() => { document.querySelector('#mform [name="ket"]').value = 'salah catat uji'; });
  await submit(); await page.waitForTimeout(900);
  const kir2 = await page.evaluate(([id, fg]) => ({ kir: calc().spk[id].kir, got: fgGot(id, fg), pend: fgPending(fg) }), [draft.id, (draft.items || [])[0].fg]);
  ok('F-17 koreksi barang masuk SPK stok: sebelum koreksi tercatat 3 masuk gudang, sesudahnya progres kembali 0 dan yang sedang diproduksi kembali penuh', kir1 === 3 && kir2.kir === 0 && kir2.got === 0 && kir2.pend >= 4, JSON.stringify({ kir1, kir2 }));


  // F-5 opname bahan baku: isi semua = sistem, kosongkan, dan lembar hitung kosong
  await go('#bahan-baku'); await tab('Stock opname'); await page.waitForTimeout(700);
  await act('opnfill'); await page.waitForTimeout(500);
  const filled = await page.evaluate(() => [...document.querySelectorAll('input[data-opn], table input[type="number"]')].filter((i) => i.value !== '').length);
  await act('opnclear'); await page.waitForTimeout(500);
  const cleared = await page.evaluate(() => [...document.querySelectorAll('input[data-opn], table input[type="number"]')].filter((i) => i.value !== '').length);
  ok('F-5 opname bahan baku: Isi semua = sistem mengisi kolom hitung fisik, Kosongkan menghapusnya', filled > 0 && cleared === 0, `${filled}/${cleared}`);
  await page.evaluate(() => { window.__html = ''; window.__wo = window.open; window.open = () => ({ document: { write: (s) => { window.__html = s; }, close() {} } }); });
  await act('opnsheetpdf'); await page.waitForTimeout(600);
  if (await page.evaluate(() => !!document.querySelector('#mform [name^="sg"]'))) await submit();
  const sheet = await page.evaluate(() => { window.open = window.__wo; return window.__html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); });
  ok('F-6 lembar hitung opname kosong dapat dicetak dan memuat kolom stok sistem dan hitung fisik', /Stok sistem/i.test(sheet) && /Hitung fisik|Stok fisik/i.test(sheet), sheet.slice(0, 90));

  // F-7 unduhan Excel dari SPK (spkxlsx)
  const spk1 = (await rows('spk')).find((s) => String(s.no) === '1001');
  const dl1 = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
  await act('spkxlsx', { id: spk1.id });
  const d1 = await dl1;
  ok('F-7 SPK dapat diunduh sebagai Excel (.xlsx)', !!d1 && /\.xlsx$/i.test(d1.suggestedFilename()), d1 ? d1.suggestedFilename() : 'tidak ada unduhan');

  // F-8 jenis material di Master Data: tambah, hapus bawaan, pulihkan
  await go('#master-data'); await tab('Bahan baku'); await page.waitForTimeout(600);
  await act('jenisform'); await page.waitForTimeout(500);
  await page.evaluate(() => { const f = document.querySelector('#mform'); f.nama.value = 'Tembaga Uji'; f.dens.value = '8.96'; f.kunci.value = 'TEMBAGA UJI'; });
  await submit(); await page.waitForTimeout(900);
  const t1 = await page.evaluate(() => document.body.innerText);
  await act('jenisdel', { j: 'SPCC' }); await page.waitForTimeout(900);
  const t2 = await page.evaluate(() => document.body.innerText);
  await act('jenispulih', { j: 'SPCC' }); await page.waitForTimeout(900);
  const t3 = await page.evaluate(() => document.body.innerText);
  ok('F-8 jenis material: jenis baru tampil, jenis bawaan dapat dihapus lalu dipulihkan', /Tembaga Uji/.test(t1) && !/\bSPCC\b[\s\S]{0,40}Pulihkan/.test(t1) && /Pulihkan/.test(t2) && !/Pulihkan/.test(t3), `${/Tembaga Uji/.test(t1)}/${/Pulihkan/.test(t2)}/${/Pulihkan/.test(t3)}`);

  // F-9 alamat surat jalan customer dapat diubah dan tersimpan
  // surat jalan dibuat dulu lewat form (SPK 1001 sudah selesai diproduksi), lalu alamatnya diubah
  await go('#pengiriman');
  await act('newkirim', { spk: spk1.id }); await page.waitForTimeout(800);
  await page.evaluate(() => { const i = document.querySelector('#mform [name="ln_0"]'); if (i) i.value = '1'; });
  await submit(); await page.waitForTimeout(1200);
  const k1 = (await rows('kirim')).filter((k) => k.status !== 'Batal' && k.spk === spk1.id).pop();
  if (k1) {
    await go('#pengiriman');
    await act('sjalamat', { id: k1.id }); await page.waitForTimeout(600);
    await page.evaluate(() => { document.querySelector('#mform [name="alamat"]').value = 'Jl. Uji Fitur No. 9, Tangerang'; });
    await submit(); await page.waitForTimeout(900);
    const k2 = (await rows('kirim')).find((k) => k.id === k1.id);
    ok('F-9 alamat pengiriman surat jalan dapat diubah dan tersimpan di surat jalan', k2.alamat === 'Jl. Uji Fitur No. 9, Tangerang', k2.alamat);
  } else ok('F-9 surat jalan dapat dibuat dari SPK yang selesai diproduksi', false, 'surat jalan tidak terbentuk');

  // F-11 pilih semua yang di bawah buffer dan batal pilih (barang jadi)
  await page.evaluate(() => { const db = JSON.parse(localStorage.getItem('mni-local-mock-db')); const f = db.tables.fg[0]; f.data = { ...(f.data || {}), buffer: 9999 }; localStorage.setItem('mni-local-mock-db', JSON.stringify(db)); });
  await page.reload(); await page.waitForTimeout(2500);
  await go('#barang-jadi');
  await act('fgpicklow'); await page.waitForTimeout(500);
  const pk1 = await page.evaluate(() => { const b = document.querySelector('#fgpick-bar'); return { hid: b.hidden, n: +(b.querySelector('b') || {}).textContent }; });
  await act('fgpickclear'); await page.waitForTimeout(500);
  const pk2 = await page.evaluate(() => document.querySelector('#fgpick-bar').hidden);
  ok('F-11 Pilih semua yang di bawah buffer mencentang produk di bawah buffer, Batal pilih mengosongkan', !pk1.hid && pk1.n >= 1 && pk2 === true, JSON.stringify(pk1) + '/' + pk2);

  // F-12 dan F-13 unduhan Excel: lembar hitung opname kosong dan dokumen mutasi (lewat dialog nama penanda tangan)
  const unduh = async (name, data) => {
    const dl = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
    await act(name, data); await page.waitForTimeout(600);
    if (await page.evaluate(() => !!document.querySelector('#mform [name^="sg"]'))) await submit();
    return dl;
  };
  await go('#bahan-baku');
  const d12 = await unduh('opnsheetxlsx');
  ok('F-12 lembar hitung opname kosong dapat diunduh sebagai Excel', !!(await d12) && /\.xlsx$/i.test((await d12).suggestedFilename()), d12 ? (await d12).suggestedFilename() : 'tidak ada unduhan');
  const d13 = await unduh('mvxlsx', { no: m1.noDok || m1.no_dok || '', j: 'masuk', id: m1.id });
  ok('F-13 dokumen penerimaan bahan baku dapat diunduh sebagai Excel', !!(await d13) && /\.xlsx$/i.test((await d13).suggestedFilename()), d13 ? (await d13).suggestedFilename() : 'tidak ada unduhan');

  // F-16 pembaca angka (isian dan tempelan): koma desimal, pemisah ribuan, format en, dan teks bukan angka
  const ang = await page.evaluate(() => ({ a: num0('1,5'), b: num0('1.500,75'), c: num0('1.000.000'), d: num0('1,500.75'), e: num0('1.5'), f: num0('abc'), g: num0(''), h: num0(null), i: num0('-3'), j: n(1234567.891), k: n(NaN), l: addDays('2026-12-31', 1), m: addWorkdays('2026-11-06', 5), o: days('2026-11-01', '2026-11-06') }));
  ok('F-16 num0 membaca 1,5 / 1.500,75 / 1.000.000 / 1,500.75 dengan benar; teks bukan angka jadi 0; format angka dan tanggal', ang.a === 1.5 && ang.b === 1500.75 && ang.c === 1000000 && ang.d === 1500.75 && ang.e === 1.5 && ang.f === 0 && ang.g === 0 && ang.h === 0 && ang.i === -3 && ang.j === '1.234.567,89' && ang.k === '0' && ang.l === '2027-01-01' && ang.m === '2026-11-13' && ang.o === 5, JSON.stringify(ang));

  const inv = await periksaInvarian(page);
  ok('F-15 invarian data hulu ke hilir (stok tidak minus, nomor unik, tautan sah, koreksi menolakkan, SPK stok) tanpa pelanggaran', inv.pelanggaran.length === 0, inv.pelanggaran.slice(0, 6).join(' ; ') || JSON.stringify(inv.jumlah));
  const kej = await pindaiKejanggalan(page);
  ok('F-19 pemindai kejanggalan: semua menu desktop dan HP tanpa teks undefined, NaN, null, gambar rusak, meluap, tabel kosong tanpa keterangan, dan galat konsol', kej.temuan.length === 0 && kej.galat.length === 0, (kej.temuan.concat(kej.galat)).slice(0, 8).join(' ; ') || String(kej.jumlahMenu) + ' menu');
  ok('F-14 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
