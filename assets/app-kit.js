/* kalki.uz — ilovalar uchun UMUMIY komponentlar (Ro'zg'or, KalkiFit): pastki panel (sheet; prujina, pastga tortib yopish), toast (+ yashil belgi),
 * raqam sanab o'tishi (count-up), raqam klaviaturasi, o'z sana tanlagichi (tizim <input type=date> YO'Q — til aralashmasin), birinchi marta yo'l-yo'riq,
 * ikonkalar va sana/raqam formatlari. DOM'da kutilgan elementlar: #rzSheet, #rzBg, #rzToast, #rzTips (shellHtml() beradi).
 * Foydalanish: var kit = RzKit.create({ root, K: KalkiRozgor (sana funksiyalari), t: ilova tarjimoni, lang: () => 'uz'|'ru', isCyr: () => bool }). */
(function () {
  'use strict';
  var KD = {
    uz: {
      today: 'Bugun', yesterday: 'Kecha', tomorrow: 'Ertaga', close: 'Yopish', cancel: 'Bekor qilish', dBoshqa: 'Boshqa sana', dNone: 'Sana tanlanmagan', dN: '{n}-sana', dEom: 'Oy oxiri', pickDate: 'Sana', tipOk: 'Tushunarli', tipOf: '{i} / {n}', sum: "so'm",
      wd: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'], mon: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
    },
    ru: {
      today: 'Сегодня', yesterday: 'Вчера', tomorrow: 'Завтра', close: 'Закрыть', cancel: 'Отмена', dBoshqa: 'Другая дата', dNone: 'Дата не выбрана', dN: '{n}-е число', dEom: 'Конец месяца', pickDate: 'Дата', tipOk: 'Понятно', tipOf: '{i} / {n}', sum: 'сум',
      wd: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], mon: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
      gen: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
    }
  };
  var MON_CYR = ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];
  var IC = {
    check: 'M5 12l5 5 9-10', back: 'M15 6l-6 6 6 6', x: 'M6 6l12 12 M18 6L6 18', chev: 'M9 6l6 6-6 6', plus: 'M12 5v14 M5 12h14', cal: 'M5 5h14v15H5z M5 10h14 M9 3v4 M15 3v4',
    lang: 'M3 5h12 M9 3v2 M5 5c1 4 4 7 8 8 M13 5c-1 4-3 7-7 9 M13 21l4-10 4 10 M14.5 17h5', help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.6 9.4a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7 M12 16.8h.01',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 7.8h.01', set: 'M4 6h9 M17 6h3 M13 4v4 M4 12h3 M11 12h9 M7 10v4 M4 18h11 M19 18h1 M15 16v4', boshqa: 'M5 12h.01 M12 12h.01 M19 12h.01'
  };
  function digits(v) { return String(v == null ? '' : v).replace(/\D/g, ''); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function fmt(n) { var r = Math.round(n), neg = r < 0; r = Math.abs(r); return (neg ? '−' : '') + String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function spaced(v) { var d = digits(v).replace(/^0+(?=\d)/, '').slice(0, 12); return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function ico(name, cls, sw) { return '<svg class="rz-i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (IC[name] || IC.boshqa) + '"/></svg>'; }

  function create(cfg) {
    var root = cfg.root, K = cfg.K, kit = { esc: esc, fmt: fmt, digits: digits, spaced: spaced, reduce: false };
    var sheetKind = null, undoTimer = null, sw = null;
    try { kit.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    function lang() { return cfg.lang(); }
    function cyr() { return cfg.isCyr ? cfg.isCyr() : false; }
    function t(k, o) { var s = (KD[lang()] && KD[lang()][k] != null) ? KD[lang()][k] : KD.uz[k]; if (typeof s === 'string' && o) s = s.replace(/\{(\w+)\}/g, function (m, x) { return o[x] != null ? o[x] : m; }); return s; }
    function $(s, r) { return (r || root).querySelector(s); }
    function $$(s, r) { return [].slice.call((r || root).querySelectorAll(s)); }
    kit.t = t; kit.$ = $; kit.$$ = $$;
    /* Service worker yangilanganda sw-boot.js sahifani qayta yuklaydi — FAQAT foydalanuvchi input/change'ga tegmagan bo'lsa. Ilovada maydonlar yo'q (o'z klaviaturasi, tugmalar),
       shuning uchun birinchi kirishda onboarding o'rtasida sahifa boshiga qaytardi. Haqiqiy (trusted) bosish/tugma = "tegdi": qayta yuklash o'rniga yangilanish chizig'i chiqadi. */
    var touched = false;
    function touch(e) { if (touched || !e.isTrusted) return; touched = true; try { if (window.KalkiSW && window.KalkiSW.hold) window.KalkiSW.hold(); } catch (x) {} }
    root.addEventListener('pointerdown', touch, true); root.addEventListener('keydown', touch, true);
    kit.vib = function (ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 15); } catch (e) {} };
    kit.wait = function (fn, ms) { if (kit.reduce) fn(); else setTimeout(fn, ms); };
    kit.addIcons = function (o) { for (var k in o) IC[k] = o[k]; };
    kit.ico = ico;
    kit.okCheck = function () { return '<svg class="rz-okc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" class="c"/><path d="M7.5 12.5l3.2 3.2L16.8 9" pathLength="1" class="k"/></svg>'; };

    /* ---------- sana yorliqlari: doim sahifa tilida (30-oktabr / 30 октября / 30-октябр) ---------- */
    kit.monthName = function (m, nominative) { if (cyr()) return MON_CYR[m - 1]; if (lang() === 'ru') return (nominative ? KD.ru.mon : KD.ru.gen)[m - 1]; return KD.uz.mon[m - 1]; };
    kit.dLabel = function (d) {
      var p = K.parse(d); if (!p) return d;
      var y = p.y !== K.parse(K.today()).y ? ' ' + p.y : '';
      return lang() === 'ru' ? p.d + ' ' + kit.monthName(p.m) + y : p.d + '-' + kit.monthName(p.m) + y;
    };

    /* ---------- raqam sanab o'tishi (~400 ms) ---------- */
    kit.setNum = function (el, from, to, o) {
      if (!el) return; o = o || {};
      var f = o.fmt || function (v) { return fmt(Math.abs(v)); }, txt = f(to);
      if (from == null || from === to || kit.reduce) { el.textContent = txt; return; }
      el.textContent = f(from);
      var t0 = performance.now(), dur = o.dur || 400, tok = el._tok = {};
      (function step(now) { if (el._tok !== tok) return; var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = p < 1 ? f(o.round === false ? from + (to - from) * e : Math.round(from + (to - from) * e)) : txt; if (p < 1) requestAnimationFrame(step); })(t0);
    };

    /* ---------- pastki panel (sheet) ---------- */
    kit.shellHtml = function () { return '<div class="rz-bg" id="rzBg" hidden data-act="sheetclose"></div><div class="rz-sheet" id="rzSheet" hidden role="dialog" aria-modal="true"></div><div class="rz-tips" id="rzTips" hidden></div><div class="rz-toast" id="rzToast" hidden role="status" aria-live="polite"></div>'; };
    kit.sheetKind = function () { return sheetKind; };
    kit.shHead = function (title) { return '<div class="rz-sh-h"><b>' + esc(title) + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(t('close')) + '">' + ico('x') + '</button></div>'; };
    kit.openSheet = function (kind, html, o) {
      o = o || {}; var sh = $('#rzSheet'), bg = $('#rzBg'); sheetKind = kind;
      sh.style.transform = ''; sh.style.transition = '';
      sh.innerHTML = '<div class="rz-grab" aria-hidden="true"><i></i></div>' + html; sh.hidden = false; bg.hidden = false; kit.dpInit(); void sh.offsetWidth; sh.classList.add('open'); bg.classList.add('open');
      var f = sh.querySelector('input:not([type=hidden]):not([type=checkbox]),textarea'); if (f && !o.noFocus) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) {} }, 260);
    };
    kit.closeSheet = function () {
      var sh = $('#rzSheet'), bg = $('#rzBg'); if (sh.hidden) return; sh.style.transition = ''; sh.style.transform = ''; sh.classList.remove('open'); bg.classList.remove('open'); sheetKind = null;
      setTimeout(function () { if (!sheetKind) { sh.hidden = true; bg.hidden = true; sh.innerHTML = ''; } }, kit.reduce ? 0 : 260);
    };
    kit.fld = function (id, label, val, ph, extra) { return '<label class="rz-f" for="' + id + '"><span>' + esc(label) + '</span><input id="' + id + '" type="text" inputmode="numeric" autocomplete="off" data-fmt placeholder="' + esc(ph || '') + '" value="' + esc(val || '') + '"' + (extra || '') + '></label>'; };
    /* pastga tortib yopish */
    function swStart(e) {
      var z = e.target.closest('.rz-grab,.rz-sh-h'); if (!z || e.target.closest('.rz-x') || $('#rzSheet').hidden) return;
      sw = { y: e.clientY, t: performance.now(), dy: 0, id: e.pointerId }; try { z.setPointerCapture(e.pointerId); } catch (x) {}
      $('#rzSheet').style.transition = 'none';
    }
    function swMove(e) { if (!sw || e.pointerId !== sw.id) return; sw.dy = Math.max(0, e.clientY - sw.y); $('#rzSheet').style.transform = 'translateY(' + sw.dy + 'px)'; }
    function swEnd(e) {
      if (!sw || e.pointerId !== sw.id) return; var s = sw, sh = $('#rzSheet'); sw = null; sh.style.transition = '';
      var v = s.dy / Math.max(1, performance.now() - s.t);
      if (s.dy > 110 || (s.dy > 40 && v > 0.5)) kit.closeSheet(); else sh.style.transform = '';
    }
    root.addEventListener('pointerdown', swStart); root.addEventListener('pointermove', swMove); root.addEventListener('pointerup', swEnd); root.addEventListener('pointercancel', swEnd);

    /* ---------- toast ---------- */
    kit.toast = function (msg, undo, ok) {
      var el = $('#rzToast'); clearTimeout(undoTimer);
      el.innerHTML = (ok ? kit.okCheck() : '') + '<span class="tm">' + esc(msg) + '</span>' + (undo ? '<button type="button" data-act="undo">' + esc(t('cancel')) + '</button>' : '');
      el._undo = undo || null; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
      undoTimer = setTimeout(kit.hideToast, 5000);
    };
    kit.hideToast = function () { var el = $('#rzToast'); el.classList.remove('show'); setTimeout(function () { if (!el.classList.contains('show')) { el.hidden = true; el._undo = null; } }, 220); };

    /* ---------- raqam klaviaturasi: kind 'int000' (000 tugmali) | 'int' | 'dec' (kasr uchun vergul) ---------- */
    kit.padHtml = function (kind) {
      var k = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].concat(kind === 'dec' ? [',', '0'] : kind === 'int' ? ['', '0'] : ['000', '0']).concat(['del']);
      return '<div class="rz-pad">' + k.map(function (x) { return x === '' ? '<span></span>' : '<button type="button" data-act="key" data-k="' + x + '"' + (x === 'del' ? ' aria-label="⌫"' : '') + '>' + (x === 'del' ? '⌫' : x) + '</button>'; }).join('') + '</div>';
    };
    kit.padApply = function (val, k, o) {                 // o: {max (belgi soni), dec (kasr razryad soni, 0 = butun)}
      o = o || {}; var s = String(val || '');
      if (k === 'del') return s.slice(0, -1);
      if (k === ',') { if (!o.dec || s.indexOf(',') > -1) return s; return (s === '' ? '0' : s) + ','; }
      var next = s + k; if (s === '0' && k !== '000' && k !== ',') next = k; else if (s === '' && k === '000') return s;
      if (!o.dec) { next = next.replace(/^0+(?=\d)/, ''); if (next === '0') return ''; }
      var ip = next.split(',')[0], fp = next.split(',')[1];
      if (fp != null && fp.length > (o.dec || 0)) return s;
      if (ip.length > (o.max || 11)) return s;
      return next;
    };

    /* ---------- o'z sana tanlagichi ---------- */
    var DPQ = { inc: ['today', 'tomorrow', 'd5', 'd10', 'd15', 'd25', 'eom'], exp: ['today', 'yesterday'], past: ['today', 'yesterday'] };
    var qDate = kit.qDate = function (q) {
      var td = K.today(), p = K.parse(td);
      if (q === 'today') return td; if (q === 'tomorrow') return K.addDays(td, 1); if (q === 'yesterday') return K.addDays(td, -1);
      if (q === 'eom') return K.addDays(K.firstOfNextMonth(td), -1);
      var n = +q.slice(1), d = K.ymd(p.y, p.m, Math.min(n, K.dim(p.y, p.m)));
      return d >= td ? d : K.addMonthsDom(d, 1, n);
    };
    function qLabel(q) { return q === 'today' ? t('today') : q === 'tomorrow' ? t('tomorrow') : q === 'yesterday' ? t('yesterday') : q === 'eom' ? t('dEom') : t('dN', { n: q.slice(1) }); }
    kit.dpHtml = function (id, label, val, set, min, max) {
      return '<div class="rz-dpw"><span class="rz-fl">' + esc(label) + '</span><div class="rz-dp" id="' + id + '" data-v="' + esc(val || '') + '" data-set="' + set + '"' + (min ? ' data-min="' + min + '"' : '') + (max ? ' data-max="' + max + '"' : '') + '></div></div>';
    };
    kit.dpPaint = function (el) {
      var v = el.getAttribute('data-v'), min = el.getAttribute('data-min'), max = el.getAttribute('data-max'), cal = el._cal, h = '', td = K.today();
      h += '<div class="rz-dpv' + (v ? '' : ' none') + '" aria-live="polite">' + ico('cal') + '<b>' + esc(v ? kit.dLabel(v) : t('dNone')) + '</b></div><div class="rz-chips">';
      DPQ[el.getAttribute('data-set')].forEach(function (q) { var d = qDate(q); if ((min && d < min) || (max && d > max)) return; h += '<button type="button" class="rz-chip' + (v === d ? ' on' : '') + '" data-act="dpq" data-q="' + q + '">' + esc(qLabel(q)) + '</button>'; });
      h += '<button type="button" class="rz-chip alt' + (cal ? ' on' : '') + '" data-act="dpcal">' + esc(t('dBoshqa')) + '</button></div>';
      if (cal) {
        var wd0 = (new Date(Date.UTC(cal.y, cal.m - 1, 1)).getUTCDay() + 6) % 7, n = K.dim(cal.y, cal.m);
        h += '<div class="rz-cal"><div class="rz-calh"><button type="button" data-act="dpmon" data-s="-1" aria-label="‹">' + ico('back') + '</button><b>' + esc(kit.monthName(cal.m, true) + ' ' + cal.y) + '</b><button type="button" data-act="dpmon" data-s="1" aria-label="›">' + ico('chev') + '</button></div><div class="rz-calg">';
        KD[lang()].wd.forEach(function (w) { h += '<i>' + esc(w) + '</i>'; });
        for (var i = 0; i < wd0; i++) h += '<span></span>';
        for (var d = 1; d <= n; d++) { var ds = K.ymd(cal.y, cal.m, d), dis = (min && ds < min) || (max && ds > max); h += '<button type="button" data-act="dpday" data-d="' + ds + '"' + (dis ? ' disabled' : '') + (ds === v ? ' class="on"' : (ds === td ? ' class="td"' : '')) + '>' + d + '</button>'; }
        h += '</div></div>';
      }
      el.innerHTML = h;
    };
    kit.dpInit = function () { $$('.rz-dp').forEach(function (el) { if (!el._painted) { el._painted = true; kit.dpPaint(el); } }); };
    kit.dpGet = function (id) { var e = $('#' + id); return e ? e.getAttribute('data-v') || '' : ''; };
    kit.dpSet = function (el, v) { el.setAttribute('data-v', v); el._cal = null; kit.dpPaint(el); };

    /* ---------- umumiy harakatlar (sheet yopish, bekor qilish, sana tanlagich) ---------- */
    kit.act = function (a, el) {
      switch (a) {
        case 'sheetclose': kit.closeSheet(); return true;
        case 'undo': { var tt = $('#rzToast'), fn = tt._undo; kit.hideToast(); if (fn) { fn(); kit.vib(10); } return true; }
        case 'dpq': kit.dpSet(el.closest('.rz-dp'), qDate(el.getAttribute('data-q'))); return true;
        case 'dpday': kit.dpSet(el.closest('.rz-dp'), el.getAttribute('data-d')); return true;
        case 'dpcal': { var dp = el.closest('.rz-dp'), cv = K.parse(dp.getAttribute('data-v')) || K.parse(K.today()); dp._cal = dp._cal ? null : { y: cv.y, m: cv.m }; kit.dpPaint(dp); return true; }
        case 'dpmon': { var dq = el.closest('.rz-dp'), c = dq._cal, s = +el.getAttribute('data-s'); c.m += s; if (c.m < 1) { c.m = 12; c.y--; } if (c.m > 12) { c.m = 1; c.y++; } kit.dpPaint(dq); return true; }
        case 'tipnext': kit.tipsNext(); return true;
      }
      return false;
    };
    kit.flashEl = function (e) { if (!e) return; e.classList.add('err'); setTimeout(function () { e.classList.remove('err'); }, 600); try { if (e.focus && (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA')) e.focus({ preventScroll: true }); } catch (x) {} };

    /* ---------- birinchi marta yo'l-yo'riq: steps = [{ sel, key (ilova tarjimasi), pos: 'below'|'above', round: bool }] ---------- */
    var tip = { on: false, i: 0, steps: [], done: null };
    kit.tipsOn = function () { return tip.on; };
    kit.tipsStart = function (steps, done) { tip = { on: true, i: 0, steps: steps, done: done }; kit.tipsShow(); };
    kit.tipsShow = function () {
      var s = tip.steps[tip.i], layer = $('#rzTips'), el = s && $(s.sel);
      if (!el) { tip.on = false; layer.hidden = true; return; }
      var r = el.getBoundingClientRect(), rr = root.getBoundingClientRect(), pad = 8, below = s.pos === 'below';
      var pos = below ? 'top:' + Math.round(r.bottom - rr.top + pad + 14) + 'px' : 'bottom:' + Math.round(rr.bottom - r.top + pad + 14) + 'px';
      var dots = tip.steps.map(function (x, i) { return '<i class="' + (i === tip.i ? 'on' : '') + '"></i>'; }).join('');
      layer.innerHTML = '<div class="rz-spot" style="left:' + Math.round(r.left - rr.left - pad) + 'px;top:' + Math.round(r.top - rr.top - pad) + 'px;width:' + Math.round(r.width + pad * 2) + 'px;height:' + Math.round(r.height + pad * 2) + 'px;border-radius:' + (s.round ? '50%' : '22px') + '"></div>' +
        '<div class="rz-tipcard" role="dialog" aria-modal="true" style="' + pos + '"><p>' + esc(cfg.t(s.key)) + '</p><div class="f"><span class="rz-tdots" aria-label="' + esc(t('tipOf', { i: tip.i + 1, n: tip.steps.length })) + '">' + dots + '</span><button type="button" class="rz-btn primary sm" data-act="tipnext">' + esc(t('tipOk')) + '</button></div></div>';
      layer.hidden = false; var b = layer.querySelector('button'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {}
    };
    kit.tipsNext = function () {
      tip.i++;
      if (tip.i >= tip.steps.length) { var d = tip.done; tip.on = false; var l = $('#rzTips'); l.hidden = true; l.innerHTML = ''; if (d) d(); } else kit.tipsShow();
    };
    return kit;
  }
  window.RzKit = { create: create, esc: esc, fmt: fmt, digits: digits, spaced: spaced, ico: ico };
})();
