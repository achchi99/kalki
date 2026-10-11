/* kalki.uz — "AI ariza yozib beradi" bloki (faqat UZ ariza-namunasi; RU/CYR da ko'rinmaydi).
 *
 * Blok brauzerda ishga tushganda yaratiladi (HTML'ga statik yozilmaydi), shuning
 * uchun prerender natijasi o'zgarmaydi. Foydalanuvchi matni hech qayerda
 * saqlanmaydi (localStorage, cookie, GA) — faqat POST /api/ariza ga ketadi.
 * localStorage'da faqat tasodifiy anonim mijoz ID (limit uchun) va yozuv tanlovi saqlanadi.
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
  var CHIPS = [
    ['Bola kasal bo\'ldi', "bolam kasal bo'lib maktabga bormadi, dars qoldirgan kunlari uchun yozishim kerak"],
    ['Ishdan 2 kunga javob', "ishdan 2 kunga javob so'ramoqchiman, oilaviy ishim bor"],
    ['Ishdan bo\'shash', "o'z xohishim bilan ishdan bo'shamoqchiman"],
    ['Gaz hisobida xato', "gaz hisobimda xato bor, ko'p yozib qo'yishgan, qayta hisoblashni so'rayman"]
  ];

  if (!AI_ARIZA_YOQILGAN) return;
  if (/jsdom/i.test(navigator.userAgent || '')) return; // prerender DOM'ga kirmasin

  function ga(name, p) { try { if (typeof gtag === 'function') gtag('event', name, p || {}); } catch (e) {} }
  function $(id) { return document.getElementById(id); }
  function curUz() { return document.documentElement.lang === 'uz'; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function clientId() {
    var id = store('kalki_ai_mid');
    if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return id;
    try {
      id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx').replace(/x/g, function () { return (Math.random() * 16 | 0).toString(16); });
    } catch (e) { return ''; }
    store('kalki_ai_mid', id);
    return id;
  }

  var CSS = '.aiz{position:relative;background:linear-gradient(160deg,#F1F7F3 0%,#fff 62%);border:1.5px solid var(--cat,#155E63);border-radius:var(--radius,14px);padding:16px 16px 14px;margin:14px 0 12px;box-shadow:0 6px 22px rgba(21,94,99,.10);overflow:hidden}' +
    '.aiz:before{content:"";position:absolute;left:0;top:0;right:0;height:4px;background:linear-gradient(90deg,var(--cat,#155E63),#D99A2B)}' +
    '.aiz{scroll-margin-top:68px}.aiz[hidden]{display:none}' +
    '.aiz-head{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:2px}' +
    '.aiz-title{font-size:19px;font-weight:800;letter-spacing:-.01em;color:var(--cat-deep,#0E3B2E)}' +
    '.aiz-badge{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:#D99A2B;color:#2A1D00;border-radius:99px;padding:3px 9px}' +
    '.aiz-sub{font-size:13.5px;font-weight:600;color:var(--muted,#5C6B63);margin:5px 0 11px;line-height:1.45}' +
    '.aiz-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
    '.aiz textarea{display:block;width:100%;box-sizing:border-box;min-width:0;border:1.5px solid var(--line,#DDE5E0);border-radius:10px;background:#fff;font:inherit;font-size:15px;font-weight:600;color:var(--ink,#16211C);padding:11px 12px;resize:vertical;min-height:88px}' +
    '.aiz textarea:focus{outline:0;border-color:var(--cat,#155E63);box-shadow:0 0 0 3px rgba(21,94,99,.14)}' +
    '.aiz-cnt{font-size:11.5px;color:var(--muted,#5C6B63);text-align:right;margin-top:3px}' +
    '.aiz-chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:6px}' +
    '.aiz-chip{border:1.5px solid var(--line,#DDE5E0);background:#fff;color:var(--cat-deep,#0E3B2E);font:inherit;font-size:13px;font-weight:700;padding:7px 12px;border-radius:99px;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.aiz-chip:hover,.aiz-chip:focus-visible{border-color:var(--cat,#155E63);background:var(--cat-soft,#E3F1EF);outline:0}' +
    '.aiz-ctl{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px}' +
    '.aiz-ctl-l{font-size:12.5px;font-weight:700;color:var(--muted,#5C6B63)}' +
    '.aiz-seg{display:inline-flex;background:#EEF2EF;border-radius:10px;padding:3px;gap:3px}' +
    '.aiz-seg button{border:0;background:transparent;font:inherit;font-size:13px;font-weight:800;color:var(--muted,#5C6B63);padding:7px 13px;border-radius:8px;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.aiz-seg button.on{background:var(--cat,#155E63);color:#fff}' +
    '.aiz-go{display:block;width:100%;margin-top:12px;border:0;background:var(--cat,#155E63);color:#fff;font:inherit;font-size:16.5px;font-weight:800;padding:14px 16px;border-radius:12px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 3px 10px rgba(21,94,99,.25)}' +
    '.aiz-go:hover{filter:brightness(1.07)}.aiz-go[disabled]{cursor:default;filter:none}' +
    '.aiz-go.busy{animation:aizPulse 1.1s ease-in-out infinite}' +
    '@keyframes aizPulse{0%,100%{opacity:1}50%{opacity:.62}}' +
    '.aiz-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
    '.aiz-btn{border:1.5px solid var(--cat,#155E63);background:#fff;color:var(--cat,#155E63);font:inherit;font-size:14px;font-weight:800;padding:10px 15px;border-radius:10px;cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '.aiz-btn.pri{background:var(--cat,#155E63);color:#fff}.aiz-btn[disabled]{opacity:.6;cursor:default}.aiz-btn[hidden]{display:none}' +
    '.aiz-priv{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;margin-top:11px;font-size:12px;line-height:1.5;color:var(--muted,#5C6B63)}' +
    '.aiz-link{border:0;background:none;padding:0;font:inherit;font-size:12px;font-weight:800;color:var(--cat,#155E63);text-decoration:underline;cursor:pointer}' +
    '.aiz-note{font-size:12px;line-height:1.5;color:var(--muted,#5C6B63);margin:6px 0 0;overflow-wrap:anywhere}.aiz-note[hidden]{display:none}' +
    '.aiz-msg{font-size:13.5px;font-weight:700;line-height:1.45;margin-top:10px;overflow-wrap:anywhere}' +
    '.aiz-msg.err{color:#B04A3A}.aiz-msg.ok{color:var(--ok,#1E6B45)}.aiz-msg[hidden]{display:none}' +
    '.aiz-ask{margin-top:10px;padding:10px 12px;border:1.5px solid var(--line,#DDE5E0);border-radius:10px;background:#FFF9E8;font-size:13.5px;font-weight:700}.aiz-ask[hidden]{display:none}' +
    '.aiz-flash{animation:aizFlash 2s ease-out}' +
    '@keyframes aizFlash{0%,35%{background:#FFE9A8;box-shadow:0 0 0 3px #F2C75B}100%{background:transparent;box-shadow:0 0 0 0 transparent}}' +
    '@media (min-width:700px){.aiz-go{display:inline-block;width:auto;min-width:240px}}' +
    '@media (prefers-reduced-motion:reduce){.aiz-go.busy,.aiz-flash{animation:none}}' +
    '@media print{.aiz{display:none}}';

  function build(host) {
    var st = document.createElement('style');
    st.id = 'aizcss';
    st.textContent = CSS;
    document.head.appendChild(st);

    var sec = document.createElement('section');
    sec.className = 'aiz noprint';
    sec.id = 'aiAriza';
    var chips = CHIPS.map(function (c, i) { return '<button type="button" class="aiz-chip" data-i="' + i + '"></button>'; }).join('');
    sec.innerHTML =
      '<div class="aiz-head"><span class="aiz-title">✨ AI ariza yozib beradi</span><span class="aiz-badge">Yangi</span></div>' +
      '<p class="aiz-sub">Vaziyatingizni oddiy so\'z bilan yozing — tayyor ariza matni 5 soniyada.</p>' +
      '<label for="aizIn" class="aiz-sr">Vaziyatingizni yozing</label>' +
      '<textarea id="aizIn" maxlength="500" rows="3" placeholder="Masalan: bolam 3 kun kasal bo\'ldi, maktabga yozishim kerak"></textarea>' +
      '<div class="aiz-cnt" id="aizCnt" aria-hidden="true">0 / 500</div>' +
      '<div class="aiz-chips" id="aizChips">' + chips + '</div>' +
      '<div class="aiz-ctl"><span class="aiz-ctl-l">Yozuv:</span><span class="aiz-seg" role="group" aria-label="Ariza yozuvi">' +
      '<button type="button" data-s="lotin" class="on">Lotincha</button><button type="button" data-s="kirill">Кириллча</button></span></div>' +
      '<button type="button" class="aiz-go" id="aizGo">Ariza matnini yozish</button>' +
      '<div class="aiz-ask" id="aizAsk" hidden><span>Joriy matn almashtirilsinmi?</span> ' +
      '<span class="aiz-row" style="display:inline-flex;margin:0 0 0 6px"><button type="button" class="aiz-btn pri" id="aizYes">Ha</button>' +
      '<button type="button" class="aiz-btn" id="aizNo">Yo\'q</button></span></div>' +
      '<div class="aiz-msg" id="aizMsg" role="status" aria-live="polite" hidden></div>' +
      '<div class="aiz-row" id="aizAct"><button type="button" class="aiz-btn pri" id="aizView" hidden>Hujjatni ko\'rish</button>' +
      '<button type="button" class="aiz-btn" id="aizAgain" hidden>Boshqa variant</button>' +
      '<button type="button" class="aiz-btn" id="aizCopy" hidden>Nusxa olish</button></div>' +
      '<div class="aiz-priv"><span>Ism, telefon, pasport yozmang. Matningiz saqlanmaydi.</span>' +
      '<button type="button" class="aiz-link" id="aizMore" aria-expanded="false" aria-controls="aizNote">Batafsil</button></div>' +
      '<p class="aiz-note" id="aizNote" hidden></p>';
    host.parentNode.insertBefore(sec, host);
    $('aizNote').textContent = NOTE;
    var cs = sec.querySelectorAll('.aiz-chip');
    for (var i = 0; i < cs.length; i++) cs[i].textContent = CHIPS[i][0];
    return sec;
  }

  function init() {
    var host = $('formHost');
    if (!host || $('aiAriza')) return;
    var sec = build(host);
    var inp = $('aizIn'), cnt = $('aizCnt'), go = $('aizGo'), again = $('aizAgain'), copy = $('aizCopy'), view = $('aizView');
    var ask = $('aizAsk'), msg = $('aizMsg');
    var busy = false, lastAI = '', pending = '', script = 'lotin', userChose = false, lastBody = null;

    function show(text, cls) {
      msg.hidden = !text;
      msg.textContent = text || '';
      msg.className = 'aiz-msg' + (cls ? ' ' + cls : '');
    }
    function setBusy(b) {
      busy = b;
      go.disabled = b; again.disabled = b;
      go.classList.toggle('busy', b);
      go.textContent = b ? 'Yozilmoqda…' : 'Ariza matnini yozish';
    }
    function curField() { var ta = $('dgf-erkinMatn'); return ta ? ta.value : ''; }
    function atype() { var s = $('dgf-atype'); return s ? s.value : ''; }

    function setScript(s) {
      script = s;
      var bs = sec.querySelectorAll('.aiz-seg button');
      for (var i = 0; i < bs.length; i++) bs[i].classList.toggle('on', bs[i].getAttribute('data-s') === s);
    }
    function autoScript() {
      if (userChose) return;
      var v = inp.value;
      var letters = (v.match(/[A-Za-zЀ-ӿĀ-˿]/g) || []).length;
      var cyr = (v.match(/[Ѐ-ӿ]/g) || []).length;
      var isCyr = (letters > 0 && cyr / letters > 0.5) || /кирилл|kirill/i.test(v);
      setScript(isCyr ? 'kirill' : 'lotin');
    }

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
      again.hidden = false; copy.hidden = false; view.hidden = false;
      show('Matn tayyor. Uni o\'qib, tekshirib chiqing; bo\'sh joylarni [qavs] ichida to\'ldiring.', 'ok');
      // silliq aylantirish va 2 soniyalik ajratib ko'rsatish
      var box = (ta.closest && ta.closest('.dg-shell')) || ta;
      try { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { box.scrollIntoView(); }
      box.classList.remove('aiz-flash'); void box.offsetWidth; box.classList.add('aiz-flash');
      setTimeout(function () { box.classList.remove('aiz-flash'); }, 2100);
    }

    function deliver(text) {
      var cur = curField().trim();
      var need = atype() === 'erkin' && cur && cur !== lastAI.trim();
      if (need) { pending = text; ask.hidden = false; show('', ''); } else { put(text); }
    }

    function send(again_) {
      if (busy) return;
      var v = inp.value.trim();
      ask.hidden = true;
      if (v.length < 10 || v.length > 500) { show(E400, 'err'); ga('ai_ariza_xato', { status: 400 }); return; }
      setBusy(true); show('', '');
      ga('ai_ariza_yuborildi');
      var turi = atype();
      var body = { vaziyat: v, yozuv: script };
      if (turi && turi !== 'erkin') body.turi = turi;
      var cid = clientId();
      if (cid) body.mijoz_id = cid;
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

    inp.addEventListener('input', function () { cnt.textContent = inp.value.length + ' / 500'; autoScript(); });
    $('aizChips').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.aiz-chip');
      if (!b) return;
      inp.value = CHIPS[+b.getAttribute('data-i')][1];
      cnt.textContent = inp.value.length + ' / 500';
      autoScript();
      inp.focus({ preventScroll: true });
    });
    sec.querySelector('.aiz-seg').addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-s]');
      if (!b) return;
      userChose = true;
      setScript(b.getAttribute('data-s'));
    });
    go.addEventListener('click', function () { send(); });
    again.addEventListener('click', function () { send(true); });
    $('aizMore').addEventListener('click', function () {
      var n = $('aizNote'), open = n.hidden;
      n.hidden = !open;
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
      this.textContent = open ? 'Yopish' : 'Batafsil';
    });
    $('aizYes').addEventListener('click', function () { ask.hidden = true; put(pending); pending = ''; });
    $('aizNo').addEventListener('click', function () { ask.hidden = true; pending = ''; show('Joriy matn saqlab qolindi.', ''); });
    view.addEventListener('click', function () {
      var seg = $('viewSeg');
      if (seg && seg.offsetParent !== null) {
        var b = seg.querySelector('[data-view="preview"]');
        if (b) b.click();
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
      } else {
        var p = $('docPreview');
        if (p) { try { p.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { p.scrollIntoView(); } }
      }
    });
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

    function openFromHash() {
      if (location.hash !== '#ai' || sec.hidden) return;
      try { sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { sec.scrollIntoView(); }
      setTimeout(function () { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }, 450);
    }
    function sync() { sec.hidden = !curUz(); }
    sync();
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
