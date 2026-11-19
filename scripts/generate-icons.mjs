import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
};

const sdRoundRect = (x, y, cx, cy, hw, hh, r) => {
  const dx = Math.abs(x - cx) - (hw - r);
  const dy = Math.abs(y - cy) - (hh - r);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.min(Math.max(dx, dy), 0) + Math.hypot(ox, oy) - r;
};

function dumbbellSdf(x, y) {
  const plates = [
    [0.30, 0.46],
    [0.70, 0.46],
    [0.17, 0.32],
    [0.83, 0.32],
  ];
  let d = Infinity;
  for (const [cx, h] of plates) {
    d = Math.min(d, sdRoundRect(x, y, cx, 0.5, 0.035, h / 2, Math.min(0.035, h / 2)));
  }
  d = Math.min(d, sdRoundRect(x, y, 0.5, 0.5, 0.30, 0.028, 0.028));
  return d;
}

function render({ size, bgColor, glyphColor, glyphScale, supersample = 3 }) {
  const g = hex(glyphColor);
  const s = Math.max(2, size * supersample);
  const coverage = new Float32Array(size * size);
  for (let py = 0; py < s; py++) {
    const y = py / s;
    for (let px = 0; px < s; px++) {
      const x = px / s;
      const u = (x - 0.5) / glyphScale + 0.5;
      const v = (y - 0.5) / glyphScale + 0.5;
      if (u < -0.05 || u > 1.05 || v < -0.05 || v > 1.05) continue;
      const d = dumbbellSdf(u, v);
      const aa = 1 / (s * glyphScale);
      if (d < aa) {
        coverage[Math.floor((py / supersample) | 0) * size + Math.floor((px / supersample) | 0)] += 1;
      }
    }
  }
  const rgba = Buffer.alloc(size * size * 4);
  const bg = bgColor ? hex(bgColor) : null;
  for (let i = 0; i < size * size; i++) {
    const a = coverage[i] / (supersample * supersample);
    const idx = i * 4;
    if (bg) {
      rgba[idx] = Math.round(g[0] * a + bg[0] * (1 - a));
      rgba[idx + 1] = Math.round(g[1] * a + bg[1] * (1 - a));
      rgba[idx + 2] = Math.round(g[2] * a + bg[2] * (1 - a));
      rgba[idx + 3] = 255;
    } else {
      rgba[idx] = g[0];
      rgba[idx + 1] = g[1];
      rgba[idx + 2] = g[2];
      rgba[idx + 3] = Math.round(a * 255);
    }
  }
  return rgba;
}

mkdirSync(new URL('../assets/images/', import.meta.url).pathname, { recursive: true });

const out = (name, buf) => {
  const path = new URL('../assets/images/' + name, import.meta.url).pathname;
  writeFileSync(path, buf);
  console.log('written', path, buf.length, 'bytes');
};

out('icon.png', encodePNG(1024, 1024, render({ size: 1024, bgColor: '#FF6A00', glyphColor: '#FFFFFF', glyphScale: 0.66 })));
out('splash-icon.png', encodePNG(384, 384, render({ size: 384, bgColor: null, glyphColor: '#FFFFFF', glyphScale: 0.92 })));
out('android-icon-foreground.png', encodePNG(1024, 1024, render({ size: 1024, bgColor: null, glyphColor: '#FFFFFF', glyphScale: 0.5 })));
out('android-icon-monochrome.png', encodePNG(1024, 1024, render({ size: 1024, bgColor: null, glyphColor: '#FFFFFF', glyphScale: 0.5 })));
out('android-icon-background.png', encodePNG(64, 64, (() => {
  const rgba = Buffer.alloc(64 * 64 * 4);
  const [r, g, b] = hex('#FF6A00');
  for (let i = 0; i < 4096; i++) {
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    rgba[i * 4 + 3] = 255;
  }
  return rgba;
})()));
out('favicon.png', encodePNG(48, 48, render({ size: 48, bgColor: '#FF6A00', glyphColor: '#FFFFFF', glyphScale: 0.8, supersample: 4 })));
