// Puente entre la pantalla del launcher y el programa (solo para el launcher, no para el juego)
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('Launcher', {
  manifest: () => ipcRenderer.invoke('manifest'),            // lista de versiones publicadas
  state: () => ipcRenderer.invoke('state'),                  // versiones instaladas, ajustes, versión del launcher
  setConf: (c) => ipcRenderer.invoke('setConf', c),          // guardar ajustes
  install: (id, url) => ipcRenderer.invoke('install', id, url),
  uninstall: (id) => ipcRenderer.invoke('uninstall', id),
  play: (id) => ipcRenderer.invoke('play', id),
  openFolder: (which) => ipcRenderer.invoke('openFolder', which), // 'versiones' | 'musica' | 'texturas'
  open: (url) => ipcRenderer.invoke('openExternal', url),
  on: (ev, f) => {
    if (!['progress', 'game-started', 'game-closed'].includes(ev)) return () => { };
    const h = (e, ...a) => f(...a); ipcRenderer.on(ev, h); return () => ipcRenderer.removeListener(ev, h);
  },
});
