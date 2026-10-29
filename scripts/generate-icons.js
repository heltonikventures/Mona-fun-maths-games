import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create a beautiful SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#064e3b" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
    <linearGradient id="emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="108" fill="url(#bg)" />

  <!-- Outer gold-emerald border ring -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="url(#emerald)" stroke-width="8" opacity="0.4" />

  <!-- Glowing crest backdrop -->
  <circle cx="256" cy="230" r="160" fill="url(#emerald)" opacity="0.15" />
  <circle cx="256" cy="230" r="130" fill="#1e293b" filter="url(#shadow)" />

  <!-- Center Math Symbols & Compass Crest -->
  <!-- Nigerian Green & Gold Shield emblem -->
  <path d="M256 120 L360 160 V260 C360 320 256 365 256 365 C256 365 152 320 152 260 V160 Z" 
        fill="url(#emerald)" opacity="0.9" filter="url(#shadow)" />

  <!-- Inner Gold Shield -->
  <path d="M256 135 L345 170 V255 C345 305 256 348 256 348 C256 348 167 305 167 255 V170 Z" 
        fill="#0f172a" />

  <!-- Math Quest 'MQ' & Naira Symbol -->
  <text x="256" y="240" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="78" 
        text-anchor="middle" fill="url(#gold)" filter="url(#shadow)">MQ</text>
  
  <text x="256" y="295" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="34" 
        text-anchor="middle" fill="#34d399">₦ MATHS</text>

  <!-- Floating Math glyphs -->
  <g fill="#fde047" font-family="system-ui, sans-serif" font-weight="bold" font-size="36" opacity="0.85">
    <text x="75" y="140" text-anchor="middle">➕</text>
    <text x="435" y="140" text-anchor="middle">✖️</text>
    <text x="75" y="380" text-anchor="middle">➗</text>
    <text x="435" y="380" text-anchor="middle">🟰</text>
  </g>

  <!-- Banner at bottom -->
  <rect x="76" y="405" width="360" height="58" rx="29" fill="url(#gold)" filter="url(#shadow)" />
  <text x="256" y="444" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" 
        letter-spacing="2" text-anchor="middle" fill="#0f172a">TEACHER HELTON</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');

// Function to generate a real, standard PNG file in pure Node.js (RGBA uncompressed raster inside valid PNG chunks)
function createValidPNG(width, height, isMaskable = false) {
  // Build a basic valid PNG containing width x height
  // PNG structure: Signature (8 bytes) + IHDR chunk + IDAT chunk + IEND chunk
  
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type 6: RGBA
  ihdrData.writeUInt8(0, 10); // compression method 0
  ihdrData.writeUInt8(0, 11); // filter method 0
  ihdrData.writeUInt8(0, 12); // interlace method 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Generate image raw scanlines: each scanline has 1 filter byte (0) + width * 4 bytes RGBA
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.46;
  const rInner = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: deep slate #0f172a
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      if (!isMaskable) {
        // Rounded corner masking for standard icon
        const cornerR = width * 0.22;
        const inCornerX = x < cornerR || x > width - cornerR;
        const inCornerY = y < cornerR || y > height - cornerR;
        if (inCornerX && inCornerY) {
          const cornerCx = x < cornerR ? cornerR : width - cornerR;
          const cornerCy = y < cornerR ? cornerR : height - cornerR;
          const cornerDist = Math.hypot(x - cornerCx, y - cornerCy);
          if (cornerDist > cornerR) {
            a = 0;
          }
        }
      }

      if (a > 0) {
        // Emerald / Gold gradient shield center
        if (dist < rOuter && dist > rInner) {
          // Ring: emerald/gold
          const angle = Math.atan2(dy, dx);
          if (angle > 0) {
            // Emerald #10b981
            r = 16; g = 185; b = 129;
          } else {
            // Gold #f59e0b
            r = 245; g = 158; b = 11;
          }
        } else if (dist <= rInner) {
          // Inside shield
          if (Math.abs(dx) < width * 0.08 || Math.abs(dy) < height * 0.08) {
            // Math plus cross in center (Gold)
            r = 250; g = 204; b = 21;
          } else {
            // Dark indigo center #1e1b4b
            r = 30; g = 27; b = 75;
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  // CRC32 over type + data
  const crcTarget = chunk.subarray(4, 8 + len);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

// Generate the required icons
console.log('Generating PWA icons in /public...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createValidPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createValidPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createValidPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createValidPNG(180, 180, false));
console.log('Icons generated successfully!');
