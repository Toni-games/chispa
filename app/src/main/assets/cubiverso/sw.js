/* Cubiverso · service worker: guarda los archivos para que la app cargue rápido y funcione sin conexión (menos el multijugador) */
const CACHE='cubiverso-v6';
const FILES=['./','./index.html','./avatar.js','./audio.js','./pases.js','./kit.js','./multi.js','./manifest.json','./icon-192.png','./icon-512.png',
 './juegos/barrio-tycoon.html','./juegos/repartidor-tormentas.html','./juegos/ciudad-de-bolsillo.html','./juegos/el-cambiazo.html',
 './juegos/ladrones-de-brainrots.html','./juegos/patadon-lucky-blocks.html','./juegos/carrera-imposible.html','./juegos/guerra-de-globos.html',
 './juegos/pesca-tranquila.html','./juegos/torres-del-castillo.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{const net=fetch(r).then(res=>{if(res&&res.ok&&(res.type==='basic'||res.type==='cors')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}))});
