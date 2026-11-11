// Uji hulu ke hilir produksi (mock): Work Centre master selaras dengan rute, item SPK langsung terlihat di tiap Work Centre
// (antrian siap dan "Akan datang"), berpindah antrian saat langkah selesai, dan banner Work Centre hilang dengan perbaikan otomatis.
async function teksBebas(page, si, li) {
  await page.evaluate(([si, li]) => { const s = document.querySelector(`#ed-sb-${si}-${li}`); if (s && s.value !== '') { s.value = ''; s.dispatchEvent(new Event('change', { bubbles: true })); } }, [si, li]);
  await page.waitForSelector(`#ed-d-${si}-${li}`, { timeout: 5000 });
}
export async function runProduksiHuluHilir(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  let langkah = 'awal';
  try {
    const wait = (ms = 500) => page.waitForTimeout(ms);
    const closeAll = async () => { await page.evaluate(() => { try { closeEditor(); } catch (e) {} try { closeSheet(); } catch (e) {} try { closeDrawer(); } catch (e) {} document.querySelector('#modal [data-act="closemodal"]')?.click(); }); await wait(300); };
    const go = async (h) => { await closeAll(); const l = await page.$(`#nav a[href="#${h}"]`); if (l) await l.click(); else await page.evaluate((h) => { location.hash = h; }, h); await wait(900); };
    const pilihWc = async (wc) => { await go('mesin'); await page.selectOption('#f-mesin', wc); await wait(700); };
    const akan = (cust) => page.evaluate((c) => { const r = [...document.querySelectorAll('#mesin-akan tbody tr')].find((x) => x.innerText.includes(c)); return r ? r.innerText.replace(/\s+/g, ' ') : null; }, cust);
    const siap = (cust) => page.evaluate((c) => { const r = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => x.innerText.includes(c)); return r ? r.innerText.replace(/\s+/g, ' ') : null; }, cust);
    const buatSpk = async (cust, judul, desk, qty) => {
      await go('spk');
      await page.click('#tools [data-act="newspk"]'); await wait(700);
      await page.fill('#ed-cust', cust); await page.fill('#ed-due', '2030-01-10');
      await page.fill('#ed-h-0', judul); await page.dispatchEvent('#ed-h-0', 'change'); await wait(300);
      await teksBebas(page, 0, 0); await page.fill('#ed-d-0-0', desk); await page.fill('#ed-q-0-0', String(qty)); await page.fill('#ed-u-0-0', 'Btg');
      await page.dispatchEvent('#ed-q-0-0', 'change'); await wait(300);
      await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
    };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900); await page.reload(); await wait(3000);

    langkah = 'PH-01';
    await go('mesin');
    const h1 = await page.evaluate(() => ({ hilang: ruteWcHilang(), banner: /belum ada di Master Data/.test(document.body.innerText), wc: S.mwc.map((w) => w.nama) }));
    ok('PH-01 master Work Centre bawaan memuat semua langkah rute standar (Shearing, Punching, Bending, CNC Laser, Welding): tanpa banner', h1.hilang.length === 0 && !h1.banner, JSON.stringify(h1));

    langkah = 'PH-02';
    await buatSpk('Customer HH Tray', 'CABLE TRAY TYPE STU 1.2 NON FINISHING', 'Cable Tray W200xH50xL3000 1.2', 20);
    await buatSpk('Customer HH Accs', 'ACCS TRAY TYPE STU 1.2 NON FINISHING', 'Elbow 90 W300xH100xR300 1.2', 8);
    const r2 = await page.evaluate(() => ({ s: S.spk.filter((s) => /Customer HH/.test(s.customer)).map((s) => ({ c: s.customer, st: s.status })) }));
    ok('PH-02 dua SPK uji terbit', r2.s.length === 2, JSON.stringify(r2));

    langkah = 'PH-03';
    await pilihWc('Shearing');
    const s3 = await siap('Customer HH Tray'); const a3 = await akan('Customer HH Tray');
    ok('PH-03 item Cable Tray langsung siap di Shearing (langkah pertama), tidak masuk Akan datang Shearing', !!s3 && /20/.test(s3) && a3 === null, s3 + ' | ' + a3);
    await pilihWc('Punching');
    const s4 = await siap('Customer HH Tray'); const a4 = await akan('Customer HH Tray');
    ok('PH-04 item yang sama langsung terlihat di Punching sebagai Akan datang (belum sampai 20) walau belum bisa dikerjakan', s4 === null && !!a4 && /20/.test(a4), s4 + ' | ' + a4);
    await pilihWc('Bending');
    const a5 = await akan('Customer HH Tray'); const a5b = await akan('Customer HH Accs');
    ok('PH-05 Bending: Akan datang memuat item Cable Tray dan item Accs', !!a5 && !!a5b, a5 + ' | ' + a5b);
    await pilihWc('CNC Laser');
    const s6 = await siap('Customer HH Accs');
    ok('PH-06 item Accs langsung siap di CNC Laser (nama Work Centre master = nama langkah rute)', !!s6 && /8/.test(s6), s6);
    await pilihWc('Welding');
    const a7 = await akan('Customer HH Accs');
    ok('PH-07 Welding (langkah terakhir Accs): Akan datang memuat item Accs', !!a7, a7);

    langkah = 'PH-08';
    await pilihWc('Shearing');
    await page.evaluate(() => { const c = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => x.innerText.includes('Customer HH Tray')); c.querySelector('[data-act="mesinmulai"]').click(); });
    await wait(1200);
    await page.click('.mesin-run [data-act="mesinsemua"]'); await page.click('.mesin-run [data-act="mesinselesai"]'); await wait(1800);
    await pilihWc('Punching');
    const s8 = await siap('Customer HH Tray'); const a8 = await akan('Customer HH Tray');
    ok('PH-08 setelah Shearing selesai 20: item pindah ke antrian siap Punching dan hilang dari Akan datang Punching', !!s8 && /20/.test(s8) && a8 === null, s8 + ' | ' + a8);
    await pilihWc('Bending');
    const a9 = await akan('Customer HH Tray');
    ok('PH-09 Bending: item tetap Akan datang dengan posisi sekarang di Punching 20', !!a9 && /Punching 20/.test(a9), a9);

    langkah = 'PH-10';
    await page.evaluate(async () => { const w = S.mwc.find((x) => x.nama === 'Punching'); await updDoc('mwc', w._id, { nama: 'Punch-lama' }); });
    await wait(1200); await go('mesin');
    const b10 = await page.evaluate(() => ({ banner: /Punching/.test(((document.querySelector('[data-act="wcfix"]') || {}).parentElement || { innerText: '' }).innerText), tombol: !!document.querySelector('[data-act="wcfix"]') }));
    ok('PH-10 Work Centre rute hilang: banner menyebut Punching dan ada tombol Tambahkan otomatis', b10.banner && b10.tombol, JSON.stringify(b10));
    await page.click('[data-act="wcfix"]'); await wait(1500); await go('mesin');
    const c10 = await page.evaluate(() => ({ hilang: ruteWcHilang(), ada: S.mwc.some((w) => w.nama === 'Punching') }));
    ok('PH-11 Tambahkan otomatis: Punching dibuat, banner hilang', c10.hilang.length === 0 && c10.ada, JSON.stringify(c10));

    langkah = 'PH-12';
    await go('produksi');
    await page.click('[data-view="produksi"][data-key="tab"][data-val="progres"]'); await wait(900);
    await page.selectOption('#f-pwc', 'Punching'); await wait(900);
    const pr = (cust) => page.evaluate((c) => { const r = [...document.querySelectorAll('#prog-tabel tbody tr')].find((x) => x.innerText.includes(c)); return r ? r.innerText.replace(/\s+/g, ' ') : null; }, cust);
    const p12 = await pr('Customer HH Tray');
    ok('PH-12 Progres WC Punching: item Cable Tray tampil, target 20, sudah sampai 20, status Siap', !!p12 && /\b20\b/.test(p12) && /Siap/.test(p12), p12);
    await page.selectOption('#f-pwc', 'Welding'); await wait(900);
    const p13 = await pr('Customer HH Accs'); const p13b = await pr('Customer HH Tray');
    ok('PH-13 Progres WC Welding: item Accs tampil dengan status Menunggu; item Cable Tray (tanpa Welding) tidak tampil', !!p13 && /Menunggu/.test(p13) && p13b === null, p13 + ' | ' + p13b);
    const m14 = await page.evaluate(() => { const r = [...document.querySelectorAll('#prog-matriks tbody tr')].find((x) => x.innerText.includes('Customer HH Tray')); return r ? r.innerText.replace(/\s+/g, ' ') : null; });
    ok('PH-14 matriks semua SPK x Work Centre: Cable Tray Shearing 20/20 dan Punching 0/20', !!m14 && /20\/20/.test(m14) && /0\/20/.test(m14), m14);

    langkah = 'PH-15';
    await pilihWc('Punching');
    await page.evaluate(() => { const c = [...document.querySelectorAll('#mesin-antri .mcard')].find((x) => x.innerText.includes('Customer HH Tray')); c.querySelector('[data-act="mesinmulai"]').click(); });
    await wait(1200);
    await page.click('.mesin-run [data-act="mesinsemua"]'); await page.click('.mesin-run [data-act="mesinselesai"]'); await wait(1800);
    await pilihWc('Bending');
    const s15 = await siap('Customer HH Tray'); const s15b = await siap('Customer HH Accs'); const a15b = await akan('Customer HH Accs');
    ok('PH-15 dua item beda rute: Bending hanya menawarkan Cable Tray (Punching selesai); Accs (CNC Laser belum) tetap Akan datang', !!s15 && /20/.test(s15) && s15b === null && !!a15b, s15 + ' | ' + s15b + ' | ' + a15b);
    await pilihWc('Welding');
    const s15c = await siap('Customer HH Tray'); const a15c = await akan('Customer HH Tray');
    ok('PH-16 Cable Tray tidak pernah muncul di Welding (bukan bagian rutenya)', s15c === null && a15c === null, s15c + ' | ' + a15c);

    langkah = 'PH-17';
    await buatSpk('Customer HH Aneh', 'LAIN-LAIN PRODUK X', 'Barang Aneh Sekali', 5);
    const c17 = await page.evaluate(() => dataIssues().filter((i) => i.cat === 'Produksi').map((i) => i.title));
    ok('PH-17 item tanpa rute dikenali: Cek Data memperingatkan SPK tanpa rute produksi', c17.some((x) => /tanpa rute produksi/.test(x)), JSON.stringify(c17));

    langkah = 'PH-18';
    await go('spk');
    await page.click('#tools [data-act="newspk"]'); await wait(900);
    const e18 = await page.evaluate(() => ({ baru: spkDimBaru(), ringkas: !!document.querySelector('#ed-secs .edt.edr'), th: [...document.querySelectorAll('#ed-secs thead th')].map((x) => x.textContent.trim()), stok: !!document.querySelector('#ed-secs [data-f="fg"], #ed-secs .c-stk, #ed-secs [data-act="ed-ambil"]') }));
    ok('PH-18 bawaan aplikasi: editor SPK versi sebelumnya (bukan layout per dimensi), kolom Dari stok tetap ada', e18.baru === false && !e18.ringkas && e18.th.some((x) => /stok/i.test(x)), JSON.stringify(e18));
    await closeAll();

    langkah = 'PH-21';
    await page.evaluate(() => { if (!(S.sp || []).length) { S.sp = S.sp || []; S.sp.push({ _id: 'ph21-item', id: 'ph21-item', item: 'Oli Uji PH21', kode: 'PH21', satuan: 'Pcs', aktif: true }); } const sp = S.sp[0]; S.mutasi.push({ _id: 'ph21-sp', id: 'ph21-sp', gudang: 'sp', item: sp._id, jenis: 'keluar', delta: -1, at: new Date().toISOString(), tgl: new Date().toISOString().slice(0, 10), by: 'admin@mni.local' }); });
    await go('dashboard');
    const r21 = await page.evaluate(() => ({ undef: /undefined/.test(document.body.innerText), tampil: /Gudang sparepart/.test(document.body.innerText) }));
    ok('PH-21 Dashboard: mutasi sparepart tampil dengan nama item, tanpa kata undefined', !r21.undef && r21.tampil, JSON.stringify(r21));

    langkah = 'PH-22';
    await go('cekdata');
    const r22 = await page.evaluate(() => { const I = dataIssues().filter((i) => i.cat === 'Produksi'); return { n: I.length, judul: I.map((i) => i.title.replace(/<[^>]+>/g, '')).slice(0, 8), plate: I.filter((i) => /plate belum lengkap/.test(i.title)).length, vendor: I.filter((i) => /belum dikirim ke vendor/.test(i.title)).length, undef: /undefined/.test(JSON.stringify(I)) }; });
    ok('PH-22 Cek Data Produksi: aturan plate dan WIP berjalan tanpa galat dan tanpa undefined (pemicu plate dibuktikan di pratinjau berkatalog, karena butuh katalog berat)', !r22.undef && r22.n >= 1, JSON.stringify(r22));
  } catch (e) {
    ok('PH-ERR ' + langkah, false, String(e.message).replace(/[[0-9;]*m/g,'').slice(0, 900));
  }
  ok('PH-99 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
