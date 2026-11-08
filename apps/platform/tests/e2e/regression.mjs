// Regresi penuh pratinjau lokal mode mock (VITE_LOCAL_MOCK=1): login, 10 modul, dan 22 alur inti.
// Berasal dari skenario yang dijalankan lewat Playwright MCP pada 2026-11-02 (36 PASS, 0 FAIL;
// hasil di documentation/TEST_MATRIX.md). Menerima objek `page` Playwright:
//
//   const { pass, fail, detail } = await runRegression(page, 'http://127.0.0.1:5173/');
//
// Syarat: dev server mock berjalan (npx vite --host 127.0.0.1 --port 5173 --no-open dengan
// VITE_LOCAL_MOCK=1) dan data bersih (skrip menghapus localStorage). Gunakan SATU tab.
// Uji ini memeriksa UI dan bentuk data terhadap mock yang meniru batasan Postgres (UUID, kolom);
// bukan pengganti uji Supabase nyata (T-021, T-022, T-028).

// Baris SPK: bila bentuk terstruktur aktif (katalog berat terpasang), pilih "Teks bebas" dulu agar kolom #ed-d tersedia (pola access.mjs).
async function teksBebas(page, si, li) {
  await page.evaluate(([si, li]) => { const s = document.querySelector(`#ed-sb-${si}-${li}`); if (s && s.value !== '') { s.value = ''; s.dispatchEvent(new Event('change', { bubbles: true })); } }, [si, li]);
  await page.waitForSelector(`#ed-d-${si}-${li}`, { timeout: 5000 });
}
export async function runRegression(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
  const consoleErr = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 120)); });
  const tab = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t], t);
  const closeAll = async () => {
    await page.evaluate(() => {
      document.querySelector('#modal [data-act="closemodal"]')?.click();
      document.querySelector('#drawer [data-act="closedrawer"]')?.click();
      document.querySelector('#sheet [data-act="sheet-close"]')?.click();
      if (!document.getElementById('editor').hidden) document.querySelector('#editor [data-act="ed-close"]')?.click();
    });
    await page.waitForTimeout(350);
  };
  const go = async (r) => { await closeAll(); { const l = await page.$(`#nav a[href="#${r}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(300); if (r === 'spk') { const b = await page.$('#tools [data-view="spk"][data-val="list"]'); if (b) await b.click(); } } await page.waitForTimeout(550); };
  const opt = (sel, n) => page.evaluate(([s, n]) => [...document.querySelector(s).options].find((o) => o.text.includes(n))?.value, [sel, n]);
  const submit = async () => { await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(900); };
  const rowOpen = async (no) => {
    for (const r of await page.$$('#body [data-act="openspk"]')) {
      if ((await r.innerText()).includes(no)) { await r.click(); await page.waitForTimeout(700); return true; }
    }
    return false;
  };
  const dockOff = () => page.evaluate(() => { const d = document.getElementById('m-dock'); if (d && d.checked) d.click(); });

  // Login
  await page.goto(base); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
  await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
  await page.waitForTimeout(3000); // halaman dimuat ulang setelah login
  await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 5 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
  ok('F-01 login + nama', (await page.evaluate(() => document.getElementById('who').innerText)).includes('Admin Lokal'));

  // Smoke 10 modul
  const mods = [['dashboard', 'Dashboard'], ['bahan-baku', 'Gudang Bahan Baku'], ['barang-jadi', 'Gudang Barang Jadi'], ['bongkar-muat', 'Bongkar Muat'], ['vendor', 'Kirim ke Vendor'], ['pengiriman', 'Kirim ke Customer'], ['spk', 'SPK Berjalan'], ['produksi', 'Kinerja & Analisa'], ['cek-data', 'Cek Data'], ['master-data', 'Master Data']];
  for (const [r, l] of mods) {
    const e0 = errors.length; await go(r);
    const t = await page.evaluate(() => document.getElementById('ttl').textContent.trim());
    ok('modul ' + r, t === l && errors.length === e0);
  }

  // Bahan baku
  await go('bahan-baku'); let n = (await tab('rm')).length;
  await page.click('#tools [data-act="newitem"]'); await page.waitForTimeout(400);
  await page.fill('#m-item', 'Plat Uji E2E'); await page.fill('#m-ukuran', '1.5×1000×2000'); await page.fill('#m-satuan', 'lbr'); await page.fill('#m-buffer', '5'); await page.fill('#m-stokAwal', '10');
  await page.click('#modal button:has-text("Simpan")'); await page.waitForTimeout(800);
  ok('F-02 item baru', (await tab('rm')).length === n + 1);
  n = (await tab('mutasi')).length;
  await page.click('#tools [data-act="mv"]:has-text("Terima material")'); await page.waitForTimeout(400);
  await page.selectOption('#m-item-0', await opt('#m-item-0', 'Plat Uji E2E')); await page.fill('#m-qty-0', '7'); await page.fill('#m-pihak', 'Supplier Contoh A'); await submit();
  ok('F-03 terima material', (await tab('mutasi')).length === n + 1);
  n = (await tab('mutasi')).length;
  await page.click('#tools [data-act="mv"]:has-text("Pakai produksi")'); await page.waitForTimeout(400);
  await page.selectOption('#m-spk', await opt('#m-spk', '1001')); await page.selectOption('#m-item-0', await opt('#m-item-0', 'Plat Uji E2E')); await page.fill('#m-qty-0', '999'); await submit();
  ok('F-05 pakai > stok ditolak', (await tab('mutasi')).length === n);
  await page.fill('#m-qty-0', '3'); await submit();
  ok('F-04 pakai produksi', (await tab('mutasi')).length === n + 1);
  // B-015: penomoran dokumen harus naik (dua penerimaan tidak boleh memakai nomor sama)
  await closeAll(); await go('bahan-baku');
  await page.click('#tools [data-act="mv"]:has-text("Terima material")'); await page.waitForTimeout(400);
  await page.selectOption('#m-item-0', await opt('#m-item-0', 'Plat Uji E2E')); await page.fill('#m-qty-0', '1'); await page.fill('#m-pihak', 'Supplier Contoh A'); await dockOff(); await submit();
  const rcv = (await tab('mutasi')).filter((m) => String(m.no_dok || '').startsWith('RCV/'));
  ok('B-015 nomor dokumen RCV unik dan naik', rcv.length >= 2 && new Set(rcv.map((m) => m.no_dok)).size === rcv.length, rcv.map((m) => m.no_dok).join(','));
  ok('B-016 mutasi.item_id terisi', (await tab('mutasi')).filter((m) => m.gudang === 'rm' && m.jenis === 'masuk').every((m) => /^[0-9a-f-]{36}$/.test(String(m.item_id || ''))));
  await closeAll();

  // Barang jadi
  await go('barang-jadi'); n = (await tab('mutasi')).length;
  await page.click('#tools [data-act="mv"]:has-text("Barang masuk")'); await page.waitForTimeout(400);
  await page.selectOption('#m-item-0', await opt('#m-item-0', '40x40')); await page.fill('#m-qty-0', '5'); await submit();
  ok('F-07 barang masuk', (await tab('mutasi')).length === n + 1);
  n = (await tab('mutasi')).length;
  await page.click('#tools [data-act="mv"]:has-text("Barang keluar")'); await page.waitForTimeout(400);
  await page.selectOption('#m-item-0', await opt('#m-item-0', '40x40')); await page.fill('#m-qty-0', '999'); await submit();
  ok('F-08 keluar > stok ditolak', (await tab('mutasi')).length === n);
  await closeAll(); n = (await tab('mutasi')).length;
  await page.click('#tools [data-act="mv"]:has-text("Stock opname")'); await page.waitForTimeout(400);
  await page.selectOption('#m-item', await opt('#m-item', '40x40')); await page.fill('#m-fisik', '118'); await page.fill('#m-ket', 'Opname uji'); await submit();
  ok('F-17 opname', (await tab('mutasi')).length === n + 1);

  // Master
  await go('master-data'); n = (await tab('mvendor')).length;
  await page.click('#tools [data-act="mnew"]'); await page.waitForTimeout(400);
  await page.fill('#modal input[name="nama"]', 'Vendor Uji E2E'); await page.click('#modal button:has-text("Simpan")'); await page.waitForTimeout(800);
  ok('F-09 master tambah', (await tab('mvendor')).length === n + 1);

  // SPK: baru, revisi, duplikat, produksi
  await go('spk'); n = (await tab('spk')).length;
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-cust', 'Customer Uji E2E'); await page.fill('#ed-po', 'PO-E2E'); await page.fill('#ed-due', '2026-12-15'); await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', 'Hollow Uji'); await page.fill('#ed-q-0-0', '4'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(1800);
  const s3 = (await tab('spk')).find((s) => s.no === '1003');
  ok('F-10 SPK baru (UUID, no 1003)', (await tab('spk')).length === n + 1 && !!s3 && /^[0-9a-f-]{36}$/.test(s3.id));
  const sheet = await page.evaluate(() => { const s = document.getElementById('sheet'); return { hidden: s.hidden, len: s.innerText.length }; });
  ok('B-010 lembar SPK terbuka berisi', !sheet.hidden && sheet.len > 50);
  await closeAll(); await go('spk');
  await rowOpen('1002'); await page.click('#drawer [data-act="spkedit"]'); await page.waitForTimeout(800);
  await page.fill('#ed-po', 'PO-REV'); await page.click('#editor button:has-text("Simpan revisi")'); await page.waitForTimeout(600);
  const noReason = (await tab('spk')).find((s) => s.no === '1002').po !== 'PO-REV';
  await page.fill('#ed-rev', 'Koreksi uji'); await page.click('#editor button:has-text("Simpan revisi")'); await page.waitForTimeout(1500);
  const s2 = (await tab('spk')).filter((s) => s.no === '1002');
  ok('F-22 revisi SPK (alasan wajib, tanpa baris ganda)', noReason && s2.length === 1 && s2[0].rev === 1 && s2[0].po === 'PO-REV');
  await closeAll(); await go('spk'); n = (await tab('spk')).length;
  await rowOpen('1001'); await page.click('#drawer [data-act="spkdup"]'); await page.waitForTimeout(800);
  await page.fill('#ed-cust', 'Customer Duplikat'); await page.fill('#ed-due', '2026-12-20'); await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', 'Item dup'); await page.fill('#ed-q-0-0', '2'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor [data-act="ed-save"]:has-text("draft")'); await page.waitForTimeout(1500);
  ok('F-23 duplikat SPK -> draft', (await tab('spk')).length === n + 1 && (await tab('spk')).some((s) => s.status === 'Draft'));
  // B-013: SPK tanpa tanggal due (string kosong) harus tersimpan sebagai NULL
  await go('spk'); n = (await tab('spk')).length;
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-cust', 'Customer Tanpa Due'); await page.fill('#ed-due', ''); await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', 'Item tanpa due'); await page.fill('#ed-q-0-0', '1'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor [data-act="ed-save"]:has-text("draft")'); await page.waitForTimeout(1500);
  const noDue = (await tab('spk')).find((s) => s.customer === 'Customer Tanpa Due');
  ok('B-013 SPK tanpa due tersimpan (due null)', (await tab('spk')).length === n + 1 && !!noDue && noDue.due === null);
  await closeAll();
  await go('spk'); await rowOpen('1002'); await page.click('#drawer [data-act="prod"]'); await page.waitForTimeout(600);
  await page.click('#modal [data-act="prodall"]'); await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(900);
  ok('F-20/21 produksi + set semua selesai', (await tab('spk')).find((s) => s.no === '1002').items.every((i) => Number(i.prod) === Number(i.q)));
  await closeAll();

  // Vendor
  await go('vendor'); n = (await tab('vendor')).length;
  await page.click('#tools [data-act="newvendor"]'); await page.waitForTimeout(500);
  await page.fill('#m-vendor', 'Vendor Finishing Contoh'); await page.fill('#m-proses', 'Powder coat'); await page.selectOption('#m-spk', await opt('#m-spk', '1003')); await page.waitForTimeout(400); await submit();
  ok('F-11 kirim ke vendor', (await tab('vendor')).length === n + 1);
  await page.click('#body [data-act="terima"] >> nth=0'); await page.waitForTimeout(600);
  await page.fill('#m-r_0', '2'); await page.fill('#m-x_0', '1'); await submit();
  const rejNoNote = (await tab('vendor')).at(-1).items[0].kembali === 0;
  await page.fill('#m-ket', 'Goresan'); await dockOff(); await submit();
  ok('F-24a reject wajib catatan + terima sebagian', rejNoNote && (await tab('vendor')).at(-1).status === 'Kembali Sebagian');
  await page.click('#body [data-act="terima"] >> nth=0'); await page.waitForTimeout(600);
  await dockOff(); await submit();
  ok('F-24b terima sisa -> Selesai', (await tab('vendor')).at(-1).status === 'Selesai');

  // Surat jalan
  await go('pengiriman'); n = (await tab('kirim')).length;
  await page.click('#tools [data-act="newkirim"]'); await page.waitForTimeout(500);
  await page.selectOption('#m-spk', await opt('#m-spk', '1003')); await page.waitForTimeout(400); await dockOff(); await submit();
  ok('F-12 surat jalan', (await tab('kirim')).length === n + 1);
  await page.click('#body [data-act="kstep"] >> nth=0'); await page.waitForTimeout(700);
  await page.click('#body [data-act="kstep"] >> nth=0'); await page.waitForTimeout(700);
  ok('F-25 status SJ -> Diterima', (await tab('kirim')).at(-1).status === 'Diterima');

  // Bongkar muat
  await go('bongkar-muat'); n = (await tab('bongkar')).length;
  await page.click('#tools [data-act="newbm"]'); await page.waitForTimeout(500);
  await page.fill('#m-pihak', 'Supplier Uji');
  await page.selectOption('#m-armsel', { index: await page.evaluate(() => [...document.querySelector('#m-armsel').options].findIndex((o) => o.text.includes('manual'))) }); await page.waitForTimeout(300);
  await page.fill('#m-nopol_m', 'B 7777 UJI'); await submit();
  ok('F-13 bongkar muat dicatat', (await tab('bongkar')).length === n + 1);

  // Filter Type di Gudang Barang Jadi: mengikuti kategori, urutan baku, kombinasi dengan finishing
  await go('barang-jadi');
  const baris = () => page.$$eval('#body tbody tr', (a) => a.length);
  const opsi = (id) => page.$$eval(`#${id} option`, (a) => a.map((o) => o.value));
  const total = await baris();
  const dataFg = await tab('fg');
  const typeAda = [...new Set(dataFg.map((r) => (r.type || '').trim()).filter(Boolean))];
  const tipeUrut = (await opsi('f-type')).filter(Boolean);
  ok('F-15 filter Type ada, opsi sesuai data dan urutan baku (STU, STC, SLU, SLW, SLHD dulu)', tipeUrut.length === typeAda.length && typeAda.every((x) => tipeUrut.includes(x)) && tipeUrut.join() === [...tipeUrut].sort((a, b) => { const o = ['STU', 'STC', 'SLU', 'SLW', 'SLHD']; return (o.indexOf(a) < 0 ? 99 : o.indexOf(a)) - (o.indexOf(b) < 0 ? 99 : o.indexOf(b)) || a.localeCompare(b); }).join(), tipeUrut.join());
  if (tipeUrut.length) {
    const t1 = tipeUrut[0];
    await page.selectOption('#f-type', t1); await page.waitForTimeout(300);
    const nFilter = await baris();
    ok('F-16 memilih Type menyaring baris sesuai type', nFilter === dataFg.filter((r) => (r.type || '').trim() === t1).length && nFilter < total, `${nFilter}/${total}`);
    const katSemua = (await opsi('f-kat')).filter(Boolean);
    const katLain = katSemua.find((k) => !dataFg.some((r) => r.kategori === k && (r.type || '').trim() === t1));
    if (katLain) {
      await page.selectOption('#f-kat', katLain); await page.waitForTimeout(400);
      ok('F-17 ganti kategori yang tidak punya type itu: type kembali Semua dan opsi menyesuaikan kategori', (await page.inputValue('#f-type')) === '' && !(await opsi('f-type')).includes(t1) && (await baris()) === dataFg.filter((r) => r.kategori === katLain).length);
    } else ok('F-17 (dilewati: semua kategori memiliki type itu)', true);
    await page.selectOption('#f-kat', ''); await page.selectOption('#f-type', ''); await page.waitForTimeout(300);
    ok('F-18 mengosongkan filter mengembalikan semua baris', (await baris()) === total);
  }

  // Ekspor CSV
  const dl = {};
  for (const r of ['bahan-baku', 'barang-jadi', 'spk', 'bongkar-muat', 'vendor', 'pengiriman', 'produksi', 'cek-data', 'master-data']) {
    await go(r);
    const b = await page.$('#tools [data-act="csv"], #tools [data-act="cekcsv"], #tools [data-act="mcsv"]');
    try { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 4000 }), b.click()]); dl[r] = d.suggestedFilename().endsWith('.csv'); } catch { dl[r] = false; }
  }
  ok('F-14 CSV 9 modul', Object.values(dl).every(Boolean), JSON.stringify(Object.entries(dl).filter(([, v]) => !v).map(([k]) => k)));

  // Aktivitas tercatat di log (log tidak boleh gagal diam-diam)
  ok('log aktivitas tercatat', (await tab('log')).length >= 10);

  // Persistensi dan galat
  await page.reload(); await page.waitForTimeout(3000);
  ok('persisten setelah reload', (await tab('spk')).length >= 4 && (await page.evaluate(() => document.querySelectorAll('#nav a').length)) > 5);
  ok('tanpa pageerror', errors.length === 0, errors.slice(0, 3).join(' | '));
  ok('tanpa galat console', consoleErr.length === 0, consoleErr.slice(0, 2).join(' | '));
  return { pass: R.filter((x) => x.startsWith('PASS')).length, fail: R.filter((x) => x.startsWith('FAIL')).length, detail: R };
}
