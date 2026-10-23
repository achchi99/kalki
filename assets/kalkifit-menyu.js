/* kalki.uz — KalkiFit: «Menyudan tanlash». AI (/api/kalkifit-menyu) FAQAT ajratib oladi: asl nom, bo'lim, tarkib (quyidagi lug'at kalitlari), narx + valyuta.
   Kaloriya — FAQAT bazadan (data/ovqatlar.json): 1) bo'limi mos «tayyor taom» topilsa — uning odatiy porsiyasi; 2) bo'lmasa — tarkibiy qismlardan, bo'lim
   shabloni bo'yicha gramm (deterministik) → «taxminiy». Ishonchli moslik bo'lmasa — taom tavsiyaga QO'YILMAYDI. Sous/garnir/non/ichimlik — yolg'iz tavsiya emas.
   DOM'siz: window.KalkiMenyu / require() (server ham lug'atni shu yerdan oladi). */
(function (root) {
  'use strict';
  var NOPE = /(^|[^\p{L}])(cho'chqa|chochqa|choshqa|свинин|свин|bekon|бекон|bacon|pork|ветчин|ham\b|pepperoni|пепперони|salo|сало)/iu;
  function blocked(name) { return NOPE.test(String(name || '').toLowerCase().replace(/[ʻʼ’`‘]/g, "'")); }
  /* bo'limlar */
  var BOLIM = ['zakuska', 'salat', 'shorva', 'issiq', 'garnir', 'desert', 'ichimlik', 'sous', 'non', 'boshqa'];
  var ASOSIY = { zakuska: 1, salat: 1, shorva: 1, issiq: 1 };          // tavsiya qilinadiganlar (sous/garnir/non/ichimlik/desert — yolg'iz emas)
  /* tarkib lug'ati: kalit → bazadagi taom (per 100 g) + rol; q — xom→pishgan koeffitsient (tartar: xom go'sht ≈ pishganning 0,7 kkal'i) */
  var KOMP = {
    mol_gosht: { id: 'mol-gosht', r: 'oqsil' }, mol_gosht_xom: { id: 'mol-gosht', r: 'oqsil', q: 0.7 }, qoy_gosht: { id: 'qoy-gosht', r: 'oqsil' }, tovuq: { id: 'tovuq-kokrak', r: 'oqsil' }, tovuq_son: { id: 'tovuq-son', r: 'oqsil' },
    losos: { id: 'losos', r: 'oqsil' }, baliq: { id: 'baliq-qov', r: 'oqsil' }, krevetka: { id: 'krevetka', r: 'oqsil' }, kalmar: { id: 'kalmar', r: 'oqsil' }, midiya: { id: 'midiya', r: 'oqsil' }, tuxum: { id: 'tuxum', r: 'oqsil' }, kolbasa: { id: 'kolbasa', r: 'oqsil' },
    pishloq: { id: 'pishloq', r: 'pishloq' }, feta: { id: 'pishloq-feta', r: 'pishloq' }, parmezan: { id: 'pishloq-parmezan', r: 'pishloq' },
    pomidor: { id: 'pomidor', r: 'sabzavot' }, bodring: { id: 'bodring', r: 'sabzavot' }, qalampir: { id: 'qalampir', r: 'sabzavot' }, piyoz: { id: 'piyoz', r: 'sabzavot' }, sabzi: { id: 'sabzi', r: 'sabzavot' }, karam: { id: 'karam', r: 'sabzavot' },
    salat_barg: { id: 'salat-barg', r: 'sabzavot' }, qoziqorin: { id: 'qoziqorin-qaynatilgan', r: 'sabzavot' }, zaytun: { id: 'zaytun', r: 'sabzavot' }, baqlajon: { id: 'baqlajon', r: 'sabzavot' }, lavlagi: { id: 'lavlagi', r: 'sabzavot' },
    ismaloq: { id: 'ismaloq', r: 'sabzavot' }, brokkoli: { id: 'brokkoli', r: 'sabzavot' }, avokado: { id: 'avokado', r: 'sabzavot' }, makkajoxori: { id: 'makkajoxori', r: 'sabzavot' }, loviya: { id: 'loviya', r: 'garnir' },
    kartoshka: { id: 'kartoshka', r: 'garnir' }, kartoshka_pyure: { id: 'kartoshka-pyure', r: 'garnir' }, kartoshka_fri: { id: 'kartoshka-fri', r: 'garnir' }, guruch: { id: 'guruch', r: 'garnir' }, makaron: { id: 'makaron', r: 'garnir' }, grechka: { id: 'grechka', r: 'garnir' }, bulgur: { id: 'bulgur', r: 'garnir' },
    mayonez: { id: 'mayonez', r: 'sous' }, tartar_sous: { id: 'tartar-sous', r: 'sous' }, smetana: { id: 'smetana', r: 'sous' }, qaymoq: { id: 'qaymoq', r: 'sous' }, soya_sous: { id: 'soya-sous', r: 'sous' }, pesto: { id: 'pesto', r: 'sous' },
    ketchup: { id: 'ketchup', r: 'sous' }, zaytun_yogi: { id: 'zaytun-yogi', r: 'yog' }, sariyog: { id: 'sariyog', r: 'yog' },
    non: { id: 'non', r: 'non' }, limon: { id: 'limon', r: 'sabzavot' }, yongoq: { id: 'yongoq', r: 'yong' }
  };
  /* bo'lim shablonlari (porsiya, g): rol → gramm (sabzavot — har biriga, jami cheklangan) */
  var SHABLON = {
    salat: { oqsil: 80, pishloq: 40, sabzavot: 45, garnir: 40, sous: 15, yog: 10, non: 15, yong: 10, maxSab: 180 },
    zakuska: { oqsil: 120, pishloq: 30, sabzavot: 20, garnir: 40, sous: 20, yog: 8, non: 30, yong: 10, maxSab: 60 },
    issiq: { oqsil: 170, pishloq: 30, sabzavot: 40, garnir: 180, sous: 40, yog: 10, non: 30, yong: 10, maxSab: 120 },
    shorva: { oqsil: 50, pishloq: 20, sabzavot: 30, garnir: 40, sous: 15, yog: 5, non: 20, yong: 5, maxSab: 120, suv: 150 }
  };
  /* bazadagi taomning bo'limi */
  var RE = { salat: /salat|салат|achichuk|ачичук|vinegret|винегрет|olivye|оливье|jajik|cacik|kisir/i, shorva: /sho'?rva|shurva|shorva|сорпа|суп|борщ|borsch|щи|солянк|mastava|мастава|uxa\b|уха|kesma|mampar|unash|moshxo'?rda|bulyon|бульон|krem-sup|крем-суп|chalop|окрошк/i };
  function dbBolim(f) {
    if (!f) return 'boshqa'; var s = [f.id, f.n, f.r].concat(f.a || []).join(' ');
    if (RE.shorva.test(s)) return 'shorva'; if (RE.salat.test(s) && f.id !== 'salat-barg') return 'salat';
    switch (f.t) { case 'i': return 'ichimlik'; case 'h': return 'desert'; case 'n': return 'non'; case 'g': return 'garnir'; case 'x': return /sous|соус|ketchup|mayonez|майонез/i.test(s) ? 'sous' : 'boshqa'; case 'v': case 'f': case 's': case 'd': return 'boshqa'; default: return 'issiq'; }
  }
  var MOS = { salat: { salat: 1 }, shorva: { shorva: 1 }, issiq: { issiq: 1 }, zakuska: { zakuska: 1, issiq: 1, salat: 1 }, garnir: { garnir: 1 }, desert: { desert: 1 }, ichimlik: { ichimlik: 1 }, sous: { sous: 1 }, non: { non: 1 }, boshqa: {} };
  function isDish(f) { return f && (f.t === 'o' || f.t === 'q' || f.t === 'h' || dbBolim(f) === 'salat' || dbBolim(f) === 'shorva'); }          // «tayyor taom» (masalliq emas)
  function mains(tk) { var n = 0; (tk || []).forEach(function (k) { var c = KOMP[k]; if (c && (c.r === 'oqsil' || c.r === 'garnir' || c.r === 'sous' || c.r === 'pishloq')) n++; }); return n; }
  /* tarkibdan yig'ish → { g, k, p, f, c, ids } | null */
  function yigish(it, byId) {
    var sh = SHABLON[it.bolim]; if (!sh) return null; var tk = (it.tarkib || []).filter(function (k) { return KOMP[k] && byId(KOMP[k].id); });
    var unknown = (it.tarkib || []).length - tk.length; if (!tk.length || unknown > 1) return null;
    var hasMain = tk.some(function (k) { return KOMP[k].r === 'oqsil'; }) || (it.bolim === 'salat' && tk.length >= 3) || (it.bolim === 'shorva' && tk.length >= 2); if (!hasMain) return null;
    var sab = tk.filter(function (k) { return KOMP[k].r === 'sabzavot'; }).length, sabG = sab ? Math.min(sh.sabzavot, Math.floor(sh.maxSab / sab)) : 0, t = { g: 0, k: 0, p: 0, f: 0, c: 0, ids: [] };
    tk.forEach(function (k) {
      var c = KOMP[k], f = byId(c.id), g = c.r === 'sabzavot' ? sabG : (sh[c.r] || 20), q = c.q || 1; if (!f) return;
      t.g += g; t.k += f.k * g / 100 * q; t.p += (f.p || 0) * g / 100; t.f += (f.f || 0) * g / 100 * q; t.c += (f.c || 0) * g / 100; t.ids.push(c.id);
    });
    if (sh.suv) t.g += sh.suv;          // sho'rva suyuqligi (kkal 0)
    return { g: Math.round(t.g / 5) * 5, k: Math.round(t.k), p: Math.round(t.p * 10) / 10, f: Math.round(t.f * 10) / 10, c: Math.round(t.c * 10) / 10, ids: t.ids };
  }
  function mainId(it) { var best = null; (it.tarkib || []).forEach(function (k) { var c = KOMP[k]; if (c && !best && c.r === 'oqsil') best = c.id; }); return best; }
  /* bitta taom → tavsiya nomzodi yoki null. ctx: { byId(id), match(nom) → baza taomi|null, portion(f) → { g, k, p, f, c, u?, n? } } */
  function plan(it, ctx) {
    if (!it || !ASOSIY[it.bolim] || blocked(it.asl) || blocked(it.nom)) return null;
    var f = ctx.match(it.nom) || ctx.match(it.asl), ok = f && MOS[it.bolim][dbBolim(f)] && (isDish(f) || mains(it.tarkib) <= 1) && !blocked(f.n) && !blocked(f.r);
    if (ok) { var p = ctx.portion(f); if (p && p.k > 0) return { asl: it.asl, nom: it.nom, bolim: it.bolim, src: 'baza', fid: f.id, dbNom: f.n, dbNomRu: f.r, g: p.g, k: p.k, p: p.p, f: p.f, c: p.c, u: p.u, n: p.n, est: false, narx: it.narx, valyuta: it.valyuta, ifid: f.id }; }
    var y = yigish(it, ctx.byId); if (!y || !(y.k > 0)) return null;
    return { asl: it.asl, nom: it.nom, bolim: it.bolim, src: 'tarkib', fid: null, dbNom: it.nom, g: y.g, k: y.k, p: y.p, f: y.f, c: y.c, est: true, narx: it.narx, valyuta: it.valyuta, ifid: '', ids: y.ids };          // yig'ilgan taom — rasm emas, toifa ikonkasi
  }
  function sifat(c) { return c.k > 0 ? c.p * 100 / c.k : 0; }          // oqsil g / 100 kkal
  /* tavsiya: qoldiqqa sig'adigan, turli bo'limlardan (boshlovchi: salat/sho'rva/zakuska + issiq), oqsilga boy ustun; ≤ 3. why: oqsil | yengil | sigadi */
  function pick(cands, rem, ch) {
    ch = ch || { oqsil: 12, yengil: 0.8 }; var seen = {}, all = [];
    (cands || []).forEach(function (c) { if (!c || !(c.k > 0) || !ASOSIY[c.bolim] || blocked(c.asl) || seen[c.asl]) return; if (c.ok === false) return; seen[c.asl] = 1; all.push(c); });
    if (!all.length) return [];
    var fits = rem != null && rem > 0 ? all.filter(function (c) { return c.k <= rem; }) : [], pool = fits.length ? fits : all.slice().sort(function (a, b) { return a.k - b.k; }).slice(0, 3);
    var mean = all.reduce(function (a, c) { return a + c.k; }, 0) / all.length, out = [], used = {};
    var why = function (c) { return sifat(c) >= ch.oqsil ? 'oqsil' : (all.length > 1 && c.k <= mean * ch.yengil ? 'yengil' : (fits.length ? 'sigadi' : 'yengil')); };
    var take = function (c) { if (!c || used[c.asl]) return; used[c.asl] = 1; out.push(Object.assign({}, c, { why: why(c) })); };
    var best = function (list) { return list.filter(function (c) { return !used[c.asl]; }).sort(function (a, b) { return sifat(b) - sifat(a) || (a.est - b.est) || a.k - b.k; })[0]; };
    var hot = pool.filter(function (c) { return c.bolim === 'issiq'; }), st = pool.filter(function (c) { return c.bolim !== 'issiq'; });
    var h = best(hot); take(h);
    var left = h && rem > 0 ? rem - h.k : rem, st2 = st.filter(function (c) { return left == null || left <= 0 || c.k <= left; });
    take(best(st2.length ? st2 : st));
    var rest = pool.filter(function (c) { return !used[c.asl] && !out.some(function (o) { return o.bolim === c.bolim; }); }); take(best(rest.length ? rest : pool));
    return out.slice(0, 3);
  }
  /* narx: valyuta menyudan; aniqlanmasa — ko'rsatilmaydi */
  var VAL = { UZS: { uz: " so'm", ru: ' сум' }, RUB: ' ₽', USD: '$', EUR: ' €', KZT: ' ₸' };
  function nf(n, d) { var s = (Math.round(n * 100) / 100).toFixed(d ? 2 : 0).replace(/\.00$/, ''); var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return p.join(','); }
  function narxTxt(n, lang, val) {
    n = +n; if (!(n > 0) || !val || !VAL[val]) return ''; if (val === 'UZS') return n >= 100 ? nf(Math.round(n)) + VAL.UZS[lang === 'ru' ? 'ru' : 'uz'] : '';
    var dec = Math.round(n) !== n; return val === 'USD' ? '$' + nf(n, dec) : nf(n, dec) + VAL[val];
  }
  /* «Yemaydiganlarim» — tarkib kalitlari bo'yicha (bazadagi teglar bilan bir xil ma'no) */
  var TEG = { baliq: ['losos', 'baliq', 'krevetka', 'kalmar', 'midiya'], tuxum: ['tuxum', 'mayonez', 'tartar_sous'], sut: ['pishloq', 'feta', 'parmezan', 'qaymoq', 'smetana', 'sariyog', 'pesto'], yongoq: ['yongoq', 'pesto'], glyuten: ['non', 'makaron', 'bulgur'] };
  function tegOk(tarkib, yemay) { return !(yemay || []).some(function (t) { return (TEG[t] || []).some(function (k) { return (tarkib || []).indexOf(k) > -1; }); }); }
  var api = { tegOk: tegOk, TEG: TEG, pick: pick, plan: plan, yigish: yigish, dbBolim: dbBolim, blocked: blocked, narxTxt: narxTxt, KOMP: KOMP, BOLIM: BOLIM, ASOSIY: ASOSIY, SHABLON: SHABLON };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiMenyu = api;
})(typeof window !== 'undefined' ? window : this);
