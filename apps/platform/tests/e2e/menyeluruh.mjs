import { pindaiKejanggalan } from './kejanggalan.mjs';
// Uji menyeluruh aksi yang belum diacu uji lain (audit 2026-11-07, mock, data sintetis): Master Data (daftar, ubah nama berantai, gabung, hapus),
// bongkar muat (langkah, koreksi, cetak), kendala SPK terlambat, ubah item dan pengaturan bahan baku, unduhan kartu stok, PR, CSV, produksi.
import { periksaInvarian } from './invarian.mjs';

export async function runMenyeluruh(page, base) {
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
  const submit = async () => { await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => x.type === 'submit').pop().click()); await page.waitForTimeout(1100); };
  const act = (name, data = {}) => page.evaluate(([n, d]) => { const b = document.createElement('button'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);
  const rows = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t].map((r) => ({ ...(r.data || {}), ...r })), t);
  const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await page.waitForTimeout(900); };
  const fill = (vals) => page.evaluate((vals) => { const f = document.querySelector('#mform'); Object.entries(vals).forEach(([k, v]) => { const el = f.querySelector(`[name="${k}"]`); if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }); }, vals);
  const err = () => page.evaluate(() => (document.querySelector('#merr') || {}).textContent || '');
  const unduh = async (fn) => { const dl = page.waitForEvent('download', { timeout: 15000 }).catch(() => null); await fn(); await page.waitForTimeout(600); if (await page.evaluate(() => !!document.querySelector('#mform [name^="sg"]'))) await submit(); return dl; };

  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await login('admin@mni.local');

  // ===== Master Data =====
  await go('#master-data');
  await act('mreg', { k: 'customer', nm: 'Customer Uji Menyeluruh' }); await page.waitForTimeout(500);
  await submit();
  let cu = (await rows('mcustomer')).find((c) => c.nama === 'Customer Uji Menyeluruh');
  ok('M-1 customer baru dibuat dari Master Data dengan nama bawaan', !!cu && cu.aktif !== false, cu ? cu.nama : 'tidak ada');

  const spkA = (await rows('spk')).find((s) => String(s.no) === '1001');
  const namaA = spkA.customer;
  const mA = (await rows('mcustomer')).find((c) => c.nama === namaA);
  if (mA) {
    await act('medit', { k: 'customer', id: mA.id }); await page.waitForTimeout(500);
    await fill({ nama: namaA + ' Baru' }); await submit();
    const spkA2 = (await rows('spk')).find((s) => String(s.no) === '1001');
    const kirimA = (await rows('kirim')).filter((x) => x.customer === namaA).length;
    ok('M-2 mengganti nama customer di Master Data mengubah SPK dan surat jalan yang memakainya', spkA2.customer === namaA + ' Baru' && kirimA === 0, `${spkA2.customer} · sisa nama lama di surat jalan: ${kirimA}`);
  } else ok('M-2 customer SPK 1001 tidak ada di master contoh', false, namaA);

  const spkB = (await rows('spk')).find((s) => String(s.no) === '1002');
  await act('mmerge', { k: 'customer', from: spkB.customer, to: 'Customer Uji Menyeluruh' }); await page.waitForTimeout(500);
  await submit();
  const spkB2 = (await rows('spk')).find((s) => String(s.no) === '1002');
  const oldM = (await rows('mcustomer')).find((c) => c.nama === spkB.customer);
  ok('M-3 gabung nama customer: transaksi pindah ke nama master tujuan, master lama dinonaktifkan dan ditandai digabung', spkB2.customer === 'Customer Uji Menyeluruh' && oldM && oldM.aktif === false && oldM.mergedTo === 'Customer Uji Menyeluruh', `${spkB2.customer} · ${oldM && oldM.aktif}`);

  await act('mreg', { k: 'supplier', nm: 'Supplier Hapus Uji' }); await page.waitForTimeout(500); await submit();
  const sp1 = (await rows('msupplier')).find((c) => c.nama === 'Supplier Hapus Uji');
  await act('mdel', { k: 'supplier', id: sp1.id }); await page.waitForTimeout(500); await submit();
  const sp2 = (await rows('msupplier')).find((c) => c.nama === 'Supplier Hapus Uji');
  ok('M-4 supplier yang belum dipakai dapat dihapus permanen', !sp2, sp2 ? 'masih ada' : 'terhapus');
  const cuUsed = (await rows('mcustomer')).find((c) => c.nama === 'Customer Uji Menyeluruh');
  await act('mdel', { k: 'customer', id: cuUsed.id }); await page.waitForTimeout(500); await submit();
  const cuUsed2 = (await rows('mcustomer')).find((c) => c.nama === 'Customer Uji Menyeluruh');
  ok('M-5 customer yang sudah dipakai transaksi hanya dinonaktifkan, tidak dihapus', !!cuUsed2 && cuUsed2.aktif === false, JSON.stringify(cuUsed2 && cuUsed2.aktif));

  // supplier dipakai PR: mengganti nama supplier harus ikut mengubah PR (nama supplier tersimpan di PR)
  const supExist = (await rows('msupplier')).find((s) => s.aktif !== false);
  await page.evaluate((nama) => { const db = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString(); db.tables.pr.push({ id: 'aaaaaaaa-0000-4000-8000-000000000001', created_at: now, updated_at: now, data: { noPR: 'PR/2026/11/900', tgl: '2026-11-07', supplier: nama, status: 'Diajukan', butuh: '2026-11-14', gudang: 'rm', items: [] } }); localStorage.setItem('mni-local-mock-db', JSON.stringify(db)); }, supExist.nama);
  await page.reload(); await page.waitForTimeout(2500); await go('#master-data');
  await act('medit', { k: 'supplier', id: supExist.id }); await page.waitForTimeout(500);
  await fill({ nama: supExist.nama + ' Baru' }); await submit();
  const prSup = (await rows('pr')).find((p) => p.noPR === 'PR/2026/11/900');
  ok('M-6 mengganti nama supplier di Master Data mengubah supplier pada PR yang memakainya', !!prSup && prSup.supplier === supExist.nama + ' Baru', prSup ? prSup.supplier : 'PR tidak ada');

  // daftar sales dan satuan
  await act('listnew', { kind: 'sales' }); await page.waitForTimeout(400); await fill({ v: 'Sales Uji' }); await submit();
  const s1 = await page.evaluate(() => KAT().sales || []);
  await act('listedit', { kind: 'sales', v: 'Sales Uji' }); await page.waitForTimeout(400); await fill({ v: 'Sales Uji B' }); await submit();
  const s2 = await page.evaluate(() => KAT().sales || []);
  await act('listdel', { kind: 'sales', v: 'Sales Uji B' }); await page.waitForTimeout(700);
  const s3 = await page.evaluate(() => KAT().sales || []);
  ok('M-7 daftar sales: tambah, ubah nama, hapus', s1.includes('Sales Uji') && s2.includes('Sales Uji B') && !s2.includes('Sales Uji') && !s3.includes('Sales Uji B'), JSON.stringify([s1.length, s2.length, s3.length]));
  await act('listnew', { kind: 'sat' }); await page.waitForTimeout(400); await fill({ v: 'Karung Uji' }); await submit();
  const u1 = await page.evaluate(() => satList());
  await act('listdel', { kind: 'sat', v: 'Karung Uji' }); await page.waitForTimeout(700);
  const u2 = await page.evaluate(() => satList());
  ok('M-8 daftar satuan: tambah dan hapus', u1.includes('Karung Uji') && !u2.includes('Karung Uji'));

  // ===== Bahan baku: ubah item dan pengaturan =====
  await go('#bahan-baku');
  const rm0 = (await rows('rm')).find((r) => r.aktif !== false);
  await act('rmedit', { id: rm0.id }); await page.waitForTimeout(500);
  await fill({ min: '50', buffer: '10' }); await submit();
  const e1 = await err();
  await fill({ min: '5', buffer: '40', lokasi: 'Z-99' }); await submit();
  const rm1 = (await rows('rm')).find((r) => r.id === rm0.id);
  ok('M-9 ubah item bahan baku: minimum lebih besar dari buffer ditolak, nilai sah tersimpan', /tidak boleh lebih besar/i.test(e1) && +rm1.min === 5 && +rm1.buffer === 40 && rm1.lokasi === 'Z-99', `${e1.slice(0, 50)} · min ${rm1.min} buffer ${rm1.buffer}`);
  await act('rmset'); await page.waitForTimeout(500);
  await fill({ leadBeli: '12', cover: '77' }); await submit();
  const set = await page.evaluate(() => ({ lead: SET().leadBeli, cover: SET().cover }));
  ok('M-10 pengaturan bahan baku (lead time dan target stok) tersimpan', set.lead === 12 && set.cover === 77, JSON.stringify(set));

  // ===== Unduhan dokumen =====
  const dK = await unduh(() => act('ksxlsx', { id: rm0.id }));
  ok('M-11 kartu stok bahan baku dapat diunduh sebagai Excel', !!dK && new RegExp(String.fromCharCode(92) + '.xlsx$', 'i').test(dK.suggestedFilename()), dK ? dK.suggestedFilename() : 'tidak ada unduhan');
  const dP = await unduh(() => act('prxlsx', { id: 'aaaaaaaa-0000-4000-8000-000000000001' }));
  ok('M-12 permintaan pembelian bahan baku dapat diunduh sebagai Excel (lewat dialog nama penanda tangan)', !!dP && new RegExp(String.fromCharCode(92) + '.xlsx$', 'i').test(dP.suggestedFilename()), dP ? dP.suggestedFilename() : 'tidak ada unduhan');
  const dS = await unduh(() => act('spcsv'));
  ok('M-13 daftar sparepart dapat diunduh sebagai CSV', !!dS && new RegExp(String.fromCharCode(92) + '.csv$', 'i').test(dS.suggestedFilename()), dS ? dS.suggestedFilename() : 'tidak ada unduhan');
  const dC = await unduh(() => act('kpicsv'));
  ok('M-14 ringkasan kinerja dapat diunduh sebagai CSV', !!dC && new RegExp(String.fromCharCode(92) + '.csv$', 'i').test(dC.suggestedFilename()), dC ? dC.suggestedFilename() : 'tidak ada unduhan');

  // ===== Bongkar muat: antrean dari terima material, langkah, koreksi, cetak =====
  await go('#bahan-baku');
  const sup = (await rows('msupplier')).find((s) => s.aktif !== false);
  await act('mv', { g: 'rm', j: 'masuk', item: rm0.id }); await page.waitForTimeout(700);
  await page.evaluate((sup) => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '2'; f.pihak.value = sup; if (f.dock) f.dock.checked = true; const np = f.querySelector('[name="nopol"]'); if (np) np.value = 'B 1234 UJI'; }, sup.nama);
  await submit(); await page.waitForTimeout(900);
  const bm = (await rows('bongkar')).filter((b) => b.jenis === 'Unloading').pop();
  ok('M-15 terima material dengan centang antrean membuat antrean Unloading di Bongkar Muat', !!bm, bm ? `${bm.status} ${bm.nopol || ''}` : 'tidak ada antrean');
  if (bm) {
    await go('#bongkar-muat');
    await act('bmstep', { id: bm.id, to: 'Proses' }); await page.waitForTimeout(800);
    const b1 = (await rows('bongkar')).find((b) => b.id === bm.id);
    await act('bmstep', { id: bm.id, to: 'Selesai' }); await page.waitForTimeout(800);
    const b2 = (await rows('bongkar')).find((b) => b.id === bm.id);
    ok('M-16 langkah bongkar muat: Antri menjadi Proses (jam mulai) lalu Selesai (jam selesai)', b1.status === 'Proses' && !!b1.jamMulai && b2.status === 'Selesai' && !!b2.jamSelesai, `${bm.status}>${b1.status}>${b2.status}`);
    await act('bmkoreksi', { id: bm.id }); await page.waitForTimeout(500);
    await fill({ petugas: 'Petugas Uji' }); await submit();
    const b3 = (await rows('bongkar')).find((b) => b.id === bm.id);
    ok('M-17 koreksi jam dan petugas bongkar muat tersimpan', b3.petugas === 'Petugas Uji', b3.petugas);
    await page.evaluate(() => { window.__html = ''; window.__wo = window.open; window.open = () => ({ document: { write: (s) => { window.__html = s; }, close() {} } }); });
    await act('printbm', { id: bm.id }); await page.waitForTimeout(500);
    const bmDoc = await page.evaluate(() => { window.open = window.__wo; return window.__html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); });
    ok('M-18 checklist bongkar muat dapat dicetak dan memuat nopol dan jenis', /B 1234 UJI/.test(bmDoc) && /Unloading/.test(bmDoc), bmDoc.slice(0, 90));
  }

  // ===== Kendala SPK terlambat =====
  const late = (await rows('spk')).find((s) => String(s.no) === '1002');
  await go('#spk');
  await act('kendal', { id: late.id }); await page.waitForTimeout(600);
  const kForm = await page.evaluate(() => ({ open: !!document.querySelector('#mform'), names: [...document.querySelectorAll('#mform [name]')].map((i) => i.name) }));
  if (kForm.open) {
    const alasanName = kForm.names.find((n) => /alasan|ket|kendala/i.test(n)) || kForm.names[0];
    await fill({ [alasanName]: 'Mesin shearing rusak (uji)' }); await submit();
    const l2 = (await rows('spk')).find((s) => s.id === late.id);
    ok('M-19 kendala keterlambatan SPK dicatat di SPK', /Mesin shearing rusak/.test(JSON.stringify(l2.alasan || l2.kendala || l2.revisi || '')), JSON.stringify(l2.alasan || '').slice(0, 80));
  } else ok('M-19 form kendala SPK terlambat terbuka', false, 'form tidak terbuka');

  // ===== Work center standar =====
  await go('#master-data');
  const w0 = (await rows('mwc')).length;
  await act('wcseed'); await page.waitForTimeout(1500);
  const w1 = (await rows('mwc')).length;
  ok('M-20 work center standar dimuat dari Master Data (idempoten: tidak menggandakan)', w1 >= w0, `${w0}>${w1}`);
  await act('wcseed'); await page.waitForTimeout(1500);
  const w2 = (await rows('mwc')).length;
  ok('M-21 memuat work center standar dua kali tidak menggandakan', w2 === w1, `${w1}>${w2}`);

  const inv = await periksaInvarian(page);
  ok('M-22 invarian data hulu ke hilir tanpa pelanggaran setelah semua uji di atas', inv.pelanggaran.length === 0, inv.pelanggaran.slice(0, 6).join(' ; ') || JSON.stringify(inv.jumlah));
  const kej = await pindaiKejanggalan(page);
  ok('M-24 pemindai kejanggalan: semua menu desktop dan HP tanpa teks undefined, NaN, null, gambar rusak, meluap, tabel kosong tanpa keterangan, dan galat konsol', kej.temuan.length === 0 && kej.galat.length === 0, (kej.temuan.concat(kej.galat)).slice(0, 8).join(' ; ') || String(kej.jumlahMenu) + ' menu');
  ok('M-23 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
