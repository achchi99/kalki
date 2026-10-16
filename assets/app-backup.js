/* kalki.uz — Zaxira va tiklash (app-kit qismi): Ro'zg'or va KalkiFit ikkalasi shuni ishlatadi.
 *  A) Telegramga zaxira: zaxira fayli navigator.share({files}) bilan ulashiladi (Telegram → «Saqlangan xabarlar»); qo'llanmasa — yuklab olish + ko'rsatma.
 *     Oxirgi zaxira sanasi, haftalik eslatma (7 kun va ≥3 kunlik ma'lumot), tiklash ko'rsatmasi.
 *  Ishlatish: var bk = KalkiBackup.create({ app, fileBase, name, kit, lang, exportText, today, getLast, setLast, dayCount, pickFile, onChange }); bk.tgRow(); bk.lastHtml(). */
(function (root, factory) {
  var api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiBackup = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var DAY = 86400000;

  var D = {
    uz: {
      tgT: 'Telegramga zaxira yuborish', tgS: "Faylni «Saqlangan xabarlar»ga yuboring", last: 'Oxirgi zaxira: {d}', lastNone: 'Zaxira hali olinmagan', today: 'bugun',
      sent: 'Zaxira tayyor ✓', fT: "Faylni Telegram'ga yuboring", fS: "Zaxira fayli yuklab olindi: «{f}». Endi uni Telegram'ga yuboring:", fSteps: ["Telegram'ni oching.", "«Saqlangan xabarlar»ni tanlang.", "📎 → Fayl → yuklab olingan faylni tanlab yuboring."], ok: 'Tushunarli',
      rT: 'Zaxira nusxadan tiklash', rS: "Telegram → «Saqlangan xabarlar»dan zaxira faylini telefoningizga yuklab oling (fayl ustiga bosing → «Saqlash»). Keyin «Fayl tanlash»ni bosing va shu faylni tanlang.", rPick: 'Fayl tanlash', rNo: 'Bekor qilish',
      remind: "Haftalik zaxira vaqti — ma'lumot faqat shu qurilmada.", remindBtn: 'Telegramga yuborish'
    },
    ru: {
      tgT: 'Отправить резервную копию в Telegram', tgS: 'Отправьте файл в «Избранное»', last: 'Последняя копия: {d}', lastNone: 'Резервной копии ещё нет', today: 'сегодня',
      sent: 'Копия готова ✓', fT: 'Отправьте файл в Telegram', fS: 'Файл резервной копии скачан: «{f}». Теперь отправьте его в Telegram:', fSteps: ['Откройте Telegram.', 'Выберите «Избранное».', '📎 → Файл → выберите скачанный файл и отправьте.'], ok: 'Понятно',
      rT: 'Восстановление из резервной копии', rS: 'В Telegram откройте «Избранное» и скачайте файл копии на телефон (нажмите на файл → «Сохранить»). Затем нажмите «Выбрать файл» и выберите его.', rPick: 'Выбрать файл', rNo: 'Отмена',
      remind: 'Пора сделать недельную копию — данные хранятся только на этом устройстве.', remindBtn: 'Отправить в Telegram'
    }
  };
  function fill(s, p) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] != null ? p[k] : m; }); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function two(n) { return n < 10 ? '0' + n : '' + n; }

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
    bk.remindDue = function () {      // haftalik eslatma: oxirgi zaxiradan 7 kun va ≥3 kunlik ma'lumot
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

    bk.act = function (a) {
      if (a === 'bktg') { bk.tg(); return true; }
      if (a === 'bkrestore') { bk.restoreSheet(); return true; }
      if (a === 'bkpick') { if (cfg.kit) cfg.kit.closeSheet(); if (cfg.pickFile) setTimeout(cfg.pickFile, 0); return true; }
      return false;
    };
    if (typeof document !== 'undefined') document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-act^=bk]'); if (b && bk.act(b.getAttribute('data-act'), b)) e.preventDefault(); });
    return bk;
  }
  return { create: create, D: D };
});
