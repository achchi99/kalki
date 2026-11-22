#!/usr/bin/env node
/* KalkiFit «Lola» matnlari: data/maslahatchi-matn.json (manba: uz/ru × hazil/jiddiy × kalit → 5 variant) → assets/kalkifit-maslahat-matn.js (UMD, brauzer + node).
 * Qo'shimcha: node tools/maslahat-matn-yasa.js --qosh <fayl.json> ... — qismlarni manbaga birlashtiradi. Tekshiruv: tools/dizayn/test-maslahatchi.mjs */
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'data', 'maslahatchi-matn.json'), OUT = path.join(ROOT, 'assets', 'kalkifit-maslahat-matn.js');
let J = fs.existsSync(SRC) ? JSON.parse(fs.readFileSync(SRC, 'utf8')) : { uz: { hazil: {}, jiddiy: {} }, ru: { hazil: {}, jiddiy: {} } };
const a = process.argv.slice(2), qi = a.indexOf('--qosh');
if (qi >= 0) for (const f of a.slice(qi + 1)) { const P = JSON.parse(fs.readFileSync(f, 'utf8')); for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) Object.assign(J[L][m], P[L][m]); }
const sortO = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
for (const L of ['uz', 'ru']) for (const m of ['hazil', 'jiddiy']) J[L][m] = sortO(J[L][m]);
fs.writeFileSync(SRC, JSON.stringify(J, null, 1) + '\n');
fs.writeFileSync(OUT, "/* kalki.uz — KalkiFit «Lola» maslahatchisi matnlari (AVTO: tools/maslahat-matn-yasa.js, manba data/maslahatchi-matn.json — qo'lda tahrirlamang). uz/ru × hazil/jiddiy × kalit → variantlar */\n"
  + "(function (root, f) { if (typeof module === 'object' && module.exports) module.exports = f(); else root.KalkiMaslahatMatn = f(); })(typeof self !== 'undefined' ? self : this, function () { return " + JSON.stringify(J) + '; });\n');
const n = Object.keys(J.uz.hazil).length; console.log('kalitlar:', n, '→', path.relative(ROOT, OUT), Math.round(fs.statSync(OUT).size / 1024) + ' KB');
