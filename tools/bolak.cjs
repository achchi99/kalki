/* Bitta katta testni mustaqil bo'limlar bo'yicha N jarayonga bo'lish (tools/testlar.js: `bolak: N`).
 *
 *   const { bolim } = require('./bolak.cjs');          // ESM: import { bolim } from '../bolak.cjs';
 *   const B = bolim({ '1': 40, '2': 12, ... });       // bo'lim id → taxminiy soniya (oxirgi o'lchov)
 *   if (B('1')) { ... }                               // shu jarayonga tushgan bo'limlar yuradi
 *
 * Vaqtlar tools/testlar-vaqt.json «bolim»[TEST_ID] dan olinadi (runner `--yangila-vaqt` yozadi), bo'lmasa — testdagi taxmin.
 * TEST_BOLAK="i/n" (1 dan) berilmasa — hammasi yuradi (oddiy `node test.mjs` avvalgidek).
 * Taqsimot deterministik: eng uzun bo'lim birinchi, eng bo'sh jarayonga (LPT) — bo'laklar vaqti teng chiqadi.
 * Har bo'lak «bo'lak i/n: bo'limlar ...» qatorini chiqaradi; bo'laklar birgalikda hamma bo'limni aynan bir marta yuradi.
 * Oxirida «bo'limlar vaqti (s): ...» — VAQT jadvalini yangilash uchun (bo'laksiz yurishda hamma bo'lim o'lchanadi).
 * Bir bo'lim bir necha blokdan iborat bo'lsa — `B.yana(id)` (ikkinchi va keyingi bloklar uchun). */
'use strict';
function bolim(vaqt) {
  try { const j = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'testlar-vaqt.json'), 'utf8')).bolim || {}, o = j[process.env.TEST_ID || ''];          // oxirgi o'lchov (node tools/testlar.js ... --yangila-vaqt)
    if (o) vaqt = Object.fromEntries(Object.keys(vaqt).map((k) => [k, o[k] > 0 ? o[k] : vaqt[k]])); } catch (e) { /* taxmin */ }
  const m = /^(\d+)\/(\d+)$/.exec(process.env.TEST_BOLAK || ''), ids = Object.keys(vaqt);
  const seen = new Set(), chk = (id, again) => { if (again) { if (!seen.has(id)) throw new Error('bolak: yana() oldin B() kerak ' + id); return; } if (!(id in vaqt)) throw new Error('bolak: noma\'lum bo\'lim ' + id); if (seen.has(id)) throw new Error('bolak: bo\'lim ikki marta ' + id); seen.add(id); };
  let cur = null, t0 = 0; const dur = {};          // bo'lim vaqti: shu bo'lim B(id) chaqiruvidan keyingi B(...) gacha (yoki chiqishgacha)
  const stop = () => { if (cur) dur[cur] = (dur[cur] || 0) + (Date.now() - t0) / 1000; cur = null; };
  process.on('exit', () => { stop(); const e = Object.entries(dur); if (e.length) console.log('bo\'limlar vaqti (s): ' + e.sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v.toFixed(1)).join(', ')); });
  const mark = (id, on) => { stop(); if (on) { cur = id; t0 = Date.now(); } return on; };
  const fin = (f, on) => { f.yana = (id) => { chk(id, true); return mark(id, on(id)); }; return f; };
  if (!m) return fin((id) => { chk(id); return mark(id, true); }, () => true);
  const i = Number(m[1]) - 1, n = Number(m[2]), load = Array(n).fill(0), own = new Map();
  ids.slice().sort((a, b) => vaqt[b] - vaqt[a] || ids.indexOf(a) - ids.indexOf(b)).forEach((id) => { let k = 0; for (let j = 1; j < n; j++) if (load[j] < load[k]) k = j; load[k] += vaqt[id]; own.set(id, k); });
  const mine = ids.filter((id) => own.get(id) === i);
  console.log('bo\'lak ' + (i + 1) + '/' + n + ': ' + mine.length + ' ta bo\'lim (' + mine.join(', ') + ')');
  return fin((id) => { chk(id); return mark(id, own.get(id) === i); }, (id) => own.get(id) === i);
}
module.exports = { bolim };
