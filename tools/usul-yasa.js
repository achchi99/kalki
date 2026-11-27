/* kalki.uz — v107 TAYYORLASH USULI quruvchisi (tools/ovqatlar-build.js ichida chaqiriladi; qo'lda raqam yo'q). Manba: data/baza-usul.json, hujjat: docs/tayyorlash-usuli.md.
 * Model (100 g PISHGAN taom uchun): langar (mavjud USDA/yorliq/retsept qiymati, usul m0) → xom asos → boshqa usul m:
 *   xom: oqsil/uglevod/kletchatka/«yog'siz kkal» × Y0;  o'z yog'i = (f0 − A0) × Y0 / FR0
 *   m:   x / Y;  yog' = o'z yog'i × FR / Y + A;  kkal = yog'siz kkal / Y + 9 × yog'
 *   Y — pishgan/xom og'irlik (USDA Table of Cooking Yields 2014; Bognár 2002), A — shimilgan yog' g / 100 g pishgan (tova 5–10, chuqur yog' 10–15, duxovka 1–3, aerogril 0–2, bug'/qaynatish 0),
 *   Aralash mahsulotda (kotlet, xamir, sirniki, panirovka, chuchvara — sinf.ulush 0,6) shimilgan yog' ko'pi bilan langar yog'ining 60 % i (qolgani — o'z yog'i); butun mahsulotda (USDA «dry heat» — yog'siz) — langar yog'igacha; «asos» — hisob manbasi (sabzavot/kartoshka: qaynatilgan).
 *   FR — o'z yog'ining saqlanishi (gril/mangalda yog' tomadi; USDA Nutrient Retention Factors R6, 2007).
 * Hisoblanadigan usul eng YAQIN langardan (data «yaqin»): aerogril — duxovkadan, chuqur — tovadan, bug' — qaynatilgandan …
 * Tartib (build'da tekshiriladi, buzilsa — xato): chuqur yog' > tova > duxovka ≥ aerogril ≥ bug'/qaynatish. */
'use strict';
const fs = require('fs'), path = require('path');
const U = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'baza-usul.json'), 'utf8'));
const r1 = (x) => Math.round(x * 10) / 10;
function cfg(sinf, m) {
  const s = U.sinf[sinf]; if (!s) throw new Error('usul: sinf yo\'q ' + sinf); if (s.Y[m] == null) throw new Error('usul: ' + sinf + ' sinfida «' + m + '» uchun hosil (Y) yo\'q');
  return { Y: s.Y[m], A: (s.A && s.A[m]) || 0, FR: (s.FR && s.FR[m]) || 1 };
}
/* langar katakchasi (m0) → usul m katakchasi */
function hisob(cell, m0, m, sinf) {
  const a = cfg(sinf, m0), b = cfg(sinf, m), f0 = +cell.f || 0, A0 = Math.min(a.A, f0 * (U.sinf[sinf].ulush || 1));
  const fRaw = Math.max(0, (f0 - A0) * a.Y / a.FR), nf = Math.max(0, (+cell.k || 0) - 9 * f0) * a.Y;
  const sc = a.A > 0 ? A0 / a.A : 1, f = fRaw * b.FR / b.Y + b.A * sc, k = nf / b.Y + 9 * f;
  const out = { k: Math.round(k), p: r1((+cell.p || 0) * a.Y / b.Y), f: r1(f), c: r1((+cell.c || 0) * a.Y / b.Y), x: 1 };
  if (cell.fb !== undefined) out.fb = cell.fb == null ? null : r1(cell.fb * a.Y / b.Y);
  return out;
}
/* tartib: {usul: kkal} → buzilishlar */
function tartibXato(byU) {
  const T = U.tartib, us = Object.keys(byU).filter((u) => T[u]), bad = [];
  for (const a of us) for (const b of us) { if (T[a] <= T[b]) continue; const strict = T[a] >= 4 && T[b] >= 3;          // chuqur > tova > duxovka (qat'iy); duxovka ≥ aerogril ≥ bug'/qaynatish
    if (strict ? !(byU[a] > byU[b]) : !(byU[a] >= byU[b])) bad.push(a + ' (' + byU[a] + ') ' + (strict ? '>' : '≥') + ' ' + b + ' (' + byU[b] + ')'); }
  return bad;
}
const val = (f) => { const o = { k: f.k, p: f.p, f: f.f, c: f.c, x: f.x ? 1 : 0 }; if (f.fb !== undefined) o.fb = f.fb; return o; };
const opt = (m) => { const d = U.usullar[m]; if (!d) throw new Error('usul: noma\'lum ' + m); return { i: m, n: d.n, r: d.r, l: d.l, lr: d.lr, u: m }; };
const AX = (d, list) => ({ i: 'usul', n: 'Tayyorlash usuli', r: 'Способ приготовления', d, s: 1, m: 1, o: list.map(opt) });
const nearest = (m, known) => (U.yaqin[m] || []).find((x) => known[x]) || null;
const unitsOf = (f) => f.u.filter((x) => x[0] !== 'g100');
const NOTE = { u: " Boshqa tayyorlash usullari (duxovka, aerogril, bug', tova …) mavjud qiymatdan xom asos + USDA pishirish hosili + yog' shimilishi bo'yicha hisoblangan (taxminiy, docs/tayyorlash-usuli.md).", r: ' Другие способы приготовления (духовка, аэрогриль, пар, сковорода …) рассчитаны от известного значения: сырьё + выход по USDA + впитанный жир (ориентировочно).' };
function apply(foods) {
  const idx = Object.fromEntries(foods.map((f) => [f.i, f])), rep = { guruh: {}, taomlar: [], hisoblangan: 0, langar: 0, xato: [] };
  const key = (s) => String(s).toLowerCase().replace(/[’'`‘ʻʼ´′]/g, '').replace(/\s+/g, ' ').trim();
  const addSy = (fam, base, names, p) => { const have = new Set(fam.sy.map((x) => key(x.q)).concat([key(base.n), key(base.r)])); names.forEach((nm) => { const k = key(nm); if (k && !have.has(k)) { have.add(k); fam.sy.push({ q: nm, p }); } }); };
  const addA = (base, names) => { base.a = base.a || []; const have = new Set([base.n, base.r].concat(base.a).map(key)); names.forEach((nm) => { const k = key(nm); if (k && !have.has(k)) { have.add(k); base.a.push(nm); } }); };
  const check = (id, byU) => { const b = tartibXato(byU); if (b.length) rep.xato.push(id + ': ' + b.join('; ')); };
  const note = (f) => { if (f.ms && f.ms.u && f.ms.u.indexOf('tayyorlash usullari') < 0) f.ms = { u: f.ms.u + NOTE.u, r: (f.ms.r || '') + NOTE.r }; };
  /* 1. yakka taom → oila (bitta o'q: usul) */
  for (const G of U.guruhlar) {
    const f = idx[G.id]; if (!f) throw new Error('usul: taom yo\'q ' + G.id); if (f.fam) throw new Error('usul: ' + G.id + ' allaqachon oila — «oilalar» bo\'limiga yozing');
    if (G.usul.indexOf(G.d) < 0) throw new Error('usul: ' + G.id + ' standart usul ro\'yxatda yo\'q');
    const known = { [G.d]: val(f) }, uv = {}, oldN = [f.n, f.r];
    for (const [m, aid] of Object.entries(G.langar || {})) {
      const A = idx[aid]; if (!A) throw new Error('usul: langar yo\'q ' + aid); if (G.usul.indexOf(m) < 0) throw new Error('usul: langar usuli ro\'yxatda yo\'q ' + m);
      known[m] = val(A); A.h = 1; A.al = { f: f.i, v: m }; rep.langar++;
      if (JSON.stringify(unitsOf(A)) !== JSON.stringify(unitsOf(f))) uv[m] = Object.fromEntries(unitsOf(A));
    }
    const g = {};
    for (const m of G.usul) { if (known[m]) { g[m] = known[m]; continue; } const src = G.asos && known[G.asos] ? G.asos : nearest(m, known); g[m] = hisob(known[src], src, m, G.sinf); g[m].us = src; rep.hisoblangan++; }
    f.fam = { id: f.i, ax: [AX(G.d, G.usul)], g, uv: Object.keys(uv).length ? uv : undefined, sy: [], N: G.usul.length };
    for (const [m, aid] of Object.entries(G.langar || {})) { const A = idx[aid]; addSy(f.fam, f, [A.n, A.r].concat(A.a || []), { usul: m }); }
    if (G.nom) { f.n = G.nom.n; f.r = G.nom.r; addA(f, oldN); addSy(f.fam, f, oldN, { usul: G.d }); }
    note(f); check(G.id, Object.fromEntries(G.usul.map((m) => [m, g[m].k])));
    rep.guruh[G.g] = (rep.guruh[G.g] || 0) + 1; rep.taomlar.push({ id: f.i, g: G.g, usul: G.usul });
  }
  /* 2. mavjud oilalar: usul o'qi qo'shiladi yoki mavjud usul o'qi kengaytiriladi */
  for (const O of U.oilalar) {
    const f = idx[O.id]; if (!f || !f.fam) throw new Error('usul: oila yo\'q ' + O.id); const fm = f.fam;
    let usList;
    if (O.ax) {
      const ai = fm.ax.findIndex((a) => a.i === O.ax), ax = fm.ax[ai]; if (ai < 0) throw new Error('usul: o\'q yo\'q ' + O.id + '.' + O.ax);
      ax.m = 1; ax.s = 1; ax.o.forEach((o) => { if (O.u[o.i]) { o.u = O.u[o.i]; const d = U.usullar[o.u]; if (d && !o.l) { o.l = d.l; o.lr = d.lr; } } });
      const combos = Object.keys(fm.g).map((k) => k.split('.')).filter((p) => p[ai] === ax.d).map((p) => p.slice());          // boshqa o'qlar bo'yicha har kombinatsiya (bu o'q standartda)
      for (const m of O.qosh || []) {
        const o = opt(m); ax.o.push(o);
        const mapped = Object.fromEntries(ax.o.filter((x) => x.u && x.i !== m).map((x) => [x.u, x.i])), srcU = O.asos && mapped[O.asos] ? O.asos : nearest(m, mapped); if (!srcU) throw new Error('usul: ' + O.id + ' — ' + m + ' uchun langar yo\'q');
        for (const p of combos) { const bp = p.slice(); bp[ai] = mapped[srcU]; const np = p.slice(); np[ai] = m; const base = fm.g[bp.join('.')]; if (!base) continue;
          const c = hisob(base, srcU, m, O.sinf); c.us = srcU; fm.g[np.join('.')] = c; rep.hisoblangan++;
          if (fm.uv && fm.uv[bp.join('.')]) fm.uv[np.join('.')] = fm.uv[bp.join('.')];
          if (fm.fn && fm.fn[bp.join('.')]) { const b = fm.fn[bp.join('.')], d = U.usullar[m]; fm.fn[np.join('.')] = { n: b.n.replace(/\([^()]*\)\s*$/, '(' + d.l + ')'), r: (b.r || b.n).replace(/\([^()]*\)\s*$/, '(' + d.lr + ')') }; } }
      }
      for (const [oi, L] of Object.entries(O.qosh_langar || {})) {
        if (fm.ax.length !== 1) throw new Error('usul: qosh_langar faqat bitta o\'qli oilada'); const A = idx[L.from]; if (!A) throw new Error('usul: langar yo\'q ' + L.from);
        ax.o.push({ i: oi, n: L.n, r: L.r, l: L.l, lr: L.lr }); fm.g[oi] = val(A); A.h = 1; A.al = { f: f.i, v: oi }; rep.langar++;
        if (JSON.stringify(unitsOf(A)) !== JSON.stringify(unitsOf(f))) { fm.uv = fm.uv || {}; fm.uv[oi] = Object.fromEntries(unitsOf(A)); }
        addSy(fm, f, [A.n, A.r].concat(A.a || []), { [ax.i]: oi });
      }
      usList = ax.o.filter((o) => o.u).map((o) => o.u);
      for (const p of combos) { const byU = {}; ax.o.forEach((o) => { if (!o.u) return; const q = p.slice(); q[ai] = o.i; const c = fm.g[q.join('.')]; if (c) byU[o.u] = c.k; }); check(O.id + '[' + p.join('.') + ']', byU); }
    } else {
      if (fm.ax.some((a) => a.m)) throw new Error('usul: ' + O.id + ' da usul o\'qi bor — «ax» bilan kengaytiring');
      const ng = {}, nuv = fm.uv ? {} : undefined, nfn = fm.fn ? {} : undefined;
      for (const [k, cell] of Object.entries(fm.g)) {
        const byU = {};
        for (const m of O.usul) { const nk = k + '.' + m; if (m === O.d) ng[nk] = cell; else { ng[nk] = hisob(cell, O.d, m, O.sinf); ng[nk].us = O.d; rep.hisoblangan++; } byU[m] = ng[nk].k;
          if (nuv && fm.uv[k]) nuv[nk] = fm.uv[k]; if (nfn && fm.fn[k]) { const d = U.usullar[m]; nfn[nk] = m === O.d ? fm.fn[k] : { n: fm.fn[k].n + ' (' + d.l + ')', r: (fm.fn[k].r || fm.fn[k].n) + ' (' + d.lr + ')' }; } }
        check(O.id + '[' + k + ']', byU);
      }
      fm.g = ng; if (nuv) fm.uv = nuv; if (nfn) fm.fn = nfn; fm.ax.push(AX(O.d, O.usul)); usList = O.usul;
      for (const a of foods) if (a.al && a.al.f === f.i && String(a.al.v).split('.').length < fm.ax.length) a.al.v += '.' + O.d;          /* eski alias (somsa-qat → qatlama.yogli) — to'liq kalit, standart usul */
    }
    fm.N = Object.keys(fm.g).length; note(f);
    rep.guruh[O.g] = (rep.guruh[O.g] || 0) + 1; rep.taomlar.push({ id: f.i, g: O.g, usul: usList });
  }
  if (rep.xato.length) throw new Error('usul: tartib buzildi (chuqur yog\' > tova > duxovka ≥ aerogril ≥ bug\'/qaynatish):\n  ' + rep.xato.join('\n  '));
  const dict = Object.fromEntries(Object.entries(U.usullar).map(([k, d]) => [k, { n: d.n, r: d.r, l: d.l, lr: d.lr, sy: d.sy }]));
  return { rep, dict };
}
module.exports = { apply, hisob, tartibXato, cfg, U };
