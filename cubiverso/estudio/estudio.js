/* CuboStudio · editor */
(function(){
const E=CuboEscena,CB=CuboBloques,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SK='cubostudio';
const clone=x=>JSON.parse(JSON.stringify(x));
function toast(t){const e=$('#toast');e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,2200)}
const sfx=n=>{if(window.CubiAudio)CubiAudio.sfx(n)};

/* ---------- atajos para crear programas ---------- */
const bk=(op,a,s,s2)=>{const b=CB.fresh(op);if(a)Object.assign(b.a,a);if(s)b.s=s;if(s2)b.s2=s2;return b};
const st=(x,y,...b)=>({x,y,b});
function obj(shape,name,pos,size,color,extra){return Object.assign({id:E.newId(),name,shape,pos,size,rot:0,color,mat:'plastico',anchored:true,collide:true,transp:0,scripts:[]},extra||{})}
/* objetos ya preparados, con su programa */
const PREFABS={
  moneda:{name:'Moneda',desc:'Gira y suma 1 punto al tocarla',color:'#f5cd30',make:p=>obj('cilindro','Moneda',[p[0],2.5,p[2]],[2,.5,2],'#f5cd30',{mat:'neon',collide:false,scripts:[
    st(30,40,bk('ev_start'),bk('ct_forever',{},[bk('mv_spin',{g:360,t:2})])),
    st(30,200,bk('ev_touch'),bk('vr_add',{n:1,v:'puntos'}),bk('sn_play',{s:'coin'}),bk('gm_destroy'))]})},
  lava:{name:'Lava',desc:'Si la tocas, vuelves a empezar',color:'#ff4a1c',make:p=>obj('bloque','Lava',[p[0],.5,p[2]],[8,1,8],'#ff4a1c',{mat:'neon',scripts:[st(30,40,bk('ev_touch'),bk('pl_kill'))]})},
  meta:{name:'Meta',desc:'Al tocarla, ganas la partida',color:'#3fbf6a',make:p=>obj('bloque','Meta',[p[0],.5,p[2]],[8,1,8],'#3fbf6a',{mat:'neon',scripts:[st(30,40,bk('ev_start'),bk('lk_say',{s:'META'})),st(30,170,bk('ev_touch'),bk('gm_win'))]})},
  trampolin:{name:'Trampolín',desc:'Te lanza muy alto',color:'#00a2ff',make:p=>obj('cilindro','Trampolín',[p[0],.5,p[2]],[5,1,5],'#00a2ff',{scripts:[st(30,40,bk('ev_touch'),bk('pl_launch',{n:55}))]})},
  movil:{name:'Plataforma móvil',desc:'Va y viene sin parar',color:'#ff6a00',make:p=>obj('bloque','Plataforma móvil',[p[0],6,p[2]],[6,1,6],'#ff6a00',{scripts:[
    st(30,40,bk('ev_start'),bk('ct_forever',{},[bk('mv_move',{x:0,y:0,z:14,t:2.5}),bk('ct_wait',{t:.6}),bk('mv_move',{x:0,y:0,z:-14,t:2.5}),bk('ct_wait',{t:.6})]))]})},
  control:{name:'Punto de control',desc:'Guarda por dónde vas',color:'#21c4b0',make:p=>obj('bloque','Punto de control',[p[0],.5,p[2]],[5,1,5],'#21c4b0',{mat:'neon',scripts:[st(30,40,bk('ev_touch'),bk('pl_check'))]})},
  fantasma:{name:'Bloque fantasma',desc:'Aparece y desaparece',color:'#9966ff',make:p=>obj('bloque','Bloque fantasma',[p[0],6,p[2]],[6,1,6],'#9966ff',{scripts:[
    st(30,40,bk('ev_start'),bk('ct_forever',{},[bk('ct_wait',{t:2}),bk('lk_transp',{n:80}),bk('lk_solid',{m:'no'}),bk('ct_wait',{t:2}),bk('lk_transp',{n:0}),bk('lk_solid',{m:'si'})]))]})},
  enemigo:{name:'Bola perseguidora',desc:'Te persigue; si te toca, pierdes',color:'#c4281c',make:p=>obj('esfera','Bola perseguidora',[p[0],1.5,p[2]],[3,3,3],'#c4281c',{collide:false,scripts:[
    st(30,40,bk('ev_start'),bk('ct_wait',{t:2}),bk('ct_forever',{},[bk('mv_chase',{t:1,v:7})])),st(30,240,bk('ev_touch'),bk('pl_kill'))]})},
  cartel:{name:'Cartel',desc:'Un letrero con texto',color:'#7c5c46',make:p=>obj('bloque','Cartel',[p[0],3,p[2]],[6,4,.5],'#7c5c46',{mat:'madera',scripts:[st(30,40,bk('ev_start'),bk('lk_say',{s:'¡Bienvenido!'}))]})},
  boton:{name:'Botón',desc:'Al pulsarlo envía un mensaje',color:'#e5484d',make:p=>obj('cilindro','Botón',[p[0],.4,p[2]],[3,.8,3],'#e5484d',{scripts:[st(30,40,bk('ev_click'),bk('sn_play',{s:'pop'}),bk('gm_send',{m:'abrir'}))]})},
  arbol:{name:'Árbol',desc:'Decoración',color:'#4b974b',make:p=>[obj('cilindro','Tronco',[p[0],3,p[2]],[1.4,6,1.4],'#7c5c46',{mat:'madera'}),obj('esfera','Copa',[p[0],7.5,p[2]],[6,5,6],'#4b974b',{mat:'cesped'})]},
  persona:{name:'Persona',desc:'Un personaje que habla si lo tocas',color:'#21c4b0',make:p=>obj('persona','Persona',[p[0],2.5,p[2]],[3,5,1.5],'#21c4b0',{scripts:[st(30,40,bk('ev_click'),bk('lk_say',{s:'¡Hola! ¿Qué tal?'}),bk('ct_wait',{t:3}),bk('lk_say',{s:''}))]})},
  spawn:{name:'Punto de salida',desc:'Donde aparece el jugador',color:'#a3a2a5',make:p=>obj('spawn','Salida',[p[0],.5,p[2]],[6,1,6],'#a3a2a5')}
};
/* plantillas */
const JUEGOS=window.CuboPlantillas?CuboPlantillas({obj,bk,st,PF:PREFABS,E}):{};
function template(kind){if(JUEGOS[kind]){const g=JUEGOS[kind].make();return g}const g=E.blank();
  if(kind==='obby'){g.name='Mi obby';g.desc='Llega hasta la meta sin caer en la lava.';g.vars=['puntos'];
    const o=g.objects;let z=0;
    for(let i=0;i<6;i++){z+=9;o.push(obj('bloque','Plataforma '+(i+1),[(i%2?4:-4),1+i*1.5,z],[5,1,5],['#00a2ff','#f5cd30','#ff6a00','#4b974b','#ff66cc','#21c4b0'][i]))}
    const lava=PREFABS.lava.make([0,0,30]);lava.size=[40,1,70];lava.pos=[0,.1,32];o.push(lava);
    const cp=PREFABS.control.make([0,0,0]);cp.pos=[0,9.5,64];cp.size=[6,1,6];o.push(cp);
    const mv=PREFABS.movil.make([0,0,0]);mv.pos=[0,9.5,72];o.push(mv);
    o.push(obj('cuna','Rampa',[0,12.5,100],[6,6,8],'#a3a2a5'));o.push(obj('bloque','Torre',[0,7.5,108],[6,15,8],'#a3a2a5'));
    const m=PREFABS.meta.make([0,0,0]);m.pos=[0,15.5,108];m.size=[6,1,8];o.push(m);
    const lava2=PREFABS.lava.make([0,0,0]);lava2.pos=[0,.1,92];lava2.size=[40,1,40];o.push(lava2);
    g.scripts=[st(30,40,bk('ev_start'),bk('gm_timer',{m:'start'}),bk('gm_msg',{s:'¡Llega a la meta!',t:3}))]}
  if(kind==='monedas'){g.name='Caza de monedas';g.desc='Recoge las 10 monedas antes de que se acabe el tiempo.';g.sky='atardecer';
    for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=14+(i%3)*7;g.objects.push(PREFABS.moneda.make([Math.round(Math.cos(a)*r),0,Math.round(Math.sin(a)*r)]))}
    g.objects.push(obj('bloque','Colina',[16,2,-10],[10,4,10],'#4b974b',{mat:'cesped'}));g.objects.push(PREFABS.arbol.make([-18,0,10])[0],PREFABS.arbol.make([-18,0,10])[1]);
    g.scripts=[st(30,40,bk('ev_start'),bk('vr_show',{v:'puntos'}),bk('gm_timer',{m:'start'}),bk('gm_msg',{s:'¡Recoge 10 monedas!',t:3}),bk('ct_until',{a:'puntos',o:'=',b:10}),bk('gm_win')),
      st(30,330,bk('ev_start'),bk('ct_until',{a:'@crono',o:'>',b:60}),bk('gm_lose'))]}
  return g}

/* ---------- proyectos ---------- */
function loadAll(){try{return JSON.parse(localStorage.getItem(SK)||'{}')||{}}catch(e){return{}}}
let ALL=loadAll();ALL.list=ALL.list||{};
let G=null;          // juego abierto
let sel='juego';     // id del objeto elegido o 'juego'
let tool='sel',snap=1;
let undoS=[],redoS=[],lastSnap=null;
function newProject(kind){const g=template(kind);g.id='p'+Date.now().toString(36);g.created=Date.now();ALL.list[g.id]=g;ALL.last=g.id;open(g.id);persist(true)}
function open(id){G=ALL.list[id];if(!G)return;ALL.last=id;sel='juego';undoS=[];redoS=[];lastSnap=JSON.stringify(G);rebuild();refreshAll();focusAll();persist(true)}
let saveT=null;
function persist(now){clearTimeout(saveT);const f=()=>{if(G)G.updated=Date.now();try{localStorage.setItem(SK,JSON.stringify(ALL));$('#saved').textContent='Guardado'}catch(e){$('#saved').textContent='¡Sin espacio para guardar!'}};if(now)f();else{$('#saved').textContent='Guardando…';saveT=setTimeout(f,500)}}
/* cada cambio: guarda una copia para deshacer */
function commit(){const s=JSON.stringify(G);if(s===lastSnap)return;G.touched=1;undoS.push(lastSnap);if(undoS.length>60)undoS.shift();redoS=[];lastSnap=s;persist();updUndo()}
function undo(){if(!undoS.length)return;redoS.push(lastSnap);lastSnap=undoS.pop();restoreSnap(lastSnap)}
function redo(){if(!redoS.length)return;undoS.push(lastSnap);lastSnap=redoS.pop();restoreSnap(lastSnap)}
function restoreSnap(s){const id=G.id;const g=JSON.parse(s);ALL.list[id]=g;G=g;if(sel!=='juego'&&!byId(sel))sel='juego';rebuild();refreshAll();persist();updUndo()}
function updUndo(){$('#bundo').disabled=!undoS.length;$('#bredo').disabled=!redoS.length}
const byId=id=>G.objects.find(o=>o.id===id);
const cur=()=>sel==='juego'?null:byId(sel);

/* ---------- vista 3D ---------- */
const vp=$('#vp');
const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;vp.prepend(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(60,1,.2,1200);
scene.add(new THREE.HemisphereLight(0xffffff,0x667788,.75));const sun=new THREE.DirectionalLight(0xfff2dd,.85);sun.position.set(60,120,40);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-120,right:120,top:120,bottom:-120,far:400});scene.add(sun);
let worldGrp=null;const meshes=new Map();
const cam={t:new THREE.Vector3(0,2,10),yaw:.7,pitch:.55,dist:46};
function placeCam(){const cp=Math.cos(cam.pitch);camera.position.set(cam.t.x+Math.sin(cam.yaw)*cp*cam.dist,cam.t.y+Math.sin(cam.pitch)*cam.dist,cam.t.z+Math.cos(cam.yaw)*cp*cam.dist);camera.lookAt(cam.t)}
function resize(){const r=vp.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(vp);
function rebuild(){meshes.forEach(m=>scene.remove(m));meshes.clear();if(worldGrp)scene.remove(worldGrp);
  worldGrp=E.world(THREE,scene,G).grp;sun.intensity=(E.SKIES[G.sky]||E.SKIES.dia).sun;G.objects.forEach(o=>{const m=E.mesh(THREE,o);ghost(m,o);scene.add(m);meshes.set(o.id,m)});updSel()}
/* en el editor, lo que empieza escondido se ve como un fantasma para poder editarlo */
function ghost(m,o){if(!m||!o.hidden)return;m.visible=true;if(m.userData&&m.userData.persona)m.userData.mats.forEach(x=>{x.transparent=true;x.opacity=.28});else if(m.material){m.material.transparent=true;m.material.opacity=.28;m.material.depthWrite=false}}
function updMesh(o){let m=meshes.get(o.id);if(m&&(o.shape==='persona')!==!!(m.userData&&m.userData.persona)){scene.remove(m);m=E.mesh(THREE,o);scene.add(m);meshes.set(o.id,m)}else if(m)E.refresh(THREE,m,o);ghost(m,o);updSel()}
/* selección y asas */
const selBox=new THREE.BoxHelper(undefined,0x00a2ff);selBox.material.depthTest=false;selBox.renderOrder=998;selBox.visible=false;scene.add(selBox);
const giz=new THREE.Group();giz.renderOrder=999;scene.add(giz);
const AX=[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)],AXC=[0xff4d4d,0x4dd96b,0x4d8dff];
const gm=c=>new THREE.MeshBasicMaterial({color:c,depthTest:false,transparent:true,opacity:.95});
const handles=[];
function buildGizmo(){giz.clear();handles.length=0;const o=cur();if(!o||tool==='sel')return;
  if(tool==='move')AX.forEach((d,i)=>{[1,-1].forEach(sg=>{const g=new THREE.Group();const sh=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.6,8),gm(AXC[i]));sh.position.y=.8+.2;const hd=new THREE.Mesh(new THREE.ConeGeometry(.24,.6,14),gm(AXC[i]));hd.position.y=2;
      const hit=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,2.4,6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=1.2;g.add(sh,hd,hit);
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().multiplyScalar(sg));[sh,hd,hit].forEach(m=>{m.renderOrder=999;m.userData={kind:'move',axis:i}});giz.add(g);handles.push(sh,hd,hit)})});
  if(tool==='scale')AX.forEach((d,i)=>[1,-1].forEach(sg=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.32,14,10),gm(AXC[i]));m.renderOrder=999;m.userData={kind:'scale',axis:i,dir:sg};giz.add(m);handles.push(m)}));
  if(tool==='rot'){const t=new THREE.Mesh(new THREE.TorusGeometry(1,.06,8,48),gm(0x4dd96b));t.rotation.x=Math.PI/2;t.userData={kind:'rot'};t.renderOrder=999;
    const hit=new THREE.Mesh(new THREE.TorusGeometry(1,.22,6,32),new THREE.MeshBasicMaterial({visible:false}));hit.rotation.x=Math.PI/2;hit.userData={kind:'rot'};giz.add(t,hit);handles.push(t,hit)}
  placeGizmo()}
function placeGizmo(){const o=cur();if(!o){giz.visible=false;return}giz.visible=true;const d=camera.position.distanceTo(new THREE.Vector3(...o.pos));const k=Math.max(.6,d*.055);
  giz.position.set(...o.pos);
  if(tool==='move'){giz.rotation.set(0,0,0);giz.scale.setScalar(k);giz.children.forEach(g=>{/* separa las flechas del objeto */})}
  if(tool==='scale'){giz.rotation.set(0,(o.rot||0)*Math.PI/180,0);giz.scale.set(1,1,1);let n=0;AX.forEach((d,i)=>[1,-1].forEach(sg=>{const m=giz.children[n++];const p=[0,0,0];p[i]=sg*(o.size[i]/2+.6*k);m.position.set(...p);m.scale.setScalar(k)}))}
  if(tool==='rot'){giz.rotation.set(0,0,0);const r=Math.max(o.size[0],o.size[2])*.75+k;giz.scale.set(r,r,r)}
  if(tool==='move'){const ext=Math.max(...o.size)/2/k;giz.children.forEach((g,idx)=>{g.children.forEach(c=>{})});giz.children.forEach(g=>{g.position.set(0,0,0)});
    // empuja cada flecha hasta el borde del objeto
    let n=0;AX.forEach((d,i)=>[1,-1].forEach(sg=>{const g=giz.children[n++];g.position.copy(d.clone().multiplyScalar(sg*(o.size[i]/2)/k))}))}}
function updSel(){const o=cur();const m=o&&meshes.get(o.id);if(m){selBox.setFromObject(m);selBox.visible=true}else selBox.visible=false;buildGizmo();
  const b=$('#banchor');if(b)b.classList.toggle('on',!!(o&&o.anchored))}
/* ---------- ratón y dedos en la vista ---------- */
const ray=new THREE.Raycaster();const ndc=new THREE.Vector2();
function setRay(e){const r=renderer.domElement.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera)}
const snapV=v=>snap>0?Math.round(v/snap)*snap:Math.round(v*100)/100;
function axisParam(origin,dir){const r0=ray.ray.origin,rd=ray.ray.direction;const w0=origin.clone().sub(r0);const b=dir.dot(rd),d=dir.dot(w0),e=rd.dot(w0),den=1-b*b;if(Math.abs(den)<1e-4)return null;return (b*e-d)/den}
let act=null;const ptrs=new Map();
vp.addEventListener('contextmenu',e=>e.preventDefault());
vp.addEventListener('pointerdown',e=>{vp.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){act={kind:'pinch',d:pinchD(),m:pinchM()};return}
  const right=e.button===2||e.button===1||e.shiftKey;setRay(e);
  if(!right){// asas
    const h=ray.intersectObjects(handles,false)[0];
    if(h){const o=cur(),u=h.object.userData;const start={pos:o.pos.slice(),size:o.size.slice(),rot:o.rot||0};
      if(u.kind==='move'){const d=AX[u.axis];act={kind:'move',axis:u.axis,dir:d,o,start,t0:axisParam(new THREE.Vector3(...o.pos),d)}}
      if(u.kind==='scale'){const a=(o.rot||0)*Math.PI/180;const d=u.axis===0?new THREE.Vector3(Math.cos(a),0,-Math.sin(a)):u.axis===2?new THREE.Vector3(Math.sin(a),0,Math.cos(a)):new THREE.Vector3(0,1,0);
        act={kind:'scale',axis:u.axis,sg:u.dir,dir:d,o,start,t0:axisParam(new THREE.Vector3(...o.pos),d)}}
      if(u.kind==='rot')act={kind:'rot',o,start,x0:e.clientX};
      return}
    const hits=ray.intersectObjects([...meshes.values()],true);
    if(hits.length){let ob=hits[0].object;while(ob&&!(ob.userData&&ob.userData.id))ob=ob.parent;const id=ob&&ob.userData.id;if(!id)return;select(id);const o=byId(id);
      if(tool==='move'||tool==='sel'){const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-hits[0].point.y);const p0=new THREE.Vector3();ray.ray.intersectPlane(plane,p0);
        act={kind:'drag',o,plane,p0,start:{pos:o.pos.slice()},moved:false,x0:e.clientX,y0:e.clientY}}
      return}
    act={kind:'orbit',x:e.clientX,y:e.clientY,click:true};return}
  act={kind:'pan',x:e.clientX,y:e.clientY}});
function pinchD(){const p=[...ptrs.values()];return Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}
function pinchM(){const p=[...ptrs.values()];return {x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}}
vp.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!act)return;
  if(act.kind==='pinch'){if(ptrs.size<2)return;const d=pinchD(),m=pinchM();cam.dist=Math.max(4,Math.min(300,cam.dist*act.d/d));panBy(m.x-act.m.x,m.y-act.m.y);act.d=d;act.m=m;return}
  if(act.kind==='orbit'){const dx=e.clientX-act.x,dy=e.clientY-act.y;if(Math.hypot(dx,dy)>3)act.click=false;cam.yaw-=dx*.008;cam.pitch=Math.max(-.2,Math.min(1.5,cam.pitch+dy*.006));act.x=e.clientX;act.y=e.clientY;return}
  if(act.kind==='pan'){panBy(e.clientX-act.x,e.clientY-act.y);act.x=e.clientX;act.y=e.clientY;return}
  setRay(e);const o=act.o;
  if(act.kind==='move'&&act.t0!=null){const t=axisParam(new THREE.Vector3(...act.start.pos),act.dir);if(t==null)return;o.pos[act.axis]=snapV(act.start.pos[act.axis]+(t-act.t0));updMesh(o);fillPos()}
  if(act.kind==='scale'&&act.t0!=null){const t=axisParam(new THREE.Vector3(...act.start.pos),act.dir);if(t==null)return;let dl=(t-act.t0)*act.sg;
    let ns=Math.max(snap>0?snap:.1,snapV(act.start.size[act.axis]+dl));dl=ns-act.start.size[act.axis];o.size[act.axis]=ns;
    const c=act.dir.clone().multiplyScalar(act.sg*dl/2);o.pos=[act.start.pos[0]+c.x,act.start.pos[1]+c.y,act.start.pos[2]+c.z].map(v=>Math.round(v*1000)/1000);updMesh(o);fillPos()}
  if(act.kind==='rot'){let r=act.start.rot+(e.clientX-act.x0)*.6;r=snap>0?Math.round(r/15)*15:Math.round(r);o.rot=((r%360)+360)%360;updMesh(o);fillPos()}
  if(act.kind==='drag'){if(!act.moved&&Math.hypot(e.clientX-act.x0,e.clientY-act.y0)<5)return;if(tool==='sel'&&!act.moved){act.moved=true}act.moved=true;
    const p=new THREE.Vector3();if(!ray.ray.intersectPlane(act.plane,p))return;o.pos[0]=snapV(act.start.pos[0]+p.x-act.p0.x);o.pos[2]=snapV(act.start.pos[2]+p.z-act.p0.z);updMesh(o);fillPos()}});
function endPtr(e){ptrs.delete(e.pointerId);if(!act)return;
  if(act.kind==='orbit'&&act.click&&ptrs.size===0)select('juego');
  if(['move','scale','rot','drag'].includes(act.kind))commit();
  if(act.kind==='pinch'&&ptrs.size===1){act=null;return}
  if(ptrs.size===0)act=null}
vp.addEventListener('pointerup',endPtr);vp.addEventListener('pointercancel',endPtr);
vp.addEventListener('wheel',e=>{e.preventDefault();cam.dist=Math.max(4,Math.min(300,cam.dist*(1+Math.sign(e.deltaY)*.12)))},{passive:false});
function panBy(dx,dy){const k=cam.dist*.0016;const right=new THREE.Vector3(Math.cos(cam.yaw),0,-Math.sin(cam.yaw)),fwd=new THREE.Vector3(-Math.sin(cam.yaw),0,-Math.cos(cam.yaw));
  cam.t.addScaledVector(right,-dx*k);cam.t.addScaledVector(fwd,dy*k)}
/* teclado */
const keys={};
addEventListener('keydown',e=>{const tg=e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;if(!$('#dlg').hidden||!$('#test').hidden)return;
  const k=e.key.toLowerCase();
  if((e.ctrlKey||e.metaKey)&&k==='z'){e.preventDefault();e.shiftKey?redo():undo();return}
  if((e.ctrlKey||e.metaKey)&&k==='y'){e.preventDefault();redo();return}
  if((e.ctrlKey||e.metaKey)&&k==='d'){e.preventDefault();A.dup();return}
  if((e.ctrlKey||e.metaKey)&&k==='s'){e.preventDefault();persist(true);toast('Guardado');return}
  if(e.key==='Delete'||e.key==='Backspace'){if(cur()){e.preventDefault();A.del()}return}
  if(e.key==='F5'){e.preventDefault();A.test();return}
  if(view!=='scene')return;
  if(['1','2','3','4'].includes(k)){setTool(['sel','move','scale','rot'][+k-1]);return}
  if(k==='f'){A.focus();return}
  keys[k]=true});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
/* bucle */
let lastT=performance.now();
function frame(){const now=performance.now(),dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  if(view==='scene'){const sp=cam.dist*.9*dt;const f=new THREE.Vector3(-Math.sin(cam.yaw),0,-Math.cos(cam.yaw)),r=new THREE.Vector3(Math.cos(cam.yaw),0,-Math.sin(cam.yaw));
    if(keys.w)cam.t.addScaledVector(f,sp);if(keys.s)cam.t.addScaledVector(f,-sp);if(keys.a)cam.t.addScaledVector(r,-sp);if(keys.d)cam.t.addScaledVector(r,sp);if(keys.e)cam.t.y+=sp;if(keys.q)cam.t.y-=sp;
    placeCam();if(cur())placeGizmo();if(selBox.visible){const m=meshes.get(sel);if(m)selBox.setFromObject(m)}renderer.render(scene,camera)}
  requestAnimationFrame(frame)}
function focusAll(){const sp=G.objects.find(o=>o.shape==='spawn')||G.objects[0];cam.t.set(sp?sp.pos[0]:0,sp?sp.pos[1]:0,sp?sp.pos[2]+8:0);cam.dist=46;cam.yaw=.7;cam.pitch=.55}

/* ---------- herramientas ---------- */
function setTool(t){tool=t;$$('[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));buildGizmo()}
function select(id){sel=id||'juego';updSel();renderExplorer();renderProps();loadCode()}
function spot(){// delante de la cámara, en el suelo
  return [snapV(cam.t.x),0,snapV(cam.t.z)]}
function insert(o){const arr=Array.isArray(o)?o:[o];arr.forEach(x=>{G.objects.push(x);const m=E.mesh(THREE,x);ghost(m,x);scene.add(m);meshes.set(x.id,m)});commit();select(arr[0].id);if(tool==='sel')setTool('move');sfx('place')}
function insertShape(shape){const p=spot();const size=shape==='cuna'?[4,4,6]:shape==='esfera'?[4,4,4]:shape==='cilindro'?[4,4,4]:[4,2,4];
  const n={bloque:'Bloque',esfera:'Esfera',cilindro:'Cilindro',cuna:'Rampa'}[shape];
  insert(obj(shape,n,[p[0],size[1]/2,p[2]],size,'#a3a2a5'))}
const A={
  undo,redo,
  dup(){const o=cur();if(!o)return;const c=clone(o);c.id=E.newId();c.name=o.name;c.pos[0]+=snap>0?Math.max(snap,2):2;c.pos[2]+=snap>0?Math.max(snap,2):2;insert(c)},
  del(){const o=cur();if(!o)return;if(o.shape==='spawn'&&G.objects.filter(x=>x.shape==='spawn').length===1){toast('El juego necesita un punto de salida');return}
    G.objects=G.objects.filter(x=>x!==o);const m=meshes.get(o.id);scene.remove(m);meshes.delete(o.id);sel='juego';commit();select('juego');sfx('remove')},
  anchor(){const o=cur();if(!o)return;o.anchored=!o.anchored;commit();updSel();renderProps();toast(o.anchored?'Anclado: se queda quieto':'Sin anclar')},
  focus(){const o=cur();if(o){cam.t.set(...o.pos);cam.dist=Math.max(12,Math.max(...o.size)*3)}else focusAll()},
  test(){persist(true);const g=clone(G);g.author=authorName();try{localStorage.setItem('cubo-jugar',JSON.stringify(g))}catch(e){toast('No hay espacio para probar');return}
    const t=$('#test');t.innerHTML='<iframe src="../juegos/creado.html#prueba" title="Probando el juego" allow="fullscreen"></iframe>';t.hidden=false;setTimeout(()=>{try{t.querySelector('iframe').focus()}catch(e){}},200);sfx('open')},
  publish:openPublish,files:openFiles,prefabs:openPrefabs,
  openleft(){$('#left').classList.add('open');$('#right').classList.remove('open')},openright(){$('#right').classList.add('open');$('#left').classList.remove('open')},
  closeside(){$$('.side').forEach(s=>s.classList.remove('open'))}
};

/* ---------- IA y creación fácil ---------- */
const IA=window.CuboIA?CuboIA({obj,bk,st,PF:PREFABS,E}):null;
const IAEX=['Un jefe final dragón en el volcán','Rescata cinco gatitos perdidos en el bosque','Un tycoon de granja con ladrones','Un obby de noche sin lava con zombis y veinte monedas','Un obby en el espacio muy difícil con trampolines y plataformas que se mueven','Sobrevivir 60 segundos a 6 zombis de noche','Recoger 20 monedas en la playa','Un laberinto grande de nieve con 10 monedas','Lluvia de meteoritos en un volcán','Una torre de dulces fácil','Guerra de globos en un castillo','Una carrera rápida en la ciudad neón'];
let iaLast=null;
function iaMake(res,keep){try{if(parent!==window)parent.postMessage({cubiEvt:'ia'},'*')}catch(e){}const g=res.game;g.id='p'+Date.now().toString(36);g.created=Date.now();ALL.list[g.id]=g;ALL.last=g.id;
  if(keep&&iaLast&&iaLast.id&&ALL.list[iaLast.id]&&iaLast.id!==g.id&&!ALL.list[iaLast.id].touched)delete ALL.list[iaLast.id];
  iaLast={id:g.id,res};open(g.id);persist(true);setTimeout(snapThumb,600)}
const IAQUICK=['Más difícil','Más fácil','Más largo','Otro mundo','Añade monedas','Añade enemigos','Quita los enemigos','Sin lava','Gravedad baja','Otra versión'];
function iaResult(res,from){const g=res.game;sfx('levelup');
  const d=dialog(`<h2>${res.changes?'¡Juego cambiado!':'¡Juego creado!'}</h2><p style="margin:0"><b style="font-size:17px">${esc(g.name)}</b></p><p class="note" style="margin:0">${esc(g.desc||'')}</p>
    ${res.changes?`<p class="note" style="margin:0"><b>He cambiado:</b> ${esc(res.changes.join(' · '))}</p>`:''}
    <ul class="iasum">${res.summary.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
    ${IA&&IA.refine?`<div class="iaref"><input id="iaref" maxlength="120" placeholder="Dile qué cambiar: más difícil, en la nieve, añade 10 monedas…" aria-label="Qué quieres cambiar"><button class="tb iab" id="iarefgo">Cambiar</button></div>
    <div class="iaex">${IAQUICK.map(t=>`<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div><p class="note" id="iarefmsg" role="status" style="margin:0"></p>`:''}
    <p class="note">Detrás de esta ventana ya ves tu juego en el editor. Pruébalo, cámbialo o publícalo.</p>
    <div class="row"><button class="tb play big" data-k="play">▶ Jugar ahora</button><button class="tb" data-k="again">Otra versión</button><button class="tb" data-k="change">Cambiar algo</button></div>
    <div class="row"><button class="tb pub" data-k="pub">Publicar</button><button class="tb" data-k="edit">Abrir en el editor</button></div>`);
  const refine=txt=>{const opts=res.opts||(g.ia&&g.ia.opts);if(!opts)return;const out=IA.refine(opts,txt,g.ia&&g.ia.seed);
    if(!out){$('#iarefmsg').textContent='No he entendido qué cambiar. Prueba con «más difícil», «en la playa», «añade 5 enemigos» o «sin lava».';sfx('error');return}
    out.opts.name=out.opts.name||'';iaMake(out,true);iaResult(out,from)};
  const ri=$('#iaref');if(ri){ri.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();refine(ri.value)}});ri.addEventListener('keyup',e=>e.stopPropagation());$('#iarefgo').onclick=()=>refine(ri.value)}
  d.onclick=e=>{if(e.target.id==='dlg'){closeDlg();return}const q=e.target.closest('[data-q]');if(q){refine(q.dataset.q);return}const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;
    if(k==='play'){closeDlg();A.test()}
    if(k==='edit'){closeDlg();toast('Puedes mover, añadir y programar todo lo que ha hecho la IA')}
    if(k==='pub'){closeDlg();openPublish()}
    if(k==='again'){const r2=IA.build(res.opts||g.ia.opts);r2.opts=res.opts||g.ia.opts;iaMake(r2,true);iaResult(r2,from)}
    if(k==='change'){if(from==='easy')openEasy(res.opts);else openIA(res.opts&&res.opts.text)}}}
function openIA(text){if(!IA){toast('La IA no está disponible');return}
  const d=dialog(`<h2>Crear con IA</h2><p>Escribe qué juego quieres y la IA lo construye con piezas y bloques. Di el <b>tipo</b> (obby, monedas, zombis, laberinto, torre, carrera, esquivar, batalla, jefe final, tycoon, rescate), el <b>mundo</b> (espacio, playa, nieve, noche, volcán, dulces…), si es <b>fácil o difícil</b> y lo que quieras que tenga.</p>
    <textarea id="iatxt" class="iatxt" maxlength="300" placeholder="Por ejemplo: un obby en el espacio muy difícil con trampolines">${esc(text||'')}</textarea>
    <div class="iaex">${IAEX.map(t=>`<button class="chip" data-ex="${esc(t)}">${esc(t)}</button>`).join('')}</div>
    <p class="note" id="iamsg" role="status"></p>
    <div class="row"><button class="tb play big" id="iago">✦ Crear mi juego</button><button class="tb" data-k="easy">Prefiero elegir yo</button><button class="tb" data-close>Cerrar</button></div>
    <p class="note">También entiende números («veinte monedas»), lo que no quieres («sin lava», «sin enemigos»), el tiempo («contrarreloj», «90 segundos»), la música («con música de fiesta») y el nombre («que se llame…»). Funciona sin internet y cada vez inventa un nivel distinto; después puedes pedirle cambios.</p>`);
  const ta=$('#iatxt');setTimeout(()=>ta.focus(),50);ta.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}});ta.addEventListener('keyup',e=>e.stopPropagation());
  const go=()=>{const t=ta.value.trim();if(t.length<3){$('#iamsg').textContent='Escribe qué juego quieres, aunque sean dos palabras.';return}
    $('#iamsg').textContent='Creando tu juego…';$('#iago').disabled=true;setTimeout(()=>{try{const res=IA.crear(t);iaMake(res);iaResult(res,'ia')}catch(err){console.error(err);$('#iamsg').textContent='Algo ha fallado. Prueba a escribirlo de otra forma.';$('#iago').disabled=false}},350)};
  $('#iago').onclick=go;
  d.onclick=e=>{if(e.target.id==='dlg'||e.target.closest('[data-close]')){closeDlg();return}const x=e.target.closest('[data-ex]');if(x){ta.value=x.dataset.ex;ta.focus()}if(e.target.closest('[data-k=easy]'))openEasy()}}
function openEasy(pre){if(!IA)return;const o=Object.assign({type:'obby',theme:'normal',dif:2,size:2,extras:{},name:''},pre||{});o.extras=Object.assign({},o.extras);
  const EXTRAS={trampolin:'Trampolines',movil:'Plataformas móviles',fantasma:'Bloques fantasma',barra:'Barras giratorias',monedas:'Monedas',enemigo:'Enemigos'};
  const draw=()=>{const d=dialog(`<h2>Crear fácil</h2>
    <h3 class="ezh">1. ¿Qué tipo de juego?</h3><div class="ezg">${Object.entries(IA.TYPES).map(([k,t])=>`<button class="ez ${o.type===k?'on':''}" data-t="${k}" style="--c:${t.color}"><b>${t.name}</b><small>${t.desc}</small></button>`).join('')}</div>
    <h3 class="ezh">2. ¿Dónde?</h3><div class="iaex">${Object.entries(IA.THEMES).map(([k,t])=>`<button class="chip ${o.theme===k?'on':''}" data-w="${k}"><i style="background:${t.pal[0]}"></i>${t.name}</button>`).join('')}</div>
    <h3 class="ezh">3. ¿Cómo de difícil y de largo?</h3><div class="iaex">${[1,2,3].map(n=>`<button class="chip ${o.dif===n?'on':''}" data-d="${n}">${['','Fácil','Normal','Difícil'][n]}</button>`).join('')}<span style="width:12px"></span>${[1,2,3].map(n=>`<button class="chip ${o.size===n?'on':''}" data-s="${n}">${['','Corto','Normal','Largo'][n]}</button>`).join('')}</div>
    <h3 class="ezh">4. Extras (opcional)</h3><div class="iaex">${Object.entries(EXTRAS).map(([k,n])=>`<button class="chip ${o.extras[k]?'on':''}" data-x="${k}" aria-pressed="${!!o.extras[k]}">${o.extras[k]?'✓ ':''}${n}</button>`).join('')}</div>
    <label class="fld">Nombre (si lo dejas vacío, se inventa uno)<input id="ezname" maxlength="40" value="${esc(o.name||'')}"></label>
    <div class="row"><button class="tb play big" id="ezgo">Crear juego</button><button class="tb" data-k="ia">Describirlo con IA</button><button class="tb" data-close>Cerrar</button></div>`);
    const nm=$('#ezname');nm.addEventListener('keydown',e=>e.stopPropagation());nm.addEventListener('keyup',e=>e.stopPropagation());nm.addEventListener('input',()=>o.name=nm.value);
    $('#ezgo').onclick=()=>{o.name=nm.value.trim();o.text='';const res=IA.build(o);res.opts=o;iaMake(res);iaResult(res,'easy')};
    d.onclick=e=>{if(e.target.id==='dlg'||e.target.closest('[data-close]')){closeDlg();return}const b=e.target.closest('[data-t],[data-w],[data-d],[data-s],[data-x],[data-k]');if(!b)return;
      if(b.dataset.t)o.type=b.dataset.t;if(b.dataset.w)o.theme=b.dataset.w;if(b.dataset.d)o.dif=+b.dataset.d;if(b.dataset.s)o.size=+b.dataset.s;if(b.dataset.x)o.extras[b.dataset.x]=!o.extras[b.dataset.x];
      if(b.dataset.k==='ia'){openIA();return}sfx('click');draw()}};
  draw()}
A.ia=()=>openIA();A.facil=()=>openEasy();
addEventListener('message',e=>{if(e.data&&e.data.cuboStop){$('#test').hidden=true;$('#test').innerHTML='';if(window.CubiAudio)CubiAudio.gameMusic('nana')}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-a],[data-tool],[data-ins],[data-tab]');if(!b)return;
  if(b.dataset.tool)setTool(b.dataset.tool);
  if(b.dataset.ins)insertShape(b.dataset.ins);
  if(b.dataset.tab)setView(b.dataset.tab);
  if(b.dataset.a&&A[b.dataset.a])A[b.dataset.a](b.dataset.id)});
/* colores y materiales de la cinta */
$('#swatches').innerHTML=E.COLORS.map(c=>`<button class="sw" style="background:${c}" data-col="${c}" aria-label="Color ${c}" title="${c}"></button>`).join('');
$('#swatches').addEventListener('click',e=>{const b=e.target.closest('[data-col]');const o=cur();if(!b)return;if(!o){toast('Elige primero un objeto');return}o.color=b.dataset.col;updMesh(o);commit();renderProps();renderExplorer()});
$('#rmat').innerHTML='<option value="">Material…</option>'+Object.entries(E.MATS).map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
$('#rmat').addEventListener('change',e=>{const o=cur();const v=e.target.value;e.target.value='';if(!v)return;if(!o){toast('Elige primero un objeto');return}o.mat=v;updMesh(o);commit();renderProps()});
$('#rsnap').addEventListener('change',e=>{snap=+e.target.value});
$('#pname').addEventListener('input',e=>{G.name=e.target.value.slice(0,40);persist()});
$('#pname').addEventListener('change',()=>commit());

/* ---------- explorador ---------- */
const SH_ICON={bloque:'■',esfera:'●',cilindro:'▮',cuna:'◢',spawn:'⚑'};
function renderExplorer(){const ex=$('#explorer');const n=(G.scripts||[]).length;
  ex.innerHTML=`<button class="ex ${sel==='juego'?'on':''}" data-sel="juego" role="option" aria-selected="${sel==='juego'}"><i style="background:#16181f"></i><span class="nm">Juego (ajustes y programa general)</span>${n?`<span class="sc">${n}</span>`:''}</button>`+
    G.objects.map(o=>`<button class="ex child ${sel===o.id?'on':''}" data-sel="${o.id}" role="option" aria-selected="${sel===o.id}"><i style="background:${esc(o.color)}"></i><span class="nm">${esc(o.name)}</span>${o.scripts&&o.scripts.length?`<span class="sc">${o.scripts.length}</span>`:''}</button>`).join('')}
$('#explorer').addEventListener('click',e=>{const b=e.target.closest('[data-sel]');if(!b)return;select(b.dataset.sel);if(b.dataset.sel!=='juego'&&innerWidth>900)A.focus()});
$('#explorer').addEventListener('dblclick',e=>{const b=e.target.closest('[data-sel]');if(b&&b.dataset.sel!=='juego')setView('code')});

/* ---------- propiedades ---------- */
function renderProps(){const p=$('#props');const o=cur();
  if(!o){p.innerHTML=`<div class="pcat">Juego</div>
    <div class="pr"><label for="gp-name">Nombre</label><input id="gp-name" data-g="name" value="${esc(G.name)}" maxlength="40"></div>
    <div class="pr"><label for="gp-desc">Descripción</label><textarea id="gp-desc" data-g="desc" maxlength="300">${esc(G.desc)}</textarea></div>
    <div class="pcat">Mundo</div>
    <div class="pr"><label for="gp-sky">Cielo</label><select id="gp-sky" data-g="sky">${Object.entries(E.SKIES).map(([k,s])=>`<option value="${k}" ${G.sky===k?'selected':''}>${s.name}</option>`).join('')}</select></div>
    <div class="pr"><label for="gp-base">Suelo base</label><select id="gp-base" data-g="base"><option value="1" ${G.base!==false?'selected':''}>Sí</option><option value="0" ${G.base===false?'selected':''}>No (vacío)</option></select></div>
    <div class="pcat">Jugador</div>
    <div class="pr"><label for="gp-speed">Velocidad</label><input id="gp-speed" type="number" data-g="speed" value="${G.speed}" min="0" max="200"></div>
    <div class="pr"><label for="gp-jump">Salto</label><input id="gp-jump" type="number" data-g="jump" value="${G.jump}" min="0" max="300"></div>
    <div class="pr"><label for="gp-grav">Gravedad</label><input id="gp-grav" type="number" data-g="grav" value="${G.grav}" min="1" max="400"></div>
    <div class="pcat">Variables</div>
    <div class="pr" style="grid-template-columns:1fr"><div class="varl">${G.vars.map(v=>`<span class="chip">${esc(v)}<button data-delvar="${esc(v)}" aria-label="Quitar ${esc(v)}">×</button></span>`).join('')}</div>
      <form id="addvar" class="row" style="margin-top:4px"><input id="newvar" placeholder="nueva variable (p. ej. vidas)" maxlength="16" style="flex:1;min-width:0;background:var(--p2);border:1px solid var(--line);border-radius:5px;padding:4px 6px"><button class="tb">Añadir</button></form></div>
    <div class="pr" style="grid-template-columns:1fr"><button class="tb" data-tab="code">Programa general del juego</button></div>
    <p class="note" style="padding:6px 10px">Elige un objeto en la escena o en el explorador para cambiar sus propiedades.</p>`;return}
  p.innerHTML=`<div class="pcat">Objeto</div>
    <div class="pr"><label for="op-name">Nombre</label><input id="op-name" data-o="name" value="${esc(o.name)}" maxlength="30"></div>
    <div class="pr"><label for="op-shape">Forma</label><select id="op-shape" data-o="shape">${Object.entries(E.SHAPES).map(([k,n])=>`<option value="${k}" ${o.shape===k?'selected':''}>${n}</option>`).join('')}</select></div>
    <div class="pcat">Posición y tamaño</div>
    <div class="pr"><label>Posición</label><div class="v3">${[0,1,2].map(i=>`<input type="number" step="any" data-v="pos" data-i="${i}" value="${o.pos[i]}" aria-label="Posición ${'XYZ'[i]}">`).join('')}</div></div>
    <div class="pr"><label>Tamaño</label><div class="v3">${[0,1,2].map(i=>`<input type="number" step="any" min="0.1" data-v="size" data-i="${i}" value="${o.size[i]}" aria-label="Tamaño ${'XYZ'[i]}">`).join('')}</div></div>
    <div class="pr"><label for="op-rot">Giro</label><input id="op-rot" type="number" step="any" data-o="rot" value="${o.rot||0}"></div>
    <div class="pcat">Aspecto</div>
    <div class="pr"><label for="op-color">Color</label><input id="op-color" type="color" data-o="color" value="${esc(o.color)}"></div>
    <div class="pr"><label for="op-mat">Material</label><select id="op-mat" data-o="mat">${Object.entries(E.MATS).map(([k,n])=>`<option value="${k}" ${o.mat===k?'selected':''}>${n}</option>`).join('')}</select></div>
    <div class="pr"><label for="op-tr">Transparencia</label><input id="op-tr" type="range" min="0" max="100" data-o="transp" value="${o.transp||0}"></div>
    <div class="pr"><label for="op-hid">Visible al empezar</label><input id="op-hid" type="checkbox" data-ob="hidden" data-inv="1" ${o.hidden?'':'checked'}></div>
    <div class="pcat">Comportamiento</div>
    <div class="pr"><label for="op-col">Sólido</label><input id="op-col" type="checkbox" data-ob="collide" ${o.collide!==false?'checked':''}></div>
    <div class="pr"><label for="op-anc">Anclado</label><input id="op-anc" type="checkbox" data-ob="anchored" ${o.anchored?'checked':''}></div>
    <p class="note" style="padding:2px 10px">Si no es sólido, el jugador lo atraviesa (útil para monedas). Los objetos sin anclar pueden moverse con bloques.</p>
    <div class="pr" style="grid-template-columns:1fr"><button class="tb" data-tab="code">Programar este objeto</button></div>`}
let propT=null;
$('#props').addEventListener('input',e=>{const t=e.target;const o=cur();
  if(t.dataset.g){let v=t.value;if(['speed','jump','grav'].includes(t.dataset.g))v=+v||0;if(t.dataset.g==='base')v=v==='1';G[t.dataset.g]=v;if(t.dataset.g==='name')$('#pname').value=v;if(t.dataset.g==='sky'||t.dataset.g==='base')rebuild();clearTimeout(propT);propT=setTimeout(commit,400);return}
  if(!o)return;
  if(t.dataset.o){let v=t.value;if(t.dataset.o==='rot'||t.dataset.o==='transp')v=+v||0;o[t.dataset.o]=v;updMesh(o);if(t.dataset.o==='name'||t.dataset.o==='color')renderExplorer()}
  if(t.dataset.v){const v=+t.value;if(!isFinite(v))return;o[t.dataset.v][+t.dataset.i]=t.dataset.v==='size'?Math.max(.1,v):v;updMesh(o)}
  if(t.dataset.ob){o[t.dataset.ob]=t.dataset.inv?!t.checked:t.checked;updMesh(o)}
  clearTimeout(propT);propT=setTimeout(commit,400)});
$('#props').addEventListener('change',e=>{if(e.target.dataset.g==='sky'||e.target.dataset.g==='base'){commit()}});
$('#props').addEventListener('submit',e=>{if(e.target.id!=='addvar')return;e.preventDefault();const v=$('#newvar').value.trim().replace(/\s+/g,'_').slice(0,16);if(!v)return;
  if(G.vars.includes(v)){toast('Esa variable ya existe');return}G.vars.push(v);commit();renderProps();codeEd.refreshVars();toast('Variable creada: '+v)});
$('#props').addEventListener('click',e=>{const b=e.target.closest('[data-delvar]');if(!b)return;G.vars=G.vars.filter(v=>v!==b.dataset.delvar);commit();renderProps();codeEd.refreshVars()});
function fillPos(){const o=cur();if(!o)return;$$('#props [data-v]').forEach(i=>{if(document.activeElement!==i)i.value=o[i.dataset.v][+i.dataset.i]});const r=$('#op-rot');if(r&&document.activeElement!==r)r.value=o.rot||0}

/* ---------- programar ---------- */
let view='scene';
function setView(v){view=v;$$('#tabs [data-tab]').forEach(b=>b.classList.toggle('on',b.dataset.tab===v));$('#vp').hidden=v!=='scene';$('#code').hidden=v!=='code';if(v==='scene')resize();if(v==='code')loadCode();A.closeside()}
const codeEd=CB.mount($('#blocks'),{vars:()=>G?G.vars:['puntos'],objects:()=>G?G.objects.map(o=>o.name):[],onChange:p=>{const t=sel==='juego'?G:cur();if(!t)return;t.scripts=p;clearTimeout(propT);propT=setTimeout(()=>{commit();renderExplorer()},300)},
  onPaletteClick:op=>{codeEd.add(op);toast('Bloque añadido')}});
function loadCode(){const t=sel==='juego'?G:cur();if(!t)return;$('#codewho').textContent=sel==='juego'?'Programa general del juego':'Programa de: '+t.name;$('#tabcode').textContent=sel==='juego'?'Programar: juego':'Programar: '+t.name;
  t.scripts=t.scripts||[];codeEd.load(t.scripts)}

/* ---------- diálogos ---------- */
function dialog(html){const d=$('#dlg');d.innerHTML=`<div class="dbox" role="dialog" aria-modal="true">${html}</div>`;d.hidden=false;const f=d.querySelector('input,textarea,button');if(f&&!matchMedia('(pointer:coarse)').matches)f.focus();return d}
function closeDlg(){$('#dlg').hidden=true;$('#dlg').innerHTML=''}
$('#dlg').addEventListener('click',e=>{if(e.target.id==='dlg'||e.target.closest('[data-close]'))closeDlg()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#dlg').hidden)closeDlg()});
function thumbOf(g){return g.thumb?`style="background-image:url(${g.thumb})"`:''}
function openFiles(){const L=Object.values(ALL.list).sort((a,b)=>(b.updated||0)-(a.updated||0));
  const d=dialog(`<h2>Tus proyectos</h2><p>Todo se guarda solo. Empieza uno nuevo o abre uno que ya tienes.</p>
    <div class="ezg"><button class="ez big" data-a="ia" style="--c:#8b5cf6"><b>✦ Crear con IA</b><small>Escribe qué juego quieres y se hace solo</small></button><button class="ez big" data-a="facil" style="--c:#21c063"><b>Crear fácil</b><small>Elige tipo, mundo y dificultad en 4 toques</small></button></div>
    <h3 style="margin:4px 0 0;font-size:14px">Nuevo</h3><div class="cards">
      <button class="pc" data-new="vacio"><span class="th">Vacío</span><b>Juego vacío</b><small>Solo el suelo y la salida</small></button>
      <button class="pc" data-new="obby"><span class="th">Obby</span><b>Obby</b><small>Saltos, lava, meta</small></button>
      <button class="pc" data-new="monedas"><span class="th">Monedas</span><b>Caza de monedas</b><small>Recoge 10 en 60 s</small></button>
      <button class="pc" data-imp="1"><span class="th">Código</span><b>Importar</b><small>Pega un código de juego</small></button></div>
    <h3 style="margin:4px 0 0;font-size:14px">Plantillas completas</h3><p class="note">Juegos ya terminados para jugar al momento. Ábrelos en el editor para ver cómo están programados y cambiarlos.</p>
    <div class="cards">${Object.entries(JUEGOS).filter(([k,t])=>t.group==='clasico').map(([k,t])=>`<button class="pc" data-new="${k}"><span class="th" style="background:linear-gradient(135deg,${t.color},#16181f);color:#fff;font-weight:800;font-size:13px;text-align:center;padding:6px">${esc(t.name)}</span><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></button>`).join('')}</div>
    <h3 style="margin:4px 0 0;font-size:14px">Plantillas de los juegos de Cubiverso</h3><p class="note">Empieza con una versión sencilla de cada juego y cámbiala a tu gusto: todo está hecho con piezas y bloques que puedes ver y editar.</p>
    <div class="cards">${Object.entries(JUEGOS).filter(([k,t])=>t.group!=='clasico').map(([k,t])=>`<button class="pc" data-new="${k}"><span class="th" style="background:linear-gradient(135deg,${t.color},#16181f);color:#fff;font-weight:800;font-size:13px;text-align:center;padding:6px">${esc(t.name)}</span><b>${esc(t.name)}</b><small>${esc(t.desc)}</small></button>`).join('')}</div>
    ${L.length?`<h3 style="margin:4px 0 0;font-size:14px">Tus juegos</h3><div class="cards">${L.map(g=>`<div class="pc"><button class="th" data-open="${g.id}" ${thumbOf(g)} style="border:0;${g.thumb?`background-image:url(${g.thumb})`:''}" aria-label="Abrir ${esc(g.name)}">${g.thumb?'':'Sin imagen'}</button><b>${esc(g.name)}</b><small>${g.objects.length} objetos${g.id===G.id?' · abierto':''}</small><div class="row"><button class="tb" data-open="${g.id}">Abrir</button><button class="tb" data-delp="${g.id}" aria-label="Borrar ${esc(g.name)}">Borrar</button></div></div>`).join('')}</div>`:''}
    <div class="row"><button class="tb" data-close>Cerrar</button></div>`);
  d.onclick=e=>{const n=e.target.closest('[data-new]'),o=e.target.closest('[data-open]'),x=e.target.closest('[data-delp]'),im=e.target.closest('[data-imp]');
    if(e.target.id==='dlg'||e.target.closest('[data-close]')){closeDlg();return}
    if(n){snapThumb();newProject(n.dataset.new);closeDlg();toast('Proyecto nuevo creado')}
    if(o){snapThumb();open(o.dataset.open);closeDlg()}
    if(im)openImport();
    if(x){const id=x.dataset.delp;if(x.dataset.sure!=='1'){x.dataset.sure='1';x.textContent='¿Seguro?';return}
      if(Object.keys(ALL.list).length===1){toast('Necesitas al menos un proyecto');return}delete ALL.list[id];if(G.id===id)open(Object.keys(ALL.list)[0]);persist(true);openFiles()}}}
function openPrefabs(){const d=dialog(`<h2>Objetos preparados</h2><p>Ya traen su programa hecho. Ábrelo en «Programar» para ver cómo funcionan y cambiarlos.</p>
    <div class="cards">${Object.entries(PREFABS).map(([k,p])=>`<button class="pc" data-pf="${k}"><span class="th" style="background:${p.color}"></span><b>${p.name}</b><small>${p.desc}</small></button>`).join('')}</div>
    <div class="row"><button class="tb" data-close>Cerrar</button></div>`);
  d.onclick=e=>{if(e.target.id==='dlg'||e.target.closest('[data-close]')){closeDlg();return}const b=e.target.closest('[data-pf]');if(!b)return;const x=PREFABS[b.dataset.pf].make(spot());
    (Array.isArray(x)?x:[x]).forEach(o=>{if(o.pos[0]===0&&o.pos[2]===0&&G.objects.some(q=>q.shape==='spawn')){o.pos[2]+=10}});
    if(!G.vars.includes('puntos')&&b.dataset.pf==='moneda')G.vars.push('puntos');insert(x);closeDlg();toast(PREFABS[b.dataset.pf].name+' añadido')}}
/* código para compartir */
const b64=u8=>{let s='';for(let i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64=t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u};
async function gz(u8,inv){if(!window.CompressionStream)return null;const cs=inv?new DecompressionStream('gzip'):new CompressionStream('gzip');return new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(cs)).arrayBuffer())}
async function gameCode(g){const x=clone(g);delete x.thumb;const raw=new TextEncoder().encode(JSON.stringify(x));const z=await gz(raw).catch(()=>null);return (z?'CUBIJ1Z.':'CUBIJ1.')+b64(z||raw)}
async function readCode(c){c=String(c||'').replace(/\s+/g,'');const m=/^CUBIJ1(Z?)\.(.+)$/.exec(c);if(!m)throw new Error('Ese código no es de un juego de CuboStudio');let u=unb64(m[2]);if(m[1])u=await gz(u,true);const g=JSON.parse(new TextDecoder().decode(u));if(!g||!Array.isArray(g.objects))throw new Error('Código roto');return g}
function openImport(){const d=dialog(`<h2>Importar un juego</h2><p>Pega el código que te han pasado (empieza por CUBIJ1). Se crea una copia que puedes cambiar.</p>
  <textarea class="codebox" id="impc" placeholder="CUBIJ1…"></textarea><p class="note" id="impm"></p><div class="row"><button class="tb pub" id="impgo">Importar</button><button class="tb" data-close>Cancelar</button></div>`);
  d.onclick=null;$('#impgo').onclick=async()=>{try{const g=await readCode($('#impc').value);g.id='p'+Date.now().toString(36);g.name=(g.name||'Juego')+' (copia)';ALL.list[g.id]=g;open(g.id);closeDlg();toast('Juego importado')}catch(e){$('#impm').textContent=e.message}}}
/* miniatura de la escena */
function snapThumb(){if(!G)return;try{const keep=[selBox.visible,giz.visible];selBox.visible=false;giz.visible=false;placeCam();renderer.render(scene,camera);
  const c=document.createElement('canvas');c.width=320;c.height=180;const src=renderer.domElement;const r=Math.max(320/src.width,180/src.height);const w=src.width*r,h=src.height*r;
  c.getContext('2d').drawImage(src,(320-w)/2,(180-h)/2,w,h);G.thumb=c.toDataURL('image/jpeg',.7);selBox.visible=keep[0];giz.visible=keep[1]}catch(e){}}
function authorName(){try{const c=window.CubiCuenta&&CubiCuenta.actual();if(c)return c.name;return (window.CubiAvatar&&CubiAvatar.state().name)||'Jugador'}catch(e){return 'Jugador'}}
/* publicar */
function pubList(){try{return JSON.parse(localStorage.getItem('cubo-publicados')||'[]')}catch(e){return[]}}
async function openPublish(){if(view!=='scene'){setView('scene');await new Promise(r=>setTimeout(r,60))}snapThumb();persist(true);
  const C=window.CubiCuenta,nube=!!(C&&C.cfg&&C.uid());
  const ya=pubList().some(p=>p.id===G.id);
  const d=dialog(`<h2>${ya?'Actualizar juego publicado':'Publicar tu juego'}</h2>
    <div class="row" style="align-items:flex-start"><div class="pc" style="width:200px;max-width:100%"><span class="th" ${G.thumb?`style="background-image:url(${G.thumb})"`:''}></span></div>
      <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:10px">
      <label class="fld">Nombre<input id="pbn" maxlength="40" value="${esc(G.name)}"></label>
      <label class="fld">Descripción<textarea id="pbd" maxlength="300" placeholder="¿De qué va tu juego?">${esc(G.desc)}</textarea></label></div></div>
    <p class="note">Autor: <b>${esc(authorName())}</b>. ${nube?'Se publica en Cubiverso para todos los jugadores (necesita internet).':'Se publica en tu Cubiverso. Para que tus amigos lo jueguen, pásales el código para compartir. Cuando las cuentas estén en internet, se podrá publicar para todos.'}</p>
    <p class="note" id="pbm" role="status"></p>
    <div class="row"><button class="tb pub" id="pbgo">${ya?'Actualizar':'Publicar'}</button><button class="tb" id="pbcode">Código para compartir</button><button class="tb" data-close>Cerrar</button></div>
    <div id="pbcodebox"></div>`);
  d.onclick=e=>{if(e.target.id==='dlg'||e.target.closest('[data-close]'))closeDlg()};
  $('#pbgo').onclick=async()=>{const name=$('#pbn').value.trim()||'Mi juego';G.name=name;G.desc=$('#pbd').value.trim();$('#pname').value=name;commit();
    const g=clone(G);g.author=authorName();const entry={id:G.id,name,desc:G.desc,author:g.author,thumb:G.thumb||'',updated:Date.now(),objects:G.objects.length,game:g};
    const L=pubList().filter(p=>p.id!==G.id);L.unshift(entry);try{localStorage.setItem('cubo-publicados',JSON.stringify(L))}catch(err){$('#pbm').textContent='No hay espacio para guardarlo.';return}
    let msg='¡Publicado! Ya sale en Cubiverso, en Juegos → Creados con CuboStudio.';
    if(nube){$('#pbm').textContent='Subiendo a internet…';try{await cloudPublish(entry);msg='¡Publicado para todos! Sale en Juegos → Creados con CuboStudio.'}catch(err){msg='Publicado en tu Cubiverso, pero no se ha podido subir a internet: '+(C.nice?C.nice(err):err.message)}}
    $('#pbm').innerHTML=`<span class="okmsg">${esc(msg)}</span>`;sfx('win');try{parent.postMessage({cuboPublished:1},'*')}catch(e){}};
  $('#pbcode').onclick=async()=>{const c=await gameCode(G);$('#pbcodebox').innerHTML=`<textarea class="codebox" readonly id="pbc">${c}</textarea><div class="row" style="margin-top:6px"><button class="tb" id="pbcopy">Copiar código</button><span class="note">${c.length.toLocaleString('es')} caracteres · En Cubiverso: Juegos → «Tengo un código de juego»</span></div>`;
    $('#pbcopy').onclick=()=>{const t=$('#pbc');const ok=()=>toast('Código copiado');try{navigator.clipboard.writeText(t.value).then(ok,()=>{t.select();document.execCommand('copy');ok()})}catch(e){t.select();document.execCommand('copy');ok()}}}}
async function cloudPublish(entry){const C=window.CubiCuenta,cfg=C.cfg,uid=C.uid();const tok=await C.token();
  const url=`https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/juegos/${uid}_${entry.id}`;
  const body={fields:{name:{stringValue:entry.name},desc:{stringValue:entry.desc||''},author:{stringValue:entry.author},owner:{stringValue:uid},thumb:{stringValue:entry.thumb||''},
    game:{stringValue:JSON.stringify(entry.game)},updated:{integerValue:String(entry.updated)},objects:{integerValue:String(entry.objects)}}};
  const r=await fetch(url,{method:'PATCH',headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error((j.error&&(j.error.status||j.error.message))||('HTTP '+r.status))}}

/* ---------- empezar ---------- */
const FIRST=!Object.keys(ALL.list).length;
function openStart(){const d=dialog(`<h2>¡Bienvenido a CuboStudio!</h2><p>Aquí creas tus propios juegos en 3D. ¿Cómo quieres empezar?</p>
    <div class="ezg"><button class="ez big" data-a="ia" style="--c:#8b5cf6"><b>✦ Crear con IA</b><small>Escribe qué juego quieres y se hace solo</small></button><button class="ez big" data-a="facil" style="--c:#21c063"><b>Crear fácil</b><small>Elige tipo, mundo y dificultad</small></button><button class="ez big" data-close style="--c:#3fa7ff"><b>Editor completo</b><small>Construye pieza a pieza y programa con bloques</small></button></div>`)}
if(!ALL.last||!ALL.list[ALL.last]){const first=Object.keys(ALL.list)[0];if(first)ALL.last=first;else{const g=template('obby');g.id='p'+Date.now().toString(36);ALL.list[g.id]=g;ALL.last=g.id}}
function refreshAll(){$('#pname').value=G.name;renderExplorer();renderProps();loadCode();updUndo()}
open(ALL.last);resize();frame();
if(window.CubiAudio)CubiAudio.gameMusic('nana');
{const q=new URLSearchParams(location.search);if(q.get('ia'))setTimeout(()=>openIA(),300);else if(q.get('facil'))setTimeout(()=>openEasy(),300);else if(FIRST)setTimeout(()=>openStart(),300)}
addEventListener('beforeunload',()=>{snapThumb();persist(true)});
setInterval(()=>{if(view==='scene'&&$('#test').hidden){snapThumb();persist()}},30000);
window.CuboStudio={camera,handles,giz,meshes,get:()=>G,select,setTool,insertShape,A,PREFABS,cam};
})();
