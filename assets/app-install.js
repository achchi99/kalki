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
      chT: "{app} qanday ishlatasiz?", chS: "iPhone'da Safari va bosh ekrandagi ilova ma'lumotlari ALOHIDA saqlanadi. Ilova qilib o'rnatsangiz, ma'lumotlaringiz bir joyda qoladi.", chInst: "Ilova qilib o'rnatish — tavsiya", chWeb: 'Brauzerda davom etish',
      mgT: "Safari'da ma'lumot kiritgan edingizmi?", mgS: "Kiritgan bo'lsangiz, Safari'da «O'rnatish» ni bosganingizda ma'lumotlar nusxalangan edi. Ularni shu yerga ko'chirib oling.", mgGo: "Ko'chirish", mgNo: "Yo'q, yangidan boshlash", mgPaste: "Kodni shu yerga joylang", mgPasteGo: "Joylangan kodni ko'chirish", mgBusy: "Ko'chirilmoqda…", mgOk: "Ma'lumotlaringiz ko'chirildi",
      eEmpty: "Nusxalangan kod topilmadi. Safari'da ilovani ochib «O'rnatish» ni bosing, so'ng bu yerga qayting.", eFmt: "Bu {app} kodi emas yoki buzilgan. Safari'da qaytadan nusxalang.", eApp: "Bu kod boshqa ilovaniki.", eSize: "Kod juda katta (200 KB dan oshdi).", eBad: "Kod buzilgan yoki eskirgan. Safari'da qaytadan nusxalang.", eClip: "Buferdan o'qishga ruxsat berilmadi. Kodni quyidagi maydonga joylang.",
      cpOk: "Ma'lumotlaringiz nusxalandi — ilovani ochgach «Ko'chirish»ni bosing", cpNote: "Ma'lumotlaringiz nusxalandi. Ilovani bosh ekrandan ochgach «Ko'chirish» tugmasini bosing.", cpAgain: "Ma'lumotni qayta nusxalash", cpFail: "Nusxalab bo'lmadi — Men bo'limidan «Zaxira nusxa olish» ni ishlating.",
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
      chT: 'Как вы будете пользоваться {app}?', chS: 'На iPhone данные в Safari и в приложении на главном экране хранятся ОТДЕЛЬНО. Если установить как приложение, данные останутся в одном месте.', chInst: 'Установить как приложение — рекомендуем', chWeb: 'Продолжить в браузере',
      mgT: 'Вводили данные в Safari?', mgS: 'Если вводили, при нажатии «Установить» в Safari данные были скопированы. Перенесите их сюда.', mgGo: 'Перенести', mgNo: 'Нет, начать заново', mgPaste: 'Вставьте код сюда', mgPasteGo: 'Перенести вставленный код', mgBusy: 'Переносим…', mgOk: 'Данные перенесены',
      eEmpty: 'Скопированный код не найден. Откройте приложение в Safari, нажмите «Установить» и вернитесь сюда.', eFmt: 'Это не код {app} или он повреждён. Скопируйте заново в Safari.', eApp: 'Этот код от другого приложения.', eSize: 'Код слишком большой (больше 200 КБ).', eBad: 'Код повреждён или устарел. Скопируйте заново в Safari.', eClip: 'Нет доступа к буферу обмена. Вставьте код в поле ниже.',
      cpOk: 'Данные скопированы — после открытия приложения нажмите «Перенести»', cpNote: 'Данные скопированы. Откройте приложение с главного экрана и нажмите «Перенести».', cpAgain: 'Скопировать данные ещё раз', cpFail: 'Не удалось скопировать — используйте «Сделать резервную копию» в разделе «Я».',
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

  /* ---------- ko'chirish kodi: butun holat → ixcham matn (deflate + base64url), serversiz ---------- */
  var MAX_CODE = 300000, MAX_DECODED = 200 * 1024;
  function toB64u(u8) { var s = ''; for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function fromB64u(t) { t = String(t).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var bin = atob(t), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function plainCode(app, text) { return 'kalki1.' + app + '.p.' + toB64u(new TextEncoder().encode(text)); }   // sinxron (siqilmagan) — zaxira
  function encodeCode(app, text) {                       // Promise<string>
    var raw = new TextEncoder().encode(text);
    if (typeof CompressionStream === 'undefined') return Promise.resolve('kalki1.' + app + '.p.' + toB64u(raw));
    var cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter(); w.write(raw); w.close();
    return new Response(cs.readable).arrayBuffer().then(function (b) { return 'kalki1.' + app + '.z.' + toB64u(new Uint8Array(b)); });
  }
  function decodeCode(app, code) {                       // Promise<{ok, text} | {ok:false, err}>
    code = String(code == null ? '' : code).replace(/\s+/g, '');
    if (!code) return Promise.resolve({ ok: false, err: 'eEmpty' });
    if (code.length > MAX_CODE) return Promise.resolve({ ok: false, err: 'eSize' });
    var m = /^kalki1\.([a-z]+)\.([zp])\.([A-Za-z0-9_-]+)$/.exec(code);
    if (!m) return Promise.resolve({ ok: false, err: 'eFmt' });
    if (m[1] !== app) return Promise.resolve({ ok: false, err: 'eApp' });
    var u8; try { u8 = fromB64u(m[3]); } catch (e) { return Promise.resolve({ ok: false, err: 'eBad' }); }
    var done = function (bytes) { if (bytes.length > MAX_DECODED) return { ok: false, err: 'eSize' }; try { return { ok: true, text: new TextDecoder('utf-8', { fatal: true }).decode(bytes) }; } catch (e) { return { ok: false, err: 'eBad' }; } };
    if (m[2] === 'p') return Promise.resolve(done(u8));
    if (typeof DecompressionStream === 'undefined') return Promise.resolve({ ok: false, err: 'eBad' });
    var ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(u8)['catch'](function () {}); w.close()['catch'](function () {});
    var rd = ds.readable.getReader(), parts = [], total = 0;
    return (function pump() { return rd.read().then(function (r) { if (r.done) { var all = new Uint8Array(total), o = 0; parts.forEach(function (c) { all.set(c, o); o += c.length; }); return done(all); } total += r.value.length; if (total > MAX_DECODED) { rd.cancel()['catch'](function () {}); return { ok: false, err: 'eSize' }; } parts.push(r.value); return pump(); }); })()['catch'](function () { return { ok: false, err: 'eBad' }; });
  }

  /* ---------- komponent ---------- */
  function create(cfg) {
    var NAV = typeof navigator !== 'undefined' ? navigator : {}, WIN = typeof window !== 'undefined' ? window : {};
    var standalone = false; try { standalone = (WIN.matchMedia && WIN.matchMedia('(display-mode: standalone)').matches) || NAV.standalone === true; } catch (e) {}
    var env = detect(NAV.userAgent, { platform: NAV.platform, maxTouchPoints: NAV.maxTouchPoints, standalone: standalone, telegram: !!(WIN.TelegramWebviewProxy || WIN.TelegramWebview) });
    var KEY = 'kalki_inst_' + cfg.app, deferred = null, S = load(), iosV = env.ios26 ? '26' : '18', manualWait = false;
    var inst = { env: env, detect: detect, state: function () { return S; } };
    function load() { try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return { nos: +o.nos || 0, later: +o.later || 0, res: o.res || '', ok: +o.ok || 0, choice: o.choice || '', mig: +o.mig || 0 }; } catch (e) { return { nos: 0, later: 0, res: '', ok: 0, choice: '', mig: 0 }; } }
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
      return '<div class="inst-guide" data-inst="guide"><div class="rz-sh-h"><b>' + esc(inapp ? t.inGT : t.gT) + (who ? ' · ' + esc(who) : '') + '</b><button type="button" class="rz-x" data-act="sheetclose" aria-label="' + esc(t.x) + '">' + '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' + sw + (!inapp && inst.hasData() && env.ios ? '<p class="inst-note" role="status">' + esc(t.cpNote) + '</p><button type="button" class="rz-btn sm" data-act="instcopy">' + esc(t.cpAgain) + '</button>' : '') + '<ol class="inst-steps">' + steps + '</ol><p class="inst-s">' + esc(inapp ? t.inGN : fill(t.gNote, { name: cfg.name }) + (env.browser === 'chrome' || env.browser === 'firefox' ? ' ' + t.gOld : '')) + '</p><button type="button" class="rz-btn primary wide" data-act="sheetclose">' + esc(t.gClose) + '</button></div>';
    };
    inst.refreshGuide = function () { var sh = document.getElementById('rzSheet'), g = sh && sh.querySelector('.inst-guide'); if (g) g.outerHTML = inst.guideHtml(); };
    inst.openGuide = function () { if (cfg.kit) cfg.kit.openSheet('install', inst.guideHtml(), { noFocus: true }); };
    inst.manualHtml = function () { var t = L(); return '<div class="inst-guide"><div class="rz-sh-h"><b>' + esc(t.aT) + '</b></div><p class="inst-s">' + esc(t.aS) + '</p><button type="button" class="rz-btn primary wide" data-act="sheetclose">' + esc(t.gClose) + '</button></div>'; };
    inst.openExternal = function () {                      // ichki brauzerdan chiqish
      var loc = WIN.location; if (!loc) return;
      var target = env.android ? intentUrl(loc) : env.ios ? safariUrl(loc) : null; if (!target) { inst.openGuide(); return; }
      var t0 = Date.now(); try { loc.href = target; } catch (e) {}
      setTimeout(function () { if (Date.now() - t0 < 4000 && !document.hidden) inst.openGuide(); }, 1400);   // chiqib bo'lmadi → ko'rsatma
    };

    /* ---- iPhone: Safari va bosh ekrandagi ilova xotirasi ALOHIDA → ma'lumotni kod bilan ko'chirish ---- */
    var copied = false;
    inst.hasData = function () { return !!(cfg.hasData && cfg.hasData()); };
    inst.copyData = function () {                       // foydalanuvchi bosishi ichida chaqiriladi; Promise<boolean>
      if (!inst.hasData()) return Promise.resolve(false);
      var text; try { text = cfg.exportText(); } catch (e) { return Promise.resolve(false); }
      var ok = function () { copied = true; if (cfg.kit) cfg.kit.toast(L().cpOk, null, true); return true; };
      var bad = function () { if (cfg.kit) cfg.kit.toast(L().cpFail); return false; };
      var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = plainCode(cfg.app, text); ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, ta.value.length); var r = document.execCommand('copy'); ta.remove(); return r ? ok() : bad(); } catch (e) { return bad(); } };
      var nav = NAV.clipboard;
      if (nav && WIN.ClipboardItem && nav.write) {      // Safari: Promise bilan — bosish "ruxsati" asinxron siqish davomida yo'qolmaydi
        try { var item = new WIN.ClipboardItem({ 'text/plain': encodeCode(cfg.app, text).then(function (c) { return new Blob([c], { type: 'text/plain' }); }) }); return nav.write([item]).then(ok, function () { return nav.writeText ? nav.writeText(plainCode(cfg.app, text)).then(ok, legacy) : legacy(); }); } catch (e) {}
      }
      if (nav && nav.writeText) return nav.writeText(plainCode(cfg.app, text)).then(ok, legacy);
      return Promise.resolve(legacy());
    };
    inst.copiedNow = function () { return copied; };
    function gateMode() {
      if (!cfg.root || (cfg.hasData && cfg.hasData())) return '';
      if (env.ios && env.kind === 'standalone' && !S.mig) return 'migrate';
      if (env.ios && env.kind === 'ios' && S.choice !== 'browser') return 'choice';
      return '';
    }
    function gateClose() { var g = document.getElementById('rzGate'); if (g) g.remove(); if (cfg.root) cfg.root.classList.remove('inst-gating'); if (cfg.onGate) cfg.onGate(); }
    function gateHtml(mode, errKey, paste) {
      var t = L(), appN = (L() === D.ru ? (cfg.nameRu || cfg.name) : (cfg.nameAcc || cfg.name)), ic = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M8 11l4 4 4-4M5 19h14"/></svg>';
      if (mode === 'choice') return '<div class="rz-ob-top"><span></span></div><div class="rz-ob-body inst-gbody"><div class="inst-gic" aria-hidden="true">' + ic + '</div><h2 class="rz-q">' + esc(fill(t.chT, { app: appN })) + '</h2><p class="rz-p">' + esc(t.chS) + '</p></div><div class="rz-ob-foot inst-gfoot"><button type="button" class="rz-btn primary" data-act="gateinst">' + esc(t.chInst) + '</button><button type="button" class="rz-btn ghost" data-act="gateweb">' + esc(t.chWeb) + '</button></div>';
      return '<div class="rz-ob-top"><span></span></div><div class="rz-ob-body inst-gbody"><div class="inst-gic" aria-hidden="true">' + ic + '</div><h2 class="rz-q">' + esc(t.mgT) + '</h2><p class="rz-p">' + esc(t.mgS) + '</p>' + (errKey ? '<p class="rz-p warn" role="alert" id="mgErr">' + esc(fill(t[errKey] || t.eBad, { app: (L() === D.ru ? (cfg.nameRu || cfg.name) : cfg.name) })) + '</p>' : '') + (paste ? '<label class="rz-f" for="mgPaste"><span>' + esc(t.mgPaste) + '</span><textarea id="mgPaste" rows="3" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea></label>' : '') + '</div><div class="rz-ob-foot inst-gfoot"><button type="button" class="rz-btn primary" data-act="' + (paste ? 'gatepaste' : 'gatemig') + '" id="mgGo">' + esc(paste ? t.mgPasteGo : t.mgGo) + '</button><button type="button" class="rz-btn ghost" data-act="gateno">' + esc(t.mgNo) + '</button></div>';
    }
    var gMode = '', gPaste = false;
    inst.gate = function () {                            // ilova ishga tushganda (shell'dan keyin) chaqiriladi; true = ekran ko'rsatildi
      gMode = gateMode(); if (!gMode || typeof document === 'undefined') return false;
      var g = document.getElementById('rzGate'); if (!g) { g = document.createElement('div'); g.id = 'rzGate'; g.className = 'rz-onb inst-gate'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true'); cfg.root.appendChild(g); }
      cfg.root.classList.add('inst-gating'); g.innerHTML = gateHtml(gMode, '', false); gPaste = false; return true;
    };
    inst.gateActive = function () { return !!document.getElementById('rzGate'); };
    function gateShow(err, paste) { var g = document.getElementById('rzGate'); if (!g) return; gPaste = !!paste; g.innerHTML = gateHtml(gMode, err, gPaste); var ta = g.querySelector('textarea'); if (ta) try { ta.focus({ preventScroll: true }); } catch (e) {} }
    function runImport(code) {
      var b = document.getElementById('mgGo'); if (b) { b.disabled = true; b.textContent = L().mgBusy; }
      return decodeCode(cfg.app, code).then(function (r) {
        if (!r.ok) { gateShow(r.err, true); return false; }
        var res; try { res = cfg.importText(r.text); } catch (e) { res = null; }
        if (!res || !res.ok) { gateShow('eFmt', true); return false; }
        S.mig = Date.now(); save(); try { cfg.applyState(res.state); } catch (e) {} gateClose(); if (cfg.kit) cfg.kit.toast(L().mgOk, null, true); return true;
      });
    }
    inst.importCode = function (code) { return decodeCode(cfg.app, code).then(function (r) { if (!r.ok) return { ok: false, err: r.err }; var res = cfg.importText(r.text); return res && res.ok ? { ok: true, state: res.state } : { ok: false, err: 'eFmt' }; }); };

    /* ---- hodisalar ---- */
    inst.act = function (a, el) {
      var iosCopy = env.ios && inst.hasData();
      if (a === 'inst') { if (!inst.prompt()) { if (iosCopy) inst.copyData(); inst.openGuide(); } return true; }
      if (a === 'instguide') { if (inst.mode() === 'manual') cfg.kit.openSheet('install', inst.manualHtml(), { noFocus: true }); else { if (iosCopy) inst.copyData(); inst.openGuide(); } return true; }
      if (a === 'instopen') { if (iosCopy) inst.copyData(); inst.openExternal(); return true; }
      if (a === 'instcopy') { inst.copyData().then(function () { inst.refreshGuide(); }); return true; }
      if (a === 'gateinst') { inst.openGuide(); return true; }
      if (a === 'gateweb') { S.choice = 'browser'; save(); gateClose(); return true; }
      if (a === 'gateno') { S.mig = Date.now(); save(); gateClose(); return true; }
      if (a === 'gatemig') { var nav = NAV.clipboard; if (!nav || !nav.readText) { gateShow('eClip', true); return true; } nav.readText().then(function (t) { if (!String(t || '').trim()) { gateShow('eEmpty', true); return; } runImport(t); }, function () { gateShow('eClip', true); }); return true; }
      if (a === 'gatepaste') { var ta = document.getElementById('mgPaste'); runImport(ta ? ta.value : ''); return true; }
      if (a === 'instlater') { inst.later(); return true; }
      if (a === 'instv') { iosV = el.getAttribute('data-v') === '26' ? '26' : '18'; var sh = $('#rzSheet'); if (sh && sh.querySelector('.inst-guide')) { var g = sh.querySelector('.inst-guide'); g.outerHTML = inst.guideHtml(); } return true; }
      return false;
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act^=inst],[data-act^=gate]'); if (b && inst.act(b.getAttribute('data-act'), b)) { e.preventDefault(); } });
      WIN.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; changed(); });
      WIN.addEventListener('appinstalled', function () { deferred = null; S.ok = Date.now(); S.res = 'accepted'; save(); if (cfg.kit && cfg.kit.sheetKind() === 'install') cfg.kit.closeSheet(); if (cfg.kit) cfg.kit.toast(L().done, null, true); changed(); });
      if (env.kind === 'android') setTimeout(function () { if (!deferred && !S.ok) { manualWait = true; changed(); } }, 4000);
      if (env.kind === 'standalone') try { document.body.classList.add('rz-standalone'); } catch (e) {}
    }
    return inst;
  }
  return { create: create, encodeCode: encodeCode, decodeCode: decodeCode, plainCode: plainCode, detect: detect, intentUrl: intentUrl, safariUrl: safariUrl, STEPS: STEPS, D: D };
});
