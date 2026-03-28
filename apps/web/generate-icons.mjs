import fs from 'fs';
import zlib from 'zlib';

// Create a solid-color PNG (amber #78350f with a coffee cup ☕ is too complex,
// so we do amber background with a white circle — clean and branded)
function createPNG(size) {
  const width = size;
  const height = size;

  // Raw pixel data: filter byte + RGB per row
  const raw = Buffer.alloc(height * (1 + width * 3));

  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0; // filter type: None
    for (let x = 0; x < width; x++) {
      const i = y * (width * 3 + 1) + 1 + x * 3;

      const cx = width / 2, cy = height / 2;
      const r = Math.min(width, height) * 0.35;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

      if (dist < r) {
        // White circle
        raw[i] = 255; raw[i + 1] = 255; raw[i + 2] = 255;
      } else {
        // Amber #78350f background
        raw[i] = 0x78; raw[i + 1] = 0x35; raw[i + 2] = 0x0f;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);

  function crc32(buf) {
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c;
    }
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; ihdrData[9] = 2; // 8-bit RGB

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.writeFileSync('public/icon-192.png', createPNG(192));
fs.writeFileSync('public/icon-512.png', createPNG(512));
console.log('✓ icon-192.png and icon-512.png generated');
