/* kalki.uz — KalkiFit: «Haftangiz» — Wrapped uslubidagi to'liq ekranli hikoya (v76).
   BITTA doimiy qatlam: position:fixed; inset:0; OPAQ fon — slaydlar shu qatlam ICHIDA almashadi (qatlam slaydlar orasida yopilmaydi/qayta yaratilmaydi);
   chiquvchi slayd kiruvchi to'liq qoplaguncha ostida qoladi → hech bir kadrda orqadagi ekran ko'rinmaydi. Keyingi slayd oldindan tayyor (DOM + rasmlar preload).
   Format: tepada progress chiziqlari; o'ngga bosish — keyingi, chapga — oldingi, bosib turish — pauza, pastga surish — yopish; har slayd ~6 s.
   Animatsiya: faqat transform/opacity (+ kichik SVG halqa), count-up (rAF), yengil canvas konfetti; prefers-reduced-motion (o.reduce) — animatsiyasiz.
   Ma'lumot — assets/kalkifit-hafta.js model(); matnlar o.t(kalit, parametr) (ilova lug'ati: wr*). Serverga hech narsa ketmaydi; ulashish rasmi (9:16) VAZNSIZ.
   window.KalkiHikoya / require() */
(function (root) {
  'use strict';
  var DUR = 6000, F = 'Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nf(n) { return String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function dec(x, d) { return (Math.round((+x || 0) * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace('.', ','); }
  /* nishon ikonkalari (24×24 yo'llar; DOM va canvas uchun bitta joyda) */
  var ICONS = { flame: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z', target: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 11.5a.5.5 0 1 0 0 1', shield: 'M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z M9 12l2 2 4-4',
    drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z', shoe: 'M3 16c4 0 5-3 6-6l4 2c1 2 3 3 6 3a2 2 0 0 1 2 2v1H3z', bolt: 'M13 2L5 13h6l-1 9 8-11h-6z', scale: 'M12 4v16 M6 20h12 M5 8l-3 7a3 3 0 0 0 6 0zM19 8l-3 7a3 3 0 0 0 6 0z M5 8h14', leaf: 'M5 19C5 10 10 5 20 4c0 10-5 15-14 15 M5 19c2-4 5-7 9-9',
    cam: 'M4 8h3l2-3h6l2 3h3v11H4z M12 11a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z', up: 'M12 19V5 M6 11l6-6 6 6', down: 'M12 5v14 M6 13l6 6 6-6', check: 'M5 12l5 5 9-10', warn: 'M12 3l10 18H2z M12 10v5 M12 18v.5' };
  function svgI(name, cls) { return '<svg class="hk-ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + ICONS[name] + '"/></svg>'; }
  var G_ = { intro: 1, days: 2, kcal: 3, lost: 4, fun: 5, top: 6, macros: 7, water: 8, move: 9, weight: 10, vs: 11, badges: 12, goal: 13, final: 14 };
  /* ============================ slayd qismlari ============================ */
  function dowOf(o, i) { return (o.dow || [])[i] || ''; }
  function sDays(m, o) {
    var t = o.t, n = m.logged, circ = m.rows.map(function (r, i) { return '<div class="c' + (r.logged ? ' on' : '') + '" style="--i:' + i + '"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" class="bg"/><circle cx="20" cy="20" r="17" class="fg"/></svg><i>' + svgI('check') + '</i><span>' + esc(dowOf(o, r.dow)) + '</span></div>'; }).join('');
    return '<p class="hk-k">' + esc(t('wrDaysK')) + '</p><h2 class="hk-num"><b data-cu="' + n + '">0</b><small> / 7</small></h2><div class="hk-days7">' + circ + '</div><p class="hk-sub">' + esc(n >= 3 ? t('wrStreak', { n: m.streakMax }) : (n ? t('wrFewDays') : t('wrNoDays'))) + '</p>';
  }
  function sKcal(m, o) {
    var t = o.t, mx = Math.max(m.target || 1, Math.max.apply(null, m.rows.map(function (r) { return r.k; }).concat([1]))) * 1.1, g = (m.target || 0) / mx;
    var bars = m.rows.map(function (r, i) { var cl = r.d === m.best ? 'best' : (r.state === 'near' ? 'near' : (r.k ? '' : 'nil')); return '<div class="c"><i class="' + cl + '" style="--h:' + (r.k / mx).toFixed(3) + ';--i:' + i + '"></i><span>' + esc(dowOf(o, r.dow)) + '</span></div>'; }).join('');
    return '<p class="hk-k">' + esc(t('wrKcalK')) + '</p><h2 class="hk-num"><b data-cu="' + (m.avgKcal || 0) + '">0</b><small> ' + esc(t('kcal')) + '</small></h2><p class="hk-sub">' + esc(t('wrAvgVs', { g: nf(m.target) })) + '</p><div class="hk-bars7" style="--g:' + g.toFixed(3) + '">' + bars + '</div>' +
      (m.best ? '<p class="hk-pill">' + svgI('target') + '<span>' + esc(t('wrBestDay', { d: o.dayName(m.best) })) + '</span></p>' : '<p class="hk-hint">' + esc(t('wrFewK')) + '</p>');
  }
  function sLost(m, o) {
    var t = o.t, L = m.lost, per = '', mx = Math.max.apply(null, L.per.map(function (x) { return Math.abs(x.diff); }).concat([1]));
    per = '<div class="hk-mini7">' + L.per.map(function (x, i) { return '<div class="c"><i class="' + (x.diff < 0 ? 'neg' : '') + '" style="--h:' + (Math.abs(x.diff) / mx).toFixed(3) + ';--i:' + i + '"></i><span>' + esc(dowOf(o, x.dow)) + '</span></div>'; }).join('') + '</div>';
    var foot = '<p class="hk-foot">' + esc(t('wrLostNote')) + '</p>', ndays = '<p class="hk-sub sm">' + esc(t('wrNDays', { n: L.nDays })) + '</p>';
    if (L.low) return '<p class="hk-k">' + esc(t('wrLostK')) + '</p><div class="hk-warn">' + svgI('warn') + '</div><h2 class="hk-big sm">' + esc(t('wrLow')) + '</h2><p class="hk-sub">' + esc(t('wrLowD', { e: nf(L.avgEaten), b: nf(L.avgBmr) })) + '</p>' + ndays + foot;
    if (L.state === 'even') return '<p class="hk-k">' + esc(t('wrLostK')) + '</p><div class="hk-keep">' + svgI('scale') + '</div><h2 class="hk-big sm">' + esc(t('wrEven')) + '</h2><p class="hk-sub">' + esc(t('wrEvenD', { x: nf(Math.abs(L.total)) })) + '</p>' + ndays + foot;
    if (L.state === 'surplus') return '<p class="hk-k">' + esc(t('wrLostK')) + '</p><h2 class="hk-num calm"><b data-cu="' + Math.abs(L.total) + '">0</b><small> ' + esc(t('kcal')) + '</small></h2><p class="hk-sub">' + esc(t('wrSurplus', { x: nf(Math.abs(L.total)) })) + '</p>' + ndays + foot;
    var end = Math.max(0.22, 1 - Math.min(1, L.kg / 1.0) * 0.78);
    return '<p class="hk-k">' + esc(t('wrLostK')) + '</p><h2 class="hk-num"><span>≈ </span><b data-cu="' + Math.abs(L.total) + '">0</b><small> ' + esc(t('kcal')) + '</small></h2>' +
      '<div class="hk-fat" style="--end:' + end.toFixed(3) + '"><div class="hk-cube"><i class="sh"></i></div><u class="d1"></u><u class="d2"></u><u class="d3"></u><u class="d4"></u><u class="d5"></u></div>' +
      '<p class="hk-sub">' + esc(t('wrSavedLine', { kg: dec(L.kg, L.kg < 1 ? 2 : 1) })) + '</p><p class="hk-pill alt"><span>' + esc(t('wrPacks', { n: dec(L.packs, 1) })) + '</span></p>' + per + ndays + foot;
  }
  function sFun(m, o) {
    var t = o.t, f = m.fun, k = Math.min(12, Math.max(1, Math.round(f.n))), icons = ''; for (var i = 0; i < k; i++) icons += '<i style="--i:' + i + '">' + (f.img ? '<img src="' + esc(f.img) + '" alt="" width="44" height="44">' : '<b>' + esc(String(f.name).charAt(0)) + '</b>') + '</i>';
    return '<p class="hk-k">' + esc(t('wrFunK')) + '</p><h2 class="hk-num"><b data-cu="' + Math.round(f.kcal) + '">0</b><small> ' + esc(t('kcal')) + '</small></h2><p class="hk-sub">' + esc(t('wrFunIs')) + '</p>' +
      '<h2 class="hk-big sm">' + esc(t('wrFunU_' + f.unit, { n: dec(f.n, f.n < 10 && f.n % 1 ? 1 : 0), x: f.name })) + '</h2><div class="hk-pop">' + icons + '</div>';
  }
  function sTop(m, o) {
    var t = o.t, a = m.top, rows = a.map(function (x, i) { return '<div class="r" style="--i:' + i + '"><span class="n">' + (i + 1) + '</span>' + (x.img ? '<img src="' + esc(x.img) + '" alt="" width="56" height="56">' : '<em>' + esc(String(x.name || '?').charAt(0)) + '</em>') + '<b>' + esc(x.name) + '</b><span class="q"><b data-cu="' + x.n + '">0</b> ' + esc(t('wrTimes')) + '</span></div>'; }).join('');
    return '<p class="hk-k">' + esc(t('wrTopK')) + '</p><h2 class="hk-big sm">' + esc(t('wrTopH', { n: a[0].n, x: a[0].name })) + '</h2><div class="hk-top3">' + rows + '</div>';
  }
  function sMacros(m, o) {
    var t = o.t, M = m.macros, C = 2 * Math.PI * 44, off = 0, seg = '', cols = ['p', 'f', 'c'];
    M.sh.forEach(function (s, i) { var len = Math.max(0, s * C - 3); seg += '<circle cx="60" cy="60" r="44" class="s ' + cols[i] + '" style="--c:' + C.toFixed(1) + ';--l:' + len.toFixed(1) + ';--o:' + (-off).toFixed(1) + ';--i:' + i + '"/>'; off += s * C; });
    var key = function (c, v, lbl) { return '<div class="k ' + c + '"><i></i><span>' + esc(lbl) + '</span><b>' + nf(v) + ' ' + esc(t('wrG')) + '</b></div>'; };
    return '<p class="hk-k">' + esc(t('wrMacroK')) + '</p><div class="hk-donut"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="44" class="bg"/>' + seg + '</svg><div class="mid"><b data-cu="' + (m.avgKcal || Math.round(m.sumKcal / Math.max(1, m.logged))) + '">0</b><small>' + esc(t('wrPerDay')) + '</small></div></div>' +
      '<div class="hk-keys">' + key('p', M.p, t('mP')) + key('f', M.f, t('mF')) + key('c', M.c, t('mC')) + '</div>' + (M.protGoal ? '<p class="hk-pill">' + svgI('shield') + '<span>' + esc(t('wrProtDays', { n: M.protDays })) + '</span></p>' : '');
  }
  function sWater(m, o) {
    var t = o.t, W = m.water, gl = W.per.map(function (x, i) { var f = Math.max(0, Math.min(1, x.ml / (W.goal || 2000))); return '<div class="g" style="--i:' + i + ';--f:' + f.toFixed(3) + '"><svg viewBox="0 0 40 60" aria-hidden="true"><defs><clipPath id="hkw' + i + '"><path d="M5 4h30l-4 52H9z"/></clipPath></defs><g clip-path="url(#hkw' + i + ')"><rect x="0" y="0" width="40" height="60" class="w"/></g><path d="M5 4h30l-4 52H9z" class="o"/></svg><span>' + esc(dowOf(o, x.dow)) + '</span></div>'; }).join('');
    return '<p class="hk-k">' + esc(t('wrWaterK')) + '</p><h2 class="hk-num"><b data-cu="' + W.liters + '" data-dec="1">0</b><small> ' + esc(t('wrLiters')) + '</small></h2><div class="hk-glasses">' + gl + '</div><p class="hk-sub">' + esc(W.goalDays >= 1 ? t('wrWaterDays', { n: W.goalDays }) : t('wrWaterFew')) + '</p>';
  }
  function sMove(m, o) {
    var t = o.t, V = m.move, rt = V.route, line = '';
    if (rt) line = rt.part ? t('wrRoutePart', { a: rt.a, b: rt.b, p: Math.round(rt.times * 100) }) : t('wrRoute', { a: rt.a, b: rt.b, n: dec(rt.times, rt.times % 1 ? 1 : 0) });
    return '<p class="hk-k">' + esc(t('wrMoveK')) + '</p><h2 class="hk-num"><b data-cu="' + V.steps + '">0</b><small> ' + esc(t('wrSteps')) + '</small></h2>' + (V.km ? '<p class="hk-sub"><span class="hk-arrow">' + svgI('shoe') + '</span><b>≈ ' + dec(V.km, 1) + ' ' + esc(t('wrKm')) + '</b></p>' : '') + (line ? '<p class="hk-pill alt"><span>' + esc(line) + '</span></p>' : '') +
      (V.exMin ? '<div class="hk-chips"><span>' + svgI('bolt') + '<b data-cu="' + V.exMin + '">0</b> ' + esc(t('wrMin')) + '</span><span><b data-cu="' + V.exKcal + '">0</b> ' + esc(t('wrBurn')) + '</span></div>' : '');
  }
  function sWeight(m, o) {
    var t = o.t, d = m.weight.delta, dir = d < 0 ? 'down' : (d > 0 ? 'up' : 'same');
    return '<p class="hk-k">' + esc(t('wrWeightK')) + '</p><h2 class="hk-num"><span class="hk-dir ' + dir + '">' + (dir === 'same' ? '=' : svgI(dir)) + '</span><b>' + (d > 0 ? '+' : (d < 0 ? '−' : '')) + dec(Math.abs(d), 1) + '</b><small> ' + esc(t('wrKg')) + '</small></h2><p class="hk-sub">' + esc(t(d === 0 ? 'wrWSame' : 'wrWChg')) + '</p><p class="hk-foot">' + esc(t('wrWNote')) + '</p>';
  }
  function sVs(m, o) {
    var t = o.t, rows = m.vs.map(function (v, i) { var good = v.dir === 'up'; return '<div class="r ' + v.dir + '" style="--i:' + i + '"><span class="l">' + esc(t('wrVs_' + v.k)) + '</span><span class="v">' + esc(nf(v.was)) + ' → <b>' + esc(v.unit === 'l' ? dec(v.now, 1) : nf(v.now)) + '</b></span><span class="a ' + (good ? 'ok' : (v.dir === 'down' ? 'dn' : 'eq')) + '">' + (v.dir === 'same' ? '=' : svgI(v.dir === 'up' ? 'up' : 'down')) + '</span></div>'; }).join('');
    return '<p class="hk-k">' + esc(t('wrVsK')) + '</p><h2 class="hk-big sm">' + esc(t('wrVsH')) + '</h2><div class="hk-vs">' + rows + '</div>';
  }
  function sBadges(m, o) {
    var t = o.t, nw = m.badges.some(function (b) { return b.isNew; }), items = m.badges.slice().sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); }).slice(0, 4).map(function (b, i) { return '<div class="b' + (b.isNew ? ' new' : '') + '" style="--i:' + i + '"><i>' + svgI(b.ic) + '</i><b>' + esc(t('wrB_' + b.id)) + '</b><span>' + esc(t('wrBd_' + b.id)) + '</span>' + (b.isNew ? '<em>' + esc(t('wrNew')) + '</em>' : '') + '</div>'; }).join('');
    return '<canvas class="hk-conf" aria-hidden="true"></canvas><p class="hk-k">' + esc(t('wrBadgeK')) + '</p><h2 class="hk-big sm">' + esc(t(nw ? 'wrBadgeNew' : 'wrBadgeH')) + '</h2><div class="hk-bgrid">' + items + '</div>';
  }
  function sGoal(m, o) {
    var g = m.goal, t = o.t, gp = m.goalPrev;
    return '<p class="hk-k">' + esc(t('wrGoalK')) + '</p>' + (gp ? '<p class="hk-pill ' + (gp.ok ? '' : 'alt') + '">' + svgI(gp.ok ? 'check' : 'target') + '<span>' + esc(t(gp.ok ? 'wrGoalOk' : 'wrGoalNo')) + '</span></p>' : '') + '<h2 class="hk-big sm">' + esc(t('wrGoal_' + g.id, { n: g.n })) + '</h2><p class="hk-sub">' + esc(t('wrGoalD_' + g.id, { n: g.n })) + '</p>' +
      (o.plato ? '<p class="hk-foot hk-pl">' + esc(o.plato.t) + '</p>' : '') + '<div class="hk-act"><button type="button" class="hk-btn pri" data-hk="goal">' + esc(t('wrAccept')) + '</button>' + (o.plato ? '<button type="button" class="hk-btn" data-hk="plato">' + esc(o.plato.b) + '</button>' : '') + '</div><p class="hk-foot ok" hidden>' + esc(t('wrAccepted')) + '</p>';
  }
  function sFinal(m, o) {
    var t = o.t; return '<p class="hk-k">' + esc(t('wrFinalK')) + '</p><div class="hk-card9"><canvas width="1080" height="1920" aria-label="' + esc(t('wrShareA')) + '"></canvas></div><div class="hk-act col"><button type="button" class="hk-btn pri" data-hk="share">' + esc(t('wrShare')) + '</button><button type="button" class="hk-btn" data-hk="save">' + esc(t('wrSave')) + '</button>' +
      (o.onOther ? '<button type="button" class="hk-btn ghost" data-hk="other">' + esc(t('wrOther')) + '</button>' : '') + '</div>';
  }
  function sIntro(m, o) {
    var t = o.t; return '<div class="hk-logo" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="r"/><path d="M14 74c14-9 28 9 46 0s32 9 46 0v8a50 50 0 0 1-92 0z" class="w"/><text x="60" y="73" text-anchor="middle" class="k">K</text></svg></div><p class="hk-k">' + esc(o.range) + '</p><h2 class="hk-big">' + esc(t(m.empty ? 'wrIntroEmpty' : 'wrIntro')) + '</h2><p class="hk-sub">' + esc(m.logged ? t('wrIntroD', { n: m.logged }) : t('wrIntroE')) + '</p>' + (o.joke ? '<p class="hk-joke">' + esc(o.joke) + '</p>' : '');
  }
  var BUILD = { intro: sIntro, days: sDays, kcal: sKcal, lost: sLost, fun: sFun, top: sTop, macros: sMacros, water: sWater, move: sMove, weight: sWeight, vs: sVs, badges: sBadges, goal: sGoal, final: sFinal };
  function slideHtml(kind, m, o) { return '<div class="hk-s hk-sd-' + kind + '">' + BUILD[kind](m, o) + '</div>'; }
  /* ============================ count-up, konfetti ============================ */
  function countUp(el, reduce) {
    [].forEach.call(el.querySelectorAll('[data-cu]'), function (e) {
      var to = +e.getAttribute('data-cu') || 0, d = +e.getAttribute('data-dec') || 0, fmt = function (v) { return d ? dec(v, d) : nf(v); };
      if (reduce || to <= 0) { e.textContent = fmt(to); return; }
      var t0 = null, dur = 1100; e.textContent = fmt(0); requestAnimationFrame(function step(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur); e.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1 && e.isConnected) requestAnimationFrame(step); });
    });
  }
  function confetti(cv, host) {                         // yengil: ~60 zarra, 2,4 s, faqat transform-siz canvas chizish (bitta rAF)
    if (!cv || !cv.getContext) return; var w = cv.width = host.clientWidth, h = cv.height = host.clientHeight, c = cv.getContext('2d'), cols = ['#FF8A66', '#F5683A', '#FFD27A', '#5CCB93', '#7CC4F5', '#FFFFFF'], P = [], i;
    for (i = 0; i < 60; i++) P.push({ x: w / 2 + (Math.random() - 0.5) * w * 0.3, y: h * 0.32, vx: (Math.random() - 0.5) * 9, vy: -6 - Math.random() * 7, r: 4 + Math.random() * 5, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.4, c: cols[i % cols.length] });
    var t0 = null; (function step(t) { if (t0 === null) t0 = t; var k = (t - t0) / 2400; c.clearRect(0, 0, w, h); if (k >= 1 || !cv.isConnected) return; P.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.a += p.va; c.globalAlpha = Math.max(0, 1 - k * k); c.fillStyle = p.c; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); c.restore(); }); requestAnimationFrame(step); })(0);
  }
  /* ============================ ulashish rasmi 1080×1920 (VAZNSIZ) ============================ */
  function shareData(m, o) {                            // oq ro'yxat: vazn umuman olinmaydi
    var L = m.lost; return { range: o.range, logged: m.logged, avg: m.avgKcal, target: m.target, steps: m.move.steps, liters: m.water.liters, protDays: m.macros.protDays, fat: (L.state === 'deficit' && !L.low) ? { kg: L.kg, kcal: Math.abs(L.total) } : (L.state === 'even' ? { even: true } : null), badge: m.badges[0] ? m.badges[0].id : '', dark: !!o.dark, days: m.rows.map(function (r) { return { l: dowOf(o, r.dow), k: r.k, near: r.state === 'near' }; }) };
  }
  function drawShare(cv, s, t, tr) {
    tr = tr || function (x) { return x; }; cv.width = 1080; cv.height = 1920; var c = cv.getContext('2d'), dk = s.dark;
    var bg = c.createLinearGradient(0, 0, 1080, 1920); bg.addColorStop(0, dk ? '#2A1B16' : '#FFE3D6'); bg.addColorStop(1, dk ? '#121012' : '#FBF4EE'); c.fillStyle = bg; c.fillRect(0, 0, 1080, 1920);
    var ink = dk ? '#F7F1EC' : '#1E1A17', mut = dk ? '#C9BDB3' : '#6B625B', acc = dk ? '#FF8A66' : '#E0603F', ok = dk ? '#5CCB93' : '#2E9E6A', base = dk ? '#43382F' : '#EADFD6';
    c.fillStyle = acc; c.font = '800 64px ' + F; c.fillText('KalkiFit', 90, 150); c.fillStyle = mut; c.font = '600 44px ' + F; c.fillText(tr(s.range || ''), 90, 215); c.fillStyle = ink; c.font = '800 110px ' + F; c.fillText(tr(t('wrShareT')), 90, 380);
    var days = s.days || [], mx = Math.max(s.target || 1, Math.max.apply(null, days.map(function (x) { return x.k; }).concat([1]))) * 1.1, bw = 100, gap = 24, x0 = 90, H = 360, yb = 820;
    days.forEach(function (x, j) { var h = Math.max(10, H * x.k / mx), xx = x0 + j * (bw + gap); c.fillStyle = x.near ? ok : (x.k ? acc : base); c.beginPath(); if (c.roundRect) c.roundRect(xx, yb - h, bw, h, 20); else c.rect(xx, yb - h, bw, h); c.fill(); c.fillStyle = mut; c.font = '600 32px ' + F; c.textAlign = 'center'; c.fillText(tr(x.l || ''), xx + bw / 2, yb + 52); c.textAlign = 'left'; });
    var rows = [[String(s.logged) + ' / 7', t('wrDaysK')], [nf(s.avg || 0), t('wrAvgK')], [nf(s.steps || 0), t('wrSteps')], [dec(s.liters || 0, 1) + ' ' + t('wrLiters'), t('wrWaterK')]];
    rows.forEach(function (r, j) { var xx = 90 + (j % 2) * 480, yy = 1010 + Math.floor(j / 2) * 190; c.fillStyle = ink; c.font = '800 78px ' + F; c.fillText(r[0], xx, yy); c.fillStyle = mut; c.font = '600 34px ' + F; c.fillText(tr(String(r[1] || '')), xx, yy + 52); });
    var y = 1400;
    if (s.fat) { c.fillStyle = dk ? '#3A2A22' : '#FFFFFF'; c.beginPath(); if (c.roundRect) c.roundRect(90, y, 900, 190, 40); else c.rect(90, y, 900, 190); c.fill(); c.fillStyle = ok; c.font = '800 64px ' + F; c.fillText(s.fat.even ? tr(t('wrEven')) : '≈ ' + dec(s.fat.kg, s.fat.kg < 1 ? 2 : 1) + ' ' + tr(t('wrKg')) + ' ' + tr(t('wrFat')), 130, y + 90); c.fillStyle = mut; c.font = '600 34px ' + F; c.fillText(s.fat.even ? tr(t('wrEvenS')) : '≈ ' + nf(s.fat.kcal) + ' ' + tr(t('kcal')) + ' ' + tr(t('wrSaved')), 130, y + 145); y += 230; }
    if (s.badge) { c.fillStyle = acc; c.font = '800 48px ' + F; c.fillText('★ ' + tr(t('wrB_' + s.badge)), 90, y + 60); }
    c.fillStyle = mut; c.font = '700 38px ' + F; c.textAlign = 'center'; c.fillText('kalki.uz/kalkifit', 540, 1840); c.textAlign = 'left'; return cv;
  }
  /* ============================ ochish ============================ */
  /* o = { m, t, range, dow:[7], dayName(d), dark, reduce, joke, onShare(cv), onSave(cv), onGoal(g), onSlide(kind, idx), onOther(), onClose(), dur } → { el, go, next, prev, close, idx, kinds } */
  function open(o) {
    var m = o.m, ks = m.kinds, doc = root.document, i = -1, tm = null, paused = false, rm = !!o.reduce, closed = false, hold = false;
    var el = doc.createElement('div'); el.className = 'hk' + (o.dark ? ' dk' : '') + (rm ? ' rm' : ''); el.id = 'hkStory'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', o.t('wrTitle')); el.style.setProperty('--hkd', (o.dur || DUR) + 'ms');
    el.innerHTML = '<div class="hk-top"><div class="hk-prog">' + ks.map(function () { return '<span><i></i></span>'; }).join('') + '</div><button type="button" class="hk-x" data-hk="close" aria-label="' + esc(o.t('close')) + '">✕</button></div><div class="hk-deck">' +
      ks.map(function (k, j) { return '<section class="hk-sl" data-k="' + k + '" data-j="' + j + '" aria-hidden="true">' + slideHtml(k, m, o) + '</section>'; }).join('') + '</div>';
    doc.body.appendChild(el); doc.documentElement.classList.add('hk-on');
    var sl = el.querySelectorAll('.hk-sl'), pr = el.querySelectorAll('.hk-prog i'), outT = null;
    /* oldindan tayyorlash: rasmlar (top / fun) kutib turmasin */
    [].forEach.call(el.querySelectorAll('img'), function (im) { var p = new root.Image(); p.src = im.getAttribute('src'); });
    function arm() { clearTimeout(tm); if (i < ks.length - 1 && !paused) tm = setTimeout(next, o.dur || DUR); }
    function go(j) {
      if (closed) return; j = Math.max(0, Math.min(ks.length - 1, j)); if (j === i) return; var prevI = i, dir = j > i ? 1 : -1; i = j;
      var nu = sl[j], old = prevI >= 0 ? sl[prevI] : null; clearTimeout(outT);
      [].forEach.call(sl, function (s, n) { if (s !== nu && s !== old) { s.classList.remove('on', 'in', 'out', 'run'); s.setAttribute('aria-hidden', 'true'); } });
      if (old) { old.classList.remove('in'); old.classList.add('out'); }          // chiquvchi OPAQ ostida qoladi; kiruvchi ustidan paydo bo'ladi — orqadagi ekran hech qachon ko'rinmaydi
      nu.classList.remove('out', 'run'); nu.style.setProperty('--dir', dir); nu.classList.add('on', 'in'); nu.setAttribute('aria-hidden', 'false'); void nu.offsetWidth; nu.classList.add('run');
      outT = setTimeout(function () { if (old && old !== nu) { old.classList.remove('on', 'out', 'run'); old.setAttribute('aria-hidden', 'true'); } nu.classList.remove('in'); }, rm ? 0 : 360);
      [].forEach.call(pr, function (p, n) { p.parentNode.className = n < j ? 'done' : (n === j ? 'cur' + (n === ks.length - 1 ? ' last' : '') : ''); });
      countUp(nu, rm); var k = ks[j]; if (!rm && ((k === 'badges' && m.badges.some(function (b) { return b.isNew; })) || (k === 'lost' && !m.lost.low && (m.lost.state === 'even' || m.lost.state === 'deficit')) || (k === 'days' && m.logged >= 7))) { var cv = nu.querySelector('.hk-conf') || (function () { var c2 = doc.createElement('canvas'); c2.className = 'hk-conf'; c2.setAttribute('aria-hidden', 'true'); nu.appendChild(c2); return c2; })(); setTimeout(function () { confetti(cv, nu); }, 350); }
      if (k === 'final') { var fc = nu.querySelector('.hk-card9 canvas'); if (fc && !fc.__d) { fc.__d = 1; try { drawShare(fc, shareData(m, o), o.t, o.tr); } catch (e) { /* canvas yo'q */ } } }
      arm(); if (o.onSlide) o.onSlide(k, j);
    }
    function next() { if (i < ks.length - 1) go(i + 1); }
    function prev() { go(i - 1); }
    function close(fromBack) { if (closed) return; closed = true; clearTimeout(tm); clearTimeout(outT); doc.removeEventListener('keydown', key, true); el.classList.add('out'); doc.documentElement.classList.remove('hk-on'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, rm ? 0 : 220); if (o.onClose) o.onClose(!!fromBack); }
    function key(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } else if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); }
    doc.addEventListener('keydown', key, true);
    var y0 = null, x0 = null, t0 = 0, moved = false;
    el.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('[data-hk]')) return; y0 = e.clientY; x0 = e.clientX; t0 = Date.now(); moved = false; paused = true; clearTimeout(tm); el.classList.add('hold'); });
    el.addEventListener('pointermove', function (e) { if (y0 == null) return; var dy = e.clientY - y0; if (dy > 10) { moved = true; el.style.transform = 'translateY(' + Math.min(dy, 260) + 'px)'; } });
    el.addEventListener('pointerup', function (e) {
      var b = e.target.closest && e.target.closest('[data-hk]');
      if (b) { var a = b.getAttribute('data-hk'); if (a === 'close') close(); else if (a === 'goal') { var gb = el.querySelector('[data-hk=goal]'); if (gb && !gb.disabled) { gb.disabled = true; gb.classList.add('done'); gb.textContent = o.t('wrAccepted'); var ok = el.querySelector('.hk-sd-goal .hk-foot.ok'); if (ok) ok.hidden = false; if (o.onGoal) o.onGoal(m.goal); } }
        else if (a === 'share' && o.onShare) { var cv = doc.createElement('canvas'); drawShare(cv, shareData(m, o), o.t, o.tr); o.onShare(cv); } else if (a === 'save' && o.onSave) { var cv2 = doc.createElement('canvas'); drawShare(cv2, shareData(m, o), o.t, o.tr); o.onSave(cv2); } else if (a === 'other' && o.onOther) { close(); o.onOther(); } else if (a === 'plato' && o.onPlato) { close(); o.onPlato(); } return; }
      var dy = y0 == null ? 0 : e.clientY - y0, long = Date.now() - t0 > 350; y0 = null; paused = false; el.classList.remove('hold'); el.style.transform = '';
      if (dy > 100) { close(); return; } if (moved || long) { arm(); return; }
      if (x0 != null && x0 < el.clientWidth * 0.33) prev(); else next(); arm();
    });
    el.addEventListener('pointercancel', function () { y0 = null; paused = false; el.classList.remove('hold'); el.style.transform = ''; arm(); });
    go(0);
    return { el: el, go: go, next: next, prev: prev, close: close, idx: function () { return i; }, kinds: ks };
  }
  var api = { open: open, shareData: shareData, drawShare: drawShare, slideHtml: slideHtml, DUR: DUR, ICONS: ICONS, ORDER: G_ };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiHikoya = api;
})(typeof window !== 'undefined' ? window : this);
