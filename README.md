# Picaterra Launcher para Android

App de Android que hace lo mismo que el launcher de Windows: descarga sola la última versión de Picaterra,
guarda cada versión, comparte los mundos entre versiones y deja añadir canciones y texturas.

- `app/src/main/java/.../MainActivity.java`: la app (descargas, archivos y el WebView).
- `app/src/main/assets/launcher/`: la pantalla del launcher (la misma que en Windows, con `android-shim.js`).
- Cada vez que se sube un cambio a la rama `picaterra-android`, GitHub Actions crea `Picaterra-Launcher.apk` en **Releases**.

## Firma

Para que las APK nuevas se instalen encima de la anterior sin desinstalar, todas tienen que llevar la misma firma.
Guárdala como secretos del repositorio (Settings → Secrets → Actions): `ANDROID_KEYSTORE` (el .jks en base64)
y `ANDROID_KEY_PASS` (su contraseña). Sin esos secretos, cada compilación lleva una firma distinta.
