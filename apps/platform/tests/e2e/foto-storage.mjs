// Uji foto ke Storage (mock): mode bawaan tetap di database, mode Storage menyimpan path, tampilan dan ekspor menangani foto campuran,
// migrasi foto lama aman (galat Storage tidak menyentuh dokumen), dan mematikan mode tidak menghilangkan foto.
// Storage di mock hanya di memori (local-supabase.js); bukti Supabase nyata butuh uji di staging.
export async function runFotoStorage(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  let langkah = 'mulai';
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);

    langkah = 'FS-01';
    const s1 = await page.evaluate(async () => {
      const c = document.createElement('canvas'); c.width = 40; c.height = 30; c.getContext('2d').fillStyle = '#c33'; c.getContext('2d').fillRect(0, 0, 40, 30);
      window.__JPG = c.toDataURL('image/jpeg', 0.8);
      const t = today();
      await addDoc('bongkar', { jenis: 'Unloading', muatan: 'Bahan Baku', pihak: 'Supplier Uji', ref: '', kendaraan: 'Truk', nopol: 'B 9001 UJI', driver: 'Budi', tgl: t, jamMasuk: '08:00', jamMulai: '08:10', jamSelesai: '', status: 'Proses', ket: '' });
      for (let i = 0; i < 30 && !S.bongkar.some((x) => x.nopol === 'B 9001 UJI'); i++) await new Promise((r) => setTimeout(r, 200));
      const b = S.bongkar.find((x) => x.nopol === 'B 9001 UJI');
      const r = await FOTO.simpan('bongkar', 'fuji1', { data: window.__JPG });
      return { mode: FOTO.mode, aktif: FOTO.aktif(), siap: !!(DB.storage && DB.storage.siap), simpan: Object.keys(r).join(), id: b && b._id };
    });
    ok('FS-01 mode bawaan = database: foto baru tetap disimpan sebagai data URL meski Storage tersedia', s1.mode === 'inline' && !s1.aktif && s1.siap && s1.simpan === 'data', JSON.stringify(s1));

    langkah = 'FS-02';
    const s2 = await page.evaluate(async (id) => {
      await updDoc('bongkar', id, { foto: [{ id: 'flama1', data: window.__JPG, w: 40, h: 30, at: new Date().toISOString(), by: ME || null, ket: '', cetak: true }, { id: 'flama2', data: window.__JPG, w: 40, h: 30, at: new Date().toISOString(), by: ME || null, ket: '', cetak: true }] });
      await new Promise((r) => setTimeout(r, 600));
      return { n: byId('bongkar', id).foto.length };
    }, s1.id);
    const p2 = await page.evaluate(() => { const r = fotoRingkas(); const h = fotoPanel(); return { ...r, panel: /Penyimpanan foto/.test(h), tombol: /data-act="fotomigrasi"/.test(h) && /data-act="fotomode"/.test(h) }; });
    ok('FS-02 panel Penyimpanan foto (khusus super admin) menghitung foto di database dan menyediakan tombol pindah dan mode', s2.n === 2 && p2.inline === 2 && p2.storage === 0 && p2.panel && p2.tombol, JSON.stringify({ s2, p2 }));

    langkah = 'FS-03';
    const s3 = await page.evaluate(async () => { await fotoMode(true); await new Promise((r) => setTimeout(r, 800)); return { aktif: FOTO.aktif(), set: byId('master', 'setting') && byId('master', 'setting').fotoStorage }; });
    ok('FS-03 mengaktifkan mode Storage melewati uji unggah-unduh dan menyimpan pengaturan', s3.aktif === true && s3.set === true, JSON.stringify(s3));

    langkah = 'FS-04';
    const s4 = await page.evaluate(async (id) => {
      const r = await FOTO.simpan('bongkar', 'fbaru1', { data: window.__JPG });
      const doc = byId('bongkar', id);
      await updDoc('bongkar', id, { foto: [...doc.foto, { id: 'fbaru1', ...r, w: 40, h: 30, at: new Date().toISOString(), by: ME || null, ket: '', cetak: true }] });
      await new Promise((x) => setTimeout(x, 600));
      const f = byId('bongkar', id).foto;
      await FOTO.siapkan(f);
      const baru = f.find((x) => x.id === 'fbaru1');
      return { keys: Object.keys(r).join(), path: r.path, n: f.length, tanpaData: !baru.data, srcBaru: /^blob:|^https?:/.test(FOTO.src(baru)), srcLama: FOTO.src(f[0]) === f[0].data, cetak: bmFotoCetak(byId('bongkar', id)).length };
    }, s1.id);
    ok('FS-04 foto baru masuk Storage (dokumen hanya menyimpan path), foto lama tetap tampil, keduanya ikut daftar cetak', s4.keys === 'path' && s4.path === 'bongkar/fbaru1.jpg' && s4.n === 3 && s4.tanpaData && s4.srcBaru && s4.srcLama && s4.cetak === 3, JSON.stringify(s4));

    langkah = 'FS-05';
    const s5 = await page.evaluate(async (id) => {
      const p = await FOTO.penuh(byId('bongkar', id).foto);
      const asli = byId('bongkar', id).foto.find((x) => x.id === 'fbaru1');
      return { n: p.length, semuaData: p.every((x) => /^data:image\//.test(x.data)), sumberTakBerubah: !asli.data };
    }, s1.id);
    ok('FS-05 untuk PDF dan Excel, foto Storage diunduh menjadi data URL pada salinan; dokumen sumber tidak ikut berubah', s5.n === 3 && s5.semuaData && s5.sumberTakBerubah, JSON.stringify(s5));

    langkah = 'FS-06';
    const s6 = await page.evaluate(async () => { window.__MOCK_STORAGE_FAIL = true; let galat = ''; try { await FOTO.simpan('bongkar', 'fgagal', { data: window.__JPG }); } catch (e) { galat = e.message; } window.__MOCK_STORAGE_FAIL = false; return { galat }; });
    ok('FS-06 unggah gagal melempar galat (pengguna diberi tahu, dokumen tidak disentuh, tidak jatuh diam-diam ke database)', /gagal/i.test(s6.galat), JSON.stringify(s6));

    langkah = 'FS-07';
    // migrasi: foto lama dua buah dipindah; satu kali gagal dulu supaya dokumen utuh, lalu berhasil
    const s7a = await page.evaluate(async (id) => { window.__MOCK_STORAGE_FAIL = true; await fotoMigrasi(); window.__MOCK_STORAGE_FAIL = false; const f = byId('bongkar', id).foto; return { lama: f.filter((x) => x.data).length, path: f.filter((x) => x.path).length }; }, s1.id);
    const s7b = await page.evaluate(async (id) => { await fotoMigrasi(); await new Promise((r) => setTimeout(r, 800)); const f = byId('bongkar', id).foto; const r = fotoRingkas(); return { lama: f.filter((x) => x.data).length, path: f.filter((x) => x.path).length, id: f.map((x) => x.id).join(), meta: f.every((x) => x.w === 40 && x.h === 30 && x.cetak === true), ringkas: r }; }, s1.id);
    ok('FS-07 migrasi foto lama: saat Storage gagal dokumen tetap utuh (2 di database), setelah pulih semua pindah dengan metadata dan urutan sama dan tidak ada yang tertinggal di database',
      s7a.lama === 2 && s7a.path === 1 && s7b.lama === 0 && s7b.path === 3 && s7b.id === 'flama1,flama2,fbaru1' && s7b.meta && s7b.ringkas.inline === 0 && s7b.ringkas.storage === 3, JSON.stringify({ s7a, s7b }));

    langkah = 'FS-08';
    const s8 = await page.evaluate(async (id) => { await fotoMode(false); await new Promise((r) => setTimeout(r, 800)); const f = byId('bongkar', id).foto; await FOTO.siapkan(f); const r = await FOTO.simpan('bongkar', 'fx', { data: window.__JPG }); return { mode: FOTO.mode, baru: Object.keys(r).join(), masihTampil: f.every((x) => /^blob:|^https?:/.test(FOTO.src(x))) }; }, s1.id);
    ok('FS-08 mematikan mode Storage: foto baru kembali ke database, foto yang sudah di Storage tetap tampil', s8.mode === 'inline' && s8.baru === 'data' && s8.masihTampil, JSON.stringify(s8));

    langkah = 'FS-09';
    // tampilan drawer: galeri memakai tautan Storage tanpa galat
    await page.evaluate(async (id) => { await FOTO.siapkanSemua('bongkar'); location.hash = '#bongkar-muat'; await new Promise((r) => setTimeout(r, 900)); }, s1.id);
    const s9 = await page.evaluate(async (id) => { const b = document.querySelector('[data-act="openbm"][data-id="' + id + '"]'); if (b) b.click(); await new Promise((r) => setTimeout(r, 900)); return { imgs: [...document.querySelectorAll('.bm-foto img')].map((i) => i.src.slice(0, 5)) }; }, s1.id);
    ok('FS-09 galeri drawer Bongkar Muat menampilkan semua foto (data URL dan tautan Storage)', s9.imgs.length === 3 && s9.imgs.every((s) => /^(data:|blob:|http)/.test(s)), JSON.stringify(s9));

    ok('FS-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  } catch (e) {
    ok('FS-ERR ' + langkah, false, String(e.message).replace(/\u001b\[[0-9;]*m/g, '').slice(0, 900));
  }
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
