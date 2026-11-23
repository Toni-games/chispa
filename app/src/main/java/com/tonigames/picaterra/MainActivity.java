package com.tonigames.picaterra;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.OpenableColumns;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

// Launcher de Picaterra para Android: descarga las versiones del juego, las guarda y las abre.
// El juego y el launcher se sirven desde https://picaterra.app/ (dentro de la app), así los mundos
// se comparten entre versiones y no se pierden al actualizar.
public class MainActivity extends Activity {
    static final String HOST = "picaterra.app";
    static final String BASE = "https://" + HOST + "/";
    static final String MANIFEST_URL = "https://toni-games.github.io/chispa/picaterra/versiones.json";
    static final String DL_PREFIX = "https://toni-games.github.io/chispa/picaterra-versiones/";
    static final int PICK_FILES = 7, PICK_INPUT = 8;

    WebView web;
    File vers, music, texs, cache, pend;
    String current = null;
    boolean inGame = false, crashed = false;
    long lastBack = 0;
    String pickTarget = null;
    ValueCallback<Uri[]> fileCb = null;
    final ExecutorService pool = Executors.newFixedThreadPool(2);
    final Handler ui = new Handler(Looper.getMainLooper());
    SharedPreferences prefs;

    @SuppressLint({"SetJavaScriptEnabled", "JavascriptInterface"})
    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        prefs = getSharedPreferences("launcher", MODE_PRIVATE);
        File data = getFilesDir();
        vers = new File(data, "versiones"); music = new File(data, "musica"); texs = new File(data, "texturas"); cache = new File(data, "versiones.json"); pend = new File(data, "pendientes");
        vers.mkdirs(); music.mkdirs(); texs.mkdirs(); pend.mkdirs();

        web = new WebView(this);
        web.setBackgroundColor(0xff14161c);
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setUserAgentString(s.getUserAgentString() + " PicaterraLauncher PicaterraAndroid");
        web.addJavascriptInterface(new Bridge(), "AndroidL");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                try { return serve(u); } catch (Exception e) { return text(404, "No encontrado"); }
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { }
                return true;
            }
            @Override
            public void onPageFinished(WebView v, String url) { inGame = url != null && !url.contains("/__launcher/"); prefs.edit().putBoolean("wasInGame", inGame).apply(); }
            @Override
            public boolean onRenderProcessGone(WebView v, android.webkit.RenderProcessGoneDetail d) {
                // el sistema cerró la página por falta de memoria: se crea otra en vez de cerrar la app
                crashed = true; ui.post(MainActivity.this::recreate);
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE); i.setType("*/*");
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, p.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try { startActivityForResult(Intent.createChooser(i, "Elegir archivo"), PICK_INPUT); } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
        });
        immersive();
        if (b != null && !b.getBoolean("crashed", false) && web.restoreState(b) != null) { } else web.loadUrl(BASE + (b != null && b.getBoolean("crashed", false) && prefs.getString("last", null) != null && prefs.getBoolean("wasInGame", false) ? "index.html" : "__launcher/index.html"));
    }

    @Override protected void onSaveInstanceState(Bundle b) { super.onSaveInstanceState(b); if (crashed) b.putBoolean("crashed", true); else web.saveState(b); }
    @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) immersive(); }
    @Override protected void onPause() { super.onPause(); if (inGame) saveGame(null); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }

    void immersive() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) { c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars()); c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE); }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
    }

    void saveGame(Runnable after) {
        web.evaluateJavascript("(async()=>{try{if(typeof Game!=='undefined'&&Game.state==='play')await Game.save(true)}catch(e){}})()", null);
        if (after != null) ui.postDelayed(after, 1200);
    }

    @Override
    public void onBackPressed() {
        if (inGame) {
            long now = System.currentTimeMillis();
            if (now - lastBack < 2000) { saveGame(() -> { inGame = false; web.loadUrl(BASE + "__launcher/index.html"); }); }
            else { lastBack = now; Toast.makeText(this, "Pulsa Atrás otra vez para guardar y volver al launcher", Toast.LENGTH_SHORT).show(); }
            return;
        }
        super.onBackPressed();
    }

    // ---------- archivos que pide el WebView ----------
    WebResourceResponse serve(Uri u) throws Exception {
        String p = u.getPath(); if (p == null || p.equals("/")) p = "/index.html";
        p = Uri.decode(p);
        if (p.contains("..")) return text(403, "No");
        if (p.startsWith("/__launcher/")) return stream(getAssets().open("launcher/" + p.substring(12)), p);
        if (p.equals("/__musica/lista.json")) { JSONArray a = new JSONArray(); for (String f : list(music, "(?i).*\\.(mp3|ogg|wav|m4a|aac|flac|opus|webm)$")) { JSONObject o = new JSONObject(); o.put("file", f); o.put("name", f.replaceAll("\\.[^.]+$", "")); a.put(o); } return json(a.toString()); }
        if (p.equals("/__musica/abrir")) { ui.post(() -> pick("musica")); return text(204, ""); }
        if (p.startsWith("/__musica/")) return file(new File(music, p.substring(10)));
        if (p.equals("/__texturas/lista.json")) { JSONArray a = new JSONArray(); for (String f : list(texs, "(?i).*\\.(zip|png)$")) { File ff = new File(texs, f); JSONObject o = new JSONObject(); o.put("file", f); o.put("size", ff.length()); o.put("mtime", ff.lastModified()); a.put(o); } return json(a.toString()); }
        if (p.equals("/__texturas/abrir")) { ui.post(() -> pick("texturas")); return text(204, ""); }
        if (p.startsWith("/__texturas/")) return file(new File(texs, p.substring(12)));
        if (p.equals("/__pendientes/lista.json")) { JSONArray a = new JSONArray(); for (String f : list(pend, ".*")) { JSONObject o = new JSONObject(); o.put("file", f); o.put("size", new File(pend, f).length()); a.put(o); } return json(a.toString()); }
        if (p.startsWith("/__pendientes/borrar/")) { new File(pend, p.substring(21)).delete(); return text(204, ""); }
        if (p.startsWith("/__pendientes/")) return file(new File(pend, p.substring(14)));
        if (current == null) current = prefs.getString("last", null);
        if (current == null) return text(404, "Abre el juego desde el launcher");
        return file(new File(new File(vers, current), p.substring(1)));
    }
    List<String> list(File dir, String re) { List<String> o = new ArrayList<>(); String[] fs = dir.list(); if (fs != null) { Arrays.sort(fs); for (String f : fs) if (f.matches(re) && new File(dir, f).isFile()) o.add(f); } return o; }
    WebResourceResponse file(File f) throws Exception { if (!f.isFile()) return text(404, "No encontrado"); return stream(new FileInputStream(f), f.getName()); }
    WebResourceResponse stream(InputStream in, String name) { WebResourceResponse r = new WebResourceResponse(mime(name), null, in); Map<String, String> h = new HashMap<>(); h.put("Access-Control-Allow-Origin", "*"); h.put("Cache-Control", "no-cache"); r.setResponseHeaders(h); return r; }
    WebResourceResponse json(String s) { return stream(new ByteArrayInputStream(s.getBytes(StandardCharsets.UTF_8)), "x.json"); }
    WebResourceResponse text(int code, String s) { WebResourceResponse r = new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(s.getBytes(StandardCharsets.UTF_8))); r.setStatusCodeAndReasonPhrase(code, code == 204 ? "No Content" : code == 403 ? "Forbidden" : "Not Found"); return r; }
    static String mime(String n) {
        String e = n.toLowerCase(); int i = e.lastIndexOf('.'); e = i >= 0 ? e.substring(i + 1) : "";
        switch (e) {
            case "html": return "text/html"; case "js": return "text/javascript"; case "css": return "text/css"; case "json": return "application/json";
            case "png": return "image/png"; case "jpg": case "jpeg": return "image/jpeg"; case "gif": return "image/gif"; case "webp": return "image/webp"; case "svg": return "image/svg+xml";
            case "mp3": return "audio/mpeg"; case "ogg": return "audio/ogg"; case "wav": return "audio/wav"; case "m4a": case "aac": return "audio/mp4"; case "flac": return "audio/flac"; case "opus": return "audio/ogg"; case "webm": return "audio/webm";
            case "zip": return "application/zip"; case "wasm": return "application/wasm"; default: return "application/octet-stream";
        }
    }

    // ---------- añadir canciones o texturas desde el móvil ----------
    void pick(String which) {
        pickTarget = which;
        Intent i = new Intent(Intent.ACTION_GET_CONTENT); i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType(which.equals("musica") ? "audio/*" : "*/*"); i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
        try { startActivityForResult(Intent.createChooser(i, which.equals("musica") ? "Añadir canciones" : "Añadir texturas (.zip o .png)"), PICK_FILES); } catch (Exception e) { }
    }
    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        super.onActivityResult(req, res, data);
        if (req == PICK_INPUT) {
            Uri[] out = null;
            if (res == RESULT_OK && data != null) {
                if (data.getClipData() != null) { int n = data.getClipData().getItemCount(); out = new Uri[n]; for (int k = 0; k < n; k++) out[k] = data.getClipData().getItemAt(k).getUri(); }
                else if (data.getData() != null) out = new Uri[]{data.getData()};
            }
            if (fileCb != null) { fileCb.onReceiveValue(out); fileCb = null; prefs.edit().putBoolean("picking", false).apply(); return; }
            // la página se recargó mientras elegías: los archivos se guardan y el juego los añade solo
            if (out != null) { final Uri[] us = out; pool.execute(() -> { int n = 0; for (Uri u : us) if (copyTo(u, pend)) n++; final int k = n; ui.post(() -> { Toast.makeText(this, k + (k == 1 ? " archivo recibido: " : " archivos recibidos: ") + "se añaden al abrir el juego", Toast.LENGTH_LONG).show(); web.evaluateJavascript("window.AndroidInbox&&AndroidInbox.check()", null); }); }); }
            return;
        }
        if (req != PICK_FILES || res != RESULT_OK || data == null || pickTarget == null) return;
        final File dir = pickTarget.equals("musica") ? music : texs;
        final List<Uri> us = new ArrayList<>();
        if (data.getClipData() != null) for (int k = 0; k < data.getClipData().getItemCount(); k++) us.add(data.getClipData().getItemAt(k).getUri());
        else if (data.getData() != null) us.add(data.getData());
        pool.execute(() -> {
            int ok = 0;
            for (Uri u : us) {
                if (copyTo(u, dir)) ok++;
            }
            final int n = ok;
            ui.post(() -> Toast.makeText(this, n + (n == 1 ? " archivo añadido" : " archivos añadidos") + (inGame ? ". Recarga el juego para usarlos." : "."), Toast.LENGTH_LONG).show());
        });
    }

    // copia un archivo elegido en el móvil a una carpeta de la app (con su nombre)
    boolean copyTo(Uri u, File dir) {
        String name = "archivo";
        try (Cursor c = getContentResolver().query(u, null, null, null, null)) { if (c != null && c.moveToFirst()) { int ix = c.getColumnIndex(OpenableColumns.DISPLAY_NAME); if (ix >= 0) name = c.getString(ix); } } catch (Exception e) { }
        name = name.replaceAll("[\\\\/:*?\"<>|]", "_");
        try (InputStream in = getContentResolver().openInputStream(u); OutputStream out = new FileOutputStream(new File(dir, name))) { copy(in, out, null); return true; } catch (Exception e) { return false; }
    }
    static void copy(InputStream in, OutputStream out, long[] count) throws Exception { byte[] buf = new byte[65536]; int r; while ((r = in.read(buf)) > 0) { out.write(buf, 0, r); if (count != null) count[0] += r; } }
    static void rm(File f) { if (f.isDirectory()) { File[] fs = f.listFiles(); if (fs != null) for (File c : fs) rm(c); } f.delete(); }
    static boolean safeId(String id) { return id != null && id.matches("[0-9A-Za-z._-]{1,40}") && !id.contains(".."); }
    JSONArray installed() { JSONArray a = new JSONArray(); String[] fs = vers.list(); if (fs != null) { Arrays.sort(fs); for (String f : fs) if (safeId(f) && !f.endsWith(".tmp") && new File(new File(vers, f), "index.html").isFile()) a.put(f); } return a; }
    JSONObject conf() { try { return new JSONObject(prefs.getString("conf", "{}")); } catch (Exception e) { return new JSONObject(); } }

    // ---------- lo que pide la pantalla del launcher ----------
    class Bridge {
        @JavascriptInterface
        public void call(final String m, final String args, final int id) {
            pool.execute(() -> {
                try {
                    JSONArray a = new JSONArray(args == null ? "[]" : args);
                    String r = run(m, a, id);
                    done(id, true, r);
                } catch (Exception e) { String msg = e.getMessage() == null ? e.toString() : e.getMessage(); done(id, false, JSONObject.quote(msg)); }
            });
        }
    }
    void done(int id, boolean ok, String json) { ui.post(() -> web.evaluateJavascript("window.__cb&&__cb(" + id + "," + ok + "," + (json == null ? "null" : json) + ")", null)); }
    void event(String ev, String json) { ui.post(() -> web.evaluateJavascript("window.__ev&&__ev(" + JSONObject.quote(ev) + "," + json + ")", null)); }

    String run(String m, JSONArray a, int id) throws Exception {
        switch (m) {
            case "manifest": {
                JSONObject o = new JSONObject();
                try {
                    HttpURLConnection c = (HttpURLConnection) new URL(MANIFEST_URL + "?t=" + System.currentTimeMillis()).openConnection();
                    c.setUseCaches(false); c.setConnectTimeout(12000); c.setReadTimeout(20000);
                    if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
                    java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream(); try (InputStream in = c.getInputStream()) { copy(in, bo, null); }
                    String s = bo.toString("UTF-8"); JSONObject j = new JSONObject(s);
                    try (OutputStream out = new FileOutputStream(cache)) { out.write(s.getBytes(StandardCharsets.UTF_8)); }
                    o.put("data", j); o.put("offline", false);
                } catch (Exception e) {
                    try { java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream(); try (InputStream in = new FileInputStream(cache)) { copy(in, bo, null); } o.put("data", new JSONObject(bo.toString("UTF-8"))); }
                    catch (Exception e2) { o.put("data", JSONObject.NULL); o.put("error", String.valueOf(e.getMessage())); }
                    o.put("offline", true);
                }
                return o.toString();
            }
            case "state": {
                JSONObject o = new JSONObject(); o.put("installed", installed()); o.put("conf", conf()); o.put("app", BuildConfig.VERSION_NAME); o.put("playing", JSONObject.NULL); return o.toString();
            }
            case "setConf": {
                JSONObject c = conf(); JSONObject n = a.optJSONObject(0); if (n != null) for (java.util.Iterator<String> it = n.keys(); it.hasNext(); ) { String k = it.next(); c.put(k, n.get(k)); }
                prefs.edit().putString("conf", c.toString()).apply(); return c.toString();
            }
            case "install": {
                String vid = a.getString(0), url = a.getString(1);
                if (!safeId(vid) || !url.startsWith(DL_PREFIX)) throw new Exception("Descarga no válida");
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection(); c.setUseCaches(false); c.setConnectTimeout(15000); c.setReadTimeout(30000);
                if (c.getResponseCode() != 200) throw new Exception("No se ha podido descargar (HTTP " + c.getResponseCode() + ")");
                final long total = c.getContentLengthLong();
                File zipf = new File(getCacheDir(), vid + ".zip");
                long[] got = {0}; long last = 0;
                try (InputStream in = c.getInputStream(); OutputStream out = new FileOutputStream(zipf)) {
                    byte[] buf = new byte[65536]; int r;
                    while ((r = in.read(buf)) > 0) { out.write(buf, 0, r); got[0] += r; long now = System.currentTimeMillis(); if (now - last > 150) { last = now; event("progress", "{\"id\":" + JSONObject.quote(vid) + ",\"got\":" + got[0] + ",\"total\":" + total + "}"); } }
                }
                event("progress", "{\"id\":" + JSONObject.quote(vid) + ",\"got\":" + got[0] + ",\"total\":" + (total > 0 ? total : got[0]) + "}");
                File tmp = new File(vers, vid + ".tmp"), dst = new File(vers, vid); rm(tmp); tmp.mkdirs();
                String root = tmp.getCanonicalPath() + File.separator;
                try (ZipInputStream z = new ZipInputStream(new FileInputStream(zipf))) {
                    ZipEntry e;
                    while ((e = z.getNextEntry()) != null) {
                        File f = new File(tmp, e.getName());
                        if (!f.getCanonicalPath().startsWith(root)) throw new Exception("Paquete no válido");
                        if (e.isDirectory()) { f.mkdirs(); continue; }
                        f.getParentFile().mkdirs(); try (OutputStream out = new FileOutputStream(f)) { copy(z, out, null); }
                    }
                }
                zipf.delete();
                if (!new File(tmp, "index.html").isFile()) { rm(tmp); throw new Exception("Al paquete le falta el juego (index.html)"); }
                rm(dst); if (!tmp.renameTo(dst)) throw new Exception("No se ha podido instalar");
                return installed().toString();
            }
            case "uninstall": { String vid = a.getString(0); if (safeId(vid)) rm(new File(vers, vid)); return installed().toString(); }
            case "play": {
                String vid = a.getString(0);
                if (!safeId(vid) || !new File(new File(vers, vid), "index.html").isFile()) throw new Exception("Esa versión no está instalada");
                current = vid; prefs.edit().putString("last", vid).apply();
                JSONObject c = conf(); c.put("last", vid); prefs.edit().putString("conf", c.toString()).apply();
                ui.post(() -> { inGame = true; web.loadUrl(BASE + "index.html"); });
                return JSONObject.quote(vid);
            }
            case "openFolder": { String w = a.optString(0, ""); if (w.equals("musica") || w.equals("texturas")) ui.post(() -> pick(w)); return "null"; }
            case "open": { String u = a.optString(0, ""); if (u.startsWith("https://")) ui.post(() -> { try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(u))); } catch (Exception e) { } }); return "null"; }
        }
        throw new Exception("Acción desconocida: " + m);
    }
}
