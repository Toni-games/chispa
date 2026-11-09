/* Cubiverso · avatar compartido entre la plataforma y los juegos */
(function(){
const KEY='cubiverso-v1';
const CATS=[['piel','Piel'],['cara','Caras'],['camiseta','Camisetas'],['pantalon','Pantalones'],['cabeza','Cabeza'],['accesorio','Accesorios'],['espalda','Espalda'],['animacion','Animaciones'],['gesto','Gestos']];
const I=(id,cat,name,price,extra)=>Object.assign({id,cat,name,price},extra||{});
const ITEMS=[
  I('sk1','piel','Melocotón',0,{col:'#ffd29a'}),I('sk2','piel','Canela',0,{col:'#d9a37b'}),I('sk3','piel','Avellana',0,{col:'#a8714a'}),I('sk4','piel','Chocolate',0,{col:'#7a4b2e'}),
  I('sk5','piel','Marfil',0,{col:'#f5e1c8'}),I('sk6','piel','Amarillo bloque',0,{col:'#ffcc33'}),I('sk7','piel','Verde alien',50,{col:'#7fd36b'}),I('sk8','piel','Azul hielo',50,{col:'#7ab8ff'}),
  I('sk9','piel','Lila',50,{col:'#c58bff'}),I('sk10','piel','Rojo fuego',50,{col:'#ff6b6b'}),I('sk11','piel','Robot',75,{col:'#9aa3ad'}),
  I('f1','cara','Sonrisa',0),I('f2','cara','Feliz',0),I('f3','cara','Guiño',25),I('f4','cara','Sorpresa',25),I('f5','cara','Serio',25),
  I('f6','cara','Enfadado',40),I('f7','cara','Dormido',40),I('f8','cara','Lengua fuera',40),I('f9','cara','Ojos de estrella',80),I('f10','cara','Robot',80),
  I('sh1','camiseta','Camiseta naranja',0,{col:'#ff7a2f',st:'plain'}),I('sh2','camiseta','Camiseta azul',0,{col:'#3fa7ff',st:'plain'}),
  I('sh3','camiseta','Rayas marineras',30,{col:'#ffffff',c2:'#1f4a8a',st:'stripes'}),I('sh4','camiseta','Estrella',40,{col:'#ff4f4f',c2:'#ffcc33',st:'star'}),
  I('sh5','camiseta','Sudadera verde',60,{col:'#3fd15c',c2:'#2a9a43',st:'hoodie'}),I('sh6','camiseta','Camisa y corbata',80,{col:'#f5f5f5',c2:'#c62828',st:'tie'}),
  I('sh7','camiseta','Número 10',60,{col:'#ffcc33',c2:'#1f2a44',st:'number'}),I('sh8','camiseta','Corazón',50,{col:'#ff8fc7',c2:'#e0245e',st:'heart'}),
  I('sh9','camiseta','Llamas',100,{col:'#222222',c2:'#ff7a00',st:'flame'}),I('sh10','camiseta','Esmoquin',150,{col:'#111111',c2:'#ffffff',st:'tux'}),
  I('p1','pantalon','Vaqueros',0,{col:'#2d3a5a'}),I('p2','pantalon','Negros',0,{col:'#222222'}),I('p3','pantalon','Caqui',20,{col:'#b59b6b'}),I('p4','pantalon','Rojos',30,{col:'#c62828'}),
  I('p5','pantalon','Blancos',30,{col:'#eeeeee'}),I('p6','pantalon','Camuflaje',70,{col:'#5b6b3a',camo:1}),I('p7','pantalon','Dorados',120,{col:'#ffcc33'}),
  I('h0','cabeza','Nada',0),I('h1','cabeza','Pelo corto',0,{col:'#4a2e1a'}),I('h2','cabeza','Pelo largo',30,{col:'#c98b2b'}),I('h3','cabeza','Gorra roja',40),
  I('h4','cabeza','Gorro de lana',50),I('h5','cabeza','Sombrero de copa',120),I('h6','cabeza','Corona',300),I('h7','cabeza','Casco vikingo',200),
  I('h8','cabeza','Auriculares',90),I('h9','cabeza','Pelo punk',150,{col:'#e0245e'}),
  I('a0','accesorio','Nada',0),I('a1','accesorio','Gafas',30),I('a2','accesorio','Gafas de sol',60),I('a3','accesorio','Bigote',40),I('a4','accesorio','Parche pirata',70),
  I('sk12','piel','Rosa chicle',60,{col:'#ff8fc7'}),I('sk13','piel','Naranja',60,{col:'#ff9a3d'}),I('sk14','piel','Menta',60,{col:'#8ff0c8'}),
  I('sk15','piel','Oro puro',200,{col:'#ffd23f'}),I('sk16','piel','Fantasma',120,{col:'#e8ecff'}),I('sk17','piel','Noche',120,{col:'#2a2f4a'}),
  I('f11','cara','Enamorado',50),I('f12','cara','Muerto de risa',50),I('f13','cara','Pícaro',40),I('f14','cara','Vampiro',90),I('f15','cara','Payaso',70),I('f16','cara','Gatuno',60),
  I('sh11','camiseta','Cuadros escoceses',50,{col:'#c62828',c2:'#1a1a1a',st:'checker'}),I('sh12','camiseta','Lunares',40,{col:'#ffffff',c2:'#e53935',st:'dots'}),
  I('sh13','camiseta','Galaxia',150,{col:'#1a1440',c2:'#ffffff',st:'galaxy'}),I('sh14','camiseta','Zigzag',60,{col:'#ffcc33',c2:'#1f2a44',st:'zigzag'}),
  I('sh15','camiseta','Camisa con bolsillo',40,{col:'#8bc4ff',c2:'#5a8fcc',st:'pocket'}),I('sh16','camiseta','Arcoíris',200,{col:'#ff4f4f',st:'rainbow'}),
  I('sh17','camiseta','Calavera',90,{col:'#222222',c2:'#ffffff',st:'skull'}),I('sh18','camiseta','Sudadera morada',60,{col:'#8e44ad',c2:'#6c3483',st:'hoodie'}),
  I('sh19','camiseta','Rayas rojas',30,{col:'#ffffff',c2:'#d32f2f',st:'stripes'}),I('sh20','camiseta','Camiseta rosa',10,{col:'#ff8fc7',st:'plain'}),
  I('sh21','camiseta','Camiseta negra',10,{col:'#222222',st:'plain'}),I('sh22','camiseta','Equipación azul',80,{col:'#1565c0',c2:'#ffffff',st:'number',n:'7'}),
  I('p8','pantalon','Cuadros',60,{col:'#c62828',c2:'#1a1a1a',pat:'checker'}),I('p9','pantalon','Morados',30,{col:'#6a1b9a'}),I('p10','pantalon','Verdes',30,{col:'#2e7d32'}),
  I('p11','pantalon','Rosas',30,{col:'#ff8fc7'}),I('p12','pantalon','De rayas',60,{col:'#ffffff',c2:'#1f2a44',pat:'stripes'}),I('p13','pantalon','Galaxia',150,{col:'#1a1440',c2:'#ffffff',pat:'galaxy'}),
  I('h10','cabeza','Sombrero vaquero',120),I('h11','cabeza','Casco de astronauta',350),I('h12','cabeza','Orejas de gato',80),I('h13','cabeza','Orejas de conejo',80),
  I('h14','cabeza','Aureola',200),I('h15','cabeza','Gorro de chef',70),I('h16','cabeza','Gorra con hélice',150),I('h17','cabeza','Sombrero pirata',160),
  I('a5','accesorio','Monóculo',90),I('a6','accesorio','Nariz de payaso',30),I('a7','accesorio','Gafas 3D',60),I('a8','accesorio','Visor futurista',150),
  I('a9','accesorio','Barba',50),I('a10','accesorio','Pajarita',40),
  I('b6','espalda','Guitarra',150),I('b7','espalda','Tabla de surf',120),I('b8','espalda','Alas de mariposa',220),I('b9','espalda','Alas de dragón',400),
  I('b10','espalda','Escudo',140),I('b11','espalda','Cola de dinosaurio',180),
  I('b0','espalda','Nada',0),I('b1','espalda','Mochila',50),I('b2','espalda','Capa de héroe',120),I('b3','espalda','Alas de ángel',250),I('b4','espalda','Mochila cohete',400),I('b5','espalda','Espada',180),
  I('an0','animacion','Clásica',0,{desc:'Andar y saltar normal'}),I('an1','animacion','Robot',80,{desc:'Pasos rígidos y saltos de motor'}),
  I('an2','animacion','Ninja',150,{desc:'Corre agachado y da volteretas al saltar'}),I('an3','animacion','Zombi',100,{desc:'Brazos al frente y paso torpe'}),
  I('an4','animacion','Saltarín',120,{desc:'Va dando botes al andar'}),I('an5','animacion','Superhéroe',250,{desc:'Puño arriba al saltar, pose heroica'}),
  I('an6','animacion','Bailarín',200,{desc:'Anda con ritmo y se mueve parado'}),I('an7','animacion','Pato',60,{desc:'Anda como un pato'}),
  I('ge0','gesto','Saludar',0,{dur:2.2}),I('ge1','gesto','Bailar',120,{dur:4}),I('ge2','gesto','Aplaudir',60,{dur:2.4}),
  I('ge3','gesto','Reírse',80,{dur:2.4}),I('ge4','gesto','Celebrar',90,{dur:2.6}),I('ge5','gesto','Hacer el pino',200,{dur:3.4}),
  I('ge6','gesto','Baile del robot',150,{dur:4})
];
const BY={};ITEMS.forEach(i=>BY[i.id]=i);
const DEF_EQ={piel:'sk1',cara:'f1',camiseta:'sh1',pantalon:'p1',cabeza:'h1',accesorio:'a0',espalda:'b0',animacion:'an0',gesto:'ge0'};
function defaults(){return {name:'Jugador',cubos:250,owned:ITEMS.filter(i=>!i.price).map(i=>i.id),eq:Object.assign({},DEF_EQ),daily:0,codes:{},passes:{},recent:[],history:[]}}
function state(){let s=null;try{s=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}const d=defaults();if(!s)return d;s=Object.assign(d,s);s.eq=Object.assign({},DEF_EQ,s.eq||{});
  ITEMS.forEach(i=>{if(!i.price&&!s.owned.includes(i.id))s.owned.push(i.id)});return s}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}

/* ---------- texturas ---------- */
function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h||w;return c}
function faceCanvas(face,skin){const c=cv(128),g=c.getContext('2d');g.fillStyle=skin;g.fillRect(0,0,128,128);g.fillStyle='#111';g.strokeStyle='#111';g.lineWidth=7;g.lineCap='round';
  const eyes=(h)=>{g.fillRect(38,44,12,h||20);g.fillRect(78,44,12,h||20)};
  const smile=(r,a,b)=>{g.beginPath();g.arc(64,72,r||26,(a||.15)*Math.PI,(b||.85)*Math.PI);g.stroke()};
  switch(face){
    case 'f2':eyes(18);g.beginPath();g.arc(64,74,26,0,Math.PI);g.fill();g.fillStyle='#ff6b8a';g.beginPath();g.arc(64,90,10,0,Math.PI);g.fill();break;
    case 'f3':g.fillRect(38,44,12,20);g.beginPath();g.moveTo(76,54);g.lineTo(92,54);g.stroke();smile();break;
    case 'f4':eyes(22);g.beginPath();g.arc(64,92,11,0,7);g.fill();break;
    case 'f5':eyes(16);g.beginPath();g.moveTo(44,92);g.lineTo(84,92);g.stroke();break;
    case 'f6':eyes(14);g.beginPath();g.moveTo(32,34);g.lineTo(52,42);g.moveTo(96,34);g.lineTo(76,42);g.stroke();smile(24,1.15,1.85);g.save();g.translate(0,58);smile(24,1.15,1.85);g.restore();break;
    case 'f7':g.beginPath();g.arc(44,54,9,0,Math.PI);g.stroke();g.beginPath();g.arc(84,54,9,0,Math.PI);g.stroke();g.beginPath();g.arc(64,90,6,0,7);g.stroke();
      g.font='bold 22px Arial';g.fillText('z',96,32);g.font='bold 16px Arial';g.fillText('z',108,18);break;
    case 'f8':eyes(18);smile(24,.1,.9);g.fillStyle='#ff6b8a';g.fillRect(56,92,16,16);g.beginPath();g.arc(64,108,8,0,Math.PI);g.fill();break;
    case 'f9':{const star=(x,y)=>{g.beginPath();for(let k=0;k<10;k++){const r=k%2?6:14,a=k*Math.PI/5-Math.PI/2;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}g.closePath();g.fillStyle='#ffcc33';g.fill();g.lineWidth=3;g.stroke()};star(44,54);star(84,54);g.lineWidth=7;smile();break}
    case 'f11':{const heart=(x,y)=>{g.beginPath();g.moveTo(x,y+10);g.bezierCurveTo(x-18,y-4,x-8,y-16,x,y-6);g.bezierCurveTo(x+8,y-16,x+18,y-4,x,y+10);g.fillStyle='#e0245e';g.fill()};heart(44,52);heart(84,52);g.fillStyle='#111';smile();break}
    case 'f12':g.beginPath();g.moveTo(34,56);g.lineTo(46,46);g.lineTo(58,56);g.moveTo(70,56);g.lineTo(82,46);g.lineTo(94,56);g.stroke();g.beginPath();g.arc(64,76,26,0,Math.PI);g.fill();
      g.fillStyle='#4fc3ff';g.beginPath();g.ellipse(30,70,6,12,0,0,7);g.fill();g.beginPath();g.ellipse(98,70,6,12,0,0,7);g.fill();break;
    case 'f13':eyes(18);g.beginPath();g.moveTo(74,34);g.lineTo(94,28);g.stroke();g.beginPath();g.moveTo(44,90);g.quadraticCurveTo(70,96,88,80);g.stroke();break;
    case 'f14':g.fillStyle='#b71c1c';g.fillRect(38,44,12,16);g.fillRect(78,44,12,16);g.fillStyle='#111';g.lineWidth=6;g.beginPath();g.moveTo(40,84);g.quadraticCurveTo(64,98,88,84);g.stroke();
      g.fillStyle='#fff';g.beginPath();g.moveTo(50,88);g.lineTo(56,88);g.lineTo(53,100);g.fill();g.beginPath();g.moveTo(72,88);g.lineTo(78,88);g.lineTo(75,100);g.fill();break;
    case 'f15':g.fillStyle='#3fa7ff';[[44,54],[84,54]].forEach(([x,y])=>{g.beginPath();g.moveTo(x,y-18);g.lineTo(x+8,y);g.lineTo(x,y+18);g.lineTo(x-8,y);g.fill()});g.fillStyle='#111';g.fillRect(40,46,8,14);g.fillRect(80,46,8,14);
      g.fillStyle='#e53935';g.beginPath();g.arc(64,72,10,0,7);g.fill();g.strokeStyle='#e53935';g.lineWidth=9;g.beginPath();g.arc(64,74,30,.12*Math.PI,.88*Math.PI);g.stroke();break;
    case 'f16':eyes(18);g.fillStyle='#ff8fab';g.beginPath();g.moveTo(58,72);g.lineTo(70,72);g.lineTo(64,80);g.fill();g.lineWidth=5;g.beginPath();g.moveTo(52,86);g.quadraticCurveTo(58,94,64,86);g.quadraticCurveTo(70,94,76,86);g.stroke();
      g.lineWidth=3;[[0,-6],[0,2],[0,10]].forEach(([_,d])=>{g.beginPath();g.moveTo(14,80+d);g.lineTo(42,82+d/2);g.moveTo(114,80+d);g.lineTo(86,82+d/2);g.stroke()});break;
    case 'f10':g.fillStyle='#22e5ff';g.fillRect(30,42,26,16);g.fillRect(72,42,26,16);g.fillStyle='#111';for(let k=0;k<5;k++)g.fillRect(38+k*11,84,7,12);g.strokeRect(34,80,60,20);break;
    default:eyes();smile();
  }
  return c}
function shirtCanvas(it,back){const c=cv(128),g=c.getContext('2d');g.fillStyle=it.col;g.fillRect(0,0,128,128);g.fillStyle=it.c2||'#000';
  switch(it.st){
    case 'stripes':for(let y=8;y<128;y+=26)g.fillRect(0,y,128,12);break;
    case 'star':if(!back){g.beginPath();for(let k=0;k<10;k++){const r=k%2?16:38,a=k*Math.PI/5-Math.PI/2;g.lineTo(64+Math.cos(a)*r,60+Math.sin(a)*r)}g.closePath();g.fill()}break;
    case 'hoodie':g.fillRect(0,100,128,28);if(!back){g.fillRect(30,70,68,26);g.strokeStyle='#fff';g.lineWidth=4;g.beginPath();g.moveTo(52,0);g.lineTo(52,40);g.moveTo(76,0);g.lineTo(76,40);g.stroke()}else{g.globalAlpha=.4;g.beginPath();g.arc(64,0,40,0,Math.PI);g.fill();g.globalAlpha=1}break;
    case 'tie':if(!back){g.beginPath();g.moveTo(56,0);g.lineTo(72,0);g.lineTo(70,14);g.lineTo(80,96);g.lineTo(64,112);g.lineTo(48,96);g.lineTo(58,14);g.closePath();g.fill();g.fillStyle='#ddd';g.fillRect(0,0,128,4)}break;
    case 'number':g.font='900 70px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(it.n||'10',64,68);break;
    case 'checker':g.globalAlpha=.55;for(let k=0;k<8;k++){g.fillRect(k*16,0,8,128);g.fillRect(0,k*16,128,8)}g.globalAlpha=1;break;
    case 'dots':for(let y=10;y<128;y+=24)for(let x=(y/24%2)*12+10;x<128;x+=24){g.beginPath();g.arc(x,y,6,0,7);g.fill()}break;
    case 'galaxy':{const gr=g.createRadialGradient(80,50,4,80,50,80);gr.addColorStop(0,'rgba(170,90,255,.8)');gr.addColorStop(1,'rgba(170,90,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);g.fillStyle='#fff';for(let k=0;k<40;k++){const x=(k*47)%128,y=(k*83+k*k)%128;g.fillRect(x,y,k%5?2:4,k%5?2:4)}break}
    case 'zigzag':g.strokeStyle=it.c2;g.lineWidth=10;[30,70,110].forEach(y=>{g.beginPath();for(let x=0;x<=128;x+=16)g.lineTo(x,y+((x/16)%2?-10:10));g.stroke()});break;
    case 'pocket':if(!back){g.fillRect(76,30,30,28);g.fillStyle=it.col;g.fillRect(78,32,26,24);g.fillStyle=it.c2;g.fillRect(76,30,30,5);for(let y=20;y<120;y+=22){g.beginPath();g.arc(64,y,4,0,7);g.fill()}g.fillRect(63,0,2,128)}break;
    case 'rainbow':['#ff4f4f','#ff9a3d','#ffd23f','#3fd15c','#3fa7ff','#8e44ad'].forEach((c,k)=>{g.fillStyle=c;g.fillRect(0,k*22,128,22)});break;
    case 'skull':if(!back){g.beginPath();g.arc(64,56,30,0,7);g.fill();g.fillRect(46,74,36,22);g.fillStyle=it.col;g.beginPath();g.arc(52,56,9,0,7);g.arc(76,56,9,0,7);g.fill();g.fillRect(52,84,4,12);g.fillRect(62,84,4,12);g.fillRect(72,84,4,12)}break;
    case 'heart':if(!back){g.beginPath();g.moveTo(64,100);g.bezierCurveTo(10,60,30,18,64,44);g.bezierCurveTo(98,18,118,60,64,100);g.fill()}break;
    case 'flame':for(let k=0;k<7;k++){const x=k*20;g.beginPath();g.moveTo(x-4,128);g.quadraticCurveTo(x+4,70-(k%2)*25,x+10,60-(k%3)*12);g.quadraticCurveTo(x+16,90,x+24,128);g.fill()}g.fillStyle='#ffcc33';for(let k=0;k<7;k++){const x=k*20+5;g.beginPath();g.moveTo(x,128);g.quadraticCurveTo(x+5,100,x+8,92-(k%2)*10);g.quadraticCurveTo(x+12,108,x+16,128);g.fill()}break;
    case 'tux':if(!back){g.fillStyle='#fff';g.beginPath();g.moveTo(40,0);g.lineTo(88,0);g.lineTo(64,90);g.closePath();g.fill();g.fillStyle='#111';g.beginPath();g.moveTo(50,10);g.lineTo(64,18);g.lineTo(78,10);g.lineTo(78,26);g.lineTo(64,18);g.lineTo(50,26);g.closePath();g.fill();[44,62,80].forEach(y=>{g.beginPath();g.arc(64,y,3,0,7);g.fill()})}break;
  }
  return c}
function patCanvas(pa){const c=cv(64),g=c.getContext('2d');g.fillStyle=pa.col;g.fillRect(0,0,64,64);g.fillStyle=pa.c2||'#000';
  if(pa.pat==='checker'){g.globalAlpha=.55;for(let k=0;k<4;k++){g.fillRect(k*16,0,8,64);g.fillRect(0,k*16,64,8)}g.globalAlpha=1}
  else if(pa.pat==='stripes'){for(let x=0;x<64;x+=16)g.fillRect(x,0,8,64)}
  else if(pa.pat==='galaxy'){g.fillStyle='rgba(170,90,255,.5)';g.beginPath();g.arc(40,24,22,0,7);g.fill();g.fillStyle='#fff';for(let k=0;k<20;k++)g.fillRect((k*29)%64,(k*41+k*k)%64,2,2)}
  return c}
function camoCanvas(col){const c=cv(64),g=c.getContext('2d');g.fillStyle=col;g.fillRect(0,0,64,64);['#3e4a26','#8a8a5a','#2c331b'].forEach((k,i)=>{g.fillStyle=k;for(let n=0;n<6;n++){g.beginPath();g.ellipse((n*23+i*17)%64,(n*31+i*13)%64,9,5,n,0,7);g.fill()}});return c}

/* ---------- construir el avatar ---------- */
function build(THREE,p,eq){
  eq=Object.assign({},DEF_EQ,eq||state().eq);p.eq=eq;const R=p.body||R;
  const M=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
  const tex=c=>{const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
  const box=(w,h,d,m,x,y,z,par)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);(par||R).add(o);return o};
  const cyl=(rt,rb,h,m,x,y,z,par,seg)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),m);o.position.set(x,y,z);(par||R).add(o);return o};
  // limpiar
  const keep=new Set([p.legL,p.legR,p.armL,p.armR].concat(p.keep||[]));
  R.children.slice().forEach(o=>{if(!keep.has(o))R.remove(o)});
  [p.legL,p.legR,p.armL,p.armR].forEach(gr=>gr.children.slice().forEach(o=>gr.remove(o)));
  const skin=(BY[eq.piel]||BY.sk1).col,sh=BY[eq.camiseta]||BY.sh1,pa=BY[eq.pantalon]||BY.p1;
  const skinM=M(skin),shirtM=M(sh.col);
  // torso
  box(.9,.9,.45,[shirtM,shirtM,shirtM,shirtM,M(0xffffff,{map:tex(shirtCanvas(sh,false))}),M(0xffffff,{map:tex(shirtCanvas(sh,true))})],0,1.15,0);
  // cabeza
  const faceM=M(0xffffff,{map:tex(faceCanvas(eq.cara,skin))});
  box(.55,.55,.55,[skinM,skinM,skinM,skinM,faceM,skinM],0,1.9,0);
  // piernas
  const pantsM=pa.camo?M(0xffffff,{map:tex(camoCanvas(pa.col))}):pa.pat?M(0xffffff,{map:tex(patCanvas(pa))}):M(pa.col);
  box(.44,.7,.44,pantsM,0,-.35,0,p.legL);box(.44,.7,.44,pantsM,0,-.35,0,p.legR);
  // brazos: manga + piel
  [p.armL,p.armR].forEach(a=>{box(.44,.36,.44,shirtM,0,-.18,0,a);box(.44,.5,.44,skinM,0,-.6,0,a)});
  // cabeza: accesorios
  const H=1.9;
  switch(eq.cabeza){
    case 'h1':{const m=M(BY.h1.col);box(.6,.16,.6,m,0,H+.33,0);box(.6,.3,.1,m,0,H+.15,-.26);box(.08,.22,.5,m,-.28,H+.2,-.02);box(.08,.22,.5,m,.28,H+.2,-.02);break}
    case 'h2':{const m=M(BY.h2.col);box(.62,.16,.62,m,0,H+.33,0);box(.62,.8,.12,m,0,H-.05,-.3);box(.1,.6,.55,m,-.31,H+.05,-.03);box(.1,.6,.55,m,.31,H+.05,-.03);break}
    case 'h3':{const m=M(0xd32f2f);box(.6,.18,.6,m,0,H+.36,0);box(.6,.05,.32,m,0,H+.29,.42);box(.12,.05,.12,M(0xffffff),0,H+.47,0);break}
    case 'h4':{const m=M(0x3fa7ff);cyl(.32,.32,.3,m,0,H+.34,0);cyl(.33,.33,.1,M(0xffffff),0,H+.2,0);const pm=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),M(0xffffff));pm.position.set(0,H+.56,0);R.add(pm);break}
    case 'h5':{const k=M(0x111111);cyl(.25,.25,.5,k,0,H+.55,0);cyl(.42,.42,.04,k,0,H+.3,0);cyl(.255,.255,.08,M(0xc62828),0,H+.36,0);break}
    case 'h6':{const gd=M(0xffcc33,{emissive:0x553300,emissiveIntensity:.3});cyl(.3,.3,.16,gd,0,H+.36,0,null,12);
      for(let k=0;k<6;k++){const a=k/6*Math.PI*2,c=new THREE.Mesh(new THREE.ConeGeometry(.07,.2,6),gd);c.position.set(Math.cos(a)*.27,H+.53,Math.sin(a)*.27);R.add(c)}
      const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.06),M(0xe0245e));gem.position.set(0,H+.37,.3);R.add(gem);break}
    case 'h7':{const st=M(0x9aa3ad);const hm=new THREE.Mesh(new THREE.SphereGeometry(.33,16,10,0,Math.PI*2,0,Math.PI/2),st);hm.position.set(0,H+.2,0);R.add(hm);
      cyl(.34,.34,.07,M(0x8d6e63),0,H+.22,0);[-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.ConeGeometry(.07,.35,8),M(0xfff3e0));h.position.set(s*.38,H+.42,0);h.rotation.z=-s*.7;R.add(h)});break}
    case 'h8':{const k=M(0x222222);[-1,1].forEach(s=>{box(.1,.22,.22,k,s*.31,H,0);box(.04,.16,.16,M(0x3fd15c),s*.36,H,0)});box(.66,.06,.1,k,0,H+.32,0);[-1,1].forEach(s=>box(.06,.2,.1,k,s*.31,H+.22,0));break}
    case 'h10':{const br=M(0x8d5a2b);cyl(.5,.5,.04,br,0,H+.3,0,null,24);cyl(.24,.29,.32,br,0,H+.47,0);cyl(.3,.3,.06,M(0x3e2412),0,H+.35,0);break}
    case 'h11':{const gl=new THREE.Mesh(new THREE.SphereGeometry(.46,20,16),M(0xbfe6ff,{transparent:true,opacity:.35}));gl.position.set(0,H+.02,0);R.add(gl);
      cyl(.4,.42,.14,M(0xffffff),0,H-.33,0,null,20);box(.12,.06,.04,M(0xd32f2f),.2,H-.33,.4);break}
    case 'h12':{const k=M(0x333333),pk=M(0xff8fab);[-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.11,.22,4),k);e.position.set(s*.18,H+.38,0);e.rotation.y=Math.PI/4;R.add(e);
      const i=new THREE.Mesh(new THREE.ConeGeometry(.06,.14,4),pk);i.position.set(s*.18,H+.36,.04);i.rotation.y=Math.PI/4;R.add(i)});break}
    case 'h13':{const w=M(0xffffff),pk=M(0xff8fab);[-1,1].forEach(s=>{const e=box(.1,.48,.05,w,s*.12,H+.5,0);e.rotation.z=-s*.15;const i=box(.05,.36,.02,pk,s*.12,H+.5,.03);i.rotation.z=-s*.15});break}
    case 'h14':{const r=new THREE.Mesh(new THREE.TorusGeometry(.24,.035,8,28),new THREE.MeshBasicMaterial({color:0xfff176}));r.rotation.x=Math.PI/2;r.position.set(0,H+.52,0);R.add(r);break}
    case 'h15':{const w=M(0xffffff);cyl(.3,.3,.2,w,0,H+.36,0);const pf=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),w);pf.scale.y=.7;pf.position.set(0,H+.56,0);R.add(pf);break}
    case 'h16':{const m=M(0x3fa7ff);box(.6,.18,.6,m,0,H+.36,0);box(.6,.05,.3,m,0,H+.29,.42);cyl(.03,.03,.14,M(0x777777),0,H+.52,0);
      const pr=new THREE.Group();pr.position.set(0,H+.6,0);R.add(pr);box(.55,.02,.09,M(0xff4f4f),0,0,0,pr);box(.09,.02,.55,M(0xffcc33),0,0,0,pr);pr.userData.spin=1;break}
    case 'h17':{const k=M(0x1a1a1a);box(.82,.22,.24,k,0,H+.38,0);box(.5,.14,.24,k,0,H+.53,0);box(.12,.1,.02,M(0xffffff),0,H+.43,.13);box(.84,.03,.25,M(0xffcc33),0,H+.28,0);break}
    case 'h9':{const m=M(BY.h9.col);for(let k=0;k<5;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(.08,.35,6),m);c.position.set(0,H+.42,-.2+k*.1);R.add(c)}box(.56,.06,.56,M(0x222222),0,H+.28,0);break}
  }
  switch(eq.accesorio){
    case 'a1':{const k=M(0x222222);[-1,1].forEach(s=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.07,.015,6,16),k);r.position.set(s*.13,H+.03,.29);R.add(r)});box(.08,.02,.02,k,0,H+.03,.29);break}
    case 'a2':{const k=M(0x111111);box(.48,.11,.04,k,0,H+.03,.29);box(.5,.03,.03,k,0,H+.08,.29);break}
    case 'a3':{const m=M(0x4a2e1a);box(.24,.05,.03,m,0,H-.06,.29);box(.07,.05,.03,m,-.14,H-.09,.29);box(.07,.05,.03,m,.14,H-.09,.29);break}
    case 'a5':{const gd=M(0xffcc33);const r=new THREE.Mesh(new THREE.TorusGeometry(.075,.014,6,18),gd);r.position.set(.13,H+.03,.29);R.add(r);box(.01,.32,.01,gd,.2,H-.12,.29);break}
    case 'a6':{const n=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),M(0xe53935));n.position.set(0,H-.02,.3);R.add(n);break}
    case 'a7':{box(.5,.15,.03,M(0xffffff),0,H+.03,.29);box(.17,.09,.02,M(0xff3b3b,{transparent:true,opacity:.8}),-.13,H+.03,.305);box(.17,.09,.02,M(0x22d3ee,{transparent:true,opacity:.8}),.13,H+.03,.305);break}
    case 'a8':{box(.6,.13,.06,new THREE.MeshBasicMaterial({color:0x22d3ee,transparent:true,opacity:.75}),0,H+.04,.3);box(.62,.03,.5,M(0x555c6a),0,H+.12,.04);break}
    case 'a9':{const m=M(0x5d3a1a);box(.5,.2,.08,m,0,H-.17,.27);box(.08,.3,.1,m,-.24,H-.06,.24);box(.08,.3,.1,m,.24,H-.06,.24);box(.2,.06,.04,m,0,H-.05,.3);break}
    case 'a10':{const m=M(0xd32f2f);[-1,1].forEach(s=>{const w=box(.14,.1,.04,m,s*.08,1.6,.25);w.rotation.z=s*.35});box(.05,.06,.05,M(0x8e1b1b),0,1.6,.26);break}
    case 'a4':{const k=M(0x111111);box(.14,.13,.03,k,.13,H+.03,.29);box(.58,.025,.02,k,0,H+.1,.285).rotation.z=-.25;break}
  }
  switch(eq.espalda){
    case 'b1':{const m=M(0x3f6fd8);box(.6,.62,.26,m,0,1.15,-.36);box(.5,.24,.06,M(0x2f55aa),0,1,-.51);box(.08,.6,.06,M(0x2f55aa),-.22,1.25,.24);box(.08,.6,.06,M(0x2f55aa),.22,1.25,.24);break}
    case 'b2':{const m=M(0xd32f2f,{side:THREE.DoubleSide});const c=box(.85,1.25,.03,m,0,.98,-.27);c.rotation.x=.12;box(.9,.08,.12,M(0xffcc33),0,1.58,-.22);break}
    case 'b3':{const m=M(0xffffff,{side:THREE.DoubleSide});[-1,1].forEach(s=>{const w=new THREE.Group();w.position.set(s*.12,1.35,-.26);w.rotation.y=s*.5;R.add(w);
      for(let k=0;k<4;k++){const f=new THREE.Mesh(new THREE.BoxGeometry(.75-k*.12,.16,.03),m);f.position.set(s*(.38-k*.02),.1-k*.13,0);f.rotation.z=s*(.35-k*.12);w.add(f)}});break}
    case 'b4':{const g=M(0x9aa3ad),r=M(0xd32f2f);[-1,1].forEach(s=>{cyl(.13,.13,.6,g,s*.16,1.2,-.36);const tip=new THREE.Mesh(new THREE.ConeGeometry(.13,.2,12),r);tip.position.set(s*.16,1.6,-.36);R.add(tip);
      const fl=new THREE.Mesh(new THREE.ConeGeometry(.1,.3,10),new THREE.MeshBasicMaterial({color:0xffa31a}));fl.rotation.x=Math.PI;fl.position.set(s*.16,.74,-.36);R.add(fl)});box(.2,.4,.1,M(0x555c6a),0,1.2,-.28);break}
    case 'b6':{const wd=M(0xb5651d);const b1=cyl(.24,.24,.09,wd,0,.95,-.32,null,20);b1.rotation.x=Math.PI/2;const b2=cyl(.18,.18,.09,wd,0,1.27,-.32,null,20);b2.rotation.x=Math.PI/2;
      const hole=cyl(.07,.07,.1,M(0x222222),0,1.05,-.37,null,14);hole.rotation.x=Math.PI/2;box(.07,.62,.04,M(0x4e2c10),0,1.66,-.32);box(.12,.14,.05,M(0x222222),0,2.0,-.32);
      const st=box(.06,1.15,.03,M(0x222222),0,1.2,.24);st.rotation.z=.7;break}
    case 'b7':{const m=M(0x26c6da);box(.42,1.3,.06,m,0,1.2,-.3);const t1=cyl(.21,.21,.06,m,0,1.85,-.3,null,18);t1.rotation.x=Math.PI/2;const t2=cyl(.21,.21,.06,m,0,.55,-.3,null,18);t2.rotation.x=Math.PI/2;
      box(.08,1.7,.065,M(0xffffff),0,1.2,-.3);break}
    case 'b8':{[[.3,1.42,.36,0xff9a3d],[.26,1.02,.26,0x3fa7ff]].forEach(([x,y,r,c])=>[-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.CircleGeometry(r,20),M(c,{side:THREE.DoubleSide}));w.position.set(s*x,y,-.3);w.rotation.y=s*.5;R.add(w);
      const sp=new THREE.Mesh(new THREE.CircleGeometry(r*.35,14),M(0x222222,{side:THREE.DoubleSide}));sp.position.set(s*x*1.05,y,-.31);sp.rotation.y=s*.5;R.add(sp)}));break}
    case 'b9':{const m=M(0x5b2a86,{side:THREE.DoubleSide});const sh=new THREE.Shape();[[0,0],[.95,.55],[1.05,-.1],[.78,-.28],[.58,-.1],[.38,-.32],[.16,-.12]].forEach(([x,y],k)=>k?sh.lineTo(x,y):sh.moveTo(x,y));
      [-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.ShapeGeometry(sh),m);w.position.set(s*.15,1.35,-.27);w.scale.x=s;w.rotation.y=-s*.45;R.add(w)});break}
    case 'b10':{const s1=cyl(.42,.42,.07,M(0x9aa3ad),0,1.15,-.3,null,24);s1.rotation.x=Math.PI/2;const s2=cyl(.3,.3,.08,M(0xd32f2f),0,1.15,-.31,null,24);s2.rotation.x=Math.PI/2;
      const bo=new THREE.Mesh(new THREE.SphereGeometry(.09,12,10),M(0xffcc33));bo.position.set(0,1.15,-.37);R.add(bo);break}
    case 'b11':{const m=M(0x43a047);[[.2,.7,-.38],[.16,.6,-.62],[.12,.5,-.84],[.08,.42,-1.02]].forEach(([r,y,z],k)=>{const c=new THREE.Mesh(new THREE.ConeGeometry(r,.4,10),m);c.rotation.x=-Math.PI/2-.25;c.position.set(0,y,z);R.add(c);
      const sp=new THREE.Mesh(new THREE.ConeGeometry(.05,.12,4),M(0xffcc33));sp.position.set(0,y+r*.8,z);R.add(sp)});break}
    case 'b5':{const bl=box(.08,.95,.03,M(0xdfe6ee),0,1.3,-.27);bl.rotation.z=.6;const gu=box(.32,.07,.07,M(0x8d6e63),0,1.3,-.27);gu.rotation.z=.6;gu.position.set(-.24,.94,-.27);const hi=box(.06,.25,.06,M(0x5d4037),0,0,-.27);hi.rotation.z=.6;hi.position.set(-.33,.82,-.27);break}
  }
  R.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  return R;
}
function makeAvatar(THREE,eq){
  const root=new THREE.Group(),body=new THREE.Group(),legL=new THREE.Group(),legR=new THREE.Group(),armL=new THREE.Group(),armR=new THREE.Group();
  root.add(body);
  legL.position.set(-.225,.7,0);legR.position.set(.225,.7,0);armL.position.set(-.67,1.55,0);armR.position.set(.67,1.55,0);body.add(legL,legR,armL,armR);
  const parts={root,body,legL,legR,armL,armR};build(THREE,parts,eq);return parts;
}
/* ---------- animaciones ----------
   animate(a,{walk,moving,air,climb,dt}) · llamar cada fotograma.
   Usa el paquete equipado (a.eq.animacion) y el gesto activo (a._emote). */
const EMOTES=ITEMS.filter(i=>i.cat==='gesto');
function emote(a,id){const it=BY[id];if(!it||it.cat!=='gesto')return;a._emote={id,t:0,dur:it.dur||2.5}}
function animate(a,o){o=o||{};const dt=Math.min(.1,o.dt||1/60);a._t=(a._t||0)+dt;const T=a._t;
  const L=a.legL,Rr=a.legR,AL=a.armL,AR=a.armR,B=a.body;if(!L)return;
  [L,Rr,AL,AR].forEach(g=>{g.rotation.set(0,0,0)});
  if(B){B.position.set(0,0,0);B.rotation.set(0,0,0)}
  const air=!!o.air,climb=!!o.climb;let mv=o.moving;if(mv===undefined)mv=Math.abs(Math.sin(o.walk||0))>.02?1:0;mv=+mv;
  if(air)a._airT=(a._airT||0)+dt;else a._airT=0;
  if(mv>.1||air||climb)a._emote=null;
  const w=o.walk||0,s=Math.sin(w),c=Math.cos(w);
  const pack=o.pack||(a.eq&&a.eq.animacion)||'an0';
  // gesto activo
  if(a._emote){const e=a._emote;e.t+=dt;const t=e.t;if(t>e.dur){a._emote=null}else{
    switch(e.id){
      case 'ge0':AR.rotation.x=-2.9;AR.rotation.z=.35+Math.sin(t*12)*.35;break;
      case 'ge1':{const q=Math.sin(t*7);AL.rotation.x=-2.5+q*.5;AR.rotation.x=-2.5-q*.5;AL.rotation.z=-.4;AR.rotation.z=.4;L.rotation.x=Math.max(0,q)*.6;Rr.rotation.x=Math.max(0,-q)*.6;
        if(B){B.position.y=Math.abs(q)*.15;B.rotation.y=Math.sin(t*3.5)*.6;B.rotation.z=q*.12}break}
      case 'ge2':{const k=Math.abs(Math.sin(t*14));AL.rotation.x=AR.rotation.x=-1.35;AL.rotation.z=.15+k*.35;AR.rotation.z=-.15-k*.35;break}
      case 'ge3':AL.rotation.x=AR.rotation.x=-.6;AL.rotation.z=.5;AR.rotation.z=-.5;if(B){B.rotation.x=-.25+Math.sin(t*28)*.06;B.position.y=Math.abs(Math.sin(t*14))*.05}break;
      case 'ge4':{const j=Math.abs(Math.sin(t*6));AL.rotation.x=AR.rotation.x=-2.9;AL.rotation.z=-.5+Math.sin(t*18)*.15;AR.rotation.z=.5-Math.sin(t*18)*.15;L.rotation.x=Rr.rotation.x=j*.3;if(B)B.position.y=j*.6;break}
      case 'ge5':{const k=Math.min(1,t/.4,(e.dur-t)/.4);AL.rotation.x=AR.rotation.x=-Math.PI*k;L.rotation.z=-.35*k-Math.sin(t*5)*.1*k;Rr.rotation.z=.35*k+Math.sin(t*5)*.1*k;
        if(B){B.rotation.x=Math.PI*k;B.position.y=2.4*k;B.position.z=0}break}
      case 'ge6':{const st=Math.floor(t*4)%4,poses=[[-1.6,0,0,.9],[0,-1.6,-.9,0],[-3,-.2,0,0],[-.2,-3,0,0]],P=poses[st];
        AL.rotation.x=P[0];AR.rotation.x=P[1];AL.rotation.z=P[2];AR.rotation.z=P[3];if(B)B.rotation.y=[-.4,.4,0,0][st];L.rotation.x=st%2?.3:0;break}
    }
    return}}
  if(climb){const q=Math.sin(T*9)*(mv>.1?1:.15);AL.rotation.x=-2.7+q*.45;AR.rotation.x=-2.7-q*.45;L.rotation.x=-.6-q*.5;Rr.rotation.x=-.6+q*.5;return}
  const idle=!air&&mv<=.1,br=Math.sin(T*2.2);
  switch(pack){
    case 'an1':{ // robot
      const q=Math.sign(s)*(Math.abs(s)>.3?1:0);
      if(idle){AL.rotation.x=AR.rotation.x=0;if(B)B.rotation.y=Math.round(Math.sin(T*.8)*2)/2*.25}
      else{L.rotation.x=q*.55;Rr.rotation.x=-q*.55;AL.rotation.x=-1.2+q*.3;AR.rotation.x=-1.2-q*.3;}
      if(air){AL.rotation.x=AR.rotation.x=-1.57;L.rotation.x=Rr.rotation.x=0}break}
    case 'an2':{ // ninja
      if(idle){AL.rotation.x=-.4+br*.03;AR.rotation.x=.3;AR.rotation.z=-.2;L.rotation.x=.25;Rr.rotation.x=-.25;if(B)B.rotation.x=.08;}
      else{L.rotation.x=s*1.1;Rr.rotation.x=-s*1.1;AL.rotation.x=AR.rotation.x=1.25;AL.rotation.z=-.2;AR.rotation.z=.2;if(B){B.rotation.x=.38;B.position.y=-.05}}
      if(air){const f=Math.min(1,a._airT/.55);if(B){B.rotation.x=f<1?f*Math.PI*2:0;B.position.y=f<1?Math.sin(f*Math.PI)*.4:0}L.rotation.x=Rr.rotation.x=-1.2*Math.sin(f*Math.PI);AL.rotation.x=AR.rotation.x=-.8}break}
    case 'an3':{ // zombi
      AL.rotation.x=-1.5+Math.sin(T*1.5)*.08;AR.rotation.x=-1.45+Math.sin(T*1.5+1)*.08;
      if(!idle){L.rotation.x=s*.45;Rr.rotation.x=-s*.45;if(B){B.rotation.z=s*.14;B.rotation.x=.12}}else if(B)B.rotation.z=Math.sin(T*1.2)*.06;
      if(air){L.rotation.x=.5;Rr.rotation.x=-.2}break}
    case 'an4':{ // saltarín
      if(idle){if(B)B.position.y=Math.abs(Math.sin(T*3))*.08;AL.rotation.z=-.2;AR.rotation.z=.2}
      else{if(B)B.position.y=Math.abs(s)*.35;L.rotation.x=Rr.rotation.x=-Math.abs(c)*.5;AL.rotation.x=AR.rotation.x=-Math.abs(s)*1.2;AL.rotation.z=-.3;AR.rotation.z=.3}
      if(air){L.rotation.x=Rr.rotation.x=-.9;AL.rotation.x=AR.rotation.x=-2.6}break}
    case 'an5':{ // superhéroe
      if(idle){AL.rotation.z=-.4;AR.rotation.z=.4;L.rotation.z=-.12;Rr.rotation.z=.12;if(B)B.rotation.x=-.06}
      else{L.rotation.x=s*.9;Rr.rotation.x=-s*.9;AL.rotation.x=-s*.9;AR.rotation.x=s*.9;if(B)B.rotation.x=.12}
      if(air){AR.rotation.x=-3.1;AL.rotation.x=.4;L.rotation.x=.1;Rr.rotation.x=.5;if(B)B.rotation.x=-.15}break}
    case 'an6':{ // bailarín
      if(idle){const q=Math.sin(T*4.5);AL.rotation.z=-.5-q*.3;AR.rotation.z=.5-q*.3;AL.rotation.x=AR.rotation.x=-.5;if(B){B.rotation.z=q*.12;B.position.y=Math.abs(q)*.05}L.rotation.z=-.1;Rr.rotation.z=.1}
      else{L.rotation.x=s*.8;Rr.rotation.x=-s*.8;AL.rotation.x=-s*.6-.3;AR.rotation.x=s*.6-.3;AL.rotation.z=-.6;AR.rotation.z=.6;if(B){B.rotation.y=s*.25;B.rotation.z=c*.08}}
      if(air){AL.rotation.x=AR.rotation.x=-2.2;AL.rotation.z=-.8;AR.rotation.z=.8;L.rotation.x=-.8;Rr.rotation.x=.3}break}
    case 'an7':{ // pato
      AL.rotation.z=-.5;AR.rotation.z=.5;
      if(idle){const f=Math.max(0,Math.sin(T*1.3))*.4;AL.rotation.z-=f;AR.rotation.z+=f}
      else{L.rotation.x=s*.35;Rr.rotation.x=-s*.35;if(B){B.rotation.z=s*.2;B.position.y=Math.abs(c)*.04}const f=Math.abs(Math.sin(w*2))*.3;AL.rotation.z-=f;AR.rotation.z+=f}
      if(air){const f=Math.abs(Math.sin(T*22))*.9;AL.rotation.z=-.6-f;AR.rotation.z=.6+f}break}
    default:{ // clásica
      if(idle){AL.rotation.x=br*.04;AR.rotation.x=-br*.04}
      else{L.rotation.x=s*.8;Rr.rotation.x=-s*.8;AL.rotation.x=-s*.8;AR.rotation.x=s*.8}
      if(air){AL.rotation.x=AR.rotation.x=-2.8}}
  }
}
/* drive: atajo para juegos · calcula dt y si se mueve, anima y pone pasos al jugador propio (a.isMe) */
function drive(a,walk,air,o){o=o||{};const now=performance.now(),dt=a._lt?Math.min(.1,(now-a._lt)/1000):1/60;a._lt=now;
  const moving=o.moving!==undefined?o.moving:(a._lw!==undefined&&Math.abs(walk-a._lw)>1e-4);a._lw=walk;
  animate(a,{walk,air,moving,climb:o.climb,dt});
  if(a.isMe&&window.CubiAudio){if(o.climb){if(moving&&Math.floor(now/260)!==a._cs){a._cs=Math.floor(now/260);CubiAudio.sfx('climb')}a._wasAir=false}else CubiAudio.steps(a,walk,air)}}
window.CubiAvatar={KEY,drive,CATS,ITEMS,BY,DEF_EQ,EMOTES,state,save,build,makeAvatar,animate,emote,faceCanvas,shirtCanvas};
})();
