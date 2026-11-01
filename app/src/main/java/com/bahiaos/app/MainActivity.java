package com.bahiaos.app;

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
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * BahíaOS para Android.
 * Muestra BahíaOS (carpeta assets/bahia) en una WebView a pantalla completa.
 * Las páginas se sirven desde https://appassets.androidplatform.net/ para que
 * el reproductor de YouTube funcione, y /yt/buscar e /yt/info hacen lo mismo
 * que el servidor local de la versión de Windows.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String INICIO = "https://" + HOST + "/index.html";
    private static final int ELEGIR_ARCHIVO = 7;
    private static final String AGENTE = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

    private WebView web;
    private FrameLayout raiz;
    private ValueCallback<Uri[]> subida;
    private View vistaCompleta;
    private WebChromeClient.CustomViewCallback finVistaCompleta;
    private WebChromeClient cliente;

    private static final Map<String, String> TIPOS = new HashMap<>();
    static {
        TIPOS.put("html", "text/html"); TIPOS.put("htm", "text/html");
        TIPOS.put("js", "application/javascript"); TIPOS.put("mjs", "application/javascript");
        TIPOS.put("css", "text/css"); TIPOS.put("json", "application/json"); TIPOS.put("txt", "text/plain");
        TIPOS.put("png", "image/png"); TIPOS.put("jpg", "image/jpeg"); TIPOS.put("jpeg", "image/jpeg");
        TIPOS.put("gif", "image/gif"); TIPOS.put("svg", "image/svg+xml"); TIPOS.put("webp", "image/webp");
        TIPOS.put("ico", "image/x-icon"); TIPOS.put("mp3", "audio/mpeg"); TIPOS.put("wav", "audio/wav");
        TIPOS.put("ogg", "audio/ogg"); TIPOS.put("m4a", "audio/mp4"); TIPOS.put("mp4", "video/mp4");
        TIPOS.put("webm", "video/webm"); TIPOS.put("woff", "font/woff"); TIPOS.put("woff2", "font/woff2");
        TIPOS.put("ttf", "font/ttf"); TIPOS.put("wasm", "application/wasm"); TIPOS.put("xml", "application/xml");
    }

    @Override
    protected void onCreate(Bundle estado) {
        super.onCreate(estado);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        raiz = new FrameLayout(this);
        raiz.setBackgroundColor(Color.BLACK);
        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
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
        s.setAllowContentAccess(true);
        s.setSupportMultipleWindows(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setTextZoom(100);
        s.setUserAgentString(s.getUserAgentString() + " BahiaOSApp/1.0");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);

        web.addJavascriptInterface(new Puente(), "AndroidBahia");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView vista, WebResourceRequest peticion) {
                Uri u = peticion.getUrl();
                if (u == null || !HOST.equals(u.getHost())) return null;
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
        });

        cliente = new WebChromeClient() {
            // window.open(...) → se abre en el navegador del móvil
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

            // «Subir juego…» → selector de archivos del móvil
            @Override
            public boolean onShowFileChooser(WebView vista, ValueCallback<Uri[]> callback, FileChooserParams parametros) {
                if (subida != null) subida.onReceiveValue(null);
                subida = callback;
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                // Tipos que pide BahíaOS: juegos HTML, música, fotos o vídeos
                java.util.ArrayList<String> tipos = new java.util.ArrayList<>();
                String[] pedidos = parametros.getAcceptTypes();
                if (pedidos != null) for (String grupo : pedidos) for (String t : grupo.split(",")) {
                    t = t.trim().toLowerCase(Locale.ROOT);
                    if (t.isEmpty()) continue;
                    if (t.equals(".html") || t.equals(".htm") || t.equals("text/html")) { tipos.add("text/html"); tipos.add("application/xhtml+xml"); tipos.add("application/octet-stream"); }
                    else if (t.contains("/")) tipos.add(t);
                    else if (t.equals(".mp3") || t.equals(".m4a") || t.equals(".wav") || t.equals(".ogg")) tipos.add("audio/*");
                }
                if (!tipos.isEmpty()) intent.putExtra(Intent.EXTRA_MIME_TYPES, new java.util.LinkedHashSet<>(tipos).toArray(new String[0]));
                if (parametros.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE) intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                try {
                    startActivityForResult(Intent.createChooser(intent, "Elige un juego HTML"), ELEGIR_ARCHIVO);
                } catch (ActivityNotFoundException e) {
                    subida = null;
                    return false;
                }
                return true;
            }

            // Vídeos de YouTube a pantalla completa
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
        };
        web.setWebChromeClient(cliente);

        if (estado != null) web.restoreState(estado);
        else web.loadUrl(INICIO);
    }

    /* ---------- Archivos de BahíaOS y búsquedas de YouTube ---------- */
    private WebResourceResponse servir(Uri u) {
        String ruta = u.getPath();
        if (ruta == null || ruta.isEmpty()) ruta = "/";
        try {
            if ("/yt/buscar".equals(ruta)) {
                String q = u.getQueryParameter("q");
                if (q == null) q = "";
                String html = descargar("https://www.youtube.com/results?hl=es&gl=ES&search_query=" + URLEncoder.encode(q, "UTF-8"));
                return respuesta("text/plain", html.getBytes(StandardCharsets.UTF_8), 200, "OK");
            }
            if ("/yt/info".equals(ruta)) {
                String id = u.getQueryParameter("id");
                if (id == null) id = "";
                String json = descargar("https://www.youtube.com/oembed?format=json&url=" + URLEncoder.encode("https://www.youtube.com/watch?v=" + id, "UTF-8"));
                return respuesta("application/json", json.getBytes(StandardCharsets.UTF_8), 200, "OK");
            }
        } catch (Exception e) {
            return respuesta("text/plain", "No se pudo conectar con YouTube".getBytes(StandardCharsets.UTF_8), 502, "Bad Gateway");
        }

        if (ruta.endsWith("/")) ruta += "index.html";
        if (ruta.contains("..")) return respuesta("text/plain", new byte[0], 400, "Bad Request");
        String recurso = "bahia" + ruta;
        try {
            InputStream entrada = getAssets().open(recurso);
            return respuesta(tipoDe(recurso), leerTodo(entrada), 200, "OK");
        } catch (Exception e) {
            try {
                InputStream entrada = getAssets().open(recurso + "/index.html");
                return respuesta("text/html", leerTodo(entrada), 200, "OK");
            } catch (Exception e2) {
                return respuesta("text/plain", "No encontrado".getBytes(StandardCharsets.UTF_8), 404, "Not Found");
            }
        }
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
        cabeceras.put("Cache-Control", "no-cache");
        boolean texto = tipo.startsWith("text/") || tipo.contains("javascript") || tipo.contains("json") || tipo.contains("xml");
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

    private static String descargar(String direccion) throws java.io.IOException {
        HttpURLConnection con = (HttpURLConnection) new URL(direccion).openConnection();
        con.setConnectTimeout(15000);
        con.setReadTimeout(20000);
        con.setRequestProperty("User-Agent", AGENTE);
        con.setRequestProperty("Accept-Language", "es-ES,es;q=0.9");
        con.setRequestProperty("Cookie", "SOCS=CAI; CONSENT=YES+cb.20240101-00-p0.es+FX+000");
        con.setInstanceFollowRedirects(true);
        try {
            return new String(leerTodo(con.getInputStream()), StandardCharsets.UTF_8);
        } finally {
            con.disconnect();
        }
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

    @Override
    protected void onActivityResult(int codigo, int resultado, Intent datos) {
        if (codigo == ELEGIR_ARCHIVO && subida != null) {
            Uri[] elegidos = null;
            if (resultado == RESULT_OK && datos != null) {
                if (datos.getClipData() != null) {
                    int n = datos.getClipData().getItemCount();
                    elegidos = new Uri[n];
                    for (int i = 0; i < n; i++) elegidos[i] = datos.getClipData().getItemAt(i).getUri();
                } else if (datos.getData() != null) {
                    elegidos = new Uri[]{datos.getData()};
                }
            }
            subida.onReceiveValue(elegidos);
            subida = null;
            return;
        }
        super.onActivityResult(codigo, resultado, datos);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (vistaCompleta != null) {
            cliente.onHideCustomView();
            return;
        }
        web.evaluateJavascript("(window.BahiaOS && BahiaOS.atras) ? BahiaOS.atras() : false", valor -> {
            if (!"true".equals(valor)) moveTaskToBack(true);
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle estado) {
        super.onSaveInstanceState(estado);
        web.saveState(estado);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    /** Funciones que BahíaOS puede llamar desde JavaScript (AndroidBahia.xxx). */
    private class Puente {
        @JavascriptInterface
        public void salir() {
            runOnUiThread(MainActivity.this::finishAndRemoveTask);
        }
    }
}
