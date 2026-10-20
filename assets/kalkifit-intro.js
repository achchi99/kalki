/* kalki.uz — KalkiFit: «Qanday ishlaydi?» — 3 slayd. Onboarding'dan keyin BIR marta (yangi foydalanuvchi), Profil → «Qanday ishlaydi?» dan qayta, ?demo=1&intro=1 da.
 * Hech qachon qotib qolmaydi: «O'tkazib yuborish» doim ko'rinadi, Escape va tugmalar yopadi. Eski «tips» bilan bir vaqtda chiqmaydi (ilova: isOpen() tekshiriladi, slayddan keyin tips boshlanadi).
 * kalkifit-app.js dan OLDIN yuklanadi: window.KalkiIntroUI = { init, show, isOpen }. */
(function () {
  'use strict';
  var A = null, open = false, idx = 0, fin = null, last = null;
  var D = {
    uz: {
      inT1: "Ovqatni yozing — kaloriya o'zi hisoblanadi", inD1: 'Nomini yozing, porsiyani tanlang. Qolganini ilova hisoblaydi.',
      inT2: "Nima yeyishni bilmasangiz — so'rang", inD2: "«Bugun nima yeymiz?» kafe, buyurtma yoki uyda mos taomni ko'rsatadi.",
      inT3: 'Sevimli taomingizni yengillashtiring', inD3: "Retseptingizni yuboring — ta'mi qoladi, kaloriyasi 20–30% kamayadi.",
      inNext: 'Keyingi', inGo: 'Boshlash', inSkip: "O'tkazib yuborish", inOf: '{i}-slayd, {n} tadan', inM1: 'Osh · 1 kosa', inM2a: 'Kabob', inM2b: 'Suyuq ovqat', inM2c: 'Uyda', inM2: 'Bugun nima yeymiz?', inM3: 'Osh · 1 porsiya'
    },
    ru: {
      inT1: 'Запишите еду — калории посчитаются сами', inD1: 'Напишите название, выберите порцию. Остальное приложение посчитает.',
      inT2: 'Не знаете, что поесть — спросите', inD2: '«Что поесть сегодня?» подскажет блюдо в кафе, с доставкой или дома.',
      inT3: 'Облегчите любимое блюдо', inD3: 'Пришлите рецепт — вкус сохранится, калорий станет на 20–30% меньше.',
      inNext: 'Дальше', inGo: 'Начать', inSkip: 'Пропустить', inOf: 'Слайд {i} из {n}', inM1: 'Плов · 1 касса', inM2a: 'Кебаб', inM2b: 'Суп', inM2c: 'Дома', inM2: 'Что поесть сегодня?', inM3: 'Плов · 1 порция'
    }
  };
  function T(k, o) { return A.T(k, o); }
  function esc(s) { return A.esc(s); }
  var N = 3;
  function mock(i) {
    if (i === 0) return '<div class="in-mk"><div class="r"><span class="sl-ci">' + A.ico('plus') + '</span><span class="m"><b>' + esc(T('inM1')) + '</b><small>250 g</small></span><b class="k">475</b></div></div>';
    if (i === 1) return '<div class="in-mk"><b class="t">' + esc(T('inM2')) + '</b><div class="c"><span class="rz-chip on">' + esc(T('inM2a')) + '</span><span class="rz-chip">' + esc(T('inM2b')) + '</span><span class="rz-chip">' + esc(T('inM2c')) + '</span></div></div>';
    return '<div class="in-mk"><div class="r"><span class="sl-ci rt-ci">' + A.ico('rspark') + '</span><span class="m"><b>' + esc(T('inM3')) + '</b><small class="a"><s>827</s> → <b>613</b> ' + esc(A.T('kcal')) + '</small></span><b class="p">−26%</b></div></div>';
  }
  function html() {
    var dots = ''; for (var i = 0; i < N; i++) dots += '<i' + (i === idx ? ' class="on"' : '') + '></i>';
    var lastS = idx === N - 1;
    return '<div class="in-top"><button type="button" class="sl-txtbtn" data-act="inskip">' + esc(T('inSkip')) + '</button></div>' +
      '<div class="in-body" key="' + idx + '"><div class="in-art">' + mock(idx) + '</div><h2 class="in-h" id="inH">' + esc(T('inT' + (idx + 1))) + '</h2><p class="in-p">' + esc(T('inD' + (idx + 1))) + '</p></div>' +
      '<div class="in-foot"><span class="in-dots" role="img" aria-label="' + esc(T('inOf', { i: idx + 1, n: N })) + '">' + dots + '</span><button type="button" class="sl-main in-go" data-act="' + (lastS ? 'ingo' : 'innext') + '">' + esc(T(lastS ? 'inGo' : 'inNext')) + '</button></div>';
  }
  function lock(on) { ['#rzMain', '.rz-nav', '.rz-top'].forEach(function (s) { var e = A.$(s); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); }
  function draw(first) {
    var el = A.$('#rzIntro'); if (!el) return; el.innerHTML = html(); el.hidden = false;
    if (first) { el.setAttribute('tabindex', '-1'); try { el.focus({ preventScroll: true }); } catch (e) {} }      // fokus oynaning o'ziga (tugmada halqa chiqmasin)
  }
  function show(done) {
    if (open) return; var el = A.$('#rzIntro'); if (!el) return; open = true; idx = 0; fin = done || null; last = document.activeElement;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'inH'); lock(true); draw(true);
  }
  function close() {
    if (!open) return; open = false; var el = A.$('#rzIntro'); if (el) { el.hidden = true; el.innerHTML = ''; } lock(false);
    var f = fin; fin = null; if (last && last.focus) try { last.focus({ preventScroll: true }); } catch (e) {} if (f) f();
  }
  function act(a) {
    if (a === 'innext') { if (idx < N - 1) { idx++; draw(false); } return true; }
    if (a === 'ingo' || a === 'inskip') { close(); return true; }
    if (a === 'intro') { show(null); return true; }
    return false;
  }
  function init(api) {
    A = api; Object.keys(D).forEach(function (l) { Object.keys(D[l]).forEach(function (k) { api.D[l][k] = D[l][k]; }); });
    document.addEventListener('keydown', function (e) { if (open && e.key === 'Escape') { e.preventDefault(); close(); } });
  }
  window.KalkiIntroUI = { init: init, show: show, isOpen: function () { return open; }, act: act };
})();
