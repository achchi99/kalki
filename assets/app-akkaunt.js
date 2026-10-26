/* kalki.uz — IXTIYORIY akkaunt (app-kit qismi): Ro'zg'or va KalkiFit ikkalasi shuni ishlatadi. Email + bir martalik kod (parolsiz). Server: /api/akkaunt/* (functions/api/akkaunt/[amal].js).
 *  Kirish MAJBURIY EMAS: ilova akkauntsiz avvalgidek ishlaydi; tiklash kodi (KF-/RZ-), Telegram zaxirasi va bulutga saqlash o'z holicha qoladi («Boshqa usullar»).
 *  Server "yoqilgan:false" desa (Resend kaliti / server kaliti yo'q yoki migratsiya yurgizilmagan production) — hech narsa ko'rsatilmaydi.
 *  GIBRID rejim: kirgan foydalanuvchining tiklash kodi server kaliti bilan o'ralib akkauntga bog'lanadi (zaxira formati va /api/zaxira o'zgarmaydi). Kirganda:
 *    akkaunt ulanmagan → shu qurilmadagi zaxira ulanadi (qayta yuklanmaydi; kodli foydalanuvchi ham shunday), ma'lumot bor-yo'q bo'lsa yangi kod bilan bulut yoqiladi;
 *    akkaunt ulangan → yangi qurilmada avtomatik tiklanadi; ikkala tomonda ma'lumot bo'lsa foydalanuvchi tanlaydi (jimgina ustiga yozilmaydi).
 *  "Qat'iy rejim": konvert yo'q — tiklash faqat kod bilan.
 *  Ishlatish: var akk = KalkiAkkaunt.create({ app, kit, lang, bk, hasData, onChange, onOnb, rowIcon }); akk.rowHtml(); akk.more(html); akk.strictRow(); akk.restoreLink(); akk.check(). */
(function (root, factory) {
  var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiAkkaunt = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  /* ===== BITTA SOZLAMA: akkaunt API manzili. Boshqa server/domenga o'tilsa FAQAT shu qator o'zgaradi (docs/akkaunt-kochirish.md). ===== */
  var AKKAUNT_API = '/api/akkaunt';
  var CACHE = 'kalki_akk', TTL_ON = 5 * 60000, TTL_OFF = 60 * 60000;     // holat keshi: yoqilgan bo'lsa 5 daqiqa, o'chiq bo'lsa 1 soat (Functions so'rovlarini tejash)

  var D = {
    uz: {
      nmAsk: 'Ismingizni yozing', nmEdit: 'Ismni o\'zgartirish', nmT: 'Ismingiz', nmP: 'Ism faqat sizga ko\'rinadi va akkauntingizda saqlanadi.', nmPh: 'Ismingiz', nmSave: 'Saqlash', nmSaved: 'Ism saqlandi', nmEmpty: 'Ismni yozing (40 belgigacha).', nmHello: 'Salom', nmLbl: 'Ism',
      gIn: 'Google bilan kirish', gOr: 'yoki', gErr: "Google bilan kirib bo'lmadi. Email bilan kiring yoki keyinroq urinib ko'ring.", gOk: 'Google bilan kirildi',
      rowT: 'Email bilan kirish', rowS: "Ma'lumotingiz avtomatik saqlanadi", rowOnT: 'Akkaunt', rowOnS: '{e}', rowOnSaved: '{e} · avtomatik saqlanadi',
      inT: 'Email bilan kirish', inP: "Emailingizga 6 xonali kod yuboramiz — parol kerak emas. Kirsangiz, ma'lumotingiz avtomatik saqlanadi va yangi telefonda shu email bilan tiklanadi.", inP2: "Kirmasangiz ham ilova avvalgidek ishlayveradi.",
      email: 'Email', emailPh: 'ism@pochta.uz', send: 'Kod yuborish', sending: 'Yuborilmoqda…', priv: "Tiklash kodingiz serverda maxfiy kalit bilan shifrlanib saqlanadi. Xohlamasangiz «Boshqa usullar»da «Qat'iy rejim»ni yoqing.", privLink: 'Maxfiylik',
      cdT: 'Kodni kiriting', cdP: '{e} manziliga 6 xonali kod yubordik. Kod 10 daqiqa amal qiladi.', cdPh: '000000', cdLbl: 'Emaildagi kod', go: 'Kirish', going: 'Tekshirilmoqda…', other: 'Boshqa email', resend: 'Kodni qayta yuborish', resendIn: 'Qayta yuborish: {n} s', spam: "Kod kelmadimi? «Spam» papkasini ham tekshiring.",
      okIn: 'Kirdingiz ✓', okNew: 'Akkaunt ochildi ✓', okOut: 'Chiqdingiz', okDel: "Akkaunt o'chirildi", okMk: 'Saqlandi', okRestored: "Ma'lumotingiz akkauntdan tiklandi ✓", okSaved: "Ma'lumotingiz avtomatik saqlanadi ✓", okStrict: "Qat'iy rejim yoqildi", okKonv: "Email bilan tiklash qayta yoqildi",
      accT: 'Akkaunt', accOn: 'Kirgansiz: {e}', accDev: 'Kirgan qurilmalar: {n}', accSaved: "✓ Ma'lumotingiz avtomatik saqlanadi — yangi telefonda shu email bilan kirsangiz tiklanadi.", accWait: "Ma'lumot kiritganingizdan keyin avtomatik saqlanadi.", accStrict: "Qat'iy rejim yoqilgan: yangi telefonda ma'lumotni faqat tiklash kodi bilan tiklaysiz.",
      mk: 'Yangilik va maslahatlarni emailga yuborishga roziman', mkS: "Ixtiyoriy. Istalgan payt o'chirib qo'yasiz. Emailingiz boshqalarga berilmaydi.",
      out: 'Chiqish', outAll: 'Hamma qurilmadan chiqish', dl: "Ma'lumotimni yuklab olish", del: "Akkauntni o'chirish",
      delT: "Akkauntni o'chirish", delP: "Email va akkaunt ma'lumotlaringiz serverdan butunlay o'chadi, tiklash kodingiz akkauntdan ajraladi. Telefondagi ilova ma'lumoti va bulutdagi zaxira (tiklash kodi bilan) saqlanib qoladi.", delSend: 'Tasdiqlash kodini yuborish', delGo: "Butunlay o'chirish", delCd: '{e} manziliga tasdiqlash kodini yubordik.', back: 'Orqaga',
      eEmpty: 'Email yozilmagan. Manzilingizni kiriting, masalan: ism@pochta.uz.', eEmail: "Email noto'g'ri yozilgan. «@» belgisi va domenni tekshiring (masalan: ism@pochta.uz).", eCodeEmpty: 'Emaildagi 6 xonali kodni kiriting.',
      eKut: "Kod yaqinda yuborilgan. {n} soniyadan keyin qayta yuborishingiz mumkin — hozircha emaildagi kodni kiriting.", eLimit: "Urinishlar chegarasi to'ldi. {n} daqiqadan keyin qayta urinib ko'ring.",
      eXato: "Kod noto'g'ri. Emaildagi 6 xonali kodni qayta kiriting.", eYoq: "Kod eskirgan (10 daqiqa o'tgan) yoki undan keyin yangi kod yuborilgan. «Kodni qayta yuborish»ni bosing va oxirgi xatdagi kodni kiriting.", eQulf: "Juda ko'p noto'g'ri urinish — xavfsizlik uchun kod bekor qilindi. «Kodni qayta yuborish»ni bosib yangi kod oling.",
      eXat: "Xatni yuborib bo'lmadi. Emailni tekshiring yoki birozdan keyin qayta urinib ko'ring.", eNet: "Internet yo'q yoki server javob bermadi. Ulanishni tekshirib, qayta urinib ko'ring.", eSes: 'Sessiya tugagan. Qaytadan kiring.', eSrv: "Xizmat vaqtincha ishlamayapti. Birozdan keyin qayta urinib ko'ring.",
      dev: "Test rejimi (faqat sinov uchun): kod emailga yuborilmaydi.", devPw: 'Administrator paroli', devGet: 'Kodni olish (test)', devNo: 'Kod topilmadi',
      cfT: "Bu qurilmada ham ma'lumot bor", cfP: "Akkauntingizda saqlangan nusxa bor{d}. Qaysi biri qolsin? Tanlanmagani ustiga yoziladi.", cfCloud: 'Akkauntdagini olish', cfLocal: 'Shu qurilmadagini saqlash', cfDate: ' (oxirgi saqlangan: {d})',
      stT: "Qat'iy rejim", stOffS: "Tiklash kodi serverda saqlanmaydi", stOnS: 'Yoqilgan — faqat kod bilan tiklanadi',
      stP: "Qat'iy rejimda tiklash kodingiz serverda saqlanmaydi: yangi telefonda ma'lumotni FAQAT shu kod bilan tiklaysiz. Kodni yo'qotsangiz, ma'lumotni hech kim — biz ham — tiklay olmaydi.", stCode: 'Kodingiz (avval yozib oling):', stGo: "Qat'iy rejimni yoqish",
      stOnP: "Qat'iy rejim yoqilgan: tiklash kodi serverda saqlanmaydi, ma'lumotni faqat kod bilan tiklaysiz. Email bilan tiklashni qayta yoqmoqchimisiz?", stBack: 'Email bilan tiklashni yoqish', stNoCode: "Qaytish uchun bu qurilmada tiklash kodi kerak. Avval kod bilan tiklang.",
      stLoginT: "Qat'iy rejim yoqilgan", stLoginP: "Bu akkaunt qat'iy rejimda: ma'lumotni faqat tiklash kodi bilan tiklaysiz.", stLoginGo: 'Tiklash kodini kiritish', stLoginNo: 'Hozir emas',
      onbLink: 'Email bilan kirish (yangi telefon)',
      eTypo: "Email manzilida xato bo'lishi mumkin. «{a}» o'rniga «{b}» yozdik — to'g'ri bo'lsa «Kod yuborish»ni bosing.", eRestore: "Akkauntdagi ma'lumotni tiklab bo'lmadi. Internetni tekshirib, qaytadan kirib ko'ring."
    },
    ru: {
      nmAsk: 'Напишите своё имя', nmEdit: 'Изменить имя', nmT: 'Ваше имя', nmP: 'Имя видите только вы, оно хранится в вашем аккаунте.', nmPh: 'Ваше имя', nmSave: 'Сохранить', nmSaved: 'Имя сохранено', nmEmpty: 'Напишите имя (до 40 символов).', nmHello: 'Привет', nmLbl: 'Имя',
      gIn: 'Войти через Google', gOr: 'или', gErr: 'Не удалось войти через Google. Войдите по email или попробуйте позже.', gOk: 'Вход через Google выполнен',
      rowT: 'Вход по email', rowS: 'Ваши данные сохраняются автоматически', rowOnT: 'Аккаунт', rowOnS: '{e}', rowOnSaved: '{e} · сохраняется автоматически',
      inT: 'Вход по email', inP: 'Мы отправим на email 6-значный код — пароль не нужен. После входа данные сохраняются автоматически и восстанавливаются на новом телефоне по этому email.', inP2: 'Если не входить, приложение работает как раньше.',
      email: 'Email', emailPh: 'imya@pochta.uz', send: 'Отправить код', sending: 'Отправляем…', priv: 'Ваш код восстановления хранится на сервере, зашифрованный секретным ключом. Не хотите — включите «Строгий режим» в «Других способах».', privLink: 'Конфиденциальность',
      cdT: 'Введите код', cdP: 'Мы отправили 6-значный код на {e}. Код действует 10 минут.', cdPh: '000000', cdLbl: 'Код из письма', go: 'Войти', going: 'Проверяем…', other: 'Другой email', resend: 'Отправить код ещё раз', resendIn: 'Повторно через {n} с', spam: 'Код не пришёл? Проверьте папку «Спам».',
      okIn: 'Вы вошли ✓', okNew: 'Аккаунт создан ✓', okOut: 'Вы вышли', okDel: 'Аккаунт удалён', okMk: 'Сохранено', okRestored: 'Данные восстановлены из аккаунта ✓', okSaved: 'Данные теперь сохраняются автоматически ✓', okStrict: 'Строгий режим включён', okKonv: 'Восстановление по email снова включено',
      accT: 'Аккаунт', accOn: 'Вы вошли: {e}', accDev: 'Устройств с входом: {n}', accSaved: '✓ Данные сохраняются автоматически — на новом телефоне войдите по этому email, и они восстановятся.', accWait: 'Данные начнут сохраняться автоматически, когда вы что-нибудь добавите.', accStrict: 'Строгий режим включён: на новом телефоне данные восстанавливаются только по коду восстановления.',
      mk: 'Согласен получать новости и советы на email', mkS: 'Необязательно. Можно отключить в любой момент. Email не передаётся третьим лицам.',
      out: 'Выйти', outAll: 'Выйти на всех устройствах', dl: 'Скачать мои данные', del: 'Удалить аккаунт',
      delT: 'Удалить аккаунт', delP: 'Email и данные аккаунта будут полностью удалены с сервера, код восстановления отвяжется от аккаунта. Данные приложения на телефоне и облачная копия (по коду восстановления) сохранятся.', delSend: 'Отправить код подтверждения', delGo: 'Удалить навсегда', delCd: 'Мы отправили код подтверждения на {e}.', back: 'Назад',
      eEmpty: 'Email не указан. Введите адрес, например: imya@pochta.uz.', eEmail: 'Email записан неверно. Проверьте знак «@» и домен (например: imya@pochta.uz).', eCodeEmpty: 'Введите 6-значный код из письма.',
      eKut: 'Код уже отправлен. Повторно можно через {n} с — пока введите код из письма.', eLimit: 'Лимит попыток исчерпан. Повторите через {n} мин.',
      eXato: 'Код неверный. Введите 6-значный код из письма ещё раз.', eYoq: 'Код устарел (прошло 10 минут) или после него отправлен новый. Нажмите «Отправить код ещё раз» и введите код из последнего письма.', eQulf: 'Слишком много неверных попыток — код аннулирован для безопасности. Нажмите «Отправить код ещё раз» и получите новый.',
      eXat: 'Не удалось отправить письмо. Проверьте email или повторите чуть позже.', eNet: 'Нет интернета или сервер не отвечает. Проверьте связь и повторите.', eSes: 'Сессия истекла. Войдите снова.', eSrv: 'Сервис временно недоступен. Повторите чуть позже.',
      dev: 'Тестовый режим (только для проверки): код на email не отправляется.', devPw: 'Пароль администратора', devGet: 'Получить код (тест)', devNo: 'Код не найден',
      cfT: 'И на этом устройстве есть данные', cfP: 'В вашем аккаунте есть сохранённая копия{d}. Какую оставить? Невыбранная будет перезаписана.', cfCloud: 'Взять из аккаунта', cfLocal: 'Оставить с этого устройства', cfDate: ' (последнее сохранение: {d})',
      stT: 'Строгий режим', stOffS: 'Код восстановления не хранится на сервере', stOnS: 'Включён — восстановление только по коду',
      stP: 'В строгом режиме код восстановления не хранится на сервере: на новом телефоне данные восстанавливаются ТОЛЬКО по этому коду. Если потерять код, никто, включая нас, не сможет восстановить данные.', stCode: 'Ваш код (сначала запишите):', stGo: 'Включить строгий режим',
      stOnP: 'Строгий режим включён: код не хранится на сервере, данные восстанавливаются только по коду. Хотите снова включить восстановление по email?', stBack: 'Включить восстановление по email', stNoCode: 'Для возврата на этом устройстве нужен код восстановления. Сначала восстановите данные по коду.',
      stLoginT: 'Строгий режим включён', stLoginP: 'Этот аккаунт в строгом режиме: данные восстанавливаются только по коду восстановления.', stLoginGo: 'Ввести код восстановления', stLoginNo: 'Не сейчас',
      onbLink: 'Вход по email (новый телефон)',
      eTypo: 'Возможна опечатка в email. Мы заменили «{a}» на «{b}» — если верно, нажмите «Отправить код».', eRestore: 'Не удалось восстановить данные из аккаунта. Проверьте интернет и войдите ещё раз.'
    }
  };
  function fill(s, p) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] != null ? p[k] : m; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var TYPO = { 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.comm': 'gmail.com', 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'mail.ry': 'mail.ru', 'mail.ruu': 'mail.ru', 'bk.ry': 'bk.ru', 'yandex.ry': 'yandex.ru', 'yandex.con': 'yandex.com', 'inbox.uzz': 'inbox.uz' };
  function typoFix(email) { var i = email.lastIndexOf('@'); if (i < 0) return null; var d = email.slice(i + 1).toLowerCase(), f = TYPO[d] || (/\.con$/.test(d) ? d.replace(/\.con$/, '.com') : null); return f && f !== d ? email.slice(0, i + 1) + f : null; }   // «gmail.con» kabi odatiy xatolar (dev rejimda xat ketmagani uchun xato sezilmay qolardi)
  var ICON = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  var ICON2 = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/></svg>';
  var CHEV = '<svg class="rz-i r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function create(cfg) {
    var ak = {}, bk = cfg.bk, app = cfg.app;
    var S = { yoq: false, kirgan: false, email: '', marketing: 0, qur: 0, dev: false, il: {}, t: 0 }, loading = false, syncing = false, lastTry = 0, step = 'in', cur = { email: '', next: 0, busy: false, err: '' }, timer = null, moreOpen = false, typoSeen = {};
    function L() { return D[(cfg.lang ? cfg.lang() : 'uz') === 'ru' ? 'ru' : 'uz']; }
    function til() { if (cfg.til) return cfg.til(); if (typeof document !== 'undefined') { var h = document.documentElement; if (h.lang === 'ru') return 'ru'; if (h.getAttribute('data-script') === 'cyr') return 'cyr'; } return 'uz'; }
    function changed() { if (cfg.onChange) cfg.onChange(); }
    function hasData() { return !!(cfg.hasData && cfg.hasData()); }
    function isTrivial() { try { return !!(cfg.isTrivial && cfg.isTrivial()); } catch (e) { return false; } }   // faqat onboarding profili: yo'qotadigan narsa yo'q → bulutdagi to'liq nusxa ustiga HECH QACHON yozilmaydi, aksincha u olinadi
    function sig() { return [S.yoq, S.kirgan, S.email, S.marketing, S.qur, JSON.stringify(S.il), S.google || '', S.ism || ''].join('|'); }
    function readCache() { try { var o = JSON.parse(localStorage.getItem(CACHE) || 'null'); return o && typeof o === 'object' ? o : null; } catch (e) { return null; } }
    function writeCache() { try { localStorage.setItem(CACHE, JSON.stringify(S)); } catch (e) {} }
    function setState(o) { var before = sig(); S = { yoq: !!o.yoq, kirgan: !!o.kirgan, email: o.email || '', marketing: o.marketing ? 1 : 0, qur: o.qur || 0, dev: !!o.dev, il: o.il || {}, google: o.google || '', ism: o.ism || '', t: Date.now() }; writeCache(); return before !== sig(); }
    var c0 = readCache(); if (c0) S = { yoq: !!c0.yoq, kirgan: !!c0.kirgan, email: c0.email || '', marketing: c0.marketing ? 1 : 0, qur: c0.qur || 0, dev: !!c0.dev, il: c0.il && typeof c0.il === 'object' ? c0.il : {}, google: typeof c0.google === 'string' ? c0.google : '', ism: typeof c0.ism === 'string' ? c0.ism : '', t: +c0.t || 0 };
    var norm = function (c) { return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); };

    function call(method, amal, body, qs) {
      return fetch(AKKAUNT_API + '/' + amal + (qs || ''), { method: method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j || {} }; }, function () { return { s: r.status, j: {} }; }); });
    }
    /* ---- holat: faqat kerak bo'lganda so'raladi ---- */
    /* ---- Google bilan kirish: server GOOGLE_WEB_CLIENT_ID bersagina (S.google). Veb — Google Identity Services (rasmiy tugma); APK — native «GoogleKirish» (Credential Manager) ---- */
    var G_SVG = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C.9 16.6 0 20.2 0 24s.9 7.4 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-10l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
    var W = typeof window !== 'undefined' ? window : {};
    function nat() { var N = W.KalkiNative; try { return N && N.isApp && N.isApp() ? N : null; } catch (e) { return null; } }
    function gOk() { if (!S.yoq || S.kirgan || !S.google) return false; var N = nat(); if (N) return !!(N.has && N.has('GoogleKirish')); return typeof document !== 'undefined'; }          // APK'da plagin bo'lmasa (eski APK) — yo'q
    var gis = 0, gq = [];
    function gisLoad(cb) { if (gis === 2) return cb(); gq.push(cb); if (gis === 1) return; gis = 1; var sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; sc.onload = function () { try { W.google.accounts.id.initialize({ client_id: S.google, callback: gCred, ux_mode: 'popup', auto_select: false, cancel_on_tap_outside: true }); gis = 2; } catch (e) { gis = 0; } var q = gq; gq = []; if (gis === 2) q.forEach(function (f) { f(); }); }; sc.onerror = function () { gis = 0; gq = []; }; document.head.appendChild(sc); }
    function gMount() { if (!gOk() || nat()) return; var els = document.querySelectorAll('[data-akkg]:not([data-m])'); if (!els.length) return; gisLoad(function () { [].forEach.call(document.querySelectorAll('[data-akkg]:not([data-m])'), function (el) { el.setAttribute('data-m', '1'); try { W.google.accounts.id.renderButton(el, { type: 'standard', theme: gDark() ? 'filled_black' : 'outline', size: 'large', text: 'signin_with', shape: 'pill', logo_alignment: 'left', width: Math.min(400, Math.max(220, el.clientWidth || 300)), locale: til() === 'ru' ? 'ru' : 'uz' }); } catch (e) {} }); }); }
    function gDark() { var h = document.documentElement.getAttribute('data-theme'); if (h) return h === 'dark'; try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } }
    function gBtn(where) { if (nat()) return '<button type="button" class="akk-gnat" data-act="akkgoogle" data-akkgw="' + where + '">' + G_SVG + '<span>' + esc(L().gIn) + '</span></button>'; setTimeout(gMount, 0); return '<div class="akk-gbtn" data-akkg="' + where + '" aria-label="' + esc(L().gIn) + '"></div>'; }
    function gCred(resp) {
      var t = L(), cr = resp && resp.credential; if (!cr) { toast(t.gErr); return; }
      call('POST', 'google', { credential: cr }).then(function (r) {
        if (r.s === 200 && r.j.ok) { setState({ yoq: true, kirgan: true, email: r.j.email, marketing: r.j.marketing, qur: 1, dev: S.dev, il: {}, google: S.google, ism: r.j.ism }); step = 'acc'; if (cfg.kit) cfg.kit.closeSheet(); toast(r.j.yangi ? t.okNew : t.gOk); changed(); sync(true); return; }
        setErr(t.gErr); toast(t.gErr);
      }, function () { toast(t.eNet); });
    }
    function gNative() { var N = nat(); if (!N) return; N.call('GoogleKirish', 'kirish', { clientId: S.google }).then(function (r) { if (r && r.idToken) gCred({ credential: r.idToken }); }, function (e) { if (!(e && /bekor|cancel/i.test(String(e.code || e.message)))) toast(L().gErr); }); }
    ak.google = function () { return gOk(); };
    ak.load = function (force, done) {
      if (loading) { if (done) setTimeout(done, 600); return; } if (!force && S.t && Date.now() - S.t < (S.yoq ? TTL_ON : TTL_OFF)) { if (done) done(); return; } loading = true;
      call('GET', 'sessiya').then(function (r) {
        loading = false; var ch;
        if (r.s === 200 && r.j && r.j.yoqilgan) ch = setState({ yoq: true, kirgan: !!r.j.kirgan, email: r.j.email, marketing: r.j.marketing, qur: r.j.qurilmalar, dev: !!r.j.dev, il: r.j.ilovalar, google: r.j.google, ism: r.j.ism });
        else ch = setState({ yoq: false });
        if (ch) { changed(); if (cfg.onOnb) cfg.onOnb(); } if (done) done();
      }, function () { loading = false; S.t = Date.now() - (S.yoq ? TTL_ON : TTL_OFF) + 60000; });   // tarmoq xatosi: 1 daqiqadan keyin qayta uriniladi (har renderda emas)
    };
    ak.enabled = function () { return !!S.yoq; };
    ak.loggedIn = function () { return !!(S.yoq && S.kirgan); };
    ak.state = function () { return JSON.parse(JSON.stringify(S)); };
    ak.autoSaved = function () { return !!(S.yoq && S.kirgan && S.il[app] && bk && bk.cloudOn()); };
    ak.rowHtml = function () {
      ak.load(); if (!S.yoq) return '';
      var t = L();
      return (gOk() ? '<div class="akk-gblock">' + gBtn('row') + '</div>' : '') + '<button type="button" class="rz-row" data-act="akk" data-akk="row"><span class="' + esc(cfg.rowIcon || 'rz-ci') + '">' + ICON + '</span><span class="m"><b>' + esc(S.kirgan ? t.rowOnT : t.rowT) + '</b><span>' + esc(S.kirgan ? fill(ak.autoSaved() ? t.rowOnSaved : t.rowOnS, { e: S.email }) : t.rowS) + '</span></span>' + CHEV + '</button>';
    };
    ak.more = function (inner) {                     // akkaunt yoqilgan bo'lsa: Telegram zaxira, bulut (kod), eksport/import «Boshqa usullar» ichida; o'chiq bo'lsa o'zgarishsiz
      if (!S.yoq) return inner;
      var t = cfg.lang && cfg.lang() === 'ru' ? 'Другие способы' : 'Boshqa usullar';
      return '<details class="akk-more" data-akkmore' + (moreOpen ? ' open' : '') + '><summary><span>' + esc(t) + '</span>' + CHEV + '</summary>' + inner + '</details>';
    };
    /* ---- Profil tepasida ism: faqat kirgan foydalanuvchida (mehmonda — umuman yo'q) ---- */
    function initial(n) { return Array.from(String(n || '').trim())[0] || ''; }
    ak.name = function () { ak.load(); return S.yoq && S.kirgan ? (S.ism || '') : ''; };          // ism (kirgan bo'lsa) — KalkiFit Profil hero kartasi
    ak.nameHtml = function () {
      ak.load(); if (!S.yoq || !S.kirgan) return '';
      var t = L();
      if (!S.ism) return '<div class="akk-nm" id="akkNm"><button type="button" class="akk-nmask" data-act="akkname">' + esc(t.nmAsk) + '</button></div>';
      return '<div class="akk-nm" id="akkNm"><span class="akk-av" aria-hidden="true" data-cyr="skip">' + esc(initial(S.ism).toUpperCase()) + '</span><span class="akk-nmt"><small>' + esc(t.nmHello) + '</small><b id="akkNmV" data-cyr="skip">' + esc(S.ism) + '</b></span><button type="button" class="akk-nmpen" data-act="akkname" aria-label="' + esc(t.nmEdit) + '"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z M13.500 6.500l4 4" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>';
    };
    function nameSheet() {
      var t = L(), k = cfg.kit; if (!k) return; step = 'name';
      k.openSheet('akk', '<div class="bk-sheet akk-sheet" data-step="name">' + k.shHead(t.nmT) + '<p class="rz-p sm">' + esc(t.nmP) + '</p><label class="rz-f" for="akkName"><span>' + esc(t.nmLbl) + '</span><input id="akkName" type="text" maxlength="40" autocomplete="name" autocapitalize="words" enterkeyhint="done" placeholder="' + esc(t.nmPh) + '" value="' + esc(S.ism) + '" data-cyr="skip"></label>' + errHtml() + '<div class="rz-actions"><button type="button" class="rz-btn primary" id="akkNameGo" data-act="akknamego">' + esc(t.nmSave) + '</button></div></div>', { noFocus: false });
      var i = document.getElementById('akkName'); if (i) { try { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} }
    }
    function nameSave() {
      var t = L(), i = document.getElementById('akkName'), v = Array.from(String((i && i.value) || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()).slice(0, 40).join('').trim();
      if (!v) { setErr(t.nmEmpty); return; } if (cur.busy) return; setErr(''); busy(true, 'akkNameGo');
      call('POST', 'ism', { ism: v }).then(function (r) {
        busy(false, 'akkNameGo', t.nmSave);
        if (r.s === 200 && r.j.ok) { S.ism = r.j.ism; writeCache(); step = 'acc'; if (cfg.kit) cfg.kit.closeSheet(); toast(t.nmSaved); changed(); return; }
        if (r.s === 401) { sessionLost(); return; } setErr(r.j.e === 'ism' ? t.nmEmpty : errText(r.j.e, r.j));
      }, function () { busy(false, 'akkNameGo', t.nmSave); setErr(t.eNet); });
    }
    ak.strictRow = function () {
      if (!S.yoq || !S.kirgan || !S.il[app]) return ''; var t = L(), on = S.il[app] === 'qatiy';
      return '<button type="button" class="rz-row" data-act="akkstrict" data-akk="strict"><span class="' + esc(cfg.rowIcon || 'rz-ci') + '">' + ICON2 + '</span><span class="m"><b>' + esc(t.stT) + '</b><span>' + esc(on ? t.stOnS : t.stOffS) + '</span></span>' + CHEV + '</button>';
    };
    ak.restoreLink = function () {                   // onboarding: yangi telefonda email bilan kirish
      ak.load(); if (!S.yoq || S.kirgan) return '';
      return '<button type="button" class="rz-link bk-rclink" data-act="akk" data-akk="onb">' + esc(L().onbLink) + '</button>';
    };

    /* ---- panel ---- */
    function errText(e, j) {
      var t = L(); if (e === 'net') return t.eNet;
      var m = { email: t.eEmail, kut: fill(t.eKut, { n: (j && j.kut) || 60 }), limit: fill(t.eLimit, { n: Math.max(1, Math.ceil(((j && j.kut) || 60) / 60)) }), kod_xato: t.eXato, kod_yoq: t.eYoq, kod_qulf: t.eQulf, xat: t.eXat, sessiya: t.eSes, kalit: t.eSrv };
      return m[e] || t.eSrv;
    }
    function errHtml() { return '<p class="rz-p sm akk-err" id="akkErr" role="alert"' + (cur.err ? '' : ' hidden') + '>' + esc(cur.err) + '</p>'; }
    function setErr(msg) { cur.err = msg || ''; var el = document.getElementById('akkErr'); if (el) { el.textContent = cur.err; el.hidden = !cur.err; } }
    function privLine() { var t = L(), c = til() === 'cyr' ? '?lang=cyr' : ''; return '<p class="rz-p sm akk-priv">' + esc(t.priv) + ' <a href="' + (til() === 'ru' ? '/ru/maxfiylik' : '/maxfiylik') + c + '" target="_blank" rel="noopener">' + esc(t.privLink) + '</a></p>'; }
    function devBox() {                              // FAQAT preview (server dev:true desa) va FAQAT kod kiritish bosqichida
      if (!S.dev) return ''; var t = L();
      return '<div class="akk-dev"><p class="rz-p sm">' + esc(t.dev) + '</p><div class="akk-devr"><input id="akkDevPw" type="password" autocomplete="off" placeholder="' + esc(t.devPw) + '" aria-label="' + esc(t.devPw) + '"><button type="button" class="rz-btn sm" data-act="akkdev">' + esc(t.devGet) + '</button></div></div>';
    }
    function sheet() {
      var t = L(), k = cfg.kit, h;
      if (!k) return;
      if (S.kirgan && step !== 'del' && step !== 'delcode') step = 'acc';
      if (step === 'in') {
        h = k.shHead(t.inT) + (gOk() ? '<div class="akk-gblock">' + gBtn('sheet') + '</div><p class="akk-or"><span>' + esc(t.gOr) + '</span></p>' : '') + '<p class="rz-p">' + esc(t.inP) + '</p><label class="rz-f" for="akkEmail"><span>' + esc(t.email) + '</span><input id="akkEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="254" placeholder="' + esc(t.emailPh) + '" value="' + esc(cur.email) + '"></label>' + errHtml() +
          '<div class="rz-actions"><button type="button" class="rz-btn primary" id="akkSend" data-act="akksend">' + esc(cur.busy ? t.sending : t.send) + '</button></div><p class="rz-p sm">' + esc(t.inP2) + '</p>' + privLine();
      } else if (step === 'code' || step === 'delcode') {
        var del = step === 'delcode';
        h = k.shHead(del ? t.delT : t.cdT) + '<p class="rz-p">' + esc(fill(del ? t.delCd : t.cdP, { e: cur.email })) + '</p><label class="rz-f" for="akkCode"><span>' + esc(t.cdLbl) + '</span><input id="akkCode" class="akk-code" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" maxlength="7" placeholder="' + esc(t.cdPh) + '"></label>' + errHtml() +
          '<div class="rz-actions"><button type="button" class="rz-btn primary' + (del ? ' danger' : '') + '" id="akkGo" data-act="' + (del ? 'akkdelgo' : 'akkgo') + '">' + esc(cur.busy ? t.going : (del ? t.delGo : t.go)) + '</button></div>' +
          '<div class="akk-links"><button type="button" class="rz-link" id="akkResend" data-act="akkresend">' + esc(t.resend) + '</button>' + (del ? '' : '<button type="button" class="rz-link" data-act="akkback">' + esc(t.other) + '</button>') + '</div><p class="rz-p sm">' + esc(t.spam) + '</p>' + devBox();
      } else if (step === 'del') {
        h = k.shHead(t.delT) + '<p class="rz-p">' + esc(t.delP) + '</p>' + errHtml() + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="akkacc">' + esc(t.back) + '</button><button type="button" class="rz-btn primary danger" id="akkDelSend" data-act="akkdelsend">' + esc(cur.busy ? t.sending : t.delSend) + '</button></div>';
      } else {
        var st = S.il[app] === 'qatiy' ? t.accStrict : (ak.autoSaved() ? t.accSaved : t.accWait);
        h = k.shHead(t.accT) + '<p class="rz-p akk-me"><b>' + esc(fill(t.accOn, { e: S.email })) + '</b></p><p class="rz-p akk-st">' + esc(st) + '</p><p class="rz-p sm">' + esc(fill(t.accDev, { n: S.qur || 1 })) + '</p>' +
          '<label class="akk-mk"><input type="checkbox" id="akkMk" data-act="akkmk"' + (S.marketing ? ' checked' : '') + '><span><b>' + esc(t.mk) + '</b><span>' + esc(t.mkS) + '</span></span></label>' + errHtml() +
          '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="akkout">' + esc(t.out) + '</button></div>' +
          '<div class="akk-links"><button type="button" class="rz-link" data-act="akkoutall">' + esc(t.outAll) + '</button><button type="button" class="rz-link" data-act="akkdl">' + esc(t.dl) + '</button><button type="button" class="rz-link akk-del" data-act="akkdel">' + esc(t.del) + '</button></div>' + privLine();
      }
      k.openSheet('akk', '<div class="bk-sheet akk-sheet" data-step="' + step + '">' + h + '</div>', { noFocus: false });
      tick();
    }
    function tick() {
      clearInterval(timer); var b = document.getElementById('akkResend'); if (!b) return;
      function upd() { var left = Math.ceil((cur.next - Date.now()) / 1000), el = document.getElementById('akkResend'); if (!el || !cfg.kit || cfg.kit.sheetKind() !== 'akk') { clearInterval(timer); return; } if (left > 0) { el.disabled = true; el.textContent = fill(L().resendIn, { n: left }); } else { el.disabled = false; el.textContent = L().resend; clearInterval(timer); } }
      upd(); timer = setInterval(upd, 500);
    }
    function busy(on, id, txt) { cur.busy = on; var b = document.getElementById(id); if (b) { b.disabled = on; if (txt) b.textContent = txt; } }
    function toast(msg) { if (cfg.kit) cfg.kit.toast(msg, null, true); }

    function sendCode(maqsad) {
      var t = L(), email = maqsad === 'ochirish' ? S.email : ((document.getElementById('akkEmail') || {}).value || cur.email || '').trim();
      cur.email = email; if (cur.busy) return; setErr('');
      if (maqsad !== 'ochirish' && !email) { setErr(t.eEmpty); return; }
      if (maqsad !== 'ochirish' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(t.eEmail); return; }
      if (maqsad !== 'ochirish') { var fx = typoFix(email); if (fx && !typoSeen[email]) { typoSeen[email] = true; typoSeen[fx] = true; var ie = document.getElementById('akkEmail'); if (ie) ie.value = fx; cur.email = fx; setErr(fill(t.eTypo, { a: email, b: fx })); return; } }
      var bid = maqsad === 'ochirish' ? 'akkDelSend' : 'akkSend', btxt = maqsad === 'ochirish' ? t.delSend : t.send;
      busy(true, bid, t.sending);
      call('POST', 'kod', { email: email, til: til(), maqsad: maqsad }).then(function (r) {
        busy(false); if (r.s === 200 && r.j.ok) { cur.next = Date.now() + (r.j.kut || 60) * 1000; step = maqsad === 'ochirish' ? 'delcode' : 'code'; if (r.j.dev !== undefined) S.dev = !!r.j.dev; sheet(); return; }
        if (r.s === 429 && r.j.e === 'kut' && (step === 'code' || step === 'delcode')) { setErr(errText('kut', r.j)); return; }
        if (r.s === 401) { sessionLost(); }
        busy(false, bid, btxt); setErr(errText(r.j.e, r.j));
      }, function () { busy(false, bid, btxt); setErr(t.eNet); });
    }
    function readCode() { return ((document.getElementById('akkCode') || {}).value || '').replace(/\D/g, ''); }
    function verify() {
      var t = L(), code = readCode(); if (cur.busy) return; setErr('');
      if (code.length !== 6) { setErr(code.length ? t.eXato : t.eCodeEmpty); return; }
      busy(true, 'akkGo', t.going);
      call('POST', 'kirish', { email: cur.email, kod: code }).then(function (r) {
        busy(false); if (r.s === 200 && r.j.ok) {
          setState({ yoq: true, kirgan: true, email: r.j.email, marketing: r.j.marketing, qur: 1, dev: S.dev, il: {}, google: S.google, ism: r.j.ism }); step = 'acc'; if (cfg.kit) cfg.kit.closeSheet(); toast(r.j.yangi ? t.okNew : t.okIn); changed();
          sync(true); return;
        }
        busy(false, 'akkGo', t.go); setErr(errText(r.j.e, r.j)); var i = document.getElementById('akkCode'); if (i && r.j.e === 'kod_xato') { i.value = ''; try { i.focus(); } catch (e) {} }
      }, function () { busy(false, 'akkGo', t.go); setErr(t.eNet); });
    }
    function sessionLost() { setState({ yoq: true, il: {} }); step = 'in'; changed(); }
    function deleteGo() {
      var t = L(), code = readCode(); if (cur.busy) return; setErr('');
      if (code.length !== 6) { setErr(code.length ? t.eXato : t.eCodeEmpty); return; }
      busy(true, 'akkGo', t.going);
      call('POST', 'ochirish', { kod: code }).then(function (r) {
        busy(false); if (r.s === 200 && r.j.ok) { setState({ yoq: true, il: {} }); step = 'in'; cur = { email: '', next: 0, busy: false, err: '' }; if (cfg.kit) { cfg.kit.closeSheet(); } toast(t.okDel); changed(); return; }
        busy(false, 'akkGo', t.delGo); if (r.s === 401) { sessionLost(); } setErr(errText(r.j.e, r.j));
      }, function () { busy(false, 'akkGo', t.delGo); setErr(t.eNet); });
    }
    function signOut(all) {
      call('POST', 'chiqish', all ? { hammasi: true } : {}).then(function () { setState({ yoq: true, il: {} }); step = 'in'; if (cfg.kit) cfg.kit.closeSheet(); toast(L().okOut); changed(); }, function () { setErr(L().eNet); });
    }
    function download() {
      call('POST', 'yuklab', {}).then(function (r) {
        if (r.s !== 200) { setErr(errText(r.j.e || 'net', r.j)); return; }
        try { var a = document.createElement('a'), u = URL.createObjectURL(new Blob([JSON.stringify(r.j, null, 2)], { type: 'application/json' })); a.href = u; a.download = 'kalki-akkaunt-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1500); } catch (e) {}
      }, function () { setErr(L().eNet); });
    }
    function setMarketing(on) {
      call('POST', 'marketing', { rozi: !!on }).then(function (r) { if (r.s === 200) { S.marketing = on ? 1 : 0; writeCache(); toast(L().okMk); } else { var c = document.getElementById('akkMk'); if (c) c.checked = !on; setErr(errText(r.j.e || 'net', r.j)); } }, function () { var c = document.getElementById('akkMk'); if (c) c.checked = !on; setErr(L().eNet); });
    }
    function devGet() {
      var pw = (document.getElementById('akkDevPw') || {}).value || '', em = cur.email || '';
      fetch(AKKAUNT_API + '/dev-kod?email=' + encodeURIComponent(em), { headers: { 'X-Admin-Password': pw }, cache: 'no-store' }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); }).then(function (r) {
        if (r.s === 200 && r.j.kod) { var i = document.getElementById('akkCode'); if (i) { i.value = r.j.kod; } else setErr('Kod: ' + r.j.kod); } else setErr(L().devNo);
      }, function () { setErr(L().eNet); });
    }

    /* ================= GIBRID: avtomatik saqlash va yangi qurilmada tiklash ================= */
    function markLinked(rejim) { S.il = S.il || {}; S.il[app] = rejim; writeCache(); }
    function linkLocal() {                           // akkaunt hali ulanmagan: shu qurilmadagi zaxira (yoki yangi kod bilan yoqilgan bulut) ulanadi — qayta yuklanmaydi
      var code = bk.cloudCode(); if (!code) { if (!hasData()) return Promise.resolve(); code = bk.enableNew(); toast(L().okSaved); }
      return call('POST', 'ulash', { ilova: app, rejim: 'konvert', kod: code }).then(function (r) { if (r.s === 200) markLinked('konvert'); else if (r.s === 401) sessionLost(); });
    }
    function fmtDate(ts) { var d = new Date(ts), p = function (n) { return n < 10 ? '0' + n : '' + n; }; return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear(); }
    function conflictSheet(code, peek) {
      var t = L(); if (!cfg.kit) return;
      var d = peek && peek.yangilangan ? fill(t.cfDate, { d: fmtDate(peek.yangilangan) }) : '';
      cfg.kit.openSheet('akkc', '<div class="bk-sheet">' + cfg.kit.shHead(t.cfT) + '<p class="rz-p">' + esc(fill(t.cfP, { d: d })) + '</p><div class="rz-actions akk-cf"><button type="button" class="rz-btn primary" data-act="akkcfcloud">' + esc(t.cfCloud) + '</button><button type="button" class="rz-btn ghost" data-act="akkcflocal">' + esc(t.cfLocal) + '</button></div></div>');
      conflictSheet.code = code; conflictSheet.ver = peek && peek.versiya;
    }
    function restoreFrom(code, loud) {
      return bk.restoreCode(code).then(function (r) {
        if (r.ok) { markLinked('konvert'); if (cfg.kit) cfg.kit.closeSheet(); toast(L().okRestored); changed(); return true; }
        if (r.err === 'eNone' && hasData()) { bk.adoptCode(code, 0); markLinked('konvert'); toast(L().okSaved); changed(); return true; }   // akkauntda hali nusxa yo'q → shu qurilmadagi yoziladi
        // eNone va ma'lumot yo'q: ulangan deb BELGILANMAYDI — ma'lumot paydo bo'lganda check() qayta ulab, adoptCode qiladi
        if (r.err !== 'eNone' && loud && cfg.kit) cfg.kit.toast(r.err === 'eNet' ? L().eNet : r.err === 'eLimit' ? errText('limit', { kut: 600 }) : L().eRestore);   // xato jimgina yutilmaydi
        return false;
      });
    }
    function reconcile(code, loud) {
      var mine = bk.cloudCode();
      if (mine && norm(mine) === norm(code)) { markLinked('konvert'); return Promise.resolve(); }                // allaqachon shu kod
      if (!hasData() || isTrivial()) return restoreFrom(code, loud);                                              // yangi qurilma (yoki faqat onboarding profili bor): avtomatik tiklash — bulutdagi nusxa yo'qolmaydi
      return bk.peekCode(code).then(function (p) {
        if (p.s === 404) { bk.adoptCode(code, 0); markLinked('konvert'); toast(L().okSaved); changed(); return; }  // akkauntda nusxa yo'q → shu qurilma yozadi
        if (p.s === 200) { conflictSheet(code, p); return; }                                                     // ikkala tomonda ma'lumot → foydalanuvchi tanlaydi
      });
    }
    function strictOnLogin() {
      markLinked('qatiy'); if (hasData() || bk.cloudOn() || !cfg.kit) return Promise.resolve();
      var t = L(); cfg.kit.openSheet('akks', '<div class="bk-sheet">' + cfg.kit.shHead(t.stLoginT) + '<p class="rz-p">' + esc(t.stLoginP) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(t.stLoginNo) + '</button><button type="button" class="rz-btn primary" data-act="akkstrictcode">' + esc(t.stLoginGo) + '</button></div></div>');
      return Promise.resolve();
    }
    function sync(afterLogin) {
      if (!S.kirgan || syncing || !bk) return Promise.resolve(); syncing = true;
      return call('GET', 'tiklash', null, '?ilova=' + app).then(function (r) {
        if (r.s === 401) { sessionLost(); return; } if (r.s !== 200) { if (afterLogin && cfg.kit) cfg.kit.toast(L().eSrv); return; }
        if (r.j.yoq) return linkLocal();
        if (r.j.rejim === 'qatiy') return strictOnLogin();
        if (r.j.rejim === 'konvert' && r.j.kod) return reconcile(r.j.kod, afterLogin);
      }).then(function () { syncing = false; changed(); }, function () { syncing = false; if (afterLogin && cfg.kit) cfg.kit.toast(L().eNet); });
    }
    ak.check = function () {                         // render paytida: kirgan, lekin bu ilova ulanmagan va ma'lumot bor → ulash (tarmoq faqat shu holatda)
      if (S.yoq && S.kirgan && hasData() && !syncing && (!S.il[app] || (S.il[app] === 'konvert' && !bk.cloudOn() && isTrivial())) && Date.now() - lastTry > 60000) { lastTry = Date.now(); sync(false); }
    };
    function strictSheet() {
      var t = L(), k = cfg.kit; if (!k) return; var on = S.il[app] === 'qatiy', code = bk.cloudCode();
      if (!on) k.openSheet('akks', '<div class="bk-sheet">' + k.shHead(t.stT) + '<p class="rz-p warn">' + esc(t.stP) + '</p>' + (code ? '<p class="rz-p sm">' + esc(t.stCode) + '</p><div class="bk-code" role="textbox" aria-readonly="true">' + esc(code) + '</div>' : '') + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(t.back) + '</button><button type="button" class="rz-btn primary danger" data-act="akkstrictgo">' + esc(t.stGo) + '</button></div></div>');
      else k.openSheet('akks', '<div class="bk-sheet">' + k.shHead(t.stT) + '<p class="rz-p">' + esc(t.stOnP) + '</p>' + (code ? '' : '<p class="rz-p warn">' + esc(t.stNoCode) + '</p>') + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(t.back) + '</button>' + (code ? '<button type="button" class="rz-btn primary" data-act="akkstrictback">' + esc(t.stBack) + '</button>' : '') + '</div></div>');
    }
    function setRejim(rejim) {
      var body = { ilova: app, rejim: rejim }; if (rejim === 'konvert') { body.kod = bk.cloudCode(); body.almashtir = true; }
      call('POST', 'ulash', body).then(function (r) { if (r.s === 200) { markLinked(rejim); if (cfg.kit) cfg.kit.closeSheet(); toast(rejim === 'qatiy' ? L().okStrict : L().okKonv); changed(); } else if (r.s === 401) { sessionLost(); } else if (cfg.kit) cfg.kit.toast(errText(r.j.e || 'net', r.j)); }, function () { if (cfg.kit) cfg.kit.toast(L().eNet); });
    }

    ak.act = function (a, el) {
      if (a === 'akk') { step = S.kirgan ? 'acc' : 'in'; cur.err = ''; if (el && el.getAttribute('data-akk') === 'onb') step = 'in'; sheet(); return true; }
      if (a === 'akkgoogle') { gNative(); return true; }
      if (a === 'akkname') { nameSheet(); return true; }
      if (a === 'akknamego') { nameSave(); return true; }
      if (a === 'akksend') { sendCode('kirish'); return true; }
      if (a === 'akkgo') { verify(); return true; }
      if (a === 'akkresend') { sendCode(step === 'delcode' ? 'ochirish' : 'kirish'); return true; }
      if (a === 'akkback') { step = 'in'; cur.err = ''; sheet(); return true; }
      if (a === 'akkout') { signOut(false); return true; }
      if (a === 'akkoutall') { signOut(true); return true; }
      if (a === 'akkdl') { download(); return true; }
      if (a === 'akkdel') { step = 'del'; cur.err = ''; sheet(); return true; }
      if (a === 'akkacc') { step = 'acc'; cur.err = ''; sheet(); return true; }
      if (a === 'akkdelsend') { sendCode('ochirish'); return true; }
      if (a === 'akkdelgo') { deleteGo(); return true; }
      if (a === 'akkmk') { setMarketing(!!(el && el.checked)); return 'keep'; }
      if (a === 'akkdev') { devGet(); return true; }
      if (a === 'akkcfcloud') { restoreFrom(conflictSheet.code); return true; }
      if (a === 'akkcflocal') { bk.adoptCode(conflictSheet.code, conflictSheet.ver || 0); markLinked('konvert'); if (cfg.kit) cfg.kit.closeSheet(); toast(L().okSaved); changed(); return true; }
      if (a === 'akkstrict') { strictSheet(); return true; }
      if (a === 'akkstrictgo') { setRejim('qatiy'); return true; }
      if (a === 'akkstrictback') { setRejim('konvert'); return true; }
      if (a === 'akkstrictcode') { if (cfg.kit) cfg.kit.closeSheet(); setTimeout(function () { bk.act('bkcodeopen'); }, 280); return true; }
      return false;
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('click', function (e) {
        var sm = e.target.closest && e.target.closest('[data-akkmore] > summary'); if (sm) { moreOpen = !sm.parentNode.open; return; }
        var b = e.target.closest && e.target.closest('[data-act^=akk]'); if (!b) return; var r = ak.act(b.getAttribute('data-act'), b); if (r === true) e.preventDefault();
      });
      document.addEventListener('input', function (e) { var i = e.target; if (i && i.id === 'akkCode') { var d = i.value.replace(/\D/g, '').slice(0, 6); if (i.value !== d) i.value = d; if (d.length === 6 && !cur.busy) { if (step === 'code') verify(); } } });
      document.addEventListener('keydown', function (e) { if (e.key !== 'Enter' || !e.target || !e.target.id) return; if (e.target.id === 'akkEmail') { e.preventDefault(); sendCode('kirish'); } else if (e.target.id === 'akkCode') { e.preventDefault(); if (step === 'delcode') deleteGo(); else verify(); } });
    }
    create.instances[cfg.app] = ak;
    return ak;
  }
  create.instances = {};
  return { create: create, D: D, AKKAUNT_API: AKKAUNT_API };
});
