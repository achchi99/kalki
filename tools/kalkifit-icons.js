/* kalki.uz — "KalkiFit" PWA ikonkalari (assets/icons/kalkifit-*.png): to'q yashil fon, iliq halqa (kunlik me'yor) va oq "KF" harflari. node tools/kalkifit-icons.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const OUT = path.join(__dirname, '..', 'assets', 'icons');
const INK = '#0E3B2E', WARM = '#FF9B75';
const glyph = (s) => `<g transform="translate(32 32) scale(${s}) translate(-32 -32)"><circle cx="32" cy="32" r="25" fill="none" stroke="#1B5A47" stroke-width="3.500"/><circle cx="32" cy="32" r="25" fill="none" stroke="${WARM}" stroke-width="3.500" stroke-linecap="round" stroke-dasharray="118 160" transform="rotate(-90 32 32)"/><g fill="none" stroke="#FFFFFF" stroke-width="5.500" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v22M28 21L17.500 32 28 43"/><path d="M35 43V21h12"/></g><path d="M35 32h9" fill="none" stroke="${WARM}" stroke-width="5.500" stroke-linecap="round"/></g>`;
const svg = (size, { rx, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${INK}"/>${glyph(scale)}</svg>`;
const TARGETS = [['kalkifit-192.png', 192, { rx: 12, scale: 1.15 }], ['kalkifit-512.png', 512, { rx: 12, scale: 1.15 }], ['kalkifit-maskable-512.png', 512, { rx: 0, scale: 0.8 }], ['kalkifit-apple-180.png', 180, { rx: 0, scale: 1.0 }]];
for (const [name, size, o] of TARGETS) {
  const png = new Resvg(svg(size, o), { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(OUT, name), png); console.log(name, size + 'x' + size, png.length + ' B');
}
