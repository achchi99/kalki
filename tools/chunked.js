/* kalki.uz — bo'lakli parallel bajarish yordamchisi.
 *
 * 76-150 sahifani ketma-ket render qilish har biri ~950ms kutish bilan
 * (JS/animatsiya tinishi uchun) — bu kutish CPU emas, timer, shuning
 * uchun bir nechtasini BARAVAR kutish deyarli bepul. Bo'lak hajmi server
 * xotirasi bilan cheklanadi (har bir jsdom oynasi xotira talab qiladi,
 * shu serverda boshqa xizmatlar — Telegram botlar — ham ishlaydi).
 *
 * DIQQAT (2026-09): bu fayl bir marta yozilib, keyin BUTUNLAY qaytarilgan
 * edi — parallel render paytida ba'zi sahifalarda <head> ichidagi dinamik
 * JSON-LD skriptlar TARTIBI beqaror chiqqan (bc-ld/faq-ld/app-ld/art-ld
 * bir xil setTimeout kechikishida raqobatlashardi, appendChild HAR DOIM
 * head oxiriga qo'shgani uchun "kim oxirgi tugatdi" tasodifiy bo'lib
 * qolgan). Bu naqsh endi tools/prerender.js va tools/prerender-twice.js
 * ishlatgan HAR BIR sahifada TUZATILGAN (insertBefore + saqlangan
 * pozitsiya — batafsil: docs/tools.md "JSON-LD skript tartibi" bo'limi).
 * Shu tuzatishdan KEYIN qayta tiklandi, 3 marta butun sayt bo'yicha
 * (76 sahifa x 3 tur) parallel-barqarorlik testidan o'tkazilgan (0 ta
 * beqarorlik). Agar kelajakda YANGI sahifa/skript qo'shilsa va u
 * appendChild(head oxiriga)+setTimeout naqshini qayta ishlatsa — xuddi
 * shu sinf muammosi qaytishi mumkin, docs/tools.md'dagi tushuntirishga
 * qarang.
 *
 * runInChunks HAR BIR chaqiruvni MUSTAQIL ishga tushiradi (umumiy holat,
 * global o'zgaruvchi yo'q) — faqat NECHTASI bir vaqtda kutilayotganini
 * cheklaydi. Elementlar orasidagi tartibga bog'liqlik yo'q joyda xavfsiz.
 */
'use strict';

async function runInChunks(items, chunkSize, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map((item, j) => fn(item, i + j)));
    out.push(...results);
  }
  return out;
}

module.exports = { runInChunks };
