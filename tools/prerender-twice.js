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
const { runInChunks } = require('./chunked');

/* Bo'lak hajmi: 8 (server xotirasiga qarab kamaytiring — KALKI_CHUNK
   muhit o'zgaruvchisi orqali, masalan KALKI_CHUNK=4 npm run ship).
   HAR BIR sahifaning ikkala renderi ('a' va 'b') O'ZINING chaqiruvi
   ICHIDA, ketma-ket, bitta yopiq funksiyada bajariladi — faqat
   SAHIFALAR ORASIDA parallellashtiriladi. Bu band 15ning butun
   maqsadini saqlaydi: har sahifa hali ham MUSTAQIL ikki marta
   qayta render qilinadi va natija bayt-bayt solishtiriladi — faqat
   qaysi sahifa qachon boshlanishi endi ketma-ket emas. Umumiy holat
   yo'q: har chaqiruv o'zining a/b o'zgaruvchilarini yopadi, boshqa
   sahifaning renderiga hech qanday bog'liqligi yo'q.

   DIQQAT: bu parallellashtirish faqat sahifalarning o'z ichki JS'idagi
   dinamik JSON-LD skript tartibi TUZATILGANDAN keyin xavfsiz (qarang:
   docs/tools.md "JSON-LD skript tartibi"). Tuzatishdan oldin xuddi shu
   parallellashtirish 28 sahifada yolg'on "beqaror" signal bergan edi. */
const CHUNK = Number(process.env.KALKI_CHUNK) || 8;

async function checkOne(n) {
  let a, b;
  try {
    a = (await renderOne(n)).out;
    b = (await renderOne(n, a)).out;      // ikkinchi yugurish birinchisi ustida
  } catch (e) {
    return { n, error: e.message };
  }
  return { n, a, b, same: a === b };
}

async function main() {
  const args = process.argv.slice(2);
  let names = args.filter((a) => a.charAt(0) !== '-');
  if (args.indexOf('--all') > -1) names = pages();
  if (!names.length) {
    console.log('foydalanish: node tools/prerender-twice.js <fayl.html> ... | --all');
    return 1;
  }

  const results = await runInChunks(names, CHUNK, checkOne);

  let bad = 0;
  for (const r of results) {
    if (r.error) { bad++; console.log('FAIL ' + r.n + ' ' + r.error); continue; }
    if (r.same) continue;
    bad++;
    const a = r.a, b = r.b;
    console.log('FARQ ' + r.n + ' — ' + a.length + ' vs ' + b.length);
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
