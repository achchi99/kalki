/* kalki.uz — Zaxira va tiklash (app-kit qismi): Ro'zg'or va KalkiFit ikkalasi shuni ishlatadi.
 *  A) Telegramga zaxira: zaxira fayli navigator.share({files}) bilan ulashiladi (Telegram → «Saqlangan xabarlar»); qo'llanmasa — yuklab olish + ko'rsatma.
 *     Oxirgi zaxira sanasi, haftalik eslatma (7 kun va ≥3 kunlik ma'lumot), tiklash ko'rsatmasi.
 *  B) Bulutga saqlash: tasodifiy TIKLASH KODI (ro'yxatsiz), uchidan-uchiga shifrlangan (WebCrypto: HKDF → id + AES-GCM kalit). Server (api/zaxira.js) faqat shifrlangan blob va id'ni ko'radi;
 *     kod va ochiq ma'lumot serverga HECH QACHON bormaydi. Sinxron: o'zgargach 30 s (debounce) va ilova yopilayotganda; oflayn — navbatda. Yangi qurilmada kod bilan tiklash.
 *  Ishlatish: var bk = KalkiBackup.create({ app, fileBase, name, kit, lang, exportText, today, getLast, setLast, dayCount, pickFile, onChange }); bk.tgRow(); bk.lastHtml(). */
(function (root, factory) {
  var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiBackup = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DAY = 86400000;
  /* ===== BITTA SOZLAMA: zaxira API manzili. Boshqa server/domenga o'tilsa FAQAT shu qator o'zgaradi (docs/zaxira-kochirish.md). ===== */
  var ZAXIRA_API = '/api/zaxira';
  var PREFIX = { kalkifit: 'KF', rozgor: 'RZ' }, ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', CODE_LEN = 28, MAX_PLAIN = 4 * 1024 * 1024;   // 32 belgi (0,1,I,O yo'q) × 28 = 140 bit
  var SALT = 'kalki.uz/zaxira/v1';

  var D = {
    uz: {
      tgT: 'Telegramga zaxira yuborish', tgS: "Faylni «Saqlangan xabarlar»ga yuboring", last: 'Oxirgi zaxira: {d}', lastNone: 'Zaxira hali olinmagan', today: 'bugun',
      sent: 'Zaxira tayyor ✓', fT: "Faylni Telegram'ga yuboring", fS: "Zaxira fayli yuklab olindi: «{f}». Endi uni Telegram'ga yuboring:", fSteps: ["Telegram'ni oching.", "«Saqlangan xabarlar»ni tanlang.", "📎 → Fayl → yuklab olingan faylni tanlab yuboring."], ok: 'Tushunarli',
      rT: 'Zaxira nusxadan tiklash', rS: "Telegram → «Saqlangan xabarlar»dan zaxira faylini telefoningizga yuklab oling (fayl ustiga bosing → «Saqlash»). Keyin «Fayl tanlash»ni bosing va shu faylni tanlang.", rPick: 'Fayl tanlash', rNo: 'Bekor qilish',
      remind: "Haftalik zaxira vaqti — ma'lumot faqat shu qurilmada.", remindBtn: 'Telegramga yuborish',
      clT: 'Bulutga saqlash', clOffT: 'Bulutga saqlashni yoqish', clOffS: "Telefon almashsangiz yoki yo'qolsa ham ma'lumotingiz qoladi", clOnT: 'Bulutga saqlash yoqilgan',
      clIntro: "Ma'lumotingiz tiklash kodi bilan shifrlanib serverga saqlanadi. Ro'yxatdan o'tish shart emas.", clConsent: "Ma'lumotlaringiz shifrlangan holda serverda saqlanadi", clAgree: 'Roziman', clCancel: 'Bekor qilish',
      clCodeT: 'Tiklash kodingiz', clCodeS: "Bu kodni xavfsiz joyga yozib qo'ying. Kod yo'qolsa, ma'lumotni tiklab bo'lmaydi — uni hech kim, biz ham, qayta tiklay olmaydi.", clCopy: 'Nusxalash', clTg: 'Telegramga yuborish', clSaved: 'Saqladim', clSavedHint: "«Saqladim»ni bosmaguncha bulutga saqlash yoqilmaydi.", clCopied: 'Kod nusxalandi', clCopiedTg: "Kod nusxalandi — Telegram'ga yuboring", clOnToast: 'Bulutga saqlash yoqildi',
      clLast: 'Oxirgi saqlangan: {d} ✓', clNever: 'Hali saqlanmagan', clQueue: 'Navbatda — internet kelganda saqlanadi', clBusy: 'Saqlanmoqda…', clShow: "Kodni ko'rsatish", clNow: 'Hozir saqlash', clDel: "Bulutdan o'chirish",
      clDelT: "Bulutdan o'chirish", clDelS: "Serverdagi nusxa o'chiriladi. Telefondagi ma'lumot saqlanib qoladi. Kodni qayta yoqmaguningizcha bulutga saqlanmaydi.", clDelGo: "O'chirish", clDelOk: "Bulutdagi nusxa o'chirildi", clDelErr: "O'chirib bo'lmadi — internetni tekshiring",
      clNA: "Bulutga saqlash hozircha ishga tushirilmagan — keyinroq urinib ko'ring", clConfT: 'Boshqa qurilmada yangiroq nusxa bor', clConfS: "Bulutdagi nusxa boshqa qurilmadan yangilangan. Qaysi biri qolsin?", clKeepMine: 'Shu qurilmadagini saqlash', clTakeCloud: 'Bulutdagini yuklash', clTaken: 'Bulutdagi nusxa yuklandi',
      rcLink: 'Avval ishlatganmisiz? Tiklash kodini kiriting', rcT: 'Tiklash kodi', rcS: "Avval bulutga saqlashni yoqqan bo'lsangiz, tiklash kodini kiriting.", rcPh: 'KF-XXXX-XXXX-…', rcGo: 'Tiklash', rcBusy: 'Tiklanmoqda…', rcOk: "Ma'lumotlaringiz tiklandi",
      eFmt: "Kod noto'g'ri yozilgan. Kodda 0, 1, I, O belgilari yo'q. Uni qayta tekshiring.", eApp: "Bu kod boshqa ilovaniki.", eNone: "Bu kod bo'yicha saqlangan nusxa topilmadi. Kodni tekshiring.", eBad: "Kod noto'g'ri yoki ma'lumot buzilgan.", eNet: "Internet yo'q yoki server band. Keyinroq urinib ko'ring.", eLimit: "Juda ko'p urinish. Keyinroq urinib ko'ring."
    },
    ru: {
      tgT: 'Отправить резервную копию в Telegram', tgS: 'Отправьте файл в «Избранное»', last: 'Последняя копия: {d}', lastNone: 'Резервной копии ещё нет', today: 'сегодня',
      sent: 'Копия готова ✓', fT: 'Отправьте файл в Telegram', fS: 'Файл резервной копии скачан: «{f}». Теперь отправьте его в Telegram:', fSteps: ['Откройте Telegram.', 'Выберите «Избранное».', '📎 → Файл → выберите скачанный файл и отправьте.'], ok: 'Понятно',
      rT: 'Восстановление из резервной копии', rS: 'В Telegram откройте «Избранное» и скачайте файл копии на телефон (нажмите на файл → «Сохранить»). Затем нажмите «Выбрать файл» и выберите его.', rPick: 'Выбрать файл', rNo: 'Отмена',
      remind: 'Пора сделать недельную копию — данные хранятся только на этом устройстве.', remindBtn: 'Отправить в Telegram',
      clT: 'Сохранение в облако', clOffT: 'Включить сохранение в облако', clOffS: 'Данные останутся, даже если вы смените или потеряете телефон', clOnT: 'Сохранение в облако включено',
      clIntro: 'Данные шифруются кодом восстановления и сохраняются на сервере. Регистрация не нужна.', clConsent: 'Ваши данные хранятся на сервере в зашифрованном виде', clAgree: 'Согласен', clCancel: 'Отмена',
      clCodeT: 'Ваш код восстановления', clCodeS: 'Запишите этот код в надёжном месте. Если код потерян, данные восстановить невозможно — никто, в том числе мы, не сможет их открыть.', clCopy: 'Скопировать', clTg: 'Отправить в Telegram', clSaved: 'Я сохранил', clSavedHint: 'Пока вы не нажмёте «Я сохранил», сохранение в облако не включится.', clCopied: 'Код скопирован', clCopiedTg: 'Код скопирован — отправьте его в Telegram', clOnToast: 'Сохранение в облако включено',
      clLast: 'Последнее сохранение: {d} ✓', clNever: 'Ещё не сохранялось', clQueue: 'В очереди — сохранится, когда появится интернет', clBusy: 'Сохраняем…', clShow: 'Показать код', clNow: 'Сохранить сейчас', clDel: 'Удалить из облака',
      clDelT: 'Удалить из облака', clDelS: 'Копия на сервере будет удалена. Данные на телефоне сохранятся. В облако ничего не сохранится, пока вы снова не включите функцию.', clDelGo: 'Удалить', clDelOk: 'Копия в облаке удалена', clDelErr: 'Не удалось удалить — проверьте интернет',
      clNA: 'Сохранение в облако пока не запущено — попробуйте позже', clConfT: 'На другом устройстве есть более новая копия', clConfS: 'Копия в облаке обновлена с другого устройства. Какую оставить?', clKeepMine: 'Оставить копию с этого устройства', clTakeCloud: 'Загрузить из облака', clTaken: 'Копия из облака загружена',
      rcLink: 'Уже пользовались? Введите код восстановления', rcT: 'Код восстановления', rcS: 'Если раньше вы включали сохранение в облако, введите код восстановления.', rcPh: 'KF-XXXX-XXXX-…', rcGo: 'Восстановить', rcBusy: 'Восстанавливаем…', rcOk: 'Данные восстановлены',
      eFmt: 'Код записан неверно. В коде нет символов 0, 1, I, O. Проверьте его.', eApp: 'Этот код от другого приложения.', eNone: 'Копия по этому коду не найдена. Проверьте код.', eBad: 'Код неверный или данные повреждены.', eNet: 'Нет интернета или сервер занят. Попробуйте позже.', eLimit: 'Слишком много попыток. Попробуйте позже.'
    }
  };
  function fill(s, p) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] != null ? p[k] : m; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function hash32(str) { var h = 0x811c9dc5; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16) + ':' + str.length; }   // o'zgarish aniqlash (xavfsizlik uchun emas)
  function two(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------- kriptografiya (sof funksiyalar — Node va brauzerda testlanadi) ---------- */
  var C = (typeof globalThis !== 'undefined' && globalThis.crypto) || (typeof self !== 'undefined' && self.crypto) || null;
  var enc = function (t) { return new TextEncoder().encode(t); };
  function b64u(u8) { var s = ''; for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(t) { t = String(t).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var bin = atob(t), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function hex(u8) { var o = ''; for (var i = 0; i < u8.length; i++) o += (u8[i] < 16 ? '0' : '') + u8[i].toString(16); return o; }
  function genCode(app) {                          // KF-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX (28 belgi = 140 bit, chalkash harflarsiz)
    var r = C.getRandomValues(new Uint8Array(CODE_LEN)), ch = ''; for (var i = 0; i < CODE_LEN; i++) ch += ALPHA[r[i] & 31];
    var g = []; for (var j = 0; j < CODE_LEN; j += 4) g.push(ch.slice(j, j + 4)); return (PREFIX[app] || 'KF') + '-' + g.join('-');
  }
  function parseCode(app, input) {                 // → { ok, body } | { ok:false, err: 'fmt' | 'app' }
    var t = String(input == null ? '' : input).toUpperCase().replace(/[\s\u00a0]+/g, '');
    var m = /^([A-Z]{2})-?(.+)$/.exec(t); if (!m) return { ok: false, err: 'fmt' };
    var other = Object.keys(PREFIX).filter(function (k) { return PREFIX[k] === m[1]; })[0]; if (!other) return { ok: false, err: 'fmt' }; if (other !== app) return { ok: false, err: 'app' };
    var body = m[2].replace(/-/g, ''); if (body.length !== CODE_LEN) return { ok: false, err: 'fmt' };
    for (var i = 0; i < body.length; i++) if (ALPHA.indexOf(body[i]) < 0) return { ok: false, err: 'fmt' };
    return { ok: true, body: body };
  }
  function deriveKeys(app, body) {                 // HKDF-SHA256: id (serverdagi kalit) va AES-GCM kalit — ikki alohida "info" bilan
    var subtle = C.subtle, salt = enc(SALT);
    return subtle.importKey('raw', enc(body), 'HKDF', false, ['deriveBits', 'deriveKey']).then(function (ikm) {
      return Promise.all([subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: salt, info: enc(app + '|id') }, ikm, 256).then(function (b) { return subtle.digest('SHA-256', b); }),
        subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: salt, info: enc(app + '|enc') }, ikm, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])]).then(function (r) { return { id: hex(new Uint8Array(r[0])), key: r[1] }; });
    });
  }
  function deflate(u8) { if (typeof CompressionStream === 'undefined') return Promise.resolve({ f: 0, d: u8 }); var cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter(); w.write(u8); w.close(); return new Response(cs.readable).arrayBuffer().then(function (b) { return { f: 1, d: new Uint8Array(b) }; }); }
  function inflate(u8) {
    var ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(u8)['catch'](function () {}); w.close()['catch'](function () {});
    var rd = ds.readable.getReader(), parts = [], total = 0;
    return (function pump() { return rd.read().then(function (r) { if (r.done) { var all = new Uint8Array(total), o = 0; parts.forEach(function (c) { all.set(c, o); o += c.length; }); return all; } total += r.value.length; if (total > MAX_PLAIN) { rd.cancel()['catch'](function () {}); throw new Error('big'); } parts.push(r.value); return pump(); }); })();
  }
  function seal(app, keys, text) {                 // blob = base64url( 0x01 | iv(12) | AES-GCM( flag | siqilgan JSON ) ); AAD = ilova nomi
    return deflate(enc(text)).then(function (z) {
      var pl = new Uint8Array(z.d.length + 1); pl[0] = z.f; pl.set(z.d, 1); var iv = C.getRandomValues(new Uint8Array(12));
      return C.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: enc(app) }, keys.key, pl).then(function (ct) { var out = new Uint8Array(13 + ct.byteLength); out[0] = 1; out.set(iv, 1); out.set(new Uint8Array(ct), 13); return b64u(out); });
    });
  }
  function open(app, keys, blob) {                 // → Promise<string> | rad etiladi (noto'g'ri kod / buzilgan blob)
    var u; try { u = unb64u(blob); } catch (e) { return Promise.reject(new Error('bad')); }
    if (u.length < 30 || u[0] !== 1) return Promise.reject(new Error('bad'));
    return C.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(1, 13), additionalData: enc(app) }, keys.key, u.subarray(13)).then(function (pl) {
      var p = new Uint8Array(pl), body = p.subarray(1); return (p[0] === 1 ? inflate(body) : Promise.resolve(body)).then(function (t) { return new TextDecoder('utf-8', { fatal: true }).decode(t); });
    }).then(null, function () { throw new Error('bad'); });
  }

  function create(cfg) {
    var NAV = typeof navigator !== 'undefined' ? navigator : {}, bk = {};
    function L() { return D[(cfg.lang ? cfg.lang() : 'uz') === 'ru' ? 'ru' : 'uz']; }
    function changed() { if (cfg.onChange) cfg.onChange(); }
    function sameDay(a, b) { return new Date(a).toDateString() === new Date(b).toDateString(); }

    bk.fileName = function () { return cfg.fileBase + '-zaxira-' + cfg.today() + '.json'; };
    bk.lastLabel = function (ts) {
      ts = ts || (cfg.getLast ? cfg.getLast() : 0); var t = L(); if (!ts) return t.lastNone;
      var d = new Date(ts), hm = two(d.getHours()) + ':' + two(d.getMinutes());
      return fill(t.last, { d: sameDay(ts, Date.now()) ? t.today + ' ' + hm : two(d.getDate()) + '.' + two(d.getMonth() + 1) + '.' + d.getFullYear() });
    };
    bk.lastHtml = function () { return '<p class="rz-p sm bk-last" id="bkLast">' + esc(bk.lastLabel()) + '</p>'; };
    bk.tgRow = function () {
      var t = L(), svgI = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 4L3 11l6 2 2 6 3-4 4 3z"/></svg>';
      return '<button type="button" class="rz-row" data-act="bktg" data-bk="tg"><span class="' + esc(cfg.rowIcon || 'rz-ci') + '">' + svgI + '</span><span class="m"><b>' + esc(t.tgT) + '</b><span>' + esc(t.tgS) + '</span></span><svg class="rz-i r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>';
    };
    bk.remindDue = function () {      // haftalik eslatma: oxirgi zaxiradan 7 kun va ≥3 kunlik ma'lumot (akkaunt bilan avtomatik saqlanayotganlarga CHIQMAYDI)
      if (cfg.autoSaved && cfg.autoSaved()) return false;
      if (!cfg.hasData || !cfg.hasData()) return false; if ((cfg.dayCount ? cfg.dayCount() : 0) < 3) return false;
      var lb = (cfg.getLast ? cfg.getLast() : 0) || (cfg.created ? cfg.created() : 0) || 0; return Date.now() - lb > 7 * DAY;
    };

    /* ---- Telegramga yuborish ---- */
    function download(text) {
      try { var a = document.createElement('a'), u = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.href = u; a.download = bk.fileName(); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 500); } catch (e) {}
    }
    function openFileHelp() {
      var t = L(); if (!cfg.kit) return;
      cfg.kit.openSheet('bkfile', '<div class="bk-sheet">' + cfg.kit.shHead(t.fT) + '<p class="rz-p">' + esc(fill(t.fS, { f: bk.fileName() })) + '</p><ol class="bk-steps">' + t.fSteps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(t.ok) + '</button></div></div>', { noFocus: true });
    }
    bk.tg = function () {
      var text; try { text = cfg.exportText(); } catch (e) { return; }
      var done = function () { if (cfg.setLast) cfg.setLast(Date.now()); if (cfg.kit) cfg.kit.toast(L().sent, null, true); changed(); };
      var fallback = function () { download(text); if (cfg.setLast) cfg.setLast(Date.now()); changed(); openFileHelp(); };
      var file; try { file = new File([text], bk.fileName(), { type: 'application/json' }); } catch (e) { fallback(); return; }
      if (NAV.share && NAV.canShare && NAV.canShare({ files: [file] })) {
        NAV.share({ files: [file], title: cfg.name }).then(done, function (e) { if (e && e.name === 'AbortError') return; fallback(); });
      } else fallback();
    };
    bk.restoreSheet = function () {
      var t = L(); if (!cfg.kit) return;
      cfg.kit.openSheet('bkrestore', '<div class="bk-sheet">' + cfg.kit.shHead(t.rT) + '<p class="rz-p">' + esc(t.rS) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(t.rNo) + '</button><button type="button" class="rz-btn primary" data-act="bkpick">' + esc(t.rPick) + '</button></div></div>', { noFocus: true });
    };

    /* ================= B) Bulutga saqlash (tiklash kodi, uchidan-uchiga shifrlangan) ================= */
    var LS = 'kalki_zaxira_' + cfg.app, timer = null, busy = false, retry = 0, pendingCode = null, rcBusy = false;
    var empty = function () { return { on: false, code: '', ver: 0, last: 0, pending: false, conflict: 0, sig: '' }; };
    var curSig = function () { try { return hash32(cfg.sig ? cfg.sig() : cfg.exportText().replace(/"exportedAt":\d+,?/, '')); } catch (e) { return ''; } };
    var CS = (function () { try { var o = JSON.parse(localStorage.getItem(LS) || 'null'); return o && o.on && o.code ? { on: true, code: String(o.code), ver: +o.ver || 0, last: +o.last || 0, pending: !!o.pending, conflict: +o.conflict || 0, sig: o.sig || '' } : empty(); } catch (e) { return empty(); } })();
    bk.debounceMs = 30000;
    function saveCloud() { try { if (CS.on) localStorage.setItem(LS, JSON.stringify(CS)); else localStorage.removeItem(LS); } catch (e) {} }
    function online() { return NAV.onLine !== false; }
    function fmtWhen(ts) { var t = L(), d = new Date(ts), hm = two(d.getHours()) + ':' + two(d.getMinutes()); return sameDay(ts, Date.now()) ? t.today + ' ' + hm : two(d.getDate()) + '.' + two(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + hm; }
    function api(method, qs, body, keepalive) {
      return fetch(ZAXIRA_API + (qs || ''), { method: method, headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined, keepalive: !!keepalive, cache: 'no-store' }).then(function (r) { return r.json()['catch'](function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); });
    }
    function keysFor(code) { var pc = parseCode(cfg.app, code); if (!pc.ok) return Promise.reject(new Error(pc.err)); return deriveKeys(cfg.app, pc.body); }
    function schedule(ms) { clearTimeout(timer); timer = setTimeout(function () { flush(); }, ms == null ? bk.debounceMs : ms); }
    function backoff() { retry++; schedule(Math.min(300000, 30000 * Math.pow(2, retry))); }
    bk.cloudOn = function () { return CS.on; };
    bk.cloudState = function () { return JSON.parse(JSON.stringify(CS)); };
    bk.touch = function () { if (!CS.on) return; if (curSig() === CS.sig) return; CS.pending = true; saveCloud(); if (!CS.conflict) schedule(); };   // faqat HAQIQIY o'zgarishda (render paytidagi bir xil save() hisobga olinmaydi)    // ma'lumot o'zgardi → 30 s kutib yuboriladi
    function flush(force) {
      if (!CS.on || busy || CS.conflict || (!CS.pending && !force)) return Promise.resolve(false);
      if (!online()) { changed(); return Promise.resolve(false); }                  // oflayn: navbatda (pending saqlangan), 'online' hodisasida yuboriladi
      busy = true; clearTimeout(timer); var text, mark = curSig(); try { text = cfg.exportText(); } catch (e) { busy = false; return Promise.resolve(false); }
      return keysFor(CS.code).then(function (k) { return seal(cfg.app, k, text).then(function (blob) { return api('PUT', '', { id: k.id, ilova: cfg.app, kutilgan: CS.ver, blob: blob }, blob.length < 60000); }); }).then(function (r) {
        busy = false;
        if (r.s === 200) { CS.ver = r.j.versiya; CS.last = Date.now(); retry = 0; CS.sig = mark; CS.pending = curSig() !== mark; saveCloud(); if (CS.pending) schedule(); }
        else if (r.s === 409) { CS.conflict = r.j.versiya || 1; saveCloud(); }
        else backoff();
        changed(); return r.s === 200;
      }, function () { busy = false; backoff(); changed(); return false; });
    }
    bk.flush = flush;
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', function () { if (document.hidden && CS.on && CS.pending) flush(); });
      window.addEventListener('pagehide', function () { if (CS.on && CS.pending) flush(); });
      window.addEventListener('online', function () { if (CS.on && CS.pending) flush(); changed(); });
      window.addEventListener('offline', function () { changed(); });
    }
    if (CS.on && CS.pending) schedule(2000);

    function copyText(t) {
      var legacy = function () { try { var ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px'; document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length); var r = document.execCommand('copy'); ta.remove(); return r; } catch (e) { return false; } };
      if (NAV.clipboard && NAV.clipboard.writeText) return NAV.clipboard.writeText(t).then(function () { return true; }, function () { return legacy(); });
      return Promise.resolve(legacy());
    }
    function codeSheet(code, confirm) {
      var t = L(); if (!cfg.kit) return;
      cfg.kit.openSheet('bkcode', '<div class="bk-sheet">' + cfg.kit.shHead(t.clCodeT) + '<div class="bk-code" id="bkCode" role="textbox" aria-readonly="true" aria-label="' + esc(t.clCodeT) + '">' + esc(code) + '</div><p class="rz-p warn">' + esc(t.clCodeS) + '</p><div class="rz-actions"><button type="button" class="rz-btn" data-act="bkcopy">' + esc(t.clCopy) + '</button><button type="button" class="rz-btn" data-act="bkcodetg">' + esc(t.clTg) + '</button></div>' +
        (confirm ? '<p class="rz-p sm">' + esc(t.clSavedHint) + '</p><div class="rz-actions"><button type="button" class="rz-btn primary" data-act="bksaved" id="bkSaved">' + esc(t.clSaved) + '</button></div>' : '<div class="rz-actions"><button type="button" class="rz-btn primary" data-act="sheetclose">' + esc(t.ok) + '</button></div>') + '</div>', { noFocus: true });
    }
    function shownCode() { return pendingCode || CS.code; }
    bk.cloudIntro = function () {                 // avval xizmat tayyormi (jadval bormi) — yo'q bo'lsa rozilik oynasini ochmaymiz
      pendingCode = null; api('GET', '?ping=1').then(function (r) { if (r.s === 200 && r.j && r.j.tayyor) introSheet(); else if (cfg.kit) cfg.kit.toast(L().clNA); }, function () { if (cfg.kit) cfg.kit.toast(L().eNet); });
    };
    function introSheet() {
      var t = L(); if (!cfg.kit) return;
      cfg.kit.openSheet('bkcl', '<div class="bk-sheet">' + cfg.kit.shHead(t.clOffT) + '<p class="rz-p">' + esc(t.clIntro) + '</p><p class="rz-p bk-consent"><b>' + esc(t.clConsent) + '</b></p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(t.clCancel) + '</button><button type="button" class="rz-btn primary" data-act="bkconsent" id="bkAgree">' + esc(t.clAgree) + '</button></div></div>', { noFocus: true });
    }
    bk.cloudHtml = function () {             // Men/Sozlamalar: o'chiq — qator; yoqilgan — holat + tugmalar
      var t = L();
      if (!CS.on) { var ic = '<svg class="rz-i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 18a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 .5 9z"/></svg>'; return '<button type="button" class="rz-row" data-act="bkcl" data-bk="cloudoff"><span class="' + esc(cfg.rowIcon || 'rz-ci') + '">' + ic + '</span><span class="m"><b>' + esc(t.clOffT) + '</b><span>' + esc(t.clOffS) + '</span></span><svg class="rz-i r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>'; }
      var st = busy ? t.clBusy : (CS.last ? fill(t.clLast, { d: fmtWhen(CS.last) }) : t.clNever); if (CS.pending && !busy && !online()) st += ' · ' + t.clQueue;
      var conf = CS.conflict ? '<div class="bk-conf" role="alert"><b>' + esc(t.clConfT) + '</b><p class="rz-p sm">' + esc(t.clConfS) + '</p><div class="rz-actions"><button type="button" class="rz-btn sm" data-act="bkkeep">' + esc(t.clKeepMine) + '</button><button type="button" class="rz-btn sm primary" data-act="bktake">' + esc(t.clTakeCloud) + '</button></div></div>' : '';
      return '<div class="bk-cloud" data-bk="cloudon"><div class="bk-ct"><b>' + esc(t.clOnT) + '</b></div><p class="rz-p sm bk-st" id="bkCloudSt" role="status">' + esc(st) + '</p>' + conf + '<div class="bk-cb"><button type="button" class="rz-btn sm" data-act="bkshow">' + esc(t.clShow) + '</button><button type="button" class="rz-btn sm" data-act="bknow">' + esc(t.clNow) + '</button><button type="button" class="rz-btn sm ghost danger" data-act="bkdel">' + esc(t.clDel) + '</button></div></div>';
    };
    bk.restoreLink = function () { return '<button type="button" class="rz-link bk-rclink" data-act="bkcodeopen">' + esc(L().rcLink) + '</button>'; };
    function rcOverlay(err) {
      var t = L(), g = document.getElementById('rzRestore'); if (!g) { g = document.createElement('div'); g.id = 'rzRestore'; g.className = 'rz-onb inst-gate bk-restore'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true'); cfg.root.appendChild(g); }
      var keep = ''; var old = document.getElementById('bkCodeIn'); if (old) keep = old.value;
      g.innerHTML = '<div class="rz-ob-top"><span></span></div><div class="rz-ob-body inst-gbody"><h2 class="rz-q">' + esc(t.rcT) + '</h2><p class="rz-p">' + esc(t.rcS) + '</p><label class="rz-f" for="bkCodeIn"><span>' + esc(t.rcT) + '</span><input id="bkCodeIn" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="64" placeholder="' + esc(t.rcPh) + '" value="' + esc(keep) + '"></label>' + (err ? '<p class="rz-p warn" role="alert" id="bkErr">' + esc(t[err] || t.eBad) + '</p>' : '') + '</div><div class="rz-ob-foot inst-gfoot"><button type="button" class="rz-btn primary" data-act="bkcodego" id="bkGo">' + esc(t.rcGo) + '</button><button type="button" class="rz-btn ghost" data-act="bkcodeno">' + esc(t.clCancel) + '</button></div>';
      var inp = document.getElementById('bkCodeIn'); if (inp && !err) try { inp.focus({ preventScroll: true }); } catch (e) {}
    }
    /* Tiklash yadrosi (UI'siz): kod → bulutdan olish → shifrni ochish → ilovaga qo'llash. Akkaunt orqali tiklash ham shuni ishlatadi (assets/app-akkaunt.js). → { ok:true } | { err:'eFmt'|'eApp'|'eNone'|'eBad'|'eNet'|'eLimit' } */
    function restoreCore(raw) {
      var pc = parseCode(cfg.app, raw); if (!pc.ok) return Promise.resolve({ err: pc.err === 'app' ? 'eApp' : 'eFmt' });
      var code = (PREFIX[cfg.app]) + '-' + pc.body.match(/.{4}/g).join('-'), keys;
      return deriveKeys(cfg.app, pc.body).then(function (k) { keys = k; return api('GET', '?id=' + k.id); }).then(function (r) {
        if (r.s === 404) return { err: 'eNone' }; if (r.s === 429) return { err: 'eLimit' }; if (r.s !== 200 || !r.j || typeof r.j.blob !== 'string') return { err: 'eNet' };
        return open(cfg.app, keys, r.j.blob).then(function (text) {
          var res; try { res = cfg.importText(text); } catch (e) { res = null; } if (!res || !res.ok) return { err: 'eBad' };
          cfg.applyState(res.state); CS = { on: true, code: code, ver: r.j.versiya, last: r.j.yangilangan || Date.now(), pending: false, conflict: 0, sig: '' }; CS.sig = curSig(); saveCloud(); return { ok: true };
        }, function () { return { err: 'eBad' }; });
      }, function () { return { err: 'eNet' }; });
    }
    function restoreFromCode() {
      if (rcBusy) return; var inp = document.getElementById('bkCodeIn'), raw = inp ? inp.value : '', pc = parseCode(cfg.app, raw);
      if (!pc.ok) { rcOverlay(pc.err === 'app' ? 'eApp' : 'eFmt'); return; }
      rcBusy = true; var go = document.getElementById('bkGo'); if (go) { go.disabled = true; go.textContent = L().rcBusy; }
      restoreCore(raw).then(function (r) {
        rcBusy = false; if (!r.ok) { rcOverlay(r.err); return; }
        var g = document.getElementById('rzRestore'); if (g) g.remove(); if (cfg.kit) cfg.kit.toast(L().rcOk, null, true); changed();
      });
    }
    /* ---- akkaunt (app-akkaunt.js) uchun: kod bilan ishlash qismlari ---- */
    bk.cloudCode = function () { return CS.on ? CS.code : ''; };
    bk.restoreCode = restoreCore;
    bk.peekCode = function (raw) {                    // bulutda shu kod bo'yicha nusxa bormi (shifrni OCHMAYDI) → { s, versiya, yangilangan }
      var pc = parseCode(cfg.app, raw); if (!pc.ok) return Promise.resolve({ s: 0 });
      return deriveKeys(cfg.app, pc.body).then(function (k) { return api('GET', '?id=' + k.id); }).then(function (r) { return { s: r.s, versiya: r.j && r.j.versiya, yangilangan: r.j && r.j.yangilangan }; }, function () { return { s: 0 }; });
    };
    bk.enableNew = function () {                      // yangi kod bilan bulutga avtomatik saqlashni yoqish (kod foydalanuvchiga ko'rsatilmaydi — akkauntga o'ralib saqlanadi)
      var code = genCode(cfg.app); CS = { on: true, code: code, ver: 0, last: 0, pending: true, conflict: 0, sig: '' }; saveCloud(); schedule(2000); changed(); return code;
    };
    bk.adoptCode = function (raw, ver) {              // shu qurilmadagi ma'lumot akkauntdagi kodga yoziladi (ver: bulutdagi joriy versiya — PUT o'tishi uchun)
      var pc = parseCode(cfg.app, raw); if (!pc.ok) return false; var code = PREFIX[cfg.app] + '-' + pc.body.match(/.{4}/g).join('-');
      CS = { on: true, code: code, ver: ver || 0, last: 0, pending: true, conflict: 0, sig: '' }; saveCloud(); schedule(2000); changed(); return true;
    };
    function takeCloud() {
      keysFor(CS.code).then(function (k) { return api('GET', '?id=' + k.id).then(function (r) { if (r.s !== 200) throw new Error('net'); return open(cfg.app, k, r.j.blob).then(function (text) { var res = cfg.importText(text); if (!res || !res.ok) throw new Error('bad'); cfg.applyState(res.state); CS.ver = r.j.versiya; CS.last = r.j.yangilangan || Date.now(); CS.conflict = 0; CS.pending = false; CS.sig = curSig(); saveCloud(); if (cfg.kit) cfg.kit.toast(L().clTaken, null, true); changed(); }); }); })['catch'](function () { if (cfg.kit) cfg.kit.toast(L().eNet); });
    }
    function delCloud() {
      keysFor(CS.code).then(function (k) { return api('DELETE', '?id=' + k.id); }).then(function (r) {
        if (r.s !== 200) { if (cfg.kit) cfg.kit.toast(L().clDelErr); return; }
        clearTimeout(timer); CS = empty(); saveCloud(); if (cfg.kit) { cfg.kit.closeSheet(); cfg.kit.toast(L().clDelOk, null, true); } changed();
      }, function () { if (cfg.kit) cfg.kit.toast(L().clDelErr); });
    }

    bk.act = function (a) {
      if (a === 'bktg') { bk.tg(); return true; }
      if (a === 'bkrestore') { bk.restoreSheet(); return true; }
      if (a === 'bkcl') { bk.cloudIntro(); return true; }
      if (a === 'bkconsent') { pendingCode = genCode(cfg.app); codeSheet(pendingCode, true); return true; }
      if (a === 'bkcopy') { copyText(shownCode()).then(function (ok) { if (ok && cfg.kit) cfg.kit.toast(L().clCopied, null, true); }); return true; }
      if (a === 'bkcodetg') { var c0 = shownCode(); if (NAV.share) NAV.share({ text: c0, title: cfg.name }).then(null, function (e) { if (!(e && e.name === 'AbortError')) copyText(c0); }); else copyText(c0).then(function () { if (cfg.kit) cfg.kit.toast(L().clCopiedTg, null, true); }); return true; }
      if (a === 'bksaved') { if (!pendingCode) return true; CS = { on: true, code: pendingCode, ver: 0, last: 0, pending: true, conflict: 0, sig: '' }; pendingCode = null; saveCloud(); if (cfg.kit) { cfg.kit.closeSheet(); cfg.kit.toast(L().clOnToast, null, true); } flush(true).then(function () { changed(); }); changed(); return true; }
      if (a === 'bkshow') { codeSheet(CS.code, false); return true; }
      if (a === 'bknow') { flush(true); changed(); return true; }
      if (a === 'bkdel') { var t = L(); if (cfg.kit) cfg.kit.openSheet('bkdelc', '<div class="bk-sheet">' + cfg.kit.shHead(t.clDelT) + '<p class="rz-p">' + esc(t.clDelS) + '</p><div class="rz-actions"><button type="button" class="rz-btn ghost" data-act="sheetclose">' + esc(t.clCancel) + '</button><button type="button" class="rz-btn primary danger" data-act="bkdelgo">' + esc(t.clDelGo) + '</button></div></div>', { noFocus: true }); return true; }
      if (a === 'bkdelgo') { delCloud(); return true; }
      if (a === 'bkkeep') { CS.ver = CS.conflict; CS.conflict = 0; CS.pending = true; saveCloud(); flush(true); changed(); return true; }
      if (a === 'bktake') { takeCloud(); return true; }
      if (a === 'bkcodeopen') { rcOverlay(''); return true; }
      if (a === 'bkcodeno') { var g = document.getElementById('rzRestore'); if (g) g.remove(); return true; }
      if (a === 'bkcodego') { restoreFromCode(); return true; }
      if (a === 'bkpick') { if (cfg.kit) cfg.kit.closeSheet(); if (cfg.pickFile) setTimeout(cfg.pickFile, 0); return true; }
      return false;
    };
    if (typeof document !== 'undefined') document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act^=bk]'); if (b && bk.act(b.getAttribute('data-act'), b)) e.preventDefault(); });
    create.instances[cfg.app] = bk;
    return bk;
  }
  create.instances = {};
  return { create: create, D: D, instances: create.instances, ZAXIRA_API: ZAXIRA_API, genCode: genCode, parseCode: parseCode, deriveKeys: deriveKeys, seal: seal, open: open, ALPHA: ALPHA, CODE_LEN: CODE_LEN };
});
