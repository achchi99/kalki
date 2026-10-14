#!/usr/bin/env node
/* kalki.uz — qattiq yozilgan kichik shrift (<14px) va och-kulrang matn ranglarini tipografiya tokenlariga almashtiradi.
 * UZ manbalar (ildiz *.html, assets/*.js, assets/css/site.css, tools/site-chrome.js). RU/cyr — prerender --all.
 * Idempotent. `--write` bilan yozadi. */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const write = process.argv.includes('--write');
const files = [];
for (const f of fs.readdirSync(root)) if (f.endsWith('.html')) files.push(f);
for (const f of fs.readdirSync(path.join(root, 'assets'))) if (f.endsWith('.js')) files.push('assets/' + f);
files.push('assets/css/site.css', 'tools/site-chrome.js');
const FS = /(font-size:\s*)(\d+(?:\.\d+)?)px/g;
const COL = /((?:^|[;{"'\s])color:\s*)#(8A968F|93A099|7C8A83|A3ACA6|9AA8A0|5C6B63|6B7A72)\b/gi;
let n = 0, nf = 0, nc = 0;
for (const f of files) {
  const p = path.join(root, f); let s = fs.readFileSync(p, 'utf8'), o = s;
  s = s.replace(FS, (m, a, v) => { if (parseFloat(v) >= 14) return m; nf++; return a + 'var(--t-xs,14px)'; });
  s = s.replace(COL, (m, a) => { nc++; return a + 'var(--t-muted,#3F4F46)'; });
  if (s !== o) { n++; if (write) fs.writeFileSync(p, s); }
}
console.log((write ? 'yozildi' : 'o\'zgaradi') + ': fayl ' + n + ', shrift ' + nf + ', rang ' + nc);
