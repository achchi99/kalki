/* v100: YOG'LILIK BO'YICHA MONOTONLIK — yog'lilik qatoridagi barcha oilalarda kaloriya va yog' yog'lilik oshishi bilan QAT'IY o'sadi (1 g yog' ≈ 9 kkal).
 *  1) har bir oila (fam) «yogliligi» o'qi bo'yicha (sut, kefir, qatiq, tvorog, smetana … — kelajakdagilar ham avtomatik);
 *  2) alohida taomlar qatorlari: qaymoq, yogurt, yunon yogurti, ryajenka, sariyog', mol qiymasi 5/10/15/20 %;
 *  3) nom ichidagi «N %» bo'yicha avtomatik guruhlash (sut mahsulotlari, qiyma): yorliqdagi % oshsa — kkal ham oshadi.
 *  Qadam sifati: Δkkal ≥ 3·Δyog' (yog' energiya beradi) va Δkkal ≤ 11·Δyog' + 10 (bir manba/yog' farqi bo'yicha izchil).   node tools/test-yoglilik-monoton.js */
'use strict';
const assert = require('assert');
const S = require('../assets/kalkifit-core.js'); const foods = S.buildIndex(S.normFoods(require('../data/ovqatlar.json').foods));
const by = Object.fromEntries(foods.map((f) => [f.id, f])); let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
const check = (tag, list) => { const s = list.slice().sort((a, b) => a.f - b.f || a.k - b.k); const bad = [];
  for (let i = 1; i < s.length; i++) { const a = s[i - 1], b = s[i], df = b.f - a.f, dk = b.k - a.k;
    if (!(df > 0)) continue;          // bir xil yog' (turli mahsulot) — taqqoslanmaydi
    if (!(dk > 0)) bad.push(a.n + ' (' + a.f + ' g, ' + a.k + ' kkal) → ' + b.n + ' (' + b.f + ' g, ' + b.k + ' kkal): kkal o\'smadi');
    else if (dk < 3 * df - 0.5) bad.push(a.n + ' → ' + b.n + ': Δkkal ' + dk + ' < 3·Δyog\' ' + Math.round(3 * df * 10) / 10);
    else if (dk > 11 * df + 10) bad.push(a.n + ' → ' + b.n + ': Δkkal ' + dk + ' > 11·Δyog\'+10 ' + Math.round((11 * df + 10) * 10) / 10 + ' (izchil emas)'); }
  assert.deepEqual(bad, [], tag + ': ' + bad.join(' | ')); return s.length; };
/* 1. barcha oilalar */
let famN = 0, famV = 0;
for (const f of foods) { if (!f.fam || f.h) continue; const ax = f.fam.ax.find((a) => a.i === 'yogliligi'); if (!ax || f.fam.ax.length !== 1) continue; famN++;
  famV += check('oila ' + f.id, ax.o.map((o) => { const v = S.famVariant(f, Object.assign(S.famDefault(f), { yogliligi: o.i })); return { n: f.id + '.' + o.i + ' (' + o.n + ')', f: v.f, k: v.k }; })); }
assert.ok(famN >= 5, 'yog\'lilik oilalari: ' + famN);
ok('Oilalar («yogliligi» o\'qi): ' + famN + ' ta oila, ' + famV + ' variant — kkal va yog\' qat\'iy o\'sadi');
/* 2. alohida taomlar qatorlari */
const L = { qaymoq: ['qaymoq-10', 'qaymoq-20', 'qaymoq-yogli'], yogurt: ['yogurt-yogsiz', 'yogurt-kam', 'yogurt-tabiiy'], 'yunon yogurti': ['yogurt-yunon', 'yogurt-yunon-2', 'yogurt-yunon-5'], ryajenka: ['ryajenka-25', 'ryajenka', 'ryajenka-4'], sariyog: ['sariyog-725', 'sariyog', 'sariyog-825'], 'mol qiymasi': ['mol-qiyma-5', 'mol-qiyma-10', 'mol-qiyma-xom', 'mol-qiyma-20'] };
let rowN = 0; for (const [nm, ids] of Object.entries(L)) { ids.forEach((i) => assert.ok(by[i], 'taom yo\'q: ' + i)); rowN += check(nm, ids.map((i) => ({ n: i, f: by[i].f, k: by[i].k }))); }
ok('Taomlar qatorlari: ' + Object.keys(L).join(', ') + ' (' + rowN + ' taom) — kkal va yog\' qat\'iy o\'sadi');
/* 3. nomdagi «N %» bo'yicha avtomatik guruhlash */
const STEM = /^(sut|kefir|qatiq|tvorog|smetana|qaymoq|yogurt|ryajenka|sariyog'?|mol qiymasi|tovuq qiymasi)\b/i; const groups = {};
for (const f of foods) { if (f.h || f.tm || f.t === 'x' || /\b(valio|president|danone|activia|agusha|danissimo|aktimel)\b/i.test(f.i + ' ' + f.n)) continue; const nm = String(f.n || ''); if (!STEM.test(nm)) continue;
  const m = /(\d+(?:[.,]\d+)?)\s*%/.exec(nm); if (!m) continue; const pct = parseFloat(m[1].replace(',', '.')); const stem = nm.replace(/\([^)]*\)/g, '').replace(/\d+(?:[.,]\d+)?\s*%/g, '').replace(/\s+/g, ' ').trim().toLowerCase(); (groups[stem] = groups[stem] || []).push({ n: f.id + ' [' + pct + '%]', pct, f: f.f, k: f.k }); }
let autoN = 0, autoG = 0; for (const [stem, l] of Object.entries(groups)) { if (l.length < 2) continue; autoG++; const s = l.slice().sort((a, b) => a.pct - b.pct); const bad = [];
  for (let i = 1; i < s.length; i++) if (s[i].pct > s[i - 1].pct && !(s[i].k > s[i - 1].k && s[i].f > s[i - 1].f)) bad.push(s[i - 1].n + ' ' + s[i - 1].k + ' kkal → ' + s[i].n + ' ' + s[i].k + ' kkal'); assert.deepEqual(bad, [], 'nomdagi %: ' + stem + ': ' + bad.join(' | ')); autoN += l.length; }
ok('Nomdagi «N %» bo\'yicha: ' + autoG + ' guruh, ' + autoN + ' taom — yorliqdagi % oshsa kkal va yog\' ham oshadi');
console.log('yoglilik-monoton: ' + n + ' guruh OK');
