/* CuboStudio · IA creadora de juegos
   Lee lo que escribes ("un obby en el espacio muy difícil con trampolines") y construye un juego completo
   con piezas y bloques de programación, que luego puedes jugar, cambiar en el editor o publicar.
   Funciona sin internet: entiende palabras clave en español y genera el nivel al azar (cada versión es distinta). */
(function(){
window.CuboIA=function(H){
const {obj,bk,st,PF,E}=H;
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function rng(seed){let s=(seed>>>0)||1;return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const R1=n=>Math.round(n*10)/10;

/* ---------- tipos de juego ---------- */
const TYPES={
  obby:{name:'Obby',desc:'Saltos, plataformas y lava hasta la meta',color:'#ff6a00',kw:['obby','parkour','salto','saltar','plataforma','lava','meta','fases','nivel']},
  monedas:{name:'Recoger monedas',desc:'Coge todas las monedas antes de que acabe el tiempo',color:'#f5cd30',kw:['moneda','recoger','coleccion','tesoro','gema','estrella','diamante','oro','buscar']},
  supervivencia:{name:'Supervivencia',desc:'Aguanta sin que te pillen los enemigos',color:'#4b974b',kw:['zombi','zombie','sobrevivi','supervivencia','huir','escapa','persegu','monstruo','enemigo','pillar','pilla']},
  laberinto:{name:'Laberinto',desc:'Encuentra la salida del laberinto',color:'#9966ff',kw:['laberinto','maze','perdido','salida','pasillo']},
  esquivar:{name:'Esquivar',desc:'Esquiva lo que cae del cielo',color:'#c4281c',kw:['meteorito','esquiva','lluvia','cae','caen','bomba','asteroide','granizo','cielo']},
  torre:{name:'Torre',desc:'Sube hasta lo más alto de la torre',color:'#21c4b0',kw:['torre','subir','sube','escalar','cima','alto','altura','montana','rascacielos']},
  batalla:{name:'Batalla',desc:'Lanza proyectiles a los rivales (tecla E)',color:'#00a2ff',kw:['disparar','dispara','lanzar','globo','guerra','batalla','pelea','luchar','diana','punteria','tiro']},
  carrera:{name:'Carrera',desc:'Corre hasta la meta lo más rápido posible',color:'#e5484d',kw:['carrera','correr','corre','rapido','contrarreloj','velocidad','sprint']},
  jefe:{name:'Jefe final',desc:'Derrota a un jefe enorme lanzándole proyectiles',color:'#7f1d1d',kw:['jefe','boss','dragon','titan','villano','malvado','derrotar','vencer','combate final']},
  tycoon:{name:'Tycoon',desc:'Compra edificios que te dan dinero hasta hacerte rico',color:'#16a34a',kw:['tycoon','fabrica','dinero','negocio','millonari','rico','empresa','granja','tienda','comprar','construir']},
  rescate:{name:'Rescate',desc:'Encuentra a los amigos perdidos y llévalos a casa',color:'#0ea5e9',kw:['rescat','salvar','salva','mascota','gatito','perrito','pollito','amigos perdidos','buscar a','encontrar a','esconde']}
};
/* ---------- mundos ---------- */
const THEMES={
  normal:{name:'Prado',sky:'dia',pal:['#00a2ff','#f5cd30','#ff6a00','#4b974b','#ff66cc','#21c4b0'],mat:'plastico',danger:['Lava','#ff4a1c','neon'],deco:'arbol',music:'aventura',kw:[]},
  espacio:{name:'Espacio',sky:'espacio',kw2:1,pal:['#8b5cf6','#22d3ee','#f472b6','#a3e635','#facc15','#60a5fa'],mat:'neon',danger:['Vacío espacial','#3b0764','neon'],deco:'cristal',music:'neon',grav:32,jump:26,kw:['espacio','espacial','planeta','luna','galaxia','estrella','astronauta','marte','cohete','alien','ovni']},
  noche:{name:'Noche de miedo',sky:'noche',pal:['#7c3aed','#f97316','#22c55e','#64748b','#eab308','#dc2626'],mat:'plastico',danger:['Pantano','#14532d','neon'],deco:'lapida',music:'batalla',kw:['noche','oscur','miedo','terror','halloween','cementerio','vampiro','zombi']},
  playa:{name:'Playa',sky:'atardecer',pal:['#f59e0b','#06b6d4','#f472b6','#84cc16','#fde68a','#fb7185'],mat:'arena',danger:['Mar','#0284c7','hielo'],deco:'palmera',music:'fiesta',kw:['playa','verano','tropical','isla','sol','arena','vacaciones']},
  nieve:{name:'Nieve',sky:'nublado',pal:['#e0f2fe','#7dd3fc','#ffffff','#bae6fd','#38bdf8','#c7d2fe'],mat:'hielo',danger:['Agua helada','#0ea5e9','hielo'],deco:'pino',music:'nana',kw:['nieve','hielo','invierno','navidad','polo','frio','congelad','pinguino','helad']},
  desierto:{name:'Desierto',sky:'atardecer',pal:['#d97706','#fbbf24','#b45309','#fde68a','#a16207','#f59e0b'],mat:'arena',danger:['Arenas movedizas','#92400e','arena'],deco:'cactus',music:'aventura',kw:['desierto','piramide','egipto','dunas','cactus','oasis']},
  bosque:{name:'Bosque',sky:'dia',pal:['#4b974b','#7c5c46','#a3e635','#65a30d','#facc15','#16a34a'],mat:'cesped',danger:['Pantano','#365314','neon'],deco:'arbol',music:'lago',kw:['bosque','selva','jungla','naturaleza','arbol','campo','granja']},
  volcan:{name:'Volcán',sky:'atardecer',pal:['#7f1d1d','#ea580c','#facc15','#57534e','#dc2626','#f97316'],mat:'ladrillo',danger:['Lava','#ff4a1c','neon'],deco:'roca',music:'batalla',kw:['volcan','fuego','infierno','magma','dragon']},
  ciudad:{name:'Ciudad neón',sky:'noche',pal:['#22d3ee','#e879f9','#a3e635','#facc15','#f43f5e','#818cf8'],mat:'neon',danger:['Láser','#f43f5e','neon'],deco:'farola',music:'neon',kw:['ciudad','neon','futur','robot','cyber','calle','edificio']},
  dulces:{name:'Mundo de dulces',sky:'dia',pal:['#f9a8d4','#c4b5fd','#fde68a','#a7f3d0','#fca5a5','#93c5fd'],mat:'plastico',danger:['Chocolate','#5b3a1e','plastico'],deco:'piruleta',music:'fiesta',kw:['dulce','caramelo','chuche','golosina','pastel','tarta','chocolate','candy','piruleta']},
  castillo:{name:'Castillo',sky:'nublado',pal:['#78716c','#a8a29e','#b91c1c','#1d4ed8','#ca8a04','#57534e'],mat:'ladrillo',danger:['Foso','#1e3a8a','hielo'],deco:'antorcha',music:'aventura',kw:['castillo','medieval','caballero','rey','princesa','torreon']},
  mar:{name:'Mar pirata',sky:'dia',pal:['#0ea5e9','#7c5c46','#facc15','#ffffff','#0369a1','#e11d48'],mat:'madera',danger:['Mar','#0369a1','hielo'],deco:'barril',music:'aventura',kw:['pirata','mar','oceano','barco','agua','tiburon']}
};
const COLORS={rojo:'#e5484d',azul:'#2563eb',verde:'#22c55e',amarillo:'#facc15',naranja:'#f97316',morado:'#8b5cf6',lila:'#c4b5fd',rosa:'#f472b6',negro:'#1f2937',blanco:'#f8fafc',dorado:'#eab308',plateado:'#cbd5e1',gris:'#9ca3af',marron:'#7c5c46',celeste:'#7dd3fc',turquesa:'#2dd4bf'};

/* ---------- entender el texto ---------- */
const NUMW={dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,quince:15,veinte:20,veinticinco:25,treinta:30,cuarenta:40,cincuenta:50,sesenta:60,setenta:70,ochenta:80,noventa:90,cien:100,ciento:100,mil:1000,un:1,una:1,medio:.5};
function lev(a,b){if(Math.abs(a.length-b.length)>1)return 9;const d=[];for(let i=0;i<=a.length;i++){d[i]=[i];for(let j=1;j<=b.length;j++)d[i][j]=i?Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)):j}return d[a.length][b.length]}
const NEG={enemigo:/sin (enemigos?|monstruos?|zombis?|bolas?|malos?)/,monedas:/sin (monedas?|gemas?|estrellas?)/,trampolin:/sin trampolin/,movil:/sin plataformas? movil/,fantasma:/sin (bloques? )?fantasma/,barra:/sin barras?/,lava:/sin (lava|peligro|caer|agua)/};
const PRIMARY={obby:/\b(obby|parkour|parkur|obi)\b/,laberinto:/laberint/,torre:/\btorre\b/,carrera:/\bcarrera\b/,jefe:/\b(jefe|boss)\b/,tycoon:/\b(tycoon|taicun|tycon)\b/,rescate:/rescat/,batalla:/\b(batalla|guerra)\b/,supervivencia:/(supervivencia|sobrevivir)/,esquivar:/\besquiva/,monedas:/(recoger|caza de|coger|buscar) [0-9 ]*(monedas|gemas|tesoros|diamantes)/};
function primary(t){let best=null,at=1e9;for(const k in PRIMARY){const m=t.match(PRIMARY[k]);if(m&&m.index<at){at=m.index;best=k}}return best}
const NAMERE=/(?:llamad[oa]|que se llame|titulo|nombre)\s*[:"“«']?\s*([^"”»'.,\n]{2,28})/i;
function prep(text){let t=norm(String(text||'').replace(NAMERE,' ')).replace(/[¡!¿?,.;:]/g,' ');
  t=t.replace(/\b(un|una)\s+(minuto)/g,'1 $2').replace(/\bmedio minuto\b/g,'30 segundos');
  t=t.replace(/\b([a-z]+)\b/g,(w)=>NUMW[w]!=null&&!/^(un|una|medio|mil)$/.test(w)?String(NUMW[w]):w);
  return t.replace(/\s+/g,' ').trim()}
function parse(text){const raw=prep(text),o={text:String(text||'').trim(),extras:{},no:{},found:{}};
  // lo que va detrás de "sin" no cuenta como algo que quieres
  for(const k in NEG)if(NEG[k].test(raw))o.no[k]=true;const t=raw.replace(/\bsin [a-z]+( [a-z]+)?/g,' ');
  const words=t.split(' ').filter(w=>w.length>=4);
  const score=kw=>kw.reduce((n,k)=>n+(t.indexOf(k)>=0?1:(k.length>=5&&k.indexOf(' ')<0&&words.some(w=>lev(w,k)<=1||(k.length>=6&&w.length>=6&&w.slice(0,6)===k.slice(0,6))))?1:0),0);
  let best=null,bs=0;for(const k in TYPES){const s=score(TYPES[k].kw);if(s>bs){bs=s;best=k}}
  const pr=primary(t);if(pr)best=pr;
  o.type=best||'obby';o.found.type=!!best;
  let th='normal',ts=0;for(const k in THEMES){const s=score(THEMES[k].kw);if(s>ts){ts=s;th=k}}o.theme=th;o.found.theme=ts>0;
  o.found.dif=/(dificil|imposible|extrem|complicad|duro|reto|facil|sencill|bebe|tranquil|para ninos|para peques|relajad|hardcore)/.test(t);
  o.found.size=/(corto|pequen|mini|rapidito|breve|largo|grande|enorme|gigante|inmens|mucho|muchas|muchos|eterno)/.test(t);
  o.dif=/(muy dificil|imposible|extrem|dificilisim|pro\b|hardcore)/.test(t)?3:/(dificil|complicad|duro|reto)/.test(t)?3:/(facil|sencill|bebe|tranquil|para ninos|para peques|relajad)/.test(t)?1:2;
  if(/imposible|extrem/.test(t))o.extreme=true;
  o.size=/(corto|pequen|mini|rapidito|breve)/.test(t)?1:/(largo|grande|enorme|gigante|inmens|mucho|muchas|muchos|eterno)/.test(t)?3:2;
  const num=(re)=>{const m=t.match(re);return m?Math.max(1,Math.min(200,parseInt(m[1],10))):null};
  o.coins=num(/(\d+)\s*(monedas|gemas|estrellas|diamantes|tesoros)/);
  o.enemies=num(/(\d+)\s*(enemigos|zombis|zombies|monstruos|fantasmas|rivales|bolas|robots)/);
  o.lives=num(/(\d+)\s*vidas?/);
  const secs=num(/(\d+)\s*(segundos|seg\b|s\b)/),mins=num(/(\d+)\s*minutos?/);o.time=secs||(mins?mins*60:null);
  o.count=num(/(\d+)\s*(plataformas|saltos|niveles|fases|pisos|meteoritos)/);o.rescue=num(/(\d+)\s*(gatitos?|gatos|perritos?|perros|amigos|pollitos|mascotas|aliens|pinguinos|animales|personas|ninos)/);
  const ex=o.extras;
  if(/trampolin|muelle|rebota/.test(t))ex.trampolin=true;
  if(/(movil|moviles|se mueven|que se mueve|ascensor)/.test(t))ex.movil=true;
  if(/(fantasma|desaparec|invisible)/.test(t)&&o.type!=='supervivencia')ex.fantasma=true;
  if(/(gira|giratori|barra|aspas|molino)/.test(t))ex.barra=true;
  if(/(enemigo|perseg|monstruo|bola|zombi|ladron|guardian|malo)/.test(t)&&o.type!=='supervivencia'&&o.type!=='batalla')ex.enemigo=true;
  if(/(moneda|gema|estrella|diamante|tesoro)/.test(t)&&o.type!=='monedas')ex.monedas=true;
  if(/(sin puntos de control|sin checkpoint)/.test(t))ex.nocheck=true;
  if(/(gravedad baja|poca gravedad|flotar|flota|lunar)/.test(t))o.lowgrav=true;
  if(/(super ?salto|saltar mucho|salto alto)/.test(t))o.bigjump=true;
  if(/(muy rapido|super ?veloc|velocidad alta)/.test(t))o.fast=true;
  if(/(contrarreloj|tiempo limite|con tiempo|cuenta atras)/.test(t)&&!o.time)o.time=Math.round([0,90,60,40][o.dif]*(o.size/2));
  const MUS={fiesta:/(musica|cancion)[a-z ]*(fiesta|alegre|baile)/,batalla:/(musica|cancion)[a-z ]*(batalla|accion|epica|tension)/,nana:/(musica|cancion)[a-z ]*(tranquil|relaj|dormir|suave)/,neon:/(musica|cancion)[a-z ]*(electronic|neon|robot|futur)/,aventura:/(musica|cancion)[a-z ]*aventura/,lago:/(musica|cancion)[a-z ]*(lago|agua|mar)/,ninguna:/sin (musica|sonido)/};
  for(const m in MUS)if(MUS[m].test(raw)){o.music=m;break}
  for(const k in o.no)if(k!=='lava')o.extras[k]=false;if(o.no.lava)o.nolava=true;
  for(const c in COLORS){if(new RegExp('\\b'+c+'(s|a|as|o|os|es)?\\b').test(t)){o.color=COLORS[c];o.colorName=c;break}}
  const nm=String(text||'').match(NAMERE);if(nm)o.name=nm[1].trim();
  return o}

/* ---------- piezas ---------- */
function kit(o,r){const T=THEMES[o.theme]||THEMES.normal;const pal=o.color?[o.color].concat(T.pal):T.pal;
  const pc=i=>pal[i%pal.length],out=[];
  const B=(name,pos,size,color,ex)=>{const x=obj('bloque',name,pos.map(R1),size.map(R1),color,Object.assign({mat:T.mat},ex||{}));out.push(x);return x};
  const msg=(s,t)=>bk('gm_msg',{s,t:t||2.5});
  const forever=(...b)=>bk('ct_forever',{},b);
  const danger=(pos,size)=>{const d=obj('bloque',T.danger[0],pos.map(R1),size.map(R1),T.danger[1],{mat:T.danger[2],scripts:[st(30,40,bk('ev_touch'),bk('pl_kill'))]});out.push(d);return d};
  const check=(n,pos,size)=>{const c=obj('bloque','Punto de control '+n,pos.map(R1),size||[6,1,6],'#21c4b0',{mat:'neon',scripts:[st(30,40,bk('ev_touch'),bk('pl_check'),bk('sn_play',{s:'levelup'}),msg('¡Punto de control '+n+'!',1.5))]});out.push(c);return c};
  const meta=(pos,size)=>{const m=obj('bloque','Meta',pos.map(R1),size||[8,1,8],'#3fbf6a',{mat:'neon',scripts:[st(30,40,bk('ev_start'),bk('lk_say',{s:'META'})),st(30,170,bk('ev_touch'),bk('gm_win'))]});out.push(m);return m};
  const coin=(pos)=>{const c=obj('cilindro','Moneda',pos.map(R1),[2,.5,2],'#f5cd30',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_spin',{g:360,t:2}))),st(30,200,bk('ev_touch'),bk('vr_add',{n:1,v:'puntos'}),bk('sn_play',{s:'coin'}),bk('gm_destroy'))]});out.push(c);return c};
  const movil=(name,pos,size,dx,dz,dy,t,color)=>{const m=obj('bloque',name,pos.map(R1),size.map(R1),color,{mat:T.mat,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_move',{x:dx,y:dy||0,z:dz,t}),bk('ct_wait',{t:.5}),bk('mv_move',{x:-dx,y:-(dy||0),z:-dz,t}),bk('ct_wait',{t:.5})))]});out.push(m);return m};
  const ghost=(name,pos,size,delay,color)=>{const g=obj('bloque',name,pos.map(R1),size.map(R1),color||'#9966ff',{scripts:[st(30,40,bk('ev_start'),bk('ct_wait',{t:delay}),forever(bk('ct_wait',{t:1.8}),bk('lk_transp',{n:80}),bk('lk_solid',{m:'no'}),bk('ct_wait',{t:1.4}),bk('lk_transp',{n:0}),bk('lk_solid',{m:'si'})))]});out.push(g);return g};
  const tramp=(pos,force)=>{const t=obj('cilindro','Trampolín',pos.map(R1),[5,1,5],'#00a2ff',{scripts:[st(30,40,bk('ev_touch'),bk('pl_launch',{n:force||52}),bk('sn_play',{s:'boing'}))]});out.push(t);return t};
  const bar=(pos,len,t)=>{const b=obj('bloque','Barra giratoria',pos.map(R1),[len,1,1],'#c4281c',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_spin',{g:360,t}))),st(30,200,bk('ev_touch'),bk('pl_launch',{n:24}),bk('sn_play',{s:'hit'}),msg('¡ZAS!',1))]});out.push(b);return b};
  const chaser=(name,pos,v,delay,shape,color,onTouch)=>{const p=shape==='persona';const c=obj(shape||'esfera',name,pos.map(R1),p?[3,5,1.5]:[3,3,3],color||'#c4281c',{collide:false,scripts:[
      st(30,40,bk('ev_start'),bk('ct_wait',{t:delay}),forever(bk('mv_chase',{t:1,v}))),st(30,240,bk('ev_touch'),...(onTouch||[bk('pl_kill')]))]});out.push(c);return c};
  const sign=(pos,text)=>{const s=obj('bloque','Cartel',pos.map(R1),[10,3,.6],'#7c5c46',{mat:'madera',scripts:[st(30,40,bk('ev_start'),bk('lk_say',{s:text}))]});out.push(s);return s};
  const deco=(x,z,h)=>{const k=T.deco,y0=h||0;
    if(k==='arbol'||k==='pino'||k==='palmera'){const tall=k==='palmera'?8:6;out.push(obj('cilindro','Tronco',[x,y0+tall/2,z].map(R1),[1.2,tall,1.2],'#7c5c46',{mat:'madera'}));
      out.push(obj(k==='pino'?'cilindro':'esfera',k==='pino'?'Pino':'Copa',[x,y0+tall+1.5,z].map(R1),k==='pino'?[4,5,4]:[6,4,6],k==='pino'?'#166534':k==='palmera'?'#65a30d':'#4b974b',{mat:'cesped'}))}
    else if(k==='cactus'){out.push(obj('cilindro','Cactus',[x,y0+3,z].map(R1),[1.6,6,1.6],'#4d7c0f',{mat:'cesped'}));out.push(obj('cilindro','Brazo',[x+1.4,y0+3.5,z].map(R1),[1,2.5,1],'#4d7c0f',{mat:'cesped'}))}
    else if(k==='cristal')out.push(obj('cuna','Cristal',[x,y0+2,z].map(R1),[2.5,4,2.5],pc(Math.floor(r()*6)),{mat:'neon',rot:Math.floor(r()*4)*90}));
    else if(k==='lapida')out.push(obj('bloque','Lápida',[x,y0+1.2,z].map(R1),[2,2.4,.6],'#64748b',{mat:'metal'}));
    else if(k==='roca')out.push(obj('esfera','Roca',[x,y0+1,z].map(R1),[3,2,3],'#57534e',{mat:'metal'}));
    else if(k==='farola'){out.push(obj('cilindro','Farola',[x,y0+3,z].map(R1),[.5,6,.5],'#334155',{mat:'metal'}));out.push(obj('esfera','Luz',[x,y0+6.3,z].map(R1),[1.2,1.2,1.2],pc(0),{mat:'neon'}))}
    else if(k==='piruleta'){out.push(obj('cilindro','Palo',[x,y0+2.5,z].map(R1),[.4,5,.4],'#ffffff'));out.push(obj('cilindro','Piruleta',[x,y0+5.5,z].map(R1),[3,.6,3],pc(Math.floor(r()*6)),{rot:0}))}
    else if(k==='antorcha'){out.push(obj('cilindro','Antorcha',[x,y0+1.5,z].map(R1),[.5,3,.5],'#7c5c46',{mat:'madera'}));out.push(obj('esfera','Fuego',[x,y0+3.3,z].map(R1),[1,1.2,1],'#f97316',{mat:'neon',collide:false}))}
    else if(k==='barril')out.push(obj('cilindro','Barril',[x,y0+1.2,z].map(R1),[2,2.4,2],'#7c5c46',{mat:'madera'}))};
  return {T,pal,pc,out,B,msg,forever,danger,check,meta,coin,movil,ghost,tramp,bar,chaser,sign,deco}}

/* ---------- constructores ---------- */
const DIF=['','fácil','normal','difícil'],SIZE=['','corto','normal','largo'];
const pl=(n,a,b)=>n+' '+(n===1?a:b);
const BUILD={};

BUILD.obby=function(o,r,K,g,S){const d=o.dif,n=o.count||[0,10,16,26][o.size]+(d===3?4:0),gap=[0,5,6.5,8][d]+(o.extreme?1:0),ps=[0,6.5,5,4][d]-(o.extreme?.6:0),rise=[0,.5,.9,1.3][d];
  K.out.push(obj('spawn','Salida',[0,.5,0],[6,1,6],'#a3a2a5'));K.sign([-10,3,4],o.signText||'¡Llega a la meta!');
  let x=0,y=.5,z=0,i=0,cps=1,cnt={movil:0,fantasma:0,trampolin:0,barra:0,moneda:0,control:0};const want=K=>o.extras[K]||(K==='movil'&&d>=2)||(K==='fantasma'&&d>=2)||(K==='barra'&&d>=3);
  const every=Math.max(4,Math.round(n/[0,3,4,5][o.size]));
  while(i<n){i++;const kind=r();z+=gap+ps*.5+r()*1.5;x=Math.max(-14,Math.min(14,x+(r()-.5)*2*[0,3,5,7][d]));
    if(i>2&&i%every===0&&!o.extras.nocheck){y+=rise;K.check(++cps,[x,y,z],[7,1,7]);cnt.control++;continue}
    if(want('movil')&&kind<.18&&i>2){y+=rise*.5;const dx=(r()<.5?1:-1)*[0,6,9,12][d];K.movil('Plataforma móvil '+(++cnt.movil),[x-dx/2,y,z],[ps+1,1,ps+1],dx,0,0,[0,3,2.4,1.8][d],K.pc(2));continue}
    if(want('fantasma')&&kind>=.18&&kind<.32&&i>2){y+=rise;K.ghost('Bloque fantasma '+(++cnt.fantasma),[x,y,z],[ps,1,ps],(cnt.fantasma%3)*.8);continue}
    if(want('trampolin')&&kind>=.32&&kind<.42&&i>3&&i<n-2){K.tramp([x,y+.2,z]);cnt.trampolin++;y+=8+r()*3;z+=6;K.B('Plataforma alta',[x,y,z],[7,1,7],K.pc(3));continue}
    if(want('barra')&&kind>=.42&&kind<.5&&i>3){y+=rise;K.B('Plaza',[x,y,z],[12,1,12],K.pc(4));K.bar([x,y+1.4,z],10,[0,4,3,2.2][d]);cnt.barra++;z+=4;continue}
    y+=rise*(.6+r()*.8);K.B('Plataforma '+i,[x,y,z],[ps,1,ps],K.pc(i));
    if(o.extras.monedas&&(o.coins?cnt.moneda<o.coins&&r()<Math.max(.45,o.coins/n*1.3):r()<.45)){K.coin([x,y+2.2,z]);cnt.moneda++}}
  z+=gap+4;y+=rise;K.meta([x,y,z],[9,1,9]);
  if(o.extras.enemigo){for(let k=0;k<Math.max(1,o.enemies||d);k++)K.chaser('Bola perseguidora '+(k+1),[(k%2?8:-8),y+2,z*(.4+.2*k)],[0,4,6,8][d],6+k*4)}
  K.danger([0,.1,z/2],[64,1,z+50]);
  g.vars=['puntos'];g.scripts=[st(30,40,bk('ev_start'),bk('gm_timer',{m:'start'}),...(cnt.moneda?[bk('vr_show',{v:'puntos'})]:[]),K.msg('¡Llega a la meta sin caer!',3),bk('sn_music',{m:K.T.music}))];
  S.push(`${n} saltos hasta la meta`+(o.nolava?'':`, con ${K.T.danger[0].toLowerCase()} debajo`));
  const L=[];if(cnt.movil)L.push(pl(cnt.movil,'plataforma móvil','plataformas móviles'));if(cnt.fantasma)L.push(pl(cnt.fantasma,'bloque fantasma','bloques fantasma'));if(cnt.trampolin)L.push(pl(cnt.trampolin,'trampolín','trampolines'));if(cnt.barra)L.push(pl(cnt.barra,'barra giratoria','barras giratorias'));if(cnt.control)L.push(pl(cnt.control,'punto de control','puntos de control'));if(cnt.moneda)L.push(pl(cnt.moneda,'moneda','monedas'));
  if(L.length)S.push(L.join(', '));if(o.extras.enemigo)S.push('Bolas que te persiguen');g.desc=g.desc||'Salta de plataforma en plataforma hasta la meta. Si caes, vuelves al último punto de control.'};

BUILD.carrera=function(o,r,K,g,S){o.extras.movil=o.extras.movil||false;const len=[0,120,200,320][o.size],w=[0,16,12,9][o.dif];
  K.out.push(obj('spawn','Salida',[0,.5,0],[6,1,6],'#a3a2a5'));K.sign([-10,3,4],'¡Corre hasta la meta!');
  let z=6,seg=0,obs=0;while(z<len){seg++;const l=18+r()*10;K.B('Pista '+seg,[0,.5,z+l/2],[w,1,l],K.pc(seg));
    const nob=[0,1,2,3][o.dif];for(let k=0;k<nob;k++){const oz=z+4+r()*(l-8),ox=(r()-.5)*(w-4);obs++;
      if(r()<.5)K.B('Obstáculo '+obs,[ox,2,oz],[3,3,3],K.pc(seg+2));else K.movil('Muro móvil '+obs,[-(w/2)+2,2,oz],[3,3,1],w-4,0,0,[0,2.2,1.6,1.1][o.dif],K.pc(seg+3))}
    z+=l;const gap=[0,0,3,5][o.dif]*(r()<.5?1:0);z+=gap}
  if(o.extras.trampolin){K.tramp([0,1.2,z+2],40);z+=12}
  K.meta([0,.5,z+5],[w,1,8]);K.danger([0,.1,z/2],[w+40,1,z+40]);
  const goal=Math.round(len/[0,5,7,9][o.dif]);g.speed=o.fast?30:22;g.vars=['puntos'];
  g.scripts=[st(30,40,bk('ev_start'),bk('gm_timer',{m:'start'}),K.msg(`¡Llega en menos de ${goal} segundos!`,3),bk('sn_music',{m:'fiesta'})),st(30,300,bk('ev_start'),bk('ct_until',{a:'@crono',o:'>',b:goal}),bk('gm_lose'))];
  S.push(`Pista de ${Math.round(z)} metros con ${obs} obstáculos`,`Tiempo límite: ${goal} segundos`);g.desc='Corre por la pista esquivando obstáculos y llega a la meta antes de que se acabe el tiempo.'};

BUILD.monedas=function(o,r,K,g,S){const N=o.coins||[0,10,15,25][o.size],R=[0,24,32,44][o.size],T=o.time||Math.round(N*[0,8,5,3.6][o.dif]+15);
  K.out.push(obj('spawn','Salida',[0,.5,0],[6,1,6],'#a3a2a5'));K.sign([-10,3,4],`¡Recoge las ${N} monedas!`);
  let up=0;for(let i=0;i<N;i++){const a=r()*Math.PI*2,d=8+r()*R,x=Math.cos(a)*d,z=Math.sin(a)*d;
    if(o.dif>=2&&r()<.35){const h=2+Math.floor(r()*3);K.B('Columna',[x,h/2,z],[4,h,4],K.pc(i));K.coin([x,h+2,z]);up++}else K.coin([x,2.5,z])}
  for(let i=0;i<8+o.size*4;i++){const a=r()*Math.PI*2,d=10+r()*(R+8);K.deco(Math.cos(a)*d,Math.sin(a)*d)}
  const ne=o.enemies||(o.extras.enemigo?o.dif:o.dif===3?2:0);for(let k=0;k<ne;k++)K.chaser('Guardián '+(k+1),[(k%2?1:-1)*(R*.6),2,(k%3-1)*R*.5],[0,4,5.5,7][o.dif],4+k*3);
  if(o.extras.trampolin)K.tramp([R*.4,.6,0],45);
  g.vars=['puntos'];g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'puntos'}),bk('gm_timer',{m:'start'}),K.msg(`¡Recoge ${N} monedas en ${T} segundos!`,3),bk('sn_music',{m:'fiesta'}),bk('ct_until',{a:'puntos',o:'=',b:N}),bk('gm_win')),
    st(30,330,bk('ev_start'),bk('ct_until',{a:'@crono',o:'>',b:T}),bk('gm_lose'))];
  S.push(`${N} monedas repartidas${up?` (${up} en lo alto de columnas)`:''}`,`Tiempo: ${T} segundos`);if(ne)S.push(`${ne} guardianes que te persiguen`);g.desc=`Recoge las ${N} monedas antes de que pasen ${T} segundos.`};

BUILD.supervivencia=function(o,r,K,g,S){const A=[0,26,32,40][o.size],NE=o.enemies||[0,3,5,8][o.dif]+(o.size-2),T=o.time||[0,45,60,90][o.size],V=o.lives||[0,5,3,2][o.dif];
  const zomb=/zombi|zombie/.test(norm(o.text))||o.theme==='noche';const enemyName=zomb?'Zombi':'Monstruo';
  K.out.push(obj('spawn','Salida',[0,.5,0],[6,1,6],'#a3a2a5'));
  [[0,A,2*A+2,1],[0,-A,2*A+2,1],[A,0,1,2*A],[-A,0,1,2*A]].forEach(([x,z,w,dd],i)=>K.B('Muro '+(i+1),[x,2.5,z],[w,5,dd],K.pc(5),{mat:'ladrillo'}));
  for(let i=0;i<6+o.size*3;i++){const x=(r()-.5)*(A*1.6),z=(r()-.5)*(A*1.6);if(Math.abs(x)<6&&Math.abs(z)<6)continue;const h=1.5+r()*3;K.B('Obstáculo',[x,h/2,z],[3+r()*4,h,3+r()*4],K.pc(i))}
  for(let i=0;i<6;i++)K.deco((r()-.5)*A*1.7,(r()-.5)*A*1.7);
  for(let k=0;k<NE;k++){const a=k/NE*Math.PI*2;K.chaser(enemyName+' '+(k+1),[Math.cos(a)*A*.75,2.5,Math.sin(a)*A*.75],[0,3.5,5,6.5][o.dif]+(k%3)*.5,2+k*2.5,'persona',zomb?'#4d7c0f':K.pc(k),
    [bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'hit'}),K.msg('¡Te han pillado!',1.2),bk('mv_random',{r:A*.6})])}
  if(o.extras.monedas)for(let i=0;i<8;i++)K.coin([(r()-.5)*A*1.6,2.5,(r()-.5)*A*1.6]);
  g.vars=['puntos','vidas'];g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'vidas',n:V}),bk('vr_show',{v:'vidas'}),bk('gm_timer',{m:'start'}),K.msg(`¡Aguanta ${T} segundos sin que te pillen!`,3),bk('sn_music',{m:'batalla'})),
    st(30,300,bk('ev_start'),bk('ct_until',{a:'vidas',o:'<',b:1}),bk('gm_lose')),st(30,420,bk('ev_start'),bk('ct_until',{a:'@crono',o:'≥',b:T}),bk('gm_win'))];
  S.push(`${NE} ${zomb?'zombis':'monstruos'} que te persiguen`,`Tienes ${V} vidas y debes aguantar ${T} segundos`);g.desc=`Corre y esquiva a los ${zomb?'zombis':'monstruos'} durante ${T} segundos. Si te tocan, pierdes una vida.`};

BUILD.laberinto=function(o,r,K,g,S){const W=[0,7,10,14][o.size]+(o.dif-2),Hh=W,C=7,WH=[0,4,5,7][o.dif];
  const vis=Array.from({length:W},()=>Array(Hh).fill(false)),wall={};const key=(x,z,d)=>x+','+z+','+d;
  for(let x=0;x<W;x++)for(let z=0;z<Hh;z++){wall[key(x,z,'E')]=true;wall[key(x,z,'S')]=true}
  const stack=[[0,0]];vis[0][0]=true;while(stack.length){const[cx,cz]=stack[stack.length-1];const nb=[[1,0,'E'],[-1,0,'W'],[0,1,'S'],[0,-1,'N']].map(([dx,dz,d])=>[cx+dx,cz+dz,d]).filter(([x,z])=>x>=0&&z>=0&&x<W&&z<Hh&&!vis[x][z]);
    if(!nb.length){stack.pop();continue}const[nx,nz,d]=nb[Math.floor(r()*nb.length)];
    if(d==='E')wall[key(cx,cz,'E')]=false;if(d==='W')wall[key(nx,nz,'E')]=false;if(d==='S')wall[key(cx,cz,'S')]=false;if(d==='N')wall[key(nx,nz,'S')]=false;vis[nx][nz]=true;stack.push([nx,nz])}
  const ox=-C/2,oz=-C/2,col=K.pc(0),col2=K.pc(1);let nw=0;
  const seg=(x,z,w,d)=>{nw++;K.B('Muro',[x,WH/2,z],[w,WH,d],nw%2?col:col2)};
  for(let x=0;x<W;x++){seg(ox+x*C+C/2,oz,C+1,1)}for(let z=0;z<Hh;z++){seg(ox,oz+z*C+C/2,1,C+1)}
  for(let x=0;x<W;x++)for(let z=0;z<Hh;z++){if(wall[key(x,z,'E')]&&!(x===W-1&&z===Hh-1))seg(ox+(x+1)*C,oz+z*C+C/2,1,C+1);if(wall[key(x,z,'S')])seg(ox+x*C+C/2,oz+(z+1)*C,C+1,1)}
  K.out.push(obj('spawn','Salida',[0,.5,0],[4,1,4],'#a3a2a5'));
  K.meta([ox+(W-1)*C+C/2,.5,oz+(Hh-1)*C+C/2],[C-2,1,C-2]);
  let nc=0;if(o.extras.monedas||o.coins){const want=o.coins||8;for(let i=0;i<want;i++){K.coin([ox+Math.floor(r()*W)*C+C/2,2.2,oz+Math.floor(r()*Hh)*C+C/2]);nc++}}
  const ne=o.extras.enemigo===false?0:o.enemies||(o.extras.enemigo||o.dif===3?Math.max(1,o.dif-1):0);for(let k=0;k<ne;k++)K.chaser('Guardián '+(k+1),[ox+(W-1-k)*C+C/2,1.5,oz+C/2],[0,3,4,5][o.dif],8+k*5);
  g.base=true;g.vars=['puntos'];const T=o.time;
  g.scripts=[st(30,40,bk('ev_start'),bk('gm_timer',{m:'start'}),...(nc?[bk('vr_show',{v:'puntos'})]:[]),K.msg('¡Encuentra la salida del laberinto!',3),bk('sn_music',{m:'neon'}))];
  if(T)g.scripts.push(st(30,300,bk('ev_start'),bk('ct_until',{a:'@crono',o:'>',b:T}),bk('gm_lose')));
  S.push(`Laberinto de ${W}×${Hh} casillas con paredes de ${WH} m (no se pueden saltar${WH<5?' fácilmente':''})`,'La meta está en la esquina contraria');if(ne)S.push(`${ne} guardianes vigilando`);if(nc)S.push(`${nc} monedas escondidas`);if(T)S.push(`Tiempo límite: ${T} s`);
  g.jump=WH>=5?16:22;g.desc='Busca el camino hasta la meta, en la esquina contraria del laberinto.'};

BUILD.esquivar=function(o,r,K,g,S){const A=[0,16,20,26][o.size],N=o.count||o.enemies||[0,6,10,16][o.dif]+o.size*2,T=o.time||[0,40,60,90][o.size],V=o.lives||[0,5,3,2][o.dif],fall=[0,2.4,1.7,1.2][o.dif];
  const word=/bomba/.test(norm(o.text))?'Bomba':/granizo|nieve/.test(norm(o.text))||o.theme==='nieve'?'Bola de nieve':'Meteorito';
  g.base=false;K.out.push(obj('spawn','Salida',[0,1.5,0],[6,1,6],'#a3a2a5'));K.B('Arena',[0,.5,0],[A*2,1,A*2],K.pc(0));K.danger([0,-1,0],[A*2+80,1,A*2+80]);
  for(let k=0;k<N;k++){const x=(r()-.5)*A*1.6,z=(r()-.5)*A*1.6;K.out.push(obj('esfera',word+' '+(k+1),[R1(x),40,R1(z)],[2.6,2.6,2.6],word==='Bola de nieve'?'#e0f2fe':'#7c2d12',{mat:word==='Bola de nieve'?'hielo':'neon',collide:false,scripts:[
      st(30,40,bk('ev_start'),bk('ct_wait',{t:R1(1+k*.4)}),bk('ct_forever',{},[bk('ct_waitrand',{a:.3,b:2.5}),bk('mv_random',{r:Math.round(A*.7)}),bk('mv_move',{x:0,y:-39,z:0,t:fall}),bk('sn_play',{s:'boom'}),bk('mv_back',{t:0})])),
      st(30,260,bk('ev_touch'),bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'hit'}),K.msg('¡Ay!',1),bk('mv_back',{t:0}))]}))}
  if(o.extras.monedas)for(let i=0;i<10;i++)K.coin([(r()-.5)*A*1.6,2.5,(r()-.5)*A*1.6]);
  g.vars=['puntos','vidas'];g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'vidas',n:V}),bk('vr_show',{v:'vidas'}),bk('gm_timer',{m:'start'}),K.msg(`¡Esquiva lo que cae durante ${T} segundos!`,3),bk('sn_music',{m:'batalla'})),
    st(30,300,bk('ev_start'),bk('ct_until',{a:'vidas',o:'<',b:1}),bk('gm_lose')),st(30,420,bk('ev_start'),bk('ct_until',{a:'@crono',o:'≥',b:T}),bk('gm_win'))];
  S.push(`${N} ${word.toLowerCase()}s cayendo del cielo sobre una arena de ${A*2}×${A*2} m`,`${V} vidas, aguanta ${T} segundos`);g.desc=`Muévete por la arena y esquiva los ${word.toLowerCase()}s que caen. Aguanta ${T} segundos.`};

BUILD.torre=function(o,r,K,g,S){const n=o.count||[0,18,30,46][o.size],rad=[0,8,9,10][o.dif],rise=[0,1.8,2.4,3][o.dif],ps=[0,6,5,4][o.dif],step=[0,.5,.6,.7][o.dif];
  K.out.push(obj('spawn','Salida',[rad+4,.5,0],[6,1,6],'#a3a2a5'));
  K.B('Torre',[0,(n*rise+6)/2,0],[rad*.9,n*rise+6,rad*.9],K.pc(5),{mat:K.T.mat==='neon'?'metal':'ladrillo'});
  let a=0,y=.5,cps=1,cnt={m:0,f:0};const every=Math.max(6,Math.round(n/5));
  for(let i=1;i<=n;i++){a+=step;y+=rise;const x=Math.cos(a)*rad*1.25,z=Math.sin(a)*rad*1.25;
    if(i%every===0&&i<n&&!o.extras.nocheck){K.check(++cps,[x,y,z],[ps+1,1,ps+1]);continue}
    if((o.extras.fantasma||o.dif===3)&&r()<.15){K.ghost('Escalón fantasma '+(++cnt.f),[x,y,z],[ps,1,ps],(cnt.f%3)*.7,K.pc(4));continue}
    if((o.extras.movil||o.dif>=2)&&r()<.12){K.movil('Escalón móvil '+(++cnt.m),[x,y,z],[ps,1,ps],0,0,2.5,[0,2.6,2,1.6][o.dif],K.pc(2));continue}
    K.B('Escalón '+i,[x,y,z],[ps,1,ps],K.pc(i));if(o.extras.monedas&&r()<.3)K.coin([x,y+2,z])}
  K.meta([0,n*rise+6.6,0],[rad*.9,1,rad*.9]);K.B('Puente final',[Math.cos(a)*rad*.8,y+rise,Math.sin(a)*rad*.8],[ps,1,ps],K.pc(1));
  K.danger([0,.2,0],[90,1,90]);for(let i=0;i<8;i++){const b=r()*Math.PI*2;K.deco(Math.cos(b)*(rad+22+r()*12),Math.sin(b)*(rad+22+r()*12))}
  g.vars=['puntos'];g.scripts=[st(30,40,bk('ev_start'),bk('gm_timer',{m:'start'}),K.msg('¡Sube hasta lo más alto de la torre!',3),bk('sn_music',{m:K.T.music}))];
  S.push(`Torre de ${Math.round(n*rise+6)} metros con ${n} escalones en espiral`);const L=[];if(cnt.m)L.push(pl(cnt.m,'escalón móvil','escalones móviles'));if(cnt.f)L.push(pl(cnt.f,'escalón fantasma','escalones fantasma'));if(cps>1)L.push(pl(cps-1,'punto de control','puntos de control'));if(L.length)S.push(L.join(', '));
  g.desc='Sube la torre saltando de escalón en escalón. La meta está arriba del todo.'};

BUILD.batalla=function(o,r,K,g,S){const A=[0,26,32,40][o.size],NE=o.enemies||[0,3,4,6][o.dif],GOAL=o.coins||[0,8,12,18][o.dif]+o.size*2,V=o.lives||[0,5,3,2][o.dif];
  const globos=/globo|agua/.test(norm(o.text)),shot=globos?'#00a2ff':K.pc(0);
  K.out.push(obj('spawn','Salida',[0,.5,0],[6,1,6],'#a3a2a5'));
  [[0,A,2*A,1],[0,-A,2*A,1],[A,0,1,2*A],[-A,0,1,2*A]].forEach(([x,z,w,dd],i)=>K.B('Muro '+(i+1),[x,2,z],[w,4,dd],K.pc(5),{mat:'ladrillo'}));
  for(let i=0;i<5+o.size*2;i++){const x=(r()-.5)*A*1.5,z=(r()-.5)*A*1.5;if(Math.abs(x)<6&&Math.abs(z)<6)continue;K.B('Caja',[x,1.5,z],[3,3,3],'#7c5c46',{mat:'madera'})}
  for(let k=0;k<NE;k++){const a=k/NE*Math.PI*2;K.out.push(obj('persona','Rival '+(k+1),[R1(Math.cos(a)*A*.7),2.5,R1(Math.sin(a)*A*.7)],[3,5,1.5],K.pc(k+1),{collide:false,scripts:[
      st(30,40,bk('ev_start'),bk('ct_wait',{t:3+k}),bk('ct_forever',{},[bk('mv_chase',{t:1.2,v:[0,3.5,4.5,6][o.dif]})])),
      st(30,250,bk('ev_hit'),bk('vr_add',{n:1,v:'puntos'}),bk('sn_play',{s:'pop'}),bk('lk_say',{s:globos?'¡Me has mojado!':'¡Ay!'}),bk('mv_random',{r:Math.round(A*.6)}),bk('ct_wait',{t:1}),bk('lk_say',{s:''})),
      st(30,470,bk('ev_touch'),bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'hit'}),K.msg('¡Te han dado!',1.2),bk('mv_random',{r:Math.round(A*.7)}))]}))}
  g.vars=['puntos','vidas'];g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'vidas',n:V}),bk('vr_show',{v:'puntos'}),bk('vr_show',{v:'vidas'}),K.msg(`Pulsa E para lanzar. ¡Acierta ${GOAL} veces!`,3.5),bk('sn_music',{m:'batalla'})),
    st(30,300,bk('ev_key',{k:'e'}),bk('pl_shoot',{c:shot,v:34})),
    st(30,420,bk('ev_start'),bk('ct_until',{a:'vidas',o:'<',b:1}),bk('gm_lose')),st(30,540,bk('ev_start'),bk('ct_until',{a:'puntos',o:'≥',b:GOAL}),bk('gm_win'))];
  S.push(`${NE} rivales en una arena con cajas para cubrirte`,`Pulsa E (o el botón) para lanzar ${globos?'globos de agua':'proyectiles'}: gana con ${GOAL} aciertos`,`${V} vidas`);
  g.desc=`Lanza ${globos?'globos':'proyectiles'} con la tecla E. Acierta ${GOAL} veces a los rivales antes de que te quiten las ${V} vidas.`};

BUILD.jefe=function(o,r,K,g,S){const A=[0,28,34,42][o.size],HP=o.count||[0,8,15,25][o.dif]+o.size*3,V=o.lives||[0,6,4,3][o.dif],t=norm(o.text);
  const kind=/dragon/.test(t)||o.theme==='volcan'?'Dragón':/robot/.test(t)||o.theme==='ciudad'||o.theme==='espacio'?'Robot gigante':o.theme==='noche'?'Rey de los zombis':o.theme==='mar'?'Capitán Pulpo':o.theme==='nieve'?'Yeti':o.theme==='dulces'?'Monstruo de gominola':'Rey Moco';
  const col=kind==='Dragón'?'#b91c1c':kind==='Robot gigante'?'#64748b':kind==='Rey de los zombis'?'#4d7c0f':kind==='Yeti'?'#e0f2fe':kind==='Monstruo de gominola'?'#f472b6':kind==='Capitán Pulpo'?'#7c3aed':'#65a30d';
  K.out.push(obj('spawn','Salida',[0,.5,-A*.7],[6,1,6],'#a3a2a5'));K.sign([-10,3,-A*.7+4],'¡Derrota al '+kind.toLowerCase()+'! Pulsa E para lanzar');
  [[0,A,2*A,1],[0,-A,2*A,1],[A,0,1,2*A],[-A,0,1,2*A]].forEach(([x,z,w,dd],i)=>K.B('Muro '+(i+1),[x,3,z],[w,6,dd],K.pc(5),{mat:'ladrillo'}));
  for(let i=0;i<4+o.size;i++){const a=i/(4+o.size)*Math.PI*2;K.B('Columna '+(i+1),[Math.cos(a)*A*.55,3,Math.sin(a)*A*.55],[3,6,3],K.pc(i),{mat:K.T.mat==='neon'?'metal':'ladrillo'})}
  const v=[0,3,4.2,5.5][o.dif];
  K.out.push(obj('persona',kind,[0,6.5,A*.5],[8,13,4],col,{collide:false,scripts:[
    st(30,40,bk('ev_start'),bk('lk_say',{s:kind+': '+HP+' de vida'}),bk('ct_wait',{t:3}),bk('ct_forever',{},[bk('mv_chase',{t:2.5,v}),bk('ct_waitrand',{a:.2,b:1.2})])),
    st(30,260,bk('ev_hit'),bk('vr_add',{n:-1,v:'jefe'}),bk('sn_play',{s:'hit'}),bk('lk_color',{c:'#ffffff'}),bk('ct_wait',{t:.15}),bk('lk_color',{c:col})),
    st(30,480,bk('ev_touch'),bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'boom'}),K.msg('¡Te ha golpeado!',1.2),bk('pl_launch',{n:30}))]}));
  let nm=0;if(o.extras.enemigo!==false&&(o.dif>=2||o.extras.enemigo)){nm=o.enemies||o.dif;for(let k=0;k<nm;k++)K.chaser('Esbirro '+(k+1),[(k%2?1:-1)*A*.6,1.5,A*.2*k],[0,3,4,5][o.dif],6+k*3,'esfera',K.pc(k+2),[bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'hit'}),bk('mv_random',{r:Math.round(A*.6)})])}
  const nh=[0,4,3,2][o.dif];for(let i=0;i<nh;i++)K.out.push(obj('esfera','Corazón',[R1((r()-.5)*A*1.4),2,R1((r()-.5)*A*1.4)],[1.8,1.8,1.8],'#f43f5e',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),K.forever(bk('mv_spin',{g:360,t:2}))),st(30,200,bk('ev_touch'),bk('vr_add',{n:1,v:'vidas'}),bk('sn_play',{s:'levelup'}),K.msg('+1 vida',1),bk('gm_destroy'))]}));
  for(let i=0;i<6;i++){const a=r()*Math.PI*2,d=A+12+r()*14;K.deco(Math.cos(a)*d,Math.sin(a)*d)}
  g.vars=['puntos','vidas','jefe'];g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'jefe',n:HP}),bk('vr_set',{v:'vidas',n:V}),bk('vr_show',{v:'jefe'}),bk('vr_show',{v:'vidas'}),bk('gm_timer',{m:'start'}),K.msg('¡Pulsa E para lanzar! El '+kind.toLowerCase()+' tiene '+HP+' de vida',3.5),bk('sn_music',{m:'batalla'})),
    st(30,300,bk('ev_key',{k:'e'}),bk('pl_shoot',{c:K.pc(0),v:36}),bk('sn_play',{s:'throw'})),
    st(30,420,bk('ev_start'),bk('ct_until',{a:'vidas',o:'<',b:1}),bk('gm_lose')),st(30,540,bk('ev_start'),bk('ct_until',{a:'jefe',o:'<',b:1}),K.msg('¡Has derrotado al '+kind.toLowerCase()+'!',2),bk('sn_play',{s:'win'}),bk('gm_win'))];
  S.push(`Jefe: ${kind} con ${HP} de vida que te persigue por la arena`,`Pulsa E (o el botón) para lanzarle proyectiles · ${V} vidas`);if(nm)S.push(pl(nm,'esbirro que te molesta','esbirros que te molestan'));if(nh)S.push(pl(nh,'corazón para recuperar vida','corazones para recuperar vida'));
  g.desc=`Lanza proyectiles con la tecla E al ${kind.toLowerCase()} hasta dejarle sin vida. Esquívalo y coge corazones.`};

BUILD.tycoon=function(o,r,K,g,S){const t=norm(o.text);const GOAL=o.coins&&o.coins>=100?o.coins:[0,500,1000,2500][o.dif]*(o.size===3?2:1);
  const sets={granja:[['Huerto',[8,2,8],5],['Gallinero',[8,4,7],15],['Establo',[10,6,10],45],['Molino',[6,14,6],120],['Gran granero',[14,9,12],300]],
    dulces:[['Puesto de piruletas',[6,4,6],5],['Fábrica de chuches',[10,6,9],15],['Pastelería',[9,7,9],45],['Torre de tartas',[7,16,7],120],['Castillo de chocolate',[14,12,14],300]],
    espacio:[['Panel solar',[8,1,8],5],['Antena',[3,12,3],15],['Base lunar',[10,6,10],45],['Torre de cohetes',[6,20,6],120],['Estación espacial',[16,10,16],300]],
    normal:[['Casa',[8,6,8],5],['Tienda',[10,5,8],15],['Fábrica',[12,8,10],45],['Rascacielos',[8,26,8],120],['Estadio',[16,7,16],300]]};
  const key=/granja|vaca|huerto/.test(t)?'granja':/dulce|chuche|tarta|caramelo/.test(t)||o.theme==='dulces'?'dulces':o.theme==='espacio'?'espacio':'normal';
  const L=sets[key].slice(0,[0,4,5,5][o.size]);const mult=[0,1,1.6,2.4][o.dif];
  K.out.push(obj('spawn','Salida',[0,.5,0],[6,1,6],'#a3a2a5'));K.sign([-10,3,4],'Pisa los botones para comprar');
  K.B('Calle',[0,.1,0],[6,.2,80],'#1b2a35',{collide:false,mat:'plastico'});
  L.forEach(([n,sz,inc],i)=>{const side=i%2?1:-1,z=-24+i*14,x=side*16,price=Math.round(inc*[0,3,4,5][o.dif]*(i?2.2:1)*mult/1.2/5)*5||10,id='compra'+(i+1);
    K.B(n,[x,sz[1]/2,z],sz,K.pc(i),{hidden:true,collide:false,scripts:[st(30,40,bk('ev_msg',{m:id}),bk('lk_show'),bk('lk_solid',{m:'si'}),bk('sn_play',{s:'place'}),K.forever(bk('ct_wait',{t:1}),bk('vr_add',{n:inc,v:'dinero'})))]});
    K.out.push(obj('cilindro','Botón '+n,[x-side*9,.3,z],[3,.6,3],'#e5484d',{collide:false,scripts:[st(30,40,bk('ev_start'),bk('lk_say',{s:n+': '+price})),
      st(30,170,bk('ev_touch'),bk('ct_ifelse',{a:'dinero',o:'≥',b:price},[bk('vr_add',{n:-price,v:'dinero'}),bk('gm_send',{m:id}),bk('sn_play',{s:'buy'}),K.msg('¡Has comprado: '+n+'!',1.5),bk('gm_destroy')],[bk('sn_play',{s:'error'}),K.msg('Necesitas '+price+' de dinero',1.5)]))]}))});
  const nc=o.extras.monedas===false?0:6;for(let i=0;i<nc;i++)K.out.push(obj('cilindro','Billete',[R1((r()-.5)*50),2.3,R1((r()-.5)*60)],[2,.3,1.2],'#22c55e',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),K.forever(bk('mv_spin',{g:360,t:2}))),st(30,200,bk('ev_touch'),bk('vr_add',{n:5,v:'dinero'}),bk('sn_play',{s:'cash'}),bk('ct_wait',{t:.05}),bk('mv_random',{r:25}))]}));
  if(o.extras.enemigo)K.chaser('Ladrón',[20,2.5,20],[0,3,4,5][o.dif],8,'persona','#1f2937',[bk('vr_set',{v:'dinero',n:0}),bk('sn_play',{s:'steal'}),K.msg('¡El ladrón te ha robado todo el dinero!',2),bk('mv_random',{r:30})]);
  for(let i=0;i<6;i++)K.deco(-34+(i%2)*68,-30+i*12);
  g.vars=['puntos','dinero'];g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'dinero',n:10}),bk('vr_show',{v:'dinero'}),K.msg('Pisa un botón rojo para construir. ¡Llega a '+GOAL+'!',3.5),bk('sn_music',{m:'fiesta'}),K.forever(bk('ct_wait',{t:1}),bk('vr_add',{n:1,v:'dinero'}))),
    st(30,320,bk('ev_start'),bk('ct_until',{a:'dinero',o:'≥',b:GOAL}),bk('gm_win'))];
  S.push(`${L.length} edificios para comprar: ${L.map(x=>x[0].toLowerCase()).join(', ')}`,`Cada edificio da dinero cada segundo · ganas con ${GOAL}`);if(nc)S.push('Billetes sueltos por el mapa');if(o.extras.enemigo)S.push('Un ladrón que te roba si te pilla');
  g.desc=`Pisa los botones para comprar edificios que dan dinero. Llega a ${GOAL} para ganar.`};

BUILD.rescate=function(o,r,K,g,S){const t=norm(o.text);const N=o.rescue||[0,4,6,9][o.size]+(o.dif===3?2:0),A=[0,30,40,52][o.size];
  const who=/gat/.test(t)?['Gatito','gatitos','#f59e0b']:/perr/.test(t)?['Perrito','perritos','#a16207']:/pollit/.test(t)?['Pollito','pollitos','#facc15']:/pinguin/.test(t)||o.theme==='nieve'?['Pingüino','pingüinos','#1f2937']:/alien/.test(t)||o.theme==='espacio'?['Alien','aliens','#a3e635']:['Amigo','amigos','#21c4b0'];
  K.out.push(obj('spawn','Salida',[0,.5,0],[6,1,6],'#a3a2a5'));K.sign([-10,3,4],'¡Encuentra '+N+' '+who[1]+' y vuelve a casa!');
  K.B('Casa',[0,3,-10],[10,6,8],'#ff6a00',{mat:'madera'});K.out.push(obj('cuna','Tejado',[0,7.5,-10],[11,3,9],'#c4281c',{mat:'ladrillo'}));
  K.out.push(obj('bloque','Puerta de casa',[0,.6,-5.4],[5,1.2,2],'#3fbf6a',{mat:'neon',scripts:[st(30,40,bk('ev_start'),bk('lk_say',{s:'CASA'})),st(30,170,bk('ev_touch'),bk('ct_ifelse',{a:'rescatados',o:'≥',b:N},[bk('sn_play',{s:'win'}),bk('gm_win')],[K.msg('Aún faltan '+who[1],1.5)]))]}));
  const sz=who[0]==='Pingüino'?[1.4,2.4,1.2]:[1.6,1.6,1.6];
  for(let i=0;i<N;i++){const a=r()*Math.PI*2,d=12+r()*A,x=Math.cos(a)*d,z=Math.sin(a)*d;let y=sz[1]/2+.2;const hard=o.dif>=2&&r()<.45;
    if(hard){const h=3+Math.floor(r()*[0,2,4,7][o.dif]);for(let s2=1;s2<=Math.ceil(h/2.4);s2++)K.B('Escalón',[x-s2*4,s2*2.4-1.2+.5,z],[4,1,4],K.pc(s2));K.B('Plataforma',[x,h,z],[5,1,5],K.pc(i));y=h+sz[1]/2+.5}
    else if(r()<.4)K.deco(x+2.5,z+1.5);
    K.out.push(obj(who[0]==='Pingüino'?'cilindro':'esfera',who[0]+' '+(i+1),[R1(x),R1(y),R1(z)],sz,who[2],{collide:false,scripts:[st(30,40,bk('ev_start'),bk('lk_say',{s:'¡Socorro!'}),K.forever(bk('mv_spin',{g:30,t:.6}),bk('mv_spin',{g:-30,t:.6}))),
      st(30,220,bk('ev_touch'),bk('vr_add',{n:1,v:'rescatados'}),bk('sn_play',{s:'levelup'}),K.msg('¡'+who[0]+' rescatado!',1.2),bk('gm_destroy'))]}))}
  for(let i=0;i<8;i++){const a=r()*Math.PI*2,d=10+r()*A;K.deco(Math.cos(a)*d,Math.sin(a)*d)}
  let ne=0;if(o.extras.enemigo||(o.dif===3&&o.extras.enemigo!==false)){ne=o.enemies||Math.max(1,o.dif-1);for(let k=0;k<ne;k++)K.chaser('Guardián '+(k+1),[(k%2?1:-1)*A*.7,1.5,A*.5],[0,3,4,5.5][o.dif],5+k*4)}
  let nc=0;if(o.extras.monedas)for(let i=0;i<8;i++,nc++)K.coin([R1((r()-.5)*A*1.6),2.4,R1((r()-.5)*A*1.6)]);
  g.vars=['puntos','rescatados'];g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'rescatados'}),bk('gm_timer',{m:'start'}),K.msg('¡Busca '+N+' '+who[1]+' perdidos!',3),bk('sn_music',{m:'aventura'})),
    st(30,300,bk('ev_start'),bk('ct_until',{a:'rescatados',o:'≥',b:N}),K.msg('¡Los tienes a todos! Vuelve a la puerta de casa',3))];
  S.push(`${N} ${who[1]} perdidos por el mapa${o.dif>=2?', algunos subidos a plataformas':''}`,'Al rescatarlos a todos, vuelve a la puerta verde de casa');if(ne)S.push(pl(ne,'guardián que vigila','guardianes que vigilan'));if(nc)S.push(`${nc} monedas`);
  g.desc=`Busca a los ${N} ${who[1]} perdidos, tócalos para rescatarlos y vuelve a casa.`};

/* ---------- cambiar un juego hecho por la IA ("más difícil", "ponlo en la nieve"…) ---------- */
function refine(prev,text,seed){const p=parse(text),t=prep(text),o=JSON.parse(JSON.stringify(prev||{}));o.extras=o.extras||{};const ch=[];
  const again=/(otra version|otro diferente|cambialo todo|otro distinto|de nuevo)/.test(t);
  const pt=primary(t);if(pt&&pt!==o.type){p.type=pt;o.type=p.type;ch.push('Ahora es: '+TYPES[p.type].name.toLowerCase())}
  if(/otro mundo|otro sitio|otro lugar|cambia el mundo/.test(t)){const ks=Object.keys(THEMES).filter(k=>k!==o.theme);o.theme=ks[Math.floor(Math.random()*ks.length)];ch.push('Mundo: '+THEMES[o.theme].name.toLowerCase())}
  else if(p.found.theme&&p.theme!==o.theme){o.theme=p.theme;ch.push('Mundo: '+THEMES[p.theme].name.toLowerCase())}
  const more=/\b(mas|muy|super)\b/.test(t),less=/\b(menos)\b/.test(t);
  if(/(mas dificil|mas complicad|mas duro|mas reto)/.test(t)||(/(menos facil)/.test(t))){if(o.dif<3){o.dif++;ch.push('Más difícil')}else{o.extreme=true;ch.push('Modo imposible')}}
  else if(/(mas facil|mas sencill|menos dificil|menos complicad)/.test(t)){o.extreme=false;if(o.dif>1){o.dif--;ch.push('Más fácil')}}
  else if(p.found.dif&&!more&&!less){o.dif=p.dif;o.extreme=!!p.extreme;ch.push('Dificultad: '+DIF[o.dif])}
  if(/(mas largo|mas grande|mas niveles|mas fases|mas saltos)/.test(t)){if(o.size<3){o.size++;ch.push('Más largo')}}
  else if(/(mas corto|mas pequen|menos largo)/.test(t)){if(o.size>1){o.size--;ch.push('Más corto')}}
  const add=/(anade|pon|ponle|mete|quiero|con|mas|agrega|incluye)/.test(t),rm=/(quita|sin|elimina|borra|fuera|no quiero|menos)/.test(t);
  const XW={trampolin:/trampolin|muelle/,movil:/movil|se mueven|ascensor/,fantasma:/fantasma|desaparec/,barra:/barra|gira/,monedas:/moneda|gema|estrella|diamante|tesoro|billete/,enemigo:/enemig|monstruo|zombi|bola|malo|guardian|ladron|esbirro/};
  for(const k in XW)if(XW[k].test(t)){if(rm&&!/(anade|pon|ponle|mete|agrega)/.test(t)){if(o.extras[k]!==false){o.extras[k]=false;if(k==='enemigo')o.enemies=null;if(k==='monedas')o.coins=null;ch.push('Sin '+({trampolin:'trampolines',movil:'plataformas móviles',fantasma:'bloques fantasma',barra:'barras giratorias',monedas:'monedas',enemigo:'enemigos'}[k]))}}
    else if(add){o.extras[k]=true;ch.push('Con '+({trampolin:'trampolines',movil:'plataformas móviles',fantasma:'bloques fantasma',barra:'barras giratorias',monedas:'monedas',enemigo:'enemigos'}[k]))}}
  ['coins','enemies','lives','time','count'].forEach(k=>{if(p[k]!=null&&p[k]!==o[k]){o[k]=p[k];ch.push({coins:'Monedas: ',enemies:'Enemigos: ',lives:'Vidas: ',time:'Tiempo: ',count:'Cantidad: '}[k]+p[k]+(k==='time'?' s':''))}});
  if(/sin lava|quita la lava/.test(t)&&!o.nolava){o.nolava=true;ch.push('Sin lava')}else if(/(con lava|pon lava|anade lava)/.test(t)&&o.nolava){o.nolava=false;ch.push('Con lava')}
  if(p.color&&p.color!==o.color){o.color=p.color;o.colorName=p.colorName;ch.push('Color: '+p.colorName)}
  if(p.lowgrav&&!o.lowgrav){o.lowgrav=true;ch.push('Gravedad baja')}if(/(gravedad normal|mas gravedad)/.test(t)&&o.lowgrav){o.lowgrav=false;ch.push('Gravedad normal')}
  if(p.bigjump&&!o.bigjump){o.bigjump=true;ch.push('Súper salto')}if(/(mas rapido|super ?veloc|muy rapido|corre mas)/.test(t)&&!o.fast){o.fast=true;ch.push('Más rápido')}
  if(/(mas lento|despacio)/.test(t)&&o.fast){o.fast=false;ch.push('Velocidad normal')}
  if(p.music&&p.music!==o.music){o.music=p.music;ch.push('Música: '+p.music)}
  if(p.name&&p.name!==o.name){o.name=p.name;ch.push('Nombre: '+p.name)}
  if(!ch.length&&!again)return null;if(again&&!ch.length)ch.push('Otra versión del mismo juego');
  o.text=((prev&&prev.text)||'')+' · '+String(text||'').trim();
  const res=build(o,again?null:seed);res.opts=o;res.changes=ch;return res}

/* ---------- crear ---------- */
function build(o,seed){o=Object.assign({extras:{}},o);o.extras=Object.assign({},o.extras);seed=seed||Math.floor(Math.random()*1e9);const r=rng(seed);
  const T=THEMES[o.theme]||THEMES.normal;const g=Object.assign(E.blank(),{objects:[]});const K=kit(o,r),S=[];
  g.sky=T.sky;g.grav=60;g.speed=o.fast?24:16;g.jump=28;
  if(T.grav||o.lowgrav){g.grav=T.grav||30;g.jump=T.jump||24}
  if(o.bigjump)g.jump=Math.round(g.jump*1.4);
  if(o.extras.enemigo===false)o.enemies=0;
  (BUILD[o.type]||BUILD.obby)(o,r,K,g,S);
  // lava opcional: el peligro se queda como suelo normal
  if(o.nolava)K.out.forEach(x=>{if(x.name===T.danger[0]&&x.scripts&&x.scripts.length===1&&x.scripts[0].b[0].op==='ev_touch'&&x.scripts[0].b[1]&&x.scripts[0].b[1].op==='pl_kill'){x.scripts=[];x.name='Suelo';x.color=T.pal[3];x.mat=T.mat}});
  // tiempo límite para los juegos que no lo traen
  if(o.time&&['obby','torre','rescate','jefe','tycoon'].includes(o.type)){g.scripts.push(st(30,660,bk('ev_start'),bk('gm_timer',{m:'start'}),bk('ct_until',{a:'@crono',o:'>',b:o.time}),K.msg('¡Se acabó el tiempo!',2),bk('gm_lose')));S.push(`Tiempo límite: ${o.time} segundos`)}
  if(o.music){const walk=L=>L.forEach(b=>{if(b.op==='sn_music')b.a.m=o.music;if(b.s)walk(b.s);if(b.s2)walk(b.s2)});g.scripts.forEach(x=>walk(x.b));K.out.forEach(x=>(x.scripts||[]).forEach(y=>walk(y.b)))}
  if(o.nolava)S.push('Sin lava: si caes, puedes volver a subir');
  if(o.theme!=='normal'&&o.type!=='laberinto'&&o.type!=='supervivencia'&&o.type!=='batalla'&&o.type!=='monedas'){for(let i=0;i<6;i++){const a=r()*Math.PI*2,d=30+r()*30;K.deco(Math.cos(a)*d-20,Math.sin(a)*d)}}
  g.objects=K.out;
  const tn=TYPES[o.type]||TYPES.obby;
  g.name=o.name||autoName(o,r);
  S.unshift(`Tipo: ${tn.name.toLowerCase()} · Mundo: ${T.name.toLowerCase()} · Dificultad: ${DIF[o.dif]} · Tamaño: ${SIZE[o.size]}`);
  if(g.grav<60)S.push('Gravedad baja: saltas más alto y caes despacio');if(o.colorName)S.push('Color principal: '+o.colorName);
  g.ia={seed,opts:o};g.author='';
  return {game:g,summary:S,seed}}
function autoName(o,r){const T=THEMES[o.theme]||THEMES.normal;const pick=a=>a[Math.floor(r()*a.length)];
  const base={obby:['Obby','Saltos','Parkour'],monedas:['Caza de monedas','Tesoro','Recolector'],supervivencia:['Supervivencia','¡Que no te pillen!','Huida'],laberinto:['Laberinto','El laberinto','Pasillos'],
    esquivar:['Lluvia de meteoritos','¡Esquiva!','Cielo peligroso'],torre:['Torre','Escalada','La gran torre'],batalla:['Batalla','Guerra de globos','Puntería'],carrera:['Carrera','Sprint','Velocidad'],
    jefe:['El jefe final','Batalla final','Derrota al jefe'],tycoon:['Tycoon','Imperio','Mi negocio'],rescate:['Rescate','Misión rescate','¿Dónde están?']}[o.type]||['Mi juego'];
  const where={normal:'',espacio:' espacial',noche:' de miedo',playa:' en la playa',nieve:' helado',desierto:' del desierto',bosque:' del bosque',volcan:' del volcán',ciudad:' neón',dulces:' de dulces',castillo:' del castillo',mar:' pirata'}[o.theme]||'';
  const dif=o.extreme?' imposible':o.dif===3?' extremo':o.dif===1?' para todos':'';return (pick(base)+where+dif).replace(/\s+/g,' ').trim()}
return {parse,build,refine,TYPES,THEMES,DIF,SIZE,crear(text,seed){const o=parse(text);return Object.assign(build(o,seed),{opts:o})}}};
})();
