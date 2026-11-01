/* =========================================================
   BahíaOS — núcleo del sistema
   Ventanas, Dock, barra de menús, Lanzador, buscador,
   centro de control, notificaciones y aplicaciones.
   ========================================================= */
(() => {
'use strict';

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const raiz = document.documentElement;
/* Cada usuario guarda sus datos con su propio prefijo ('principal' usa el de siempre) */
const leerGlobal = (k, d) => { try { const v = localStorage.getItem('bahia.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const guardarGlobal = (k, v) => { try { localStorage.setItem('bahia.' + k, JSON.stringify(v)); } catch (e) {} };
let USUARIO_ID = (() => { try { return sessionStorage.getItem('bahia.usuarioActivo') || leerGlobal('ultimoUsuario', 'principal'); } catch (e) { return 'principal'; } })();
if (!(leerGlobal('usuarios', []) || []).some(u => u.id === USUARIO_ID)) USUARIO_ID = 'principal';
const PREFIJO = USUARIO_ID === 'principal' ? 'bahia.' : 'bahia.u.' + USUARIO_ID + '.';
const guardar = (k, v) => { try { localStorage.setItem(PREFIJO + k, JSON.stringify(v)); } catch (e) {} };
const leer = (k, d) => { try { const v = localStorage.getItem(PREFIJO + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const normal = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function el(tag, clase, html) { const e = document.createElement(tag); if (clase) e.className = clase; if (html != null) e.innerHTML = html; return e; }
const ES_ANDROID = /BahiaOSApp/.test(navigator.userAgent);
const ES_APP = (() => { try { return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || window.outerHeight - window.innerHeight < 50; } catch (e) { return false; } })();

const JUEGOS = Array.isArray(window.JUEGOS) ? window.JUEGOS.slice() : [];
const PALETAS = [['#ff9f0a', '#ff375f'], ['#64d2ff', '#0a84ff'], ['#30d158', '#0b7a3a'], ['#bf5af2', '#5e5ce6'], ['#ffd60a', '#ff9f0a'], ['#ff6482', '#bf5af2'], ['#5ac8fa', '#30b0c7']];
function colorDe(t) { let h = 0; for (const c of String(t)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PALETAS[h % PALETAS.length]; }
/* Juegos encontrados solos en la carpeta "juegos" (los apunta sistema/abrir.ps1 al abrir BahíaOS) */
(Array.isArray(window.JUEGOS_AUTO) ? window.JUEGOS_AUTO : []).forEach(a => {
  if (!a || !a.carpeta || !a.ruta || JUEGOS.some(j => j.carpeta === a.carpeta)) return;
  JUEGOS.push(Object.assign({ icono: '🎮', color: colorDe(a.carpeta), ancho: 820, alto: 620, descripcion: 'Juego de la carpeta juegos', auto: true }, a));
});
const juegoPorId = id => JUEGOS.find(j => j.carpeta === id);

/* ---------- Ajustes ---------- */
const AJ = Object.assign({
  tema: 'auto', acento: '#0a84ff', fondo: 'bahia', dockTam: 52, ampliar: true,
  iconosEsc: true, usuario: 'Usuario', brillo: 100, volumen: 60,
  wifi: true, bt: true, compartir: true, noMolestar: false,
  ocultarDock: true, sonidos: true, ciudad: 'Madrid', escritorios: 2, tienda: [], records: {},
  stats: { partidas: {}, apps: {}, canciones: 0, capturas: 0, grabaciones: 0, chispa: 0 }, logros: {},
  widgets: [{ tipo: 'reloj', x: 24, y: 48 }, { tipo: 'tiempo', x: 24, y: 236 }, { tipo: 'records', x: 24, y: 424 }],
  notaWidget: 'Escribe aquí lo que quieras recordar.'
}, leer('ajustes', {}));
if (!AJ.stats || typeof AJ.stats !== 'object') AJ.stats = {};
['partidas', 'apps'].forEach(k => { if (!AJ.stats[k]) AJ.stats[k] = {}; });
let fondoPropio = leer('fondoPropio', null);
const guardarAj = () => guardar('ajustes', AJ);

/* ---------- Iconos ---------- */
const LOGO = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="24" r="13" fill="currentColor"/><path d="M6 43q6.5-6 13 0t13 0 13 0 13 0" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M6 55q6.5-6 13 0t13 0 13 0 13 0" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;

const ICONOS = {
  archivos: ['linear-gradient(180deg,#74d3ff,#1677f2)', `<svg viewBox="0 0 100 100"><path d="M18 33a7 7 0 0 1 7-7h16l7 7h27a7 7 0 0 1 7 7v31a7 7 0 0 1-7 7H25a7 7 0 0 1-7-7z" fill="#fff" opacity=".45"/><path d="M18 42a7 7 0 0 1 7-7h50a7 7 0 0 1 7 7v29a7 7 0 0 1-7 7H25a7 7 0 0 1-7-7z" fill="#fff"/><rect x="30" y="50" width="40" height="5" rx="2.5" fill="#1677f2" opacity=".35"/><rect x="30" y="60" width="26" height="5" rx="2.5" fill="#1677f2" opacity=".35"/></svg>`],
  juegos: ['linear-gradient(160deg,#ff7eb3,#7b3cff)', `<svg viewBox="0 0 100 100"><path d="M30 34h40a18 18 0 0 1 17.6 21.8l-3 13.4a8 8 0 0 1-13.4 3.9L64 66H36l-7.2 7.1a8 8 0 0 1-13.4-3.9l-3-13.4A18 18 0 0 1 30 34z" fill="#fff"/><rect x="27" y="47" width="16" height="5.5" rx="2" fill="#8b44f2"/><rect x="32.3" y="41.7" width="5.5" height="16" rx="2" fill="#8b44f2"/><circle cx="64" cy="46" r="4" fill="#ff5e9a"/><circle cx="72" cy="53" r="4" fill="#8b44f2"/></svg>`],
  notas: ['linear-gradient(180deg,#fff,#f2f2f2)', `<svg viewBox="0 0 100 100"><rect width="100" height="28" fill="#ffd60a"/><rect y="28" width="100" height="2" fill="#e6b800"/><g stroke="#cfcfd4" stroke-width="2.5"><line x1="14" x2="86" y1="46" y2="46"/><line x1="14" x2="86" y1="58" y2="58"/><line x1="14" x2="86" y1="70" y2="70"/><line x1="14" x2="70" y1="82" y2="82"/></g></svg>`],
  calculadora: ['linear-gradient(180deg,#48484c,#1c1c1e)', `<svg viewBox="0 0 100 100"><rect x="18" y="16" width="64" height="16" rx="4" fill="#9fe7a8" opacity=".9"/><g fill="#8e8e93"><circle cx="26" cy="46" r="7"/><circle cx="44" cy="46" r="7"/><circle cx="62" cy="46" r="7"/><circle cx="26" cy="64" r="7"/><circle cx="44" cy="64" r="7"/><circle cx="62" cy="64" r="7"/><circle cx="26" cy="82" r="7"/><circle cx="44" cy="82" r="7"/><circle cx="62" cy="82" r="7"/></g><g fill="#ff9f0a"><circle cx="80" cy="46" r="7"/><circle cx="80" cy="64" r="7"/><circle cx="80" cy="82" r="7"/></g></svg>`],
  terminal: ['linear-gradient(180deg,#3d3d42,#141416)', `<svg viewBox="0 0 100 100"><rect x="12" y="16" width="76" height="68" rx="8" fill="#0d0d0f" stroke="#5a5a60" stroke-width="2"/><path d="M26 38l12 10-12 10" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="44" y="58" width="22" height="6" rx="3" fill="#fff"/></svg>`],
  ajustes: ['linear-gradient(180deg,#b4b4ba,#5c5c63)', `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="28" fill="none" stroke="#3a3a3f" stroke-width="13" stroke-dasharray="7.3 7.36"/><circle cx="50" cy="50" r="24" fill="#d8d8dd"/><circle cx="50" cy="50" r="15" fill="none" stroke="#6c6c73" stroke-width="5"/><circle cx="50" cy="50" r="5" fill="#6c6c73"/></svg>`],
  navegador: ['linear-gradient(180deg,#f4f8ff,#dfe8f5)', `<svg viewBox="0 0 100 100"><defs><linearGradient id="bn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3fc6ff"/><stop offset="1" stop-color="#0a5cff"/></linearGradient></defs><circle cx="50" cy="50" r="38" fill="url(#bn)"/><g stroke="#fff" stroke-width="1.6" opacity=".75">${Array.from({length:24},(_,i)=>{const a=i*Math.PI/12,r1=i%2?32:29;return `<line x1="${50+Math.cos(a)*r1}" y1="${50+Math.sin(a)*r1}" x2="${50+Math.cos(a)*35}" y2="${50+Math.sin(a)*35}"/>`}).join('')}</g><g transform="rotate(40 50 50)"><path d="M50 22 57 50H43z" fill="#ff3b30"/><path d="M50 78 43 50h14z" fill="#fff"/></g><circle cx="50" cy="50" r="3.5" fill="#fff"/></svg>`],
  youtube: ['linear-gradient(180deg,#ffffff,#eceff3)', `<svg viewBox="0 0 100 100"><rect x="14" y="26" width="72" height="50" rx="14" fill="#ff1f3d"/><path d="M43 39v24l20-12z" fill="#fff"/><rect x="34" y="80" width="32" height="4" rx="2" fill="#c9ced6"/></svg>`],
  lanzador: ['linear-gradient(180deg,#5d5d66,#26262c)', `<svg viewBox="0 0 100 100"><g><rect x="18" y="18" width="16" height="16" rx="4" fill="#ff5f57"/><rect x="42" y="18" width="16" height="16" rx="4" fill="#febc2e"/><rect x="66" y="18" width="16" height="16" rx="4" fill="#28c840"/><rect x="18" y="42" width="16" height="16" rx="4" fill="#0a84ff"/><rect x="42" y="42" width="16" height="16" rx="4" fill="#bf5af2"/><rect x="66" y="42" width="16" height="16" rx="4" fill="#ff375f"/><rect x="18" y="66" width="16" height="16" rx="4" fill="#64d2ff"/><rect x="42" y="66" width="16" height="16" rx="4" fill="#ff9f0a"/><rect x="66" y="66" width="16" height="16" rx="4" fill="#30d158"/></g></svg>`]
};

function icono(id) {
  if (id && id.startsWith('mi:')) { const m = MIS_APPS.find(x => 'mi:' + x.id === id); return m ? `<div class="icono plano icono-mio"><img alt="" src="${m.icono}"></div>` : ''; }
  if (id === 'calendario') return iconoCalendario();
  if (id === 'papelera') return iconoPapelera();
  if (id && id.startsWith('juego:')) { const j = juegoPorId(id.slice(6)); return j ? iconoJuego(j) : ''; }
  const d = ICONOS[id] || ICONOS.archivos;
  return `<div class="icono" style="background:${d[0]}">${d[1]}</div>`;
}
function iconoCalendario() {
  const h = new Date();
  const sem = h.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase();
  return `<div class="icono icono-cal"><span class="cal-sem">${sem}</span><span class="cal-num">${h.getDate()}</span></div>`;
}
function iconoJuego(j) {
  const c = j.color || ['#5e5ce6', '#2c2a8f'];
  return `<div class="icono" style="background:linear-gradient(160deg,${c[0]},${c[1]})"><svg viewBox="0 0 100 100"><text x="50" y="55" font-size="54" text-anchor="middle" dominant-baseline="middle">${esc(j.icono || '🎮')}</text></svg></div>`;
}
function iconoPapelera() {
  const llena = PAPELERA.length > 0;
  return `<div class="icono plano"><svg viewBox="0 0 100 100"><defs><linearGradient id="pp" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4f4f6" stop-opacity=".95"/><stop offset="1" stop-color="#b9b9c0" stop-opacity=".95"/></linearGradient></defs>${llena ? '<path d="M28 26c6-8 14-4 20-9 6 5 16 1 24 8l-4 6H30z" fill="#fff" stroke="#c5c5cc"/><rect x="34" y="18" width="18" height="12" rx="2" fill="#ffe08a" transform="rotate(-12 43 24)"/>' : ''}<path d="M22 30h56l-6 56a6 6 0 0 1-6 5H34a6 6 0 0 1-6-5z" fill="url(#pp)" stroke="#9a9aa2" stroke-width="1.2"/><ellipse cx="50" cy="30" rx="28" ry="5" fill="#e3e3e8" stroke="#9a9aa2" stroke-width="1.2"/><g stroke="#9a9aa2" stroke-width="1.6" opacity=".7"><line x1="38" y1="40" x2="39.5" y2="84"/><line x1="50" y1="40" x2="50" y2="85"/><line x1="62" y1="40" x2="60.5" y2="84"/></g></svg></div>`;
}
function iconoCarpeta(insignia) {
  return `<div class="icono plano"><svg viewBox="0 0 100 100"><path d="M8 24a6 6 0 0 1 6-6h24l7 7h41a6 6 0 0 1 6 6v8H8z" fill="#3b9cf0"/><path d="M8 32a6 6 0 0 1 6-6h72a6 6 0 0 1 6 6v46a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill="#6cc0ff"/><path d="M8 34h84" stroke="#9fd6ff" stroke-width="1.5"/>${insignia ? `<text x="50" y="58" font-size="30" text-anchor="middle" dominant-baseline="middle" opacity=".9">${esc(insignia)}</text>` : ''}</svg></div>`;
}
function iconoDoc(ext) {
  return `<div class="icono plano"><svg viewBox="0 0 100 100"><path d="M24 8h36l18 18v62a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#fff" stroke="#c7c7cc" stroke-width="1.5"/><path d="M60 8v14a4 4 0 0 0 4 4h14" fill="#ececf0" stroke="#c7c7cc" stroke-width="1.5"/><g stroke="#d1d1d6" stroke-width="2.5"><line x1="30" x2="70" y1="40" y2="40"/><line x1="30" x2="70" y1="48" y2="48"/><line x1="30" x2="60" y1="56" y2="56"/></g><text x="50" y="80" font-size="13" font-weight="700" font-family="-apple-system,Segoe UI,sans-serif" text-anchor="middle" fill="#8e8e93">${esc(ext)}</text></svg></div>`;
}
function iconoDisco() {
  return `<div class="icono plano"><svg viewBox="0 0 100 100"><defs><linearGradient id="dd" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f2f2f4"/><stop offset="1" stop-color="#a9a9b0"/></linearGradient></defs><rect x="10" y="30" width="80" height="44" rx="8" fill="url(#dd)" stroke="#8e8e95" stroke-width="1.2"/><rect x="18" y="58" width="40" height="5" rx="2.5" fill="#8e8e95"/><circle cx="76" cy="60" r="3.5" fill="#34c759"/></svg></div>`;
}

const SVG = {
  wifi: on => `<svg viewBox="0 0 20 20"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="${on ? 1 : .35}"><path d="M2.5 7.5a11 11 0 0 1 15 0"/><path d="M5.2 10.4a7 7 0 0 1 9.6 0"/><path d="M7.9 13.2a3 3 0 0 1 4.2 0"/></g><circle cx="10" cy="15.8" r="1.4" fill="currentColor" opacity="${on ? 1 : .35}"/>${on ? '' : '<path d="M3 3l14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'}</svg>`,
  bt: '<svg viewBox="0 0 20 20"><path d="M6 6l8 7.5-4 3.5V3l4 3.5L6 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  compartir: '<svg viewBox="0 0 20 20"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="2"/><path d="M6.5 13.5a5 5 0 0 1 0-7M13.5 6.5a5 5 0 0 1 0 7M4 16a8.5 8.5 0 0 1 0-12M16 4a8.5 8.5 0 0 1 0 12" stroke-linecap="round"/></g></svg>',
  luna: '<svg viewBox="0 0 20 20"><path d="M15.5 12.5A6.5 6.5 0 0 1 7.5 4.5a6.5 6.5 0 1 0 8 8z" fill="currentColor"/></svg>',
  medio: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor"/></svg>',
  sol: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="3.5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4"/></g></svg>',
  altavoz: '<svg viewBox="0 0 20 20"><path d="M3 8h3l4-3.5v11L6 12H3z" fill="currentColor"/><path d="M13 7.5a3.5 3.5 0 0 1 0 5M15 5.5a6.5 6.5 0 0 1 0 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  escritorio: '<svg viewBox="0 0 20 20"><rect x="2" y="3" width="16" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 17h6M10 14v3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  documentos: '<svg viewBox="0 0 20 20"><path d="M5 2h7l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 10h6M7 13h6" stroke="currentColor" stroke-width="1.4"/></svg>',
  descargas: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 6v7M7 10.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  aplicaciones: '<svg viewBox="0 0 20 20"><g fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="5.5" height="5.5" rx="1.5"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.5"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.5"/></g></svg>',
  mando: '<svg viewBox="0 0 20 20"><path d="M6 6h8a4 4 0 0 1 3.9 4.9l-.7 3a1.7 1.7 0 0 1-2.9.8L12.7 13H7.3l-1.6 1.7a1.7 1.7 0 0 1-2.9-.8l-.7-3A4 4 0 0 1 6 6z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 8.5v3M5 10h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="13" cy="9.3" r=".9" fill="currentColor"/><circle cx="14.5" cy="11" r=".9" fill="currentColor"/></svg>',
  disco: '<svg viewBox="0 0 20 20"><rect x="2" y="6" width="16" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="14.5" cy="10.5" r="1" fill="currentColor"/></svg>',
  papelera: '<svg viewBox="0 0 20 20"><path d="M4 5.5h12M8 5.5V4h4v1.5M5.5 5.5l.8 11a1 1 0 0 0 1 .9h5.4a1 1 0 0 0 1-.9l.8-11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  rejilla: '<svg viewBox="0 0 20 20"><g fill="currentColor"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/></g></svg>',
  listado: '<svg viewBox="0 0 20 20"><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 5h10M7 10h10M7 15h10"/></g><g fill="currentColor"><circle cx="3.5" cy="5" r="1.2"/><circle cx="3.5" cy="10" r="1.2"/><circle cx="3.5" cy="15" r="1.2"/></g></svg>',
  atras: '<svg viewBox="0 0 20 20"><path d="M12.5 4l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  adelante: '<svg viewBox="0 0 20 20"><path d="M7.5 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  lupa: '<svg viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12.6 12.6 17 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  lapiz: '<svg viewBox="0 0 20 20"><path d="M10 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M15.5 2.5l2 2L10 12l-3 1 1-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  paleta: '<svg viewBox="0 0 20 20"><path d="M10 2a8 8 0 1 0 0 16c1.2 0 1.6-1 1-2-.7-1.2 0-2.5 1.5-2.5H15a3 3 0 0 0 3-3C18 5.6 14.4 2 10 2z" fill="currentColor"/></svg>',
  imagen: '<svg viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 14l4.5-4.5 3.5 3.5 2-2 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  dock: '<svg viewBox="0 0 20 20"><rect x="2" y="3" width="16" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="5" y="12" width="10" height="2.5" rx="1.2" fill="currentColor"/></svg>',
  persona: '<svg viewBox="0 0 20 20"><circle cx="10" cy="7" r="3.5" fill="currentColor"/><path d="M3.5 17a6.5 6.5 0 0 1 13 0z" fill="currentColor"/></svg>',
  recargar: '<svg viewBox="0 0 20 20"><path d="M16 10a6 6 0 1 1-1.8-4.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M15.5 2.5v4h-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  externo: '<svg viewBox="0 0 20 20"><path d="M11 3h6v6M17 3l-8 8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12v3.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 15.5v-9A1.5 1.5 0 0 1 4.5 5H8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  mas: '<svg viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  candado: '<svg viewBox="0 0 20 20"><rect x="4.5" y="9" width="11" height="8" rx="2" fill="currentColor"/><path d="M7 9V7a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  info: '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="currentColor"/><path d="M10 9v5" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="6" r="1.2" fill="#fff"/></svg>'
};

function bateriaSVG(nivel, cargando) {
  const w = Math.max(2, Math.round(19 * nivel));
  return `<svg viewBox="0 0 28 14"><rect x=".75" y=".75" width="23" height="12.5" rx="3.5" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.2"/><rect x="2.5" y="2.5" width="${w}" height="9" rx="2" fill="currentColor"/><path d="M25.3 4.8v4.4a2 2 0 0 0 0-4.4z" fill="currentColor" opacity=".5"/>${cargando ? '<path d="M13.5 2.5l-3 5h2.5l-1.5 4 4-5.5H13z" fill="var(--barra)" stroke="currentColor" stroke-width=".4"/>' : ''}</svg>`;
}

/* ---------- Fondos de pantalla ---------- */
const FONDOS = {
  bahia: { nombre: 'Bahía', css: 'radial-gradient(70% 60% at 80% 95%, #ff9d5c 0%, rgba(255,157,92,0) 70%), radial-gradient(60% 55% at 15% 90%, #ff4e8a 0%, rgba(255,78,138,0) 70%), radial-gradient(85% 70% at 50% 5%, #3d4fd6 0%, rgba(61,79,214,0) 72%), linear-gradient(180deg, #0a0f3a 0%, #2d1663 50%, #6a1f63 100%)' },
  amanecer: { nombre: 'Amanecer', css: 'radial-gradient(90% 70% at 50% 112%, #ffd27a 0%, rgba(255,210,122,0) 62%), radial-gradient(70% 60% at 85% 18%, #ff7aa8 0%, rgba(255,122,168,0) 70%), linear-gradient(180deg, #5b7cfa 0%, #c47be0 55%, #ff9f80 100%)' },
  laguna: { nombre: 'Laguna', css: 'radial-gradient(80% 60% at 20% 92%, #2fe0b8 0%, rgba(47,224,184,0) 65%), radial-gradient(70% 60% at 85% 12%, #2a8cff 0%, rgba(42,140,255,0) 70%), linear-gradient(160deg, #032a3a 0%, #06506a 50%, #0a7d7a 100%)' },
  aurora: { nombre: 'Aurora', css: 'radial-gradient(45% 35% at 28% 38%, #3cffb0 0%, rgba(60,255,176,0) 70%), radial-gradient(55% 45% at 70% 48%, #9b5cff 0%, rgba(155,92,255,0) 70%), linear-gradient(180deg, #02040c 0%, #081a2e 60%, #0b0f1d 100%)' },
  duna: { nombre: 'Duna', css: 'radial-gradient(90% 60% at 28% 102%, #c8662f 0%, rgba(200,102,47,0) 70%), radial-gradient(80% 60% at 82% 72%, #e9a35b 0%, rgba(233,163,91,0) 70%), linear-gradient(180deg, #f6cf98 0%, #e48b5a 60%, #9c4a2e 100%)' },
  grafito: { nombre: 'Grafito', css: 'radial-gradient(60% 50% at 70% 28%, #4b4b57 0%, rgba(75,75,87,0) 70%), radial-gradient(50% 40% at 20% 85%, #2f3442 0%, rgba(47,52,66,0) 70%), linear-gradient(180deg, #1b1b20 0%, #2c2c33 60%, #141418 100%)' },
  noche: { nombre: 'Noche', css: 'radial-gradient(1.5px 1.5px at 12% 18%, #fff 50%, transparent 52%), radial-gradient(1px 1px at 28% 42%, #fff 50%, transparent 52%), radial-gradient(1.5px 1.5px at 46% 12%, #fff 50%, transparent 52%), radial-gradient(1px 1px at 63% 33%, #fff 50%, transparent 52%), radial-gradient(1.5px 1.5px at 81% 20%, #fff 50%, transparent 52%), radial-gradient(1px 1px at 90% 48%, #fff 50%, transparent 52%), radial-gradient(1px 1px at 8% 60%, #fff 50%, transparent 52%), radial-gradient(1px 1px at 37% 70%, #cfe3ff 50%, transparent 52%), radial-gradient(70% 50% at 75% 100%, #3a2a8f 0%, rgba(58,42,143,0) 70%), linear-gradient(180deg, #02030c 0%, #0b1236 60%, #1d1450 100%)' },
  dinamico: { nombre: 'Dinámico (cambia con la hora)', css: 'linear-gradient(90deg, #ff9f80 0 25%, #06506a 25% 50%, #6a1f63 50% 75%, #0b1236 75% 100%)' }
};
function cssFondo() {
  if (AJ.fondo === 'propio' && fondoPropio) return `url("${fondoPropio}") center / cover no-repeat`;
  if (AJ.fondo === 'dinamico') return FONDOS[fondoSegunHora()].css;
  return (FONDOS[AJ.fondo] || FONDOS.bahia).css;
}
function aplicarFondo() { raiz.style.setProperty('--fondo', cssFondo()); }

/* ---------- Tema ---------- */
const mqOscuro = matchMedia('(prefers-color-scheme: dark)');
function temaOscuro() {
  if (AJ.tema === 'oscuro') return true;
  if (AJ.tema === 'claro') return false;
  const dt = raiz.getAttribute('data-theme');
  if (dt) return dt === 'dark';
  return mqOscuro.matches;
}
function aplicarTema() {
  raiz.classList.toggle('menos-movimiento', !!AJ.menosMovimiento);
  raiz.classList.toggle('oscuro', temaOscuro());
  raiz.style.setProperty('--acento', AJ.acento);
  raiz.style.setProperty('--dock-tam', AJ.dockTam + 'px');
  $('#brillo').style.opacity = ((100 - AJ.brillo) / 100 * 0.75).toFixed(2);
}
try { mqOscuro.addEventListener('change', () => { aplicarTema(); refrescarCC(); }); } catch (e) {}

/* ---------- Datos: notas, papelera, recientes ---------- */
const NOTA_AYUDA = `Cómo añadir juegos a BahíaOS
Hay tres formas, elige la que quieras:

1. La más fácil: mete tu juego en la carpeta "juegos"
   (Documentos\\BahiaOS\\juegos). Puede ser un archivo .html suelto
   o una carpeta con su index.html, imágenes y sonidos.
   Cierra BahíaOS y vuelve a abrirlo desde su icono: aparece solo.

2. Desde dentro: abre la carpeta Juegos y pulsa «Subir juego…»,
   o arrastra el archivo .html encima del escritorio.

3. A mano: añade una línea en juegos/lista.js para ponerle
   tu propio emoji, colores y tamaño de ventana.

Atajos útiles
Ctrl + Espacio: buscador
F3: Mission Control (ver todas las ventanas)
F4: Lanzador
Doble clic en la barra de una ventana: ampliarla
Mayús + clic en el botón amarillo: minimizar a cámara lenta`;

let NOTAS = leer('notas', null);
if (!Array.isArray(NOTAS)) {
  const ahora = Date.now();
  NOTAS = [
    { id: 'ayuda', texto: NOTA_AYUDA, fecha: ahora },
    { id: 'n2', texto: 'Ideas para el fin de semana\nTerminar la partida de Buscaminas en Intermedio\nSuperar 2048\nProbar un fondo de pantalla nuevo', fecha: ahora - 3600e3 * 26 },
    { id: 'n3', texto: 'Récords\nSerpiente: \n2048: \nAleteo: ', fecha: ahora - 3600e3 * 72 }
  ];
}
const guardarNotas = () => guardar('notas', NOTAS);
const tituloNota = n => (n.texto.split('\n').find(l => l.trim()) || 'Nota nueva').trim().slice(0, 60);
let PAPELERA = leer('papelera', []);
const guardarPapelera = () => { guardar('papelera', PAPELERA); refrescarPapelera(); };
let RECIENTES = leer('recientes', []);

/* =========================================================
   Gestor de ventanas
   ========================================================= */
const capaV = $('#ventanas');
const VENTANAS = [];
let zTop = 100, seq = 0, activa = null;
const ALTO_MENU = 30;
const altoDock = () => AJ.ocultarDock ? 12 : AJ.dockTam + 24;

function abrirVentana(o) {
  const v = { id: ++seq, app: o.app, titulo: o.titulo, min: false, max: false, alTeclado: o.alTeclado, alCerrar: o.alCerrar, esc: escActual };
  AJ.stats.apps[o.app.startsWith('juego:') ? 'juegos' : o.app] = true;
  const w = Math.min(o.ancho || 720, innerWidth - 24);
  const h = Math.min(o.alto || 460, innerHeight - ALTO_MENU - altoDock() - 12);
  const n = VENTANAS.filter(x => !x.min).length % 6;
  let x = Math.round((innerWidth - w) / 2 + n * 26 - 52);
  let y = Math.round((innerHeight - h) / 2 - 30 + n * 26);
  x = Math.max(8, Math.min(x, innerWidth - w - 8));
  y = Math.max(ALTO_MENU + 6, Math.min(y, innerHeight - h - altoDock()));
  const e = el('section', 'ventana abriendo ' + (o.clase || ''));
  e.setAttribute('role', 'dialog');
  e.setAttribute('aria-label', o.titulo);
  e.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;z-index:${++zTop}`;
  e.innerHTML = `<div class="v-barra${o.barraAlta ? ' alta' : ''}${o.sinTitulo ? ' sin-titulo' : ''}${o.barraTransparente ? ' transparente' : ''}"><div class="semaforo"><button class="s-cerrar" aria-label="Cerrar">×</button><button class="s-min" aria-label="Minimizar">−</button><button class="s-max" aria-label="Ampliar">+</button></div><div class="v-titulo"></div></div><div class="v-cuerpo"></div>${o.fijo ? '' : '<div class="v-redim"></div>'}`;
  const barra = $('.v-barra', e);
  $('.v-titulo', e).textContent = o.titulo;
  if (o.herramientas) barra.appendChild(o.herramientas);
  v.el = e; v.cuerpo = $('.v-cuerpo', e); v.barra = barra; v.fijo = !!o.fijo;
  if (o.contenido) v.cuerpo.appendChild(o.contenido);
  capaV.appendChild(e);
  VENTANAS.push(v);
  e.addEventListener('animationend', () => e.classList.remove('abriendo'), { once: true });
  e.addEventListener('pointerdown', () => enfocar(v), true);
  $('.s-cerrar', e).addEventListener('click', ev => { ev.stopPropagation(); cerrar(v); });
  $('.s-min', e).addEventListener('click', ev => { ev.stopPropagation(); minimizar(v); });
  $('.s-max', e).addEventListener('click', ev => { ev.stopPropagation(); if (!v.fijo) ampliar(v); });
  barra.addEventListener('dblclick', ev => { if (ev.target.closest('button,input,label')) return; if (!v.fijo) ampliar(v); });
  hacerArrastrable(v);
  if (!o.fijo) hacerRedimensionable(v);
  enfocar(v);
  actualizarDock();
  return v;
}

function hacerArrastrable(v) {
  const barra = v.barra;
  barra.addEventListener('pointerdown', ev => {
    if (ev.button !== 0 || ev.target.closest('button,input,select,label,.no-arrastre')) return;
    const e = v.el;
    let r = e.getBoundingClientRect();
    let dx = ev.clientX - r.left, dy = ev.clientY - r.top;
    let movido = false;
    barra.setPointerCapture(ev.pointerId);
    document.body.classList.add('arrastrando');
    const mover = m => {
      if (!movido && Math.hypot(m.clientX - ev.clientX, m.clientY - ev.clientY) < 3) return;
      if (!movido && v.max) {
        const ancho = parseFloat(v.prev.w);
        v.max = false;
        e.style.width = v.prev.w; e.style.height = v.prev.h;
        dx = Math.min(ancho - 60, Math.max(60, ancho * ((ev.clientX - r.left) / r.width)));
        dy = 18;
      }
      movido = true;
      e.style.left = Math.round(m.clientX - dx) + 'px';
      e.style.top = Math.round(Math.max(ALTO_MENU, Math.min(innerHeight - 40, m.clientY - dy))) + 'px';
    };
    const fin = () => {
      document.body.classList.remove('arrastrando');
      barra.removeEventListener('pointermove', mover);
      barra.removeEventListener('pointerup', fin);
      barra.removeEventListener('pointercancel', fin);
    };
    barra.addEventListener('pointermove', mover);
    barra.addEventListener('pointerup', fin);
    barra.addEventListener('pointercancel', fin);
  });
}

function hacerRedimensionable(v) {
  const asa = $('.v-redim', v.el);
  asa.addEventListener('pointerdown', ev => {
    ev.preventDefault(); ev.stopPropagation();
    const e = v.el, r = e.getBoundingClientRect();
    asa.setPointerCapture(ev.pointerId);
    document.body.classList.add('arrastrando');
    v.max = false;
    const mover = m => {
      e.style.width = Math.max(260, Math.min(innerWidth - r.left, r.width + m.clientX - ev.clientX)) + 'px';
      e.style.height = Math.max(170, Math.min(innerHeight - r.top, r.height + m.clientY - ev.clientY)) + 'px';
    };
    const fin = () => {
      document.body.classList.remove('arrastrando');
      asa.removeEventListener('pointermove', mover);
      asa.removeEventListener('pointerup', fin);
    };
    asa.addEventListener('pointermove', mover);
    asa.addEventListener('pointerup', fin);
  });
}

function enfocar(v) {
  if (!v || v.min) return;
  if (activa === v) { if (+v.el.style.zIndex < zTop) v.el.style.zIndex = ++zTop; return; }
  VENTANAS.forEach(x => x.el.classList.remove('activa'));
  v.el.classList.add('activa');
  v.el.style.zIndex = ++zTop;
  activa = v;
  actualizarMenuApp();
}
function desenfocarTodo() {
  VENTANAS.forEach(x => x.el.classList.remove('activa'));
  activa = null;
  actualizarMenuApp();
}
function enfocarSiguiente() {
  const vis = VENTANAS.filter(x => !x.min && x.esc === escActual).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex);
  activa = null;
  if (vis[0]) enfocar(vis[0]); else desenfocarTodo();
}
function cerrar(v) {
  if (v.alCerrar) v.alCerrar();
  if (v.anim) v.anim.cancel();
  v.el.classList.add('cerrando');
  setTimeout(() => v.el.remove(), lento ? 900 : 200);
  VENTANAS.splice(VENTANAS.indexOf(v), 1);
  if (activa === v) enfocarSiguiente();
  actualizarDock();
}
function ampliar(v) {
  const e = v.el;
  e.classList.add('animar');
  e.style.setProperty('--dur', lento ? '2s' : '.42s');
  if (!v.max) {
    v.prev = { l: e.style.left, t: e.style.top, w: e.style.width, h: e.style.height };
    Object.assign(e.style, { left: '6px', top: (ALTO_MENU + 6) + 'px', width: (innerWidth - 12) + 'px', height: (innerHeight - ALTO_MENU - altoDock() - 8) + 'px' });
    v.max = true;
  } else {
    Object.assign(e.style, { left: v.prev.l, top: v.prev.t, width: v.prev.w, height: v.prev.h });
    v.max = false;
  }
  setTimeout(() => e.classList.remove('animar'), 300);
}
/* --- Efecto «genio» al minimizar (como en el Mac) --- */
let lento = false; // con Mayús pulsada, las animaciones van a cámara lenta, como en el Mac
document.addEventListener('pointerdown', e => { lento = e.shiftKey; }, true);
document.addEventListener('keydown', e => { if (!e.shiftKey) lento = false; }, true);
window.addEventListener('blur', () => { lento = false; });
const sinMovimiento = () => !!AJ.menosMovimiento;
function framesGenio(v) {
  const e = v.el, r = e.getBoundingClientRect();
  const d = itemDock(v.app);
  const dr = d ? d.getBoundingClientRect() : { left: innerWidth / 2 - 24, width: 48, top: innerHeight - 60, height: 48 };
  const W = r.width, H = r.height, ic = Math.max(20, dr.width * .78);
  const cx = dr.left + dr.width / 2 - r.left;
  const L = cx - ic / 2, R = cx + ic / 2;
  const dy = dr.top + dr.height * .3 - r.bottom;
  const mez = (a, b, k) => a + (b - a) * k;
  const suave = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
  const N = 7;
  const poly = st => {
    const izq = [], der = [];
    for (let n = 0; n <= N; n++) {
      const f = n / N, k = suave(st * 2 - 1 + f);
      izq.push(`${mez(0, L, k).toFixed(1)}px ${(f * H).toFixed(1)}px`);
      der.unshift(`${mez(W, R, k).toFixed(1)}px ${(f * H).toFixed(1)}px`);
    }
    return `polygon(${izq.concat(der).join(',')})`;
  };
  return [
    { offset: 0, clipPath: poly(0), transform: 'translateY(0px) scaleY(1)', opacity: 1 },
    { offset: .25, clipPath: poly(.25), transform: 'translateY(0px) scaleY(1)', opacity: 1 },
    { offset: .5, clipPath: poly(.5), transform: `translateY(${dy * .12}px) scaleY(.9)`, opacity: 1 },
    { offset: .75, clipPath: poly(.75), transform: `translateY(${dy * .55}px) scaleY(.5)`, opacity: .95 },
    { offset: 1, clipPath: poly(1), transform: `translateY(${dy}px) scaleY(.02)`, opacity: 0 }
  ];
}
function minimizar(v) {
  if (!v || v.min) return;
  const e = v.el;
  if (v.anim) v.anim.cancel();
  v.min = true;
  if (activa === v) enfocarSiguiente();
  actualizarDock();
  if (sinMovimiento()) { e.hidden = true; return; }
  e.style.transformOrigin = '50% 100%';
  e.style.willChange = 'transform, clip-path, opacity';
  e.style.pointerEvents = 'none';
  v.anim = e.animate(framesGenio(v), { duration: lento ? 2600 : 520, easing: 'cubic-bezier(.55,.05,.7,.4)', fill: 'forwards' });
  v.anim.onfinish = () => { if (v.min) e.hidden = true; v.anim.cancel(); v.anim = null; e.style.pointerEvents = ''; e.style.willChange = ''; };
}
function restaurar(v) {
  if (v.esc !== escActual) cambiarEscritorio(v.esc);
  if (!v.min) return enfocar(v);
  const e = v.el;
  if (v.anim) { v.anim.cancel(); v.anim = null; }
  e.hidden = false;
  v.min = false;
  enfocar(v);
  actualizarDock();
  if (sinMovimiento()) return;
  e.style.transformOrigin = '50% 100%';
  const f = framesGenio(v).reverse().map(k => Object.assign({}, k, { offset: 1 - k.offset }));
  v.anim = e.animate(f, { duration: lento ? 2400 : 480, easing: 'cubic-bezier(.25,.6,.4,1)' });
  e.style.willChange = 'transform, clip-path, opacity';
  v.anim.onfinish = () => { v.anim = null; e.style.transformOrigin = ''; e.style.willChange = ''; };
}

/* --- Mission Control: todas las ventanas a la vista --- */
let mc = null;
function misionControl() {
  if (mc) return salirMC();
  const vis = VENTANAS.filter(v => !v.min && v.esc === escActual);
  cerrarTodoFlotante(); cerrarLanzador();
  const capa = el('div', 'mc-capa');
  $('#escritorio').insertBefore(capa, capaV);
  mc = { capa, etiquetas: [] };
  document.body.classList.add('en-mc');
  capa.appendChild(barraEscritorios());
  if (!vis.length) { capa.appendChild(el('div', 'mc-vacio', 'No hay ventanas abiertas en este escritorio')); return; }
  const arriba = 120, abajo = altoDock() + 40, lado = 50;
  const AW = innerWidth - lado * 2, AH = innerHeight - arriba - abajo;
  const cols = Math.ceil(Math.sqrt(vis.length * AW / AH * .75)), filas = Math.ceil(vis.length / cols);
  const cw = AW / cols, ch = AH / filas;
  vis.sort((a, b) => a.id - b.id).forEach((v, i) => {
    const e = v.el, r = e.getBoundingClientRect();
    const fila = Math.floor(i / cols), enFila = Math.min(cols, vis.length - fila * cols);
    const desplaz = (AW - enFila * cw) / 2;
    const cx = lado + desplaz + (i % cols + .5) * cw, cy = arriba + (fila + .5) * ch - 10;
    const k = Math.min(1, (cw - 30) / r.width, (ch - 46) / r.height);
    e.classList.add('mc');
    e.style.transition = 'transform .45s cubic-bezier(.2,.9,.25,1)';
    e.style.transform = `translate(${cx - (r.left + r.width / 2)}px, ${cy - (r.top + r.height / 2)}px) scale(${k})`;
    const et = el('div', 'mc-etiqueta');
    et.textContent = v.titulo || nombreApp(v.app);
    et.style.left = cx + 'px'; et.style.top = (cy + r.height * k / 2 + 10) + 'px';
    capa.appendChild(et);
    e.dataset.mc = v.id;
  });
}
function salirMC(elegida) {
  if (!mc) return;
  const capa = mc.capa; mc = null;
  capa.classList.add('fuera');
  setTimeout(() => capa.remove(), 300);
  document.body.classList.remove('en-mc');
  VENTANAS.forEach(v => { if (v.el.classList.contains('mc')) v.el.style.transform = ''; });
  setTimeout(() => VENTANAS.forEach(v => { v.el.classList.remove('mc'); v.el.style.transition = ''; delete v.el.dataset.mc; }), 470);
  if (elegida) enfocar(elegida);
}
document.addEventListener('pointerdown', e => {
  if (!mc) return;
  if (e.target.closest('.mc-espacios')) return;
  if (e.target.closest('#barra-menu, #dock')) { salirMC(); return; }
  e.preventDefault(); e.stopPropagation();
  const w = e.target.closest('.ventana.mc');
  salirMC(w ? VENTANAS.find(v => v.el === w) : null);
}, true);

function mosaico() {
  const vis = VENTANAS.filter(v => !v.min && v.esc === escActual);
  if (!vis.length) return;
  const cols = Math.ceil(Math.sqrt(vis.length)), filas = Math.ceil(vis.length / cols);
  const W = innerWidth - 12, H = innerHeight - ALTO_MENU - altoDock() - 10;
  vis.forEach((v, i) => {
    const e = v.el; e.classList.add('animar'); v.max = false;
    Object.assign(e.style, {
      left: (6 + (i % cols) * W / cols) + 'px', top: (ALTO_MENU + 6 + Math.floor(i / cols) * H / filas) + 'px',
      width: (W / cols - 6) + 'px', height: (H / filas - 6) + 'px'
    });
    setTimeout(() => e.classList.remove('animar'), 300);
  });
}

/* Clic dentro de un juego (iframe): enfocar su ventana */
window.addEventListener('blur', () => {
  setTimeout(() => {
    const a = document.activeElement;
    if (a && a.tagName === 'IFRAME') {
      const v = VENTANAS.find(x => x.el.contains(a));
      if (v) enfocar(v);
      cerrarTodoFlotante();
    }
  }, 0);
});

/* =========================================================
   Aplicaciones registradas
   ========================================================= */
const APPS = {
  lanzador: { nombre: 'Lanzador', abrir: () => alternarLanzador(), sinVentana: true },
  archivos: { nombre: 'Archivos', abrir: arg => appArchivos(arg) },
  navegador: { nombre: 'Navegador', abrir: arg => appNavegador(arg) },
  youtube: { nombre: 'YouTube', abrir: arg => appYouTube(arg) },
  juegos: { nombre: 'Juegos', abrir: () => appArchivos('Juegos'), sinVentana: true },
  notas: { nombre: 'Notas', abrir: arg => appNotas(arg) },
  calendario: { nombre: 'Calendario', abrir: () => appCalendario() },
  calculadora: { nombre: 'Calculadora', abrir: () => appCalculadora() },
  terminal: { nombre: 'Terminal', abrir: () => appTerminal() },
  ajustes: { nombre: 'Ajustes del sistema', abrir: arg => appAjustes(arg) },
  papelera: { nombre: 'Papelera', abrir: () => appArchivos('Papelera'), sinVentana: true }
};
const DOCK_FIJO = ['archivos', 'lanzador', 'navegador', 'youtube', 'juegos', 'notas', 'calendario', 'calculadora', 'terminal', 'ajustes'];

function nombreApp(id) {
  if (!id) return 'Archivos';
  if (id.startsWith('juego:')) { const j = juegoPorId(id.slice(6)); return j ? j.nombre : 'Juego'; }
  return (APPS[id] || {}).nombre || id;
}
function abrirApp(id, arg) {
  cerrarTodoFlotante();
  if (id.startsWith('juego:')) return abrirJuego(id.slice(6));
  const a = APPS[id];
  if (a) a.abrir(arg);
}
function existente(app) {
  const v = VENTANAS.find(x => x.app === app);
  if (v) { v.min ? restaurar(v) : enfocar(v); }
  return v;
}

function abrirJuego(carpeta) {
  const j = juegoPorId(carpeta);
  if (!j) { notificar('No se encuentra el juego', `La carpeta "${carpeta}" no está en juegos/lista.js.`, icono('juegos')); return; }
  const app = 'juego:' + carpeta;
  if (existente(app)) return;
  const f = el('iframe', 'marco-juego');
  let blobUrl = null;
  if (j.subido) { blobUrl = URL.createObjectURL(new Blob([j.html], { type: 'text/html' })); f.src = blobUrl; }
  else f.src = j.ruta ? j.ruta.split('/').map(encodeURIComponent).join('/') : `juegos/${encodeURIComponent(carpeta)}/index.html`;
  f.title = j.nombre;
  f.setAttribute('allow', 'fullscreen; autoplay');
  abrirVentana({ app, titulo: j.nombre, ancho: j.ancho || 560, alto: (j.alto || 560) + 38, contenido: f, clase: 'v-juego', alCerrar: () => { if (blobUrl) setTimeout(() => URL.revokeObjectURL(blobUrl), 1000); } });
  f.addEventListener('load', () => {
    try { f.contentWindow.focus(); } catch (e) {}
    try { const st = f.contentDocument.createElement('style'); st.textContent = 'html,body{cursor:' + CURSOR_CSS + '}'; f.contentDocument.head.appendChild(st); } catch (e) {}
  });
  AJ.stats.partidas[carpeta] = (AJ.stats.partidas[carpeta] || 0) + 1; guardarAj();
  setTimeout(revisarLogros, 1500);
  RECIENTES = [carpeta, ...RECIENTES.filter(c => c !== carpeta)].slice(0, 8);
  guardar('recientes', RECIENTES);
}

/* =========================================================
   Dock
   ========================================================= */
const dock = $('#dock');
function construirDock() {
  dock.innerHTML = '';
  DOCK_FIJO.forEach(id => dock.appendChild(crearItemDock(id)));
  const sep = el('div', 'dock-sep din'); dock.appendChild(sep);
  dock.appendChild(el('div', 'dock-din'));
  dock.appendChild(el('div', 'dock-sep'));
  dock.appendChild(crearItemDock('papelera'));
  actualizarDock();
}
function crearItemDock(id) {
  const it = el('div', 'dock-item');
  it.dataset.app = id;
  it.tabIndex = 0;
  it.setAttribute('role', 'button');
  it.setAttribute('aria-label', nombreApp(id));
  it.innerHTML = `${icono(id)}<span class="punto"></span><span class="etiqueta"></span>`;
  $('.etiqueta', it).textContent = id === 'archivos' ? 'Archivos' : nombreApp(id);
  it.addEventListener('click', () => clicDock(id, it));
  it.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clicDock(id, it); } });
  it.addEventListener('contextmenu', e => { e.preventDefault(); menuDock(id, it); });
  return it;
}
const itemDock = app => $(`.dock-item[data-app="${CSS.escape(app)}"]`, dock) || (app === 'archivos' ? null : $('.dock-item[data-app="archivos"]', dock));
function clicDock(id, it) {
  cerrarTodoFlotante();
  let ws = VENTANAS.filter(v => v.app === id);
  if (ws.length && !ws.some(v => v.esc === escActual)) cambiarEscritorio(ws[0].esc);
  ws = ws.filter(v => v.esc === escActual);
  if (ws.length) {
    const vis = ws.filter(v => !v.min).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex);
    if (vis.length) enfocar(vis[0]); else restaurar(ws[ws.length - 1]);
    return;
  }
  if (id !== 'lanzador') { it.classList.remove('rebota'); void it.offsetWidth; it.classList.add('rebota'); setTimeout(() => it.classList.remove('rebota'), 1000); }
  setTimeout(() => abrirApp(id), id === 'lanzador' ? 0 : 220);
}
function menuDock(id, it) {
  const ws = VENTANAS.filter(v => v.app === id);
  const r = it.getBoundingClientRect();
  const items = ws.map(v => ({ t: v.titulo, marca: v === activa, a: () => restaurar(v) }));
  if (ws.length) items.push({ sep: 1 });
  if (id === 'papelera') items.push({ t: 'Abrir', a: () => abrirApp('papelera') }, { t: 'Vaciar papelera', off: !PAPELERA.length, a: vaciarPapelera });
  else if (ws.length) items.push({ t: 'Ocultar', a: () => ws.forEach(minimizar) }, { t: 'Salir', a: () => ws.forEach(cerrar) });
  else items.push({ t: 'Abrir', a: () => abrirApp(id) });
  if (id.startsWith('mi:')) items.push({ sep: 1 }, { t: 'Eliminar esta aplicación', a: () => eliminarMiApp(id.slice(3)) });
  mostrarMenu(items, r.left, r.top - 8, null, true);
}
function actualizarDock() {
  const abiertas = new Set(VENTANAS.map(v => v.app));
  const din = $('.dock-din', dock);
  if (!din) return;
  $$('.dock-item', din).forEach(it => { if (!abiertas.has(it.dataset.app)) it.remove(); });
  [...abiertas].filter(a => !DOCK_FIJO.includes(a) && a !== 'papelera' && (a.startsWith('juego:') || APPS[a])).forEach(a => {
    if (!$(`.dock-item[data-app="${CSS.escape(a)}"]`, din)) din.appendChild(crearItemDock(a));
  });
  $('.dock-sep.din', dock).classList.toggle('ver', !!$('.dock-item', din));
  $$('.dock-item', dock).forEach(it => it.classList.toggle('abierta', abiertas.has(it.dataset.app)));
}
function refrescarPapelera() {
  const it = $('.dock-item[data-app="papelera"]', dock);
  if (it) it.firstElementChild.outerHTML = iconoPapelera();
  VENTANAS.filter(v => v.api && v.api.refrescar).forEach(v => v.api.refrescar());
}
/* Efecto de ampliación */
dock.addEventListener('mousemove', ev => {
  if (!AJ.ampliar) return;
  const base = AJ.dockTam, max = base * 1.65, rango = base * 2.8;
  $$('.dock-item', dock).forEach(it => {
    const r = it.getBoundingClientRect();
    const d = Math.abs(ev.clientX - (r.left + r.width / 2));
    let k = Math.max(0, 1 - d / rango); k = k * k * (3 - 2 * k);
    const s = Math.round(base + (max - base) * k);
    it.style.width = it.style.height = s + 'px';
  });
});
dock.addEventListener('mouseleave', () => $$('.dock-item', dock).forEach(it => { it.style.width = it.style.height = ''; }));

/* =========================================================
   Barra de menús y menús desplegables
   ========================================================= */
let menuAbierto = null;
function mostrarMenu(items, x, y, origen, haciaArriba) {
  cerrarMenus();
  const m = el('div', 'menu-flotante');
  m.setAttribute('role', 'menu');
  items.forEach(it => {
    if (it.sep) { m.appendChild(el('div', 'm-sep')); return; }
    const b = el('button', 'm-item' + (it.off ? ' off' : ''), `<span class="m-marca">${it.marca ? '✓' : ''}</span><span class="m-t"></span><span class="m-k">${esc(it.k || '')}</span>`);
    b.setAttribute('role', 'menuitem');
    $('.m-t', b).textContent = it.t;
    if (!it.off) b.addEventListener('click', () => { cerrarMenus(); it.a && it.a(); });
    m.appendChild(b);
  });
  $('#escritorio').appendChild(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(4, Math.min(x, innerWidth - r.width - 6)) + 'px';
  m.style.top = (haciaArriba ? Math.max(34, y - r.height) : Math.min(y, innerHeight - r.height - 6)) + 'px';
  menuAbierto = { m, origen };
  if (origen) origen.classList.add('abierto');
}
function cerrarMenus() {
  if (!menuAbierto) return;
  menuAbierto.m.remove();
  if (menuAbierto.origen) menuAbierto.origen.classList.remove('abierto');
  menuAbierto = null;
}
function appActiva() { return activa ? activa.app : null; }
function actualizarMenuApp() { $('#mb-app').textContent = nombreApp(appActiva()); }

function itemsMenu(nombre) {
  const app = appActiva(), nom = nombreApp(app);
  const propias = app ? VENTANAS.filter(v => v.app === app) : [];
  switch (nombre) {
    case 'sistema': return [
      { t: 'Acerca de este equipo', a: () => abrirApp('ajustes', 'info') },
      { sep: 1 },
      { t: 'Ajustes del sistema…', a: () => abrirApp('ajustes') },
      { t: 'Juegos', a: () => abrirApp('juegos') },
      { sep: 1 },
      { t: 'Forzar salida…', k: '⌥⌘⎋', a: forzarSalida },
      { sep: 1 },
      { t: 'Reposo', a: reposo },
      { t: 'Reiniciar…', a: reiniciar },
      { t: 'Apagar equipo…', a: apagar },
      { sep: 1 },
      { t: 'Bloquear pantalla', k: '⌃⌘Q', a: bloquear },
      { t: `Cerrar la sesión de ${AJ.usuario}…`, a: bloquear }
    ];
    case 'app': return [
      { t: `Acerca de ${nom}`, a: () => acercaDe(app) },
      { sep: 1 },
      { t: 'Ajustes…', k: '⌘,', a: () => abrirApp('ajustes') },
      { sep: 1 },
      { t: `Ocultar ${nom}`, k: '⌘H', off: !propias.length, a: () => propias.forEach(minimizar) },
      { t: 'Ocultar otros', off: !VENTANAS.length, a: () => VENTANAS.filter(v => v.app !== app).forEach(minimizar) },
      { sep: 1 },
      { t: `Salir de ${nom}`, k: '⌘Q', off: !propias.length, a: () => propias.slice().forEach(cerrar) }
    ];
    case 'archivo': return [
      { t: 'Nueva ventana de Archivos', k: '⌘N', a: () => abrirApp('archivos') },
      { t: 'Nueva nota', a: () => abrirApp('notas', 'nueva') },
      { t: 'Nueva pestaña del Navegador', a: () => abrirApp('navegador') },
      { t: 'Nueva ventana de Terminal', a: () => abrirApp('terminal') },
      { sep: 1 },
      { t: 'Abrir Juegos', a: () => abrirApp('juegos') },
      { sep: 1 },
      { t: 'Cerrar ventana', k: '⌘W', off: !activa, a: () => activa && cerrar(activa) }
    ];
    case 'edicion': return [
      { t: 'Deshacer', k: '⌘Z', off: true }, { t: 'Rehacer', k: '⇧⌘Z', off: true },
      { sep: 1 },
      { t: 'Cortar', k: '⌘X', off: true }, { t: 'Copiar', k: '⌘C', off: true }, { t: 'Pegar', k: '⌘V', off: true },
      { sep: 1 },
      { t: 'Buscar…', k: '⌃Espacio', a: abrirBuscador }
    ];
    case 'visualizacion': return [
      { t: document.fullscreenElement ? 'Salir de pantalla completa' : 'Entrar en pantalla completa', k: '⌃⌘F', a: pantallaCompleta },
      { sep: 1 },
      { t: 'Mostrar Lanzador', k: 'F4', a: alternarLanzador },
      { t: 'Mission Control', k: 'F3', a: misionControl },
      { t: 'Centro de notificaciones', a: () => alternarPanel('notif') },
      { t: 'Centro de control', a: () => alternarPanel('cc') }
    ];
    case 'ventana': return [
      { t: 'Minimizar', k: '⌘M', off: !activa, a: () => minimizar(activa) },
      { t: 'Ampliar', off: !activa || activa.fijo, a: () => ampliar(activa) },
      { t: 'Organizar en mosaico', off: !VENTANAS.length, a: mosaico },
      ...Array.from({ length: AJ.escritorios }, (_, i) => ({ t: `Mover a Escritorio ${i + 1}`, off: !activa || activa.esc === i, a: () => moverAEscritorio(activa, i) })),
      { t: 'Traer todo al frente', off: !VENTANAS.length, a: () => VENTANAS.forEach(restaurar) },
      ...(VENTANAS.length ? [{ sep: 1 }] : []),
      ...VENTANAS.map(v => ({ t: v.titulo, marca: v === activa, a: () => restaurar(v) }))
    ];
    case 'ayuda': return [
      { t: 'Ayuda de BahíaOS', a: () => abrirApp('notas', 'ayuda') },
      { t: 'Atajos de teclado', a: mostrarAtajos }
    ];
  }
  return [];
}
$$('#barra-menu [data-menu]').forEach(b => {
  const abrir = () => { const r = b.getBoundingClientRect(); mostrarMenu(itemsMenu(b.dataset.menu), r.left, ALTO_MENU + 3, b); };
  b.addEventListener('click', () => {
    const ya = menuAbierto && menuAbierto.origen === b;
    cerrarTodoFlotante();
    if (!ya) abrir();
  });
  b.addEventListener('mouseenter', () => { if (menuAbierto && menuAbierto.origen && menuAbierto.origen !== b) abrir(); });
});

/* Reloj y batería */
function textoReloj(d) {
  const sem = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const mes = d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  return `${sem[0].toUpperCase() + sem.slice(1)} ${d.getDate()} ${mes} ${hora}`;
}
let ultimoDia = new Date().getDate();
function tic() {
  const d = new Date();
  $('#mb-reloj').textContent = textoReloj(d);
  if (!$('#bloqueo').hidden) {
    $('#bl-hora').textContent = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const f = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#bl-fecha').textContent = f[0].toUpperCase() + f.slice(1);
  }
  if (d.getDate() !== ultimoDia) { ultimoDia = d.getDate(); const c = $('.dock-item[data-app="calendario"]', dock); if (c) c.firstElementChild.outerHTML = iconoCalendario(); }
}
setInterval(tic, 1000);
function pintarBateria(nivel, cargando) { $('#mb-bateria').innerHTML = `${Math.round(nivel * 100)} %${bateriaSVG(nivel, cargando)}`; }
pintarBateria(1, true);
if (navigator.getBattery) {
  navigator.getBattery().then(b => {
    const f = () => pintarBateria(b.level, b.charging);
    f(); b.addEventListener('levelchange', f); b.addEventListener('chargingchange', f);
  }).catch(() => {});
}
function pintarWifi() { $('#mb-wifi').innerHTML = SVG.wifi(AJ.wifi); }

/* =========================================================
   Centro de control y centro de notificaciones
   ========================================================= */
const cc = $('#centro-control'), notif = $('#centro-notif');
function refrescarCC() {
  pintarWifi();
  const osc = temaOscuro();
  cc.innerHTML = `
    <div class="cc-mod cc-conex vidrio">
      <button class="cc-fila${AJ.wifi ? ' on' : ''}" data-t="wifi"><span class="cc-burbuja">${SVG.wifi(true)}</span><span><b>Wi‑Fi</b><small>${AJ.wifi ? 'Casa' : 'Desactivado'}</small></span></button>
      <button class="cc-fila${AJ.bt ? ' on' : ''}" data-t="bt"><span class="cc-burbuja">${SVG.bt}</span><span><b>Bluetooth</b><small>${AJ.bt ? 'Activado' : 'Desactivado'}</small></span></button>
      <button class="cc-fila${AJ.compartir ? ' on' : ''}" data-t="compartir"><span class="cc-burbuja">${SVG.compartir}</span><span><b>Compartir</b><small>${AJ.compartir ? 'Solo contactos' : 'Desactivado'}</small></span></button>
    </div>
    <button class="cc-mod cc-tile vidrio${AJ.noMolestar ? ' on' : ''}" data-t="noMolestar"><span class="cc-burbuja">${SVG.luna}</span><b>No molestar</b></button>
    <button class="cc-mod cc-tile vidrio${osc ? ' on' : ''}" data-t="oscuro"><span class="cc-burbuja">${SVG.medio}</span><b>Modo oscuro</b></button>
    <div class="cc-mod cc-ancho vidrio"><b>Pantalla</b><input class="deslizador" id="cc-brillo" type="range" min="25" max="100" value="${AJ.brillo}" aria-label="Brillo"></div>
    <div class="cc-mod cc-ancho vidrio"><b>Sonido</b><input class="deslizador" id="cc-volumen" type="range" min="0" max="100" value="${AJ.volumen}" aria-label="Volumen"></div>`;
  $$('[data-t]', cc).forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.t;
    if (t === 'oscuro') { AJ.tema = temaOscuro() ? 'claro' : 'oscuro'; aplicarTema(); }
    else AJ[t] = !AJ[t];
    guardarAj(); refrescarCC(); refrescarAjustes();
  }));
  $('#cc-brillo', cc).addEventListener('input', e => { AJ.brillo = +e.target.value; aplicarTema(); guardarAj(); });
  $('#cc-volumen', cc).addEventListener('input', e => { AJ.volumen = +e.target.value; guardarAj(); });
  $('#cc-volumen', cc).addEventListener('change', () => sonido());
}
const HISTORIAL = [];
function miniMes(fecha) {
  const a = fecha.getFullYear(), m = fecha.getMonth();
  const primero = (new Date(a, m, 1).getDay() + 6) % 7;
  const dias = new Date(a, m + 1, 0).getDate();
  let h = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => `<span class="cab">${d}</span>`).join('');
  for (let i = 0; i < primero; i++) h += '<span></span>';
  for (let d = 1; d <= dias; d++) h += `<span class="${d === fecha.getDate() ? 'hoy' : ''}">${d}</span>`;
  return `<div class="mini-mes">${h}</div>`;
}
function refrescarNotif() {
  const h = new Date();
  const ultima = NOTAS.slice().sort((a, b) => b.fecha - a.fecha)[0];
  const lista = (RECIENTES.length ? RECIENTES.map(juegoPorId).filter(Boolean) : JUEGOS).slice(0, 4);
  notif.innerHTML = `
    ${HISTORIAL.slice(0, 3).map(n => `<div class="notif-item vidrio"><div class="img">${n.icono}</div><div><b>${esc(n.titulo)}</b><div>${esc(n.texto)}</div><small>${n.hora}</small></div></div>`).join('')}
    <div class="widget vidrio"><div class="w-hoy"><span class="dia">${h.getDate()}</span><span class="sem">${h.toLocaleDateString('es-ES', { weekday: 'long', month: 'long' })}</span></div>${miniMes(h)}</div>
    ${lista.length ? `<div class="widget vidrio"><h4>${RECIENTES.length ? 'Jugados recientemente' : 'Juegos'}</h4><div class="w-juegos">${lista.map(j => `<button data-j="${esc(j.carpeta)}"><span class="img">${iconoJuego(j)}</span>${esc(j.nombre)}</button>`).join('')}</div></div>` : ''}
    ${ultima ? `<button class="widget vidrio w-nota" data-nota="${esc(ultima.id)}" style="text-align:left"><h4>Notas</h4><b>${esc(tituloNota(ultima))}</b>${esc(ultima.texto.split('\n').slice(1).join('\n').trim().slice(0, 160))}</button>` : ''}`;
  $$('[data-j]', notif).forEach(b => b.addEventListener('click', () => { abrirJuego(b.dataset.j); }));
  $$('[data-nota]', notif).forEach(b => b.addEventListener('click', () => abrirApp('notas', b.dataset.nota)));
}
function alternarPanel(cual) {
  const p = cual === 'cc' ? cc : notif;
  const abrir = p.hidden;
  cerrarTodoFlotante();
  if (abrir) { cual === 'cc' ? refrescarCC() : refrescarNotif(); p.hidden = false; }
}
$('#mb-cc').addEventListener('click', () => alternarPanel('cc'));
$('#mb-wifi').addEventListener('click', () => alternarPanel('cc'));
$('#mb-reloj').addEventListener('click', () => alternarPanel('notif'));
$('#mb-buscar').addEventListener('click', () => { $('#buscador').hidden ? abrirBuscador() : cerrarBuscador(); });

/* Notificaciones emergentes */
let ctxAudio = null;
function sonido() { sonar('aviso'); }
function sonidoViejo() {
  if (!AJ.volumen) return;
  try {
    ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)();
    const t = ctxAudio.currentTime, o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(1320, t); o.frequency.exponentialRampToValueAtTime(880, t + .12);
    g.gain.setValueAtTime(AJ.volumen / 100 * .18, t); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
    o.connect(g).connect(ctxAudio.destination); o.start(t); o.stop(t + .32);
  } catch (e) {}
}
function notificar(titulo, texto, iconoHtml) {
  const hora = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  HISTORIAL.unshift({ titulo, texto, icono: iconoHtml || icono('ajustes'), hora });
  if (AJ.noMolestar) return;
  const n = el('div', 'aviso vidrio', `<div class="img">${iconoHtml || icono('ajustes')}</div><div><b></b><p></p></div>`);
  $('b', n).textContent = titulo; $('p', n).textContent = texto;
  n.addEventListener('click', () => quitar());
  $('#avisos').appendChild(n);
  sonido();
  const quitar = () => { n.classList.add('fuera'); setTimeout(() => n.remove(), 300); };
  setTimeout(quitar, 5500);
}

/* =========================================================
   Lanzador
   ========================================================= */
const lz = $('#lanzador');
function todosLosLanzables() {
  const apps = Object.keys(APPS).filter(id => !['lanzador', 'papelera'].includes(id)).map(id => ({ id, nombre: id === 'archivos' ? 'Archivos' : nombreApp(id), icono: icono(id) }));
  const juegos = JUEGOS.map(j => ({ id: 'juego:' + j.carpeta, nombre: j.nombre, icono: iconoJuego(j) }));
  return [...apps, ...juegos];
}
function pintarLanzador(q) {
  const lista = todosLosLanzables().filter(x => !q || normal(x.nombre).includes(normal(q)));
  const r = $('#lz-rejilla');
  r.innerHTML = lista.length ? '' : '<div class="lz-vacio">Sin resultados</div>';
  lista.forEach(x => {
    const b = el('button', 'lz-item', `<span class="img">${x.icono}</span><span class="nom"></span>`);
    $('.nom', b).textContent = x.nombre;
    b.addEventListener('click', e => { e.stopPropagation(); cerrarLanzador(); abrirApp(x.id); });
    r.appendChild(b);
  });
}
function alternarLanzador() {
  if (!lz.hidden) return cerrarLanzador();
  cerrarTodoFlotante();
  lz.hidden = false; lz.classList.remove('saliendo');
  capaV.style.transition = 'opacity .2s'; capaV.style.opacity = '0';
  $('#lz-input').value = '';
  pintarLanzador('');
  setTimeout(() => $('#lz-input').focus(), 30);
}
function cerrarLanzador() {
  if (lz.hidden) return;
  lz.classList.add('saliendo');
  capaV.style.opacity = '';
  setTimeout(() => { lz.hidden = true; lz.classList.remove('saliendo'); }, 190);
}
$('#lz-input').addEventListener('input', e => pintarLanzador(e.target.value));
$('#lz-input').addEventListener('keydown', e => { if (e.key === 'Enter') { const b = $('.lz-item', lz); if (b) b.click(); } });
lz.addEventListener('click', e => { if (!e.target.closest('.lz-item, .lz-buscar')) cerrarLanzador(); });

/* =========================================================
   Buscador
   ========================================================= */
const bus = $('#buscador'), spIn = $('#sp-input'), spRes = $('#sp-resultados');
let spLista = [], spSel = 0;
function abrirBuscador() {
  cerrarTodoFlotante();
  bus.hidden = false; spIn.value = ''; pintarBuscador('');
  setTimeout(() => spIn.focus(), 20);
}
function cerrarBuscador() { bus.hidden = true; }
function calcular(q) {
  const s = q.replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
  if (!/^[\d\s+\-*/().%]+$/.test(s) || !/\d/.test(s) || !/[+\-*/%]/.test(s)) return null;
  try { const r = Function('"use strict";return (' + s + ')')(); return Number.isFinite(r) ? r : null; } catch (e) { return null; }
}
function pintarBuscador(q) {
  spLista = []; spSel = 0;
  const nq = normal(q.trim());
  if (!nq) { spRes.innerHTML = ''; return; }
  const grupos = [];
  const calc = calcular(q);
  if (calc != null) grupos.push(['Calculadora', [{ html: `<span class="img">${icono('calculadora')}</span><span class="sp-calc">= ${calc.toLocaleString('es-ES', { maximumFractionDigits: 10 })}</span>`, a: () => abrirApp('calculadora') }]]);
  const apps = todosLosLanzables().filter(x => !x.id.startsWith('juego:') && normal(x.nombre).includes(nq));
  if (apps.length) grupos.push(['Aplicaciones', apps.map(x => ({ nombre: x.nombre, icono: x.icono, sub: 'Aplicación', a: () => abrirApp(x.id) }))]);
  const js = JUEGOS.filter(j => normal(j.nombre + ' ' + (j.descripcion || '')).includes(nq));
  if (js.length) grupos.push(['Juegos', js.map(j => ({ nombre: j.nombre, icono: iconoJuego(j), sub: j.descripcion || 'Juego', a: () => abrirJuego(j.carpeta) }))]);
  const ns = NOTAS.filter(n => normal(n.texto).includes(nq)).slice(0, 5);
  if (ns.length) grupos.push(['Notas', ns.map(n => ({ nombre: tituloNota(n), icono: icono('notas'), sub: 'Nota', a: () => abrirApp('notas', n.id) }))]);
  const acciones = [
    { nombre: 'Bloquear pantalla', a: bloquear }, { nombre: 'Apagar equipo', a: apagar }, { nombre: 'Reiniciar', a: reiniciar },
    { nombre: 'Fondo de pantalla', a: () => abrirApp('ajustes', 'fondo') }, { nombre: 'Modo oscuro', a: () => { AJ.tema = temaOscuro() ? 'claro' : 'oscuro'; guardarAj(); aplicarTema(); refrescarAjustes(); } },
    { nombre: 'Vaciar papelera', a: vaciarPapelera }
  ].filter(x => normal(x.nombre).includes(nq));
  const web = aURL(q);
  if (web) grupos.push(['Internet', [
    { nombre: busquedaDe(web) ? `Buscar «${q.trim()}» en Google` : `Abrir ${hostDe(web)}`, icono: icono('navegador'), sub: 'Navegador', a: () => abrirApp('navegador', web) },
    ...(busquedaDe(web) ? [{ nombre: `Buscar «${q.trim()}» en YouTube`, icono: icono('youtube'), sub: 'YouTube', a: () => abrirApp('youtube', q.trim()) }] : [])
  ]]);
  if (acciones.length) grupos.push(['Acciones', acciones.map(x => ({ ...x, icono: icono('ajustes'), sub: 'Sistema' }))]);
  spRes.innerHTML = '';
  if (!grupos.length) { spRes.innerHTML = `<div class="sp-grupo">Sin resultados para «${esc(q)}»</div>`; return; }
  grupos.forEach(([titulo, items]) => {
    spRes.appendChild(el('div', 'sp-grupo', esc(titulo)));
    items.forEach(it => {
      const i = spLista.length;
      const b = el('button', 'sp-res', it.html || `<span class="img">${it.icono}</span><span class="nom"></span><span class="sub"></span>`);
      if (!it.html) { $('.nom', b).textContent = it.nombre; $('.sub', b).textContent = it.sub; }
      b.addEventListener('click', () => { cerrarBuscador(); it.a(); });
      b.addEventListener('mousemove', () => marcarSp(i));
      spRes.appendChild(b);
      spLista.push(b);
    });
  });
  marcarSp(0);
}
function marcarSp(i) { spSel = i; spLista.forEach((b, j) => b.classList.toggle('sel', j === i)); if (spLista[i]) spLista[i].scrollIntoView({ block: 'nearest' }); }
spIn.addEventListener('input', () => pintarBuscador(spIn.value));
spIn.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown') { e.preventDefault(); marcarSp(Math.min(spLista.length - 1, spSel + 1)); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); marcarSp(Math.max(0, spSel - 1)); }
  else if (e.key === 'Enter' && spLista[spSel]) spLista[spSel].click();
});
bus.addEventListener('pointerdown', e => { if (e.target === bus) cerrarBuscador(); });

/* Cierre de paneles al hacer clic fuera */
function cerrarTodoFlotante() {
  cerrarMenus(); cc.hidden = true; notif.hidden = true; cerrarBuscador();
}
document.addEventListener('pointerdown', e => {
  if (menuAbierto && !menuAbierto.m.contains(e.target) && !e.target.closest('#barra-menu [data-menu]')) cerrarMenus();
  if (!cc.hidden && !cc.contains(e.target) && !e.target.closest('#mb-cc, #mb-wifi')) cc.hidden = true;
  if (!notif.hidden && !notif.contains(e.target) && !e.target.closest('#mb-reloj')) notif.hidden = true;
}, true);

/* =========================================================
   Escritorio: iconos y menú contextual
   ========================================================= */
const ICONOS_ESC = [
  { nombre: 'Disco BahíaOS', icono: iconoDisco, abrir: () => abrirApp('archivos', 'Disco') },
  { nombre: 'Juegos', icono: () => iconoCarpeta('🎮'), abrir: () => abrirApp('archivos', 'Juegos') },
  { nombre: 'YouTube', icono: () => icono('youtube'), abrir: () => abrirApp('youtube') },
  { nombre: 'Léeme.txt', icono: () => iconoDoc('TXT'), abrir: () => abrirApp('notas', 'ayuda') }
];
function pintarEscritorio() {
  const c = $('#iconos-escritorio');
  c.hidden = !AJ.iconosEsc;
  c.innerHTML = '';
  ICONOS_ESC.forEach(it => {
    const b = el('button', 'icono-esc', `<span class="img">${it.icono()}</span><span class="nom"></span>`);
    $('.nom', b).textContent = it.nombre;
    b.addEventListener('click', e => { e.stopPropagation(); $$('.icono-esc.sel').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); desenfocarTodo(); });
    b.addEventListener('dblclick', () => { b.classList.remove('sel'); it.abrir(); });
    b.addEventListener('keydown', e => { if (e.key === 'Enter') it.abrir(); });
    c.appendChild(b);
  });
}
const escritorio = $('#escritorio');
escritorio.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
escritorio.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer && e.dataTransfer.files.length) subirArchivos(e.dataTransfer.files); });
$('#fondo').addEventListener('pointerdown', () => { $$('.icono-esc.sel').forEach(x => x.classList.remove('sel')); desenfocarTodo(); cerrarTodoFlotante(); });
escritorio.addEventListener('contextmenu', e => {
  if (e.target.closest('.ventana, #dock, #barra-menu, .panel-flotante, #lanzador, #buscador, .menu-flotante')) { if (!e.target.closest('input, textarea')) e.preventDefault(); return; }
  e.preventDefault();
  mostrarMenu([
    { t: 'Nueva nota', a: () => abrirApp('notas', 'nueva') },
    { t: 'Abrir carpeta Juegos', a: () => abrirApp('juegos') },
    { t: 'Subir juego HTML…', a: elegirJuegos },
    { t: 'Abrir Terminal', a: () => abrirApp('terminal') },
    { sep: 1 },
    { t: 'Mostrar el Lanzador', a: alternarLanzador },
    { t: 'Mission Control', a: misionControl },
    { t: 'Organizar ventanas en mosaico', off: !VENTANAS.length, a: mosaico },
    { sep: 1 },
    { t: 'Cambiar fondo de pantalla…', a: () => abrirApp('ajustes', 'fondo') },
    { sep: 1 },
    ...Object.entries(TIPOS_WIDGET).map(([k, n]) => ({ t: `Añadir widget: ${n}`, a: () => anadirWidget(k) })),
    { sep: 1 },
    { t: 'Hacer una captura de pantalla', k: '⌃⇧3', a: () => setTimeout(() => hacerCaptura(false), 200) },
    { t: 'Grabar la pantalla…', k: '⌃⇧5', a: () => abrirApp('grabadora') }
  ], e.clientX, e.clientY);
});

/* =========================================================
   Atajos de teclado globales
   ========================================================= */
document.addEventListener('keydown', e => {
  if (!$('#bloqueo').hidden) { if (e.key === 'Enter' && !(e.target.matches && e.target.matches('input'))) { e.preventDefault(); desbloquear(); } return; }
  if (!$('#apagado').hidden || !$('#arranque').hidden) return;
  if ((e.ctrlKey || e.metaKey) && e.code === 'Space') { e.preventDefault(); bus.hidden ? abrirBuscador() : cerrarBuscador(); return; }
  if (e.key === 'F4') { e.preventDefault(); alternarLanzador(); return; }
  if (e.key === 'F3' || (e.ctrlKey && e.key === 'ArrowUp')) { e.preventDefault(); misionControl(); return; }
  if (e.key === 'Escape' && mc) { salirMC(); return; }
  if (e.ctrlKey && !e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !(e.target.matches && e.target.matches('input, textarea'))) { e.preventDefault(); cambiarEscritorio(escActual + (e.key === 'ArrowLeft' ? -1 : 1)); return; }
  if (e.ctrlKey && e.shiftKey && (e.code === 'Digit3' || e.code === 'Digit4')) { e.preventDefault(); hacerCaptura(e.code === 'Digit4'); return; }
  if (e.ctrlKey && e.shiftKey && e.code === 'Digit5') { e.preventDefault(); abrirApp('grabadora'); return; }
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') { e.preventDefault(); abrirApp('chispa'); return; }
  if (e.key === 'Escape') {
    if (!lz.hidden) return cerrarLanzador();
    if (!bus.hidden || menuAbierto || !cc.hidden || !notif.hidden) return cerrarTodoFlotante();
  }
  if (e.altKey && e.key.toLowerCase() === 'w' && activa) { e.preventDefault(); cerrar(activa); return; }
  if (e.altKey && e.key.toLowerCase() === 'm' && activa) { e.preventDefault(); minimizar(activa); return; }
  const t = e.target;
  if (activa && activa.alTeclado && !(t.matches && t.matches('input, textarea'))) activa.alTeclado(e);
});

/* =========================================================
   Arranque, bloqueo, reposo y apagado
   ========================================================= */
let haEntrado = false;
function arrancar() {
  let volver = null;
  try { volver = sessionStorage.getItem('bahia.volver'); sessionStorage.removeItem('bahia.volver'); } catch (e) {}
  if (volver) {
    $('#arranque').hidden = true; $('#bloqueo').hidden = true; haEntrado = true;
    if (volver === 'escritorio') return;
    setTimeout(() => {
      abrirApp(volver);
      comprobarExtension().then(ok => notificar(ok ? 'Extensión activada' : 'Todavía no está activada',
        ok ? 'YouTube ya puede usar tu cuenta.' : 'Repite los pasos del asistente. Si no aparece «Cargar desempaquetada», activa antes «Modo de desarrollador».', icono('youtube')));
    }, 300);
    return;
  }
  const a = $('#arranque'), barra = $('.progreso i', a);
  $('#apagado').hidden = true;
  if (AJ.sonidoArranque !== false) setTimeout(() => sonar('arranque'), 250);
  a.hidden = false; a.classList.remove('fuera');
  barra.style.width = '0';
  let p = 0;
  const t = setInterval(() => {
    p += Math.random() * 16 + 7;
    barra.style.width = Math.min(p, 100) + '%';
    if (p >= 100) {
      clearInterval(t);
      setTimeout(() => { mostrarBloqueo(); a.classList.add('fuera'); setTimeout(() => { a.hidden = true; }, 600); }, 350);
    }
  }, 170);
}
function mostrarBloqueo() {
  cerrarTodoFlotante(); cerrarLanzador();
  const b = $('#bloqueo');
  b.hidden = false; b.classList.remove('fuera');
  pintarUsuariosBloqueo();
  tic();
}
function desbloquear(forzar) {
  const b = $('#bloqueo');
  if (b.classList.contains('fuera')) return;
  if (forzar !== true) { intentarEntrar(); return; }
  sonar('entrar');
  b.classList.add('fuera');
  setTimeout(() => { b.hidden = true; }, 500);
  if (!haEntrado) {
    haEntrado = true;
    setTimeout(() => notificar('Te damos la bienvenida', ES_ANDROID ? `Tienes ${JUEGOS.length} juegos en la carpeta Juegos. Toca la lupa de arriba para buscar cualquier cosa.` : `Tienes ${JUEGOS.length} juegos en la carpeta Juegos. Pulsa Ctrl + Espacio para buscar cualquier cosa.`, icono('juegos')), 900);
  }
}

const bloquear = () => mostrarBloqueo();
function apagarPantalla(texto, alClic) {
  cerrarTodoFlotante(); cerrarLanzador();
  const ap = $('#apagado');
  $('#apagado-texto').textContent = texto;
  ap.hidden = false;
  ap.onclick = alClic;
}
function reposo() { apagarPantalla('', () => { $('#apagado').hidden = true; mostrarBloqueo(); }); }
function apagar() {
  if (ES_ANDROID && window.AndroidBahia) { try { AndroidBahia.salir(); } catch (e) {} return; }
  VENTANAS.slice().forEach(cerrar);
  apagarPantalla('', null);
  setTimeout(() => {
    try { window.close(); } catch (e) {}
    $('#apagado-texto').textContent = 'Haz clic para encender';
    $('#apagado').onclick = () => { haEntrado = false; arrancar(); };
  }, 1300);
}
function reiniciar() {
  VENTANAS.slice().forEach(cerrar);
  apagarPantalla('', null);
  setTimeout(() => { haEntrado = false; arrancar(); }, 1300);
}
function pantallaCompleta() {
  try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {}
}
$('#arranque').addEventListener('click', () => { $('.progreso i').style.width = '100%'; });

/* =========================================================
   Ventanas pequeñas del sistema
   ========================================================= */
function acercaDe(app) {
  const c = el('div', 'info-mini', `<span class="img">${app ? icono(app) : icono('archivos')}</span><h3></h3><p>Versión 1.0</p><p>BahíaOS · ${new Date().getFullYear()}</p>`);
  $('h3', c).textContent = app && app !== 'archivos' ? nombreApp(app) : 'Archivos';
  abrirVentana({ app: 'ajustes', titulo: '', ancho: 280, alto: 240, contenido: c, fijo: true });
}
function mostrarAtajos() {
  const filas = [
    ['Abrir el buscador', 'Ctrl + Espacio'], ['Mostrar el Lanzador', 'F4'], ['Mission Control (ver todas las ventanas)', 'F3'], ['Animaciones a cámara lenta', 'Mayús + clic'], ['Cerrar la ventana activa', 'Alt + W'],
    ['Minimizar la ventana activa', 'Alt + M'], ['Ampliar una ventana', 'Doble clic en su barra'], ['Cerrar menús y paneles', 'Esc'],
    ['Abrir un icono del escritorio', 'Doble clic'], ['Menú del Dock', 'Clic derecho en un icono']
  ];
  const c = el('div', 'atajos', `<table>${filas.map(f => `<tr><td>${f[0]}</td><td style="text-align:right"><kbd>${f[1]}</kbd></td></tr>`).join('')}</table>`);
  abrirVentana({ app: 'ajustes', titulo: 'Atajos de teclado', ancho: 440, alto: 380, contenido: c });
}
function forzarSalida() {
  let sel = null;
  const c = el('div', 'forzar', `<p style="margin:0;font-size:12px;color:var(--texto2)">Si una app no responde, selecciónala y pulsa «Forzar salida».</p><div class="forzar-lista"></div><div style="display:flex;justify-content:flex-end"><button class="boton primario">Forzar salida</button></div>`);
  const pintar = () => {
    const l = $('.forzar-lista', c); l.innerHTML = '';
    const apps = [...new Set(VENTANAS.map(v => v.app))].filter(a => a !== 'ajustes' || VENTANAS.filter(v => v.app === 'ajustes').length > 1);
    if (!apps.length) l.innerHTML = '<p style="padding:10px;margin:0;color:var(--texto2)">No hay apps abiertas.</p>';
    apps.forEach(a => {
      const b = el('button', a === sel ? 'sel' : '', `<span class="img">${icono(a)}</span><span></span>`);
      b.lastChild.textContent = nombreApp(a);
      b.addEventListener('click', () => { sel = a; pintar(); });
      l.appendChild(b);
    });
  };
  $('.boton', c).addEventListener('click', () => { if (sel) { VENTANAS.filter(v => v.app === sel && v !== win).forEach(cerrar); sel = null; pintar(); } });
  const win = abrirVentana({ app: 'ajustes', titulo: 'Forzar salida de las apps', ancho: 380, alto: 330, contenido: c, fijo: true });
  pintar();
}

/* =========================================================
   Juegos subidos (se guardan dentro de BahíaOS)
   ========================================================= */
const BD = (() => {
  let p = null;
  const ALMACENES = ['juegos', 'canciones', 'fotos', 'apps'];
  const abrirBD = () => p || (p = new Promise((ok, mal) => {
    try {
      const r = indexedDB.open('bahiaos', 3);
      r.onupgradeneeded = () => { ALMACENES.forEach(a => { if (!r.result.objectStoreNames.contains(a)) r.result.createObjectStore(a, { keyPath: 'id' }); }); };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => mal(r.error);
    } catch (e) { mal(e); }
  }));
  const tx = (almacen, modo, fn) => abrirBD().then(db => new Promise((ok, mal) => {
    const t = db.transaction(almacen, modo), r = fn(t.objectStore(almacen));
    t.oncomplete = () => ok(r && r.result);
    t.onerror = () => mal(t.error);
  }));
  return {
    todos: (a = 'juegos') => tx(a, 'readonly', s => s.getAll()),
    poner: (j, a = 'juegos') => tx(a, 'readwrite', s => s.put(j)),
    quitar: (id, a = 'juegos') => tx(a, 'readwrite', s => s.delete(id))
  };
})();
function registrarSubido(d) {
  if (JUEGOS.some(j => j.carpeta === d.id)) return;
  JUEGOS.push({ carpeta: d.id, nombre: d.nombre, icono: d.icono || '🕹️', color: colorDe(d.id), ancho: 820, alto: 620, descripcion: 'Juego subido', subido: true, html: d.html });
}
function refrescarJuegos() { VENTANAS.filter(v => v.api && v.api.refrescar).forEach(v => v.api.refrescar()); }
function elegirJuegos() {
  const i = document.createElement('input');
  i.type = 'file'; i.accept = '.html,.htm,text/html'; i.multiple = true;
  i.addEventListener('change', () => subirArchivos(i.files));
  i.click();
}
function subirArchivos(lista) {
  const todos = [...(lista || [])];
  const audio = todos.filter(f => /^audio\//.test(f.type) || /\.(mp3|m4a|wav|ogg|flac|aac)$/i.test(f.name));
  const imagen = todos.filter(f => /^(image|video)\//.test(f.type) || /\.(png|jpe?g|gif|webp|mp4|webm)$/i.test(f.name));
  if (audio.length) anadirCanciones(audio);
  if (imagen.length) importarFotos(imagen, 'Importadas');
  const files = todos.filter(f => !audio.includes(f) && !imagen.includes(f));
  if (!files.length) return;
  const html = files.filter(f => /\.html?$/i.test(f.name));
  if (!html.length) { if (files.length) notificar('Ese archivo no es un juego HTML', 'Solo se pueden subir archivos .html. Si tu juego tiene imágenes o sonidos aparte, mete su carpeta entera dentro de la carpeta juegos.', icono('juegos')); return; }
  html.forEach(f => {
    const r = new FileReader();
    r.onload = () => {
      const texto = String(r.result);
      const m = texto.match(/<title[^>]*>\s*([^<]{1,60}?)\s*<\/title>/i);
      const nombre = (m && m[1].trim()) || f.name.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ');
      const d = { id: 'subido-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nombre, html: texto, fecha: Date.now() };
      BD.poner(d).then(() => {
        registrarSubido(d); refrescarJuegos();
        notificar('Juego añadido', `«${nombre}» ya está en la carpeta Juegos.`, iconoJuego(juegoPorId(d.id)));
      }).catch(() => notificar('No se pudo guardar el juego', 'Prueba a meterlo en la carpeta juegos de BahíaOS.', icono('juegos')));
    };
    r.readAsText(f);
  });
}
function eliminarSubido(j) {
  BD.quitar(j.carpeta).then(() => {
    const i = JUEGOS.indexOf(j); if (i >= 0) JUEGOS.splice(i, 1);
    VENTANAS.filter(v => v.app === 'juego:' + j.carpeta).forEach(cerrar);
    RECIENTES = RECIENTES.filter(c => c !== j.carpeta); guardar('recientes', RECIENTES);
    refrescarJuegos();
    notificar('Juego eliminado', `«${j.nombre}» se ha quitado de BahíaOS.`, icono('juegos'));
  }).catch(() => {});
}
BD.todos().then(l => { (l || []).sort((a, b) => a.fecha - b.fecha).forEach(registrarSubido); refrescarJuegos(); }).catch(() => {});

/* =========================================================
   App: Archivos
   ========================================================= */
const LUGARES = [
  ['Favoritos', [['Escritorio', 'escritorio'], ['Documentos', 'documentos'], ['Descargas', 'descargas'], ['Aplicaciones', 'aplicaciones'], ['Juegos', 'mando']]],
  ['Ubicaciones', [['Disco', 'disco', 'Disco BahíaOS'], ['Papelera', 'papelera']]]
];
function contenidoRuta(ruta) {
  const p = ruta.split('/');
  switch (p[0]) {
    case 'Aplicaciones':
      return Object.keys(APPS).filter(id => !['juegos', 'papelera'].includes(id)).map(id => ({ nombre: id === 'archivos' ? 'Archivos' : nombreApp(id), tipo: 'Aplicación', icono: icono(id), abrir: () => abrirApp(id) }));
    case 'Juegos':
      if (p[1]) {
        const j = juegoPorId(p[1]);
        if (!j) return [];
        return [
          { nombre: j.nombre, tipo: 'Juego', icono: iconoJuego(j), abrir: () => abrirJuego(j.carpeta), juego: j },
          { nombre: j.ruta ? j.ruta.split('/').pop() : 'index.html', tipo: 'Documento HTML', icono: iconoDoc('HTML'), abrir: () => abrirJuego(j.carpeta) }
        ];
      }
      return JUEGOS.map(j => (j.subido || (j.ruta && j.carpeta.startsWith('archivo-')))
        ? { nombre: j.nombre, tipo: j.subido ? 'Juego subido' : 'Juego HTML', icono: iconoJuego(j), abrir: () => abrirJuego(j.carpeta), juego: j }
        : { nombre: j.nombre, tipo: 'Carpeta', icono: iconoCarpeta(j.icono), ir: 'Juegos/' + j.carpeta, juego: j });
    case 'Documentos':
      return NOTAS.slice().sort((a, b) => b.fecha - a.fecha).map(n => ({ nombre: tituloNota(n) + '.txt', tipo: 'Documento de texto', icono: iconoDoc('TXT'), abrir: () => abrirApp('notas', n.id) }));
    case 'Descargas': return [];
    case 'Escritorio': return ICONOS_ESC.map(i => ({ nombre: i.nombre, tipo: i.nombre.endsWith('.txt') ? 'Documento de texto' : 'Carpeta', icono: i.icono(), abrir: i.abrir }));
    case 'Papelera':
      return PAPELERA.map((x, i) => ({ nombre: x.nombre, tipo: 'Nota eliminada · doble clic para recuperar', icono: iconoDoc('TXT'), abrir: () => recuperar(i) }));
    case 'Disco':
      return ['Aplicaciones', 'Documentos', 'Descargas', 'Juegos'].map(n => ({ nombre: n, tipo: 'Carpeta', icono: iconoCarpeta(), ir: n }));
  }
  return [];
}
function recuperar(i) {
  const x = PAPELERA.splice(i, 1)[0];
  if (x && x.nota) { NOTAS.unshift(x.nota); guardarNotas(); }
  guardarPapelera();
  notificar('Nota recuperada', `«${x ? x.nombre : ''}» ha vuelto a Notas.`, icono('notas'));
}
function vaciarPapelera() {
  if (!PAPELERA.length) return;
  PAPELERA = []; guardarPapelera(); sonar('papelera');
  notificar('Papelera vaciada', 'Los elementos se han eliminado para siempre.', iconoPapelera());
}

function appArchivos(ruta) {
  ruta = ruta || 'Escritorio';
  const raizF = el('div', 'finder');
  raizF.innerHTML = `<aside class="lateral"></aside><div class="f-principal"><div class="f-contenido" tabindex="0"></div><div class="f-estado"></div></div>`;
  const herr = el('div', 'f-herr', `
    <button class="h-boton" data-a="atras" aria-label="Atrás">${SVG.atras}</button>
    <button class="h-boton" data-a="adelante" aria-label="Adelante">${SVG.adelante}</button>
    <span class="f-ruta"></span><span class="f-hueco"></span>
    <button class="boton" data-a="vaciar" hidden>Vaciar</button>
    <button class="boton" data-a="subir" hidden>Subir juego…</button>
    <div class="segmento"><button data-vista="iconos" aria-label="Iconos">${SVG.rejilla}</button><button data-vista="lista" aria-label="Lista">${SVG.listado}</button></div>
    <label class="campo-busca">${SVG.lupa}<input placeholder="Buscar" aria-label="Buscar en la carpeta"></label>`);
  let hist = [ruta], pos = 0, vista = leer('vistaArchivos', 'iconos'), filtro = '';
  const cont = $('.f-contenido', raizF);

  const lat = $('.lateral', raizF);
  LUGARES.forEach(([g, items]) => {
    lat.appendChild(el('div', 'lat-grupo', g));
    items.forEach(([r, ic, etiqueta]) => {
      const b = el('button', 'lat-enlace', `${SVG[ic]}<span></span>`);
      b.dataset.r = r; b.lastChild.textContent = etiqueta || r;
      b.addEventListener('click', () => ir(r));
      lat.appendChild(b);
    });
  });

  function ir(r) { hist = hist.slice(0, pos + 1); hist.push(r); pos++; filtro = ''; $('input', herr).value = ''; pintar(); }
  function pintar() {
    const r = hist[pos];
    const partes = r.split('/');
    const titulo = partes[0] === 'Disco' ? 'Disco BahíaOS' : partes[0] === 'Juegos' && partes[1] ? (juegoPorId(partes[1]) || {}).nombre || partes[1] : partes[0];
    $('.f-ruta', herr).textContent = titulo;
    v.titulo = titulo; v.el.setAttribute('aria-label', titulo);
    $$('.lat-enlace', lat).forEach(b => b.classList.toggle('activo', b.dataset.r === partes[0]));
    $('[data-a="atras"]', herr).disabled = pos === 0;
    $('[data-a="adelante"]', herr).disabled = pos >= hist.length - 1;
    $('[data-a="vaciar"]', herr).hidden = partes[0] !== 'Papelera';
    $('[data-a="vaciar"]', herr).disabled = !PAPELERA.length;
    $('[data-a="subir"]', herr).hidden = partes[0] !== 'Juegos' || !!partes[1];
    $$('.segmento button', herr).forEach(b => b.classList.toggle('activo', b.dataset.vista === vista));
    const items = contenidoRuta(r).filter(x => !filtro || normal(x.nombre).includes(normal(filtro)));
    cont.className = 'f-contenido' + (vista === 'lista' ? ' lista' : '');
    cont.innerHTML = vista === 'lista' && items.length ? '<div class="f-cab"><span>Nombre</span><span>Clase</span></div>' : '';
    if (!items.length) cont.innerHTML = `<div class="f-vacio">${filtro ? 'Ningún elemento coincide con la búsqueda' : partes[0] === 'Papelera' ? 'La papelera está vacía' : partes[0] === 'Juegos' ? 'No hay juegos. Pulsa «Subir juego…» o arrastra aquí un archivo .html' : 'Esta carpeta está vacía'}</div>`;
    items.forEach(it => {
      const b = el('button', 'f-item', `<span class="img">${it.icono}</span><span class="nom"></span><span class="tipo"></span>`);
      $('.nom', b).textContent = it.nombre; $('.tipo', b).textContent = it.tipo;
      b.addEventListener('click', () => { $$('.f-item.sel', cont).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); });
      const abrirIt = () => it.ir ? ir(it.ir) : it.abrir && it.abrir();
      b.addEventListener('dblclick', abrirIt);
      b.addEventListener('contextmenu', e => {
        e.preventDefault(); e.stopPropagation();
        const j = it.juego;
        const ops = [{ t: 'Abrir', a: abrirIt }];
        if (j) ops.push({ t: 'Jugar', a: () => abrirJuego(j.carpeta) });
        if (j && j.subido) ops.push({ sep: 1 }, { t: 'Eliminar juego', a: () => eliminarSubido(j) });
        if (j && !j.subido) ops.push({ sep: 1 }, { t: j.auto ? 'Está en la carpeta juegos' : 'Está en juegos/lista.js', off: true });
        mostrarMenu(ops, e.clientX, e.clientY);
      });
      b.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); abrirIt(); } });
      cont.appendChild(b);
    });
    $('.f-estado', raizF).textContent = `${items.length} ${items.length === 1 ? 'elemento' : 'elementos'}`;
  }
  herr.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'atras' && pos > 0) { pos--; pintar(); }
    if (b.dataset.a === 'adelante' && pos < hist.length - 1) { pos++; pintar(); }
    if (b.dataset.a === 'vaciar') vaciarPapelera();
    if (b.dataset.a === 'subir') elegirJuegos();
    if (b.dataset.vista) { vista = b.dataset.vista; guardar('vistaArchivos', vista); pintar(); }
  });
  $('input', herr).addEventListener('input', e => { filtro = e.target.value; pintar(); });
  cont.addEventListener('click', e => { if (e.target === cont) $$('.f-item.sel', cont).forEach(x => x.classList.remove('sel')); });
  cont.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); cont.classList.add('soltar'); } });
  cont.addEventListener('dragleave', () => cont.classList.remove('soltar'));
  cont.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); cont.classList.remove('soltar'); subirArchivos(e.dataTransfer.files); });

  const v = abrirVentana({ app: 'archivos', titulo: 'Archivos', ancho: 820, alto: 500, contenido: raizF, herramientas: herr, barraAlta: true, sinTitulo: true,
    alTeclado: e => { if (e.key === 'Backspace' && pos > 0) { pos--; pintar(); } } });
  v.api = { refrescar: pintar };
  pintar();
}

/* =========================================================
   App: Notas
   ========================================================= */
function appNotas(arg) {
  const ya = VENTANAS.find(x => x.app === 'notas');
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); if (arg) ya.api.ir(arg); return; }
  const raizN = el('div', 'notas', `<aside class="n-lista"></aside><div class="n-editor"><div class="n-fecha"></div><textarea class="n-texto" spellcheck="false" aria-label="Texto de la nota"></textarea></div>`);
  const herr = el('div', 'v-herr', `<button class="h-boton" data-a="borrar" aria-label="Eliminar nota">${SVG.papelera}</button><button class="h-boton" data-a="nueva" aria-label="Nueva nota">${SVG.lapiz}</button>`);
  const lst = $('.n-lista', raizN), ta = $('.n-texto', raizN);
  let actual = null;
  const fechaTxt = t => {
    const d = new Date(t), h = new Date();
    if (d.toDateString() === h.toDateString()) return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: '2-digit' });
  };
  function pintarLista() {
    lst.innerHTML = '';
    NOTAS.slice().sort((a, b) => b.fecha - a.fecha).forEach(n => {
      const b = el('button', 'n-item' + (actual && n.id === actual.id ? ' activo' : ''), '<b></b><small></small>');
      $('b', b).textContent = tituloNota(n);
      $('small', b).textContent = fechaTxt(n.fecha) + '  ' + (n.texto.split('\n').slice(1).join(' ').trim() || 'Sin texto adicional');
      b.addEventListener('click', () => abrirNota(n.id));
      lst.appendChild(b);
    });
    if (!NOTAS.length) lst.innerHTML = '<p style="padding:12px;color:var(--texto2);margin:0">No hay notas</p>';
  }
  function abrirNota(id) {
    actual = NOTAS.find(n => n.id === id) || NOTAS.slice().sort((a, b) => b.fecha - a.fecha)[0] || null;
    ta.disabled = !actual;
    ta.value = actual ? actual.texto : '';
    $('.n-fecha', raizN).textContent = actual ? new Date(actual.fecha).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
    pintarLista();
  }
  function nueva() {
    const n = { id: 'n' + Date.now(), texto: '', fecha: Date.now() };
    NOTAS.unshift(n); guardarNotas(); abrirNota(n.id); ta.focus();
  }
  ta.addEventListener('input', () => {
    if (!actual) return;
    actual.texto = ta.value; actual.fecha = Date.now(); guardarNotas();
    const b = $('.n-item.activo', lst);
    if (b && lst.firstElementChild === b) { $('b', b).textContent = tituloNota(actual); $('small', b).textContent = fechaTxt(actual.fecha) + '  ' + (actual.texto.split('\n').slice(1).join(' ').trim() || 'Sin texto adicional'); }
    else pintarLista();
  });
  herr.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'nueva') nueva();
    if (b.dataset.a === 'borrar' && actual) {
      const i = NOTAS.indexOf(actual);
      NOTAS.splice(i, 1); guardarNotas();
      PAPELERA.unshift({ nombre: tituloNota(actual) + '.txt', nota: actual }); guardarPapelera();
      abrirNota(null);
    }
  });
  const v = abrirVentana({ app: 'notas', titulo: 'Notas', ancho: 780, alto: 500, contenido: raizN, herramientas: herr });
  v.api = {
    ir: a => { if (a === 'nueva') nueva(); else if (a === 'ayuda' && !NOTAS.find(n => n.id === 'ayuda')) { NOTAS.unshift({ id: 'ayuda', texto: NOTA_AYUDA, fecha: Date.now() }); guardarNotas(); abrirNota('ayuda'); } else abrirNota(a); },
    refrescar: () => { if (actual && !NOTAS.includes(actual)) abrirNota(null); else pintarLista(); }
  };
  if (arg) v.api.ir(arg); else abrirNota(null);
}

/* =========================================================
   App: Calculadora
   ========================================================= */
function appCalculadora() {
  if (existente('calculadora')) return;
  const c = el('div', 'calc', `<div class="calc-pantalla" aria-live="polite">0</div><div class="calc-teclas">
    <button class="fn" data-k="ac">AC</button><button class="fn" data-k="neg">+/−</button><button class="fn" data-k="%">%</button><button class="op" data-k="/">÷</button>
    <button data-k="7">7</button><button data-k="8">8</button><button data-k="9">9</button><button class="op" data-k="*">×</button>
    <button data-k="4">4</button><button data-k="5">5</button><button data-k="6">6</button><button class="op" data-k="-">−</button>
    <button data-k="1">1</button><button data-k="2">2</button><button data-k="3">3</button><button class="op" data-k="+">+</button>
    <button class="cero" data-k="0">0</button><button data-k=".">,</button><button class="op" data-k="=">=</button></div>`);
  const pant = $('.calc-pantalla', c);
  let cur = '0', prev = null, op = null, nuevo = true;
  const fmt = s => {
    if (s === 'Error') return s;
    const neg = s.startsWith('-'); if (neg) s = s.slice(1);
    let [ent, dec] = s.split('.');
    if (ent.length > 12) return Number((neg ? '-' : '') + s).toExponential(5).replace('.', ',');
    ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (neg ? '-' : '') + ent + (dec !== undefined ? ',' + dec : '');
  };
  const num = n => { if (!Number.isFinite(n)) return 'Error'; return String(parseFloat(n.toPrecision(12))); };
  const operar = (a, b, o) => o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? (b === 0 ? NaN : a / b) : b;
  function pintar() {
    const t = fmt(cur);
    pant.textContent = t;
    pant.style.fontSize = t.length > 11 ? '30px' : t.length > 8 ? '40px' : '52px';
    $('[data-k="ac"]', c).textContent = cur !== '0' && !nuevo ? 'C' : 'AC';
    $$('.op', c).forEach(b => b.classList.toggle('marcado', nuevo && op === b.dataset.k && b.dataset.k !== '='));
  }
  function tecla(k) {
    if (cur === 'Error' && k !== 'ac') { cur = '0'; prev = null; op = null; }
    if (/^\d$/.test(k)) { if (nuevo || cur === '0') cur = k; else if (cur.replace(/[-.]/g, '').length < 12) cur += k; nuevo = false; }
    else if (k === '.') { if (nuevo) { cur = '0.'; nuevo = false; } else if (!cur.includes('.')) cur += '.'; }
    else if (k === 'ac') { if (cur !== '0' && !nuevo) { cur = '0'; } else { cur = '0'; prev = null; op = null; } nuevo = true; }
    else if (k === 'neg') { cur = cur.startsWith('-') ? cur.slice(1) : (cur === '0' ? cur : '-' + cur); }
    else if (k === '%') { cur = num(parseFloat(cur) / 100); }
    else if ('+-*/'.includes(k)) { if (op && !nuevo && prev != null) cur = num(operar(prev, parseFloat(cur), op)); prev = parseFloat(cur); op = k; nuevo = true; }
    else if (k === '=') { if (op != null && prev != null) { cur = num(operar(prev, parseFloat(cur), op)); prev = null; op = null; nuevo = true; } }
    pintar();
  }
  $('.calc-teclas', c).addEventListener('click', e => { const b = e.target.closest('button'); if (b) tecla(b.dataset.k); });
  abrirVentana({ app: 'calculadora', titulo: 'Calculadora', ancho: 236, alto: 372, contenido: c, fijo: true, clase: 'v-calc', barraTransparente: true, sinTitulo: true,
    alTeclado: e => {
      const m = { Enter: '=', '=': '=', Escape: 'ac', Backspace: 'ac', Delete: 'ac', ',': '.', '.': '.', x: '*', X: '*', '*': '*', '/': '/', '+': '+', '-': '-', '%': '%' };
      const k = /^\d$/.test(e.key) ? e.key : m[e.key];
      if (k) { e.preventDefault(); tecla(k); }
    } });
  pintar();
}

/* =========================================================
   App: Terminal
   ========================================================= */
function appTerminal() {
  const t = el('div', 'terminal');
  const host = 'bahia';
  let cwd = '~';
  const hist = []; let hi = 0;
  const usuario = () => normal(AJ.usuario).replace(/[^a-z0-9]/g, '') || 'usuario';
  const prompt = () => `<span class="t-prompt">${esc(usuario())}@${host}</span> <span class="t-dir">${esc(cwd)}</span> %`;
  const salida = (html, clase) => { const l = el('div', 't-linea' + (clase ? ' ' + clase : ''), html); t.insertBefore(l, fila); t.scrollTop = t.scrollHeight; };
  const fila = el('div', 't-entrada', `<span class="t-p"></span>&nbsp;<input spellcheck="false" autocomplete="off" aria-label="Comando">`);
  const inp = $('input', fila);
  const pintarPrompt = () => { $('.t-p', fila).innerHTML = prompt(); };
  t.appendChild(el('div', 't-linea t-tenue', `Último inicio de sesión: ${esc(new Date().toLocaleString('es-ES'))} en ttys000\nEscribe «ayuda» para ver los comandos.`));
  t.appendChild(fila);
  pintarPrompt();
  const dirs = { '~': ['Escritorio', 'Documentos', 'Descargas', 'Juegos', 'Aplicaciones'] };
  function listar(ruta) {
    const p = ruta.replace(/^~\/?/, '');
    if (!p) return dirs['~'].map(d => `<span class="t-dir">${d}/</span>`).join('  ');
    const base = p.split('/')[0];
    if (!['Escritorio', 'Documentos', 'Descargas', 'Juegos', 'Aplicaciones'].includes(base)) return null;
    const its = contenidoRuta(p);
    return its.map(i => i.ir ? `<span class="t-dir">${esc(i.ir.split('/').pop())}/</span>` : esc(i.nombre)).join('\n') || '';
  }
  function resolver(arg) {
    if (!arg || arg === '~') return '~';
    if (arg === '..') { const p = cwd.split('/'); p.pop(); return p.join('/') || '~'; }
    let r = arg.startsWith('~') ? arg : (cwd === '~' ? '~/' + arg : cwd + '/' + arg);
    r = r.replace(/\/+$/, '');
    const nombre = r.replace(/^~\/?/, '');
    const ok = dirs['~'].find(d => normal(d) === normal(nombre)) || (nombre.startsWith('Juegos/') && juegoPorId(nombre.split('/')[1]));
    if (!ok) return null;
    return typeof ok === 'string' ? '~/' + ok : '~/Juegos/' + ok.carpeta;
  }
  function ejecutar(linea) {
    salida(`${prompt()} ${esc(linea)}`);
    const [cmd, ...args] = linea.trim().split(/\s+/);
    const arg = args.join(' ');
    if (!cmd) return;
    switch (cmd.toLowerCase()) {
      case 'ayuda': case 'help':
        salida(`Comandos disponibles:
  ls [carpeta]      lista el contenido
  cd <carpeta>      cambia de carpeta
  pwd               muestra la carpeta actual
  abrir <nombre>    abre una app o un juego (también: open)
  juegos            lista los juegos instalados
  fecha             muestra la fecha y la hora
  echo <texto>      repite el texto
  whoami            muestra el usuario
  sysinfo           información del sistema
  bloquear          bloquea la pantalla
  limpiar           limpia la terminal (también: clear)
  salir             cierra esta ventana`); break;
      case 'ls': { const r = arg ? resolver(arg) : cwd; const out = r ? listar(r) : null; out == null ? salida(`ls: ${esc(arg)}: No existe el archivo o directorio`, 't-error') : out && salida(out); break; }
      case 'cd': { const r = resolver(arg); if (r) { cwd = r; pintarPrompt(); } else salida(`cd: no existe el directorio: ${esc(arg)}`, 't-error'); break; }
      case 'pwd': salida(esc(cwd.replace('~', '/Usuarios/' + usuario()))); break;
      case 'abrir': case 'open': {
        if (!arg) { salida('Uso: abrir <nombre>', 't-error'); break; }
        const n = normal(arg.replace(/\.(app|html)$/i, ''));
        const j = JUEGOS.find(x => normal(x.nombre) === n || normal(x.carpeta) === n);
        const a = Object.keys(APPS).find(id => normal(nombreApp(id)) === n || id === n);
        if (j) { abrirJuego(j.carpeta); salida(`Abriendo ${esc(j.nombre)}…`, 't-tenue'); }
        else if (a) { abrirApp(a); salida(`Abriendo ${esc(nombreApp(a))}…`, 't-tenue'); }
        else salida(`No se encuentra «${esc(arg)}». Prueba con «juegos» para ver la lista.`, 't-error');
        break;
      }
      case 'juegos': salida(JUEGOS.map(j => `${esc(j.icono || '🎮')}  ${esc(j.nombre).padEnd(16)} ${j.subido ? '(subido desde BahíaOS)' : esc(j.ruta || 'juegos/' + j.carpeta + '/')}`).join('\n') || 'No hay juegos. Mete uno en la carpeta juegos o usa «Subir juego…».'); break;
      case 'fecha': case 'date': salida(esc(new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' }))); break;
      case 'echo': salida(esc(arg)); break;
      case 'whoami': salida(esc(usuario())); break;
      case 'sysinfo': case 'neofetch':
        salida(`<span class="t-dir">   .---.     </span> <b>${esc(usuario())}@${host}</b>
<span class="t-dir">  (     )    </span> ---------------
<span class="t-dir">   '---'     </span> SO: BahíaOS 1.0
<span class="t-dir"> ~~~~~~~~~   </span> Modo: ${ES_APP ? 'Aplicación' : 'Navegador web'}
<span class="t-dir"> ~~~~~~~~~   </span> Pantalla: ${innerWidth}×${innerHeight}
              Juegos: ${JUEGOS.length}
              Ventanas abiertas: ${VENTANAS.length}`); break;
      case 'bloquear': bloquear(); break;
      case 'limpiar': case 'clear': $$('.t-linea', t).forEach(x => x.remove()); break;
      case 'salir': case 'exit': cerrar(v); break;
      case 'sudo': salida('Buen intento. Aquí no hace falta ser administrador.', 't-tenue'); break;
      default: salida(`zsh: comando no encontrado: ${esc(cmd)}`, 't-error');
    }
  }
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const l = inp.value; inp.value = ''; if (l.trim()) { hist.push(l); hi = hist.length; } ejecutar(l); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) inp.value = hist[--hi]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); $$('.t-linea', t).forEach(x => x.remove()); }
  });
  t.addEventListener('click', () => { if (!getSelection().toString()) inp.focus(); });
  const v = abrirVentana({ app: 'terminal', titulo: `${usuario()} — zsh — 80×24`, ancho: 640, alto: 400, contenido: t });
  setTimeout(() => inp.focus(), 50);
}

/* =========================================================
   App: Calendario
   ========================================================= */
const FESTIVOS = { '1-1': 'Año Nuevo', '1-6': 'Reyes', '5-1': 'Fiesta del Trabajo', '8-15': 'Asunción', '10-12': 'Fiesta Nacional', '11-1': 'Todos los Santos', '12-6': 'Día de la Constitución', '12-8': 'Inmaculada', '12-25': 'Navidad', '12-31': 'Nochevieja' };
function appCalendario() {
  if (existente('calendario')) return;
  const c = el('div', 'calendario', `<div class="cal-cab"><h2></h2><span></span><div class="cal-nav"><button class="boton" data-d="-1" aria-label="Mes anterior">‹</button><button class="boton" data-d="0">Hoy</button><button class="boton" data-d="1" aria-label="Mes siguiente">›</button></div></div>
    <div class="cal-dias">${['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'].map(d => `<span>${d}</span>`).join('')}</div><div class="cal-rejilla"></div>`);
  let ver = new Date(); ver.setDate(1);
  function pintar() {
    const a = ver.getFullYear(), m = ver.getMonth(), hoy = new Date();
    $('h2', c).textContent = ver.toLocaleDateString('es-ES', { month: 'long' });
    $('.cal-cab span', c).textContent = a;
    const r = $('.cal-rejilla', c); r.innerHTML = '';
    const inicio = new Date(a, m, 1 - (new Date(a, m, 1).getDay() + 6) % 7);
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio); d.setDate(inicio.getDate() + i);
      const cl = ['cal-celda'];
      if (d.getMonth() !== m) cl.push('fuera');
      if ([0, 6].includes(d.getDay())) cl.push('finde');
      if (d.toDateString() === hoy.toDateString()) cl.push('hoy');
      const fest = FESTIVOS[(d.getMonth() + 1) + '-' + d.getDate()];
      r.appendChild(el('div', cl.join(' '), `<span class="n">${d.getDate()}</span>${fest && d.getMonth() === m ? `<span class="cal-evento">${fest}</span>` : ''}`));
    }
  }
  $('.cal-nav', c).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = +b.dataset.d;
    if (d === 0) { ver = new Date(); ver.setDate(1); } else ver.setMonth(ver.getMonth() + d);
    pintar();
  });
  abrirVentana({ app: 'calendario', titulo: 'Calendario', ancho: 720, alto: 520, contenido: c,
    alTeclado: e => { if (e.key === 'ArrowLeft') { ver.setMonth(ver.getMonth() - 1); pintar(); } if (e.key === 'ArrowRight') { ver.setMonth(ver.getMonth() + 1); pintar(); } } });
  pintar();
}

/* =========================================================
   App: YouTube (tu cuenta, buscador y reproductor dentro de BahíaOS)
   - Sin extensión: búsquedas a través del servidor local (sistema/abrir.ps1)
   - Con la extensión de BahíaOS: Inicio, Suscripciones e Historial de TU cuenta
   ========================================================= */
const EXT_ID = 'cednlkamjooaickbpiolopicjpdfpplj';
const YT_CATEGORIAS = ['Música', 'Minecraft', 'Videojuegos', 'Humor', 'Fútbol', 'Ciencia', 'Dibujos animados', 'Recetas', 'Animales'];
const conServidor = () => ES_ANDROID || (location.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
const idDeYouTube = u => {
  try {
    const x = new URL(u);
    if (/(^|\.)youtu\.be$/i.test(x.hostname)) return x.pathname.slice(1, 12) || null;
    if (/(^|\.)youtube(-nocookie)?\.com$/i.test(x.hostname)) {
      if (x.searchParams.get('v')) return x.searchParams.get('v');
      const m = x.pathname.match(/^\/(embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch (e) {}
  return null;
};
const esYouTube = u => { try { return /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(new URL(u).hostname); } catch (e) { return false; } };
function textoYT(o) { if (!o) return ''; if (typeof o === 'string') return o; if (o.simpleText) return o.simpleText; if (o.runs) return o.runs.map(r => r.text).join(''); if (o.content) return o.content; return ''; }

/* Habla con la extensión de BahíaOS (si está activa) */
function extension(msg, espera) {
  return new Promise(ok => {
    try {
      if (!(window.chrome && chrome.runtime && chrome.runtime.sendMessage)) return ok(null);
      let hecho = false;
      const t = setTimeout(() => { if (!hecho) { hecho = true; ok(null); } }, espera || 20000);
      chrome.runtime.sendMessage(EXT_ID, msg, r => {
        if (hecho) return; hecho = true; clearTimeout(t);
        try { if (chrome.runtime.lastError) return ok(null); } catch (e) {}
        ok(r || null);
      });
    } catch (e) { ok(null); }
  });
}
let extActiva = null; // null = sin comprobar
function comprobarExtension() {
  if (extActiva !== null) return Promise.resolve(extActiva);
  return extension({ tipo: 'hola' }, 1500).then(r => (extActiva = !!(r && r.ok)));
}

function videosDeHTML(html) {
  let datos = null;
  const m = html.match(/var ytInitialData\s*=\s*(\{.+?\});\s*<\/script>/s) || html.match(/window\["ytInitialData"\]\s*=\s*(\{.+?\});/s);
  if (m) { try { datos = JSON.parse(m[1]); } catch (e) {} }
  if (!datos) return [];
  const lista = [], vistos = new Set();
  const meter = v => { if (v.id && !vistos.has(v.id)) { vistos.add(v.id); lista.push(v); } };
  (function andar(o, prof) {
    if (!o || typeof o !== 'object' || prof > 45) return;
    if (Array.isArray(o)) { for (const x of o) andar(x, prof + 1); return; }
    const v = o.videoRenderer || o.gridVideoRenderer || o.compactVideoRenderer;
    if (v && v.videoId) {
      const dur = textoYT(v.lengthText) || ((v.thumbnailOverlays || []).map(x => x.thumbnailOverlayTimeStatusRenderer && textoYT(x.thumbnailOverlayTimeStatusRenderer.text)).find(Boolean)) || '';
      meter({ id: v.videoId, titulo: textoYT(v.title), canal: textoYT(v.ownerText || v.longBylineText || v.shortBylineText), duracion: dur, vistas: textoYT(v.shortViewCountText || v.viewCountText), fecha: textoYT(v.publishedTimeText) });
      return;
    }
    const l = o.lockupViewModel;
    if (l && l.contentId && (!l.contentType || /VIDEO/.test(l.contentType))) {
      const md = (((l.metadata || {}).lockupMetadataViewModel) || {});
      const filas = ((((md.metadata || {}).contentMetadataViewModel) || {}).metadataRows || []).map(r => (r.metadataParts || []).map(p => textoYT(p.text)).filter(Boolean));
      let dur = '';
      (function buscaDur(x, n) { if (dur || !x || typeof x !== 'object' || n > 12) return; if (x.thumbnailBadgeViewModel && x.thumbnailBadgeViewModel.text) { dur = x.thumbnailBadgeViewModel.text; return; } for (const k in x) buscaDur(x[k], n + 1); })(l.contentImage, 0);
      meter({ id: l.contentId, titulo: textoYT(md.title), canal: (filas[0] || [])[0] || '', duracion: dur, vistas: (filas[1] || []).join(' · '), fecha: '' });
      return;
    }
    for (const k in o) andar(o[k], prof + 1);
  })(datos, 0);
  return lista;
}

function appYouTube(arg) {
  const ya = VENTANAS.find(x => x.app === 'youtube' && x.api);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); if (arg) ya.api.abrir(arg); return; }

  const c = el('div', 'yt');
  c.innerHTML = `
    <aside class="yt-lado">
      <button class="yt-sec" data-sec="inicio"><span>⌂</span>Inicio</button>
      <button class="yt-sec" data-sec="suscripciones"><span>▤</span>Suscripciones</button>
      <button class="yt-sec" data-sec="historial"><span>↺</span>Historial</button>
      <div class="yt-lado-sep"></div>
      <div class="yt-lado-t">Explorar</div>
      <div class="yt-cats"></div>
    </aside>
    <div class="yt-cuerpo">
      <div class="yt-aviso" hidden></div>
      <div class="yt-lista"></div>
      <div class="yt-ver" hidden>
        <div class="yt-ver-principal">
          <div class="yt-reproductor"></div>
          <h2 class="yt-titulo"></h2>
          <div class="yt-canal"></div>
          <div class="yt-acciones"><button class="boton" data-a="volver">← Volver</button><button class="boton" data-a="fuera">Abrir en YouTube</button></div>
        </div>
        <aside class="yt-siguientes"></aside>
      </div>
    </div>`;
  const herr = el('div', 'yt-herr', `
    <button class="h-boton" data-a="volver" aria-label="Atrás" disabled>${SVG.atras}</button>
    <span class="yt-marca"><span class="yt-marca-ic"></span>YouTube</span>
    <form class="yt-busca"><input spellcheck="false" autocomplete="off" placeholder="Buscar" aria-label="Buscar en YouTube"><button class="yt-busca-b" aria-label="Buscar">${SVG.lupa}</button></form>
    <button class="yt-cuenta" data-a="cuenta">Iniciar sesión</button>`);
  const listaEl = $('.yt-lista', c), ver = $('.yt-ver', c), avisoEl = $('.yt-aviso', c);
  const input = $('input', herr), botonCuenta = $('.yt-cuenta', herr);
  let resultados = [], seccion = '', actualId = null, pet = 0, conectado = false, ventanaLogin = null, vigilaLogin = 0, nombreCuenta = '';

  YT_CATEGORIAS.forEach(cat => {
    const b = el('button', 'yt-sec yt-cat'); b.textContent = cat; b.dataset.cat = cat;
    b.addEventListener('click', () => { input.value = ''; cargar('cat:' + cat); });
    $('.yt-cats', c).appendChild(b);
  });
  $$('[data-sec]', c).forEach(b => b.addEventListener('click', () => cargar(b.dataset.sec)));

  function pintarCuenta() {
    botonCuenta.textContent = conectado ? (nombreCuenta || 'Tu cuenta') : 'Iniciar sesión';
    botonCuenta.classList.toggle('conectado', conectado);
  }
  function marcar(sec) {
    $$('.yt-sec', c).forEach(b => b.classList.toggle('activo', b.dataset.sec === sec || ('cat:' + b.dataset.cat) === sec));
  }
  function cargando() { listaEl.innerHTML = '<div class="yt-espera"><span class="rueda"></span>Cargando vídeos…</div>'; }
  function mensaje(html, botones) {
    listaEl.innerHTML = `<div class="yt-mensaje">${html}${botones ? `<div class="yt-mensaje-b">${botones}</div>` : ''}</div>`;
  }
  function avisar(html) { avisoEl.innerHTML = html || ''; avisoEl.hidden = !html; }

  /* Descarga una página de YouTube: con la extensión usa tu cuenta; si no, el servidor local */
  async function pedir(ruta) {
    if (await comprobarExtension()) {
      const r = await extension({ tipo: 'yt', ruta });
      if (r && r.ok) { conectado = !!r.conectado; nombreCuenta = conectado ? (r.nombre || '') : ''; pintarCuenta(); return r.html; }
      if (!ruta.startsWith('/results?')) throw new Error('red');
    }
    if (!conServidor()) throw new Error('sin-servidor');
    const q = ruta.startsWith('/results?') ? new URLSearchParams(ruta.slice(9)).get('search_query') : null;
    if (!q) throw new Error('necesita-extension');
    const r = await fetch('/yt/buscar?q=' + encodeURIComponent(q));
    if (!r.ok) throw new Error('red');
    return r.text();
  }

  async function cargar(sec, consulta) {
    seccion = sec; marcar(sec); mostrarLista(); avisar('');
    const n = ++pet;
    let ruta, titulo;
    if (sec === 'buscar') { ruta = '/results?search_query=' + encodeURIComponent(consulta); titulo = consulta; }
    else if (sec.startsWith('cat:')) { ruta = '/results?search_query=' + encodeURIComponent(sec.slice(4)); titulo = sec.slice(4); }
    else if (sec === 'suscripciones') { ruta = '/feed/subscriptions'; titulo = 'Suscripciones'; }
    else if (sec === 'historial') { ruta = '/feed/history'; titulo = 'Historial'; }
    else { ruta = '/'; titulo = 'Inicio'; }
    v.titulo = titulo + ' - YouTube';
    if (!conServidor()) { mensaje('<b>YouTube necesita abrirse desde el icono de BahíaOS.</b><br>Cierra BahíaOS y ábrelo con el icono del Escritorio. Si no lo tienes, ejecuta «Instalar BahiaOS.bat».'); return; }
    cargando();
    const ext = await comprobarExtension();
    if (n !== pet) return;
    if (ES_ANDROID && (sec === 'suscripciones' || sec === 'historial')) { mensaje('Tu cuenta de YouTube no está disponible en la versión de Android de BahíaOS. Puedes buscar y ver cualquier vídeo, o usar las categorías de la izquierda.'); return; }
    if (!ext && (sec === 'suscripciones' || sec === 'historial')) { mensajeExtension(); return; }
    try {
      let html = await pedir(ext || sec !== 'inicio' ? ruta : '/results?search_query=' + encodeURIComponent('tendencias españa'));
      if (n !== pet) return;
      let lista = videosDeHTML(html);
      if (sec === 'inicio' && !lista.length) {
        // Sin sesión, el Inicio de YouTube viene vacío: enseñamos tendencias
        html = await pedir('/results?search_query=' + encodeURIComponent('tendencias españa'));
        if (n !== pet) return;
        lista = videosDeHTML(html);
      }
      if (sec === 'inicio' && !conectado && !ES_ANDROID) avisar(ext
        ? `Inicia sesión para ver tus recomendaciones, tus suscripciones y tu historial. <button class="boton primario" data-a="cuenta">Iniciar sesión</button>`
        : `Para ver tu cuenta de YouTube aquí falta activar la extensión de BahíaOS (una sola vez). <button class="boton primario" data-a="asistente">Activar mi cuenta</button>`);
      if ((sec === 'suscripciones' || sec === 'historial') && !conectado) {
        mensaje(`<b>Inicia sesión para ver ${sec === 'historial' ? 'tu historial' : 'tus suscripciones'}.</b><br>Se abrirá la página oficial de Google. Solo hace falta hacerlo una vez.`, '<button class="boton primario" data-a="cuenta">Iniciar sesión con Google</button>');
        return;
      }
      resultados = lista;
      if (!lista.length) { mensaje(sec === 'historial' ? 'Tu historial está vacío.' : sec === 'suscripciones' ? 'No hay vídeos nuevos de tus suscripciones.' : `No he encontrado vídeos${consulta ? ` para «${esc(consulta)}»` : ''}.`); return; }
      pintarLista();
    } catch (e) {
      if (n !== pet) return;
      if (String(e.message) === 'necesita-extension') mensajeExtension();
      else mensaje('No se puede conectar con YouTube. Comprueba que tienes internet y vuelve a intentarlo.', '<button class="boton" data-a="reintentar">Reintentar</button>');
    }
  }
  function mensajeExtension() {
    mensaje(`<b>Falta un paso para usar tu cuenta de YouTube aquí.</b><br>Hay que activar la extensión de BahíaOS en Edge. Se hace una sola vez y tarda un minuto. Mientras tanto puedes buscar cualquier vídeo arriba.`,
      '<button class="boton primario" data-a="asistente">Activar mi cuenta</button>');
  }
  function asistente() {
    let capa = $('.yt-login', c);
    if (!capa) { capa = el('div', 'yt-login'); $('.yt-cuerpo', c).appendChild(capa); }
    capa.innerHTML = `<div class="yt-login-caja yt-pasos">
      <b>Activar tu cuenta de YouTube en BahíaOS</b>
      <p>Solo hay que hacerlo una vez. Pulsa el primer botón y sigue los pasos en la ventana que se abre:</p>
      <ol>
        <li>Pulsa <b>Abrir la página de extensiones</b> (aquí abajo).</li>
        <li>En esa ventana, activa <b>Modo de desarrollador</b> (abajo a la izquierda en Edge, arriba a la derecha en Chrome).</li>
        <li>Pulsa <b>Cargar desempaquetada</b>.</li>
        <li>En la ventana de carpetas, haz clic en la barra de arriba, pulsa <b>Ctrl + V</b> (ya he copiado la ruta) y luego <b>Intro</b> y <b>Seleccionar carpeta</b>.</li>
        <li>Cierra esa ventana y pulsa <b>Ya lo he hecho</b>.</li>
      </ol>
      <div class="yt-ruta"><code></code><button class="boton" data-l="copiar">Copiar</button></div>
      <div class="yt-mensaje-b"><button class="boton primario" data-l="abrir">Abrir la página de extensiones</button><button class="boton" data-l="hecho">Ya lo he hecho</button><button class="boton" data-l="cancelar">Cancelar</button></div></div>`;
    capa.hidden = false;
    const code = $('code', capa);
    code.textContent = 'Documentos\\BahiaOS\\sistema\\extension';
    $('[data-l="abrir"]', capa).onclick = () => {
      fetch('/sistema/extensiones').then(r => r.json()).then(d => { if (d && d.ruta) code.textContent = d.ruta; })
        .catch(() => notificar('No se pudo abrir', 'Abre BahíaOS desde su icono del Escritorio y vuelve a intentarlo.', icono('youtube')));
    };
    $('[data-l="copiar"]', capa).onclick = () => {
      const t = code.textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => notificar('Ruta copiada', 'Pégala con Ctrl + V en la ventana de carpetas.', icono('archivos')))
        .catch(() => { const r = document.createRange(); r.selectNodeContents(code); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); });
    };
    $('[data-l="hecho"]', capa).onclick = () => {
      // La página tiene que recargarse para conectar con la extensión
      try { sessionStorage.setItem('bahia.volver', 'youtube'); } catch (e) {}
      location.reload();
    };
    $('[data-l="cancelar"]', capa).onclick = () => { capa.hidden = true; };
  }
  function tarjeta(vid, pequena) {
    const b = el('button', 'yt-tarjeta' + (pequena ? ' pequena' : ''));
    b.innerHTML = `<div class="yt-mini"><img loading="lazy" alt="" onload="this.classList.add('ok')" onerror="this.style.visibility='hidden'" src="https://i.ytimg.com/vi/${encodeURIComponent(vid.id)}/mqdefault.jpg">${vid.duracion ? `<span class="yt-dur">${esc(vid.duracion)}</span>` : ''}</div>
      <div class="yt-info"><b></b><small></small></div>`;
    $('b', b).textContent = vid.titulo || 'Vídeo';
    $('small', b).textContent = [vid.canal, [vid.vistas, vid.fecha].filter(Boolean).join(' · ')].filter(Boolean).join('\n');
    b.addEventListener('click', () => reproducir(vid));
    return b;
  }
  function pintarLista() {
    const r = el('div', 'yt-rejilla');
    resultados.forEach(vid => r.appendChild(tarjeta(vid)));
    listaEl.innerHTML = ''; listaEl.appendChild(r);
    listaEl.scrollTop = 0;
  }
  function mostrarLista() {
    $('.yt-reproductor', ver).innerHTML = '';
    ver.hidden = true; listaEl.hidden = false; actualId = null;
    $('[data-a="volver"]', herr).disabled = true;
  }
  function reproducir(vid) {
    actualId = vid.id;
    listaEl.hidden = true; ver.hidden = false; avisar('');
    $('[data-a="volver"]', herr).disabled = !resultados.length;
    const rep = $('.yt-reproductor', ver);
    rep.innerHTML = '<div class="yt-espera oscuro"><span class="rueda"></span></div>';
    const f = el('iframe', 'yt-marco');
    f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.title = vid.titulo || 'Vídeo de YouTube';
    f.addEventListener('load', () => f.classList.add('listo'));
    f.src = `https://www.youtube.com/embed/${encodeURIComponent(vid.id)}?autoplay=1&rel=0&playsinline=1&hl=es&origin=${encodeURIComponent(location.origin)}`;
    rep.appendChild(f);
    $('.yt-titulo', ver).textContent = vid.titulo || '';
    $('.yt-canal', ver).textContent = [vid.canal, vid.vistas].filter(Boolean).join(' · ');
    v.titulo = (vid.titulo || 'Vídeo') + ' - YouTube';
    const sig = $('.yt-siguientes', ver); sig.innerHTML = resultados.length > 1 ? '<h4>Más vídeos</h4>' : '';
    resultados.filter(x => x.id !== vid.id).slice(0, 15).forEach(x => sig.appendChild(tarjeta(x, true)));
    $('.yt-ver-principal', ver).scrollTop = 0;
    if (!vid.titulo && conServidor()) {
      fetch('/yt/info?id=' + encodeURIComponent(vid.id)).then(r => r.json()).then(d => {
        if (actualId !== vid.id || !d || !d.title) return;
        vid.titulo = d.title; vid.canal = d.author_name;
        $('.yt-titulo', ver).textContent = d.title; $('.yt-canal', ver).textContent = d.author_name || '';
        v.titulo = d.title + ' - YouTube';
      }).catch(() => {});
    }
  }
  function iniciarSesion() {
    if (conectado) {
      const r = botonCuenta.getBoundingClientRect();
      mostrarMenu([
        { t: nombreCuenta ? `Sesión iniciada: ${nombreCuenta}` : 'Sesión iniciada en YouTube', off: true },
        { sep: 1 },
        { t: 'Cambiar de cuenta…', a: () => abrirLogin(false) },
        { t: 'Cerrar sesión', a: () => abrirLogin(true) }
      ], r.left, r.bottom + 4);
      return;
    }
    comprobarExtension().then(ok => ok ? abrirLogin(false) : asistente());
  }
  function capaLogin(salir, conExtension) {
    let capa = $('.yt-login', c);
    if (!capa) { capa = el('div', 'yt-login'); $('.yt-cuerpo', c).appendChild(capa); }
    capa.innerHTML = `<div class="yt-login-caja"><span class="rueda"></span>
      <b>${salir ? 'Cerrando sesión…' : 'Inicia sesión en la ventana de Google'}</b>
      <p>${salir ? 'Un momento.' : conExtension ? 'Escribe tu Gmail y tu contraseña en la ventanita de Google. Cuando termines, se cerrará sola y volverás aquí con tu cuenta.' : 'Escribe tu Gmail y tu contraseña en la ventanita de Google. Cuando termines, pulsa «Ya he terminado».'}</p>
      <div class="yt-mensaje-b">${conExtension ? '' : '<button class="boton primario" data-l="listo">Ya he terminado</button>'}<button class="boton" data-l="cancelar">Cancelar</button></div></div>`;
    capa.hidden = false;
    return capa;
  }
  function quitarCapaLogin() { const capa = $('.yt-login', c); if (capa) capa.hidden = true; }
  async function abrirLogin(salir) {
    const an = 480, al = 680;
    const left = Math.round(window.screenX + (window.outerWidth - an) / 2), top = Math.round(window.screenY + (window.outerHeight - al) / 2);
    clearInterval(vigilaLogin);
    if (await comprobarExtension()) {
      const r = await extension({ tipo: 'login', salir, left, top }, 5000);
      if (r && r.ok) {
        const capa = capaLogin(salir, true);
        $('[data-l="cancelar"]', capa).onclick = () => { extension({ tipo: 'login-cancelar' }, 2000); };
        vigilaLogin = setInterval(async () => {
          const e = await extension({ tipo: 'login-estado' }, 2000);
          if (e && e.abierta) return;
          clearInterval(vigilaLogin);
          quitarCapaLogin();
          await cargar(seccion && seccion !== 'buscar' ? seccion : 'inicio', input.value.trim());
          if (!salir && conectado) notificar('Sesión iniciada', nombreCuenta ? `YouTube ya usa la cuenta de ${nombreCuenta}.` : 'YouTube ya usa tu cuenta.', icono('youtube'));
          if (salir && !conectado) notificar('Sesión cerrada', 'Has salido de tu cuenta de YouTube.', icono('youtube'));
          try { window.focus(); } catch (er) {}
        }, 900);
        return;
      }
    }
    // Sin extensión: ventanita normal y botón «Ya he terminado»
    const url = salir ? 'https://www.youtube.com/logout' : 'https://accounts.google.com/ServiceLogin?service=youtube&hl=es&continue=' + encodeURIComponent('https://www.youtube.com/signin?action_handle_signin=true&app=desktop&next=%2F');
    ventanaLogin = window.open(url, 'bahia-cuenta-google', `popup=yes,width=${an},height=${al},left=${left},top=${top}`);
    if (!ventanaLogin) { notificar('No se pudo abrir el inicio de sesión', 'Se ha bloqueado la ventana de Google.', icono('youtube')); return; }
    const capa = capaLogin(salir, false);
    const terminar = () => { clearInterval(vigilaLogin); try { ventanaLogin && ventanaLogin.close(); } catch (e) {} ventanaLogin = null; quitarCapaLogin(); cargar('inicio'); };
    $('[data-l="listo"]', capa).onclick = terminar;
    $('[data-l="cancelar"]', capa).onclick = terminar;
    vigilaLogin = setInterval(() => { if (!ventanaLogin || ventanaLogin.closed) terminar(); }, 800);
  }
  function abrir(cosa) {
    const id = idDeYouTube(cosa);
    if (id) { reproducir({ id, titulo: '', canal: '' }); return; }
    try { const u = new URL(cosa); const q = u.searchParams.get('search_query'); if (q) { input.value = q; cargar('buscar', q); return; } } catch (e) {}
    if (cosa && !/^https?:/i.test(cosa)) { input.value = cosa; cargar('buscar', cosa); return; }
    if (!seccion) cargar('inicio');
  }

  $('form', herr).addEventListener('submit', e => { e.preventDefault(); const q = input.value.trim(); if (q) { cargar('buscar', q); input.blur(); } });
  const accion = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.a === 'volver' && resultados.length) mostrarLista();
    if (b.dataset.a === 'fuera' && actualId) appNavegadorFuera('https://www.youtube.com/watch?v=' + actualId);
    if (b.dataset.a === 'cuenta') iniciarSesion();
    if (b.dataset.a === 'reintentar') cargar(seccion || 'inicio', input.value.trim());
    if (b.dataset.a === 'asistente') asistente();
  };
  herr.addEventListener('click', accion);
  c.addEventListener('click', accion);

  const v = abrirVentana({ app: 'youtube', titulo: 'YouTube', ancho: 1180, alto: 720, contenido: c, herramientas: herr, barraAlta: true, sinTitulo: true,
    alCerrar: () => clearInterval(vigilaLogin),
    alTeclado: e => { if (e.key === 'Escape' && !ver.hidden && resultados.length) mostrarLista(); if (e.key === '/') { e.preventDefault(); input.focus(); } } });
  v.api = { abrir, atras: () => { if (!ver.hidden && resultados.length) { mostrarLista(); return true; } return false; } };
  pintarCuenta();
  if (ES_ANDROID) botonCuenta.hidden = true;
  if (arg) { cargar('inicio'); abrir(arg); } else cargar('inicio');
}
function appNavegadorFuera(url) {
  const w = window.open(url, '_blank', 'popup=yes,width=1200,height=800');
  if (!w) notificar('No se pudo abrir la ventana', 'Se ha bloqueado la ventana emergente.', icono('youtube'));
}

/* =========================================================
   App: Navegador (pestañas, Google, YouTube…)
   ========================================================= */
const FAVORITOS = [
  ['Google', 'https://www.google.com/webhp?igu=1', '#4285f4', 'G'],
  ['YouTube', 'app:youtube', '#ff1f3d', '▶'],
  ['Wikipedia', 'https://es.wikipedia.org/', '#54595d', 'W'],
  ['Google Maps', 'https://www.google.com/maps', '#34a853', '⌖'],
  ['Traductor', 'https://translate.google.com/?sl=auto&tl=es', '#1a73e8', '文'],
  ['Poki', 'https://poki.com/es', '#00a8e8', 'P'],
  ['Scratch', 'https://scratch.mit.edu/', '#f5a623', 'S'],
  ['AEMET', 'https://www.aemet.es/es/portada', '#0a84ff', '☀']
];
let puenteVisto = false;
const esGoogle = h => /(^|\.)google\.[a-z.]+$/i.test(h);
function conIgu(url) {
  try {
    const u = new URL(url);
    if (esGoogle(u.hostname) && /^\/(webhp|search)?$/.test(u.pathname) && !u.searchParams.has('igu')) u.searchParams.set('igu', '1');
    return u.href;
  } catch (e) { return url; }
}
function aURL(t) {
  t = String(t || '').trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return conIgu(t);
  if (!/\s/.test(t) && (/^[^\s/]+\.[a-z]{2,}(:\d+)?(\/.*)?$/i.test(t) || /^localhost(:\d+)?(\/.*)?$/i.test(t))) return conIgu((/^localhost/i.test(t) ? 'http://' : 'https://') + t);
  return 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(t);
}
const hostDe = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u || ''; } };
const busquedaDe = u => { try { const x = new URL(u); return esGoogle(x.hostname) && x.pathname === '/search' ? x.searchParams.get('q') : null; } catch (e) { return null; } };

function appNavegador(arg) {
  const ya = VENTANAS.find(x => x.app === 'navegador' && x.api);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); if (arg) ya.api.nueva(arg); return; }

  const raizN = el('div', 'nav');
  raizN.innerHTML = `<div class="nav-pestanas" hidden></div><div class="nav-aviso" hidden><span></span><button class="boton" data-a="fuera">Abrir en ventana aparte</button><button class="h-boton nav-cerrar-aviso" aria-label="Cerrar aviso">✕</button></div><div class="nav-zona"></div>`;
  const herr = el('div', 'nav-herr');
  herr.innerHTML = `
    <button class="h-boton" data-a="atras" aria-label="Atrás">${SVG.atras}</button>
    <button class="h-boton" data-a="adelante" aria-label="Adelante">${SVG.adelante}</button>
    <label class="nav-dir"><span class="nav-candado" aria-hidden="true"></span><input id="nav-dir-${seq + 1}" spellcheck="false" autocomplete="off" placeholder="Busca en Google o escribe una dirección" aria-label="Dirección o búsqueda"><span class="nav-carga" aria-hidden="true"></span></label>
    <button class="h-boton" data-a="recargar" aria-label="Recargar">${SVG.recargar}</button>
    <button class="h-boton" data-a="fuera" aria-label="Abrir en ventana aparte" title="Abrir en ventana aparte">${SVG.externo}</button>
    <button class="h-boton" data-a="nueva" aria-label="Nueva pestaña" title="Nueva pestaña">${SVG.mas}</button>`;
  const zona = $('.nav-zona', raizN), tira = $('.nav-pestanas', raizN), aviso = $('.nav-aviso', raizN);
  const dir = $('input', herr);
  const pestanas = [];
  let actual = null, idP = 0;

  function paginaInicio() {
    const p = el('div', 'nav-inicio');
    p.innerHTML = `<div class="nav-inicio-centro">
      <form class="nav-busca"><span>${SVG.lupa}</span><input spellcheck="false" autocomplete="off" placeholder="Buscar en Google" aria-label="Buscar en Google"></form>
      <h3>Favoritos</h3><div class="nav-favs"></div>
      </div>`;
    const favs = $('.nav-favs', p);
    FAVORITOS.forEach(([nom, url, color, letra]) => {
      const b = el('button', 'nav-fav', `<span class="nav-fav-ic" style="background:${color}">${esc(letra)}</span><span></span>`);
      b.lastChild.textContent = nom;
      b.addEventListener('click', () => url.startsWith('app:') ? abrirApp(url.slice(4)) : ir(actual, url));
      favs.appendChild(b);
    });
    $('form', p).addEventListener('submit', e => { e.preventDefault(); const u = aURL($('input', p).value); if (u) ir(actual, u); });
    return p;
  }

  function crearPestana(url) {
    const t = { nueva: true, id: ++idP, hist: [null], pos: 0, titulo: 'Página de inicio', frame: null, inicio: paginaInicio(), esperando: false, cargando: false, puente: false, tAviso: 0 };
    zona.appendChild(t.inicio);
    pestanas.push(t);
    mostrar(t);
    if (url) ir(t, url);
    return t;
  }
  function marco(t) {
    if (t.frame) return t.frame;
    const f = el('iframe', 'nav-marco');
    f.setAttribute('allow', 'fullscreen; autoplay; encrypted-media; picture-in-picture; clipboard-write; web-share');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    f.addEventListener('load', () => {
      t.cargando = false;
      if (t === actual) pintarBarra();
      clearTimeout(t.tAviso);
      t.tAviso = setTimeout(() => { if (!t.puente && t.hist[t.pos] && t === actual) mostrarAviso(t); }, 1800);
    });
    zona.appendChild(f);
    t.frame = f;
    return f;
  }
  function ir(t, url) {
    url = aURL(url);
    if (!url) return;
    if (esYouTube(url)) { abrirApp('youtube', url); return; }
    t.hist = t.hist.slice(0, t.pos + 1);
    t.hist.push(url); t.pos++;
    cargar(t);
  }
  function cargar(t) {
    const url = t.hist[t.pos];
    ocultarAviso();
    if (!url) {
      if (t.frame) { t.frame.src = 'about:blank'; t.frame.hidden = true; }
      t.inicio.hidden = false; t.titulo = 'Página de inicio'; t.cargando = false;
    } else {
      const f = marco(t);
      t.inicio.hidden = true; f.hidden = false;
      t.esperando = true; t.cargando = true; t.puente = false;
      clearTimeout(t.tCarga);
      t.tCarga = setTimeout(() => { if (t.cargando) { t.cargando = false; if (t === actual) pintarBarra(); } }, 12000);
      t.titulo = busquedaDe(url) ? busquedaDe(url) + ' - Google' : hostDe(url);
      f.src = url;
    }
    if (t === actual) { pintarBarra(); pintarPestanas(); }
    else pintarPestanas();
  }
  function mostrar(t) {
    actual = t;
    pestanas.forEach(p => {
      const vis = p === t;
      p.inicio.hidden = !vis || !!p.hist[p.pos];
      if (p.frame) p.frame.hidden = !vis || !p.hist[p.pos];
    });
    ocultarAviso();
    pintarBarra(); pintarPestanas();
    if (!t.hist[t.pos]) setTimeout(() => { const i = $('.nav-busca input', t.inicio); if (i && t === actual) i.focus(); }, 30);
  }
  function cerrarPestana(t) {
    const i = pestanas.indexOf(t);
    if (t.frame) { t.frame.src = 'about:blank'; t.frame.remove(); }
    if (t.elPest) t.elPest.remove();
    clearTimeout(t.tCarga); clearTimeout(t.tAviso);
    t.inicio.remove();
    pestanas.splice(i, 1);
    if (!pestanas.length) { cerrar(v); return; }
    if (actual === t) mostrar(pestanas[Math.min(i, pestanas.length - 1)]);
    else pintarPestanas();
  }
  function pintarPestanas() {
    tira.hidden = pestanas.length < 2;
    let mas = $('.nav-pest-mas', tira);
    if (!mas) {
      mas = el('button', 'h-boton nav-pest-mas', SVG.mas);
      mas.setAttribute('aria-label', 'Nueva pestaña');
      mas.addEventListener('click', () => crearPestana());
      tira.appendChild(mas);
    }
    pestanas.forEach(t => {
      let b = t.elPest;
      if (!b) {
        b = t.elPest = el('div', 'nav-pest', `<button class="nav-pest-x" aria-label="Cerrar pestaña">✕</button><span class="nav-pest-t"></span>`);
        b.setAttribute('role', 'tab');
        const quitar = () => {
          if (b.dataset.saliendo) return;
          if (sinMovimiento() || pestanas.length < 2) return cerrarPestana(t);
          b.dataset.saliendo = '1';
          const ancho = b.getBoundingClientRect().width;
          b.style.flex = 'none';
          const a = b.animate([{ width: ancho + 'px', minWidth: '0px', opacity: 1 }, { width: '0px', minWidth: '0px', paddingLeft: '0px', paddingRight: '0px', opacity: 0 }], { duration: lento ? 1200 : 200, easing: 'ease-in', fill: 'forwards' });
          a.onfinish = () => cerrarPestana(t);
        };
        b.addEventListener('click', e => { if (e.target.closest('.nav-pest-x')) quitar(); else mostrar(t); });
        b.addEventListener('auxclick', e => { if (e.button === 1) quitar(); });
        tira.insertBefore(b, mas);
        if (t.nueva && pestanas.length > 1 && !sinMovimiento()) {
          b.animate([{ transform: 'scaleX(.2)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }], { duration: lento ? 1200 : 220, easing: 'cubic-bezier(.2,.9,.3,1)' });
        }
        t.nueva = false;
      }
      b.classList.toggle('activa', t === actual);
      const tt = t.titulo || 'Sin título';
      const sp = $('.nav-pest-t', b);
      if (sp.textContent !== tt) { sp.textContent = tt; b.title = tt; }
    });
  }
  function pintarBarra() {
    const t = actual, url = t.hist[t.pos];
    if (document.activeElement !== dir) dir.value = url ? (busquedaDe(url) || hostDe(url)) : '';
    const segura = !!(url && /^https:/i.test(url)), cand = $('.nav-candado', herr);
    if (cand.dataset.s !== String(segura)) { cand.dataset.s = String(segura); cand.innerHTML = segura ? SVG.candado : ''; }
    if (herr.classList.contains('cargando') !== !!t.cargando) {
      herr.classList.toggle('cargando', !!t.cargando);
      if (!t.cargando) { herr.classList.add('cargado'); clearTimeout(herr._t); herr._t = setTimeout(() => herr.classList.remove('cargado'), 600); }
      else herr.classList.remove('cargado');
    }
    $('[data-a="atras"]', herr).disabled = t.pos === 0;
    $('[data-a="adelante"]', herr).disabled = t.pos >= t.hist.length - 1;
    $('[data-a="recargar"]', herr).disabled = !url;
    $$('[data-a="fuera"]', v.el).forEach(b => { b.disabled = !url; });
    v.titulo = t.titulo || 'Navegador';
    const vt = $('.v-titulo', v.el); if (vt.textContent !== v.titulo) vt.textContent = v.titulo;
  }
  function mostrarAviso(t) {
    $('span', aviso).textContent = puenteVisto
      ? `Si ${hostDe(t.hist[t.pos])} se ve en blanco o con un error, esta web no deja mostrarse aquí dentro.`
      : 'Si la página se ve en blanco o con un error, abre BahíaOS desde su icono del Escritorio (vuelve a ejecutar «Instalar BahiaOS.bat» si hace falta).';
    aviso.hidden = false;
  }
  function ocultarAviso() { aviso.hidden = true; }
  function abrirFuera() {
    const url = actual && actual.hist[actual.pos];
    if (!url) return;
    const w = window.open(url.replace(/([?&])igu=1&?/, '$1').replace(/[?&]$/, ''), '_blank', 'popup=yes,width=1200,height=800');
    if (!w) notificar('No se pudo abrir la ventana', 'Tu navegador ha bloqueado la ventana emergente.', icono('navegador'));
  }

  // Mensajes del puente (extensión)
  const alMensaje = e => {
    const d = e.data;
    if (!d || typeof d.bahia !== 'string') return;
    const t = pestanas.find(p => p.frame && p.frame.contentWindow === e.source);
    if (!t) return;
    puenteVisto = true; t.puente = true;
    if (t === actual) ocultarAviso();
    if (d.bahia === 'nueva' && d.url) { esYouTube(d.url) ? abrirApp('youtube', d.url) : crearPestana(d.url); return; }
    if (d.bahia !== 'url' || !/^https?:/i.test(d.url)) return;
    const url = d.url;
    if (esYouTube(url)) { t.esperando = false; abrirApp('youtube', url); if (t.hist[t.pos] && !esYouTube(t.hist[t.pos])) cargar(t); else { t.pos = Math.max(0, t.pos - 1); cargar(t); } return; }
    const antes = t.titulo + '|' + t.pos + '|' + t.hist.length;
    if (t.esperando) { t.hist[t.pos] = url; t.esperando = false; }
    else if (url === t.hist[t.pos]) { /* misma página */ }
    else if (t.pos > 0 && url === t.hist[t.pos - 1]) t.pos--;
    else if (url === t.hist[t.pos + 1]) t.pos++;
    else { t.hist = t.hist.slice(0, t.pos + 1); t.hist.push(url); t.pos++; }
    t.titulo = d.titulo || hostDe(url);
    if (t.esperando === false && t.cargando && d.titulo) { /* sigue cargando hasta el evento load */ }
    if (antes === t.titulo + '|' + t.pos + '|' + t.hist.length) return;
    if (t === actual) pintarBarra();
    pintarPestanas();
  };
  window.addEventListener('message', alMensaje);

  function moverHistoria(t, paso) {
    const destino = t.pos + paso;
    if (destino < 0 || destino >= t.hist.length) return;
    if (t.puente && t.frame && t.hist[destino]) {
      try { t.frame.contentWindow.postMessage({ bahiaOrden: paso < 0 ? 'atras' : 'adelante' }, '*'); return; } catch (e) {}
    }
    t.pos = destino; cargar(t);
  }

  herr.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const a = b.dataset.a, t = actual;
    if (a === 'atras') moverHistoria(t, -1);
    if (a === 'adelante') moverHistoria(t, 1);
    if (a === 'recargar' && t.hist[t.pos]) cargar(t);
    if (a === 'fuera') abrirFuera();
    if (a === 'nueva') crearPestana();
  });
  aviso.addEventListener('click', e => {
    if (e.target.closest('[data-a="fuera"]')) abrirFuera();
    if (e.target.closest('.nav-cerrar-aviso')) ocultarAviso();
  });
  dir.addEventListener('focus', () => { const u = actual.hist[actual.pos]; dir.value = u ? (busquedaDe(u) || u.replace(/([?&])igu=1&?/, '$1').replace(/[?&]$/, '')) : ''; setTimeout(() => dir.select(), 0); });
  dir.addEventListener('blur', () => pintarBarra());
  dir.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const u = aURL(dir.value); if (u) { ir(actual, u); dir.blur(); } }
    if (e.key === 'Escape') dir.blur();
  });

  const v = abrirVentana({ app: 'navegador', titulo: 'Navegador', ancho: 1080, alto: 680, contenido: raizN, herramientas: herr, barraAlta: true, sinTitulo: true,
    alCerrar: () => { window.removeEventListener('message', alMensaje); pestanas.forEach(t => { if (t.frame) t.frame.src = 'about:blank'; }); } });
  v.api = { nueva: url => crearPestana(url) };
  comprobarExtension().then(ok => { if (ok) puenteVisto = true; });
  crearPestana(arg);
}

/* =========================================================
   App: Ajustes del sistema
   ========================================================= */
const SECCIONES = [
  ['apariencia', 'Apariencia', SVG.paleta, '#1d1d1f'],
  ['fondo', 'Fondo de pantalla', SVG.imagen, '#32ade6'],
  ['dock', 'Escritorio y Dock', SVG.dock, '#1d1d1f'],
  ['usuario', 'Usuarios', SVG.persona, '#8e8e93'],
  ['apps', 'Aplicaciones', SVG.aplicaciones, '#0a84ff'],
  ['info', 'Información', SVG.info, '#8e8e93']
];
const ACENTOS = [['#0a84ff', 'Azul'], ['#a550a7', 'Morado'], ['#f74f9e', 'Rosa'], ['#ff453a', 'Rojo'], ['#ff9f0a', 'Naranja'], ['#ffd60a', 'Amarillo'], ['#32d74b', 'Verde'], ['#8e8e93', 'Grafito']];
function refrescarAjustes() { VENTANAS.filter(v => v.app === 'ajustes' && v.api && v.api.pintar).forEach(v => v.api.pintar()); }
function appAjustes(seccion) {
  const ya = VENTANAS.find(x => x.app === 'ajustes' && x.api && x.api.pintar);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); if (seccion) ya.api.ir(seccion); return; }
  let sec = seccion || 'apariencia';
  const c = el('div', 'ajustes', `<aside class="lateral"></aside><div class="aj-panel"></div>`);
  const lat = $('.lateral', c), pan = $('.aj-panel', c);
  SECCIONES.forEach(([id, nom, svg, color]) => {
    const b = el('button', 'lat-enlace', `<span class="mini" style="background:${color}">${svg}</span><span></span>`);
    b.dataset.s = id; b.lastChild.textContent = nom;
    b.addEventListener('click', () => { sec = id; pintar(); });
    lat.appendChild(b);
  });
  const cambiar = (k, val) => { AJ[k] = val; guardarAj(); aplicarTema(); pintar(); };
  function pintar() {
    $$('.lat-enlace', lat).forEach(b => b.classList.toggle('activo', b.dataset.s === sec));
    const titulo = SECCIONES.find(s => s[0] === sec)[1];
    v.titulo = titulo;
    let h = `<h2>${titulo}</h2>`;
    if (sec === 'apariencia') {
      const muestra = (a, b2) => `<span class="muestra" style="background:linear-gradient(135deg, ${a} 0 50%, ${b2} 50% 100%)"></span>`;
      h += `<div class="aj-bloque"><div class="aj-temas">
        ${[['claro', 'Claro', '#f5f5f7', '#ffffff'], ['oscuro', 'Oscuro', '#1f1f22', '#3a3a3e'], ['auto', 'Automático', '#f5f5f7', '#1f1f22']].map(t => `<button class="aj-tema${AJ.tema === t[0] ? ' activo' : ''}" data-tema="${t[0]}">${muestra(t[2], t[3])}${t[1]}</button>`).join('')}
        </div></div>
        <div class="aj-bloque"><div class="aj-fila"><span>Color de acento</span><div class="aj-colores">${ACENTOS.map(([col, n]) => `<button class="aj-color${AJ.acento === col ? ' activo' : ''}" style="background:${col}" data-acento="${col}" aria-label="${n}" title="${n}"></button>`).join('')}</div></div>
        <div class="aj-fila"><span>Brillo de la pantalla</span><input class="aj-rango" id="aj-brillo" type="range" min="25" max="100" value="${AJ.brillo}" aria-label="Brillo"></div></div>`;
    } else if (sec === 'fondo') {
      h += `<div class="aj-bloque"><div class="aj-fondos">
        ${Object.entries(FONDOS).map(([id, f]) => `<button class="aj-fondo${AJ.fondo === id ? ' activo' : ''}" data-fondo="${id}"><span class="muestra" style="background:${f.css}"></span>${f.nombre}</button>`).join('')}
        ${fondoPropio ? `<button class="aj-fondo${AJ.fondo === 'propio' ? ' activo' : ''}" data-fondo="propio"><span class="muestra" style="background:url('${fondoPropio}') center/cover"></span>Mi imagen</button>` : ''}
        </div><div class="aj-fila"><span>Usar una imagen de tu ordenador<small>JPG o PNG. Se guarda solo en este equipo.</small></span><label class="boton" style="display:grid;place-items:center">Elegir imagen…<input type="file" accept="image/*" id="aj-img" hidden></label></div></div>`;
    } else if (sec === 'dock') {
      h += `<div class="aj-bloque">
        <div class="aj-fila"><span>Ocultar y mostrar el Dock automáticamente<small>Se esconde abajo y sube al llevar el ratón al borde de la pantalla</small></span><input type="checkbox" class="interruptor" id="aj-autodock" ${AJ.ocultarDock ? 'checked' : ''}></div>
        <div class="aj-fila"><span>Tamaño del Dock</span><input class="aj-rango" id="aj-dock" type="range" min="36" max="76" value="${AJ.dockTam}" aria-label="Tamaño del Dock"></div>
        <div class="aj-fila"><span>Ampliación<small>Los iconos crecen al pasar el ratón</small></span><input type="checkbox" class="interruptor" id="aj-ampliar" ${AJ.ampliar ? 'checked' : ''}></div>
        <div class="aj-fila"><span>Mostrar iconos en el escritorio</span><input type="checkbox" class="interruptor" id="aj-iconos" ${AJ.iconosEsc ? 'checked' : ''}></div>
        <div class="aj-fila"><span>Reducir movimiento<small>Quita las animaciones de abrir, cerrar y minimizar</small></span><input type="checkbox" class="interruptor" id="aj-movimiento" ${AJ.menosMovimiento ? 'checked' : ''}></div></div>
        <div class="aj-bloque"><div class="aj-fila"><span>Sonidos del sistema<small>Al vaciar la papelera, al hacer capturas y al conseguir logros</small></span><input type="checkbox" class="interruptor" id="aj-sonidos" ${AJ.sonidos !== false ? 'checked' : ''}></div>
        <div class="aj-fila"><span>Música de arranque<small>Suena al encender BahíaOS</small></span><input type="checkbox" class="interruptor" id="aj-arranque" ${AJ.sonidoArranque !== false ? 'checked' : ''}></div>
        <div class="aj-fila"><span>Ciudad del tiempo<small>Para el widget del tiempo y para Chispa</small></span><input class="aj-texto" id="aj-ciudad" value="${esc(AJ.ciudad || '')}" maxlength="40"></div>
        <div class="aj-fila"><span>Escritorios<small>Cambia con Ctrl + ← / → o desde Mission Control (F3)</small></span><input class="aj-rango" id="aj-escritorios" type="range" min="1" max="6" value="${AJ.escritorios}" aria-label="Número de escritorios"><b id="aj-esc-n">${AJ.escritorios}</b></div>
        <div class="aj-fila"><span>Widgets del escritorio<small>Arrástralos para moverlos; clic derecho para quitarlos</small></span><select class="aj-texto" id="aj-widget"><option value="">Añadir widget…</option>${Object.entries(TIPOS_WIDGET).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div></div>
        <div class="aj-bloque"><div class="aj-fila"><span>Organizar las ventanas abiertas en mosaico</span><button class="boton" id="aj-mosaico">Organizar</button></div></div>`;
    } else if (sec === 'usuario') {
      const yo = usuarioActual(), todos = listaUsuarios();
      h += `<div class="aj-bloque"><div class="aj-fila"><span class="avatar aj-avatar" style="background:${esc(yo.color || '#8e8e93')}">${avatarHTML(yo)}</span><span><b>${esc(AJ.usuario)}</b><small>${USUARIO_ID === 'principal' ? 'Administrador' : 'Usuario'}${yo.pin ? ' · con PIN' : ''}</small></span></div>
        <div class="aj-fila"><span>Nombre</span><input class="aj-texto" id="aj-nombre" value="${esc(AJ.usuario)}" maxlength="24"></div>
        <div class="aj-fila"><span>Foto</span><label class="boton" style="display:grid;place-items:center">Elegir foto…<input type="file" accept="image/*" id="aj-foto" hidden></label>${yo.foto ? '<button class="boton" id="aj-sinfoto">Quitar</button>' : ''}</div>
        <div class="aj-fila"><span>PIN de bloqueo<small>${yo.pin ? 'Se pide al entrar en tu usuario' : 'Ahora mismo se entra sin PIN'}</small></span><input class="aj-texto" id="aj-pin" type="password" inputmode="numeric" maxlength="12" placeholder="${yo.pin ? 'PIN nuevo' : 'Escribe un PIN'}" style="width:130px"><button class="boton primario" id="aj-pin-ok">${yo.pin ? 'Cambiar' : 'Poner'}</button>${yo.pin ? '<button class="boton" id="aj-pin-quitar">Quitar</button>' : ''}</div></div>
        <h2 style="font-size:15px;margin:6px 0 10px">Usuarios de este ordenador</h2>
        <div class="aj-bloque">${todos.map(x => `<div class="aj-fila"><span class="avatar aj-avatar peq" style="background:${esc(x.color || '#8e8e93')}">${avatarHTML(x)}</span><span><b>${esc(x.nombre)}</b><small>${x.id === USUARIO_ID ? 'Sesión actual' : x.pin ? 'Con PIN' : 'Sin PIN'}</small></span>${x.id !== USUARIO_ID ? `<button class="boton" data-cambiar="${esc(x.id)}">Cambiar a este usuario</button>` : ''}${x.id !== 'principal' && x.id !== USUARIO_ID ? `<button class="boton" data-borrar="${esc(x.id)}">Eliminar</button>` : ''}</div>`).join('')}
        <div class="aj-fila"><span>Añadir usuario<small>Cada usuario tiene sus notas, su fondo, sus juegos de la Tienda y sus logros</small></span><input class="aj-texto" id="aj-nuevo" placeholder="Nombre" maxlength="24" style="width:150px"><button class="boton primario" id="aj-nuevo-ok">Añadir</button></div></div>
        <div class="aj-bloque"><div class="aj-fila"><span>Bloquear la pantalla ahora</span><button class="boton" id="aj-bloquear">Bloquear</button></div>
        <div class="aj-fila"><span>Borrar notas, ajustes y récords del sistema<small>Vuelve a dejar BahíaOS como recién instalado</small></span><button class="boton" id="aj-reset">Restablecer…</button></div></div>`;
    } else if (sec === 'apps') {
      h += `<div class="aj-bloque"><div class="aj-fila"><span>Añadir aplicación<small>Elige un archivo HTML y un icono (.ico). Se juntan en una app que se queda fija en el Dock.</small></span><button class="boton primario" id="aj-app-nueva">Añadir aplicación…</button></div>
        <div class="aj-app-form" id="aj-app-form" hidden>
          <label class="aj-fila"><span>Nombre</span><input class="aj-texto" id="aj-app-nombre" maxlength="30" placeholder="Mi aplicación"></label>
          <div class="aj-fila"><span>Archivo HTML<small id="aj-app-html-n">Ninguno elegido</small></span><label class="boton" style="display:grid;place-items:center">Elegir HTML…<input type="file" accept=".html,.htm,text/html" id="aj-app-html" hidden></label></div>
          <div class="aj-fila"><span>Icono (.ico)<small id="aj-app-ico-n">Ninguno elegido · también vale PNG o JPG</small></span><span class="aj-app-prev" id="aj-app-prev"></span><label class="boton" style="display:grid;place-items:center">Elegir icono…<input type="file" accept=".ico,image/x-icon,image/vnd.microsoft.icon,image/png,image/jpeg,image/webp,image/svg+xml" id="aj-app-ico" hidden></label></div>
          <div class="aj-fila"><span></span><button class="boton" id="aj-app-cancelar">Cancelar</button><button class="boton primario" id="aj-app-crear">Crear aplicación</button></div>
        </div></div>
        <h2 style="font-size:15px;margin:6px 0 10px">Tus aplicaciones</h2>
        <div class="aj-bloque">${MIS_APPS.length ? MIS_APPS.map(m => `<div class="aj-fila"><span class="aj-app-ic">${icono('mi:' + m.id)}</span><span><b>${esc(m.nombre)}</b><small>${esc(m.archivo || 'Archivo HTML')}</small></span><button class="boton" data-abrir-app="${esc(m.id)}">Abrir</button><button class="boton" data-borrar-app="${esc(m.id)}">Eliminar</button></div>`).join('') : '<div class="aj-fila"><span><small>Todavía no has añadido ninguna aplicación.</small></span></div>'}</div>`;
    } else if (sec === 'info') {
      let usado = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); usado += (k + localStorage.getItem(k)).length * 2; } } catch (e) {}
      h += `<div class="aj-bloque"><div class="aj-info"><svg class="logo" viewBox="0 0 64 64">${LOGO.replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg><h3>BahíaOS</h3><p>Versión 1.0 (Bahía)</p></div>
        <dl class="aj-dato"><dt>Nombre</dt><dd>${esc(AJ.usuario)}</dd><dt>Modo</dt><dd>${ES_APP ? 'Aplicación de escritorio' : 'Navegador web'}</dd><dt>Pantalla</dt><dd>${screen.width}×${screen.height}</dd>
        <dt>Procesadores</dt><dd>${navigator.hardwareConcurrency || '—'} núcleos</dd><dt>Juegos instalados</dt><dd>${JUEGOS.length}</dd><dt>Datos guardados</dt><dd>${(usado / 1024).toFixed(1)} KB</dd></dl></div>`;
    }
    pan.innerHTML = h;
    $$('[data-tema]', pan).forEach(b => b.addEventListener('click', () => { cambiar('tema', b.dataset.tema); refrescarCC(); }));
    $$('[data-acento]', pan).forEach(b => b.addEventListener('click', () => cambiar('acento', b.dataset.acento)));
    $$('[data-fondo]', pan).forEach(b => b.addEventListener('click', () => { AJ.fondo = b.dataset.fondo; guardarAj(); aplicarFondo(); pintar(); }));
    const on = (sel, ev, fn) => { const x = $(sel, pan); if (x) x.addEventListener(ev, fn); };
    on('#aj-brillo', 'input', e => { AJ.brillo = +e.target.value; guardarAj(); aplicarTema(); });
    on('#aj-dock', 'input', e => { AJ.dockTam = +e.target.value; guardarAj(); aplicarTema(); });
    on('#aj-ampliar', 'change', e => { AJ.ampliar = e.target.checked; guardarAj(); });
    on('#aj-iconos', 'change', e => { AJ.iconosEsc = e.target.checked; guardarAj(); pintarEscritorio(); });
    on('#aj-movimiento', 'change', e => { AJ.menosMovimiento = e.target.checked; guardarAj(); aplicarTema(); });
    on('#aj-mosaico', 'click', mosaico);
    on('#aj-nombre', 'change', e => { AJ.usuario = e.target.value.trim() || 'Usuario'; guardarAj(); sincronizarUsuario(); pintar(); });
    const nueva = { html: null, archivo: '', icono: null };
    on('#aj-app-nueva', 'click', () => { $('#aj-app-form', pan).hidden = false; $('#aj-app-nombre', pan).focus(); });
    on('#aj-app-cancelar', 'click', () => { $('#aj-app-form', pan).hidden = true; });
    on('#aj-app-html', 'change', e => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        nueva.html = String(r.result); nueva.archivo = f.name;
        $('#aj-app-html-n', pan).textContent = f.name;
        const n = $('#aj-app-nombre', pan);
        if (!n.value.trim()) { const m = nueva.html.match(/<title[^>]*>\s*([^<]{1,30}?)\s*<\/title>/i); n.value = (m && m[1].trim()) || f.name.replace(/\.html?$/i, ''); }
      };
      r.readAsText(f);
    });
    on('#aj-app-ico', 'change', e => {
      const f = e.target.files[0]; if (!f) return;
      iconoAPng(f).then(png => { nueva.icono = png; $('#aj-app-ico-n', pan).textContent = f.name; $('#aj-app-prev', pan).innerHTML = `<img alt="" src="${png}">`; })
        .catch(() => notificar('No se pudo leer el icono', 'Prueba con otro archivo .ico, .png o .jpg.', icono('ajustes')));
    });
    on('#aj-app-crear', 'click', () => {
      const nombre = $('#aj-app-nombre', pan).value.trim();
      if (!nueva.html) { notificar('Falta el archivo HTML', 'Elige el archivo HTML de la aplicación.', icono('ajustes')); return; }
      if (!nueva.icono) { notificar('Falta el icono', 'Elige un archivo .ico (o una imagen) para el icono.', icono('ajustes')); return; }
      crearMiApp({ nombre: nombre || 'Mi aplicación', html: nueva.html, archivo: nueva.archivo, icono: nueva.icono }).then(() => pintar());
    });
    $$('[data-abrir-app]', pan).forEach(b => b.addEventListener('click', () => abrirApp('mi:' + b.dataset.abrirApp)));
    $$('[data-borrar-app]', pan).forEach(b => b.addEventListener('click', () => {
      if (!b.dataset.ok) { b.dataset.ok = '1'; b.textContent = 'Pulsa otra vez'; b.classList.add('primario'); return; }
      eliminarMiApp(b.dataset.borrarApp).then(() => pintar());
    }));
    on('#aj-arranque', 'change', e => { AJ.sonidoArranque = e.target.checked; guardarAj(); if (AJ.sonidoArranque) sonar('arranque'); });
    on('#aj-autodock', 'change', e => { AJ.ocultarDock = e.target.checked; guardarAj(); aplicarDockAuto(); });
    on('#aj-sonidos', 'change', e => { AJ.sonidos = e.target.checked; guardarAj(); if (AJ.sonidos) sonar('pop'); });
    on('#aj-ciudad', 'change', e => { AJ.ciudad = e.target.value.trim() || 'Madrid'; guardarAj(); cargarTiempo(true).then(refrescarWidgets); });
    on('#aj-escritorios', 'input', e => { AJ.escritorios = +e.target.value; $('#aj-esc-n', pan).textContent = AJ.escritorios; VENTANAS.forEach(v => { if (v.esc >= AJ.escritorios) v.esc = AJ.escritorios - 1; }); if (escActual >= AJ.escritorios) cambiarEscritorio(AJ.escritorios - 1); aplicarEscritorio(); guardarAj(); });
    on('#aj-widget', 'change', e => { if (e.target.value) { anadirWidget(e.target.value); e.target.value = ''; } });
    on('#aj-foto', 'change', e => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image();
      img.onload = () => { const cv = document.createElement('canvas'); cv.width = cv.height = 160; const k = Math.max(160 / img.width, 160 / img.height); cv.getContext('2d').drawImage(img, (160 - img.width * k) / 2, (160 - img.height * k) / 2, img.width * k, img.height * k); guardarUsuario({ foto: cv.toDataURL('image/jpeg', .85) }); URL.revokeObjectURL(img.src); pintar(); };
      img.src = URL.createObjectURL(f);
    });
    on('#aj-sinfoto', 'click', () => { guardarUsuario({ foto: null }); pintar(); });
    on('#aj-pin-ok', 'click', () => { const v = $('#aj-pin', pan).value.trim(); if (v.length < 3) { notificar('PIN demasiado corto', 'Usa al menos 3 números o letras.', icono('ajustes')); return; } guardarUsuario({ pin: hashPin(v) }); notificar('PIN guardado', 'Se pedirá al entrar en tu usuario.', icono('ajustes')); pintar(); });
    on('#aj-pin-quitar', 'click', () => { guardarUsuario({ pin: null }); pintar(); });
    on('#aj-nuevo-ok', 'click', () => {
      const n = $('#aj-nuevo', pan).value.trim(); if (!n) return;
      const l = listaUsuarios(); l.push({ id: 'u' + Date.now().toString(36), nombre: n, color: COLORES_USUARIO[l.length % COLORES_USUARIO.length] });
      guardarGlobal('usuarios', l);
      try { localStorage.setItem('bahia.u.' + l[l.length - 1].id + '.ajustes', JSON.stringify({ usuario: n })); } catch (er) {}
      notificar('Usuario añadido', `«${n}» ya puede entrar desde la pantalla de bloqueo.`, icono('ajustes')); pintar();
    });
    $$('[data-cambiar]', pan).forEach(b => b.addEventListener('click', () => { usuarioElegido = b.dataset.cambiar; bloquear(); }));
    $$('[data-borrar]', pan).forEach(b => b.addEventListener('click', () => {
      if (!b.dataset.ok) { b.dataset.ok = '1'; b.textContent = 'Pulsa otra vez'; b.classList.add('primario'); return; }
      const id = b.dataset.borrar;
      guardarGlobal('usuarios', listaUsuarios().filter(x => x.id !== id));
      try { Object.keys(localStorage).filter(k => k.startsWith('bahia.u.' + id + '.')).forEach(k => localStorage.removeItem(k)); } catch (er) {}
      pintar();
    }));
    on('#aj-bloquear', 'click', bloquear);
    on('#aj-reset', 'click', e => {
      const b = e.target;
      if (b.dataset.confirmar) { try { indexedDB.deleteDatabase('bahiaos'); } catch (er) {} try { Object.keys(localStorage).filter(k => k.startsWith('bahia.') || /\.(record|mejor)/.test(k)).forEach(k => localStorage.removeItem(k)); } catch (er) {} location.reload(); }
      else { b.dataset.confirmar = '1'; b.textContent = 'Pulsa otra vez para confirmar'; b.classList.add('primario'); }
    });
    on('#aj-img', 'change', e => {
      const f = e.target.files[0]; if (!f) return;
      const lector = new FileReader();
      lector.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, 2400 / img.width), cv = document.createElement('canvas');
          cv.width = img.width * k; cv.height = img.height * k;
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          fondoPropio = cv.toDataURL('image/jpeg', .85);
          guardar('fondoPropio', fondoPropio);
          AJ.fondo = 'propio'; guardarAj(); aplicarFondo(); pintar();
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(f);
    });
  }
  const v = abrirVentana({ app: 'ajustes', titulo: 'Ajustes del sistema', ancho: 760, alto: 520, contenido: c, sinTitulo: true });
  v.api = { pintar, ir: s => { sec = s; pintar(); } };
  pintar();
}

/* =========================================================
   EXTRAS 1: flecha, Dock automático, sonidos, usuarios y escritorios
   ========================================================= */

/* ---------- Flecha propia (estilo Mac: negra con borde blanco) ---------- */
const flechaSVG = tam => `<svg xmlns='http://www.w3.org/2000/svg' width='${tam}' height='${tam}' viewBox='0 0 24 24'><defs><filter id='s' x='-40%' y='-40%' width='180%' height='180%'><feGaussianBlur stdDeviation='.75'/></filter></defs><path d='M5 3.2v16.9l4.1-4 2.9 6.4 2.7-1.2-2.8-6.2h5.8z' fill='#000' opacity='.35' filter='url(#s)' transform='translate(.4 1)'/><path d='M5 3.2v16.9l4.1-4 2.9 6.4 2.7-1.2-2.8-6.2h5.8z' fill='#111' stroke='#fff' stroke-width='1.45' stroke-linejoin='round'/></svg>`;
const CURSOR_CSS = `url("data:image/svg+xml,${encodeURIComponent(flechaSVG(24))}") 5 3, default`;
function aplicarCursor() {
  let st = $('#estilo-cursor');
  if (!st) { st = el('style'); st.id = 'estilo-cursor'; document.head.appendChild(st); }
  st.textContent = `html, body, button, label, a, select, summary, .ventana, .ventana.mc, .icono-esc, .dock-item, .wdg, [role=button], [role=tab] { cursor: ${CURSOR_CSS}; }
    input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, [contenteditable=true] { cursor: text; }
    .v-redim { cursor: nwse-resize; }`;
}

/* ---------- Dock que se esconde abajo (como en el Mac) ---------- */
let tDock = 0;
function mostrarDock() { if (!AJ.ocultarDock) return; clearTimeout(tDock); dock.classList.remove('oculto'); }
function ocultarDockLuego(ms = 450) {
  if (!AJ.ocultarDock) return;
  clearTimeout(tDock);
  tDock = setTimeout(() => {
    if (dock.matches(':hover') || !$('#lanzador').hidden || mc) return ocultarDockLuego(ms);
    dock.classList.add('oculto');
    $$('.dock-item', dock).forEach(it => { it.style.width = it.style.height = ''; });
  }, ms);
}
function aplicarDockAuto() {
  dock.classList.toggle('auto', !!AJ.ocultarDock);
  if (AJ.ocultarDock) dock.classList.add('oculto'); else { clearTimeout(tDock); dock.classList.remove('oculto'); }
  VENTANAS.filter(v => v.max).forEach(v => { v.el.style.height = (innerHeight - ALTO_MENU - altoDock() - 8) + 'px'; });
}
function prepararDockAuto() {
  const zona = el('div', 'dock-zona' + (ES_ANDROID ? ' tactil' : ''));
  $('#escritorio').appendChild(zona);
  zona.addEventListener('pointerenter', mostrarDock);
  zona.addEventListener('pointerdown', () => { mostrarDock(); if (ES_ANDROID) ocultarDockLuego(3500); });
  document.addEventListener('mousemove', e => { if (AJ.ocultarDock && e.clientY >= innerHeight - 3) mostrarDock(); }, { passive: true });
  dock.addEventListener('pointerenter', () => clearTimeout(tDock));
  dock.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') ocultarDockLuego(); });
  dock.addEventListener('pointerup', e => { if (e.pointerType === 'touch') ocultarDockLuego(2500); });
  new MutationObserver(() => { if (!$('#lanzador').hidden) mostrarDock(); else ocultarDockLuego(); }).observe($('#lanzador'), { attributes: true, attributeFilter: ['hidden'] });
  aplicarDockAuto();
}

/* ---------- Sonidos del sistema (hechos con el sintetizador del navegador) ---------- */
function sonar(tipo) {
  if (AJ.sonidos === false || !AJ.volumen) return;
  try { ctxAudio = ctxAudio || new (window.AudioContext || window.webkitAudioContext)(); if (ctxAudio.state === 'suspended') ctxAudio.resume(); } catch (e) { return; }
  const c = ctxAudio, t = c.currentTime + .01, vol = AJ.volumen / 100 * .22;
  const tono = (f, ini, dur, forma = 'sine', v = 1, f2) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = forma; o.frequency.setValueAtTime(f, t + ini);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + ini + dur);
    g.gain.setValueAtTime(.0001, t + ini);
    g.gain.exponentialRampToValueAtTime(vol * v, t + ini + .02);
    g.gain.exponentialRampToValueAtTime(.0001, t + ini + dur);
    o.connect(g).connect(c.destination); o.start(t + ini); o.stop(t + ini + dur + .05);
  };
  const ruido = (ini, dur, v = 1, frec = 2000) => {
    const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = b; fl.type = 'bandpass'; fl.frequency.value = frec; fl.Q.value = .8; g.gain.value = vol * v * 2.2;
    s.connect(fl).connect(g).connect(c.destination); s.start(t + ini);
  };
  switch (tipo) {
    case 'arranque': {
      // Acorde propio de BahíaOS (Re mayor con novena), que crece y se apaga despacio
      const notas = [73.4, 146.8, 220, 293.7, 370, 440, 554.4, 659.3];
      notas.forEach((f, i) => {
        [0, 2.5].forEach((desafino, k) => {
          const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter();
          o.type = i < 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = k ? desafino : -desafino;
          fl.type = 'lowpass'; fl.frequency.setValueAtTime(900, t); fl.frequency.linearRampToValueAtTime(3200, t + 1.2);
          const ini = t + i * .045, v = vol * (i < 2 ? .5 : .32);
          g.gain.setValueAtTime(.0001, ini); g.gain.exponentialRampToValueAtTime(v, ini + .35);
          g.gain.setValueAtTime(v, ini + .9); g.gain.exponentialRampToValueAtTime(.0001, ini + 4.2);
          o.connect(fl).connect(g).connect(c.destination); o.start(ini); o.stop(ini + 4.4);
        });
      });
      tono(1174.7, .5, 2.2, 'sine', .12); tono(1479.98, .62, 2, 'sine', .08);
      break;
    }
    case 'aviso': tono(1320, 0, .3, 'sine', .7, 880); break;
    case 'papelera': ruido(0, .35, 1.1, 1700); ruido(.16, .3, .9, 900); break;
    case 'captura': ruido(0, .05, 1.6, 4200); ruido(.085, .07, 1.3, 2800); break;
    case 'error': tono(240, 0, .14, 'square', .3); tono(190, .12, .22, 'square', .3); break;
    case 'logro': [523.3, 659.3, 784, 1046.5].forEach((f, i) => tono(f, .15 + i * .09, .55, 'triangle', .7)); break;
    case 'entrar': tono(660, 0, .16, 'sine', .45); tono(990, .08, .3, 'sine', .45); break;
    case 'pop': tono(620, 0, .09, 'sine', .5, 940); break;
  }
}

/* ---------- Usuarios (cada uno con su foto, su PIN y sus cosas) ---------- */
const hashPin = p => { let h = 2166136261; for (const ch of 'bahia:' + p) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); };
const COLORES_USUARIO = ['#0a84ff', '#ff375f', '#30d158', '#ff9f0a', '#bf5af2', '#64d2ff', '#ffd60a'];
function listaUsuarios() {
  let l = leerGlobal('usuarios', []);
  if (!Array.isArray(l)) l = [];
  if (!l.some(u => u.id === 'principal')) {
    const aj = leerGlobal('ajustes', {}) || {};
    l.unshift({ id: 'principal', nombre: aj.usuario || 'Usuario', color: COLORES_USUARIO[0] });
    guardarGlobal('usuarios', l);
  }
  return l;
}
function usuarioActual() { return listaUsuarios().find(u => u.id === USUARIO_ID) || listaUsuarios()[0]; }
function guardarUsuario(cambios, id = USUARIO_ID) {
  const l = listaUsuarios(), u = l.find(x => x.id === id);
  if (!u) return;
  Object.assign(u, cambios);
  guardarGlobal('usuarios', l);
}
function sincronizarUsuario() { guardarUsuario({ nombre: AJ.usuario }); }
function avatarHTML(u) {
  return u && u.foto ? `<img src="${u.foto}" alt="">` : esc(((u && u.nombre) || 'U').trim().charAt(0).toUpperCase() || 'U');
}
let usuarioElegido = USUARIO_ID;
function pintarUsuariosBloqueo() {
  const lista = listaUsuarios();
  const u = lista.find(x => x.id === usuarioElegido) || lista[0];
  usuarioElegido = u.id;
  const cont = $('.bl-usuario');
  cont.innerHTML = `
    <div class="avatar bl-avatar" style="background:${esc(u.color || '#8e8e93')}">${avatarHTML(u)}</div>
    <div class="bl-nombre"></div>
    ${u.pin
      ? `<form class="bl-pin"><input type="password" inputmode="numeric" maxlength="12" placeholder="Introduce el PIN" autocomplete="off" aria-label="PIN de ${esc(u.nombre)}"><button aria-label="Entrar">→</button></form>`
      : `<button class="bl-entrar">Entrar <span aria-hidden="true">→</span></button>`}
    <div class="bl-pista">${u.pin ? 'Escribe tu PIN y pulsa Intro' : 'Haz clic o pulsa Intro'}</div>
    ${lista.length > 1 ? `<div class="bl-otros">${lista.filter(x => x.id !== u.id).map(x => `<button class="bl-otro" data-id="${esc(x.id)}"><span class="avatar" style="background:${esc(x.color || '#8e8e93')}">${avatarHTML(x)}</span><span></span></button>`).join('')}</div>` : ''}`;
  $('.bl-nombre', cont).textContent = u.nombre;
  $$('.bl-otro', cont).forEach(b => { b.lastElementChild.textContent = lista.find(x => x.id === b.dataset.id).nombre; b.addEventListener('click', ev => { ev.stopPropagation(); usuarioElegido = b.dataset.id; pintarUsuariosBloqueo(); }); });
  const entrar = $('.bl-entrar', cont);
  if (entrar) { entrar.addEventListener('click', ev => { ev.stopPropagation(); entrarComo(u); }); setTimeout(() => entrar.focus(), 60); }
  const form = $('.bl-pin', cont);
  if (form) {
    const inp = $('input', form);
    form.addEventListener('click', ev => ev.stopPropagation());
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      if (hashPin(inp.value) === u.pin) entrarComo(u);
      else { sonar('error'); form.classList.remove('mal'); void form.offsetWidth; form.classList.add('mal'); inp.value = ''; inp.focus(); }
    });
    setTimeout(() => inp.focus(), 80);
  }
}
function intentarEntrar() {
  const u = listaUsuarios().find(x => x.id === usuarioElegido) || usuarioActual();
  if (u.pin) { const i = $('.bl-pin input'); if (i) i.focus(); return; }
  entrarComo(u);
}
function entrarComo(u) {
  guardarGlobal('ultimoUsuario', u.id);
  if (u.id !== USUARIO_ID) {
    try { sessionStorage.setItem('bahia.usuarioActivo', u.id); sessionStorage.setItem('bahia.volver', 'escritorio'); } catch (e) {}
    $('#bloqueo').classList.add('fuera');
    setTimeout(() => location.reload(), 350);
    return;
  }
  desbloquear(true);
}
function prepararBloqueo() {
  $('#bloqueo').addEventListener('click', e => { if (!e.target.closest('.bl-usuario')) intentarEntrar(); });
}

/* ---------- Varios escritorios ---------- */
let escActual = 0;
function aplicarEscritorio() { VENTANAS.forEach(v => v.el.classList.toggle('otro-esc', v.esc !== escActual)); }
function indicadorEscritorio() {
  let h = $('.esc-hud');
  if (!h) { h = el('div', 'esc-hud vidrio'); $('#escritorio').appendChild(h); }
  h.innerHTML = Array.from({ length: AJ.escritorios }, (_, i) => `<span class="${i === escActual ? 'activo' : ''}">${i + 1}</span>`).join('');
  h.classList.remove('fuera'); void h.offsetWidth; h.classList.add('ver');
  clearTimeout(h._t); h._t = setTimeout(() => { h.classList.remove('ver'); h.classList.add('fuera'); }, 900);
}
function cambiarEscritorio(n) {
  n = Math.max(0, Math.min(AJ.escritorios - 1, n));
  if (n === escActual) { indicadorEscritorio(); return; }
  const dir = n > escActual ? 1 : -1;
  escActual = n;
  aplicarEscritorio();
  activa = null; enfocarSiguiente();
  actualizarDock();
  if (!sinMovimiento()) {
    capaV.animate([{ transform: `translateX(${dir * 30}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: lento ? 1400 : 340, easing: 'cubic-bezier(.2,.9,.3,1)' });
    $('#fondo').animate([{ transform: `translateX(${dir * 2}%) scale(1.04)` }, { transform: 'none' }], { duration: 400, easing: 'ease-out' });
  }
  indicadorEscritorio();
  revisarLogros();
}
function moverAEscritorio(v, i) {
  if (!v) return;
  v.esc = i;
  aplicarEscritorio();
  if (activa === v && i !== escActual) { activa = null; enfocarSiguiente(); }
  notificar('Ventana movida', `«${v.titulo || nombreApp(v.app)}» está ahora en el Escritorio ${i + 1}.`, icono('lanzador'));
  revisarLogros();
}
function barraEscritorios() {
  const b = el('div', 'mc-espacios');
  const pintar = () => {
    b.innerHTML = '';
    for (let i = 0; i < AJ.escritorios; i++) {
      const n = VENTANAS.filter(v => v.esc === i && !v.min).length;
      const e = el('button', 'mc-esp' + (i === escActual ? ' activo' : ''), `<span class="mc-esp-mini" style="background:${cssFondo().replace(/"/g, "'")}"><b>${n || ''}</b></span><span>Escritorio ${i + 1}</span>${AJ.escritorios > 1 ? '<i class="mc-esp-x" title="Quitar escritorio">✕</i>' : ''}`);
      e.addEventListener('click', ev => {
        if (ev.target.closest('.mc-esp-x')) {
          VENTANAS.forEach(v => { if (v.esc === i) v.esc = 0; else if (v.esc > i) v.esc--; });
          AJ.escritorios--; guardarAj();
          if (escActual >= AJ.escritorios || escActual === i) escActual = Math.max(0, Math.min(escActual, AJ.escritorios - 1));
          aplicarEscritorio(); salirMC(); setTimeout(misionControl, 480);
          return;
        }
        salirMC(); setTimeout(() => cambiarEscritorio(i), 20);
      });
      b.appendChild(e);
    }
    if (AJ.escritorios < 6) {
      const mas = el('button', 'mc-esp mc-esp-mas', `<span class="mc-esp-mini">+</span><span>Añadir</span>`);
      mas.addEventListener('click', () => { AJ.escritorios++; guardarAj(); pintar(); });
      b.appendChild(mas);
    }
  };
  pintar();
  return b;
}

/* =========================================================
   EXTRAS 2: widgets, tiempo, música, fotos, capturas y grabadora
   ========================================================= */

/* ---------- Tiempo (datos abiertos de open-meteo.com, sin cuenta) ---------- */
let tiempoDatos = null, tiempoHora = 0, tiempoPeticion = null;
const TIEMPO_COD = c => c === 0 ? ['Despejado', '☀️'] : c <= 2 ? ['Poco nuboso', '⛅'] : c === 3 ? ['Nublado', '☁️'] : c <= 48 ? ['Niebla', '🌫️'] : c <= 57 ? ['Llovizna', '🌦️'] : c <= 67 ? ['Lluvia', '🌧️'] : c <= 77 ? ['Nieve', '❄️'] : c <= 82 ? ['Chubascos', '🌧️'] : c <= 86 ? ['Nevadas', '🌨️'] : ['Tormenta', '⛈️'];
function cargarTiempo(forzar) {
  if (!forzar && tiempoDatos && Date.now() - tiempoHora < 20 * 60e3) return Promise.resolve(tiempoDatos);
  if (tiempoPeticion) return tiempoPeticion;
  tiempoPeticion = (async () => {
    try {
      let geo = leer('geo', null);
      if (!geo || geo.ciudad !== AJ.ciudad) {
        const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=es&name=' + encodeURIComponent(AJ.ciudad));
        const d = await r.json(), g = d.results && d.results[0];
        if (!g) throw new Error('ciudad');
        geo = { ciudad: AJ.ciudad, nombre: g.name, lat: g.latitude, lon: g.longitude };
        guardar('geo', geo);
      }
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geo.lat}&longitude=${geo.lon}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`);
      const d = await r.json();
      tiempoDatos = { lugar: geo.nombre, temp: Math.round(d.current.temperature_2m), cod: d.current.weather_code, max: Math.round(d.daily.temperature_2m_max[0]), min: Math.round(d.daily.temperature_2m_min[0]) };
      tiempoHora = Date.now();
    } catch (e) { tiempoDatos = null; }
    tiempoPeticion = null;
    return tiempoDatos;
  })();
  return tiempoPeticion;
}

/* ---------- Widgets del escritorio ---------- */
const TIPOS_WIDGET = { reloj: 'Reloj', calendario: 'Calendario', tiempo: 'Tiempo', nota: 'Nota', records: 'Récords', musica: 'Música' };
let capaWidgets = null;
function pintarWidgets() {
  if (!capaWidgets) { capaWidgets = el('div', 'capa-widgets'); $('#escritorio').insertBefore(capaWidgets, $('#iconos-escritorio')); }
  capaWidgets.innerHTML = '';
  (AJ.widgets || []).forEach((w, i) => capaWidgets.appendChild(crearWidget(w, i)));
  refrescarWidgets();
}
function crearWidget(w, i) {
  const d = el('div', 'wdg vidrio wdg-' + w.tipo);
  d.style.left = Math.max(4, Math.min(w.x, innerWidth - 180)) + 'px';
  d.style.top = Math.max(36, Math.min(w.y, innerHeight - 200)) + 'px';
  d.dataset.tipo = w.tipo;
  if (w.tipo === 'reloj') d.innerHTML = `<svg viewBox="0 0 100 100" class="wdg-esfera"><circle cx="50" cy="50" r="47" class="e-fondo"/>${Array.from({ length: 12 }, (_, k) => { const a = k * Math.PI / 6; return `<text x="${50 + Math.sin(a) * 37}" y="${50 - Math.cos(a) * 37 + 4}" text-anchor="middle" class="e-num">${k || 12}</text>`; }).join('')}<line class="e-h" x1="50" y1="50" x2="50" y2="28"/><line class="e-m" x1="50" y1="50" x2="50" y2="16"/><line class="e-s" x1="50" y1="58" x2="50" y2="12"/><circle cx="50" cy="50" r="2.6" class="e-centro"/></svg><div class="wdg-pie"></div>`;
  if (w.tipo === 'calendario') d.innerHTML = '<div class="wdg-cal"></div>';
  if (w.tipo === 'tiempo') d.innerHTML = '<div class="wt"><b class="wt-lugar">Tiempo</b><div class="wt-temp">--°</div><div class="wt-icono"></div><div class="wt-desc">Cargando…</div><div class="wt-mm"></div></div>';
  if (w.tipo === 'nota') { d.innerHTML = '<textarea aria-label="Nota del escritorio" spellcheck="false"></textarea>'; const ta = $('textarea', d); ta.value = AJ.notaWidget || ''; ta.addEventListener('input', () => { AJ.notaWidget = ta.value; guardarAj(); }); }
  if (w.tipo === 'records') d.innerHTML = '<div class="wdg-rec"><b>Mejores récords</b><ol></ol></div>';
  if (w.tipo === 'musica') d.innerHTML = '<div class="wdg-mus"><div class="wm-portada"></div><div class="wm-info"><b>Música</b><small>Nada sonando</small></div><div class="wm-botones"><button data-m="ant" aria-label="Anterior">⏮</button><button data-m="play" aria-label="Reproducir">▶</button><button data-m="sig" aria-label="Siguiente">⏭</button></div></div>';
  // Arrastrar
  d.addEventListener('pointerdown', ev => {
    if (ev.button !== 0 || ev.target.closest('textarea, button, input')) return;
    const r = d.getBoundingClientRect(), dx = ev.clientX - r.left, dy = ev.clientY - r.top;
    d.setPointerCapture(ev.pointerId); d.classList.add('moviendo');
    const mover = m => { d.style.left = Math.max(0, Math.min(innerWidth - r.width, m.clientX - dx)) + 'px'; d.style.top = Math.max(32, Math.min(innerHeight - r.height, m.clientY - dy)) + 'px'; };
    const fin = () => {
      d.classList.remove('moviendo'); d.removeEventListener('pointermove', mover); d.removeEventListener('pointerup', fin);
      AJ.widgets[i].x = parseInt(d.style.left); AJ.widgets[i].y = parseInt(d.style.top); guardarAj();
    };
    d.addEventListener('pointermove', mover); d.addEventListener('pointerup', fin);
  });
  d.addEventListener('contextmenu', ev => {
    ev.preventDefault(); ev.stopPropagation();
    mostrarMenu([{ t: `Widget: ${TIPOS_WIDGET[w.tipo]}`, off: true }, { sep: 1 }, ...(w.tipo === 'tiempo' ? [{ t: 'Cambiar ciudad…', a: () => abrirApp('ajustes', 'dock') }] : []), { t: 'Quitar widget', a: () => { AJ.widgets.splice(i, 1); guardarAj(); pintarWidgets(); } }], ev.clientX, ev.clientY);
  });
  d.addEventListener('click', ev => {
    const b = ev.target.closest('[data-m]'); if (b) { ev.stopPropagation(); controlMusica(b.dataset.m); return; }
    if (w.tipo === 'records' && !ev.target.closest('textarea')) abrirApp('logros');
  });
  return d;
}
function anadirWidget(tipo) {
  AJ.widgets.push({ tipo, x: 220 + Math.round(Math.random() * 200), y: 80 + Math.round(Math.random() * 160) });
  guardarAj(); pintarWidgets();
}
function refrescarWidgets() {
  if (!capaWidgets) return;
  const ahora = new Date();
  $$('.wdg-reloj', capaWidgets).forEach(d => {
    const h = ahora.getHours() % 12, m = ahora.getMinutes(), s = ahora.getSeconds();
    $('.e-h', d).setAttribute('transform', `rotate(${h * 30 + m / 2} 50 50)`);
    $('.e-m', d).setAttribute('transform', `rotate(${m * 6 + s / 10} 50 50)`);
    $('.e-s', d).setAttribute('transform', `rotate(${s * 6} 50 50)`);
    $('.wdg-pie', d).textContent = ahora.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
  });
  $$('.wdg-cal', capaWidgets).forEach(d => {
    const clave = ahora.toDateString(); if (d.dataset.dia === clave) return; d.dataset.dia = clave;
    d.innerHTML = `<div class="wc-cab"><b>${ahora.toLocaleDateString('es-ES', { month: 'long' })}</b><span>${ahora.getFullYear()}</span></div>${miniMes(ahora)}`;
  });
  $$('.wdg-rec ol', capaWidgets).forEach(ol => {
    const l = puntuaciones().filter(p => p.valor > 0).slice(0, 4);
    ol.innerHTML = l.length ? l.map(p => `<li><span>${esc(p.nombre)}</span><b>${esc(String(p.valor))}</b></li>`).join('') : '<li class="vacio">Juega para ver aquí tus récords</li>';
  });
  $$('.wdg-mus', capaWidgets).forEach(d => {
    const c = cancionActual();
    $('.wm-info b', d).textContent = c ? partesCancion(c).titulo : 'Música';
    $('.wm-info small', d).textContent = c ? (partesCancion(c).artista || 'Música') : (CANCIONES.length ? `${CANCIONES.length} canciones` : 'Añade canciones en Música');
    $('.wm-portada', d).style.background = c ? portadaCSS(c) : '';
    $('[data-m="play"]', d).textContent = audioMusica.paused ? '▶' : '⏸';
  });
  if ($('.wdg-tiempo', capaWidgets)) cargarTiempo().then(t => {
    $$('.wdg-tiempo', capaWidgets).forEach(d => {
      if (!t) { $('.wt-desc', d).textContent = 'Sin conexión'; return; }
      const [desc, ic] = TIEMPO_COD(t.cod);
      $('.wt-lugar', d).textContent = t.lugar; $('.wt-temp', d).textContent = t.temp + '°';
      $('.wt-icono', d).textContent = ic; $('.wt-desc', d).textContent = desc; $('.wt-mm', d).textContent = `Máx. ${t.max}°  Mín. ${t.min}°`;
    });
  });
}

/* ---------- Fondos que cambian con la hora ---------- */
function fondoSegunHora() {
  const h = new Date().getHours();
  return h >= 6 && h < 10 ? 'amanecer' : h >= 10 && h < 17 ? 'laguna' : h >= 17 && h < 21 ? 'bahia' : 'noche';
}

/* ---------- Música ---------- */
const audioMusica = new Audio();
audioMusica.preload = 'auto';
let CANCIONES = [], idxMusica = -1, urlMusica = null, aleatorio = false, repetir = true;
function partesCancion(c) {
  const m = c.nombre.split(/\s+-\s+/);
  return m.length > 1 ? { artista: m[0].trim(), titulo: m.slice(1).join(' - ').trim() } : { artista: '', titulo: c.nombre };
}
function portadaCSS(c) { const p = colorDe(c.nombre); return `linear-gradient(135deg, ${p[0]}, ${p[1]})`; }
const cancionActual = () => CANCIONES[idxMusica] || null;
function cargarCanciones() { return BD.todos('canciones').then(l => { CANCIONES = (l || []).sort((a, b) => a.fecha - b.fecha); refrescarMusica(); }).catch(() => {}); }
function anadirCanciones(files) {
  let n = 0;
  files.forEach(f => {
    const d = { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nombre: f.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '), tipo: f.type || 'audio/mpeg', datos: f, fecha: Date.now() + n++ };
    BD.poner(d, 'canciones').then(() => { CANCIONES.push(d); refrescarMusica(); }).catch(() => notificar('No se pudo guardar', `«${f.name}» es demasiado grande o no se puede leer.`, icono('musica')));
  });
  notificar('Música', files.length === 1 ? `«${files[0].name}» se ha añadido a tu biblioteca.` : `${files.length} canciones añadidas a tu biblioteca.`, icono('musica'));
}
function reproducirCancion(i) {
  const c = CANCIONES[i]; if (!c) return;
  idxMusica = i;
  if (urlMusica) URL.revokeObjectURL(urlMusica);
  urlMusica = URL.createObjectURL(c.datos);
  audioMusica.src = urlMusica;
  audioMusica.volume = Math.max(0, Math.min(1, AJ.volumen / 100));
  audioMusica.play().catch(() => {});
  AJ.stats.canciones = (AJ.stats.canciones || 0) + 1; guardarAj(); revisarLogros();
  try {
    if ('mediaSession' in navigator) {
      const p = partesCancion(c);
      navigator.mediaSession.metadata = new MediaMetadata({ title: p.titulo, artist: p.artista || 'BahíaOS', album: 'Música' });
      navigator.mediaSession.setActionHandler('previoustrack', () => controlMusica('ant'));
      navigator.mediaSession.setActionHandler('nexttrack', () => controlMusica('sig'));
    }
  } catch (e) {}
  refrescarMusica();
}
function controlMusica(accion) {
  if (!CANCIONES.length) { abrirApp('musica'); return; }
  if (accion === 'play') { if (idxMusica < 0) reproducirCancion(0); else if (audioMusica.paused) audioMusica.play().catch(() => {}); else audioMusica.pause(); }
  if (accion === 'sig') reproducirCancion(aleatorio ? Math.floor(Math.random() * CANCIONES.length) : (idxMusica + 1) % CANCIONES.length);
  if (accion === 'ant') { if (audioMusica.currentTime > 3) audioMusica.currentTime = 0; else reproducirCancion((idxMusica - 1 + CANCIONES.length) % CANCIONES.length); }
  refrescarMusica();
}
audioMusica.addEventListener('ended', () => { if (aleatorio || repetir || idxMusica < CANCIONES.length - 1) controlMusica('sig'); else refrescarMusica(); });
['play', 'pause'].forEach(ev => audioMusica.addEventListener(ev, () => refrescarMusica()));
function refrescarMusica() {
  const mb = $('#mb-musica');
  if (mb) {
    const c = cancionActual();
    mb.hidden = !c;
    if (c) { mb.querySelector('span').textContent = partesCancion(c).titulo; mb.classList.toggle('sonando', !audioMusica.paused); }
  }
  VENTANAS.filter(v => v.app === 'musica' && v.api).forEach(v => v.api.pintar());
  refrescarWidgets();
}
const tiempoTxt = s => !isFinite(s) ? '0:00' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function appMusica() {
  if (existente('musica')) return;
  const c = el('div', 'mus');
  c.innerHTML = `
    <aside class="lateral"><div class="lat-grupo">Biblioteca</div><button class="lat-enlace activo"><span class="mini" style="background:#ff375f">♪</span><span>Canciones</span></button>
      <div class="lat-grupo">Añadir</div><button class="lat-enlace" data-a="anadir"><span class="mini" style="background:#0a84ff">+</span><span>Añadir canciones…</span></button></aside>
    <div class="mus-principal">
      <div class="mus-cab"><div class="mus-portada-g"></div><div><small>LISTA</small><h2>Mis canciones</h2><p class="mus-n"></p><div class="mus-acc"><button class="boton primario" data-a="todo">▶ Reproducir</button><button class="boton" data-a="aleatorio">Aleatorio</button></div></div></div>
      <div class="mus-lista" tabindex="0"></div>
      <div class="mus-barra">
        <div class="mus-actual"><div class="mus-portada"></div><div><b></b><small></small></div></div>
        <div class="mus-ctrl"><div class="mus-botones"><button data-m="ant" aria-label="Anterior">⏮</button><button data-m="play" class="mus-play" aria-label="Reproducir">▶</button><button data-m="sig" aria-label="Siguiente">⏭</button></div>
          <div class="mus-progreso"><span class="t1">0:00</span><input type="range" min="0" max="1000" value="0" aria-label="Progreso"><span class="t2">0:00</span></div></div>
        <div class="mus-extra"><button data-m="aleatorio" title="Aleatorio" aria-label="Aleatorio">🔀</button><button data-m="repetir" title="Repetir" aria-label="Repetir">🔁</button><input type="range" min="0" max="100" class="mus-vol" aria-label="Volumen"></div>
      </div>
    </div>`;
  const lista = $('.mus-lista', c), prog = $('.mus-progreso input', c);
  let arrastrando = false;
  function pintar() {
    $('.mus-n', c).textContent = CANCIONES.length ? `${CANCIONES.length} ${CANCIONES.length === 1 ? 'canción' : 'canciones'}` : 'Todavía no hay canciones';
    lista.innerHTML = CANCIONES.length ? '' : `<div class="mus-vacio"><b>Tu biblioteca está vacía</b><br>Pulsa «Añadir canciones…» o arrastra aquí tus archivos MP3.</div>`;
    CANCIONES.forEach((s, i) => {
      const p = partesCancion(s);
      const f = el('button', 'mus-fila' + (i === idxMusica ? ' actual' : ''), `<span class="mus-num">${i === idxMusica && !audioMusica.paused ? '♪' : i + 1}</span><span class="mus-t"></span><span class="mus-a"></span>`);
      $('.mus-t', f).textContent = p.titulo; $('.mus-a', f).textContent = p.artista;
      f.addEventListener('dblclick', () => reproducirCancion(i));
      f.addEventListener('click', ev => { if (ev.detail === 1 && ES_ANDROID) reproducirCancion(i); });
      f.addEventListener('contextmenu', ev => { ev.preventDefault(); ev.stopPropagation(); mostrarMenu([{ t: 'Reproducir', a: () => reproducirCancion(i) }, { sep: 1 }, { t: 'Eliminar de la biblioteca', a: () => {
        BD.quitar(s.id, 'canciones').then(() => { if (i === idxMusica) { audioMusica.pause(); idxMusica = -1; } else if (i < idxMusica) idxMusica--; CANCIONES.splice(i, 1); refrescarMusica(); });
      } }], ev.clientX, ev.clientY); });
      lista.appendChild(f);
    });
    const s = cancionActual();
    $('.mus-actual b', c).textContent = s ? partesCancion(s).titulo : 'Nada sonando';
    $('.mus-actual small', c).textContent = s ? partesCancion(s).artista : '';
    $('.mus-portada', c).style.background = s ? portadaCSS(s) : '';
    $('.mus-play', c).textContent = audioMusica.paused ? '▶' : '⏸';
    $('[data-m="aleatorio"]', c).classList.toggle('on', aleatorio);
    $('[data-m="repetir"]', c).classList.toggle('on', repetir);
    $('.mus-vol', c).value = AJ.volumen;
  }
  const tic2 = () => {
    if (!arrastrando && audioMusica.duration) prog.value = Math.round(audioMusica.currentTime / audioMusica.duration * 1000);
    $('.t1', c).textContent = tiempoTxt(audioMusica.currentTime); $('.t2', c).textContent = tiempoTxt(audioMusica.duration);
  };
  audioMusica.addEventListener('timeupdate', tic2);
  prog.addEventListener('input', () => { arrastrando = true; });
  prog.addEventListener('change', () => { if (audioMusica.duration) audioMusica.currentTime = prog.value / 1000 * audioMusica.duration; arrastrando = false; });
  $('.mus-vol', c).addEventListener('input', e => { AJ.volumen = +e.target.value; audioMusica.volume = AJ.volumen / 100; guardarAj(); });
  c.addEventListener('click', e => {
    const b = e.target.closest('[data-m], [data-a]'); if (!b) return;
    if (b.dataset.m === 'aleatorio') { aleatorio = !aleatorio; pintar(); return; }
    if (b.dataset.m === 'repetir') { repetir = !repetir; pintar(); return; }
    if (b.dataset.m) controlMusica(b.dataset.m);
    if (b.dataset.a === 'anadir') elegirArchivos('audio/*,.mp3,.m4a,.wav,.ogg', anadirCanciones);
    if (b.dataset.a === 'todo' && CANCIONES.length) { aleatorio = false; reproducirCancion(0); }
    if (b.dataset.a === 'aleatorio' && CANCIONES.length) { aleatorio = true; reproducirCancion(Math.floor(Math.random() * CANCIONES.length)); }
  });
  lista.addEventListener('dragover', e => { e.preventDefault(); lista.classList.add('soltar'); });
  lista.addEventListener('dragleave', () => lista.classList.remove('soltar'));
  lista.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); lista.classList.remove('soltar'); subirArchivos(e.dataTransfer.files); });
  const v = abrirVentana({ app: 'musica', titulo: 'Música', ancho: 860, alto: 560, contenido: c, sinTitulo: true,
    alCerrar: () => audioMusica.removeEventListener('timeupdate', tic2),
    alTeclado: e => { if (e.key === ' ') { e.preventDefault(); controlMusica('play'); } } });
  v.api = { pintar };
  pintar(); tic2();
}
function elegirArchivos(accept, alElegir) {
  const i = document.createElement('input');
  i.type = 'file'; i.accept = accept; i.multiple = true;
  i.addEventListener('change', () => { if (i.files.length) alElegir([...i.files]); });
  i.click();
}

/* ---------- Fotos ---------- */
let FOTOS = [];
const urlsFotos = new Map();
const urlFoto = d => { if (!urlsFotos.has(d.id)) urlsFotos.set(d.id, URL.createObjectURL(d.blob)); return urlsFotos.get(d.id); };
function cargarFotos() { return BD.todos('fotos').then(l => { FOTOS = (l || []).sort((a, b) => b.fecha - a.fecha); refrescarFotos(); }).catch(() => {}); }
function guardarFoto(blob, nombre, album) {
  const d = { id: 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nombre, blob, album, tipo: /^video/.test(blob.type) ? 'video' : 'imagen', fecha: Date.now() };
  return BD.poner(d, 'fotos').then(() => { FOTOS.unshift(d); refrescarFotos(); return d; });
}
function importarFotos(files, album) {
  Promise.all(files.map(f => guardarFoto(f, f.name, album || 'Importadas').catch(() => null))).then(r => {
    const n = r.filter(Boolean).length;
    if (n) notificar('Fotos', n === 1 ? 'Se ha añadido 1 archivo a Fotos.' : `Se han añadido ${n} archivos a Fotos.`, icono('fotos'));
  });
}
function refrescarFotos() { VENTANAS.filter(v => v.app === 'fotos' && v.api).forEach(v => v.api.pintar()); VENTANAS.filter(v => v.app === 'grabadora' && v.api).forEach(v => v.api.pintar()); }
function ponerDeFondo(d) {
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, 2400 / img.width), cv = document.createElement('canvas');
    cv.width = img.width * k; cv.height = img.height * k;
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    fondoPropio = cv.toDataURL('image/jpeg', .85); guardar('fondoPropio', fondoPropio);
    AJ.fondo = 'propio'; guardarAj(); aplicarFondo(); refrescarAjustes();
    notificar('Fondo de pantalla', 'Tu foto ya es el fondo de pantalla.', icono('fotos'));
  };
  img.src = urlFoto(d);
}
function appFotos(album) {
  const ya = VENTANAS.find(x => x.app === 'fotos' && x.api);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); if (album) ya.api.ir(album); return; }
  let alb = album || 'Todas', abierta = -1;
  const c = el('div', 'fotos');
  c.innerHTML = `<aside class="lateral"><div class="lat-grupo">Fotos</div></aside><div class="fot-principal"><div class="fot-rejilla"></div><div class="fot-visor" hidden></div></div>`;
  const lat = $('.lateral', c), rej = $('.fot-rejilla', c), visor = $('.fot-visor', c);
  [['Todas', '#0a84ff', '▦'], ['Importadas', '#30d158', '↓'], ['Capturas', '#ff9f0a', '⌗'], ['Grabaciones', '#ff375f', '●']].forEach(([n, col, ic]) => {
    const b = el('button', 'lat-enlace', `<span class="mini" style="background:${col}">${ic}</span><span>${n}</span>`); b.dataset.alb = n;
    b.addEventListener('click', () => { alb = n; cerrarVisor(); pintar(); });
    lat.appendChild(b);
  });
  const imp = el('button', 'lat-enlace', `<span class="mini" style="background:#8e8e93">+</span><span>Importar…</span>`);
  imp.addEventListener('click', () => elegirArchivos('image/*,video/*', f => importarFotos(f, 'Importadas')));
  lat.appendChild(el('div', 'lat-grupo', 'Añadir')); lat.appendChild(imp);
  const lista = () => FOTOS.filter(f => alb === 'Todas' || f.album === alb);
  function pintar() {
    $$('[data-alb]', lat).forEach(b => b.classList.toggle('activo', b.dataset.alb === alb));
    const l = lista();
    rej.innerHTML = l.length ? '' : `<div class="f-vacio">${alb === 'Capturas' ? 'Haz una captura con Ctrl + Mayús + 3 (toda la pantalla) o Ctrl + Mayús + 4 (la ventana activa).' : alb === 'Grabaciones' ? 'Graba la pantalla con la app Grabadora (Ctrl + Mayús + 5).' : 'No hay fotos. Pulsa «Importar…» o arrastra imágenes aquí.'}</div>`;
    l.forEach((d, i) => {
      const b = el('button', 'fot-mini' + (d.tipo === 'video' ? ' video' : ''));
      b.innerHTML = d.tipo === 'video' ? `<video muted preload="metadata" src="${urlFoto(d)}#t=0.5"></video><span class="fot-play">▶</span>` : `<img loading="lazy" alt="" src="${urlFoto(d)}">`;
      b.title = d.nombre;
      b.addEventListener('click', () => abrirVisor(i));
      rej.appendChild(b);
    });
    v.titulo = 'Fotos — ' + alb;
  }
  function abrirVisor(i) {
    const l = lista(); const d = l[i]; if (!d) return;
    abierta = i;
    visor.innerHTML = `<div class="fot-medio">${d.tipo === 'video' ? `<video controls autoplay src="${urlFoto(d)}"></video>` : `<img alt="" src="${urlFoto(d)}">`}</div>
      <div class="fot-barra"><button class="boton" data-v="cerrar">← Volver</button><span class="fot-nombre"></span><span class="f-hueco"></span>
      ${d.tipo === 'imagen' ? '<button class="boton" data-v="fondo">Poner como fondo</button>' : ''}<a class="boton" data-v="bajar" download>Descargar</a><button class="boton" data-v="borrar">Eliminar</button>
      <button class="boton" data-v="ant" aria-label="Anterior">‹</button><button class="boton" data-v="sig" aria-label="Siguiente">›</button></div>`;
    $('.fot-nombre', visor).textContent = d.nombre;
    const a = $('[data-v="bajar"]', visor); a.href = urlFoto(d); a.download = d.nombre.replace(/[\\/:*?"<>|]/g, '-') + (/\.\w+$/.test(d.nombre) ? '' : d.tipo === 'video' ? '.webm' : '.png');
    visor.hidden = false; rej.hidden = true;
  }
  function cerrarVisor() { visor.hidden = true; visor.innerHTML = ''; rej.hidden = false; abierta = -1; }
  visor.addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    const l = lista(), d = l[abierta];
    if (b.dataset.v === 'cerrar') cerrarVisor();
    if (b.dataset.v === 'fondo' && d) ponerDeFondo(d);
    if (b.dataset.v === 'borrar' && d) BD.quitar(d.id, 'fotos').then(() => { FOTOS.splice(FOTOS.indexOf(d), 1); cerrarVisor(); pintar(); });
    if (b.dataset.v === 'ant') abrirVisor((abierta - 1 + l.length) % l.length);
    if (b.dataset.v === 'sig') abrirVisor((abierta + 1) % l.length);
  });
  rej.addEventListener('dragover', e => { e.preventDefault(); });
  rej.addEventListener('drop', e => { e.preventDefault(); e.stopPropagation(); subirArchivos(e.dataTransfer.files); });
  const v = abrirVentana({ app: 'fotos', titulo: 'Fotos', ancho: 900, alto: 580, contenido: c, sinTitulo: true,
    alTeclado: e => { if (abierta < 0) return; if (e.key === 'ArrowLeft') abrirVisor((abierta - 1 + lista().length) % lista().length); if (e.key === 'ArrowRight') abrirVisor((abierta + 1) % lista().length); if (e.key === 'Escape') cerrarVisor(); } });
  v.api = { pintar: () => { if (abierta < 0) pintar(); }, ir: a => { alb = a; cerrarVisor(); pintar(); }, atras: () => { if (abierta >= 0) { cerrarVisor(); return true; } return false; } };
  pintar();
}

/* ---------- Capturas de pantalla ---------- */
let flujoPantalla = null;
const puedeCapturar = () => !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) && !ES_ANDROID;
async function obtenerFlujo() {
  if (flujoPantalla && flujoPantalla.getVideoTracks().some(t => t.readyState === 'live')) return flujoPantalla;
  flujoPantalla = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true, preferCurrentTab: true, selfBrowserSurface: 'include', surfaceSwitching: 'exclude', systemAudio: 'include' });
  flujoPantalla.getVideoTracks()[0].addEventListener('ended', () => { flujoPantalla = null; });
  return flujoPantalla;
}
async function videoDeFlujo(flujo) {
  const v = document.createElement('video');
  v.srcObject = new MediaStream(flujo.getVideoTracks()); v.muted = true; v.playsInline = true;
  await v.play();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  return v;
}
async function hacerCaptura(soloVentana) {
  if (!puedeCapturar()) { notificar('Captura de pantalla', ES_ANDROID ? 'En Android usa el botón de captura del propio móvil.' : 'Este navegador no permite capturas.', icono('fotos')); return; }
  let flujo;
  try { flujo = await obtenerFlujo(); } catch (e) { notificar('No se hizo la captura', 'Para hacer capturas, permite que BahíaOS vea esta ventana.', icono('fotos')); return; }
  const vid = await videoDeFlujo(flujo);
  const kx = vid.videoWidth / innerWidth, ky = vid.videoHeight / innerHeight;
  let r = { x: 0, y: 0, w: innerWidth, h: innerHeight };
  if (soloVentana && activa && !activa.min) { const b = activa.el.getBoundingClientRect(); r = { x: b.left, y: b.top, w: b.width, h: b.height }; }
  const cv = document.createElement('canvas');
  cv.width = Math.round(r.w * kx); cv.height = Math.round(r.h * ky);
  cv.getContext('2d').drawImage(vid, r.x * kx, r.y * ky, r.w * kx, r.h * ky, 0, 0, cv.width, cv.height);
  vid.srcObject = null;
  const ahora = new Date();
  cv.toBlob(b => {
    if (!b) return;
    const nombre = `Captura ${ahora.toLocaleDateString('es-ES')} a las ${ahora.toLocaleTimeString('es-ES').replace(/:/g, '.')}.png`;
    destello(); sonar('captura');
    guardarFoto(b, nombre, 'Capturas').then(d => miniaturaCaptura(d));
    AJ.stats.capturas = (AJ.stats.capturas || 0) + 1; guardarAj(); revisarLogros();
  }, 'image/png');
}
function destello() {
  const f = el('div', 'destello'); document.body.appendChild(f);
  setTimeout(() => f.remove(), 450);
}
function miniaturaCaptura(d) {
  const m = el('button', 'mini-captura', `<img alt="Captura" src="${urlFoto(d)}">`);
  m.addEventListener('click', () => { m.remove(); abrirApp('fotos', 'Capturas'); });
  $('#escritorio').appendChild(m);
  setTimeout(() => { m.classList.add('fuera'); setTimeout(() => m.remove(), 400); }, 4500);
}

/* ---------- Grabadora de pantalla ---------- */
let grabacion = null;
function textoGrabando() { return grabacion ? tiempoTxt((Date.now() - grabacion.inicio) / 1000) : ''; }
async function empezarGrabacion(soloVentana, conSonido) {
  if (!puedeCapturar() || !window.MediaRecorder) { notificar('Grabadora', ES_ANDROID ? 'En Android usa la grabadora de pantalla del propio móvil.' : 'Este navegador no permite grabar.', icono('grabadora')); return; }
  if (grabacion) return;
  let flujo;
  try { flujo = await obtenerFlujo(); } catch (e) { notificar('No se pudo grabar', 'Para grabar, permite que BahíaOS vea esta ventana.', icono('grabadora')); return; }
  const objetivo = soloVentana ? VENTANAS.filter(v => !v.min && v.esc === escActual && v.app !== 'grabadora').sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0] : null;
  const vid = await videoDeFlujo(flujo);
  const cv = document.createElement('canvas'), cx = cv.getContext('2d');
  const kx = vid.videoWidth / innerWidth, ky = vid.videoHeight / innerHeight;
  const zona = () => { if (objetivo && !objetivo.min && VENTANAS.includes(objetivo)) { const b = objetivo.el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; } return { x: 0, y: 0, w: innerWidth, h: innerHeight }; };
  const z0 = zona(); cv.width = Math.round(z0.w * kx) & ~1; cv.height = Math.round(z0.h * ky) & ~1;
  let vivo = true;
  const dibujar = () => { if (!vivo) return; const z = zona(); cx.fillStyle = '#000'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(vid, z.x * kx, z.y * ky, z.w * kx, z.h * ky, 0, 0, cv.width, cv.height); requestAnimationFrame(dibujar); };
  dibujar();
  const salida = cv.captureStream(30);
  if (conSonido) flujo.getAudioTracks().forEach(t => salida.addTrack(t));
  const tipo = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
  const rec = new MediaRecorder(salida, tipo ? { mimeType: tipo, videoBitsPerSecond: 6e6 } : undefined);
  const trozos = [];
  rec.ondataavailable = e => { if (e.data && e.data.size) trozos.push(e.data); };
  rec.onstop = () => {
    vivo = false; vid.srcObject = null;
    const b = new Blob(trozos, { type: 'video/webm' });
    const ahora = new Date();
    guardarFoto(b, `Grabación ${ahora.toLocaleDateString('es-ES')} a las ${ahora.toLocaleTimeString('es-ES').replace(/:/g, '.')}.webm`, 'Grabaciones').then(() => {
      notificar('Grabación guardada', 'Está en Fotos, en el álbum Grabaciones.', icono('grabadora'));
    });
    AJ.stats.grabaciones = (AJ.stats.grabaciones || 0) + 1; guardarAj();
    clearInterval(grabacion.reloj); grabacion = null; pintarGrabando();
  };
  rec.start(1000);
  grabacion = { rec, inicio: Date.now(), reloj: setInterval(pintarGrabando, 500) };
  VENTANAS.filter(v => v.app === 'grabadora').forEach(minimizar);
  pintarGrabando();
}
function pararGrabacion() { if (grabacion && grabacion.rec.state !== 'inactive') grabacion.rec.stop(); }
function pintarGrabando() {
  const b = $('#mb-grabando');
  if (b) { b.hidden = !grabacion; b.querySelector('span').textContent = textoGrabando(); }
  VENTANAS.filter(v => v.app === 'grabadora' && v.api).forEach(v => v.api.pintar());
}
function appGrabadora() {
  const ya = VENTANAS.find(x => x.app === 'grabadora' && x.api);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); return; }
  const c = el('div', 'grab');
  c.innerHTML = `<div class="grab-centro">
      <button class="grab-boton" aria-label="Grabar"><span></span></button>
      <div class="grab-estado"></div>
      <div class="grab-opciones">
        <label><input type="radio" name="grab-zona-${seq}" value="todo" checked> Toda la pantalla de BahíaOS</label>
        <label><input type="radio" name="grab-zona-${seq}" value="ventana"> Solo la ventana de delante (por ejemplo, un juego)</label>
        <label><input type="checkbox" class="grab-sonido" checked> Grabar también el sonido</label>
      </div>
      <p class="grab-nota">La primera vez, Edge te preguntará si BahíaOS puede ver esta ventana: elige «Permitir». Para parar, pulsa el punto rojo de la barra de arriba.</p>
    </div>
    <div class="grab-lista"><h4>Últimas grabaciones</h4><div class="grab-items"></div><button class="boton" data-a="fotos">Ver todas en Fotos</button></div>`;
  const pintar = () => {
    const bot = $('.grab-boton', c);
    bot.classList.toggle('grabando', !!grabacion);
    $('.grab-estado', c).textContent = grabacion ? 'Grabando… ' + textoGrabando() : 'Pulsa el botón para empezar a grabar';
    const l = FOTOS.filter(f => f.album === 'Grabaciones').slice(0, 5);
    $('.grab-items', c).innerHTML = l.length ? '' : '<p class="grab-vacio">Todavía no has grabado nada.</p>';
    l.forEach(d => { const b = el('button', 'grab-item', `<span>●</span><span></span>`); b.lastChild.textContent = d.nombre; b.addEventListener('click', () => abrirApp('fotos', 'Grabaciones')); $('.grab-items', c).appendChild(b); });
  };
  c.addEventListener('click', e => {
    if (e.target.closest('.grab-boton')) {
      if (grabacion) pararGrabacion();
      else empezarGrabacion($(`input[value="ventana"]`, c).checked, $('.grab-sonido', c).checked);
    }
    if (e.target.closest('[data-a="fotos"]')) abrirApp('fotos', 'Grabaciones');
  });
  const v = abrirVentana({ app: 'grabadora', titulo: 'Grabadora', ancho: 640, alto: 440, contenido: c });
  v.api = { pintar };
  pintar();
}

/* =========================================================
   EXTRAS 3: logros y récords, Tienda, Chispa e inicio de los extras
   ========================================================= */

/* ---------- Récords de los juegos ---------- */
const RECORDS_JUEGOS = [
  { carpeta: 'serpiente', clave: 'serpiente.record', unidad: 'puntos', mayor: true },
  { carpeta: '2048', clave: '2048.record', unidad: 'puntos', mayor: true },
  { carpeta: 'aleteo', clave: 'aleteo.mejor', unidad: 'tuberías', mayor: true },
  { carpeta: 'memoria', clave: 'memoria.mejor', unidad: 'movimientos', mayor: false },
  { carpeta: 'buscaminas', clave: 'buscaminas.mejor.10', unidad: 's (principiante)', mayor: false },
  { carpeta: 'tienda-bloques', clave: 'bloques.record', unidad: 'puntos', mayor: true },
  { carpeta: 'tienda-pingpong', clave: 'pingpong.record', unidad: 'victorias', mayor: true },
  { carpeta: 'tienda-ladrillos', clave: 'ladrillos.record', unidad: 'puntos', mayor: true },
  { carpeta: 'tienda-saltarin', clave: 'saltarin.record', unidad: 'metros', mayor: true }
];
const rec = clave => { try { return +localStorage.getItem(clave) || 0; } catch (e) { return 0; } };
function puntuaciones() {
  const l = RECORDS_JUEGOS.map(r => {
    const j = juegoPorId(r.carpeta);
    return { carpeta: r.carpeta, nombre: j ? j.nombre : (TIENDA.find(t => 'tienda-' + t.id === r.carpeta) || {}).nombre || r.carpeta, valor: rec(r.clave), unidad: r.unidad, existe: !!j };
  }).filter(p => p.existe);
  Object.entries(AJ.records || {}).forEach(([carpeta, valor]) => {
    const j = juegoPorId(carpeta);
    if (j && !l.some(p => p.carpeta === carpeta)) l.push({ carpeta, nombre: j.nombre, valor, unidad: 'puntos', existe: true });
  });
  return l.sort((a, b) => (b.valor > 0) - (a.valor > 0));
}
/* Los juegos que subas pueden mandar sus puntos con: parent.postMessage({ bahiaPuntos: 120 }, '*') */
function guardarPuntosJuego(puntos, carpeta) {
  puntos = +puntos;
  if (!carpeta || !isFinite(puntos)) return;
  AJ.records = AJ.records || {};
  if (!(AJ.records[carpeta] >= puntos)) { AJ.records[carpeta] = puntos; guardarAj(); refrescarWidgets(); revisarLogros(); }
}
window.addEventListener('message', e => {
  const d = e.data;
  if (!d || typeof d !== 'object' || d.bahiaPuntos == null) return;
  const v = VENTANAS.find(x => x.app.startsWith('juego:') && $('iframe', x.el) && $('iframe', x.el).contentWindow === e.source);
  if (v) guardarPuntosJuego(d.bahiaPuntos, v.app.slice(6));
});

/* ---------- Logros ---------- */
const totalPartidas = () => Object.values(AJ.stats.partidas || {}).reduce((a, b) => a + b, 0);
const LOGROS = [
  { id: 'primera', nombre: 'Primera partida', desc: 'Juega a cualquier juego', ic: '🎮', ok: () => totalPartidas() >= 1 },
  { id: 'diez', nombre: 'Jugón', desc: 'Juega 10 partidas', ic: '🕹️', ok: () => totalPartidas() >= 10 },
  { id: 'cinco', nombre: 'Probador', desc: 'Juega a 5 juegos distintos', ic: '🧭', ok: () => Object.keys(AJ.stats.partidas || {}).length >= 5 },
  { id: 'serpiente', nombre: 'Serpiente larga', desc: 'Consigue 20 puntos en Serpiente', ic: '🐍', ok: () => rec('serpiente.record') >= 20 },
  { id: 'mil', nombre: 'Mil y pico', desc: 'Haz 1000 puntos en 2048', ic: '🔢', ok: () => rec('2048.record') >= 1000 },
  { id: 'piloto', nombre: 'Piloto', desc: 'Pasa 10 tuberías en Aleteo', ic: '🐤', ok: () => rec('aleteo.mejor') >= 10 },
  { id: 'elefante', nombre: 'Memoria de elefante', desc: 'Termina Memoria en 14 movimientos o menos', ic: '🃏', ok: () => { const m = rec('memoria.mejor'); return m > 0 && m <= 14; } },
  { id: 'minas', nombre: 'Artificiero', desc: 'Gana una partida de Buscaminas', ic: '💣', ok: () => ['10', '40', '99'].some(n => rec('buscaminas.mejor.' + n) > 0) },
  { id: 'tienda', nombre: 'De compras', desc: 'Instala un juego de la Tienda', ic: '🛍️', ok: () => (AJ.tienda || []).length >= 1 },
  { id: 'musica', nombre: 'Melómano', desc: 'Escucha 5 canciones en Música', ic: '🎵', ok: () => (AJ.stats.canciones || 0) >= 5 },
  { id: 'captura', nombre: 'Fotógrafo', desc: 'Haz una captura de pantalla', ic: '📸', ok: () => (AJ.stats.capturas || 0) >= 1 },
  { id: 'chispa', nombre: 'Amigo de Chispa', desc: 'Habla 5 veces con Chispa', ic: '✨', ok: () => (AJ.stats.chispa || 0) >= 5 },
  { id: 'explorador', nombre: 'Explorador', desc: 'Abre 8 apps distintas', ic: '🗺️', ok: () => Object.keys(AJ.stats.apps || {}).length >= 8 },
  { id: 'multitarea', nombre: 'Multitarea', desc: 'Ten ventanas en 2 escritorios a la vez', ic: '🪟', ok: () => new Set(VENTANAS.map(v => v.esc)).size >= 2 }
];
let revisando = false;
function revisarLogros() {
  if (revisando) return; revisando = true;
  try {
    AJ.logros = AJ.logros || {};
    const nuevos = LOGROS.filter(l => !AJ.logros[l.id] && (() => { try { return l.ok(); } catch (e) { return false; } })());
    if (nuevos.length) {
      nuevos.forEach(l => { AJ.logros[l.id] = Date.now(); });
      guardarAj();
      nuevos.forEach((l, i) => setTimeout(() => { notificar('¡Logro conseguido!', `${l.nombre}: ${l.desc}.`, medalla(l, true)); setTimeout(() => sonar('logro'), 120); }, i * 1200));
      VENTANAS.filter(v => v.app === 'logros' && v.api).forEach(v => v.api.pintar());
    }
  } finally { revisando = false; }
}
const medalla = (l, ok) => `<div class="medalla${ok ? '' : ' bloqueada'}"><span>${l.ic}</span></div>`;
function appLogros() {
  const ya = VENTANAS.find(x => x.app === 'logros' && x.api);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); return; }
  let pest = 'logros';
  const c = el('div', 'logros');
  const herr = el('div', 'v-herr', `<div class="segmento seg-texto"><button data-p="logros">Logros</button><button data-p="records">Récords</button></div>`);
  function pintar() {
    $$('[data-p]', herr).forEach(b => b.classList.toggle('activo', b.dataset.p === pest));
    if (pest === 'logros') {
      const hechos = LOGROS.filter(l => AJ.logros && AJ.logros[l.id]).length;
      c.innerHTML = `<div class="lg-cab"><div class="lg-anillo" style="--p:${hechos / LOGROS.length * 100}%"><b>${hechos}</b><small>de ${LOGROS.length}</small></div><div><h2>Tus logros</h2><p>Juega, explora BahíaOS y consigue todas las medallas.</p></div></div><div class="lg-rejilla"></div>`;
      LOGROS.forEach(l => {
        const ok = !!(AJ.logros && AJ.logros[l.id]);
        const d = el('div', 'lg-item' + (ok ? ' ok' : ''), `${medalla(l, ok)}<b></b><small></small>${ok ? `<i>${new Date(AJ.logros[l.id]).toLocaleDateString('es-ES')}</i>` : ''}`);
        $('b', d).textContent = l.nombre; $('small', d).textContent = l.desc;
        $('.lg-rejilla', c).appendChild(d);
      });
    } else {
      const l = puntuaciones();
      c.innerHTML = `<div class="lg-cab"><div><h2>Récords</h2><p>Tus mejores puntuaciones en cada juego. Los juegos que subas también pueden guardar sus récords aquí.</p></div></div><div class="lg-tabla"></div>`;
      l.forEach(p => {
        const j = juegoPorId(p.carpeta);
        const f = el('div', 'lg-fila', `<span class="img">${j ? iconoJuego(j) : ''}</span><span class="lg-n"></span><span class="lg-v"></span><button class="boton">Jugar</button>`);
        $('.lg-n', f).textContent = p.nombre;
        $('.lg-v', f).textContent = p.valor ? `${p.valor} ${p.unidad}` : 'Sin récord todavía';
        $('button', f).addEventListener('click', () => abrirJuego(p.carpeta));
        $('.lg-tabla', c).appendChild(f);
      });
      if (!l.length) $('.lg-tabla', c).innerHTML = '<p class="f-vacio">Juega a algún juego para ver aquí tus récords.</p>';
    }
  }
  herr.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (b) { pest = b.dataset.p; pintar(); } });
  const v = abrirVentana({ app: 'logros', titulo: 'Centro de juegos', ancho: 760, alto: 560, contenido: c, herramientas: herr });
  v.api = { pintar };
  revisarLogros(); pintar();
}

/* ---------- Tienda de juegos ---------- */
const TIENDA = Array.isArray(window.TIENDA) ? window.TIENDA : [];
const instalado = id => (AJ.tienda || []).includes(id);
function registrarTienda(t) {
  const carpeta = 'tienda-' + t.id;
  if (JUEGOS.some(j => j.carpeta === carpeta)) return;
  JUEGOS.push({ carpeta, ruta: 'tienda/' + t.id + '/index.html', nombre: t.nombre, icono: t.icono, color: t.color, ancho: t.ancho || 600, alto: t.alto || 600, descripcion: t.descripcion, tienda: true });
}
function instalarTienda(t, alAcabar) {
  if (instalado(t.id)) return;
  AJ.tienda = [...(AJ.tienda || []), t.id]; guardarAj();
  registrarTienda(t); refrescarJuegos(); revisarLogros();
  notificar('Juego instalado', `«${t.nombre}» ya está en la carpeta Juegos y en el Lanzador.`, iconoJuego(juegoPorId('tienda-' + t.id)));
  if (alAcabar) alAcabar();
}
function quitarTienda(t) {
  AJ.tienda = (AJ.tienda || []).filter(x => x !== t.id); guardarAj();
  const carpeta = 'tienda-' + t.id, i = JUEGOS.findIndex(j => j.carpeta === carpeta);
  if (i >= 0) JUEGOS.splice(i, 1);
  VENTANAS.filter(v => v.app === 'juego:' + carpeta).forEach(cerrar);
  refrescarJuegos();
}
function appTienda() {
  const ya = VENTANAS.find(x => x.app === 'tienda' && x.api);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); return; }
  const c = el('div', 'tienda');
  function pintar() {
    const dest = TIENDA[0];
    c.innerHTML = `${dest ? `<div class="ti-destacado" style="background:linear-gradient(120deg, ${dest.color[0]}, ${dest.color[1]})"><div><small>DESTACADO</small><h2></h2><p></p></div><span class="ti-dest-ic">${esc(dest.icono)}</span></div>` : ''}
      <h3 class="ti-t">Juegos gratis para BahíaOS</h3><div class="ti-rejilla"></div>`;
    if (dest) { $('.ti-destacado h2', c).textContent = dest.nombre; $('.ti-destacado p', c).textContent = dest.descripcion; }
    TIENDA.forEach(t => {
      const d = el('div', 'ti-item', `<span class="img">${iconoJuego(t)}</span><div class="ti-info"><b></b><small></small><span class="ti-cat"></span></div><button class="ti-boton"></button>`);
      $('b', d).textContent = t.nombre; $('small', d).textContent = t.descripcion; $('.ti-cat', d).textContent = t.categoria || 'Juegos';
      const b = $('.ti-boton', d);
      const estado = () => { b.textContent = instalado(t.id) ? 'ABRIR' : 'OBTENER'; b.classList.toggle('instalado', instalado(t.id)); };
      estado();
      b.addEventListener('click', () => {
        if (instalado(t.id)) { abrirJuego('tienda-' + t.id); return; }
        if (b.classList.contains('bajando')) return;
        b.classList.add('bajando'); b.textContent = '';
        setTimeout(() => instalarTienda(t, () => { b.classList.remove('bajando'); estado(); }), sinMovimiento() ? 0 : 1300);
      });
      d.addEventListener('contextmenu', e => { e.preventDefault(); if (instalado(t.id)) mostrarMenu([{ t: 'Abrir', a: () => abrirJuego('tienda-' + t.id) }, { sep: 1 }, { t: 'Desinstalar', a: () => { quitarTienda(t); pintar(); } }], e.clientX, e.clientY); });
      $('.ti-rejilla', c).appendChild(d);
    });
    if (!TIENDA.length) c.innerHTML = '<p class="f-vacio">La tienda está vacía.</p>';
  }
  const v = abrirVentana({ app: 'tienda', titulo: 'Tienda', ancho: 820, alto: 600, contenido: c });
  v.api = { pintar };
  pintar();
}

/* ---------- Chispa: el asistente de BahíaOS ---------- */
const CHISTES = [
  '¿Qué le dice un ratón de ordenador a otro? «Nos vemos en el clic».',
  '¿Por qué el ordenador fue al médico? Porque tenía un virus… ¡y no paraba de reiniciarse!',
  '¿Cuál es el colmo de un informático? Tener una ventana y no poder abrirla.',
  '¿Qué hace una serpiente en un ordenador? ¡Programar en Python!',
  'Mi Wi‑Fi y yo tenemos algo en común: los dos desaparecemos cuando más se nos necesita.',
  '¿Por qué el libro de matemáticas estaba triste? Porque tenía demasiados problemas.'
];
const vozDisponible = () => 'speechSynthesis' in window;
const oidoDisponible = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !ES_ANDROID;
function hablar(texto) {
  if (!AJ.chispaVoz || !vozDisponible()) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(texto.replace(/[«»*]/g, '')); u.lang = 'es-ES'; u.rate = 1.05; speechSynthesis.speak(u); } catch (e) {}
}
function buscarObjetivo(nombre) {
  const n = normal(nombre).replace(/^(el|la|los|las|un|una|app|aplicacion|juego)\s+/, '').trim();
  if (!n) return null;
  const apps = Object.keys(APPS).map(id => ({ id, nombre: id === 'archivos' ? 'Archivos' : nombreApp(id) }));
  const extra = { 'safari': 'navegador', 'internet': 'navegador', 'chrome': 'navegador', 'web': 'navegador', 'ajustes': 'ajustes', 'configuracion': 'ajustes', 'logros': 'logros', 'records': 'logros', 'centro de juegos': 'logros', 'tienda': 'tienda', 'app store': 'tienda', 'musica': 'musica', 'canciones': 'musica', 'fotos': 'fotos', 'capturas': 'fotos', 'grabadora': 'grabadora', 'finder': 'archivos', 'carpetas': 'archivos' };
  if (extra[n]) return { tipo: 'app', id: extra[n], nombre: nombreApp(extra[n]) };
  const a = apps.find(x => normal(x.nombre) === n) || apps.find(x => normal(x.nombre).includes(n) || n.includes(normal(x.nombre)));
  if (a) return { tipo: 'app', id: a.id, nombre: a.nombre };
  const j = JUEGOS.find(x => normal(x.nombre) === n) || JUEGOS.find(x => normal(x.nombre).includes(n) || n.includes(normal(x.nombre)));
  if (j) return { tipo: 'juego', id: j.carpeta, nombre: j.nombre };
  const t = TIENDA.find(x => normal(x.nombre).includes(n));
  if (t) return { tipo: 'tienda', t, nombre: t.nombre };
  return null;
}
function calcularPalabras(t) {
  const s = normal(t).replace(/cuanto es|calcula|cuanto son|\?|¿/g, '').replace(/\bmas\b/g, '+').replace(/\bmenos\b/g, '-').replace(/\b(por|x)\b/g, '*').replace(/\b(entre|dividido entre|dividido por)\b/g, '/').replace(/\belevado a\b/g, '^').trim();
  return calcular(s);
}
async function responderChispa(texto) {
  const t = normal(texto).replace(/[¿?¡!.,]/g, ' ').replace(/\s+/g, ' ').trim();
  let m;
  if (!t) return 'Dime algo y te ayudo. Por ejemplo: «abre Serpiente».';
  if (/^(hola|buenas|hey|ey|que tal)/.test(t)) return `¡Hola, ${AJ.usuario}! Soy Chispa. Puedo abrir apps y juegos, poner música, cambiar el fondo, decirte el tiempo y mucho más. Escribe «ayuda» para ver ejemplos.`;
  if (/ayuda|que puedes hacer|que sabes hacer|quien eres/.test(t)) return 'Soy Chispa, el asistente de BahíaOS. Prueba con:\n• «abre Serpiente» o «abre Música»\n• «pon música», «pausa», «siguiente canción»\n• «modo oscuro» o «modo claro»\n• «pon el fondo Aurora»\n• «¿qué tiempo hace?» o «¿qué hora es?»\n• «busca gatos en YouTube» o «busca dinosaurios»\n• «¿cuánto es 25 por 4?»\n• «haz una captura», «Mission Control», «escritorio 2»\n• «cuéntame un chiste»';
  if (/chiste|algo gracioso/.test(t)) return CHISTES[Math.floor(Math.random() * CHISTES.length)];
  if (/que hora/.test(t)) return `Son las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`;
  if (/que dia|que fecha|dia es hoy/.test(t)) return `Hoy es ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`;
  if (/tiempo hace|temperatura|va a llover|el tiempo/.test(t)) {
    const d = await cargarTiempo(true);
    if (!d) return `No he podido mirar el tiempo. Comprueba la conexión o la ciudad en Ajustes (ahora: ${AJ.ciudad}).`;
    const [desc] = TIEMPO_COD(d.cod);
    return `En ${d.lugar} hace ${d.temp}° y está ${desc.toLowerCase()}. Hoy, máxima de ${d.max}° y mínima de ${d.min}°.`;
  }
  if (/modo oscuro|tema oscuro|ponlo oscuro/.test(t)) { AJ.tema = 'oscuro'; guardarAj(); aplicarTema(); refrescarAjustes(); return 'Listo, modo oscuro activado.'; }
  if (/modo claro|tema claro|ponlo claro/.test(t)) { AJ.tema = 'claro'; guardarAj(); aplicarTema(); refrescarAjustes(); return 'Listo, modo claro activado.'; }
  if ((m = t.match(/fondo (?:de pantalla )?(?:de |a |el |la )?(\w+)/))) {
    const id = Object.keys(FONDOS).find(k => normal(FONDOS[k].nombre).startsWith(m[1]) || k === m[1]);
    if (id) { AJ.fondo = id; guardarAj(); aplicarFondo(); refrescarAjustes(); return `He puesto el fondo «${FONDOS[id].nombre}».`; }
    return `No conozco ese fondo. Tengo: ${Object.values(FONDOS).map(f => f.nombre).join(', ')}.`;
  }
  if (/pausa|para la musica|deten la musica|silencio/.test(t)) { audioMusica.pause(); return 'Música en pausa.'; }
  if (/siguiente cancion|otra cancion|siguiente/.test(t)) { if (!CANCIONES.length) return 'Todavía no tienes canciones. Ábrelas en Música con «Añadir canciones…».'; controlMusica('sig'); return `Ahora suena «${partesCancion(cancionActual()).titulo}».`; }
  if (/anterior/.test(t)) { if (!CANCIONES.length) return 'No hay canciones.'; controlMusica('ant'); return 'Vuelvo a la anterior.'; }
  if (/pon musica|reproduce|play|quiero musica|pon una cancion/.test(t)) {
    if (!CANCIONES.length) { abrirApp('musica'); return 'Todavía no hay canciones. Te abro Música para que añadas las tuyas.'; }
    if (idxMusica < 0) reproducirCancion(0); else audioMusica.play().catch(() => {});
    return `Suena «${partesCancion(cancionActual()).titulo}».`;
  }
  if ((m = t.match(/(?:busca|buscar|pon|quiero ver) (.+?) en youtube/)) || (m = t.match(/youtube (.+)/))) { abrirApp('youtube', m[1]); return `Buscando «${m[1]}» en YouTube.`; }
  if ((m = t.match(/(?:busca|buscar|que es|quien es|quien fue) (.+)/))) { abrirApp('navegador', 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(m[1])); return `Te busco «${m[1]}» en Google.`; }
  if (/cuanto es|calcula|cuanto son|\d+\s*(mas|menos|por|entre|[+\-*/x])\s*\d+/.test(t)) {
    const r = calcularPalabras(t);
    return r == null ? 'No he entendido la cuenta. Prueba con «¿cuánto es 12 por 7?».' : `Son ${r.toLocaleString('es-ES', { maximumFractionDigits: 6 })}.`;
  }
  if (/captura de la ventana/.test(t)) { setTimeout(() => hacerCaptura(true), 300); return 'Hago una captura de la ventana…'; }
  if (/captura|pantallazo/.test(t)) { setTimeout(() => hacerCaptura(false), 300); return 'Hago una captura de pantalla…'; }
  if (/graba/.test(t)) { abrirApp('grabadora'); return 'Te abro la Grabadora.'; }
  if (/mission control|todas las ventanas/.test(t)) { setTimeout(misionControl, 200); return 'Aquí tienes todas las ventanas.'; }
  if ((m = t.match(/escritorio (\d)/))) { const n = +m[1] - 1; if (n >= AJ.escritorios) { AJ.escritorios = Math.min(6, n + 1); guardarAj(); } cambiarEscritorio(n); return `Estás en el Escritorio ${n + 1}.`; }
  if (/nuevo escritorio/.test(t)) { if (AJ.escritorios >= 6) return 'Ya tienes 6 escritorios, que es el máximo.'; AJ.escritorios++; guardarAj(); cambiarEscritorio(AJ.escritorios - 1); return `He creado el Escritorio ${AJ.escritorios}.`; }
  if (/minimiza todo|esconde todo|ver el escritorio/.test(t)) { VENTANAS.filter(v => v.app !== 'chispa').forEach(minimizar); return 'Todo minimizado.'; }
  if (/cierra todo/.test(t)) { VENTANAS.filter(v => v.app !== 'chispa').slice().forEach(cerrar); return 'He cerrado todas las ventanas.'; }
  if (/bloquea/.test(t)) { setTimeout(bloquear, 600); return 'Bloqueando la pantalla…'; }
  if (/apaga/.test(t)) { setTimeout(apagar, 900); return '¡Hasta luego! Apagando…'; }
  if (/cuantos juegos/.test(t)) return `Tienes ${JUEGOS.length} juegos: ${JUEGOS.map(j => j.nombre).join(', ')}.`;
  if (/logro|medalla|record/.test(t)) { abrirApp('logros'); const n = Object.keys(AJ.logros || {}).length; return `Tienes ${n} de ${LOGROS.length} logros. Te abro el Centro de juegos.`; }
  if ((m = t.match(/^(?:abre|abrir|ejecuta|inicia|juega a|jugar a|quiero jugar a|pon)\s+(.+)/))) {
    const o = buscarObjetivo(m[1]);
    if (!o) return `No encuentro «${m[1]}». Escribe «cuántos juegos» para ver tus juegos.`;
    if (o.tipo === 'app') abrirApp(o.id);
    else if (o.tipo === 'juego') abrirJuego(o.id);
    else { instalarTienda(o.t); abrirJuego('tienda-' + o.t.id); return `He instalado «${o.nombre}» de la Tienda y lo abro.`; }
    return `Abriendo ${o.nombre}.`;
  }
  if (/gracias/.test(t)) return '¡De nada! Aquí estoy para lo que necesites.';
  return `No sé hacer eso todavía. Prueba con «ayuda», o te lo busco en Google: escribe «busca ${texto.trim().slice(0, 40)}».`;
}
function appChispa() {
  const ya = VENTANAS.find(x => x.app === 'chispa' && x.api);
  if (ya) { ya.min ? restaurar(ya) : enfocar(ya); setTimeout(() => ya.api.foco(), 50); return; }
  const c = el('div', 'chispa');
  c.innerHTML = `<div class="ch-log" aria-live="polite"></div>
    <form class="ch-form">${oidoDisponible() ? `<button type="button" class="ch-mic" aria-label="Hablar">🎤</button>` : ''}<input placeholder="Pregúntale algo a Chispa…" autocomplete="off" aria-label="Mensaje para Chispa"><button class="ch-enviar" aria-label="Enviar">↑</button></form>`;
  const herr = el('div', 'v-herr', `${vozDisponible() ? `<button class="h-boton ch-voz" title="Chispa habla en voz alta" aria-label="Voz">${SVG.altavoz}</button>` : ''}`);
  const log = $('.ch-log', c), inp = $('input', c);
  const burbuja = (texto, de) => {
    const b = el('div', 'ch-msg ' + de); b.textContent = texto;
    log.appendChild(b); log.scrollTop = log.scrollHeight; return b;
  };
  async function enviar(texto) {
    if (!texto.trim()) return;
    burbuja(texto, 'yo'); inp.value = '';
    const esp = burbuja('…', 'chispa escribiendo');
    AJ.stats.chispa = (AJ.stats.chispa || 0) + 1; guardarAj();
    const r = await responderChispa(texto);
    await new Promise(ok => setTimeout(ok, 250));
    esp.classList.remove('escribiendo'); esp.textContent = r; log.scrollTop = log.scrollHeight;
    hablar(r); revisarLogros();
  }
  $('form', c).addEventListener('submit', e => { e.preventDefault(); enviar(inp.value); });
  const mic = $('.ch-mic', c);
  if (mic) mic.addEventListener('click', () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition, r = new R();
    r.lang = 'es-ES'; r.interimResults = false; r.maxAlternatives = 1;
    mic.classList.add('oyendo');
    r.onresult = e => enviar(e.results[0][0].transcript);
    r.onend = () => mic.classList.remove('oyendo');
    r.onerror = () => { mic.classList.remove('oyendo'); burbuja('No he podido oírte. Comprueba que el micrófono está permitido.', 'chispa'); };
    try { r.start(); } catch (e) { mic.classList.remove('oyendo'); }
  });
  const voz = $('.ch-voz', herr);
  const pintarVoz = () => { if (voz) voz.classList.toggle('on', !!AJ.chispaVoz); };
  if (voz) voz.addEventListener('click', () => { AJ.chispaVoz = !AJ.chispaVoz; guardarAj(); pintarVoz(); if (!AJ.chispaVoz) speechSynthesis.cancel(); });
  pintarVoz();
  const v = abrirVentana({ app: 'chispa', titulo: 'Chispa', ancho: 420, alto: 560, contenido: c, herramientas: herr });
  v.api = { foco: () => inp.focus() };
  burbuja(`¡Hola, ${AJ.usuario}! Soy Chispa ✨ ¿En qué te ayudo? Escribe «ayuda» para ver lo que sé hacer.`, 'chispa');
  setTimeout(() => inp.focus(), 80);
}

/* ---------- Iconos y registro de las apps nuevas ---------- */
Object.assign(ICONOS, {
  musica: ['linear-gradient(180deg,#ff6b81,#e8173c)', `<svg viewBox="0 0 100 100"><path d="M40 28l34-8v40" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/><path d="M40 28v42" stroke="#fff" stroke-width="7"/><ellipse cx="32" cy="71" rx="10" ry="8" fill="#fff"/><ellipse cx="66" cy="61" rx="10" ry="8" fill="#fff"/></svg>`],
  fotos: ['linear-gradient(180deg,#5fd3ff,#2a7cf6)', `<svg viewBox="0 0 100 100"><rect x="18" y="24" width="64" height="52" rx="8" fill="#fff"/><circle cx="64" cy="40" r="6" fill="#ffcc33"/><path d="M24 70l16-18 12 12 8-8 16 14z" fill="#34c759"/></svg>`],
  logros: ['linear-gradient(180deg,#5b3cc4,#2b1a6b)', `<svg viewBox="0 0 100 100"><path d="M34 22h32v14a16 16 0 0 1-32 0z" fill="#ffd34d"/><path d="M34 26H22a10 10 0 0 0 12 14M66 26h12a10 10 0 0 1-12 14" fill="none" stroke="#ffd34d" stroke-width="5"/><rect x="45" y="50" width="10" height="12" fill="#f0b429"/><rect x="34" y="62" width="32" height="8" rx="3" fill="#ffd34d"/><rect x="30" y="70" width="40" height="8" rx="3" fill="#f0b429"/></svg>`],
  tienda: ['linear-gradient(180deg,#49b5ff,#0a5cff)', `<svg viewBox="0 0 100 100"><path d="M26 38h48l-4 38H30z" fill="#fff"/><path d="M38 40v-6a12 12 0 0 1 24 0v6" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="40" cy="48" r="3.5" fill="#0a5cff"/><circle cx="60" cy="48" r="3.5" fill="#0a5cff"/></svg>`],
  grabadora: ['linear-gradient(180deg,#4a4a50,#1c1c1f)', `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="26" fill="none" stroke="#fff" stroke-width="5"/><circle cx="50" cy="50" r="15" fill="#ff3b30"/></svg>`],
  chispa: ['linear-gradient(140deg,#ff9f0a,#ff375f 50%,#7d4cff)', `<svg viewBox="0 0 100 100"><path d="M50 16c3 20 14 31 34 34-20 3-31 14-34 34-3-20-14-31-34-34 20-3 31-14 34-34z" fill="#fff"/><path d="M76 18c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z" fill="#fff" opacity=".85"/></svg>`]
});
Object.assign(APPS, {
  musica: { nombre: 'Música', abrir: () => appMusica() },
  fotos: { nombre: 'Fotos', abrir: a => appFotos(a) },
  logros: { nombre: 'Centro de juegos', abrir: () => appLogros() },
  tienda: { nombre: 'Tienda', abrir: () => appTienda() },
  grabadora: { nombre: 'Grabadora', abrir: () => appGrabadora() },
  chispa: { nombre: 'Chispa', abrir: () => appChispa() }
});
DOCK_FIJO.splice(0, DOCK_FIJO.length, 'archivos', 'lanzador', 'navegador', 'youtube', 'musica', 'fotos', 'juegos', 'tienda', 'logros', 'chispa', 'notas', 'calendario', 'ajustes');

/* ---------- Aplicaciones propias (HTML + icono, fijas en el Dock) ---------- */
let MIS_APPS = [];
function iconoAPng(file) {
  return new Promise((ok, mal) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas'); cv.width = cv.height = 128;
      const k = Math.min(128 / img.width, 128 / img.height), w = img.width * k, h = img.height * k;
      const cx = cv.getContext('2d'); cx.imageSmoothingQuality = 'high';
      cx.drawImage(img, (128 - w) / 2, (128 - h) / 2, w, h);
      URL.revokeObjectURL(url); ok(cv.toDataURL('image/png'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('icono')); };
    img.src = url;
  });
}
function registrarMiApp(m) {
  const id = 'mi:' + m.id;
  APPS[id] = { nombre: m.nombre, abrir: () => abrirMiApp(m) };
  if (!DOCK_FIJO.includes(id)) DOCK_FIJO.push(id);
}
function abrirMiApp(m) {
  const id = 'mi:' + m.id;
  if (existente(id)) return;
  const f = el('iframe', 'marco-juego marco-app');
  const url = URL.createObjectURL(new Blob([m.html], { type: 'text/html' }));
  f.src = url; f.title = m.nombre;
  f.setAttribute('allow', 'fullscreen; autoplay; clipboard-write');
  f.addEventListener('load', () => {
    try { f.contentWindow.focus(); } catch (e) {}
    try { const st = f.contentDocument.createElement('style'); st.textContent = 'html,body{cursor:' + CURSOR_CSS + '}'; f.contentDocument.head.appendChild(st); } catch (e) {}
  });
  abrirVentana({ app: id, titulo: m.nombre, ancho: 900, alto: 620, contenido: f, alCerrar: () => setTimeout(() => URL.revokeObjectURL(url), 1000) });
}
function crearMiApp(datos) {
  const m = Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), fecha: Date.now() }, datos);
  return BD.poner(m, 'apps').then(() => {
    MIS_APPS.push(m); registrarMiApp(m); construirDock();
    notificar('Aplicación creada', `«${m.nombre}» ya está en el Dock y en el Lanzador.`, icono('mi:' + m.id));
    sonar('pop'); mostrarDock(); ocultarDockLuego(2500);
    const it = $(`.dock-item[data-app="${CSS.escape('mi:' + m.id)}"]`, dock);
    if (it && !sinMovimiento()) it.animate([{ transform: 'translateY(30px) scale(.3)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.2,1.4,.4,1)' });
  }).catch(() => notificar('No se pudo crear la aplicación', 'El archivo HTML es demasiado grande o no se puede leer.', icono('ajustes')));
}
function eliminarMiApp(idCorto) {
  const id = 'mi:' + idCorto;
  return BD.quitar(idCorto, 'apps').then(() => {
    VENTANAS.filter(v => v.app === id).forEach(cerrar);
    MIS_APPS = MIS_APPS.filter(m => m.id !== idCorto);
    delete APPS[id];
    const i = DOCK_FIJO.indexOf(id); if (i >= 0) DOCK_FIJO.splice(i, 1);
    construirDock(); refrescarAjustes();
  }).catch(() => {});
}
function cargarMisApps() {
  return BD.todos('apps').then(l => {
    MIS_APPS = (l || []).sort((a, b) => a.fecha - b.fecha);
    MIS_APPS.forEach(registrarMiApp);
    if (MIS_APPS.length) construirDock();
  }).catch(() => {});
}

/* ---------- Arranque de los extras ---------- */
function iniciarExtras() {
  listaUsuarios();
  const u = usuarioActual();
  if (u && u.nombre && USUARIO_ID !== 'principal') AJ.usuario = u.nombre;
  (AJ.tienda || []).forEach(id => { const t = TIENDA.find(x => x.id === id); if (t) registrarTienda(t); });
  aplicarCursor();
  prepararBloqueo();
  // Botones nuevos en la barra de menús
  const der = $('.mb-der');
  const bChispa = el('button', 'mb-item', `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2c.6 4 2.8 6.3 7 7-4.2.7-6.4 3-7 7-.6-4-2.8-6.3-7-7 4.2-.7 6.4-3 7-7z" fill="currentColor"/></svg>`);
  bChispa.id = 'mb-chispa'; bChispa.title = 'Chispa (Ctrl + Mayús + C)'; bChispa.setAttribute('aria-label', 'Chispa');
  bChispa.addEventListener('click', () => abrirApp('chispa'));
  const bMus = el('button', 'mb-item mb-musica', `<b aria-hidden="true">♪</b><span></span>`); bMus.id = 'mb-musica'; bMus.hidden = true;
  bMus.addEventListener('click', () => {
    const c = cancionActual(), r = bMus.getBoundingClientRect();
    mostrarMenu([{ t: c ? partesCancion(c).titulo : 'Música', off: true }, { sep: 1 }, { t: 'Anterior', a: () => controlMusica('ant') }, { t: audioMusica.paused ? 'Reproducir' : 'Pausa', a: () => controlMusica('play') }, { t: 'Siguiente', a: () => controlMusica('sig') }, { sep: 1 }, { t: 'Abrir Música', a: () => abrirApp('musica') }], r.left, ALTO_MENU + 3, bMus);
  });
  const bGrab = el('button', 'mb-item mb-grabando', `<i aria-hidden="true"></i><span></span>`); bGrab.id = 'mb-grabando'; bGrab.hidden = true; bGrab.title = 'Parar la grabación';
  bGrab.addEventListener('click', pararGrabacion);
  der.insertBefore(bGrab, der.firstChild);
  der.insertBefore(bMus, $('#mb-bateria'));
  der.insertBefore(bChispa, $('#mb-cc'));
  cc.addEventListener('input', e => { if (e.target.id === 'cc-volumen') audioMusica.volume = AJ.volumen / 100; });
  prepararDockAuto();
  pintarWidgets();
  setInterval(refrescarWidgets, 1000);
  setInterval(() => { if (AJ.fondo === 'dinamico') aplicarFondo(); }, 60000);
  setInterval(() => { if (VENTANAS.some(v => v.app.startsWith('juego:'))) { revisarLogros(); } }, 5000);
  cargarCanciones(); cargarFotos(); cargarMisApps();
}

/* =========================================================
   Inicio
   ========================================================= */
window.addEventListener('resize', () => VENTANAS.filter(v => v.max).forEach(v => {
  Object.assign(v.el.style, { width: (innerWidth - 12) + 'px', height: (innerHeight - ALTO_MENU - altoDock() - 8) + 'px' });
}));
new MutationObserver(() => { if (AJ.tema === 'auto') { aplicarTema(); } }).observe(raiz, { attributes: true, attributeFilter: ['data-theme'] });

aplicarTema();
iniciarExtras();
aplicarFondo();
pintarWifi();
construirDock();
pintarEscritorio();
actualizarMenuApp();
tic();
arrancar();

/* API pequeña por si un juego quiere hablar con el sistema */
/* Botón «Atrás» del móvil (versión Android) */
function atras() {
  if (mc) { salirMC(); return true; }
  if (!$('#lanzador').hidden) { cerrarLanzador(); return true; }
  if (menuAbierto || !$('#buscador').hidden || !$('#centro-control').hidden || !$('#centro-notif').hidden) { cerrarTodoFlotante(); return true; }
  if (activa) {
    if (activa.api && activa.api.atras && activa.api.atras()) return true;
    minimizar(activa); return true;
  }
  return false;
}
window.BahiaOS = { notificar, abrirJuego, abrirApp, atras, puntos: guardarPuntosJuego };
})();
