package com.cubiverso.launcher;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Message;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Cubiverso Launcher para Android.
 * La pantalla del launcher (assets/launcher) deja elegir una versión de Cubiverso,
 * la descarga en la memoria de la app y la abre en la misma ventana.
 * Todo se sirve desde https://appassets.androidplatform.net/ para que la cuenta y
 * el progreso sean los mismos en todas las versiones.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String BASE = "https://" + HOST;
    private static final String PANTALLA = BASE + "/__launcher/index.html";
    private static final String MANIFEST_URL = "https://toni-games.github.io/chispa/cubiverso/versiones.json";
    private static final String DL_PREFIX = "https://toni-games.github.io/chispa/cubiverso-versiones/";
    private static final Pattern ID_OK = Pattern.compile("^[0-9]{1,3}(\\.[0-9]{1,3}){0,3}$");

    private static final Map<String, String> LIBS = new HashMap<>();
    static {
        LIBS.put("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "lib/three.min.js");
        LIBS.put("https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js", "lib/peerjs.min.js");
    }

    private static final Map<String, String> TIPOS = new HashMap<>();
    static {
        TIPOS.put("html", "text/html"); TIPOS.put("htm", "text/html");
        TIPOS.put("js", "application/javascript"); TIPOS.put("css", "text/css");
        TIPOS.put("json", "application/json"); TIPOS.put("txt", "text/plain"); TIPOS.put("md", "text/plain");
        TIPOS.put("png", "image/png"); TIPOS.put("jpg", "image/jpeg"); TIPOS.put("jpeg", "image/jpeg");
        TIPOS.put("gif", "image/gif"); TIPOS.put("svg", "image/svg+xml");
        TIPOS.put("webp", "image/webp"); TIPOS.put("ico", "image/x-icon");
        TIPOS.put("webmanifest", "application/manifest+json");
        TIPOS.put("mp3", "audio/mpeg"); TIPOS.put("ogg", "audio/ogg"); TIPOS.put("wav", "audio/wav");
        TIPOS.put("woff", "font/woff"); TIPOS.put("woff2", "font/woff2"); TIPOS.put("ttf", "font/ttf");
    }

    private WebView web;
    private FrameLayout raiz;
    private View vistaCompleta;
    private WebChromeClient.CustomViewCallback finVistaCompleta;
    private WebChromeClient cliente;
    private ValueCallback<Uri[]> eleccion;
    private static final int ELEGIR_ARCHIVO = 41;

    private final ExecutorService trabajo = Executors.newFixedThreadPool(2);
    private File versiones, conf, cache;
    /** Versión que se está jugando (null si se ve el launcher) */
    private volatile String actual = null;
    private volatile String descargando = null;

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        versiones = new File(getFilesDir(), "versiones");
        versiones.mkdirs();
        conf = new File(getFilesDir(), "launcher.json");
        cache = new File(getFilesDir(), "versiones.json");

        raiz = new FrameLayout(this);
        raiz.setBackgroundColor(Color.BLACK);
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0d0f1a"));
        raiz.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(raiz);
        pantallaCompleta();

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setAllowFileAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        s.setTextZoom(100);
        s.setSupportMultipleWindows(true);
        s.setUserAgentString(s.getUserAgentString() + " CubiversoApp/1.0 CubiversoLauncher");

        CookieManager.getInstance().setAcceptCookie(true);
        web.addJavascriptInterface(new Puente(), "LauncherNative");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView vista, WebResourceRequest peticion) {
                Uri u = peticion.getUrl();
                if (u == null) return null;
                String lib = LIBS.get(u.toString());
                if (lib != null) {
                    WebResourceResponse r = desdeAssets(lib);
                    if (r != null) return r;
                    return null; // sin copia incluida: se descarga de internet
                }
                if (!HOST.equals(u.getHost())) return null;
                return servir(u);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView vista, WebResourceRequest peticion) {
                Uri u = peticion.getUrl();
                if (peticion.isForMainFrame() && u != null && !HOST.equals(u.getHost())) {
                    abrirFuera(u);
                    return true;
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView vista, String url, android.graphics.Bitmap icono) {
                // Si se vuelve a la pantalla del launcher, ya no se está jugando
                if (url != null && url.startsWith(BASE + "/__launcher/")) actual = null;
            }
        });

        cliente = new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView vista, boolean dialogo, boolean gesto, Message resultado) {
                WebView temporal = new WebView(MainActivity.this);
                temporal.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView w, WebResourceRequest p) {
                        abrirFuera(p.getUrl());
                        w.destroy();
                        return true;
                    }
                });
                WebView.WebViewTransport transporte = (WebView.WebViewTransport) resultado.obj;
                transporte.setWebView(temporal);
                resultado.sendToTarget();
                return true;
            }

            @Override
            public void onShowCustomView(View vista, CustomViewCallback callback) {
                if (vistaCompleta != null) { callback.onCustomViewHidden(); return; }
                vistaCompleta = vista;
                finVistaCompleta = callback;
                raiz.addView(vista, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                web.setVisibility(View.GONE);
                pantallaCompleta();
            }

            @Override
            public void onHideCustomView() {
                if (vistaCompleta == null) return;
                raiz.removeView(vistaCompleta);
                vistaCompleta = null;
                web.setVisibility(View.VISIBLE);
                if (finVistaCompleta != null) finVistaCompleta.onCustomViewHidden();
                finVistaCompleta = null;
                pantallaCompleta();
            }

            @Override
            public boolean onShowFileChooser(WebView vista, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (eleccion != null) eleccion.onReceiveValue(null);
                eleccion = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                String[] tipos = params != null ? params.getAcceptTypes() : null;
                String tipo = "*/*";
                if (tipos != null) for (String t : tipos) if (t != null && t.contains("/")) { tipo = t; break; }
                i.setType(tipo);
                if (params != null && params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(i, "Elegir archivos"), ELEGIR_ARCHIVO);
                } catch (ActivityNotFoundException e) {
                    eleccion = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onPermissionRequest(PermissionRequest peticion) {
                peticion.deny();
            }
        };
        web.setWebChromeClient(cliente);

        // Siempre se empieza en la pantalla del launcher
        web.loadUrl(PANTALLA);
    }

    /* ---------- Servir archivos ---------- */
    private WebResourceResponse servir(Uri u) {
        String ruta = u.getPath();
        if (ruta == null || ruta.isEmpty() || ruta.equals("/")) ruta = "/index.html";
        if (ruta.endsWith("/")) ruta += "index.html";
        if (ruta.contains("..")) return respuesta("text/plain", new byte[0], 400, "Bad Request");

        if (ruta.startsWith("/__launcher/")) {
            WebResourceResponse r = desdeAssets("launcher/" + ruta.substring(12));
            return r != null ? r : noEncontrado();
        }
        if (ruta.startsWith("/__lib/")) {
            WebResourceResponse r = desdeAssets("lib/" + ruta.substring(7));
            return r != null ? r : noEncontrado();
        }
        // El launcher se encarga de las versiones: el juego no debe pedir que se actualice
        if (ruta.equals("/version.json")) {
            String j = "{\"android\":{\"name\":\"999\",\"code\":1000000000},\"windows\":\"999.0.0\",\"launcher\":true}";
            return respuesta("application/json", j.getBytes(StandardCharsets.UTF_8), 200, "OK");
        }
        // Sin service worker: si no, una versión podría quedarse con archivos de otra
        if (ruta.equals("/sw.js")) return noEncontrado();

        String id = actual;
        if (id == null) return respuesta("text/plain", "Abre esta versión desde el launcher".getBytes(StandardCharsets.UTF_8), 404, "Not Found");
        try {
            File base = new File(versiones, id).getCanonicalFile();
            File f = new File(base, ruta.substring(1)).getCanonicalFile();
            if (!f.getPath().startsWith(base.getPath() + File.separator)) return respuesta("text/plain", new byte[0], 403, "Forbidden");
            if (!f.isFile()) return noEncontrado();
            return respuesta(tipoDe(f.getName()), leerTodo(new FileInputStream(f)), 200, "OK");
        } catch (Exception e) {
            return noEncontrado();
        }
    }

    private WebResourceResponse desdeAssets(String recurso) {
        try {
            InputStream entrada = getAssets().open(recurso);
            return respuesta(tipoDe(recurso), leerTodo(entrada), 200, "OK");
        } catch (Exception e) {
            return null;
        }
    }

    private static WebResourceResponse noEncontrado() {
        return respuesta("text/plain", "No encontrado".getBytes(StandardCharsets.UTF_8), 404, "Not Found");
    }

    private static String tipoDe(String nombre) {
        int punto = nombre.lastIndexOf('.');
        String ext = punto >= 0 ? nombre.substring(punto + 1).toLowerCase(Locale.ROOT) : "";
        String tipo = TIPOS.get(ext);
        return tipo != null ? tipo : "application/octet-stream";
    }

    private static WebResourceResponse respuesta(String tipo, byte[] datos, int codigo, String razon) {
        Map<String, String> cabeceras = new HashMap<>();
        cabeceras.put("Access-Control-Allow-Origin", "*");
        cabeceras.put("Cache-Control", "no-store");
        boolean texto = tipo.startsWith("text/") || tipo.contains("javascript") || tipo.contains("json");
        return new WebResourceResponse(tipo, texto ? "utf-8" : null, codigo, razon, cabeceras, new ByteArrayInputStream(datos));
    }

    private static byte[] leerTodo(InputStream entrada) throws java.io.IOException {
        ByteArrayOutputStream salida = new ByteArrayOutputStream();
        byte[] buffer = new byte[16384];
        int n;
        while ((n = entrada.read(buffer)) > 0) salida.write(buffer, 0, n);
        entrada.close();
        return salida.toByteArray();
    }

    /* ---------- Lo que pide la pantalla del launcher ---------- */
    private class Puente {
        /** Llamada asíncrona: el resultado vuelve con window.__lres(id, ok, valor) */
        @JavascriptInterface
        public void call(final String idLlamada, final String metodo, final String argumentos) {
            trabajo.execute(() -> {
                try {
                    JSONArray a = new JSONArray(argumentos == null || argumentos.isEmpty() ? "[]" : argumentos);
                    String r = ejecutar(metodo, a);
                    devolver(idLlamada, true, r);
                } catch (Throwable e) {
                    String m = e.getMessage();
                    devolver(idLlamada, false, JSONObject.quote(m != null ? m : "Algo ha fallado"));
                }
            });
        }
    }

    private String ejecutar(String metodo, JSONArray a) throws Exception {
        switch (metodo) {
            case "manifest": return manifest();
            case "state": return estado();
            case "setConf": {
                JSONObject c = leerConf();
                JSONObject n = a.optJSONObject(0);
                if (n != null) for (Iterator<String> k = n.keys(); k.hasNext(); ) { String x = k.next(); c.put(x, n.get(x)); }
                escribir(conf, c.toString().getBytes(StandardCharsets.UTF_8));
                return c.toString();
            }
            case "install": return instalar(a.optString(0), a.optString(1));
            case "uninstall": {
                String id = a.optString(0);
                if (ID_OK.matcher(id).matches()) borrar(new File(versiones, id));
                return instaladas().toString();
            }
            case "play": {
                final String id = a.optString(0);
                if (!ID_OK.matcher(id).matches() || !new File(versiones, id + "/index.html").isFile())
                    throw new Exception("Esa versión no está instalada");
                JSONObject c = leerConf();
                c.put("last", id);
                escribir(conf, c.toString().getBytes(StandardCharsets.UTF_8));
                actual = id;
                web.postDelayed(() -> {
                    if (web == null) return;
                    web.clearCache(false);
                    web.loadUrl(BASE + "/index.html");
                }, 60);
                return JSONObject.quote(id);
            }
            case "open": {
                String u = a.optString(0);
                if (u.startsWith("https://")) runOnUiThread(() -> abrirFuera(Uri.parse(u)));
                return "null";
            }
            default: throw new Exception("Acción desconocida");
        }
    }

    private void devolver(String id, boolean ok, String valorJson) {
        final String js = "window.__lres&&window.__lres(" + JSONObject.quote(id) + "," + ok + "," + valorJson + ")";
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(js, null); });
    }

    private void evento(String nombre, String valorJson) {
        final String js = "window.__levt&&window.__levt(" + JSONObject.quote(nombre) + "," + valorJson + ")";
        runOnUiThread(() -> { if (web != null) web.evaluateJavascript(js, null); });
    }

    private String manifest() {
        try {
            byte[] datos = descargar(MANIFEST_URL + "?t=" + System.currentTimeMillis(), null, null);
            String txt = new String(datos, StandardCharsets.UTF_8);
            JSONObject j = new JSONObject(txt);
            if (j.optJSONArray("versions") == null) throw new Exception("formato");
            escribir(cache, datos);
            return "{\"data\":" + j.toString() + ",\"offline\":false}";
        } catch (Exception e) {
            try {
                JSONObject j = new JSONObject(new String(leerTodo(new FileInputStream(cache)), StandardCharsets.UTF_8));
                return "{\"data\":" + j.toString() + ",\"offline\":true}";
            } catch (Exception e2) {
                return "{\"data\":null,\"offline\":true}";
            }
        }
    }

    private String estado() throws Exception {
        JSONObject o = new JSONObject();
        o.put("installed", instaladas());
        o.put("conf", leerConf());
        String v = "1.0.0";
        try { v = getPackageManager().getPackageInfo(getPackageName(), 0).versionName; } catch (Exception ignorada) { }
        o.put("app", v);
        o.put("playing", JSONObject.NULL);
        o.put("folder", "");
        o.put("platform", "android");
        o.put("downloading", descargando != null ? descargando : JSONObject.NULL);
        return o.toString();
    }

    private JSONArray instaladas() {
        List<String> l = new ArrayList<>();
        File[] ds = versiones.listFiles();
        if (ds != null) for (File d : ds) {
            if (d.isDirectory() && ID_OK.matcher(d.getName()).matches() && new File(d, "index.html").isFile()) l.add(d.getName());
        }
        Collections.sort(l);
        return new JSONArray(l);
    }

    private JSONObject leerConf() {
        try {
            return new JSONObject(new String(leerTodo(new FileInputStream(conf)), StandardCharsets.UTF_8));
        } catch (Exception e) {
            return new JSONObject();
        }
    }

    private synchronized String instalar(final String id, String url) throws Exception {
        if (!ID_OK.matcher(id).matches() || url == null || !url.startsWith(DL_PREFIX)) throw new Exception("Descarga no válida");
        descargando = id;
        File zip = new File(getCacheDir(), id + ".zip");
        File tmp = new File(versiones, id + ".tmp");
        File dst = new File(versiones, id);
        try {
            final long[] ultimo = {0};
            descargar(url, zip, (got, total) -> {
                long ahora = System.currentTimeMillis();
                if (ahora - ultimo[0] < 150 && got < total) return;
                ultimo[0] = ahora;
                evento("progress", "{\"id\":" + JSONObject.quote(id) + ",\"got\":" + got + ",\"total\":" + total + "}");
            });
            borrar(tmp);
            tmp.mkdirs();
            String base = tmp.getCanonicalPath() + File.separator;
            ZipInputStream z = new ZipInputStream(new FileInputStream(zip));
            try {
                ZipEntry e;
                byte[] buffer = new byte[16384];
                while ((e = z.getNextEntry()) != null) {
                    File f = new File(tmp, e.getName());
                    // comprobar que nada se sale de su carpeta
                    if (!(f.getCanonicalPath() + (e.isDirectory() ? File.separator : "")).startsWith(base))
                        throw new Exception("Paquete no válido");
                    if (e.isDirectory()) { f.mkdirs(); continue; }
                    File p = f.getParentFile();
                    if (p != null) p.mkdirs();
                    OutputStream o = new FileOutputStream(f);
                    int n;
                    while ((n = z.read(buffer)) > 0) o.write(buffer, 0, n);
                    o.close();
                }
            } finally {
                z.close();
            }
            if (!new File(tmp, "index.html").isFile()) throw new Exception("Al paquete le falta el juego");
            borrar(dst);
            if (!tmp.renameTo(dst)) throw new Exception("No se ha podido guardar la versión");
            return instaladas().toString();
        } finally {
            descargando = null;
            zip.delete();
            borrar(tmp);
        }
    }

    private interface Progreso { void cambio(long got, long total); }

    /** Descarga una URL a un archivo (o a memoria si destino es null) */
    private static byte[] descargar(String url, File destino, Progreso progreso) throws Exception {
        String u = url;
        for (int saltos = 0; saltos < 5; saltos++) {
            HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
            c.setConnectTimeout(15000);
            c.setReadTimeout(30000);
            c.setUseCaches(false);
            c.setInstanceFollowRedirects(true);
            c.setRequestProperty("Cache-Control", "no-cache");
            int codigo = c.getResponseCode();
            if (codigo >= 300 && codigo < 400) {
                String l = c.getHeaderField("Location");
                c.disconnect();
                if (l == null || !l.startsWith("https://")) throw new Exception("Descarga no válida");
                u = l;
                continue;
            }
            if (codigo != 200) { c.disconnect(); throw new Exception("No se ha podido descargar (HTTP " + codigo + ")"); }
            long total = c.getContentLength();
            InputStream in = c.getInputStream();
            OutputStream out = destino != null ? new FileOutputStream(destino) : new ByteArrayOutputStream();
            try {
                byte[] buffer = new byte[32768];
                long got = 0;
                int n;
                while ((n = in.read(buffer)) > 0) {
                    out.write(buffer, 0, n);
                    got += n;
                    if (progreso != null) progreso.cambio(got, total > 0 ? total : 0);
                }
                if (progreso != null) progreso.cambio(got, total > 0 ? total : got);
            } finally {
                in.close();
                out.close();
                c.disconnect();
            }
            return destino != null ? null : ((ByteArrayOutputStream) out).toByteArray();
        }
        throw new Exception("Demasiadas redirecciones");
    }

    private static void escribir(File f, byte[] datos) throws Exception {
        File t = new File(f.getPath() + ".tmp");
        FileOutputStream o = new FileOutputStream(t);
        o.write(datos);
        o.close();
        if (!t.renameTo(f)) { f.delete(); if (!t.renameTo(f)) throw new Exception("No se ha podido guardar"); }
    }

    private static void borrar(File f) {
        if (f == null || !f.exists()) return;
        File[] hijos = f.listFiles();
        if (hijos != null) for (File h : hijos) borrar(h);
        f.delete();
    }

    @Override
    protected void onActivityResult(int codigo, int resultado, Intent datos) {
        if (codigo != ELEGIR_ARCHIVO) { super.onActivityResult(codigo, resultado, datos); return; }
        if (eleccion == null) return;
        Uri[] uris = null;
        if (resultado == RESULT_OK && datos != null) {
            if (datos.getClipData() != null) {
                int n = datos.getClipData().getItemCount();
                uris = new Uri[n];
                for (int k = 0; k < n; k++) uris[k] = datos.getClipData().getItemAt(k).getUri();
            } else if (datos.getData() != null) {
                uris = new Uri[]{datos.getData()};
            }
        }
        eleccion.onReceiveValue(uris);
        eleccion = null;
    }

    /* ---------- Utilidades ---------- */
    private void abrirFuera(Uri u) {
        if (u == null) return;
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u));
        } catch (ActivityNotFoundException ignorada) {
        }
    }

    @SuppressWarnings("deprecation")
    private void pantallaCompleta() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
    }

    @Override
    public void onWindowFocusChanged(boolean conFoco) {
        super.onWindowFocusChanged(conFoco);
        if (conFoco) pantallaCompleta();
    }

    /** Volver del juego al launcher (guardando antes la cuenta) */
    private void volverAlLauncher() {
        web.evaluateJavascript("window.CubiCuenta && CubiCuenta.guardar()", v -> {
            actual = null;
            web.loadUrl(PANTALLA);
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (vistaCompleta != null) {
            cliente.onHideCustomView();
            return;
        }
        if (actual != null) {
            // En el juego: primero cierra lo que tenga abierto; si no queda nada, vuelve al launcher
            web.evaluateJavascript("(window.Cubiverso && Cubiverso.atras) ? Cubiverso.atras() : false", valor -> {
                if (!"true".equals(valor)) volverAlLauncher();
            });
            return;
        }
        web.evaluateJavascript("(window.LauncherAtras) ? LauncherAtras() : false", valor -> {
            if (!"true".equals(valor)) moveTaskToBack(true);
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
        if (web != null) {
            web.evaluateJavascript("window.CubiAudio && CubiAudio.suspend && CubiAudio.suspend()", null);
            web.evaluateJavascript("window.CubiCuenta && CubiCuenta.guardar()", null);
            web.onPause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) {
            web.onResume();
            web.evaluateJavascript("window.CubiAudio && CubiAudio.resume && CubiAudio.resume()", null);
        }
    }

    @Override
    protected void onDestroy() {
        trabajo.shutdownNow();
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
