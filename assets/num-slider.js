/* kalki.uz — klaviaturasiz raqam kiritish: gorizontal lineyka-slayder (bo'y, vazn, yosh) (vanilla JS, KalkiFit onboarding va Profil tahriri).
 * Barmoq bilan suriladi (scroll-snap: inertsiya + butun qadamga «snap»), katta qiymat + birlik, − / + (bosib turilsa tezlashadi), qiymatni bossangiz — kichik raqam maydoni.
 * Accessibility: role=slider (aria-valuemin/max/now/valuetext), strelkalar/PageUp/PageDown/Home/End. APK'da (KalkiNative.isApp) har qadamda yengil haptic (Capacitor Haptics bo'lsa; aks holda jim).
 * Qiymat yashirin <input type=hidden id=…> da ham turadi; o'zgarsa document'ga «sldchange» (detail: { id, value, user }) hodisasi yuboriladi. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiSlider = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var TICK = 12;                                               // bitta qadam kengligi, px
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function snap(o, v) { var n = Math.round((v - o.min) / o.step); n = Math.max(0, Math.min(Math.round((o.max - o.min) / o.step), n)); return Math.round((o.min + n * o.step) * 100) / 100; }
  function idxOf(o, v) { return Math.round((v - o.min) / o.step); }
  function fmt(o, v) { return o.step < 1 ? String(Math.round(v * 10) / 10).replace('.', ',') : String(Math.round(v)); }
  function parse(s) { var x = parseFloat(String(s).replace(',', '.').replace(/[^\d.\-]/g, '')); return isNaN(x) ? null : x; }
  function opts(el) { return { min: +el.getAttribute('data-min'), max: +el.getAttribute('data-max'), step: +el.getAttribute('data-step'), unit: el.getAttribute('data-unit') || '', id: el.getAttribute('data-sld') }; }
  /* o: { id, min, max, step, value, unit, label, minus, plus, edit } */
  function html(o) {
    var n = Math.round((o.max - o.min) / o.step), v = snap(o, o.value), major = o.step < 1 ? 5 : 10, t = '', i, x, isM;
    for (i = 0; i <= n; i++) { x = Math.round((o.min + i * o.step) * 100) / 100; isM = Math.abs(x / major - Math.round(x / major)) < 1e-9; t += '<i' + (isM ? ' class="m"' : '') + '>' + (isM ? '<b>' + Math.round(x) + '</b>' : '') + '</i>'; }
    return '<div class="sld" data-sld="' + esc(o.id) + '" data-min="' + o.min + '" data-max="' + o.max + '" data-step="' + o.step + '" data-unit="' + esc(o.unit) + '" data-v="' + v + '">' +
      '<div class="sld-row"><button type="button" class="sld-b" data-sld-act="m" aria-label="' + esc(o.minus || '−') + '"><span aria-hidden="true">−</span></button>' +
      '<button type="button" class="sld-val" data-sld-act="edit" aria-label="' + esc(o.edit || o.label) + '"><b>' + fmt(o, v) + '</b><small>' + esc(o.unit) + '</small></button>' +
      '<button type="button" class="sld-b" data-sld-act="p" aria-label="' + esc(o.plus || '+') + '"><span aria-hidden="true">+</span></button></div>' +
      '<div class="sld-rw"><div class="sld-rul" role="slider" tabindex="0" aria-orientation="horizontal" aria-label="' + esc(o.label) + '" aria-valuemin="' + o.min + '" aria-valuemax="' + o.max + '" aria-valuenow="' + v + '" aria-valuetext="' + esc(fmt(o, v) + ' ' + o.unit) + '"><div class="sld-rt">' + t + '</div></div><i class="sld-ind" aria-hidden="true"></i></div>' +
      '<input type="hidden" id="' + esc(o.id) + '" value="' + v + '"></div>';
  }
  function haptic() { try { var N = window.KalkiNative, app = N && (typeof N.isApp === 'function' ? N.isApp() : N.isApp); if (!app) return; var C = window.Capacitor, H = C && C.Plugins && C.Plugins.Haptics; if (H && H.impact) H.impact({ style: 'LIGHT' }); } catch (e) {} }
  function get(sld) { return +sld.getAttribute('data-v'); }
  /* qiymatni qo'yish: snap + ko'rinish + aria + yashirin input; scroll — lineykani ham suradi; user — hodisa belgisi */
  function set(sld, v, flags) {
    flags = flags || {}; var o = opts(sld), nv = snap(o, v), cur = get(sld), rul = sld.querySelector('.sld-rul');
    if (flags.scroll && rul) { var want = idxOf(o, nv) * TICK; if (Math.abs(rul.scrollLeft - want) > 0.5) rul.scrollLeft = want; }
    if (nv === cur && !flags.force) return nv;
    sld.setAttribute('data-v', nv); var b = sld.querySelector('.sld-val b'); if (b) b.textContent = fmt(o, nv);
    if (rul) { rul.setAttribute('aria-valuenow', nv); rul.setAttribute('aria-valuetext', fmt(o, nv) + ' ' + o.unit); }
    var h = sld.querySelector('input[type=hidden]'); if (h) h.value = nv;
    if (nv !== cur) { haptic(); if (!flags.silent) sld.dispatchEvent(new CustomEvent('sldchange', { bubbles: true, detail: { id: o.id, value: nv, user: !!flags.user } })); }
    return nv;
  }
  function mount(scope) {
    var list = (scope || document).querySelectorAll('.sld:not([data-init])');
    for (var i = 0; i < list.length; i++) { var s = list[i], o = opts(s); s.setAttribute('data-init', '1'); var r = s.querySelector('.sld-rul'); if (r) r.scrollLeft = idxOf(o, get(s)) * TICK; }
  }
  /* ---------- hodisalar (bir marta, delegatsiya) ---------- */
  var holdT = null, holdBtn = null, handled = 0;
  function stopHold() { if (holdT) { clearTimeout(holdT); holdT = null; } holdBtn = null; }
  function startHold(sld, dir) {
    var o = opts(sld), t0 = Date.now(); stopHold(); set(sld, get(sld) + dir * o.step, { scroll: true, user: true });
    var loop = function () { var el = Date.now() - t0, mult = el > 2600 ? 5 : el > 1300 ? 2 : 1; set(sld, get(sld) + dir * mult * o.step, { scroll: true, user: true }); holdT = setTimeout(loop, el > 1300 ? 55 : 100); };
    holdT = setTimeout(loop, 380);
  }
  function openEdit(sld) {
    var o = opts(sld), btn = sld.querySelector('.sld-val'); if (!btn || btn.hidden) return; var inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'sld-in'; inp.setAttribute('inputmode', o.step < 1 ? 'decimal' : 'numeric'); inp.setAttribute('enterkeyhint', 'done'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('aria-label', btn.getAttribute('aria-label') || ''); inp.value = fmt(o, get(sld));
    var u = document.createElement('small'); u.textContent = o.unit; var wrap = document.createElement('span'); wrap.className = 'sld-edit'; wrap.appendChild(inp); wrap.appendChild(u); btn.hidden = true; btn.parentNode.insertBefore(wrap, btn.nextSibling);
    var done = false, finish = function (ok) { if (done) return; done = true; var x = ok ? parse(inp.value) : null; wrap.parentNode.removeChild(wrap); btn.hidden = false; if (x != null) set(sld, Math.max(o.min, Math.min(o.max, x)), { scroll: true, user: true }); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); finish(false); } });
    inp.addEventListener('blur', function () { finish(true); }); inp.focus(); try { inp.select(); } catch (e) {}
  }
  function init() {
    if (init.done || typeof document === 'undefined') return; init.done = true;
    document.addEventListener('scroll', function (e) { var r = e.target; if (!r || !r.classList || !r.classList.contains('sld-rul')) return; var sld = r.closest('.sld'); if (!sld) return; var o = opts(sld); set(sld, o.min + Math.round(r.scrollLeft / TICK) * o.step, { user: true }); }, true);
    document.addEventListener('pointerdown', function (e) { var b = e.target.closest && e.target.closest('[data-sld-act=m],[data-sld-act=p]'); if (!b || (e.button != null && e.button > 0)) return; handled = Date.now(); startHold(b.closest('.sld'), b.getAttribute('data-sld-act') === 'p' ? 1 : -1); holdBtn = b; });
    ['pointerup', 'pointercancel'].forEach(function (n) { document.addEventListener(n, stopHold, true); }); document.addEventListener('pointerleave', function (e) { if (holdBtn && e.target === holdBtn) stopHold(); }, true); window.addEventListener('blur', stopHold);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-sld-act]'); if (!b) return; var a = b.getAttribute('data-sld-act'), sld = b.closest('.sld');
      if (a === 'edit') { openEdit(sld); return; }
      if (Date.now() - handled > 700) { var o = opts(sld); set(sld, get(sld) + (a === 'p' ? 1 : -1) * o.step, { scroll: true, user: true }); }      // klaviatura (Enter/Space) bilan «click» — pointerdown bo'lmagan
    });
    document.addEventListener('keydown', function (e) {
      var r = e.target; if (!r.classList || !r.classList.contains('sld-rul')) return; var sld = r.closest('.sld'), o = opts(sld), k = e.key, d = 0, to = null;
      if (k === 'ArrowRight' || k === 'ArrowUp') d = 1; else if (k === 'ArrowLeft' || k === 'ArrowDown') d = -1; else if (k === 'PageUp') d = 10; else if (k === 'PageDown') d = -10; else if (k === 'Home') to = o.min; else if (k === 'End') to = o.max; else return;
      e.preventDefault(); set(sld, to != null ? to : get(sld) + d * o.step, { scroll: true, user: true });
    });
  }
  init();
  return { TICK: TICK, html: html, mount: mount, set: set, get: get, snap: snap, parse: parse, fmt: fmt, init: init };
});
