/* Cubiverso · pases de juego que se compran con Cubos */
(function(){
const GN={barrio:'Barrio Tycoon',tormentas:'Repartidor de Tormentas',bolsillo:'Ciudad de Bolsillo',cambiazo:'El Cambiazo',ladrones:'Ladrones de Brainrots',patadon:'Patadón de Lucky Blocks'};
const CAT={
  barrio:[
    {id:'mansion',name:'Mansión exclusiva',desc:'Desbloquea la Mansión: un edificio con piscina y columnas doradas que da muchísimo dinero.',price:300,col:'#ffd23f',ic:'⌂',excl:1},
    {id:'cochedorado',name:'Coche dorado',desc:'Conduce un coche de oro. Las bolsas de dinero valen el triple.',price:200,col:'#ffb300',ic:'$',excl:1},
    {id:'x2',name:'Dinero x2',desc:'Cobras el doble cada 5 segundos.',price:249,col:'#3fd15c',ic:'x2'},
    {id:'sandbox',name:'Modo Sandbox',desc:'Construye y mejora gratis. Lo puedes activar y desactivar.',price:399,col:'#9c6bff',ic:'∞',toggle:1},
    {id:'turbo',name:'Coche Turbo',desc:'Tu coche corre un 50% más.',price:149,col:'#3fa7ff',ic:'»'}],
  tormentas:[
    {id:'vip',name:'VIP',desc:'El doble de monedas en cada entrega y gorra dorada exclusiva.',price:299,col:'#e0a800',ic:'VIP',excl:1},
    {id:'patinete',name:'Patinete Turbo',desc:'Repartes sobre un patinete un 45% más rápido.',price:199,col:'#ff5a6a',ic:'»',excl:1},
    {id:'doble',name:'Doble Salto',desc:'Puedes saltar otra vez en el aire.',price:149,col:'#5ab0ff',ic:'↑↑'},
    {id:'radar',name:'Radar de Tormentas',desc:'Las calmas duran más y los rayos avisan antes.',price:99,col:'#c58bff',ic:'◎'},
    {id:'mundos',name:'Pase de Mundos',desc:'Desbloquea Puerto Tifón y Volcán Chispa al momento.',price:399,col:'#00b06f',ic:'✦'}],
  bolsillo:[
    {id:'torre',name:'Torre Cubiverso',desc:'Monumento exclusivo: toda la ciudad es más feliz y paga 200 monedas más al día.',price:250,col:'#ffb020',ic:'▲',excl:1},
    {id:'impuestos',name:'Impuestos x1.5',desc:'Tu ciudad recauda un 50% más cada día.',price:200,col:'#3fd15c',ic:'%'},
    {id:'rapido',name:'Tiempo x10',desc:'Añade la velocidad x10 para que la ciudad crezca rapidísimo.',price:120,col:'#3fa7ff',ic:'x10',toggle:1}],
  cambiazo:[
    {id:'dorado',name:'Móvil dorado',desc:'Exclusivo: tu móvil brilla en oro y los vecinos empiezan de mejor humor contigo.',price:300,col:'#ffcc33',ic:'★',excl:1},
    {id:'bateria',name:'Batería extra',desc:'+4 acciones cada día.',price:150,col:'#3fd15c',ic:'⚡'},
    {id:'labia',name:'Labia de oro',desc:'+15% de probabilidad de que acepten el cambiazo.',price:250,col:'#ff6fb5',ic:'♥'},
    {id:'mochila',name:'Mochila grande',desc:'Lleva 8 regalos en vez de 4.',price:100,col:'#8d6e63',ic:'▤'}],
  ladrones:[
    {id:'paellon',name:'Dragón Paellón',desc:'Brainrot secreto exclusivo que da $20K por segundo. Aparece en tu base.',price:500,col:'#ff7a00',ic:'♛',excl:1,claim:1},
    {id:'x2',name:'Dinero x2',desc:'Tus brainrots dan el doble de dinero.',price:299,col:'#3fd15c',ic:'x2'},
    {id:'rapido',name:'Zapatillas veloces',desc:'Corres un 30% más, también cargando un brainrot.',price:149,col:'#3fa7ff',ic:'»'},
    {id:'bloqueo',name:'Bloqueo largo',desc:'Tu base se bloquea 90 segundos en vez de 45.',price:99,col:'#9c6bff',ic:'▣'}],
  patadon:[
    {id:'cubibloque',name:'Bloque Cubiverso',desc:'Bloque exclusivo: vale x8000 y da Cubos mucho más a menudo.',price:450,col:'#ffb020',ic:'▣',excl:1},
    {id:'cubito',name:'Cubito Dorado',desc:'Mascota exclusiva que multiplica tus monedas x10.',price:350,col:'#ffcc33',ic:'♥',excl:1},
    {id:'x2',name:'Monedas x2',desc:'Ganas el doble de monedas con cada bloque.',price:249,col:'#3fd15c',ic:'x2'},
    {id:'perfecta',name:'Patada perfecta',desc:'Todas tus patadas son perfectas.',price:199,col:'#ff4f4f',ic:'✓'}]
};
const A=()=>window.CubiAvatar;
const key=(g,id)=>g+'-'+id;
const st=()=>A()?A().state():{cubos:0,passes:{}};
const find=(g,id)=>(CAT[g]||[]).find(p=>p.id===id);
function owned(g,id){const p=st().passes||{};return !!(p[key(g,id)]||(g==='barrio'&&p['bt-'+id]))}
function has(g,id){return owned(g,id)&&!(st().passOff||{})[key(g,id)]}
function buy(g,id){const p=find(g,id),s=st();if(!p||!A())return {ok:false,need:0};if(owned(g,id))return {ok:true};
  if(s.cubos<p.price)return {ok:false,need:p.price-s.cubos};
  s.cubos-=p.price;s.passes=s.passes||{};s.passes[key(g,id)]=1;(s.history=s.history||[]).unshift({t:Date.now(),txt:`Pase: ${p.name} (${GN[g]})`,amt:-p.price});s.history=s.history.slice(0,30);A().save(s);return {ok:true,bought:true}}
function toggle(g,id){const s=st();s.passOff=s.passOff||{};const k=key(g,id);if(s.passOff[k])delete s.passOff[k];else s.passOff[k]=1;A().save(s)}
function claimed(g,id){return !!(st().passClaim||{})[key(g,id)]}
function markClaimed(g,id){const s=st();s.passClaim=s.passClaim||{};s.passClaim[key(g,id)]=1;A().save(s)}

/* ---------- ventana dentro de los juegos ---------- */
let cfg=null,root=null,msg='';
const CSS=`.cp-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:20px max(16px,env(safe-area-inset-right,0px)) 20px max(16px,env(safe-area-inset-left,0px));font-family:"Nunito","Segoe UI",system-ui,sans-serif;color:#fff}
.cp-p{background:#1b1f2b;border:4px solid #000;border-radius:18px;width:100%;max-width:540px;max-height:88vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.cp-h{display:flex;align-items:center;gap:10px;background:#ffb020;color:#2a1a00;border-bottom:4px solid #000;padding:10px 14px;border-radius:14px 14px 0 0}
.cp-h h2{flex:1;margin:0;font:400 24px "Lilita One","Arial Black",sans-serif}
.cp-bal{background:#2a1a00;color:#ffd27a;border-radius:999px;padding:3px 10px;font-weight:900;font-variant-numeric:tabular-nums}
.cp-x{width:36px;height:36px;border:3px solid #000;border-radius:10px;background:#ff4f4f;color:#fff;font-weight:900;cursor:pointer}
.cp-b{padding:14px;display:flex;flex-direction:column;gap:10px}
.cp-r{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:12px;align-items:center;border:3px solid #000;border-radius:12px;background:#262c3c;padding:10px}
.cp-r.own{background:#1f3a2a}
.cp-ic{width:56px;height:56px;border-radius:12px;border:3px solid #000;display:grid;place-items:center;font:400 20px "Lilita One","Arial Black",sans-serif;color:#fff;-webkit-text-stroke:1px #000;paint-order:stroke fill}
.cp-r b{display:block;font-size:15px}.cp-r span{display:block;font-size:12px;color:#c9d0de;font-weight:700;line-height:1.35}
.cp-tag{display:inline-block;background:#ffb020;color:#2a1a00;border-radius:999px;padding:0 7px;font-size:10px;font-weight:900;margin-left:6px;vertical-align:2px}
.cp-btn{border:3px solid #000;border-radius:10px;padding:8px 12px;font-weight:900;cursor:pointer;background:#3fd15c;color:#06210f;white-space:nowrap;font-family:inherit;font-size:14px}
.cp-btn.off{background:#555c6a;color:#fff}.cp-btn.on{background:#3fa7ff;color:#fff}.cp-btn:disabled{opacity:.5;cursor:not-allowed}
.cp-msg{border-radius:10px;padding:8px 12px;font-weight:800;font-size:14px;background:#3a2a10;color:#ffd27a}
.cp-msg.ok{background:#173a22;color:#7ff0a8}
.cp-btn:focus-visible,.cp-x:focus-visible{outline:3px solid #fff;outline-offset:2px}`;
function cubeSvg(){return '<svg width="14" height="14" viewBox="0 0 24 24" style="vertical-align:-2px"><path d="M12 2l9 5v10l-9 5-9-5V7z" fill="#ffb020"/><path d="M12 2l9 5-9 5-9-5z" fill="#ffd27a"/><path d="M12 12v10l-9-5V7z" fill="#e08e00"/></svg>'}
function init(c){cfg=c;if(!document.getElementById('cp-css')){const s=document.createElement('style');s.id='cp-css';s.textContent=CSS;document.head.appendChild(s)}
  root=document.createElement('div');root.id='cp-root';document.body.appendChild(root);
  root.addEventListener('click',e=>{const b=e.target.closest('[data-cp]');if(e.target.classList.contains('cp-ov')){close();return}if(!b||b.disabled)return;e.stopPropagation();act(b.dataset.cp,b.dataset.id)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())close()},true);
  return api}
function isOpen(){return !!(root&&root.innerHTML)}
function close(){if(root)root.innerHTML='';msg='';if(cfg&&cfg.onClose)cfg.onClose()}
function open(){if(!root)return;draw();if(cfg&&cfg.onOpen)cfg.onOpen()}
function draw(){const g=cfg.game,s=st();
  root.innerHTML=`<div class="cp-ov"><div class="cp-p" role="dialog" aria-modal="true" aria-label="Pases de ${GN[g]}"><div class="cp-h"><h2>PASES</h2><span class="cp-bal">${cubeSvg()} ${Math.floor(s.cubos).toLocaleString('es-ES')}</span><button class="cp-x" data-cp="close" aria-label="Cerrar">X</button></div><div class="cp-b">
  ${msg}
  ${CAT[g].map(p=>{const o=owned(g,p.id),on=has(g,p.id),cl=p.claim&&o&&!claimed(g,p.id);
    let btn=!o?`<button class="cp-btn" data-cp="buy" data-id="${p.id}">${cubeSvg()} ${p.price}</button>`:cl?`<button class="cp-btn on" data-cp="claim" data-id="${p.id}">Reclamar</button>`:p.toggle?`<button class="cp-btn ${on?'on':'off'}" data-cp="toggle" data-id="${p.id}">${on?'Activado':'Desactivado'}</button>`:`<button class="cp-btn off" disabled>Comprado</button>`;
    return `<div class="cp-r ${o?'own':''}"><div class="cp-ic" style="background:${p.col}">${p.ic}</div><div><b>${p.name}${p.excl?'<span class="cp-tag">EXCLUSIVO</span>':''}</b><span>${p.desc}</span></div>${btn}</div>`}).join('')}
  <span style="font-size:12px;color:#9aa2b4;font-weight:700">Los pases se compran una vez y son tuyos para siempre. Consigue más Cubos en el menú de Cubiverso.</span></div></div></div>`;
  const f=root.querySelector('.cp-x');if(f)f.focus()}
function act(a,id){const g=cfg.game;
  if(a==='close'){close();return}
  if(a==='buy'){const r=buy(g,id);const p=find(g,id);
    if(!r.ok){msg=`<div class="cp-msg">Te faltan ${r.need} Cubos para ${p.name}. Sal del juego y consíguelos en la sección Cubos.</div>`;draw();return}
    msg=`<div class="cp-msg ok">¡Has comprado ${p.name}!</div>`;
    if(p.claim&&cfg.onClaim&&cfg.onClaim(id))markClaimed(g,id);
    if(cfg.onChange)cfg.onChange(id);draw();return}
  if(a==='claim'){if(cfg.onClaim&&cfg.onClaim(id)){markClaimed(g,id);msg=`<div class="cp-msg ok">¡Reclamado!</div>`}else msg=`<div class="cp-msg">No hay sitio. Haz hueco y vuelve a reclamarlo.</div>`;draw();return}
  if(a==='toggle'){toggle(g,id);if(cfg.onChange)cfg.onChange(id);draw()}}
const api={open,close,isOpen};
window.CubiPases={GN,CAT,owned,has,buy,toggle,claimed,markClaimed,init,open,close,isOpen};
})();
