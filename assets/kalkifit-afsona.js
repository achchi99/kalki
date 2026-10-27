/* kalki.uz — KalkiFit «Afsona yoki haqiqat?» (maket: ~/afsona-maket.html). Kontent — data/afsonalar.json (statik, AI yo'q; manbalar docs/afsonalar.md).
 *  - Bugun: «Kunning savoli» (kuniga bitta karta; javob berilgach yoki yopilgach — ertagacha yo'q; ilovaning 3-kunidan) — app.slotHtml navbatida eng pastda.
 *  - To'liq ekran: ✕ · progress (javob berilgan / 30) · ✓ soni; karta to'plami (orqada 2 xira karta); ❌ Afsona / ✓ Haqiqat yoki kartani chapga/o'ngga surish
 *    (barmoqqa ergashadi, buriladi; chegaradan o'tmasa — prujinali qaytadi). Javob: 3D ag'darilish (~450 ms), belgi, «✓ Topdingiz!» / «Bu safar emas», afsonada da'vo ustidan chiziladi,
 *    tushuntirish, maslahat (ilova joyiga havola), manba, «Ulashish» (rasm), to'g'rida bir martalik konfetti. 5 tadan keyin — yakun; hammasi tugasa — natija.
 *  - «Qisman» kartada ikkala javob ham «qisman to'g'ri» (to'g'ri deb sanaladi).  prefers-reduced-motion — animatsiyasiz.
 *  Holat (st.afsona, akkaunt zaxirasiga kiradi): { a: { id: 'a'|'h' }, ok: { id: 1 }, dq: { d, id, x } }.  Matn: UZ/RU (ЎЗ — sahifa translit'i).
 *  var A = KalkiAfsona.create({ root, lang, state, save, ev, go, share, reduce, today, haptic });  A.teaserHtml(); A.open({ from, id, pick }); A.close(); A.isOpen() */
(function (root, factory) { var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiAfsona = api; })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var URL_ = '/data/afsonalar.json', PER = 5;
  var TX = {
    uz: { kicker: 'Afsona yoki haqiqat? · 1 daqiqa', af: 'Afsona', hq: 'Haqiqat', close: 'Yopish', think: 'Nima deb o\'ylaysiz?', swipe: 'yoki kartani chapga / o\'ngga suring', next: 'Keyingisi →',
      vA: 'AFSONA', vH: 'HAQIQAT', vQ: 'QISMAN', okY: '✓ Topdingiz!', okN: 'Bu safar emas', okQ: '✓ Qisman to\'g\'ri', src: 'Manba', share: 'Ulashish', tipGo: 'Ochish',
      m_ozish: 'Ozish', m_ovqat: 'Ovqat', m_harakat: 'Harakat', m_tana: 'Tana', sumT: '{n} tadan {k} tasini topdingiz', sumS: 'Har kuni bitta savol — ertaga yangisi.', more: 'Yana {n} ta', tomorrow: 'Ertaga davom',
      endT: 'Hammasini ko\'rdingiz!', endS: '{n} tadan {k} tasini topdingiz. Yangi kartalar tez orada.', prog: 'Javob berilgan: {a} / {n} · to\'g\'ri: {k}', load: 'Yuklanmoqda…', err: 'Kartalar yuklanmadi. Internetni tekshiring.', again: 'Qayta urinish',
      left: 'Afsona', right: 'Haqiqat', shareFoot: 'KalkiFit · Afsona yoki haqiqat?' },
    ru: { kicker: 'Миф или правда? · 1 минута', af: 'Миф', hq: 'Правда', close: 'Закрыть', think: 'Как вы думаете?', swipe: 'или смахните карточку влево / вправо', next: 'Дальше →',
      vA: 'МИФ', vH: 'ПРАВДА', vQ: 'ОТЧАСТИ', okY: '✓ Угадали!', okN: 'В этот раз нет', okQ: '✓ Отчасти верно', src: 'Источник', share: 'Поделиться', tipGo: 'Открыть',
      m_ozish: 'Похудение', m_ovqat: 'Еда', m_harakat: 'Движение', m_tana: 'Тело', sumT: 'Угадано {k} из {n}', sumS: 'Каждый день — один вопрос, завтра новый.', more: 'Ещё {n}', tomorrow: 'Продолжить завтра',
      endT: 'Вы прошли все карточки!', endS: 'Угадано {k} из {n}. Скоро будут новые.', prog: 'Отвечено: {a} / {n} · верно: {k}', load: 'Загрузка…', err: 'Карточки не загрузились. Проверьте интернет.', again: 'Повторить',
      left: 'Миф', right: 'Правда', shareFoot: 'KalkiFit · Миф или правда?' }
  };
  function fill(s, o) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return o && o[k] != null ? o[k] : m; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /* sof mantiq (testlanadi) */
  function isOk(card, ch) { return card.j === 'qisman' ? true : (ch === 'a' ? card.j === 'afsona' : card.j === 'haqiqat'); }
  function norm(s) { s = s && typeof s === 'object' ? s : {}; return { a: s.a && typeof s.a === 'object' ? s.a : {}, ok: s.ok && typeof s.ok === 'object' ? s.ok : {}, dq: s.dq && typeof s.dq === 'object' ? s.dq : null }; }
  function score(items, s) { var a = 0, k = 0; items.forEach(function (c) { if (s.a[c.id]) { a++; if (s.ok[c.id]) k++; } }); return { a: a, k: k, n: items.length }; }
  function unanswered(items, s) { return items.filter(function (c) { return !s.a[c.id]; }); }
  function dayPick(items, s, day) { var u = unanswered(items, s); if (!u.length) return null; return u[hash('kf-afsona|' + day) % u.length]; }          // kunga barqaror, mavzular aralash (tasodifiy)
  function order(items, s, seed) { var u = unanswered(items, s).slice(); u.sort(function (x, y) { return hash(seed + x.id) - hash(seed + y.id); }); return u; }
  function create(cfg) {
    var data = null, loading = false, waits = [], el = null, sess = null, me = {};
    function lg() { return cfg.lang && cfg.lang() === 'ru' ? 'ru' : 'uz'; }
    function T(k, o) { return fill(TX[lg()][k] != null ? TX[lg()][k] : TX.uz[k], o); }
    function st() { return norm(cfg.state()); }
    function put(s) { cfg.state(s); if (cfg.save) cfg.save(); }
    function ev(h, k) { try { if (cfg.ev) cfg.ev(h, k); } catch (e) {} }
    function rm() { try { return !!(cfg.reduce && cfg.reduce()) || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
    function load(cb) {
      if (data) { cb(data); return; } waits.push(cb); if (loading) return; loading = true;
      var done = function (d) { loading = false; if (d && Array.isArray(d.items)) data = d.items; var w = waits; waits = []; w.forEach(function (f) { f(data); }); };
      try { fetch(URL_).then(function (r) { return r.ok ? r.json() : null; }).then(done, function () { done(null); }); } catch (e) { done(null); }
    }
    me.load = load; me.ready = function () { return !!data; }; me.items = function () { return data || []; };
    /* ---- Bugun: «Kunning savoli» ---- */
    me.todayCard = function () { if (!data) return null; var s = st(), d = cfg.today(); if (s.dq && s.dq.d === d) { if (s.dq.x) return null; var c0 = data.filter(function (c) { return c.id === s.dq.id; })[0]; if (c0 && !s.a[c0.id]) return c0; } return dayPick(data, s, d); };
    me.teaserHtml = function () {
      var c = me.todayCard(); if (!c) return ''; var s = st(), d = cfg.today(); if (!s.dq || s.dq.d !== d || s.dq.id !== c.id) { s.dq = { d: d, id: c.id }; put(s); ev('afsona', 'korsatildi'); }
      var L = c[lg()];
      return '<section class="af-tz" id="afTz" aria-label="' + esc(T('kicker')) + '"><small>' + esc(T('kicker')) + '</small><b>' + esc(L.d) + '</b><div class="af-tzb"><button type="button" data-act="aftz" data-v="a">❌ ' + esc(T('af')) + '</button><button type="button" data-act="aftz" data-v="h">✓ ' + esc(T('hq')) + '</button></div></section>';
    };
    me.dqDone = function () { var s = st(), d = cfg.today(); if (s.dq && s.dq.d === d && !s.dq.x) { s.dq.x = 1; put(s); } };
    /* ---- to'liq ekran ---- */
    me.isOpen = function () { return !!el; };
    me.open = function (o) {
      o = o || {}; if (el) return; ev('afsona', 'kirish.' + (o.from === 'kun' ? 'kun' : 'feat'));
      el = document.createElement('div'); el.className = 'af-ov' + (rm() ? ' rm' : ''); el.id = 'afOv'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', T('kicker'));
      (cfg.root || document.body).appendChild(el); document.documentElement.classList.add('af-on'); el.addEventListener('click', onClick); el.addEventListener('keydown', onKey);
      el.innerHTML = '<div class="af-top"><button type="button" class="af-x" data-act="afx" aria-label="' + esc(T('close')) + '">✕</button></div><div class="af-ld">' + esc(T('load')) + '</div>';
      load(function (d) {
        if (!el) return; if (!d) { el.innerHTML = topHtml() + '<div class="af-ld"><p>' + esc(T('err')) + '</p><button type="button" class="af-nx" data-act="afretry">' + esc(T('again')) + '</button></div>'; return; }
        var s = st(); sess = { from: o.from || 'feat', n: 0, k: 0, list: order(d, s, cfg.today() + '|' + Object.keys(s.a).length), i: 0, ans: null };
        if (o.id) { sess.list = sess.list.filter(function (c) { return c.id !== o.id; }); var c1 = d.filter(function (c) { return c.id === o.id; })[0]; if (c1 && !s.a[c1.id]) sess.list.unshift(c1); }
        draw(); if (o.pick) setTimeout(function () { answer(o.pick, null); }, rm() ? 0 : 60);
        setTimeout(function () { var b = el && el.querySelector('.af-btn.af'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }, 30);
      });
    };
    me.close = function () {
      if (!el) return; var e0 = el; el = null; document.documentElement.classList.remove('af-on'); if (sess && sess.from === 'kun') me.dqDone(); sess = null;
      if (rm()) e0.remove(); else { e0.classList.add('out'); setTimeout(function () { e0.remove(); }, 220); } if (cfg.onClose) cfg.onClose();
    };
    function cur() { return sess && sess.list[sess.i]; }
    function topHtml() {
      var sc = data ? score(data, st()) : { a: 0, k: 0, n: 30 };
      return '<div class="af-top"><button type="button" class="af-x" data-act="afx" aria-label="' + esc(T('close')) + '">✕</button><div class="af-pg" role="progressbar" aria-valuemin="0" aria-valuemax="' + sc.n + '" aria-valuenow="' + sc.a + '" aria-label="' + esc(T('prog', sc)) + '"><i style="width:' + (sc.n ? Math.round(sc.a / sc.n * 1000) / 10 : 0) + '%"></i></div><span class="af-sc" aria-hidden="true">' + sc.a + ' / ' + sc.n + ' · ' + sc.k + ' ✓</span></div>';
    }
    function frontHtml(c) { var L = c[lg()], idx = data.indexOf(c) + 1; return '<div class="af-face af-fr"><span class="af-tag">' + esc(T('m_' + c.m)) + ' · ' + idx + '/' + data.length + '</span><div class="af-emo" aria-hidden="true">' + esc(c.e) + '</div><div class="af-q" id="afQ">' + esc(L.d) + '</div><div class="af-hint">' + esc(T('think')) + '</div><i class="af-lbl l" aria-hidden="true">' + esc(T('left')) + '</i><i class="af-lbl r" aria-hidden="true">' + esc(T('right')) + '</i></div>'; }
    function backHtml(c, ch) {
      var L = c[lg()], ok = isOk(c, ch), v = c.j === 'afsona' ? 'A' : (c.j === 'haqiqat' ? 'H' : 'Q');
      return '<div class="af-face af-bk"><div class="af-verd"><span class="af-vb v' + v + '">' + esc(T('v' + v)) + '</span><span class="af-ok ' + (ok ? 'y' : 'n') + '">' + esc(c.j === 'qisman' ? T('okQ') : (ok ? T('okY') : T('okN'))) + '</span></div>' +
        '<div class="af-q2' + (c.j === 'afsona' ? ' st' : '') + '">' + esc(L.d) + '</div><p class="af-ex">' + esc(L.t) + '</p>' +
        (c.go ? '<button type="button" class="af-tip" data-act="afgo" data-k="' + esc(c.go) + '"><span aria-hidden="true">💡</span><span>' + esc(L.m) + '</span><b>' + esc(T('tipGo')) + ' ›</b></button>' : '<div class="af-tip"><span aria-hidden="true">💡</span><span>' + esc(L.m) + '</span></div>') +
        '<div class="af-src"><span>' + esc(T('src')) + ': ' + esc(c.s) + '</span><button type="button" data-act="afshare">' + esc(T('share')) + ' ↗</button></div></div>';
    }
    function draw() {
      if (!el || !sess) return; var c = cur();
      if (!c || sess.sum) { el.innerHTML = topHtml() + sumHtml(); return; }
      el.innerHTML = topHtml() + '<div class="af-deck" id="afDeck"><div class="af-c b2" aria-hidden="true"></div><div class="af-c b1" aria-hidden="true"></div><div class="af-c top" id="afCard"><div class="af-in">' + frontHtml(c) + '</div></div><div class="af-cf" id="afCf" aria-hidden="true"></div></div>' +
        '<div class="af-ans" id="afAns"><button type="button" class="af-btn af" data-act="afans" data-v="a">❌ ' + esc(T('af')) + '</button><button type="button" class="af-btn hq" data-act="afans" data-v="h">✓ ' + esc(T('hq')) + '</button></div><p class="af-sw" id="afSw">' + esc(T('swipe')) + '</p>';
      swipe(el.querySelector('#afCard'));
    }
    function sumHtml() {
      var sc = score(data, st()), left = unanswered(data, st()).length;
      if (!left) return '<div class="af-sum"><div class="af-emo" aria-hidden="true">🏁</div><h2>' + esc(T('endT')) + '</h2><p>' + esc(T('endS', { n: sc.n, k: sc.k })) + '</p><button type="button" class="af-nx" data-act="afx">' + esc(T('close')) + '</button></div>';
      return '<div class="af-sum"><div class="af-emo" aria-hidden="true">🎯</div><h2>' + esc(T('sumT', { n: sess.n, k: sess.k })) + '</h2><p>' + esc(T('sumS')) + '</p><button type="button" class="af-nx" data-act="afmore">' + esc(T('more', { n: Math.min(PER, left) })) + '</button><button type="button" class="af-nx gh" data-act="afx">' + esc(T('tomorrow')) + '</button></div>';
    }
    function answer(ch, dx) {
      var c = cur(); if (!c || sess.ans) return; var s = st(), ok = isOk(c, ch); sess.ans = ch;
      s.a[c.id] = ch; if (ok) s.ok[c.id] = 1; else delete s.ok[c.id]; if (s.dq && s.dq.d === cfg.today() && s.dq.id === c.id) s.dq.x = 1; put(s);
      sess.n++; if (ok) sess.k++; ev('afsona_javob', c.id + (ok ? '.ok' : '.xato'));
      var card = el.querySelector('#afCard'), inr = card && card.querySelector('.af-in'); if (!card || !inr) return;
      inr.insertAdjacentHTML('beforeend', backHtml(c, ch)); card.classList.add('ans');
      var flip = function () { card.classList.add('flip'); el.querySelector('.af-deck').classList.add('done'); var a = el.querySelector('#afAns'); a.innerHTML = '<button type="button" class="af-nx" data-act="afnext">' + esc(T('next')) + '</button>'; var sw = el.querySelector('#afSw'); if (sw) sw.remove(); var pg = el.querySelector('.af-top'); if (pg) pg.outerHTML = topHtml();
        if (ok && c.j !== 'qisman') confetti(); setTimeout(function () { var q = el && el.querySelector('.af-bk'); if (q) { q.setAttribute('tabindex', '-1'); try { q.focus({ preventScroll: true }); } catch (e) {} } }, rm() ? 0 : 460); if (cfg.haptic) cfg.haptic(ok); };
      if (dx != null && !rm()) { card.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1)'; card.style.transform = ''; setTimeout(function () { card.style.transition = ''; flip(); }, 200); } else { card.style.transform = ''; flip(); }
    }
    function next() { if (!sess) return; sess.ans = null; sess.i++; if (sess.n > 0 && sess.n % PER === 0) sess.sum = true; draw(); }
    function confetti() {
      if (rm() || me._cf) return; me._cf = 1; var box = el && el.querySelector('#afCf'); if (!box) return; var cols = ['#E4572E', '#6D4AE0', '#0E8F63', '#E8B23A'], h = '';
      for (var i = 0; i < 14; i++) h += '<i style="left:' + (8 + i * 6.3).toFixed(1) + '%;background:' + cols[i % 4] + ';--r:' + ((i * 47) % 180 - 90) + 'deg;--d:' + (i % 5) * 60 + 'ms"></i>';
      box.innerHTML = h; setTimeout(function () { if (box) box.innerHTML = ''; me._cf = 0; }, 1300);
    }
    /* surish: barmoqqa ergashadi, buriladi; chegaradan o'tsa — javob (chap — afsona, o'ng — haqiqat), aks holda prujinali qaytadi */
    function swipe(card) {
      if (!card) return; var x0 = 0, y0 = 0, dx = 0, on = false, id = null, t0 = 0, horiz = null;
      card.addEventListener('pointerdown', function (e) { if (sess.ans || e.button > 0) return; on = true; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; t0 = Date.now(); horiz = null; card.style.transition = 'none'; });
      card.addEventListener('pointermove', function (e) {
        if (!on || e.pointerId !== id) return; dx = e.clientX - x0; var dy = e.clientY - y0; if (horiz == null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) { horiz = Math.abs(dx) > Math.abs(dy); if (horiz) try { card.setPointerCapture(id); } catch (x) {} }
        if (!horiz) return; card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 18).toFixed(2) + 'deg)'; card.classList.toggle('gl', dx < -20); card.classList.toggle('gr', dx > 20);
      });
      var end = function (e) {
        if (!on || (e && e.pointerId !== id)) return; on = false; card.classList.remove('gl', 'gr'); if (!horiz) { card.style.transition = ''; return; }
        var w = card.offsetWidth || 320, v = Math.abs(dx) / Math.max(1, Date.now() - t0);
        if (Math.abs(dx) > w * 0.28 || (Math.abs(dx) > 40 && v > 0.6)) { answer(dx < 0 ? 'a' : 'h', dx); return; }
        card.style.transition = rm() ? 'none' : 'transform .42s cubic-bezier(.34,1.56,.64,1)'; card.style.transform = '';
      };
      card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
    }
    /* ulashish: karta rasm (1080×1350) */
    function shareCanvas(c, ch) {
      var cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; var x = cv.getContext('2d'), L = c[lg()], v = c.j === 'afsona' ? 'A' : (c.j === 'haqiqat' ? 'H' : 'Q');
      var tr = function (s) { try { return document.documentElement.getAttribute('data-script') === 'cyr' && window.KalkiTranslit ? window.KalkiTranslit.translit(s) : s; } catch (e) { return s; } };
      var g = x.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, '#6D4AE0'); g.addColorStop(1, '#4E34C4'); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
      x.fillStyle = '#FFFFFF'; x.beginPath(); if (x.roundRect) x.roundRect(70, 160, 940, 1020, 56); else x.rect(70, 160, 940, 1020); x.fill();
      x.fillStyle = 'rgba(255,255,255,.92)'; x.font = '600 40px Manrope, system-ui, sans-serif'; x.fillText(tr(T('kicker')), 70, 110);
      var col = v === 'A' ? '#C8402B' : (v === 'H' ? '#0E8F63' : '#9A6700'); x.fillStyle = col; x.font = '800 44px Manrope, system-ui, sans-serif'; var vt = tr(T('v' + v)), vw = x.measureText(vt).width + 48;
      x.beginPath(); if (x.roundRect) x.roundRect(130, 230, vw, 76, 20); else x.rect(130, 230, vw, 76); x.fill(); x.fillStyle = '#FFFFFF'; x.fillText(vt, 154, 284);
      var wrap = function (s, fx, fy, maxW, lh, font, color, max) { x.font = font; x.fillStyle = color; var ws = tr(s).split(' '), line = '', y = fy, n = 0; for (var i = 0; i < ws.length; i++) { var t = line ? line + ' ' + ws[i] : ws[i]; if (x.measureText(t).width > maxW && line) { x.fillText(line, fx, y); y += lh; line = ws[i]; if (++n >= max - 1) { line = ws.slice(i).join(' '); while (x.measureText(line + '…').width > maxW && line.length > 4) line = line.slice(0, -2); line += (i < ws.length - 1 ? '…' : ''); break; } } else line = t; } x.fillText(line, fx, y); return y + lh; };
      var y = wrap(L.d, 130, 400, 820, 72, '800 60px Manrope, system-ui, sans-serif', '#231A14', 4);
      wrap(L.t, 130, y + 30, 820, 54, '500 38px Manrope, system-ui, sans-serif', '#3D3128', 8);
      x.fillStyle = 'rgba(255,255,255,.95)'; x.font = '700 38px Manrope, system-ui, sans-serif'; x.fillText(tr(T('shareFoot')) + ' · kalki.uz', 70, 1270);
      return cv;
    }
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); me.close(); } else if (sess && !sess.ans && cur() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !/INPUT|TEXTAREA/.test((e.target || {}).tagName || '')) { e.preventDefault(); answer(e.key === 'ArrowLeft' ? 'a' : 'h', null); } }
    function onClick(e) {
      var b = e.target.closest && e.target.closest('[data-act]'); if (!b) return; var a = b.getAttribute('data-act');
      if (a === 'afx') me.close(); else if (a === 'afans') answer(b.getAttribute('data-v'), null); else if (a === 'afnext') next(); else if (a === 'afmore') { sess.sum = false; draw(); } else if (a === 'afretry') { var f = sess ? sess.from : 'feat'; me.close(); me.open({ from: f }); }
      else if (a === 'afgo') { var k = b.getAttribute('data-k'); me.close(); if (cfg.go) setTimeout(function () { cfg.go(k); }, rm() ? 0 : 240); }
      else if (a === 'afshare') { var c = cur(); if (c && cfg.share) { ev('afsona', 'ulashildi'); cfg.share(shareCanvas(c, sess.ans), 'kalkifit-afsona.png'); } }
    }
    me._answer = function (ch) { answer(ch, null); };          // faqat test
    return me;
  }
  return { create: create, isOk: isOk, norm: norm, score: score, dayPick: dayPick, order: order, unanswered: unanswered, PER: PER, TX: TX };
});
