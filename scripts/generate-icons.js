import fs from 'fs';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writePng(width, height, isMaskable = false) {
  // Raw image data: filter byte 0 + RGBA
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.45;
  const bowRadius = width * 0.28;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);

      // Saffron/Gold/Deep Dark gradient background
      let r = 12;
      let g = 10;
      let b = 9;
      let a = 255;

      const normDist = dist / (width * 0.5);
      if (normDist < 1.0) {
        // Deep saffron radial glow
        const glow = Math.max(0, 1 - normDist);
        r = Math.min(255, Math.round(20 + glow * 120));
        g = Math.min(255, Math.round(15 + glow * 50));
        b = Math.min(255, Math.round(10 + glow * 10));
      }

      // Outer gold circle ring
      if (Math.abs(dist - radius) < (width > 200 ? 5 : 2.5)) {
        r = 245; g = 158; b = 11;
      }

      // Bow curve on left side (C-shaped curve)
      const bowX = cx - width * 0.12 + Math.cos(dy / (height * 0.3)) * (width * 0.14);
      const bowDist = Math.hypot(x - bowX, 0);
      if (Math.abs(dy) < height * 0.32 && Math.abs(x - (cx - width * 0.08 - (Math.abs(dy) * 0.25))) < (width > 200 ? 8 : 4)) {
        r = 251; g = 191; b = 36; // Gold Kodanda bow
      }

      // Arrow horizontal line
      if (Math.abs(dy) < (width > 200 ? 4 : 2) && x > cx - width * 0.22 && x < cx + width * 0.3) {
        r = 254; g = 240; b = 138;
      }

      // Arrowhead
      if (x >= cx + width * 0.25 && x <= cx + width * 0.36) {
        const arrowDistY = Math.abs(dy);
        const maxArrowH = (cx + width * 0.36 - x) * 0.7;
        if (arrowDistY <= maxArrowH) {
          r = 245; g = 158; b = 11; // Gold arrowhead
        }
      }

      // Lotus center gem
      if (dist < (width > 200 ? 14 : 6)) {
        r = 239; g = 68; b = 68; // Ruby
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crcVal = crc32(crcData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

// Generate all required PWA icons
fs.writeFileSync('public/pwa-192x192.png', writePng(192, 192));
fs.writeFileSync('public/pwa-512x512.png', writePng(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', writePng(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', writePng(180, 180));
console.log('PWA PNG icons generated successfully!');
