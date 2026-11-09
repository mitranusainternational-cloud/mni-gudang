// Uji Gudang Barang Jadi: tab Siap kirim customer (turunan SPK customer) dan Siap masuk stok (SPK stok), F-09 dan F-10 (mock).
export async function runGbjSiapKirim(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(900); };
    const tab = async (v) => { await go('#barang-jadi'); await page.click('[data-view="barang-jadi"][data-key="tab"][data-val="' + v + '"]'); await wait(700); };
    const lbl = (v) => page.evaluate((v) => (document.querySelector('[data-view="barang-jadi"][data-key="tab"][data-val="' + v + '"]') || {}).textContent || '', v);
    const body = () => page.evaluate(() => (document.querySelector('#body') || document.body).innerText.replace(/\s+/g, ' '));

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);

    // SPK customer 10 pcs
    await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(600);
    await page.fill('#ed-cust', 'PT Uji Siap Kirim'); await page.fill('#ed-po', 'PO-SK-1');
    await page.fill('#ed-d-0-0', 'Cable Tray W100xH50xL3000'); await page.fill('#ed-q-0-0', '10'); await page.fill('#ed-w-0-0', '5'); await wait(600);
    await page.evaluate(() => { const bt = [...document.querySelectorAll('#editor button')].find((x) => /Terbitkan SPK/.test(x.textContent)); if (bt) bt.click(); });
    await wait(2500);
    await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(500);
    const sid = await page.evaluate(() => S.spk.filter((x) => x.customer === 'PT Uji Siap Kirim').pop()._id);

    // GK-01 belum produksi: tab kosong, label tanpa angka
    await tab('siap');
    const t1 = await body();
    ok('GK-01 SPK customer baru (belum diproduksi) tidak muncul di tab Siap kirim customer', !/PT Uji Siap Kirim/.test(t1), await lbl('siap'));

    // GK-02 setelah produksi 6 pcs: baris SPK muncul dengan 6 menunggu kirim
    await page.evaluate(async (id) => { const s = byId('spk', id); const items = (s.items || []).map((it, i) => (i === 0 ? { ...it, prod: 6 } : it)); await updDoc('spk', id, { items }); }, sid);
    await wait(1200);
    await tab('siap');
    const r2 = await page.evaluate((id) => { const tr = document.querySelector('#fg-siapkirim tbody tr[data-spk="' + id + '"]'); return tr ? { teks: tr.innerText.replace(/\s+/g, ' '), tombol: !!tr.querySelector('[data-act="newkirim"]') } : null; }, sid);
    ok('GK-02 produksi 6 pcs: baris SPK PT Uji Siap Kirim tampil, 6 menunggu kirim, ada tombol Buat surat jalan, label tab berisi jumlah', !!r2 && /PT Uji Siap Kirim/.test(r2.teks) && /\b6\b/.test(r2.teks) && r2.tombol && /\(\d+\)/.test(await lbl('siap')), JSON.stringify(r2) + ' | ' + (await lbl('siap')));

    // GK-03 tombol membuka form surat jalan SPK itu
    await page.click('#fg-siapkirim tr[data-spk="' + sid + '"] [data-act="newkirim"]'); await wait(900);
    const m3 = await page.evaluate(() => (document.querySelector('#modal, .modal') || document.body).innerText.replace(/\s+/g, ' '));
    ok('GK-03 tombol Buat surat jalan membuka formulir pengiriman untuk SPK itu', /Uji Siap Kirim|PO-SK-1|Surat Jalan|Kirim/i.test(m3), m3.slice(0, 120));
    await page.keyboard.press('Escape'); await wait(500);

    // GK-04 SPK stok tidak muncul di Siap kirim customer
    await tab('siap');
    ok('GK-04 tab Siap kirim customer hanya memuat SPK customer (tanpa SPK stok)', !/STOK MNI/.test(await body()));

    // GK-05 tab Siap masuk stok kosong bila tidak ada SPK stok selesai
    await tab('masuk');
    ok('GK-05 tab Siap masuk stok kosong bila tidak ada hasil SPK stok yang menunggu', /Tidak ada hasil SPK stok yang menunggu diterima/.test(await body()));

    // GK-06 produk gudang + SPK stok yang sudah selesai produksi: baris dengan tombol Terima
    const r6 = await page.evaluate(async () => {
      await addDoc('fg', { kategori: 'Cable Tray', type: 'Uji', ukuran: '100x50', panjang: 3000, tebal: '1.2', finishing: 'HDG', buffer: 0, satuan: 'pcs' });
      await new Promise((r) => setTimeout(r, 800));
      const fg = S.fg[S.fg.length - 1];
      if (!fg) return { err: 'produk tidak ada' };
      await addDoc('spk', { no: '9901', tgl: today(), customer: 'STOK MNI', status: 'Terbit', stokReq: true, items: [{ d: fgLabel(fg), q: 8, fg: fg._id, prod: 8 }], sections: [] });
      return { fg: fg._id };
    });
    await wait(1500);
    await tab('masuk');
    const t6 = await page.evaluate(() => { const tr = document.querySelector('#fg-siapmasuk tbody tr'); return tr ? { teks: tr.innerText.replace(/\s+/g, ' '), tombol: !!tr.querySelector('[data-act="fgterima"]') } : null; });
    ok('GK-06 SPK stok selesai 8 pcs: tab Siap masuk stok memuat SPK 9901 dengan 8 siap diterima dan tombol Terima', !!t6 && /9901/.test(t6.teks) && /\b8\b/.test(t6.teks) && t6.tombol, JSON.stringify({ t6, r6 }));

    // GK-07 label tab dan tab Posisi stok tetap ada
    const lb = await lbl('masuk');
    ok('GK-07 label tab Siap masuk stok berisi jumlah dan tab Posisi stok tetap ada', /\(\d+\)/.test(lb) && !!(await lbl('stok')), lb);

    // GK-08 tombol Buat surat jalan nonaktif tanpa ceklis; ceklis SPK lalu buat surat jalan langsung dari gudang
    await tab('siap');
    const dis = await page.evaluate(() => !!document.querySelector('[data-act="fgsjbuat"]')?.disabled);
    await page.click('#fg-siapkirim input[data-fgsk="' + sid + '"]'); await wait(700);
    const en = await page.evaluate(() => { const b = document.querySelector('[data-act="fgsjbuat"]'); return b ? { off: b.disabled, teks: b.textContent.trim() } : null; });
    ok('GK-08 tombol Buat surat jalan nonaktif tanpa ceklis, aktif dengan jumlah SPK setelah SPK diceklis', dis && !!en && !en.off && /\(1\)/.test(en.teks), JSON.stringify({ dis, en }));
    await page.click('[data-act="fgsjbuat"]'); await wait(1200);
    const f8 = await page.evaluate((id) => { const f = document.querySelector('#mform'); return f ? { spk: f.spk.value === id, qty: [...f.querySelectorAll('input[name^="ln_"]')].map((i) => i.value) } : null; }, sid);
    ok('GK-09 formulir surat jalan terbuka dengan SPK terceklis terpilih dan qty terisi sisa siap kirim (6)', !!f8 && f8.spk && f8.qty.includes('6'), JSON.stringify(f8));
    await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); }); await wait(1800);
    const k8 = await page.evaluate((id) => S.kirim.filter((k) => k.spk === id).map((k) => ({ q: (k.items || []).reduce((a, i) => a + (+i.q || 0), 0), st: k.status })), sid);
    ok('GK-10 surat jalan tersimpan untuk SPK itu sejumlah 6 dan SPK keluar dari daftar Siap kirim', k8.length === 1 && k8[0].q === 6 && !/PT Uji Siap Kirim/.test(await (async () => { await tab('siap'); return body(); })()), JSON.stringify(k8));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('GK-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
