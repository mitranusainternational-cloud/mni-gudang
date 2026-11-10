// Uji tampilan ringkas editor SPK (T-226, mock): satu baris = bentuk, ukuran, qty; Kg est dan Kg real langsung tampil per baris, per section, dan di ringkasan;
// spesifikasi, catatan, vendor, dan produk stok ada di menu ⋯; stok sebagai angka; berat hasil kalkulator tidak diketik.
import fs from 'node:fs';

const kat = JSON.parse(fs.readFileSync(new URL('./fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));

export async function runSpkRingkas(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  let langkah = 'awal';
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(900); };
    const bukaBaru = async () => { await go('#spk'); await page.click('#tools [data-act="newspk"]'); await page.waitForSelector('#ed-secs'); await wait(600); };
    const sel = (s) => page.evaluate((s) => (document.querySelector(s) || {}).textContent || '', s);
    const dim = async (li, w, h, l, q) => { for (const [k, v] of [['w', w], ['h', h], ['l', l]]) await page.fill('#ed-dm-0-' + li + '-' + k, String(v)); await page.fill('#ed-q-0-' + li, String(q)); await wait(500); };

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.reload(); await wait(3500);

    // RK-01 tanpa katalog: pemberitahuan, berat diketik manual, Kg est = Kg real, ringkasan menandai berat manual
    await bukaBaru();
    const ban = await page.evaluate(() => /Katalog berat belum terpasang/.test(document.getElementById('editor').innerText));
    await dim(0, 100, 50, 3000, 10);
    await page.fill('#ed-w-0-0', '5'); await wait(500);
    const m1 = await page.evaluate(() => ({ ke: document.querySelector('tr[data-l="0"] [data-ke]').textContent, kr: document.querySelector('tr[data-l="0"] [data-bi]').textContent, tot: document.getElementById('ed-tot').innerText.replace(/\s+/g, ' ') }));
    ok('RK-01 tanpa katalog: pemberitahuan tampil; berat manual 5 x 10 pcs = 50 untuk est dan real; ringkasan menandai berat manual', ban && m1.ke === '50' && m1.kr === '50' && /Berat manual/.test(m1.tot), JSON.stringify({ ban, m1 }));
    await page.evaluate(() => { closeEditor(); }); await wait(500);

    // katalog terpasang
    await page.evaluate((c) => { window.MNIBerat.setKatalog(c); }, kat);
    await page.evaluate(async () => { await addDoc('fg', { kategori: 'Cable Tray', type: 'STU', ukuran: '100x50', panjang: 3000, finishing: 'ELG', tebal: 1.2, satuan: 'Btg', stok_awal: 30, tgl_stok_awal: today(), aktif: true, data: {} }); });
    await wait(1200);

    langkah = 'RK-02';
    // RK-02 baris ringkas: tanpa kolom Spesifikasi dan dropdown vendor di baris; kolom Kg est dan Kg real
    await bukaBaru();
    const h2 = await page.evaluate(() => ({ th: [...document.querySelectorAll('#ed-secs thead th')].map((t) => t.textContent.trim()), spec: !!document.querySelector('#ed-secs .c-spec'), vv: !!(document.querySelector('#ed-vv-0-0') && document.querySelector('#ed-vv-0-0').offsetParent) }));
    ok('RK-02 baris tanpa kolom Spesifikasi dan dropdown vendor terlihat; ada kolom Kg est dan Kg real', !h2.th.includes('Spesifikasi') && !h2.spec && !h2.vv && h2.th.includes('Kg est') && h2.th.includes('Kg real'), JSON.stringify(h2));

    // RK-03 berat langsung muncul: 50 pcs W300xH100xL3000
    await dim(0, 300, 100, 3000, 50);
    const r3 = await page.evaluate(() => { const t = document.querySelector('tr[data-l="0"]'); return { ke: t.querySelector('[data-ke]').textContent, kr: t.querySelector('[data-bi]').textContent, ro: t.querySelector('[data-f=w]').readOnly, sec: document.getElementById('ed-sum-0').innerText.replace(/\s+/g, ' '), tot: document.getElementById('ed-tot').innerText.replace(/\s+/g, ' ') }; });
    const pcs = await page.evaluate(() => { const B = window.MNIBerat; const r = B.kgPerPcs({ keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 300, h: 100, l: 3000 }, tebal: 1.2, material: 'SPHC', lubang: 'standar' }); return r && r.ok ? { e: r.kgPcsEst, r: r.kgPcsReal } : null; });
    const fmt = (x) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Math.round(x * 100) / 100);
    ok('RK-03 isi W H L dan qty: Kg est dan Kg real muncul langsung (sama dengan katalog), berat/pcs tidak bisa diketik, subtotal section dan ringkasan ikut', !!pcs && r3.ke === fmt(pcs.e * 50) && r3.kr === fmt(pcs.r * 50) && r3.ro === true && r3.sec.includes(fmt(pcs.e * 50)) && r3.tot.includes(fmt(pcs.e * 50)) && r3.tot.includes(fmt(pcs.r * 50)), JSON.stringify({ r3, pcs }));

    // RK-04 badge vendor di header section
    const b4 = await sel('#ed-sv-0');
    ok('RK-04 header section menampilkan vendor otomatis dari finishing (→ vendor ELG)', /vendor ELG/.test(b4), b4);

    // RK-05 menu ⋯: catatan merah, keterangan, vendor, dan produk stok tersembunyi lalu terbuka
    const tertutup = await page.evaluate(() => document.getElementById('ed-det-0-0').hidden);
    await page.click('tr[data-l="0"] [data-act="ed-det"]'); await wait(300);
    const det = await page.evaluate(() => { const d = document.getElementById('ed-det-0-0'); return { buka: !d.hidden, ids: ['ed-k-0-0', 'ed-c-0-0', 'ed-vv-0-0', 'ed-fg-0-0'].map((i) => !!d.querySelector('#' + i)) }; });
    ok('RK-05 menu ⋯ tertutup bawaan, terbuka dengan catatan merah, keterangan, vendor, dan produk stok', tertutup && det.buka && det.ids.every(Boolean), JSON.stringify({ tertutup, det }));

    // RK-06 isian di menu ⋯ tetap terbuka setelah gambar ulang dan ikut tersimpan
    await page.fill('#ed-k-0-0', 'URGENT'); await wait(300);
    await page.selectOption('#ed-hf-0', { index: 2 }).catch(() => {}); await wait(600);
    await page.selectOption('#ed-hf-0', { label: 'ELECTRO GALVANIZED' }).catch(() => {}); await wait(600);
    const d6 = await page.evaluate(() => ({ buka: !document.getElementById('ed-det-0-0').hidden, ket: document.getElementById('ed-k-0-0').value }));
    ok('RK-06 baris dengan catatan tetap terbuka setelah section digambar ulang dan isinya utuh', d6.buka && d6.ket === 'URGENT', JSON.stringify(d6));

    // RK-07 stok: tombol Pakai stok, lalu Kg est berkurang sebesar qty stok
    const t7 = await page.evaluate(() => (document.querySelector('tr[data-l="0"] .c-stk') || {}).innerText || '');
    ok('RK-07 stok dari produk gudang yang cocok? (W300xH100 tidak cocok): sel stok tidak berisik', !/Tidak ada stok cocok/.test(t7), t7.replace(/\s+/g, ' '));
    await dim(1, 100, 50, 3000, 20);
    await wait(600);
    const s7 = await page.evaluate(() => (document.querySelector('tr[data-l="1"] .c-stk') || {}).innerText || '');
    ok('RK-08 baris W100xH50xL3000 mendapat tawaran "Pakai stok" dari produk gudang yang cocok', /Pakai stok/.test(s7), s7.replace(/\s+/g, ' '));
    await page.click('tr[data-l="1"] [data-act="ed-stok-pakai"]'); await wait(900);
    const a8 = await page.evaluate(() => { const t = document.querySelector('tr[data-l="1"]'); const am = document.getElementById('ed-am-0-1'); return { am: am ? am.value : null, ke: t.querySelector('[data-ke]').textContent, kr: t.querySelector('[data-bi]').textContent }; });
    const pcs2 = await page.evaluate(() => { const r = window.MNIBerat.kgPerPcs({ keluarga: 'STU', bentuk: 'STRAIGHT_STU', dim: { w: 100, h: 50, l: 3000 }, tebal: 1.2, material: 'SPHC', lubang: 'standar' }); return r && r.ok ? { e: r.kgPcsEst, r: r.kgPcsReal } : null; });
    const am = +a8.am;
    ok('RK-09 Pakai stok: jumlah diambil terisi dan Kg est = berat/pcs x (qty - stok), Kg real tetap penuh', am > 0 && !!pcs2 && a8.ke === fmt(pcs2.e * (20 - am)) && a8.kr === fmt(pcs2.r * 20), JSON.stringify({ a8, pcs2 }));

    // RK-10 menambah baris otomatis saat baris terakhir diisi, dan simpan membawa wEst dan w tanpa properti tampilan
    await dim(2, 200, 50, 3000, 5);
    const n10 = await page.evaluate(() => document.querySelectorAll('#ed-secs tbody tr').length);
    ok('RK-10 baris terakhir diisi: baris kosong berikutnya tersedia otomatis', n10 >= 4, String(n10));
    await page.fill('#ed-cust', 'PT Uji Ringkas'); await page.fill('#ed-po', 'PO-RK-1'); await wait(300);
    await page.evaluate(() => { const b = [...document.querySelectorAll('#editor button')].find((x) => /Simpan draft/.test(x.textContent)); if (b) b.click(); });
    await wait(2200);
    const sv = await page.evaluate(() => { const s = S.spk.filter((x) => x.customer === 'PT Uji Ringkas').pop(); return s ? { n: s.items.length, w: s.items[0].w, wEst: s.items[0].wEst, det: s.items.some((i) => 'det' in i), ket: s.items[0].ket } : null; });
    ok('RK-11 simpan draft: item membawa w (real) dan wEst (plate), catatan merah tersimpan, tanpa properti tampilan', !!sv && sv.w > 0 && sv.wEst > sv.w && !sv.det && sv.ket === 'URGENT', JSON.stringify(sv));

    langkah = 'RK-12';
    // RK-12 deskripsi teks yang diketik pada baris Teks bebas dikenali jadi baris terstruktur, berat langsung dihitung
    await page.evaluate(() => { closeEditor(); closeSheet(); closeDrawer(); }); await wait(500);
    await bukaBaru();
    await page.selectOption('#ed-sb-0-0', ''); await wait(500);
    await page.fill('#ed-d-0-0', 'Cable Tray W200xH50xL3000'); await page.press('#ed-d-0-0', 'Tab'); await wait(900);
    await page.fill('#ed-q-0-0', '10'); await wait(600);
    const k12 = await page.evaluate(() => { const L = ED.sections[0].lines[0]; const t = document.querySelector('tr[data-l="0"]'); return { sb: L.sb, dim: L.dim, ke: t.querySelector('[data-ke]').textContent, nama: (document.getElementById('ed-nm-0-0') || {}).textContent }; });
    ok('RK-12 ketik "Cable Tray W200xH50xL3000" di Teks bebas: dikenali sebagai Straight W200 H50 L3000 dan Kg est langsung muncul', /STRAIGHT/.test(k12.sb || '') && k12.dim && k12.dim.w === 200 && k12.dim.h === 50 && k12.dim.l === 3000 && /\d/.test(k12.ke) && /W200xH50xL3000/.test(k12.nama || ''), JSON.stringify(k12));

    langkah = 'RK-13';
    // RK-13 Tempel daftar dari Excel (dipisah tab): yang dikenali jadi terstruktur, yang tidak jadi Teks bebas
    await page.click('[data-act="ed-tempel"][data-s="0"]'); await page.waitForSelector('#ed-tempel-teks'); await wait(300);
    await page.fill('#ed-tempel-teks', '1\tCable Tray W100xH50xL3000 mm\t10\tBtg\n2\tBarang Aneh Sekali\t5\tPcs\n3\tCable Tray W300xH100xL3000 mm\t20\tBtg');
    await page.evaluate(() => { const b = document.querySelector('#mform button[type="submit"], #modal button.primary'); if (b) b.click(); }); await wait(1200);
    const t13 = await page.evaluate(() => ED.sections[0].lines.filter((l) => String(l.d || '').trim()).map((l) => ({ sb: !!l.sb, d: l.d, q: l.q, u: l.u })));
    const terstruktur = t13.filter((x) => x.sb).length;
    ok('RK-13 Tempel daftar: 3 baris masuk (dua dikenali terstruktur, satu Teks bebas) dengan qty dan satuan dari kolom', t13.length >= 4 && terstruktur >= 3 && t13.some((x) => !x.sb && x.d === 'Barang Aneh Sekali' && x.q === 5 && x.u === 'Pcs') && t13.some((x) => x.sb && /W100xH50xL3000/.test(x.d) && x.q === 10), JSON.stringify(t13));
  } catch (e) {
    R.push('FAIL CRASH @' + langkah + ' · ' + String(e.message).slice(0, 300));
  }
  ok('RK-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
