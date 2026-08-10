/* kalki.uz — prerender.
 *
 * Sahifani jsdom'da yuklaydi, ~950 ms kutadi va JS ishlagandan keyingi DOM'ni
 * qaytaradi. Maqsad: Googlebot sahifani statik holda ko'rsin.
 *
 * STANDART HOLATDA HECH NARSA YOZILMAYDI — natija diskdagi fayl bilan
 * solishtiriladi va farq bo'lsa chiqish kodi 1 bo'ladi. Sababi: o'zi
 * tekshirayotgan narsani tuzatib qo'yadigan vosita yolg'on xotirjamlik
 * beradi (ilgari verify-all shu sababdan "yiqildi, keyin o'zi tuzatdi"
 * holatiga tushgan). Yozish faqat aniq bayroq bilan.
 *
 *   node tools/prerender.js --all              # tekshiradi, yozmaydi
 *   node tools/prerender.js --all --write      # yozadi (npm run ship)
 *   node tools/prerender.js kredit-kalkulyator.html --write
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { load, loadHtml, ROOT } = require('./render');

/* Bir sahifaning prerender natijasini QAYTARADI (yozmaydi).
   htmlIn berilsa diskdan emas, o'sha matndan yuklanadi — prerender
   barqarorligini faylga tegmasdan tekshirish uchun. */
async function renderOne(name, htmlIn) {
  const file = path.join(ROOT, name);
  // shim bilan yuklaymiz: hamkor bloki haqiqatan to'ladi, so'ng quyidagi
  // data-prerender="skip" mantiqi uni bo'shatadi — ya'ni tozalash haqiqiy
  // sharoitda sinaladi, "fetch yo'q edi" degan tasodif hisobiga emas.
  const { dom, errors } = htmlIn == null
    ? await load(file, { shims: true })
    : await loadHtml(htmlIn, name, { shims: true });
  const doc = dom.window.document;

  // Prerender paytida qo'shilib qolishi mumkin bo'lgan GA teglari olib tashlanadi.
  doc.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]').forEach((s) => s.remove());

  // data-prerender="skip" konteynerlari ichi BO'SHATILADI (konteynerning o'zi
  // qoladi). Sababi: prerender JS ishlagandan keyingi DOM'ni yozadi, ya'ni
  // hamkor bloki HTML ichiga muzlab qolardi — JSON yangilansa ham sahifalarda
  // eski hamkorlar turaverar, muddati tugagan taklif abadiy qolar va Google
  // statik HTML'dagi sponsored havolalarni indekslardi.
  doc.querySelectorAll('[data-prerender="skip"]').forEach((el) => {
    el.innerHTML = '';
    el.setAttribute('hidden', '');
    el.removeAttribute('style');
  });

  // Prerender UZ holatini yozadi — RU faqat brauzerda tanlanadi.
  doc.documentElement.setAttribute('lang', 'uz');
  doc.documentElement.setAttribute('data-lang', 'uz');
  doc.documentElement.removeAttribute('data-lang-ready');

  // Fayl oxiridagi '\n' qayta o'qilganda parser uni <body> ichiga ko'chiradi,
  // shuning uchun har prerenderda bitta bo'sh qator to'planib borardi va
  // natija beqaror bo'lardi. Body oxiridagi bo'sh matn tugunlari olib tashlanadi.
  const body = doc.body;
  while (body && body.lastChild && body.lastChild.nodeType === 3 && !body.lastChild.data.trim()) {
    body.removeChild(body.lastChild);
  }

  const out = '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  dom.window.close();
  return { out, errors };
}

function pages() {
  return fs.readdirSync(ROOT)
    .filter((f) => f.endsWith('.html') && f !== 'yandex_5489ebe17687cac1.html').sort();
}

async function main() {
  const args = process.argv.slice(2);
  const WRITE = args.indexOf('--write') > -1;
  let names = args.filter((a) => a.charAt(0) !== '-');
  if (args.indexOf('--all') > -1) names = pages();
  if (!names.length) {
    console.log('foydalanish: node tools/prerender.js <fayl.html> ... | --all  [--write]');
    return 1;
  }

  let bad = 0, stale = 0;
  for (const n of names) {
    const file = path.join(ROOT, n);
    try {
      const r = await renderOne(n);
      if (r.errors.length) bad++;
      const cur = fs.readFileSync(file, 'utf8');
      const same = cur === r.out;
      if (!same) {
        stale++;
        if (WRITE) fs.writeFileSync(file, r.out, 'utf8');
      }
      const tag = r.errors.length ? 'ERR ' : (same ? 'OK  ' : (WRITE ? 'YOZ ' : 'ESKI'));
      console.log(tag + n + ' (' + r.out.length + ')'
        + (r.errors.length ? ' ' + JSON.stringify(r.errors.slice(0, 2)) : ''));
    } catch (e) { bad++; console.log('FAIL ' + n + ' ' + e.message); }
  }

  if (!WRITE && stale) {
    console.log('\n' + stale + ' fayl prerender natijasidan farq qiladi — npm run ship');
  }
  return (bad || (!WRITE && stale)) ? 1 : 0;
}

if (require.main === module) {
  main().then((code) => process.exit(code)).catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { renderOne, pages };
