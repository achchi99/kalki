/* kalki.uz — "AI yordamida matn yozish" bloki (faqat UZ ariza-namunasi).
 *
 * Blok brauzerda ishga tushganda yaratiladi (HTML'ga statik yozilmaydi), shuning
 * uchun prerender natijasi o'zgarmaydi. Foydalanuvchi matni hech qayerda
 * saqlanmaydi (localStorage, cookie, GA) — faqat POST /api/ariza ga ketadi.
 *
 * O'chirish: quyidagi AI_ARIZA_YOQILGAN ni false qiling (yoki shu <script> tegini oling).
 */
(function () {
  'use strict';
  var AI_ARIZA_YOQILGAN = true;

  var NOTE = "Vaziyatni oddiy so'zlar bilan yozing. Ism, telefon va pasport ma'lumotini yozmang — ular kerak emas. Kalki matningizni saqlamaydi; u faqat ariza matnini tayyorlash uchun AI xizmatiga yuboriladi. AI qonun moddalari va raqamlarni qo'shmaydi — tayyor matnni o'qib, tekshirib chiqing.";
  var E502 = "Hozircha matn tayyorlab bo'lmadi. Birozdan so'ng urinib ko'ring.";
  var E400 = "Vaziyatni 10–500 belgi oralig'ida yozing.";
  var REJECT = "Bu yordamchi faqat ariza matnini yozadi. Vaziyatingizni boshqacha tasvirlab ko'ring.";

  if (!AI_ARIZA_YOQILGAN) return;
  if (/jsdom/i.test(navigator.userAgent || '')) return; // prerender DOM'ga kirmasin

  function ga(name, p) { try { if (typeof gtag === 'function') gtag('event', name, p || {}); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function curUz() { return document.documentElement.lang === 'uz'; }

  var CSS = '.aiz{background:var(--card,#fff);border:1.5px solid var(--cat,#0E3B2E);border-radius:var(--radius,14px);padding:14px 15px 16px;margin:14px 0 12px}' +
    '.aiz[hidden]{display:none}' +
    '.aiz-t{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent,#155E63);margin-bottom:10px}' +
    '.aiz label{display:block;font-size:12.5px;font-weight:700;color:var(--muted,#5C6B63);margin-bottom:5px}' +
    '.aiz textarea{display:block;width:100%;box-sizing:border-box;min-width:0;border:1.5px solid var(--line,#DDE5E0);border-radius:10px;background:#FBFCFB;font:inherit;font-size:15px;font-weight:600;color:var(--ink,#16211C);padding:10px 11px;resize:vertical;min-height:84px}' +
    '.aiz textarea:focus{outline:0;border-color:var(--cat,#0E3B2E)}' +
    '.aiz-cnt{font-size:11.5px;color:var(--muted,#5C6B63);text-align:right;margin-top:3px}' +
    '.aiz-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
    '.aiz-btn{border:1.5px solid var(--cat,#0E3B2E);background:var(--cat,#0E3B2E);color:#fff;font:inherit;font-size:14px;font-weight:800;padding:10px 16px;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.aiz-btn.alt{background:#fff;color:var(--cat,#0E3B2E)}' +
    '.aiz-btn[disabled]{opacity:.6;cursor:default}' +
    '.aiz-note{font-size:12px;line-height:1.5;color:var(--muted,#5C6B63);margin-top:10px;overflow-wrap:anywhere}' +
    '.aiz-msg{font-size:13.5px;font-weight:700;line-height:1.45;margin-top:10px;overflow-wrap:anywhere}' +
    '.aiz-msg.err{color:#B04A3A}.aiz-msg.ok{color:var(--ok,#1E6B45)}' +
    '.aiz-ask{margin-top:10px;padding:10px 12px;border:1.5px solid var(--line,#DDE5E0);border-radius:10px;background:#FFF9E8;font-size:13.5px;font-weight:700}' +
    '.aiz-ask[hidden],.aiz-msg[hidden]{display:none}@media print{.aiz{display:none}}';

  function build(host) {
    var st = document.createElement('style');
    st.id = 'aizcss';
    st.textContent = CSS;
    document.head.appendChild(st);

    var sec = document.createElement('section');
    sec.className = 'aiz noprint';
    sec.id = 'aiAriza';
    sec.innerHTML =
      '<div class="aiz-t">AI yordamida matn yozish</div>' +
      '<label for="aizIn">Vaziyatingizni yozing</label>' +
      '<textarea id="aizIn" maxlength="500" rows="3" placeholder="Masalan: bolam 3 kun kasal bo\'ldi, maktabga yozishim kerak"></textarea>' +
      '<div class="aiz-cnt" id="aizCnt" aria-hidden="true">0 / 500</div>' +
      '<div class="aiz-row"><button type="button" class="aiz-btn" id="aizGo">Matnni yozish</button>' +
      '<button type="button" class="aiz-btn alt" id="aizAgain" hidden>Boshqa variant</button>' +
      '<button type="button" class="aiz-btn alt" id="aizCopy" hidden>Nusxa olish</button></div>' +
      '<div class="aiz-ask" id="aizAsk" hidden><span>Joriy matn almashtirilsinmi?</span> ' +
      '<span class="aiz-row" style="display:inline-flex;margin:0 0 0 6px"><button type="button" class="aiz-btn" id="aizYes">Ha</button>' +
      '<button type="button" class="aiz-btn alt" id="aizNo">Yo\'q</button></span></div>' +
      '<div class="aiz-msg" id="aizMsg" role="status" aria-live="polite" hidden></div>' +
      '<p class="aiz-note" id="aizNote"></p>';
    host.parentNode.insertBefore(sec, host);
    $('aizNote').textContent = NOTE;
    return sec;
  }

  function init() {
    var host = $('formHost');
    if (!host || $('aiAriza')) return;
    var sec = build(host);
    var inp = $('aizIn'), cnt = $('aizCnt'), go = $('aizGo'), again = $('aizAgain'), copy = $('aizCopy');
    var ask = $('aizAsk'), msg = $('aizMsg');
    var busy = false, lastAI = '', pending = '';

    function show(text, cls) {
      msg.hidden = !text;
      msg.textContent = text || '';
      msg.className = 'aiz-msg' + (cls ? ' ' + cls : '');
    }
    function setBusy(b) {
      busy = b;
      go.disabled = b; again.disabled = b;
      go.textContent = b ? 'Yozilmoqda...' : 'Matnni yozish';
    }
    function curField() { var ta = $('dgf-erkinMatn'); return ta ? ta.value : ''; }
    function atype() { var s = $('dgf-atype'); return s ? s.value : ''; }

    function put(text) {
      var sel = $('dgf-atype');
      if (!sel) { show(E502, 'err'); return; }
      if (sel.value !== 'erkin') {
        sel.value = 'erkin';
        var ev = document.createEvent('HTMLEvents');
        ev.initEvent('change', true, false);
        sel.dispatchEvent(ev);
      }
      var ta = $('dgf-erkinMatn');
      if (!ta) { show(E502, 'err'); return; }
      ta.value = text;
      var ev2 = document.createEvent('HTMLEvents');
      ev2.initEvent('input', true, false);
      ta.dispatchEvent(ev2);
      lastAI = text;
      again.hidden = false; copy.hidden = false;
      show('Matn tayyor. Uni o\'qib, tekshirib chiqing; bo\'sh joylarni [qavs] ichida to\'ldiring.', 'ok');
    }

    function deliver(text) {
      var cur = curField().trim();
      var need = atype() === 'erkin' && cur && cur !== lastAI.trim();
      if (need) { pending = text; ask.hidden = false; show('', ''); } else { put(text); }
    }

    function send() {
      if (busy) return;
      var v = inp.value.trim();
      ask.hidden = true;
      if (v.length < 10 || v.length > 500) { show(E400, 'err'); ga('ai_ariza_xato', { status: 400 }); return; }
      setBusy(true); show('', '');
      ga('ai_ariza_yuborildi');
      var turi = atype();
      var body = { vaziyat: v };
      if (turi && turi !== 'erkin') body.turi = turi;
      fetch('/api/ariza', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (o) {
          setBusy(false);
          if (o.s === 200 && o.j && o.j.rad) { show(REJECT, 'err'); ga('ai_ariza_rad'); return; }
          if (o.s === 200 && o.j && typeof o.j.matn === 'string' && o.j.matn) { ga('ai_ariza_tayyor'); deliver(o.j.matn); return; }
          show((o.j && o.j.xato) || E502, 'err');
          ga('ai_ariza_xato', { status: o.s });
        })
        .catch(function () { setBusy(false); show(E502, 'err'); ga('ai_ariza_xato', { status: 502 }); });
    }

    inp.addEventListener('input', function () { cnt.textContent = inp.value.length + ' / 500'; });
    go.addEventListener('click', send);
    again.addEventListener('click', send);
    $('aizYes').addEventListener('click', function () { ask.hidden = true; put(pending); pending = ''; });
    $('aizNo').addEventListener('click', function () { ask.hidden = true; pending = ''; show('Joriy matn saqlab qolindi.', ''); });
    copy.addEventListener('click', function () {
      var text = curField() || lastAI;
      function done() { var o = 'Nusxa olish'; copy.textContent = 'Nusxalandi'; setTimeout(function () { copy.textContent = o; }, 1500); }
      function fb() {
        try {
          var ta = document.createElement('textarea');
          ta.value = text; ta.setAttribute('readonly', '');
          ta.style.cssText = 'position:fixed;left:-9999px;top:0';
          document.body.appendChild(ta); ta.focus(); ta.select();
          var ok = document.execCommand('copy'); document.body.removeChild(ta);
          if (ok) done();
        } catch (e) {}
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done)['catch'](fb); else fb();
    });

    function sync() { sec.hidden = !curUz(); }
    sync();
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
