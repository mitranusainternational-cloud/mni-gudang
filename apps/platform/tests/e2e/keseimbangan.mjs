// Uji keseimbangan: update produksi di drawer SPK (monitoring) harus sejalan dengan hasil yang dicatat di Produksi Hari Ini (mesin).
// Hasil mesin dicatat lewat fungsi yang sama dengan tombol Selesai; yang diperiksa adalah apa yang tampil di SPK.
export async function runKeseimbangan(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  const wait = (ms = 400) => page.waitForTimeout(ms);
  const go = async (h) => { await page.evaluate(() => { document.querySelector('#modal [data-act="closemodal"]')?.click(); }); await page.evaluate((h) => { location.hash = h; }, h); await wait(800); };
  const act = (name, data = {}) => page.evaluate(([n, d]) => { const b = document.createElement('button'); b.dataset.act = n; Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); document.body.appendChild(b); b.click(); b.remove(); }, [name, data]);

  await page.goto(base); await page.evaluate(() => localStorage.clear());
  await page.goto(base); await page.reload();
  await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
  await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
  await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
  await wait(900);
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('mni-local-mock-db')); const now = new Date().toISOString();
    s.tables.mwc = [['WC-1', 'Shearing', 1, 100], ['WC-2', 'Punching', 2, 50], ['WC-3', 'Bending', 3, 40]].map(([kode, nama, urutan, kap]) => ({ id: crypto.randomUUID(), kode, nama, tipe: 'Internal', urutan, aktif: true, created_at: now, updated_at: now, created_by: 'seed', updated_by: 'seed', kapasitas: kap, data: { mesin: [] } }));
    ['spk', 'produksi_log', 'vendor', 'kirim', 'bongkar', 'mutasi'].forEach((t) => { s.tables[t] = []; });
    localStorage.setItem('mni-local-mock-db', JSON.stringify(s));
  });
  await page.reload(); await wait(3500);

  // dua item dalam satu SPK (tanpa vendor)
  await go('#spk');
  await page.click('#tools [data-act="newspk"]'); await wait(700);
  const due = new Date(Date.now() + 9 * 864e5).toISOString().slice(0, 10);
  await page.fill('#ed-cust', 'PT Seimbang Uji'); await page.fill('#ed-po', 'PO-SEIMBANG'); await page.fill('#ed-due', due);
  await page.fill('#ed-h-0', 'CABLE TRAY TYPE STU 1.2 NON FINISHING'); await page.dispatchEvent('#ed-h-0', 'change'); await wait(300);
  await page.fill('#ed-d-0-0', 'Cable Tray W100xH50xL3000'); await page.fill('#ed-q-0-0', '100'); await page.fill('#ed-u-0-0', 'Btg'); await page.fill('#ed-w-0-0', '5');
  await page.fill('#ed-d-0-1', 'Cable Tray W200xH50xL3000'); await page.fill('#ed-q-0-1', '20'); await page.fill('#ed-u-0-1', 'Btg'); await page.fill('#ed-w-0-1', '8');
  await page.click('#editor button:has-text("Terbitkan SPK")'); await wait(1800);
  await page.evaluate(() => document.querySelector('[data-act="sheet-close"]')?.click()); await wait(300);
  const sid = await page.evaluate(() => (S.spk.find((s) => s.customer === 'PT Seimbang Uji') || {})._id);
  ok('K-00 SPK dua item terbit', !!sid);

  const catat = (idx, wc, qty, reject = 0) => page.evaluate(async ([sid, idx, wc, qty, reject]) => {
    const c = mesinCtx(sid + '|' + idx); await mesinHasil(c, { wc, mesin: wc }, { qty, reject, mulai: null, selesai: new Date().toISOString(), operator: 'Operator Uji' });
  }, [sid, idx, wc, qty, reject]);
  const bukaUpdate = async () => { await go('#spk'); await act('prod', { id: sid }); await wait(900); };
  const teksModal = () => page.evaluate(() => (document.getElementById('modal') || document.body).innerText.replace(/\s+/g, ' '));

  // ---------- sebelum ada catatan ----------
  await bukaUpdate();
  const t0 = await teksModal();
  ok('K-01 sebelum ada catatan: terakhir update kosong dan 0/2 item selesai', /Terakhir update\s*–/.test(t0) && /0\/2 item selesai/.test(t0), t0.slice(0, 200));
  await page.evaluate(() => document.querySelector('#modal [data-act="closemodal"]')?.click());

  // ---------- hasil di mesin (bukan langkah terakhir) ----------
  await catat(0, 'Shearing', 60); await catat(0, 'Punching', 30);
  await bukaUpdate();
  const t1 = await teksModal();
  const hari = await page.evaluate(() => { const e = document.createElement('span'); e.innerHTML = fd(today()); return e.textContent.replace(/\s+/g, ' '); });
  ok('K-02 drawer menampilkan tanggal dan operator update terakhir dari hasil mesin (bukan "–")', t1.replace(/\s+/g, ' ').includes(hari) && /Operator Uji/.test(t1) && !/Terakhir update\s*–/.test(t1), t1.slice(0, 260));
  ok('K-03 drawer memberi tombol Catat untuk setiap langkah yang punya antrian (Shearing 40, Punching 30, Bending 30 siap)', /Catat hasil di Shearing \(40 siap\)/.test(t1) && /Catat hasil di Punching \(30 siap\)/.test(t1) && /Catat hasil di Bending \(30 siap\)/.test(t1), t1.slice(0, 500));
  await page.evaluate(() => [...document.querySelectorAll('#modal [data-act="prodcatat"]')].find((b) => /Bending/.test(b.textContent)).click()); await wait(700);
  const wcDipilih = await page.evaluate(() => F.mesin.wc);
  ok('K-04 tombol Catat di Bending membuka form catat di mesin Bending (bukan langkah pertama)', wcDipilih === 'Bending' && /Bending/.test(await teksModal()), wcDipilih);
  await page.evaluate(() => document.querySelector('#modal [data-act="closemodal"]')?.click()); await wait(300);

  // ---------- monitoring SPK (tab Berjalan) ----------
  await go('#spk'); await page.click('[data-view="spk"][data-key="tab"][data-val="berjalan"]'); await wait(900);
  const berjalan = await page.evaluate(() => [...document.querySelectorAll('.sb-card')].find((x) => x.textContent.includes('PT Seimbang Uji'))?.innerText.replace(/\s+/g, ' ') || '');
  ok('K-05 monitoring Berjalan sejalan dengan hasil mesin: Shearing 60/100, Punching 30/100, Bending 0/100, SPK 0% (belum ada yang selesai di langkah terakhir)', /60%/.test(berjalan) && /30%/.test(berjalan) && /Di Shearing/.test(berjalan), berjalan.slice(0, 400));

  // ---------- selesaikan item 1 penuh, item 2 belum ----------
  await catat(0, 'Shearing', 40); await catat(0, 'Punching', 70); await catat(0, 'Bending', 100);
  await bukaUpdate();
  const t2 = await teksModal();
  ok('K-06 item yang selesai lewat mesin dihitung selesai: 1/2 item selesai dan 100/100', /1\/2 item selesai/.test(t2) && /100 \/ 100/.test(t2), t2.slice(0, 300));
  await page.evaluate(() => document.querySelector('#modal [data-act="closemodal"]')?.click());

  // ---------- riwayat gabungan, ekspor, dan angka sepihak ----------
  const sum = await page.evaluate((sid) => {
    const s = byId('spk', sid); const lg = logProduksi(s); const x = calc().spk[sid];
    return { n: lg.length, mesin: lg.filter((l) => l.sumber === 'mesin').length, evs: (S.produksi_log || []).filter((e) => e.spk_id === sid && (e.jenis || 'hasil') === 'hasil').length, prog: lg.reduce((a, l) => a + l.items.reduce((b, i) => b + i.q, 0), 0), prod: x.prod, tglSelesai: flow(sid).prodDate || null };
  }, sid);
  ok('K-07 riwayat produksi SPK memuat semua hasil mesin; kontribusi progres = produksi SPK (hanya langkah terakhir)', sum.n === sum.mesin && sum.mesin === sum.evs && sum.prog === sum.prod && sum.prod === 100, JSON.stringify(sum));
  const csv = await page.evaluate((sid) => { const s = byId('spk', sid); return logProduksi(s).flatMap((l) => l.items.map((i) => i.qw != null ? i.qw : i.q)).reduce((a, b) => a + b, 0); }, sid);
  ok('K-08 ekspor riwayat memuat jumlah yang dicatat di semua langkah (100+100+100 = 300)', csv === 300, String(csv));

  // ---------- total manual lama tidak hilang, reject menggeser langkah sebelumnya ----------
  await page.evaluate(async (sid) => { const s = byId('spk', sid); await updDoc('spk', sid, { items: s.items.map((i, k) => (k === 1 ? { ...i, prod: 5 } : i)) }); }, sid);
  await wait(600);
  await catat(1, 'Shearing', 10); await catat(1, 'Punching', 6, 2);
  const kond = await page.evaluate((sid) => { const s = byId('spk', sid); const st = itemState(s, s.items[1], 1); return { antri: PXL().antrianPerLangkah(st.rute, st.kum, st.qty).map((a) => a.wc + ':' + a.antri).join(','), eff: calc().spk[sid].lines[1].prodEff }; }, sid);
  await bukaUpdate();
  const t3 = await teksModal();
  ok('K-09 total manual 5 tetap dihitung bersama hasil mesin; reject di Punching mengembalikan 2 ke Shearing (antrian Shearing 7, Punching 2, Bending 6, progres 5)', kond.antri === 'Shearing:7,Punching:2,Bending:6' && kond.eff === 5 && /Catat hasil di Shearing \(7 siap\)/.test(t3) && /Catat hasil di Punching \(2 siap\)/.test(t3) && /Catat hasil di Bending \(6 siap\)/.test(t3), JSON.stringify(kond) + ' | ' + t3.slice(t3.indexOf('Cable Tray W200'), t3.indexOf('Cable Tray W200') + 260));

  ok('K-10 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
