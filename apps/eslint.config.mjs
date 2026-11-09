// Pemeriksaan kebenaran (bukan gaya): galat nyata seperti variabel tak terdefinisi, kunci ganda, kode tak terjangkau.
// Jalankan dari apps/platform: npm run lint. Kode mati (variabel tak terpakai) hanya peringatan sampai dibersihkan.
const browser = ['window', 'document', 'localStorage', 'sessionStorage', 'navigator', 'location', 'history', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'fetch', 'Blob', 'URL', 'URLSearchParams', 'FormData', 'Event', 'KeyboardEvent', 'CustomEvent', 'Uint8Array', 'Image', 'FileReader', 'confirm', 'alert', 'prompt', 'requestAnimationFrame', 'cancelAnimationFrame', 'getComputedStyle', 'matchMedia', 'MutationObserver', 'IntersectionObserver', 'ResizeObserver', 'AbortController', 'TextDecoder', 'TextEncoder', 'btoa', 'atob', 'CSS', 'DOMParser', 'XMLSerializer', 'crypto', 'performance', 'structuredClone', 'Node', 'HTMLElement', 'Notification', 'queueMicrotask', 'Response', 'Request', 'Headers', 'CompressionStream', 'DecompressionStream', 'innerWidth', 'innerHeight', 'screen', 'print', 'Intl', 'DataTransfer', 'File', 'NodeFilter'];
const node = ['process', 'Buffer', 'console', 'setTimeout', 'clearTimeout', 'setInterval', 'URL', 'URLSearchParams', 'fetch', 'TextDecoder', 'TextEncoder', 'structuredClone', 'AbortController', 'performance', 'queueMicrotask', 'Blob', '__dirname', '__filename', 'require', 'module'];
// identifier aplikasi yang dievaluasi di dalam halaman oleh uji UI (page.evaluate) dan axe-core
const halaman = ['sjGrup','KOP','mesinSemua','spPrOpen','mvDoc','saveSetting','mesinInfoAll','matRmSiap','matKeluarKg','matSpkItems','mvForm','voidForm','bmSrc','modOf','loadExcelJS','sjvPreview','sjPreview','docTh','mvModel','prModel','ksModel','printDocHtml','DOCT', 'sisaLine', 'fgTersedia', 'fgResMap', 'bmFotoCetak', 'bmCekStat', 'bmFor', 'FOTO', 'sjXlsx', 'sjPdf', 'docXlsx', 'docPdf', 'docModel', 'calc', 'KAT', 'SET', 'satList', 'fgGot', 'fgPending', 'num0', 'n', 'addDays', 'addWorkdays', 'days', 'flow', 'S', 'byId', 'axe', 'itemRute', 'F', 'PXL', 'openSheet', 'ED', 'addDoc', 'mesinCtx', 'mesinHasil', 'fd', 'today', 'logProduksi', 'updDoc', 'itemState', 'ruteStd', 'spkSelect', 'wcAktifItems', 'HB', 'OPSI', 'snapItems', 'spkStokBuat', 'publishDraft', 'fgBarisTerima', 'fgAlasanKosong', 'renderBody'];
const g = (names) => Object.fromEntries(names.map((n) => [n, 'readonly']));
const rules = {
  'no-undef': 'error', 'no-redeclare': 'error', 'no-dupe-keys': 'error', 'no-dupe-else-if': 'error', 'no-dupe-args': 'error',
  'no-const-assign': 'error', 'no-func-assign': 'error', 'no-import-assign': 'error', 'no-unsafe-negation': 'error', 'use-isnan': 'error',
  'valid-typeof': 'error', 'getter-return': 'error', 'no-shadow-restricted-names': 'error', 'no-unreachable': 'error', 'no-self-assign': 'error',
  'no-sparse-arrays': 'error', 'no-loss-of-precision': 'error', 'no-fallthrough': 'warn', 'no-cond-assign': 'warn', 'no-unused-labels': 'warn',
  'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
};
export default [
  { ignores: ['**/dist/**', '**/public/**', '**/node_modules/**', 'gudang-logistik/reference/**'] },
  { files: ['gudang-logistik/assets/js/**/*.js'], languageOptions: { ecmaVersion: 2023, sourceType: 'script', globals: g(browser) }, rules },
  { files: ['platform/src/**/*.js'], languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: g(browser) }, rules },
  { files: ['platform/scripts/**/*.js'], languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: g(node) }, rules },
  { files: ['platform/tests/**/*.mjs', 'platform/scripts/**/*.mjs'], languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...g(node), ...g(browser), ...g(halaman) } }, rules },
];
