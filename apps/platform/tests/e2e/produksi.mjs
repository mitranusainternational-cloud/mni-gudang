// Uji produksi multi work center (mock): rute dari produk, Antrian Mesin per work center, validasi urutan langkah,
// beban per work center di Dashboard Produksi, dan kemajuan item dari kejadian per mesin.
// Baris SPK: bila bentuk terstruktur aktif (katalog berat terpasang), pilih "Teks bebas" dulu agar kolom #ed-d tersedia (pola access.mjs).
async function teksBebas(page, si, li) {
  await page.evaluate(([si, li]) => { const s = document.querySelector(`#ed-sb-${si}-${li}`); if (s && s.value !== '') { s.value = ''; s.dispatchEvent(new Event('change', { bubbles: true })); } }, [si, li]);
  await page.waitForSelector(`#ed-d-${si}-${li}`, { timeout: 5000 });
}
export async function runProduksi(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  const tab = (t) => page.evaluate((t) => JSON.parse(localStorage.getItem('mni-local-mock-db')).tables[t] || [], t);
  const closeAll = async () => {
    await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); document.querySelector('#drawer [data-act="closedrawer"]')?.click(); document.querySelector('#sheet [data-act="sheet-close"]')?.click(); });
    await page.waitForTimeout(300);
  };
  const go = async (r) => { await closeAll(); { const l = await page.$(`#nav a[href="#${r}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(300); if (r === 'spk') { const b = await page.$('#tools [data-view="spk"][data-val="list"]'); if (b) await b.click(); } if (r === 'produksi') { const b = await page.$('#tools [data-view="produksi"][data-val="wc"]'); if (b) await b.click(); } } await page.waitForTimeout(700); };
  const login = async (email) => {
    await page.evaluate(() => localStorage.removeItem('mni-local-mock-session'));
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', email); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForTimeout(2000);
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await page.waitForTimeout(800);
  };
  const antri = (wc) => page.evaluate((w) => { const r = document.querySelector(`#wc-beban tr[data-wc="${w}"]`); return r ? +r.dataset.antri : null; }, wc);
  const hasilEv = async () => (await tab('produksi_log')).filter((e) => (e.jenis || 'hasil') === 'hasil');
  // Catat hasil lewat dialog (jam mulai dan selesai wajib): baris pertama di antrian work center itu
  const simpanMesin = async (wc, nilai, { reject = '', baris = 1, semua = false } = {}) => {
    await page.selectOption('#f-mesin', wc); await page.waitForTimeout(500);
    await page.click(`#mesin-antri .mcard:nth-child(${baris}) [data-act="mesincatat"]`); await page.waitForTimeout(400);
    if (semua) await page.check('#mform [name="semua"]');
    else { await page.fill('#m-qty', String(nilai)); await page.fill('#m-reject', String(reject)); }
    await page.evaluate(() => { const d = document.querySelector('#modal details'); if (d) d.open = true; }); await page.fill('#m-mulai', '08:00'); await page.fill('#m-selesai', '09:00');
    await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500);
    await closeAll();
  };

  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await login('admin@mni.local');
  // work center standar dengan kapasitas per hari (disuntik ke mock)
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString();
    const dua = [{ nama: 'Punching 1 (20 Ton)', operator: ['Operator C'], kapasitas: 25 }, { nama: 'Punching 2 (40 Ton)', operator: ['Operator D'], kapasitas: 25 }];
    s.tables.mwc = [['WC-1', 'Shearing', 1, 100, []], ['WC-2', 'Punching', 2, 50, dua], ['WC-3', 'Bending', 3, 40, []], ['WC-4', 'CNC Laser', 4, 60, []], ['WC-5', 'Welding', 5, 30, []]]
      .map(([kode, nama, urutan, kap, mesin]) => ({ id: crypto.randomUUID(), kode, nama, tipe: 'Internal', urutan, aktif: true, created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', data: { kapasitas: kap, mesin } }));
    localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
  });
  await page.reload(); await page.waitForTimeout(3500);

  // SPK Cable Tray 20 btg (rute otomatis: Shearing, Punching, Bending)
  await go('spk');
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-cust', 'Customer Rute'); await page.fill('#ed-due', '2026-12-15');
  await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'); await page.dispatchEvent('#ed-h-0', 'change'); await page.waitForTimeout(300);
  await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', 'Cable Tray W100xH100xL3000 1.2'); await page.fill('#ed-q-0-0', '20'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(1800);

  await go('mesin');
  ok('M-01 Antrian Mesin tampil untuk Shearing dengan item SPK baru', (await page.textContent('#mesin-antri')).includes('Cable Tray W100xH100xL3000'));
  const rute = await page.$$eval('#mesin-antri .mcard:first-child .rchip', (a) => a.map((x) => x.textContent));
  ok('M-02 rute Cable Tray ELECTRO: tiga mesin lalu Vendor ELG', JSON.stringify(rute) === JSON.stringify(['Shearing', 'Punching', 'Bending', 'Vendor ELG']), rute.join(','));

  await simpanMesin('Shearing', 20);
  const ev1 = await hasilEv();
  ok('M-03 hasil Shearing 20 tercatat sebagai kejadian', ev1.length === 1 && ev1[0].wc === 'Shearing' && Number(ev1[0].qty) === 20, JSON.stringify(ev1.map((e) => [e.wc, e.qty])));
  ok('M-03b kejadian membawa mesin, durasi 60 menit, nomor SPK, customer, dan tonase dari berat per pcs', ev1[0].mesin === 'Shearing' && Number(ev1[0].menit) === 60 && ev1[0].customer === 'Customer Rute' && !!ev1[0].spk_no && !!ev1[0].mulai, JSON.stringify([ev1[0].mesin, ev1[0].menit, ev1[0].customer, ev1[0].spk_no, ev1[0].tonase]));

  await page.selectOption('#f-mesin', 'Punching'); await page.waitForTimeout(500);
  ok('M-04 item pindah otomatis ke antrian Punching (siap 20)', /20/.test(await page.textContent('#mesin-antri .mcard:first-child .mq-siap')));
  const msnOpsi = await page.$$eval('#f-mesin-msn option', (a) => a.map((x) => x.textContent));
  ok('M-04b Punching punya dua mesin untuk dipilih', msnOpsi.length === 2 && msnOpsi[1] === 'Punching 2 (40 Ton)', msnOpsi.join(','));
  await simpanMesin('Punching', 25);
  ok('M-05 melebihi yang siap ditolak (tidak tercatat)', (await hasilEv()).length === 1);
  await simpanMesin('Punching', 8);
  const e6 = await hasilEv();
  ok('M-06 Punching 8 tercatat di mesin Punching 1', e6.length === 2 && e6[1].mesin === 'Punching 1 (20 Ton)', e6.map((e) => e.mesin).join(','));

  await page.selectOption('#f-mesin', 'Bending'); await page.waitForTimeout(500);
  ok('M-07 Bending hanya melihat 8 yang selesai Punching', /8/.test(await page.textContent('#mesin-antri .mcard:first-child .mq-siap')));
  await page.selectOption('#f-mesin', 'Shearing'); await page.waitForTimeout(500);
  ok('M-08 Shearing tidak punya antrian lagi', !(await page.$('#mesin-antri')));

  // Papan mesin dan kapasitas aktual (Produksi Hari Ini v3)
  await page.selectOption('#f-mesin', 'Punching'); await page.waitForTimeout(600);
  const tl = await page.$$eval('#pm-tiles .pm-tile', (a) => a.map((x) => x.querySelector('b').textContent));
  await page.click('#pm-tiles .pm-tile:nth-child(2)'); await page.waitForTimeout(500);
  const msn2 = await page.inputValue('#f-mesin-msn');
  await page.click('#pm-tiles .pm-tile:nth-child(1)'); await page.waitForTimeout(500);
  const msn1 = await page.inputValue('#f-mesin-msn');
  ok('M-143 papan mesin: satu kartu per mesin work center, ketuk kartu memilih mesin tanpa membuka pilihan', tl.length === 2 && tl[1] === 'Punching 2 (40 Ton)' && msn2 === 'Punching 2 (40 Ton)' && msn1 === 'Punching 1 (20 Ton)', JSON.stringify([tl, msn2, msn1]));
  const kp = await page.$$eval('#pm-kin .pm-st b', (a) => a.map((x) => x.textContent.replace(/\s+/g, '')));
  ok('M-144 kapasitas aktual Punching 1: output 8, laju 8 pcs/jam (8 pcs dalam 60 menit), mesin dipakai 13% dari 8 jam, proyeksi 64', kp[0] === '8pcs' && kp[1] === '8pcs/jam' && kp[2] === '13%' && kp[3] === '64pcs', JSON.stringify(kp));
  const sub = await page.evaluate(() => document.getElementById('pm-kin').innerText);
  ok('M-145 target laju diturunkan dari kapasitas per hari (25 per 8 jam = 3,1 pcs/jam) dan capaian 32% dari kapasitas', /target 3,1 pcs\/jam/.test(sub) && /32% dari kapasitas 25/.test(sub), sub.replace(/\s+/g, ' ').slice(0, 260));
  const ch = await page.evaluate(() => ({ grafik: document.querySelectorAll('#pm-kin .pm-bars').length, jam: [...document.querySelectorAll('#pm-kin .pm-ch:first-child .pm-c b')].map((x) => x.textContent), tren: document.querySelectorAll('#pm-kin .pm-ch:last-child .pm-c').length }));
  ok('M-146 grafik output per jam menampilkan 8 di jam selesai dan tren 7 hari tampil', ch.grafik === 2 && ch.jam.join() === '8' && ch.tren === 7, JSON.stringify(ch));

  await go('produksi');
  const a = { s: await antri('Shearing'), p: await antri('Punching'), b: await antri('Bending') };
  ok('M-10 beban per work center: Shearing 0, Punching 12, Bending 8', a.s === 0 && a.p === 12 && a.b === 8, JSON.stringify(a));
  const txt = await page.textContent('#wc-beban');
  ok('M-11 hari habis dan status terhitung dari kapasitas (Punching 12/50, Bending 8/40)', /Normal/.test(txt) && /Kosong/.test(txt));

  // Timer: Mulai, kartu sesi berjalan, Semua, Selesai dan simpan
  await go('mesin'); await page.selectOption('#f-mesin', 'Bending'); await page.waitForTimeout(500);
  await page.click('#mesin-antri .mcard:first-child [data-act="mesinmulai"]'); await page.waitForTimeout(1200);
  ok('M-11b sesudah Mulai tampil kartu sedang dikerjakan dan tombol Mulai terkunci', !!(await page.$('.mesin-run')) && (await page.$$eval('#mesin-antri [data-act="mesinmulai"]', (a) => a.length)) === 0);
  ok('M-11c peristiwa mulai tercatat dan belum mengubah antrian', (await tab('produksi_log')).filter((e) => e.jenis === 'mulai').length === 1 && (await hasilEv()).length === 2);
  ok('M-147 kartu mesin berubah Berjalan dan sesi ikut dihitung di menit pakai', (await page.$$eval('#pm-tiles .pm-tile.run', (a) => a.length)) === 1 && /Berjalan/.test(await page.textContent('#pm-tiles .pm-tile.run')) && /sesi berjalan ikut dihitung/.test(await page.textContent('#pm-kin')));
  await page.click('.mesin-run [data-act="mesinsemua"]');
  ok('M-11d tombol Semua mengisi jumlah yang siap (8)', (await page.inputValue('.mesin-run [data-mrq]')) === '8');
  await page.click('.mesin-run [data-act="mesinselesai"]'); await page.waitForTimeout(1500);
  const evs = await hasilEv();
  ok('M-12 Selesai dan simpan: Bending 8 dengan jam mulai dan durasi dari timer', evs.length === 3 && evs[2].wc === 'Bending' && Number(evs[2].qty) === 8 && !!evs[2].mulai && !!evs[2].selesai && evs[2].menit != null, JSON.stringify([evs[2].qty, evs[2].menit]));
  ok('M-12b sesudah selesai kartu sesi hilang', !(await page.$('.mesin-run')));
  await go('produksi');
  ok('M-13 antrian Bending kosong setelah selesai', (await antri('Bending')) === 0 && (await antri('Punching')) === 12);

  // Reject di Punching (2 rusak): tercatat, tidak lanjut, dan muncul lagi di antrian Shearing untuk dibuat ulang
  await go('mesin');
  await simpanMesin('Punching', '', { reject: 2 });
  const evr = await hasilEv();
  ok('M-15 reject 2 di Punching tercatat tanpa menambah selesai', evr.length === 4 && evr[3].wc === 'Punching' && Number(evr[3].reject) === 2 && Number(evr[3].qty) === 0, JSON.stringify(evr.slice(3).map((e) => [e.wc, e.qty, e.reject])));
  await go('produksi');
  const ar = { s: await antri('Shearing'), p: await antri('Punching') };
  ok('M-16 reject kembali ke antrian Shearing (2) dan Punching berkurang jadi 10', ar.s === 2 && ar.p === 10, JSON.stringify(ar));

  // Vendor: yang siap dikirim = hasil Bending (8); kirim melebihi hasil produksi ditolak, sebesar hasil diterima
  await go('produksi');
  ok('M-17 dashboard menyebut siap dikirim ke Vendor ELG (8)', /Siap dikirim ke Vendor ELG: 8/.test(await page.evaluate(() => document.getElementById('body').innerText)));
  await go('vendor');
  const nv0 = (await tab('vendor')).length;
  await page.click('#tools [data-act="newvendor"]'); await page.waitForTimeout(500);
  await page.fill('#m-vendor', 'Vendor Rute'); await page.fill('#m-proses', 'ELG');
  const optV = await page.evaluate(() => [...document.querySelectorAll('#m-spk option')].find((o) => /Customer Rute/.test(o.textContent))?.value || '');
  await page.selectOption('#m-spk', optV); await page.waitForTimeout(500);
  const valV = await page.inputValue('#m-ln_0');
  ok('M-18 kolom kirim vendor terisi sebatas hasil produksi (8 dari 20)', valV === '8', valV);
  await page.fill('#m-ln_0', '10');
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(800);
  const errV = await page.evaluate(() => (document.getElementById('merr') || { textContent: '' }).textContent);
  ok('M-19 kirim 10 melebihi hasil produksi ditolak', (await tab('vendor')).length === nv0 && /hasil produksi/.test(errV), errV);
  await page.fill('#m-ln_0', '8');
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(800);
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500); // vendor baru: klik kedua mendaftarkannya ke master
  ok('M-19b kirim 8 diterima', (await tab('vendor')).length === nv0 + 1, await page.evaluate(() => (document.getElementById('merr') || { textContent: '' }).textContent));
  await go('produksi');
  const bodyV = await page.evaluate(() => document.getElementById('body').innerText);
  await go('spk'); await page.click('#tools [data-view="spk"][data-val="berjalan"]'); await page.waitForTimeout(400);
  const bodySpk = await page.evaluate(() => document.getElementById('body').textContent);
  ok('M-19c sesudah dikirim tidak lagi siap kirim, jalur SPK menyebut kiriman ke vendor', !/Siap dikirim ke Vendor ELG/.test(bodyV) && /dikirim 8/.test(bodySpk), JSON.stringify([/Siap dikirim ke Vendor ELG/.test(bodyV), /dikirim 8/.test(bodySpk), bodySpk.replace(/\s+/g, ' ').slice(0, 400)]));

  // Vendor: kecepatan dan kualifikasi dari riwayat kiriman (4 selesai: TAT 4, 4, 3, 8 hari kerja; 1 masih di vendor)
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString();
    const mk = (tgl, balik, q, rej) => ({ id: crypto.randomUUID(), created_at: now, updated_at: now, data: { vendor: 'Berkah Jaya', proses: 'HDG', tgl, noSJ: 'SJ-V/' + tgl, spk: '', status: balik ? 'Selesai' : 'Di Vendor',
      items: [{ d: 'Cable Tray', g: '', q, u: 'Btg', kembali: balik ? q - rej : 0, reject: balik ? rej : 0 }], riwayat: balik ? [{ tgl: balik, qty: q - rej, rej }] : [] } });
    s.tables.vendor = [mk('2026-10-05', '2026-10-09', 30, 0), mk('2026-10-12', '2026-10-16', 30, 1), mk('2026-10-19', '2026-10-22', 40, 0), mk('2026-10-26', '2026-11-05', 20, 0), mk('2026-11-02', null, 15, 0)];
    localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
  });
  await page.reload(); await page.waitForTimeout(3500);
  await page.evaluate(() => { location.hash = '#produksi'; }); await page.waitForTimeout(1200);
  await page.click('#tools [data-view="produksi"][data-val="vendor"]'); await page.waitForTimeout(400);
  const vk = await page.evaluate(() => (document.getElementById('vendor-kual') || { innerText: '' }).innerText);
  ok('M-20 kualifikasi vendor tampil: Berkah Jaya, rata-rata 4,8 hk, tepat waktu 75%, nilai B', /Berkah Jaya/.test(vk) && /4,8 hk/.test(vk) && /75%/.test(vk) && vk.trim().endsWith('B'), JSON.stringify(vk).slice(0, 500));
  const kembali = await page.evaluate(() => document.getElementById('body').innerText);
  ok('M-21 perkiraan kembali kiriman yang masih di vendor ditampilkan dengan dasarnya', /perkiraan kembali/.test(kembali) && /median riwayat vendor/.test(kembali));

  // Mesin alternatif: SPK berisi Cover (10), dipotong di Laser (4) lalu sisanya di Shearing
  await go('spk');
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-cust', 'Customer Cover'); await page.fill('#ed-due', '2026-12-20');
  await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'); await page.dispatchEvent('#ed-h-0', 'change'); await page.waitForTimeout(300);
  await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', 'COVER TRAY W 200 L 3000'); await page.fill('#ed-q-0-0', '10'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(1800);
  await go('mesin'); await page.selectOption('#f-mesin', 'CNC Laser'); await page.waitForTimeout(500);
  const altTxt = await page.evaluate(() => (document.getElementById('mesin-antri') || { innerText: '' }).innerText);
  ok('M-40 Cover muncul di antrian CNC Laser sebagai mesin alternatif untuk Shearing', /COVER TRAY/.test(altTxt) && /mesin alternatif/.test(altTxt), altTxt.slice(0, 120));
  const nHasil = (await hasilEv()).length;
  await page.click('#mesin-antri .mcard:first-child [data-act="mesincatat"]'); await page.waitForTimeout(400);
  await page.fill('#m-qty', '4'); await page.evaluate(() => { const d = document.querySelector('#modal details'); if (d) d.open = true; }); await page.fill('#m-mulai', '10:00'); await page.fill('#m-selesai', '10:40');
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500); await closeAll();
  const eAlt = (await hasilEv()).slice(nHasil);
  ok('M-41 hasil tercatat atas nama CNC Laser (mesin sebenarnya) dengan menit per pcs 10', eAlt.length === 1 && eAlt[0].wc === 'CNC Laser' && Number(eAlt[0].menit) === 40, JSON.stringify(eAlt.map((e) => [e.wc, e.menit])));
  await page.selectOption('#f-mesin', 'Shearing'); await page.waitForTimeout(500);
  const sisaCover = await page.evaluate(() => { const r = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => /COVER TRAY/.test(x.innerText)); return r ? r.querySelector('.mq-siap').innerText.trim() : null; });
  ok('M-42 langkah Shearing untuk Cover berkurang jadi 6 (dibagi dua mesin alternatif)', sisaCover === '6', String(sisaCover));
  await page.selectOption('#f-mesin', 'Bending'); await page.waitForTimeout(500);
  const bendCover = await page.evaluate(() => { const r = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => /COVER TRAY/.test(x.innerText)); return r ? r.querySelector('.mq-siap').innerText.trim() : null; });
  ok('M-43 hasil Laser 4 langsung siap di Bending', bendCover === '4', String(bendCover));

  // Laporan produksi: kolom form Excel, total, rekap per mesin, waktu per jenis item
  await go('laporan-produksi');
  const lap = await page.evaluate(() => ({ rows: document.querySelectorAll('#lap-tabel tbody tr').length, txt: document.getElementById('lap-tabel').innerText, rekap: document.getElementById('lap-rekap').innerText, jenis: document.getElementById('lap-jenis').innerText, head: document.getElementById('lap-tabel').querySelector('thead').innerText }));
  ok('M-50 laporan harian memuat semua hasil hari ini dengan kolom form (SPK, customer, deskripsi, tonase, menit per pcs)', lap.rows === (await hasilEv()).length && /Customer Rute/.test(lap.txt) && /Cable Tray W100xH100xL3000/.test(lap.txt) && /Tonase/i.test(lap.head) && /Menit.pcs/i.test(lap.head), String(lap.rows));
  ok('M-51 rekap per mesin menyebut Punching 1 (20 Ton) dan Laser (CNC Laser)', /Punching 1 \(20 Ton\)/.test(lap.rekap) && /CNC Laser/.test(lap.rekap));
  ok('M-52 waktu per jenis item terisi dari hasil berwaktu', /Shearing/.test(lap.jenis) && !/Belum ada hasil berwaktu/.test(lap.jenis));
  await page.selectOption('#f-lap-wc', 'Punching'); await page.waitForTimeout(500);
  const lapP = await page.evaluate(() => ({ rows: document.querySelectorAll('#lap-tabel tbody tr').length, tbl: document.getElementById('lap-tabel').innerText }));
  ok('M-53 filter work center Punching: hanya baris Punching', lapP.rows === 2 && !/Shearing/.test(lapP.tbl.replace(/Selesai/g, '')) , String(lapP.rows));
  ok('M-54 tombol Unduh CSV dan Cetak tersedia', !!(await page.$('#tools [data-act="lapcsv"]')) && !!(await page.$('#tools [data-act="lapprint"]')));

  // Jejak produksi di lembar SPK
  await go('spk');
  await page.click('#body tr:has-text("Customer Rute")'); await page.waitForTimeout(800);
  await page.click('.dw-tab[data-tab="jejak"]'); await page.waitForTimeout(400);
  const jej = await page.evaluate(() => document.getElementById('dw-pane-jejak').innerText);
  ok('M-60 jejak item: tiap langkah, vendor, dan terkirim ke customer dengan mesin yang dipakai', /Shearing/.test(jej) && /Punching/.test(jej) && /Bending/.test(jej) && /Vendor ELG/.test(jej) && /Terkirim ke customer/.test(jej) && /Punching 1 \(20 Ton\)/.test(jej) && /dikirim 0 . kembali 0/.test(jej), jej.replace(/\n/g, ' ').slice(0, 200));
  await closeAll();

  // Lembar Update produksi: posisi per item dari catatan mesin, catat hasil langsung dari sini
  await go('spk'); await page.click('#body tr:has-text("Customer Rute")'); await page.waitForTimeout(800);
  await page.click('#drawer [data-act="prod"]'); await page.waitForTimeout(600);
  const up = await page.evaluate(() => document.getElementById('modal').innerText);
  ok('M-70 Update produksi menampilkan rantai langkah per item dan posisinya, bukan isian total', up.includes('Shearing 18') && up.includes('Posisi:') && !up.includes('Total diproduksi'), up.split(String.fromCharCode(10)).join(' ').slice(120, 360));
  const nH = (await hasilEv()).length;
  await page.click('#modal [data-act="prodcatat"]'); await page.waitForTimeout(500);
  ok('M-71 tombol Catat hasil membuka dialog dengan pilihan mesin dan operator', !!(await page.$('#mform [name="operator"]')) && /Catat hasil/.test(await page.textContent('#modal h3')));
  await page.fill('#m-qty', '2'); await page.fill('#m-operator', 'Operator Uji'); await page.evaluate(() => { const d = document.querySelector('#modal details'); if (d) d.open = true; }); await page.fill('#m-mulai', '13:00'); await page.fill('#m-selesai', '13:30');
  await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500); await closeAll();
  const hNew = (await hasilEv()).slice(nH);
  ok('M-72 hasil dari lembar SPK tercatat dengan operator dan mesin', hNew.length === 1 && hNew[0].operator === 'Operator Uji' && Number(hNew[0].qty) === 2 && Number(hNew[0].menit) === 30, JSON.stringify(hNew.map((e) => [e.wc, e.mesin, e.operator, e.qty])));

  // Berjalan bersamaan: satu item di dua mesin, selesai sebagian lalu lanjut, pembatalan catatan, dan pelindung dobel
  const klikBaris = (cust, act) => page.evaluate(([c, a]) => { const r = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => x.innerText.includes(c)); const b = r && r.querySelector('[data-act="' + a + '"]'); if (b && !b.disabled) { b.click(); return true; } return false; }, [cust, act]);
  const barisInfo = (cust) => page.evaluate((c) => { const r = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => x.innerText.includes(c)); return r ? { txt: r.innerText, mulaiDisabled: !!(r.querySelector('[data-act="mesinmulai"]') || {}).disabled } : null; }, cust);
  const catatBaris = async (cust, qty, mulai, selesai) => {
    await klikBaris(cust, 'mesincatat'); await page.waitForTimeout(400);
    await page.fill('#m-qty', String(qty)); await page.evaluate(() => { const d = document.querySelector('#modal details'); if (d) d.open = true; }); await page.fill('#m-mulai', mulai); await page.fill('#m-selesai', selesai);
    await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1300);
  };
  await go('spk');
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-cust', 'Customer Paralel'); await page.fill('#ed-due', '2026-12-22');
  await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 NON FINISHING'); await page.dispatchEvent('#ed-h-0', 'change'); await page.waitForTimeout(300);
  await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', 'Cable Tray W150xH50xL3000 1.2'); await page.fill('#ed-q-0-0', '30'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(1800);
  await go('mesin'); await page.selectOption('#f-mesin', 'Shearing'); await page.waitForTimeout(500);
  await catatBaris('Customer Paralel', 30, '07:00', '08:00'); await closeAll();
  await page.selectOption('#f-mesin', 'Punching'); await page.waitForTimeout(500);
  await klikBaris('Customer Paralel', 'mesinmulai'); await page.waitForTimeout(1200);
  const mu = (await tab('produksi_log')).filter((e) => e.jenis === 'mulai' && e.item_desc.includes('W150xH50'));
  ok('M-80 Mulai di Punching 1 memesan seluruh yang siap sebagai target (30)', mu.length === 1 && Number(mu[0].target) === 30 && mu[0].mesin === 'Punching 1 (20 Ton)', JSON.stringify(mu.map((e) => [e.mesin, e.target])));
  await page.selectOption('#f-mesin-msn', 'Punching 2 (40 Ton)'); await page.waitForTimeout(500);
  const b2 = await barisInfo('Customer Paralel');
  ok('M-81 di Punching 2 item yang sama tampil sedang dikerjakan di mesin lain dan Mulai terkunci', !!b2 && b2.mulaiDisabled && /Sedang dikerjakan di mesin lain/.test(b2.txt) && /Punching 1/.test(b2.txt), b2 && b2.txt.replace(/\n/g, ' ').slice(0, 160));
  await page.selectOption('#f-mesin-msn', 'Punching 1 (20 Ton)'); await page.waitForTimeout(500);
  await page.fill('.mesin-run [data-mrq]', '10');
  await page.click('.mesin-run [data-act="mesinsebagian"]'); await page.waitForTimeout(1600);
  const evP = (await tab('produksi_log')).filter((e) => e.item_desc.includes('W150xH50') && e.wc === 'Punching');
  ok('M-82 Simpan sebagian: hasil 10 tercatat dan sesi baru terbuka dengan target sisa 20', evP.filter((e) => e.jenis === 'hasil').length === 1 && Number(evP.find((e) => e.jenis === 'hasil').qty) === 10 && evP.filter((e) => e.jenis === 'mulai').length === 2 && Number(evP.filter((e) => e.jenis === 'mulai')[1].target) === 20 && !!(await page.$('.mesin-run')), JSON.stringify(evP.map((e) => [e.jenis, e.qty, e.target])));
  await page.fill('.mesin-run [data-mrq]', '5');
  await page.click('.mesin-run [data-act="mesinselesai"]'); await page.waitForTimeout(1600);
  ok('M-83 Selesai dan simpan: sesi tertutup', !(await page.$('.mesin-run')));
  await page.selectOption('#f-mesin-msn', 'Punching 2 (40 Ton)'); await page.waitForTimeout(500);
  const b3 = await barisInfo('Customer Paralel');
  ok('M-84 sesudah sesi Punching 1 ditutup, Punching 2 bebas mengerjakan sisa 15', !!b3 && !b3.mulaiDisabled && /15/.test(b3.txt), b3 && b3.txt.replace(/\n/g, ' ').slice(0, 140));
  await klikBaris('Customer Paralel', 'mesinmulai'); await page.waitForTimeout(1200);
  const mu2 = (await tab('produksi_log')).filter((e) => e.jenis === 'mulai' && e.mesin === 'Punching 2 (40 Ton)' && e.item_desc.includes('W150xH50'));
  ok('M-85 dua mesin Punching berjalan bersamaan untuk satu item (Punching 2 target 15)', mu2.length === 1 && Number(mu2[0].target) === 15 && !!(await page.$('.mesin-run')));
  await page.click('.mesin-run [data-act="mesinbatal"]'); await page.waitForTimeout(1200);
  ok('M-86 Batalkan mulai menutup sesi tanpa hasil', !(await page.$('.mesin-run')) && (await tab('produksi_log')).some((e) => e.jenis === 'batal' && e.mesin === 'Punching 2 (40 Ton)'));

  // Pembatalan catatan hasil
  await page.selectOption('#f-mesin-msn', 'Punching 1 (20 Ton)'); await page.waitForTimeout(500);
  const rwBefore = await page.$$eval('#mesin-riwayat tbody tr', (a) => a.length);
  await go('produksi'); const aP0 = await antri('Punching'); await go('mesin'); await page.selectOption('#f-mesin', 'Punching'); await page.waitForTimeout(500);
  page.once('dialog', (d) => d.accept());
  await page.evaluate(() => { const r = [...document.querySelectorAll('#mesin-riwayat tbody tr')].find((x) => x.innerText.includes('W150xH50') && /\b5\b/.test(x.cells[3].innerText)); r.querySelector('[data-act="mesinvoid"]').click(); });
  await page.waitForTimeout(1500);
  const hv = (await tab('produksi_log')).filter((e) => e.item_desc.includes('W150xH50') && e.wc === 'Punching');
  ok('M-87 catatan salah (5) dibatalkan: peristiwa void tersimpan dan riwayat berkurang', hv.some((e) => e.jenis === 'void') && (await page.$$eval('#mesin-riwayat tbody tr', (a) => a.length)) === rwBefore - 1, String(rwBefore));
  await go('produksi');
  const aP1 = await antri('Punching');
  ok('M-88 sesudah pembatalan, 5 batang kembali ke antrian Punching', aP1 === aP0 + 5, aP0 + ' -> ' + aP1);
  // Bending memakai 3 dari hasil Punching 10, lalu membatalkan Punching 10 harus ditolak
  await go('mesin'); await page.selectOption('#f-mesin', 'Bending'); await page.waitForTimeout(500);
  await catatBaris('Customer Paralel', 3, '09:00', '09:30'); await closeAll();
  await page.selectOption('#f-mesin', 'Punching'); await page.waitForTimeout(500);
  const nVoid = (await tab('produksi_log')).filter((e) => e.jenis === 'void').length;
  const setuju = (d) => d.accept(); page.on('dialog', setuju);
  await page.evaluate(() => { const r = [...document.querySelectorAll('#mesin-riwayat tbody tr')].find((x) => x.innerText.includes('W150xH50') && /\b10\b/.test(x.cells[3].innerText)); if (r) r.querySelector('[data-act="mesinvoid"]').click(); });
  await page.waitForTimeout(1200); page.off('dialog', setuju);
  ok('M-89 pembatalan hasil Punching yang sudah dipakai Bending ditolak', (await tab('produksi_log')).filter((e) => e.jenis === 'void').length === nVoid && /Tidak bisa dibatalkan/.test(await page.evaluate(() => document.getElementById('toast').textContent)));
  // Pelindung dobel: Bending 3 yang sama dalam 15 menit dibatalkan (dialog konfirmasi ditolak otomatis)
  await page.selectOption('#f-mesin', 'Bending'); await page.waitForTimeout(500);
  const nB = (await hasilEv()).length;
  await catatBaris('Customer Paralel', 3, '09:40', '10:00');
  ok('M-90 catatan yang sama dalam 15 menit ditahan sebagai kemungkinan dobel', (await hasilEv()).length === nB && /dobel/.test(await page.evaluate(() => (document.getElementById('merr') || { textContent: '' }).textContent)));
  await closeAll();

  // Layar operator berbasis kartu: +/-, +5, Semua, lalu Selesai; dan Papan Produksi untuk supervisor
  await go('spk');
  await page.click('#tools [data-act="newspk"]'); await page.waitForTimeout(700);
  await page.fill('#ed-cust', 'Customer Kartu'); await page.fill('#ed-due', '2020-01-10');
  await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 NON FINISHING'); await page.dispatchEvent('#ed-h-0', 'change'); await page.waitForTimeout(300);
  await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', 'Cable Tray W200xH50xL3000 1.2'); await page.fill('#ed-q-0-0', '12'); await page.fill('#ed-u-0-0', 'Btg');
  await page.click('#editor button:has-text("Terbitkan SPK")'); await page.waitForTimeout(1800);
  await go('mesin'); await page.selectOption('#f-mesin', 'Shearing'); await page.waitForTimeout(500);
  const kartuK = await page.evaluate(() => { const c = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => x.innerText.includes('Customer Kartu')); return c ? { txt: c.innerText, mulai: !!c.querySelector('[data-act="mesinmulai"]'), cat: !!c.querySelector('[data-act="mesincatat"]') } : null; });
  ok('M-91 kartu antrian memuat SPK, customer, angka siap besar, penanda Telat, tombol Mulai dan Catat', !!kartuK && /12/.test(kartuK.txt) && /Telat/.test(kartuK.txt) && kartuK.mulai && kartuK.cat, kartuK && kartuK.txt.replace(/\n/g, ' ').slice(0, 120));
  await klikBaris('Customer Kartu', 'mesinmulai'); await page.waitForTimeout(1200);
  const stepV = async () => Number(await page.inputValue('.mesin-run [data-mrq]') || 0);
  await page.click('.mesin-run [data-act="mrstep"][data-d="1"]'); await page.click('.mesin-run [data-act="mrstep"][data-d="1"]'); await page.click('.mesin-run [data-act="mrstep"][data-d="5"]');
  const v7 = await stepV();
  await page.click('.mesin-run [data-act="mrstep"][data-d="-1"]');
  const v6 = await stepV();
  await page.click('.mesin-run [data-act="mrstep"][data-d="10"]');
  const vMax = await stepV();
  ok('M-92 tombol +1, +5, -1 menghitung benar dan +10 tidak melewati yang siap (12)', v7 === 7 && v6 === 6 && vMax === 12, [v7, v6, vMax].join(','));
  await page.click('.mesin-run [data-act="mrstep"][data-d="-1"]'); await page.click('.mesin-run [data-act="mesinsemua"]');
  ok('M-93 Semua mengisi seluruh yang siap', (await stepV()) === 12);
  await page.fill('.mesin-run [data-mrq]', '0');
  for (let i = 0; i < 3; i++) await page.click('.mesin-run [data-act="mrstep"][data-d="-1"]');
  ok('M-94 jumlah tidak bisa di bawah nol', (await stepV()) === 0);
  await page.click('.mesin-run [data-act="mesinsemua"]'); await page.click('.mesin-run [data-act="mesinselesai"]'); await page.waitForTimeout(1600);
  ok('M-95 Selesai menyimpan 12 dan menutup kartu berjalan', !(await page.$('.mesin-run')) && (await tab('produksi_log')).some((e) => (e.jenis || 'hasil') === 'hasil' && e.item_desc.includes('W200xH50') && Number(e.qty) === 12 && e.wc === 'Shearing'));
  await go('papan'); await page.waitForTimeout(500);
  const papan = await page.evaluate(() => ({ kol: [...document.querySelectorAll('.pk-col .pk-head span:first-child')].map((x) => x.textContent), txt: document.querySelector('.pk-board').innerText, kpi: document.querySelectorAll('.kpi').length }));
  ok('M-96 Papan Produksi: kolom per work center dan vendor, kartu item antri di langkah berikutnya', papan.kol.includes('Shearing') && papan.kol.includes('Punching') && papan.kol.some((x) => /Vendor/.test(x)) && /Customer|W200xH50/.test(papan.txt) && papan.kpi === 4, papan.kol.join(','));
  await page.click('.pk-head[data-wc="Punching"]'); await page.waitForTimeout(800);
  ok('M-97 ketuk judul kolom membuka Antrian Mesin work center itu', (await page.evaluate(() => location.hash)) === '#mesin' && (await page.inputValue('#f-mesin')) === 'Punching');
  await page.setViewportSize({ width: 390, height: 800 }); await page.waitForTimeout(400);
  const hp = await page.evaluate(() => { const c = document.querySelector('#mesin-antri .mcard'); const b = c && c.querySelector('[data-act="mesinmulai"]'); const r = b && b.getBoundingClientRect(); return { lebarHalaman: document.documentElement.scrollWidth, layar: window.innerWidth, tinggiMulai: r ? Math.round(r.height) : 0, kolom: c ? getComputedStyle(c.parentElement).gridTemplateColumns.split(' ').length : 0 }; });
  ok('M-98 di layar HP (390 px): satu kolom, tidak ada gulir mendatar, tombol Mulai cukup besar (min 44 px)', hp.kolom === 1 && hp.lebarHalaman <= hp.layar + 1 && hp.tinggiMulai >= 44, JSON.stringify(hp));
  await page.setViewportSize({ width: 1280, height: 800 });
  await closeAll();

  // Tahap 1 skema baru: menu produksi tiga pintu, SPK Berjalan, Kinerja & Analisa
  const menuProd = await page.evaluate(() => { const hs = [...document.querySelectorAll('#nav a')].map((a) => a.getAttribute('href')); return { hs, teks: document.getElementById('nav').innerText }; });
  ok('M-99 menu Produksi hanya tiga pintu: SPK Berjalan, Produksi Hari Ini, Kinerja & Analisa', ['#spk', '#mesin', '#produksi'].every((h) => menuProd.hs.includes(h)) && !menuProd.hs.includes('#papan') && !menuProd.hs.includes('#laporan-produksi') && /SPK Berjalan/.test(menuProd.teks) && /Produksi Hari Ini/.test(menuProd.teks) && /Kinerja & Analisa/.test(menuProd.teks), menuProd.hs.join(','));
  await go('spk'); await page.click('#tools [data-view="spk"][data-val="berjalan"]'); await page.waitForTimeout(500);
  const sb = await page.evaluate(() => ({ kartu: document.querySelectorAll('.sb-card').length, txt: document.getElementById('body').innerText, kpi: document.querySelectorAll('.kpi').length, jalur: document.querySelectorAll('.sb-card .pg-c').length }));
  ok('M-100 SPK Berjalan: kartu per SPK dengan status, progres, dan posisi tiap item di setiap langkah', sb.kartu >= 3 && sb.kpi === 4 && sb.jalur > 15 && /posisi tiap item/i.test(sb.txt) && /%/.test(sb.txt), JSON.stringify({ k: sb.kartu, j: sb.jalur }));
  await page.click('#tools [data-view="spk"][data-key="fl"][data-val="telat"]'); await page.waitForTimeout(400);
  const telat = await page.evaluate(() => ({ kartu: [...document.querySelectorAll('.sb-card')].map((c) => c.innerText), kpiTelat: Number(document.querySelectorAll('.kpi')[1].querySelector('.v').textContent) }));
  ok('M-101 filter Telat menampilkan SPK lewat due (Customer Kartu) dan jumlahnya sama dengan ringkasan', telat.kartu.length === telat.kpiTelat && telat.kartu.some((x) => /Customer Kartu/.test(x)) && telat.kartu.every((x) => /Telat/.test(x)), JSON.stringify([telat.kartu.length, telat.kpiTelat]));
  await page.click('.sb-card .sb-h'); await page.waitForTimeout(600);
  ok('M-102 klik kepala kartu membuka rincian SPK', !!(await page.$('#drawer.open, #drawer:not([hidden])')) && /SPK/.test(await page.evaluate(() => (document.getElementById('drawer') || { innerText: '' }).innerText)));
  await closeAll();
  await go('produksi'); await page.click('#tools [data-view="produksi"][data-val="rincian"]'); await page.waitForTimeout(500);
  ok('M-103 Kinerja & Analisa punya tab Rincian harian (tabel, unduh CSV, cetak)', !!(await page.$('#lap-tabel')) && !!(await page.$('#tools [data-act="lapcsv"]')) && !!(await page.$('#tools [data-act="lapprint"]')));
  await page.click('#tools [data-view="produksi"][data-val="wc"]'); await page.waitForTimeout(400);
  ok('M-104 tab Work Center memuat beban dan kapasitas per work center', !!(await page.$('#wc-beban')) && !(await page.$('#vendor-kual')));
  await closeAll();

  // Data contoh untuk tinjauan: /?demo=produksi mengisi WC, SPK berrute, kejadian, dan riwayat vendor
  await page.evaluate(() => { localStorage.clear(); });
  await page.goto(base + '?demo=produksi'); await page.waitForTimeout(500);
  await login('admin@mni.local');
  await page.evaluate(() => { location.hash = '#produksi'; }); await page.waitForTimeout(1500);
  const wcInfo = await page.evaluate(() => ({ n: document.querySelectorAll('#wc-beban tbody tr[data-wc]').length, posisi: /Shearing|Punching|Bending|CNC Laser/.test(document.getElementById('body').innerText) }));
  await page.click('#tools [data-view="produksi"][data-val="vendor"]'); await page.waitForTimeout(400);
  const demo = await page.evaluate((wi) => ({ wc: wi.n, vendor: !!document.getElementById('vendor-kual'), posisi: wi.posisi }), wcInfo);
  ok('M-30 data contoh produksi memuat 5 work center, kualifikasi vendor, dan posisi SPK', demo.wc === 5 && demo.vendor && demo.posisi, JSON.stringify(demo));
  await page.evaluate(() => { location.hash = '#spk'; }); await page.waitForTimeout(1200);
  ok('M-105 membuka SPK menampilkan Daftar SPK sebagai tampilan awal; urutan tab Daftar SPK, Jadwal, Berjalan, KPI & Analisa', !!(await page.$('#tools [data-view="spk"][data-val="list"].on')) && !!(await page.$('#body .tbl-wrap table')) && JSON.stringify(await page.$$eval('#tools [data-view="spk"][data-key="tab"]', (a) => a.map((b) => b.textContent.trim()))) === JSON.stringify(['Daftar SPK', 'Jadwal', 'Berjalan', 'KPI & Analisa']));
  await page.click('#tools [data-view="spk"][data-key="tab"][data-val="berjalan"]'); await page.waitForTimeout(500);
  ok('M-105b tab Berjalan tetap tersedia dan menampilkan kartu SPK', (await page.$$eval('.sb-card', (a) => a.length)) >= 2);
  // Tahap 2: Kinerja & Analisa lengkap (data contoh)
  const tabK = async (v) => { await page.evaluate(() => { location.hash = '#produksi'; }); await page.waitForTimeout(500); await page.click('#tools [data-view="produksi"][data-key="tab"][data-val="' + v + '"]'); await page.waitForTimeout(500); };
  await tabK('wc');
  const aw = await page.evaluate(() => ({ rows: [...document.querySelectorAll('#wc-output tbody tr')].map((r) => ({ wc: r.dataset.wc, txt: r.innerText })), spark: document.querySelectorAll('#wc-output .spark i').length, beban: !!document.getElementById('wc-beban'), kpi: document.querySelectorAll('.kpi').length }));
  const sh = aw.rows.find((r) => r.wc === 'Shearing'), pn = aw.rows.find((r) => r.wc === 'Punching');
  ok('M-106 tab Work Center: output per work center dengan kapasitas, utilisasi, reject, menit per pcs, dan tren; beban antrian tetap ada', aw.rows.length === 5 && /100/.test(sh.txt) && /%/.test(pn.txt) && aw.spark > 50 && aw.beban && aw.kpi >= 4, JSON.stringify(aw.rows.map((r) => r.wc)));
  await page.click('#tools [data-view="produksi"][data-key="hari"][data-val="7"]'); await page.waitForTimeout(400);
  const sp7 = await page.evaluate(() => document.querySelectorAll('#wc-output tbody tr:first-child .spark i').length);
  ok('M-107 mengganti periode ke 7 hari mengubah jumlah batang tren', sp7 === 7, String(sp7));
  await page.click('#tools [data-view="produksi"][data-key="hari"][data-val="30"]');
  await tabK('produk');
  const ap = await page.evaluate(() => ({ rows: [...document.querySelectorAll('#produk-tabel tbody tr')].map((r) => ({ p: r.dataset.produk, txt: r.innerText, stk: r.querySelectorAll('.stk i').length })), lg: document.querySelectorAll('.lgd .lg').length }));
  const ct = ap.rows.find((r) => r.p === 'CABLE TRAY');
  ok('M-108 tab Produk: lama proses per produk dengan tahap dan komposisi waktu; Cable Tray yang sudah terkirim punya total hari', !!ct && /hr/.test(ct.txt) && ct.stk >= 3 && /1 terkirim/.test(ct.txt) && ap.lg === 5, JSON.stringify(ap.rows.map((r) => [r.p, r.stk])));
  await tabK('vendor');
  const av = await page.evaluate(() => ({ aliran: [...document.querySelectorAll('#vendor-aliran tbody tr')].map((r) => r.innerText), terbuka: document.querySelectorAll('#vendor-terbuka tbody tr').length, kual: !!document.getElementById('vendor-kual') }));
  ok('M-109 tab Vendor: barang keluar dan masuk per vendor dan proses, daftar masih di vendor, dan kualifikasi', av.aliran.length === 2 && av.aliran.some((x) => /Berkah Jaya/.test(x)) && av.aliran.some((x) => /Elektro Mandiri/.test(x)) && av.terbuka === 1 && av.kual, JSON.stringify(av.aliran.map((x) => x.replace(/\s+/g, ' ').slice(0, 40))));
  await tabK('kirim');
  const ak = await page.evaluate(() => ({ jenis: [...document.querySelectorAll('#dock-jenis tbody tr')].map((r) => r.innerText.replace(/\s+/g, ' ')), pihak: document.querySelectorAll('#dock-pihak tbody tr').length }));
  const lj = ak.jenis.find((x) => /Loading/.test(x) && /Barang Jadi/.test(x));
  ok('M-110 tab Pengiriman: loading dan unloading per jenis muatan dengan rata-rata tunggu dan proses; per pihak', ak.jenis.length === 4 && !!lj && /mnt/.test(lj) && ak.pihak >= 5, JSON.stringify(ak.jenis));
  await tabK('rincian');
  ok('M-111 enam tab di Kinerja & Analisa: Work Center, Laporan Produksi, Produk, Vendor, Pengiriman, Rincian harian', (await page.$$eval('#tools [data-view="produksi"][data-key="tab"]', (a) => a.map((x) => x.textContent))).join('|') === 'Work Center|Laporan Produksi|Produk|Vendor|Pengiriman|Rincian harian');
  // Laporan Produksi baru: periode, qty atau tonase atau kecepatan, kelompok produk bertingkat, tren, akumulasi operator dan mesin
  const sbtn = async (key, val) => { await page.click('#body [data-view="produksi"][data-key="' + key + '"][data-val="' + val + '"]'); await page.waitForTimeout(450); };
  const kpiNum = (idx) => page.evaluate((k) => Number(document.querySelectorAll('.kpi')[k].querySelector('.v').textContent.replace(/[^0-9]/g, '')), idx);
  await tabK('laporan');
  const lp = await page.evaluate(() => ({ kpi: document.querySelectorAll('.kpi').length, bar: document.querySelectorAll('#lp-trend .lp-col').length, depth: [...document.querySelectorAll('#lp-tabel tbody tr')].map((r) => r.dataset.depth + ':' + r.cells[0].innerText.trim()) }));
  ok('M-112 Laporan Produksi: 5 ringkasan, tren, dan produk bertingkat kelompok > type > material (Cable Tray, Cable Ladder, Aksesoris)', lp.kpi === 5 && lp.bar >= 1 && lp.depth.includes('0:Cable Tray') && lp.depth.includes('1:STU') && lp.depth.some((x) => /^2:SPCC/.test(x)) && lp.depth.includes('0:Cable Ladder') && lp.depth.includes('0:Aksesoris'), lp.depth.slice(0, 6).join(' | '));
  await sbtn('lper', 'hari'); const qHari = await kpiNum(0);
  await sbtn('lper', 'bulan'); const qBulan = await kpiNum(0);
  await sbtn('lper', 'tahun'); const qTahun = await kpiNum(0); const barTahun = await page.$$eval('#lp-trend .lp-col', (a) => a.length);
  ok('M-113 periode: hari ini lebih kecil dari bulan ini, lebih kecil dari tahun ini; tren tahun memakai butir bulan (maksimal 13 batang)', qHari <= qBulan && qBulan < qTahun && barTahun >= 6 && barTahun <= 13, JSON.stringify([qHari, qBulan, qTahun, barTahun]));
  await sbtn('lmet', 'ton');
  const em = await page.evaluate(() => ({ em: document.querySelectorAll('#lp-tabel td.lp-em').length, judul: document.querySelector('.dw-section-title').textContent }));
  ok('M-114 analisa by tonase: kolom tonase ditonjolkan dan tren berjudul tonase', em.em > 0, JSON.stringify(em));
  const tren = await page.evaluate(() => [...document.querySelectorAll('.dw-section-title')].map((x) => x.textContent).join(' | '));
  ok('M-114b judul tren menyebut tonase (kg)', /Tren .* tonase \(kg\)/.test(tren), tren);
  await sbtn('lmet', 'kec');
  const kec = await page.evaluate(() => [...document.querySelectorAll('#lp-tabel thead th')].map((x) => x.textContent).join('|') + ' || ' + document.querySelectorAll('#lp-tabel td.lp-em').length);
  ok('M-115 analisa by kecepatan: kolom pcs/jam dan kg/jam tersedia dan ditonjolkan', /pcs\/jam\|kg\/jam/.test(kec) && Number(kec.split('||')[1]) > 0, kec);
  await sbtn('lper', 'tahun'); await sbtn('lmet', 'qty'); await sbtn('lby', 'operator');
  const ops = await page.evaluate(() => [...document.querySelectorAll('#lp-tabel tbody tr')].map((r) => r.dataset.nama));
  ok('M-116 kelompok per operator memuat operator contoh', ['Operator A', 'Operator C', 'Operator E'].every((o) => ops.includes(o)), ops.join(','));
  await sbtn('lby', 'customer');
  ok('M-117 kelompok per customer memuat PT dan customer SPK', await page.evaluate(() => { const t = [...document.querySelectorAll('#lp-tabel tbody tr')].map((r) => r.dataset.nama).join('|'); return /PT Contoh A/.test(t) && /Customer Contoh A/.test(t); }));
  await sbtn('lby', 'mesin');
  ok('M-118 kelompok per mesin memuat mesin work center', await page.evaluate(() => { const t = [...document.querySelectorAll('#lp-tabel tbody tr')].map((r) => r.dataset.nama).join('|'); return /Punching 1/.test(t) && /Bending 3 Mtr #1/.test(t); }));
  const akmo = await page.evaluate(() => { const rows = [...document.querySelectorAll('#lp-akum tbody tr')]; const num = (c) => Number(c.querySelector('b').textContent.replace(/[^0-9]/g, '')); const e = rows.find((r) => r.dataset.nama === 'Operator E');
    return { n: rows.length, kolom: document.querySelectorAll('#lp-akum thead th').length, e: e ? [...e.cells].slice(1, 6).map(num) : null, jumlahTotal: num(document.querySelector('#lp-akum tfoot tr').cells[5]), sumTotal: rows.reduce((a, r) => a + num(r.cells[5]), 0), sumHari: rows.reduce((a, r) => a + num(r.cells[1]), 0), jumlahHari: num(document.querySelector('#lp-akum tfoot tr').cells[1]) }; });
  ok('M-119 akumulasi operator: hari ini, minggu ini, bulan ini, tahun ini, seluruhnya; Operator E hari ini 30 dan naik menurut jendela; jumlah sama dengan penjumlahan baris', akmo.n >= 6 && akmo.kolom === 8 && akmo.e[0] === 30 && akmo.e[0] <= akmo.e[1] && akmo.e[1] <= akmo.e[2] && akmo.e[2] <= akmo.e[3] && akmo.e[3] <= akmo.e[4] && akmo.jumlahTotal === akmo.sumTotal && akmo.jumlahHari === akmo.sumHari, JSON.stringify(akmo));
  await sbtn('lakm', 'kelompok');
  ok('M-120 akumulasi per kelompok produk menyebut Cable Tray dan Cable Ladder', await page.evaluate(() => { const t = [...document.querySelectorAll('#lp-akum tbody tr')].map((r) => r.dataset.nama).join('|'); return /Cable Tray/.test(t) && /Cable Ladder/.test(t); }));
  await sbtn('lakm', 'mesin');
  ok('M-121 akumulasi per mesin memuat Punching 1 dan Bending 3 Mtr #1', await page.evaluate(() => { const t = [...document.querySelectorAll('#lp-akum tbody tr')].map((r) => r.dataset.nama).join('|'); return /Punching 1/.test(t) && /Bending 3 Mtr #1/.test(t); }));
  let csvOk = false, csvNama = '';
  try { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.click('#tools [data-act="lapacsv"]')]); csvNama = dl.suggestedFilename(); csvOk = /^Laporan-produksi-.*\.csv$/.test(csvNama); } catch { /* tidak ada unduhan */ }
  ok('M-122 Unduh CSV laporan produksi', csvOk, csvNama);

  // Produksi Hari Ini: Catat cukup jumlah (tanggal dan jam otomatis), tombol Selesai menyebut yang disimpan, customer tampil di catatan terakhir
  await go('mesin'); await page.selectOption('#f-mesin', 'Bending'); await page.waitForTimeout(500); await page.selectOption('#f-mesin-msn', 'Bending 3 Mtr #2'); await page.waitForTimeout(500);
  const hist = await page.evaluate(() => (document.querySelector('#mesin-riwayat tbody tr') || { innerText: '' }).innerText);
  ok('M-123 catatan terakhir menyebut nama customer (PT), bukan hanya nomor SPK', /Customer Contoh/.test(hist), hist.replace(/\s+/g, ' '));
  await page.selectOption('#f-mesin', 'Punching'); await page.waitForTimeout(500);
  const nSblm = (await hasilEv()).length;
  await page.click('#mesin-antri .mcard:first-child [data-act="mesincatat"]'); await page.waitForTimeout(400);
  const wkt = await page.evaluate(() => ({ terbuka: document.querySelector('#modal details').open, tgl: document.getElementById('m-tgl').value, selesai: document.getElementById('m-selesai').value, mulai: document.getElementById('m-mulai').value }));
  ok('M-124 form Catat: tanggal dan jam selesai terisi otomatis, jam mulai kosong, bagian waktu tertutup', !wkt.terbuka && /^\d{4}-\d{2}-\d{2}$/.test(wkt.tgl) && /^\d{2}:\d{2}$/.test(wkt.selesai) && wkt.mulai === '', JSON.stringify(wkt));
  await page.fill('#m-qty', '1'); await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1500);
  const baru = (await hasilEv()).slice(nSblm);
  ok('M-125 Catat hanya dengan jumlah tersimpan: lama pengerjaan kosong (bukan nol), hari ini, nomor SPK dan customer terisi, klasifikasi produk terisi', baru.length === 1 && baru[0].menit == null && !baru[0].mulai && baru[0].tgl === new Date().toLocaleDateString('sv-SE') && !!baru[0].spk_no && !!baru[0].customer && !!baru[0].kelompok, JSON.stringify(baru.map((e) => [e.menit, e.mulai, e.tgl, e.kelompok])));
  await closeAll();
  await page.click('#mesin-antri .mcard:first-child [data-act="mesinmulai"]'); await page.waitForTimeout(1200);
  const lbl0 = await page.textContent('.mesin-run [data-lbl]'); const kand = Number((lbl0.match(/semua (\d+)/) || [])[1]);
  await page.fill('.mesin-run [data-mrq]', '3'); const lbl1 = await page.textContent('.mesin-run [data-lbl]');
  await page.click('.mesin-run [data-act="mrstep"][data-d="1"]'); const lbl2 = await page.textContent('.mesin-run [data-lbl]');
  await page.fill('.mesin-run [data-mrq]', ''); await page.dispatchEvent('.mesin-run [data-mrq]', 'input'); const lbl3 = await page.textContent('.mesin-run [data-lbl]');
  ok('M-126 tombol Selesai menyebut apa yang disimpan: semua yang siap, lalu jumlah yang diisi, kembali ke semua bila dikosongkan', kand > 0 && lbl1.includes('simpan 3') && lbl2.includes('simpan 4') && lbl3 === lbl0, JSON.stringify([lbl0, lbl1, lbl2, lbl3]));
  const nSel = (await hasilEv()).length;
  await page.click('.mesin-run [data-act="mesinselesai"]'); await page.waitForTimeout(1600);
  const sel = (await hasilEv()).slice(nSel);
  ok('M-127 menekan Selesai tanpa mengisi menyimpan semua yang siap sekali ketuk (dengan lama pengerjaan dari Mulai)', sel.length === 1 && Number(sel[0].qty) === kand && sel[0].menit != null && !!sel[0].mulai, JSON.stringify([sel.length, sel[0] && sel[0].qty, kand]));
  await closeAll();
  await page.setViewportSize({ width: 390, height: 800 });
  const lebar = {};
  for (const [h, tab] of [['mesin', null], ['produksi', 'laporan'], ['produksi', 'wc'], ['spk', null]]) {
    await page.evaluate((x) => { location.hash = '#' + x; }, h); await page.waitForTimeout(500);
    if (tab) { await page.click('#tools [data-view="produksi"][data-key="tab"][data-val="' + tab + '"]'); await page.waitForTimeout(500); }
    lebar[h + (tab ? ':' + tab : '')] = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  }
  ok('M-128 di layar HP (390 px) Produksi Hari Ini, Laporan Produksi, Work Center, dan SPK Berjalan tanpa gulir mendatar', Object.values(lebar).every((v) => v <= 1), JSON.stringify(lebar));
  await page.setViewportSize({ width: 1280, height: 800 });
  await closeAll();

  // Jadwal SPK (Gantt): garis waktu SPK dari data yang sudah ada, tanpa input baru
  const gtTab = async () => { await page.evaluate(() => { location.hash = '#spk'; }); await page.waitForTimeout(500); await page.click('#tools [data-view="spk"][data-key="tab"][data-val="jadwal"]'); await page.waitForTimeout(500); await page.click('#tools [data-key="vw"][data-val="spk"]'); await page.waitForTimeout(500); };
  const gtProd = () => page.evaluate(() => [...document.querySelectorAll('.gt-row:not(.gt-hd):not(.gt-it)')].map((r) => (r.querySelector('.gt-nmw b') || {}).textContent + ':' + ((r.querySelector('.gt-b.prod') || {}).dataset ? r.querySelector('.gt-b.prod').dataset.tip : '-')).join(' | '));
  await gtTab();
  const g1 = await page.evaluate(() => ({ tab: !!document.querySelector('#tools [data-val="jadwal"].on'), baris: document.querySelectorAll('.gt-row:not(.gt-hd):not(.gt-it)').length, nama: [...document.querySelectorAll('.gt-nmw b')].map((b) => b.textContent), bar: document.querySelectorAll('.gt-b.plan').length, now: document.querySelectorAll('.gt-now').length, due: document.querySelectorAll('.gt-due').length, inputs: document.querySelectorAll('#body input, #body select, #body textarea').length }));
  ok('M-129 tab Jadwal di SPK Berjalan: satu baris per SPK aktif dengan batang rencana, due date, dan garis hari ini; halaman tanpa kolom isian', g1.tab && g1.baris >= 2 && g1.nama.some((x) => /1001/.test(x)) && g1.bar >= 2 && g1.due >= 2 && g1.now === 1 && g1.inputs === 0, JSON.stringify(g1));
  const g2 = await page.evaluate(() => [...document.querySelectorAll('.gt-row:not(.gt-hd):not(.gt-it)')].map((r) => r.querySelector('.gt-nmw b').textContent + '=' + r.querySelector('.gt-info .chip').textContent));
  ok('M-130 status per SPK: 1002 Telat (due lewat), 1001 dan 1003 tidak telat', g2.some((x) => /1002=Telat/.test(x)) && !g2.some((x) => /1001=Telat/.test(x)) && !g2.some((x) => /1003=Telat/.test(x)), g2.join(' | '));
  const antar = await page.evaluate(() => document.querySelectorAll('.gt-row.gt-it').length);
  await page.click('.gt-nm[data-act="jdbuka"]'); await page.waitForTimeout(400);
  const sesudah = await page.evaluate(() => document.querySelectorAll('.gt-row.gt-it').length);
  await page.click('.gt-nm[data-act="jdbuka"]'); await page.waitForTimeout(400);
  const tutup = await page.evaluate(() => document.querySelectorAll('.gt-row.gt-it').length);
  ok('M-131 jadwal tiap item terbuka sejak awal; ketuk nama SPK melipat lalu membukanya lagi', antar >= 2 && sesudah < antar && tutup === antar, JSON.stringify([antar, sesudah, tutup]));
  const lebarHari = () => page.evaluate(() => document.querySelector('.gt-ov').getBoundingClientRect().width);
  const wMinggu = await lebarHari();
  await page.click('#tools [data-view="spk"][data-key="skala"][data-val="bulan"]'); await page.waitForTimeout(500);
  const wBulan = await lebarHari();
  await page.click('#tools [data-view="spk"][data-key="skala"][data-val="minggu"]'); await page.waitForTimeout(400);
  ok('M-132 skala per bulan memadatkan garis waktu (lebih sempit dari per minggu)', wBulan > 0 && wBulan < wMinggu, JSON.stringify([wMinggu, wBulan]));
  await page.click('#tools [data-view="spk"][data-key="fl"][data-val="semua"]'); await page.waitForTimeout(500);
  const semuaNama = await page.evaluate(() => [...document.querySelectorAll('.gt-nmw b')].map((b) => b.textContent).join(','));
  ok('M-133 filter Semua memuat SPK selesai (1000) dengan batang vendor dan pengiriman', /1000/.test(semuaNama) && await page.evaluate(() => { const r = [...document.querySelectorAll('.gt-row')].find((x) => /1000/.test(x.textContent)); return !!r && !!r.querySelector('.gt-b.vend') && !!r.querySelector('.gt-b.kirim'); }), semuaNama);
  await page.click('#tools [data-view="spk"][data-key="fl"][data-val="jalan"]'); await page.waitForTimeout(400);
  await page.fill('#q-spk', '1001'); await page.dispatchEvent('#q-spk', 'input'); await page.waitForTimeout(500);
  const cari = await page.evaluate(() => [...document.querySelectorAll('.gt-nmw b')].map((b) => b.textContent));
  ok('M-134 pencarian menyaring baris jadwal', cari.length === 1 && /1001/.test(cari[0]), cari.join(','));
  await page.fill('#q-spk', ''); await page.dispatchEvent('#q-spk', 'input'); await page.waitForTimeout(400);
  // input operator langsung tampak di jadwal tanpa langkah tambahan: tekan Mulai di Produksi Hari Ini
  await go('mesin'); await page.selectOption('#f-mesin', 'Punching'); await page.waitForTimeout(500);
  await page.click('#mesin-antri .mcard:first-child [data-act="mesinmulai"]'); await page.waitForTimeout(1200);
  const jalan = await page.evaluate(() => { const m = (document.querySelector('.mesin-run') || { innerText: '' }).innerText.match(/mnt\s+(.+?)\s+SPK (\d+)/s); return m ? { item: m[1].trim(), spk: m[2] } : { raw: (document.querySelector('.mesin-run') || { innerText: 'tidak ada kartu berjalan' }).innerText.slice(0, 160) }; });
  await gtTab();
  const tampil = jalan && jalan.spk ? await page.evaluate(async (j) => { const nm = [...document.querySelectorAll('.gt-row:not(.gt-it) .gt-nm')].find((x) => x.innerText.includes('SPK ' + j.spk)); if (!nm) return 'baris SPK tidak ada'; const r = [...document.querySelectorAll('.gt-row.gt-it')].find((x) => x.innerText.includes(j.item)); return r ? !!r.querySelector('.gt-b.step.live') : 'baris item tidak ada'; }, jalan) : 'tidak ada sesi';
  ok('M-135 menekan Mulai di Produksi Hari Ini langsung menandai item yang dikerjakan di jadwal (batang bertanda sedang dikerjakan), tanpa input di halaman jadwal', tampil === true, JSON.stringify([jalan, tampil]));

  // papan jadwal: langkah per work center, tampilan per mesin, header tanggal, dan dialog target
  await gtTab();
  const bd = await page.evaluate(() => ({ hari: document.querySelectorAll('.gt-dy').length, bulan: document.querySelectorAll('.gt-mo').length, langkah: document.querySelectorAll('.gt-row.gt-it .gt-b.step').length, warna: new Set([...document.querySelectorAll('.gt-b.step')].map((x) => [...x.classList].find((c) => /^wc\d$/.test(c)))).size, legenda: document.querySelectorAll('.gt-leg .gt-sw').length }));
  ok('M-137 papan per SPK: header bulan dan tanggal harian, langkah mesin berwarna per work center, legenda warna', bd.hari >= 20 && bd.bulan >= 1 && bd.langkah >= 3 && bd.warna >= 2 && bd.legenda >= 3, JSON.stringify(bd));
  await page.click('#tools [data-key="vw"][data-val="mesin"]'); await page.waitForTimeout(700);
  const pm = await page.evaluate(() => ({ grup: document.querySelectorAll('.gt-grp').length, mesin: document.querySelectorAll('.gt-mc').length, blok: document.querySelectorAll('.gt-b.blk').length, fl: !!document.querySelector('#tools [data-key="fl"]'), inputs: document.querySelectorAll('.gt input, .gt select, .gt textarea').length }));
  ok('M-138 tampilan Per mesin: kelompok work center, baris mesin, balok pekerjaan; filter status disembunyikan; tanpa kolom isian', pm.grup >= 3 && pm.mesin >= 4 && pm.blok >= 3 && !pm.fl && pm.inputs === 0, JSON.stringify(pm));
  await page.click('#tools [data-key="vw"][data-val="spk"]'); await page.waitForTimeout(500);
  await go('spk'); await page.click('#tools [data-view="spk"][data-key="tab"][data-val="kpi"]'); await page.waitForTimeout(700);
  const kp2 = await page.evaluate(() => ({ wrap: !!document.querySelector('.spk-kpi'), gauge: document.querySelectorAll('.spk-kpi .kgauge').length, nomor: document.querySelectorAll('.spk-kpi h2 .sn').length, kol: getComputedStyle(document.querySelector('.spk-kpi .kpis')).gridTemplateColumns.split(' ').length }));
  ok('M-139 KPI & Analisa: kartu tiga kolom dengan pengukur, bagian bernomor', kp2.wrap && kp2.gauge >= 2 && kp2.nomor === 3 && kp2.kol === 3, JSON.stringify(kp2));
  await page.click('#tools [data-act="spktarget"]'); await page.waitForTimeout(500);
  const tg = await page.evaluate(() => ({ grup: document.querySelectorAll('#modal .tgt-sec').length, baris: document.querySelectorAll('#modal .tgt-r').length, ids: ['prod', 'kirim', 'hdg', 'elg', 'pdc', 'lain'].every((k) => !!document.getElementById('m-' + k)) }));
  ok('M-140 dialog Target waktu proses: dua kelompok, enam isian dengan keterangan, satuan hari kerja', tg.grup === 2 && tg.baris === 6 && tg.ids, JSON.stringify(tg));
  await page.fill('#m-prod', '4'); await page.evaluate(() => document.getElementById('msub').click()); await page.waitForTimeout(1200);
  const tsetting = (await tab('master')).find((r) => r.kode === 'setting' || r.id === 'setting' || r.key === 'setting' || (r.data && r.data.spkT) || r.spkT);
  ok('M-141 target tersimpan setelah Simpan (produksi 4 hari kerja)', !!tsetting && Number((((tsetting.value || tsetting.data || tsetting).spkT) || {}).prod) === 4, JSON.stringify(tsetting && (tsetting.data || tsetting)).slice(0, 120));
  await go('spk'); await page.click('#tools [data-view="spk"][data-key="tab"][data-val="berjalan"]'); await page.waitForTimeout(600);
  const bj = await page.evaluate(() => ({ kartu: document.querySelectorAll('.sb-card').length, nada: [...document.querySelectorAll('.sb-card')].every((c) => /\bt-(telat|vendor|siap|jalan|selesai)\b/.test(c.className)), kolom: !!document.querySelector('.sb-card .pg-r') && getComputedStyle(document.querySelector('.sb-card .pg-r')).display === 'grid' }));
  ok('M-142 SPK Berjalan: kartu bernada status dan posisi item berbentuk baris berkolom langkah', bj.kartu >= 2 && bj.nada && bj.kolom, JSON.stringify(bj));
  await page.setViewportSize({ width: 390, height: 844 });
  await gtTab();
  const swHp = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const gulirDalam = await page.evaluate(() => { const g = document.getElementById('gt-scroll'); return g.scrollWidth > g.clientWidth; });
  ok('M-136 di HP (390 px) halaman tanpa gulir mendatar; garis waktu bergulir di dalam kotaknya sendiri', swHp <= 1 && gulirDalam, JSON.stringify([swHp, gulirDalam]));
  await page.setViewportSize({ width: 1280, height: 800 });
  await closeAll();

  // Papan jadwal v3: tooltip, detail, buka/lipat semua, zoom, geser, penunjuk tanggal
  await gtTab();
  const iv = await page.evaluate(() => ({ bar: document.querySelectorAll('.gt [data-act="gtbar"]').length, title: document.querySelectorAll('.gt-b[title]:not(.none)').length }));
  ok('M-148 batang jadwal interaktif: setiap batang punya aksi dan keterangan, tanpa title bawaan browser', iv.bar >= 8 && iv.title === 0, JSON.stringify(iv));
  const titikBar = () => page.evaluate(() => { const nm = document.querySelector('.gt-nmw').getBoundingClientRect().right; for (const b of document.querySelectorAll('.gt-b.step')) { const r = b.getBoundingClientRect(); if (r.left > nm + 8 && r.right < innerWidth - 8) { const x = Math.round(r.left + 6), y = Math.round(r.top + r.height / 2); const e = document.elementFromPoint(x, y); if (e && e.closest('[data-act="gtbar"]') === b) return { x, y }; } } return null; });
  const tb = await titikBar();
  await page.mouse.move(tb.x, tb.y, { steps: 3 }); await page.waitForTimeout(250);
  const tp = await page.evaluate(() => { const t = document.querySelector('.gt-tip'); const l = document.getElementById('gt-xl'); return { teks: t && !t.hidden ? t.innerText : '', tanggal: l ? l.textContent : '' }; });
  ok('M-149 hover batang menampilkan kartu keterangan (mesin, tanggal, hasil) dan penunjuk tanggal mengikuti kursor', /Mesin/.test(tp.teks) && /Hasil/.test(tp.teks) && /Klik untuk detail/.test(tp.teks) && /\d{2} \w{3} \d{2}/.test(tp.tanggal), JSON.stringify(tp).slice(0, 220));
  await page.mouse.click(tb.x, tb.y); await page.waitForTimeout(400);
  const dr = await page.evaluate(() => { const d = document.querySelector('.drawer-panel'); return { teks: d ? d.innerText : '', buka: !!(d && d.querySelector('[data-act="openspk"]')), sorot: d ? d.querySelectorAll('.gt-dit.hl').length : 0 }; });
  ok('M-150 klik batang membuka panel detail SPK: item, langkah mesin, tombol Buka SPK, item terpilih disorot', /item dan langkah mesin/i.test(dr.teks) && dr.buka && dr.sorot === 1, JSON.stringify({ buka: dr.buka, sorot: dr.sorot }));
  await closeAll();
  await page.click('#tools [data-act="jdsemua"][data-v="lipat"]'); await page.waitForTimeout(400);
  const nLipat = await page.$$eval('.gt-row.gt-it', (a) => a.length);
  await page.click('#tools [data-act="jdsemua"][data-v="buka"]'); await page.waitForTimeout(400);
  const nBuka = await page.$$eval('.gt-row.gt-it', (a) => a.length);
  ok('M-151 Lipat semua menyembunyikan baris item dan Buka semua menampilkannya kembali', nLipat === 0 && nBuka >= 4, JSON.stringify([nLipat, nBuka]));
  const wHarian = await page.evaluate(() => document.getElementById('gt-scroll').scrollWidth);
  await page.click('#tools [data-view="spk"][data-key="skala"][data-val="lebar"]'); await page.waitForTimeout(500);
  const wDetail = await page.evaluate(() => document.getElementById('gt-scroll').scrollWidth);
  ok('M-152 zoom Detail melebarkan garis waktu dibanding Harian', wDetail > wHarian * 1.4, JSON.stringify([wHarian, wDetail]));
  const pan = await page.evaluate(async () => { const s = document.getElementById('gt-scroll'); const r = s.querySelector('.gt-row.gt-it .gt-tr').getBoundingClientRect(); return { y: Math.round(r.top + r.height / 2), x0: s.scrollLeft }; });
  await page.mouse.move(1000, pan.y); await page.mouse.down(); await page.mouse.move(850, pan.y, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(150);
  const x1 = await page.evaluate(() => document.getElementById('gt-scroll').scrollLeft);
  ok('M-153 menggeser garis waktu dengan drag mouse pada area kosong', x1 > pan.x0 + 100, JSON.stringify([pan.x0, x1]));
  await page.click('#tools [data-view="spk"][data-key="skala"][data-val="minggu"]'); await page.waitForTimeout(300);

  // SPK Berjalan: matriks posisi item per langkah
  const bukaTab = async (v) => { await page.evaluate(() => { location.hash = '#spk'; }); await page.waitForTimeout(400); await page.click('#tools [data-view="spk"][data-key="tab"][data-val="' + v + '"]'); await page.waitForTimeout(600); };
  await bukaTab('berjalan');
  const pg = await page.evaluate(() => ({ kartu: document.querySelectorAll('.sb-card').length, baris: document.querySelectorAll('.pg-r:not(.pg-hd):not(.pg-nr)').length, kolom: [...document.querySelector('.sb-card .pg-hd').querySelectorAll('.pg-h')].map((h) => h.textContent), pill: [...document.querySelectorAll('.pg-pill')].map((p) => p.innerText.replace(/\s+/g, ' ')), gantt: !!document.querySelector('.gt-scroll'), input: document.querySelectorAll('#body input, #body select, #body textarea').length }));
  ok('M-154 SPK Berjalan memuat matriks posisi: kartu per SPK, baris per item, kolom langkah dari Shearing sampai Kirim, strip posisi sekarang, tanpa isian', pg.kartu >= 1 && pg.baris >= 3 && pg.kolom[0] === 'Shearing' && pg.kolom[pg.kolom.length - 1] === 'Kirim' && pg.pill.length >= 4 && !pg.gantt && pg.input === 0, JSON.stringify(pg).slice(0, 300));
  const sl = await page.evaluate(() => { const r = [...document.querySelectorAll('.pg-r:not(.pg-hd):not(.pg-nr)')][0]; const cs = [...r.querySelectorAll('.pg-c')]; return { selesai: cs.filter((c) => c.classList.contains('ok')).length, posisi: cs.filter((c) => c.classList.contains('cur')).length, label: r.querySelector('.pg-pos').textContent, langkah: r.querySelector('.pg-it small').textContent }; });
  ok('M-155 baris item: langkah selesai bertanda centang, satu kolom posisi sekarang, label posisi dan nomor langkah', sl.selesai >= 1 && sl.posisi === 1 && /^(Di|Antri di|Menunggu|Siap|Terkirim)/.test(sl.label) && /langkah \d+ dari \d+|semua langkah selesai/.test(sl.langkah), JSON.stringify(sl));
  const totalBaris = pg.baris;
  await page.click('.pg-pill:not(.nol)'); await page.waitForTimeout(400);
  const fp = await page.evaluate(() => ({ pos: [...document.querySelectorAll('.pg-r:not(.pg-hd):not(.pg-nr) .pg-pos')].map((e) => e.textContent), on: document.querySelectorAll('.pg-pill.on').length }));
  await page.click('.pg-pill.on'); await page.waitForTimeout(400);
  const bal = await page.$$eval('.pg-r:not(.pg-hd):not(.pg-nr)', (a) => a.length);
  ok('M-156 klik posisi di strip menyaring item di langkah itu; klik lagi mengembalikan semua', fp.on === 1 && fp.pos.length >= 1 && fp.pos.length < totalBaris && bal === totalBaris, JSON.stringify([fp.pos.length, totalBaris, bal]));
  await page.click('.sb-card .sb-det summary'); await page.waitForTimeout(300);
  const lp2 = await page.evaluate(() => document.querySelector('.sb-card .sb-det').open);
  await page.click('.sb-card .sb-det summary'); await page.waitForTimeout(300);
  const bk2 = await page.evaluate(() => document.querySelector('.sb-card .sb-det').open);
  ok('M-157 matriks tiap SPK bisa dilipat dan dibuka kembali', lp2 === false && bk2 === true, JSON.stringify([lp2, bk2]));
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400);
  const hpPg = await page.evaluate(() => ({ lebar: document.documentElement.scrollWidth, layar: window.innerWidth, gulirKartu: (() => { const s = document.querySelector('.pg-sc'); return s ? s.scrollWidth > s.clientWidth : false; })() }));
  ok('M-158 di HP (390 px) halaman tanpa gulir mendatar; matriks bergulir di dalam kotaknya sendiri', hpPg.lebar <= hpPg.layar + 1 && hpPg.gulirKartu, JSON.stringify(hpPg));
  await page.setViewportSize({ width: 1280, height: 800 });

  // Berjalan: mode Ringkas dan Rinci
  await bukaTab('berjalan');
  const rgOn = await page.evaluate(() => ({ rg: !!document.querySelector('.pg.rg'), pc: !!document.querySelector('.pg-pc') && document.querySelector('.pg-pc').offsetParent !== null, q: !!document.querySelector('.pg-q') && document.querySelector('.pg-q').offsetParent !== null }));
  await page.click('#tools [data-key="pgd"][data-val="rinci"]'); await page.waitForTimeout(400);
  const rcOn = await page.evaluate(() => ({ rg: !!document.querySelector('.pg.rg'), pc: !!document.querySelector('.pg-pc') && document.querySelector('.pg-pc').offsetParent !== null, q: !!document.querySelector('.pg-q') && document.querySelector('.pg-q').offsetParent !== null }));
  await page.click('#tools [data-key="pgd"][data-val="ringkas"]'); await page.waitForTimeout(300);
  ok('M-159 mode Ringkas menampilkan persen saja dan mode Rinci menampilkan jumlah; bisa berpindah', rgOn.rg && rgOn.pc && !rgOn.q && !rcOn.rg && !rcOn.pc && rcOn.q, JSON.stringify([rgOn, rcOn]));

  // Jadwal: papan kalender mingguan dengan rencana otomatis
  await bukaTab('jadwal');
  await page.click('#tools [data-key="vw"][data-val="papan"]'); await page.waitForTimeout(600);
  const pb = await page.evaluate(() => ({ papan: !!document.querySelector('.tlboard'), baris: document.querySelectorAll('.tl-r:not(.tl-hd)').length, batang: document.querySelectorAll('.tl-bar').length, keluar: document.querySelectorAll('.tl-out').length, hari: document.querySelectorAll('.tl-dy').length, sekarang: document.querySelectorAll('.tl-now').length, nama: [...document.querySelectorAll('.tl-cu')].map((e) => e.textContent), rinci: /Shearing|Punching|Bending|CNC|Welding/.test(document.querySelector('.tlboard').innerText), input: document.querySelectorAll('#body input, #body select, #body textarea').length }));
  ok('M-161 Jadwal membuka Timeline bersih: satu baris dan satu batang per SPK dengan nama customer, garis hari ini, tanpa rincian work center dan tanpa isian', pb.papan && pb.baris >= 1 && pb.batang + pb.keluar === pb.baris && pb.hari === 14 && pb.sekarang === 1 && pb.nama.every((x) => x.length > 2) && !pb.rinci && pb.input === 0, JSON.stringify(pb));
  const kt = await page.evaluate(() => ({ status: [...document.querySelectorAll('.tl-r')].filter((r) => r.querySelector('.tl-bar')).map((r) => r.querySelector('.tl-st .chip').textContent.trim()), due: document.querySelectorAll('.tl-due').length, isi: document.querySelectorAll('.tl-bar > i').length }));
  ok('M-162 tiap SPK punya status prediksi, bendera due date, dan isi batang sebagai progres', kt.status.length >= 1 && kt.status.every((x) => /Aman|Mepet|telat|Selesai/.test(x)) && kt.due >= 1 && kt.isi === kt.status.length, JSON.stringify(kt));
  const judul0 = await page.textContent('.pb-title');
  await page.click('#tools [data-act="pbnav"][data-d="1"]'); await page.waitForTimeout(400);
  const judul1 = await page.textContent('.pb-title');
  await page.click('#tools [data-act="pbnav"][data-d="0"]'); await page.waitForTimeout(400);
  const judul2 = await page.textContent('.pb-title');
  ok('M-163 navigasi: panah maju memajukan satu minggu, Hari ini kembali', judul0 !== judul1 && /\+1 minggu/.test(judul1) && judul2 === judul0 && /minggu ini/.test(judul2), JSON.stringify([judul0, judul1, judul2]));
  await page.click('#tools [data-key="pr"][data-val="30"]'); await page.waitForTimeout(400);
  const z30 = await page.evaluate(() => ({ judul: document.querySelector('.pb-title').innerText, tk: document.querySelectorAll('.tl-tk').length, dy: document.querySelectorAll('.tl-dy').length }));
  await page.click('#tools [data-key="pr"][data-val="14"]'); await page.waitForTimeout(400);
  const z14 = await page.evaluate(() => document.querySelectorAll('.tl-dy').length);
  ok('M-164 zoom 1 bulan memakai tanda mingguan, kembali ke 2 minggu menampilkan 14 hari', z30.tk >= 3 && z30.dy === 0 && z30.judul !== judul0 && z14 === 14, JSON.stringify([z30, z14]));
  await page.click('.tl-nm[data-act="pbcard"]'); await page.waitForTimeout(400);
  const pd0 = await page.evaluate(() => { const d = document.querySelector('.drawer-panel'); return { teks: d ? d.innerText : '', buka: !!(d && d.querySelector('[data-act="openspk"]')), jalan: !!(d && d.querySelector('[data-act="pbjalan"]')) }; });
  ok('M-165 klik SPK membuka ringkasan: progres, due date, perkiraan siap kirim, item dengan posisi, tombol Buka SPK dan Lihat posisi di Berjalan', /Progres produksi/.test(pd0.teks) && /Perkiraan siap kirim/.test(pd0.teks) && /Due date/.test(pd0.teks) && /item/i.test(pd0.teks) && pd0.buka && pd0.jalan, JSON.stringify({ buka: pd0.buka, jalan: pd0.jalan, teks: pd0.teks.slice(0, 100) }));
  await page.click('.drawer-panel [data-act="pbjalan"]'); await page.waitForTimeout(600);
  const jl = await page.evaluate(() => ({ tab: !!document.querySelector('#tools [data-view="spk"][data-val="berjalan"].on'), kartu: document.querySelectorAll('.sb-card').length, drawer: !!document.querySelector('.drawer-panel') }));
  ok('M-166 Lihat posisi di Berjalan pindah ke tab Berjalan dan menutup ringkasan', jl.tab && jl.kartu >= 1 && !jl.drawer, JSON.stringify(jl));
  await bukaTab('jadwal');
  await page.click('#tools [data-key="vw"][data-val="papan"]'); await page.waitForTimeout(500);
  // Jendela Timeline 14 hari mulai Senin: tergantung hari, batang bisa saja kosong (semua SPK di luar jendela). Hanya diuji bila ada batang.
  const adaBatang = !!(await page.$('.tl-bar'));
  if (adaBatang) { await page.evaluate(() => document.querySelector('.tl-bar').click()); await page.waitForTimeout(400); } // klik langsung: batang bisa berada di luar area gulir pada hari tertentu
  const bdBar = await page.evaluate(() => { const d = document.querySelector('.drawer-panel'); return d ? d.innerText : ''; });
  ok('M-166b klik batang juga membuka ringkasan SPK (dilewati bila tidak ada batang di jendela hari ini)', !adaBatang || /Progres produksi/.test(bdBar), (adaBatang ? '' : 'tanpa batang di jendela · ') + bdBar.slice(0, 80));
  await closeAll();
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(400);
  const hpPb = await page.evaluate(() => ({ lebar: document.documentElement.scrollWidth, layar: window.innerWidth, gulir: (() => { const s = document.getElementById('pb-sc'); return s ? s.scrollWidth > s.clientWidth : false; })() }));
  ok('M-167 di HP (390 px) papan jadwal bergulir di dalam kotaknya sendiri tanpa melebarkan halaman', hpPb.lebar <= hpPb.layar + 1 && hpPb.gulir, JSON.stringify(hpPb));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.click('#tools [data-key="vw"][data-val="spk"]'); await page.waitForTimeout(500);
  const gtOk = !!(await page.$('.gt-scroll'));
  await page.click('#tools [data-key="vw"][data-val="mesin"]'); await page.waitForTimeout(500);
  const msOk = !!(await page.$('.gt-mc'));
  ok('M-168 Garis waktu dan Per mesin tetap tersedia dari tab Jadwal', gtOk && msOk, JSON.stringify([gtOk, msOk]));

  // Berjalan: penanda item diam
  const sebelum = await page.$$eval('.pg-dm', (a) => a.length);
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const d = new Date(); d.setDate(d.getDate() - 5); const tgl = d.toLocaleDateString('sv-SE');
    (s.tables.produksi_log || []).forEach((r) => { if ((r.jenis || 'hasil') === 'hasil') { r.tgl = tgl; if (r.data && typeof r.data === 'object') r.data.tgl = tgl; } });
    localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
  });
  await page.reload(); await page.waitForTimeout(3500);
  await bukaTab('berjalan');
  const dm = await page.evaluate(() => ({ n: document.querySelectorAll('.pg-dm').length, teks: [...document.querySelectorAll('.pg-dm')].map((e) => e.textContent).slice(0, 3), crit: document.querySelectorAll('.pg-dm.crit').length, chip: /item diam/.test(document.querySelector('.pg-strip').innerText) }));
  ok('M-160 item tanpa catatan baru lebih dari 2 hari ditandai Diam N hari (merah bila 4 hari atau lebih) dan dihitung di strip posisi', dm.n >= 1 && dm.crit >= 1 && dm.chip && dm.teks.every((x) => /^Diam \d+ hari$/.test(x)), JSON.stringify({ sebelum, ...dm }));

  ok('M-14 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
