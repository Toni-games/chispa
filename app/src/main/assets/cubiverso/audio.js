/* Cubiverso · sonido y música
   - Efectos generados con Web Audio (sin archivos)
   - Canciones originales compuestas para el Cubiverso (secuenciador propio)
   - Tu propia música: archivos de audio guardados en el dispositivo (IndexedDB)
*/
(function(){
if(window.CubiAudio)return;
const SKEY='cubi-audio';
const DEF={music:.55,sfx:.75,muted:false,track:'auto',shuffle:false};
function load(){try{return Object.assign({},DEF,JSON.parse(localStorage.getItem(SKEY)||'{}'))}catch(e){return Object.assign({},DEF)}}
let S=load();
function persist(){try{localStorage.setItem(SKEY,JSON.stringify(S))}catch(e){}}
window.addEventListener('storage',e=>{if(e.key===SKEY){S=load();applyVol();emit()}});

let ctx=null,master,mus,fx,noiseBuf,unlocked=false;
function ac(){
  if(ctx)return ctx;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{ctx=new AC()}catch(e){return null}
  master=ctx.createGain();master.connect(ctx.destination);
  const comp=ctx.createDynamicsCompressor?ctx.createDynamicsCompressor():null;
  mus=ctx.createGain();fx=ctx.createGain();
  if(comp){mus.connect(comp);fx.connect(comp);comp.connect(master)}else{mus.connect(master);fx.connect(master)}
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate*1,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  applyVol();return ctx}
function applyVol(){if(!ctx)return;const m=S.muted?0:1;mus.gain.value=S.music*m*.5;fx.gain.value=S.sfx*m*.6;if(userEl)userEl.volume=Math.min(1,S.music*m)}
function unlock(){const c=ac();if(!c)return;if(c.state==='suspended')c.resume();if(!unlocked){unlocked=true;if(pending){const p=pending;pending=null;play(p,true)}}}
['pointerdown','keydown','touchstart'].forEach(ev=>window.addEventListener(ev,unlock,{capture:true,passive:true}));

/* ---------- utilidades de síntesis ---------- */
const mtof=m=>440*Math.pow(2,(m-69)/12);
function tone(f,dur,o){o=o||{};const c=ac();if(!c||!unlocked)return;const t=c.currentTime+(o.at||0);
  const os=c.createOscillator(),g=c.createGain();os.type=o.type||'square';os.frequency.setValueAtTime(f,t);
  if(o.to)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.to),t+dur);
  const v=(o.vol==null?.3:o.vol);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.att||.005));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let out=os;if(o.lp){const f2=c.createBiquadFilter();f2.type='lowpass';f2.frequency.value=o.lp;os.connect(f2);out=f2}
  out.connect(g);g.connect(o.dest||fx);os.start(t);os.stop(t+dur+.05)}
function noise(dur,o){o=o||{};const c=ac();if(!c||!unlocked)return;const t=c.currentTime+(o.at||0);
  const s=c.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=c.createBiquadFilter();f.type=o.ft||'lowpass';f.frequency.setValueAtTime(o.f||2000,t);
  if(o.fto)f.frequency.exponentialRampToValueAtTime(o.fto,t+dur);
  const g=c.createGain(),v=o.vol==null?.3:o.vol;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(f);f.connect(g);g.connect(o.dest||fx);s.start(t);s.stop(t+dur+.05)}
const arp=(notes,step,o)=>notes.forEach((m,i)=>tone(mtof(m),(o&&o.len)||step*1.6,Object.assign({},o,{at:i*step})));

/* ---------- efectos ---------- */
const last={};
const SFX={
  click:()=>tone(900,.05,{type:'square',vol:.12,to:600}),
  hover:()=>tone(1400,.03,{type:'sine',vol:.05}),
  open:()=>arp([72,79],.05,{type:'triangle',vol:.18}),
  close:()=>arp([79,72],.05,{type:'triangle',vol:.15}),
  tab:()=>tone(660,.06,{type:'triangle',vol:.15,to:880}),
  buy:()=>{arp([72,76,79,84],.06,{type:'square',vol:.13});noise(.2,{f:6000,ft:'highpass',vol:.06,at:.18})},
  cash:()=>{tone(1318,.08,{type:'square',vol:.1});tone(1760,.25,{type:'square',vol:.1,at:.07})},
  coin:()=>{tone(988,.06,{type:'square',vol:.12});tone(1319,.18,{type:'square',vol:.12,at:.06})},
  equip:()=>{noise(.12,{f:1200,fto:5000,ft:'bandpass',vol:.25});tone(520,.1,{type:'triangle',vol:.15,to:780,at:.04})},
  error:()=>{tone(220,.12,{type:'square',vol:.14});tone(165,.2,{type:'square',vol:.14,at:.11})},
  notify:()=>arp([76,83],.08,{type:'sine',vol:.2,len:.3}),
  jump:()=>tone(280,.16,{type:'square',vol:.1,to:620,lp:2200}),
  land:()=>noise(.08,{f:500,vol:.18}),
  step:()=>noise(.05,{f:900+Math.random()*500,vol:.07}),
  climb:()=>noise(.05,{f:2500,ft:'bandpass',vol:.08}),
  hit:()=>{noise(.12,{f:1600,vol:.3});tone(150,.12,{type:'square',vol:.15,to:70})},
  kick:()=>{tone(160,.18,{type:'sine',vol:.5,to:45});noise(.06,{f:3000,vol:.2})},
  pop:()=>{tone(500,.07,{type:'sine',vol:.3,to:1400});noise(.05,{f:4000,ft:'highpass',vol:.12})},
  splash:()=>{noise(.45,{f:3000,fto:400,vol:.35});tone(900,.12,{type:'sine',vol:.08,to:300,at:.02})},
  throw:()=>noise(.18,{f:600,fto:3000,ft:'bandpass',vol:.25}),
  whoosh:()=>noise(.3,{f:400,fto:2400,ft:'bandpass',vol:.25}),
  shoot:()=>tone(880,.12,{type:'sawtooth',vol:.1,to:220,lp:3000}),
  laser:()=>tone(1800,.15,{type:'sawtooth',vol:.08,to:300,lp:4000}),
  freeze:()=>{arp([96,91,98,93],.04,{type:'sine',vol:.1,len:.2});noise(.3,{f:7000,ft:'highpass',vol:.08})},
  boom:()=>{noise(.6,{f:1200,fto:80,vol:.5});tone(90,.5,{type:'sine',vol:.4,to:30})},
  place:()=>{tone(320,.08,{type:'square',vol:.12,lp:1500});noise(.06,{f:1500,vol:.15,at:.02})},
  remove:()=>tone(500,.14,{type:'square',vol:.1,to:160,lp:1800}),
  win:()=>{arp([72,76,79,84,88,91],.09,{type:'square',vol:.12});arp([60,67,72],.27,{type:'triangle',vol:.15,len:.6})},
  lose:()=>arp([67,63,60,55],.16,{type:'triangle',vol:.18,len:.3}),
  levelup:()=>arp([67,72,76,79,84],.07,{type:'square',vol:.12}),
  checkpoint:()=>arp([79,84,88],.07,{type:'triangle',vol:.2}),
  boing:()=>tone(160,.35,{type:'sine',vol:.35,to:700}),
  fall:()=>tone(800,.6,{type:'triangle',vol:.15,to:120}),
  bite:()=>{tone(1200,.05,{type:'square',vol:.12});tone(1200,.05,{type:'square',vol:.12,at:.1})},
  reel:()=>noise(.04,{f:3500,ft:'bandpass',vol:.12}),
  fish:()=>{noise(.3,{f:2500,fto:500,vol:.3});arp([72,76,79],.08,{type:'triangle',vol:.18})},
  steal:()=>{tone(600,.06,{type:'square',vol:.12});tone(450,.06,{type:'square',vol:.12,at:.07});tone(800,.12,{type:'square',vol:.12,at:.14})},
  alarm:()=>{for(let i=0;i<3;i++){tone(880,.12,{type:'square',vol:.1,at:i*.25});tone(660,.12,{type:'square',vol:.1,at:i*.25+.12})}},
  lucky:()=>{arp([84,88,91,96],.05,{type:'sine',vol:.15,len:.25});noise(.4,{f:8000,ft:'highpass',vol:.06})},
  horn:()=>{tone(330,.35,{type:'sawtooth',vol:.08,lp:1200});tone(415,.35,{type:'sawtooth',vol:.08,lp:1200})},
  train:()=>{tone(523,.5,{type:'triangle',vol:.12});tone(659,.5,{type:'triangle',vol:.12});tone(784,.5,{type:'triangle',vol:.1})},
  thunder:()=>noise(1.4,{f:600,fto:60,vol:.45}),
  phone:()=>{for(let i=0;i<2;i++)arp([88,84],.06,{type:'sine',vol:.12,at:i*.3})},
  emote:()=>arp([79,83,86],.06,{type:'sine',vol:.15}),
  tick:()=>tone(1500,.02,{type:'square',vol:.06}),
  wave:()=>arp([55,55,62],.18,{type:'sawtooth',vol:.12,lp:1400,len:.25}),
  daily:()=>{arp([72,76,79,84,79,84,88],.08,{type:'square',vol:.12});noise(.6,{f:7000,ft:'highpass',vol:.05,at:.4})}
};
function sfx(name){if(S.muted||!S.sfx)return;const f=SFX[name];if(!f)return;const now=performance.now();if(last[name]&&now-last[name]<35)return;last[name]=now;try{f()}catch(e){}}

/* ---------- canciones originales ----------
   Notación: grados de la escala (1-7), ' = octava arriba, , = octava abajo,
   . = silencio, - = mantener. Cada símbolo es una corchea. Un acorde por compás. */
const SC={may:[0,2,4,5,7,9,11],men:[0,2,3,5,7,8,10]};
const TRACKS=[
  {id:'bienvenida',name:'Bienvenida al Cubiverso',mood:'Alegre',bpm:112,root:60,sc:'may',lead:'square',pad:'triangle',bass:'triangle',
   ch:[1,5,6,4,1,5,4,5],
   mel:"5 - 3 5 6 5 3 . | 2 - 5, 2 4 3 2 . | 3 - 1 3 6 - 5 . | 4 3 2 1 2 - . . | 5 - 3 5 1' - 7 6 | 5 - 7, 2 5 4 3 2 | 1 - 6, 1 4 3 2 1 | 2 - - 5, 7, - . .",
   dr:{k:'x...x...',s:'..x...x.',h:'.x.x.x.x'},bp:'x..x.x..'},
  {id:'aventura',name:'Aventura de bloques',mood:'Enérgica',bpm:132,root:62,sc:'may',lead:'square',pad:'sawtooth',bass:'square',
   ch:[1,4,1,5,6,4,5,5],
   mel:"1 . 1 2 3 . 5 . | 6 . 5 4 3 . 1 . | 3 . 3 4 5 . 1' . | 7 . 6 5 2 . . . | 6 . 6 7 1' . 6 . | 4 . 5 6 5 . 4 3 | 2 . 3 4 5 - 6 7 | 1' - - . 5 . . .",
   dr:{k:'x..x.x..',s:'..x...x.',h:'xxxxxxxx'},bp:'x.xx.x.x'},
  {id:'lago',name:'Lago tranquilo',mood:'Relajada',bpm:76,root:65,sc:'may',lead:'sine',pad:'sine',bass:'sine',
   ch:[1,6,4,5,1,3,4,1],
   mel:"3 - - 5 - - 6 5 | 3 - - 2 - - 1 - | 6, - 1 2 - 3 - - | 2 - - - . . . . | 3 - - 5 - - 1' 6 | 5 - - 3 - - 2 3 | 1 - - 6, - 1 - 2 | 1 - - - . . . .",
   dr:{k:'x.......',s:'',h:'..x...x.'},bp:'x...x...'},
  {id:'batalla',name:'Batalla de globos',mood:'Rápida',bpm:150,root:57,sc:'men',lead:'sawtooth',pad:'square',bass:'sawtooth',
   ch:[1,6,7,1,1,4,5,5],
   mel:"1 . 1 . 3 . 5 4 | 3 . 1 . 6, - 7, . | 7, . 7, . 2 . 4 3 | 2 . 1 . 5, - . . | 5 . 5 6 5 . 3 . | 4 . 4 5 4 . 1 . | 5 . 6 7 1' . 7 6 | 5 - - . 5, . . .",
   dr:{k:'x.x.x.x.',s:'..x...x.',h:'xxxxxxxx'},bp:'xxxxxxxx'},
  {id:'neon',name:'Ciudad neón',mood:'Nocturna',bpm:118,root:64,sc:'men',lead:'square',pad:'sawtooth',bass:'sawtooth',
   ch:[1,6,3,7,1,6,4,5],
   mel:"1 . 3 5 . 3 7 . | 6 - 5 3 . 1 . . | 3 . 5 7 . 5 2' . | 1' - 7 5 . 2 . . | 1 . 3 5 . 3 7 1' | 6 - 5 3 . 4 . 3 | 2 . 3 5 . 7 . 6 | 5 - - 1 - - . .",
   dr:{k:'x...x...',s:'....x...',h:'x.xxx.xx'},bp:'x.x.x.xx'},
  {id:'fiesta',name:'Fiesta del brainrot',mood:'Divertida',bpm:126,root:67,sc:'may',lead:'square',pad:'triangle',bass:'square',
   ch:[1,4,6,5],
   mel:"1 1 . 3 . 5 . 6 | 5 . 4 . 3 . 2 . | 6, 6, . 1 . 3 . 4 | 3 . 2 . 1 . 5, .",
   dr:{k:'x..x..x.',s:'..x...x.',h:'.x.x.x.x'},bp:'x.xx..x.'},
  {id:'nana',name:'Buenas noches, cubo',mood:'Calma',bpm:68,root:69,sc:'may',lead:'triangle',pad:'sine',bass:'sine',
   ch:[1,4,1,5,6,4,5,1],
   mel:"5 - - 3 - - 1 - | 6 - - 4 - - 2 - | 3 - 4 5 - - 3 - | 2 - - - - - . . | 3 - 2 1 - - 6, - | 1 - 2 4 - - 6 - | 5 - 4 3 - - 2 - | 1 - - - - - . .",
   dr:{k:'',s:'',h:''},bp:'x.......'}
];
TRACKS.forEach(t=>{t.notes=t.mel.replace(/\|/g,' ').trim().split(/\s+/)});
function deg(t,d,oct){const sc=SC[t.sc];d=d-1;const o=Math.floor(d/7);return t.root+sc[((d%7)+7)%7]+12*(o+(oct||0))}
function parseTok(tok){if(tok==='.'||tok==='-')return null;let o=0;while(tok.endsWith("'")){o++;tok=tok.slice(0,-1)}while(tok.endsWith(',')){o--;tok=tok.slice(0,-1)}return{d:+tok,o}}

function voice(f,t,dur,type,vol,dest,lp){const os=ctx.createOscillator(),g=ctx.createGain();os.type=type;os.frequency.value=f;
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.setValueAtTime(vol,t+dur*.7);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  let o=os;if(lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;os.connect(fl);o=fl}o.connect(g);g.connect(dest);os.start(t);os.stop(t+dur+.05)}
function drum(kind,t){
  if(kind==='k'){const os=ctx.createOscillator(),g=ctx.createGain();os.frequency.setValueAtTime(140,t);os.frequency.exponentialRampToValueAtTime(40,t+.15);g.gain.setValueAtTime(.7,t);g.gain.exponentialRampToValueAtTime(0.0001,t+.2);os.connect(g);g.connect(mus);os.start(t);os.stop(t+.25)}
  else{const s=ctx.createBufferSource();s.buffer=noiseBuf;const f=ctx.createBiquadFilter(),g=ctx.createGain();
    if(kind==='s'){f.type='bandpass';f.frequency.value=1800;g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(0.0001,t+.14)}
    else{f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(0.0001,t+.04)}
    s.connect(f);f.connect(g);g.connect(mus);s.start(t);s.stop(t+.2)}}

let seq=null; // {t, step, next, timer}
function startSeq(tr){stopSeq();const c=ac();if(!c)return;seq={tr,step:0,next:c.currentTime+.08};seq.timer=setInterval(schedule,40);schedule()}
function stopSeq(){if(seq){clearInterval(seq.timer);seq=null}}
function schedule(){if(!seq||!ctx)return;const tr=seq.tr,e=60/tr.bpm/2;
  while(seq.next<ctx.currentTime+.18){const i=seq.step%tr.notes.length,t=seq.next,bar=Math.floor(i/8),pos=i%8,chord=tr.ch[bar%tr.ch.length];
    // melodía
    const tk=parseTok(tr.notes[i]);if(tk){let len=1;while(tr.notes[(i+len)%tr.notes.length]==='-'&&len<8)len++;
      voice(mtof(deg(tr,tk.d,tk.o+1)),t,e*len*.95,tr.lead,tr.lead==='sine'?.16:.075,mus,tr.lead==='sawtooth'?2600:0)}
    // acorde de fondo al empezar el compás
    if(pos===0)[0,2,4].forEach(k=>voice(mtof(deg(tr,chord+k,0)),t,e*8*.98,tr.pad,tr.pad==='sine'?.05:.022,mus,tr.pad==='sawtooth'?900:0));
    // bajo
    if(tr.bp[pos]==='x')voice(mtof(deg(tr,chord,-1)),t,e*.9,tr.bass,tr.bass==='sine'?.22:.1,mus,tr.bass==='triangle'||tr.bass==='sine'?0:700);
    // batería
    ['k','s','h'].forEach(k=>{const p=tr.dr[k];if(p&&p[pos]==='x')drum(k,t)});
    seq.next+=e;seq.step++;
  }}

/* ---------- tu música (IndexedDB) ---------- */
let db=null;
function idb(){return new Promise((res,rej)=>{if(db)return res(db);if(!window.indexedDB)return rej('no idb');const r=indexedDB.open('cubi-musica',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('tracks',{keyPath:'id'});r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>rej(r.error)})}
let USER=[]; // {id,name,size}
function refreshUser(){return idb().then(d=>new Promise(res=>{const out=[];const tx=d.transaction('tracks','readonly');const cur=tx.objectStore('tracks').openCursor();
  cur.onsuccess=()=>{const c=cur.result;if(c){out.push({id:c.value.id,name:c.value.name,size:c.value.size||0,user:true});c.continue()}else{USER=out.sort((a,b)=>a.id<b.id?-1:1);emit();res(USER)}};cur.onerror=()=>res(USER)})).catch(()=>USER)}
function addFiles(files){const list=[...files].filter(f=>/^audio\//.test(f.type)||/\.(mp3|ogg|wav|m4a|aac|flac|opus|webm)$/i.test(f.name));
  if(!list.length)return Promise.resolve(0);
  return idb().then(d=>new Promise((res,rej)=>{const tx=d.transaction('tracks','readwrite'),st=tx.objectStore('tracks');
    list.forEach((f,i)=>st.put({id:'u'+Date.now().toString(36)+i,name:f.name.replace(/\.[^.]+$/,''),size:f.size,blob:f}));
    tx.oncomplete=()=>res(list.length);tx.onerror=()=>rej(tx.error)})).then(n=>refreshUser().then(()=>n))}
function removeUser(id){return idb().then(d=>new Promise(res=>{const tx=d.transaction('tracks','readwrite');tx.objectStore('tracks').delete(id);tx.oncomplete=()=>res()})).then(()=>{if(cur===id)stop();return refreshUser()})}
function renameUser(id,name){return idb().then(d=>new Promise(res=>{const tx=d.transaction('tracks','readwrite'),st=tx.objectStore('tracks');const g=st.get(id);g.onsuccess=()=>{if(g.result){g.result.name=name;st.put(g.result)}};tx.oncomplete=()=>res()})).then(refreshUser)}
let userEl=null,userURL=null;
function playUser(id){return idb().then(d=>new Promise(res=>{const g=d.transaction('tracks','readonly').objectStore('tracks').get(id);g.onsuccess=()=>res(g.result)})).then(rec=>{
  if(!rec)return;stopUser();userURL=URL.createObjectURL(rec.blob);userEl=new Audio(userURL);userEl.loop=false;applyVol();
  userEl.onended=()=>next();const p=userEl.play();if(p&&p.catch)p.catch(()=>{pending=id})})}
function stopUser(){if(userEl){userEl.pause();userEl.src='';userEl=null}if(userURL){URL.revokeObjectURL(userURL);userURL=null}}

/* ---------- reproductor ---------- */
let cur=null,pending=null;const subs=[];
function emit(){subs.forEach(f=>{try{f(api.status())}catch(e){}})}
function play(id,force){
  // si estamos dentro de la plataforma, la música la pone la plataforma
  if(parentAudio())return parentAudio().play(id,force);
  if(!id)id=TRACKS[0].id;
  if(!unlocked){pending=id;cur=id;emit();return}
  if(cur===id&&!force&&(seq||userEl))return;
  stopSeq();stopUser();cur=id;
  const t=TRACKS.find(x=>x.id===id);if(t)startSeq(t);else playUser(id);
  emit()}
function stop(){if(parentAudio())return parentAudio().stop();stopSeq();stopUser();cur=null;pending=null;emit()}
function all(){return TRACKS.map(t=>({id:t.id,name:t.name,mood:t.mood,bpm:t.bpm})).concat(USER)}
function next(dir){if(parentAudio())return parentAudio().next(dir);const L=all();if(!L.length)return;let i=L.findIndex(x=>x.id===cur);
  i=S.shuffle?Math.floor(Math.random()*L.length):(i+(dir||1)+L.length)%L.length;play(L[i].id,true)}
function parentAudio(){try{if(window.parent!==window&&window.parent.CubiAudio&&window.parent.CubiAudio!==api&&location.hash==='#plataforma')return window.parent.CubiAudio}catch(e){}return null}
/* música por juego: respeta la elección del jugador ('auto' = la del juego) */
function gameMusic(id){const pa=parentAudio();if(pa)return pa.gameMusic(id);
  if(window.parent!==window&&location.hash==='#plataforma'){try{window.parent.postMessage({cubiMusic:id},'*')}catch(e){}return}if(S.track==='off')return stop();if(S.track!=='auto'&&S.track)return play(S.track);play(id)}
function set(k,v){S[k]=v;persist();applyVol();if(k==='muted'&&!v&&!cur&&pending)play(pending);emit()}

/* pasos para el personaje propio */
function steps(a,walk,air){if(!a)return;const ph=Math.floor((walk||0)/Math.PI);
  if(a._wasAir===false&&air)sfx('jump');if(a._wasAir&&!air)sfx('land');a._wasAir=!!air;
  if(!air&&a._ph!=null&&ph!==a._ph)sfx('step');a._ph=ph}

/* sonidos automáticos: botones */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button,.k-btn,[data-act],[role=button],.btn,.tab');if(b&&!b.disabled&&!b.dataset.nosound)sfx('click')},true);

let susp=false;
function suspend(){susp=true;if(ctx&&ctx.state==='running')ctx.suspend();if(userEl&&!userEl.paused){userEl.pause();userEl._wasPlaying=true}}
function resume(){if(!susp)return;susp=false;if(ctx&&unlocked)ctx.resume();if(userEl&&userEl._wasPlaying){userEl._wasPlaying=false;const p=userEl.play();if(p&&p.catch)p.catch(()=>{})}}
document.addEventListener('visibilitychange',()=>{if(window.parent!==window)return;if(document.hidden)suspend();else resume()});
const api={suspend,resume,wrap:(n,snd)=>hook(window,n,snd),sfx,play,stop,next,gameMusic,set,get:()=>Object.assign({},S),tracks:all,builtin:TRACKS,user:()=>USER,addFiles,removeUser,renameUser,
  status:()=>({cur,playing:!!(seq||(userEl&&!userEl.paused)),waiting:!unlocked&&!!pending,track:all().find(x=>x.id===cur)||null,settings:Object.assign({},S)}),
  on:f=>{subs.push(f);return()=>subs.splice(subs.indexOf(f),1)},steps,unlock,tone,noise,list:Object.keys(SFX)};
window.CubiAudio=api;
refreshUser();
window.addEventListener('message',e=>{const d=e.data;if(d&&typeof d.cubiMusic==='string'&&window.parent===window)gameMusic(d.cubiMusic.slice(0,40))});

/* enganches suaves con funciones conocidas de los juegos */
function hook(obj,name,snd){try{const f=obj[name];if(typeof f!=='function'||f._snd)return;const w=function(){sfx(typeof snd==='function'?snd.apply(this,arguments):snd);return f.apply(this,arguments)};w._snd=1;obj[name]=w}catch(e){}}
function autoHooks(){if(window.Kit||window.__noAutoSfx)return;
  const byTitle=t=>{t=String(t||'').toUpperCase();
    if(/LLENA|BLOQUEAD|SIN DINERO|NO PUEDES|NO TIENES|AHÍ NO|NO HAY|FALTA|NECESITAS|NO SE PUEDE|MUY LEJOS|NO QUIERE|RECHAZ/.test(t))return 'error';
    if(/TE HAN|PILLAD|CUIDADO|ALERTA|TORMENTA|RAYO/.test(t))return 'alarm';
    if(/ROBAD/.test(t))return 'steal';
    if(/COMPRAD|DESBLOQUE|NUEV|MEJORAD|AMPLIAD/.test(t))return 'buy';
    if(/VENDID|COBRAD|\+|DINERO|PAGO|PREMIO|RECOMPENSA/.test(t))return 'cash';
    if(/NIVEL|RÉCORD|RECORD|GANAS|HAS GANADO|VICTORIA|¡ES TUYO|CAMBIO HECHO|TRATO/.test(t))return 'levelup';
    if(/LUCKY|SUERTE|MASCOTA/.test(t))return 'lucky';
    if(/ENTREGAD|PEDIDO/.test(t))return 'coin';
    return 'notify'};
  ['toast','showToast','notify'].forEach(n=>{if(typeof window[n]==='function')hook(window,n,byTitle)});
  ['popCash','floatCash','coinPop'].forEach(n=>hook(window,n,'cash'))}
if(document.readyState==='complete')setTimeout(autoHooks,0);else window.addEventListener('load',()=>setTimeout(autoHooks,0));
})();
