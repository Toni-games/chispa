/* CuboStudio · plantillas basadas en los juegos de Cubiverso.
   Son versiones sencillas hechas con piezas y bloques, para que cada uno las cambie a su gusto. */
(function(){
window.CuboPlantillas=function(H){
const {obj,bk,st,PF,E}=H;
// atajos
const B=(name,pos,size,color,ex)=>obj('bloque',name,pos,size,color,ex);
const say=t=>bk('lk_say',{s:t});
const msg=(t,s)=>bk('gm_msg',{s:t,t:s||2.5});
const iff=(a,o,b,s,s2)=>s2?bk('ct_ifelse',{a,o,b},s,s2):bk('ct_if',{a,o,b},s);
const forever=(...b)=>bk('ct_forever',{},b);
const sign=(name,pos,text,color)=>obj('bloque',name,pos,[8,3,.6],color||'#7c5c46',{mat:'madera',scripts:[st(30,40,bk('ev_start'),say(text))]});
const spawn=(x,y,z)=>obj('spawn','Salida',[x,y,z],[6,1,6],'#a3a2a5');
const base=(g,o)=>Object.assign(E.blank(),{objects:[]},o);
const T={};

/* 1 · Carrera Imposible: obby por fases */
T.carrera={name:'Carrera Imposible',color:'#ff6a00',desc:'Obby con saltos, plataformas móviles, baldosas fantasma, barra giratoria, trampolín y torre.',make(){
  const g=base(0,{name:'Mi Carrera Imposible',desc:'Llega a lo alto de la torre sin caer en la lava.',vars:['puntos'],speed:16,jump:28});const o=g.objects;
  o.push(spawn(0,.5,0));
  const lava=PF.lava.make([0,0,0]);lava.pos=[0,.1,92];lava.size=[60,1,200];o.push(lava);
  const cols=['#00a2ff','#f5cd30','#ff66cc'];
  [10,18,26].forEach((z,i)=>o.push(B('Salto '+(i+1),[i%2?3:-3,1+i*1.5,z],[5,1,5],cols[i])));
  const cp=(n,z,y)=>obj('bloque','Control '+n,[0,y,z],[7,1,7],'#21c4b0',{mat:'neon',scripts:[st(30,40,bk('ev_touch'),bk('pl_check'),msg('Fase '+n,2))]});
  o.push(cp(2,36,4));
  [46,58].forEach((z,i)=>o.push(obj('bloque','Móvil '+(i+1),[i?8:-8,4,z],[6,1,6],'#ff6a00',{scripts:[st(30,40,bk('ev_start'),forever(bk('mv_move',{x:i?-16:16,y:0,z:0,t:2.2}),bk('ct_wait',{t:.4}),bk('mv_move',{x:i?16:-16,y:0,z:0,t:2.2}),bk('ct_wait',{t:.4})))]})));
  o.push(cp(3,70,4));
  [80,88,96,104].forEach((z,i)=>o.push(obj('bloque','Fantasma '+(i+1),[0,4,z],[6,1,6],'#9966ff',{scripts:[st(30,40,bk('ev_start'),bk('ct_wait',{t:i*.7}),forever(bk('ct_wait',{t:1.6}),bk('lk_transp',{n:80}),bk('lk_solid',{m:'no'}),bk('ct_wait',{t:1.4}),bk('lk_transp',{n:0}),bk('lk_solid',{m:'si'})))]})));
  o.push(cp(4,114,4));
  o.push(B('Plaza de la barra',[0,4,128],[14,1,14],'#a3a2a5'));
  o.push(obj('bloque','Barra giratoria',[0,5.4,128],[11,1,1],'#c4281c',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_spin',{g:360,t:3}))),st(30,200,bk('ev_touch'),bk('pl_launch',{n:26}),bk('sn_play',{s:'hit'}),msg('¡ZAS!',1))]}));
  o.push(cp(5,141,4));
  const tr=PF.trampolin.make([0,0,0]);tr.pos=[0,4.5,149];tr.size=[5,1,5];o.push(tr);
  o.push(B('Plataforma alta',[0,18,158],[7,1,7],'#4b974b'));
  o.push(obj('cuna','Rampa final',[0,21.5,166],[6,6,10],'#a3a2a5'));
  o.push(B('Torre',[0,12.25,175],[8,24.5,8],'#636466',{mat:'ladrillo'}));
  const m=PF.meta.make([0,0,0]);m.pos=[0,25,175];m.size=[8,1,8];o.push(m);
  g.scripts=[st(30,40,bk('ev_start'),bk('gm_timer',{m:'start'}),msg('Fase 1: ¡salta!',3))];return g}};

/* 2 · Guerra de Globos */
T.globos={name:'Guerra de Globos',color:'#00a2ff',desc:'Lanza globos de agua (tecla E) a los rivales antes de que te mojen.',make(){
  const g=base(0,{name:'Mi Guerra de Globos',desc:'Pulsa E para lanzar globos. Si un rival te toca, pierdes una vida. Aguanta 90 segundos.',vars:['puntos','vidas']});const o=g.objects;
  o.push(spawn(0,.5,0));
  [[0,30,60,1],[0,-30,60,1],[30,0,1,60],[-30,0,1,60]].forEach(([x,z,w,d],i)=>o.push(B('Muro '+(i+1),[x,2,z],[w,4,d],'#c4281c',{mat:'ladrillo'})));
  [[10,10],[-12,8],[8,-14],[-9,-12],[18,-4]].forEach(([x,z],i)=>o.push(B('Caja '+(i+1),[x,1.5,z],[3,3,3],'#7c5c46',{mat:'madera'})));
  [[20,20,'#ff6a00'],[-20,20,'#9966ff'],[-20,-20,'#4b974b']].forEach(([x,z,c],i)=>o.push(obj('persona','Rival '+(i+1),[x,2.5,z],[3,5,1.5],c,{collide:false,scripts:[
    st(30,40,bk('ev_start'),bk('ct_wait',{t:3+i}),forever(bk('mv_chase',{t:1,v:5+i}))),
    st(30,250,bk('ev_hit'),bk('vr_add',{n:1,v:'puntos'}),bk('sn_play',{s:'pop'}),say('¡Me has mojado!'),bk('mv_random',{r:6}),bk('ct_wait',{t:1}),say('')),
    st(30,470,bk('ev_touch'),bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'splash'}),msg('¡Te han mojado!',1.5),bk('mv_random',{r:8}))]})));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'vidas',n:3}),bk('vr_show',{v:'puntos'}),bk('vr_show',{v:'vidas'}),bk('gm_timer',{m:'start'}),msg('Pulsa E para lanzar globos',3),bk('sn_music',{m:'batalla'})),
    st(30,300,bk('ev_key',{k:'e'}),bk('pl_shoot',{c:'#00a2ff',v:34})),
    st(30,420,bk('ev_start'),bk('ct_until',{a:'vidas',o:'<',b:1}),bk('gm_lose')),
    st(30,560,bk('ev_start'),bk('ct_until',{a:'@crono',o:'≥',b:90}),bk('gm_win'))];return g}};

/* 3 · Pesca Tranquila */
T.pesca={name:'Pesca Tranquila',color:'#21c4b0',desc:'Pesca al final del muelle (tecla E) y vende los peces en la tienda.',make(){
  const g=base(0,{name:'Mi Pesca Tranquila',desc:'Ve al final del muelle y pulsa E para pescar. Vende los peces en la tienda tocando el mostrador. Consigue 100 monedas.',sky:'atardecer',vars:['peces','monedas']});const o=g.objects;
  o.push(spawn(0,.5,-24));
  o.push(B('Lago',[0,.1,10],[50,.2,36],'#1e88e5',{mat:'hielo',transp:20,collide:false,scripts:[st(30,40,bk('ev_touch'),bk('pl_tp',{x:0,y:2,z:-12}),msg('¡Al agua no! Pesca desde el muelle',2))]}));
  o.push(B('Muelle',[0,1,-2],[5,.6,24],'#7c5c46',{mat:'madera'}));
  o.push(B('Orilla',[0,.4,-20],[50,.8,12],'#e9c99a',{mat:'arena'}));
  o.push(obj('esfera','Corcho',[0,.6,13],[1.2,1.2,1.2],'#c4281c',{collide:false,scripts:[
    st(30,40,bk('ev_start'),forever(bk('mv_move',{x:0,y:.3,z:0,t:1}),bk('mv_move',{x:0,y:-.3,z:0,t:1}))),
    st(30,220,bk('ev_key',{k:'e'}),iff('@dist','<',8,[msg('Esperando a que pique…',1.5),bk('ct_waitrand',{a:1,b:4}),bk('sn_play',{s:'bite'}),
      iff('@azar','>',7,[bk('vr_add',{n:3,v:'peces'}),msg('¡Un pez enorme! +3',2)],[bk('vr_add',{n:1,v:'peces'}),msg('Has pescado un pez',1.5)]),bk('sn_play',{s:'fish'})],
      [msg('Ve al final del muelle para pescar',2)]))]}));
  o.push(B('Tienda',[16,2.5,-22],[8,5,6],'#f5cd30',{mat:'madera'}));
  o.push(B('Mostrador',[16,1,-17.5],[8,2,2],'#7c5c46',{mat:'madera',scripts:[st(30,40,bk('ev_start'),say('Vender peces')),
    st(30,170,bk('ev_touch'),iff('peces','>',0,[bk('vr_addv',{a:'peces',n:5,v:'monedas'}),bk('vr_set',{v:'peces',n:0}),bk('sn_play',{s:'cash'}),msg('¡Peces vendidos!',1.5)],[msg('No tienes peces',1.5)]))]}));
  [[-18,-18],[-22,-12],[20,-10],[-24,26],[24,28]].forEach(([x,z],i)=>{const t=PF.arbol.make([x,0,z]);o.push(t[0],t[1])});
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'peces'}),bk('vr_show',{v:'monedas'}),bk('sn_music',{m:'lago'}),msg('Ve al muelle y pulsa E para pescar',3),bk('ct_until',{a:'monedas',o:'≥',b:100}),bk('gm_win'))];return g}};

/* 4 · Torres del Castillo */
T.torres={name:'Torres del Castillo',color:'#636466',desc:'Los mocos avanzan por el camino: tócalos o lánzales con E antes de que lleguen al castillo.',make(){
  const g=base(0,{name:'Mi Defensa del Castillo',desc:'Detén a los mocos tocándolos o lanzándoles cosas con E. Si llegan al castillo, pierdes vidas.',vars:['vidas','monedas'],sky:'nublado'});const o=g.objects;
  o.push(spawn(10,.5,-26));
  const path=[[20,40],[20,10],[-15,10],[-15,-20],[0,-20],[0,-34]];
  for(let i=0;i<path.length-1;i++){const [x1,z1]=path[i],[x2,z2]=path[i+1];o.push(B('Camino '+(i+1),[(x1+x2)/2,.1,(z1+z2)/2],[Math.abs(x2-x1)+4,.2,Math.abs(z2-z1)+4],'#e9c99a',{mat:'arena',collide:false}))}
  o.push(B('Castillo',[0,5,-42],[16,10,10],'#a3a2a5',{mat:'ladrillo'}));
  [-8,8].forEach((x,i)=>o.push(obj('cilindro','Torre '+(i+1),[x,7,-42],[5,14,5],'#636466',{mat:'ladrillo'})));
  o.push(obj('esfera','Moco',[20,1.5,40],[3,3,3],'#4b974b',{hidden:true,collide:false,scripts:[
    st(30,40,bk('ev_clone'),bk('lk_show'),bk('mv_move',{x:0,y:0,z:-30,t:4}),bk('mv_move',{x:-35,y:0,z:0,t:4.5}),bk('mv_move',{x:0,y:0,z:-30,t:4}),bk('mv_move',{x:15,y:0,z:0,t:2}),bk('mv_move',{x:0,y:0,z:-14,t:2}),bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'hit'}),bk('gm_destroy')),
    st(30,330,bk('ev_click'),bk('vr_add',{n:1,v:'monedas'}),bk('sn_play',{s:'pop'}),bk('gm_destroy')),
    st(30,470,bk('ev_hit'),bk('vr_add',{n:1,v:'monedas'}),bk('sn_play',{s:'pop'}),bk('gm_destroy'))]}));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'vidas',n:10}),bk('vr_show',{v:'vidas'}),bk('vr_show',{v:'monedas'}),msg('¡Toca los mocos o lánzales con E!',3),bk('ct_wait',{t:3}),
      bk('ct_repeat',{n:30},[bk('gm_cloneof',{o:'Moco',x:20,y:1.5,z:40}),bk('ct_waitrand',{a:.8,b:2.2})]),bk('ct_wait',{t:18}),bk('gm_win')),
    st(30,420,bk('ev_start'),bk('ct_until',{a:'vidas',o:'<',b:1}),bk('gm_lose')),
    st(30,540,bk('ev_key',{k:'e'}),bk('pl_shoot',{c:'#f5cd30',v:36}))];return g}};

/* 5 · Ladrones de Brainrots */
T.ladrones={name:'Ladrones de Brainrots',color:'#ff66cc',desc:'Coge los brainrots de la cinta, llévalos a tu base y que no te pille el guardia.',make(){
  const g=base(0,{name:'Mis Ladrones de Brainrots',desc:'Toca un brainrot de la cinta y llévalo a tu base. Cada brainrot da dinero cada segundo. Llega a 500.',vars:['dinero','brainrots','llevas']});const o=g.objects;
  o.push(spawn(24,.5,10));
  o.push(B('Cinta',[0,.3,0],[6,.6,64],'#1b2a35',{mat:'metal'}));
  o.push(B('Brainrot',[0,1.9,30],[2.5,2.5,2.5],'#ff66cc',{mat:'neon',hidden:true,collide:false,scripts:[
    st(30,40,bk('ev_clone'),bk('lk_show'),bk('mv_move',{x:0,y:0,z:-60,t:14}),bk('gm_destroy')),
    st(30,200,bk('ev_clone'),forever(bk('mv_spin',{g:360,t:2}))),
    st(30,330,bk('ev_touch'),iff('llevas','<',1,[bk('vr_set',{v:'llevas',n:1}),bk('sn_play',{s:'steal'}),msg('¡Llévalo a tu base!',2),bk('gm_destroy')],[msg('Ya llevas uno',1)]))]}));
  o.push(obj('bloque','Tu base',[24,.5,0],[12,1,12],'#3fbf6a',{mat:'neon',scripts:[st(30,40,bk('ev_start'),say('TU BASE')),
    st(30,170,bk('ev_touch'),iff('llevas','>',0,[bk('vr_set',{v:'llevas',n:0}),bk('vr_add',{n:1,v:'brainrots'}),bk('sn_play',{s:'levelup'}),msg('+1 brainrot',1.5)]))]}));
  o.push(obj('persona','Guardia',[-14,2.5,0],[3,5,1.5],'#0d69ac',{collide:false,scripts:[
    st(30,40,bk('ev_start'),forever(iff('llevas','>',0,[bk('mv_chase',{t:.4,v:9})],[bk('mv_back',{t:1})]))),
    st(30,280,bk('ev_touch'),iff('llevas','>',0,[bk('vr_set',{v:'llevas',n:0}),bk('sn_play',{s:'alarm'}),say('¡Devuelve eso!'),msg('¡Te lo han quitado!',2),bk('ct_wait',{t:2}),say('')]))]}));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'dinero'}),bk('vr_show',{v:'brainrots'}),bk('sn_music',{m:'fiesta'}),forever(bk('gm_cloneof',{o:'Brainrot',x:0,y:1.9,z:30}),bk('ct_wait',{t:3}))),
    st(30,320,bk('ev_start'),forever(bk('ct_wait',{t:1}),bk('vr_addv',{a:'brainrots',n:5,v:'dinero'}))),
    st(30,460,bk('ev_start'),bk('ct_until',{a:'dinero',o:'≥',b:500}),bk('gm_win'))];return g}};

/* 6 · Patadón de Lucky Blocks */
T.patadon={name:'Patadón de Lucky Blocks',color:'#f5cd30',desc:'Acércate al bloque y pulsa E para darle una patada y ganar premios.',make(){
  const g=base(0,{name:'Mi Patadón',desc:'Pulsa E junto al bloque de la suerte para patearlo. Cuanto más lejos llegue, mejor. Consigue 400 monedas.',vars:['monedas','metros']});const o=g.objects;
  o.push(spawn(0,.5,-4));
  o.push(B('Pista',[0,.1,60],[12,.2,124],'#4b974b',{mat:'cesped',collide:false}));
  [20,40,60,80,100].forEach(z=>o.push(obj('bloque',z+' m',[9,2,z],[6,3,.5],'#f2f3f3',{scripts:[st(30,40,bk('ev_start'),say(z+' metros'))]})));
  o.push(B('Bloque de la suerte',[0,1.5,6],[3,3,3],'#f5cd30',{collide:false,scripts:[
    st(30,40,bk('ev_key',{k:'e'}),iff('@dist','<',8,[bk('sn_play',{s:'kick'}),msg('¡PATADA!',1),bk('vr_set',{v:'metros',n:20}),bk('mv_move',{x:0,y:8,z:10,t:.5}),bk('mv_move',{x:0,y:-8,z:10,t:.5}),
      bk('ct_repeat',{n:4},[iff('@azar','>',4,[bk('mv_move',{x:0,y:0,z:15,t:.5}),bk('vr_add',{n:15,v:'metros'})])]),
      bk('sn_play',{s:'lucky'}),bk('vr_addv',{a:'metros',n:1,v:'monedas'}),bk('gm_send',{m:'premio'}),bk('ct_wait',{t:1.5}),bk('mv_back',{t:.6})],[msg('Acércate al bloque y pulsa E',2)])),
    st(30,500,bk('ev_start'),forever(bk('mv_spin',{g:90,t:1})))]}));
  o.push(obj('cilindro','Botón botas',[-10,.4,-2],[3,.8,3],'#e5484d',{collide:false,scripts:[st(30,40,bk('ev_start'),say('Botas rápidas: 50')),
    st(30,170,bk('ev_touch'),iff('monedas','≥',50,[bk('vr_add',{n:-50,v:'monedas'}),bk('pl_speed',{n:26}),bk('sn_play',{s:'buy'}),msg('¡Botas rápidas!',2),bk('gm_destroy')],[msg('Te faltan monedas',1.5)]))]}));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'monedas'}),bk('vr_show',{v:'metros'}),msg('Acércate al bloque amarillo y pulsa E',3),bk('ct_until',{a:'monedas',o:'≥',b:400}),bk('gm_win')),
    st(30,300,bk('ev_msg',{m:'premio'}),msg('¡Premio! Ganas tantas monedas como metros',2))];return g}};

/* 7 · Barrio Tycoon */
T.barrio={name:'Barrio Tycoon',color:'#4b974b',desc:'Pisa los botones para comprar edificios; cada uno te da dinero.',make(){
  const g=base(0,{name:'Mi Barrio Tycoon',desc:'Pisa los botones rojos para construir. Cada edificio da dinero. Llega a 1000.',vars:['dinero']});const o=g.objects;
  o.push(spawn(0,.5,0));
  o.push(B('Carretera',[0,.1,0],[6,.2,60],'#1b2a35',{collide:false}));o.push(B('Carretera 2',[0,.1,0],[60,.2,6],'#1b2a35',{collide:false}));
  const lots=[['Casa',[-14,0,-14],[8,6,8],'#ff6a00',10,1],['Tienda',[14,0,-14],[10,5,8],'#00a2ff',40,3],['Bloque de pisos',[-14,0,14],[8,14,8],'#f5cd30',120,8],['Rascacielos',[14,0,14],[8,28,8],'#21c4b0',350,20],['Estadio',[-30,0,0],[12,6,16],'#c4281c',700,40]];
  lots.forEach(([n,p,s,c,price,inc],i)=>{const key='edificio'+(i+1);
    o.push(B(n,[p[0],s[1]/2,p[2]],s,c,{hidden:true,collide:false,scripts:[st(30,40,bk('ev_msg',{m:key}),bk('lk_show'),bk('lk_solid',{m:'si'}),bk('sn_play',{s:'place'}),forever(bk('ct_wait',{t:1}),bk('vr_add',{n:inc,v:'dinero'})))]}));
    const bx=p[0]+(p[0]<0?7:-7),bz=p[2]+(p[2]<0?7:p[2]>0?-7:0);
    o.push(obj('cilindro','Botón '+n,[bx,.3,bz],[3,.6,3],'#e5484d',{collide:false,scripts:[st(30,40,bk('ev_start'),say(n+': '+price)),
      st(30,170,bk('ev_touch'),iff('dinero','≥',price,[bk('vr_add',{n:-price,v:'dinero'}),bk('gm_send',{m:key}),bk('sn_play',{s:'buy'}),bk('gm_destroy')],[msg('Necesitas '+price+' de dinero',1.5)]))]}))});
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'dinero',n:10}),bk('vr_show',{v:'dinero'}),msg('Pisa un botón rojo para construir',3),forever(bk('ct_wait',{t:1}),bk('vr_add',{n:1,v:'dinero'}))),
    st(30,320,bk('ev_start'),bk('ct_until',{a:'dinero',o:'≥',b:1000}),bk('gm_win'))];return g}};

/* 8 · Repartidor de Tormentas */
T.tormentas={name:'Repartidor de Tormentas',color:'#6b327c',desc:'Recoge paquetes en Correos y entrégalos sin que te pillen las nubes de tormenta.',make(){
  const g=base(0,{name:'Mi Repartidor de Tormentas',desc:'Coge un paquete en Correos y llévalo a un buzón. Si una nube de tormenta te toca, pierdes el paquete. Haz 10 entregas.',sky:'nublado',vars:['entregas','llevas']});const o=g.objects;
  o.push(spawn(0,.5,-10));
  o.push(B('Correos',[0,3,-24],[12,6,8],'#0d69ac',{scripts:[st(30,40,bk('ev_start'),say('CORREOS'))]}));
  o.push(B('Paquetes',[0,1,-18],[3,2,3],'#7c5c46',{mat:'madera',scripts:[st(30,40,bk('ev_touch'),iff('llevas','<',1,[bk('vr_set',{v:'llevas',n:1}),bk('sn_play',{s:'pop'}),msg('¡Paquete! Llévalo a un buzón',2)]))]}));
  [[-28,20,'#ff6a00'],[26,24,'#4b974b'],[30,-18,'#ff66cc'],[-30,-14,'#f5cd30']].forEach(([x,z,c],i)=>{
    o.push(B('Casa '+(i+1),[x,3,z],[8,6,8],c));
    o.push(obj('cilindro','Buzón '+(i+1),[x+(x<0?6:-6),1,z],[1.5,2,1.5],'#21c4b0',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_touch'),iff('llevas','>',0,[bk('vr_set',{v:'llevas',n:0}),bk('vr_add',{n:1,v:'entregas'}),bk('sn_play',{s:'coin'}),msg('¡Entregado!',1.5)]))]}))});
  [[16,6],[-16,4]].forEach(([x,z],i)=>o.push(obj('esfera','Nube de tormenta '+(i+1),[x,3,z],[6,4,6],'#3a3f50',{collide:false,transp:15,scripts:[
    st(30,40,bk('ev_start'),bk('ct_wait',{t:4}),forever(bk('mv_chase',{t:2,v:4.5+i}),bk('ct_wait',{t:.6}))),
    st(30,250,bk('ev_touch'),iff('llevas','>',0,[bk('vr_set',{v:'llevas',n:0}),bk('sn_play',{s:'thunder'}),msg('¡Un rayo! Has perdido el paquete',2)]))]})));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'entregas'}),bk('gm_timer',{m:'start'}),msg('Coge un paquete en Correos',3),bk('ct_until',{a:'entregas',o:'≥',b:10}),bk('gm_win'))];return g}};

/* 9 · Ciudad de Bolsillo */
T.bolsillo={name:'Ciudad de Bolsillo',color:'#e9c99a',desc:'Toca las parcelas para construir casas y llenar tu ciudad de habitantes.',make(){
  const g=base(0,{name:'Mi Ciudad de Bolsillo',desc:'Toca una parcela gris para construir (20 de dinero). Cada casa trae habitantes y dinero. Llega a 45 habitantes.',vars:['dinero','habitantes']});const o=g.objects;
  o.push(spawn(0,.5,-26));
  const cols=['#ff6a00','#00a2ff','#f5cd30','#ff66cc','#21c4b0','#9966ff','#4b974b','#c4281c','#f2f3f3'];let n=0;
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){n++;const x=i*14,z=j*14,h=4+((n*7)%5)*2,key='parcela'+n;
    o.push(B('Casa '+n,[x,h/2,z],[7,h,7],cols[n-1],{hidden:true,collide:false,scripts:[st(30,40,bk('ev_msg',{m:key}),bk('lk_show'),bk('lk_solid',{m:'si'}),bk('sn_play',{s:'place'}),forever(bk('ct_wait',{t:3}),bk('vr_add',{n:2,v:'dinero'})))]}));
    o.push(B('Parcela '+n,[x,.2,z],[10,.4,10],'#a3a2a5',{collide:false,scripts:[st(30,40,bk('ev_click'),iff('dinero','≥',20,[bk('vr_add',{n:-20,v:'dinero'}),bk('vr_add',{n:5,v:'habitantes'}),bk('gm_send',{m:key}),bk('gm_destroy')],[msg('Necesitas 20 de dinero',1.5)]))]}))}
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'dinero',n:40}),bk('vr_show',{v:'dinero'}),bk('vr_show',{v:'habitantes'}),msg('Toca una parcela gris para construir',3),forever(bk('ct_wait',{t:2}),bk('vr_add',{n:1,v:'dinero'}))),
    st(30,320,bk('ev_start'),bk('ct_until',{a:'habitantes',o:'≥',b:45}),bk('gm_win'))];return g}};

/* 10 · El Cambiazo */
T.cambiazo={name:'El Cambiazo',color:'#1b2a35',desc:'Cambia tu móvil viejo por otros mejores hablando con la gente del barrio.',make(){
  const g=base(0,{name:'Mi Cambiazo',desc:'Toca a la gente para cambiar tu móvil por uno mejor. No siempre quieren. Consigue el móvil 6.',sky:'noche',vars:['movil']});const o=g.objects;
  o.push(spawn(0,.5,-4));
  o.push(B('Calle',[0,.1,30],[10,.2,80],'#1b2a35',{collide:false}));
  const ppl=[['Ana','#ff66cc'],['Leo','#00a2ff'],['Marta','#f5cd30'],['Iker','#4b974b'],['Sofía','#9966ff']];
  ppl.forEach(([n,c],i)=>{const want=i+1,give=i+2,z=10+i*12,x=i%2?9:-9;
    o.push(B('Casa de '+n,[x+(x<0?-8:8),4,z],[8,8,8],['#7c5c46','#636466','#c4281c','#0d69ac','#a3a2a5'][i]));
    o.push(obj('persona',n,[x,2.5,z],[3,5,1.5],c,{rot:x<0?90:-90,scripts:[st(30,40,bk('ev_start'),say('Tengo el móvil '+give)),
      st(30,170,bk('ev_click'),iff('movil','=',want,[iff('@azar','>',3,[bk('vr_set',{v:'movil',n:give}),bk('sn_play',{s:'levelup'}),say('¡Trato hecho!'),msg('Ahora tienes el móvil '+give,2)],[bk('sn_play',{s:'error'}),say('Hoy no me apetece… vuelve a probar')])],
        [iff('movil','>',want,[say('Tu móvil ya es mejor que el mío')],[say('Solo lo cambio por el móvil '+want)])]))]}))});
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'movil',n:1}),bk('vr_show',{v:'movil'}),bk('sn_music',{m:'neon'}),msg('Toca a la gente para cambiar tu móvil',3),bk('ct_until',{a:'movil',o:'≥',b:6}),bk('gm_win'))];return g}};
/* ===== Clásicos: plantillas completas para empezar ===== */
const coin=(pos,v)=>obj('cilindro','Moneda',pos,[2,.5,2],'#f5cd30',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_spin',{g:360,t:2}))),st(30,200,bk('ev_touch'),bk('vr_add',{n:1,v:v||'puntos'}),bk('sn_play',{s:'coin'}),bk('gm_destroy'))]});
const kill=(name,pos,size,color,mat)=>obj('bloque',name,pos,size,color,{mat:mat||'neon',scripts:[st(30,40,bk('ev_touch'),bk('pl_kill'))]});
const tree=(x,z)=>[obj('cilindro','Tronco',[x,3,z],[1.2,6,1.2],'#7c5c46',{mat:'madera'}),obj('esfera','Copa',[x,7,z],[6,4,6],'#4b974b',{mat:'cesped'})];
const palm=(x,z)=>[obj('cilindro','Tronco',[x,4,z],[1,8,1],'#a16207',{mat:'madera'}),obj('esfera','Hojas',[x,8.6,z],[7,2,7],'#65a30d',{mat:'cesped'})];
const cp=(n,pos)=>obj('bloque','Punto de control '+n,pos,[7,1,7],'#21c4b0',{mat:'neon',scripts:[st(30,40,bk('ev_touch'),bk('pl_check'),bk('sn_play',{s:'checkpoint'}),msg('Fase '+n,1.5))]});

T.obbyclasico={group:'clasico',name:'Obby de 12 fases',color:'#e5484d',desc:'Un obby completo: cada fase tiene una trampa distinta, con puntos de control y monedas.',make(){
  const g=base(0,{name:'Mi Obby de 12 fases',desc:'Supera las 12 fases sin caer en la lava. Cada fase tiene una trampa nueva.',vars:['puntos'],speed:16,jump:28});const o=g.objects;
  o.push(spawn(0,.5,0));o.push(sign('Cartel',[-9,3,3],'12 fases. ¡Suerte!'));
  const C=['#e5484d','#f97316','#facc15','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'];let z=0,y=.5;
  const stage=(n,build)=>{build();z+=10;y+=1;o.push(cp(n+1,[0,y,z]));o.push(coin([0,y+2.2,z]))};
  stage(1,()=>{[1,2,3,4].forEach(i=>{z+=7;y+=.6;o.push(B('Salto '+i,[i%2?3:-3,y,z],[5,1,5],C[0]))})});
  stage(2,()=>{[1,2,3].forEach(i=>{z+=8;o.push(B('Barra estrecha '+i,[0,y,z],[1.4,1,6],C[1]))})});
  stage(3,()=>{[1,2].forEach(i=>{z+=11;o.push(obj('bloque','Plataforma móvil '+i,[i%2?-7:7,y,z],[6,1,6],C[2],{scripts:[st(30,40,bk('ev_start'),forever(bk('mv_move',{x:i%2?14:-14,y:0,z:0,t:2.2}),bk('ct_wait',{t:.4}),bk('mv_move',{x:i%2?-14:14,y:0,z:0,t:2.2}),bk('ct_wait',{t:.4})))]}))})});
  stage(4,()=>{[1,2,3,4].forEach(i=>{z+=7;o.push(obj('bloque','Fantasma '+i,[0,y,z],[5,1,5],'#9966ff',{scripts:[st(30,40,bk('ev_start'),bk('ct_wait',{t:i*.6}),forever(bk('ct_wait',{t:1.5}),bk('lk_transp',{n:80}),bk('lk_solid',{m:'no'}),bk('ct_wait',{t:1.2}),bk('lk_transp',{n:0}),bk('lk_solid',{m:'si'})))]}))})});
  stage(5,()=>{z+=10;o.push(B('Plaza giratoria',[0,y,z],[14,1,14],C[4]));o.push(obj('bloque','Barra giratoria',[0,y+1.4,z],[12,1,1],'#c4281c',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_spin',{g:360,t:2.6}))),st(30,200,bk('ev_touch'),bk('pl_launch',{n:24}),bk('sn_play',{s:'hit'}))]}));z+=4});
  stage(6,()=>{z+=7;o.push(obj('cilindro','Trampolín',[0,y+.2,z],[5,1,5],'#00a2ff',{scripts:[st(30,40,bk('ev_touch'),bk('pl_launch',{n:50}),bk('sn_play',{s:'boing'}))]}));y+=9;z+=8;o.push(B('Plataforma alta',[0,y,z],[7,1,7],C[5]))});
  stage(7,()=>{[1,2,3].forEach(i=>{z+=8;o.push(B('Escalón '+i,[0,y,z],[6,1,6],C[6]));o.push(kill('Láser '+i,[0,y+1.2,z],[6,.4,.4],'#f43f5e'))})});
  stage(8,()=>{[1,2,3,4,5].forEach(i=>{z+=5;y+=1.2;o.push(B('Pilar '+i,[i%2?2:-2,y,z],[2.5,1,2.5],C[7]))})});
  stage(9,()=>{z+=8;o.push(B('Pasillo de bolas',[0,y,z+8],[8,1,22],C[0]));[1,2].forEach(i=>o.push(obj('esfera','Bola rodante '+i,[-3,y+2,z+4+i*6],[3,3,3],'#1f2937',{collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_move',{x:6,y:0,z:0,t:1.1+i*.3}),bk('mv_move',{x:-6,y:0,z:0,t:1.1+i*.3}))),st(30,200,bk('ev_touch'),bk('pl_kill'))]})));z+=18});
  stage(10,()=>{[1,2,3].forEach(i=>{z+=8;o.push(obj('bloque','Ascensor '+i,[0,y,z],[5,1,5],C[2],{scripts:[st(30,40,bk('ev_start'),forever(bk('mv_move',{x:0,y:4,z:0,t:1.6}),bk('mv_move',{x:0,y:-4,z:0,t:1.6})))]}))});y+=2});
  stage(11,()=>{[1,2,3,4,5,6].forEach(i=>{z+=5.5;o.push(B('Mini '+i,[(i%3-1)*3,y,z],[2.2,1,2.2],C[i%8]))})});
  stage(12,()=>{z+=8;o.push(B('Escalera final',[0,y+1,z],[6,1,6],C[3]));z+=6;y+=2.5;o.push(B('Escalón final',[0,y,z],[6,1,6],C[4]))});
  z+=9;y+=1;o.push(obj('bloque','Meta',[0,y,z],[10,1,10],'#3fbf6a',{mat:'neon',scripts:[st(30,40,bk('ev_start'),say('META')),st(30,170,bk('ev_touch'),bk('sn_play',{s:'win'}),bk('gm_win'))]}));
  o.push(obj('cilindro','Copa',[0,y+2.5,z+3],[2.4,4,2.4],'#eab308',{mat:'metal',collide:false}));
  o.push(kill('Lava',[0,.1,z/2],[60,1,z+40],'#ff4a1c'));
  g.scripts=[st(30,40,bk('ev_start'),bk('gm_timer',{m:'start'}),bk('vr_show',{v:'puntos'}),msg('¡12 fases hasta la meta!',3),bk('sn_music',{m:'aventura'}))];return g}};

T.colorloco={group:'clasico',name:'Color Loco',color:'#8b5cf6',desc:'Cuando se diga un color, corre a una baldosa de ese color: las demás desaparecen.',make(){
  const g=base(0,{name:'Mi Color Loco',desc:'Escucha el color y ponte encima antes de que desaparezcan las demás baldosas. Aguanta 10 rondas.',vars:['color','rondas','vidas'],speed:18,jump:26});const o=g.objects;
  const COL=[['Rojo','#e5484d'],['Azul','#2563eb'],['Verde','#22c55e'],['Amarillo','#facc15'],['Morado','#8b5cf6']];
  o.push(obj('spawn','Salida',[0,8.6,0],[4,.2,4],'#a3a2a5',{collide:false}));
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){const k=(i*2+j*3)%5;const n=k+1;
    o.push(obj('bloque','Baldosa '+COL[k][0].toLowerCase(),[(i-2)*6,8,(j-2)*6],[6,1,6],COL[k][1],{mat:'neon',scripts:[
      st(30,40,bk('ev_msg',{m:'quitar'}),iff('color','≠',2*n-1,[iff('color','≠',2*n,[bk('lk_hide'),bk('lk_solid',{m:'no'})])])),
      st(30,260,bk('ev_msg',{m:'volver'}),bk('lk_show'),bk('lk_solid',{m:'si'}))]}))}
  o.push(obj('bloque','Lava',[0,.1,0],[90,1,90],'#ff4a1c',{mat:'neon',scripts:[st(30,40,bk('ev_touch'),bk('vr_add',{n:-1,v:'vidas'}),bk('sn_play',{s:'hit'}),msg('¡Al agua! Pierdes una vida',1.5),bk('pl_kill'))]}));
  [[-20,-20],[20,-20],[-20,20],[20,20]].forEach(([x,z],i)=>o.push(obj('cilindro','Altavoz '+(i+1),[x,10,z],[3,6,3],'#1f2937',{mat:'metal',scripts:[st(30,40,bk('ev_start'),forever(bk('lk_size',{x:3,y:6.6,z:3}),bk('ct_wait',{t:.25}),bk('lk_size',{x:3,y:6,z:3}),bk('ct_wait',{t:.25})))]})));
  const announce=COL.map(([nm],k)=>iff('color','≥',2*k+1,[iff('color','≤',2*k+2,[msg('¡'+nm.toUpperCase()+'!',2.5),say(nm)])])); 
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_set',{v:'vidas',n:3}),bk('vr_show',{v:'rondas'}),bk('vr_show',{v:'vidas'}),bk('sn_music',{m:'fiesta'}),msg('Cuando oigas un color, ¡corre a una baldosa de ese color!',3.5),bk('ct_wait',{t:4}),
      bk('ct_repeat',{n:10},[bk('vr_set',{v:'color',n:0}),bk('vr_addv',{a:'@azar',n:1,v:'color'}),bk('sn_play',{s:'alarm'}),...announce,bk('ct_wait',{t:3}),bk('gm_send',{m:'quitar'}),bk('ct_wait',{t:2.5}),bk('gm_send',{m:'volver'}),bk('vr_add',{n:1,v:'rondas'}),bk('ct_wait',{t:1.5})]),
      bk('sn_play',{s:'win'}),bk('gm_win')),
    st(30,420,bk('ev_start'),bk('ct_until',{a:'vidas',o:'<',b:1}),bk('gm_lose'))];return g}};

T.taller={group:'clasico',name:'Taller sin carcasas',color:'#0ea5e9',desc:'Busca las 6 piezas del móvil por el taller y llévalas a la mesa de montaje sin tocar las chispas.',make(){
  const g=base(0,{name:'Mi Taller sin carcasas',desc:'Recoge pantalla, batería, placa, cámara, altavoz y chip, y monta el móvil en la mesa.',vars:['piezas'],sky:'nublado'});const o=g.objects;
  o.push(spawn(0,.5,-14));o.push(sign('Cartel',[-9,3,-12],'Busca las 6 piezas'));
  o.push(B('Suelo del taller',[0,.1,0],[56,.2,56],'#cbd5e1',{mat:'metal',collide:false}));
  [[0,28,56,1],[0,-28,56,1],[28,0,1,56],[-28,0,1,56]].forEach(([x,z,w,d],i)=>o.push(B('Pared '+(i+1),[x,4,z],[w,8,d],'#94a3b8',{mat:'ladrillo'})));
  o.push(B('Mesa de montaje',[0,1.5,0],[10,3,6],'#7c5c46',{mat:'madera'}));o.push(obj('bloque','Alfombrilla',[0,3.1,0],[8,.2,4],'#21c4b0',{mat:'neon',scripts:[st(30,40,bk('ev_start'),say('Mesa de montaje')),
    st(30,170,bk('ev_touch'),iff('piezas','≥',6,[bk('sn_play',{s:'levelup'}),msg('¡Móvil montado! Encendiendo…',2),bk('ct_wait',{t:2}),bk('sn_play',{s:'phone'}),bk('gm_win')]))]}));
  const P=[['Pantalla',[-20,1.5,-18],[3,.3,5],'#0f172a'],['Batería',[20,1.5,-18],[2.5,.6,4],'#22c55e'],['Placa',[-20,9.5,18],[3,.3,4],'#15803d'],['Cámara',[20,1,18],[1.4,1.4,1.4],'#1f2937'],['Altavoz',[0,13.5,22],[2,1,2],'#475569'],['Chip',[-6,1,20],[1.4,.4,1.4],'#facc15']];
  P.forEach(([n,p,sz,c])=>o.push(obj('bloque',n,p,sz,c,{mat:'metal',collide:false,scripts:[st(30,40,bk('ev_start'),say(n),forever(bk('mv_spin',{g:360,t:3}))),st(30,200,bk('ev_touch'),bk('vr_add',{n:1,v:'piezas'}),bk('sn_play',{s:'place'}),msg('¡'+n+' conseguida!',1.4),bk('gm_destroy'))]})));
  [[-20,2,18],[-20,4.5,14],[-20,7,10]].forEach((p,i)=>o.push(B('Estantería '+(i+1),p,[6,1,4],'#a16207',{mat:'madera'})));
  [[-4,3,12],[0,6,14],[4,9,16],[4,11.5,20]].forEach((p,i)=>o.push(B('Caja '+(i+1),p,[4,1,4],'#d97706',{mat:'madera'})));o.push(B('Repisa alta',[0,12.5,22],[6,1,4],'#a16207',{mat:'madera'}));
  [[-8,1,-6,16],[8,1,8,-16]].forEach(([x,y,z,dx],i)=>o.push(obj('esfera','Chispa '+(i+1),[x,y+.5,z],[1.6,1.6,1.6],'#fde047',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_move',{x:dx,y:0,z:0,t:2.4}),bk('mv_move',{x:-dx,y:0,z:0,t:2.4}))),st(30,200,bk('ev_touch'),bk('sn_play',{s:'boom'}),msg('¡Calambrazo!',1.2),bk('pl_kill'))]})));
  o.push(obj('bloque','Charco de aceite',[14,.25,0],[8,.3,8],'#111827',{mat:'hielo',scripts:[st(30,40,bk('ev_touch'),msg('¡Cuidado, resbala!',1))]}));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'piezas'}),bk('gm_timer',{m:'start'}),bk('sn_music',{m:'neon'}),msg('Busca las 6 piezas y llévalas a la mesa de montaje',3.5),bk('ct_until',{a:'piezas',o:'≥',b:6}),msg('¡Ya las tienes todas! Ve a la mesa',3))];return g}};

T.reparar={group:'clasico',name:'Reparar móviles',color:'#f97316',desc:'Coge recambios de la estantería y arregla los móviles de los clientes de la tienda.',make(){
  const g=base(0,{name:'Mi tienda de reparaciones',desc:'Toca a cada cliente para ver qué le pasa, coge el recambio correcto y arréglalo. Repara 4 móviles.',vars:['pantallas','baterias','reparados','dinero']});const o=g.objects;
  o.push(spawn(0,.5,-10));o.push(B('Suelo de la tienda',[0,.1,0],[40,.2,36],'#e9c99a',{mat:'madera',collide:false}));
  [[0,18,40,1],[20,0,1,36],[-20,0,1,36]].forEach(([x,z,w,d],i)=>o.push(B('Pared '+(i+1),[x,4,z],[w,8,d],'#f2f3f3')));
  o.push(B('Mostrador',[0,1.5,6],[16,3,3],'#1b2a35'));o.push(sign('Cartel',[0,7,17.4],'REPARACIONES'));
  const shelf=(n,v,x,c)=>{o.push(B('Estante '+n,[x,1.5,14],[6,3,3],'#7c5c46',{mat:'madera'}));o.push(obj('cilindro','Coger '+n,[x,3.4,14],[2.4,.6,2.4],c,{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),say(n)),st(30,170,bk('ev_click'),bk('vr_add',{n:1,v}),bk('sn_play',{s:'pop'}),msg('Coges una '+n.toLowerCase(),1.2))]}))};
  shelf('Pantalla','pantallas',-12,'#38bdf8');shelf('Batería','baterias',12,'#22c55e');
  const C=[['Lucía','Pantalla rota','pantallas',-13,'#ff66cc'],['Marco','Batería mala','baterias',-4.5,'#00a2ff'],['Nora','Pantalla rajada','pantallas',4.5,'#f5cd30'],['Iker','Se apaga solo','baterias',13,'#4b974b']];
  C.forEach(([n,prob,v,x,c],i)=>o.push(obj('persona',n,[x,2.5,0],[3,5,1.5],c,{scripts:[st(30,40,bk('ev_start'),say(n+': '+prob)),
    st(30,200,bk('ev_click'),iff(v,'≥',1,[bk('vr_add',{n:-1,v}),bk('sn_play',{s:'place'}),say('Reparando…'),bk('ct_wait',{t:1.2}),bk('vr_add',{n:1,v:'reparados'}),bk('vr_add',{n:25,v:'dinero'}),bk('sn_play',{s:'cash'}),say('¡Gracias! Funciona perfecto'),bk('ct_wait',{t:1.2}),bk('mv_move',{x:0,y:0,z:-14,t:1.5}),bk('gm_destroy')],[bk('sn_play',{s:'error'}),say('Necesito '+(v==='pantallas'?'una pantalla nueva':'una batería nueva'))]))]})));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'reparados'}),bk('vr_show',{v:'dinero'}),bk('vr_show',{v:'pantallas'}),bk('vr_show',{v:'baterias'}),bk('sn_music',{m:'bienvenida'}),msg('Toca a un cliente para saber qué le pasa',3),bk('ct_until',{a:'reparados',o:'≥',b:4}),msg('¡Has arreglado todos los móviles!',2),bk('gm_win'))];return g}};

T.tesoro={group:'clasico',name:'La isla del tesoro',color:'#06b6d4',desc:'Explora una isla y encuentra las 8 gemas escondidas siguiendo las pistas de los carteles.',make(){
  const g=base(0,{name:'Mi isla del tesoro',desc:'Hay 8 gemas escondidas en la isla. Lee los carteles para encontrarlas.',vars:['gemas'],sky:'atardecer',base:false});const o=g.objects;
  o.push(spawn(0,1.5,-20));o.push(obj('cilindro','Isla',[0,.5,0],[70,1,70],'#fde68a',{mat:'arena'}));o.push(obj('cilindro','Hierba',[0,1.1,6],[40,.2,40],'#84cc16',{mat:'cesped',collide:false}));
  o.push(obj('bloque','Mar',[0,-1,0],[200,1,200],'#0284c7',{mat:'hielo',scripts:[st(30,40,bk('ev_touch'),bk('sn_play',{s:'splash'}),msg('¡Al agua! Vuelves a la playa',1.5),bk('pl_kill'))]}));
  [[-22,-8],[24,-6],[-14,22],[18,20],[2,28]].forEach(([x,z])=>o.push(...palm(x,z)));
  o.push(B('Montaña',[10,5,10],[14,10,14],'#78716c',{mat:'ladrillo'}));o.push(B('Escalón de roca 1',[2,2,1],[4,2,4],'#a8a29e'));o.push(B('Escalón de roca 2',[3,4.5,-3],[4,1,4],'#a8a29e'));o.push(B('Escalón de roca 3',[8,7,-3],[4,1,4],'#a8a29e'));
  o.push(B('Cueva techo',[-18,5,8],[10,1,8],'#57534e'));o.push(B('Cueva pared 1',[-23,2.5,8],[1,5,8],'#57534e'));o.push(B('Cueva pared 2',[-18,2.5,12],[10,5,1],'#57534e'));
  o.push(B('Barco hundido',[26,1.5,24],[10,3,5],'#7c5c46',{mat:'madera',rot:30}));o.push(obj('cilindro','Mástil',[26,6,24],[.6,8,.6],'#7c5c46',{mat:'madera'}));
  const G=[[-22,3,-8,'#ef4444'],[10,11,10,'#a855f7'],[-19,1.8,8,'#22c55e'],[26,3.6,24,'#3b82f6'],[2,1.8,28,'#f59e0b'],[-30,1.8,-24,'#ec4899'],[30,1.8,-26,'#14b8a6'],[24,9.3,-6,'#eab308']];
  G.forEach(([x,y,z,c],i)=>o.push(obj('cuna','Gema '+(i+1),[x,y,z],[1.6,2,1.6],c,{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_spin',{g:360,t:2.5}))),st(30,200,bk('ev_touch'),bk('vr_add',{n:1,v:'gemas'}),bk('sn_play',{s:'lucky'}),msg('¡Gema encontrada!',1.2),bk('gm_destroy'))]})));
  [['Sube a la montaña',[0,3,-14]],['Mira en la cueva',[-12,3,-2]],['Busca en el barco',[16,3,14]],['Mira las palmeras',[-6,3,-26]],['Recorre la orilla',[22,3,-30]]].forEach(([t,p])=>o.push(sign('Pista',p,t,'#a16207')));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'gemas'}),bk('gm_timer',{m:'start'}),bk('sn_music',{m:'aventura'}),msg('¡Encuentra las 8 gemas de la isla!',3),bk('ct_until',{a:'gemas',o:'≥',b:8}),bk('sn_play',{s:'win'}),bk('gm_win'))];return g}};

T.espacial={group:'clasico',name:'Salto espacial',color:'#6366f1',desc:'Gravedad baja: salta de asteroide en asteroide, coge estrellas y llega al cohete.',make(){
  const g=base(0,{name:'Mi Salto espacial',desc:'Con gravedad baja saltas muy alto. Llega al cohete sin caer al vacío.',vars:['estrellas'],sky:'espacio',base:false,grav:26,jump:22,speed:15});const o=g.objects;
  o.push(spawn(0,.5,0));o.push(B('Base lunar',[0,0,0],[12,1,12],'#cbd5e1',{mat:'metal'}));
  let x=0,y=0,z=0;const C=['#8b5cf6','#22d3ee','#f472b6','#a3e635','#facc15'];
  for(let i=1;i<=16;i++){z+=10+(i%3)*2;x=Math.round(Math.sin(i*1.3)*10);y+=i%4===0?-2:2.2;const big=i%5===0;
    o.push(obj('esfera','Asteroide '+i,[x,y,z],big?[10,3,10]:[6,2.4,6],C[i%5],{mat:i%2?'neon':'metal',scripts:i%4===2?[st(30,40,bk('ev_start'),forever(bk('mv_move',{x:0,y:3,z:0,t:2}),bk('mv_move',{x:0,y:-3,z:0,t:2})))]:[]}));
    if(i%2)o.push(obj('cuna','Estrella',[x,y+3,z],[1.6,1.6,1.6],'#fde047',{mat:'neon',collide:false,scripts:[st(30,40,bk('ev_start'),forever(bk('mv_spin',{g:360,t:2}))),st(30,200,bk('ev_touch'),bk('vr_add',{n:1,v:'estrellas'}),bk('sn_play',{s:'coin'}),bk('gm_destroy'))]}));
    if(i===8)o.push(cp(2,[x,y+1.6,z]))}
  z+=14;o.push(B('Plataforma del cohete',[0,y,z],[12,1,12],'#cbd5e1',{mat:'metal'}));
  o.push(obj('cilindro','Cohete',[0,y+5,z+2],[3,8,3],'#f8fafc',{mat:'metal',scripts:[st(30,40,bk('ev_start'),say('¡Súbete!')),st(30,170,bk('ev_touch'),bk('sn_play',{s:'whoosh'}),bk('mv_move',{x:0,y:40,z:0,t:2}),bk('gm_win'))]}));
  o.push(obj('cuna','Punta del cohete',[0,y+10.5,z+2],[3,3,3],'#e5484d',{mat:'neon',collide:false}));
  o.push(kill('Vacío espacial',[0,-14,z/2],[120,1,z+60],'#1e1b4b'));
  g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'estrellas'}),bk('gm_timer',{m:'start'}),bk('sn_music',{m:'neon'}),msg('Gravedad baja: ¡salta de asteroide en asteroide!',3.5))];return g}};

return T};
})();
