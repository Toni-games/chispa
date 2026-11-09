/* CuboStudio · escena compartida (editor y reproductor)
   Un juego es un objeto JSON: {v,name,desc,sky,base,grav,speed,jump,vars:[...],scripts:[...],objects:[...]}
   Cada objeto: {id,name,shape,pos:[x,y,z],size:[x,y,z],rot,color,mat,anchored,collide,transp,hidden,scripts:[...]} */
(function(){
const SKIES={dia:{name:'Día',sky:0x8fd0ff,ground:0x6a8a5a,fog:[90,320],sun:.85,hemi:.75},
  atardecer:{name:'Atardecer',sky:0xffa77a,ground:0x6b4a5a,fog:[80,300],sun:.7,hemi:.6},
  noche:{name:'Noche',sky:0x0f1636,ground:0x1c2240,fog:[60,260],sun:.25,hemi:.45},
  espacio:{name:'Espacio',sky:0x05060f,ground:0x111122,fog:[200,600],sun:.6,hemi:.5},
  nublado:{name:'Nublado',sky:0xb8c2cc,ground:0x5a6670,fog:[50,220],sun:.45,hemi:.85}};
const MATS={plastico:'Plástico',neon:'Neón',madera:'Madera',metal:'Metal',cesped:'Césped',hielo:'Hielo',ladrillo:'Ladrillo',arena:'Arena'};
const SHAPES={bloque:'Bloque',esfera:'Esfera',cilindro:'Cilindro',cuna:'Cuña',persona:'Persona',spawn:'Punto de salida'};
const COLORS=['#f2f3f3','#a3a2a5','#636466','#1b2a35','#c4281c','#ff6a00','#f5cd30','#4b974b','#00a2ff','#0d69ac','#6b327c','#ff66cc','#7c5c46','#e9c99a','#21c4b0','#000000'];

/* ---------- texturas pintadas en lienzo ---------- */
const texCache={};
function canvasTex(THREE,key,draw){if(texCache[key])return texCache[key];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');draw(g);
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return texCache[key]=t}
const DRAW={
  plastico:g=>{g.fillStyle='#fff';g.fillRect(0,0,64,64);g.fillStyle='rgba(0,0,0,.08)';g.beginPath();g.arc(32,32,14,0,7);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(30,30,10,0,7);g.fill()},
  madera:g=>{g.fillStyle='#fff';g.fillRect(0,0,64,64);for(let i=0;i<9;i++){g.fillStyle=`rgba(80,40,0,${.06+(i%3)*.04})`;g.fillRect(0,i*7+(i%2),64,3)}},
  cesped:g=>{g.fillStyle='#fff';g.fillRect(0,0,64,64);for(let i=0;i<220;i++){g.fillStyle=`rgba(0,${60+Math.random()*80|0},0,.18)`;g.fillRect(Math.random()*64,Math.random()*64,2,4)}},
  ladrillo:g=>{g.fillStyle='#fff';g.fillRect(0,0,64,64);g.fillStyle='rgba(0,0,0,.25)';for(let r=0;r<4;r++){g.fillRect(0,r*16,64,2);for(let k=0;k<2;k++)g.fillRect(((r%2)*16+k*32)%64,r*16,2,16)}},
  arena:g=>{g.fillStyle='#fff';g.fillRect(0,0,64,64);for(let i=0;i<500;i++){g.fillStyle=`rgba(90,60,0,${Math.random()*.15})`;g.fillRect(Math.random()*64,Math.random()*64,1,1)}},
  metal:g=>{const gr=g.createLinearGradient(0,0,64,64);gr.addColorStop(0,'#fff');gr.addColorStop(.5,'#ccc');gr.addColorStop(1,'#fff');g.fillStyle=gr;g.fillRect(0,0,64,64)},
  base:g=>{g.fillStyle='#9aa1a8';g.fillRect(0,0,64,64);g.fillStyle='rgba(0,0,0,.1)';g.beginPath();g.arc(32,32,14,0,7);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(30,30,10,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.12)';g.strokeRect(0,0,64,64)}
};
function material(THREE,o){const col=new THREE.Color(o.color||'#a3a2a5');const op=1-(o.transp||0)/100;const tr=op<1;const m=o.mat||'plastico';let mat;
  if(m==='neon')mat=new THREE.MeshBasicMaterial({color:col,transparent:tr,opacity:op});
  else if(m==='hielo')mat=new THREE.MeshPhongMaterial({color:col.clone().lerp(new THREE.Color('#cfefff'),.5),transparent:true,opacity:Math.min(op,.75),shininess:90});
  else if(m==='metal')mat=new THREE.MeshPhongMaterial({color:col,shininess:80,specular:0x888888,transparent:tr,opacity:op,map:canvasTex(THREE,'metal',DRAW.metal)});
  else{const t=canvasTex(THREE,m,DRAW[m]||DRAW.plastico);mat=new THREE.MeshLambertMaterial({color:col,map:t,transparent:tr,opacity:op})}
  return mat}
let wedgeGeo=null;
function geometry(THREE,shape){
  if(shape==='esfera')return new THREE.SphereGeometry(.5,24,16);
  if(shape==='cilindro')return new THREE.CylinderGeometry(.5,.5,1,24);
  if(shape==='cuna'){if(wedgeGeo)return wedgeGeo;
    // cuña: base 1x1, sube de z=-.5 (alto 0) a z=+.5 (alto 1)
    const s=new THREE.Shape();s.moveTo(-.5,-.5);s.lineTo(.5,-.5);s.lineTo(.5,.5);s.lineTo(-.5,-.5);
    const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);g.rotateY(-Math.PI/2);return wedgeGeo=g}
  if(shape==='spawn')return new THREE.BoxGeometry(1,1,1);
  return new THREE.BoxGeometry(1,1,1)}
/* persona: un muñeco de bloques; su color es el de la camiseta */
function faceTex(THREE){return canvasTex(THREE,'cara',g=>{g.fillStyle='#ffd27a';g.fillRect(0,0,64,64);g.fillStyle='#222';g.fillRect(18,22,7,9);g.fillRect(39,22,7,9);g.lineWidth=4;g.strokeStyle='#222';g.beginPath();g.arc(32,36,12,.25*Math.PI,.75*Math.PI);g.stroke()})}
function persona(THREE,o){const g=new THREE.Group();const op=1-(o.transp||0)/100,tr=op<1;
  const sk=new THREE.MeshLambertMaterial({color:0xffd27a,transparent:tr,opacity:op}),sh=new THREE.MeshLambertMaterial({color:new THREE.Color(o.color||'#c4281c'),transparent:tr,opacity:op}),pa=new THREE.MeshLambertMaterial({color:0x2b3a67,transparent:tr,opacity:op});
  const add=(w,h,d,m,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=b.receiveShadow=true;g.add(b);return b};
  add(.24,.4,.5,pa,-.13,-.3,0);add(.24,.4,.5,pa,.13,-.3,0);add(.52,.34,.5,sh,0,.07,0);add(.2,.34,.45,sh,-.37,.07,0);add(.2,.34,.45,sh,.37,.07,0);add(.32,.26,.5,sk,0,.37,0);
  const f=new THREE.Mesh(new THREE.PlaneGeometry(.3,.24),new THREE.MeshBasicMaterial({map:faceTex(THREE),transparent:tr,opacity:op}));f.position.set(0,.37,.251);g.add(f);
  g.userData={id:o.id,shirt:sh,mats:[sk,sh,pa,f.material],persona:true};return g}
function mesh(THREE,o){if(o.shape==='persona'){const g=persona(THREE,o);apply(THREE,g,o);return g}const geo=geometry(THREE,o.shape);geo.__shape=o.shape;const m=new THREE.Mesh(geo,material(THREE,o));m.castShadow=m.receiveShadow=true;m.userData.id=o.id;
  if(o.shape==='spawn'){const ic=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:spawnTex(THREE),transparent:true}));ic.rotation.x=-Math.PI/2;ic.position.y=.51;m.add(ic)}
  apply(THREE,m,o);return m}
function spawnTex(THREE){return canvasTex(THREE,'spawn',g=>{g.clearRect(0,0,64,64);g.fillStyle='#fff';g.beginPath();g.arc(32,32,28,0,7);g.fill();g.fillStyle='#1b2a35';g.beginPath();g.moveTo(32,10);g.lineTo(52,46);g.lineTo(12,46);g.fill()})}
function apply(THREE,m,o){m.position.set(o.pos[0],o.pos[1],o.pos[2]);const s=o.size;
  m.scale.set(s[0],s[1],s[2]);m.rotation.set(0,(o.rot||0)*Math.PI/180,0);m.visible=!o.hidden}
function refresh(THREE,m,o){if(m.userData&&m.userData.persona){if(o.shape==='persona'){const op=1-(o.transp||0)/100;m.userData.shirt.color.set(o.color||'#c4281c');m.userData.mats.forEach(x=>{x.transparent=op<1;x.opacity=op});apply(THREE,m,o);return m}}const old=m.material;m.material=material(THREE,o);old.dispose();if(m.geometry.__shape!==o.shape){m.geometry=geometry(THREE,o.shape);m.geometry.__shape=o.shape}apply(THREE,m,o)}
/* suelo base y cielo */
function world(THREE,scene,game,o){o=o||{};const sk=SKIES[game.sky]||SKIES.dia;scene.background=new THREE.Color(sk.sky);scene.fog=new THREE.Fog(sk.sky,sk.fog[0],sk.fog[1]);
  const grp=new THREE.Group();grp.name='mundo';
  if(game.base!==false){const t=canvasTex(THREE,'base',DRAW.base).clone();t.needsUpdate=true;t.repeat.set(128,128);
    const p=new THREE.Mesh(new THREE.BoxGeometry(512,1,512),new THREE.MeshLambertMaterial({color:0xffffff,map:t}));p.position.y=-.5;p.receiveShadow=true;p.userData.base=true;grp.add(p)}
  if(game.sky==='noche'||game.sky==='espacio'){const n=600,pos=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,b=Math.random()*Math.PI*.45+.05,r=380;pos[i*3]=Math.cos(a)*Math.cos(b)*r;pos[i*3+1]=Math.sin(b)*r;pos[i*3+2]=Math.sin(a)*Math.cos(b)*r}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.6,fog:false}));grp.add(pts)}
  scene.add(grp);return {grp,sky:sk}}
/* caja que ocupa un objeto (para choques y toques) */
function aabb(o,pos,size){pos=pos||o.pos;size=size||o.size;const a=(o.rot||0)*Math.PI/180,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));
  const hx=(size[0]*c+size[2]*s)/2,hz=(size[0]*s+size[2]*c)/2,hy=size[1]/2;return {x0:pos[0]-hx,x1:pos[0]+hx,y0:pos[1]-hy,y1:pos[1]+hy,z0:pos[2]-hz,z1:pos[2]+hz}}
/* altura de la superficie de una cuña en un punto (x,z) del mundo */
function wedgeTop(o,pos,size,x,z){const a=(o.rot||0)*Math.PI/180,dx=x-pos[0],dz=z-pos[2];const lz=dx*Math.sin(a)+dz*Math.cos(a);
  const t=Math.max(0,Math.min(1,lz/size[2]+.5));return pos[1]-size[1]/2+size[1]*t}
let uid=0;function newId(){return 'o'+Date.now().toString(36)+(uid++).toString(36)}
function blank(){return {v:1,name:'Mi juego',desc:'',sky:'dia',base:true,grav:60,speed:16,jump:28,vars:['puntos'],scripts:[],
  objects:[{id:newId(),name:'Salida',shape:'spawn',pos:[0,.5,0],size:[6,1,6],rot:0,color:'#a3a2a5',mat:'plastico',anchored:true,collide:true,transp:0,scripts:[]}]}}
window.CuboEscena={SKIES,MATS,SHAPES,COLORS,mesh,refresh,apply,material,geometry,world,aabb,wedgeTop,newId,blank};
})();
