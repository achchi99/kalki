#!/usr/bin/env node
/* kalki.uz — SERVER KALITI yordamchisi (gibrid rejim, B bosqich). Qo'llanma: docs/akkaunt-kalit.md
 *   node tools/akkaunt-kalit.js yarat [versiya]        yangi tasodifiy kalitni EKRANGA chiqaradi («versiya:kalit» + barmoq izi). Hech qayerga yozmaydi.
 *   AKKAUNT_MASTER_KEYS="..." node tools/akkaunt-kalit.js tekshir      env'dagi qiymatni tekshiradi: format, versiyalar, barmoq izlari (kalitning o'zini CHIQARMAYDI)
 *   node tools/akkaunt-kalit.js izi "<kalit>"           faqat bitta kalitning barmoq izi (zaxiradagi kalit to'g'ri ko'chirilganini tekshirish uchun)
 * Kalit faylga/repoga/chatga TUSHMAYDI. «yarat» natijasini to'g'ridan-to'g'ri parol menejeriga qo'ying va `wrangler pages secret put AKKAUNT_MASTER_KEYS` ga kiriting. */
'use strict';
const crypto = require('crypto');
const MIN = 43;
const izi = (k) => crypto.createHash('sha256').update('kalki-akkaunt-kalit|' + k).digest('hex').slice(0, 8);   // functions/_lib/akkaunt-kalit.js bilan bir xil
function parse(raw) {
  const out = [], seen = {};
  for (const part of String(raw || '').split(',')) { const m = /^\s*(\d{1,6}):([A-Za-z0-9_-]+)\s*$/.exec(part); if (!m) return { xato: 'Format noto\'g\'ri: «versiya:kalit» juftliklari vergul bilan (masalan 2:...,1:...)' }; const v = parseInt(m[1], 10); if (v < 1 || seen[v]) return { xato: 'Versiya musbat va takrorlanmas bo\'lishi kerak' }; if (m[2].length < MIN) return { xato: 'Versiya ' + v + ': kalit juda qisqa (kamida ' + MIN + ' belgi)' }; seen[v] = 1; out.push({ v, kalit: m[2] }); }
  return out.length ? { kalitlar: out } : { xato: 'Bo\'sh' };
}
function main(a) {
  const cmd = a[0];
  if (cmd === 'yarat') { const v = parseInt(a[1], 10) > 0 ? parseInt(a[1], 10) : 1, k = crypto.randomBytes(48).toString('base64url'); console.log(v + ':' + k + '\n\nBarmoq izi: ' + izi(k) + '\n(Barmoq izini kalit yonida yozib qo\'ying — kalit to\'g\'ri saqlanganini keyin shu bilan tekshirasiz.)'); return 0; }
  if (cmd === 'tekshir') { const r = parse(process.env.AKKAUNT_MASTER_KEYS); if (r.xato) { console.error('XATO: ' + r.xato); return 1; } console.log('OK: ' + r.kalitlar.length + ' ta kalit. Joriy versiya: ' + r.kalitlar[0].v); r.kalitlar.forEach((x, i) => console.log('  versiya ' + x.v + (i === 0 ? ' (joriy)' : ' (faqat ochish uchun)') + ' — barmoq izi ' + izi(x.kalit) + ', uzunligi ' + x.kalit.length)); return 0; }
  if (cmd === 'izi' && a[1]) { console.log(izi(String(a[1]).replace(/^\d+:/, ''))); return 0; }
  console.error('Foydalanish: node tools/akkaunt-kalit.js yarat [versiya] | tekshir | izi "<kalit>"'); return 2;
}
module.exports = { parse, izi };
if (require.main === module) process.exit(main(process.argv.slice(2)));
