#!/usr/bin/env node
/* kalki.uz — /cyr/<sahifa> zaxira yo'naltirishlari (_redirects dagi «CYR-AUTO» bloki).
 * Statik /cyr/ nusxasi FAQAT pilot sahifalarda bor (cyr/*.html); qolgan sahifalarning ЎЗ varianti — o'sha sahifaning o'zi `?lang=cyr` bilan.
 * Eski HTML'da /cyr/ ichidagi NISBIY havolalar /cyr/<sahifa> ga yechilgan (Google shularni topgan, 404) — endi har biri 301 → /<sahifa>?lang=cyr.
 * Pilot sahifalar (cyr/ faylli) yo'naltirilmaydi (Pages yo'naltirishni statik fayldan OLDIN ishlatadi).   node tools/cyr-redirects.js [--write] */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const SKIP = new Set(['404', 'offline']);
const pilot = new Set(fs.readdirSync(path.join(ROOT, 'cyr')).filter((f) => /\.html$/.test(f)).map((f) => f.replace(/\.html$/, '')));
const slugs = fs.readdirSync(ROOT).filter((f) => /\.html$/.test(f)).map((f) => f.replace(/\.html$/, '')).filter((s) => !SKIP.has(s) && s !== 'index' && !pilot.has(s)).sort();
const BOSH = '# CYR-AUTO:BOSH — tools/cyr-redirects.js yozadi (qo\'lda tahrir qilinmaydi)\n', OXIR = '# CYR-AUTO:OXIR\n';
const block = BOSH + '/cyr /?lang=cyr 301\n/cyr/ /?lang=cyr 301\n/cyr/index /?lang=cyr 301\n' + slugs.map((s) => '/cyr/' + s + ' /' + s + '?lang=cyr 301').join('\n') + '\n' + OXIR;
const P = path.join(ROOT, '_redirects'); let s = fs.readFileSync(P, 'utf8');
const i = s.indexOf('# CYR-AUTO:BOSH'), j = s.indexOf('# CYR-AUTO:OXIR');
const next = i > -1 && j > -1 ? s.slice(0, i) + block + s.slice(j + OXIR.length) : s.replace(/\n*$/, '\n\n') + block;
if (process.argv.includes('--write')) { fs.writeFileSync(P, next); console.log('cyr-redirects: ' + slugs.length + ' sahifa → _redirects'); } else console.log(next === s ? 'cyr-redirects: joyida (' + slugs.length + ')' : 'cyr-redirects: ESKI — node tools/cyr-redirects.js --write');
process.exit(next === s || process.argv.includes('--write') ? 0 : 1);
