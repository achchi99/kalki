/* kalki.uz — baza v2 quruvchisi: tools/ovqatlar-build.js oxirida chaqiriladi (apply). Qo'lda raqam yo'q:
 *  · retseptli taomlar va oila kombinatsiyalari qiymati — tools/baza-hisob.js (USDA FDC + Скурихин, data/baza-retseptlar.json);
 *  · oddiy mahsulotlar — mavjud qiymat; eski manba izohidagi USDA fdc_id bilan solishtiriladi (data/baza-oddiy.json): ±10% → tekshirilgan sana `tk`.
 * Yangi maydonlar (eski i,n,r,a,k,p,f,c,t,e,u,m saqlanadi): b — birliklar [{k,g,d(def),s(manba: b — mavjud baza, a — analog)}], fam — oila (omillar, grid, size, sy), al — eski id uchun alias {f,v},
 * h — qidiruvda yashirin (alias), x — «taxminiy» (e ga teng), rc — retsept id, tk — tekshirilgan sana, top — tanlangan 150 taom, ms — manba bayoni {u,r}. */
'use strict';
const fs = require('fs'), path = require('path');
const R = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));
const H = require('./baza-hisob.js');
function apply(foods) {
  const fam = R('data/baza-oilalar.json'), mas = R('data/baza-masalliq.json').masalliq, rets = R('data/baza-retseptlar.json').retseptlar, usda = R('data/manba/usda-sr-legacy.json'), od = R('data/baza-oddiy.json').oddiy, sk = R('data/manba/skurikhin.json');
  const res = Object.fromEntries(H.hisob().map((h) => [h.id, h])), rec = Object.fromEntries(rets.map((r) => [r.id, r])), date = usda.meta.yuklangan, farqlar = [];
  const out = foods.map((f) => Object.assign({}, f)), idx = Object.fromEntries(out.map((f) => [f.i, f]));
  const setVals = (f, h) => { f.k = h.k; f.p = h.p; f.f = h.f; f.c = h.c; };
  const gnum = (x) => Math.round(x * 10) / 10;
  /* --- manba bayoni (ⓘ): retsept bo'yicha --- */
  const mr = {};
  const msFor = (rid) => {
    const r = rec[rid], h = res[rid]; if (!r) return null;
    const lines = r.kalibr ? r.kalibr.ingr : r.ingr, byM = {}; lines.forEach((l) => { byM[l.m] = (byM[l.m] || 0) + l.g; });
    const names = Object.entries(byM).filter(([m]) => m !== 'suv').sort((a, b) => b[1] - a[1]).slice(0, 6).map(([m]) => m);
    const fdc = [...new Set(names.map((m) => mas[m] && mas[m].usda).filter(Boolean))].slice(0, 5).join(', ');
    const two = !!r.ikki_manba, cal = !!r.kalibr;
    const uz = 'Retsept (o\'rtacha uy retsepti): ' + names.map((m) => mas[m].uz).join(', ') + '. Qiymatlar: USDA FoodData Central (fdc_id ' + fdc + ')' + (two ? ' va Скурихин jadvali (ikkalasining o\'rtachasi)' : '') + '.' + (cal ? ' Uy o\'lchovi (tarozi) bilan kalibrlangan ' + r.kalibr.sana + '.' : ' «Taxminiy»: retsept miqdori va pishgandagi vazn taxminiy, uy tarozisida hali tasdiqlanmagan' + (h && r.qaror ? '; standart qiymat foydalanuvchi qarori bilan 190 kkal' : '') + '.');
    const ru = 'Рецепт (средний домашний): ' + names.map((m) => mas[m].ru).join(', ') + '. Данные: USDA FoodData Central (fdc_id ' + fdc + ')' + (two ? ' и таблица Скурихина (среднее)' : '') + '.' + (cal ? ' Откалибровано по домашнему взвешиванию ' + r.kalibr.sana + '.' : ' «Примерно»: количества и вес готового блюда оценочные, на домашних весах пока не подтверждены' + (h && r.qaror ? '; стандартное значение — решение пользователя, 190 ккал' : '') + '.');
    return { u: uz, r: ru };
  };
  rets.forEach((r) => { mr[r.id] = msFor(r.id); });
  /* --- yagona retseptli taomlar --- */
  for (const [id, rid] of Object.entries(fam.retseptli_oddiy)) { const f = idx[id], h = res[rid]; if (!f || !h) throw new Error('retseptli: ' + id); setVals(f, h); f.rc = rid; f.x = h.x ? 1 : 0; f.e = f.x; f.m = mr[rid].u; }
  /* --- yangi taomlar --- */
  for (const n of fam.yangi) { const h = res[n.rc]; if (!h) throw new Error('yangi: ' + n.rc); const o = { i: n.i, n: n.n, r: n.r, a: n.a, k: 0, p: 0, f: 0, c: 0, t: n.t, e: 1, u: n.u.concat([['g100', 100]]) }; setVals(o, h); o.rc = n.rc; o.x = 1; o.m = mr[n.rc].u; o.ubs = 'a'; out.push(o); idx[o.i] = o; }
  /* --- oilalar --- */
  const key = (s) => String(s).toLowerCase().replace(/[’'`‘ʻʼ´′]/g, '').replace(/\s+/g, ' ').trim();
  for (const d of fam.oilalar) {
    const base = idx[d.id]; if (!base) throw new Error('oila bazasi yo\'q: ' + d.id);
    const g = {}, uv = Object.assign({}, d.uv || {}), buN = (b) => b.u.filter((x) => x[0] !== 'g100');
    for (const c of d.grid) {
      let q = null, oldF = c.from ? idx[c.from] : null;
      if (c.rc) { const h = res[c.rc]; if (!h) throw new Error(d.id + ': retsept ' + c.rc); q = { k: h.k, p: h.p, f: h.f, c: h.c, x: h.x ? 1 : 0, rc: c.rc }; }
      else if (oldF) q = { k: oldF.k, p: oldF.p, f: oldF.f, c: oldF.c, x: oldF.e ? 1 : 0 };
      else throw new Error(d.id + ': manba yo\'q ' + c.v);
      g[c.v] = q;
      if (oldF && c.v !== d.axes.map((a) => a.d).join('.')) { const ou = buN(oldF), bu = buN(base), same = JSON.stringify(ou) === JSON.stringify(bu); if (!same && !uv[c.v]) uv[c.v] = Object.fromEntries(ou); }
    }
    const defV = d.axes.map((a) => a.d).join('.'), dq = g[defV]; if (!dq) throw new Error(d.id + ': standart kombinatsiya yo\'q ' + defV);
    // omil ko'rinishi: boshqalar standartda, shu omil bo'yicha kkal farqi > 15%
    const axes = d.axes.map((a, ai) => {
      const ks = a.o.map((o) => { const v = d.axes.map((b, bi) => (bi === ai ? o.id : b.d)).join('.'); return g[v] ? g[v].k : null; }).filter((x) => x != null);
      const spread = ks.length > 1 ? (Math.max(...ks) - Math.min(...ks)) / Math.min(...ks) : 0;
      return { i: a.id, n: a.n, r: a.r, d: a.d, s: spread > 0.15 || a.must ? 1 : 0, o: a.o.map((o) => ({ i: o.id, n: o.n, r: o.r })) };
    });
    // sinonimlar: alias (eski) yozuvlarning nomlari + qo'lda
    const sy = (d.sy || []).map((x) => ({ q: x.q, p: x.p })), have = new Set(sy.map((x) => key(x.q)));
    const names = [];
    for (const [oldId, v] of Object.entries(d.alias_old || {})) {
      const of = idx[oldId]; if (!of) throw new Error(d.id + ': eski id yo\'q ' + oldId);
      const p = {}; v.split('.').forEach((o, i) => { p[d.axes[i].id] = o; });
      [of.n, of.r].concat(of.a || []).forEach((nm) => { const k = key(nm); if (k && !have.has(k)) { have.add(k); sy.push({ q: nm, p }); } names.push(nm); });
      of.h = 1; of.al = { f: d.id, v };
    }
    base.fam = { id: d.id, ax: axes, g, uv: Object.keys(uv).length ? uv : undefined, sz: d.size ? { u: d.size.u, d: d.size.d, n: d.size.n, r: d.size.r, o: d.size.o.map((x) => ({ i: x.id, n: x.n, r: x.r, m: x.m })) } : undefined, sy, N: Object.keys(g).length };
    base.n = d.n; base.r = d.r; setVals(base, dq); base.x = dq.x; base.e = dq.x;
    if (dq.rc) base.rc = dq.rc;
    const seen = new Set([key(base.n), key(base.r)].concat((base.a || []).map(key)));
    base.a = (base.a || []).slice(); sy.forEach((x) => { const k = key(x.q); if (!seen.has(k)) { seen.add(k); base.a.push(x.q); } });
    base.m = dq.rc ? mr[dq.rc].u : base.m;
  }
  /* --- oddiy mahsulotlar: USDA bilan solishtirish --- */
  const tk = {};
  for (const [id, o] of Object.entries(od)) { const f = idx[id]; if (!f) continue; const u = usda.foods[String(o.usda)]; if (!u) continue; const rel = (f.k - u.kcal) / Math.max(1, u.kcal);
    if (Math.abs(rel) <= 0.10 || (u.kcal <= 10 && Math.abs(f.k - u.kcal) <= 3)) { f.tk = date; tk[id] = 1; f.ms = { u: 'USDA FoodData Central, fdc_id ' + o.usda + ' (' + u.d.replace(/"/g, '') + '): ' + u.kcal + ' kkal/100 g — bazadagi qiymat (' + f.k + ') ±10% ichida, tekshirilgan ' + date + '.', r: 'USDA FoodData Central, fdc_id ' + o.usda + ': ' + u.kcal + ' ккал/100 г — значение в базе (' + f.k + ') в пределах ±10%, проверено ' + date + '.' }; }
    else farqlar.push({ id, baza: f.k, usda: u.kcal, fdc: o.usda, d: u.d, farq: Math.round(rel * 100) }); }
  /* --- «taxminiy»: tanlangan 150 taomdan tarozida yoki ikki manba bilan tasdiqlanmaganlar --- */
  const topSet0 = new Set(fam.top); for (const f of out) if (topSet0.has(f.i) && !f.x && !f.tk) { f.x = 1; f.e = 1; }
  /* --- b (birliklar), x, top, ms --- */
  const topSet = new Set(fam.top);
  for (const f of out) {
    const un = f.u.filter((x) => x[0] !== 'g100'); const own = f.ubs || 'b';
    f.b = un.map((x, i) => ({ k: x[0], g: x[1], d: i === 0 ? 1 : undefined, s: own }));
    if (f.x == null) f.x = f.e ? 1 : 0; f.e = f.x;
    if (topSet.has(f.i)) f.top = 1;
    if (!f.ms) { const rid = f.rc; if (rid && mr[rid]) f.ms = mr[rid]; else f.ms = { u: f.tk ? '' : 'Mavjud baza qiymati (USDA/ochiq jadvallar asosida; ikkinchi manba yoki tarozi bilan tekshirilmagan) — «taxminiy».', r: f.tk ? '' : 'Существующее значение базы (на основе USDA/открытых таблиц; второй источник или весы не проверяли) — «примерно».' }; if (!f.x && !f.tk) { f.ms.u = f.m || 'Mahsulot qiymati (USDA / ochiq jadvallar).'; f.ms.r = 'Значение продукта (USDA / открытые таблицы).'; } }
  }
  return { foods: out, mr, meta: { v: 2, usda: usda.meta, skurikhin: sk.meta, tekshirilgan: Object.keys(tk).length, farqlar, top: out.filter((f) => f.top).length } };
}
module.exports = { apply };
