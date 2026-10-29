// Service worker de Chispa:
//  1) hace que la app se abra aunque no haya internet;
//  2) añade a la página los permisos COOP/COEP que el navegador pide para dejar usar VARIOS núcleos
//     del procesador (el cerebro piensa mucho más rápido). GitHub Pages no deja ponerlos de otra forma.
const CACHE = "chispa-20261029180537";
const SHELL = ["./", "index.html", "config.js", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
let ISOLATE = true;   // con "Entrar con Google" (Firebase) no se puede: la ventana de Google dejaría de funcionar

async function checkConfig() {
  try { const t = await (await fetch("config.js", { cache: "no-store" })).text(); ISOLATE = /PEGA_AQUI/.test(t) || !/apiKey/.test(t); } catch (e) {}
}
self.addEventListener("install", e => { e.waitUntil(Promise.all([checkConfig(), caches.open(CACHE).then(c => c.addAll(SHELL))]).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(checkConfig().then(() => caches.keys()).then(ks => Promise.all(ks.filter(k => k.startsWith("chispa-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function withIsolation(res) {
  if (!ISOLATE || !res || res.status === 0 || res.type === "opaque") return res;
  const h = new Headers(res.headers);
  h.set("Cross-Origin-Opener-Policy", "same-origin");
  h.set("Cross-Origin-Embedder-Policy", "credentialless");
  h.set("Cross-Origin-Resource-Policy", "same-origin");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return; // lo de fuera (Google, Wikipedia…) va directo
  // primero internet (para tener siempre la última versión); si no hay, lo guardado
  // "no-cache": pregunta siempre a GitHub si hay algo nuevo (si no ha cambiado, no se descarga otra vez)
  const net = r.mode === "navigate" ? fetch(r.url, { cache: "no-cache", credentials: "same-origin" }) : fetch(r, { cache: "no-cache" });
  e.respondWith(net.then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return withIsolation(res); })
    .catch(() => caches.match(r).then(m => withIsolation(m || null)).then(m => m || caches.match("index.html").then(withIsolation))));
});
