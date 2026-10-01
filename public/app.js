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
S.lib.forEach(t=>{if(t.output==='instrumental')t.output='beat';if(t.status==='gen'&&!t.taskId)t.status='ready';if(t.fav&&t.like==null)t.like=1});
const save=()=>{store.set('sf2_lib',S.lib);store.set('sf2_set',S.set);store.set('sf2_personas',S.personas);store.set('sf2_voices',S.voices);if(window.FB)FB.schedule()};
/* ---------- Firebase köprüsü (public/fb.js) ---------- */
const fbWait=()=>window.FB?Promise.resolve(window.FB):new Promise(r=>{const t=setTimeout(()=>r(null),4000);addEventListener('fb-ready',()=>{clearTimeout(t);r(window.FB)},{once:true})});
async function api(url,o={}){const fb=await fbWait();const headers=fb?await fb.headers(o.headers||{}):(o.headers||{});return fetch(url,{...o,headers})}
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
    changes.forEach(c=>{const i=arr.findIndex(x=>x.id===c.id);if(c.removed){if(i>=0)arr.splice(i,1);return}
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
const AV=hash('me');$('#tabAv').innerHTML=coverSVG(AV);$('#pAv').innerHTML=coverSVG(AV);
$('#cPlus').innerHTML=ic('plus',22);$('#cMic').innerHTML=ic('mic',20);$('#cSend').innerHTML=ic('arrowUp',22);$('#ddIc').innerHTML=ic('down',16);
$$('.chev').forEach(c=>c.innerHTML=ic('chevR',16));
$$('[data-close]').forEach(b=>b.innerHTML=ic('down',24));
$('#searchBtn').innerHTML=ic('search',20);$('#filtIc').innerHTML=ic('filter',18);
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
function closeLayer(el){el=el||stack[stack.length-1];if(!el)return;el.classList.remove('open');const i=stack.indexOf(el);if(i>=0)stack.splice(i,1);if(!stack.some(x=>x!==$('#fp')))$('#scrim').classList.remove('open');recStop();if(el===$('#fp'))el.setAttribute('aria-hidden','true')}
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
  const T=EX.T=Math.round(clamp(Math.min(w,hh)*.34,108,176)),G=Math.round(T*.2),sx=EX.sx=T+G,sy=EX.sy=Math.round(sx*.87),cols=7,rows=8;
  let html='';EX.tiles=[];
  for(let r=0,k=0;r<rows;r++)for(let c=0;c<cols;c++,k++){
    const g=GENRES[k%GENRES.length],x=c*sx+(r%2?sx/2:0),y=r*sy,d=Math.hypot(c+(r%2?.5:0)-cols/2+.25,r-(rows-1)/2);
    EX.tiles.push({x,y,g,ph:k*1.37});
    const [sa,sb]=tileImgs(hash('ex'+g[0]+k));html+=`<button class="ex-tile" data-i="${k}" tabindex="-1" aria-label="${esc(g[0])}" style="width:${T}px;height:${T}px"><span class="ex-in" style="animation-delay:${Math.round(d*80)}ms"><img class="ex-a" src="${sa}" alt="" draggable="false"><img class="ex-b" src="${sb}" alt="" draggable="false"></span></button>`;
  }
  $('#exGrid').innerHTML=html;$$('#exGrid .ex-tile').forEach((el,i)=>{EX.tiles[i].el=el;EX.tiles[i].bEl=el.querySelector('.ex-b');el.style.zIndex=1});
  const xs=EX.tiles.map(t=>t.x),ys=EX.tiles.map(t=>t.y);EX.b={x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};
  EX.built=true;EX.focus=-1;
  const t=EX.tiles[keep>=0?keep:3*cols+3];EX.cx=t.x;EX.cy=t.y;EX.vx=EX.vy=0;EX.tx=null;exRender();
}
function exRender(){
  const w2=EX.w/2,h2=EX.h/2,R=Math.min(EX.w,EX.h)*.68,half=EX.T/2,mx=w2+EX.T*1.3,my=h2+EX.T*1.3;let best=-1,bd=1e12;
  for(let i=0;i<EX.tiles.length;i++){
    const t=EX.tiles[i],dx=t.x-EX.cx,dy=t.y-EX.cy,d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}
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
    if(Math.abs(EX.cx-EX.tx)<.25&&Math.abs(EX.cy-EX.ty)<.25&&Math.hypot(EX.vx,EX.vy)<3){EX.cx=EX.tx;EX.cy=EX.ty;EX.vx=EX.vy=0;EX.tx=null}
  }
  exRender();
  const busy=EX.drag||EX.tx!=null;
  EX.raf=EX.run&&busy&&!document.hidden?requestAnimationFrame(exLoop):0;if(!EX.raf)EX.last=0;
}
function exStart(){EX.run=true;if(!EX.raf){EX.last=0;EX.raf=requestAnimationFrame(exLoop)}}
function exWake(){EX.run=true;if(!EX.raf){EX.last=0;EX.raf=requestAnimationFrame(exLoop)}}
function exStop(){EX.run=false;if(EX.raf)cancelAnimationFrame(EX.raf);EX.raf=0}
function exReplay(){const e=$('#explore');e.classList.remove('shown');void e.offsetWidth;e.classList.add('shown')}
function exNearest(x,y){let b=0,bd=1e18;EX.tiles.forEach((t,i)=>{const d=(t.x-x)**2+(t.y-y)**2;if(d<bd){bd=d;b=i}});return b}
function exGoTo(i){const t=EX.tiles[i];if(!t)return;EX.tx=t.x;EX.ty=t.y;exStart()}
function exOpen(){const t=EX.tiles[EX.focus];if(t)openCreate('custom',{style:t.g[1]})}
function initExplore(){
  const st=EX.stage=$('#exStage');
  st.addEventListener('pointerdown',e=>{if(e.button>0)return;try{st.setPointerCapture(e.pointerId)}catch(_){}
    EX.drag=true;EX.tx=null;EX.vx=EX.vy=0;EX.px=e.clientX;EX.py=e.clientY;EX.pt=performance.now();EX.moved=0;EX.down=e.target.closest('.ex-tile');st.classList.add('drag');exStart()});
  st.addEventListener('pointermove',e=>{if(!EX.drag)return;
    const now=performance.now(),dx=e.clientX-EX.px,dy=e.clientY-EX.py,dt=Math.max(8,now-EX.pt)/1000,b=EX.b;
    const rx=EX.cx<b.x0||EX.cx>b.x1?.32:1,ry=EX.cy<b.y0||EX.cy>b.y1?.32:1;   // rubber band past edges
    EX.cx-=dx*rx;EX.cy-=dy*ry;
    EX.vx=EX.vx*.7+(-dx*rx/dt)*.3;EX.vy=EX.vy*.7+(-dy*ry/dt)*.3;
    EX.px=e.clientX;EX.py=e.clientY;EX.pt=now;EX.moved+=Math.abs(dx)+Math.abs(dy)});
  const end=e=>{if(!EX.drag)return;EX.drag=false;st.classList.remove('drag');
    if(EX.moved<8&&EX.down){const i=+EX.down.dataset.i;EX.vx=EX.vy=0;if(i===EX.focus)exOpen();else exGoTo(i);return}
    if(performance.now()-EX.pt>80){EX.vx=EX.vy=0}                                   // finger rested before lifting
    const V=3200;EX.vx=clamp(EX.vx,-V,V);EX.vy=clamp(EX.vy,-V,V);
    const b=EX.b,px=clamp(EX.cx+EX.vx*.26,b.x0,b.x1),py=clamp(EX.cy+EX.vy*.26,b.y0,b.y1);  // project the glide, land on nearest tile
    exGoTo(exNearest(px,py))};
  st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
  st.addEventListener('contextmenu',e=>e.preventDefault());
  let wt;st.addEventListener('wheel',e=>{e.preventDefault();const f=e.deltaMode===1?18:1,b=EX.b;EX.tx=null;EX.vx=EX.vy=0;
    EX.cx=clamp(EX.cx+e.deltaX*f*.9,b.x0-40,b.x1+40);EX.cy=clamp(EX.cy+e.deltaY*f*.9,b.y0-40,b.y1+40);exStart();
    clearTimeout(wt);wt=setTimeout(()=>exGoTo(exNearest(EX.cx,EX.cy)),150)},{passive:false});
  document.addEventListener('keydown',e=>{if(S.view!=='home'||stack.length||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
    const m={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];const f=EX.tiles[EX.focus];
    if(m&&f){e.preventDefault();exGoTo(exNearest(f.x+m[0]*EX.sx,f.y+m[1]*EX.sy))}else if(e.key==='Enter'&&f){e.preventDefault();exOpen()}});
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
  try{const r=await fetch('/api/health',{cache:'no-store'});const j=r.ok?await r.json():null;API.live=!!(j&&j.service==='kie-suno-music')}catch(e){API.live=false}
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
    const op=AOP[S.aop]||AOP.cover,vocal=S.aop==='vocals'||song,title=$('#aTitle').value.trim()||'Kaydım',style=$('#aStyle').value.trim(),lyr=$('#aLyrics').value.trim();
    if(S.aop==='vocals'){if(!style)return fail('Stil gerekli');if(!lyr)return fail('Sözler gerekli')}
    const body={taskType:op.type,model:S.set.model,title:title.slice(0,80),style:style||undefined,instrumental:!vocal,lyrics:vocal&&lyr?lyr:undefined};
    if(S.aop==='cover')body.duration=Math.min(360,Math.max(10,Math.round(src.dur||60)));   // yoksa KIE 20 sn üretir
    const up=uploader(src),req=async()=>({url:'/api/music/audio',body:{...body,uploadUrl:await up()}});
    ok=spawn({title:`${title} (${op.lab})`,style:style||op.lab,lyrics:vocal?lyr:'',output:vocal?'song':'beat',duration:Math.max(30,Math.round(src.dur||90)+(S.aop==='extend'?60:0))},2,COST[op.type],req)}
  if(ok.length){closeLayer($('#mCreate'));$('#desc').value='';go('library')}
};

/* ---------- rows ---------- */
const eq='<span class="eq"><i></i><i></i><i></i><i></i></span>';
function row(t){
  const gen=t.status==='gen',cur=P.cur&&P.cur.id===t.id;
  const tag=t.kind==='stem'?'<span class="tag dim">STEM</span>':`<span class="tag">${esc((t.model||'V6').replace('_',' '))}</span>`;
  return `<div class="song${gen?' is-gen':''}${cur?' is-cur':''}" data-id="${t.id}">
    <button class="thumb" data-act="play" aria-label="Oynat">${art(t)}<span class="badge">${fmt(t.duration)}</span><span class="thumb-ov">${gen?eq:ic(cur&&P.playing?'pause':'play',22)}</span></button>
    <div class="song-body" data-act="open"><div class="song-t"><span class="t">${esc(t.title)}</span>${tag}</div>
      ${gen?`<div class="song-s stage">${STAGES[t.stage]}</div><div class="prog"><i style="width:${(t.stage+1)/STAGES.length*100}%"></i></div>`:`<div class="song-s">${esc(t.style||KIND[t.output])}</div>`}</div>
    <button class="icon-btn" data-act="more" aria-label="Diğer">${ic('more',20)}</button></div>`;
}
function renderFeed(){if(!$('#feed'))return;$('#feed').innerHTML=S.lib.length?S.lib.slice(0,6).map(row).join(''):'<div class="empty">İlk şarkını yukarıdan oluştur</div>'}
const CATS=[['like','Beğenilenler','thumbUp','c1'],['beat','Beat\'ler','studio','c2'],['stem','Stemler','stems','c3'],['song','Vokaller','mic','c4']];
function renderCats(){$('#cats').innerHTML=CATS.map(([k,l,i,c])=>{const n=S.lib.filter(t=>match(t,k)).length;return `<button class="cat ${c}${S.filter===k?' on':''}" data-cat="${k}">${ic(i,24)}<small>${n}</small><b>${l}</b></button>`}).join('')}
$('#cats').addEventListener('click',e=>{const c=e.target.closest('[data-cat]');if(!c)return;S.filter=S.filter===c.dataset.cat?'all':c.dataset.cat;renderLib()});
function match(t,f){return f==='all'||(f==='like'?t.like===1:f==='stem'?t.kind==='stem':t.output===f)}
function renderLib(){const q=S.q.toLocaleLowerCase('tr');let it=S.lib.filter(t=>match(t,S.filter)&&(!q||(t.title+' '+t.style).toLocaleLowerCase('tr').includes(q)));if(S.sort==='old')it=[...it].reverse();
  renderCats();$('#libList').innerHTML=it.length?it.map(row).join(''):`<div class="empty">${S.lib.length?'Sonuç yok':'Kütüphane boş'}</div>`}
$('#searchBtn').onclick=()=>{const r=$('#searchRow');r.hidden=!r.hidden;if(!r.hidden)$('#q').focus();else{$('#q').value='';S.q='';renderLib()}};
$('#q').addEventListener('input',e=>{S.q=e.target.value;renderLib()});
$('#filterBtn').onclick=()=>{
  const opts=[['all','Tümü'],['song','Vokal'],['beat','Beat'],['stem','Stem'],['like','Beğenilen']];
  openSheet(`<div class="sheet-sec">Tür</div><div class="chips wrap" id="fType">${opts.map(([k,l])=>`<button class="chip${S.filter===k?' on':''}" data-v="${k}">${l}</button>`).join('')}</div><div class="sheet-sec" style="margin-top:18px">Sıralama</div><div class="seg" id="fSort"><button data-v="new" class="${S.sort==='new'?'on':''}">En yeni</button><button data-v="old" class="${S.sort==='old'?'on':''}">En eski</button></div>`);
  bindSeg($('#fType'),v=>{S.filter=v;renderLib()});bindSeg($('#fSort'),v=>{S.sort=v;renderLib()});
};
function renderAll(){renderFeed();if(S.view==='library')renderLib();if(S.view==='profile')renderProfile();$$('.cr').forEach(c=>c.textContent=S.set.credits);syncMini()}
document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const s=a.closest('.song');if(!s)return;const t=S.lib.find(x=>x.id===s.dataset.id);if(!t)return;
  if(a.dataset.act==='play')play(t.id,false);if(a.dataset.act==='open')play(t.id,true);if(a.dataset.act==='more')openMenu(t.id)});

/* ---------- sheet / menu ---------- */
function openSheet(html){const sh=$('#sheet');sh.innerHTML='<div class="grab" id="shGrab"></div>'+html;openLayer(sh);swipeClose($('#shGrab'),sh)}
function openMenu(id){
  const t=S.lib.find(x=>x.id===id);if(!t)return;const ready=t.status==='ready';
  const it=[['play','Oynat','play'],['like',t.like===1?'Beğeniyi kaldır':'Beğen','thumbUp'],['extend','Uzat','extend'],['cover','Cover','cover']];
  if(t.output!=='song')it.push(['vocals','Vokal ekle','vocals']);if(!t.kind)it.push(['stems','Stemlere ayır','stems']);
  it.push(['replace','Bölüm değiştir','scissors'],['persona','Persona oluştur','persona'],['share','Paylaş','share']);if(t.audioUrl)it.push(['download','İndir','download']);
  openSheet(`<div class="menu-head"><span class="thumb">${art(t)}</span><div><b>${esc(t.title)}</b><small>${KIND[t.output]} · v${t.version}</small></div></div>
    <div class="menu">${it.map(([k,l,i])=>`<button data-m="${k}" ${!ready&&!['play','like'].includes(k)?'disabled':''}>${ic(i,22)}${l}</button>`).join('')}<button class="del" data-m="delete">${ic('trash',22)}Sil</button></div>`);
  $('#sheet').querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const m=b.dataset.m;closeLayer($('#sheet'));
    if(m==='play')play(id,true);else if(m==='like')setLike(t,1);else if(m==='share')share(t);else if(m==='download')window.open(t.audioUrl,'_blank');
    else if(m==='delete'){if(P.cur&&P.cur.id===id)stopAll();S.lib=S.lib.filter(x=>x.id!==id);save();renderAll();toast('Silindi')}
    else openTool(m,id)});
}
function setLike(t,v){t.like=t.like===v?0:v;save();renderAll();syncPlayer()}
async function share(t){const txt=`${t.title} — SoundForge`;try{if(navigator.share){await navigator.share({title:t.title,text:txt});return}}catch(e){return}try{await navigator.clipboard.writeText(txt);toast('Kopyalandı')}catch(e){toast(txt)}}
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
  voice:{n:'Ses klonu',ic:'voice',cta:'Devam',cost:0,f:[{k:'name',t:'text',ph:'Ses adı'},{k:'rec'}]},
  record:{n:'Kayıttan',ic:'mic',go:()=>openCreate('audio')}
};
const isVocal=t=>t.output==='song'||t.output==='stemv';
function srcOptions(only,sel){return S.lib.filter(t=>t.status==='ready'&&t.audioId&&(only==='inst'?!isVocal(t):only==='song'?t.output==='song':only==='nostem'?!t.kind:true)).map(t=>`<option value="${t.id}" ${t.id===sel?'selected':''}>${esc(t.title)} · v${t.version}</option>`).join('')}
function fieldHTML(f,sel){
  if(f.k==='src'){const o=srcOptions(f.only,sel);return o?`<select class="inp" name="src">${o}</select>`:'<div class="empty" style="padding:18px 0">Uygun parça yok — önce bir şarkı üret</div>'}
  if(f.k==='range2')return `<div class="row2"><label class="fl">Başlangıç (sn)<input class="inp" type="number" name="from" value="30" min="0" step="1" inputmode="numeric"></label><label class="fl">Bitiş (sn)<input class="inp" type="number" name="to" value="45" min="0" step="1" inputmode="numeric"></label></div>`;
  if(f.k==='rec')return '<div class="phrase" id="vPhrase" hidden></div><div id="vRec"></div><p class="hint" id="vHint">10–60 sn şarkı söyle ya da rap yap. Arka plan sessiz olsun.</p>';
  const only=f.only?` data-only="${f.only}"`:'';
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
  if(!src.audioId||!src.providerTaskId)return fail('Bu parça KIE işlemi için uygun değil');
  const vocal=isVocal(src),base={style:src.style,output:src.output,lyrics:src.lyrics,gender:src.gender,duration:src.duration,parent:src.id,image:undefined,model:src.model};
  const A=body=>({url:'/api/music/audio',body:Object.assign({model:src.model||'V6',title:src.title},body)});let ok=[];
  if(key==='extend'){const at=+v('at');if(!(at>0&&at<(src.duration||1e9)))return fail('Devam noktası parça süresinden kısa olmalı');
    ok=spawn({...base,title:src.title+' (uzun)',style:v('style')||src.style,duration:at+120,seedFn:i=>src.seed+i},2,COST.extend,A({taskType:'extend',audioId:src.audioId,continueAt:at,instrumental:!vocal,style:v('style')||src.style}))}
  else if(key==='cover'){const st=v('style')||src.style;
    ok=spawn({...base,title:src.title+' (cover)',style:st,gender:v('gender')},2,COST.cover,A({taskType:'cover',uploadUrl:src.audioUrl,style:st,instrumental:!vocal,lyrics:vocal&&src.lyrics?src.lyrics:undefined,vocalGender:vocal?v('gender'):undefined,duration:Math.min(360,Math.max(10,Math.round(src.duration||120)))}))}
  else if(key==='vocals'){const ly=v('lyrics').trim();if(!ly)return fail('Sözler gerekli');
    ok=spawn({...base,title:src.title+' (vokal)',output:'song',lyrics:ly,gender:v('gender'),seedFn:()=>src.seed},2,COST['add-vocals'],A({taskType:'add-vocals',uploadUrl:src.audioUrl,lyrics:ly,vocalGender:v('gender'),style:src.style||'hip hop'}))}
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
  const src=VREC.src();if(!src)return fail(V.step===1?'Önce ses örneği kaydet':'Önce cümleyi okuyup kaydet');
  const go=$('#toolGo');V.busy=true;go.disabled=true;setToolGo('voice',V.step===1?'Cümle hazırlanıyor…':'Gönderiliyor…');
  try{const url=src.url||await src.save();
    if(V.step===1){
      const r=await jpost('/api/voice/phrase',{voiceUrl:url,vocalStart:0,vocalEnd:Math.max(1,Math.min(30,Math.floor(src.dur||10)))});const j=await r.json().catch(()=>({}));if(!r.ok||!j.success)throw new Error(errMsg(j));
      const t=await waitTask(j.task.id,180e3),phrase=t.extra&&t.extra.phrase;if(!phrase)throw new Error('Doğrulama cümlesi alınamadı');
      V.step=2;V.phraseTask=j.task.id;
      $('#vPhrase').hidden=false;$('#vPhrase').innerHTML=`<small>Bu cümleyi kendi sesinle oku ya da söyle</small><b>${esc(phrase)}</b>`;
      $('#vHint').textContent='Cümlenin tamamını net bir sesle kaydet.';$('#toolBody [name=name]').disabled=true;
      VREC=createRecorder($('#vRec'),{minSec:3,maxSec:60,label:'Doğrulama',upload:uploadBlob});
    }else{
      const r=await jpost('/api/voice',{id:uid(),validationTaskId:V.phraseTask,verifyUrl:url,voiceName:name});const j=await r.json().catch(()=>({}));if(!r.ok||!j.success)throw new Error(errMsg(j));
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
const P={el:null,ctx:null,src:null,buf:null,t0:0,off:0,playing:false,cur:null,raf:0,shuffle:false,repeat:false,lyrLines:0,lyrIdx:-1};
const BUF=new Map();
function ctx(){if(!P.ctx){const C=window.AudioContext||window.webkitAudioContext;P.ctx=new C()}if(P.ctx.state==='suspended')P.ctx.resume();return P.ctx}
async function getBuffer(t){const k=t.seed+'|'+t.output+'|'+t.gender;if(BUF.has(k))return BUF.get(k);const b=await synth(t);BUF.set(k,b);if(BUF.size>8)BUF.delete(BUF.keys().next().value);return b}
async function synth(t){
  const r=rng(t.seed),sr=44100,O=window.OfflineAudioContext||window.webkitOfflineAudioContext;
  const kind=t.output,bpm=kind==='beat'?Math.round(130+r()*20):Math.round(78+r()*46),beat=60/bpm,bar=beat*4;
  const bars=Math.max(8,Math.floor(40/bar)),dur=bars*bar+1.8,c=new O(2,Math.ceil(sr*dur),sr);
  const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.connect(c.destination);
  const master=c.createGain();master.gain.value=.85;master.connect(comp);
  const minor=r()>.45,root=45+Math.floor(r()*9);
  const progs=minor?[[[0,3,7],[8,12,15],[3,7,10],[10,14,17]],[[0,3,7],[5,8,12],[10,14,17],[7,10,14]]]:[[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],[[0,4,7],[5,9,12],[9,12,16],[7,11,14]]];
  const prog=progs[Math.floor(r()*progs.length)],scale=minor?[0,3,5,7,10]:[0,2,4,7,9];
  const hasPad=kind!=='beat'&&kind!=='stemv',hasBass=kind!=='stemv',hasDrums=kind!=='stemv',hasLead=kind==='song'||kind==='stemv',half=kind==='beat'||r()>.7;
  const noise=c.createBuffer(1,sr,sr),nd=noise.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  const mt=m=>440*Math.pow(2,(m-69)/12);
  const padF=c.createBiquadFilter();padF.type='lowpass';padF.frequency.value=1300;padF.connect(master);
  const drums=c.createGain();drums.gain.value=kind==='beat'?1:.75;drums.connect(master);
  const leadF=c.createBiquadFilter();leadF.type='lowpass';leadF.frequency.value=2600;const leadG=c.createGain();leadG.gain.value=1;leadF.connect(leadG);leadG.connect(master);
  const dl=c.createDelay(1);dl.delayTime.value=beat*.75;const fb=c.createGain();fb.gain.value=.28;const wet=c.createGain();wet.gain.value=.35;leadG.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(master);
  function tone(type,f,time,len,vol,dest,att){const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(vol,time+att);g.gain.exponentialRampToValueAtTime(.0001,time+len);o.connect(g);g.connect(dest);o.start(time);o.stop(time+len+.05)}
  function kick(t){const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.13);g.gain.setValueAtTime(.95,t);g.gain.exponentialRampToValueAtTime(.001,t+(kind==='beat'?.6:.35));o.connect(g);g.connect(drums);o.start(t);o.stop(t+.65)}
  function snare(t){const s=c.createBufferSource();s.buffer=noise;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1900;const g=c.createGain();g.gain.setValueAtTime(.4,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);s.connect(f);f.connect(g);g.connect(drums);s.start(t);s.stop(t+.22);tone('triangle',185,t,.1,.16,drums,.002)}
  function hat(t,v){const s=c.createBufferSource();s.buffer=noise;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=7800;const g=c.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);s.connect(f);f.connect(g);g.connect(drums);s.start(t);s.stop(t+.06)}
  function voice(f,t,len){const o=c.createOscillator(),o2=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.type='sawtooth';o2.type='sine';o.frequency.value=f;o2.frequency.value=f;l.frequency.value=5.3;lg.gain.value=f*.011;l.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.075,t+.07);g.gain.setValueAtTime(.065,t+len*.7);g.gain.exponentialRampToValueAtTime(.001,t+len+.1);o.connect(g);o2.connect(g);g.connect(leadF);[o,o2,l].forEach(x=>{x.start(t);x.stop(t+len+.15)})}
  let last=4;const oct=t.gender==='m'?12:24;
  for(let b=0;b<bars;b++){
    const t0=.25+b*bar,ch=prog[b%4],intro=b<2,brk=bars>10&&b===bars-3;
    if(hasPad)ch.forEach(iv=>{tone('sawtooth',mt(root+12+iv),t0,bar*.98,.035,padF,.35);tone('sawtooth',mt(root+12+iv)*1.005,t0,bar*.98,.022,padF,.4)});
    if(kind==='beat'&&!intro)[0,2.5].forEach(q=>ch.forEach(iv=>tone('square',mt(root+24+iv),t0+q*beat,beat*.35,.018,padF,.005)));
    if(hasBass&&!intro)for(let q=0;q<4;q++){if(half&&q%2)continue;tone(kind==='beat'?'sine':'triangle',mt(root-12+ch[0]),t0+q*beat,beat*(half?1.8:.9),kind==='beat'?.5:.3,master,.006)}
    if(hasDrums&&b>0&&!brk)for(let s=0;s<16;s++){const st=t0+s*beat/4;
      if((half?[0,10]:[0,8]).includes(s)||(kind==='beat'&&s===7&&r()>.5))kick(st);
      if((half?[8]:[4,12]).includes(s))snare(st);
      if(s%2===0||(kind==='beat'&&r()>.55))hat(st,s%4===2?.08:.045)}
    if(hasLead&&!intro&&!brk)for(let s=0;s<8;s++){if(r()<.3)continue;last=Math.max(0,Math.min(9,last+Math.floor(r()*5)-2));const m=root+oct+scale[last%5]+12*Math.floor(last/5);voice(mt(m),t0+s*beat/2,beat/2*(r()>.7?2:1)*.95)}
  }
  return await c.startRendering();
}
function peaks(b,n){const d=b.getChannelData(0),size=Math.floor(d.length/n),out=[];let mx=0;for(let i=0;i<n;i++){let m=0;for(let j=i*size;j<(i+1)*size;j+=64){const v=Math.abs(d[j]);if(v>m)m=v}out.push(m);if(m>mx)mx=m}return out.map(v=>v/(mx||1))}



/* ---------- player ---------- */
async function play(id,openFull){
  const t=S.lib.find(x=>x.id===id);if(!t)return;if(t.status!=='ready'){toast('Hâlâ üretiliyor');return}
  if(P.cur&&P.cur.id===id&&hasMedia()){if(openFull){if(!P.playing)toggle();openPlayer()}else toggle();return}
  stopSrc();P.cur=t;P.buf=null;P.off=0;P.playing=false;syncMini();syncPlayer();setLoading(true);if(openFull)openPlayer();
  if(t.audioUrl){const el=P.el||(P.el=mkEl());el.src=t.audioUrl;try{await el.play()}catch(e){if(P.cur===t){setLoading(false);toast('Çalınamadı')}}mediaSession();return}
  ctx();
  let buf;try{buf=await getBuffer(t)}catch(e){setLoading(false);toast('Ses oluşturulamadı');return}
  if(!P.cur||P.cur.id!==id)return;P.buf=buf;setLoading(false);startSrc(0);mediaSession();
}
function startSrc(off){const c=ctx(),s=c.createBufferSource();s.buffer=P.buf;s.connect(c.destination);
  s.onended=()=>{if(P.src!==s)return;P.src=null;P.playing=false;P.off=0;if(P.repeat){startSrc(0);return}syncIcons();next(true)};
  s.start(0,off);P.src=s;P.t0=c.currentTime;P.off=off;P.playing=true;syncIcons();loop()}
function mkEl(){const el=new Audio();el.preload='auto';el.playsInline=true;
  el.addEventListener('playing',()=>{if(!isEl())return;P.playing=true;setLoading(false);loop()});
  el.addEventListener('pause',()=>{if(!isEl())return;P.playing=false;syncIcons()});
  el.addEventListener('waiting',()=>{if(isEl())setLoading(true)});
  el.addEventListener('ended',()=>{if(!isEl())return;if(P.repeat){el.currentTime=0;el.play();return}P.playing=false;syncIcons();next(true)});
  return el}
const isEl=()=>!!(P.el&&P.cur&&P.cur.audioUrl);
const hasMedia=()=>!!(P.buf||isEl());
const dur=()=>isEl()?(isFinite(P.el.duration)?P.el.duration:0):(P.buf?P.buf.duration:0);
function stopSrc(){if(P.el&&!P.el.paused)P.el.pause();if(P.src){const s=P.src;P.src=null;try{s.onended=null;s.stop()}catch(e){}}}
function stopAll(){stopSrc();if(P.el)P.el.removeAttribute('src');P.playing=false;P.cur=null;P.buf=null;syncMini();closeLayer($('#fp'))}
function pos(){if(isEl())return P.el.currentTime||0;if(!P.buf)return 0;return P.playing?Math.min(P.off+P.ctx.currentTime-P.t0,P.buf.duration):P.off}
function toggle(){if(isEl()){if(P.el.paused)P.el.play().catch(()=>{});else P.el.pause();return}if(!P.buf)return;if(P.playing){P.off=pos();stopSrc();P.playing=false;syncIcons();tick()}else startSrc(P.off>=P.buf.duration-.05?0:P.off)}
function seek(p){if(isEl()){const d=dur();if(d)P.el.currentTime=Math.max(0,Math.min(.999,p))*d;tick();return}if(!P.buf)return;const o=Math.max(0,Math.min(.999,p))*P.buf.duration;if(P.playing){stopSrc();startSrc(o)}else{P.off=o;tick()}}
const queue=()=>S.lib.filter(t=>t.status==='ready');
function qi(){return queue().findIndex(t=>P.cur&&t.id===P.cur.id)}
function next(auto){const q=queue();if(!q.length)return;const i=qi();let n;if(P.shuffle&&q.length>1){do n=Math.floor(Math.random()*q.length);while(n===i)}else n=i+1;if(n>=q.length){if(auto)return;n=0}play(q[n].id,false)}
function prev(){if(pos()>3){seek(0);return}const q=queue(),i=qi();if(i>0)play(q[i-1].id,false);else seek(0)}
function loop(){cancelAnimationFrame(P.raf);const f=()=>{tick();if(P.playing)P.raf=requestAnimationFrame(f)};f()}
function tick(){
  const d=dur(),p=d?pos()/d:0;
  $('#miniProg').style.width=p*100+'%';$('#fpFill').style.width=p*100+'%';$('#fpCur').textContent=fmt2(pos());$('#fpDur').textContent=d?fmt2(d):'--:--';
  if(L.words.length)lyrTick(pos());
  else if(P.lyrLines){const i=Math.min(P.lyrLines-1,Math.floor(p*P.lyrLines));if(i!==P.lyrIdx){P.lyrIdx=i;$$('#fpLyr .l').forEach(l=>l.classList.toggle('on',+l.dataset.i===i))}}
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
  box.innerHTML=lines.map(l=>/^\[.*\]$/.test(l)?`<div class="s">${esc(l.slice(1,-1))}</div>`:`<div class="l" data-i="${n++}">${esc(l)}</div>`).join('');
  P.lyrLines=n;P.lyrIdx=-1;$('#lyrCard').hidden=!n;
  st.textContent=L.busy.has(t.id)?'EŞLENİYOR…':'';st.className='lyr-st';
}
function lyrTick(time,force){
  const W=L.words;let lo=0,hi=W.length-1,wi=-1;while(lo<=hi){const m=(lo+hi)>>1;if(W[m].s<=time+.05){wi=m;lo=m+1}else hi=m-1}
  if(wi===L.wi&&!force)return;
  const from=force||wi<L.wi?0:L.wi+1;if(force||wi<L.wi)W.forEach(w=>w.el.classList.remove('sung'));
  for(let i=from;i<=wi;i++)W[i].el.classList.add('sung');L.wi=wi;
  const li=wi<0?-1:W[wi].li;if(li===L.li&&!force)return;L.li=li;
  L.lines.forEach((l,i)=>{l.el.classList.toggle('on',i===li);l.el.classList.toggle('past',i<li)});
  const box=$('#fpLyr'),el=li>=0?L.lines[li].el:null;
  if(el&&Date.now()-L.hold>3000)box.scrollTo({top:el.offsetTop-box.clientHeight/2+el.offsetHeight/2,behavior:force?'auto':'smooth'});
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
function setLoading(on){$('#miniPlay').classList.toggle('loading',on);$('#fpPlay').classList.toggle('loading',on);if(on){$('#miniPlay').innerHTML=ic('refresh',20);$('#fpPlay').innerHTML=ic('refresh',40)}else syncIcons()}
function syncIcons(){$('#miniPlay').innerHTML=ic(P.playing?'pause':'play',20);$('#fpPlay').innerHTML=ic(P.playing?'pauseXL':'playXL',56);$('#fpShuf').classList.toggle('on',P.shuffle);$('#fpRep').classList.toggle('on',P.repeat);renderFeed();if(S.view==='library')renderLib()}
function syncMini(){const t=P.cur;$('#mini').hidden=!t;if(!t)return;$('#miniArt').innerHTML=art(t);$('#miniTitle').textContent=t.title;$('#miniSub').textContent=KIND[t.output]}
function syncPlayer(){
  const t=P.cur;if(!t)return;const q=queue(),i=qi();
  $('#fpArt').innerHTML=art(t);$('#fpTint').innerHTML=art(t);
  const pv=q[i-1],nx=q[i+1];$('#peekPrev').innerHTML=pv?art(pv):'';$('#peekNext').innerHTML=nx?art(nx):'';
  $('#peekPrev').style.visibility=pv?'visible':'hidden';$('#peekNext').style.visibility=nx?'visible':'hidden';
  $('#fpTitle').textContent=t.title;$('#fpSub').innerHTML=`${esc(KIND[t.output])} · <span class="tag">${esc((t.model||'V6').replace('_',' '))}</span>`;
  $('#fpPills').innerHTML=`<div class="pill-split"><button id="pLike" class="${t.like===1?'on':''}" aria-label="Beğen">${ic('thumbUp',24)}</button><button id="pDis" class="${t.like===-1?'on':''}" aria-label="Beğenme">${ic('thumbDown',24)}</button></div>
    <button class="pill" data-ft="cover">${ic('cover',22)}Cover</button><button class="pill" data-ft="extend">${ic('extend',22)}Uzat</button>${t.kind?'':`<button class="pill" data-ft="stems">${ic('stems',22)}Stem</button>`}<button class="pill" data-ft="share">${ic('share',22)}Paylaş</button>`;
  $('#pLike').onclick=()=>setLike(t,1);$('#pDis').onclick=()=>setLike(t,-1);
  const d=new Date(t.created||Date.now());$('#fpAbout').textContent=`${d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'})} · ${(t.model||'V6').replace('_',' ')}`;
  const par=t.parent&&S.lib.find(x=>x.id===t.parent);$('#fpParent').innerHTML=par?`<button class="src-row" data-parent="${par.id}"><span class="av">${art(par)}</span><span>${esc(par.title)}</span>${ic('chevR',18)}</button>`:'';
  $('#fpStyle').textContent=t.style||KIND[t.output];
  renderLyr(t);ensureAlign(t);
}
$('#fpPills').addEventListener('click',e=>{const b=e.target.closest('[data-ft]');if(!b||!P.cur)return;if(b.dataset.ft==='share')return share(P.cur);openTool(b.dataset.ft,P.cur.id)});
$('#fpParent').addEventListener('click',e=>{const b=e.target.closest('[data-parent]');if(b)play(b.dataset.parent,false)});
function openPlayer(){syncPlayer();const fp=$('#fp');fp.classList.add('open');fp.setAttribute('aria-hidden','false');if(!stack.includes(fp))stack.push(fp);fp.scrollTop=0}
function mediaSession(){if(!('mediaSession' in navigator)||!P.cur)return;try{navigator.mediaSession.metadata=new MediaMetadata({title:P.cur.title,artist:'SoundForge',album:KIND[P.cur.output]});
  navigator.mediaSession.setActionHandler('play',()=>{if(!P.playing)toggle()});navigator.mediaSession.setActionHandler('pause',()=>{if(P.playing)toggle()});
  navigator.mediaSession.setActionHandler('nexttrack',()=>next());navigator.mediaSession.setActionHandler('previoustrack',()=>prev())}catch(e){}}
$('#miniPlay').onclick=()=>hasMedia()&&toggle();$('#miniOpen').onclick=openPlayer;
$('#fpPlay').onclick=()=>hasMedia()&&toggle();$('#fpNext').onclick=()=>next();$('#fpPrev').onclick=prev;
$('#peekNext').onclick=()=>next();$('#peekPrev').onclick=()=>{const q=queue(),i=qi();if(i>0)play(q[i-1].id,false)};
$('#fpShuf').onclick=()=>{P.shuffle=!P.shuffle;syncIcons()};$('#fpRep').onclick=()=>{P.repeat=!P.repeat;syncIcons()};
$('#fpMore').onclick=()=>P.cur&&openMenu(P.cur.id);
$('#styleCopy').onclick=()=>P.cur&&copy(P.cur.style||'');$('#lyrCopy').onclick=()=>P.cur&&copy(P.cur.lyrics||(P.cur.aligned||[]).map(x=>x.w).join(' ').replace(/\s*\n\s*/g,'\n'));
$('#styleRemix').onclick=()=>{if(!P.cur)return;closeLayer($('#fp'));openCreate('custom',{style:P.cur.style})};
swipeClose($('#fpGrab'),$('#fp'));
(()=>{const b=$('#fpBar');let drag=false;const at=e=>{const r=b.getBoundingClientRect();seek((e.clientX-r.left)/r.width)};
  b.addEventListener('pointerdown',e=>{drag=true;b.setPointerCapture(e.pointerId);at(e)});b.addEventListener('pointermove',e=>drag&&at(e));b.addEventListener('pointerup',()=>drag=false)})();

/* ---------- boot ---------- */
applyTheme();renderSugs();initExplore();requestAnimationFrame(moveInd);syncCreate();renderAll();syncIcons();detectLive();
try{new ResizeObserver(()=>document.documentElement.style.setProperty('--dock',$('#dock').offsetHeight+'px')).observe($('#dock'))}catch(e){document.documentElement.style.setProperty('--dock','140px')}
