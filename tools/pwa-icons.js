/* kalki.uz — PWA ikonkalari (assets/icons/*.png). Manba: favicon.svg dagi belgi (to'q yashil fon, oq "K", oltin nuqta);
 * "K" shrift o'rniga yo'l (path) bilan chiziladi — shrift kerak emas. node tools/pwa-icons.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const OUT = path.join(__dirname, '..', 'assets', 'icons');
const INK = '#0E3B2E', GOLD = '#D99A2B';
// belgi 64x64 koordinatada; scale — belgi hajmi (maskable uchun xavfsiz zona ~ 0.62)
const glyph = (scale) => `<g transform="translate(32 32) scale(${scale}) translate(-32 -32)"><g fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 15V49"/><path d="M44 15L25 33"/><path d="M29 29L45 49"/></g><circle cx="49" cy="46" r="5.5" fill="${GOLD}"/></g>`;
const svg = (size, { rx, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${INK}"/>${glyph(scale)}</svg>`;
const TARGETS = [
  ['icon-192.png', 192, { rx: 12, scale: 1.0 }],
  ['icon-512.png', 512, { rx: 12, scale: 1.0 }],
  ['icon-maskable-512.png', 512, { rx: 0, scale: 0.62 }],      // to'liq fon, belgi markaziy 80% doirada
  ['apple-touch-icon-180.png', 180, { rx: 0, scale: 0.86 }]    // iOS burchaklarni o'zi yumaloqlaydi
];
for (const [name, size, o] of TARGETS) {
  const png = new Resvg(svg(size, o), { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(OUT, name), png);
  console.log(name, size + 'x' + size, png.length + ' B');
}
