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
      const pr1 = (S.pr || []).find((p) => p.noPR === no1) || {}; hasil.auto = pr1.auto === true && /dari SPK 9930/.test(pr1.ket || '') && pr1.status === 'Draf' && !pr1.diajukanBy;
      const no2 = await prOtomatisSpk('ph30'); await w(900);
      hasil.no2 = no2; hasil.prSetelahUlang = (S.pr || []).length - prAwal;
      S.spk = S.spk.filter((z) => z._id !== 'ph30'); { const pp = (S.pr || []).find((x) => x.noPR === no1); if (pp) { await DB.doc('pr/' + pp._id).delete(); await w(500); } } C = null;
      return hasil;
    });
    ok('PH-30 T5: SPK terbit dengan kebutuhan plat melebihi stok membuat satu PR DRAF otomatis (belum diajukan); diulang tidak membuat PR dobel', r30.matAda && r30.usulan >= 1 && !!r30.no1 && r30.prBaru === 1 && r30.auto && !r30.no2 && r30.prSetelahUlang === 1, JSON.stringify(r30));

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
      S.sp = S.sp.filter((z) => z._id !== 'ph33sp'); S.mutasi = S.mutasi.filter((m) => !/^ph33m/.test(m._id)); { const pp = (S.pr || []).find((x) => x.noPR === no1); if (pp) { await DB.doc('pr/' + pp._id).delete(); await w(500); } } C = null;
      return h;
    });
    ok('PH-33 T8: sparepart di bawah minimum meminta satu PR otomatis (diulang tidak dobel); lonjakan pemakaian masuk Cek Data', r33.no1 && r33.auto && !r33.no2 && r33.prBaru === 1 && r33.lonjak, JSON.stringify(r33));

    langkah = 'PH-34';
    await go('dashboard');
    const r34 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const h = {};
      const nav = () => [...document.querySelectorAll('#nav a')].length;
      h.awal = nav(); h.rolAwal = myRole();
      const u = S.muser.find((x) => String(x.email || x._id).toLowerCase() === String(ME).toLowerCase());
      const asli = u.role; await DB.doc('muser/' + u._id).update({ role: 'logistik' }); await w(1500);
      h.rolBaru = myRole(); h.navBaru = nav(); h.penggunaTampil = !!document.querySelector('#nav a[href="#pengguna"]');
      await DB.doc('muser/' + u._id).update({ role: asli }); await w(1500);
      h.rolPulih = myRole(); h.navPulih = nav();
      return h;
    });
    ok('PH-34 T10a: mengganti peran pengguna yang sedang masuk langsung mengubah menu (tanpa muat ulang) dan dapat dipulihkan', r34.rolAwal === 'admin' && r34.rolBaru === 'logistik' && r34.navBaru < r34.awal && !r34.penggunaTampil && r34.rolPulih === 'admin' && r34.navPulih === r34.awal, JSON.stringify(r34));

    langkah = 'PH-35';
    const r35 = await page.evaluate(() => {
      const tgl = today(); const hasil = {};
      S.spk.push({ _id: 'ph35', no: 9935, status: 'Terbit', customer: 'Uji T10b', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', items: [{ d: 'Uji Kinerja', q: 10, u: 'Btg', w: 5, prod: 4, g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }], prodLog: [{ tgl, at: new Date().toISOString(), by: 'ppic@mni.local', ket: '', items: [{ d: 'Uji Kinerja', q: 4, wc: '' }] }] });
      C = null; const K = kpiAgg('0'); const o = K.U['ppic@mni.local'] || {};
      hasil.hq = o.hq; hasil.hkg = o.hkg;
      S.spk = S.spk.filter((z) => z._id !== 'ph35'); C = null; return hasil;
    });
    await go('kinerja');
    const t35 = await page.evaluate(() => ({ kolom: /hasil produksi/i.test(document.body.innerText), undef: /undefined/.test(document.body.innerText) }));
    ok('PH-35 T10b: Kinerja Tim menghitung hasil produksi per orang dari laporan admin (qty dan tonase) dan menampilkannya', r35.hq === 4 && r35.hkg === 20 && t35.kolom && !t35.undef, JSON.stringify({ r35, t35 }));

    langkah = 'PH-36';
    await go('laporan');
    const r36 = await page.evaluate(() => {
      const R = ringkasLaporan('bln'); const [a, b] = period('bln');
      const sum = lapEv().filter((e) => (e.jenis || 'hasil') === 'hasil' && String(e.tgl || '').slice(0, 10) >= a && String(e.tgl || '').slice(0, 10) <= b).reduce((s, e) => s + (+e.qty || 0), 0);
      const hp = R.find((r) => r.k === 'Hasil produksi');
      return { baris: R.length, bag: [...new Set(R.map((r) => r.bag))], cocok: !!hp && Math.abs(hp.v - sum) < 0.01, panel: document.querySelectorAll('#body section.panel').length, undef: /undefined|NaN/.test(document.body.innerText), menu: !!document.querySelector('#nav a[href="#laporan"]') };
    });
    ok('PH-36 T9: halaman Laporan menampilkan tujuh bagian (produksi, pengiriman, bahan baku, barang jadi, vendor, sparepart, kesehatan data), angkanya cocok dengan sumbernya, dan ada di menu', r36.baris >= 20 && r36.bag.length === 7 && r36.cocok && r36.panel === 7 && !r36.undef && r36.menu, JSON.stringify(r36));

    langkah = 'PH-37';
    await page.evaluate(() => {
      const fg = (S.fg || [])[0]; const tgl = today();
      S.spk.push({ _id: 'ph37', no: 9937, status: 'Terbit', stokReq: true, customer: 'STOK MNI', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', items: [{ d: 'Uji Tindakan', q: 10, u: 'Btg', prod: 10, fg: fg._id, g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }] });
      C = null; location.hash = '#dashboard';
    });
    await go('dashboard');
    const r37 = await page.evaluate(() => ({ ada: !!document.querySelector('#tindakan'), tombol: [...document.querySelectorAll('#tindakan [data-act="tindak"]')].map((b) => b.textContent.trim().replace(/\s+/g, ' ')), undef: /undefined|NaN/.test(document.body.innerText) }));
    await page.click('#tindakan [data-act="tindak"][data-tab="masuk"]'); await page.waitForTimeout(700);
    const k37 = await page.evaluate(() => { const o = { hash: location.hash, tab: F['barang-jadi'].tab, tabel: !!document.querySelector('#fg-siapmasuk') }; S.spk = S.spk.filter((z) => z._id !== 'ph37'); C = null; F['barang-jadi'].tab = 'stok'; return o; });
    ok('PH-37 T10: Dashboard menampilkan Tindakan hari ini dengan jumlah, dan tombolnya membuka layar dan tab yang tepat', r37.ada && r37.tombol.some((x) => /SPK stok siap masuk gudang/.test(x)) && !r37.undef && k37.hash === '#barang-jadi' && k37.tab === 'masuk' && k37.tabel, JSON.stringify({ r37, k37 }));

    langkah = 'PH-38';
    const r38 = await page.evaluate(() => {
      const asli = ED; const g = 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED';
      ED = { id: null, tebal: '1.2', sections: [{ h: g, lines: [{ d: 'Cable Tray Uji Editor', q: 1000, w: 13.513, wEst: 14.712, ambil: 0 }] }] };
      const html = matPreviewEditor(); const rc = matRencana([{ d: 'Cable Tray Uji Editor', g, q: 1000, w: 14.712, sudahWaste: true }], { tebal: '1.2' });
      ED = asli;
      const teks = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      return { teks, butuhKg: Math.round(rc[0].butuhKg), netto: rc[0].netto, bruto: rc[0].bruto, ada: html.length > 0 };
    });
    ok('PH-38 editor SPK: kebutuhan plat tampil sebelum Terbit, memakai berat estimasi yang sudah memuat waste (14.712 kg, tidak dikali 1,1 lagi)', r38.ada && r38.netto === 14712 && Math.abs(r38.bruto - 14712) < 0.01 && new RegExp('butuh ' + String(r38.butuhKg).replace(/(\d)(?=(\d{3})+$)/g, '$1.') + ' kg').test(r38.teks), JSON.stringify(r38));

    langkah = 'PH-39';
    const d39 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const h = {};
      const tgl = today();
      S.spk.push({ _id: 'ph39', no: 9939, status: 'Terbit', customer: 'Uji Ajukan', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', items: [{ d: 'Cable Tray Uji Ajukan', q: 5000, u: 'Btg', w: 10, g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }] });
      C = null; const no = await prOtomatisSpk('ph39'); await w(900);
      const p = (S.pr || []).find((x) => x.noPR === no) || {};
      h.no = no; h.id = p._id; h.status = p.status; h.pengaju = p.diajukanBy || null;
      h.dedupe = !(await prOtomatisSpk('ph39'));
      F['bahan-baku'].tab = 'beli';
      return h;
    });
    await go('bahan-baku');
    const sblm = await page.evaluate((id) => ({ ajukanTombol: !!document.querySelector('[data-act="prajukan"][data-id="' + id + '"]'), terimaTombol: !!document.querySelector('[data-act="prterima"][data-id="' + id + '"]') }), d39.id);
    await page.click('[data-act="prajukan"][data-id="' + d39.id + '"]'); await page.waitForTimeout(900);
    const ssdh = await page.evaluate(async (id) => { const p = byId('pr', id) || {}; const o = { status: p.status, pengaju: p.diajukanBy, ada: !!p.diajukanAt, auto: p.auto === true, terima: !!document.querySelector('[data-act="prterima"][data-id="' + id + '"]'), ajukanHilang: !document.querySelector('[data-act="prajukan"][data-id="' + id + '"]'), me: ME, log: (S.log || []).some((l) => l.k === 'Ajukan PR') }; await DB.doc('pr/' + id).delete(); await new Promise((r) => setTimeout(r, 500)); S.spk = S.spk.filter((z) => z._id !== 'ph39'); C = null; F['bahan-baku'].tab = 'stok'; return o; }, d39.id);
    ok('PH-39 PR draf otomatis baru berlaku setelah user menekan Ajukan: pengaju = user yang menekan, status Diajukan, tombol Terima baru muncul sesudahnya', d39.status === 'Draf' && !d39.pengaju && d39.dedupe && sblm.ajukanTombol && !sblm.terimaTombol && ssdh.status === 'Diajukan' && ssdh.pengaju === ssdh.me && ssdh.ada && ssdh.auto && ssdh.terima && ssdh.ajukanHilang, JSON.stringify({ d39, sblm, ssdh }));

    langkah = 'PH-40';
    const r40 = await page.evaluate(() => {
      const tgl = today(); const g = 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED';
      S.spk.push({ _id: 'ph40a', no: 9940, status: 'Terbit', customer: 'Uji Salin', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: g, items: [{ d: 'Cable Tray W200xH100xL3000', g, q: 10, u: 'Btg', w: 8.481 }, { d: 'Cover Tray W200xL3000', g, q: 10, u: 'Btg', w: 8.481 }, { d: 'Jointing Tray H100', g, q: 10, u: 'Btg', w: 8.481 }] });
      S.spk.push({ _id: 'ph40b', no: 9941, status: 'Terbit', customer: 'Uji Beda', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: g, items: [{ d: 'Cable Tray W200xH100xL3000', g, q: 10, u: 'Btg', w: 10.894 }, { d: 'Cover Tray W200xL3000', g, q: 10, u: 'Btg', w: 6.813 }, { d: 'Jointing Tray H100', g, q: 10, u: 'Btg', w: 0.198 }] });
      C = null; const I = dataIssues().filter((i) => /memakai berat yang sama/.test(i.title));
      const o = { salin: I.some((i) => /9940/.test(i.title)), beda: I.some((i) => /9941/.test(i.title)) };
      S.spk = S.spk.filter((z) => z._id !== 'ph40a' && z._id !== 'ph40b'); C = null; return o;
    });
    ok('PH-40 Cek Data: berat salinan (3 item berbeda berat sama persis) terdeteksi; berat berbeda-beda tidak ditandai', r40.salin === true && r40.beda === false, JSON.stringify(r40));

    langkah = 'PH-41';
    const s41 = await page.evaluate(async () => {
      const tgl = today(); const g = 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG';
      const rr = matRmSiap().filter((r) => r.bahan === 'SPHC' && Math.abs(r.tebal - 1.2) < 0.001).sort((a, b) => b.stok * b.kgPerLbr - a.stok * a.kgPerLbr)[0];
      S.spk.push({ _id: 'ph41a', no: 9941, status: 'Terbit', customer: 'Uji Serah A', due: '2090-01-01', tgl, terbitAt: new Date().toISOString(), h: g, items: [{ d: 'Cable Tray Uji Serah A', q: 100, u: 'Btg', w: 10, g }] });
      S.spk.push({ _id: 'ph41b', no: 9942, status: 'Terbit', customer: 'Uji Serah B', due: '2090-01-02', tgl, terbitAt: new Date().toISOString(), h: g, items: [{ d: 'Cable Tray Uji Serah B', q: 200, u: 'Btg', w: 10, g }] });
      window.__m41 = new Set(S.mutasi.map((m) => m._id));
      await addDoc('mutasi', { gudang: 'rm', item: rr.id, jenis: 'masuk', delta: 2000, tgl, noDok: 'UJI-MASUK-41', ref: 'uji', pihak: '', ket: 'stok uji PH-41', pr: '' });
      await new Promise((r) => setTimeout(r, 800)); C = null; window.__stok41 = { id: rr.id, awal: calc().stock.rm[rr.id], kg: rr.kgPerLbr };
      F['bahan-baku'].tab = 'plate'; renderBody();
      const rencana = platSerahRencana().filter((x) => /^994[12]$/.test(String(x.s.no))).map((x) => ({ no: x.s.no, lbr: x.baris.reduce((a, r) => a + r.q, 0), penuh: x.penuh }));
      return { rencana, kg: rr.kgPerLbr, utama: rr.label };
    });
    await go('bahan-baku');
    await page.waitForSelector('[data-act="serahsemua"]', { timeout: 5000 }).catch(async () => { throw new Error('diag ' + JSON.stringify(await page.evaluate(() => ({ hash: location.hash, tab: F['bahan-baku'].tab, plan: platSerahRencana().length, bar: !!document.querySelector('#serah-semua'), bisa: matBisaPr(), body: document.querySelector('#body').innerText.slice(0, 140).replace(/\s+/g, ' ') }))) + JSON.stringify(s41)); });
    await page.click('[data-act="serahsemua"]'); await page.waitForTimeout(400);
    await page.click('#mform button[type="submit"], .modal button[type="submit"]'); await page.waitForTimeout(1500);
    const h41 = await page.evaluate(async () => {
      const baru = S.mutasi.filter((m) => !window.__m41.has(m._id)); const mine = baru.filter((m) => m.spk === 'ph41a' || m.spk === 'ph41b');
      const o = { n: mine.length, a: -(mine.find((m) => m.spk === 'ph41a') || {}).delta, b: -(mine.find((m) => m.spk === 'ph41b') || {}).delta, doc: mine.every((m) => String(m.noDok).startsWith(DOCFMT.PK + '/') && m.jenis === 'keluar' && m.gudang === 'rm' && m.pihak === 'Produksi' && /Serah terima plate/.test(m.ket)), docBeda: new Set(mine.map((m) => m.noDok)).size === 2, stokTurun: window.__stok41.awal - calc().stock.rm[window.__stok41.id], ulang: platSerahRencana().filter((x) => /^994[12]$/.test(String(x.s.no))).length };
      /* mutasi tidak bisa dihapus permanen (migration 13); dibiarkan, tidak ada uji sesudah ini yang membaca stok bahan baku */
      await new Promise((r) => setTimeout(r, 500)); S.spk = S.spk.filter((z) => z._id !== 'ph41a' && z._id !== 'ph41b'); C = null; F['bahan-baku'].tab = 'stok'; return o;
    });
    const ex = (q, kg) => Math.ceil(1.1 * q * 10 / kg);
    ok('PH-41 T-serah: Serahkan semua membuat satu dokumen PK ber-SPK per SPK sebesar kebutuhan plat tersisa (qty x berat x 1,1 / kg per lembar), stok turun sama, dan tidak ada lagi yang menunggu', s41.rencana.length === 2 && h41.n === 2 && h41.a === ex(100, s41.kg) && h41.b === ex(200, s41.kg) && h41.doc && h41.docBeda && h41.stokTurun >= h41.a + h41.b && h41.ulang === 0, JSON.stringify({ s41, h41, harap: [ex(100, s41.kg), ex(200, s41.kg)] }));

    langkah = 'PH-42';
    const r42 = await page.evaluate(() => {
      const g = 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG'; const tgl = today();
      C = null; const rs = matRmSiap(); const dasar = (matReservasi(rs, 'x').total['SPHC|1.2']) || 0;
      S.spk.push({ _id: 'ph42', no: 9942, status: 'Terbit', customer: 'Uji Reservasi', due: '2099-01-01', tgl, terbitAt: new Date().toISOString(), h: g, items: [{ d: 'Cable Tray Uji Reservasi', q: 1000, u: 'Btg', w: 13.513, wEst: 14.712, g }] });
      C = null; const est = (matReservasi(rs, 'x').total['SPHC|1.2'] || 0) - dasar;
      S.spk.find((z) => z._id === 'ph42').items[0] = { d: 'Cable Tray Uji Reservasi', q: 1000, u: 'Btg', w: 13.513, g };
      C = null; const manual = (matReservasi(rs, 'x').total['SPHC|1.2'] || 0) - dasar;
      S.spk = S.spk.filter((z) => z._id !== 'ph42'); C = null;
      return { est: Math.round(est * 10) / 10, manual: Math.round(manual * 10) / 10 };
    });
    ok('PH-42 reservasi stok konsisten dengan kebutuhan plat: item berat estimasi dicadangkan 14.712 kg (tanpa waste ganda), item berat manual 13.513 kg x 1,1 = 14.864,3 kg', Math.abs(r42.est - 14712) < 0.2 && Math.abs(r42.manual - 14864.3) < 0.2, JSON.stringify(r42));

    langkah = 'PH-43';
    const r43 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const g = 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'; const tgl = today();
      const asli = window.MNIBerat; const o = {};
      window.MNIBerat = { siap: () => true, hitungItem: (q) => (/Cover/.test(q.deskripsi) ? { ok: true, beratSPK: 6.813, berat: { estimasi: 7.35, real: 6.813 } } : { ok: true, beratSPK: 13.513, berat: { estimasi: 14.712, real: 13.513 } }) };
      const items = [{ d: 'Cable Tray W300xH100xL3000', g, q: 10, u: 'Btg', w: 8.481 }, { d: 'Cover Tray W300xL3000', g, q: 10, u: 'Btg', w: 8.481 }, { d: 'Jointing Tray H100', g, q: 10, u: 'Btg', w: 8.481 }];
      const sedang = { _id: 'ph43a', no: 9943, status: 'Terbit', customer: 'Uji Berat', due: '2099-01-01', tgl, material: 'SPHC / ELG', tebal: '1.2', terbitAt: new Date().toISOString(), h: g, items: JSON.parse(JSON.stringify(items)) };
      const selesai = { _id: 'ph43b', no: 9944, status: 'Terbit', customer: 'Uji Selesai', due: '2099-01-01', tgl, material: 'SPHC / ELG', tebal: '1.2', terbitAt: new Date().toISOString(), h: g, items: JSON.parse(JSON.stringify(items)).map((i) => ({ ...i, prod: i.q })) };
      S.spk.push(sedang, selesai);
      S.kirim.push({ _id: 'k43', spk: 'ph43b', status: 'Diterima', tgl, noSJ: 'UJI-43', customer: 'Uji Selesai', items: items.map((i) => ({ d: i.d, q: i.q, u: i.u })) });
      C = null; const bd = spkBeratDaftar().map((x) => String(x.s.no));
      o.daftar = bd.includes('9943');
      const pb = spkBeratPerbaikan(sedang);
      o.ubah = pb ? pb.ubah.map((u) => [u.d.slice(0, 5), u.lama, u.baru, u.est]) : null;
      o.lamaTersimpan = pb ? pb.items.map((i) => i.wLama) : null;
      o.wBaru = pb ? pb.items.map((i) => i.w) : null; o.wEstBaru = pb ? pb.items.map((i) => i.wEst) : null;
      o.stSelesai = (calc().spk.ph43b || {}).st;
      o.selesaiTidakDiubah = !bd.includes('9944');
      window.MNIBerat = asli; S.spk = S.spk.filter((z) => z._id !== 'ph43a' && z._id !== 'ph43b'); S.kirim = S.kirim.filter((k) => k._id !== 'k43'); C = null;
      return o;
    });
    ok('PH-43 hitung ulang berat: SPK belum selesai terdeteksi (3 item berat salinan 8,481), berat lama disimpan, berat baru dan berat estimasi dari kalkulator; SPK yang sudah selesai tidak ikut', r43.daftar && r43.selesaiTidakDiubah && r43.ubah && r43.ubah.length === 3 && r43.wBaru.join() === '13.513,6.813,13.513' && r43.lamaTersimpan.every((x) => x === 8.481) && r43.wEstBaru.join() === '14.712,7.35,14.712', JSON.stringify(r43));

    langkah = 'PH-44';
    const r44 = await page.evaluate(() => {
      let s = byId('master', 'setting'); const dibuat = !s; if (dibuat) { s = { _id: 'setting', key: 'setting' }; S.master.push(s); } const asli = s.spkOpsi; const o = {};
      const lama = ['CABLE TRAY', 'PERFORATED CABLE TRAY', 'CABLE LADDER', 'CABLE DUCT', 'COVER TRAY', 'ACCS TRAY', 'ACCS LADDER', 'ACCS DUCT', 'SUPPORT TRAY', 'WIREMESH CABLE TRAY'];
      o.bawaan = HB_DEF.p.join('|');
      s.spkOpsi = { ...(asli || {}), p: lama }; o.lamaTidakDiubah = OPSI().p.join('|') === HB_DEF.p.join('|') && OPSI().p.includes('OTHER SUPPORT');
      s.spkOpsi = { ...(asli || {}), p: ['CABLE TRAY', 'ACCS TRAY'] }; o.diubahPemilik = OPSI().p.join('|') === 'CABLE TRAY|ACCS TRAY';
      s.spkOpsi = asli; if (asli === undefined) delete s.spkOpsi; if (dibuat) S.master = S.master.filter((x) => x !== s);
      o.urut = HB_DEF.p;
      return o;
    });
    ok('PH-44 daftar section bawaan: 11 section sesuai permintaan pemilik; Opsi SPK lama yang belum pernah diubah memakai bawaan baru, daftar yang diubah pemilik dihormati', r44.urut.length === 11 && r44.urut.join() === 'CABLE TRAY,PERFORATED CABLE TRAY,CABLE LADDER,CABLE DUCT,ACCS TRAY,ACCS LADDER,ACCS DUCT,COVER TRAY,COVER LADDER,COVER DUCT,OTHER SUPPORT' && r44.lamaTidakDiubah && r44.diubahPemilik, JSON.stringify(r44));

    langkah = 'PH-45';
    const r45 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const o = {}; const tgl = today(); const awal = (S.pr || []).length;
      const mk = (id, no, hari) => ({ _id: id, no, status: 'Terbit', customer: 'Uji susulan', due: '2099-01-01', tgl, h: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG', terbitAt: new Date(Date.now() - hari * 86400000).toISOString(), items: [{ d: 'Cable Tray W300xH100xL3000', q: 5000, u: 'Btg', w: 10, g: 'CABLE TRAY TYPE STU 1.2 mm SPHC / ELG' }] });
      S.spk.push(mk('ph45', 9945, 0), mk('ph45lama', 9946, 30)); C = null;
      _prSusulanAt = 0; await prSusulan(); await w(1200);
      o.baru = (S.pr || []).filter((p) => p.spk === 'ph45').length; o.lama = (S.pr || []).filter((p) => p.spk === 'ph45lama').length;
      _prSusulanAt = 0; await prSusulan(); await w(900);
      o.ulang = (S.pr || []).filter((p) => p.spk === 'ph45').length;
      S.spk = S.spk.filter((z) => !/^ph45/.test(z._id));
      for (const pp of (S.pr || []).filter((x) => /^ph45/.test(x.spk || ''))) { try { await DB.doc('pr/' + pp._id).delete(); } catch (e) { o.errDel = String(e.message || e).slice(0, 80); } await w(300); }
      C = null; await w(900); o.bersih = (S.pr || []).filter((x) => /^ph45/.test(x.spk || '') && x.status !== 'Batal').length === 0;
      return o;
    });
    ok('PH-45 susulan draf PR: SPK terbit baru tanpa PR (mis. diterbitkan PPIC) mendapat draf saat gudang bahan baku membuka modul; tidak ganda; SPK lama (30 hari) tidak dibanjiri', r45.baru === 1 && r45.lama === 0 && r45.ulang === 1 && r45.bersih, JSON.stringify(r45));

    langkah = 'PH-46';
    await buatSpk('Customer HH Tunda', 'CABLE TRAY TYPE STU 1.2 NON FINISHING', 'Cable Tray W200xH50xL3000', 10);
    const id46 = await page.evaluate(() => S.spk.find((z) => z.customer === 'Customer HH Tunda')._id);
    await page.evaluate((id) => prodForm(id), id46); await wait(500);
    await page.selectOption('#m-ta_0', 'Mesin rusak'); await page.fill('#m-tk_0', 'unit 2 menunggu sparepart');
    await page.evaluate(() => document.getElementById('msub').click()); await wait(1200);
    const a46 = await page.evaluate((id) => { const s = byId('spk', id); return { tunda: s.items[0].tunda && s.items[0].tunda.alasan, ket: s.items[0].tunda && s.items[0].tunda.ket, log: (s.prodLog || []).filter((e) => e.tunda).map((e) => e.ket), mon: /Mesin rusak/.test(tundaMon(s)), aktif: tundaAktif(s).length }; }, id46);
    await page.evaluate(() => { location.hash = '#spk'; }); await wait(300);
    await page.evaluate(() => { F.spk.tab = 'berjalan'; render(); }); await wait(600);
    const kartu46 = await page.evaluate(() => /Belum diproduksi/.test(document.body.innerText) && /Mesin rusak/.test(document.body.innerText));
    await page.evaluate(() => { F.spk.tab = 'list'; render(); }); await wait(300);
    await page.evaluate((id) => { const s = byId('spk', id); updDoc('spk', id, { items: s.items.map((i) => ({ ...i, prod: 4 })) }); }, id46); await wait(900);
    const b46 = await page.evaluate((id) => tundaAktif(byId('spk', id)).length, id46);
    ok('PH-46 alasan belum produksi: admin memilih alasan di Update produksi, tersimpan di item dan log, tampil di monitoring SPK dan kartu Berjalan; hilang dari daftar aktif setelah produksi mulai (log tetap)', a46.tunda === 'Mesin rusak' && /sparepart/.test(a46.ket) && a46.log.length === 1 && /Mesin rusak/.test(a46.log[0]) && a46.mon && a46.aktif === 1 && kartu46 && b46 === 0, JSON.stringify({ a46, kartu46, b46 }));

    langkah = 'PH-47';
    const r47 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const o = {}; const tgl = today();
      const mk = (id, no, h, d, q, wt, we) => ({ _id: id, no, status: 'Terbit', customer: 'Uji Laporan', due: '2099-01-01', tgl, h, material: 'SPHC', terbitAt: new Date(Date.now() - 3 * 86400000).toISOString(), items: [{ d, g: h, q, u: 'Btg', w: wt, wEst: we, prod: q }], prodLog: [{ tgl, at: new Date().toISOString(), by: 'admin@mni.local', ket: '', items: [{ d, q, wc: '' }] }] });
      S.spk.push(mk('ph47a', 9947, 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', 'Cable Tray W200xH50xL3000', 10, 15, 16.5), mk('ph47b', 9948, 'ACCS TRAY TYPE STU 1.2 ELECTRO GALVANIZED', 'Cable Tray Elbow W200xH50xR300', 4, 5, 5.5), mk('ph47c', 9949, 'OTHER SUPPORT TYPE STU 1.2 ELECTRO GALVANIZED', 'Hanger Beam W200', 20, 0.25, 0.27));
      C = null; F.produksi.tab = 'laporan'; F.produksi.lper = 'triwulan'; F.produksi.lby = 'produk'; F.produksi.lsusun = 'sec';
      location.hash = '#produksi'; await w(700); render(); await w(500);
      const tb = document.getElementById('lp-rinci'); o.rinci = tb ? tb.innerText.replace(/\s+/g, ' ') : '';
      o.pohon = document.getElementById('lp-tabel') ? document.getElementById('lp-tabel').innerText.replace(/\s+/g, ' ') : '';
      o.lama = document.getElementById('lp-lama') ? document.getElementById('lp-lama').innerText.replace(/\s+/g, ' ') : '';
      const m = lapRincianModel(); o.model = m.tables.map((x) => x.title + ':' + x.rows.length).join(' | ');
      const bytes = await docXlsx(m); o.xlsx = bytes && (bytes.byteLength || bytes.size || bytes.length) > 1000;
      S.spk = S.spk.filter((z) => !/^ph47/.test(z._id)); C = null; F.produksi.lsusun = 'std'; F.produksi.lper = 'bulan';
      return o;
    });
    ok('PH-47 laporan produksi per jenis produk: rincian (Cable Tray, Accs Elbow, Other Support Hanger Beam) dengan tonase aktual dan estimasi, susunan Section, lama produksi per SPK, model Excel terbentuk', /Cable Tray/.test(r47.rinci) && /Elbow/.test(r47.rinci) && /Hanger Beam/.test(r47.rinci) && /OTHER SUPPORT/.test(r47.pohon) && /9947/.test(r47.lama) && /terbit ke laporan pertama/i.test(r47.lama) && r47.model.includes('Rincian per jenis produk:') && r47.xlsx === true, JSON.stringify({ c: [/Cable Tray/.test(r47.rinci), /Elbow/.test(r47.rinci), /Hanger Beam/.test(r47.rinci), /OTHER SUPPORT/.test(r47.pohon), /9947/.test(r47.lama), /terbit ke laporan pertama/i.test(r47.lama), r47.lama.slice(0, 160)], rinci: r47.rinci.slice(0, 100), model: r47.model, xlsx: r47.xlsx, pohon: r47.pohon.slice(0, 200) }));

    langkah = 'PH-48';
    const r48 = await page.evaluate(async () => {
      const w = (ms) => new Promise((r) => setTimeout(r, ms)); const o = {}; const tgl = today();
      const mk = (id, no, by) => ({ _id: id, no, status: 'Terbit', customer: 'Uji Tim', due: '2099-01-01', tgl, h: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', material: 'SPHC', terbitAt: new Date().toISOString(), items: [{ d: 'Cable Tray W200xH50xL3000', g: 'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED', q: 10, u: 'Btg', w: 15, wEst: 16, prod: 10 }], prodLog: [{ tgl, at: new Date().toISOString(), by, ket: '', items: [{ d: 'Cable Tray W200xH50xL3000', q: 10, wc: '' }] }] });
      S.spk.push(mk('ph48a', 9948, ME), mk('ph48b', 9949, null)); S.log.push({ u: 'seed', at: '2000-01-01T00:00:00Z', c: 'rm', k: 'Data awal', mod: 'bahan-baku' }); C = null; await w(300);
      const K = kpiAgg('30'); const idAdm = Object.keys(K.U).filter((u) => (uname(u) || '') === (uname(ME) || ''));
      o.unikAdmin = idAdm.length === 1; o.tanpaSeed = !Object.keys(K.U).includes('seed');
      const per = PXL().periodeRentang('30', tgl); const tot = PXL().totalPeriode(lapEv(), per).qty; const att = Object.values(K.U).reduce((s, x) => s + (x.hq || 0), 0);
      o.lap = tot; o.att = att; o.selisih = hasilSelisih(per.dari, per.sampai, Object.values(K.U));
      o.aktA = (K.U[ME] || K.U[Object.keys(K.U).find((u) => (uname(u) || '') === (uname(ME) || ''))] || {}).total || 0;
      // alasan dari Master Data > Opsi SPK
      let s = byId('master', 'setting'); const dibuat = !s; if (dibuat) { s = { _id: 'setting', key: 'setting' }; S.master.push(s); } const asli = s.spkOpsi;
      s.spkOpsi = { ...(asli || {}), alasan: ['Menunggu cat', 'Listrik padam'] }; o.opsi = OPSI().alasan.join('|'); o.html = /Listrik padam/.test(tundaItemHtml({ d: 'x' }, 0)) && !/Mesin rusak/.test(tundaItemHtml({ d: 'x' }, 0));
      s.spkOpsi = asli; if (asli === undefined) delete s.spkOpsi; if (dibuat) S.master = S.master.filter((x) => x !== s);
      o.bawaan = OPSI().alasan.length === 6;
      S.spk = S.spk.filter((z) => !/^ph48/.test(z._id)); S.log = S.log.filter((l) => l.u !== 'seed'); C = null;
      return o;
    });
    ok('PH-48 Kinerja Tim dan Master Data selaras: satu orang satu baris, data awal (seed) bukan orang, hasil produksi per orang dicocokkan dengan Laporan Produksi (selisih tanpa pelapor ditampilkan), jejak laporan admin ikut aktivitas, alasan belum produksi dari Master Data', r48.unikAdmin && r48.tanpaSeed && r48.lap - r48.att === 10 && /10 pcs tanpa nama pelapor/.test(r48.selisih) && r48.opsi === 'Menunggu cat|Listrik padam' && r48.html && r48.bawaan, JSON.stringify(r48));
  } catch (e) {
    ok('PH-ERR ' + langkah, false, String(e.message).replace(/[[0-9;]*m/g,'').slice(0, 900));
  }
  ok('PH-99 tanpa pageerror', errs.length === 0, errs.join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
