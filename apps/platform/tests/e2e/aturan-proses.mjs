// Uji tab Master Data Aturan proses (F-08, mock): bawaan tampil sebagai data, validasi Work Centre, aturan khusus kustom memengaruhi rute,
// finishing ke vendor kustom, pemeriksaan finishing di Opsi SPK, dan Pulihkan bawaan.
import fs from 'node:fs';

const kat = JSON.parse(fs.readFileSync(new URL('./fixtures/katalog-berat-uji.json', import.meta.url), 'utf8'));

export async function runAturanProses(page, base) {
  const R = [];
  const ok = (id, pass, info = '') => R.push((pass ? 'PASS ' : 'FAIL ') + id + (info ? ' · ' + info : ''));
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 160)));
  page.on('dialog', (d) => d.accept());
  page.setDefaultTimeout(15000);
  try {
    const wait = (ms = 350) => page.waitForTimeout(ms);
    const go = async (h) => { await page.evaluate((h) => { location.hash = h; }, h); await wait(800); };
    const tab = async (v) => { await go('#master-data'); await page.click('[data-view="master-data"][data-key="tab"][data-val="' + v + '"]'); await wait(700); };
    const toast = () => page.evaluate(() => (document.getElementById('toast') || {}).textContent || '');
    const ap = () => page.evaluate(() => (byId('master', 'setting') || {}).aturanProses || null);
    const simpan = async () => { await page.click('[data-act="apsimpan"]'); await wait(1100); };
    const baris = (s) => page.evaluate((s) => document.querySelectorAll('input[data-ap="' + s + '"][data-f="kata"]').length, s);

    await page.goto(base); await page.evaluate(() => localStorage.clear());
    await page.goto(base); await page.reload();
    await page.fill('#auth-email', 'admin@mni.local'); await page.click('#auth-btn');
    await page.waitForSelector('#auth-otp', { state: 'visible' }); await page.fill('#auth-otp', '123456');
    await page.waitForFunction(() => document.querySelectorAll('#nav a').length > 1 && !/Tamu/.test(document.getElementById('who').innerText), null, { timeout: 30000 });
    await wait(900);
    await page.evaluate(async () => { for (const [i, nm] of ['Shearing', 'Punching', 'CNC Laser'].entries()) await addDoc('mwc', { kode: 'WC-AP' + i, nama: nm, tipe: 'Internal', urutan: 30 + i, aktif: true, ket: '', mesin: [] }); });
    await wait(1200);
    await page.reload(); await wait(3500);
    await page.evaluate((c) => { window.MNIBerat.setKatalog(c); }, kat);

    // AP-01 bawaan tampil sebagai data yang bisa diubah
    await tab('proses');
    const t1 = await page.evaluate(() => ({ teks: (document.querySelector('#body') || document.body).innerText.replace(/\s+/g, ' '), kata: [...document.querySelectorAll('input[data-ap="khusus"][data-f="kata"]')].map((i) => i.value), fin: [...document.querySelectorAll('input[data-ap="finishing"][data-f="kode"]')].map((i) => i.value) }));
    ok('AP-01 tab Aturan proses: tiga bagian dan pemeriksaan Opsi SPK; bawaan tampil (clamp/hanger, jointing/splice, cover; kode ELG, HDG, PDC)', /Pemetaan finishing ke vendor/.test(t1.teks) && /Material tanpa vendor finishing/.test(t1.teks) && /Aturan khusus komponen/.test(t1.teks) && /Hasil untuk Finishing di Opsi SPK/.test(t1.teks) && t1.kata.includes('clamp, hanger') && t1.kata.includes('cover') && ['ELG', 'HDG', 'PDC'].every((k) => t1.fin.includes(k)), JSON.stringify({ kata: t1.kata, fin: t1.fin }));

    // AP-02 aturan khusus dengan Work Centre yang tidak ada ditolak
    await page.click('[data-act="apadd"][data-s="khusus"]'); await wait(500);
    const n2 = (await baris('khusus')) - 1;
    await page.fill('input[data-ap="khusus"][data-i="' + n2 + '"][data-f="kata"]', 'elbow');
    await page.fill('input[data-ap="khusus"][data-i="' + n2 + '"][data-f="rute"]', 'Mesin Tidak Ada, Bending');
    await simpan();
    ok('AP-02 rute dengan Work Centre yang tidak ada ditolak (pesan menyebut namanya) dan tidak tersimpan', /Work Centre tidak ada di Master Data: Mesin Tidak Ada/.test(await toast()) && (await ap()) === null, await toast());

    // AP-03 aturan khusus valid: Elbow = CNC Laser, Bending; matriks rute menampilkan sumber Aturan khusus
    await page.fill('input[data-ap="khusus"][data-i="' + n2 + '"][data-f="rute"]', 'CNC Laser, Bending');
    await simpan();
    const a3 = await ap();
    const r3 = await page.evaluate(() => { const P = window.MNIProduksi; const h = P.tentukanRute({ judulSection: 'ACCS TRAY TYPE STU 1.2 NON FINISHING', deskripsi: 'Cable Tray Elbow 90 W100xH50xR300' }, P.RUTE_STANDAR, P.aturanKhususAktif(), {}); return { rute: h.rute, sumber: h.sumber, n: P.aturanKhususAktif().length }; });
    await tab('rute');
    const m3 = await page.evaluate(() => { const tr = document.querySelector('#rute-tabel tr[data-rk="ACCS TRAY|ELBOW"]'); return tr ? { sumber: (tr.querySelector('.chip') || {}).textContent, rute: (tr.querySelector('td.muted') || {}).textContent } : null; });
    ok('AP-03 aturan khusus Elbow tersimpan: rute CNC Laser → Bending (sumber aturan); matriks rute menampilkan Aturan khusus', !!a3 && a3.khusus.length === 4 && JSON.stringify(r3.rute) === JSON.stringify(['CNC Laser', 'Bending']) && r3.sumber === 'aturan' && !!m3 && m3.sumber === 'Aturan khusus' && /CNC Laser → Bending/.test(m3.rute), JSON.stringify({ r3, m3 }));

    // AP-04 finishing baru: GALVALUME = GLM
    await tab('proses');
    await page.click('[data-act="apadd"][data-s="finishing"]'); await wait(500);
    const nf = (await baris('finishing')) - 1;
    await page.fill('input[data-ap="finishing"][data-i="' + nf + '"][data-f="kata"]', 'GALVALUME');
    await page.fill('input[data-ap="finishing"][data-i="' + nf + '"][data-f="kode"]', 'glm');
    await simpan();
    const f4 = await page.evaluate(() => { const P = window.MNIProduksi; return { glm: P.finishingDari('CABLE TRAY 1.2 GALVALUME'), elg: P.finishingDari('CABLE TRAY ELECTRO GALVANIZED'), ven: P.vendorUntuk('CABLE TRAY 1.2 GALVALUME') }; });
    ok('AP-04 finishing GALVALUME = GLM tersimpan (huruf besar); ELECTRO tetap ELG; vendor terbentuk dari kode baru', f4.glm === 'GLM' && f4.elg === 'ELG' && f4.ven === 'GLM', JSON.stringify(f4));

    // AP-05 pemeriksaan Opsi SPK: hapus pemetaan ELECTRO, finishing ELECTRO GALVANIZED jadi "Belum dikenali"
    await tab('proses');
    const iElg = await page.evaluate(() => [...document.querySelectorAll('input[data-ap="finishing"][data-f="kata"]')].findIndex((i) => /ELECTRO/.test(i.value)));
    await page.click('[data-act="apdel"][data-s="finishing"][data-i="' + iElg + '"]'); await wait(500);
    await simpan();
    const t5 = await page.evaluate(() => [...document.querySelectorAll('table.lines')].map((t) => t.innerText.replace(/\s+/g, ' ')).find((x) => /Finishing \(Opsi SPK\)/i.test(x)) || '');
    ok('AP-05 pemetaan ELECTRO dihapus: pemeriksaan menandai ELECTRO GALVANIZED "Belum dikenali"; POWDER COATING WHITE tetap Vendor PDC; STAINLESS tanpa vendor', /ELECTRO GALVANIZED Belum dikenali/.test(t5) && /POWDER COATING WHITE Vendor PDC/.test(t5) && /STAINLESS STEEL 304 Tanpa vendor/.test(t5), t5.slice(0, 260));

    // AP-06 Pulihkan bawaan
    await tab('proses');
    await page.click('[data-act="apreset"]'); await wait(1100);
    const r6 = await page.evaluate(() => { const P = window.MNIProduksi; return { ap: (byId('master', 'setting') || {}).aturanProses || null, elg: P.finishingDari('X ELECTRO'), glm: P.finishingDari('X GALVALUME'), n: P.aturanKhususAktif().length }; });
    ok('AP-06 Pulihkan bawaan: konfigurasi dihapus, ELECTRO = ELG lagi, GALVALUME tidak dikenali, tiga aturan khusus bawaan', r6.ap === null && r6.elg === 'ELG' && r6.glm === '' && r6.n === 3, JSON.stringify(r6));
  } catch (e) {
    R.push('FAIL CRASH · ' + String(e.message).slice(0, 300));
  }
  ok('AP-99 tanpa pageerror', errs.length === 0, errs.slice(0, 2).join(' | '));
  const fail = R.filter((x) => x.startsWith('FAIL')).length;
  return { pass: R.length - fail, fail, detail: R };
}
