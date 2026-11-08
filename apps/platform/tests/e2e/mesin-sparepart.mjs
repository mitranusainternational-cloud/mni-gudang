// Uji master Mesin dan alur sparepart standar (T-221, mock): terima lewat PR (atau alasan tanpa PR), keluar ke mesin dengan jenis pemakaian dan pengambil,
// tab Pemakaian mesin, filter riwayat per mesin, dokumen, dan koreksi penerimaan PR yang mengembalikan sisa PR.
export async function runMesinSparepart(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(700); };
    const modalErr = () => page.evaluate(() => (document.querySelector('#modal')?.innerText || '').replace(/\s+/g, ' '));
    const submit = async () => { await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); }); await wait(900); };
    const openMv = async (j, item = '') => { await page.evaluate(([j, item]) => { const b = document.createElement('button'); b.dataset.act = 'mv'; b.dataset.g = 'sp'; b.dataset.j = j; b.dataset.item = item; document.body.appendChild(b); b.click(); b.remove(); }, [j, item]); await wait(700); };
    const stokOf = (id) => page.evaluate((id) => calc().stock.sp[id], id);

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);

    // data dasar: WC Punching bermesin, dua sparepart
    await page.evaluate(async () => {
      await addDoc('mwc', { kode: 'WC-PUN-01', nama: 'Punching', tipe: 'Internal', urutan: 1, aktif: true, ket: '', mesin: [{ nama: 'Punching 1 (20 Ton)', operator: ['Yana'], kapasitas: 0 }, { nama: 'Punching 2 (40 Ton)', operator: [], kapasitas: 0 }] });
      await addDoc('sp', { item: 'Oli hidrolik uji', kode: '901', satuan: 'Liter', stokAwal: 10, tglStokAwal: today(), min: 2, buffer: 5 });
      await addDoc('sp', { item: 'Seal uji', kode: '902', satuan: 'Pcs', stokAwal: 0, tglStokAwal: today(), min: 0, buffer: 0 });
    });
    await wait(1200);
    const ids = await page.evaluate(() => ({ a: S.sp.find((x) => x.item === 'Oli hidrolik uji')._id, b: S.sp.find((x) => x.item === 'Seal uji')._id }));
    await wait(900);

    // MS-01 tab Mesin: mesin dari Work Centre tampil; tambah peralatan pendukung
    await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="mesin"]'); await wait(600);
    const t1 = await page.evaluate(() => document.querySelector('#body')?.innerText || document.body.innerText);
    ok('MS-01 tab Mesin menampilkan mesin dari Work Centre dengan grupnya', /Punching 1 \(20 Ton\)/.test(t1) && /Punching 2 \(40 Ton\)/.test(t1) && /Mesin produksi/.test(t1), t1.slice(0, 120));
    await page.evaluate(() => document.querySelector('[data-act="mnew"]').click()); await wait(500);
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.nama.value = 'Forklift 1'; f.grup.value = 'lain'; f.kode.value = 'UT-01'; f.lokasi.value = 'Gudang'; });
    await submit();
    const lain = await page.evaluate(() => mesinSemua().find((m) => m.nama === 'Forklift 1'));
    ok('MS-02 tambah peralatan pendukung: tersimpan di grup Utilitas & pendukung dengan kode dan lokasi', !!lain && lain.src === 'lain' && lain.kode === 'UT-01' && lain.lokasi === 'Gudang' && lain.aktif, JSON.stringify(lain));
    await page.evaluate(() => document.querySelector('[data-act="mnew"]').click()); await wait(500);
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.nama.value = 'forklift 1'; f.grup.value = 'lain'; });
    await submit();
    const dup = await modalErr();
    ok('MS-03 nama mesin ganda (beda huruf besar) ditolak', /sudah ada/.test(dup), dup.slice(0, 120));

    await page.keyboard.press('Escape'); await wait(400);

    // MS-04 terima sparepart: wajib PR atau alasan
    await go('#sparepart'); await wait(400);
    await openMv('masuk', ids.b);
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '5'; f.pihak.value = 'Toko Teknik'; });
    await submit();
    const e4 = await modalErr();
    ok('MS-04 terima tanpa PR dan tanpa alasan ditolak; form tidak lagi memuat pilihan SPK', /Pilih PR|alasan/i.test(e4) && (await page.evaluate(() => !document.querySelector('#mform [name="spk"]'))), e4.slice(0, 140));
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.dasar.value = 'langsung'; });
    await submit();
    const e4b = await modalErr();
    ok('MS-05 tanpa PR dengan alasan tetapi tanpa keterangan ditolak', /keterangan/i.test(e4b), e4b.slice(0, 140));
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.ket.value = 'Dipesan teknisi, darurat'; });
    await submit(); await submit(); await wait(600);
    const m5 = await page.evaluate((id) => { const m = S.mutasi.filter((x) => x.gudang === 'sp' && x.item === id && x.jenis === 'masuk').pop(); return m ? { dasar: m.dasar, pr: m.pr, spk: m.spk, stok: calc().stock.sp[id] } : null; }, ids.b);
    ok('MS-06 penerimaan tanpa PR tersimpan dengan alasan, tanpa SPK, stok bertambah', !!m5 && m5.dasar === 'langsung' && !m5.pr && !m5.spk && m5.stok === 5, JSON.stringify(m5));

    // MS-07 terima lewat PR: pilih PR mengisi baris dan pemasok; kelebihan ditolak
    await page.evaluate(async (ids) => { await addDoc('pr', { gudang: 'sp', noPR: 'PR/2026/11/901', tgl: today(), butuh: today(), supplier: '', items: [{ item: ids.a, q: 20, qTerima: 0 }, { item: ids.b, q: 10, qTerima: 0 }], status: 'Diajukan', ket: '' }); }, ids);
    await wait(900);
    const pr = await page.evaluate(() => S.pr.find((x) => x.noPR === 'PR/2026/11/901')._id);
    await openMv('masuk');
    const f7 = await page.evaluate((pr) => { const f = document.querySelector('#mform'); f.pr.value = pr; f.pr.dispatchEvent(new Event('change', { bubbles: true })); return { rows: f.querySelectorAll('#m-mvl tr').length, q: [...f.querySelectorAll('[name^="qty_"]')].map((i) => i.value).join('+'), ref: f.ref.value, dasarHidden: document.getElementById('sp-dasar-f').style.display === 'none' }; }, pr);
    ok('MS-07 memilih PR mengisi dua baris dengan sisa PR (20+10), referensi nomor PR, dan menyembunyikan alasan tanpa PR', f7.rows === 2 && f7.q === '20+10' && f7.ref === 'PR/2026/11/901' && f7.dasarHidden, JSON.stringify(f7));
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelectorAll('[name^="qty_"]')[0].value = '25'; f.pihak.value = 'Toko Teknik'; });
    await submit();
    const e7 = await modalErr();
    ok('MS-08 penerimaan melebihi sisa PR ditolak dengan pesan jelas', /melebihi sisa/.test(e7), e7.slice(0, 160));
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelectorAll('[name^="qty_"]')[0].value = '8'; f.querySelectorAll('[name^="qty_"]')[1].value = '4'; });
    await submit(); await wait(600);
    const p8 = await page.evaluate((pr) => { const p = byId('pr', pr); return { st: p.status, q: p.items.map((i) => i.qTerima).join('+') }; }, pr);
    ok('MS-09 penerimaan sebagian: qTerima PR 8+4 dan status Dipesan; PR masih terbuka', p8.q === '8+4' && p8.st === 'Dipesan' && (await page.evaluate(() => spPrOpen().length)) === 1, JSON.stringify(p8));

    // MS-10 koreksi penerimaan PR mengembalikan qTerima
    const mid = await page.evaluate((ids) => { const m = S.mutasi.filter((x) => x.gudang === 'sp' && x.item === ids.a && x.jenis === 'masuk' && x.pr).pop(); return m && m._id; }, ids);
    await page.evaluate((id) => { const b = document.createElement('button'); b.dataset.act = 'koreksi'; b.dataset.id = id; document.body.appendChild(b); b.click(); b.remove(); }, mid); await wait(600);
    await page.evaluate(() => { document.querySelector('#mform [name="ket"]').value = 'Salah item'; });
    await submit(); await wait(700);
    const p10 = await page.evaluate((pr) => { const p = byId('pr', pr); return { st: p.status, q: p.items.map((i) => i.qTerima).join('+') }; }, pr);
    ok('MS-10 koreksi penerimaan dari PR mengembalikan qTerima (0+4) sehingga sisa PR benar', p10.q === '0+4' && p10.st === 'Dipesan', JSON.stringify(p10));

    // MS-11..15 keluarkan ke mesin
    await go('#sparepart'); await wait(400);
    await openMv('keluar', ids.a);
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '2'; });
    await submit();
    const k1 = await modalErr();
    ok('MS-11 keluar tanpa mesin ditolak; form tidak memuat pilihan SPK', /Pilih mesin/.test(k1) && (await page.evaluate(() => !document.querySelector('#mform [name="spk"]'))), k1.slice(0, 120));
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.mesin.value = 'Punching 1 (20 Ton)'; });
    await submit();
    const k2 = await modalErr();
    ok('MS-12 keluar tanpa nama pengambil ditolak', /pengambil/.test(k2), k2.slice(0, 120));
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.tujuan.value = 'perbaikan'; f.tujuan.dispatchEvent(new Event('change', { bubbles: true })); f.oleh.value = 'Yana'; });
    await submit();
    const k3 = await modalErr();
    ok('MS-13 perbaikan tanpa keterangan kerusakan ditolak', /keluhan|kerusakan/i.test(k3), k3.slice(0, 120));
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.ket.value = 'Seal bocor'; });
    await submit(); await wait(600);
    const m13 = await page.evaluate((id) => { const m = S.mutasi.filter((x) => x.gudang === 'sp' && x.item === id && x.jenis === 'keluar').pop(); return m ? { mesin: m.mesin, tujuan: m.tujuan, oleh: m.oleh, pihak: m.pihak, grup: m.mesinGrup, spk: m.spk, delta: m.delta } : null; }, ids.a);
    ok('MS-14 pengeluaran tersimpan: mesin, jenis pemakaian, pengambil, grup Punching, tanpa SPK, stok berkurang', !!m13 && m13.mesin === 'Punching 1 (20 Ton)' && m13.tujuan === 'perbaikan' && m13.oleh === 'Yana' && m13.pihak === 'Punching 1 (20 Ton)' && m13.grup === 'Punching' && !m13.spk && m13.delta === -2 && (await stokOf(ids.a)) === 8, JSON.stringify(m13));
    await openMv('keluar', ids.a);
    await page.evaluate(() => { const f = document.querySelector('#mform'); f.querySelector('[name^="qty_"]').value = '1'; f.tujuan.value = 'umum'; f.tujuan.dispatchEvent(new Event('change', { bubbles: true })); f.oleh.value = 'Budi'; });
    const hid = await page.evaluate(() => document.getElementById('sp-mesin-f').style.display);
    await submit();
    const k5 = await modalErr();
    ok('MS-15 jenis Umum menyembunyikan pilihan mesin dan mewajibkan keterangan', hid === 'none' && /keterangan/i.test(k5), JSON.stringify({ hid, k5: k5.slice(0, 100) }));
    await page.evaluate(() => { document.querySelector('#mform [name="ket"]').value = 'Lap dan pembersih bengkel'; });
    await submit(); await wait(600);

    // MS-16 tab Pemakaian mesin
    await go('#sparepart'); await page.click('[data-view="sparepart"][data-key="tab"][data-val="mesin"]'); await wait(600);
    const tm = await page.evaluate(() => document.querySelector('#body')?.innerText || document.body.innerText);
    ok('MS-16 tab Pemakaian mesin: Punching 1 memuat 1 pengeluaran 2 unit dan barang terbanyak; mesin lain belum ada pemakaian; baris Umum', /Punching 1 \(20 Ton\)/.test(tm) && /Oli hidrolik uji \(2\)/.test(tm) && /belum ada pemakaian/.test(tm) && /Umum \(bukan satu mesin\)/.test(tm), tm.replace(/\s+/g, ' ').slice(0, 220));
    await page.evaluate(() => document.querySelector('[data-act="spmesinlihat"][data-nm="Punching 1 (20 Ton)"]').click()); await wait(600);
    const rw = await page.evaluate(() => ({ tab: F['sparepart'].tab, mesin: F['sparepart'].mvmesin, rows: document.querySelectorAll('#body table tbody tr').length, txt: document.querySelector('#body table')?.innerText.replace(/\s+/g, ' ') || '' }));
    ok('MS-17 tombol Riwayat membuka riwayat mutasi tersaring per mesin', rw.tab === 'mutasi' && rw.mesin === 'Punching 1 (20 Ton)' && rw.rows === 1 && /Perbaikan/.test(rw.txt) && /Yana/.test(rw.txt), JSON.stringify(rw).slice(0, 220));

    // MS-18 dokumen pengeluaran memuat mesin
    const dk = await page.evaluate((id) => { const m = S.mutasi.filter((x) => x.gudang === 'sp' && x.item === id && x.jenis === 'keluar' && x.mesin).pop(); const d = mvDoc(m.noDok, 'keluar', m._id); return d ? d.meta.map((x) => x.join(': ')).join(' | ') : ''; }, ids.a);
    ok('MS-18 dokumen SP-K memuat Mesin / tujuan, jenis pemakaian, dan pengambil', /Mesin \/ tujuan: Punching 1 \(20 Ton\) \(Punching\)/.test(dk) && /Jenis pemakaian: Perbaikan/.test(dk) && /Diambil oleh: Yana/.test(dk), dk);

    // MS-19 nonaktifkan mesin: hilang dari pilihan, riwayat tetap
    await page.evaluate(async () => { const x = mesinSemua().find((m) => m.nama === 'Punching 2 (40 Ton)'); await saveSetting({ mesinInfo: { ...mesinInfoAll(), [x.nama]: { aktif: false } } }); });
    await wait(500);
    await openMv('keluar', ids.a);
    const opsi = await page.evaluate(() => [...document.querySelectorAll('#m-mesin option')].map((o) => o.textContent.trim()));
    ok('MS-19 mesin nonaktif tidak muncul di pilihan; mesin aktif dan peralatan pendukung tetap', !opsi.some((x) => /Punching 2/.test(x)) && opsi.some((x) => /Punching 1/.test(x)) && opsi.some((x) => /Forklift 1/.test(x)), opsi.join(' | '));
    await page.keyboard.press('Escape');
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('MS-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
