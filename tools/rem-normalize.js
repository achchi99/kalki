#!/usr/bin/env node
/* kalki.uz — font-size: Npx -> rem (N/16) va typo tokenlari (--t-*: Npx -> rem). Brauzer matn o'lchami/zoom va "Katta" shrift
 * rejimi (html.fs-big { font-size: 115% }) ishlashi uchun. 16px ildizda natija o'zgarmaydi. Idempotent. `--write` bilan yozadi. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const write = process.argv.includes('--write');
const files = [];
for (const f of fs.readdirSync(root)) if (f.endsWith('.html')) files.push(f);
for (const f of fs.readdirSync(path.join(root, 'assets'))) if (f.endsWith('.js')) files.push('assets/' + f);
for (const f of fs.readdirSync(path.join(root, 'assets/css'))) if (f.endsWith('.css')) files.push('assets/css/' + f);
files.push('tools/site-chrome.js', 'ru/oila-byudjet-kalkulyator.html');
const rem = (v) => { const r = parseFloat(v) / 16; return (Math.round(r * 10000) / 10000) + 'rem'; };
let n = 0, nf = 0;
for (const f of files) {
  const p = path.join(root, f); let s = fs.readFileSync(p, 'utf8'), o = s;
  s = s.replace(/(font-size:\s*)(\d+(?:\.\d+)?)px/g, (m, a, v) => { nf++; return a + rem(v); });
  s = s.replace(/(font:[^;"'}]*?)(\d+(?:\.\d+)?)px(\/|\s|;|"|'|})/g, (m, a, v, b) => { nf++; return a + rem(v) + b; });
  if (f === 'assets/css/typo.css') s = s.replace(/(--t-(?:xs|s|m|ml|l|xl|2xl|3xl):)(\d+)px/g, (m, a, v) => { nf++; return a + rem(v); });
  if (s !== o) { n++; if (write) fs.writeFileSync(p, s); }
}
console.log((write ? 'yozildi' : 'o\'zgaradi') + ': fayl ' + n + ', qiymat ' + nf);
