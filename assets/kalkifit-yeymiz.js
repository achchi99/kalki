/* kalki.uz — KalkiFit: «Bugun nima yeymiz?», «Baliq kuni» oynasi, «Yemaydiganlarim», «Boshqa variantlar» (interfeys). Hisob: assets/yeymiz-core.js, cheklov-core.js, baliq-uy-core.js; hisoblagich: hisob-kun.js.
 * kalkifit-app.js dan KEYIN emas, OLDIN yuklanadi va window.KalkiYeymizUI ni beradi; ilova init() da bog'laydi (api). Faqat IKKI kirish nuqtasi: «Boshqa variantlar» («O'rniga» kartasida) va «Bugun nima yeymiz?» kartasi. */
(function () {
  'use strict';
  var CH = window.KalkiCheklov, YC = window.KalkiYeymiz, BU = window.KalkiBaliqUy, OR = window.KalkiOrinbosar, HS = window.KalkiHisob;
  if (!CH || !YC || !BU || !OR) return;
  var CHIPS = ['kabob', 'suyuq', 'tandir', 'tez', 'baliq'], CHTAGS = ['baliq', 'tuxum', 'sut', 'yongoq', 'glyuten'];
  var D = {
    uz: {
      yzT: 'Bugun nima yeymiz?', yzC_kabob: 'Kabob', yzC_suyuq: 'Suyuq ovqat', yzC_tandir: 'Tandir', yzC_tez: 'Tez tayyor', yzC_baliq: 'Baliq', yzLeft: 'Bugun yana ≈ {k} kkal sig\'adi', yzOver: 'Bugungi me\'yor to\'lgan — eng yengil variantlar', yzNo: 'Bu guruhdan sizga mos taom topilmadi.', yzNoH: 'Qidiruvdan o\'zingiz tanlang.', yzSearch: 'Qidirish', yzKafe: 'kafe', yzUy: 'uyda', yzFacts: '{u} · {k} kkal · oqsil {p} g', yzFit: 'Qolgan kkaldan biroz ko\'p bo\'lishi mumkin.', yzKafeN: 'Kafe porsiyasi — taxminiy, joyga qarab farq qiladi.', yzAdd: 'Qo\'shish', yzHint: 'Bosing — porsiyani o\'zgartirasiz; «Qo\'shish» — shu porsiya bilan darrov yozadi.',
      ynT: 'Yemaydiganlarim', ynH: 'Belgilanganlar takliflarda chiqmaydi. Cho\'chqa go\'shti hech qachon taklif qilinmaydi.', yn_baliq: 'Baliq', yn_tuxum: 'Tuxum', yn_sut: 'Sut mahsuloti', yn_yongoq: 'Yong\'oq', yn_glyuten: 'Glyuten', obYq: 'Yemaydigan narsalaringiz bormi?', obYh: 'Ixtiyoriy. Belgilasangiz, takliflarda chiqmaydi. Keyin Profilda o\'zgartirasiz.', obYlink: 'Yemaydiganlarim bor (ixtiyoriy)', obYok: 'Tayyor',
      fwT: 'Baliq kuni', fwQ: 'Bugun baliq qanday bo\'lsin?', fw1: 'Buyurtma qilish', fw1h: 'Yetkazib berish xizmatida «baliq» deb qidiring', fw2: 'Kafe va choyxonada', fw2h: 'Nima yeganingizni shu yerda yozasiz', fw3: 'Uyda pishiraman', fw3h: 'Retsept, masalliqlar va xarid ro\'yxati', fwNo: 'Baliq yoqtirmayman', fwDay: 'Boshqa kun',
      fwOrdH: 'Tugmani bossangiz xizmat ochiladi. Qidiruvga «baliq» deb yozing.', fwOrdNote: 'Xizmat alohida oynada (tashqi sayt) ochiladi.', fwOrdNone: 'Havolalar hozir yuklanmadi. Internetni tekshirib, qayta urining.', fwOrdLog: 'Nima buyurtma qildingiz? Yozib qo\'ying', fwKH: 'Porsiyani o\'zingiz o\'zgartirasiz — raqamlar taxminiy.', fwUH: 'Qaysi usulda pishirasiz?', fwTime: 'Vaqt: {t}', fwK1: '1 kishiga ≈ {k} kkal',
      fwPeople: 'Necha kishiga?', fwMas: 'Masalliqlar', fwQad: 'Tayyorlash', fwCopy: 'Xarid ro\'yxatini nusxalash', fwShare: 'Ulashish', fwCopied: 'Xarid ro\'yxati nusxalandi', fwLog: 'Yedim — yozish', fwKcalN: '1 kishiga ≈ {k} kkal (taxminiy). Tuz, ziravor, limon kkalga kirmaydi.', fwBack: 'Orqaga',
      fwNoDone: 'Baliq endi takliflarda chiqmaydi', fwDayT: 'Baliq kuni qaysi kun?', fwDayH: 'Eslatma (yoqilgan bo\'lsa) shu kuni keladi.', fwDayDone: 'Baliq kuni o\'zgardi: {d}',
      bvT: 'Boshqa variantlar', bvOpen: 'Boshqa variantlar', bvF_oqsil: 'Oqsili ko\'proq', bvF_kam: 'Kaloriyasi kamroq', bvF_tam: 'Boshqa ta\'m', bvFor: 'Siz tanlagan: {n}', bvNone: 'Bu filtr bo\'yicha variant topilmadi.', bvD: 'oqsil {p} · {k} kkal'
    },
    ru: {
      yzT: 'Что поесть сегодня?', yzC_kabob: 'Кебаб', yzC_suyuq: 'Суп', yzC_tandir: 'Тандыр', yzC_tez: 'Быстро', yzC_baliq: 'Рыба', yzLeft: 'Сегодня ещё поместится ≈ {k} ккал', yzOver: 'Норма на сегодня выполнена — самые лёгкие варианты', yzNo: 'В этой группе не нашлось подходящего блюда.', yzNoH: 'Выберите через поиск.', yzSearch: 'Искать', yzKafe: 'кафе', yzUy: 'дома', yzFacts: '{u} · {k} ккал · белок {p} г', yzFit: 'Может немного превышать остаток.', yzKafeN: 'Порция в кафе — примерная, зависит от заведения.', yzAdd: 'Добавить', yzHint: 'Нажмите — измените порцию; «Добавить» — сразу запишет эту порцию.',
      ynT: 'Не ем', ynH: 'Отмеченное в предложениях не появится. Свинина не предлагается никогда.', yn_baliq: 'Рыба', yn_tuxum: 'Яйца', yn_sut: 'Молочное', yn_yongoq: 'Орехи', yn_glyuten: 'Глютен', obYq: 'Есть продукты, которые вы не едите?', obYh: 'По желанию. Отмеченное не будет предлагаться. Позже можно изменить в Профиле.', obYlink: 'Есть продукты, которые не ем (по желанию)', obYok: 'Готово',
      fwT: 'Рыбный день', fwQ: 'Как сегодня будет рыба?', fw1: 'Заказать', fw1h: 'Найдите «рыба» в сервисе доставки', fw2: 'В кафе и чайхане', fw2h: 'Запишите здесь, что съели', fw3: 'Приготовлю дома', fw3h: 'Рецепт, продукты и список покупок', fwNo: 'Не люблю рыбу', fwDay: 'Другой день',
      fwOrdH: 'Нажмите — откроется сервис. Введите в поиске «рыба».', fwOrdNote: 'Сервис откроется отдельно (внешний сайт).', fwOrdNone: 'Ссылки сейчас не загрузились. Проверьте интернет и повторите.', fwOrdLog: 'Что заказали? Запишите', fwKH: 'Порцию измените сами — цифры примерные.', fwUH: 'Как будете готовить?', fwTime: 'Время: {t}', fwK1: 'На 1 человека ≈ {k} ккал',
      fwPeople: 'На сколько человек?', fwMas: 'Продукты', fwQad: 'Приготовление', fwCopy: 'Скопировать список покупок', fwShare: 'Поделиться', fwCopied: 'Список покупок скопирован', fwLog: 'Съел — записать', fwKcalN: 'На 1 человека ≈ {k} ккал (примерно). Соль, специи и лимон в ккал не входят.', fwBack: 'Назад',
      fwNoDone: 'Рыба больше не предлагается', fwDayT: 'В какой день рыбный день?', fwDayH: 'Напоминание (если включено) придёт в этот день.', fwDayDone: 'Рыбный день изменён: {d}',
      bvT: 'Другие варианты', bvOpen: 'Другие варианты', bvF_oqsil: 'Больше белка', bvF_kam: 'Меньше калорий', bvF_tam: 'Другой вкус', bvFor: 'Вы выбрали: {n}', bvNone: 'По этому фильтру вариантов нет.', bvD: 'белок {p} · {k} ккал'
    }
  };
  var A = null, data = null, ch = null, bu = null, partners = null, ldState = 0, wait = [], pState = 0, yv = { chip: 'kabob' }, hs = null, WD = { uz: ['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Ya'], ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] };
  function T(k, o) { return A.T(k, o); }
  function esc(s) { return A.esc(s); }
  function loadJson(url, ok, fail) { fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(ok).catch(fail || function () {}); }
  function load(cb) {                                   // yeymiz.json + cheklov-teglar.json + baliq-uy.json (lazy; bir marta)
    if (ldState === 2) { if (cb) cb(); return; } if (cb) wait.push(cb); if (ldState === 1) return; ldState = 1;
    var left = 3, done = function () { if (--left) return; ldState = 2; var w = wait; wait = []; w.forEach(function (f) { f(); }); }, fail = function () { ldState = 0; wait = []; };
    loadJson('/data/yeymiz.json', function (j) { data = j; done(); }, fail); loadJson('/data/cheklov-teglar.json', function (j) { ch = j; done(); }, fail); loadJson('/data/baliq-uy.json', function (j) { bu = j; done(); }, fail);
  }
  function yemay() { var p = A.prefs().yemay; return Array.isArray(p) ? p : []; }
  function avoids(t) { return CH.toza(yemay()).indexOf(t) > -1; }
  function count(h, x) { if (hs) { try { hs.add(h, x); } catch (e) {} } }
  function lbl(o) { return A.lang() === 'ru' ? (o.ru || o.uz) : o.uz; }
  /* ---------- Yemaydiganlarim ---------- */
  function chipsHtml(sel, act) { return '<div class="sl-yn" role="group" aria-label="' + esc(T('ynT')) + '">' + CHTAGS.map(function (t) { var on = sel.indexOf(t) > -1; return '<button type="button" class="rz-chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-t="' + t + '" aria-pressed="' + on + '">' + esc(T('yn_' + t)) + '</button>'; }).join('') + '</div>'; }
  function profileCard() { return '<section class="rz-card sl-ync" id="ynCard"><div class="rz-st">' + esc(T('ynT')) + '</div><p class="rz-priv">' + esc(T('ynH')) + '</p>' + chipsHtml(yemay(), 'yntog') + '</section>'; }
  function setYemay(list) { A.prefs().yemay = list; A.save(); if (list.indexOf('baliq') > -1) A.prefs().baliqOff = true; A.pushResync(); }
  function toggleYemay(t) { var l = yemay().slice(), i = l.indexOf(t); if (i > -1) l.splice(i, 1); else l.push(t); setYemay(l); }
  /* ---------- filtr: O'rniga ---------- */
  function filterAlts(list) { if (ldState !== 2) { load(function () { A.render(); }); return yemay().length ? [] : list; } return list.filter(function (a) { return CH.ruxsat(ch, a.key, yemay()); }); }
  /* ---------- Bugun nima yeymiz? kartasi ---------- */
  function todayCard() {
    var cs = CHIPS.filter(function (c) { return !(c === 'baliq' && avoids('baliq')); });
    return '<section class="rz-card sl-ye" id="yeCard" aria-label="' + esc(T('yzT')) + '"><div class="sl-ye-t">' + esc(T('yzT')) + '</div><div class="sl-ye-chips" role="group" aria-label="' + esc(T('yzT')) + '">' + cs.map(function (c) { return '<button type="button" class="rz-chip" data-act="yechip" data-c="' + c + '">' + esc(T('yzC_' + c)) + '</button>'; }).join('') + '</div></section>';
  }
  function badge(p) { return '<span class="sl-kb' + (p.kafe ? '' : ' uy') + '">' + esc(T(p.kafe ? 'yzKafe' : 'yzUy')) + '</span>'; }
  function unitTxt(p) { var u = p.u && p.u !== 'g100' ? A.unitName(p.u) : ''; return (u ? (p.n > 1 ? p.n + ' ' : '') + u + ' ' : '') + p.g + ' ' + T('gram'); }
  function nameOfKey(p) { var f = A.foodById(p.id); if (!f) return p.id; var b = f.al ? (A.foodById(f.al.f) || f) : f, lb = p.v && b.fam ? A.S.famLabel(b, p.v, null, A.lang()) : ''; return A.nameOf(b) + (lb ? ' · ' + lb : ''); }
  function por(p) { return ' data-u="' + esc(p.u || '') + '" data-n="' + (p.n || 1) + '" data-g="' + (p.g || 0) + '"'; }
  function porOf(el) { return { u: el.getAttribute('data-u') || null, n: +el.getAttribute('data-n') || 1, g: +el.getAttribute('data-g') || 0 }; }
  function yRow(p) {
    return '<div class="sl-yr"><button type="button" class="sl-yr-b" data-act="yepick" data-k="' + esc(p.key) + '"' + por(p) + '>' + A.tileHtml(p.id, p.v, nameOfKey(p), 44) + '<span class="m"><span class="nm">' + esc(nameOfKey(p)) + ' ' + badge(p) + '</span><span class="tm">' + esc(T('yzFacts', { u: unitTxt(p), k: p.k, p: Math.round(p.p) })) + '</span></span></button><button type="button" class="sl-pill sl-yr-add" data-act="yeadd" data-k="' + esc(p.key) + '"' + por(p) + '>' + esc(T('yzAdd')) + '</button></div>';
  }
  function chipsRow() { var cs = CHIPS.filter(function (c) { return !(c === 'baliq' && avoids('baliq')); }); return '<div class="sl-ye-chips in" role="group">' + cs.map(function (c) { return '<button type="button" class="rz-chip' + (c === yv.chip ? ' on' : '') + '" data-act="yechip2" data-c="' + c + '" aria-pressed="' + (c === yv.chip) + '">' + esc(T('yzC_' + c)) + '</button>'; }).join('') + '</div>'; }
  function yHtml() {
    var rem = A.remaining(), r = YC.suggest({ by: A.by(), data: data, chip: yv.chip, tags: A.tags(), cheklov: ch, yemaydi: yemay(), qoldiq: rem });
    var left = rem == null ? '' : (rem >= 150 ? '<p class="rz-mut sm sl-yl">' + esc(T('yzLeft', { k: A.fmt(Math.round(rem / 10) * 10) })) + '</p>' : '<p class="rz-mut sm sl-yl">' + esc(T('yzOver')) + '</p>');
    var body = r.items.length ? r.items.map(yRow).join('') + (r.sigdi ? '' : '<p class="rz-priv">' + esc(T('yzFit')) + '</p>') + (r.items.some(function (p) { return p.kafe; }) ? '<p class="rz-priv">' + esc(T('yzKafeN')) + '</p>' : '') : '<div class="rz-empty"><b>' + esc(T('yzNo')) + '</b><p>' + esc(T('yzNoH')) + '</p></div><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="yesearch">' + esc(T('yzSearch')) + '</button></div>';
    yv.shown = r.items.map(function (p) { return p.key; });
    return A.shHead(T('yzT')) + chipsRow() + left + '<div class="sl-yrs">' + body + '</div>' + (r.items.length ? '<p class="rz-priv">' + esc(T('yzHint')) + '</p>' : '');
  }
  function openYeymiz(c) {
    if (c === 'baliq') { openFish(); return; }
    yv.chip = c; count('yeymiz_ochildi'); load(function () { A.withDb(function () { A.openSheet('yeymiz', yHtml()); }); });
  }
  function yBack() { A.withDb(function () { A.openSheet('yeymiz', yHtml()); }); }
  /* ---------- Baliq kuni oynasi ---------- */
  function fwHead(title, back) { return '<div class="sl-ph2">' + (back ? '<button type="button" class="sl-x" data-act="' + back + '" aria-label="' + esc(T('fwBack')) + '">' + A.ico('back') + '</button>' : '') + '<span class="sp"></span><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + A.ico('x') + '</button></div><h3 class="sl-fwt">' + esc(title) + '</h3>'; }
  function bigRow(act, ic, t1, t2) { return '<button type="button" class="rz-row sl-fwr" data-act="' + act + '">' + A.catIcon(ic) + '<span class="m"><b>' + esc(t1) + '</b><span>' + esc(t2) + '</span></span>' + A.ico('chev', 'r') + '</button>'; }
  function fishHtml() {
    return fwHead(T('fwT')) + '<p class="rz-p sl-fwq">' + esc(T('fwQ')) + '</p>' + bigRow('fw1', 'bowl', T('fw1'), T('fw1h')) + bigRow('fw2', 'bm', T('fw2'), T('fw2h')) + bigRow('fw3', 'book', T('fw3'), T('fw3h')) +
      '<div class="sl-fwf"><button type="button" class="sl-txtbtn" data-act="fwno">' + esc(T('fwNo')) + '</button><button type="button" class="sl-txtbtn" data-act="fwday">' + esc(T('fwDay')) + '</button></div>';
  }
  function openFish() { count('baliq_oyna_ochildi'); load(function () { A.withDb(function () { A.openSheet('fish', fishHtml()); }); }); }
  function loadPartners(cb) {
    if (pState === 2) { cb(); return; } loadJson('/assets/partners.json', function (j) {
      var now = new Date().toISOString().slice(0, 10), l = (j.partners || []).filter(function (p) { return p.active !== false && (p.categories || []).indexOf('yetkazish') > -1 && (!p.valid_until || String(p.valid_until) >= now); });
      partners = l.map(function (p) { return { id: p.id, name: lbl(p.name || {}) || p.id, url: p.url }; }); pState = 2; cb();
    }, function () { partners = []; cb(); });
  }
  function orderHtml() {
    var l = partners || [], links = l.map(function (p) { return '<a class="rz-btn primary full sl-ylink" data-act="yeorder" data-p="' + esc(p.id) + '" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.name) + ' ' + A.ico('share') + '</a>'; }).join('');
    return fwHead(T('fw1'), 'fwback') + '<p class="rz-p">' + esc(T('fwOrdH')) + '</p>' + (links ? '<div class="sl-ylinks">' + links + '</div><p class="rz-priv">' + esc(T('fwOrdNote')) + '</p>' : '<p class="rz-p warn">' + esc(T('fwOrdNone')) + '</p>') + '<button type="button" class="sl-txtbtn" data-act="fw2">' + esc(T('fwOrdLog')) + '</button>';
  }
  function fishKafe() { return YC.baliqKafe({ by: A.by(), data: data, cheklov: ch, yemaydi: yemay() }); }
  function kafeHtml() { var l = fishKafe(); return fwHead(T('fw2'), 'fwback') + '<p class="rz-p">' + esc(T('fwKH')) + '</p><div class="sl-yrs">' + l.map(function (p) { return yRow(p).replace('data-act="yeadd"', 'data-act="yeadd" data-fish="1"'); }).join('') + '</div><p class="rz-priv">' + esc(T('yzKafeN')) + '</p>'; }
  function uyHtml() {
    return fwHead(T('fw3'), 'fwback') + '<p class="rz-p">' + esc(T('fwUH')) + '</p>' + bu.retseptlar.map(function (r) { var p = YC.portion(A.by(), { birlik: {} }, r.taom); return '<button type="button" class="rz-row sl-fwr" data-act="fwrec" data-id="' + r.id + '">' + A.tileHtml(r.taom, null, lbl(r.nom), 44) + '<span class="m"><b>' + esc(lbl(r.nom)) + '</b><span>' + esc(T('fwTime', { t: lbl(r.vaqt) }) + (p ? ' · ' + T('fwK1', { k: p.k }) : '')) + '</span></span>' + A.ico('chev', 'r') + '</button>'; }).join('');
  }
  var rv = { id: null, n: 4 };
  function recipe(id) { return bu.retseptlar.filter(function (r) { return r.id === id; })[0]; }
  function recHtml() {
    var r = recipe(rv.id), L = A.lang() === 'ru' ? 'ru' : 'uz', mas = BU.masalliq(r, rv.n, L), p = YC.portion(A.by(), { birlik: {} }, r.taom);
    return fwHead(lbl(r.nom), 'fw3') + '<p class="rz-mut sm">' + esc(T('fwTime', { t: lbl(r.vaqt) })) + '</p>' +
      '<div class="rz-st">' + esc(T('fwPeople')) + '</div><div class="sl-stp" role="group" aria-label="' + esc(T('fwPeople')) + '"><button type="button" class="sl-pill" data-act="fwn" data-s="-1" aria-label="−"' + (rv.n <= 1 ? ' disabled' : '') + '>−</button><b id="fwN" aria-live="polite">' + rv.n + '</b><button type="button" class="sl-pill" data-act="fwn" data-s="1" aria-label="+"' + (rv.n >= 8 ? ' disabled' : '') + '>+</button></div>' +
      '<div class="rz-st">' + esc(T('fwMas')) + '</div><ul class="sl-mas" id="fwMas">' + mas.map(function (m) { return '<li><span>' + esc(m.n) + '</span><b>' + esc(m.text) + '</b></li>'; }).join('') + '</ul>' +
      '<div class="sl-fwb"><button type="button" class="rz-btn ghost sm" data-act="fwcopy">' + esc(T('fwCopy')) + '</button>' + (navigator.share ? '<button type="button" class="rz-btn ghost sm" data-act="fwshare">' + esc(T('fwShare')) + '</button>' : '') + '</div>' +
      '<div class="rz-st">' + esc(T('fwQad')) + '</div><ol class="sl-stps">' + r.qadamlar[L].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' + (p ? '<p class="rz-priv">' + esc(T('fwKcalN', { k: p.k })) + '</p>' : '') +
      '<div class="sl-cta"><button type="button" class="sl-main" data-act="fwlog" data-k="' + esc(r.taom) + '">' + esc(T('fwLog')) + '</button></div>';
  }
  function listText() { var r = recipe(rv.id); return BU.royxat(r, rv.n, A.lang() === 'ru' ? 'ru' : 'uz'); }
  function copyText(txt, ok) {
    var done = function () { A.toast(T('fwCopied'), null, true); if (ok) ok(); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt, done); }); else fallbackCopy(txt, done);
  }
  function fallbackCopy(txt, done) { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); } catch (e) {} }
  function dayHtml() {
    var cur = A.prefs().baliqKun; cur = YC.kunOk(cur == null ? 3 : cur); var L = A.lang() === 'ru' ? 'ru' : 'uz';
    return fwHead(T('fwDayT'), 'fwback') + '<p class="rz-p">' + esc(T('fwDayH')) + '</p><div class="sl-days" role="radiogroup" aria-label="' + esc(T('fwDayT')) + '">' + WD[L].map(function (n, i) { return '<button type="button" role="radio" class="rz-chip' + (i === cur ? ' on' : '') + '" aria-checked="' + (i === cur) + '" data-act="fwdayset" data-d="' + i + '">' + esc(n) + '</button>'; }).join('') + '</div>';
  }
  /* ---------- Boshqa variantlar ---------- */
  var vv = { f: 'oqsil' };
  function varHtml() {
    var s = A.orSrc(); if (!s) return '';
    var list = YC.variants({ by: A.by(), data: data, key: s.key, portion: s.sp, table: A.table(), tags: A.tags(), cheklov: ch, yemaydi: yemay(), filtr: vv.f }); vv.list = list;
    var f0 = A.foodById(OR.split(s.key).id), nm = f0 ? A.nameOf(f0.al ? (A.foodById(f0.al.f) || f0) : f0) : '';
    var rows = list.map(function (v, i) {
      var p = { id: v.id, v: v.v, key: v.key, kafe: v.kafe };
      return '<button type="button" class="sl-yr-b full" data-act="yevgo" data-i="' + i + '">' + A.tileHtml(v.id, v.v, nameOfKey(p), 44) + '<span class="m"><span class="nm">' + esc(nameOfKey(p)) + ' ' + badge(p) + '</span><span class="tm">' + esc(A.orDesc(v)) + '</span></span>' + A.ico('chev', 'r') + '</button>';
    }).join('');
    return '<div class="sl-ph2"><button type="button" class="sl-x" data-act="yevback" aria-label="' + esc(T('fwBack')) + '">' + A.ico('back') + '</button><span class="sp"></span><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + A.ico('x') + '</button></div><h3 class="sl-fwt">' + esc(T('bvT')) + '</h3>' +
      '<p class="rz-mut sm">' + esc(T('bvFor', { n: nm })) + '</p><div class="sl-ye-chips in" role="radiogroup">' + ['oqsil', 'kam', 'tam'].map(function (k) { return '<button type="button" role="radio" class="rz-chip' + (k === vv.f ? ' on' : '') + '" aria-checked="' + (k === vv.f) + '" data-act="yevf" data-f="' + k + '">' + esc(T('bvF_' + k)) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-yrs">' + (rows || '<div class="rz-empty"><b>' + esc(T('bvNone')) + '</b></div>') + '</div>' + (list.some(function (v) { return v.kafe; }) ? '<p class="rz-priv">' + esc(T('yzKafeN')) + '</p>' : '');
  }
  function openVariants() { load(function () { vv.f = 'oqsil'; A.setSheet(varHtml()); }); }
  function varBtn() { return '<button type="button" class="sl-txtbtn" data-act="yevopen">' + esc(T('bvOpen')) + '</button>'; }
  /* ---------- onboarding (ixtiyoriy ekran) ---------- */
  function obLink() { return '<button type="button" class="sl-txtbtn sl-obyl" data-act="obyn">' + esc(T('obYlink')) + '</button>'; }
  function obScreen(sel) { return '<div class="rz-ob-body"><h2 class="rz-q">' + esc(T('obYq')) + '</h2><p class="rz-p">' + esc(T('obYh')) + '</p>' + chipsHtml(sel, 'obyntog') + '<p class="rz-priv">' + esc(T('ynH')) + '</p></div><div class="rz-ob-foot"><button type="button" class="rz-btn primary" data-act="obynok">' + esc(T('obYok')) + '</button></div>'; }
  /* ---------- amallar ---------- */
  function act(a, el, ev) {
    switch (a) {
      case 'yechip': openYeymiz(el.getAttribute('data-c')); return true;
      case 'yechip2': { var c = el.getAttribute('data-c'); if (c === 'baliq') { openFish(); return true; } yv.chip = c; A.setSheet(yHtml()); return true; }
      case 'yepick': { var k = el.getAttribute('data-k'); count('yeymiz_tanlandi'); A.pickKey(k, 'y', porOf(el)); return true; }
      case 'yeadd': {
        var k2 = el.getAttribute('data-k'), fish = el.getAttribute('data-fish') === '1'; if (fish) count('baliq_kafe_yozildi'); else count('yeymiz_tanlandi'); A.logKey(k2, porOf(el)); return true;
      }
      case 'yesearch': A.openAdd({}); return true;
      case 'yntog': toggleYemay(el.getAttribute('data-t')); A.render(); return true;
      case 'obyn': A.obYn(true); return true;
      case 'obyntog': A.obYnToggle(el.getAttribute('data-t')); return true;
      case 'obynok': A.obYn(false); return true;
      case 'fw1': partnersThen(function () { A.setSheet(orderHtml()); }); return true;
      case 'yeorder': { count('baliq_buyurtma_bosildi', el.getAttribute('data-p')); if (A.openExternal(el.getAttribute('href')) && ev) ev.preventDefault(); return true; }
      case 'fw2': A.setSheet(kafeHtml()); return true;
      case 'fw3': A.setSheet(uyHtml()); return true;
      case 'fwback': A.setSheet(fishHtml()); return true;
      case 'fwrec': rv = { id: el.getAttribute('data-id'), n: BU.kishiOk(A.prefs().baliqKishi || bu.kishi.standart) }; count('baliq_uyda_ochildi'); A.setSheet(recHtml()); return true;
      case 'fwn': { rv.n = BU.kishiOk(Math.max(1, Math.min(8, rv.n + (+el.getAttribute('data-s'))))); A.prefs().baliqKishi = rv.n; A.save(); var sc = A.$('#rzSheet').scrollTop; A.setSheet(recHtml()); A.$('#rzSheet').scrollTop = sc; return true; }
      case 'fwcopy': copyText(listText()); return true;
      case 'fwshare': { var txt = listText(); if (navigator.share) navigator.share({ text: txt }).catch(function () {}); else copyText(txt); return true; }
      case 'fwlog': A.pickKey(el.getAttribute('data-k'), 'f'); return true;
      case 'fwno': { var prev = yemay().slice(), pb = A.prefs().baliqOff; setYemay(prev.indexOf('baliq') > -1 ? prev : prev.concat('baliq')); A.closeSheet(); A.render(); A.toast(T('fwNoDone'), function () { A.prefs().baliqOff = pb; setYemay(prev); A.render(); }, true); return true; }
      case 'fwday': A.setSheet(dayHtml()); return true;
      case 'fwdayset': { var d = +el.getAttribute('data-d'); A.prefs().baliqKun = d; A.save(); A.pushResync(); A.closeSheet(); A.render(); A.toast(T('fwDayDone', { d: WD[A.lang() === 'ru' ? 'ru' : 'uz'][d] }), null, true); return true; }
      case 'yevopen': openVariants(); return true;
      case 'yevf': vv.f = el.getAttribute('data-f'); A.setSheet(varHtml()); return true;
      case 'yevback': A.setSheet(A.portionHtml()); return true;
      case 'yevgo': { var it = vv.list && vv.list[+el.getAttribute('data-i')]; if (it) { count('orinbosar_tanlandi'); A.orApply(it); } return true; }
    }
    return false;
  }
  function partnersThen(cb) { loadPartners(cb); }
  function init(api) {
    A = api; Object.keys(D).forEach(function (l) { Object.keys(D[l]).forEach(function (k) { api.D[l][k] = D[l][k]; }); });
    hs = HS && HS.browser ? HS.browser() : null;
  }
  window.KalkiYeymizUI = { init: init, act: act, load: load, todayCard: todayCard, profileCard: profileCard, filterAlts: filterAlts, varBtn: varBtn, count: count, obLink: obLink, obScreen: obScreen, yBack: yBack, fishBack: function () { openFish(); }, openFish: openFish, avoids: avoids, yemay: yemay, kunBugun: function () { var k = A.prefs().baliqKun; return YC.kunOk(k == null ? 3 : k); }, badge: badge, chips: CHIPS, D: D };
})();
