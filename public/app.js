/* ---------- icons ---------- */
const I={
  play:'<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
  pause:'<path d="M7 4.5h3.6v15H7zM13.4 4.5H17v15h-3.6z" fill="currentColor" stroke="none"/>',
  next:'<path d="M5 5l10 7-10 7z" fill="currentColor" stroke="none"/><path d="M18.5 5v14"/>',
  prev:'<path d="M19 5L9 12l10 7z" fill="currentColor" stroke="none"/><path d="M5.5 5v14"/>',
  create:'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16v4M17 18h4"/>',
  library:'<path d="M4 4v16M8.5 4v16"/><path d="M13 5.2l3.8-1 4.2 15.5-3.8 1z"/>',
  studio:'<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>',
  stop:'<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7a4.3 4.3 0 017.5 2.8C19.5 15.4 12 20 12 20z"/>',
  more:'<circle cx="5.5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
  down:'<path d="M6 9l6 6 6-6"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  wand:'<path d="M4 20L15 9M13 5.5V3M18.5 11H21M17.2 6.8L19 5M11 7l6 6"/>',
  dice:'<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="15" r="1.1" fill="currentColor"/><circle cx="15" cy="9" r="1.1" fill="currentColor"/><circle cx="9" cy="15" r="1.1" fill="currentColor"/>',
  download:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
  extend:'<path d="M3 12h15M14 7l5 5-5 5"/><path d="M21 5v14"/>',
  cover:'<path d="M4 12a8 8 0 0113.7-5.6L20 8.5M20 12a8 8 0 01-13.7 5.6L4 15.5"/><path d="M20 4v4.5h-4.5M4 20v-4.5h4.5"/>',
  vocals:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/><path d="M19 3v4M17 5h4"/>',
  stems:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5" opacity=".5"/>',
  scissors:'<circle cx="6" cy="6" r="2.8"/><circle cx="6" cy="18" r="2.8"/><path d="M8.3 7.8L20 18M8.3 16.2L20 6"/>',
  persona:'<circle cx="12" cy="8.5" r="4"/><path d="M4.5 21a7.5 7.5 0 0115 0"/>',
  voice:'<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/>',
  trash:'<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 12.5h9.2L17.5 7"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>',
  file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'
};
function ic(n,s=20){return `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`}
const MARK='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="var(--accent)"/><path d="M5.5 13.5c1.6-4.6 3.4-4.6 5 0s3.4 4.6 5 0 2-3.5 3-2" stroke="var(--accent-ink)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

/* ---------- utils ---------- */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=s=>{s=Math.max(0,Math.floor(s||0));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}


Object.assign(I,{
  sort:'<path d="M7 4v16M3.5 7.5L7 4l3.5 3.5M17 20V4M13.5 16.5L17 20l3.5-3.5"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  queue:'<path d="M4 6h13M4 11h13M4 16h8"/><path d="M16 14.5v6l5-3z" fill="currentColor"/>',
  expand:'<path d="M14.5 4H20v5.5M9.5 20H4v-5.5M20 4l-6.5 6.5M4 20l6.5-6.5"/>',
  thumbUp:'<path d="M7.5 10.5V20H4.5v-9.5zM7.5 10.5L11.3 3.5c1.6 0 2.6 1.3 2.2 2.9L12.8 9.5h6a2 2 0 012 2.4l-1.3 6.4a2 2 0 01-2 1.7H7.5"/>',
  thumbDown:'<path d="M7.5 13.5V4H4.5v9.5zM7.5 13.5l3.8 7c1.6 0 2.6-1.3 2.2-2.9l-.7-3.1h6a2 2 0 002-2.4l-1.3-6.4A2 2 0 0017.5 4H7.5"/>',
  shuffle:'<path d="M3 7h3.5c2 0 3.2 1 4.3 2.6l2.4 4.8c1.1 1.6 2.3 2.6 4.3 2.6H21M3 17h3.5c1.3 0 2.2-.4 3-1.1M14 8.1c.8-.7 1.7-1.1 3-1.1H21M18 4l3 3-3 3M18 14l3 3-3 3"/>',
  repeat:'<path d="M4 11V9a3 3 0 013-3h13M17 3l3 3-3 3M20 13v2a3 3 0 01-3 3H4M7 21l-3-3 3-3"/>',
  share:'<path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',arrowUp:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  copy:'<rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7.5a2 2 0 002 2h2.5"/>',
  home:'<path d="M4 10.5L12 4l8 6.5V20H4z"/><path d="M10 20v-5h4v5"/>',
  filter:'<path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" fill="currentColor"/>',
  chevR:'<path d="M9 6l6 6-6 6"/>',arrowUL:'<path d="M17 17L7 7M7 15V7h8"/>',refresh:'<path d="M20 12a8 8 0 11-2.3-5.7M20 4v4h-4"/>',
  prev2:'<path d="M11.5 6L3 12l8.5 6zM21 6l-8.5 6 8.5 6z" fill="currentColor" stroke="none"/>',
  next2:'<path d="M12.5 6L21 12l-8.5 6zM3 6l8.5 6L3 18z" fill="currentColor" stroke="none"/>',
  pauseXL:'<path d="M6.5 4h4v16h-4zM13.5 4h4v16h-4z" fill="currentColor" stroke="none"/>',
  playXL:'<path d="M7 3.5v17l14-8.5z" fill="currentColor" stroke="none"/>',
  like:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7a4.3 4.3 0 017.5 2.8C19.5 15.4 12 20 12 20z" fill="currentColor"/>'
});

/* ---------- state ---------- */
// Fiyatlar: Firestore config/pricing → SF.applyPricing (sunucu her zaman kendi fiyatıyla düşer)
let MAX=500;
const COST={generate:10,cover:10,extend:10,'upload-extend':10,'add-vocals':10,'remove-vocals':5,'replace-section':5};
const S={view:'home',mode:'simple',output:'song',gender:'f',variety:1,aop:'cover',filter:'all',sort:'new',q:'',
  lib:store.get('sf2_lib',[]),personas:store.get('sf2_personas',[]),voices:store.get('sf2_voices',[]),
  set:Object.assign({credits:MAX,backend:'',key:'',model:'V6',theme:'auto'},store.get('sf2_set',{})),src:null};
S.lib.forEach(t=>{if(t.output==='instrumental')t.output='beat';if(t.fav&&t.like==null)t.like=1});
// Atılacak kayıtlar: sesi olmayan "hazır" parça (eski deneme sesi) ya da 10 dk'dan eski, sunucu görevi hiç oluşmamış üretim.
// Yeni başlayan üretim (görev numarası birkaç sn içinde gelir) korunur — başka sekme/cihaz onu silmesin.
const junk=t=>!t||(t.status==='ready'&&!t.audioUrl)||(t.status==='gen'&&!t.taskId&&Date.now()-(t.created||0)>6e5);
S.lib=S.lib.filter(t=>!junk(t));
const save=()=>{store.set('sf2_lib',S.lib);store.set('sf2_set',S.set);store.set('sf2_personas',S.personas);store.set('sf2_voices',S.voices);if(window.FB)FB.schedule()};
/* ---------- Firebase köprüsü (public/fb.js) ---------- */
const fbWait=()=>window.FB?Promise.resolve(window.FB):new Promise(r=>{const t=setTimeout(()=>r(null),4000);addEventListener('fb-ready',()=>{clearTimeout(t);r(window.FB)},{once:true})});
// API adresi: web'de aynı sunucu, mobil uygulamada tam adres (public/native.js → CR.api)
const apiUrl=u=>window.CR?CR.api(u):u;
async function api(url,o={}){const fb=await fbWait();const headers=fb?await fb.headers(o.headers||{}):(o.headers||{});return fetch(apiUrl(url),{...o,headers})}
const jpost=(url,body)=>api(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
window.SF={
  state:()=>S,
  applyCatalog(c){if(!c)return;const put=(a,v)=>{if(Array.isArray(v)&&v.length)a.splice(0,a.length,...v)};
    put(STYLES,c.styles);put(IDEAS,c.ideas);put(LYRICS,c.lyrics);put(TITLES,c.titles);put(GENRES,(c.genres||[]).map(g=>Array.isArray(g)?g:[g.name,g.style]));
    if(c.beatTags)BEAT_TAGS=c.beatTags;
    $('#styleChips').innerHTML=STYLES.map(s=>`<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('');syncChips();renderSugs();
    EX.built=false;window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('sf-catalog'))},
  applyPricing(p){if(!p)return;if(p.startCredits>0)MAX=p.startCredits;if(p.costs)Object.assign(COST,p.costs);syncCreate();renderProfile()},
  applyKie(k){if(!k||!Array.isArray(k.models)||!k.models.length)return;
    const opts=k.models.map(m=>`<option value="${esc(m.id)}">${esc(m.label||m.id)}</option>`).join('');
    if(!k.models.some(m=>m.id===S.set.model))S.set.model=k.defaultModel||k.models[0].id;
    ['#defModel','#model'].forEach(s=>{$(s).innerHTML=opts;$(s).value=S.set.model})},
  // Çıkışta bu cihazdaki hesap verisini temizle (bulutta duruyor; sonraki hesaba karışmasın)
  resetLocal(){stopAll();S.lib=[];S.personas=[];S.voices=[];S.set.credits=MAX;
    ['sf2_lib','sf2_personas','sf2_voices'].forEach(k=>store.set(k,[]));store.set('sf2_set',S.set);renderAll();renderStudio()},
  applyConfig(c){if(!c)return;SF.applyPricing(c.pricing);SF.applyCatalog(c.catalog);SF.applyKie(c.kie)},
  applyUser({credits,settings,personas,voices}){if(credits!=null)S.set.credits=credits;
    if(settings){if(settings.model)S.set.model=settings.model;if(settings.theme&&settings.theme!==S.set.theme){S.set.theme=settings.theme;applyTheme()}}
    if(personas)S.personas=personas;if(voices)S.voices=voices;
    store.set('sf2_set',S.set);store.set('sf2_personas',S.personas);store.set('sf2_voices',S.voices);renderAll();if(personas||voices)renderStudio()},
  applyRemote(kind,changes){const arr=S[kind];
    changes.forEach(c=>{const i=arr.findIndex(x=>x.id===c.id);if(c.removed||(kind==='lib'&&junk(c.data))){if(i>=0)arr.splice(i,1);return}
      if(i>=0)Object.assign(arr[i],c.data);else arr.push({...c.data,id:c.id})});
    if(kind==='lib')S.lib.sort((a,b)=>(b.created||0)-(a.created||0)||(a.version||0)-(b.version||0));
    store.set('sf2_lib',S.lib);renderAll();
    if(P.cur&&changes.some(c=>c.id===P.cur.id)){const t=find(P.cur.id);if(t){P.cur=t;syncPlayer()}else stopAll()}},
};
// Yedek yapılandırma (Firestore config/app gelene kadar ya da çevrimdışıyken)
setTimeout(()=>fetch('/config/app.json').then(r=>r.json()).then(c=>{if(!SF.remote)SF.applyConfig(c)}).catch(()=>{}));
const fmt2=s=>{if(!isFinite(s))return'--:--';s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};

/* ---------- covers ---------- */
// Kapak paleti [ana, zemin, vurgu] — canlı sıcak: altın, kehribar, alev, koyu kırmızı; mor/mavi yok
const PAL=[['#F5B83D','#1A1208','#FFF4DC'],['#FF7A2F','#1C0D05','#FFD36E'],['#FFD36E','#3A1F05','#FF5A36'],['#FF5A36','#160807','#F5B83D'],['#FFF4DC','#B45309','#1A1208'],['#F59E0B','#0F0B06','#FFE7B0'],['#1A1208','#F5B83D','#FFF4DC'],['#FFB347','#3B1608','#FFF0D6'],['#E8C07A','#2A1A0C','#FF7A2F']];
function coverSVG(seed){
  const r=rng(seed),p=PAL[Math.floor(r()*PAL.length)],v=Math.floor(r()*5);let g='';
  if(v===0){const cx=15+r()*70,cy=15+r()*70;for(let i=9;i>0;i--)g+=`<circle cx="${cx}" cy="${cy}" r="${i*13}" fill="${i%2?p[0]:p[1]}"/>`}
  else if(v===1){const a=Math.floor(r()*180);let s='';for(let i=0;i<12;i++)s+=`<rect x="${i*17-50}" y="-60" width="${6+r()*6}" height="220" fill="${i%3?p[0]:p[2]}"/>`;g=`<g transform="rotate(${a} 50 50)">${s}</g>`}
  else if(v===2){for(let x=0;x<5;x++)for(let y=0;y<5;y++)g+=`<circle cx="${10+x*20}" cy="${10+y*20}" r="${2+r()*8}" fill="${r()>.72?p[2]:p[0]}"/>`}
  else if(v===3){for(let i=0;i<4;i++)g+=`<circle cx="${(i%2)*100}" cy="${Math.floor(i/2)*100}" r="${42+r()*32}" fill="${i%2?p[2]:p[0]}"/>`}
  else{const n=5+Math.floor(r()*4);for(let i=0;i<n;i++){const y=100-i*(100/n);g+=`<path d="M0 ${y} Q 25 ${y-10-r()*25} 50 ${y} T 100 ${y} V 100 H 0 Z" fill="${i%2?p[0]:p[2]}" opacity="${.55+i*.06}"/>`}}
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="${p[1]}"/>${g}</svg>`;
}

function art(t){return t&&t.image?`<img src="${esc(t.image)}" alt="" loading="lazy">`:coverSVG(t.seed)}

/* ---------- content ---------- */
// Katalog (stil, öneri, tür, örnek söz): Firestore config/catalog → yedek /catalog.json (SF.applyCatalog)
const STYLES=[],IDEAS=[],GENRES=[],LYRICS=[],TITLES=[];let BEAT_TAGS='';
const STAGES=['Sırada','Sözler yazılıyor','Besteleniyor','Miksleniyor','Son dokunuşlar'];
const KIND={song:'Vokal',beat:'Beat',stemv:'Vokal stem',steminst:'Enstrüman stem'};
const pick=a=>a[Math.floor(Math.random()*a.length)];
function autoTitle(text){const w=(text||'').replace(/[^\p{L}\s]/gu,' ').split(/\s+/).filter(x=>x.length>2).slice(0,3);if(w.length<2)return pick(TITLES);return w.map(x=>x.charAt(0).toLocaleUpperCase('tr')+x.slice(1)).join(' ')}
function styleFromDesc(d){const l=d.toLocaleLowerCase('tr'),f=STYLES.filter(s=>l.includes(s.toLocaleLowerCase('tr')));return f.length?f.join(', '):'pop'}

/* ---------- static icons ---------- */
$$('.mk').forEach(m=>m.innerHTML=MARK);
const NAV={home:['Ana sayfa','home'],studio:['Stüdyo','studio'],library:['Kütüphane','library'],profile:['Profil','user']};
I.user=I.persona;
$$('.nav').forEach(b=>{const [l,i]=NAV[b.dataset.go];b.innerHTML=ic(i)+l});
$$('.tab').forEach(b=>{if(b.dataset.go==='profile')return;const [l,i]=NAV[b.dataset.go];b.innerHTML=ic(i,22);b.setAttribute('aria-label',l)});$('.tab[data-go=profile]').setAttribute('aria-label','Profil');
$('.tab-create span').innerHTML=ic('plus',26);$('#crIc').innerHTML=ic('create',14);$('.nav-create').innerHTML=ic('plus',18)+'Oluştur';
const AV=hash('me');$('#tabAv').innerHTML=coverSVG(AV);$('#libAv').innerHTML=coverSVG(AV);$('#libAdd').innerHTML=ic('plus',22);$('#pAv').innerHTML=coverSVG(AV);
$('#cPlus').innerHTML=ic('plus',22);$('#cMic').innerHTML=ic('mic',20);$('#cSend').innerHTML=ic('arrowUp',22);$('#ddIc').innerHTML=ic('down',16);
$$('.chev').forEach(c=>c.innerHTML=ic('chevR',16));
$$('[data-close]').forEach(b=>b.innerHTML=ic('down',24));
$('#searchBtn').innerHTML=ic('search',22);
$('#lyrIdea').innerHTML=ic('dice',16)+'Rastgele';$('#advChev').innerHTML=ic('down',18);
$('#fpMore').innerHTML=ic('more',24);$('#fpShuf').innerHTML=ic('shuffle',24);$('#fpRep').innerHTML=ic('repeat',24);$('#fpPrev').innerHTML=ic('prev2',34);$('#fpNext').innerHTML=ic('next2',34);
$('#styleRemix').innerHTML=ic('cover',18);$('#styleCopy').innerHTML=ic('copy',18);$('#lyrCopy').innerHTML=ic('copy',18);

/* ---------- navigation ---------- */
function moveInd(){const on=$('.tab.on'),ind=$('#tabInd');if(!on||!ind)return;ind.style.transform=`translateX(${on.offsetLeft}px)`}
function go(v){const same=S.view===v;S.view=v;$$('.view').forEach(x=>x.hidden=x.id!=='v-'+v);if(!same){const el=$('#v-'+v);el.classList.remove('enter');void el.offsetWidth;el.classList.add('enter')}if(v==='home'){requestAnimationFrame(()=>{exBuild();exReplay();exStart()})}else exStop();$$('.nav,.tab').forEach(b=>b.classList.toggle('on',b.dataset.go===v));moveInd();$('#main').scrollTop=0;if(v==='library')renderLib();if(v==='studio')renderStudio();if(v==='profile')renderProfile()}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go);const c=e.target.closest('[data-create]');if(c)openCreate(c.dataset.create)});

/* ---------- overlay stack ---------- */
const stack=[];
function openLayer(el){el.classList.add('open');stack.push(el);$('#scrim').classList.add('open')}
function closeLayer(el){el=el||stack[stack.length-1];if(!el)return;el.classList.remove('open');if(el._onClose)el._onClose();const i=stack.indexOf(el);if(i>=0)stack.splice(i,1);if(!stack.some(x=>x!==$('#fp')))$('#scrim').classList.remove('open');recStop();if(el===$('#fp'))el.setAttribute('aria-hidden','true')}
$('#scrim').onclick=()=>{const top=stack[stack.length-1];if(top&&top!==$('#fp'))closeLayer(top)};
$$('[data-close]').forEach(b=>b.onclick=()=>closeLayer(b.closest('.modal')));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLayer();if(e.code==='Space'&&!/INPUT|TEXTAREA|SELECT|BUTTON/.test(document.activeElement.tagName)&&hasMedia()){e.preventDefault();toggle()}});
function swipeClose(handle,el){let y0=null;handle.addEventListener('pointerdown',e=>{y0=e.clientY;handle.setPointerCapture(e.pointerId)});handle.addEventListener('pointermove',e=>{if(y0==null)return;const d=Math.max(0,e.clientY-y0);el.style.transform=`translateY(${d}px)`;el.style.transition='none'});handle.addEventListener('pointerup',e=>{if(y0==null)return;const d=e.clientY-y0;el.style.transform='';el.style.transition='';y0=null;if(d>90||Math.abs(d)<6)closeLayer(el)})}

function bindSeg(el,cb){el.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!el.contains(b))return;el.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));cb(b.dataset.v)})}

/* ---------- home ---------- */
function renderSugs(){const s=[...IDEAS].sort(()=>Math.random()-.5).slice(0,3);$('#sugs').innerHTML=s.map(x=>`<button class="sug" data-sug="${esc(x)}"><span>${esc(x)}</span>${ic('arrowUL',16)}</button>`).join('')+`<button class="sug round" id="sugRe" aria-label="Yenile">${ic('refresh',18)}</button>`}
$('#sugs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='sugRe')return renderSugs();$('#desc').value=b.dataset.sug;$('#simpleErr').textContent=''});
/* ---------- explore: full-screen, soft spring physics ---------- */
const EX={stage:null,tiles:[],w:0,h:0,T:0,sx:0,sy:0,cx:0,cy:0,vx:0,vy:0,tx:null,ty:null,drag:false,raf:0,last:0,focus:-1,built:false,b:null,run:false,t0:performance.now()};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const svgInner=s=>s.slice(s.indexOf('>')+1,s.lastIndexOf('</svg>'));
const svgURL=inner=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${inner}</svg>`);
function tileImgs(seed){const inner=svgInner(coverSVG(seed));return [svgURL(inner),svgURL(`<defs><filter id="b" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="3.4"/></filter></defs><g filter="url(#b)"><g transform="translate(50 50) scale(1.14) translate(-50 -50)">${inner}</g></g>`)]}
function exBuild(){
  const st=EX.stage;if(!st)return;const w=st.clientWidth,hh=st.clientHeight;if(!w||!hh)return;
  if(!GENRES.length){EX.built=false;return} // katalog (config/app) henüz gelmedi
  if(EX.built&&w===EX.w&&hh===EX.h){exRender();return}
  const keep=EX.built?EX.focus:-1;EX.w=w;EX.h=hh;
  const T=EX.T=Math.round(clamp(Math.min(w,hh)*.34,108,176)),G=Math.round(T*.2),sx=EX.sx=T+G,sy=EX.sy=Math.round(sx*.87);
  // sonsuz döngü: ızgara, ekranın her yönde en az yarım ekran + kenar payı fazlası kadar büyük → aynı karolar kesintisiz tekrar eder
  const cols=Math.max(8,2*Math.ceil((w/2+1.45*T)/sx)+2);let rows=Math.max(10,Math.ceil((hh+2.9*T)/sy)+2);if(rows%2)rows++;
  EX.W=cols*sx;EX.H=rows*sy;
  let html='';EX.tiles=[];
  for(let r=0,k=0;r<rows;r++)for(let c=0;c<cols;c++,k++){
    const g=GENRES[k%GENRES.length],x=c*sx+(r%2?sx/2:0),y=r*sy,d=Math.hypot(c+(r%2?.5:0)-cols/2+.25,r-(rows-1)/2);
    EX.tiles.push({x,y,g,ph:k*1.37});
    const [sa,sb]=tileImgs(hash('ex'+g[0]+k));html+=`<button class="ex-tile" data-i="${k}" tabindex="-1" aria-label="${esc(g[0])}" style="width:${T}px;height:${T}px"><span class="ex-in" style="animation-delay:${Math.round(d*80)}ms"><img class="ex-a" src="${sa}" alt="" draggable="false"><img class="ex-b" src="${sb}" alt="" draggable="false"></span></button>`;
  }
  $('#exGrid').innerHTML=html;$$('#exGrid .ex-tile').forEach((el,i)=>{EX.tiles[i].el=el;EX.tiles[i].bEl=el.querySelector('.ex-b');el.style.zIndex=1});
  EX.built=true;EX.focus=-1;
  const t=EX.tiles[keep>=0&&keep<EX.tiles.length?keep:Math.floor(rows/2)*cols+Math.floor(cols/2)];EX.cx=t.x;EX.cy=t.y;EX.vx=EX.vy=0;EX.tx=null;exRender();
}
function exRender(){
  const w2=EX.w/2,h2=EX.h/2,R=Math.min(EX.w,EX.h)*.68,half=EX.T/2,mx=w2+EX.T*1.3,my=h2+EX.T*1.3,W=EX.W,H=EX.H;let best=-1,bd=1e12;
  for(let i=0;i<EX.tiles.length;i++){
    const t=EX.tiles[i];let dx=t.x-EX.cx,dy=t.y-EX.cy;dx-=Math.round(dx/W)*W;dy-=Math.round(dy/H)*H;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}
    if(dx>mx||dx<-mx||dy>my||dy<-my){if(!t.off){t.el.style.visibility='hidden';t.off=true}continue}
    if(t.off!==false){t.el.style.visibility='visible';t.off=false}
    const e=Math.min(1,Math.sqrt(d)/R),s=1.34-.74*Math.pow(e,1.25),k=1-.17*e;
    const tr=`translate3d(${(w2+dx*k-half).toFixed(1)}px,${(h2+dy*k-half).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
    if(t.tr!==tr){t.el.style.transform=tr;t.tr=tr}
    const o=Math.round((1-.58*e)*20)/20;if(t.o!==o){t.el.style.opacity=o;t.o=o}
    const bq=Math.round(Math.min(1,e*1.35)*5)/5;if(t.bq!==bq){t.bEl.style.opacity=bq;t.bq=bq}
  }
  if(best>=0&&best!==EX.focus){const prev=EX.tiles[EX.focus];if(prev){prev.el.classList.remove('focus');prev.el.style.zIndex=1}
    EX.focus=best;const t=EX.tiles[best];t.el.classList.add('focus');t.el.style.zIndex=2;
    const n=$('#exName');n.classList.remove('swap');void n.offsetWidth;n.textContent='#'+t.g[0];n.classList.add('swap');
    if(EX.drag&&navigator.vibrate)try{navigator.vibrate(3)}catch(e){}}
}
function exLoop(now){
  const dt=EX.last?Math.min(.034,(now-EX.last)/1000):.016;EX.last=now;
  if(!EX.drag&&EX.tx!=null){
    const K=64,C=2*Math.sqrt(K)*.92;                 // soft, barely-underdamped spring
    EX.vx+=(-K*(EX.cx-EX.tx)-C*EX.vx)*dt;EX.vy+=(-K*(EX.cy-EX.ty)-C*EX.vy)*dt;
    EX.cx+=EX.vx*dt;EX.cy+=EX.vy*dt;
    if(Math.abs(EX.cx-EX.tx)<.25&&Math.abs(EX.cy-EX.ty)<.25&&Math.hypot(EX.vx,EX.vy)<3){EX.cx=((EX.tx%EX.W)+EX.W)%EX.W;EX.cy=((EX.ty%EX.H)+EX.H)%EX.H;EX.vx=EX.vy=0;EX.tx=null}
  }
  exRender();
  const busy=EX.drag||EX.tx!=null;
  EX.raf=EX.run&&busy&&!document.hidden?requestAnimationFrame(exLoop):0;if(!EX.raf)EX.last=0;
}
function exStart(){EX.run=true;if(!EX.raf){EX.last=0;EX.raf=requestAnimationFrame(exLoop)}}
function exWake(){EX.run=true;if(!EX.raf){EX.last=0;EX.raf=requestAnimationFrame(exLoop)}}
function exStop(){EX.run=false;if(EX.raf)cancelAnimationFrame(EX.raf);EX.raf=0}
function exReplay(){const e=$('#explore');e.classList.remove('shown');void e.offsetWidth;e.classList.add('shown')}
const wrapD=(d,P)=>d-Math.round(d/P)*P;
function exNearest(x,y){let b=0,bd=1e18;EX.tiles.forEach((t,i)=>{const dx=wrapD(t.x-x,EX.W),dy=wrapD(t.y-y,EX.H),d=dx*dx+dy*dy;if(d<bd){bd=d;b=i}});return b}
// hedef: karonun, referans noktaya (kamera ya da kayış ucu) en yakın kopyası
function exGoTo(i,rx=EX.cx,ry=EX.cy){const t=EX.tiles[i];if(!t)return;EX.tx=rx+wrapD(t.x-rx,EX.W);EX.ty=ry+wrapD(t.y-ry,EX.H);exStart()}
function exOpen(){const t=EX.tiles[EX.focus];if(t)openCreate('custom',{style:t.g[1]})}
function initExplore(){
  const st=EX.stage=$('#exStage');
  st.addEventListener('pointerdown',e=>{if(e.button>0)return;try{st.setPointerCapture(e.pointerId)}catch(_){}
    EX.drag=true;EX.tx=null;EX.vx=EX.vy=0;EX.px=e.clientX;EX.py=e.clientY;EX.pt=performance.now();EX.moved=0;EX.down=e.target.closest('.ex-tile');st.classList.add('drag');exStart()});
  st.addEventListener('pointermove',e=>{if(!EX.drag)return;
    const now=performance.now(),dx=e.clientX-EX.px,dy=e.clientY-EX.py,dt=Math.max(8,now-EX.pt)/1000,rx=1,ry=1;   // kenar yok: sonsuz
    EX.cx-=dx*rx;EX.cy-=dy*ry;
    EX.vx=EX.vx*.7+(-dx*rx/dt)*.3;EX.vy=EX.vy*.7+(-dy*ry/dt)*.3;
    EX.px=e.clientX;EX.py=e.clientY;EX.pt=now;EX.moved+=Math.abs(dx)+Math.abs(dy)});
  const end=e=>{if(!EX.drag)return;EX.drag=false;st.classList.remove('drag');
    if(EX.moved<8&&EX.down){const i=+EX.down.dataset.i;EX.vx=EX.vy=0;if(i===EX.focus)exOpen();else exGoTo(i);return}
    if(performance.now()-EX.pt>80){EX.vx=EX.vy=0}                                   // finger rested before lifting
    const V=3200;EX.vx=clamp(EX.vx,-V,V);EX.vy=clamp(EX.vy,-V,V);
    const px=EX.cx+EX.vx*.3,py=EX.cy+EX.vy*.3;  // kayışı öngör, en yakın karoya otur
    exGoTo(exNearest(px,py),px,py)};
  st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
  st.addEventListener('contextmenu',e=>e.preventDefault());
  let wt;st.addEventListener('wheel',e=>{e.preventDefault();const f=e.deltaMode===1?18:1;EX.tx=null;EX.vx=EX.vy=0;
    EX.cx+=e.deltaX*f*.9;EX.cy+=e.deltaY*f*.9;exStart();
    clearTimeout(wt);wt=setTimeout(()=>exGoTo(exNearest(EX.cx,EX.cy)),150)},{passive:false});
  document.addEventListener('keydown',e=>{if(S.view!=='home'||stack.length||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
    const m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];const f=EX.tiles[EX.focus];
    if(m&&f){e.preventDefault();const fx=EX.cx+wrapD(f.x-EX.cx,EX.W)+m[0]*EX.sx,fy=EX.cy+wrapD(f.y-EX.cy,EX.H)+m[1]*EX.sy;exGoTo(exNearest(fx,fy),fx,fy)}else if(e.key==='Enter'&&f){e.preventDefault();exOpen()}});
  $('#exGo').innerHTML=ic('arrowUp',20);$('#exGo').firstChild.style.transform='rotate(45deg)';$('#exGo').onclick=exOpen;
  let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{exBuild();moveInd()},150)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S.view==='home')exStart()});
  exBuild();exReplay();exStart();
}
$('#cSend').onclick=()=>$('#createBtn').click();
$('#cMode').onclick=()=>{const d=$('#desc').value.trim();if(d&&!$('#style').value.trim()){$('#style').value=styleFromDesc(d);syncChips()}setMode('custom')};
$('#cPlus').onclick=()=>setMode('audio');
$('#cMic').onclick=()=>{setMode('audio');REC.start()};

/* Beat = KIE instrumental:true + beat odaklı stil. KIE limitleri: style ≤1000, prompt ≤3000 (non-custom), title ≤80 */
const beatStyle=st=>{st=(st||'').trim().slice(0,1000-BEAT_TAGS.length-2);return (st?st+', ':'')+BEAT_TAGS};
function simpleReq(d,out){const st=styleFromDesc(d),beat=out==='beat';
  return {url:'/api/music/generate',body:{customMode:false,instrumental:beat,model:S.set.model,prompt:d.slice(0,3000),style:beat?beatStyle(st):st}}}
/* ---------- create modal ---------- */
function setMode(v){S.mode=v;$('#mCreate').dataset.mode=v;$('#mFoot').hidden=v==='simple';$$('#modeTabs button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));$$('[data-pane]').forEach(p=>p.hidden=p.dataset.pane!==v);syncCreate()}
function setOut(v){S.output=v;$$('#outSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));syncCreate()}
function openCreate(tab,o={}){setMode(tab||'simple');setOut(S.output);$('#simpleErr').textContent='';if(o.style){$('#style').value=o.style;syncChips()}if(o.desc){if(tab==='custom'&&!$('#style').value)$('#style').value=styleFromDesc(o.desc);$('#desc').value=o.desc}$('#createErr').textContent='';openLayer($('#mCreate'))}
bindSeg($('#modeTabs'),setMode);bindSeg($('#outSeg'),setOut);
bindSeg($('#genderSeg'),v=>S.gender=v);bindSeg($('#varSeg'),v=>S.variety=+v);
$('#opChips').addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;$$('#opChips .chip').forEach(x=>x.classList.toggle('on',x===b));S.aop=b.dataset.v;syncCreate()});
// Sesten işlemleri → sunucu görev türü
const AOP={cover:{type:'cover',cta:'Cover oluştur',lab:'cover'},extend:{type:'upload-extend',cta:'Uzat',lab:'uzun'},vocals:{type:'add-vocals',cta:'Vokal ekle',lab:'vokal'}};
function syncCreate(){
  const song=S.output==='song',audio=S.mode==='audio',op=AOP[S.aop]||AOP.cover;
  $('#lyrWrap').hidden=!song;$('#genderSeg').style.visibility=song?'visible':'hidden';$('#awWrap').hidden=!song;
  $('#outSeg').hidden=audio&&S.aop==='vocals';      // vokal ekle: sonuç her zaman vokalli
  const aly=audio&&(S.aop==='vocals'||song);$('#aLyrics').hidden=!aly;$('#aLyrics').placeholder=S.aop==='vocals'?'Sözler':'Sözler (isteğe bağlı)';
  $('#createCost').innerHTML=ic('create',14)+(audio?COST[op.type]:COST.generate);
  $('#createBtn span').textContent=audio?op.cta:'Oluştur';
  $('#createErr').textContent='';
}
$('#lyrIdea').onclick=()=>{$('#lyrics').value=pick(LYRICS)};
$('#advBtn').onclick=()=>{const o=$('#adv').hidden;$('#adv').hidden=!o;$('#advBtn').classList.toggle('open',o)};
$('#styleChips').innerHTML=STYLES.map(s=>`<button class="chip" data-s="${esc(s)}">${esc(s)}</button>`).join('');
function syncChips(){const cur=$('#style').value.toLocaleLowerCase('tr').split(',').map(x=>x.trim());$$('#styleChips .chip').forEach(c=>c.classList.toggle('on',cur.includes(c.dataset.s.toLocaleLowerCase('tr'))))}
$('#styleChips').addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;let p=$('#style').value.split(',').map(x=>x.trim()).filter(Boolean);const s=c.dataset.s,i=p.findIndex(x=>x.toLocaleLowerCase('tr')===s.toLocaleLowerCase('tr'));if(i>=0)p.splice(i,1);else p.push(s);$('#style').value=p.join(', ');syncChips()});
$('#style').addEventListener('input',syncChips);
[['sw','swO'],['wc','wcO'],['aw','awO']].forEach(([a,b])=>{const f=()=>$('#'+b).textContent=$('#'+a).value+'%';$('#'+a).addEventListener('input',f);f()});
$('#dur').addEventListener('input',()=>$('#durO').textContent=fmt(+$('#dur').value));

/* ---------- recorder (public/recorder.js) ---------- */
// Kayıt / dosya → dinle, sil ya da kaydet (Firebase Storage: /api/upload). KIE en az 6 sn ister.
async function uploadBlob(blob,name){const fd=new FormData();fd.append('file',blob,name);const r=await api('/api/upload',{method:'POST',body:fd});const j=await r.json().catch(()=>({}));if(!r.ok||!j.success)throw new Error(j.error||'Yükleme başarısız');return j.url}
const REC=createRecorder($('#recCard'),{minSec:6,maxSec:480,label:'Kayıt',upload:uploadBlob,onChange:v=>{S.src=v;$('#createErr').textContent=''}});
let VREC=null;
const recLive=()=>REC.busy()||!!(VREC&&VREC.busy());
function recStop(){REC.stop();REC.pause();if(VREC){VREC.stop();VREC.pause()}}

/* ---------- generation ---------- */
function spend(n){if(S.set.credits<n){toast('Kredi yetersiz');return false}S.set.credits-=n;return true}
function spawn(base,count,cost,req,kind){
  if(!API.live||!req){toast('Sunucuya bağlanılamadı');return []}
  if(cost&&!spend(cost))return [];
  const bases=Array.isArray(base)?base:Array.from({length:count},()=>base),now=Date.now();
  const out=bases.map((b,k)=>{const i=k+1,t=Object.assign({id:uid(),seed:hash(b.title+b.style+now+i+Math.random()),version:i,status:'gen',stage:0,created:now,like:0,model:S.set.model,gender:S.gender,lyrics:'',duration:150},b);if(b.seedFn)t.seed=b.seedFn(i);delete t.seedFn;return t});
  S.lib.unshift(...out.slice().reverse());save();renderAll();
  runLive(out,req,cost,kind);
  return out;
}
/* ---------- live KIE (via backend) ---------- */
// İyimser başlangıç: sağlık kontrolü bitmeden dokunulursa engelleme (sunucu kapalıysa istek hata verir, kredi iade edilir)
const API={live:true};
const find=id=>S.lib.find(x=>x.id===id);
function errMsg(j){const d=j&&j.details&&j.details.fieldErrors;if(d){const k=Object.keys(d)[0];if(k&&d[k][0])return d[k][0]}return (j&&j.error)||'İstek başarısız'}
function liveFail(ids,msg,refund){ids.forEach(id=>{S.lib=S.lib.filter(x=>!(x.id===id&&x.status==='gen'))});if(refund)S.set.credits+=refund;save();renderAll();toast(msg||'Üretim başarısız')}
async function runLive(tracks,req,cost,kind){
  const ids=tracks.slice().sort((a,b)=>a.version-b.version).map(t=>t.id);
  try{const q=typeof req==='function'?await req():req;
    const r=await jpost(q.url,q.body);
    let j={};try{j=await r.json()}catch(e){}
    if(!r.ok||!j.success)throw new Error(errMsg(j));
    ids.forEach(id=>{const t=find(id);if(t){t.taskId=j.task.id;t.providerTaskId=j.task.providerTaskId}});save();
    pollLive(j.task.id,ids,Date.now(),kind);
  }catch(e){liveFail(ids,e.message,cost)}
}
const STAGE_OF={QUEUED:0,TEXT_READY:1,FIRST_READY:3,COMPLETED:4};
const STEM_TR={Vocals:'Vokal',Instrumental:'Enstrüman',Backing_Vocals:'Arka vokal',Drums:'Davul',Bass:'Bas',Guitar:'Gitar',Keyboard:'Klavye',Percussion:'Perküsyon',Strings:'Yaylılar',Synth:'Synth',FX:'Efekt',Brass:'Bakır nefesli',Woodwinds:'Tahta nefesli'};
// Stem sonuçları: ilk yer tutucular doldurulur, fazlası için yeni parça eklenir, artanlar silinir
function applyStems(ids,res){
  const list=res.filter(r=>r.audio_url);if(!list.length)return false;
  const base=find(ids[0]);if(!base)return true;const at=S.lib.indexOf(base);
  const tracks=list.map((r,i)=>{let t=ids[i]&&find(ids[i]);if(!t){t={...base,id:uid(),version:i+1,seed:base.seed+i};S.lib.splice(at+i,0,t)}
    Object.assign(t,{title:(base.ptitle||base.title)+' · '+(STEM_TR[r.stem]||r.stem||'Stem'),style:STEM_TR[r.stem]||r.stem||'stem',audioUrl:r.audio_url,
      output:/Vocal/.test(r.stem||'')?'stemv':'steminst',stem:r.stem,status:'ready',stage:STAGES.length-1});if(r.duration)t.duration=Math.round(r.duration);return t.id});
  S.lib=S.lib.filter(t=>!(ids.includes(t.id)&&!tracks.includes(t.id)));
  toast('Stemler hazır · '+(base.ptitle||base.title));return true;
}
function pollLive(tid,ids,t0,kind){
  const step=async()=>{
    let j;try{j=await (await api('/api/music/tasks/'+tid,{cache:'no-store'})).json()}catch(e){return setTimeout(step,6000)}
    const task=j&&j.task;if(!task)return liveFail(ids,errMsg(j)||'Görev bulunamadı');
    if(task.status==='FAILED')return liveFail(ids,(task.error&&task.error.message)||'Üretim başarısız');
    const res=task.results||[],done=task.status==='COMPLETED';
    if(kind==='stems'){
      ids.forEach(id=>{const t=find(id);if(t)t.stage=Math.max(t.stage,STAGE_OF[task.status]??0)});
      if(done&&!applyStems(ids,res))return liveFail(ids,'Stem bulunamadı');
    }else ids.forEach((id,i)=>{const t=find(id);if(!t)return;t.stage=Math.max(t.stage,STAGE_OF[task.status]??0);
      const r=res[i]||{},url=r.audio_url||r.stream_audio_url;if(!url)return;
      t.audioUrl=url;if(r.image_url)t.image=r.image_url;if(r.duration)t.duration=Math.round(r.duration);if(r.title&&!t.kind)t.title=r.title;if(r.id)t.audioId=r.id;if(r.prompt&&!t.lyrics&&t.output==='song')t.lyrics=r.prompt;
      if(t.status==='gen'){t.status='ready';if(t.version===1)toast('Hazır · '+t.title)}
    });
    if(done)ids.forEach(id=>{S.lib=S.lib.filter(x=>!(x.id===id&&x.status==='gen'))});
    save();renderAll();if(P.cur&&ids.includes(P.cur.id))syncPlayer();
    if(done)return;
    if(Date.now()-t0>15*60e3)return liveFail(ids,'Zaman aşımı');
    setTimeout(step,4000);
  };
  setTimeout(step,3000);
}
// Ses üretmeyen görevler (persona, doğrulama cümlesi, ses klonu) tamamlanana kadar bekle
async function waitTask(tid,timeout=240e3){const t0=Date.now();
  for(;;){await new Promise(r=>setTimeout(r,3000));let j;try{j=await (await api('/api/music/tasks/'+tid,{cache:'no-store'})).json()}catch(e){continue}
    const t=j&&j.task;if(!t)throw new Error(errMsg(j));if(t.status==='COMPLETED')return t;
    if(t.status==='FAILED')throw new Error((t.error&&t.error.message)||'İşlem başarısız');if(Date.now()-t0>timeout)throw new Error('Zaman aşımı')}}
async function detectLive(){
  try{const r=await fetch(apiUrl('/api/health'),{cache:'no-store'});const j=r.ok?await r.json():null;API.live=!!(j&&j.service==='cookrapper')}catch(e){API.live=false}
  const pend=S.lib.filter(t=>t.status==='gen'&&t.taskId);
  if(API.live){const g={};pend.forEach(t=>(g[t.taskId]=g[t.taskId]||[]).push(t));Object.entries(g).forEach(([tid,ts])=>pollLive(tid,ts.sort((a,b)=>a.version-b.version).map(t=>t.id),Date.now(),ts[0].kind==='stem'?'stems':undefined))}
  save();renderAll();renderProfile();
}
function uploader(src){return async()=>src.url||await src.save()}
// Özel mod: seçilen ses karakteri → persona_id + persona_model
function personaPick(){const v=$('#persona').value;if(!v)return {};const [k,id]=v.split(':');return {personaId:id,personaModel:k==='v'?'voice_persona':'style_persona'}}
function renderPersonaSelect(){const sel=$('#persona'),cur=sel.value;
  const p=S.personas.filter(x=>x.personaId&&x.status!=='failed'),vo=S.voices.filter(x=>x.voiceId&&x.status!=='failed');
  sel.innerHTML='<option value="">Ses karakteri: yok</option>'+p.map(x=>`<option value="p:${esc(x.personaId)}">Persona · ${esc(x.name)}</option>`).join('')+vo.map(x=>`<option value="v:${esc(x.voiceId)}">Sesim · ${esc(x.name)}</option>`).join('');
  sel.value=[...sel.options].some(o=>o.value===cur)?cur:'';sel.hidden=!(p.length+vo.length)}
$('#createBtn').onclick=()=>{
  const errEl=S.mode==='simple'?$('#simpleErr'):$('#createErr'),fail=m=>{errEl.textContent=m};errEl.textContent='';let ok=[];const out=S.output,song=out==='song';
  if(S.mode==='simple'){const d=$('#desc').value.trim();if(d.length<3)return fail('Bir şeyler yaz');ok=spawn({title:autoTitle(d),prompt:d,style:styleFromDesc(d),output:out,duration:140+Math.floor(Math.random()*80)},2,COST.generate,simpleReq(d,out))}
  else if(S.mode==='custom'){const st=$('#style').value.trim(),ly=$('#lyrics').value.trim(),title=$('#title').value.trim()||autoTitle(st);if(song&&!ly)return fail('Söz gerekli');if(!st)return fail('Stil gerekli');
    const body={customMode:true,instrumental:!song,model:$('#model').value,title:title.slice(0,80),style:song?st:beatStyle(st),negativeTags:$('#neg').value.trim()||undefined,duration:+$('#dur').value,styleWeight:+$('#sw').value/100,weirdnessConstraint:+$('#wc').value/100,variety:S.variety,...personaPick()};
    if(song)Object.assign(body,{lyrics:ly,vocalGender:S.gender,audioWeight:+$('#aw').value/100});
    ok=spawn({title,style:st,lyrics:song?ly:'',output:out,duration:+$('#dur').value,model:$('#model').value},2,COST.generate,{url:'/api/music/generate',body})}
  else{const src=S.src;if(recLive())return fail('Önce kaydı durdur');if(!src)return fail('Önce ses kaydet ya da yükle');
    if(!$('#aRights').checked)return fail('Kaydın haklarına sahip olduğunu onayla');
    const op=AOP[S.aop]||AOP.cover,vocal=S.aop==='vocals'||song,title=$('#aTitle').value.trim()||'Kaydım',style=$('#aStyle').value.trim(),lyr=$('#aLyrics').value.trim();
    if(S.aop==='vocals'){if(!style)return fail('Stil gerekli');if(!lyr)return fail('Sözler gerekli')}
    const body={taskType:op.type,model:S.set.model,title:title.slice(0,80),style:style||undefined,instrumental:!vocal,lyrics:vocal&&lyr?lyr:undefined};
    if(S.aop==='cover')body.duration=Math.min(360,Math.max(10,Math.round(src.dur||60)));   // yoksa KIE 20 sn üretir
    const up=uploader(src),req=async()=>({url:'/api/music/audio',body:{...body,rightsConfirmed:true,uploadUrl:await up()}});
    ok=spawn({title:`${title} (${op.lab})`,style:style||op.lab,lyrics:vocal?lyr:'',output:vocal?'song':'beat',duration:Math.max(30,Math.round(src.dur||90)+(S.aop==='extend'?60:0))},2,COST[op.type],req)}
  if(ok.length){closeLayer($('#mCreate'));$('#desc').value='';go('library')}
};

/* ---------- rows / library ---------- */
const eq='<span class="eq"><i></i><i></i><i></i><i></i></span>';
const modelTag=t=>(t.model||'V6').replace('_',' ');
function row(t){
  const gen=t.status==='gen',cur=P.cur&&P.cur.id===t.id;
  const sub=gen?`<span class="stage">${STAGES[t.stage]}</span>`:`${esc(KIND[t.output]||'Şarkı')} • ${esc(t.style||modelTag(t))}`;
  return `<div class="song${gen?' is-gen':''}${cur?' is-cur':''}" data-id="${t.id}">
    <button class="thumb cov" data-act="play" aria-label="Oynat">${art(t)}<span class="thumb-ov">${gen?eq:ic(cur&&P.playing?'pause':'play',20)}</span></button>
    <div class="song-body" data-act="open"><div class="song-t"><span class="t">${esc(t.title)}</span>${t.kind==='stem'?'<span class="tag dim">STEM</span>':''}</div>
      <div class="song-s">${sub}</div>${gen?`<div class="prog"><i style="width:${(t.stage+1)/STAGES.length*100}%"></i></div>`:''}</div>
    <span class="dur">${gen?'':fmt(t.duration)}</span>
    <button class="icon-btn" data-act="more" aria-label="Diğer">${ic('more',20)}</button></div>`;
}
function card(t){
  const gen=t.status==='gen',cur=P.cur&&P.cur.id===t.id;
  return `<div class="gcard${gen?' is-gen':''}${cur?' is-cur':''}" data-id="${t.id}">
    <div class="gc-art cov" data-act="open">${art(t)}${gen?`<span class="gc-gen">${eq}<i style="width:${(t.stage+1)/STAGES.length*100}%"></i></span>`:`<button class="gc-play" data-act="play" aria-label="Oynat">${ic(cur&&P.playing?'pause':'play',20)}</button>`}</div>
    <div class="gc-t" data-act="open">${esc(t.title)}</div><div class="gc-s">${gen?esc(STAGES[t.stage]):esc(KIND[t.output]||'Şarkı')+' • '+fmt(t.duration)}</div></div>`;
}
function renderFeed(){if(!$('#feed'))return;$('#feed').innerHTML=S.lib.length?S.lib.slice(0,6).map(row).join(''):'<div class="empty">İlk şarkını oluştur</div>'}
const CATS=[['like','Beğenilenler'],['song','Vokal'],['beat','Beat'],['stem','Stem']];
function renderCats(){$('#cats').innerHTML=(S.filter!=='all'?`<button class="chip x" data-cat="all" aria-label="Temizle">${ic('close',16)}</button>`:'')+CATS.filter(([k])=>S.filter==='all'||S.filter===k).map(([k,l])=>`<button class="chip${S.filter===k?' on':''}" data-cat="${k}">${l}</button>`).join('')}
$('#cats').addEventListener('click',e=>{const c=e.target.closest('[data-cat]');if(!c)return;S.filter=c.dataset.cat===S.filter?'all':c.dataset.cat;renderLib()});
function match(t,f){return f==='all'||(f==='like'?t.like===1:f==='stem'?t.kind==='stem':t.output===f)}
function libItems(){const q=S.q.toLocaleLowerCase('tr');let it=S.lib.filter(t=>match(t,S.filter)&&(!q||(t.title+' '+t.style).toLocaleLowerCase('tr').includes(q)));if(S.sort==='old')it=[...it].reverse();return it}
function renderLib(){
  const it=libItems(),grid=S.set.libView==='grid',q=S.q.trim();
  renderCats();$('#sortBtn').innerHTML=ic('sort',16)+(S.sort==='new'?'En yeni':'En eski');$('#viewBtn').innerHTML=ic(grid?'list':'grid',20);
  const liked=S.lib.filter(t=>t.like===1).length;
  const pin=S.filter==='all'&&!q&&!grid?`<button class="song pin" id="pinLiked"><span class="thumb liked">${ic('like',24)}</span><div class="song-body"><div class="song-t"><span class="t">Beğenilen şarkılar</span></div><div class="song-s">Liste • ${liked} şarkı</div></div></button>`:'';
  const L=$('#libList');L.classList.toggle('lgrid',grid);
  L.innerHTML=it.length?pin+it.map(grid?card:row).join(''):pin+`<div class="empty">${S.filter==='like'&&!q?'Beğendiğin şarkılar burada görünür':S.lib.length?'Sonuç yok':'Kütüphane boş'}</div>`;
}
$('#libList').addEventListener('click',e=>{if(e.target.closest('#pinLiked')){S.filter='like';renderLib()}});
$('#sortBtn').onclick=()=>{S.sort=S.sort==='new'?'old':'new';renderLib()};
$('#viewBtn').onclick=()=>{S.set.libView=S.set.libView==='grid'?'list':'grid';save();renderLib()};
$('#searchBtn').onclick=()=>{const r=$('#searchRow');r.hidden=!r.hidden;if(!r.hidden)$('#q').focus();else{$('#q').value='';S.q='';renderLib()}};
$('#q').addEventListener('input',e=>{S.q=e.target.value;renderLib()});
// sadece durum değişince satırları güncelle (yeniden çizmeden → kapaklar titremez)
function markRows(){$$('#libList [data-id],#feed [data-id]').forEach(el=>{const cur=!!(P.cur&&P.cur.id===el.dataset.id);el.classList.toggle('is-cur',cur);
  const o=el.querySelector('.thumb-ov,.gc-play');if(o&&!el.classList.contains('is-gen')){const want=cur&&P.playing?'pause':'play';if(o.dataset.ic!==want){o.innerHTML=ic(want,20);o.dataset.ic=want}}})}
function renderAll(){renderFeed();if(S.view==='library')renderLib();if(S.view==='profile')renderProfile();$$('.cr').forEach(c=>c.textContent=S.set.credits);syncMini()}
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const s=a.closest('[data-id]');if(!s||!s.closest('#libList,#feed'))return;const t=S.lib.find(x=>x.id===s.dataset.id);if(!t)return;
  const list=s.closest('#libList,#feed'),ids=[...list.querySelectorAll('[data-id]')].map(x=>x.dataset.id),name=list.id==='feed'?'Son üretilenler':S.filter==='like'?'Beğenilen şarkılar':'Kütüphane';
  if(a.dataset.act==='play')play(t.id,false,ids,name);if(a.dataset.act==='open')play(t.id,true,ids,name);if(a.dataset.act==='more')openMenu(t.id)});

/* uzun bas → parça menüsü */
(()=>{let tm=0,sx=0,sy=0,fired=false;const lists='#libList,#feed';
  document.addEventListener('pointerdown',e=>{const s=e.target.closest('[data-id]');if(!s||!s.closest(lists))return;fired=false;sx=e.clientX;sy=e.clientY;clearTimeout(tm);
    tm=setTimeout(()=>{fired=true;if(navigator.vibrate)try{navigator.vibrate(8)}catch(_){}openMenu(s.dataset.id)},480)},{passive:true});
  document.addEventListener('pointermove',e=>{if(tm&&Math.hypot(e.clientX-sx,e.clientY-sy)>10){clearTimeout(tm);tm=0}},{passive:true});
  ['pointerup','pointercancel','scroll'].forEach(ev=>document.addEventListener(ev,()=>{clearTimeout(tm);tm=0},{passive:true,capture:true}));
  document.addEventListener('click',e=>{if(fired&&e.target.closest(lists)){e.stopPropagation();e.preventDefault();fired=false}},true);
  document.addEventListener('contextmenu',e=>{if(e.target.closest(lists))e.preventDefault()})})();
/* ---------- sheet / menu ---------- */
function openSheet(html){const sh=$('#sheet');sh.innerHTML='<div class="grab" id="shGrab"></div>'+html;openLayer(sh);swipeClose($('#shGrab'),sh)}
// araç uygunluğu: bu parça bu araçla işlenebilir mi?
function toolFits(key,t){const T=TOOLS[key];if(!T||!t)return false;const f=(T.f||[]).find(x=>x.k==='src');if(!f)return true;
  return f.only==='inst'?!isVocal(t):f.only==='song'?t.output==='song':f.only==='nostem'?!t.kind:true}
function openMenu(id){
  const t=findT(id);if(!t)return;const ready=t.status==='ready',live=!!(API.live&&t.audioId);
  const tools=['extend','cover','vocals','stems','replace','persona'].filter(k=>toolFits(k,t));
  const cost=k=>{const c=TOOLS[k].cost;return c?`<small>${c}</small>`:''};
  openSheet(`<div class="tm-head"><span class="thumb cov">${art(t)}</span><div><b>${esc(t.title)}</b><small>${esc(KIND[t.output]||'Şarkı')} • ${modelTag(t)}${t.duration?' • '+fmt(t.duration):''}</small></div></div>
    <div class="tm-quick">
      <button class="tm-q${t.like===1?' on':''}" data-m="like" ${ready?'':'disabled'}>${ic(t.like===1?'like':'heart',22)}<span>${t.like===1?'Beğenildi':'Beğen'}</span></button>
      <button class="tm-q" data-m="next" ${ready?'':'disabled'}>${ic('queue',22)}<span>Sonra çal</span></button>
      <button class="tm-q" data-m="share" ${ready?'':'disabled'}>${ic('share',22)}<span>Paylaş</span></button>
    </div>
    <div class="tm-sec">Stüdyo'ya gönder</div>
    <div class="tm-tools">${tools.map(k=>`<button class="tm-t" data-m="${k}" ${ready?'':'disabled'}>${ic(TOOLS[k].ic,22)}<span>${TOOLS[k].n}</span>${cost(k)}</button>`).join('')}</div>
    ${live?'':`<p class="tm-note">${ready?'Stüdyo işlemleri sunucuya bağlıyken çalışır.':'Parça hâlâ üretiliyor.'}</p>`}
    <div class="menu"><button data-m="play" ${ready?'':'disabled'}>${ic('play',22)}Oynat</button>${t.audioUrl?`<button data-m="download">${ic('download',22)}İndir</button>`:''}<button data-m="report">${ic('flag',22)}Bildir</button><button class="del" data-m="delete">${ic('trash',22)}Sil</button></div>`);
  $('#sheet').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const m=b.dataset.m;
    if(m==='like'){setLike(t,1);b.classList.toggle('on',t.like===1);b.innerHTML=`${ic(t.like===1?'like':'heart',22)}<span>${t.like===1?'Beğenildi':'Beğen'}</span>`;return}
    closeLayer($('#sheet'));
    if(m==='play')play(id,true);else if(m==='next')playNext(t);else if(m==='share')share(t);else if(m==='download')download(t);
    else if(m==='delete')removeTrack(t);
    else if(m==='report')openReport(t);
    else{if(!live)return toast(ready?'Stüdyo işlemleri sunucuya bağlıyken çalışır.':'Hâlâ üretiliyor');if($('#fp').classList.contains('open'))closeLayer($('#fp'));openTool(m,id)}});
}
function playNext(t){
  if(!P.cur||!hasMedia()){play(t.id,false,[t.id]);return}
  if(P.cur.id===t.id)return toast('Şu an çalıyor');
  let qi=P.qids.indexOf(t.id);if(qi<0){P.qids.push(t.id);qi=P.qids.length-1}
  const at=P.order.indexOf(qi);if(at>=0){P.order.splice(at,1);if(at<=P.pos)P.pos--}
  P.order.splice(P.pos+1,0,qi);syncPlayer();toast('Sıraya eklendi');
}
// silme: hemen kaldır, 5 sn "Geri al"
let snackT,undoBuf=null;
function snack(msg,act,fn){const s=$('#snack');$('#snackMsg').textContent=msg;$('#snackAct').textContent=act||'';$('#snackAct').hidden=!act;$('#snackAct').onclick=()=>{s.classList.remove('show');clearTimeout(snackT);fn&&fn()};
  s.classList.add('show');clearTimeout(snackT);snackT=setTimeout(()=>s.classList.remove('show'),5000)}
function removeTrack(t){
  const idx=S.lib.indexOf(t);if(idx<0)return;if(P.cur&&P.cur.id===t.id)stopAll();
  S.lib.splice(idx,1);save();renderAll();undoBuf={t,idx};
  snack('Silindi','Geri al',()=>{if(!undoBuf)return;S.lib.splice(Math.min(undoBuf.idx,S.lib.length),0,undoBuf.t);undoBuf=null;save();renderAll()});
}
// İçerik bildirimi (Google Play yapay zekâ içerik kuralı): /api/report → Firestore reports (inceleme kuyruğu)
const REPORT_WHY=[['offensive','Nefret söylemi, şiddet ya da saldırgan içerik'],['sexual','Cinsel ya da uygunsuz içerik'],['copyright','Telif hakkı ihlali'],['impersonation','Başka birinin sesini ya da kimliğini taklit'],['other','Başka bir sebep']];
function openReport(t){
  openSheet(`<div class="tm-head"><span class="thumb cov">${art(t)}</span><div><b>${esc(t.title)}</b><small>İçeriği bildir</small></div></div>
    <div class="rp">${REPORT_WHY.map(([v,l],i)=>`<label class="chk rp-o"><input type="radio" name="rpWhy" value="${v}" ${i?'':'checked'}><span>${l}</span></label>`).join('')}
    <textarea class="ta" id="rpNote" rows="3" maxlength="500" placeholder="Açıklama (isteğe bağlı)"></textarea>
    <div class="err" id="rpErr"></div><button class="primary" id="rpGo"><span>Bildir</span></button>
    <p class="hint">Bildirimler 24 saat içinde incelenir. Kural dışı içerik kaldırılır.</p></div>`);
  $('#rpGo').onclick=async()=>{const go=$('#rpGo'),why=$('#sheet input[name=rpWhy]:checked')?.value||'other';go.disabled=true;$('#rpErr').textContent='';
    try{const r=await jpost('/api/report',{taskId:t.providerTaskId||t.taskId||undefined,audioId:t.audioId||undefined,title:(t.title||'').slice(0,120),reason:why,note:$('#rpNote').value.trim()||undefined});
      const j=await r.json().catch(()=>({}));if(!r.ok||!j.success)throw new Error(errMsg(j));
      t.reported=Date.now();save();closeLayer($('#sheet'));
      snack('Bildirimin alındı. Teşekkürler.','Kütüphaneden kaldır',()=>removeTrack(t));
    }catch(e){$('#rpErr').textContent=e.message||'Gönderilemedi';go.disabled=false}};
}
function setLike(t,v){t.like=t.like===v?0:v;save();renderAll();syncPlayer()}
async function share(t){const r=await CR.share({title:t.title,text:`${t.title} — CookRapper ile üretildi`,url:t.audioUrl||undefined});if(r==='copied')toast('Bağlantı kopyalandı');else if(r==='failed')toast('Paylaşılamadı')}
async function download(t){if(!t.audioUrl)return toast('Bu parçanın sesi hazır değil');toast('Hazırlanıyor…');try{const r=await CR.save(t.audioUrl,t.title);if(r==='downloaded')toast('İndirildi')}catch(e){toast('Kaydedilemedi')}}
async function copy(txt){try{await navigator.clipboard.writeText(txt);toast('Kopyalandı')}catch(e){toast('Kopyalanamadı')}}

/* ---------- studio / tools ---------- */
// Her araç KIE işlemine birebir: docs.kie.ai/suno-api/*  (sunucu: lib/kieInputBuilder.ts)
const TOOLS={
  extend:{n:'Uzat',ic:'extend',cta:'Uzat',get cost(){return COST.extend},f:[{k:'src'},{k:'at',t:'range',l:'Devam noktası',min:5,max:240,v:60},{k:'style',t:'text',ph:'Stil (boş: aynı stil)'}]},
  cover:{n:'Cover',ic:'cover',cta:'Cover oluştur',get cost(){return COST.cover},f:[{k:'src'},{k:'style',t:'text',ph:'Yeni stil'},{k:'gender',t:'seg',o:[['m','Erkek'],['f','Kadın']]}]},
  vocals:{n:'Vokal ekle',ic:'vocals',cta:'Vokal ekle',get cost(){return COST['add-vocals']},f:[{k:'src',only:'inst'},{k:'lyrics',t:'area',ph:'Sözler'},{k:'gender',t:'seg',o:[['m','Erkek'],['f','Kadın']]}]},
  stems:{n:'Stem ayır',ic:'stems',cta:'Ayır',get cost(){return COST['remove-vocals']},f:[{k:'src',only:'nostem'},{k:'type',t:'seg',o:[['separate_vocal','Vokal + enstrüman'],['split_stem','Tüm enstrümanlar']]}]},
  replace:{n:'Bölüm değiştir',ic:'scissors',cta:'Yeniden üret',get cost(){return COST['replace-section']},f:[{k:'src'},{k:'range2'},{k:'lyrics',t:'area',ph:'Yeni bölümün sözleri',only:'song'},{k:'full',t:'area',ph:'Şarkının tüm sözleri (düzenlenmiş)',only:'song'}]},
  persona:{n:'Persona',ic:'persona',cta:'Persona oluştur',cost:0,f:[{k:'src',only:'song'},{k:'name',t:'text',ph:'Persona adı'}]},
  voice:{n:'Ses klonu',ic:'voice',cta:'Devam',cost:0,f:[{k:'name',t:'text',ph:'Ses adı'},{k:'rec'},{k:'consent',t:'check',l:'Bu ses bana ait ya da sahibinden açık yazılı iznim var. Başka birini taklit etmek için kullanmayacağım.'}]},
  record:{n:'Kayıttan',ic:'mic',go:()=>openCreate('audio')}
};
const isVocal=t=>t.output==='song'||t.output==='stemv';
function srcOptions(only,sel){return S.lib.filter(t=>t.status==='ready'&&t.audioId&&(only==='inst'?!isVocal(t):only==='song'?t.output==='song':only==='nostem'?!t.kind:true)).map(t=>`<option value="${t.id}" ${t.id===sel?'selected':''}>${esc(t.title)} · v${t.version}</option>`).join('')}
function fieldHTML(f,sel){
  if(f.k==='src'){const L=S.lib.filter(t=>t.status==='ready'&&t.audioId&&(f.only==='inst'?!isVocal(t):f.only==='song'?t.output==='song':f.only==='nostem'?!t.kind:true));
    if(!L.length)return '<div class="empty" style="padding:18px 0">Uygun parça yok — önce bir şarkı üret</div>';
    const cur=L.some(t=>t.id===sel)?sel:L[0].id;
    return `<div class="sp-lbl">Parça seç</div><input type="hidden" name="src" value="${cur}"><div class="scroll-x sp-row">${L.map(t=>`<button type="button" class="sp${t.id===cur?' on':''}" data-sp="${t.id}"><span class="sp-a cov">${art(t)}</span><b>${esc(t.title)}</b><small>${esc(KIND[t.output]||'')} • ${fmt(t.duration)}</small></button>`).join('')}</div>`}
  if(f.k==='range2')return `<div class="row2"><label class="fl">Başlangıç (sn)<input class="inp" type="number" name="from" value="30" min="0" step="1" inputmode="numeric"></label><label class="fl">Bitiş (sn)<input class="inp" type="number" name="to" value="45" min="0" step="1" inputmode="numeric"></label></div>`;
  if(f.k==='rec')return '<div class="phrase" id="vPhrase" hidden></div><div id="vRec"></div><p class="hint" id="vHint">10–60 sn şarkı söyle ya da rap yap. Arka plan sessiz olsun.</p>';
  const only=f.only?` data-only="${f.only}"`:'';
  if(f.t==='check')return `<label class="chk"><input type="checkbox" name="${f.k}"><span>${esc(f.l)}</span></label>`;
  if(f.t==='text')return `<input class="inp" name="${f.k}" placeholder="${esc(f.ph)}" maxlength="80">`;
  if(f.t==='area')return `<textarea class="ta" name="${f.k}" rows="4" placeholder="${esc(f.ph)}" maxlength="5000"${only}></textarea>`;
  if(f.t==='range')return `<label class="sl">${f.l}<output>${fmt(f.v)}</output><input type="range" name="${f.k}" min="${f.min}" max="${f.max}" value="${f.v}" oninput="this.previousElementSibling.textContent=fmt(+this.value)"></label>`;
  if(f.t==='seg')return `<div class="seg" name="${f.k}" data-val="${f.o[0][0]}">${f.o.map((o,i)=>`<button type="button" data-v="${o[0]}" class="${i?'':'on'}">${o[1]}</button>`).join('')}</div>`;
  return '';
}
const V={step:1,phraseTask:'',busy:false}; // ses klonu sihirbazı
function toolCost(key){const T=TOOLS[key];if(key==='stems'&&$('#toolBody [name=type]')?.dataset.val==='split_stem')return COST['split-stem'];return T.cost}
function setToolGo(key,label){const c=toolCost(key);$('#toolGo').innerHTML=`<span>${label||TOOLS[key].cta}</span>${c?`<span class="cost">${ic('create',14)}${c}</span>`:''}`}
// Seçili parçaya göre alanları uyarla (uzat: devam noktası ≤ süre; bölüm değiştir: sözler)
function syncTool(key){const b=$('#toolBody'),t=find(b.querySelector('[name=src]')?.value);if(!t)return;
  if(key==='extend'){const r=b.querySelector('[name=at]'),max=Math.max(6,Math.floor((t.duration||60)-1));r.max=max;if(+r.value>max)r.value=Math.floor(max*.8);r.previousElementSibling.textContent=fmt(+r.value)}
  if(key==='replace'){b.querySelectorAll('[data-only=song]').forEach(x=>x.hidden=!isVocal(t));const f=b.querySelector('[name=full]');if(f&&!f.dataset.touched)f.value=t.lyrics||'';
    const d=Math.floor(t.duration||60),to=b.querySelector('[name=to]'),fr=b.querySelector('[name=from]');fr.max=to.max=d;if(+to.value>d){fr.value=Math.max(0,Math.floor(d*.3));to.value=Math.min(d,+fr.value+Math.min(30,Math.floor(d*.45)))}}}
function openTool(key,srcId){
  const T=TOOLS[key];if(T.go)return T.go();
  if(!API.live)return toast('Sunucuya bağlanılamadı');
  $('#toolTitle').textContent=T.n;$('#toolBody').innerHTML=T.f.map(f=>fieldHTML(f,srcId)).join('');$('#toolErr').textContent='';
  $('#toolBody').querySelectorAll('.seg').forEach(sg=>bindSeg(sg,v=>{sg.dataset.val=v;setToolGo(key)}));
  $('#toolBody').querySelector('[name=src]')?.addEventListener('change',()=>syncTool(key));
  $('#toolBody').querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{const inp=$('#toolBody [name=src]');if(inp.value===b.dataset.sp)return;inp.value=b.dataset.sp;
    $$('#toolBody .sp').forEach(x=>x.classList.toggle('on',x===b));inp.dispatchEvent(new Event('change'))});
  requestAnimationFrame(()=>{const on=$('#toolBody .sp.on');if(on)on.scrollIntoView({inline:'center',block:'nearest'})});
  $('#toolBody').querySelector('[name=full]')?.addEventListener('input',e=>e.target.dataset.touched=1);
  syncTool(key);setToolGo(key);
  if(key==='voice'){V.step=1;V.phraseTask='';VREC=createRecorder($('#vRec'),{minSec:10,maxSec:60,label:'Ses örneği',upload:uploadBlob})}
  $('#toolGo').disabled=false;$('#toolGo').onclick=()=>runTool(key);openLayer($('#mTool'));
}
async function runTool(key){
  const b=$('#toolBody'),v=k=>{const el=b.querySelector(`[name="${k}"]`);return el?(el.dataset.val??el.value):''},fail=m=>{$('#toolErr').textContent=m};
  $('#toolErr').textContent='';
  if(key==='voice')return runVoice(v('name').trim(),fail);
  const src=find(v('src'));if(TOOLS[key].f.some(f=>f.k==='src')&&!src)return fail('Önce bir parça üret');
  if(!src.audioId||!src.providerTaskId)return fail('Bu parça bu işlem için uygun değil');
  const vocal=isVocal(src),base={style:src.style,output:src.output,lyrics:src.lyrics,gender:src.gender,duration:src.duration,parent:src.id,image:undefined,model:src.model};
  const A=body=>({url:'/api/music/audio',body:Object.assign({model:src.model||'V6',title:src.title},body)});let ok=[];
  if(key==='extend'){const at=+v('at');if(!(at>0&&at<(src.duration||1e9)))return fail('Devam noktası parça süresinden kısa olmalı');
    ok=spawn({...base,title:src.title+' (uzun)',style:v('style')||src.style,duration:at+120,seedFn:i=>src.seed+i},2,COST.extend,A({taskType:'extend',audioId:src.audioId,continueAt:at,instrumental:!vocal,style:v('style')||src.style}))}
  else if(key==='cover'){const st=v('style')||src.style;
    ok=spawn({...base,title:src.title+' (cover)',style:st,gender:v('gender')},2,COST.cover,A({taskType:'cover',uploadUrl:src.audioUrl,sourceTaskId:src.providerTaskId,style:st,instrumental:!vocal,lyrics:vocal&&src.lyrics?src.lyrics:undefined,vocalGender:vocal?v('gender'):undefined,duration:Math.min(360,Math.max(10,Math.round(src.duration||120)))}))}
  else if(key==='vocals'){const ly=v('lyrics').trim();if(!ly)return fail('Sözler gerekli');
    ok=spawn({...base,title:src.title+' (vokal)',output:'song',lyrics:ly,gender:v('gender'),seedFn:()=>src.seed},2,COST['add-vocals'],A({taskType:'add-vocals',uploadUrl:src.audioUrl,sourceTaskId:src.providerTaskId,lyrics:ly,vocalGender:v('gender'),style:src.style||'hip hop'}))}
  else if(key==='stems'){const type=v('type'),cost=type==='split_stem'?COST['split-stem']:COST['remove-vocals'];
    const ph=[['Vocals','stemv'],['Instrumental','steminst']].map(([st,o])=>({...base,title:src.title+' · '+STEM_TR[st],ptitle:src.title,style:STEM_TR[st],output:o,kind:'stem',seedFn:()=>src.seed}));
    ok=spawn(ph,0,cost,A({taskType:'remove-vocals',taskId:src.providerTaskId,audioId:src.audioId,stemType:type}),'stems')}
  else if(key==='replace'){const a=+v('from'),z=+v('to'),d=src.duration||0;
    if(!(z-a>=10))return fail('Bölüm en az 10 saniye olmalı');if(z>d)return fail('Bitiş parça süresini aşıyor');if(z-a>d*.5)return fail('Bölüm, şarkının yarısından uzun olamaz');
    const pr=vocal?v('lyrics').trim():'[Instrumental]',full=vocal?v('full').trim():'[Instrumental]';if(vocal&&!pr)return fail('Yeni bölümün sözleri gerekli');if(vocal&&!full)return fail('Şarkının tüm sözleri gerekli');
    ok=spawn({...base,title:src.title+' (düzenli)',lyrics:vocal?full:'',seedFn:i=>src.seed+10+i},2,COST['replace-section'],A({taskType:'replace-section',taskId:src.providerTaskId,audioId:src.audioId,infillStartS:a,infillEndS:z,prompt:pr,fullLyrics:full,style:src.style||'hip hop'}))}
  else if(key==='persona'){const name=v('name').trim();if(!name)return fail('Ad gerekli');
    const go=$('#toolGo');go.disabled=true;setToolGo(key,'Oluşturuluyor…');
    try{const pid=uid(),r=await jpost('/api/persona',{id:pid,seed:src.seed,taskId:src.providerTaskId,audioId:src.audioId,name,style:src.style});const j=await r.json().catch(()=>({}));if(!r.ok||!j.success)throw new Error(errMsg(j));
      if(!S.personas.some(p=>p.id===pid))S.personas.unshift({id:pid,name,seed:src.seed,status:j.persona.personaId?'ready':'pending',personaId:j.persona.personaId||null});
      save();renderStudio();closeLayer($('#mTool'));toast('Persona hazırlanıyor');
      if(!j.persona.personaId)waitTask(j.persona.providerTaskId).then(()=>toast('Persona hazır · '+name)).catch(e=>toast('Persona: '+e.message));
    }catch(e){fail(e.message);go.disabled=false;setToolGo(key)}
    return}
  if(ok.length){closeLayer($('#mTool'));if($('#fp').classList.contains('open'))closeLayer($('#fp'));go('library')}
}
// Ses klonu: 1) ses örneği → KIE doğrulama cümlesi  2) cümleyi oku → ses oluştur (voiceId)
async function runVoice(name,fail){
  if(V.busy)return;if(!name)return fail('Ses adı gerekli');if(VREC.busy())return fail('Önce kaydı durdur');
  if(!$('#toolBody [name=consent]')?.checked)return fail('Sesin sana ait olduğunu onayla');
  const src=VREC.src();if(!src)return fail(V.step===1?'Önce ses örneği kaydet':'Önce cümleyi okuyup kaydet');
  const go=$('#toolGo');V.busy=true;go.disabled=true;setToolGo('voice',V.step===1?'Cümle hazırlanıyor…':'Gönderiliyor…');
  try{const url=src.url||await src.save();
    if(V.step===1){
      const r=await jpost('/api/voice/phrase',{consent:true,voiceUrl:url,vocalStart:0,vocalEnd:Math.max(1,Math.min(30,Math.floor(src.dur||10)))});const j=await r.json().catch(()=>({}));if(!r.ok||!j.success)throw new Error(errMsg(j));
      const t=await waitTask(j.task.id,180e3),phrase=t.extra&&t.extra.phrase;if(!phrase)throw new Error('Doğrulama cümlesi alınamadı');
      V.step=2;V.phraseTask=j.task.id;
      $('#vPhrase').hidden=false;$('#vPhrase').innerHTML=`<small>Bu cümleyi kendi sesinle oku ya da söyle</small><b>${esc(phrase)}</b>`;
      $('#vHint').textContent='Cümlenin tamamını net bir sesle kaydet.';$('#toolBody [name=name]').disabled=true;
      VREC=createRecorder($('#vRec'),{minSec:3,maxSec:60,label:'Doğrulama',upload:uploadBlob});
    }else{
      const r=await jpost('/api/voice',{consent:true,id:uid(),validationTaskId:V.phraseTask,verifyUrl:url,voiceName:name});const j=await r.json().catch(()=>({}));if(!r.ok||!j.success)throw new Error(errMsg(j));
      closeLayer($('#mTool'));toast('Ses klonu hazırlanıyor');
      waitTask(j.task.id,300e3).then(()=>toast('Ses klonu hazır · '+name)).catch(e=>toast('Ses klonu: '+e.message));
    }
  }catch(e){fail(e.message)}
  finally{V.busy=false;go.disabled=false;setToolGo('voice',V.step===2?'Sesi oluştur':'Devam')}
}
function renderStudio(){
  $('#tools').innerHTML=Object.entries(TOOLS).map(([k,T])=>`<button class="tool" data-tool="${k}"><span class="art">${coverSVG(hash('t'+k))}</span><span class="ti">${ic(T.ic,22)}</span><b>${T.n}</b></button>`).join('');
  const st=p=>p.status==='failed'?'<small class="st bad">Başarısız</small>':p.status==='pending'?'<small class="st">Hazırlanıyor</small>':'';
  const sec=(h,a)=>a.length?`<div class="sec"><h2>${h}</h2></div><div class="people">${a.map(p=>`<div class="person"><span class="av">${coverSVG(p.seed||hash(p.id))}</span>${esc(p.name)}${st(p)}</div>`).join('')}</div>`:'';
  $('#peopleWrap').innerHTML=sec('Personalar',S.personas)+sec('Seslerim',S.voices);
  renderPersonaSelect();
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-tool]');if(t)openTool(t.dataset.tool)});

/* ---------- profile ---------- */
function renderProfile(){$('#pCount').textContent=S.lib.length+' parça';$('#pMode').innerHTML=API.live?'<span class="live-dot"></span>Stüdyo çevrimiçi':'Sunucuya bağlı değil';$('#meter').style.width=Math.min(100,S.set.credits/MAX*100)+'%'}
bindSeg($('#themeSeg'),v=>{S.set.theme=v;applyTheme();save()});
function applyTheme(){const t=S.set.theme;if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',t);$$('#themeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===t))}
$('#defModel').value=S.set.model;$('#model').value=S.set.model;
$('#defModel').addEventListener('change',e=>{S.set.model=e.target.value;$('#model').value=e.target.value;save()});
/* ---------- audio engine ---------- */
const P={el:null,off:0,playing:false,cur:null,raf:0,shuffle:false,repeat:false,lyrLines:0,lyrIdx:-1};
// Yalnız gerçek ses dosyası çalınır (KIE / Firebase Storage). Sesi olmayan parça çalınmaz.

/* ---------- player: sıra, karıştır, tekrar ---------- */
const findT=id=>S.lib.find(x=>x.id===id);
const PL={tok:0,lastNp:null,lastMini:null,bg:0,tint:''};
P.repeat='off';P.qids=[];P.order=[];P.pos=-1;P.ctxName='Kütüphane';
const okAt=k=>{const t=findT(P.qids[P.order[k]]);return !!(t&&t.status==='ready')};
function buildOrder(curId){
  const n=P.qids.length,idx=[...Array(n).keys()],ci=P.qids.indexOf(curId);
  if(P.shuffle){const rest=idx.filter(i=>i!==ci);for(let i=rest.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]]}P.order=ci>=0?[ci,...rest]:rest;P.pos=0}
  else{P.order=idx;P.pos=Math.max(0,ci)}
}
function setContext(ids,name,curId){P.qids=ids.filter(id=>{const t=findT(id);return t&&t.status==='ready'});if(!P.qids.includes(curId))P.qids.unshift(curId);P.ctxName=name||'Kütüphane';buildOrder(curId)}
function upcoming(n){const out=[];for(let k=P.pos+1;k<P.order.length&&out.length<n;k++)if(okAt(k))out.push({t:findT(P.qids[P.order[k]]),k});return out}
async function play(id,openFull,ctxIds,ctxName){
  const t=findT(id);if(!t)return;if(t.status!=='ready'){toast('Hâlâ üretiliyor');return}
  if(P.cur&&P.cur.id===id&&hasMedia()){if(ctxIds)setContext(ctxIds,ctxName,id);if(openFull){if(!P.playing)toggle();openPlayer()}else toggle();return}
  setContext(ctxIds||S.lib.map(x=>x.id),ctxName,id);
  if(openFull)openPlayer();
  load(t,0);
}
function goPos(k,dir){P.pos=k;load(findT(P.qids[P.order[k]]),dir)}
function next(auto){
  if(!P.cur)return;
  if(auto&&P.repeat==='one')return restart();
  let k=P.pos+1;while(k<P.order.length&&!okAt(k))k++;
  if(k>=P.order.length){
    if(P.repeat==='all'&&P.order.length){if(P.shuffle)buildOrder(null);k=0;while(k<P.order.length&&!okAt(k))k++;if(k>=P.order.length)return}
    else{if(auto){P.off=0;if(isEl())P.el.currentTime=0;P.playing=false;syncIcons();tick()}else toast('Sıranın sonu');return}
  }
  goPos(k,1);
}
function prev(force){
  if(!P.cur)return;
  if(!force&&pos()>3){seek(0);return}
  let k=P.pos-1;while(k>=0&&!okAt(k))k--;
  if(k<0&&P.repeat==='all'){k=P.order.length-1;while(k>=0&&!okAt(k))k--}
  if(k<0){seek(0);return}
  goPos(k,-1);
}
function restart(){seek(0);if(!P.playing)toggle()}
async function load(t,dir){
  if(!t)return;const tok=++PL.tok;
  stopSrc();P.cur=t;P.off=0;P.playing=false;
  syncMini(dir);syncPlayer(dir);setLoading(true);tick();
  if(t.audioUrl){const el=P.el||(P.el=mkEl());el.src=t.audioUrl;try{await el.play()}catch(e){if(tok===PL.tok){setLoading(false);P.playing=false;syncIcons()}}if(tok===PL.tok)mediaSession();return}
  setLoading(false);P.playing=false;syncIcons();if(tok===PL.tok)toast('Bu parçanın sesi hazır değil');
}
function mkEl(){const el=new Audio();el.preload='auto';el.playsInline=true;
  el.addEventListener('playing',()=>{if(!isEl())return;P.playing=true;setLoading(false);loop()});
  el.addEventListener('pause',()=>{if(!isEl())return;P.playing=false;syncIcons()});
  el.addEventListener('waiting',()=>{if(isEl())setLoading(true)});
  el.addEventListener('ended',()=>{if(!isEl())return;P.playing=false;syncIcons();next(true)});
  el.addEventListener('error',()=>{if(!isEl()||!el.getAttribute('src'))return;const id=P.cur.id;setLoading(false);toast('Çalınamadı, sıradakine geçiliyor');setTimeout(()=>{if(P.cur&&P.cur.id===id)next(true)},900)});
  return el}
const isEl=()=>!!(P.el&&P.cur&&P.cur.audioUrl);
const hasMedia=()=>isEl();
const dur=()=>isEl()&&isFinite(P.el.duration)?P.el.duration:0;
function stopSrc(){if(P.el&&!P.el.paused)P.el.pause()}
function stopAll(){PL.tok++;stopSrc();if(P.el)P.el.removeAttribute('src');P.playing=false;P.cur=null;syncMini();closeLayer($('#fp'))}
function pos(){return isEl()?(P.el.currentTime||0):0}
function toggle(){if(!isEl())return;if(P.el.paused)P.el.play().catch(()=>{});else P.el.pause()}
function seek(p){p=Math.max(0,Math.min(.999,p));if(!isEl())return;const d=dur();if(d)P.el.currentTime=p*d;tick()}
function loop(){cancelAnimationFrame(P.raf);const f=()=>{tick();if(P.playing)P.raf=requestAnimationFrame(f)};f()}
let msT=0;
function tick(){
  const d=dur(),t=pos(),p=d?t/d:0,w=(p*100).toFixed(2)+'%';
  $('#miniProg').style.width=w;$('#fpFill').style.width=w;$('#lfFill').style.width=w;
  const c=fmt(t),dd=d?fmt(d):'-:--';$('#fpCur').textContent=c;$('#fpDur').textContent=dd;$('#lfCur').textContent=c;$('#lfDur').textContent=dd;
  if(L.words.length)lyrTick(t);
  else if(P.lyrLines){const i=Math.min(P.lyrLines-1,Math.floor(p*P.lyrLines));if(i!==P.lyrIdx){P.lyrIdx=i;let el=null;$$('#fpLyr .l').forEach(l=>{const k=+l.dataset.i;l.classList.toggle('on',k===i);l.classList.toggle('past',k<i);if(k===i)el=l});lyrScroll(el)}}
  const now=Date.now();if(d&&now-msT>1000&&window.CR){msT=now;CR.media.position({duration:d,position:Math.min(t,d),playbackRate:1})}
}
/* ---------- senkron sözler (KIE timeStamped-lyrics) ---------- */
const L={id:null,words:[],lines:[],wi:-1,li:-1,hold:0,busy:new Set()};
const lyrTok=s=>s.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N}]+/gu,'');
// KIE aligned_words → satırlar. Satır sonu "\n" ile gelir; gelmezse kullanıcının söz satırlarına göre bölünür.
function alignLines(words,lyrics){
  const out=[],hasNL=words.some(x=>x.w.includes('\n'));let cur=null;const push=()=>{if(cur&&cur.w.length)out.push(cur);cur=null};
  const plan=hasNL?null:(lyrics||'').split('\n').map(x=>x.trim()).filter(x=>x&&!/^\[.*\]$/.test(x)).map(x=>x.split(/\s+/).filter(lyrTok).length).filter(Boolean);let pi=0;
  for(const x of words)for(const part of x.w.split(/(\[[^\]]*\]|\n)/)){
    if(!part)continue;if(part==='\n'){push();continue}
    const m=part.match(/^\[([^\]]*)\]$/);if(m){push();if(m[1].trim())out.push({sec:m[1].trim()});continue}
    for(const t of part.trim().split(/\s+/)){if(!t)continue;if(!cur)cur={w:[]};cur.w.push({t,s:x.s,e:x.e});
      if(!hasNL){const lim=plan&&plan.length?plan[Math.min(pi,plan.length-1)]:8;if(cur.w.filter(y=>lyrTok(y.t)).length>=lim){push();pi++}}}
  }
  push();return out;
}
function renderLyr(t){
  const box=$('#fpLyr'),st=$('#lyrSt');L.id=t.id;L.words=[];L.lines=[];L.wi=-1;L.li=-1;
  if(t.aligned&&t.aligned.length){
    const rows=alignLines(t.aligned,t.lyrics);let html='';
    rows.forEach(r=>{if(r.sec){html+=`<div class="s">${esc(r.sec)}</div>`;return}
      const li=L.lines.length;L.lines.push({s:r.w[0].s,e:r.w[r.w.length-1].e,w0:L.words.length});
      html+=`<div class="l" data-li="${li}">`+r.w.map(w=>{L.words.push({s:w.s,e:w.e,li});return `<span class="w">${esc(w.t)}</span>`}).join(' ')+'</div>'});
    box.innerHTML=html;box.classList.add('sync');
    const ls=$$('#fpLyr .l');L.lines.forEach((l,i)=>{l.el=ls[i]});const ws=$$('#fpLyr .w');L.words.forEach((w,i)=>{w.el=ws[i]});
    st.textContent='SENKRON';st.className='lyr-st ok';P.lyrLines=0;$('#lyrCard').hidden=!L.lines.length;
    lyrTick(pos(),true);return;
  }
  box.classList.remove('sync');
  const lines=(t.lyrics||'').split('\n').map(x=>x.trim()).filter(Boolean);let n=0;
  box.innerHTML=lines.map(l=>/^\[.*\]$/.test(l)?`<div class="s">${esc(l.slice(1,-1))}</div>`:`<div class="l" data-i="${n++}">${esc(l)}</div>`).join('');box.scrollTop=0;
  P.lyrLines=n;P.lyrIdx=-1;$('#lyrCard').hidden=!n;
  st.textContent=L.busy.has(t.id)?'EŞLENİYOR…':'';st.className='lyr-st';
}
function lyrScroll(el,force){const box=$('#fpLyr');if(el&&Date.now()-L.hold>3000)box.scrollTo({top:el.offsetTop-box.clientHeight*.38+el.offsetHeight/2,behavior:force?'auto':'smooth'})}
function lyrTick(time,force){
  const W=L.words;let lo=0,hi=W.length-1,wi=-1;while(lo<=hi){const m=(lo+hi)>>1;if(W[m].s<=time+.05){wi=m;lo=m+1}else hi=m-1}
  if(wi===L.wi&&!force)return;
  const from=force||wi<L.wi?0:L.wi+1;if(force||wi<L.wi)W.forEach(w=>w.el.classList.remove('sung'));
  for(let i=from;i<=wi;i++)W[i].el.classList.add('sung');L.wi=wi;
  const li=wi<0?-1:W[wi].li;if(li===L.li&&!force)return;L.li=li;
  L.lines.forEach((l,i)=>{l.el.classList.toggle('on',i===li);l.el.classList.toggle('past',i<li)});
  lyrScroll(li>=0?L.lines[li].el:null,force);
}
$('#fpLyr').addEventListener('click',e=>{const l=e.target.closest('.l[data-li]');if(!l)return;const ln=L.lines[+l.dataset.li],d=dur();if(ln&&d){L.hold=0;seek(Math.max(0,ln.s-.1)/d);if(!P.playing&&hasMedia())toggle()}});
['wheel','touchstart','pointerdown'].forEach(ev=>$('#fpLyr').addEventListener(ev,()=>{L.hold=Date.now()},{passive:true}));
function ensureAlign(t){
  if(!t||t.aligned||!API.live||t.output!=='song'||!t.audioId||!(t.taskId||t.providerTaskId)||L.busy.has(t.id))return;
  if(t.alignFail&&Date.now()-t.alignFail<10*60e3)return;
  L.busy.add(t.id);if(L.id===t.id)renderLyr(t);
  jpost('/api/music/lyrics',{taskId:t.taskId,providerTaskId:t.providerTaskId,audioId:t.audioId})
    .then(r=>r.json()).then(j=>{if(j&&j.success&&j.words&&j.words.length){t.aligned=j.words;delete t.alignFail}else t.alignFail=Date.now()})
    .catch(()=>{t.alignFail=Date.now()})
    .finally(()=>{L.busy.delete(t.id);save();if(P.cur&&P.cur.id===t.id)renderLyr(t)});
}
/* ---------- now playing arayüzü ---------- */
function hexRgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255]}
const mixK=(c,k)=>c.map(v=>Math.round(v*k));
function seedTint(t){const r=rng(t.seed),p=PAL[Math.floor(r()*PAL.length)];return hexRgb(p[0])}
function applyTint(rgb){
  const [r,g,b]=rgb,lum=(.299*r+.587*g+.114*b)/255,k=lum>.6?.5:lum>.4?.62:.78,deep=mixK(rgb,k),card=mixK(rgb,lum>.55?.42:.6),key=deep.join(',');
  if(PL.tint===key)return;PL.tint=key;
  const fp=$('#fp');fp.style.setProperty('--np-card',`rgb(${card})`);fp.style.setProperty('--np-deep',`rgb(${deep})`);$('#lyrFull').style.setProperty('--np-card',`rgb(${card})`);
  PL.bg^=1;const on=PL.bg?$('#npBgB'):$('#npBgA'),off=PL.bg?$('#npBgA'):$('#npBgB');
  on.style.background=`linear-gradient(180deg,rgb(${deep}) 0%,rgba(${deep},.72) 38%,rgba(${deep},.25) 70%,#0d0c10 100%)`;on.classList.add('on');off.classList.remove('on');
  const m=document.querySelector('meta[name=theme-color]');if(m&&$('#fp').classList.contains('open'))m.content=`rgb(${deep})`;
}
function tintFor(t){
  applyTint(t.tint||seedTint(t));
  if(t.image&&!t.tint&&!t._tintTry){t._tintTry=1;const im=new Image();im.crossOrigin='anonymous';im.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=12;const x=c.getContext('2d');x.drawImage(im,0,0,12,12);const d=x.getImageData(0,0,12,12).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){const s=Math.max(d[i],d[i+1],d[i+2])-Math.min(d[i],d[i+1],d[i+2]);const w=1+s/40;r+=d[i]*w;g+=d[i+1]*w;b+=d[i+2]*w;n+=w}t.tint=[r/n|0,g/n|0,b/n|0];if(P.cur===t)applyTint(t.tint)}catch(e){}};im.src=t.image}
}
const slideIn=(el,dir,dist=36)=>{if(!dir||!el.animate)return;el.animate([{transform:`translateX(${dir*dist}%) scale(.94)`,opacity:0},{transform:'none',opacity:1}],{duration:460,easing:'cubic-bezier(.16,1,.3,1)'})};
const riseIn=(el,delay=0)=>{if(!el.animate)return;el.animate([{transform:'translateY(10px)',opacity:0},{transform:'none',opacity:1}],{duration:420,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'})};
function setLoading(on){$('#miniPlay').classList.toggle('loading',on);$('#fpPlay').classList.toggle('loading',on);$('#lfPlay').classList.toggle('loading',on);if(on){$('#miniPlay').innerHTML=ic('refresh',20);$('#fpPlay').innerHTML=ic('refresh',28);$('#lfPlay').innerHTML=ic('refresh',28)}else syncIcons()}
function syncIcons(){
  $('#miniPlay').innerHTML=ic(P.playing?'pause':'play',20);const big=ic(P.playing?'pauseXL':'playXL',28);$('#fpPlay').innerHTML=big;$('#lfPlay').innerHTML=big;
  $('#fpShuf').classList.toggle('on',P.shuffle);const rp=$('#fpRep');rp.classList.toggle('on',P.repeat!=='off');rp.classList.toggle('one',P.repeat==='one');
  rp.setAttribute('aria-label',{off:'Tekrar kapalı',all:'Tümünü tekrarla',one:'Bu şarkıyı tekrarla'}[P.repeat]);
  markRows();if(window.CR)CR.media.state(P.playing?'playing':'paused');
}
function syncMini(dir){const t=P.cur;$('#mini').hidden=!t;if(!t)return;const ch=PL.lastMini!==t.id;PL.lastMini=t.id;
  if(ch||$('#miniArt').dataset.img!==(t.image||'')){$('#miniArt').innerHTML=art(t);$('#miniArt').dataset.img=t.image||''}
  $('#miniTitle').textContent=t.title;$('#miniSub').textContent=KIND[t.output]||'';
  if(ch&&dir){slideIn($('#miniArt'),dir,60);slideIn($('.mini-txt'),dir,20)}}
function syncPlayer(dir=0){
  const t=P.cur;if(!t)return;const ch=PL.lastNp!==t.id;PL.lastNp=t.id;
  if(ch||$('#fpArt').dataset.img!==(t.image||'')){$('#fpArt').innerHTML=art(t);$('#fpArt').dataset.img=t.image||''}
  if(ch){tintFor(t);if(dir)slideIn($('#fpArt'),dir);if(dir||$('#fp').classList.contains('open'))riseIn($('#npMeta'),60)}
  $('#npCtx').textContent=P.ctxName;$('#fpTitle').textContent=t.title;$('#fpSub').textContent=`${KIND[t.output]||'Şarkı'} • ${modelTag(t)}`;
  $('#lfTitle').textContent=t.title;$('#lfSub').textContent=KIND[t.output]||'';
  const lk=$('#npLike');lk.classList.toggle('on',t.like===1);lk.innerHTML=ic(t.like===1?'like':'heart',26);
  const tags=(t.style||KIND[t.output]||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,8);
  $('#fpStyle').innerHTML=tags.map(x=>`<button class="np-tag" data-tag="${esc(x)}">${esc(x)}</button>`).join('');
  const d=new Date(t.created||Date.now());$('#fpAbout').textContent=`${d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})} • ${modelTag(t)}${t.duration?' • '+fmt(t.duration):''}`;
  const par=t.parent&&findT(t.parent);$('#fpParent').innerHTML=par?`<button class="src-row" data-parent="${par.id}"><span class="av">${art(par)}</span><span>${esc(par.title)}</span>${ic('chevR',18)}</button>`:'';
  $('#fpPills').innerHTML=`<button class="np-act" data-ft="cover">${ic('cover',18)}Cover</button><button class="np-act" data-ft="extend">${ic('extend',18)}Uzat</button>${t.kind?'':`<button class="np-act" data-ft="stems">${ic('stems',18)}Stem</button>`}`;
  const up=upcoming(3);$('#npNextCard').hidden=!up.length;
  $('#npNext').innerHTML=up.map(({t:x,k})=>`<button class="np-q" data-k="${k}"><span class="np-q-art cov">${art(x)}</span><span class="np-q-t"><b>${esc(x.title)}</b><small>${esc(KIND[x.output]||'')} • ${fmt(x.duration)}</small></span></button>`).join('');
  if(ch){renderLyr(t);ensureAlign(t)}
}
function openQueue(){
  const up=upcoming(40),t=P.cur;if(!t)return;
  openSheet(`<div class="sheet-sec">Şu an çalıyor</div><div class="np-q now"><span class="np-q-art cov">${art(t)}</span><span class="np-q-t"><b>${esc(t.title)}</b><small>${esc(KIND[t.output]||'')}</small></span></div>
    <div class="sheet-sec" style="margin-top:14px">Sıradaki • ${esc(P.ctxName)}</div>${up.length?up.map(({t:x,k})=>`<button class="np-q" data-k="${k}"><span class="np-q-art cov">${art(x)}</span><span class="np-q-t"><b>${esc(x.title)}</b><small>${esc(KIND[x.output]||'')} • ${fmt(x.duration)}</small></span></button>`).join(''):'<div class="empty" style="padding:20px 0">Sıra boş</div>'}`);
}
document.addEventListener('click',e=>{const q=e.target.closest('.np-q[data-k]');if(!q)return;if(q.closest('#sheet'))closeLayer($('#sheet'));goPos(+q.dataset.k,1)});
$('#fpPills').addEventListener('click',e=>{const b=e.target.closest('[data-ft]');if(!b||!P.cur)return;openTool(b.dataset.ft,P.cur.id)});
$('#fpStyle').addEventListener('click',e=>{const b=e.target.closest('[data-tag]');if(!b)return;closeLayer($('#fp'));openCreate('custom',{style:b.dataset.tag})});
$('#fpParent').addEventListener('click',e=>{const b=e.target.closest('[data-parent]');if(b)play(b.dataset.parent,false)});
function openPlayer(){syncPlayer();const fp=$('#fp');if(P.cur)tintFor(P.cur);fp.classList.add('open');fp.setAttribute('aria-hidden','false');if(!stack.includes(fp))stack.push(fp);fp.scrollTop=0;riseIn($('#npMeta'),120)}
$('#fp')._onClose=()=>{$('#fp').setAttribute('aria-hidden','true');closeLayer($('#lyrFull'))};
function mediaSession(){if(!window.CR||!P.cur)return;const M=CR.media,art=P.cur.image&&/^https:/.test(P.cur.image)?[{src:P.cur.image,sizes:'512x512',type:'image/jpeg'}]:[];
  M.metadata({title:P.cur.title||'',artist:'CookRapper',album:KIND[P.cur.output]||'',artwork:art});M.state(P.playing?'playing':'paused');
  const H=M.handler;H('play',()=>{if(!P.playing)toggle()});H('pause',()=>{if(P.playing)toggle()});H('nexttrack',()=>next());H('previoustrack',()=>prev());
  H('seekto',d=>{const D=dur();if(D&&d&&d.seekTime!=null)seek(d.seekTime/D)});H('seekbackward',d=>{const D=dur();if(D)seek((pos()-((d&&d.seekOffset)||10))/D)});H('seekforward',d=>{const D=dur();if(D)seek((pos()+((d&&d.seekOffset)||10))/D)})}
/* kontroller */
$('#miniPlay').onclick=()=>hasMedia()&&toggle();
$('#fpPlay').onclick=()=>hasMedia()&&toggle();$('#lfPlay').onclick=()=>hasMedia()&&toggle();
$('#fpNext').onclick=()=>next();$('#fpPrev').onclick=()=>prev();
$('#fpShuf').onclick=()=>{P.shuffle=!P.shuffle;if(P.cur){const id=P.cur.id;buildOrder(id)}syncIcons();syncPlayer();toast(P.shuffle?'Karıştırma açık':'Karıştırma kapalı')};
$('#fpRep').onclick=()=>{P.repeat={off:'all',all:'one',one:'off'}[P.repeat];syncIcons();toast({off:'Tekrar kapalı',all:'Tümünü tekrarla',one:'Bu şarkıyı tekrarla'}[P.repeat])};
$('#npLike').onclick=()=>{if(!P.cur)return;setLike(P.cur,1);const b=$('#npLike');b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')};
$('#npShare').onclick=()=>P.cur&&share(P.cur);$('#npQueue').onclick=openQueue;$('#npQueue2').onclick=openQueue;
$('#npClose').onclick=()=>closeLayer($('#fp'));$('#fpMore').onclick=()=>P.cur&&openMenu(P.cur.id);
$('#styleCopy').onclick=()=>P.cur&&copy(P.cur.style||'');$('#lyrCopy').onclick=()=>P.cur&&copy(P.cur.lyrics||(P.cur.aligned||[]).map(x=>x.w).join(' ').replace(/\s*\n\s*/g,'\n'));
$('#styleRemix').onclick=()=>{if(!P.cur)return;closeLayer($('#fp'));openCreate('custom',{style:P.cur.style})};
/* tam ekran sözler: aynı söz kutusu taşınır, senkron sürer */
$('#lyrOpen').onclick=()=>{const lf=$('#lyrFull');$('#lfBody').appendChild($('#fpLyr'));lf.classList.add('open');lf.setAttribute('aria-hidden','false');if(!stack.includes(lf))stack.push(lf);L.hold=0;tick();if(L.words.length)lyrTick(pos(),true)};
$('#lyrFull')._onClose=()=>{const lf=$('#lyrFull');lf.setAttribute('aria-hidden','true');$('#lyrCard').appendChild($('#fpLyr'));L.hold=0;if(L.words.length)lyrTick(pos(),true)};
$('#lfClose').onclick=()=>closeLayer($('#lyrFull'));
/* ilerleme çubukları */
function seekBar(b){let drag=false;const at=e=>{const r=b.getBoundingClientRect();seek((e.clientX-r.left)/r.width)};
  b.addEventListener('pointerdown',e=>{if(!hasMedia())return;drag=true;b.classList.add('drag');b.setPointerCapture(e.pointerId);at(e)});b.addEventListener('pointermove',e=>drag&&at(e));
  const up=()=>{drag=false;b.classList.remove('drag')};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up)}
seekBar($('#fpBar'));seekBar($('#lfBar'));
/* kapağı kaydır → önceki / sonraki */
(()=>{const w=$('#npArtWrap'),a=$('#fpArt');let x0=null,y0=0,dx=0,lock=0;
  w.addEventListener('pointerdown',e=>{x0=e.clientX;y0=e.clientY;dx=0;lock=0;a.style.transition='none'});
  w.addEventListener('pointermove',e=>{if(x0==null)return;const mx=e.clientX-x0,my=e.clientY-y0;if(!lock){if(Math.abs(mx)>8&&Math.abs(mx)>Math.abs(my)){lock=1;try{w.setPointerCapture(e.pointerId)}catch(_){}}else if(Math.abs(my)>8)lock=-1}
    if(lock===1){dx=mx;a.style.transform=`translateX(${dx}px) rotate(${dx*.015}deg)`}});
  const end=()=>{if(x0==null)return;x0=null;a.style.transition='';
    if(lock===1&&Math.abs(dx)>70&&P.order.length>1){const dir=dx<0?1:-1;const an=a.animate?a.animate([{transform:a.style.transform},{transform:`translateX(${-dir*115}%) rotate(${-dir*6}deg)`,opacity:0}],{duration:200,easing:'cubic-bezier(.4,0,1,1)'}):null;
      const go=()=>{a.style.transform='';dir>0?next():prev(true)};if(an)an.onfinish=go;else go()}
    else a.style.transform=''};
  w.addEventListener('pointerup',end);w.addEventListener('pointercancel',end)})();
/* mini oynatıcı: kaydır = parça değiştir, dokun = aç */
(()=>{const m=$('#miniOpen');let x0=null,dx=0,sw=false;
  m.addEventListener('pointerdown',e=>{x0=e.clientX;dx=0;sw=false});
  m.addEventListener('pointermove',e=>{if(x0==null)return;dx=e.clientX-x0;if(Math.abs(dx)>10){sw=true;$('.mini-txt').style.transform=`translateX(${dx*.6}px)`;$('.mini-txt').style.opacity=1-Math.min(.7,Math.abs(dx)/200)}});
  const end=()=>{if(x0==null)return;x0=null;const t=$('.mini-txt');t.style.transform='';t.style.opacity='';if(sw&&Math.abs(dx)>50){dx<0?next():prev(true)}};
  m.addEventListener('pointerup',end);m.addEventListener('pointercancel',end);
  m.addEventListener('click',e=>{if(sw){e.preventDefault();sw=false;return}openPlayer()})})();
/* başlıktan aşağı çek → kapat */
(()=>{const h=$('#fpGrab'),fp=$('#fp');let y0=null;
  h.addEventListener('pointerdown',e=>{y0=e.clientY;h.setPointerCapture(e.pointerId)});
  h.addEventListener('pointermove',e=>{if(y0==null)return;const d=Math.max(0,e.clientY-y0);fp.style.transition='none';fp.style.transform=`translateY(${d}px)`});
  const end=e=>{if(y0==null)return;const d=e.clientY-y0;y0=null;fp.style.transition='';fp.style.transform='';if(d>110)closeLayer(fp)};
  h.addEventListener('pointerup',end);h.addEventListener('pointercancel',end)})();
$('#npClose').innerHTML=ic('down',26);$('#fpMore').innerHTML=ic('more',22);$('#fpShuf').innerHTML=ic('shuffle',24);$('#fpRep').innerHTML=ic('repeat',24);
$('#fpPrev').innerHTML=ic('prev2',32);$('#fpNext').innerHTML=ic('next2',32);$('#npShare').innerHTML=ic('share',22);$('#npQueue').innerHTML=ic('queue',22);
$('#lyrCopy').innerHTML=ic('copy',16);$('#lyrOpen').innerHTML=ic('expand',16);$('#styleRemix').innerHTML=ic('cover',16);$('#styleCopy').innerHTML=ic('copy',16);$('#lfClose').innerHTML=ic('down',26);

/* ---------- boot ---------- */
applyTheme();renderSugs();initExplore();requestAnimationFrame(moveInd);syncCreate();renderAll();syncIcons();detectLive();
try{new ResizeObserver(()=>document.documentElement.style.setProperty('--dock',$('#dock').offsetHeight+'px')).observe($('#dock'))}catch(e){document.documentElement.style.setProperty('--dock','140px')}
