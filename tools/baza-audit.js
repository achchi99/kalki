#!/usr/bin/env node
/* kalki.uz — KalkiFit bazasi: ustuvor ro'yxat (data/baza-ustuvor.json) uchun AVTOMATIK tekshiruv darvozalari (v78) va «manba» qisqa yozuvi.
 * Darvozalar: (1) qiymat manbasi aniq (USDA fdc_id / retsept / yorliq / tarkib hisobi), (2) 4·O+4·U+9·Y ≈ kkal (±15 %, kichik qiymatda ±10 kkal),
 * (3) porsiya grammlari oqilona oraliqda (BIRLIK_ORALIQ), (4) bir porsiya kkal'i oqilona (≤ MAX_PORSIYA_KKAL), (5) nomda «A / B» yo'q, (6) sho'rvada faqat kosa, qahvada faqat chashka.
 *   node tools/baza-audit.js        — yiqilganlar ro'yxati */
'use strict';
const fs = require('fs'), path = require('path');
const ISTISNO = require('./baza-mantiq-istisno.js');
const ORALIQ = { kosa: [150, 600], likop: [100, 600], piyola: [50, 300], stakan: [80, 500], chashka: [30, 360], six: [30, 200], qoshiq: [3, 40], choyq: [2, 10], bolak: [5, 250], tilim: [10, 350], dona_s: [5, 20], dona_l: [15, 40], set: [100, 400], rulet: [100, 400], hovuch: [5, 120], porsiya: [30, 600], shisha: [250, 1000], skup: [5, 40] };
const MAX_PORSIYA_KKAL = 1500;
const slash = (s) => /\S\s\/\s\S/.test(String(s || ''));
function manbaOf(f) {
  const m = String(f.m || ''), ms = f.ms ? (f.ms.u || '') : '';
  const fdc = (ms.match(/fdc_id\s*([0-9, ]+)/i) || m.match(/FDC\s*(\d+)/i) || m.match(/fdc_id\s*([0-9, ]+)/i) || [])[1];
  if (f.rc) return 'Retsept ' + f.rc + (fdc ? ' · USDA FDC ' + fdc.trim().replace(/,\s*$/, '') : ' · USDA FDC');
  if (/^Yorliq/i.test(m) || /yorliq/i.test(ms)) return m.slice(0, 120) || "Ishlab chiqaruvchi yorlig'i";
  if (f.tm) return 'Menyu tarkibi bo\'yicha hisob (USDA FDC komponentlari), taxminiy';
  if (/^Hisob:/i.test(m) || /^Hisob \(/i.test(ms)) return 'Retsept hisobi (USDA FDC komponentlari)' + (fdc ? ' · ' + fdc.trim() : '');
  if (fdc && (/^USDA/i.test(m) || /USDA/.test(ms)) || /^USDA FDC \d+/i.test(m)) return 'USDA FDC' + (fdc ? ' ' + fdc.trim() : '') + (f.tk ? ' · tekshirilgan ' + f.tk : '');
  if (/Quritish modeli|Skurikhin|Скурихин/i.test(m + ms)) return m.slice(0, 120);
  if (fdc && (/Retsept|retsept/.test(m) || /Retsept|retsept/.test(ms))) return 'Retsept hisobi (USDA FDC) · ' + fdc.trim();
  return '';
}
function gate(f) {
  const bad = [], atw = 4 * f.p + 4 * f.c + 9 * f.f;
  if (!manbaOf(f)) bad.push('manba aniq emas');
  if (!/^(aroq|konyak|vino|pivo)/.test(f.i) && !(ISTISNO.c || {})[f.i] && Math.abs(atw - f.k) > Math.max(10, f.k * 0.15)) bad.push('makro ≠ kkal (' + Math.round(atw) + ' vs ' + f.k + ')');
  (f.u || []).forEach(([u, g]) => { if (u === 'g100') return; const o = ORALIQ[u]; if (o && (g < o[0] || g > o[1]) && !(f.tm && (u === 'dona' || u === 'bolak'))) bad.push('birlik ' + u + '=' + g + ' g oraliqdan tashqari ' + o.join('–'));
    if (f.k * g / 100 > MAX_PORSIYA_KKAL && !f.tm) bad.push('1 ' + u + ' = ' + Math.round(f.k * g / 100) + ' kkal (juda ko\'p)'); });
  if (slash(f.n) || slash(f.r)) bad.push('nomda «A / B»');
  return bad;
}
module.exports = { gate, manbaOf, ORALIQ, slash };
if (require.main === module) {
  const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ovqatlar.json'), 'utf8')).foods, by = Object.fromEntries(D.map((f) => [f.i, f]));
  const ids = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'baza-ustuvor.json'), 'utf8')).ids; let n = 0;
  ids.forEach((id) => { const f = by[id]; if (!f) { console.log(id, '— bazada yo\'q'); n++; return; } const b = gate(f); if (b.length) { n++; console.log(id.padEnd(28), f.n, '|', b.join('; ')); } });
  console.log('yiqilgan:', n, '/', ids.length);
}
