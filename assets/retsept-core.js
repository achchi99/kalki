/* kalki.uz — «Retseptimni yengillashtir»: HISOB YADROSI (UMD: brauzer, Pages Function, node testlar). AI YO'Q.
 *   - matn → masalliqlar (mahalliy, deterministik parser: alias o'zaklari, miqdor + birlik → gramm);
 *   - kkal/oqsil/yog'/uglevod — FAQAT data/retsept-masalliq.json (USDA SR Legacy) dan;
 *   - yengillashtirish — DETERMINISTIK qoidalar (yog' −40%, dumba, yog'li go'shtning bir qismi, qaymoq/mayonez → qatiq, shakar −30%, sabzavot); taomga mos kelmagani taklif qilinmaydi;
 *   - Yemaydiganlarim va cho'chqa qoidasi; retsept raqamga MOSLAB o'zgartirilmaydi (qoidalar qat'iy koeffitsientlar).
 * API: init(jadval) · parse(matn) · toGrams(id, q, birlik) · totals(items, kishi) · dishOf(items, nom) · suggest(items, ctx) · applyRule(items, rule) · applyRules(items, rules) · ID */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(); else root.KalkiRetsept = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var T = null, ALIASES = null;                             // jadval va alias indeksi
  var ROUND = function (x, s) { return Math.max(0, Math.round(x / s) * s); };

  /* ---------- matn normalizatsiyasi ---------- */
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase().replace(/[‘’ʻʼ`´ʻʼ]/g, "'").replace(/ё/g, 'е').replace(/[«»"“”()\[\]]/g, ' ').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  }
  function init(table) {
    T = table && table.masalliq ? table.masalliq : table; ALIASES = [];
    Object.keys(T).forEach(function (id) {
      var m = T[id]; (m.a || []).concat(m.r || []).forEach(function (al) { var n = norm(al); if (n) ALIASES.push({ id: id, toks: n.split(' '), len: n.length }); });
    });
    ALIASES.sort(function (a, b) { return b.toks.length - a.toks.length || b.len - a.len; });
    return T;
  }
  function tok(s) { return norm(s).replace(/(\d)\s*[-–]\s*(?=\d)/g, '$1 - ').replace(/(\d)([a-zа-я'])/g, '$1 $2').replace(/([a-zа-я'])(\d)/g, '$1 $2').split(' ').filter(Boolean); }

  /* ---------- miqdor va birlik ---------- */
  var WORDNUM = { yarim: 0.5, pol: 0.5, 'пол': 0.5, 'полтора': 1.5, bir: 1, ikki: 2, uch: 3, "to'rt": 4, besh: 5, 'один': 1, 'одна': 1, 'одну': 1, 'два': 2, 'две': 2, 'три': 3, 'четыре': 4, 'пять': 5 };
  var UNIT_RE = [
    ['kg', /^(kg|kilo|kilogramm\w*|кг|кило|килограмм\w*)$/], ['g', /^(g|gr|gramm\w*|г|гр|грамм\w*)$/], ['ml', /^(ml|millilitr\w*|мл|миллилитр\w*)$/], ['l', /^(l|litr\w*|л|литр\w*)$/],
    ['dona', /^(dona|ta|tadan|дона|шт|штук\w*|шт\.)$/], ['bosh', /^(bosh|boshcha|головк\w*|головка)$/], ['stakan', /^(stakan\w*|стакан\w*)$/],
    ['osh', /^(oshqoshiq\w*|ст\.?л\.?|столов\w*)$/], ['choy', /^(choyqoshiq\w*|ч\.?л\.?|чайн\w*)$/]
  ];
  function unitOf(tokens, i) {                                // tokens[i], ba'zan tokens[i+1] ham → { b, n } (n — nechta token)
    var t = tokens[i], t2 = tokens[i + 1];
    if (t === 'osh' && /^qoshiq/.test(t2 || '')) return { b: 'osh', n: 2 }; if (t === 'choy' && /^qoshiq/.test(t2 || '')) return { b: 'choy', n: 2 };
    if (/^qoshiq\w*$/.test(t || '')) return { b: 'osh', n: 1 };
    if (/^(столов|чайн)/.test(t || '') && /^ложк/.test(t2 || '')) return { b: /^столов/.test(t) ? 'osh' : 'choy', n: 2 };
    if (/^(ст|ч)\.?$/.test(t || '') && /^л\.?$/.test(t2 || '')) return { b: /^ст/.test(t) ? 'osh' : 'choy', n: 2 };
    if (/^(ст|ч)\.?$/.test(t || '') && /^ложк/.test(t2 || '')) return { b: /^ст/.test(t) ? 'osh' : 'choy', n: 2 };
    if (/^ложк/.test(t || '')) return { b: 'osh', n: 1 };
    for (var k = 0; k < UNIT_RE.length; k++) if (t && UNIT_RE[k][1].test(t)) return { b: UNIT_RE[k][0], n: 1 };
    return null;
  }
  function numOf(s) {
    if (/^\d+\/\d+$/.test(s)) { var a = s.split('/'); return +a[0] / +a[1]; }
    if (/^\d+(?:[.,]\d+)?$/.test(s)) return parseFloat(s.replace(',', '.'));
    return WORDNUM[s] != null ? WORDNUM[s] : null;
  }
  /* miqdor → gramm (id ma'lum bo'lsa). null — aylantirib bo'lmadi (odam gramm kiritadi) */
  function toGrams(id, q, b) {
    if (q == null || !(q >= 0)) return null; var m = T && T[id], u = (m && m.u) || {};
    if (b === 'g') return q; if (b === 'kg') return q * 1000;
    if (b === 'ml') return u.ml ? q * u.ml : null; if (b === 'l') return u.ml ? q * 1000 * u.ml : null;
    if (b === 'dona' || b === 'bosh') return u.dona ? q * u.dona : null;
    if (b === 'osh') return u.osh ? q * u.osh : null; if (b === 'choy') return u.choy ? q * u.choy : null; if (b === 'stakan') return u.stakan ? q * u.stakan : null;
    return null;
  }
  /* mahsulotning o'z birligi: ko'rsatish uchun (yog' — ml) */
  function unitName(id, lang) { var m = T && T[id]; return m && m.u && m.u.ml && /yog|sut|qatiq|qaymoq|mayonez/.test(id) ? (lang === 'ru' ? 'мл' : 'ml') : (lang === 'ru' ? 'г' : 'g'); }
  function isMl(id) { var m = T && T[id]; return !!(m && m.u && m.u.ml && id === 'yog'); }

  /* ---------- alias qidiruvi ---------- */
  function tokMatch(t, a) { if (t === a) return true; if (a.length < 2 || t.indexOf(a) !== 0) return false; return t.length - a.length <= (a.length <= 3 ? 2 : 5); }
  function findId(tokens) {
    for (var i = 0; i < ALIASES.length; i++) {
      var al = ALIASES[i], n = al.toks.length;
      for (var s = 0; s + n <= tokens.length; s++) {
        var ok = true; for (var j = 0; j < n; j++) if (!tokMatch(tokens[s + j], al.toks[j])) { ok = false; break; }
        if (ok) return al.id;
      }
    }
    return null;
  }
  var GENERIC = [{ re: /(^| )(go'sht|gosht|мясо|мяса)( |$)/, cands: ['qoy', 'mol', 'tovuq_son'] }, { re: /(^| )(yog'|yog|moy)( |$)/, cands: ['yog', 'sariyog'] }];
  var PORK = /(^|[^\p{L}])(cho'chqa|chochqa|choshqa|свинин|свин|bekon|бекон|salo|сало|ветчин)/u;
  var DEFG = { ziravor: 5, kokat: 20 };
  var SKIP = /^(suv|вода|воды|воду|tuz|соль)$/;

  /* ---------- parse ---------- */
  var KISHI_RE = /(\d+)\s*(?:kishi(?:lik|ga)?|nafar|porsiya\w*|порци\w*|человек\w*|чел\b|персон\w*)/;
  function splitChunks(body) {
    return body.split(/\n|;|(?<!\d),|,(?!\d)| va | и |\+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function parseChunk(chunk) {
    var tokens = tok(chunk), used = {}, q = null, b = null;
    for (var i = 0; i < tokens.length && q == null; i++) {
      var v = numOf(tokens[i]); if (v == null) continue;
      var isWord = WORDNUM[tokens[i]] != null, j = i + 1;
      if (!isWord && (tokens[j] === '-' || tokens[j] === '–') && numOf(tokens[j + 1] || '') != null) { v = (v + numOf(tokens[j + 1])) / 2; used[j] = used[j + 1] = true; j += 2; }     // diapazon: 1-1,5 kg
      var u = unitOf(tokens, j);
      if (isWord && !u) continue;                                                   // «bir», «ikki» faqat birlik bilan son hisoblanadi
      q = v; used[i] = true; if (u) { b = u.b; for (var k = 0; k < u.n; k++) used[j + k] = true; }
    }
    var rest = tokens.filter(function (t, idx) { return !used[idx] && !/^(ta|dona|taxminan|ca|taxm|~|шт|штук|примерно)$/.test(t) && t !== '-' && t !== '–' && t !== ':'; });
    return { q: q, b: b, rest: rest };
  }
  function parse(text) {
    var raw = String(text == null ? '' : text).slice(0, 1500), n = norm(raw), nom = '', kishi = null, body = n;
    var km = KISHI_RE.exec(n); if (km) { kishi = Math.min(40, Math.max(1, +km[1])); body = body.replace(km[0], ' '); }
    var ci = body.indexOf(':'); if (ci > -1 && ci <= 48) { nom = raw.slice(0, raw.indexOf(':')).replace(/\([^)]*\)/g, ' ').replace(new RegExp(KISHI_RE.source, 'i'), ' ').replace(/[\s,.]+/g, ' ').trim(); body = body.slice(ci + 1); }
    nom = nom.replace(/[\d]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
    var items = [], pork = PORK.test(n), id0 = 0;
    splitChunks(body).forEach(function (ch) {
      var p = parseChunk(ch), phrase = p.rest.join(' '); if (!phrase) return;
      if (PORK.test(phrase)) { return; }                                             // cho'chqa — qo'shilmaydi (ogohlantirish pork bayrog'i bilan)
      var id = findId(p.rest);
      if (id == null && SKIP.test(phrase)) return;
      var it = { n: id0++, line: ch, nom: phrase, id: id, q: p.q, b: p.b, g: null, cands: [] };
      if (id == null) { GENERIC.some(function (g) { if (g.re.test(phrase)) { it.cands = g.cands; return true; } return false; }); }
      else if (p.q != null) { var bb = p.b || (T[id].u && T[id].u.dona && p.q <= 20 ? 'dona' : 'g'), g = toGrams(id, p.q, bb); it.g = g == null ? null : Math.round(g); }
      else if (DEFG[id]) { it.g = DEFG[id]; it.est = true; }                       // miqdorsiz ziravor/ko'kat — kichik taxminiy miqdor
      items.push(it);
    });
    return { nom: nom, kishi: kishi, items: items, pork: pork, dish: dishOf(items, nom || n.slice(0, 40)) };      // taom turi — sarlavhadan (matn ichidagi «osh qoshiq» osh emas)
  }

  /* ---------- hisob ---------- */
  function totals(items, kishi) {
    var s = { k: 0, p: 0, f: 0, c: 0, g: 0 }, n = Math.max(1, Math.round(kishi) || 1);
    (items || []).forEach(function (it) { var m = it.id && T[it.id]; if (!m || !(it.g > 0)) return; var r = it.g / 100; s.k += m.k * r; s.p += m.p * r; s.f += m.f * r; s.c += m.c * r; s.g += it.g; });
    return { k: Math.round(s.k / n), p: Math.round(s.p / n), f: Math.round(s.f / n), c: Math.round(s.c / n), g: Math.round(s.g / n), tk: Math.round(s.k) };
  }

  /* ---------- taom turi ---------- */
  function dishOf(items, text) {
    var t = norm(text), has = function (id) { return items.some(function (i) { return i.id === id && i.g > 0; }); };
    if (/(^|[^\p{L}])(osh|palov|плов)([^\p{L}]|$)/u.test(t)) return 'osh'; if (/mastava|мастава/.test(t)) return 'mastava'; if (/manti|manty|манты|манти/.test(t)) return 'manti'; if (/somsa|самса/.test(t)) return 'somsa';
    if (/olivye|оливье|olivie/.test(t)) return 'olivye'; if (/sho'rva|shorva|shurpa|шурпа|(^|[^\p{L}])суп([^\p{L}]|$)/u.test(t)) return 'shorva';
    var meat = has('qoy') || has('mol') || has('tovuq_son') || has('tovuq_kokrak') || has('qoy_yogsiz') || has('mol_yogsiz');
    if (has('guruch') && has('sabzi') && meat && (has('yog') || has('dumba'))) return 'osh';
    if (has('un') && meat && has('piyoz') && !has('yog')) return 'manti';
    if (has('kartoshka') && has('tuxum') && has('mayonez')) return 'olivye';
    return 'umumiy';
  }

  /* ---------- qoidalar ---------- */
  function sumG(items, pred) { return items.reduce(function (s, i) { return s + (i.id && pred(i) && i.g > 0 ? i.g : 0); }, 0); }
  function firstBig(items, pred) { var b = null; items.forEach(function (i) { if (i.id && pred(i) && i.g > 0 && (!b || i.g > b.g)) b = i; }); return b; }
  function tagged(tag) { return function (i) { return (T[i.id].t || []).indexOf(tag) > -1; }; }
  var RULES = [
    { id: 'yog', ic: 'rdrop', taste: 0, mk: function (it, d) {
      if (d === 'olivye') return null; var o = firstBig(it, tagged('moy')); if (!o || sumG(it, tagged('moy')) < 20) return null;
      var ops = [], first = null; it.forEach(function (i) { if (i.id && tagged('moy')(i) && i.g > 0) { ops.push(['scale', i.id, 0.6]); if (!first) first = i; } });
      return { ops: ops, ref: o.id, a: o.g, b: ROUND(o.g * 0.6, 5) }; } },
    { id: 'dumba', ic: 'rfat', taste: 1, mk: function (it, d) {
      var o = firstBig(it, tagged('dumba')); if (!o || o.g < 20) return null;
      return (d === 'manti' || d === 'somsa') ? { ops: [['scale', o.id, 0.3]], ref: o.id, a: o.g, b: ROUND(o.g * 0.3, 5), mode: 'kam' } : { ops: [['zero', o.id]], ref: o.id, a: o.g, b: 0, mode: 'yoq' }; } },
    { id: 'gosht', ic: 'rleg', taste: 1, mk: function (it, d) {
      var q = firstBig(it, function (i) { return i.id === 'qoy'; }), m = firstBig(it, function (i) { return i.id === 'mol'; }), t = firstBig(it, function (i) { return i.id === 'tovuq_son'; });
      if (q && q.g >= 100) { if (d === 'manti' || d === 'somsa') return { ops: [['move', 'qoy', 0.5, 'mol_yogsiz']], ref: 'qoy', to: 'mol_yogsiz', m: ROUND(q.g * 0.5, 5), share: '1/2' }; return { ops: [['move', 'qoy', 1 / 3, 'tovuq_kokrak']], ref: 'qoy', to: 'tovuq_kokrak', m: ROUND(q.g / 3, 5), share: '1/3' }; }
      if (m && m.g >= 100) return { ops: [['move', 'mol', 0.5, 'mol_yogsiz']], ref: 'mol', to: 'mol_yogsiz', m: ROUND(m.g * 0.5, 5), share: '1/2', t0: true };
      if (t && t.g >= 100) return { ops: [['swap', 'tovuq_son', 'tovuq_kokrak']], ref: 'tovuq_son', to: 'tovuq_kokrak', m: t.g, share: '1/1' };
      return null; } },
    { id: 'qatiq', ic: 'rcup', taste: 1, mk: function (it, d) {
      var q = firstBig(it, function (i) { return i.id === 'qaymoq'; }), y = firstBig(it, function (i) { return i.id === 'mayonez'; });
      if (q && q.g >= 20) return { ops: [['swap', 'qaymoq', 'qatiq']], ref: 'qaymoq', to: 'qatiq', a: q.g, kind: 'qaymoq' };
      if (y && y.g >= 20) return { ops: [['move', 'mayonez', 0.5, 'qatiq']], ref: 'mayonez', to: 'qatiq', a: y.g, m: ROUND(y.g * 0.5, 5), kind: 'mayonez' };
      return null; } },
    { id: 'shakar', ic: 'rsugar', taste: 0, mk: function (it) { var o = firstBig(it, function (i) { return i.id === 'shakar'; }); if (!o || o.g < 20) return null; return { ops: [['scale', 'shakar', 0.7]], ref: 'shakar', a: o.g, b: ROUND(o.g * 0.7, 5) }; } },
    { id: 'sabzavot', ic: 'rcarrot', taste: 0, veg: true, mk: function (it, d) {
      if (d === 'olivye' || d === 'manti' || d === 'somsa') return null; var o = firstBig(it, function (i) { return i.id === 'sabzi'; }); if (!o || o.g < 100) return null;
      var add = Math.max(100, ROUND(o.g * 0.3, 50)); return { ops: [['add', 'sabzi', add]], ref: 'sabzi', a: o.g, b: o.g + add, add: add }; } }
  ];
  function applyRule(items, rule) {
    var l = items.map(function (i) { return Object.assign({}, i); }), find = function (id) { for (var k = 0; k < l.length; k++) if (l[k].id === id && l[k].g > 0) return l[k]; return null; };
    (rule.ops || []).forEach(function (o) {
      var it = find(o[1]); if (!it) return;
      if (o[0] === 'scale') it.g = ROUND(it.g * o[2], 5);
      else if (o[0] === 'zero') it.g = 0;
      else if (o[0] === 'add') it.g = it.g + o[2];
      else if (o[0] === 'swap') it.id = o[2];
      else if (o[0] === 'move') { var m = ROUND(it.g * o[2], 5); it.g -= m; var t = find(o[3]); if (t) t.g += m; else l.push({ n: 900 + l.length, line: '', nom: T[o[3]].uz, id: o[3], q: null, b: null, g: m, cands: [], added: true }); }
    });
    return l;
  }
  function applyRules(items, rules) { var l = items; (rules || []).forEach(function (r) { l = applyRule(l, r); }); return l; }
  var CH_MAP = { sut: 'sut', tuxum: 'tuxum', baliq: 'baliq', glyuten: 'glyuten', yongoq: 'yongoq' };
  /* suggest: ctx = { kishi, nom, yemay: ['sut', ...] } → eng foydali 3–4 qoida [{ id, ic, taste, ops, benefit, ... }] */
  function suggest(items, ctx) {
    ctx = ctx || {}; var kishi = ctx.kishi || 1, dish = ctx.dish || dishOf(items, ctx.nom || ''), avoid = (ctx.yemay || []), base = totals(items, kishi).k, out = [], vegR = null;
    RULES.forEach(function (R) {
      var r = R.mk(items, dish); if (!r) return;
      var added = (r.ops || []).map(function (o) { return o[0] === 'swap' || o[0] === 'move' ? o[o.length - 1] : null; }).filter(Boolean);
      if (added.some(function (id) { return (T[id].ch || []).some(function (c) { return avoid.indexOf(c) > -1; }); })) return;
      var rule = Object.assign({ id: R.id, ic: R.ic, taste: R.id === 'gosht' && r.t0 ? 0 : R.taste, veg: !!R.veg, dish: dish }, r);
      rule.benefit = base - totals(applyRule(items, rule), kishi).k;
      if (R.veg) { if (rule.benefit >= -30) vegR = rule; return; }
      if (rule.benefit >= 8) out.push(rule);
    });
    out.sort(function (a, b) { return b.benefit - a.benefit; }); out = out.slice(0, 4);
    if (vegR && out.length < 4) out.push(vegR);
    return out;
  }
  return { init: init, norm: norm, parse: parse, toGrams: toGrams, totals: totals, dishOf: dishOf, suggest: suggest, applyRule: applyRule, applyRules: applyRules, unitName: unitName, isMl: isMl, table: function () { return T; }, RULES: RULES };
});
