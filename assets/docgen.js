/* Kalki.uz — hujjat generatori dvigateli.
   Uchala hujjat sahifasi shu fayldan foydalanadi, har biri o'z konfiguratsiyasi bilan.
   Yangi hujjat qo'shish = yangi konfiguratsiya obyekti, yangi kod emas.

   Konfiguratsiya shakli:
   {
     id:      'ijara',                       // localStorage kaliti uchun
     file:    'ijara-shartnomasi',           // yuklab olinadigan fayl nomi
     blank:   {uz:'...docx', ru:'...docx'},  // bo'sh shablon havolasi
     sections:[{id, title:{uz,ru}, fields:[...]}],
     compute: function(v){ return {...} },   // hosilaviy qiymatlar
     doc:     function(v,c,lang){ return [bloklar] }
   }

   Bloklar: {k:'title'|'sub'|'h'|'p'|'note'|'gap'|'sig', ...}
   Bo'sh joy belgisi: matn ichida {{_20}} — 20 ta pastki chiziq.
   Ko'rinishda sariq fon bilan, hujjatda oddiy chiziq bo'lib chiqadi.
*/
(function (root) {
  'use strict';

  var KD = {};

  /* ============================ RAQAM -> SO'Z ============================ */

  var UZ_ONES = ['', 'bir', 'ikki', 'uch', "to'rt", 'besh', 'olti', 'yetti', 'sakkiz', "to'qqiz"];
  var UZ_TENS = ['', "o'n", 'yigirma', "o'ttiz", 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', "to'qson"];
  // O'zbekchada 100 va 1000 oldidan "bir" yozilmaydi (yuz, ming), lekin million/milliard oldidan yoziladi.
  var UZ_SCALE = [['', false], ['ming', false], ['million', true], ['milliard', true], ['trillion', true]];

  function uzUnder1000(n) {
    var out = [];
    var h = Math.floor(n / 100), r = n % 100;
    if (h) out.push((h > 1 ? UZ_ONES[h] + ' ' : '') + 'yuz');
    var t = Math.floor(r / 10), o = r % 10;
    if (t) out.push(UZ_TENS[t]);
    if (o) out.push(UZ_ONES[o]);
    return out.join(' ');
  }

  function uzNum2Words(n) {
    n = Math.floor(Math.abs(n));
    if (n === 0) return 'nol';
    var groups = [];
    while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }
    var parts = [];
    for (var i = groups.length - 1; i >= 0; i--) {
      var g = groups[i];
      if (!g) continue;
      var scale = UZ_SCALE[i] || ['', true];
      var word = uzUnder1000(g);
      if (scale[0]) {
        // "bir ming" emas "ming"; lekin "bir million" to'g'ri
        if (g === 1 && !scale[1]) word = '';
        parts.push((word ? word + ' ' : '') + scale[0]);
      } else {
        parts.push(word);
      }
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  var RU_ONES_M = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  var RU_ONES_F = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  var RU_TEEN = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  var RU_TENS = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  var RU_HUND = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
  // [birlik, 2-4, ko'plik, jinsi ayolmi]
  var RU_SCALE = [
    null,
    ['тысяча', 'тысячи', 'тысяч', true],
    ['миллион', 'миллиона', 'миллионов', false],
    ['миллиард', 'миллиарда', 'миллиардов', false],
    ['триллион', 'триллиона', 'триллионов', false]
  ];

  function ruPlural(n, forms) {
    var n10 = n % 10, n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return forms[0];
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
    return forms[2];
  }

  function ruUnder1000(n, fem) {
    var out = [];
    var h = Math.floor(n / 100), r = n % 100;
    if (h) out.push(RU_HUND[h]);
    if (r >= 10 && r < 20) { out.push(RU_TEEN[r - 10]); return out.join(' '); }
    var t = Math.floor(r / 10), o = r % 10;
    if (t) out.push(RU_TENS[t]);
    if (o) out.push(fem ? RU_ONES_F[o] : RU_ONES_M[o]);
    return out.join(' ');
  }

  function ruNum2Words(n) {
    n = Math.floor(Math.abs(n));
    if (n === 0) return 'ноль';
    var groups = [];
    while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }
    var parts = [];
    for (var i = groups.length - 1; i >= 0; i--) {
      var g = groups[i];
      if (!g) continue;
      var sc = RU_SCALE[i];
      parts.push(ruUnder1000(g, !!(sc && sc[3])));
      if (sc) parts.push(ruPlural(g, sc));
    }
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  }

  KD.num2words = function (n, lang) {
    return lang === 'ru' ? ruNum2Words(n) : uzNum2Words(n);
  };

  /* ============================ FORMATLASH ============================ */

  var NBSP = String.fromCharCode(160);

  KD.fmtNum = function (n) {
    if (n == null || n === '' || isNaN(n)) return '';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  };

  KD.num = function (s) {
    if (typeof s === 'number') return s;
    return parseFloat(String(s == null ? '' : s).replace(new RegExp(NBSP, 'g'), '').replace(/\s/g, '').replace(',', '.')) || 0;
  };

  KD.currency = function (lang) { return lang === 'ru' ? 'сум' : "so'm"; };

  // Valyutalar. Kurs YOZILMAYDI — konvertatsiya qilinmaydi, faqat nomi.
  KD.CUR = {
    som: { uz: "so'm", ru: 'сум' },
    usd: { uz: 'AQSH dollari', ru: 'долларов США' },
    eur: { uz: 'yevro', ru: 'евро' }
  };

  KD.curName = function (cur, lang) {
    var c = KD.CUR[cur] || KD.CUR.som;
    return lang === 'ru' ? c.ru : c.uz;
  };

  // 12500000 -> "12 500 000 (o'n ikki million besh yuz ming) so'm"
  KD.money = function (n, lang) {
    n = KD.num(n);
    if (!n) return '';
    return KD.fmtNum(n) + ' (' + KD.num2words(n, lang) + ') ' + KD.currency(lang);
  };

  // Valyutasi tanlanadigan variant: 1000 -> "1 000 (bir ming) AQSH dollari"
  KD.moneyIn = function (n, lang, cur) {
    n = KD.num(n);
    if (!n) return '';
    return KD.fmtNum(n) + ' (' + KD.num2words(n, lang) + ') ' + KD.curName(cur, lang);
  };

  // Ikki sana orasidagi kunlar soni (qarz muddati uchun)
  KD.daysBetween = function (a, b) {
    var d1 = KD.parseDate(a), d2 = KD.parseDate(b);
    if (!d1 || !d2) return 0;
    return Math.round((d2 - d1) / 86400000);
  };

  var MONTHS_UZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  KD.parseDate = function (s) {
    if (!s) return null;
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  };

  // «12» avgust 2026 yil  /  «12» августа 2026 г.
  KD.fmtDate = function (s, lang) {
    var d = KD.parseDate(s);
    if (!d) return '';
    var day = String(d.getDate());
    var mon = lang === 'ru' ? MONTHS_RU[d.getMonth()] : MONTHS_UZ[d.getMonth()];
    return String.fromCharCode(171) + day + String.fromCharCode(187) + ' ' + mon + ' ' + d.getFullYear() + (lang === 'ru' ? ' г.' : ' yil');
  };

  KD.addMonths = function (s, months) {
    var d = KD.parseDate(s);
    if (!d || !months) return null;
    var day = d.getDate();
    var r = new Date(d.getFullYear(), d.getMonth() + Math.round(months), 1);
    // oy oxiridan chiqib ketmasin (31-yanvar + 1 oy -> 28/29-fevral)
    var last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(day, last));
    return r.getFullYear() + '-' + String(r.getMonth() + 1).padStart(2, '0') + '-' + String(r.getDate()).padStart(2, '0');
  };

  /* ============================ BO'SH JOY BELGISI ============================ */

  // Matnda {{_20}} -> 20 ta pastki chiziq. Bo'sh maydonlar shu ko'rinishda qoladi.
  KD.blank = function (n) { return '{{_' + (n || 14) + '}}'; };

  // Qiymat bo'lsa o'zini, bo'lmasa bo'sh joy belgisini qaytaradi.
  KD.v = function (val, width) {
    val = (val == null ? '' : String(val)).trim();
    return val ? val : KD.blank(width);
  };

  var BLANK_RE = /\{\{_(\d+)\}\}/g;

  KD.blanksToText = function (s) {
    return String(s).replace(BLANK_RE, function (_, n) { return new Array(+n + 1).join('_'); });
  };

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  KD.blanksToHtml = function (s) {
    return escHtml(s).replace(BLANK_RE, function (_, n) {
      return '<span class="ph">' + new Array(+n + 1).join('_') + '</span>';
    });
  };

  KD.hasBlanks = function (s) { BLANK_RE.lastIndex = 0; return BLANK_RE.test(String(s)); };

  /* ============================ BANDLARNI QAYTA RAQAMLASH ============================ */

  // Shablonda bandlar "2.1.", "2.2." deb yozilgan, lekin ba'zilari shartli —
  // qiymat kiritilmasa hujjatga tushmaydi. O'shanda raqamda bo'shliq qolardi
  // (2.1 -> 2.3). Yuridik hujjatda raqam sakrashi ishonchni tushiradi, shuning
  // uchun raqamlar har render paytida ketma-ket qayta hisoblanadi.
  // Bir darajali ro'yxatlarga ("1. ", "2. ") tegilmaydi — ular sikl bilan quriladi.
  var HEAD_RE = /^\s*\d+\.\s+([\s\S]*)$/;
  var CLAUSE_RE = /^\s*\d+\.\d+\.\s+([\s\S]*)$/;

  KD.renumber = function (blocks) {
    var sec = 0, clause = 0;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (!b || !b.text) continue;
      if (b.k === 'h') {
        var mh = String(b.text).match(HEAD_RE);
        if (mh) { sec++; clause = 0; b.text = sec + '. ' + mh[1]; }
      } else if (b.k === 'p') {
        var mp = String(b.text).match(CLAUSE_RE);
        if (mp) { clause++; b.text = sec + '.' + clause + '. ' + mp[1]; }
      }
    }
    return blocks;
  };

  /* ============================ FORMA ============================ */

  function $(id) { return document.getElementById(id); }
  function L(o, lang) { return o ? (o[lang] || o.uz || '') : ''; }

  function attrEsc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  // Maydon ko'rinadimi (shartli mantiq)
  function visible(f, state) {
    return !f.showIf || !!f.showIf(state);
  }

  function fieldHtml(f, state, lang) {
    var val = state[f.id] == null ? '' : state[f.id];
    var lab = L(f.label, lang);
    var ph = attrEsc(L(f.ph, lang));
    var hint = f.hint ? '<div class="dg-hint">' + escHtml(L(f.hint, lang)) + '</div>' : '';
    var cls = 'dg-field' + (f.half ? ' dg-half' : '');
    var inner;

    if (f.t === 'seg') {
      var bs = '';
      for (var i = 0; i < f.opts.length; i++) {
        var o = f.opts[i];
        bs += '<button type="button" data-seg="' + attrEsc(f.id) + '" data-val="' + attrEsc(o.v) + '"'
          + (String(val) === String(o.v) ? ' class="on"' : '') + '>' + escHtml(L(o.label, lang)) + '</button>';
      }
      inner = '<div class="dg-seg">' + bs + '</div>';
    } else if (f.t === 'sel') {
      var os = '';
      for (var j = 0; j < f.opts.length; j++) {
        var op = f.opts[j];
        os += '<option value="' + attrEsc(op.v) + '"' + (String(val) === String(op.v) ? ' selected' : '') + '>'
          + escHtml(L(op.label, lang)) + '</option>';
      }
      inner = '<div class="dg-shell"><select data-f="' + attrEsc(f.id) + '">' + os + '</select></div>';
    } else if (f.t === 'area') {
      inner = '<div class="dg-shell"><textarea data-f="' + attrEsc(f.id) + '" rows="2" placeholder="' + ph + '">'
        + escHtml(val) + '</textarea></div>';
    } else {
      var type = f.t === 'date' ? 'date' : 'text';
      var im = f.t === 'num' ? ' inputmode="numeric"' : '';
      var unit = f.unit ? '<span class="dg-unit">' + escHtml(L(f.unit, lang)) + '</span>' : '';
      inner = '<div class="dg-shell"><input type="' + type + '" data-f="' + attrEsc(f.id) + '"' + im
        + ' value="' + attrEsc(val) + '" placeholder="' + ph + '">' + unit + '</div>';
    }
    return '<div class="' + cls + '" data-fw="' + attrEsc(f.id) + '"><label>' + escHtml(lab) + '</label>' + inner + hint + '</div>';
  }

  function renderForm(ctx) {
    var cfg = ctx.cfg, state = ctx.state, lang = ctx.lang, html = '';
    for (var s = 0; s < cfg.sections.length; s++) {
      var sec = cfg.sections[s], body = '', shown = 0;
      for (var i = 0; i < sec.fields.length; i++) {
        var f = sec.fields[i];
        if (!visible(f, state)) continue;
        body += fieldHtml(f, state, lang);
        shown++;
      }
      if (!shown) continue;
      html += '<section class="dg-sec"><div class="dg-sec-t">' + escHtml(L(sec.title, lang)) + '</div>'
        + '<div class="dg-rows">' + body + '</div></section>';
    }
    ctx.host.innerHTML = html;
    wireForm(ctx);
  }

  function wireForm(ctx) {
    var host = ctx.host;
    // matn / sana / raqam
    var ins = host.querySelectorAll('[data-f]');
    for (var i = 0; i < ins.length; i++) {
      (function (el) {
        var id = el.getAttribute('data-f');
        var fld = ctx.byId[id];
        var ev = (el.tagName === 'SELECT') ? 'change' : 'input';
        el.addEventListener(ev, function () {
          var v = el.value;
          if (fld && fld.t === 'num') {
            var digits = v.replace(/[^\d]/g, '');
            v = digits ? KD.fmtNum(parseInt(digits, 10)) : '';
            el.value = v;
          }
          ctx.state[id] = v;
          ctx.onChange(fld && fld.rerender);
        });
      })(ins[i]);
    }
    // segment tugmalari
    var segs = host.querySelectorAll('[data-seg]');
    for (var j = 0; j < segs.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          ctx.state[btn.getAttribute('data-seg')] = btn.getAttribute('data-val');
          ctx.onChange(true); // segmentning o'zi ham 'on' holatini yangilashi kerak
        });
      })(segs[j]);
    }
  }

  /* ============================ JONLI KO'RINISH ============================ */

  function blocksToHtml(blocks) {
    var h = '';
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (!b) continue;
      if (b.k === 'gap') { h += '<div class="dg-gap"></div>'; continue; }
      if (b.k === 'sig') {
        h += '<div class="dg-sig"><div>' + b.left.map(function (t) { return '<div>' + KD.blanksToHtml(t) + '</div>'; }).join('')
          + '</div><div>' + b.right.map(function (t) { return '<div>' + KD.blanksToHtml(t) + '</div>'; }).join('') + '</div></div>';
        continue;
      }
      var cls = b.k === 'title' ? 'dg-title' : b.k === 'sub' ? 'dg-sub' : b.k === 'h' ? 'dg-h' : b.k === 'note' ? 'dg-note' : 'dg-p';
      h += '<div class="' + cls + '">' + KD.blanksToHtml(b.text) + '</div>';
    }
    return h;
  }

  /* ============================ WORD (.docx) ============================ */

  var libLoading = null;
  function loadDocx() {
    if (root.docx) return Promise.resolve(root.docx);
    if (libLoading) return libLoading;
    libLoading = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = 'assets/docx.umd.min.js';
      s.async = true;
      s.onload = function () { res(root.docx); };
      s.onerror = function () { libLoading = null; rej(new Error('docx')); };
      document.head.appendChild(s);
    });
    return libLoading;
  }

  function blocksToDocx(D, blocks) {
    var out = [];
    function para(text, o) {
      o = o || {};
      return new D.Paragraph({
        alignment: o.center ? D.AlignmentType.CENTER : (o.left ? D.AlignmentType.LEFT : D.AlignmentType.JUSTIFIED),
        spacing: { after: o.after == null ? 120 : o.after, line: 276 },
        children: [new D.TextRun({ text: KD.blanksToText(text), bold: !!o.bold, italics: !!o.italic, size: o.size })]
      });
    }
    var noBorder = { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      if (!b) continue;
      if (b.k === 'title') out.push(para(b.text, { center: true, bold: true, after: 200 }));
      else if (b.k === 'sub') out.push(para(b.text, { center: true, after: 240 }));
      else if (b.k === 'h') out.push(para(b.text, { bold: true, left: true, after: 100 }));
      else if (b.k === 'note') out.push(para(b.text, { italic: true, size: 20, after: 100 }));
      else if (b.k === 'gap') out.push(para('', { after: 160 }));
      else if (b.k === 'sig') {
        out.push(new D.Table({
          width: { size: 100, type: D.WidthType.PERCENTAGE },
          borders: {
            top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
            insideHorizontal: noBorder, insideVertical: noBorder
          },
          rows: [new D.TableRow({
            children: [
              new D.TableCell({
                width: { size: 50, type: D.WidthType.PERCENTAGE },
                children: b.left.map(function (t) { return para(t, { left: true, after: 60 }); })
              }),
              new D.TableCell({
                width: { size: 50, type: D.WidthType.PERCENTAGE },
                children: b.right.map(function (t) { return para(t, { left: true, after: 60 }); })
              })
            ]
          })]
        }));
      } else out.push(para(b.text));
    }
    return out;
  }

  function buildDocx(D, blocks) {
    return new D.Document({
      styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 }, // A4
            margin: { top: 1134, bottom: 1134, left: 1701, right: 850 }
          }
        },
        children: blocksToDocx(D, blocks)
      }]
    });
  }

  function saveBlob(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  }

  function todayStamp() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ============================ HOLAT SAQLASH ============================ */

  function b64encode(obj) {
    var json = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64decode(s) {
    return JSON.parse(decodeURIComponent(escape(atob(String(s).replace(/-/g, '+').replace(/_/g, '/')))));
  }

  /* ============================ INIT ============================ */

  KD.init = function (cfg) {
    var ctx = {
      cfg: cfg,
      state: {},
      lang: document.documentElement.lang === 'ru' ? 'ru' : 'uz',
      host: $('formHost'),
      byId: {}
    };
    if (!ctx.host) return;

    for (var s = 0; s < cfg.sections.length; s++)
      for (var i = 0; i < cfg.sections[s].fields.length; i++) {
        var f = cfg.sections[s].fields[i];
        ctx.byId[f.id] = f;
        if (ctx.state[f.id] == null) ctx.state[f.id] = f.def == null ? '' : f.def;
      }

    var KEY = 'kalki_doc_' + cfg.id;

    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(ctx.state)); } catch (e) {}
    }
    function load() {
      try {
        var raw = localStorage.getItem(KEY);
        if (!raw) return false;
        var o = JSON.parse(raw);
        if (!o || typeof o !== 'object') return false;
        for (var k in o) if (ctx.byId[k]) ctx.state[k] = o[k];
        return true;
      } catch (e) { return false; }
    }

    // joriy qiymatlar: ko'rinmayotgan maydonlar hujjatga tushmaydi
    function values() {
      var v = {};
      for (var k in ctx.state) {
        var f = ctx.byId[k];
        if (f && !visible(f, ctx.state)) continue;
        v[k] = ctx.state[k];
      }
      return v;
    }

    function currentBlocks() {
      var v = values();
      var c = cfg.compute ? cfg.compute(v, ctx.lang) : {};
      // Ko'rinish va Word bitta ro'yxatdan quriladi, shuning uchun raqamlash
      // shu yerda — ikkalasida ham bir xil bo'lishi kafolatlanadi.
      return KD.renumber(cfg.doc(v, c, ctx.lang));
    }

    function renderPreview() {
      var body = $('docBody');
      if (!body) return;
      var blocks = currentBlocks();
      body.innerHTML = blocksToHtml(blocks);
      var left = $('dgLeft');
      if (left) {
        var n = 0;
        for (var i = 0; i < blocks.length; i++) {
          var b = blocks[i];
          if (!b) continue;
          if (b.k === 'sig') { n += (b.left.filter(KD.hasBlanks).length + b.right.filter(KD.hasBlanks).length); continue; }
          if (b.text && KD.hasBlanks(b.text)) n++;
        }
        left.textContent = ctx.lang === 'ru'
          ? (n ? 'Осталось заполнить: ' + n : 'Все поля заполнены')
          : (n ? "To'ldirilmagan joylar: " + n : "Hamma joy to'ldirilgan");
        left.className = 'dg-left' + (n ? '' : ' done');
      }
    }

    // Qaysi maydonlar hozir ko'rinadi — shartli mantiqni kuzatish uchun
    function visibleKey() {
      var ids = [];
      for (var s = 0; s < cfg.sections.length; s++)
        for (var i = 0; i < cfg.sections[s].fields.length; i++) {
          var f = cfg.sections[s].fields[i];
          if (visible(f, ctx.state)) ids.push(f.id);
        }
      return ids.join(',');
    }
    var lastVisible = null;

    ctx.onChange = function (force) {
      // Ko'rinadigan maydonlar to'plami o'zgargan bo'lsa, formani qayta chizamiz.
      // Shu tufayli har qanday maydon (select ham, matn ham) shartli mantiqni ishga tushira oladi.
      var key = visibleKey();
      if (force || key !== lastVisible) {
        var act = document.activeElement;
        var focusId = act && act.getAttribute ? act.getAttribute('data-f') : null;
        var pos = null;
        if (focusId && act.selectionStart != null) { try { pos = act.selectionStart; } catch (e) {} }
        lastVisible = key;
        renderForm(ctx);
        if (focusId) {
          var back = ctx.host.querySelector('[data-f="' + focusId + '"]');
          if (back) {
            try { back.focus(); if (pos != null && back.setSelectionRange) back.setSelectionRange(pos, pos); }
            catch (e) {}
          }
        }
      }
      renderPreview();
      save();
    };

    // --- til almashishi ---
    ctx.setLang = function (lang) {
      ctx.lang = lang;
      lastVisible = visibleKey();
      renderForm(ctx);
      renderPreview();
      var bl = $('blankLink');
      if (bl && cfg.blank) bl.setAttribute('href', cfg.blank[lang] || cfg.blank.uz);
    };
    root.KalkiDocSetLang = ctx.setLang;

    // --- tugmalar (idempotent: element bor bo'lsa qayta ishlatiladi, handler baribir ulanadi) ---
    var wordBtn = $('wordBtn');
    if (wordBtn) {
      wordBtn.onclick = function () {
        var btn = this, orig = btn.textContent;
        btn.disabled = true;
        btn.textContent = ctx.lang === 'ru' ? 'Готовим...' : 'Tayyorlanmoqda...';
        var done = function () { btn.disabled = false; btn.textContent = orig; };
        loadDocx().then(function (D) {
          return D.Packer.toBlob(buildDocx(D, currentBlocks())).then(function (blob) {
            saveBlob(blob, cfg.file + '-' + todayStamp() + '.docx');
            done();
          });
        })['catch'](function () {
          done();
          alert(ctx.lang === 'ru'
            ? 'Не удалось создать Word-файл. Проверьте соединение и попробуйте ещё раз.'
            : "Word faylini yasab bo'lmadi. Aloqani tekshirib, qayta urinib ko'ring.");
        });
      };
    }

    var clearBtn = $('clearBtn');
    if (clearBtn) {
      clearBtn.onclick = function () {
        var msg = ctx.lang === 'ru'
          ? 'Очистить все поля? Введённые данные будут удалены.'
          : "Barcha maydonlar tozalansinmi? Kiritilgan ma'lumotlar o'chiriladi.";
        if (!confirm(msg)) return;
        for (var k in ctx.state) {
          var f = ctx.byId[k];
          ctx.state[k] = f && f.def != null ? f.def : '';
        }
        try { localStorage.removeItem(KEY); } catch (e) {}
        renderForm(ctx);
        renderPreview();
      };
    }

    var shareBtn = $('shareBtn');
    if (shareBtn) {
      shareBtn.onclick = function () {
        var warn = ctx.lang === 'ru'
          ? 'В ссылке будут указанные вами данные (Ф.И.О., паспорт, суммы). Отправляйте только тому, кому доверяете. Продолжить?'
          : "Havolada siz kiritgan ma'lumotlar (F.I.Sh., pasport, summalar) bo'ladi. Faqat ishonchli odamga yuboring. Davom etamizmi?";
        if (!confirm(warn)) return;
        var url = location.origin + location.pathname + '?p=' + b64encode(ctx.state);
        var btn = this, orig = btn.textContent;
        if (navigator.share) {
          navigator.share({ title: document.title, url: url })['catch'](function () {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          btn.textContent = ctx.lang === 'ru' ? 'Скопировано' : 'Nusxalandi';
          setTimeout(function () { btn.textContent = orig; }, 1500);
        }
      };
    }

    // --- URL dan holatni tiklash ---
    var restored = false;
    try {
      var p = new URLSearchParams(location.search).get('p');
      if (p) {
        var o = b64decode(p);
        for (var k2 in o) if (ctx.byId[k2]) { ctx.state[k2] = o[k2]; restored = true; }
      }
    } catch (e) {}
    if (!restored) load();

    lastVisible = visibleKey();
    renderForm(ctx);
    renderPreview();

    // sahifadagi til tugmalariga ulanamiz
    ['langUz', 'langRu'].forEach(function (id) {
      var b = $(id);
      if (b) b.addEventListener('click', function () {
        setTimeout(function () { ctx.setLang(document.documentElement.lang === 'ru' ? 'ru' : 'uz'); }, 30);
      });
    });
  };

  /* ============================ SAHIFA ============================
     Har bir hujjat sahifasi shu funksiyani chaqiradi. Sahifa ichida faqat
     ma'lumot qoladi: tarjimalar (I), savol-javob (FAQ) va hujjat konfiguratsiyasi.

     KD.page({I: {...}, FAQ: {...}, CFG: {...}, titles: {uz, ru}})
  */
  KD.page = function (opts) {
    var I = opts.I, FAQ = opts.FAQ, CFG = opts.CFG;
    var lang = 'uz';

    function applyLang() {
      document.documentElement.lang = lang;
      var t = I[lang];
      var els = document.querySelectorAll('[data-i]');
      for (var i = 0; i < els.length; i++) {
        var k = els[i].getAttribute('data-i');
        if (t[k] != null) els[i].textContent = t[k];
      }
      var hs = document.querySelectorAll('[data-i-html]');
      for (var j = 0; j < hs.length; j++) {
        var k2 = hs[j].getAttribute('data-i-html');
        if (t[k2] != null) hs[j].innerHTML = t[k2];
      }
      var seo = $('seoBlock');
      if (seo) seo.innerHTML = t.seo;
      // FAQ alohida blokda: FAQPage sxemasiga faqat haqiqiy savollar tushishi uchun
      var fb = $('faqBlock');
      if (fb && FAQ) {
        var f = FAQ[lang], fh = '';
        for (var q = 0; q < f.length; q++) fh += '<h2>' + f[q][0] + '</h2><p>' + f[q][1] + '</p>';
        fb.innerHTML = fh;
      }
      var lu = $('langUz'), lr = $('langRu');
      if (lu) lu.classList.toggle('on', lang === 'uz');
      if (lr) lr.classList.toggle('on', lang === 'ru');
      if (opts.titles && opts.titles[lang]) document.title = opts.titles[lang];
      // bo'sh shablon havolasi tilga qarab
      var bl = $('blankLink');
      if (bl && CFG.blank) bl.setAttribute('href', CFG.blank[lang] || CFG.blank.uz);
    }

    var lu = $('langUz'), lr = $('langRu');
    if (lu) lu.onclick = function () { lang = 'uz'; applyLang(); };
    if (lr) lr.onclick = function () { lang = 'ru'; applyLang(); };

    applyLang();
    KD.init(CFG);

    // mobil "ko'rinishga o'tish" tugmasi
    var jb = $('jumpBtn');
    if (jb) jb.onclick = function () {
      var el = $('docPreview');
      if (!el) return;
      try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      catch (e) { el.scrollIntoView(); }
    };
  };

  root.KalkiDoc = KD;
})(typeof window !== 'undefined' ? window : this);

/* Node ostida test qilish uchun */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = (typeof window !== 'undefined' ? window : this).KalkiDoc;
}
