/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NF=new Intl.NumberFormat('id-ID',{maximumFractionDigits:2});
const n=v=>NF.format(+v||0);
const pad=x=>String(x).padStart(2,'0');
const today=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const nowTime=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const fd=s=>{if(!s)return '–';const p=String(s).slice(0,10).split('-');return p.length<3?esc(s):`${p[2]}&nbsp;${BLN[+p[1]-1]}&nbsp;${p[0].slice(2)}`};
const days=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/864e5);
const pct=(a,b)=>b>0?Math.max(0,Math.min(1,a/b)):0;
const ago=iso=>{if(!iso)return '';const m=(Date.now()-Date.parse(iso))/6e4;if(m<1)return 'baru saja';if(m<60)return Math.round(m)+' mnt lalu';if(m<1440)return Math.round(m/60)+' jam lalu';return fd(iso)};
const I={
 dash:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 9h8V3h-8z"/>',
 rm:'<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/>',
 fg:'<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
 dock:'<path d="M3 21V8l9-5 9 5v13"/><path d="M7 21v-8h10v8M7 17h10"/>',
 vendor:'<path d="M12 3v4M5 7h14l-1 5H6z"/><path d="M8 12v4a4 4 0 008 0v-4"/><path d="M12 20v1"/>',
 truck:'<path d="M1 6h13v10H1zM14 10h4l3 3v3h-7z"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/>',
 spk:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
 inb:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>', outb:'<path d="M12 20V8M7 13l5-5 5 5"/><path d="M4 4h16"/>',
 chk:'<path d="M5 12l5 5 9-10"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
 db:'<ellipse cx="12" cy="5.5" rx="8" ry="2.5"/><path d="M4 5.5v13c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5"/>',
 edit2:'<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
 merge:'<path d="M18 9l-3-3-3 3M18 15l-3 3-3-3"/><path d="M15 6v12M6 9.5A3 3 0 009 12a3 3 0 013 3v.5"/>',
 phone:'<path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 5.18 2 2 0 015.06 3h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 10.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 17.92z"/>',
 mail:'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
 pin:'<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>',
 'alert-triangle':'<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/>',
 'alert-circle':'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
 cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61l1.6-8.39H6"/>',
 tool:'<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>',
 clipboard:'<path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
 layers:'<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
 box:'<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>',
 file:'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
 tag:'<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
 users:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>',
 chart:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/>',
 send:'<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
 prod:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><path d="M7 8l3 3 2-2 3 3 2-2"/>',
 zap:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
};
const ic=(k,s=16)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" style="flex:none;stroke:currentColor;fill:none;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;vertical-align:middle">${I[k]||''}</svg>`;

/* ---------- state ---------- */
const COLS=['rm','fg','mutasi','spk','vendor','kirim','bongkar','master','mvendor','mcustomer','msupplier','marmada','rmhist','pr','opname','muser','ureq','log','uinv','mwc','produksi_log','sp'];
const S={};COLS.forEach(c=>S[c]=[]);
const loaded=new Set();
let DB=null,USER=null,DLS=null,ME=null,CAN=true,LIVE='wait',LAST=null,C=null;
const F={ /* per-view filters, kept for the session */
 'barang-jadi':{q:'',kat:'',type:'',fin:'',tab:'stok'},
 'bongkar-muat':{range:'7',jenis:'',q:'',all:false},
 'vendor':{st:'aktif',vendor:'',q:''},
 'pengiriman':{st:'',q:''},
 'spk':{st:'aktif',q:'',tab:'list',fl:'jalan'},
 'produksi':{wc:'',p:'aktif',tab:'wc',hari:'30',lper:'bulan',lmet:'qty',lby:'produk',lakm:'operator'},
 'laporan':{p:'bln'}
};
const ROLE_ON=false; /* login & peran per user: ditunda, aktifkan nanti */
const VIEWS=[
 {id:'dashboard',t:'Dashboard',ic:'dash',sec:'Pantauan'},
 {id:'laporan',t:'Laporan',ic:'file'},
 {id:'bahan-baku',t:'Gudang Bahan Baku',ic:'rm',sec:'Gudang'},
 {id:'barang-jadi',t:'Gudang Barang Jadi',ic:'fg'},
 {id:'sparepart',t:'Gudang Sparepart',ic:'tool'},
 {id:'bongkar-muat',t:'Bongkar Muat',ic:'dock',sec:'Logistik'},
 {id:'vendor',t:'Kirim ke Vendor',ic:'vendor'},
 {id:'pengiriman',t:'Kirim ke Customer',ic:'truck'},
 {id:'spk',t:'SPK Berjalan',ic:'spk',sec:'Produksi'},
 {id:'mesin',t:'Produksi Hari Ini',ic:'dock'},
 {id:'produksi',t:'Kinerja & Analisa',ic:'chart'},
 {id:'papan',t:'Papan Produksi',ic:'prod',hide:true},
 {id:'laporan-produksi',t:'Laporan Produksi',ic:'file',hide:true},
 {id:'cek-data',t:'Cek Data',ic:'shield',sec:'Data'},
 {id:'master-data',t:'Master Data',ic:'db'},
 {id:'kinerja',t:'Kinerja Tim',ic:'chart',sec:'Tim'},
 {id:'pengguna',t:'Pengguna & Akses',ic:'users'}
];
/* modul yang menjadi dasar hak tiap tampilan; dashboard terbuka untuk semua pengguna terdaftar, tampilan tim khusus admin */
const VIEW_MOD={'papan':'spk','mesin':'spk','laporan-produksi':'spk','bahan-baku':'bahan-baku','barang-jadi':'barang-jadi','bongkar-muat':'bongkar-muat','vendor':'vendor','pengiriman':'pengiriman','spk':'spk','produksi':'spk','sparepart':'sparepart'};
const ADMIN_VIEWS=['cek-data','kinerja','pengguna'];
function viewOk(v){const id=v.id||v;
 if(!ME_P)return !['kinerja','pengguna'].includes(id);
 const adm=myRole()==='admin';
 if(ADMIN_VIEWS.includes(id))return adm;
 if(id==='master-data')return adm||myAnyEdit();
 const m=VIEW_MOD[id];return !m||!!myLevel(m)}
let VIEW='dashboard';
const issues=()=>{const c=calc();return c._iss||(c._iss=dataIssues())};

/* ---------- labels ---------- */
const rmOn=r=>r.aktif!==false; /* item bahan baku nonaktif: tidak muncul di daftar, pilihan form, opname, usulan beli; riwayat tetap utuh */
const rmLabel=r=>r?`${r.item} ${r.ukuran}${r.aktif===false?' · nonaktif':''}`:'(item terhapus)';
const fgLabel=f=>f?`${f.kategori}${f.type?' '+f.type:''} ${f.ukuran} L${f.panjang} · ${f.finishing} ${f.tebal}`:'(item terhapus)';
/* jenis material tambahan buatan pengguna (Pengaturan bahan baku): {nama, kunci (dipisah koma), dens}; menang atas pengenalan bawaan */
const CMATS=()=>{const m=(byId('master','setting')||{}).mats;return Array.isArray(m)?m:[]};
const BASE_GRADES=['SPHC','SPCC','SS304','SS316','Aluminium'];
const OFFG=()=>{const o=(byId('master','setting')||{}).jenisOff;return Array.isArray(o)?o:[]};
const GRADES=()=>[...BASE_GRADES.filter(x=>!OFFG().includes(x)),...CMATS().map(m=>m.nama).filter(x=>x&&!BASE_GRADES.includes(x))];
const grade=r=>{const jx=r&&r.jenis;if(jx&&(CMATS().some(m=>m&&m.nama===jx)||GRADES().includes(jx)))return jx;const s=(r.item||'').toUpperCase();for(const m of CMATS()){if(m&&m.nama&&String(m.kunci||'').split(',').some(k=>k.trim()&&s.includes(k.trim().toUpperCase())))return m.nama}const off=OFFG();if(s.includes('SPHC')&&!off.includes('SPHC'))return 'SPHC';if(s.includes('SPCC')&&!off.includes('SPCC'))return 'SPCC';if(s.includes('304')&&!off.includes('SS304'))return 'SS304';if(s.includes('316')&&!off.includes('SS316'))return 'SS316';if((s.includes('ALU')||s.includes('ALM'))&&!off.includes('Aluminium'))return 'Aluminium';return 'Lainnya'};
/* window.__idAlias (opsional, diisi adapter Supabase) memetakan id buatan app ("spk-1003") ke id database (UUID). */
const byId=(c,id)=>{const k=(window.__idAlias&&window.__idAlias[id])||id;return S[c].find(x=>x._id===k)||(c==='muser'&&typeof id==='string'&&id.includes('@')?S.muser.find(x=>String(x.email||'').toLowerCase()===id.toLowerCase()):undefined)};
const spkName=id=>{const s=byId('spk',id);return s?`SPK ${s.no}`:(id||'–')};

/* ---------- derived numbers (recomputed after each change) ---------- */
function calc(){
 if(C)return C;
 const t=today();
 const stock={rm:{},fg:{},sp:{}};const lastMv={};
 for(const g of['rm','fg','sp'])for(const it of S[g])stock[g][it._id]=+it.stokAwal||0;
 for(const m of S.mutasi){if(stock[m.gudang]&&m.item in stock[m.gudang]){stock[m.gudang][m.item]+= +m.delta||0;const k=m.gudang+m.item;if(!lastMv[k]||(m.at||'')>(lastMv[k].at||''))lastMv[k]=m}}
 const vIdx={},kIdx={};
 for(const v of S.vendor){if(v.status==='Batal')continue;for(const it of v.items||[]){const k=v.spk+'|'+it.d;const o=vIdx[k]||(vIdx[k]={out:0,back:0,rej:0});o.out+= +it.q||0;o.back+= +it.kembali||0;o.rej+= +it.reject||0}}
 for(const k of S.kirim){if(k.status==='Batal')continue;for(const it of k.items||[]){const key=k.spk+'|'+it.d;kIdx[key]=(kIdx[key]||0)+(+it.q||0)}}
 const fgIdx={},mutById={};
 for(const m of S.mutasi)mutById[m._id]=m;
 for(const m of S.mutasi){if(m.gudang!=='fg'||!m.spk)continue;const o=m.jenis==='koreksi'?mutById[m.koreksiDari]:null;if(m.jenis==='masuk'||(o&&o.jenis==='masuk')){const k=m.spk+'|'+m.item;fgIdx[k]=(fgIdx[k]||0)+(+m.delta||0)}}
 const spk={};
 for(const s of S.spk){
  let q=0,prod=0,kir=0,vo=0,vb=0;
  const dupN={},poolD={},seenD={};(s.items||[]).forEach(it0=>{dupN[it0.d]=(dupN[it0.d]||0)+1});
  const lines=(s.items||[]).map((it,ix)=>{let v=vIdx[s._id+'|'+it.d]||{out:0,back:0};let k=s.stokReq?(fgIdx[s._id+'|'+fgDariItem(it)]||0):(kIdx[s._id+'|'+it.d]||0);
   /* deskripsi sama lebih dari sekali: jumlah vendor/kirim dibagi berurutan; baris terakhir menampung sisa (kirim lebih tetap terlihat) */
   if(dupN[it.d]>1){seenD[it.d]=(seenD[it.d]||0)+1;const lastD=seenD[it.d]===dupN[it.d];const P0=poolD[it.d]||(poolD[it.d]={out:v.out,back:v.back,k});const iq0=+it.q||0;const o0=lastD?P0.out:Math.min(P0.out,iq0);const b0=lastD?P0.back:Math.min(P0.back,o0);const k0=lastD?P0.k:Math.min(P0.k,iq0);P0.out-=o0;P0.back-=b0;P0.k-=k0;v={...v,out:o0,back:b0};k=k0}
  const iq=+it.q||0;const am=ambilItem(s,it),qp=iq-am;const evP=prodFromEvents(s,it,ix);const pe=Math.min(iq,(evP!=null?Math.max(Math.min(evP,qp),Math.min(v.out,qp)):Math.max(Math.min(+it.prod||0,qp),Math.min(v.out,qp)))+am);q+=iq;prod+=pe;kir+=Math.min(k,iq);vo+=v.out;vb+=v.back;const stv=PXL()?itemState(s,it,ix):null;const vSiap=produksiAdmin()?pe:(stv&&stv.ev.length?PXL().siapKirimVendor(stv.rute,stv.kum):null);/* Rute dengan langkah vendor: yang boleh dikirim ke customer atau diterima gudang hanyalah yang sudah KEMBALI dari vendor (bukan produksi dikurangi yang di vendor: barang yang belum pernah dikirim ke vendor belum difinishing). */const rv=stv&&stv.ev.length&&PXL().langkahVendor&&stv.rute.some(PXL().langkahVendor);const siapKirim=rv?Math.min(iq,Math.max(0,stv.kum[stv.rute[stv.rute.length-1]]||0)+am):null;return {...it,am,prodEff:pe,vOut:v.out,vBack:v.back,kirim:k,vSiap,siapKirim}});
  const pK=pct(kir,q),pP=pct(prod,q);
  let st='Proses',late=0;
  if(s.status==='Batal')st='Batal';else if((s.status||'Terbit')==='Draft')st='Draft';else if(pK>=1)st='Selesai';else if(s.due&&s.due<t){st='Terlambat';late=days(s.due,t)}
  else if(s.due&&days(t,s.due)<=1)st='Jatuh Tempo';
  spk[s._id]={lines,q,prod,kir,vo,vb,pK,pP,st,late};
 }
 const vend=S.vendor.map(v=>{const out=(v.items||[]).reduce((a,i)=>a+(+i.q||0),0),back=(v.items||[]).reduce((a,i)=>a+(+i.kembali||0),0),rej=(v.items||[]).reduce((a,i)=>a+(+i.reject||0),0);return {v,out,back,rej,sisa:Math.max(0,out-back-rej),age:days(v.tgl,t),st:v.status==='Batal'?'Batal':back+rej>=out&&out>0?'Selesai':back+rej>0?'Kembali Sebagian':'Di Vendor'}});
 C={t,stock,lastMv,spk,vend};return C;
}

/* ---------- db ---------- */
async function boot(){
 renderNav();route();
 const cl=window.claude;
 if(!cl||!cl.use){LIVE='off';renderLive();return}
 try{DB=await cl.use('db')}catch(e){DB=null}
 if(!DB){LIVE='off';renderLive();render();return}
 cl.use('user').then(async u=>{USER=u;if(!u){renderMe();renderAccess();return}
   const me=await u.me();ME=me.id;ME_P=me;IS_OWNER=!!me.isOwner;IS_EDITOR=!!me.canEdit;const cw=await u.can('data.write');
   if(cw===false)CAN=false;
   route()}).catch(()=>{}); /* route(): tautan langsung seperti #pengguna baru valid setelah hak pengguna diketahui */
 cl.use('downloads').then(d=>{DLS=d}).catch(()=>{});
 for(const c of COLS){
  DB.collection(c).onSnapshot(snap=>{
    S[c]=snap.docs.map(d=>({...d.data(),_id:d.id}));loaded.add(c);C=null;EVX=null;LAST=new Date();LIVE='on';if(c==='muser')refreshMe();schedule();
  },err=>{LIVE='off';renderLive();toast('Koneksi data terputus ('+err.code+'). Muat ulang halaman.')});
 }
}
/* T10a: hak akses pengguna yang sedang masuk diperbarui seketika saat data pengguna berubah (peran, hak modul, aktif), tanpa muat ulang. */
let meBusy=false;
async function refreshMe(){if(meBusy||!USER)return;meBusy=true;
 try{const me=await USER.me();const cw=await USER.can('data.write');
  const kunci=p=>JSON.stringify([p&&p.role,p&&p.modul,p&&p.terdaftar,p&&p.canEdit]);const beda=ME_P&&kunci(ME_P)!==kunci(me);
  ME_P=me;IS_OWNER=!!me.isOwner;IS_EDITOR=!!me.canEdit;CAN=cw!==false;
  if(beda){C=null;route();schedule();toast('Hak akses Anda diperbarui')}
 }catch(e){}finally{meBusy=false}}
let rq=0,bodyPending=false;const typingInBody=()=>{const a=document.activeElement;return a&&$('#body').contains(a)&&a.matches('input,select,textarea')};
document.addEventListener('focusout',()=>setTimeout(()=>{if(bodyPending&&!typingInBody()){bodyPending=false;renderBody()}},0));
function schedule(){if(rq)return;rq=requestAnimationFrame(()=>{rq=0;pasangKatalogBerat();renderNav();renderLive();renderMe();renderAccess();if(!$('#tools').contains(document.activeElement))renderTools();if(typingInBody())bodyPending=true;else renderBody();if(DRAWER)DRAWER();if(SHEET)renderSheet()})}
const ready=()=>COLS.every(c=>loaded.has(c));
const need=(c,data,id,op)=>{if(!DB)throw new Error('Fitur simpan belum tersedia di pratinjau lokal karena backend belum terhubung.');if(!CAN)throw new Error('Akses Anda lihat saja.');guard(c,data,id,op||'upd')};
async function addDoc(c,data){need(c,data,null,'add');data.at=new Date().toISOString();data.by=ME||null;const r=await DB.collection(c).add(data);logAct(c,r&&r.id,'add',data);return r}
async function updDoc(c,id,data){need(c,data,id,'upd');data.updAt=new Date().toISOString();data.updBy=ME||null;const r=await DB.doc(c+'/'+id).update(data);logAct(c,id,'upd',data);return r}
async function delDoc(c,id){need(c,null,id,'del');logAct(c,id,'del',{});return DB.doc(c+'/'+id).delete()}

/* ---------- shell ---------- */
function renderNav(){
 const c=ready()?calc():null;
 const cnt={};
 if(c){cnt['bahan-baku']=[S.rm.filter(r=>['Habis','Kritis','Perlu order'].includes(RMI(r._id).st)).length,S.rm.some(r=>['Habis','Kritis'].includes(RMI(r._id).st))];
  cnt['sparepart']=(()=>{const I=Object.values(spCalc()).filter(x=>x.r.aktif!==false);return [I.filter(x=>x.st==='Habis'||x.st==='Stok minimum'||x.st==='Di bawah buffer').length,I.some(x=>x.st==='Habis')]})();
  cnt['vendor']=[c.vend.filter(x=>x.st==='Di Vendor'||x.st==='Kembali Sebagian').length,false];
  {const I=issues();cnt['cek-data']=[I.filter(i=>i.sev>=2).length,I.some(i=>i.sev>=3)]}
  cnt['pengiriman']=[S.kirim.filter(k=>k.status==='Dalam Perjalanan').length,false];
  cnt['bongkar-muat']=[S.bongkar.filter(b=>b.status!=='Selesai').length,false];
  cnt['spk']=[Object.values(c.spk).filter(x=>x.st==='Terlambat').length,true];}
 let h='';
 let secShown='';for(const v of VIEWS){if(!viewOk(v)||v.hide)continue;if(v.sec&&v.sec!==secShown){h+=`<div class="sec">${v.sec}</div>`;secShown=v.sec}const k=cnt[v.id];
  h+=`<a href="#${v.id}" class="${VIEW===v.id?'on':''}" title="${v.t}${k&&k[0]?' · '+k[0]:''}" aria-label="${v.t}">${ic(v.ic)}<span>${v.t}</span>${k&&k[0]?`<span class="cnt ${k[1]?'hot':''}">${k[0]}</span>`:''}</a>`}
 $('#nav').innerHTML=h;
 const on=$('#nav a.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
}
function renderLive(){
 const el=$('#live');el.className='live '+(LIVE==='on'?'on':LIVE==='off'?'off':'');
 const fn=document.querySelector('.foot .muted');if(fn)fn.textContent=LIVE==='on'?'Terhubung ke database. Data tersimpan dan disinkronkan.':'Backend belum terhubung. Data tidak disimpan atau disinkronkan.';
 el.querySelector('span').textContent=LIVE==='on'?`Realtime · tersinkron ${LAST.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`:LIVE==='off'?'Pratinjau lokal · backend belum terhubung':'Menyiapkan pratinjau lokal…';
}
function route(){
 const h=(location.hash||'').slice(1);VIEW=VIEWS.some(v=>v.id===h&&viewOk(v))?h:'dashboard';
 const v=VIEWS.find(x=>x.id===VIEW);$('#ttl').textContent=v.t;
 $('#sub').textContent={dashboard:'Ringkasan realtime gudang, logistik, dan SPK',
  'bahan-baku':'Stok plat & material — penerimaan, pemakaian, stock opname',
  'laporan':'Ringkasan satu halaman: produksi, pengiriman, bahan baku, barang jadi, vendor, sparepart, dan kesehatan data; unduh CSV',
  'sparepart':'Stok sparepart & consumable mesin — penerimaan, pengeluaran, stok minimum, stock opname',
  'barang-jadi':'Stok cable tray, ladder, cover & aksesoris siap kirim',
  'bongkar-muat':'Antrian kendaraan loading & unloading di dock',
  'vendor':'Barang setengah jadi yang dikirim ke vendor finishing (HDG, ELG, powder coating)',
  'pengiriman':'Surat jalan barang jadi ke customer',
  'spk':'Progres produksi, finishing, dan pengiriman per SPK',
  'cek-data':'Temuan data yang belum lengkap, tidak konsisten, atau statusnya tertinggal',
  'master-data':'Daftar resmi vendor, customer, supplier, dan armada yang dipakai semua form',
  'kinerja':'Siapa mencatat apa, seberapa aktif, dan seberapa tepat waktu input data tiap anggota tim',
  get 'mesin'(){return produksiAdmin()?'Laporan produksi diisi satu admin: isi jumlah item yang sudah selesai dan siap dikirim':'Satu-satunya tempat input produksi: pilih mesin, tekan Mulai, isi jumlah, tekan Selesai'},
  'papan':'Posisi semua item per work center: yang sedang berjalan dan yang antri',
  'laporan-produksi':'Laporan harian per mesin, rekap, dan waktu proses nyata (pengganti form Excel)',
  'pengguna':'Akun tim, peran, dan hak akses per modul'}[VIEW];
 renderNav();renderTools();renderBody();window.scrollTo(0,0);
 if(VIEW==='pengguna')loadAudit();
}
window.addEventListener('hashchange',route);

const loading=()=>`<div class="panel"><div class="empty">${LIVE==='off'?'<b>Mode pratinjau lokal</b><span>Backend belum dikonfigurasi. Data Operasional tidak dimuat, disimpan, atau disinkronkan.</span>':'<b>Menyiapkan pratinjau…</b><span>Menunggu koneksi backend yang dikonfigurasi.</span>'}</div></div>`;
function renderBody(){const el=$('#body');if(!ready()){el.innerHTML=loading();return}const g0=document.getElementById('gt-scroll');const sl=g0?{x:g0.scrollLeft,sk:g0.dataset.sk}:null;el.innerHTML=(B[VIEW]||B.dashboard)();const g1=document.getElementById('gt-scroll');if(g1)g1.scrollLeft=sl&&sl.sk===g1.dataset.sk?sl.x:Math.max(0,(+g1.dataset.now)-90);resolveNames()}
function renderTools(){$('#tools').innerHTML=(T[VIEW]||(()=>''))();$('#tools').hidden=!$('#tools').innerHTML;renderAccess();renderMe()}

async function resolveNames(){
 fillAvatars();
 if(!USER)return;const els=[...document.querySelectorAll('span[data-uid]')];const ids=[...new Set(els.map(e=>e.dataset.uid).filter(Boolean))];if(!ids.length)return;
 const ps=await USER.profiles(ids);els.forEach(e=>{const id=e.dataset.uid;if(uname(id))return;const p=ps[id];e.textContent=(p&&p.name)||'Pengguna'});
}
const who=id=>id?uName(id):'Import Excel';

/* ---------- small UI pieces ---------- */
const chip=(t,c='')=>`<span class="chip ${c}">${esc(t)}</span>`;
const prog=(p,cls='')=>`<div class="prog"><div class="bar ${cls}"><i style="width:${(p*100).toFixed(1)}%"></i></div><span>${Math.round(p*100)}%</span></div>`;
const stChip=s=>chip(s,{Batal:'plain',Draf:'warn',Masuk:'ok',Keluar:'info',Opname:'warn',Koreksi:'crit',Draft:'warn',Terbit:'ok',Selesai:'ok',Diterima:'ok',Terlambat:'crit','Jatuh Tempo':'warn',Proses:'info','Di Vendor':'warn','Kembali Sebagian':'info','Dalam Perjalanan':'info',Disiapkan:'plain',Antri:'warn'}[s]||'');
const empty=(t,s,btn)=>`<div class="empty"><b>${t}</b><span>${s}</span>${btn||''}</div>`;
const segBtns=(view,key,opts)=>`<div class="seg">${opts.map(([v,l])=>`<button data-act="filt" data-view="${view}" data-key="${key}" data-val="${v}" class="${F[view][key]===v?'on':''}">${l}</button>`).join('')}</div>`;
function stockState(r,s){if(s<=0)return['Habis','crit'];if(r.buffer>0&&s<r.buffer)return['Di bawah buffer','warn'];return['Aman','ok']}

/* ---------- DASHBOARD ---------- */
const B={},T={};
B.dashboard=()=>{
 const c=calc(),t=c.t;
 // === Base data ===
 const rmLow=S.rm.filter(r=>['Habis','Kritis','Perlu order'].includes(RMI(r._id).st));
 const fgTot=S.fg.reduce((a,f)=>a+Math.max(0,c.stock.fg[f._id]||0),0);const fgZero=S.fg.filter(f=>(c.stock.fg[f._id]||0)<=0).length;
 const sp=Object.values(c.spk);const spAct=sp.filter(x=>x.st!=='Selesai'&&x.st!=='Draft'&&x.st!=='Batal').length;const spLate=sp.filter(x=>x.st==='Terlambat').length;
 const vOpen=c.vend.filter(x=>x.st==='Di Vendor'||x.st==='Kembali Sebagian');const DI=issues();const vQty=vOpen.reduce((a,x)=>a+x.sisa,0);const vOld=vOpen.reduce((a,x)=>Math.max(a,x.age),0);
 /* tonnage di vendor: sum (qty × berat/pcs) semua item pada SJ vendor yg masih aktif */
 const vTonKg=vOpen.reduce((a,x)=>{const vd=byId('vendor',x.v._id);return a+(vd?.items||[]).reduce((b,it)=>b+(+it.q||0)*wRealDok(vd,it),0)},0);
 /* tonnage terkirim ke customer bulan ini */
 const kTonKgMonth=S.kirim.filter(k=>(k.tgl||'').slice(0,7)===t.slice(0,7)&&k.status!=='Batal').reduce((a,k)=>a+(k.items||[]).reduce((b,it)=>b+(+it.q||0)*wRealDok(k,it),0),0);
 const kTrip=S.kirim.filter(k=>k.status==='Dalam Perjalanan').length;const kMonth=S.kirim.filter(k=>(k.tgl||'').slice(0,7)===t.slice(0,7)).length;
 const bToday=S.bongkar.filter(b=>b.tgl===t);const bProc=S.bongkar.filter(b=>b.status==='Proses').length;

 // === Analytics: SPK pipeline (90 hari) ===
 const K90=spkKpi('90');
 const K30=spkKpi('30');
 // Stage counts
 const stageCnt={Draft:0,Produksi:0,'Siap ke vendor':0,'Di vendor':0,'Siap kirim':0,'Kirim sebagian':0,Terkirim:0};
 S.spk.filter(s=>(s.status||'Terbit')!=='Draft'&&s.status!=='Batal'&&!s.stokReq&&s.tgl>=K90.a).forEach(s=>{const f=flow(s._id);if(f)stageCnt[f.stage]=(stageCnt[f.stage]||0)+1});
 // OTD: on-time delivery rate (% SPK terkirim tepat waktu)
 const otdRate=K90.kir.length?K90.otd.length/K90.kir.length:null;
 // Throughput per minggu (jumlah SPK Terkirim per minggu dalam 90 hari)
 const weekBuckets={};K90.kir.forEach(f=>{if(!f.Kfull)return;const d=new Date(f.Kfull);const wk=`${d.getFullYear()}-W${String(Math.ceil((d.getDate()+new Date(d.getFullYear(),d.getMonth(),1).getDay())/7)).padStart(2,'0')}`;weekBuckets[wk]=(weekBuckets[wk]||0)+1});
 // Customer volume (90 hari)
 const custVol={};S.spk.filter(s=>s.tgl>=K90.a&&!s.stokReq&&(s.status||'Terbit')!=='Draft').forEach(s=>{const c2=c.spk[s._id];if(c2&&c2.pK>0)custVol[s.customer]=(custVol[s.customer]||0)+c2.kir});
 const topCust=Object.entries(custVol).sort((a,b)=>b[1]-a[1]).slice(0,6);
 const custMx=Math.max(1,...topCust.map(x=>x[1]));
 // Throughput 30 hari vs 90 hari untuk delta
 const done30=K30.kir.length,done90=K90.kir.length;
 const avgPerMonth30=done30;const avgPerMonth90=done90/3;
 // Monthly SPK completion (6 bulan terakhir)
 const moBuckets={};K90.kir.forEach(f=>{if(!f.Kfull)return;const m=f.Kfull.slice(0,7);moBuckets[m]=(moBuckets[m]||0)+1});
 const moKeys=Object.keys(moBuckets).sort();
 // Vendor TAT top 5
 const topV=K90.byV.slice(0,5);
 const SPKT_v=SPKT();

 // === Hak lihat: tile dan panel hanya untuk modul yang boleh dilihat pengguna ===
 const vis=m=>!ME_P||!!myLevel(m);
 const isAdm=!ME_P||myRole()==='admin';

 // === KPI tiles ===
 const kpi=(href,cls,lb,v,unit,s)=>`<a class="kpi ${cls}" href="#${href}"><span class="lb">${lb}</span><span class="v">${v}${unit?`<small>${unit}</small>`:''}</span><span class="s">${s}</span></a>`;
 const kpiD=(cls,lb,v,unit,s)=>`<div class="kpi ${cls}" style="cursor:default"><span class="lb">${lb}</span><span class="v">${v}${unit?`<small>${unit}</small>`:''}</span><span class="s">${s}</span></div>`;
 const otdPct=otdRate==null?'–':Math.round(otdRate*100)+'%';
 const otdCls=otdRate==null?'':otdRate>=0.9?'ok':otdRate>=0.75?'warn':'crit';
 const rmTon=ton(Object.values(rmCalc().info).filter(x=>!x.off).reduce((a,x)=>a+x.kg,0));
 const crit=DI.filter(i=>i.sev>=3).length;
 const need=[];
 if(vis('spk')&&spLate)need.push(`${spLate} SPK terlambat`);
 if(vis('bahan-baku')&&rmLow.length)need.push(`${rmLow.length} bahan baku kritis`);
 if(vis('vendor')&&vOld>14)need.push('barang di vendor lebih dari 14 hari');
 if(isAdm&&crit)need.push(`${crit} temuan data kritis`);
 if(isAdm&&ME_P&&USER&&USER.exportAll){const bk=byId('master','backup');const bd=bk&&bk.ts?Math.floor((Date.now()-new Date(bk.ts).getTime())/864e5):null;if(bd==null)need.push('belum ada cadangan data');else if(bd>7)need.push(`cadangan terakhir ${bd} hari lalu`)}
 const bcls=!need.length?'ok':(spLate||crit)?'crit':'warn';
 const qaBk=(isAdm&&ME_P&&USER&&USER.exportAll)?'<button type="button" class="btn sm" data-act="backup">Unduh cadangan</button>':'';
 const qa0=[['spk','spk','SPK baru'],['bahan-baku','bahan-baku','Terima material'],['pengiriman','pengiriman','Surat jalan'],['bongkar-muat','bongkar-muat','Catat kendaraan']].filter(([m])=>ME_P?myLevel(m)==='ubah':CAN).map(([m,h,l])=>`<a class="btn sm" href="#${h}">${l}</a>`).join('');
 const qa=qa0+qaBk;
 let h=`<section class="brief ${bcls}"><span class="dot"></span><div class="bt"><b>${need.length?need.length+' hal perlu perhatian':'Semua terkendali'}</b><span>${need.length?need.join(' · '):'Stok aman, SPK sesuai jadwal, barang di vendor dalam batas.'}</span></div><div class="qa">${qa}</div><time>${fd(t)}</time></section>
 ${tindakanHariIni()}
 <div class="sect-t">Operasional hari ini</div>
 <section class="kpis">
  ${vis('bahan-baku')?kpi('bahan-baku',rmLow.length?'crit':'ok','Bahan baku kritis',rmLow.length,'item',S.rm.length?`habis / di bawah buffer · ${rmTon} ton di gudang`:'belum ada item bahan baku'):''}
  ${vis('spk')?kpi('spk',spLate?'crit':'ok','SPK berjalan',spAct,'',spLate?`<b style="color:var(--crit)">${spLate} terlambat</b> dari due date`:spAct?'semua sesuai jadwal':'belum ada SPK aktif'):''}
  ${vis('vendor')?kpi('vendor',vOld>14?'crit':vOld>7?'warn':'ok','Di vendor finishing',n(vQty),'btg/pcs',vOpen.length?`${vOpen.length} SJ aktif · <b>${ton(vTonKg)} ton</b> · tertua ${vOld} hari`:'tidak ada barang di vendor'):''}
  ${vis('pengiriman')?kpi('pengiriman','info','Terkirim bulan ini',kMonth,'SJ',kMonth||kTrip?`<b>${ton(kTonKgMonth)} ton</b> · ${kTrip} dalam perjalanan`:'belum ada pengiriman bulan ini'):''}
 </section>
 ${vis('spk')||isAdm?`<div class="sect-t">Kinerja 90 hari terakhir</div>
 <section class="kpis sm">
  ${vis('spk')?kpiD(otdCls,'Ketepatan kirim (OTD)',otdPct,'',K90.kir.length?`${K90.otd.length} dari ${K90.kir.length} SPK terkirim tepat waktu`:'muncul setelah ada SPK terkirim'):''}
  ${vis('spk')?kpiD(K90.avgCycle!=null?(K90.avgCycle<=SPKT_v.prod+SPKT_v.kirim?'ok':'warn'):'','Rata-rata siklus SPK',r1(K90.avgCycle),'hk',K90.avgCycle!=null?`produksi ${r1(K90.avgProd)} · vendor ${r1(K90.avgTurn)} · kirim ${r1(K90.avgKirim)} hk`:'muncul setelah ada SPK terkirim'):''}
  ${isAdm?kpi('cek-data',crit?'crit':DI.length?'warn':'ok','Temuan cek data',DI.filter(i=>i.sev>=2).length,'perlu aksi',`${crit} kritis · ${DI.filter(i=>i.sev===1).length} info`):''}
 </section>`:''}`;

 // === Pipeline SPK per stage ===
 const pipeStages=[{k:'Produksi',cls:'info'},{k:'Siap ke vendor',cls:'warn'},{k:'Di vendor',cls:'warn'},{k:'Siap kirim',cls:'info'},{k:'Kirim sebagian',cls:'info'},{k:'Terkirim',cls:'ok'}];
 const pipeTotal=pipeStages.reduce((a,s)=>a+(stageCnt[s.k]||0),0)||1;
 const pipeReal=pipeStages.reduce((a,s)=>a+(stageCnt[s.k]||0),0);
 const pipeH=pipeReal?`<div class="funnel"><div class="fbar">${pipeStages.filter(s=>stageCnt[s.k]).map(s=>`<i class="${s.cls}" style="flex:${stageCnt[s.k]}" title="${s.k}: ${stageCnt[s.k]} SPK"></i>`).join('')}</div><div class="fleg">${pipeStages.map(s=>`<div class="${stageCnt[s.k]?'':'zero'}"><b>${stageCnt[s.k]||0}</b><span>${s.k}</span></div>`).join('')}</div></div>`:empty('Belum ada SPK dalam 90 hari','SPK yang diterbitkan akan tampil per tahap: produksi, vendor, siap kirim, terkirim.');

 // === Throughput chart: SPK selesai per bulan (bar chart) ===
 const thrBars=moKeys.length>=2?barChart({title:'SPK terkirim per bulan (90 hari)',bars:moKeys.map(m=>({label:BLN3(m+'-01'),v:moBuckets[m],tip:`<b>${BLN3(m+'-01')}</b><div>${moBuckets[m]} SPK terkirim</div>`})),fmt:v=>n(Math.round(v))}):null;

 // === Vendor TAT bars ===
 const vTATmx=Math.max(1,...topV.map(z=>{const av=avgOf(z.turns);return av||0}),SPKT_v.hdg||14,SPKT_v.elg||14,SPKT_v.pc||14);
 const vTATbars=topV.length?`<div class="hbars">${topV.map(z=>{const av=avgOf(z.turns);const tgt=SPKT_v[Object.keys(SPKT_v).find(k=>z.proses.has(k))]||SPKT_v.hdg||14;const low=av!=null&&av>tgt;return `<div class="hb"><span class="nm">${esc(z.k)} <span class="muted">${[...z.proses].join('/')}</span></span><span class="track"><i class="${low?'low':''}" style="width:${av!=null?pct(av,vTATmx)*100:0}%"></i><b style="left:calc(${pct(tgt,vTATmx)*100}% - 1px)"></b></span><span class="vv" style="${low?'color:var(--crit)':''}">${av!=null?r1(av)+' hk':'–'}</span></div>`}).join('')}
<div class="legend" style="margin-top:8px"><span><i></i>Avg TAT selesai</span><span><i class="low"></i>Melewati target</span><span><i class="tick"></i>Target hari kerja</span></div></div>`:empty('Belum ada data TAT vendor','Data TAT vendor akan tersedia setelah ada kiriman yang sudah kembali.');

 // === Top customer volume bars ===
 const custBars=topCust.length?`<div class="hbars">${topCust.map(([k,v])=>`<div class="hb"><span class="nm">${esc(k)||'(tanpa nama)'}</span><span class="track"><i style="width:${pct(v,custMx)*100}%"></i></span><span class="vv">${n(v)} btg/pcs</span></div>`).join('')}</div>`:empty('Belum ada pengiriman','Pengiriman ke customer akan muncul setelah data kirim diisi.');

 // === Alerts ===
 const al=[];
 rmLow.sort((a,b)=>c.stock.rm[a._id]-c.stock.rm[b._id]).forEach(r=>{const x=RMI(r._id);const s=x.stok;al.push({sev:s<=0?3:x.st==='Kritis'?2.6:2,cls:s<=0||x.st==='Kritis'?'crit':'',href:'bahan-baku',t:`<b>${esc(rmLabel(r))}</b> ${x.st.toLowerCase()}`,m:`Stok ${n(s)} lbr${x.sug?` → usulan order ${n(x.sug)} lbr (${ton(x.sug*x.kg1)} t)`:''}`})});
 const lateSeen=new Set();
 S.spk.map(s=>[s,c.spk[s._id]]).filter(([s,x])=>x.st==='Terlambat').sort((a,b)=>b[1].late-a[1].late).slice(0,8).forEach(([s,x])=>lateSeen.add(s._id)||al.push({sev:2.5,cls:'crit',href:'spk',open:'spk:'+s._id,t:`<b>SPK ${s.no}</b> ${esc(s.customer)} telat ${x.late} hari`,m:`Due ${fd(s.due)} · produksi ${Math.round(x.pP*100)}% · terkirim ${Math.round(x.pK*100)}%`}));
 vOpen.filter(x=>x.age>7).sort((a,b)=>b.age-a.age).slice(0,6).forEach(x=>al.push({sev:x.age>14?2.4:1.5,cls:x.age>14?'crit':'',href:'vendor',open:'vendor:'+x.v._id,t:`<b>${n(x.sisa)} ${esc(x.v.items?.[0]?.u||'')}</b> masih di ${esc(x.v.vendor)} ${x.age} hari`,m:`${esc(spkName(x.v.spk))} · ${esc(x.v.proses||'')} · dikirim ${fd(x.v.tgl)}`}));
 // Late open SPK (past due, belum selesai)
 K90.lateOpen.filter(f=>!lateSeen.has(f.s._id)).slice(0,4).forEach(f=>al.push({sev:2.3,cls:'crit',href:'spk',open:'spk:'+f.s._id,t:`<b>SPK ${f.s.no}</b> ${esc(f.s.customer)} lewat due date, belum terkirim`,m:`Due ${fd(f.s.due)} · stage: ${flow(f.s._id)?.stage||'–'} · produksi ${Math.round(f.x.pP*100)}%`}));
 al.sort((a,b)=>b.sev-a.sev);
 const alH=al.length?`<div class="alerts">${al.slice(0,12).map(a=>`<div class="alert ${a.cls}" data-act="go" data-href="${a.href}" ${a.open?`data-open="${a.open}"`:''}><span class="st"></span><div><div>${a.t}</div><div class="meta">${a.m}</div></div><span class="muted">›</span></div>`).join('')}</div>${al.length>12?`<div class="pbody note">+${al.length-12} peringatan lain</div>`:''}`:empty('Tidak ada yang perlu ditindak','Stok aman, SPK sesuai jadwal, barang di vendor masih dalam batas.');

 // === Activity feed ===
 const fe=[];
 S.mutasi.forEach(m=>{const it=byId(m.gudang,m.item);const lbl=m.gudang==='rm'?rmLabel(it):m.gudang==='sp'?spLabel(it):fgLabel(it);fe.push({at:m.at,ic:m.jenis==='masuk'?'inb':m.jenis==='keluar'?'outb':'chk',cls:m.jenis==='masuk'?'ok':m.jenis==='keluar'?'':'warn',t:`${MVL[m.jenis]||m.jenis} ${m.delta>0?'+':''}${n(m.delta)} · ${esc(lbl)}`,m:`${m.gudang==='rm'?'Gudang bahan baku':m.gudang==='sp'?'Gudang sparepart':'Gudang barang jadi'}${m.ref?' · '+esc(m.ref):''} · ${who(m.by)}`})});
 S.vendor.forEach(v=>fe.push({at:v.updAt||v.at,ic:'vendor',cls:'warn',t:`${v.updAt?'Terima kembali dari':'Kirim ke'} ${esc(v.vendor)} · ${esc(spkName(v.spk))}`,m:`${esc(v.noSJ||'')} · ${esc(v.proses||'')} · ${who(v.updAt?v.updBy:v.by)}`,tgl:v.tgl}));
 S.kirim.forEach(k=>fe.push({at:k.updAt||k.at,ic:'truck',cls:k.status==='Diterima'?'ok':'',t:`${esc(k.status)} · ${esc(k.customer)}`,m:`${esc(k.noSJ||'')} · ${esc(spkName(k.spk))} · ${who(k.updAt?k.updBy:k.by)}`,tgl:k.tgl}));
 S.spk.forEach(s=>{const ev=s.updAt&&s.rev?{at:s.updAt,t:`SPK ${s.no} direvisi (Rev.${s.rev}) · ${esc(s.customer)}`,by:s.updBy}:s.terbitAt?{at:s.terbitAt,t:`SPK ${s.no} terbit · ${esc(s.customer)}`,by:s.terbitBy}:(s.status==='Draft'&&s.at)?{at:s.at,t:`Draft SPK ${s.no} · ${esc(s.customer)}`,by:s.by}:null;if(ev)fe.push({at:ev.at,ic:'spk',cls:'',t:ev.t,m:`${esc(s.lead||'')}${s.due?' · estimasi kirim '+fd(s.due):''} · ${who(ev.by)}`})});
 S.bongkar.forEach(b=>fe.push({at:b.updAt||b.at,ic:'dock',cls:b.status==='Selesai'?'ok':'warn',t:`${esc(b.jenis)} ${esc(b.muatan)} · ${esc(b.nopol||'')} (${esc(b.status)})`,m:`${esc(b.pihak||'')} · ${who(b.updAt?b.updBy:b.by)}`}));
 fe.sort((a,b)=>((b.at||'')+(b.tgl||'')).localeCompare((a.at||'')+(a.tgl||'')));
 const feH=fe.length?`<div class="feed">${fe.slice(0,14).map(f=>`<div class="fi"><span class="ic ${f.cls}">${ic(f.ic)}</span><div><div class="t">${f.t}</div><div class="m">${f.m}</div></div><time>${f.at&&!f.at.startsWith('2026-10-30T08:00')?ago(f.at):fd(f.tgl||f.at)}</time></div>`).join('')}</div>`:empty('Belum ada aktivitas','Transaksi gudang dan logistik akan muncul di sini begitu dicatat.');

 // === RM stok bars ===
 const rmShow=S.rm.filter(r=>rmOn(r)&&(r.buffer>0||c.stock.rm[r._id]>0)).sort((a,b)=>(a.item+a.ukuran).localeCompare(b.item+b.ukuran));
 const mx=Math.max(1,...rmShow.map(r=>Math.max(c.stock.rm[r._id],r.buffer)));
 const rmBars=`<div class="hbars">${rmShow.map(r=>{const s=c.stock.rm[r._id];const low=r.buffer>0&&s<r.buffer;return `<div class="hb" title="${esc(rmLabel(r))}: stok ${s}, buffer ${r.buffer}"><span class="nm">${esc(r.item.replace('Plat ',''))} <span class="muted">${esc(r.ukuran)}</span></span><span class="track"><i class="${low?'low':''}" style="width:${pct(Math.max(0,s),mx)*100}%"></i>${r.buffer>0?`<b style="left:calc(${pct(r.buffer,mx)*100}% - 1px)"></b>`:''}</span><span class="vv" style="${low?'color:var(--crit)':''}">${n(s)}</span></div>`}).join('')}</div>`;

 // === Pipeline section HTML ===
 const pipePanel=`<section class="panel"><header><h2>Pipeline SPK</h2><span class="hint">90 hari terakhir · ${K90.Fl.length} SPK</span></header><div class="pbody">
  <div class="pipe-stats">
   <div class="ps"><span>OTD</span><b class="${otdCls}">${otdPct}</b></div>
   <div class="ps"><span>Avg siklus</span><b>${r1(K90.avgCycle)||'–'} hk</b></div>
   <div class="ps"><span>Avg produksi</span><b>${r1(K90.avgProd)||'–'} hk</b></div>
   <div class="ps"><span>Avg vendor TAT</span><b>${r1(K90.avgTurn)||'–'} hk</b></div>
   <div class="ps"><span>Bulan ini selesai</span><b>${done30}</b></div>
   <div class="ps"><span>Avg/bln (90h)</span><b>${r1(avgPerMonth90)}</b></div>
  </div>
  ${pipeH}
  ${thrBars?`<div style="margin-top:12px">${thrBars}</div>`:K90.kir.length<2?`<div class="note" style="padding:12px 0">Grafik tersedia setelah ada 2+ bulan data pengiriman.</div>`:''}
 </div></section>`;

 const stokPanel=`<section class="panel"><header><h2>Stok bahan baku vs buffer</h2><span class="hint">lembar</span></header><div class="pbody">${rmShow.length?rmBars+'<div class="legend" style="margin-top:12px"><span><i></i>Stok aman</span><span><i class="low"></i>Di bawah buffer</span><span><i class="tick"></i>Buffer stok</span></div>':empty('Belum ada stok bahan baku','Tambahkan item di Gudang Bahan Baku agar stok dan buffer tampil di sini.')}</div></section>`;
 const vendPanel=`<section class="panel"><header><h2>Performa vendor finishing</h2><span class="hint">rata-rata TAT vs target · 90 hari</span></header><div class="pbody">${vTATbars}</div></section>`;
 const custPanel=`<section class="panel"><header><h2>Top customer · qty terkirim</h2><span class="hint">90 hari terakhir</span></header><div class="pbody">${custBars}</div></section>`;
 h+=`<div class="dash-cols">
 <div class="stack">
  ${vis('spk')?pipePanel:''}
  ${vis('bahan-baku')?stokPanel:''}
  <div class="dash-pair">${vis('vendor')?vendPanel:''}${vis('pengiriman')?custPanel:''}</div>
 </div>
 <div class="stack">
  <section class="panel"><header><h2>Perlu tindakan</h2><span class="hint">${al.length} peringatan</span></header>${alH}</section>
  <section class="panel"><header><h2>Aktivitas terbaru</h2><span class="hint">semua pengguna</span></header>${feH}</section>
 </div></div>`;
 return h;
};

/* ---------- WAREHOUSE (shared by RM & FG) ---------- */
const TYPE_URUT=['STU','STC','SLU','SLW','SLHD'];
const fgTypes=kat=>{const xs=S.fg.filter(r=>!kat||r.kategori===kat);const ada=[...new Set(xs.map(r=>(r.type||'').trim()).filter(Boolean))];ada.sort((a,b)=>{const i=TYPE_URUT.indexOf(a),j=TYPE_URUT.indexOf(b);return (i<0?99:i)-(j<0?99:j)||a.localeCompare(b)});return{types:ada,tanpa:xs.some(r=>!(r.type||'').trim())}};
function whTools(view,g){
 const f=F[view];
 const filt=g==='rm'?`<select class="sel" data-act="filtsel" data-view="${view}" data-key="grade" id="f-grade"><option value="">Semua material</option>${GRADES().map(x=>`<option ${f.grade===x?'selected':''}>${esc(x)}</option>`).join('')}</select>`
  :`<select class="sel" data-act="filtsel" data-view="${view}" data-key="kat" id="f-kat"><option value="">Semua kategori</option>${[...new Set(S.fg.map(x=>x.kategori))].sort().map(x=>`<option ${f.kat===x?'selected':''}>${esc(x)}</option>`).join('')}</select>${(()=>{const o=fgTypes(f.kat);return `<select class="sel" data-act="filtsel" data-view="${view}" data-key="type" id="f-type"><option value="">Semua type</option>${o.types.map(x=>`<option value="${esc(x)}" ${f.type===x?'selected':''}>${esc(x)}</option>`).join('')}${o.tanpa?`<option value="__none" ${f.type==='__none'?'selected':''}>Tanpa type</option>`:''}</select>`})()}<select class="sel" data-act="filtsel" data-view="${view}" data-key="fin" id="f-fin"><option value="">Semua finishing</option>${[...new Set(S.fg.map(x=>x.finishing))].sort().map(x=>`<option ${f.fin===x?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
 return `<input class="inp search" id="q-${view}" placeholder="${g==='rm'?'Cari material / ukuran…':'Cari ukuran, type, finishing…'}" value="${esc(f.q)}" data-act="q" data-view="${view}">${filt}
 <span class="grow"></span>
 <button class="btn primary" data-act="mv" data-g="${g}" data-j="masuk">${ic('inb')}${g==='rm'?'Terima material':'Barang masuk'}</button>${g==='fg'?`<button class="btn" data-act="fgspkpick" title="Buat SPK untuk produksi stok gudang">${ic('plus')}SPK stok</button>`:''}
 <button class="btn" data-act="mv" data-g="${g}" data-j="keluar">${ic('outb')}${g==='rm'?'Pakai produksi':'Barang keluar'}</button>
 <button class="btn" data-act="mv" data-g="${g}" data-j="opname">${ic('chk')}Stock opname</button>
 <button class="btn ghost" data-act="newitem" data-g="${g}">${ic('plus')}Item baru</button>
 <button class="btn ghost" data-act="csv" data-what="${g}">${ic('dl')}CSV</button>`;
}
T['barang-jadi']=()=>whTools('barang-jadi','fg');
function whRows(g){
 const view=g==='rm'?'bahan-baku':'barang-jadi',f=F[view],c=calc();const q=f.q.toLowerCase();
 return S[g].filter(r=>{const lbl=(g==='rm'?rmLabel(r):fgLabel(r)).toLowerCase();if(q&&!lbl.includes(q))return false;
  if(g==='rm'){if(f.grade&&grade(r)!==f.grade)return false;if(f.low&&!(r.buffer>0&&c.stock.rm[r._id]<r.buffer)&&c.stock.rm[r._id]>0)return false}
  else{if(f.low&&!(r.buffer>0&&c.stock.fg[r._id]<r.buffer))return false;if(f.kat&&r.kategori!==f.kat)return false;if(f.type&&(f.type==='__none'?(r.type||'').trim():(r.type||'').trim()!==f.type))return false;if(f.fin&&r.finishing!==f.fin)return false}return true})
 .sort((a,b)=>a._id.localeCompare(b._id));
}
function whBody(g){
 const view=g==='rm'?'bahan-baku':'barang-jadi',f=F[view],c=calc();
 const tabs=`<div class="tabs"><button data-act="filt" data-view="${view}" data-key="tab" data-val="stok" class="${f.tab==='stok'?'on':''}">Posisi stok</button><button data-act="filt" data-view="${view}" data-key="tab" data-val="mutasi" class="${f.tab==='mutasi'?'on':''}">Riwayat mutasi</button></div>`;
 if(f.tab==='mutasi'){
  const mv=S.mutasi.filter(m=>m.gudang===g).sort((a,b)=>(b.tgl+b.at).localeCompare(a.tgl+a.at));
  const rows=mv.map(m=>{const it=byId(g,m.item);return `<tr class="${m.dikoreksi?'void':''}"><td>${fd(m.tgl)}</td><td>${stChip(MVL[m.jenis]||m.jenis)}</td><td>${esc(g==='rm'?rmLabel(it):fgLabel(it))}</td><td class="num big" style="color:${m.delta<0?'var(--crit)':'var(--ok)'}">${m.delta>0?'+':''}${n(m.delta)}</td><td>${m.noDok?`<span class="mono">${esc(m.noDok)}</span><div class="note">${esc(m.ref||'')}</div>`:esc(m.ref||'–')}</td><td>${esc(m.pihak||'')}</td><td class="muted">${esc(m.ket||'')}</td><td class="muted">${who(m.by)}</td></tr>`}).join('');
  return `<section class="panel">${tabs}${mv.length?`<div class="tbl-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Item</th><th class="num">Qty</th><th>Dokumen</th><th>${g==='rm'?'Supplier / Tujuan':'Asal / Customer'}</th><th>Keterangan</th><th>Dicatat</th></tr></thead><tbody>${rows}</tbody></table></div>`:empty('Belum ada mutasi','Stok saat ini masih sama dengan stok awal dari file Excel. Catat penerimaan, pemakaian, atau stock opname dengan tombol di atas.')}</section>`;
 }
 const rows=whRows(g);
 const all=S[g];const low=all.filter(r=>r.buffer>0&&c.stock[g][r._id]<r.buffer).length;const zero=all.filter(r=>c.stock[g][r._id]<=0).length;const tot=all.reduce((a,r)=>a+Math.max(0,c.stock[g][r._id]),0);
 const summ=`<div class="summ">${chip(`${all.length} item`,'plain')}${chip(`Total ${n(tot)} ${g==='rm'?'lembar':'btg/pcs'}`,'info')}<button class="chip ${f.low?'crit':'warn'}" style="cursor:pointer" data-act="filt" data-view="${view}" data-key="low" data-val="${!f.low}">${low} di bawah buffer${f.low?' · tampilkan semua':''}</button>${chip(`${zero} kosong`,zero?'crit':'ok')}</div>`;
 const tr=rows.map(r=>{const s=c.stock[g][r._id];const[st,cl]=stockState(r,s);const lm=c.lastMv[g+r._id];
  return g==='rm'?`<tr class="click" data-act="kartu" data-g="rm" data-id="${r._id}"><td><b>${esc(r.item)}</b></td><td class="mono">${esc(r.ukuran)}</td><td class="num">${r.buffer?n(r.buffer):'–'}</td><td class="num big">${n(s)}</td><td>${esc(r.satuan)}</td><td>${chip(st,cl)}</td><td class="muted">${lm?fd(lm.tgl):'Stok awal '+fd(r.tglStokAwal)}</td></tr>`
  :`<tr class="click" data-act="kartu" data-g="fg" data-id="${r._id}"><td><b>${esc(r.kategori)}</b> ${esc(r.type)}</td><td class="mono">${esc(r.ukuran)}</td><td class="num mono">${esc(r.panjang)}</td><td>${esc(r.finishing)}</td><td class="num mono">${esc(r.tebal)}</td><td class="num">${r.buffer>0?n(r.buffer):'–'}</td><td class="num big">${n(s)}</td><td>${esc(r.satuan)}</td><td>${s<=0?chip('Kosong','crit'):r.buffer>0&&s<r.buffer?chip('Di bawah buffer','warn'):chip('Ada','ok')}${r.ket?' <span class="muted">'+esc(r.ket)+'</span>':''}</td></tr>`}).join('');
 const head=g==='rm'?'<th>Material</th><th>Ukuran (t×l×p mm)</th><th class="num">Buffer</th><th class="num">Stok</th><th>Satuan</th><th>Status</th><th>Mutasi terakhir</th>':'<th>Produk</th><th>Ukuran (W×H)</th><th class="num">Panjang</th><th>Finishing</th><th class="num">Tebal</th><th class="num">Buffer</th><th class="num">Stok</th><th>Satuan</th><th>Status</th>';
 return `<section class="panel">${tabs}<div class="pbody">${summ}</div>${rows.length?`<div class="tbl-wrap"><table><thead><tr>${head}</tr></thead><tbody>${tr}</tbody></table></div>`:empty('Tidak ada item yang cocok','Ubah kata kunci atau filter.')}</section>`;
}
B['barang-jadi']=()=>whBody('fg');

/* ---------- BONGKAR MUAT ---------- */
T['bongkar-muat']=()=>`${segBtns('bongkar-muat','range',[['0','Hari ini'],['7','7 hari'],['all','Semua']])}${segBtns('bongkar-muat','jenis',[['','Semua'],['Loading','Loading'],['Unloading','Unloading']])}<input class="inp search" id="q-bongkar-muat" placeholder="Cari plat, pihak, SJ…" value="${esc(F['bongkar-muat'].q||'')}" data-act="q" data-view="bongkar-muat"><span class="grow"></span><button class="btn primary" data-act="newbm">${ic('plus')}Kendaraan masuk</button><button class="btn ghost" data-act="csv" data-what="bongkar">${ic('dl')}CSV</button>`;
const dur=(a,b)=>{if(!a||!b)return '';const[x,y]=a.split(':').map(Number),[p,q]=b.split(':').map(Number);let m=p*60+q-(x*60+y);if(m<0)m+=1440;return m>=60?`${Math.floor(m/60)} j ${m%60} m`:`${m} mnt`};
/* ---------- VENDOR ---------- */
T['vendor']=()=>`${segBtns('vendor','st',[['aktif','Masih di vendor'],['selesai','Selesai'],['','Semua']])}<select class="sel" id="f-vendor" data-act="filtsel" data-view="vendor" data-key="vendor"><option value="">Semua vendor</option>${[...new Set(S.vendor.map(v=>v.vendor))].sort().map(v=>`<option ${F.vendor.vendor===v?'selected':''}>${esc(v)}</option>`).join('')}</select><input class="inp search" id="q-vendor" placeholder="Cari SPK, SJ, customer…" value="${esc(F.vendor.q)}" data-act="q" data-view="vendor"><span class="grow"></span><button class="btn primary" data-act="newvendor">${ic('outb')}Kirim ke vendor</button><button class="btn ghost" data-act="csv" data-what="vendor">${ic('dl')}CSV</button>`;
/* ---------- PENGIRIMAN ---------- */
T['pengiriman']=()=>`${segBtns('pengiriman','st',[['','Semua'],['Disiapkan','Disiapkan'],['Dalam Perjalanan','Dalam perjalanan'],['Diterima','Diterima']])}<input class="inp search" id="q-kirim" placeholder="Cari SJ, SPK, customer…" value="${esc(F.pengiriman.q)}" data-act="q" data-view="pengiriman"><span class="grow"></span><button class="btn primary" data-act="newkirim">${ic('truck')}Buat surat jalan</button><button class="btn ghost" data-act="csv" data-what="kirim">${ic('dl')}CSV</button>`;
B['pengiriman']=()=>{
 const f=F.pengiriman,q=f.q.toLowerCase(),t=today();
 const xs=S.kirim.filter(k=>{if(f.st&&k.status!==f.st)return false;if(q){const s=byId('spk',k.spk);if(!`${k.noSJ} ${s?.no} ${k.customer} ${k.nopol||''}`.toLowerCase().includes(q))return false}return true}).sort((a,b)=>(b.tgl+(b.at||'')).localeCompare(a.tgl+(a.at||'')));
 const tonBulanIni=S.kirim.filter(k=>(k.tgl||'').slice(0,7)===t.slice(0,7)&&k.status!=='Batal').reduce((a,k)=>a+(k.items||[]).reduce((b,it)=>b+(+it.q||0)*wRealDok(k,it),0),0);
 const summ=`<div class="summ">${chip(`${S.kirim.filter(k=>k.status==='Disiapkan').length} disiapkan`,'plain')}${chip(`${S.kirim.filter(k=>k.status==='Dalam Perjalanan').length} dalam perjalanan`,'info')}${chip(`${S.kirim.filter(k=>(k.tgl||'').slice(0,7)===t.slice(0,7)).length} SJ bulan ini`,'ok')}${tonBulanIni>0?chip(`${ton(tonBulanIni)} ton terkirim bulan ini`,'ok'):''}</div>`;
 const next={Disiapkan:'Dalam Perjalanan','Dalam Perjalanan':'Diterima'};
 const rows=xs.map(k=>{const s=byId('spk',k.spk);const q=(k.items||[]).reduce((a,i)=>a+(+i.q||0),0);const wkg=(k.items||[]).reduce((a,i)=>a+(+i.q||0)*(+i.w||0),0);return `<tr class="click ${k.status==='Batal'?'void':''}" data-act="openkirim" data-id="${k._id}"><td class="mono">${esc(k.noSJ||'–')}</td><td>${fd(k.tgl)}</td><td>${s?'SPK '+s.no:'–'}</td><td><b>${esc(k.customer)}</b></td><td class="num">${(k.items||[]).length} item · <b>${n(q)}</b>${wkg?`<div class="note">${ton(wkg)} ton</div>`:''}</td><td>${k.nopol?`<span class="mono">${esc(k.nopol)}</span>`:''}${k.driver?`<div class="note">${esc(k.driver)}</div>`:''}</td><td>${stChip(k.status)}</td><td>${next[k.status]?`<button class="btn sm ${k.status==='Dalam Perjalanan'?'primary':''}" data-act="kstep" data-id="${k._id}" data-to="${next[k.status]}">${k.status==='Disiapkan'?'Berangkat':'Diterima customer'}</button>`:''}</td></tr>`}).join('');
 return `<section class="panel"><div class="pbody">${summ}</div>${xs.length?`<div class="tbl-wrap"><table><thead><tr><th>No SJ</th><th>Tanggal</th><th>SPK</th><th>Customer</th><th class="num">Muatan</th><th>Kendaraan</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:empty('Belum ada pengiriman','Buat surat jalan dari SPK; status berangkat dan diterima ter-update realtime.')}</section>`;
};

/* ---------- Kebutuhan material dan reservasi (T-192): pratinjau, tidak mengubah stok ---------- */
const MT=()=>window.MNIMaterial;
const MAT={items:[],opt:{}};
const matFaktor=()=>MT().faktorSisa((byId('master','setting')||{}).faktorSisa);
function matRmSiap(){const c=calc();return S.rm.filter(rmOn).map(r=>{const g=grade(r);return {id:r._id,label:rmLabel(r),bahan:MT().bahanDariJenis(famOf(g),densG(g)),tebal:thkR(r),kgPerLbr:kgLbr(r),stok:c.stock.rm[r._id]||0}})}
function matKeluarKg(spkId,rs){const idx={};rs.forEach(r=>idx[r.id]=r);const per={};
 S.mutasi.forEach(m=>{if(m.gudang!=='rm'||m.spk!==spkId||!(m.jenis==='keluar'||m.jenis==='koreksi'))return;const r=idx[m.item];if(!r||!r.kgPerLbr)return;if(m.jenis==='koreksi'){const o=S.mutasi.find(x=>x._id===m.koreksiDari);if(!o||o.jenis!=='keluar')return}const k=MT().kunciMaterial(r.bahan,r.tebal);per[k]=(per[k]||0)+(-(+m.delta||0))*r.kgPerLbr});return per}
function matReservasi(rs,kecuali){const c=calc(),f=matFaktor();
 return MT().reservasiAktif(S.spk.filter(s=>s._id!==kecuali).map(s=>{const sx=c.spk[s._id];const aktif=(s.status||'Terbit')==='Terbit'&&!!sx&&sx.st!=='Selesai'&&sx.st!=='Batal';
  return {id:s._id,aktif,kelompok:aktif?MT().kelompokKebutuhan(matSpkItems(s),{faktor:f,tebalSpk:s.tebal}):[],keluar:aktif?matKeluarKg(s._id,rs):{}}}))}
function matDipesan(rs){const idx={};rs.forEach(r=>idx[r.id]=r);const per={};
 S.pr.filter(p=>p.status==='Draf'||p.status==='Diajukan'||p.status==='Dipesan').forEach(p=>(p.items||[]).forEach(i=>{const r=idx[i.item];if(!r||!r.kgPerLbr)return;const k=MT().kunciMaterial(r.bahan,r.tebal);per[k]=(per[k]||0)+Math.max(0,(+i.q||0)-(+i.qTerima||0))*r.kgPerLbr}));return per}
function matRencana(items,opt={}){const rs=matRmSiap();const kel=MT().kelompokKebutuhan(items,{faktor:matFaktor(),tebalSpk:opt.tebal});
 return MT().rencanaMaterial(kel,rs,{reservasiLain:matReservasi(rs,opt.spkId).total,keluar:opt.spkId?matKeluarKg(opt.spkId,rs):{},dipesan:matDipesan(rs)})}
const MAT_CLS={Cukup:'ok',Kurang:'crit','Tanpa item RM':'warn','Sudah dikeluarkan':'info','Sudah dipesan':'info'};
function matPanelHtml(items,opt={}){
 if(!MT()||!items||!items.length||!myLevel('bahan-baku')&&myRole()!=='admin')return '';
 const rc=matRencana(items,opt);MAT.items=items;MAT.opt=opt;if(!rc.length)return '';
 const kg=x=>n(Math.round(x));
 const rows=rc.map(r=>`<tr><td><b>${esc(r.bahan)} ${r.tebal} mm</b><div class="note">${r.baris} item${r.tanpaBerat.length?` · <span class="red">${r.tanpaBerat.length} tanpa berat</span>`:''}${r.utama?' · '+esc(r.utama.label):''}</div></td><td class="num">${kg(r.netto)}</td><td class="num">${kg(r.bruto)}</td><td class="num">${r.butuhLbr==null?'–':n(r.butuhLbr)}</td><td class="num">${kg(r.fisikKg)}</td><td class="num">${kg(r.reservasiKg)}${r.dipesanKg?`<div class="note">+${kg(r.dipesanKg)} dipesan</div>`:''}</td><td class="num">${kg(r.tersediaKg)}</td><td>${chip(r.status,MAT_CLS[r.status]||'plain')}${r.kurangLbr>0?`<div class="note">kurang ${n(r.kurangLbr)} lbr</div>`:''}</td></tr>`).join('');
 const pr=MT().usulanPr(rc);
 return `<section class="panel mat-panel"><div class="pbody"><h4>Kebutuhan material</h4><div class="tbl-wrap"><table id="mat-tbl"><thead><tr><th>Bahan / tebal</th><th class="num">Netto (kg)</th><th class="num">Bruto (kg)</th><th class="num">Butuh (lbr)</th><th class="num">Stok fisik (kg)</th><th class="num">Reservasi SPK lain (kg)</th><th class="num">Tersedia (kg)</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
  <p class="note">Pratinjau: stok tidak berubah. Bruto = netto × faktor sisa potong ${String(matFaktor()).replace('.',',')}. Tersedia = stok fisik − reservasi SPK Terbit lain. Reservasi berkurang saat gudang mencatat Pakai dengan nomor SPK.</p>
  ${pr.length&&matBisaPr()?`<button class="btn" data-act="matpr">Buat PR untuk kekurangan (${pr.length} item)</button>`:''}</div></section>`;
}
/* ---------- Serah terima plate gudang ke produksi (T-224) ----------
   Status plate per SPK dari kebutuhan bruto (kg) dibanding yang sudah dikeluarkan untuk SPK itu (mutasi keluar bertanda SPK).
   Menunggu, Sebagian, Lengkap. Hanya peringatan: produksi tetap bisa mulai. */
function platSpk(s){if(!MT()||!s)return null;const rc=matRencana(matSpkItems(s),{spkId:s._id,tebal:s.tebal});if(!rc.length)return null;
 const bruto=rc.reduce((a,r)=>a+(+r.bruto||0),0),sudah=rc.reduce((a,r)=>a+(+r.sudahKg||0),0),sisa=rc.reduce((a,r)=>a+(+r.butuhKg||0),0);
 return {st:sisa<=0.0005?'Lengkap':sudah>0.0005?'Sebagian':'Menunggu',bruto,sudah,sisa,rc}}
function platAntrian(){return S.spk.filter(s=>{const st=(calc().spk[s._id]||{}).st;return s.status==='Terbit'&&st!=='Selesai'&&st!=='Batal'}).map(s=>({s,p:platSpk(s)})).filter(x=>x.p&&x.p.st!=='Lengkap').sort((a,b)=>String(a.s.due||'9999').localeCompare(String(b.s.due||'9999'))||(+a.s.no||0)-(+b.s.no||0))}
function platChip(sid){const s=byId('spk',sid);if(!s||s.status!=='Terbit')return '';const p=platSpk(s);if(!p||p.st==='Lengkap')return '';return ' '+chip(p.st==='Menunggu'?'Plate belum diserahkan':'Plate sebagian','warn')}
/* T6: susut bahan baku per SPK. Plat keluar (mutasi bahan baku ber-SPK) dibanding hasil jadi (qty selesai x berat estimasi per item), per bahan dan tebal. */
function susutRows(){const c=calc();const out=[];if(!MT()||!MT().susutMaterial)return out;const rs=matRmSiap();const f=matFaktor();
 S.spk.forEach(s=>{if(s.status==='Draft'||s.status==='Batal')return;const x=c.spk[s._id];if(!x)return;
  const its=matSpkItems(s);const kel=MT().kelompokKebutuhan(its,{faktor:f,tebalSpk:s.tebal});if(!kel.length)return;
  const keluar=matKeluarKg(s._id,rs);if(!Object.values(keluar).some(v=>v>0))return;
  const ih=its.map((it,k)=>{const l=(x.lines||[])[k]||{};const am=ambilItem(s,s.items[k]);return {...it,q:Math.max(0,Math.min(+it.q||0,(+l.prodEff||0)-am))}});
  MT().susutMaterial(kel,MT().kelompokKebutuhan(ih,{faktor:f,tebalSpk:s.tebal}),keluar,{faktor:f}).forEach(r=>{if(r.keluarKg>0||r.hasilKg>0)out.push({s,...r})})});
 return out}
function susutTab(){const R=susutRows();
 if(!R.length)return '<div class="pbody note">Belum ada plat yang keluar untuk SPK. Susut dihitung setelah gudang mencatat pengeluaran plat dengan nomor SPK dan produksi dilaporkan.</div>';
 const urut={'Berlebih':0,'Plat kurang catat':1,'Berjalan':2,'Wajar':3,'Belum keluar':4};
 R.sort((a,b)=>(urut[a.status]-urut[b.status])||(+b.s.no||0)-(+a.s.no||0));
 const sel=R.filter(r=>r.status==='Wajar'||r.status==='Berlebih');const tk=sel.reduce((a,r)=>a+r.keluarKg,0),th=sel.reduce((a,r)=>a+r.hasilKg,0),ts=tk-th;
 const lebih=R.filter(r=>r.status==='Berlebih').length,kurang=R.filter(r=>r.status==='Plat kurang catat').length;
 const kp='<div class="kpi-row">'+kpiA('info','Plat keluar (SPK selesai produksi)',n(Math.round(tk))+' kg','dari '+sel.length+' kelompok bahan')+kpiA('ok','Hasil jadi',n(Math.round(th))+' kg','berat estimasi')+kpiA(lebih?'warn':'ok','Susut',n(Math.round(ts))+' kg',tk>0?(Math.round(ts/tk*1000)/10)+'% dari plat keluar':'-')+kpiA(lebih||kurang?'crit':'ok','Perlu dicek',lebih+kurang,lebih+' berlebih · '+kurang+' plat kurang catat')+kpiA('info','Rasio plat keluar ÷ hasil',th>0?(Math.round(tk/th*1000)/1000).toString().replace('.',','):'-','kalibrasi: 1,000 = plat keluar sama dengan berat estimasi hasil jadi')+'</div>';
 const chipS=st=>chip(st,st==='Wajar'?'ok':st==='Berlebih'?'crit':st==='Berjalan'?'info':'warn');
 const baris=R.map(r=>'<tr><td class="mono"><b>'+esc(String(r.s.no))+'</b><div class="note">'+esc(r.s.customer||'')+'</div></td><td>'+esc(r.bahan)+'</td><td class="num">'+n(r.tebal)+' mm</td><td class="num">'+n(Math.round(r.keluarKg))+'</td><td class="num">'+n(Math.round(r.hasilKg))+'</td><td class="num">'+(r.status==='Berjalan'?'-':n(Math.round(r.susutKg)))+'</td><td class="num">'+(r.pct==null||r.status==='Berjalan'?'-':(Math.round(r.pct*1000)/10)+'%')+'</td><td class="num">'+(Math.round(r.batas*1000)/10)+'%</td><td>'+chipS(r.status)+'</td></tr>').join('');
 return '<div class="pbody note">Susut = plat yang keluar dikurangi hasil jadi (kg), per SPK, bahan, dan tebal. Dinilai setelah produksi item selesai; batas wajar = faktor sisa potong ditambah toleransi 5%. Sisa plat utuh dikembalikan lewat Terima material (alasan: Sisa SPK).</div>'+kp+'<div class="tbl-wrap"><table id="susut-tabel"><thead><tr><th>SPK</th><th>Bahan</th><th class="num">Tebal</th><th class="num">Plat keluar (kg)</th><th class="num">Hasil jadi (kg)</th><th class="num">Susut (kg)</th><th class="num">Susut</th><th class="num">Batas</th><th>Status</th></tr></thead><tbody>'+baris+'</tbody></table></div>'}
function platTab(){const ok=matBisaPr(),q=platAntrian();
 const rows=q.map(({s,p})=>{const kel=p.rc.map(r=>esc(r.bahan)+' '+esc(String(r.tebal))+' mm · sisa '+(r.butuhLbr==null?'–':n(r.butuhLbr)+' lbr')+' ('+n(Math.round(r.butuhKg))+' kg)'+(r.status==='Tanpa item RM'?' <span class="chip warn">tanpa item RM</span>':r.status==='Kurang'?' <span class="chip crit">stok kurang</span>':'')).join('<br>');
  return `<tr><td class="mono"><b>${esc(String(s.no))}</b><div class="note">${esc(s.customer||'')}</div></td><td>${fd(s.due)}</td><td>${kel}</td><td class="num">${n(Math.round(p.sudah))} / ${n(Math.round(p.bruto))} kg</td><td>${chip(p.st==='Menunggu'?'Menunggu plate':'Sebagian',p.st==='Menunggu'?'warn':'info')}</td><td class="acts-r">${ok?`<button class="btn sm primary" data-act="platserah" data-id="${s._id}">Serahkan ke produksi</button> `:''}<button class="btn sm ghost" data-act="spksheet" data-id="${s._id}">SPK</button></td></tr>`}).join('');
 return `${platSerahSemuaBar()}<div class="pbody note">SPK terbit yang plate-nya belum lengkap diserahkan ke produksi. Tombol Serahkan membuka form pengeluaran bahan baku yang sudah terisi (SPK, item plate utama, jumlah lembar yang masih kurang); sesuaikan bila perlu lalu simpan, dan dokumen pengeluaran (PK) tercatat. Status ini peringatan saja: produksi tetap bisa mulai.</div>${q.length?`<div class="tbl-wrap"><table><thead><tr><th>SPK</th><th>Due</th><th>Plate yang masih perlu diserahkan</th><th class="num">Diserahkan / kebutuhan</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:empty('Semua plate sudah diserahkan','SPK terbit yang butuh plate muncul di sini sampai plate-nya diserahkan ke produksi.')}`}
/* Serahkan semua: satu dokumen PK ber-SPK per SPK yang plate-nya belum lengkap, memakai kebutuhan plat tersisa (bruto dikurangi yang sudah keluar).
   SPK dilayani berurutan menurut due date sampai stok plat utama habis; yang kekurangan stok diserahkan sebagian dan ditandai. */
/* Hitung ulang berat SPK dari kalkulator berat (rumus Excel). Hanya SPK yang belum selesai. Item diubah bila beratnya kosong atau selisih > 2% dari kalkulator,
   atau berat estimasi (plate) belum ada. Berat lama disimpan di wLama. Perlu katalog berat terpasang. */
function spkBeratPerbaikan(s){
 const B=window.MNIBerat;if(!B||!B.siap||!B.siap())return null;
 const items=(s.items||[]).map(i=>({...i}));const ubah=[];const tb=parseFloat(s.tebal)||null;
 items.forEach((it,ix)=>{let r=null;
  if(it.sb&&it.dim&&B.kgPerPcs&&B.keluargaDari){try{const fam=B.keluargaDari(it.g),dv=derive(it.g);const kp=fam?B.kgPerPcs({keluarga:fam,bentuk:it.sb,dim:it.dim,tebal:dv.tebal||thkOf(it.g),material:dv.material||s.material||'',lubang:it.lubang||'standar'}):null;if(kp&&kp.ok)r={ok:true,beratSPK:kp.kgPcsReal,berat:{estimasi:kp.kgPcsEst,real:kp.kgPcsReal}}}catch(e){r=null}}
  if(!r)try{r=B.hitungItem({judulSection:it.g,deskripsi:it.d,material:s.material||'',tebal:tb})}catch(e){r=null}
  if(!r||!r.ok)return;const baru=Math.round(r.beratSPK*1000)/1000;if(!(baru>0))return;
  const est=r.berat?(r.berat.estimasiLubang!=null?r.berat.estimasiLubang:r.berat.estimasi):null;const estB=est>0?Math.round(est*1000)/1000:null;
  const lama=+it.w||0;const beda=!lama||Math.abs(lama-baru)/baru>0.02;const estBeda=estB!=null&&Math.abs((+it.wEst||0)-estB)>0.001;
  if(!beda&&!estBeda)return;
  ubah.push({ix,d:it.d,lama,baru,est:estB});it.wLama=lama;it.w=baru;if(estB!=null)it.wEst=estB;it.ws='k'});
 return ubah.length?{ubah,items}:null}
function spkBeratDaftar(){const c=calc();return S.spk.filter(s=>(s.status==='Draft'||s.status==='Terbit')&&((c.spk[s._id]||{}).st!=='Selesai')).map(s=>({s,pb:spkBeratPerbaikan(s)})).filter(x=>x.pb)}
function spkBeratForm(ids){
 const L=spkBeratDaftar().filter(x=>!ids||ids.includes(x.s._id));if(!L.length){toast('Berat semua SPK ini sudah sesuai kalkulator, atau katalog berat belum terpasang.');return}
 try{need('spk',{items:[]},L[0].s._id,'upd')}catch(e){toast('Anda tidak berhak mengubah SPK.');return}
 const nItem=L.reduce((a,x)=>a+x.pb.ubah.length,0);
 openModal('Hitung ulang berat dari kalkulator',`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>SPK</th><th>Item</th><th class="num">Berat lama</th><th class="num">Berat baru</th><th class="num">Estimasi plate</th></tr></thead><tbody>${L.map(x=>x.pb.ubah.map((u,i)=>'<tr><td>'+(i===0?'<b>'+esc(String(x.s.no))+'</b>':'')+'</td><td>'+esc(u.d)+'</td><td class="num">'+(u.lama?n(u.lama):'-')+'</td><td class="num"><b>'+n(u.baru)+'</b></td><td class="num">'+(u.est!=null?n(u.est):'-')+'</td></tr>').join('')).join('')}</tbody></table></div><div class="note full">${L.length} SPK, ${nItem} item. Hanya SPK yang belum selesai. Berat lama disimpan (wLama) dan tonase serta kebutuhan plat SPK ikut dihitung ulang. SPK yang sudah selesai tidak diubah.</div>`,
  async()=>{let k=0;for(const x of L){await updDoc('spk',x.s._id,{items:x.pb.items,beratDihitungUlang:new Date().toISOString()});k++}
   toast(k+' SPK dihitung ulang beratnya');renderBody()},{submit:'Hitung ulang',done:' '});
}
function platSerahRencana(){const sisa={};const out=[];
 platAntrian().forEach(({s,p})=>{const baris=[];let kurang=false;
  p.rc.filter(r=>r.utama&&r.butuhLbr>0).forEach(r=>{const id=r.utama.id;if(sisa[id]==null)sisa[id]=Math.max(0,Math.floor((calc().stock.rm[id]||0)+1e-9));
   const q=Math.min(r.butuhLbr,sisa[id]);if(q<r.butuhLbr)kurang=true;if(q>0){sisa[id]-=q;baris.push({item:id,label:r.utama.label,q,butuh:r.butuhLbr})}});
  if(baris.length||kurang)out.push({s,baris,penuh:!kurang,tanpaStok:!baris.length})});
 return out}
function platSerahSemuaBar(){if(!matBisaPr())return '';const L=platSerahRencana().filter(x=>x.baris.length);if(!L.length)return '';
 return '<div class="pbody" id="serah-semua"><button type="button" class="btn primary" data-act="serahsemua">'+ic('outb')+'Serahkan semua ('+L.length+' SPK)</button> <span class="note">satu dokumen pengeluaran (PK) per SPK, sesuai kebutuhan plat tersisa</span></div>'}
function platSerahSemua(){
 const L=platSerahRencana();const A=L.filter(x=>x.baris.length);if(!A.length){toast('Tidak ada plate yang bisa diserahkan: stok plat utama kosong atau item bahan baku belum ada di Master Data.');return}
 try{need('mutasi',{gudang:'rm'},null,'add')}catch(e){toast('Anda tidak berhak mencatat pengeluaran bahan baku.');return}
 const tot=A.reduce((a,x)=>a+x.baris.reduce((b,r)=>b+r.q,0),0);const sebagian=L.filter(x=>!x.penuh).length;
 openModal('Serahkan semua plate ke produksi',`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>SPK</th><th>Plate</th><th class="num">Diserahkan (lbr)</th><th>Status</th></tr></thead><tbody>${L.map(x=>x.baris.length?x.baris.map((r,i)=>'<tr><td>'+(i===0?'<b>'+esc(String(x.s.no))+'</b>':'')+'</td><td>'+esc(r.label)+'</td><td class="num">'+n(r.q)+(r.q<r.butuh?' <span class="note">dari '+n(r.butuh)+'</span>':'')+'</td><td>'+(i===0?chip(x.penuh?'Penuh':'Sebagian (stok kurang)',x.penuh?'ok':'warn'):'')+'</td></tr>').join(''):'<tr><td><b>'+esc(String(x.s.no))+'</b></td><td colspan="2">stok plat utama habis</td><td>'+chip('Dilewati','crit')+'</td></tr>').join('')}</tbody></table></div><div class="note full">${A.length} dokumen PK, total ${n(tot)} lembar keluar dari Gudang Bahan Baku.${sebagian?' <b>'+sebagian+' SPK belum penuh karena stok kurang; buat PR atau tunggu penerimaan.</b>':''}</div>`+fld('Tanggal',inp('tgl',today(),'date')),
  async d=>{const tg=d.tgl||today();let doc=0;
   for(const x of A){const noDok=await nextDocNo('PK',tg);
    for(const r of x.baris)await addDoc('mutasi',{gudang:'rm',item:r.item,jenis:'keluar',delta:-r.q,tgl:tg,noDok,ref:'SPK '+x.s.no,spk:x.s._id,pihak:'Produksi',ket:'Serah terima plate ke produksi untuk SPK '+x.s.no,pr:''});
    doc++}
   toast(doc+' dokumen pengeluaran plate tersimpan');renderBody()},{submit:'Serahkan semua',done:' '});
}
function platSerahForm(id){const s=byId('spk',id),p=s&&platSpk(s);if(!p){toast('SPK ini belum punya kebutuhan plate.');return}
 const lines=p.rc.filter(r=>r.utama&&r.butuhLbr>0).map(r=>({item:r.utama.id,q:r.butuhLbr}));
 if(!lines.length){toast('Tidak ada plate yang perlu diserahkan, atau item bahan baku untuk SPK ini belum ada di Master Data.');return}
 mvForm('rm','keluar',null,null,{spk:id,lines,pihak:'Produksi',ket:'Serah terima plate ke produksi untuk SPK '+s.no})}
const matBisaPr=()=>myRole()==='admin'||myLevel('bahan-baku')==='ubah';
/* Berat real per pcs untuk item dokumen vendor/kirim: dari item dokumen bila ada, selain itu dari item SPK yang sama (nama item). */
function wRealDok(doc,it){const w=+it.w;if(w>0)return w;const s=doc&&doc.spk?byId('spk',doc.spk):null;const si=s&&(s.items||[]).find(x=>x.d===it.d);return +(si&&si.w)||0}
/* Dua total SPK: kg estimasi (plate yang diambil, tanpa qty dari stok) dan kg real (barang jadi). ada=false bila belum ada item berkg estimasi. */
function spkKgDua(s){let te=0,tr=0,ada=false;(s.items||[]).forEach(it=>{const q=+it.q||0,w=+it.w||0;tr+=q*w;te+=Math.max(0,q-ambilItem(s,it))*(+it.wEst>0?+it.wEst:w);if(+it.wEst>0)ada=true});return {te,tr,ada}}
const matSpkItems=s=>(s.items||[]).map(i=>({d:i.d,g:i.g,q:Math.max(0,(+i.q||0)-ambilItem(s,i)),w:(+i.wEst>0?+i.wEst:i.w),sudahWaste:+i.wEst>0}));
/* T5: SPK terbit => kekurangan bahan baku diminta otomatis sebagai PR (status Diajukan, bertanda otomatis).
   Aman diulang: kekurangan dihitung setelah dikurangi PR yang masih terbuka (matDipesan), jadi tidak dobel. Dilewati bila penerbit tak berhak atas bahan baku
   atau setting master/setting.prOtomatis=false; temuan tetap terlihat di Cek Data dan tombol Buat PR manual. */
/* PR draf diajukan oleh USER: statusnya menjadi Diajukan dan pengaju (diajukanBy, diajukanAt) tercatat atas nama user yang menekan Ajukan. */
async function prAjukan(id){const p=byId('pr',id);if(!p)return;
 if(p.status!=='Draf'){toast('PR ini bukan draf.');return}
 try{need('pr',{status:'Diajukan'},id,'upd')}catch(e){toast('Anda tidak berhak mengajukan PR ini.');return}
 try{await updDoc('pr',id,{status:'Diajukan',diajukanBy:ME||null,diajukanAt:new Date().toISOString()});toast((p.noPR||'PR')+' diajukan')}catch(e){toast(e.message||'Gagal mengajukan PR')}}
async function prOtomatisSpk(id,tries){
 tries=tries||0;
 try{
  if(((byId('master','setting')||{}).prOtomatis)===false)return null;
  const s=byId('spk',id);if(!s||s.status!=='Terbit'){if(tries<5)setTimeout(()=>prOtomatisSpk(id,tries+1),500);return null}
  if(!MT()||!matBisaPr())return null;
  const rc=matRencana(matSpkItems(s),{spkId:s._id,tebal:s.tebal});
  const tanpaRm=rc.filter(r=>r.status==='Tanpa item RM');
  const pr=MT().usulanPr(rc);
  if(tanpaRm.length)toast(`SPK ${s.no}: ${tanpaRm.length} bahan belum punya item di Gudang Bahan Baku, buat itemnya dulu`);
  if(!pr.length)return null;
  const t=today();const noPR=await nextDocNo('PR',t);
  const r=await addDoc('pr',{noPR,tgl:t,butuh:addDays(t,SET().leadBeli),supplier:'',items:pr.map(i=>({item:i.item,q:i.q,qTerima:0})),status:'Draf',ket:'Draf otomatis dari SPK '+s.no+' (menunggu diajukan)',spk:s._id,auto:true});
  toast(`${noPR} dibuat sebagai draf untuk kekurangan bahan baku SPK ${s.no}; buka Gudang Bahan Baku untuk mengajukan`);
  return noPR;
 }catch(e){return null}
}
function matBuatPr(){
 const pr=MT().usulanPr(matRencana(MAT.items,MAT.opt));if(!pr.length){toast('Tidak ada kekurangan.');return}
 try{need('bahan-baku')}catch(e){toast('Anda tidak berhak membuat PR bahan baku.');return}
 openModal('Buat PR untuk kekurangan material',`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>Material</th><th class="num">Qty (lbr)</th><th class="num">Kg</th></tr></thead><tbody>${pr.map(i=>`<tr><td>${esc(i.label)}</td><td class="num">${n(i.q)}</td><td class="num">${n(Math.round(i.kg))}</td></tr>`).join('')}</tbody></table></div>`+
  fld('Dibutuhkan paling lambat',inp('butuh',addDays(today(),SET().leadBeli),'date'))+fld('Catatan',inp('ket',MAT.opt.label||''),true),
  async d=>{const t=today();const noPR=await nextDocNo('PR',t);
   await addDoc('pr',{noPR,tgl:t,butuh:d.butuh||'',supplier:'',items:pr.map(i=>({item:i.item,q:i.q,qTerima:0})),status:'Diajukan',ket:d.ket||''});
   toast(`${noPR} dibuat`);renderBody()},{submit:'Buat PR',done:' '});
}

/* ---------- SPK ---------- */
T['spk']=()=>F.spk.tab==='jadwal'?`${segBtns('spk','tab',[['list','Daftar SPK'],['jadwal','Jadwal'],['berjalan','Berjalan'],['kpi','KPI & Analisa']])}${F.spk.tab==='kpi'?'':segBtns('spk','jn',[['all','Semua SPK'],['cust','SPK Customer'],['stok','SPK Stok']])}${segBtns('spk','vw',[['papan','Timeline'],['spk','Rinci per item'],['mesin','Per mesin']])}${F.spk.vw==='papan'?segBtns('spk','pr',[['14','2 minggu'],['30','1 bulan'],['90','3 bulan']]):segBtns('spk','skala',[['lebar','Detail'],['minggu','Harian'],['bulan','Ringkas']])}${F.spk.vw==='mesin'?'':segBtns('spk','fl',[['jalan','Berjalan'],['telat','Telat'],['vendor','Di vendor'],['siap','Siap kirim'],['selesai','Selesai'],['semua','Semua']])}<input class="inp search" id="q-spk" placeholder="Cari no SPK, customer, PO…" value="${esc(F.spk.q)}" data-act="q" data-view="spk"><span class="grow"></span>${F.spk.vw==='spk'?'<button class="btn ghost" data-act="jdsemua" data-v="buka">Buka semua</button><button class="btn ghost" data-act="jdsemua" data-v="lipat">Lipat semua</button>':''}${F.spk.vw==='papan'?'<span class="pb-nav"><button class="btn ghost" data-act="pbnav" data-d="-1" aria-label="Minggu sebelumnya">‹</button><button class="btn ghost" data-act="pbnav" data-d="0">Hari ini</button><button class="btn ghost" data-act="pbnav" data-d="1" aria-label="Minggu berikutnya">›</button></span>':'<button class="btn ghost" data-act="jdhariini">Ke hari ini</button>'}`:F.spk.tab==='berjalan'?`${segBtns('spk','tab',[['list','Daftar SPK'],['jadwal','Jadwal'],['berjalan','Berjalan'],['kpi','KPI & Analisa']])}${F.spk.tab==='kpi'?'':segBtns('spk','jn',[['all','Semua SPK'],['cust','SPK Customer'],['stok','SPK Stok']])}${segBtns('spk','pgd',[['ringkas','Ringkas'],['rinci','Rinci']])}${segBtns('spk','fl',[['jalan','Berjalan'],['telat','Telat'],['vendor','Di vendor'],['siap','Siap kirim'],['selesai','Selesai'],['semua','Semua']])}<input class="inp search" id="q-spk" placeholder="Cari no SPK, customer, PO…" value="${esc(F.spk.q)}" data-act="q" data-view="spk"><span class="grow"></span><button class="btn primary" data-act="newspk">${ic('plus')}SPK baru</button>`:F.spk.tab==='kpi'?`${segBtns('spk','tab',[['list','Daftar SPK'],['jadwal','Jadwal'],['berjalan','Berjalan'],['kpi','KPI & Analisa']])}${F.spk.tab==='kpi'?'':segBtns('spk','jn',[['all','Semua SPK'],['cust','SPK Customer'],['stok','SPK Stok']])}${segBtns('spk','p',[['30','30 hari'],['90','90 hari'],['bln','Bulan ini'],['all','Semua']])}<span class="grow"></span><button class="btn ghost" data-act="spktarget">Atur target</button><button class="btn ghost" data-act="doc" data-kind="kpi" data-ref="-" data-fmt="xlsx">${ic('dl')}Excel</button><button class="btn ghost" data-act="doc" data-kind="kpi" data-ref="-" data-fmt="pdf">${ic('file')}PDF</button>`:`${segBtns('spk','tab',[['list','Daftar SPK'],['jadwal','Jadwal'],['berjalan','Berjalan'],['kpi','KPI & Analisa']])}${F.spk.tab==='kpi'?'':segBtns('spk','jn',[['all','Semua SPK'],['cust','SPK Customer'],['stok','SPK Stok']])}${segBtns('spk','st',[['aktif','Aktif'],['Terlambat','Terlambat'],['Selesai','Selesai'],['','Semua']])}<input class="inp search" id="q-spk" placeholder="Cari no SPK, customer, PO…" value="${esc(F.spk.q)}" data-act="q" data-view="spk"><span class="grow"></span><button class="btn primary" data-act="newspk">${ic('plus')}SPK baru</button><button class="btn ghost" data-act="csv" data-what="spk">${ic('dl')}CSV</button>`;
B['spk']=()=>{
 if(F.spk.tab==='kpi')return spkKpiBody();
 if(F.spk.tab==='berjalan')return spkBerjalan();
 if(F.spk.tab==='jadwal')return F.spk.vw==='papan'?spkPapan():spkJadwal();
 const c=calc(),f=F.spk,q=f.q.toLowerCase();
 const xs=S.spk.filter(s=>{const x=c.spk[s._id];if(f.stage&&flow(s._id).stage!==f.stage)return false;if(f.st==='aktif'&&(x.st==='Selesai'||x.st==='Batal'))return false;if(f.st&&f.st!=='aktif'&&x.st!==f.st)return false;if(!spkJn(s))return false;if(q&&!`${s.no} ${s.customer} ${s.po} ${s.sales}`.toLowerCase().includes(q))return false;return true}).sort((a,b)=>b.no-a.no);
 const all=Object.values(c.spk);
 const summ=`<div class="summ">${chip(`${all.filter(x=>x.st!=='Selesai'&&x.st!=='Batal').length} aktif`,'info')}${chip(`${all.filter(x=>x.st==='Terlambat').length} terlambat`,'crit')}${chip(`${all.filter(x=>x.st==='Jatuh Tempo').length} jatuh tempo ≤1 hari`,'warn')}${chip(`${all.filter(x=>x.st==='Selesai').length} selesai terkirim`,'ok')}${all.some(x=>x.st==='Draft')?chip(`${all.filter(x=>x.st==='Draft').length} draft`,'plain'):''}${all.some(x=>x.st==='Batal')?chip(`${all.filter(x=>x.st==='Batal').length} batal`,'plain'):''}</div>`;
 const rows=xs.map(s=>{const x=c.spk[s._id];return `<tr class="click" data-act="openspk" data-id="${s._id}"><td class="mono"><b>${s.no}</b>${s.rev?`<div class="note">Rev.${s.rev}</div>`:''}</td><td>${fd(s.tgl)}</td><td><b>${esc(s.customer)}</b>${s.stokReq?' '+chip('SPK Stok','info'):''}<div class="note">${esc(s.po||'')}${s.sales?' · '+esc(s.sales):''}</div></td><td>${esc(s.material||'')}${s.tebal?` <span class="muted">${esc(s.tebal)}</span>`:''}<div class="note">${esc(s.type||'')}</div></td><td>${fd(s.due)}${x.late?`<div class="note" style="color:var(--crit)">+${x.late} hari</div>`:''}</td><td>${prog(x.pP)}</td><td class="num">${x.vo?`${n(x.vb)}/${n(x.vo)}`:'–'}</td><td>${prog(x.pK,x.pK>=1?'ok':x.st==='Terlambat'?'crit':'')}</td><td>${(fl=>chip(stLbl(s,fl.stage),STAGE_CLS[fl.stage]))(flow(s._id))}</td><td>${stChip(x.st)}${platChip(s._id)}</td></tr>`}).join('');
 return `<section class="panel"><div class="pbody">${summ}${f.stage?` <span class="chip info sel">Posisi: ${esc(f.stage)} <button class="linkbtn" data-act="spkstage" data-st="">hapus filter</button></span>`:''}</div>${xs.length?`<div class="tbl-wrap"><table><thead><tr><th>SPK</th><th>Tanggal</th><th>Customer / PO</th><th>Material</th><th>Due date</th><th>Produksi</th><th class="num">Vendor kembali</th><th>Terkirim / masuk gudang</th><th>Posisi</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`:empty('Tidak ada SPK yang cocok','Ubah filter atau buat SPK baru.')}</section>`;
};

/* ---------- SPK Berjalan: matriks posisi tiap item di setiap langkah (pantau sekilas) ---------- */
const pgPersen=v=>Math.round(Math.max(0,Math.min(1,v))*100);
function pgItems(s,x,ses){
 const P=PXL(),t=today();
 return (s.items||[]).map((it,ix)=>{
  const qq=+it.q||0,l=x.lines[ix]||{},st=itemState(s,it,ix);
  if(!st)return {it,ix,q:qq,tanpaRute:true};
  const steps=st.rute.map((w,i)=>{const vend=P.langkahVendor(w);const mine=ses.filter(e=>e.spk_id===s._id&&+e.item_idx===ix&&P.indeksLangkah(st.rute,st.alt,e.wc)===i);return {w,i,vend,key:vend?'Vendor':w,val:Math.min(st.kum[w]||0,qq),out:vend?(st.vendorKirim[w]||0):0,live:mine.length>0,mesin:[...new Set(mine.map(e=>e.mesin||e.wc))]}});
  const kir=Math.min(l.kirim||0,qq);const cur=steps.find(z=>z.val<qq);
  const evs=evIdx()[s._id+'|'+ix]||[];const last=evs.reduce((m,e)=>{const d=evTgl(e);return d&&d>m?d:m},'');
  let pos,label,nada;
  if(cur){pos=cur.key;if(cur.vend){label=cur.out>cur.val?'Di '+cur.w:'Menunggu '+cur.w;nada=cur.out>cur.val?'warn':'plain'}else{const mulai=cur.live||cur.val>0;label=(mulai?'Di ':'Antri di ')+cur.w;nada=mulai?'run':'plain'}}
  else if(kir>=qq&&qq>0){pos='Terkirim';label=s.stokReq?'Masuk gudang barang jadi':'Terkirim ke customer';nada='ok'}
  else{pos='Siap kirim';label=s.stokReq?'Siap masuk gudang':'Siap kirim';nada='info'}
  const diam=(cur&&last&&!steps.some(z=>z.live))?Math.max(0,days(last,t)):0;
  return {it,ix,q:qq,stok:!!s.stokReq,steps,kir,cur,pos,label,nada,diam,pct:qq?Math.min(1,(l.prodEff||0)/qq):0};
 });
}
function pgKolom(daftar){
 const wcNama=wcInternal().map(w=>w.nama);const ada=new Set();
 daftar.forEach(i=>(i.steps||[]).forEach(z=>ada.add(z.key)));
 return [...wcNama.filter(k=>ada.has(k)),...[...ada].filter(k=>k!=='Vendor'&&!wcNama.includes(k)),...(ada.has('Vendor')?['Vendor']:[]),'Kirim'];
}
function pgSel(val,qq,o={}){
 const pc=qq?pgPersen(val/qq):0;const st=qq>0&&val>=qq?'ok':val>0?'run':'wait';
 return `<div class="pg-c ${st}${o.cur?' cur':''}${o.live?' live':''}" title="${esc(o.tip||'')}"><div class="pg-n"><b class="pg-q">${n(val)}</b><span>/ ${n(qq)}</span><b class="pg-pc">${pc}%</b>${st==='ok'?'<em class="pg-ck">✓</em>':o.live?'<em class="pg-lv"></em>':''}</div><i class="pg-b"><u style="width:${pc}%"></u></i><small>${o.sub||(st==='wait'?'belum mulai':'')}</small></div>`;
}
function pgBaris(i,kolom){
 if(i.tanpaRute)return `<div class="pg-r pg-nr"><div class="pg-it"><b>${esc(i.it.d)}</b><small>${n(i.q)} ${esc(i.it.u||'')}</small></div><div class="pg-note">Rute belum dikenali. Pastikan judul section SPK memuat produk.</div></div>`;
 const P=PXL();
 const info=`<div class="pg-it"><b title="${esc(i.it.d)}">${esc(i.it.d)}</b><small>${n(i.q)} ${esc(i.it.u||'')} · ${i.cur?`langkah ${i.steps.indexOf(i.cur)+1} dari ${i.steps.length}`:'semua langkah selesai'}</small><div class="pg-tg"><span class="pg-pos ${i.nada}">${esc(i.label)}</span>${i.diam>=2?`<span class="pg-dm ${i.diam>=4?'crit':'warn'}" title="Tidak ada catatan produksi baru sejak ${esc(fdp2(P.geserHari(today(),-i.diam)))}">Diam ${i.diam} hari</span>`:''}</div></div>`;
 const sel=kolom.map(k=>{
  if(k==='Kirim'){const kk=i.kir,cur=i.pos==='Siap kirim';return pgSel(kk,i.q,{cur,tip:i.stok?`Masuk gudang barang jadi ${n(kk)} dari ${n(i.q)}`:`Terkirim ke customer ${n(kk)} dari ${n(i.q)}`,sub:i.stok?(kk>=i.q&&i.q>0?'diterima di gudang barang jadi':kk>0?'masuk sebagian':(i.pos==='Siap kirim'?'siap masuk gudang':'menunggu produksi')):(kk>=i.q&&i.q>0?'surat jalan customer':kk>0?'kirim sebagian':(i.pos==='Siap kirim'?'siap dikirim':'menunggu produksi'))})}
  const z=i.steps.find(z=>z.key===k);if(!z)return '<div class="pg-c none" title="Tidak ada di rute item ini">–</div>';
  const sub=z.vend?(z.out?`dikirim ${n(z.out)}`:'belum dikirim'):(z.live?'berjalan'+(z.mesin.length?' · '+esc(z.mesin.join(', ')):''):'');
  return pgSel(z.val,i.q,{cur:i.cur===z,live:z.live,sub,tip:`${z.w}: ${n(z.val)} dari ${n(i.q)}${z.vend?' (kembali dari vendor, dikirim '+n(z.out)+')':''}${z.live?' · sedang dikerjakan':''}`})}).join('');
 return `<div class="pg-r">${info}${sel}</div>`;
}
const pgMatriks=(items,kolom)=>`<div class="pg-r pg-hd"><div class="pg-it">Item</div>${kolom.map(k=>`<div class="pg-h">${esc(k==='Kirim'&&items.some(i=>i.stok)?'Kirim / masuk gudang':k)}</div>`).join('')}</div>${items.map(i=>pgBaris(i,kolom)).join('')}`;

function spkBerjalan(){
 const P=PXL();const c=calc(),f=F.spk,q=(f.q||'').toLowerCase(),t=today();
 const semua=S.spk.filter(s=>{const x=c.spk[s._id];return x&&x.st!=='Draft'&&x.st!=='Batal'&&spkJn(s)});
 const stage=s=>(flow(s._id)||{}).stage||'';
 const jenis=s=>{const x=c.spk[s._id];if(x.st==='Selesai')return 'selesai';if(x.st==='Terlambat')return 'telat';const g=stage(s);if(/vendor/.test(g))return 'vendor';if(g==='Siap kirim'||g==='Kirim sebagian')return 'siap';return 'jalan'};
 const cocok=(s,k)=>k==='semua'||(k==='jalan'?c.spk[s._id].st!=='Selesai':k==='telat'?c.spk[s._id].st==='Terlambat':k==='vendor'?/vendor/.test(stage(s)):k==='siap'?(stage(s)==='Siap kirim'||stage(s)==='Kirim sebagian'):c.spk[s._id].st==='Selesai');
 const hit=k=>semua.filter(s=>cocok(s,k)).length;
 const kp=`<div class="kpi-row"><div class="kpi info"><span class="lb">SPK berjalan</span><span class="v">${hit('jalan')}</span><span class="s">belum selesai</span></div><div class="kpi ${hit('telat')?'crit':'ok'}"><span class="lb">Telat</span><span class="v">${hit('telat')}</span><span class="s">lewat due date</span></div><div class="kpi warn"><span class="lb">Di vendor</span><span class="v">${hit('vendor')}</span><span class="s">sedang finishing</span></div><div class="kpi ok"><span class="lb">Siap kirim</span><span class="v">${hit('siap')}</span><span class="s">produksi selesai, belum terkirim</span></div></div>`;
 const xs=semua.filter(s=>cocok(s,f.fl||'jalan')&&(!q||(s.no+' '+s.customer+' '+(s.po||'')).toLowerCase().includes(q)))
  .sort((a,b)=>{const ra=jenis(a)==='telat'?0:1,rb=jenis(b)==='telat'?0:1;return ra-rb||(a.due||'9999').localeCompare(b.due||'9999')||b.no-a.no});
 const ses=P?P.sesiAktifSemua(S.produksi_log||[]):[];
 const fdp=d=>String(fd(d)).replace(/&nbsp;/g,' ');
 if(!P||!xs.length)return kp+empty('Tidak ada SPK di filter ini','Ganti filter di atas, atau buat SPK baru.');
 const data=new Map(xs.map(s=>[s._id,pgItems(s,c.spk[s._id],ses)]));
 const semuaItem=[...data.values()].flat();
 const kolom=pgKolom(semuaItem);
 const urutPos=[...kolom.filter(k=>k!=='Kirim'),'Siap kirim'];
 const hitung={};semuaItem.forEach(i=>{if(i.pos&&i.pos!=='Terkirim')hitung[i.pos]=(hitung[i.pos]||0)+1});
 const nDiam=semuaItem.filter(i=>i.diam>=2).length;
 const strip=urutPos.map(k=>`<button type="button" class="pg-pill${f.pos===k?' on':''}${hitung[k]?'':' nol'}" data-act="pgpos" data-p="${esc(k)}"><b>${hitung[k]||0}</b><span>${esc(k)}</span></button>`).join('');
 const atas=`<div class="pg-top"><div class="pg-strip"><span class="pg-lb">Posisi item sekarang</span>${strip}${f.pos?`<button type="button" class="linkbtn" data-act="pgpos" data-p="">hapus filter</button>`:''}${nDiam?chip(nDiam+' item diam 2 hari atau lebih','warn'):''}</div></div>`;
 const rg=f.pgd==='rinci'?'':' rg';
 const kartu=(s,i)=>{const x=c.spk[s._id];const j=jenis(s);const due=s.due||'';
  const items=data.get(s._id).filter(it=>!f.pos||it.pos===f.pos);if(f.pos&&!items.length)return '';
  const dueC=!due?'':x.st==='Selesai'?'':due<t?chip('Telat · '+fdp(due),'crit'):due===t?chip('Due hari ini','warn'):chip('Due '+fdp(due),'plain');
  const sek=ses.filter(e=>e.spk_id===s._id);
  const sekTeks=sek.length?`<div class="sb-now">${chip('Sedang dikerjakan','warn')} ${sek.map(e=>`${esc(e.mesin||e.wc)}${e.operator?' ('+esc(e.operator)+')':''}`).join(' · ')}</div>`:'';
  const pct=Math.round((x.pP||0)*100)||0;
  return `<section class="panel sb-card t-${j}"><div class="pbody">
   <div class="sb-h" data-act="openspk" data-id="${s._id}"><div><b class="sb-no">SPK ${esc(String(s.no))}</b> <span class="sb-cust">${esc(s.customer)}</span><div class="note">${esc(s.po||'')} · ${s.items.length} item</div></div><div class="sb-chips">${dueC}${j==='selesai'?chip('Selesai','ok'):chip(stage(s)||x.st,STAGE_CLS[stage(s)]||'plain')}</div></div>
   <div class="sb-bar"><div class="jb"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>
   ${sekTeks}
   <details class="sb-det"${sek.length||j==='vendor'||i<3||f.pos?' open':''}><summary>Posisi tiap item di setiap langkah</summary><div class="pg${rg}" style="--pg-n:${kolom.length}"><div class="pg-sc">${pgMatriks(items,kolom)}</div></div></details></div></section>`};
 const isi=xs.map(kartu).join('');
 return kp+atas+(isi||empty('Tidak ada item di posisi ini','Hapus filter posisi di atas.'))+`<div class="note gt-note">Tiap baris adalah satu item SPK; tiap kolom adalah satu langkah. Angka menunjukkan jumlah yang sudah lewat langkah itu dibanding jumlah di SPK. Kolom bercincin biru adalah posisi item sekarang. Terisi sendiri dari catatan produksi, vendor, dan pengiriman; tidak ada isian di halaman ini. Untuk melihat kapan tiap langkah dijadwalkan, buka tab Jadwal.</div>`;
}

/* ---------- Jadwal > Timeline: satu batang per SPK, bersih (rincian per work center ada di tab Berjalan) ---------- */
let PBX=[];
function spkPapan(){
 const P=PXL();if(!P||!P.susunRencana)return empty('Timeline belum siap','Muat ulang halaman.');
 const c=calc(),f=F.spk,t=today(),q=(f.q||'').toLowerCase();
 const semua=S.spk.filter(s=>{const x=c.spk[s._id];return x&&x.st!=='Draft'&&x.st!=='Batal'&&spkJn(s)});
 const stage=s=>(flow(s._id)||{}).stage||'';
 const cocok=(s,k)=>{const x=c.spk[s._id];return k==='semua'||(k==='jalan'?x.st!=='Selesai':k==='telat'?x.st==='Terlambat':k==='vendor'?/vendor/.test(stage(s)):k==='siap'?(stage(s)==='Siap kirim'||stage(s)==='Kirim sebagian'):x.st==='Selesai')};
 const tampil=semua.filter(s=>cocok(s,f.fl||'jalan')&&(!q||(s.no+' '+s.customer+' '+(s.po||'')).toLowerCase().includes(q)));
 // perkiraan siap kirim: semua SPK aktif dijadwalkan bersama (kapasitas dan due date), hanya hasilnya yang ditampilkan
 const itemR=[];
 semua.filter(s=>c.spk[s._id].st!=='Selesai').forEach(s=>(s.items||[]).forEach((it,ix)=>{
  const st=itemState(s,it,ix);if(!st)return;const l=c.spk[s._id].lines[ix]||{};const qq=+it.q||0;
  itemR.push({key:s._id+'|'+ix,spkId:s._id,no:s.no,customer:s.customer,due:s.due||'',idx:ix,d:it.d,u:it.u,q:qq,kir:Math.min(l.kirim||0,qq),
   steps:st.rute.map(w=>{const v=P.langkahVendor(w);return {w,vend:v,val:Math.min(st.kum[w]||0,qq),out:v?(st.vendorKirim[w]||0):0}})})}));
 const R=P.susunRencana({item:itemR,kapasitas:kapWC(),hariIni:t,tatVendor:3});
 PBX=[];PBX.R=R;PBX.items=itemR;
 const reg=o=>PBX.push(o)-1;
 // rentang waktu
 const nHari=+(f.pr||14);
 const sen0=P.geserHari(t,-((new Date(t+'T00:00:00Z').getUTCDay()+6)%7));
 const awal=P.geserHari(sen0,(nHari>14?-7:0)+7*(f.mg||0));
 const akhir=P.geserHari(awal,nHari-1);
 const BLN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],HR=['M','S','S','R','K','J','S'];
 const dow=d=>new Date(d+'T00:00:00Z').getUTCDay();
 const we=d=>dow(d)===0||dow(d)===6;
 const tp=d=>+d.slice(8)+' '+BLN[+d.slice(5,7)-1];
 const pct=d=>P.selisihHari(awal,d)/nHari*100;
 const hari=Array.from({length:nHari},(_,i)=>P.geserHari(awal,i));
 const sat=100/nHari;
 // sumbu
 const hdr=nHari<=21
  ?hari.map((d,i)=>`<span class="tl-dy${we(d)?' we':''}${d===t?' now':''}" style="left:${i*sat}%;width:${sat}%"><small>${HR[dow(d)]}</small><b>${+d.slice(8)}</b></span>`).join('')
  :hari.map((d,i)=>dow(d)===1?`<span class="tl-tk" style="left:${i*sat}%">${tp(d)}</span>`:'').join('');
 const bulan=[];hari.forEach((d,i)=>{const k=d.slice(0,7);const l=bulan[bulan.length-1];if(l&&l.k===k)l.n++;else bulan.push({k,n:1,i})});
 const hdBln=bulan.map(b=>`<span class="tl-mo" style="left:${b.i*sat}%;width:${b.n*sat}%">${b.n*sat<14?BLN[+b.k.slice(5)-1]:BLN[+b.k.slice(5)-1]+' '+b.k.slice(0,4)}</span>`).join('');
 const akhw=hari.map((d,i)=>we(d)?`<i class="tl-we" style="left:${i*sat}%;width:${sat}%"></i>`:'').join('');
 const garisHariIni=t>=awal&&t<=akhir?`<i class="tl-now" style="left:${pct(t)+sat/2}%" title="Hari ini ${fdp2(t)}"></i>`:'';
 // baris
 const stat=s=>{const r=R.spk[s._id];if(c.spk[s._id].st==='Selesai')return 'selesai';return r?r.status:'aman'};
 const TEKS={telat:['Berisiko telat','crit'],mepet:['Mepet due','warn'],aman:['Aman','ok'],selesai:['Selesai','ok']};
 const urut=[...tampil].sort((a,b)=>{const u={telat:0,mepet:1,aman:2,selesai:3};return u[stat(a)]-u[stat(b)]||(a.due||'9999').localeCompare(b.due||'9999')||a.no-b.no});
 const akhirKirim=s=>S.kirim.filter(k=>k.spk===s._id&&k.status!=='Batal').reduce((m,k)=>{const d=k.tglTerima||k.tgl||'';return d>m?d:m},'');
 const baris=urut.map(s=>{
  const st=stat(s),r=R.spk[s._id]||{},x=c.spk[s._id],pc=pgPersen(x.pP||0);
  const mulai=s.tgl||t;
  const selesai=st==='selesai'?(akhirKirim(s)||s.due||t):(r.perkiraan||s.due||t);
  const akhirBar=selesai<mulai?mulai:selesai;
  const i=reg({k:'spk',spkId:s._id,no:s.no});
  const [stT,stC]=TEKS[st];
  const sisa=!s.due||st==='selesai'?'':(()=>{const d=days(t,s.due);return d<0?(-d)+' hari lewat due':d===0?'due hari ini':d+' hari lagi'})();
  const kiri=`<div class="tl-nm" data-act="pbcard" data-i="${i}"><b class="tl-cu" title="${esc(s.customer)}">${esc(s.customer)}</b><span class="tl-sub">SPK ${esc(String(s.no))}${s.po?' · '+esc(s.po):''}</span><div class="tl-st">${chip(stT,stC)}<small>${s.due?'Due '+tp(s.due)+(sisa?' · '+sisa:''):'tanpa due date'}</small></div></div>`;
  let isi='';
  const keluar=akhirBar<awal?'◂ sebelum rentang ini':mulai>akhir?'setelah rentang ini ▸':'';
  if(keluar)isi=`<span class="tl-out">${keluar}</span>`;
  else{
   const a=mulai<awal?awal:mulai,b=akhirBar>akhir?akhir:akhirBar;
   const lebar=Math.max(sat,(P.selisihHari(a,b)+1)*sat);
   const tip=`SPK ${s.no} · ${s.customer} · ${stT} · progres ${pc}%${st==='selesai'?'':(r.perkiraan?' · siap kirim sekitar '+fdp2(r.perkiraan):'')}${s.due?' · due '+fdp2(s.due):''}`;
   let late='';
   if(s.due&&st!=='selesai'&&akhirBar>s.due){const dueIdx=Math.max(0,P.selisihHari(a,s.due)+1),tot=P.selisihHari(a,b)+1;if(dueIdx<tot)late=`<u class="tl-lt" style="left:${dueIdx/tot*100}%;right:0"></u>`}
   let slack='';
   if(s.due&&st!=='selesai'&&r.perkiraan&&r.perkiraan<s.due){const sa=P.geserHari(r.perkiraan,1),sb=s.due>akhir?akhir:s.due;if(sa<=akhir&&sb>=awal&&sa<=sb){const l0=sa<awal?awal:sa;slack=`<span class="tl-slack" style="left:${pct(l0)}%;width:${(P.selisihHari(l0,sb)+1)*sat}%"></span>`}}
   const flag=s.due&&s.due>=awal&&s.due<=akhir?`<i class="tl-due${st!=='selesai'&&akhirBar>s.due?' late':''}" style="left:${pct(s.due)+sat}%" title="Due ${fdp2(s.due)}"><span>⚑</span></i>`:'';
   isi=`${slack}<button type="button" class="tl-bar ${st}${mulai<awal?' dari':''}${akhirBar>akhir?' ke':''}" style="left:${pct(a)}%;width:${lebar}%" data-act="pbcard" data-i="${i}" title="${esc(tip)}"><i style="width:${pc}%"></i>${late}<em>${lebar>=sat*3?pc+'%':''}</em></button>${flag}`;
  }
  return `<div class="tl-r">${kiri}<div class="tl-tr">${isi}</div></div>`}).join('');
 const hit=k=>urut.filter(s=>stat(s)===k).length;
 const label=tp(awal)+' – '+tp(akhir)+' '+akhir.slice(0,4);
 const ringkas=`<div class="pb-top"><div class="pb-title"><b>${label}</b><span class="muted">${f.mg?' · '+(f.mg>0?'+':'')+f.mg+' minggu dari sekarang':' · mulai minggu ini'}</span></div><div class="gt-sum">${chip(urut.length+' SPK','info')}${hit('telat')?chip(hit('telat')+' berisiko telat','crit'):chip('Tidak ada yang berisiko telat','ok')}${hit('mepet')?chip(hit('mepet')+' mepet due','warn'):''}</div></div>`;
 const legenda=`<div class="gt-leg"><span><i class="tl-lg aman"></i>Aman</span><span><i class="tl-lg mepet"></i>Mepet due date</span><span><i class="tl-lg selesai"></i>Selesai</span><span><i class="tl-lg late"></i>Bagian melewati due date (berisiko telat)</span><span>⚑ Due date</span><span>Isi batang = progres produksi</span></div>`;
 const tanpa=R.tanpaKap.length?`<div class="note">Kapasitas belum diatur untuk ${R.tanpaKap.map(esc).join(', ')}, sehingga perkiraan memakai satu hari per langkah. Isi di Master Data, Work Centre.</div>`:'';
 const papan=urut.length?`<section class="panel tlboard"><div class="tl-sc" id="pb-sc"><div class="tl-in"><div class="tl-r tl-hd"><div class="tl-nm tl-hn">SPK dan customer</div><div class="tl-tr"><div class="tl-h1">${hdBln}</div><div class="tl-h2">${hdr}</div></div></div><div class="tl-body"><div class="tl-ov">${akhw}${garisHariIni}</div>${baris}</div></div></div></section>`:empty('Tidak ada SPK di filter ini','Ganti filter di atas, atau buat SPK baru.');
 return `${ringkas}${papan}${legenda}${tanpa}<div class="note gt-note">Satu batang = satu SPK, dari terbit sampai perkiraan siap kirim (dihitung otomatis dari kapasitas work center dan urutan due date). Garis putus = sisa waktu sampai due date. Ketuk batang atau nama untuk ringkasan; posisi tiap item di setiap work center ada di tab Berjalan.</div>`;
}
function pbDetail(o){
 const s=byId('spk',o.spkId);if(!s)return;
 const c=calc(),x=c.spk[s._id],R=PBX.R||{spk:{}},r=R.spk[s._id]||{status:'aman'};
 const st=x.st==='Selesai'?'selesai':r.status;
 const [stT,stC]={telat:['Berisiko telat','crit'],mepet:['Mepet due date','warn'],aman:['Aman','ok'],selesai:['Selesai','ok']}[st];
 const ses=PXL().sesiAktifSemua(S.produksi_log||[]);
 const its=pgItems(s,x,ses);
 const baris=its.map(i=>i.tanpaRute?`<div class="gt-dit"><div class="gt-dih"><b>${esc(i.it.d)}</b><span>${n(i.q)} ${esc(i.it.u||'')}</span></div><div class="note">Rute belum dikenali.</div></div>`
  :`<div class="gt-dit"><div class="gt-dih"><b>${esc(i.it.d)}</b><span>${n(i.q)} ${esc(i.it.u||'')}</span></div><div class="jb"><i style="width:${pgPersen(i.pct)}%"></i></div><div class="gt-dst"><span class="pg-pos ${i.nada}">${esc(i.label)}</span>${i.diam>=2?`<span class="pg-dm ${i.diam>=4?'crit':'warn'}">Diam ${i.diam} hari</span>`:''}</div></div>`).join('');
 openDrawer(()=>({t:`SPK ${esc(String(s.no))}`,s:`${esc(s.customer)} ${chip(stT,stC)}`,b:`<div class="gt-dd">${gtKv('Progres produksi',pgPersen(x.pP||0)+'%')}${gtKv('Terkirim',pgPersen(x.pK||0)+'%')}${gtKv('Terbit',s.tgl?fdp2(s.tgl):'–')}${gtKv('Due date',s.due?fdp2(s.due):'–')}${gtKv('Perkiraan siap kirim',r.perkiraan?fdp2(r.perkiraan):'–')}${r.selisih==null?'':gtKv('Selisih terhadap due',r.selisih<0?(-r.selisih)+' hari lewat':r.selisih+' hari tersisa')}<h4 class="gt-dh">Item</h4>${baris||'<div class="note">SPK belum punya item.</div>'}<div class="gt-act"><button class="btn primary" data-act="openspk" data-id="${s._id}">Buka SPK</button><button class="btn" data-act="pbjalan" data-q="${esc(String(s.no))}">Lihat posisi di Berjalan</button></div></div>`}));
}


/* ---------- Jadwal SPK (Gantt): garis waktu tiap SPK dari terbit, produksi, vendor, kirim sampai due date ---------- */
function spkJadwal(){
 const P=PXL();if(!P||!P.susunJadwal)return empty('Papan jadwal belum siap','Muat ulang halaman.');
 const c=calc(),f=F.spk,q=(f.q||'').toLowerCase(),t=today();
 const semua=S.spk.filter(s=>{const x=c.spk[s._id];return x&&x.st!=='Draft'&&x.st!=='Batal'&&spkJn(s)});
 const stage=s=>(flow(s._id)||{}).stage||'';
 const cocok=(s,k)=>{const x=c.spk[s._id];return k==='semua'||(k==='jalan'?x.st!=='Selesai':k==='telat'?x.st==='Terlambat':k==='vendor'?/vendor/.test(stage(s)):k==='siap'?(stage(s)==='Siap kirim'||stage(s)==='Kirim sebagian'):x.st==='Selesai')};
 const pilih=semua.filter(s=>cocok(s,f.fl||'jalan')&&(!q||(s.no+' '+s.customer+' '+(s.po||'')).toLowerCase().includes(q)))
  .sort((a,b)=>(a.tgl||'').localeCompare(b.tgl||'')||a.no-b.no);
 const mesinView=f.vw==='mesin';
 const GT=[];const reg=o=>GT.push(o)-1;
 const ta=(tip,o)=>`data-act="gtbar" data-i="${typeof o==='number'?o:reg(o)}" data-tip="${esc(tip)}" tabindex="0"`;
 if(!pilih.length&&!mesinView)return empty('Tidak ada SPK di filter ini','Ganti filter di atas, atau buat SPK baru.');
 const ses=P.sesiAktifSemua(S.produksi_log||[]);
 const aktifSpk=new Set(ses.map(e=>e.spk_id));
 const aktifItem=new Set(ses.map(e=>e.spk_id+'|'+e.item_idx));
 const spk=pilih.map(s=>{const x=c.spk[s._id];return {id:s._id,no:s.no,customer:s.customer,tgl:s.tgl,due:s.due,pP:x.pP||0,pK:x.pK||0,
  items:(s.items||[]).map((it,idx)=>{const pe=prodFromEvents(s,it,idx);const qty=+it.q||0;return {idx,d:it.d,q:qty,u:it.u,pct:pe!=null?pe:(qty?Math.min(1,(+it.prod||0)/qty):0),sedang:aktifItem.has(s._id+'|'+idx)}})}});
 const vend=S.vendor.map(v=>{const last=(v.riwayat||[]).slice(-1)[0];const sel=v.status==='Selesai';return {spk:v.spk,vendor:v.vendor,tgl:v.tgl,status:v.status,tglKembali:sel?((last&&last.tgl)||String(v.updAt||'').slice(0,10)||null):null}});
 const kir=S.kirim.map(k=>({spk:k.spk,tgl:k.tgl,tglTerima:k.tglTerima||null,status:k.status}));
 const J=P.susunJadwal({spk,kejadian:evData(),vendor:vend,kirim:kir,hariIni:t,aktif:aktifSpk,sesi:ses});
 // papan per mesin
 const wcUrut=S.mwc.filter(w=>w.aktif!==false).sort((a,b)=>a.urutan-b.urutan);
 const wcKelas=nm=>{const i=wcUrut.findIndex(w=>w.nama===nm);return 'wc'+((i<0?wcUrut.length:i)%8)};
 let M=null;
 if(mesinView){const info={};S.spk.forEach(s=>{info[s._id]={no:s.no,customer:s.customer,items:Object.fromEntries((s.items||[]).map((it,i)=>[i,it.d]))}});
  M=P.susunMesin({kejadian:evData(),sesi:ses,mesinMaster:wcUrut.map(w=>({wc:w.nama,mesin:mesinWC(w.nama).map(m=>m.nama)})),info,hariIni:t})}
 // sumbu waktu
 const titik=[...(mesinView?M.titik:[]),...J.baris.flatMap(b=>[b.terbit,b.due,b.perkiraan,b.prod&&b.prod.dari,b.prod&&b.prod.sampai,b.vendor&&b.vendor.sampai,b.kirim&&b.kirim.sampai]),t,P.geserHari(t,7)].filter(Boolean).sort();
 const awal=P.geserHari(titik[0],-1),akhir=P.geserHari(titik[titik.length-1],2);const hari=P.selisihHari(awal,akhir)+1;
 const bulan=f.skala==='bulan',px=bulan?12:f.skala==='lebar'?64:38,lebar=hari*px;
 const kiri=d=>P.selisihHari(awal,d)*px,lbr=(a,b)=>(P.selisihHari(a,b)+1)*px;
 const BLNP=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],BLNF=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],HR=['M','S','S','R','K','J','S'];
 const hariList=Array.from({length:hari},(_,i)=>P.geserHari(awal,i));
 const dow=d=>new Date(d+'T00:00:00Z').getUTCDay();
 const bandBulan=[];hariList.forEach((d,i)=>{const k=d.slice(0,7);const l=bandBulan[bandBulan.length-1];if(l&&l.k===k)l.n++;else bandBulan.push({k,n:1,i,d})});
 const hdBulan=bandBulan.map(b=>`<span class="gt-mo" style="left:${b.i*px}px;width:${b.n*px}px">${b.n*px<80?BLNP[+b.k.slice(5)-1]:BLNF[+b.k.slice(5)-1]+' '+b.k.slice(0,4)}</span>`).join('');
 const hdHari=bulan?P.sumbuTanggal(awal,akhir,'minggu').map(s=>`<span class="gt-tk" style="left:${s.i*px}px">${+s.tgl.slice(8)}</span>`).join(''):hariList.map((d,i)=>`<span class="gt-dy${P.hariKerjaAkhirPekan(d)?' we':''}${d===t?' now':''}" style="left:${i*px}px;width:${px}px"><small>${HR[dow(d)]}</small><b>${+d.slice(8)}</b></span>`).join('');
 const grid=hariList.map((d,i)=>(bulan?d.slice(8)==='01':dow(d)===1)?`<i class="gt-gl" style="left:${i*px}px"></i>`:'').join('');
 const wkend=hariList.map((d,i)=>P.hariKerjaAkhirPekan(d)?`<i class="gt-we" style="left:${i*px}px;width:${px}px"></i>`:'').join('');
 const garisHariIni=`<i class="gt-now" style="left:${kiri(t)+px/2}px" title="Hari ini ${fdp2(t)}"></i>`;
 const bar=(seg,cls,teks,tip,o)=>seg?`<span class="gt-b ${cls}" style="left:${kiri(seg.dari)}px;width:${Math.max(px,lbr(seg.dari,seg.sampai))}px" ${ta(tip,o)}>${teks||''}</span>`:'';
 const rowH=b=>{
  const si=reg({k:'spk',b,pK:(c.spk[b.id]||{}).pK||0});
  const plan=b.due?`<span class="gt-b plan" style="left:${kiri(b.terbit)}px;width:${Math.max(px,lbr(b.terbit,b.due))}px" ${ta('Rencana: '+fdp2(b.terbit)+' sampai '+fdp2(b.due)+' (due)',si)}></span>`:'';
  const pr=b.prod?`<span class="gt-b prod${b.sedang?' live':''}" style="left:${kiri(b.prod.dari)}px;width:${Math.max(px,lbr(b.prod.dari,b.prod.sampai))}px" ${ta('Produksi '+fdp2(b.prod.dari)+' sampai '+fdp2(b.prod.sampai)+' · '+Math.round(b.pP*100)+'%',si)}><i style="width:${Math.round(b.pP*100)}%"></i>${lbr(b.prod.dari,b.prod.sampai)>=48?`<em>${Math.round(b.pP*100)}%</em>`:''}</span>`:'';
  const ve=bar(b.vendor,'vend'+(b.vendor&&b.vendor.terbuka?' open':''),b.vendor&&lbr(b.vendor.dari,b.vendor.sampai)>=70?`<em>${esc(b.vendor.nama)}</em>`:'',`Vendor ${b.vendor?b.vendor.nama:''}: ${b.vendor?fdp2(b.vendor.dari)+' sampai '+fdp2(b.vendor.sampai):''}`,si);
  const ki=bar(b.kirim,'kirim',b.kirim&&lbr(b.kirim.dari,b.kirim.sampai)>=60?'<em>Kirim</em>':'',`Pengiriman ${b.kirim?fdp2(b.kirim.dari)+' sampai '+fdp2(b.kirim.sampai):''}`,si);
  const dueM=b.due?`<i class="gt-due${b.telat?' late':''}" style="left:${kiri(b.due)+px-2}px" ${ta('Due '+fdp2(b.due),si)}></i>`:'';
  const pk=b.perkiraan?`<i class="gt-est${b.risiko?' risk':''}" style="left:${kiri(b.perkiraan)+px/2}px" ${ta('Perkiraan selesai '+fdp2(b.perkiraan)+(b.risiko?' (melewati due date)':''),si)}></i>`:'';
  return plan+pr+ve+ki+dueM+pk;
 };
 const STL={selesai:['Selesai','ok'],telat:['Telat','crit'],risiko:['Berisiko telat','warn'],jalan:['Berjalan','info'],belum:['Belum mulai','plain']};
 const tutup=f.tutup||(f.tutup={});
 const langkahBar=(b,it,l)=>{const qy=it.q||0,pc=qy?Math.min(1,l.qty/qy):0,w=Math.max(px,lbr(l.dari,l.sampai));
  return `<span class="gt-b step ${wcKelas(l.wc)}${l.live?' live':''}" style="left:${kiri(l.dari)}px;width:${w}px" ${ta(l.wc+(l.mesin.length?' · '+l.mesin.join(', '):'')+' · '+fdp2(l.dari)+(l.dari!==l.sampai?' sampai '+fdp2(l.sampai):'')+' · '+n(l.qty)+' dari '+n(qy)+(l.reject?' · reject '+n(l.reject):''),{k:'step',b,it,l})}><i style="width:${Math.round(pc*100)}%"></i><em>${w>=64?esc(l.wc)+(w>=104?' · '+n(l.qty):''):''}</em></span>`};
 let rows='';
 if(!mesinView){
  rows=J.baris.map(b=>{
   const [stT,stC]=STL[b.status];const buka=!tutup[b.id];const pct=Math.round(b.pP*100);
   const sisa=b.sisaHari==null?'':b.sisaHari<0?`<span class="gt-sisa crit">${-b.sisaHari} hr lewat</span>`:b.sisaHari===0?'<span class="gt-sisa warn">due hari ini</span>':`<span class="gt-sisa">${b.sisaHari} hr lagi</span>`;
   const head=`<div class="gt-nm" data-act="jdbuka" data-id="${b.id}"><span class="gt-car">${buka?'▾':'▸'}</span><div><b>SPK ${esc(String(b.no))}</b>${b.sedang?' <span class="gt-dot" title="Sedang dikerjakan"></span>':''}<div class="note">${esc(b.customer)}</div></div><span class="gt-pct">${pct}%</span></div>`;
   const sub=buka?b.items.map(it=>{const aktif=it.wcAktif&&it.wcAktif.length?' · di '+esc(it.wcAktif.join(', ')):' · dikerjakan';
    return `<div class="gt-row gt-it"><div class="gt-nm gt-nm-it"><div><span class="gt-itd">${esc(it.d)}</span><div class="note">${n(it.q)} ${esc(it.u||'')} · ${Math.round(it.pct*100)}%${it.sedang?`<b class="gt-live">${aktif}</b>`:''}</div></div></div><div class="gt-tr" style="width:${lebar}px">${it.langkah.length?it.langkah.map(l=>langkahBar(b,it,l)).join(''):`<span class="gt-b none" style="left:${kiri(t)}px;width:${px*2}px" title="Belum dikerjakan"></span>`}</div></div>`}).join(''):'';
   return `<div class="gt-row gt-spk"><div class="gt-nmw">${head}<div class="gt-info">${chip(stT,stC)}${sisa}<button class="linkbtn" data-act="openspk" data-id="${b.id}">Buka</button></div></div><div class="gt-tr" style="width:${lebar}px">${rowH(b)}</div></div>${sub}`}).join('');
 }else{
  rows=M.kelompok.map(g=>{
   const hd=`<div class="gt-row gt-grp ${wcKelas(g.wc)}"><div class="gt-nmw"><b>${esc(g.wc)}</b><span class="note">${g.baris.length} mesin</span></div><div class="gt-tr" style="width:${lebar}px"></div></div>`;
   return hd+g.baris.map(r=>{const h=Math.max(46,r.lajur*28+16);
    const bl=r.blok.map(b=>{const w=Math.max(px,lbr(b.dari,b.sampai));return `<span class="gt-b blk ${wcKelas(b.wc)}${b.live?' live':''}" style="left:${kiri(b.dari)}px;width:${w}px;top:${8+b.lajur*28}px" ${ta('SPK '+String(b.no||'')+' · '+(b.d||'')+' · '+n(b.qty)+' selesai'+(b.live?' · sedang dikerjakan'+(b.operator?' ('+b.operator+')':''):'')+' · '+fdp2(b.dari)+(b.dari!==b.sampai?' sampai '+fdp2(b.sampai):''),{k:'blk',b,mesin:r.mesin,wc:g.wc})}><em>${w>=60?`SPK ${esc(String(b.no||''))}${w>=130?' · '+esc(b.d):''}${w>=100?' · '+n(b.qty):''}`:''}</em></span>`}).join('');
    return `<div class="gt-row gt-mc" style="min-height:${h}px"><div class="gt-nmw"><b class="gt-mn">${esc(r.mesin)}</b><div class="gt-info">${r.sedang?chip('Sedang dikerjakan','warn'):r.blok.length?chip('Pernah dipakai','plain'):chip('Kosong','plain')}</div></div><div class="gt-tr" style="width:${lebar}px">${bl}</div></div>`}).join('')}).join('');
 }
 const hit=k=>J.baris.filter(b=>b.status===k).length;
 const jmlMesin=M?M.kelompok.reduce((a,g)=>a+g.baris.filter(r=>r.sedang).length,0):0;
 const kp=mesinView?`<div class="gt-sum">${chip(jmlMesin+' mesin sedang bekerja',jmlMesin?'warn':'plain')}${chip(M.blok.length+' pekerjaan tercatat','info')}</div>`:`<div class="gt-sum">${chip(J.baris.length+' SPK','info')}${hit('telat')?chip(hit('telat')+' telat','crit'):''}${hit('risiko')?chip(hit('risiko')+' berisiko telat','warn'):''}${chip(hit('jalan')+' berjalan','plain')}${hit('belum')?chip(hit('belum')+' belum mulai','plain'):''}</div>`;
 const wcLeg=wcUrut.map(w=>`<span><i class="gt-sw ${wcKelas(w.nama)}"></i>${esc(w.nama)}</span>`).join('');
 const legend=mesinView?`<div class="gt-leg">${wcLeg}<span><i class="gt-ico now"></i>Hari ini</span></div>`:`<div class="gt-leg">${wcLeg}<span><i class="gt-b plan"></i>Rencana (terbit sampai due)</span><span><i class="gt-b vend"></i>Di vendor</span><span><i class="gt-b kirim"></i>Pengiriman</span><span><i class="gt-ico due"></i>Due date</span><span><i class="gt-ico est"></i>Perkiraan selesai</span><span><i class="gt-ico now"></i>Hari ini</span></div>`;
 const bantu=mesinView?'Tiap balok adalah pekerjaan sebuah SPK di mesin itu, dari hari pertama sampai terakhir dikerjakan. Terisi sendiri dari tombol Mulai dan Catat di Produksi Hari Ini.':'Setiap SPK menampilkan item dan langkah mesinnya. Batang terisi sendiri dari catatan produksi, vendor, dan pengiriman; tidak ada yang perlu diisi di halaman ini. Ketuk nama SPK untuk melipat atau membuka item.';
 GTX=GT;GTX.wcK=wcKelas;
 return `${kp}<section class="panel gt"><div class="gt-scroll" id="gt-scroll" data-sk="${bulan?'b':f.skala==='lebar'?'l':'m'}${mesinView?'m':'s'}" data-now="${kiri(t)}" data-awal="${awal}" data-px="${px}"><div class="gt-in" style="min-width:calc(var(--gt-nm) + ${lebar}px)">
  <div class="gt-row gt-hd"><div class="gt-nmw gt-hdn">${mesinView?'Mesin':'SPK dan item'}</div><div class="gt-tr" style="width:${lebar}px"><div class="gt-h1">${hdBulan}</div><div class="gt-h2">${hdHari}</div></div></div>
  <div class="gt-body"><div class="gt-ov" style="left:var(--gt-nm);width:${lebar}px">${wkend}${grid}${garisHariIni}<i class="gt-cross" id="gt-cross"></i><span class="gt-xl" id="gt-xl"></span></div>${rows}</div></div></div></section>${legend}<div class="note gt-note">${bantu}</div>`;
}
const fdp2=d=>String(fd(d)).replace(/&nbsp;/g,' ');

/* ---------- Papan jadwal: tooltip kaya dan panel detail ---------- */
let GTX=[];
const GT_STL={selesai:['Selesai','ok'],telat:['Telat','crit'],risiko:['Berisiko telat','warn'],jalan:['Berjalan','info'],belum:['Belum mulai','plain']};
const gtKv=(k,v)=>v==null||v===''?'':`<div class="gt-kv"><span>${k}</span><b>${v}</b></div>`;
const gtRentang=(a,b)=>a?(b&&b!==a?fdp2(a)+' – '+fdp2(b):fdp2(a)):'';
const gtSisa=b=>b.sisaHari==null?'':b.sisaHari<0?' · '+(-b.sisaHari)+' hari lewat due':b.sisaHari===0?' · due hari ini':' · '+b.sisaHari+' hari lagi';
function gtTipHtml(o){
 if(o.k==='step'){const {b,it,l}=o;const pc=it.q?Math.round(Math.min(1,l.qty/it.q)*100):0;
  return `<h5>${esc(l.wc)}${l.live?' <em class="gt-liveb">sedang dikerjakan</em>':''}</h5><div class="gt-sub">SPK ${esc(String(b.no))} · ${esc(it.d)}</div>${gtKv('Mesin',esc(l.mesin.join(', ')||'–'))}${gtKv('Tanggal',gtRentang(l.dari,l.sampai))}${gtKv('Hasil',`${n(l.qty)} dari ${n(it.q)} ${esc(it.u||'')} (${pc}%)`)}${l.reject?gtKv('Reject',n(l.reject)):''}<div class="gt-mini"><i style="width:${pc}%"></i></div><div class="gt-hint">Klik untuk detail</div>`}
 if(o.k==='blk'){const x=o.b;return `<h5>${esc(o.mesin)}${x.live?' <em class="gt-liveb">sedang dikerjakan</em>':''}</h5><div class="gt-sub">SPK ${esc(String(x.no||''))} · ${esc(x.d||'')}</div>${gtKv('Work center',esc(o.wc))}${gtKv('Tanggal',gtRentang(x.dari,x.sampai))}${gtKv('Selesai',n(x.qty)+' pcs')}${x.operator?gtKv('Operator',esc(x.operator)):''}<div class="gt-hint">Klik untuk detail</div>`}
 const b=o.b;
 return `<h5>SPK ${esc(String(b.no))} · ${esc(b.customer)}</h5><div class="gt-sub">${GT_STL[b.status][0]}${gtSisa(b)}</div>${gtKv('Produksi',Math.round(b.pP*100)+'%'+(b.prod?' ('+gtRentang(b.prod.dari,b.prod.sampai)+')':''))}${gtKv('Terkirim',Math.round((o.pK||0)*100)+'%')}${b.vendor?gtKv('Vendor',esc(b.vendor.nama)+' ('+gtRentang(b.vendor.dari,b.vendor.sampai)+')'):''}${b.kirim?gtKv('Kirim',gtRentang(b.kirim.dari,b.kirim.sampai)):''}${b.due?gtKv('Rencana',gtRentang(b.terbit,b.due)):''}${b.perkiraan?gtKv('Perkiraan selesai',fdp2(b.perkiraan)+(b.risiko?' (lewat due)':'')):''}<div class="gt-hint">Klik untuk detail</div>`}
function gtDetail(o){
 const wk=GTX.wcK||(()=>'wc0');
 if(o.k==='blk'){const x=o.b;const id=x.spk_id||x.spk||'';
  openDrawer(()=>({t:`${esc(o.mesin)}`,s:`${chip(o.wc,'info')}${x.live?chip('Sedang dikerjakan','warn'):''}`,b:`<div class="gt-dd">${gtKv('SPK','SPK '+esc(String(x.no||'')))}${gtKv('Item',esc(x.d||''))}${gtKv('Tanggal',gtRentang(x.dari,x.sampai))}${gtKv('Hasil selesai',n(x.qty)+' pcs')}${x.operator?gtKv('Operator',esc(x.operator)):''}${id&&byId('spk',id)?`<div class="gt-act"><button class="btn primary" data-act="openspk" data-id="${esc(id)}">Buka SPK</button></div>`:''}</div>`}));return}
 const b=o.b;const [stT,stC]=GT_STL[b.status];
 const items=b.items.map(it=>`<div class="gt-dit${o.k==='step'&&o.it&&o.it.idx===it.idx?' hl':''}"><div class="gt-dih"><b>${esc(it.d)}</b><span>${n(it.q)} ${esc(it.u||'')} · ${Math.round(it.pct*100)}%</span></div><div class="jb"><i style="width:${Math.round(it.pct*100)}%"></i></div>${it.langkah.length?it.langkah.map(l=>`<div class="gt-dst"><i class="gt-sw ${wk(l.wc)}"></i><b>${esc(l.wc)}</b>${l.mesin.length?`<em>${esc(l.mesin.join(', '))}</em>`:''}<small>${gtRentang(l.dari,l.sampai)} · ${n(l.qty)} pcs${l.reject?' · reject '+n(l.reject):''}${l.live?' · berjalan':''}</small></div>`).join(''):'<div class="note">Belum dikerjakan</div>'}</div>`).join('');
 openDrawer(()=>({t:`SPK ${esc(String(b.no))}`,s:`${esc(b.customer)} ${chip(stT,stC)}<span class="muted">${esc(gtSisa(b).replace(/^ · /,''))}</span>`,b:`<div class="gt-dd">${gtKv('Progres produksi',Math.round(b.pP*100)+'%')}${gtKv('Terkirim',Math.round((o.pK||0)*100)+'%')}${b.due?gtKv('Rencana',gtRentang(b.terbit,b.due)):''}${b.perkiraan?gtKv('Perkiraan selesai',fdp2(b.perkiraan)+(b.risiko?' (lewat due)':'')):''}${b.vendor?gtKv('Vendor',esc(b.vendor.nama)+' ('+gtRentang(b.vendor.dari,b.vendor.sampai)+')'):''}${b.kirim?gtKv('Pengiriman',gtRentang(b.kirim.dari,b.kirim.sampai)):''}<h4 class="gt-dh">Item dan langkah mesin</h4>${items}<div class="gt-act"><button class="btn primary" data-act="openspk" data-id="${b.id}">Buka SPK</button></div></div>`}))}

/* ---------- Kinerja & Analisa (dulu Dashboard Produksi): Work Center, Vendor, Laporan harian ---------- */
/* ---------- Kinerja & Analisa (Tahap 2): work center, produk, vendor, pengiriman ---------- */
const fdpA=d=>String(fd(d)).replace(/&nbsp;/g,' ');
const pctA=v=>v==null?'–':Math.round(v*100)+'%';
const hrA=v=>v==null?'–':String(v).replace('.',',')+' hr';
const mnA=v=>v==null?'–':v<60?v+' mnt':Math.floor(v/60)+' j '+(v%60)+' mnt';
const sparkBar=(tren,mx)=>`<span class="spark">${tren.map(t=>`<i style="height:${mx>0?Math.max(t.qty>0?8:2,Math.round(t.qty/mx*100)):2}%" title="${fdpA(t.tgl)}: ${n(t.qty)}"></i>`).join('')}</span>`;
const kpiA=(cls,lb,v,s)=>`<div class="kpi ${cls}"><span class="lb">${lb}</span><span class="v">${v}</span><span class="s">${s}</span></div>`;
const hariPilih=()=>+((F.produksi||{}).hari)||30;

function analisaWC(){
 const P=PXL();const hari=hariPilih();const kap=kapWC();
 const rows=P.outputWC({kejadian:S.produksi_log||[],wcList:wcInternal().map(w=>({nama:w.nama,kapasitas:kap[w.nama]||0})),sampai:today(),hari});
 const tot=rows.reduce((a,r)=>a+r.qty,0),ton=rows.reduce((a,r)=>a+r.tonase,0);
 const padat=rows.filter(r=>r.utilisasi!=null).sort((a,b)=>b.utilisasi-a.utilisasi)[0];
 const rj=rows.filter(r=>r.rejectPct!=null&&r.qty>0).sort((a,b)=>b.rejectPct-a.rejectPct)[0];
 const kp=`<div class="kpi-row">${kpiA('info','Output total',n(tot),`${hari} hari terakhir`)}${kpiA('info','Tonase',n(Math.round(ton))+' kg','dari hasil bertimbang')}${kpiA(padat&&padat.utilisasi>=0.9?'crit':'ok','Paling padat',padat?esc(padat.wc):'–',padat?`utilisasi ${pctA(padat.utilisasi)}`:'isi kapasitas di Master Data')}${kpiA(rj&&rj.rejectPct>=0.03?'warn':'ok','Reject tertinggi',rj?esc(rj.wc):'–',rj?pctA(rj.rejectPct):'tidak ada reject')}</div>`;
 const warna=u=>u==null?'plain':u>=0.9?'crit':u>=0.5?'ok':'info';
 const teks=u=>u==null?'kapasitas kosong':u>=0.9?'padat':u>=0.5?'sehat':'longgar';
 const tr=rows.map(r=>{const mx=Math.max(0,...r.tren.map(t=>t.qty));
  return `<tr data-wc="${esc(r.wc)}"><td><b>${esc(r.wc)}</b>${r.mesin.length>1?`<div class="note">${r.mesin.map(m=>esc(m.nama)+' '+n(m.qty)).join(' · ')}</div>`:''}</td><td class="num">${r.kapasitas?n(r.kapasitas):'–'}</td><td class="num"><b>${n(r.rataHari)}</b><div class="note">${r.hariAktif} hari aktif</div></td><td style="min-width:150px">${r.utilisasi==null?'<span class="muted">–</span>':`<div class="jb"><i style="width:${Math.min(100,Math.round(r.utilisasi*100))}%"></i></div>${chip(pctA(r.utilisasi)+' · '+teks(r.utilisasi),warna(r.utilisasi))}`}</td><td class="num">${n(r.puncak)}${r.utilisasiPuncak&&r.utilisasiPuncak>1?` <span class="note">${pctA(r.utilisasiPuncak)}</span>`:''}</td><td class="num">${pctA(r.rejectPct)}</td><td class="num">${r.menitPerPcs==null?'–':String(r.menitPerPcs).replace('.',',')}</td><td class="num">${n(Math.round(r.tonase))}</td><td>${sparkBar(r.tren,mx)}</td></tr>`}).join('');
 return `<section class="panel"><div class="pbody" style="padding:0 0 8px 0">${kp}<div class="dw-section-title" style="margin:8px 0 6px 0">Output dan kapasitas per work center (${hari} hari terakhir)</div>
  <div class="tbl-wrap"><table id="wc-output"><thead><tr><th>Work center</th><th class="num">Kapasitas/hari</th><th class="num">Rata-rata/hari</th><th>Utilisasi</th><th class="num">Puncak</th><th class="num">Reject</th><th class="num">Menit/pcs</th><th class="num">Tonase (kg)</th><th>Tren harian</th></tr></thead><tbody>${tr}</tbody></table></div>
  <div class="note" style="padding:6px 16px 0">Rata-rata dihitung per hari yang ada hasilnya. Utilisasi = rata-rata per hari dibagi kapasitas per hari; 90% ke atas padat. Batang tren: tinggi menurut output harian.</div></div></section><section class="panel">${wcPanelBaru()}</section>`;
}

/* Satu baris per item SPK untuk analisa lama proses: kapan mulai, selesai produksi, ke vendor, kembali, dan terkirim */
function recordsProduk(hari){
 const P=PXL();const c=calc();const dari=addDays(today(),-(hari-1));const out=[];
 const ev=evData().filter(e=>(e.jenis||'hasil')==='hasil');
 S.spk.forEach(s=>{const x=c.spk[s._id];if(!x||x.st==='Draft'||x.st==='Batal'||(s.tgl&&s.tgl<dari))return;
  (s.items||[]).forEach((it,ix)=>{const st=itemState(s,it,ix);if(!st)return;const q=+it.q||0;
   const evi=ev.filter(e=>e.spk_id===s._id&&+e.item_idx===ix);
   const waktu=e=>e.mulai||e.at;
   const mulai=evi.length?evi.map(waktu).sort()[0]:null;
   const intern=st.rute.filter(w=>!P.langkahVendor(w));const akhir=intern[intern.length-1];const iAkhir=st.rute.indexOf(akhir);
   const selesaiProduksi=q>0&&(st.kum[akhir]||0)>=q?(evi.filter(e=>P.indeksLangkah(st.rute,st.alt,e.wc)===iAkhir).map(e=>e.selesai||e.at).sort().slice(-1)[0]||null):null;
   const vs=c.vend.filter(v=>v.v.spk===s._id&&v.v.status!=='Batal'&&(v.v.items||[]).some(i=>i.d===it.d));
   const vendorKirim=vs.length?vs.map(v=>v.v.tgl).filter(Boolean).sort()[0]:null;
   const vendorKembali=vs.length&&vs.every(v=>v.st==='Selesai')?vs.map(v=>{const l=(v.v.riwayat||[]).slice(-1)[0];return (l&&l.tgl)||String(v.v.updAt||'').slice(0,10)}).filter(Boolean).sort().slice(-1)[0]:null;
   const ks=S.kirim.filter(k=>k.spk===s._id&&k.status!=='Batal'&&(k.items||[]).some(i=>i.d===it.d));
   const terkirim=ks.length&&((x.lines[ix]||{}).kirim||0)>=q&&ks.every(k=>k.status==='Diterima')?ks.map(k=>k.tglTerima||k.tgl).filter(Boolean).sort().slice(-1)[0]:null;
   out.push({produk:P.produkDari(it.d),desc:it.d,spk:s.no,qty:q,spkTgl:s.tgl,mulai,selesaiProduksi,vendorKirim,vendorKembali,terkirim});
  })});
 return out;
}
function analisaProduk(){
 const P=PXL();const hari=hariPilih();const rec=recordsProduk(hari);const lp=P.lamaPerProduk(rec);
 if(!lp.length)return `<section class="panel">${empty('Belum ada SPK pada periode ini','Perpanjang periode di atas, atau terbitkan SPK dengan rute produksi.')}</section>`;
 const selesai=rec.filter(r=>r.terkirim).length;
 const kp=`<div class="kpi-row">${kpiA('info','Item dianalisa',rec.length,`SPK terbit ${hari} hari terakhir`)}${kpiA('ok','Sudah terkirim',selesai,'sampai customer')}${kpiA('info','Selesai produksi',rec.filter(r=>r.selesaiProduksi).length,'semua langkah internal')}${kpiA('warn','Masih berjalan',rec.length-selesai,'belum sampai customer')}</div>`;
 const seg=[['tunggu','Tunggu mulai','s-a'],['produksi','Produksi','s-b'],['tungguVendor','Tunggu kirim vendor','s-c'],['vendor','Di vendor','s-d'],['kirim','Ke customer','s-e']];
 const tr=lp.map(o=>{const tot=seg.reduce((a,[k])=>a+(o[k]||0),0);
  const bar=tot>0?`<div class="stk">${seg.map(([k,l,c])=>o[k]?`<i class="${c}" style="width:${(o[k]/tot*100).toFixed(1)}%" title="${l}: ${hrA(o[k])}"></i>`:'').join('')}</div>`:'<span class="muted">belum ada tahap selesai</span>';
  return `<tr data-produk="${esc(o.produk)}"><td><b>${esc(o.produk)}</b><div class="note">${o.item} item · ${n(o.qty)} pcs</div></td><td class="num">${hrA(o.tunggu)}</td><td class="num">${hrA(o.produksi)}</td><td class="num">${hrA(o.tungguVendor)}</td><td class="num">${hrA(o.vendor)}</td><td class="num">${hrA(o.kirim)}</td><td class="num"><b>${hrA(o.total)}</b><div class="note">${o.terkirim} terkirim</div></td><td style="min-width:220px">${bar}</td></tr>`}).join('');
 const legend=seg.map(([,l,c])=>`<span class="lg"><i class="${c}"></i>${l}</span>`).join('');
 const lambat=rec.filter(r=>r.terkirim).map(r=>({...r,tot:Math.round((new Date(r.terkirim)-new Date(r.spkTgl))/864e5)})).sort((a,b)=>b.tot-a.tot).slice(0,5);
 return `<section class="panel"><div class="pbody" style="padding:0 0 8px 0">${kp}<div class="dw-section-title" style="margin:8px 0 6px 0">Lama proses per produk, dari SPK terbit sampai terkirim</div>
  <div class="tbl-wrap"><table id="produk-tabel"><thead><tr><th>Produk</th><th class="num">Tunggu mulai</th><th class="num">Produksi</th><th class="num">Tunggu kirim vendor</th><th class="num">Di vendor</th><th class="num">Ke customer</th><th class="num">Total</th><th>Komposisi waktu</th></tr></thead><tbody>${tr}</tbody></table></div>
  <div class="lgd">${legend}</div>
  ${lambat.length?`<div class="dw-section-title" style="margin:12px 0 6px 0">Item paling lama sampai customer</div><ul class="note" style="margin:0 0 0 18px;padding:0">${lambat.map(r=>`<li>SPK ${esc(String(r.spk))} · ${esc(r.desc)} · <b>${r.tot} hari</b></li>`).join('')}</ul>`:''}
  <div class="note" style="padding:8px 16px 0">Rata-rata per tahap hanya dari item yang tahapnya sudah terjadi. Waktu dihitung dari catatan Mulai dan Selesai, surat jalan vendor, dan surat jalan customer; tidak ada input tambahan.</div></div></section>`;
}

const pengVendor=()=>calc().vend.filter(x=>x.v.status!=='Batal').map(x=>{const v=x.v;const selesai=x.st==='Selesai';const last=(v.riwayat||[]).slice(-1)[0];
 return {vendor:v.vendor,proses:vKey(v.proses).toUpperCase(),tglKirim:v.tgl,tglKembali:selesai?((last&&last.tgl)||String(v.updAt||'').slice(0,10)||null):null,qty:(v.items||[]).reduce((a,i)=>a+(+i.q||0),0),reject:(v.items||[]).reduce((a,i)=>a+(+i.reject||0),0),noSJ:v.noSJ,sisa:x.sisa}});
function analisaVendor(){
 const P=PXL();const peng=pengVendor();const rv=P.ringkasVendor(peng,today());
 if(!rv.baris.length)return `<section class="panel"><div class="pbody note">Belum ada pengiriman ke vendor. Catat lewat menu Kirim ke Vendor.</div></section>`;
 const keluar=rv.baris.reduce((a,r)=>a+r.keluar,0),masuk=rv.baris.reduce((a,r)=>a+r.masuk,0),sisa=rv.baris.reduce((a,r)=>a+r.sisa,0);
 const tat=rv.baris.filter(r=>r.rataTAT!=null);const rataTat=tat.length?Math.round(tat.reduce((a,r)=>a+r.rataTAT,0)/tat.length*10)/10:null;
 const kp=`<div class="kpi-row">${kpiA('info','Barang keluar',n(keluar),'ke semua vendor')}${kpiA('ok','Sudah kembali',n(masuk),'diterima dari vendor')}${kpiA(sisa?'warn':'ok','Masih di vendor',n(sisa),rv.terbuka.length+' surat jalan terbuka')}${kpiA('info','Rata-rata TAT',rataTat==null?'–':String(rataTat).replace('.',','),'hari kerja per kiriman')}</div>`;
 const tr=rv.baris.map(r=>`<tr data-vendor="${esc(r.vendor)}"><td><b>${esc(r.vendor)}</b></td><td>${esc(r.proses||'–')}</td><td class="num">${r.kiriman}</td><td class="num">${n(r.keluar)}</td><td class="num">${n(r.masuk)}</td><td class="num">${r.sisa?`<b>${n(r.sisa)}</b>`:'–'}</td><td class="num">${r.rataTAT==null?'–':String(r.rataTAT).replace('.',',')+' hk'}</td><td class="num">${r.tercepat==null?'–':r.tercepat+' / '+r.terlama+' hk'}</td><td class="num">${pctA(r.rejectPct)}</td></tr>`).join('');
 const buka=rv.terbuka.length?`<div class="dw-section-title" style="margin:12px 0 6px 0">Sedang di vendor sekarang</div><div class="tbl-wrap"><table id="vendor-terbuka"><thead><tr><th>Surat jalan</th><th>Vendor</th><th>Proses</th><th>Dikirim</th><th class="num">Sisa</th><th class="num">Sudah</th></tr></thead><tbody>${rv.terbuka.map(t=>`<tr><td class="mono">${esc(t.noSJ||'–')}</td><td>${esc(t.vendor)}</td><td>${esc(t.proses||'–')}</td><td>${fd(t.tglKirim)}</td><td class="num"><b>${n(t.sisa)}</b></td><td class="num">${t.umur} hk${t.umur>=5?' '+chip('lama','crit'):''}</td></tr>`).join('')}</tbody></table></div>`:'';
 return `<section class="panel"><div class="pbody" style="padding:0 0 8px 0">${kp}<div class="dw-section-title" style="margin:8px 0 6px 0">Barang keluar dan masuk per vendor</div>
  <div class="tbl-wrap"><table id="vendor-aliran"><thead><tr><th>Vendor</th><th>Proses</th><th class="num">Kiriman</th><th class="num">Keluar</th><th class="num">Masuk</th><th class="num">Sisa</th><th class="num">Rata-rata TAT</th><th class="num">Tercepat / terlama</th><th class="num">Reject</th></tr></thead><tbody>${tr}</tbody></table></div>${buka}</div></section>
  <section class="panel">${vendorPanelBaru()}</section>`;
}

function analisaKirim(){
 const P=PXL();const hari=hariPilih();const dari=addDays(today(),-(hari-1));
 const ad=P.analisaDock(S.bongkar||[],dari,today());
 if(!ad.perJenis.length)return `<section class="panel">${empty('Belum ada Loading atau Unloading pada periode ini','Catat lewat Bongkar Muat; jam masuk, mulai, dan selesai dipakai untuk analisa.')}</section>`;
 const kp=`<div class="kpi-row">${kpiA('ok','Selesai',ad.selesai,`${hari} hari terakhir`)}${kpiA(ad.proses?'warn':'info','Sedang proses',ad.proses,'di dock sekarang')}${kpiA(ad.antri?'warn':'info','Antri',ad.antri,'menunggu giliran')}${kpiA('info','Jenis aktivitas',ad.perJenis.length,'loading dan unloading')}</div>`;
 const tj=ad.perJenis.map(r=>`<tr><td>${chip(r.jenis,r.jenis==='Loading'?'info':'warn')}</td><td>${esc(r.muatan)}</td><td class="num">${r.n}<div class="note">${r.selesai} selesai</div></td><td class="num">${mnA(r.rataTunggu)}</td><td class="num"><b>${mnA(r.rataProses)}</b></td><td class="num">${mnA(r.terlama)}</td></tr>`).join('');
 const tp=ad.perPihak.map(r=>`<tr><td>${chip(r.jenis,r.jenis==='Loading'?'info':'warn')}</td><td>${esc(r.pihak||'–')}</td><td class="num">${r.n}</td><td class="num">${mnA(r.rataTunggu)}</td><td class="num"><b>${mnA(r.rataProses)}</b></td></tr>`).join('');
 return `<section class="panel"><div class="pbody" style="padding:0 0 8px 0">${kp}<div class="dw-section-title" style="margin:8px 0 6px 0">Loading dan unloading per jenis muatan</div>
  <div class="tbl-wrap"><table id="dock-jenis"><thead><tr><th>Jenis</th><th>Muatan</th><th class="num">Jumlah</th><th class="num">Rata-rata tunggu</th><th class="num">Rata-rata proses</th><th class="num">Terlama</th></tr></thead><tbody>${tj}</tbody></table></div>
  <div class="dw-section-title" style="margin:12px 0 6px 0">Per customer, vendor, dan supplier (10 teratas)</div>
  <div class="tbl-wrap"><table id="dock-pihak"><thead><tr><th>Jenis</th><th>Pihak</th><th class="num">Jumlah</th><th class="num">Rata-rata tunggu</th><th class="num">Rata-rata proses</th></tr></thead><tbody>${tp}</tbody></table></div>
  <div class="note" style="padding:8px 16px 0">Tunggu = jam masuk sampai jam mulai; proses = jam mulai sampai jam selesai. Diambil dari antrian Bongkar Muat; loading barang jadi ke customer, unloading dan loading barang setengah jadi ke vendor, dan unloading bahan baku.</div></div></section>`;
}

/* ---------- Laporan Produksi (analisa): periode, qty atau tonase atau kecepatan, kelompok produk, tren, akumulasi ---------- */
const LAP_PER=[['hari','Hari ini'],['minggu','Minggu ini'],['30','30 hari'],['bulan','Bulan ini'],['tahun','Tahun ini'],['semua','Semua']];
const LAP_MET=[['qty','Jumlah (pcs)'],['ton','Tonase (kg)'],['kec','Kecepatan']];
const LAP_BY=[['produk','Produk'],['wc','Work center'],['mesin','Mesin'],['operator','Operator'],['customer','Customer']];
const LAP_AKM=[['operator','Operator'],['mesin','Mesin'],['wc','Work center'],['kelompok','Kelompok produk']];
/* Laporan admin (prodLog tanpa catatan mesin) diubah menjadi kejadian 'hasil' HANYA saat membaca laporan; tidak disimpan.
   prodLog menyimpan total kumulatif per item, jadi qty kejadian = selisih dengan entri sebelumnya (per item, urut tanggal). */
function evAdmin(){const out=[];
 (S.spk||[]).forEach(s=>{const log=(s.prodLog||[]).slice().sort((a,b)=>String(a.tgl||'').localeCompare(String(b.tgl||''))||String(a.at||'').localeCompare(String(b.at||'')));if(!log.length)return;
  const prev={};
  log.forEach(en=>(en.items||[]).forEach((li,k)=>{const q=+li.q||0;const d=Math.round((q-(prev[k]||0))*1e6)/1e6;prev[k]=Math.max(prev[k]||0,q);if(d<=0)return;
   const it=(s.items||[])[k]||{};const w=+it.w>0?+it.w:null;const tgl=en.tgl||String(en.at||'').slice(0,10);if(!tgl)return;
   out.push({_id:'adm-'+s._id+'-'+k+'-'+tgl+'-'+out.length,jenis:'hasil',spk_id:s._id,item_idx:k,item_desc:li.d||it.d||'',spk_no:String(s.no),customer:s.customer||'',tebal:thkOf(it.g)||'',wc:li.wc||'',mesin:li.wc||'',operator:'Admin produksi',by:en.by||null,qty:d,reject:0,tgl,mulai:null,selesai:tgl+'T17:00:00',menit:null,berat:w,tonase:w?Math.round(d*w*100)/100:null,at:en.at||tgl+'T17:00:00',_admin:true})}))});
 return out}
const lapBy=()=>produksiAdmin()?LAP_BY.filter(x=>['produk','customer'].includes(x[0])):LAP_BY;
const lapAkm=()=>produksiAdmin()?LAP_AKM.filter(x=>x[0]==='kelompok'):LAP_AKM;
const lapEv=()=>evData().map(evLengkap).concat(evAdmin().map(evLengkap));
const tonA=v=>v==null?'–':v>=1000?n(Math.round(v/10)/100)+' ton':n(Math.round(v))+' kg';
const butirLabel=(b,k)=>b==='hari'?k.slice(8)+'/'+k.slice(5,7):b==='minggu'?k.slice(8)+'/'+k.slice(5,7):b==='bulan'?k.slice(5,7)+'/'+k.slice(2,4):k;
const BUTIR_NAMA={hari:'per hari',minggu:'per minggu',bulan:'per bulan',tahun:'per tahun'};

function lapKolom(r,met){
 const ut=met==='ton'?r.pangsaTonase:r.pangsaQty;
 return `<td style="min-width:130px"><div class="jb"><i style="width:${Math.round((ut||0)*100)}%"></i></div><span class="note">${Math.round((ut||0)*100)}%</span></td><td class="num${met==='qty'?' lp-em':''}">${n(r.qty)}</td><td class="num${met==='ton'?' lp-em':''}">${tonA(r.tonase)}</td><td class="num">${n(r.rataHari)}</td><td class="num${met==='kec'?' lp-em':''}">${r.pcsPerJam==null?'–':n(r.pcsPerJam)}</td><td class="num${met==='kec'?' lp-em':''}">${r.kgPerJam==null?'–':n(r.kgPerJam)}</td><td class="num">${r.menitPerPcs==null?'–':String(r.menitPerPcs).replace('.',',')}</td><td class="num">${pctA(r.rejectPct)}</td><td class="num">${r.hariAktif}</td>`;
}
function lapBaris(evs,per,by,met){
 const P=PXL();
 if(by==='produk')return P.pohonProduk(evs,{...per,urut:met==='ton'?'tonase':'qty'}).map(r=>`<tr class="lp-d${r.depth}" data-depth="${r.depth}"><td><span class="lp-nm" style="padding-left:${r.depth*18}px">${r.depth===0?'<b>'+esc(r.nama)+'</b>':esc(r.nama)}</span></td>${lapKolom(r,met)}</tr>`).join('');
 const rows=P.kelompokkan(evs,{...per,by}).slice();
 rows.sort((a,b)=>met==='ton'?b.tonase-a.tonase:met==='kec'?(b.pcsPerJam==null)-(a.pcsPerJam==null)||(b.pcsPerJam||0)-(a.pcsPerJam||0):b.qty-a.qty);
 return rows.map(r=>`<tr data-nama="${esc(r.nama)}"><td><b>${esc(r.nama)}</b>${r.jedaCatat!=null&&r.jedaCatat>0&&(by==='operator'||by==='mesin')?`<div class="note">jeda catat rata-rata ${r.jedaCatat} mnt</div>`:''}</td>${lapKolom(r,met)}</tr>`).join('');
}
function laporanAnalisa(){
 const P=PXL();if(!P)return empty('Laporan belum siap','Muat ulang halaman.');
 const f=F.produksi;const t=today();const per=P.periodeRentang(f.lper||'bulan',t);const evs=lapEv();
 const met=f.lmet||'qty',by=lapBy().some(x=>x[0]===f.lby)?f.lby:'produk';
 const ctr=`<div class="lp-ctl"><div class="lp-g"><span>Periode</span>${segBtns('produksi','lper',LAP_PER)}</div><div class="lp-g"><span>Analisa</span>${segBtns('produksi','lmet',LAP_MET)}</div><div class="lp-g"><span>Kelompokkan per</span>${segBtns('produksi','lby',lapBy())}</div></div>`;
 const tot=P.totalPeriode(evs,per);
 if(!tot.catatan)return `<section class="panel"><div class="pbody">${ctr}</div></section>`+empty('Belum ada hasil produksi pada '+per.label.toLowerCase(),'Ganti periode di atas. Hasil muncul setelah operator menekan Selesai atau admin mengisi hasil di Produksi Hari Ini.');
 const kp=`<div class="kpi-row">${kpiA('info','Jumlah produksi',n(tot.qty)+' pcs',per.label+' · '+tot.hariAktif+' hari aktif')}${kpiA('info','Tonase',tonA(tot.tonase),'rata-rata '+tonA(tot.rataHariTonase)+' per hari aktif')}${kpiA('ok','Rata-rata per hari',n(tot.rataHari)+' pcs','per hari yang ada produksi')}${kpiA('info','Kecepatan',tot.pcsPerJam==null?'–':n(tot.pcsPerJam)+' pcs/jam',tot.kgPerJam==null?'dari catatan berwaktu':n(tot.kgPerJam)+' kg/jam')}${kpiA(tot.rejectPct!=null&&tot.rejectPct>=0.03?'warn':'ok','Reject',pctA(tot.rejectPct),n(tot.reject)+' pcs')}</div>`;
 const tr=P.tren(evs,per);const nilai=x=>met==='ton'?x.tonase:x.qty;const mx=Math.max(1,...tr.titik.map(nilai));
 const chart=`<div class="lp-chart" id="lp-trend">${tr.titik.map(x=>`<div class="lp-col" title="${esc(x.kunci)}: ${n(x.qty)} pcs · ${tonA(x.tonase)}"><span class="lp-v">${tr.titik.length<=16&&nilai(x)>0?(met==='ton'?n(Math.round(x.tonase)):n(x.qty)):''}</span><i style="height:${Math.max(nilai(x)>0?4:1,Math.round(nilai(x)/mx*100))}%"></i><span class="lp-l">${esc(butirLabel(tr.butir,x.kunci))}</span></div>`).join('')}</div>`;
 const kepala=by==='produk'?'Produk (kelompok › type › material)':LAP_BY.find(x=>x[0]===by)[1];
 const tabel=`<table id="lp-tabel"><thead><tr><th>${kepala}</th><th>Pangsa ${met==='ton'?'tonase':'jumlah'}</th><th class="num">Jumlah (pcs)</th><th class="num">Tonase</th><th class="num">Rata-rata/hari</th><th class="num">pcs/jam</th><th class="num">kg/jam</th><th class="num">Menit/pcs</th><th class="num">Reject</th><th class="num">Hari aktif</th></tr></thead><tbody>${lapBaris(evs,per,by,met)}</tbody></table>`;
 // akumulasi hari ini sampai tahun ini untuk operator, mesin, work center, atau kelompok produk
 const akm=lapAkm().some(x=>x[0]===f.lakm)?f.lakm:lapAkm()[0][0];const ak=P.akumulasi(evs,{by:akm,sampai:t});
 const sel=(w,mm)=>`<td class="num"><b>${mm==='ton'?tonA(w.tonase):n(w.qty)}</b><div class="note">${mm==='ton'?n(w.qty)+' pcs':tonA(w.tonase)}</div></td>`;
 const akTab=`<table id="lp-akum"><thead><tr><th>${LAP_AKM.find(x=>x[0]===akm)[1]}</th><th class="num">Hari ini</th><th class="num">Minggu ini</th><th class="num">Bulan ini</th><th class="num">Tahun ini</th><th class="num">Seluruhnya</th><th class="num">Rata-rata/hari aktif</th><th class="num">Hari terbaik</th></tr></thead><tbody>${ak.baris.map(r=>`<tr data-nama="${esc(r.nama)}"><td><b>${esc(r.nama)}</b><div class="note">${r.hariAktif} hari aktif</div></td>${sel(r.hari,met)}${sel(r.minggu,met)}${sel(r.bulan,met)}${sel(r.tahun,met)}${sel(r.total,met)}<td class="num">${n(r.rataHari)}</td><td class="num">${n(r.terbaik)}</td></tr>`).join('')}</tbody><tfoot><tr><td><b>Jumlah</b></td>${sel(ak.jumlah.hari,met)}${sel(ak.jumlah.minggu,met)}${sel(ak.jumlah.bulan,met)}${sel(ak.jumlah.tahun,met)}${sel(ak.jumlah.total,met)}<td></td><td></td></tr></tfoot></table>`;
 return `<section class="panel"><div class="pbody">${ctr}</div></section>${kp}
  <section class="panel"><div class="pbody"><div class="dw-section-title" style="margin:0 0 8px 0">Tren ${BUTIR_NAMA[tr.butir]} · ${met==='ton'?'tonase (kg)':'jumlah (pcs)'}</div>${chart}</div></section>
  <section class="panel"><div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:8px 0 6px 0">${per.label} per ${by==='produk'?'produk':LAP_BY.find(x=>x[0]===by)[1].toLowerCase()}</div><div class="tbl-wrap">${tabel}</div>${by==='produk'?'<div class="note" style="padding:6px 16px 0">Cable Tray, Cable Ladder, Cable Duct, Cover, dan Aksesoris, lalu rinciannya per type (STU, STC, SLU, SLW, SLHD) dan material dengan finishing. Dibaca dari judul section SPK; operator tidak perlu mengisi apa pun.</div>':''}<div class="note" style="padding:6px 16px 0">Kecepatan dihitung dari catatan yang punya jam mulai dan selesai (tombol Mulai dan Selesai). Jeda catat = selisih saat dicatat dan jam selesai.</div></div></section>
  <section class="panel"><div class="pbody" style="padding:0 0 8px 0"><div class="lp-akh"><div class="dw-section-title" style="margin:8px 0 6px 0">Akumulasi produksi</div><div class="lp-g"><span>per</span>${segBtns('produksi','lakm',lapAkm())}</div></div><div class="tbl-wrap">${akTab}</div><div class="note" style="padding:6px 16px 0">Hari ini, Senin sampai hari ini, awal bulan, awal tahun, dan seluruh data. Dasar penilaian kinerja operator dan mesin.</div></div></section>`;
}
async function lapAnalisaCsv(){
 const P=PXL();const f=F.produksi;const per=P.periodeRentang(f.lper||'bulan',today());const by=lapBy().some(x=>x[0]===f.lby)?f.lby:'produk';const evs=lapEv();
 const rows=by==='produk'?P.pohonProduk(evs,per).map(r=>({...r,nama:'  '.repeat(r.depth)+r.nama})):P.kelompokkan(evs,{...per,by});
 const q=v=>{const s=v==null?'':String(v);return /[",\n;]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
 const csv='﻿'+[['Periode',per.label,'Dari',per.dari==='0000-00-00'?'':per.dari,'Sampai',per.sampai],['Kelompok','Jumlah (pcs)','Tonase (kg)','Rata-rata per hari (pcs)','pcs per jam','kg per jam','Menit per pcs','Reject (%)','Hari aktif'],
  ...rows.map(r=>[r.nama,r.qty,r.tonase,r.rataHari,r.pcsPerJam??'',r.kgPerJam??'',r.menitPerPcs??'',r.rejectPct==null?'':Math.round(r.rejectPct*1000)/10,r.hariAktif])].map(r=>r.map(q).join(',')).join('\r\n');
 try{await DLS.save({filename:`Laporan-produksi-${by}-${per.sampai}.csv`,data:new Blob([csv],{type:'text/csv'})})}catch(e){if(e.code!=='declined')toast('Gagal mengunduh: '+(e.message||e.code))}
}

const tabKinerja=()=>segBtns('produksi','tab',produksiAdmin()?[['laporan','Laporan Produksi'],['vendor','Vendor'],['kirim','Pengiriman'],['rincian','Rincian harian']]:[['wc','Work Center'],['laporan','Laporan Produksi'],['progres','Progres WC'],['produk','Produk'],['vendor','Vendor'],['kirim','Pengiriman'],['rincian','Rincian harian']]);
const tabAdm=f=>{if(produksiAdmin()&&!['laporan','vendor','kirim','rincian'].includes(f.tab))f.tab='laporan'};
T['produksi']=()=>{const f=F['produksi'];tabAdm(f);if(f.tab==='progres'){const ws=wcInternal();if(!f.pwc||!ws.some(w=>w.nama===f.pwc))f.pwc=(ws[0]||{}).nama||'';return tabKinerja()+'<div class="tb-group"><div class="tb-lbl">Work Centre</div><select class="sel" id="f-pwc" data-act="filtsel" data-view="produksi" data-key="pwc">'+ws.map(w=>'<option'+(f.pwc===w.nama?' selected':'')+'>'+esc(w.nama)+'</option>').join('')+'</select></div><span class="grow"></span><button class="btn ghost" data-act="progcsv">'+ic('dl')+' Unduh CSV</button>'}if(f.tab==='rincian')return tabKinerja()+'<span class="grow"></span>'+T['laporan-produksi']();if(f.tab==='laporan')return tabKinerja()+'<span class="grow"></span><button class="btn ghost" data-act="lapacsv">'+ic('dl')+' Unduh CSV</button>';const per=['wc','produk','kirim'].includes(f.tab)?segBtns('produksi','hari',[['7','7 hari'],['14','14 hari'],['30','30 hari'],['90','90 hari']]):'';return tabKinerja()+per+'<span class="grow"></span>'+(f.tab==='wc'?'<button class="btn ghost" data-act="csv" data-what="prodlog">'+ic('dl')+' CSV Log</button>':'')};
const _tProdLama=()=>{
 const f=F['produksi']||(F['produksi']={wc:'',p:'aktif'});
 const wcOpts=[['','Semua WC'],...S.mwc.filter(x=>x.aktif!==false).sort((a,b)=>a.urutan-b.urutan).map(w=>[w.kode,w.nama])];
 return `<div class="tb-group"><div class="tb-lbl">Work Center</div>
  <select class="sel" data-act="filtsel" data-view="produksi" data-key="wc" id="f-wc">${wcOpts.map(([v,l])=>`<option value="${esc(v)}" ${(f.wc||'')===v?'selected':''}>${esc(l)}</option>`).join('')}</select>
 </div>
 <div class="tb-group"><div class="tb-lbl">SPK</div>
  ${segBtns('produksi','p',[['aktif','Aktif'],['all','Semua']])}
 </div>
 <span class="grow"></span>
 <button class="btn ghost" data-act="csv" data-what="prodlog">${ic('dl')} CSV Log</button>`;
};
B['produksi']=()=>{
 const f0=F['produksi']||(F['produksi']={wc:'',p:'aktif',tab:'wc'});
 tabAdm(f0);
 if(f0.tab==='rincian')return B['laporan-produksi']();
 if(f0.tab==='laporan')return laporanAnalisa();
 if(f0.tab==='progres')return progresWcHtml();
 if(!PXL())return empty('Belum siap','Muat ulang halaman.');
 if(f0.tab==='vendor')return analisaVendor();
 if(f0.tab==='produk')return analisaProduk();
 if(f0.tab==='kirim')return analisaKirim();
 return analisaWC();
};

/* ---------- drawers ---------- */
let DRAWER=null;
function openDrawer(fn){if($('#drawer').hidden)FOK.pic.push(document.activeElement);const baru=$('#drawer').hidden;DRAWER=()=>{const r=fn();if(!r){closeDrawer();return}$('#drawer').innerHTML=`<div class="scrim" data-act="closedrawer"></div><div class="drawer"><aside class="drawer-panel" role="dialog" aria-modal="true"><header><div><h3>${r.t}</h3><p>${r.s||''}</p></div><button class="x" data-act="closedrawer" aria-label="Tutup">×</button></header><div class="dbody${r.cls?' '+r.cls:''}">${r.b}</div></aside></div>`;resolveNames()};$('#drawer').hidden=false;DRAWER();if(baru){const p=$('#drawer .drawer-panel');const x=p&&p.querySelector('.x,button,[href],input');x&&x.focus()}}
function closeDrawer(){const ada=!$('#drawer').hidden;DRAWER=null;$('#drawer').hidden=true;$('#drawer').innerHTML='';if(ada)fokusKembali()}
/* ---------- modal forms ---------- */
function openModal(title,body,onSubmit,opts={}){
 const M=$('#modal');if(M.hidden)FOK.pic.push(document.activeElement);M.className='modal-wrap';
 const subCls=opts.danger?'btn danger':'btn primary';
 M.innerHTML=`<div class="scrim" data-act="closemodal"></div><form class="modal" id="mform" novalidate><header><h3>${title}</h3><button type="button" class="x" data-act="closemodal" aria-label="Tutup">×</button></header><div class="mbody">${body}</div><footer><span class="err" id="merr"></span><button type="button" class="btn ghost" data-act="closemodal">Batal</button><button class="${subCls}" type="submit" id="msub">${opts.submit||'Simpan'}</button></footer></form>`;
 M.hidden=false;const form=$('#mform');
 form.onsubmit=async e=>{e.preventDefault();const b=$('#msub');b.disabled=true;$('#merr').textContent='';
  try{await onSubmit(Object.fromEntries(new FormData(form)),form);closeModal();if(opts.done!==' ')toast(opts.done||'Tersimpan · semua pengguna langsung melihat perubahan ini')}
  catch(err){$('#merr').textContent=err.message||('Gagal menyimpan ('+(err.code||'error')+')');b.disabled=false}};
 opts.mount&&opts.mount(form);const first=form.querySelector('input:not([type=hidden]),select');first&&first.focus();
}
function closeModal(){const ada=!$('#modal').hidden;$('#modal').hidden=true;$('#modal').innerHTML='';if(ada)fokusKembali()}
/* fokus dialog (WCAG 2.4.3): fokus pindah ke dalam saat dibuka, Tab berputar di dalam dialog teratas, dan kembali ke pemicu saat ditutup */
var FOK={pic:[]};
function fokusKembali(){const e=FOK.pic.pop();if(e&&e.isConnected&&typeof e.focus==='function')try{e.focus()}catch(_){}}
const fokusables=el=>[...el.querySelectorAll('a[href],button:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);
function dialogAktif(){if(!$('#modal').hidden)return $('#modal');if(ED)return $('#editor');if(SHEET)return $('#sheet');if(DRAWER)return $('#drawer');return null}
document.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const d=dialogAktif();if(!d)return;const f=fokusables(d);if(!f.length)return;const a=document.activeElement;
 if(!d.contains(a)){e.preventDefault();f[0].focus();return}
 if(e.shiftKey&&a===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&a===f[f.length-1]){e.preventDefault();f[0].focus()}});
const fld=(label,inner,full)=>`<div class="fld ${full?'full':''}"><label>${label}</label>${inner}</div>`;
const inp=(name,val='',type='text',extra='')=>`<input class="inp" id="m-${name}" name="${name}" type="${type}" value="${esc(val)}" ${extra}>`;
/* angka dari isian atau tempelan: koma desimal (1,5), pemisah ribuan bertitik (1.500,75 dan 1.000.000), dan format en (1,500.75). Satu titik tunggal (1.000) dibaca desimal. */
const num0=v=>{let s=String(v==null?'':v).trim().replace(/\s/g,'');if(s.includes(',')&&s.includes('.')){s=s.lastIndexOf(',')>s.lastIndexOf('.')?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'')}else if(/^-?\d{1,3}(\.\d{3}){2,}$/.test(s))s=s.replace(/\./g,'');else s=s.replace(',','.');const x=parseFloat(s);return isNaN(x)?0:x};
function itemSelect(g,sel){
 if(g==='sp'){return `<select class="sel" id="m-item" name="item" required><option value="">Pilih barang…</option>${S.sp.filter(r=>spOn(r)||r._id===sel).slice().sort(spSort).map(r=>`<option value="${r._id}" ${sel===r._id?'selected':''}>${esc(r.kode?r.kode+' · ':'')}${esc(spLabel(r))} — stok ${n(calc().stock.sp[r._id])} ${esc(r.satuan||'')}</option>`).join('')}</select>`}
 if(g==='rm'){const groups={};S.rm.forEach(r=>{if(rmOn(r)||r._id===sel)(groups[grade(r)]=groups[grade(r)]||[]).push(r)});return `<select class="sel" id="m-item" name="item" required><option value="">Pilih material…</option>${Object.entries(groups).map(([k,xs])=>`<optgroup label="${k}">${xs.map(r=>`<option value="${r._id}" ${sel===r._id?'selected':''}>${esc(rmLabel(r))} — stok ${n(calc().stock.rm[r._id])}</option>`).join('')}</optgroup>`).join('')}</select>`}
 const groups={};S.fg.forEach(r=>{const k=r.kategori+(r.type?' '+r.type:'')+' · '+r.finishing;(groups[k]=groups[k]||[]).push(r)});
 return `<select class="sel" id="m-item" name="item" required><option value="">Pilih produk…</option>${Object.entries(groups).sort().map(([k,xs])=>`<optgroup label="${esc(k)}">${xs.map(r=>`<option value="${r._id}" ${sel===r._id?'selected':''}>${esc(r.ukuran)} L${esc(r.panjang)} t${esc(r.tebal)} — stok ${n(calc().stock.fg[r._id])}</option>`).join('')}</optgroup>`).join('')}</select>`;
}
function spkSelect(sel,activeOnly=true,req=false,noStok=false){const c=calc();return `<select class="sel" id="m-spk" name="spk" ${req?'required':''}><option value="">${req?'Pilih SPK…':'— tanpa SPK —'}</option>${S.spk.filter(s=>(!noStok||!s.stokReq)&&(s._id===sel||((!activeOnly||c.spk[s._id].st!=='Selesai')&&c.spk[s._id].st!=='Batal'))).sort((a,b)=>b.no-a.no).map(s=>`<option value="${s._id}" ${sel===s._id?'selected':''}>SPK ${s.no} · ${esc(s.customer)}</option>`).join('')}</select>`}
/* Riwayat produksi gabungan satu SPK: catatan lama (prodLog, total per item) dan hasil mesin (produksi_log, per langkah).
   q = kontribusi ke progres item (hasil mesin hanya dihitung di langkah internal terakhir); qw = jumlah yang dicatat di langkah itu. */
function logProduksi(s){
 const P=PXL();const lama=(s.prodLog||[]).map(l=>({...l,sumber:'lama'}));
 const baru=P?evHasil().filter(e=>e.spk_id===s._id).map(e=>{const it=(s.items||[])[+e.item_idx];const st=it?itemState(s,it,+e.item_idx):null;let q=0;
  if(st){const intern=st.rute.filter(w=>!P.langkahVendor(w));const i=P.indeksLangkah(st.rute,st.alt,e.wc);q=i>=0&&st.rute[i]===intern[intern.length-1]?(+e.qty||0):0}
  return {tgl:e.tgl||P.tanggalLokal(e.at),at:e.at||'',by:e.operator||e.oleh||'',ket:`${e.wc}${e.mesin&&e.mesin!==e.wc?' · '+e.mesin:''}: ${n(+e.qty||0)}${+e.reject?' (reject '+n(+e.reject)+')':''}`,items:[{d:e.item_desc,q,qw:+e.qty||0,wc:e.wc}],sumber:'mesin'}}):[];
 return [...lama,...baru].sort((a,b)=>(String(a.tgl)+String(a.at)).localeCompare(String(b.tgl)+String(b.at)));
}
/* Laporan produksi terpusat (sementara, operator lapangan belum siap): satu admin mengisi total item yang SUDAH SELESAI dan siap ke vendor/customer.
   Tidak ada laporan per Work Centre dan tidak ada catatan mesin palsu; angka disimpan sebagai total manual item (prod) dan prodLog tanpa WC, seperti versi pertama.
   Bawaan AKTIF; matikan lewat setting produksiAdmin=false (master/setting) untuk kembali ke Antrian Mesin per Work Centre. Uji lama memakai window.__PRODUKSI_MESIN. */
function produksiAdmin(){const v=(byId('master','setting')||{}).produksiAdmin;if(v!==undefined)return !!v;return !window.__PRODUKSI_MESIN}
function prodForm(id){
 const s=byId('spk',id);
 const c=calc();const x=c.spk[id]||{};
 const due=s.due||s.deadline||'';
 const todayS=today();
 const dueDays=due?(()=>{let d=0,cur=new Date(todayS<due?todayS:due),end=new Date(todayS<due?due:todayS);while(cur<end){const wd=cur.getDay();if(wd!==0&&wd!==6)d++;cur.setDate(cur.getDate()+1)}return todayS<=due?d:-d})():null;
 const dueCls=!due?'':(dueDays<0?'crit':dueDays<=3?'warn':'ok');
 const dueTxt=!due?'–':(dueDays<0?`⚠ ${-dueDays} hk lewat`:(dueDays===0?'Due hari ini':`${dueDays} hk lagi`));
 const pPct=Math.round((x.pP||0)*100);
 const lastLog=logProduksi(s).slice(-1)[0];
 // WC list from master
 const wcList=S.mwc.filter(w=>w.aktif!==false).sort((a,b)=>a.urutan-b.urutan).map(w=>w.nama);
 // Last WC per item: ambil dari log terbaru yang punya entry untuk item tsb
 const lastWcPerItem={};
 (s.prodLog||[]).forEach(log=>{
  (log.items||[]).forEach(li=>{
   // Support schema baru (li.wc) dan lama (log.wc)
   const wn=li.wc||(log.wc||'');
   if(wn)lastWcPerItem[li.d]=wn;
  });
 });
 // Item status summary
 const doneItems=s.items.filter((i,k)=>{const l=x.lines&&x.lines[k];return (+i.q||0)>0&&(l?+l.prodEff||0:+i.prod||0)>=+i.q}).length;
 const totalItems=s.items.length;
 const summaryBar=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:6px;margin-bottom:14px">
  <div style="background:var(--surface-2);border-radius:8px;padding:8px 10px;text-align:center">
   <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Due date</div>
   <div style="font-size:13px;font-weight:700;color:var(--${dueCls||'fg'})">${dueTxt}</div>
   ${due?`<div style="font-size:10px;color:var(--muted)">${fd(due)}</div>`:''}
  </div>
  <div style="background:var(--surface-2);border-radius:8px;padding:8px 10px;text-align:center">
   <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Produksi</div>
   <div style="font-size:13px;font-weight:700;color:var(--${pPct>=100?'ok':pPct>0?'warn':'muted'})">${pPct}%</div>
   <div style="font-size:10px;color:var(--muted)">${doneItems}/${totalItems} item selesai</div>
  </div>
  <div style="background:var(--surface-2);border-radius:8px;padding:8px 10px;text-align:center">
   <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Terkirim</div>
   <div style="font-size:13px;font-weight:700">${Math.round((x.pK||0)*100)}%</div>
  </div>
  <div style="background:var(--surface-2);border-radius:8px;padding:8px 10px;text-align:center">
   <div style="font-size:11px;color:var(--muted);margin-bottom:2px">Terakhir update</div>
   <div style="font-size:11px;font-weight:600">${lastLog?fd(lastLog.tgl):'–'}</div>
   <div style="font-size:10px;color:var(--muted)">${lastLog?esc(lastLog.by||'–'):''}</div>
  </div>
 </div>`;
 /* Tiap item: rantai langkah dari catatan mesin (baca saja) dan tombol Catat di mesin. Isian total manual hanya untuk item tanpa rute dan SPK lama. */
 const P=PXL();
 const itemRows=s.items.map((i,k)=>{
  const st=P?itemState(s,i,k):null;const adaEv=!!(st&&st.ev.length);const prod=+i.prod||0;const q=+i.q||0;
  const eff=(x.lines&&x.lines[k]&&x.lines[k].prodEff)||0;const pct=q>0?Math.round(Math.min(1,eff/q)*100):0;const done=q>0&&eff>=q;
  const inpManual=`<input class="inp" type="number" min="0" max="${q}" step="any" name="p_${k}" id="m-p_${k}" value="${prod}" style="width:140px;font-size:16px;font-weight:700;text-align:center">`;
  let rantai='',posisi='',aksi='',manual='';
  if(st){
   const aq=P.antrianPerLangkah(st.rute,st.kum,q);const now=aq.findIndex((a,ii)=>a.antri>0&&!P.langkahVendor(st.rute[ii]));
   const rsv=teksReservasi({s,it:i,ix:k,st});
   rantai=`<div style="margin:6px 0">${st.rute.map((w,ii)=>`<span class="rchip${ii===now?' on':''}">${esc(w)} ${n(st.kum[w]||0)}/${n(q)}</span>`).join('<span class="rarr">›</span>')}</div>`;
   const tx={wc:p=>`${esc(p.tempat)} ${n(p.qty)}`,'vendor-siap-kirim':p=>`siap kirim ke ${esc(p.tempat)} ${n(p.qty)}`,'di-vendor':p=>`di ${esc(p.tempat)} ${n(p.qty)}`,selesai:p=>`selesai produksi ${n(p.qty)}`};
   const pos=P.posisiItem(st.rute,st.kum,q,st.vendorKirim);
   posisi=(pos.length?`<div class="note">Posisi: ${pos.map(p=>(tx[p.jenis]||tx.wc)(p)).join(' · ')}</div>`:'')+(rsv?`<div class="note">Sedang dikerjakan: ${rsv}</div>`:'');
   aksi=produksiAdmin()?'':aq.map((a,ii)=>({w:st.rute[ii],antri:a.antri})).filter(z=>z.antri>0&&!P.langkahVendor(z.w)).map((z,j)=>`<button type="button" class="btn sm ${j===0?'primary':'ghost'}" data-act="prodcatat" data-k="${esc(s._id+'|'+k)}" data-wc="${esc(z.w)}">Catat hasil di ${esc(z.w)} (${n(z.antri)} siap)</button>`).join(' ');
   manual=produksiAdmin()?`<div style="margin-top:8px"><div class="note" style="margin-bottom:4px">${adaEv?'Selesai tambahan di luar catatan mesin':'Total selesai (siap ke vendor / customer)'}</div>${inpManual} <span class="note">dari ${n(q)} ${esc(i.u||'')}</span></div>`:adaEv?'':`<details class="prod-manual"${prod>0?' open':''}><summary>SPK lama: isi total manual</summary><div style="margin-top:6px">${inpManual}</div></details>`;
  }else manual=`<div class="note" style="margin-bottom:4px">Rute produk belum dikenali (judul section tanpa nama produk). Isi total manual.</div>${inpManual}`;
  if(produksiAdmin()){rantai='';posisi=''}
  return `<div style="border:1px solid var(--${done?'ok':'line'});border-radius:10px;padding:12px;margin-bottom:10px;background:var(--surface)">
   <div style="font-weight:700;font-size:13px">${esc(i.d)}${done?' <span class="chip ok">selesai</span>':''}</div>
   <div style="display:flex;align-items:center;gap:8px;margin:6px 0 0"><div style="flex:1;height:7px;background:var(--line);border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:var(--${done?'ok':'accent'});border-radius:4px"></div></div><span style="font-size:12px;color:var(--muted);white-space:nowrap">${n(eff)} / ${n(q)} ${esc(i.u||'')} · ${pct}%</span></div>
   ${rantai}${posisi}<div style="margin-top:8px">${aksi}</div>${manual}
  </div>`;
 }).join('');
 const adaManual=s.items.some((i,k)=>{const st=P?itemState(s,i,k):null;return !st||!st.ev.length});
 openModal(`Update produksi · SPK ${s.no}`,
  summaryBar+
  `<div class="note full" style="margin-bottom:10px">${produksiAdmin()?'Isi <b>jumlah yang sudah selesai</b> tiap item lalu simpan. Cukup total per item; tidak ada laporan per Work Centre dan tidak perlu memilih mesin.':'Hasil produksi dicatat <b>per mesin</b>: operator memakai Mulai dan Selesai di <a href="#mesin" data-act="closemodal">Antrian Mesin</a>. Di sini Anda melihat posisi tiap item, dan bisa mencatat hasil langsung lewat tombol <b>Catat hasil</b> di bawah item.'}</div>`+
  ((adaManual||produksiAdmin())?`<div class="full" style="display:flex;gap:8px;margin-bottom:10px"><button type="button" class="btn sm ghost" data-act="prodall" style="flex:1">Set semua item selesai</button></div>`:'')+
  `<div class="full">${itemRows}</div>`+
  `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">`+
  fld('Tanggal',inp('tgl',todayS,'date','required'))+
  fld('Catatan / kendala',`<input class="inp" name="alasan" value="${esc(s.alasan||'')}" placeholder="Opsional: kendala, estimasi…">`)+
  `</div>`,
  async d=>{
   const tgl=d.tgl||todayS;
   if(tgl>todayS)throw new Error('Tanggal tidak boleh di masa depan.');
   if(tgl<s.tgl)throw new Error('Tanggal sebelum tanggal SPK.');
   const items=s.items.map((i,k)=>('p_'+k) in d?{...i,prod:Math.min(+i.q,num0(d['p_'+k]))}:i);
   const berubah=items.some((i,k)=>(+i.prod||0)!==(+s.items[k].prod||0));
   const patch={alasan:d.alasan||''};
   if(berubah){patch.items=items;patch.prodLog=[...(s.prodLog||[]),{tgl,at:new Date().toISOString(),by:ME||null,ket:d.alasan||'',items:items.map(i=>({d:i.d,q:+i.prod||0,wc:''}))}]}
   await updDoc('spk',id,patch);
  },{submit:'Simpan'});
}
/* Form khusus input kendala / alasan keterlambatan — tanpa update qty produksi */
function kendalForm(id){
 const s=byId('spk',id);if(!s)return;
 const c=calc();const x=c.spk[id]||{};
 const infoHtml=`<div class="dw-meta-grid" style="margin-bottom:12px">
  <div class="dw-meta-card"><span>SPK</span><b>${s.no}</b></div>
  <div class="dw-meta-card"><span>Customer</span><b>${esc(s.customer)}</b></div>
  <div class="dw-meta-card"><span>Terlambat</span><b class="crit">${x.late||0} hari</b></div>
  <div class="dw-meta-card"><span>Terkirim</span><b>${Math.round((x.pK||0)*100)}%</b></div>
 </div>`;
 openModal(`Catatan kendala · SPK ${s.no}`,
  infoHtml+
  fld('Kendala / alasan keterlambatan',`<textarea class="inp" name="alasan" rows="3" placeholder="Jelaskan penyebab: misal mesin rusak, material telat datang, revisi order customer…" style="width:100%;resize:vertical">${esc(s.alasan||'')}</textarea>`,true)+
  fld('Tindakan / rencana penyelesaian',`<textarea class="inp" name="tindakan" rows="2" placeholder="Langkah yang sedang/akan diambil…" style="width:100%;resize:vertical">${esc(s.tindakan||'')}</textarea>`,true)+
  `<p class="note full">Catatan ini terlihat di Dashboard, Cek Data, dan Laporan. Untuk update qty produksi gunakan tombol "Update produksi" di drawer SPK.</p>`,
  async d=>{
   const alasan=String(d.alasan||'').trim();
   if(!alasan)throw new Error('Isi alasan / kendala dulu.');
   await updDoc('spk',id,{alasan,tindakan:String(d.tindakan||'').trim()});
   toast('Catatan kendala disimpan');
  },{submit:'Simpan catatan'});
}
function bufForm(id,g){g=g||'rm';const r=byId(g,id);if(!r)return;const nm=g==='rm'?rmLabel(r):g==='sp'?spLabel(r):fgLabel(r);
 openModal(`Buffer stok · ${esc(nm)}`,(g==='sp'?fld('Stok minimum',inp('min',r.min||0,'number','min="0" step="any"')):'')+fld('Buffer (target stok)',inp('buffer',r.buffer||0,'number','min="0" step="any"'),g!=='sp')+`<div class="note full">${g==='sp'?'Stok minimum = batas untuk mulai memesan. Buffer = target stok yang ingin dijaga; usulan isi ulang mengisi sampai buffer.':'Item tampil kuning "Di bawah buffer" dan masuk daftar perlu tindakan bila stok di bawah angka ini. Isi 0 bila tidak memakai buffer.'}</div>`,async d=>{const bf=num0(d.buffer);if(g==='sp'&&bf>0&&num0(d.min)>bf)throw new Error('Stok minimum tidak boleh lebih besar dari buffer.');await updDoc(g,id,g==='sp'?{min:num0(d.min),buffer:bf}:{buffer:bf});toast('Buffer disimpan')})}

/* ---------- data hygiene: master data, numbering, dock links ---------- */
const MK={vendor:'mvendor',customer:'mcustomer',supplier:'msupplier',armada:'marmada'};
const MLBL={vendor:'vendor',customer:'customer',supplier:'supplier',armada:'armada'};
const UNKNOWN_V=v=>!v||v==='Vendor Finishing';
const normName=x=>String(x||'').toUpperCase().replace(/^(PT|CV|UD|PERSEROAN KOMANDITER|BAPAK|BPK|IBU)\.?\s+/,'').replace(/[^A-Z0-9]/g,'');
const cleanName=x=>String(x||'').trim().replace(/\s+/g,' ').replace(/\s*-\s*$/,'');
const mList=k=>S[MK[k]].filter(x=>x.aktif!==false);
const mNames=k=>mList(k).map(x=>k==='armada'?x.nopol:x.nama).sort();
const inMaster=(k,name)=>mList(k).some(x=>(k==='armada'?x.nopol:x.nama)===name);
const similarTo=(k,name)=>{const nn=normName(name);return nn?mList(k).find(x=>x.nama!==name&&normName(x.nama)===nn):null};
const dl=(id,arr)=>`<datalist id="${id}">${[...new Set(arr.filter(Boolean))].map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`;
/* Checks a typed name against the master list. Unknown names need a second Save click to be registered;
   a near-duplicate is swapped for the registered spelling so the same company is never stored twice. */
async function ensureMaster(k,raw,form,field,extra={}){
 const name=cleanName(raw);if(!name)throw new Error(`Isi nama ${MLBL[k]}.`);
 if(inMaster(k,name))return name;
 const sim=similarTo(k,name);
 if(sim){const el=form&&form.querySelector(`[name="${field}"]`);if(el)el.value=sim.nama;throw new Error(`Diganti ke "${sim.nama}" (nama terdaftar yang sama). Klik simpan lagi.`)}
 const key=k+':'+name;
 if(form&&form.dataset.okNew!==key){form.dataset.okNew=key;throw new Error(`"${name}" belum ada di Master ${MLBL[k]}. Klik simpan sekali lagi untuk mendaftarkannya.`)}
 await addDoc(MK[k],{nama:name,aktif:true,...extra});return name;
}
async function rememberArmada(nopol,kendaraan,driver){const p=String(nopol||'').toUpperCase().trim();if(!p||inMaster('armada',p))return;try{await addDoc('marmada',{nopol:p,jenis:kendaraan||'',driver:driver||'',milik:'',aktif:true})}catch(_){}}
const DOCFMT={SJV:'SJ-V',SJ:'SJ',RCV:'RCV',PK:'PK',BJM:'BJ-M',BJK:'BJ-K',SPM:'SP-M',SPX:'SP-K',SPO:'SP-OPN',PR:'PR',OPN:'OPN'};
async function nextDocNo(kind,tgl){
 need();const ym=String(tgl||today()).slice(0,7);const ref=DB.doc(`counter/${kind}-${ym.replace('-','')}`);
 let got=false;for(let i=0;i<6&&!got;i++){try{const r=await ref.acquire({holder:(ME||'u')+HOLDER,ttlMs:6000});got=!r||r.acquired!==false}catch(_){got=true}if(!got)await new Promise(r=>setTimeout(r,300+Math.random()*700))}
 if(!got)throw new Error('Penomoran sedang dipakai pengguna lain. Klik simpan lagi.');
 const g=await ref.get();const nn=(g.exists?(+((g.data()||{}).n)||0):0)+1;await ref.set({n:nn});
 return `${DOCFMT[kind]}/${ym.slice(0,4)}/${ym.slice(5,7)}/${String(nn).padStart(3,'0')}`;
}
const sjTaken=no=>S.vendor.some(v=>v.noSJ===no&&v.status!=='Batal')||S.kirim.some(k=>k.noSJ===no&&k.status!=='Batal');
async function queueDock(o){try{await addDoc('bongkar',{jenis:o.jenis,muatan:o.muatan,pihak:o.pihak||'',ref:o.ref||'',kendaraan:o.kendaraan||'',nopol:(o.nopol||'').toUpperCase(),driver:o.driver||'',tgl:o.tgl||today(),jamMasuk:'',jamMulai:'',jamSelesai:'',status:'Antri',ket:o.ket||'',link:o.link||null,auto:true})}catch(_){}}
const dockCk=(lbl,on=true)=>`<label class="ck full"><input type="checkbox" name="dock" id="m-dock" ${on?'checked':''}> ${lbl}</label>`;
const armadaFields=()=>{
 const arms=mList('armada').filter(a=>a.aktif!==false).sort((a,b)=>String(a.nopol).localeCompare(String(b.nopol)));
 const nopolOpts=`<option value=""></option>${arms.map(a=>`<option value="${esc(a.nopol)}">${esc(a.nopol)}${a.jenis?' · '+esc(a.jenis):''}${a.driver?' · '+esc(a.driver):''}</option>`).join('')}<option value="__manual__">⊕ Input manual…</option>`;
 return `<input type="hidden" name="nopol" id="m-nopol-hid"><div class="frow"><div class="fld full"><label>Armada / Kendaraan</label><select class="sel" id="m-armsel">${nopolOpts}</select></div></div><div id="m-arm-manual" style="display:none"><div class="frow">${fld('No polisi (manual)',inp('nopol_m','','text','placeholder="B 1234 XYZ"'))}${fld('Kendaraan',inp('kendaraan','','text','list="dl-kend"'))}</div>${fld('Driver',inp('driver','','text'),true)}</div>${dl('dl-kend',['Pick-up','Engkel','CDD','CDE','Fuso','Wingbox','Trailer','Ekspedisi',...arms.map(a=>a.jenis).filter(Boolean)])}`;
};
function bindArmada(f){
 const sel=f.querySelector('#m-armsel');if(!sel)return;
 const manDiv=f.querySelector('#m-arm-manual');
 const fillFromArmada=nopol=>{
  const a=mList('armada').find(x=>x.nopol===nopol);
  if(a){
   if(f.kendaraan)f.kendaraan.value=a.jenis||'';
   if(f.driver)f.driver.value=a.driver||'';
  }
 };
 sel.addEventListener('change',()=>{
  if(sel.value==='__manual__'){
   if(manDiv)manDiv.style.display='';
   sel.value='';
  } else {
   if(manDiv)manDiv.style.display='none';
   fillFromArmada(sel.value);
   /* sync hidden nopol field */
   const hid=f.querySelector('[name=nopol]');if(hid)hid.value=sel.value;
  }
 });
}
/* helper: baca nopol dari form data hasil armadaFields() */
const getNopol=d=>String(d.nopol_m||d.nopol||'').toUpperCase().trim();

/* ---------- BONGKAR MUAT board ---------- */
B['bongkar-muat']=()=>{
 const f=F['bongkar-muat'],t=today(),q=String(f.q||'').toLowerCase().trim();
 const list=S.bongkar.filter(b=>{if(b.status==='Batal')return false;if(f.jenis&&b.jenis!==f.jenis)return false;
  if(q&&!`${b.nopol} ${b.pihak} ${b.ref} ${b.muatan} ${b.driver} ${b.kendaraan} ${b.link&&(b.link.noSJ||b.link.noDok)||''}`.toLowerCase().includes(q))return false;
  if(f.range==='0')return b.tgl===t||b.status!=='Selesai';if(f.range==='7')return days(b.tgl,t)<=7||b.status!=='Selesai';return true}).sort((a,b)=>(b.tgl+(b.jamMasuk||'')).localeCompare(a.tgl+(a.jamMasuk||'')));
 if(!S.bongkar.filter(b=>b.status!=='Batal').length)return `<section class="panel">${empty('Belum ada catatan bongkar muat','Surat jalan ke vendor, ke customer, dan penerimaan material otomatis masuk antrian di sini. Truk lain bisa dicatat manual. Status Antri → Proses → Selesai terlihat realtime oleh semua orang.',`<button class="btn primary" data-act="newbm">${ic('plus')}Catat kendaraan</button>`)}</section>`;
 const CAP=8;
 const kartu=(b,st)=>{const cs=bmCekStat(b),nf=(b.foto||[]).length,ref=b.link&&(b.link.noSJ||b.link.noDok)||b.ref||'';
  return `<div class="card bm-card click" data-act="openbm" data-id="${b._id}"><div class="row"><span class="dir ${b.jenis==='Unloading'?'in':'out'}">${b.jenis==='Unloading'?'↓ UNLOADING':'↑ LOADING'}</span><span class="plate">${esc(b.nopol||'—')}</span>${b.auto?'<span class="chip plain" title="Dibuat otomatis dari dokumen">auto</span>':''}<span class="muted" style="margin-left:auto">${fd(b.tgl)}</span></div>
  <div class="bm-line"><b>${esc(b.muatan)}</b> · ${esc(b.pihak||'')}</div>
  <div class="note bm-line">${b.jamMasuk?'Masuk '+esc(b.jamMasuk):'Belum tiba'}${b.jamMulai?' · mulai '+esc(b.jamMulai):''}${b.jamSelesai?' · selesai '+esc(b.jamSelesai)+' ('+dur(b.jamMulai||b.jamMasuk,b.jamSelesai)+')':''}</div>
  <div class="bm-badges">${cs.n?chip('Cek '+cs.done+'/'+cs.n,cs.done===cs.n?'ok':cs.done?'warn':'plain'):''}${nf?chip(nf+' foto','info'):''}${ref?`<span class="mono note" title="Referensi">${esc(ref)}</span>`:''}</div>
  ${st!=='Selesai'?`<div class="acts">${st==='Antri'?`<button class="btn sm primary" data-act="bmstep" data-id="${b._id}" data-to="Proses">Mulai ${b.jenis.toLowerCase()}</button>`:`<button class="btn sm primary" data-act="bmstep" data-id="${b._id}" data-to="Selesai">${ic('chk')}Selesai</button>`}<button class="btn sm ghost" data-act="void" data-c="bongkar" data-id="${b._id}">Batalkan</button></div>`:''}
 </div>`};
 const col=(st)=>{const xs=list.filter(b=>b.status===st);const lim=st==='Selesai'&&!f.all&&xs.length>CAP;const tampil=lim?xs.slice(0,CAP):xs;
  const more=st==='Selesai'&&xs.length>CAP?`<button class="btn sm ghost" data-act="filt" data-view="bongkar-muat" data-key="all" data-val="${f.all?'false':'true'}">${f.all?'Ringkas (tampilkan '+CAP+' terbaru)':'Tampilkan semua ('+xs.length+')'}</button>`:'';
  return `<div class="col"><h3>${st}${chip(String(xs.length),st==='Antri'?'warn':st==='Proses'?'info':'ok')}</h3><div class="col-body">${tampil.length?tampil.map(b=>kartu(b,st)).join(''):`<div class="note" style="padding:6px 4px">${q?'Tidak ada yang cocok':'Kosong'}</div>`}</div>${more}</div>`};
 return `<div class="kanban bm-kanban">${col('Antri')}${col('Proses')}${col('Selesai')}</div>`;
};

/* ---------- VENDOR list ---------- */
B['vendor']=()=>{
 const c=calc(),f=F.vendor,q=f.q.toLowerCase();
 const xs=c.vend.filter(x=>{if(f.st==='aktif'&&(x.st==='Selesai'||x.st==='Batal'))return false;if(f.st==='selesai'&&x.st!=='Selesai')return false;if(f.vendor&&x.v.vendor!==f.vendor)return false;
  if(q){const s=byId('spk',x.v.spk);if(!`${x.v.noSJ} ${s?.no} ${s?.customer} ${x.v.vendor}`.toLowerCase().includes(q))return false}return true}).sort((a,b)=>f.st==='aktif'?b.age-a.age:b.v.tgl.localeCompare(a.v.tgl));
 const open=c.vend.filter(x=>x.st==='Di Vendor'||x.st==='Kembali Sebagian');const rej=c.vend.reduce((a,x)=>a+(x.st==='Batal'?0:x.rej),0);
 const vTonKgOpen=open.reduce((a,x)=>{const vd=byId('vendor',x.v._id);return a+(vd?.items||[]).reduce((b,it)=>b+(+it.q||0)*wRealDok(vd,it),0)},0);
 const summ=`<div class="summ">${chip(`${open.length} SJ masih di vendor`,'warn')}${chip(`${n(open.reduce((a,x)=>a+x.sisa,0))} btg/pcs belum kembali`,'info')}${vTonKgOpen>0?chip(`${ton(vTonKgOpen)} ton di vendor`,'warn'):''}${chip(`${open.filter(x=>x.age>14).length} lewat 14 hari`,open.some(x=>x.age>14)?'crit':'ok')}${rej?chip(`${n(rej)} reject dari vendor`,'crit'):''}${open.some(x=>UNKNOWN_V(x.v.vendor))?`<a class="chip warn" href="#cek-data">${open.filter(x=>UNKNOWN_V(x.v.vendor)).length} SJ tanpa nama vendor</a>`:''}</div>`;
 const rows=xs.map(x=>{const s=byId('spk',x.v.spk);const act=x.st==='Di Vendor'||x.st==='Kembali Sebagian';const vd=byId('vendor',x.v._id);const wkg=(vd?.items||[]).reduce((b,it)=>b+(+it.q||0)*wRealDok(vd,it),0);return `<tr class="click ${x.st==='Batal'?'void':''}" data-act="openvendor" data-id="${x.v._id}"><td class="mono">${esc(x.v.noSJ||'–')}</td><td>${fd(x.v.tgl)}</td><td>${UNKNOWN_V(x.v.vendor)?'<span class="chip warn">belum diisi</span>':`<b>${esc(x.v.vendor)}</b>`}</td><td>${esc(x.v.proses||'')}</td><td>${s?`SPK ${s.no}<div class="note">${esc(s.customer)}</div>`:'–'}</td><td class="num">${n(x.out)}</td><td class="num">${n(x.back)}${x.rej?`<div class="note" style="color:var(--crit)">${n(x.rej)} reject</div>`:''}</td><td class="num big">${n(x.sisa)}${wkg?`<div class="note">${ton(wkg)} ton</div>`:''}</td><td class="num" style="${act&&x.age>14?'color:var(--crit);font-weight:600':act&&x.age>7?'color:var(--warn);font-weight:600':''}">${act?x.age+' hr':'–'}</td><td>${stChip(x.st)}</td><td>${act?`<button class="btn sm" data-act="terima" data-id="${x.v._id}">Terima kembali</button>`:''}</td></tr>`}).join('');
 return `<section class="panel"><div class="pbody">${summ}</div>${xs.length?`<div class="tbl-wrap"><table><thead><tr><th>No SJ</th><th>Tgl kirim</th><th>Vendor</th><th>Proses</th><th>SPK / Customer</th><th class="num">Kirim</th><th class="num">Kembali</th><th class="num">Sisa</th><th class="num">Umur</th><th>Status</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:empty(f.st==='aktif'?'Tidak ada barang di vendor':'Tidak ada data yang cocok','Kiriman barang setengah jadi ke vendor finishing akan tampil di sini dengan umur harinya.')}</section>`;
};

/* ---------- drawers ---------- */
const MVL={masuk:'Masuk',keluar:'Keluar',opname:'Opname',koreksi:'Koreksi'};
function kartu(g,id){if(g==='rm')return kartuRm(id);openDrawer(()=>{const it=byId(g,id);if(!it)return null;const c=calc();const s=c.stock[g][id];const mv=S.mutasi.filter(m=>m.gudang===g&&m.item===id).sort((a,b)=>(a.tgl+a.at).localeCompare(b.tgl+b.at));
 let run=+it.stokAwal||0;const rows=[`<tr><td>${fd(it.tglStokAwal)}</td><td>${chip('Stok awal','plain')}</td><td class="num">${n(run)}</td><td class="num">${n(run)}</td><td class="muted">Import Excel</td><td></td></tr>`].concat(mv.map(m=>{run+= +m.delta||0;return `<tr class="${m.dikoreksi?'void':''}"><td>${fd(m.tgl)}</td><td>${stChip(MVL[m.jenis]||m.jenis)}</td><td class="num" style="color:${m.delta<0?'var(--crit)':'var(--ok)'}">${m.delta>0?'+':''}${n(m.delta)}</td><td class="num"><b>${n(run)}</b></td><td>${m.noDok?`<span class="mono">${esc(m.noDok)}</span> · `:''}${esc(m.ref||'')}${m.pihak?' · '+esc(m.pihak):''}<div class="note">${esc(m.ket||'')} · ${who(m.by)}</div></td><td>${!m.dikoreksi&&m.jenis!=='koreksi'&&CAN?`<button class="btn sm ghost" data-act="koreksi" data-id="${m._id}">Koreksi</button>`:''}</td></tr>`}));
 const[st,cl]=g==='sp'?spState(it,s):stockState(it,s);
 return {t:esc(g==='rm'?rmLabel(it):g==='sp'?spLabel(it):fgLabel(it)),s:`Kartu stok · ${g==='rm'?'Gudang bahan baku':g==='sp'?'Gudang sparepart':'Gudang barang jadi'}`,b:`<div class="kv"><div><span>Stok sekarang</span><b class="big">${n(s)} ${esc(it.satuan)}</b></div><div><span>Buffer</span><b>${it.buffer>0?n(it.buffer):'–'}</b></div>${g==='sp'?`<div><span>Minimum</span><b>${it.min>0?n(it.min):'–'}</b></div>`:''}<div><span>Status</span><b>${chip(st,cl)}</b></div><div><span>Jumlah mutasi</span><b>${mv.length}</b></div>${g==='fg'&&(fgResMap()[id]||0)>0?`<div><span>Dicadangkan SPK</span><b>${n(fgResMap()[id])}</b></div><div><span>Tersedia</span><b>${n(s-fgResMap()[id])}</b></div>`:''}</div>
 ${itemTrenHtml(g,id,it,s)}
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary sm" data-act="mv" data-g="${g}" data-j="masuk" data-item="${id}">${ic('inb')}Masuk</button><button class="btn sm" data-act="mv" data-g="${g}" data-j="keluar" data-item="${id}">${ic('outb')}Keluar</button><button class="btn sm" data-act="mv" data-g="${g}" data-j="opname" data-item="${id}">${ic('chk')}Opname</button><button class="btn sm ghost" data-act="editbuf" data-g="${g}" data-id="${id}">${g==='sp'?'Ubah minimum & buffer':'Ubah buffer'}</button></div>
 <div class="tbl-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th class="num">Qty</th><th class="num">Saldo</th><th>Dokumen / referensi</th><th></th></tr></thead><tbody>${rows.reverse().join('')}</tbody></table></div>
 <p class="note">Transaksi tidak bisa dihapus. Salah input diperbaiki dengan <b>Koreksi</b>: sistem membuat transaksi pembalik, riwayat aslinya tetap tercatat.</p>`}})}
function vendorDrawer(id){openDrawer(()=>{const v=byId('vendor',id);if(!v)return null;const x=calc().vend.find(y=>y.v._id===id);const s=byId('spk',v.spk);const act=x.st==='Di Vendor'||x.st==='Kembali Sebagian';
 return {t:`${esc(v.noSJ||'Surat jalan')} → ${UNKNOWN_V(v.vendor)?'(vendor belum diisi)':esc(v.vendor)}`,s:`${esc(v.proses||'')} · ${s?'SPK '+s.no+' · '+esc(s.customer):''}`,b:`<div class="kv"><div><span>Tgl kirim</span><b>${fd(v.tgl)}</b></div><div><span>Target kembali</span><b>${fd(v.target)}</b></div><div><span>Umur</span><b>${act?x.age+' hari':'–'}</b></div><div><span>Status</span><b>${stChip(x.st)}</b></div><div><span>Kendaraan</span><b>${esc(v.nopol||'–')}</b></div></div>
 ${v.batal?`<div class="ro">Dibatalkan ${fd(v.batal.at)} oleh ${who(v.batal.by)}: ${esc(v.batal.alasan)}</div>`:''}
 <div class="tbl-wrap"><table><thead><tr><th>Item</th><th class="num">Kirim</th><th class="num">Kembali OK</th><th class="num">Reject</th><th class="num">Sisa di vendor</th></tr></thead><tbody>${(v.items||[]).map(i=>`<tr><td>${esc(i.d)}</td><td class="num">${n(i.q)} ${esc(i.u)}</td><td class="num">${n(i.kembali)}</td><td class="num" style="${i.reject?'color:var(--crit);font-weight:600':''}">${n(i.reject||0)}</td><td class="num big">${n(Math.max(0,i.q-(+i.kembali||0)-(+i.reject||0)))}</td></tr>`).join('')}</tbody></table></div>
 ${(v.riwayat||[]).length?`<div class="note">${v.riwayat.map(r=>`Diterima ${fd(r.tgl)}: ${n(r.qty)} OK${r.rej?`, ${n(r.rej)} reject`:''} · ${who(r.by)}${r.ket?' · '+esc(r.ket):''}`).join('<br>')}</div>`:''}${v.ket?`<div class="note">${esc(v.ket)}</div>`:''}
 <div class="sec-lbl">Preview Dokumen</div>
 ${sjvPreview(v,s)}
 <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:4px"><span class="docn">Surat Jalan Vendor</span><button class="btn sm ghost" data-act="doc" data-kind="sjv" data-ref="${id}" data-fmt="xlsx">${ic('dl')}Excel</button><button class="btn sm ghost" data-act="doc" data-kind="sjv" data-ref="${id}" data-fmt="pdf">${ic('file')}PDF</button>${vReturns(v).map(r=>`<span class="docn">BTB ${r.tgl?fd(r.tgl):'(lama)'}</span><button class="btn sm ghost" data-act="doc" data-kind="btb" data-ref="${id}|${r.k}" data-fmt="xlsx">${ic('dl')}Excel</button><button class="btn sm ghost" data-act="doc" data-kind="btb" data-ref="${id}|${r.k}" data-fmt="pdf">${ic('file')}PDF</button>`).join('')}</div>
 <div style="display:flex;gap:8px;flex-wrap:wrap">${act?`<button class="btn primary sm" data-act="terima" data-id="${id}">Terima kembali</button>`:''}${UNKNOWN_V(v.vendor)&&v.status!=='Batal'?`<button class="btn sm" data-act="setvendor" data-id="${id}">Isi nama vendor</button>`:''}${v.status!=='Batal'&&x.back+x.rej===0?`<button class="btn sm danger" data-act="void" data-c="vendor" data-id="${id}">Batalkan SJ</button>`:''}</div>`}})}
function sjvPreview(v,s){
 const mv=mList('vendor').find(x=>x.nama===v.vendor)||{};
 const items=(v.items||[]).map(i=>sjNama(v.spk,i));
 const totalQty=sumBy(items,i=>+i.q||0);
 const metaRows=[
  ['Kepada',v.vendor||'-'],
  ['Alamat',mv.alamat||'-'],
  ['Tanggal',tglLong(v.tgl)],
  ['Target kembali',v.target?tglLong(v.target):'-'],
  ['Proses',v.proses||'-'],
  ['Ref SPK',s?('SPK '+s.no+(s.customer?' · '+s.customer:'')):'-'],
  ['Kendaraan',[v.kendaraan,v.nopol].filter(Boolean).join(' · ')||'-'],
  ['Driver',v.driver||'-'],
 ];
 return `<div class="sj-prev" style="${dkStyle('sjv')}">${docHeadHtml('sjv',{title:'SURAT JALAN VENDOR',no:v.noSJ,date:v.tgl})}
  <table class="sj-prev-meta">
   ${metaRows.map(([l,val])=>`<tr><td>${esc(l)}</td><td>:</td><td>${esc(val)}</td></tr>`).join('')}
  </table>
  <table class="sj-prev-tbl">
   <thead><tr><th style="width:6%">No</th><th>Nama Barang</th><th style="width:12%">Qty</th><th style="width:10%">Satuan</th><th style="width:18%">Keterangan</th>${bmPrev('vendor',v).th}</tr></thead>
   <tbody>
    ${items.map((i,idx)=>`<tr><td style="text-align:center">${idx+1}</td><td>${esc(i.d)}</td><td style="text-align:right">${n(i.q)}</td><td style="text-align:center">${esc(i.u||'')}</td><td></td>${bmPrev('vendor',v).td(idx)}</tr>`).join('')}
    <tr class="sj-prev-foot"><td colspan="2" style="text-align:right;font-weight:600">TOTAL</td><td style="text-align:right;font-weight:600">${n(totalQty)}</td><td colspan="${bmPrev('vendor',v).cs}"></td></tr>
   </tbody>
  </table>
  ${gxNote('vendor',v)}
  ${bmPrev('vendor',v).foto}
  ${v.ket?`<div class="sj-prev-note">Catatan: ${esc(v.ket)}</div>`:''}
  ${v.batal?`<div class="sj-prev-note" style="color:var(--crit)">DIBATALKAN: ${esc(v.batal.alasan)}</div>`:''}
  <div class="sj-prev-signs">
   <div class="sj-prev-sign"><div class="sj-prev-signlbl">Hormat kami,</div><div class="sj-prev-signco">${esc(KOP().nama)}</div><div class="sj-prev-signline"></div><div class="sj-prev-signname">( _________________ )</div></div>
   <div class="sj-prev-sign"><div class="sj-prev-signlbl">Pengemudi</div><div class="sj-prev-signco">&nbsp;</div><div class="sj-prev-signline"></div><div class="sj-prev-signname">( ${esc(v.driver||'_________________')} )</div></div>
   <div class="sj-prev-sign"><div class="sj-prev-signlbl">Diterima oleh,</div><div class="sj-prev-signco">${esc(v.vendor||'Vendor')}</div><div class="sj-prev-signline"></div><div class="sj-prev-signname">( _________________ )</div></div>
  </div>
 </div>`;
}
function sjPreview(k,s){
 const cu=mList('customer').find(x=>x.nama===k.customer)||{};
 const items=(k.items||[]).map(i=>sjNama(k.spk,i));
 const totalQty=sumBy(items,i=>+i.q||0);
 const metaRows=[
  ['Kepada',k.customer||'-'],
  ['Alamat',k.alamat||cu.alamat||'-'],
  ['Tanggal',tglLong(k.tgl)],
  ['No PO',s&&s.po||'-'],
  ['Ref SPK',s?(s.nomor||(s.no?String(s.no):'-')):'-'],
  ['Kendaraan',[k.kendaraan,k.nopol].filter(Boolean).join(' · ')||'-'],
  ['Driver',k.driver||'-'],
 ];
 return `<div class="sj-prev" style="${dkStyle('sjc')}">${docHeadHtml('sjc',{title:'SURAT JALAN',no:k.noSJ,date:k.tgl})}
  <table class="sj-prev-meta">
   ${metaRows.map(([l,v])=>`<tr><td>${esc(l)}</td><td>:</td><td style="white-space:pre-line">${esc(v)}</td></tr>`).join('')}
  </table>
  <table class="sj-prev-tbl">
   <thead><tr><th style="width:6%">No</th><th>Nama Barang</th><th style="width:12%">Qty</th><th style="width:10%">Satuan</th><th style="width:18%">Keterangan</th>${bmPrev('kirim',k).th}</tr></thead>
   <tbody>
    ${items.map((i,idx)=>`<tr><td style="text-align:center">${idx+1}</td><td>${esc(i.d)}</td><td style="text-align:right">${n(i.q)}</td><td style="text-align:center">${esc(i.u||'')}</td><td></td>${bmPrev('kirim',k).td(idx)}</tr>`).join('')}
    <tr class="sj-prev-foot"><td colspan="2" style="text-align:right;font-weight:600">TOTAL</td><td style="text-align:right;font-weight:600">${n(totalQty)}</td><td colspan="${bmPrev('kirim',k).cs}"></td></tr>
   </tbody>
  </table>
  ${sjPartialHtml(k)}
  ${gxNote('kirim',k)}
  ${bmPrev('kirim',k).foto}
  ${k.ket?`<div class="sj-prev-note">Catatan: ${esc(k.ket)}</div>`:''}
  ${k.batal?`<div class="sj-prev-note" style="color:var(--red)">DIBATALKAN: ${esc(k.batal.alasan)}</div>`:''}
  <div class="sj-prev-signs">
   <div class="sj-prev-sign"><div class="sj-prev-signlbl">Hormat kami,</div><div class="sj-prev-signco">${esc(KOP().nama)}</div><div class="sj-prev-signline"></div><div class="sj-prev-signname">( _________________ )</div></div>
   <div class="sj-prev-sign"><div class="sj-prev-signlbl">Pengemudi</div><div class="sj-prev-signco">&nbsp;</div><div class="sj-prev-signline"></div><div class="sj-prev-signname">( ${esc(k.driver||'_________________')} )</div></div>
   <div class="sj-prev-sign"><div class="sj-prev-signlbl">Diterima oleh,</div><div class="sj-prev-signco">${esc(k.customer||'Customer')}</div><div class="sj-prev-signline"></div><div class="sj-prev-signname">( _________________ )</div></div>
  </div>
 </div>`;
}
function kirimDrawer(id){openDrawer(()=>{const k=byId('kirim',id);if(!k)return null;const s=byId('spk',k.spk);
 return {t:`${esc(k.noSJ||'Surat jalan')} · ${esc(k.customer)}`,s:s?`SPK ${s.no} · PO ${esc(s.po||'–')}`:'',b:`
 <div class="kv"><div><span>Tanggal</span><b>${fd(k.tgl)}</b></div><div><span>Status</span><b>${stChip(k.status)}</b></div><div><span>Kendaraan</span><b>${esc(k.kendaraan||'–')} ${esc(k.nopol||'')}</b></div><div><span>Driver</span><b>${esc(k.driver||'–')}</b></div>${k.tglTerima?`<div><span>Diterima</span><b>${fd(k.tglTerima)}</b></div>`:''}</div>
 ${k.batal?`<div class="ro">Dibatalkan ${fd(k.batal.at)} oleh ${who(k.batal.by)}: ${esc(k.batal.alasan)}</div>`:''}
 <div class="sec-lbl">Preview Dokumen</div>
 ${sjPreview(k,s)}
 <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:4px"><span class="docn">Surat Jalan</span><button class="btn sm ghost" data-act="doc" data-kind="sjc" data-ref="${id}" data-fmt="xlsx">${ic('dl')}Excel</button><button class="btn sm ghost" data-act="doc" data-kind="sjc" data-ref="${id}" data-fmt="pdf">${ic('file')}PDF</button>${k.status!=='Batal'?`<button class="btn sm ghost" data-act="sjalamat" data-id="${id}">Ubah alamat</button>`:''}</div>
 ${k.status!=='Batal'?`<div style="display:flex;gap:8px"><button class="btn sm danger" data-act="void" data-c="kirim" data-id="${id}">Batalkan surat jalan</button></div>`:''}`}})}

function spkDrawer(id){openDrawer(()=>{const s=byId('spk',id);if(!s)return null;const x=calc().spk[id];
 /* --- tab Info --- */
 const pPct=Math.round(x.pP*100);const kPct=Math.round(x.pK*100);
 const tabInfo=`
  <div class="dw-meta-grid">
   <div class="dw-meta-card"><span>Tanggal SPK</span><b>${fd(s.tgl)}</b></div>
   <div class="dw-meta-card"><span>Due date</span><b>${fd(s.due)}${x.late?` <span style="color:var(--crit);font-size:12px">+${x.late}hk telat</span>`:''}</b></div>
   <div class="dw-meta-card"><span>Lead time</span><b>${esc(s.lead||'–')}</b></div>
   <div class="dw-meta-card"><span>Material / tebal</span><b>${esc(s.material||'–')}${s.tebal?' · '+esc(s.tebal):''}</b></div>
   <div class="dw-meta-card"><span>No order / PO</span><b>${esc(s.nomor||'–')}</b></div>
   <div class="dw-meta-card"><span>Sales</span><b>${esc(s.sales||'–')}</b></div>
  </div>${spkFgHtml(id)}
  <div class="dw-prog-row">
   <div class="dw-prog-card"><label>Progres Produksi</label><div class="dw-prog-bar"><i style="width:${pPct}%"></i></div><div class="dw-prog-pct">${pPct}%</div><div class="dw-prog-sub">${n(x.prod)} dari ${n(x.q)} item diproduksi</div></div>
   <div class="dw-prog-card"><label>${s.stokReq?'Masuk Gudang Barang Jadi':'Terkirim ke Customer'}</label><div class="dw-prog-bar${x.pK>=1?' ok':''}"><i style="width:${kPct}%"></i></div><div class="dw-prog-pct">${kPct}%</div><div class="dw-prog-sub">${n(x.kir)} dari ${n(x.q)} item ${s.stokReq?'masuk gudang':'dikirim'}</div></div>
  </div>
  ${s.alasan?`<div class="dw-note">${ic('info')} <b>Catatan:</b> ${esc(s.alasan)}</div>`:''}
  <div>
   <div class="dw-section-title">Aksi SPK</div>
   <div class="dw-btns">
    <button class="btn sm primary" data-act="spksheet" data-id="${id}">${ic('spk')}Lihat format SPK</button>
    ${x.st==='Batal'?'':`<button class="btn sm" data-act="spkedit" data-id="${id}">Edit SPK</button>`}
    <button class="btn sm" data-act="spkdup" data-id="${id}">Duplikat</button>
    <button class="btn sm" data-act="spkxlsx" data-id="${id}">${ic('dl')}Excel</button>
    <button class="btn sm" data-act="doc" data-kind="spk" data-ref="${id}" data-fmt="pdf">${ic('file')}PDF</button>
    <div class="sep"></div>
    ${x.st==='Batal'?`<div class="dw-note">${ic('info')} <b>SPK dibatalkan</b>${s.batal&&s.batal.alasan?': '+esc(s.batal.alasan):''}. Tidak muncul di antrian mesin, jadwal, dan pilihan SPK. Catatan lama tetap tersimpan.</div><button class="btn sm" data-act="spkreopen" data-id="${id}">Aktifkan kembali</button>`:`<button class="btn sm ghost" data-act="prod" data-id="${id}" title="Lihat posisi tiap item. Input produksi ada di menu Produksi Hari Ini.">Posisi per item</button>
    <button class="btn sm warn" data-act="newvendor" data-spk="${id}">${ic('outb')}Kirim ke vendor</button>
    ${s.stokReq?`<button class="btn sm ok" data-act="fgterima" data-spk="${id}">${ic('inb')}Terima di gudang barang jadi</button>`:`<button class="btn sm ok" data-act="newkirim" data-spk="${id}">${ic('truck')}Kirim ke customer</button>`}${x.st==='Selesai'?'':`<button class="btn sm ghost danger" data-act="void" data-c="spk" data-id="${id}">Batalkan SPK</button>`}`}
   </div>
  </div>`;
 /* --- tab Items --- */
 const rows=x.lines.map((l)=>{const sisa=Math.max(0,l.q-l.kirim);return `<tr>
  <td><div class="item-name">${esc(l.d)}</div>${l.g?`<div class="item-note">${esc(l.g)}</div>`:''}</td>
  <td class="num"><b>${n(l.q)}</b><div style="font-size:10.5px;color:var(--muted)">${esc(l.u)}</div></td>
  <td class="num">${n(l.prodEff)}</td>
  <td class="num">${n(l.vOut)}</td>
  <td class="num">${n(l.vBack)}</td>
  <td class="num">${n(l.kirim)}</td>
  <td class="num ${sisa>0?'sisa-kur':'sisa-ok'}">${n(sisa)}</td>
 </tr>`}).join('');
 const tabItems=`<div class="tbl-wrap"><table class="dw-tbl"><thead><tr>
  <th>Item</th><th class="num">Order</th><th class="num">Produksi</th><th class="num">Ke vendor</th><th class="num">Kembali</th><th class="num">Terkirim</th><th class="num">Sisa</th>
 </tr></thead><tbody>${rows}</tbody></table></div>`;
 /* --- tab Alur --- */
 const tabAlur=`<div><div class="dw-section-title">Alur proses &amp; dokumen</div>${spkFlowHtml(id)}</div>`;
 /* header badge */
 const badge=`<span class="dw-badge">${stChip(x.st)}</span>`;
 return {
  t:`SPK ${s.no} · ${esc(s.customer)}`,
  s:`${badge}${esc(s.nomor||'')} · PO ${esc(s.po||'–')} · Sales ${esc(s.sales||'–')}`,
  cls:'dw-tabbed',
  b:`<div class="dw-tabs">
   <button class="dw-tab on" data-act="dwtab" data-tab="info">Info</button>
   <button class="dw-tab" data-act="dwtab" data-tab="items">Items <span style="font-size:11px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:1px 7px;margin-left:3px">${x.lines.length}</span></button>
   <button class="dw-tab" data-act="dwtab" data-tab="jejak">Jejak produksi</button>
   <button class="dw-tab" data-act="dwtab" data-tab="alur">Alur &amp; Dokumen</button>
  </div>
  <div class="dw-pane on" id="dw-pane-info">${tabInfo}</div>
  <div class="dw-pane" id="dw-pane-items">${tabItems}</div>
  <div class="dw-pane" id="dw-pane-jejak">${jejakHtml(id)}</div>
  <div class="dw-pane" id="dw-pane-alur">${tabAlur}</div>`
 }
})}
function newItemForm(g){
 if(g==='sp'){spItemForm();return}
 if(g==='rm'){
  const kwOf=j=>{const cm=CMATS().find(m=>m.nama===j);return cm?String(cm.kunci||'').split(',')[0].trim()||j:j};
  const jenisOpts=GRADES().map(x=>`<option value="${esc(x)}" ${x==='SPHC'?'selected':''}>${esc(x)}${CMATS().some(m=>m.nama===x)?'':' · '+n(densG(x))+' g/cm³'}</option>`).join('')+'<option value="__new">＋ Jenis material baru…</option>';
  openModal('Item bahan baku baru',fld('Material',inp('item','Plat SPHC','text','list="dl-mat" required'))+fld('Ukuran (t × l × p mm)',inp('ukuran','','text','placeholder="1.2×1200×2400" required'))+
  fld('Jenis material (menentukan berat per lembar)',`<select class="sel" name="jenis" id="nj-jenis">${jenisOpts}</select>`,true)+
  `<div class="full" id="nj-baru" style="display:none;grid-template-columns:1fr 1fr;gap:8px">${fld('Nama jenis baru',inp('jnama','','text','placeholder="mis. Tembaga"'))}${fld('Massa jenis (g/cm³)',inp('jdens','','number','min="0.5" max="25" step="0.01" placeholder="mis. 8.96"'))}</div>`+
  `<div class="note full" id="nj-prev"></div>`+
  fld('Satuan',inp('satuan','Lembar'))+fld('Buffer stok',inp('buffer','0','number','min="0"'))+fld('Stok awal',inp('stokAwal','0','number','min="0"'))+`<datalist id="dl-mat">${[...new Set(S.rm.map(r=>r.item))].map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`,
  async d=>{if(!d.item||!d.ukuran)throw new Error('Material dan ukuran wajib diisi.');
   let jenis=d.jenis,kw;
   if(jenis==='__new'){const jn=String(d.jnama||'').trim(),jd=num0(d.jdens);if(!jn||!(jd>0))throw new Error('Isi nama jenis baru dan massa jenisnya (g/cm³).');if(BASE_GRADES.some(x=>x.toLowerCase()===jn.toLowerCase())||GRADES().some(x=>x.toLowerCase()===jn.toLowerCase()))throw new Error(`Jenis "${jn}" sudah ada, pilih dari daftar.`);jenis=jn;kw=jn;const mats=[...CMATS(),{nama:jn,kunci:jn,dens:jd}];if(byId('master','setting'))await updDoc('master','setting',{mats});else{need();await DB.doc('master/setting').set({mats})}}
   else kw=kwOf(jenis);
   const rawName=d.item.trim();const itm=rawName.toUpperCase().includes(String(kw).toUpperCase())||(grade({item:rawName})===jenis)?rawName:rawName+' '+kw;
   const ukr=d.ukuran.trim();const dup=S.rm.find(r=>r.item.trim().toLowerCase()===itm.toLowerCase()&&r.ukuran.trim().toLowerCase()===ukr.toLowerCase());if(dup)throw new Error(`Item sudah ada: "${itm} – ${ukr}". Gunakan item yang sudah ada atau ubah spesifikasi.`);await addDoc('rm',{item:itm,ukuran:ukr,satuan:d.satuan||'Lembar',buffer:num0(d.buffer),stokAwal:num0(d.stokAwal),tglStokAwal:today(),jenis})},{mount:f=>{
   const sel=f.jenis,box=f.querySelector('#nj-baru'),prev=f.querySelector('#nj-prev');
   const upd=()=>{const j=sel.value,isNew=j==='__new';box.style.display=isNew?'grid':'none';
    const dm=dims({ukuran:f.ukuran.value});const dens=isNew?num0(f.jdens.value):densG(j);
    const nm=f.item.value.trim(),kw=isNew?String(f.jnama.value||'').trim():kwOf(j);
    const fin=!nm?'':(!kw||nm.toUpperCase().includes(kw.toUpperCase())||(!isNew&&grade({item:nm})===j)?nm:nm+' '+kw);
    const kg=dm.length>=3&&dens>0?dm[0]*dm[1]*dm[2]/1e6*dens:0;
    prev.innerHTML=`Nama item: <b>${esc(fin)}</b> · ${kg?`berat ± <b>${n(Math.round(kg*10)/10)} kg/lembar</b> (massa jenis ${n(dens)} g/cm³)`:'isi ukuran untuk melihat berat per lembar'}`};
   f.addEventListener('input',e=>{if(e.target===f.item){const g2=grade({item:f.item.value});if(g2!=='Lainnya'&&sel.value!=='__new'&&[...sel.options].some(o=>o.value===g2))sel.value=g2}upd()});
   f.addEventListener('change',upd);upd()}})}
 else openModal('Produk barang jadi baru',fld('Kategori',inp('kategori','Cable Tray','text','list="dl-kat" required'))+fld('Type',inp('type','STU','text','placeholder="STU / STC / SLU / SLHD"'))+fld('Ukuran (W×H)',inp('ukuran','','text','placeholder="200x100" required'))+fld('Panjang (mm)',inp('panjang','3000','number'))+fld('Finishing',inp('finishing','HDG','text','list="dl-fin"'))+fld('Tebal (mm)',inp('tebal','1.8'))+fld('Satuan',inp('satuan','Btg'))+fld('Stok awal',inp('stokAwal','0','number','min="0"'))+fld('Buffer stok (target)',inp('buffer','0','number','min="0"'))+`<datalist id="dl-kat">${[...new Set(S.fg.map(r=>r.kategori))].map(x=>`<option value="${esc(x)}">`).join('')}</datalist><datalist id="dl-fin">${[...new Set(S.fg.map(r=>r.finishing))].map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`,
  async d=>{if(!d.ukuran)throw new Error('Ukuran wajib diisi.');await addDoc('fg',{kategori:d.kategori,type:d.type,ukuran:d.ukuran,panjang:num0(d.panjang)||d.panjang,finishing:d.finishing,tebal:d.tebal,satuan:d.satuan||'Btg',stokAwal:num0(d.stokAwal),buffer:num0(d.buffer),tglStokAwal:today(),ket:''})});
}
function render(){apHook();renderNav();renderTools();renderBody()}
/* ---------- forms ---------- */
// ---------- Mesin (master) dan pemakaian sparepart ke mesin ----------
const TUJUAN_SP=[['perawatan','Perawatan rutin'],['perbaikan','Perbaikan (breakdown)'],['ganti','Penggantian komponen aus'],['tools','Tools / consumable produksi'],['umum','Umum (bukan untuk satu mesin)']];
const DASAR_SP=[['langsung','Pembelian langsung / darurat'],['retur','Retur atau pengembalian dari mesin'],['titipan','Hibah, sample, atau titipan'],['penyesuaian','Penyesuaian data (bukan pembelian baru)']];
const tujuanLbl=k=>(TUJUAN_SP.find(x=>x[0]===k)||[0,k||''])[1];
const GRUP_LAIN='Utilitas & pendukung';
const mesinInfoAll=()=>(byId('master','setting')||{}).mesinInfo||{};
const mesinLainAll=()=>Array.isArray((byId('master','setting')||{}).mesinLain)?byId('master','setting').mesinLain:[];
const mesinOn=nm=>(mesinInfoAll()[nm]||{}).aktif!==false;
// Daftar mesin: mesin produksi dari Work Centre (mwc.mesin) ditambah peralatan pendukung (master/setting.mesinLain); info tambahan (kode, lokasi, aktif) di master/setting.mesinInfo
function mesinSemua(){const inf=mesinInfoAll(),out=[],seen=new Set();
 S.mwc.slice().sort((a,b)=>(a.urutan||0)-(b.urutan||0)).forEach(w=>{(Array.isArray(w.mesin)?w.mesin:[]).forEach(m=>{const nm=String(m.nama||'').trim();if(!nm||seen.has(nm.toLowerCase()))return;seen.add(nm.toLowerCase());const i=inf[nm]||{};out.push({nama:nm,grup:w.nama,wcId:w._id,src:'wc',kode:i.kode||'',lokasi:i.lokasi||'',merk:i.merk||'',ket:i.ket||'',aktif:i.aktif!==false&&w.aktif!==false,operator:m.operator||[],kapasitas:+m.kapasitas||0})})});
 mesinLainAll().forEach(m=>{const nm=String(m.nama||'').trim();if(!nm||seen.has(nm.toLowerCase()))return;seen.add(nm.toLowerCase());out.push({nama:nm,grup:GRUP_LAIN,wcId:'',src:'lain',kode:m.kode||'',lokasi:m.lokasi||'',merk:m.merk||'',ket:m.ket||'',aktif:m.aktif!==false,operator:[],kapasitas:0})});
 return out}
function mesinOpsi(sel){const g={};mesinSemua().filter(m=>m.aktif||m.nama===sel).forEach(m=>(g[m.grup]=g[m.grup]||[]).push(m));
 return Object.entries(g).map(([k,xs])=>`<optgroup label="${esc(k)}">${xs.map(m=>`<option value="${esc(m.nama)}" ${m.nama===sel?'selected':''}>${esc(m.nama)}${m.kode?' · '+esc(m.kode):''}${m.aktif?'':' (nonaktif)'}</option>`).join('')}</optgroup>`).join('')}
const mesinPakai=nm=>{const sp=S.mutasi.filter(m=>m.gudang==='sp'&&m.mesin===nm).length,lg=(S.produksi_log||[]).filter(e=>(e.mesin||'')===nm).length;return {sp,lg,ada:sp>0||lg>0}};
function spPrOpen(){return S.pr.filter(p=>p.gudang==='sp'&&p.status!=='Selesai'&&p.status!=='Batal'&&(p.items||[]).some(i=>(+i.q||0)>(+i.qTerima||0))).sort((a,b)=>String(b.noPR).localeCompare(String(a.noPR)))}
function spPrField(PRD){const open=spPrOpen(),sel=PRD?PRD._id:'',lst=(PRD&&!open.some(p=>p._id===PRD._id)?[PRD]:[]).concat(open);
 return fld('Permintaan pembelian (PR)',`<select class="sel" id="m-pr" name="pr"><option value="">— Tanpa PR —</option>${lst.map(p=>`<option value="${p._id}" ${p._id===sel?'selected':''}>${esc(p.noPR)}${p.supplier?' · '+esc(p.supplier):''} · ${(p.items||[]).filter(i=>(+i.q||0)>(+i.qTerima||0)).length} item belum datang</option>`).join('')}</select>`)+
 `<div id="sp-dasar-f" style="display:${PRD?'none':'contents'}">`+fld('Alasan tanpa PR',`<select class="sel" id="m-dasar" name="dasar"><option value="">Pilih alasan…</option>${DASAR_SP.map(([k,l])=>`<option value="${k}">${esc(l)}</option>`).join('')}</select>`)+`</div>`}
function spKeluarFields(){const ops=[...new Set([...mesinSemua().flatMap(m=>m.operator||[]),...S.mutasi.filter(m=>m.gudang==='sp'&&m.jenis==='keluar').map(m=>m.oleh).filter(Boolean)])].sort();
 return fld('Jenis pemakaian',`<select class="sel" id="m-tujuan" name="tujuan" required>${TUJUAN_SP.map(([k,l])=>`<option value="${k}">${esc(l)}</option>`).join('')}</select>`)+
 `<div id="sp-mesin-f" style="display:contents">`+fld('Mesin yang memakai',`<select class="sel" id="m-mesin" name="mesin"><option value="">Pilih mesin…</option>${mesinOpsi('')}</select>`)+`</div>`+
 fld('Diambil oleh (nama pengambil)',inp('oleh','','text','list="dl-oleh" autocomplete="off" required'))+dl('dl-oleh',ops)}
// Aturan sparepart: masuk harus dari PR (atau alasan tanpa PR), keluar harus ke mesin (atau umum) dengan nama pengambil
function spCek(d,j,lines,PRD){const ket=String(d.ket||'').trim();
 if(j==='masuk'){const pr=PRD||(d.pr?byId('pr',d.pr):null);
  if(pr){const sisa={};(pr.items||[]).forEach(i=>{sisa[i.item]=(sisa[i.item]||0)+Math.max(0,(+i.q||0)-(+i.qTerima||0))});const need={};lines.forEach(l=>need[l.item]=(need[l.item]||0)+l.q);
   for(const [it,q] of Object.entries(need)){if(!(it in sisa))throw new Error(`${spLabel(byId('sp',it))} tidak ada di ${pr.noPR}. Pilih "Tanpa PR" bila memang pembelian di luar PR.`);if(q>sisa[it]+1e-9)throw new Error(`${spLabel(byId('sp',it))}: diterima ${n(q)} melebihi sisa ${pr.noPR} (${n(sisa[it])}). Terima sesuai sisa, atau catat kelebihannya sebagai penerimaan tanpa PR dengan alasan.`)}}
  else{if(!d.dasar)throw new Error('Pilih PR yang diterima, atau pilih alasan bila tanpa PR.');if(!ket)throw new Error('Penerimaan tanpa PR wajib diberi keterangan (siapa yang memesan dan kenapa tanpa PR).')}
  return}
 if(j==='keluar'){if(!d.tujuan)throw new Error('Pilih jenis pemakaian.');const um=d.tujuan==='umum';
  if(!um&&!d.mesin)throw new Error('Pilih mesin yang memakai sparepart ini (atau pilih jenis "Umum").');
  if(!um&&!mesinSemua().some(m=>m.nama===d.mesin))throw new Error('Mesin tidak ada di Master Data › Mesin.');
  if(!String(d.oleh||'').trim())throw new Error('Isi nama pengambil agar pengeluaran bisa dipertanggungjawabkan.');
  if(d.tujuan==='perbaikan'&&!ket)throw new Error('Perbaikan wajib diisi keluhan atau kerusakannya di Keterangan.');
  if(um&&!ket)throw new Error('Pemakaian umum wajib diberi keterangan keperluannya.')}}
const spExtra=(d,j)=>j==='masuk'?{dasar:d.pr?'':(d.dasar||'')}:j==='keluar'?{tujuan:d.tujuan||'',mesin:d.tujuan==='umum'?'':(d.mesin||''),mesinGrup:d.tujuan==='umum'?'':((mesinSemua().find(m=>m.nama===d.mesin)||{}).grup||''),oleh:String(d.oleh||'').trim()}:{};
function spBindForm(f,j){
 if(j==='keluar'){const tj=f.querySelector('#m-tujuan'),w=f.querySelector('#sp-mesin-f');if(!tj)return;const up=()=>{if(w)w.style.display=tj.value==='umum'?'none':'contents'};tj.addEventListener('change',up);up();return}
 const pr=f.querySelector('#m-pr');if(!pr)return;const da=f.querySelector('#sp-dasar-f');const up=()=>{if(da)da.style.display=pr.value?'none':'contents'};
 pr.addEventListener('change',()=>{up();const p=byId('pr',pr.value),body=f.querySelector('#m-mvl');
  if(p){const its=(p.items||[]).filter(i=>(+i.q||0)>(+i.qTerima||0));body.innerHTML=its.map((i,k)=>mvLine('sp',k,i.item,(+i.q||0)-(+i.qTerima||0))).join('');if(f.pihak&&p.supplier)f.pihak.value=p.supplier;if(f.ref)f.ref.value=p.noPR}
  else{body.innerHTML=mvLine('sp',0,'');if(f.ref&&/^PR\//.test(f.ref.value))f.ref.value=''}
  const s0=body.querySelector('select');if(s0)s0.dispatchEvent(new Event('change',{bubbles:true}))});up()}
function mvLine(g,i,sel,q){return `<tr data-ln="${i}"><td>${itemSelect(g,sel).replace('id="m-item" name="item"',`id="m-item-${i}" name="item_${i}"`)}</td><td class="num"><input class="inp" type="number" min="0" step="any" name="qty_${i}" id="m-qty-${i}" inputmode="decimal" placeholder="Qty" value="${q??''}"></td><td class="note" data-stk></td><td><button type="button" class="ibtn" data-act="mvdel" aria-label="Hapus baris">×</button></td></tr>`}
function mvForm(g,j,item,prId,pre){
 const PRD=prId?byId('pr',prId):null;
 const jl=(g==='sp'?{masuk:'Terima sparepart',keluar:'Keluarkan sparepart',opname:'Stock opname'}:{masuk:g==='rm'?'Terima material':'Barang masuk',keluar:g==='rm'?'Pakai untuk produksi':'Barang keluar',opname:'Stock opname'})[j];
 const gNm={rm:'Bahan baku',fg:'Barang jadi',sp:'Sparepart'}[g];
 const kind=g==='sp'?(j==='masuk'?'SPM':'SPX'):g==='rm'?(j==='masuk'?'RCV':'PK'):(j==='masuk'?'BJM':'BJK');
 if(j==='opname'){openModal(`Stock opname · ${gNm}`,fld('Item',itemSelect(g,item),true)+fld('Tanggal',inp('tgl',today(),'date','required'))+fld('Stok fisik hasil hitung',inp('fisik','','number','min="0" step="any" required inputmode="decimal"'))+fld('Alasan selisih',inp('ket','','text','required placeholder="mis. opname akhir bulan, plat penyok dipisah"'),true)+'<div class="note full" id="m-info"></div>',
  async d=>{if(!d.item)throw new Error('Pilih item dulu.');if(d.fisik==='')throw new Error('Isi stok fisik.');if(!String(d.ket).trim())throw new Error('Isi alasan selisih agar opname bisa diaudit.');const cur=calc().stock[g][d.item];const delta=num0(d.fisik)-cur;if(delta===0)throw new Error('Stok fisik sama dengan sistem, tidak ada penyesuaian.');
   await addDoc('mutasi',{gudang:g,item:d.item,jenis:'opname',delta,tgl:d.tgl||today(),ref:'',spk:'',pihak:'',ket:d.ket,noDok:'',stokSistem:cur,stokFisik:num0(d.fisik)})},
  {submit:'Simpan opname',mount:f=>{const upd=()=>{const id=f.item.value;$('#m-info').textContent=id?`Stok sistem saat ini: ${n(calc().stock[g][id])}`:''};f.item.addEventListener('change',upd);upd()}});return}
 const needSpk=g==='rm'&&j==='keluar';
 const pihakFld=g==='sp'?(j==='masuk'?fld('Supplier / asal',inp('pihak','','text','list="dl-sup" autocomplete="off"'))+dl('dl-sup',mNames('supplier')):spKeluarFields()):g==='rm'&&j==='masuk'?fld('Supplier',inp('pihak','','text','list="dl-sup" required autocomplete="off"'))+dl('dl-sup',mNames('supplier'))
  :g==='fg'&&j==='keluar'?fld('Customer / tujuan',inp('pihak','','text','list="dl-custm" autocomplete="off"'))+dl('dl-custm',mNames('customer'))
  :g==='rm'
   ?fld('Diserahkan ke (bagian / mesin)',inp('pihak','','text','list="dl-pihak" autocomplete="off"'))+dl('dl-pihak',[...new Set([...S.mutasi.filter(m=>m.gudang==='rm'&&m.jenis==='keluar').map(m=>m.pihak).filter(Boolean),'Produksi','Shearing','Bending','Punching','BJP','Rolling','Galvindo','CNC Laser','Welding'])])
   :fld('Asal (proses / vendor finishing)',inp('pihak','','text','list="dl-pihak" autocomplete="off"'))+dl('dl-pihak',[...new Set([...S.mutasi.filter(m=>m.gudang==='fg'&&m.jenis==='masuk').map(m=>m.pihak).filter(Boolean),'Produksi',...mNames('vendor')])]);
 openModal(`${jl} · ${gNm}`,
  fld('Tanggal',inp('tgl',today(),'date','required'))+fld('No dokumen',`<input class="inp" id="m-nodok" value="Otomatis: ${DOCFMT[kind]}/${today().slice(0,4)}/${today().slice(5,7)}/…" disabled>`)+
  (g==='sp'?(j==='masuk'?spPrField(PRD):''):fld(needSpk?'SPK (wajib)':(g==='fg'&&j==='keluar'?'SPK terkait (tercatat juga di SPK)':'SPK terkait'),spkSelect(pre&&pre.spk||'',true).replace('— tanpa SPK —',needSpk?'— Non-SPK (wajib isi keterangan) —':'— tanpa SPK —')))+
  fld(j==='masuk'&&(g==='rm'||g==='sp')?'No PO / SJ supplier':g==='sp'?'No. WO / tiket perbaikan (opsional)':'Referensi (SJ / PO)',inp('ref'))+pihakFld+
  `<div class="full tbl-wrap"><table class="lines mvl"><thead><tr><th>Item</th><th class="num">Qty</th><th>Stok sistem</th><th></th></tr></thead><tbody id="m-mvl">${PRD?PRD.items.filter(i=>(+i.q||0)>(+i.qTerima||0)).map((i,k)=>mvLine(g,k,i.item,(+i.q||0)-(+i.qTerima||0))).join(''):(pre&&pre.lines&&pre.lines.length?pre.lines.map((l,k)=>mvLine(g,k,l.item,l.q)).join(''):mvLine(g,0,item))}</tbody></table><button type="button" class="btn sm ghost" data-act="mvadd" data-g="${g}" style="margin-top:6px">${ic('plus')}Item lain di dokumen yang sama</button>${g==='rm'?'<div class="note" id="m-kg" style="margin-top:6px"></div>':''}</div>`+
  fld('Keterangan',inp('ket'),true)+(g==='rm'&&j==='masuk'?dockCk('Masukkan ke antrian Unloading di Bongkar Muat')+armadaFields():''),
  async (d,form)=>{
   const lines=[...form.querySelectorAll('#m-mvl tr')].map(tr=>{const i=tr.dataset.ln;return {item:d['item_'+i],q:num0(d['qty_'+i])}}).filter(l=>l.item||l.q);
   if(!lines.length)throw new Error('Tambahkan minimal satu item.');
   if(lines.some(l=>!l.item))throw new Error('Ada baris tanpa item.');if(lines.some(l=>l.q<=0))throw new Error('Setiap item butuh jumlah lebih dari 0.');
   if(g==='fg'&&j==='masuk'&&d.spk){const sk=byId('spk',d.spk);if(sk&&sk.stokReq){
    if(sk.status==='Draft')throw new Error('SPK stok ini masih Draft. Terbitkan SPK dan selesaikan produksinya sebelum barang diterima.');
    const rdy=fgSiapMap(sk),need={};lines.forEach(l=>need[l.item]=(need[l.item]||0)+l.q);
    for(const [it,q] of Object.entries(need)){const ix=(sk.items||[]).findIndex(z=>fgDariItem(z)===it);if(ix<0)throw new Error(`${fgLabel(byId('fg',it))} tidak ada di SPK ${sk.no}.`);const got=fgGot(sk._id,it),can=Math.max(0,rdy[ix]-got);
     if(q>can)throw new Error(`${fgLabel(byId('fg',it))}: yang siap diterima ${n(can)} (selesai produksi ${n(rdy[ix])}, sudah masuk gudang ${n(got)}), diminta ${n(q)}.`)}}}
   if(needSpk&&!d.spk&&!String(d.ket).trim())throw new Error('Pemakaian tanpa SPK wajib diberi keterangan (mis. sample, perbaikan).');if(g==='sp')spCek(d,j,lines,PRD);if(g!=='sp'&&j==='masuk'&&PRD&&prId){const pf=byId('pr',prId);if(pf){const sis={};(pf.items||[]).forEach(i=>{sis[i.item]=(sis[i.item]||0)+Math.max(0,(+i.q||0)-(+i.qTerima||0))});lines.forEach(l=>{if(l.q>(sis[l.item]||0)+1e-9)throw new Error(`${rmLabel(byId('rm',l.item))}: diterima ${n(l.q)} melebihi sisa ${pf.noPR} (${n(sis[l.item]||0)}). Terima sesuai sisa.`)})}}
   if(j==='keluar'){const tot={};lines.forEach(l=>tot[l.item]=(tot[l.item]||0)+l.q);for(const [it,q] of Object.entries(tot)){const cur=calc().stock[g][it];if(q>cur)throw new Error(`Stok ${g==='rm'?rmLabel(byId('rm',it)):g==='sp'?spLabel(byId('sp',it)):fgLabel(byId('fg',it))} tidak cukup: tersedia ${n(cur)}, diminta ${n(q)}.`)}}
   let pihak=g==='sp'&&j==='keluar'?(d.tujuan==='umum'?'Umum':(d.mesin||'')):(d.pihak||'');
   if((g==='rm'||(g==='sp'&&pihak))&&j==='masuk')pihak=await ensureMaster('supplier',pihak,form,'pihak');
   if(g==='fg'&&j==='keluar'&&pihak)pihak=await ensureMaster('customer',pihak,form,'pihak');
   const t=d.tgl||today();const noDok=await nextDocNo(kind,t);const s=d.spk&&g!=='sp'?byId('spk',d.spk):null;const PRX=PRD||(g==='sp'&&j==='masuk'&&d.pr?byId('pr',d.pr):null);
   for(const l of lines)await addDoc('mutasi',{gudang:g,item:l.item,jenis:j,delta:j==='masuk'?l.q:-l.q,tgl:t,noDok,ref:[s?'SPK '+s.no:'',d.ref||''].filter(Boolean).join(' · '),spk:g==='sp'?'':(d.spk||''),pihak,ket:d.ket||'',pr:PRX?PRX._id:'',...(g==='sp'?spExtra(d,j):{})});
   if(PRX){const got={};lines.forEach(l=>got[l.item]=(got[l.item]||0)+l.q);const items=PRX.items.map(i=>({...i,qTerima:(+i.qTerima||0)+(got[i.item]||0)}));const done=items.every(i=>i.qTerima>=i.q);await updDoc('pr',PRX._id,{items,status:done?'Selesai':PRX.status==='Diajukan'?'Dipesan':PRX.status,supplier:PRX.supplier||pihak})}
   if(d.dock){const nopolM=getNopol(d);await queueDock({jenis:'Unloading',muatan:'Bahan Baku',pihak,ref:[noDok,d.ref].filter(Boolean).join(' · '),nopol:nopolM,kendaraan:d.kendaraan,driver:d.driver,tgl:t,link:{c:'mutasi',noDok}});rememberArmada(nopolM,d.kendaraan,d.driver)}
   toast(`${noDok} tersimpan · ${lines.length} item`);if(g==='sp'&&j==='keluar')setTimeout(()=>prOtomatisSparepart(),700);
  },{submit:PRD?`Terima ${PRD.noPR}`:jl,done:' ',mount:f=>{if(PRD){if(f.pihak&&PRD.supplier)f.pihak.value=PRD.supplier;if(f.ref)f.ref.value=PRD.noPR}if(g==='sp')spBindForm(f,j);if(pre){if(f.pihak&&pre.pihak)f.pihak.value=pre.pihak;if(f.ket&&pre.ket)f.ket.value=pre.ket}const upd=()=>{f.querySelectorAll('#m-mvl tr').forEach(tr=>{const v=tr.querySelector('select').value;tr.querySelector('[data-stk]').textContent=v?n(calc().stock[g][v]):''});if(g==='rm'){let tq=0,tk=0;f.querySelectorAll('#m-mvl tr').forEach(tr=>{const v=tr.querySelector('select').value,q=num0((tr.querySelector('input')||{}).value);if(v&&q>0){tq+=q;tk+=q*kgLbr(byId('rm',v)||{})}});const el=f.querySelector('#m-kg');if(el)el.innerHTML=tq?`Total <b>${n(tq)}</b> lembar · <b>${n(Math.round(tk))}</b> kg (${n(Math.round(tk/100)/10)} ton)`:''}};f.addEventListener('input',e=>{if(e.target.closest('#m-mvl'))upd()});f.addEventListener('change',e=>{if(e.target.matches('#m-mvl select'))upd()});if(g==='fg'&&f.spk&&f.pihak)f.spk.addEventListener('change',()=>{const sk=byId('spk',f.spk.value);if(!sk)return;if(sk.stokReq&&j==='masuk'){fgIsiDariSpk(f,sk)}else if(!String(f.pihak.value||'').trim())f.pihak.value=sk.customer||''});upd();bindArmada(f)}});
}
function linesTable(spkId,mode,pfx=''){
 if(!spkId)return '<div class="note">Pilih SPK untuk menampilkan item.</div>';
 const x=calc().spk[spkId];if(!x)return '';
 return `<div class="tbl-wrap"><table class="lines"><thead><tr><th>Item</th><th class="num">Order</th><th class="num">${mode==='vendor'?'Sudah ke vendor':'Sudah terkirim'}</th><th class="num">Sisa</th><th class="num">Qty ${mode==='vendor'?'kirim ke vendor':'kirim sekarang'}</th></tr></thead><tbody>${x.lines.map((l,i)=>{const done=mode==='vendor'?l.vOut:l.kirim;const sisa=sisaLine(l,mode);return `<tr><td>${esc(l.d)}</td><td class="num" data-l="Order">${n(l.q)} ${esc(l.u)}${l.am?`<div class="note">${n(l.am)} dari stok · ${n(l.q-l.am)} produksi</div>`:''}</td><td class="num" data-l="${mode==='vendor'?'Sudah ke vendor':'Terkirim'}">${n(done)}</td><td class="num" data-l="Sisa"><b>${n(sisa)}</b>${mode==='vendor'&&l.vSiap!=null&&l.vSiap-l.vOut<l.q-l.vOut?`<div class="note">siap ${n(Math.max(0,l.vSiap-l.vOut))} (hasil produksi)</div>`:''}</td><td class="num" data-l="${mode==='vendor'?'Qty kirim ke vendor':'Qty kirim sekarang'}"><input class="inp" type="number" min="0" step="any" name="${pfx}ln_${i}" id="m-${pfx}ln_${i}" value="${sisa||''}" data-max="${sisa}"></td></tr>`}).join('')}</tbody></table></div><div class="note">Kosongkan item yang tidak ikut. Qty tidak boleh melebihi sisa, kecuali dicentang di bawah.</div>`;
}
/* Sisa yang boleh dikirim. Ke vendor juga dibatasi hasil langkah produksi terakhir (item yang sudah punya catatan produksi per mesin). */
const sisaLine=(l,mode)=>{const s=Math.max(0,(mode==='vendor'?l.q-(l.am||0):l.q)-(mode==='vendor'?l.vOut:l.kirim));if(mode==='vendor')return l.vSiap!=null?Math.min(s,Math.max(0,l.vSiap-l.vOut)):s;
 /* kirim ke customer: hanya hasil produksi yang selesai (dan sudah kembali dari vendor finishing) */
 const siap=l.siapKirim!=null?l.siapKirim:Math.max(0,Math.min(l.q,(+l.prodEff||0)-(+l.vOut||0)+(+l.vBack||0)));return Math.min(s,Math.max(0,siap-l.kirim))};
const pickLines=(spkId,d,pfx='')=>calc().spk[spkId].lines.map((l,i)=>({d:l.d,u:l.u,q:num0(d[pfx+'ln_'+i])})).filter(l=>l.q>0);
/* Blok SPK tambahan dalam satu surat jalan (satu armada). Mengembalikan [{spk,pfx,items}] setelah memeriksa duplikat dan sisa. */
function gxBlok(d,mode){const out=[],seen=new Set([d.spk]);
 Object.keys(d).filter(k=>/^gspk_\d+$/.test(k)).forEach(k=>{const id=d[k];if(!id)return;if(seen.has(id))throw new Error(`${spkName(id)} dipilih dua kali dalam satu surat jalan.`);seen.add(id);
  const pfx='g'+k.slice(5)+'_';checkCap(id,d,mode,pfx);const items=pickLines(id,d,pfx);if(!items.length)throw new Error(`Isi qty minimal satu item untuk ${spkName(id)}.`);out.push({spk:id,pfx,items})});return out}
const gxUi=mode=>`<div class="full" id="m-extra"></div><div class="full"><button type="button" class="btn sm ghost" data-act="addgx" data-mode="${mode}">${ic('plus')} Tambah SPK lain di armada yang sama</button> <span class="note">Satu surat jalan, satu nomor, beberapa SPK.</span></div>`;
function gxOpsi(mode,excl,cust){const c=calc();return '<option value="">Pilih SPK…</option>'+S.spk.filter(s=>(mode==='vendor'||!s.stokReq)&&!excl.includes(s._id)&&(!cust||s.customer===cust)&&c.spk[s._id].st!=='Selesai'&&c.spk[s._id].st!=='Batal').sort((a,b)=>b.no-a.no).map(s=>`<option value="${s._id}">SPK ${s.no} · ${esc(s.customer)}</option>`).join('')}
document.addEventListener('change',e=>{const el=e.target;if(el&&el.dataset&&el.dataset.gxSel!==undefined){const bx=el.closest('.gx');if(bx)bx.querySelector('.gx-l').innerHTML=linesTable(el.value,el.dataset.mode,'g'+el.dataset.gxSel+'_')}});
function checkCap(spkId,d,mode,pfx=''){if(d.over)return;const x=calc().spk[spkId];x.lines.forEach((l,i)=>{const q=num0(d[pfx+'ln_'+i]);const sisa=sisaLine(l,mode);if(q>sisa)throw new Error(`"${l.d}": ${n(q)} melebihi ${(mode==='vendor'&&l.vSiap!=null&&sisa<Math.max(0,l.q-l.vOut))||(mode!=='vendor'&&sisa<Math.max(0,l.q-l.kirim))?'hasil produksi yang siap dikirim':'sisa'} ${n(sisa)}. Centang ${mode==='vendor'?'kirim ulang / rework':'kirim lebih / sebelum produksi tercatat selesai'} bila memang disengaja.`)})}
function vendorForm(spk){
 openModal('Kirim barang setengah jadi ke vendor',
  fld('Vendor finishing',inp('vendor','','text','list="dl-ven" required autocomplete="off" placeholder="Pilih dari master vendor"'))+fld('Proses',inp('proses','','text','list="dl-pro" placeholder="HDG / ELG / Powder Coating"'))+
  fld('Tanggal kirim',inp('tgl',today(),'date'))+fld('Target kembali',inp('target','','date'))+
  fld('No surat jalan',inp('noSJ','','text','placeholder="Kosongkan = otomatis SJ-V/'+today().slice(0,4)+'/'+today().slice(5,7)+'/…"'))+
  fld('SPK',spkSelect(spk||'',true,true),true)+`<div class="full" id="m-lines">${linesTable(spk,'vendor')}</div>`+gxUi('vendor')+
  `<label class="ck full"><input type="checkbox" name="over" id="m-over"> Kirim ulang / rework (boleh melebihi sisa) — wajib isi keterangan</label>`+fld('Keterangan',inp('ket'),true)+
  dockCk('Masukkan ke antrian Loading di Bongkar Muat')+armadaFields()+
  dl('dl-ven',mNames('vendor'))+dl('dl-pro',['HDG','ELG','Powder Coating','PDC White','PDC Orange','PDC Blue','Non Finishing']),
  async (d,form)=>{if(!d.spk)throw new Error('Pilih SPK.');checkCap(d.spk,d,'vendor');if(d.over&&!String(d.ket).trim())throw new Error('Isi keterangan untuk kirim ulang / rework.');
   const items=pickLines(d.spk,d).map(l=>({...l,kembali:0,reject:0}));if(!items.length)throw new Error('Isi qty minimal satu item.');const blok=gxBlok(d,'vendor');
   const vendor=await ensureMaster('vendor',d.vendor,form,'vendor',{proses:d.proses||''});
   const t=d.tgl||today();let noSJ=String(d.noSJ||'').trim();if(noSJ&&sjTaken(noSJ))throw new Error(`No SJ ${noSJ} sudah dipakai.`);if(!noSJ)noSJ=await nextDocNo('SJV',t);
   const s=byId('spk',d.spk);
   const nopolV=getNopol(d);
   const semua=[{spk:d.spk,items},...blok.map(b=>({spk:b.spk,items:b.items.map(l=>({...l,kembali:0,reject:0}))}))];
   for(const x of semua)await addDoc('vendor',{vendor,proses:d.proses||'',tgl:t,target:d.target||'',noSJ,nopol:nopolV,kendaraan:d.kendaraan||'',driver:d.driver||'',spk:x.spk,items:x.items,status:'Di Vendor',ket:d.ket||'',rework:!!d.over,riwayat:[]});
   if(d.dock){await queueDock({jenis:'Loading',muatan:'Barang Setengah Jadi',pihak:vendor,ref:`${noSJ} · ${semua.map(x=>spkName(x.spk)).join(', ')}`,nopol:nopolV,kendaraan:d.kendaraan,driver:d.driver,tgl:t,link:{c:'vendor',noSJ}})}
   rememberArmada(nopolV,d.kendaraan,d.driver);toast(`${noSJ} tersimpan`)},
  {submit:'Kirim ke vendor',done:' ',mount:f=>{f.spk.addEventListener('change',()=>{$('#m-lines').innerHTML=linesTable(f.spk.value,'vendor')});f.vendor.addEventListener('change',()=>{const v=mList('vendor').find(x=>x.nama===f.vendor.value);if(v&&v.proses&&!f.proses.value)f.proses.value=String(v.proses).split(',')[0].trim()});bindArmada(f)}});
}
function terimaForm(id){
 const v=byId('vendor',id);
 openModal(`Terima kembali dari ${UNKNOWN_V(v.vendor)?'vendor':esc(v.vendor)}`,fld('Tanggal terima',inp('tgl',today(),'date'))+fld('No SJ',`<div class="mono" style="padding:8px 0">${esc(v.noSJ||'')}</div>`)+
  (UNKNOWN_V(v.vendor)?fld('Nama vendor (belum diisi)',inp('vendor','','text','list="dl-ven" required autocomplete="off"'),true)+dl('dl-ven',mNames('vendor')):'')+
  `<div class="full tbl-wrap"><table class="lines"><thead><tr><th>Item</th><th class="num">Dikirim</th><th class="num">Sudah kembali</th><th class="num">OK diterima</th><th class="num">Reject</th></tr></thead><tbody>${v.items.map((i,k)=>{const sisa=Math.max(0,i.q-(+i.kembali||0)-(+i.reject||0));return `<tr><td>${esc(i.d)}</td><td class="num">${n(i.q)}</td><td class="num">${n((+i.kembali||0)+(+i.reject||0))}</td><td class="num"><input class="inp" type="number" min="0" step="any" name="r_${k}" id="m-r_${k}" value="${sisa||''}"></td><td class="num"><input class="inp" type="number" min="0" step="any" name="x_${k}" id="m-x_${k}"></td></tr>`}).join('')}</tbody></table></div>`+
  fld('Catatan (wajib bila ada reject)',inp('ket','','text','placeholder="mis. lapisan HDG belang 4 pcs, kembalikan ke vendor"'),true)+dockCk('Masukkan ke antrian Unloading di Bongkar Muat')+armadaFields(),
  async (d,form)=>{let qty=0,rej=0;const items=v.items.map((i,k)=>{const ok=num0(d['r_'+k]),x=num0(d['x_'+k]);const sisa=Math.max(0,i.q-(+i.kembali||0)-(+i.reject||0));if(ok+x>sisa)throw new Error(`"${i.d}": OK + reject (${n(ok+x)}) melebihi sisa di vendor (${n(sisa)}).`);qty+=ok;rej+=x;return {...i,kembali:(+i.kembali||0)+ok,reject:(+i.reject||0)+x}});
   if(qty+rej<=0)throw new Error('Isi qty yang diterima.');if(rej>0&&!String(d.ket).trim())throw new Error('Tulis catatan untuk barang reject.');
   const rItems=v.items.map((i,k)=>({d:i.d,ok:num0(d['r_'+k]),rej:num0(d['x_'+k])})).filter(x=>x.ok||x.rej);if((d.tgl||today())<v.tgl)throw new Error('Tanggal terima sebelum tanggal kirim ke vendor.');
   const up={items,riwayat:[...(v.riwayat||[]),{tgl:d.tgl||today(),qty,rej,ket:d.ket||'',by:ME||null,at:new Date().toISOString(),items:rItems}]};
   const out=items.reduce((a,i)=>a+(+i.q),0),back=items.reduce((a,i)=>a+(+i.kembali)+(+i.reject||0),0);up.status=back>=out?'Selesai':'Kembali Sebagian';
   let vendor=v.vendor;if(UNKNOWN_V(v.vendor)){vendor=await ensureMaster('vendor',d.vendor,form,'vendor');up.vendor=vendor}
   await updDoc('vendor',id,up);
   const nopolT=getNopol(d);
   if(d.dock){await queueDock({jenis:'Unloading',muatan:'Barang Setengah Jadi',pihak:vendor,ref:`${v.noSJ||''} · ${spkName(v.spk)}`,nopol:nopolT,kendaraan:d.kendaraan,driver:d.driver,tgl:d.tgl||today(),link:{c:'vendor',id}});rememberArmada(nopolT,d.kendaraan,d.driver)}},
  {submit:'Simpan penerimaan',mount:bindArmada});
}
function setVendorForm(id){const v=byId('vendor',id);openModal(`Isi nama vendor · ${esc(v.noSJ||'')}`,fld('Vendor finishing',inp('vendor','','text','list="dl-ven" required autocomplete="off"'),true)+fld('Proses',inp('proses',v.proses||'','text','list="dl-pro"'))+dl('dl-ven',mNames('vendor'))+dl('dl-pro',['HDG','ELG','Powder Coating','Non Finishing']),
 async (d,form)=>{const vendor=await ensureMaster('vendor',d.vendor,form,'vendor',{proses:d.proses||''});await updDoc('vendor',id,{vendor,proses:d.proses||v.proses||''})})}
function kirimForm(spk){
 openModal('Buat surat jalan ke customer',fld('SPK',spkSelect(spk||'',true,true,true),true)+`<div class="full" id="m-lines">${linesTable(spk,'kirim')}</div>`+gxUi('kirim')+
  `<label class="ck full"><input type="checkbox" name="over" id="m-over"> Kirim lebih dari yang siap (ganti reject / bonus, atau produksi belum tercatat selesai) — wajib isi keterangan</label>`+
  fld('Tanggal',inp('tgl',today(),'date'))+fld('No surat jalan',inp('noSJ','','text','placeholder="Kosongkan = otomatis '+sjMniNext(today())+'"'))+
  fld('Alamat pengiriman',`<textarea class="inp" name="alamat" id="m-alamat" rows="2" placeholder="Alamat tujuan / lokasi proyek (otomatis dari data customer bila sudah ada)"></textarea>`,true)+`<label class="ck full"><input type="checkbox" name="simpanAlamat" id="m-simpan-alamat"> Simpan juga sebagai alamat customer di Master Data</label>`+
  armadaFields()+fld('Status',`<select class="sel" name="status" id="m-status"><option>Disiapkan</option><option>Dalam Perjalanan</option><option>Diterima</option></select>`)+fld('Keterangan',inp('ket'),true)+
  dockCk('Masukkan ke antrian Loading di Bongkar Muat'),
  async (d,form)=>{if(!d.spk)throw new Error('Pilih SPK.');checkCap(d.spk,d,'kirim');if(d.over&&!String(d.ket).trim())throw new Error('Isi keterangan untuk kirim lebih.');
   const items=pickLines(d.spk,d);if(!items.length)throw new Error('Isi qty minimal satu item.');const blok=gxBlok(d,'kirim');{const c0=(byId('spk',d.spk)||{}).customer;blok.forEach(b=>{const cx=(byId('spk',b.spk)||{}).customer;if(cx!==c0)throw new Error(`${spkName(b.spk)} milik customer lain (${cx}); surat jalan customer gabungan harus satu customer.`)})}
   const nopolK=getNopol(d);
   if(!nopolK&&d.status!=='Disiapkan')throw new Error('Pilih armada atau isi no polisi kendaraan.');
   const s=byId('spk',d.spk);const t=d.tgl||today();let noSJ=String(d.noSJ||'').trim();if(noSJ&&sjTaken(noSJ))throw new Error(`No SJ ${noSJ} sudah dipakai.`);if(!noSJ)noSJ=sjMniNext(t);
   const semua=[{spk:d.spk,s,items},...blok.map(b=>({spk:b.spk,s:byId('spk',b.spk),items:b.items}))];const stokX=semua.map(x=>({...x,dariStok:ambilUntukKirim(x.s,x.items)}));const dariStok=stokX.flatMap(x=>x.dariStok);if(dariStok.length&&!canMod('barang-jadi'))throw new Error('Surat jalan ini mengambil stok barang jadi. Akun Anda perlu hak Barang jadi untuk mencatat keluarnya stok; minta admin atau kirim tanpa stok.');
   const totFg={};for(const x of dariStok)totFg[x.fg]=(totFg[x.fg]||0)+x.q;for(const fgId of Object.keys(totFg)){const q=totFg[fgId],sisa=calc().stock.fg[fgId]||0;if(sisa<q)throw new Error('Stok fisik "'+fgLabel(byId('fg',fgId))+'" hanya '+n(sisa)+', kurang dari '+n(q)+' yang dibutuhkan semua SPK di surat jalan ini. Periksa Gudang Barang Jadi.')}
   for(const x of stokX)await addDoc('kirim',{spk:x.spk,customer:s.customer,tgl:t,noSJ,kendaraan:d.kendaraan||'',nopol:nopolK,driver:d.driver||'',status:d.status||'Disiapkan',tglTerima:d.status==='Diterima'?t:'',items:x.items,ket:d.ket||'',alamat:String(d.alamat||'').trim(),lebih:!!d.over});
   for(const y of stokX)for(const x of y.dariStok)await addDoc('mutasi',{gudang:'fg',item:x.fg,jenis:'keluar',delta:-x.q,tgl:t,noDok:noSJ,ref:'SJ '+noSJ+' · SPK '+y.s.no,spk:y.spk,pihak:s.customer,ket:'Diambil dari stok untuk SPK customer'});
   await simpanAlamatCustomer(s.customer,d.alamat,!!d.simpanAlamat);
   if(d.dock)await queueDock({jenis:'Loading',muatan:'Barang Jadi',pihak:s.customer,ref:`${noSJ} · ${semua.map(x=>spkName(x.spk)).join(', ')}`,nopol:nopolK,kendaraan:d.kendaraan,driver:d.driver,tgl:t,link:{c:'kirim',noSJ}});
   rememberArmada(nopolK,d.kendaraan,d.driver);toast(`${noSJ} tersimpan`)},
  {submit:'Buat surat jalan',done:' ',mount:f=>{const fillAl=()=>{const s=byId('spk',f.spk.value),cu=s?mList('customer').find(x=>x.nama===s.customer):null;if(!f.alamat.dataset.dirty){f.alamat.value=(cu&&cu.alamat)||'';}const sa=f.querySelector('#m-simpan-alamat');if(sa)sa.checked=!(cu&&cu.alamat)}; f.alamat.addEventListener('input',()=>{f.alamat.dataset.dirty='1'});f.spk.addEventListener('change',()=>{$('#m-lines').innerHTML=linesTable(f.spk.value,'kirim');fillAl()});fillAl();bindArmada(f)}});
}
async function simpanAlamatCustomer(nama,alamat,paksa){const a=String(alamat||'').trim();if(!a||!nama)return;const cu=mList('customer').find(x=>x.nama===nama);try{if(cu&&cu._id&&(paksa||!String(cu.alamat||'').trim()))await updDoc('mcustomer',cu._id,{alamat:a})}catch(e){}}
function sjAlamatForm(id){const k=byId('kirim',id);if(!k)return;const cu=mList('customer').find(x=>x.nama===k.customer)||{};
 openModal(`Alamat pengiriman · ${esc(k.noSJ||'')}`,fld('Alamat pengiriman',`<textarea class="inp" name="alamat" rows="3" placeholder="Alamat tujuan / lokasi proyek">${esc(k.alamat||cu.alamat||'')}</textarea>`,true)+`<label class="ck full"><input type="checkbox" name="simpanAlamat" ${cu.alamat?'':'checked'}> Simpan juga sebagai alamat customer di Master Data</label><div class="note full">Alamat ini hanya tampil di dokumen surat jalan. Status pengiriman tidak berubah.</div>`,
  async d=>{const a=String(d.alamat||'').trim();await updDoc('kirim',id,{alamat:a});await simpanAlamatCustomer(k.customer,a,!!d.simpanAlamat);toast('Alamat disimpan')},{submit:'Simpan alamat',done:' '})}

/* ---------- Bongkar Muat: ceklis digital dan foto bukti, terhubung ke surat jalan vendor/customer ---------- */
/* Sumber item (dokumen yang dibongkar/dimuat) untuk satu catatan bongkar muat. */
/* ---------- Surat jalan gabungan beberapa SPK dalam satu armada (T-218) ----------
   Satu pengiriman = beberapa dokumen vendor/kirim (satu per SPK, agar progres, sisa, dan stok tiap SPK tetap benar) yang memakai
   NO SURAT JALAN YANG SAMA. Kelompok = dokumen aktif dengan no surat jalan itu. Cetak, ceklis Bongkar Muat, dan lampiran foto
   bekerja pada kelompok. Urutan kelompok = urutan pembuatan dokumen (menentukan nomor butir ceklis). */
/* Surat jalan dan dokumen terkait memakai nama barang seperti di SPK, ditambah tebal dari judul section SPK ("· t 1.2 mm") bila deskripsi belum memuatnya. */
function sjNama(spkId,i){if(!i||i.hdr||!i.d)return i;const s=byId('spk',spkId);if(!s)return i;const it=(s.items||[]).find(x=>x.d===i.d);const tb=String((it&&thkOf(it.g))||thkOf(s.h)||'');if(!tb)return i;
 const kata=i.d.toLowerCase().split(/[\s·,x×()]+/);if(kata.some(w=>w===tb||w==='t'+tb||w===tb+'mm'||w==='t'+tb+'mm')||i.d.toLowerCase().includes(tb+' mm'))return i;return {...i,d:i.d+' · t '+tb+' mm'}}
const spkRingkas=id=>{const s=byId('spk',id);return s?`SPK ${s.no} · ${s.customer}${s.po?' · PO '+s.po:''}`:'SPK ?'};
function sjGrup(c,doc){
 if(!doc)return [];if(!doc.noSJ)return [doc];
 const g=(c==='vendor'?S.vendor:S.kirim).filter(x=>x.status!=='Batal'&&x.noSJ===doc.noSJ).sort((a,b)=>String(a.at||'').localeCompare(String(b.at||''))||String(a._id).localeCompare(String(b._id)));
 return g.some(x=>x._id===doc._id)?g:[doc];
}
function gxNote(c,doc){const g=sjGrup(c,doc);return g.length>1?`<div class="sj-prev-note">Surat jalan gabungan ${g.length} SPK dalam satu armada (${g.map(x=>esc(spkName(x.spk))).join(', ')}). Cetak Excel/PDF memuat semuanya; tabel di atas hanya bagian SPK ini.</div>`:''}
/* Sumber item (dokumen yang dibongkar/dimuat) untuk satu catatan bongkar muat. Muatan keluar (Loading) memakai seluruh kelompok;
   item diberi penanda _spk bila kelompok berisi lebih dari satu SPK. */
function bmSrc(b){
 let items=[],label='',ref='',grup=false;const l=b&&b.link;
 const dari=docs=>{grup=docs.length>1;docs.forEach(d=>(d.items||[]).forEach(i=>items.push(grup?{...i,_spk:spkRingkas(d.spk)}:i)))};
 if(l){
  if(l.c==='mutasi'){items=S.mutasi.filter(x=>x.noDok===l.noDok&&x.gudang==='rm'&&x.jenis==='masuk').map(x=>{const r=byId('rm',x.item)||{};return {d:rmLabel(r),q:+x.delta||0,u:r.satuan||''}});label='Penerimaan Bahan Baku';ref=l.noDok||''}
  else if(l.c==='vendor'){const v=l.id?byId('vendor',l.id):S.vendor.find(x=>x.noSJ===l.noSJ);label='SJ Vendor';ref=l.noSJ||'';dari(v?(b.jenis==='Loading'?sjGrup('vendor',v):[v]):[])}
  else if(l.c==='kirim'){const k=S.kirim.find(x=>x.noSJ===l.noSJ);label='SJ Customer';ref=l.noSJ||'';dari(k?sjGrup('kirim',k):[])}
 }
 return {items,label,ref,grup};
}
const bmCekMap=b=>(b&&b.ceklis)||{};
function bmCekStat(b){const m=bmCekMap(b),it=bmSrc(b).items;return {n:it.length,done:it.filter((_,i)=>m[i]&&m[i].ok).length}}
/* Catatan bongkar muat yang terhubung ke satu surat jalan vendor ('vendor') atau customer ('kirim'). */
function bmFor(c,doc){if(!doc)return null;return S.bongkar.find(b=>b.status!=='Batal'&&b.jenis==='Loading'&&b.link&&b.link.c===c&&((b.link.id&&b.link.id===doc._id)||(b.link.noSJ&&b.link.noSJ===doc.noSJ)))||null}
const bmFotoCetak=b=>((b&&b.foto)||[]).filter(x=>x.data&&x.cetak!==false);
function bmCekCatatan(b){const s=bmCekStat(b);return s.n?`Ceklis bongkar muat: ${s.done} dari ${s.n} item dicek digital (✓ di kolom Cek)`:''}
/* Kolom Cek dan lampiran foto pada pratinjau surat jalan di layar. */
function bmPrev(c,doc){
 const b=bmFor(c,doc);if(!b)return {th:'',td:()=>'',cs:2,foto:''};
 const m=bmCekMap(b),ft=bmFotoCetak(b);let off=0;for(const x of sjGrup(c,doc)){if(x._id===doc._id)break;off+=(x.items||[]).length}
 return {th:'<th style="width:8%">Cek</th>',td:i=>`<td style="text-align:center;font-weight:700;color:#1e783c">${m[off+i]&&m[off+i].ok?'✓':''}</td>`,cs:3,
  foto:ft.length?`<div style="font-weight:700;margin:12px 0 4px;font-size:11px;letter-spacing:.03em">LAMPIRAN BUKTI BONGKAR MUAT</div><div class="bm-prev-foto">${ft.map((x,i)=>`<figure><img src="${x.data}" alt="Foto bukti ${i+1}"><figcaption>Foto ${i+1}${x.ket?' · '+esc(x.ket):''}</figcaption></figure>`).join('')}</div>`:''};
}
/* Penyimpanan foto: sekarang disimpan langsung (data URL terkompres) di dokumen bongkar. Untuk Supabase disiapkan bucket privat
   (lihat draft migration 23); sampai bucket dipasang dan diuji, mode tetap 'inline'. */
const FOTO={mode:'inline',maks:1280,mutu:.72,batas:24,
 async baca(file){
  if(!/^image\//.test(file.type||''))throw new Error('Berkas "'+file.name+'" bukan gambar.');
  const url=await new Promise((res,rej)=>{const rd=new FileReader();rd.onload=()=>res(rd.result);rd.onerror=()=>rej(new Error('Gagal membaca foto.'));rd.readAsDataURL(file)});
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error('Foto "'+file.name+'" tidak bisa dibuka.'));i.src=url});
  const k=Math.min(1,FOTO.maks/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*k)),h=Math.max(1,Math.round(img.naturalHeight*k));
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,w,h);cx.drawImage(img,0,0,w,h);
  return {data:cv.toDataURL('image/jpeg',FOTO.mutu),w,h};
 }};
async function bmCek(id,idx,ok){
 const b=byId('bongkar',id);if(!b||b.status==='Batal')return;
 const m={...bmCekMap(b)};if(ok)m[idx]={ok:true,by:ME||null,at:new Date().toISOString()};else delete m[idx];
 await updDoc('bongkar',id,{ceklis:m});
}
async function bmCekSemua(id,ok){
 const b=byId('bongkar',id);if(!b||b.status==='Batal')return;const it=bmSrc(b).items,m={};
 if(ok)it.forEach((_,i)=>{m[i]={ok:true,by:ME||null,at:new Date().toISOString()}});
 await updDoc('bongkar',id,{ceklis:m});
}
async function bmFotoAdd(id,files){
 const b=byId('bongkar',id);if(!b)return;const lama=b.foto||[];
 if(lama.length+files.length>FOTO.batas){toast('Maksimal '+FOTO.batas+' foto per kendaraan.');return}
 toast('Memproses '+files.length+' foto…');
 const baru=[];
 try{for(const fl of files){const x=await FOTO.baca(fl);baru.push({id:'f'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),data:x.data,w:x.w,h:x.h,at:new Date().toISOString(),by:ME||null,ket:'',cetak:true})}}
 catch(e){toast(e.message||'Gagal memproses foto.');if(!baru.length)return}
 try{await updDoc('bongkar',id,{foto:[...lama,...baru]});toast(baru.length+' foto tersimpan')}catch(e){toast('Foto gagal disimpan (penyimpanan penuh?): '+(e.message||''))}
}
async function bmFotoUbah(id,fid,p){const b=byId('bongkar',id);if(!b)return;await updDoc('bongkar',id,{foto:(b.foto||[]).map(x=>x.id===fid?{...x,...p}:x)})}
async function bmFotoHapus(id,fid){const b=byId('bongkar',id);if(!b)return;await updDoc('bongkar',id,{foto:(b.foto||[]).filter(x=>x.id!==fid)})}
document.addEventListener('change',async e=>{const el=e.target;if(el&&el.dataset&&el.dataset.act==='bmfotoket'){await bmFotoUbah(el.dataset.id,el.dataset.fid,{ket:el.value.trim()});return}if(!el||!el.classList||!el.classList.contains('bm-foto-in'))return;const fl=[...(el.files||[])];const id=el.dataset.id;el.value='';if(fl.length)await bmFotoAdd(id,fl)});
/* Tanda centang di PDF (huruf ✓ tidak ada di font standar PDF, jadi digambar). */
function pdfCek(doc,c){const cx=c.x+c.width/2,cy=c.y+c.height/2;doc.setDrawColor(30,120,60);doc.setLineWidth(.55);doc.line(cx-1.7,cy+.1,cx-.5,cy+1.4);doc.line(cx-.5,cy+1.4,cx+1.9,cy-1.5);doc.setDrawColor(0);doc.setLineWidth(.2)}
const pdfCekHooks={didParseCell:h=>{if(h.section==='body'&&h.cell.raw==='✓')h.cell.text=[''];if(h.section==='foot'){const cs=(h.table.settings.columnStyles||{})[h.column.index];if(cs&&cs.halign)h.cell.styles.halign=cs.halign}},didDrawCell:h=>{if(h.section==='body'&&h.cell.raw==='✓')pdfCek(h.doc,h.cell)}};
/* Lampiran foto di akhir PDF: dua kolom, proporsi asli. */
function pdfFoto(doc,foto,judul){
 if(!foto||!foto.length)return;const PW=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),M=12,G=6,cw=(PW-2*M-G)/2,mh=100;
 const fit=x=>{const k=Math.min(cw/(x.w||4),mh/(x.h||3));return {w:(x.w||4)*k,h:(x.h||3)*k}};let y=0;
 const head=()=>{doc.addPage();doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(20);doc.text(sjFx(judul),M,16);doc.setDrawColor(31,58,110);doc.setLineWidth(.5);doc.line(M,18.5,PW-M,18.5);y=24};
 head();
 for(let i=0;i<foto.length;i+=2){
  const row=foto.slice(i,i+2).map(x=>({x,...fit(x)})),rh=Math.max(...row.map(q=>q.h))+9;
  if(y+rh>PH-14)head();
  row.forEach((q,j)=>{const px=M+j*(cw+G);doc.addImage(q.x.data,'JPEG',px,y,q.w,q.h);doc.setDrawColor(190);doc.setLineWidth(.2);doc.rect(px,y,q.w,q.h);doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(90);doc.text(sjFx('Foto '+(i+j+1)+(q.x.ket?' · '+q.x.ket:'')+' · '+new Date(q.x.at).toLocaleString('id-ID')),px,y+q.h+4,{maxWidth:cw})});
  y+=rh;
 }
}
/* Lampiran foto di Excel: lembar kedua. */
function xlsxFoto(wb,foto,judul){
 if(!foto||!foto.length)return;const ws=wb.addWorksheet('Lampiran Foto',{views:[{showGridLines:false}]});ws.getColumn(1).width=3;
 ws.getCell(1,2).value=judul;ws.getCell(1,2).font={name:'Arial',bold:true,size:12};let r=3;
 foto.forEach((x,i)=>{const k=Math.min(480/(x.w||4),320/(x.h||3)),w=Math.round((x.w||4)*k),h=Math.round((x.h||3)*k);
  const id=wb.addImage({base64:String(x.data).split(',')[1],extension:'jpeg'});
  ws.getCell(r,2).value='Foto '+(i+1)+(x.ket?' · '+x.ket:'')+' · '+new Date(x.at).toLocaleString('id-ID');ws.getCell(r,2).font={name:'Arial',size:9,italic:true};
  ws.addImage(id,{tl:{col:1,row:r},ext:{width:w,height:h}});r+=Math.ceil(h/20)+3});
}

function printBmChecklist(id){
 const b=byId('bongkar',id);if(!b)return;
 const _s=bmSrc(b);const items=_s.items,docLabel=_s.label,docRef=_s.ref;
 const totalQty=sumBy(items,i=>+i.q||0);
 const rows=items.map((i,idx)=>`${i._spk&&i._spk!==(items[idx-1]||{})._spk?`<tr><td colspan="5" style="background:#eef2f9;font-weight:700">${esc(i._spk)}</td></tr>`:''}<tr><td class="pck-no">${idx+1}</td><td>${(i.d||i.item||'').replace(/</g,'&lt;')}</td><td class="pck-num">${+i.q||0}</td><td class="pck-u">${(i.u||'').replace(/</g,'&lt;')}</td><td class="pck-ck">${b.ceklis&&b.ceklis[idx]&&b.ceklis[idx].ok?'✓':'☐'}</td></tr>`).join('');
 const win=window.open('','_blank','width=794,height=1123');
 if(!win)return toast('Aktifkan popup untuk print checklist');
 win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Checklist ${b.jenis} · ${b.nopol||''}</title><style>
  *{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:28px 32px}${DK_CSS}
  .ph{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}
  .ph-co{font-size:9px;color:#555;margin-top:2px}.ph-logo{font-size:20px;font-weight:800;color:#1a3a6b;letter-spacing:-.5px}
  .ph-doc{text-align:right}.ph-title{font-size:17px;font-weight:700;letter-spacing:.04em}.ph-sub{font-size:10px;color:#555;margin-top:2px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:14px;font-size:11px}
  .meta-row{display:flex;gap:4px}.meta-row .lbl{color:#555;width:90px;flex-shrink:0}.meta-row .val{font-weight:600}
  table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:11.5px}
  th{background:var(--dc);color:#fff;padding:6px 8px;text-align:left;font-weight:700;border:1px solid var(--dc)}
  td{padding:5px 7px;border:1px solid #ddd;vertical-align:top}
  .pck-no{text-align:center;width:32px;color:#777}.pck-num{text-align:right;width:60px;font-weight:600}
  .pck-u{text-align:center;width:55px;color:#555}.pck-ck{text-align:center;width:36px;font-size:16px}
  .foot-row td{background:color-mix(in srgb,var(--dc) 12%,#fff);color:var(--dc);font-weight:700}
  .signs{display:flex;margin-top:20px;border-top:1px solid #ddd;padding-top:14px}
  .sign{flex:1;text-align:center;padding:0 8px;font-size:10px;color:#555}
  .sign+.sign{border-left:1px solid #ddd}
  .sign-line{height:44px}.sign-lbl{font-weight:600;font-size:10px;color:#333}
  .note{font-size:10px;color:#777;margin-top:6px;font-style:italic}
  @media print{body{padding:12px 16px}@page{size:A4;margin:12mm 14mm}}
 </style></head><body style="${dkStyle('cek')}">
 ${docHeadHtml('cek',{title:'CHECKLIST '+b.jenis.toUpperCase(),no:(docLabel?docLabel+' · ':'')+docRef,date:b.tgl})}
 <div class="meta">
  <div class="meta-row"><span class="lbl">Tanggal</span><span class="val">${tglLong(b.tgl)}</span></div>
  <div class="meta-row"><span class="lbl">No Polisi</span><span class="val">${(b.nopol||'-').replace(/</g,'&lt;')}</span></div>
  <div class="meta-row"><span class="lbl">Pihak</span><span class="val">${(b.pihak||'-').replace(/</g,'&lt;')}</span></div>
  <div class="meta-row"><span class="lbl">Kendaraan</span><span class="val">${(b.kendaraan||'-').replace(/</g,'&lt;')}</span></div>
  <div class="meta-row"><span class="lbl">Muatan</span><span class="val">${(b.muatan||'-').replace(/</g,'&lt;')}</span></div>
  <div class="meta-row"><span class="lbl">Driver</span><span class="val">${(b.driver||'-').replace(/</g,'&lt;')}</span></div>
  ${b.ref?`<div class="meta-row"><span class="lbl">Referensi</span><span class="val">${b.ref.replace(/</g,'&lt;')}</span></div>`:''}
 </div>
 <table>
  <thead><tr><th>No</th><th>Nama Barang / Item</th><th>Qty</th><th>Satuan</th><th>✓</th></tr></thead>
  <tbody>${rows}<tr class="foot-row"><td colspan="2" style="text-align:right">TOTAL</td><td class="pck-num">${totalQty}</td><td colspan="2"></td></tr></tbody>
 </table>
 ${b.ket?`<div class="note">Catatan: ${b.ket.replace(/</g,'&lt;')}</div>`:''}
 <div class="signs">
  <div class="sign"><div class="sign-lbl">${b.jenis==='Unloading'?'Pengirim / Vendor':'Pengirim'}</div><div class="sign-line"></div><div>( _________________ )</div></div>
  <div class="sign"><div class="sign-lbl">Driver</div><div class="sign-line"></div><div>( ${(b.driver||'_________________').replace(/</g,'&lt;')} )</div></div>
  <div class="sign"><div class="sign-lbl">${b.jenis==='Unloading'?'Penerima, Gudang MNI':'Penerima / Customer'}</div><div class="sign-line"></div><div>( _________________ )</div></div>
 </div>
 <script>window.onload=function(){window.print()}<\/script>
 </body></html>`);win.document.close();
}
function bmForm(){
 openModal('Catat kendaraan masuk dock',fld('Jenis',`<select class="sel" name="jenis" id="m-jenis"><option>Unloading</option><option>Loading</option></select>`)+
  fld('Muatan',`<select class="sel" name="muatan" id="m-muatan"><option>Bahan Baku</option><option>Barang Setengah Jadi</option><option>Barang Jadi</option><option>Lainnya</option></select>`)+
  fld('Pihak (supplier / vendor / customer)',inp('pihak','','text','list="dl-pihak2" required autocomplete="off"'))+fld('Referensi (PO / SJ / SPK)',inp('ref'))+
  armadaFields()+fld('Tanggal',inp('tgl',today(),'date'))+fld('Jam masuk',inp('jamMasuk',nowTime(),'time'))+
  fld('Status',`<select class="sel" name="status" id="m-bst"><option>Antri</option><option>Proses</option></select>`)+fld('Nama petugas',inp('petugas','','text','placeholder="Petugas gudang…"'))+fld('Keterangan',inp('ket'),true)+
  dl('dl-pihak2',[...mNames('supplier'),...mNames('vendor'),...mNames('customer')]),
  async d=>{const nopolB=getNopol(d);if(!nopolB)throw new Error('Pilih armada atau isi no polisi.');if(!String(d.pihak||'').trim())throw new Error('Isi pihak.');
   await addDoc('bongkar',{jenis:d.jenis,muatan:d.muatan,pihak:cleanName(d.pihak),ref:d.ref||'',kendaraan:d.kendaraan||'',nopol:nopolB,driver:d.driver||'',tgl:d.tgl||today(),jamMasuk:d.jamMasuk||nowTime(),jamMulai:d.status==='Proses'?(d.jamMasuk||nowTime()):'',jamSelesai:'',petugas:d.petugas||'',status:d.status||'Antri',ket:d.ket||''});rememberArmada(nopolB,d.kendaraan,d.driver)},{submit:'Catat',mount:bindArmada});
}
function bmKoreksiForm(id){
 const b=byId('bongkar',id);if(!b)return;
 const body=`<div class="frow">${fld('Jam masuk',inp('jamMasuk',b.jamMasuk||'','time'))}${fld('Jam mulai '+b.jenis.toLowerCase(),inp('jamMulai',b.jamMulai||'','time'))}</div>`+
  `<div class="frow">${fld('Jam selesai',inp('jamSelesai',b.jamSelesai||'','time'))}${fld('Nama petugas',inp('petugas',b.petugas||'','text','placeholder="Nama petugas gudang…"'))}</div>`+
  `<p class="note" style="margin-top:4px">Koreksi jam dan petugas. Kosongkan field yang tidak perlu diisi. Perubahan dicatat di log aktivitas.</p>`;
 openModal(`Koreksi jam · ${b.jenis} ${esc(b.nopol||b.pihak||'')}`,body,
  async d=>{
   const upd={jamMasuk:d.jamMasuk||b.jamMasuk||'',jamMulai:d.jamMulai||b.jamMulai||'',jamSelesai:d.jamSelesai||b.jamSelesai||'',petugas:String(d.petugas||'').trim()};
   await updDoc('bongkar',id,upd);toast('Jam &amp; petugas diperbarui');closeDrawer();
  },{submit:'Simpan koreksi'});
}
function bmDrawer(id){openDrawer(()=>{const b=byId('bongkar',id);if(!b)return null;
 /* sumber dokumen + items */
 let srcHtml='',srcItems=[],srcDocLabel='',srcDocRef='',srcDocPihak='';
 if(b.link){
  const lc=b.link.c;
  if(lc==='mutasi'){
   const noDok=b.link.noDok||'';
   const mut=S.mutasi.find(x=>x.noDok===noDok);
   srcDocLabel='Penerimaan Bahan Baku'; srcDocRef=noDok; srcDocPihak=b.pihak||'';
   if(mut&&mut.items)srcItems=mut.items;
   srcHtml=`<div class="dw-meta-card"><span>Dokumen sumber</span><b>Penerimaan Bahan Baku${noDok?` · <span class="mono">${esc(noDok)}</span>`:''}</b></div>`;
  } else if(lc==='vendor'){
   const noSJ=b.link.noSJ||'';const vid=b.link.id;const vd=vid?byId('vendor',vid):S.vendor.find(x=>x.noSJ===noSJ);const spk=vd?byId('spk',vd.spk):null;
   srcDocLabel='Surat Jalan Vendor'; srcDocRef=noSJ; srcDocPihak=vd?vd.vendor:'';
   if(vd&&vd.items)srcItems=vd.items;
   srcHtml=`<div class="dw-meta-card"><span>Dokumen sumber</span><b>SJ Vendor${noSJ?` · <span class="mono">${esc(noSJ)}</span>`:''}</b>${spk?`<div style="font-size:11px;color:var(--muted);margin-top:2px">SPK ${esc(spk.no)} · ${esc(spk.customer)}</div>`:''}</div>`;
  } else if(lc==='kirim'){
   const noSJ=b.link.noSJ||'';const kd=S.kirim.find(x=>x.noSJ===noSJ);const spk=kd?byId('spk',kd.spk):null;
   srcDocLabel='Surat Jalan Customer'; srcDocRef=noSJ; srcDocPihak=kd?kd.customer:'';
   if(kd&&kd.items)srcItems=kd.items;
   srcHtml=`<div class="dw-meta-card"><span>Dokumen sumber</span><b>SJ Customer${noSJ?` · <span class="mono">${esc(noSJ)}</span>`:''}</b>${spk?`<div style="font-size:11px;color:var(--muted);margin-top:2px">SPK ${esc(spk.no)} · ${esc(spk.customer)}</div>`:''}</div>`;
  }
 }
 srcItems=bmSrc(b).items;
 /* timeline */
 const tl=[];
 if(b.jamMasuk)tl.push(`<div class="bm-tl-row"><span class="bm-tl-dot ok"></span><div><b>Tiba di dock</b><div class="bm-tl-time">${esc(b.jamMasuk)}</div></div></div>`);
 else tl.push(`<div class="bm-tl-row"><span class="bm-tl-dot muted"></span><div><b class="muted">Belum tiba</b></div></div>`);
 if(b.jamMulai)tl.push(`<div class="bm-tl-row"><span class="bm-tl-dot info"></span><div><b>${b.jenis==='Unloading'?'Mulai bongkar':'Mulai muat'}</b><div class="bm-tl-time">${esc(b.jamMulai)}${b.jamMasuk?` · tunggu ${dur(b.jamMasuk,b.jamMulai)}`:''}</div></div></div>`);
 else tl.push(`<div class="bm-tl-row"><span class="bm-tl-dot muted"></span><div><b class="muted">${b.jenis==='Unloading'?'Mulai bongkar':'Mulai muat'} – belum dimulai</b></div></div>`);
 if(b.jamSelesai)tl.push(`<div class="bm-tl-row"><span class="bm-tl-dot ok"></span><div><b>Selesai</b><div class="bm-tl-time">${esc(b.jamSelesai)}${b.jamMulai?` · durasi ${dur(b.jamMulai,b.jamSelesai)}`:''}</div></div></div>`);
 else tl.push(`<div class="bm-tl-row"><span class="bm-tl-dot muted"></span><div><b class="muted">Belum selesai</b></div></div>`);
 const st=b.status;
 const stColor=st==='Selesai'?'ok':st==='Proses'?'info':'warn';
 const cm=bmCekMap(b),cst=bmCekStat(b),fotos=b.foto||[],bisaUbah=st!=='Batal';
 const body=`
  <div class="dw-meta-grid">
   <div class="dw-meta-card"><span>Tanggal</span><b>${fd(b.tgl)}</b></div>
   <div class="dw-meta-card"><span>Muatan</span><b>${esc(b.muatan)}</b></div>
   <div class="dw-meta-card"><span>Pihak</span><b>${esc(b.pihak||'–')}</b></div>
   <div class="dw-meta-card"><span>No Polisi</span><b class="mono">${esc(b.nopol||'–')}</b></div>
   <div class="dw-meta-card"><span>Kendaraan</span><b>${esc(b.kendaraan||'–')}</b></div>
   <div class="dw-meta-card"><span>Driver</span><b>${esc(b.driver||'–')}</b></div>
   ${b.petugas?`<div class="dw-meta-card"><span>Petugas</span><b>${esc(b.petugas)}</b></div>`:''}
   ${b.ref?`<div class="dw-meta-card"><span>Referensi</span><b>${esc(b.ref)}</b></div>`:''}
   ${srcHtml}
  </div>
  <div>
   <div class="dw-section-title">Timeline ${b.jenis}</div>
   <div class="bm-timeline">${tl.join('')}</div>
  </div>
  ${b.ket?`<div class="dw-note">${ic('info')} <b>Catatan:</b> ${esc(b.ket)}</div>`:''}
  ${srcItems.length?`<div>
   <div class="dw-section-title" style="display:flex;justify-content:space-between;align-items:center">
    <span>Detail Barang (${srcItems.length} item)</span>
    <span style="display:flex;gap:6px"><button class="btn sm ghost" data-act="bmckall" data-id="${id}" data-on="${cst.done<cst.n?1:0}" style="font-size:11px" ${bisaUbah?'':'disabled'}>${cst.done<cst.n?'Centang semua':'Kosongkan'}</button><button class="btn sm ghost" data-act="printbm" data-id="${id}" style="font-size:11px">${ic('file')} Print Checklist</button></span>
   </div>
   <div class="tbl-wrap">
    <table class="bm-checklist-tbl">
     <thead><tr><th style="width:32px"></th><th>Item / Barang</th><th class="num">Qty</th><th style="width:60px;text-align:center">Satuan</th></tr></thead>
     <tbody>${srcItems.map((i,idx)=>`${i._spk&&i._spk!==(srcItems[idx-1]||{})._spk?`<tr class="bm-spk-h"><td colspan="4">${esc(i._spk)}</td></tr>`:''}<tr>
      <td style="text-align:center"><input type="checkbox" class="bm-ck" id="bmck-${idx}" data-act="bmck" data-id="${id}" data-idx="${idx}" ${cm[idx]&&cm[idx].ok?'checked':''} ${bisaUbah?'':'disabled'}></td>
      <td><label for="bmck-${idx}" style="cursor:pointer;display:block">${esc(i.d||i.item||'')}</label></td>
      <td class="num">${n(i.q)}</td>
      <td style="text-align:center">${esc(i.u||'')}</td>
     </tr>`).join('')}
     <tr class="sj-prev-foot"><td></td><td style="font-weight:600;font-size:11.5px">TOTAL</td><td class="num" style="font-weight:600">${n(sumBy(srcItems,i=>+i.q||0))}</td><td></td></tr>
    </tbody></table>
   </div>
   <div class="bm-ck-note" id="bm-ck-status-${id}">${chip(cst.done+' dari '+cst.n+' item dicek',cst.done===cst.n?'ok':cst.done?'warn':'plain')} Centang ini otomatis muncul (✓) di surat jalan ${b.link&&b.link.c==='vendor'?'vendor':b.link&&b.link.c==='kirim'?'customer':'terkait'} saat dicetak.</div>
  </div>`:''}
  <div>
   <div class="dw-section-title" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><span>Foto bukti (${fotos.length})</span>${bisaUbah?`<span style="display:flex;gap:6px"><label class="btn sm primary" style="cursor:pointer">${ic('plus')} Ambil foto<input type="file" accept="image/*" capture="environment" class="bm-foto-in" data-id="${id}" hidden></label><label class="btn sm" style="cursor:pointer">${ic('inb')} Unggah foto<input type="file" accept="image/*" multiple class="bm-foto-in" data-id="${id}" hidden></label></span>`:''}</div>
   ${fotos.length?`<div class="bm-foto-grid">${fotos.map((x,i)=>`<figure class="bm-foto"><img src="${x.data}" alt="Foto bukti ${i+1}" loading="lazy"><figcaption><input class="inp bm-foto-ket" placeholder="Keterangan foto…" value="${esc(x.ket||'')}" data-act="bmfotoket" data-id="${id}" data-fid="${x.id}" maxlength="80"><div class="bm-foto-bar"><label class="ck"><input type="checkbox" data-act="bmfotocetak" data-id="${id}" data-fid="${x.id}" ${x.cetak!==false?'checked':''}> Sertakan di surat jalan</label>${bisaUbah?`<button class="btn sm ghost" data-act="bmfotodel" data-id="${id}" data-fid="${x.id}">Hapus</button>`:''}</div></figcaption></figure>`).join('')}</div><div class="note">${fotos.filter(x=>x.cetak!==false).length} dari ${fotos.length} foto ikut dicetak sebagai lampiran surat jalan ${b.link&&b.link.c==='vendor'?'vendor':b.link&&b.link.c==='kirim'?'customer':''}. Foto dikompres otomatis (sisi terpanjang 1280 px).</div>`:`<div class="note">Belum ada foto. Ambil foto dengan kamera atau unggah dari galeri; jumlahnya bebas. Foto yang dicentang ikut dicetak di lampiran surat jalan.</div>`}
  </div>
  <div><div class="dw-section-title">Aksi</div><div class="dw-btns">
   ${st!=='Selesai'&&st!=='Batal'?`${st==='Antri'?`<button class="btn sm primary" data-act="bmstep" data-id="${id}" data-to="Proses">Mulai ${b.jenis.toLowerCase()}</button>`:`<button class="btn sm primary" data-act="bmstep" data-id="${id}" data-to="Selesai">${ic('chk')}Selesai</button>`}`:''}
   <button class="btn sm ghost" data-act="bmkoreksi" data-id="${id}">${ic('edit')} Koreksi jam &amp; petugas</button>
   ${st!=='Batal'?`<button class="btn sm ghost" data-act="void" data-c="bongkar" data-id="${id}">Batalkan</button>`:''}
  </div></div>`;
 /* simpan metadata untuk print */
 const _bm_meta={jenis:b.jenis,muatan:b.muatan,pihak:b.pihak||'',nopol:b.nopol||'',kendaraan:b.kendaraan||'',driver:b.driver||'',tgl:b.tgl,ref:b.ref||'',docLabel:srcDocLabel,docRef:srcDocRef,items:srcItems};
 return {
  t:`${b.jenis==='Unloading'?'↓':'↑'} ${esc(b.nopol||'Kendaraan')} · ${esc(b.muatan)}`,
  s:`${stChip(st)} · ${esc(b.pihak||'')} · ${fd(b.tgl)}`,
  b:body,
  _bmmeta:_bm_meta
 };
})}
function voidForm(c,id){
 const lbl={vendor:'surat jalan vendor',kirim:'surat jalan customer',bongkar:'catatan bongkar muat',pr:'permintaan pembelian',spk:'SPK'}[c];
 openModal(`Batalkan ${lbl}`,fld('Alasan pembatalan',inp('alasan','','text','required placeholder="mis. salah pilih SPK, dibuat ulang"'),true)+`<div class="note full">Dokumen tidak dihapus, hanya ditandai <b>Batal</b> lengkap dengan alasan dan nama pembatal, supaya jejaknya tetap bisa dilacak.</div>`,
  async d=>{if(!String(d.alasan).trim())throw new Error('Isi alasan pembatalan.');const b={alasan:d.alasan.trim(),at:new Date().toISOString(),by:ME||null};
   if(c==='spk'){const aktifDok=S.vendor.filter(v=>v.spk===id&&v.status!=='Batal').length+S.kirim.filter(k=>k.spk===id&&k.status!=='Batal').length;if(aktifDok)throw new Error(`SPK ini masih punya ${aktifDok} surat jalan vendor/customer yang aktif. Batalkan surat jalannya dulu, atau selesaikan SPK.`)}
   if(c==='vendor'){const dv=byId('vendor',id);const sudah=(dv&&dv.items||[]).reduce((q,i)=>q+(+i.kembali||0)+(+i.reject||0),0);if(sudah>0)throw new Error(`Surat jalan vendor ini sudah menerima ${n(sudah)} barang kembali (termasuk reject); tidak bisa dibatalkan karena stok dan progres sudah bergerak.`)}
   if(c==='kirim'){const dk=byId('kirim',id);if(dk&&(dk.status==='Dalam Perjalanan'||dk.status==='Diterima'))throw new Error('Surat jalan berstatus '+dk.status+' tidak bisa dibatalkan. Kembalikan status ke Disiapkan dulu bila memang salah.');const adaStok=!!dk&&S.mutasi.some(m=>m.gudang==='fg'&&m.jenis==='keluar'&&!m.dikoreksi&&m.noDok&&m.noDok===dk.noSJ);if(adaStok&&!canMod('barang-jadi'))throw new Error('Surat jalan ini punya mutasi stok barang jadi. Akun Anda perlu hak Barang jadi untuk membatalkannya.')}
   const doc=byId(c,id);await updDoc(c,id,{status:'Batal',batal:b});
   if(c==='kirim'&&doc){for(const m of S.mutasi.filter(m=>m.gudang==='fg'&&m.jenis==='keluar'&&!m.dikoreksi&&m.spk===doc.spk&&m.noDok&&m.noDok===doc.noSJ)){await addDoc('mutasi',{gudang:'fg',item:m.item,jenis:'koreksi',delta:-m.delta,tgl:today(),noDok:m.noDok,ref:'Batal SJ '+m.noDok,spk:m.spk,pihak:m.pihak||'',ket:'Surat jalan dibatalkan: '+b.alasan,koreksiDari:m._id});await updDoc('mutasi',m._id,{dikoreksi:true})}}
   if((c==='vendor'||c==='kirim')&&doc){const key=doc.noSJ;if(!(key&&(c==='vendor'?S.vendor:S.kirim).some(o=>o._id!==id&&o.status!=='Batal'&&o.noSJ===key)))for(const x of S.bongkar.filter(x=>x.link&&x.status!=='Selesai'&&x.status!=='Batal'&&((key&&x.link.noSJ===key)||x.link.id===id)))await updDoc('bongkar',x._id,{status:'Batal',batal:{...b,alasan:'Dokumen sumber dibatalkan'}})}
   closeDrawer()},{submit:'Batalkan',done:'Dibatalkan · tercatat di riwayat'});
}
function koreksiForm(id){
 const m=byId('mutasi',id);const it=byId(m.gudang,m.item);
 openModal('Koreksi transaksi stok',`<div class="full kv"><div><span>Item</span><b>${esc(m.gudang==='rm'?rmLabel(it):m.gudang==='sp'?spLabel(it):fgLabel(it))}</b></div><div><span>Transaksi</span><b>${esc(MVL[m.jenis]||m.jenis)} ${m.delta>0?'+':''}${n(m.delta)} · ${fd(m.tgl)}</b></div><div><span>Dokumen</span><b>${esc(m.noDok||m.ref||'–')}</b></div></div>`+fld('Alasan koreksi',inp('ket','','text','required placeholder="mis. salah item, seharusnya 1.5 mm"'),true)+`<div class="note full">Sistem membuat transaksi pembalik ${m.delta>0?'−':'+'}${n(Math.abs(m.delta))}. Setelah itu catat ulang transaksi yang benar.</div>`,
  async d=>{if(!String(d.ket).trim())throw new Error('Isi alasan koreksi.');if(-m.delta<0){const cur=calc().stock[m.gudang][m.item];if(cur+(-m.delta)<0)throw new Error(`Koreksi membuat stok minus (stok sekarang ${n(cur)}).`)}
   await addDoc('mutasi',{gudang:m.gudang,item:m.item,jenis:'koreksi',delta:-m.delta,tgl:today(),noDok:m.noDok||'',ref:'Koreksi '+(m.noDok||fd(m.tgl)),spk:m.spk||'',pihak:m.pihak||'',ket:d.ket,koreksiDari:id});
   await updDoc('mutasi',id,{dikoreksi:true});
   /* penerimaan dari PR yang dikoreksi: qTerima PR dikembalikan agar sisa PR dan usulan beli kembali benar */
   if(m.jenis==='masuk'&&m.pr){const p=byId('pr',m.pr);if(p&&p.status!=='Batal'){let sisa=Math.abs(+m.delta||0);const items=(p.items||[]).map(i=>{if(i.item!==m.item||sisa<=0)return i;const k=Math.min(+i.qTerima||0,sisa);sisa-=k;return {...i,qTerima:(+i.qTerima||0)-k}});
    const lengkap=items.every(i=>(+i.qTerima||0)>=(+i.q||0));await updDoc('pr',p._id,{items,status:lengkap?'Selesai':(p.status==='Selesai'?'Dipesan':p.status)})}}},{submit:'Buat koreksi'});
}

/* ---------- MASTER DATA ---------- */
F['master-data']={tab:'vendor',q:'',showInactive:false,kf:''};
const usage=()=>{const u={vendor:{},customer:{},supplier:{},armada:{}};const inc=(k,x)=>{if(x)u[k][x]=(u[k][x]||0)+1};
 S.vendor.forEach(v=>{if(v.status!=='Batal'&&!UNKNOWN_V(v.vendor))inc('vendor',v.vendor);inc('armada',v.nopol)});
 S.spk.forEach(s=>inc('customer',s.customer));S.kirim.forEach(k=>{if(k.status!=='Batal')inc('customer',k.customer);inc('armada',k.nopol)});
 S.mutasi.forEach(m=>{if((m.gudang==='rm'||m.gudang==='sp')&&m.jenis==='masuk')inc('supplier',m.pihak);if(m.gudang==='fg'&&m.jenis==='keluar')inc('customer',m.pihak)});S.pr.forEach(p=>{if(p.status!=='Batal')inc('supplier',p.supplier)});S.bongkar.forEach(b=>inc('armada',b.nopol));return u};

// KPI summary per tab
const masterKpi=k=>{const u=usage()[k];const col=MK[k];const aktif=S[col].filter(x=>x.aktif!==false).length;const nonaktif=S[col].filter(x=>x.aktif===false).length;const totalUsage=Object.values(u).reduce((a,b)=>a+b,0);const unreg=Object.keys(u).filter(nm=>!S[col].some(x=>(k==='armada'?x.nopol:x.nama)===nm)).length;return {aktif,nonaktif,totalUsage,unreg}};

T['master-data']=()=>{const f=F['master-data'];const k=f.tab;const isKatalog=['item','grup','satuan','bb'].includes(k);const isWc=k==='wc'||k==='mesin'||k==='rute'||k==='matriks'||k==='proses'||k==='opsi'||k==='kop'||k==='aturan';
 return `${segBtns('master-data','tab',[['vendor','Vendor'],['customer','Customer'],['supplier','Supplier'],['armada','Armada'],['bb','Bahan baku'],['wc','Work Centre'],['mesin','Mesin'],['rute','Rute produksi'],['proses','Aturan proses'],['opsi','Opsi SPK'],['aturan','Aturan section'],['kop','Kop dokumen'],['item','Item SPK'],['grup','Judul section'],['satuan','Satuan & sales']])}<input class="inp search" id="q-master" placeholder="Cari nama…" value="${esc(f.q)}" data-act="q" data-view="master-data">${!isKatalog&&!isWc?`<label class="ck" style="font-size:13px;white-space:nowrap"><input type="checkbox" data-act="mshowInactive" ${f.showInactive?'checked':''}> Tampilkan nonaktif</label><button class="btn ghost sm" data-act="mcsv" title="Export CSV">${ic('download')} CSV</button>`:'<span class="grow"></span>'}${canManage()?`<button class="btn ghost sm" data-act="katberat" title="Katalog rumus berat">Katalog berat</button><button class="btn ghost sm" data-act="importcsv" title="Impor dari CSV">${ic('dl')} Impor CSV</button>`:''}${k==='rute'||k==='opsi'||k==='matriks'||k==='proses'?'':`<button class="btn primary" data-act="mnew">${ic('plus')}Tambah</button>`}`};

B['master-data']=()=>{
 if(F['master-data'].tab==='bb')return bbTab();
 if(F['master-data'].tab==='item')return katItemTab();if(F['master-data'].tab==='grup')return katGrupTab();if(F['master-data'].tab==='satuan')return katListTab();if(F['master-data'].tab==='wc')return wcTab();if(F['master-data'].tab==='mesin')return mesinTab();if(F['master-data'].tab==='rute'||F['master-data'].tab==='matriks')return ruteMatriksTab();if(F['master-data'].tab==='proses')return aturanProsesTab();if(F['master-data'].tab==='opsi')return opsiTab();if(F['master-data'].tab==='kop')return kopTab();if(F['master-data'].tab==='aturan')return aturanTab();
 const f=F['master-data'],k=f.tab,q=f.q.toLowerCase(),u=usage()[k],si=f.showInactive;const key=k==='armada'?'nopol':'nama';
 const kpi=masterKpi(k);
 // KPI row
 const kpiRow=`<div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">`+
  `<div class="kpi ok"><div class="lb">Aktif</div><div class="v">${kpi.aktif}</div></div>`+
  `<div class="kpi${kpi.nonaktif>0?' warn':''}"><div class="lb">Nonaktif</div><div class="v">${kpi.nonaktif}</div></div>`+
  `<div class="kpi info"><div class="lb">Total transaksi</div><div class="v">${kpi.totalUsage}</div></div>`+
  `<div class="kpi${kpi.unreg>0?' crit':' ok'}"><div class="lb">Belum terdaftar</div><div class="v">${kpi.unreg}</div></div>`+
 `</div>`;
 const allRows=S[MK[k]].filter(x=>!q||JSON.stringify(x).toLowerCase().includes(q));
 const rows=allRows.filter(x=>si||x.aktif!==false).sort((a,b)=>(a.aktif===false)-(b.aktif===false)||String(a[key]).localeCompare(String(b[key])));
 const unreg=Object.entries(u).filter(([nm])=>!S[MK[k]].some(x=>x[key]===nm)).sort((a,b)=>b[1]-a[1]);
 const MDESC={vendor:'Daftar resmi vendor finishing. Form kirim ke vendor hanya menerima nama dari sini, jadi tidak ada lagi "Beton" vs "Beron".',customer:'Daftar resmi customer. SPK baru dicek ke daftar ini agar satu perusahaan tidak tercatat dengan dua ejaan.',supplier:'Supplier plat/material. Penerimaan bahan baku wajib memilih supplier dari daftar ini.',armada:'Truk dan driver. Terisi otomatis dari no polisi yang pernah dicatat; lengkapi jenis dan drivernya di sini.'};
 const unregH=unreg.length&&k!=='armada'?`<section class="panel"><header><h2>Nama di transaksi yang belum terdaftar</h2><span class="hint">${unreg.length} nama</span></header><div class="tbl-wrap"><table><thead><tr><th>Nama tertulis</th><th class="num">Dipakai</th><th>Mirip dengan</th><th></th></tr></thead><tbody>${unreg.map(([nm,c])=>{const sim=similarTo(k,nm);return `<tr><td><b>${esc(nm)}</b></td><td class="num">${c}×</td><td>${sim?esc(sim.nama):'<span class="muted">–</span>'}</td><td class="acts-r"><button class="btn sm" data-act="mmerge" data-k="${k}" data-from="${esc(nm)}" data-to="${sim?esc(sim.nama):''}">Gabungkan ke…</button><button class="btn sm ghost" data-act="mreg" data-k="${k}" data-nm="${esc(nm)}">Daftarkan</button></td></tr>`}).join('')}</tbody></table></div></section>`:'';
 // Card grid for vendor/supplier; table for customer/armada
 let bodyH='';
 if(k==='vendor'||k==='supplier'){
  // Helper to render phone as clickable WA link
  const fmtPhone=p=>{if(!p)return '';const d=p.replace(/\D/g,'');const wa=d.startsWith('0')?'62'+d.slice(1):d;return`<a href="https://wa.me/${wa}" target="_blank" style="color:var(--accent);text-decoration:none">${esc(p)}</a>`};
  // Proses badge coloring
  const procBadge=pr=>{if(!pr)return '';return pr.split(',').map(p=>{const t=p.trim();const cls=t.toUpperCase().includes('ELG')?'vendor-elg':t.toUpperCase().includes('HDG')?'vendor-hdg':t.toUpperCase().includes('POWDER')||t.toUpperCase().includes('PC')?'vendor-pc':'';return`<span class="mcard-badge ${cls}">${esc(t)}</span>`}).join(' ')};
  bodyH=rows.length?`<div class="mcard-grid">${rows.map(x=>{const cnt=u[x[key]]||0;const nona=x.aktif===false;
   const cardRows=k==='vendor'?[
    x.proses?`<div class="mcard-row"><span class="mcard-lbl">Proses</span><span>${procBadge(x.proses)}</span></div>`:'',
    x.pic?`<div class="mcard-row"><span class="mcard-lbl">PIC</span><span>${esc(x.pic)}</span></div>`:'',
    x.telp?`<div class="mcard-row"><span class="mcard-lbl">${ic('phone')} Tel</span><span>${fmtPhone(x.telp)}</span></div>`:'',
    x.email?`<div class="mcard-row"><span class="mcard-lbl">${ic('mail')} Email</span><span><a href="mailto:${esc(x.email)}" style="color:var(--accent)">${esc(x.email)}</a></span></div>`:'',
    x.alamat?`<div class="mcard-row"><span class="mcard-lbl">${ic('pin')} Alamat</span><span>${esc(x.alamat)}</span></div>`:''
   ]:[
    x.material?`<div class="mcard-row"><span class="mcard-lbl">Material</span><span>${esc(x.material)}</span></div>`:'',
    x.pic?`<div class="mcard-row"><span class="mcard-lbl">PIC</span><span>${esc(x.pic)}</span></div>`:'',
    x.telp?`<div class="mcard-row"><span class="mcard-lbl">${ic('phone')} Tel</span><span>${fmtPhone(x.telp)}</span></div>`:'',
    x.email?`<div class="mcard-row"><span class="mcard-lbl">${ic('mail')} Email</span><span><a href="mailto:${esc(x.email)}" style="color:var(--accent)">${esc(x.email)}</a></span></div>`:''
   ];
   return`<div class="mcard${nona?' mcard-off':''}"><div class="mcard-h"><b>${esc(x[key])}</b><span class="mcnt">${cnt}×</span></div>${cardRows.filter(Boolean).join('')}${nona?`<div class="mcard-row"><span class="mcard-lbl">Status</span><span style="color:var(--muted)">Nonaktif${x.mergedTo?` · digabung ke ${esc(x.mergedTo)}`:''}</span></div>`:''}<div class="mcard-acts"><button class="btn sm ghost" data-act="medit" data-k="${k}" data-id="${x._id}">${ic('edit2')} Ubah</button>${x.aktif!==false?`<button class="btn sm ghost" data-act="mmerge" data-k="${k}" data-from="${esc(x[key])}" data-to="">${ic('merge')} Gabung</button>`:''}<button class="btn sm ghost danger" data-act="mdel" data-k="${k}" data-id="${x._id}">${ic('trash')} Hapus</button></div></div>`}).join('')}</div>`:empty(`Belum ada data ${MLBL[k]}`,MDESC[k],`<button class="btn primary" data-act="mnew">${ic('plus')}Tambah</button>`);
 }else{
  const cols={customer:[['pic','PIC'],['telp','Telepon'],['alamat','Alamat']],armada:[['jenis','Jenis'],['driver','Driver'],['milik','Milik']]}[k];
  bodyH=rows.length?`<div class="tbl-wrap"><table><thead><tr><th>${k==='armada'?'No polisi':'Nama'}</th>${cols.map(c=>`<th>${c[1]}</th>`).join('')}<th class="num">Dipakai</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr class="${x.aktif===false?'void':''}"><td><b class="${k==='armada'?'mono':''}">${esc(x[key])}</b>${x.mergedTo?`<div class="note">digabung ke ${esc(x.mergedTo)}</div>`:''}</td>${cols.map(c=>`<td>${esc(x[c[0]]||'')}</td>`).join('')}<td class="num">${u[x[key]]||0}×</td><td>${x.aktif===false?chip('Nonaktif','plain'):chip('Aktif','ok')}</td><td class="acts-r"><button class="btn sm ghost" data-act="medit" data-k="${k}" data-id="${x._id}">${ic('edit2')} Ubah</button>${k!=='armada'&&x.aktif!==false?`<button class="btn sm ghost" data-act="mmerge" data-k="${k}" data-from="${esc(x[key])}" data-to="">Gabung</button>`:''}<button class="btn sm ghost danger" data-act="mdel" data-k="${k}" data-id="${x._id}">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>`:empty(`Belum ada data ${MLBL[k]}`,MDESC[k],`<button class="btn primary" data-act="mnew">${ic('plus')}Tambah</button>`);
 }
 return kpiRow+unregH+`<section class="panel"><div class="pbody note">${MDESC[k]}</div>${bodyH}</section>`;
};
function masterForm(k,id,preset){
 const x=id?byId(MK[k],id):{};const key=k==='armada'?'nopol':'nama';
 // Define fields with [field, label, placeholder, attr, wide, type]
 const FIELDS={
  vendor:[
   ['nama','Nama vendor','PT / CV / UD…','required',false,'text'],
   ['proses','Proses finishing','ELG / HDG / Powder Coating','',false,'select:ELG|Electro Galvanized,HDG|Hot Dip Galvanized,PDC|Powder Coating,Non Finishing,Lainnya'],
   ['pic','PIC / Narahubung','Nama kontak','',false,'text'],
   ['telp','Telepon / WhatsApp','08xx…','',false,'tel'],
   ['email','Email','vendor@email.com','',false,'email'],
   ['alamat','Alamat lengkap','Jalan, Kota…','',true,'textarea']
  ],
  customer:[
   ['nama','Nama customer','PT / CV / Pribadi…','required',false,'text'],
   ['kota','Kota','Jakarta, Surabaya…','',false,'text'],
   ['npwp','NPWP','00.000.000.0-000.000','',false,'text'],
   ['pic','PIC / Narahubung','Nama kontak','',false,'text'],
   ['telp','Telepon','08xx…','',false,'tel'],
   ['email','Email','customer@email.com','',false,'email'],
   ['alamat','Alamat pengiriman','Jalan, Kota…','',true,'textarea']
  ],
  supplier:[
   ['nama','Nama supplier','Distributor / Pabrik…','required',false,'text'],
   ['kota','Kota','Jakarta, Cikarang…','',false,'text'],
   ['npwp','NPWP','00.000.000.0-000.000','',false,'text'],
   ['material','Material yang dipasok','SPHC, GI Sheet, SS304…','',true,'text'],
   ['pic','PIC','Nama kontak','',false,'text'],
   ['telp','Telepon','08xx…','',false,'tel'],
   ['email','Email','supplier@email.com','',false,'email'],
   ['alamat','Alamat lengkap','Jalan, Kota…','',true,'textarea']
  ],
  armada:[
   ['nopol','No polisi','B 1234 XX','required',false,'text'],
   ['jenis','Jenis kendaraan','Truk CDD, Engkel, Pickup…','',false,'text'],
   ['driver','Nama driver','','',false,'text'],
   ['milik','Kepemilikan','MNI / Ekspedisi ABC…','',false,'text']
  ]
 }[k];
 // Build form with 2-col grid where possible
 let formHtml='<div class="frow">';
 const rows=[];let open2=false;
 for(const [f,l,ph,attr,wide,type] of FIELDS){
  if(wide){
   if(open2){formHtml+='</div>';open2=false}
   if(rows.length%2===1){formHtml+='</div><div class="frow">';rows.pop()}
   formHtml+=`</div>${fld(l,type==='textarea'?`<textarea class="inp" name="${f}" placeholder="${ph}" rows="2" style="resize:vertical">${esc(x[f]||'')}</textarea>`:`<input class="inp" type="text" name="${f}" value="${esc(x[f]||'')}" placeholder="${ph}" ${attr}>`,true)}<div class="frow">`;
  }else if(type&&type.startsWith('select:')){
   const opts=type.slice(7).split(',').map(o=>{const[v,lb]=o.split('|');return `<option value="${esc(v)}" ${(x[f]||'')===(lb||v)?'selected':''}>${esc(lb||v)}</option>`}).join('');
   const sel2=`<select class="sel" name="${f}"><option value="">— pilih —</option>${opts}</select>`;
   if(rows.length&&rows.length%2===0){formHtml+='</div><div class="frow">';}
   formHtml+=fld(l,sel2,false);rows.push(f)
  }else{
   const inp2=`<input class="inp" type="${type}" name="${f}" value="${esc(x[f]??(f===key?preset||'':''))}" placeholder="${ph}" ${attr}>`;
   if(rows.length&&rows.length%2===0){formHtml+='</div><div class="frow">';}
   formHtml+=fld(l,inp2,false);rows.push(f)
  }
 }
 formHtml+='</div>';
 formHtml+=(id?`<label class="ck full"><input type="checkbox" name="aktif" ${x.aktif!==false?'checked':''}> Aktif (muncul di pilihan form)</label>`:'');
 openModal(`${id?'Ubah':'Tambah'} ${MLBL[k]}`,formHtml,
  async d=>{
   const val=k==='armada'?String(d[key]||'').toUpperCase().trim():cleanName(d[key]);if(!val)throw new Error('Nama wajib diisi.');
   const dup=S[MK[k]].find(y=>y._id!==id&&(k==='armada'?y.nopol===val:normName(y.nama)===normName(val)));if(dup)throw new Error(`Sudah ada: "${dup[key]}".`);
   const data={};FIELDS.forEach(([f])=>data[f]=String(d[f]||'').trim());data[key]=val;
   if(id){data.aktif=!!d.aktif;const old=x[key];await updDoc(MK[k],id,data);if(old&&old!==val&&k!=='armada'){await renameEverywhere(k,old,val)}}else await addDoc(MK[k],{...data,aktif:true})});
}
async function masterDel(k,id){
 const x=byId(MK[k],id);if(!x)return;const key=k==='armada'?'nopol':'nama';
 const u=usage()[k];const cnt=u[x[key]]||0;
 const canHard=cnt===0&&x.aktif!==false;
 openModal(`Hapus ${MLBL[k]}`,
  `<div class="note full" style="margin-bottom:8px"><b>${esc(x[key])}</b></div>`+
  (cnt>0?`<p class="note">Data ini dipakai di <b>${cnt} transaksi</b>. Tidak bisa dihapus permanen — hanya bisa <b>dinonaktifkan</b> agar tidak muncul di pilihan form.</p>`:
   x.aktif===false?`<p class="note">Data ini sudah nonaktif. Hapus permanen akan menghapus seluruh catatannya.</p>`:
   `<p class="note">Data ini belum pernah dipakai di transaksi. Bisa dihapus permanen atau dinonaktifkan.</p>`)+
  (cnt>0?'':`<label class="ck full"><input type="radio" name="mode" value="hard" ${canHard?'checked':''}> Hapus permanen</label><label class="ck full"><input type="radio" name="mode" value="soft" ${!canHard?'checked':''}> Nonaktifkan saja (bisa diaktifkan kembali)</label>`),
  async d=>{
   const mode=d.mode||'soft';
   if(mode==='hard'&&cnt===0){await delDoc(MK[k],id);toast(`${esc(x[key])} dihapus`)}
   else{await updDoc(MK[k],id,{aktif:false});toast(`${esc(x[key])} dinonaktifkan`)}
  },{submit:cnt>0?'Nonaktifkan':'Hapus',danger:cnt===0&&!canHard?false:cnt===0});
}
function masterCsv(k){
 const key=k==='armada'?'nopol':'nama';const u=usage()[k];
 const HDRS={vendor:['Nama','Proses','PIC','Email','Telepon','Alamat','Dipakai','Status'],customer:['Nama','PIC','Email','Telepon','Alamat','Dipakai','Status'],supplier:['Nama','Material','PIC','Email','Telepon','Dipakai','Status'],armada:['No Polisi','Jenis','Driver','Milik','Dipakai','Status']};
 const FLDS={vendor:['nama','proses','pic','email','telp','alamat'],customer:['nama','pic','email','telp','alamat'],supplier:['nama','material','pic','email','telp'],armada:['nopol','jenis','driver','milik']};
 const rows=S[MK[k]].slice().sort((a,b)=>String(a[key]).localeCompare(String(b[key])));
 const csv=[HDRS[k].join(','),...rows.map(x=>[...FLDS[k].map(f=>`"${(x[f]||'').replace(/"/g,'""')}"`),(u[x[key]]||0),x.aktif===false?'Nonaktif':'Aktif'].join(','))].join('\n');
 const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,﻿'+encodeURIComponent(csv);a.download=`master-${k}-${today()}.csv`;a.click();toast(`CSV ${MLBL[k]} diunduh`)}
function refsOf(k,name){const r=[];
 if(k==='vendor'){S.vendor.filter(v=>v.vendor===name).forEach(v=>r.push(['vendor',v._id,{vendor:'$'}]));S.bongkar.filter(b=>b.pihak===name).forEach(b=>r.push(['bongkar',b._id,{pihak:'$'}]))}
 if(k==='customer'){S.spk.filter(s=>s.customer===name).forEach(s=>r.push(['spk',s._id,{customer:'$'}]));S.kirim.filter(x=>x.customer===name).forEach(x=>r.push(['kirim',x._id,{customer:'$'}]));S.bongkar.filter(b=>b.pihak===name).forEach(b=>r.push(['bongkar',b._id,{pihak:'$'}]));S.mutasi.filter(m=>m.pihak===name).forEach(m=>r.push(['mutasi',m._id,{pihak:'$'}]))}
 if(k==='supplier'){S.mutasi.filter(m=>m.pihak===name).forEach(m=>r.push(['mutasi',m._id,{pihak:'$'}]));S.bongkar.filter(b=>b.pihak===name).forEach(b=>r.push(['bongkar',b._id,{pihak:'$'}]));S.pr.filter(p=>p.supplier===name).forEach(p=>r.push(['pr',p._id,{supplier:'$'}]))}
 return r}
async function renameEverywhere(k,from,to){const refs=refsOf(k,from);for(const [c,id,f] of refs){const up={};for(const key in f)up[key]=to;await DB.doc(c+'/'+id).update(up)}return refs.length}
function mergeForm(k,from,to){
 const n0=refsOf(k,from).length;
 openModal(`Gabungkan nama ${MLBL[k]}`,fld('Nama di transaksi',`<div style="padding:8px 0"><b>${esc(from)}</b> · ${n0} data</div>`,true)+fld(`Ganti menjadi (nama di master ${MLBL[k]})`,inp('to',to||'','text',`list="dl-mto" required autocomplete="off"`),true)+dl('dl-mto',mNames(k))+`<div class="note full">Semua ${n0} data yang memakai "${esc(from)}" diubah ke nama master. Gunakan untuk salah ketik seperti "Beron" → "Beton".</div>`,
  async d=>{need();const target=cleanName(d.to);if(!inMaster(k,target))throw new Error('Pilih nama yang sudah ada di master. Tambahkan dulu bila belum ada.');if(target===from)throw new Error('Nama sama.');
   const cnt=await renameEverywhere(k,from,target);const old=S[MK[k]].find(x=>x.nama===from);if(old)await updDoc(MK[k],old._id,{aktif:false,mergedTo:target});toast(`${cnt} data digabung ke ${target}`)},{submit:'Gabungkan',done:' '});
}

/* ---------- MASTER WORK CENTRE ---------- */
const WC_SEED=[
 {kode:'WC-CT-01',nama:'Shearing',tipe:'Internal',urutan:1},
 {kode:'WC-PNC-01',nama:'Punching',tipe:'Internal',urutan:2},
 {kode:'WC-BND-01',nama:'Bending',tipe:'Internal',urutan:3},
 {kode:'WC-CNC-01',nama:'CNC Laser',tipe:'Internal',urutan:4},
 {kode:'WC-ROL-01',nama:'Rolling',tipe:'Internal',urutan:5},
 {kode:'WC-WEL-01',nama:'Welding',tipe:'Internal',urutan:6},
 {kode:'WC-ELG-01',nama:'Electro Galvanized',tipe:'Subcont',urutan:7},
 {kode:'WC-HDG-01',nama:'Hot Dip Galvanized',tipe:'Subcont',urutan:8},
 {kode:'WC-PWC-01',nama:'Powder Coating',tipe:'Subcont',urutan:9},
 {kode:'WC-FNH-01',nama:'Finishing / QC Final',tipe:'Internal',urutan:10}
];

const MESIN_SEED={Shearing:['Shearing 3 Meter'],Punching:['Punching 1 (20 Ton)','Punching 2 (40 Ton)','Punching 3','Punching 4 (25 Ton)','Punching 5 (25 Ton)'],Bending:['Bending 1,2 Mtr','Bending 3 Mtr #1','Bending 3 Mtr #2'],'CNC Laser':['Laser Cutting 1','Laser Cutting 2'],Welding:['Welding 1','Welding 2']};
const mesinSeedDari=nama=>(MESIN_SEED[nama]||[]).map(m=>({nama:m,operator:[],kapasitas:0}));
/* ---------- Master Data: opsi SPK (produk, type, tebal, finishing, distribusi, penandatangan, lead time) ---------- */
function opsiTab(){const o=OPSI();const ok=canManage();const ta=(k,j,ket,baris)=>`<div class="fld full"><label for="op-${k}">${j}</label><textarea class="inp" id="op-${k}" data-op="${k}" rows="${baris||6}" ${ok?'':'disabled'}>${esc(o[k].join('\n'))}</textarea><small class="muted">${ket}</small></div>`;
 return `<section class="panel"><div class="pbody note">Daftar pilihan yang dipakai editor SPK dan lembar SPK. Satu baris satu pilihan. Mengubah daftar tidak mengubah SPK yang sudah ada. Produk baru muncul di tab Rute produksi (work center yang dilewati) dan Aturan section (bentuk yang boleh dipilih).</div>
 <div class="pbody opsi-g">${ta('p','Produk (judul section)','Huruf besar. Nama yang lebih panjang dicocokkan lebih dulu.',9)}${ta('t','Type','mis. STU, STC, SLU',9)}${ta('tb','Tebal (mm)','Angka dengan titik, mis. 1.2',9)}${ta('f','Finishing','Kata ELECTRO, HOTDIP, POWDER atau PDC menentukan vendor finishing (ELG, HDG, PDC); STAINLESS dan ALUMIN tanpa vendor.',9)}${ta('dist','Distribusi lembar SPK (Distributed to)','Daftar bawaan di SPK baru',5)}${ta('lead','Pilihan lead time','Saran isian Lead time di header SPK',5)}
 <div class="fld"><label for="op-signProc">Procurement / Estimator (bawaan)</label><input class="inp" id="op-signProc" data-op="signProc" value="${esc(o.signProc)}" ${ok?'':'disabled'}></div><div class="fld"><label for="op-signPpic">PPIC (bawaan)</label><input class="inp" id="op-signPpic" data-op="signPpic" value="${esc(o.signPpic)}" ${ok?'':'disabled'}></div></div>
 <div style="padding:0 16px 16px;display:flex;gap:8px;flex-wrap:wrap">${ok?`<button class="btn primary" data-act="opsisimpan">Simpan opsi SPK</button><button class="btn ghost" data-act="opsireset">Pulihkan bawaan</button>`:''}<button class="btn ghost" data-act="spktarget">Target waktu proses</button>${ok?`<button class="btn ghost" data-act="spkdimtoggle">Layout SPK per dimensi: ${spkDimBaru()?'Aktif':'Nonaktif'}</button>`:''}</div></section>`}
async function opsiSimpan(reset){const baca=k=>{const e=document.getElementById('op-'+k);return e?String(e.value).split('\n').map(x=>x.trim()).filter(Boolean):[]};
 const cur={...(byId('master','setting')||{})};delete cur._id;
 let spkOpsi=null;
 if(!reset){const p=[...new Set(baca('p').map(x=>x.toUpperCase()))],tt=[...new Set(baca('t').map(x=>x.toUpperCase()))],tb=[...new Set(baca('tb').map(x=>x.replace(',','.')))],ff=[...new Set(baca('f').map(x=>x.toUpperCase()))],dist=baca('dist'),lead=baca('lead');
  for(const [n,v] of [['Produk',p],['Type',tt],['Tebal',tb],['Finishing',ff],['Distribusi',dist],['Lead time',lead]])if(!v.length){toast(n+' tidak boleh kosong.');return}
  const salah=tb.find(x=>!(parseFloat(x)>0));if(salah){toast('Tebal "'+salah+'" bukan angka.');return}
  spkOpsi={p,t:tt,tb,f:ff,dist,lead,signProc:(document.getElementById('op-signProc').value||'').trim()||OPSI_DEF.signProc,signPpic:(document.getElementById('op-signPpic').value||'').trim()||OPSI_DEF.signPpic}}
 try{if(byId('master','setting'))await updDoc('master','setting',{spkOpsi});else{need();await DB.doc('master/setting').set({...cur,spkOpsi})}toast(reset?'Opsi SPK dipulihkan ke bawaan':'Opsi SPK disimpan')}catch(e){toast(e.message||String(e))}
 renderBody()}
/* ---------- Master Data: aturan section (bentuk apa yang boleh dipilih di section produk mana) ---------- */
const ARATUR_KEL=[['STRAIGHT','Batang lurus'],['FITTING','Fitting (elbow, tee, cross, riser, reducer)'],['COVER','Tutup (cover)'],['AKSESORI','Aksesori dan pendukung']];
function aturanBentuk(){const B=window.MNIBerat;if(!B||!B.siap||!B.siap()||!B.keluargaDaftar)return null;const peta={};
 for(const f of B.keluargaDaftar())for(const x of B.bentukSemua(f))if(!peta[x.kunci])peta[x.kunci]={kunci:x.kunci,nama:x.nama,kelompok:x.kelompok};
 return Object.values(peta)}
function aturanTab(){const B=window.MNIBerat,ok=canManage();const sem=aturanBentuk();
 if(!sem)return `<section class="panel"><div class="pbody note">Aturan section memakai katalog berat. Pasang katalog di Master Data › Katalog berat lebih dulu.</div></section>`;
 B.setAturan((byId('master','setting')||{}).aturanSection);const prods=[...new Set([...OPSI().p,...B.produkBentuk()])],cust=!!((byId('master','setting')||{}).aturanSection);
 const rows=ARATUR_KEL.map(([kel,jud])=>{const xs=sem.filter(x=>x.kelompok===kel);if(!xs.length)return '';
  return `<tr class="ar-g"><td colspan="${prods.length+1}">${esc(jud)}</td></tr>`+xs.map(x=>`<tr><td>${esc(x.nama)}</td>${prods.map(p=>`<td class="c"><input type="checkbox" data-ar="${esc(p)}|${esc(x.kunci)}" ${B.diizinkan(p,x.kunci)?'checked':''} ${ok?'':'disabled'} aria-label="${esc(x.nama)} di ${esc(p)}"></td>`).join('')}</tr>`).join('')}).join('');
 return `<section class="panel"><div class="pbody note">Menentukan bentuk apa yang boleh dipilih di tiap section SPK. Standar MNI: <b>Cable Tray, Perforated, dan Ladder</b> hanya batang lurus; <b>ACCS</b> (Tray, Ladder, Duct) memuat fitting dan aksesori; <b>Cover Tray</b> memuat semua tutup. Baris SPK lama yang bentuknya di luar aturan tetap terbaca dan hanya diberi tanda. ${cust?'<b>Aturan kustom aktif.</b>':'Memakai standar.'}</div>
 <div class="pbody"><div class="tbl-wrap"><table class="lines ar-t"><thead><tr><th>Bentuk</th>${prods.map(p=>`<th class="c">${esc(p)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></div>
 <div style="padding:0 16px 16px;display:flex;gap:8px;flex-wrap:wrap">${ok?'<button class="btn primary" data-act="aturansimpan">Simpan aturan</button><button class="btn ghost" data-act="aturanreset">Pulihkan standar</button>':'<span class="note">Hanya admin yang dapat mengubah aturan.</span>'}</div></section>`}
async function aturanSimpan(reset){let aturanSection=null;
 if(!reset){aturanSection={};document.querySelectorAll('input[data-ar]').forEach(c=>{const [p,k]=c.dataset.ar.split('|');(aturanSection[p]=aturanSection[p]||[]);if(c.checked)aturanSection[p].push(k)});const kosong=Object.keys(aturanSection).filter(p=>!aturanSection[p].length);kosong.forEach(p=>{delete aturanSection[p]});if(kosong.length)toast('Produk tanpa bentuk dikembalikan ke standar: '+kosong.join(', '))}
 const cur={...(byId('master','setting')||{})};delete cur._id;
 try{if(byId('master','setting'))await updDoc('master','setting',{aturanSection});else{need();await DB.doc('master/setting').set({...cur,aturanSection})}toast(reset?'Aturan section dipulihkan ke standar':'Aturan section disimpan')}catch(e){toast(e.message||String(e))}
 renderBody()}
/* ---------- Master Data: kop dokumen (logo, nama, alamat, kontak, warna) ---------- */
let KOP_PEND=null;
function kopTab(){const k=KOP(),ok=canManage();KOP_PEND=null;
 return `<section class="panel"><div class="pbody note">Kop ini dipakai di semua dokumen: pratinjau, PDF, dan Excel (surat jalan customer dan vendor, BTB, laporan produksi, KPI, checklist). Ubah di sini bila nama, alamat, kontak, atau logo perusahaan berubah. Dokumen yang sudah diunduh tidak ikut berubah. Tiap jenis dokumen tetap punya warna dan kode sendiri sebagai pembeda.</div>
 <div class="pbody opsi-g">
 <div class="fld"><label for="kp-nama">Nama perusahaan</label><input class="inp" id="kp-nama" value="${esc(k.nama)}" ${ok?'':'disabled'}></div>
 <div class="fld"><label for="kp-kontak">Kontak (telepon, email, web)</label><input class="inp" id="kp-kontak" value="${esc(k.kontak)}" placeholder="mis. Telp 021-xxxx · info@perusahaan.com" ${ok?'':'disabled'}></div>
 <div class="fld"><label for="kp-a1">Alamat baris 1</label><input class="inp" id="kp-a1" value="${esc(k.a1)}" ${ok?'':'disabled'}></div>
 <div class="fld"><label for="kp-a2">Alamat baris 2</label><input class="inp" id="kp-a2" value="${esc(k.a2)}" ${ok?'':'disabled'}></div>
 <div class="fld"><label for="kp-warna">Warna garis kop</label><input type="color" id="kp-warna" value="${esc(k.warna.toLowerCase())}" ${ok?'':'disabled'} style="height:36px;width:80px;padding:2px"></div>
 <div class="fld"><label for="kp-file">Logo ${k.custom?'(logo kustom aktif)':'(logo bawaan)'}</label><input type="file" id="kp-file" accept="image/png,image/jpeg" ${ok?'':'disabled'}><small class="muted">PNG atau JPG, latar transparan paling rapi. Otomatis dikecilkan (maks. 520 px lebar).</small></div>
 </div>
 <div class="pbody"><div class="kop-prev"><div class="dk" id="kp-prev" style="--dc:#1F3A6E;--br:${esc(k.warna)}">${docHeadHtml('sjc',{title:'SURAT JALAN',no:'26/XI/MNI/1',date:today()},k)}</div></div></div>
 <div style="padding:0 16px 16px;display:flex;gap:8px;flex-wrap:wrap">${ok?`<button class="btn primary" data-act="kopsimpan">Simpan kop</button><button class="btn ghost" data-act="kopreset">Pulihkan bawaan</button>`:'<span class="note">Hanya admin yang dapat mengubah kop.</span>'}</div></section>`}
function kopPrevRender(){const el=document.getElementById('kp-prev');if(!el)return;const v=id=>(document.getElementById(id)||{}).value||'';
 const k={...KOP(),nama:v('kp-nama').trim()||KOP_DEF.nama,a1:v('kp-a1').trim(),a2:v('kp-a2').trim(),kontak:v('kp-kontak').trim(),warna:v('kp-warna')||KOP_DEF.warna};
 if(KOP_PEND)k.logo=KOP_PEND.logo||LOGO;
 el.setAttribute('style','--dc:#1F3A6E;--br:'+k.warna);el.innerHTML=docHeadHtml('sjc',{title:'SURAT JALAN',no:'26/XI/MNI/1',date:today()},k)}
function kopBacaLogo(file){return new Promise((res,rej)=>{if(!/^image\/(png|jpeg)$/.test(file.type))return rej(new Error('Logo harus PNG atau JPG.'));
 const fr=new FileReader();fr.onerror=()=>rej(new Error('Gagal membaca berkas.'));fr.onload=()=>{const im=new Image();im.onerror=()=>rej(new Error('Gambar tidak dapat dibuka.'));im.onload=()=>{
  const k=Math.min(1,520/im.width,180/im.height),w=Math.max(1,Math.round(im.width*k)),h=Math.max(1,Math.round(im.height*k));const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');
  const png=file.type==='image/png';if(!png){cx.fillStyle='#fff';cx.fillRect(0,0,w,h)}cx.drawImage(im,0,0,w,h);const data=cv.toDataURL(png?'image/png':'image/jpeg',.92);
  if(data.length>300000)return rej(new Error('Logo terlalu besar setelah dikecilkan. Pakai gambar yang lebih sederhana.'));res({logo:data,w,h})};im.src=fr.result};fr.readAsDataURL(file)})}
async function kopSimpan(reset){
 let kop=null;
 if(!reset){const cur=(byId('master','setting')||{}).kop||{};const v=id=>(document.getElementById(id)||{}).value||'';
  kop={nama:v('kp-nama').trim()||KOP_DEF.nama,a1:v('kp-a1').trim(),a2:v('kp-a2').trim(),kontak:v('kp-kontak').trim(),warna:/^#[0-9a-f]{6}$/i.test(v('kp-warna'))?v('kp-warna').toUpperCase():KOP_DEF.warna};
  const lg=KOP_PEND||(cur.logo?{logo:cur.logo,w:cur.logoW,h:cur.logoH}:null);if(lg&&lg.logo){kop.logo=lg.logo;kop.logoW=lg.w;kop.logoH=lg.h}}
 const cur2={...(byId('master','setting')||{})};delete cur2._id;
 try{if(byId('master','setting'))await updDoc('master','setting',{kop});else{need();await DB.doc('master/setting').set({...cur2,kop})}toast(reset?'Kop dokumen dipulihkan ke bawaan':'Kop dokumen disimpan')}catch(e){toast(e.message||String(e))}
 KOP_PEND=null;renderBody()}
document.addEventListener('input',e=>{if(e.target&&/^kp-/.test(e.target.id||''))kopPrevRender()});
document.addEventListener('change',async e=>{const el=e.target;if(!el||el.id!=='kp-file'||!el.files||!el.files[0])return;
 try{KOP_PEND=await kopBacaLogo(el.files[0]);kopPrevRender();toast('Logo siap. Tekan Simpan kop untuk memakainya.')}catch(err){toast(err.message||String(err));el.value=''}});
/* ---------- Master Data: rute produksi per produk dan per bentuk ---------- */
const RUTE_BENTUK_FAM='STU';
function ruteBentukDaftar(prod){const B=window.MNIBerat;if(!B||!B.siap||!B.siap())return [];try{if(B.setAturan)B.setAturan((byId('master','setting')||{}).aturanSection);return (B.bentukProduk(RUTE_BENTUK_FAM,prod)||[]).map(x=>({kunci:kunciDariId(x.id),nama:x.nama}))}catch(_){return []}}
/* Rute belum disalin ke tiap item, jadi perubahan rute produk berlaku ke semua SPK aktif. Perubahan yang mengubah rute item yang sudah punya
   catatan produksi ditolak (progres dan antrian akan bergeser); item tanpa catatan boleh mengikuti rute baru. */
function ruteDampak(petaBaru){const P=PXL();const hit=new Set();if(!P)return [];
 S.spk.forEach(s=>{const x=calc().spk[s._id];if(!x||x.st==='Selesai'||x.st==='Draft'||x.st==='Batal')return;
  (s.items||[]).forEach((it,ix)=>{if(Array.isArray(it.rute)&&it.rute.length)return;/* item bersnapshot tidak terpengaruh perubahan master */const st=itemState(s,it,ix);if(!st||!(st.ev.length||(+it.prod||0)>0))return;
   const baru=P.tentukanRute({judulSection:it.g,deskripsi:it.d,ruteItem:it.rute},petaBaru,P.aturanKhususAktif(),{vendor:true,vv:it.vv||'',bentuk:it.sb?kunciDariId(it.sb):''}).rute;
   if(baru.join('>')!==st.rute.join('>'))hit.add(s.no)})});
 return [...hit].sort((a,b)=>a-b)}
const ruteTolak=d=>'Rute tidak diubah: '+d.length+' SPK lama (tanpa snapshot rute) sudah punya catatan produksi dengan rute lama (SPK '+d.slice(0,5).join(', ')+(d.length>5?' dan lainnya':'')+'). Selesaikan atau batalkan SPK itu dulu.';
async function ruteSimpan(peta){const cur=byId('master','rute_produksi');if(cur)await updDoc('master','rute_produksi',{rute:peta});else{need();await DB.doc('master/rute_produksi').set({rute:peta})}}
async function ruteHapus(k){const peta={...ruteStd()};delete peta[k];const dmp=ruteDampak(peta);if(dmp.length){toast(ruteTolak(dmp));return}try{await ruteSimpan(peta);toast('Rute khusus dihapus; bentuk itu kembali ke rute produk')}catch(e){toast(e.message||String(e))}renderBody()}
/* ---------- Master Data: Matriks rute (produk dan komponen x Work Centre), T-223 ----------
   Satu layar untuk melihat dan mengatur rute: tiap baris produk atau komponen, tiap kolom Work Centre internal. Komponen ikut rute produk
   (atau aturan khusus) sampai pengguna mengubah centangnya; itu membuat rute kustom 'PRODUK|BENTUK' yang bisa dipulihkan. */
function ruteEfektif(p,bentuk,nm){const P=PXL();if(!P)return {rute:[],sumber:'belum'};return P.tentukanRute({judulSection:p,deskripsi:nm||'',ruteItem:null},ruteStd(),P.aturanKhususAktif(),bentuk?{bentuk}:{})}
function ruteMatriksTab(){const P=PXL(),wcs=wcInternal(),ok=canManage(),q=String(F['master-data'].q||'').toLowerCase();
 if(!P)return empty('Mesin rute belum siap','Muat ulang halaman.');
 if(!wcs.length)return `<section class="panel"><div class="pbody note">Isi daftar Work Centre dulu (tab Work Centre); rute dipilih dari Work Centre internal.</div></section>`;
 const peta=ruteStd(),produk=[...new Set([...OPSI().p,...Object.keys(peta).filter(k=>!k.includes('|'))])],nmWc=new Set(wcs.map(w=>w.nama));
 const SUM={bentuk:['Kustom','info'],aturan:['Aturan khusus','warn'],produk:['Ikut produk','plain'],belum:['Belum ada rute','crit']};
 const sel=(rk,rute)=>wcs.map(w=>`<td style="text-align:center"><input type="checkbox" data-act="matck" data-rk="${esc(rk)}" value="${esc(w.nama)}" ${rute.includes(w.nama)?'checked':''} ${ok?'':'disabled'} aria-label="${esc(w.nama)}"></td>`).join('');
 const baris=(rk,judul,sub,r,bisaPulih)=>{const [sl,sc]=SUM[r.sumber]||SUM.belum,hil=r.rute.filter(w=>!nmWc.has(w)&&!P.langkahVendor(w));
  return `<tr data-rk="${esc(rk)}"><td><b>${esc(judul)}</b>${sub?`<div class="note">${esc(sub)}</div>`:''}</td>${sel(rk,r.rute)}<td>${chip(sl,sc)}${hil.length?` <span class="chip warn" title="Tidak ada di Work Centre aktif">${hil.map(esc).join(', ')}</span>`:''}</td><td class="muted">${esc(r.rute.join(' → ')||'–')}</td><td class="acts-r">${bisaPulih&&ok?`<button class="btn sm ghost" data-act="rutedel" data-rk="${esc(rk)}">Pulihkan</button>`:''}</td></tr>`};
 let rows='';
 produk.forEach(p=>{const bent=ruteBentukDaftar(p),cocokP=!q||p.toLowerCase().includes(q),rb=bent.filter(b=>cocokP||b.nama.toLowerCase().includes(q));if(!cocokP&&!rb.length)return;
  rows+=baris(p,p,'rute standar produk (semua komponen yang tidak diatur khusus)',{rute:peta[p]||[],sumber:peta[p]?'produk':'belum'},false);
  rb.forEach(b=>{const rk=p+'|'+b.kunci,e=ruteEfektif(p,b.kunci,b.nama);rows+=baris(rk,'\u00a0\u00a0\u00a0\u21b3 '+b.nama,'',e,!!(peta[rk]&&peta[rk].length))})});
 const hilang=ruteWcHilang();
 const banner=hilang.length?`<div class="ro" style="margin-bottom:10px"><b>Rute memakai Work Centre yang belum ada di Master Data:</b> ${hilang.map(esc).join(', ')}. Antrian untuk langkah itu tidak muncul di Produksi Hari Ini. <button type="button" class="btn sm" data-act="wcfix">Tambahkan otomatis</button> atau samakan namanya di tab Work Centre.</div>`:'';
 const tanpaKat=!ruteBentukDaftar(produk[0]||'').length?'<div class="note" style="margin:6px 0">Daftar komponen muncul setelah katalog berat terpasang (Master Data › Katalog berat).</div>':'';
 return `<section class="panel"><div class="pbody note">Centang Work Centre yang dilewati. Baris komponen (↳) ikut rute produk atau aturan khusus; mengubah centangnya membuat rute kustom untuk komponen itu, dan tombol Pulihkan mengembalikannya. Langkah vendor finishing otomatis dari finishing dan material, tidak diatur di sini. Urutan langkah mengikuti urutan Work Centre.</div>${banner}${tanpaKat}
 <div class="tbl-wrap"><table id="rute-tabel"><thead><tr><th>Produk / komponen</th>${wcs.map(w=>`<th style="text-align:center">${esc(w.nama)}</th>`).join('')}<th>Sumber</th><th>Rute</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="99" class="muted">Tidak ada yang cocok dengan pencarian.</td></tr>'}</tbody></table></div></section>`}
async function matrikCentang(el){const rk=el.dataset.rk,wcs=wcInternal(),peta={...ruteStd()},[p,bk]=rk.split('|');
 const baris=[...document.querySelectorAll('#rute-tabel input[data-rk]')].filter(x=>x.dataset.rk===rk),pilih=wcs.map(w=>w.nama).filter(n=>baris.some(x=>x.value===n&&x.checked));
 if(!pilih.length){el.checked=true;toast('Rute minimal satu work center.');return}
 const nm=bk?((ruteBentukDaftar(p).find(b=>b.kunci===bk)||{}).nama||bk):'',lama=bk?ruteEfektif(p,bk,nm).rute:(peta[rk]||[]);
 const pos=w=>wcs.findIndex(x=>x.nama===w),hasil=lama.filter(w=>pilih.includes(w)||pos(w)<0);
 for(const w of pilih.filter(x=>!lama.includes(x))){const i=hasil.findIndex(x=>pos(x)>pos(w));if(i<0)hasil.push(w);else hasil.splice(i,0,w)}
 peta[rk]=hasil;
 const dmp=ruteDampak(peta);if(dmp.length){el.checked=!el.checked;toast(ruteTolak(dmp));renderBody();return}
 try{await ruteSimpan(peta);toast('Rute '+rk.replace('|',' · ')+' disimpan')}catch(e){toast(e.message||String(e));el.checked=!el.checked}
 renderBody()}
/* ---------- Master Data: Aturan proses (F-08): aturan khusus komponen, finishing ke vendor, material tanpa vendor ----------
   Bawaan ada di mesin rute (rute.js) sebagai data; konfigurasi di sini (master/setting.aturanProses) menggantikannya. */
let AP_ED=null,_apKey=null;
function apHook(){const P=PXL();if(!P||!P.setAturanProses)return;const ap=(byId('master','setting')||{}).aturanProses||null,k=ap?JSON.stringify(ap):'';if(k!==_apKey){_apKey=k;P.setAturanProses(ap)}}
const apKata=s=>String(s||'').split(/[,|]/).map(x=>x.trim()).filter(Boolean);
const apAltTeks=a=>Object.entries(a||{}).map(([w,l])=>w+': '+(l||[]).join(', ')).join('; ');
const apAltParse=s=>{const o={};String(s||'').split(';').forEach(p=>{const i=p.indexOf(':');if(i<0)return;const w=p.slice(0,i).trim(),xs=apKata(p.slice(i+1));if(w&&xs.length)o[w]=xs});return o};
const apSalin=x=>JSON.parse(JSON.stringify(x));
function apAwal(){const P=PXL(),ap=(byId('master','setting')||{}).aturanProses||null,pilih=(a,b)=>apSalin(a&&a.length?a:b);
 return {kustom:!!ap,khusus:pilih(ap&&ap.khusus,P.ATURAN_KHUSUS_BAWAAN),finishing:pilih(ap&&ap.finishing,P.FINISHING_BAWAAN),material:pilih(ap&&ap.material,P.MATERIAL_TANPA_VENDOR_BAWAAN)}}
function aturanProsesTab(){const P=PXL();if(!P||!P.ATURAN_KHUSUS_BAWAAN)return empty('Mesin rute belum siap','Muat ulang halaman.');
 if(!AP_ED)AP_ED=apAwal();
 const ok=canManage(),dis=ok?'':' disabled',E=AP_ED;
 const ci=(s,i,f,v,ph,cls)=>`<input class="inp ${cls||''}" data-ap="${s}" data-i="${i}" data-f="${f}" value="${esc(v)}" placeholder="${esc(ph||'')}"${dis}>`;
 const hps=(s,i)=>ok?`<button class="btn sm ghost danger" data-act="apdel" data-s="${s}" data-i="${i}" aria-label="Hapus baris">${ic('trash')}</button>`:'';
 const fin=E.finishing.map((r,i)=>`<tr><td>${ci('finishing',i,'kata',(r.kata||[]).join(', '),'mis. ELECTRO')}</td><td style="width:140px">${ci('finishing',i,'kode',r.kode||'','mis. ELG','mono')}</td><td class="acts-r">${hps('finishing',i)}</td></tr>`).join('');
 const mat=E.material.map((r,i)=>`<tr><td>${ci('material',i,'kata',(r.kata||[]).join(', '),'mis. STAINLESS, SS304, SUS')}</td><td style="width:180px">${ci('material',i,'nama',r.nama||'','mis. stainless')}</td><td class="acts-r">${hps('material',i)}</td></tr>`).join('');
 const khu=E.khusus.map((r,i)=>`<tr><td>${ci('khusus',i,'kata',(r.kata||[]).join(', '),'mis. clamp, hanger')}</td><td>${ci('khusus',i,'produk',(r.produk||[]).join(', '),'kosong = semua produk')}</td><td>${ci('khusus',i,'rute',(r.rute||[]).join(', '),'mis. CNC Laser, Bending')}</td><td>${ci('khusus',i,'alt',apAltTeks(r.alt),'mis. CNC Laser: Shearing')}</td><td>${ci('khusus',i,'alasan',r.alasan||'','keterangan')}</td><td class="acts-r" style="white-space:nowrap">${ok?`<button class="btn sm ghost" data-act="apup" data-i="${i}" ${i?'':'disabled'} aria-label="Naikkan">↑</button><button class="btn sm ghost" data-act="apdn" data-i="${i}" ${i<E.khusus.length-1?'':'disabled'} aria-label="Turunkan">↓</button>`:''}${hps('khusus',i)}</td></tr>`).join('');
 const tam=s=>ok?`<button class="btn sm" data-act="apadd" data-s="${s}">${ic('plus')}Tambah baris</button>`:'';
 const hasil=(OPSI().f||[]).map(f=>{const m=P.materialDari(f),k=P.finishingDari(f);let t,c;
  if(/(^|[^A-Z])NON([^A-Z]|$)/.test(String(f).toUpperCase())){t='Tanpa vendor (non finishing)';c='plain'}
  else if(m!=='baja'){t='Tanpa vendor (material '+m+')';c='plain'}
  else if(k){t='Vendor '+k;c='ok'}
  else{t='Belum dikenali: tambahkan kata kunci finishing di atas';c='warn'}
  return `<tr><td>${esc(f)}</td><td>${chip(t,c)}</td></tr>`}).join('');
 return `<section class="panel"><div class="pbody note">Aturan proses menentukan bagaimana rute dan vendor finishing terbentuk dari judul section dan nama item SPK. Kata kunci dipisah koma; kata pendek (3 huruf atau kurang) dicocokkan sebagai kata utuh, yang panjang sebagai bagian teks, tanpa membedakan huruf besar kecil. ${E.kustom?'<b>Aturan kustom aktif.</b>':'Sekarang memakai bawaan; ubah lalu tekan Simpan untuk mengaturnya sendiri.'} Perubahan ditolak bila mengubah rute SPK lama yang sudah punya catatan produksi.</div>
 <div class="pbody"><h3 class="h3">Pemetaan finishing ke vendor</h3><p class="note" style="margin:0 0 6px">Kata di judul section menentukan kode vendor finishing (langkah akhir rute: Vendor ELG, HDG, PDC, dan seterusnya). Kata NON (Non Finishing) selalu tanpa vendor.</p><div class="tbl-wrap"><table class="lines"><thead><tr><th>Kata kunci di judul section</th><th>Kode vendor</th><th></th></tr></thead><tbody>${fin}</tbody></table></div>${tam('finishing')}</div>
 <div class="pbody"><h3 class="h3">Material tanpa vendor finishing</h3><p class="note" style="margin:0 0 6px">Material dengan kata kunci ini tidak dikirim ke vendor finishing (kecuali dipaksa per baris di editor SPK). Selain itu dianggap baja yang finishingnya dikerjakan vendor.</p><div class="tbl-wrap"><table class="lines"><thead><tr><th>Kata kunci di judul section</th><th>Nama material</th><th></th></tr></thead><tbody>${mat}</tbody></table></div>${tam('material')}</div>
 <div class="pbody"><h3 class="h3">Aturan khusus komponen</h3><p class="note" style="margin:0 0 6px">Komponen yang tidak melewati semua mesin produknya. Dicek berurutan dari atas, yang pertama cocok menang, dan mengalahkan rute produk (rute kustom per komponen di tab Rute produksi tetap yang paling kuat). Rute memakai nama Work Centre persis; mesin alternatif ditulis <span class="mono">WC: alternatif1, alternatif2; WC lain: alternatif</span>.</p><div class="tbl-wrap"><table class="lines"><thead><tr><th>Kata di nama item</th><th>Hanya produk</th><th>Rute (urutan Work Centre)</th><th>Mesin alternatif</th><th>Keterangan</th><th></th></tr></thead><tbody>${khu}</tbody></table></div>${tam('khusus')}</div>
 <div class="pbody"><h3 class="h3">Hasil untuk Finishing di Opsi SPK</h3><p class="note" style="margin:0 0 6px">Pemeriksaan: tiap pilihan Finishing di Opsi SPK harus jelas vendornya.</p><div class="tbl-wrap"><table class="lines"><thead><tr><th>Finishing (Opsi SPK)</th><th>Hasil</th></tr></thead><tbody>${hasil}</tbody></table></div></div>
 <div style="padding:0 16px 16px;display:flex;gap:8px;flex-wrap:wrap">${ok?'<button class="btn primary" data-act="apsimpan">Simpan aturan proses</button><button class="btn ghost" data-act="apreset">Pulihkan bawaan</button>':'<span class="note">Hanya admin yang dapat mengubah aturan proses.</span>'}</div></section>`}
document.addEventListener('input',e=>{const el=e.target;if(!el||!el.dataset||!el.dataset.ap||!AP_ED)return;const r=(AP_ED[el.dataset.ap]||[])[+el.dataset.i];if(!r)return;const f=el.dataset.f,v=el.value;
 if(f==='kata'||f==='produk'||f==='rute')r[f]=apKata(v);else if(f==='alt')r.alt=apAltParse(v);else r[f]=v});
function apTambah(s){if(!AP_ED)return;AP_ED[s].push(s==='finishing'?{kata:[],kode:''}:s==='material'?{kata:[],nama:''}:{kata:[],produk:[],rute:[],alt:{},alasan:''});renderBody()}
function apHapus(s,i){if(!AP_ED)return;AP_ED[s].splice(i,1);renderBody()}
function apGeser(i,d){const a=AP_ED&&AP_ED.khusus;if(!a||i+d<0||i+d>=a.length)return;[a[i],a[i+d]]=[a[i+d],a[i]];renderBody()}
/* SPK lama tanpa snapshot rute yang sudah punya catatan produksi: rute dihitung dengan konfigurasi lama dan baru; beda = ditolak */
function apDampak(ap,lama){const P=PXL(),hit=new Set();
 try{S.spk.forEach(s=>{const x=calc().spk[s._id];if(!x||x.st==='Selesai'||x.st==='Draft'||x.st==='Batal')return;
  (s.items||[]).forEach((it,ix)=>{if(Array.isArray(it.rute)&&it.rute.length)return;const st=itemState(s,it,ix);if(!st||!(st.ev.length||(+it.prod||0)>0))return;
   P.setAturanProses(lama);const r0=itemRute(it).join('>');P.setAturanProses(ap);const r1=itemRute(it).join('>');if(r0!==r1)hit.add(s.no)})})}finally{P.setAturanProses(lama)}
 return [...hit].sort((a,b)=>a-b)}
async function apSimpan(){const P=PXL(),E=AP_ED;if(!E)return;const wc=new Set(S.mwc.map(w=>String(w.nama).trim().toLowerCase()));
 const fin=E.finishing.map(r=>({kata:r.kata||[],kode:String(r.kode||'').trim().toUpperCase()})),mat=E.material.map(r=>({kata:r.kata||[],nama:String(r.nama||'').trim().toLowerCase()}));
 const khu=E.khusus.map(r=>({kata:r.kata||[],...(r.produk&&r.produk.length?{produk:r.produk}:{}),rute:r.rute||[],alt:r.alt||{},alasan:String(r.alasan||'').trim()}));
 if(fin.some(r=>!r.kata.length||!/^[A-Z0-9]{1,8}$/.test(r.kode))){toast('Finishing: isi kata kunci dan kode vendor (huruf atau angka, maksimal 8 karakter).');return}
 if(mat.some(r=>!r.kata.length||!r.nama)){toast('Material: isi kata kunci dan nama material.');return}
 if(khu.some(r=>!r.kata.length||!r.rute.length)){toast('Aturan khusus: isi kata kunci dan rute.');return}
 const hil=[...new Set(khu.flatMap(r=>[...r.rute,...Object.keys(r.alt),...Object.values(r.alt).flat()]).filter(w=>!wc.has(String(w).trim().toLowerCase())))];
 if(hil.length){toast('Work Centre tidak ada di Master Data: '+hil.join(', ')+'. Tambahkan di tab Work Centre atau samakan namanya.');return}
 const ap={finishing:fin,material:mat,khusus:khu},lama=(byId('master','setting')||{}).aturanProses||null,dmp=apDampak(ap,lama);
 if(dmp.length){toast(ruteTolak(dmp));return}
 try{await saveSetting({aturanProses:ap});AP_ED=null;toast('Aturan proses disimpan')}catch(e){toast(e.message||String(e))}
 renderBody()}
async function apReset(){const lama=(byId('master','setting')||{}).aturanProses||null,dmp=lama?apDampak(null,lama):[];
 if(dmp.length){toast(ruteTolak(dmp));return}
 try{await saveSetting({aturanProses:null});AP_ED=null;toast('Aturan proses dipulihkan ke bawaan')}catch(e){toast(e.message||String(e))}
 renderBody()}
async function seedWc(){
 if(S.mwc.length>0)return;
 for(const w of WC_SEED)await addDoc('mwc',{...w,aktif:true,ket:'',mesin:mesinSeedDari(w.nama)});
 toast('10 Work Centre default berhasil ditambahkan, lengkap dengan mesinnya');
}
/* Tambahkan Work Centre yang dipakai rute tetapi belum ada di Master Data (nama harus sama dengan nama langkah rute) */
async function seedWcHilang(){
 const h=ruteWcHilang();if(!h.length){toast('Semua Work Centre rute sudah ada');return}
 let u=Math.max(0,...S.mwc.map(w=>+w.urutan||0));
 for(const nama of h){u++;const ada=WC_SEED.find(x=>x.nama.toLowerCase()===nama.toLowerCase());
  await addDoc('mwc',{kode:ada?ada.kode:'WC-'+nama.toUpperCase().replace(/[^A-Z0-9]+/g,'-').slice(0,10),nama,tipe:'Internal',urutan:ada?ada.urutan:u,aktif:true,ket:'',mesin:mesinSeedDari(nama)})}
 toast(h.length+' Work Centre ditambahkan: '+h.join(', ')+'. Lengkapi mesin dan kapasitas lewat Ubah.');
}
async function seedMesin(){
 let k=0;for(const w of S.mwc){if(Array.isArray(w.mesin)&&w.mesin.length)continue;const m=mesinSeedDari(w.nama);if(!m.length)continue;await updDoc('mwc',w._id,{mesin:m});k++}
 toast(k?`Mesin diisi untuk ${k} work center. Lengkapi operator dan kapasitas lewat Ubah.`:'Semua work center sudah punya daftar mesin atau tidak dikenali');
}

function wcTab(){
 const f=F['master-data'],q=f.q.toLowerCase();
 const rows=S.mwc.filter(x=>!q||(x.kode+x.nama+x.tipe+(x.ket||'')).toLowerCase().includes(q)).sort((a,b)=>a.urutan-b.urutan);

 const kpiInt=S.mwc.filter(x=>x.tipe==='Internal'&&x.aktif!==false).length;
 const kpiSub=S.mwc.filter(x=>x.tipe==='Subcont'&&x.aktif!==false).length;
 const kpiOff=S.mwc.filter(x=>x.aktif===false).length;
 const kpiRow=`<div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">
  <div class="kpi ok"><div class="lb">Internal</div><div class="v">${kpiInt}</div></div>
  <div class="kpi info"><div class="lb">Subcont</div><div class="v">${kpiSub}</div></div>
  <div class="kpi${kpiOff>0?' warn':''}"><div class="lb">Nonaktif</div><div class="v">${kpiOff}</div></div>
  <div class="kpi"><div class="lb">Total WC</div><div class="v">${S.mwc.length}</div></div>
 </div>`;

 if(!rows.length&&S.mwc.length===0){
  return kpiRow+`<section class="panel"><div class="pbody note">Belum ada Work Centre. Tambahkan manual atau gunakan data default 10 WC dari MNI.</div>`+
   `<div style="display:flex;gap:8px;margin-top:12px"><button class="btn primary" data-act="mnew">+ Tambah Manual</button><button class="btn ghost" data-act="wcseed">${ic('zap')} Isi 10 WC Default</button></div></section>`;
 }
 if(!rows.length)return kpiRow+`<section class="panel">${empty('Tidak ada WC yang cocok','Coba ubah kata kunci pencarian')}</section>`;

 const tblRows=rows.map(x=>{
  const tipeCls=x.tipe==='Internal'?'ok':'info';
  const aktifCls=x.aktif===false?'void':'';
  const vendorNm=x.vendor?S.mvendor.find(v=>v._id===x.vendor)?.nama||'–':'–';
  return `<tr class="${aktifCls}">
   <td><b class="mono">${esc(x.kode)}</b></td>
   <td><b>${esc(x.nama)}</b>${+x.kapasitas>0?` <span class="muted" style="font-size:12px">· ${n(+x.kapasitas)} per hari</span>`:''}${Array.isArray(x.mesin)&&x.mesin.length?` <span class="muted" style="font-size:12px">· ${x.mesin.length} mesin: ${esc(x.mesin.map(m=>m.nama).join(', '))}</span>`:''}${x.ket?`<div class="note" style="font-size:12px">${esc(x.ket)}</div>`:''}</td>
   <td>${chip(x.tipe,tipeCls)}</td>
   <td>${x.tipe==='Subcont'?esc(vendorNm):'<span class="muted">–</span>'}</td>
   <td class="num muted">${x.urutan}</td>
   <td>${x.aktif===false?chip('Nonaktif','plain'):chip('Aktif','ok')}</td>
   <td class="acts-r">
    <button class="btn sm ghost" data-act="wcedit" data-id="${x._id}">${ic('edit2')} Ubah</button>
    <button class="btn sm ghost danger" data-act="wcdel" data-id="${x._id}">${ic('trash')}</button>
   </td>
  </tr>`;
 }).join('');

 return kpiRow+`<section class="panel">
  <div class="pbody note">Work Centre (WC) adalah mesin atau proses produksi yang digunakan dalam routing item. Subcont = dikerjakan oleh vendor luar.</div>
  <div class="tbl-wrap"><table>
   <thead><tr><th>Kode WC</th><th>Nama / Proses</th><th>Tipe</th><th>Vendor Subcont</th><th class="num">Urutan</th><th>Status</th><th></th></tr></thead>
   <tbody>${tblRows}</tbody>
  </table></div>
  <div style="margin-top:12px;display:flex;gap:8px">
   ${S.mwc.length===0?`<button class="btn ghost" data-act="wcseed">${ic('zap')} Isi 10 WC Default</button>`:`<button class="btn ghost" data-act="wcmesinseed">${ic('zap')} Isi mesin sesuai form laporan</button>`}
  </div>
 </section>`;
}

/* ---------- PRODUKSI MULTI WORK CENTER: rute, antrian, kapasitas, posisi, vendor (lihat documentation/RUTE_PRODUKSI.md) ---------- */
let EVX=null;
const PXL=()=>window.MNIProduksi||null;
function evIdx(){if(EVX)return EVX;EVX={};for(const e of evData()){if(e.jenis==='mulai'||e.jenis==='batal')continue;const k=e.spk_id+'|'+e.item_idx;(EVX[k]=EVX[k]||[]).push(e)}return EVX}
const ruteStd=()=>{apHook();const m=byId('master','rute_produksi');return (m&&m.rute)||PXL().RUTE_STANDAR};
function itemRuteInfo(it){const P=PXL();if(!P)return {rute:[],alt:{}};const r=P.tentukanRute({judulSection:it.g,deskripsi:it.d,ruteItem:it.rute,altItem:it.alt},ruteStd(),P.aturanKhususAktif(),{vendor:true,vv:it.vv||'',bentuk:it.sb?kunciDariId(it.sb):''});return {rute:r.rute,alt:r.alt||{}}}
/* Snapshot rute: rute dan mesin alternatif disalin ke tiap item saat SPK diterbitkan (atau direvisi, untuk item tanpa catatan) supaya perubahan
   rute produk di Master Data tidak menggeser SPK berjalan dan database bisa menghitung progres produksi dari rute yang sama. */
function itemAktif(s,idx){const it=(s.items||[])[idx];if(!it)return false;const st=itemState(s,it,idx);const ln=((calc().spk[s._id]||{}).lines||[])[idx]||{};return !!((st&&st.ev.length)||(+it.prod||0)>0||(+ln.vOut||0)>0||(+ln.kirim||0)>0)}
function snapItems(items,orig,oiList){const P=PXL();if(!P)return items;
 return items.map((it,k)=>{const oi=orig&&oiList?oiList[k]:null;const oit=oi!=null&&orig?(orig.items||[])[oi]:null;const {rute:_r0,alt:_a0,...dasar}=it;
  if(oit&&Array.isArray(oit.rute)&&oit.rute.length&&itemAktif(orig,oi))return {...dasar,rute:oit.rute.slice(),...(oit.alt&&Object.keys(oit.alt).length?{alt:oit.alt}:{})};
  const r=P.tentukanRute({judulSection:it.g,deskripsi:it.d,ruteItem:null},ruteStd(),P.aturanKhususAktif(),{vendor:true,vv:it.vv||'',bentuk:it.sb?kunciDariId(it.sb):''});
  return r.rute.length?{...dasar,rute:r.rute,...(r.alt&&Object.keys(r.alt).length?{alt:r.alt}:{})}:dasar})}
const itemRute=it=>itemRuteInfo(it).rute;
/* Keadaan item: rute, kumulatif per langkah, qty. Tanpa kejadian: progres lama (item.prod) dianggap sudah melewati semua langkah. */
function itemState(s,it,idx){
 const P=PXL();if(!P)return null;const {rute:r,alt}=itemRuteInfo(it);if(!r.length)return null;
 const ev=evIdx()[s._id+'|'+idx]||[];const qty=(+it.q||0)-ambilItem(s,it);
 /* Total manual lama (item.prod) dianggap sudah melewati semua langkah dan tetap dihitung bila hasil mesin dicatat sesudahnya (tidak hilang). */
 const dasar=Math.min(Math.max(0,+it.prod||0),qty);
 const kum=ev.length?Object.fromEntries(Object.entries(P.kumulatif(r,ev.map(e=>({wc:e.wc,qty:+e.qty||0,reject:+e.reject||0})),alt)).map(([w,v])=>[w,Math.min(qty,v+dasar)])):Object.fromEntries(r.map(w=>[w,dasar]));
 /* Langkah vendor: kum = yang sudah kembali OK dari vendor, vendorKirim = yang sudah dikirim (dari dokumen Kirim ke Vendor dan Terima dari Vendor) */
 const vendorKirim={};const vs=r.find(P.langkahVendor);
 if(vs){let out=0,back=0;for(const v of S.vendor){if(v.status==='Batal'||v.spk!==s._id)continue;for(const i of v.items||[])if(i.d===it.d){out+=+i.q||0;back+=+i.kembali||0}}
  kum[vs]=Math.min(back,qty);vendorKirim[vs]=out}
 return {rute:r,alt,kum,qty,ev,vendorKirim};
}
function prodFromEvents(s,it,idx){const ev=evIdx()[s._id+'|'+idx];if(!ev||!ev.length||!PXL())return null;const {rute:r,alt}=itemRuteInfo(it);if(!r.length)return null;const qp=(+it.q||0)-ambilItem(s,it);return Math.min(qp,PXL().progresItem(r,PXL().kumulatif(r,ev.map(e=>({wc:e.wc,qty:+e.qty||0,reject:+e.reject||0})),alt))+Math.min(Math.max(0,+it.prod||0),qp))}
const kapMesinSum=w=>(Array.isArray(w.mesin)?w.mesin:[]).reduce((a,m)=>a+(+m.kapasitas||0),0);
const kapWC=()=>Object.fromEntries(S.mwc.filter(w=>w.aktif!==false).map(w=>[w.nama,+w.kapasitas>0?+w.kapasitas:kapMesinSum(w)]).filter(([,k])=>k>0));
const wcInternal=()=>S.mwc.filter(w=>w.aktif!==false&&w.tipe!=='Subcont').sort((a,b)=>a.urutan-b.urutan);
function wcAktifItems(){
 const c=calc();const out=[];
 S.spk.forEach(s=>{const x=c.spk[s._id];if(!x||x.st==='Selesai'||x.st==='Draft'||s.status==='Batal')return;
  (s.items||[]).forEach((it,idx)=>{const st=itemState(s,it,idx);if(st)out.push({spk:s.no,spkId:s._id,customer:s.customer,item:it.d,satuan:it.u,idx,kategori:it.g,qty:st.qty,rute:st.rute,alt:st.alt,kum:st.kum,vendorKirim:st.vendorKirim,due:s.due||''})})});
 return out;
}
const evTgl=e=>e.tgl||String(e.at||'').slice(0,10);
/* Progres per Work Centre: tiap item aktif yang rutenya melewati WC itu, dengan target, sudah sampai, selesai, siap, belum sampai, dan tanggal terakhir dicatat */
function progresWcRows(wc){
 const P=PXL();if(!P)return [];const ev=evIdx();
 return wcAktifItems().map(it=>{const i=P.indeksLangkah(it.rute,it.alt,wc);if(i<0)return null;
  const a=P.antrianPerLangkah(it.rute,it.kum,it.qty)[i];const terakhir=(ev[it.spkId+'|'+it.idx]||[]).filter(e=>P.indeksLangkah(it.rute,it.alt,e.wc)===i).map(evTgl).sort().pop()||'';
  const status=a.selesai>=it.qty?'Selesai':a.antri>0?'Siap':'Menunggu';
  return {spk:it.spk,customer:it.customer,item:it.item,satuan:it.satuan,due:it.due,total:it.qty,masuk:a.masuk,selesai:a.selesai,antri:a.antri,belum:Math.max(0,it.qty-a.masuk),pct:it.qty>0?Math.min(100,Math.round(a.selesai/it.qty*100)):0,status,terakhir,langkah:it.rute.filter(w=>!P.langkahVendor(w)).join(' › ')}}).filter(Boolean)
  .sort((x,y)=>(x.due||'9999').localeCompare(y.due||'9999')||String(x.spk).localeCompare(String(y.spk)));
}
const progStCls={Selesai:'ok',Siap:'warn',Menunggu:'plain'};
function progresWcHtml(){
 const P=PXL();if(!P)return empty('Belum siap','Muat ulang halaman.');
 const f=F['produksi'];const wc=f.pwc;const ws=wcInternal();if(!ws.length)return empty('Belum ada Work Centre internal','Isi Work Centre di Master Data.');
 const rows=progresWcRows(wc);const sum=k=>rows.reduce((a,r)=>a+r[k],0);
 const kt=[['Item di WC ini',n(rows.length),rows.filter(r=>r.status==='Selesai').length+' selesai'],['Siap dikerjakan',n(sum('antri')),rows.filter(r=>r.status==='Siap').length+' item'],['Akan datang',n(sum('belum')),rows.filter(r=>r.belum>0).length+' item belum sampai'],['Sudah selesai',n(sum('selesai')),'dari '+n(sum('total'))+' target']];
 const kpi='<div class="kpi-row">'+kt.map(([l,v,s],i)=>'<div class="kpi'+(i===1?' warn':i===3?' ok':' info')+'"><span class="lb">'+l+'</span><span class="v">'+v+'</span><span class="s">'+esc(s)+'</span></div>').join('')+'</div>';
 const tbl=rows.length?'<table id="prog-tabel"><thead><tr><th>SPK</th><th>Item</th><th>Rute</th><th class="num">Target</th><th class="num">Sudah sampai</th><th class="num">Selesai di '+esc(wc)+'</th><th class="num">Siap</th><th class="num">Belum sampai</th><th>Progres</th><th>Terakhir</th><th>Due</th><th>Status</th></tr></thead><tbody>'+rows.map(r=>'<tr data-spk="'+esc(String(r.spk))+'"><td><b>'+esc(String(r.spk))+'</b><div class="note">'+esc(r.customer||'')+'</div></td><td>'+esc(r.item)+'</td><td class="note">'+esc(r.langkah)+'</td><td class="num">'+n(r.total)+'</td><td class="num">'+n(r.masuk)+'</td><td class="num"><b>'+n(r.selesai)+'</b></td><td class="num">'+n(r.antri)+'</td><td class="num">'+n(r.belum)+'</td><td><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;min-width:60px;height:8px;background:var(--surface-2);border-radius:4px"><div style="width:'+r.pct+'%;height:8px;background:var(--ok);border-radius:4px"></div></div><span>'+r.pct+'%</span></div></td><td>'+(r.terakhir?fd(r.terakhir):'–')+'</td><td>'+(r.due?fd(r.due):'–')+'</td><td>'+chip(r.status,progStCls[r.status]||'')+'</td></tr>').join('')+'</tbody></table>':'<div class="muted" style="padding:20px;text-align:center">Belum ada item aktif yang rutenya melewati '+esc(wc)+'.</div>';
 const items=wcAktifItems();const cols=ws.map(w=>w.nama);
 const mt=items.length?'<table id="prog-matriks"><thead><tr><th>SPK</th><th>Item</th>'+cols.map(c=>'<th class="num">'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+items.map(it=>'<tr><td><b>'+esc(String(it.spk))+'</b><div class="note">'+esc(it.customer||'')+'</div></td><td>'+esc(it.item)+'</td>'+cols.map(c=>{const i=P.indeksLangkah(it.rute,it.alt,c);if(i<0)return '<td class="num muted">–</td>';const a=P.antrianPerLangkah(it.rute,it.kum,it.qty)[i];const cls=a.selesai>=it.qty?'ok':a.antri>0?'warn':'muted';return '<td class="num '+cls+'">'+n(a.selesai)+'/'+n(it.qty)+'</td>'}).join('')+'</tr>').join('')+'</tbody></table>':'<div class="muted" style="padding:16px;text-align:center">Belum ada SPK aktif dengan rute produksi.</div>';
 return kpi+'<section class="panel"><div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:0 0 6px 0">Progres item di '+esc(wc)+'</div><div class="tbl-wrap">'+tbl+'</div></div></section><section class="panel"><div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:0 0 6px 0">Matriks progres semua SPK per Work Centre (selesai / target)</div><div class="tbl-wrap">'+mt+'</div><div class="note" style="margin-top:6px">Hijau: selesai di langkah itu. Kuning: ada yang siap dikerjakan. Tanda – : item tidak melewati WC itu.</div></div></section>';
}
async function progCsv(){
 const wc=(F['produksi']||{}).pwc;const rows=progresWcRows(wc);const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
 const csv=['SPK,Customer,Item,Rute,Target,Sudah sampai,Selesai,Siap,Belum sampai,Progres %,Terakhir,Due,Status',...rows.map(r=>[r.spk,r.customer,r.item,r.langkah,r.total,r.masuk,r.selesai,r.antri,r.belum,r.pct,r.terakhir,r.due,r.status].map(q).join(','))].join('\n');
 try{await DLS.save({filename:'Progres-'+fnSafe(wc)+'-'+today()+'.csv',data:new Blob([csv],{type:'text/csv'})})}catch(e){if(e.code!=='declined')toast('Gagal mengunduh: '+(e.message||e.code))}
}
function lamaFromEvents(){
 const arr=[];S.spk.forEach(s=>(s.items||[]).forEach((it,idx)=>{const ev=evIdx()[s._id+'|'+idx];if(!ev||!ev.length)return;const r=itemRute(it);if(r.length){const al=itemRuteInfo(it).alt;arr.push({qty:+it.q||0,rute:r,tglSpk:s.tgl,kejadian:ev.map(e=>({wc:r[PXL().indeksLangkah(r,al,e.wc)]||e.wc,qty:+e.qty||0,at:e.at}))})}}));
 return PXL().lamaProsesWC(arr);
}
const fHari=h=>h==null?'–':(Math.round(h*10)/10).toString().replace('.',',');
const stWcCls={Kosong:'plain',Normal:'ok',Padat:'warn',Overload:'crit','Kapasitas belum diatur':'plain'};

/* Posisi batang sebuah SPK: di mesin mana (menunggu atau dikerjakan), di vendor, atau selesai produksi */
function posisiSpkHtml(s){
 const P=PXL();if(!P)return '';const its=[];
 (s.items||[]).forEach((it,idx)=>{const st=itemState(s,it,idx);if(st)its.push({rute:st.rute,kum:st.kum,qty:st.qty,vendorKirim:st.vendorKirim})});
 if(!its.length)return '';
 const vend=calc().vend.filter(x=>x.v.spk===s._id&&(x.st==='Di Vendor'||x.st==='Kembali Sebagian'));
 const vtxt=vend.length?vend.map(x=>`di ${esc(x.v.vendor)} ${n(x.sisa)} (hari ke-${x.age})`).join(' · '):'';
  const pos=P.posisiSPK(its).filter(p=>!(vend.length&&p.tempat.endsWith('(di vendor)'))).slice(0,4);
 return `<div class="note" style="margin-top:3px;white-space:normal">${pos.map(p=>`${esc(p.tempat)} <b>${n(p.qty)}</b>`).join(' · ')}${vtxt?' · '+vtxt:''}</div>`;
}

/* Panel beban per work center di Dashboard Produksi */
function wcPanelBaru(){
 const P=PXL();if(!P)return '';
 const items=wcAktifItems();const kap=kapWC();const t=today();
 const evAll=evData();
 const evHari=evAll.filter(e=>evTgl(e)===t).map(e=>({wc:e.wc,qty:+e.qty||0}));
 const beban=P.bebanWC(items,kap,evHari);
 const thr=P.throughputAktual(evAll.map(e=>({wc:e.wc,qty:+e.qty||0,tgl:evTgl(e)})),addDays(t,-13),t);
 const lama=lamaFromEvents();
 const urut=wcInternal().map(w=>w.nama);const nama=[...urut.filter(w=>beban[w]),...Object.keys(beban).filter(w=>!urut.includes(w))];
 const rows=nama.map(w=>{const b=beban[w];const th=thr[w];const lm=lama[w];const pct=b.hariHabis==null?0:Math.min(100,b.hariHabis/5*100);
  const col=b.status==='Overload'?'var(--crit)':b.status==='Padat'?'var(--warn)':'var(--ok)';
  const saran=th&&b.kapasitas&&th.rataPerHari&&Math.abs(th.rataPerHari-b.kapasitas)/b.kapasitas>0.2?` <span class="muted" title="Rata-rata hasil 14 hari terakhir, bisa dijadikan acuan kapasitas">(aktual ${n(Math.round(th.rataPerHari))})</span>`:'';
  return `<tr data-wc="${esc(w)}" data-antri="${b.antri}"><td><b>${esc(w)}</b></td><td class="num">${n(b.antri)}<div class="note">${b.jumlahSpk} SPK</div></td><td class="num">${b.kapasitas?n(b.kapasitas)+saran:'<span class="muted">belum diatur</span>'}</td>
   <td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;min-width:60px;height:8px;background:var(--surface-2);border-radius:4px"><div style="width:${pct}%;height:8px;background:${col};border-radius:4px"></div></div><span style="min-width:28px;text-align:right">${fHari(b.hariHabis)}</span></div></td>
   <td class="num">${n(b.selesaiHariIni)}</td><td class="num">${th?n(Math.round(th.rataPerHari)):'–'}</td><td class="num">${lm?fHari(lm.rataHari)+' hk':'–'}</td><td>${chip(b.status,stWcCls[b.status]||'')}</td></tr>`}).join('');
 // penahan dan SPK berisiko telat
 const adaKap=Object.keys(kap).length>0;
 const pen=nama.map(w=>beban[w]).filter(b=>b.hariHabis!=null&&b.antri>0).sort((a,b)=>b.hariHabis-a.hariHabis)[0];
 const pred=P.prediksiSelesai(items,kap);const perSpk={};
 pred.forEach(p=>{if(p.hari==null)return;const o=perSpk[p.spk]||(perSpk[p.spk]={hari:0,penentu:'',spk:p.spk});if(p.hari>=o.hari){o.hari=p.hari;o.penentu=p.penentu}});
 const risiko=Object.values(perSpk).map(o=>{const s=S.spk.find(x=>x.no===o.spk);const tgl=P.tambahHariKerja(t,o.hari);return {...o,tgl,due:s&&s.due,telat:!!(s&&s.due&&tgl>s.due)}}).filter(o=>o.telat);
 const siapV={};items.forEach(it=>P.posisiItem(it.rute,it.kum,it.qty,it.vendorKirim).filter(p=>p.jenis==='vendor-siap-kirim').forEach(p=>{const o=siapV[p.tempat]||(siapV[p.tempat]={qty:0,spk:new Set()});o.qty+=p.qty;o.spk.add(it.spk)}));
 const bar=[...Object.entries(siapV).map(([w,o])=>`<div class="wc-note warn">Siap dikirim ke ${esc(w)}: <b>${n(o.qty)}</b> dari ${o.spk.size} SPK (selesai produksi, belum ada surat jalan vendor)</div>`),pen&&pen.hariHabis>=1?`<div class="wc-note crit">Penahan: <b>${esc(pen.wc)}</b>, antrian ${n(pen.antri)} butuh ${fHari(pen.hariHabis)} hari kerja untuk habis</div>`:'',
  ...risiko.slice(0,4).map(o=>`<div class="wc-note warn">SPK ${esc(String(o.spk))} berisiko telat: perkiraan selesai ${fd(o.tgl)}, due ${fd(o.due)} · penahan ${esc(o.penentu)}</div>`)].join('');
 return `<div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:0 0 6px 0">Beban per work center</div>
  ${adaKap?'':'<div class="note" style="padding:0 0 8px">Isi kapasitas per hari tiap work center di Master Data, Work Centre, agar hari habis dan status terhitung.</div>'}
  <div class="tbl-wrap"><table id="wc-beban"><thead><tr><th>Work center</th><th class="num">Antrian</th><th class="num">Kapasitas/hari</th><th>Hari habis</th><th class="num">Hari ini</th><th class="num">Aktual/hari (14 hr)</th><th class="num">Lama proses</th><th>Status</th></tr></thead>
  <tbody>${rows||'<tr><td colspan="8" class="muted" style="text-align:center;padding:20px">Belum ada SPK aktif dengan rute produksi.</td></tr>'}</tbody></table></div>${bar?`<div class="wc-notes">${bar}</div>`:''}</div>`;
}

/* Kecepatan dan kualifikasi vendor (subcon) */
function vendorPanelBaru(){
 const P=PXL();if(!P)return '';const c=calc();const T=SPKT();const t=today();
 const target={HDG:T.hdg,ELG:T.elg,PDC:T.pdc};
 const peng=c.vend.filter(x=>x.v.status!=='Batal').map(x=>{const v=x.v;const selesai=x.st==='Selesai';const last=(v.riwayat||[]).slice(-1)[0];
  return {vendor:v.vendor,proses:vKey(v.proses).toUpperCase(),tglKirim:v.tgl,tglKembali:selesai?((last&&last.tgl)||String(v.updAt||'').slice(0,10)||null):null,qty:(v.items||[]).reduce((a,i)=>a+(+i.q||0),0),reject:(v.items||[]).reduce((a,i)=>a+(+i.reject||0),0),noSJ:v.noSJ,sisa:x.sisa}});
 const kual=P.kualifikasiVendor(peng,target,t);
 if(!kual.length)return '';
 const warna={A:'ok',B:'info',C:'crit'};
 const rows=kual.map(k=>`<tr><td><b>${esc(k.vendor)}</b></td><td class="num">${k.pengiriman}</td><td class="num">${k.rataTAT==null?'–':fHari(k.rataTAT)+' hk'}</td><td class="num">${k.tepatWaktu==null?'–':Math.round(k.tepatWaktu*100)+'%'}</td><td class="num">${k.rejectRate==null?'–':(Math.round(k.rejectRate*1000)/10).toString().replace('.',',')+'%'}</td><td class="num">${k.masihDiVendor?k.masihDiVendor+(k.umurTertua!=null?' · tertua '+k.umurTertua+' hk':''):'–'}</td><td>${chip(k.nilai,warna[k.nilai]||'plain')}</td></tr>`).join('');
 const buka=peng.filter(p=>!p.tglKembali).map(p=>{const pk=P.perkiraanKembali(p.vendor,p.proses,p.tglKirim,kual,target);return pk?`<li>${esc(p.noSJ||'')} · ${esc(p.vendor)} · dikirim ${fd(p.tglKirim)} · perkiraan kembali <b>${fd(pk.tanggal)}</b> <span class="muted">(${pk.dasar})</span></li>`:''}).filter(Boolean);
 return `<div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:8px 0 6px 0">Kecepatan dan kualifikasi vendor</div>
  <div class="tbl-wrap"><table id="vendor-kual"><thead><tr><th>Vendor</th><th class="num">Kiriman</th><th class="num">Rata-rata TAT</th><th class="num">Tepat waktu</th><th class="num">Reject</th><th class="num">Masih di vendor</th><th>Nilai</th></tr></thead><tbody>${rows}</tbody></table></div>
  ${buka.length?`<ul class="note" style="margin:8px 0 0 18px;padding:0">${buka.join('')}</ul>`:''}
  <div class="note" style="margin-top:6px">Tepat waktu = kembali dalam target hari kerja proses (HDG, ELG, PDC dari pengaturan). Nilai A: tepat waktu 90% ke atas dan reject 1% ke bawah; B: 75% dan 3%; di bawahnya C. Nilai butuh minimal 3 kiriman selesai.</div></div>`;
}

/* ---- Antrian Mesin: operator mencatat hasil di mesinnya (Mulai lalu Selesai, atau catat manual) ---- */
F.mesin=F.mesin||{wc:'',mesin:''};
const mesinWC=nama=>{const w=S.mwc.find(x=>x.nama===nama);return Array.isArray(w&&w.mesin)?w.mesin.filter(m=>mesinOn(m.nama)):[]};
const opKey=m=>'mni-op:'+m;
const lsGet=k=>{try{return localStorage.getItem(k)||''}catch(_){return ''}};
const lsSet=(k,v)=>{try{if(v)localStorage.setItem(k,v);else localStorage.removeItem(k)}catch(_){}};
/* Work center dan mesin yang sedang dipilih di perangkat ini (diingat). Work center tanpa daftar mesin: mesinnya = nama work center. */
function mesinPilih(){
 const w=wcInternal();
 if(!F.mesin.wc)F.mesin.wc=lsGet('mni-wc');
 if(!w.some(x=>x.nama===F.mesin.wc))F.mesin.wc=((w.find(x=>antrianMesin(x.nama).length>0)||w[0]||{}).nama)||'';
 const daftar=mesinWC(F.mesin.wc);
 if(daftar.length){if(!F.mesin.mesin)F.mesin.mesin=lsGet('mni-mesin');if(!daftar.some(m=>m.nama===F.mesin.mesin))F.mesin.mesin=daftar[0].nama}else F.mesin.mesin='';
 return {wc:F.mesin.wc,mesin:F.mesin.mesin||F.mesin.wc,daftar};
}
function opNow(mesin){let o=lsGet(opKey(mesin));if(!o){const m=mesinWC(F.mesin.wc).find(x=>x.nama===mesin);o=(m&&m.operator&&m.operator[0])||''}return o}
const fDur=m=>m==null?'–':m<60?`${Math.round(m)} mnt`:`${Math.floor(m/60)} j ${Math.round(m%60)} mnt`;
const evHasil=()=>evData().filter(e=>(e.jenis||'hasil')==='hasil');
/* Kejadian dilengkapi nomor SPK dan customer dari SPK bila belum tersalin di baris kejadian */
const evLengkap=e=>{const s=byId('spk',e.spk_id)||{};const it=(s.items||[])[+e.item_idx]||{};const k=e.kelompok||!PXL()?null:PXL().klasifikasi(it.g,e.item_desc||it.d,s.material);
 return {...e,spk_no:e.spk_no||s.no||'',customer:e.customer||s.customer||'',kelompok:e.kelompok||(k&&k.kelompok)||'Lainnya',tipe:e.kelompok?(e.tipe||''):(k?k.tipe:''),material:e.kelompok?(e.material||''):(k?k.material:''),finishing:e.kelompok?(e.finishing||''):(k?k.finishing:'')}};

T.mesin=()=>{const p=mesinPilih();const ops=[...new Set(p.daftar.flatMap(m=>m.operator||[]))];
 return `<div class="tb-group"><div class="tb-lbl">Work center</div><select class="sel" data-act="mesinwc" id="f-mesin">${wcInternal().map(x=>`<option ${x.nama===p.wc?'selected':''}>${esc(x.nama)}</option>`).join('')}</select></div>`+
  (p.daftar.length?`<div class="tb-group"><div class="tb-lbl">Mesin</div><select class="sel" data-act="mesinmsn" id="f-mesin-msn">${p.daftar.map(m=>`<option ${m.nama===p.mesin?'selected':''}>${esc(m.nama)}</option>`).join('')}</select></div>`:'')+
  `<div class="tb-group"><div class="tb-lbl">Operator</div><input class="inp" id="f-op" list="dl-op" value="${esc(opNow(p.mesin))}" placeholder="Nama operator" style="width:170px" data-act="mesinop" autocomplete="off"><datalist id="dl-op">${ops.map(o=>`<option value="${esc(o)}">`).join('')}</datalist></div>`};

/* Antrian sebuah work center: item yang langkahnya (atau langkah dengan mesin alternatif di sini) sudah siap dikerjakan, urut due date */
function antrianMesin(wc){
 const P=PXL();
 return wcAktifItems().map(it=>{const i=P.indeksLangkah(it.rute,it.alt,wc);if(i<0)return null;const a=P.antrianPerLangkah(it.rute,it.kum,it.qty)[i];return a&&a.antri>0?{it,a,langkah:it.rute[i],alt:it.rute[i]!==wc}:null}).filter(Boolean)
  .sort((x,y)=>(x.it.due||'9999').localeCompare(y.it.due||'9999')||String(x.it.spk).localeCompare(String(y.it.spk)));
}
/* Item yang rutenya melewati work center ini tetapi belum (seluruhnya) sampai: langsung terlihat sejak SPK terbit, lengkap dengan posisinya sekarang */
function akanDatangMesin(wc){
 const P=PXL();if(!P)return [];
 return wcAktifItems().map(it=>{const i=P.indeksLangkah(it.rute,it.alt,wc);if(i<0)return null;
  const masuk=i===0?it.qty:it.kum[it.rute[i-1]];const belum=Math.max(0,it.qty-masuk);if(belum<=0)return null;
  const prev=it.rute[i-1];const posisi=P.antrianPerLangkah(it.rute,it.kum,it.qty).filter((s,k)=>k<i&&s.antri>0&&!P.langkahVendor(s.wc));
  return {it,belum,masuk,total:it.qty,prev,posisi:posisi.map(s=>s.wc+' '+s.antri).join(', ')}}).filter(Boolean)
  .sort((x,y)=>(x.it.due||'9999').localeCompare(y.it.due||'9999')||String(x.it.spk).localeCompare(String(y.it.spk)));
}
function akanDatangHtml(wc){
 const r=akanDatangMesin(wc);if(!r.length)return '';
 return `<section class="panel po-akan"><div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:0 0 6px 0">Akan datang ke ${esc(wc)} (${r.length} item, belum sampai)</div><div class="tbl-wrap"><table id="mesin-akan"><thead><tr><th>SPK</th><th>Item</th><th class="num">Total</th><th class="num">Sudah sampai</th><th class="num">Belum sampai</th><th>Posisi sekarang</th><th>Due</th></tr></thead><tbody>${r.map(x=>`<tr data-spk="${esc(String(x.it.spk))}"><td><b>${esc(String(x.it.spk))}</b><div class="note">${esc(x.it.customer||'')}</div></td><td>${esc(x.it.item)}</td><td class="num">${n(x.total)}</td><td class="num">${n(x.masuk)}</td><td class="num"><b>${n(x.belum)}</b></td><td>${x.posisi?esc(x.posisi):'<span class="muted">menunggu '+esc(x.prev||'mulai')+'</span>'}</td><td>${x.it.due?fd(x.it.due):'–'}</td></tr>`).join('')}</tbody></table></div><div class="note" style="margin-top:6px">Item masuk ke antrian di atas begitu langkah sebelumnya mencatat hasil.</div></div></section>`;
}
const mesinKey=it=>it.spkId+'|'+it.idx;
function mesinCtx(k){const [sid,ix]=String(k).split('|');const s=byId('spk',sid);const it=s&&(s.items||[])[+ix];if(!it)return null;const st=itemState(s,it,+ix);return st?{s,it,ix:+ix,st}:null}
function siapDiMesin(c,wc){const P=PXL();const i=P.indeksLangkah(c.st.rute,c.st.alt,wc);return i<0?0:P.antrianPerLangkah(c.st.rute,c.st.kum,c.st.qty)[i].antri}

const sesiKey=e=>e.spk_id+'|'+e.item_idx;
const evData=()=>PXL()?PXL().tanpaVoid(S.produksi_log||[]):(S.produksi_log||[]);
const idEv=e=>String(e._id!=null?e._id:e.id);
/* Sesi terbuka di seluruh mesin untuk sebuah item, per indeks langkah: target tiap sesi dianggap "dipesan" agar mesin lain tidak mengerjakan batang yang sama */
function reservasi(c){
 const P=PXL();const out={};
 P.sesiAktifSemua(S.produksi_log||[]).filter(e=>e.spk_id===c.s._id&&+e.item_idx===c.ix).forEach(e=>{const i=P.indeksLangkah(c.st.rute,c.st.alt,e.wc);if(i<0)return;(out[i]=out[i]||[]).push({mesin:e.mesin||e.wc,operator:e.operator||'',target:+e.target||0})});
 return out;
}
const dipesan=(c,i,kecuali)=>((reservasi(c)[i])||[]).filter(r=>r.mesin!==kecuali).reduce((a,r)=>a+r.target,0);
const teksReservasi=c=>Object.values(reservasi(c)).flat().map(r=>`${esc(r.mesin)}${r.operator?' ('+esc(r.operator)+')':''} ${r.target?'target '+n(r.target):''}`.trim()).join(' · ');

/* Papan Produksi: satu kolom per langkah rute, kartu per item. Berjalan di atas, antri di bawah; ketuk judul kolom untuk membuka layar operator work center itu. */
function papanKolom(){
 const P=PXL();const intern=wcInternal().map(w=>w.nama);const vendor=[];
 wcAktifItems().forEach(it=>it.rute.forEach(w=>{if(P.langkahVendor(w)&&!vendor.includes(w))vendor.push(w)}));
 return [...intern,...vendor];
}
T.papan=()=>'';
B.papan=()=>{
 const P=PXL();if(!P)return empty('Papan belum siap','Muat ulang halaman.');
 const t=today();const kol=papanKolom();const ses=P.sesiAktifSemua(S.produksi_log||[]);
 const hasilHari=evHasil().filter(e=>(e.tgl||P.tanggalLokal(e.at))===t).reduce((a,e)=>a+(+e.qty||0),0);
 const data=kol.map(wc=>({wc,vendor:!!P.langkahVendor(wc),jalan:ses.filter(e=>e.wc===wc),antri:antrianMesin(wc)}));
 const telat=new Set();data.forEach(d=>d.antri.forEach(r=>{if(r.it.due&&r.it.due<t)telat.add(mesinKey(r.it))}));
 const kp=`<div class="kpi-row"><div class="kpi warn"><span class="lb">Sedang berjalan</span><span class="v">${ses.length}</span><span class="s">sesi di semua mesin</span></div><div class="kpi info"><span class="lb">Item antri</span><span class="v">${n(data.reduce((a,d)=>a+d.antri.length,0))}</span><span class="s">di semua langkah</span></div><div class="kpi ${telat.size?'crit':'ok'}"><span class="lb">Lewat due</span><span class="v">${telat.size}</span><span class="s">item masih antri</span></div><div class="kpi ok"><span class="lb">Selesai hari ini</span><span class="v">${n(hasilHari)}</span><span class="s">dicatat di semua mesin</span></div></div>`;
 const kartu=(r)=>{const it=r.it;const d=it.due;return `<div class="pk-card"><div class="pk-h"><b>SPK ${esc(String(it.spk))}</b>${d&&d<t?chip('Telat','crit'):''}</div><div class="pk-i">${esc(it.item)}</div><div class="note">${esc(it.customer||'')} · <b>${n(r.a.antri)}</b> ${esc(it.satuan||'')} ${r.langkah&&P.langkahVendor(r.langkah)?'siap kirim':'siap'}${d?' · due '+fd(d):''}</div></div>`};
 const kolom=data.map(d=>{const MAKS=8;const j=d.jalan.map(e=>{const c=mesinCtx(sesiKey(e));return `<div class="pk-card run"><div class="pk-h"><b>SPK ${esc(String(e.spk_no||(c&&c.s.no)||''))}</b>${chip('Berjalan','warn')}</div><div class="pk-i">${esc(e.item_desc||'')}</div><div class="note">${esc(e.mesin||e.wc)}${e.operator?' · '+esc(e.operator):''} · sejak ${esc(P.jamLokal(e.mulai))}${+e.target?' · target '+n(+e.target):''}</div></div>`}).join('');
  const q=d.antri.slice(0,MAKS).map(kartu).join('');const lebih=d.antri.length-MAKS;
  return `<section class="pk-col${d.vendor?' vend':''}"><button class="pk-head" data-act="papanbuka" data-wc="${esc(d.wc)}" ${d.vendor?'disabled':''}><span>${esc(d.wc)}</span><span class="pk-n">${d.jalan.length?`<i class="warn">${d.jalan.length} jalan</i>`:''}<i>${d.antri.length} antri</i></span></button><div class="pk-body">${j}${q||(j?'':'<div class="note pk-kosong">Kosong</div>')}${lebih>0?`<div class="note">+${lebih} item lagi</div>`:''}</div></section>`}).join('');
 return kol.length?`${kp}<div class="pk-board">${kolom}</div><div class="note" style="margin-top:8px">Papan ini hanya untuk dilihat. Operator mencatat di Antrian Mesin; ketuk nama work center untuk membukanya.</div>`:empty('Belum ada work center internal','Isi work center di Master Data.');
};
B.mesin=()=>{
 const P=PXL();if(!P)return empty('Mesin produksi belum siap','Muat ulang halaman.');
 const p=mesinPilih();const t=today();const kap=(mesinWC(p.wc).find(m=>m.nama===p.mesin)||{}).kapasitas||kapWC()[p.wc]||0;
 const sesAll=P.sesiAktif(S.produksi_log||[],p.mesin);
 const rows=antrianMesin(p.wc);
 const hari=evHasil().filter(e=>(e.mesin||e.wc)===p.mesin&&(e.tgl||P.tanggalLokal(e.at))===t).map(evLengkap);
 const qtyHari=hari.reduce((a,e)=>a+(+e.qty||0),0),tonHari=hari.reduce((a,e)=>a+(+e.tonase||0),0),menHari=hari.reduce((a,e)=>a+(+e.menit||0),0);
 const antri=rows.reduce((a,r)=>a+r.a.antri,0);
 /* Papan mesin dan kapasitas aktual (dari catatan Mulai, Selesai, Catat; tanpa input tambahan) */
 const sekarang=new Date().toISOString(),SHIFT=480,evAll=evData(),sesSemua=P.sesiAktifSemua(S.produksi_log||[]);
 const kapDari=nm=>{const m=mesinWC(p.wc).find(x=>x.nama===nm);return +(m&&m.kapasitas)||(mesinWC(p.wc).length?0:(kapWC()[p.wc]||0))};
 const kin=(nm,kp)=>P.kinerjaMesinHari({kejadian:evAll,sesi:sesSemua,mesin:nm,tgl:t,sekarang,shiftMenit:SHIFT,kapasitasHari:kp});
 const daftarM=p.daftar.length?p.daftar:[{nama:p.wc,kapasitas:kap}];
 const pctF=v=>v==null?'–':Math.round(v*100)+'%';
 const kinPilih=kin(p.mesin,kap);
 const tiles=daftarM.map(m=>{const kp=+m.kapasitas||(p.daftar.length?0:kap);const k=kin(m.nama,kp);const sj=sesSemua.filter(e=>(e.mesin||e.wc)===m.nama);const jb=sj[0];
  const kerja=jb?`SPK ${esc(String(jb.spk_no||''))} · ${esc(jb.item_desc||'')}`:'Kosong, siap dipakai';
  return `<button type="button" class="pm-tile${m.nama===p.mesin?' on':''}${jb?' run':''}" data-act="pmpilih" data-m="${esc(m.nama)}"><span class="pm-top"><i class="pm-dot"></i><b>${esc(m.nama)}</b><em>${jb?'Berjalan':'Kosong'}</em></span><span class="pm-job">${kerja}</span><span class="pm-num"><b>${n(k.qty)}</b>${kp?`<small>/ ${n(kp)} pcs</small>`:'<small>pcs hari ini</small>'}</span><span class="pm-g"><i style="width:${kp?Math.min(100,Math.round(k.qty/kp*100)):0}%"></i></span><span class="pm-sub">${k.lajuPerJam!=null?n(k.lajuPerJam)+' pcs/jam':'laju belum ada'} · pakai ${pctF(k.utilisasi)}</span></button>`}).join('');
 const jamAda=Object.keys(kinPilih.perJam).map(Number);const j0=Math.min(7,...(jamAda.length?jamAda:[7])),j1=Math.max(16,...(jamAda.length?jamAda:[16]));
 const jamMaks=Math.max(1,...Object.values(kinPilih.perJam));
 const jamBar=Array.from({length:j1-j0+1},(_,i)=>j0+i).map(j=>{const v=kinPilih.perJam[j]||0;return `<span class="pm-c${v?'':' nol'}" title="Jam ${String(j).padStart(2,'0')}: ${n(v)} pcs"><i style="height:${Math.round(v/jamMaks*100)}%"></i><em>${String(j).padStart(2,'0')}</em>${v?`<b>${n(v)}</b>`:''}</span>`}).join('');
 const tr=P.trenMesin({kejadian:evAll,mesin:p.mesin,sampai:t,hari:7});const trMaks=Math.max(1,...tr.map(x=>x.qty));
 const HRN=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
 const trBar=tr.map(x=>`<span class="pm-c${x.qty?'':' nol'}${x.tgl===t?' now':''}" title="${fdp2(x.tgl)}: ${n(x.qty)} pcs${x.laju!=null?' · '+n(x.laju)+' pcs/jam':''}"><i style="height:${Math.round(x.qty/trMaks*100)}%"></i><em>${HRN[new Date(x.tgl+'T00:00:00Z').getUTCDay()]}</em>${x.qty?`<b>${n(x.qty)}</b>`:''}</span>`).join('');
 const lv=kinPilih.lajuVsTarget,pv=kinPilih.proyeksiVsTarget;
 const stat=(lb,v,unit,sub,tone,g)=>`<div class="pm-st ${tone||''}"><span class="lb">${lb}</span><b>${v}${unit?`<small>${unit}</small>`:''}</b><span class="s">${sub}</span>${g!=null?`<div class="pm-g"><i style="width:${Math.max(0,Math.min(100,Math.round(g*100)))}%"></i></div>`:''}</div>`;
 const toneV=v=>v==null?'':v>=1?'ok':v>=.8?'warn':'crit';
 const strip=`<section class="pm-tiles" id="pm-tiles">${tiles}</section>
 <section class="panel pm-kin" id="pm-kin"><header><h2>Kapasitas aktual · ${esc(p.mesin)}</h2><span class="hint">dihitung dari catatan Mulai, Selesai, dan Catat · ${kinPilih.berjalan?'sesi berjalan ikut dihitung':'belum ada sesi berjalan'}</span></header>
  <div class="pm-stats">${stat('Output hari ini',n(kinPilih.qty),'pcs',kap?`${pctF(kinPilih.capaian)} dari kapasitas ${n(kap)}`+(kinPilih.reject?` · reject ${n(kinPilih.reject)}`:'')+(tonHari?` · ${n(Math.round(tonHari))} kg`:''):'kapasitas belum diatur di Master Data',kinPilih.capaian>=1?'ok':'',kinPilih.capaian)}
   ${stat('Laju aktual',kinPilih.lajuPerJam==null?'–':n(kinPilih.lajuPerJam),'pcs/jam',kinPilih.targetLaju?`target ${n(kinPilih.targetLaju)} pcs/jam`+(lv!=null?` · ${pctF(lv)} dari target`:''):(kinPilih.lajuPerJam==null?'belum ada catatan berdurasi':'target laju butuh kapasitas'),toneV(lv),lv==null?null:Math.min(1,lv))}
   ${stat('Mesin dipakai',pctF(kinPilih.utilisasi),'',`${fDur(kinPilih.aktifMenit)} dari ${SHIFT/60} jam kerja`,'',kinPilih.utilisasi)}
   ${stat('Proyeksi akhir shift',kinPilih.proyeksi==null?'–':n(kinPilih.proyeksi),'pcs',kinPilih.proyeksi==null?'butuh laju dari catatan berdurasi':(kap?`${pctF(pv)} dari kapasitas, bila terus berjalan`:'bila terus berjalan sampai 8 jam'),toneV(pv),pv==null?null:Math.min(1,pv))}</div>
  <div class="pm-charts"><div class="pm-ch"><h4>Output per jam hari ini</h4><div class="pm-bars">${jamBar}</div></div><div class="pm-ch"><h4>7 hari terakhir</h4><div class="pm-bars">${trBar}</div></div></div></section>`;
 /* sesi yang sedang berjalan di mesin ini (boleh lebih dari satu) */
 const sesiHtml=sesAll.map(ses=>{const key=sesiKey(ses);const c=mesinCtx(key);const sedia=c?siapDiMesin(c,p.wc):0;const mn=P.menitAntara(ses.mulai,new Date().toISOString());
  const kand=Math.max(0,Math.min(+ses.target>0?+ses.target:sedia,sedia));
  return `<section class="panel mesin-run" data-k="${esc(key)}" data-kand="${kand}"><div class="pbody">
   <div class="mr-top">${chip('Sedang dikerjakan','warn')}<b class="mr-time" data-elapsed="${esc(ses.mulai)}">${fDur(mn)}</b></div>
   <div class="mr-item">${esc(ses.item_desc||'')}</div>
   <div class="mr-meta"><b>SPK ${esc(String(ses.spk_no||(c&&c.s.no)||''))}</b> · ${esc(ses.customer||(c&&c.s.customer)||'')}</div>
   <div class="note">Mulai ${esc(P.jamLokal(ses.mulai))} · siap ${n(sedia)} ${esc((c&&c.it.u)||'')}${+ses.target?` · target ${n(+ses.target)}`:''} · ${esc(ses.operator||'–')}</div>
   <div class="mr-lbl">Berapa yang selesai?</div>
   <div class="mr-step"><button class="btn mr-b" data-act="mrstep" data-k="${esc(key)}" data-d="-1" aria-label="Kurangi satu">−</button><input class="inp num mr-q" data-mrq type="number" min="0" step="any" max="${sedia}" placeholder="${kand}" inputmode="decimal"><button class="btn mr-b" data-act="mrstep" data-k="${esc(key)}" data-d="1" aria-label="Tambah satu">+</button></div>
   <div class="mr-quick"><button class="btn" data-act="mrstep" data-k="${esc(key)}" data-d="5">+5</button><button class="btn" data-act="mrstep" data-k="${esc(key)}" data-d="10">+10</button><button class="btn" data-act="mesinsemua" data-k="${esc(key)}" data-max="${sedia}">Semua (${n(sedia)})</button></div>
   <label class="mr-rej"><span>Reject, bila ada</span><input class="inp num" data-mrr type="number" min="0" step="any" placeholder="0" inputmode="decimal"></label>
   <button class="btn primary mr-go" data-act="mesinselesai" data-k="${esc(key)}"><span data-lbl>Selesai · semua ${n(kand)}</span></button>
   <div class="mr-sec"><button class="btn" data-act="mesinsebagian" data-k="${esc(key)}" title="Simpan jumlah ini dan lanjut mengerjakan sisanya">Simpan sebagian, lanjut</button><button class="btn ghost danger" data-act="mesinbatal" data-k="${esc(key)}">Batalkan mulai</button></div></div></section>`}).join('');
 const chips=(it,langkah)=>it.rute.map(w=>`<span class="rchip${w===langkah?' on':''}">${esc(w)}</span>`).join('<span class="rarr">›</span>');
 const fdp=d=>String(fd(d)).replace(/&nbsp;/g,' ');
 const dueChip=d=>!d?'':d<t?chip('Telat · '+fdp(d),'crit'):d===t?chip('Due hari ini','warn'):chip('Due '+fdp(d),'plain');
 const kartu=rows.map(({it,a,langkah,alt})=>{const k=mesinKey(it);const jalan=sesAll.some(e=>sesiKey(e)===k);const c=mesinCtx(k);
  const ii=P.indeksLangkah(c.st.rute,c.st.alt,p.wc);const lain=dipesan(c,ii,p.mesin);const bebas=Math.max(0,a.antri-lain);const lainTeks=((reservasi(c)[ii])||[]).filter(r=>r.mesin!==p.mesin);
  const blok=!jalan&&bebas<=0;const pct=it.qty>0?Math.min(100,Math.round(a.selesai/it.qty*100)):0;
  return `<div class="mcard${jalan?' jalan':''}" data-k="${esc(k)}"><div class="mc-h"><span class="mc-spk"><b>SPK ${esc(String(it.spk))}</b><span class="mc-cust">${esc(it.customer||'')}</span></span>${dueChip(it.due)}${platChip(it.spkId)}</div>
   <div class="mc-item">${esc(it.item)}</div>
   <div class="mc-rute">${chips(it,langkah)}</div>
   <div class="mc-siap"><span class="mq-siap">${n(a.antri)}</span><span class="mc-u">siap dikerjakan${lain>0?' · bebas '+n(bebas):''}</span></div>
   <div class="jb"><i style="width:${pct}%"></i></div><div class="note">${n(a.selesai)} dari ${n(it.qty)} ${esc(it.satuan||'')} selesai di langkah ini${alt?' · <b>mesin alternatif</b> untuk '+esc(langkah):''}</div>
   ${lainTeks.length?`<div class="note mc-lain">Sedang dikerjakan di mesin lain: ${lainTeks.map(r=>`${esc(r.mesin)}${r.operator?' ('+esc(r.operator)+')':''} ${r.target?n(r.target):''}`).join(' · ')}</div>`:''}
   <div class="mc-act">${jalan?chip('Sedang berjalan','warn'):`<button class="btn primary mc-go" data-act="mesinmulai" data-k="${esc(k)}"${blok?' disabled title="Semua yang siap sedang dikerjakan di mesin lain"':''}>Mulai</button>`}<button class="btn mc-cat" data-act="mesincatat" data-k="${esc(k)}">Catat</button></div></div>`}).join('');
 const antrian=rows.length?`<div id="mesin-antri" class="mq-grid">${kartu}</div>`
  :empty('Tidak ada antrian di '+esc(p.wc),'Item muncul di sini begitu langkah sebelumnya selesai atau SPK terbit. Pastikan judul section SPK memuat produk (mis. CABLE TRAY TYPE STU) agar rute dikenali.');
 /* catatan terakhir di mesin ini, lengkap dengan customer, bisa dibatalkan bila salah input */
 const terakhir=hari.slice().sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,8);
 const riwayat=terakhir.length?`<section class="panel po-riw"><div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:0 0 6px 0">Catatan terakhir di ${esc(p.mesin)} hari ini</div><div class="tbl-wrap"><table id="mesin-riwayat"><thead><tr><th>Jam</th><th>SPK dan customer</th><th>Item</th><th class="num">Selesai</th><th class="num">Reject</th><th>Operator</th><th></th></tr></thead><tbody>${terakhir.map(e=>`<tr><td class="mono">${esc(e.selesai?P.jamLokal(e.selesai):'')}</td><td><b>${esc(String(e.spk_no||''))}</b><div class="note">${esc(e.customer||'')}</div></td><td>${esc(e.item_desc||'')}</td><td class="num rq">${n(+e.qty||0)}</td><td class="num">${+e.reject?n(+e.reject):''}</td><td>${esc(e.operator||'')}</td><td class="act"><button class="btn sm ghost danger" data-act="mesinvoid" data-id="${esc(idEv(e))}">Batalkan</button></td></tr>`).join('')}</tbody></table></div><div class="note" style="margin-top:6px">Salah input? Batalkan catatan lalu catat ulang. Catatan yang dibatalkan tetap tersimpan sebagai riwayat dan tidak dihitung.</div></div></section>`:'';
 const kiri=sesAll.length?`<div class="po-run">${sesiHtml}</div>`:'';
 const idle=sesAll.length?'':`<div class="po-idle"><b>${esc(p.mesin)}</b> sedang kosong. Pilih item di bawah lalu tekan <b>Mulai</b>. Kalau pekerjaannya sudah selesai, tekan <b>Catat</b>.</div>`;
 return `<div class="po">${strip}${idle}<div class="po-main${sesAll.length?' has-run':''}">${kiri}<div class="po-q"><div class="po-qh"><h3>Antrian di ${esc(p.wc)}</h3><span class="muted">${rows.length} item · ${n(antri)} siap dikerjakan</span></div>${antrian}</div></div>${akanDatangHtml(p.wc)}${riwayat}<details class="panel mq-help"><summary>Cara pakai</summary><div class="pbody note">Tekan <b>Mulai</b> saat mengerjakan item. Isi jumlah yang selesai dengan tombol + dan −, lalu <b>Selesai</b>; tombol Selesai menyebut jumlah yang akan disimpan, dan kalau jumlah dikosongkan yang disimpan adalah semua yang siap. Tanggal dan jam terisi otomatis. Kalau baru sebagian yang jadi, pakai <b>Simpan sebagian, lanjut</b>. Lupa menekan Mulai: pakai <b>Catat</b> (waktu bisa diatur bila perlu). Satu mesin boleh mengerjakan beberapa item, dan satu item boleh dikerjakan beberapa mesin; batang yang sedang dikerjakan mesin lain tidak ditawarkan lagi. Reject tidak lanjut ke mesin berikutnya dan muncul lagi di antrian awal. Urut menurut due date terdekat.</div></details></div>`;
};

const klasProduk=c=>{const k=PXL().klasifikasi(c.it.g,c.it.d,c.s.material);return {kelompok:k.kelompok,tipe:k.tipe,material:k.material,finishing:k.finishing}};
const dasarKejadian=(c,p,opO)=>{const op=opO||($('#f-op')&&$('#f-op').value.trim())||opNow(p.mesin);lsSet(opKey(p.mesin),op);
 return {spk_id:c.s._id,item_idx:c.ix,item_desc:c.it.d,spk_no:String(c.s.no),customer:c.s.customer||'',tebal:thkOf(c.it.g)||'',...klasProduk(c),wc:p.wc,mesin:p.mesin,operator:op,oleh:ME||null}};
async function mesinMulai(k){
 const P=PXL();const c=mesinCtx(k);if(!c)return;const p=mesinPilih();
 if(P.sesiAktif(S.produksi_log||[],p.mesin).some(e=>sesiKey(e)===k)){toast('Item ini sudah berjalan di mesin ini.');return}
 const i=P.indeksLangkah(c.st.rute,c.st.alt,p.wc);const antri=siapDiMesin(c,p.wc);
 if(antri<=0){toast('Belum ada yang siap dikerjakan di '+p.wc);return}
 const bebas=antri-dipesan(c,i,p.mesin);
 if(bebas<=0){toast(`Semua yang siap (${n(antri)}) sedang dikerjakan di mesin lain. Tunggu hasilnya, atau pakai Catat.`);return}
 try{await addDoc('produksi_log',{...dasarKejadian(c,p),jenis:'mulai',qty:0,reject:0,target:bebas,tgl:today(),mulai:new Date().toISOString()});lsSet('mni-wc',p.wc);lsSet('mni-mesin',F.mesin.mesin);toast(`Mulai: SPK ${c.s.no} di ${p.mesin} · target ${n(bebas)}`)}catch(e){toast(e.message||'Gagal menyimpan')}
}
/* Simpan satu hasil (dari timer atau catat manual) setelah divalidasi terhadap yang siap di langkah itu */
async function mesinHasil(c,p,{qty,reject,mulai,selesai,operator}){
 const chk=PXL().periksaMasukan(c.st.rute,c.st.kum,c.st.qty,p.wc,qty,reject,c.st.alt);if(!chk.ok)throw new Error(chk.alasan);
 const menit=mulai?PXL().menitAntara(mulai,selesai):null;if(mulai&&menit==null)throw new Error('Jam selesai tidak boleh sebelum jam mulai.');
 const mirip=evHasil().find(e=>e.spk_id===c.s._id&&+e.item_idx===c.ix&&e.wc===p.wc&&(e.mesin||e.wc)===p.mesin&&+e.qty===qty&&(+e.reject||0)===reject&&Date.now()-new Date(e.at).getTime()<15*60000);
 if(mirip&&!confirm(`Catatan yang sama (${n(qty)}) sudah masuk jam ${PXL().jamLokal(mirip.at)}. Simpan lagi sebagai catatan baru?`))throw new Error('Dibatalkan: kemungkinan catatan dobel.');
 const berat=+c.it.w>0?+c.it.w:null;
 await addDoc('produksi_log',{...dasarKejadian(c,p,operator),jenis:'hasil',qty,reject,tgl:PXL().tanggalLokal(selesai),mulai,selesai,menit,berat,tonase:berat?Math.round(qty*berat*100)/100:null});
 lsSet('mni-wc',p.wc);lsSet('mni-mesin',F.mesin.mesin);
 const i=PXL().indeksLangkah(c.st.rute,c.st.alt,p.wc);const next=c.st.rute[i+1];
 toast(`${p.mesin}: ${n(qty)} ${c.it.u||''} selesai${reject?' · '+n(reject)+' reject, perlu dibuat ulang':''}${qty>0?(next?' · lanjut ke '+next:' · selesai produksi'):''} · ${fDur(menit)}`);
}
const sesiDari=k=>{const p=mesinPilih();return PXL().sesiAktif(S.produksi_log||[],p.mesin).find(e=>sesiKey(e)===k)};
async function mesinSelesai(k,lanjut){
 const p=mesinPilih();const ses=sesiDari(k);if(!ses)return;const c=mesinCtx(k);if(!c)return;
 const card=document.querySelector(`.mesin-run[data-k="${CSS.escape(k)}"]`);if(!card)return;
 let qty=num0(card.querySelector('[data-mrq]').value);const reject=num0(card.querySelector('[data-mrr]').value);
 if(lanjut&&qty<=0){toast('Isi dulu jumlah yang sudah selesai, lalu Simpan sebagian.');return}
 if(qty<=0&&reject<=0)qty=+card.dataset.kand||0;
 try{const now=new Date().toISOString();const siapSebelum=siapDiMesin(c,p.wc);const sisaTarget=Math.max(0,((+ses.target||0)>0?+ses.target:siapSebelum)-qty-reject);
  await mesinHasil(c,p,{qty,reject,mulai:ses.mulai,selesai:now,operator:ses.operator});
  if(lanjut&&sisaTarget>0)await addDoc('produksi_log',{...dasarKejadian(c,p,ses.operator),jenis:'mulai',qty:0,reject:0,target:sisaTarget,tgl:today(),mulai:now});
 }catch(e){toast(e.message||'Gagal menyimpan')}
}
async function mesinBatal(k){
 const p=mesinPilih();const ses=sesiDari(k);if(!ses)return;const c=mesinCtx(k);if(!c)return;
 try{await addDoc('produksi_log',{...dasarKejadian(c,p,ses.operator),jenis:'batal',qty:0,reject:0,tgl:today()});toast('Mulai dibatalkan')}catch(e){toast(e.message||'Gagal menyimpan')}
}
/* Batalkan satu catatan hasil (salah input). Ditolak bila hasil itu sudah dipakai langkah berikutnya atau sudah dikirim ke vendor. */
async function mesinVoid(id){
 const P=PXL();const e=(S.produksi_log||[]).find(x=>idEv(x)===String(id));if(!e)return;
 const c=mesinCtx(e.spk_id+'|'+e.item_idx);if(!c)return;
 const sisa=evData().filter(x=>(x.jenis||'hasil')==='hasil'&&x.spk_id===e.spk_id&&+x.item_idx===+e.item_idx&&idEv(x)!==String(id));
 const kum=P.kumulatif(c.st.rute,sisa.map(x=>({wc:x.wc,qty:+x.qty||0,reject:+x.reject||0})),c.st.alt);
 const intern=c.st.rute.filter(w=>!P.langkahVendor(w));
 for(let i=1;i<intern.length;i++)if(kum[intern[i]]>kum[intern[i-1]]){toast(`Tidak bisa dibatalkan: ${intern[i]} sudah mencatat hasil dari batch ini. Batalkan catatan di ${intern[i]} dulu.`);return}
 const vs=c.st.rute.find(P.langkahVendor);
 if(vs&&(c.st.vendorKirim[vs]||0)>kum[intern[intern.length-1]]){toast('Tidak bisa dibatalkan: batang dari catatan ini sudah dikirim ke vendor.');return}
 if(!confirm(`Batalkan catatan ini?\n${e.item_desc} · ${n(+e.qty||0)} selesai${+e.reject?' · '+n(+e.reject)+' reject':''} di ${e.mesin||e.wc}`))return;
 try{await addDoc('produksi_log',{jenis:'void',ref:idEv(e),spk_id:e.spk_id,item_idx:e.item_idx,item_desc:e.item_desc,spk_no:e.spk_no||String(c.s.no),customer:e.customer||'',wc:e.wc,mesin:e.mesin||'',operator:e.operator||'',qty:0,reject:0,tgl:today(),ket:'Dibatalkan',oleh:ME||null});toast('Catatan dibatalkan')}catch(er){toast(er.message||'Gagal menyimpan')}
}
function mesinCatatForm(k){
 const c=mesinCtx(k);if(!c)return;const p=mesinPilih();const sedia=siapDiMesin(c,p.wc);
 openModal(`Catat hasil · SPK ${esc(String(c.s.no))}`,`<div class="full note"><b>${esc(c.s.customer||'')}</b> · ${esc(c.it.d)} · siap ${n(sedia)} ${esc(c.it.u||'')} di ${esc(p.mesin)}</div>`+
  fld('Selesai',inp('qty','','number','min="0" step="any" inputmode="decimal" placeholder="0" autofocus'))+fld('Reject',inp('reject','','number','min="0" step="any" inputmode="decimal" placeholder="0"'))+
  (p.daftar.length?fld('Mesin',`<select class="sel" name="mesin">${p.daftar.map(m=>`<option ${m.nama===p.mesin?'selected':''}>${esc(m.nama)}</option>`).join('')}</select>`):'')+fld('Operator',inp('operator',opNow(p.mesin),'text','placeholder="Nama operator" autocomplete="off"'))+
  `<label class="ck full"><input type="checkbox" name="semua"> Isi semua yang siap (${n(sedia)})</label>`+
  `<details class="full wkt" id="m-waktu"><summary>Waktu: hari ini, selesai jam ${nowTime()} (ketuk untuk mengubah)</summary><div class="wkt-g">`+fld('Tanggal',inp('tgl',today(),'date'))+fld('Jam mulai (boleh kosong)',inp('mulai','','time'))+fld('Jam selesai',inp('selesai',nowTime(),'time'))+`</div><div class="note">Tanpa jam mulai, lama pengerjaan tidak dihitung untuk catatan ini.</div></details>`,
  async d=>{const tgl=d.tgl||today();const selesai=PXL().gabungWaktu(tgl,d.selesai||nowTime());const mulai=d.mulai?PXL().gabungWaktu(tgl,d.mulai):null;
   if(!selesai)throw new Error('Tanggal atau jam selesai tidak valid.');
   const qty=d.semua?sedia:num0(d.qty);
   await mesinHasil(c,{...p,mesin:d.mesin||p.mesin},{qty,reject:d.semua?0:num0(d.reject),mulai,selesai,operator:String(d.operator||'').trim()})},{submit:'Simpan hasil',done:' '});
}
/* Tombol Selesai menyebut apa yang akan disimpan: jumlah yang diisi, atau semua yang siap bila dikosongkan */
function mrLabel(card){if(!card)return;const q=num0(card.querySelector('[data-mrq]').value),r=num0(card.querySelector('[data-mrr]').value),kand=+card.dataset.kand||0;const l=card.querySelector('[data-lbl]');
 if(l)l.textContent=q>0?`Selesai · simpan ${n(q)}`:r>0?`Selesai · hanya reject ${n(r)}`:`Selesai · semua ${n(kand)}`}
document.addEventListener('input',e=>{const el=e.target;if(el.matches&&el.matches('[data-mrq],[data-mrr]'))mrLabel(el.closest('.mesin-run'))});
setInterval(()=>{document.querySelectorAll('[data-elapsed]').forEach(el=>{const m=PXL()&&PXL().menitAntara(el.dataset.elapsed,new Date().toISOString());if(m!=null)el.textContent=fDur(m)})},30000);

/* ---- Laporan Produksi: pengganti form laporan harian per work center (kolom sama dengan Excel) ---- */
F['laporan-produksi']=F['laporan-produksi']||{tgl:'',wc:'',mesin:''};
const lapMesinOpsi=wc=>wc?mesinWC(wc).map(m=>m.nama):S.mwc.flatMap(w=>Array.isArray(w.mesin)?w.mesin.map(m=>m.nama):[]);
T['laporan-produksi']=()=>{const f=F['laporan-produksi'];if(!f.tgl)f.tgl=today();const opsi=lapMesinOpsi(f.wc);
 return `<div class="tb-group"><div class="tb-lbl">Tanggal</div><input class="inp" type="date" id="f-lap-tgl" data-act="lapf" data-key="tgl" value="${esc(f.tgl)}"></div>
  <div class="tb-group"><div class="tb-lbl">Work center</div><select class="sel" id="f-lap-wc" data-act="lapf" data-key="wc"><option value="">Semua</option>${wcInternal().map(w=>`<option ${f.wc===w.nama?'selected':''}>${esc(w.nama)}</option>`).join('')}</select></div>
  ${opsi.length?`<div class="tb-group"><div class="tb-lbl">Mesin</div><select class="sel" id="f-lap-mesin" data-act="lapf" data-key="mesin"><option value="">Semua</option>${opsi.map(m=>`<option ${f.mesin===m?'selected':''}>${esc(m)}</option>`).join('')}</select></div>`:''}
  <div class="tb-group"><button class="btn sm" data-act="lapcsv">${ic('dl')} Unduh CSV</button> <button class="btn sm" data-act="lapprint">${ic('file')} Cetak</button></div>`};
function lapData(){
 const P=PXL();const f=F['laporan-produksi'];const tgl=f.tgl||today();const evs=lapEv();
 const baris=P.barisLaporan(evs,{tgl,wc:f.wc,mesin:f.mesin});
 return {P,f,tgl,evs,baris,tot:P.totalLaporan(baris),operator:[...new Set(baris.map(b=>b.operator).filter(Boolean))].join(', ')};
}
const lapTabel=(L)=>`<table id="lap-tabel"><thead><tr><th>No</th><th>Mulai</th><th>Selesai</th><th class="num">Durasi (mnt)</th><th>No SPK</th><th>Customer</th><th>Deskripsi</th><th>Tebal</th><th class="num">Qty (Pcs)</th><th class="num">Reject</th><th class="num">Berat/pcs (kg)</th><th class="num">Tonase (kg)</th><th class="num">Menit/pcs</th><th>Mesin</th><th>Operator</th><th></th></tr></thead><tbody>${
 L.baris.length?L.baris.map(b=>`<tr><td>${b.no}</td><td>${esc(b.mulai)}</td><td>${esc(b.selesai)}</td><td class="num">${b.menit==null?'–':n(Math.round(b.menit))}</td><td><b>${esc(String(b.spk))}</b></td><td>${esc(b.customer)}</td><td>${esc(b.deskripsi)}</td><td>${esc(String(b.tebal||''))}</td><td class="num"><b>${n(b.qty)}</b></td><td class="num">${b.reject?n(b.reject):''}</td><td class="num">${b.beratPcs==null?'–':n(b.beratPcs)}</td><td class="num">${b.tonase==null?'–':n(b.tonase)}</td><td class="num">${b.menitPerPcs==null?'–':n(b.menitPerPcs)}</td><td>${esc(b.mesin)}</td><td>${esc(b.operator)}</td><td class="act no-print"><button class="btn sm ghost danger" data-act="mesinvoid" data-id="${esc(String(b.id))}">Batalkan</button></td></tr>`).join('')
 :'<tr><td colspan="16" class="muted" style="text-align:center;padding:20px">Belum ada hasil produksi pada tanggal dan mesin ini.</td></tr>'}</tbody><tfoot><tr><td colspan="3"><b>Total</b></td><td class="num"><b>${n(Math.round(L.tot.menit))}</b></td><td colspan="4"></td><td class="num"><b>${n(L.tot.qty)}</b></td><td class="num"><b>${n(L.tot.reject)}</b></td><td></td><td class="num"><b>${n(L.tot.tonase)}</b></td><td colspan="4"></td></tr></tfoot></table>`;
B['laporan-produksi']=()=>{
 const P=PXL();if(!P)return empty('Laporan belum siap','Muat ulang halaman.');
 const L=lapData();const awal=L.tgl.slice(0,8)+'01';
 const rek=P.rekapMesin(L.evs,awal,L.tgl);const jenis=P.waktuPerJenis(L.evs.filter(e=>(e.tgl||'')>=awal&&(e.tgl||'')<=L.tgl)).slice(0,10);
 const kepala=`<div class="lap-kepala"><div><span>Work center</span><b>${esc(L.f.wc||'Semua')}</b></div><div><span>Mesin</span><b>${esc(L.f.mesin||'Semua')}</b></div><div><span>Operator</span><b>${esc(L.operator||'–')}</b></div><div><span>Tanggal</span><b>${fd(L.tgl)}</b></div></div>`;
 return `<section class="panel"><div class="pbody"><div class="dw-section-title" style="margin:0 0 8px 0">Daily production report by work center</div>${kepala}<div class="tbl-wrap">${lapTabel(L)}</div></div></section>
 <section class="panel"><div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:0 0 6px 0">Rekap per mesin, ${fd(awal)} sampai ${fd(L.tgl)}</div>
  <div class="tbl-wrap"><table id="lap-rekap"><thead><tr><th>Work center</th><th>Mesin</th><th class="num">Hasil (pcs)</th><th class="num">Reject</th><th class="num">Tonase (kg)</th><th class="num">Jam mesin</th><th class="num">Menit/pcs</th><th class="num">Hari aktif</th></tr></thead><tbody>${rek.length?rek.map(r=>`<tr><td>${esc(r.wc)}</td><td><b>${esc(r.mesin)}</b></td><td class="num">${n(r.qty)}</td><td class="num">${r.reject?n(r.reject)+' ('+Math.round(r.reject_pct*1000)/10+'%)':'–'}</td><td class="num">${n(r.tonase)}</td><td class="num">${r.jam?n(r.jam):'–'}</td><td class="num">${r.menitPerPcs==null?'–':n(r.menitPerPcs)}</td><td class="num">${r.hariAktif}</td></tr>`).join(''):'<tr><td colspan="8" class="muted" style="text-align:center;padding:16px">Belum ada hasil pada bulan ini.</td></tr>'}</tbody></table></div></div></section>
 <section class="panel"><div class="pbody" style="padding:0 0 8px 0"><div class="dw-section-title" style="margin:0 0 6px 0">Waktu proses per pcs menurut jenis item (bulan ini)</div>
  <div class="tbl-wrap"><table id="lap-jenis"><thead><tr><th>Work center</th><th>Jenis item</th><th class="num">Catatan</th><th class="num">Total pcs</th><th class="num">Menit/pcs</th></tr></thead><tbody>${jenis.length?jenis.map(j=>`<tr><td>${esc(j.wc)}</td><td>${esc(j.jenis)}</td><td class="num">${j.n}</td><td class="num">${n(j.qty)}</td><td class="num"><b>${n(j.menitPerPcs)}</b></td></tr>`).join(''):'<tr><td colspan="5" class="muted" style="text-align:center;padding:16px">Belum ada hasil berwaktu. Gunakan tombol Mulai dan Selesai di Antrian Mesin.</td></tr>'}</tbody></table></div>
  <div class="note" style="margin-top:6px">Menit per pcs dari data nyata ini menjadi dasar standar waktu dan kapasitas mesin.</div></div></section>`;
};
async function lapCsv(){const L=lapData();const csv=L.P.csvLaporan(L.baris,{wc:L.f.wc,mesin:L.f.mesin,tgl:L.tgl});
 try{await DLS.save({filename:`Laporan-produksi-${L.tgl}${L.f.mesin?'-'+fnSafe(L.f.mesin):L.f.wc?'-'+fnSafe(L.f.wc):''}.csv`,data:new Blob([csv],{type:'text/csv'})})}catch(e){if(e.code!=='declined')toast('Gagal mengunduh: '+(e.message||e.code))}}
function lapPrint(){const L=lapData();const win=window.open('','_blank');if(!win){toast('Izinkan jendela baru untuk mencetak');return}
 win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Laporan produksi ${esc(L.tgl)}</title><style>body{font:12px Arial,sans-serif;margin:18px;color:#000}h2{margin:0 0 2px}table{border-collapse:collapse;width:100%;margin-top:10px}th,td{border:1px solid #000;padding:3px 5px;text-align:left}th{background:#eee}.num{text-align:right}.k{display:flex;gap:28px;margin:8px 0}.k span{display:block;font-size:10px;color:#444}</style></head><body><h2>PT. Mitra Nusa Internasional</h2><div>DAILY PRODUCTION REPORT BY WORK CENTER</div><div class="k"><div><span>Work center</span>${esc(L.f.wc||'Semua')}</div><div><span>Mesin</span>${esc(L.f.mesin||'Semua')}</div><div><span>Operator</span>${esc(L.operator||'–')}</div><div><span>Tanggal</span>${esc(fd(L.tgl))}</div></div>${lapTabel(L)}<script>window.onload=function(){window.print()}<\/script></body></html>`);win.document.close()}

/* ---- Jejak produksi per item SPK: dari mesin pertama, vendor, sampai terkirim ke customer ---- */
function jejakHtml(id){
 const s=byId('spk',id);const P=PXL();if(!s||!P)return '';const x=calc().spk[id];
 const evs=evData().filter(e=>e.spk_id===s._id&&(e.jenis||'hasil')==='hasil');
 const blok=(s.items||[]).map((it,ix)=>{
  const st=itemState(s,it,ix);const q=+it.q||0;const l=x.lines[ix]||{};
  if(produksiAdmin()){
   const pr=Math.min(q,l.prodEff||0);const pp=q?pr/q:0;const vN=itemRuteInfo(it).rute.find(P.langkahVendor);const vo=Math.min(q,l.vOut||0),vb=Math.min(q,l.vBack||0);
   const kir=Math.min(l.kirim||0,q);const pk=q?kir/q:0;
   const js=(nm,pc,qt,sub,ok,run)=>`<div class="jstep ${ok?'ok':run?'run':''}"><div class="jn">${esc(nm)}</div><div class="jb"><i style="width:${Math.round(pc*100)}%"></i></div><div class="jq">${qt}</div><div class="note">${sub}</div></div>`;
   const rowA=js('Produksi selesai',pp,n(pr)+' / '+n(q),'dilaporkan admin',pp>=1,pr>0)
    +(vN?'<span class="rarr">›</span>'+js(vN,q?vb/q:0,n(vb)+' / '+n(q),'dikirim '+n(vo)+' · kembali '+n(vb),q>0&&vb>=q,vo>0):'')
    +'<span class="rarr">›</span>'+js(s.stokReq?'Masuk gudang barang jadi':'Terkirim ke customer',pk,n(kir)+' / '+n(q),s.stokReq?'diterima di gudang barang jadi':'surat jalan customer',pk>=1,kir>0);
   return `<div class="jejak-item"><div class="jejak-h"><b>${esc(it.d)}</b> <span class="muted">${n(q)} ${esc(it.u||'')}</span></div><div class="jejak-row">${rowA}</div></div>`}
  if(!st)return `<div class="jejak-item"><div class="jejak-h"><b>${esc(it.d)}</b> <span class="muted">${n(q)} ${esc(it.u||'')}</span></div><div class="note">Rute belum dikenali. Pastikan judul section SPK memuat produk (mis. CABLE TRAY TYPE STU).</div></div>`;
  const evi=evs.filter(e=>+e.item_idx===ix);
  const langkah=st.rute.map((w,i)=>{const val=st.kum[w]||0;const pct=q?Math.min(1,val/q):0;const vend=P.langkahVendor(w);
   let sub='';
   if(vend)sub=`dikirim ${n(st.vendorKirim[w]||0)} · kembali ${n(val)}`;
   else{const per={};evi.filter(e=>P.indeksLangkah(st.rute,st.alt,e.wc)===i).forEach(e=>{const m=e.mesin||e.wc;per[m]=(per[m]||0)+(+e.qty||0)});sub=Object.entries(per).map(([m,v])=>`${esc(m)} ${n(v)}`).join(' · ');const rj=evi.filter(e=>P.indeksLangkah(st.rute,st.alt,e.wc)===i).reduce((a,e)=>a+(+e.reject||0),0);if(rj)sub+=(sub?' · ':'')+`reject ${n(rj)}`}
   return `<div class="jstep ${pct>=1?'ok':val>0?'run':''}"><div class="jn">${esc(w)}</div><div class="jb"><i style="width:${Math.round(pct*100)}%"></i></div><div class="jq">${n(val)} / ${n(q)}</div><div class="note">${sub||'belum ada'}</div></div>`}).join('<span class="rarr">›</span>');
  const kir=Math.min(l.kirim||0,q);const pk=q?kir/q:0;
  const akhir=`<span class="rarr">›</span><div class="jstep ${pk>=1?'ok':kir>0?'run':''}"><div class="jn">${s.stokReq?'Masuk gudang barang jadi':'Terkirim ke customer'}</div><div class="jb"><i style="width:${Math.round(pk*100)}%"></i></div><div class="jq">${n(kir)} / ${n(q)}</div><div class="note">${s.stokReq?'diterima di gudang barang jadi':'surat jalan customer'}</div></div>`;
  const ton=evi.reduce((a,e)=>a+(+e.tonase||0),0),mn=evi.reduce((a,e)=>a+(+e.menit||0),0);
  const rsv=teksReservasi({s,it,ix,st});
  const lama=(rsv?`<div class="note">Sedang dikerjakan: ${rsv}</div>`:'')+(!evi.length&&(+it.prod||0)>0?'<div class="note">Progres dari angka manual lama (belum ada catatan per mesin).</div>':'');
  return `<div class="jejak-item"><div class="jejak-h"><b>${esc(it.d)}</b> <span class="muted">${n(q)} ${esc(it.u||'')}</span>${ton||mn?` <span class="muted">· ${n(Math.round(ton))} kg · ${fDur(mn)} mesin</span>`:''}</div><div class="jejak-row">${langkah}${akhir}</div>${lama}</div>`}).join('');
 return `<div><div class="dw-section-title">Jejak tiap item sampai barang jadi</div>${blok||'<div class="note">SPK belum punya item.</div>'}</div>`;
}

function mesinTab(){const ok=canManage(),q=F['master-data'].q.toLowerCase(),all=mesinSemua(),t=today(),d90=addDays(t,-90);
 const rows=all.filter(m=>!q||(m.nama+m.kode+m.grup+m.lokasi+m.merk).toLowerCase().includes(q));
 const kp=`<div class="kpis" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr))"><div class="kpi ok"><div class="lb">Aktif</div><div class="v">${all.filter(m=>m.aktif).length}</div></div><div class="kpi${all.some(m=>!m.aktif)?' warn':''}"><div class="lb">Nonaktif</div><div class="v">${all.filter(m=>!m.aktif).length}</div></div><div class="kpi info"><div class="lb">Mesin produksi</div><div class="v">${all.filter(m=>m.src==='wc').length}</div></div><div class="kpi"><div class="lb">Utilitas &amp; pendukung</div><div class="v">${all.filter(m=>m.src==='lain').length}</div></div></div>`;
 const tr=rows.map(m=>{const u=S.mutasi.filter(x=>x.gudang==='sp'&&x.jenis==='keluar'&&!x.dikoreksi&&x.mesin===m.nama&&x.tgl>=d90),qty=u.reduce((a,x)=>a+Math.abs(+x.delta||0),0);
  return `<tr class="${m.aktif?'':'void'}"><td><b>${esc(m.nama)}</b>${m.kode?` <span class="mono muted">${esc(m.kode)}</span>`:''}${m.merk?`<div class="note">${esc(m.merk)}</div>`:''}</td><td>${esc(m.grup)}</td><td>${esc(m.lokasi||'–')}</td><td class="num">${u.length?`${n(u.length)}× · ${n(qty)} unit`:'–'}</td><td>${m.aktif?chip('Aktif','ok'):chip('Nonaktif','plain')}</td><td class="acts-r">${ok?`<button class="btn sm ghost" data-act="mesinedit" data-nm="${esc(m.nama)}">${ic('edit2')} Ubah</button>`:''}</td></tr>`}).join('');
 return kp+`<section class="panel"><div class="pbody note">Daftar mesin dan peralatan perusahaan. Mesin produksi mengikuti Work Centre (bisa ditambah dari sini atau dari Work Centre); peralatan pendukung (forklift, kompresor, genset, crane) didaftarkan di grup <b>${GRUP_LAIN}</b>. Daftar ini dipakai di <b>pengeluaran sparepart</b> (sparepart keluar ke mesin mana), Pemakaian mesin, dan Produksi. Mesin yang sudah punya riwayat tidak dihapus, cukup dinonaktifkan.</div>${rows.length?`<div class="tbl-wrap"><table><thead><tr><th>Mesin</th><th>Grup / Work Centre</th><th>Lokasi</th><th class="num">Sparepart 90 hari</th><th>Status</th><th></th></tr></thead><tbody>${tr}</tbody></table></div>`:empty('Belum ada mesin','Isi mesin lewat Work Centre atau tombol Tambah.')}</section>`}
function mesinForm(nm){const all=mesinSemua(),x=nm?all.find(m=>m.nama===nm):null;if(nm&&!x){toast('Mesin tidak ditemukan.');return}
 const pk=x?mesinPakai(x.nama):{ada:false},wcs=S.mwc.filter(w=>w.tipe==='Internal'&&w.aktif!==false).sort((a,b)=>(a.urutan||0)-(b.urutan||0)),lock=!!x&&(x.src==='wc'||pk.ada);
 const grupSel=x?fld('Grup',`<input class="inp" value="${esc(x.grup)}" disabled>`):fld('Grup / Work Centre',`<select class="inp" name="grup" required>${wcs.map(w=>`<option value="wc:${w._id}">${esc(w.nama)}</option>`).join('')}<option value="lain" ${wcs.length?'':'selected'}>${GRUP_LAIN}</option></select>`);
 openModal(`${x?'Ubah':'Tambah'} mesin`,
  fld('Nama mesin',`<input class="inp" name="nama" value="${esc(x?x.nama:'')}" ${lock?'disabled':''} required placeholder="mis. Punching 3 atau Forklift 1">${lock?'<small class="muted">Nama terkunci karena berasal dari Work Centre atau sudah dipakai di riwayat.</small>':''}`,true)+grupSel+
  fld('Kode aset (opsional)',inp('kode',x?x.kode:'','text','placeholder="mis. MC-PUN-03"'))+fld('Merek / tipe',inp('merk',x?x.merk:''))+fld('Lokasi',inp('lokasi',x?x.lokasi:'','text','placeholder="mis. Hall A"'))+fld('Keterangan',inp('ket',x?x.ket:''),true)+
  (x?`<label class="ck full"><input type="checkbox" name="aktif" ${x.aktif?'checked':''}> Aktif (tampil di pilihan mesin)</label>`:''),
  async d=>{
   const nama=(!x||!lock)?String(d.nama||'').trim():x.nama;if(!nama)throw new Error('Nama mesin wajib diisi.');
   if((!x||nama.toLowerCase()!==x.nama.toLowerCase())&&all.some(m=>m.nama.toLowerCase()===nama.toLowerCase()))throw new Error(`Mesin "${nama}" sudah ada.`);
   const info={kode:String(d.kode||'').trim(),merk:String(d.merk||'').trim(),lokasi:String(d.lokasi||'').trim(),ket:String(d.ket||'').trim()},aktif=x?!!d.aktif:true;
   if(!x){if(String(d.grup||'').startsWith('wc:')){const w=S.mwc.find(r=>r._id===String(d.grup).slice(3));if(!w)throw new Error('Work Centre tidak ditemukan.');await updDoc('mwc',w._id,{mesin:[...(Array.isArray(w.mesin)?w.mesin:[]),{nama,operator:[],kapasitas:0}]});await saveSetting({mesinInfo:{...mesinInfoAll(),[nama]:{...info,aktif:true}}})}
    else await saveSetting({mesinLain:[...mesinLainAll(),{nama,...info,aktif:true}]});toast(`Mesin ${nama} ditambahkan`);return}
   if(x.src==='wc')await saveSetting({mesinInfo:{...mesinInfoAll(),[x.nama]:{...info,aktif}}});
   else await saveSetting({mesinLain:mesinLainAll().map(m=>m.nama===x.nama?{...m,...info,aktif,nama}:m)});
   toast(`Mesin ${nama} diperbarui`)})}
function wcForm(id){
 const x=id?S.mwc.find(r=>r._id===id):{};
 const vendorOpts=S.mvendor.filter(v=>v.aktif!==false).sort((a,b)=>a.nama.localeCompare(b.nama));
 const vendorSel=`<select class="inp" name="vendor"><option value="">– Tidak ada / pilih nanti –</option>${vendorOpts.map(v=>`<option value="${v._id}" ${x.vendor===v._id?'selected':''}>${esc(v.nama)}</option>`).join('')}</select>`;
 const formHtml=
  `<div class="frow">
   ${fld('Kode WC',`<input class="inp mono" type="text" name="kode" value="${esc(x.kode||'')}" placeholder="WC-XX-01" required>`,false)}
   ${fld('Urutan',`<input class="inp" type="number" name="urutan" value="${x.urutan??S.mwc.length+1}" min="1" max="99">`,false)}
  </div>
  ${fld('Nama Proses / WC',`<input class="inp" type="text" name="nama" value="${esc(x.nama||'')}" placeholder="Shearing, Welding, CNC Laser…" required>`,true)}
  <div class="frow">
   ${fld('Kapasitas per hari kerja (pcs)',`<input class="inp" type="number" name="kapasitas" min="0" step="any" value="${esc(x.kapasitas||'')}" placeholder="mis. 100 (kosongkan bila belum tahu)">`,false)}
   ${fld('Tipe',`<select class="inp" name="tipe"><option value="Internal" ${(x.tipe||'Internal')==='Internal'?'selected':''}>Internal (dikerjakan sendiri)</option><option value="Subcont" ${x.tipe==='Subcont'?'selected':''}>Subcont (dikerjakan vendor)</option></select>`,false)}
  </div>
  ${fld('Mesin di work center ini (satu per baris: Nama mesin | operator, operator | kapasitas per hari)',`<textarea class="inp" name="mesin" rows="4" placeholder="Punching 20 Ton | Yana, Supyan | 50">${esc(PXL()?PXL().tulisMesin(x.mesin):'')}</textarea>`,true)}
  ${fld('Vendor Subcont (kosongkan jika Internal)',vendorSel,true)}
  ${fld('Keterangan',`<textarea class="inp" name="ket" rows="2" placeholder="Catatan tambahan…">${esc(x.ket||'')}</textarea>`,true)}
  ${id?`<label class="ck full"><input type="checkbox" name="aktif" ${x.aktif!==false?'checked':''}> Aktif</label>`:''}`;

 openModal(`${id?'Ubah':'Tambah'} Work Centre`,formHtml,async d=>{
  const kode=String(d.kode||'').trim().toUpperCase();
  const nama=String(d.nama||'').trim();
  if(!kode||!nama)throw new Error('Kode dan Nama wajib diisi.');
  const dupKode=S.mwc.find(r=>r._id!==id&&r.kode.toUpperCase()===kode);
  if(dupKode)throw new Error(`Kode "${kode}" sudah dipakai oleh "${dupKode.nama}". Gunakan kode lain.`);
  const data={kode,nama,tipe:d.tipe||'Internal',urutan:parseInt(d.urutan)||S.mwc.length+1,vendor:d.vendor||'',kapasitas:d.kapasitas===''||d.kapasitas==null?'':num0(d.kapasitas),mesin:PXL()?PXL().parseMesin(d.mesin):[],ket:String(d.ket||'').trim()};
  if(id){const lama=S.mwc.find(r=>r._id===id);if(lama&&String(lama.nama||'').trim().toLowerCase()!==nama.toLowerCase()){const p=wcPakai(lama);if(p.ada)throw new Error(`Nama tidak bisa diubah: "${lama.nama}" masih dipakai (${wcPakaiTeks(p).join('; ')}). Buat Work Centre baru atau nonaktifkan yang lama.`)}data.aktif=!!d.aktif;await updDoc('mwc',id,data);toast(`WC ${kode} diperbarui`)}
  else{await addDoc('mwc',{...data,aktif:true});toast(`WC ${kode} ditambahkan`)}
 });
}

/* Pemakaian work center: dilewati rute SPK aktif, punya catatan hasil produksi, atau tercantum di aturan rute standar.
   (Pengecekan lama memakai kode WC bawaan yang berbeda dari data nyata sehingga selalu lolos dan WC terpakai bisa terhapus permanen.) */
function wcPakai(x){
 const nm=String(x.nama||'').trim().toLowerCase();const c=calc();
 const spk=S.spk.filter(s=>{const sx=c.spk[s._id];return (s.status||'Terbit')==='Terbit'&&sx&&sx.st!=='Selesai'&&sx.st!=='Batal'&&(s.items||[]).some(it=>itemRute(it).some(w=>String(w).trim().toLowerCase()===nm))});
 const log=(S.produksi_log||[]).filter(e=>String(e.wc||'').trim().toLowerCase()===nm).length;
 const std=PXL()?Object.values(ruteStd()).some(r=>(r||[]).some(w=>String(w).trim().toLowerCase()===nm)):false;
 return {spk,log,std,ada:spk.length>0||log>0||std};
}
const wcPakaiTeks=p=>[p.spk.length?`dilewati rute ${p.spk.length} SPK aktif (${p.spk.slice(0,4).map(s=>'SPK '+s.no).join(', ')}${p.spk.length>4?' dan lainnya':''})`:'',p.log?`${p.log} catatan hasil produksi`:'',p.std?'tercantum di aturan rute standar':''].filter(Boolean);
async function wcDel(id){
 const x=S.mwc.find(r=>r._id===id);if(!x)return;
 const p=wcPakai(x);
 if(p.ada){
  const bisaNon=x.aktif!==false;
  openModal('Work Centre tidak bisa dihapus',
   `<div class="note full" style="margin-bottom:8px"><b>${esc(x.kode)} – ${esc(x.nama)}</b></div><p class="note crit">Masih dipakai: ${wcPakaiTeks(p).map(esc).join('; ')}.</p><p class="note">${bisaNon?'Nonaktifkan agar tidak muncul di antrian dan pilihan baru; riwayat produksi tetap utuh.':'Work Centre ini sudah nonaktif; riwayatnya dipertahankan.'}</p>`,
   bisaNon?async()=>{await updDoc('mwc',id,{aktif:false});toast(`${x.kode} dinonaktifkan`)}:null,{submit:bisaNon?'Nonaktifkan':'Tutup',danger:false});
  return;
 }
 openModal('Hapus Work Centre',
  `<div class="note full" style="margin-bottom:8px"><b>${esc(x.kode)} – ${esc(x.nama)}</b></div>`+
  `<p class="note">Work Centre ini belum dipakai rute SPK aktif, catatan produksi, maupun aturan rute. Hapus permanen?</p>`,
  async()=>{await delDoc('mwc',id);toast(`${x.kode} dihapus`)},{submit:'Hapus',danger:true});
}

/* ---------- CEK DATA ---------- */
F['cek-data']={cat:'',sev:'',grp:true,vendorF:''};

// Category meta: icon, nav destination for "lihat semua" link
const CAT_META={
 'Vendor':{ic:'truck',nav:'vendor',color:'warn'},
 'Master data':{ic:'db',nav:'master-data',color:'crit'},
 'SPK':{ic:'clipboard',nav:'spk',color:'info'},
 'Pengiriman':{ic:'send',nav:'pengiriman',color:'info'},
 'Bongkar muat':{ic:'layers',nav:'bongkar-muat',color:'warn'},
 'Stok':{ic:'box',nav:'bahan-baku',color:'crit'},
 'Dokumen':{ic:'file',nav:'vendor',color:'crit'},
 'Katalog':{ic:'tag',nav:'spk',color:'info'},
 'PR':{ic:'cart',nav:'bahan-baku',color:'warn'},
 'Produksi':{ic:'tool',nav:'spk',color:'warn'},
 'Stok RM':{ic:'box',nav:'bahan-baku',color:'warn'},
 'Stok FG':{ic:'box',nav:'barang-jadi',color:'warn'},
};

function dataIssues(){
 const c=calc(),t=c.t,I=[];
 const add=(sev,cat,title,meta,act,detail,vendorKey)=>I.push({sev,cat,title,meta,act,detail:detail||'',vendorKey:vendorKey||''});

 /* ── VENDOR ── */
 const unknownV=c.vend.filter(x=>x.st!=='Batal'&&UNKNOWN_V(x.v.vendor));
 unknownV.forEach(x=>add(x.st==='Selesai'?1:2,'Vendor',`SJ ${esc(x.v.noSJ)} belum ada nama vendor`,`${spkName(x.v.spk)} · ${esc(x.v.proses||'')} · ${fd(x.v.tgl)}`,`data-act="setvendor" data-id="${x.v._id}">Isi vendor`,'Barang tidak bisa dilacak asal vendornya',''));

 // Vendor overdue: >7 hari warning, >14 hari kritis
 c.vend.filter(x=>(x.st==='Di Vendor'||x.st==='Kembali Sebagian')&&x.age>7).forEach(x=>{
  const over14=x.age>14;
  const vNm=UNKNOWN_V(x.v.vendor)?'':x.v.vendor;
  add(over14?3:2,'Vendor',`SJ ${esc(x.v.noSJ)} di ${vNm||'vendor'} sudah ${x.age} hari`,`${n(x.sisa)} pcs · ${spkName(x.v.spk)} · ${esc(x.v.proses||'')}`,`data-act="terima" data-id="${x.v._id}">Terima kembali`,over14?'Berpotensi menghambat jadwal produksi':'Segera follow up ke vendor',vNm);
 });

 /* ── MASTER DATA ── */
 const tdk=S.rm.filter(r=>rmOn(r)&&grade(r)==='Lainnya');
 if(tdk.length)add(1,'Bahan baku',`${tdk.length} item bahan baku jenisnya tidak dikenali`,esc(tdk.slice(0,3).map(r=>rmLabel(r)).join(' · '))+(tdk.length>3?' …':''),`data-act="rmset">Atur jenis material`,'Berat per lembar dihitung memakai massa jenis baja 7,85; tambahkan jenis material di Pengaturan bahan baku supaya beratnya akurat');
 const u=usage();
 /* Skip nama yang:
    (a) sudah terdaftar aktif (ditangani oleh inMaster)
    (b) sudah pernah di-merge ke nama lain (ada record dengan mergedTo=nama aktif)
    (c) ada record master dengan nama ini meski tidak aktif (sudah di-proses)
 */
 const isMerged=(k,nm)=>S[MK[k]].some(x=>x.nama===nm&&x.mergedTo&&inMaster(k,x.mergedTo));
 // hasRecord: ada record master dgn nama ini (meski nonaktif/deleted) — berarti sudah pernah diproses
 const hasRecord=(k,nm)=>S[MK[k]].some(x=>x.nama===nm);
 for(const k of['vendor','customer','supplier'])Object.entries(u[k])
  .filter(([nm,cnt])=>!inMaster(k,nm)&&!isMerged(k,nm)&&!hasRecord(k,nm)&&cnt>=2)
  .forEach(([nm,cnt])=>{
   const sim=similarTo(k,nm);
   add(sim?3:2,'Master data',`${MLBL[k][0].toUpperCase()+MLBL[k].slice(1)} "${esc(nm)}" belum terdaftar${sim?` — mirip "${esc(sim.nama)}"`:''}`,`dipakai ${cnt}× di transaksi`,
    sim?`data-act="mmerge" data-k="${k}" data-from="${esc(nm)}" data-to="${esc(sim.nama)}">Gabungkan`:`data-act="mreg" data-k="${k}" data-nm="${esc(nm)}">Daftarkan`,
    sim?`Diduga typo dari "${esc(sim.nama)}" — gabungkan agar laporan akurat`:'Data tidak bisa dikelompokkan sampai terdaftar');
  });

 /* ── SPK ── */
 S.spk.forEach(s=>{const x=c.spk[s._id];
  // SPK terlambat: satu entry per SPK, severity tergantung kondisi
  if(x.st==='Terlambat'){
   const hasAlasan=String(s.alasan||'').trim();
   const hasTindakan=String(s.tindakan||'').trim();
   const kritis=x.late>7;
   if(kritis&&!hasAlasan){
    // Kritis & belum ada catatan sama sekali — harus segera diisi
    add(3,'SPK',`SPK ${s.no} kritis: terlambat ${x.late} hari — belum ada kendala`,
     `${esc(s.customer)} · terkirim ${Math.round(x.pK*100)}%`,
     `data-act="kendal" data-id="${s._id}">Isi kendala`,
     'Risiko kehilangan order / denda — manajemen perlu tahu penyebab');
   } else if(kritis&&hasAlasan&&!hasTindakan){
    // Kritis & ada alasan tapi belum ada rencana tindakan
    add(3,'SPK',`SPK ${s.no} kritis: terlambat ${x.late} hari — tindakan belum diisi`,
     `${esc(s.customer)} · terkirim ${Math.round(x.pK*100)}% · Kendala: ${esc(s.alasan.slice(0,50)+(s.alasan.length>50?'…':''))}`,
     `data-act="kendal" data-id="${s._id}">Isi rencana tindakan`,
     'Kendala dicatat — lengkapi rencana penyelesaiannya');
   } else if(!kritis&&!hasAlasan){
    // Terlambat 1–7 hari, belum ada kendala
    add(2,'SPK',`SPK ${s.no} terlambat ${x.late} hari — belum ada catatan`,
     `${esc(s.customer)} · terkirim ${Math.round(x.pK*100)}% · due ${fd(s.due||'')}`,
     `data-act="kendal" data-id="${s._id}">Isi kendala`,
     'Manajemen perlu tahu penyebab keterlambatan');
   }
   // Jika sudah ada alasan + tindakan (kritis atau tidak) → tidak muncul di Cek Data
   // User bisa lihat dari drawer SPK, issue hilang otomatis setelah diisi lengkap
  }
  // Draft lama
  if(x.st==='Draft'&&s.at&&days(String(s.at).slice(0,10),t)>2)
   add(1,'SPK',`Draft SPK ${s.no} belum diterbitkan (${days(String(s.at).slice(0,10),t)} hari)`,`${esc(s.customer)} · dibuat ${fd(s.at)}`,`data-act="spksheet" data-id="${s._id}">Buka & terbitkan`,'Barang belum bisa diproses sebelum SPK aktif');
  // Item tanpa berat
  if(s.terbitAt&&(s.items||[]).some(i=>!(+i.w))){
   const cnt=(s.items||[]).filter(i=>!(+i.w)).length;
   add(1,'SPK',`SPK ${s.no}: ${cnt} item belum ada berat (kg)`,`${esc(s.customer)} · total kg jadi tidak akurat`,`data-act="spkedit" data-id="${s._id}">Lengkapi berat`,'Berat diperlukan untuk laporan tonase & armada');
  }
  // Terkirim tapi produksi belum 100%
  const stale=x.lines.filter(l=>l.kirim>=l.q&&(+l.prod||0)<l.q&&l.vOut<l.q);
  if(x.st!=='Draft'&&stale.length)
   add(1,'Produksi',`SPK ${s.no}: ${stale.length} item sudah terkirim, produksi belum dicatat 100%`,esc(s.customer),`data-act="prodfix" data-id="${s._id}">Tandai selesai`,'Progress produksi tidak sinkron dengan pengiriman');
  // SPK aktif tapi 0% progress & sudah >3 hari dari terbit
  if((x.st==='Berjalan'||x.st==='Terlambat')&&x.pP===0&&s.terbitAt&&days(String(s.terbitAt).slice(0,10),t)>3)
   add(2,'Produksi',`SPK ${s.no} aktif tapi produksi 0% sudah ${days(String(s.terbitAt).slice(0,10),t)} hari`,`${esc(s.customer)} · deadline ${fd(s.deadline||'')}`,`data-act="openspk" data-id="${s._id}">Lihat SPK & update`,'Belum ada input progres sama sekali');
 });

 /* ── PENGIRIMAN ── */
 S.kirim.filter(k=>k.status==='Dalam Perjalanan'&&days(k.tgl,t)>2).forEach(k=>
  add(2,'Pengiriman',`SJ ${esc(k.noSJ)} masih "Dalam Perjalanan" sejak ${days(k.tgl,t)} hari lalu`,`${esc(k.customer)} · ${fd(k.tgl)}`,`data-act="kstep" data-id="${k._id}" data-to="Diterima">Tandai diterima`,'Konfirmasi penerimaan belum diupdate'));
 S.kirim.filter(k=>k.status==='Disiapkan'&&days(k.tgl,t)>2).forEach(k=>
  add(2,'Pengiriman',`SJ ${esc(k.noSJ)} sudah disiapkan ${days(k.tgl,t)} hari, belum berangkat`,`${esc(k.customer)} · ${fd(k.tgl)}`,`data-act="kstep" data-id="${k._id}" data-to="Dalam Perjalanan">Berangkat`,'Barang menunggu di gudang tanpa kepastian jadwal'));

 /* ── BONGKAR MUAT ── */
 S.bongkar.filter(b=>(b.status==='Antri'||b.status==='Proses')&&b.tgl<t).forEach(b=>
  add(2,'Bongkar muat',`${esc(b.jenis)} ${esc(b.nopol||'')} dari ${fd(b.tgl)} masih "${esc(b.status)}"`,`${esc(b.pihak||'')} · ${esc(b.ref||'')}`,
   b.status==='Antri'?`data-act="void" data-c="bongkar" data-id="${b._id}">Batalkan`:`data-act="bmstep" data-id="${b._id}" data-to="Selesai">Tutup`,'Aktivitas bongkar/muat belum diselesaikan'));

 /* ── STOK ── */
 for(const g of['rm','fg']){
  const gudang=g==='rm'?'Bahan Baku':'Barang Jadi';
  const subcat=g==='rm'?'Stok RM':'Stok FG';
  S[g].forEach(r=>{
   const v=c.stock[g][r._id];
   const lbl=g==='rm'?rmLabel(r):fgLabel(r);
   if(v<0)add(3,subcat,`Stok MINUS: ${esc(lbl)} (${n(v)} ${r.sat||r.satuan||'pcs'})`,`Gudang ${gudang} · lakukan opname`,`data-act="mv" data-g="${g}" data-j="opname" data-item="${r._id}">Opname`,'Stok negatif = data tidak valid, kemungkinan ada transaksi yang belum dicatat');
   else if(v>=0&&v<=(g==='rm'?r.buffer||5:3))add(g==='rm'?2:1,subcat,`Stok ${g==='rm'?'material':'FG'} hampir habis: ${esc(lbl)} (${n(v)} ${r.sat||r.satuan||'pcs'})`,`Gudang ${gudang}`,`data-act="mv" data-g="${g}" data-j="${g==='rm'?'masuk':'terima'}" data-item="${r._id}">${g==='rm'?'Buat PR / tambah stok':'Tandai terima'}`,'Perlu reorder segera');
  });
 }

 /* ── DOKUMEN ── */
 const seen={};[...S.vendor,...S.kirim].filter(d=>d.status!=='Batal'&&d.noSJ).forEach(d=>{(seen[d.noSJ]=seen[d.noSJ]||[]).push(d)});
 Object.entries(seen).filter(([,a])=>a.length>1).forEach(([no,a])=>
  add(3,'Dokumen',`No SJ "${esc(no)}" digunakan ${a.length}× (duplikat)`,`Batalkan yang salah · ${a.map(x=>fd(x.tgl)).join(' vs ')}`,`data-act="go" data-href="${a[0].vendor!==undefined?'vendor':'pengiriman'}">Lihat`,'Nomor SJ ganda menyebabkan kacau di rekap'));

 /* ── PR / PURCHASING ── */
 if(S.pr)S.pr.filter(p=>p.status==='Open'&&p.tgl&&days(p.tgl,t)>7).forEach(p=>
  add(2,'PR',`PR ${esc(p.no||p._id)} sudah ${days(p.tgl,t)} hari belum diproses`,`${esc(p.item||'')} · ${n(p.qty||0)} ${esc(p.sat||'')} · dibuat ${fd(p.tgl)}`,`data-act="go" data-href="bahan-baku">Lihat PR`,'Kebutuhan bahan baku mungkin tertunda'));

 /* ── PRODUKSI: item yang tidak akan muncul di antrian Work Centre manapun ── */
 {const P=PXL();if(P&&!produksiAdmin()){const ada=new Set(S.mwc.filter(w=>w.aktif!==false&&w.tipe!=='Subcont').map(w=>String(w.nama).trim().toLowerCase()));const c=calc();
  S.spk.forEach(s=>{const x=c.spk[s._id];if(!x||x.st==='Selesai'||x.st==='Draft'||s.status==='Batal')return;
   const tanpa=[],asing=new Set();
   (s.items||[]).forEach((it,i)=>{const r=itemRuteInfo(it).rute;if(!r.length){tanpa.push(it.d||('baris '+(i+1)));return}
    r.forEach(w=>{if(!P.langkahVendor(w)&&!ada.has(String(w).trim().toLowerCase()))asing.add(w)})});
   if(tanpa.length)add(3,'Produksi',`SPK ${esc(String(s.no))}: ${tanpa.length} item tanpa rute produksi`,`Tidak muncul di antrian Work Centre manapun: ${tanpa.slice(0,3).map(esc).join('; ')}${tanpa.length>3?' dan lainnya':''}. Pastikan judul section memuat produk (mis. CABLE TRAY TYPE STU) atau atur rute di Master Data › Rute produksi.`,`data-act="go" data-href="master-data">Buka Master Data`,'Item ini tidak bisa dicatat operator dan progresnya tidak terhitung');
   if(asing.size)add(3,'Produksi',`SPK ${esc(String(s.no))}: rute memakai Work Centre yang tidak ada di Master Data`,[...asing].map(esc).join(', ')+'. Antrian untuk langkah itu tidak muncul.',`data-act="wcfix">Tambahkan otomatis`,'Operator di Work Centre itu tidak melihat item ini')})}}

 /* ── PRODUKSI: plate belum lengkap padahal produksi jalan; WIP siap ke vendor belum dikirim ── */
 {const c2=calc();
  S.spk.forEach(s=>{const x=c2.spk[s._id];if(!x||s.status!=='Terbit'||x.st==='Selesai'||x.st==='Batal')return;
   const dd={};(s.items||[]).forEach(it=>{dd[it.d]=(dd[it.d]||0)+1});const dup=Object.keys(dd).filter(k=>k&&dd[k]>1);
   if(dup.length)add(1,'Produksi',`SPK ${esc(String(s.no))}: ${dup.length} deskripsi item muncul lebih dari sekali`,`${dup.slice(0,2).map(esc).join('; ')}${dup.length>2?' dan lainnya':''}. Pengiriman dan vendor dicocokkan lewat deskripsi, jadi dibagi berurutan antar baris. Beri deskripsi berbeda (mis. tambahkan tebal) agar tiap baris terlacak sendiri.`,`data-act="go" data-href="spk">Buka SPK`,'Deskripsi sama dalam satu SPK membuat progres kirim dan vendor tidak bisa dipisah per baris.');
   const p=platSpk(s);
   if(p&&p.st!=='Lengkap'&&x.pP>0)add(2,'Produksi',`SPK ${esc(String(s.no))}: produksi sudah jalan tetapi plate belum lengkap diserahkan`,`${esc(s.customer||'')} · plate ${n(Math.round(p.sudah))} / ${n(Math.round(p.bruto))} kg · produksi ${Math.round(x.pP*100)}%`,`data-act="go" data-href="bahan-baku">Serahkan plate`,'Catat pengeluaran plate (PK) agar stok bahan baku dan kebutuhan material benar.');
   const fl=flow(s._id);
   if(fl&&fl.stage==='Siap ke vendor')add(1,'Produksi',`SPK ${esc(String(s.no))}: hasil produksi selesai, belum dikirim ke vendor`,`${esc(s.customer||'')} · produksi 100% · belum ada surat jalan vendor`,`data-act="go" data-href="vendor">Buka Kirim ke Vendor`,'WIP siap dikirim ke vendor untuk finishing.');
  })}

 /* ── KESEHATAN DATA (T4): angka yang tidak mungkin atau tidak cocok antar tempat ── */
 {const c3=calc();
  [['rm',rmLabel,'bahan-baku','Bahan baku'],['fg',fgLabel,'barang-jadi','Barang jadi'],['sp',spLabel,'sparepart','Sparepart']].forEach(([g,lb,mod,nm])=>(S[g]||[]).forEach(it=>{const v=(c3.stock[g]||{})[it._id];
   if(v!=null&&v<-0.0005)add(3,'Stok',`${nm}: stok ${esc(lb(it))} negatif (${n(v)})`,'Pengeluaran melebihi stok yang tercatat. Cek mutasi terakhir atau lakukan koreksi atau opname.',`data-act="go" data-href="${mod}">Buka ${nm}`,'Stok negatif membuat laporan stok dan kebutuhan material tidak valid.')}));
  S.spk.forEach(s=>{const x=c3.spk[s._id];if(!x||s.status!=='Terbit'||x.st==='Batal')return;
   /* berat salinan: tiga item atau lebih yang deskripsinya berbeda tetapi beratnya persis sama (mis. 8,481 untuk semua item section), biasanya berat section yang disalin, bukan berat item */
   {const bw={};(s.items||[]).forEach(i=>{const w=Math.round((+i.w||0)*1000)/1000;if(w>0)(bw[w]=bw[w]||new Set()).add(String(i.d||''))});
    const salin=Object.entries(bw).filter(([,set])=>set.size>=3);
    if(salin.length)add(2,'SPK',`SPK ${esc(String(s.no))}: ${salin.reduce((a,[,set])=>a+set.size,0)} item berbeda memakai berat yang sama`,`Berat ${salin.map(([w])=>n(+w)).join(', ')} kg/pcs dipakai banyak item berlainan ukuran dan jenis; kemungkinan berat section yang disalin, sehingga tonase dan kebutuhan plat SPK tidak valid. Hitung ulang dari kalkulator berat.`,`data-act="spkberat" data-id="${s._id}">Hitung ulang berat`,'Berat per item yang sama untuk Cable Tray, Cover, dan Jointing tidak mungkin benar.')}
   const p=platSpk(s);
   if(p&&p.bruto>0&&p.sudah>p.bruto*1.05+0.5)add(1,'Stok',`SPK ${esc(String(s.no))}: plat keluar ${n(Math.round(p.sudah))} kg melebihi kebutuhan ${n(Math.round(p.bruto))} kg`,`${esc(s.customer||'')} · selisih ${n(Math.round(p.sudah-p.bruto))} kg (${Math.round((p.sudah/p.bruto-1)*100)}%). Bila memang lebih, catat alasannya; bila sisa utuh, kembalikan ke gudang.`,'data-act="go" data-href="bahan-baku">Buka Bahan Baku','Plat keluar di atas kebutuhan SPK berarti susut berlebih atau salah catat.');
   if(s.stokReq)(x.lines||[]).forEach(l=>{if((l.kirim||0)>(l.prodEff||0)+0.0005)add(2,'Barang jadi',`SPK ${esc(String(s.no))}: masuk gudang ${n(l.kirim)} melebihi hasil produksi ${n(l.prodEff||0)}`,`${esc(l.d||'')}. Laporkan hasil produksi yang belum tercatat atau koreksi penerimaan.`,'data-act="go" data-href="barang-jadi">Buka Barang Jadi','Barang jadi masuk tanpa hasil produksi yang cocok.')})
  })}

 S.pr.filter(p=>p.status==='Draf'&&p.tgl&&days(p.tgl,calc().t)>=1).forEach(p=>add(1,'PR',`PR draf ${esc(p.noPR||'')} belum diajukan ${days(p.tgl,calc().t)} hari`,`${esc(p.ket||'')}`,`data-act="go" data-href="${p.gudang==='sp'?'sparepart':'bahan-baku'}">Buka PR`,'PR draf otomatis baru berlaku setelah diajukan oleh user (tombol Ajukan).'));
 {const bd=spkBeratDaftar();if(bd.length)add(1,'SPK',`${bd.length} SPK belum selesai beratnya berbeda dari kalkulator (${bd.reduce((a,x)=>a+x.pb.ubah.length,0)} item)`,'Berat kosong, salinan, atau selisih lebih dari 2% dari rumus Excel. Tonase dan kebutuhan plat SPK tidak akurat sampai dihitung ulang.',`data-act="spkberatsemua">Hitung ulang semua (${bd.length})`,'Hanya SPK yang belum selesai; berat lama disimpan.')}
 susutRows().filter(r=>r.status==='Berlebih'||r.status==='Plat kurang catat').forEach(r=>add(2,'Stok',r.status==='Berlebih'?`SPK ${esc(String(r.s.no))}: susut ${r.bahan} ${n(r.tebal)} mm ${Math.round(r.pct*1000)/10}% (batas ${Math.round(r.batas*1000)/10}%)`:`SPK ${esc(String(r.s.no))}: hasil ${r.bahan} ${n(r.tebal)} mm melebihi plat yang tercatat keluar`,`${esc(r.s.customer||'')} · plat keluar ${n(Math.round(r.keluarKg))} kg, hasil jadi ${n(Math.round(r.hasilKg))} kg`,'data-act="go" data-href="bahan-baku">Buka Bahan Baku',r.status==='Berlebih'?'Plat keluar jauh di atas hasil jadi: susut berlebih, plat tidak terpakai belum dikembalikan, atau salah catat.':'Pengeluaran plat untuk SPK ini belum lengkap dicatat.'));

 Object.values(spCalc()).filter(x=>spOn(x.r)).forEach(x=>{const a=movAgg('sp',x.r._id);const dasar=(a.k90-x.k30)/2;
  if(dasar>0&&x.k30>=2*dasar&&x.k30-dasar>=3)add(1,'Stok',`Sparepart ${esc(x.r.item)}: pemakaian 30 hari ${n(x.k30)} ${esc(x.r.satuan||'')} (biasanya sekitar ${n(Math.round(dasar*10)/10)} per bulan)`,'Pemakaian melonjak dibanding dua bulan sebelumnya. Cek mesin tujuan dan apakah ada kerusakan atau salah catat.','data-act="go" data-href="sparepart">Buka Sparepart','Lonjakan pemakaian sparepart biasanya tanda kerusakan mesin atau pencatatan yang salah.')});

 /* ── KATALOG ── */
 {const X=katIndex();
  const sim=X.arr.filter(x=>x.sim.length).length;
  if(sim)add(1,'Katalog',`${sim} item katalog SPK diduga dobel / salah ejaan`,'mis. "Cabe Tray" vs "Cable Tray" — muncul ganda di pilihan Description',`data-act="katgo" data-kf="sim">Rapikan katalog`,'Katalog bersih mempercepat input SPK');
  X.arr.filter(x=>x.flag).forEach(x=>
   add(2,'Katalog',`Berat janggal: ${esc(x.d)}`,Object.entries(x.w).map(([t,v])=>(t==='–'?'':t+' mm: ')+v+' kg').join(', ')+' · akan terisi otomatis di SPK berikutnya',`data-act="katedit" data-d="${esc(x.d)}">Perbaiki berat`,'Berat tidak wajar akan mempengaruhi kalkulasi tonase'));
 }

 return I.sort((a,b)=>b.sev-a.sev||a.cat.localeCompare(b.cat));
}

function cekDataCsv(){
 const I=dataIssues();
 const rows=[['Prioritas','Kategori','Masalah','Detail','Catatan'],...I.map(i=>[i.sev>=3?'Kritis':i.sev===2?'Perhatian':'Info',i.cat,i.title.replace(/"/g,"'"),i.meta.replace(/"/g,"'"),i.detail.replace(/"/g,"'")])];
 const csv=rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
 const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,﻿'+encodeURIComponent(csv);
 a.download=`CekData_${new Date().toISOString().slice(0,10)}.csv`;a.click();
 toast('CSV diunduh');
}

const SEV_LBL={3:'Kritis',2:'Perhatian',1:'Info'};
const SEV_CLS={3:'crit',2:'warn',1:'info'};
const SEV_IC={3:'alert-triangle',2:'alert-circle',1:'info'};

T['cek-data']=()=>{
 const I=dataIssues();
 const f=F['cek-data'];
 // Group area categories: Stok RM + Stok FG → "Stok", SPK + Produksi → shown separately
 const cats=[...new Set(I.map(i=>i.cat))].sort();
 const crit=I.filter(i=>i.sev>=3).length,warn=I.filter(i=>i.sev===2).length,info=I.filter(i=>i.sev===1).length;
 const sevBtns=[['','Semua'],['3','Kritis ('+crit+')'],['2','Perhatian ('+warn+')'],['1','Info ('+info+')']];
 // Vendor filter — hanya muncul ketika filter ke kategori Vendor
 const vendorNames=f.cat==='Vendor'?[...new Set(S.vendor.filter(v=>v.vendor&&!UNKNOWN_V(v.vendor)).map(v=>v.vendor))].sort():[];
 const vendorSel=vendorNames.length?`<select class="sel" data-act="filtsel" data-view="cek-data" data-key="vendorF"><option value="">Semua vendor</option>${vendorNames.map(v=>`<option ${f.vendorF===v?'selected':''}>${esc(v)}</option>`).join('')}</select>`:'';
 return `<div class="tb-group">
  <div class="tb-lbl">Kategori</div>
  ${segBtns('cek-data','cat',[['','Semua ('+I.length+')'],...cats.map(c=>[c,`${c} (${I.filter(i=>i.cat===c).length})`])])}
 </div>
 <div class="tb-group">
  <div class="tb-lbl">Prioritas</div>
  ${segBtns('cek-data','sev',sevBtns)}
 </div>
 ${vendorSel}
 <button class="btn sm" data-act="cekgrp"><svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 4h12M4 8h8M6 12h4"/></svg> ${f.grp?'List':'Grup'}</button>
 <button class="btn sm" data-act="cekcsv">${ic('dl')} Export CSV</button>`;
};

B['cek-data']=()=>{
 const I=dataIssues(),f=F['cek-data'];
 const xs=I.filter(i=>(!f.cat||i.cat===f.cat)&&(!f.sev||String(i.sev)===f.sev)&&(!f.vendorF||i.vendorKey===f.vendorF));
 const crit=I.filter(i=>i.sev>=3).length,warn=I.filter(i=>i.sev===2).length,info=I.filter(i=>i.sev===1).length;
 const recs=S.spk.length+S.vendor.length+S.kirim.length+S.bongkar.length+S.mutasi.length;
 const score=Math.max(0,Math.round(100*(1-Math.min(1,(crit*1.5+warn*0.5+info*0.1)/Math.max(1,recs)))));
 const scoreCls=score>=90?'ok':score>=70?'warn':'crit';

 // Per-area mini health
 const areas=[
  {k:'SPK',lbl:'SPK & Produksi',nav:'spk'},
  {k:'Produksi',lbl:'Produksi',nav:'spk'},
  {k:'Vendor',lbl:'Surat Jalan Vendor',nav:'vendor'},
  {k:'Pengiriman',lbl:'Pengiriman',nav:'pengiriman'},
  {k:'Stok RM',lbl:'Stok Bahan Baku',nav:'bahan-baku'},
  {k:'Stok FG',lbl:'Stok Barang Jadi',nav:'barang-jadi'},
  {k:'Master data',lbl:'Master Data',nav:'master-data'},
  {k:'Dokumen',lbl:'Dokumen',nav:'vendor'},
 ];
 const areaCells=areas.map(a=>{
  const ac=I.filter(i=>i.cat===a.k&&i.sev>=3).length;
  const aw=I.filter(i=>i.cat===a.k&&i.sev===2).length;
  const ai=I.filter(i=>i.cat===a.k&&i.sev===1).length;
  const tot=ac+aw+ai;
  const cls=ac>0?'crit':aw>0?'warn':ai>0?'info':'ok';
  return `<div class="cd-area ${cls}" data-act="setcat" data-cat="${a.k}">
   <div class="cd-area-lbl">${a.lbl}</div>
   <div class="cd-area-cnt">${tot===0?'✓':tot}</div>
   ${tot>0?`<div class="cd-area-sub">${ac?`<span class="cd-pip crit">${ac}K</span>`:''}${aw?`<span class="cd-pip warn">${aw}P</span>`:''}${ai?`<span class="cd-pip info">${ai}I</span>`:''}</div>`:'<div class="cd-area-sub ok-txt">Bersih</div>'}
  </div>`;
 }).join('');

 const issueRow=i=>{
  const sevCls=SEV_CLS[i.sev]||'';
  return `<div class="alert ${sevCls}">
   <span class="st"></span>
   <div class="alert-body">
    <div class="alert-title">${chip(i.cat,'plain')} ${i.title}</div>
    <div class="meta">${i.meta}</div>
    ${i.detail?`<div class="cd-detail">${i.detail}</div>`:''}
   </div>
   <button class="btn sm" ${i.act}</button>
  </div>`;
 };

 // Issue list — grouped or flat
 let listHtml='';
 if(!xs.length){
  listHtml=empty('Data bersih','Tidak ada temuan untuk filter ini.');
 } else if(f.grp&&!f.cat&&!f.sev){
  // Grouped by severity
  const sevGroups=[3,2,1].filter(sv=>xs.some(i=>i.sev===sv));
  listHtml=sevGroups.map(sv=>{
   const group=xs.filter(i=>i.sev===sv);
   const cls=SEV_CLS[sv];
   return `<div class="cd-group">
    <div class="cd-group-hd ${cls}">
     ${ic(SEV_IC[sv])} ${SEV_LBL[sv]}
     <span class="cd-group-cnt">${group.length}</span>
    </div>
    <div class="alerts">${group.slice(0,60).map(i=>issueRow(i)).join('')}</div>
    ${group.length>60?`<div class="pbody note">+${group.length-60} lainnya — export CSV untuk lihat semua</div>`:''}
   </div>`;
  }).join('');
 } else {
  listHtml=`<div class="alerts">${xs.slice(0,120).map(i=>issueRow(i)).join('')}</div>${xs.length>120?`<div class="pbody note">+${xs.length-120} lainnya — export CSV untuk lihat semua</div>`:''}`;
 }


 return `
 <section class="kpis">
  <div class="kpi ${scoreCls}">
   <span class="lb">Skor Data</span>
   <span class="v">${score}<small>/100</small></span>
   <span class="s">${score>=90?'Data sangat bersih':score>=70?'Ada beberapa yang perlu diperhatikan':'Banyak data perlu diperbaiki'}</span>
  </div>
  <div class="kpi crit" data-act="setcat" data-cat="" style="cursor:pointer">
   <span class="lb">Kritis</span><span class="v">${crit}</span><span class="s">harus segera ditangani</span>
  </div>
  <div class="kpi warn" data-act="setcat" data-cat="" style="cursor:pointer">
   <span class="lb">Perhatian</span><span class="v">${warn}</span><span class="s">perlu dilengkapi / diupdate</span>
  </div>
  <div class="kpi info" data-act="setcat" data-cat="" style="cursor:pointer">
   <span class="lb">Info</span><span class="v">${info}</span><span class="s">kelengkapan dokumen</span>
  </div>
 </section>

 <section class="panel cd-area-panel">
  <header><h2>Area Operasional</h2><span class="hint">klik area untuk filter</span></header>
  <div class="cd-areas">${areaCells}</div>
 </section>

 <section class="panel">
  <header>
   <h2>${f.cat?f.cat+' — ':''} ${f.sev?SEV_LBL[+f.sev]+' — ':''} Daftar Perbaikan <span class="cd-total-badge">${xs.length}</span></h2>
   <span class="hint">klik tombol di kanan untuk perbaiki langsung</span>
  </header>
  ${listHtml}
 </section>`;
};

/* ---------- GUDANG BAHAN BAKU: analytics, purchasing, opname ---------- */
const DENS={SPHC:7.85,SPCC:7.85,SS304:7.93,SS316:7.98,Aluminium:2.71,Lainnya:7.85};
const famOf=g=>{const cm=CMATS().find(m=>m.nama===g);return cm&&cm.dasar?cm.dasar:g};
const GRP=g=>{const f=famOf(g),cm=CMATS().find(m=>m.nama===g);return f==='SS304'||f==='SS316'?'Stainless':f==='Aluminium'?(cm?g:'Aluminium'):cm&&!cm.dasar?g:f==='Lainnya'?'Belum dikenali':'Baja (SPHC/SPCC)'};
const GRPS0=['Baja (SPHC/SPCC)','Stainless','Aluminium'];
const grps=()=>[...GRPS0,...CMATS().map(m=>m.nama).filter(x=>x&&!GRPS0.includes(x)),'Belum dikenali'];
const dims=r=>(String(r.ukuran||'').match(/[\d]+(?:[.,]\d+)?/g)||[]).map(x=>parseFloat(x.replace(',','.')));
const densG=g=>{const cm=CMATS().find(m=>m.nama===g);if(cm&&+cm.dens>0)return +cm.dens;const o=((byId('master','setting')||{}).dens||{})[g];return +o>0?+o:(DENS[g]||7.85)};
const kgLbr=r=>{const d=dims(r);if(d.length<3)return 0;return d[0]*d[1]*d[2]/1e6*densG(grade(r))};
const thkR=r=>{const d=dims(r);return d.length?d[0]:0};
const ton=kg=>n(Math.round(kg/100)/10);
const SET=()=>({leadBeli:7,cover:30,...(byId('master','setting')||{})});
const addDays=(s,k)=>{const d=new Date(s+'T00:00:00');d.setDate(d.getDate()+k);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
const monthKey=s=>String(s).slice(0,7);
const BLN3=m=>BLN[+m.slice(5,7)-1]+' '+m.slice(2,4);
F['bahan-baku']={q:'',grade:'',st:'',tab:'stok',sort:'grade',mvj:'',mvspk:'',mvp:'90',opn:{},beli:{},ksItem:'',ksPer:'all'};

function rmCalc(){
 const c=calc();if(c._rm)return c._rm;
 const t=c.t,st=SET(),hist=[...S.rmhist].sort((a,b)=>a.tgl.localeCompare(b.tgl));
 const prOpen={};S.pr.filter(p=>p.status==='Draf'||p.status==='Diajukan'||p.status==='Dipesan').forEach(p=>(p.items||[]).forEach(i=>{prOpen[i.item]=(prOpen[i.item]||0)+Math.max(0,(+i.q||0)-(+i.qTerima||0))}));
 const byMv={};S.mutasi.filter(m=>m.gudang==='rm').forEach(m=>(byMv[m.item]=byMv[m.item]||[]).push(m));
 const info={},monthly={};const from90=addDays(t,-90),from30=addDays(t,-30);
 const nextM=m=>{const [y,mo]=m.split('-').map(Number);return mo===12?`${y+1}-01`:`${y}-${pad(mo+1)}`};
 const addMonth=(a,b,qty,kg,est)=>{ /* spread a decrease evenly over the days (a,b], split by calendar month */
  const tot=Math.max(1,days(a,b));let cur=a;let guard=0;while(cur<b&&guard++<40){const m=monthKey(addDays(cur,1));const mEnd=addDays(nextM(m)+'-01',-1);const seg=mEnd<b?mEnd:b;const o=monthly[m]||(monthly[m]={kg:0,est:false});const v=kg*days(cur,seg)/tot;o.kg+=v;if(est)o.kgE=(o.kgE||0)+v;cur=seg}};
 for(const r of S.rm){
  const id=r._id,kg1=kgLbr(r),stok=c.stock.rm[id];
  const pts=hist.filter(h=>h.stok&&h.stok[id]!==undefined).map(h=>[h.tgl,+h.stok[id]]);
  /* usage rate: detailed snapshot intervals (≤21 days apart, last 180 days) + transactions recorded in the app.
     Long gaps between snapshots only show the net change (usage minus receipts), so they feed the monthly estimate but not the rate. */
  let hUse=0,hDays=0,recv90=0;const from180=addDays(t,-180);
  for(let i=1;i<pts.length;i++){const [a,va]=pts[i-1],[b,vb]=pts[i];const dec=va-vb;const gap=days(a,b);const longGap=gap>21;
   if(dec>0)addMonth(a,b,dec,dec*kg1,longGap);else if(b>from90)recv90+=-dec;
   if(!longGap&&b>from180){hDays+=gap;if(dec>0)hUse+=dec}}
  const mv=(byMv[id]||[]).sort((a,b)=>(a.tgl+a.at).localeCompare(b.tgl+b.at));
  const base=r.tglStokAwal||t;let run=+r.stokAwal||0;const series=pts.filter(p=>p[0]<base);series.push([base,run]);
  let aUse=0,a30=0;
  for(const m of mv){const orig=m.koreksiDari?S.mutasi.find(x=>x._id===m.koreksiDari):null;const isOut=m.jenis==='keluar'||(m.jenis==='koreksi'&&orig&&orig.jenis==='keluar');const isIn=m.jenis==='masuk'||(m.jenis==='koreksi'&&orig&&orig.jenis==='masuk');
   if(isOut){const q=-(+m.delta||0);if(m.tgl>from90)aUse+=q;if(m.tgl>from30)a30+=q;const mk=monthKey(m.tgl);(monthly[mk]=monthly[mk]||{kg:0,est:false}).kg+=q*kg1}
   if(isIn&&m.tgl>from90)recv90+=+m.delta||0;
   if(m.tgl>=base){run+=+m.delta||0;if(series.length&&series[series.length-1][0]===m.tgl)series[series.length-1][1]=run;else series.push([m.tgl,run])}}
  if(series[series.length-1][0]!==t)series.push([t,stok]);else series[series.length-1][1]=stok;
  const appDays=Math.max(0,Math.min(90,days(base,t)));
  const useApp=appDays>=60;const rateDays=useApp?appDays:hDays+appDays;const rateUse=useApp?aUse:hUse+aUse;
  const avgDay=rateDays>0?Math.max(0,rateUse)/rateDays:0;const cover=avgDay>0?stok/avgDay:Infinity;
  const cons90=avgDay*90,cons30=useApp?a30:avgDay*30;const basis=useApp?'transaksi aplikasi 90 hari':hDays?`histori ${hDays} hari (snapshot Excel) + ${appDays} hari transaksi aplikasi`:'transaksi aplikasi';
  const min=+r.min||0,buf=+r.buffer||0,rop=min+avgDay*st.leadBeli,target=Math.max(buf,rop+avgDay*st.cover),onOrder=prOpen[id]||0;
  let sug=0,why='';if((stok<buf||(avgDay>0&&stok<=rop))){sug=Math.ceil(Math.max(0,target-stok-onOrder));why=stok<buf?`stok di bawah buffer ${n(buf)}`:`stok ≤ titik pesan ulang ${n(Math.ceil(rop))}`}
  let s='Aman',cls='ok';
  if(stok<=0&&(buf>0||min>0||avgDay>0)){s='Habis';cls='crit'}else if(stok<=0){s='Kosong';cls='plain'}
  else if(min>0&&stok<min){s='Kritis';cls='crit'}else if(sug>0){s='Perlu order';cls='warn'}else if(avgDay===0&&(hDays>0||appDays>=30)){s='Tidak bergerak';cls='plain'}
  if(r.aktif===false){s='Nonaktif';cls='plain';sug=0;why=''}
  info[id]={off:r.aktif===false,r,kg1,stok,kg:Math.max(0,stok)*kg1,cons90:Math.max(0,cons90),cons30:Math.max(0,cons30),recv90,basis,avgDay,perBln:avgDay*30,cover,rop,target,sug,why,onOrder,st:s,cls,series,min,buf};
 }
 // ABC by kg consumed in 90 days
 const ranked=Object.values(info).filter(x=>x.cons90>0&&!x.off).sort((a,b)=>b.cons90*b.kg1-a.cons90*a.kg1);const totC=ranked.reduce((a,x)=>a+x.cons90*x.kg1,0);let cum=0;
 ranked.forEach(x=>{cum+=x.cons90*x.kg1;x.cum=cum/totC;x.abc=x.cum<=0.8||x===ranked[0]?'A':x.cum<=0.95?'B':'C'});
 Object.values(info).forEach(x=>{if(!x.abc)x.abc='–';x.fsn=x.cons90<=0?(x.stok>0?'N':'–'):x.abc==='A'?'F':'S'});
 c._rm={info,monthly,hist,totC};return c._rm;
}
const RMI=id=>rmCalc().info[id];

/* ---------- charts (inline SVG, hover tooltips) ---------- */
const CH={};let chN=0;
function niceMax(v){if(v<=0)return 1;const p=Math.pow(10,Math.floor(Math.log10(v)));const f=v/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p}
function lineChart(o){ /* o:{series:[{name,cls,pts:[[date,val]]}],fmt,unit} — step values, shared x axis */
 const id='ch'+(++chN),W=720,H=240,L=48,R=150,T=14,Bm=28;
 const dates=[...new Set(o.series.flatMap(s=>s.pts.map(p=>p[0])))].sort();if(dates.length<2)return '<div class="note">Belum cukup data untuk grafik.</div>';
 const t0=Date.parse(dates[0]),t1=Date.parse(dates[dates.length-1]);const X=d=>L+(Date.parse(d)-t0)/(t1-t0||1)*(W-L-R);
 const vmax=niceMax(Math.max(...o.series.flatMap(s=>s.pts.map(p=>p[1]))));const Y=v=>T+(1-v/vmax)*(H-T-Bm);
 const grid=[0,.25,.5,.75,1].map(f=>`<line x1="${L}" x2="${W-R}" y1="${Y(vmax*f)}" y2="${Y(vmax*f)}" class="g"/><text x="${L-6}" y="${Y(vmax*f)+4}" class="ax" text-anchor="end">${o.fmt(vmax*f)}</text>`).join('');
 const months=[];{let d=new Date(t0);d.setDate(1);d.setMonth(d.getMonth()+1);while(d.getTime()<=t1){months.push(d.getFullYear()+'-'+pad(d.getMonth()+1)+'-01');d.setMonth(d.getMonth()+1)}}
 const xl=months.map(m=>`<line x1="${X(m)}" x2="${X(m)}" y1="${H-Bm}" y2="${H-Bm+4}" class="g"/><text x="${X(m)}" y="${H-8}" class="ax" text-anchor="middle">${BLN3(m)}</text>`).join('');
 const at=(s,d)=>{let v=null;for(const p of s.pts){if(p[0]<=d)v=p[1];else break}return v};
 const ends=[];
 const paths=o.series.map((s,i)=>{const pts=dates.map(d=>[d,at(s,d)]).filter(p=>p[1]!==null);let dd='';pts.forEach((p,k)=>{dd+=(k?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)});const last=pts[pts.length-1];ends.push({y:Y(last[1]),s,last});
  return `<path d="${dd}" class="ln ${s.cls}"/><circle cx="${X(last[0])}" cy="${Y(last[1])}" r="4" class="dot ${s.cls}"/>`}).join('');
 ends.sort((a,b)=>a.y-b.y);for(let i=1;i<ends.length;i++)if(ends[i].y-ends[i-1].y<14)ends[i].y=ends[i-1].y+14;
 const labels=ends.map(e=>`<text x="${W-R+8}" y="${e.y+4}" class="dl">${esc(e.s.name)} · ${o.fmt(e.last[1])}</text>`).join('');
 CH[id]={o,dates,X,Y,at,W,H,L,R,T,Bm};
 return `<div class="chart" data-ch="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title||'Grafik')}">${grid}${xl}${paths}${labels}<line class="xh" x1="0" x2="0" y1="${T}" y2="${H-Bm}" visibility="hidden"/><rect class="hit" x="${L}" y="${T}" width="${W-L-R}" height="${H-T-Bm}"/></svg><div class="tip" hidden></div></div>`;
}
function barChart(o){ /* o:{bars:[{label,v,est,tip}],fmt} */
 const id='ch'+(++chN),W=720,H=210,L=48,R=12,T=18,Bm=28;if(!o.bars.length)return '<div class="note">Belum ada data.</div>';
 const vmax=niceMax(Math.max(...o.bars.map(b=>b.v)));const Y=v=>T+(1-v/vmax)*(H-T-Bm);const bw=(W-L-R)/o.bars.length;const best=o.bars.reduce((a,b)=>b.v>a.v?b:a,o.bars[0]);
 const grid=[0,.5,1].map(f=>`<line x1="${L}" x2="${W-R}" y1="${Y(vmax*f)}" y2="${Y(vmax*f)}" class="g"/><text x="${L-6}" y="${Y(vmax*f)+4}" class="ax" text-anchor="end">${o.fmt(vmax*f)}</text>`).join('');
 const bars=o.bars.map((b,i)=>{const x=L+i*bw+bw*0.2,w=bw*0.6,y=Y(b.v),h=Math.max(0,H-Bm-y);const r=Math.min(4,w/2,h);
  return `<g class="bar" data-tip="${esc(b.tip)}"><rect x="${L+i*bw}" y="${T}" width="${bw}" height="${H-T-Bm}" class="hitb"/><path d="M${x} ${H-Bm}V${y+r}Q${x} ${y} ${x+r} ${y}H${x+w-r}Q${x+w} ${y} ${x+w} ${y+r}V${H-Bm}Z" class="bf ${b.est?'est':''}"/>${b===best?`<text x="${x+w/2}" y="${y-5}" class="dl" text-anchor="middle">${o.fmt(b.v)}</text>`:''}<text x="${x+w/2}" y="${H-8}" class="ax" text-anchor="middle">${esc(b.label)}</text></g>`}).join('');
 return `<div class="chart" data-bars="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title||'Grafik batang')}">${grid}${bars}</svg><div class="tip" hidden></div></div>`;
}
const spark=(series)=>{const pts=series.filter(p=>p[0]>=addDays(today(),-150));if(pts.length<2)return '';const t0=Date.parse(pts[0][0]),t1=Date.parse(pts[pts.length-1][0])||t0+1;const mx=Math.max(1,...pts.map(p=>p[1]));const X=d=>2+(Date.parse(d)-t0)/(t1-t0||1)*76,Y=v=>20-v/mx*17;const d=pts.map((p,k)=>(k?'L':'M')+X(p[0]).toFixed(1)+' '+Y(p[1]).toFixed(1)).join('');const l=pts[pts.length-1];return `<svg class="spk" viewBox="0 0 84 24" aria-hidden="true"><path d="${d}"/><circle cx="${X(l[0])}" cy="${Y(l[1])}" r="2.2"/></svg>`};
document.addEventListener('mousemove',e=>{
 const box=e.target.closest&&e.target.closest('.chart[data-ch]');
 document.querySelectorAll('.chart[data-ch] .tip:not([hidden])').forEach(tp=>{if(!box||!box.contains(tp)){tp.hidden=true;tp.parentNode.querySelector('.xh').setAttribute('visibility','hidden')}});
 if(box){const c=CH[box.dataset.ch];if(!c)return;const svg=box.querySelector('svg');const rc=svg.getBoundingClientRect();const x=(e.clientX-rc.left)/rc.width*c.W;
  let best=c.dates[0];for(const d of c.dates)if(Math.abs(c.X(d)-x)<Math.abs(c.X(best)-x))best=d;
  const xh=svg.querySelector('.xh');xh.setAttribute('x1',c.X(best));xh.setAttribute('x2',c.X(best));xh.setAttribute('visibility','visible');
  const tp=box.querySelector('.tip');tp.innerHTML=`<b>${fd(best)}</b>`+c.o.series.map(s=>{const v=c.at(s,best);return v===null?'':`<div><i class="sw ${s.cls}"></i>${esc(s.name)} <b>${c.o.fmt(v)}</b></div>`}).join('');tp.hidden=false;
  const px=c.X(best)/c.W*rc.width;tp.style.left=Math.min(rc.width-tp.offsetWidth-4,Math.max(4,px+12))+'px';tp.style.top='8px'}
 const bar=e.target.closest&&e.target.closest('.chart[data-bars] .bar');
 document.querySelectorAll('.chart[data-bars] .tip:not([hidden])').forEach(tp=>{if(!bar||!tp.parentNode.contains(bar))tp.hidden=true});
 if(bar){const ch=bar.closest('.chart');const tp=ch.querySelector('.tip');tp.innerHTML=bar.dataset.tip;tp.hidden=false;const rc=ch.getBoundingClientRect();tp.style.left=Math.min(rc.width-tp.offsetWidth-4,Math.max(4,e.clientX-rc.left+12))+'px';tp.style.top='8px'}
});

/* ---------- tools + body ---------- */
T['bahan-baku']=()=>{const f=F['bahan-baku'];return `<input class="inp search" id="q-bahan-baku" placeholder="Cari material / ukuran…" value="${esc(f.q)}" data-act="q" data-view="bahan-baku"><select class="sel" data-act="filtsel" data-view="bahan-baku" data-key="grade" id="f-grade"><option value="">Semua material</option>${GRADES().map(x=>`<option ${f.grade===x?'selected':''}>${esc(x)}</option>`).join('')}</select>
 <span class="grow"></span>
 <button class="btn primary" data-act="mv" data-g="rm" data-j="masuk">${ic('inb')}Terima material</button>
 <button class="btn" data-act="mv" data-g="rm" data-j="keluar">${ic('outb')}Pakai produksi</button>
 <button class="btn ghost" data-act="newitem" data-g="rm">${ic('plus')}Item baru</button>
 <button class="btn ghost" data-act="rmset" title="Lead time pembelian & target stok">Pengaturan</button>
 <button class="btn ghost" data-act="csv" data-what="rm">${ic('dl')}CSV</button>`};
function rmFilter(all){const f=F['bahan-baku'],q=f.q.toLowerCase();return S.rm.filter(r=>{if(!all&&!rmOn(r)&&f.st!=='Nonaktif')return false;if(q&&!rmLabel(r).toLowerCase().includes(q)&&!String(r.lokasi||'').toLowerCase().includes(q))return false;if(f.grade&&grade(r)!==f.grade)return false;return true})}
B['bahan-baku']=()=>{
 const f=F['bahan-baku'],R=rmCalc(),I=Object.values(R.info).filter(x=>!x.off);
 const totKg=I.reduce((a,x)=>a+x.kg,0),c30=I.reduce((a,x)=>a+x.cons30*x.kg1,0),c90=I.reduce((a,x)=>a+x.cons90*x.kg1,0);
 const need=I.filter(x=>x.sug>0),crit=I.filter(x=>x.st==='Habis'||x.st==='Kritis'),dead=I.filter(x=>x.st==='Tidak bergerak');
 const val=I.reduce((a,x)=>a+x.kg*(+x.r.harga||0),0);
 // SPK demand summary
 const c2=calc();let spkDemTot=0,spkDemKurang=0;
 S.spk.forEach(s=>{const sx=c2.spk[s._id];if(sx.st==='Selesai'||sx.st==='Batal'||(s.status||'Terbit')!=='Terbit')return;sx.lines.forEach(l=>{const sisa=Math.max(0,l.q-l.prodEff);const wE=+l.wEst>0?+l.wEst:+l.w;if(!sisa||!wE)return;spkDemTot+=sisa*wE});spkDemKurang+=(sx.st!=='Selesai'&&sx.st!=='Batal'?1:0)});
 const spkAktif=S.spk.filter(s=>{const sx=c2.spk[s._id];return (s.status||'Terbit')==='Terbit'&&sx.st!=='Selesai'&&sx.st!=='Batal'}).length;
 const kpi=(cls,lb,v,unit,s,tab)=>`<button class="kpi ${cls}" ${tab?`data-act="filt" data-view="bahan-baku" data-key="tab" data-val="${tab}"`:''}><span class="lb">${lb}</span><span class="v">${v}${unit?`<small>${unit}</small>`:''}</span><span class="s">${s}</span></button>`;
 const head=`<section class="kpis">
  ${kpi('info','Total stok',ton(totKg),'ton',`${n(I.reduce((a,x)=>a+Math.max(0,x.stok),0))} lembar${val?` · Rp ${n(Math.round(val/1e6))} jt`:''}`,'stok')}
  ${kpi(crit.length?'crit':'ok','Habis / di bawah minimum',crit.length,'item',crit.slice(0,2).map(x=>esc(x.r.item.replace('Plat ','')+' '+thkR(x.r)+'mm')).join(', ')||'tidak ada','stok')}
  ${kpi(need.length?'warn':'ok','Perlu order',need.length,'item',`usulan ${n(need.reduce((a,x)=>a+x.sug,0))} lbr · ${ton(need.reduce((a,x)=>a+x.sug*x.kg1,0))} ton`,'beli')}
  ${kpi('info','Rata-rata pemakaian',ton(c30),'ton/bln',`± ${ton(c90)} ton per 3 bulan`,'analisa')}
  ${kpi(spkAktif?'info':'ok','SPK aktif butuh material',ton(spkDemTot),'ton',spkAktif?`dari ${spkAktif} SPK yang sedang berjalan`:'tidak ada SPK aktif','analisa')}
  ${kpi(dead.length?'warn':'ok','Stok tidak bergerak',ton(dead.reduce((a,x)=>a+x.kg,0)),'ton',`${dead.length} item tanpa pemakaian 90 hari`,'analisa')}
 </section>`;
 const tabs=[['stok','Posisi stok'],['analisa','Analisa'],['kartu','Kartu Stok'],['beli','Rencana pembelian'+(need.length?` (${need.length})`:'')],['plate','Serah terima plate'+(platAntrian().length?' ('+platAntrian().length+')':'')],['susut','Susut'+(susutRows().filter(r=>r.status==='Berlebih').length?' ('+susutRows().filter(r=>r.status==='Berlebih').length+')':'')],['opname','Stock opname'],['mutasi','Riwayat mutasi']];
 const tabH=`<div class="tabs">${tabs.map(([v,l])=>`<button data-act="filt" data-view="bahan-baku" data-key="tab" data-val="${v}" class="${f.tab===v?'on':''}">${l}</button>`).join('')}</div>`;
 const body={stok:rmStok,analisa:rmAnalisa,kartu:rmKartuStok,beli:rmBeli,plate:platTab,susut:susutTab,opname:rmOpname,mutasi:rmMutasi}[f.tab]||rmStok;
 return head+`<section class="panel">${tabH}${body()}</section>`;
};
function rmStok(){
 const f=F['bahan-baku'],R=rmCalc();let rows=rmFilter().map(r=>R.info[r._id]);
 const cnt=s=>rows.filter(x=>x.st===s).length;
 const chips=`<div class="summ">${[['','Semua',rows.length,'plain'],['Habis','Habis',cnt('Habis'),'crit'],['Kritis','Di bawah minimum',cnt('Kritis'),'crit'],['Perlu order','Perlu order',cnt('Perlu order'),'warn'],['Aman','Aman',cnt('Aman'),'ok'],['Tidak bergerak','Tidak bergerak',cnt('Tidak bergerak'),'plain'],['Kosong','Kosong (tidak dipakai)',cnt('Kosong'),'plain'],['Nonaktif','Nonaktif',S.rm.filter(r=>!rmOn(r)).length,'plain']].filter(x=>x[0]===''||x[2]).map(([v,l,c,cl])=>`<button class="chip ${f.st===v?'sel':''} ${cl}" data-act="filt" data-view="bahan-baku" data-key="st" data-val="${v}">${l} · ${c}</button>`).join('')}
  <span class="grow"></span><select class="sel sm" data-act="filtsel" data-view="bahan-baku" data-key="sort" id="f-sort"><option value="grade" ${f.sort==='grade'?'selected':''}>Urut: material & tebal</option><option value="demand" ${f.sort==='demand'?'selected':''}>Urut: dibutuhkan SPK (kg)</option><option value="kg" ${f.sort==='kg'?'selected':''}>Urut: stok terbesar (kg)</option><option value="use" ${f.sort==='use'?'selected':''}>Urut: pemakaian terbesar</option></select></div>`;
 if(f.st)rows=rows.filter(x=>x.st===f.st);
 // demand dari SPK aktif per item RM (group by grade+tebal)
 const spkDemandKg=(x)=>{const g=famOf(grade(x.r));const base=g==='SPCC'?'SPHC':g;const th=thkR(x.r);const c2=calc();let kg=0;S.spk.forEach(s=>{const sx=c2.spk[s._id];if(sx.st==='Selesai'||sx.st==='Batal')return;sx.lines.forEach(l=>{const sisa=Math.max(0,l.q-l.prodEff);if(!sisa||!+l.w)return;const d=derive(l.g||'');const lb=d.material.startsWith('SS')?d.material:d.material==='Aluminium'?'Aluminium':'SPHC';const lth=parseFloat(thkOf(l.g)||s.tebal)||0;if(lb===base&&Math.abs(lth-th)<0.01)kg+=sisa*+l.w})});return kg};
 const srt={grade:(a,b)=>grps().indexOf(GRP(grade(a.r)))-grps().indexOf(GRP(grade(b.r)))||grade(a.r).localeCompare(grade(b.r))||thkR(a.r)-thkR(b.r)||a.r.ukuran.localeCompare(b.r.ukuran),demand:(a,b)=>(spkDemandKg(b)-spkDemandKg(a))||(b.perBln-a.perBln),kg:(a,b)=>b.kg-a.kg,use:(a,b)=>b.perBln*b.kg1-a.perBln*a.kg1}[f.sort]||(()=>0);
 rows.sort(srt);
 const demKgMap=new Map();rows.forEach(x=>demKgMap.set(x.r._id,spkDemandKg(x)));
 const demTxt=x=>{const kg=demKgMap.get(x.r._id)||0;if(!kg)return '<span class="muted">–</span>';const stKg=x.kg;const flag=stKg<=0?'crit':stKg<kg?'warn':'ok';const cls=flag==='crit'?'color:var(--crit);font-weight:700':flag==='warn'?'color:var(--warn);font-weight:700':'color:var(--ok);font-weight:700';return `<b style="${cls}">${n(Math.round(kg))} kg</b><div class="note" style="font-size:10.5px">${flag==='crit'?'Stok habis':flag==='warn'?'Stok kurang':'Stok cukup'}</div>`};
 const row=x=>`<tr class="click" data-act="kartu" data-g="rm" data-id="${x.r._id}"><td><b>${esc(x.r.item)}</b>${grade(x.r)!=='Lainnya'?` <span class="chip plain" style="font-size:10px;padding:0 6px">${esc(grade(x.r))}</span>`:''}<div class="note mono">${esc(x.r.ukuran)}${x.r.lokasi?' · Rak '+esc(x.r.lokasi):''}</div></td><td class="num">${x.kg1?x.kg1.toFixed(1):'–'}</td><td class="num">${x.min?n(x.min):'–'}</td><td class="num">${x.buf?n(x.buf):'–'}</td><td class="num big">${n(x.stok)}</td><td class="num">${n(Math.round(x.kg))}</td><td class="num">${x.perBln?n(Math.round(x.perBln)):'–'}</td><td class="num">${demTxt(x)}</td><td>${spark(x.series)}</td><td>${chip(x.st,x.cls)}${x.onOrder?`<div class="note">${n(x.onOrder)} lbr dipesan</div>`:''}</td><td class="acts-r" style="white-space:nowrap">${x.off?`<button class="btn sm ghost" data-act="rmaktif" data-id="${x.r._id}">Aktifkan</button>`:`<button class="btn sm ghost" data-act="mv" data-g="rm" data-j="keluar" data-item="${x.r._id}" title="Catat pemakaian produksi item ini">Pakai</button> <button class="btn sm ghost" data-act="mv" data-g="rm" data-j="masuk" data-item="${x.r._id}" title="Terima material item ini">Terima</button> <button class="btn sm ghost" data-act="rmedit" data-id="${x.r._id}" title="Ubah data item">Ubah</button>`}</td></tr>`;
 let body='';
 if(f.sort==='grade'){for(const g of grps()){const xs=rows.filter(x=>GRP(grade(x.r))===g);if(!xs.length)continue;body+=`<tr class="grp"><td colspan="11"><b>${g}</b><span>${xs.length} item · ${n(xs.reduce((a,x)=>a+Math.max(0,x.stok),0))} lbr · ${ton(xs.reduce((a,x)=>a+x.kg,0))} ton</span>${g==='Belum dikenali'?'<span style="color:var(--warn)">Berat dihitung seperti baja. Atur jenisnya di Master Data › Bahan baku.</span>':''}</td></tr>`+xs.map(row).join('')}}else body=rows.map(row).join('');
 return `<div class="pbody">${chips}</div>${rows.length?`<div class="tbl-wrap"><table class="rmt"><thead><tr><th>Material / ukuran (t×l×p mm)</th><th class="num">Kg/lbr</th><th class="num">Min</th><th class="num">Buffer</th><th class="num">Stok (lbr)</th><th class="num">Stok (kg)</th><th class="num">Pakai/bln</th><th class="num">Dibutuhkan SPK</th><th>Tren</th><th>Status</th><th></th></tr></thead><tbody>${body}</tbody></table></div>`:empty('Tidak ada item yang cocok','Ubah kata kunci atau filter status.')}
 <div class="pbody note">Kg/lbr = tebal × lebar × panjang (mm) ÷ 1.000.000 × massa jenis. Massa jenis saat ini: SPHC/SPCC ${n(densG('SPHC'))} · SS304 ${n(densG('SS304'))} · SS316 ${n(densG('SS316'))} · aluminium ${n(densG('Aluminium'))} g/cm³ (diatur di Master Data › Bahan baku). Pakai/bln = laju pemakaian dari histori 90 hari terakhir. "Dibutuhkan SPK" = total berat material sisa produksi dari semua SPK aktif yang belum selesai, dikelompokkan per grade & tebal.</div>`;
}
function rmAnalisa(){
 const R=rmCalc(),I=Object.values(R.info).filter(x=>!x.off),t=today();
 const dates=[...new Set(I.flatMap(x=>x.series.map(p=>p[0])))].sort();
 const at=(x,d)=>{let v=null;for(const p of x.series){if(p[0]<=d)v=p[1];else break}return v};
 const series=grps().map((g,i)=>({name:g,cls:'s'+(i+1),pts:dates.map(d=>[d,I.filter(x=>GRP(grade(x.r))===g).reduce((a,x)=>a+Math.max(0,at(x,d)||0)*x.kg1,0)/1000])})).filter(s=>s.pts.some(p=>p[1]>0));
 const line=lineChart({title:'Tren stok bahan baku (ton)',series,fmt:v=>n(Math.round(v*10)/10)+' t'});
 const months=Object.keys(R.monthly).sort().filter(m=>m>=monthKey(dates[0]||t));
 const bars=barChart({title:'Pemakaian bahan baku per bulan',bars:months.map(m=>({label:BLN3(m),v:R.monthly[m].kg/1000,est:(R.monthly[m].kgE||0)>R.monthly[m].kg*0.5,tip:`<b>${BLN3(m)}</b><div>${n(Math.round(R.monthly[m].kg/100)/10)} ton dipakai</div>${(R.monthly[m].kgE||0)>R.monthly[m].kg*0.5?'<div class="muted">estimasi bersih: selisih stok 29 Jul → 27 Okt dibagi rata per hari</div>':''}`})),fmt:v=>n(Math.round(v*10)/10)+' t'});
 const ranked=I.filter(x=>x.cons90>0).sort((a,b)=>b.cons90*b.kg1-a.cons90*a.kg1);const dead=I.filter(x=>x.fsn==='N').sort((a,b)=>b.kg-a.kg);
 const abc=`<table><thead><tr><th>Material</th><th class="num">Pemakaian / 90 hari</th><th class="num">Kg</th><th class="num">% kumulatif</th><th>Kelas</th><th class="num">Stok (kg)</th></tr></thead><tbody>${ranked.map(x=>`<tr class="click" data-act="kartu" data-g="rm" data-id="${x.r._id}"><td><b>${esc(x.r.item)}</b> <span class="mono note">${esc(x.r.ukuran)}</span></td><td class="num">${n(Math.round(x.cons90))} lbr</td><td class="num">${n(Math.round(x.cons90*x.kg1))}</td><td class="num">${Math.round(x.cum*100)}%</td><td>${chip(x.abc,x.abc==='A'?'info':'plain')}</td><td class="num">${n(Math.round(x.kg))} kg</td></tr>`).join('')}</tbody></table>`;
 const deadH=dead.length?`<table><thead><tr><th>Material</th><th class="num">Stok</th><th class="num">Kg</th><th>Terakhir berubah</th></tr></thead><tbody>${dead.map(x=>{const ch=x.series.slice().reverse().find((p,i,arr)=>arr[i+1]&&arr[i+1][1]!==p[1]);return `<tr class="click" data-act="kartu" data-g="rm" data-id="${x.r._id}"><td><b>${esc(x.r.item)}</b> <span class="mono note">${esc(x.r.ukuran)}</span></td><td class="num">${n(x.stok)} lbr</td><td class="num">${n(Math.round(x.kg))}</td><td>${ch?fd(ch[0]):'sejak Juni'}</td></tr>`}).join('')}</tbody></table>`:empty('Semua stok bergerak','Tidak ada item yang diam 90 hari.');
 // SPK demand by material+thickness
 const c=calc();const dem={};
 S.spk.forEach(s=>{const x=c.spk[s._id];if(x.st==='Selesai'||x.st==='Batal'||(s.status||'Terbit')!=='Terbit')return;x.lines.forEach(l=>{const sisa=Math.max(0,l.q-l.prodEff);if(!sisa)return;const d=derive(l.g||'');const base=d.material.startsWith('SS')?d.material:d.material==='Aluminium'?'Aluminium':'SPHC';const th=parseFloat(thkOf(l.g)||s.tebal)||0;const k=base+'|'+th;const o=dem[k]||(dem[k]={base,th,spk:new Set(),pcs:0,kg:0,lines:0,lw:0,draft:0});o.spk.add(s.no);o.pcs+=sisa;o.lines++;const wE=+l.wEst>0?+l.wEst:+l.w;if(wE){o.kg+=sisa*wE;o.lw++}if(x.st==='Draft')o.draft++})});
 const stockBy=(base,th)=>I.filter(x=>{const g=famOf(grade(x.r));const b=g==='SPCC'?'SPHC':g;return b===base&&Math.abs(thkR(x.r)-th)<0.01});
 const demRows=Object.values(dem).sort((a,b)=>a.base.localeCompare(b.base)||a.th-b.th).map(o=>{const st=stockBy(o.base,o.th);const kg=st.reduce((a,x)=>a+x.kg,0),lbr=st.reduce((a,x)=>a+Math.max(0,x.stok),0);const cov=o.lw/o.lines;const estKg=cov>0?o.kg/cov:0;
  const flag=!st.length?['Tidak ada item stok','crit']:lbr<=0?['Stok habis','crit']:cov<0.5?['Berat SPK belum lengkap','plain']:estKg>kg?['Kurang','crit']:estKg>kg*0.7?['Tipis','warn']:['Cukup','ok'];const showKg=cov>=0.5;
  return `<tr><td><b>${esc(o.base)} ${o.th||'?'} mm</b></td><td class="num">${o.spk.size}</td><td class="num">${n(Math.round(o.pcs))}</td><td class="num">${showKg?n(Math.round(estKg)):'–'}<div class="note">${Math.round(cov*100)}% item ada berat${!showKg&&o.lw?' · terlalu sedikit untuk estimasi':''}</div></td><td class="num">${n(lbr)} lbr<div class="note">${n(Math.round(kg))} kg</div></td><td>${chip(flag[0],flag[1])}</td></tr>`}).join('');
 return `<div class="ana">
  <section class="ana-c"><h3>Tren stok (ton)</h3><p class="note">Histori dari 12 lembar "Data Raw Material" (18 Jun – 27 Okt) disambung transaksi aplikasi.</p>${line}<div class="legend">${series.map(s=>`<span><i class="sw ${s.cls}"></i>${esc(s.name)}</span>`).join('')}</div></section>
  <section class="ana-c"><h3>Pemakaian per bulan (ton)</h3><p class="note">Penurunan stok antar snapshot, ditambah pemakaian yang dicatat di aplikasi.</p>${bars}<div class="legend"><span><i class="sw s1"></i>Tercatat</span><span><i class="sw s1 est"></i>Estimasi bersih (Agu–Okt tanpa snapshot: pemakaian − penerimaan, dibagi rata)</span></div></section>
  <section class="ana-c wide"><h3>Kebutuhan SPK aktif vs stok plat</h3><p class="note">Item SPK yang belum selesai diproduksi, dikelompokkan per material dan tebal dari judul section SPK. Estimasi kg memakai berat/pcs yang tercatat dan diskalakan ke seluruh item.</p><div class="tbl-wrap">${demRows?`<table><thead><tr><th>Material / tebal</th><th class="num">SPK</th><th class="num">Sisa produksi (pcs)</th><th class="num">Estimasi kebutuhan (kg)</th><th class="num">Stok plat</th><th>Status</th></tr></thead><tbody>${demRows}</tbody></table>`:empty('Tidak ada SPK aktif','')}</div></section>
  <section class="ana-c"><h3>Klasifikasi pemakaian (ABC)</h3><p class="note">A = item yang menyumbang 80% kg pemakaian (fast moving), B = 80–95%, C = sisanya. Jaga stok kelas A paling ketat. Angka per 90 hari dihitung dari laju pemakaian harian.</p><div class="tbl-wrap">${ranked.length?abc:empty('Belum ada pemakaian','')}</div></section>
  <section class="ana-c"><h3>Stok tidak bergerak</h3><p class="note">Ada stok tapi tidak pernah berkurang di periode data: modal tertahan, cek apakah masih dibutuhkan.</p><div class="tbl-wrap">${deadH}</div></section>
 </div>`;
}
function rmBeli(){
 const R=rmCalc(),st=SET(),f=F['bahan-baku'];const sug=Object.values(R.info).filter(x=>x.sug>0).sort((a,b)=>(a.st==='Habis'?0:a.st==='Kritis'?1:2)-(b.st==='Habis'?0:b.st==='Kritis'?1:2)||a.cover-b.cover);
 const val=id=>f.beli[id]!==undefined?f.beli[id]:{on:true,q:R.info[id].sug};
 const tot=sug.reduce((a,x)=>{const v=val(x.r._id);return v.on?{q:a.q+(+v.q||0),kg:a.kg+(+v.q||0)*x.kg1,rp:a.rp+(+v.q||0)*x.kg1*(+x.r.harga||0)}:a},{q:0,kg:0,rp:0});
 const prs=S.pr.filter(p=>p.gudang!=='sp').sort((a,b)=>(b.tgl+(b.at||'')).localeCompare(a.tgl+(a.at||'')));
 const prRows=prs.map(p=>{const q=(p.items||[]).reduce((a,i)=>a+(+i.q||0),0),qt=(p.items||[]).reduce((a,i)=>a+Math.min(+i.q||0,+i.qTerima||0),0);const kg=(p.items||[]).reduce((a,i)=>a+(+i.q||0)*kgLbr(byId('rm',i.item)||{}),0);const open=p.status==='Diajukan'||p.status==='Dipesan';
  return `<tr class="${p.status==='Batal'?'void':''}"><td class="mono"><b>${esc(p.noPR)}</b></td><td>${fd(p.tgl)}</td><td>${esc(p.supplier||'–')}</td><td class="pri-l">${(p.items||[]).map(i=>`<div><span>${esc(rmLabel(byId('rm',i.item)).replace('Plat ',''))}</span><b>${n(i.q)}</b></div>`).join('')}</td><td class="num">${n(q)} lbr<div class="note">${ton(kg)} ton</div></td><td>${prog(q?qt/q:0,qt>=q?'ok':'')}</td><td>${fd(p.butuh)}</td><td>${stChip(p.status)}</td><td class="acts-r">${p.status==='Draf'?`<button class="btn sm primary" data-act="prajukan" data-id="${p._id}">Ajukan</button><button class="btn sm ghost" data-act="void" data-c="pr" data-id="${p._id}">Hapus draf</button>`:''}${p.status==='Diajukan'?`<button class="btn sm" data-act="prstep" data-id="${p._id}">Tandai dipesan</button>`:''}${open?`<button class="btn sm primary" data-act="prterima" data-id="${p._id}">Terima</button><button class="btn sm ghost" data-act="void" data-c="pr" data-id="${p._id}">Batalkan</button>`:''}<button class="btn sm ghost" data-act="prxlsx" data-id="${p._id}">${ic('dl')}Excel</button><button class="btn sm ghost" data-act="prpdf" data-id="${p._id}">${ic('file')}PDF</button></td></tr>`}).join('');
 return `<div class="pbody"><p class="note" style="margin:0">Usulan muncul bila stok di bawah <b>buffer</b> atau di bawah <b>titik pesan ulang</b> (minimum + pemakaian historis × lead time ${st.leadBeli} hari). Qty usulan mengisi stok sampai buffer atau target, dikurangi yang sedang dipesan. Sesuaikan dengan SPK aktif di tab Analisa. <button type="button" class="linkbtn" data-act="rmset">Ubah pengaturan</button></p></div>
 ${sug.length?`<div class="tbl-wrap"><table class="beli"><thead><tr><th></th><th>Material</th><th class="num">Stok</th><th class="num">Min / buffer</th><th class="num">Pakai/bln</th><th class="num">Dipesan</th><th>Alasan</th><th class="num">Qty usulan (lbr)</th><th class="num">Kg</th></tr></thead><tbody>${sug.map(x=>{const v=val(x.r._id);return `<tr><td><input type="checkbox" data-beli="on" data-id="${x.r._id}" id="b-on-${x.r._id}" ${v.on?'checked':''} aria-label="Pilih"></td><td><b>${esc(x.r.item)}</b> <span class="mono note">${esc(x.r.ukuran)}</span><div>${chip(x.st,x.cls)}</div></td><td class="num big">${n(x.stok)}</td><td class="num">${n(x.min)} / ${n(x.buf)}</td><td class="num">${x.perBln?n(Math.round(x.perBln)):'–'}</td><td class="num">${x.onOrder?n(x.onOrder):'–'}</td><td class="note">${esc(x.why)}</td><td class="num"><input class="inp" type="number" min="0" step="1" data-beli="q" data-id="${x.r._id}" id="b-q-${x.r._id}" value="${esc(v.q)}"></td><td class="num" data-bkg="${x.r._id}">${n(Math.round((+v.q||0)*x.kg1))}</td></tr>`}).join('')}</tbody></table></div>
  <div class="pbody beli-foot"><span id="beli-tot"><b>${n(tot.q)}</b> lembar · <b>${ton(tot.kg)}</b> ton${tot.rp?` · ± Rp ${n(Math.round(tot.rp))}`:''}</span><span class="grow"></span><button class="btn primary" data-act="prnew">${ic('plus')}Buat permintaan pembelian (PR)</button></div>`
 :empty('Tidak ada yang perlu dibeli','Semua item di atas buffer dan titik pesan ulang.')}
 <div class="pbody"><h3 class="h3">Permintaan pembelian</h3></div>
 ${prs.length?`<div class="tbl-wrap"><table><thead><tr><th>No PR</th><th>Tanggal</th><th>Supplier</th><th>Item</th><th class="num">Qty</th><th>Diterima</th><th>Dibutuhkan</th><th>Status</th><th></th></tr></thead><tbody>${prRows}</tbody></table></div>`:`<div class="pbody note">Belum ada PR. PR yang dibuat dari usulan di atas akan tercatat di sini, dan penerimaannya langsung menambah stok.</div>`}`;
}
function rmOpname(){
 const f=F['bahan-baku'],R=rmCalc(),rows=rmFilter().map(r=>R.info[r._id]).sort((a,b)=>grps().indexOf(GRP(grade(a.r)))-grps().indexOf(GRP(grade(b.r)))||grade(a.r).localeCompare(grade(b.r))||thkR(a.r)-thkR(b.r));
 let counted=0,diff=0,dkg=0;rows.forEach(x=>{const v=f.opn[x.r._id];if(v!==undefined&&v!==''){counted++;const d=+v-x.stok;if(d){diff++;dkg+=d*x.kg1}}});
 const ses=S.opname.slice().sort((a,b)=>(b.tgl+(b.at||'')).localeCompare(a.tgl+(a.at||'')));
 return `<div class="pbody" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><p class="note" style="margin:0;flex:1;min-width:280px">Isi hasil hitung fisik per item. Item yang dikosongkan tidak ikut opname. Selisih langsung disesuaikan ke stok dengan satu nomor dokumen, dan akurasinya tercatat.</p><span class="note">Lembar hitung kosong:</span><button class="btn sm ghost" data-act="opnsheetpdf" title="Cetak lembar hitung untuk dibawa petugas ke gudang">PDF</button><button class="btn sm ghost" data-act="opnsheetxlsx" title="Unduh lembar hitung dalam Excel">Excel</button></div>
 <div class="tbl-wrap"><table class="opn"><thead><tr><th>Material / ukuran</th><th>Rak</th><th class="num">Stok sistem</th><th class="num">Hitung fisik</th><th class="num">Selisih</th><th class="num">Selisih kg</th></tr></thead><tbody>${rows.map(x=>{const v=f.opn[x.r._id];const has=v!==undefined&&v!=='';const d=has?(+v-x.stok):0;return `<tr><td><b>${esc(x.r.item)}</b> <span class="mono note">${esc(x.r.ukuran)}</span></td><td>${esc(x.r.lokasi||'–')}</td><td class="num">${n(x.stok)}</td><td class="num"><input class="inp" type="number" min="0" step="1" data-opn="${x.r._id}" id="o-${x.r._id}" value="${has?esc(v):''}"></td><td class="num" data-od="${x.r._id}" style="${d<0?'color:var(--crit)':d>0?'color:var(--ok)':''}">${has?(d>0?'+':'')+n(d):''}</td><td class="num" data-ok="${x.r._id}">${has&&d?n(Math.round(d*x.kg1)):''}</td></tr>`}).join('')}</tbody></table></div>
 <div class="pbody beli-foot"><span id="opn-tot">${counted} item dihitung · ${diff} selisih · ${n(Math.round(dkg))} kg</span><span class="grow"></span><button class="btn ghost" data-act="opnfill">Isi semua = sistem</button><button class="btn ghost" data-act="opnclear">Kosongkan</button><button class="btn primary" data-act="opnsave">${ic('chk')}Simpan hasil opname</button></div>
 <div class="pbody"><h3 class="h3">Riwayat opname</h3></div>
 ${ses.length?`<div class="tbl-wrap"><table><thead><tr><th>No dokumen</th><th>Tanggal</th><th class="num">Item dihitung</th><th class="num">Item selisih</th><th class="num">Selisih kg</th><th class="num">Akurasi</th><th>Petugas</th><th>Catatan</th><th>Dokumen</th></tr></thead><tbody>${ses.map(o=>`<tr><td class="mono"><b>${esc(o.noDok)}</b></td><td>${fd(o.tgl)}</td><td class="num">${o.counted}</td><td class="num">${o.selisih}</td><td class="num">${n(Math.round(o.kg||0))}</td><td class="num"><b style="color:${o.akurasi>=0.95?'var(--ok)':o.akurasi>=0.85?'var(--warn)':'var(--crit)'}">${Math.round(o.akurasi*100)}%</b></td><td>${who(o.by)}</td><td class="note">${esc(o.ket||'')}</td><td style="white-space:nowrap">${o.selisih?`<button class="btn sm ghost" data-act="mvpdf" data-no="${esc(o.noDok)}" data-j="opname" data-id="">PDF</button> <button class="btn sm ghost" data-act="mvxlsx" data-no="${esc(o.noDok)}" data-j="opname" data-id="">Excel</button>`:'<span class="note">tanpa selisih</span>'}</td></tr>`).join('')}</tbody></table></div>`:`<div class="pbody note">Belum ada sesi opname tercatat.</div>`}`;
}
const mvSpkNo=m=>{const sp=m.spk?byId('spk',m.spk):null;if(sp&&sp.no)return String(sp.no);const x=String(m.ref||'').match(/SPK\s*([\w-]+)/i);return x?x[1]:''};
function rmMutasi(){
 const f=F['bahan-baku'],t=today();const ids=new Set(rmFilter(true).map(r=>r._id));
 const spkNos=[...new Set(S.mutasi.filter(m=>m.gudang==='rm').map(mvSpkNo).filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a),undefined,{numeric:true}));
 const mv=S.mutasi.filter(m=>m.gudang==='rm'&&ids.has(m.item)&&(!f.mvj||m.jenis===f.mvj)&&(!f.mvspk||(f.mvspk==='__non'?!mvSpkNo(m):mvSpkNo(m)===f.mvspk))&&(f.mvp==='all'||m.tgl>=addDays(t,-(+f.mvp)))).sort((a,b)=>(b.tgl+b.at).localeCompare(a.tgl+a.at));
 const sum=j=>mv.filter(m=>m.jenis===j).reduce((a,m)=>a+Math.abs(+m.delta||0)*kgLbr(byId('rm',m.item)||{}),0);
 return `<div class="pbody"><div class="summ">${segBtns('bahan-baku','mvj',[['','Semua'],['masuk','Masuk'],['keluar','Keluar'],['opname','Opname'],['koreksi','Koreksi']])}${segBtns('bahan-baku','mvp',[['30','30 hari'],['90','90 hari'],['all','Semua']])}<select class="sel" data-act="filtsel" data-view="bahan-baku" data-key="mvspk" title="Lihat pemakaian per SPK"><option value="">Semua SPK</option><option value="__non" ${f.mvspk==='__non'?'selected':''}>Tanpa SPK</option>${spkNos.map(x=>`<option value="${esc(x)}" ${f.mvspk===x?'selected':''}>SPK ${esc(x)}</option>`).join('')}</select><span class="grow"></span>${chip(`Masuk ${ton(sum('masuk'))} t`,'ok')}${chip(`Keluar ${ton(sum('keluar'))} t`,'info')}</div></div>
 ${mv.length?`<div class="tbl-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Item</th><th class="num">Qty</th><th class="num">Kg</th><th>Dokumen</th><th>Supplier / tujuan</th><th>Keterangan</th><th>Dicatat</th><th>Unduh</th></tr></thead><tbody>${mv.map(m=>{const it=byId('rm',m.item);const dl=`<button class="btn sm ghost" data-act="mvpdf" data-no="${esc(m.noDok||'')}" data-j="${esc(m.jenis)}" data-id="${m._id}" title="Cetak / simpan PDF dokumen ${esc(MVL[m.jenis]||m.jenis)}">PDF</button> <button class="btn sm ghost" data-act="mvxlsx" data-no="${esc(m.noDok||'')}" data-j="${esc(m.jenis)}" data-id="${m._id}" title="Unduh Excel dokumen ${esc(MVL[m.jenis]||m.jenis)}">Excel</button>`;return `<tr class="${m.dikoreksi?'void':''}"><td>${fd(m.tgl)}</td><td>${stChip(MVL[m.jenis]||m.jenis)}</td><td>${esc(rmLabel(it))}</td><td class="num big" style="color:${m.delta<0?'var(--crit)':'var(--ok)'}">${m.delta>0?'+':''}${n(m.delta)}</td><td class="num">${n(Math.round(Math.abs(m.delta)*kgLbr(it||{})))}</td><td>${m.noDok?`<span class="mono">${esc(m.noDok)}</span>`:''}<div class="note">${mvSpkNo(m)?chip('SPK '+esc(mvSpkNo(m)),'info'):''} ${esc(String(m.ref||'').replace(/^SPK\s*[\w-]+\s*·?\s*/i,''))}</div></td><td>${esc(m.pihak||'')}</td><td class="note" style="white-space:pre-line;min-width:220px">${esc(m.ket||'')}</td><td class="note">${who(m.by)}</td><td style="white-space:nowrap">${dl}</td></tr>`}).join('')}</tbody></table></div>`:empty('Belum ada mutasi pada periode ini','Penerimaan, pemakaian, opname, dan koreksi bahan baku tercatat di sini dengan nomor dokumennya.')}`;
}

function rmKartuStok(){
 const f=F['bahan-baku'],t=today();
 const allItems=S.rm.slice().sort((a,b)=>{const ga=grade(a),gb=grade(b);return grps().indexOf(GRP(ga))-grps().indexOf(GRP(gb))||ga.localeCompare(gb)||thkR(a)-thkR(b)||a.ukuran.localeCompare(b.ukuran)});
 const selId=f.ksItem||(allItems[0]&&allItems[0]._id)||'';
 const sel=byId('rm',selId);
 const perOpts=[['30','30 hari'],['90','90 hari'],['180','6 bulan'],['365','1 tahun'],['all','Semua']];
 const filterBar=`<div class="pbody" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
  <label class="note" style="white-space:nowrap">Material:</label>
  <select class="sel" style="flex:1;min-width:200px;max-width:400px" data-act="filtsel" data-view="bahan-baku" data-key="ksItem" id="ks-item">
   ${allItems.map(r=>`<option value="${r._id}" ${r._id===selId?'selected':''}>${esc(rmLabel(r))}</option>`).join('')}
  </select>
  <label class="note" style="white-space:nowrap">Periode:</label>
  <div class="segs">${perOpts.map(([v,l])=>`<button class="seg ${f.ksPer===v?'on':''}" data-act="filt" data-view="bahan-baku" data-key="ksPer" data-val="${v}">${l}</button>`).join('')}</div>
  <span class="grow"></span>
  <button class="btn ghost" data-act="ksxlsx" data-id="${selId}">${ic('dl',14)} Export Excel</button><button class="btn ghost" data-act="kspdf" data-id="${selId}">${ic('file',14)} Export PDF</button>
  <button class="btn ghost" data-act="ksprint" title="Cetak kartu stok">${ic('printer',14)} Cetak</button>
 </div>`;
 if(!sel)return filterBar+empty('Pilih material','Pilih dari dropdown di atas untuk melihat kartu stok.');
 const x=RMI(selId);if(!x)return filterBar+empty('Data tidak ditemukan','');
 /* build running balance from stok awal + mutasi chronological */
 const base=sel.tglStokAwal||t;
 const fromDate=f.ksPer==='all'?null:addDays(t,-(+f.ksPer));
 const allMv=S.mutasi.filter(m=>m.gudang==='rm'&&m.item===selId).sort((a,b)=>(a.tgl+a.at).localeCompare(b.tgl+b.at));
 /* calc running balance for all mutasi, then filter display */
 let run=+sel.stokAwal||0;const rows=[];
 /* opening balance row */
 rows.push({tgl:base,type:'awal',jenis:'Saldo Awal',noDok:'–',pihak:'Import Excel',ket:'',masuk:null,keluar:null,saldo:run,by:'',muted:false,id:null});
 for(const m of allMv){
  if(m.tgl<base)continue;
  const d=+m.delta||0;
  const isMasuk=m.jenis==='masuk'||(m.jenis==='koreksi'&&d>0);
  const isKeluar=m.jenis==='keluar'||(m.jenis==='koreksi'&&d<0);
  run+=d;
  rows.push({tgl:m.tgl,type:m.jenis,jenis:MVL[m.jenis]||m.jenis,noDok:m.noDok||'',pihak:m.pihak||'',ket:m.ket||m.ref||'',masuk:isMasuk?Math.abs(d):null,keluar:isKeluar?Math.abs(d):null,saldo:run,by:m.by,muted:!!m.dikoreksi,id:m._id,at:m.at})
 }
 /* always show last saldo even if no mutasi in period */
 const display=fromDate?rows.filter((r,i)=>i===0||r.tgl>=fromDate):rows;
 /* summary totals (from filtered display, exclude awal row) */
 const dataRows=display.slice(display.length>1&&display[0].type==='awal'?1:0);
 const totMasuk=dataRows.reduce((a,r)=>a+(r.masuk||0),0);
 const totKeluar=dataRows.reduce((a,r)=>a+(r.keluar||0),0);
 const kgMasuk=totMasuk*x.kg1,kgKeluar=totKeluar*x.kg1;
 const infoBar=`<div class="kv" style="margin:0 0 8px">
  <div><span>Stok saat ini</span><b class="big">${n(x.stok)} lbr</b><div class="note">${n(Math.round(x.kg))} kg</div></div>
  <div><span>Status</span>${chip(x.st,x.cls)}</div>
  <div><span>Total masuk (periode)</span><b style="color:var(--ok)">${n(totMasuk)} lbr</b><div class="note">${n(Math.round(kgMasuk))} kg</div></div>
  <div><span>Total keluar (periode)</span><b style="color:var(--crit)">${n(totKeluar)} lbr</b><div class="note">${n(Math.round(kgKeluar))} kg</div></div>
  <div><span>Kg / lembar</span><b>${x.kg1.toFixed(2)} kg</b></div>
  <div><span>Kelas ABC</span><b>${x.abc!=='–'?x.abc:'–'} / ${x.fsn==='N'?'Non-moving':x.fsn||'–'}</b></div>
 </div>`;
 const typeColor=type=>type==='masuk'?'var(--ok)':type==='keluar'?'var(--crit)':type==='koreksi'?'var(--warn)':'inherit';
 const tblRows=display.map(r=>`<tr class="${r.muted?'void':''}">
  <td>${fd(r.tgl)}</td>
  <td><span class="chip" style="background:${r.type==='awal'?'var(--bg2)':r.type==='masuk'?'rgba(34,197,94,.13)':r.type==='keluar'?'rgba(239,68,68,.13)':r.type==='opname'?'rgba(251,191,36,.13)':'rgba(99,102,241,.13)'};color:${r.type==='awal'?'var(--fg2)':typeColor(r.type)}">${esc(r.jenis)}</span></td>
  <td>${r.noDok?`<span class="mono">${esc(r.noDok)}</span>`:''}</td>
  <td>${esc(r.pihak)}</td>
  <td class="note">${esc(r.ket)}</td>
  <td class="num" style="color:var(--ok);font-weight:600">${r.masuk!=null?n(r.masuk):''}</td>
  <td class="num" style="color:var(--crit);font-weight:600">${r.keluar!=null?n(r.keluar):''}</td>
  <td class="num big"><b>${n(r.saldo)}</b><div class="note">${n(Math.round(r.saldo*x.kg1))} kg</div></td>
  <td class="note">${who(r.by)}</td>
 </tr>`).join('');
 const footer=`<tr style="background:var(--bg2)">
  <td colspan="5"><b>Total periode</b></td>
  <td class="num" style="color:var(--ok);font-weight:700">${n(totMasuk)}</td>
  <td class="num" style="color:var(--crit);font-weight:700">${n(totKeluar)}</td>
  <td class="num big"><b>${n(x.stok)}</b><div class="note">Stok akhir</div></td>
  <td></td>
 </tr>`;
 return filterBar+`<div class="pbody kartu-stok" id="ks-print-area">
  <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
   <div>
    <div style="font-size:16px;font-weight:700">${esc(rmLabel(sel))}</div>
    <div class="note">Ukuran: ${esc(sel.ukuran||'–')}${sel.lokasi?' · Rak: '+esc(sel.lokasi):''}${fromDate?' · Periode: '+fd(fromDate)+' – '+fd(t):'· Semua periode'}</div>
   </div>
   <div class="note" style="text-align:right">${esc(KOP().nama)}<br>Dicetak: ${fd(t)}</div>
  </div>
  ${infoBar}
  <div class="tbl-wrap">
   <table class="rmt">
    <thead><tr>
     <th style="min-width:88px">Tanggal</th>
     <th>Jenis</th>
     <th>No. Dokumen</th>
     <th>Supplier / Tujuan</th>
     <th>Keterangan</th>
     <th class="num" style="color:var(--ok)">Masuk (lbr)</th>
     <th class="num" style="color:var(--crit)">Keluar (lbr)</th>
     <th class="num">Saldo (lbr)</th>
     <th>Petugas</th>
    </tr></thead>
    <tbody>${tblRows||'<tr><td colspan="9" class="note" style="text-align:center;padding:24px">Belum ada transaksi pada periode ini.</td></tr>'}</tbody>
    <tfoot>${footer}</tfoot>
   </table>
  </div>
  <div class="note" style="margin-top:8px">Saldo berjalan dihitung mulai dari stok awal ${fd(base)} (import Excel). Transaksi diurutkan kronologis dari terlama ke terbaru.</div>
 </div>`;
}

/* ---------- item drawer ---------- */
function kartuRm(id){openDrawer(()=>{const r=byId('rm',id);if(!r)return null;const x=RMI(id);
 const mv=S.mutasi.filter(m=>m.gudang==='rm'&&m.item===id).sort((a,b)=>(b.tgl+b.at).localeCompare(a.tgl+a.at));
 const ch=lineChart({title:'Stok '+rmLabel(r),series:[{name:'Stok',cls:'s1',pts:x.series}],fmt:v=>n(Math.round(v))+' lbr'});
 return {t:esc(rmLabel(r)),s:`Kartu stok bahan baku${r.lokasi?' · Rak '+esc(r.lokasi):''}`,b:`<div class="kv"><div><span>Stok</span><b class="big">${n(x.stok)} lbr</b><div class="note">${n(Math.round(x.kg))} kg</div></div><div><span>Status</span><b>${chip(x.st,x.cls)}</b></div><div><span>Pakai / bulan</span><b>${x.perBln?n(Math.round(x.perBln))+' lbr':'–'}</b><div class="note">${esc(x.basis)}</div></div><div><span>Cukup untuk</span><b>${isFinite(x.cover)?Math.round(x.cover)+' hari':'–'}</b></div><div><span>Min / buffer</span><b>${n(x.min)} / ${n(x.buf)}</b></div><div><span>Titik pesan ulang</span><b>${x.avgDay?n(Math.ceil(x.rop))+' lbr':'–'}</b></div><div><span>Berat / lembar</span><b>${x.kg1.toFixed(2)} kg</b></div><div><span>Kelas</span><b>${x.abc!=='–'?x.abc:x.fsn==='N'?'Tidak bergerak':'–'}</b></div></div>
 ${r.usulan?`<div class="ro">Catatan buffer dari Excel: ${esc(r.usulan)}</div>`:''}${x.sug?`<div class="ro">Usulan order <b>${n(x.sug)} lbr</b> (${ton(x.sug*x.kg1)} ton): ${esc(x.why)}.</div>`:''}
 <div><h4 class="h3">Pergerakan stok</h4>${ch}</div>
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary sm" data-act="mv" data-g="rm" data-j="masuk" data-item="${id}">${ic('inb')}Terima</button><button class="btn sm" data-act="mv" data-g="rm" data-j="keluar" data-item="${id}">${ic('outb')}Pakai</button><button class="btn sm" data-act="mv" data-g="rm" data-j="opname" data-item="${id}">${ic('chk')}Opname</button><button class="btn sm ghost" data-act="rmedit" data-id="${id}">Ubah data item</button></div>
 <div class="tbl-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th class="num">Qty</th><th>Dokumen</th><th></th></tr></thead><tbody>${mv.map(m=>`<tr class="${m.dikoreksi?'void':''}"><td>${fd(m.tgl)}</td><td>${stChip(MVL[m.jenis]||m.jenis)}</td><td class="num" style="color:${m.delta<0?'var(--crit)':'var(--ok)'}">${m.delta>0?'+':''}${n(m.delta)}</td><td>${m.noDok?`<span class="mono">${esc(m.noDok)}</span> · `:''}${esc(m.pihak||'')}<div class="note">${esc(m.ket||m.ref||'')} · ${who(m.by)}</div></td><td>${!m.dikoreksi&&m.jenis!=='koreksi'&&CAN?`<button class="btn sm ghost" data-act="koreksi" data-id="${m._id}">Koreksi</button>`:''}</td></tr>`).join('')}<tr><td>${fd(r.tglStokAwal)}</td><td>${chip('Stok awal','plain')}</td><td class="num">${n(r.stokAwal)}</td><td class="note">Import Excel</td><td></td></tr></tbody></table></div>
 <p class="note">Histori sebelum ${fd(r.tglStokAwal)} berasal dari snapshot Excel; setelahnya dari transaksi aplikasi.</p>`}})}

/* ---------- GUDANG SPAREPART (2026-11-06) ----------
   Item di koleksi `sp`; pergerakan stok di `mutasi` dengan gudang='sp' (masuk, keluar, opname, koreksi).
   Stok = stok awal + jumlah delta mutasi, sama seperti bahan baku dan barang jadi. */
const spOn=r=>r.aktif!==false;
const spLabel=r=>r?`${r.item}${r.aktif===false?' · nonaktif':''}`:'(item terhapus)';
const spSort=(a,b)=>{const ka=parseFloat(a.kode),kb=parseFloat(b.kode),na=!isNaN(ka),nb=!isNaN(kb);if(na&&nb&&ka!==kb)return ka-kb;if(na!==nb)return na?-1:1;return String(a.item).localeCompare(String(b.item))};
const spState=(r,s)=>{const m=+r.min||0,b=+r.buffer||0;if(s<=0)return['Habis','crit'];if(m>0&&s<=m)return['Stok minimum','warn'];if(b>0&&s<b)return['Di bawah buffer','warn'];return['Aman','ok']};
F['sparepart']={q:'',st:'',tab:'stok',mvj:'',mvp:'90',mvspk:'',mvmesin:'',opn:{},beli:{}};
const SP_SATUAN=['Pcs','Liter','Lusin','Set','Kg','Meter','Roll','Box','Pack'];
function spCalc(){
 const c=calc();if(c._sp)return c._sp;
 const t=today(),from30=addDays(t,-30),agg={};
 S.mutasi.forEach(m=>{if(m.gudang!=='sp')return;const a=agg[m.item]||(agg[m.item]={masuk:0,keluar:0,k30:0,last:''});const d=+m.delta||0;
  if(m.jenis==='masuk')a.masuk+=d;
  else if(m.jenis==='keluar'){a.keluar+=-d;if(m.tgl>=from30)a.k30+=-d}
  else if(m.jenis==='koreksi'){const o=S.mutasi.find(x=>x._id===m.koreksiDari);if(o&&o.jenis==='keluar'){a.keluar-=d;if(o.tgl>=from30)a.k30-=d}else if(o&&o.jenis==='masuk')a.masuk+=d}
  if(m.tgl>a.last)a.last=m.tgl});
 const info={};
 for(const r of S.sp){const stok=c.stock.sp[r._id]||0,a=agg[r._id]||{masuk:0,keluar:0,k30:0,last:''};
  let [st,cls]=spState(r,stok);if(r.aktif===false){st='Nonaktif';cls='plain'}
  info[r._id]={r,stok,min:+r.min||0,buf:+r.buffer||0,awal:+r.stokAwal||0,masuk:a.masuk,keluar:a.keluar,k30:a.k30,last:a.last,st,cls}}
 c._sp=info;return info;
}
function spFilter(all){const f=F['sparepart'],q=f.q.toLowerCase();return S.sp.filter(r=>{if(!all&&!spOn(r)&&f.st!=='Nonaktif')return false;if(q&&!spLabel(r).toLowerCase().includes(q)&&!String(r.kode||'').toLowerCase().includes(q)&&!String(r.lokasi||'').toLowerCase().includes(q))return false;return true}).sort(spSort)}
T['sparepart']=()=>{const f=F['sparepart'];return `<input class="inp search" id="q-sparepart" placeholder="Cari nama barang / kode…" value="${esc(f.q)}" data-act="q" data-view="sparepart">
 <span class="grow"></span>
 <button class="btn primary" data-act="mv" data-g="sp" data-j="masuk">${ic('inb')}Terima sparepart</button>
 <button class="btn" data-act="mv" data-g="sp" data-j="keluar">${ic('outb')}Keluarkan sparepart</button>
 <button class="btn ghost" data-act="newitem" data-g="sp">${ic('plus')}Item baru</button>
 <button class="btn ghost" data-act="spimport" title="Impor daftar dan stok dari file Excel">${ic('dl')}Impor Excel</button>
 <button class="btn ghost" data-act="spcsv">${ic('download')}CSV</button>`};
B['sparepart']=()=>{
 const f=F['sparepart'],I=Object.values(spCalc()).filter(x=>spOn(x.r));
 const low=I.filter(x=>x.st==='Stok minimum'),out=I.filter(x=>x.st==='Habis'),tot=I.reduce((a,x)=>a+Math.max(0,x.stok),0),k30=I.reduce((a,x)=>a+x.k30,0),bf=I.filter(x=>x.buf>0&&x.stok<x.buf);
 const top=I.filter(x=>x.k30>0).sort((a,b)=>b.k30-a.k30)[0];
 const kpi=(cls,lb,v,unit,s,tab)=>`<button class="kpi ${cls}" ${tab?`data-act="filt" data-view="sparepart" data-key="tab" data-val="${tab}"`:''}><span class="lb">${lb}</span><span class="v">${v}${unit?`<small>${unit}</small>`:''}</span><span class="s">${s}</span></button>`;
 const head=`<section class="kpis">
  ${kpi('info','Jenis barang',n(I.length),'jenis',`${n(tot)} unit stok`,'stok')}
  ${kpi(low.length+out.length?'warn':'ok','Stok minimum',n(low.length+out.length),'jenis',(low.length+out.length)?`sama atau di bawah minimum${out.length?` (${out.length} habis)`:''}`:'tidak ada','stok')}
  ${kpi(out.length?'crit':'ok','Habis',n(out.length),'jenis',out.slice(0,2).map(x=>esc(x.r.item)).join(', ')||'tidak ada','stok')}
  ${kpi(bf.length?'warn':'ok','Di bawah buffer',n(bf.length),'jenis',bf.length?`kurang ${n(bf.reduce((a,x)=>a+(x.buf-x.stok),0))} unit ke target`:'tidak ada','stok')}
  ${kpi('info','Keluar 30 hari',n(k30),'unit',top?`terbanyak: ${esc(top.r.item)} (${n(top.k30)})`:'belum ada pengeluaran','mutasi')}
 </section>`;
 const nbSp=spSug().filter(x=>x.sug>0).length;
 const tabs=[['stok','Posisi stok'],['tren','Tren'],['mesin','Pemakaian mesin'],['beli','Rencana pembelian'+(nbSp?` (${nbSp})`:'')],['opname','Stock opname'],['mutasi','Riwayat mutasi']];
 const tabH=`<div class="tabs">${tabs.map(([v,l])=>`<button data-act="filt" data-view="sparepart" data-key="tab" data-val="${v}" class="${f.tab===v?'on':''}">${l}</button>`).join('')}</div>`;
 const body={stok:spStok,tren:()=>trenPanel('sp'),mesin:spMesin,beli:spBeli,opname:spOpname,mutasi:spMutasi}[f.tab]||spStok;
 return head+`<section class="panel">${tabH}${body()}</section>`;
};
function spStok(){
 const f=F['sparepart'],R=spCalc();let rows=spFilter().map(r=>R[r._id]);
 const cnt=s=>rows.filter(x=>x.st===s).length,nOff=S.sp.filter(r=>!spOn(r)).length;
 const chips=`<div class="summ">${[['','Semua',rows.length,'plain'],['Habis','Habis',cnt('Habis'),'crit'],['Stok minimum','Stok minimum',cnt('Stok minimum'),'warn'],['Di bawah buffer','Di bawah buffer',cnt('Di bawah buffer'),'warn'],['Aman','Aman',cnt('Aman'),'ok'],['Nonaktif','Nonaktif',nOff,'plain']].filter(x=>x[0]===''||x[2]).map(([v,l,c,cl])=>`<button class="chip ${f.st===v?'sel':''} ${cl}" data-act="filt" data-view="sparepart" data-key="st" data-val="${v}">${l} · ${c}</button>`).join('')}</div>`;
 if(f.st)rows=rows.filter(x=>x.st===f.st);
 const row=x=>`<tr class="click" data-act="kartu" data-g="sp" data-id="${x.r._id}"><td class="num mono">${esc(x.r.kode||'–')}</td><td><b>${esc(x.r.item)}</b>${x.r.lokasi?`<div class="note">Rak ${esc(x.r.lokasi)}</div>`:''}</td><td>${esc(x.r.satuan||'')}</td><td class="num">${n(x.awal)}</td><td class="num">${x.masuk?'+'+n(x.masuk):'–'}</td><td class="num">${x.keluar?n(x.keluar):'–'}</td><td class="num big">${n(x.stok)}</td><td class="num${x.min?'':' nomin'}">${x.min?n(x.min):'–'}</td><td class="num${x.buf?'':' nomin'}">${x.buf?n(x.buf):'–'}</td><td>${spark(stockSeries('sp',x.r._id))}</td><td>${chip(x.st,x.cls)}${x.buf>0&&x.stok<x.buf&&x.r.aktif!==false?`<div class="note">kurang ${n(x.buf-x.stok)} ke buffer</div>`:''}</td><td class="acts-r" style="white-space:nowrap">${x.r.aktif===false?`<button class="btn sm ghost" data-act="spaktif" data-id="${x.r._id}">Aktifkan</button>`:`<button class="btn sm ghost" data-act="mv" data-g="sp" data-j="keluar" data-item="${x.r._id}">Keluar</button> <button class="btn sm ghost" data-act="mv" data-g="sp" data-j="masuk" data-item="${x.r._id}">Terima</button> <button class="btn sm ghost" data-act="spedit" data-id="${x.r._id}">Ubah</button>`}</td></tr>`;
 return `<div class="pbody">${chips}</div>${rows.length?`<div class="tbl-wrap"><table class="spt"><thead><tr><th class="num">No</th><th>Nama barang</th><th>Satuan</th><th class="num">Stok awal</th><th class="num">Masuk</th><th class="num">Keluar</th><th class="num">Stok akhir</th><th class="num">Minimum</th><th class="num">Buffer</th><th>Tren</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(row).join('')}</tbody></table></div>`:(S.sp.length?empty('Tidak ada barang yang cocok','Ubah kata kunci atau filter status.'):empty('Belum ada sparepart','Tambahkan dengan Item baru, atau impor daftar dan stok dari file Excel.',`<button class="btn primary" data-act="spimport">${ic('dl')}Impor Excel</button>`))}
 <div class="pbody note">Stok akhir = stok awal + masuk − keluar. Status <b>Stok minimum</b> bila stok ≤ minimum, <b>Habis</b> bila stok 0, <b>Di bawah buffer</b> bila stok masih di bawah target (buffer) walau di atas minimum. Klik baris untuk kartu stok. Item yang tidak dipakai lagi dinonaktifkan lewat <b>Ubah</b>, bukan dihapus, supaya riwayatnya utuh.</div>`;
}
function spOpname(){
 const f=F['sparepart'],R=spCalc(),rows=spFilter().map(r=>R[r._id]);
 let counted=0,diff=0;rows.forEach(x=>{const v=f.opn[x.r._id];if(v!==undefined&&v!==''){counted++;if(+v-x.stok)diff++}});
 const ses={};S.mutasi.filter(m=>m.gudang==='sp'&&m.jenis==='opname').forEach(m=>{const k=m.noDok||m._id;const o=ses[k]||(ses[k]={noDok:m.noDok,tgl:m.tgl,n:0,sel:0,ket:m.ket,by:m.by,id:m._id});o.n++;o.sel+=Math.abs(+m.delta||0)});
 const hist=Object.values(ses).sort((a,b)=>String(b.tgl).localeCompare(String(a.tgl)));
 return `<div class="pbody"><p class="note" style="margin:0">Isi hasil hitung fisik per barang. Barang yang dikosongkan tidak ikut opname. Selisih langsung disesuaikan ke stok dengan satu nomor dokumen (SP-OPN) yang bisa diunduh.</p></div>
 ${rows.length?`<div class="tbl-wrap"><table class="spo"><thead><tr><th class="num">No</th><th>Nama barang</th><th>Satuan</th><th class="num">Stok sistem</th><th class="num">Hitung fisik</th><th class="num">Selisih</th></tr></thead><tbody>${rows.map(x=>{const v=f.opn[x.r._id];const has=v!==undefined&&v!=='';const d=has?(+v-x.stok):0;return `<tr><td class="num mono">${esc(x.r.kode||'–')}</td><td><b>${esc(x.r.item)}</b></td><td>${esc(x.r.satuan||'')}</td><td class="num">${n(x.stok)}</td><td class="num"><input class="inp" type="number" min="0" step="any" inputmode="decimal" data-spopn="${x.r._id}" value="${has?esc(v):''}"></td><td class="num" data-spod="${x.r._id}" style="${d<0?'color:var(--crit)':d>0?'color:var(--ok)':''}">${has?(d>0?'+':'')+n(d):''}</td></tr>`}).join('')}</tbody></table></div>`:empty('Belum ada sparepart','Tambahkan item dulu.')}
 <div class="pbody beli-foot"><span id="spopn-tot">${counted} barang dihitung · ${diff} selisih</span><span class="grow"></span><button class="btn ghost" data-act="spopnfill">Isi semua = sistem</button><button class="btn ghost" data-act="spopnclear">Kosongkan</button><button class="btn primary" data-act="spopnsave">${ic('chk')}Simpan hasil opname</button></div>
 <div class="pbody"><h3 class="h3">Riwayat opname</h3></div>
 ${hist.length?`<div class="tbl-wrap"><table><thead><tr><th>No dokumen</th><th>Tanggal</th><th class="num">Barang selisih</th><th>Catatan</th><th>Dokumen</th></tr></thead><tbody>${hist.map(o=>`<tr><td class="mono"><b>${esc(o.noDok||'–')}</b></td><td>${fd(o.tgl)}</td><td class="num">${o.n}</td><td class="note">${esc(o.ket||'')}</td><td style="white-space:nowrap"><button class="btn sm ghost" data-act="mvpdf" data-no="${esc(o.noDok||'')}" data-j="opname" data-id="${o.id}">PDF</button> <button class="btn sm ghost" data-act="mvxlsx" data-no="${esc(o.noDok||'')}" data-j="opname" data-id="${o.id}">Excel</button></td></tr>`).join('')}</tbody></table></div>`:`<div class="pbody note">Belum ada opname dengan selisih. Opname tanpa selisih tidak membuat dokumen.</div>`}`;
}
function spOpnTot(){const f=F['sparepart'],R=spCalc();let c=0,d=0;Object.keys(f.opn).forEach(id=>{const v=f.opn[id];if(v!==undefined&&v!==''&&R[id]){c++;if(+v-R[id].stok)d++}});const el=document.querySelector('#spopn-tot');if(el)el.textContent=`${c} barang dihitung · ${d} selisih`}
document.addEventListener('input',e=>{const el=e.target;if(!el||!el.matches||!el.matches('[data-spopn]'))return;const id=el.dataset.spopn,f=F['sparepart'];f.opn[id]=el.value;const x=spCalc()[id],has=el.value!=='',d=has?(+el.value-x.stok):0,td=document.querySelector(`[data-spod="${id}"]`);if(td){td.textContent=has?(d>0?'+':'')+n(d):'';td.style.color=d<0?'var(--crit)':d>0?'var(--ok)':''}spOpnTot()});
function spOpnSave(){
 const f=F['sparepart'],R=spCalc();const diffs=[];let counted=0;
 Object.keys(f.opn).forEach(id=>{const v=f.opn[id];if(v===undefined||v===''||!R[id])return;counted++;const fis=num0(v),d=fis-R[id].stok;if(d)diffs.push({id,fis,sis:R[id].stok,d})});
 if(!counted){toast('Isi hasil hitung fisik minimal satu barang.');return}
 if(!diffs.length){toast(`${counted} barang dihitung, semuanya sama dengan sistem. Tidak ada penyesuaian.`);return}
 openModal('Simpan hasil opname sparepart',`<div class="note full">${counted} barang dihitung · <b>${diffs.length} selisih</b> akan disesuaikan ke stok dengan satu nomor dokumen.</div>`+fld('Tanggal',inp('tgl',today(),'date','required'))+fld('Catatan opname',inp('ket','','text','placeholder="mis. opname akhir bulan November"'),true),
  async d=>{const t=d.tgl||today(),noDok=await nextDocNo('SPO',t);for(const x of diffs)await addDoc('mutasi',{gudang:'sp',item:x.id,jenis:'opname',delta:x.d,tgl:t,ref:'Stock opname',spk:'',pihak:'',ket:d.ket||'',noDok,stokSistem:x.sis,stokFisik:x.fis});F['sparepart'].opn={};toast(`${noDok} tersimpan · ${diffs.length} selisih disesuaikan`)},{submit:'Simpan opname',done:' '});
}
function spMesin(){const f=F['sparepart'],t=today(),per=f.mvp==='all'?null:addDays(t,-(+f.mvp||90));
 const mv=S.mutasi.filter(m=>m.gudang==='sp'&&m.jenis==='keluar'&&!m.dikoreksi&&(!per||m.tgl>=per));
 const kunci=m=>m.mesin?m.mesin:(m.tujuan==='umum'?'__umum':'__lama');const g={};
 mv.forEach(m=>{const k=kunci(m),o=g[k]||(g[k]={n:0,qty:0,it:{},last:'',tj:{}});const q=Math.abs(+m.delta||0);o.n++;o.qty+=q;o.it[m.item]=(o.it[m.item]||0)+q;if(m.tgl>o.last)o.last=m.tgl;if(m.tujuan)o.tj[m.tujuan]=(o.tj[m.tujuan]||0)+1});
 const top=o=>Object.entries(o.it).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([id,q])=>`${esc((byId('sp',id)||{}).item||'(terhapus)')} (${n(q)})`).join(', ');
 const reg=mesinSemua().filter(m=>m.aktif||g[m.nama]);
 const baris=(nama,sub,o,nm)=>`<tr><td><b>${esc(nama)}</b>${sub?`<div class="note">${esc(sub)}</div>`:''}</td><td class="num">${o?n(o.n):'–'}</td><td class="num big">${o?n(o.qty):'–'}</td><td>${o?top(o):'<span class="muted">belum ada pemakaian</span>'}</td><td class="num">${o&&o.tj.perawatan?n(o.tj.perawatan):'–'}</td><td class="num">${o&&o.tj.perbaikan?n(o.tj.perbaikan):'–'}</td><td>${o?fd(o.last):'–'}</td><td class="acts-r">${o&&nm?`<button class="btn sm ghost" data-act="spmesinlihat" data-nm="${esc(nm)}">Riwayat</button>`:''}</td></tr>`;
 const rows=reg.map(m=>baris(m.nama,m.grup+(m.aktif?'':' · nonaktif'),g[m.nama],m.nama)).join('')+(g.__umum?baris('Umum (bukan satu mesin)','',g.__umum,''):'')+(g.__lama?baris('Tanpa mesin','pengeluaran sebelum pencatatan mesin',g.__lama,''):'');
 const tot=mv.reduce((a,m)=>a+Math.abs(+m.delta||0),0);
 return `<div class="pbody"><div class="summ">${segBtns('sparepart','mvp',[['30','30 hari'],['90','90 hari'],['all','Semua']])}<span class="grow"></span>${chip(`${n(mv.length)} pengeluaran · ${n(tot)} unit`,'info')}</div><p class="note" style="margin:6px 0 0">Sparepart yang keluar dikelompokkan per mesin (daftar mesin diatur di Master Data › Mesin). Dipakai untuk melihat mesin mana yang paling banyak memakai sparepart dan merencanakan stok minimum.</p></div>${rows?`<div class="tbl-wrap"><table><thead><tr><th>Mesin</th><th class="num">Pengeluaran</th><th class="num">Total unit</th><th>Barang terbanyak</th><th class="num">Perawatan</th><th class="num">Perbaikan</th><th>Terakhir</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`:empty('Belum ada mesin','Daftarkan mesin di Master Data › Mesin.')}`}
function spMutasi(){return gudangMutasi('sp')}
/* ---------- Tren, riwayat mutasi umum, rencana produksi stok dan rencana pembelian (2026-11-06) ----------
   Dipakai Gudang Sparepart (g='sp') dan Gudang Barang Jadi (g='fg'). */
Object.assign(F['barang-jadi'],{mvj:'',mvp:'90',mvspk:'',beli:{}});
function stockSeries(g,id){
 const it=byId(g,id);if(!it)return [];
 const mv=S.mutasi.filter(m=>m.gudang===g&&m.item===id).sort((a,b)=>(a.tgl+(a.at||'')).localeCompare(b.tgl+(b.at||'')));
 let base=it.tglStokAwal||today();if(mv[0]&&mv[0].tgl<base)base=mv[0].tgl;
 let run=+it.stokAwal||0;const ser=[[base,run]];
 mv.forEach(m=>{run+=+m.delta||0;const l=ser[ser.length-1];if(l[0]===m.tgl)l[1]=run;else ser.push([m.tgl,run])});
 const t=today();if(ser[ser.length-1][0]!==t)ser.push([t,run]);else ser[ser.length-1][1]=run;
 return ser;
}
function movAgg(g,id){
 const t=today(),d30=addDays(t,-30),d90=addDays(t,-90);let m90=0,k90=0,k30=0,kPrev=0;
 const it0=byId(g,id);let first=(it0&&it0.tglStokAwal)||t;S.mutasi.forEach(m=>{if(m.gudang===g&&m.item===id&&m.tgl<first)first=m.tgl});const umur=days(first,t);
 S.mutasi.forEach(m=>{if(m.gudang!==g||m.item!==id||m.tgl<=d90)return;const d=+m.delta||0;let out=0,inn=0;
  if(m.jenis==='keluar')out=-d;else if(m.jenis==='masuk')inn=d;
  else if(m.jenis==='koreksi'){const o=S.mutasi.find(x=>x._id===m.koreksiDari);if(o&&o.jenis==='keluar')out=-d;else if(o&&o.jenis==='masuk')inn=d}
  m90+=inn;k90+=out;if(m.tgl>d30)k30+=out;else kPrev+=out});
 return {m90,k90,k30,kPrev,umur};
}
const trenLabel=a=>{if(a.k90<=0)return['Tidak bergerak','plain'];if(a.umur<45)return['Data baru','plain'];const prev=a.kPrev/2;if(prev<=0)return a.k30>0?['Naik','warn']:['Stabil','plain'];const r=a.k30/prev;return r>1.25?['Naik','warn']:r<0.75?['Turun','info']:['Stabil','ok']};
function movMonthly(g,id){
 const t=today(),d0=new Date(t+'T00:00:00'),months=[];
 for(let i=5;i>=0;i--){const x=new Date(d0.getFullYear(),d0.getMonth()-i,1);months.push(x.getFullYear()+'-'+pad(x.getMonth()+1))}
 const agg=Object.fromEntries(months.map(m=>[m,{masuk:0,keluar:0}]));
 S.mutasi.forEach(m=>{if(m.gudang!==g||(id&&m.item!==id))return;const k=String(m.tgl).slice(0,7);if(!agg[k])return;const dd=+m.delta||0;
  if(m.jenis==='masuk')agg[k].masuk+=dd;else if(m.jenis==='keluar')agg[k].keluar+=-dd;
  else if(m.jenis==='koreksi'){const o=S.mutasi.find(x=>x._id===m.koreksiDari);if(o&&o.jenis==='keluar')agg[k].keluar+=-dd;else if(o&&o.jenis==='masuk')agg[k].masuk+=dd}});
 return months.map(k=>({k,label:BLN3(k),...agg[k]}));
}
function movChart(rows){
 const W=620,H=190,L=44,B=26,T=10,iw=W-L-8,ih=H-B-T,mx=Math.max(1,...rows.flatMap(r=>[r.masuk,r.keluar])),cw=iw/rows.length,bw=Math.min(26,cw/3);
 const y=v=>T+ih-(v/mx)*ih;
 const grid=[0,.5,1].map(f=>`<line x1="${L}" x2="${W-8}" y1="${y(mx*f)}" y2="${y(mx*f)}" stroke="currentColor" opacity=".12"/><text x="${L-6}" y="${y(mx*f)+4}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">${n(Math.round(mx*f))}</text>`).join('');
 const bars=rows.map((r,i)=>{const x0=L+i*cw+cw/2-bw-1;return `<g><rect x="${x0}" y="${y(r.masuk)}" width="${bw}" height="${Math.max(0,T+ih-y(r.masuk))}" fill="var(--ok)" rx="2"><title>${esc(r.label)}: masuk ${n(r.masuk)}</title></rect><rect x="${x0+bw+2}" y="${y(r.keluar)}" width="${bw}" height="${Math.max(0,T+ih-y(r.keluar))}" fill="var(--s1,#3987e5)" rx="2"><title>${esc(r.label)}: keluar ${n(r.keluar)}</title></rect><text x="${L+i*cw+cw/2}" y="${H-8}" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".7">${esc(r.label)}</text></g>`}).join('');
 return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:760px" role="img" aria-label="Masuk dan keluar per bulan">${grid}${bars}</svg>`;
}
function trenPanel(g){
 const lbl=r=>g==='sp'?spLabel(r):fgLabel(r),items=g==='sp'?S.sp.filter(spOn):S.fg.slice(),c=calc();
 const rows=items.map(r=>{const a=movAgg(g,r._id),st=c.stock[g][r._id]||0,perHari=a.k90/90;return {r,st,a,perBln:perHari*30,cover:perHari>0?st/perHari:Infinity,tl:trenLabel(a),ser:stockSeries(g,r._id)}}).sort((x,y)=>y.a.k90-x.a.k90||String(lbl(x.r)).localeCompare(String(lbl(y.r))));
 const mon=movMonthly(g),totM=mon.reduce((a,x)=>a+x.masuk,0),totK=mon.reduce((a,x)=>a+x.keluar,0);
 const naik=rows.filter(x=>x.tl[0]==='Naik').length,diam=rows.filter(x=>x.tl[0]==='Tidak bergerak').length;
 return `<div class="pbody"><div class="summ">${chip(`6 bulan: masuk ${n(totM)} · keluar ${n(totK)}`,'info')}${chip(`${naik} pemakaian naik`,naik?'warn':'plain')}${chip(`${diam} tidak bergerak 90 hari`,'plain')}</div></div>
 <div class="pbody"><h3 class="h3" style="margin-bottom:6px">Masuk dan keluar per bulan</h3>${movChart(mon)}<div class="note" style="display:flex;gap:14px;flex-wrap:wrap"><span><i style="display:inline-block;width:10px;height:10px;background:var(--ok);border-radius:2px"></i> Masuk</span><span><i style="display:inline-block;width:10px;height:10px;background:var(--s1,#3987e5);border-radius:2px"></i> Keluar</span></div></div>
 <div class="pbody"><h3 class="h3">Pergerakan per ${g==='sp'?'barang':'produk'} (90 hari)</h3></div>
 ${rows.length?`<div class="tbl-wrap"><table><thead><tr><th>${g==='sp'?'Barang':'Produk'}</th><th class="num">Stok</th><th class="num">Masuk 90 hr</th><th class="num">Keluar 90 hr</th><th class="num">Pakai/bln</th><th class="num">Cukup (hari)</th><th>Tren stok</th><th>Tren pakai</th></tr></thead><tbody>${rows.map(x=>`<tr class="click" data-act="kartu" data-g="${g}" data-id="${x.r._id}"><td><b>${esc(lbl(x.r))}</b></td><td class="num">${n(x.st)}</td><td class="num">${x.a.m90?'+'+n(x.a.m90):'–'}</td><td class="num">${x.a.k90?n(x.a.k90):'–'}</td><td class="num">${x.perBln?n(Math.round(x.perBln*10)/10):'–'}</td><td class="num">${isFinite(x.cover)?n(Math.round(x.cover)):'–'}</td><td>${spark(x.ser)}</td><td>${chip(x.tl[0],x.tl[1])}</td></tr>`).join('')}</tbody></table></div>`:empty('Belum ada data','Tambahkan item dan catat mutasi untuk melihat tren.')}
 <div class="pbody note">Tren pakai membandingkan keluar 30 hari terakhir dengan rata-rata per 30 hari pada 60 hari sebelumnya (naik bila lebih dari 25%, turun bila kurang dari 25%); baru dihitung setelah riwayat barang minimal 45 hari, sebelum itu tertulis Data baru. Cukup (hari) = stok ÷ pemakaian harian rata-rata 90 hari. Gunakan angka ini untuk menentukan minimum dan buffer.</div>`;
}
/* ---------- SPK stok: terima di gudang barang jadi, pilih produk, filter jenis SPK (2026-11-06) ---------- */
const spkJn=s=>{const j=F.spk.jn||'all';return j==='all'||(j==='stok')===!!s.stokReq};
const stLbl=(s,g)=>s&&s.stokReq?({'Siap kirim':'Siap masuk gudang','Kirim sebagian':'Masuk sebagian',Terkirim:'Masuk gudang'}[g]||g):g;
/* ---------- SPK customer memakai stok Gudang Barang Jadi sebagian (T-216) ----------
   Item SPK customer boleh membawa `fg` (produk gudang) dan `ambil` (jumlah diambil dari stok; sisanya diproduksi).
   - Bagian `ambil` DICADANGKAN sejak SPK terbit: stok tersedia produk berkurang, stok fisik belum.
   - Bagian `ambil` dianggap sudah jadi: target produksi dan vendor hanya (qty - ambil); progres produksi dan siap kirim ditambah ambil.
   - Stok fisik keluar otomatis (mutasi keluar bertanda SPK dan no surat jalan) saat surat jalan customer dibuat, bagian stok lebih dulu.
   - Surat jalan customer dibatalkan: mutasi keluarnya dibalik (koreksi). Tidak ada hitung ganda: kirim tetap dihitung dari surat jalan. */
const ambilItem=(s,it)=>s&&!s.stokReq&&it&&it.fg?Math.min(+it.q||0,Math.max(0,+it.ambil||0)):0;
function fgKeluarMap(){const o={};S.mutasi.forEach(m=>{if(m.gudang==='fg'&&m.spk&&m.jenis==='keluar'&&!m.dikoreksi){const k=m.spk+'|'+m.item;o[k]=(o[k]||0)-(+m.delta||0)}});return o}
/* Qty dicadangkan (belum keluar) per produk oleh SPK terbit, kecuali SPK exceptId. */
function fgResMap(exceptId){const out=fgKeluarMap(),res={};
 S.spk.forEach(s=>{if(s._id===exceptId||s.stokReq||s.status==='Batal'||(s.status||'Terbit')==='Draft')return;const per={};(s.items||[]).forEach(it=>{const a=ambilItem(s,it);if(a)per[it.fg]=(per[it.fg]||0)+a});
  Object.entries(per).forEach(([fg,a])=>{const sisa=Math.max(0,a-(out[s._id+'|'+fg]||0));if(sisa)res[fg]=(res[fg]||0)+sisa})});return res}
const fgTersedia=(fgId,exceptId)=>(calc().stock.fg[fgId]||0)-(fgResMap(exceptId)[fgId]||0);
/* Pada pembuatan surat jalan: bagian tiap baris yang diambil dari stok (stok dulu, sisanya dari produksi). */
function ambilUntukKirim(s,items){const out=fgKeluarMap(),pakai={},hasil=[];
 items.forEach(l=>{const it=(s.items||[]).find(x=>x.d===l.d);const a=ambilItem(s,it);if(!a)return;const k=s._id+'|'+it.fg;const sudah=(out[k]||0)+(pakai[k]||0);const por=Math.min(+l.q||0,Math.max(0,a-sudah));if(por>0){pakai[k]=(pakai[k]||0)+por;hasil.push({fg:it.fg,q:por,d:l.d})}});return hasil}
/* Produk gudang barang jadi dari item SPK stok. Tautan item.fg bisa hilang pada SPK yang pernah disimpan ulang di editor (sebelum perbaikan 2026-11-07);
   bila hilang, dipulihkan lewat kecocokan nama item dengan nama SPK produk (hanya bila tepat satu produk cocok). */
function fgDariItem(it){if(!it)return '';if(it.fg&&byId('fg',it.fg))return it.fg;if(!it.d)return '';const c=S.fg.filter(r=>fgSpkDesc(r)===it.d);return c.length===1?c[0]._id:''}
/* barang masuk gudang jadi dari satu SPK per produk: transaksi masuk ditambah koreksi yang membalik transaksi masuk */
const fgGot=(spkId,fgId)=>{const by={};S.mutasi.forEach(m=>{by[m._id]=m});return S.mutasi.filter(m=>m.gudang==='fg'&&m.item===fgId&&m.spk===spkId&&(m.jenis==='masuk'||(m.jenis==='koreksi'&&(by[m.koreksiDari]||{}).jenis==='masuk'))).reduce((a,m)=>a+(+m.delta||0),0)};
/* hasil produksi yang siap diterima gudang barang jadi per baris SPK: selesai produksi, dikurangi yang masih di vendor finishing */
function fgSiapMap(s){const x=calc().spk[s._id];return (s.items||[]).map((it,ix)=>{const l=x&&x.lines[ix];if(!l)return 0;return l.siapKirim!=null?l.siapKirim:Math.max(0,Math.min(+it.q||0,l.prodEff-l.vOut+l.vBack))})}
/* Baris penerimaan otomatis: tiap produk gudang dari item SPK stok dengan jumlah yang sudah selesai (dan kembali dari vendor) dikurangi yang sudah diterima. */
function fgBarisTerima(s){const rdy=fgSiapMap(s);return (s.items||[]).map((i,ix)=>({fg:fgDariItem(i),ix})).filter(x=>x.fg&&byId('fg',x.fg)).map(x=>({item:x.fg,sisa:Math.max(0,rdy[x.ix]-fgGot(s._id,x.fg))})).filter(x=>x.sisa>0)}
function fgAlasanKosong(s){const its=s.items||[];if(its.length&&its.every(i=>!fgDariItem(i)))return 'Item SPK ini belum terhubung ke produk di Gudang Barang Jadi (nama item tidak cocok dengan produk mana pun). Tambahkan produknya di Gudang Barang Jadi dengan nama yang sama, atau buat SPK stok dari tombol SPK stok.';
 const rdy=fgSiapMap(s);if(its.some((i,ix)=>fgDariItem(i)&&rdy[ix]>0))return 'Semua hasil produksi SPK ini sudah diterima di Gudang Barang Jadi.';
 return 'Belum ada hasil produksi yang siap diterima. Barang bisa diterima setelah selesai diproduksi, atau setelah kembali dari vendor finishing.'}
/* Isi form Barang masuk dari SPK stok yang dipilih: produk dan jumlahnya otomatis, bisa diubah pengguna */
function fgIsiDariSpk(f,sk,paksa){/* isian pengguna yang sudah ada (produk dan jumlah) tidak ditimpa kecuali dipaksa (tombol Terima di SPK) */
 if(!paksa&&[...document.querySelectorAll('#m-mvl tr')].some(tr=>{const s=tr.querySelector('select'),q=tr.querySelector('input');return s&&s.value&&q&&parseFloat(q.value)>0}))return;
 const lines=fgBarisTerima(sk);if(!lines.length){toast(fgAlasanKosong(sk));return}
 const box=$('#m-mvl');if(!box)return;box.innerHTML=lines.map((l,k)=>mvLine('fg',k,l.item,l.sisa)).join('');
 f.pihak.value='Produksi / finishing · SPK '+sk.no;const sel=f.querySelector('#m-mvl select');if(sel)sel.dispatchEvent(new Event('change',{bubbles:true}))}
/* T7: Terima semua = catat barang masuk (BJM) untuk setiap SPK stok yang hasilnya sudah selesai, sebesar yang siap diterima. Satu dokumen per SPK. */
function fgTerimaSemua(){
 const L=fgSiapMasukList();if(!L.length){toast('Tidak ada barang jadi yang siap diterima.');return}
 try{need('barang-jadi')}catch(e){toast('Anda tidak berhak mencatat barang masuk gudang barang jadi.');return}
 const tot=L.reduce((a,x)=>a+x.baris.reduce((b,r)=>b+r.sisa,0),0);
 openModal('Terima semua barang jadi yang siap',`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>SPK</th><th>Produk</th><th class="num">Diterima</th></tr></thead><tbody>${L.map(x=>x.baris.map((b,i)=>'<tr><td>'+(i===0?'<b>'+esc(String(x.s.no))+'</b>':'')+'</td><td>'+esc(fgLabel(byId('fg',b.item)))+'</td><td class="num">'+n(b.sisa)+'</td></tr>').join('')).join('')}</tbody></table></div><div class="note full">${L.length} SPK, total ${n(tot)} unit masuk Gudang Barang Jadi. Satu dokumen BJM per SPK.</div>`+fld('Tanggal',inp('tgl',today(),'date')),
  async d=>{const t=d.tgl||today();let doc=0;
   for(const x of L){const noDok=await nextDocNo('BJM',t);
    for(const b of x.baris)await addDoc('mutasi',{gudang:'fg',item:b.item,jenis:'masuk',delta:b.sisa,tgl:t,noDok,ref:'SPK '+x.s.no,spk:x.s._id,pihak:'',ket:'Terima semua dari SPK stok',pr:''});
    doc++}
   toast(doc+' dokumen barang masuk tersimpan');renderBody()},{submit:'Terima semua',done:' '});
}
function fgTerimaSpk(id){
 const s=byId('spk',id);if(!s)return;
 if(s.status==='Draft'){toast('SPK stok ini masih Draft. Terbitkan SPK dan produksi dulu sebelum barang diterima di gudang.');return}
 if(!fgBarisTerima(s).length){toast(fgAlasanKosong(s));return}
 mvForm('fg','masuk');
 const f=$('#mform');if(!f)return;
 f.spk.value=id;fgIsiDariSpk(f,s,true);
}
F['barang-jadi'].pick=F['barang-jadi'].pick||{};
function fgPickBar(){const el=document.querySelector('#fgpick-bar');if(!el)return;const k=Object.values(F['barang-jadi'].pick).filter(Boolean).length;el.hidden=!k;const b=el.querySelector('b');if(b)b.textContent=k}
function fgSpkPickForm(){
 const f=F['barang-jadi'];const ids=Object.keys(f.pick||{}).filter(id=>f.pick[id]&&byId('fg',id));
 const sm=Object.fromEntries(fgSug().map(x=>[x.r._id,x.sug]));
 const rows=(ids.length?ids:['']).map((id,k)=>mvLine('fg',k,id,id&&sm[id]?sm[id]:'')).join('');
 openModal('Buat SPK untuk stok gudang (Draft)',`<div class="note full">Pilih produk yang akan diproduksi untuk stok dan isi qty-nya. Produk di bawah buffer terisi otomatis sesuai usulan.</div><div class="full tbl-wrap"><table class="lines mvl"><thead><tr><th>Produk</th><th class="num">Qty diproduksi</th><th>Stok sistem</th><th></th></tr></thead><tbody id="m-mvl">${rows}</tbody></table><button type="button" class="btn sm ghost" data-act="mvadd" data-g="fg" style="margin-top:6px">${ic('plus')}Produk lain</button></div>`+
  fld('Due date (target selesai)',inp('due',addWorkdays(today(),5),'date'))+fld('Catatan untuk PPIC',inp('ket','','text','placeholder="mis. stok menipis, prioritas sebelum akhir bulan"'),true)+`<div class="note full">SPK dibuat dengan customer <b>STOK MNI</b> berstatus <b>Draft</b> dan muncul di Monitoring SPK (filter SPK Stok). Setelah diproduksi, barang jadi diterima lewat tombol <b>Terima di gudang barang jadi</b> pada SPK tersebut.</div>`,
  async (d,form)=>{const tot={};[...form.querySelectorAll('#m-mvl tr')].forEach(tr=>{const i=tr.dataset.ln,it=d['item_'+i],q=Math.round(num0(d['qty_'+i]));if(it&&q>0)tot[it]=(tot[it]||0)+q});
   const items=Object.entries(tot).map(([item,q])=>({item,q}));if(!items.length)throw new Error('Pilih minimal satu produk dengan qty lebih dari 0.');
   const r=await spkStokBuat(items,{due:d.due,ket:d.ket});f.pick={};f.beli={};toast(`SPK ${r.no} (Draft) dibuat untuk stok gudang`);setTimeout(()=>openSheet(r.id),60)},
  {submit:'Buat SPK Draft',done:' ',mount:fm=>{const upd=()=>fm.querySelectorAll('#m-mvl tr').forEach(tr=>{const v=tr.querySelector('select').value;tr.querySelector('[data-stk]').textContent=v?n(calc().stock.fg[v]):''});fm.addEventListener('change',e=>{if(e.target.matches('#m-mvl select'))upd()});upd()}});
}
/* ---------- nama penanda tangan dokumen: ketik manual, saran dari nama yang pernah diketik (2026-11-06) ---------- */
const SIGKEY='mni-signers';
const sigLoad=()=>{try{return JSON.parse(localStorage.getItem(SIGKEY))||{}}catch(e){return {}}};
const sigRole=s=>String(s).split('\n')[0].replace(/[,:\s]+$/,'').trim().toLowerCase();
function askSigners(signs,defs,cont){
 if(!signs||!signs.length)return cont([]);
 const mem=sigLoad(),by=mem.by||{},all=mem.all||[];
 openModal('Nama penanda tangan',`<div class="note full">Ketik nama yang tercetak di bawah garis tanda tangan, atau kosongkan untuk ditulis tangan. Nama yang pernah diketik muncul sebagai saran dan terisi otomatis per jabatan.</div><datalist id="dl-sig">${all.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`+
  signs.map((s,i)=>fld(esc(String(s).replace(/\n/g,' · ')),inp('sg'+i,by[sigRole(s)]||(defs&&defs[i])||'','text','list="dl-sig" autocomplete="off" placeholder="ketik nama atau pilih saran"'),true)).join(''),
  d=>{const names=signs.map((s,i)=>String(d['sg'+i]||'').trim());
   try{const m=sigLoad();m.by=m.by||{};m.all=m.all||[];names.forEach((nm,i)=>{if(!nm)return;m.by[sigRole(signs[i])]=nm;m.all=[nm,...m.all.filter(x=>x!==nm)].slice(0,60)});localStorage.setItem(SIGKEY,JSON.stringify(m))}catch(e){}
   return cont(names)},{submit:'Lanjut',done:' '});
}
/* ---- tren per item (kartu stok sparepart dan barang jadi) ---- */
function itemTrenHtml(g,id,it,stok){
 const a=movAgg(g,id),tl=trenLabel(a),perHari=a.k90/90,perBln=perHari*30,cover=perHari>0?stok/perHari:Infinity;
 const sat=esc(it.satuan||''),mon=movMonthly(g,id);
 const ch=lineChart({title:'Stok',series:[{name:'Stok',cls:'s1',pts:stockSeries(g,id)}],fmt:v=>n(Math.round(v))+' '+(it.satuan||'')});
 const tipe=g==='sp'?'sparepart':'produk';
 return `<div class="kv"><div><span>Tren pakai</span><b>${chip(tl[0],tl[1])}</b></div><div><span>Keluar 30 hari</span><b>${a.k30?n(a.k30)+' '+sat:'–'}</b></div><div><span>Rata-rata / bulan</span><b>${perBln?n(Math.round(perBln*10)/10)+' '+sat:'–'}</b><div class="note">dari 90 hari terakhir</div></div><div><span>Cukup untuk</span><b>${isFinite(cover)?Math.round(cover)+' hari':'–'}</b></div></div>
 <div><h4 class="h3">Pergerakan stok</h4>${ch}</div>
 <div><h4 class="h3">Masuk dan keluar per bulan</h4>${movChart(mon)}<div class="note" style="display:flex;gap:14px;flex-wrap:wrap"><span><i style="display:inline-block;width:10px;height:10px;background:var(--ok);border-radius:2px"></i> Masuk</span><span><i style="display:inline-block;width:10px;height:10px;background:var(--s1,#3987e5);border-radius:2px"></i> Keluar</span></div><div class="note">Gunakan rata-rata pemakaian per bulan untuk menentukan minimum dan buffer ${tipe} ini.</div></div>`;
}
/* ---- riwayat mutasi umum: tanggal, jenis, SPK, dokumen PDF/Excel ---- */
function gudangMutasi(g){
 const view=g==='sp'?'sparepart':'barang-jadi',f=F[view],t=today(),lbl=r=>r?(g==='sp'?spLabel(r):fgLabel(r)):'(item terhapus)';
 const ids=new Set((g==='sp'?spFilter(true):whRows('fg')).map(r=>r._id));
 const spkNos=[...new Set(S.mutasi.filter(m=>m.gudang===g).map(mvSpkNo).filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a),undefined,{numeric:true}));
 const mv=S.mutasi.filter(m=>m.gudang===g&&ids.has(m.item)&&(!f.mvj||m.jenis===f.mvj)&&(g==='sp'?(!f.mvmesin||(f.mvmesin==='__non'?!m.mesin:m.mesin===f.mvmesin)):(!f.mvspk||(f.mvspk==='__non'?!mvSpkNo(m):mvSpkNo(m)===f.mvspk)))&&(f.mvp==='all'||m.tgl>=addDays(t,-(+f.mvp||90)))).sort((a,b)=>(b.tgl+(b.at||'')).localeCompare(a.tgl+(a.at||'')));
 const sum=j=>mv.filter(m=>m.jenis===j).reduce((a,m)=>a+Math.abs(+m.delta||0),0);
 const mesinNames=[...new Set(S.mutasi.filter(m=>m.gudang==='sp'&&m.mesin).map(m=>m.mesin))].sort();const mesinSel=`<select class="sel" data-act="filtsel" data-view="sparepart" data-key="mvmesin" title="Lihat pemakaian per mesin"><option value="">Semua mesin</option><option value="__non" ${f.mvmesin==='__non'?'selected':''}>Tanpa mesin</option>${mesinNames.map(x=>`<option value="${esc(x)}" ${f.mvmesin===x?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
 const spkSel=`<select class="sel" data-act="filtsel" data-view="${view}" data-key="mvspk" title="Lihat mutasi per SPK"><option value="">Semua SPK</option><option value="__non" ${f.mvspk==='__non'?'selected':''}>Tanpa SPK</option>${spkNos.map(x=>`<option value="${esc(x)}" ${f.mvspk===x?'selected':''}>SPK ${esc(x)}</option>`).join('')}</select>`;
 return `<div class="pbody"><div class="summ">${segBtns(view,'mvj',[['','Semua'],['masuk','Masuk'],['keluar','Keluar'],['opname','Opname'],['koreksi','Koreksi']])}${segBtns(view,'mvp',[['30','30 hari'],['90','90 hari'],['all','Semua']])}${g==='sp'?mesinSel:spkSel}<span class="grow"></span>${chip(`Masuk ${n(sum('masuk'))}`,'ok')}${chip(`Keluar ${n(sum('keluar'))}`,'info')}</div></div>
 ${mv.length?`<div class="tbl-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>${g==='sp'?'Barang':'Produk'}</th><th class="num">Qty</th><th>Dokumen</th><th>${g==='sp'?'Mesin / PR / asal':'Asal / customer'}</th><th>Keterangan</th><th>Dicatat</th><th>Unduh</th></tr></thead><tbody>${mv.map(m=>{const it=byId(g,m.item),sk=mvSpkNo(m),sid=m.spk;return `<tr class="${m.dikoreksi?'void':''}"><td>${fd(m.tgl)}</td><td>${stChip(MVL[m.jenis]||m.jenis)}</td><td>${esc(lbl(it))}</td><td class="num big" style="color:${m.delta<0?'var(--crit)':'var(--ok)'}">${m.delta>0?'+':''}${n(m.delta)} <span class="note">${esc(it?it.satuan||'':'')}</span></td><td>${m.noDok?`<span class="mono">${esc(m.noDok)}</span>`:''}<div class="note">${sk?(sid&&byId('spk',sid)?`<button type="button" class="linkbtn" data-act="spksheet" data-id="${esc(sid)}">SPK ${esc(sk)}</button>`:chip('SPK '+esc(sk),'info')):''}${sid&&byId('spk',sid)?` <span class="note">${byId('spk',sid).stokReq?'untuk stok gudang':esc(byId('spk',sid).customer||'')}</span>`:''} ${esc(String(m.ref||'').replace(/^SPK\s*[\w-]+\s*·?\s*/i,''))}</div></td><td>${g==='sp'&&m.jenis==='keluar'&&(m.mesin||m.tujuan)?`<b>${esc(m.mesin||'Umum')}</b><div class="note">${esc(tujuanLbl(m.tujuan))}${m.oleh?' · '+esc(m.oleh):''}</div>`:esc(m.pihak||'')}${g==='sp'&&m.jenis==='masuk'&&m.pr&&byId('pr',m.pr)?`<div class="note">${esc(byId('pr',m.pr).noPR)}</div>`:''}${g==='sp'&&m.jenis==='masuk'&&m.dasar?`<div class="note">tanpa PR: ${esc((DASAR_SP.find(x=>x[0]===m.dasar)||[0,m.dasar])[1])}</div>`:''}</td><td class="note" style="white-space:pre-line;min-width:160px">${esc(m.ket||'')}</td><td class="note">${who(m.by)}</td><td style="white-space:nowrap"><button class="btn sm ghost" data-act="mvpdf" data-no="${esc(m.noDok||'')}" data-j="${esc(m.jenis)}" data-id="${m._id}">PDF</button> <button class="btn sm ghost" data-act="mvxlsx" data-no="${esc(m.noDok||'')}" data-j="${esc(m.jenis)}" data-id="${m._id}">Excel</button></td></tr>`}).join('')}</tbody></table></div>`:empty('Belum ada mutasi pada periode ini','Penerimaan, pengeluaran, opname, dan koreksi tercatat di sini dengan nomor dokumen dan SPK terkait.')}`;
}
/* ---- dokumen mutasi barang jadi ---- */
function mvDocFg(rows,noDok,h){
 const jenis=h.jenis,sp=h.spk?byId('spk',h.spk):null,spkNo=mvSpkNo(h);
 const L=rows.map(m=>{const it=byId('fg',m.item)||{};const d=+m.delta||0;return {m,nama:it.kategori?`${it.kategori}${it.type?' '+it.type:''} ${it.ukuran||''} L${it.panjang||''}`.replace(/\s+/g,' ').trim():'(item terhapus)',fin:[it.finishing,it.tebal].filter(Boolean).join(' '),satuan:it.satuan||'',d,q:Math.abs(d)}});
 const kets=[...new Set(rows.map(m=>String(m.ket||'').trim()).filter(Boolean))].join('\n');
 const kode=noDok?(jenis==='koreksi'?noDok+' (koreksi)':noDok):'MUT-'+String(h._id||'').slice(0,8).toUpperCase();
 const meta=[['No dokumen',kode],['Tanggal',tglLong(h.tgl)]];let cols,body,tot,signs;const sq=sumBy(L,x=>x.q),sd=sumBy(L,x=>x.d);
 const spkMeta=[['No SPK',spkNo||'Non-SPK'],['Customer SPK',sp?(sp.customer||'-'):'-']];
 if(jenis==='masuk'){meta.push(['Asal',h.pihak||'-'],...spkMeta,['Referensi',h.ref||'-']);cols=[['Produk','l'],['Finishing / tebal','c'],['Qty','r'],['Satuan','c']];body=L.map(x=>[x.nama,x.fin,x.q,x.satuan]);tot=['TOTAL','',sq,''];signs=['Pengirim / Produksi','Dicatat (Gudang)','Diterima (Gudang Barang Jadi)']}
 else if(jenis==='keluar'){meta.push(['Customer / tujuan',h.pihak||'-'],...spkMeta,['Referensi',h.ref||'-']);cols=[['Produk','l'],['Finishing / tebal','c'],['Qty','r'],['Satuan','c']];body=L.map(x=>[x.nama,x.fin,x.q,x.satuan]);tot=['TOTAL','',sq,''];signs=['Dicatat (Gudang)','Diserahkan','Diterima']}
 else if(jenis==='opname'){meta.push(['Keterangan sesi',h.ref||'Stock opname']);cols=[['Produk','l'],['Finishing / tebal','c'],['Stok sistem','r'],['Stok fisik','r'],['Selisih','r',1]];body=L.map(x=>[x.nama,x.fin,x.m.stokSistem==null?'':x.m.stokSistem,x.m.stokFisik==null?'':x.m.stokFisik,x.d]);tot=['TOTAL','','','',sd];signs=['Dihitung oleh','Diperiksa','Disetujui']}
 else{meta.push(['Mengoreksi dokumen',noDok||'-'],...spkMeta);cols=[['Produk','l'],['Finishing / tebal','c'],['Koreksi qty','r',1],['Satuan','c']];body=L.map(x=>[x.nama,x.fin,x.d,x.satuan]);tot=['TOTAL','',sd,''];signs=['Dicatat (Gudang)','Disetujui','Diketahui']}
 return {tgl:h.tgl,kode,jenis,title:{masuk:'BUKTI PENERIMAAN BARANG JADI',keluar:'BUKTI PENGELUARAN BARANG JADI',opname:'BERITA ACARA STOCK OPNAME BARANG JADI',koreksi:'BUKTI KOREKSI STOK BARANG JADI'}[jenis]||'DOKUMEN BARANG JADI',meta,cols,body,tot,signs,ket:kets,by:h.by?(uname(h.by)||'Pengguna'):''};
}
/* ---- SPK terkait: barang jadi yang masuk atau keluar menurut SPK ---- */
function spkFgHtml(id){
 const mv=S.mutasi.filter(m=>m.gudang==='fg'&&m.spk===id).sort((a,b)=>(b.tgl+(b.at||'')).localeCompare(a.tgl+(a.at||'')));
 if(!mv.length)return '';
 return `<div class="sec-lbl" style="margin-top:12px">Barang jadi terkait SPK ini</div><div class="tbl-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Produk</th><th class="num">Qty</th><th>Dokumen</th></tr></thead><tbody>${mv.map(m=>`<tr><td>${fd(m.tgl)}</td><td>${stChip(MVL[m.jenis]||m.jenis)}</td><td>${esc(fgLabel(byId('fg',m.item)))}</td><td class="num">${m.delta>0?'+':''}${n(m.delta)}</td><td class="mono">${esc(m.noDok||'')}</td></tr>`).join('')}</tbody></table></div>`;
}
/* ---- Barang jadi: tab dan posisi stok ---- */
function fgStok(){
 const f=F['barang-jadi'],c=calc(),rows=whRows('fg'),all=S.fg;
 const low=all.filter(r=>r.buffer>0&&c.stock.fg[r._id]<r.buffer).length,zero=all.filter(r=>c.stock.fg[r._id]<=0).length,tot=all.reduce((a,r)=>a+Math.max(0,c.stock.fg[r._id]),0);
 const summ=`<div class="summ">${chip(`${all.length} item`,'plain')}${chip(`Total ${n(tot)} btg/pcs`,'info')}<button class="chip ${f.low?'crit':'warn'}" style="cursor:pointer" data-act="filt" data-view="barang-jadi" data-key="low" data-val="${!f.low}">${low} di bawah buffer${f.low?' · tampilkan semua':''}</button>${chip(`${zero} kosong`,zero?'crit':'ok')}</div>`;
 const tr=rows.map(r=>{const s=c.stock.fg[r._id];return `<tr class="click" data-act="kartu" data-g="fg" data-id="${r._id}"><td class="pk"><input type="checkbox" data-act="fgpick" data-id="${r._id}" ${(F['barang-jadi'].pick||{})[r._id]?'checked':''} aria-label="Pilih untuk SPK stok"></td><td><b>${esc(r.kategori)}</b> ${esc(r.type)}</td><td class="mono">${esc(r.ukuran)}</td><td class="num mono">${esc(r.panjang)}</td><td>${esc(r.finishing)}</td><td class="num mono">${esc(r.tebal)}</td><td class="num">${r.buffer>0?n(r.buffer):'–'}</td><td class="num big">${n(s)}</td><td>${esc(r.satuan)}</td><td>${spark(stockSeries('fg',r._id))}</td><td>${s<=0?chip('Kosong','crit'):r.buffer>0&&s<r.buffer?chip('Di bawah buffer','warn'):chip('Ada','ok')}${r.ket?' <span class="muted">'+esc(r.ket)+'</span>':''}</td></tr>`}).join('');
 const pk=Object.values(f.pick||{}).filter(Boolean).length;
 const bar=`<div class="pbody beli-foot" id="fgpick-bar" ${pk?'':'hidden'}><span><b>${pk}</b> produk dipilih untuk SPK stok</span><span class="grow"></span><button class="btn ghost" data-act="fgpickclear">Batal pilih</button><button class="btn primary" data-act="fgspkpick">${ic('plus')}Buat SPK stok</button></div>`;
 return `<div class="pbody">${summ}<div class="note" style="margin-top:6px">Ceklis produk yang mau diproduksi untuk stok, lalu klik <b>Buat SPK stok</b>. <button type="button" class="linkbtn" data-act="fgpicklow">Pilih semua yang di bawah buffer</button></div></div>${bar}${rows.length?`<div class="tbl-wrap"><table class="fgt"><thead><tr><th></th><th>Produk</th><th>Ukuran (W×H)</th><th class="num">Panjang</th><th>Finishing</th><th class="num">Tebal</th><th class="num">Buffer</th><th class="num">Stok</th><th>Satuan</th><th>Tren</th><th>Status</th></tr></thead><tbody>${tr}</tbody></table></div>`:empty('Tidak ada item yang cocok','Ubah kata kunci atau filter.')}`;
}
function fgPending(id){
 let p=0;const c=calc();
 S.spk.forEach(s=>{if(!s.stokReq||s.status==='Batal')return;const st=(c.spk[s._id]||{}).st;if(st==='Selesai'||st==='Batal')return;
  (s.items||[]).forEach(it=>{if(fgDariItem(it)!==id)return;const got=fgGot(s._id,id);p+=Math.max(0,(+it.q||0)-got)})});
 return p;
}
function fgSug(){
 const c=calc();
 return S.fg.filter(r=>r.buffer>0&&(c.stock.fg[r._id]||0)<r.buffer).map(r=>{const st=c.stock.fg[r._id]||0,pend=fgPending(r._id),a=movAgg('fg',r._id);return {r,stok:st,buf:+r.buffer,pend,perBln:a.k90/3,sug:Math.max(0,Math.ceil(r.buffer-st-pend))}}).sort((a,b)=>a.stok/a.buf-b.stok/b.buf);
}
const fgBeliVal=(x)=>{const v=F['barang-jadi'].beli[x.r._id];return v!==undefined?v:{on:x.sug>0,q:x.sug}};
function fgSpkItems(){return fgSug().map(x=>({item:x.r._id,...fgBeliVal(x)})).filter(i=>i.on&&(+i.q||0)>0).map(i=>({item:i.item,q:Math.round(+i.q)}))}
function fgRencana(){
 const sug=fgSug(),f=F['barang-jadi'];
 const tot=sug.reduce((a,x)=>{const v=fgBeliVal(x);return v.on?a+(+v.q||0):a},0);
 const reqs=S.spk.filter(s=>s.stokReq).sort((a,b)=>(+b.no||0)-(+a.no||0));
 const c=calc();
 return `<div class="pbody"><p class="note" style="margin:0">Produk yang stoknya sudah <b>di bawah buffer</b> muncul di sini. Qty usulan mengisi stok sampai buffer, dikurangi yang sedang diproduksi lewat SPK stok. Tombol di bawah membuat <b>SPK Draft untuk stok gudang</b> (customer "STOK MNI") yang diperiksa dan diterbitkan PPIC. Barang jadi hasil produksinya dicatat lewat <b>Barang masuk</b> dengan memilih SPK tersebut, sehingga yang sedang diproduksi berkurang otomatis.</p></div>
 ${sug.length?`<div class="tbl-wrap"><table class="beli"><thead><tr><th></th><th>Produk</th><th class="num">Stok</th><th class="num">Buffer</th><th class="num">Pakai/bln</th><th class="num">Sedang diproduksi</th><th class="num">Qty usulan</th></tr></thead><tbody>${sug.map(x=>{const v=fgBeliVal(x);return `<tr><td><input type="checkbox" data-fgbeli="on" data-id="${x.r._id}" ${v.on?'checked':''} aria-label="Pilih"></td><td><b>${esc(fgLabel(x.r))}</b><div>${chip(x.stok<=0?'Kosong':'Di bawah buffer',x.stok<=0?'crit':'warn')}</div></td><td class="num big">${n(x.stok)}</td><td class="num">${n(x.buf)}</td><td class="num">${x.perBln?n(Math.round(x.perBln*10)/10):'–'}</td><td class="num">${x.pend?n(x.pend):'–'}</td><td class="num"><input class="inp" type="number" min="0" step="1" data-fgbeli="q" data-id="${x.r._id}" value="${esc(v.q)}"></td></tr>`}).join('')}</tbody></table></div>
  <div class="pbody beli-foot"><span id="fgbeli-tot"><b>${n(tot)}</b> unit diminta</span><span class="grow"></span><button class="btn primary" data-act="fgspknew">${ic('plus')}Buat SPK stok (Draft)</button></div>`:empty('Tidak ada yang perlu diproduksi untuk stok','Semua produk di atas buffer, atau buffer belum diisi (atur lewat Ubah buffer di kartu stok).')}
 <div class="pbody"><h3 class="h3">SPK untuk stok</h3></div>
 ${reqs.length?`<div class="tbl-wrap"><table><thead><tr><th>No SPK</th><th>Tanggal</th><th>Produk</th><th class="num">Diminta</th><th class="num">Sudah masuk gudang</th><th>Status</th><th></th></tr></thead><tbody>${reqs.map(s=>{const st=(c.spk[s._id]||{}).st||s.status;const q=(s.items||[]).reduce((a,i)=>a+(+i.q||0),0);const got=(s.items||[]).reduce((a,i)=>a+fgGot(s._id,i.fg),0);return `<tr><td class="mono"><b>${esc(s.no)}</b></td><td>${fd(s.tgl)}</td><td class="pri-l">${(s.items||[]).map(i=>`<div><span>${esc(i.d)}</span><b>${n(i.q)}</b></div>`).join('')}</td><td class="num">${n(q)}</td><td>${prog(q?Math.min(1,got/q):0,got>=q?'ok':'')}<div class="note">${n(got)} dari ${n(q)}</div></td><td>${stChip(s.status==='Draft'?'Draft':st)}</td><td class="acts-r"><button class="btn sm primary" data-act="spksheet" data-id="${s._id}">Buka SPK</button></td></tr>`}).join('')}</tbody></table></div>`:`<div class="pbody note">Belum ada SPK stok. SPK yang dibuat dari usulan di atas tercatat di sini.</div>`}`;
}
/* F-09/F-10: Gudang Barang Jadi punya dua tampilan turunan dari SPK. Siap kirim customer = hasil SPK customer yang sudah selesai (dan kembali dari vendor) tetapi belum dikirim; Siap masuk stok = hasil SPK stok yang belum diterima gudang. */
function fgSiapKirimList(){const c=calc();const out=[];S.spk.filter(s=>!s.stokReq&&(s.status||'Terbit')!=='Draft'&&s.status!=='Batal').sort((a,b)=>(+a.no||0)-(+b.no||0)).forEach(s=>{const x=c.spk[s._id];if(!x)return;const rows=(x.lines||[]).map((l,ix)=>{const siap=l.siapKirim!=null?l.siapKirim:Math.max(0,Math.min(+l.q||0,l.prodEff-l.vOut+l.vBack));const sisa=Math.max(0,siap-(+l.kirim||0));return {d:l.d,q:+l.q||0,siap,kirim:+l.kirim||0,sisa}}).filter(r=>r.sisa>0);if(rows.length)out.push({s,rows,tot:rows.reduce((a,r)=>a+r.sisa,0)})});return out}
function fgSiapMasukList(){return S.spk.filter(s=>s.stokReq&&(s.status||'Terbit')!=='Draft'&&s.status!=='Batal').sort((a,b)=>(+a.no||0)-(+b.no||0)).map(s=>({s,baris:fgBarisTerima(s)})).filter(x=>x.baris.length)}
function fgSiapKirimTab(){const L=fgSiapKirimList();const sel=F['barang-jadi'].skSel||{};const nSel=L.filter(x=>sel[x.s._id]).length;
 return `<div class="pbody"><p class="note" style="margin:0">Barang jadi untuk <b>customer</b> tidak disimpan sebagai stok: ia menunggu di sini setelah selesai produksi (dan kembali dari vendor finishing) sampai surat jalan dibuat. Daftar ini dihitung dari SPK, jadi selalu sama dengan Produksi dan Logistik. Stok gudang (untuk SPK stok) ada di tab Posisi stok.</p></div>
 ${L.length?`<div class="pbody" id="fg-sj-bar" style="display:flex;gap:10px;align-items:center"><span class="note">${nSel?`<b>${nSel}</b> SPK dipilih`:'Ceklis SPK yang mau dikirim (satu customer), lalu buat surat jalan.'}</span><span class="grow"></span><button class="btn primary" data-act="fgsjbuat" ${nSel?'':'disabled'}>${ic('truck')}Buat surat jalan${nSel?` (${nSel})`:''}</button></div><div class="tbl-wrap"><table id="fg-siapkirim"><thead><tr><th><input type="checkbox" data-fgsk="all" aria-label="Pilih semua"></th><th>No SPK</th><th>Customer</th><th>Item</th><th class="num">Siap kirim</th><th class="num">Sudah dikirim</th><th class="num">Menunggu kirim</th><th></th></tr></thead><tbody>${L.map(x=>x.rows.map((r,i)=>`<tr data-spk="${x.s._id}">${i===0?`<td rowspan="${x.rows.length}"><input type="checkbox" data-fgsk="${x.s._id}" ${sel[x.s._id]?'checked':''} aria-label="Pilih SPK ${esc(x.s.no)}"></td><td class="mono" rowspan="${x.rows.length}"><b>${esc(x.s.no)}</b></td><td rowspan="${x.rows.length}">${esc(x.s.customer||'')}</td>`:''}<td>${esc(r.d)}</td><td class="num">${n(r.siap)}</td><td class="num">${n(r.kirim)}</td><td class="num big">${n(r.sisa)}</td>${i===0?`<td rowspan="${x.rows.length}"><button class="btn sm ok" data-act="newkirim" data-spk="${x.s._id}">${ic('truck')}Buat surat jalan</button></td>`:''}</tr>`).join('')).join('')}</tbody></table></div>`:empty('Tidak ada barang jadi yang menunggu dikirim','Muncul di sini setelah produksi (dan finishing vendor) selesai untuk SPK customer.')}`}
function fgSjBuat(){const f=F['barang-jadi'],sel=f.skSel||{};const ids=fgSiapKirimList().map(x=>x.s._id).filter(i=>sel[i]);if(!ids.length){toast('Ceklis minimal satu SPK.');return}
 const cs=[...new Set(ids.map(i=>(byId('spk',i)||{}).customer))];if(cs.length>1){toast('Surat jalan satu customer. Ceklis SPK milik satu customer saja (terpilih: '+cs.join(', ')+').');return}
 kirimForm(ids[0]);f.skSel={};
 setTimeout(()=>{const form=$('#mform');if(!form)return;ids.slice(1).forEach(id=>{const b=form.querySelector('[data-act="addgx"]');if(b)b.click();const ss=[...form.querySelectorAll('[data-gx-sel]')],s=ss[ss.length-1];if(s){s.value=id;s.dispatchEvent(new Event('change',{bubbles:true}))}})},150)}
document.addEventListener('change',e=>{const el=e.target;if(!el||!el.dataset||el.dataset.fgsk===undefined)return;const f=F['barang-jadi'];f.skSel=f.skSel||{};if(el.dataset.fgsk==='all')fgSiapKirimList().forEach(x=>{f.skSel[x.s._id]=el.checked});else f.skSel[el.dataset.fgsk]=el.checked;renderBody()});
function fgSiapMasukTab(){const L=fgSiapMasukList();
 return `<div class="pbody"><p class="note" style="margin:0">Hasil produksi <b>SPK stok</b> yang sudah selesai tetapi belum dicatat masuk gudang. Tombol Terima mengisi formulir Barang masuk dengan SPK dan jumlahnya; cukup diperiksa lalu disimpan.</p>${L.length?`<div style="margin-top:8px"><button class="btn primary" data-act="fgterimasemua">${ic('inb')}Terima semua (${L.length} SPK)</button></div>`:''}</div>
 ${L.length?`<div class="tbl-wrap"><table id="fg-siapmasuk"><thead><tr><th>No SPK</th><th>Produk</th><th class="num">Siap diterima</th><th></th></tr></thead><tbody>${L.map(x=>`<tr data-spk="${x.s._id}"><td class="mono"><b>${esc(x.s.no)}</b></td><td class="pri-l">${x.baris.map(b=>`<div><span>${esc(fgLabel(byId('fg',b.item)))}</span><b>${n(b.sisa)}</b></div>`).join('')}</td><td class="num big">${n(x.baris.reduce((a,b)=>a+b.sisa,0))}</td><td><button class="btn sm ok" data-act="fgterima" data-spk="${x.s._id}">${ic('inb')}Terima di gudang</button></td></tr>`).join('')}</tbody></table></div>`:empty('Tidak ada hasil SPK stok yang menunggu diterima','Muncul di sini setelah SPK stok selesai diproduksi.')}`}
function fgBeliTot(){const el=document.querySelector('#fgbeli-tot');if(!el)return;const t=fgSug().reduce((a,x)=>{const v=fgBeliVal(x);return v.on?a+(+v.q||0):a},0);el.innerHTML=`<b>${n(t)}</b> unit diminta`}
const fgSpkDesc=r=>{const m=String(r.ukuran||'').match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);return m?`${r.kategori}${r.type?' '+r.type:''} W${m[1]}xH${m[2]}xL${r.panjang}`:`${r.kategori}${r.type?' '+r.type:''} ${r.ukuran||''} L${r.panjang}`.replace(/\s+/g,' ').trim()};
const FIN_PANJANG={HDG:'HOT DIP GALVANIZED',ELG:'ELECTRO GALVANIZED',PDC:'POWDER COATING'};
const fgSpkJudul=r=>`${String(r.kategori||'').toUpperCase()}${r.type?' TYPE '+String(r.type).toUpperCase():''} ${r.tebal||''} ${FIN_PANJANG[String(r.finishing||'').toUpperCase()]||String(r.finishing||'').toUpperCase()}`.replace(/\s+/g,' ').trim();
async function spkStokBuat(items,opt){
 need('spk');
 const tgl=today(),no=nextNo(),id='spk-'+no,cust='STOK MNI';
 const lines=items.map(i=>{const r=byId('fg',i.item);const d=fgSpkDesc(r),g=fgSpkJudul(r);/* berat per pcs dari kalkulator berat bila katalog terpasang (seperti SPK biasa); tanpa katalog atau item tak dikenali: 0 */const w=weightCalc(d,g);return {d,g,q:i.q,u:r.satuan||'Btg',w,...(w>0?{ws:'k'}:{}),ket:'Stok gudang',catatan:'',prod:0,fg:i.item}});
 const lead='5 Hari Kerja',due=(opt&&opt.due)||(leadMax(lead)?addWorkdays(tgl,leadMax(lead)):'');
 const d0=derive(lines[0]?lines[0].g:'');
 const data={no,nomor:`${no}/SPK/${tgl.slice(0,4)}/WS`,tgl,customer:cust,po:'STOK-'+tgl,sales:'',lead,due,material:d0.material||'',tebal:d0.tebal||'',type:[...new Set(lines.map(l=>derive(l.g).type).filter(Boolean))].join(' & '),note:'NOTE : PRODUKSI UNTUK STOK GUDANG'+((opt&&opt.ket)?' · '+opt.ket:''),dist:OPSI().dist.slice(),signProc:OPSI().signProc,signPpic:OPSI().signPpic,items:lines,status:'Draft',stokReq:true};
 const lk=await DB.doc('lock/new-'+no).acquire({holder:ME||HOLDER,ttlMs:20000}).catch(()=>null);if(lk&&lk.acquired===false)throw new Error(`Nomor ${no} sedang diklaim pengguna lain. Coba lagi.`);
 const ex=await DB.doc('spk/'+id).get();if(ex.exists)throw new Error(`SPK ${no} sudah dipakai. Coba lagi.`);
 const now=new Date().toISOString();Object.assign(data,{alasan:'',rev:0,revisi:[],at:now,by:ME||null});
 await DB.doc('spk/'+id).set(data);logAct('spk',id,'add',data);
 if(!inMaster('customer',cust))addDoc('mcustomer',{nama:cust,pic:'',telp:'',alamat:'',aktif:true}).catch(()=>{});
 return {id,no};
}
function fgSpkNewForm(){
 const items=fgSpkItems();if(!items.length){toast('Pilih minimal satu produk dengan qty > 0.');return}
 openModal('Buat SPK untuk stok gudang (Draft)',`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>Produk</th><th class="num">Qty diminta</th></tr></thead><tbody>${items.map(i=>`<tr><td>${esc(fgLabel(byId('fg',i.item)))}</td><td class="num">${n(i.q)}</td></tr>`).join('')}</tbody></table></div>`+
  fld('Due date (target selesai)',inp('due',addWorkdays(today(),5),'date'))+fld('Catatan untuk PPIC',inp('ket','','text','placeholder="mis. stok menipis, prioritas sebelum akhir bulan"'),true)+`<div class="note full">SPK dibuat dengan customer <b>STOK MNI</b> berstatus <b>Draft</b>. PPIC memeriksa dan menerbitkannya. Hasil produksi dicatat lewat Barang masuk dengan memilih SPK ini.</div>`,
  async d=>{const r=await spkStokBuat(items,{due:d.due,ket:d.ket});F['barang-jadi'].beli={};toast(`SPK ${r.no} (Draft) dibuat untuk stok gudang`);setTimeout(()=>openSheet(r.id),60)},{submit:'Buat SPK Draft',done:' '});
}
B['barang-jadi']=()=>{
 const f=F['barang-jadi'],nb=fgSug().filter(x=>x.sug>0).length;
 const nk=fgSiapKirimList().length,nm=fgSiapMasukList().length;
 const tabs=[['stok','Posisi stok'],['siap','Siap kirim customer'+(nk?` (${nk})`:'')],['masuk','Siap masuk stok'+(nm?` (${nm})`:'')],['tren','Tren'],['rencana','Rencana produksi'+(nb?` (${nb})`:'')],['mutasi','Riwayat mutasi']];
 const tabH=`<div class="tabs">${tabs.map(([v,l])=>`<button data-act="filt" data-view="barang-jadi" data-key="tab" data-val="${v}" class="${f.tab===v?'on':''}">${l}</button>`).join('')}</div>`;
 const body={stok:fgStok,siap:fgSiapKirimTab,masuk:fgSiapMasukTab,tren:()=>trenPanel('fg'),rencana:fgRencana,mutasi:()=>gudangMutasi('fg')}[f.tab]||fgStok;
 return `<section class="panel">${tabH}${body()}</section>`;
};
/* ---- Sparepart: rencana pembelian dan PR ---- */
function spOnOrder(id){let q=0;S.pr.forEach(p=>{if(p.gudang!=='sp'||(p.status!=='Draf'&&p.status!=='Diajukan'&&p.status!=='Dipesan'))return;(p.items||[]).forEach(i=>{if(i.item===id)q+=Math.max(0,(+i.q||0)-(+i.qTerima||0))})});return q}
function spSug(){
 return Object.values(spCalc()).filter(x=>spOn(x.r)&&['Habis','Stok minimum','Di bawah buffer'].includes(x.st)).map(x=>{
  const oo=spOnOrder(x.r._id),target=x.buf>0?x.buf:(x.min>0?x.min*2:0),sug=Math.max(0,Math.ceil(target-x.stok-oo)),a=movAgg('sp',x.r._id);
  return {...x,oo,target,sug,perBln:a.k90/3,why:x.buf>0?`stok di bawah buffer ${n(x.buf)}`:x.min>0?`stok ≤ minimum ${n(x.min)} (target 2× minimum karena buffer belum diisi)`:'minimum dan buffer belum diisi, isi qty manual'};
 }).sort((a,b)=>(a.st==='Habis'?0:a.st==='Stok minimum'?1:2)-(b.st==='Habis'?0:b.st==='Stok minimum'?1:2)||String(a.r.item).localeCompare(String(b.r.item)));
}
const spBeliVal=x=>{const v=F['sparepart'].beli[x.r._id];return v!==undefined?v:{on:x.sug>0,q:x.sug}};
function spBeliTot(){const el=document.querySelector('#spbeli-tot');if(!el)return;let q=0,j=0;spSug().forEach(x=>{const v=spBeliVal(x);if(v.on&&(+v.q||0)>0){q+=+v.q;j++}});el.innerHTML=`<b>${n(j)}</b> barang · <b>${n(q)}</b> unit`}
function spBeli(){
 const sug=spSug(),st=SET();
 const prs=S.pr.filter(p=>p.gudang==='sp').sort((a,b)=>(b.tgl+(b.at||'')).localeCompare(a.tgl+(a.at||'')));
 const prRows=prs.map(p=>{const q=(p.items||[]).reduce((a,i)=>a+(+i.q||0),0),qt=(p.items||[]).reduce((a,i)=>a+Math.min(+i.q||0,+i.qTerima||0),0),open=p.status==='Diajukan'||p.status==='Dipesan';
  return `<tr class="${p.status==='Batal'?'void':''}"><td class="mono"><b>${esc(p.noPR)}</b></td><td>${fd(p.tgl)}</td><td>${esc(p.supplier||'–')}</td><td class="pri-l">${(p.items||[]).map(i=>{const it=byId('sp',i.item);return `<div><span>${esc(it?it.item:'(item terhapus)')}</span><b>${n(i.q)} ${esc(it?it.satuan||'':'')}</b></div>`}).join('')}</td><td class="num">${n(q)}</td><td>${prog(q?qt/q:0,qt>=q?'ok':'')}</td><td>${fd(p.butuh)}</td><td>${stChip(p.status)}</td><td class="acts-r">${p.status==='Draf'?`<button class="btn sm primary" data-act="prajukan" data-id="${p._id}">Ajukan</button><button class="btn sm ghost" data-act="void" data-c="pr" data-id="${p._id}">Hapus draf</button>`:''}${p.status==='Diajukan'?`<button class="btn sm" data-act="prstep" data-id="${p._id}">Tandai dipesan</button>`:''}${open?`<button class="btn sm primary" data-act="prterima" data-id="${p._id}">Terima</button><button class="btn sm ghost" data-act="void" data-c="pr" data-id="${p._id}">Batalkan</button>`:''}<button class="btn sm ghost" data-act="prxlsx" data-id="${p._id}">${ic('dl')}Excel</button><button class="btn sm ghost" data-act="prpdf" data-id="${p._id}">${ic('file')}PDF</button></td></tr>`}).join('');
 let tj=0,tq=0;sug.forEach(x=>{const v=spBeliVal(x);if(v.on&&(+v.q||0)>0){tj++;tq+=+v.q}});
 return `<div class="pbody"><p class="note" style="margin:0">Usulan muncul bila stok <b>habis</b>, <b>sama atau di bawah minimum</b>, atau <b>di bawah buffer</b>. Qty usulan mengisi stok sampai <b>buffer</b> (bila buffer belum diisi, sampai 2× minimum), dikurangi yang sudah dipesan lewat PR yang masih terbuka. Penerimaan PR langsung menambah stok.</p></div>
 ${sug.length?`<div class="tbl-wrap"><table class="beli"><thead><tr><th></th><th>Barang</th><th class="num">Stok</th><th class="num">Min / buffer</th><th class="num">Pakai/bln</th><th class="num">Sudah dipesan</th><th>Alasan</th><th class="num">Qty usulan</th></tr></thead><tbody>${sug.map(x=>{const v=spBeliVal(x);return `<tr><td><input type="checkbox" data-spbeli="on" data-id="${x.r._id}" ${v.on?'checked':''} aria-label="Pilih"></td><td><b>${esc(x.r.item)}</b> <span class="note">${esc(x.r.kode?'No '+x.r.kode:'')}</span><div>${chip(x.st,x.cls)}</div></td><td class="num big">${n(x.stok)} <span class="note">${esc(x.r.satuan||'')}</span></td><td class="num">${n(x.min)} / ${n(x.buf)}</td><td class="num">${x.perBln?n(Math.round(x.perBln*10)/10):'–'}</td><td class="num">${x.oo?n(x.oo):'–'}</td><td class="note">${esc(x.why)}</td><td class="num"><input class="inp" type="number" min="0" step="any" data-spbeli="q" data-id="${x.r._id}" value="${esc(v.q)}"></td></tr>`}).join('')}</tbody></table></div>
  <div class="pbody beli-foot"><span id="spbeli-tot"><b>${n(tj)}</b> barang · <b>${n(tq)}</b> unit</span><span class="grow"></span><button class="btn primary" data-act="spprnew">${ic('plus')}Buat permintaan pembelian (PR)</button></div>`:empty('Tidak ada yang perlu dibeli','Semua barang di atas minimum dan buffer.')}
 <div class="pbody"><h3 class="h3">Permintaan pembelian sparepart</h3></div>
 ${prs.length?`<div class="tbl-wrap"><table><thead><tr><th>No PR</th><th>Tanggal</th><th>Supplier</th><th>Barang</th><th class="num">Qty</th><th>Diterima</th><th>Dibutuhkan</th><th>Status</th><th></th></tr></thead><tbody>${prRows}</tbody></table></div>`:`<div class="pbody note">Belum ada PR sparepart. PR yang dibuat dari usulan di atas tercatat di sini, dan penerimaannya langsung menambah stok.</div>`}`;
}
function spPrItems(){return spSug().map(x=>({item:x.r._id,...spBeliVal(x)})).filter(i=>i.on&&(+i.q||0)>0).map(i=>({item:i.item,q:+i.q}))}
/* T8: pengeluaran sparepart yang membuat stok sama atau di bawah minimum atau buffer meminta pembelian otomatis (PR sparepart, status Diajukan, bertanda otomatis).
   Aman diulang: usulan dikurangi PR sparepart yang masih terbuka (spOnOrder). Dilewati bila pengguna tak berhak atas modul sparepart atau setting master/setting.prOtomatis=false. */
async function prOtomatisSparepart(){
 try{
  if(((byId('master','setting')||{}).prOtomatis)===false)return null;
  try{need('sparepart')}catch(e){return null}
  const sug=spSug().filter(x=>x.sug>0);if(!sug.length)return null;
  const t=today();const noPR=await nextDocNo('PR',t);
  await addDoc('pr',{noPR,tgl:t,butuh:addDays(t,SET().leadBeli),supplier:'',items:sug.map(x=>({item:x.r._id,q:x.sug,qTerima:0})),status:'Draf',ket:'Draf otomatis: stok sparepart di bawah minimum (menunggu diajukan)',gudang:'sp',auto:true});
  toast(`${noPR} dibuat sebagai draf untuk ${sug.length} sparepart di bawah minimum; buka Gudang Sparepart untuk mengajukan`);return noPR;
 }catch(e){return null}
}
function spPrNewForm(){
 const items=spPrItems();if(!items.length){toast('Pilih minimal satu barang dengan qty > 0.');return}
 openModal('Buat permintaan pembelian sparepart (PR)',`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>Barang</th><th class="num">Qty</th><th>Satuan</th></tr></thead><tbody>${items.map(i=>{const r=byId('sp',i.item);return `<tr><td>${esc(r?r.item:'')}</td><td class="num">${n(i.q)}</td><td>${esc(r?r.satuan||'':'')}</td></tr>`}).join('')}</tbody></table></div>`+
  fld('Tanggal',inp('tgl',today(),'date'))+fld('Dibutuhkan paling lambat',inp('butuh',addDays(today(),SET().leadBeli),'date'))+fld('Supplier (opsional)',inp('supplier','','text','list="dl-sup3" autocomplete="off"'))+dl('dl-sup3',mNames('supplier'))+fld('Catatan',inp('ket'),true),
  async (d,form)=>{let sup='';if(String(d.supplier||'').trim())sup=await ensureMaster('supplier',d.supplier,form,'supplier');const t=d.tgl||today(),noPR=await nextDocNo('PR',t);
   await addDoc('pr',{noPR,tgl:t,butuh:d.butuh||'',supplier:sup,items:items.map(i=>({item:i.item,q:i.q,qTerima:0})),status:'Diajukan',ket:d.ket||'',gudang:'sp'});F['sparepart'].beli={};toast(`${noPR} dibuat`)},{submit:'Buat PR',done:' '});
}
document.addEventListener('input',e=>{const el=e.target;if(!el||!el.dataset)return;
 if(el.dataset.spbeli){const f=F['sparepart'],id=el.dataset.id,x=spSug().find(z=>z.r._id===id);const cur=f.beli[id]||{on:x?x.sug>0:true,q:x?x.sug:0};if(el.dataset.spbeli==='q')cur.q=el.value;else cur.on=el.checked;f.beli[id]=cur;spBeliTot()}
 if(el.dataset.fgbeli){const f=F['barang-jadi'],id=el.dataset.id,x=fgSug().find(z=>z.r._id===id);const cur=f.beli[id]||{on:x?x.sug>0:true,q:x?x.sug:0};if(el.dataset.fgbeli==='q')cur.q=el.value;else cur.on=el.checked;f.beli[id]=cur;fgBeliTot()}});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&(el.dataset.spbeli==='on'||el.dataset.fgbeli==='on'))el.dispatchEvent(new Event('input',{bubbles:true}))});

/* ---- item: tambah, ubah, nonaktifkan ---- */
function spItemForm(id){
 const x=id?byId('sp',id):null;
 const nextKode=String(Math.max(0,...S.sp.map(r=>parseInt(r.kode)||0))+1);
 openModal(x?`Ubah sparepart · ${esc(x.item)}`:'Sparepart baru',
  fld('Nama barang',inp('item',x?x.item:'','text','required list="dl-spn" autocomplete="off" placeholder="mis. V belt B75 20T"'))+fld('Kode / nomor barang',inp('kode',x?x.kode||'':nextKode,'text','placeholder="nomor di tabel stok"'))+
  fld('Satuan',inp('satuan',x?x.satuan||'':'Pcs','text','list="dl-sps" autocomplete="off"'))+fld('Stok minimum',inp('min',x?x.min||0:0,'number','min="0" step="any"'))+fld('Buffer (target stok)',inp('buffer',x?x.buffer||0:0,'number','min="0" step="any"'))+
  (x?'':fld('Stok awal',inp('stokAwal','0','number','min="0" step="any"')))+fld('Lokasi rak',inp('lokasi',x?x.lokasi||'':'','text','placeholder="mis. A-03"'))+
  fld('Keterangan',inp('ket',x?x.ket||'':''),true)+
  (x?`<div class="full" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="note">${x.aktif===false?'Item ini nonaktif.':'Tidak dipakai lagi?'}</span>${x.aktif===false?`<button type="button" class="btn sm ghost" data-act="spaktif" data-id="${id}">Aktifkan kembali</button>`:`<button type="button" class="btn sm ghost danger" data-act="spnonaktif" data-id="${id}">Nonaktifkan item</button>`}</div>`:'')+
  `<datalist id="dl-spn">${[...new Set(S.sp.map(r=>r.item))].map(v=>`<option value="${esc(v)}">`).join('')}</datalist><datalist id="dl-sps">${[...new Set([...SP_SATUAN,...S.sp.map(r=>r.satuan).filter(Boolean)])].map(v=>`<option value="${esc(v)}">`).join('')}</datalist>`,
  async d=>{const nm=String(d.item||'').trim().replace(/\s+/g,' '),kd=String(d.kode||'').trim();if(!nm)throw new Error('Nama barang wajib diisi.');
   const dupN=S.sp.find(r=>r._id!==id&&r.item.trim().toLowerCase()===nm.toLowerCase());if(dupN)throw new Error(`Barang "${dupN.item}" sudah ada${dupN.kode?' (No '+dupN.kode+')':''}.`);
   if(kd){const dupK=S.sp.find(r=>r._id!==id&&String(r.kode||'')===kd);if(dupK)throw new Error(`Kode ${kd} sudah dipakai "${dupK.item}".`)}
   if(num0(d.buffer)>0&&num0(d.min)>num0(d.buffer))throw new Error('Stok minimum tidak boleh lebih besar dari buffer.');
   const val={buffer:num0(d.buffer),item:nm,kode:kd,satuan:String(d.satuan||'').trim()||'Pcs',min:num0(d.min),lokasi:String(d.lokasi||'').trim(),ket:String(d.ket||'').trim()};
   if(x)await updDoc('sp',id,val);else await addDoc('sp',{...val,stokAwal:num0(d.stokAwal),tglStokAwal:today(),aktif:true});toast(x?'Sparepart disimpan':'Sparepart ditambahkan')});
}
/* ---- CSV ---- */
function spCsv(){
 const R=spCalc(),rows=S.sp.slice().sort(spSort);
 const csv=[['No','Nama barang','Satuan','Stok awal','Masuk','Keluar','Stok akhir','Stok minimum','Buffer','Kurang ke buffer','Status','Rak'].join(','),...rows.map(r=>{const x=R[r._id];return [r.kode||'',r.item,r.satuan||'',x.awal,x.masuk,x.keluar,x.stok,x.min,x.buf,x.buf>0&&x.stok<x.buf?x.buf-x.stok:0,x.st,r.lokasi||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')})].join('\n');
 const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,﻿'+encodeURIComponent(csv);a.download=`stok-sparepart-${today()}.csv`;a.click();toast('CSV sparepart diunduh');
}
/* ---- impor dari Excel (format "Tabel Stock Sparepart": lembar Stok Barang dan BARANG KELUAR) ---- */
let SPIMP=null;
const spCell=c=>{let v=c&&c.value;if(v==null)return '';if(typeof v==='object'){if(v instanceof Date)return v;if(v.richText)return v.richText.map(t=>t.text).join('');if('result' in v)return v.result==null?'':(typeof v.result==='object'&&!(v.result instanceof Date)?'':v.result);if(v.text!==undefined)return v.text;if(v.formula||v.sharedFormula)return ''}return v};
const spTxt=v=>v instanceof Date?'':String(v==null?'':v).replace(/\s+/g,' ').trim();
const spNum=v=>{if(typeof v==='number')return v;const x=parseFloat(String(v).replace(',','.'));return isNaN(x)?null:x};
const spIsoDate=d=>d instanceof Date?`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`:'';
const spSatuan=s=>{const t=spTxt(s);return t?t.charAt(0).toUpperCase()+t.slice(1).toLowerCase():'Pcs'};
async function spParse(buf){
 const X=await loadExcelJS(),wb=new X.Workbook();await wb.xlsx.load(buf);
 const wsOf=re=>wb.worksheets.find(w=>re.test(w.name.toLowerCase()));
 const wsS=wsOf(/stok/),wsK=wsOf(/keluar/),wsR=wsOf(/ringkas/);
 if(!wsS)throw new Error('Lembar "Stok Barang" tidak ditemukan di file ini.');
 const items=[],keluar=[],skipped=[];
 let hr=0;wsS.eachRow((row,r)=>{if(!hr&&/^nama barang$/i.test(spTxt(spCell(row.getCell(2)))))hr=r});
 if(!hr)throw new Error('Baris judul "Nama Barang" tidak ditemukan di lembar Stok Barang.');
 for(let r=hr+1;r<=wsS.rowCount;r++){const row=wsS.getRow(r);const a=spCell(row.getCell(1)),nm=spTxt(spCell(row.getCell(2))),c3=spTxt(spCell(row.getCell(3)));
  if(/^total$/i.test(c3))break;
  if(!nm){if(spTxt(a))skipped.push({sheet:'Stok Barang',row:r,alasan:`nomor ${spTxt(a)} tanpa nama barang`});continue}
  const e=spNum(spCell(row.getCell(5))),d=spNum(spCell(row.getCell(4))),mn=spNum(spCell(row.getCell(8)));
  items.push({kode:spTxt(a),item:nm,satuan:spSatuan(spCell(row.getCell(3))),stokAwal:e!=null?e:(d!=null?d:0),min:mn!=null?mn:0,ket:spTxt(spCell(row.getCell(10))),row:r})}
 if(wsK){let kh=0;wsK.eachRow((row,r)=>{if(!kh&&/^tanggal$/i.test(spTxt(spCell(row.getCell(1)))))kh=r});
  if(kh){let cur='';for(let r=kh+1;r<=wsK.rowCount;r++){const row=wsK.getRow(r);const tv=spCell(row.getCell(1));const iso=spIsoDate(tv);if(iso)cur=iso;
   const kode=spNum(spCell(row.getCell(2))),qty=spNum(spCell(row.getCell(4))),pihak=spTxt(spCell(row.getCell(5))),nm=spTxt(spCell(row.getCell(3)));
   if(kode==null&&!(qty>0)&&!nm&&!pihak)continue;
   if(kode==null||!(qty>0)){if(nm||pihak||qty)skipped.push({sheet:'BARANG KELUAR',row:r,alasan:`${nm||'baris'} tanpa ${kode==null?'nomor barang':'jumlah keluar'}`});continue}
   keluar.push({tgl:cur,kode:String(kode),qty,pihak,row:r})}}}
 let excelTotal=null;if(wsR)wsR.eachRow((row)=>{if(/total stok akhir/i.test(spTxt(spCell(row.getCell(1)))))excelTotal=spNum(spCell(row.getCell(2)))});
 return {items,keluar,skipped,excelTotal};
}
function spImportPlan(P){
 const byKode=new Map(S.sp.map(r=>[String(r.kode||''),r])),byNama=new Map(S.sp.map(r=>[r.item.trim().toLowerCase(),r]));
 const baru=[],ada=[];P.items.forEach(it=>{const ex=(it.kode&&byKode.get(it.kode))||byNama.get(it.item.toLowerCase());(ex?ada:baru).push({...it,ex})});
 const kodeOf=new Map();P.items.forEach(it=>kodeOf.set(it.kode,it));
 const ok=[],tak=[];P.keluar.forEach(k=>{if(kodeOf.has(k.kode)||byKode.has(k.kode))ok.push(k);else tak.push({sheet:'BARANG KELUAR',row:k.row,alasan:`nomor barang ${k.kode} tidak ada di Stok Barang`})});
 const out={};ok.forEach(k=>out[k.kode]=(out[k.kode]||0)+k.qty);
 const stokAkhir=P.items.reduce((a,it)=>a+it.stokAwal-(out[it.kode]||0),0); /* total menurut isi file, sebagai pembanding lembar Ringkasan; tidak bergantung pada stok sistem saat ini */
 return {baru,ada,ok,tak,stokAkhir};
}
function spImportForm(){
 SPIMP=null;
 openModal('Impor sparepart dari Excel',`<div class="note full">Pilih file <b>Tabel Stock Sparepart</b> (lembar <b>Stok Barang</b> dan <b>BARANG KELUAR</b>). Daftar barang, satuan, stok awal, dan stok minimum dibaca dari Stok Barang; pengeluaran dari BARANG KELUAR dicatat sebagai mutasi keluar dengan tanggal dan tujuannya. Barang yang sudah ada (kode atau nama sama) tidak dibuat ganda, dan pengeluaran yang sudah pernah diimpor dilewati, jadi aman diulang.</div>
  <div class="fld full"><label>File Excel (.xlsx)</label><input class="inp" type="file" id="sp-file" accept=".xlsx"></div><div class="full" id="sp-prev"></div>`,
  async()=>{if(!SPIMP||!SPIMP.plan)throw new Error('Pilih file Excel dulu.');const {P,plan}=SPIMP;
   const ks=plan.ok.map(k=>k.tgl).filter(Boolean).sort();const mulai=(ks[0]||today()).slice(0,7)+'-01';
   const idOf={};S.sp.forEach(r=>{if(r.kode)idOf[String(r.kode)]=r._id});
   let nb=0;for(const it of plan.baru){const r=await addDoc('sp',{kode:it.kode,item:it.item,satuan:it.satuan,min:it.min,lokasi:'',ket:it.ket||'',stokAwal:it.stokAwal,tglStokAwal:mulai,aktif:true});idOf[it.kode]=r.id;nb++}
   plan.ada.forEach(it=>{if(it.ex&&it.kode)idOf[it.kode]=it.ex._id});
   const groups={};plan.ok.forEach(k=>{const g=(k.tgl||today())+'|'+k.pihak;(groups[g]=groups[g]||[]).push(k)});
   let nm=0,sk=0;for(const g of Object.keys(groups).sort()){const [tgl,pihak]=g.split('|');const noDok=await nextDocNo('SPX',tgl);
    for(const k of groups[g]){const id=idOf[k.kode];if(!id)continue;const dup=S.mutasi.some(m=>m.gudang==='sp'&&m.item===id&&m.jenis==='keluar'&&m.tgl===tgl&&-m.delta===k.qty&&(m.pihak||'')===pihak&&m.ref==='Impor Excel');if(dup){sk++;continue}
     await addDoc('mutasi',{gudang:'sp',item:id,jenis:'keluar',delta:-k.qty,tgl,noDok,ref:'Impor Excel',spk:'',pihak,ket:''});nm++}}
   SPIMP=null;toast(`Impor selesai: ${nb} barang baru, ${nm} pengeluaran dicatat${sk?`, ${sk} dilewati (sudah ada)`:''}`)},
  {submit:'Impor ke sistem',done:' ',mount:f=>{const inpf=f.querySelector('#sp-file'),prev=f.querySelector('#sp-prev');
   inpf.addEventListener('change',async()=>{SPIMP=null;const file=inpf.files&&inpf.files[0];if(!file){prev.innerHTML='';return}
    prev.innerHTML='<div class="note">Membaca file…</div>';
    try{const P=await spParse(await file.arrayBuffer());const plan=spImportPlan(P);SPIMP={P,plan};
     const tot=plan.stokAkhir,cocok=P.excelTotal!=null?Math.abs(tot-P.excelTotal)<0.0001:null;
     const skipAll=[...P.skipped,...plan.tak];
     prev.innerHTML=`<div class="kv"><div><span>Barang baru</span><b>${plan.baru.length}</b></div><div><span>Sudah ada</span><b>${plan.ada.length}</b></div><div><span>Pengeluaran dicatat</span><b>${plan.ok.length}</b></div><div><span>Total stok akhir</span><b>${n(tot)}</b></div></div>
     ${cocok===null?'':`<div class="note" style="color:var(--${cocok?'ok':'warn'})">${cocok?`Cocok dengan lembar Ringkasan Excel (total stok akhir ${n(P.excelTotal)}).`:`Berbeda dari lembar Ringkasan Excel (${n(P.excelTotal)}); periksa data.`}</div>`}
     ${skipAll.length?`<div class="note" style="margin-top:6px"><b>${skipAll.length} baris dilewati</b> (periksa di Excel): ${skipAll.slice(0,8).map(s=>`${esc(s.sheet)} baris ${s.row}: ${esc(s.alasan)}`).join('; ')}${skipAll.length>8?' …':''}</div>`:''}`}
    catch(e){SPIMP=null;prev.innerHTML=`<div class="note" style="color:var(--crit)">${esc(e.message||String(e))}</div>`}})}});
}

/* ---------- forms: item edit, settings, PR ---------- */
function rmEditForm(id){const r=byId('rm',id);openModal(`Ubah item · ${esc(rmLabel(r))}`,fld('Material',inp('item',r.item))+fld('Ukuran (t×l×p mm)',inp('ukuran',r.ukuran))+fld('Stok minimum',inp('min',r.min||0,'number','min="0"'))+fld('Buffer (target stok)',inp('buffer',r.buffer||0,'number','min="0"'))+fld('Lokasi rak',inp('lokasi',r.lokasi||'','text','placeholder="mis. A-03"'))+fld('Harga per kg (Rp, opsional)',inp('harga',r.harga||'','number','min="0"'))+fld('Satuan',inp('satuan',r.satuan||'Lembar'))+fld('Jenis material (massa jenis)','<select class="sel" name="jenis"><option value="">Otomatis dari kata kunci di nama item</option>'+GRADES().map(g=>'<option '+(r.jenis===g?'selected':'')+'>'+esc(g)+'</option>').join('')+'</select>')+(r.usulan?`<div class="note full">Catatan Excel: ${esc(r.usulan)}</div>`:''),
 async d=>{if(!d.item||!d.ukuran)throw new Error('Material dan ukuran wajib diisi.');if(num0(d.min)>num0(d.buffer)&&num0(d.buffer)>0)throw new Error('Minimum tidak boleh lebih besar dari buffer.');const itm=d.item.trim(),ukr=d.ukuran.trim();const dup=S.rm.find(r=>r._id!==id&&r.item.trim().toLowerCase()===itm.toLowerCase()&&r.ukuran.trim().toLowerCase()===ukr.toLowerCase());if(dup)throw new Error(`Kombinasi "${itm} – ${ukr}" sudah dipakai item lain. Ubah spesifikasi atau hapus duplikat terlebih dahulu.`);await updDoc('rm',id,{item:itm,ukuran:ukr,min:num0(d.min),buffer:num0(d.buffer),lokasi:String(d.lokasi||'').trim(),harga:num0(d.harga),satuan:d.satuan||'Lembar',jenis:d.jenis||''})})}
function rmSetForm(){const s=SET();openModal('Pengaturan bahan baku',fld('Lead time pembelian (hari)',inp('leadBeli',s.leadBeli,'number','min="1"'))+fld('Target stok setelah order (lbr)',inp('cover',s.cover,'number','min="1"'))+fld('Faktor sisa potong (×) untuk kebutuhan material SPK',inp('faktorSisa',MT().faktorSisa(s.faktorSisa),'number','min="1" max="2" step="0.01"'))+`<div class="note full">Massa jenis dan jenis material diatur di <button type="button" class="linkbtn" data-act="bbgo">Master Data › Bahan baku</button>.</div>`+`<div class="note full">Titik pesan ulang = minimum + pemakaian harian × lead time. Usulan order mengisi stok sampai buffer atau target, mana yang lebih besar. Untuk material besi, sesuaikan target dengan kebutuhan project aktif, bukan hari pemakaian.</div>`,
 async d=>{const v={leadBeli:Math.max(1,num0(d.leadBeli)),cover:Math.max(1,num0(d.cover)),faktorSisa:MT().faktorSisa(d.faktorSisa)};if(byId('master','setting'))await updDoc('master','setting',v);else{need();await DB.doc('master/setting').set(v)}})}
function prNewForm(){
 const f=F['bahan-baku'],R=rmCalc();const items=Object.values(R.info).filter(x=>x.sug>0).map(x=>{const v=f.beli[x.r._id]||{on:true,q:x.sug};return {item:x.r._id,q:Math.round(+v.q||0),on:v.on}}).filter(i=>i.on&&i.q>0);
 if(!items.length){toast('Pilih minimal satu item dengan qty > 0.');return}
 openModal('Buat permintaan pembelian (PR)',`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>Material</th><th class="num">Qty (lbr)</th><th class="num">Kg</th></tr></thead><tbody>${items.map(i=>{const r=byId('rm',i.item);return `<tr><td>${esc(rmLabel(r))}</td><td class="num">${n(i.q)}</td><td class="num">${n(Math.round(i.q*kgLbr(r)))}</td></tr>`}).join('')}</tbody></table></div>`+
  fld('Tanggal',inp('tgl',today(),'date'))+fld('Dibutuhkan paling lambat',inp('butuh',addDays(today(),SET().leadBeli),'date'))+fld('Supplier (opsional)',inp('supplier','','text','list="dl-sup2" autocomplete="off"'))+dl('dl-sup2',mNames('supplier'))+fld('Catatan',inp('ket'),true),
  async (d,form)=>{let sup='';if(String(d.supplier||'').trim())sup=await ensureMaster('supplier',d.supplier,form,'supplier');const t=d.tgl||today();const noPR=await nextDocNo('PR',t);
   await addDoc('pr',{noPR,tgl:t,butuh:d.butuh||'',supplier:sup,items:items.map(i=>({item:i.item,q:i.q,qTerima:0})),status:'Diajukan',ket:d.ket||''});F['bahan-baku'].beli={};toast(`${noPR} dibuat`)},{submit:'Buat PR',done:' '});
}
/* Dokumen mutasi bahan baku: penerimaan, pengeluaran, opname, koreksi. Satu nomor dokumen = satu dokumen, bisa banyak baris item. */
function mvDocSp(rows,noDok,h){
 const jenis=h.jenis;
 const L=rows.map(m=>{const it=byId('sp',m.item)||{};const d=+m.delta||0;return {m,it,nama:it.item||'(item terhapus)',kode:it.kode||'',satuan:it.satuan||'',d,q:Math.abs(d)}});
 const kets=[...new Set(rows.map(m=>String(m.ket||'').trim()).filter(Boolean))].join('\n');
 const kode=noDok?(jenis==='koreksi'?noDok+' (koreksi)':noDok):'MUT-'+String(h._id||'').slice(0,8).toUpperCase();
 const meta=[['No dokumen',kode],['Tanggal',tglLong(h.tgl)]];let cols,body,tot,signs;
 const sq=sumBy(L,x=>x.q),sd=sumBy(L,x=>x.d);
 if(jenis==='masuk'){meta.push(['Supplier / asal',h.pihak||'-'],['No PR',h.pr&&byId('pr',h.pr)?byId('pr',h.pr).noPR:(h.dasar?'Tanpa PR: '+(DASAR_SP.find(x=>x[0]===h.dasar)||[0,h.dasar])[1]:'-')],['No PO / SJ supplier',h.ref||'-']);cols=[['Nama barang','l'],['Kode','c'],['Qty','r'],['Satuan','c']];body=L.map(x=>[x.nama,x.kode,x.q,x.satuan]);tot=['TOTAL','',sq,''];signs=['Pengirim / Supplier','Dicatat (Gudang)','Diterima (Gudang MNI)']}
 else if(jenis==='keluar'){meta.push(['Mesin / tujuan',h.mesin?h.mesin+(h.mesinGrup?' ('+h.mesinGrup+')':''):(h.tujuan==='umum'?'Umum':(h.pihak||'-'))],['Jenis pemakaian',h.tujuan?tujuanLbl(h.tujuan):'-'],['Diambil oleh',h.oleh||'-'],['No. WO / tiket',h.ref||'-']);cols=[['Nama barang','l'],['Kode','c'],['Qty','r'],['Satuan','c']];body=L.map(x=>[x.nama,x.kode,x.q,x.satuan]);tot=['TOTAL','',sq,''];signs=['Dicatat (Gudang)','Diserahkan','Diterima (Peminta)']}
 else if(jenis==='opname'){meta.push(['Keterangan sesi',h.ref||'Stock opname']);cols=[['Nama barang','l'],['Kode','c'],['Stok sistem','r'],['Stok fisik','r'],['Selisih','r',1]];body=L.map(x=>[x.nama,x.kode,x.m.stokSistem==null?'':x.m.stokSistem,x.m.stokFisik==null?'':x.m.stokFisik,x.d]);tot=['TOTAL','','','',sd];signs=['Dihitung oleh','Diperiksa','Disetujui']}
 else{meta.push(['Mengoreksi dokumen',noDok||'-'],['Pihak',h.pihak||'-']);cols=[['Nama barang','l'],['Kode','c'],['Koreksi qty','r',1],['Satuan','c']];body=L.map(x=>[x.nama,x.kode,x.d,x.satuan]);tot=['TOTAL','',sd,''];signs=['Dicatat (Gudang)','Disetujui','Diketahui']}
 return {tgl:h.tgl,kode,jenis,title:{masuk:'BUKTI PENERIMAAN SPAREPART',keluar:'BUKTI PENGELUARAN SPAREPART',opname:'BERITA ACARA STOCK OPNAME SPAREPART',koreksi:'BUKTI KOREKSI STOK SPAREPART'}[jenis]||'DOKUMEN SPAREPART',meta,cols,body,tot,signs,ket:kets,by:h.by?(uname(h.by)||'Pengguna'):''};
}
function mvDoc(noDok,jenis,id){
 const rows=noDok?S.mutasi.filter(m=>(m.gudang==='rm'||m.gudang==='sp'||m.gudang==='fg')&&m.jenis===jenis&&m.noDok===noDok):[byId('mutasi',id)].filter(Boolean);
 if(!rows.length)return null;const h=rows[0];jenis=h.jenis;
 if(h.gudang==='sp')return mvDocSp(rows,noDok,h);
 if(h.gudang==='fg')return mvDocFg(rows,noDok,h);
 const sp=h.spk?byId('spk',h.spk):null,spkNo=mvSpkNo(h);
 const L=rows.map(m=>{const it=byId('rm',m.item)||{};const d=+m.delta||0;return {m,it,nama:it.item||'',ukuran:it.ukuran||'',satuan:it.satuan||'Lembar',d,q:Math.abs(d),kg:Math.abs(d)*kgLbr(it),kgs:d*kgLbr(it)}});
 const kets=[...new Set(rows.map(m=>String(m.ket||'').trim()).filter(Boolean))].join('\n');
 const kode=noDok?(jenis==='koreksi'?noDok+' (koreksi)':noDok):'MUT-'+String(h._id||'').slice(0,8).toUpperCase();
 const meta=[['No dokumen',kode],['Tanggal',tglLong(h.tgl)]];let cols,body,tot,signs;
 const R=Math.round;
 if(jenis==='masuk'){meta.push(['Supplier',h.pihak||'-'],['No PO / SJ supplier',h.ref||'-']);cols=[['Material','l'],['Ukuran (t×l×p mm)','l'],['Qty','r'],['Satuan','c'],['Berat (kg)','r']];body=L.map(x=>[x.nama,x.ukuran,x.q,x.satuan,R(x.kg)]);tot=['TOTAL','',sumBy(L,x=>x.q),'',R(sumBy(L,x=>x.kg))];signs=['Pengirim / Supplier','Dicatat (Gudang)','Diterima (Gudang MNI)']}
 else if(jenis==='keluar'){meta.push(['No SPK',spkNo||'Non-SPK'],['Customer',sp?(sp.customer||'-'):'-'],['Diserahkan ke',h.pihak||'-']);cols=[['Material','l'],['Ukuran (t×l×p mm)','l'],['Qty','r'],['Satuan','c'],['Berat (kg)','r']];body=L.map(x=>[x.nama,x.ukuran,x.q,x.satuan,R(x.kg)]);tot=['TOTAL','',sumBy(L,x=>x.q),'',R(sumBy(L,x=>x.kg))];signs=['Dicatat (Gudang)','Diserahkan','Diterima (Produksi)']}
 else if(jenis==='opname'){meta.push(['Keterangan sesi',h.ref||'Stock opname']);cols=[['Material','l'],['Ukuran (t×l×p mm)','l'],['Stok sistem','r'],['Stok fisik','r'],['Selisih (lbr)','r',1],['Selisih (kg)','r',1]];body=L.map(x=>[x.nama,x.ukuran,x.m.stokSistem==null?'':x.m.stokSistem,x.m.stokFisik==null?'':x.m.stokFisik,x.d,R(x.kgs)]);tot=['TOTAL','','','',sumBy(L,x=>x.d),R(sumBy(L,x=>x.kgs))];signs=['Dihitung oleh','Diperiksa','Disetujui']}
 else{meta.push(['Mengoreksi dokumen',noDok||(h.koreksiDari?'(lihat riwayat)':'-')],['Pihak',h.pihak||'-']);cols=[['Material','l'],['Ukuran (t×l×p mm)','l'],['Koreksi qty','r',1],['Satuan','c'],['Koreksi kg','r',1]];body=L.map(x=>[x.nama,x.ukuran,x.d,x.satuan,R(x.kgs)]);tot=['TOTAL','',sumBy(L,x=>x.d),'',R(sumBy(L,x=>x.kgs))];signs=['Dicatat (Gudang)','Disetujui','Diketahui']}
 return {tgl:h.tgl,kode,jenis,title:{masuk:'BUKTI PENERIMAAN BAHAN BAKU',keluar:'BUKTI PENGELUARAN BAHAN BAKU',opname:'BERITA ACARA STOCK OPNAME BAHAN BAKU',koreksi:'BUKTI KOREKSI STOK BAHAN BAKU'}[jenis]||'DOKUMEN BAHAN BAKU',meta,cols,body,tot,signs,ket:kets,by:h.by?(uname(h.by)||'Pengguna'):''};
}
function opnameSheetDoc(){
 const t=today(),R=rmCalc();
 const rows=rmFilter().map(r=>R.info[r._id]).sort((a,b)=>grps().indexOf(GRP(grade(a.r)))-grps().indexOf(GRP(grade(b.r)))||grade(a.r).localeCompare(grade(b.r))||thkR(a.r)-thkR(b.r)||String(a.r.ukuran).localeCompare(String(b.r.ukuran)));
 return {tgl:t,kode:'LEMBAR-OPNAME-'+t,jenis:'sheet',title:'LEMBAR HITUNG STOCK OPNAME BAHAN BAKU',rowH:30,
  meta:[['Tanggal hitung',tglLong(t)],['Jumlah item',String(rows.length)],['Petugas hitung','............................'],['Lokasi','Gudang Bahan Baku']],
  cols:[['Material','l'],['Ukuran (t×l×p mm)','l'],['Rak','c'],['Stok sistem','r'],['Hitung fisik','r'],['Selisih','r'],['Catatan','l']],
  body:rows.map(x=>[x.r.item,x.r.ukuran,x.r.lokasi||'',x.stok,'','','']),
  tot:['TOTAL','','',sumBy(rows,x=>x.stok),'','',''],signs:['Dihitung oleh','Diperiksa','Disetujui'],
  ket:'Hitung fisik setiap item, tulis hasilnya pada kolom Hitung fisik, lalu masukkan ke sistem di tab Stock opname. Item yang tidak dihitung dikosongkan.',by:''};
}
const mvFmt=(v,c)=>typeof v==='number'?((c[2]&&v>0?'+':'')+n(v)):v;
function printMvDoc(noDok,jenis,id,pre){
 const d=pre||mvDoc(noDok,jenis,id);if(!d)return toast('Dokumen tidak ditemukan');
 askSigners(d.signs,d.signs.map((s,i)=>i===(d.jenis==='masuk'?1:0)&&d.by?d.by:''),names=>printMvDoc0(d,names));
}
function exportMvXlsx(noDok,jenis,id,pre){
 const d=pre||mvDoc(noDok,jenis,id);if(!d||!DLS){toast('Unduhan tidak tersedia di tampilan ini.');return}
 askSigners(d.signs,d.signs.map((s,i)=>i===(d.jenis==='masuk'?1:0)&&d.by?d.by:''),names=>exportMvXlsx0(d,names));
}
/* ---------- model dokumen gudang: mutasi, PR, kartu stok (memakai mesin PDF/Excel/cetak bertema yang sama) ---------- */
const MVT={masuk:'mvmasuk',keluar:'mvkeluar',opname:'mvopname',koreksi:'mvkoreksi',sheet:'mvopname'};
function mvModel(d){
 const cols=[['No',6,'c'],...d.cols.map((c,i)=>[c[0],i===0?44:(c[1]==='l'?26:15),c[1],!!c[2]])];
 const meta=d.meta.filter(x=>x[0]!=='No dokumen'&&x[0]!=='Tanggal');
 return {kind:MVT[d.jenis]||'mvopname',file:d.kode,title:d.title,no:d.kode,date:d.tgl||today(),landscape:cols.length>7,meta,
  tables:[{cols,rows:d.body.map((r,k)=>[k+1,...r]),foot:['',...d.tot],rowH:d.rowH}],note:d.ket||'',signs:d.signs}}
function prModel(p){
 const sp=p.gudang==='sp',items=p.items||[];let tq=0,tk=0;
 const rows=items.map((i,k)=>{if(sp){const it=byId('sp',i.item)||{};tq+=+i.q||0;return [k+1,it.item||'',it.kode||'',+i.q||0,it.satuan||'','']}
  const it=byId('rm',i.item)||{};const kg=Math.round((+i.q||0)*kgLbr(it));tq+=+i.q||0;tk+=kg;return [k+1,it.item||'',it.ukuran||'',+i.q||0,kg,'']});
 const cols=sp?[['No',6,'c'],['Nama barang',44,'l'],['Kode',14,'c'],['Qty',12,'r'],['Satuan',12,'c'],['Keterangan',28,'l']]:[['No',6,'c'],['Material',40,'l'],['Ukuran (t×l×p mm)',24,'c'],['Qty (lbr)',12,'r'],['Berat (kg)',14,'r'],['Keterangan',26,'l']];
 return {kind:'pr',file:String(p.noPR||'PR').replace(/\//g,'-'),title:sp?'PERMINTAAN PEMBELIAN SPAREPART':'PERMINTAAN PEMBELIAN BAHAN BAKU',no:p.noPR||'',date:p.tgl,
  meta:[['Dibutuhkan',p.butuh?tglLong(p.butuh):'-'],['Supplier',p.supplier||'-'],['Gudang',sp?'Sparepart':'Bahan baku']],
  tables:[{cols,rows,foot:['','Total','',tq,sp?'':tk,'']}],note:p.ket||'',signs:sp?['Dibuat oleh (Gudang)','Disetujui','Procurement']:['Dibuat oleh (PPIC / Gudang)','Disetujui','Procurement']}}
function ksModel(id){
 const r=byId('rm',id);if(!r)return null;const x=RMI(id);if(!x)return null;
 const t=today(),f=F['bahan-baku'];const fromDate=f.ksPer==='all'?null:addDays(t,-(+f.ksPer));const base=r.tglStokAwal||t;
 const allMv=S.mutasi.filter(m=>m.gudang==='rm'&&m.item===id).sort((a,b)=>(a.tgl+a.at).localeCompare(b.tgl+b.at));
 let run=+r.stokAwal||0;const allRows=[{tgl:base,jenis:'Saldo Awal',noDok:'',pihak:'Import Excel',ket:'',masuk:null,keluar:null,saldo:run}];
 for(const m of allMv){if(m.tgl<base)continue;const d=+m.delta||0;const isMasuk=m.jenis==='masuk'||(m.jenis==='koreksi'&&d>0);const isKeluar=m.jenis==='keluar'||(m.jenis==='koreksi'&&d<0);run+=d;
  allRows.push({tgl:m.tgl,jenis:(MVL[m.jenis]||m.jenis)+(m.dikoreksi?' (dikoreksi)':''),noDok:m.noDok||'',pihak:m.pihak||'',ket:m.ket||m.ref||'',masuk:isMasuk?Math.abs(d):null,keluar:isKeluar?Math.abs(d):null,saldo:run,by:who(m.by)})}
 const rows=fromDate?allRows.filter((q,i)=>i===0||q.tgl>=fromDate):allRows;let totM=0,totK=0;rows.forEach(q=>{totM+=q.masuk||0;totK+=q.keluar||0});
 return {kind:'ks',file:`Kartu-Stok-${rmLabel(r).replace(/[^a-zA-Z0-9]/g,'-')}-${t}`,title:'KARTU STOK BAHAN BAKU',no:'KS/'+String(r.kode||id).slice(0,10)+'/'+t.slice(0,4),date:t,landscape:true,
  meta:[['Material',rmLabel(r)],['Ukuran',r.ukuran||'–'],['Lokasi rak',r.lokasi||'–'],['Berat / lembar',x.kg1.toFixed(2)+' kg'],['Periode',fromDate?fdS(fromDate)+' s/d '+fdS(t):'Semua transaksi'],['Stok saat ini',n(x.stok)+' lbr']],
  tables:[{cols:[['Tanggal',14,'c'],['Jenis transaksi',18,'l'],['No. dokumen',20,'l'],['Supplier / tujuan',24,'l'],['Keterangan',30,'l'],['Masuk (lbr)',13,'r'],['Keluar (lbr)',13,'r'],['Saldo (lbr)',13,'r'],['Petugas',14,'l']],
   rows:rows.map(q=>[fdS(q.tgl),q.jenis,q.noDok,q.pihak,q.ket,q.masuk==null?'':q.masuk,q.keluar==null?'':q.keluar,q.saldo,q.by||'']),foot:['','TOTAL','','','',totM,totK,x.stok,'']}],note:'',signs:null}}
async function saveDocModel(m,fmt,base){toast(`Menyiapkan ${fmt==='pdf'?'PDF':'Excel'}…`);const data=fmt==='pdf'?await docPdf(m):await docXlsx(m);await DLS.save({filename:fnSafe(base)+(fmt==='pdf'?'.pdf':'.xlsx'),data})}
async function exportKartuDoc(id,fmt){const r=byId('rm',id);if(!r||!DLS){toast('Unduhan tidak tersedia.');return}const m=ksModel(id);if(!m){toast('Data item tidak ditemukan.');return}
 try{await saveDocModel(m,fmt,m.file)}catch(e){if(e.code!=='declined')toast('Gagal export '+(fmt==='pdf'?'PDF':'Excel')+': '+(e.message||e.code))}}
function exportKartuXlsx(id){return exportKartuDoc(id,'xlsx')}
async function exportPrDoc(id,fmt,names){const p=byId('pr',id);if(!p||!DLS){toast('Unduhan tidak tersedia di tampilan ini.');return}
 const sg=prModel(p).signs;if(!names)return askSigners(sg,[],nm=>exportPrDoc(id,fmt,nm));
 try{await saveDocModel({...prModel(p),names},fmt,p.noPR)}catch(e){if(e.code!=='declined')toast('Gagal membuat '+(fmt==='pdf'?'PDF':'Excel')+': '+(e.message||e.code))}}
function exportPrXlsx(id,names){return exportPrDoc(id,'xlsx',names)}
/* cetak lewat jendela browser dengan tema yang sama (dipakai dokumen mutasi dan lembar opname) */
function printDocHtml(m,names){
 const e=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
 const win=window.open('','_blank','width=794,height=1123');if(!win)return toast('Aktifkan popup untuk mencetak dokumen');
 const t=m.tables[0],al=c=>c[2]==='r'?'text-align:right':c[2]==='c'?'text-align:center':'';
 const fm=(v,c)=>typeof v==='number'?((c&&c[3]&&v>0?'+':'')+n(v)):e(v);
 const th=t.cols.map(c=>`<th style="${al(c)};text-align:center">${e(c[0])}</th>`).join('');
 const rows=t.rows.map(r=>`<tr${t.rowH?` style="height:${t.rowH}px"`:''}>${r.map((v,i)=>`<td style="${al(t.cols[i])}">${fm(v,t.cols[i])}</td>`).join('')}</tr>`).join('');
 const tot=t.foot?`<tr class="tot">${t.foot.map((v,i)=>`<td style="${al(t.cols[i])}">${fm(v,t.cols[i])}</td>`).join('')}</tr>`:'';
 const meta=m.meta.map(([k,v])=>`<div><small>${e(k)}</small><b>${e(v)}</b></div>`).join('');
 const signs=(m.signs||[]).map((s,i)=>{const ls=String(s).split('\n');return `<div class="dk-sg">${e(ls[0])}${ls[1]?`<br><span>${e(ls.slice(1).join(' '))}</span>`:''}<div class="sl"></div>( ${names&&names[i]?e(names[i]):'____________'} )</div>`}).join('');
 win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${e(m.no)}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:26px 30px;-webkit-print-color-adjust:exact;print-color-adjust:exact}${DK_CSS}
 .dk-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;padding:10px 14px;background:#f8f9fb;border:1px solid #e4e7ee;border-left:4px solid var(--dc);border-radius:6px;margin-bottom:14px}.dk-meta small{display:block;font-size:8px;letter-spacing:.07em;color:#8b92a1;text-transform:uppercase}.dk-meta b{display:block;font-size:12px;margin-top:1px}
 table.dk-tbl{width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11.5px}.dk-tbl th{background:var(--dc);color:#fff;padding:7px 8px;border:1px solid var(--dc)}.dk-tbl td{padding:6px 8px;border:1px solid #e1e6ee;vertical-align:top}.dk-tbl tbody tr:nth-child(even) td{background:color-mix(in srgb,var(--dc) 4%,#fff)}.dk-tbl tr.tot td{background:color-mix(in srgb,var(--dc) 14%,#fff);color:var(--dc);font-weight:700}
 .dk-note{background:#fff8e6;border-left:4px solid #f0b429;color:#7a5200;padding:8px 12px;margin-bottom:14px;font-size:11px;white-space:pre-line}.dk-signs{display:flex;border:1px solid #d6dce6;border-radius:6px;margin-top:16px;page-break-inside:avoid}.dk-sg{flex:1;text-align:center;padding:10px 8px;font-size:11px;font-weight:700}.dk-sg+.dk-sg{border-left:1px solid #d6dce6}.dk-sg span{font-weight:400;color:#666}.dk-sg .sl{height:54px}.dk-foot{margin-top:14px;font-size:9px;color:#888;font-style:italic}
 @media print{body{padding:10px 14px}@page{size:A4 ${m.landscape?'landscape':'portrait'};margin:12mm}}</style></head><body style="${dkStyle(m.kind)}">
 ${docHeadHtml(m.kind,m)}
 ${m.meta.length?`<div class="dk-meta">${meta}</div>`:''}
 <table class="dk-tbl"><thead><tr>${th}</tr></thead><tbody>${rows}${tot}</tbody></table>
 ${m.note?`<div class="dk-note"><b>Keterangan:</b>\n${e(m.note)}</div>`:''}
 ${signs?`<div class="dk-signs">${signs}</div>`:''}
 <div class="dk-foot">Dicetak dari MNI Gudang &amp; Logistik · ${e(new Date().toLocaleString('id-ID'))}</div>
 <script>window.onload=function(){window.print()}<\/script></body></html>`);win.document.close();
}
function printMvDoc0(d,names){printDocHtml(mvModel(d),names)}
async function exportMvXlsx0(d,names){
 try{await saveDocModel({...mvModel(d),names},'xlsx',d.kode.replace(/\s+/g,'_'))}
 catch(e){if(e.code!=='declined')toast('Gagal membuat Excel: '+(e.message||e.code))}
}
async function saveOpname(){
 const f=F['bahan-baku'],R=rmCalc();const rows=Object.entries(f.opn).filter(([,v])=>v!==''&&v!==undefined).map(([id,v])=>({id,fisik:+v,sistem:R.info[id]?R.info[id].stok:0})).filter(x=>R.info[x.id]);
 if(!rows.length){toast('Isi hitung fisik minimal satu item.');return}
 if(rows.some(x=>!(x.fisik>=0))){toast('Hitung fisik harus angka ≥ 0.');return}
 const diffs=rows.filter(x=>x.fisik!==x.sistem);
 openModal('Simpan hasil stock opname',`<div class="full kv"><div><span>Item dihitung</span><b>${rows.length}</b></div><div><span>Item selisih</span><b>${diffs.length}</b></div><div><span>Akurasi</span><b>${Math.round((rows.length-diffs.length)/rows.length*100)}%</b></div></div>${diffs.length?`<div class="full tbl-wrap"><table class="lines"><thead><tr><th>Item</th><th class="num">Sistem</th><th class="num">Fisik</th><th class="num">Selisih</th></tr></thead><tbody>${diffs.map(x=>`<tr><td>${esc(rmLabel(byId('rm',x.id)))}</td><td class="num">${n(x.sistem)}</td><td class="num">${n(x.fisik)}</td><td class="num">${x.fisik-x.sistem>0?'+':''}${n(x.fisik-x.sistem)}</td></tr>`).join('')}</tbody></table></div>`:''}`+fld('Tanggal opname',inp('tgl',today(),'date'))+fld('Penjelasan selisih',inp('ket','','text',diffs.length?'required placeholder="mis. plat penyok dipisah, salah catat pemakaian SPK 520"':''),true),
  async d=>{if(diffs.length&&!String(d.ket).trim())throw new Error('Tulis penjelasan selisih agar opname bisa diaudit.');const t=d.tgl||today();const noDok=await nextDocNo('OPN',t);
   for(const x of diffs)await addDoc('mutasi',{gudang:'rm',item:x.id,jenis:'opname',delta:x.fisik-x.sistem,tgl:t,noDok,ref:'Stock opname',spk:'',pihak:'',ket:d.ket||'',stokSistem:x.sistem,stokFisik:x.fisik});
   const kg=diffs.reduce((a,x)=>a+(x.fisik-x.sistem)*kgLbr(byId('rm',x.id)),0);
   await addDoc('opname',{noDok,tgl:t,gudang:'rm',items:rows.map(x=>({item:x.id,sistem:x.sistem,fisik:x.fisik})),counted:rows.length,selisih:diffs.length,kg,akurasi:(rows.length-diffs.length)/rows.length,ket:d.ket||''});
   F['bahan-baku'].opn={};toast(`${noDok} tersimpan · akurasi ${Math.round((rows.length-diffs.length)/rows.length*100)}%`)},{submit:'Simpan opname',done:' '});
}
/* live inputs inside the RM tabs (kept in state so realtime refreshes do not wipe them) */
document.addEventListener('input',e=>{const el=e.target;const f=F['bahan-baku'];
 if(el.dataset.opn){f.opn[el.dataset.opn]=el.value;const x=RMI(el.dataset.opn);const has=el.value!=='';const d=has?(+el.value-x.stok):0;const od=document.querySelector(`[data-od="${el.dataset.opn}"]`),ok=document.querySelector(`[data-ok="${el.dataset.opn}"]`);if(od){od.textContent=has?(d>0?'+':'')+n(d):'';od.style.color=d<0?'var(--crit)':d>0?'var(--ok)':''}if(ok)ok.textContent=has&&d?n(Math.round(d*x.kg1)):'';
  let c=0,df=0,kg=0;Object.entries(f.opn).forEach(([id,v])=>{if(v===''||v===undefined||!RMI(id))return;c++;const dd=+v-RMI(id).stok;if(dd){df++;kg+=dd*RMI(id).kg1}});const tt=$('#opn-tot');if(tt)tt.textContent=`${c} item dihitung · ${df} selisih · ${n(Math.round(kg))} kg`}
 if(el.dataset.beli){const id=el.dataset.id;const cur=f.beli[id]||{on:true,q:RMI(id).sug};if(el.dataset.beli==='q')cur.q=el.value;else cur.on=el.checked;f.beli[id]=cur;const bk=document.querySelector(`[data-bkg="${id}"]`);if(bk)bk.textContent=n(Math.round((+cur.q||0)*RMI(id).kg1));
  const R=rmCalc();let q=0,kg=0,rp=0;Object.values(R.info).filter(x=>x.sug>0).forEach(x=>{const v=f.beli[x.r._id]||{on:true,q:x.sug};if(v.on){q+=+v.q||0;kg+=(+v.q||0)*x.kg1;rp+=(+v.q||0)*x.kg1*(+x.r.harga||0)}});const tt=$('#beli-tot');if(tt)tt.innerHTML=`<b>${n(q)}</b> lembar · <b>${ton(kg)}</b> ton${rp?` · ± Rp ${n(Math.round(rp))}`:''}`}
});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset&&el.dataset.beli==='on'){const ev=new Event('input',{bubbles:true});el.dispatchEvent(ev)}});

/* ---------- KATALOG ITEM SPK (descriptions, units, weights, section titles, sales) ---------- */
const SAT_DEF=['Btg','Pcs','Set','Unit','Lot','Mtr','Lbr','Kg'];
const satList=()=>{const k=KAT();return (k.satuanList&&k.satuanList.length?k.satuanList:SAT_DEF)};
const katNorm=d=>String(d||'').toLowerCase().replace(/\bmm\b/g,'').replace(/[^a-z0-9]/g,'').replace(/(\d)x(?=[a-z])/g,'$1');
function lev2(a,b){ /* edit distance capped at 3 (banded) */
 if(Math.abs(a.length-b.length)>2)return 3;const n=a.length,m=b.length;let prev=new Array(m+1);for(let j=0;j<=m;j++)prev[j]=j;
 for(let i=1;i<=n;i++){const cur=new Array(m+1).fill(3);cur[0]=i;let best=cur[0];for(let j=Math.max(1,i-2);j<=Math.min(m,i+2);j++){cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));if(cur[j]<best)best=cur[j]}if(best>2)return 3;prev=cur}return Math.min(3,prev[m])}
let KATX=null;
function katIndex(){ /* items with weights per thickness, usage in app SPKs, and suspected duplicates/typos */
 const k=KAT();if(KATX&&KATX.k===k&&KATX.n===S.spk.length)return KATX;
 const merged=k.merged||{};
 const items={};const add=d=>items[d]||(items[d]={d,u:'',w:{},use:0,last:0});
 Object.entries(k.satuan||{}).forEach(([d,u])=>{const rd=merged[d]||d;add(rd).u=u});
 Object.entries(k.berat||{}).forEach(([key,w])=>{const i=key.lastIndexOf('|');const d=key.slice(0,i),t=key.slice(i+1);const rd=merged[d]||d;add(rd).w[t||'–']=w});
 /* also pull items from SPK history that are NOT yet in master katalog */
 S.spk.slice().sort((a,b)=>(+a.no||0)-(+b.no||0)).forEach(s=>(s.items||[]).forEach(it=>{if(!it.d)return;const rd=merged[it.d]||it.d;if(items[rd]){items[rd].use++;items[rd].last=Math.max(items[rd].last,+s.no||0)}else{/* new item from history — seed it */add(rd);items[rd].use=1;items[rd].last=+s.no||0;if(it.u&&!items[rd].u)items[rd].u=it.u;if(it.w&&!Object.keys(items[rd].w).length)items[rd].w={'–':+it.w}}}));
 const arr=Object.values(items);const norm=arr.map(x=>katNorm(x.d));const sim={};
 /* words that make a different product (inside vs outside riser, type C, tee vs elbow…) must match exactly */
 const PROT=new Set(['ir','or','c','u','inside','outside','tee','elbow','cross','reducer','cover','riser','vertical','horizontal','left','right','lurus','sudut','l','t','x']);const prot=arr.map(x=>x.d.toLowerCase().split(/[^a-z0-9]+/).filter(t=>PROT.has(t)).sort().join(','));
 for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){const a=norm[i],b=norm[j];if(a.length<8||b.length<8)continue;
  /* sizes differing only in digits are different products (W100 vs W200): compare only when the digit sequence is the same */
  if(a.replace(/[^0-9]/g,'')!==b.replace(/[^0-9]/g,''))continue;if(prot[i]!==prot[j])continue;const dd=a===b?0:lev2(a,b);if(dd<=2){(sim[arr[i].d]=sim[arr[i].d]||[]).push(arr[j].d);(sim[arr[j].d]=sim[arr[j].d]||[]).push(arr[i].d)}}
 arr.forEach(x=>{x.sim=sim[x.d]||[];const ws=Object.values(x.w);x.flag='';
  if(/^(jointing|cover clamp|hanger|bracket|angle|cover elbow|cover tee|cover inside|cover outside|cover reducer|separator|clamp|bolt|baut)/i.test(x.d)&&ws.some(w=>w>10))x.flag='Berat tampak terlalu besar untuk aksesoris';});
 KATX={k,n:S.spk.length,arr:arr.sort((a,b)=>a.d.localeCompare(b.d))};return KATX;
}
async function katSave(mut){need();const k=JSON.parse(JSON.stringify(KAT()));delete k._id;k.berat=k.berat||{};k.satuan=k.satuan||{};k.grup=k.grup||[];k.sales=k.sales||[];k.merged=k.merged||{};mut(k);await DB.doc('master/katalog').set(k);KATX=null}
const wTxt=w=>Object.entries(w).sort((a,b)=>parseFloat(a[0])-parseFloat(b[0])).map(([t,v])=>`<span class="wchip">${t==='–'?'':esc(t)+' mm · '}<b>${n(v)}</b> kg</span>`).join('')||'<span class="muted">–</span>';
function katExactGroups(){const X=katIndex();const g={};X.arr.forEach(x=>{const k=katNorm(x.d);(g[k]=g[k]||[]).push(x)});return Object.values(g).filter(a=>a.length>1).map(a=>{const c=a.slice().sort((p,q)=>q.use-p.use||Object.keys(q.w).length-Object.keys(p.w).length||(p.d.includes(', c/w')?-1:0)-(q.d.includes(', c/w')?-1:0)||p.d.localeCompare(q.d))[0];return {keep:c,drop:a.filter(x=>x!==c)}})}
function katAutoForm(){const G=katExactGroups();if(!G.length){toast('Tidak ada duplikat ejaan.');return}
 openModal('Rapikan duplikat ejaan',`<div class="full note">${G.length} kelompok item yang hanya beda spasi, koma, huruf besar/kecil, atau "mm". Ejaan yang dipertahankan = yang paling sering dipakai / punya data berat terlengkap. Berat & satuan dari ejaan lain dipindah ke situ.</div><div class="full tbl-wrap"><table class="lines"><thead><tr><th>Dipertahankan</th><th>Dihapus dari katalog</th></tr></thead><tbody>${G.map(g=>`<tr><td><b>${esc(g.keep.d)}</b></td><td class="note">${g.drop.map(x=>esc(x.d)).join('<br>')}</td></tr>`).join('')}</tbody></table></div><div class="full note">SPK yang sudah tersimpan tidak diubah. Salah ketik yang hurufnya beda (mis. "Cabe Tray") tetap diperiksa manual lewat tombol Gabungkan.</div>`,
  async()=>{let merged=0;await katSave(k=>{G.forEach(g=>g.drop.forEach(x=>{const d=x.d,to=g.keep.d;/* migrate berat keys */Object.keys(k.berat).forEach(key=>{const i=key.lastIndexOf('|');if(key.slice(0,i)===d){const nk=to+'|'+key.slice(i+1);if(!(nk in k.berat))k.berat[nk]=k.berat[key];delete k.berat[key]}});/* migrate satuan */if(!k.satuan[to]&&k.satuan[d])k.satuan[to]=k.satuan[d];if(k.satuan[d])delete k.satuan[d];/* record merge alias so SPK-history items consolidate too */k.merged[d]=to;merged++}))});toast(`${merged} ejaan ganda dirapikan`)},{submit:`Rapikan ${G.length} kelompok`,done:' '})}
function katItemTab(){
 const f=F['master-data'],q=f.q.toLowerCase(),X=katIndex();let rows=X.arr;
 const cnt={all:rows.length,now:rows.filter(x=>!Object.keys(x.w).length).length,sim:rows.filter(x=>x.sim.length).length,flag:rows.filter(x=>x.flag).length,used:rows.filter(x=>x.use).length};
 if(q)rows=rows.filter(x=>x.d.toLowerCase().includes(q));
 if(f.kf==='now')rows=rows.filter(x=>!Object.keys(x.w).length);else if(f.kf==='sim')rows=rows.filter(x=>x.sim.length);else if(f.kf==='flag')rows=rows.filter(x=>x.flag);else if(f.kf==='used')rows=rows.filter(x=>x.use);
 const chips=[['','Semua',cnt.all,'plain'],['used','Dipakai di SPK aplikasi',cnt.used,'info'],['now','Tanpa berat',cnt.now,'warn'],['sim','Dugaan dobel / typo',cnt.sim,'crit'],['flag','Berat janggal',cnt.flag,'crit']].map(([v,l,c,cl])=>`<button class="chip ${f.kf===v?'sel':''} ${cl}" data-act="filt" data-view="master-data" data-key="kf" data-val="${v}">${l} · ${c}</button>`).join('');
 const EG=katExactGroups();
 return `<section class="panel"><div class="pbody note">Daftar ini yang muncul sebagai pilihan <b>Description</b> di form SPK, beserta satuan dan berat/pcs yang terisi otomatis. Sumber awal: 1.072 baris item dari 159 sheet SPK di PPIC Dashboard. Setiap SPK yang disimpan menambah item, satuan, dan berat baru ke sini. Berat dicatat per tebal plat, karena item yang sama beda tebal beda berat.</div>
 <div class="pbody"><div class="summ">${chips}${EG.length?`<span class="grow"></span><button class="btn sm primary" data-act="katauto">Rapikan ${EG.length} duplikat ejaan otomatis</button>`:''}</div></div>
 ${rows.length?`<div class="tbl-wrap"><table class="katt"><thead><tr><th>Description</th><th>Satuan</th><th>Berat / pcs per tebal</th><th class="num">Dipakai</th><th>Catatan</th><th></th></tr></thead><tbody>${rows.slice(0,400).map(x=>`<tr><td><b>${esc(x.d)}</b></td><td>${esc(x.u||'–')}</td><td><div class="wchips">${wTxt(x.w)}</div></td><td class="num">${x.use?`${x.use}×<div class="note">terakhir SPK ${x.last}</div>`:'<span class="muted">–</span>'}</td><td>${x.sim.length?`<div class="note" style="color:var(--crit)">Mirip: ${x.sim.slice(0,2).map(esc).join('; ')}</div>`:''}${x.flag?`<div class="note" style="color:var(--crit)">${esc(x.flag)}</div>`:''}</td><td class="acts-r"><button class="btn sm ghost" data-act="katedit" data-d="${esc(x.d)}">Ubah</button>${x.sim.length?`<button class="btn sm" data-act="katmerge" data-d="${esc(x.d)}">Gabungkan</button>`:''}<button class="btn sm ghost danger" data-act="katdel" data-d="${esc(x.d)}">Hapus</button></td></tr>`).join('')}</tbody></table></div>${rows.length>400?`<div class="pbody note">Menampilkan 400 dari ${rows.length}. Persempit dengan pencarian.</div>`:''}`:empty('Tidak ada item yang cocok','Ubah kata kunci atau filter.')}</section>`;
}
/* ---------- Master Data › Bahan baku: jenis material (massa jenis) dan daftar item ---------- */
const saveSetting=p=>byId('master','setting')?updDoc('master','setting',p):(need(),DB.doc('master/setting').set(p));
const JENIS_KUNCI={SPHC:'SPHC',SPCC:'SPCC',SS304:'304',SS316:'316',Aluminium:'ALU, ALM'};
function bbTab(){
 const f=F['master-data'],q=f.q.toLowerCase();
 const cnt={};S.rm.forEach(r=>{const g=grade(r);cnt[g]=(cnt[g]||0)+1});
 const ov=(byId('master','setting')||{}).dens||{};
 const jr=GRADES().map(g=>{const cm=CMATS().find(m=>m.nama===g);return {g,cm,dens:densG(g),src:cm?(cm.dasar?'Bawaan · nama diubah':'Buatan sendiri'):(+ov[g]>0?'Diubah':'Standar'),kunci:cm?cm.kunci:JENIS_KUNCI[g],u:cnt[g]||0}});
 const unk=cnt['Lainnya']||0;
 const items=S.rm.filter(r=>!q||rmLabel(r).toLowerCase().includes(q)||grade(r).toLowerCase().includes(q)).sort((a,b)=>grade(a).localeCompare(grade(b))||thkR(a)-thkR(b)||String(a.ukuran).localeCompare(String(b.ukuran)));
 return `<section class="panel"><div class="pbody" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3 class="h3" style="margin:0">Jenis material &amp; massa jenis</h3><span class="grow"></span><button class="btn sm primary" data-act="jenisform" data-j="">${ic('plus')}Jenis material</button></div>
 <div class="pbody note"><b>Jenis material</b> = daftar bahan beserta massa jenisnya (g/cm³); dipakai menghitung berat per lembar: tebal × lebar × panjang (mm) ÷ 1.000.000 × massa jenis. <b>Item bahan baku</b> (tabel di bawah) = barang di gudang dengan ukuran platnya; tiap item memilih satu jenis lewat tombol Ubah (kalau dikosongkan, jenis ditebak dari kata kunci di namanya).</div>
 <div class="tbl-wrap"><table><thead><tr><th>Jenis</th><th class="num">Massa jenis (g/cm³)</th><th>Kata kunci di nama item</th><th>Sumber</th><th class="num">Item</th><th></th></tr></thead><tbody>${jr.map(x=>`<tr><td><b>${esc(x.g)}</b></td><td class="num">${n(x.dens)}</td><td class="note">${esc(x.kunci||'')}</td><td>${chip(x.src,x.src==='Standar'?'plain':'info')}</td><td class="num">${x.u||'–'}</td><td class="acts-r"><button class="btn sm ghost" data-act="jenisform" data-j="${esc(x.g)}">Ubah</button><button class="btn sm ghost danger" data-act="jenisdel" data-j="${esc(x.g)}">Hapus</button></td></tr>`).join('')}</tbody></table></div>
 ${OFFG().filter(g=>!CMATS().some(m=>m.dasar===g)).length?`<div class="pbody note">Jenis bawaan yang dihapus: ${OFFG().filter(g=>!CMATS().some(m=>m.dasar===g)).map(g=>`<b>${esc(g)}</b> <button class="btn sm ghost" data-act="jenispulih" data-j="${esc(g)}">Pulihkan</button>`).join(' ')}</div>`:''}
 ${unk?`<div class="pbody note" style="color:var(--warn)">${unk} item belum dikenali jenisnya (berat dihitung seperti baja 7,85). Pilih jenisnya lewat tombol Ubah pada item itu, atau tambahkan jenis di atas.</div>`:''}</section>
 <section class="panel"><div class="pbody" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3 class="h3" style="margin:0">Item bahan baku</h3><span class="note">${items.length} item · item tidak dihapus permanen supaya riwayat stok utuh; gunakan Nonaktifkan</span><span class="grow"></span><button class="btn sm primary" data-act="mnew">${ic('plus')}Item baru</button></div>
 ${items.length?`<div class="tbl-wrap"><table><thead><tr><th>Material</th><th>Ukuran (t×l×p mm)</th><th>Jenis</th><th class="num">Kg/lbr</th><th>Satuan</th><th class="num">Min</th><th class="num">Buffer</th><th>Lokasi</th><th></th></tr></thead><tbody>${items.map(r=>{const g=grade(r);return `<tr style="${r.aktif===false?'opacity:.6':''}"><td><b>${esc(r.item)}</b>${r.aktif===false?' <span class="chip plain" style="font-size:10px;padding:0 6px">nonaktif</span>':''}</td><td class="mono">${esc(r.ukuran)}</td><td>${g==='Lainnya'?chip('Belum dikenali','warn'):esc(g)}</td><td class="num">${kgLbr(r)?n(Math.round(kgLbr(r)*10)/10):'–'}</td><td>${esc(r.satuan||'')}</td><td class="num">${n(r.min||0)}</td><td class="num">${n(r.buffer||0)}</td><td>${esc(r.lokasi||'')}</td><td class="acts-r"><button class="btn sm ghost" data-act="rmedit" data-id="${r._id}">Ubah</button>${r.aktif===false?`<button class="btn sm ghost" data-act="rmaktif" data-id="${r._id}">Aktifkan</button>`:`<button class="btn sm ghost" data-act="rmnonaktif" data-id="${r._id}" title="Sembunyikan dari daftar dan pilihan form tanpa menghapus riwayat">Nonaktifkan</button>`}</td></tr>`}).join('')}</tbody></table></div>`:empty('Belum ada item bahan baku','Tambahkan dengan tombol Item baru.')}</section>`;
}
function jenisForm(g){
 const cm=g?CMATS().find(m=>m.nama===g):null,base=!!g&&BASE_GRADES.includes(g),ov=(byId('master','setting')||{}).dens||{};
 const nItem=g?S.rm.filter(r=>grade(r)===g).length:0;
 const dens0=base?(ov[g]||''):(cm?cm.dens:''),kunci0=base?JENIS_KUNCI[g]:(cm?cm.kunci:'');
 const ganti=(a,b)=>{if(F['bahan-baku'].grade===a)F['bahan-baku'].grade=b};
 openModal(g?'Ubah jenis material':'Tambah jenis material',
  fld('Nama jenis',inp('nama',g||'','text','required placeholder="mis. Tembaga"'))+
  fld('Massa jenis (g/cm³)',inp('dens',dens0,'number',`${base?'':'required '}min="0.5" max="25" step="0.01"${base?` placeholder="${DENS[g]}"`:''}`))+
  fld('Kata kunci di nama item (pisahkan koma; kosong = sama dengan nama)',inp('kunci',kunci0,'text','placeholder="mis. TEMBAGA, CU"'),true)+
  `<div class="note full">${g?`Ada <b>${nItem} item</b> yang memakai jenis ini. `:''}Nama, kata kunci, dan massa jenis yang diubah langsung berlaku di Posisi stok, Analisa, Kartu Stok, Rencana pembelian, Stock opname, Riwayat mutasi, dan dokumen. Item dikenali dari kata kunci di namanya, jadi nama item tidak perlu diubah.${base?` Jenis bawaan yang diganti nama atau kata kuncinya tetap dihitung sebagai ${esc(g)} untuk kebutuhan SPK.`:''}</div>`,
  async d=>{
   const nm=String(d.nama||'').trim(),ds=num0(d.dens),kc=String(d.kunci||'').trim()||nm;
   if(!nm)throw new Error('Nama jenis wajib diisi.');
   const cur=CMATS(),offs=OFFG(),norm=x=>String(x).toUpperCase().replace(/\s+/g,'');
   const taken=x=>GRADES().some(y=>y.toLowerCase()===x.toLowerCase()&&y!==g);
   const info=n=>n?` · ${n} item ikut mengikuti`:'';
   if(base){
    if(nm===g&&norm(kc)===norm(JENIS_KUNCI[g])){const nd={...ov};if(ds>0)nd[g]=ds;else delete nd[g];await saveSetting({dens:nd});toast('Massa jenis disimpan'+info(nItem));return}
    if(BASE_GRADES.some(x=>x.toLowerCase()===nm.toLowerCase()&&x!==g)||taken(nm))throw new Error(`Jenis "${nm}" sudah ada.`);
    const nd={...ov};delete nd[g];
    await saveSetting({mats:[...cur,{nama:nm,kunci:kc,dens:ds>0?ds:DENS[g],dasar:g}],jenisOff:offs.includes(g)?offs:[...offs,g],dens:nd});
    ganti(g,nm);toast(`Jenis diubah menjadi ${nm}`+info(nItem));return}
   if(!(ds>0))throw new Error('Massa jenis wajib diisi.');
   if(cm&&cm.dasar&&nm===cm.dasar){
    await saveSetting({mats:cur.filter(m=>m.nama!==g),jenisOff:offs.filter(x=>x!==cm.dasar),dens:{...ov,[cm.dasar]:ds}});
    ganti(g,nm);toast(`Dikembalikan ke jenis bawaan ${nm}`+info(nItem));return}
   if(BASE_GRADES.some(x=>x.toLowerCase()===nm.toLowerCase())||taken(nm))throw new Error(`Jenis "${nm}" sudah ada (jenis bawaan yang dihapus bisa dipulihkan di bawah tabel).`);
   const mats=g?cur.map(m=>m.nama===g?{...m,nama:nm,kunci:kc,dens:ds}:m):[...cur,{nama:nm,kunci:kc,dens:ds}];
   await saveSetting({mats});if(g)ganti(g,nm);toast('Jenis material disimpan'+info(nItem))});
}
function katGrupTab(){
 const f=F['master-data'],q=f.q.toLowerCase(),k=KAT();const use={};S.spk.forEach(s=>new Set((s.items||[]).map(i=>i.g)).forEach(g=>{if(g)use[g]=(use[g]||0)+1}));
 const rows=(k.grup||[]).map((g,i)=>({g,i,u:use[g]||0})).filter(x=>!q||x.g.toLowerCase().includes(q));
 return `<section class="panel"><div class="pbody note">Judul section kuning yang muncul sebagai pilihan di form SPK, mis. "CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED". Tebal di judul ini dipakai untuk mencari berat item yang tepat.</div>
 ${rows.length?`<div class="tbl-wrap"><table><thead><tr><th>Judul section</th><th>Material · tebal · type</th><th class="num">Dipakai di SPK aplikasi</th><th></th></tr></thead><tbody>${rows.map(x=>{const d=derive(x.g);return `<tr><td><b>${esc(x.g)}</b></td><td class="note">${esc(d.material)} · ${esc(d.tebal||'?')} mm${d.type?' · '+esc(d.type):''}</td><td class="num">${x.u||'–'}</td><td class="acts-r"><button class="btn sm ghost" data-act="grupedit" data-i="${x.i}">Ubah</button><button class="btn sm ghost danger" data-act="grupdel" data-i="${x.i}">Hapus</button></td></tr>`}).join('')}</tbody></table></div>`:empty('Belum ada judul section','Tambahkan dengan tombol Tambah.')}</section>`;
}
function katListTab(){
 const k=KAT();const satUse={},salUse={};S.spk.forEach(s=>{(s.items||[]).forEach(i=>satUse[i.u]=(satUse[i.u]||0)+1);if(s.sales)salUse[s.sales]=(salUse[s.sales]||0)+1});
 const sales=[...new Set([...(k.sales||[])])].sort();
 const unsales=Object.keys(salUse).filter(x=>!sales.includes(x));
 const list=(arr,kind,use)=>arr.map((x,i)=>`<tr><td><b>${esc(x)}</b></td><td class="num">${use[x]||'–'}</td><td class="acts-r"><button class="btn sm ghost" data-act="listedit" data-kind="${kind}" data-v="${esc(x)}">Ubah</button><button class="btn sm ghost danger" data-act="listdel" data-kind="${kind}" data-v="${esc(x)}">Hapus</button></td></tr>`).join('');
 return `<div class="grid2"><section class="panel"><header><h2>Satuan</h2><span class="hint">pilihan kolom Satuan di SPK</span><button class="btn sm" data-act="listnew" data-kind="sat" style="margin-left:8px">${ic('plus')}Tambah</button></header><div class="tbl-wrap"><table><thead><tr><th>Satuan</th><th class="num">Dipakai (baris SPK)</th><th></th></tr></thead><tbody>${list(satList(),'sat',satUse)}</tbody></table></div></section>
 <section class="panel"><header><h2>Sales</h2><span class="hint">pilihan kolom Sales di SPK</span><button class="btn sm" data-act="listnew" data-kind="sales" style="margin-left:8px">${ic('plus')}Tambah</button></header>${unsales.length?`<div class="pbody note" style="color:var(--warn)">Nama sales di SPK yang belum ada di daftar: ${unsales.map(esc).join(', ')}. Ejaan berbeda (mis. "Bpk Yusep" vs "Bapak Yusep") membuat laporan per sales terpecah.</div>`:''}<div class="tbl-wrap"><table><thead><tr><th>Sales</th><th class="num">SPK</th><th></th></tr></thead><tbody>${list(sales,'sales',salUse)}</tbody></table></div></section></div>`;
}
function katItemForm(d){
 const X=katIndex();const x=d?X.arr.find(y=>y.d===d):{d:'',u:'Btg',w:{}};if(!x)return;
 const ws=Object.entries(x.w).sort((a,b)=>parseFloat(a[0])-parseFloat(b[0]));
 const wrow=(t,v,i)=>`<tr><td><input class="inp" name="t_${i}" id="m-t_${i}" value="${esc(t==='–'?'':t)}" placeholder="1.2" inputmode="decimal"></td><td><input class="inp" name="w_${i}" id="m-w_${i}" value="${esc(v)}" type="number" min="0" step="any" inputmode="decimal"></td></tr>`;
 openModal(d?'Ubah item katalog':'Tambah item katalog',fld('Description',inp('d',x.d,'text','required'),true)+fld('Satuan',`<select class="sel" name="u" id="m-u">${[...new Set([...satList(),x.u].filter(Boolean))].map(s=>`<option ${s===x.u?'selected':''}>${esc(s)}</option>`).join('')}</select>`)+
  `<div class="full"><label class="fldl">Berat per pcs menurut tebal plat</label><div class="tbl-wrap"><table class="lines"><thead><tr><th>Tebal (mm)</th><th>Berat (kg/pcs)</th></tr></thead><tbody>${ws.map(([t,v],i)=>wrow(t,v,i)).join('')}${wrow('','',ws.length)}${wrow('','',ws.length+1)}</tbody></table></div><div class="note">Kosongkan berat untuk menghapus baris. Tebal kosong = berlaku untuk semua tebal.</div></div>`+
  (d?`<div class="note full">Mengganti nama hanya mengubah katalog. SPK yang sudah tersimpan tetap memakai deskripsi lamanya.</div>`:''),
  async dd=>{const nd=String(dd.d||'').trim().replace(/\s+/g,' ');if(!nd)throw new Error('Description wajib diisi.');const X2=katIndex();if(nd!==d&&X2.arr.some(y=>y.d===nd))throw new Error('Description itu sudah ada di katalog. Pakai Gabungkan.');
   const w={};for(let i=0;i<ws.length+2;i++){const t=String(dd['t_'+i]||'').replace(',','.').trim(),v=num0(dd['w_'+i]);if(v>0)w[t?String(parseFloat(t)):'']=v}
   await katSave(k=>{if(d&&d!==nd){delete k.satuan[d];Object.keys(k.berat).forEach(key=>{if(key.slice(0,key.lastIndexOf('|'))===d)delete k.berat[key]});/* update merged aliases that pointed to old name */Object.keys(k.merged).forEach(alias=>{if(k.merged[alias]===d)k.merged[alias]=nd});if(k.merged[d])delete k.merged[d]}else if(d){delete k.satuan[d];Object.keys(k.berat).forEach(key=>{if(key.slice(0,key.lastIndexOf('|'))===d)delete k.berat[key]})}k.satuan[nd]=dd.u||'Pcs';Object.entries(w).forEach(([t,v])=>k.berat[nd+'|'+t]=v)})});
}
function katMergeForm(d){
 const X=katIndex();const x=X.arr.find(y=>y.d===d);if(!x)return;
 openModal('Gabungkan item katalog',fld('Item yang dihapus',`<div style="padding:8px 0"><b>${esc(d)}</b></div>`,true)+fld('Digabung ke',`<select class="sel" name="to" id="m-to">${x.sim.map(s=>`<option>${esc(s)}</option>`).join('')}</select>`,true)+`<div class="note full">Satuan & berat yang belum ada di item tujuan ikut dipindah, lalu "${esc(d)}" dihapus dari katalog sehingga tidak muncul lagi di form SPK. SPK lama tidak diubah.</div>`,
  async dd=>{const to=dd.to;await katSave(k=>{Object.keys(k.berat).forEach(key=>{const i=key.lastIndexOf('|');if(key.slice(0,i)===d){const nk=to+'|'+key.slice(i+1);if(!(nk in k.berat))k.berat[nk]=k.berat[key];delete k.berat[key]}});if(!k.satuan[to]&&k.satuan[d])k.satuan[to]=k.satuan[d];if(k.satuan[d])delete k.satuan[d];k.merged[d]=to})},{submit:'Gabungkan'});
}
function katDelForm(d){openModal('Hapus item katalog',`<div class="full">Hapus <b>${esc(d)}</b> dari katalog? Item tidak lagi muncul sebagai pilihan di form SPK. SPK yang sudah memakainya tidak berubah.</div>`,async()=>{await katSave(k=>{delete k.satuan[d];Object.keys(k.berat).forEach(key=>{if(key.slice(0,key.lastIndexOf('|'))===d)delete k.berat[key]});delete k.merged[d]})},{submit:'Hapus'})}
function grupForm(i){const k=KAT();const g=i!==undefined?(k.grup||[])[+i]:'';const hb=parseH(g);
 openModal(i!==undefined?'Ubah judul section':'Tambah judul section',`<div class="full ehb">`+['p','t','tb','f'].map(x=>`<select class="sel" id="m-hb-${x}" data-hbm="${x}">${opt(HB[x],hb[x],{p:'Produk',t:'Type',tb:'Tebal',f:'Finishing'}[x])}</select>`).join('')+`</div>`+fld('Judul section',inp('g',g,'text','required style="text-transform:uppercase"'),true),
  async d=>{const v=String(d.g||'').trim().toUpperCase().replace(/\s+/g,' ');if(!v)throw new Error('Isi judul.');await katSave(k=>{const a=k.grup||[];if(i!==undefined){const old=a[+i];a[+i]=v;k.grup=[...new Set(a)]}else{if(a.includes(v))throw new Error('Judul itu sudah ada.');k.grup=[v,...a]}})},
  {mount:f=>f.addEventListener('change',e=>{if(e.target.dataset.hbm){const o={};['p','t','tb','f'].forEach(x=>o[x]=$('#m-hb-'+x).value);f.g.value=composeH(o)}})});
}
function listForm(kind,v){const lbl=kind==='sat'?'satuan':'sales';openModal(`${v?'Ubah':'Tambah'} ${lbl}`,fld(kind==='sat'?'Satuan':'Nama sales',inp('v',v||'','text','required'),true)+(v&&kind==='sales'?`<label class="ck full"><input type="checkbox" name="ren" id="m-ren" checked> Ganti juga nama sales di SPK yang memakai "${esc(v)}"</label>`:''),
 async d=>{const nv=cleanName(d.v);if(!nv)throw new Error('Wajib diisi.');
  await katSave(k=>{const key=kind==='sat'?'satuanList':'sales';const a=(kind==='sat'?satList():k.sales||[]).slice();if(v){const i=a.indexOf(v);if(i>=0)a[i]=nv}else{if(a.includes(nv))throw new Error('Sudah ada.');a.push(nv)}k[key]=[...new Set(a)]});
  if(v&&kind==='sales'&&d.ren&&nv!==v){for(const s of S.spk.filter(s=>s.sales===v))await DB.doc('spk/'+s._id).update({sales:nv})}})}
async function listDel(kind,v){await katSave(k=>{if(kind==='sat'){k.satuanList=satList().filter(x=>x!==v)}else k.sales=(k.sales||[]).filter(x=>x!==v)});toast(`"${v}" dihapus dari daftar`)}

/* ---------- CSV ---------- */
async function exportCsv(what){
 const c=calc();let head,rows,name;
 if(what==='rm'){head=['Material','Ukuran','Lokasi','Kg/lbr','Min','Buffer','Stok (lbr)','Stok (kg)','Pakai/bln (lbr)','Cukup (hari)','Kelas','Status','Usulan order (lbr)'];rows=S.rm.filter(rmOn).map(r=>{const x=RMI(r._id);return [r.item,r.ukuran,r.lokasi||'',x.kg1.toFixed(2),x.min,x.buf,x.stok,Math.round(x.kg),Math.round(x.perBln),isFinite(x.cover)?Math.round(x.cover):'',x.abc,x.st,x.sug||'']})}
 else if(what==='fg'){head=['Kategori','Type','Ukuran','Panjang','Finishing','Tebal','Satuan','Stok'];rows=S.fg.map(r=>[r.kategori,r.type,r.ukuran,r.panjang,r.finishing,r.tebal,r.satuan,c.stock.fg[r._id]])}
 else if(what==='vendor'){head=['No SJ','Tanggal','Vendor','Proses','SPK','Customer','Kirim','Kembali','Sisa','Umur (hari)','Status'];rows=c.vend.map(x=>{const s=byId('spk',x.v.spk);return [x.v.noSJ,x.v.tgl,x.v.vendor,x.v.proses,s?.no,s?.customer,x.out,x.back,x.sisa,x.st==='Selesai'?'':x.age,x.st]})}
 else if(what==='kirim'){head=['No SJ','Tanggal','SPK','Customer','Item','Qty','Kendaraan','No Polisi','Driver','Status'];rows=S.kirim.flatMap(k=>(k.items||[]).map(i=>[k.noSJ,k.tgl,byId('spk',k.spk)?.no,k.customer,i.d,i.q,k.kendaraan,k.nopol,k.driver,k.status]))}
 else if(what==='bongkar'){head=['Tanggal','Jenis','Muatan','Pihak','Referensi','Kendaraan','No Polisi','Driver','Jam Masuk','Jam Mulai','Jam Selesai','Status'];rows=S.bongkar.map(b=>[b.tgl,b.jenis,b.muatan,b.pihak,b.ref,b.kendaraan,b.nopol,b.driver,b.jamMasuk,b.jamMulai,b.jamSelesai,b.status])}
 else if(what==='prodlog'){head=['SPK','Customer','PO','Tanggal Log','Item','Qty Produksi','Update oleh','Catatan'];rows=S.spk.flatMap(s=>logProduksi(s).flatMap(l=>(l.items||[]).map(i=>[s.no,s.customer,s.po,l.tgl,i.d,i.qw!=null?i.qw:i.q,l.by||'',l.ket||''])))}
 else{head=['SPK','Tanggal','Customer','PO','Sales','Material','Due','Produksi %','Terkirim %','Status','Telat (hari)'];rows=S.spk.map(s=>{const x=c.spk[s._id];return [s.no,s.tgl,s.customer,s.po,s.sales,s.material,s.due,Math.round(x.pP*100),Math.round(x.pK*100),x.st,x.late||'']})}
 const q=v=>{const s=String(v??'');return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
 const csv='﻿'+[head,...rows].map(r=>r.map(q).join(',')).join('\r\n');
 if(!DLS){toast('Unduhan tidak tersedia di tampilan ini.');return}
 try{await DLS.save({filename:`MNI-${what}-${today()}.csv`,data:new Blob([csv],{type:'text/csv'})})}catch(e){if(e.code!=='declined')toast('Gagal mengunduh: '+(e.message||e.code))}
}

const LOGO_B64='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';
const LOGO='data:image/png;base64,'+LOGO_B64;
/* SPK → .xlsx — fixed 17-col layout matching renderSheet() */
function buildSpkXlsx(ExcelJS,spk,ctx){
 const wb=new ExcelJS.Workbook();wb.creator='MNI Gudang & Logistik';
 const ws=wb.addWorksheet('SPK '+spk.no,{pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:0.2,right:0.2,top:0.3,bottom:0.3,header:0.2,footer:0.2}},views:[{showGridLines:false}]});
 // Fixed columns (0-based):
 // 0=No 1-3=Desc 4=QTY 5=Satuan 6=Brt/pcs 7=Brt/item 8=ProdSelesai 9=KirimVendor 10=BalikVendor 11=TerkirimCust 12=BlmProd 13=DiVendor 14=BlmKirim 15=PctProd 16=PctFin 17=PctKirim 18=Ket
 const cNo=0,cDesc=1,cQty=4,cSat=5,cBrp=6,cBri=7,cProd=8,cVkir=9,cVbal=10,cCust=11,cBP=12,cDV=13,cBK=14,cPP=15,cPF=16,cPK=17,cKet=18,last=18;
 const L=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
 // Column widths
 [10.9,18,12,12,10.3,9,9.3,9.4,12,11,15,13,13,11,11,10,10,10,28].forEach((w,i)=>ws.getColumn(i+1).width=w);
 [30,15,15,15,28.5,21.75,18.75,18.6,21,21].forEach((h,i)=>ws.getRow(i+1).height=h);
 const C=(r,c)=>ws.getCell(r,c+1);
 const thin={style:'thin',color:{argb:'FF000000'}};const box={top:thin,left:thin,bottom:thin,right:thin};
 const fill=a=>({type:'pattern',pattern:'solid',fgColor:{argb:a}});
 const GREEN='FF92D050',YEL='FFFFFF00',GREY='FFDBDBDB',BLUE='FFDDEBF7';
 const font=(o={})=>({name:o.mt?'Arial MT':'Arial',size:o.sz||10.5,bold:!!o.b,italic:!!o.i,color:{argb:o.c||'FF000000'}});
 const merge=(r1,c1,r2,c2)=>ws.mergeCells(r1,c1+1,r2,c2+1);
 const set=(r,c,v,st={})=>{const x=C(r,c);x.value=v;x.font=font(st);x.alignment={horizontal:st.h||'center',vertical:st.v||'middle',wrapText:st.wrap!==false};if(st.fill)x.fill=fill(st.fill);if(st.nf)x.numFmt=st.nf;if(st.border!==false)x.border=box;return x};
 const boxRange=(r1,c1,r2,c2,st={})=>{for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){const x=C(r,c);x.border=box;if(st.fill)x.fill=fill(st.fill)}};
 // ── Header rows 1-4 ──
 merge(1,0,1,last);set(1,0,KOP().nama,{sz:20,b:true,border:false});C(1,0).font={name:'Times New Roman',size:20,bold:true};
 merge(2,0,2,last);set(2,0,'Ruko Gravitas B2 No.1, Lavon, Wana Kerta',{mt:true,border:false,v:'top'});
 merge(3,0,3,last);set(3,0,'Kec. Sindang Jaya, Kab. Tangerang',{mt:true,border:false,v:'top'});
 if(ctx.logoB64){const id=wb.addImage({base64:ctx.logoB64,extension:'png'});ws.addImage(id,{tl:{col:0.05,row:0.05},ext:{width:250,height:66}})}
 // ── SPK title block rows 5-8 ──
 merge(5,0,8,1);set(5,0,'SURAT PERINTAH KERJA (SPK)',{sz:14,b:true});
 merge(5,2,8,7);set(5,2,`SPK ${spk.no}${spk.rev?` Rev.${spk.rev}`:''}`,{sz:26,b:true,fill:GREEN});boxRange(5,2,8,7,{fill:GREEN});
 const hl=8;merge(5,hl,5,last);set(5,hl,'WORKSHOP MNI',{sz:12.5,b:true});
 [['Nomor',': '+spk.nomor],['Tanggal',': '+ctx.tglLong],['Sales',': '+(spk.sales||'')]].forEach(([k,v],i)=>{set(6+i,hl,k,{mt:true,h:'left',border:false});merge(6+i,hl+1,6+i,last);set(6+i,hl+1,v,{mt:true,h:'left',border:false})});
 for(let c=hl;c<=last;c++){const x=C(8,c);x.border={...(x.border||{}),bottom:thin}}
 for(let rr=5;rr<=8;rr++){C(rr,hl).border={...(C(rr,hl).border||{}),left:thin};C(rr,last).border={...(C(rr,last).border||{}),right:thin}}
 // ── Row 9: Halaman / Lead time ──
 merge(9,0,9,1);set(9,0,'Halaman 1 dari 1',{mt:true,sz:10});merge(9,2,9,7);set(9,2,'',{});merge(9,hl,9,last);set(9,hl,'LEAD TIME : '+(spk.lead||'-'),{mt:true,b:true,h:'left'});
 // ── Row 10: Customer ──
 merge(10,0,10,5);set(10,0,`${spk.customer}${spk.po?' - '+spk.po:''}`,{sz:12.5,b:true,i:true,fill:YEL});
 for(let c=6;c<=last;c++){C(10,c).fill=fill(YEL);C(10,c).border={top:thin,bottom:thin}}C(10,last).border=box;
 // ── Rows 11-12: Table header ──
 merge(11,cNo,12,cNo);set(11,cNo,'No',{b:true,fill:GREY});
 merge(11,cDesc,11,cDesc+2);set(11,cDesc,'DESCRIPTION',{b:true,fill:GREY});
 merge(11,cQty,12,cQty);set(11,cQty,'QTY',{b:true,fill:GREY});
 merge(11,cSat,12,cSat);set(11,cSat,'Satuan',{b:true,fill:GREY});
 merge(11,cBrp,12,cBrp);set(11,cBrp,'Berat/pcs',{b:true,fill:GREY});
 merge(11,cBri,12,cBri);set(11,cBri,'Berat/item',{b:true,fill:GREY});
 merge(11,cProd,12,cProd);set(11,cProd,'Produksi\nSelesai',{b:true,fill:GREY});
 merge(11,cVkir,11,cVbal);set(11,cVkir,'Subcont / Vendor',{b:true,fill:YEL});
 set(12,cVkir,'Kirim',{b:true,fill:YEL});set(12,cVbal,'Balik',{b:true,fill:BLUE});
 merge(11,cCust,12,cCust);set(11,cCust,'Terkirim\nCustomer',{b:true,fill:GREY});
 merge(11,cBP,11,cBK);set(11,cBP,'KEKURANGAN',{b:true,fill:GREEN});
 set(12,cBP,'Blm Produksi',{b:true,fill:GREEN,sz:9});set(12,cDV,'Di Vendor',{b:true,fill:GREEN,sz:9});set(12,cBK,'Blm Kirim',{b:true,fill:GREEN,sz:9});
 merge(11,cPP,11,cPK);set(11,cPP,'PROGRESS ( % )',{b:true,fill:GREY});
 set(12,cPP,'Produksi',{b:true,fill:GREY,sz:9});set(12,cPF,'Finishing',{b:true,fill:GREY,sz:9});set(12,cPK,'Kirim',{b:true,fill:GREY,sz:9});
 merge(11,cKet,12,cKet);set(11,cKet,'Keterangan',{b:true,fill:GREY});
 // ── Section header in row 12 col desc ──
 const secs=[];for(const it of spk.items||[]){const g=it.g||'';if(!secs.length||secs[secs.length-1].h!==g)secs.push({h:g,lines:[]});secs[secs.length-1].lines.push(it)}
 if(secs[0]?.h){set(12,cDesc,secs[0].h,{b:true,fill:YEL,h:'left'});merge(12,cDesc,12,cDesc+2)}
 // Aggregate vendor/return/customer qty per item
 const vByItem={},rByItem={},cByItem={};
 ctx.vend.forEach(v=>Object.entries(v.map).forEach(([d,q])=>vByItem[d]=(vByItem[d]||0)+q));
 ctx.ret.forEach(v=>Object.entries(v.map).forEach(([d,q])=>rByItem[d]=(rByItem[d]||0)+q));
 ctx.cust.forEach(v=>Object.entries(v.map).forEach(([d,q])=>cByItem[d]=(cByItem[d]||0)+q));
 // ── Item rows starting at row 13 ──
 let r=13,no=0;const itemRows=[];
 secs.forEach((s,si)=>{
  if(si>0&&s.h){ws.getRow(r).height=21;merge(r,cDesc,r,cDesc+2);set(r,cDesc,s.h,{b:true,fill:YEL,h:'left'});for(let c=0;c<=last;c++){if(c<cDesc||c>cDesc+2)C(r,c).border=box}r++}
  s.lines.forEach(it=>{no++;ws.getRow(r).height=21;
   set(r,cNo,no,{b:true});merge(r,cDesc,r,cDesc+2);
   const xd=C(r,cDesc);xd.value=it.ket?{richText:[{text:it.d+' ',font:font({mt:true})},{text:'('+it.ket+')',font:font({mt:true,c:'FFFF0000'})}]}:it.d;xd.font=font({mt:true});xd.alignment={horizontal:'left',vertical:'middle',wrapText:true};xd.border=box;
   set(r,cQty,+it.q||0,{mt:true,nf:'0'});set(r,cSat,it.u||'');
   set(r,cBrp,+it.w||null,{mt:true,nf:'0.00'});
   set(r,cBri,{formula:`${L(cBrp)}${r}*${L(cQty)}${r}`},{mt:true,nf:'0.00'});
   const ln=(ctx.lines||{})[it.d]||{prodEff:0,kirim:0};const rj=(ctx.rej||{})[it.d]||0;
   const vS=vByItem[it.d]||0,rS=rByItem[it.d]||0,cS=cByItem[it.d]||0;
   const blmProd=Math.max(0,(+it.q||0)-ln.prodEff);
   const diVendor=Math.max(0,vS-rS-rj);
   const blmKirim=Math.max(0,(rS||ln.prodEff)-ln.kirim);
   const pP=+it.q?Math.min(1,ln.prodEff/(+it.q)):0;
   const pF=+it.q?Math.min(1,rS/(+it.q)):0;
   const pK=+it.q?Math.min(1,ln.kirim/(+it.q)):0;
   set(r,cProd,ln.prodEff||null,{mt:true,nf:'0'});
   set(r,cVkir,vS||null,{mt:true,nf:'0'});
   const balCell=C(r,cVbal);balCell.value=rS||null;balCell.numFmt='0';balCell.border=box;balCell.alignment={horizontal:'center',vertical:'middle'};
   if(vS>0&&rS<vS)balCell.fill=fill('FFFCE4D6');
   set(r,cCust,cS||null,{mt:true,nf:'0'});
   const bpC=C(r,cBP);bpC.value=blmProd||null;bpC.numFmt='0';bpC.border=box;bpC.alignment={horizontal:'center',vertical:'middle'};if(blmProd>0)bpC.fill=fill('FFFCE4D6');
   const dvC=C(r,cDV);dvC.value=vS>0?(diVendor||null):null;dvC.numFmt='0';dvC.border=box;dvC.alignment={horizontal:'center',vertical:'middle'};if(diVendor>0)dvC.fill=fill('FFFCE4D6');
   const bkC=C(r,cBK);bkC.value=blmKirim||null;bkC.numFmt='0';bkC.border=box;bkC.alignment={horizontal:'center',vertical:'middle'};if(blmKirim>0)bkC.fill=fill('FFFCE4D6');
   set(r,cPP,pP,{mt:true,nf:'0%'});set(r,cPF,vS>0?pF:null,{mt:true,nf:'0%'});set(r,cPK,pK,{mt:true,nf:'0%'});
   set(r,cKet,(it.catatan||'')+(rj?` (reject ${rj})`:''),{mt:true,h:'left'});
   itemRows.push(r);r++});
 });
 // ── Spacer + totals ──
 for(let c=0;c<=last;c++)C(r,c).border=box;r++;
 const f1=itemRows[0]||13,f2=itemRows[itemRows.length-1]||13;
 merge(r,cDesc,r,cDesc+2);set(r,cDesc,'Total',{mt:true,b:true});set(r,cNo,'',{});
 set(r,cQty,{formula:`SUM(${L(cQty)}${f1}:${L(cQty)}${f2})`},{mt:true,nf:'0'});set(r,cSat,'Btg/Pcs',{mt:true});
 set(r,cBrp,'',{});
 const totBri=C(r,cBri);totBri.value={formula:`SUM(${L(cBri)}${f1}:${L(cBri)}${f2})`};totBri.numFmt='0.00';totBri.border=box;totBri.alignment={horizontal:'center',vertical:'middle'};
 set(r,cProd,'Kg',{mt:true});
 for(let c=cVkir;c<=cBK;c++)set(r,c,'',{});
 set(r,cPP,{formula:`AVERAGE(${L(cPP)}${f1}:${L(cPP)}${f2})`},{mt:true,nf:'0%'});
 set(r,cPF,{formula:`AVERAGE(${L(cPF)}${f1}:${L(cPF)}${f2})`},{mt:true,nf:'0%'});
 set(r,cPK,{formula:`AVERAGE(${L(cPK)}${f1}:${L(cPK)}${f2})`},{mt:true,nf:'0%'});
 set(r,cKet,'',{});const tr=r;r+=2;
 {const k2=spkKgDua(spk);if(k2.ada)set(tr+1,1,'Kg estimasi (plate): '+(Math.round(k2.te*100)/100)+'   ·   Kg real (barang jadi): '+(Math.round(k2.tr*100)/100),{sz:9,b:true,border:false,h:'left',wrap:false})}
 // ── Footer: note, dist, signatures ──
 merge(r,0,r+1,5);set(r,0,spk.note||'',{b:true,i:true});boxRange(r,0,r+1,5);ws.getRow(r+1).height=35;
 const dc=Math.min(hl+1,last-3);
 merge(r,dc,r,dc+1);set(r,dc,'Distributed to:',{mt:true,border:false,h:'left',wrap:false});
 (spk.dist||[]).forEach((d,i)=>{const rr=r+i;merge(rr,dc+2,rr,last);set(rr,dc+2,'~ '+d,{mt:true,border:false,h:'left',wrap:false})});
 r+=Math.max(4,(spk.dist||[]).length)+1;
 set(r,1,'Procurement/Estimator',{b:true,border:false,h:'left'});set(r,9,'PPIC',{b:true,border:false,h:'left'});
 set(r+6,1,`( ${spk.signProc||''} )`,{b:true,border:false,h:'left',wrap:false});set(r+6,9,`( ${spk.signPpic||''} )`,{b:true,border:false,h:'left',wrap:false});
 if(spk.status==='Terbit'&&ctx.issued)set(r+7,1,ctx.issued,{sz:8,border:false,h:'left',c:'FF666666'});
 ws.pageSetup.printArea=`A1:${L(last)}${r+7}`;
 return wb;
}


/* ---------- SPK module: editor, document view, Excel ---------- */
const BLN_L=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const tglLong=s=>{if(!s)return '';const p=String(s).slice(0,10).split('-');return `${+p[2]} ${BLN_L[+p[1]-1]} ${p[0]}`};
const fdS=s=>{if(!s)return '';const p=String(s).slice(0,10).split('-');return `${p[2]}/${p[1]}/${p[0].slice(2)}`};
const leadMax=t=>{const m=String(t||'').match(/\d+/g);return m?Math.max(...m.map(Number)):0};
function addWorkdays(s,n){if(!s)return '';const d=new Date(s+'T00:00:00');let k=0;while(k<n){d.setDate(d.getDate()+1);const w=d.getDay();if(w!==0&&w!==6)k++}return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
const thkOf=h=>{const m=String(h||'').toUpperCase().match(/(\d+(?:[.,]\d+)?)\s*(?:MM\s*)?(ELECTRO|HOTDIP|HOT DIP|STAINLESS|POWDER|ALU|PDC|PAINT|NON|GALV)/);return m?m[1].replace(',','.'):''};
const KAT=()=>byId('master','katalog')||{berat:{},satuan:{},grup:[],customer:[],sales:[]};
function beratOf(d,h){const k=KAT().berat||{};const t=thkOf(h);if(k[d+'|'+t])return k[d+'|'+t];const tf=t?String(parseFloat(t)):'';for(const key in k){const[kd,kt]=key.split('|');if(kd===d&&kt&&parseFloat(kt)===parseFloat(tf))return k[key]}const fromCat=k[d+'|']||0;if(fromCat)return fromCat;return weightCalc(d,h)||0}
/* weightCalc: hitung berat per pcs dari dimensi produk berdasarkan template Excel
   Reference: REAL kg/pcs dari sheet SLU/SLW/SLHD/SLHDC/STC/STU (bj=7.85)
   Scaling: berat ∝ l (straight) dan ∝ t (semua tipe) */
/* Berat per pcs dari kalkulator berat (katalog rumus Excel di database). 0 bila katalog belum terpasang atau item tidak dikenali:
   lebih baik kosong (diisi manual) daripada angka perkiraan yang salah. */
function weightInfo(desc,sectionHeader){bjHook();const B=window.MNIBerat;if(!B||!B.siap())return null;return B.hitungItem({judulSection:sectionHeader,deskripsi:desc,material:ED?ED.material:'',tebal:ED?(parseFloat(ED.tebal)||null):null})}
function weightCalc(desc,sectionHeader){const r=weightInfo(desc,sectionHeader);return r&&r.ok?Math.round(r.beratSPK*1000)/1000:0}
function wTag(tr,L){const td=tr.querySelector('.c-w');if(!td)return;if(tr.closest('.edr')){const wi=td.querySelector('[data-f=w]');if(wi){const ro=!!(L.sb&&edKatalogSiap());wi.readOnly=ro;wi.tabIndex=ro?-1:0;/* terkunci: tampil 2 desimal berkoma (13,51), bukan 13.513 */if(ro){wi.type='text';wi.value=(+L.w)?kgF(L.w):''}else{if(wi.type!=='number'){wi.type='number';wi.value=L.w===''||L.w==null?'':L.w}}}}let s=td.querySelector('.wtag');if(!L.wsrc){if(s)s.remove();return}
 if(!s){s=document.createElement('span');td.appendChild(s)}s.className='wtag '+L.wsrc;s.textContent=L.wsrc==='kalkulator'?'auto':'manual';s.title=L.wsrc==='kalkulator'?'Dihitung otomatis dari kalkulator berat. Ubah angkanya untuk menimpa.':'Diisi atau diubah manual.'}
/* hitung ulang baris yang berat otomatisnya bergantung pada judul section, material, atau tebal; yang manual tidak disentuh */
function edHitungUlang(){let k=0;for(const s of ED.sections){k+=edSesuaikanBaris(s);for(const l of s.lines){if(l.sb)continue;if(!l.d||!(l.wsrc==='kalkulator'||(!l.w&&!l.wsrc)))continue;const wi=weightInfo(l.d,s.h);if(wi&&wi.ok){const w=Math.round(wi.beratSPK*1000)/1000;if(w!==l.w||l.wsrc!=='kalkulator'){l.w=w;l.wsrc='kalkulator';k++}}}}
 if(k){rerenderSecs();toast(`${k} berat dihitung ulang dari kalkulator`)}}
function derive(h){const H=String(h||'').toUpperCase();let fin='';if(H.includes('ELECTRO'))fin='ELG';else if(H.includes('HOTDIP')||H.includes('HOT DIP'))fin='HDG';else if(H.includes('POWDER')||H.includes('PDC'))fin='PDC';else if(H.includes('NON'))fin='Non Finishing';
 let base='SPHC';if(H.includes('STAINLESS')||/SS ?3\d\d/.test(H))base=H.includes('316')?'SS316':'SS304';else if(H.includes('ALU'))base='Aluminium';
 return {material:(base==='SPHC'&&fin)?`SPHC / ${fin}`:base,tebal:thkOf(h),type:(H.match(/TYPE\s+([A-Z]+)/)||[])[1]||''}}
const DIST_DEF0=['PPIC','Produksi (CNC / Shearing / Bending / Punching Jointing / Punching Tray)','Procurement','Logistic'];
const HB_DEF={p:['CABLE TRAY','PERFORATED CABLE TRAY','CABLE LADDER','CABLE DUCT','ACCS TRAY','ACCS LADDER','ACCS DUCT','COVER TRAY','COVER LADDER','COVER DUCT','OTHER SUPPORT'],t:['STU','STC','SLU','SLHD','SLHDC','SLW','C','U'],tb:['1.0','1.2','1.5','1.6','1.8','2.0','2.5','3.0'],f:['ELECTRO GALVANIZED','HOTDIP GALVANIZED','STAINLESS STEEL 304','STAINLESS STEEL 316L','POWDER COATING WHITE','POWDER COATING ORANGE RAL 2000','POWDER COATING BLUE RAL 5017','ALUMINIUM 1100','NON FINISHING']};
const LEAD_DEF=['2 Hari Kerja','3 Hari Kerja','5 Hari Kerja','5 - 7 Hari Kerja','7 Hari Kerja','7 - 10 Hari Kerja','10 Hari Kerja','14 Hari Kerja'];
/* Opsi SPK dari Master Data (master/setting.spkOpsi); tanpa isian memakai bawaan. Mengubah opsi tidak mengubah SPK yang sudah ada. */
const OPSI_DEF={p:HB_DEF.p,t:HB_DEF.t,tb:HB_DEF.tb,f:HB_DEF.f,dist:null,lead:LEAD_DEF,signProc:'Halimah',signPpic:'Muin M.K.'};
/* Daftar section bawaan lama: bila daftar tersimpan di Opsi SPK persis sama (belum pernah diubah pemilik), pakai bawaan baru; daftar yang diubah pemilik tetap dihormati. */
const PRODUK_BAWAAN_LAMA=JSON.stringify(['CABLE TRAY','PERFORATED CABLE TRAY','CABLE LADDER','CABLE DUCT','COVER TRAY','ACCS TRAY','ACCS LADDER','ACCS DUCT','SUPPORT TRAY','WIREMESH CABLE TRAY']);
const OPSI=()=>{const o=(byId('master','setting')||{}).spkOpsi||{};const r={...OPSI_DEF,dist:DIST_DEF0.slice()};for(const k of Object.keys(r)){const v=o[k];if(k==='p'&&JSON.stringify(v)===PRODUK_BAWAAN_LAMA)continue;if(Array.isArray(r[k])?(Array.isArray(v)&&v.length):(typeof v==='string'&&v.trim()))r[k]=v}return r};
const HB={get p(){return OPSI().p},get t(){return OPSI().t},get tb(){return OPSI().tb},get f(){return OPSI().f}};
/* produk lama (tidak ada lagi di daftar section) tetap terbaca agar SPK lama bisa dibuka dan diedit */
const PRODUK_LAMA=['SUPPORT TRAY','WIREMESH CABLE TRAY'];
function parseH(h){const H=String(h||'').toUpperCase();const o={p:'',t:'',tb:'',f:''};o.p=[...HB.p,...PRODUK_LAMA].sort((a,b)=>b.length-a.length).find(x=>H.startsWith(x))||'';o.t=(H.match(/TYPE\s+([A-Z]+)/)||[])[1]||'';const tk=thkOf(H);o.tb=HB.tb.find(x=>parseFloat(x)===parseFloat(tk))||'';o.f=HB.f.find(x=>H.endsWith(x))||'';return o}
const composeH=o=>[o.p,o.t?'TYPE '+o.t:'',o.tb,o.f].filter(Boolean).join(' ');
const coverOf=h=>String(h||'').replace(/^(PERFORATED CABLE TRAY|CABLE TRAY|ACCS TRAY|COVER TRAY|SUPPORT TRAY|WIREMESH CABLE TRAY)/,'COVER TRAY').replace(/^(CABLE LADDER|ACCS LADDER|COVER LADDER)/,'COVER LADDER').replace(/^(CABLE DUCT|ACCS DUCT|COVER DUCT)/,'COVER DUCT');
const accsOf=h=>String(h||'').replace(/^PERFORATED CABLE TRAY|^CABLE TRAY|^COVER TRAY/,'ACCS TRAY').replace(/^CABLE LADDER|^COVER LADDER/,'ACCS LADDER').replace(/^CABLE DUCT|^COVER DUCT/,'ACCS DUCT');
const nextNo=()=>Math.max(0,...S.spk.map(s=>+s.no||0))+1;
const blankLine=()=>({d:'',q:'',u:'Btg',w:'',ket:'',catatan:'',prod:0});
/* ----- input item terstruktur: bentuk dan ukuran per section, nama dan berat otomatis dari kalkulator ----- */
const AKSESORI_PRODUK=['ACCS TRAY','ACCS LADDER','ACCS DUCT','OTHER SUPPORT'];
/* Cable Duct = Cable Tray tanpa lubang: masukan berat sama, memakai kolom berat tanpa lubang */
const TANPA_LUBANG=new Set(['CABLE DUCT']);
const kunciDariId=id=>String(id||'').replace(/_(STU|STC|SLU|SLW|SLHDC|SLHC|SLHD)(_.*)?$/,'');
/* Bendera layout SPK per dimensi (T-222 tahap 2): kolom W, H, L terpisah, bentuk selalu terlihat, kg estimasi dan real. Mati secara bawaan. */
/* Massa jenis dari Master Data (Bahan baku > Jenis material): kalkulator berat SPK memakai angka yang sama dengan stok bahan baku. */
function bjMaster(mat){const s=String(mat||'').trim();if(!s)return 0;const g=GRADES().find(x=>x.toLowerCase()===s.toLowerCase())||grade({item:s});return g&&g!=='Lainnya'?densG(g):0}
function bjHook(){const B=window.MNIBerat;if(B&&B.setMassaJenisMaster&&!B._bjHooked){B.setMassaJenisMaster(bjMaster);B._bjHooked=true}}
/* Layout input SPK per dimensi: NONAKTIF bawaan (editor SPK versi sebelumnya dipakai). Aktif hanya bila pemilik menyalakannya di Master Data › Opsi SPK, atau oleh uji (window.__SPK_DIM_NEW). */
function spkDimBaru(){const v=(byId('master','setting')||{}).spkDimBaru;if(v!==undefined)return !!v;return !!window.__SPK_DIM_NEW}
/* Langkah rute (rute standar dan rute khusus) yang namanya tidak ada di Work Centre master: antrian langkah itu tidak akan muncul di Produksi Hari Ini. */
function ruteWcHilang(){const P=PXL();if(!P)return [];const ada=new Set(S.mwc.filter(w=>w.aktif!==false&&w.tipe!=='Subcont').map(w=>String(w.nama).trim().toLowerCase()));const miss=new Set();Object.values(ruteStd()).forEach(r=>(r||[]).forEach(w=>{if(!P.langkahVendor(w)&&!ada.has(String(w).trim().toLowerCase()))miss.add(w)}));return [...miss]}
const _bMesinAsli=B.mesin;
B.mesin=()=>{const h=ruteWcHilang();const bn=h.length?`<div class="ro" style="margin-bottom:10px"><b>Rute produksi memakai Work Centre yang belum ada di Master Data:</b> ${h.map(esc).join(', ')}. Antrian untuk langkah ini tidak akan muncul. <button type="button" class="btn sm" data-act="wcfix">Tambahkan otomatis</button> atau samakan namanya di <a href="#master-data">Master Data › Work Centre</a>.</div>`:'';return bn+_bMesinAsli()};
/* Produksi Hari Ini versi admin: progres per item + laporan per tebal / tipe produk / material / finishing / customer (qty dan tonase).
   Sumber angka: selesai per item dari calc() (catatan mesin dan total manual admin), jadi sama untuk kedua cara input. Tonase = selesai x berat per pcs item (kg). */
function bProduksiAdmin(){
 const P=PXL();const f=F.mesin;const c=calc();const grp=f.grp||'tebal',cak=f.cak||'aktif';
 const kl=(it,s)=>P?P.klasifikasi(it.g,it.d,s.material):{kelompok:'',tipe:'',material:'',finishing:''};
 const GR={tebal:['Tebal',(it)=>{const x=thkOf(it.g);return x?x+' mm':'(tanpa tebal)'}],tipe:['Tipe produk',(it,s)=>{const k=kl(it,s);return [k.kelompok,k.tipe].filter(Boolean).join(' ')||'(lainnya)'}],material:['Material',(it,s)=>kl(it,s).material||'(tanpa material)'],finishing:['Finishing',(it,s)=>kl(it,s).finishing||'(tanpa finishing)'],customer:['Customer',(it,s)=>s.customer||'(tanpa customer)']};
 if(!GR[grp])f.grp='tebal';
 const spks=S.spk.filter(s=>s.status==='Terbit'&&(cak==='semua'||((c.spk[s._id]||{}).st!=='Selesai'))).sort((x,y)=>String(x.due||'9999').localeCompare(String(y.due||'9999'))||(+x.no||0)-(+y.no||0));
 const rows=[],agg={};let tanpaBerat=0;
 spks.forEach(s=>{const x=c.spk[s._id]||{};
  (s.items||[]).forEach((it,k)=>{const q=+it.q||0;if(!(q>0))return;const eff=Math.min(q,((x.lines||[])[k]||{}).prodEff||0);const w=+it.w||0;if(!w)tanpaBerat++;const pct=Math.round(eff/q*100);
   const key=GR[f.grp||'tebal'][1](it,s);const a=agg[key]||(agg[key]={n:0,q:0,e:0,tq:0,te:0});a.n++;a.q+=q;a.e+=eff;a.tq+=q*w;a.te+=eff*w;
   rows.push(`<tr><td class="mono"><b>${esc(String(s.no))}</b></td><td>${esc(s.customer||'')}</td><td>${esc(it.d||'')}</td><td class="num">${n(q)} ${esc(it.u||'')}</td><td class="num"><b>${n(eff)}</b></td><td class="num">${n(Math.max(0,q-eff))}</td><td class="num">${w?n(Math.round(eff*w*10)/10):'–'}</td><td>${pct>=100?chip('Selesai','ok'):pct>0?chip(pct+'%','info'):chip('Belum mulai','warn')}</td><td>${fd(s.due)}</td><td class="act"><button class="btn sm primary" data-act="prod" data-id="${esc(s._id)}">Isi hasil</button></td></tr>`)})});
 if(!rows.length)return empty('Tidak ada item untuk diproduksi','SPK yang sudah terbit dan belum selesai akan muncul di sini.');
 const opt=(o,v)=>Object.entries(o).map(([k,l])=>`<option value="${k}"${v===k?' selected':''}>${esc(Array.isArray(l)?l[0]:l)}</option>`).join('');
 const keys=Object.keys(agg).sort((p,q2)=>p.localeCompare(q2,undefined,{numeric:true}));
 const T0=keys.reduce((o,k)=>({n:o.n+agg[k].n,q:o.q+agg[k].q,e:o.e+agg[k].e,tq:o.tq+agg[k].tq,te:o.te+agg[k].te}),{n:0,q:0,e:0,tq:0,te:0});
 const bar=(a)=>{const p=a.q?Math.round(a.e/a.q*100):0;return `<span class="bar" style="display:inline-block;width:70px;height:7px;background:var(--line);border-radius:4px;overflow:hidden;vertical-align:middle"><i style="display:block;height:100%;width:${p}%;background:var(--accent)"></i></span> ${p}%`};
 const lap=keys.map(k=>{const a=agg[k];return `<tr><td><b>${esc(k)}</b></td><td class="num">${a.n}</td><td class="num">${n(a.q)}</td><td class="num"><b>${n(a.e)}</b></td><td class="num">${n(Math.max(0,a.q-a.e))}</td><td class="num">${n(Math.round(a.tq))}</td><td class="num"><b>${n(Math.round(a.te))}</b></td><td>${bar(a)}</td></tr>`}).join('');
 return `<div class="pbody note">Laporan produksi sementara diisi satu admin: klik <b>Isi hasil</b> pada SPK, isi jumlah yang sudah selesai per item, lalu simpan. Item selesai siap dikirim ke vendor atau customer. Tidak ada laporan per Work Centre.</div>
 <section class="panel"><header><h2>Laporan produksi</h2><span class="hint">qty dan tonase (kg)</span></header><div class="pbody" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><label class="note">Kelompokkan menurut <select class="sel" id="f-prod-grp" data-act="filtsel" data-view="mesin" data-key="grp">${opt(GR,f.grp||'tebal')}</select></label><label class="note">Cakupan <select class="sel" id="f-prod-cak" data-act="filtsel" data-view="mesin" data-key="cak">${opt({aktif:'SPK aktif',semua:'Semua SPK terbit'},cak)}</select></label></div>
 <div class="tablewrap"><table id="prod-lap"><thead><tr><th>${esc(GR[f.grp||'tebal'][0])}</th><th class="num">Item</th><th class="num">Target qty</th><th class="num">Selesai qty</th><th class="num">Sisa qty</th><th class="num">Target kg</th><th class="num">Selesai kg</th><th>Progres</th></tr></thead><tbody>${lap}<tr><td><b>Total</b></td><td class="num">${T0.n}</td><td class="num">${n(T0.q)}</td><td class="num"><b>${n(T0.e)}</b></td><td class="num">${n(Math.max(0,T0.q-T0.e))}</td><td class="num">${n(Math.round(T0.tq))}</td><td class="num"><b>${n(Math.round(T0.te))}</b></td><td>${bar(T0)}</td></tr></tbody></table></div>${tanpaBerat?`<div class="pbody note">${tanpaBerat} item belum punya berat per pcs, tonasenya dihitung 0.</div>`:''}</section>
 <section class="panel"><header><h2>Progres per item SPK</h2><span class="hint">${rows.length} item</span></header><div class="tablewrap"><table><thead><tr><th>SPK</th><th>Customer</th><th>Item</th><th class="num">Target</th><th class="num">Selesai</th><th class="num">Sisa</th><th class="num">Selesai kg</th><th>Status</th><th>Due</th><th></th></tr></thead><tbody>${rows.join('')}</tbody></table></div></section>`}
/* F-11: barang yang sudah selesai produksi (laporan admin atau catatan mesin) dan rutenya punya langkah vendor, tetapi belum dikirim ke vendor.
   Hanya item dengan kesiapan yang diketahui (vSiap) yang tampil; jumlah = selesai dikurangi yang sudah di vendor, tidak melebihi sisa order. */
function siapVendorRows(){const c=calc();const P=PXL();const out=[];if(!P)return out;
 S.spk.forEach(s=>{if(s.status!=='Terbit')return;const x=c.spk[s._id];if(!x||x.st==='Selesai'||x.st==='Batal')return;
  (x.lines||[]).forEach((l,k)=>{const it=(s.items||[])[k];if(!it||l.vSiap==null)return;const vN=itemRuteInfo(it).rute.find(P.langkahVendor);if(!vN)return;
   const siap=sisaLine(l,'vendor');if(!(siap>0))return;out.push({s,it,k,l,vN,siap})})});
 return out}
function siapVendorHtml(){const f=F.vendor;if(f.st==='selesai')return '';const R=siapVendorRows();
 const kepala='<header><h2>Siap dikirim ke vendor</h2><span class="hint">'+R.length+' item</span></header>';
 if(!R.length)return '<section class="panel" id="siap-vendor">'+kepala+'<div class="pbody note">Belum ada barang selesai yang menunggu dikirim ke vendor. Setelah admin mengisi hasil produksi di Produksi Hari Ini, barang selesai yang rutenya punya proses vendor muncul di sini.</div></section>';
 const per=[];const idx={};R.forEach(r=>{if(idx[r.s._id]==null){idx[r.s._id]=per.length;per.push({s:r.s,rows:[]})}per[idx[r.s._id]].rows.push(r)});
 const tot=R.reduce((a,r)=>a+r.siap,0);
 const baris=per.map(g=>g.rows.map((r,i)=>'<tr>'+(i===0?'<td rowspan="'+g.rows.length+'" class="mono"><b>'+esc(String(g.s.no))+'</b><div class="note">'+esc(g.s.customer||'')+'</div></td>':'')+'<td>'+esc(sjNama(g.s._id,r.it).d)+'</td><td>'+esc(r.vN)+'</td><td class="num">'+n(r.l.prodEff||0)+'</td><td class="num">'+n(r.l.vOut||0)+'</td><td class="num"><b>'+n(r.siap)+' '+esc(r.it.u||'')+'</b></td>'+(i===0?'<td rowspan="'+g.rows.length+'">'+fd(g.s.due)+'</td><td rowspan="'+g.rows.length+'" class="act"><button class="btn sm primary" data-act="newvendor" data-spk="'+esc(g.s._id)+'">Kirim ke vendor</button></td>':'')+'</tr>').join('')).join('');
 return '<section class="panel" id="siap-vendor">'+kepala+'<div class="pbody note">Barang yang sudah selesai produksi dan rutenya punya proses vendor. Klik <b>Kirim ke vendor</b> untuk membuat surat jalan; jumlah kirim tidak bisa melebihi yang sudah selesai ('+n(tot)+' siap kirim).</div><div class="tbl-wrap"><table><thead><tr><th>SPK</th><th>Item</th><th>Proses vendor</th><th class="num">Selesai</th><th class="num">Sudah di vendor</th><th class="num">Siap kirim</th><th>Due</th><th></th></tr></thead><tbody>'+baris+'</tbody></table></div></section>'}
const _bVendorF11=B['vendor'];B['vendor']=()=>siapVendorHtml()+_bVendorF11();
const _bMesinAdm=B.mesin;B.mesin=()=>produksiAdmin()?bProduksiAdmin():_bMesinAdm();
const _tMesinAdm=T.mesin;T.mesin=()=>produksiAdmin()?'<span class="grow"></span><span class="note">Laporan produksi terpusat (admin)</span>':_tMesinAdm();
const SHAPE_LURUS_FB={id:'STRAIGHT',kunci:'STRAIGHT',nama:'Straight',dim:[{k:'w',label:'W'},{k:'h',label:'H'},{k:'l',label:'L'}],fullHole:false};
const PRODUK_LURUS_FB=new Set(['CABLE TRAY','PERFORATED CABLE TRAY','CABLE LADDER','CABLE DUCT']);
/* tanpa katalog berat: batang lurus tetap bisa diisi W, H, L; kg dihitung setelah katalog dipasang */
function edCapTanpaKatalog(s){const hb=parseH(s.h);if(!hb.p||!PRODUK_LURUS_FB.has(hb.p))return null;return {fam:null,prod:hb.p,shapes:[SHAPE_LURUS_FB],all:[SHAPE_LURUS_FB],fallback:true}}
/* kolom dimensi terpisah: gabungan dimensi semua bentuk yang diizinkan di section */
function edDimCols(cap){const out=[],seen=new Set();cap.shapes.forEach(x=>x.dim.forEach(d=>{if(!seen.has(d.k)){seen.add(d.k);out.push(d)}}));return out}
/* kg per pcs dari katalog (estimasi = plate yang diambil, real = barang jadi); null bila belum bisa dihitung */
function edKgPair(s,l,cap){const B=window.MNIBerat;if(!cap||cap.fallback||!l.sb||!B||!B.kgPerPcs)return null;const dv=derive(s.h);const r=B.kgPerPcs({keluarga:cap.fam,bentuk:l.sb,dim:l.dim||{},tebal:dv.tebal||thkOf(s.h),material:dv.material,lubang:l.lubang});return r&&r.ok?r:null}
function edKgSub(s,l,cap){const r=edKgPair(s,l,cap);return r?'<div class="kgsub">est '+n(Math.round(r.kgPcsEst*100)/100)+' · real '+n(Math.round(r.kgPcsReal*100)/100)+' Kg</div>':''}
function edCap(s){bjHook();const B=window.MNIBerat;if(!B||!B.siap||!B.siap()||!B.keluargaDari)return spkDimBaru()?edCapTanpaKatalog(s):null;const hb=parseH(s.h);const fam=B.keluargaDari(s.h);if(!fam||!hb.p)return null;if(B.setAturan)B.setAturan((byId('master','setting')||{}).aturanSection);const shapes=B.bentukProduk(fam,hb.p);if(!shapes.length&&!(B.produkBentuk&&B.produkBentuk().includes(hb.p)))return null;return {fam,prod:hb.p,shapes,all:B.bentukSemua?B.bentukSemua(fam):shapes}}
/* Perforated Cable Tray otomatis Full hole; produk lain Bawah. Pilihan manual pengguna (lubangManual) tidak diganti oleh bawaan. */
const lubangBawaan=cap=>cap&&TANPA_LUBANG.has(cap.prod)?'tanpa':cap&&cap.prod==='PERFORATED CABLE TRAY'?'full':'standar';
function lineBaru(h){const l=blankLine();const cap=edCap({h});if(cap&&cap.shapes.length&&!AKSESORI_PRODUK.includes(cap.prod)){l.sb=cap.shapes[0].id;l.dim={};l.lubang=lubangBawaan(cap)}return l}
const dimKosong=(sh,l)=>sh.dim.every(d=>l.dim==null||l.dim[d.k]===''||l.dim[d.k]==null);
/* hitung nama dan berat satu baris terstruktur; berat manual (diketik pengguna) tidak ditimpa */
function edHitungBaris(s,l){
 const cap=edCap(s);if(!l.sb||!cap)return null;const sh=cap.all.find(x=>x.id===l.sb);if(!sh)return null;
 if(cap.fallback){l.dim=l.dim||{};l.lubang='standar';const kosong=dimKosong(sh,l)&&(l.q===''||l.q==null);l.d=kosong?'':window.MNIBerat.namaItem(cap.prod,sh.kunci,l.dim,sh.dim);l.galat='';return null}
 l.dim=l.dim||{};if(TANPA_LUBANG.has(cap.prod))l.lubang='tanpa';else if(!sh.fullHole)l.lubang='standar';const kosong=dimKosong(sh,l)&&(l.q===''||l.q==null);
 /* nama otomatis dari bentuk dan ukuran; bila pengguna mengubah nama secara manual (nm) namanya dipertahankan, ukuran dan berat tetap mengikuti kalkulator */
 if(!(l.nm&&String(l.d||'').trim()))l.d=kosong?'':window.MNIBerat.namaItem(cap.prod,sh.kunci,l.dim,sh.dim)+(l.lubang==='full'&&sh.fullHole?' Full Hole':'');
 const dv=derive(s.h);const h=window.MNIBerat.hitungBentuk({keluarga:cap.fam,bentuk:l.sb,dim:l.dim,tebal:dv.tebal||thkOf(s.h),material:dv.material,lubang:l.lubang});
 l.galat=h.ok||dimKosong(sh,l)?'':h.alasan;
 if(l.wsrc!=='manual'){if(h.ok){l.w=Math.round(h.beratSPK*1000)/1000;l.wsrc='kalkulator'}else{l.w='';l.wsrc=''}}
 if(l.wsrc==='kalkulator'){const kp=edKgPair(s,l,cap);l.wEst=kp?Math.round(kp.kgPcsEst*1000)/1000:''}
 return h;
}
/* section berubah (produk, type, tebal, finishing): sesuaikan bentuk baris terstruktur dan hitung ulang */
function edSesuaikanBaris(s){const cap=edCap(s);let k=0;
 for(const l of s.lines){if(l.sb===undefined||l.sb==='')continue;
  if(!cap){l.sb='';continue}
  let sh=cap.all.find(x=>x.id===l.sb);
  if(!sh){sh=cap.all.find(x=>x.kunci===kunciDariId(l.sb));if(!sh){if(AKSESORI_PRODUK.includes(cap.prod)||!cap.shapes.length){l.sb='';l.d='';l.w='';l.wsrc='';l.galat='';continue}sh=cap.shapes[0]}l.sb=sh.id}
  if(!cap.shapes.some(x=>x.id===sh.id)){const eq=sh.kunci==='STRAIGHT'?'COVER_STRAIGHT':sh.kunci==='COVER_STRAIGHT'?'STRAIGHT':'';const t2=eq&&cap.shapes.find(x=>x.kunci===eq);if(t2){sh=t2;if(l.fg){l.fg='';l.ambil=''}}else if(AKSESORI_PRODUK.includes(cap.prod)&&dimKosong(sh,l)&&(l.q===''||l.q==null)){l.sb='';l.d='';l.w='';l.wsrc='';l.galat='';continue}l.sb=sh.id}
  if(TANPA_LUBANG.has(cap.prod))l.lubang='tanpa';else if(!sh.fullHole)l.lubang='standar';else if(!l.lubangManual)l.lubang=lubangBawaan(cap);
  const lama=l.w;edHitungBaris(s,l);if(lama!==l.w)k++}
 return k}
const HOLDER='tab-'+Math.random().toString(36).slice(2,10);
function secsOf(s){const secs=[];for(const it of s.items||[]){const g=it.g||'';if(!secs.length||secs[secs.length-1].h!==g)secs.push({h:g,lines:[]});secs[secs.length-1].lines.push(it)}return secs}

/* ----- editor ----- */
let ED=null,EDT=null,EDDIRTY=false;
function newEd(){const no=nextNo();return {id:null,no,tgl:today(),sales:'',customer:'',po:'',lead:'5 Hari Kerja',due:'',dueAuto:true,material:'',tebal:'',type:'',matAuto:true,note:'',noteAuto:true,dist:OPSI().dist.slice(),signProc:OPSI().signProc,signPpic:OPSI().signPpic,status:'Draft',rev:0,revAlasan:'',orig:null,sections:[{h:'CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED',lines:[lineBaru('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'),lineBaru('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED'),lineBaru('CABLE TRAY TYPE STU 1.2 ELECTRO GALVANIZED')]}]}}
/* Revisi SPK terbit: catatan produksi memakai nomor urut item, dan vendor serta kirim mencocokkan nama item, sehingga item yang sudah punya
   catatan tidak boleh dihapus, dipindah, diganti nama atau section-nya, dan qty-nya tidak boleh di bawah yang sudah diproduksi atau dikirim. */
function revisiGuard(o,items,oiList){
 const P=PXL();const x=(calc().spk[o._id])||{};
 for(let k=0;k<(o.items||[]).length;k++){
  const it=o.items[k];const l=(x.lines&&x.lines[k])||{};const st=P?itemState(o,it,k):null;
  const kmax=st?Math.max(0,...Object.values(st.kum)):0;
  const aktif=(st&&st.ev.length)||(+it.prod||0)>0||(+l.vOut||0)>0||(+l.kirim||0)>0;
  if(!aktif)continue;
  const pos=oiList.indexOf(k);
  if(pos<0)return `Item "${it.d}" sudah punya catatan produksi, vendor, atau pengiriman; tidak boleh dihapus.`;
  if(pos!==k)return `Item "${it.d}" sudah punya catatan; urutannya tidak boleh berubah (semula baris ${k+1}, sekarang ${pos+1}). Jangan menghapus atau memindahkan item di atasnya.`;
  const ni=items[pos];
  if(ni.d!==it.d||(ni.g||'')!==(it.g||''))return `Item "${it.d}" sudah punya catatan; nama dan section-nya tidak boleh diubah. Untuk item baru, tambahkan baris baru.`;
  if((ni.vv||'')!==(it.vv||''))return `Pengecualian vendor "${it.d}" tidak bisa diubah setelah item punya catatan produksi, vendor, atau pengiriman.`;
  const min=Math.max(kmax,+l.prodEff||0,+l.vOut||0,+l.kirim||0);
  if(ni.q<min)return `Qty "${it.d}" tidak boleh di bawah ${n(min)} (sudah diproduksi atau dikirim ke vendor/customer).`;
 }
 return '';
}
function edFrom(s,copy){let oiN=0;const secs=secsOf(s).map(x=>({h:x.h,lines:x.lines.map(it=>({oi:copy?undefined:oiN++,d:it.d,q:it.q,u:it.u||'Pcs',w:+it.w||'',wEst:+it.wEst||'',wsrc:it.ws==='k'?'kalkulator':it.ws==='m'?'manual':'',ket:it.ket||'',catatan:it.catatan||'',prod:copy?0:(+it.prod||0),...(it.sb?{sb:it.sb,dim:{...(it.dim||{})},lubang:it.lubang||'standar',lubangManual:!!it.lubang,...(it.nm?{nm:true}:{})}:{}),...(it.vv?{vv:it.vv}:{}),...((it.fg||s.stokReq)&&(it.fg||fgDariItem(it))?{fg:it.fg||fgDariItem(it)}:{}),...(!s.stokReq&&it.fg&&+it.ambil>0?{ambil:+it.ambil}:{})}))}));
 if(!secs.length)secs.push({h:'',lines:[blankLine()]});
 return {stokReq:!!s.stokReq,id:copy?null:s._id,no:copy?nextNo():s.no,tgl:copy?today():s.tgl,sales:s.sales||'',customer:copy?'':s.customer||'',po:copy?'':(s.po||''),lead:s.lead||'',due:copy?'':(s.due||''),dueAuto:copy||!s.due,material:s.material||'',tebal:s.tebal||'',type:s.type||'',matAuto:!s.material,note:copy?'':(s.note||''),noteAuto:copy||!s.note,dist:(s.dist||OPSI().dist).slice(),signProc:s.signProc||OPSI().signProc,signPpic:s.signPpic||OPSI().signPpic,status:copy?'Draft':(s.status||'Terbit'),rev:copy?0:(s.rev||0),revAlasan:'',orig:copy?null:s,sections:secs}}
function edAuto(){const e=ED;if(e.dueAuto&&leadMax(e.lead))e.due=addWorkdays(e.tgl,leadMax(e.lead));if(e.noteAuto)e.note=e.due?'NOTE : ESTIMASI KIRIM '+tglLong(e.due).toUpperCase():'';
 if(e.matAuto){const h=(e.sections.find(s=>s.h)||{}).h;if(h){const d=derive(h);e.material=d.material;e.tebal=d.tebal;e.type=[...new Set(e.sections.map(s=>derive(s.h).type).filter(Boolean))].join(' & ')}}}
async function openEditor(ed){
 if(!DB){toast('Database belum tersambung.');return}if(!CAN){toast('Akses Anda lihat saja.');return}try{guard('spk',null,null,'upd')}catch(x){toast(x.message);return}
 if(ed.id){try{const r=await DB.doc('lock/'+ed.id).acquire({holder:ME||HOLDER,ttlMs:90000});if(r&&r.acquired===false){const t=r.expiresAt?new Date(r.expiresAt).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'';toast(`SPK ${ed.no} sedang diedit pengguna lain${t?' (kunci lepas '+t+')':''}.`);return}
  clearInterval(EDT);EDT=setInterval(()=>DB.doc('lock/'+ed.id).acquire({holder:ME||HOLDER,ttlMs:90000}).catch(()=>{}),45000)}catch(e){}}
 ED=ed;EDDIRTY=false;edAuto();closeDrawer();closeSheet();renderEditor();$('#editor').hidden=false;document.body.style.overflow='hidden';
}
function closeEditor(){clearInterval(EDT);ED=null;$('#editor').hidden=true;$('#editor').innerHTML='';document.body.style.overflow=''}
const opt=(arr,sel,ph)=>`<option value="">${ph}</option>`+arr.map(x=>`<option ${x===sel?'selected':''}>${esc(x)}</option>`).join('');
const FIN_PENDEK={'ELECTRO GALVANIZED':'ELG','HOTDIP GALVANIZED':'HDG','STAINLESS STEEL 304':'SS304','STAINLESS STEEL 316L':'SS316L','POWDER COATING WHITE':'PDC putih','POWDER COATING ORANGE RAL 2000':'PDC oranye','POWDER COATING BLUE RAL 5017':'PDC biru','ALUMINIUM 1100':'Alu 1100','NON FINISHING':'Non finishing'};
/* Vendor per baris: bawaan mengikuti material (SPHC ke vendor sesuai finishing; stainless dan aluminium tanpa vendor); pengecualian dipilih di sini. */
function edVendorHtml(s,si,li,l){apHook();const P=PXL();if(!P||!P.vendorUntuk)return '';const fin=P.vendorUntuk(s.h,'');
 const bawaan=fin?'ke vendor '+fin:(P.perluFinishing(s.h)?'finishing belum jelas':'tanpa vendor');
 const peringatan=P.perluFinishing(s.h)&&l.vv!=='tidak'?'<div class="ed-galat" id="ed-vw-'+si+'-'+li+'">Baja tanpa finishing di judul section: vendor tidak terbentuk. Pilih finishing atau tandai tanpa vendor.</div>':'';
 return '<div class="ed-vv"><select class="sel" data-f="vv" id="ed-vv-'+si+'-'+li+'" aria-label="Vendor"><option value="">Ikut aturan: '+esc(bawaan)+'</option><option value="ya" '+(l.vv==='ya'?'selected':'')+'>Wajib ke vendor</option><option value="tidak" '+(l.vv==='tidak'?'selected':'')+'>Tanpa vendor</option></select></div>'+peringatan}
function edSaranSection(s,sh){const B=window.MNIBerat;try{const fam=B.keluargaDari(s.h),H=String(s.h||'').toUpperCase(),kata=/LADDER/.test(H)?'LADDER':/DUCT/.test(H)?'DUCT':'TRAY';const hit=B.produkBentuk().filter(p=>B.bentukProduk(fam,p).some(x=>x.kunci===sh.kunci));return hit.find(p=>p.includes(kata))||hit[0]||''}catch(_){}return ''}
function edKolomItem(s,si,li,l,cap,hb){
 const sh=cap&&l.sb?cap.all.find(x=>x.id===l.sb):null;const ada=!sh||cap.shapes.some(x=>x.id===sh.id);
 const pilih='<select class="sel c-sb" data-f="sb" id="ed-sb-'+si+'-'+li+'" aria-label="Bentuk"><option value="">Teks bebas</option>'+cap.shapes.map(x=>'<option value="'+x.id+'" '+(x.id===l.sb?'selected':'')+'>'+esc(x.nama)+'</option>').join('')+(ada?'':'<option value="'+sh.id+'" selected>'+esc(sh.nama)+' (di luar aturan)</option>')+'</select>';
 const nama=sh?'<div class="ed-nmrow"><input class="inp ed-nm" data-f="nm" id="ed-nm-'+si+'-'+li+'" value="'+esc(l.d||'')+'" placeholder="terisi otomatis dari ukuran" autocomplete="off" aria-label="Nama item (bisa diedit)" title="Nama terisi otomatis dari bentuk dan ukuran; boleh diubah, ukuran dan berat tetap dari kalkulator">'+(l.nm?'<button type="button" class="btn sm ghost" data-act="ednmauto" data-s="'+si+'" data-l="'+li+'" title="Kembalikan nama otomatis">↺ otomatis</button>':'')+'</div>'+(ada?'':'<div class="ed-galat" id="ed-lr-'+si+'-'+li+'">'+esc(sh.nama)+' di luar aturan section '+esc(cap.prod)+(edSaranSection(s,sh)?'; biasanya di section '+esc(edSaranSection(s,sh)):'')+'. Tetap bisa disimpan.</div>'):'<input class="inp" data-f="d" value="'+esc(l.d)+'" list="dl-desc" placeholder="Ketik nama item bebas atau pilih bentuk" id="ed-d-'+si+'-'+li+'" autocomplete="off">';
 const spek='<td class="c-spec"><span class="chip plain">'+esc(hb.t||'–')+'</span><span class="chip plain">'+esc(hb.tb||'–')+' mm</span><span class="chip plain">'+esc(FIN_PENDEK[hb.f]||hb.f||'–')+'</span>'+edVendorHtml(s,si,li,l)+'</td>';
 const dim=sh?'<td class="c-dim"><div class="ed-dims">'+sh.dim.map(d=>'<label class="dm"><span>'+d.label+'</span><input class="inp num" type="number" min="0" step="any" inputmode="decimal" data-dim="'+d.k+'" id="ed-dm-'+si+'-'+li+'-'+d.k+'" value="'+esc((l.dim||{})[d.k]==null?'':(l.dim||{})[d.k])+'"></label>').join('')+(sh.fullHole&&!TANPA_LUBANG.has(cap.prod)?'<label class="dm dm-lub"><span>Lubang</span><select class="sel" data-f="lubang" id="ed-lb-'+si+'-'+li+'"><option value="standar" '+(l.lubang!=='full'?'selected':'')+'>Bawah</option><option value="full" '+(l.lubang==='full'?'selected':'')+'>Full hole</option></select></label>':'')+'</div><div class="ed-galat" id="ed-gl-'+si+'-'+li+'">'+esc(l.galat||'')+'</div></td>':'<td class="c-dim"><span class="muted">–</span></td>';
 if(spkDimBaru()&&cap){const dc=edDimCols(cap),lub=!TANPA_LUBANG.has(cap.prod)&&cap.shapes.some(x=>x.fullHole);const galat='<div class="ed-galat" id="ed-gl-'+si+'-'+li+'">'+esc(l.galat||'')+'</div>';
  return '<td class="c-d">'+pilih+nama+galat+'</td>'+dc.map(c=>{const d=sh&&sh.dim.find(x=>x.k===c.k);return d?'<td class="c-dm"><input class="inp num" type="number" min="0" step="any" inputmode="decimal" data-dim="'+c.k+'" id="ed-dm-'+si+'-'+li+'-'+c.k+'" value="'+esc((l.dim||{})[c.k]==null?'':(l.dim||{})[c.k])+'" aria-label="'+esc(c.label)+'"></td>':'<td class="c-dm muted">–</td>'}).join('')+(lub?(sh&&sh.fullHole&&!TANPA_LUBANG.has(cap.prod)?'<td class="c-lub"><select class="sel" data-f="lubang" id="ed-lb-'+si+'-'+li+'"><option value="standar" '+(l.lubang!=='full'?'selected':'')+'>Bawah</option><option value="full" '+(l.lubang==='full'?'selected':'')+'>Full hole</option></select></td>':'<td class="c-lub muted">–</td>'):'');}
  return '<td class="c-d">'+pilih+nama+'</td>'+spek+dim;
}
/* Sel "Dari stok": pilih produk gudang barang jadi dan jumlah yang diambil dari stok (sisanya diproduksi). */
function edStokHint(l,res){if(!l.fg)return '';const tersedia=(calc().stock.fg[l.fg]||0)-((res||fgResMap(ED&&ED.id))[l.fg]||0);const am=Math.max(0,+l.ambil||0),q=+l.q||0;
 return 'tersedia '+n(tersedia)+(am>0?' · produksi '+n(Math.max(0,q-am)):'')+(am>q&&q>0?' · melebihi qty':am>tersedia?' · melebihi stok':'')}
const finKode=x=>{const u=String(x||'').toUpperCase();return /ELECTRO|ELG/.test(u)?'ELG':/HOT ?DIP|HDG/.test(u)?'HDG':/POWDER|PDC/.test(u)?'PDC':/NON/.test(u)?'NON':/316/.test(u)?'SS316':/304/.test(u)?'SS304':/ALU/.test(u)?'ALU':u.trim()};
/* produk gudang barang jadi yang cocok dengan satu baris SPK: nama item sama persis, atau (baris terstruktur Straight / Cover Straight) produk, type, tebal, finishing, W, H, dan L sama */
function fgCocokBaris(s,l){const hb=parseH(s.h),dim=l.dim||{},w=+dim.w,h=+dim.h,L=+dim.l,nm=String(l.d||'').trim(),out=[];
 for(const r of S.fg){if(r.aktif===false)continue;
  if(nm&&fgSpkDesc(r)===nm){out.push(r);continue}
  if(!l.sb||!(w>0)||!(h>0)||!/^(STRAIGHT|COVER_STRAIGHT)/.test(kunciDariId(l.sb))||!(L>0))continue;
  const m=String(r.ukuran||'').match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);if(!m||+m[1].replace(',','.')!==w||+m[2].replace(',','.')!==h||+r.panjang!==L)continue;
  if(r.type&&hb.t&&String(r.type).toUpperCase()!==hb.t)continue;
  if(hb.tb&&r.tebal&&parseFloat(r.tebal)!==parseFloat(hb.tb))continue;
  if(hb.f&&r.finishing&&finKode(r.finishing)!==finKode(hb.f))continue;
  if(hb.p&&r.kategori&&String(r.kategori).toUpperCase()!==hb.p)continue;
  out.push(r)}
 return out}
function fgCocokUrut(s,l,res){const rs=res||fgResMap(ED&&ED.id);const tsd=r=>(calc().stock.fg[r._id]||0)-(rs[r._id]||0);return fgCocokBaris(s,l).map(r=>({r,t:tsd(r)})).sort((a,b)=>b.t-a.t).map(x=>x.r)}
function edStokStatus(si,li,l,res,s){const rs=res||fgResMap(ED&&ED.id);const tsd=r=>(calc().stock.fg[r._id]||0)-(rs[r._id]||0);const cocok=s&&!l.fg?fgCocokUrut(s,l,rs):[];
 const k=l.sb?kunciDariId(l.sb):'',lurus=/^(STRAIGHT|COVER_STRAIGHT)/.test(k),kosong=!String(l.d||'').trim();let inner='',ada=false;
 if(!l.fg){
  if(cocok.length){const c=cocok[0],t=tsd(c);if(t>0){ada=true;inner='Stok cocok: '+esc(fgLabel(c))+' · tersedia '+n(t)+' <button type="button" class="btn sm" data-act="ed-stok-pakai" data-s="'+si+'" data-l="'+li+'" aria-label="Pakai stok untuk baris '+(li+1)+' section '+(si+1)+'">Pakai stok</button>'}else inner='Stok cocok: '+esc(fgLabel(c))+' · tersedia '+n(Math.max(0,t))+' (habis atau dicadangkan) · produksi semua'}
  else if(l.sb&&!lurus)inner='Fitting/aksesori: stok tidak dicocokkan otomatis; pilih produk manual bila ada stok'
  else if(kosong)inner='Isi ukuran untuk mencocokkan stok'
  else inner='Tidak ada stok cocok · produksi semua'}
 return '<div class="ed-stk-s'+(ada?' ada':'')+'" id="ed-ss-'+si+'-'+li+'">'+inner+'</div>'}
function edStokRefresh(si,li){if(spkDimBaru()&&ED&&ED.sections[si]&&edCap(ED.sections[si])){const td=$('#ed-sk-'+si+'-'+li);if(!td||td.contains(document.activeElement))return;const s=ED.sections[si],l=s.lines[li];if(!l)return;const w=document.createElement('table');w.innerHTML='<tr>'+edStokR(si,li,l,null,s)+'</tr>';const nw=w.querySelector('td');if(nw&&td.innerHTML!==nw.innerHTML)td.innerHTML=nw.innerHTML;return}const el=$('#ed-ss-'+si+'-'+li);if(!el||!ED)return;const s=ED.sections[si],l=s.lines[li];if(!s||!l)return;const w=document.createElement('div');w.innerHTML=edStokStatus(si,li,l,null,s);if(el.outerHTML!==w.firstChild.outerHTML)el.replaceWith(w.firstChild)}
function edStokHtml(si,li,l,res,s){
 if(ED&&ED.stokReq)return '<td class="c-stk"></td>';
 const fgs=S.fg.filter(r=>r.aktif!==false||r._id===l.fg),cocok=s?fgCocokUrut(s,l,res):[];
 const status=edStokStatus(si,li,l,res,s);
 const op=r=>'<option value="'+r._id+'" '+(r._id===l.fg?'selected':'')+'>'+esc(fgLabel(r))+' · tersedia '+n((calc().stock.fg[r._id]||0)-(res[r._id]||0))+'</option>';
 return '<td class="c-stk"><select class="sel" data-f="fg" id="ed-fg-'+si+'-'+li+'" aria-label="Produk di gudang barang jadi"><option value="">Produksi semua</option>'+(cocok.length?'<optgroup label="Cocok dengan item ini">'+cocok.map(op).join('')+'</optgroup>':'')+(fgs.length-cocok.length?'<optgroup label="Semua produk">'+fgs.filter(r=>!cocok.includes(r)).map(op).join('')+'</optgroup>':'')+'</select>'
  +status+'<input class="inp num" data-f="ambil" type="number" min="0" step="any" inputmode="decimal" placeholder="Ambil dari stok" id="ed-am-'+si+'-'+li+'" value="'+esc(l.ambil==null?'':l.ambil)+'" '+(l.fg?'':'disabled')+'><div class="note ed-stk-h" id="ed-sh-'+si+'-'+li+'">'+esc(edStokHint(l,res))+'</div></td>';
}
/* ----- tampilan ringkas editor SPK (T-226): satu baris = bentuk, ukuran, qty; berat estimasi dan real langsung tampil; yang jarang dipakai ada di menu ⋯ ----- */
const kgF=x=>n(Math.round((+x||0)*100)/100);
const edKatalogSiap=()=>{const B=window.MNIBerat;return !!(B&&B.siap&&B.siap())};
/* kg satu baris: pasangan dari katalog (estimasi = plate yang diambil, real = barang jadi); tanpa katalog atau teks bebas memakai berat manual yang sama untuk keduanya */
function edKgBaris(s,l,cap){if(!String(l.d||'').trim())return null;const q=+l.q||0,am=Math.min(q,Math.max(0,+l.ambil||0));const r=cap?edKgPair(s,l,cap):null;
 if(r)return {pcsE:r.kgPcsEst,pcsR:r.kgPcsReal,ke:r.kgPcsEst*(q-am),kr:r.kgPcsReal*q,q,am,manual:false,kosong:false};
 const w=+l.w||0;if(!(w>0))return {q,am,ke:0,kr:0,manual:false,kosong:true};
 return {pcsE:w,pcsR:w,ke:w*(q-am),kr:w*q,q,am,manual:true,kosong:false}}
function edSecSumHtml(s){const cap=edCap(s);let c=0,q=0,ke=0,kr=0;s.lines.forEach(l=>{const k=edKgBaris(s,l,cap);if(!k)return;c++;q+=k.q;if(!k.kosong){ke+=k.ke;kr+=k.kr}});return c?c+' item · '+n(q)+' pcs · est <b>'+kgF(ke)+'</b> · real <b>'+kgF(kr)+'</b> Kg':''}
function edSecSum(si){const el=$('#ed-sum-'+si);if(el&&ED&&ED.sections[si])el.innerHTML=edSecSumHtml(ED.sections[si])}
function edKgCells(tr,si,li){if(!ED||!spkDimBaru())return;const s=ED.sections[si],L=s.lines[li],cap=edCap(s);if(!cap)return;const k=edKgBaris(s,L,cap);const ke=tr.querySelector('[data-ke]'),b=tr.querySelector('[data-bi]');
 const ok=k&&k.q>0&&!k.kosong;if(ke){ke.textContent=ok?kgF(k.ke):'–';ke.classList.toggle('manual',!!(k&&k.manual))}if(b)b.textContent=ok?kgF(k.kr):'–';edSecSum(si)}
function edVendorBadge(s){apHook();const P=PXL();if(!P||!P.vendorUntuk)return '';const fin=P.vendorUntuk(s.h,'');return fin?'→ vendor '+esc(fin):(P.perluFinishing(s.h)?'finishing belum jelas':'tanpa vendor')}
/* Dari stok: angka yang diambil; tombol Pakai stok bila ada produk cocok. Produk lain dipilih di menu ⋯. */
function edStokR(si,li,l,res,s){
 if(ED&&ED.stokReq)return '<td class="c-stk" id="ed-sk-'+si+'-'+li+'"></td>';
 res=res||fgResMap(ED&&ED.id);const tsd=r=>(calc().stock.fg[r._id]||0)-(res[r._id]||0);let inner;
 if(l.fg){const r=byId('fg',l.fg);inner='<input class="inp num" data-f="ambil" type="number" min="0" step="any" inputmode="decimal" placeholder="0" id="ed-am-'+si+'-'+li+'" value="'+esc(l.ambil==null?'':l.ambil)+'" aria-label="Jumlah diambil dari stok"><div class="ed-stk-h" id="ed-sh-'+si+'-'+li+'" title="'+esc(r?fgLabel(r):'')+'">'+esc(edStokHint(l,res))+'</div>'}
 else{const c=s?fgCocokUrut(s,l,res)[0]:null,t=c?tsd(c):0;
  inner=c&&t>0?'<button type="button" class="btn sm" data-act="ed-stok-pakai" data-s="'+si+'" data-l="'+li+'" title="'+esc(fgLabel(c))+'">Pakai stok '+n(t)+'</button>':(c?'<span class="muted" title="'+esc(fgLabel(c))+'">stok habis</span>':'<span class="muted">–</span>')}
 return '<td class="c-stk" id="ed-sk-'+si+'-'+li+'">'+inner+'</td>'}
function edRowR(s,si,li,l,no,cap,hb,RES){
 const k=edKgBaris(s,l,cap),ok=k&&k.q>0&&!k.kosong;
 const vw=edVendorHtml(s,si,li,l);const buka=!!(l.det||l.ket||l.catatan||l.vv||/ed-galat/.test(vw));
 const fgs=S.fg.filter(r=>r.aktif!==false||r._id===l.fg),cocok=fgCocokUrut(s,l,RES);
 const op=r=>'<option value="'+r._id+'" '+(r._id===l.fg?'selected':'')+'>'+esc(fgLabel(r))+' · tersedia '+n((calc().stock.fg[r._id]||0)-(RES[r._id]||0))+'</option>';
 const selFg=ED&&ED.stokReq?'':'<label>Produk stok<select class="sel" data-f="fg" id="ed-fg-'+si+'-'+li+'" aria-label="Produk di gudang barang jadi"><option value="">Produksi semua</option>'+(cocok.length?'<optgroup label="Cocok dengan item ini">'+cocok.map(op).join('')+'</optgroup>':'')+(fgs.length-cocok.length?'<optgroup label="Semua produk">'+fgs.filter(r=>!cocok.includes(r)).map(op).join('')+'</optgroup>':'')+'</select></label>';
 const det='<div class="ed-det" id="ed-det-'+si+'-'+li+'" '+(buka?'':'hidden')+'><label>Catatan merah<input class="inp red" data-f="ket" value="'+esc(l.ket)+'" placeholder="opsional" id="ed-k-'+si+'-'+li+'"></label><label>Keterangan<input class="inp" data-f="catatan" value="'+esc(l.catatan)+'" id="ed-c-'+si+'-'+li+'"></label>'+vw+selFg+'</div>';
 let kol=edKolomItem(s,si,li,l,cap,hb);const i=kol.indexOf('</td>');kol=kol.slice(0,i)+det+kol.slice(i);
 const ro=l.sb&&edKatalogSiap()?' readonly tabindex="-1"':'';
 const bi=(+l.q||0)*(+l.w||0);
 return `<tr data-s="${si}" data-l="${li}"><td class="c-no">${no}</td>${kol}
  <td class="c-q"><input class="inp num" data-f="q" type="number" min="0" step="any" value="${esc(l.q)}" id="ed-q-${si}-${li}" inputmode="decimal"></td>
  <td class="c-u"><input class="inp" data-f="u" value="${esc(l.u)}" list="dl-sat" id="ed-u-${si}-${li}"></td>
  ${edStokR(si,li,l,RES,s)}
  <td class="c-w"><input class="inp num" data-f="w" type="${ro?'text':'number'}" min="0" step="any" value="${ro?((+l.w)?kgF(l.w):''):esc(l.w)}" id="ed-w-${si}-${li}" inputmode="decimal"${ro}>${l.wsrc?`<span class="wtag ${l.wsrc}" title="${l.wsrc==='kalkulator'?'Dihitung otomatis dari kalkulator berat dan tidak diketik. Untuk berat manual, pilih Teks bebas di kolom bentuk.':'Diisi manual.'}">${l.wsrc==='kalkulator'?'auto':'manual'}</span>`:''}<span id="ed-kg-${si}-${li}">${edKgSub(s,l,cap)}</span></td>
  <td class="c-ke num${k&&k.manual?' manual':''}" data-ke>${ok?kgF(k.ke):'–'}</td>
  <td class="c-bi num" data-bi>${ok?kgF(k.kr):(bi?n(bi):'–')}</td>
  <td class="c-act"><button type="button" class="ibtn" data-act="ed-det" data-s="${si}" data-l="${li}" aria-label="Catatan, vendor, dan produk stok" aria-expanded="${buka}">⋯</button><button type="button" class="ibtn" data-act="ed-delline" data-s="${si}" data-l="${li}" aria-label="Hapus baris">×</button></td></tr>`}
function edSecHtmlR(s,si,startNo){
 const hb=parseH(s.h),cap=edCap(s),RES=fgResMap(ED&&ED.id);let no=startNo;const dc=edDimCols(cap),lub=!TANPA_LUBANG.has(cap.prod)&&cap.shapes.some(x=>x.fullHole);
 const rows=s.lines.map((l,li)=>{no++;return edRowR(s,si,li,l,no,cap,hb,RES)}).join('');
 return `<div class="esec"><div class="esec-h"><span class="esec-tag">Section ${si+1}</span>
  <select class="sel" data-hb="p" data-s="${si}" id="ed-hp-${si}">${opt(HB.p.includes(hb.p)||!hb.p?HB.p:[...HB.p,hb.p],hb.p,'Produk')}</select><select class="sel" data-hb="t" data-s="${si}" id="ed-ht-${si}">${opt(HB.t,hb.t,'Type')}</select><select class="sel" data-hb="tb" data-s="${si}" id="ed-htb-${si}">${opt(HB.tb,hb.tb,'Tebal')}</select><select class="sel" data-hb="f" data-s="${si}" id="ed-hf-${si}">${opt(HB.f,hb.f,'Finishing')}</select>
  <span class="esec-vend" id="ed-sv-${si}" title="Vendor finishing ditentukan otomatis dari finishing section">${edVendorBadge(s)}</span><span class="esec-sum" id="ed-sum-${si}">${edSecSumHtml(s)}</span>
  <span class="esec-acts"><button type="button" class="ibtn" data-act="ed-up" data-s="${si}" aria-label="Naikkan" ${si?'':'disabled'}>↑</button><button type="button" class="ibtn" data-act="ed-down" data-s="${si}" aria-label="Turunkan" ${si<ED.sections.length-1?'':'disabled'}>↓</button><button type="button" class="ibtn" data-act="ed-delsec" data-s="${si}" aria-label="Hapus section" ${ED.sections.length>1?'':'disabled'}>×</button></span>
  <input class="inp esec-title" data-sf="h" data-s="${si}" value="${esc(s.h)}" list="dl-grup" placeholder="JUDUL SECTION, mis. CABLE TRAY TYPE STU 1.5 ELECTRO GALVANIZED" id="ed-h-${si}"></div>
  <div class="tbl-wrap"><table class="edt edr"><thead><tr><th>No</th><th>Bentuk dan nama item</th>${dc.map(c=>'<th class="num dmh">'+esc(c.label)+' (mm)</th>').join('')}${lub?'<th>Lubang</th>':''}<th class="num">Qty</th><th>Satuan</th><th>${ED&&ED.stokReq?'':'Dari stok'}</th><th class="num">Kg/pcs</th><th class="num th-ke" title="Kg estimasi: plate yang diambil dari Gudang Bahan Baku. Barang dari stok tidak dihitung.">Kg est</th><th class="num th-kr" title="Kg real: barang jadi yang dikirim ke vendor finishing dan customer.">Kg real</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  <button type="button" class="btn sm ghost" data-act="ed-addline" data-s="${si}">${ic('plus')}Baris</button> <button type="button" class="btn sm ghost" data-act="ed-tempel" data-s="${si}">${ic('plus')}Tempel daftar</button></div>`
}
/* ----- teks ke baris terstruktur (T-226): deskripsi yang diketik atau ditempel dikenali jadi bentuk dan ukuran, lalu berat langsung dihitung ----- */
function edKenali(s,cap,teks){const B=window.MNIBerat;if(!B||!B.kenaliDeskripsi||!cap)return null;const k=B.kenaliDeskripsi(teks);if(!k)return null;
 const sh=cap.shapes.find(x=>x.kunci===k.kunci);if(!sh)return {salah:'Bentuk '+k.kunci+' tidak diizinkan di section '+cap.prod};
 const ks=sh.dim.map(d=>d.k),polos=k.dim||{},dim={};
 const utama=String(teks).split(/\bc\s*\/\s*w\b/i)[0],tk=utama.split(/[\sx×*,;]+/i).filter(Boolean);
 const idx=tk.map(x=>x.match(/^w([1-4])(\d+(?:[.,]\d+)?)(?:mm)?$/i)).filter(Boolean);
 if(ks.includes('w1')&&idx.length>=2)idx.forEach(m=>{dim['w'+m[1]]=parseFloat(m[2].replace(',','.'))});
 else if(ks.includes('w1')&&polos.w!=null)['w1','w2','w3','w4'].forEach(x=>{if(ks.includes(x))dim[x]=polos.w});
 for(const x of ks)if(dim[x]==null&&polos[x]!=null)dim[x]=polos[x];
 return {sh,dim,tebal:k.tebal}}
function edKonversiTeks(si,li){const s=ED.sections[si],L=s.lines[li],cap=edCap(s);const r=cap&&String(L.d||'').trim()?edKenali(s,cap,L.d):null;
 if(!r||!r.sh||!Object.keys(r.dim).length)return false;
 L.sb=r.sh.id;L.dim=r.dim;L.lubang=lubangBawaan(cap);L.lubangManual=false;if(L.wsrc==='kalkulator')L.wsrc='';edHitungBaris(s,L);EDDIRTY=true;
 if(li===s.lines.length-1)s.lines.push(lineBaru(s.h));
 rerenderSecs();toast('Terbaca sebagai '+r.sh.nama+' · '+Object.entries(r.dim).map(([k,v])=>k.toUpperCase()+v).join(' ')+(L.galat?' · '+L.galat:' · berat dihitung'));return true}
function edParseDaftar(teks){return String(teks||'').split(/\r?\n/).map(r=>r.trim()).filter(Boolean).map(r=>{
 let d='',q='',u='';const cols=r.split('\t').map(x=>x.trim()).filter(x=>x!=='');
 if(cols.length>=2){if(/^\d+$/.test(cols[0])&&cols.length>=3)cols.shift();d=cols[0];const rest=cols.slice(1),qi=rest.findIndex(x=>/^\d+([.,]\d+)?$/.test(x));
  if(qi>=0){q=parseFloat(rest[qi].replace(',','.'));const ui=rest.findIndex((x,i)=>i>qi&&/^[A-Za-z]{1,6}$/.test(x));if(ui>=0)u=rest[ui]}}
 else{const m=r.match(/^(?:\d+[\s.)]+)?(.*?)\s+(\d+(?:[.,]\d+)?)\s*(Btg|Pcs|Set|Lbr|Unit|Mtr|Roll)\s*$/i);if(m){d=m[1];q=parseFloat(m[2].replace(',','.'));u=m[3]}else d=r}
 return {d:d.replace(/\s+/g,' ').trim(),q,u}})}
function edTempelForm(si){
 openModal('Tempel daftar item ke Section '+(si+1),fld('Daftar item','<textarea class="inp" name="teks" id="ed-tempel-teks" rows="10" placeholder="Cable Tray W100xH50xL3000 mm &#9; 50 &#9; Btg&#10;Elbow 90 W300xH100xR300 &#9; 20 &#9; Btg"></textarea>',true)+'<div class="note full">Satu item per baris. Dari Excel: kolom No, Description, Qty, Satuan (berat tidak perlu). Bentuk dan ukuran dikenali otomatis dan berat langsung dihitung; yang tidak dikenali masuk sebagai Teks bebas.</div>',
 async d=>{const rows=edParseDaftar(d.teks);if(!rows.length)throw new Error('Tempel minimal satu baris.');
  const sec=ED.sections[si],cap=edCap(sec);let ok=0,bebas=0;
  sec.lines=sec.lines.filter(l=>String(l.d||'').trim()||(+l.q>0)||(l.dim&&Object.values(l.dim).some(v=>v!==''&&v!=null)));
  for(const r of rows){const L=lineBaru(sec.h);L.q=r.q;if(r.u)L.u=r.u;const k=cap?edKenali(sec,cap,r.d):null;
   if(k&&k.sh&&Object.keys(k.dim).length){L.sb=k.sh.id;L.dim=k.dim;L.lubang=lubangBawaan(cap);edHitungBaris(sec,L);ok++}else{L.sb='';delete L.dim;delete L.lubang;L.d=r.d;bebas++}
   sec.lines.push(L)}
  sec.lines.push(lineBaru(sec.h));EDDIRTY=true;rerenderSecs();toast(rows.length+' baris dimasukkan: '+ok+' terbaca otomatis'+(bebas?', '+bebas+' teks bebas':''))},{submit:'Masukkan',done:' '})}
function renderTotals(){if(!spkDimBaru())return renderTotalsLama();const el=$('#ed-tot');if(!el||!ED)return;
 let c=0,q=0,ke=0,kr=0,am=0,kos=0,man=0;
 ED.sections.forEach((s,si)=>{const cap=edCap(s);s.lines.forEach(l=>{const k=edKgBaris(s,l,cap);if(!k)return;c++;q+=k.q;am+=k.am;if(k.kosong){if(k.q>0)kos++;return}ke+=k.ke;kr+=k.kr;if(k.manual)man++});edSecSum(si)});
 const t=(x,cls,lab,tip)=>'<span class="eds '+cls+'"'+(tip?' title="'+tip+'"':'')+'><span>'+lab+'</span><b>'+x+'</b></span>';
 el.innerHTML='<span class="edsum">'+t(c,'','Item')+t(n(q),'','Qty (Btg/Pcs)')+t(kgF(ke)+' Kg','e','Kg estimasi · plate (est)','Dipakai untuk permintaan plate ke Gudang Bahan Baku. Barang yang diambil dari stok tidak dihitung.')+t(kgF(kr)+' Kg','r','Kg real · barang jadi (real)','Berat barang jadi yang dikirim ke vendor finishing dan customer.')+(am?t(n(am),'','Dari stok'):'')+(man?t(man+' baris','w','Berat manual','Berat diisi manual: dipakai sama untuk estimasi dan real.'):'')+(kos?t(kos+' baris','w','Belum terhitung','Ukuran belum lengkap atau katalog berat belum terpasang.'):'')+'</span>'}
function edSecHtml(s,si,startNo){if(spkDimBaru()&&edCap(s))return edSecHtmlR(s,si,startNo);
 const hb=parseH(s.h);let no=startNo;const cap=edCap(s);const RES=fgResMap(ED&&ED.id);
 const rows=s.lines.map((l,li)=>{no++;const bi=(+l.q||0)*(+l.w||0);return `<tr data-s="${si}" data-l="${li}"><td class="c-no">${no}</td>
  ${cap?edKolomItem(s,si,li,l,cap,hb):`<td class="c-d"><input class="inp" data-f="d" value="${esc(l.d)}" list="dl-desc" placeholder="Cable Tray W100xH50xL3000 mm" id="ed-d-${si}-${li}" autocomplete="off"></td>`}
  <td class="c-ket"><input class="inp red" data-f="ket" value="${esc(l.ket)}" placeholder="opsional" id="ed-k-${si}-${li}"></td>
  <td class="c-q"><input class="inp num" data-f="q" type="number" min="0" step="any" value="${esc(l.q)}" id="ed-q-${si}-${li}" inputmode="decimal"></td>
  <td class="c-u"><input class="inp" data-f="u" value="${esc(l.u)}" list="dl-sat" id="ed-u-${si}-${li}"></td>
  ${edStokHtml(si,li,l,RES,s)}
  <td class="c-w"><input class="inp num" data-f="w" type="number" min="0" step="any" value="${esc(l.w)}" id="ed-w-${si}-${li}" inputmode="decimal">${l.wsrc?`<span class="wtag ${l.wsrc}" title="${l.wsrc==='kalkulator'?'Dihitung otomatis dari kalkulator berat. Ubah angkanya untuk menimpa.':'Diisi atau diubah manual.'}">${l.wsrc==='kalkulator'?'auto':'manual'}</span>`:''}${spkDimBaru()&&cap?`<span id="ed-kg-${si}-${li}">${edKgSub(s,l,cap)}</span>`:''}</td>
  <td class="c-bi num" data-bi>${bi?n(bi):'–'}</td>
  <td class="c-cat"><input class="inp" data-f="catatan" value="${esc(l.catatan)}" id="ed-c-${si}-${li}"></td>
  <td><button type="button" class="ibtn" data-act="ed-delline" data-s="${si}" data-l="${li}" aria-label="Hapus baris">×</button></td></tr>`}).join('');
 return `<div class="esec"><div class="esec-h"><span class="esec-tag">Section ${si+1}</span>
  <select class="sel" data-hb="p" data-s="${si}" id="ed-hp-${si}">${opt(HB.p.includes(hb.p)||!hb.p?HB.p:[...HB.p,hb.p],hb.p,'Produk')}</select><select class="sel" data-hb="t" data-s="${si}" id="ed-ht-${si}">${opt(HB.t,hb.t,'Type')}</select><select class="sel" data-hb="tb" data-s="${si}" id="ed-htb-${si}">${opt(HB.tb,hb.tb,'Tebal')}</select><select class="sel" data-hb="f" data-s="${si}" id="ed-hf-${si}">${opt(HB.f,hb.f,'Finishing')}</select>
  <span class="esec-acts"><button type="button" class="ibtn" data-act="ed-up" data-s="${si}" aria-label="Naikkan" ${si?'':'disabled'}>↑</button><button type="button" class="ibtn" data-act="ed-down" data-s="${si}" aria-label="Turunkan" ${si<ED.sections.length-1?'':'disabled'}>↓</button><button type="button" class="ibtn" data-act="ed-delsec" data-s="${si}" aria-label="Hapus section" ${ED.sections.length>1?'':'disabled'}>×</button></span>
  <input class="inp esec-title" data-sf="h" data-s="${si}" value="${esc(s.h)}" list="dl-grup" placeholder="JUDUL SECTION, mis. CABLE TRAY TYPE STU 1.5 ELECTRO GALVANIZED" id="ed-h-${si}"></div>
  <div class="tbl-wrap"><table class="edt"><thead><tr><th>No</th>${cap?(spkDimBaru()?'<th>Bentuk dan nama item</th><th>Spesifikasi</th>'+edDimCols(cap).map(c=>'<th class="num dmh">'+esc(c.label)+' (mm)</th>').join('')+(cap.shapes.some(x=>x.fullHole)?'<th>Lubang</th>':''):'<th>Bentuk dan nama item</th><th>Spesifikasi</th><th>Ukuran (mm)</th>'):'<th>Description</th>'}<th>Catatan merah</th><th class="num">Qty</th><th>Satuan</th><th>${ED&&ED.stokReq?'':'Dari stok'}</th><th class="num">Berat/pcs</th><th class="num">Berat/item</th><th>Keterangan</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  <button type="button" class="btn sm ghost" data-act="ed-addline" data-s="${si}">${ic('plus')}Baris</button></div>`;
}
function edTotals(){let q=0,w=0,c=0;ED.sections.forEach(s=>s.lines.forEach(l=>{if(String(l.d).trim()){c++;q+= +l.q||0;w+=(+l.q||0)*(+l.w||0)}}));return {q,w,c}}
/* Kebutuhan plat langsung di editor SPK (sebelum Terbit): memakai perhitungan yang sama dengan permintaan bahan baku (berat estimasi plat x faktor sisa potong,
   dikurangi stok tersedia dan PR terbuka), jadi angka di sini sama dengan PR otomatis yang akan dibuat saat SPK terbit. */
function matPreviewEditor(){
 try{
  if(!MT()||!ED||!ED.sections)return '';
  const items=[];ED.sections.forEach(s=>s.lines.forEach(l=>{const q=+l.q||0;if(!String(l.d).trim()||!(q>0))return;const am=Math.min(q,Math.max(0,+l.ambil||0));const w=+l.wEst>0?+l.wEst:+l.w;items.push({d:l.d,g:s.h,q:Math.max(0,q-am),w,sudahWaste:+l.wEst>0})}));
  if(!items.length)return '';
  const rc=matRencana(items,{spkId:ED.id||undefined,tebal:ED.tebal||''});
  const baris=rc.map(r=>{
   if(r.status==='Tanpa item RM')return '<div>Plat '+esc(r.bahan)+' '+n(r.tebal)+' mm: butuh <b>'+n(Math.round(r.butuhKg))+'</b> kg, <span class="chip warn">belum ada item bahan baku</span></div>';
   const kurang=(r.kurangKg||0)>0.5;
   return '<div>Plat '+esc(r.bahan)+' '+n(r.tebal)+' mm: butuh <b>'+n(Math.round(r.butuhKg))+'</b> kg'+(r.butuhLbr!=null?' (± '+n(r.butuhLbr)+' lbr)':'')+' · tersedia '+n(Math.round(r.tersediaKg||0))+' kg · '+(kurang?'<b class="warn-t">kurang '+n(Math.round(r.kurangKg))+' kg'+(r.kurangLbr!=null?' (± '+n(r.kurangLbr)+' lbr)':'')+', PR dibuat otomatis saat terbit</b>':r.status==='Sudah dipesan'?'sudah dipesan lewat PR':'cukup')+'</div>'}).join('');
  const tw=items.filter(i=>!(+i.w>0)).length;
  return '<div class="muted" id="ed-mat" style="margin-top:4px">Kebutuhan bahan baku (berat estimasi plat sudah memuat waste; item berat manual × faktor sisa potong '+String(matFaktor()).replace('.',',')+'):'+baris+(tw?'<div class="warn-t">'+tw+' item belum ada berat, belum masuk perhitungan plat</div>':'')+'</div>'
 }catch(e){return ''}
}
function renderTotalsLama(){const t=edTotals();const el=$('#ed-tot');if(!el)return;let ke=0,kr=0,ada=false;if(spkDimBaru()){ED.sections.forEach((s,si)=>{const cap=edCap(s);s.lines.forEach(l=>{const r=edKgPair(s,l,cap);if(r&&String(l.d).trim()){ada=true;const q=+l.q||0,am=Math.min(q,Math.max(0,+l.ambil||0));ke+=r.kgPcsEst*(q-am);kr+=r.kgPcsReal*q}})})}
 el.innerHTML=`<b>${t.c}</b> item · Total <b>${n(t.q)}</b> Btg/Pcs · <b>${n(Math.round(t.w*100)/100)}</b> Kg${t.w>=1000?` <span class="muted">(${ton(t.w)} ton)</span>`:t.w>0?` <span class="muted">(${n(Math.round(t.w/100)/10)} ton)</span>`:''}${ada?` · plate (est) <b>${n(Math.round(ke*100)/100)}</b> Kg · barang jadi (real) <b>${n(Math.round(kr*100)/100)}</b> Kg`:''}`+matPreviewEditor()}
function renderEditor(){
 const e=ED,k=KAT();const editTerbit=e.id&&e.orig&&(e.orig.status||'Terbit')==='Terbit';
 let no=0;const secs=e.sections.map((s,i)=>{const h=edSecHtml(s,i,no);no+=s.lines.length;return h}).join('');
 const distAll=[...new Set([...OPSI().dist,...e.dist])];
 $('#editor').innerHTML=`<div class="ed"><header class="ed-top"><div class="ed-ttl"><h3>${e.id?`Edit SPK ${e.no}`:'SPK baru'} ${e.rev?`<span class="chip info plain">Rev.${e.rev}</span>`:''} ${stChip(e.status)}</h3><p>${e.id?'Dikunci untuk Anda selama editor terbuka, pengguna lain tidak bisa mengedit bersamaan.':'Format mengikuti lembar SPK Workshop MNI. Nomor SPK diklaim saat disimpan.'}</p></div>
  <div class="ed-btns"><button type="button" class="btn ghost" data-act="ed-close">Batal</button>${e.status==='Draft'?`<button type="button" class="btn" data-act="ed-save" data-mode="draft">Simpan draft</button>`:''}<button type="button" class="btn primary" data-act="ed-save" data-mode="terbit">${ic('chk')}${e.status==='Draft'?'Terbitkan SPK':'Simpan revisi'}</button></div></header>
  <div class="ed-body">
  ${editTerbit?`<div class="ro">SPK ini sudah terbit. Menyimpan perubahan akan membuat <b>Rev.${(e.orig.rev||0)+1}</b>. <label class="fld" style="margin-top:8px"><span>Alasan revisi</span><input class="inp" data-h="revAlasan" id="ed-rev" value="${esc(e.revAlasan)}" placeholder="mis. tambah qty jointing sesuai PO revisi"></label></div>`:''}
  <section class="ecard"><h4>Header SPK</h4><div class="egrid">
   <label class="fld"><span>No SPK</span><input class="inp" data-h="no" type="number" id="ed-no" value="${esc(e.no)}" ${e.id&&e.status!=='Draft'?'disabled':''}></label>
   <label class="fld"><span>Nomor dokumen</span><input class="inp" id="ed-nomor" value="${esc(`${e.no}/SPK/${String(e.tgl).slice(0,4)}/WS`)}" disabled></label>
   <label class="fld"><span>Tanggal</span><input class="inp" type="date" data-h="tgl" id="ed-tgl" value="${esc(e.tgl)}"></label>
   <label class="fld"><span>Sales</span><input class="inp" data-h="sales" id="ed-sales" value="${esc(e.sales)}" list="dl-sales2" placeholder="Ibu Auliah"></label>
   <label class="fld span2"><span>Customer</span><input class="inp" data-h="customer" id="ed-cust" value="${esc(e.customer)}" list="dl-cust" placeholder="PT CAKRA NUSANTARA ALAMRAYA"></label>
   <label class="fld"><span>No PO</span><input class="inp" data-h="po" id="ed-po" value="${esc(e.po)}" placeholder="PO-02178"></label>
   <label class="fld"><span>Lead time</span><input class="inp" data-h="lead" id="ed-lead" value="${esc(e.lead)}" list="dl-lead" placeholder="3 Hari Kerja"></label>
   <label class="fld"><span>Estimasi kirim ${e.dueAuto?'<em class="auto">otomatis</em>':''}</span><input class="inp" type="date" data-h="due" id="ed-due" value="${esc(e.due)}"></label>
   <label class="fld"><span>Material / finishing ${e.matAuto?'<em class="auto">otomatis</em>':''}</span><input class="inp" data-h="material" id="ed-mat" value="${esc(e.material)}"></label>
   <label class="fld"><span>Tebal</span><input class="inp" data-h="tebal" id="ed-tebal" value="${esc(e.tebal)}"></label>
   <label class="fld"><span>Type</span><input class="inp" data-h="type" id="ed-type" value="${esc(e.type)}"></label>
  </div><p class="note">Estimasi kirim dihitung dari tanggal + lead time hari kerja (Senin–Jumat). Ubah manual bila perlu.</p></section>
  <section class="ecard"><div class="ecard-h"><h4>Item pekerjaan</h4><span class="note">Tips: copy baris dari Excel SPK lama (kolom No/Description/Qty/Satuan/Berat) lalu paste di kolom Description. Judul section kuning ikut terbaca. Pilihan Description, satuan, dan berat diambil dari <button type="button" class="linkbtn" data-act="katgo">Master Data › Item SPK</button>.</span></div>${spkDimBaru()&&!edKatalogSiap()?'<div class="ro" style="margin:8px 14px">Katalog berat belum terpasang, jadi berat belum terhitung otomatis. Pasang di <a href="#master-data">Master Data › Katalog berat</a>. Sampai itu berat diisi manual.</div>':''}
   <div id="ed-secs" class="esecs">${secs}</div>
   <div class="ed-add"><button type="button" class="btn sm" data-act="ed-addsec">${ic('plus')}Section</button><button type="button" class="btn sm" data-act="ed-addacc">${ic('plus')}Section ACCS</button><button type="button" class="btn sm" data-act="ed-addcov">${ic('plus')}Section COVER</button></div></section>
  <section class="ecard"><h4>Catatan &amp; distribusi</h4><div class="egrid">
   <label class="fld span2"><span>Note ${e.noteAuto?'<em class="auto">otomatis</em>':''}</span><input class="inp" data-h="note" id="ed-note" value="${esc(e.note)}"></label>
   <label class="fld"><span>Procurement / Estimator</span><input class="inp" data-h="signProc" id="ed-sp" value="${esc(e.signProc)}"></label>
   <label class="fld"><span>PPIC</span><input class="inp" data-h="signPpic" id="ed-spp" value="${esc(e.signPpic)}"></label>
   <div class="fld span4"><span>Distributed to</span><div class="dist">${distAll.map((d,i)=>`<label class="ck"><input type="checkbox" data-dist="${esc(d)}" id="ed-dist-${i}" ${e.dist.includes(d)?'checked':''}> ${esc(d)}</label>`).join('')}<input class="inp" id="ed-distnew" placeholder="+ tambah bagian, Enter"></div></div>
  </div></section>
  </div>
  <footer class="ed-foot"><span id="ed-tot"></span><span class="err" id="ed-err"></span></footer></div>
  <datalist id="dl-desc">${katIndex().arr.map(x=>`<option value="${esc(x.d)}" label="${esc([x.u,Object.entries(x.w).map(([t,v])=>(t==='–'?'':t+'mm ')+v+'kg').join(', ')].filter(Boolean).join(' · '))}">`).join('')}</datalist>
  <datalist id="dl-grup">${(k.grup||[]).map(d=>`<option value="${esc(d)}">`).join('')}</datalist>
  <datalist id="dl-cust">${[...new Set([...(k.customer||[]),...S.spk.map(s=>s.customer)])].sort().map(d=>`<option value="${esc(d)}">`).join('')}</datalist>
  <datalist id="dl-sales2">${[...new Set([...(k.sales||[]),...S.spk.map(s=>s.sales).filter(Boolean)])].sort().map(d=>`<option value="${esc(d)}">`).join('')}</datalist>
  <datalist id="dl-sat">${satList().map(d=>`<option value="${esc(d)}">`).join('')}</datalist>
  <datalist id="dl-lead">${OPSI().lead.map(d=>`<option value="${esc(d)}">`).join('')}</datalist>`;
 renderTotals();
}
function rerenderSecs(){let no=0;$('#ed-secs').innerHTML=ED.sections.map((s,i)=>{const h=edSecHtml(s,i,no);no+=s.lines.length;return h}).join('');renderTotals()}
function edSyncHeader(){const e=ED;const set=(id,v)=>{const x=$('#'+id);if(x&&document.activeElement!==x)x.value=v};set('ed-due',e.due);set('ed-note',e.note);set('ed-mat',e.material);set('ed-tebal',e.tebal);set('ed-type',e.type);set('ed-nomor',`${e.no}/SPK/${String(e.tgl).slice(0,4)}/WS`)}
function parsePaste(txt,curH){
 const out=[];let sec=null;const num=v=>{const x=parseFloat(String(v).replace(/\./g,'').replace(',','.'));return isNaN(x)?null:x};
 const numDot=v=>{const s=String(v).trim();if(/^\d+([.,]\d+)?$/.test(s))return parseFloat(s.replace(',','.'));return num(s)};
 for(const raw of txt.split(/\r?\n/)){if(!raw.trim())continue;let c=raw.split('\t').map(x=>x.trim());
  if(c.length>1&&/^\d+$/.test(c[0])&&c[1]&&numDot(c[1])===null)c=c.slice(1);else if(c.length>1&&c[0]===''&&c[1])c=c.slice(1);
  const rest=c.slice(1).filter(x=>x!=='');const d=c[0];if(!d)continue;
  if(!rest.length&&d===d.toUpperCase()&&/[A-Z]{3}/.test(d)){if(/^total$/i.test(d))continue;sec={h:d,lines:[]};out.push(sec);continue}
  if(/^total$/i.test(d))continue;
  let q=numDot(rest[0]),u=rest[1]||'',w=rest[2]!==undefined?numDot(rest[2]):null;if(u&&numDot(u)!==null){w=numDot(u);u=''}
  if(!sec){sec={h:curH,lines:[],cont:true};out.push(sec)}
  const h=sec.h;sec.lines.push({d,q:q??'',u:u||(KAT().satuan||{})[d]||'Pcs',w:w||weightCalc(d,h)||beratOf(d,h)||'',wsrc:w?'manual':(weightCalc(d,h)?'kalkulator':''),ket:'',catatan:'',prod:0})}
 return out;
}
function edInput(e){
 const t=e.target;if(!ED)return;
 if(t.dataset.h){const k=t.dataset.h;let v=t.value;if(k==='no')v=parseInt(v)||'';ED[k]=v;EDDIRTY=true;
  if(k==='due')ED.dueAuto=false;if(k==='note')ED.noteAuto=false;if(['material','tebal','type'].includes(k))ED.matAuto=false;
  if(['tgl','lead','due','no'].includes(k)){edAuto();edSyncHeader()}if(e.type==='change'&&['material','tebal'].includes(k))edHitungUlang();return}
 if(t.dataset.sf==='h'){const si=+t.dataset.s;ED.sections[si].h=t.value;EDDIRTY=true;edAuto();edSyncHeader();
  if(e.type==='change'){const hb=parseH(t.value);['p','t','tb','f'].forEach(k=>{const s=$(`#ed-h${k}-${si}`);if(s)s.value=hb[k]});edHitungUlang();setTimeout(()=>{if(ED)rerenderSecs()},0)}return}
 if(t.dataset.hb){const si=+t.dataset.s;const hb=parseH(ED.sections[si].h);hb[t.dataset.hb]=t.value;ED.sections[si].h=composeH(hb);$('#ed-h-'+si).value=ED.sections[si].h;EDDIRTY=true;edAuto();edSyncHeader();edHitungUlang();rerenderSecs();return}
 if(t.dataset.dist!==undefined){const d=t.dataset.dist;ED.dist=t.checked?[...new Set([...ED.dist,d])]:ED.dist.filter(x=>x!==d);EDDIRTY=true;return}
 const trS=t.closest('tr[data-s]');
 if(trS&&t.dataset.dim){const si=+trS.dataset.s,li=+trS.dataset.l,L=ED.sections[si].lines[li];L.dim=L.dim||{};L.dim[t.dataset.dim]=t.value;EDDIRTY=true;edBarisBerubah(trS,si,li,e.type==='input'&&t.dataset.dim);return}
 if(trS&&t.dataset.f==='sb'){const si=+trS.dataset.s,li=+trS.dataset.l,L=ED.sections[si].lines[li];L.sb=t.value;EDDIRTY=true;
  if(L.sb){L.dim=L.dim||{};if(L.wsrc==='kalkulator')L.wsrc='';L.lubang=L.lubangManual&&L.lubang?L.lubang:lubangBawaan(edCap(ED.sections[si]));edHitungBaris(ED.sections[si],L)}else{L.d=L.d&&L.sb===''&&L.dim?L.d:'';L.galat=''}
  rerenderSecs();const x=$('#ed-sb-'+si+'-'+li);x&&x.focus();return}
 if(trS&&(t.dataset.f==='fg'||t.dataset.f==='ambil')){const si=+trS.dataset.s,li=+trS.dataset.l,L=ED.sections[si].lines[li],ff=t.dataset.f;L[ff]=t.value;if(ff==='fg'&&!t.value)L.ambil='';EDDIRTY=true;
  if(ff==='fg'){setTimeout(()=>{if(ED)rerenderSecs()},0)}else{const h=$('#ed-sh-'+si+'-'+li);if(h)h.textContent=edStokHint(L)}return}
 if(trS&&t.dataset.f==='vv'){const si=+trS.dataset.s,li=+trS.dataset.l;ED.sections[si].lines[li].vv=t.value;EDDIRTY=true;setTimeout(()=>{if(ED)rerenderSecs()},0);return}
 if(trS&&t.dataset.f==='nm'){const si=+trS.dataset.s,li=+trS.dataset.l,L=ED.sections[si].lines[li];const v=String(t.value||'');L.nm=!!v.trim();L.d=L.nm?v:'';EDDIRTY=true;if(!L.nm){edHitungBaris(ED.sections[si],L);t.value=L.d||''}edStokRefresh(si,li);
  /* tombol "otomatis" muncul atau hilang langsung di DOM (tanpa render ulang, agar tidak bentrok dengan blur) */
  {const row=t.closest('.ed-nmrow');if(row){let b=row.querySelector('[data-act="ednmauto"]');if(L.nm&&!b){b=document.createElement('button');b.type='button';b.className='btn sm ghost';b.dataset.act='ednmauto';b.dataset.s=String(si);b.dataset.l=String(li);b.title='Kembalikan nama otomatis';b.textContent='↺ otomatis';row.appendChild(b)}else if(!L.nm&&b)b.remove()}}
  return}
 if(trS&&t.dataset.f==='lubang'){const si=+trS.dataset.s,li=+trS.dataset.l,L=ED.sections[si].lines[li];L.lubang=t.value;L.lubangManual=true;EDDIRTY=true;edBarisBerubah(trS,si,li,null);return}
 const tr=t.closest('tr[data-s]');if(!tr||!t.dataset.f)return;
 const si=+tr.dataset.s,li=+tr.dataset.l,f=t.dataset.f,L=ED.sections[si].lines[li];L[f]=t.value;EDDIRTY=true;
 if(L.sb&&f==='q'){edBarisBerubah(tr,si,li,null)}
 if(f==='q'&&L.fg){const h=$('#ed-sh-'+si+'-'+li);if(h)h.textContent=edStokHint(L)}
 if(f==='w'){L.wsrc=t.value===''?'':'manual';wTag(tr,L)}
 if(f==='d')edStokRefresh(si,li);
 if(f==='d'&&e.type==='change'&&spkDimBaru()&&!L.sb&&edKonversiTeks(si,li))return;
 if(f==='d'&&e.type==='change'){const k=KAT();
  if(!L.w||L.wsrc==='kalkulator'){const wi=weightInfo(L.d,ED.sections[si].h);if(wi&&wi.ok){L.w=Math.round(wi.beratSPK*1000)/1000;L.wsrc='kalkulator';tr.querySelector('[data-f=w]').value=L.w;wTag(tr,L);if(wi.catatan&&wi.catatan.length)toast('Berat dari kalkulator · '+wi.catatan.join('; '))}else if(L.wsrc==='kalkulator'){L.w='';L.wsrc='';tr.querySelector('[data-f=w]').value='';wTag(tr,L)}}
  if(!L.w){const w=beratOf(L.d,ED.sections[si].h);if(w){L.w=w;tr.querySelector('[data-f=w]').value=w}}if(k.satuan&&k.satuan[L.d]){L.u=k.satuan[L.d];tr.querySelector('[data-f=u]').value=L.u}/* fallback: fill satuan & berat from SPK history if not in master katalog */if(!L.u||!L.w){const hi=katIndex().arr.find(x=>x.d===L.d);if(hi){if(!L.u&&hi.u){L.u=hi.u;const uf=tr.querySelector('[data-f=u]');if(uf)uf.value=hi.u}if(!L.w&&hi.w&&hi.w['–']){L.w=hi.w['–'];const wf=tr.querySelector('[data-f=w]');if(wf)wf.value=hi.w['–']}}}/* final fallback: hitung dari formula Excel weightCalc */if(!L.w){const wc=weightCalc(L.d,ED.sections[si].h);if(wc){L.w=wc;const wf=tr.querySelector('[data-f=w]');if(wf)wf.value=wc}}}
 const bi=(+L.q||0)*(+L.w||0);tr.querySelector('[data-bi]').textContent=bi?n(bi):'–';edKgCells(tr,si,li);renderTotals();
 if(li===ED.sections[si].lines.length-1&&f==='d'&&t.value&&e.type==='input'&&!tr.nextElementSibling){ED.sections[si].lines.push(lineBaru(ED.sections[si].h));const id=t.id;const pos=t.selectionStart;rerenderSecs();const x=$('#'+id);if(x){x.focus();try{x.setSelectionRange(pos,pos)}catch(_){}}}
}
/* baris terstruktur berubah (ukuran, lubang, qty): hitung nama dan berat, perbarui sel tanpa menggambar ulang agar fokus tetap */
function edBarisBerubah(tr,si,li,fokusDim){
 const s=ED.sections[si],L=s.lines[li];edHitungBaris(s,L);
 const nm=$('#ed-nm-'+si+'-'+li);if(nm){if(nm.tagName==='INPUT'){if(document.activeElement!==nm)nm.value=L.d||''}else nm.innerHTML=L.d?esc(L.d):'<span class="muted">terisi otomatis dari ukuran</span>'}
 const gl=$('#ed-gl-'+si+'-'+li);if(gl)gl.textContent=L.galat||'';edStokRefresh(si,li);
 const wf=tr.querySelector('[data-f=w]');if(wf)wf.value=L.w===''?'':L.w;wTag(tr,L);
 const bi=(+L.q||0)*(+L.w||0);const b=tr.querySelector('[data-bi]');if(b)b.textContent=bi?n(bi):'–';const kgEl=$('#ed-kg-'+si+'-'+li);if(kgEl)kgEl.innerHTML=edKgSub(s,L,edCap(s));edKgCells(tr,si,li);renderTotals();
 /* baris terakhir mulai diisi: sediakan baris berikutnya */
 if(fokusDim&&li===s.lines.length-1&&!tr.nextElementSibling){s.lines.push(lineBaru(s.h));const id=document.activeElement&&document.activeElement.id;const pos=document.activeElement&&document.activeElement.selectionStart;rerenderSecs();const x=id&&$('#'+id);if(x){x.focus();try{x.setSelectionRange(pos,pos)}catch(_){}}}
}
function edPaste(e){
 const t=e.target;if(!ED||t.dataset.f!=='d')return;const txt=(e.clipboardData||window.clipboardData).getData('text');if(!txt||(!txt.includes('\t')&&!txt.includes('\n')))return;
 e.preventDefault();const tr=t.closest('tr[data-s]');const si=+tr.dataset.s,li=+tr.dataset.l;const secs=parsePaste(txt,ED.sections[si].h);if(!secs.length)return;
 const cur=ED.sections[si];const before=cur.lines.slice(0,li).filter(l=>String(l.d).trim()),after=cur.lines.slice(li+1).filter(l=>String(l.d).trim());
 const first=secs[0];const rest=secs.slice(1);
 if(first.cont||first.h===cur.h){cur.lines=[...before,...first.lines]}else{cur.lines=before.length?before:[];if(!before.length&&!cur.lines.length){cur.h=first.h;cur.lines=first.lines}else rest.unshift(first)}
 if(!cur.lines.length)cur.lines=[lineBaru(cur.h)];
 const ins=rest.map(s=>({h:s.h,lines:s.lines.length?s.lines:[lineBaru(s.h)]}));
 if(ins.length){ins[ins.length-1].lines.push(...after,lineBaru(ins[ins.length-1].h))}else cur.lines.push(...after,lineBaru(cur.h));
 ED.sections.splice(si+1,0,...ins);EDDIRTY=true;edAuto();edSyncHeader();rerenderSecs();
 const cnt=secs.reduce((a,s)=>a+s.lines.length,0);toast(`${cnt} baris ditempel${ins.length?` · ${ins.length} section baru`:''}`);
}
async function learnKatalog(items,e){
 const k=KAT();const berat={},satuan={};
 for(const it of items){if(+it.w>0){const key=it.d+'|'+thkOf(it.g);if((k.berat||{})[key]!==+it.w)berat[key]=+it.w}if(it.u&&(k.satuan||{})[it.d]!==it.u)satuan[it.d]=it.u}
 const up={};if(Object.keys(berat).length)up.berat=berat;if(Object.keys(satuan).length)up.satuan=satuan;
 const g=[...new Set(items.map(i=>i.g).filter(Boolean))].filter(x=>!(k.grup||[]).includes(x));if(g.length)up.grup=[...g,...(k.grup||[])].slice(0,250);
 if(e.customer&&!(k.customer||[]).includes(e.customer))up.customer=[...(k.customer||[]),e.customer].sort();
 if(e.sales&&!(k.sales||[]).includes(e.sales))up.sales=[...(k.sales||[]),e.sales].sort();
 if(!Object.keys(up).length)return;
 try{if(byId('master','katalog'))await DB.doc('master/katalog').update(up);else await DB.doc('master/katalog').set({berat:{},satuan:{},grup:[],customer:[],sales:[],...up})}catch(_){}
}
async function saveEditor(mode){
 const e=ED,err=$('#ed-err');err.textContent='';
 try{need('spk');
  const no=parseInt(e.no);if(!no)throw new Error('Isi No SPK.');if(!String(e.customer).trim())throw new Error('Isi nama customer.');e.customer=cleanName(e.customer);{const sim=similarTo('customer',e.customer);if(sim){e.customer=sim.nama;const ci=$('#ed-cust');if(ci)ci.value=sim.nama;throw new Error(`Customer disamakan ke "${sim.nama}" (sudah terdaftar). Klik simpan lagi.`)}}if(!e.tgl)throw new Error('Isi tanggal SPK.');
  const items=[],oiList=[];for(const s of e.sections)for(const l of s.lines){if(l.sb){const cap=edCap(s),sh=cap&&cap.all.find(x=>x.id===l.sb);if(sh){edHitungBaris(s,l);if(dimKosong(sh,l)&&(l.q===''||l.q==null))continue;const hil=sh.dim.filter(d=>!(+((l.dim||{})[d.k])>0)).map(d=>d.label);if(hil.length)throw new Error(`Baris ${sh.nama} (${s.h}): ukuran ${hil.join(', ')} belum diisi.`);l._fh=!!sh.fullHole;l.dim=Object.fromEntries(sh.dim.map(d=>[d.k,(l.dim||{})[d.k]]).filter(([,v])=>v!==''&&v!=null))}}if(!String(l.d).trim())continue;const q=num0(l.q);if(q<=0)throw new Error(`Qty untuk "${l.d}" belum diisi.`);oiList.push(l.oi);items.push({d:String(l.d).trim(),g:String(s.h||'').trim(),q,u:String(l.u||'Pcs').trim(),w:num0(l.w),...(l.wsrc&&num0(l.w)>0?{ws:l.wsrc==='kalkulator'?'k':'m'}:{}),...(l.wsrc==='kalkulator'&&num0(l.wEst)>0?{wEst:num0(l.wEst)}:{}),ket:String(l.ket||'').trim(),catatan:String(l.catatan||'').trim(),prod:Math.min(q,+l.prod||0),...(l.vv?{vv:l.vv}:{}),...(l.fg?{fg:l.fg}:{}),...(!e.stokReq&&l.fg&&num0(l.ambil)>0?{ambil:num0(l.ambil)}:{}),...(l.sb?{sb:l.sb,...(l.nm?{nm:true}:{}),dim:{...(l.dim||{})},...(l._fh?{lubang:l.lubang==='full'?'full':l.lubang==='tanpa'?'tanpa':'standar'}:{})}:{})})}
  if(!items.length)throw new Error('Tambahkan minimal satu item.');
  if(!e.stokReq){const per={};items.forEach(i=>{if(i.ambil>0){if(i.ambil>i.q)throw new Error(`"${i.d}": jumlah dari stok (${n(i.ambil)}) melebihi qty order (${n(i.q)}).`);per[i.fg]=(per[i.fg]||0)+i.ambil}});
   const res=fgResMap(e.id),klr=e.id?fgKeluarMap():{};
   for(const [fg,a] of Object.entries(per)){const p=byId('fg',fg);if(!p)throw new Error('Produk gudang barang jadi untuk "dari stok" tidak ditemukan.');
    const sudah=e.id?(klr[e.id+'|'+fg]||0):0;if(a<sudah)throw new Error(`"${fgLabel(p)}": ${n(sudah)} sudah dikeluarkan dari stok untuk SPK ini; jumlah dari stok tidak bisa dikurangi di bawah itu.`);
    if(mode==='terbit'||(e.id&&e.orig&&(e.orig.status||'Terbit')==='Terbit')){const tersedia=(calc().stock.fg[fg]||0)-(res[fg]||0);const butuh=a-sudah;if(butuh>tersedia)throw new Error(`Stok tersedia "${fgLabel(p)}" hanya ${n(Math.max(0,tersedia))} (sisanya sudah dicadangkan SPK lain atau sedang tidak ada); diminta ${n(butuh)} lagi.`)}}}
  const editTerbit=e.id&&e.orig&&(e.orig.status||'Terbit')==='Terbit';
  if(editTerbit&&!String(e.revAlasan).trim())throw new Error('Isi alasan revisi.');
  if(editTerbit){const gl=revisiGuard(e.orig,items,oiList);if(gl)throw new Error(gl)}
  const status=mode==='terbit'?'Terbit':'Draft';const now=new Date().toISOString();
  const data={no,nomor:`${no}/SPK/${String(e.tgl).slice(0,4)}/WS`,tgl:e.tgl,customer:String(e.customer).trim(),po:String(e.po||'').trim(),sales:String(e.sales||'').trim(),lead:String(e.lead||'').trim(),due:e.due||'',material:e.material||'',tebal:e.tebal||'',type:e.type||'',note:e.note||'',dist:e.dist,signProc:e.signProc||'',signPpic:e.signPpic||'',items:status==='Terbit'?snapItems(items,e.id&&e.orig?e.orig:null,oiList):items,status,...(e.so?{so:e.so}:{})};
  const btns=document.querySelectorAll('#editor [data-act=ed-save]');btns.forEach(b=>b.disabled=true);
  try{
   if(!e.id||(e.orig&&e.orig.no!==no)){
    const id='spk-'+no;
    try{const r=await DB.doc('lock/new-'+no).acquire({holder:ME||HOLDER,ttlMs:20000});if(r&&r.acquired===false)throw new Error(`Nomor ${no} sedang diklaim pengguna lain. Pakai nomor ${nextNo()+1}.`)}catch(x){if(x.message&&x.message.startsWith('Nomor'))throw x}
    const ex=await DB.doc('spk/'+id).get();if(ex.exists)throw new Error(`SPK ${no} sudah dipakai. Nomor berikutnya yang kosong: ${nextNo()}.`);
    Object.assign(data,{alasan:'',rev:0,revisi:[],at:now,by:ME||null},status==='Terbit'?{terbitAt:now,terbitBy:ME||null}:{});
    await DB.doc('spk/'+id).set(data);logAct('spk',id,'add',data);
    if(e.id&&e.orig&&e.orig.no!==no){await DB.doc('spk/'+e.id).delete()}
    e.id=id;
   }else{
    const o=e.orig||{};const up={...data,updAt:now,updBy:ME||null};
    if(editTerbit){up.rev=(o.rev||0)+1;up.revisi=[...(o.revisi||[]),{rev:up.rev,at:now,by:ME||null,alasan:String(e.revAlasan).trim()}];up.status='Terbit'}
    else if(status==='Terbit'){up.terbitAt=now;up.terbitBy=ME||null}
    await DB.doc('spk/'+e.id).update(up);logAct('spk',e.id,'upd',up);
   }
  }finally{btns.forEach(b=>b.disabled=false)}
  learnKatalog(items,e);if(!inMaster('customer',data.customer))addDoc('mcustomer',{nama:data.customer,pic:'',telp:'',alamat:'',aktif:true}).catch(()=>{});
  const id=e.id;if(status==='Terbit')setTimeout(()=>prOtomatisSpk(id),700);closeEditor();toast(status==='Terbit'?(editTerbit?`SPK ${no} Rev.${(e.orig.rev||0)+1} tersimpan · tim langsung melihat`:`SPK ${no} terbit · tim langsung melihat`):`Draft SPK ${no} tersimpan`);
  setTimeout(()=>openSheet(id),60);
 }catch(x){err.textContent=x.message||('Gagal menyimpan ('+(x.code||'error')+')')}
}

/* ----- document (sheet) view ----- */
let SHEET=null;
const spkFull=s=>({...s,note:s.note||(s.due?'NOTE : ESTIMASI KIRIM '+tglLong(s.due).toUpperCase():''),dist:s.dist||OPSI().dist,signProc:s.signProc||OPSI().signProc,signPpic:s.signPpic||OPSI().signPpic});
function sheetCtx(s){
 const sum=its=>{const m={};(its||[]).forEach(i=>m[i.d]=(m[i.d]||0)+(+i.q||0));return m};
 const vs=S.vendor.filter(v=>v.spk===s._id).sort((a,b)=>(a.tgl+(a.at||'')).localeCompare(b.tgl+(b.at||'')));
 const ks=S.kirim.filter(k=>k.spk===s._id&&k.status!=='Batal').sort((a,b)=>(a.tgl+(a.at||'')).localeCompare(b.tgl+(b.at||'')));
 const lines={};(calc().spk[s._id]?.lines||[]).forEach(l=>{if(!lines[l.d])lines[l.d]=l});const ret=[],rej={};vs.filter(v=>v.status!=='Batal').forEach(v=>{(v.items||[]).forEach(i=>rej[i.d]=(rej[i.d]||0)+(+i.reject||0));vReturns(v).forEach(r=>ret.push({name:v.vendor,date:r.tgl?fdS(r.tgl)+(r.est?'*':''):'-',sort:r.tgl||'9',map:r.items||{}}))});ret.sort((a,b)=>a.sort.localeCompare(b.sort));
 return {lines,ret,rej,vend:vs.filter(v=>v.status!=='Batal').map(v=>({name:v.vendor,date:fdS(v.tgl),map:sum(v.items)})),cust:ks.map(k=>({name:k.noSJ||'',date:fdS(k.tgl),map:sum(k.items)})),tglLong:tglLong(s.tgl),logoB64:LOGO_B64,issued:s.terbitAt?`Diterbitkan via MNI Gudang & Logistik · ${tglLong(s.terbitAt)}`:''};
}
function openSheet(id,tries=0){if(!byId('spk',id)){if(tries<25)setTimeout(()=>openSheet(id,tries+1),120);return} /* B-010: tunggu snapshot SPK baru (maks ±3 dtk); jangan tampilkan lembar kosong yang menutup layar */SHEET=id;closeDrawer();renderSheet();$('#sheet').hidden=false;document.body.style.overflow='hidden'}
function closeSheet(){SHEET=null;$('#sheet').hidden=true;$('#sheet').innerHTML='';if(!ED)document.body.style.overflow=''}
function renderSheet(){
 const s0=byId('spk',SHEET);if(!s0){closeSheet();return}const s=spkFull(s0);
 const ctx=sheetCtx(s),x=calc().spk[s._id];
 const secs=secsOf(s);const lineBy={};x.lines.forEach(l=>lineBy[l.d]=lineBy[l.d]||l);
 // Fixed 13-column layout: No | Desc | QTY | Satuan | Berat/pcs | Berat/item | Produksi | Kirim Vendor | Balik Vendor | Terkirim | Blm Produksi | Di Vendor | Blm Kirim | % Prod | % Finish | % Kirim | Ket
 const all=17;
 const pc=v=>Math.round(v*100)+'%';
 let no=0,tq=0,tw=0,pp=[],pf=[],pk=[];
 const itemRows=[];
 // Build vendor / return / kirim lookup per item (aggregate all surat jalan)
 const vByItem={},rByItem={},cByItem={};
 ctx.vend.forEach(v=>Object.entries(v.map).forEach(([d,q])=>vByItem[d]=(vByItem[d]||0)+q));
 ctx.ret.forEach(r=>Object.entries(r.map).forEach(([d,q])=>rByItem[d]=(rByItem[d]||0)+q));
 ctx.cust.forEach(c=>Object.entries(c.map).forEach(([d,q])=>cByItem[d]=(cByItem[d]||0)+q));
 // Build date hints per item for tooltip lines
 const vDates=ctx.vend.map(v=>v.date).filter(Boolean);
 const rDates=ctx.ret.map(r=>r.date).filter(Boolean);
 const cDates=ctx.cust.map(c=>c.date).filter(Boolean);
 const dateHint=(dates,label)=>dates.length?`<div class="note" style="font-size:10px;color:var(--muted)">${label}: ${dates.join(', ')}</div>`:'';

 secs.forEach((sec,si)=>{
  if(si>0&&sec.h)itemRows.push(`<tr><td></td><td class="ys" colspan="${all-1}">${esc(sec.h)}</td></tr>`);
  sec.lines.forEach(it=>{no++;const l=lineBy[it.d]||{prodEff:0,kirim:0};const q=+it.q||0,w=+it.w||0;tq+=q;tw+=q*w;
   const vS=vByItem[it.d]||0,rS=rByItem[it.d]||0,cS=cByItem[it.d]||0;
   const blmProd=Math.max(0,q-l.prodEff);
   const diVendor=Math.max(0,vS-rS-(ctx.rej[it.d]||0));
   const blmKirim=Math.max(0,(rS||l.prodEff)-l.kirim);
   const pP=q?Math.min(1,l.prodEff/q):0,pF=q?Math.min(1,rS/q):0,pK=q?Math.min(1,l.kirim/q):0;
   pp.push(pP);pf.push(pF);pk.push(pK);
   const hasVendor=vS>0||rS>0;
   itemRows.push(`<tr>
    <td class="c b">${no}</td>
    <td class="l">${esc(it.d)}${it.ket?` <span class="red">(${esc(it.ket)})</span>`:''}${ctx.rej[it.d]?` <span class="red">(reject ${n(ctx.rej[it.d])})</span>`:''}</td>
    <td class="c">${n(q)}</td>
    <td class="c">${esc(it.u||'')}</td>
    <td class="c">${w?w.toFixed(2):''}</td>
    <td class="c">${w?(q*w).toFixed(2):''}</td>
    <td class="c b">${n(l.prodEff)}</td>
    <td class="c${hasVendor?' yl':''}">${vS?n(vS):'–'}${hasVendor?dateHint(vDates,'Kirim'):''}</td>
    <td class="c${hasVendor?' rt':''}">${hasVendor?n(rS)+'<span class="muted">/'+n(vS)+'</span>':'–'}${hasVendor?dateHint(rDates,'Balik'):''}</td>
    <td class="c">${cS?n(cS):'–'}${cS?dateHint(cDates,'Tgl'):''}
    </td>
    <td class="c gr${blmProd>0?' red':' ok'}">${blmProd>0?n(blmProd):'✓'}</td>
    <td class="c gr${diVendor>0?' red':' ok'}">${hasVendor?(diVendor>0?n(diVendor)+' di vendor':'✓'):'–'}</td>
    <td class="c gr${blmKirim>0?' red':' ok'}">${blmKirim>0?n(blmKirim):'✓'}</td>
    <td class="c">${pc(pP)}</td>
    <td class="c">${hasVendor?pc(pF):'–'}</td>
    <td class="c">${pc(pK)}</td>
    <td class="l">${esc(it.catatan||'')}</td>
   </tr>`);
  });
 });
 const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
 const st=s.status||'Terbit';
 const revs=(s.revisi||[]).slice().reverse();
 const hasAnyVendor=ctx.vend.length>0;
 $('#sheet').innerHTML=`<div class="sh"><header class="sh-bar"><button class="btn ghost" data-act="sheet-close">← Kembali</button><div class="sh-ttl"><b>SPK ${s.no}${s.rev?' Rev.'+s.rev:''}</b> <span class="muted">${esc(s.customer)}</span> ${stChip(st)} ${stChip(x.st)}</div>
  <div class="sh-btns"><button class="btn" data-act="spkedit" data-id="${s._id}">Edit</button><button class="btn" data-act="spkdup" data-id="${s._id}">Duplikat</button>${st==='Draft'?`<button class="btn" data-act="spkpub" data-id="${s._id}">${ic('chk')}Terbitkan</button>`:''}<button class="btn" data-act="doc" data-kind="spk" data-ref="${s._id}" data-fmt="pdf">${ic('file')}PDF</button><button class="btn primary" data-act="spkxlsx" data-id="${s._id}">${ic('dl')}Excel</button></div></header>
  <div class="sh-scroll"><div class="paper ${st==='Draft'?'draft':''}">
   <div class="pp-head"><img src="${esc(KOP().logo)}" alt=""><div class="pp-co"><b>${esc(KOP().nama)}</b>${[KOP().a1,KOP().a2,KOP().kontak].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
   <table class="pp"><tbody>
    <tr class="r-t"><td colspan="2" class="c b t14">SURAT PERINTAH KERJA (SPK)</td><td colspan="4" class="c gr t26">SPK ${s.no}${s.rev?' <small>Rev.'+s.rev+'</small>':''}</td><td colspan="${all-6}" class="ws"><div class="c b t12">WORKSHOP MNI</div><div class="kvp"><span>Nomor</span><span>: ${esc(s.nomor||'')}</span><span>Tanggal</span><span>: ${esc(tglLong(s.tgl))}</span><span>Sales</span><span>: ${esc(s.sales||'')}</span></div></td></tr>
    <tr><td colspan="2" class="c">Halaman 1 dari 1</td><td colspan="4"></td><td colspan="${all-6}" class="b">LEAD TIME : ${esc(s.lead||'-')}</td></tr>
    <tr class="r-c"><td colspan="6" class="c b i yl t125">${esc(s.customer)}${s.po?' - '+esc(s.po):''}</td><td colspan="${all-6}" class="yl"></td></tr>
    <tr class="hd">
     <th rowspan="2">No</th><th rowspan="2">DESCRIPTION<br><small class="ys">${esc(secs[0]?.h||'')}</small></th>
     <th rowspan="2">QTY</th><th rowspan="2">Satuan</th><th rowspan="2">Berat/<br>pcs</th><th rowspan="2">Berat/<br>item</th>
     <th rowspan="2">Produksi<br>Selesai</th>
     <th colspan="2" class="yl">Subcont / Vendor</th>
     <th rowspan="2">Terkirim<br>Customer</th>
     <th colspan="3" class="gr">KEKURANGAN</th>
     <th colspan="3">PROGRESS ( % )</th>
     <th rowspan="2">Keterangan</th>
    </tr>
    <tr class="hd">
     <th class="yl w">Kirim</th><th class="rt w">Balik</th>
     <th class="gr">Blm Produksi</th><th class="gr">Di Vendor</th><th class="gr">Blm Kirim</th>
     <th>Produksi</th><th>${hasAnyVendor?'Finishing':'–'}</th><th>Kirim</th>
    </tr>
    ${itemRows.join('')}
    <tr><td colspan="${all}">&nbsp;</td></tr>
    <tr><td></td><td class="c b">Total</td><td class="c b">${n(tq)}</td><td class="c">Btg/Pcs</td><td></td><td class="c b">${tw?tw.toFixed(2):''} Kg</td><td colspan="4"></td><td colspan="3"></td><td class="c b">${pc(avg(pp))}</td><td class="c b">${hasAnyVendor?pc(avg(pf)):'–'}</td><td class="c b">${pc(avg(pk))}</td><td></td></tr>
   </tbody></table>
   ${(k=>k.ada?`<div class="pp-kg"><span>Kg estimasi (plate): <b>${n(Math.round(k.te*100)/100)}</b></span><span>Kg real (barang jadi): <b>${n(Math.round(k.tr*100)/100)}</b></span></div>`:'')(spkKgDua(s))}<div class="pp-foot"><div class="pp-note">${esc(s.note||'')}</div><div class="pp-dist"><span>Distributed to:</span><ul>${(s.dist||OPSI().dist).map(d=>`<li>~ ${esc(d)}</li>`).join('')}</ul></div></div>
   <div class="pp-sign"><div><b>Procurement/Estimator</b><span class="sp"></span><b>( ${esc(s.signProc||OPSI().signProc)} )</b></div><div><b>PPIC</b><span class="sp"></span><b>( ${esc(s.signPpic||OPSI().signPpic)} )</b></div></div>
  </div>
  ${matPanelHtml(matSpkItems(s),{spkId:s._id,tebal:s.tebal,label:'Material SPK '+s.no+' '+s.customer})}
  <div class="sh-meta">${st==='Draft'?'<span class="chip warn">Draft · belum terbit, belum masuk monitoring produksi</span>':''}
   ${s.terbitAt?`<span>Terbit ${fd(s.terbitAt)} oleh ${who(s.terbitBy)}</span>`:''}${revs.length?`<div><b>Riwayat revisi</b><ul>${revs.map(r=>`<li>Rev.${r.rev} · ${fd(r.at)} · ${who(r.by)} — ${esc(r.alasan||'')}</li>`).join('')}</ul></div>`:''}
   <span class="note">Kolom produksi, subcont/vendor, dan progress terisi otomatis dari transaksi realtime. Kolom "Balik" menampilkan qty kembali / qty yang dikirim ke vendor. ✓ = sudah selesai semua. Tanggal kecil di bawah qty = referensi surat jalan.</span></div>
  </div></div>`;
 resolveNames();
}
let XL=null;
function loadExcelJS(){if(window.ExcelJS)return Promise.resolve(window.ExcelJS);if(XL)return XL;
 const tryLoad=src=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=()=>window.ExcelJS?res(window.ExcelJS):rej(new Error('ExcelJS tidak termuat'));s.onerror=()=>rej(new Error('Gagal memuat ExcelJS'));document.head.appendChild(s)});
 XL=tryLoad('/vendor/exceljs.min.js').catch(()=>tryLoad('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js')).catch(()=>tryLoad('https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js')).catch(e=>{XL=null;throw e});return XL}
async function exportSpkXlsx(id){
 const s=byId('spk',id);if(!s)return;if(!DLS){toast('Unduhan tidak tersedia di tampilan ini.');return}
 toast('Menyiapkan file Excel…');
 try{const X=await loadExcelJS();const wb=buildSpkXlsx(X,spkFull(s),sheetCtx(s));const buf=await wb.xlsx.writeBuffer();
  const name=`SPK ${s.no}${s.rev?' Rev.'+s.rev:''} - ${String(s.customer).replace(/[\\/:*?"<>|]/g,'').slice(0,60)}.xlsx`;
  await DLS.save({filename:name,data:new Uint8Array(buf)});}
 catch(e){if(e.code!=='declined')toast('Gagal membuat Excel: '+(e.message||e.code))}
}
async function publishDraft(id){const s=byId('spk',id);if(!s)return;const items=(s.items||[]);if(!items.length){toast('SPK belum punya item.');return}
 const now=new Date().toISOString();await updDoc('spk',id,{status:'Terbit',terbitAt:now,terbitBy:ME||null,items:snapItems(items,null,null)});toast(`SPK ${s.no} terbit · tim langsung melihat`);setTimeout(()=>prOtomatisSpk(id),700)}

/* ---------- events ---------- */
let delArm=null;
/* ================= USERS, ROLES & KPI ================= */
/* Peran = paket hak bawaan (preset). Hak sebenarnya disimpan per pengguna di muser.modul {modul:'lihat'|'ubah'};
   admin (super admin) selalu memiliki semua modul. mods = modul yang boleh DIUBAH, lihat = modul yang hanya boleh DILIHAT. */
const ROLES={
 admin:{l:'Super Admin',d:'Semua modul dan kelola pengguna',mods:['*'],lihat:[]},
 ppic:{l:'PPIC',d:'SPK dan kirim ke vendor; melihat gudang dan pengiriman',mods:['spk','vendor'],lihat:['bahan-baku','barang-jadi','pengiriman','bongkar-muat']},
 produksi:{l:'Produksi',d:'Progres produksi pada SPK; melihat vendor',mods:['spk'],lihat:['vendor']},
 gbb:{l:'Gudang Bahan Baku',d:'Stok plat, terima material, pakai produksi, opname, PR; stok sparepart',mods:['bahan-baku','bongkar-muat','sparepart'],lihat:['spk']},
 gbj:{l:'Gudang Barang Jadi',d:'Stok barang jadi, terima dari vendor, surat jalan',mods:['barang-jadi','vendor','pengiriman','bongkar-muat'],lihat:['spk']},
 logistik:{l:'Logistik / Pengiriman',d:'Surat jalan, armada, bongkar muat',mods:['pengiriman','bongkar-muat'],lihat:['spk','barang-jadi']},
 sales:{l:'Sales',d:'Peran lama (tidak dipakai lagi); hanya melihat SPK',mods:[],lihat:['spk']},
 viewer:{l:'Viewer',d:'Hanya melihat semua modul, tidak mencatat',mods:[],lihat:['bahan-baku','barang-jadi','sparepart','vendor','pengiriman','spk','bongkar-muat']}
};
const MODS=[['bahan-baku','Bahan baku'],['barang-jadi','Barang jadi'],['vendor','Vendor'],['pengiriman','Kirim customer'],['spk','SPK & produksi'],['bongkar-muat','Bongkar muat'],['sparepart','Sparepart'],['master-data','Master data']];
const MODL=Object.fromEntries(MODS);
const presetModul=r=>{const p=ROLES[r];if(!p||p.mods[0]==='*')return {};const o={};p.lihat.forEach(m=>o[m]='lihat');p.mods.forEach(m=>o[m]='ubah');return o};
let IS_OWNER=false,IS_EDITOR=false,ME_P=null;
function myRole(){return ME_P?(ME_P.role||'viewer'):null}
/* level saya pada satu modul: 'ubah' | 'lihat' | null (tidak terlihat) */
function myLevel(m){
 if(!ME_P)return CAN?'ubah':'lihat';
 if(ME_P.role==='admin')return 'ubah';
 if(ME_P.modul&&typeof ME_P.modul==='object')return ME_P.modul[m]||null;
 const md=(ROLES[ME_P.role]||{mods:[]}).mods;return md.includes(m)?'ubah':'lihat'}
const myAnyEdit=()=>ME_P?(ME_P.role==='admin'||MODS.some(([m])=>myLevel(m)==='ubah')):CAN;
const roleL=r=>(ROLES[r]||{}).l||'Belum terdaftar';
function myAcc(){
 if(!ME)return {st:'anon',role:null};
 const mu=byId('muser',ME);
 if(ME_P&&ME_P.role){if(ME_P.terdaftar===false)return {st:'new',role:null,mu};return {st:'ok',role:ROLES[ME_P.role]?ME_P.role:'viewer',mu}} /* peran dari tabel pengguna (Supabase) */
 if(IS_OWNER)return {st:'ok',role:'admin',mu};
 if(mu&&mu.aktif===false)return {st:'off',role:'viewer',mu};
 if(mu&&ROLES[mu.role])return {st:'ok',role:mu.role,mu};
 if(IS_EDITOR)return {st:'ok',role:'admin',mu,implicit:true};
 return {st:'new',role:null};
}
function canMod(m){if(!ME_P&&!ME)return false;if(m==='*any')return myAnyEdit();return myLevel(m)==='ubah'}
const canManage=()=>!!ME_P&&myRole()==='admin';
function modOf(c,data,id,op){
 if(c==='pr'){const g=(data&&data.gudang)||(byId('pr',id)||{}).gudang;return g==='sp'?'sparepart':'bahan-baku'}
 if(['rm','rmhist','opname'].includes(c))return 'bahan-baku';
 if(c==='fg')return 'barang-jadi';
 if(c==='sp')return 'sparepart';
 if(c==='mutasi'){const g=(data&&data.gudang)||(byId('mutasi',id)||{}).gudang;return g==='rm'?'bahan-baku':g==='sp'?'sparepart':'barang-jadi'}
 if(c==='spk'||c==='produksi_log')return 'spk';if(c==='vendor')return 'vendor';if(c==='kirim')return 'pengiriman';
 if(c==='bongkar')return op==='add'&&data&&data.auto?'*any':'bongkar-muat';
 if(c==='master')return id==='setting'?'bahan-baku':'*any';
 if(['mvendor','mcustomer','msupplier','marmada'].includes(c))return op==='del'?'master-data':'*any';
 return '*any';
}
function guard(c,data,id,op){
 if(!ROLE_ON&&!(ME_P&&ME_P.role))return;
 const a=myAcc();
 if(a.st==='new')throw new Error('Akun Anda belum terdaftar sebagai pengguna. Minta super admin mendaftarkan akun Anda.');
 if(a.st==='off')throw new Error('Akun Anda dinonaktifkan admin.');
 const m=modOf(c,data,id,op);
 if(!canMod(m))throw new Error(`Akses Anda (${roleL(a.role)}) tidak mencakup pencatatan di ${MODL[m]||'modul ini'}. Minta super admin menambah akses.`);
}
/* ---- audit log: one row per write ---- */
const CNM={rm:'item bahan baku',fg:'item barang jadi',mutasi:'mutasi stok',spk:'SPK',vendor:'kiriman vendor',kirim:'surat jalan',bongkar:'bongkar muat',pr:'PR',opname:'opname',master:'pengaturan',mvendor:'master vendor',mcustomer:'master customer',msupplier:'master supplier',marmada:'master armada',rmhist:'riwayat harga',muser:'data pengguna',produksi_log:'hasil produksi per mesin'};
function actLabel(c,op,d){
 if(op==='del')return 'Hapus '+(CNM[c]||c);
 if(op==='add'){
  if(c==='mutasi'){const j=d.jenis;return (j==='masuk'?(d.gudang==='rm'?'Terima material':'Barang masuk'):j==='keluar'?(d.gudang==='rm'?'Pakai produksi':'Barang keluar'):j==='opname'?'Stock opname':MVL[j]||'Mutasi')}
  return {vendor:'Kirim ke vendor',kirim:'Buat surat jalan',bongkar:d.auto?'Antrian bongkar (otomatis)':'Catat kendaraan masuk',spk:d.status==='Draft'?'Buat draft SPK':'Terbitkan SPK',pr:'Buat PR',opname:'Stock opname',rm:'Item bahan baku baru',fg:'Item barang jadi baru'}[c]||'Tambah '+(CNM[c]||c);
 }
 if(c==='pr'&&d.diajukanAt)return 'Ajukan PR';
 if(c==='spk'&&d.beratDihitungUlang)return 'Hitung ulang berat SPK';
 if(d.batal)return 'Batalkan '+(CNM[c]||c);
 if(d.riwayat)return 'Terima dari vendor';
 if(d.revisi)return 'Revisi SPK';
 if(d.terbitAt)return 'Terbitkan SPK';
 if(d.dikoreksi)return 'Koreksi mutasi';
 if(c==='spk'&&d.items)return 'Update progres produksi';
 if(c==='bongkar'&&d.status)return d.status==='Proses'?'Mulai bongkar muat':d.status==='Selesai'?'Selesai bongkar muat':'Update bongkar muat';
 if(d.status)return `${CNM[c]||c} → ${d.status}`.replace(/^./,x=>x.toUpperCase());
 return 'Ubah '+(CNM[c]||c);
}
function refOf(c,d){
 if(c==='spk')return d.no?'SPK '+d.no+(d.customer?' · '+d.customer:''):'';
 if(c==='vendor')return [d.noSJ,d.vendor,d.spk?spkName(d.spk):''].filter(Boolean).join(' · ');
 if(c==='kirim')return [d.noSJ,d.customer].filter(Boolean).join(' · ');
 if(c==='mutasi'){const it=byId(d.gudang,d.item);return `${d.delta>0?'+':''}${n(d.delta)} · ${d.gudang==='rm'?rmLabel(it):d.gudang==='sp'?spLabel(it):fgLabel(it)}${d.ref?' · '+d.ref:''}`}
 if(c==='bongkar')return [d.jenis,d.nopol,d.pihak].filter(Boolean).join(' · ');
 if(c==='pr')return d.noPR||'';
 if(c==='rm')return rmLabel(d);if(c==='fg')return fgLabel(d);
 return d.nama||d.nopol||'';
}
function logAct(c,id,op,data){
 if(!DB||!ME||c==='log')return;
 try{const d={...(byId(c,id)||{}),...(data||{})};
  let tgl=op==='add'?(d.tgl||''):'';if(op==='upd'&&data&&data.riwayat){const r=data.riwayat[data.riwayat.length-1];tgl=r&&r.tgl||''}
  const row={u:ME,at:new Date().toISOString(),c,d:id||'',op,k:actLabel(c,op,data||{}),mod:modOf(c,d,id,op),ref:String(refOf(c,d)||'').slice(0,140),tgl};
  if(op==='add'&&d.auto)row.auto=true;
  DB.collection('log').add(row).catch(()=>{});
 }catch(_){}
}
/* ---- activity stream: audit log + history rebuilt from documents before the log existed ---- */
const locDate=iso=>{const d=new Date(iso);return isNaN(d)?'':d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
function acts(){
 const c=calc();if(c._acts)return c._acts;
 const ev=[];const L=S.log.filter(l=>l.u&&l.at);const START=L.reduce((a,l)=>!a||l.at<a?l.at:a,'');
 const old=at=>at&&(!START||at<START);
 const push=(u,at,c2,k,ref,tgl,auto,mod)=>{if(u&&old(at))ev.push({u,at,c:c2,mod:mod||modOf(c2,null,null,'add'),k,ref,tgl:tgl||'',auto:!!auto})};
 for(const cn of ['rm','fg','mutasi','spk','vendor','kirim','bongkar','pr','opname','mvendor','mcustomer','msupplier','marmada']){
  for(const d of S[cn]){const seen=new Set();
   if(d.by&&d.at){push(d.by,d.at,cn,actLabel(cn,'add',d),refOf(cn,d),d.tgl,d.auto,modOf(cn,d,d._id,'add'));seen.add(d.at)}
   if(cn==='spk'){if(d.terbitBy&&d.terbitAt&&d.terbitAt!==d.at){push(d.terbitBy,d.terbitAt,cn,'Terbitkan SPK',refOf(cn,d));seen.add(d.terbitAt)}(d.revisi||[]).forEach(r=>{push(r.by,r.at,cn,'Revisi SPK',refOf(cn,d));seen.add(r.at)})}
   if(cn==='vendor')(d.riwayat||[]).forEach(r=>{const at=r.at||(r.tgl?r.tgl+'T12:00:00':'');push(r.by,at,cn,'Terima dari vendor',refOf(cn,d),r.tgl);seen.add(at)});
   if(d.batal&&d.batal.by){push(d.batal.by,d.batal.at,cn,'Batalkan '+CNM[cn],refOf(cn,d));seen.add(d.batal.at)}
   if(d.updBy&&d.updAt&&!seen.has(d.updAt)&&cn!=='vendor'&&cn!=='spk')push(d.updBy,d.updAt,cn,actLabel(cn,'upd',{status:d.status}),refOf(cn,d),'',false,modOf(cn,d,d._id,'upd'))
  }
 }
 for(const l of L)ev.push({u:l.u,at:l.at,c:l.c,mod:l.mod,k:l.k,ref:l.ref||'',tgl:l.tgl||'',auto:!!l.auto,op:l.op});
 ev.forEach(e=>{e.day=locDate(e.at);e.late=e.tgl&&e.day?Math.max(0,days(e.tgl,e.day)-1):0});
 ev.sort((a,b)=>b.at.localeCompare(a.at));
 c._acts=ev;c._logStart=START;return ev;
}
const uname=id=>(byId('muser',id)||{}).nama||(byId('ureq',id)||{}).nama||'';
const initials=s=>String(s||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';
const av=(id,sz)=>`<span class="av${sz?' '+sz:''}" data-uav="${esc(id||'')}" aria-hidden="true">${esc(initials(uname(id)))}</span>`;
const uName=id=>`<span data-uid="${esc(id)}">${esc(uname(id)||'Pengguna')}</span>`;
function userIds(){const s=new Set();S.muser.forEach(m=>s.add(m._id));acts().forEach(e=>s.add(e.u));if(ME&&myAcc().role)s.add(ME);return [...s]}
const userRole=id=>{const m=byId('muser',id);if(m)return m.aktif===false?'off':m.role;return id===ME&&myAcc().role?myAcc().role:''};
/* ---- period ---- */
F.kinerja={p:'30',role:'',sort:'total'};
function period(p){const t=today();const d=new Date();
 if(p==='0')return [t,t,'hari ini'];if(p==='bln')return [t.slice(0,8)+'01',t,'bulan ini'];
 const k=+p||30;return [addDays(t,-(k-1)),t,k+' hari terakhir']}
function workdays(a,b){let k=0;for(let d=a;d<=b;d=addDays(d,1)){const w=new Date(d+'T00:00:00').getDay();if(w!==0)k++}return Math.max(1,k)}
function kpiAgg(p){
 const [a,b]=period(p);const E=acts().filter(e=>!e.auto&&e.day>=a&&e.day<=b);
 const U={};const get=u=>U[u]||(U[u]={u,total:0,mods:{},days:new Set(),meas:0,late:0,lateDays:0,batal:0,last:'',ev:[]});
 userIds().forEach(u=>{const r=userRole(u);if(r&&r!=='off'||E.some(e=>e.u===u))get(u)});
 E.forEach(e=>{const o=get(e.u);o.total++;o.mods[e.mod]=(o.mods[e.mod]||0)+1;o.days.add(e.day);if(e.tgl){o.meas++;if(e.late>0){o.late++;o.lateDays+=e.late}}if(/^Batalkan|^Hapus/.test(e.k))o.batal++;if(!o.last||e.at>o.last)o.last=e.at;o.ev.push(e)});
 const hasilOrang=(u,q,kg)=>{const o=get(u);o.hq=(o.hq||0)+q;o.hkg=(o.hkg||0)+kg};
 evAdmin().forEach(e=>{if(e.by&&e.tgl>=a&&e.tgl<=b)hasilOrang(e.by,e.qty,e.tonase||0)});
 evData().forEach(e=>{if((e.jenis||'hasil')==='hasil'&&e.oleh&&e.tgl>=a&&e.tgl<=b)hasilOrang(e.oleh,+e.qty||0,+e.tonase||0)});
 const lastAll={};acts().forEach(e=>{if(!lastAll[e.u])lastAll[e.u]=e.at});
 Object.values(U).forEach(o=>{o.lastAll=lastAll[o.u]||'';o.tw=o.meas?(o.meas-o.late)/o.meas:null});
 return {a,b,E,U,wd:workdays(a,b)};
}
/* ---- KINERJA TIM ---- */
T.kinerja=()=>{const f=F.kinerja;const roles=[...new Set(userIds().map(userRole).filter(r=>r&&r!=='off'))];
 return `${segBtns('kinerja','p',[['0','Hari ini'],['7','7 hari'],['30','30 hari'],['bln','Bulan ini'],['90','90 hari']])}
 <select class="sel" data-act="filtsel" data-view="kinerja" data-key="role" id="f-krole"><option value="">Semua peran</option>${Object.keys(ROLES).filter(r=>roles.includes(r)&&(r!=='sales'||f.role==='sales')).map(r=>`<option value="${r}" ${f.role===r?'selected':''}>${ROLES[r].l}</option>`).join('')}</select>
 <span class="grow"></span><button class="btn ghost" data-act="kpicsv">${ic('dl')}CSV</button>`};
B.kinerja=()=>{
 const f=F.kinerja;const K=kpiAgg(f.p);const [a,b,lbl]=period(f.p);
 let rows=Object.values(K.U).filter(o=>!f.role||userRole(o.u)===f.role);
 const sk={total:o=>o.total,days:o=>o.days.size,tw:o=>o.tw??-1,last:o=>o.last||''}[f.sort]||(o=>o.total);
 rows.sort((x,y)=>{const p=sk(y),q=sk(x);return p>q?1:p<q?-1:y.total-x.total});
 const E=K.E.filter(e=>!f.role||userRole(e.u)===f.role);
 const act=new Set(E.map(e=>e.u)).size;const meas=E.filter(e=>e.tgl).length,late=E.filter(e=>e.tgl&&e.late>0).length;
 const tw=meas?(meas-late)/meas:null;
 const kp=(cls,lb,v,unit,s,g)=>`<div class="kpi ${cls}" style="cursor:default"><span class="lb">${lb}</span><span class="v">${v}${unit?`<small>${unit}</small>`:''}</span><span class="s">${s}</span>${g!=null?`<div class="kgauge"><i style="width:${Math.max(0,Math.min(100,Math.round(g*100)))}%"></i></div>`:''}</div>`;
 let h=`<section class="kpis">
  ${kp('info','Total aktivitas',n(E.length),'entri',`${lbl} · ${n(Math.round(E.length/K.wd*10)/10)} per hari kerja`)}
  ${kp('info','Hasil produksi dilaporkan',n(rows.reduce((s,o)=>s+(o.hq||0),0)),'pcs',tonA(rows.reduce((s,o)=>s+(o.hkg||0),0))+' · '+lbl)}
  ${kp(act?'ok':'warn','Pengguna aktif',act,'/ '+rows.length,`mencatat minimal 1 transaksi ${lbl}`)}
  ${kp(tw==null?'':tw>=.9?'ok':tw>=.75?'warn':'crit','Input tepat waktu',tw==null?'–':Math.round(tw*100)+'%','',tw==null?'belum ada transaksi bertanggal':`${n(late)} dari ${n(meas)} dicatat lewat H+1`)}
  ${kp(E.filter(e=>/^Batalkan|^Hapus/.test(e.k)).length?'warn':'ok','Batal / hapus',E.filter(e=>/^Batalkan|^Hapus/.test(e.k)).length,'entri','koreksi data setelah dicatat')}
 </section>`;
 // daily bars
 let bars=[];if(f.p==='0'){const hr={};E.forEach(e=>{const x=new Date(e.at).getHours();hr[x]=(hr[x]||0)+1});for(let x=6;x<=21;x++)bars.push({label:pad(x),v:hr[x]||0,tip:`Jam ${pad(x)}.00 · ${hr[x]||0} aktivitas`})}
 else{const dd={};E.forEach(e=>dd[e.day]=(dd[e.day]||0)+1);const span=[];for(let d=a;d<=b;d=addDays(d,1))span.push(d);const step=span.length>45?7:1;
  if(step===1)bars=span.map(d=>({label:span.length>16?String(+d.slice(8)):(+d.slice(8))+'/'+(+d.slice(5,7)),v:dd[d]||0,tip:`${d.split('-').reverse().join('/')} · ${dd[d]||0} aktivitas`}));
  else for(let i=0;i<span.length;i+=7){const w=span.slice(i,i+7);const v=w.reduce((s,d)=>s+(dd[d]||0),0);bars.push({label:String(+w[0].slice(8))+'/'+String(+w[0].slice(5,7)),v,tip:`Minggu mulai ${w[0].split('-').reverse().join('/')} · ${v} aktivitas`})}}
 const modCnt={};E.forEach(e=>modCnt[e.mod]=(modCnt[e.mod]||0)+1);const mmx=Math.max(1,...Object.values(modCnt));
 const modBars=`<div class="hbars">${MODS.map(([k,l])=>`<div class="hb"><span class="nm">${l}</span><span class="track"><i style="width:${pct(modCnt[k]||0,mmx)*100}%"></i></span><span class="vv">${n(modCnt[k]||0)}</span></div>`).join('')}</div>`;
 h+=`<div class="grid3"><section class="panel"><header><h2>Aktivitas ${f.p==='0'?'per jam':'per hari'}</h2><span class="hint">${lbl}</span></header><div class="pbody">${E.length?barChart({bars,fmt:v=>n(Math.round(v)),title:'Aktivitas tim'}):empty('Belum ada aktivitas di periode ini','Setiap transaksi yang dicatat tim akan tercatat otomatis di sini.')}</div></section>
 <section class="panel"><header><h2>Per modul</h2><span class="hint">jumlah entri</span></header><div class="pbody">${modBars}</div></section></div>`;
 // leaderboard
 const th=(k,l,cls='')=>`<th class="${cls}"><button class="linkbtn" style="text-decoration:none;color:inherit;font-weight:inherit" data-act="filt" data-view="kinerja" data-key="sort" data-val="${k}">${l}${f.sort===k?' ↓':''}</button></th>`;
 const mx=Math.max(1,...rows.map(o=>o.total));
 h+=`<section class="panel"><header><h2>Kinerja per pengguna</h2><span class="hint">klik baris untuk detail aktivitas</span></header>${rows.length?`<div class="tbl-wrap"><table class="kt"><thead><tr><th>#</th><th>Pengguna</th>${th('total','Aktivitas','num')}<th class="num">Hasil produksi</th>${MODS.map(([k,l])=>`<th class="num mcol">${l}</th>`).join('')}${th('days','Hari aktif','num')}${th('tw','Tepat waktu','num')}<th class="num">Batal/hapus</th>${th('last','Terakhir aktif')}</tr></thead><tbody>
 ${rows.map((o,i)=>{const r=userRole(o.u);return `<tr class="click" data-act="kpiuser" data-uid="${esc(o.u)}"><td class="muted">${i+1}</td><td><div class="ucell">${av(o.u)}<div><b>${uName(o.u)}</b><div class="note">${esc(roleL(r==='off'?'':r))}${r==='off'?' · nonaktif':''}</div></div></div></td>
  <td class="num"><div class="tbar"><i style="width:${pct(o.total,mx)*100}%"></i></div><b>${n(o.total)}</b></td>
  <td class="num">${o.hq?`<b>${n(o.hq)}</b> pcs<div class="note">${tonA(o.hkg)}</div>`:'<span class="muted">·</span>'}</td>
  ${MODS.map(([k])=>`<td class="num mcol ${o.mods[k]?'':'muted'}">${o.mods[k]?n(o.mods[k]):'·'}</td>`).join('')}
  <td class="num">${o.days.size}<span class="muted">/${K.wd}</span></td>
  <td class="num">${o.tw==null?'<span class="muted">–</span>':chip(Math.round(o.tw*100)+'%',o.tw>=.9?'ok':o.tw>=.75?'warn':'crit')}</td>
  <td class="num ${o.batal?'':'muted'}">${o.batal||'·'}</td>
  <td class="muted">${o.lastAll?ago(o.lastAll):'belum pernah'}</td></tr>`}).join('')}</tbody></table></div>`:empty('Belum ada pengguna terdaftar','Tambahkan anggota tim lewat menu Pengguna & Akses.')}</section>`;
 h+=`<section class="panel"><header><h2>Cara membaca KPI</h2></header><div class="pbody note kpi-help">
  <p><b>Aktivitas</b> menghitung setiap transaksi yang dicatat: terima/pakai material, barang masuk/keluar, kirim & terima vendor, surat jalan, SPK terbit/revisi/progres, bongkar muat, dan perubahan master data. Antrian bongkar yang dibuat otomatis tidak dihitung.</p>
  <p><b>Tepat waktu</b> membandingkan tanggal transaksi (di form) dengan kapan data diinput. Dicatat di hari yang sama atau H+1 dianggap tepat waktu. Input yang telat bikin stok dan dashboard tidak realtime.</p>
  <p><b>Hari aktif</b> dari ${K.wd} hari kerja (Senin–Sabtu) di periode ini. <b>Batal/hapus</b> tinggi bisa berarti salah input di awal.</p>
  ${calc()._logStart?`<p>Log audit lengkap aktif sejak ${fd(calc()._logStart)}. Data sebelum itu direkonstruksi dari riwayat dokumen, jadi perubahan kecil sebelum tanggal itu bisa tidak terhitung.</p>`:''}
 </div></section>`;
 return h;
};
function kpiUser(uid){openDrawer(()=>{
 const f=F.kinerja;const K=kpiAgg(f.p);const o=K.U[uid]||{total:0,mods:{},days:new Set(),meas:0,late:0,batal:0,ev:[],tw:null};const [,,lbl]=period(f.p);
 const r=userRole(uid);const mu=byId('muser',uid)||{};const all=acts().filter(e=>e.u===uid);
 const mmx=Math.max(1,...Object.values(o.mods));
 return {t:`${av(uid,'lg')} ${uName(uid)}`,s:`${esc(roleL(r==='off'?'':r))}${mu.jabatan?' · '+esc(mu.jabatan):''} · ${lbl}`,b:`
  <div class="ustat"><div><b>${n(o.total)}</b><span>aktivitas</span></div><div><b>${o.days.size}<small>/${K.wd}</small></b><span>hari aktif</span></div><div><b>${o.tw==null?'–':Math.round(o.tw*100)+'%'}</b><span>tepat waktu</span></div><div><b>${o.batal}</b><span>batal/hapus</span></div></div>
  ${o.total?`<div class="hbars" style="margin:6px 0 14px">${MODS.filter(([k])=>o.mods[k]).map(([k,l])=>`<div class="hb"><span class="nm">${l}</span><span class="track"><i style="width:${pct(o.mods[k],mmx)*100}%"></i></span><span class="vv">${n(o.mods[k])}</span></div>`).join('')}</div>`:''}
  ${o.late?`<div class="ro" style="margin-bottom:12px">${o.late} transaksi diinput lewat H+1 (rata-rata telat ${Math.round(o.lateDays/o.late*10)/10} hari).</div>`:''}
  <h4 class="dh">Aktivitas terbaru</h4>
  ${all.length?`<div class="feed">${all.slice(0,60).map(e=>`<div class="fi"><span class="ic ${/^Batalkan|^Hapus/.test(e.k)?'crit':e.late?'warn':''}">${ic(VIEWS.find(v=>v.id===e.mod)?.ic||'db')}</span><div><div class="t">${esc(e.k)}${e.late?` <span class="chip warn">input telat ${e.late} hari</span>`:''}</div><div class="m">${esc(e.ref||MODL[e.mod]||'')}${e.tgl?' · tgl '+fd(e.tgl):''}</div></div><time>${ago(e.at)}</time></div>`).join('')}</div>${all.length>60?`<div class="note" style="padding:8px 0">+${all.length-60} aktivitas lebih lama</div>`:''}`:empty('Belum ada aktivitas','Aktivitas pengguna ini akan muncul begitu mereka mencatat transaksi.')}`}});}
/* T9: Laporan satu pintu. Semua angka dihitung dari data yang sama dengan layar lain (calc, mutasi, SPK, surat jalan), jadi selalu cocok. */
function ringkasLaporan(p){
 const [a,b]=period(p);const c=calc();const inR=d=>{d=String(d||'').slice(0,10);return d>=a&&d<=b};const R=[];
 const add=(bag,k,v,u,note,href)=>R.push({bag,k,v:Math.round(v*100)/100,u:u||'',note:note||'',href:href||''});
 // Produksi
 const ev=lapEv().filter(e=>(e.jenis||'hasil')==='hasil'&&inR(e.tgl));
 add('Produksi','Hasil produksi',ev.reduce((s,e)=>s+(+e.qty||0),0),'pcs','dilaporkan admin atau mesin','mesin');
 add('Produksi','Tonase hasil produksi',ev.reduce((s,e)=>s+(+e.tonase||0),0),'kg','berat estimasi per item','mesin');
 add('Produksi','SPK terbit',S.spk.filter(s=>s.terbitAt&&s.status!=='Batal'&&inR(s.terbitAt)).length,'SPK','','spk');
 const aktif=S.spk.filter(s=>s.status==='Terbit'&&c.spk[s._id]&&c.spk[s._id].st!=='Selesai');
 add('Produksi','SPK aktif (belum selesai)',aktif.length,'SPK','saat ini','spk');
 add('Produksi','SPK terlambat',aktif.filter(s=>c.spk[s._id].st==='Terlambat').length,'SPK','lewat due date, belum terkirim','spk');
 // Pengiriman
 const kk=S.kirim.filter(k=>k.status!=='Batal'&&inR(k.tgl));
 add('Pengiriman','Surat jalan customer',kk.length,'SJ','','pengiriman');
 add('Pengiriman','Barang terkirim',kk.reduce((s,k)=>s+(k.items||[]).reduce((x,i)=>x+(+i.q||0),0),0),'pcs','','pengiriman');
 add('Pengiriman','Tonase terkirim',kk.reduce((s,k)=>s+(k.items||[]).reduce((x,i)=>x+(+i.q||0)*wRealDok(k,i),0),0),'kg','','pengiriman');
 add('Pengiriman','Siap kirim customer (menunggu)',fgSiapKirimList().length,'SPK','saat ini','barang-jadi');
 // Bahan baku
 const kgl={};matRmSiap().forEach(r=>{kgl[r.id]=+r.kgPerLbr||0});let masuk=0,keluar=0;
 S.mutasi.forEach(m=>{if(m.gudang!=='rm'||!inR(m.tgl))return;const kg=Math.abs(+m.delta||0)*(kgl[m.item]||0);if(m.jenis==='masuk')masuk+=kg;else if(m.jenis==='keluar')keluar+=kg});
 add('Bahan baku','Plat masuk',masuk,'kg','penerimaan material','bahan-baku');
 add('Bahan baku','Plat keluar ke produksi',keluar,'kg','','bahan-baku');
 const SR=susutRows().filter(r=>r.status==='Wajar'||r.status==='Berlebih');const tk=SR.reduce((s,r)=>s+r.keluarKg,0),th=SR.reduce((s,r)=>s+r.hasilKg,0);
 add('Bahan baku','Susut (SPK selesai produksi)',tk-th,'kg',tk>0?(Math.round((tk-th)/tk*1000)/10)+'% dari plat keluar':'belum ada data','bahan-baku');
 add('Bahan baku','Susut berlebih',susutRows().filter(r=>r.status==='Berlebih').length,'kelompok','di atas batas wajar','bahan-baku');
 add('Bahan baku','PR terbuka',S.pr.filter(x=>x.gudang!=='sp'&&(x.status==='Diajukan'||x.status==='Dipesan')).length,'PR','menunggu barang','bahan-baku');
 add('Bahan baku','PR draf menunggu diajukan',S.pr.filter(x=>x.gudang!=='sp'&&x.status==='Draf').length,'PR','dibuat otomatis, diajukan oleh user','bahan-baku');
 // Barang jadi
 add('Barang jadi','Stok barang jadi',Object.values(c.stock.fg||{}).reduce((s,v)=>s+Math.max(0,v),0),'unit','saat ini','barang-jadi');
 add('Barang jadi','Siap masuk stok (SPK stok)',fgSiapMasukList().length,'SPK','saat ini','barang-jadi');
 // Vendor
 const open=c.vend.filter(x=>x.st==='Di Vendor'||x.st==='Kembali Sebagian');
 add('Vendor','SJ masih di vendor',open.length,'SJ','saat ini','vendor');
 add('Vendor','Barang belum kembali',open.reduce((s,x)=>s+x.sisa,0),'pcs','','vendor');
 add('Vendor','Lewat 14 hari',open.filter(x=>x.age>14).length,'SJ','','vendor');
 add('Vendor','Siap dikirim ke vendor',siapVendorRows().length,'item','selesai produksi, belum dikirim','vendor');
 // Sparepart
 add('Sparepart','Pemakaian sparepart',S.mutasi.filter(m=>m.gudang==='sp'&&m.jenis==='keluar'&&inR(m.tgl)).reduce((s,m)=>s+Math.abs(+m.delta||0),0),'unit','','sparepart');
 add('Sparepart','Di bawah minimum',spSug().length,'jenis','perlu dibeli','sparepart');
 // Kesehatan data
 const I=issues();
 add('Kesehatan data','Temuan kritis',I.filter(i=>i.sev>=3).length,'temuan','','cek-data');
 add('Kesehatan data','Perlu perhatian',I.filter(i=>i.sev===2).length,'temuan','','cek-data');
 add('Kesehatan data','Informasi',I.filter(i=>i.sev<2).length,'temuan','','cek-data');
 return R}
T['laporan']=()=>segBtns('laporan','p',[['0','Hari ini'],['7','7 hari'],['30','30 hari'],['bln','Bulan ini'],['90','90 hari']])+'<span class="grow"></span><button class="btn ghost" data-act="ringkascsv">'+ic('dl')+' Unduh CSV</button>';
B['laporan']=()=>{const f=F['laporan'];const [,,lbl]=period(f.p);const R=ringkasLaporan(f.p);const bags=[...new Set(R.map(r=>r.bag))];
 const nilai=r=>r.u==='kg'&&r.v>=1000?n(Math.round(r.v/10)/100)+' ton':n(r.v)+' '+esc(r.u);
 return '<div class="pbody note">Periode: <b>'+esc(lbl)+'</b>. Angka waktu (produksi, kirim, bahan baku, sparepart) mengikuti periode; angka "saat ini" selalu kondisi sekarang. Semua dihitung dari data yang sama dengan layar lain.</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px">'+bags.map(bag=>'<section class="panel" id="lap-'+esc(bag.toLowerCase().replace(/ /g,'-'))+'"><header><h2>'+esc(bag)+'</h2></header><div class="tbl-wrap"><table><tbody>'+R.filter(r=>r.bag===bag).map(r=>'<tr'+(r.href?' class="click" data-act="go" data-href="'+esc(r.href)+'"':'')+'><td>'+esc(r.k)+(r.note?'<div class="note">'+esc(r.note)+'</div>':'')+'</td><td class="num"><b>'+nilai(r)+'</b></td></tr>').join('')+'</tbody></table></div></section>').join('')+'</div>'};
async function ringkasCsv(){const f=F['laporan'];const [a,b]=period(f.p);const R=ringkasLaporan(f.p);
 await saveCsv('MNI-laporan-'+a+'_'+b+'.csv',['Bagian','Ukuran','Nilai','Satuan','Catatan','Periode'],R.map(r=>[r.bag,r.k,r.v,r.u,r.note,a+' s/d '+b]))}
/* T10: Dashboard menampilkan apa yang menunggu tindakan, satu tombol per pekerjaan, langsung ke layar atau tab yang tepat. Hanya yang boleh dilihat peran ini. */
function tindakanHariIni(){const L=[];const c=calc();
 const add=(mod,href,tab,jml,label)=>{if(jml>0&&(!ME_P||myLevel(mod)))L.push({href,tab,jml,label})};
 add('bahan-baku','bahan-baku','plate',platAntrian().length,'SPK menunggu serah plate');
 add('spk','mesin','',S.spk.filter(s=>s.status==='Terbit'&&c.spk[s._id]&&c.spk[s._id].st!=='Selesai'&&c.spk[s._id].pP<1).length,'SPK menunggu hasil produksi diisi');
 add('vendor','vendor','',siapVendorRows().length,'item siap dikirim ke vendor');
 add('pengiriman','barang-jadi','siap',fgSiapKirimList().length,'SPK siap kirim ke customer');
 add('barang-jadi','barang-jadi','masuk',fgSiapMasukList().length,'SPK stok siap masuk gudang');
 add('bahan-baku','bahan-baku','susut',susutRows().filter(r=>r.status==='Berlebih').length,'susut bahan baku berlebih');
 add('bahan-baku','bahan-baku','beli',S.pr.filter(p=>p.gudang!=='sp'&&p.status==='Draf').length,'PR bahan baku draf menunggu diajukan');
 add('sparepart','sparepart','beli',S.pr.filter(p=>p.gudang==='sp'&&p.status==='Draf').length,'PR sparepart draf menunggu diajukan');
 add('sparepart','sparepart','beli',spSug().length,'sparepart di bawah minimum');
 const kepala='<div class="sect-t">Tindakan hari ini</div>';
 if(!L.length)return kepala+'<div class="pbody note" id="tindakan">Tidak ada yang menunggu tindakan. Semua alur berjalan.</div>';
 return kepala+'<div class="pbody" id="tindakan" style="display:flex;gap:8px;flex-wrap:wrap">'+L.map(x=>'<button type="button" class="btn sm" data-act="tindak" data-href="'+x.href+'" data-view="'+x.href+'" data-tab="'+x.tab+'"><b>'+n(x.jml)+'</b> '+esc(x.label)+'</button>').join('')+'</div>'}
async function kpiCsv(){
 const f=F.kinerja;const K=kpiAgg(f.p);const [a,b]=period(f.p);
 const head=['Pengguna','Peran','Jabatan','Total aktivitas',...MODS.map(m=>m[1]),'Hari aktif','Hari kerja','Transaksi bertanggal','Input telat (>H+1)','Tepat waktu %','Batal/hapus','Terakhir aktif'];
 const ps=USER?await USER.profiles(Object.keys(K.U)):{};
 const rows=Object.values(K.U).filter(o=>!f.role||userRole(o.u)===f.role).sort((x,y)=>y.total-x.total).map(o=>{const m=byId('muser',o.u)||{};return [uname(o.u)||(ps[o.u]&&ps[o.u].name)||'Pengguna',roleL(userRole(o.u)),m.jabatan||'',o.total,...MODS.map(([k])=>o.mods[k]||0),o.days.size,K.wd,o.meas,o.late,o.tw==null?'':Math.round(o.tw*100),o.batal,o.lastAll?o.lastAll.slice(0,16).replace('T',' '):'']});
 await saveCsv(`MNI-kinerja-${a}_${b}.csv`,head,rows);
}
async function saveCsv(name,head,rows){
 const q=v=>{const s=String(v??'');return /[",;\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
 const csv='﻿'+[head,...rows].map(r=>r.map(q).join(',')).join('\r\n');
 if(!DLS){toast('Unduhan tidak tersedia di tampilan ini.');return}
 try{await DLS.save({filename:name,data:new Blob([csv],{type:'text/csv'})})}catch(e){if(e.code!=='declined')toast('Gagal mengunduh: '+(e.message||e.code))}
}
/* ---- PENGGUNA & AKSES (khusus super admin) ---- */
const LVL_OPT=[['','Tidak ada akses'],['lihat','Lihat saja'],['ubah','Lihat dan ubah']];
const modulEff=m=>m.role==='admin'?null:(m.modul&&typeof m.modul==='object'?m.modul:presetModul(m.role));
const modulChips=m=>{const o=modulEff(m);if(o===null)return '<span class="wchip">Semua modul</span>';const k=Object.keys(o);
 return k.length?k.map(x=>`<span class="wchip" style="${o[x]==='lihat'?'border-style:dashed':''}" title="${o[x]==='ubah'?'Lihat dan ubah':'Lihat saja'}">${MODL[x]||x}${o[x]==='lihat'?' (lihat)':''}</span>`).join(''):'<span class="muted">tidak ada akses</span>'};
T.pengguna=()=>canManage()?`<span class="grow"></span><button class="btn" data-act="backup">${ic('dl')}Unduh cadangan</button><button class="btn primary" data-act="uinvite">${ic('plus')}Tambah anggota tim</button>`:'';
B.pengguna=()=>{
 if(!canManage())return `<section class="panel"><div class="pbody"><div class="ro">Hanya super admin yang bisa mengatur pengguna dan akses.</div></div></section>`;
 const K=kpiAgg('30');const us=S.muser.slice().sort((x,y)=>(x.role==='admin'?0:1)-(y.role==='admin'?0:1)||String(x.nama||'').localeCompare(String(y.nama||'')));
 const aktif=us.filter(u=>u.aktif!==false).length;
 let h=`<section class="panel"><header><h2>Daftar pengguna</h2><span class="hint">${aktif} aktif dari ${us.length} · aktivitas 30 hari</span></header>${us.length?`<div class="tbl-wrap"><table><thead><tr><th>Pengguna</th><th>Peran</th><th>Akses modul</th><th class="num">Aktivitas 30 hr</th><th>Terakhir aktif</th><th>Status</th><th></th></tr></thead><tbody>
  ${us.map(u=>{const o=K.U[u.email]||{total:0};const me=String(u.email||'').toLowerCase()===String(ME||'').toLowerCase();
   return `<tr class="click" data-act="kpiuser" data-uid="${esc(u.email)}"><td><div class="ucell">${av(u.email)}<div><b>${esc(u.nama||u.email)}</b>${me?' <span class="note">(Anda)</span>':''}<div class="note">${esc(u.email||'')}${u.jabatan?' · '+esc(u.jabatan):''}</div></div></div></td><td>${esc(roleL(u.role))}</td><td><div class="wchips">${modulChips(u)}</div></td><td class="num">${n(o.total)}</td><td class="muted">${o.lastAll?ago(o.lastAll):'–'}</td><td>${u.aktif===false?chip('Nonaktif','crit'):chip('Aktif','ok')}</td><td class="act"><button class="btn sm" data-act="uedit" data-uid="${esc(u._id)}">${ic('edit2')}Atur</button> <button class="btn sm ghost" data-act="upw" data-uid="${esc(u._id)}">Password</button></td></tr>`}).join('')}</tbody></table></div>`:empty('Belum ada pengguna','Tambahkan anggota tim agar setiap transaksi tercatat atas nama mereka.')}</section>`;
 h+=`<section class="panel"><header><h2>Paket peran bawaan</h2><span class="hint">titik awal; hak tiap orang tetap bisa diatur satu per satu</span></header><div class="tbl-wrap"><table class="mx"><thead><tr><th>Peran</th>${MODS.map(([,l])=>`<th class="c">${l}</th>`).join('')}</tr></thead><tbody>
  ${Object.entries(ROLES).filter(([k])=>k!=='sales').map(([k,r])=>{const p=presetModul(k);return `<tr><td><b>${r.l}</b><div class="note">${r.d}</div></td>${MODS.map(([m])=>`<td class="c">${k==='admin'?'<span class="yes">✓</span>':p[m]==='ubah'?'<span class="yes" title="Lihat dan ubah">✓</span>':p[m]==='lihat'?'<span class="part" title="Lihat saja">lihat</span>':'<span class="sn">–</span>'}</td>`).join('')}</tr>`}).join('')}</tbody></table></div>
  <div class="pbody note">✓ = lihat dan ubah · lihat = hanya melihat · – = modul tidak tampil. Aturan dijaga di database sehingga tidak bisa diakali dari browser. Data tetap satu dan terhubung: perubahan oleh satu pengguna terlihat oleh pengguna lain yang punya akses ke modul itu.</div></section>`;
 h+=auditPanel();
 return h;
};
/* ---- Riwayat perubahan (audit database, khusus super admin) ---- */
let AUDIT=null;
async function loadAudit(){
 if(!USER||!USER.auditList){AUDIT={na:true};return}
 try{const r=await USER.auditList(200);AUDIT=r===null?{na:true}:{rows:r}}catch(e){AUDIT={err:e.message||'galat'}}
 if(VIEW==='pengguna')renderBody();
}
const AUD_AKSI={INSERT:'Tambah',UPDATE:'Ubah',DELETE:'Hapus'};
function auditRef(r){const x=r.baru||r.lama||{};const d=x.data||{};const v=x.no||x.no_sj||d.noSJ||x.nama||x.item||d.item||x.nopol||x.kode||x.email||'';return v?String(v):String(r.baris_id||'').slice(0,8)}
function auditDiff(r){
 if(r.aksi!=='UPDATE')return '';const o=r.lama||{},n=r.baru||{};const ch=[];
 for(const k of new Set([...Object.keys(o),...Object.keys(n)])){if(['updated_at','updated_by','data'].includes(k))continue;if(JSON.stringify(o[k])!==JSON.stringify(n[k]))ch.push(k)}
 const od=o.data||{},nd=n.data||{};
 for(const k of new Set([...Object.keys(od),...Object.keys(nd)])){if(['updAt','updBy'].includes(k))continue;if(JSON.stringify(od[k])!==JSON.stringify(nd[k]))ch.push(k)}
 return ch.slice(0,5).join(', ')+(ch.length>5?' …':'');
}
function auditPanel(){
 const head=`<header><h2>Riwayat perubahan</h2><span class="hint">dicatat otomatis oleh database · 200 terbaru</span><button class="btn sm ghost" data-act="auditrefresh" style="margin-left:8px">Muat ulang</button></header>`;
 if(AUDIT===null)return `<section class="panel">${head}<div class="pbody note">Memuat riwayat…</div></section>`;
 if(AUDIT.na)return `<section class="panel">${head}<div class="pbody note">Riwayat perubahan belum aktif di database ini.</div></section>`;
 if(AUDIT.err)return `<section class="panel">${head}<div class="pbody"><div class="ro">Gagal memuat riwayat: ${esc(AUDIT.err)}</div></div></section>`;
 const rows=AUDIT.rows||[];
 if(!rows.length)return `<section class="panel">${head}${empty('Belum ada riwayat','Perubahan data akan tercatat di sini.')}</section>`;
 return `<section class="panel">${head}<div class="tbl-wrap"><table><thead><tr><th>Waktu</th><th>Oleh</th><th>Data</th><th>Aksi</th><th>Referensi</th><th>Yang berubah</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="muted" title="${esc(r.at)}">${esc(String(r.at||'').slice(0,16).replace('T',' '))}</td><td>${esc(uname(r.oleh)||r.oleh||'')}</td><td>${esc(CNM[r.tabel]||r.tabel)}</td><td>${chip(AUD_AKSI[r.aksi]||r.aksi,r.aksi==='DELETE'?'crit':r.aksi==='INSERT'?'ok':'info')}</td><td>${esc(auditRef(r))}</td><td class="muted">${esc(auditDiff(r))}</td></tr>`).join('')}</tbody></table></div></section>`;
}
const genPw=()=>{const A='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';const b=crypto.getRandomValues(new Uint8Array(12));return [...b].map(x=>A[x%A.length]).join('')};
const modulGrid=cur=>`<div class="fld full"><label>Akses per modul</label><div class="tbl-wrap"><table class="mx"><tbody>${MODS.map(([m,l])=>`<tr><td>${l}</td><td><select class="sel" name="mod_${m}">${LVL_OPT.map(([v,t])=>`<option value="${v}" ${(cur[m]||'')===v?'selected':''}>${t}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div></div>`;
const modulFrom=d=>{const o={};MODS.forEach(([m])=>{const v=d['mod_'+m];if(v==='lihat'||v==='ubah')o[m]=v});return o};
const roleOpts=sel=>Object.entries(ROLES).filter(([k])=>k!=='sales'||sel===k).map(([k,x])=>`<option value="${k}" ${sel===k?'selected':''}>${x.l}</option>`).join('');
function mountRoleGrid(f){const s=()=>{const adm=f.role.value==='admin';MODS.forEach(([m])=>{f['mod_'+m].disabled=adm});const r=ROLES[f.role.value];$('#m-rdesc').textContent=r?r.l+': '+r.d:''};
 f.role.addEventListener('change',()=>{const p=presetModul(f.role.value);MODS.forEach(([m])=>{f['mod_'+m].value=p[m]||''});s()});s()}
function inviteForm(){
 if(!canManage()){toast('Hanya super admin yang bisa menambah anggota.');return}
 openModal('Tambah anggota tim',
  fld('Nama lengkap',inp('nama','','text','required placeholder="mis. Budi Santoso"'),true)+
  fld('Email (untuk login)',inp('email','','email','required placeholder="nama@perusahaan.com" autocomplete="off"'),true)+
  fld('Jabatan (opsional)',inp('jabatan','','text','placeholder="mis. Kepala Gudang"'))+
  fld('Peran (paket hak bawaan)',`<select class="sel" name="role" id="m-role">${roleOpts('gbb')}</select>`)+
  `<div class="note full" id="m-rdesc"></div>`+modulGrid(presetModul('gbb'))+
  fld('Cara memberi akses',`<select class="sel" name="cara"><option value="pw">Buat password sementara (disarankan)</option><option value="inv">Kirim undangan lewat email</option></select>`,true)+
  `<div class="note full">Dengan password sementara, Anda menerima kata sandi satu kali untuk diberikan ke orangnya. Mereka bisa langsung masuk lewat "Masuk dengan password".</div>`,
  async d=>{if(!USER||!USER.manage)throw new Error('Fitur kelola pengguna belum tersedia di mode ini.');
   const role=d.role;const password=d.cara==='pw'?genPw():'';
   await USER.manage('create',{email:String(d.email).trim(),nama:cleanName(d.nama),role,jabatan:String(d.jabatan||'').trim(),modul:role==='admin'?null:modulFrom(d),password});
   setTimeout(()=>credMsg(String(d.email).trim().toLowerCase(),cleanName(d.nama),role,password),60)},
  {submit:'Buat akun',done:' ',mount:mountRoleGrid});
}
function credMsg(email,nama,role,password){
 const msg=`Halo ${nama}, akun kamu di aplikasi Gudang & Logistik PT Mitra Nusa Internasional sudah siap (${roleL(role)}).\n\nBuka: ${location.origin}\nEmail: ${email}\n${password?`Password sementara: ${password}\n\nKlik "Masuk dengan password" lalu masukkan email dan password di atas.`:'Cek email kamu untuk undangan, lalu ikuti tautannya.'}`;
 openModal(password?'Akun siap, kirim ke orangnya':'Undangan terkirim',
  `<div class="full note">${password?'Password ini hanya ditampilkan sekali. Salin dan kirim lewat WhatsApp atau email.':'Undangan dikirim ke '+esc(email)+'.'}</div><div class="full"><textarea class="invmsg" id="m-invmsg" readonly>${esc(msg)}</textarea></div>`,
  async()=>{const t=$('#m-invmsg');let ok=false;try{await navigator.clipboard.writeText(t.value);ok=true}catch(_){}if(!ok){t.focus();t.select();try{ok=document.execCommand('copy')}catch(_){}}if(!ok)throw new Error('Browser menolak menyalin otomatis. Teks sudah diblok, tekan Ctrl+C.')},
  {submit:'Salin pesan',done:'Pesan tersalin'})}
function userForm(uid){
 if(!canManage()){toast('Hanya super admin yang bisa mengatur pengguna.');return}
 const m=S.muser.find(x=>x._id===uid);if(!m)return;const me=String(m.email||'').toLowerCase()===String(ME||'').toLowerCase();
 openModal('Atur pengguna',
  fld('Nama tampil',inp('nama',m.nama||'','text','required'),true)+
  fld('Email',`<input class="inp" value="${esc(m.email||'')}" disabled>`,true)+
  fld('Jabatan',inp('jabatan',m.jabatan||'','text','placeholder="mis. Kepala Gudang"'))+
  fld('Peran (paket hak bawaan)',`<select class="sel" name="role" id="m-role" ${me?'disabled':''}>${roleOpts(m.role)}</select>`)+
  `<div class="note full" id="m-rdesc"></div>`+modulGrid(modulEff(m)||{})+
  (me?'<div class="note full">Anda tidak bisa mengubah peran atau menonaktifkan akun sendiri.</div>':`<label class="ck full"><input type="checkbox" name="aktif" ${m.aktif===false?'':'checked'}> Aktif — bisa masuk dan memakai aplikasi</label>`)+
  `<div class="note full">Perubahan berlaku segera di database. Menu baru tampil pada orang tersebut setelah ia memuat ulang halaman.</div>`,
  async d=>{if(!String(d.nama).trim())throw new Error('Isi nama tampil.');
   const role=me?m.role:d.role;
   await DB.doc('muser/'+m._id).update({nama:cleanName(d.nama),role,jabatan:String(d.jabatan||'').trim(),aktif:me?true:!!d.aktif,modul:role==='admin'?null:modulFrom(d),updAt:new Date().toISOString(),updBy:ME})},
  {submit:'Simpan',done:'Tersimpan · akses langsung berlaku',mount:mountRoleGrid});
}
/* ---- IMPOR CSV: master dan item beserta stok awal (khusus super admin) ---- */
const IMP={
 vendor:{l:'Vendor finishing',c:'mvendor',cols:['nama','proses','pic','telp','email','alamat'],req:['nama'],ex:['PT Contoh Vendor','HDG','Budi','0812xxxx','vendor@contoh.id','Jl. Contoh No. 1']},
 customer:{l:'Customer',c:'mcustomer',cols:['nama','kota','npwp','pic','telp','email','alamat'],req:['nama'],ex:['PT Contoh Customer','Jakarta','','Sari','0812xxxx','cs@contoh.id','Jl. Contoh No. 2']},
 supplier:{l:'Supplier',c:'msupplier',cols:['nama','kota','npwp','material','pic','telp','email','alamat'],req:['nama'],ex:['PT Contoh Supplier','Cikarang','','SPHC, GI Sheet','Andi','0812xxxx','sup@contoh.id','Jl. Contoh No. 3']},
 armada:{l:'Armada',c:'marmada',cols:['nopol','jenis','driver','milik'],req:['nopol'],ex:['B 1234 XX','Truk CDD','Pak Contoh','MNI']},
 rm:{l:'Item bahan baku + stok awal',c:'rm',cols:['item','ukuran','satuan','buffer','stok_awal','tanggal_stok_awal'],req:['item','ukuran'],ex:['Plat SPHC','1.2x1200x2400','Lembar','50','120',''],num:['buffer','stok_awal']},
 fg:{l:'Item barang jadi + stok awal',c:'fg',cols:['kategori','type','ukuran','panjang','finishing','tebal','satuan','stok_awal','tanggal_stok_awal'],req:['kategori','ukuran'],ex:['Cable Tray','STU','200x100','3000','HDG','1.8','Btg','40',''],num:['stok_awal']}
};
/* CSV: pemisah koma atau titik koma (Excel Indonesia), tanda kutip ganda, baris kosong diabaikan */
function parseCsv(text){
 text=String(text||'').replace(/^﻿/,'');
 const first=text.split(/\r?\n/)[0]||'';const sep=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
 const rows=[];let row=[],cell='',q=false;
 for(let i=0;i<text.length;i++){const ch=text[i];
  if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=ch}
  else if(ch==='"')q=true;
  else if(ch===sep){row.push(cell);cell=''}
  else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);cell='';if(row.some(x=>String(x).trim()!==''))rows.push(row);row=[]}
  else cell+=ch}
 row.push(cell);if(row.some(x=>String(x).trim()!==''))rows.push(row);
 return rows}
const csvQ=v=>{v=String(v??'');return /[",;\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
function impTemplate(k){const s=IMP[k];return '﻿'+[s.cols,s.ex].map(r=>r.map(csvQ).join(',')).join('\r\n')+'\r\n'}
/* periksa isi CSV terhadap jenis data; kembalikan {ok:[doc], skip:[{n,why}], err:[{n,why}]} tanpa menulis apa pun */
function impCheck(k,text){
 const s=IMP[k];const R=parseCsv(text);const res={ok:[],skip:[],err:[],total:0};
 if(R.length<1){res.err.push({n:0,why:'Isi CSV kosong.'});return res}
 const head=R[0].map(h=>String(h).trim().toLowerCase().replace(/\s+/g,'_'));
 const miss=s.req.filter(c=>!head.includes(c));
 if(miss.length){res.err.push({n:1,why:'Kolom wajib tidak ada di baris judul: '+miss.join(', ')+'. Unduh templat untuk format yang benar.'});return res}
 const unk=head.filter(h=>h&&!s.cols.includes(h));if(unk.length)res.err.push({n:1,why:'Kolom tidak dikenal (diabaikan): '+unk.join(', ')});
 const seen=new Set();const t0=today();
 const keyOf=d=>k==='armada'?String(d.nopol).toUpperCase().replace(/\s+/g,' ').trim()
  :k==='rm'?(d.item+'|'+d.ukuran).toLowerCase().replace(/\s+/g,'')
  :k==='fg'?[d.kategori,d.type,d.ukuran,d.panjang,d.finishing,d.tebal].map(x=>String(x||'').toLowerCase().replace(/\s+/g,'')).join('|')
  :normName(d.nama);
 const existing=new Set(S[s.c].map(keyOf));
 R.slice(1).forEach((r,i)=>{const n=i+2;res.total++;const d={};head.forEach((h,j)=>{if(s.cols.includes(h))d[h]=String(r[j]??'').trim()});
  const lack=s.req.filter(c=>!d[c]);if(lack.length){res.err.push({n,why:'Kolom wajib kosong: '+lack.join(', ')});return}
  for(const c of s.num||[]){if(d[c]!==undefined&&d[c]!==''){const x=parseFloat(String(d[c]).replace(',','.'));if(isNaN(x)||x<0){res.err.push({n,why:`${c} harus angka 0 atau lebih`});return}d[c]=x}else d[c]=0}
  if(d.tanggal_stok_awal&&!/^\d{4}-\d{2}-\d{2}$/.test(d.tanggal_stok_awal)){res.err.push({n,why:'tanggal_stok_awal harus berformat TTTT-BB-HH, mis. 2026-11-03'});return}
  if(k==='armada')d.nopol=d.nopol.toUpperCase().replace(/\s+/g,' ');else if(d.nama)d.nama=cleanName(d.nama);
  const key=keyOf(d);if(existing.has(key)){res.skip.push({n,why:'sudah ada di sistem'});return}
  if(seen.has(key)){res.skip.push({n,why:'ganda di dalam berkas'});return}
  seen.add(key);
  let doc;
  if(k==='rm')doc={item:d.item,ukuran:d.ukuran,satuan:d.satuan||'Lembar',buffer:d.buffer,stokAwal:d.stok_awal,tglStokAwal:d.tanggal_stok_awal||t0};
  else if(k==='fg')doc={kategori:d.kategori,type:d.type||'',ukuran:d.ukuran,panjang:num0(d.panjang)||d.panjang||'',finishing:d.finishing||'',tebal:d.tebal||'',satuan:d.satuan||'Btg',stokAwal:d.stok_awal,tglStokAwal:d.tanggal_stok_awal||t0,ket:''};
  else{doc={};s.cols.forEach(c=>doc[c]=d[c]||'');doc.aktif=true}
  res.ok.push(doc)});
 return res}
function impPreviewHtml(k,res){
 const lines=[];
 lines.push(`<b>${res.ok.length}</b> baris siap diimpor · <b>${res.skip.length}</b> dilewati · <b style="color:${res.err.some(e=>e.n>0)?'var(--crit)':'inherit'}">${res.err.filter(e=>e.n>0).length}</b> bermasalah dari ${res.total} baris`);
 const items=[...res.err.map(e=>`<li style="color:var(--crit)">${e.n?'Baris '+e.n+': ':''}${esc(e.why)}</li>`),...res.skip.slice(0,8).map(e=>`<li class="muted">Baris ${e.n}: dilewati, ${esc(e.why)}</li>`)];
 if(res.skip.length>8)items.push(`<li class="muted">…dan ${res.skip.length-8} baris dilewati lainnya</li>`);
 return `<div>${lines.join('')}</div>${items.length?`<ul style="margin:6px 0 0 18px;padding:0;font-size:12.5px;max-height:150px;overflow:auto">${items.join('')}</ul>`:''}`}
function importForm(){
 if(!canManage()){toast('Hanya super admin yang bisa mengimpor data.');return}
 if(!DB){toast('Impor butuh backend yang tersambung.');return}
 openModal('Impor CSV',
  fld('Jenis data',`<select class="sel" name="jenis" id="m-jenis">${Object.entries(IMP).map(([k,s])=>`<option value="${k}">${s.l}</option>`).join('')}</select>`,true)+
  `<div class="full"><button type="button" class="btn sm" id="m-tpl">${ic('dl')}Unduh templat CSV</button> <span class="note">Isi templat di Excel, simpan sebagai CSV (pemisah koma atau titik koma).</span></div>`+
  fld('Pilih berkas CSV',`<input class="inp" type="file" id="m-file" accept=".csv,text/csv">`,true)+
  fld('…atau tempel isi CSV di sini',`<textarea class="inp" name="csv" id="m-csv" rows="6" style="font-family:var(--f-mono,monospace);font-size:12px" placeholder="nama,proses,pic,telp,email,alamat"></textarea>`,true)+
  `<div class="full note" id="m-prev">Pilih jenis data lalu muat berkas untuk melihat pratinjau sebelum impor. Baris yang sudah ada dilewati; tidak ada data yang ditimpa atau dihapus.</div>`,
  async d=>{const k=d.jenis;const res=impCheck(k,d.csv);
   if(res.err.some(e=>e.n===0||e.why.startsWith('Kolom wajib tidak ada')))throw new Error(res.err[0].why);
   if(res.err.some(e=>e.n>0))throw new Error('Perbaiki baris bermasalah dulu (lihat pratinjau). Tidak ada yang diimpor.');
   if(!res.ok.length)throw new Error('Tidak ada baris baru untuk diimpor.');
   const s=IMP[k];if(res.ok.length>2000)throw new Error('Maksimal 2000 baris sekali impor. Bagi berkas menjadi beberapa bagian.');
   await addMany(s.c,res.ok);
   toast(`${res.ok.length} baris ${s.l} diimpor${res.skip.length?` · ${res.skip.length} dilewati`:''}`)},
  {submit:'Impor',done:' ',mount:f=>{
   const upd=()=>{const r=impCheck(f.jenis.value,f.csv.value);$('#m-prev').innerHTML=f.csv.value.trim()?impPreviewHtml(f.jenis.value,r):'Pilih jenis data lalu muat berkas untuk melihat pratinjau sebelum impor.'};
   f.jenis.addEventListener('change',upd);f.csv.addEventListener('input',upd);
   $('#m-file').addEventListener('change',e=>{const fl=e.target.files[0];if(!fl)return;const rd=new FileReader();rd.onload=()=>{f.csv.value=String(rd.result||'');upd()};rd.readAsText(fl)});
   $('#m-tpl').addEventListener('click',async()=>{try{await DLS.save({filename:`templat-${f.jenis.value}.csv`,data:new Blob([impTemplate(f.jenis.value)],{type:'text/csv'})})}catch(e){if(e.code!=='declined')toast('Gagal mengunduh: '+(e.message||e.code))}})}});
}
async function addMany(c,list){
 guard(c,list[0],null,'add');
 const now=new Date().toISOString();
 const docs=list.map(d=>({...d,at:now,by:ME||null}));
 await DB.collection(c).addMany(docs);
 DB.collection('log').add({u:ME,at:now,c,d:'',op:'add',k:`Impor CSV: ${docs.length} baris`,mod:'*any',ref:CNM[c]||c,tgl:'',auto:true}).catch(()=>{});
}

/* ---- Akun saya: informasi, ganti password sendiri, keluar ---- */
function accountModal(){
 if(!ME_P){toast('Belum masuk.');return}
 const a=myAcc();
 const mo=ME_P.role==='admin'?null:modulEff({role:ME_P.role,modul:ME_P.modul});
 const mods=mo===null?'Semua modul':Object.entries(mo).map(([m,l])=>(MODL[m]||m)+(l==='lihat'?' (lihat)':'')).join(', ')||'Tidak ada';
 openModal('Akun saya',`<div class="full"><div class="ucell">${av(ME,'xl')}<div><b>${esc(ME_P.name||'')}</b><div class="note">${esc(ME_P.email||'')}${ME_P.jabatan?' · '+esc(ME_P.jabatan):''}</div></div></div></div>
  <div class="full note"><b>Peran:</b> ${esc(roleL(a.role))}<br><b>Akses modul:</b> ${esc(mods)}</div>
  <div class="full" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" data-act="pwself">Ganti password</button>${canManage()?'<a class="btn" href="#pengguna" data-act="closemodal">Kelola pengguna</a><button type="button" class="btn" data-act="backup">Unduh cadangan</button>':''}<button type="button" class="btn ghost danger" data-act="logout">Keluar</button></div>`,
  async()=>{},{submit:'Tutup',done:' '});
}
/* ---- Katalog berat (rumus kalkulator): disimpan terkompresi di database (master/katalog_berat), dimuat setelah login ---- */
let KB_TS=null;
async function pasangKatalogBerat(){
 const d=byId('master','katalog_berat');if(!d||!d.gz||d.ts===KB_TS||!window.MNIBerat)return;KB_TS=d.ts;
 try{const bin=Uint8Array.from(atob(d.gz),c=>c.charCodeAt(0));const txt=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text();window.MNIBerat.setKatalog(JSON.parse(txt));if(ED)edHitungUlang()}
 catch(e){KB_TS=null;console.warn('Katalog berat gagal dipasang',e)}
}
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s)};
function katalogBeratForm(){
 if(!canManage()){toast('Hanya super admin yang bisa memasang katalog berat.');return}
 const d=byId('master','katalog_berat');const inf=window.MNIBerat&&window.MNIBerat.info();
 openModal('Katalog berat (kalkulator)',`<div class="full note">${inf?`Terpasang: <b>${inf.bentuk} bentuk</b> dalam ${inf.keluarga} keluarga produk${d&&d.ts?` · diunggah ${esc(String(d.ts).slice(0,16).replace('T',' '))}${d.by?' oleh '+esc(uName(d.by)||d.by):''}`:''}.`:'Belum ada katalog. Berat SPK diisi manual sampai katalog dipasang.'}</div>
  ${fld('Berkas katalog (catalog.json dari kalkulator Excel)',`<input class="inp" type="file" id="m-kb" accept=".json,application/json">`,true)}
  <div class="full note">Katalog dibuat lokal dari workbook dengan <code>node scripts/build-weight-catalog.mjs</code> dan hanya disimpan di database (terbaca pengguna yang login), bukan di Git atau berkas situs.</div>`,
  async()=>{const fl=$('#m-kb').files[0];if(!fl)throw new Error('Pilih berkas catalog.json.');
   let cat;try{cat=JSON.parse(await fl.text())}catch(_){throw new Error('Berkas bukan JSON yang valid.')}
   if(!cat||!cat.keluarga||!Object.values(cat.keluarga).every(f=>Array.isArray(f.bentuk)&&f.bentuk.every(b=>b.id&&b.rumus&&b.masukan)))throw new Error('Format katalog tidak dikenali.');
   const gz=new Uint8Array(await new Response(new Blob([JSON.stringify(cat)]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
   const jumlah=Object.values(cat.keluarga).reduce((a,f)=>a+f.bentuk.length,0);
   await DB.doc('master/katalog_berat').set({v:cat.versi||1,ts:new Date().toISOString(),by:ME,jumlah,gz:b64(gz)});
   toast(`Katalog berat dipasang: ${jumlah} bentuk`)},{submit:'Pasang katalog',done:' '});
}
/* ---- Cadangan data (super admin): unduh semua tabel sebagai satu berkas JSON ---- */
async function backupData(){
 if(!canManage()){toast('Hanya super admin yang bisa mengunduh cadangan.');return}
 if(!USER||!USER.exportAll){toast('Cadangan hanya tersedia di backend Supabase.');return}
 toast('Menyiapkan cadangan…');
 try{
  const data=await USER.exportAll();
  const jumlah=Object.fromEntries(Object.entries(data).map(([k,v])=>[k,v.length]));
  const file={format:'mni-gudang-backup',versi:1,dibuat:new Date().toISOString(),oleh:ME,jumlah,data};
  await DLS.save({filename:`MNI-cadangan-${today()}.json`,data:new Blob([JSON.stringify(file)],{type:'application/json'})});
  await DB.doc('master/backup').set({ts:file.dibuat,by:ME,jumlah}); /* bidang 'ts': 'at' ditimpa created_at oleh adapter */
  toast('Cadangan diunduh · simpan di tempat aman, bukan di folder repo');
 }catch(e){if(e.code!=='declined')toast('Gagal membuat cadangan: '+(e.message||e.code))}
}
function pwSelf(){
 openModal('Ganti password',fld('Password baru (minimal 8 karakter)',inp('pw1','','password','required minlength="8" autocomplete="new-password"'),true)+fld('Ulangi password baru',inp('pw2','','password','required autocomplete="new-password"'),true),
  async d=>{if(String(d.pw1).length<8)throw new Error('Password minimal 8 karakter.');if(d.pw1!==d.pw2)throw new Error('Kedua password tidak sama.');
   if(!USER||!USER.changePassword)throw new Error('Fitur ganti password belum tersedia di mode ini.');await USER.changePassword(String(d.pw1))},
  {submit:'Simpan password',done:'Password diganti · pakai password baru saat masuk berikutnya'});
}
function pwForm(uid){
 if(!canManage())return;const m=S.muser.find(x=>x._id===uid);if(!m)return;const pw=genPw();
 openModal('Atur ulang password',
  fld('Pengguna',`<input class="inp" value="${esc((m.nama||'')+' · '+(m.email||''))}" disabled>`,true)+
  fld('Password baru (minimal 8 karakter)',inp('password',pw,'text','required minlength="8" autocomplete="off"'),true)+
  `<div class="note full">Password lama langsung tidak berlaku. Kirim password baru ke orangnya lewat saluran yang aman.</div>`,
  async d=>{if(!USER||!USER.manage)throw new Error('Fitur kelola pengguna belum tersedia di mode ini.');
   if(String(d.password).length<8)throw new Error('Password minimal 8 karakter.');
   await USER.manage('reset_password',{email:m.email,password:String(d.password)});
   setTimeout(()=>credMsg(String(m.email).toLowerCase(),m.nama||m.email,m.role,String(d.password)),60)},
  {submit:'Atur ulang',done:' '});
}
/* ---- shell bits ---- */
function renderMe(){
 const a=myAcc();const nm=ME?(uname(ME)||(ME_P&&ME_P.name)||'Pengguna'):'Tamu';
 const role=ME_P&&ME_P.role&&a.st==='ok'?roleL(a.role):a.st==='new'?'Belum terdaftar':a.st==='off'?'Nonaktif':CAN?'Bisa mencatat':'Lihat saja';
 const html=`${av(ME,'sm')}<span class="mi"><b>${esc(nm)}</b><small>${esc(role)}</small></span>`;
 const w=$('#who');if(w)w.innerHTML=`<button type="button" class="mebtn" data-act="mepage">${html}</button>`;
 const t=$('#mechip');if(t){t.innerHTML=html;t.title=nm+' · '+role}
 fillAvatars();
}
function renderAccess(){
/*RA*/ const ro=$('#ro');if(!ro)return;const a=myAcc();let msg='';
 if(!ME_P){ro.hidden=CAN;ro.className='ro';ro.textContent=CAN?'':'Anda punya akses lihat saja.';$('#tools').classList.remove('locked');return}
 const lvl=VIEW_MOD[VIEW]?myLevel(VIEW_MOD[VIEW]):'ubah';
 if(a.st==='new')msg='Akun Anda belum terdaftar sebagai pengguna aplikasi. Minta super admin mendaftarkan akun Anda.';
 else if(a.st==='off')msg='Akun Anda dinonaktifkan oleh super admin.';
 else if(!CAN)msg=`Akses Anda (<b>${esc(roleL(a.role))}</b>) hanya untuk melihat. Minta super admin menambah akses ubah bila perlu mencatat.`;
 else if(lvl==='lihat'){const who=Object.values(ROLES).filter(r=>r.mods.includes(VIEW_MOD[VIEW])).map(r=>r.l).join(', ');msg=`Anda hanya bisa <b>melihat</b> modul ini. Pencatatan oleh: ${esc(who)}.`}
 ro.hidden=!msg;ro.className='ro';ro.innerHTML=msg;
 $('#tools').classList.toggle('locked',!!(!CAN||lvl==='lihat'||a.st!=='ok'));
}

async function fillAvatars(){
 if(!USER)return;const els=[...document.querySelectorAll('[data-uav]')].filter(e=>e.dataset.uav&&!e.dataset.done);const ids=[...new Set(els.map(e=>e.dataset.uav))];if(!ids.length)return;
 const ps=await USER.profiles(ids);els.forEach(e=>{const p=ps[e.dataset.uav];if(!p)return;e.style.setProperty('--uc',p.color||'');if(p.avatarUrl){const i=new Image();i.alt='';i.src=p.avatarUrl;i.onload=()=>{e.textContent='';e.appendChild(i)}}e.dataset.done='1'});
}

/* ================= SPK FLOW, KPI & DOCUMENTS ================= */
const SPKT_DEF={prod:3,hdg:5,elg:3,pdc:3,lain:3,kirim:1};
const SPKT=()=>({...SPKT_DEF,...((byId('master','setting')||{}).spkT||{})});
const vKey=p=>{const P=String(p||'').toUpperCase();if(P.includes('HDG')||P.includes('HOT'))return 'hdg';if(P.includes('ELG')||P.includes('ELECTRO'))return 'elg';if(P.includes('PDC')||P.includes('POWDER'))return 'pdc';return 'lain'};
const isWd=d=>{const w=new Date(d+'T00:00:00').getDay();return w!==0&&w!==6};
function wd(a,b){if(!a||!b)return null;a=a.slice(0,10);b=b.slice(0,10);if(a===b)return 0;const s=a<b?1:-1;let k=0,d=a,g=0;while(d!==b&&g<800){d=addDays(d,s);if(isWd(d))k+=s;g++}return k}
const sumBy=(arr,f)=>arr.reduce((a,x)=>a+(+f(x)||0),0);
/* vendor return events per SJ: [{tgl,est,items:{d:ok},rej:{d:x},ket,by,at,k}] */
function vReturns(v){
 const R=(v.riwayat||[]).map((r,k)=>({tgl:r.tgl||'',at:r.at||'',by:r.by||null,ket:r.ket||'',k,est:false,items:r.items?Object.fromEntries(r.items.map(x=>[x.d,+x.ok||0])):null,rej:r.items?Object.fromEntries(r.items.map(x=>[x.d,+x.rej||0])):{} ,qty:+r.qty||0,rq:+r.rej||0}));
 const tot={},totR={};(v.items||[]).forEach(i=>{tot[i.d]=(tot[i.d]||0)+(+i.kembali||0);totR[i.d]=(totR[i.d]||0)+(+i.reject||0)});
 const known={};R.filter(r=>r.items).forEach(r=>{for(const d in r.items)known[d]=(known[d]||0)+r.items[d]});
 const noIt=R.filter(r=>!r.items);
 if(noIt.length){const rem={},remR={};for(const d in tot){rem[d]=Math.max(0,tot[d]-(known[d]||0));remR[d]=totR[d]||0}
  noIt.forEach((r,i)=>{if(i===noIt.length-1){r.items=rem;r.rej=remR}else{r.items={};r.rej={}}})}
 else{const rem={};let any=false;for(const d in tot){const x=Math.max(0,tot[d]-(known[d]||0));if(x>0){rem[d]=x;any=true}}
  if(any){const ks=S.kirim.filter(k=>k.spk===v.spk&&k.status!=='Batal'&&k.tgl>=v.tgl&&(k.items||[]).some(i=>rem[i.d])).sort((a,b)=>a.tgl.localeCompare(b.tgl));
   R.push({tgl:ks[0]?ks[0].tgl:'',est:true,items:rem,rej:totR,ket:'',by:null,at:'',k:-1})}}
 return R.sort((a,b)=>(a.tgl||'9').localeCompare(b.tgl||'9'));
}
/* first date when cumulative qty per item reaches order for every item */
function fullDate(events,need){ // events:[{tgl,map}] sorted
 const cum={};const ds=Object.keys(need).filter(d=>need[d]>0);if(!ds.length)return null;
 for(const e of events){for(const d in e.map)cum[d]=(cum[d]||0)+(+e.map[d]||0);if(ds.every(d=>(cum[d]||0)>=need[d]))return e.tgl||null}
 return null;
}
function flow(id){
 const c=calc();c._flow=c._flow||{};if(c._flow[id])return c._flow[id];
 const s=byId('spk',id);if(!s)return null;const x=c.spk[id];const T=SPKT();
 const need={};(s.items||[]).forEach(i=>need[i.d]=(need[i.d]||0)+(+i.q||0));
 const vs=S.vendor.filter(v=>v.spk===id&&v.status!=='Batal').sort((a,b)=>(a.tgl+(a.at||'')).localeCompare(b.tgl+(b.at||'')));
 const ks=S.kirim.filter(k=>k.spk===id&&k.status!=='Batal').sort((a,b)=>(a.tgl+(a.at||'')).localeCompare(b.tgl+(b.at||'')));
 const mp=its=>{const m={};(its||[]).forEach(i=>m[i.d]=(m[i.d]||0)+(+i.q||0));return m};
 // production
 let P=null,Pest='';
 const log=logProduksi(s);
 for(const e of log.filter(l=>l.sumber==='lama')){const m={};(e.items||[]).forEach(i=>m[i.d]=(m[i.d]||0)+(+i.q||0));if(Object.keys(need).every(d=>(m[d]||0)>=need[d])){P=e.tgl;break}}
 if(!P){const fm=fullDate(log.filter(l=>l.sumber==='mesin').map(l=>({tgl:l.tgl,map:Object.fromEntries((l.items||[]).map(i=>[i.d,i.q]))})),need);if(fm)P=fm}
 if(!P&&x.pP>=1){const vf=fullDate(vs.map(v=>({tgl:v.tgl,map:mp(v.items)})),need);if(vf){P=vf;Pest='dari kirim vendor'}else{const kf=fullDate(ks.map(k=>({tgl:k.tgl,map:mp(k.items)})),need);if(kf){P=kf;Pest='dari kirim customer'}else if(log.length){P=log[log.length-1].tgl;Pest='update terakhir'}}}
 // vendor
 const vend=vs.map(v=>{const R=vReturns(v);const out=sumBy(v.items||[],i=>i.q),back=sumBy(v.items||[],i=>i.kembali),rej=sumBy(v.items||[],i=>i.reject);
  const done=out>0&&back+rej>=out;const last=done?R.reduce((a,r)=>!a||(r.tgl&&r.tgl>a)?r.tgl:a,''):'';const est=R.some(r=>r.est);
  const tgt=v.target||'';const tDays=tgt?wd(v.tgl,tgt):T[vKey(v.proses)];const turn=done&&last?wd(v.tgl,last):null;const age=done?null:wd(v.tgl,today());
  return {v,R,out,back,rej,sisa:Math.max(0,out-back-rej),done,last,est,tDays,turn,ok:turn==null?null:turn<=tDays,age,late:!done&&age>tDays}});
 const V1=vs[0]?vs[0].tgl:null;
 const Vfull=fullDate(vs.map(v=>({tgl:v.tgl,map:mp(v.items)})),need);
 const retEv=[];vend.forEach(o=>o.R.forEach(r=>retEv.push({tgl:r.tgl,est:r.est,map:r.items||{}})));retEv.sort((a,b)=>(a.tgl||'9').localeCompare(b.tgl||'9'));
 const allBack=vend.length&&vend.every(o=>o.done);
 const Rfull=allBack?(fullDate(retEv.filter(e=>e.tgl),need)||vend.reduce((a,o)=>o.last>a?o.last:a,'')||null):null;const Rest=retEv.some(e=>e.est);
 // customer
 const K1=ks[0]?ks[0].tgl:null;const Kfull=fullDate(ks.map(k=>({tgl:k.tgl,map:mp(k.items)})),need);
 const recv=ks.length&&ks.every(k=>k.status==='Diterima')?ks.reduce((a,k)=>(k.tglTerima||'')>a?k.tglTerima:a,''):'';
 const ready=vs.length?(Rest?null:Rfull):(Pest?null:P);
 // metrics
 const dProd=P?Math.max(0,wd(s.tgl,P)):null;const okProd=dProd==null?null:dProd<=T.prod;
 const dWaitV=P&&V1&&!Pest?Math.max(0,wd(P,V1)):null;
 const dKirim=ready&&Kfull?Math.max(0,wd(ready,Kfull)):null;const okKirim=dKirim==null?null:dKirim<=T.kirim;
 const otd=Kfull&&s.due?Kfull<=s.due:null;const lateK=Kfull&&s.due&&Kfull>s.due?wd(s.due,Kfull):0;
 const cycle=Kfull?Math.max(0,wd(s.tgl,Kfull)):null;
 const draft=(s.status||'Terbit')==='Draft';
 const blmBalik=x.lines.some(l=>l.siapKirim!=null&&l.siapKirim<l.q);
 const stage=draft?'Draft':x.pK>=1?'Terkirim':x.pP<1?'Produksi':vend.some(o=>!o.done)?'Di vendor':blmBalik?'Siap ke vendor':x.kir>0?'Kirim sebagian':'Siap kirim';
 const r={s,x,need,vs,ks,vend,log,P,Pest,V1,Vfull,Rfull,Rest,K1,Kfull,recv,ready,dProd,okProd,dWaitV,dKirim,okKirim,otd,lateK,cycle,stage};
 c._flow[id]=r;return r;
}
const STAGE_CLS={Draft:'plain',Produksi:'info','Siap ke vendor':'warn','Di vendor':'warn','Siap kirim':'info','Kirim sebagian':'info',Terkirim:'ok'};
const okChip=(ok,yes='Tepat',no='Telat')=>ok==null?'':chip(ok?yes:no,ok?'ok':'crit');
const dTxt=v=>v==null?'–':v+' hk';

/* ---------- SPK KPI tab ---------- */
F.spk.jn=F.spk.jn||'all';F.spk.tab=F.spk.tab||'list';F.spk.skala=F.spk.skala||'minggu';F.spk.buka=F.spk.buka||{};F.spk.tutup=F.spk.tutup||{};F.spk.vw=F.spk.vw||'papan';F.spk.mg=F.spk.mg||0;F.spk.pr=F.spk.pr||'14';F.spk.pos=F.spk.pos||'';F.spk.pgd=F.spk.pgd||'ringkas';F.spk.p='90';
function spkPeriod(p){const t=today();if(p==='all')return ['0000-00-00',t,'semua SPK'];if(p==='bln')return [t.slice(0,8)+'01',t,'SPK bulan ini'];const k=+p||90;return [addDays(t,-(k-1)),t,`SPK ${k} hari terakhir`]}
const avgOf=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const r1=v=>v==null?'–':String(Math.round(v*10)/10).replace('.',',');
const pctTxt=(a,b)=>b?Math.round(a/b*100)+'%':'–';
function spkKpi(p){
 const [a,b,lbl]=spkPeriod(p);const T=SPKT();
 const Fl=S.spk.filter(s=>(s.status||'Terbit')!=='Draft'&&s.tgl>=a&&s.tgl<=b).map(s=>flow(s._id)).filter(Boolean);
 const prod=Fl.filter(f=>f.dProd!=null),prodOk=prod.filter(f=>f.okProd);
 const prodOpen=Fl.filter(f=>f.x.pP<1).map(f=>({f,age:Math.max(0,wd(f.s.tgl,today()))})).sort((x,y)=>y.age-x.age);
 const VL=Fl.flatMap(f=>f.vend);const vDone=VL.filter(o=>o.turn!=null);
 const byV={};VL.forEach(o=>{const k=o.v.vendor||'(tanpa nama)';const z=byV[k]||(byV[k]={k,sj:0,out:0,back:0,rej:0,turns:[],ok:0,meas:0,est:0,open:0,oldest:0,late:0,proses:new Set()});z.sj++;z.out+=o.out;z.back+=o.back;z.rej+=o.rej;z.proses.add(o.v.proses||'-');if(o.turn!=null){z.turns.push(o.turn);z.meas++;if(o.ok)z.ok++;if(o.est)z.est++}if(!o.done){z.open++;z.oldest=Math.max(z.oldest,o.age||0);if(o.late)z.late++}});
 const waits=Fl.filter(f=>f.dWaitV!=null);
 const kir=Fl.filter(f=>f.Kfull);const otd=kir.filter(f=>f.otd);const kSpeed=Fl.filter(f=>f.dKirim!=null);
 const lateOpen=Fl.filter(f=>!f.Kfull&&f.x.st!=='Selesai'&&f.x.st!=='Batal'&&f.s.due&&f.s.due<today());
 const sjs=Fl.flatMap(f=>f.ks);const transit=sjs.filter(k=>k.tglTerima&&k.tgl).map(k=>wd(k.tgl,k.tglTerima));
 return {a,b,lbl,T,Fl,prod,prodOk,prodOpen,VL,vDone,byV:Object.values(byV).sort((x,y)=>y.out-x.out),waits,kir,otd,kSpeed,lateOpen,sjs,transit,
  avgProd:avgOf(prod.map(f=>f.dProd)),avgTurn:avgOf(vDone.map(o=>o.turn)),avgWait:avgOf(waits.map(f=>f.dWaitV)),avgKirim:avgOf(kSpeed.map(f=>f.dKirim)),avgCycle:avgOf(kir.map(f=>f.cycle)),avgLate:avgOf(kir.filter(f=>!f.otd).map(f=>f.lateK)),avgTransit:avgOf(transit)};
}
function spkKpiBody(){
 const K=spkKpi(F.spk.p);const T=K.T;
 const kp=(cls,lb,v,unit,s,g)=>`<div class="kpi ${cls}" style="cursor:default"><span class="lb">${lb}</span><span class="v">${v}${unit?`<small>${unit}</small>`:''}</span><span class="s">${s}</span>${g!=null?`<div class="kgauge"><i style="width:${Math.max(0,Math.min(100,Math.round(g*100)))}%"></i></div>`:''}</div>`;
 const cls=(a,b,g=.9,w=.75)=>!b?'':a/b>=g?'ok':a/b>=w?'warn':'crit';
 const vOk=K.vDone.filter(o=>o.ok).length;
 let h=`<div class="spk-kpi"><section class="kpis">
  ${kp(cls(K.otd.length,K.kir.length),'Kirim tepat waktu (OTD)',pctTxt(K.otd.length,K.kir.length),'',`${K.otd.length} dari ${K.kir.length} SPK terkirim penuh ≤ due date`,K.kir.length?K.otd.length/K.kir.length:null)}
  ${kp(cls(K.prodOk.length,K.prod.length),'Produksi tepat target',pctTxt(K.prodOk.length,K.prod.length),'',`rata-rata ${r1(K.avgProd)} hari kerja · target ${T.prod} hk`,K.prod.length?K.prodOk.length/K.prod.length:null)}
  ${kp(cls(vOk,K.vDone.length),'Vendor tepat target',pctTxt(vOk,K.vDone.length),'',`rata-rata ${r1(K.avgTurn)} hk di vendor · ${K.vDone.length} SJ kembali penuh`,K.vDone.length?vOk/K.vDone.length:null)}
  ${kp(K.avgKirim==null?'':K.avgKirim<=T.kirim?'ok':'warn','Siap → kirim customer',r1(K.avgKirim),'hk',`target ${T.kirim} hk setelah barang siap`)}
  ${kp('info','Siklus SPK → terkirim',r1(K.avgCycle),'hk',`dari tanggal SPK sampai surat jalan terakhir`)}
  ${kp(K.lateOpen.length?'crit':'ok','Lewat due, belum terkirim',K.lateOpen.length,'SPK',K.lateOpen.length?`tertua ${Math.max(...K.lateOpen.map(f=>wd(f.s.due,today())))} hk lewat`:'tidak ada')}
 </section>`;
 // flow funnel
 const st={};K.Fl.forEach(f=>st[f.stage]=(st[f.stage]||0)+1);
 h+=`<section class="panel"><header><h2>Posisi SPK saat ini</h2><span class="hint">${esc(K.lbl)} · ${K.Fl.length} SPK</span></header><div class="pbody flowbar">${['Produksi','Siap ke vendor','Di vendor','Siap kirim','Kirim sebagian','Terkirim'].map(k=>`<button class="fstep ${STAGE_CLS[k]}" data-act="spkstage" data-st="${k}"><b>${st[k]||0}</b><span>${k}</span></button>`).join('<i>›</i>')}</div></section>`;
 // 1 production
 const prodRows=K.prodOpen.slice(0,8).map(o=>`<tr class="click" data-act="openspk" data-id="${o.f.s._id}"><td class="mono"><b>${o.f.s.no}</b></td><td>${esc(o.f.s.customer)}</td><td>${prog(o.f.x.pP)}</td><td class="num ${o.age>T.prod?'bad':''}">${o.age} hk</td><td>${fd(o.f.s.due)}</td></tr>`).join('');
 const slowProd=K.prod.filter(f=>!f.okProd).sort((a,b)=>b.dProd-a.dProd).slice(0,6).map(f=>`<tr class="click" data-act="openspk" data-id="${f.s._id}"><td class="mono"><b>${f.s.no}</b></td><td>${esc(f.s.customer)}</td><td>${fd(f.s.tgl)} → ${fd(f.P)}${f.Pest?` <span class="note">(est.)</span>`:''}</td><td class="num bad">${f.dProd} hk</td><td class="muted">${esc(f.s.alasan||'')}</td></tr>`).join('');
 h+=`<section class="panel"><header><h2><span class="sn">1</span>Kecepatan & ketepatan produksi</h2><span class="hint">target ${T.prod} hari kerja dari tanggal SPK</span></header>
  <div class="ana"><div class="ana-c"><h3>Masih di produksi</h3>${prodRows?`<div class="tbl-wrap"><table><thead><tr><th>SPK</th><th>Customer</th><th>Progres</th><th class="num">Umur</th><th>Due</th></tr></thead><tbody>${prodRows}</tbody></table></div>`:'<p class="note">Semua SPK di periode ini sudah selesai produksi.</p>'}</div>
  <div class="ana-c"><h3>Produksi melewati target</h3>${slowProd?`<div class="tbl-wrap"><table><thead><tr><th>SPK</th><th>Customer</th><th>Mulai → selesai</th><th class="num">Durasi</th><th>Kendala</th></tr></thead><tbody>${slowProd}</tbody></table></div>`:'<p class="note">Tidak ada.</p>'}</div></div>
  <div class="pbody note">${K.prod.filter(f=>f.Pest).length} dari ${K.prod.length} tanggal selesai produksi masih <b>estimasi</b> (diambil dari tanggal kirim ke vendor/customer) karena belum diisi lewat Update progres produksi. Mulai sekarang setiap update menyimpan tanggalnya.</div></section>`;
 // 2 vendor
 const vRows=K.byV.map(z=>{const av=avgOf(z.turns);return `<tr class="click" data-act="kpivendor" data-v="${esc(z.k)}"><td><b>${esc(z.k)}</b><div class="note">${esc([...z.proses].join(', '))}</div></td><td class="num">${z.sj}</td><td class="num">${n(z.out)}</td><td class="num">${n(z.back)}</td><td class="num ${z.rej?'bad':''}">${z.rej?n(z.rej)+' <span class="note">('+pctTxt(z.rej,z.out)+')</span>':'0'}</td><td class="num"><b>${r1(av)}</b> hk${z.est?` <span class="note" title="${z.est} SJ tanggal kembali diestimasi">*</span>`:''}</td><td class="num">${z.meas?chip(pctTxt(z.ok,z.meas),z.ok/z.meas>=.9?'ok':z.ok/z.meas>=.75?'warn':'crit'):'–'}</td><td class="num ${z.late?'bad':''}">${z.open?`${z.open} SJ · ${z.oldest} hk`:'–'}</td></tr>`}).join('');
 h+=`<section class="panel"><header><h2><span class="sn">2</span>Kirim ke finishing & kepulangan dari vendor</h2><span class="hint">target: HDG ${T.hdg} · ELG ${T.elg} · PDC ${T.pdc} · lain ${T.lain} hari kerja</span></header>
  <div class="kpis inner">${kp('',`Produksi selesai → kirim vendor`,r1(K.avgWait),'hk',`${K.waits.length} SPK dengan tanggal produksi tercatat`)}${kp('','Lama di vendor',r1(K.avgTurn),'hk',`${K.vDone.length} SJ kembali penuh`)}${kp(K.VL.some(o=>o.late)?'crit':'ok','Melewati target, belum kembali',K.VL.filter(o=>o.late).length,'SJ',`${K.VL.filter(o=>!o.done).length} SJ masih di vendor`)}</div>
  ${vRows?`<div class="tbl-wrap"><table><thead><tr><th>Vendor</th><th class="num">SJ</th><th class="num">Qty kirim</th><th class="num">Kembali OK</th><th class="num">Reject</th><th class="num">Rata-rata di vendor</th><th class="num">Tepat target</th><th class="num">Masih di vendor</th></tr></thead><tbody>${vRows}</tbody></table></div>`:empty('Belum ada kiriman vendor','Kiriman ke vendor finishing di periode ini akan muncul di sini.')}
  <div class="pbody note">* Sebagian tanggal kembali dari data lama tidak tercatat, jadi diestimasi = tanggal kirim customer pertama setelahnya. Penerimaan baru lewat tombol Terima kembali selalu tercatat tanggal & qty per item.</div></section>`;
 // 3 logistics
 const lateRows=K.kir.filter(f=>!f.otd).sort((a,b)=>b.lateK-a.lateK).slice(0,8).map(f=>`<tr class="click" data-act="openspk" data-id="${f.s._id}"><td class="mono"><b>${f.s.no}</b></td><td>${esc(f.s.customer)}</td><td>${fd(f.s.due)}</td><td>${fd(f.Kfull)}</td><td class="num bad">+${f.lateK} hk</td><td class="num">${f.dKirim==null?'–':f.dKirim+' hk'}</td></tr>`).join('');
 const openRows=K.lateOpen.sort((a,b)=>a.s.due.localeCompare(b.s.due)).slice(0,8).map(f=>`<tr class="click" data-act="openspk" data-id="${f.s._id}"><td class="mono"><b>${f.s.no}</b></td><td>${esc(f.s.customer)}</td><td>${fd(f.s.due)}</td><td>${chip(f.stage,STAGE_CLS[f.stage])}</td><td class="num bad">+${wd(f.s.due,today())} hk</td></tr>`).join('');
 h+=`<section class="panel"><header><h2><span class="sn">3</span>Kecepatan & ketepatan kirim ke customer</h2><span class="hint">tepat waktu = surat jalan terakhir ≤ due date SPK</span></header>
  <div class="kpis inner">${kp(cls(K.otd.length,K.kir.length),'On-time delivery',pctTxt(K.otd.length,K.kir.length),'',`rata-rata telat ${r1(K.avgLate)} hk bila telat`)}${kp('','Barang siap → surat jalan',r1(K.avgKirim),'hk',`${K.kSpeed.length} SPK terukur · target ${T.kirim} hk`)}${kp('','Surat jalan → diterima',r1(K.avgTransit),'hk',`${K.transit.length} dari ${K.sjs.length} SJ ada tanggal terima`)}</div>
  <div class="ana"><div class="ana-c"><h3>Terkirim tapi telat</h3>${lateRows?`<div class="tbl-wrap"><table><thead><tr><th>SPK</th><th>Customer</th><th>Due</th><th>Kirim penuh</th><th class="num">Telat</th><th class="num">Siap→kirim</th></tr></thead><tbody>${lateRows}</tbody></table></div>`:'<p class="note">Tidak ada.</p>'}</div>
  <div class="ana-c"><h3>Lewat due, belum terkirim penuh</h3>${openRows?`<div class="tbl-wrap"><table><thead><tr><th>SPK</th><th>Customer</th><th>Due</th><th>Posisi</th><th class="num">Lewat</th></tr></thead><tbody>${openRows}</tbody></table></div>`:'<p class="note">Tidak ada.</p>'}</div></div></section>`;
 return h+'</div>';
}
function kpiVendor(name){openDrawer(()=>{const K=spkKpi(F.spk.p);const L=K.VL.filter(o=>(o.v.vendor||'(tanpa nama)')===name).sort((a,b)=>b.v.tgl.localeCompare(a.v.tgl));
 return {t:esc(name),s:`Kiriman finishing · ${esc(K.lbl)}`,b:`<div class="tbl-wrap"><table><thead><tr><th>SJ</th><th>SPK</th><th>Kirim</th><th>Kembali</th><th class="num">Durasi</th><th>Target</th><th></th></tr></thead><tbody>${L.map(o=>`<tr class="click" data-act="openvendor" data-id="${o.v._id}"><td class="mono">${esc(o.v.noSJ||'')}<div class="note">${esc(o.v.proses||'')}</div></td><td>${esc(spkName(o.v.spk))}</td><td>${fd(o.v.tgl)}</td><td>${o.done?fd(o.last)+(o.est?' <span class="note">est.</span>':''):`<span class="note">sisa ${n(o.sisa)}</span>`}</td><td class="num">${o.turn!=null?o.turn+' hk':o.age+' hk'+(o.done?'':' …')}</td><td>${o.tDays} hk</td><td>${o.done?okChip(o.ok):o.late?chip('Lewat target','crit'):chip('Di vendor','warn')}</td></tr>`).join('')}</tbody></table></div>`}})}
function spkTargetForm(){const T=SPKT();
 const r=(nm,judul,ket)=>`<label class="tgt-r" for="m-${nm}"><span><b>${judul}</b><small>${ket}</small></span><span class="tgt-in">${inp(nm,T[nm],'number','min="0" inputmode="numeric"')}<em>hari kerja</em></span></label>`;
 openModal('Target waktu proses',`<div class="full tgt">
  <div class="tgt-sec"><h4>Produksi dan pengiriman</h4>${r('prod','Produksi','Batas waktu dari tanggal SPK sampai produksi selesai')}${r('kirim','Siap sampai surat jalan','Batas waktu dari barang siap sampai surat jalan customer dibuat')}</div>
  <div class="tgt-sec"><h4>Lama di vendor finishing</h4>${r('hdg','HDG (galvanis celup panas)','Dari dikirim ke vendor sampai kembali')}${r('elg','ELG (electro galvanizing)','Dari dikirim ke vendor sampai kembali')}${r('pdc','Powder coating','Dari dikirim ke vendor sampai kembali')}${r('lain','Proses lain','Dipakai untuk vendor di luar tiga jenis di atas')}</div>
  <div class="tgt-help"><span><b>Catatan.</b> Hari kerja dihitung Senin sampai Jumat. Bila form Kirim ke vendor mengisi Target kembali, tanggal itu yang dipakai untuk surat jalan tersebut. Ketepatan kirim ke customer selalu dibandingkan dengan due date SPK.</span></div></div>`,
  async d=>{const spkT={};for(const k in SPKT_DEF)spkT[k]=Math.max(0,num0(d[k]));need('master',{},'setting');const cur={...(byId('master','setting')||{})};delete cur._id;await DB.doc('master/setting').set({...cur,spkT});})}

/* ---------- drawer timeline ---------- */
function spkFlowHtml(id){
 const f=flow(id);if(!f)return '';const s=f.s,T=SPKT();
 const dl2=(kind,ref)=>`<span class="docb"><button class="btn sm ghost" data-act="doc" data-kind="${kind}" data-ref="${esc(ref)}" data-fmt="xlsx" title="Unduh Excel">${ic('dl')}Excel</button><button class="btn sm ghost" data-act="doc" data-kind="${kind}" data-ref="${esc(ref)}" data-fmt="pdf" title="Unduh PDF">${ic('file')}PDF</button></span>`;
 const step=(st,title,meta,docs,extra='')=>`<div class="tl ${st}"><span class="dot"></span><div class="tlb"><div class="tlt">${title}</div><div class="tlm">${meta}</div>${extra}${docs?`<div class="tld">${docs}</div>`:''}</div></div>`;
 let h='';
 h+=step(s.terbitAt||s.status!=='Draft'?'done':'now',`SPK ${(s.status||'Terbit')==='Draft'?'draft':'terbit'} <span class="note">${fd(s.tgl)}</span>`,`Due ${fd(s.due)} · ${esc(s.lead||'')}`,`<span class="docn">Surat Perintah Kerja</span>`+dl2('spk',id));
 const pSt=f.x.pP>=1?'done':f.x.pP>0?'now':'todo';
 h+=step(pSt,`Produksi ${f.x.pP>=1?'selesai':Math.round(f.x.pP*100)+'%'} ${f.P?`<span class="note">${fd(f.P)}${f.Pest?' · est. '+f.Pest:''}</span>`:f.x.pP>=1?'<span class="note">tanggal tidak tercatat</span>':''}`,f.P?`${f.dProd} hari kerja · target ${T.prod} ${okChip(f.okProd)}`:f.x.pP>=1?'update berikutnya akan menyimpan tanggal':`berjalan ${Math.max(0,wd(s.tgl,today()))} hari kerja · target ${T.prod}`,`<span class="docn">Laporan Progres Produksi · ${f.log.length} update</span>`+dl2('lpp',id));
 if(f.vend.length)f.vend.forEach(o=>{
  h+=step(o.done?'done':'now',`Kirim ke ${esc(o.v.vendor||'vendor')} <span class="note">${fd(o.v.tgl)} · ${esc(o.v.proses||'')}</span>`,`${n(o.out)} pcs · ${esc(o.v.noSJ||'')}${f.dWaitV!=null&&o===f.vend[0]?` · ${f.dWaitV} hk setelah produksi selesai`:''}`,`<span class="docn">Surat Jalan Vendor</span>`+dl2('sjv',o.v._id));
  o.R.forEach(r=>h+=step('done',`Kembali dari ${esc(o.v.vendor||'vendor')} <span class="note">${r.tgl?fd(r.tgl):'tgl tidak tercatat'}${r.est?' · est.':''}</span>`,`${n(sumBy(Object.values(r.items||{}),q=>q))} OK${sumBy(Object.values(r.rej||{}),q=>q)?` · <b style="color:var(--crit)">${n(sumBy(Object.values(r.rej||{}),q=>q))} reject</b>`:''}${r.ket?' · '+esc(r.ket):''}`,`<span class="docn">Bukti Terima Barang</span>`+dl2('btb',o.v._id+'|'+r.k)));
  if(!o.done)h+=step(o.late?'late':'now',`Menunggu kembali dari ${esc(o.v.vendor||'vendor')}`,`sisa ${n(o.sisa)} · ${o.age} hk di vendor · target ${o.tDays} hk ${o.late?chip('Lewat target','crit'):''}`,'');
  else h=h.replace(/<\/div><\/div>$/,`<div class="tlm">Durasi di vendor <b>${o.turn==null?'–':o.turn+' hk'}</b> · target ${o.tDays} hk ${okChip(o.ok)}</div></div></div>`);
 });
 else h+=step(f.x.pP>=1?'skip':'todo','Kirim ke vendor finishing','belum ada pengiriman ke vendor','');
 if(s.stokReq){const g={};S.mutasi.filter(m=>m.gudang==='fg'&&m.jenis==='masuk'&&m.spk===id).forEach(m=>{const k=m.noDok||m._id;(g[k]=g[k]||[]).push(m)});const es=Object.entries(g);
  if(es.length)es.forEach(([no,a])=>h+=step('done',`Masuk gudang barang jadi <span class="note">${fd(a[0].tgl)}</span>`,`${esc(no)} · ${n(sumBy(a,m=>+m.delta||0))} pcs${a[0].pihak?' · dari '+esc(a[0].pihak):''}`,''));
  else h+=step('todo','Masuk gudang barang jadi','belum ada barang masuk','')}
 else if(f.ks.length)f.ks.forEach(k=>h+=step(k.status==='Diterima'?'done':'now',`Surat jalan ke customer <span class="note">${fd(k.tgl)}</span>`,`${esc(k.noSJ||'')} · ${n(sumBy(k.items||[],i=>i.q))} pcs · ${esc(k.status)}${k.tglTerima?' '+fd(k.tglTerima):''}${k.nopol?' · '+esc(k.nopol):''}`,`<span class="docn">Surat Jalan</span>`+dl2('sjc',k._id)));
 else h+=step('todo','Kirim ke customer','belum ada surat jalan','');
 h+=step(f.Kfull?(f.otd?'done':'late'):s.due&&s.due<today()?'late':'todo',f.Kfull?`Terkirim penuh <span class="note">${fd(f.Kfull)}</span>`:'Belum terkirim penuh',f.Kfull?`due ${fd(s.due)} ${okChip(f.otd,'Tepat waktu','Telat '+f.lateK+' hk')} · siklus ${f.cycle} hk${f.dKirim!=null?` · siap→kirim ${f.dKirim} hk ${okChip(f.okKirim)}`:''}`:`due ${fd(s.due)}${s.due&&s.due<today()?` · <b style="color:var(--crit)">lewat ${wd(s.due,today())} hk</b>`:''}`,'');
 return `<div class="tlw">${h}</div>`;
}

/* ---------- document engine (Excel + PDF from one model) ---------- */

/* ---------- KOP dokumen (Master Data > Kop dokumen) dan tema per jenis dokumen ---------- */
const KOP_DEF={nama:'PT. MITRA NUSA INTERNASIONAL',a1:'Ruko Gravitas B2 No.1, Lavon, Wana Kerta',a2:'Kec. Sindang Jaya, Kab. Tangerang',kontak:'',warna:'#1F3A6E'};
const hexRgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(String(h||''));const v=m?m[1]:'1F3A6E';return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16))};
const rgbHex=a=>a.map(x=>Math.max(0,Math.min(255,x)).toString(16).padStart(2,'0')).join('').toUpperCase();
const tint=(rgb,a)=>rgb.map(x=>Math.round(255-(255-x)*a));
const tintA=(rgb,a)=>'FF'+rgbHex(tint(rgb,a));
function KOP(){const k=(byId('master','setting')||{}).kop||{};const o={...KOP_DEF};
 if(typeof k.nama==='string'&&k.nama.trim())o.nama=k.nama.trim();['a1','a2','kontak'].forEach(x=>{if(typeof k[x]==='string')o[x]=k[x].trim()});
 if(/^#[0-9a-f]{6}$/i.test(k.warna||''))o.warna=k.warna.toUpperCase();
 const lg=typeof k.logo==='string'&&/^data:image\/(png|jpeg);base64,/.test(k.logo)?k.logo:'';
 o.custom=!!lg;o.logo=lg||LOGO;o.logoRatio=lg&&k.logoW>0&&k.logoH>0?k.logoW/k.logoH:600/156;return o}
const DK_CSS=".dk-head{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:10px;border-bottom:2px solid var(--br);position:relative;margin-bottom:14px}\n.dk-head:after{content:\"\";position:absolute;left:0;bottom:-2px;width:84px;height:4px;background:var(--dc)}\n.dk-logo{height:38px;max-width:180px;object-fit:contain}\n.dk-co{text-align:right;font-size:10.5px;color:var(--muted,#6b7280);line-height:1.45}.dk-co b{display:block;font-size:14px;color:color-mix(in srgb,var(--br) 75%,var(--text,#111));letter-spacing:.01em}.dk-co span{display:block}\n.dk-title{display:flex;align-items:center;gap:12px;margin-bottom:14px}\n.dk-badge{background:var(--dc);color:#fff;font-weight:800;border-radius:9px;min-width:46px;height:46px;display:grid;place-items:center;font-size:15px;letter-spacing:.02em;padding:0 4px}\n.dk-tt{flex:1;min-width:0}.dk-t{font-size:20px;font-weight:800;color:color-mix(in srgb,var(--dc) 75%,var(--text,#111));line-height:1.15}.dk-s{font-size:11px;color:var(--muted,#6b7280);margin-top:2px}\n.dk-no{border:1px solid color-mix(in srgb,var(--dc) 35%,transparent);background:color-mix(in srgb,var(--dc) 8%,transparent);border-radius:8px;padding:7px 12px;text-align:right;min-width:170px}\n.dk-no small{display:block;font-size:8.5px;letter-spacing:.08em;color:var(--muted,#6b7280)}.dk-no b{display:block;font-size:12px;margin-bottom:3px}";
try{document.head.insertAdjacentHTML('beforeend','<style id="dk-css">'+DK_CSS+'</style>')}catch(e){}
const kopFmt=k=>k.logo.indexOf('image/jpeg')>0?'JPEG':'PNG';
/* Tiap jenis dokumen punya kode dan warna sendiri; kop (logo, nama, alamat, warna garis) sama untuk semua dan diatur di Master Data. */
const DOCT={sjc:{k:'SJ',c:'1F3A6E',sub:'Delivery Order'},sjv:{k:'SJV',c:'C2410C',sub:'Subcontract Delivery Note'},btb:{k:'BTB',c:'0F766E',sub:'Goods Receipt Note'},lpp:{k:'LPP',c:'15803D',sub:'Production Progress Report'},kpi:{k:'KPI',c:'6D28D9',sub:'Operations KPI Report'},cek:{k:'CL',c:'B45309',sub:'Loading Checklist'},mvmasuk:{k:'IN',c:'047857',sub:'Goods Receipt'},mvkeluar:{k:'OUT',c:'B91C1C',sub:'Goods Issue'},mvopname:{k:'OPN',c:'4338CA',sub:'Stock Opname'},mvkoreksi:{k:'KOR',c:'A16207',sub:'Stock Correction'},pr:{k:'PR',c:'0369A1',sub:'Purchase Request'},ks:{k:'KS',c:'334155',sub:'Stock Card'}};
function docTh(kind){const t=DOCT[kind]||{k:'DOK',c:rgbHex(hexRgb(KOP().warna)),sub:'Document'};return {...t,rgb:hexRgb(t.c),argb:'FF'+t.c}}
const dkStyle=kind=>'--dc:#'+docTh(kind).c+';--br:'+KOP().warna;
function docHeadHtml(kind,m,kop){const k=kop||KOP(),th=docTh(kind);
 return `<div class="dk-head"><img class="dk-logo" src="${esc(k.logo)}" alt=""><div class="dk-co"><b>${esc(k.nama)}</b>${[k.a1,k.a2,k.kontak].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
 <div class="dk-title"><span class="dk-badge">${th.k}</span><div class="dk-tt"><div class="dk-t">${esc(m.title)}</div><div class="dk-s">${esc(th.sub)}</div></div><div class="dk-no"><small>NOMOR DOKUMEN</small><b>${esc(m.no||'-')}</b><small>TANGGAL</small><b>${m.date?tglLong(m.date):'-'}</b></div></div>`}
/* ---- helper PDF bersama ---- */
function pdfKop(doc,th){const PW=doc.internal.pageSize.getWidth(),M=14,k=KOP(),br=hexRgb(k.warna);
 let lw=Math.min(48,13*k.logoRatio),lh=lw/k.logoRatio;doc.addImage(k.logo,kopFmt(k),M,9+(13-lh)/2,lw,lh);
 doc.setTextColor(...br);doc.setFont('helvetica','bold');doc.setFontSize(12.5);doc.text(sjFx(k.nama),PW-M,12.5,{align:'right'});
 doc.setFont('helvetica','normal');doc.setFontSize(7.8);doc.setTextColor(110);
 const ls=[k.a1,k.a2,k.kontak].filter(Boolean);ls.forEach((s,i)=>doc.text(sjFx(s),PW-M,16.8+i*3.6,{align:'right'}));
 const ly=Math.max(24.5,16.8+(ls.length-1)*3.6+3.4);
 doc.setDrawColor(...br);doc.setLineWidth(.5);doc.line(M,ly,PW-M,ly);doc.setFillColor(...th.rgb);doc.rect(M,ly-.5,30,1.5,'F');return ly}
function pdfTitle(doc,m,th,ly){const PW=doc.internal.pageSize.getWidth(),M=14,bw=78,bx=PW-M-bw,title=sjFx(m.title);
 doc.setFillColor(...th.rgb);doc.roundedRect(M,ly+6,15,15,2,2,'F');doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(th.k.length>2?9.5:12);doc.text(th.k,M+7.5,ly+15.3,{align:'center'});
 let fs=title.length>30?15:19;doc.setFont('helvetica','bold');doc.setFontSize(fs);const av=bx-(M+19)-4;while(fs>9&&doc.getTextWidth(title)>av){fs-=.5;doc.setFontSize(fs)}
 doc.setTextColor(...th.rgb);doc.text(title,M+19,ly+13.6);doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(120);doc.text(th.sub,M+19,ly+19.2);
 doc.setFillColor(...tint(th.rgb,.08));doc.setDrawColor(...tint(th.rgb,.4));doc.setLineWidth(.25);doc.roundedRect(bx,ly+5,bw,17,1.8,1.8,'FD');
 doc.setFont('helvetica','normal');doc.setFontSize(6.6);doc.setTextColor(115);doc.text('NOMOR DOKUMEN',bx+3.5,ly+9.6);doc.text('TANGGAL',bx+bw-3.5,ly+9.6,{align:'right'});
 const dt=m.date?tglLong(m.date):'-';doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(20);const dw=doc.getTextWidth(dt);doc.text(dt,bx+bw-3.5,ly+17.4,{align:'right'});
 let nf=9.5;const no=sjFx(m.no||'-'),nav=bw-7-dw-4;doc.setFontSize(nf);while(nf>6.5&&doc.getTextWidth(no)>nav){nf-=.5;doc.setFontSize(nf)}doc.text(no,bx+3.5,ly+17.4);
 return ly+28}
function pdfMeta(doc,rows,th,y){const PW=doc.internal.pageSize.getWidth(),M=14,W=PW-2*M,cols=PW>250?4:2,cw=W/cols;if(!rows||!rows.length)return y;
 const lines=[];for(let i=0;i<rows.length;i+=cols)lines.push(rows.slice(i,i+cols));
 doc.setFont('helvetica','bold');doc.setFontSize(9.2);
 const hs=lines.map(l=>Math.max(...l.map(kv=>doc.splitTextToSize(sjFx(kv[1]||'-'),cw-7).length))*4+8.4),H=hs.reduce((a,b)=>a+b,0)+2;
 doc.setFillColor(248,249,251);doc.setDrawColor(228,231,238);doc.setLineWidth(.2);doc.roundedRect(M,y,W,H,2,2,'FD');doc.setFillColor(...th.rgb);doc.rect(M,y+2.2,1.1,H-4.4,'F');
 let yy=y+1;lines.forEach((l,li)=>{l.forEach((kv,ci)=>{const x=M+4.5+ci*cw;doc.setFont('helvetica','normal');doc.setFontSize(6.6);doc.setTextColor(125);doc.text(sjFx(String(kv[0]).toUpperCase()),x,yy+4.4);
  doc.setFont('helvetica','bold');doc.setFontSize(9.2);doc.setTextColor(25);doc.text(doc.splitTextToSize(sjFx(kv[1]||'-'),cw-7),x,yy+8.7)});yy+=hs[li]});
 return y+H+6}
function pdfSigns(doc,signs,names,y,th){const PW=doc.internal.pageSize.getWidth(),M=14,W=PW-2*M,n3=signs.length,sw=W/n3,sh=42,LN=[214,220,230];
 doc.setDrawColor(...LN);doc.setLineWidth(.25);doc.rect(M,y,W,sh,'S');for(let i=1;i<n3;i++)doc.line(M+sw*i,y,M+sw*i,y+sh);
 signs.forEach((sg,i)=>{const cx=M+sw*i+sw/2,ls=String(sg).split('\n');doc.setTextColor(20);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(sjFx(ls[0]),cx,y+6,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(110);if(ls[1])doc.text(doc.splitTextToSize(sjFx(ls.slice(1).join(' ')),sw-8),cx,y+10.5,{align:'center'});
  doc.setDrawColor(130);doc.setLineWidth(.2);doc.line(cx-24,y+31,cx+24,y+31);doc.setTextColor(20);doc.text(names&&names[i]?'( '+sjFx(names[i])+' )':'(                                        )',cx,y+36,{align:'center'})});
 return y+sh+4}
function pdfFooter(doc,m,th){const PW=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),M=14,np=doc.getNumberOfPages();
 for(let i=1;i<=np;i++){doc.setPage(i);doc.setDrawColor(...tint(th.rgb,.45));doc.setLineWidth(.2);doc.line(M,PH-11,PW-M,PH-11);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(120);
  doc.text(sjFx(KOP().nama+' · '+th.k+(m.no?' '+m.no:'')),M,PH-7);doc.setFont('helvetica','italic');doc.setTextColor(150);doc.text('Dicetak dari MNI Gudang & Logistik · '+new Date().toLocaleString('id-ID'),M,PH-3.8);
  doc.setFont('helvetica','normal');doc.setTextColor(120);doc.text('Hal '+i+'/'+np,PW-M,PH-7,{align:'right'})}}
/* ---- helper Excel bersama ---- */
function xlT(ws){const hl={style:'thin',color:{argb:'FFE1E6EE'}},box={top:hl,left:hl,bottom:hl,right:hl};
 const put=(r,c,v,o={})=>{const x=ws.getCell(r,c);x.value=v;x.font={name:'Calibri',size:o.sz||10,bold:!!o.b,italic:!!o.i,color:{argb:o.c||'FF1F2937'}};x.alignment={horizontal:o.h||'left',vertical:o.v||'middle',wrapText:o.wrap!==false,indent:o.ind||0};if(o.box)x.border=box;if(o.fill)x.fill={type:'pattern',pattern:'solid',fgColor:{argb:o.fill}};if(o.nf)x.numFmt=o.nf;return x};
 const mg=(r1,c1,r2,c2)=>{if(r1!==r2||c1!==c2)ws.mergeCells(r1,c1,r2,c2)};
 const bx=(r1,c1,r2,c2)=>{for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)ws.getCell(r,c).border=box};
 return {put,mg,bx,box}}
function xlKop(wb,ws,nc,m,th){const {put,mg}=xlT(ws),k=KOP(),br='FF'+rgbHex(hexRgb(k.warna));
 let lh=44,lw=Math.round(lh*k.logoRatio);if(lw>190){lw=190;lh=Math.round(lw/k.logoRatio)}
 ws.addImage(wb.addImage({base64:k.logo.split(',')[1],extension:kopFmt(k)==='JPEG'?'jpeg':'png'}),{tl:{col:0.1,row:0.25},ext:{width:lw,height:lh}});
 [20,14,14,14].forEach((h,i)=>ws.getRow(i+1).height=h);const c0=Math.min(3,nc);
 [k.nama,k.a1,k.a2,k.kontak].forEach((s,i)=>{mg(i+1,c0,i+1,nc);put(i+1,c0,s||'',i===0?{b:true,sz:14,h:'right',c:br}:{sz:9,h:'right',c:'FF6B7280'})});
 for(let c=1;c<=nc;c++)ws.getCell(4,c).border={bottom:{style:'medium',color:{argb:br}}};
 ws.getRow(5).height=6;ws.getRow(6).height=34;put(6,1,th.k,{b:true,sz:11,c:'FFFFFFFF',fill:th.argb,h:'center'});mg(6,2,6,nc);put(6,2,m.title,{b:true,sz:18,c:th.argb,ind:1});
 ws.getRow(7).height=15;mg(7,2,7,nc);put(7,2,th.sub,{sz:9,c:'FF6B7280',ind:1});
 const half=Math.max(1,Math.ceil(nc/2)),tn=tintA(th.rgb,.1);ws.getRow(8).height=24;
 mg(8,1,8,half);put(8,1,'NO. DOKUMEN   '+(m.no||'-'),{b:true,sz:11,fill:tn,c:th.argb});
 if(half<nc){mg(8,half+1,8,nc);put(8,half+1,'TANGGAL   '+(m.date?tglLong(m.date):'-'),{b:true,sz:11,fill:tn,h:'right',c:th.argb})}
 for(let c=1;c<=nc;c++)ws.getCell(8,c).border={bottom:{style:'medium',color:{argb:th.argb}}};
 ws.getRow(9).height=8;return 10}
const xlFoot=(ws,m,th)=>{ws.headerFooter={oddFooter:'&L&8'+String(KOP().nama).replace(/&/g,'&&')+' · '+th.k+' '+String(m.no||'').replace(/&/g,'&&')+'&C&8Dicetak dari MNI Gudang && Logistik&R&8Hal &P/&N'}};
const fnSafe=s=>String(s).replace(/[\\/:*?"<>|]/g,'-').slice(0,90);
function docModel(kind,ref){const m=docModel0(kind,ref);if(m&&!m.special)m.kind=kind;return m}
function docModel0(kind,ref){
 const T=SPKT();
 if(kind==='spk'){const s=byId('spk',ref);return s?{special:'spk',file:`SPK ${s.no}${s.rev?' Rev.'+s.rev:''} - ${s.customer}`}:null}
 if(kind==='lpp'){const s=byId('spk',ref);if(!s)return null;const f=flow(ref);
  const log=f.log;
  return {file:`Laporan Produksi SPK ${s.no} - ${s.customer}`,title:'LAPORAN PROGRES PRODUKSI',no:`LPP/${s.no}/${today().slice(0,4)}`,date:today(),
   meta:[['No SPK',s.nomor||String(s.no)],['Customer',s.customer],['Tanggal SPK',tglLong(s.tgl)],['PO',s.po||'-'],['Due date',tglLong(s.due)],['Lead time',s.lead||'-'],['Selesai produksi',f.P?tglLong(f.P)+(f.Pest?' (estimasi)':''):'Belum selesai'],['Durasi produksi',f.dProd==null?'-':`${f.dProd} hari kerja (target ${T.prod})`]],
   tables:[{title:'Progres per item',cols:[['No',6,'c'],['Item',60,'l'],['Order',12,'r'],['Satuan',10,'c'],['Diproduksi',14,'r'],['Sisa',12,'r'],['Progres',12,'r']],
     rows:f.x.lines.map((l,i)=>[i+1,l.d,l.q,l.u||'',l.prodEff,Math.max(0,l.q-l.prodEff),Math.round(pct(l.prodEff,l.q)*100)+'%']),
     foot:['','TOTAL',f.x.q,'',f.x.prod,Math.max(0,f.x.q-f.x.prod),Math.round(f.x.pP*100)+'%']},
    {title:'Riwayat update produksi',cols:[['Tanggal',16,'c'],['Diinput',22,'c'],['Qty dicatat',18,'r'],['Catatan',70,'l']],
     rows:log.length?log.map(e=>[fdS(e.tgl),e.at?new Date(e.at).toLocaleString('id-ID',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}):'',sumBy(e.items||[],i=>i.qw!=null?i.qw:i.q),(e.by&&e.sumber==='mesin'?e.by+' · ':'')+(e.ket||'')]):[['-','-','-','Belum ada update bertanggal. Update berikutnya lewat tombol Update progres produksi akan tercatat di sini.']]}],
   note:s.alasan?'Kendala: '+s.alasan:'',signs:['Dibuat oleh,\nAdmin Produksi','Diperiksa,\nKepala Produksi','Mengetahui,\nPPIC']}}
 if(kind==='sjv'){const v=byId('vendor',ref);if(!v)return null;const s=byId('spk',v.spk)||{};const tgt=v.target||addWorkdays(v.tgl,T[vKey(v.proses)]);
  const bm=bmFor('vendor',v),ck=bm?bmCekMap(bm):null;
  const G=sjGrup('vendor',v),gab=G.length>1,spkG=[...new Set(G.map(x=>byId('spk',x.spk)).filter(Boolean))];let nk=0;const brs=[],hdr=[];
  G.forEach(d=>{if(gab){hdr.push(brs.length);brs.push(['',spkRingkas(d.spk),'','','',...(ck?['']:[])])}(d.items||[]).forEach(i=>{brs.push([brs.length-hdr.length+1,sjNama(d.spk,i).d,+i.q||0,i.u||'',d.rework?'Rework':'',...(ck?[ck[nk]&&ck[nk].ok?'✓':'']:[])]);nk++})});
  return {foto:bm?bmFotoCetak(bm):[],fotoJudul:'LAMPIRAN BUKTI BONGKAR MUAT · SJ '+(v.noSJ||''),file:`SJ Vendor ${v.noSJ||''} - ${v.vendor||''}`,title:'SURAT JALAN KE VENDOR',no:v.noSJ||'',date:v.tgl,
   meta:[['Kepada',v.vendor||'-'],['Proses',v.proses||'-'],['Tanggal kirim',tglLong(v.tgl)],['Target kembali',tglLong(tgt)+(v.target?'':' (standar)')],['Ref SPK',gab?spkG.map(x=>x.nomor||String(x.no)).join(', '):(s.nomor||(s.no?String(s.no):'-'))],['Customer akhir',gab?[...new Set(spkG.map(x=>x.customer))].join(', '):(s.customer||'-')],['Kendaraan',[v.kendaraan,v.nopol].filter(Boolean).join(' · ')||'-'],['Driver',v.driver||'-']],
   tables:[{cols:[['No',6,'c'],['Nama barang',70,'l'],['Qty',12,'r'],['Satuan',10,'c'],['Keterangan',30,'l'],...(ck?[['Cek',8,'c']]:[])],rows:brs,hdr,foot:['','TOTAL',sumBy(G.flatMap(d=>d.items||[]),i=>i.q),'','',...(ck?['']:[])]}],
   note:[v.ket,v.batal?'DIBATALKAN: '+v.batal.alasan:'',bm?bmCekCatatan(bm):'',gab?'Surat jalan gabungan '+G.length+' SPK dalam satu armada':''].filter(Boolean).join(' · '),signs:['Pengirim,\nGudang MNI','Pengemudi','Penerima,\n'+(v.vendor||'Vendor')]}}
 if(kind==='btb'){const [vid,k]=String(ref).split('|');const v=byId('vendor',vid);if(!v)return null;const R=vReturns(v);const r=R.find(x=>String(x.k)===String(k));if(!r)return null;const s=byId('spk',v.spk)||{};
  const idx=r.k>=0?r.k+1:0;
  return {file:`BTB ${v.noSJ||''}-${idx||'lama'} - ${v.vendor||''}`,title:'BUKTI TERIMA BARANG DARI VENDOR',no:`BTB/${v.noSJ||''}/${idx||'-'}`,date:r.tgl,
   meta:[['Dari vendor',v.vendor||'-'],['Proses',v.proses||'-'],['Tanggal terima',r.tgl?tglLong(r.tgl)+(r.est?' (estimasi)':''):'Tidak tercatat'],['Ref SJ vendor',v.noSJ||'-'],['Tanggal kirim',tglLong(v.tgl)],['Lama di vendor',r.tgl?wd(v.tgl,r.tgl)+' hari kerja':'-'],['Ref SPK',s.nomor||(s.no?String(s.no):'-')],['Customer akhir',s.customer||'-']],
   tables:[{cols:[['No',6,'c'],['Nama barang',62,'l'],['Dikirim',12,'r'],['Diterima OK',14,'r'],['Reject',12,'r'],['Sisa di vendor',14,'r'],['Satuan',10,'c']],
    rows:(v.items||[]).filter(i=>(r.items||{})[i.d]||(r.rej||{})[i.d]).map((i,n2)=>[n2+1,sjNama(v.spk,i).d,+i.q||0,(r.items||{})[i.d]||0,(r.rej||{})[i.d]||0,Math.max(0,(+i.q||0)-(+i.kembali||0)-(+i.reject||0)),i.u||'']),
    foot:['','TOTAL','',sumBy(Object.values(r.items||{}),q=>q),sumBy(Object.values(r.rej||{}),q=>q),'','']}],
   note:[r.ket,r.est?'Data penerimaan lama: tanggal diestimasi dari surat jalan customer pertama setelahnya.':''].filter(Boolean).join(' · '),signs:['Diserahkan,\n'+(v.vendor||'Vendor'),'Diterima,\nGudang MNI','Diperiksa,\nQC']}}
 if(kind==='sjc'){const k=byId('kirim',ref);if(!k)return null;const s=byId('spk',k.spk)||{};const cu=mList('customer').find(x=>x.nama===k.customer)||{};
  const bm=bmFor('kirim',k),ck=bm?bmCekMap(bm):null;
  const G=sjGrup('kirim',k),gab=G.length>1,spkG=[...new Set(G.map(x=>byId('spk',x.spk)).filter(Boolean))];const itemsG=[];
  G.forEach(d=>{if(gab)itemsG.push({hdr:spkRingkas(d.spk)});(d.items||[]).forEach(i=>itemsG.push(sjNama(d.spk,i)))});
  const cekG=ck?itemsG.filter(i=>!i.hdr).map((_,i)=>!!(ck[i]&&ck[i].ok)):null;
  return {file:`Surat Jalan ${k.noSJ||''} - ${k.customer||''}`,title:'SURAT JALAN',no:k.noSJ||'',date:k.tgl,
   sj:{noSJ:k.noSJ||'',tgl:k.tgl,customer:k.customer||'',alamat:k.alamat||cu.alamat||'',po:gab?[...new Set(spkG.map(x=>x.po).filter(Boolean))].join(', '):(s.po||''),spk:gab?spkG.map(x=>x.nomor||String(x.no)).join(', '):(s.nomor||(s.no?String(s.no):'')),kendaraan:k.kendaraan||'',nopol:k.nopol||'',driver:k.driver||'',items:gab?itemsG:(k.items||[]),ket:k.ket||'',batal:k.batal||null,partial:gab?null:sjPartial(k),cek:cekG,foto:bm?bmFotoCetak(bm):[],fotoJudul:'LAMPIRAN BUKTI BONGKAR MUAT · SJ '+(k.noSJ||'')},
   meta:[['Kepada',k.customer||'-'],['Alamat',k.alamat||cu.alamat||'-'],['Tanggal',tglLong(k.tgl)],['No PO',s.po||'-'],['Ref SPK',s.nomor||(s.no?String(s.no):'-')],['Kendaraan',[k.kendaraan,k.nopol].filter(Boolean).join(' · ')||'-'],['Driver',k.driver||'-']],
   tables:[{cols:[['No',6,'c'],['Nama barang',72,'l'],['Qty',12,'r'],['Satuan',10,'c'],['Keterangan',28,'l']],rows:(k.items||[]).map((i,n2)=>[n2+1,i.d,+i.q||0,i.u||'','']),foot:['','TOTAL',sumBy(k.items||[],i=>i.q),'','']}],
   note:[k.ket,k.batal?'DIBATALKAN: '+k.batal.alasan:''].filter(Boolean).join(' · '),signs:['Hormat kami,\nPT Mitra Nusa Internasional','Pengemudi','Diterima oleh,\n'+(k.customer||'Customer')]}}
 if(kind==='kpi'){const K=spkKpi(F.spk.p);
  return {file:`Laporan KPI SPK ${K.a}_${K.b}`,title:'LAPORAN KPI PRODUKSI, VENDOR & PENGIRIMAN',no:`KPI/${today()}`,date:today(),landscape:true,
   meta:[['Periode',`${K.a==='0000-00-00'?'Semua':tglLong(K.a)} s/d ${tglLong(K.b)}`],['Jumlah SPK',String(K.Fl.length)],['OTD (kirim tepat due)',`${pctTxt(K.otd.length,K.kir.length)} (${K.otd.length}/${K.kir.length})`],['Produksi tepat target',`${pctTxt(K.prodOk.length,K.prod.length)} · rata-rata ${r1(K.avgProd)} hk`],['Vendor tepat target',`${pctTxt(K.vDone.filter(o=>o.ok).length,K.vDone.length)} · rata-rata ${r1(K.avgTurn)} hk`],['Siap → kirim customer',`rata-rata ${r1(K.avgKirim)} hk`],['Siklus SPK → terkirim',`rata-rata ${r1(K.avgCycle)} hk`],['Target (hk)',`Produksi ${K.T.prod} · HDG ${K.T.hdg} · ELG ${K.T.elg} · PDC ${K.T.pdc} · Kirim ${K.T.kirim}`]],
   tables:[{title:'Kinerja vendor finishing',cols:[['Vendor',36,'l'],['Proses',20,'l'],['SJ',8,'r'],['Qty kirim',12,'r'],['Kembali OK',12,'r'],['Reject',10,'r'],['Rata2 hk',11,'r'],['Tepat target',12,'r'],['Masih di vendor',14,'r']],
     rows:K.byV.map(z=>[z.k,[...z.proses].join(', '),z.sj,z.out,z.back,z.rej,r1(avgOf(z.turns)),z.meas?pctTxt(z.ok,z.meas):'-',z.open?`${z.open} SJ / ${z.oldest} hk`:'-'])},
    {title:'Detail per SPK',cols:[['SPK',10,'c'],['Customer',38,'l'],['Tgl SPK',12,'c'],['Due',12,'c'],['Produksi selesai',15,'c'],['Durasi prod.',11,'r'],['Kembali vendor',15,'c'],['Kirim penuh',13,'c'],['Siap→kirim',11,'r'],['Ketepatan',14,'c'],['Posisi',14,'c']],
     rows:K.Fl.slice().sort((a,b)=>b.s.no-a.s.no).map(f=>[f.s.no,f.s.customer,fdS(f.s.tgl),fdS(f.s.due),f.P?fdS(f.P)+(f.Pest?'*':''):'-',f.dProd==null?'-':f.dProd,f.Rfull?fdS(f.Rfull)+(f.Rest?'*':''):f.vend.length?'-':'n/a',f.Kfull?fdS(f.Kfull):'-',f.dKirim==null?'-':f.dKirim,f.otd==null?(f.s.due&&f.s.due<today()?'Lewat due':'-'):f.otd?'Tepat':'Telat '+f.lateK+' hk',f.stage])}],
   note:'hk = hari kerja (Senin–Jumat). * = tanggal diestimasi dari data lama.',signs:['Disiapkan,\nPPIC','Diperiksa,\nKepala Produksi','Mengetahui,\nDirektur Operasional']}}
 return null;
}

async function docXlsx(m){
 const X=await loadExcelJS();const wb=new X.Workbook();wb.creator='MNI Gudang & Logistik';const th=docTh(m.kind);
 const ws=wb.addWorksheet((m.title||'Dokumen').replace(/[:\\/?*[\]]/g,' ').slice(0,28),{pageSetup:{paperSize:9,orientation:m.landscape?'landscape':'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.4,right:.4,top:.5,bottom:.6,header:.2,footer:.25}},views:[{showGridLines:false}]});xlFoot(ws,m,th);
 const nc=Math.max(...m.tables.map(t=>t.cols.length),4);
 const W=m.tables.reduce((a,t)=>t.cols.length===nc?t.cols.map(c=>c[1]):a,m.tables[0].cols.map(c=>c[1]));for(let i=0;i<nc;i++)ws.getColumn(i+1).width=Math.max(8,(W[i]||14)*.9);
 const {put,mg,bx}=xlT(ws);let r=xlKop(wb,ws,nc,m,th);
 const hair={bottom:{style:'hair',color:{argb:'FFD1D5DB'}}};const half=Math.ceil(nc/2),r00=r;
 for(let i=0;i<m.meta.length;i+=2){[0,1].forEach(j=>{const kv=m.meta[i+j];if(!kv)return;const c0=j?half+1:1,c1=j?nc:half;
   put(r,c0,String(kv[0]).toUpperCase(),{sz:7.5,c:'FF9CA3AF',fill:'FFF8F9FB',ind:j?0:1});if(c1>c0+1)mg(r,c0+1,r,c1);put(r,c0+1,kv[1],{b:true,sz:10,fill:'FFF8F9FB'});
   for(let c=c0;c<=c1;c++)ws.getCell(r,c).border=hair});ws.getRow(r).height=Math.max(19,13*Math.ceil(String((m.meta[i]||[])[1]||'').length/(nc*8)));r++}
 for(let q=r00;q<r;q++)ws.getCell(q,1).border={left:{style:'thick',color:{argb:th.argb}},bottom:hair.bottom};
 r++;
 for(const t of m.tables){
  if(t.title){mg(r,1,r,nc);put(r,1,t.title,{b:true,sz:11,c:th.argb});for(let c=1;c<=nc;c++)ws.getCell(r,c).border={bottom:{style:'thin',color:{argb:th.argb}}};ws.getRow(r).height=20;r++}
  t.cols.forEach((c,i)=>put(r,i+1,c[0],{b:true,c:'FFFFFFFF',box:true,fill:th.argb,h:'center'}));ws.getRow(r).height=22;r++;
  t.rows.forEach((row,ri)=>{const hd=!!(t.hdr&&t.hdr.includes(ri));row.forEach((v,i)=>{const al=(t.cols[i]||[])[2];put(r,i+1,v,{box:true,b:hd,c:hd?th.argb:undefined,fill:hd?tintA(th.rgb,.12):(ri%2?tintA(th.rgb,.035):undefined),h:al==='r'?'right':al==='c'?'center':'left',nf:typeof v==='number'&&al==='r'?((t.cols[i]||[])[3]?'+#,##0.##;-#,##0.##;0':'#,##0.##'):undefined})});ws.getRow(r).height=Math.max(19,t.rowH?t.rowH*.75:0,...row.map((v,i)=>typeof v==='string'?13.5*Math.ceil(v.length/Math.max(6,(t.cols[i]||[0,14])[1]*1.05)):0));r++});
  if(t.foot){t.foot.forEach((v,i)=>{const al=(t.cols[i]||[])[2];put(r,i+1,v,{b:true,c:th.argb,fill:tintA(th.rgb,.14),h:al==='r'?'right':al==='c'?'center':'left',nf:typeof v==='number'?((t.cols[i]||[])[3]?'+#,##0.##;-#,##0.##;0':'#,##0.##'):undefined});ws.getCell(r,i+1).border={top:{style:'medium',color:{argb:th.argb}},bottom:{style:'thin',color:{argb:th.argb}}}});ws.getRow(r).height=21;r++}
  r++;
 }
 if(m.note){mg(r,1,r,nc);put(r,1,'Catatan: '+m.note,{i:true,sz:9,fill:'FFFFF8E6',c:'FF7A5200',ind:1});ws.getCell(r,1).border={left:{style:'thick',color:{argb:'FFF0B429'}}};ws.getRow(r).height=Math.max(24,14*Math.ceil(m.note.length/(nc*9)));r+=2}
 if(m.signs){const per=Math.max(1,Math.floor(nc/m.signs.length));m.signs.forEach((sg,i)=>{const c0=1+i*per,c1=i===m.signs.length-1?nc:c0+per-1;const ls=String(sg).split('\n');
   mg(r,c0,r,c1);put(r,c0,ls[0],{b:true,h:'center'});mg(r+1,c0,r+1,c1);put(r+1,c0,ls.slice(1).join(' '),{sz:9,c:'FF6B7280',h:'center'});mg(r+2,c0,r+4,c1);mg(r+5,c0,r+5,c1);
   put(r+5,c0,m.names&&m.names[i]?`( ${m.names[i]} )`:'(                                        )',{h:'center'});bx(r,c0,r+5,c1)});r+=7}
 xlsxFoto(wb,m.foto,m.fotoJudul||'LAMPIRAN BUKTI BONGKAR MUAT');
 return new Uint8Array(await wb.xlsx.writeBuffer());
}
let PDFL=null,H2C=null;
const loadScript=(urls,test)=>urls.reduce((p,u)=>p.catch(()=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=()=>test()?res(test()):rej(new Error('lib'));s.onerror=()=>rej(new Error('Gagal memuat '+u));document.head.appendChild(s)})),Promise.reject());
function loadPdf(){if(PDFL)return PDFL;PDFL=loadScript(['/vendor/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'],()=>window.jspdf&&window.jspdf.jsPDF)
 .then(()=>loadScript(['/vendor/jspdf.plugin.autotable.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js','https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js'],()=>window.jspdf.jsPDF.API.autoTable&&window.jspdf.jsPDF)).catch(e=>{PDFL=null;throw e});return PDFL}
function loadH2C(){if(H2C)return H2C;H2C=loadScript(['/vendor/html2canvas.min.js','https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'],()=>window.html2canvas).catch(e=>{H2C=null;throw e});return H2C}

async function docPdf(m){
 const fx=v=>typeof v==='string'?v.replace(/→/g,'->').replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/×/g,'x'):v;m={...m,title:fx(m.title),note:fx(m.note),meta:m.meta.map(r=>r.map(fx)),tables:m.tables.map(t=>({...t,title:fx(t.title),cols:t.cols.map(c=>[fx(c[0]),c[1],c[2],c[3]]),rows:t.rows.map(r=>r.map(fx)),foot:t.foot&&t.foot.map(fx)}))};
 const th=docTh(m.kind);const jsPDF=await loadPdf();const doc=new jsPDF({orientation:m.landscape?'landscape':'portrait',unit:'mm',format:'a4'});
 const PW=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),M=14,LN=[225,229,237];
 let y=pdfKop(doc,th);y=pdfTitle(doc,m,th,y);y=pdfMeta(doc,m.meta,th,y);
 for(const t of m.tables){
  if(t.title){if(y>PH-40){doc.addPage();y=18}doc.setFillColor(...th.rgb);doc.rect(M,y-.2,1.6,4.6,'F');doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...th.rgb);doc.text(t.title,M+4,y+3.5);y+=7}
  const tw=t.cols.reduce((a,c)=>a+c[1],0),avail=PW-2*M;
  const wd=t.cols.map(c=>Math.max(c[1]/tw*avail,Math.min(30,String(c[0]).length*2.3+7)));const ex=wd.reduce((a,b)=>a+b,0)-avail;if(ex>0){const iw=wd.indexOf(Math.max(...wd));wd[iw]-=ex}
  const cs={};t.cols.forEach((c,i)=>cs[i]={cellWidth:wd[i],halign:c[2]==='r'?'right':c[2]==='c'?'center':'left'});
  const fmt=(v,i)=>typeof v==='number'?((t.cols[i]&&t.cols[i][3]&&v>0?'+':'')+n(v)):String(v??'');
  doc.autoTable({startY:y,head:[t.cols.map(c=>c[0])],body:t.rows.map(r=>r.map(fmt)),foot:t.foot?[t.foot.map(fmt)]:undefined,theme:'grid',
   styles:{fontSize:8.6,cellPadding:{top:2,bottom:2,left:2.2,right:2.2},...(t.rowH?{minCellHeight:t.rowH*.27}:{}),lineColor:LN,lineWidth:.15,textColor:[31,41,55],overflow:'linebreak'},headStyles:{fillColor:th.rgb,textColor:255,fontStyle:'bold',halign:'center',lineColor:th.rgb},footStyles:{fillColor:tint(th.rgb,.14),textColor:th.rgb,fontStyle:'bold',lineColor:th.rgb},alternateRowStyles:{fillColor:tint(th.rgb,.035)},columnStyles:cs,margin:{left:M,right:M,top:16,bottom:16},showFoot:'lastPage',...pdfCekHooks,
   didParseCell:h=>{pdfCekHooks.didParseCell(h);if(h.section==='body'&&t.hdr&&t.hdr.includes(h.row.index)){h.cell.styles.fontStyle='bold';h.cell.styles.textColor=th.rgb;h.cell.styles.fillColor=tint(th.rgb,.12)}if(h.section==='head'&&t.cols[h.column.index]&&t.cols[h.column.index][2]==='l')h.cell.styles.halign='left';if(h.section==='foot'&&t.cols[h.column.index]){const a=t.cols[h.column.index][2];h.cell.styles.halign=a==='r'?'right':a==='c'?'center':'left'}}});
  y=doc.lastAutoTable.finalY+7;
 }
 if(m.note){doc.setFont('helvetica','italic');doc.setFontSize(8.5);const ln=doc.splitTextToSize('Catatan: '+m.note,PW-2*M-8),h=ln.length*4+4;if(y+h>PH-60){doc.addPage();y=20}
  doc.setFillColor(255,248,230);doc.rect(M,y,PW-2*M,h,'F');doc.setFillColor(240,180,41);doc.rect(M,y,1.3,h,'F');doc.setTextColor(122,82,0);doc.text(ln,M+5,y+5);y+=h+6}
 if(m.signs){if(y>PH-56){doc.addPage();y=20}y=pdfSigns(doc,m.signs,m.names,y,th)}
 pdfFoto(doc,m.foto,m.fotoJudul||'LAMPIRAN BUKTI BONGKAR MUAT');
 pdfFooter(doc,m,th);
 return new Uint8Array(doc.output('arraybuffer'));
}
async function spkSheetPdf(id){
 const prev=SHEET;if(SHEET!==id)openSheet(id);await new Promise(r=>setTimeout(r,80));
 const el=document.querySelector('#sheet .paper');if(!el)throw new Error('Format SPK tidak tampil.');
 const [h2c,jsPDF]=await Promise.all([loadH2C(),loadPdf()]);
 el.classList.add('pdfmode');let cv;try{cv=await h2c(el,{scale:2,windowWidth:el.scrollWidth+40,width:el.scrollWidth,height:el.scrollHeight,backgroundColor:'#ffffff',useCORS:true,logging:false})}finally{el.classList.remove('pdfmode')}
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});const PW=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),M=6;
 const r=Math.min((PW-2*M)/cv.width,(PH-2*M)/cv.height);const w=cv.width*r,h=cv.height*r;
 doc.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',(PW-w)/2,M,w,h);
 return new Uint8Array(doc.output('arraybuffer'));
}
/* ---------- Surat Jalan ke customer: tata letak khusus (PDF dan Excel), tanpa status ---------- */
/* Penomoran surat jalan format MNI: {tahun 2 digit}/{bulan romawi}/MNI/{nomor urut}, mis. 26/XI/MNI/1799.
   Dikosongkan = otomatis melanjutkan nomor urut terbesar yang pernah dipakai (surat jalan batal ikut dihitung agar tidak dipakai ulang). */
const ROMAWI=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
const SJ_MNI_RE=/^\s*#?\s*(\d{1,4})\/([IVX]+)\/([A-Za-z]+)\/(\d+)\s*$/;
function sjMniNext(t){
 let best=null;S.kirim.forEach(k=>{const m=SJ_MNI_RE.exec(String(k.noSJ||''));if(m){const seq=+m[4];if(!best||seq>best.seq)best={seq,w:m[4].length,kode:m[3]}}});
 const d=new Date((t||today())+'T00:00:00'),yy=String(d.getFullYear()).slice(2),bl=ROMAWI[d.getMonth()];
 let seq=best?best.seq+1:1;const mk=q=>`${yy}/${bl}/${best?best.kode:'MNI'}/${String(q).padStart(best?best.w:1,'0')}`;
 while(sjTaken(mk(seq)))seq++;return mk(seq);
}
/* Rincian pengiriman partial: muncul hanya bila barang pada surat jalan ini dikirim bertahap (ada pengiriman sebelumnya
   atau jumlah belum memenuhi order SPK). Dihitung sampai dengan surat jalan ini, per barang. */
function sjPartial(k){
 if(!k||k.status==='Batal')return null;const s=byId('spk',k.spk);if(!s)return null;
 const key=x=>String(x.d||'').trim().toLowerCase();
 const ord=x=>String(x.created_at||x.createdAt||x.at||'');
 const all=S.kirim.filter(x=>x.spk===k.spk&&x.status!=='Batal').sort((a,b)=>String(a.tgl).localeCompare(String(b.tgl))||ord(a).localeCompare(ord(b))||String(a.noSJ).localeCompare(String(b.noSJ),undefined,{numeric:true}));
 let idx=all.findIndex(x=>x._id===k._id);if(idx<0){all.push(k);idx=all.length-1}
 const upto=all.slice(0,idx+1),rows=[];
 (k.items||[]).forEach(it=>{
  const o=(s.items||[]).find(x=>key(x)===key(it));const order=o?(+o.q||0):0;if(!(order>0))return;
  const seq=upto.map(x=>sumBy((x.items||[]).filter(y=>key(y)===key(it)),y=>+y.q||0)).filter(v=>v>0);
  const total=sumBy(seq,v=>v);if(!(total<order||seq.length>1))return;
  rows.push({d:sjNama(k.spk,it).d,u:it.u||(o&&o.u)||'',order,seq,total,sisa:Math.max(0,order-total)});
 });
 if(!rows.length)return null;
 const maxLen=Math.max(...rows.map(r=>r.seq.length)),CAP=4;
 const mergeN=maxLen>CAP?maxLen-(CAP-1):0;
 const heads=mergeN?['Partial 1–'+mergeN,...Array.from({length:CAP-1},(_,i)=>'Partial '+(mergeN+1+i))]:Array.from({length:maxLen},(_,i)=>'Partial '+(i+1));
 rows.forEach(r=>{const L=r.seq.length;let cells;
  if(mergeN){const m=sumBy(r.seq.slice(0,Math.min(L,mergeN)),v=>v);cells=[m,...r.seq.slice(mergeN)];r.cur=L<=mergeN?0:1+(L-mergeN-1)}
  else{cells=r.seq.slice();r.cur=L-1}
  while(cells.length<heads.length)cells.push('');r.cells=cells});
 return {heads,rows};
}
function sjPartialHtml(k){
 const P=sjPartial(k);if(!P)return '';
 const th=P.heads.map(h=>`<th>${esc(h)}</th>`).join('');
 const body=P.rows.map((r,i)=>`<tr><td style="text-align:center">${i+1}</td><td>${esc(r.d)}${r.u?' ('+esc(r.u)+')':''}</td><td style="text-align:right">${n(r.order)}</td>${r.cells.map((v,j)=>`<td style="text-align:right;${j===r.cur?'background:#fff3cd;font-weight:700':''}">${v===''?'-':n(v)}</td>`).join('')}<td style="text-align:right;font-weight:600">${n(r.total)}</td><td style="text-align:right;font-weight:700;${r.sisa>0?'color:#b32020':''}">${n(r.sisa)}</td></tr>`).join('');
 return `<div style="font-weight:700;margin:12px 0 4px;font-size:11px;letter-spacing:.03em">RINCIAN PENGIRIMAN PARTIAL</div><table class="sj-prev-tbl"><thead><tr><th style="width:6%">No</th><th>Nama Barang</th><th>Order</th>${th}<th>Total terkirim</th><th>Sisa</th></tr></thead><tbody>${body}</tbody></table><div class="sj-prev-note">Partial dihitung per barang. Kolom berwarna kuning = pengiriman pada surat jalan ini.</div>`;
}
const sjFx=v=>String(v==null?'':v).replace(/→/g,'->').replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/×/g,'x');
async function sjPdf(d){
 const jsPDF=await loadPdf();const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
 const PW=doc.internal.pageSize.getWidth(),PH=doc.internal.pageSize.getHeight(),M=14,W=PW-2*M,th=docTh('sjc'),NAVY=th.rgb,GR=[110,110,110],LN=[205,214,230];
 const T=(s,x,y,o)=>doc.text(sjFx(s),x,y,o);
 const yT=pdfTitle(doc,{title:'SURAT JALAN',no:d.noSJ,date:d.tgl},th,pdfKop(doc,th));
 /* kotak Kepada dan Detail pengiriman */
 const y0=yT,wl=W*.52,wr=W-wl-4,x2=M+wl+4;
 doc.setFont('helvetica','normal');doc.setFontSize(9);
 const al=doc.splitTextToSize(sjFx(String(d.alamat||'').trim()||'-'),wl-8);
 const det=[['No. PO',d.po||'-'],['Ref. SPK',d.spk||'-'],['Kendaraan',d.kendaraan||'-'],['No. Polisi',d.nopol||'-'],['Driver',d.driver||'-']];
 const H=Math.max(17.5+al.length*4.3+3,12+det.length*5.4+3,32);
 doc.setDrawColor(...LN);doc.setLineWidth(.25);doc.rect(M,y0,wl,H,'S');doc.rect(x2,y0,wr,H,'S');
 doc.setFillColor(...NAVY);doc.rect(M,y0,wl,6.2,'F');doc.rect(x2,y0,wr,6.2,'F');
 doc.setTextColor(255);doc.setFont('helvetica','bold');doc.setFontSize(7.5);T('KEPADA',M+4,y0+4.3);T('DETAIL PENGIRIMAN',x2+4,y0+4.3);
 doc.setTextColor(20);doc.setFontSize(11);T(d.customer||'-',M+4,y0+12.5);
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(60);doc.text(al,M+4,y0+17.8);
 det.forEach(([k,v],i)=>{const yy=y0+12.2+i*5.4;doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.setTextColor(...GR);T(k,x2+4,yy);doc.setTextColor(20);doc.setFont('helvetica','bold');T(': '+v,x2+27,yy)});
 /* tabel barang */
 const items=d.items||[];const tq=sumBy(items,i=>+i.q||0);const ck=d.cek;let nk=0;const body=items.map(i=>{if(i.hdr)return [{content:sjFx(i.hdr),colSpan:ck?6:5,styles:{fontStyle:'bold',fillColor:[238,242,249],halign:'left'}}];const k=nk++;return [String(k+1),sjFx(i.d),n(i.q),sjFx(i.u||''),'',...(ck?[ck[k]?'✓':'']:[])]});while(body.length<8)body.push(['','','','','',...(ck?['']:[])]);
 doc.autoTable({startY:y0+H+7,head:[['No','Nama Barang','Qty','Satuan','Keterangan',...(ck?['Cek']:[])]],body,foot:[['','TOTAL',n(tq),'','',...(ck?['']:[])]],theme:'grid',showFoot:'lastPage',
  styles:{fontSize:9,cellPadding:{top:2.4,bottom:2.4,left:2.2,right:2.2},lineColor:LN,lineWidth:.2,textColor:20,overflow:'linebreak',minCellHeight:8},
  headStyles:{fillColor:NAVY,textColor:255,fontStyle:'bold',halign:'center'},footStyles:{fillColor:[234,239,248],textColor:NAVY,fontStyle:'bold'},alternateRowStyles:{fillColor:[248,250,253]},
  columnStyles:{0:{cellWidth:12,halign:'center'},1:{cellWidth:'auto'},2:{cellWidth:22,halign:'right'},3:{cellWidth:22,halign:'center'},4:{cellWidth:ck?30:42},5:{cellWidth:14,halign:'center'}},margin:{left:M,right:M},...pdfCekHooks});
 let y=doc.lastAutoTable.finalY+6;
 if(d.partial){const Pt=d.partial;if(y>PH-90){doc.addPage();y=20}
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...NAVY);T('RINCIAN PENGIRIMAN PARTIAL',M,y);
  doc.autoTable({startY:y+2,head:[['No','Nama Barang','Order',...Pt.heads,'Total terkirim','Sisa']],body:Pt.rows.map((q,i)=>[String(i+1),sjFx(q.d)+(q.u?' ('+sjFx(q.u)+')':''),n(q.order),...q.cells.map(v=>v===''?'-':n(v)),n(q.total),n(q.sisa)]),theme:'grid',
   styles:{fontSize:8.5,cellPadding:1.8,lineColor:LN,lineWidth:.2,textColor:20},headStyles:{fillColor:[70,95,140],textColor:255,fontStyle:'bold',halign:'center'},
   columnStyles:{0:{cellWidth:10,halign:'center'},1:{cellWidth:'auto'}},margin:{left:M,right:M},
   didParseCell:h=>{if(h.section==='body'){if(h.column.index>=2)h.cell.styles.halign='right';const q=Pt.rows[h.row.index];if(q&&h.column.index===3+q.cur){h.cell.styles.fillColor=[255,243,205];h.cell.styles.fontStyle='bold'}if(q&&h.column.index===h.table.columns.length-1&&q.sisa>0){h.cell.styles.textColor=[170,30,30];h.cell.styles.fontStyle='bold'}}}});
  doc.setFont('helvetica','italic');doc.setFontSize(7.5);doc.setTextColor(...GR);T('Partial dihitung per barang. Kolom berwarna kuning = pengiriman pada surat jalan ini.',M,doc.lastAutoTable.finalY+4);y=doc.lastAutoTable.finalY+10}
 if(d.batal){doc.setFillColor(253,236,236);doc.setDrawColor(200,60,60);doc.rect(M,y,W,8,'FD');doc.setTextColor(170,30,30);doc.setFont('helvetica','bold');doc.setFontSize(9);T('DIBATALKAN: '+(d.batal.alasan||'-'),M+3,y+5.4);y+=12}
 if(d.ket){doc.setFont('helvetica','bold');doc.setFontSize(8.5);doc.setTextColor(20);T('Catatan:',M,y);doc.setFont('helvetica','normal');const ln=doc.splitTextToSize(sjFx(d.ket),W-20);doc.text(ln,M+16,y);y+=Math.max(1,ln.length)*4.2+3}
 doc.setFont('helvetica','italic');doc.setFontSize(8);doc.setTextColor(...GR);T('Barang tersebut diterima dalam keadaan baik dan jumlah sesuai dengan surat jalan ini.',M,y+2);y+=8;
 if(y>PH-62){doc.addPage();y=20}
 const sw=W/3,sh=46;doc.setDrawColor(...LN);doc.setLineWidth(.25);doc.rect(M,y,W,sh,'S');doc.line(M+sw,y,M+sw,y+sh);doc.line(M+2*sw,y,M+2*sw,y+sh);
 [['Hormat kami,',KOP().nama,''],['Pengemudi','',d.driver||''],['Diterima oleh,',d.customer||'','']].forEach(([lb,org,nm],i)=>{const cx=M+sw*i+sw/2;
  doc.setTextColor(20);doc.setFont('helvetica','bold');doc.setFontSize(9);T(lb,cx,y+6,{align:'center'});
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...GR);if(org)doc.text(doc.splitTextToSize(sjFx(org),sw-8),cx,y+10.5,{align:'center'});
  doc.setDrawColor(120);doc.setLineWidth(.2);doc.line(cx-24,y+34,cx+24,y+34);doc.setTextColor(20);T('( '+(nm||'                                  ')+' )',cx,y+39,{align:'center'});
  if(i===2){doc.setFontSize(7.5);doc.setTextColor(...GR);T('Tanggal terima: ........................',cx,y+43.5,{align:'center'})}});
 pdfFoto(doc,d.foto,d.fotoJudul||'LAMPIRAN BUKTI BONGKAR MUAT');
 pdfFooter(doc,{no:d.noSJ},th);
 return new Uint8Array(doc.output('arraybuffer'));
}
async function sjXlsx(d){
 const X=await loadExcelJS();const wb=new X.Workbook();wb.creator='MNI Gudang & Logistik';
 const ws=wb.addWorksheet('Surat Jalan',{pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.4,right:.4,top:.5,bottom:.6,header:.2,footer:.25}},views:[{showGridLines:false}],headerFooter:{oddFooter:'&L&8Dicetak dari MNI Gudang & Logistik&R&8Hal &P/&N'}});
 [5,28,10,10,10,10,10,11,11].forEach((w,i)=>ws.getColumn(i+1).width=w);const NC=9,th=docTh('sjc'),NAVY=th.argb,LN='FFCDD6E6';
 const ln={style:'thin',color:{argb:LN}},box={top:ln,left:ln,bottom:ln,right:ln};
 const F_=(o={})=>({name:'Arial',size:o.sz||10,bold:!!o.b,italic:!!o.i,color:{argb:o.c||'FF111111'}});
 const put=(r,c,v,o={})=>{const x=ws.getCell(r,c);x.value=v;x.font=F_(o);x.alignment={horizontal:o.h||'left',vertical:o.v||'middle',wrapText:o.wrap!==false};if(o.box)x.border=box;if(o.fill)x.fill={type:'pattern',pattern:'solid',fgColor:{argb:o.fill}};if(o.nf)x.numFmt=o.nf;return x};
 const mg=(r1,c1,r2,c2)=>{if(r1!==r2||c1!==c2)ws.mergeCells(r1,c1,r2,c2)};
 const bx=(r1,c1,r2,c2)=>{for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)ws.getCell(r,c).border=box};
 const rHead=xlKop(wb,ws,NC,{title:'SURAT JALAN',no:d.noSJ,date:d.tgl},th);
 /* kotak Kepada (A:C) dan Detail pengiriman (D:I) */
 const r0=rHead;mg(r0,1,r0,3);put(r0,1,'KEPADA',{b:true,sz:9,c:'FFFFFFFF',fill:NAVY});bx(r0,1,r0,3);mg(r0,4,r0,NC);put(r0,4,'DETAIL PENGIRIMAN',{b:true,sz:9,c:'FFFFFFFF',fill:NAVY});bx(r0,4,r0,NC);
 mg(r0+1,1,r0+1,3);put(r0+1,1,d.customer||'-',{b:true,sz:12});bx(r0+1,1,r0+1,3);ws.getRow(r0+1).height=24;
 mg(r0+2,1,r0+5,3);put(r0+2,1,String(d.alamat||'').trim()||'-',{sz:10,v:'top',c:'FF444444'});bx(r0+2,1,r0+5,3);
 const det=[['No. PO',d.po||'-'],['Ref. SPK',d.spk||'-'],['Kendaraan',d.kendaraan||'-'],['No. Polisi',d.nopol||'-'],['Driver',d.driver||'-']];
 det.forEach(([k,v],i)=>{const r=r0+1+i;put(r,4,k,{sz:9,c:'FF666666'});ws.getCell(r,4).border=box;mg(r,5,r,NC);put(r,5,v,{b:true});bx(r,5,r,NC)});
 for(let k=2;k<=5;k++)ws.getRow(r0+k).height=18;
 /* tabel barang */
 let r=r0+8;const KE=d.cek?NC-1:NC;
 put(r,1,'No',{b:true,c:'FFFFFFFF',fill:NAVY,h:'center'});put(r,2,'Nama Barang',{b:true,c:'FFFFFFFF',fill:NAVY,h:'center'});put(r,3,'Qty',{b:true,c:'FFFFFFFF',fill:NAVY,h:'center'});put(r,4,'Satuan',{b:true,c:'FFFFFFFF',fill:NAVY,h:'center'});mg(r,5,r,KE);put(r,5,'Keterangan',{b:true,c:'FFFFFFFF',fill:NAVY,h:'center'});if(d.cek)put(r,NC,'Cek',{b:true,c:'FFFFFFFF',fill:NAVY,h:'center'});bx(r,1,r,NC);ws.getRow(r).height=22;r++;
 const items=d.items||[];let nk=0;const rows=items.map(i=>i.hdr?{hdr:i.hdr}:[++nk,i.d,+i.q||0,i.u||'']);while(rows.length<8)rows.push(['','','','']);
 rows.forEach((row,k)=>{if(row.hdr){mg(r,1,r,NC);put(r,1,row.hdr,{b:true,fill:'FFEEF2F9'});bx(r,1,r,NC);ws.getRow(r).height=21;r++;return}const ci=typeof row[0]==='number'?row[0]-1:-1;const fill=k%2?'FFF8FAFD':undefined;row.forEach((v,j)=>put(r,j+1,v,{fill,h:j===0||j===3?'center':j===2?'right':'left',nf:j===2&&typeof v==='number'?'#,##0.##':undefined}));mg(r,5,r,KE);put(r,5,'',{fill});if(d.cek)put(r,NC,d.cek[ci]?'✓':'',{fill,h:'center',b:true,c:'FF1E783C'});bx(r,1,r,NC);ws.getRow(r).height=21;r++});
 mg(r,1,r,2);put(r,1,'TOTAL',{b:true,c:NAVY,fill:'FFEAEFF8',h:'right'});put(r,3,sumBy(items,i=>+i.q||0),{b:true,c:NAVY,fill:'FFEAEFF8',h:'right',nf:'#,##0.##'});mg(r,4,r,NC);put(r,4,'',{fill:'FFEAEFF8'});bx(r,1,r,NC);r+=2;
 /* rincian partial: hanya muncul bila pengiriman ini bagian dari kiriman partial */
 if(d.partial){const P=d.partial,p=P.heads.length;
  mg(r,1,r,NC);put(r,1,'RINCIAN PENGIRIMAN PARTIAL',{b:true,sz:10,c:NAVY});r++;
  const base=Math.floor(4/p),spans=P.heads.map((_,i)=>i===p-1?4-base*(p-1):base);const starts=[];let c0=4;spans.forEach(sp=>{starts.push(c0);c0+=sp});
  const hd={b:true,c:'FFFFFFFF',fill:'FF465F8C',h:'center'};
  put(r,1,'No',hd);put(r,2,'Nama Barang',hd);put(r,3,'Order',hd);P.heads.forEach((h,i)=>{mg(r,starts[i],r,starts[i]+spans[i]-1);put(r,starts[i],h,hd)});put(r,8,'Total terkirim',hd);put(r,9,'Sisa',hd);bx(r,1,r,NC);ws.getRow(r).height=30;r++;
  P.rows.forEach((row,i)=>{put(r,1,i+1,{h:'center'});put(r,2,row.d+(row.u?' ('+row.u+')':''),{});put(r,3,row.order,{h:'right',nf:'#,##0.##'});
   row.cells.slice(0,p).forEach((v,j)=>{mg(r,starts[j],r,starts[j]+spans[j]-1);put(r,starts[j],v===''?'-':v,{h:'right',nf:'#,##0.##',b:j===row.cur,fill:j===row.cur?'FFFFF3CD':undefined})});
   put(r,8,row.total,{h:'right',b:true,nf:'#,##0.##'});put(r,9,row.sisa,{h:'right',b:row.sisa>0,c:row.sisa>0?'FFAA1E1E':undefined,nf:'#,##0.##'});bx(r,1,r,NC);ws.getRow(r).height=20;r++});
  mg(r,1,r,NC);put(r,1,'Partial dihitung per barang. Kolom berwarna kuning = pengiriman pada surat jalan ini.',{i:true,sz:8.5,c:'FF666666'});r+=2}
 if(d.batal){mg(r,1,r,NC);put(r,1,'DIBATALKAN: '+(d.batal.alasan||'-'),{b:true,c:'FFAA1E1E',fill:'FFFDECEC'});bx(r,1,r,NC);r+=2}
 if(d.ket){mg(r,1,r,NC);put(r,1,'Catatan: '+d.ket,{i:true,sz:9,v:'top'});ws.getRow(r).height=Math.max(18,13*(String(d.ket).split('\n').length+1));r+=2}
 mg(r,1,r,NC);put(r,1,'Barang tersebut diterima dalam keadaan baik dan jumlah sesuai dengan surat jalan ini.',{i:true,sz:8.5,c:'FF666666'});r+=2;
 const sg=[[1,2,'Hormat kami,',KOP().nama,''],[3,6,'Pengemudi','',d.driver||''],[7,9,'Diterima oleh,',d.customer||'','']];
 sg.forEach(([c1,c2,lb,org,nm])=>{mg(r,c1,r,c2);put(r,c1,lb,{b:true,h:'center'});mg(r+1,c1,r+1,c2);put(r+1,c1,org,{sz:9,c:'FF666666',h:'center'});mg(r+2,c1,r+5,c2);mg(r+6,c1,r+6,c2);put(r+6,c1,'( '+(nm||'                              ')+' )',{h:'center'});bx(r,c1,r+6,c2)});
 mg(r+7,7,r+7,9);put(r+7,7,'Tanggal terima: ....................',{sz:8.5,c:'FF666666',h:'center'});
 xlsxFoto(wb,d.foto,d.fotoJudul||'LAMPIRAN BUKTI BONGKAR MUAT');
 return new Uint8Array(await wb.xlsx.writeBuffer());
}
async function downloadDoc(kind,ref,fmt){
 if(!DLS){toast('Unduhan tidak tersedia di tampilan ini.');return}
 const m0=docModel(kind,ref);if(!m0){toast('Data dokumen tidak ditemukan.');return}
 if(m0.signs&&m0.signs.length&&m0.special!=='spk')return askSigners(m0.signs,[],names=>downloadDoc0(m0,names,ref,fmt));
 return downloadDoc0(m0,null,ref,fmt);
}
async function downloadDoc0(m,names,ref,fmt){
 if(names)m={...m,names};
 toast(`Menyiapkan ${fmt==='pdf'?'PDF':'Excel'}…`);
 try{let data;
  if(m.special==='spk'){if(fmt==='xlsx'){await exportSpkXlsx(ref);return}data=await spkSheetPdf(ref)}
  else if(m.sj)data=fmt==='pdf'?await sjPdf(m.sj):await sjXlsx(m.sj);
  else data=fmt==='pdf'?await docPdf(m):await docXlsx(m);
  await DLS.save({filename:fnSafe(m.file)+(fmt==='pdf'?'.pdf':'.xlsx'),data});
 }catch(e){if(e.code!=='declined')toast('Gagal membuat dokumen: '+(e.message||e.code))}
}

document.addEventListener('click',async e=>{
 const el=e.target.closest('[data-act]');if(!el)return;const a=el.dataset.act,ds=el.dataset;
 if(a!=='del'&&delArm){delArm=null}
 try{
 switch(a){
  case 'filt':{let v=ds.val;if(v==='true')v=true;else if(v==='false')v=false;F[ds.view][ds.key]=v;renderTools();renderBody();break}
  case 'go':location.hash=ds.href;if(ds.open){const[k,id]=ds.open.split(':');setTimeout(()=>k==='spk'?spkDrawer(id):vendorDrawer(id),30)}break;
  case 'mv':mvForm(ds.g,ds.j,ds.item);break;
  case 'newitem':newItemForm(ds.g);break;
  case 'kartu':kartu(ds.g,ds.id);break;
  case 'editbuf':bufForm(ds.id,ds.g);break;
  case 'csv':exportCsv(ds.what);break;
  case 'newbm':bmForm();break;
  case 'openbm':if(!e.target.closest('button'))bmDrawer(ds.id);break;
  case 'printbm':printBmChecklist(ds.id);break;
  case 'bmstep':{const b=byId('bongkar',ds.id);const t=nowTime();if(ds.to==='Selesai'){const cs=bmCekStat(b);if(cs.n&&cs.done<cs.n&&!confirm(`Baru ${cs.done} dari ${cs.n} item yang dicek. Tetap tandai selesai?`))break}await updDoc('bongkar',ds.id,ds.to==='Proses'?{status:'Proses',jamMulai:t}:{status:'Selesai',jamSelesai:t,jamMulai:b.jamMulai||b.jamMasuk});toast(ds.to==='Proses'?'Mulai dikerjakan':'Bongkar muat selesai');break}
  case 'bmkoreksi':bmKoreksiForm(ds.id);break;
  case 'addgx':{const box=$('#m-extra'),f=$('#mform');if(!box||!f)break;const k=Math.max(0,...[...f.querySelectorAll('[data-gx]')].map(x=>+x.dataset.gx))+1,prim=f.spk.value,cust=ds.mode==='kirim'&&prim?(byId('spk',prim)||{}).customer:'';const excl=[prim,...[...f.querySelectorAll('[data-gx-sel]')].map(x=>x.value)].filter(Boolean);
   box.insertAdjacentHTML('beforeend',`<div class="gx full" data-gx="${k}"><div class="gx-h"><select class="sel" name="gspk_${k}" data-gx-sel="${k}" data-mode="${ds.mode}" aria-label="SPK lain">${gxOpsi(ds.mode,excl,cust)}</select><button type="button" class="ibtn" data-act="delgx" aria-label="Hapus SPK ini">×</button></div><div class="gx-l"><div class="note">Pilih SPK untuk menampilkan item.</div></div></div>`);break}
  case 'delgx':{const bx=el.closest('.gx');if(bx)bx.remove();break}
  case 'bmck':await bmCek(ds.id,+ds.idx,el.checked);break;
  case 'bmckall':await bmCekSemua(ds.id,ds.on==='1');break;
  case 'bmfotocetak':await bmFotoUbah(ds.id,ds.fid,{cetak:el.checked});break;
  case 'bmfotodel':if(confirm('Hapus foto ini dari catatan bongkar muat?'))await bmFotoHapus(ds.id,ds.fid);break;
  case 'newvendor':vendorForm(ds.spk);break;
  case 'terima':terimaForm(ds.id);break;
  case 'openvendor':if(!e.target.closest('button'))vendorDrawer(ds.id);break;
  case 'newkirim':kirimForm(ds.spk);break;
  case 'openkirim':if(!e.target.closest('button'))kirimDrawer(ds.id);break;
  case 'kstep':{if(ds.to!=='Disiapkan'){const dk=byId('kirim',ds.id);if(!dk||!dk.nopol){toast('Isi no polisi armada (Ubah) sebelum status berangkat atau diterima.');break}}const up={status:ds.to};if(ds.to==='Diterima')up.tglTerima=today();await updDoc('kirim',ds.id,up);toast('Status: '+ds.to);break}
  case 'newspk':openEditor(newEd());break;
  case 'spksheet':openSheet(ds.id);break;
  case 'spkedit':{const s=byId('spk',ds.id);if(s)openEditor(edFrom(s,false));break}
  case 'spkdup':{const s=byId('spk',ds.id);if(s){closeSheet();openEditor(edFrom(s,true))}break}
  case 'spkxlsx':exportSpkXlsx(ds.id);break;
  case 'spkpub':await publishDraft(ds.id);break;
  case 'sheet-close':closeSheet();break;
  case 'ed-close':if(EDDIRTY&&!el.dataset.sure){el.dataset.sure='1';el.textContent='Klik lagi: buang perubahan';return}closeEditor();break;
  case 'ed-save':saveEditor(ds.mode);break;
  case 'ed-addline':ED.sections[+ds.s].lines.push(lineBaru(ED.sections[+ds.s].h));rerenderSecs();{const x=$(`#ed-d-${ds.s}-${ED.sections[+ds.s].lines.length-1}`);x&&x.focus()}break;
  case 'ed-tempel':edTempelForm(+ds.s);break;
  case 'ed-det':{const L=ED.sections[+ds.s].lines[+ds.l];L.det=!L.det;const d=$('#ed-det-'+ds.s+'-'+ds.l);if(d)d.hidden=!L.det;const b=el;if(b&&b.setAttribute)b.setAttribute('aria-expanded',String(!!L.det));break}
  case 'ed-delline':{const L=ED.sections[+ds.s].lines;L.splice(+ds.l,1);if(!L.length)L.push(lineBaru(ED.sections[+ds.s].h));EDDIRTY=true;rerenderSecs();break}
  case 'ed-addsec':ED.sections.push({h:ED.sections[ED.sections.length-1].h,lines:[lineBaru(ED.sections[ED.sections.length-1].h),lineBaru(ED.sections[ED.sections.length-1].h)]});EDDIRTY=true;rerenderSecs();break;
  case 'ed-stok-pakai':{const sc=ED.sections[+ds.s],L=sc.lines[+ds.l],c=fgCocokUrut(sc,L)[0];if(c){const ts=(calc().stock.fg[c._id]||0)-(fgResMap(ED.id)[c._id]||0),q=+L.q||0;if(ts<=0){toast('Stok tersedia 0 (habis atau dicadangkan SPK lain); tidak bisa dipakai.');break}L.fg=c._id;L.ambil=Math.max(0,Math.min(q>0?q:ts,ts))||'';EDDIRTY=true;rerenderSecs()}break}
  case 'ednmauto':{const L=ED&&ED.sections[+ds.s]&&ED.sections[+ds.s].lines[+ds.l];if(L){L.nm=false;edHitungBaris(ED.sections[+ds.s],L);EDDIRTY=true;rerenderSecs()}break}
  case 'ed-addcov':{const hh=coverOf(ED.sections[ED.sections.length-1].h);ED.sections.push({h:hh,lines:[lineBaru(hh),lineBaru(hh)]});EDDIRTY=true;rerenderSecs();break}
  case 'ed-addacc':ED.sections.push({h:accsOf(ED.sections[ED.sections.length-1].h),lines:[lineBaru(accsOf(ED.sections[ED.sections.length-1].h)),lineBaru(accsOf(ED.sections[ED.sections.length-1].h))]});EDDIRTY=true;rerenderSecs();break;
  case 'ed-delsec':if(ED.sections.length>1){ED.sections.splice(+ds.s,1);EDDIRTY=true;edAuto();edSyncHeader();rerenderSecs()}break;
  case 'ed-up':case 'ed-down':{const i=+ds.s,j=a==='ed-up'?i-1:i+1;if(j>=0&&j<ED.sections.length){[ED.sections[i],ED.sections[j]]=[ED.sections[j],ED.sections[i]];EDDIRTY=true;rerenderSecs()}break}
  case 'openspk':spkDrawer(ds.id);break;
  case 'prod':prodForm(ds.id);break;
  case 'prodcatat':{const c=mesinCtx(ds.k);if(!c)break;const aq=PXL().antrianPerLangkah(c.st.rute,c.st.kum,c.st.qty);const w0=c.st.rute[aq.findIndex((a,ii)=>a.antri>0&&!PXL().langkahVendor(c.st.rute[ii]))];const w=ds.wc&&c.st.rute.includes(ds.wc)&&!PXL().langkahVendor(ds.wc)?ds.wc:w0;if(!w)break;F.mesin.wc=w;F.mesin.mesin='';lsSet('mni-wc',w);lsSet('mni-mesin','');mesinCatatForm(ds.k);break}
  case 'prodall':document.querySelectorAll('#mform [name^="p_"]').forEach(inpEl=>{const q=parseFloat(inpEl.max);if(q>0)inpEl.value=q});break; /* B-006: sebelumnya membaca sel tabel (closest('tr')) yang tidak ada di form kartu, sehingga melempar galat */
  case 'railtg':railToggle();break;
  case 'void':voidForm(ds.c,ds.id);break;
  case 'spkreopen':{const s=byId('spk',ds.id);if(!s||s.status!=='Batal')break;if(!confirm(`Aktifkan kembali SPK ${s.no}?`))break;await updDoc('spk',ds.id,{status:'Terbit',batal:null});toast(`SPK ${s.no} aktif kembali`);break}
  case 'rmset':rmSetForm();break;
  case 'rmedit':rmEditForm(ds.id);break;
  case 'prnew':prNewForm();break;
  case 'mesinedit':mesinForm(ds.nm);break;
  case 'spmesinlihat':{const fs0=F['sparepart'];fs0.tab='mutasi';fs0.mvmesin=ds.nm;fs0.mvj='keluar';renderTools();renderBody();break}
  case 'prajukan':await prAjukan(ds.id);break;case 'spkberat':spkBeratForm([ds.id]);break;case 'spkberatsemua':spkBeratForm(null);break;case 'serahsemua':platSerahSemua();break;case 'prstep':await updDoc('pr',ds.id,{status:'Dipesan'});toast('PR ditandai sudah dipesan');break;
  case 'prterima':{const pp=byId('pr',ds.id);mvForm(pp&&pp.gudang==='sp'?'sp':'rm','masuk',null,ds.id);break}
  case 'spprnew':spPrNewForm();break;
  case 'fgspknew':fgSpkNewForm();break;
  case 'fgspkpick':fgSpkPickForm();break;
  case 'fgpick':{const f=F['barang-jadi'];f.pick=f.pick||{};f.pick[ds.id]=el.checked;fgPickBar();break}
  case 'fgpickclear':F['barang-jadi'].pick={};renderBody();break;
  case 'fgpicklow':{const f=F['barang-jadi'];f.pick={};fgSug().forEach(x=>{f.pick[x.r._id]=true});renderBody();break}
  case 'fgterima':fgTerimaSpk(ds.spk);break;case 'fgterimasemua':fgTerimaSemua();break;case 'fgsjbuat':fgSjBuat();break;
  case 'prxlsx':exportPrXlsx(ds.id);break;case 'prpdf':exportPrDoc(ds.id,'pdf');break;case 'kspdf':exportKartuDoc(ds.id,'pdf');break;
  case 'opnsheetpdf':printMvDoc('','','',opnameSheetDoc());break;
  case 'opnsheetxlsx':exportMvXlsx('','','',opnameSheetDoc());break;
  case 'mvpdf':printMvDoc(ds.no,ds.j,ds.id);break;
  case 'mvxlsx':exportMvXlsx(ds.no,ds.j,ds.id);break;
  case 'ksxlsx':exportKartuXlsx(ds.id);break;
  case 'ksprint':window.print();break;
  case 'opnsave':saveOpname();break;
  case 'opnfill':rmFilter().forEach(r=>F['bahan-baku'].opn[r._id]=String(RMI(r._id).stok));renderBody();break;
  case 'opnclear':F['bahan-baku'].opn={};renderBody();break;
  case 'kendal':kendalForm(ds.id);break;
  case 'koreksi':koreksiForm(ds.id);break;
  case 'setvendor':setVendorForm(ds.id);break;
  case 'mvadd':{const tb=$('#m-mvl');const i=Math.max(...[...tb.querySelectorAll('tr')].map(r=>+r.dataset.ln))+1;tb.insertAdjacentHTML('beforeend',mvLine(ds.g,i,''));break}
  case 'mvdel':{const tb=$('#m-mvl');if(tb.children.length>1)el.closest('tr').remove();break}
  case 'rmnonaktif':{const r=byId('rm',ds.id);if(!r)break;const st=calc().stock.rm[ds.id]||0;if(!confirm(`Nonaktifkan "${rmLabel(r)}"?${st?` Stok saat ini ${n(st)} masih tercatat.`:''}\n\nItem tidak akan muncul di daftar stok, pilihan form, stock opname, dan usulan pembelian. Riwayat dan stoknya tetap tersimpan, dan bisa diaktifkan kembali.`))break;await updDoc('rm',ds.id,{aktif:false});toast('Item dinonaktifkan');break}
  case 'rmaktif':{await updDoc('rm',ds.id,{aktif:true});toast('Item diaktifkan kembali');break}
  case 'spimport':spImportForm();break;
  case 'spcsv':spCsv();break;
  case 'spedit':spItemForm(ds.id);break;
  case 'spnonaktif':{const r=byId('sp',ds.id);if(!r)break;const st=calc().stock.sp[ds.id]||0;if(!confirm('Nonaktifkan "'+r.item+'"?'+(st?' Stok saat ini '+n(st)+' '+(r.satuan||'')+' masih tercatat.':'')+'\n\nItem tidak muncul di daftar stok, pilihan form, dan opname. Riwayatnya tetap tersimpan dan bisa diaktifkan kembali.'))break;await updDoc('sp',ds.id,{aktif:false});closeModal();toast('Sparepart dinonaktifkan');break}
  case 'spaktif':{await updDoc('sp',ds.id,{aktif:true});closeModal();toast('Sparepart diaktifkan kembali');break}
  case 'spopnsave':spOpnSave();break;
  case 'spopnfill':{const f=F['sparepart'],R=spCalc();spFilter().forEach(r=>f.opn[r._id]=String(R[r._id].stok));renderBody();break}
  case 'spopnclear':F['sparepart'].opn={};renderBody();break;
  case 'jenisform':jenisForm(ds.j||'');break;
  case 'jenisdel':{const g=ds.j,u=S.rm.filter(r=>grade(r)===g).length;if(u&&!confirm(`Jenis "${g}" dipakai ${u} item. Setelah dihapus, item itu menjadi "Belum dikenali" dan beratnya dihitung seperti baja. Lanjutkan?`))break;if(BASE_GRADES.includes(g))await saveSetting({jenisOff:[...OFFG(),g]});else await saveSetting({mats:CMATS().filter(m=>m.nama!==g)});toast('Jenis material dihapus');break}
  case 'jenispulih':await saveSetting({jenisOff:OFFG().filter(x=>x!==ds.j)});toast('Jenis material dipulihkan');break;
  case 'rmdel':{const id=ds.id,r=byId('rm',id);if(!r)break;const nm=S.mutasi.filter(m=>m.gudang==='rm'&&m.item===id).length,np=S.pr.filter(p=>(p.items||[]).some(i=>i.item===id)).length;if(nm||np){toast(`"${rmLabel(r)}" tidak bisa dihapus: punya ${nm} mutasi stok${np?` dan ${np} PR`:''}. Riwayat stok harus tetap utuh. Gunakan Nonaktifkan agar item tidak muncul lagi di daftar dan pilihan form.`);break}if(!confirm(`Hapus item "${rmLabel(r)}"? Item ini belum punya riwayat mutasi.`))break;try{for(const h of S.rmhist.filter(h=>h.item===id))await delDoc('rmhist',h._id);await delDoc('rm',id);toast('Item dihapus')}catch(e){if(/ditolak database/i.test(e.message||'')){await updDoc('rm',id,{aktif:false});toast('Hapus permanen dilarang di database; item dinonaktifkan agar tidak muncul lagi (riwayat tetap utuh).')}else throw e}break}
  case 'mnew':{const tb=F['master-data'].tab;if(tb==='bb'){newItemForm('rm');break}if(tb==='item')katItemForm();else if(tb==='grup')grupForm();else if(tb==='satuan')listForm('sat');else if(tb==='wc')wcForm();else if(tb==='mesin')mesinForm();else masterForm(tb);break}
  case 'katedit':katItemForm(ds.d);break;
  case 'katauto':katAutoForm();break;
  case 'katmerge':katMergeForm(ds.d);break;
  case 'katdel':katDelForm(ds.d);break;
  case 'grupedit':grupForm(ds.i);break;
  case 'grupdel':{const g=(KAT().grup||[])[+ds.i];await katSave(k=>{k.grup=(k.grup||[]).filter(x=>x!==g)});toast('Judul section dihapus');break}
  case 'listnew':listForm(ds.kind);break;
  case 'listedit':listForm(ds.kind,ds.v);break;
  case 'listdel':await listDel(ds.kind,ds.v);break;
  case 'bbgo':F['master-data'].tab='bb';if(location.hash==='#master-data'){renderTools();renderBody()}else location.hash='master-data';break;
  case 'katgo':F['master-data'].tab='item';F['master-data'].kf=ds.kf||'';if(location.hash==='#master-data'){renderTools();renderBody()}else location.hash='master-data';break;
  case 'medit':masterForm(ds.k,ds.id);break;
  case 'mmerge':mergeForm(ds.k,ds.from,ds.to);break;
  case 'mreg':masterForm(ds.k,null,ds.nm);break;
  case 'mdel':masterDel(ds.k,ds.id);break;
  case 'mcsv':masterCsv(F['master-data'].tab);break;
  case 'wcedit':wcForm(ds.id);break;
  case 'wcdel':await wcDel(ds.id);break;
  case 'wcseed':await seedWc();break;
  case 'ruteck':case 'matck':await matrikCentang(el);break;
  case 'apadd':apTambah(ds.s);break;case 'apdel':apHapus(ds.s,+ds.i);break;case 'apup':apGeser(+ds.i,-1);break;case 'apdn':apGeser(+ds.i,1);break;case 'apsimpan':await apSimpan();break;case 'apreset':if(confirm('Pulihkan aturan proses ke bawaan?'))await apReset();break;
  case 'platserah':platSerahForm(ds.id);break;
  case 'opsisimpan':await opsiSimpan(false);break;case 'spkdimtoggle':{await saveSetting({spkDimBaru:!spkDimBaru()});toast(spkDimBaru()?'Layout SPK per dimensi diaktifkan':'Layout SPK per dimensi dinonaktifkan');renderBody();break}
  case 'aturansimpan':await aturanSimpan(false);break;case 'aturanreset':if(confirm('Pulihkan aturan section ke standar MNI?'))await aturanSimpan(true);break;case 'kopsimpan':await kopSimpan(false);break;case 'kopreset':if(confirm('Pulihkan kop dokumen ke bawaan (logo dan alamat semula)?'))await kopSimpan(true);break;
  case 'opsireset':if(confirm('Pulihkan semua opsi SPK ke bawaan?'))await opsiSimpan(true);break;
  
  case 'rutedel':await ruteHapus(ds.rk);break;
  case 'wcmesinseed':await seedMesin();break;
  case 'wcfix':await seedWcHilang();break;
  case 'mshowInactive':F['master-data'].showInactive=el.checked;renderBody();break;
  case 'cekcsv':cekDataCsv();break;
  case 'cekgrp':F['cek-data'].grp=!F['cek-data'].grp;renderBody();break;
  case 'setcat':{const v=ds.cat||'';F['cek-data'].cat=v;F['cek-data'].sev='';F['cek-data'].vendorF='';renderTools();renderBody();break}
  case 'setsev':{F['cek-data'].sev=ds.sev||'';renderBody();break}
  case 'prodfix':{const s=byId('spk',ds.id);const x=calc().spk[ds.id];const items=s.items.map((it,i)=>{const l=x.lines[i];return l&&l.kirim>=l.q?{...it,prod:+it.q}:it});await updDoc('spk',ds.id,{items});toast(`Progres produksi SPK ${s.no} diperbarui`);break}
  case 'kpiuser':if(!e.target.closest('button')||el.matches('button'))kpiUser(ds.uid);break;
  case 'kpicsv':await kpiCsv();break;case 'tindak':if(ds.tab&&F[ds.view])F[ds.view].tab=ds.tab;location.hash=ds.href;break;case 'ringkascsv':await ringkasCsv();break;
  case 'mepage':case 'meclick':accountModal();break;
  case 'pwself':pwSelf();break;
  case 'mesinmulai':await mesinMulai(ds.k);break;
  case 'mesinselesai':await mesinSelesai(ds.k,false);break;
  case 'mesinsebagian':await mesinSelesai(ds.k,true);break;
  case 'mesinbatal':await mesinBatal(ds.k);break;
  case 'mesinvoid':await mesinVoid(ds.id);break;
  case 'mesincatat':mesinCatatForm(ds.k);break;
  case 'papanbuka':{F.mesin.wc=ds.wc;F.mesin.mesin='';lsSet('mni-wc',ds.wc);lsSet('mni-mesin','');location.hash='mesin';break}
  case 'mrstep':{const q=document.querySelector(`.mesin-run[data-k="${CSS.escape(ds.k)}"] [data-mrq]`);if(q){const mx=q.max===''?Infinity:+q.max;const v=Math.max(0,Math.min(mx,(+q.value||0)+(+ds.d)));q.value=String(Math.round(v*1000)/1000);mrLabel(q.closest('.mesin-run'))}break}
  case 'mesinsemua':{const q=document.querySelector(`.mesin-run[data-k="${CSS.escape(ds.k)}"] [data-mrq]`);if(q){q.value=ds.max;mrLabel(q.closest('.mesin-run'))}break}
  case 'lapcsv':await lapCsv();break;
  case 'progcsv':await progCsv();break;
  case 'lapacsv':await lapAnalisaCsv();break;
  case 'lapprint':lapPrint();break;
  case 'katberat':katalogBeratForm();break;
  case 'auditrefresh':AUDIT=null;renderBody();await loadAudit();break;
  case 'importcsv':importForm();break;
  case 'backup':closeModal();await backupData();break;
  case 'logout':closeModal();if(USER&&USER.signOut)await USER.signOut();break;
  case 'uedit':userForm(ds.uid);break;
  case 'upw':pwForm(ds.uid);break;
  case 'uinvite':inviteForm();break;
  case 'doc':await downloadDoc(ds.kind,ds.ref,ds.fmt);break;
  case 'sjalamat':sjAlamatForm(ds.id);break;
  case 'spktarget':spkTargetForm();break;
  case 'kpivendor':kpiVendor(ds.v);break;
  case 'pmpilih':{F.mesin.mesin=ds.m;lsSet('mni-mesin',ds.m);renderTools();renderBody();break}
  case 'matpr':matBuatPr();break;
  case 'gtbar':{const o=GTX[+ds.i];if(o)gtDetail(o);break}
  case 'pbnav':F.spk.mg=ds.d==='0'?0:(F.spk.mg||0)+(+ds.d);renderTools();renderBody();break;
  case 'pbcard':{const o=PBX[+ds.i];if(o)pbDetail(o);break}
  case 'pbjalan':F.spk.tab='berjalan';F.spk.fl='semua';F.spk.q=ds.q||'';closeDrawer();renderTools();renderBody();break;
  case 'pgpos':F.spk.pos=F.spk.pos===ds.p?'':(ds.p||'');renderBody();break;
  case 'jdsemua':{F.spk.tutup={};if(ds.v==='lipat')S.spk.forEach(s=>{F.spk.tutup[s._id]=true});renderBody();break}
  case 'jdbuka':F.spk.tutup=F.spk.tutup||{};F.spk.tutup[ds.id]=!F.spk.tutup[ds.id];renderBody();break;
  case 'jdhariini':{const g=document.getElementById('gt-scroll');if(g)g.scrollLeft=Math.max(0,(+g.dataset.now)-90);break}
  case 'spkstage':F.spk.stage=ds.st||'';F.spk.tab='list';if(ds.st)F.spk.st='';renderTools();renderBody();break;
  case 'dwtab':{const tab=ds.tab;document.querySelectorAll('.dw-tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===tab));document.querySelectorAll('.dw-pane').forEach(p=>p.classList.toggle('on',p.id==='dw-pane-'+tab));break}
  case 'closedrawer':closeDrawer();break;
  case 'closemodal':closeModal();break;
 }}catch(err){toast(err.message||('Gagal: '+err.code))}
});
document.addEventListener('input',e=>{const el=e.target;if(el.dataset.act==='q'){F[el.dataset.view].q=el.value;renderBody()}});
document.addEventListener('change',e=>{const el=e.target;const a=el.dataset.act;if(a==='filtsel'){const fv=F[el.dataset.view];fv[el.dataset.key]=el.value;if(el.dataset.key==='kat'&&'type' in fv){const o=fgTypes(el.value);if(fv.type&&!(fv.type==='__none'?o.tanpa:o.types.includes(fv.type)))fv.type='';renderTools()}renderBody()}
 else if(a==='mesinwc'){F.mesin.wc=el.value;F.mesin.mesin='';lsSet('mni-wc',el.value);lsSet('mni-mesin','');renderTools();renderBody()}
 else if(a==='mesinmsn'){F.mesin.mesin=el.value;lsSet('mni-mesin',el.value);renderTools();renderBody()}
 else if(a==='mesinop'){lsSet(opKey(mesinPilih().mesin),el.value.trim())}
 else if(a==='lapf'){const f=F['laporan-produksi'];f[el.dataset.key]=el.value;if(el.dataset.key==='wc')f.mesin='';renderTools();renderBody()}});
/* papan jadwal: tooltip saat hover, penunjuk tanggal, geser dengan drag, Enter membuka detail */
(()=>{let tip=null,pan=null;
 const mk=()=>{if(!tip){tip=document.createElement('div');tip.className='gt-tip';tip.hidden=true;document.body.appendChild(tip)}return tip};
 const sembunyi=()=>{if(tip)tip.hidden=true};
 const HRF=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
 document.addEventListener('mousemove',e=>{
  if(pan)return;
  const el=e.target&&e.target.closest?e.target:null;if(!el){sembunyi();return}
  const bar=el.closest('.gt [data-act="gtbar"]');
  if(bar){const o=GTX[+bar.dataset.i];if(o){const t=mk();if(t.dataset.i!==bar.dataset.i){t.innerHTML=gtTipHtml(o);t.dataset.i=bar.dataset.i}t.hidden=false;const w=t.offsetWidth,h=t.offsetHeight;let x=e.clientX+14,y=e.clientY+16;if(x+w>innerWidth-8)x=e.clientX-w-14;if(y+h>innerHeight-8)y=e.clientY-h-14;t.style.left=Math.max(8,x)+'px';t.style.top=Math.max(8,y)+'px'}}else sembunyi();
  const sc=el.closest('#gt-scroll'),cr=document.getElementById('gt-cross'),xl=document.getElementById('gt-xl');
  if(sc&&cr&&xl){const r=sc.getBoundingClientRect();const nm=parseInt(getComputedStyle(sc.closest('.gt')).getPropertyValue('--gt-nm'))||244;const rel=e.clientX-r.left;const x=rel+sc.scrollLeft-nm;
   if(rel>nm&&x>=0&&window.MNIProduksi){const px=+sc.dataset.px,i=Math.floor(x/px),d=window.MNIProduksi.geserHari(sc.dataset.awal,i);const dw=new Date(d+'T00:00:00Z').getUTCDay();cr.style.display='block';cr.style.left=(i*px+px/2)+'px';cr.style.width='1px';xl.style.display='block';xl.style.left=(i*px+px/2)+'px';xl.textContent=HRF[dw]+' '+fdp2(d)}
   else{cr.style.display='none';xl.style.display='none'}}
 });
 document.addEventListener('mouseout',e=>{if(!e.relatedTarget)sembunyi()});
 document.addEventListener('scroll',sembunyi,true);
 document.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;const sc=e.target.closest&&e.target.closest('#gt-scroll');if(!sc||e.target.closest('[data-act],button,a,input,.gt-nmw,.gt-nm-it'))return;pan={sc,x:e.clientX,l:sc.scrollLeft};sc.classList.add('pan');sembunyi()});
 document.addEventListener('pointermove',e=>{if(pan)pan.sc.scrollLeft=pan.l-(e.clientX-pan.x)});
 const lepas=()=>{if(pan){pan.sc.classList.remove('pan');pan=null}};
 document.addEventListener('pointerup',lepas);document.addEventListener('pointercancel',lepas);
 document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches&&e.target.matches('.gt [data-act="gtbar"]')){const o=GTX[+e.target.dataset.i];if(o)gtDetail(o)}});
})();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#modal').hidden)closeModal();else if(ED)return;else if(SHEET)closeSheet();else if(DRAWER)closeDrawer()}});
$('#editor').addEventListener('input',edInput);$('#editor').addEventListener('change',edInput);$('#editor').addEventListener('paste',edPaste);
$('#editor').addEventListener('keydown',e=>{if(e.target.id==='ed-distnew'&&e.key==='Enter'){e.preventDefault();const v=e.target.value.trim();if(v&&ED){ED.dist=[...new Set([...ED.dist,v])];EDDIRTY=true;const keep=ED;renderEditor()}}});
let tt=0;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,3200)}
function themeGet(){try{return localStorage.getItem('mni-theme')||'light'}catch(e){return 'light'}}
function themeApply(t){if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);document.querySelectorAll('[data-theme-set]').forEach(b=>b.classList.toggle('on',b.dataset.themeSet===t));try{localStorage.setItem('mni-theme',t)}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-theme-set]');if(b)themeApply(b.dataset.themeSet)});
themeApply(themeGet());
function railToggle(force){const h=document.documentElement;const mini=force!==undefined?force:!h.classList.contains('rail-mini');h.classList.toggle('rail-mini',mini);try{localStorage.setItem('mni-rail',mini?'mini':'full')}catch(e){}const b=$('#railtg');if(b){b.setAttribute('aria-label',mini?'Besarkan menu':'Kecilkan menu');b.title=(mini?'Besarkan menu':'Kecilkan menu')+' ( [ )';b.querySelector('span').textContent=mini?'Besarkan menu':'Kecilkan menu'}}
railToggle(document.documentElement.classList.contains('rail-mini'));
document.addEventListener('keydown',e=>{if(e.key==='['&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest('input,textarea,select,[contenteditable]')&&!ED&&$('#modal').hidden){e.preventDefault();railToggle()}});
boot();
/* ---------- Aksesibilitas: nama untuk pilihan (select) tanpa label, dipasang otomatis (axe select-name) ---------- */
function a11yFix(){document.querySelectorAll('.fld').forEach(f=>{const l=f.querySelector('label'),c=f.querySelector('input:not([type=hidden]),select,textarea');if(!l||!c||l.htmlFor)return;if(!c.id)c.id='f'+Math.random().toString(36).slice(2,8);l.htmlFor=c.id});document.querySelectorAll('input:not([type=hidden]):not([aria-label]),textarea:not([aria-label])').forEach(i=>{if(i.labels&&i.labels.length)return;i.setAttribute('aria-label',i.placeholder||i.title||i.name||'Isian')});document.querySelectorAll('.tbl-wrap:not([tabindex])').forEach(e=>{if(e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1){e.tabIndex=0;e.setAttribute('role','region');if(!e.getAttribute('aria-label'))e.setAttribute('aria-label','Tabel data, dapat digulir dengan keyboard')}});document.querySelectorAll('select:not([aria-label]):not([aria-labelledby])').forEach(s=>{if(s.labels&&s.labels.length)return;const t=s.title||(s.options[0]&&s.options[0].text)||s.name||'Pilihan';s.setAttribute('aria-label',t)})}
let _a11yT,_a11yT2;new MutationObserver(()=>{clearTimeout(_a11yT);clearTimeout(_a11yT2);_a11yT=setTimeout(a11yFix,60);_a11yT2=setTimeout(a11yFix,600)}).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',()=>{clearTimeout(_a11yT);_a11yT=setTimeout(a11yFix,200)});a11yFix();
