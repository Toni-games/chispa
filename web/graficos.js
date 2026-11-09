/* Cubiverso · calidad de gráficos (bajo, medio, alto) para todos los juegos.
   Ajusta cualquier renderizador de three.js de la página: resolución, sombras y suavizado de sombras.
   También: contador de FPS opcional y los superpoderes del modo administrador. */
(function(){
if(window.CubiGraficos)return;
const KEY='cubiverso-graficos',FKEY='cubiverso-fps',AKEY='cubiverso-admin';
const LV={
  bajo:{name:'Bajo',desc:'Más fluido en móviles y ordenadores viejos: menos resolución y sin sombras.',pr:()=>Math.min(devicePixelRatio||1,1)*.6,sh:false,soft:false},
  medio:{name:'Medio',desc:'Equilibrado. Recomendado para la mayoría de dispositivos.',pr:()=>Math.min(devicePixelRatio||1,1.25),sh:true,soft:false},
  alto:{name:'Alto',desc:'Imagen más nítida y sombras suaves. Necesita un dispositivo potente.',pr:()=>Math.min(devicePixelRatio||1,2),sh:true,soft:true}};
let ver=1;
const rd=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const wr=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function level(){const v=rd(KEY);return LV[v]?v:'medio'}
function set(v){if(!LV[v])return;wr(KEY,v);ver++;emit()}
const H=[];function emit(){H.forEach(f=>{try{f(level())}catch(e){}})}
addEventListener('storage',e=>{if(e.key===KEY){ver++;emit()}if(e.key===FKEY)fpsUI();if(e.key===AKEY)ver++});

/* ---------- cambiar el renderizador de three.js ---------- */
function inst(r){if(r.__cgi)return r;r.__cgi=1;const T=window.THREE,R0=r.render.bind(r),SPR=r.setPixelRatio.bind(r);
  r.setPixelRatio=function(v){r.__cgv=0;return SPR(v)};
  r.render=function(scene,cam){if(r.__cgSkip)return R0(scene,cam);
    if(r.__cgv!==ver){r.__cgv=ver;const L=LV[level()];
      if(r.__sh0===undefined)r.__sh0=r.shadowMap.enabled;
      const sh=r.__sh0&&L.sh,changed=r.shadowMap.enabled!==sh||r.__soft!==L.soft;
      SPR(L.pr());r.shadowMap.enabled=sh;r.__soft=L.soft;
      if(sh)r.shadowMap.type=L.soft?T.PCFSoftShadowMap:T.PCFShadowMap;
      if(changed&&scene&&scene.traverse){r.shadowMap.needsUpdate=true;scene.traverse(o=>{const m=o.material;if(!m)return;(Array.isArray(m)?m:[m]).forEach(x=>x.needsUpdate=true)})}}
    frames++;return R0(scene,cam)};
  return r}
/* se envuelve el constructor: cada renderizador nuevo queda controlado */
function patch(){const T=window.THREE;if(!T||!T.WebGLRenderer)return false;if(T.WebGLRenderer.__cg)return true;
  const Orig=T.WebGLRenderer;function W(p){return inst(new Orig(p))}W.prototype=Orig.prototype;W.__cg=1;
  try{T.WebGLRenderer=W}catch(e){return false}return T.WebGLRenderer===W}
if(!patch()){const t=setInterval(()=>{if(patch())clearInterval(t)},30);addEventListener('DOMContentLoaded',()=>{if(patch())clearInterval(t)});setTimeout(()=>clearInterval(t),20000)}

/* ---------- contador de FPS ---------- */
let frames=0,fpsEl=null,fpsT=0;
function fpsOn(){return rd(FKEY)==='1'}
function fpsUI(){const on=fpsOn();
  if(on&&!fpsEl){fpsEl=document.createElement('div');fpsEl.setAttribute('aria-hidden','true');
    fpsEl.style.cssText='position:fixed;z-index:99;left:max(6px,env(safe-area-inset-left,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 6px);background:rgba(0,0,0,.7);color:#7fff8a;font:700 12px ui-monospace,monospace;padding:2px 7px;border-radius:6px;pointer-events:none';
    (document.body||document.documentElement).appendChild(fpsEl);let last=performance.now(),f0=frames;
    fpsT=setInterval(()=>{const now=performance.now(),n=frames-f0;f0=frames;const fps=Math.round(n*1000/(now-last));last=now;if(fpsEl)fpsEl.textContent=(n?fps:'–')+' FPS · '+LV[level()].name},1000)}
  if(!on&&fpsEl){fpsEl.remove();fpsEl=null;clearInterval(fpsT)}}
function inPlatform(){try{return window.parent!==window&&!!window.parent.CubiGraficos}catch(e){return false}}
if(document.body)fpsUI();else addEventListener('DOMContentLoaded',fpsUI);

/* ---------- superpoderes de administrador ---------- */
function admin(){let a=null;try{a=JSON.parse(rd(AKEY)||'null')}catch(e){}return a&&a.on?a:null}
function power(k){const a=admin();return a&&a.p?a.p[k]:null}

window.CubiGraficos={LV,level,set,on(f){H.push(f)},fps:{get:fpsOn,set(v){wr(FKEY,v?'1':'0');fpsUI()}},admin,power,patch,inst};
})();
