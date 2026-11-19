/* kalki.uz — yangi sarlavha (V2): mobil menyu paneli va ochilmalar. Faqat <body class="v2"> sahifalarda. */
(function (w, d) {
  'use strict';
  var b = d.body;
  var burger = d.querySelector('.sb2-burger');
  if (!b || !burger) return;

  function closeSubs(except) {
    var o = d.querySelectorAll('.tm2 li.open');
    for (var i = 0; i < o.length; i++) if (o[i] !== except) { clearTimeout(o[i]._t); o[i]._pin = false; o[i].classList.remove('open'); var c = o[i].querySelector('.tm2-chev'); if (c) c.setAttribute('aria-expanded', 'false'); }
  }
  function setNav(open) {
    b.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) closeSubs();
  }
  burger.addEventListener('click', function () { setNav(!b.classList.contains('nav-open')); });

  /* Kompyuter (>=900px): hover bilan ochilish darhol, yopilish 250 ms kechikadi (kursor tugmadan menyuga tushayotganda uzilmasin);
     chevron bosilsa menyu "mahkamlanadi" (sensorli noutbuk/klaviatura) — tashqariga bosilsa yoki Esc bosilsa yopiladi.
     JS yoqilgach CSS :hover/:focus-within qoidasi o'chadi (html.nav-js) — holatni faqat shu kod boshqaradi. */
  if (!/jsdom/i.test(navigator.userAgent)) d.documentElement.classList.add('nav-js');   // prerender (jsdom) sinfni HTML'ga pishirmasin
  var DESK = w.matchMedia ? w.matchMedia('(min-width: 900px)') : { matches: true };
  var CLOSE_MS = 250;
  function setOpen(li, on) { li.classList.toggle('open', on); var c = li.querySelector('.tm2-chev'); if (c) c.setAttribute('aria-expanded', on ? 'true' : 'false'); }
  function openNow(li) { clearTimeout(li._t); closeSubs(li); setOpen(li, true); }
  function closeLater(li) { clearTimeout(li._t); if (li._pin) return; li._t = setTimeout(function () { if (!li._pin) setOpen(li, false); }, CLOSE_MS); }
  var subs = d.querySelectorAll('.tm2 > li.has-sub');
  for (var si = 0; si < subs.length; si++) (function (li) {
    li.addEventListener('mouseenter', function () { if (DESK.matches) openNow(li); });
    li.addEventListener('mouseleave', function () { if (DESK.matches) closeLater(li); });
    li.addEventListener('focusin', function () { if (DESK.matches) openNow(li); });
    li.addEventListener('focusout', function (e) { if (DESK.matches && !li.contains(e.relatedTarget)) closeLater(li); });
  })(subs[si]);

  d.addEventListener('click', function (e) {
    var chev = e.target.closest && e.target.closest('.tm2-chev');
    if (chev) {
      var li = chev.parentNode;
      if (DESK.matches) {                                 // kompyuter: bosish — mahkamlash / yopish
        var pin = !li._pin; clearTimeout(li._t); closeSubs(li); li._pin = pin; setOpen(li, pin);
        return;
      }
      var open = !li.classList.contains('open');
      closeSubs(li);
      li.classList.toggle('open', open);
      chev.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }
    var a = e.target.closest && e.target.closest('#topmenu a');
    if (a && b.classList.contains('nav-open')) { setNav(false); return; }
    if (!(e.target.closest && e.target.closest('.tm2'))) closeSubs();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSubs(); if (b.classList.contains('nav-open')) { setNav(false); burger.focus(); } } });
  /* Shrift o'lchami: Oddiy | Katta (html.fs-big, localStorage 'kalki_fs'; boshlang'ich holatni langboot qo'yadi) */
  try { if (localStorage.getItem('kalki_fs') === 'big') d.documentElement.classList.add('fs-big'); } catch (x) {}   // langboot'siz sahifalar (cyr/ statik nusxalar) uchun zaxira
  var fsBtns = d.querySelectorAll('.fs-seg button[data-fs]');
  function fsSync() {
    var big = d.documentElement.classList.contains('fs-big');
    for (var i = 0; i < fsBtns.length; i++) { var on = (fsBtns[i].getAttribute('data-fs') === 'big') === big; fsBtns[i].setAttribute('aria-pressed', on ? 'true' : 'false'); }
  }
  for (var k = 0; k < fsBtns.length; k++) fsBtns[k].addEventListener('click', function (e) {
    e.stopPropagation();
    var big = this.getAttribute('data-fs') === 'big';
    d.documentElement.classList.toggle('fs-big', big);
    try { if (big) localStorage.setItem('kalki_fs', 'big'); else localStorage.removeItem('kalki_fs'); } catch (x) {}
    fsSync();
  });
  fsSync();
  w.addEventListener('resize', function () { if (w.innerWidth >= 900 && b.classList.contains('nav-open')) setNav(false); });
})(window, document);

/* kalki.uz → KalkiFit (sayt trafigi ilovaga): [data-kf="<joy>"] havolalar va bloklar. HTML'da utm YO'Q (SEO toza, ichki havolada utm yo'q) —
   faqat bosilganda ?utm_source=sayt-<joy> qo'shiladi (ilova manbani shundan oladi) va anonim «bosildi» sanaladi. [data-kf-k] — ko'rinsa (≥ 50 %),
   sessiyada bir marta «ko'rsatildi». Yuboriladi FAQAT: joy kodi + k|b (POST /api/stat {sb, h}); id, URL, shaxsiy ma'lumot YO'Q.
   DNT / GPC, bot / headless, localhost, preview (*.pages.dev) — hech narsa yuborilmaydi. Joylar: kaloriya, alkogol, bosh, kategoriya, menyu, maqola, tvi, ideal-vazn, suv, taom-<id> (/kaloriya/<taom> sahifalari). */
(function (w, d) {
  'use strict';
  var JOY = /^(kaloriya|alkogol|bosh|kategoriya|menyu|maqola|tvi|ideal-vazn|suv|taom-[a-z0-9-]{1,40})$/;
  function off() {
    var n = w.navigator || {}; try { if (w.localStorage && w.localStorage.getItem('kalki_stat_test') === '1') return false; } catch (e) {}
    if (n.doNotTrack === '1' || n.doNotTrack === 'yes' || w.doNotTrack === '1' || n.globalPrivacyControl === true) return true;
    var h = String((w.location || {}).hostname || ''); return n.webdriver || /\.pages\.dev$/.test(h) || h === 'localhost' || h === '127.0.0.1' || /bot\b|crawl|spider|headless|lighthouse/i.test(String(n.userAgent || ''));
  }
  function send(joy, h) {
    if (!JOY.test(joy) || off()) return false; var body = JSON.stringify({ sb: joy, h: h });
    try { if (n0().sendBeacon && n0().sendBeacon('/api/stat', new Blob([body], { type: 'application/json' }))) return true; } catch (e) {}
    try { w.fetch('/api/stat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {}); } catch (e) {} return true;
  }
  function n0() { return w.navigator || {}; }
  var seen = {};
  function kors(joy) { var k = 'kf_k_' + joy; if (seen[k]) return false; seen[k] = 1; try { if (w.sessionStorage.getItem(k)) return false; w.sessionStorage.setItem(k, '1'); } catch (e) {} return send(joy, 'k'); }
  function utm(href, joy) { try { var u = new URL(href, w.location.href); u.searchParams.set('utm_source', 'sayt-' + joy); return u.pathname + u.search + u.hash; } catch (e) { return href; } }
  function mark(a) { var joy = a.getAttribute('data-kf'); if (!JOY.test(joy || '')) return null; if (!a.__kf0) a.__kf0 = a.getAttribute('href'); a.setAttribute('href', utm(a.__kf0, joy)); return joy; }
  d.addEventListener('pointerdown', function (e) { var a = e.target && e.target.closest && e.target.closest('a[data-kf]'); if (a) mark(a); }, true);
  d.addEventListener('click', function (e) { var a = e.target && e.target.closest && e.target.closest('a[data-kf]'); if (!a) return; var joy = mark(a); if (joy) send(joy, 'b'); }, true);
  var io = null;
  function watch() {          // qayta chaqirsa bo'ladi (sahifa ro'yxatni qayta chizsa) — har element bir marta kuzatiladi
    var els = [].filter.call(d.querySelectorAll('[data-kf-k]'), function (e) { if (e.__kfw) return false; e.__kfw = 1; return true; }); if (!els.length) return;
    if (!('IntersectionObserver' in w)) { for (var i = 0; i < els.length; i++) kors(els[i].getAttribute('data-kf-k')); return; }
    io = io || new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting && x.intersectionRatio >= 0.5) { kors(x.target.getAttribute('data-kf-k')); io.unobserve(x.target); } }); }, { threshold: [0.5] });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', watch); else watch();
  w.KFSayt = { kors: kors, bos: function (joy) { return send(joy, 'b'); }, utm: utm, watch: watch };
})(window, document);
