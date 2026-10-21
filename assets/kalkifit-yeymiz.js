/* kalki.uz — KalkiFit: «Bugun nima yeymiz?» (har chip uchun BITTA umumiy oyna: Kafe va choyxonada · Buyurtma · Uyda; Baliq kuni ham shu komponent), «Yemaydiganlarim», «Boshqa variantlar» (interfeys).
 * Hisob: assets/yeymiz-core.js, cheklov-core.js, uyda-core.js; hisoblagich: hisob-kun.js. kalkifit-app.js dan OLDIN yuklanadi va window.KalkiYeymizUI ni beradi; ilova init() da bog'laydi (api).
 * Faqat IKKI kirish nuqtasi: «Boshqa variantlar» («O'rniga» kartasida) va «Bugun nima yeymiz?» kartasi (Bugun, «Ovqat qo'shish» ostida). */
(function () {
  'use strict';
  var CH = window.KalkiCheklov, YC = window.KalkiYeymiz, UY = window.KalkiUyda, OR = window.KalkiOrinbosar, HS = window.KalkiHisob;
  if (!CH || !YC || !UY || !OR) return;
  var CHIPS = ['kabob', 'suyuq', 'tandir', 'tez', 'baliq'], CHTAGS = ['baliq', 'tuxum', 'sut', 'yongoq', 'glyuten'], LSEG = 'kalki_fit_yseg';
  var D = {
    uz: {
      rhShow: "{n} ta taom yashirildi (yemaydiganlaringiz) · Ko'rsatish", rhHide: "{n} ta taom ko'rsatilmoqda (yemaydiganlaringiz) · Yashirish", rBadge: 'Yemaydiganlaringizda', rWarn: "Siz {x} yemaydiganlar ro'yxatiga qo'shgansiz", pCtaForce: "Baribir qo'shish · {k} kkal", ya_baliq: 'baliqni', ya_tuxum: 'tuxumni', ya_sut: 'sut mahsulotlarini', ya_yongoq: "yong'oqni", ya_glyuten: 'glyutenni',
      yzT: 'Bugun nima yeymiz?', yzDoorS: 'Kafe, buyurtma yoki uyda', yzC_kabob: 'Kabob', yzC_suyuq: 'Suyuq ovqat', yzC_tandir: 'Tandir', yzC_tez: 'Tez tayyor', yzC_baliq: 'Baliq',
      yzS_kafe: 'Kafe va choyxonada', yzS_buyurtma: 'Buyurtma', yzS_uyda: 'Uyda', yzKafe: 'kafe', yzUy: 'uyda', yzFacts: '{u} · {k} kkal · oqsil {p} g', yzAdd: 'Qo\'shish', yzMore: 'Yana ko\'rsatish',
      yzNote: 'Porsiya taxminiy — nomni bosib o\'zgartiring', yzF_oqsil: 'Oqsilga boy', yzF_yengil: 'Yengilroq', yzOsh: 'Bugungi limitdan oshadi', yzLeft: 'Bugun yana ≈ {k} kkal sig\'adi',
      yzNo: 'Bu yerda sizga mos taom topilmadi.', yzNoH: 'Qidiruvdan o\'zingiz tanlang.', yzSearch: 'Qidirish',
      yzOrdH: 'Yetkazib berish xizmatida «{q}» deb qidiring. Tugmani bossangiz so\'z nusxalanadi.', yzCopied: '«{q}» nusxalandi — ilovada qidiruvga qo\'ying', yzOrdList: 'Odatiy buyurtmalar (o\'rtacha porsiya)', yzOrdNone: 'Havolalar hozir yuklanmadi. Internetni tekshirib, qayta urining.', yzUyH: 'Qaysi usulda pishirasiz?',
      yzMeal_b: 'Nonushtaga yozildi', yzMeal_l: 'Tushlikka yozildi', yzMeal_d: 'Kechki ovqatga yozildi', yzMeal_s: 'Tamaddiga yozildi',
      yqT: 'Yemaydigan narsangiz bormi?', yqBel: 'Belgilash', yqNo: 'Yo\'q', obYwarn: 'Kafe taomlari tarkibi joyga qarab farq qiladi — allergiyangiz bo\'lsa, buyurtmada so\'rang.',
      ynT: 'Yemaydiganlarim', ynH: 'Belgilanganlar takliflarda chiqmaydi.', yn_baliq: 'Baliq', yn_tuxum: 'Tuxum', yn_sut: 'Sut mahsuloti', yn_yongoq: 'Yong\'oq', yn_glyuten: 'Glyuten', obYq: 'Yemaydigan narsalaringiz bormi?', obYh: 'Ixtiyoriy. Belgilasangiz, takliflarda chiqmaydi. Keyin Profilda o\'zgartirasiz.', obYlink: 'Yemaydiganlarim bor (ixtiyoriy)', obYok: 'Tayyor',
      fwT: 'Baliq kuni', fwNo: 'Baliq yoqtirmayman', fwDay: 'Boshqa kun', fwTime: 'Vaqt: {t}', fwK1: '1 kishiga ≈ {k} kkal', fwPeople: 'Necha kishiga?', fwMas: 'Masalliqlar', fwQad: 'Tayyorlash', fwCopy: 'Xarid ro\'yxatini nusxalash', fwShare: 'Ulashish', fwCopied: 'Xarid ro\'yxati nusxalandi', fwLog: 'Yedim — yozish', fwKcalN: '1 kishiga ≈ {k} kkal (taxminiy). Tuz, ziravor, limon kkalga kirmaydi.', fwBack: 'Orqaga',
      fwNoDone: 'Baliq endi takliflarda chiqmaydi', fwDayT: 'Baliq kuni qaysi kun?', fwDayH: 'Eslatma (yoqilgan bo\'lsa) shu kuni keladi.', fwDayDone: 'Baliq kuni o\'zgardi: {d}', fwDayRow: 'Eslatma kuni',
      bvT: 'Boshqa variantlar', bvOpen: 'Boshqa variantlar', bvF_oqsil: 'Oqsili ko\'proq', bvF_kam: 'Kaloriyasi kamroq', bvF_tam: 'Boshqa ta\'m', bvFor: 'Siz tanlagan: {n}', bvNone: 'Bu filtr bo\'yicha variant topilmadi.'
    },
    ru: {
      rhShow: 'Скрыто блюд: {n} («Не ем») · Показать', rhHide: 'Показано блюд: {n} («Не ем») · Скрыть', rBadge: 'В «Не ем»', rWarn: 'Вы добавили в «Не ем»: {x}', pCtaForce: 'Всё равно добавить · {k} ккал', ya_baliq: 'рыба', ya_tuxum: 'яйца', ya_sut: 'молочные продукты', ya_yongoq: 'орехи', ya_glyuten: 'глютен',
      yzT: 'Что поесть сегодня?', yzDoorS: 'Кафе, заказ или дома', yzC_kabob: 'Кебаб', yzC_suyuq: 'Суп', yzC_tandir: 'Тандыр', yzC_tez: 'Быстро', yzC_baliq: 'Рыба',
      yzS_kafe: 'Кафе и чайхана', yzS_buyurtma: 'Заказ', yzS_uyda: 'Дома', yzKafe: 'кафе', yzUy: 'дома', yzFacts: '{u} · {k} ккал · белок {p} г', yzAdd: 'Добавить', yzMore: 'Показать ещё',
      yzNote: 'Порция примерная — нажмите на название', yzF_oqsil: 'Много белка', yzF_yengil: 'Полегче', yzOsh: 'Превышает дневной лимит', yzLeft: 'Сегодня ещё поместится ≈ {k} ккал',
      yzNo: 'Подходящих блюд здесь не нашлось.', yzNoH: 'Выберите через поиск.', yzSearch: 'Искать',
      yzOrdH: 'Найдите «{q}» в сервисе доставки. По нажатию слово копируется.', yzCopied: '«{q}» скопировано — вставьте в поиск приложения', yzOrdList: 'Частые заказы (средняя порция)', yzOrdNone: 'Ссылки сейчас не загрузились. Проверьте интернет и повторите.', yzUyH: 'Как будете готовить?',
      yzMeal_b: 'Записано на завтрак', yzMeal_l: 'Записано на обед', yzMeal_d: 'Записано на ужин', yzMeal_s: 'Записано на перекус',
      yqT: 'Есть что-то, что вы не едите?', yqBel: 'Отметить', yqNo: 'Нет', obYwarn: 'Состав блюд в кафе зависит от заведения — при аллергии уточняйте при заказе.',
      ynT: 'Не ем', ynH: 'Отмеченное в предложениях не появится.', yn_baliq: 'Рыба', yn_tuxum: 'Яйца', yn_sut: 'Молочное', yn_yongoq: 'Орехи', yn_glyuten: 'Глютен', obYq: 'Есть продукты, которые вы не едите?', obYh: 'По желанию. Отмеченное не будет предлагаться. Позже можно изменить в Профиле.', obYlink: 'Есть продукты, которые не ем (по желанию)', obYok: 'Готово',
      fwT: 'Рыбный день', fwNo: 'Не люблю рыбу', fwDay: 'Другой день', fwTime: 'Время: {t}', fwK1: 'На 1 человека ≈ {k} ккал', fwPeople: 'На сколько человек?', fwMas: 'Продукты', fwQad: 'Приготовление', fwCopy: 'Скопировать список покупок', fwShare: 'Поделиться', fwCopied: 'Список покупок скопирован', fwLog: 'Съел — записать', fwKcalN: 'На 1 человека ≈ {k} ккал (примерно). Соль, специи и лимон в ккал не входят.', fwBack: 'Назад',
      fwNoDone: 'Рыба больше не предлагается', fwDayT: 'В какой день рыбный день?', fwDayH: 'Напоминание (если включено) придёт в этот день.', fwDayDone: 'Рыбный день изменён: {d}', fwDayRow: 'День напоминания',
      bvT: 'Другие варианты', bvOpen: 'Другие варианты', bvF_oqsil: 'Больше белка', bvF_kam: 'Меньше калорий', bvF_tam: 'Другой вкус', bvFor: 'Вы выбрали: {n}', bvNone: 'По этому фильтру вариантов нет.'
    }
  };
  /* toifa ikonkalari (rasmi yo'q taomlar uchun): six · kosa · tandir · lavash · baliq; segmentlar: vilka-pichoq · sumka · uy */
  var ICONS = {
    zfork: 'M7 3v7a2 2 0 0 0 4 0V3 M9 3v18 M17 3c-2.500 2-3 5-3 8h3v10', zbag: 'M6 8h12l-1 12H7z M9 8V7a3 3 0 0 1 6 0v1', zhome: 'M4 11l8-7 8 7 M6 10v10h12V10 M10 20v-5h4v5',
    zsix: 'M3 21L21 3 M8 12l4 4 M11 9l4 4 M14 6l4 4', zbowl: 'M4 11h16a8 8 0 0 1-16 0z M9 7c0-1 1-1 1-2 M13 7c0-1 1-1 1-2', ztandir: 'M5 21h14 M7 21V11a5 5 0 0 1 10 0v10 M9 15h6', zlavash: 'M5 8c0-2 3-4 7-4s7 2 7 4v8c0 2-3 4-7 4s-7-2-7-4z M5 8c0 2 3 4 7 4s7-2 7-4', zfish: 'M3 12c4-6 11-6 15 0-4 6-11 6-15 0z M18 12l3-3v6z M8 11h.01'
  };
  var IKON = {};      // taom id → ikonka (toifadan); data yuklanmasa ham kerak bo'ladigan taomlar ro'yxati qo'lda saqlanadi (test data/yeymiz.json va uyda.json bilan solishtiradi)
  (function () { var m = { zsix: 'kafe-tovuq-shashlik kafe-qoy-shashlik kafe-lyulya kafe-mol-shashlik kafe-tovuq-qanot kafe-jigar-kabob kafe-jiz kafe-qovurga kafe-baliq-shashlik kafe-sabzavot-shashlik uy-tovuq-shashlik uy-lyulya kafe-tovuq-son-grill',
    zbowl: 'kafe-shurva kafe-mastava kafe-lagmon-qoy kafe-moshxorda kafe-chuchvara-shorva kafe-tovuq-shurva kafe-lagmon-tovuq kafe-kartoshka-shurva kafe-baliq-shurva uy-tovuq-shurva mastava moshxorda', ztandir: 'tandir-gosht kafe-tandir-tovuq kafe-tandir-kabob somsa uy-tovuq-duxovka uy-qoy-duxovka',
    zlavash: 'lavash-tovuq doner burger hotdog-mol hotdog-tovuq sendvich qoymoq tuxum omlet-sabzavot uy-lavash-tovuq', zfish: 'kafe-sazan-qovurma kafe-losos-steyk sazan-qovurma sazan-grill sazan-duxovka baliq-shurva baliq-dimlama' };
    Object.keys(m).forEach(function (ic) { m[ic].split(' ').forEach(function (id) { IKON[id] = ic; }); }); })();
  var A = null, data = null, ch = null, uy = null, partners = null, ldState = 0, wait = [], pState = 0, hs = null, WD = { uz: ['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Ya'], ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] };
  var WDF = { uz: ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba'], ru: ['понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу', 'воскресенье'] };
  var yv = { toifa: 'kabob', seg: 'kafe', open: {}, f: 'oqsil' };
  function T(k, o) { return A.T(k, o); }
  function esc(s) { return A.esc(s); }
  function L() { return A.lang() === 'ru' ? 'ru' : 'uz'; }
  function loadJson(url, ok, fail) { fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(ok).catch(fail || function () {}); }
  var chState = 0, chWait = [];
  function chReady() { return chState === 2; }
  function loadCh(cb) {                                 // faqat cheklov-teglar.json (ovqat qo'shish ro'yxatlari uchun yengil)
    if (chState === 2) { if (cb) cb(); return; } if (cb) chWait.push(cb); if (chState === 1) return; chState = 1;
    loadJson('/data/cheklov-teglar.json', function (j) { ch = j; chState = 2; var w = chWait; chWait = []; w.forEach(function (f) { f(); }); }, function () { chState = 0; chWait = []; });
  }
  function load(cb) {                                   // yeymiz.json + cheklov-teglar.json + uyda.json (lazy; bir marta)
    if (ldState === 2) { if (cb) cb(); return; } if (cb) wait.push(cb); if (ldState === 1) return; ldState = 1;
    var left = 3, done = function () { if (--left) return; ldState = 2; var w = wait; wait = []; w.forEach(function (f) { f(); }); }, fail = function () { ldState = 0; wait = []; };
    loadJson('/data/yeymiz.json', function (j) { data = j; done(); }, fail); loadCh(done); loadJson('/data/uyda.json', function (j) { uy = j; done(); }, fail);
  }
  /* ---------- «Yemaydiganlarim» — ovqat ro'yxatlari uchun YAGONA qoida (cho'chqa: hech qayerda; tanlangan teglar: yashiriladi/belgilanadi/ogohlantiriladi) ---------- */
  function keysOf(f, vr) { var id = f.al ? f.al.f : f.id, v = vr || (f.al ? f.al.v : null); if (f.fam && !v) return Object.keys(f.fam.g).map(function (k) { return f.fam.id + '#' + k; }); return [v ? id + '#' + v : id]; }
  /* → { pork: bool, hit: [teg, …] } — oila (variantsiz) uchun: faqat BARCHA variantlar cheklangan bo'lsa */
  function rinfo(f, vr) {
    if (!ch || !f || f.custom) return { pork: false, hit: [] }; var user = yemay(), keys = keysOf(f, vr), per = keys.map(function (k) { var t = ch.taom[k] || []; return { pork: t.indexOf('choshqa') > -1, hit: t.filter(function (x) { return x !== 'choshqa' && user.indexOf(x) > -1; }) }; });
    if (per.length === 1) return per[0];
    var allPork = per.every(function (x) { return x.pork; }), hit = [], allBlocked = per.every(function (x) { return x.pork || x.hit.length; });
    if (allBlocked && !allPork) per.forEach(function (x) { x.hit.forEach(function (t) { if (hit.indexOf(t) < 0) hit.push(t); }); });
    return { pork: allPork, hit: allPork ? [] : hit };
  }
  function hitText(hit) { return hit.map(function (t) { return T('ya_' + t); }).join(', '); }
  function yemay() { var p = A.prefs().yemay; return Array.isArray(p) ? p : []; }
  function avoids(t) { return CH.toza(yemay()).indexOf(t) > -1; }
  function count(h, x) { if (hs) { try { hs.add(h, x); } catch (e) {} } }
  function lbl(o) { return L() === 'ru' ? (o.ru || o.uz) : o.uz; }
  function lsGet() { try { return localStorage.getItem(LSEG); } catch (e) { return null; } }
  function lsSet(v) { try { localStorage.setItem(LSEG, v); } catch (e) {} }
  /* ---------- Yemaydiganlarim ---------- */
  function chipsHtml(sel, act) { return '<div class="sl-yn" role="group" aria-label="' + esc(T('ynT')) + '">' + CHTAGS.map(function (t) { var on = sel.indexOf(t) > -1; return '<button type="button" class="rz-chip' + (on ? ' on' : '') + '" data-act="' + act + '" data-t="' + t + '" aria-pressed="' + on + '">' + esc(T('yn_' + t)) + '</button>'; }).join('') + '</div>'; }
  function profileCard() { return '<section class="rz-card sl-ync" id="ynCard">' + A.infoTitle(T('ynT'), T('ynH')) + chipsHtml(yemay(), 'yntog') + '</section>'; }
  function setYemay(list) { A.prefs().yemay = list; A.prefs().yemayK = 1; A.save(); if (list.indexOf('baliq') > -1) A.prefs().baliqOff = true; A.pushResync(); }
  function toggleYemay(t) { var l = yemay().slice(), i = l.indexOf(t); if (i > -1) l.splice(i, 1); else l.push(t); setYemay(l); }
  function filterAlts(list) { if (ldState !== 2) { load(function () { A.render(); }); return yemay().length ? [] : list; } return list.filter(function (a) { return CH.ruxsat(ch, a.key, yemay()); }); }
  /* ---------- kun tanlash (Baliq kuni): oyna va Profil ---------- */
  function kunNow() { var k = A.prefs().baliqKun; return YC.kunOk(k == null ? 3 : k); }
  function dayName(i) { return WDF[L()][i]; }
  function dayChips(act) { var cur = kunNow(); return '<div class="sl-days" role="radiogroup" aria-label="' + esc(T('fwDayRow')) + '">' + WD[L()].map(function (n, i) { return '<button type="button" role="radio" class="rz-chip' + (i === cur ? ' on' : '') + '" aria-checked="' + (i === cur) + '" data-act="' + act + '" data-d="' + i + '">' + esc(n) + '</button>'; }).join('') + '</div>'; }
  function profileDays() { return dayChips('fwdayprof'); }
  /* ---------- umumiy oyna ---------- */
  function iconName(id) { var s = OR.split(id).id; return IKON[id] || IKON[s] || null; }
  function badge(p) { return '<span class="sl-kb' + (p.kafe ? '' : ' uy') + '">' + esc(T(p.kafe ? 'yzKafe' : 'yzUy')) + '</span>'; }
  function unitTxt(p) { var u = p.u && p.u !== 'g100' ? A.unitName(p.u) : ''; return (u ? (p.n > 1 ? p.n + ' ' : '') + u + ' ' : '') + p.g + ' ' + T('gram'); }
  function nameOfKey(p) { var f = A.foodById(p.id); if (!f) return p.id; var b = f.al ? (A.foodById(f.al.f) || f) : f, lb = p.v && b.fam ? A.S.famLabel(b, p.v, null, A.lang()) : ''; return A.nameOf(b) + (lb ? ' · ' + lb : ''); }
  function por(p) { return ' data-u="' + esc(p.u || '') + '" data-n="' + (p.n || 1) + '" data-g="' + (p.g || 0) + '"'; }
  function porOf(el) { return { u: el.getAttribute('data-u') || null, n: +el.getAttribute('data-n') || 1, g: +el.getAttribute('data-g') || 0 }; }
  function flagsHtml(p) { var f = p.flags || {}, s = ''; if (f.oqsil) s += '<span class="sl-fl o">' + esc(T('yzF_oqsil')) + '</span>'; if (f.yengil) s += '<span class="sl-fl y">' + esc(T('yzF_yengil')) + '</span>'; return s ? '<span class="sl-fls">' + s + '</span>' : ''; }
  function yRow(p, fish) {
    return '<div class="sl-yr"><button type="button" class="sl-yr-b" data-act="yepick" data-k="' + esc(p.key) + '"' + por(p) + '>' + A.tileHtml(p.id, p.v, nameOfKey(p), 44) + '<span class="m"><span class="nm">' + esc(nameOfKey(p)) + ' ' + badge(p) + '</span><span class="tm">' + esc(T('yzFacts', { u: unitTxt(p), k: p.k, p: Math.round(p.p) })) + '</span>' + flagsHtml(p) + (p.flags && p.flags.oshadi ? '<span class="sl-osh">' + esc(T('yzOsh')) + '</span>' : '') + '</span></button><button type="button" class="sl-pill sl-yr-add" data-act="yeadd" data-k="' + esc(p.key) + '"' + por(p) + '>' + esc(T('yzAdd')) + '</button></div>';
  }
  function head(title, back) { return '<div class="sl-yh">' + (back ? '<button type="button" class="sl-x" data-act="' + back + '" aria-label="' + esc(T('fwBack')) + '">' + A.ico('back') + '</button>' : '') + '<h3 class="sl-fwt">' + esc(title) + '</h3><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(T('close')) + '">' + A.ico('x') + '</button></div>'; }
  function chipsRow() { return '<div class="sl-ye-chips sc" role="group">' + CHIPS.filter(function (c) { return !(c === 'baliq' && avoids('baliq')); }).map(function (c) { return '<button type="button" class="rz-chip' + (c === yv.toifa ? ' on' : '') + '" data-act="yechip2" data-c="' + c + '" aria-pressed="' + (c === yv.toifa) + '">' + esc(T('yzC_' + c)) + '</button>'; }).join('') + '</div>'; }
  function segs() { var ic = { kafe: 'zfork', buyurtma: 'zbag', uyda: 'zhome' }; return '<div class="sl-segs3" role="tablist">' + YC.SEG.map(function (s) { var on = s === yv.seg; return '<button type="button" role="tab" class="' + (on ? 'on' : '') + '" aria-selected="' + on + '" data-act="yeseg" data-s="' + s + '">' + A.ico(ic[s]) + '<span>' + esc(T('yzS_' + s)) + '</span></button>'; }).join('') + '</div>'; }
  function rowsHtml(items) {
    var open = yv.open[yv.toifa + '|' + yv.seg], shown = open ? items : items.slice(0, YC.SHOW);
    return '<div class="sl-yrs">' + shown.map(yRow).join('') + '</div>' + (items.length > YC.SHOW && !open ? '<button type="button" class="sl-txtbtn sl-ymore" data-act="yemore">' + esc(T('yzMore')) + ' (' + (items.length - YC.SHOW) + ')</button>' : '');
  }
  function emptyHtml() { return '<div class="rz-empty"><b>' + esc(T('yzNo')) + '</b><p>' + esc(T('yzNoH')) + '</p></div><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="yesearch">' + esc(T('yzSearch')) + '</button></div>'; }
  function qWord() { var q = data.toifalar[yv.toifa].qidiruv; return q[L()]; }
  function orderLinks() {
    var l = partners || [], q = qWord();
    return '<p class="rz-p sm">' + esc(T('yzOrdH', { q: q })) + '</p>' + (l.length ? '<div class="sl-ylinks">' + l.map(function (p) { return '<a class="rz-btn primary full sl-ylink" data-act="yeorder" data-p="' + esc(p.id) + '" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.name) + ' ' + A.ico('share') + '</a>'; }).join('') + '</div>' : '<p class="rz-p warn">' + esc(T('yzOrdNone')) + '</p>');
  }
  function winBody() {
    var tf = yv.toifa, rem = A.remaining(), body = '';
    if (yv.seg === 'uyda') {
      var rs = YC.uyda({ data: data, toifa: tf, uyda: uy, cheklov: ch, yemaydi: yemay() });
      body = (rs.length ? '<p class="rz-p">' + esc(T('yzUyH')) + '</p>' + rs.map(function (r) { var p = YC.portion(A.by(), { birlik: {} }, r.taom); return '<button type="button" class="rz-row sl-fwr" data-act="yerec" data-id="' + esc(r.id) + '">' + A.tileHtml(r.taom, null, lbl(r.nom), 44) + '<span class="m"><b>' + esc(lbl(r.nom)) + '</b><span>' + esc(T('fwTime', { t: lbl(r.vaqt) }) + (p ? ' · ' + T('fwK1', { k: p.k }) : '')) + '</span></span>' + A.ico('chev', 'r') + '</button>'; }).join('') : emptyHtml());
    } else {
      var r = YC.list({ by: A.by(), data: data, toifa: tf, seg: yv.seg, tags: A.tags(), cheklov: ch, yemaydi: yemay(), qoldiq: rem });
      yv.shown = r.items.map(function (p) { return p.key; });
      body = (yv.seg === 'buyurtma' ? orderLinks() + '<div class="rz-st">' + esc(T('yzOrdList')) + '</div>' : '') + (r.items.length ? rowsHtml(r.items) + '<p class="rz-priv">' + esc(T('yzNote')) + '</p>' : emptyHtml());
    }
    return body + (tf === 'baliq' ? '<div class="sl-fwf"><button type="button" class="sl-txtbtn" data-act="fwno">' + esc(T('fwNo')) + '</button><button type="button" class="sl-txtbtn" data-act="fwday">' + esc(T('fwDay')) + '</button></div>' : '');
  }
  function winHtml() { return head(yv.toifa === 'baliq' ? T('fwT') : T('yzT')) + chipsRow() + segs() + '<div class="sl-ybody">' + winBody() + '</div>'; }
  function draw() { var sh = A.$('#rzSheet'), sc = sh ? sh.scrollTop : 0; A.setSheet(winHtml()); if (sh) sh.scrollTop = sc; }
  function show(toifa) {                                  // oynani ochish (chip, banner, eslatma)
    if (toifa === 'baliq') count('baliq_oyna_ochildi'); else count('yeymiz_ochildi');
    load(function () { A.withDb(function () { loadPartners(function () { yv.toifa = toifa; yv.seg = YC.segBoshlang(new Date(), lsGet()); yv.open = {}; if (A.sheetKind() === 'yeymiz') draw(); else A.openSheet('yeymiz', winHtml()); }); }); });
  }
  function openFish() { show('baliq'); }
  function back() { A.withDb(function () { loadPartners(function () { if (A.sheetKind() === 'yeymiz') draw(); else A.openSheet('yeymiz', winHtml()); }); }); }
  function loadPartners(cb) {
    if (pState === 2) { cb(); return; } loadJson('/assets/partners.json', function (j) {
      var now = new Date().toISOString().slice(0, 10), l = (j.partners || []).filter(function (p) { return p.active !== false && (p.categories || []).indexOf('yetkazish') > -1 && (!p.valid_until || String(p.valid_until) >= now); });
      partners = l.map(function (p) { return { id: p.id, name: lbl(p.name || {}) || p.id, url: p.url }; }); pState = 2; cb();
    }, function () { partners = []; cb(); });
  }
  /* ---------- Bugun kartasi ---------- */
  function todayCard() {                                  // Bugun: katta ESHIK karta (chiplar oyna ichida) — «Bugun nima yeymiz?» uchun yagona kirish
    return '<button type="button" class="sl-door" id="yeCard" data-act="yedoor"><span class="ic">' + A.ico('zfork') + '</span><span class="m"><b>' + esc(T('yzT')) + '</b><span>' + esc(T('yzDoorS')) + '</span></span>' + A.ico('chev', 'r') + '</button>';
  }
  /* ---------- Uyda: retsept ---------- */
  var rv = { id: null, n: 4 };
  function recipe(id) { return UY.byId(uy, id); }
  function recHtml() {
    var r = recipe(rv.id), l = L(), mas = UY.masalliq(r, rv.n, l), p = YC.portion(A.by(), { birlik: {} }, r.taom);
    return head(lbl(r.nom), 'yeuyback') + '<p class="rz-mut sm">' + esc(T('fwTime', { t: lbl(r.vaqt) })) + '</p>' +
      '<div class="rz-st">' + esc(T('fwPeople')) + '</div><div class="sl-stp" role="group" aria-label="' + esc(T('fwPeople')) + '"><button type="button" class="sl-pill" data-act="fwn" data-s="-1" aria-label="−"' + (rv.n <= 1 ? ' disabled' : '') + '>−</button><b id="fwN" aria-live="polite">' + rv.n + '</b><button type="button" class="sl-pill" data-act="fwn" data-s="1" aria-label="+"' + (rv.n >= 8 ? ' disabled' : '') + '>+</button></div>' +
      '<div class="rz-st">' + esc(T('fwMas')) + '</div><ul class="sl-mas" id="fwMas">' + mas.map(function (m) { return '<li><span>' + esc(m.n) + '</span><b>' + esc(m.text) + '</b></li>'; }).join('') + '</ul>' +
      '<div class="sl-fwb"><button type="button" class="rz-btn ghost sm" data-act="fwcopy">' + esc(T('fwCopy')) + '</button>' + (navigator.share ? '<button type="button" class="rz-btn ghost sm" data-act="fwshare">' + esc(T('fwShare')) + '</button>' : '') + '</div>' +
      '<div class="rz-st">' + esc(T('fwQad')) + '</div><ol class="sl-stps">' + r.qadamlar[l].map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>' + (p ? '<p class="rz-priv">' + esc(T('fwKcalN', { k: p.k })) + '</p>' : '') +
      '<div class="sl-cta"><button type="button" class="sl-main" data-act="fwlog" data-k="' + esc(r.taom) + '">' + esc(T('fwLog')) + '</button></div>';
  }
  function listText() { return UY.royxat(recipe(rv.id), rv.n, L()); }
  function copyText(txt, msg) {
    var done = function () { A.toast(msg, null, true); };
    if (navigator.clipboard && navigator.clipboard.writeText) { try { navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt, done); }); } catch (e) { fallbackCopy(txt, done); } } else fallbackCopy(txt, done);
  }
  function fallbackCopy(txt, done) { try { var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done(); } catch (e) {} }
  function dayHtml() { return head(T('fwDayT'), 'yewback') + '<p class="rz-p">' + esc(T('fwDayH')) + '</p>' + dayChips('fwdayset'); }
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
    return head(T('bvT'), 'yevback') + '<p class="rz-mut sm">' + esc(T('bvFor', { n: nm })) + '</p><div class="sl-ye-chips in" role="radiogroup">' + ['oqsil', 'kam', 'tam'].map(function (k) { return '<button type="button" role="radio" class="rz-chip' + (k === vv.f ? ' on' : '') + '" aria-checked="' + (k === vv.f) + '" data-act="yevf" data-f="' + k + '">' + esc(T('bvF_' + k)) + '</button>'; }).join('') + '</div>' +
      '<div class="sl-yrs">' + (rows || '<div class="rz-empty"><b>' + esc(T('bvNone')) + '</b></div>') + '</div>' + (list.some(function (v) { return v.kafe; }) ? '<p class="rz-priv">' + esc(T('yzNote')) + '</p>' : '');
  }
  function openVariants() { load(function () { vv.f = 'oqsil'; A.setSheet(varHtml()); }); }
  function varBtn() { return '<button type="button" class="sl-txtbtn" data-act="yevopen">' + esc(T('bvOpen')) + '</button>'; }
  /* ---------- mavjud foydalanuvchi: «Yemaydigan narsangiz bormi?» (bir martalik ixcham karta, Bugun) ---------- */
  function yemayAsked() { var p = A.prefs(); return p.yemayK != null || Array.isArray(p.yemay); }
  function yemayCard() {
    if (yemayAsked()) return '';
    return '<section class="rz-card sl-yq" id="yqCard"><b class="t">' + esc(T('yqT')) + '</b><div class="b"><button type="button" class="rz-btn sm" data-act="yqbel">' + esc(T('yqBel')) + '</button><button type="button" class="rz-btn ghost sm" data-act="yqyoq">' + esc(T('yqNo')) + '</button></div></section>';
  }
  function yemaySheet() { return head(T('ynT')) + '<p class="rz-p">' + esc(T('ynH')) + '</p>' + chipsHtml(yemay(), 'yntog') + '<p class="rz-priv sl-ywarn">' + esc(T('obYwarn')) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="yqok">' + esc(T('obYok')) + '</button></div>'; }
  /* ---------- amallar ---------- */
  function dayChosen(d) { A.prefs().baliqKun = d; A.save(); A.pushResync(); }
  function act(a, el, ev) {
    switch (a) {
      case 'yedoor': show('kabob'); return true;
      case 'yechip': show(el.getAttribute('data-c')); return true;
      case 'yechip2': { var c = el.getAttribute('data-c'); if (c === 'baliq') count('baliq_oyna_ochildi'); yv.toifa = c; draw(); return true; }
      case 'yeseg': yv.seg = el.getAttribute('data-s'); lsSet(yv.seg); draw(); return true;
      case 'yemore': yv.open[yv.toifa + '|' + yv.seg] = true; draw(); return true;
      case 'yepick': { count(yv.toifa === 'baliq' ? 'baliq_kafe_yozildi' : 'yeymiz_tanlandi'); A.pickKey(el.getAttribute('data-k'), 'y', porOf(el)); return true; }
      case 'yeadd': { count(yv.toifa === 'baliq' ? 'baliq_kafe_yozildi' : 'yeymiz_tanlandi'); A.logKey(el.getAttribute('data-k'), porOf(el)); return true; }
      case 'yesearch': A.openAdd({}); return true;
      case 'yeorder': { var q = qWord(); count(yv.toifa === 'baliq' ? 'baliq_buyurtma_bosildi' : 'yeymiz_buyurtma_bosildi', el.getAttribute('data-p')); copyText(q, T('yzCopied', { q: q })); if (A.openExternal(el.getAttribute('href')) && ev) ev.preventDefault(); return true; }
      case 'yerec': { rv = { id: el.getAttribute('data-id'), n: UY.kishiOk(A.prefs().baliqKishi || uy.kishi.standart) }; count(yv.toifa === 'baliq' ? 'baliq_uyda_ochildi' : 'yeymiz_uyda_ochildi'); A.setSheet(recHtml()); return true; }
      case 'yeuyback': draw(); return true;
      case 'yntog': toggleYemay(el.getAttribute('data-t')); if (A.sheetKind() === 'yemay') A.setSheet(yemaySheet()); else A.render(); return true;
      case 'obyntog': A.obYnToggle(el.getAttribute('data-t')); return true;
      case 'yqbel': A.openSheet('yemay', yemaySheet()); return true;
      case 'yqyoq': A.prefs().yemayK = 1; count('yemaydi_hammasi'); A.save(); A.render(); return true;
      case 'yqok': { A.prefs().yemayK = 1; count(yemay().length ? 'yemaydi_tanlandi' : 'yemaydi_hammasi'); A.save(); A.closeSheet(); A.render(); return true; }
      case 'fwn': { rv.n = UY.kishiOk(Math.max(1, Math.min(8, rv.n + (+el.getAttribute('data-s'))))); A.prefs().baliqKishi = rv.n; A.save(); var sc = A.$('#rzSheet').scrollTop; A.setSheet(recHtml()); A.$('#rzSheet').scrollTop = sc; return true; }
      case 'fwcopy': copyText(listText(), T('fwCopied')); return true;
      case 'fwshare': { var txt = listText(); if (navigator.share) navigator.share({ text: txt }).catch(function () {}); else copyText(txt, T('fwCopied')); return true; }
      case 'fwlog': A.pickKey(el.getAttribute('data-k'), 'y'); return true;
      case 'fwno': { var prev = yemay().slice(), pb = A.prefs().baliqOff; setYemay(prev.indexOf('baliq') > -1 ? prev : prev.concat('baliq')); A.closeSheet(); A.render(); A.toast(T('fwNoDone'), function () { A.prefs().baliqOff = pb; setYemay(prev); A.render(); }, true); return true; }
      case 'fwday': A.setSheet(dayHtml()); return true;
      case 'yewback': draw(); return true;
      case 'fwdayset': { var d = +el.getAttribute('data-d'); dayChosen(d); A.closeSheet(); A.render(); A.toast(T('fwDayDone', { d: dayName(d) }), null, true); return true; }
      case 'fwdayprof': { dayChosen(+el.getAttribute('data-d')); A.render(); return true; }
      case 'yevopen': openVariants(); return true;
      case 'yevf': vv.f = el.getAttribute('data-f'); A.setSheet(varHtml()); return true;
      case 'yevback': A.setSheet(A.portionHtml()); return true;
      case 'yevgo': { var it = vv.list && vv.list[+el.getAttribute('data-i')]; if (it) { count('orinbosar_tanlandi'); A.orApply(it); } return true; }
    }
    return false;
  }
  function init(api) {
    A = api; Object.keys(D).forEach(function (l) { Object.keys(D[l]).forEach(function (k) { api.D[l][k] = D[l][k]; }); });
    api.addIcons(ICONS); hs = HS && HS.browser ? HS.browser() : null;
  }
  window.KalkiYeymizUI = { chReady: chReady, loadCh: loadCh, rinfo: rinfo, hitText: hitText, init: init, act: act, load: load, todayCard: todayCard, profileCard: profileCard, profileDays: profileDays, filterAlts: filterAlts, varBtn: varBtn, count: count, chipsHtml: chipsHtml, yemayCard: yemayCard, yBack: back, fishBack: back, openFish: openFish, avoids: avoids, yemay: yemay, kunBugun: kunNow, dayName: dayName, iconFor: iconName, badge: badge, chips: CHIPS, D: D, IKON: IKON };
})();
