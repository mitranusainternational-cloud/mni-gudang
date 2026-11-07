// Uji editor SPK (baris, section, urut, revisi) dan Work Center (ubah, hapus, nonaktif) lewat klik langsung (mock).
//   const { pass, fail, detail } = await runEditor(page, 'http://127.0.0.1:5173/');
// Menutup celah audit T-210/T-212: aksi ed-addline, ed-delline, ed-addsec, ed-delsec, ed-up, ed-down, ed-addacc, wcedit, wcdel.
export async function runEditor(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  const tab = (t) => page.evaluate((t) => (JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t] || []).map((r) => ({ ...(r.data || {}), ...r })), t);
  const wait = (ms = 300) => page.waitForTimeout(ms);
  const kirimModal = async () => { await page.evaluate(() => document.getElementById('msub').click()); await wait(900); };
  const tutupModal = async () => { await page.evaluate(() => document.querySelector('#modal [data-act="closemodal"]')?.click()); await wait(250); };
  const tutupSheet = async () => { await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(300); };

  await page.goto(base);
  await page.evaluate(() => localStorage.clear());
  await page.goto(base); await page.reload();
  await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
  await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
  await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
  await wait(1000);
  await page.evaluate(() => { location.hash = '#spk'; }); await wait(500);

  // ---------- editor SPK: baris ----------
  await page.click('#tools [data-act="newspk"]'); await wait(700);
  const baris = () => page.$$eval('#ed-secs tbody tr', (a) => a.length);
  const sec = () => page.$$eval('#ed-secs .esec', (a) => a.length);
  const judul = () => page.$$eval('#ed-secs [data-sf="h"]', (a) => a.map((x) => x.value));
  const b0 = await baris();
  await page.click('[data-act="ed-addline"][data-s="0"]'); await wait(200);
  const b1 = await baris();
  await page.fill('#ed-cust', 'PT Editor Uji'); await page.fill('#ed-d-0-0', 'Cable Tray W100xH100xL3000'); await page.fill('#ed-q-0-0', '5');
  await page.fill('#ed-d-0-1', 'Cable Tray W200xH100xL3000'); await page.fill('#ed-q-0-1', '3');
  await page.click('[data-act="ed-delline"][data-s="0"][data-l="2"]'); await wait(200);
  const b2 = await baris();
  ok('E-01 tambah baris menambah satu, hapus baris menguranginya; isian baris lain tidak hilang', b0 === 3 && b1 === 4 && b2 === 3 && (await page.inputValue('#ed-d-0-0')) === 'Cable Tray W100xH100xL3000' && (await page.inputValue('#ed-q-0-1')) === '3', JSON.stringify([b0, b1, b2]));
  // hapus semua baris: tetap tersisa satu baris kosong
  for (let i = 0; i < 4; i++) { const n = await baris(); if (n <= 1) break; await page.click('[data-act="ed-delline"][data-s="0"][data-l="0"]'); await wait(120); }
  await page.click('[data-act="ed-delline"][data-s="0"][data-l="0"]'); await wait(150);
  const sisaKosong = await baris();
  ok('E-02 menghapus baris terakhir menyisakan satu baris kosong (tabel tidak pernah tanpa baris)', sisaKosong === 1 && (await page.inputValue('#ed-d-0-0')) === '', String(sisaKosong));
  await page.fill('#ed-d-0-0', 'Cable Tray W100xH100xL3000'); await page.fill('#ed-q-0-0', '5');
  await page.click('[data-act="ed-addline"][data-s="0"]'); await wait(150);
  await page.fill('#ed-d-0-1', 'Cable Tray W200xH100xL3000'); await page.fill('#ed-q-0-1', '3');

  // ---------- section ----------
  const judul0 = (await judul())[0];
  await page.click('[data-act="ed-addsec"]'); await wait(250);
  const s1 = await sec();
  const judulBaru = 'CABLE LADDER TYPE SLU 1.5 ELECTRO GALVANIZED';
  await page.fill('#ed-h-1', judulBaru); await page.dispatchEvent('#ed-h-1', 'change'); await wait(200);
  await page.fill('#ed-d-1-0', 'Cable Ladder W300xH100xL3000'); await page.fill('#ed-q-1-0', '2');
  ok('E-03 tambah section menambah satu bagian yang mewarisi judul sebelumnya, lalu judulnya bisa diganti', s1 === 2 && (await judul())[1] === judulBaru && judul0.length > 0, JSON.stringify(await judul()));
  await page.click('[data-act="ed-up"][data-s="1"]'); await wait(250);
  const urut1 = await judul();
  const dpertama = await page.inputValue('#ed-d-0-0');
  await page.click('[data-act="ed-down"][data-s="0"]'); await wait(250);
  const urut2 = await judul();
  const batasAtas = await page.$eval('[data-act="ed-up"][data-s="0"]', (b) => b.disabled);
  const batasBawah = await page.$eval('[data-act="ed-down"][data-s="1"]', (b) => b.disabled);
  ok('E-04 naik dan turun menukar urutan section beserta isinya; tombol di batas atas dan bawah nonaktif', urut1[0] === judulBaru && urut1[1] === judul0 && dpertama === 'Cable Ladder W300xH100xL3000' && urut2[0] === judul0 && urut2[1] === judulBaru && batasAtas && batasBawah, JSON.stringify({ urut1, urut2, batasAtas, batasBawah }));
  await page.click('[data-act="ed-addacc"]'); await wait(250);
  const j3 = await judul();
  ok('E-05 tambah aksesori membuat section ketiga berjudul ACCS dari judul terakhir', (await sec()) === 3 && /^ACCS /.test(j3[2]) && /LADDER/.test(j3[2]), j3[2]);
  await page.click('[data-act="ed-delsec"][data-s="2"]'); await wait(250);
  const setelahHapus = await sec();
  await page.click('[data-act="ed-delsec"][data-s="1"]'); await wait(250);
  const satu = await sec();
  const hapusTerakhir = await page.$eval('[data-act="ed-delsec"][data-s="0"]', (b) => b.disabled);
  ok('E-06 hapus section mengurangi satu; section terakhir tidak bisa dihapus (tombol nonaktif)', setelahHapus === 2 && satu === 1 && hapusTerakhir, JSON.stringify([setelahHapus, satu, hapusTerakhir]));

  // ---------- simpan draft lalu terbitkan; baris kosong tidak ikut ----------
  await page.click('[data-act="ed-addline"][data-s="0"]'); await wait(150);
  const n0 = (await tab('spk')).length;
  await page.click('[data-act="ed-save"][data-mode="draft"]'); await wait(1800);
  const sAll = await tab('spk'); const draft = sAll.find((s) => s.customer === 'PT Editor Uji');
  ok('E-07 simpan draft: baris kosong dibuang, dua item tersimpan berurutan dengan judul section', sAll.length === n0 + 1 && draft && draft.status === 'Draft' && draft.items.length === 2 && draft.items[0].q === 5 && draft.items[1].q === 3 && draft.items.every((i) => i.g === judul0), JSON.stringify((draft || {}).items));
  await page.evaluate(() => document.querySelector('[data-act="spkedit"]')?.click()); await wait(900);
  await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);

  const terbit = (await tab('spk')).find((s) => s.customer === 'PT Editor Uji');
  ok('E-08 SPK Draft diterbitkan dari editor: status Terbit dan waktu terbit tercatat', terbit && terbit.status === 'Terbit' && !!(terbit.terbitAt || terbit.terbit_at), terbit && terbit.status);

  // ---------- revisi SPK terbit: alasan wajib, urutan section berubah ----------
  await page.evaluate(() => document.querySelector('[data-act="spkedit"]')?.click()); await wait(900);
  await page.click('[data-act="ed-addsec"]'); await wait(200);
  await page.fill('#ed-h-1', 'ACCS TRAY TYPE STU 1.2 ELECTRO GALVANIZED'); await page.dispatchEvent('#ed-h-1', 'change');
  await page.fill('#ed-d-1-0', 'Elbow 90 W100'); await page.fill('#ed-q-1-0', '4');
  await page.click('[data-act="ed-up"][data-s="1"]'); await wait(200);
  await page.click('#editor [data-act="ed-save"][data-mode="terbit"]'); await wait(700);
  const galat = await page.evaluate(() => (document.getElementById('ed-err') || {}).textContent || '');
  await page.fill('#ed-rev', 'Tambah aksesori elbow'); await page.click('#editor [data-act="ed-save"][data-mode="terbit"]'); await wait(1800);
  await tutupSheet();
  const rev = (await tab('spk')).find((s) => s.customer === 'PT Editor Uji');
  ok('E-09 revisi SPK terbit wajib alasan; setelah diisi Rev.1 tercatat, section baru tersimpan di urutan hasil geser', /alasan revisi/i.test(galat) && rev.rev === 1 && (rev.revisi || []).length === 1 && rev.items.length === 3 && /^ACCS/.test(rev.items[0].g) && rev.items.filter((i) => i.q === 4).length === 1, JSON.stringify({ galat, rev: rev.rev, g: rev.items.map((i) => i.g.slice(0, 8)) }));

  // ---------- work center ----------
  await page.evaluate(() => { location.hash = '#master-data'; }); await wait(500);
  await page.evaluate(() => document.querySelector('#tools [data-val="wc"]')?.click()); await wait(600);
  const adaWc = await page.$$eval('[data-act="wcdel"]', (a) => a.length);
  const wcRow = (nama) => page.evaluate((nama) => { const b = [...document.querySelectorAll('[data-act="wcdel"]')].find((x) => (x.closest('tr,article,.card,li,div.mrow')?.innerText || '').includes(nama)); return b ? b.dataset.id : null; }, nama);
  const idBending = await wcRow('Bending');
  await page.evaluate((id) => document.querySelector(`[data-act="wcdel"][data-id="${id}"]`)?.click(), idBending); await wait(500);
  const modalDel = await page.evaluate(() => document.getElementById('modal').innerText.replace(/\s+/g, ' '));
  ok('E-10 hapus Work Center yang dilewati rute SPK aktif ditolak dengan alasan dan menawarkan Nonaktifkan', adaWc >= 6 && /tidak bisa dihapus/i.test(modalDel) && /SPK aktif|rute standar|catatan hasil/.test(modalDel) && /Nonaktifkan/.test(modalDel) && !/Hapus permanen/.test(modalDel), modalDel.slice(0, 200));
  await kirimModal();
  const wcB = (await tab('mwc')).find((w) => w.nama === 'Bending');
  ok('E-11 Nonaktifkan mempertahankan data (aktif=false), tidak menghapus baris', wcB && wcB.aktif === false && (await tab('mwc')).length === adaWc, JSON.stringify(wcB && wcB.aktif));
  const idWelding = await wcRow('Welding');
  await page.evaluate((id) => document.querySelector(`[data-act="wcedit"][data-id="${id}"]`)?.click(), idWelding); await wait(500);
  await page.fill('#modal input[name="nama"]', 'Welding Baru'); await kirimModal();
  const galatNama = await page.evaluate(() => (document.getElementById('modal') || { innerText: '' }).innerText.replace(/\s+/g, ' '));
  const wcW = (await tab('mwc')).find((w) => w.kode === 'WELDING');
  ok('E-12 mengganti nama Work Center yang masih dipakai ditolak (nama tidak berubah)', /Nama tidak bisa diubah/.test(galatNama) && wcW.nama === 'Welding', galatNama.slice(0, 160));
  await tutupModal();
  const idPacking = await wcRow('Packing');
  await page.evaluate((id) => document.querySelector(`[data-act="wcdel"][data-id="${id}"]`)?.click(), idPacking); await wait(500);
  const modalPack = await page.evaluate(() => document.getElementById('modal').innerText.replace(/\s+/g, ' '));
  await kirimModal();
  const setelahPack = await tab('mwc');
  ok('E-13 Work Center yang belum dipakai apa pun masih bisa dihapus setelah konfirmasi', /Hapus permanen/.test(modalPack) && setelahPack.length === adaWc - 1 && !setelahPack.some((w) => w.nama === 'Packing'), modalPack.slice(0, 140));
  // ---------- keyboard dan fokus dialog (WCAG 2.4.3): fokus masuk, Tab berputar, Escape menutup, fokus kembali ke pemicu ----------
  const fokusDalam = (sel) => page.evaluate((sel) => { const a = document.activeElement; const c = document.querySelector(sel); return !!(a && c && c.contains(a)); }, sel);
  const terlihat = (id) => page.evaluate((id) => { const d = document.getElementById(id); return !!d && !d.hidden && getComputedStyle(d).display !== 'none'; }, id);
  await page.evaluate(() => { location.hash = '#bahan-baku'; }); await wait(600);
  await page.evaluate(() => { const b = document.querySelector('[data-act="mv"][data-j="masuk"][data-g="rm"]'); b.focus(); window.__pemicu = 'terima'; });
  await page.keyboard.press('Enter'); await wait(500);
  const mBuka = await terlihat('modal'); const mFokus = await fokusDalam('#modal');
  for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
  const mTetap = await fokusDalam('#modal');
  for (let i = 0; i < 30; i++) await page.keyboard.press('Shift+Tab');
  const mTetapMundur = await fokusDalam('#modal');
  await page.keyboard.press('Escape'); await wait(300);
  const mTutup = !(await terlihat('modal'));
  const mKembali = await page.evaluate(() => document.activeElement && document.activeElement.matches('[data-act="mv"][data-j="masuk"][data-g="rm"]'));
  ok('E-14 modal: fokus masuk ke dalam, Tab maju dan mundur tidak keluar dari modal, Escape menutup, fokus kembali ke tombol pemicu', mBuka && mFokus && mTetap && mTetapMundur && mTutup && mKembali, JSON.stringify({ mBuka, mFokus, mTetap, mTetapMundur, mTutup, mKembali }));
  await page.evaluate(() => document.querySelector('tr[data-act="kartu"]').click()); await wait(700);
  const dBuka = await terlihat('drawer'); const dFokus = await fokusDalam('#drawer');
  for (let i = 0; i < 40; i++) await page.keyboard.press('Tab');
  const dTetap = await fokusDalam('#drawer');
  await page.keyboard.press('Escape'); await wait(300);
  const dTutup = !(await terlihat('drawer'));
  ok('E-15 laci kartu stok: fokus masuk ke dalam, Tab tetap di laci, Escape menutup', dBuka && dFokus && dTetap && dTutup, JSON.stringify({ dBuka, dFokus, dTetap, dTutup }));
  await page.evaluate(() => { location.hash = '#master-data'; }); await wait(500);
  await page.evaluate(() => document.querySelector('#tools [data-val="vendor"]')?.click()); await wait(300);
  await page.evaluate(() => document.querySelector('#tools [data-act="mnew"]')?.click()); await wait(500);
  await page.fill('#modal input[name="nama"]', 'PT Enter Uji'); await page.keyboard.press('Enter'); await wait(900);
  const vendorBaru = (await tab('mvendor')).filter((v) => v.nama === 'PT Enter Uji').length;
  ok('E-16 Enter di isian modal mengirim formulir (satu vendor baru tersimpan, tidak ganda)', vendorBaru === 1, String(vendorBaru));
  ok('E-17 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
