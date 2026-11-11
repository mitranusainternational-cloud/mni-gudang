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

    langkah = 'PH-23';
    await page.evaluate(() => { window.__PRODUKSI_MESIN = false; });
    await go('mesin');
    const r23 = await page.evaluate(() => ({ adm: produksiAdmin(), lap: !!document.querySelector('#prod-lap'), mesinBtn: /Catat hasil di|Mulai/.test(document.body.innerText) && !!document.querySelector('[data-act="mulai"],[data-act="prodcatat"]'), opsi: [...document.querySelectorAll('#f-prod-grp option')].map((o) => o.value), undef: /undefined/.test(document.body.innerText) }));
    ok('PH-23a mode admin: Produksi Hari Ini = laporan per tebal/tipe/material/finishing/customer + daftar item, tanpa antrian mesin', r23.adm && r23.lap && !r23.mesinBtn && ['tebal', 'tipe', 'material', 'finishing', 'customer'].every((v) => r23.opsi.includes(v)) && !r23.undef, JSON.stringify(r23));
    const r23b = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms));
      const s = S.spk.find((z) => String(z.no) === '1004'); if (!s) return { err: 'SPK 1004 tidak ada' };
      const evAwal = (S.produksi_log || []).length; const prodAwal = +s.items[0].prod || 0;
      document.querySelector('button[data-act="prod"][data-id="' + s._id + '"]').click(); await w(400);
      const inp = document.querySelector('#mform input[name="p_0"]'); const tombolMesin = /Catat hasil di/.test(document.querySelector('#mform').innerText);
      const q = +inp.max; inp.value = String(Math.min(3, q)); inp.dispatchEvent(new Event('input', { bubbles: true }));
      [...document.querySelectorAll('.modal button')].find((b) => /Simpan/.test(b.textContent)).click(); await w(900);
      const s2 = S.spk.find((z) => String(z.no) === '1004'); const eff = (calc().spk[s2._id].lines[0] || {}).prodEff;
      return { tombolMesin, prodAwal, prod: +s2.items[0].prod, eff, evDelta: (S.produksi_log || []).length - evAwal, wcKosong: ((s2.prodLog || []).slice(-1)[0] || { items: [{}] }).items[0].wc === '', kg: /selesai kg/i.test(document.body.innerText) };
    });
    ok('PH-23b admin isi total selesai per item: progres naik, tanpa catatan mesin dan tanpa Work Centre, tonase tampil', !r23b.err && !r23b.tombolMesin && r23b.eff >= 1 && r23b.prod === r23b.eff && r23b.evDelta === 0 && r23b.wcKosong && r23b.kg, JSON.stringify(r23b));

    langkah = 'PH-24';
    await page.evaluate(() => { window.__KINERJA_BARU = true; });
    await go('produksi');
    await page.click('[data-view="produksi"][data-key="tab"][data-val="laporan"]');
    await page.waitForTimeout(500);
    const r24 = await page.evaluate(() => { const ev = evAdmin().filter((e) => String(e.spk_no) === '1004'); const tot = ev.reduce((a, e) => a + e.qty, 0); return { n: ev.length, tot, prodItem: +(byId('spk', ev[0] && ev[0].spk_id) || { items: [{}] }).items[0].prod, tabel: !!document.querySelector('#lp-tabel'), kosong: /Belum ada hasil produksi/.test(document.body.innerText), undef: /undefined/.test(document.body.innerText) }; });
    ok('PH-24 Laporan Produksi (Kinerja & Analisa) memuat hasil input admin: kejadian turunan = total item, tabel tampil, tanpa undefined', r24.n >= 1 && r24.tot === r24.prodItem && r24.tabel && !r24.kosong && !r24.undef, JSON.stringify(r24));

    langkah = 'PH-25';
    await page.evaluate(() => { window.__KINERJA_BARU = false; window.__PRODUKSI_MESIN = false; });
    await go('produksi');
    const k25 = await page.evaluate(() => ({ tab: [...document.querySelectorAll('[data-view="produksi"][data-key="tab"]')].map((b) => b.textContent.trim()), aktif: F.produksi.tab }));
    await go('spk');
    const j25 = await page.evaluate(() => { const s = S.spk.find((z) => String(z.no) === '1004'); return { html: jejakHtml(s._id) }; });
    const f25 = await page.evaluate(async () => { const s = S.spk.find((z) => String(z.no) === '1004'); prodForm(s._id); await new Promise((r) => setTimeout(r, 400)); const m = document.querySelector('#mform'); const r = { rchip: m ? m.querySelectorAll('.rchip').length : -1, posisi: m ? /Posisi:/.test(m.innerText) : null, input: m ? !!m.querySelector('input[name="p_0"]') : false }; closeSheet(); closeEditor(); return r; });
    const teks = j25.html.replace(/<[^>]+>/g, ' ');
    ok('PH-25 mode admin: Kinerja tanpa tab per Work Centre; Jejak produksi = Produksi selesai > (Vendor) > Terkirim, tanpa nama Work Centre', f25.rchip === 0 && f25.posisi === false && f25.input && !k25.tab.some((x) => /Work Center|Progres WC|Produk$/.test(x)) && k25.tab.includes('Laporan Produksi') && /Produksi selesai/.test(teks) && !/CNC Laser|Shearing|Punching|Bending|Welding/.test(teks) && /Terkirim ke customer/.test(teks), JSON.stringify({ k25, f25, teks: teks.replace(/\s+/g, ' ').slice(0, 220) }));

    langkah = 'PH-26';
    const r26 = await page.evaluate(() => {
      const s = S.spk.find((z) => String(z.no) === '1003'); const it = s.items[0];
      const tb = thkOf(it.g) || thkOf(s.h);
      const asli = it.d; const dasar = asli.endsWith(' ' + tb) ? asli.slice(0, asli.length - tb.length - 1) : asli;
      it.d = dasar; const a = sjNama(s._id, { d: dasar, q: 1, u: 'Btg' });
      it.d = dasar + ' ' + tb; const dobel = sjNama(s._id, { d: it.d, q: 1, u: 'Btg' }); it.d = asli;
      const hdr = sjNama(s._id, { hdr: 'SPK 1003' });
      return { tb, a: a.d, dobel: dobel.d, hdrAman: hdr.hdr === 'SPK 1003', asli: dasar };
    });
    ok('PH-26 surat jalan: nama barang = deskripsi SPK + tebal (t X mm), tidak ditambah dobel bila tebal sudah tertulis, baris judul tak berubah', !!r26.tb && r26.a === r26.asli + ' · t ' + r26.tb + ' mm' && r26.dobel === r26.asli + ' ' + r26.tb && r26.hdrAman, JSON.stringify(r26));

    langkah = 'PH-27';
    await page.evaluate(() => { window.__PRODUKSI_MESIN = false; });
    const r27 = await page.evaluate(() => {
      const s = S.spk.find((z) => String(z.no) === '1004'); const it = s.items[0]; const rute0 = it.rute; const prod0 = it.prod;
      it.rute = ['CNC Laser', 'Vendor ELG']; it.prod = 3;
      const l = calc().spk[s._id].lines[0]; const rows = siapVendorRows().filter((r) => String(r.s.no) === '1004');
      let lebih = ''; try { checkCap(s._id, { ln_0: 4 }, 'vendor'); } catch (e) { lebih = e.message; }
      let pas = ''; try { checkCap(s._id, { ln_0: 3 }, 'vendor'); } catch (e) { pas = e.message; }
      const res = { vSiap: l.vSiap, prodEff: l.prodEff, baris: rows.length, siap: rows[0] && rows[0].siap, lebih: /melebihi/.test(lebih), pas };
      it.rute = rute0; it.prod = prod0; return res;
    });
    await go('vendor');
    const h27 = await page.evaluate(() => ({ panel: !!document.querySelector('#siap-vendor'), judul: /Siap dikirim ke vendor/.test(document.body.innerText), undef: /undefined/.test(document.body.innerText) }));
    ok('PH-27 F-11: mode admin, kirim ke vendor dibatasi jumlah selesai (siap = selesai), melebihi ditolak; antrian Siap dikirim ke vendor tampil', r27.vSiap === 3 && r27.baris === 1 && r27.siap === 3 && r27.lebih && r27.pas === '' && h27.panel && h27.judul && !h27.undef, JSON.stringify({ r27, h27 }));

    langkah = 'PH-28';
    const r28 = await page.evaluate(() => {
      const tgl = today(); const hasil = {};
      const spk = { _id: 'ph28', no: 9928, status: 'Terbit', customer: 'Uji F12', due: '2099-01-01', tgl, h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', items: [{ d: 'Uji Item Kembar', q: 10, u: 'Btg', g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }, { d: 'Uji Item Kembar', q: 10, u: 'Btg', g: 'CABLE TRAY TYPE STU 2.0 mm SPHC / ELG' }] };
      S.spk.push(spk); S.kirim.push({ _id: 'k28a', spk: 'ph28', status: 'Terkirim', tgl, noSJ: 'UJI-1', customer: 'Uji F12', items: [{ d: 'Uji Item Kembar', q: 10, u: 'Btg' }] });
      C = null; let x = calc().spk.ph28; hasil.satu = { k0: x.lines[0].kirim, k1: x.lines[1].kirim, pK: x.pK, st: x.st };
      const dup = dataIssues().some((i) => /ph28|9928/.test(i.title) && /muncul lebih dari sekali/.test(i.title));
      S.kirim.push({ _id: 'k28b', spk: 'ph28', status: 'Terkirim', tgl, noSJ: 'UJI-2', customer: 'Uji F12', items: [{ d: 'Uji Item Kembar', q: 10, u: 'Btg' }] });
      C = null; x = calc().spk.ph28; hasil.dua = { k0: x.lines[0].kirim, k1: x.lines[1].kirim, pK: x.pK, st: x.st };
      S.spk = S.spk.filter((z) => z._id !== 'ph28'); S.kirim = S.kirim.filter((z) => z.spk !== 'ph28'); C = null;
      return { ...hasil, dup };
    });
    ok('PH-28 F-12: SPK dengan deskripsi item kembar tidak Selesai bila baru satu baris terkirim; Selesai setelah keduanya; Cek Data memperingatkan', r28.satu.k0 === 10 && r28.satu.k1 === 0 && r28.satu.pK === 0.5 && r28.satu.st !== 'Selesai' && r28.dua.k0 === 10 && r28.dua.k1 === 10 && r28.dua.st === 'Selesai' && r28.dup, JSON.stringify(r28));

    langkah = 'PH-29';
    const r29 = await page.evaluate(() => {
      const hasil = {}; const it = (S.fg || [])[0];
      if (!it) return { err: 'tidak ada item barang jadi' };
      C = null; hasil.dasar = dataIssues().filter((i) => i.cat === 'Stok' && /negatif/.test(i.title)).length; const tgl = today(); S.mutasi.push({ _id: 'ph29m', gudang: 'fg', item: it._id, jenis: 'keluar', delta: -999999, tgl, at: new Date().toISOString(), by: 'admin@mni.local' });
      C = null; const neg = dataIssues().filter((i) => i.cat === 'Stok' && /negatif/.test(i.title));
      hasil.neg = neg.length; hasil.negJudul = neg[0] ? neg[0].title.replace(/<[^>]+>/g, '') : '';
      S.mutasi = S.mutasi.filter((m) => m._id !== 'ph29m'); C = null;
      hasil.setelah = dataIssues().filter((i) => i.cat === 'Stok' && /negatif/.test(i.title)).length;
      // silang angka: total selesai laporan admin = jumlah selesai per item di perhitungan SPK
      const c = calc(); let sum = 0; S.spk.filter((s) => s.status === 'Terbit' && (c.spk[s._id] || {}).st !== 'Selesai').forEach((s) => { ((c.spk[s._id] || {}).lines || []).forEach((l) => { const q = +l.q || 0; if (q > 0) sum += Math.min(q, l.prodEff || 0); }); });
      hasil.sumCalc = Math.round(sum * 1000) / 1000;
      return hasil;
    });
    await page.evaluate(() => { window.__PRODUKSI_MESIN = false; });
    await go('mesin');
    const tot29 = await page.evaluate(() => { const r = [...document.querySelectorAll('#prod-lap tbody tr')].pop(); if (!r) return null; const td = r.querySelectorAll('td'); return +String(td[3].innerText).replace(/\./g, '').replace(',', '.'); });
    ok('PH-29 Kesehatan data: stok negatif terdeteksi dan hilang setelah dikoreksi; total selesai di laporan Produksi Hari Ini = jumlah selesai per item di SPK', !r29.err && r29.neg === r29.dasar + 1 && /negatif/.test(r29.negJudul) && r29.setelah === r29.dasar && tot29 === r29.sumCalc, JSON.stringify({ r29, tot29 }));

    langkah = 'PH-30';
    const r30 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const hasil = {};
      const tgl = today();
      const prAwal = (S.pr || []).length;
      const spk = { _id: 'ph30', no: 9930, status: 'Terbit', customer: 'Uji T5', due: '2099-01-01', tgl, h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', terbitAt: new Date().toISOString(), items: [{ d: 'Cable Tray W300xH100xL3000', q: 5000, u: 'Btg', w: 10, g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }] };
      S.spk.push(spk); C = null;
      hasil.matAda = !!MT();
      const rc = matRencana(matSpkItems(spk), { spkId: spk._id, tebal: spk.tebal });
      hasil.rcBaris = rc.length; hasil.usulan = MT().usulanPr(rc).length;
      const no1 = await prOtomatisSpk('ph30'); await w(900);
      hasil.no1 = no1; hasil.prBaru = (S.pr || []).length - prAwal;
      const pr1 = (S.pr || []).find((p) => p.noPR === no1) || {}; hasil.auto = pr1.auto === true && /Otomatis dari SPK 9930/.test(pr1.ket || '') && pr1.status === 'Diajukan';
      const no2 = await prOtomatisSpk('ph30'); await w(900);
      hasil.no2 = no2; hasil.prSetelahUlang = (S.pr || []).length - prAwal;
      S.spk = S.spk.filter((z) => z._id !== 'ph30'); C = null;
      return hasil;
    });
    ok('PH-30 T5: SPK terbit dengan kebutuhan plat melebihi stok membuat satu PR otomatis; diulang tidak membuat PR dobel', r30.matAda && r30.usulan >= 1 && !!r30.no1 && r30.prBaru === 1 && r30.auto && !r30.no2 && r30.prSetelahUlang === 1, JSON.stringify(r30));

    langkah = 'PH-31';
    const r31 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const hasil = {};
      const rs = matRmSiap(); const rr = rs.find((r) => r.bahan === 'SPHC' && Math.abs(r.tebal - 1.2) < 0.001 && r.kgPerLbr > 0);
      if (!rr) return { err: 'tidak ada plat SPHC 1.2' };
      const tgl = today();
      const spk = { _id: 'ph31', no: 9931, status: 'Terbit', customer: 'Uji T6', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', items: [{ d: 'Cable Tray Uji Susut', q: 100, u: 'Btg', w: 10, prod: 100, g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }] };
      S.spk.push(spk);
      const keluarKe = (lbr) => { S.mutasi = S.mutasi.filter((m) => m._id !== 'ph31m'); S.mutasi.push({ _id: 'ph31m', gudang: 'rm', item: rr.id, spk: 'ph31', jenis: 'keluar', delta: -lbr, tgl, at: new Date().toISOString(), by: 'admin@mni.local' }); C = null; return susutRows().filter((x) => String(x.s.no) === '9931')[0]; };
      const wajar = keluarKe(Math.ceil(1085 / rr.kgPerLbr)); hasil.wajar = wajar && wajar.status;
      const lebih = keluarKe(Math.ceil(1500 / rr.kgPerLbr)); hasil.lebih = lebih && lebih.status;
      const issue = dataIssues().some((i) => /9931/.test(i.title) && /susut/i.test(i.title)); hasil.issue = issue;
      const kurang = keluarKe(Math.floor(800 / rr.kgPerLbr)); hasil.kurang = kurang && kurang.status;
      keluarKe(Math.ceil(1085 / rr.kgPerLbr)); F['bahan-baku'].tab = 'susut';
      return hasil;
    });
    await go('bahan-baku');
    const tab31 = await page.evaluate(async () => { await new Promise((r) => setTimeout(r, 400)); const o = { tab: !!document.querySelector('#susut-tabel'), undef: /undefined/.test(document.body.innerText) }; S.mutasi = S.mutasi.filter((m) => m._id !== 'ph31m'); S.spk = S.spk.filter((z) => z._id !== 'ph31'); C = null; F['bahan-baku'].tab = 'stok'; return o; });
    r31.tab = tab31.tab; r31.undef = tab31.undef;
    ok('PH-31 T6: susut plat per SPK dinilai Wajar, Berlebih (masuk Cek Data), dan Plat kurang catat; tab Susut tampil', !r31.err && r31.wajar === 'Wajar' && r31.lebih === 'Berlebih' && r31.issue && r31.kurang === 'Plat kurang catat' && r31.tab && !r31.undef, JSON.stringify(r31));

    langkah = 'PH-32';
    const s32 = await page.evaluate(() => {
      const fg = (S.fg || [])[0]; if (!fg) return { err: 'tidak ada item barang jadi' };
      const tgl = today();
      S.spk.push({ _id: 'ph32', no: 9932, status: 'Terbit', stokReq: true, customer: 'STOK MNI', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', items: [{ d: 'Uji Terima Semua', q: 10, u: 'Btg', prod: 10, fg: fg._id, g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }] });
      C = null; F['barang-jadi'].tab = 'masuk';
      return { fg: fg._id, awal: calc().stock.fg[fg._id], daftar: fgSiapMasukList().filter((x) => String(x.s.no) === '9932').length };
    });
    await go('barang-jadi');
    await page.waitForSelector('[data-act="fgterimasemua"]', { timeout: 5000 });
    await page.click('[data-act="fgterimasemua"]'); await page.waitForTimeout(400);
    await page.click('#mform button[type="submit"], .modal button[type="submit"]'); await page.waitForTimeout(1200);
    const h32 = await page.evaluate((fgId) => { const m = S.mutasi.filter((z) => z.spk === 'ph32'); const o = { n: m.length, delta: m.reduce((a, z) => a + z.delta, 0), doc: !!m[0] && String(m[0].noDok || '').startsWith(DOCFMT.BJM + '/'), sisaDaftar: fgSiapMasukList().filter((x) => String(x.s.no) === '9932').length, undef: /undefined/.test(document.body.innerText) }; S.mutasi = S.mutasi.filter((z) => z.spk !== 'ph32'); S.spk = S.spk.filter((z) => z._id !== 'ph32'); C = null; F['barang-jadi'].tab = 'stok'; return o; }, s32.fg);
    ok('PH-32 T7: Terima semua mencatat barang masuk (BJM) sebesar yang siap untuk SPK stok, dan daftar siap masuk menjadi kosong', !s32.err && s32.daftar === 1 && h32.n === 1 && h32.delta === 10 && h32.doc && h32.sisaDaftar === 0 && !h32.undef, JSON.stringify({ s32, h32 }));

    langkah = 'PH-33';
    const r33 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const h = {};
      const tgl = today(); const ts = (d) => addDays(tgl, d) + 'T08:00:00.000Z';
      S.sp.push({ _id: 'ph33sp', id: 'ph33sp', item: 'Uji Sparepart T8', kode: 'T8', satuan: 'Pcs', min: 50, buffer: 80, aktif: true, stokAwal: 20 });
      C = null;
      const prAwal = (S.pr || []).length;
      const no1 = await prOtomatisSparepart(); await w(900);
      const pr1 = (S.pr || []).find((p) => p.noPR === no1) || {};
      h.no1 = !!no1; h.auto = pr1.auto === true && pr1.gudang === 'sp' && (pr1.items || []).some((i) => i.item === 'ph33sp' && i.q === 60);
      const no2 = await prOtomatisSparepart(); h.no2 = no2; h.prBaru = (S.pr || []).length - prAwal;
      // lonjakan: 6 unit pada 45 dan 60 hari lalu (dasar 3 per bulan), 10 unit dalam 30 hari terakhir
      [[-45, 3], [-60, 3], [-5, 10]].forEach(([d, q], i) => S.mutasi.push({ _id: 'ph33m' + i, gudang: 'sp', item: 'ph33sp', jenis: 'keluar', delta: -q, tgl: addDays(tgl, d), at: ts(d), by: 'admin@mni.local', pihak: 'Umum' }));
      C = null; h.lonjak = dataIssues().some((i) => /Uji Sparepart T8/.test(i.title) && /pemakaian 30 hari/.test(i.title));
      S.sp = S.sp.filter((z) => z._id !== 'ph33sp'); S.mutasi = S.mutasi.filter((m) => !/^ph33m/.test(m._id)); S.pr = (S.pr || []).filter((p) => p.noPR !== no1); C = null;
      return h;
    });
    ok('PH-33 T8: sparepart di bawah minimum meminta satu PR otomatis (diulang tidak dobel); lonjakan pemakaian masuk Cek Data', r33.no1 && r33.auto && !r33.no2 && r33.prBaru === 1 && r33.lonjak, JSON.stringify(r33));
  } catch (e) {
    ok('PH-ERR ' + langkah, false, String(e.message).replace(/[[0-9;]*m/g,'').slice(0, 900));
  }
  ok('PH-99 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
