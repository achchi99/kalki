/* kalki.uz — KalkiFit: «nima yeyish kerak» tavsiyalarini FARQDAN HISOBLASH (v106). Maslahatchi matnlarida qattiq yozilgan gramm/dona YO'Q:
 * qolgan farq (oqsil/uglevod/yog'/kletchatka, g) → bazadagi (data/ovqatlar.json) 100 g qiymati bo'yicha taom + odatiy porsiya.
 *   Qoida: har variant farqning kamida ≈ 80 %, ko'pi bilan ≈ 150 % ini qoplaydi (ortiqcha kaloriya bermaydi). Porsiya — odatiy qadamga yaxlitlanadi
 *   (tuxum — dona, tvorog/tovuq — 50 g, yong'oq — 5–10 g, moy — choy qoshiq). Kaloriya «zaxirasi» (kkal) bo'yicha — variant zaxiradan OSHMAYDI.
 *   Baza yuklanmagan / farq mantiqsiz bo'lsa — miqdorsiz umumiy ibora (raqam YOLG'ON aytilmaydi).
 * Turlar: P oqsil · Z nonushta oqsili · S nam-yog'siz oqsil · C uglevod · F yog' · B kletchatka · K oqsilli tamaddi (kkal zaxirasi) · L yengil tamaddi (kkal zaxirasi).
 * Matnlarda: {opP} (ko'pi bilan 2 variant, «yoki»), {opP1} (bitta variant) — assets/kalkifit-maslahat.js say() to'ldiradi. Hujjat: docs/maslahatchi-uslub.md. Test: tools/test-tavsiya.js */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiTavsiya = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DB = null, OK = null;
  function setFilter(fn) { OK = typeof fn === 'function' ? fn : null; }          // ilova: «Yemaydiganlarim» (allergiya/cheklov) — mos kelmagan taom tavsiya qilinmaydi
  function init(list) { DB = {}; if (typeof list === 'function') { DB = list; return; } (list || []).forEach(function (f) { if (f && f.id) DB[f.id] = f; }); }
  function food(id) { var f = !DB ? null : (typeof DB === 'function' ? DB(id) : DB[id]) || null; return f && OK && !OK(f) ? null : f; }
  var KEY = { P: 'p', Z: 'p', S: 'p', C: 'c', F: 'f', B: 'fb', K: 'k', L: 'k' };
  function pl(n, a, b, c) { n = Math.abs(n) % 100; var m = n % 10; return n > 10 && n < 20 ? c : m === 1 ? a : m >= 2 && m <= 4 ? b : c; }
  function dec(n) { return String(n).replace('.', ','); }
  /* taom porsiyasi: GR — gramm (uz «N g nom», ru «N г род.»), UN — dona/qoshiq (ug — bir donaning grammi; matn funksiyasi) */
  function GR(id, amts, uz, ruG) { return { id: id, amts: amts, ug: 1, f: function (n, L) { return L === 'ru' ? n + ' г ' + ruG : n + ' g ' + uz; } }; }
  function UN(id, amts, ug, fu, fr) { return { id: id, amts: amts, ug: ug, f: function (n, L) { return L === 'ru' ? fr(n) : fu(n); } }; }
  var ruN = function (a, b, c) { return function (n) { return n + ' ' + pl(Math.round(n), a, b, c); }; };
  var HALF = function (uz, ru, a, b, c, one) { return { uz: function (n) { return n === 0.5 ? 'yarim ' + uz : dec(n) + ' ta ' + uz; }, ru: function (n) { return n === 0.5 ? ru : dec(n) + ' ' + pl(Math.round(n), a, b, c); } }; };
  var TUXUM = UN('tuxum', [1, 2, 3, 4], 50, function (n) { return n + ' ta tuxum'; }, ruN('яйцо', 'яйца', 'яиц'));
  var OLMA = (function (h) { return UN('olma', [0.5, 1, 2, 3], 180, h.uz, h.ru); })(HALF('olma', 'пол-яблока', 'яблоко', 'яблока', 'яблок'));
  var BANAN = (function (h) { return UN('banan', [0.5, 1, 2], 120, h.uz, h.ru); })(HALF('banan', 'полбанана', 'банан', 'банана', 'бананов'));
  var TUXUM3 = UN('tuxum', [1, 2, 3], 50, function (n) { return n + ' ta tuxum'; }, ruN('яйцо', 'яйца', 'яиц'));
  var NOK = UN('nok', [1, 2], 170, function (n) { return n + ' ta nok'; }, ruN('груша', 'груши', 'груш'));
  var MANDARIN = UN('mandarin', [1, 2, 3], 80, function (n) { return n + ' ta mandarin'; }, ruN('мандарин', 'мандарина', 'мандаринов'));
  var KARTOSHKA = UN('kartoshka', [1, 2, 3], 100, function (n) { return n + ' ta kartoshka'; }, ruN('картофелина', 'картофелины', 'картофелин'));
  var MOY = UN('yog', [1, 2, 3, 4], 5, function (n) { return n + ' choy qoshiq o\'simlik moyi'; }, function (n) { return n + ' ' + pl(Math.round(n), 'чайная ложка', 'чайные ложки', 'чайных ложек') + ' растительного масла'; });
  var TVOROG = GR('tvorog5', [50, 100, 150, 200, 250, 300], 'tvorog', 'творога');
  var TOVUQ = GR('tovuq-kokrak', [50, 100, 150, 200], "tovuq ko'kragi", 'куриной грудки');
  var QATIQ = GR('qatiq', [100, 150, 200, 250, 300, 400], 'qatiq', 'катыка');
  var LOVIYA = GR('loviya', [50, 100, 150, 200, 250, 300], 'pishgan loviya', 'варёной фасоли');
  var LOVIYA_P = GR('loviya', [50, 100, 150, 200], 'pishgan loviya', 'варёной фасоли');
  var MOSH = GR('mosh', [50, 100, 150, 200, 250, 300], 'pishgan mosh', 'варёного маша');
  var MOL = GR('mol-qaynatilgan', [50, 100, 150, 200], "qaynatilgan mol go'shti", 'варёной говядины');
  var CAND = {
    P: [TVOROG, TUXUM, TOVUQ, QATIQ, LOVIYA_P, MOL],
    Z: [TUXUM, TVOROG, GR('yogurt-yunon', [100, 150, 200, 250, 300], 'yunon yogurti', 'греческого йогурта'), QATIQ],          // nonushta oqsili (tuxum, tvorog, qatiq)
    S: [TOVUQ, GR('kurka-kokrak', [50, 100, 150, 200], "kurka ko'kragi", 'грудки индейки'), GR('yogurt-yunon', [100, 150, 200, 250, 300], 'yunon yogurti', 'греческого йогурта'), TVOROG, GR('tunets-suv', [50, 100, 150], 'tunets (o\'z sharbatida)', 'тунца (в собственном соку)')],
    C: [BANAN, OLMA, GR('grechka', [50, 100, 150, 200, 250, 300], 'pishgan grechka', 'варёной гречки'), GR('non', [10, 20, 40, 60, 80, 100, 150], 'non', 'хлеба'), GR('mayiz', [10, 20, 30], 'mayiz', 'изюма'), GR('guruch', [50, 100, 150, 200, 250], 'pishgan guruch', 'варёного риса'), KARTOSHKA],
    F: [GR('yongoq', [10, 15, 20, 30, 40], "grek yong'og'i", 'грецких орехов'), MOY, GR('pishloq', [20, 30, 40, 60], 'pishloq', 'сыра'), TUXUM3],
    B: [LOVIYA, MOSH, GR('brokkoli-qaynatilgan', [100, 150, 200, 300], 'qaynatilgan brokkoli', 'варёной брокколи'), OLMA, NOK, GR('grechka', [100, 150, 200, 250, 300], 'pishgan grechka', 'варёной гречки'), GR('non-qora', [30, 60, 90], 'qora non', 'чёрного хлеба')],
    K: [TVOROG, TUXUM, QATIQ, GR('yogurt-yunon', [100, 150, 200, 250], 'yunon yogurti', 'греческого йогурта'), TOVUQ],
    L: [QATIQ, OLMA, NOK, MANDARIN, BANAN, GR('yogurt-yunon', [100, 150, 200], 'yunon yogurti', 'греческого йогурта')]
  };
  /* baza yo'q / farq mantiqsiz bo'lsa — miqdorsiz ibora (taom nomi + yoki). Accusative bilan mos (ru) */
  /* miqdorsiz ibora: taom nomlari (faqat «Yemaydiganlarim»ga TO'G'RI KELGANLARI — food() filtri), accusative bilan mos (ru). Hech biri qolmasa — taomsiz umumiy ibora */
  var GEN = {
    P: [['mol-qaynatilgan', "go'sht", 'мясо'], ['tuxum', 'tuxum', 'яйца'], ['tvorog5', 'tvorog', 'творог'], ['loviya', 'loviya', 'фасоль']],
    Z: [['tuxum', 'tuxum', 'яйца'], ['tvorog5', 'tvorog', 'творог'], ['qatiq', 'qatiq', 'катык']],
    S: [['tovuq-kokrak', "tovuq ko'kragi", 'куриную грудку'], ['losos', 'baliq', 'рыбу'], ['tvorog5', 'tvorog', 'творог']],
    C: [['non', 'non', 'хлеб'], ['grechka', 'grechka', 'гречку'], ['olma', 'meva', 'фрукты']],
    F: [['yongoq', "yong'oq", 'орехи'], ['yog', "o'simlik moyi", 'растительное масло']],
    B: [['loviya', 'loviya', 'фасоль'], ['mosh', 'mosh', 'маш'], ['olma', 'olma', 'яблоки']],
    K: [['qatiq', 'qatiq', 'катык'], ['tvorog5', 'tvorog', 'творог'], ['tuxum', 'tuxum', 'яйцо']],
    L: [['qatiq', 'qatiq', 'катык'], ['olma', 'meva', 'фрукт']]
  };
  var NEUTRAL = { P: ['oqsilli taom', 'белковую еду'], Z: ['oqsilli nonushta', 'белковый завтрак'], S: ['yog\'siz oqsil', 'нежирный белок'], C: ['uglevodli taom', 'углеводную еду'], F: ['sog\'lom yog\'li taom', 'полезные жиры'], B: ['tolali taom', 'продукты с клетчаткой'], K: ['yengil oqsilli tamaddi', 'белковый перекус'], L: ['yengil tamaddi', 'лёгкий перекус'] };
  function generic(kind, L) {
    var k = GEN[kind] ? kind : 'P', i = L === 'ru' ? 2 : 1, names = GEN[k].filter(function (x) { return food(x[0]); }).slice(0, 3).map(function (x) { return x[i]; });
    if (!names.length) return NEUTRAL[k][L === 'ru' ? 1 : 0];
    var j = L === 'ru' ? ' или ' : ' yoki '; return names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + j + names[names.length - 1];
  }
  var MIN_COV = 0.8, MAX_COV = 1.5, MAX_KCAL = 250, MIN_KCAL = 40;
  var MAXGAP = { P: 80, Z: 60, S: 60, C: 80, F: 35, B: 28 };          // bundan katta farq uchun odatiy porsiya yo'q — miqdorsiz ibora
  function val(c, n, kind) { var f = food(c.id), v = f ? f[KEY[kind]] : null; return v == null || isNaN(v) ? null : v * c.ug * n / 100; }
  function rot(a, s) { s = a.length ? ((s % a.length) + a.length) % a.length : 0; return a.slice(s).concat(a.slice(0, s)); }
  function single(c, kind, gap) { var best = null; c.amts.forEach(function (n) { var v = val(c, n, kind); if (v == null) return; var cov = v / gap; if (cov < MIN_COV || cov > MAX_COV) return; if (!best || Math.abs(cov - 1) < Math.abs(best.cov - 1) - 1e-9) best = { n: n, v: v, cov: cov }; }); return best; }
  function combo(a, b, kind, gap) {
    var best = null;
    a.amts.forEach(function (na) { var va = val(a, na, kind); if (va == null) return; var ca = va / gap; if (ca < 0.45 || ca > 0.95) return;
      b.amts.forEach(function (nb) { var vb = val(b, nb, kind); if (vb == null || vb / gap < 0.12) return; var cov = (va + vb) / gap; if (cov < MIN_COV || cov > MAX_COV) return; if (!best || Math.abs(cov - 1) < Math.abs(best.cov - 1) - 1e-9) best = { na: na, nb: nb, v: va + vb, cov: cov }; }); });
    return best;
  }
  function budget(c, kind, left) { var best = null; c.amts.forEach(function (n) { var v = val(c, n, kind); if (v == null || v > left + 1e-9 || v > MAX_KCAL || v < Math.min(MIN_KCAL, left * 0.4)) return; if (!best || v > best.v) best = { n: n, v: v, cov: v / left }; }); return best; }
  function num(x) { var v = typeof x === 'number' ? x : parseFloat(String(x == null ? '' : x).replace(/\s/g, '').replace(',', '.')); return isFinite(v) ? v : NaN; }
  /* opts(kind, gap, L, o) → { list: [{ items: [{ id, n, v }], cov, text }], text, first, generic } */
  function opts(kind, gap, L, o) {
    o = o || {}; L = L === 'ru' ? 'ru' : 'uz'; var N = o.n || 2, seed = o.seed || 0, g = num(gap), cs = CAND[kind], list = [];
    if (cs && DB && g > 0 && g <= (MAXGAP[kind] || 1e9)) {
      var order = rot(cs, seed), used = {}, push = function (items, cov) { if (items.some(function (x) { return used[x.c.id]; })) return false; items.forEach(function (x) { used[x.c.id] = 1; }); list.push({ items: items.map(function (x) { return { id: x.c.id, n: x.n, v: x.v }; }), cov: cov, text: items.map(function (x) { return x.c.f(x.n, L); }).join(L === 'ru' ? ' и ' : ' va ') }); return true; };
      if (kind === 'K' || kind === 'L') { order.forEach(function (c) { if (list.length >= N) return; var b = budget(c, kind, g); if (b) push([{ c: c, n: b.n, v: b.v }], b.cov); }); }
      else {
        order.forEach(function (c) { if (list.length >= N) return; var s = single(c, kind, g); if (s) push([{ c: c, n: s.n, v: s.v }], s.cov); });
        if (list.length < N) order.forEach(function (a) { if (list.length >= N || used[a.id]) return; for (var j = 0; j < order.length && list.length < N; j++) { var b = order[j]; if (b.id === a.id) continue; var k = combo(a, b, kind, g); if (k && push([{ c: a, n: k.na, v: val(a, k.na, kind) }, { c: b, n: k.nb, v: val(b, k.nb, kind) }], k.cov)) break; } });
      }
    }
    var gen = generic(kind, L), text = list.length ? list.map(function (x) { return x.text; }).join(L === 'ru' ? ' или ' : ' yoki ') : gen;
    return { list: list, text: text, first: list.length ? list[0].text : gen, generic: !list.length };
  }
  return { init: init, setFilter: setFilter, opts: opts, has: function () { return !!DB; }, KEY: KEY, MAXGAP: MAXGAP, MIN_COV: MIN_COV, MAX_COV: MAX_COV, MAX_KCAL: MAX_KCAL, CAND: CAND, GEN: GEN, food: food };
});
