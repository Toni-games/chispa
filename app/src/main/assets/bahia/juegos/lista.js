/* =========================================================
   LISTA DE JUEGOS DE BahíaOS
   ---------------------------------------------------------
   Cada juego vive en su propia carpeta:  juegos/<carpeta>/index.html

   Para añadir un juego nuevo:
     1. Crea la carpeta, por ejemplo  juegos/mi-juego/
     2. Pon dentro un index.html con tu juego
     3. Añade una línea aquí abajo, por ejemplo:
        { carpeta: 'mi-juego', nombre: 'Mi juego', icono: '🚀', color: ['#ff9f0a', '#ff375f'], ancho: 600, alto: 500, descripcion: 'Lo que sea' },

   carpeta  → nombre exacto de la carpeta (sin espacios ni tildes)
   nombre   → cómo se ve en el sistema
   icono    → un emoji
   color    → dos colores para el degradado del icono
   ancho/alto → tamaño de la ventana al abrirlo
   ========================================================= */
window.JUEGOS = [
  { carpeta: 'serpiente',    nombre: 'Serpiente',    icono: '🐍', color: ['#4cd964', '#0b7a3a'], ancho: 520, alto: 580, descripcion: 'Come manzanas y crece sin chocarte' },
  { carpeta: '2048',         nombre: '2048',         icono: '🔢', color: ['#ffcc66', '#e08a1e'], ancho: 470, alto: 600, descripcion: 'Junta fichas iguales hasta llegar a 2048' },
  { carpeta: 'buscaminas',   nombre: 'Buscaminas',   icono: '💣', color: ['#8e9aaf', '#3d4a63'], ancho: 470, alto: 580, descripcion: 'Despeja el campo sin pisar una mina' },
  { carpeta: 'tres-en-raya', nombre: 'Tres en raya', icono: '⭕', color: ['#5ac8fa', '#2a5bd7'], ancho: 420, alto: 560, descripcion: 'Contra el ordenador o contra un amigo' },
  { carpeta: 'memoria',      nombre: 'Memoria',      icono: '🃏', color: ['#ff8ab0', '#c2185b'], ancho: 520, alto: 620, descripcion: 'Encuentra todas las parejas' },
  { carpeta: 'aleteo',       nombre: 'Aleteo',       icono: '🐤', color: ['#7fd6ff', '#2f8de4'], ancho: 440, alto: 620, descripcion: 'Vuela entre las tuberías' }
];
