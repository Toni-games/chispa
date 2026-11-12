/* Cubiverso · service worker: guarda los archivos para que la app cargue rápido y funcione sin conexión (menos el multijugador) */
const CACHE='cubiverso-v37';
const FILES=['./','./index.html','./avatar.js','./audio.js','./cuenta.js','./firebase-config.js','./pases.js','./kit.js','./cursor.js','./multi.js','./amigos.js','./graficos.js','./sala.js','./estudio/index.html','./estudio/ia.js','./estudio/estudio.js','./estudio/escena.js','./estudio/bloques.js','./estudio/plantillas.js','./juegos/creado.html','./juegos/comun.js','./juegos/granja-cubica.html','./juegos/minigolf.html','./juegos/busca-mascotas.html','./juegos/cocina-rapida.html','./juegos/torre-bloques.html','./juegos/zombis.html','./juegos/karts.html','./juegos/suelo-lava.html','./juegos/espadas.html','./juegos/meteoritos.html','./juegos/sin-carcasas.html','./juegos/reparar-moviles.html','./juegos/intros-molonas.html','./juegos/creador-2d.html','./animador.html','./manifest.json','./icon-192.png','./icon-512.png',
 './juegos/barrio-tycoon.html','./juegos/repartidor-tormentas.html','./juegos/ciudad-de-bolsillo.html','./juegos/el-cambiazo.html',
 './juegos/ladrones-de-brainrots.html','./juegos/patadon-lucky-blocks.html','./juegos/carrera-imposible.html','./juegos/guerra-de-globos.html',
 './juegos/pesca-tranquila.html','./juegos/torres-del-castillo.html','./juegos/corre-cubo.html','./juegos/empujones.html','./juegos/punteria-total.html','./juegos/caida-libre.html','./juegos/laseres-locos.html','./juegos/jetpack-loco.html','./juegos/asalto-slimes.html','./juegos/mundo-bloque.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* primero internet (siempre la última versión); si no hay conexión, lo guardado */
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  e.respondWith(fetch(r.mode==='navigate'?r.url:r,{cache:'no-cache'}).then(res=>{if(res&&res.ok&&(res.type==='basic'||res.type==='cors')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{ignoreSearch:true}).then(hit=>hit||Response.error())))});
