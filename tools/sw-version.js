/* kalki.uz — sw.js kesh versiyasini avtomatik yozadi.
 *
 * Versiya assets/ papkasidagi kod va ma'lumot fayllari mazmunining hash'idan
 * olinadi. Qo'lda oshiriladigan raqam ertami-kechmi unutiladi va shunda
 * foydalanuvchi brauzerida eski kod muzlab qoladi.
 *
 * Nega hash, nega o'suvchi raqam emas: hash IDEMPOTENT. Prerender ikki marta
 * ketma-ket bajarilganda natija bayt-bayt bir xil bo'lishi kerak; o'suvchi
 * raqam har yugurishda o'zgarib, bu talabni buzardi.
 *
 * HTML hash'ga KIRMAYDI: prerender HTML'ni qayta yozadi, ya'ni hash HTML'ga
 * bog'lansa har prerenderda versiya o'zgarib, cheksiz aylanish hosil bo'lardi.
 *
 *   node tools/sw-version.js          # tekshiradi, YOZMAYDI (nomos bo'lsa kod 1)
 *   node tools/sw-version.js --write  # yozadi (npm run ship)
 *
 * --check eski nom sifatida qabul qilinadi, standart holat bilan bir xil.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SW = path.join(ROOT, 'sw.js');
const ASSETS_DIR = path.join(ROOT, 'assets');
const WRITE = process.argv.indexOf('--write') > -1;

// Katta uchinchi tomon kutubxonalari hisobga olinmaydi: ular o'zgarmaydi va
// hash'ni behuda beqaror qiladi.
const SKIP = /^(docx\.umd|html2canvas|jspdf)/;

function hashAssets() {
  const h = crypto.createHash('sha1');
  const walk = (dir, rel) => {
    fs.readdirSync(dir).sort().forEach((name) => {
      const full = path.join(dir, name);
      const st = fs.statSync(full);
      if (st.isDirectory()) { walk(full, rel + name + '/'); return; }
      if (!/\.(js|css|json)$/.test(name)) return;   // rasm/SVG versiyani o'zgartirmaydi
      if (SKIP.test(name)) return;
      h.update(rel + name).update(fs.readFileSync(full));
    });
  };
  walk(ASSETS_DIR, '');
  return h.digest('hex').slice(0, 8);
}

const want = hashAssets();
const src = fs.readFileSync(SW, 'utf8');
const RE = /(const SW_VERSION = ')([^']*)(';\s*\/\* sw-version:auto \*\/)/;
const m = src.match(RE);
if (!m) {
  console.error('sw.js da "const SW_VERSION = \'...\'; /* sw-version:auto */" qatori topilmadi');
  process.exit(2);
}
const have = m[2];

if (have === want) {
  console.log('sw versiyasi o\'zgarmadi: ' + want);
  process.exit(0);
}
if (!WRITE) {
  console.log('sw versiyasi ESKI: ' + have + ' -> ' + want + '  (npm run ship)');
  process.exit(1);
}
fs.writeFileSync(SW, src.replace(RE, '$1' + want + '$3'), 'utf8');
console.log('sw versiyasi yangilandi: ' + (have || '(bo\'sh)') + ' -> ' + want);
