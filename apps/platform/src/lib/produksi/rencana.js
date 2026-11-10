/* Rencana jadwal otomatis: kapan tiap langkah tiap item diperkirakan dikerjakan.
 * Penjadwalan kapasitas terbatas: item diurut menurut due date (yang paling mendesak dulu), tiap langkah mengisi kapasitas
 * work center per hari kerja, langkah berikutnya mulai hari kerja berikutnya, langkah vendor memakai lama proses vendor.
 * Fungsi murni: tidak membaca atau menulis data apa pun. Hasilnya hanya usulan untuk dipantau, bukan perintah kerja. */
import { geserHari, selisihHari, hariKerjaAkhirPekan } from './jadwal.js';

const mulaiKerja = (d, libur) => { let x = d; for (let i = 0; i < 14 && libur(x); i++) x = geserHari(x, 1); return x; };
const majuKerja = (d, libur, n = 1) => { let x = d, s = 0, g = 0; while (s < n && g++ < 400) { x = geserHari(x, 1); if (!libur(x)) s++; } return x; };

/* item: [{key, spkId, no, customer, due, idx, d, u, q, kir, steps:[{w, vend, val, out}]}]
 * kapasitas: {namaWC: pcs per hari kerja}; kosong atau 0 berarti belum diatur (dianggap selesai dalam satu hari). */
export function susunRencana({ item = [], kapasitas = {}, hariIni, tatVendor = 3, hariKirim = 1, libur = hariKerjaAkhirPekan, batas = 120 }) {
  const urut = [...item].sort((a, b) => String(a.due || '9999-12-31').localeCompare(String(b.due || '9999-12-31')) || (a.no - b.no) || (a.idx - b.idx));
  const pakai = {}, blok = [], langkah = {}, selesai = {}, tanpaKap = new Set();
  for (const it of urut) {
    const dasar = { key: it.key, spkId: it.spkId, no: it.no, customer: it.customer, d: it.d, idx: it.idx };
    const ls = [];
    let akhir = null;
    if ((+it.kir || 0) >= it.q && it.q > 0) { langkah[it.key] = ls; selesai[it.key] = { produksi: null, kirim: null, selesai: true }; continue; }
    for (const st of it.steps || []) {
      const sisa = Math.max(0, it.q - (st.val || 0));
      if (sisa <= 0) continue;
      const mulai = akhir ? majuKerja(akhir, libur, 1) : mulaiKerja(hariIni, libur);
      if (st.vend) {
        const dari = (st.out || 0) > (st.val || 0) ? mulaiKerja(hariIni, libur) : mulai;
        const sampai = majuKerja(dari, libur, tatVendor);
        blok.push({ ...dasar, wc: 'Vendor', w: st.w, vendor: true, dari, sampai, qty: sisa });
        ls.push({ w: st.w, vend: true, dari, sampai, qty: sisa });
        akhir = sampai;
        continue;
      }
      const cap = +kapasitas[st.w] || 0;
      let rest = sisa, hari = mulai, dari = null, sampai = null, g = 0;
      if (!cap) {
        tanpaKap.add(st.w);
        blok.push({ ...dasar, wc: st.w, w: st.w, tgl: mulai, qty: sisa, tanpaKap: true });
        dari = sampai = mulai;
      } else {
        const u = pakai[st.w] || (pakai[st.w] = {});
        while (rest > 0 && g++ < batas) {
          if (!libur(hari)) {
            const bebas = cap - (u[hari] || 0);
            if (bebas > 0) {
              const ambil = Math.min(rest, bebas);
              u[hari] = (u[hari] || 0) + ambil;
              blok.push({ ...dasar, wc: st.w, w: st.w, tgl: hari, qty: ambil });
              rest -= ambil; dari = dari || hari; sampai = hari;
            }
          }
          hari = geserHari(hari, 1);
        }
      }
      ls.push({ w: st.w, vend: false, dari, sampai, qty: sisa });
      akhir = sampai || akhir;
    }
    langkah[it.key] = ls;
    selesai[it.key] = { produksi: akhir, kirim: akhir ? majuKerja(akhir, libur, hariKirim) : mulaiKerja(hariIni, libur), selesai: false };
  }
  const spk = {};
  for (const it of item) {
    const r = spk[it.spkId] || (spk[it.spkId] = { no: it.no, customer: it.customer, due: it.due || '', perkiraan: null, status: 'aman', selisih: null });
    const s = selesai[it.key];
    if (s && !s.selesai && s.kirim && (!r.perkiraan || s.kirim > r.perkiraan)) r.perkiraan = s.kirim;
  }
  for (const r of Object.values(spk)) {
    if (!r.perkiraan) { r.status = 'selesai'; continue; }
    if (r.due) { r.selisih = selisihHari(r.perkiraan, r.due); r.status = r.selisih < 0 ? 'telat' : r.selisih <= 1 ? 'mepet' : 'aman'; }
  }
  const beban = {};
  for (const [wc, per] of Object.entries(pakai)) for (const [tgl, qty] of Object.entries(per)) (beban[wc] || (beban[wc] = {}))[tgl] = { qty, kap: +kapasitas[wc] || 0 };
  return { blok, langkah, selesai, spk, beban, tanpaKap: [...tanpaKap] };
}
