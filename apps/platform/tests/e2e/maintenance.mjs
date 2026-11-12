// Uji modul Maintenance (mock): jadwal rutin, catat maintenance dengan sparepart yang terhubung ke Gudang Sparepart, mesin baru otomatis ke Master Data,
// akumulasi per periode, per mesin (MTBF), Cek Data, hak akses, dan unduhan PDF dan Excel. Lihat documentation/SKEMA_MAINTENANCE.md.
export async function runMaintenance(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  let langkah = 'mulai';
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(900); };
    const klikSimpan = async () => { await page.evaluate(() => document.getElementById('msub').click()); await wait(1600); };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);

    // sparepart di Gudang Sparepart (stok awal)
    await page.evaluate(async () => {
      for (const [nm, kode, st] of [['Seal hidrolik', 'T-001', 10], ['Oli hidrolik', 'T-002', 4]]) await addDoc('sp', { kode, item: nm, satuan: 'pcs', lokasi: '', min: 1, buffer: 3, stokAwal: st, tglStokAwal: today(), aktif: true, ket: '' });
    });
    await wait(1200);

    langkah = 'MT-01';
    await go('#maintenance');
    const nav = await page.evaluate(() => ({ menu: [...document.querySelectorAll('#nav a')].some((a) => /Maintenance/.test(a.innerText)), tabs: [...document.querySelectorAll('#tools [data-key="tab"]')].map((b) => b.innerText.replace(/\s+/g, ' ')), mod: MODS.some((m) => m[0] === 'maintenance'), ROLES: { maintenance: ROLES.maintenance.mods.includes('maintenance') && ROLES.maintenance.mods.includes('sparepart'), produksi: ROLES.produksi.lihat.includes('maintenance'), gudang: ROLES.gudang.lihat.includes('maintenance'), ppic: ROLES.ppic.lihat.includes('maintenance'), viewer: ROLES.viewer.lihat.includes('maintenance'), admin: ROLES.admin.mods.includes('*') } }));
    ok('MT-01 menu Maintenance, lima tab, modul dan peran: peran Maintenance ubah (dengan sparepart), Produksi, Gudang, PPIC, Viewer lihat', nav.menu && nav.tabs.length >= 5 && nav.mod && nav.ROLES.maintenance && nav.ROLES.produksi && nav.ROLES.gudang && nav.ROLES.ppic && nav.ROLES.viewer && nav.ROLES.admin, JSON.stringify(nav));

    langkah = 'MT-02';
    await page.click('[data-act="mtcrutinnew"]'); await wait(800);
    await page.fill('#mform [name="mesin"]', 'Bending Uji 1'); await page.fill('#mform [name="tugas"]', 'Ganti oli hidrolik'); await page.fill('#mform [name="interval"]', '90'); await page.fill('#mform [name="mulai"]', '2020-01-01'); await wait(300);
    await klikSimpan();
    const r2 = await page.evaluate(() => ({ rutin: S.mtc.filter((x) => x.kind === 'rutin').map((x) => x.mesin + '|' + x.tugas + '|' + x.interval), master: mesinSemua().some((m) => m.nama === 'Bending Uji 1'), status: mtcRutinList().map((x) => x.status) }));
    ok('MT-02 jadwal rutin dibuat; mesin yang diketik langsung otomatis masuk Master Data; jatuh tempo lampau berstatus Terlambat', r2.rutin.length === 1 && r2.master && r2.status[0] === 'Terlambat', JSON.stringify(r2));

    langkah = 'MT-03';
    await go('#maintenance'); await page.click('[data-act="mtcnew"]'); await wait(800);
    await page.fill('#mform [name="tgl"]', await page.evaluate(() => today())); await page.fill('#mform [name="mesin"]', 'Bending Uji 1'); await page.selectOption('#mform [name="jenis"]', 'Korektif');
    await page.fill('#mform [name="masalah"]', 'Hidrolik bocor'); await page.fill('#mform [name="tindakan"]', 'Ganti seal'); await page.fill('#mform [name="teknisi"]', 'Pak Uji');
    await page.fill('#mform [name="mulai"]', '08:00'); await page.fill('#mform [name="selesai"]', '09:30');
    await page.selectOption('#m-sp_0', { label: 'Seal hidrolik — stok 10 pcs' }); await page.fill('#m-q_0', '99'); await wait(300);
    await klikSimpan();
    const gagal = await page.evaluate(() => ({ err: (document.getElementById('merr') || {}).innerText || '', n: S.mtc.filter((x) => x.kind === 'catat').length, mut: S.mutasi.filter((m) => m.gudang === 'sp' && m.jenis === 'keluar').length }));
    await page.fill('#m-q_0', '2'); await wait(300); await klikSimpan();
    const r3 = await page.evaluate(() => { const c = S.mtc.find((x) => x.kind === 'catat'); const sp = S.sp.find((x) => x.item === 'Seal hidrolik'); const m = S.mutasi.filter((x) => x.gudang === 'sp' && x.jenis === 'keluar'); return { no: c && c.no, status: c && c.status, parts: c && (c.parts || []).map((p) => p.nama + 'x' + p.q), stok: calc().stock.sp[sp._id], mut: m.map((x) => x.ref + '|' + x.tujuan + '|' + x.mesin + '|' + x.delta), down: c && MNIMaint.downtimeMenit(c) }; });
    ok('MT-03 qty sparepart melebihi stok ditolak; catatan tersimpan dengan nomor MTC, stok sparepart berkurang 2 (10 jadi 8), mutasi keluar di Gudang Sparepart bertujuan mesin dengan referensi MTC, downtime 90 menit dari jam', /melebihi stok/.test(gagal.err) && gagal.n === 0 && gagal.mut === 0 && /^MTC\/\d{4}\/\d{2}\/001$/.test(r3.no || '') && r3.stok === 8 && r3.mut.length === 1 && /^MTC MTC\//.test(r3.mut[0]) && /\|mesin\|Bending Uji 1\|-2$/.test(r3.mut[0]) && r3.down === 90, JSON.stringify({ gagal, r3 }));

    langkah = 'MT-04';
    await go('#sparepart');
    await page.evaluate(() => { F.sparepart.tab = 'mesin'; render(); }); await wait(900);
    const txt = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    ok('MT-04 pemakaian sparepart oleh Maintenance tampil di Gudang Sparepart (tab Pemakaian mesin menyebut mesin dan seal)', /Bending Uji 1/.test(txt) && /Seal hidrolik/.test(txt), txt.slice(0, 200));

    langkah = 'MT-05';
    await go('#maintenance'); await page.click('[data-act="mtcnew"]'); await wait(800);
    await page.fill('#mform [name="mesin"]', 'Punching Uji 1'); await page.selectOption('#mform [name="jenis"]', 'Korektif'); await page.selectOption('#mform [name="status"]', 'Menunggu sparepart'); await page.fill('#mform [name="masalah"]', 'Punch macet'); await wait(300); await klikSimpan();
    const id5 = await page.evaluate(() => S.mtc.find((x) => x.mesin === 'Punching Uji 1')._id);
    await page.evaluate((id) => mtcSelesaiForm(id), id5); await wait(800);
    await page.fill('#mform [name="tindakan"]', 'Ganti seal punch'); await page.selectOption('#m-sp_0', { label: 'Oli hidrolik — stok 4 pcs' }); await page.fill('#m-q_0', '1'); await wait(300); await klikSimpan();
    const r5 = await page.evaluate((id) => { const c = byId('mtc', id); return { status: c.status, parts: (c.parts || []).length, oli: calc().stock.sp[S.sp.find((x) => x.item === 'Oli hidrolik')._id] }; }, id5);
    await page.evaluate((id) => mtcBatal(id), id5); await wait(900);
    const bat = await page.evaluate((id) => byId('mtc', id).status, id5);
    ok('MT-05 catatan Menunggu sparepart diselesaikan dengan sparepart tambahan (stok oli 4 jadi 3); catatan yang sudah memakai sparepart tidak bisa dibatalkan', r5.status === 'Selesai' && r5.parts === 1 && r5.oli === 3 && bat === 'Selesai', JSON.stringify({ r5, bat }));

    langkah = 'MT-06';
    const r6 = await page.evaluate(async () => {
      const w = (ms) => new Promise((x) => setTimeout(x, ms)); const tg = (k) => addDays(today(), -k);
      const mk = (tgl, mesin, jenis) => addDoc('mtc', { kind: 'catat', no: 'X' + Math.random().toString(36).slice(2, 7), tgl, mesin, wc: '', jenis, status: 'Selesai', downtime: 30, teknisi: '', aktif: true, masalah: 'uji', tindakan: '', mulai: '', selesai: '', biaya: 0, parts: [], rutin: '' });
      await mk(tg(5), 'Bending Uji 1', 'Korektif'); await mk(tg(10), 'Bending Uji 1', 'Korektif'); await mk(tg(40), 'Bending Uji 1', 'Preventif'); await mk(tg(120), 'Bending Uji 1', 'Inspeksi');
      await w(800);
      const L = S.mtc; const M = MNIMaint; const P = PXL(); const t = today(); const o = {};
      o.hari = M.ringkas(L, P.periodeRentang('hari', t)).jumlah; o.semua = M.ringkas(L, P.periodeRentang('semua', t)).jumlah; o.tahun = M.ringkas(L, P.periodeRentang('tahun', t)).jumlah; o.m30 = M.ringkas(L, P.periodeRentang('30', t)).jumlah;
      o.sering = M.seringRusak(L, t).map((x) => x.mesin + ':' + x.korektif); o.mtbf = M.mtbfHari(L, 'Bending Uji 1');
      o.rank = M.perMesin(L, P.periodeRentang('semua', t), [])[0].mesin;
      return o;
    });
    ok('MT-06 akumulasi hari ini 2, 30 hari 4, semua 6, mesin sering rusak (3 korektif dalam 30 hari), MTBF terisi, ranking paling sering = Bending Uji 1', r6.hari === 2 && r6.semua === 6 && r6.m30 >= 4 && r6.sering.join() === 'Bending Uji 1:3' && r6.mtbf > 0 && r6.rank === 'Bending Uji 1', JSON.stringify(r6));

    langkah = 'MT-07';
    const tab = async (t) => { await page.evaluate((t) => { F.maintenance.tab = t; render(); }, t); await wait(700); return page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')); };
    const rg = await tab('ringkas'), mesin = await tab('mesin'), rutin = await tab('rutin'), catat = await tab('catat'), sparepart = await tab('sparepart');
    await page.evaluate(() => { F.maintenance.tab = 'mesin'; F.maintenance.mesin = 'Bending Uji 1'; render(); }); await wait(700);
    const det = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    ok('MT-07 lima tab tampil: Ringkasan (perlu perhatian rutin terlambat dan sering rusak), Per mesin dengan riwayat dan sparepart diganti, Jadwal rutin, Catatan, Sparepart diganti', /Perlu perhatian/.test(rg) && /Terlambat/.test(rg) && /Sering rusak/.test(rg) && /Frekuensi dan akumulasi per mesin/.test(mesin) && /Riwayat Bending Uji 1/.test(det) && /Seal hidrolik ×2/.test(det) && /Ganti oli hidrolik/.test(rutin) && /MTC\//.test(catat) && /Seal hidrolik/.test(sparepart), '');

    langkah = 'MT-08';
    await go('#cek-data');
    const cek = await page.evaluate(() => issues().filter((i) => i.cat === 'Maintenance').map((i) => i.title.replace(/<[^>]+>/g, '')));
    ok('MT-08 Cek Data memuat jadwal rutin terlambat dan mesin yang sering rusak', cek.some((x) => /terlambat/.test(x)) && cek.some((x) => /rusak 3 kali/.test(x)), JSON.stringify(cek));

    langkah = 'MT-09';
    const ex = await page.evaluate(async () => { const m = mtcModel(); const x = await docXlsx(m); const p = await docPdf(m); return { tabel: m.tables.map((t) => t.title.slice(0, 18) + ':' + t.rows.length), xlsx: (x.byteLength || x.size || x.length) > 5000, pdf: (p.byteLength || p.size || p.length) > 5000, rata: m.tables.every((t) => t.rows.every((r) => r.length === t.cols.length)) }; });
    ok('MT-09 laporan Maintenance dapat dibuat sebagai Excel dan PDF (ringkasan, per mesin, jadwal rutin, catatan, sparepart diganti)', ex.xlsx && ex.pdf && ex.rata && ex.tabel.length === 5, JSON.stringify(ex));

    langkah = 'MT-10';
    const r10 = await page.evaluate(async () => {
      const w = (ms) => new Promise((x) => setTimeout(x, ms)); const o = {};
      const ru = S.mtc.find((x) => x.kind === 'rutin'); mtcForm({ jenis: 'Preventif', mesin: ru.mesin, masalah: ru.tugas, rutin: ru._id, status: 'Selesai' }); await w(500);
      o.prefill = document.querySelector('#mform [name="mesin"]').value + '|' + document.querySelector('#mform [name="masalah"]').value + '|' + document.querySelector('#mform [name="jenis"]').value;
      document.querySelector('#mform [name="tindakan"]').value = 'Oli diganti'; document.getElementById('msub').click(); await w(1500);
      const st = mtcRutinList()[0]; o.status = st.status; o.kali = st.kaliSelesai; o.sisa = st.sisaHari;
      return o;
    });
    ok('MT-10 Kerjakan jadwal rutin membuka catatan Preventif yang terisi; setelah selesai jadwal bergeser (Aman, 90 hari)', /Bending Uji 1\|Ganti oli hidrolik\|Preventif/.test(r10.prefill) && r10.status === 'Aman' && r10.kali === 1 && r10.sisa >= 85, JSON.stringify(r10));

    langkah = 'MG-01';
    await go('#pengguna');
    const g1 = await page.evaluate(async () => {
      const w = (ms) => new Promise((x) => setTimeout(x, ms)); const o = {};
      o.sec = [...document.querySelectorAll('#nav .sec, #nav [class*="sec"]')].map((e) => e.innerText.trim().toUpperCase()).filter(Boolean);
      o.sekDariMenu = VIEWS.filter((v) => v.sec).map((v) => v.sec);
      o.hdrPaket = [...document.querySelectorAll('table.mx thead tr:first-child th')].map((th) => th.innerText.trim());
      inviteForm(); await w(600);
      o.grupBaris = document.querySelectorAll('#mform tr.gh').length; o.grupSel = document.querySelectorAll('#mform [data-grup]').length;
      const f = document.getElementById('mform'); const ds = f.querySelector('[data-grup="Gudang"]'); ds.value = 'ubah'; ds.dispatchEvent(new Event('change', { bubbles: true })); await w(200);
      o.gudang = ['bahan-baku', 'barang-jadi', 'sparepart'].map((m) => f['mod_' + m].value).join();
      o.logistikTetap = ['bongkar-muat', 'vendor', 'pengiriman'].map((m) => f['mod_' + m].value).join();
      f.role.value = 'maintenance'; f.role.dispatchEvent(new Event('change', { bubbles: true })); await w(200);
      o.mtRole = ['maintenance', 'sparepart', 'bahan-baku'].map((m) => f['mod_' + m].value).join();
      f.role.value = 'gudang'; f.role.dispatchEvent(new Event('change', { bubbles: true })); await w(200);
      o.gdRole = ['bahan-baku', 'barang-jadi', 'sparepart', 'bongkar-muat'].map((m) => f['mod_' + m].value).join();
      f.role.value = 'logistik'; f.role.dispatchEvent(new Event('change', { bubbles: true })); await w(200);
      o.lgRole = ['bongkar-muat', 'vendor', 'pengiriman', 'bahan-baku'].map((m) => f['mod_' + m].value).join();
      closeModal(); return o;
    });
    ok('MG-01 Pengguna dan Akses: modul dikelompokkan (Gudang, Logistik, SPK dan Produksi, Maintenance, Data) di menu, dialog akses, dan paket peran; pengaturan sekaligus per kelompok; peran Gudang, Logistik, Maintenance membawa hak yang sesuai', JSON.stringify(g1.sekDariMenu.filter((x, i, a) => a.indexOf(x) === i)) === JSON.stringify(['Pantauan', 'Gudang', 'Logistik', 'SPK & Produksi', 'Maintenance', 'Data', 'Tim']) && g1.grupBaris === 5 && g1.grupSel === 5 && g1.gudang === 'ubah,ubah,ubah' && g1.mtRole === 'ubah,ubah,' && g1.gdRole === 'ubah,ubah,ubah,lihat' && g1.lgRole === 'ubah,ubah,ubah,lihat' && ['GUDANG', 'LOGISTIK', 'SPK & PRODUKSI', 'MAINTENANCE', 'DATA'].every((x) => g1.hdrPaket.map((h) => h.toUpperCase()).includes(x)), JSON.stringify(g1));

    langkah = 'MT-11';
    const r11 = await page.evaluate(async () => {
      const w = (ms) => new Promise((x) => setTimeout(x, ms)); const o = {};
      const bikin = (warna) => new Promise((res) => { const cv = document.createElement('canvas'); cv.width = 640; cv.height = 480; const cx = cv.getContext('2d'); cx.fillStyle = warna; cx.fillRect(0, 0, 640, 480); cx.fillStyle = '#fff'; cx.fillText('uji', 20, 20); cv.toBlob((b) => res(new File([b], 'uji-' + warna.slice(1) + '.png', { type: 'image/png' })), 'image/png'); });
      mtcForm({ jenis: 'Korektif', mesin: 'Foto Uji 1', masalah: 'Bocor', tindakan: 'Ganti seal', status: 'Selesai' }); await w(500);
      o.baris0 = document.querySelectorAll('#mtc-parts .mtc-part').length; document.querySelector('[data-act="mtcpartadd"]').click(); document.querySelector('[data-act="mtcpartadd"]').click(); o.baris2 = document.querySelectorAll('#mtc-parts .mtc-part').length; document.querySelectorAll('#mtc-parts [data-act="mtcpartdel"]')[2].click(); o.baris3 = document.querySelectorAll('#mtc-parts .mtc-part').length;
      o.bagian = ['foto_sebelum', 'foto_sesudah', 'foto_bukti'].every((n) => !!document.getElementById('m-' + n));
      const dt = new DataTransfer(); dt.items.add(await bikin('#aa3333')); dt.items.add(await bikin('#33aa33')); const dt1 = new DataTransfer(); dt1.items.add(await bikin('#3333aa'));
      document.getElementById('m-foto_sebelum').files = dt.files; document.getElementById('m-foto_sesudah').files = dt1.files;
      document.getElementById('msub').click(); await w(2500);
      const c = S.mtc.find((x) => x.mesin === 'Foto Uji 1'); o.n1 = (c.foto || []).length; o.tahap = (c.foto || []).map((f) => f.tahap).sort().join(); o.data = (c.foto || [])[0] && c.foto[0].data.startsWith('data:image/jpeg');
      mtcFotoModal(c._id); await w(500); o.galeri = document.querySelectorAll('#modal figure img').length; o.tambah3 = document.querySelectorAll('#modal .mtc-foto-in').length; o.tombol = !!document.querySelector('[data-act="mtcdokpdf"]');
      const dt2 = new DataTransfer(); dt2.items.add(await bikin('#3333aa')); const tambah = document.querySelector('.mtc-foto-in[data-tahap="Bukti / nota"]'); tambah.files = dt2.files; tambah.dispatchEvent(new Event('change', { bubbles: true })); await w(2000);
      const c2 = byId('mtc', c._id); o.n2 = (c2.foto || []).length; o.tahap2 = c2.foto[3] && c2.foto[3].tahap;
      await mtcFotoUbah(c._id, c2.foto[0].id, { ket: 'sebelum diganti' }); await w(500); o.ket = byId('mtc', c._id).foto[0].ket;
      const lebih = new DataTransfer(); for (let i = 0; i < 7; i++) lebih.items.add(await bikin('#aaaa33')); const ed = document.querySelector('.mtc-foto-in[data-tahap="Sesudah"]'); if (ed) { ed.files = lebih.files; ed.dispatchEvent(new Event('change', { bubbles: true })); await w(1500); }
      o.batas = (byId('mtc', c._id).foto || []).length; closeModal();
      const m = mtcDokModel(c._id); const pdf = await docPdf(m); const xl = await docXlsx(m); const m0 = mtcDokModel(S.mtc.find((x) => x.kind === 'catat' && !(x.foto || []).length)._id); const pdf0 = await docPdf(m0);
      o.dok = { foto: m.foto.length, pdf: (pdf.byteLength || pdf.size || pdf.length), pdf0: (pdf0.byteLength || pdf0.size || pdf0.length), xlsx: (xl.byteLength || xl.size || xl.length) > 5000 };
      const rs = MNIMaint.ringkas(S.mtc, PXL().periodeRentang('semua', today())); o.rs = [rs.denganFoto, rs.jumlahFoto];
      o.cek = issues().filter((i) => i.cat === 'Maintenance').map((i) => i.title.replace(/<[^>]+>/g, '')).filter((x) => /tanpa foto/.test(x));
      return o;
    });
    ok('MT-11 sparepart ditambah lewat tombol (bukan baris tetap) dan foto dokumentasi terpisah Sebelum, Sesudah, Bukti: unggah saat mencatat (dua Sebelum, satu Sesudah, terkompres JPEG), galeri dengan tahap dan keterangan, tambah foto bukti, batas 8 foto, dokumen PDF dan Excel per catatan memuat foto, KPI dan Cek Data memakai kelengkapan foto', r11.baris0 === 1 && r11.baris2 === 3 && r11.baris3 === 2 && r11.bagian && r11.n1 === 3 && r11.tahap === 'Sebelum,Sebelum,Sesudah' && r11.data && r11.galeri === 3 && r11.tambah3 === 3 && r11.tombol && r11.n2 === 4 && r11.tahap2 === 'Bukti / nota' && r11.ket === 'sebelum diganti' && r11.batas === 4 && r11.dok.foto === 4 && r11.dok.pdf > r11.dok.pdf0 && r11.dok.xlsx && r11.rs[0] >= 1 && r11.rs[1] === 4 && r11.cek.length === 1, JSON.stringify(r11));

    langkah = 'MG-02';
    const masuk = async (u) => {
      await page.evaluate(async () => { try { await USER.signOut(); } catch (e) { /* sudah keluar */ } }); await wait(1500);
      await page.goto(base); await page.reload(); await wait(1200);
      await page.fill('#auth-email', u + '@mni.local'); await page.click('#auth-btn');
      await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
      await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 0 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 }); await wait(1500);
      return page.evaluate(async () => {
        const w = (ms) => new Promise((x) => setTimeout(x, ms)); const o = {};
        o.menu = [...document.querySelectorAll('#nav a')].map((a) => a.getAttribute('href').slice(1)); o.heads = [...document.querySelectorAll('#nav .sec')].map((e) => e.innerText.trim().toUpperCase());
        o.aksi = {}; for (const id of o.menu) { location.hash = '#' + id; await w(450); const b = [...document.querySelectorAll('#tools button.primary')].filter((x) => x.offsetParent !== null).map((x) => x.innerText.replace(/\s+/g, ' ').trim()); if (b.length) o.aksi[id] = b.join('/'); }
        return o;
      });
    };
    const rp = await masuk('produksi'), rmt = await masuk('maintenance'), rgj = await masuk('gbj'), rv = await masuk('viewer');
    const tanpa = (o, ...ids) => ids.every((i) => !o.menu.includes(i));
    ok('MG-02 menu per peran (login nyata di mock): Produksi tanpa gudang tetapi tetap ada judul Logistik; Maintenance hanya Gudang Sparepart di bagian Gudang dan tombol Catat maintenance; Gudang Barang Jadi punya judul Gudang walau bahan baku tersembunyi; Viewer tanpa tombol aksi', rp.menu.includes('vendor') && tanpa(rp, 'bahan-baku', 'barang-jadi', 'sparepart', 'bongkar-muat', 'pengiriman', 'kinerja', 'pengguna') && !rp.heads.includes('GUDANG') && rp.heads.includes('LOGISTIK') && rp.aksi.spk === 'SPK baru' && rmt.menu.includes('sparepart') && tanpa(rmt, 'bahan-baku', 'barang-jadi', 'vendor', 'pengiriman') && rmt.heads.includes('GUDANG') && rmt.aksi.maintenance === 'Catat maintenance' && rmt.aksi.sparepart === 'Terima sparepart' && !rmt.aksi.spk && rgj.menu.includes('barang-jadi') && tanpa(rgj, 'bahan-baku', 'sparepart') && rgj.heads.includes('GUDANG') && Object.keys(rv.aksi).filter((k) => k !== 'master-data').length === 0 && rv.menu.includes('maintenance') && tanpa(rv, 'master-data', 'kinerja', 'pengguna'), JSON.stringify({ rp: [rp.heads, rp.aksi], rmt: [rmt.heads, rmt.aksi], rgj: [rgj.heads, rgj.aksi], rv: [rv.heads, rv.aksi] }).slice(0, 700));

    langkah = 'MG-03';
    await masuk('maintenance');
    const s3 = await page.evaluate(async () => {
      const w = (ms) => new Promise((x) => setTimeout(x, ms)); const o = {};
      location.hash = '#bahan-baku'; await w(700); o.langsungGudang = location.hash + '|' + document.getElementById('ttl').textContent.trim();
      location.hash = '#master-data'; await w(700); o.langsungMaster = document.getElementById('ttl').textContent.trim();
      location.hash = '#laporan'; await w(700); o.laporan = [...document.querySelectorAll('[id^="lap-"] h2')].map((h) => h.innerText).join();
      o.csv = ringkasLaporan('bln').map((r) => r.bag).filter((x, i, a) => a.indexOf(x) === i).join();
      location.hash = '#produksi'; await w(700); o.tabAnalisa = [...document.querySelectorAll('#tools [data-key="tab"]')].map((b) => b.innerText.trim()).join();
      location.hash = '#dashboard'; await w(700); o.dash = [...document.querySelectorAll('.panel header h2')].map((h) => h.innerText).join();
      o.feed = document.querySelector('.feed') ? document.querySelector('.feed').innerText.replace(/\s+/g, ' ').slice(0, 300) : '';
      o.level = MODS.map(([m]) => m + '=' + (myLevel(m) || '-')).join();
      return o;
    });
    ok('MG-03 hak ketat: peran Maintenance hanya melihat modul yang diatur (membuka gudang bahan baku atau Master Data lewat alamat langsung kembali ke Dashboard), Laporan hanya Produksi dan Sparepart, Analisa Produksi tanpa tab Vendor dan Pengiriman, Dashboard tanpa panel stok dan vendor, aktivitas tanpa modul lain', /dashboard|Dashboard/.test(s3.langsungGudang) && s3.langsungMaster === 'Dashboard' && s3.laporan === 'Produksi,Sparepart' && s3.csv === 'Produksi,Sparepart' && !/Vendor|Pengiriman/.test(s3.tabAnalisa) && /Laporan Produksi/.test(s3.tabAnalisa) && !/Stok bahan baku|vendor finishing|Top customer/.test(s3.dash) && /bahan-baku=-/.test(s3.level) && /maintenance=ubah/.test(s3.level), JSON.stringify(s3).slice(0, 900));

    ok('MT-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  } catch (e) {
    ok('MT-ERR ' + langkah, false, String(e.message).replace(/[[0-9;]*m/g, '').slice(0, 900));
  }
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
