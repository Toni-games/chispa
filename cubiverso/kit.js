/* Cubiverso · kit común para los juegos: escena, avatar, controles, salas y jugadores remotos */
(function(){
const CSS=`[hidden]{display:none!important}
html,body{margin:0;height:100%;overflow:hidden;font-family:"Nunito","Segoe UI",system-ui,sans-serif;color:#fff;user-select:none;-webkit-user-select:none}
#c{position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:none}
button{font:inherit;color:inherit;cursor:pointer}button:focus-visible{outline:3px solid #fff;outline-offset:2px}button:disabled{opacity:.5;cursor:not-allowed}
.k-ui{position:fixed;z-index:5}
.k-out{-webkit-text-stroke:1.5px #000;paint-order:stroke fill;text-shadow:0 3px 0 #000}
.k-btn{border:3px solid #000;border-radius:12px;padding:8px 14px;font-weight:900;background:#555c6a;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25)}
.k-btn.g{background:#3fd15c;color:#06210f}.k-btn.y{background:#ffcc33;color:#3a2600}.k-btn.b{background:#3fa7ff}.k-btn.r{background:#ff4f4f}.k-btn.p{background:#9c6bff}
#k-toast{top:30%;left:50%;transform:translate(-50%,-50%);font:400 clamp(26px,5vw,42px) "Lilita One","Arial Black",sans-serif;text-align:center;pointer-events:none;transition:opacity .3s;opacity:0;width:90vw;z-index:30}
#k-toast small{display:block;font-family:"Nunito",sans-serif;font-size:16px;font-weight:900}
#k-joy{left:max(18px,env(safe-area-inset-left,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 24px);width:124px;height:124px;border-radius:50%;background:rgba(0,0,0,.25);border:3px solid rgba(255,255,255,.4);display:none;touch-action:none}
#k-joy i{position:absolute;left:36px;top:36px;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.6)}
#k-jump{right:max(22px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 34px);width:80px;height:80px;border-radius:50%;background:rgba(255,255,255,.75);color:#000;border:3px solid #000;font-weight:900;display:none;touch-action:none}
body.k-touch #k-joy,body.k-touch #k-jump{display:block}
.k-ov{position:fixed;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;z-index:40;padding:20px max(16px,env(safe-area-inset-right,0px)) 20px max(16px,env(safe-area-inset-left,0px))}
.k-panel{background:#1d2133;border:4px solid #000;border-radius:18px;max-width:540px;width:100%;max-height:88vh;overflow:auto}
.k-ph{border-bottom:4px solid #000;padding:10px 16px;border-radius:14px 14px 0 0;display:flex;align-items:center;gap:10px}
.k-ph h2{flex:1;margin:0;font:400 26px "Lilita One","Arial Black",sans-serif}
.k-pb{padding:16px;display:flex;flex-direction:column;gap:10px}.k-pb p{margin:0;line-height:1.45;font-weight:700;color:#cfd4e4}.k-pb ul{margin:0;padding-left:18px;line-height:1.6;font-weight:700}
.k-code{font:400 40px "Lilita One","Arial Black",sans-serif;letter-spacing:.12em;text-align:center;background:#11131c;border:3px solid #000;border-radius:12px;padding:8px;user-select:text;-webkit-user-select:text}
.k-in{flex:1;min-width:0;border:3px solid #000;border-radius:10px;padding:10px;font:inherit;font-weight:900;text-transform:uppercase;letter-spacing:.1em;background:#fff;color:#000}
.k-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.k-err{background:#4a1a1a;color:#ffb3b3;border-radius:10px;padding:8px 12px;font-weight:800}
.k-plist{display:flex;flex-wrap:wrap;gap:6px}.k-plist span{background:#2b3047;border:2px solid #000;border-radius:999px;padding:3px 10px;font-weight:800;font-size:13px}
#k-room{top:calc(env(safe-area-inset-top,0px) + 10px);right:max(10px,env(safe-area-inset-right,0px));background:rgba(20,22,34,.85);border:3px solid #000;border-radius:12px;padding:6px 10px;font-weight:900;font-size:13px;max-width:220px}
#k-emo{right:max(10px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 232px);border:3px solid #000;border-radius:12px;background:#9c6bff;padding:6px 10px;font-weight:900;font-size:13px}
body:not(.k-touch) #k-emo{bottom:calc(env(safe-area-inset-bottom,0px) + 14px)}
#k-emop{right:max(10px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 274px);background:rgba(20,22,34,.95);border:3px solid #000;border-radius:14px;padding:8px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:min(300px,80vw)}
body:not(.k-touch) #k-emop{bottom:calc(env(safe-area-inset-bottom,0px) + 56px)}
#k-emop button{border:2px solid #000;border-radius:10px;background:#2b3047;padding:7px 6px;font-weight:800;font-size:13px;text-align:left}
#k-emop button small{display:block;color:#ffcc33;font-size:11px}#k-emop button[aria-disabled=true]{opacity:.55}
#k-room b{font-family:"Lilita One",sans-serif;font-weight:400;letter-spacing:.08em;color:#ffcc33}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}`;
const $=s=>document.querySelector(s);
function injectCSS(){if($('#k-css'))return;const s=document.createElement('style');s.id='k-css';s.textContent=CSS;document.head.appendChild(s)}
function el(html){const d=document.createElement('div');d.innerHTML=html.trim();const e=d.firstChild;document.body.appendChild(e);return e}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function setup(o){o=o||{};injectCSS();
  const canvas=$('#c')||el('<canvas id="c"></canvas>');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=o.shadows!==false;
  const scene=new THREE.Scene();scene.background=new THREE.Color(o.sky||0x8fd0ff);if(o.fog!==false)scene.fog=new THREE.Fog(o.sky||0x8fd0ff,o.fogNear||80,o.fogFar||220);
  const camera=new THREE.PerspectiveCamera(o.fov||60,1,.2,o.far||600);
  const hemi=new THREE.HemisphereLight(0xffffff,o.ground||0x6a8a5a,.75);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff2dd,.8);sun.position.set(30,60,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-60,right:60,top:60,bottom:-60,far:200});scene.add(sun);scene.add(sun.target);
  const resize=()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};addEventListener('resize',resize);resize();
  return {renderer,scene,camera,sun,hemi,canvas}}
const M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
function box(w,h,d,m,x,y,z,p){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);p.add(o);return o}
function cyl(rt,rb,h,m,x,y,z,p,seg){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||16),m);o.position.set(x,y,z);p.add(o);return o}
function sph(r,m,x,y,z,p){const o=new THREE.Mesh(new THREE.SphereGeometry(r,14,12),m);o.position.set(x,y,z);p.add(o);return o}
function shadows(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}})}
function textTex(lines,w,h,bg){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h)}g.textAlign='center';g.textBaseline='middle';
  lines.forEach(([t,size,col,y])=>{g.font=`900 ${size}px Nunito, Arial`;g.lineWidth=Math.max(4,size/6);g.strokeStyle='#000';g.strokeText(t,w/2,y);g.fillStyle=col;g.fillText(t,w/2,y)});return new THREE.CanvasTexture(c)}
function sprite(tex,w,h){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,transparent:true}));s.scale.set(w,h,1);s.renderOrder=6;return s}
function studs(rep){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,64,64);[[16,16],[48,16],[16,48],[48,48]].forEach(([x,y])=>{g.fillStyle='#efefef';g.beginPath();g.arc(x,y,10,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.08)';g.stroke()});
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);return t}
function person(scene,eq,name,scale){let a;
  if(window.CubiAvatar)a=CubiAvatar.makeAvatar(THREE,eq||CubiAvatar.state().eq);
  else{const root=new THREE.Group(),legL=new THREE.Group(),legR=new THREE.Group(),armL=new THREE.Group(),armR=new THREE.Group();legL.position.set(-.225,.7,0);legR.position.set(.225,.7,0);armL.position.set(-.67,1.55,0);armR.position.set(.67,1.55,0);root.add(legL,legR,armL,armR);
    box(.9,.9,.45,M(0xff7a2f),0,1.15,0,root);box(.55,.55,.55,M(0xffd29a),0,1.9,0,root);[legL,legR].forEach(l=>box(.44,.7,.44,M(0x2d3a5a),0,-.35,0,l));[armL,armR].forEach(x=>box(.44,.85,.44,M(0xffd29a),0,-.4,0,x));a={root,legL,legR,armL,armR}}
  a.root.scale.setScalar(scale||.75);a.isMe=!eq;
  if(name){const t=sprite(textTex([[name,40,'#fff',32]],320,64),2.6/(scale||.75)*.75,.52/(scale||.75)*.75);t.position.y=3.2;a.root.add(t);a.tag=t}
  scene.add(a.root);return a}
function walkAnim(a,walk,air,o){if(window.CubiAvatar&&CubiAvatar.drive&&a.body)return CubiAvatar.drive(a,walk,air,o);
  const s=Math.sin(walk)*.8;a.legL.rotation.x=s;a.legR.rotation.x=-s;a.armL.rotation.x=-s;a.armR.rotation.x=s;if(air){a.armL.rotation.x=a.armR.rotation.x=-2.8}}
/* ---------- gestos (emotes) ---------- */
function emotes(me){injectCSS();if(!window.CubiAvatar||!CubiAvatar.EMOTES||$('#k-emo'))return;
  const b=el('<button id="k-emo" class="k-ui k-out" aria-expanded="false" title="Gestos (tecla G)">GESTOS</button>');let pn=null;
  const doEmote=id=>{CubiAvatar.emote(me,id);me._lastEmote=id;if(window.CubiAudio)CubiAudio.sfx('emote');const M=window.CubiMulti;if(M&&M.online)M.send({t:'emote',e:id})};
  const close=()=>{if(pn){pn.remove();pn=null;b.setAttribute('aria-expanded','false')}};
  const open=()=>{const st=CubiAvatar.state();pn=el('<div id="k-emop" class="k-ui" role="menu"></div>');
    pn.innerHTML=CubiAvatar.EMOTES.map(e=>{const own=st.owned.includes(e.id);return `<button role="menuitem" data-e="${e.id}" aria-disabled="${!own}">${e.name}${own?'':`<small>${e.price} Cubos · en la tienda</small>`}</button>`}).join('');
    pn.addEventListener('click',ev=>{const x=ev.target.closest('[data-e]');if(!x)return;if(x.getAttribute('aria-disabled')==='true'){toast('GESTO BLOQUEADO','Cómpralo en Avatar → Gestos','#9c6bff');return}doEmote(x.dataset.e);close()});
    b.setAttribute('aria-expanded','true')};
  b.addEventListener('click',()=>pn?close():open());
  addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;if(e.key==='g'||e.key==='G'){if(pn)close();else open()}
    if(pn&&/^[1-9]$/.test(e.key)){const x=pn.querySelectorAll('[data-e]')[+e.key-1];if(x)x.click()}});
  return {play:doEmote,close}}
function controls(canvas,o){o=o||{};injectCSS();
  const st={keys:{},joy:{x:0,y:0,jump:false},look:{yaw:o.yaw||0,pitch:o.pitch||.4,dist:o.dist||9,min:o.min||3,max:o.max||30},dragging:false};
  addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();st.keys[k]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault()});
  addEventListener('keyup',e=>{st.keys[e.key.toLowerCase()]=false});addEventListener('blur',()=>{for(const k in st.keys)st.keys[k]=false});
  let drag=null;canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')document.body.classList.add('k-touch');if(o.onTap&&o.onTap(e))return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
  canvas.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId){st.look.yaw-=(e.clientX-drag.x)*.008;st.look.pitch=clamp(st.look.pitch+(e.clientY-drag.y)*.005,-.1,1.35);drag.x=e.clientX;drag.y=e.clientY}});
  const end=()=>drag=null;canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  canvas.addEventListener('wheel',e=>{e.preventDefault();st.look.dist=clamp(st.look.dist*(1+Math.sign(e.deltaY)*.12),st.look.min,st.look.max)},{passive:false});
  if(o.joystick!==false){const j=el('<div id="k-joy" class="k-ui"><i></i></div>'),kn=j.querySelector('i');let id=null;
    const upd=e=>{const r=j.getBoundingClientRect();let dx=e.clientX-(r.left+62),dy=e.clientY-(r.top+62);const d=Math.hypot(dx,dy),m=46;if(d>m){dx=dx/d*m;dy=dy/d*m}kn.style.transform=`translate(${dx}px,${dy}px)`;st.joy.x=dx/m;st.joy.y=dy/m};
    j.addEventListener('pointerdown',e=>{id=e.pointerId;j.setPointerCapture(id);upd(e)});j.addEventListener('pointermove',e=>{if(e.pointerId===id)upd(e)});
    const fin=()=>{id=null;st.joy.x=st.joy.y=0;kn.style.transform=''};j.addEventListener('pointerup',fin);j.addEventListener('pointercancel',fin);
    const jb=el(`<button id="k-jump" class="k-ui k-out">${o.jumpLabel||'SALTAR'}</button>`);jb.addEventListener('pointerdown',e=>{e.preventDefault();st.joy.jump=true});['pointerup','pointercancel','pointerleave'].forEach(t=>jb.addEventListener(t,()=>st.joy.jump=false))}
  addEventListener('touchstart',()=>document.body.classList.add('k-touch'),{once:true,passive:true});
  st.move=function(){let ix=0,iz=0;const k=st.keys;if(k.w||k.arrowup)iz-=1;if(k.s||k.arrowdown)iz+=1;if(k.a||k.arrowleft)ix-=1;if(k.d||k.arrowright)ix+=1;ix+=st.joy.x;iz+=st.joy.y;
    const il=Math.hypot(ix,iz);if(il>1){ix/=il;iz/=il}const s=Math.sin(st.look.yaw),c=Math.cos(st.look.yaw);return {x:ix*c+iz*s,z:-ix*s+iz*c,len:Math.min(1,il)}};
  st.jump=()=>st.keys[' ']||st.joy.jump;
  st.camera=function(cam,x,y,z,h){h=h||1.4;const cp=Math.cos(st.look.pitch),d=st.look.dist;cam.position.set(x+Math.sin(st.look.yaw)*cp*d,y+h+Math.sin(st.look.pitch)*d,z+Math.cos(st.look.yaw)*cp*d);cam.lookAt(x,y+h,z)};
  return st}
function toast(t,sub,col){let e=$('#k-toast');if(!e)e=el('<div id="k-toast" class="k-ui k-out"></div>');e.innerHTML=`<span style="color:${col||'#ffcc33'}">${t}</span>${sub?`<small>${sub}</small>`:''}`;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,2200)}
function panel(title,col,body){return `<div class="k-ov"><div class="k-panel"><div class="k-ph" style="background:${col}"><h2 class="k-out">${title}</h2></div><div class="k-pb">${body}</div></div></div>`}
/* ---------- salas multijugador ---------- */
function roomMenu(o){/* o: {game,title,col,intro,onSolo,onRoom} */
  const ov=el('<div></div>');const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const M=window.CubiMulti,canMulti=M&&M.available();
  const show=(extra)=>{ov.innerHTML=panel(o.title,o.col,`${o.intro}
    <div class="k-row"><button class="k-btn g k-out" data-k="solo" style="flex:1">JUGAR SOLO</button></div>
    <p style="margin-top:6px"><b style="color:#fff">Jugar con amigos</b></p>
    ${canMulti?'':'<div class="k-err">El multijugador funciona en la app de Cubiverso y en su web. Aquí dentro de Claude solo puedes jugar solo.</div>'}
    <div class="k-row"><button class="k-btn y k-out" data-k="create" ${canMulti?'':'disabled'} style="flex:1">CREAR SALA</button></div>
    <form class="k-row" data-k="joinform"><input class="k-in" id="k-codein" maxlength="5" placeholder="CÓDIGO" aria-label="Código de la sala" autocomplete="off" ${canMulti?'':'disabled'}><button class="k-btn b k-out" type="submit" ${canMulti?'':'disabled'}>UNIRSE</button></form>
    ${extra||''}`)};
  const lobby=(err)=>{const ps=M.players();ov.innerHTML=panel('SALA '+M.code,o.col,`<p>Pasa este código a tus amigos para que entren:</p><div class="k-code">${M.code}</div>
    <p>En la sala (${Object.keys(ps).length}):</p><div class="k-plist">${Object.values(ps).map(p=>`<span>${esc(p.name)}</span>`).join('')}</div>
    ${err?`<div class="k-err">${esc(err)}</div>`:''}
    ${M.isHost?'<button class="k-btn g k-out" data-k="start">¡EMPEZAR!</button>':'<p>Esperando a que el anfitrión empiece…</p>'}
    <button class="k-btn k-out" data-k="leave">Salir de la sala</button>`)};
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b||b.disabled)return;const k=b.dataset.k;
    if(k==='solo'){ov.remove();o.onSolo()}
    if(k==='create'){ov.innerHTML=panel('CREANDO SALA…',o.col,'<p>Conectando…</p>');M.create(o.game).then(()=>lobby()).catch(e=>show(`<div class="k-err">${esc(M.errText(e))}</div>`))}
    if(k==='start'){M.send({t:'start'});ov.remove();o.onRoom()}
    if(k==='leave'){M.leave();show()}});
  ov.addEventListener('submit',e=>{e.preventDefault();const c=ov.querySelector('#k-codein').value;if(!c||c.trim().length<5){show('<div class="k-err">El código tiene 5 letras.</div>');return}
    ov.innerHTML=panel('ENTRANDO…',o.col,'<p>Buscando la sala…</p>');M.join(o.game,c).then(()=>lobby()).catch(e=>show(`<div class="k-err">${esc(M.errText(e))}</div>`))});
  if(M){M.on('players',()=>{if(ov.isConnected&&M.code&&ov.querySelector('.k-code'))lobby()});M.on('msg',d=>{if(d.t==='start'&&ov.isConnected){ov.remove();o.onRoom()}});
    M.on('disconnected',()=>{toast('SALA CERRADA','El anfitrión se ha ido','#ff4f4f')})}
  show();return ov}
function roomBadge(){const M=window.CubiMulti;if(!M||!M.online)return;let b=$('#k-room');if(!b)b=el('<div id="k-room" class="k-ui"></div>');
  const n=Object.keys(M.players()).length;b.innerHTML=`Sala <b>${M.code}</b> · ${n} ${n===1?'jugador':'jugadores'}`}
/* ---------- jugadores remotos ---------- */
function remotes(scene,scale){const R={};const M=window.CubiMulti;
  if(M)M.on('msg',(d,from)=>{if(d&&d.t==='emote'&&R[from]&&window.CubiAvatar)CubiAvatar.emote(R[from].a,d.e)});
  const api={map:R,
    update(id,s){let r=R[id];const ps=M?M.players():{};const info=ps[id]||{name:'Amigo',eq:null};
      if(r&&r.noinfo&&ps[id]){scene.remove(r.a.root);delete R[id];r=null}
      if(!r){if(info.defs&&window.CubiAvatar&&CubiAvatar.register)info.defs.forEach(d=>CubiAvatar.register(d));const a=person(scene,info.eq,info.name,scale);r=R[id]={noinfo:!ps[id],a,x:s.x,y:s.y,z:s.z,tx:s.x,ty:s.y,tz:s.z,ry:s.ry||0,walk:0,data:s};}
      r.tx=s.x;r.ty=s.y;r.tz=s.z;r.ry=s.ry||0;r.data=s;r.seen=performance.now()},
    step(dt){const now=performance.now();Object.entries(R).forEach(([id,r])=>{if(now-r.seen>6000||(M&&!M.players()[id])){scene.remove(r.a.root);delete R[id];return}
      const k=Math.min(1,dt*10),ox=r.x,oz=r.z;r.x+=(r.tx-r.x)*k;r.y+=(r.ty-r.y)*k;r.z+=(r.tz-r.z)*k;const sp=Math.hypot(r.x-ox,r.z-oz)/Math.max(dt,.001);r.walk+=sp*dt*1.4;
      r.a.root.position.set(r.x,r.y,r.z);let df=r.ry-r.a.root.rotation.y;df=Math.atan2(Math.sin(df),Math.cos(df));r.a.root.rotation.y+=df*k;walkAnim(r.a,r.walk,r.data&&r.data.air,{moving:sp>.5,climb:r.data&&r.data.cl})})},
    clear(){Object.keys(R).forEach(id=>{scene.remove(R[id].a.root);delete R[id]})}};
  return api}
window.Kit={setup,M,box,cyl,sph,shadows,textTex,sprite,studs,person,walkAnim,emotes,controls,toast,panel,roomMenu,roomBadge,remotes,clamp,injectCSS};
})();
