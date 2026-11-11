// Cubiverso Launcher: elige la versión de Cubiverso, descárgala y juega con tu cuenta
const {app,BrowserWindow,protocol,net,shell,Menu,session,ipcMain}=require('electron');
const path=require('path'),fs=require('fs');const {pathToFileURL}=require('url');
const AdmZip=require('adm-zip');

const UI=path.join(__dirname,'launcher'),LIB=path.join(__dirname,'lib');
const DATA=app.getPath('userData'),VERS=path.join(DATA,'versiones'),CONF=path.join(DATA,'launcher.json'),CACHE=path.join(DATA,'versiones.json');
const MANIFEST_URL='https://toni-games.github.io/chispa/cubiverso/versiones.json';
const DL_PREFIX='https://toni-games.github.io/chispa/cubiverso-versiones/';
const LIBS={'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js':'three.min.js','https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js':'peerjs.min.js'};

protocol.registerSchemesAsPrivileged([{scheme:'cubiverso',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,corsEnabled:true}}]);
if(!app.requestSingleInstanceLock())app.quit();

let win=null,game=null,current=null;
const safeId=id=>/^[0-9]{1,3}(\.[0-9]{1,3}){0,3}$/.test(String(id||''));
function readConf(){try{return JSON.parse(fs.readFileSync(CONF,'utf8'))||{}}catch(e){return {}}}
function writeConf(c){fs.mkdirSync(DATA,{recursive:true});fs.writeFileSync(CONF,JSON.stringify(c,null,1))}
function installed(){try{return fs.readdirSync(VERS).filter(d=>safeId(d)&&fs.existsSync(path.join(VERS,d,'index.html')))}catch(e){return []}}
function serveFile(base,rel){const f=path.normalize(path.join(base,rel));
  if(!f.startsWith(base+path.sep))return new Response('No',{status:403});
  if(!fs.existsSync(f)||fs.statSync(f).isDirectory())return new Response('No encontrado',{status:404});
  return net.fetch(pathToFileURL(f).toString())}
const show=()=>{if(win){if(win.isMinimized())win.restore();win.show();win.focus()}};
app.on('second-instance',()=>{if(game&&!game.isDestroyed()){game.focus()}else show()});

function guard(wc){
  wc.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))shell.openExternal(url);return {action:'deny'}});
  wc.on('will-navigate',(e,url)=>{if(!url.startsWith('cubiverso://')){e.preventDefault();if(/^https?:/.test(url))shell.openExternal(url)}})}

app.whenReady().then(()=>{
  protocol.handle('cubiverso',req=>{const u=new URL(req.url);let p=decodeURIComponent(u.pathname);if(!p||p==='/')p='/index.html';
    if(p.startsWith('/__launcher/'))return serveFile(UI,p.slice(12));
    if(p.startsWith('/__lib/'))return serveFile(LIB,p.slice(7));
    // el launcher se encarga de las versiones: el juego no debe pedir que se actualice
    if(p==='/version.json')return new Response(JSON.stringify({android:{name:'999',code:1e9},windows:'999.0.0',launcher:true}),{headers:{'content-type':'application/json'}});
    if(!current)return new Response('Abre esta versión desde el launcher',{status:404});
    return serveFile(path.join(VERS,current),p.slice(1))});
  session.defaultSession.webRequest.onBeforeRequest({urls:Object.keys(LIBS)},(d,cb)=>{const l=LIBS[d.url];cb(l&&fs.existsSync(path.join(LIB,l))?{redirectURL:'cubiverso://app/__lib/'+l}:{})});
  session.defaultSession.setUserAgent(session.defaultSession.getUserAgent()+' CubiversoApp/Windows CubiversoLauncher');
  Menu.setApplicationMenu(null);
  win=new BrowserWindow({width:1180,height:720,minWidth:900,minHeight:580,backgroundColor:'#0d0f1a',title:'Cubiverso Launcher',icon:path.join(__dirname,'icon.png'),show:false,
    webPreferences:{contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.js')}});
  win.once('ready-to-show',()=>win.show());
  win.loadURL('cubiverso://app/__launcher/index.html');guard(win.webContents);
  win.webContents.on('before-input-event',(e,i)=>{if(i.type==='keyDown'&&i.key==='F12'&&i.control&&i.shift){win.webContents.toggleDevTools();e.preventDefault()}});
  win.on('close',()=>{if(game&&!game.isDestroyed())game.close()});
});
app.on('window-all-closed',()=>app.quit());

/* ---------- lo que pide la pantalla del launcher ---------- */
ipcMain.handle('manifest',async()=>{
  try{const r=await net.fetch(MANIFEST_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();
    if(!j||!Array.isArray(j.versions))throw new Error('formato');fs.mkdirSync(DATA,{recursive:true});fs.writeFileSync(CACHE,JSON.stringify(j));return {data:j,offline:false}}
  catch(e){try{return {data:JSON.parse(fs.readFileSync(CACHE,'utf8')),offline:true}}catch(_){return {data:null,offline:true,error:String(e.message||e)}}}});
ipcMain.handle('state',()=>({installed:installed(),conf:readConf(),app:app.getVersion(),playing:game&&!game.isDestroyed()?current:null,folder:VERS}));
ipcMain.handle('setConf',(e,c)=>{const n=Object.assign(readConf(),c||{});writeConf(n);return n});
ipcMain.handle('install',async(e,id,url)=>{
  if(!safeId(id)||typeof url!=='string'||!url.startsWith(DL_PREFIX))throw new Error('Descarga no válida');
  const send=(got,total)=>{try{e.sender.send('progress',{id,got,total})}catch(_){}};
  const r=await net.fetch(url);if(!r.ok)throw new Error('No se ha podido descargar (HTTP '+r.status+')');
  const total=+r.headers.get('content-length')||0;const reader=r.body.getReader();const parts=[];let got=0,last=0;
  for(;;){const {done,value}=await reader.read();if(done)break;parts.push(Buffer.from(value));got+=value.length;if(Date.now()-last>120){last=Date.now();send(got,total)}}
  send(got,total||got);
  const buf=Buffer.concat(parts);const zip=new AdmZip(buf);
  // comprobar que nada se sale de su carpeta
  for(const en of zip.getEntries()){const n=path.normalize(en.entryName);if(path.isAbsolute(n)||n.startsWith('..'))throw new Error('Paquete no válido')}
  const tmp=path.join(VERS,id+'.tmp'),dst=path.join(VERS,id);fs.rmSync(tmp,{recursive:true,force:true});fs.mkdirSync(tmp,{recursive:true});
  zip.extractAllTo(tmp,true);if(!fs.existsSync(path.join(tmp,'index.html')))throw new Error('Al paquete le falta el juego');
  if(game&&!game.isDestroyed()&&current===id)throw new Error('Cierra el juego antes de reinstalar esta versión');
  fs.rmSync(dst,{recursive:true,force:true});fs.renameSync(tmp,dst);return installed()});
ipcMain.handle('uninstall',(e,id)=>{if(!safeId(id))return installed();if(game&&!game.isDestroyed()&&current===id)throw new Error('Cierra el juego antes de borrar esta versión');
  fs.rmSync(path.join(VERS,id),{recursive:true,force:true});return installed()});
ipcMain.handle('openFolder',()=>{fs.mkdirSync(VERS,{recursive:true});return shell.openPath(VERS)});
ipcMain.handle('openExternal',(e,u)=>{if(typeof u==='string'&&/^https:\/\//.test(u))shell.openExternal(u)});
ipcMain.handle('play',(e,id)=>{
  if(game&&!game.isDestroyed()){game.focus();return current}
  if(!safeId(id)||!installed().includes(id))throw new Error('Esa versión no está instalada');
  current=id;const c=readConf();writeConf(Object.assign(c,{last:id}));
  game=new BrowserWindow({width:1280,height:800,minWidth:820,minHeight:560,backgroundColor:'#11131a',title:'Cubiverso '+id,icon:path.join(__dirname,'icon.png'),show:false,autoHideMenuBar:true,
    webPreferences:{contextIsolation:true,sandbox:true}});
  game.once('ready-to-show',()=>{game.maximize();if(c.full)game.setFullScreen(true);game.show();if(!c.keepOpen&&win)win.hide()});
  game.loadURL('cubiverso://app/index.html');guard(game.webContents);
  game.webContents.on('page-title-updated',ev=>{ev.preventDefault()});
  game.webContents.on('before-input-event',(ev,i)=>{if(i.type!=='keyDown')return;
    if(i.key==='F11'){game.setFullScreen(!game.isFullScreen());ev.preventDefault()}
    if(i.key==='F5'){game.reload();ev.preventDefault()}});
  game.on('close',()=>{try{game.webContents.executeJavaScript('window.CubiCuenta&&CubiCuenta.guardar()')}catch(_){}});
  game.on('closed',()=>{game=null;show();if(win)win.webContents.send('game-closed',id)});
  if(win)win.webContents.send('game-started',id);return id});
