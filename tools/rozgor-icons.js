/* kalki.uz — "Ro'zg'or" PWA ikonkalari (assets/icons/rozgor-*.png): Kalki to'q yashil foni, oq hamyon va oltin tanga.
 * node tools/rozgor-icons.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const OUT = path.join(__dirname, '..', 'assets', 'icons');
const INK = '#0E3B2E', GOLD = '#D99A2B';
const glyph = (s) => `<g transform="translate(32 32) scale(${s}) translate(-32 -32)"><path d="M17 24.500c0-2.200 1.800-4 4-4h19.500c2.200 0 3.500 1.200 3.500 3v1.500H21a3 3 0 0 0-3 3z" fill="#9FD3B8"/><rect x="15" y="25" width="34" height="22" rx="5" fill="#FFFFFF"/><path d="M38 31.500h11a0 0 0 0 1 0 0v10.500a0 0 0 0 1 0 0H38a5.250 5.250 0 0 1 0-10.500z" fill="#E5F0E9"/><circle cx="40.500" cy="36.800" r="3.200" fill="${GOLD}"/></g>`;
const svg = (size, { rx, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${INK}"/>${glyph(scale)}</svg>`;
const TARGETS = [['rozgor-192.png', 192, { rx: 12, scale: 1.15 }], ['rozgor-512.png', 512, { rx: 12, scale: 1.15 }], ['rozgor-maskable-512.png', 512, { rx: 0, scale: 0.8 }], ['rozgor-apple-180.png', 180, { rx: 0, scale: 1.0 }]];
for (const [name, size, o] of TARGETS) {
  const png = new Resvg(svg(size, o), { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(OUT, name), png); console.log(name, size + 'x' + size, png.length + ' B');
}
