/* kalki.uz → KalkiFit: kalkulyator NATIJASIDAN KEYINGI kontekstli blok (popup emas, natija ostida, faqat natija chiqqanda — CLS yo'q: foydalanuvchi bosgandan keyin paydo bo'ladi).
 *   KFBlok.show(el, joy, lang, { k })    — blokni to'ldiradi va ko'rsatadi (sessiyada 1 marta «ko'rsatildi» — assets/nav.js KFSayt)
 *   KFBlok.go(joy, lang, imp, cyr)       — kiritilgan qiymatlarni (jins, yosh, bo'y, vazn, faollik, maqsad) SHU BRAUZERGA (localStorage
 *                                          kalki_fit_import) yozadi va /kalkifit?utm_source=sayt-<joy>#boshlash ga o'tadi. URL'ga va serverga shaxsiy
 *                                          ma'lumot YOZILMAYDI. KalkiFit onboardingi uni bir marta ishlatib o'chiradi; mavjud foydalanuvchida ishlatilmaydi.
 * Joylar: kaloriya (kunlik me'yor), alkogol (ichimlik kaloriyasi). Matnlar UZ/RU (ЎЗ — sahifaning o'z translit'i). */
(function (w, d) {
  'use strict';
  var TX = {
    uz: { go: "KalkiFit'da davom etish", note: "Bepul · ro'yxatdan o'tmasdan · kiritganingiz qayta so'ralmaydi", alt: 'KalkiFit ilovasi: Bugun ekrani',
      kaloriya: { t: "Kunlik me'yoringiz: {k} kkal.", s: "Uni har kuni kuzatib boring — ovqatni rasm yoki ovoz bilan yozing." },
      alkogol: { t: "Bu ichimliklarda ≈ {k} kkal bor.", s: "Kunlik kaloriyangizga qo'shib boring — ovqat va ichimlikni KalkiFit'da bir joyda yozing." } },
    ru: { go: 'Продолжить в KalkiFit', note: 'Бесплатно · без регистрации · введённое не спросим повторно', alt: 'Приложение KalkiFit: экран «Сегодня»',
      kaloriya: { t: 'Ваша дневная норма: {k} ккал.', s: 'Следите за ней каждый день — записывайте еду фото или голосом.' },
      alkogol: { t: 'В этих напитках ≈ {k} ккал.', s: 'Учитывайте их в дневной норме — еду и напитки удобно записывать в KalkiFit.' } }
  };
  var CSS = '.kf-blok,.kf-blok p,.kf-blok b,.kf-blok span{color:#16211C!important;opacity:1!important}.kf-blok .kf-h{color:#1E6B45!important}.kf-blok p.kf-n{color:#526459!important}.kf-blok .kf-go,.kf-blok .kf-go *{color:#fff!important}'          // sahifa (yashil banner) matn ranglari ichkariga o'tmasin
    + '.kf-blok{display:grid;grid-template-columns:1fr auto;gap:4px 14px;align-items:center;margin-top:14px;background:#fff;color:#16211C;border:1px solid #DDE5E0;border-radius:14px;padding:14px;text-align:left}'
    + '.kf-blok[hidden]{display:none}.kf-blok .kf-h{display:flex;align-items:center;gap:8px;font-size:.8125rem;font-weight:800;color:#1E6B45;letter-spacing:.02em;grid-column:1}'
    + '.kf-blok .kf-h img{width:22px;height:22px;border-radius:6px}.kf-blok .kf-t{grid-column:1;font-size:1rem;line-height:1.4;margin:2px 0 0}.kf-blok .kf-t b{display:block;font-weight:800}'
    + '.kf-blok .kf-sh{grid-column:2;grid-row:1/span 3;width:64px;height:128px;border-radius:12px;border:1px solid #DDE5E0;object-fit:cover;object-position:top;background:#F1F2EE}'
    + '.kf-blok .kf-go{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:8px;min-height:48px;margin-top:10px;border:0;border-radius:12px;background:#1E6B45;color:#fff;font:inherit;font-size:1rem;font-weight:800;cursor:pointer;text-decoration:none}'
    + '.kf-blok .kf-go:hover{background:#17583A}.kf-blok .kf-go:focus-visible{outline:3px solid #D99A2B;outline-offset:2px}.kf-blok .kf-n{grid-column:1/-1;font-size:.8125rem;color:#526459;text-align:center;margin:2px 0 0}'
    + '@media (max-width:380px){.kf-blok{padding:12px;gap:4px 10px}.kf-blok .kf-sh{width:52px;height:104px}}';
  function css() { if (d.getElementById('kfBlokCss')) return; var s = d.createElement('style'); s.id = 'kfBlokCss'; s.textContent = CSS; d.head.appendChild(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nf(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function tx(lang) { return TX[lang === 'ru' ? 'ru' : 'uz']; }
  function html(joy, lang, o) {
    var L = tx(lang), J = L[joy] || L.kaloriya;
    return '<span class="kf-h"><img src="/assets/icons/kalkifit-192.png" width="22" height="22" alt="">KalkiFit</span>'
      + '<p class="kf-t"><b id="kfT">' + esc(J.t.replace('{k}', nf(o.k || 0))) + '</b>' + esc(J.s) + '</p>'
      + '<img class="kf-sh" src="/assets/kalkifit-mini.webp" width="64" height="128" alt="' + esc(L.alt) + '" loading="lazy" decoding="async">'
      + '<button type="button" class="kf-go" id="btnKalkiFit">' + esc(L.go) + ' ›</button><p class="kf-n">' + esc(L.note) + '</p>';
  }
  function show(el, joy, lang, o) {
    if (!el) return; css(); el.className = 'kf-blok'; el.setAttribute('data-kf-joy', joy); el.innerHTML = html(joy, lang, o || {}); el.hidden = false;
    try { if (w.KFSayt) w.KFSayt.kors(joy); } catch (e) {}
  }
  function go(joy, lang, imp, cyr) {
    try { var o = { from: joy, ts: Date.now() }; Object.keys(imp || {}).forEach(function (k) { if (imp[k] != null && imp[k] !== '' && !(typeof imp[k] === 'number' && !isFinite(imp[k]))) o[k] = imp[k]; }); w.localStorage.setItem('kalki_fit_import', JSON.stringify(o)); } catch (e) {}
    try { if (w.KFSayt) w.KFSayt.bos(joy); } catch (e) {}
    var u = (lang === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?' + (cyr ? 'lang=cyr&' : '') + 'utm_source=sayt-' + joy + '#boshlash';
    w.location.href = u;
  }
  w.KFBlok = { show: show, go: go, html: html, TX: TX };
})(window, document);
