/* Cubiverso · flecha del ratón propia (como en los juegos de bloques). Se elige en Ajustes y sale en la plataforma y en todos los juegos. */
(function(){
const KEY='cubi-cursor';
const arrow=(fill,stroke,extra,glow)=>`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'>${glow?`<path d='M4 3 L4 25 L10 19.5 L14.2 28.5 L18.4 26.6 L14.3 17.8 L22 17.8 Z' fill='none' stroke='${glow}' stroke-width='5' stroke-linejoin='round' opacity='.45'/>`:''}<path d='M4 3 L4 25 L10 19.5 L14.2 28.5 L18.4 26.6 L14.3 17.8 L22 17.8 Z' fill='${fill}' stroke='${stroke}' stroke-width='2' stroke-linejoin='round'/>${extra||''}</svg>`;
const C={
  cubi:{name:'Cubiverso',hx:4,hy:3,svg:arrow('#ffffff','#111111',`<path d='M6.5 8 L6.5 19 L10.3 15.4 L15.5 15.4 Z' fill='#3fa7ff'/>`)},
  bloque:{name:'Bloque',hx:4,hy:3,svg:arrow('#ffcc33','#111111',`<rect x='6.5' y='11' width='5' height='5' fill='#ff7a2f' stroke='#111' stroke-width='1'/>`)},
  neon:{name:'Neón',hx:4,hy:3,svg:arrow('#0b1020','#22d3ee','',`#22d3ee`)},
  dorada:{name:'Dorada',hx:4,hy:3,svg:arrow('#ffd54a','#6b4a00',`<path d='M6.5 7 L6.5 12 L9 10 Z' fill='#fff8d6'/>`)},
  rosa:{name:'Rosa',hx:4,hy:3,svg:arrow('#ff8fc7','#5a0f33',`<path d='M9 14.5c-1.6-1.2-2.4-2-2.4-3a1.2 1.2 0 012.4-.3 1.2 1.2 0 012.4.3c0 1-.8 1.8-2.4 3z' fill='#fff'/>`)},
  noche:{name:'Noche',hx:4,hy:3,svg:arrow('#1f2937','#ffffff',`<circle cx='9' cy='13' r='1.3' fill='#ffcc33'/>`)},
  espada:{name:'Espada',hx:3,hy:3,svg:`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><path d='M3 3 L8 4.5 L21 17.5 L17.5 21 L4.5 8 Z' fill='#e6edf5' stroke='#111' stroke-width='1.6' stroke-linejoin='round'/><path d='M5 5 L19 19' stroke='#9fb2c8' stroke-width='1.2'/><path d='M16 22.5 L22.5 16 L25 18.5 L18.5 25 Z' fill='#ffcc33' stroke='#111' stroke-width='1.5'/><path d='M21.5 21.5 L27.5 27.5' stroke='#7c4a2a' stroke-width='3.4' stroke-linecap='round'/><circle cx='28' cy='28' r='2' fill='#ffcc33' stroke='#111' stroke-width='1'/></svg>`},
  mira:{name:'Mira',hx:16,hy:16,svg:`<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'><circle cx='16' cy='16' r='9' fill='none' stroke='#111' stroke-width='4'/><circle cx='16' cy='16' r='9' fill='none' stroke='#fff' stroke-width='2'/><path d='M16 2v8M16 22v8M2 16h8M22 16h8' stroke='#111' stroke-width='4'/><path d='M16 3v6.5M16 22.5v6.5M3 16h6.5M22.5 16h6.5' stroke='#fff' stroke-width='2'/><circle cx='16' cy='16' r='2' fill='#e5484d'/></svg>`},
  normal:{name:'La del ordenador',hx:0,hy:0,svg:null}
};
const url=c=>`url("data:image/svg+xml,${encodeURIComponent(c.svg).replace(/'/g,'%27')}") ${c.hx} ${c.hy}`;
function get(){try{const v=localStorage.getItem(KEY);return C[v]?v:'cubi'}catch(e){return 'cubi'}}
function apply(id){id=id||get();let st=document.getElementById('cubi-cursor-css');
  const c=C[id];if(!c||!c.svg||!matchMedia('(pointer:fine)').matches){if(st)st.remove();return}
  if(!st){st=document.createElement('style');st.id='cubi-cursor-css';(document.head||document.documentElement).appendChild(st)}
  const u=url(c);
  // la flecha en todo, la de texto en los campos de escribir; los juegos que esconden el ratón (cursor:none en su lienzo) lo siguen haciendo
  st.textContent=`html,body,*:not(input):not(textarea):not(select):not([contenteditable]){cursor:${u},auto}
button,a,[role=button],[data-act],label,summary,select{cursor:${u},pointer}
input[type=range],input[type=checkbox],input[type=radio],input[type=color]{cursor:${u},pointer}`}
function set(id){if(!C[id])return;try{localStorage.setItem(KEY,id)}catch(e){}apply(id);
  try{document.querySelectorAll('iframe').forEach(f=>{try{f.contentWindow.CubiCursor&&f.contentWindow.CubiCursor.apply(id)}catch(e){}})}catch(e){}}
function preview(id){const c=C[id];return c&&c.svg?'data:image/svg+xml,'+encodeURIComponent(c.svg).replace(/'/g,'%27'):''}
addEventListener('storage',e=>{if(e.key===KEY)apply()});
window.CubiCursor={LIST:C,get,set,apply,preview};
apply();
})();
