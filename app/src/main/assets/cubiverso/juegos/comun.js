/* Cubiverso · piezas comunes para los juegos nuevos: paneles de inicio y fin, récords, botón de acción y jugador que anda y salta */
(function(){
const K=window.Kit,$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const css=`#j-hud{top:calc(env(safe-area-inset-top,0px) + 10px);left:50%;transform:translateX(-50%);display:flex;gap:8px;pointer-events:none;flex-wrap:wrap;justify-content:center;max-width:92vw}
#j-hud div{background:rgba(20,22,34,.82);border:3px solid #000;border-radius:12px;padding:3px 12px;font-weight:900;font-size:14px;white-space:nowrap}
#j-hud b{color:#ffcc33;font:400 20px "Lilita One","Arial Black",sans-serif;margin-left:5px}
.j-act{right:max(22px,env(safe-area-inset-right,0px));width:78px;height:78px;border-radius:50%;border:3px solid #000;font-weight:900;font-size:13px;display:none;touch-action:none;color:#000}
body.k-touch .j-act{display:block}
#j-hint{bottom:calc(env(safe-area-inset-bottom,0px) + 8px);left:50%;transform:translateX(-50%);font-size:12px;font-weight:800;white-space:nowrap;pointer-events:none}
body.k-touch #j-hint{display:none}
.j-bar{height:14px;border:3px solid #000;border-radius:99px;background:#2b3047;overflow:hidden;width:160px}.j-bar i{display:block;height:100%;background:#3fd15c}`;
function inject(){K.injectCSS();if(!$('#j-css')){const s=document.createElement('style');s.id='j-css';s.textContent=css;document.head.appendChild(s)}}
function el(h){const d=document.createElement('div');d.innerHTML=h.trim();const e=d.firstChild;document.body.appendChild(e);return e}
const KEY='cubi-records';
function recs(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function best(k){return recs()[k]}
function saveBest(k,v,higher){const r=recs();const old=r[k];const better=old==null||(higher!==false?v>old:v<old);if(better){r[k]=v;try{localStorage.setItem(KEY,JSON.stringify(r))}catch(e){}}return better}
function start(o){inject();const ov=el(K.panel(esc(o.title),o.col||'#ffcc33',`${o.sub?`<p>${o.sub}</p>`:''}${o.howto?`<ul>${o.howto.map(h=>`<li>${h}</li>`).join('')}</ul>`:''}
  ${o.record!=null?`<p>Tu récord: <b style="color:#ffcc33">${esc(o.record)}</b></p>`:''}${o.extra||''}<div class="k-row"><button class="k-btn g k-out" id="j-go" style="flex:1;font-size:20px">${o.btn||'¡A JUGAR!'}</button></div>`));
  const go=()=>{ov.remove();if(window.CubiAudio)CubiAudio.unlock();o.onStart&&o.onStart()};
  $('#j-go').onclick=go;if(o.bind)o.bind(ov);setTimeout(()=>{try{$('#j-go').focus()}catch(e){}},50);return ov}
function end(o){inject();const ov=el(K.panel(esc(o.title),o.col||'#ffcc33',`${(o.lines||[]).map(l=>`<p style="text-align:center;font-size:17px;color:#fff">${l}</p>`).join('')}
  ${o.record?`<p style="text-align:center;color:#ffcc33;font-size:18px">¡NUEVO RÉCORD!</p>`:''}<div class="k-row"><button class="k-btn g k-out" id="j-again" style="flex:1;font-size:18px">Jugar otra vez</button></div>`));
  $('#j-again').onclick=()=>{ov.remove();if(o.onAgain)o.onAgain();else location.reload()};return ov}
function hud(items){inject();let h=$('#j-hud');if(!h)h=el('<div id="j-hud" class="k-ui"></div>');h.innerHTML=items.filter(Boolean).map(([n,v])=>`<div class="k-out">${n}<b>${v}</b></div>`).join('')}
function hint(t){inject();let h=$('#j-hint');if(!h)h=el('<div id="j-hint" class="k-ui k-out"></div>');h.textContent=t}
/* botón de acción para móviles (y tecla para teclado) */
function action(label,key,cb,o){inject();o=o||{};const b=el(`<button class="k-ui j-act k-out" style="bottom:calc(env(safe-area-inset-bottom,0px) + ${o.bottom||130}px);background:${o.col||'#ffcc33'}">${label}</button>`);
  let held=false;b.addEventListener('pointerdown',e=>{e.preventDefault();held=true;cb(true)});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,()=>{if(held){held=false;o.up&&o.up()}}));
  const keys=[].concat(key);addEventListener('keydown',e=>{if(e.repeat)return;if(keys.includes(e.key.toLowerCase())){e.preventDefault();cb(false)}});
  if(o.up)addEventListener('keyup',e=>{if(keys.includes(e.key.toLowerCase()))o.up()});
  addEventListener('touchstart',()=>document.body.classList.add('k-touch'),{once:true,passive:true});return b}
/* jugador: anda por el suelo (y = 0), salta y choca con cajas {x0,x1,z0,z1,top} */
function player(scene,ctl,o){o=o||{};const a=K.person(scene,null,null,o.scale||.75);
  const P={a,x:o.x||0,y:0,z:o.z||0,vx:0,vy:0,vz:0,face:o.face||0,walk:0,ground:true,speed:o.speed||7,jump:o.jump||10,grav:o.grav||28,r:o.r||.45,boxes:o.boxes||[],bound:o.bound||60,frozen:false,
    update(dt,cam,camH){const mv=this.frozen?{x:0,z:0,len:0}:ctl.move();const sp=this.speed*(this.mult||1);
      this.vx+=(mv.x*sp-this.vx)*Math.min(1,(this.ground?14:5)*dt);this.vz+=(mv.z*sp-this.vz)*Math.min(1,(this.ground?14:5)*dt);
      if(!this.frozen&&ctl.jump()&&this.ground&&this.jump>0){this.vy=this.jump;this.ground=false}
      this.vy-=this.grav*dt;
      const hitB=(x,z,y)=>this.boxes.some(b=>x+this.r>b.x0&&x-this.r<b.x1&&z+this.r>b.z0&&z-this.r<b.z1&&y<b.top-.3&&y+1.6>(b.bottom||0));
      let nx=this.x+this.vx*dt;if(!hitB(nx,this.z,this.y))this.x=nx;else this.vx=0;
      let nz=this.z+this.vz*dt;if(!hitB(this.x,nz,this.y))this.z=nz;else this.vz=0;
      const B=this.bound;this.x=Math.max(-B,Math.min(B,this.x));this.z=Math.max(-B,Math.min(B,this.z));
      const py=this.y;this.y+=this.vy*dt;let floor=o.noFloor?-1e9:0;if(o.floorFn){const fh=o.floorFn(this.x,this.z);if(fh!=null&&py>=fh-.6)floor=fh}
      for(const b of this.boxes){if(this.x+this.r>b.x0&&this.x-this.r<b.x1&&this.z+this.r>b.z0&&this.z-this.r<b.z1&&py>=b.top-.35)floor=Math.max(floor,b.top)}
      if(this.y<=floor){this.y=floor;this.vy=0;this.ground=true}else this.ground=false;
      if(mv.len>.1){this.face=Math.atan2(mv.x,mv.z);this.walk+=dt*sp*1.5}
      a.root.position.set(this.x,this.y,this.z);a.root.rotation.y+=(((this.face-a.root.rotation.y+Math.PI*3)%(Math.PI*2))-Math.PI)*Math.min(1,dt*12);
      K.walkAnim(a,this.walk,!this.ground);if(cam)ctl.camera(cam,this.x,this.y,this.z,camH||1.4)}};
  return P}
const music=t=>{if(window.CubiAudio)CubiAudio.gameMusic(t)};
const sfx=t=>{if(window.CubiAudio)CubiAudio.sfx(t)};
window.Juego={start,end,hud,hint,action,player,best,saveBest,music,sfx,esc,el};
})();
