/* kalki.uz — KalkiFit: TANISHTIRUV — 3 ekran, har birida bitta katta jonli rasm (CSS animatsiya) va bitta jumla.
 * Birinchi ochilishda til tanlangandan KEYIN, profil savollaridan OLDIN (bir marta: localStorage kalki_intro_v2); Profil → «Tanishtiruvni qayta ko'rish»; ?demo=1&intro=1.
 *   1) ayting yoki suratga oling (ovoz · rasm · menyu)  2) qadam va suv o'zi hisoblanadi  3) har yakshanba — «Haftangiz» (hikoya kadri)
 * Hech qachon qotib qolmaydi: «O'tkazib yuborish» doim ko'rinadi, Escape va tugmalar yopadi; prefers-reduced-motion — animatsiyasiz.
 * kalkifit-app.js dan OLDIN yuklanadi: window.KalkiIntroUI = { init, show, isOpen, act }. */
(function () {
  'use strict';
  var A = null, open = false, idx = 0, fin = null, last = null;
  var D = {
    uz: {
      inT1: 'Nima yeganingizni ayting yoki suratga oling', inT2: "Qadamlar va suv o'zi hisoblanadi", inT2w: "Choy, sharbat va sho'rva ham suvga o'zi qo'shiladi", inT3: 'Har yakshanba: Haftangiz',
      inNext: 'Keyingi', inGo: 'Boshlash', inSkip: "O'tkazib yuborish", inOf: '{i}-ekran, {n} tadan',
      inM1: 'Osh · 1 kosa', inM1b: "Sho'rva · 1 kosa", inSay: "«bir kosa sho'rva va non»", inSt: 'qadam', inWt: 'Suv', inTea: '+ choy', inWk: 'Haftangiz', inWkA: "o'rtacha kkal/kun", inWkB: 'maqsadga yaqin kun'
    },
    ru: {
      inT1: 'Скажите или сфотографируйте, что вы съели', inT2: 'Шаги и вода считаются сами', inT2w: 'Чай, сок и суп сами добавляются к воде', inT3: 'Каждое воскресенье — «Ваша неделя»',
      inNext: 'Дальше', inGo: 'Начать', inSkip: 'Пропустить', inOf: 'Экран {i} из {n}',
      inM1: 'Плов · 1 тарелка', inM1b: 'Суп · 1 тарелка', inSay: '«тарелка супа и хлеб»', inSt: 'шагов', inWt: 'Вода', inTea: '+ чай', inWk: 'Ваша неделя', inWkA: 'ккал/день в среднем', inWkB: 'дней близко к цели'
    }
  };
  function T(k, o) { return A.T(k, o); }
  function esc(s) { return A.esc(s); }
  var N = 3;
  function android() { try { var K = window.KalkiNative; return !!(K && K.isApp && K.isApp() && K.qadam && K.qadam.ok && K.qadam.ok()); } catch (e) { return false; } }
  function art(i) {
    if (i === 0) return '<div class="in-a in-a1"><div class="in-trio"><span class="in-c mic">' + A.ico('mic') + '</span><span class="in-c">' + A.ico('cam') + '</span><span class="in-c">' + A.ico('img') + '</span></div>' +
      '<div class="in-say"><span class="in-wv" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span>' + esc(T('inSay')) + '</span></div>' +
      '<div class="in-rows"><div class="in-r r1"><b>' + esc(T('inM1b')) + '</b><span>180 ' + esc(A.T('kcal')) + '</span></div><div class="in-r r2"><b>' + esc(T('inM1')) + '</b><span>475 ' + esc(A.T('kcal')) + '</span></div></div></div>';
    if (i === 1) return '<div class="in-a in-a2">' + (android() ? '<div class="in-st"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" class="bg"/><circle cx="60" cy="60" r="50" class="fg" pathLength="100"/></svg><b>6 482</b><small>' + esc(T('inSt')) + '</small></div>' : '') +
      '<div class="in-gl"><div class="in-glass"><i class="wv"></i></div><b>' + esc(T('inWt')) + '</b><span class="in-tea">' + esc(T('inTea')) + '</span></div></div>';
    return '<div class="in-a in-a3"><div class="in-story"><div class="in-bars"><i class="on"></i><i></i><i></i><i></i></div><small>' + esc(T('inWk')) + '</small><b class="n">1 864</b><span>' + esc(T('inWkA')) + '</span><b class="n2">5 / 7</b><span>' + esc(T('inWkB')) + '</span></div></div>';
  }
  function title(i) { return i === 1 && !android() ? T('inT2w') : T('inT' + (i + 1)); }
  function html() {
    var dots = ''; for (var i = 0; i < N; i++) dots += '<i' + (i === idx ? ' class="on"' : '') + '></i>';
    var lastS = idx === N - 1;
    return '<div class="in-top"><button type="button" class="sl-txtbtn" data-act="inskip">' + esc(T('inSkip')) + '</button></div>' +
      '<div class="in-body" key="' + idx + '"><div class="in-art">' + art(idx) + '</div><h2 class="in-h" id="inH">' + esc(title(idx)) + '</h2></div>' +
      '<div class="in-foot"><span class="in-dots" role="img" aria-label="' + esc(T('inOf', { i: idx + 1, n: N })) + '">' + dots + '</span><button type="button" class="sl-main in-go" data-act="' + (lastS ? 'ingo' : 'innext') + '">' + esc(T(lastS ? 'inGo' : 'inNext')) + '</button></div>';
  }
  function lock(on) { ['#rzMain', '.rz-nav', '.rz-top', '#rzOnb'].forEach(function (s) { var e = A.$(s); if (e) { e.inert = on; if (on) e.setAttribute('aria-hidden', 'true'); else e.removeAttribute('aria-hidden'); } }); }
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
