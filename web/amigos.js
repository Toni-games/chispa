/* Cubiverso · amigos
   Cada jugador tiene un código de amigo fijo. Mientras Cubiverso está abierto (menú o juego) se queda
   "escuchando" con ese código, así sus amigos pueden ver su perfil, saber a qué juega y unirse sin código de sala.
   Conexión directa entre jugadores con PeerJS (no hace falta servidor propio). */
(function(){
if(window.CubiAmigos)return;
/* dentro de la plataforma (juego en un iframe) usamos el de la página principal */
try{if(window.parent!==window&&window.parent.CubiAmigos){window.CubiAmigos=window.parent.CubiAmigos;return}}catch(e){}
const SRC=(document.currentScript&&document.currentScript.src)||'';
const ROOT=SRC.replace(/amigos\.js(\?.*)?$/,'');
const PFX='cubiverso-f1-',KEY='cubiverso-amigos';
const ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const AV=()=>window.CubiAvatar;
let peer=null,open=false,openP=null,H={},tries=0;

/* ---------- datos guardados ---------- */
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(KEY))}catch(e){}d=d&&typeof d==='object'?d:{};
  if(!/^[A-Z2-9]{8}$/.test(d.fid||'')){d.fid='';for(let i=0;i<8;i++)d.fid+=ABC[Math.floor(Math.random()*ABC.length)]}
  d.list=d.list||{};d.req=d.req||{};d.sent=d.sent||{};if(!localStorage.getItem(KEY))save(d);return d}
function save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}}
function upd(f){const d=load();f(d);save(d);emit('change');return d}
const fmt=f=>f?f.slice(0,4)+'-'+f.slice(4):'';
const norm=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').replace(/[O]/g,'0').replace(/[I]/g,'1');
function emit(ev,...a){(H[ev]||[]).forEach(f=>{try{f(...a)}catch(e){console.warn(e)}})}
const clip=(s,n)=>String(s==null?'':s).slice(0,n);

/* ---------- lo que sé de mí ---------- */
function meBasic(){const s=AV()?AV().state():{name:'Jugador',eq:null};return {fid:load().fid,name:clip(s.name||'Jugador',20),eq:s.eq,defs:AV()&&AV().customDefs?AV().customDefs(s.eq):[]}}
function gameTitle(){let t=document.title||'';t=t.split(/\s[·|–-]\s/)[0].trim();return clip(t||'un juego',40)}
function where(){if(API.provider){try{const r=API.provider();if(r)return r}catch(e){}}
  const p=location.pathname;const inGame=/\/juegos\//.test(p);
  if(!inGame)return {where:'menu'};
  let rel=location.href;if(ROOT&&rel.indexOf(ROOT)===0)rel=rel.slice(ROOT.length);else rel='juegos/'+p.split('/juegos/')[1]+location.search;
  rel=rel.replace(/([?&])sala=[^&#]*&?/,'$1').replace(/[?&]$/,'').split('#')[0];
  const M=window.CubiMulti;return {where:'game',title:gameTitle(),url:rel,code:M&&M.code||'',players:M&&M.code?Object.keys(M.players()).length:1,host:window.Sala&&Sala.hostNow?(n=>Sala.hostNow(n)):window.__cubiHost?(n=>window.__cubiHost(n)):null}}
function profile(){const s=AV()?AV().state():{};const d=load();
  const w=where();return Object.assign(meBasic(),{items:(s.owned||[]).length,creations:(s.mine||[]).length,friends:Object.keys(d.list).length,since:d.since||0,status:{where:w.where,title:w.title,room:!!w.code,players:w.players}})}

/* ---------- escuchar ---------- */
function start(){if(openP)return openP;
  openP=new Promise(res=>{if(!window.Peer||!window.RTCPeerConnection){res(false);return}
    const d=load();if(!d.since){d.since=Date.now();save(d)}
    const go=()=>{try{peer=new Peer(PFX+d.fid)}catch(e){res(false);return}
      peer.on('open',()=>{open=true;tries=0;res(true);emit('online')});
      peer.on('connection',c=>serve(c));
      peer.on('disconnected',()=>{try{peer.reconnect()}catch(e){}});
      peer.on('error',e=>{if(e.type==='unavailable-id'){
          /* otra pestaña o la página anterior todavía tiene el código: reintento, y mientras uso uno temporal */
          try{peer.destroy()}catch(_){}if(++tries<6)setTimeout(go,2500);else{peer=new Peer();peer.on('open',()=>{open=true;res(true)});peer.on('error',()=>{})}}
        else if(!open&&e.type!=='peer-unavailable'){res(false)}})};
    go()});
  return openP}
function stop(){try{peer&&peer.destroy()}catch(e){}peer=null;open=false;openP=null}
addEventListener('pagehide',stop);

function known(p){/* actualiza nombre y avatar de un amigo cuando habla conmigo */
  if(!p||!p.fid)return;const d=load();const f=d.list[p.fid];if(!f)return;
  f.name=clip(p.name,20);f.eq=p.eq||f.eq;f.defs=(p.defs||[]).slice(0,8);f.last=Date.now();save(d);regDefs(p)}
function regDefs(p){if(AV()&&AV().register)try{(p.defs||[]).slice(0,8).forEach(x=>AV().register(x))}catch(e){}}
function serve(c){c.on('data',async m=>{if(!m||typeof m!=='object')return;const from=m.me&&/^[A-Z2-9]{8}$/.test(m.me.fid||'')?m.me:null;const d=load();
    const reply=o=>{try{c.send(o)}catch(e){}};
    if(m.t==='q'){if(from)known(from);const isF=!!(from&&d.list[from.fid]);const p=profile();if(!isF)delete p.status;reply({t:'p',p,friend:isF});return}
    if(m.t==='req'&&from){
      if(d.list[from.fid]){known(from);reply({t:'ok',me:meBasic()});return}
      if(d.sent[from.fid]){upd(x=>{delete x.sent[from.fid];x.list[from.fid]=friendRec(from)});regDefs(from);reply({t:'ok',me:meBasic()});emit('new',from);return}
      upd(x=>{x.req[from.fid]={name:clip(from.name,20),eq:from.eq,defs:(from.defs||[]).slice(0,8),at:Date.now()}});regDefs(from);reply({t:'pend'});emit('request',from);return}
    if(m.t==='acc'&&from){if(d.sent[from.fid]||d.list[from.fid]){upd(x=>{delete x.sent[from.fid];x.list[from.fid]=friendRec(from)});emit('new',from)}reply({t:'ok'});return}
    if(m.t==='del'&&from){upd(x=>{delete x.list[from.fid];delete x.req[from.fid]});reply({t:'ok'});return}
    if(m.t==='join'){if(!from||!d.list[from.fid]){reply({t:'no',why:'nofriend'});return}known(from);const w=where();
      if(w.where!=='game'){reply({t:'no',why:'menu'});return}
      if(!w.url){reply({t:'no',why:'creado',title:w.title});return}
      if(w.code){reply({t:'room',code:w.code,url:w.url,title:w.title,extra:w.extra||null});return}
      if(w.host){try{const code=await w.host(from.name);reply({t:'room',code,url:w.url,title:w.title,extra:w.extra||null})}catch(e){reply({t:'no',why:'fail'})}return}
      reply({t:'no',why:'lobby',title:w.title});return}});
  c.on('error',()=>{})}
function friendRec(p){return {name:clip(p.name,20),eq:p.eq,defs:(p.defs||[]).slice(0,8),since:Date.now(),last:Date.now()}}

/* ---------- hablar con otro jugador ---------- */
async function ask(fid,msg,ms){const ok=await start();if(!ok||!peer)throw new Error('noweb');
  return new Promise((res,rej)=>{let done=false,c;const fin=(e,v)=>{if(done)return;done=true;clearTimeout(t);peer.off&&peer.off('error',onErr);try{c&&c.close()}catch(_){}e?rej(e):res(v)};
    const t=setTimeout(()=>fin(new Error('offline')),ms||7000);
    const onErr=e=>{if(e.type==='peer-unavailable'&&String(e.message||'').indexOf(PFX+fid)>=0)fin(new Error('offline'))};peer.on('error',onErr);
    try{c=peer.connect(PFX+fid,{reliable:true})}catch(e){fin(new Error('offline'));return}
    c.on('open',()=>{try{c.send(Object.assign({me:meBasic()},msg))}catch(e){fin(e)}});
    c.on('data',v=>fin(null,v));c.on('error',()=>fin(new Error('offline')))})}

/* ---------- API ---------- */
const API={
  ROOT,fmt,norm,provider:null,
  available:()=>!!(window.Peer&&window.RTCPeerConnection),
  get online(){return open},
  get fid(){return load().fid},
  data:load,
  start,on(ev,f){(H[ev]=H[ev]||[]).push(f)},
  /* perfil y estado de un amigo; null si no está conectado */
  async info(fid){try{const r=await ask(fid,{t:'q'});if(r&&r.t==='p'){const p=r.p;regDefs(p);
      const d=load();if(d.list[fid]){d.list[fid].name=clip(p.name,20);d.list[fid].eq=p.eq;d.list[fid].defs=(p.defs||[]).slice(0,8);d.list[fid].seen=Date.now();save(d)}
      if(r.friend&&d.sent[fid]){upd(x=>{delete x.sent[fid];x.list[fid]=Object.assign(friendRec(p),{seen:Date.now()})});emit('new',p)}
      return Object.assign(p,{friend:r.friend})}}catch(e){if(e.message==='noweb')throw e}return null},
  async add(code){const fid=norm(code);if(!/^[A-Z2-9]{8}$/.test(fid))throw new Error('code');const d=load();if(fid===d.fid)throw new Error('self');
    if(d.list[fid])return 'ya';
    if(d.req[fid]){await API.accept(fid);return 'ok'}
    upd(x=>{x.sent[fid]={at:Date.now(),name:''}});
    try{const r=await ask(fid,{t:'req'});if(r&&r.t==='ok'){upd(x=>{delete x.sent[fid];x.list[fid]=friendRec(r.me||{name:'Amigo'})});regDefs(r.me||{});return 'ok'}return 'pend'}
    catch(e){if(e.message==='noweb')throw e;return 'offline'}},
  async accept(fid){const d=load();const r=d.req[fid];if(!r)return;upd(x=>{delete x.req[fid];x.list[fid]=Object.assign({},r,{since:Date.now(),last:Date.now()})});
    ask(fid,{t:'acc'}).catch(()=>{})},
  reject(fid){upd(x=>{delete x.req[fid]})},
  cancel(fid){upd(x=>{delete x.sent[fid]})},
  remove(fid){upd(x=>{delete x.list[fid]});ask(fid,{t:'del'}).catch(()=>{})},
  /* reintenta las solicitudes que no llegaron (el otro no estaba conectado) */
  async resend(){const d=load();for(const fid of Object.keys(d.sent)){try{const r=await ask(fid,{t:'req'},5000);
      if(r&&r.t==='ok'){upd(x=>{delete x.sent[fid];x.list[fid]=friendRec(r.me||{name:'Amigo'})});emit('new',r.me||{})}
      else if(r&&r.t==='pend'){upd(x=>{if(x.sent[fid])x.sent[fid].delivered=true})}}catch(e){}}},
  /* pide entrar en la partida del amigo: devuelve la dirección del juego con el código de sala */
  async join(fid){let r=null;for(let k=0;k<4;k++){r=await ask(fid,{t:'join'},15000);if(!r)throw new Error('offline');if(r.t!=='no'||r.why!=='lobby')break;await new Promise(z=>setTimeout(z,2000))}
    if(r.t==='room'){const u=r.url+(r.url.indexOf('?')>=0?'&':'?')+'sala='+encodeURIComponent(r.code);return {url:ROOT+u,rel:u,code:r.code,title:r.title,extra:r.extra||null}}
    throw new Error(r.why||'fail')},
  joinText(e){const m=e&&e.message||'';return {offline:'Tu amigo ya no está conectado.',menu:'Tu amigo está en el menú, no en un juego.',
    lobby:'El juego de tu amigo no ha podido abrir la sala. Comprobad que los dos tenéis la última versión de Cubiverso (cerrad y abrid la app).',nofriend:'Todavía no sois amigos en los dos lados.',creado:'Tu amigo está creando un juego en el editor de CuboStudio. Cuando le dé a jugar, podrás unirte.',fail:'Tu amigo no ha podido abrir la sala. Prueba otra vez.',noweb:'Esto funciona en la app de Cubiverso y en su web, no dentro de Claude.'}[m]||'No se ha podido entrar. Prueba otra vez.'}
};
window.CubiAmigos=API;
/* Los juegos empiezan a escuchar enseguida para que los amigos los vean jugando */
if(/\/juegos\//.test(location.pathname))setTimeout(start,800);
})();
