/* kalki.uz — "Salomat" PWA ikonkalari (assets/icons/salomat-*.png): to'q yashil fon, iliq halqa (kunlik me'yor) va yurakcha. node tools/salomat-icons.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const OUT = path.join(__dirname, '..', 'assets', 'icons');
const INK = '#0E3B2E', WARM = '#FF9B75';
const glyph = (s) => `<g transform="translate(32 32) scale(${s}) translate(-32 -32)"><circle cx="32" cy="32" r="19" fill="none" stroke="#1B5A47" stroke-width="6"/><circle cx="32" cy="32" r="19" fill="none" stroke="${WARM}" stroke-width="6" stroke-linecap="round" stroke-dasharray="94 120" transform="rotate(-90 32 32)"/><path d="M32 42c-6.5-4.2-10-7.9-10-11.7a5.3 5.3 0 0 1 10-2.4 5.3 5.3 0 0 1 10 2.4c0 3.8-3.500 7.500-10 11.700z" fill="#FFFFFF"/></g>`;
const svg = (size, { rx, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${INK}"/>${glyph(scale)}</svg>`;
const TARGETS = [['salomat-192.png', 192, { rx: 12, scale: 1.15 }], ['salomat-512.png', 512, { rx: 12, scale: 1.15 }], ['salomat-maskable-512.png', 512, { rx: 0, scale: 0.8 }], ['salomat-apple-180.png', 180, { rx: 0, scale: 1.0 }]];
for (const [name, size, o] of TARGETS) {
  const png = new Resvg(svg(size, o), { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(OUT, name), png); console.log(name, size + 'x' + size, png.length + ' B');
}
