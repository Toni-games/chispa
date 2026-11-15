# Picaterra Launcher

Launcher para Windows de **Picaterra**. Es muy básico a propósito, para que se pueda remodelar.

## Qué hace

- Al abrirse, mira la lista de versiones en internet
  (`https://toni-games.github.io/chispa/picaterra/versiones.json`).
- Si hay una versión nueva del juego, **la descarga sola** (se puede desactivar en *Ajustes*).
- Guarda cada versión en su carpeta y deja elegir cuál jugar.
- Avisa cuando hay un launcher nuevo.
- Tiene dos carpetas para el jugador:
  - **Música**: las canciones que metas aquí aparecen en *Música…* dentro del juego, y puedes marcar si suenan en el menú o en la partida.
  - **Texturas**: si metes aquí un paquete de texturas (.zip), el juego lo carga solo al arrancar.
- Los mundos se guardan en el launcher y **no se pierden al actualizar** (todas las versiones comparten los datos).
- El multijugador por internet funciona dentro del launcher (usa PeerJS, que va incluido).

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `main.js` | El programa: descargas, carpetas y ventanas. |
| `preload.js` | Lo que la pantalla del launcher puede pedirle al programa. |
| `launcher/index.html` | **La pantalla del launcher.** Aquí es donde se cambia el aspecto (los colores están al principio, en `:root`). |
| `icon.png` | Icono del launcher (512×512). |
| `.github/workflows/picaterra-launcher.yml` | Crea el `.exe` solo cada vez que se sube un cambio a esta rama. |
| `herramientas/nueva-version.js` | Publica una versión nueva del juego. |

## Probarlo en tu ordenador

```
npm install
npm start
```

## Crear el instalador

Cada vez que se sube un cambio a la rama `picaterra-launcher`, GitHub Actions crea
`Picaterra-Launcher-Instalador.exe` y `Picaterra-Launcher-Portable.exe` en **Releases**.
Si cambias el launcher, sube también el número de `version` en `package.json`
y el campo `launcher` de `picaterra/versiones.json`, para que los launchers viejos avisen.

## Publicar una versión nueva del juego

En la rama `main` del repositorio:

```
node herramientas/nueva-version.js 1.2 picaterra.html "Título" "Novedad 1" "Novedad 2"
```

Esto crea `picaterra-versiones/picaterra-1.2.zip`, actualiza `picaterra/versiones.json`
y pone el juego en `picaterra/index.html` (la versión web). Al subirlo a GitHub,
todos los launchers descargan la versión nueva la próxima vez que se abran.

## Formato de `versiones.json`

```json
{
  "latest": "1.1",
  "launcher": "1.0.0",
  "launcherUrl": "https://github.com/Toni-games/chispa/releases",
  "versions": [
    { "id": "1.1", "date": "2026-11-15", "title": "…", "notes": ["…"], "size": 123456,
      "url": "https://toni-games.github.io/chispa/picaterra-versiones/picaterra-1.1.zip" }
  ]
}
```
