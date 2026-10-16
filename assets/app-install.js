/* kalki.uz — "Ilovani o'rnatish" yagona komponenti (app-kit qismi): Ro'zg'or va KalkiFit ikkalasi shuni ishlatadi.
 *  - Android/kompyuter Chrome·Edge·Samsung: beforeinstallprompt ushlanadi → "O'rnatish" tugmasi → prompt() → natija eslab qolinadi; appinstalled → "O'rnatildi ✓".
 *  - iPhone/iPad: Safari (iOS 16–18 va 26 alohida), Chrome, Firefox uchun animatsiyali SVG qo'llanma (Ulashish → Bosh ekranga qo'shish → Qo'shish).
 *  - Ichki brauzerlar (Telegram, Instagram, Facebook, TikTok, WhatsApp, WebView): "brauzerda oching" kartasi — Android: intent://, iPhone: x-safari-https:// + ko'rsatma.
 *  - Standalone rejimda hech narsa ko'rinmaydi. Karta: onboarding + birinchi yozuvdan keyin; "Keyinroq" → 3 kun; 3 marta rad etilsa faqat Men qatori qoladi.
 *  Holat alohida kalitda (kalki_inst_<ilova>) — eksport/importga kirmaydi, shaxsiy ma'lumot emas.
 *  Ishlatish: var inst = KalkiInstall.create({ app, name, mark, color, kit, lang, path, rowIcon, ready, onChange }); inst.cardHtml(); inst.row(); */
(function (root, factory) {
  var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiInstall = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DAY = 86400000, LATER_DAYS = 3, MAX_NOS = 3;

  /* ---------- muhit aniqlash (sof funksiya — testlanadi) ---------- */
  function detect(ua, o) {
    ua = String(ua || ''); o = o || {};
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (o.platform === 'MacIntel' && o.maxTouchPoints > 1), isAndroid = /Android/i.test(ua), name = null;
    if (/Instagram/i.test(ua)) name = 'instagram'; else if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) name = 'facebook'; else if (/musical_ly|BytedanceWebview|TikTok|trill/i.test(ua)) name = 'tiktok';
    else if (/WhatsApp/i.test(ua)) name = 'whatsapp'; else if (/Telegram/i.test(ua) || o.telegram) name = 'telegram'; else if (/Snapchat/i.test(ua)) name = 'snapchat'; else if (/\bLine\//i.test(ua)) name = 'line'; else if (/Twitter/i.test(ua)) name = 'twitter';
    var wv = false;
    if (isIOS) wv = !/Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua);
    else if (isAndroid) wv = /; wv\)/.test(ua);
    var browser = 'other';
    if (isIOS) browser = /CriOS/.test(ua) ? 'chrome' : /FxiOS/.test(ua) ? 'firefox' : /EdgiOS/.test(ua) ? 'edge' : /OPiOS/.test(ua) ? 'opera' : /Safari\//.test(ua) ? 'safari' : 'other';
    else browser = /SamsungBrowser/i.test(ua) ? 'samsung' : /EdgA?\//.test(ua) ? 'edge' : /OPR\//.test(ua) ? 'opera' : /Firefox\//.test(ua) ? 'firefox' : /Chrome\//.test(ua) ? 'chrome' : /Safari\//.test(ua) ? 'safari' : 'other';
    var sv = parseInt((ua.match(/Version\/(\d+)/) || [])[1], 10), osv = parseInt((ua.match(/OS (\d+)[_.]/) || [])[1], 10);
    var ios26 = isIOS && (sv >= 26 || osv >= 26), kind = o.standalone ? 'standalone' : (name || wv) ? 'inapp' : isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
    return { kind: kind, inapp: (name || wv) ? (name || 'webview') : null, ios: isIOS, android: isAndroid, browser: browser, ios26: !!ios26, iosVer: isNaN(sv) ? (isNaN(osv) ? 0 : osv) : sv };
  }
  function intentUrl(loc) {                       // Android: Chrome'da ochish; Chrome bo'lmasa oddiy https
    var https = 'https://' + loc.host + loc.pathname + (loc.search || '');
    return 'intent://' + loc.host + loc.pathname + (loc.search || '') + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' + encodeURIComponent(https) + ';end';
  }
  function safariUrl(loc) { return 'x-safari-https://' + loc.host + loc.pathname + (loc.search || ''); }

  /* ---------- matnlar (ЎЗ — UZ matnning translit'i) ---------- */
  var D = {
    uz: {
      cardT: "Ilovani telefoningizga o'rnating — har kuni bir bosishda ochiladi", cardS: "O'rnatilganda ma'lumotlaringiz ishonchliroq saqlanadi.", btn: "O'rnatish", later: 'Keyinroq', done: "O'rnatildi ✓",
      rowT: "Ilovani o'rnatish", rowS: "Bosh ekranga qo'shing — bir bosishda ochiladi",
      inT: "Ilovani o'rnatish uchun uni brauzerda oching", inS: "Hozir {app} ichida ochilgan. O'rnatish faqat brauzerda ishlaydi — ilova bu yerda ham ishlayveradi.", inBtn: 'Brauzerda ochish', inIos: "Safari'da ochish",
      x: 'Yopish', gT: "Bosh ekranga qo'shish", gClose: 'Tushunarli', gWhich: 'Qaysi iOS?', g18: 'iOS 16–18', g26: 'iOS 26', gSaf: "Safari'da", gChr: "Chrome'da", gFx: "Firefox'da", gOld: "iOS 16.4 dan eski bo'lsa Safari'da oching.",
      gNote: "{name} bosh ekranda o'z ikonkasi bilan paydo bo'ladi.",
      s_share: "Pastdagi «Ulashish» tugmasini bosing", s_more: "Pastdagi «⋯» tugmasini bosing", s_menuShare: "Menyudan «Ulashish» ni tanlang", s_addhome: "«Bosh ekranga qo'shish» qatorini toping va bosing", s_add: "O'ng tepadagi «Qo'shish» ni bosing",
      s_chrShare: "Manzil qatoridagi «Ulashish» tugmasini bosing", s_fxMenu: "Pastdagi menyu (≡) tugmasini bosing",
      s_inMore: "O'ng tepadagi «⋯» tugmasini bosing", s_inOpen: "«{open}» ni tanlang", s_inMoreA: "O'ng tepadagi «⋮» tugmasini bosing", inGT: "Brauzerda oching", inGN: "Brauzerda ochilgach, o'rnatish tugmasi shu yerda paydo bo'ladi.",
      aT: "Brauzer menyusidan o'rnating", aS: "⋮ menyusini oching → «Ilovani o'rnatish» yoki «Bosh ekranga qo'shish».",
      lShare: 'Ulashish', lAddHome: "Bosh ekranga qo'shish", lAdd: "Qo'shish", lCancel: 'Bekor qilish', lCopy: 'Nusxa olish', lBook: "Xatcho'p", lPrint: 'Chop etish', lSafari: "Safari'da ochish", lChrome: "Chrome'da ochish", lExt: 'Tashqi brauzerda ochish', lRefresh: 'Yangilash', lCopyLink: 'Havolani nusxalash'
    },
    ru: {
      cardT: 'Установите приложение на телефон — открывается одним нажатием', cardS: 'После установки данные хранятся надёжнее.', btn: 'Установить', later: 'Позже', done: 'Установлено ✓',
      rowT: 'Установить приложение', rowS: 'Добавьте на главный экран — открывается одним нажатием',
      inT: 'Чтобы установить приложение, откройте его в браузере', inS: 'Сейчас открыто внутри {app}. Установка работает только в браузере — само приложение работает и здесь.', inBtn: 'Открыть в браузере', inIos: 'Открыть в Safari',
      x: 'Закрыть', gT: 'Добавить на главный экран', gClose: 'Понятно', gWhich: 'Какая iOS?', g18: 'iOS 16–18', g26: 'iOS 26', gSaf: 'В Safari', gChr: 'В Chrome', gFx: 'В Firefox', gOld: 'Если iOS старше 16.4 — откройте в Safari.',
      gNote: '{name} появится на главном экране со своей иконкой.',
      s_share: 'Нажмите кнопку «Поделиться» внизу', s_more: 'Нажмите кнопку «⋯» внизу', s_menuShare: 'В меню выберите «Поделиться»', s_addhome: 'Найдите строку «На экран „Домой“» и нажмите', s_add: 'Нажмите «Добавить» справа вверху',
      s_chrShare: 'Нажмите «Поделиться» в адресной строке', s_fxMenu: 'Нажмите кнопку меню (≡) внизу',
      s_inMore: 'Нажмите «⋯» справа вверху', s_inOpen: 'Выберите «{open}»', s_inMoreA: 'Нажмите «⋮» справа вверху', inGT: 'Откройте в браузере', inGN: 'Когда откроется браузер, кнопка установки появится здесь.',
      aT: 'Установите через меню браузера', aS: 'Откройте меню ⋮ → «Установить приложение» или «Добавить на главный экран».',
      lShare: 'Поделиться', lAddHome: 'На экран «Домой»', lAdd: 'Добавить', lCancel: 'Отмена', lCopy: 'Скопировать', lBook: 'Закладка', lPrint: 'Печать', lSafari: 'Открыть в Safari', lChrome: 'Открыть в Chrome', lExt: 'Открыть во внешнем браузере', lRefresh: 'Обновить', lCopyLink: 'Копировать ссылку'
    }
  };
  function fill(s, p) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] != null ? p[k] : m; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- SVG qo'llanma rasmlari (telefon ekrani maketi, Kalki ranglari; matn tilga mos) ---------- */
  var VB = '0 0 300 210';
  function svg(inner, label) { return '<svg class="ig" viewBox="' + VB + '" role="img" aria-label="' + esc(label) + '"><rect class="ig-ph" x="30" y="6" width="240" height="212" rx="26"/>' + inner + '</svg>'; }
  function txt(x, y, s, cls, anchor) { return '<text class="' + (cls || 'ig-t') + '" x="' + x + '" y="' + y + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>'; }
  function lines(x, y, n, w) { var o = ''; for (var i = 0; i < n; i++) o += '<rect class="ig-ln" x="' + x + '" y="' + (y + i * 14) + '" width="' + (i % 3 === 2 ? w * 0.6 : w) + '" height="7" rx="3.5"/>'; return o; }
  function shareIc(cx, cy, cls) { return '<g class="' + (cls || 'ig-ic') + '"><path d="M' + (cx - 6) + ' ' + (cy - 1) + 'h-1.5v10h15v-10H' + (cx + 6) + '"/><path d="M' + cx + ' ' + (cy + 5) + 'V' + (cy - 9) + 'M' + (cx - 4) + ' ' + (cy - 5) + 'l4-4 4 4"/></g>'; }
  function pulse(cx, cy, r) { return '<circle class="ig-pulse" cx="' + cx + '" cy="' + cy + '" r="' + (r || 17) + '"/>'; }
  function arrowDown(x, y) { return '<g class="ig-arrow"><path d="M' + x + ' ' + y + 'v22M' + (x - 8) + ' ' + (y + 14) + 'l8 8 8-8"/></g>'; }
  function arrowUp(x, y) { return '<g class="ig-arrow up"><path d="M' + x + ' ' + (y + 22) + 'v-22M' + (x - 8) + ' ' + (y + 8) + 'l8-8 8 8"/></g>'; }
  function arrowLeft(x, y) { return '<g class="ig-arrow left"><path d="M' + (x + 24) + ' ' + y + 'h-22M' + (x + 10) + ' ' + (y - 8) + 'l-8 8 8 8"/></g>'; }
  function moreIc(cx, cy, vert) { return '<g class="ig-dots">' + [-6, 0, 6].map(function (d) { return '<circle cx="' + (vert ? cx : cx + d) + '" cy="' + (vert ? cy + d : cy) + '" r="1.9"/>'; }).join('') + '</g>'; }
  function barIcons(xs, hl) { var o = ''; xs.forEach(function (x, i) { if (i === hl) return; o += '<rect class="ig-bi" x="' + (x - 6) + '" y="187" width="12" height="12" rx="3"/>'; }); return o; }
  function pill(x, w, y, txtS) { return '<rect class="ig-bar" x="' + x + '" y="' + y + '" width="' + w + '" height="28" rx="14"/>' + txt(x + w / 2, y + 18, txtS, 'ig-t sm', 'middle'); }
  function listCard(x, y, w, rows, hlIdx, ic) {          // menyu/ulashish qatorlari
    var o = '<rect class="ig-card" x="' + x + '" y="' + y + '" width="' + w + '" height="' + (rows.length * 30 + 12) + '" rx="14"/>';
    rows.forEach(function (r, i) {
      var ry = y + 8 + i * 30, hl = i === hlIdx;
      o += (hl ? '<rect class="ig-hlrow" x="' + (x + 5) + '" y="' + ry + '" width="' + (w - 10) + '" height="26" rx="8"/>' : '') + txt(x + 14, ry + 18, r, hl ? 'ig-t b' : 'ig-t');
      if (ic && hl) o += ic(x + w - 20, ry + 13);
    });
    return o;
  }
  function plusSq(cx, cy) { return '<g class="ig-ic"><rect x="' + (cx - 8) + '" y="' + (cy - 8) + '" width="16" height="16" rx="4"/><path d="M' + cx + ' ' + (cy - 4) + 'v8M' + (cx - 4) + ' ' + cy + 'h8"/></g>'; }
  function compass(cx, cy) { return '<g class="ig-ic"><circle cx="' + cx + '" cy="' + cy + '" r="8"/><path d="M' + (cx + 4) + ' ' + (cy - 4) + 'l-2 6-6 2 2-6z"/></g>'; }
  function chromeIc(cx, cy) { return '<g class="ig-ic"><circle cx="' + cx + '" cy="' + cy + '" r="8"/><circle cx="' + cx + '" cy="' + cy + '" r="3"/></g>'; }

  var STEPS = {
    saf1: function (L) { return svg(lines(48, 24, 5, 190) + '<rect class="ig-btn" x="48" y="100" width="90" height="22" rx="11"/>' + '<rect class="ig-tb" x="30" y="138" width="240" height="80" rx="0"/>' + pill(50, 200, 144, 'kalki.uz') + barIcons([62, 106, 150, 194, 238], 2) + pulse(150, 193, 18) + shareIc(150, 193, 'ig-ic hl') + arrowDown(150, 112), L.s_share); },
    saf26a: function (L) { return svg(lines(48, 24, 6, 190) + '<rect class="ig-btn" x="48" y="120" width="90" height="26" rx="13"/>' + pill(46, 158, 176, 'kalki.uz') + '<circle class="ig-roundb" cx="236" cy="190" r="16"/>' + pulse(236, 190, 19) + moreIc(236, 190) + arrowDown(236, 138), L.s_more); },
    menu26: function (L) { return svg(lines(48, 24, 3, 190) + listCard(100, 62, 164, [L.lRefresh, L.lShare, L.lCopy], 1, shareIc) + arrowLeft(70, 105), L.s_menuShare); },
    fxmenu: function (L) { return svg(lines(48, 24, 6, 190) + '<rect class="ig-tb" x="30" y="170" width="240" height="48"/>' + barIcons([62, 106, 150, 194, 238], 4) + pulse(238, 193, 18) + '<g class="ig-ic hl"><path d="M230 187h16M230 193h16M230 199h16"/></g>' + arrowDown(238, 134), L.s_fxMenu); },
    fxmenu2: function (L) { return svg(lines(48, 24, 3, 190) + listCard(100, 62, 164, [L.lRefresh, L.lShare, L.lCopy], 1, shareIc) + arrowLeft(70, 105), L.s_menuShare); },
    chr1: function (L) { return svg('<rect class="ig-tb top" x="30" y="6" width="240" height="52" rx="26"/>' + pill(44, 212, 20, 'kalki.uz') + pulse(236, 34, 17) + shareIc(236, 34, 'ig-ic hl') + lines(48, 80, 6, 190) + arrowUp(236, 56), L.s_chrShare); },
    share: function (L) { return svg(lines(48, 20, 2, 190) + '<rect class="ig-card" x="30" y="52" width="240" height="166" rx="22"/>' + '<rect class="ig-grab" x="132" y="58" width="36" height="4" rx="2"/>' + listCard(40, 72, 220, [L.lCopy, L.lAddHome, L.lBook], 1, plusSq) + arrowLeft(8, 125), L.s_addhome); },
    add: function (L, c) { return svg('<rect class="ig-card" x="30" y="30" width="240" height="188" rx="22"/>' + txt(46, 58, L.lCancel, 'ig-t sm') + '<rect class="ig-hlrow" x="205" y="40" width="58" height="26" rx="13"/>' + txt(234, 58, L.lAdd, 'ig-t b sm', 'middle') + pulse(234, 53, 24) + txt(150, 92, L.lAddHome, 'ig-t b', 'middle') + '<rect class="ig-appic" x="48" y="108" width="52" height="52" rx="12" style="fill:' + esc(c.color) + '"/>' + '<text class="ig-mark" data-cyr="skip" x="74" y="142" text-anchor="middle">' + esc(c.mark) + '</text>' + '<rect class="ig-ln" x="112" y="120" width="130" height="10" rx="5"/>' + txt(112, 149, 'kalki.uz', 'ig-t sm') + lines(48, 176, 2, 190) + arrowUp(234, 68), L.s_add); },
    in1: function (L, c, v) { return svg('<rect class="ig-tb top" x="30" y="6" width="240" height="40" rx="0"/>' + '<g class="ig-ic"><path d="M52 20l12 12M64 20L52 32"/></g>' + txt(150, 31, 'kalki.uz', 'ig-t sm', 'middle') + pulse(246, 26, 17) + moreIc(246, 26, v === 'a') + lines(48, 66, 5, 190) + arrowUp(246, 46), v === 'a' ? L.s_inMoreA : L.s_inMore); },
    in2: function (L, c, v, open) { return svg('<rect class="ig-tb top" x="30" y="6" width="240" height="40" rx="0"/>' + moreIc(246, 26, v === 'a') + listCard(92, 52, 172, [L.lRefresh, open, L.lCopy], 1, v === 'a' ? chromeIc : compass) + arrowLeft(60, 95), fill(L.s_inOpen, { open: open })); }
  };
  function seqFor(env, v) {                               // qo'llanma qadamlari ketma-ketligi
    if (env.kind === 'inapp') return env.ios ? ['in1', 'in2'] : ['in1', 'in2'];
    if (env.browser === 'chrome' || env.browser === 'edge' || env.browser === 'opera') return ['chr1', 'share', 'add'];
    if (env.browser === 'firefox') return ['fxmenu', 'fxmenu2', 'share', 'add'];
    return v === '26' ? ['saf26a', 'menu26', 'share', 'add'] : ['saf1', 'share', 'add'];
  }

  /* ---------- komponent ---------- */
  function create(cfg) {
    var NAV = typeof navigator !== 'undefined' ? navigator : {}, WIN = typeof window !== 'undefined' ? window : {};
    var standalone = false; try { standalone = (WIN.matchMedia && WIN.matchMedia('(display-mode: standalone)').matches) || NAV.standalone === true; } catch (e) {}
    var env = detect(NAV.userAgent, { platform: NAV.platform, maxTouchPoints: NAV.maxTouchPoints, standalone: standalone, telegram: !!(WIN.TelegramWebviewProxy || WIN.TelegramWebview) });
    var KEY = 'kalki_inst_' + cfg.app, deferred = null, S = load(), iosV = env.ios26 ? '26' : '18', manualWait = false;
    var inst = { env: env, detect: detect, state: function () { return S; } };
    function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return { nos: +o.nos || 0, later: +o.later || 0, res: o.res || '', ok: +o.ok || 0 }; } catch (e) { return { nos: 0, later: 0, res: '', ok: 0 }; } }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
    function L() { var lg = cfg.lang ? cfg.lang() : 'uz'; return D[lg === 'ru' ? 'ru' : 'uz']; }
    function changed() { if (cfg.onChange) cfg.onChange(); }
    function $(s) { return document.querySelector(s); }

    inst.mode = function () {                              // 'none' | 'prompt' | 'guide' | 'inapp' | 'manual'
      if (env.kind === 'standalone' || S.ok) return 'none';
      if (env.kind === 'inapp') return 'inapp';
      if (deferred) return 'prompt';
      if (env.kind === 'ios') return env.browser === 'other' ? 'none' : 'guide';
      if (env.kind === 'android' && manualWait) return 'manual';
      return 'none';
    };
    inst.isTop = function () { return inst.mode() === 'inapp'; };
    inst.canPrompt = function () { return !!deferred; };
    inst.installed = function () { return env.kind === 'standalone' || !!S.ok; };
    function cardOk() {
      var m = inst.mode(); if (m === 'none' || m === 'manual') return false;
      if (S.nos >= MAX_NOS || Date.now() < S.later) return false;
      if (m === 'inapp') return !cfg.setup || cfg.setup();       // ichki brauzerda: onboardingdan keyin darrov
      return cfg.ready ? cfg.ready() : true;                      // boshqalarda: birinchi yozuvdan keyin
    }
    inst.cardHtml = function () {
      if (!cardOk()) return ''; var t = L(), m = inst.mode(), app = esc(cfg.name);
      if (m === 'inapp') return '<div class="rz-card nudge inst" data-inst="card"><div class="t">' + esc(t.inT) + '</div><p class="inst-s">' + esc(fill(t.inS, { app: inst.inappName() })) + '</p><div class="b"><button type="button" class="rz-btn sm primary" data-act="instopen">' + esc(env.ios ? t.inIos : t.inBtn) + '</button><button type="button" class="rz-btn sm ghost" data-act="instlater">' + esc(t.later) + '</button></div></div>';
      return '<div class="rz-card nudge inst" data-inst="card"><div class="t">' + esc(t.cardT) + '</div><p class="inst-s">' + esc(t.cardS) + '</p><div class="b"><button type="button" class="rz-btn sm primary" data-act="' + (m === 'prompt' ? 'inst' : 'instguide') + '" aria-label="' + esc(t.btn + ' ' + cfg.name) + '">' + esc(t.btn) + '</button><button type="button" class="rz-btn sm ghost" data-act="instlater">' + esc(t.later) + '</button></div></div>';
    };
    inst.inappName = function () { var n = env.inapp; return { telegram: 'Telegram', instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', whatsapp: 'WhatsApp', snapchat: 'Snapchat', line: 'LINE', twitter: 'X' }[n] || (L() === D.ru ? 'другом приложении' : 'boshqa ilova'); };
    inst.row = function () {                               // Men/Sozlamalar qatori (doimiy): {act, html}
      var m = inst.mode(); if (m === 'none') return null; var t = L(), act = m === 'prompt' ? 'inst' : m === 'inapp' ? 'instopen' : 'instguide';
      var svgI = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M8 11l4 4 4-4M5 19h14"/></svg>';
      return { act: act, html: '<button type="button" class="rz-row" data-act="' + act + '" data-inst="row"><span class="' + esc(cfg.rowIcon || 'rz-ci') + '">' + svgI + '</span><span class="m"><b>' + esc(m === 'inapp' ? t.inT : t.rowT) + '</b><span>' + esc(m === 'inapp' ? t.inBtn : t.rowS) + '</span></span><svg class="rz-i r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' };
    };

    /* ---- harakatlar ---- */
    inst.prompt = function () {
      if (!deferred) return false; var d = deferred; deferred = null;
      try { d.prompt(); var up = d.userChoice; if (up && up.then) up.then(function (r) { S.res = r && r.outcome || ''; if (S.res === 'dismissed') { S.nos++; S.later = Date.now() + LATER_DAYS * DAY; } save(); changed(); }, function () {}); } catch (e) {}
      changed(); return true;
    };
    inst.later = function () { S.nos++; S.later = Date.now() + LATER_DAYS * DAY; save(); changed(); };
    inst.guideHtml = function () {
      var t = L(), seq = seqFor(env, iosV), c = { color: cfg.color || '#0E3B2E', mark: cfg.mark || 'K' }, inapp = env.kind === 'inapp';
      var open = inapp ? (env.android ? t.lChrome : (env.inapp === 'telegram' ? t.lSafari : (env.inapp === 'webview' ? t.lSafari : t.lExt))) : '';
      var sw = '';
      if (!inapp && env.browser === 'safari') sw = '<div class="inst-sw" role="group" aria-label="' + esc(t.gWhich) + '"><span>' + esc(t.gWhich) + '</span><button type="button" data-act="instv" data-v="18" class="' + (iosV === '18' ? 'on' : '') + '">' + esc(t.g18) + '</button><button type="button" data-act="instv" data-v="26" class="' + (iosV === '26' ? 'on' : '') + '">' + esc(t.g26) + '</button></div>';
      var who = inapp ? '' : (env.browser === 'chrome' ? t.gChr : env.browser === 'firefox' ? t.gFx : t.gSaf);
      var steps = seq.map(function (k, i) {
        var v = inapp && env.android ? 'a' : 'i', fig = STEPS[k](t, c, v, open), cap = fill({ saf1: t.s_share, saf26a: t.s_more, menu26: t.s_menuShare, fxmenu: t.s_fxMenu, fxmenu2: t.s_menuShare, chr1: t.s_chrShare, share: t.s_addhome, add: t.s_add, in1: v === 'a' ? t.s_inMoreA : t.s_inMore, in2: t.s_inOpen }[k], { open: open });
        return '<li class="inst-step" style="--i:' + i + '"><div class="inst-fig">' + fig + '</div><p><b class="inst-n">' + (i + 1) + '</b><span>' + esc(cap) + '</span></p></li>';
      }).join('');
      return '<div class="inst-guide" data-inst="guide"><div class="rz-sh-h"><b>' + esc(inapp ? t.inGT : t.gT) + (who ? ' · ' + esc(who) : '') + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(t.x) + '">' + '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' + sw + '<ol class="inst-steps">' + steps + '</ol><p class="inst-s">' + esc(inapp ? t.inGN : fill(t.gNote, { name: cfg.name }) + (env.browser === 'chrome' || env.browser === 'firefox' ? ' ' + t.gOld : '')) + '</p><button type="button" class="rz-btn primary wide" data-act="sheetclose">' + esc(t.gClose) + '</button></div>';
    };
    inst.openGuide = function () { if (cfg.kit) cfg.kit.openSheet('install', inst.guideHtml(), { noFocus: true }); };
    inst.manualHtml = function () { var t = L(); return '<div class="inst-guide"><div class="rz-sh-h"><b>' + esc(t.aT) + '</b></div><p class="inst-s">' + esc(t.aS) + '</p><button type="button" class="rz-btn primary wide" data-act="sheetclose">' + esc(t.gClose) + '</button></div>'; };
    inst.openExternal = function () {                      // ichki brauzerdan chiqish
      var loc = WIN.location; if (!loc) return;
      var target = env.android ? intentUrl(loc) : env.ios ? safariUrl(loc) : null; if (!target) { inst.openGuide(); return; }
      var t0 = Date.now(); try { loc.href = target; } catch (e) {}
      setTimeout(function () { if (Date.now() - t0 < 4000 && !document.hidden) inst.openGuide(); }, 1400);   // chiqib bo'lmadi → ko'rsatma
    };

    /* ---- hodisalar ---- */
    inst.act = function (a, el) {
      if (a === 'inst') { if (!inst.prompt()) inst.openGuide(); return true; }
      if (a === 'instguide') { if (inst.mode() === 'manual') cfg.kit.openSheet('install', inst.manualHtml(), { noFocus: true }); else inst.openGuide(); return true; }
      if (a === 'instopen') { inst.openExternal(); return true; }
      if (a === 'instlater') { inst.later(); return true; }
      if (a === 'instv') { iosV = el.getAttribute('data-v') === '26' ? '26' : '18'; var sh = $('#rzSheet'); if (sh && sh.querySelector('.inst-guide')) { var g = sh.querySelector('.inst-guide'); g.outerHTML = inst.guideHtml(); } return true; }
      return false;
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act^=inst]'); if (b && inst.act(b.getAttribute('data-act'), b)) { e.preventDefault(); } });
      WIN.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; changed(); });
      WIN.addEventListener('appinstalled', function () { deferred = null; S.ok = Date.now(); S.res = 'accepted'; save(); if (cfg.kit && cfg.kit.sheetKind() === 'install') cfg.kit.closeSheet(); if (cfg.kit) cfg.kit.toast(L().done, null, true); changed(); });
      if (env.kind === 'android') setTimeout(function () { if (!deferred && !S.ok) { manualWait = true; changed(); } }, 4000);
      if (env.kind === 'standalone') try { document.body.classList.add('rz-standalone'); } catch (e) {}
    }
    return inst;
  }
  return { create: create, detect: detect, intentUrl: intentUrl, safariUrl: safariUrl, STEPS: STEPS, D: D };
});
