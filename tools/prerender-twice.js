/* kalki.uz — prerender barqarorligini tekshiradi.
 *
 * Ikki marta ketma-ket prerender qilib, natija bayt-bayt bir xilligini
 * tasdiqlaydi. Barqaror bo'lmasa prerender har yugurishda git'da keraksiz
 * o'zgarish yasaydi va diff'ni o'qib bo'lmay qoladi.
 *
 *   node tools/prerender-twice.js kredit-kalkulyator.html
 *   node tools/prerender-twice.js --all
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let names = process.argv.slice(2);
if (names[0] === '--all') {
  names = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== 'yandex_5489ebe17687cac1.html').sort();
}
if (!names.length) { console.log('foydalanish: node tools/prerender-twice.js <fayl.html> ... | --all'); process.exit(1); }

function run(list) {
  execFileSync(process.execPath, [path.join(__dirname, 'prerender.js')].concat(list), { cwd: ROOT, stdio: 'ignore' });
}

run(names);
const first = names.map((n) => fs.readFileSync(path.join(ROOT, n), 'utf8'));
run(names);
const second = names.map((n) => fs.readFileSync(path.join(ROOT, n), 'utf8'));

let bad = 0;
names.forEach((n, i) => {
  const a = first[i], b = second[i];
  if (a === b) return;
  bad++;
  console.log('FARQ ' + n + ' — ' + a.length + ' vs ' + b.length);
  for (let k = 0; k < Math.max(a.length, b.length); k++) {
    if (a[k] !== b[k]) {
      console.log('     birinchi farq @ ' + k);
      console.log('     A: ' + JSON.stringify(a.slice(Math.max(0, k - 80), k + 60)));
      console.log('     B: ' + JSON.stringify(b.slice(Math.max(0, k - 80), k + 60)));
      break;
    }
  }
});
console.log(bad ? bad + ' faylda beqarorlik' : names.length + ' fayl: prerender barqaror');
process.exit(bad ? 1 : 0);
