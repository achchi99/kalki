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
    let uz = 'Retsept (o\'rtacha uy retsepti): ' + names.map((m) => mas[m].uz).join(', ') + '. Qiymatlar: USDA FoodData Central (fdc_id ' + fdc + ')' + (two ? ' va Скурихин jadvali (ikkalasining o\'rtachasi)' : '') + '.' + (cal ? ' Uy o\'lchovi (tarozi) bilan kalibrlangan ' + r.kalibr.sana + '.' : ' Retsept o\'rtacha uy taomiga asoslangan, ±15% farq bo\'lishi mumkin; uy tarozisida hali tasdiqlanmagan' + (h && r.qaror ? '; standart qiymat foydalanuvchi qarori bilan 190 kkal' : '') + '.');
    let ru = 'Рецепт (средний домашний): ' + names.map((m) => mas[m].ru).join(', ') + '. Данные: USDA FoodData Central (fdc_id ' + fdc + ')' + (two ? ' и таблица Скурихина (среднее)' : '') + '.' + (cal ? ' Откалибровано по домашнему взвешиванию ' + r.kalibr.sana + '.' : ' Рецепт основан на среднем домашнем блюде, возможно отклонение ±15%; на домашних весах пока не подтверждено' + (h && r.qaror ? '; стандартное значение — решение пользователя, 190 ккал' : '') + '.');
    if (r.kafe) { uz += ' Kafe/choyxona porsiyasi — taxminiy, joyga qarab farq qiladi. Porsiya asosi: ' + r.kafe.asos_uz + ' (kafe menyulari odatiy vazni; rasmiy statistika yo\'q, tarozida tekshirilmagan).'; ru += ' Порция кафе/чайханы — примерная, зависит от заведения. Основа порции: ' + r.kafe.asos_ru + ' (типичный вес в меню кафе; официальной статистики нет, на весах не проверялось).'; }
    return { u: uz, r: ru };
  };
  rets.forEach((r) => { mr[r.id] = msFor(r.id); });
  /* --- yagona retseptli taomlar --- */
  for (const [id, rid] of Object.entries(fam.retseptli_oddiy)) { const f = idx[id], h = res[rid]; if (!f || !h) throw new Error('retseptli: ' + id); setVals(f, h); f.rc = rid; f.x = h.x ? 1 : 0; f.e = f.x; f.m = mr[rid].u; }
  /* --- yangi taomlar --- */
  for (const n of fam.yangi) { const h = res[n.rc]; if (!h) throw new Error('yangi: ' + n.rc); const o = { i: n.i, n: n.n, r: n.r, a: n.a, k: 0, p: 0, f: 0, c: 0, t: n.t, e: 1, u: n.u.concat([['g100', 100]]) }; setVals(o, h); o.rc = n.rc; o.x = 1; o.m = mr[n.rc].u; o.ubs = 'a'; if (n.kf) o.kf = 1; out.push(o); idx[o.i] = o; }
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
  /* --- oddiy mahsulotlar: USDA / Скурихин bilan solishtirish (nomdagi holatga mos yozuv tanlanadi) --- */
  const tk = {}, yangilangan = [];
  const R1 = (x) => Math.round(x * 10) / 10;
  for (const [id, o] of Object.entries(od)) {
    const f = idx[id]; if (!f) continue;
    const src = o.sk ? sk.yozuvlar[o.sk] : usda.foods[String(o.usda)]; if (!src) continue;
    const kk = src.kcal, rel = (f.k - kk) / Math.max(1, kk), why = o.sk ? { u: 'Скурихин jadvali («' + src.nom + '», ' + src.url.replace('https://', '') + '): ' + kk + ' kkal/100 g — bazadagi qiymat (' + f.k + ') ±10% ichida, tekshirilgan ' + date + '.', r: 'Таблица Скурихина («' + src.nom + '»): ' + kk + ' ккал/100 г — значение в базе (' + f.k + ') в пределах ±10%, проверено ' + date + '.' }
      : { u: 'USDA FoodData Central, fdc_id ' + o.usda + ' (' + src.d.replace(/"/g, '') + '): ' + kk + ' kkal/100 g — bazadagi qiymat ' + (o.yangila ? 'USDA bilan yangilandi' : '(' + f.k + ') ±10% ichida') + ', tekshirilgan ' + date + '.', r: 'USDA FoodData Central, fdc_id ' + o.usda + ': ' + kk + ' ккал/100 г — значение ' + (o.yangila ? 'в базе обновлено по USDA' : 'в базе (' + f.k + ') в пределах ±10%') + ', проверено ' + date + '.' };
    if (o.yangila && Math.abs(rel) > 0.10) { const old = f.k; f.k = Math.round(src.kcal); f.p = R1(src.p); f.f = R1(src.f); f.c = R1(src.c); f.tk = date; f.x = 0; f.e = 0; f.ms = why; f.m = 'USDA FDC ' + o.usda + ' (yangilangan ' + date + ', eski ' + old + ' kkal)'; tk[id] = 1; yangilangan.push({ id, eski: old, yangi: f.k, fdc: o.usda, d: src.d }); continue; }
    if (Math.abs(rel) <= 0.10 || (kk <= 10 && Math.abs(f.k - kk) <= 3)) { f.tk = date; tk[id] = 1; f.ms = why; if (f.x) { f.x = 0; f.e = 0; } }
    else farqlar.push({ id, baza: f.k, usda: kk, fdc: o.usda || o.sk, d: src.d || src.nom, farq: Math.round(rel * 100) });
  }
  /* --- «taxminiy»: tanlangan 150 taomdan tarozida yoki ikki manba bilan tasdiqlanmaganlar --- */
  const topSet0 = new Set(fam.top); for (const f of out) if (topSet0.has(f.i) && !f.x && !f.tk) { f.x = 1; f.e = 1; }
  /* --- b (birliklar), x, top, ms --- */
  const topSet = new Set(fam.top);
  for (const f of out) {
    const un = f.u.filter((x) => x[0] !== 'g100'); const own = f.ubs || 'b';
    f.b = un.map((x, i) => ({ k: x[0], g: x[1], d: i === 0 ? 1 : undefined, s: own }));
    if (f.x == null) f.x = f.e ? 1 : 0; f.e = f.x;
    if (topSet.has(f.i)) f.top = 1;
    if (!f.ms) { const rid = f.rc; if (rid && mr[rid]) f.ms = mr[rid]; else f.ms = { u: f.tk ? '' : 'Qiymat mavjud jadvallarga (USDA/ochiq manbalar) asoslangan; ikkinchi manba yoki tarozi bilan hali tekshirilmagan, ±15% farq bo\'lishi mumkin.', r: f.tk ? '' : 'Значение основано на существующих таблицах (USDA/открытые источники); второй источник или весы пока не проверяли, возможно отклонение ±15%.' }; if (!f.x && !f.tk) { f.ms.u = f.m || 'Mahsulot qiymati (USDA / ochiq jadvallar).'; f.ms.r = 'Значение продукта (USDA / открытые таблицы).'; } }
  }
  return { foods: out, mr, meta: { v: 2, usda: usda.meta, skurikhin: sk.meta, tekshirilgan: Object.keys(tk).length, yangilangan, farqlar, top: out.filter((f) => f.top).length } };
}
module.exports = { apply };
