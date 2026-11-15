// ============================================================
//  Picaterra Launcher
//  - Mira en internet la lista de versiones (versiones.json) y descarga sola la más nueva.
//  - Guarda cada versión en su carpeta y abre el juego en su propia ventana.
//  - Carpetas «musica» y «texturas»: lo que metas ahí lo usa el juego.
// ============================================================
const { app, BrowserWindow, protocol, net, shell, Menu, session, ipcMain } = require('electron');
const path = require('path'), fs = require('fs'); const { pathToFileURL } = require('url');
const AdmZip = require('adm-zip');

// ---- dónde está todo ----
const UI = path.join(__dirname, 'launcher'), LIB = path.join(__dirname, 'lib');
const DATA = app.getPath('userData');
const VERS = path.join(DATA, 'versiones');      // una carpeta por versión del juego
const MUSIC = path.join(DATA, 'musica');        // canciones del jugador
const TEXS = path.join(DATA, 'texturas');       // paquetes de texturas del jugador (.zip o .png)
const CONF = path.join(DATA, 'launcher.json'), CACHE = path.join(DATA, 'versiones.json');
for (const d of [VERS, MUSIC, TEXS]) fs.mkdirSync(d, { recursive: true });

// ---- de dónde se descargan las versiones (GitHub Pages del repositorio chispa) ----
const MANIFEST_URL = 'https://toni-games.github.io/chispa/picaterra/versiones.json';
const DL_PREFIX = 'https://toni-games.github.io/chispa/picaterra-versiones/';
// librerías que el juego pide a internet y que el launcher lleva dentro (para el multijugador)
const LIBS = { 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js': 'peerjs.min.js', 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js': 'peerjs.min.js' };
const AUDIO = /\.(mp3|ogg|wav|m4a|aac|flac|opus|webm)$/i, TEXFILE = /\.(zip|png)$/i;

protocol.registerSchemesAsPrivileged([{ scheme: 'picaterra', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } }]);
if (!app.requestSingleInstanceLock()) app.quit();

let win = null, game = null, current = null;
const safeId = (id) => /^[0-9]{1,3}(\.[0-9]{1,3}){0,3}$/.test(String(id || ''));
const cmpVer = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
function readConf() { try { return Object.assign({ auto: true, keepOpen: false, full: false }, JSON.parse(fs.readFileSync(CONF, 'utf8')) || {}); } catch (e) { return { auto: true, keepOpen: false, full: false }; } }
function writeConf(c) { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(CONF, JSON.stringify(c, null, 1)); }
function installed() { try { return fs.readdirSync(VERS).filter(d => safeId(d) && fs.existsSync(path.join(VERS, d, 'index.html'))).sort(cmpVer); } catch (e) { return []; } }
function serveFile(base, rel) {
  const f = path.normalize(path.join(base, rel));
  if (!f.startsWith(base + path.sep)) return new Response('No', { status: 403 });
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) return new Response('No encontrado', { status: 404 });
  return net.fetch(pathToFileURL(f).toString());
}
const listDir = (dir, re) => { try { return fs.readdirSync(dir).filter(f => re.test(f) && fs.statSync(path.join(dir, f)).isFile()); } catch (e) { return []; } };
const json = (o) => new Response(JSON.stringify(o), { headers: { 'content-type': 'application/json' } });
const show = () => { if (win) { if (win.isMinimized()) win.restore(); win.show(); win.focus(); } };
app.on('second-instance', () => { if (game && !game.isDestroyed()) game.focus(); else show(); });

function guard(wc) {
  wc.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  wc.on('will-navigate', (e, url) => { if (!url.startsWith('picaterra://')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); } });
}

app.whenReady().then(() => {
  protocol.handle('picaterra', (req) => {
    const u = new URL(req.url); let p = decodeURIComponent(u.pathname); if (!p || p === '/') p = '/index.html';
    if (p.startsWith('/__launcher/')) return serveFile(UI, p.slice(12));
    if (p.startsWith('/__lib/')) return serveFile(LIB, p.slice(7));
    // carpeta de música
    if (p === '/__musica/lista.json') return json(listDir(MUSIC, AUDIO).map(f => ({ file: f, name: f.replace(/\.[^.]+$/, '') })));
    if (p === '/__musica/abrir') { shell.openPath(MUSIC); return new Response(null, { status: 204 }); }
    if (p.startsWith('/__musica/')) return serveFile(MUSIC, p.slice(10));
    // carpeta de texturas
    if (p === '/__texturas/lista.json') return json(listDir(TEXS, TEXFILE).map(f => { const s = fs.statSync(path.join(TEXS, f)); return { file: f, size: s.size, mtime: Math.round(s.mtimeMs) }; }));
    if (p === '/__texturas/abrir') { shell.openPath(TEXS); return new Response(null, { status: 204 }); }
    if (p.startsWith('/__texturas/')) return serveFile(TEXS, p.slice(12));
    // el juego de la versión elegida
    if (!current) return new Response('Abre el juego desde el launcher', { status: 404 });
    return serveFile(path.join(VERS, current), p.slice(1));
  });
  session.defaultSession.webRequest.onBeforeRequest({ urls: Object.keys(LIBS) }, (d, cb) => { const l = LIBS[d.url]; cb(l && fs.existsSync(path.join(LIB, l)) ? { redirectURL: 'picaterra://app/__lib/' + l } : {}); });
  session.defaultSession.setUserAgent(session.defaultSession.getUserAgent() + ' PicaterraLauncher');
  Menu.setApplicationMenu(null);
  win = new BrowserWindow({
    width: 1100, height: 680, minWidth: 820, minHeight: 540, backgroundColor: '#14161c', title: 'Picaterra Launcher', icon: path.join(__dirname, 'icon.png'), show: false,
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.js') },
  });
  win.once('ready-to-show', () => win.show());
  win.loadURL('picaterra://app/__launcher/index.html'); guard(win.webContents);
  win.webContents.on('before-input-event', (e, i) => { if (i.type === 'keyDown' && i.key === 'F12' && i.control && i.shift) { win.webContents.toggleDevTools(); e.preventDefault(); } });
  win.on('close', () => { if (game && !game.isDestroyed()) game.close(); });
});
app.on('window-all-closed', () => app.quit());

// ---------- lo que pide la pantalla del launcher ----------
ipcMain.handle('manifest', async () => {
  try {
    const r = await net.fetch(MANIFEST_URL + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(); if (!j || !Array.isArray(j.versions)) throw new Error('formato');
    fs.writeFileSync(CACHE, JSON.stringify(j)); return { data: j, offline: false };
  } catch (e) {
    try { return { data: JSON.parse(fs.readFileSync(CACHE, 'utf8')), offline: true }; } catch (_) { return { data: null, offline: true, error: String(e.message || e) }; }
  }
});
ipcMain.handle('state', () => ({ installed: installed(), conf: readConf(), app: app.getVersion(), playing: game && !game.isDestroyed() ? current : null }));
ipcMain.handle('setConf', (e, c) => { const n = Object.assign(readConf(), c || {}); writeConf(n); return n; });
ipcMain.handle('install', async (e, id, url) => {
  if (!safeId(id) || typeof url !== 'string' || !url.startsWith(DL_PREFIX)) throw new Error('Descarga no válida');
  const send = (got, total) => { try { e.sender.send('progress', { id, got, total }); } catch (_) { } };
  const r = await net.fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error('No se ha podido descargar (HTTP ' + r.status + ')');
  const total = +r.headers.get('content-length') || 0; const reader = r.body.getReader(); const parts = []; let got = 0, last = 0;
  for (; ;) { const { done, value } = await reader.read(); if (done) break; parts.push(Buffer.from(value)); got += value.length; if (Date.now() - last > 120) { last = Date.now(); send(got, total); } }
  send(got, total || got);
  const zip = new AdmZip(Buffer.concat(parts));
  for (const en of zip.getEntries()) { const n = path.normalize(en.entryName); if (path.isAbsolute(n) || n.startsWith('..')) throw new Error('Paquete no válido'); }
  if (game && !game.isDestroyed() && current === id) throw new Error('Cierra el juego antes de reinstalar esta versión');
  const tmp = path.join(VERS, id + '.tmp'), dst = path.join(VERS, id);
  fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
  zip.extractAllTo(tmp, true); if (!fs.existsSync(path.join(tmp, 'index.html'))) throw new Error('Al paquete le falta el juego (index.html)');
  fs.rmSync(dst, { recursive: true, force: true }); fs.renameSync(tmp, dst); return installed();
});
ipcMain.handle('uninstall', (e, id) => {
  if (!safeId(id)) return installed();
  if (game && !game.isDestroyed() && current === id) throw new Error('Cierra el juego antes de borrar esta versión');
  fs.rmSync(path.join(VERS, id), { recursive: true, force: true }); return installed();
});
ipcMain.handle('openFolder', (e, which) => shell.openPath({ musica: MUSIC, texturas: TEXS }[which] || VERS));
ipcMain.handle('openExternal', (e, u) => { if (typeof u === 'string' && /^https:\/\//.test(u)) shell.openExternal(u); });
ipcMain.handle('play', (e, id) => {
  if (game && !game.isDestroyed()) { game.focus(); return current; }
  if (!safeId(id) || !installed().includes(id)) throw new Error('Esa versión no está instalada');
  current = id; const c = readConf(); writeConf(Object.assign(c, { last: id }));
  game = new BrowserWindow({
    width: 1280, height: 800, minWidth: 820, minHeight: 560, backgroundColor: '#11131a', title: 'Picaterra ' + id, icon: path.join(__dirname, 'icon.png'), show: false, autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  game.once('ready-to-show', () => { game.maximize(); if (c.full) game.setFullScreen(true); game.show(); if (!c.keepOpen && win) win.hide(); });
  game.loadURL('picaterra://app/index.html'); guard(game.webContents);
  game.webContents.on('page-title-updated', (ev) => ev.preventDefault());
  // F11: pantalla completa · Ctrl+Mayús+R: recargar (F5 es la cámara del juego, no se toca)
  game.webContents.on('before-input-event', (ev, i) => {
    if (i.type !== 'keyDown') return;
    if (i.key === 'F11') { game.setFullScreen(!game.isFullScreen()); ev.preventDefault(); }
    if (i.control && i.shift && (i.key === 'r' || i.key === 'R')) { game.reload(); ev.preventDefault(); }
  });
  // al cerrar la ventana, guardar el mundo antes
  let closing = false; const w = game;
  w.on('close', (ev) => {
    if (closing) return; ev.preventDefault(); closing = true;
    const end = () => { if (!w.isDestroyed()) w.destroy(); };
    w.webContents.executeJavaScript("(async()=>{try{if(typeof Game!=='undefined'&&Game.state==='play')await Game.save(true)}catch(e){}})()").catch(() => { }).finally(end);
    setTimeout(end, 4000);
  });
  game.on('closed', () => { game = null; show(); if (win) win.webContents.send('game-closed', id); });
  if (win) win.webContents.send('game-started', id); return id;
});
