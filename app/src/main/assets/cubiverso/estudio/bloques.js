/* CuboStudio · bloques de programación (estilo Scratch)
   Un programa es una lista de pilas: [{x,y,b:[bloque,...]}]
   Un bloque es {op, a:{arg:valor}, s:[...], s2:[...]}  (s y s2 son las "bocas" de los bloques en forma de C) */
(function(){
const CATS=[
  ['ev','Eventos','#ffbf00','#cc9900'],['mv','Movimiento','#4c97ff','#3373cc'],['lk','Apariencia','#9966ff','#774dcb'],
  ['pl','Jugador','#ff6680','#d94d66'],['ct','Control','#ffab19','#cf8b17'],['vr','Variables','#ff8c1a','#db6e00'],
  ['gm','Juego','#59c059','#389438'],['sn','Sonido','#cf63cf','#bd42bd']];
const KEYS=[['espacio','espacio'],['e','E'],['q','Q'],['f','F'],['r','R'],['1','1'],['2','2'],['3','3']];
const SOUNDS=[['coin','Moneda'],['jump','Salto'],['boing','Muelle'],['win','Victoria'],['lose','Derrota'],['pop','Pop'],['hit','Golpe'],['boom','Explosión'],['laser','Láser'],['levelup','Subir nivel'],['alarm','Alarma'],['lucky','Suerte'],['splash','Chapuzón'],['whoosh','Viento'],['place','Clac'],['checkpoint','Punto de control'],['bite','Pica un pez'],['fish','Pez pescado'],['cash','Caja registradora'],['buy','Compra'],['error','Error'],['thunder','Trueno'],['steal','Robo'],['kick','Patada'],['throw','Lanzar'],['phone','Teléfono']];
const MUSIC=[['ninguna','Ninguna'],['bienvenida','Bienvenida'],['aventura','Aventura'],['lago','Lago tranquilo'],['batalla','Batalla'],['neon','Ciudad neón'],['fiesta','Fiesta'],['nana','Buenas noches']];
const OPS=[['>','>'],['<','<'],['=','='],['≠','≠'],['≥','≥'],['≤','≤']];
const MATS=[['plastico','plástico'],['neon','neón'],['madera','madera'],['metal','metal'],['cesped','césped'],['hielo','hielo'],['ladrillo','ladrillo'],['arena','arena']];
// tipos de hueco: n número, t texto, c color, d desplegable fijo, v variable, val valor para comparar
const B={};
function def(op,cat,text,args,o){B[op]=Object.assign({op,cat,text,args:args||{}},o||{})}
// EVENTOS
def('ev_start','ev','al empezar el juego',{},{hat:1});
def('ev_touch','ev','cuando el jugador toque esto',{},{hat:1});
def('ev_click','ev','al hacer clic en esto',{},{hat:1});
def('ev_key','ev','al pulsar la tecla {k}',{k:{t:'d',o:KEYS,d:'espacio'}},{hat:1});
def('ev_msg','ev','al recibir el mensaje {m}',{m:{t:'t',d:'empezar'}},{hat:1});
def('ev_hit','ev','cuando le dé un proyectil',{},{hat:1});
def('ev_clone','ev','al empezar como copia',{},{hat:1});
// MOVIMIENTO
def('mv_move','mv','mover x {x} y {y} z {z} en {t} s',{x:{t:'n',d:0},y:{t:'n',d:0},z:{t:'n',d:5},t:{t:'n',d:1}});
def('mv_goto','mv','ir a x {x} y {y} z {z}',{x:{t:'n',d:0},y:{t:'n',d:5},z:{t:'n',d:0}});
def('mv_turn','mv','girar {g} grados',{g:{t:'n',d:15}});
def('mv_spin','mv','girar {g} grados en {t} s',{g:{t:'n',d:360},t:{t:'n',d:2}});
def('mv_chase','mv','perseguir al jugador {t} s a velocidad {v}',{t:{t:'n',d:3},v:{t:'n',d:6}});
def('mv_back','mv','volver a su sitio en {t} s',{t:{t:'n',d:1}});
def('mv_random','mv','ir a un sitio al azar a {r} de su sitio',{r:{t:'n',d:20}});
// APARIENCIA
def('lk_color','lk','poner color {c}',{c:{t:'c',d:'#c4281c'}});
def('lk_mat','lk','poner material {m}',{m:{t:'d',o:MATS,d:'neon'}});
def('lk_transp','lk','poner transparencia al {n} %',{n:{t:'n',d:50}});
def('lk_size','lk','cambiar tamaño a {x} {y} {z}',{x:{t:'n',d:4},y:{t:'n',d:1},z:{t:'n',d:4}});
def('lk_show','lk','aparecer',{});
def('lk_hide','lk','desaparecer',{});
def('lk_say','lk','poner cartel {s}',{s:{t:'t',d:'¡Hola!'}});
def('lk_solid','lk','hacer {m}',{m:{t:'d',o:[['si','sólido'],['no','atravesable']],d:'no'}});
// JUGADOR
def('pl_kill','pl','eliminar al jugador',{});
def('pl_tp','pl','llevar al jugador a x {x} y {y} z {z}',{x:{t:'n',d:0},y:{t:'n',d:5},z:{t:'n',d:0}});
def('pl_launch','pl','lanzar al jugador hacia arriba con fuerza {n}',{n:{t:'n',d:35}});
def('pl_speed','pl','poner velocidad del jugador a {n}',{n:{t:'n',d:24}});
def('pl_jumpp','pl','poner salto del jugador a {n}',{n:{t:'n',d:30}});
def('pl_check','pl','guardar punto de control aquí',{});
def('pl_size','pl','poner tamaño del jugador al {n} %',{n:{t:'n',d:150}});
def('pl_shoot','pl','lanzar un proyectil {c} con fuerza {v}',{c:{t:'c',d:'#00a2ff'},v:{t:'n',d:32}});
// CONTROL
def('ct_wait','ct','esperar {t} s',{t:{t:'n',d:1}});
def('ct_waitrand','ct','esperar al azar entre {a} y {b} s',{a:{t:'n',d:1},b:{t:'n',d:3}});
def('ct_repeat','ct','repetir {n} veces',{n:{t:'n',d:10}},{c:1});
def('ct_forever','ct','por siempre',{},{c:1,cap:1});
def('ct_if','ct','si {a} {o} {b} entonces',{a:{t:'val',d:'puntos'},o:{t:'d',o:OPS,d:'>'},b:{t:'n',d:5}},{c:1});
def('ct_ifelse','ct','si {a} {o} {b} entonces',{a:{t:'val',d:'puntos'},o:{t:'d',o:OPS,d:'>'},b:{t:'n',d:5}},{c:2});
def('ct_iftouch','ct','si el jugador está tocando esto',{},{c:1});
def('ct_until','ct','esperar hasta que {a} {o} {b}',{a:{t:'val',d:'puntos'},o:{t:'d',o:OPS,d:'>'},b:{t:'n',d:5}});
def('ct_stop','ct','parar este programa',{},{cap:1});
// VARIABLES
def('vr_set','vr','poner {v} a {n}',{v:{t:'v',d:'puntos'},n:{t:'n',d:0}});
def('vr_add','vr','sumar {n} a {v}',{n:{t:'n',d:1},v:{t:'v',d:'puntos'}});
def('vr_addv','vr','sumar {a} × {n} a {v}',{a:{t:'val',d:'@azar'},n:{t:'n',d:1},v:{t:'v',d:'puntos'}});
def('vr_show','vr','mostrar {v} en pantalla',{v:{t:'v',d:'puntos'}});
def('vr_hide','vr','esconder {v} de la pantalla',{v:{t:'v',d:'puntos'}});
// JUEGO
def('gm_msg','gm','mostrar mensaje {s} durante {t} s',{s:{t:'t',d:'¡Bien hecho!'},t:{t:'n',d:2}});
def('gm_send','gm','enviar el mensaje {m}',{m:{t:'t',d:'empezar'}});
def('gm_win','gm','ganar la partida',{},{cap:1});
def('gm_lose','gm','perder la partida',{},{cap:1});
def('gm_destroy','gm','destruir esto',{},{cap:1});
def('gm_clone','gm','crear una copia en x {x} y {y} z {z}',{x:{t:'n',d:0},y:{t:'n',d:10},z:{t:'n',d:0}});
def('gm_cloneof','gm','crear una copia de {o} en x {x} y {y} z {z}',{o:{t:'obj',d:''},x:{t:'n',d:0},y:{t:'n',d:5},z:{t:'n',d:0}});
def('gm_timer','gm','{m} el cronómetro',{m:{t:'d',o:[['start','empezar'],['stop','parar']],d:'start'}});
// SONIDO
def('sn_play','sn','tocar sonido {s}',{s:{t:'d',o:SOUNDS,d:'coin'}});
def('sn_music','sn','poner música {m}',{m:{t:'d',o:MUSIC,d:'aventura'}});
const BUILTIN_VALS=[['@altura','altura del jugador'],['@dist','distancia al jugador'],['@tiempo','segundos jugados'],['@azar','número al azar 1-10'],['@crono','cronómetro']];

function fresh(op){const d=B[op];const a={};for(const k in d.args)a[k]=d.args[k].d;const b={op,a};if(d.c)b.s=[];if(d.c===2)b.s2=[];return b}
const clone=x=>JSON.parse(JSON.stringify(x));
function catOf(op){const d=B[op];return CATS.find(c=>c[0]===(d?d.cat:'ct'))}

/* ================== EDITOR ================== */
const CSS=`
.cbz{display:grid;grid-template-columns:minmax(200px,330px) minmax(0,1fr);height:100%;min-height:0;font:600 13px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif;color:#fff;user-select:none;-webkit-user-select:none}
.cbz-pal{display:grid;grid-template-columns:54px minmax(0,1fr);min-height:0;background:#20232c;border-right:1px solid #333948}
.cbz-cats{display:flex;flex-direction:column;gap:2px;padding:6px 2px;overflow:auto;background:#191b22}
.cbz-cats button{border:0;background:none;color:#c9cfdb;font:600 10px system-ui;display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;border-radius:8px;cursor:pointer}
.cbz-cats button i{width:18px;height:18px;border-radius:50%;border:2px solid rgba(0,0,0,.25)}
.cbz-cats button.on{background:#2c3140;color:#fff}
.cbz-list{overflow:auto;padding:10px 8px 40px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.cbz-list h4{margin:8px 2px 0;font-size:13px;color:#e6e9f0}
.cbz-ws{position:relative;overflow:auto;background:#2b2f3a;background-image:radial-gradient(#3a4050 1px,transparent 1px);background-size:22px 22px;touch-action:none;min-height:0}
.cbz-in{position:relative;min-width:1600px;min-height:1400px}
.cbz-stack{position:absolute}
.cb{position:relative;display:block;width:max-content;max-width:520px;margin:0;touch-action:none;cursor:grab}
.cbz-list .cb{touch-action:pan-y}
.cb>.cbr{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:7px 10px 9px;min-height:22px;border-radius:5px;background:var(--c);border:1px solid var(--d);position:relative}
.cb>.cbr::after{content:"";position:absolute;left:14px;bottom:-6px;width:18px;height:6px;background:var(--c);border:1px solid var(--d);border-top:0;border-radius:0 0 4px 4px;z-index:1}
.cb.cap>.cbr::after{display:none}
.cb.hat>.cbr{border-radius:16px 16px 5px 5px;padding-top:12px}
.cb .cbm{margin-left:16px;min-height:22px;padding:6px 0 4px;border-left:14px solid var(--c);box-shadow:-1px 0 0 var(--d)}
.cb .cbm.empty{min-height:26px}
.cb .cbf{background:var(--c);border:1px solid var(--d);border-top:0;height:12px;border-radius:0 0 5px 5px;width:90px;position:relative}
.cb .cbf::after{content:"";position:absolute;left:14px;bottom:-6px;width:18px;height:6px;background:var(--c);border:1px solid var(--d);border-top:0;border-radius:0 0 4px 4px}
.cb.cap .cbf::after{display:none}
.cb .cbmid{background:var(--c);border:1px solid var(--d);border-top:0;border-bottom:0;padding:4px 10px;width:max-content;min-width:70px}
.cb input,.cb select{font:600 12px system-ui;border:0;border-radius:10px;padding:3px 7px;background:#fff;color:#222;min-width:30px;max-width:150px;touch-action:auto}
.cb input[type=number]{width:52px;-moz-appearance:textfield}.cb input::-webkit-inner-spin-button{display:none}
.cb input.t{width:90px}
.cb select{border-radius:6px;background:rgba(0,0,0,.18);color:#fff;padding:3px 4px}
.cb select option{color:#222}
.cb input[type=color]{width:34px;height:22px;padding:0 2px;border-radius:6px}
.cbz-drag{position:fixed;z-index:999;pointer-events:none;opacity:.92;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))}
.cbz-ind{position:absolute;height:5px;width:80px;background:#fff;border-radius:3px;box-shadow:0 0 0 2px #4c97ff;pointer-events:none;z-index:50}
.cbz-trash{position:absolute;inset:0;background:rgba(220,40,40,.25);display:grid;place-items:center;font-size:15px;pointer-events:none;opacity:0;transition:opacity .15s}
.cbz-pal.del .cbz-trash{opacity:1}
.cbz-pal{position:relative}
.cbz-empty{position:absolute;left:24px;top:24px;max-width:340px;color:#aeb6c6;font-weight:500;line-height:1.5;pointer-events:none}
.cbz-tools{position:sticky;left:0;top:0;z-index:5;display:flex;gap:6px;padding:8px;width:max-content}
.cbz-tools button{border:1px solid #444b5c;background:#20232c;color:#fff;border-radius:8px;padding:6px 10px;font:600 12px system-ui;cursor:pointer}
@media (max-width:700px){.cbz{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(150px,38%) minmax(0,1fr)}.cbz-pal{border-right:0;border-bottom:1px solid #333948}}`;

function mount(root,opt){opt=opt||{};
  if(!document.getElementById('cbz-css')){const st=document.createElement('style');st.id='cbz-css';st.textContent=CSS;document.head.appendChild(st)}
  root.innerHTML=`<div class="cbz"><div class="cbz-pal"><div class="cbz-cats"></div><div class="cbz-list"></div><div class="cbz-trash">Suelta aquí para borrar</div></div>
    <div class="cbz-ws"><div class="cbz-tools"><button data-z="tidy">Ordenar</button><button data-z="-">−</button><button data-z="+">+</button></div><div class="cbz-in"></div></div></div>`;
  const pal=root.querySelector('.cbz-pal'),cats=root.querySelector('.cbz-cats'),list=root.querySelector('.cbz-list'),ws=root.querySelector('.cbz-ws'),inner=root.querySelector('.cbz-in');
  let prog=[],zoom=1;const elOf=new WeakMap(),mouthEl=new WeakMap();
  const vars=()=>(opt.vars&&opt.vars())||['puntos'];
  const changed=()=>{opt.onChange&&opt.onChange(prog)};

  function argEl(b,k,spec,live){const v=b.a[k];
    if(spec.t==='n'){const i=document.createElement('input');i.type='number';i.step='any';i.value=v;i.oninput=()=>{b.a[k]=i.value===''?0:+i.value;if(live)changed()};return i}
    if(spec.t==='t'){const i=document.createElement('input');i.className='t';i.value=v;i.maxLength=60;i.oninput=()=>{b.a[k]=i.value;if(live)changed()};return i}
    if(spec.t==='c'){const i=document.createElement('input');i.type='color';i.value=v;i.oninput=()=>{b.a[k]=i.value;if(live)changed()};return i}
    const s=document.createElement('select');let opts=spec.o;
    if(spec.t==='v')opts=vars().map(x=>[x,x]);
    if(spec.t==='obj'){const ns=[...new Set((opt.objects&&opt.objects())||[])];opts=ns.length?ns.map(x=>[x,x]):[['','(no hay objetos)']]}
    if(spec.t==='val')opts=vars().map(x=>[x,x]).concat(BUILTIN_VALS);
    if(!opts.some(o=>o[0]===v))opts=opts.concat([[v,String(v).replace(/^@/,'')]]);
    s.innerHTML=opts.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('');s.value=v;s.onchange=()=>{b.a[k]=s.value;if(live)changed()};return s}
  function rowContent(row,b,text,live){const d=B[b.op];text.split(/(\{\w+\})/).forEach(part=>{const m=/^\{(\w+)\}$/.exec(part);
    if(m&&d.args[m[1]])row.appendChild(argEl(b,m[1],d.args[m[1]],live));else if(part.trim()){const sp=document.createElement('span');sp.textContent=part.trim();row.appendChild(sp)}})}
  function blockEl(b,live){const d=B[b.op];if(!d){const x=document.createElement('div');x.className='cb';x.innerHTML='<div class="cbr" style="--c:#666;--d:#444">bloque desconocido</div>';elOf.set(b,x);return x}
    const c=catOf(b.op);const e=document.createElement('div');e.className='cb'+(d.hat?' hat':'')+(d.cap?' cap':'');e.style.setProperty('--c',c[2]);e.style.setProperty('--d',c[3]);
    const r=document.createElement('div');r.className='cbr';rowContent(r,b,d.text,live);e.appendChild(r);
    if(d.c){const m1=mouth(b,'s',live);e.appendChild(m1);
      if(d.c===2){const mid=document.createElement('div');mid.className='cbmid';mid.textContent='si no';e.appendChild(mid);e.appendChild(mouth(b,'s2',live))}
      const f=document.createElement('div');f.className='cbf';e.appendChild(f)}
    elOf.set(b,e);e.__b=b;return e}
  function mouth(b,key,live){const m=document.createElement('div');m.className='cbm'+(b[key].length?'':' empty');b[key].forEach(x=>m.appendChild(blockEl(x,live)));
    let map=mouthEl.get(b);if(!map){map={};mouthEl.set(b,map)}map[key]=m;return m}
  function render(){inner.innerHTML='';prog.forEach(stk=>{const s=document.createElement('div');s.className='cbz-stack';s.style.left=stk.x+'px';s.style.top=stk.y+'px';
      stk.b.forEach(b=>s.appendChild(blockEl(b,true)));stk.__el=s;inner.appendChild(s)});
    if(!prog.length){const e=document.createElement('div');e.className='cbz-empty';e.innerHTML=opt.emptyText||'Arrastra bloques aquí. Empieza con uno amarillo de <b>Eventos</b> y pon debajo lo que quieres que pase.';inner.appendChild(e)}}
  function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
  // paleta
  let curCat='ev';
  function renderPal(){cats.innerHTML=CATS.map(c=>`<button data-c="${c[0]}" class="${c[0]===curCat?'on':''}"><i style="background:${c[2]}"></i>${c[1]}</button>`).join('');
    list.innerHTML='';CATS.forEach(c=>{const h=document.createElement('h4');h.textContent=c[1];h.id='cbz-h-'+c[0];list.appendChild(h);
      Object.values(B).filter(d=>d.cat===c[0]).forEach(d=>{const b=fresh(d.op);const e=blockEl(b,false);e.dataset.pal=d.op;e.querySelectorAll('input,select').forEach(i=>{i.tabIndex=-1;i.style.pointerEvents='none'});list.appendChild(e)})})}
  cats.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;curCat=b.dataset.c;cats.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));
    const h=list.querySelector('#cbz-h-'+curCat);if(h)list.scrollTop=h.offsetTop-list.offsetTop-4});
  list.addEventListener('scroll',()=>{let best='ev';CATS.forEach(c=>{const h=list.querySelector('#cbz-h-'+c[0]);if(h&&h.offsetTop-list.offsetTop<=list.scrollTop+20)best=c[0]});
    if(best!==curCat){curCat=best;cats.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.c===best))}});
  // localizar un bloque dentro del programa
  function locate(b){let res=null;const walk=(arr,owner)=>{arr.forEach((x,i)=>{if(res)return;if(x===b){res={arr,i,owner};return}if(x.s)walk(x.s,x);if(x.s2)walk(x.s2,x)})};
    prog.forEach(stk=>{if(!res)walk(stk.b,stk)});return res}
  // arrastrar
  let drag=null;
  function startDrag(chain,fromPal,dx,dy,cx,cy,id){const ghost=document.createElement('div');ghost.className='cbz-drag';chain.forEach(b=>ghost.appendChild(blockEl(b,false)));ghost.style.transform=`scale(${zoom})`;ghost.style.transformOrigin='0 0';document.body.appendChild(ghost);
    drag={chain,ghost,dx,dy,fromPal,ind:null,target:null,id};move({clientX:cx,clientY:cy})}
  function candidates(){const out=[];const head=drag.chain[0],dh=B[head.op],last=B[drag.chain[drag.chain.length-1].op];
    if(dh&&dh.hat)return out; // los bloques de evento solo pueden ir sueltos
    const scan=(arr,mouthOwner,mkey)=>{
      // inicio de una boca
      if(mouthOwner&&mouthEl.get(mouthOwner)){const m=mouthEl.get(mouthOwner)[mkey];if(m&&(!last.cap||!arr.length)){const r=m.getBoundingClientRect();out.push({arr,i:0,x:r.left,y:r.top+4})}}
      arr.forEach((x,i)=>{const el=elOf.get(x);if(!el)return;const d=B[x.op]||{};
        if(!d.cap&&(!last.cap||i===arr.length-1)){const rr=el.getBoundingClientRect();out.push({arr,i:i+1,x:rr.left,y:rr.bottom})}
        if(x.s)scan(x.s,x,'s');if(x.s2)scan(x.s2,x,'s2')})};
    prog.forEach(stk=>{scan(stk.b,null);
      // encima del primer bloque de una pila (si no es un evento)
      const f=stk.b[0];if(f&&!(B[f.op]||{}).hat&&!last.cap){const el=elOf.get(f);if(el){const rr=el.getBoundingClientRect();out.push({arr:stk.b,i:0,x:rr.left,y:rr.top-(drag.ghost.getBoundingClientRect().height),top:stk})}}});
    return out}
  function move(e){if(!drag)return;const x=e.clientX-drag.dx,y=e.clientY-drag.dy;drag.ghost.style.left=x+'px';drag.ghost.style.top=y+'px';
    const pr=pal.getBoundingClientRect();const overPal=e.clientX>=pr.left&&e.clientX<=pr.right&&e.clientY>=pr.top&&e.clientY<=pr.bottom;pal.classList.toggle('del',overPal&&!drag.fromPal);drag.overPal=overPal;
    let best=null,bd=40*Math.max(1,zoom);if(!overPal)candidates().forEach(c=>{const d=Math.hypot(c.x-x,c.y-y);if(d<bd){bd=d;best=c}});
    drag.target=best;if(drag.ind){drag.ind.remove();drag.ind=null}
    if(best){const ir=inner.getBoundingClientRect();const ind=document.createElement('div');ind.className='cbz-ind';ind.style.left=(best.x-ir.left)/zoom+'px';ind.style.top=((best.top?best.y+drag.ghost.getBoundingClientRect().height:best.y)-ir.top)/zoom-2+'px';inner.appendChild(ind);drag.ind=ind}
    // desplazar el área si se acerca al borde
    const wr=ws.getBoundingClientRect();if(e.clientX>wr.right-30)ws.scrollLeft+=12;if(e.clientY>wr.bottom-30)ws.scrollTop+=12;if(e.clientX<wr.left+30&&e.clientX>wr.left)ws.scrollLeft-=12;if(e.clientY<wr.top+30&&e.clientY>wr.top)ws.scrollTop-=12}
  function drop(e){if(!drag)return;const d=drag;drag=null;d.ghost.remove();if(d.ind)d.ind.remove();pal.classList.remove('del');
    if(d.overPal){render();changed();return} // borrado
    if(d.target){d.target.arr.splice(d.target.i,0,...d.chain)}
    else{const ir=inner.getBoundingClientRect();const x=Math.max(4,(e.clientX-d.dx-ir.left)/zoom),y=Math.max(40,(e.clientY-d.dy-ir.top)/zoom);
      const wr=ws.getBoundingClientRect();if(e.clientX<wr.left||e.clientY<wr.top||e.clientX>wr.right||e.clientY>wr.bottom){if(d.fromPal){render();return}}
      prog.push({x:Math.round(x),y:Math.round(y),b:d.chain})}
    prog=prog.filter(s=>s.b.length);render();changed()}
  // pulsar sobre un bloque: se arrastra cuando el dedo o el ratón se mueven un poco
  root.addEventListener('pointerdown',e=>{if(e.button>0)return;if(e.target.closest('input,select'))return;const be=e.target.closest('.cb');if(!be||drag)return;
    const fromPal=!!be.dataset.pal;const r=be.getBoundingClientRect();
    const pend={op:be.dataset.pal,b:be.__b,x:e.clientX,y:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,id:e.pointerId,started:false};
    if(!fromPal)e.preventDefault();
    const mv=ev=>{if(ev.pointerId!==pend.id)return;
      if(!pend.started){if(Math.hypot(ev.clientX-pend.x,ev.clientY-pend.y)<(fromPal?7:4))return;pend.started=true;let chain;
        if(fromPal)chain=[fresh(pend.op)];else{const loc=locate(pend.b);if(!loc){stop();return}chain=loc.arr.splice(loc.i);prog=prog.filter(s=>s.b.length);render()}
        startDrag(chain,fromPal,pend.dx,pend.dy,ev.clientX,ev.clientY,pend.id)}
      ev.preventDefault();move(ev)};
    const stop=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};
    const up=ev=>{if(ev.pointerId!==pend.id)return;stop();if(!pend.started){if(fromPal&&opt.onPaletteClick)opt.onPaletteClick(pend.op);return}drop(ev)};
    addEventListener('pointermove',mv,{passive:false});addEventListener('pointerup',up);addEventListener('pointercancel',up)});
  // pan del área vacía
  ws.addEventListener('pointerdown',e=>{if(e.target.closest('.cb,.cbz-tools'))return;const sx=e.clientX,sy=e.clientY,l=ws.scrollLeft,t=ws.scrollTop;
    const mv=ev=>{ws.scrollLeft=l-(ev.clientX-sx);ws.scrollTop=t-(ev.clientY-sy)};const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};
    addEventListener('pointermove',mv);addEventListener('pointerup',up)});
  root.querySelector('.cbz-tools').addEventListener('click',e=>{const b=e.target.closest('[data-z]');if(!b)return;const z=b.dataset.z;
    if(z==='tidy'){let y=50;prog.forEach(s=>{s.x=24;s.y=y;y+=(s.__el?s.__el.getBoundingClientRect().height/zoom:60)+30});render();changed()}
    if(z==='+'||z==='-'){zoom=Math.max(.5,Math.min(1.6,zoom+(z==='+'?.15:-.15)));inner.style.zoom=zoom}});
  renderPal();render();
  return {load(p){prog=p||[];render()},get:()=>prog,refreshVars(){renderPal();render()},
    add(op){const b=fresh(op);prog.push({x:30+ws.scrollLeft,y:60+ws.scrollTop+prog.length*12,b:[b]});render();changed()}};
}
window.CuboBloques={CATS,B,fresh,clone,mount,BUILTIN_VALS,KEYS,SOUNDS};
})();
