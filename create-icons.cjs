/**
 * Creates icon-192.png and icon-512.png from scratch using pure Node.js.
 * No extra npm packages required — only built-in 'zlib' and 'fs'.
 * Run: node create-icons.cjs
 */
const zlib = require('zlib')
const fs   = require('fs')
const path = require('path')

/* ── CRC-32 (required by PNG spec) ───────────────────────── */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF]
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4);  len.writeUInt32BE(data.length)
  const typ = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4);  crc.writeUInt32BE(crc32(Buffer.concat([typ, data])))
  return Buffer.concat([len, typ, data, crc])
}

/* ── Draw a yellow circle icon ───────────────────────────── */
function makeIcon(size) {
  const rgba = Buffer.alloc(size * size * 4, 0)  // transparent bg
  const cx = size / 2, cy = size / 2
  const outerR = size * 0.48
  const innerR = size * 0.32

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const i = (y * size + x) * 4

      if (dist > outerR) continue          // outside circle — transparent

      if (dist <= innerR) {
        // Inner "S" area — dark background  #1a1a1a
        rgba[i]   = 26
        rgba[i+1] = 26
        rgba[i+2] = 26
        rgba[i+3] = 255
      } else {
        // Yellow ring  #fabd00
        rgba[i]   = 0xFA
        rgba[i+1] = 0xBD
        rgba[i+2] = 0x00
        rgba[i+3] = 255
      }
    }
  }

  // Draw simple "SB" pixel letters in white at centre
  drawText(rgba, size, 'SB', cx, cy, Math.max(1, Math.floor(size / 64)))

  /* ── Pack into PNG ─────────────────────────────────────── */
  // Filter byte (0 = None) + row data
  const scanlines = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1)
    scanlines[rowStart] = 0  // filter None
    rgba.copy(scanlines, rowStart + 1, y * size * 4, (y + 1) * size * 4)
  }

  const sig  = Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0  // 8-bit RGBA

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(scanlines, { level: 6 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

/* ── Tiny pixel-font "SB" ────────────────────────────────── */
const GLYPHS = {
  S: [
    [1,1,1],
    [1,0,0],
    [1,1,1],
    [0,0,1],
    [1,1,1],
  ],
  B: [
    [1,1,0],
    [1,0,1],
    [1,1,0],
    [1,0,1],
    [1,1,0],
  ],
}

function drawText(rgba, size, text, cx, cy, scale) {
  const charW = 3, charH = 5, gap = 1
  const totalW = text.length * charW * scale + (text.length - 1) * gap * scale
  let startX = Math.round(cx - totalW / 2)
  const startY = Math.round(cy - (charH * scale) / 2)

  for (const ch of text) {
    const glyph = GLYPHS[ch]
    if (!glyph) { startX += (charW + gap) * scale; continue }
    for (let gy = 0; gy < charH; gy++) {
      for (let gx = 0; gx < charW; gx++) {
        if (!glyph[gy][gx]) continue
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = startX + gx * scale + sx
            const py = startY + gy * scale + sy
            if (px < 0 || px >= size || py < 0 || py >= size) continue
            const i = (py * size + px) * 4
            rgba[i] = 255; rgba[i+1] = 255; rgba[i+2] = 255; rgba[i+3] = 255
          }
        }
      }
    }
    startX += (charW + gap) * scale
  }
}

/* ── Write files ─────────────────────────────────────────── */
const publicDir = path.join(__dirname, 'public')
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), makeIcon(192))
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), makeIcon(512))
console.log('✓ public/icon-192.png')
console.log('✓ public/icon-512.png')
