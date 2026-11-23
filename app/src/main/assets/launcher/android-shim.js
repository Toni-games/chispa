// Puente entre la pantalla del launcher y la app de Android (hace lo mismo que el de Windows)
(function () {
  let n = 0; const cbs = {}, evs = {};
  window.__cb = (id, ok, data) => { const c = cbs[id]; delete cbs[id]; if (c) ok ? c[0](data) : c[1](new Error(data)); };
  window.__ev = (e, d) => { (evs[e] || []).forEach(f => { try { f(d); } catch (x) { } }); };
  const call = (m, ...a) => new Promise((res, rej) => { const id = ++n; cbs[id] = [res, rej]; AndroidL.call(m, JSON.stringify(a), id); });
  window.Launcher = {
    manifest: () => call('manifest'), state: () => call('state'), setConf: (c) => call('setConf', c),
    install: (id, url) => call('install', id, url), uninstall: (id) => call('uninstall', id), play: (id) => call('play', id),
    openFolder: (w) => call('openFolder', w), open: (u) => call('open', u),
    on: (e, f) => { (evs[e] = evs[e] || []).push(f); return () => { evs[e] = evs[e].filter(x => x !== f); }; },
  };
})();
