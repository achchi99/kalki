/* kalki.uz — yangi sarlavha (V2): mobil menyu paneli va ochilmalar. Faqat <body class="v2"> sahifalarda. */
(function (w, d) {
  'use strict';
  var b = d.body;
  var burger = d.querySelector('.sb2-burger');
  if (!b || !burger) return;

  function closeSubs(except) {
    var o = d.querySelectorAll('.tm2 li.open');
    for (var i = 0; i < o.length; i++) if (o[i] !== except) { o[i].classList.remove('open'); var c = o[i].querySelector('.tm2-chev'); if (c) c.setAttribute('aria-expanded', 'false'); }
  }
  function setNav(open) {
    b.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (!open) closeSubs();
  }
  burger.addEventListener('click', function () { setNav(!b.classList.contains('nav-open')); });

  d.addEventListener('click', function (e) {
    var chev = e.target.closest && e.target.closest('.tm2-chev');
    if (chev) {
      var li = chev.parentNode, open = !li.classList.contains('open');
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
  var fsBtns = d.querySelectorAll('.fs-seg button[data-fs]');
  function fsSync() {
    var big = d.documentElement.classList.contains('fs-big');
    for (var i = 0; i < fsBtns.length; i++) { var on = (fsBtns[i].getAttribute('data-fs') === 'big') === big; fsBtns[i].setAttribute('aria-pressed', on ? 'true' : 'false'); fsBtns[i].classList.toggle('on', on); }
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
