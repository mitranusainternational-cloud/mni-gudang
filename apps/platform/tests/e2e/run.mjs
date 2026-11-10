// Runner mandiri regresi mock: node tests/e2e/run.mjs [url]
// Menjalankan regresi penuh (regression.mjs) lalu uji penegakan role (roles.mjs) dan hak per modul (access.mjs) di Chromium headless.
// Butuh dev server mock (VITE_LOCAL_MOCK=1) dan `npx playwright install chromium`.
// Opsi: ONLY=tampilan,produksi node tests/e2e/run.mjs   -> hanya rangkaian yang disebut.
// Rangkaian Penawaran menyalakan modul lewat kunci uji localStorage (hanya mock); production tetap menyembunyikannya.

import { chromium } from 'playwright';
import { runRegression } from './regression.mjs';
import { runRoles } from './roles.mjs';
import { runAccess } from './access.mjs';
import { runSweep } from './sweep.mjs';
import { runProduksi } from './produksi.mjs';
import { runPenawaran } from './penawaran.mjs';
import { runSparepart } from './sparepart.mjs';
import { runFitur } from './fitur.mjs';
import { runKeamanan } from './keamanan.mjs';
import { runAksesibilitas } from './aksesibilitas.mjs';
import { runMenyeluruh } from './menyeluruh.mjs';
import { runEditor } from './editor.mjs';
import { runAlurLengkap } from './alur-lengkap.mjs';
import { runSpkTerstruktur } from './spk-terstruktur.mjs';
import { runKeseimbangan } from './keseimbangan.mjs';
import { runAuditFlow } from './audit-flow.mjs';
import { runStokFlow } from './stok-flow.mjs';
import { runBongkarMuat } from './bongkar-muat.mjs';
import { runAmbilStok } from './ambil-stok.mjs';
import { runGabungan } from './gabungan.mjs';
import { runSpkAturan } from './spk-aturan.mjs';
import { runKop } from './kop-dokumen.mjs';
import { runMesinSparepart } from './mesin-sparepart.mjs';
import { runKebutuhanPlat } from './kebutuhan-plat.mjs';
import { runLogistikSj } from './logistik-sj.mjs';
import { runSpkDimensi } from './spk-dimensi.mjs';
import { runMatriksRute } from './matriks-rute.mjs';
import { runProduksiHuluHilir } from './produksi-hulu-hilir.mjs';
import { runSerahPlate } from './serah-plate.mjs';
import { runSpkRingkas } from './spk-ringkas.mjs';
import { runGbjSiapKirim } from './gbj-siap-kirim.mjs';
import { runMasterData } from './master-data.mjs';
import { runAturanProses } from './aturan-proses.mjs';

const base = process.argv[2] || 'http://127.0.0.1:5173/';
const only = (process.env.ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);

const penjualanOff = false;

const browser = await chromium.launch();
let totalFail = 0;
for (const [name, run] of [['regresi', runRegression], ['role', runRoles], ['akses', runAccess], ['produksi', runProduksi], ['penawaran', runPenawaran], ['sparepart', runSparepart], ['fitur', runFitur], ['keamanan', runKeamanan], ['aksesibilitas', runAksesibilitas], ['menyeluruh', runMenyeluruh], ['editor', runEditor], ['alurlengkap', runAlurLengkap], ['spkstruktur', runSpkTerstruktur], ['keseimbangan', runKeseimbangan], ['auditflow', runAuditFlow], ['stokflow', runStokFlow], ['bongkarmuat', runBongkarMuat], ['ambilstok', runAmbilStok], ['gabungan', runGabungan], ['kopdokumen', runKop], ['spkaturan', runSpkAturan], ['mesinsparepart', runMesinSparepart], ['kebutuhanplat', runKebutuhanPlat], ['logistiksj', runLogistikSj], ['spkdimensi', runSpkDimensi], ['matriksrute', runMatriksRute], ['serahplate', runSerahPlate], ['masterdata', runMasterData], ['aturanproses', runAturanProses], ['gbjsiapkirim', runGbjSiapKirim], ['spkringkas', runSpkRingkas], ['produksihh', runProduksiHuluHilir], ['tampilan', runSweep]]) {
  if (only.length && !only.includes(name)) continue;
  if (name === 'penawaran' && penjualanOff) {
    console.log(`== ${name} ==\nDILEWATI: modul Penjualan disembunyikan (MODUL_PENJUALAN=false)\n`);
    continue;
  }
  const page = await browser.newPage({ acceptDownloads: true });
  if (name === 'spkdimensi' || name === 'spkringkas') await page.addInitScript(() => { window.__SPK_DIM_NEW = true; }); // layout per dimensi hanya di suite yang mengujinya; bawaan aplikasi = layout sebelumnya
  try {
    const { pass, fail, detail } = await run(page, base);
    console.log(`== ${name} ==\n${detail.join('\n')}\n${pass} PASS, ${fail} FAIL\n`);
    totalFail += fail;
  } catch (e) {
    console.log(`== ${name} ==\nFAIL rangkaian berhenti karena galat: ${String(e && e.message || e).split('\n').slice(0, 3).join(' | ')}\n0 PASS, 1 FAIL\n`);
    totalFail += 1;
  }
  await page.close();
}
await browser.close();
process.exit(totalFail ? 1 : 0);
