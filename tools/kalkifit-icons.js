/* kalki.uz — "KalkiFit" PWA ikonkalari (assets/icons/kalkifit-*.png): mandarin #F5683A kvadrat + oq «K» (iOS ochilish rasmi, ilova ichidagi splash, manifest va apple-touch-icon — hammasi bir xil belgi). node tools/kalkifit-icons.js */
'use strict';
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const OUT = path.join(__dirname, '..', 'assets', 'icons');
const TILE = '#F5683A', K = '#FFFFFF';
const KPATH = 'M28 20h9v18.5L52.5 20H63L46.5 39.5 64 64H53.2L40.7 46.2 37 50.3V64h-9z';          // 84×84 belgi (kfSplash bilan bir xil); markazi (46, 42)
const svg = (size, { rx, scale }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 84 84"><rect width="84" height="84" rx="${rx}" fill="${TILE}"/><path d="${KPATH}" fill="${K}" transform="translate(42 42) scale(${scale}) translate(-46 -42)"/></svg>`;
const TARGETS = [['kalkifit-192.png', 192, { rx: 26, scale: 1 }], ['kalkifit-512.png', 512, { rx: 26, scale: 1 }], ['kalkifit-maskable-512.png', 512, { rx: 0, scale: 0.9 }], ['kalkifit-apple-180.png', 180, { rx: 0, scale: 1.1 }]];
for (const [name, size, o] of TARGETS) {
  const png = new Resvg(svg(size, o), { fitTo: { mode: 'width', value: size } }).render().asPng();
  fs.writeFileSync(path.join(OUT, name), png); console.log(name, size + 'x' + size, png.length + ' B');
}
