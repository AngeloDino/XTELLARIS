// Genera los íconos PNG de la PWA (public/icons) sin dependencias externas:
// fondo azul noche con la estrella Xtellaris de cuatro puntas.
// Ejecutar con: npm run generate-icons
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BG = [11, 18, 32]; // #0b1220
const STAR = [129, 140, 248]; // #818cf8

function crc32(buf) {
  let c,
    crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Estrella de 4 puntas (astroide): |x|^(2/3) + |y|^(2/3) <= r^(2/3). */
function insideStar(dx, dy, r) {
  const p = 2 / 3;
  return Math.pow(Math.abs(dx), p) + Math.pow(Math.abs(dy), p) <= Math.pow(r, p);
}

function makePng(size) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  // Scanlines: byte de filtro 0 + píxeles RGB.
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const row = y * (1 + size * 3);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const star =
        insideStar(x - cx, y - cy, r) ||
        // Estrella pequeña de acento arriba a la derecha.
        insideStar(x - size * 0.78, y - size * 0.2, size * 0.07);
      const [red, g, b] = star ? STAR : BG;
      const o = row + 1 + x * 3;
      raw[o] = red;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // profundidad de bits
  ihdr[9] = 2; // color RGB

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
for (const size of [192, 512]) {
  const file = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(file, makePng(size));
  console.log(`✔ ${file}`);
}
