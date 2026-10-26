/* kalki.uz — KalkiFit: «Haftangiz» — to'liq ekranli hikoya (5 slayd, ~4 s, progress chiziqlari, chap/o'ng bosish, pastga surib yopish, Esc).
   Ma'lumot ilovada hisoblanadi (assets/kalkifit-hafta.js) va shu yerga tayyor obyekt sifatida keladi; serverga hech narsa ketmaydi.
   Animatsiya — faqat CSS/SVG (transform/opacity) + raqamlar count-up (rAF); prefers-reduced-motion — animatsiyasiz. Uslub: assets/css/kalkifit.css «hk-».
   Ulashiladigan rasm (1080×1350) — VAZNSIZ: shareData() vazn maydonini umuman olmaydi.   window.KalkiHikoya / require() */
(function (root) {
  'use strict';
  var DUR = 4000, F = 'Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nf(n) { return String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  /* slaydlar ro'yxati: ma'lumot kam (≤ 2 kun) — qisqa variant; umuman yo'q — 2 slayd */
  function plan(d) { if (!d.logged) return ['intro', 'tip']; if (d.logged <= 2) return ['intro', 'kcal', 'tip']; return ['intro', 'kcal', 'move', 'best', 'tip']; }
  /* ulashish uchun ma'lumot: vazn YO'Q (oq ro'yxat) */
  function shareData(d) { return { range: d.range, days: (d.days || []).map(function (x) { return { l: x.l, k: x.k, near: !!x.near }; }), target: d.target, near: d.near, avgKcal: d.avgKcal, waterAvg: d.water && d.water.avg, stepsSum: d.steps && d.steps.sum, best: d.best, streak: d.streak, dark: !!d.dark, L: d.L }; }
  function barsHtml(d, cls) {
    var mx = Math.max(d.target || 1, Math.max.apply(null, (d.days || []).map(function (x) { return x.k; }).concat([1]))) * 1.08, g = (d.target || 0) / mx;
    return '<div class="hk-bars7 ' + (cls || '') + '" style="--g:' + g.toFixed(3) + '">' + (d.days || []).map(function (x, i) { return '<div class="c"><i class="' + (x.near ? 'near' : (x.k ? '' : 'nil')) + '" style="--h:' + (x.k / mx).toFixed(3) + ';--i:' + i + '"></i><span>' + esc(x.l) + '</span></div>'; }).join('') + '</div>';
  }
  function slideHtml(kind, d) {
    var L = d.L || {};
    if (kind === 'intro') return '<div class="hk-s hk-intro"><div class="hk-blob a"></div><div class="hk-blob b"></div><p class="hk-k">' + esc(d.range) + '</p><h2 class="hk-big">' + esc(L.hi) + '</h2>' + (d.logged ? '<p class="hk-sub">' + esc(L.days) + '</p>' : '<p class="hk-sub">' + esc(L.empty) + '</p>') + (d.joke ? '<p class="hk-joke">' + esc(d.joke) + '</p>' : '') + '</div>';
    if (kind === 'kcal') return '<div class="hk-s hk-kcal"><p class="hk-k">' + esc(L.kcalT) + '</p><h2 class="hk-num"><b data-cu="' + (d.near || 0) + '">0</b><small> / 7</small></h2><p class="hk-sub">' + esc(L.nearT) + '</p>' + barsHtml(d) + (d.logged <= 2 ? '<p class="hk-hint">' + esc(L.few) + '</p>' : '<p class="hk-sub sm">' + esc(L.avg) + '</p>') + '</div>';
    if (kind === 'move') {
      var w = d.water || {}, s = d.steps || {}, wf = Math.max(0, Math.min(1, (w.avg || 0) / (w.goal || 1))), sf = Math.max(0, Math.min(1, (s.avg || 0) / (s.goal || 1))), C = 2 * Math.PI * 52;
      return '<div class="hk-s hk-move"><p class="hk-k">' + esc(L.moveT) + '</p><div class="hk-two"><div class="hk-w"><svg viewBox="0 0 100 130" class="hk-glass" aria-hidden="true"><defs><clipPath id="hkG"><path d="M14 8h72l-8 112H22z"/></clipPath></defs><g clip-path="url(#hkG)"><g class="hk-fill" style="--f:' + wf.toFixed(3) + '"><path class="hk-wave" d="M-100 0 q25 -8 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V140 H-100z"/></g></g><path d="M14 8h72l-8 112H22z" class="hk-gl"/></svg><b data-cu="' + (w.avg || 0) + '">0</b><span>' + esc(L.waterU) + '</span></div>' +
        '<div class="hk-r"><svg viewBox="0 0 120 120" class="hk-ring" aria-hidden="true"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" style="--c:' + C.toFixed(1) + ';--o:' + (C * (1 - sf)).toFixed(1) + '"/></svg><b data-cu="' + (s.sum || 0) + '">0</b><span>' + esc(L.stepsU) + '</span></div></div></div>';
    }
    if (kind === 'best') return '<div class="hk-s hk-best"><div class="hk-fire" aria-hidden="true"><span class="f1"></span><span class="f2"></span><span class="st">★</span></div><p class="hk-k">' + esc(L.bestT) + '</p><h2 class="hk-big sm">' + esc(d.best || '—') + '</h2><p class="hk-sub"><b data-cu="' + (d.streak || 0) + '">0</b> ' + esc(L.streakU) + '</p>' + (d.food ? '<div class="hk-food">' + (d.food.img ? '<img src="' + esc(d.food.img) + '" alt="" width="56" height="56">' : '<i>' + esc(String(d.food.name).charAt(0)) + '</i>') + '<span><small>' + esc(L.foodT) + '</small><b>' + esc(d.food.name) + '</b></span></div>' : '') + (d.weight ? '<p class="hk-wt" id="hkWt">' + esc(d.weight) + '</p>' : '') + '</div>';
    return '<div class="hk-s hk-tip"><p class="hk-k">' + esc(L.tipT) + '</p><h2 class="hk-big sm">' + esc(d.tip) + '</h2>' + (d.prot ? '<p class="hk-pl hk-pr">' + esc(d.prot) + '</p>' : '') + (d.plato ? '<p class="hk-pl">' + esc(d.plato.t) + '</p>' : '') + '<div class="hk-act">' + (d.plato ? '<button type="button" class="hk-btn pri" data-hk="plato">' + esc(d.plato.b) + '</button>' : '') + '<button type="button" class="hk-btn' + (d.plato ? '' : ' pri') + '" data-hk="share">' + esc(L.share) + '</button><button type="button" class="hk-btn" data-hk="close">' + esc(L.close) + '</button></div></div>';
  }
  function countUp(el, reduce) {
    [].forEach.call(el.querySelectorAll('[data-cu]'), function (e) {
      var to = +e.getAttribute('data-cu') || 0; if (reduce || to <= 0) { e.textContent = nf(to); return; }
      var t0 = null, dur = 900; e.textContent = '0'; requestAnimationFrame(function step(t) { if (t0 === null) t0 = t; var k = Math.min(1, (t - t0) / dur); e.textContent = nf(to * (1 - Math.pow(1 - k, 3))); if (k < 1 && e.isConnected) requestAnimationFrame(step); });
    });
  }
  /* o = { data, reduce, onShare(cv), onClose() } → { el, go(i), next(), prev(), close(), idx() } */
  function open(o) {
    var d = o.data, ks = plan(d), doc = root.document, i = -1, tm = null, paused = false, rm = !!o.reduce, closed = false;
    var el = doc.createElement('div'); el.className = 'hk' + (d.dark ? ' dk' : '') + (rm ? ' rm' : ''); el.id = 'hkStory'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', (d.L && d.L.title) || 'Hafta');
    el.innerHTML = '<div class="hk-top"><div class="hk-prog">' + ks.map(function () { return '<span><i></i></span>'; }).join('') + '</div><button type="button" class="hk-x" data-hk="close" aria-label="' + esc((d.L && d.L.close) || '✕') + '">✕</button></div><div class="hk-deck">' + ks.map(function (k, j) { return '<section class="hk-sl" data-k="' + k + '" data-j="' + j + '" aria-hidden="true">' + slideHtml(k, d) + '</section>'; }).join('') + '</div>';
    doc.body.appendChild(el); doc.documentElement.classList.add('hk-on');
    var sl = el.querySelectorAll('.hk-sl'), pr = el.querySelectorAll('.hk-prog i');
    function arm() { clearTimeout(tm); if (i < ks.length - 1 && !paused) tm = setTimeout(next, o.dur || DUR); }
    function go(j) {
      if (closed) return; j = Math.max(0, Math.min(ks.length - 1, j)); i = j;
      [].forEach.call(sl, function (s, n) { var on = n === j; s.classList.toggle('on', on); s.setAttribute('aria-hidden', on ? 'false' : 'true'); if (!on) s.classList.remove('run'); });
      [].forEach.call(pr, function (p, n) { p.parentNode.className = n < j ? 'done' : (n === j ? 'cur' : ''); });
      var s = sl[j]; void s.offsetWidth; s.classList.add('run'); countUp(s, rm); arm(); if (o.onSlide) o.onSlide(ks[j], j);
    }
    function next() { if (i < ks.length - 1) go(i + 1); }
    function prev() { go(i - 1); }
    function close() { if (closed) return; closed = true; clearTimeout(tm); doc.removeEventListener('keydown', key, true); el.classList.add('out'); doc.documentElement.classList.remove('hk-on'); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, rm ? 0 : 220); if (o.onClose) o.onClose(); }
    function key(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } else if (e.key === 'ArrowRight') next(); else if (e.key === 'ArrowLeft') prev(); }
    doc.addEventListener('keydown', key, true);
    var y0 = null, x0 = null, t0 = 0, moved = false;
    el.addEventListener('pointerdown', function (e) { y0 = e.clientY; x0 = e.clientX; t0 = Date.now(); moved = false; paused = true; clearTimeout(tm); el.classList.add('hold'); });
    el.addEventListener('pointermove', function (e) { if (y0 == null) return; var dy = e.clientY - y0; if (dy > 10) { moved = true; el.style.transform = 'translateY(' + Math.min(dy, 240) + 'px)'; } });
    el.addEventListener('pointerup', function (e) {
      var dy = y0 == null ? 0 : e.clientY - y0, long = Date.now() - t0 > 350; y0 = null; paused = false; el.classList.remove('hold'); el.style.transform = '';
      var b = e.target.closest && e.target.closest('[data-hk]'); if (b) { var a = b.getAttribute('data-hk'); if (a === 'close') close(); else if (a === 'plato') { close(); if (o.onPlato) o.onPlato(); } else if (a === 'share' && o.onShare) { var cv = doc.createElement('canvas'); api.drawShare(cv, api.shareData(d), o.tr); o.onShare(cv); } arm(); return; }
      if (dy > 90) { close(); return; } if (moved || long) { arm(); return; }
      if (x0 != null && x0 < el.clientWidth * 0.33) prev(); else next();
    });
    el.addEventListener('pointercancel', function () { y0 = null; paused = false; el.classList.remove('hold'); el.style.transform = ''; arm(); });
    go(0);
    return { el: el, go: go, next: next, prev: prev, close: close, idx: function () { return i; }, kinds: ks };
  }
  /* ulashish rasmi: 1080×1350, VAZNSIZ (shareData) */
  function drawShare(cv, s, tr) {
    cv.width = 1080; cv.height = 1350; var c = cv.getContext('2d'), dk = s.dark, L0 = s.L || {}, L = {}; tr = tr || function (x) { return x; }; Object.keys(L0).forEach(function (k) { L[k] = tr(String(L0[k] || '')); });
    var bg = c.createLinearGradient(0, 0, 1080, 1350); bg.addColorStop(0, dk ? '#2A1B16' : '#FFE9DF'); bg.addColorStop(1, dk ? '#14100E' : '#FBF6F1'); c.fillStyle = bg; c.fillRect(0, 0, 1080, 1350);
    var ink = dk ? '#F7F1EC' : '#1E1A17', mut = dk ? '#C9BDB3' : '#6B625B', acc = dk ? '#FF8A66' : '#E0603F', nearC = dk ? '#5CCB93' : '#2E9E6A', base = dk ? '#43382F' : '#EADFD6';
    c.fillStyle = acc; c.font = '800 56px ' + F; c.fillText('KalkiFit', 80, 140); c.fillStyle = mut; c.font = '600 40px ' + F; c.fillText(tr(s.range || ''), 80, 200);
    c.fillStyle = ink; c.font = '800 84px ' + F; c.fillText(L.title || '', 80, 320);
    var days = s.days || [], mx = Math.max(s.target || 1, Math.max.apply(null, days.map(function (x) { return x.k; }).concat([1]))) * 1.08, x0 = 100, bw = 96, gap = 28, H = 380, yb = 780;
    days.forEach(function (x, j) { var h = Math.max(8, H * x.k / mx), xx = x0 + j * (bw + gap); c.fillStyle = x.near ? nearC : (x.k ? acc : base); c.beginPath(); if (c.roundRect) c.roundRect(xx, yb - h, bw, h, 18); else c.rect(xx, yb - h, bw, h); c.fill(); c.fillStyle = mut; c.font = '600 32px ' + F; c.textAlign = 'center'; c.fillText(tr(x.l || ''), xx + bw / 2, yb + 50); c.textAlign = 'left'; });
    if (s.target) { var gy = yb - H * s.target / mx; c.strokeStyle = mut; c.setLineDash([14, 12]); c.lineWidth = 4; c.beginPath(); c.moveTo(80, gy); c.lineTo(1000, gy); c.stroke(); c.setLineDash([]); }
    var rows = [[String(s.near || 0) + ' / 7', L.nearT], [nf(s.avgKcal) + ' ' + (L.kcal || ''), L.avgT], [nf(s.stepsSum), L.stepsU], [nf(s.waterAvg) + ' ' + (L.ml || ''), L.waterU]];
    rows.forEach(function (r, j) { var xx = 80 + (j % 2) * 480, yy = 940 + Math.floor(j / 2) * 150; c.fillStyle = ink; c.font = '800 64px ' + F; c.fillText(r[0], xx, yy); c.fillStyle = mut; c.font = '600 32px ' + F; c.fillText(r[1] || '', xx, yy + 46); });
    c.fillStyle = mut; c.font = '700 34px ' + F; c.textAlign = 'center'; c.fillText('KalkiFit · kalki.uz', 540, 1290); c.textAlign = 'left';
    return cv;
  }
  var api = { open: open, plan: plan, shareData: shareData, drawShare: drawShare, slideHtml: slideHtml, DUR: DUR };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiHikoya = api;
})(typeof window !== 'undefined' ? window : this);
