/* kalki.uz — «Yangiliklar» oynasi (app-kit qismi): KalkiFit va Ro'zg'or uchun umumiy.
 *  - data/yangiliklar-<ilova>.json: har yozuvda versiya (v), sana (d), 1–3 band ({uz, ru, show?}). ЎЗ — UZ matnning runtime translit'i.
 *  - Yangi versiyada ilova birinchi ochilganda pastdan kichik oyna «🎉 Yangilandi» (har versiya uchun BIR marta); bir nechta versiya o'tkazib yuborilgan bo'lsa — oxirgi 5 band birlashtiriladi.
 *  - Yangi foydalanuvchiga (onboarding'dan o'tmagan yoki endi o'tgan) ko'rsatilmaydi. Onboarding, ochiq forma/tahrir, yo'l-yo'riq, fokusdagi maydon va «Sayt yangilandi» paneli paytida chiqmaydi; tugmalarni (pastki menyu, «+») to'smaydi.
 *  - [Ko'rsat] — tegishli joyga olib boradi va 2 soniya yoritadi. Men/Sozlamalar'da «Yangiliklar» bo'limi (o'qilmagan bo'lsa nuqta).
 *  Ishlatish: var news = KalkiNews.create({ app, kit, lang, root, isSetup, targets, onChange }); news.row(); */
(function (root, factory) {
  var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiNews = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var MAX_ITEMS = 5, HL_MS = 2000, POLL_MS = 1500;
  var D = {
    uz: { pop: '🎉 Yangilandi', ok: 'Tushunarli', bnNew: 'Yangi:', bnSee: "Ko'rish", bnX: 'Yopish', show: "Ko'rsat", rowT: 'Yangiliklar', rowS: 'Ilovada nima yangi', unread: "O'qilmagan yangilik", sheetT: 'Yangiliklar', none: "Hozircha yangilik yo'q",
      hDayEnd: "Avval bugungi ovqatni yozing — «Kunni yakunlash» tugmasi shundan keyin shu yerda paydo bo'ladi.", hNo: "Bu joy hozir ko'rinmayapti." },
    ru: { pop: '🎉 Обновление', ok: 'Понятно', bnNew: 'Новое:', bnSee: 'Смотреть', bnX: 'Закрыть', show: 'Показать', rowT: 'Что нового', rowS: 'Что нового в приложении', unread: 'Непрочитанная новость', sheetT: 'Что нового', none: 'Пока новостей нет',
      hDayEnd: 'Сначала запишите сегодняшнюю еду — кнопка «Завершить день» появится здесь.', hNo: 'Это место сейчас не видно.' }
  };
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function two(n) { return n < 10 ? '0' + n : '' + n; }
  function dateLabel(d) { var m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(d || ''); return m ? m[3] + '.' + m[2] + '.' + m[1] : ''; }

  /* ---------- sof mantiq (Node'da testlanadi) ---------- */
  function sorted(list) { return (list || []).slice().sort(function (a, b) { return b.v - a.v; }); }
  function latest(list) { var s = sorted(list); return s.length ? s[0].v : 0; }
  function unseenItems(list, seen) {                       // o'tkazib yuborilgan versiyalar bandlari birlashtiriladi (yangisi birinchi), oxirgi 5 ta
    var out = []; sorted(list).forEach(function (e) { if (e.v > seen) (e.items || []).forEach(function (it) { out.push(it); }); });
    return out.slice(0, MAX_ITEMS);
  }
  function highlight(el) {
    if (!el) return false;
    try { el.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) {}
    el.classList.add('yg-hl'); setTimeout(function () { el.classList.remove('yg-hl'); }, HL_MS); return true;
  }

  function create(cfg) {
    var NAV = typeof navigator !== 'undefined' ? navigator : {}, inst = {}, list = null, S = null, timer = null, popEl = null, KEY = 'kalki_news_' + cfg.app;
    function L() { return D[(cfg.lang ? cfg.lang() : 'uz') === 'ru' ? 'ru' : 'uz']; }
    function loadS() { try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && typeof o === 'object' ? { shown: +o.shown || 0, read: +o.read || 0 } : null; } catch (e) { return null; } }
    function saveS() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
    inst.t = function (k) { return L()[k] || k; };
    inst.state = function () { return S ? { shown: S.shown, read: S.read } : null; };
    inst.entries = function () { return sorted(list); };
    inst.hasUnread = function () { if (list && !S) init(); return !!(list && S && latest(list) > S.read); };
    inst.row = function () {                                 // Men/Sozlamalar qatori
      var t = L(), ic = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2.4 5.4L20 9.2l-4.2 3.9 1.2 5.7L12 15.9 7 18.8l1.2-5.7L4 9.2l5.6-.8z"/></svg>';
      return '<button type="button" class="rz-row yg-row" data-act="ygopen" data-yg="row"><span class="' + esc(cfg.rowIcon || 'rz-ci') + '">' + ic + '</span><span class="m"><b>' + esc(t.rowT) + (inst.hasUnread() ? '<i class="yg-dot" role="img" aria-label="' + esc(t.unread) + '"></i>' : '') + '</b><span>' + esc(t.rowS) + '</span></span><svg class="rz-i r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>';
    };
    function itemsHtml(items) {
      var t = L(), lg = (cfg.lang ? cfg.lang() : 'uz') === 'ru' ? 'ru' : 'uz';
      return '<ul class="yg-l">' + items.map(function (it) { return '<li><span>' + esc(it[lg] || it.uz) + '</span>' + (it.show ? '<button type="button" class="rz-btn sm yg-go" data-act="ygshow" data-t="' + esc(it.show) + '">' + esc(it.btn && it.btn[lg] ? it.btn[lg] : t.show) + '</button>' : '') + '</li>'; }).join('') + '</ul>';
    }
    function mark(shown, read) { if (!S) return; if (shown != null) S.shown = Math.max(S.shown, shown); if (read != null) S.read = Math.max(S.read, read); saveS(); if (read != null && !inst.hasUnread()) { var dots = document.querySelectorAll('.yg-dot'); for (var i = 0; i < dots.length; i++) dots[i].parentNode.removeChild(dots[i]); } if (cfg.onChange) cfg.onChange(); }
    function closePop() { if (popEl && popEl.parentNode) popEl.parentNode.removeChild(popEl); popEl = null; }
    function blocked() {                                     // oyna ko'rsatilmasligi kerak bo'lgan holatlar
      if (typeof document === 'undefined' || document.hidden) return true;
      if (cfg.isSetup && !cfg.isSetup()) return true;
      if (document.getElementById('rzOnb') && !document.getElementById('rzOnb').hidden) return true;                // onboarding
      if (document.getElementById('rzGate') || document.getElementById('rzRestore')) return true;                   // tanlov / tiklash ekrani
      if (cfg.kit && (cfg.kit.sheetKind() || (cfg.kit.tipsOn && cfg.kit.tipsOn()))) return true;                    // ochiq forma/tahrir/panel, yo'l-yo'riq
      var a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return true;            // yozayotgan paytda (klaviatura)
      if (document.getElementById('sw-update-bar')) return true;                                                    // «Sayt yangilandi» paneli bilan ustma-ust tushmasin
      if (document.body.classList.contains('rz-aboutopen')) return true;
      return false;
    }
    function showBanner(items) {                             // cfg.banner: bir qatorli tepa xabar «Yangi: … [Ko'rish] ✕» (ro'yxat — Profil → Yangiliklar)
      closePop(); var t = L(), lg = (cfg.lang ? cfg.lang() : 'uz') === 'ru' ? 'ru' : 'uz', e = sorted(list)[0] || {}, tx = (e.bn && e.bn[lg]) || (items[0] && (items[0][lg] || items[0].uz)) || '';
      popEl = document.createElement('div'); popEl.className = 'yg-pop yg-bn'; popEl.id = 'ygPop'; popEl.setAttribute('role', 'status'); popEl.setAttribute('aria-label', t.bnNew);
      popEl.innerHTML = '<span class="yg-bt"><b>' + esc(t.bnNew) + '</b> ' + esc(tx) + '</span><button type="button" class="rz-btn sm" data-act="ygopen" data-yg="bn">' + esc(t.bnSee) + '</button><button type="button" class="rz-x" data-act="ygok" id="ygOk" aria-label="' + esc(t.bnX) + '"><svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
      cfg.root.appendChild(popEl); mark(latest(list), null);
    }
    function showPop(items) {
      if (cfg.banner) return showBanner(items);
      closePop(); var t = L(); popEl = document.createElement('div'); popEl.className = 'yg-pop'; popEl.id = 'ygPop'; popEl.setAttribute('role', 'dialog'); popEl.setAttribute('aria-label', t.pop);
      popEl.innerHTML = '<div class="yg-h"><b>' + esc(t.pop) + '</b></div>' + itemsHtml(items) + '<div class="yg-f"><button type="button" class="rz-btn primary sm" data-act="ygok" id="ygOk">' + esc(t.ok) + '</button></div>';
      cfg.root.appendChild(popEl); mark(latest(list), null);   // har versiyada BIR marta (ko'rsatilgan zahoti)
    }
    function init() {                                        // birinchi sessiya qarori: yangi foydalanuvchiga ko'rsatilmaydi; mavjud foydalanuvchiga — yangiliklar
      var s0 = loadS(); if (s0) { S = s0; return; }
      var lt = latest(list); S = (cfg.isSetup && cfg.isSetup()) ? { shown: 0, read: 0 } : { shown: lt, read: lt }; saveS();
    }
    function tick() {
      if (!list || !cfg.root || !cfg.root.isConnected) return; if (!S) init(); if (popEl) return;
      var items = unseenItems(list, S.shown); if (!items.length) { clearInterval(timer); timer = null; return; }
      if (blocked()) return; showPop(items);
    }
    inst.tick = tick;
    inst.close = closePop;
    inst.open = function () {                                // Men → barcha yozilmalar
      if (!list || !cfg.kit) return; var t = L(), lg = (cfg.lang ? cfg.lang() : 'uz') === 'ru' ? 'ru' : 'uz';
      var body = sorted(list).length ? sorted(list).map(function (e) { return '<section class="yg-e"><div class="yg-d">' + esc(dateLabel(e.d)) + '</div>' + itemsHtml(e.items || []) + '</section>'; }).join('') : '<p class="rz-p">' + esc(t.none) + '</p>';
      cfg.kit.openSheet('news', '<div class="yg-sheet">' + cfg.kit.shHead(t.sheetT) + body + '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(t.ok) + '</button></div></div>', { noFocus: true });
      mark(null, latest(list));
    };
    inst.go = function (target) {                            // [Ko'rsat]: ilova o'z joyini biladi; topilmasa — izoh
      var fn = cfg.targets && cfg.targets[target], ok = false; try { ok = fn ? fn(inst) : false; } catch (e) { ok = false; }
      if (!ok && cfg.kit) cfg.kit.toast(L().hNo); return ok;
    };
    inst.act = function (a, el) {
      if (a === 'ygok') { closePop(); mark(latest(list), latest(list)); return true; }
      if (a === 'ygshow') { var tg = el && el.getAttribute('data-t'); if (cfg.kit && cfg.kit.sheetKind() === 'news') cfg.kit.closeSheet(); closePop(); mark(latest(list), latest(list)); setTimeout(function () { inst.go(tg); }, 120); return true; }
      if (a === 'ygopen') { closePop(); inst.open(); return true; }
      return false;
    };
    inst.highlight = highlight;
    if (typeof document !== 'undefined') {
      document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act^=yg]'); if (b && inst.act(b.getAttribute('data-act'), b)) e.preventDefault(); });
      fetch('/data/yangiliklar-' + cfg.app + '.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || !Array.isArray(j.items)) return; list = j.items; if (cfg.onChange) cfg.onChange(); timer = setInterval(tick, POLL_MS); setTimeout(tick, 1200);
      }, function () {});
    }
    create.instances[cfg.app] = inst;
    return inst;
  }
  create.instances = {};
  return { create: create, instances: create.instances, unseenItems: unseenItems, latest: latest, sorted: sorted, highlight: highlight, MAX_ITEMS: MAX_ITEMS, D: D };
});
