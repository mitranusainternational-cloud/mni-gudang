// Uji serah terima plate gudang ke produksi (T-224, mock): status plate per SPK (Menunggu, Sebagian, Lengkap), tab Serah terima plate di Gudang Bahan Baku,
// form pengeluaran yang terisi, peringatan di daftar SPK dan antrian produksi, dan peringatan hilang setelah plate lengkap.
export async function runSerahPlate(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(900); };
    const body = () => page.evaluate(() => (document.querySelector('#body') || document.body).innerText.replace(/\s+/g, ' '));
    const submit = async () => { await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); }); await wait(1000); };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);

    // Work Centre sesuai rute standar supaya antrian produksi muncul
    await page.evaluate(async () => {
      for (const [i, nm] of ['Shearing', 'Punching'].entries()) await addDoc('mwc', { kode: 'WC-SP' + i, nama: nm, tipe: 'Internal', urutan: 20 + i, aktif: true, ket: '', mesin: [{ nama: nm + ' 1', operator: [], kapasitas: 0 }] });
    });
    await wait(1200);

    // SPK terbit: 10 pcs x 5 kg/pcs (berat manual, layout lama)
    await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(600);
    await page.fill('#ed-cust', 'PT Uji Plate'); await page.fill('#ed-po', 'PO-PLATE-1');
    await page.fill('#ed-d-0-0', 'Cable Tray W100xH50xL3000'); await page.fill('#ed-q-0-0', '10'); await page.fill('#ed-w-0-0', '5'); await wait(600);
    await page.evaluate(() => { const bt = [...document.querySelectorAll('#editor button')].find((x) => /Terbitkan SPK/.test(x.textContent)); if (bt) bt.click(); });
    await wait(2500);
    await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(500);
    const sid = await page.evaluate(() => S.spk.filter((x) => x.customer === 'PT Uji Plate').pop()._id);

    // SP-01 status Menunggu
    const p1 = await page.evaluate((id) => { const p = platSpk(byId('spk', id)); return p && { st: p.st, sudah: p.sudah, bruto: p.bruto, lbr: p.rc[0].butuhLbr, item: p.rc[0].utama && p.rc[0].utama.id }; }, sid);
    ok('SP-01 SPK terbit 10 x 5 kg: status plate Menunggu, bruto > 0, kebutuhan dalam lembar', !!p1 && p1.st === 'Menunggu' && p1.sudah === 0 && p1.bruto > 0 && p1.lbr >= 1 && !!p1.item, JSON.stringify(p1));

    // SP-02 tab Serah terima plate memuat SPK itu dan jumlahnya ada di label tab
    await go('#bahan-baku'); await page.click('[data-view="bahan-baku"][data-key="tab"][data-val="plate"]'); await wait(800);
    const t2 = await body();
    const lbl2 = await page.evaluate(() => [...document.querySelectorAll('.tabs button')].map((b) => b.textContent.trim()).find((x) => /Serah terima plate/.test(x)));
    ok('SP-02 tab Serah terima plate: label berisi jumlah, baris SPK Uji Plate dengan status Menunggu plate dan tombol Serahkan', /\(\d+\)/.test(lbl2 || '') && /PT Uji Plate/.test(t2) && /Menunggu plate/.test(t2) && /Serahkan ke produksi/.test(t2), (lbl2 || '') + ' | ' + t2.slice(0, 120));

    // SP-03 peringatan di daftar SPK dan antrian produksi
    await go('#spk'); const sp3 = await body();
    await page.evaluate(() => localStorage.setItem('mni-wc', 'Shearing')); await go('#mesin'); await page.reload(); await wait(3500);
    const ms3 = await body();
    ok('SP-03 peringatan "Plate belum diserahkan" tampil di daftar SPK dan di kartu antrian produksi', /Plate belum diserahkan/.test(sp3) && /Plate belum diserahkan/.test(ms3), JSON.stringify({ spk: /Plate belum diserahkan/.test(sp3), mesin: /Plate belum diserahkan/.test(ms3) }));

    // SP-04 serah sebagian (1 lembar) lewat mutasi: status Sebagian, sisa berkurang
    await page.evaluate(async ([sid, item]) => { await addDoc('mutasi', { gudang: 'rm', item, jenis: 'keluar', delta: -1, tgl: today(), spk: sid, pihak: 'Produksi', ket: 'uji sebagian', noDok: '', ref: '' }); }, [sid, p1.item]);
    await wait(1200);
    const p4 = await page.evaluate((id) => { const p = platSpk(byId('spk', id)); return { st: p.st, sudah: p.sudah, lbr: p.rc[0].butuhLbr }; }, sid);
    ok('SP-04 1 lembar sudah keluar untuk SPK: status Sebagian, sisa lembar berkurang', p4.st === 'Sebagian' && p4.sudah > 0 && p4.lbr === p1.lbr - 1, JSON.stringify({ p1: p1.lbr, p4 }));

    // SP-05 tombol Serahkan membuka form pengeluaran terisi (SPK, item, sisa lembar, keterangan)
    await go('#bahan-baku'); await page.click('[data-view="bahan-baku"][data-key="tab"][data-val="plate"]'); await wait(800);
    await page.evaluate((id) => document.querySelector('[data-act="platserah"][data-id="' + id + '"]').click(), sid); await wait(900);
    const f5 = await page.evaluate(() => { const f = document.querySelector('#mform'); return f ? { spk: f.spk.value, q: [...f.querySelectorAll('[name^="qty_"]')].map((i) => i.value).join('+'), item: [...f.querySelectorAll('[name^="item_"]')].map((i) => i.value).join('+'), ket: f.ket.value, pihak: f.pihak.value } : null; });
    ok('SP-05 form serah terima terisi: SPK terpilih, item plate utama, qty = sisa lembar, keterangan, tujuan Produksi', !!f5 && f5.spk === sid && f5.q === String(p4.lbr) && f5.item === p1.item && /Serah terima plate/.test(f5.ket) && f5.pihak === 'Produksi', JSON.stringify(f5));

    // SP-06 simpan: status Lengkap, hilang dari tab, peringatan hilang
    await submit();
    const p6 = await page.evaluate((id) => { const p = platSpk(byId('spk', id)); return { st: p.st, sisa: p.sisa, mut: S.mutasi.filter((m) => m.gudang === 'rm' && m.spk === id && m.jenis === 'keluar').length }; }, sid);
    await page.click('[data-view="bahan-baku"][data-key="tab"][data-val="plate"]').catch(() => {}); await wait(600);
    const t6 = await body();
    ok('SP-06 setelah diserahkan: status Lengkap, dua mutasi keluar bertanda SPK, SPK hilang dari tab dan peringatan hilang', p6.st === 'Lengkap' && p6.sisa <= 0.0005 && p6.mut === 2 && !/PT Uji Plate/.test(t6) && (await page.evaluate((id) => platChip(id), sid)) === '', JSON.stringify(p6));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('SP-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
