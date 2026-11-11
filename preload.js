// Puente entre la pantalla del launcher y el programa (solo para el launcher, no para el juego)
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('Launcher',{
  manifest:()=>ipcRenderer.invoke('manifest'),
  state:()=>ipcRenderer.invoke('state'),
  setConf:c=>ipcRenderer.invoke('setConf',c),
  install:(id,url)=>ipcRenderer.invoke('install',id,url),
  uninstall:id=>ipcRenderer.invoke('uninstall',id),
  play:id=>ipcRenderer.invoke('play',id),
  openFolder:()=>ipcRenderer.invoke('openFolder'),
  open:u=>ipcRenderer.invoke('openExternal',u),
  on:(ev,f)=>{if(!['progress','game-started','game-closed'].includes(ev))return()=>{};const h=(e,...a)=>f(...a);ipcRenderer.on(ev,h);return()=>ipcRenderer.removeListener(ev,h)}
});
