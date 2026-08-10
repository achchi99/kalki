/* kalki.uz — prerender barqarorligini tekshiradi.
 *
 * Natijani ikki marta hisoblab, bayt-bayt bir xilligini tasdiqlaydi.
 * Barqaror bo'lmasa prerender har yugurishda git'da keraksiz o'zgarish
 * yasaydi va diff'ni o'qib bo'lmay qoladi.
 *
 * DISKKA YOZMAYDI. Ilgari bu skript prerender.js ni ikki marta CHAQIRIB,
 * faylni haqiqatan qayta yozardi — ya'ni tekshiruv o'zi tekshirayotgan
 * narsani o'zgartirardi. Endi ikkinchi yugurish birinchisining natijasi
 * ustida, xotirada bajariladi.
 *
 *   node tools/prerender-twice.js kredit-kalkulyator.html
 *   node tools/prerender-twice.js --all
 */
'use strict';
const { renderOne, pages } = require('./prerender');

async function main() {
  const args = process.argv.slice(2);
  let names = args.filter((a) => a.charAt(0) !== '-');
  if (args.indexOf('--all') > -1) names = pages();
  if (!names.length) {
    console.log('foydalanish: node tools/prerender-twice.js <fayl.html> ... | --all');
    return 1;
  }

  let bad = 0;
  for (const n of names) {
    let a, b;
    try {
      a = (await renderOne(n)).out;
      b = (await renderOne(n, a)).out;      // ikkinchi yugurish birinchisi ustida
    } catch (e) {
      bad++; console.log('FAIL ' + n + ' ' + e.message); continue;
    }
    if (a === b) continue;
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
  }
  console.log(bad ? bad + ' faylda beqarorlik' : names.length + ' fayl: prerender barqaror');
  return bad ? 1 : 0;
}

main().then((c) => process.exit(c)).catch((e) => { console.error(e); process.exit(1); });
