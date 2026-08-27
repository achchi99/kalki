/* kalki.uz — kalkulyator <-> hujjat generatori o'rtasida ma'lumot uzatish.
 *
 * MUAMMO. Har bir sahifa yopiq orol edi: foydalanuvchi bitta hisobni
 * bajaradi va chiqib ketadi. Saytda ?p=base64 orqali holatni URL'ga
 * yozib uzatish mexanizmi allaqachon bor (har bir sahifaning o'z
 * urlshare skriptida) — bu fayl o'sha MEXANIZMNI qayta ishlatib,
 * sahifalar orasida bitta maydonni uzatadigan kichik "havola-kartochka"
 * ni bitta joydan (shu yerdan) beradi, har sahifaga nusxalanmaydi.
 *
 * QOIDA. Foydalanuvchi kiritmagan raqam manbasiz ko'rsatilmaydi: maqsad
 * sahifada to'ldirilgan maydon vizual ajratiladi va "qayerdan olindi"
 * izohi chiqadi, "Tozalash" tugmasi bilan.
 */
(function (w, d) {
  'use strict';

  var CSS = '.xlink-card{display:flex;align-items:center;gap:10px;margin-top:14px;background:#FBFCFB;'
    + 'border:1.5px solid #DDE5E0;border-radius:12px;padding:12px 14px;text-decoration:none;color:#16211C;'
    + 'transition:border-color .15s,background .15s}'
    + '.xlink-card:hover{background:#F2F5F3;border-color:#155E63}'
    + '.xlink-ic{font-size:19px;flex:none}'
    + '.xlink-t{flex:1;min-width:0;font-size:13.5px;font-weight:700;line-height:1.35}'
    + '.xlink-arrow{font-size:16px;color:#155E63;flex:none}'
    + '.xlink-banner{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 14px;'
    + 'background:#FBF3DD;border:1px solid #EFDCBB;border-radius:10px;padding:10px 13px;font-size:13px;'
    + 'font-weight:600;color:#5A4820}'
    + '.xlink-banner b{font-weight:800;color:#3E3212}'
    + '.xlink-banner button{margin-left:auto;border:0;background:transparent;color:#8A6D1F;font:inherit;'
    + 'font-size:12.5px;font-weight:800;text-decoration:underline;cursor:pointer;padding:2px}'
    + '.xlink-filled{background:#FFF4D9!important;transition:background 1.2s ease 1.5s}';

  // Guard faqat STYLE elementini yaratishni o'tkazib yuboradi — ikkinchi
  // marta chaqirilsa qayta qo'shilmaydi, lekin funksiyalarning o'zi
  // (renderCard, initTargetHighlight) baribir har chaqiriqda ishlaydi.
  function ensureCss() {
    if (d.getElementById('xlinkcss')) return;
    var st = d.createElement('style');
    st.id = 'xlinkcss';
    st.textContent = CSS;
    d.head.appendChild(st);
  }

  function lang() { return d.documentElement.lang === 'ru' ? 'ru' : 'uz'; }

  function attrEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function b64(json) {
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /* targetPath: masalan 'kredit-kalkulyator'. fields: {amount:'10000000'}.
     fromSlug: manba sahifa slugi — maqsad sahifada "qayerdan olindi"
     izohini ko'rsatish uchun oddiy (kodlanmagan) query parametr sifatida
     qo'shiladi, chunki u har doim ko'rinishi shart — havola nusxalab
     yuborilsa ham izoh ishlashi kerak. */
  function buildUrl(targetPath, fields, fromSlug) {
    var qp = 'p=' + b64(JSON.stringify({ i: fields }));
    if (fromSlug) qp += '&xfrom=' + encodeURIComponent(fromSlug);
    return targetPath + '?' + qp;
  }

  /* opts: {container, targetSlug, targetPath, fields, fromSlug, icon, uz, ru} */
  function renderCard(opts) {
    if (!opts || !opts.container) return;
    ensureCss();
    var id = 'xlcard-' + opts.targetSlug;
    var card = d.getElementById(id);
    var isNew = !card;
    if (isNew) {
      card = d.createElement('a');
      card.id = id;
      card.className = 'xlink-card noprint';
      opts.container.appendChild(card);
    }
    card.href = buildUrl(opts.targetPath, opts.fields, opts.fromSlug);
    card.innerHTML = '<span class="xlink-ic">' + (opts.icon || '🔗') + '</span>'
      + '<span class="xlink-t" data-xl-uz="' + attrEsc(opts.uz) + '" data-xl-ru="' + attrEsc(opts.ru) + '">'
      + attrEsc(lang() === 'ru' ? opts.ru : opts.uz) + '</span>'
      + '<span class="xlink-arrow">→</span>';
    // Event binding guard'dan TASHQARIDA — til almashganda yoki qayta
    // renderlanganda ham GA hodisasi ishlab turishi kerak.
    card.onclick = function () {
      try {
        if (typeof gtag === 'function') {
          gtag('event', 'cross_tool_click', { source: opts.fromSlug, target: opts.targetSlug });
        }
      } catch (e) {}
    };
    return card;
  }

  function removeCard(targetSlug) {
    var card = d.getElementById('xlcard-' + targetSlug);
    if (card) card.parentNode.removeChild(card);
  }

  var LABELS = {
    'mehnat-shartnomasi-namunasi': { uz: 'Mehnat shartnomasi', ru: 'Трудовой договор' },
    'ijara-shartnomasi-namunasi': { uz: 'Ijara shartnomasi', ru: 'Договор аренды' },
    'tilxat-namunasi': { uz: 'Tilxat', ru: 'Расписка' },
    'omonat-kalkulyator': { uz: 'Omonat kalkulyatori', ru: 'Депозитный калькулятор' },
    'tatil-puli-kalkulyator': { uz: "Ta'til puli kalkulyatori", ru: 'Калькулятор компенсации за отпуск' },
    'dekret-puli-kalkulyator': { uz: 'Dekret puli kalkulyatori', ru: 'Калькулятор декретных выплат' },
    'ishdan-boshatish-kompensatsiyasi-kalkulyator': { uz: "Ishdan bo'shatish kompensatsiyasi", ru: 'Калькулятор компенсации при увольнении' },
    'aliment-kalkulyator': { uz: 'Aliment kalkulyatori', ru: 'Калькулятор алиментов' }
  };

  /* Maqsad sahifada chaqiriladi: ?xfrom= bo'lsa, ko'rsatilgan
     maydonlarni vizual ajratadi va "qayerdan olindi" izohini chiqaradi.
     fieldIds: ['salary'] kabi — restoreFromUrl shu maydonlarni to'ldirgan
     bo'lishi kerak (bu fayl o'zi maydon to'ldirmaydi, faqat izohlaydi). */
  function initTargetHighlight(fieldIds) {
    try {
      var qs = new URLSearchParams(location.search);
      var from = qs.get('xfrom');
      if (!from) return;
      ensureCss();
      var ru = lang() === 'ru';
      var lbl = LABELS[from];
      var srcName = lbl ? (ru ? lbl.ru : lbl.uz) : from;

      var bar = d.getElementById('xlBanner');
      if (!bar) {
        bar = d.createElement('div');
        bar.id = 'xlBanner';
        bar.className = 'xlink-banner noprint';
        var host = d.querySelector('main.wrap') || d.body;
        host.insertBefore(bar, host.firstChild);
      }
      bar.innerHTML = '<span>' + (ru ? 'Сумма получена из ' : 'Summa manbasi: ') + '<b>' + attrEsc(srcName) + '</b>' + (ru ? '' : ' dan olindi') + '</span>'
        + '<button type="button" id="xlClearBtn">' + (ru ? 'Очистить' : 'Tozalash') + '</button>';
      d.getElementById('xlClearBtn').onclick = function () {
        if (bar.parentNode) bar.parentNode.removeChild(bar);
        for (var i = 0; i < fieldIds.length; i++) {
          var el = d.getElementById(fieldIds[i]);
          if (el) el.classList.remove('xlink-filled');
        }
        try {
          var url = new URL(location.href);
          url.searchParams.delete('xfrom');
          history.replaceState(null, '', url.toString());
        } catch (e2) {}
      };

      for (var j = 0; j < fieldIds.length; j++) {
        var f = d.getElementById(fieldIds[j]);
        if (f) f.classList.add('xlink-filled');
      }
    } catch (e) {}
  }

  w.KalkiCross = { buildUrl: buildUrl, renderCard: renderCard, removeCard: removeCard, initTargetHighlight: initTargetHighlight };
})(window, document);
