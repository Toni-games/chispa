// ============================================================
//  Publicar una versión nueva de Picaterra para el launcher
//
//  Uso (desde la carpeta raíz del repositorio chispa, rama main):
//    node nueva-version.js 1.2 ruta/al/picaterra.html "Título corto" "Novedad 1" "Novedad 2" ...
//
//  Hace tres cosas:
//    1. crea picaterra-versiones/picaterra-1.2.zip con el juego dentro (index.html)
//    2. añade la versión a picaterra/versiones.json y la marca como la última
//    3. copia el juego a picaterra/index.html (la versión web para jugar en el navegador)
//  Después solo hay que subir esos archivos a GitHub (commit + push a main).
//  Los launchers la verán solos la próxima vez que se abran.
// ============================================================
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const [id, html, title, ...notes] = process.argv.slice(2);
if (!/^[0-9]{1,3}(\.[0-9]{1,3}){0,3}$/.test(id || '') || !html || !fs.existsSync(html)) {
  console.log('Uso: node nueva-version.js 1.2 picaterra.html "Título" "Novedad 1" "Novedad 2"'); process.exit(1);
}
// zip mínimo (un solo archivo, comprimido con deflate) sin necesitar librerías
function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function zipOne(name, data) {
  const comp = zlib.deflateRawSync(data, { level: 9 }), nm = Buffer.from(name), crc = crc32(data);
  const loc = Buffer.alloc(30); loc.writeUInt32LE(0x04034b50, 0); loc.writeUInt16LE(20, 4); loc.writeUInt16LE(0x0800, 6); loc.writeUInt16LE(8, 8); loc.writeUInt32LE(crc, 14); loc.writeUInt32LE(comp.length, 18); loc.writeUInt32LE(data.length, 22); loc.writeUInt16LE(nm.length, 26);
  const cen = Buffer.alloc(46); cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(8, 10); cen.writeUInt32LE(crc, 16); cen.writeUInt32LE(comp.length, 20); cen.writeUInt32LE(data.length, 24); cen.writeUInt16LE(nm.length, 28);
  const locLen = 30 + nm.length + comp.length;
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(1, 8); end.writeUInt16LE(1, 10); end.writeUInt32LE(46 + nm.length, 12); end.writeUInt32LE(locLen, 16);
  return Buffer.concat([loc, nm, comp, cen, nm, end]);
}
const game = fs.readFileSync(html);
fs.mkdirSync('picaterra-versiones', { recursive: true }); fs.mkdirSync('picaterra', { recursive: true });
const zipName = 'picaterra-' + id + '.zip'; const zip = zipOne('index.html', game);
fs.writeFileSync(path.join('picaterra-versiones', zipName), zip);
fs.writeFileSync(path.join('picaterra', 'index.html'), game);
const mf = path.join('picaterra', 'versiones.json');
let m = { latest: id, launcher: '1.0.0', launcherUrl: 'https://github.com/Toni-games/chispa/releases', versions: [] };
try { m = JSON.parse(fs.readFileSync(mf, 'utf8')); } catch (e) { }
m.versions = (m.versions || []).filter(v => v.id !== id);
m.versions.unshift({ id, date: new Date().toISOString().slice(0, 10), title: title || 'Versión ' + id, notes, size: zip.length, url: 'https://toni-games.github.io/chispa/picaterra-versiones/' + zipName });
m.latest = id;
fs.writeFileSync(mf, JSON.stringify(m, null, 2));
console.log('Listo: ' + zipName + ' (' + (zip.length / 1048576).toFixed(2) + ' MB). Sube a GitHub las carpetas picaterra/ y picaterra-versiones/.');
