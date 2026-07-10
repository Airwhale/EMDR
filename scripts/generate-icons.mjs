/**
 * Generate PWA icons (gold glowing dot on the app's dark background)
 * with zero dependencies — raw PNG encoding via node:zlib.
 *
 *   node scripts/generate-icons.mjs
 *
 * Outputs: public/icons/icon-192.png, public/icons/icon-512.png,
 *          public/apple-touch-icon.png (180x180)
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

// CRC32 (PNG chunk checksums)
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixels /* RGB Buffer, size*size*3 */) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); // width
  ihdr.writeUInt32BE(size, 4); // height
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  // compression 0, filter 0, interlace 0

  // Raw scanlines: filter byte 0 + row pixels
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * size * 3, (y + 1) * size * 3);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// The app's visual identity: near-black background, soft glowing gold dot
const BG = [10, 10, 15]; // #0a0a0f
const GOLD = [201, 169, 110]; // #c9a96e

function renderIcon(size) {
  const px = Buffer.alloc(size * size * 3);
  const cx = size / 2;
  const cy = size / 2;
  const core = size * 0.14; // solid dot radius
  const glow = size * 0.42; // glow falloff radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx + 0.5, y - cy + 0.5);
      let t = 0; // gold intensity 0..1
      if (d <= core) {
        t = 1;
      } else if (d < glow) {
        const f = 1 - (d - core) / (glow - core);
        t = 0.45 * f * f; // quadratic falloff, dimmer glow
      }
      const i = (y * size + x) * 3;
      // Blend toward a slightly brightened gold core for the hot center
      const boost = d <= core ? 1.2 : 1;
      px[i] = Math.min(255, Math.round(BG[0] + (GOLD[0] * boost - BG[0]) * t));
      px[i + 1] = Math.min(255, Math.round(BG[1] + (GOLD[1] * boost - BG[1]) * t));
      px[i + 2] = Math.min(255, Math.round(BG[2] + (GOLD[2] * boost - BG[2]) * t));
    }
  }
  return encodePng(size, px);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", renderIcon(192));
writeFileSync("public/icons/icon-512.png", renderIcon(512));
writeFileSync("public/apple-touch-icon.png", renderIcon(180));
console.log("icons written: public/icons/icon-192.png, public/icons/icon-512.png, public/apple-touch-icon.png");
