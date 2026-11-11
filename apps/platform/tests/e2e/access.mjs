// Uji hak akses per pengguna dan per modul di UI (mock, VITE_LOCAL_MOCK=1):
// super admin menambah anggota dengan hak modul khusus, anggota itu hanya melihat modul yang diizinkan,
// hak lihat saja mengunci tombol catat, dan perubahan hak oleh admin berlaku setelah muat ulang.
// Penegakan di database (RLS) diuji terpisah dengan transaksi yang di-rollback (lihat TEST_MATRIX).

export async function runAccess(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  const tab = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t], t);
  const opt = (sel, n) => page.evaluate(([s, n]) => [...document.querySelector(s).options].find((o) => o.text.includes(n))?.value, [sel, n]);
  const closeAll = async () => {
    await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); });
    await page.waitForTimeout(300);
  };
  const navIds = () => page.evaluate(() => [...document.querySelectorAll('#nav a')].map((a) => a.getAttribute('href').slice(1)));
  const go = async (r) => { await closeAll(); { const l = await page.$(`#nav a[href="#${r}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(300); if (r === 'spk') { const b = await page.$('#tools [data-view="spk"][data-val="list"]'); if (b) await b.click(); } } await page.waitForTimeout(550); };
  const submit = async () => { await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500); };
  const login = async (email) => {
    await page.evaluate(() => localStorage.removeItem('mni-local-mock-session'));
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', email); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await page.waitForTimeout(800);
  };
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

  await page.goto(base); await page.evaluate(() => localStorage.clear());

  // admin melihat menu Pengguna & Akses; peran lain tidak
  await login('viewer@mni.local');
  ok('A-01 viewer: menu Pengguna & Akses tidak tampil', !(await navIds()).includes('pengguna'));
  await login('admin@mni.local');
  ok('A-02 admin: menu Pengguna & Akses tampil', (await navIds()).includes('pengguna'));

  // admin menambah anggota: gudang bahan baku (ubah), bongkar muat (lihat saja), tanpa SPK
  await go('pengguna');
  await page.click('[data-act="uinvite"]'); await page.waitForTimeout(400);
  await page.fill('#m-nama', 'Tim Gudang Uji'); await page.fill('#m-email', 'timgudang@mni.local');
  await page.selectOption('select[name="role"]', 'gbb');
  await page.selectOption('select[name="mod_bongkar-muat"]', 'lihat');
  await page.selectOption('select[name="mod_spk"]', '');
  await submit();
  const pesan = await page.evaluate(() => (document.getElementById('m-invmsg') || {}).value || '');
  ok('A-03 akun dibuat dan pesan password tampil', /Password sementara: \S{8,}/.test(pesan) && pesan.includes('timgudang@mni.local'), pesan ? 'pesan siap' : 'tanpa pesan');
  await closeAll();
  const mu = (await tab('muser')).find((r) => r.email === 'timgudang@mni.local');
  ok('A-04 hak modul tersimpan', !!mu && mu.role === 'gbb' && mu.data.modul['bahan-baku'] === 'ubah' && mu.data.modul['bongkar-muat'] === 'lihat' && !mu.data.modul.spk, JSON.stringify(mu && mu.data));
  ok('A-05 daftar pengguna memuat anggota baru', (await page.evaluate(() => document.getElementById('body').innerText)).includes('timgudang@mni.local'));

  // anggota baru hanya melihat modul yang diizinkan
  await login('timgudang@mni.local');
  const ids = await navIds();
  ok('A-06 menu hanya modul yang diizinkan', sameSet(ids, ['dashboard', 'laporan', 'bahan-baku', 'sparepart', 'bongkar-muat', 'master-data']), ids.join(','));
  await page.evaluate(() => { location.hash = '#spk'; }); await page.waitForTimeout(600);
  ok('A-07 membuka modul tanpa akses dialihkan ke dashboard', (await page.evaluate(() => document.getElementById('ttl').textContent)) === 'Dashboard');
  const nSpk = await page.evaluate(() => new Promise(async (res) => { const db = await window.claude.use('db'); db.collection('spk').onSnapshot((s) => res(s.docs.length)); }));
  ok('A-08 data SPK tidak terbaca tanpa akses', nSpk === 0, String(nSpk));
  await go('bahan-baku');
  await page.click('#tools [data-act="mv"]:has-text("Terima material")'); await page.waitForTimeout(400);
  const n0 = (await tab('mutasi')).length;
  await page.selectOption('#m-item-0', await opt('#m-item-0', 'Plat')); await page.fill('#m-qty-0', '3'); await page.fill('#m-pihak', 'Supplier Contoh A');
  await submit(); await closeAll();
  ok('A-09 hak ubah: terima material tercatat', (await tab('mutasi')).length === n0 + 1);
  await go('bongkar-muat');
  ok('A-10 hak lihat saja: perkakas modul terkunci', await page.evaluate(() => document.getElementById('tools').classList.contains('locked')));
  const asAdmin = await page.evaluate(async () => { const u = await window.claude.use('user'); try { await u.manage('create', { email: 'x@mni.local', nama: 'X', role: 'viewer' }); return 'lolos'; } catch (e) { return e.message; } });
  ok('A-11 bukan admin: kelola pengguna ditolak', /super admin/i.test(asAdmin), asAdmin);

  // admin menambah hak SPK; berlaku setelah anggota memuat ulang
  await login('admin@mni.local'); await go('pengguna');
  await page.evaluate(() => { [...document.querySelectorAll('#body tr')].find((tr) => tr.innerText.includes('timgudang@mni.local')).querySelector('[data-act="uedit"]').click(); });
  await page.waitForTimeout(400);
  await page.selectOption('select[name="mod_spk"]', 'lihat');
  await submit();
  const mu2 = (await tab('muser')).find((r) => r.email === 'timgudang@mni.local');
  ok('A-12 admin menambah hak SPK (lihat)', mu2.data.modul.spk === 'lihat' && mu2.data.modul['bahan-baku'] === 'ubah');
  await login('timgudang@mni.local');
  ok('A-13 menu SPK muncul setelah muat ulang', (await navIds()).includes('spk'));
  const nSpk2 = await page.evaluate(() => new Promise(async (res) => { const db = await window.claude.use('db'); db.collection('spk').onSnapshot((s) => res(s.docs.length)); }));
  ok('A-14 data SPK terbaca setelah diberi akses', nSpk2 > 0, String(nSpk2));

  // Akun saya: info peran dan akses, ganti password (validasi), keluar
  await page.click('#who .mebtn'); await page.waitForTimeout(500);
  const akun = await page.evaluate(() => (document.querySelector('#modal .mbody') || {}).innerText || '');
  ok('A-15 Akun saya menampilkan peran dan akses modul', /Gudang Bahan Baku/.test(akun) && /Bahan baku/.test(akun) && /Ganti password/.test(akun) && /Keluar/.test(akun), akun.replace(/s+/g, ' ').slice(0, 120));
  await page.click('#modal [data-act="pwself"]'); await page.waitForTimeout(400);
  await page.fill('#m-pw1', 'abc'); await page.fill('#m-pw2', 'abc');
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(500);
  ok('A-16 ganti password: terlalu pendek ditolak', /minimal 8/.test(await page.evaluate(() => document.getElementById('merr').textContent)));
  await page.fill('#m-pw1', 'passwordbaru1'); await page.fill('#m-pw2', 'passwordbaru2');
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(500);
  ok('A-17 ganti password: tidak sama ditolak', /tidak sama/.test(await page.evaluate(() => document.getElementById('merr').textContent)));
  await page.fill('#m-pw2', 'passwordbaru1');
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(800);
  await page.click('#who .mebtn'); await page.waitForTimeout(400);
  await page.click('#modal [data-act="logout"]');
  await page.waitForTimeout(2500);
  ok('A-18 Keluar: kembali ke halaman masuk', await page.evaluate(() => { const g = document.getElementById('auth-gate'); return !!g && getComputedStyle(g).display !== 'none'; }));

  // Cadangan data: admin mengunduh JSON berisi semua tabel; bukan admin tidak melihat tombolnya
  await login('admin@mni.local');
  const bnOk = await page.evaluate(() => !!document.querySelector('.brief [data-act="backup"]'));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.evaluate(() => document.querySelector('[data-act="backup"]').click())]);
  const bkPath = await dl.path();
  const bk = JSON.parse((await import('node:fs')).readFileSync(bkPath, 'utf8'));
  ok('A-19 admin: unduh cadangan berisi semua tabel', bnOk && bk.format === 'mni-gudang-backup' && bk.jumlah.spk > 0 && bk.jumlah.muser >= 7 && 'role_modules' in bk.data && /^MNI-cadangan-[0-9]{4}-[0-9]{2}-[0-9]{2}\.json$/.test(dl.suggestedFilename()), JSON.stringify(bk.jumlah).slice(0, 90));
  await page.waitForTimeout(1200);
  ok('A-20 penanda cadangan tersimpan (peringatan hilang)', !(await page.evaluate(() => /belum ada cadangan/i.test((document.querySelector('.brief .bt') || {}).innerText || ''))));
  await login('gbb@mni.local');
  ok('A-21 bukan admin: tombol cadangan tidak ada', !(await page.evaluate(() => !!document.querySelector('[data-act="backup"]'))));

  // Impor CSV: pratinjau menolak baris bermasalah, lalu impor massal master dan item dengan stok awal
  await login('admin@mni.local'); await go('master-data');
  const nV0 = (await tab('mvendor')).length;
  await page.click('[data-act="importcsv"]'); await page.waitForTimeout(400);
  await page.selectOption('#m-jenis', 'vendor');
  await page.fill('#m-csv', 'nama,proses,pic\nPT Impor Satu,HDG,Budi\n,ELG,Tanpa Nama\nPT Impor Satu,HDG,Ganda\nVendor Finishing Contoh,HDG,Sudah Ada');
  await page.waitForTimeout(300);
  const prev = await page.evaluate(() => document.getElementById('m-prev').innerText);
  ok('A-23 pratinjau CSV: 1 siap, 2 dilewati, 1 bermasalah', /1\s*baris siap/.test(prev) && /2\s*dilewati/.test(prev) && /1\s*bermasalah/.test(prev) && /Kolom wajib kosong/.test(prev), prev.replace(/\s+/g, ' ').slice(0, 110));
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(600);
  ok('A-24 impor ditolak selama masih ada baris bermasalah', (await tab('mvendor')).length === nV0);
  await page.fill('#m-csv', 'nama;proses;pic\nPT Impor Satu;HDG;Budi\nPT Impor Dua;ELG;Sari');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500);
  ok('A-25 impor vendor (pemisah titik koma): 2 baris masuk', (await tab('mvendor')).length === nV0 + 2);
  const nRm0 = (await tab('rm')).length;
  await page.click('[data-act="importcsv"]'); await page.waitForTimeout(400);
  await page.selectOption('#m-jenis', 'rm');
  await page.fill('#m-csv', 'item,ukuran,satuan,buffer,stok_awal\nPlat Impor,1.5x1219x2438,Lembar,10,"1,5"\nPlat Impor,2.0x1219x2438,Lembar,5,40');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500);
  const rmNew = (await tab('rm')).filter((r) => r.data && r.data.item === 'Plat Impor' || r.item === 'Plat Impor');
  ok('A-26 impor bahan baku dengan stok awal', (await tab('rm')).length === nRm0 + 2 && rmNew.length === 2, 'rm ' + (await tab('rm')).length);
  ok('A-27 bukan admin: tombol Impor CSV tidak ada', await (async () => { await login('gbb@mni.local'); await go('master-data'); return !(await page.evaluate(() => !!document.querySelector('[data-act="importcsv"]'))); })());

  // Riwayat perubahan (audit database): baris contoh disuntik ke mock; admin melihatnya di Pengguna & Akses
  await login('admin@mni.local');
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mni-local-mock-db'));
    s.tables.audit_log = [
      { id: 2, at: '2026-11-03T10:15:00Z', tabel: 'spk', aksi: 'UPDATE', baris_id: 'abc12345', oleh: 'ppic@mni.local', lama: { no: '1001', status: 'Draft', data: { catatan: 'a' } }, baru: { no: '1001', status: 'Terbit', data: { catatan: 'b' } } },
      { id: 1, at: '2026-11-03T09:00:00Z', tabel: 'rm', aksi: 'INSERT', baris_id: 'def67890', oleh: 'gbb@mni.local', lama: null, baru: { item: 'Plat Uji', data: {} } },
    ];
    localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
  });
  await page.reload(); await page.waitForTimeout(3500);
  await page.evaluate(() => { location.hash = '#pengguna'; }); await page.waitForTimeout(1500);
  const aud = await page.evaluate(() => document.getElementById('body').innerText);
  ok('A-28 riwayat perubahan tampil untuk admin', /Riwayat perubahan/.test(aud) && /Ubah/.test(aud) && /Tambah/.test(aud) && /status, catatan/.test(aud) && /Plat Uji/.test(aud), JSON.stringify(aud.slice(aud.indexOf('Riwayat perubahan'), aud.indexOf('Riwayat perubahan') + 300)));

  // Berat otomatis dari kalkulator (katalog uji sederhana): terisi otomatis, bisa ditimpa manual, hitung ulang bila dikosongkan
  await login('admin@mni.local'); await go('master-data');
  const fixture = new URL('./fixtures/katalog-uji.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  await page.click('[data-act="katberat"]'); await page.waitForTimeout(400);
  await page.setInputFiles('#m-kb', decodeURIComponent(fixture));
  await submit();
  await page.waitForFunction(() => window.MNIBerat && window.MNIBerat.siap(), null, { timeout: 15000 }).catch(() => {});
  ok('A-29 katalog berat terpasang dari database', await page.evaluate(() => !!(window.MNIBerat && window.MNIBerat.siap())), JSON.stringify(await page.evaluate(() => window.MNIBerat && window.MNIBerat.info())));
  await go('spk');
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'); await page.dispatchEvent('#ed-h-0', 'change'); await page.waitForTimeout(500);
  // dengan katalog terpasang baris awal berbentuk terstruktur; jalur teks bebas (tempel dari Excel, SPK lama) diuji di sini
  if (await page.$('#ed-sb-0-0')) { await page.selectOption('#ed-sb-0-0', ''); await page.waitForSelector('#ed-d-0-0'); }
  await page.fill('#ed-d-0-0', 'Cable Tray W100xH100xL3000 1.2'); await page.dispatchEvent('#ed-d-0-0', 'change'); await page.waitForTimeout(400);
  const w1 = parseFloat(await page.inputValue('#ed-w-0-0'));
  ok('A-30 berat terisi otomatis dari kalkulator', Math.abs(w1 - 8.69) < 0.005 && (await page.textContent('#ed-w-0-0 >> xpath=..')).includes('auto'), String(w1));
  await page.fill('#ed-w-0-0', '9.5'); await page.waitForTimeout(200);
  ok('A-31 pengguna menimpa: tertanda manual', (await page.textContent('#ed-w-0-0 >> xpath=..')).includes('manual'));
  await page.fill('#ed-d-0-0', 'Cable Tray W200xH100xL3000 1.2'); await page.dispatchEvent('#ed-d-0-0', 'change'); await page.waitForTimeout(400);
  ok('A-32 angka manual tidak ditimpa saat deskripsi berubah', parseFloat(await page.inputValue('#ed-w-0-0')) === 9.5);
  await page.fill('#ed-w-0-0', ''); await page.fill('#ed-d-0-0', 'Cable Tray W300xH100xL3000 1.2'); await page.dispatchEvent('#ed-d-0-0', 'change'); await page.waitForTimeout(400);
  const w3 = parseFloat(await page.inputValue('#ed-w-0-0'));
  ok('A-33 dikosongkan lalu dihitung ulang otomatis (W300: 14.48)', Math.abs(w3 - 14.483) < 0.01, String(w3));
  await page.fill('#ed-d-0-0', 'Baut M10 custom'); await page.dispatchEvent('#ed-d-0-0', 'change'); await page.waitForTimeout(300);
  ok('A-34 item tak dikenali: berat otomatis dikosongkan, tidak menebak', (await page.inputValue('#ed-w-0-0')) === '');

  ok('A-22 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
