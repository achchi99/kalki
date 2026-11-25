/* kalki.uz — KalkiFit: ism va nomlarni JORIY yozuvda ko'rsatish (v105). Saqlangan qiymat O'ZGARMAYDI — faqat ko'rsatish.
 * yozuv(s, rejim): rejim 'uz' (lotin) → kirillcha ism lotinga; 'ru' → lotincha ism ruscha kirillga; 'cyr' (ЎЗ) → o'zbekcha kirillga.
 * Ilova (assets/kalkifit-app.js: maslahatchi ismi) va push (functions/_lib/eslatma-qoida.js) bitta manbadan foydalanadi. Test: tools/dizayn/test-til-aralash.mjs */
(function (root, f) { if (typeof module === 'object' && module.exports) module.exports = f(); else root.KalkiIsm = f(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var CYR = /[А-Яа-яЁёЎўҚқҒғҲҳ]/, LAT = /[A-Za-z]/;
  /* kirill → o'zbek lotin (ruscha ism ham): Х so'z boshida — H (Холмс → Holms, Хасан → Hasan), ichida — x */
  var C2L = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: "'", ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: "o'", қ: 'q', ғ: "g'", ҳ: 'h' };
  function cyrLat(s) {
    return String(s).replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g, function (ch, i, all) {
      var lo = ch.toLowerCase(), up = ch !== lo, prev = i ? all.charAt(i - 1) : '', start = !prev || !/[А-Яа-яЁёЎўҚқҒғҲҳA-Za-z]/.test(prev), r = C2L[lo];
      if (lo === 'е' && start) r = 'ye'; if (lo === 'х' && start) r = 'h';
      if (r == null) return ch; return up ? r.charAt(0).toUpperCase() + r.slice(1) : r;
    });
  }
  /* lotin → ruscha kirill (ru rejimi): o'zbekcha harflar ruschaga yaqiniga (q → к, g' → г, o' → у, h/x → х) */
  var L2R = [["sh", 'ш'], ["ch", 'ч'], ["yo", 'ё'], ["yu", 'ю'], ["ya", 'я'], ["ye", 'е'], ["ts", 'ц'], ["o'", 'у'], ["g'", 'г']];
  var L1R = { a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'ж', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', x: 'х', y: 'й', z: 'з' };
  function latRu(s) {
    var out = '', t = String(s).replace(/[‘’ʻ`´]/g, "'"), i = 0;
    while (i < t.length) {
      var two = t.substr(i, 2), lo2 = two.toLowerCase(), hit = null; for (var k = 0; k < L2R.length; k++) if (L2R[k][0] === lo2) { hit = L2R[k][1]; break; }
      if (hit) { out += two.charAt(0) !== two.charAt(0).toLowerCase() ? hit.toUpperCase() : hit; i += 2; continue; }
      var ch = t.charAt(i), lo = ch.toLowerCase(), r = L1R[lo], prev = i ? t.charAt(i - 1) : '';
      if (lo === 'e' && (!prev || !/[A-Za-z]/.test(prev))) r = 'э';
      out += r == null ? ch : (ch !== lo ? r.toUpperCase() : r); i++;
    }
    return out.replace(/['’ʻ]/g, '');
  }
  /* rejim: 'uz' | 'cyr' | 'ru'. cyr — sahifa o'zi lotinni kirillga o'giradi (translit.js), shuning uchun kirillcha ism o'zgarmaydi, lotinchasi translit'ga qoladi (o: { translit } berilsa — shu yerda) */
  function yozuv(s, rejim, o) {
    s = String(s == null ? '' : s); if (!s) return s;
    if (rejim === 'ru') return LAT.test(s) && !CYR.test(s) ? latRu(s) : s;
    if (rejim === 'cyr') return LAT.test(s) && !CYR.test(s) && o && o.translit ? o.translit(s) : s;
    return CYR.test(s) && !LAT.test(s) ? cyrLat(s) : s;
  }
  return { yozuv: yozuv, cyrLat: cyrLat, latRu: latRu };
});
