// ⚙️ Configuración de Firebase para Chispa.
// Cópiala de: Firebase → ⚙️ Configuración del proyecto → Tus apps → Web (</>) → "firebaseConfig".
// Sustituye las líneas de abajo por las tuyas (solo cambia lo que está entre comillas).
// Esto NO es secreto: Google lo diseña para ir dentro de las páginas web. Lo que protege los datos son las reglas.
window.CHISPA_FIREBASE = {
  apiKey: "PEGA_AQUI",
  authDomain: "PEGA_AQUI.firebaseapp.com",
  projectId: "PEGA_AQUI",
  storageBucket: "PEGA_AQUI.appspot.com",
  messagingSenderId: "PEGA_AQUI",
  appId: "PEGA_AQUI"
};
// Si apiKey sigue poniendo PEGA_AQUI, Chispa usa las cuentas normales (sin Google).
if (/PEGA_AQUI/.test(window.CHISPA_FIREBASE.apiKey)) window.CHISPA_FIREBASE = null;
