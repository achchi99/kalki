/* kalki.uz — prerender.
 *
 * Sahifani jsdom'da yuklaydi, ~950 ms kutadi va JS ishlagandan keyingi DOM'ni
 * faylga qaytarib yozadi. Maqsad: Googlebot sahifani statik holda ko'rsin.
 *
 * Foydalanish:
 *   node tools/prerender.js kredit-kalkulyator.html ipoteka-kalkulyator.html
 *   node tools/prerender.js --all
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { load, ROOT } = require('./render');

async function prerender(name) {
  const file = path.join(ROOT, name);
  // shim bilan yuklaymiz: hamkor bloki haqiqatan to'ladi, so'ng quyidagi
  // data-prerender="skip" mantiqi uni bo'shatadi — ya'ni tozalash haqiqiy
  // sharoitda sinaladi, "fetch yo'q edi" degan tasodif hisobiga emas.
  const { dom, errors } = await load(file, { shims: true });
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
  fs.writeFileSync(file, out, 'utf8');
  dom.window.close();
  return { errors, bytes: out.length };
}

(async () => {
  let names = process.argv.slice(2);
  if (names[0] === '--all') {
    names = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== 'yandex_5489ebe17687cac1.html').sort();
  }
  if (!names.length) { console.log('foydalanish: node tools/prerender.js <fayl.html> ... | --all'); return; }
  let bad = 0;
  for (const n of names) {
    try {
      const r = await prerender(n);
      if (r.errors.length) bad++;
      console.log((r.errors.length ? 'ERR ' : 'OK  ') + n + ' (' + r.bytes + ')'
        + (r.errors.length ? ' ' + JSON.stringify(r.errors.slice(0, 2)) : ''));
    } catch (e) { bad++; console.log('FAIL ' + n + ' ' + e.message); }
  }
  process.exit(bad ? 1 : 0);
})();
