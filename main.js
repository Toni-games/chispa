// Cubiverso para Windows
const {app,BrowserWindow,protocol,net,shell,Menu,session}=require('electron');
const path=require('path');const {pathToFileURL}=require('url');
const WEB=path.join(__dirname,'web');
protocol.registerSchemesAsPrivileged([{scheme:'cubiverso',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true,corsEnabled:true}}]);
if(!app.requestSingleInstanceLock())app.quit();
let win=null;
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus()}});
// librerías incluidas en la app: el 3D funciona sin internet
const LIBS={'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js':'lib/three.min.js','https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js':'lib/peerjs.min.js'};
app.whenReady().then(()=>{
  protocol.handle('cubiverso',req=>{let p=decodeURIComponent(new URL(req.url).pathname);if(!p||p==='/')p='/index.html';
    const f=path.normalize(path.join(WEB,p));if(!f.startsWith(WEB))return new Response('No',{status:403});return net.fetch(pathToFileURL(f).toString())});
  session.defaultSession.webRequest.onBeforeRequest({urls:Object.keys(LIBS)},(d,cb)=>{const l=LIBS[d.url];cb(l?{redirectURL:'cubiverso://app/'+l}:{})});
  session.defaultSession.setUserAgent(session.defaultSession.getUserAgent()+' CubiversoApp/Windows');
  Menu.setApplicationMenu(null);
  win=new BrowserWindow({width:1280,height:800,minWidth:820,minHeight:560,backgroundColor:'#11131a',title:'Cubiverso',icon:path.join(__dirname,'icon.png'),autoHideMenuBar:true,show:false,
    webPreferences:{contextIsolation:true,sandbox:true}});
  win.once('ready-to-show',()=>{win.maximize();win.show()});
  win.loadURL('cubiverso://app/index.html');
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https?:/.test(url))shell.openExternal(url);return {action:'deny'}});
  win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('cubiverso://')){e.preventDefault();if(/^https?:/.test(url))shell.openExternal(url)}});
  win.webContents.on('before-input-event',(e,i)=>{if(i.type!=='keyDown')return;
    if(i.key==='F11'){win.setFullScreen(!win.isFullScreen());e.preventDefault()}
    if(i.key==='F5'){win.reload();e.preventDefault()}
    if(i.key==='F12'&&i.control&&i.shift){win.webContents.toggleDevTools();e.preventDefault()}});
  win.on('close',()=>{try{win.webContents.executeJavaScript('window.CubiCuenta&&CubiCuenta.guardar()')}catch(e){}});
});
app.on('window-all-closed',()=>app.quit());
