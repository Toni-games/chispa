package com.cubiverso.app;

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
import android.webkit.PermissionRequest;
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
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Cubiverso para Android.
 * Muestra Cubiverso (carpeta assets/cubiverso) en una WebView a pantalla completa.
 * Las páginas se sirven desde https://appassets.androidplatform.net/ para que
 * el guardado, los juegos y el multijugador funcionen como en la web.
 */
public class MainActivity extends Activity {

    private static final String HOST = "appassets.androidplatform.net";
    private static final String INICIO = "https://" + HOST + "/index.html";

    private WebView web;
    private FrameLayout raiz;
    private View vistaCompleta;
    private WebChromeClient.CustomViewCallback finVistaCompleta;
    private WebChromeClient cliente;

    private static final Map<String, String> TIPOS = new HashMap<>();
    static {
        TIPOS.put("html", "text/html"); TIPOS.put("htm", "text/html");
        TIPOS.put("js", "application/javascript"); TIPOS.put("css", "text/css");
        TIPOS.put("json", "application/json"); TIPOS.put("txt", "text/plain");
        TIPOS.put("png", "image/png"); TIPOS.put("jpg", "image/jpeg"); TIPOS.put("svg", "image/svg+xml");
        TIPOS.put("webp", "image/webp"); TIPOS.put("ico", "image/x-icon");
        TIPOS.put("mp3", "audio/mpeg"); TIPOS.put("ogg", "audio/ogg"); TIPOS.put("wav", "audio/wav");
        TIPOS.put("woff", "font/woff"); TIPOS.put("woff2", "font/woff2"); TIPOS.put("ttf", "font/ttf");
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
        web.setBackgroundColor(Color.parseColor("#111318"));
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
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setTextZoom(100);
        s.setSupportMultipleWindows(true);
        s.setUserAgentString(s.getUserAgentString() + " CubiversoApp/1.0");

        CookieManager.getInstance().setAcceptCookie(true);

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

            // Pantalla completa de los juegos (requestFullscreen)
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
            public void onPermissionRequest(PermissionRequest peticion) {
                peticion.deny();
            }
        };
        web.setWebChromeClient(cliente);

        if (estado != null) web.restoreState(estado);
        else web.loadUrl(INICIO);
    }

    /* ---------- Archivos de Cubiverso ---------- */
    private WebResourceResponse servir(Uri u) {
        String ruta = u.getPath();
        if (ruta == null || ruta.isEmpty()) ruta = "/";
        if (ruta.endsWith("/")) ruta += "index.html";
        if (ruta.contains("..")) return respuesta("text/plain", new byte[0], 400, "Bad Request");
        String recurso = "cubiverso" + ruta;
        try {
            InputStream entrada = getAssets().open(recurso);
            return respuesta(tipoDe(recurso), leerTodo(entrada), 200, "OK");
        } catch (Exception e) {
            return respuesta("text/plain", "No encontrado".getBytes(StandardCharsets.UTF_8), 404, "Not Found");
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
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (vistaCompleta != null) {
            cliente.onHideCustomView();
            return;
        }
        web.evaluateJavascript("(window.Cubiverso && Cubiverso.atras) ? Cubiverso.atras() : false", valor -> {
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
}
