/* kalki.uz — v87 tuzatish: «RETSEPT HISOBI». Standart retsept (porsiya uchun NETTO gramm) → 100 g tayyor taom kkal/makro.
 * Masalliq qiymati FAQAT manbadan: u:<fdc_id> — USDA FDC SR Legacy (data/manba/usda-sr-legacy.json); s:<kalit> — Скурихин jadvali (data/manba/skurikhin.json, health-diet.ru havolasi bilan);
 * y:<kalit> — ishlab chiqaruvchi yorlig'i (data/manba/yorliq.json, Open Food Facts shtrix-kodi); suv — 0.
 * Retsept: { porsiya: 'kosa 400 g', chiqish: tayyor taom grammi (bug'lanish/qovurish yo'qotishidan keyin; berilmasa — masalliqlar yig'indisi), mas: [[token, netto g, 'nomi'], …], izoh: 'manba/nisbat' }.
 * Ishlatadi: tools/ovqatlar-build.js (retseptli qatorlar), tools/kengaytma-tekshir.js, tools/retsept-hujjat.js (docs jadvali). */
'use strict';
const fs = require('fs'), path = require('path'), ROOT = path.join(__dirname, '..'), RD = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
let U = null, SK = null, YQ = null;
function load() { if (!U) { U = RD('data/manba/usda-sr-legacy.json').foods; SK = RD('data/manba/skurikhin.json').yozuvlar; YQ = RD('data/manba/yorliq.json').yorliq; } }
function part(tok) {
  load(); if (tok === 'suv') return { k: 0, p: 0, f: 0, c: 0, u: 'suv', r: 'вода' };
  let m = /^s:(.+)$/.exec(tok); if (m) { const x = SK[m[1]]; return x ? { k: x.kcal, p: x.p, f: x.f, c: x.c, u: 'Скурихин: ' + x.nom + ' (' + x.url + ')', r: 'Скурихин: ' + x.nom + ' (' + x.url + ')' } : null; }
  m = /^y:(.+)$/.exec(tok); if (m) { const x = YQ[m[1]]; return x ? { k: x.k, p: x.p, f: x.f, c: x.c, u: 'yorliq: ' + x.nom + ' (OFF ' + x.code + ')', r: 'этикетка: ' + x.nom + ' (OFF ' + x.code + ')' } : null; }
  m = /^u:(\d+)$/.exec(tok); if (m) { const x = U[m[1]]; return x ? { k: x.kcal, p: x.p, f: x.f, c: x.c, u: 'USDA ' + m[1] + ' («' + x.d + '»)', r: 'USDA ' + m[1] + ' («' + x.d + '»)' } : null; }
  return null;
}
function hisob(rec) {
  const xs = rec.mas.map(([t, g, nom]) => ({ t, g: +g, nom, q: part(t) })), bad = xs.filter((x) => !x.q || !(x.g > 0));
  if (bad.length) throw new Error('retsept: masalliq topilmadi ' + bad.map((x) => x.t).join(','));
  const sum = xs.reduce((a, x) => a + x.g, 0), out = rec.chiqish > 0 ? rec.chiqish : sum, tot = (k) => xs.reduce((a, x) => a + x.q[k] * x.g / 100, 0);
  const v = { k: tot('k') / out * 100, p: tot('p') / out * 100, f: tot('f') / out * 100, c: tot('c') / out * 100, sum, out };
  const ch = rec.chiqish > 0 ? ' Masalliqlar ' + Math.round(sum) + ' g → tayyor ' + Math.round(out) + ' g.' : '', chr = rec.chiqish > 0 ? ' Сырьё ' + Math.round(sum) + ' г → выход ' + Math.round(out) + ' г.' : '';
  v.m = 'Retsept hisobi: ' + xs.map((x) => x.g + ' g ' + x.t).join(' + ') + (rec.chiqish > 0 ? ' → ' + out + ' g' : '');
  v.ms = { u: 'Retsept hisobi (porsiya: ' + rec.porsiya + '; ' + rec.izoh + '): ' + xs.map((x) => x.g + ' g ' + x.nom + ' — ' + x.q.u).join('; ') + '.' + ch + ' Qiymat 100 g tayyor taom uchun, taxminiy (±15 %).',
    r: 'Расчёт по рецепту (порция: ' + rec.porsiya + '): ' + xs.map((x) => x.g + ' г — ' + x.q.r).join('; ') + '.' + chr + ' На 100 г готового блюда, примерно (±15 %).' };
  v.xs = xs; return v;
}
function all() { const o = {}; for (const f of ['retsept-v87b.js', 'retsept-v87a.js', 'retsept-v87c.js']) { const p = path.join(__dirname, f); if (fs.existsSync(p)) Object.assign(o, require(p)); } return o; }
module.exports = { part, hisob, all };
