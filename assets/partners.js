/* kalki.uz — hamkor havolalari bloki.
 *
 * Yagona manba: assets/partners.json. Havola hech qachon sahifa HTML'iga
 * qo'lda yozilmaydi — aks holda bir yildan keyin 46 ta sahifadagi havolani
 * yangilash imkonsiz bo'lib qoladi.
 *
 * Blokning asosiy mahsuloti — ko'rinish emas, O'LCHOV. Uchta hodisa yuboriladi:
 * partner_impression (haqiqatan ko'rilganda), partner_click (beacon bilan),
 * partner_empty (mos hamkor topilmaganda — qaysi yo'nalishda hamkor
 * yetishmayotganini ko'rsatadigan eng qimmatli signal).
 *
 * Prerender bilan to'qnashuv: konteynerda data-prerender="skip" turadi va
 * prerender skripti faylga yozishdan oldin uning ichini bo'shatadi. Shu sabab
 * diskdagi HTML'da hamkor havolasi umuman bo'lmaydi va JSON yangilanishi
 * barcha sahifalarda bir zumda ko'rinadi.
 */
(function (w, d) {
  'use strict';
  if (w.Partners) return;

  var JSON_URL = 'assets/partners.json';
  var UTM = 'utm_source=kalki.uz&utm_medium=referral';
  var MAX = 4;                 // 4 tadan ko'pi qaror qabul qilishni qiyinlashtiradi
  var SEEN_PREFIX = 'kalki_pi_';

  var T = {
    uz: {
      ad: 'Reklama',
      go: 'Bank saytida ko\'rish →',
      goGeneric: 'Rasmiy saytda ko\'rish →',
      disclaimer: 'Kalki.uz vositachi emas va foydalanuvchidan hech qanday to\'lov olmaydi. Shartlarni tashkilot rasmiy saytidan tekshiring.',
      checked: 'Ro\'yxat oxirgi marta {d} da tekshirilgan.',
      tipsTitle: 'Kredit olishdan oldin',
      tips: [
        'Turli banklarda shartlar har xil — kamida uchta banknig taklifini solishtiring.',
        'E\'lon qilingan foizdan tashqari komissiya, sug\'urta va boshqa to\'lovlarni ham so\'rang — haqiqiy yillik qiymat shulardan iborat.',
        'Oylik to\'lov daromadingizning 35 foizidan oshmagani ma\'qul.'
      ],
      partnerNote: 'Bu bo\'limda hamkor bo\'lish uchun: info@kalki.uz'
    },
    ru: {
      ad: 'Реклама',
      go: 'Смотреть на сайте банка →',
      goGeneric: 'Смотреть на официальном сайте →',
      disclaimer: 'Kalki.uz не является посредником и не берёт с пользователя никакой платы. Условия проверяйте на официальном сайте организации.',
      checked: 'Список последний раз проверен {d}.',
      tipsTitle: 'Перед оформлением кредита',
      tips: [
        'Условия в банках различаются — сравните предложения минимум трёх банков.',
        'Кроме заявленной ставки уточните комиссии, страховку и прочие платежи — реальная стоимость складывается из них.',
        'Ежемесячный платёж желательно не выше 35% дохода.'
      ],
      partnerNote: 'По вопросам партнёрства: info@kalki.uz'
    }
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function L(o, lang) { return o ? (o[lang] || o.uz || '') : ''; }
  function slug() {
    try { return (location.pathname || '').replace(/^\//, '').replace(/\.html$/, '') || 'index'; }
    catch (e) { return 'index'; }
  }
  function ss(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

  /* Hisob natijasi ORALIG'I yuboriladi, aniq summa emas: aniq summa
     foydalanuvchi ma'lumotini tashqariga chiqarish bo'lardi, oraliq esa
     "qaysi summadagi mijoz ko'proq bosadi" degan savolga javob beradi. */
  function bucket(amount) {
    var a = Number(amount) || 0;
    if (!a) return 'none';
    var M = 1000000;
    if (a < 10 * M) return '0-10mln';
    if (a < 50 * M) return '10-50mln';
    if (a < 100 * M) return '50-100mln';
    if (a < 300 * M) return '100-300mln';
    if (a < 1000 * M) return '300mln-1mlrd';
    return '1mlrd+';
  }

  function ga(name, params) {
    try { if (typeof w.gtag === 'function') w.gtag('event', name, params || {}); } catch (e) {}
  }

  function today() {
    var n = new Date();
    return n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  }
  function dayOfYear(now) {
    var n = now || new Date();
    return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000);
  }

  /* ---------- JSON ---------- */
  // Cloudflare keshi tufayli yangilanish soatlab ko'rinmay qolishi mumkin —
  // shuning uchun so'rov 'updated' sanasi bilan versiyalanadi. Birinchi so'rov
  // versiyasiz ketadi (biz 'updated' ni hali bilmaymiz), keyin kerak bo'lsa
  // versiyalangan nusxa qayta olinadi.
  var cache = null;
  function loadData() {
    if (cache) return cache;
    // fetch yo'q bo'lishi mumkin (eski brauzer). Bunda ham xato TASHLANMAYDI:
    // istisno calc() dan yuqoriga chiqib, kalkulyatorning o'zini buzardi.
    if (typeof w.fetch !== 'function' || typeof Promise === 'undefined') {
      cache = { then: function () { return cache; }, 'catch': function (f) { f(); return cache; } };
      return cache;
    }
    try {
      cache = w.fetch(JSON_URL, { credentials: 'omit' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) {
          if (!j || !Array.isArray(j.partners)) throw 0;
          return j;
        });
    } catch (e) {
      cache = Promise.reject(0);
    }
    return cache;
  }

  /* ---------- tanlash ---------- */
  function isLive(p, nowStr) {
    if (!p || p.active === false) return false;
    if (p.valid_until && String(p.valid_until) < nowStr) return false;   // muddati o'tgan taklif o'z-o'zidan yo'qoladi
    return true;
  }

  function matches(p, category, ctx) {
    if (!p.categories || p.categories.indexOf(category) === -1) return false;
    var m = p.match;
    if (!m) return true;                       // match bo'lmasa — kategoriyadagi har qanday natijada
    if (ctx) {
      var a = Number(ctx.amount) || 0;
      var t = Number(ctx.term) || 0;
      if (a) {
        if (m.amount_min != null && a < m.amount_min) return false;
        if (m.amount_max != null && a > m.amount_max) return false;
      }
      if (t) {
        if (m.term_min != null && t < m.term_min) return false;
        if (m.term_max != null && t > m.term_max) return false;
      }
      if (m.product && m.product.length && ctx.product) {
        if (m.product.indexOf(ctx.product) === -1) return false;
      }
    }
    return true;
  }

  /* Aylanma tartib. priority saqlanadi (to'lovli o'rin har doim yuqorida),
     lekin bir xil priority ichida yil kuni bo'yicha aylantiriladi — shunda
     har bir hamkor navbat bilan birinchi o'ringa chiqadi va solishtirma raqam
     halol bo'ladi. Aylanish deterministik: bir kun ichida hamma bir xil
     tartibni ko'radi, aks holda prerender va statistika beqaror bo'lardi. */
  function order(list, now) {
    var groups = {};
    list.forEach(function (p) {
      var k = String(p.priority == null ? 0 : p.priority);
      (groups[k] = groups[k] || []).push(p);
    });
    var keys = Object.keys(groups).sort(function (a, b) { return Number(b) - Number(a); });
    var shift = dayOfYear(now);
    var out = [];
    keys.forEach(function (k) {
      var g = groups[k].slice().sort(function (a, b) { return String(a.id) < String(b.id) ? -1 : 1; });
      var s = g.length ? shift % g.length : 0;
      out = out.concat(g.slice(s).concat(g.slice(0, s)));
    });
    return out;
  }

  function withUtm(p, category) {
    var url = String(p.url || '');
    // UTM har hamkor uchun alohida yoqiladi: ba'zi saytlar noma'lum GET
    // parametrlaridan xato beradi yoki ularni tozalab tashlaydi.
    if (!p.append_utm) return url;
    if (!url) return url;
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    return url + sep + UTM + '&utm_campaign=' + encodeURIComponent(category || 'partner');
  }

  /* ---------- chizish ---------- */
  function cardHtml(p, i, category, lang, t) {
    var paid = (p.type === 'paid' || p.type === 'affiliate');
    var rel = paid ? 'sponsored noopener' : 'nofollow noopener';
    // Tekshirilmagan tavsif KO'RSATILMAYDI. checker ham ogohlantiradi, lekin
    // himoya kodda ham turishi kerak: kelasi oy kimdir shoshib matn yozadi-yu,
    // note_verified bayrog'ini qo'yishni unutadi.
    var note = (p.note_verified === true) ? L(p.note, lang) : '';
    var logo = p.logo
      ? '<img class="pt-logo" src="' + esc(p.logo) + '" alt="" width="48" height="48" loading="lazy" decoding="async">'
      : '<span class="pt-logo pt-logo-blank" aria-hidden="true"></span>';
    return '<a class="pt-card" href="' + esc(withUtm(p, category)) + '"'
      + ' target="_blank" rel="' + rel + '"'
      + ' data-pt="' + esc(p.id) + '" data-pos="' + (i + 1) + '">'
      + logo
      + '<span class="pt-body">'
      + '<span class="pt-name">' + esc(L(p.name, lang)) + '</span>'
      + (note ? '<span class="pt-note">' + esc(note) + '</span>' : '')
      + '</span>'
      + (paid ? '<span class="pt-ad">' + esc(t.ad) + '</span>' : '')
      + '<span class="pt-go">' + esc(t.go) + '</span>'
      + '</a>';
  }

  function fallbackHtml(fb, lang, t) {
    if (!fb || !fb.url) return '';
    return '<a class="pt-card pt-fallback" href="' + esc(fb.url) + '" target="_blank" rel="nofollow noopener" data-pt="__fallback" data-pos="1">'
      + '<span class="pt-logo pt-logo-blank" aria-hidden="true"></span>'
      + '<span class="pt-body"><span class="pt-name">' + esc(L(fb.label, lang)) + '</span></span>'
      + '<span class="pt-go">' + esc(t.goGeneric) + '</span>'
      + '</a>';
  }

  /* Faol hamkor topilmaganda ba'zi kategoriyalarda (masalan kredit, ipoteka)
     bitta havolali kartochka o'rniga foydali qisqa maslahat bloki ko'rsatiladi
     — bo'sh reklama joyi emas, saytning o'z bilimi. Hamkor paydo bo'lganda
     (partners.json'da active:true) bu blok avtomatik ravishda kartochkaga
     bo'shab beradi, hech qanday kod o'zgarmaydi. */
  function richFallbackHtml(fb, lang, t) {
    var tipsHtml = '<ul class="pt-tips">'
      + t.tips.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('')
      + '</ul>';
    var linkHtml = (fb && fb.url)
      ? '<a class="pt-tips-link" href="' + esc(fb.url) + '" target="_blank" rel="nofollow noopener">' + esc(L(fb.label, lang)) + '</a>'
      : '';
    return '<h2 class="pt-h">' + esc(t.tipsTitle) + '</h2>'
      + tipsHtml
      + linkHtml
      + '<div class="pt-partner-note">' + esc(t.partnerNote) + '</div>';
  }

  /* ---------- o'lchov ---------- */
  var io = null;
  function observer() {
    if (io || !w.IntersectionObserver) return io;
    io = new w.IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          // 1 soniya ko'rinib tursa — haqiqiy impression
          if (el.__ptTimer) return;
          el.__ptTimer = w.setTimeout(function () { fireImpression(el); }, 1000);
        } else if (el.__ptTimer) {
          w.clearTimeout(el.__ptTimer);
          el.__ptTimer = null;
        }
      });
    }, { threshold: [0, 0.5, 1] });
    return io;
  }

  function fireImpression(el) {
    el.__ptTimer = null;
    var id = el.getAttribute('data-pt');
    var page = el.getAttribute('data-page') || slug();
    var key = SEEN_PREFIX + page + '_' + id;
    // Sessiyada bir marta: takroriy skroll CTR'ni sun'iy pasaytirmasin.
    if (ss(function () { return sessionStorage.getItem(key); }, '1')) return;
    ss(function () { sessionStorage.setItem(key, '1'); });
    ga('partner_impression', {
      partner: id,
      page: page,
      position: Number(el.getAttribute('data-pos')) || 0,
      category: el.getAttribute('data-cat') || ''
    });
    var o = observer();
    if (o) o.unobserve(el);
  }

  /* ---------- asosiy ---------- */
  function render(opts) {
    // Hamkor bloki hech qanday holatda sahifaning asosiy vazifasini buzmasin:
    // bu funksiya calc() oxiridan chaqiriladi va undan istisno chiqmasligi kerak.
    try { render_(opts); } catch (e) { try { hide(opts && opts.slot); } catch (e2) {} }
  }

  function render_(opts) {
    opts = opts || {};
    var slot = opts.slot;
    if (typeof slot === 'string') slot = d.querySelector(slot);
    if (!slot) return;

    var lang = (opts.lang === 'ru') ? 'ru' : 'uz';
    var t = T[lang];
    var category = opts.category || '';
    var ctx = opts.context || null;
    var page = opts.page || slug();

    // Konteyner belgilari — har chaqiruvda qo'yiladi (idempotent).
    slot.setAttribute('data-nosnippet', '');        // Google snippetga hamkor matnini olmasin
    slot.setAttribute('data-prerender', 'skip');    // prerender ichini bo'shatadi

    loadData().then(function (data) {
      var nowStr = today();
      var live = data.partners.filter(function (p) { return isLive(p, nowStr); });
      var hit = live.filter(function (p) { return matches(p, category, ctx); });
      var chosen = order(hit, opts._now).slice(0, MAX);

      var body = '';
      if (chosen.length) {
        body = chosen.map(function (p, i) { return cardHtml(p, i, category, lang, t); }).join('');
      } else {
        // Bo'sh blok saytni tashlandiq ko'rsatadi — kategoriya fallback'i qo'yiladi.
        var fb = (data.fallback || {})[category];
        ga('partner_empty', { page: page, category: category });
        // Ba'zi sahifalarda (kredit, ipoteka) bitta havola o'rniga foydali
        // maslahat bloki ko'rsatiladi — pastdagi umumiy sarlavha/ro'yxat
        // qobig'i emas, o'z qobig'iga ega bo'lgani uchun bu yerda chiqib ketadi.
        if (opts.richFallback) {
          slot.innerHTML = richFallbackHtml(fb, lang, t);
          slot.hidden = false;
          slot.style.display = '';
          return;
        }
        body = fallbackHtml(fb, lang, t);
        if (!body) { hide(slot); return; }
      }

      var checkedLine = '';
      if (data.updated) {
        checkedLine = '<div class="pt-checked">' + esc(t.checked.replace('{d}', data.updated)) + '</div>';
      }

      // Sarlavha ham shu yerda chiziladi: prerender konteyner ichini
      // bo'shatgani uchun statik HTML'da qolsa, hamkor yo'q paytda ham
      // osilib turgan bo'sh sarlavha ko'rinardi.
      var head = L(opts.title, lang);
      var extra = L(opts.footNote, lang);

      slot.innerHTML = (head ? '<h2 class="pt-h">' + esc(head) + '</h2>' : '')
        + '<div class="pt-list">' + body + '</div>'
        + (extra ? '<div class="pt-extra">' + esc(extra) + '</div>' : '')
        + '<div class="pt-disc">' + esc(t.disclaimer) + '</div>'
        + checkedLine;
      slot.hidden = false;
      slot.style.display = '';

      // Hodisa bog'lash HAR DOIM bajariladi — element mavjudligi tekshiruvi
      // faqat yaratishni o'tkazib yuborishi kerak, bog'lashni hech qachon emas.
      var cards = slot.querySelectorAll('.pt-card');
      var o = observer();
      for (var i = 0; i < cards.length; i++) {
        (function (el) {
          el.setAttribute('data-page', page);
          el.setAttribute('data-cat', category);
          el.addEventListener('click', function () {
            // Tashqi havola bosilganda brauzer sahifani darhol tark etadi va
            // oddiy usulda yuborilgan hodisa yo'lda uzilib qoladi — beacon shart.
            ga('partner_click', {
              partner: el.getAttribute('data-pt'),
              page: page,
              position: Number(el.getAttribute('data-pos')) || 0,
              category: category,
              bucket: bucket(ctx && ctx.amount),
              transport_type: 'beacon'
            });
          });
          if (o) o.observe(el); else fireImpression(el);
        })(cards[i]);
      }
    })['catch'](function () {
      // Xato foydalanuvchiga ham, konsolga ham chiqmaydi: hamkor bloki
      // yo'qligi sahifaning asosiy vazifasiga ta'sir qilmasligi kerak.
      hide(slot);
    });
  }

  function hide(slot) {
    if (typeof slot === 'string') slot = d.querySelector(slot);
    if (!slot) return;
    slot.innerHTML = '';
    slot.hidden = true;
  }

  w.Partners = { render: render, hide: hide, _bucket: bucket, _order: order, _matches: matches };
})(window, document);
