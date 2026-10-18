/* kalki.uz — IXTIYORIY akkaunt (app-kit qismi): Ro'zg'or va KalkiFit ikkalasi shuni ishlatadi. Email + bir martalik kod (parolsiz). Server: /api/akkaunt/* (functions/api/akkaunt/[amal].js).
 *  Kirish MAJBURIY EMAS: ilova akkauntsiz avvalgidek ishlaydi; tiklash kodi (KF-/RZ-) va Telegram zaxirasi o'z holicha qoladi.
 *  Server "yoqilgan:false" desa (Resend kaliti yo'q / migratsiya yurgizilmagan production) — hech narsa ko'rsatilmaydi.
 *  Ishlatish: var akk = KalkiAkkaunt.create({ app, kit, lang, til, onChange, rowIcon }); akk.rowHtml()  (Profil/Sozlamalar kartasiga qator). */
(function (root, factory) {
  var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiAkkaunt = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  /* ===== BITTA SOZLAMA: akkaunt API manzili. Boshqa server/domenga o'tilsa FAQAT shu qator o'zgaradi (docs/akkaunt-kochirish.md). ===== */
  var AKKAUNT_API = '/api/akkaunt';
  var CACHE = 'kalki_akk', TTL_ON = 5 * 60000, TTL_OFF = 60 * 60000;     // holat keshi: yoqilgan bo'lsa 5 daqiqa, o'chiq bo'lsa 1 soat (Functions so'rovlarini tejash)

  var D = {
    uz: {
      rowT: 'Kirish (ixtiyoriy)', rowS: 'Email bilan akkaunt oching — parol kerak emas', rowOnT: 'Akkaunt', rowOnS: '{e}',
      inT: 'Kirish (ixtiyoriy)', inP: "Akkaunt — bu emailingiz bilan ochiladigan shaxsiy kirish. Parol kerak emas: emailingizga 6 xonali kod yuboramiz.", inP2: "Kirmasangiz ham ilova avvalgidek ishlayveradi. Hozircha akkaunt faqat kirish uchun; keyingi yangilanishda telefon almashganda ma'lumotni shu orqali tiklash qo'shiladi.",
      email: 'Email', emailPh: 'ism@pochta.uz', send: 'Kod yuborish', sending: 'Yuborilmoqda…', priv: "Email faqat kirish uchun saqlanadi.", privLink: 'Maxfiylik',
      cdT: 'Kodni kiriting', cdP: '{e} manziliga 6 xonali kod yubordik. Kod 10 daqiqa amal qiladi.', cdPh: '000000', cdLbl: 'Emaildagi kod', go: 'Kirish', going: 'Tekshirilmoqda…', other: 'Boshqa email', resend: 'Kodni qayta yuborish', resendIn: 'Qayta yuborish: {n} s', spam: "Kod kelmadimi? «Spam» papkasini ham tekshiring.",
      okIn: 'Kirdingiz ✓', okNew: 'Akkaunt ochildi ✓', okOut: 'Chiqdingiz', okDel: "Akkaunt o'chirildi", okMk: 'Saqlandi',
      accT: 'Akkaunt', accOn: 'Kirgansiz: {e}', accDev: 'Kirgan qurilmalar: {n}', mk: 'Yangilik va maslahatlarni emailga yuborishga roziman', mkS: "Ixtiyoriy. Istalgan payt o'chirib qo'yasiz. Emailingiz boshqalarga berilmaydi.",
      out: 'Chiqish', outAll: 'Hamma qurilmadan chiqish', dl: "Ma'lumotimni yuklab olish", del: "Akkauntni o'chirish",
      delT: "Akkauntni o'chirish", delP: "Email va akkaunt ma'lumotlaringiz serverdan butunlay o'chadi. Telefondagi ilova ma'lumoti, bulutdagi zaxira va tiklash kodi saqlanib qoladi.", delSend: 'Tasdiqlash kodini yuborish', delGo: "Butunlay o'chirish", delCd: '{e} manziliga tasdiqlash kodi yubordik.',
      eEmail: "Email noto'g'ri yozilgan.", eKut: "Kod yaqinda yuborilgan. {n} soniyadan keyin urinib ko'ring.", eLimit: "Juda ko'p urinish. Keyinroq urinib ko'ring.", eXato: "Kod noto'g'ri. Emaildagi 6 xonali kodni qayta kiriting.", eYoq: "Kod eskirgan yoki yuborilmagan. Yangi kod so'ring.", eQulf: "Juda ko'p noto'g'ri urinish. Yangi kod so'rang.", eXat: "Xatni yuborib bo'lmadi. Keyinroq urinib ko'ring.", eNet: "Internet yo'q yoki server javob bermadi.", eSes: 'Sessiya tugagan. Qayta kiring.',
      dev: "Test rejimi (faqat sinov uchun): kod emailga yuborilmaydi.", devPw: 'Administrator paroli', devGet: 'Kodni olish (test)', devNo: 'Kod topilmadi'
    },
    ru: {
      rowT: 'Вход (по желанию)', rowS: 'Создайте аккаунт по email — пароль не нужен', rowOnT: 'Аккаунт', rowOnS: '{e}',
      inT: 'Вход (по желанию)', inP: 'Аккаунт — это личный вход по вашему email. Пароль не нужен: мы отправим на email 6-значный код.', inP2: 'Если не входить, приложение работает как раньше. Пока аккаунт нужен только для входа; в следующем обновлении добавим восстановление данных на новом телефоне.',
      email: 'Email', emailPh: 'imya@pochta.uz', send: 'Отправить код', sending: 'Отправляем…', priv: 'Email хранится только для входа.', privLink: 'Конфиденциальность',
      cdT: 'Введите код', cdP: 'Мы отправили 6-значный код на {e}. Код действует 10 минут.', cdPh: '000000', cdLbl: 'Код из письма', go: 'Войти', going: 'Проверяем…', other: 'Другой email', resend: 'Отправить код ещё раз', resendIn: 'Повторно через {n} с', spam: 'Код не пришёл? Проверьте папку «Спам».',
      okIn: 'Вы вошли ✓', okNew: 'Аккаунт создан ✓', okOut: 'Вы вышли', okDel: 'Аккаунт удалён', okMk: 'Сохранено',
      accT: 'Аккаунт', accOn: 'Вы вошли: {e}', accDev: 'Устройств с входом: {n}', mk: 'Согласен получать новости и советы на email', mkS: 'Необязательно. Можно отключить в любой момент. Email не передаётся третьим лицам.',
      out: 'Выйти', outAll: 'Выйти на всех устройствах', dl: 'Скачать мои данные', del: 'Удалить аккаунт',
      delT: 'Удалить аккаунт', delP: 'Email и данные аккаунта будут полностью удалены с сервера. Данные приложения на телефоне, облачная копия и код восстановления сохранятся.', delSend: 'Отправить код подтверждения', delGo: 'Удалить навсегда', delCd: 'Мы отправили код подтверждения на {e}.',
      eEmail: 'Email записан неверно.', eKut: 'Код уже отправлен. Повторите через {n} с.', eLimit: 'Слишком много попыток. Попробуйте позже.', eXato: 'Код неверный. Введите 6-значный код из письма ещё раз.', eYoq: 'Код устарел или не был отправлен. Запросите новый.', eQulf: 'Слишком много неверных попыток. Запросите новый код.', eXat: 'Не удалось отправить письмо. Попробуйте позже.', eNet: 'Нет интернета или сервер не отвечает.', eSes: 'Сессия истекла. Войдите снова.',
      dev: 'Тестовый режим (только для проверки): код на email не отправляется.', devPw: 'Пароль администратора', devGet: 'Получить код (тест)', devNo: 'Код не найден'
    }
  };
  function fill(s, p) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] != null ? p[k] : m; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var ICON = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
  var CHEV = '<svg class="rz-i r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function create(cfg) {
    var ak = {}, NAV = typeof navigator !== 'undefined' ? navigator : {};
    var S = { yoq: false, kirgan: false, email: '', marketing: 0, qur: 0, dev: false, t: 0 }, loading = false, step = 'in', cur = { email: '', next: 0, busy: false, err: '', n: 0 }, timer = null;
    function L() { return D[(cfg.lang ? cfg.lang() : 'uz') === 'ru' ? 'ru' : 'uz']; }
    function til() { if (cfg.til) return cfg.til(); if (typeof document !== 'undefined') { var h = document.documentElement; if (h.lang === 'ru') return 'ru'; if (h.getAttribute('data-script') === 'cyr') return 'cyr'; } return 'uz'; }
    function changed() { if (cfg.onChange) cfg.onChange(); }
    function readCache() { try { var o = JSON.parse(localStorage.getItem(CACHE) || 'null'); return o && typeof o === 'object' ? o : null; } catch (e) { return null; } }
    function writeCache() { try { localStorage.setItem(CACHE, JSON.stringify(S)); } catch (e) {} }
    function setState(o) { var before = [S.yoq, S.kirgan, S.email, S.marketing, S.qur].join('|'); S = { yoq: !!o.yoq, kirgan: !!o.kirgan, email: o.email || '', marketing: o.marketing ? 1 : 0, qur: o.qur || 0, dev: !!o.dev, t: Date.now() }; writeCache(); return before !== [S.yoq, S.kirgan, S.email, S.marketing, S.qur].join('|'); }
    var c0 = readCache(); if (c0) S = { yoq: !!c0.yoq, kirgan: !!c0.kirgan, email: c0.email || '', marketing: c0.marketing ? 1 : 0, qur: c0.qur || 0, dev: !!c0.dev, t: +c0.t || 0 };

    function call(method, amal, body, qs) {
      return fetch(AKKAUNT_API + '/' + amal + (qs || ''), { method: method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', credentials: 'same-origin' })
        .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j || {} }; }, function () { return { s: r.status, j: {} }; }); });
    }
    /* ---- holat: faqat Profil ochilganda va keshdan eskirgan bo'lsa so'raladi ---- */
    ak.load = function (force) {
      if (loading) return; if (!force && S.t && Date.now() - S.t < (S.yoq ? TTL_ON : TTL_OFF)) return; loading = true;
      call('GET', 'sessiya').then(function (r) {
        loading = false; var ch;
        if (r.s === 200 && r.j && r.j.yoqilgan) ch = setState({ yoq: true, kirgan: !!r.j.kirgan, email: r.j.email, marketing: r.j.marketing, qur: r.j.qurilmalar, dev: !!r.j.dev });
        else ch = setState({ yoq: false });
        if (ch) changed();
      }, function () { loading = false; S.t = Date.now() - (S.yoq ? TTL_ON : TTL_OFF) + 60000; });   // tarmoq xatosi: 1 daqiqadan keyin qayta uriniladi (har renderda emas)
    };
    ak.enabled = function () { return !!S.yoq; };
    ak.state = function () { return JSON.parse(JSON.stringify(S)); };
    ak.rowHtml = function () {
      ak.load(); if (!S.yoq) return '';
      var t = L();
      return '<button type="button" class="rz-row" data-act="akk" data-akk="row"><span class="' + esc(cfg.rowIcon || 'rz-ci') + '">' + ICON + '</span><span class="m"><b>' + esc(S.kirgan ? t.rowOnT : t.rowT) + '</b><span>' + esc(S.kirgan ? fill(t.rowOnS, { e: S.email }) : t.rowS) + '</span></span>' + CHEV + '</button>';
    };

    /* ---- panel ---- */
    function errText(e, j) {
      var t = L(); if (e === 'net') return t.eNet;
      var m = { email: t.eEmail, kut: fill(t.eKut, { n: (j && j.kut) || 60 }), limit: t.eLimit, kod_xato: t.eXato, kod_yoq: t.eYoq, kod_qulf: t.eQulf, xat: t.eXat, sessiya: t.eSes };
      return m[e] || t.eNet;
    }
    function errHtml() { return '<p class="rz-p sm akk-err" id="akkErr" role="alert"' + (cur.err ? '' : ' hidden') + '>' + esc(cur.err) + '</p>'; }
    function setErr(msg) { cur.err = msg || ''; var el = document.getElementById('akkErr'); if (el) { el.textContent = cur.err; el.hidden = !cur.err; } }
    function privLine() { var t = L(), c = til() === 'cyr' ? '?lang=cyr' : ''; return '<p class="rz-p sm akk-priv">' + esc(t.priv) + ' <a href="' + (til() === 'ru' ? '/ru/maxfiylik' : '/maxfiylik') + c + '" target="_blank" rel="noopener">' + esc(t.privLink) + '</a></p>'; }
    function devBox() {
      if (!S.dev) return ''; var t = L();
      return '<div class="akk-dev"><p class="rz-p sm">' + esc(t.dev) + '</p><div class="akk-devr"><input id="akkDevPw" type="password" autocomplete="off" placeholder="' + esc(t.devPw) + '" aria-label="' + esc(t.devPw) + '"><button type="button" class="rz-btn sm" data-act="akkdev">' + esc(t.devGet) + '</button></div></div>';
    }
    function sheet() {
      var t = L(), k = cfg.kit, h;
      if (!k) return;
      if (S.kirgan && step !== 'del' && step !== 'delcode') step = 'acc';
      if (step === 'in') {
        h = k.shHead(t.inT) + '<p class="rz-p">' + esc(t.inP) + '</p><label class="rz-f" for="akkEmail"><span>' + esc(t.email) + '</span><input id="akkEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="254" placeholder="' + esc(t.emailPh) + '" value="' + esc(cur.email) + '"></label>' + errHtml() +
          '<div class="rz-actions"><button type="button" class="rz-btn primary" id="akkSend" data-act="akksend">' + esc(cur.busy ? t.sending : t.send) + '</button></div><p class="rz-p sm">' + esc(t.inP2) + '</p>' + privLine() + devBox();
      } else if (step === 'code' || step === 'delcode') {
        var del = step === 'delcode';
        h = k.shHead(del ? t.delT : t.cdT) + '<p class="rz-p">' + esc(fill(del ? t.delCd : t.cdP, { e: cur.email })) + '</p><label class="rz-f" for="akkCode"><span>' + esc(t.cdLbl) + '</span><input id="akkCode" class="akk-code" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" maxlength="7" placeholder="' + esc(t.cdPh) + '"></label>' + errHtml() +
          '<div class="rz-actions"><button type="button" class="rz-btn primary' + (del ? ' danger' : '') + '" id="akkGo" data-act="' + (del ? 'akkdelgo' : 'akkgo') + '">' + esc(cur.busy ? t.going : (del ? t.delGo : t.go)) + '</button></div>' +
          '<div class="akk-links"><button type="button" class="rz-link" id="akkResend" data-act="akkresend">' + esc(t.resend) + '</button>' + (del ? '' : '<button type="button" class="rz-link" data-act="akkback">' + esc(t.other) + '</button>') + '</div><p class="rz-p sm">' + esc(t.spam) + '</p>' + devBox();
      } else if (step === 'del') {
        h = k.shHead(t.delT) + '<p class="rz-p">' + esc(t.delP) + '</p>' + errHtml() + '<div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="akkacc">' + esc(L() === D.ru ? 'Назад' : 'Orqaga') + '</button><button type="button" class="rz-btn primary danger" id="akkDelSend" data-act="akkdelsend">' + esc(cur.busy ? t.sending : t.delSend) + '</button></div>';
      } else {
        h = k.shHead(t.accT) + '<p class="rz-p akk-me"><b>' + esc(fill(t.accOn, { e: S.email })) + '</b></p><p class="rz-p sm">' + esc(fill(t.accDev, { n: S.qur || 1 })) + '</p>' +
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
      if (maqsad !== 'ochirish' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr(t.eEmail); return; }
      busy(true, maqsad === 'ochirish' ? 'akkDelSend' : 'akkSend', t.sending);
      call('POST', 'kod', { email: email, til: til(), maqsad: maqsad }).then(function (r) {
        busy(false); if (r.s === 200 && r.j.ok) { cur.next = Date.now() + (r.j.kut || 60) * 1000; step = maqsad === 'ochirish' ? 'delcode' : 'code'; if (r.j.dev !== undefined) S.dev = !!r.j.dev; sheet(); return; }
        if (r.s === 429 && r.j.e === 'kut' && step === 'code') { setErr(errText('kut', r.j)); return; }
        if (r.s === 401) { setState({ yoq: true }); changed(); }
        busy(false, maqsad === 'ochirish' ? 'akkDelSend' : 'akkSend', maqsad === 'ochirish' ? t.delSend : t.send); setErr(errText(r.j.e, r.j));
      }, function () { busy(false, maqsad === 'ochirish' ? 'akkDelSend' : 'akkSend', maqsad === 'ochirish' ? t.delSend : t.send); setErr(t.eNet); });
    }
    function verify() {
      var t = L(), code = ((document.getElementById('akkCode') || {}).value || '').replace(/\D/g, ''); if (cur.busy) return; setErr('');
      if (code.length !== 6) { setErr(t.eXato); return; }
      busy(true, 'akkGo', t.going);
      call('POST', 'kirish', { email: cur.email, kod: code }).then(function (r) {
        busy(false); if (r.s === 200 && r.j.ok) { setState({ yoq: true, kirgan: true, email: r.j.email, marketing: r.j.marketing, qur: 1, dev: S.dev }); step = 'acc'; if (cfg.kit) cfg.kit.closeSheet(); toast(r.j.yangi ? t.okNew : t.okIn); changed(); ak.load(true); return; }
        busy(false, 'akkGo', t.go); setErr(errText(r.j.e, r.j)); var i = document.getElementById('akkCode'); if (i && r.j.e === 'kod_xato') { i.value = ''; try { i.focus(); } catch (e) {} }
      }, function () { busy(false, 'akkGo', t.go); setErr(t.eNet); });
    }
    function deleteGo() {
      var t = L(), code = ((document.getElementById('akkCode') || {}).value || '').replace(/\D/g, ''); if (cur.busy) return; setErr('');
      if (code.length !== 6) { setErr(t.eXato); return; }
      busy(true, 'akkGo', t.going);
      call('POST', 'ochirish', { kod: code }).then(function (r) {
        busy(false); if (r.s === 200 && r.j.ok) { setState({ yoq: true }); step = 'in'; cur = { email: '', next: 0, busy: false, err: '', n: 0 }; if (cfg.kit) { cfg.kit.closeSheet(); } toast(t.okDel); changed(); return; }
        busy(false, 'akkGo', t.delGo); if (r.s === 401) { setState({ yoq: true }); step = 'in'; changed(); } setErr(errText(r.j.e, r.j));
      }, function () { busy(false, 'akkGo', t.delGo); setErr(t.eNet); });
    }
    function signOut(all) {
      call('POST', 'chiqish', all ? { hammasi: true } : {}).then(function () { setState({ yoq: true }); step = 'in'; if (cfg.kit) cfg.kit.closeSheet(); toast(L().okOut); changed(); }, function () { setErr(L().eNet); });
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
      var pw = (document.getElementById('akkDevPw') || {}).value || '', em = cur.email || ((document.getElementById('akkEmail') || {}).value || '').trim();
      fetch(AKKAUNT_API + '/dev-kod?email=' + encodeURIComponent(em), { headers: { 'X-Admin-Password': pw }, cache: 'no-store' }).then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); }).then(function (r) {
        if (r.s === 200 && r.j.kod) { var i = document.getElementById('akkCode'); if (i) { i.value = r.j.kod; } else setErr('Kod: ' + r.j.kod); } else setErr(L().devNo);
      }, function () { setErr(L().eNet); });
    }

    ak.act = function (a, el) {
      if (a === 'akk') { step = S.kirgan ? 'acc' : 'in'; cur.err = ''; sheet(); return true; }
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
      return false;
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act^=akk]'); if (!b) return; var r = ak.act(b.getAttribute('data-act'), b); if (r === true) e.preventDefault(); });
      document.addEventListener('input', function (e) { var i = e.target; if (i && i.id === 'akkCode') { var d = i.value.replace(/\D/g, '').slice(0, 6); if (i.value !== d) i.value = d; if (d.length === 6 && !cur.busy) { if (step === 'code') verify(); } } });
      document.addEventListener('keydown', function (e) { if (e.key !== 'Enter' || !e.target || !e.target.id) return; if (e.target.id === 'akkEmail') { e.preventDefault(); sendCode('kirish'); } else if (e.target.id === 'akkCode') { e.preventDefault(); if (step === 'delcode') deleteGo(); else verify(); } });
    }
    create.instances[cfg.app] = ak;
    return ak;
  }
  create.instances = {};
  return { create: create, D: D, AKKAUNT_API: AKKAUNT_API };
});
