package com.cubiverso.app;

import android.app.Activity;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

import java.util.Collections;

/**
 * Versión GRATIS: anuncios de Google AdMob.
 * - Un banner abajo en los menús (se esconde mientras juegas).
 * - Un anuncio a pantalla completa de vez en cuando al salir de un juego.
 * - Anuncios con premio: si el jugador quiere, ve un anuncio y gana Cubos.
 * Los identificadores de abajo son los de PRUEBA de Google. Para ganar dinero hay que poner los tuyos.
 * Como Cubiverso lo usan niños, se piden anuncios aptos para menores (contenido G, sin personalizar).
 */
public final class Anuncios {
    // ---- Cambia estos tres por los tuyos de AdMob (AdMob → Bloques de anuncios) ----
    private static final String BANNER = "ca-app-pub-3940256099942544/6300978111";
    private static final String PANTALLA_COMPLETA = "ca-app-pub-3940256099942544/1033173712";
    private static final String CON_PREMIO = "ca-app-pub-3940256099942544/5224354917";

    private static Activity act;
    private static WebView web;
    private static FrameLayout raiz;
    private static AdView banner;
    private static InterstitialAd intersticial;
    private static RewardedAd premio;
    private static boolean listo = false;
    private static boolean quiereBanner = true;

    private Anuncios() {}

    public static void iniciar(Activity a, FrameLayout r, WebView w) {
        act = a; raiz = r; web = w;
        web.addJavascriptInterface(new Puente(), "CubiAnuncios");
        RequestConfiguration conf = new RequestConfiguration.Builder()
                .setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
                .setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE)
                .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G)
                .setTestDeviceIds(Collections.emptyList())
                .build();
        MobileAds.setRequestConfiguration(conf);
        new Thread(() -> MobileAds.initialize(a, estado -> act.runOnUiThread(() -> {
            listo = true;
            crearBanner();
            cargarIntersticial();
            cargarPremio();
        }))).start();
    }

    private static AdRequest peticion() { return new AdRequest.Builder().build(); }

    private static void crearBanner() {
        banner = new AdView(act);
        banner.setAdUnitId(BANNER);
        banner.setAdSize(AdSize.BANNER);
        banner.setBackgroundColor(0xFF111318);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL);
        raiz.addView(banner, lp);
        banner.setAdListener(new AdListener() {
            @Override public void onAdLoaded() { aplicarBanner(); }
            @Override public void onAdFailedToLoad(LoadAdError e) { aplicarBanner(); }
        });
        banner.loadAd(peticion());
        aplicarBanner();
    }

    /** Deja hueco abajo para que el banner no tape la app */
    private static void aplicarBanner() {
        if (banner == null) return;
        banner.setVisibility(quiereBanner ? View.VISIBLE : View.GONE);
        int alto = quiereBanner ? AdSize.BANNER.getHeightInPixels(act) : 0;
        FrameLayout.LayoutParams lp = (FrameLayout.LayoutParams) web.getLayoutParams();
        if (lp.bottomMargin != alto) { lp.bottomMargin = alto; web.setLayoutParams(lp); }
    }

    private static void cargarIntersticial() {
        InterstitialAd.load(act, PANTALLA_COMPLETA, peticion(), new InterstitialAdLoadCallback() {
            @Override public void onAdLoaded(InterstitialAd ad) { intersticial = ad; }
            @Override public void onAdFailedToLoad(LoadAdError e) { intersticial = null; }
        });
    }

    private static void cargarPremio() {
        RewardedAd.load(act, CON_PREMIO, peticion(), new RewardedAdLoadCallback() {
            @Override public void onAdLoaded(RewardedAd ad) { premio = ad; }
            @Override public void onAdFailedToLoad(LoadAdError e) { premio = null; }
        });
    }

    private static void avisarWeb(String js) {
        act.runOnUiThread(() -> { if (web != null) web.evaluateJavascript(js, null); });
    }

    /** Lo que la web de Cubiverso puede pedir */
    static final class Puente {
        @JavascriptInterface public boolean esPro() { return false; }
        @JavascriptInterface public boolean premioListo() { return premio != null; }

        @JavascriptInterface public void banner(boolean ver) {
            act.runOnUiThread(() -> { quiereBanner = ver; aplicarBanner(); });
        }

        @JavascriptInterface public void intersticial() {
            act.runOnUiThread(() -> {
                if (intersticial == null) { if (listo) cargarIntersticial(); return; }
                InterstitialAd ad = intersticial; intersticial = null;
                ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                    @Override public void onAdDismissedFullScreenContent() { cargarIntersticial(); avisarWeb("window.CubiAudio&&CubiAudio.resume&&CubiAudio.resume()"); }
                });
                avisarWeb("window.CubiAudio&&CubiAudio.suspend&&CubiAudio.suspend()");
                ad.show(act);
            });
        }

        @JavascriptInterface public void verPremio() {
            act.runOnUiThread(() -> {
                if (premio == null) { avisarWeb("window.cubiAnuncioPremio&&cubiAnuncioPremio(false,'cargando')"); if (listo) cargarPremio(); return; }
                RewardedAd ad = premio; premio = null;
                final boolean[] ganado = {false};
                ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                    @Override public void onAdDismissedFullScreenContent() {
                        avisarWeb("window.CubiAudio&&CubiAudio.resume&&CubiAudio.resume()");
                        avisarWeb("window.cubiAnuncioPremio&&cubiAnuncioPremio(" + ganado[0] + ")");
                        cargarPremio();
                    }
                });
                avisarWeb("window.CubiAudio&&CubiAudio.suspend&&CubiAudio.suspend()");
                ad.show(act, item -> ganado[0] = true);
            });
        }
    }
}
