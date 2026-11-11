package com.cubiverso.app;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;

/** Versión PRO (de pago): sin anuncios. La web solo necesita saber que es Pro. */
public final class Anuncios {
    private Anuncios() {}

    public static void iniciar(Activity a, FrameLayout r, WebView w) {
        w.addJavascriptInterface(new Puente(), "CubiAnuncios");
    }

    static final class Puente {
        @JavascriptInterface public boolean esPro() { return true; }
        @JavascriptInterface public boolean premioListo() { return false; }
        @JavascriptInterface public void banner(boolean ver) {}
        @JavascriptInterface public void intersticial() {}
        @JavascriptInterface public void verPremio() {}
    }
}
