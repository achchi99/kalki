#!/usr/bin/env node
/* kalki.uz — ikonkalarni bazaga ulash: data/ikonka-reja.txt dagi har slug uchun assets/ovqat/<slug>-128|256.webp bor bo'lsa, shu slug'ni ishlatadigan taom id'lari
 * assets/kalkifit-app.js dagi IKONKA-XARITA blokiga yoziladi (id → slug; «oila#variant» → slug). Qo'lda tahrir qilinmaydi.   node tools/ikonka-ula.js */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..');
const have = new Set(fs.readdirSync(path.join(ROOT, 'assets/ovqat')).filter((f) => /-256\.webp$/.test(f)).map((f) => f.replace(/-256\.webp$/, '')).filter((s) => fs.existsSync(path.join(ROOT, 'assets/ovqat', s + '-128.webp'))));
const rows = fs.readFileSync(path.join(ROOT, 'data/ikonka-reja.txt'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('|'));
const map = {}; let icons = 0;
for (const r of rows) { const slug = r[1].trim(); if (!have.has(slug)) continue; icons++; for (const id of r[3].trim().split(/\s+/)) { if (map[id]) throw new Error('ikki ikonka: ' + id); map[id] = slug; } }
const P = path.join(ROOT, 'assets/kalkifit-app.js'); let s = fs.readFileSync(P, 'utf8');
const i = s.indexOf('/* IKONKA-XARITA:BOSH'), j = s.indexOf('/* IKONKA-XARITA:OXIR */'); if (i < 0 || j < 0) throw new Error('IKONKA-XARITA bloki topilmadi');
const keys = Object.keys(map).sort(), body = '/* IKONKA-XARITA:BOSH — tools/ikonka-ula.js yozadi (data/ikonka-reja.txt + assets/ovqat dagi fayllar bo\'yicha); qo\'lda tahrir qilinmaydi */\n  var IKX = ' + JSON.stringify(Object.fromEntries(keys.map((k) => [k, map[k]]))).replace(/","/g, '","').replace(/,"/g, ',"') + ';\n  ';
s = s.slice(0, i) + body + s.slice(j); fs.writeFileSync(P, s);
console.log('ulandi: ' + icons + ' ikonka, ' + keys.length + ' taom/variant (assets/kalkifit-app.js IKONKA-XARITA)');
