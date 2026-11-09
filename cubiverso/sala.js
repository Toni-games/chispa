/* Cubiverso · multijugador para cualquier juego.
   Botón AMIGOS para crear o unirse a una sala en cualquier momento, ver a los demás con su avatar,
   gestos, chat, marcador y empezar todos a la vez. Usa CubiMulti (multi.js) y Kit (kit.js). */
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CSS=`
#s-bar{position:fixed;z-index:45;right:max(8px,env(safe-area-inset-right,0px));top:calc(env(safe-area-inset-top,0px) + 108px);display:flex;flex-direction:column;gap:6px;font-family:"Nunito","Segoe UI",system-ui,sans-serif}
#s-bar button{border:3px solid #000;border-radius:12px;padding:5px 9px;font:900 12px "Nunito","Segoe UI",system-ui,sans-serif;color:#fff;background:#3fa7ff;box-shadow:inset 0 -3px 0 rgba(0,0,0,.25);cursor:pointer;-webkit-text-stroke:1px #000;paint-order:stroke fill}
#s-bar button.on{background:#3fd15c}#s-bar .chat{background:#ff9f1c}#s-bar .emo{background:#9c6bff}
#s-board{position:fixed;z-index:30;right:max(8px,env(safe-area-inset-right,0px));top:calc(env(safe-area-inset-top,0px) + 10px);background:rgba(20,22,34,.88);border:3px solid #000;border-radius:12px;padding:6px 10px;font:800 13px "Nunito",system-ui,sans-serif;color:#fff;min-width:150px;max-width:240px;pointer-events:none}
#s-board div{display:flex;justify-content:space-between;gap:10px}#s-board b{color:#ffcc33}#s-board .me{color:#7fd0ff}
#s-log{position:fixed;z-index:30;left:max(10px,env(safe-area-inset-left,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 170px);display:flex;flex-direction:column;gap:4px;pointer-events:none;font:800 14px "Nunito",system-ui,sans-serif;color:#fff;max-width:min(380px,70vw)}
#s-log div{background:rgba(20,22,34,.82);border:2px solid #000;border-radius:10px;padding:4px 9px;transition:opacity .5s}#s-log b{color:#ffcc33}
.s-ov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;z-index:60;padding:20px max(16px,env(safe-area-inset-right,0px)) 20px max(16px,env(safe-area-inset-left,0px));font-family:"Nunito","Segoe UI",system-ui,sans-serif;color:#fff}
.s-panel{background:#1d2133;border:4px solid #000;border-radius:18px;max-width:480px;width:100%;max-height:88vh;overflow:auto}
.s-ph{border-bottom:4px solid #000;padding:10px 16px;border-radius:14px 14px 0 0;display:flex;align-items:center;gap:10px;background:#3fa7ff}
.s-ph h2{flex:1;margin:0;font:400 24px "Lilita One","Arial Black",sans-serif;-webkit-text-stroke:1.5px #000;paint-order:stroke fill}
.s-ph button{border:3px solid #000;border-radius:10px;background:#ff4f4f;color:#fff;font:900 14px system-ui;padding:3px 9px;cursor:pointer}
.s-pb{padding:16px;display:flex;flex-direction:column;gap:10px}.s-pb p{margin:0;line-height:1.45;font-weight:700;color:#cfd4e4}
.s-btn{border:3px solid #000;border-radius:12px;padding:9px 14px;font:900 15px "Nunito",system-ui,sans-serif;color:#fff;background:#555c6a;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25);cursor:pointer}
.s-btn.g{background:#3fd15c;color:#06210f}.s-btn.y{background:#ffcc33;color:#3a2600}.s-btn.b{background:#3fa7ff}.s-btn.r{background:#ff4f4f}.s-btn:disabled{opacity:.5;cursor:not-allowed}
.s-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.s-in{flex:1;min-width:0;border:3px solid #000;border-radius:10px;padding:10px;font:900 16px system-ui;background:#fff;color:#000}
.s-code{font:400 40px "Lilita One","Arial Black",sans-serif;letter-spacing:.12em;text-align:center;background:#11131c;border:3px solid #000;border-radius:12px;padding:8px;user-select:text}
.s-err{background:#4a1a1a;color:#ffb3b3;border-radius:10px;padding:8px 12px;font-weight:800}
.s-list{display:flex;flex-wrap:wrap;gap:6px}.s-list span{background:#2b3047;border:2px solid #000;border-radius:999px;padding:3px 10px;font-weight:800;font-size:13px}
#s-chat{position:fixed;z-index:61;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 12px);display:flex;gap:6px;width:min(460px,92vw)}
#s-emop{position:fixed;z-index:61;right:max(8px,env(safe-area-inset-right,0px));top:calc(env(safe-area-inset-top,0px) + 108px);margin-right:84px;background:rgba(20,22,34,.95);border:3px solid #000;border-radius:14px;padding:8px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:min(280px,70vw)}
#s-emop button{border:2px solid #000;border-radius:10px;background:#2b3047;color:#fff;padding:7px 6px;font:800 13px system-ui;text-align:left;cursor:pointer}#s-emop button[aria-disabled=true]{opacity:.5}
`;
function css(){if($('#s-css'))return;const s=document.createElement('style');s.id='s-css';s.textContent=CSS;document.head.appendChild(s)}
function el(h){const d=document.createElement('div');d.innerHTML=h.trim();const e=d.firstChild;document.body.appendChild(e);return e}
function sfx(n){if(window.CubiAudio)CubiAudio.sfx(n)}
const QUICK=['¡Hola!','¡Vamos!','¡Ayuda!','¡Buena!','¡Jajaja!','Ven aquí','¡Gracias!','Adiós'];

let O=null,M=null,remotes=null,scores={},myScore=null,started=false,sendT=null,handlers={},seed=0,ui={};
const S={};
function online(){return !!(M&&M.online&&M.code)}
function players(){return M?M.players():{}}
function nameOf(id){const p=players()[id];return p?p.name:'Amigo'}
function myName(){return (window.CubiAvatar&&CubiAvatar.state().name)||'Tú'}

/* ---------- panel de la sala ---------- */
function panel(title,body){return `<div class="s-ov"><div class="s-panel" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="s-ph"><h2>${esc(title)}</h2><button data-s="close" aria-label="Cerrar">✕</button></div><div class="s-pb">${body}</div></div></div>`}
function openRoom(extra){closeOv();const can=M&&M.available();
  if(online()){const ps=players();
    ui.ov=el(panel('SALA '+M.code,`<p>Pasa este código a tus amigos para que entren en este juego:</p><div class="s-code">${esc(M.code)}</div>
      <p>En la sala (${Object.keys(ps).length}):</p><div class="s-list">${Object.values(ps).map(p=>`<span>${esc(p.name)}</span>`).join('')}</div>
      ${O.onStart?(M.isHost?`<button class="s-btn g" data-s="start">${started?'Empezar otra vez todos juntos':'¡Empezar todos a la vez!'}</button>`:'<p>El anfitrión puede hacer que empecéis todos a la vez.</p>'):''}
      ${O.shared?`<p style="font-size:13px">${esc(O.shared)}</p>`:''}
      <button class="s-btn r" data-s="leave">Salir de la sala</button>`));return}
  ui.ov=el(panel('JUGAR CON AMIGOS',`<p>Crea una sala y pasa el código, o escribe el código que te hayan dado.</p>
    ${can?'':'<div class="s-err">El multijugador funciona en la app de Cubiverso (Android y Windows) y en su web. Dentro de la página de Claude no se puede.</div>'}
    ${extra||''}
    <button class="s-btn y" data-s="create" ${can?'':'disabled'}>CREAR SALA</button>
    <form class="s-row" data-s="joinform"><input class="s-in" id="s-codein" maxlength="5" placeholder="CÓDIGO" aria-label="Código de la sala" autocomplete="off" style="text-transform:uppercase;letter-spacing:.1em" ${can?'':'disabled'}><button class="s-btn b" type="submit" ${can?'':'disabled'}>UNIRSE</button></form>`))}
function closeOv(){if(ui.ov){ui.ov.remove();ui.ov=null}}
function wire(){document.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b||b.disabled||b.tagName==='FORM')return;const k=b.dataset.s;
    if(k==='close'){closeOv();return}
    if(k==='create'){ui.ov.querySelector('.s-pb').innerHTML='<p>Creando la sala…</p>';M.create(O.game).then(()=>{sfx('levelup');joined();openRoom()}).catch(err=>openRoom(`<div class="s-err">${esc(M.errText(err))}</div>`))}
    if(k==='leave'){M.leave();left();closeOv();bar()}
    if(k==='start'){seed=Math.floor(Math.random()*1e9);M.send({t:'__start',seed});closeOv();doStart(seed)}});
  document.addEventListener('submit',e=>{if(e.target.dataset.s!=='joinform')return;e.preventDefault();const c=$('#s-codein').value.trim().toUpperCase();
    if(c.length<5){openRoom('<div class="s-err">El código tiene 5 letras.</div>');return}ui.ov.querySelector('.s-pb').innerHTML='<p>Buscando la sala…</p>';
    M.join(O.game,c).then(()=>{sfx('levelup');joined();openRoom()}).catch(err=>openRoom(`<div class="s-err">${esc(M.errText(err))}</div>`))})}
function joined(){bar();board();if(myScore)setTimeout(()=>{if(online())M.send({t:'__sc',v:myScore.v,txt:myScore.txt})},500);log(`<b>Sala ${esc(M.code)}</b>: ya podéis veros`);if(O.onJoin)O.onJoin()}
function left(){if(remotes)remotes.clear();scores={};board();if(O.onLeave)O.onLeave()}
function doStart(s){started=true;seed=s;scores={};if(O.onStart)O.onStart(s);board()}

/* ---------- barra de botones ---------- */
function bar(){if(!ui.bar){ui.bar=el('<div id="s-bar"></div>');ui.bar.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.b==='amigos')openRoom();if(b.dataset.b==='chat')chatBox();if(b.dataset.b==='emo')emoMenu()})}
  if(O.top)ui.bar.style.top=`calc(env(safe-area-inset-top,0px) + ${O.top}px)`;
  const on=online();ui.bar.innerHTML=`<button data-b="amigos" class="${on?'on':''}" aria-label="${on?'Sala '+esc(M.code):'Jugar con amigos'}">${on?'SALA '+esc(M.code):'AMIGOS'}</button>${on?'<button data-b="chat" class="chat">CHAT</button>':''}${O.emotes&&O.me?'<button data-b="emo" class="emo">GESTOS</button>':''}`}
/* ---------- marcador ---------- */
function board(){if(!O.board||!online()){if(ui.board){ui.board.remove();ui.board=null}return}
  if(!ui.board)ui.board=el('<div id="s-board" aria-live="polite"></div>');const ps=players();const rows=Object.keys(ps).map(id=>{const me=id===M.myId;const sc=me?myScore:scores[id];return {id,me,name:ps[id].name,v:sc?sc.v:null,txt:sc?sc.txt:'—'}});
  const dir=O.board.lower?1:-1;rows.sort((a,b)=>a.v==null?1:b.v==null?-1:dir*(a.v-b.v));
  ui.board.innerHTML=`<b>${esc(O.board.label||'Marcador')}</b>`+rows.map((r,i)=>`<div class="${r.me?'me':''}"><span>${i+1}. ${esc(r.name)}</span><b>${esc(r.txt)}</b></div>`).join('')}
/* ---------- chat ---------- */
function log(html){if(!ui.log)ui.log=el('<div id="s-log" aria-live="polite"></div>');const d=document.createElement('div');d.innerHTML=html;ui.log.appendChild(d);
  while(ui.log.children.length>4)ui.log.firstChild.remove();setTimeout(()=>{d.style.opacity=0;setTimeout(()=>d.remove(),600)},7000)}
function chatBox(){if($('#s-chat')){$('#s-chat').remove();return}const f=el(`<form id="s-chat"><input class="s-in" maxlength="60" placeholder="Escribe un mensaje…" aria-label="Mensaje" autocomplete="off"><button class="s-btn g" type="submit">Enviar</button></form>`);
  const q=el(`<div id="s-quick" style="position:fixed;z-index:61;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 70px);display:flex;flex-wrap:wrap;gap:6px;justify-content:center;width:min(460px,92vw)">${QUICK.map(t=>`<button class="s-btn" style="padding:5px 10px;font-size:13px" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>`);
  const close=()=>{f.remove();q.remove()};q.addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b){say(b.dataset.q);close()}});
  f.addEventListener('submit',e=>{e.preventDefault();const t=f.querySelector('input').value.trim();if(t)say(t);close()});
  f.querySelector('input').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')close()});f.querySelector('input').addEventListener('keyup',e=>e.stopPropagation());
  setTimeout(()=>f.querySelector('input').focus(),30)}
function say(t){t=String(t).slice(0,60);if(!online())return;M.send({t:'__chat',m:t});log(`<b>${esc(myName())}:</b> ${esc(t)}`);bubble(null,t);sfx('notify')}
function bubble(id,t){if(!window.Kit||!O.scene)return;let a=null;if(id==null)a=O.me;else if(remotes&&remotes.map[id])a=remotes.map[id].a;if(!a||!a.root)return;
  if(a._bub){a.root.remove(a._bub)}const sc=a.root.scale.x||1;const s=Kit.sprite(Kit.textTex([[t,30,'#ffffff',36]],520,72,'rgba(20,22,34,.85)'),5.2/sc*.6,.72/sc*.6);s.position.y=3.7;a.root.add(s);a._bub=s;
  clearTimeout(a._bt);a._bt=setTimeout(()=>{if(a._bub===s){a.root.remove(s);a._bub=null}},4500)}
/* ---------- gestos (para juegos que no traen su propio botón) ---------- */
function emoMenu(){if($('#s-emop')){$('#s-emop').remove();return}if(!window.CubiAvatar)return;const st=CubiAvatar.state();
  const p=el(`<div id="s-emop" role="menu">${CubiAvatar.EMOTES.map(e=>{const own=st.owned.includes(e.id);return `<button role="menuitem" data-e="${e.id}" aria-disabled="${!own}">${esc(e.name)}</button>`}).join('')}</div>`);
  p.addEventListener('click',e=>{const b=e.target.closest('[data-e]');if(!b)return;if(b.getAttribute('aria-disabled')==='true'){log('Ese gesto se compra en Avatar → Gestos');return}
    CubiAvatar.emote(O.me,b.dataset.e);sfx('emote');if(online())M.send({t:'emote',e:b.dataset.e});p.remove()})}

/* ---------- API ---------- */
S.init=function(o){O=Object.assign({scale:.75,board:null,emotes:false,rate:100},o);M=window.CubiMulti;css();
  if(!M){return S}
  if(O.scene&&window.Kit&&O.remote!==false)remotes=O.remote&&O.remote.update?null:Kit.remotes(O.scene,O.scale);
  M.on('msg',(d,from)=>{if(!d||!d.t)return;
    if(d.t==='st'){if(O.remote&&O.remote.update)O.remote.update(from,d);else if(remotes)remotes.update(from,d);return}
    if(d.t==='__start'){closeOv();doStart(d.seed);return}
    if(d.t==='__chat'){log(`<b>${esc(nameOf(from))}:</b> ${esc(String(d.m).slice(0,60))}`);bubble(from,String(d.m).slice(0,60));sfx('notify');return}
    if(d.t==='__sc'){scores[from]={v:d.v,txt:d.txt};board();return}
    if(d.t==='emote'&&!remotes&&O.remote&&O.remote.emote){O.remote.emote(from,d.e);return}
    (handlers[d.t]||[]).forEach(f=>{try{f(d,from)}catch(e){console.warn(e)}})});
  M.on('players',()=>{bar();board();if(ui.ov&&online())openRoom();if(O.onPlayers)O.onPlayers(players())});
  M.on('join',(id,p)=>{log(`<b>${esc(p&&p.name||'Alguien')}</b> ha entrado`);sfx('notify');if(myScore)setTimeout(()=>M.send({t:'__sc',v:myScore.v,txt:myScore.txt}),300);if(O.onJoinOther)O.onJoinOther(id)});
  M.on('leave',id=>{if(O.remote&&O.remote.remove)O.remote.remove(id);delete scores[id];board()});
  M.on('disconnected',()=>{log('<b>La sala se ha cerrado</b>: el anfitrión se ha ido');M.leave();left();bar()});
  setInterval(()=>{if(!online()||!O.getState)return;const s=O.getState();if(s){s.t='st';M.send(s)}},O.rate);
  let last=performance.now();const step=t=>{const dt=Math.min(.1,(t-last)/1000);last=t;if(remotes)remotes.step(dt);if(O.remote&&O.remote.step)O.remote.step(dt);requestAnimationFrame(step)};requestAnimationFrame(step);
  wire();bar();return S};
S.score=function(v,txt){myScore={v,txt:txt==null?String(v):String(txt)};if(online())M.send({t:'__sc',v,txt:myScore.txt});board()};
S.send=function(t,data){if(!online())return;M.send(Object.assign({t},data||{}))};
S.on=function(t,f){(handlers[t]=handlers[t]||[]).push(f)};
S.rng=function(s){s=(s>>>0)||1;return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
S.log=log;S.say=say;
Object.defineProperties(S,{online:{get:online},isHost:{get:()=>!online()||M.isHost},myId:{get:()=>M&&M.myId||'yo'},players:{get:players},remotes:{get:()=>remotes},seed:{get:()=>seed},started:{get:()=>started},count:{get:()=>online()?Object.keys(players()).length:1}});
window.Sala=S;
})();
