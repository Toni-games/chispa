/* Cubiverso · cuentas
   - Nombre de cuenta + contraseña.
   - Con servidor (Firebase, ver firebase-config.js): la cuenta y todo el progreso se guardan en internet
     y se recuperan al entrar desde cualquier dispositivo.
   - Sin servidor: la cuenta vive en este dispositivo y se puede pasar a otro con un código de transferencia.
   El progreso es todo lo que Cubiverso y sus juegos guardan en localStorage. */
(function(){
if(window.CubiCuenta)return;
const AK='cubi-cuenta';                       // datos de la sesión y cuentas locales
const SKIP=k=>k===AK||k.startsWith('cubi-cuenta')||k.startsWith('firebase')||k.startsWith('CookieConsent');
const CFG=window.CUBI_FIREBASE&&window.CUBI_FIREBASE.apiKey&&window.CUBI_FIREBASE.projectId?window.CUBI_FIREBASE:null;
const MAIL='@cuentas.cubiverso.app';

function rd(){try{return JSON.parse(localStorage.getItem(AK)||'{}')||{}}catch(e){return{}}}
function wr(o){try{localStorage.setItem(AK,JSON.stringify(o))}catch(e){}}
let A=rd();A.locales=A.locales||{};

/* ---------- progreso ---------- */
function snapshot(){const d={};try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP(k))d[k]=localStorage.getItem(k)}}catch(e){}return d}
function stable(d){return JSON.stringify(Object.keys(d).sort().map(k=>[k,d[k]]))}
function restore(d){clearProgress();Object.entries(d||{}).forEach(([k,v])=>{if(!SKIP(k)&&typeof v==='string')try{localStorage.setItem(k,v)}catch(e){}})}
function clearProgress(){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!SKIP(k))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k))}

/* ---------- nombre y contraseña ---------- */
function slug(n){return String(n||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ñ/g,'n')}
function checkName(n){n=String(n||'').trim();if(n.length<3)return 'El nombre necesita al menos 3 letras';if(n.length>16)return 'El nombre puede tener como mucho 16 letras';
  if(!/^[A-Za-z0-9_ÁÉÍÓÚÜÑáéíóúüñ]+$/.test(n))return 'Usa solo letras, números y _ (sin espacios)';return ''}
function checkPass(p){if(String(p||'').length<6)return 'La contraseña necesita al menos 6 caracteres';return ''}
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function hash(pass,salt){
  if(window.crypto&&crypto.subtle){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveBits']);
    return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:60000,hash:'SHA-256'},k,256))}
  let h=2166136261;const s=salt+'|'+pass;for(let r=0;r<20000;r++)for(let i=0;i<s.length;i++){h^=s.charCodeAt(i)+r;h=Math.imul(h,16777619)>>>0}return 'f'+h.toString(16)}
function newSalt(){const a=new Uint8Array(12);(window.crypto||{getRandomValues:x=>x.map(()=>Math.random()*256|0)}).getRandomValues(a);return hex(a)}

/* ---------- servidor (Firebase por REST, sin librerías) ---------- */
const ERR={EMAIL_EXISTS:'Ese nombre de cuenta ya está cogido. Prueba otro.',EMAIL_NOT_FOUND:'No existe ninguna cuenta con ese nombre.',INVALID_PASSWORD:'La contraseña no es correcta.',
  INVALID_LOGIN_CREDENTIALS:'El nombre o la contraseña no son correctos.',USER_DISABLED:'Esta cuenta está desactivada.',TOO_MANY_ATTEMPTS_TRY_LATER:'Demasiados intentos. Espera un poco y vuelve a probar.',
  WEAK_PASSWORD:'La contraseña es demasiado corta (mínimo 6).',OPERATION_NOT_ALLOWED:'El servidor no tiene activadas las cuentas con contraseña (revisa Firebase).',PERMISSION_DENIED:'El servidor no deja guardar (revisa las reglas de Firestore).'};
function nice(e){const m=String(e&&e.message||e||'');for(const k in ERR)if(m.includes(k))return ERR[k];if(/Failed to fetch|NetworkError|Load failed|network/i.test(m))return 'No hay conexión con el servidor.';return 'Algo ha fallado: '+m.slice(0,80)}
async function post(url,body,form){const r=await fetch(url,{method:'POST',headers:{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'},body:form?body:JSON.stringify(body)});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&(j.error.message||j.error.status))||('HTTP '+r.status));return j}
const IT='https://identitytoolkit.googleapis.com/v1/accounts:';
async function cloudAuth(kind,name,pass){const j=await post(IT+kind+'?key='+CFG.apiKey,{email:slug(name)+MAIL,password:pass,returnSecureToken:true});
  return {uid:j.localId,id:j.idToken,rt:j.refreshToken,exp:Date.now()+(+j.expiresIn||3600)*1000-60000}}
let tok=null;
async function idToken(){const c=A.cur;if(!c||!c.rt)throw new Error('Sin sesión');if(tok&&tok.exp>Date.now())return tok.id;
  const j=await post('https://securetoken.googleapis.com/v1/token?key='+CFG.apiKey,'grant_type=refresh_token&refresh_token='+encodeURIComponent(c.rt),true);
  if(j.refresh_token&&j.refresh_token!==c.rt){c.rt=j.refresh_token;wr(A)}tok={id:j.id_token,exp:Date.now()+(+j.expires_in||3600)*1000-60000};return tok.id}
const DOC=uid=>`https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents/cuentas/${uid}`;
async function cloudGet(){const r=await fetch(DOC(A.cur.uid),{headers:{Authorization:'Bearer '+await idToken()}});
  if(r.status===404)return null;const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&(j.error.status||j.error.message))||('HTTP '+r.status));
  const f=j.fields||{};return {name:f.name&&f.name.stringValue,data:f.data?JSON.parse(f.data.stringValue||'{}'):{},updated:f.updated?+f.updated.integerValue:0}}
async function cloudPut(data){const now=Date.now();const body={fields:{name:{stringValue:A.cur.name},data:{stringValue:JSON.stringify(data)},updated:{integerValue:String(now)},app:{stringValue:'cubiverso'}}};
  const r=await fetch(DOC(A.cur.uid),{method:'PATCH',headers:{Authorization:'Bearer '+await idToken(),'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error((j.error&&(j.error.status||j.error.message))||('HTTP '+r.status))}return now}

/* ---------- estado y avisos ---------- */
const subs=[];let estado={sync:'idle',msg:''};
function emit(){subs.forEach(f=>{try{f(api.info())}catch(e){}})}
function setEstado(sync,msg){estado={sync,msg:msg||''};emit()}
function setName(n){try{if(window.CubiAvatar){const s=CubiAvatar.state();s.name=n;CubiAvatar.save(s)}}catch(e){}}

/* ---------- acciones ---------- */
async function crear(name,pass,soloLocal){
  const e=checkName(name)||checkPass(pass);if(e)throw new Error(e);name=name.trim();const sg=slug(name);
  if(A.locales[sg])throw new Error('Ya hay una cuenta con ese nombre en este dispositivo. Entra con ella.');
  const salt=newSalt(),h=await hash(pass,salt);
  const cur={name,slug:sg,h,s:salt,cloud:false,created:Date.now()};
  if(CFG&&!soloLocal){const t=await cloudAuth('signUp',name,pass);Object.assign(cur,{cloud:true,uid:t.uid,rt:t.rt});tok={id:t.id,exp:t.exp}}
  A.cur=cur;wr(A);setName(name);
  if(cur.cloud){try{await subir(true)}catch(err){setEstado('error',nice(err))}}
  emit();return cur}
async function entrar(name,pass){
  const e=checkName(name)||checkPass(pass);if(e)throw new Error(e);name=name.trim();const sg=slug(name);
  const loc=A.locales[sg];
  if(loc&&!loc.cloud){ // cuenta local guardada en este dispositivo
    if(await hash(pass,loc.s)!==loc.h)throw new Error('La contraseña no es correcta.');
    restore(loc.data);delete loc.data;A.cur=Object.assign({},loc);delete A.locales[sg];wr(A);emit();return {restored:true}}
  if(!CFG)throw new Error(loc?'':'No hay ninguna cuenta con ese nombre en este dispositivo. Para traerla de otro, usa «Tengo un código».');
  const t=await cloudAuth('signInWithPassword',name,pass);tok={id:t.id,exp:t.exp};
  const salt=newSalt();A.cur={name,slug:sg,h:await hash(pass,salt),s:salt,cloud:true,uid:t.uid,rt:t.rt};wr(A);
  let doc;try{doc=await cloudGet()}catch(err){delete A.cur;tok=null;wr(A);throw err}
  if(doc){if(doc.name)A.cur.name=doc.name;restore(doc.data);A.cur.lastPush=stable(snapshot());A.cur.pulled=doc.updated;A.cur.pushedAt=doc.updated;wr(A);setName(A.cur.name)}
  else{setName(name);await subir(true)}
  emit();return {restored:!!doc}}
let busy=false;
async function subir(force){const c=A.cur;if(!c||!c.cloud||!CFG)return false;if(busy)return false;
  const d=snapshot(),s=stable(d);if(!force&&s===c.lastPush)return false;busy=true;setEstado('sync','Guardando en la nube…');
  try{const at=await cloudPut(d);c.lastPush=s;c.pushedAt=at;wr(A);setEstado('ok','Guardado en la nube');return true}
  catch(e){setEstado('error',nice(e));throw e}finally{busy=false}}
/* al abrir: si la nube es más nueva (se jugó en otro dispositivo) se descarga */
async function alAbrir(){const c=A.cur;if(!c||!c.cloud||!CFG)return false;setEstado('sync','Comprobando la nube…');
  try{const doc=await cloudGet();const local=stable(snapshot()),cambiadoAqui=c.lastPush!==undefined&&local!==c.lastPush;
    if(doc&&doc.updated>(c.pushedAt||0)&&!cambiadoAqui){restore(doc.data);c.lastPush=stable(snapshot());c.pushedAt=doc.updated;wr(A);setEstado('ok','Progreso traído de la nube');return true}
    await subir(!doc);setEstado('ok','Guardado en la nube');return false}
  catch(e){setEstado('error',nice(e));return false}}
async function salir(){const c=A.cur;if(!c)return;
  if(c.cloud&&CFG){await subir(false)}
  else{A.locales[c.slug]=Object.assign({},c,{data:snapshot()})}
  delete A.cur;tok=null;wr(A);clearProgress();emit()}
/* ---------- código de transferencia ---------- */
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64=t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
async function zip(u8,inv){if(!window.CompressionStream)return null;const cs=inv?new DecompressionStream('gzip'):new CompressionStream('gzip');
  return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(cs)).arrayBuffer())}
async function codigo(){const c=A.cur;if(!c)throw new Error('No has entrado en ninguna cuenta');
  const raw=new TextEncoder().encode(JSON.stringify({v:1,n:c.name,h:c.h,s:c.s,c:!!c.cloud,d:snapshot(),t:Date.now()}));
  const z=await zip(raw).catch(()=>null);return (z?'CUBI1Z.':'CUBI1.')+b64(z||raw)}
async function usarCodigo(code,pass){code=String(code||'').replace(/\s+/g,'');const m=/^CUBI1(Z?)\.(.+)$/.exec(code);if(!m)throw new Error('Ese código no es válido. Cópialo entero, desde CUBI1.');
  let u8;try{u8=unb64(m[2]);if(m[1])u8=await zip(u8,true)}catch(e){throw new Error('El código está incompleto o roto.')}
  let o;try{o=JSON.parse(new TextDecoder().decode(u8))}catch(e){throw new Error('El código está incompleto o roto.')}
  if(await hash(pass,o.s)!==o.h)throw new Error('La contraseña no es la de esa cuenta.');
  // si la cuenta es de la nube y hay servidor, se entra también en la nube
  if(o.c&&CFG){try{await entrar(o.n,pass);return o.n}catch(e){}}
  restore(o.d);A.cur={name:o.n,slug:slug(o.n),h:o.h,s:o.s,cloud:false,created:Date.now()};wr(A);setName(o.n);emit();return o.n}
/* pasar una cuenta local a la nube cuando ya hay servidor */
async function subirANube(pass){const c=A.cur;if(!c||c.cloud||!CFG)return;if(await hash(pass,c.s)!==c.h)throw new Error('La contraseña no es correcta.');
  const t=await cloudAuth('signUp',c.name,pass);Object.assign(c,{cloud:true,uid:t.uid,rt:t.rt});tok={id:t.id,exp:t.exp};wr(A);await subir(true);emit()}

/* guardar solo: cada 15 s si cambió algo, y al salir de la app */
const top_=(()=>{try{return window.parent===window}catch(e){return false}})();
if(top_)setInterval(()=>{if(A.cur&&A.cur.cloud)subir(false).catch(()=>{})},15000);
if(top_)document.addEventListener('visibilitychange',()=>{if(document.hidden&&A.cur&&A.cur.cloud)subir(false).catch(()=>{})});
window.addEventListener('storage',e=>{if(e.key===AK){A=rd();A.locales=A.locales||{};emit()}});

const api={cfg:CFG,uid:()=>A.cur&&A.cur.cloud?A.cur.uid:null,token:()=>idToken(),nube:!!CFG,actual:()=>A.cur?{name:A.cur.name,cloud:!!A.cur.cloud,created:A.cur.created}:null,locales:()=>Object.values(A.locales).map(l=>l.name),
  info:()=>({cuenta:api.actual(),nube:!!CFG,estado}),crear,entrar,salir,guardar:()=>subir(false).catch(()=>false),subir:()=>subir(true),alAbrir,codigo,usarCodigo,subirANube,
  on:f=>{subs.push(f);return()=>subs.splice(subs.indexOf(f),1)},checkName,checkPass,nice};
window.CubiCuenta=api;
})();
