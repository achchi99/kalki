#!/usr/bin/env node
/* kalki.uz — KalkiFit anonim hisoblagichlar: oddiy matnli hisobot (GET /api/hisob, admin paroli).
 *   node tools/hisob-hisobot.js [--muhit production|preview] [--kun 30] [--host https://...]
 * Parol: ~/.kalkifit-admin-pass (yoki KALKIFIT_ADMIN_PASSWORD). Chiqish: har hodisa bo'yicha jami + oxirgi 7 kun, so'ng konversiya. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const HOST = { production: 'https://kalki.uz', preview: 'https://yeymiz.kalki-10y.pages.dev' };
const NOM = { orinbosar_korsatildi: "«O'rniga» ko'rsatildi", orinbosar_tanlandi: "«O'rniga» tanlandi", baliq_oyna_ochildi: 'Baliq kuni oynasi ochildi', baliq_buyurtma_bosildi: 'Buyurtma bosildi', baliq_kafe_yozildi: 'Kafe baliq taomi yozildi', baliq_uyda_ochildi: 'Uyda retsept ochildi', yeymiz_ochildi: '«Bugun nima yeymiz?» ochildi', yeymiz_tanlandi: '«Bugun nima yeymiz?» tanlandi' };
const pct = (a, b) => (b > 0 ? Math.round(a / b * 100) + '%' : '—');
function hisobot(j, kun) {
  const jami = j.jami || {}, g = (k) => jami[k] || 0, sum = (p) => Object.keys(jami).filter((k) => k === p || k.startsWith(p + '.')).reduce((a, k) => a + jami[k], 0);
  const sanalar = [...new Set((j.kunlar || []).map((x) => x.sana))].sort(), son7 = sanalar.slice(-7), l = [];
  l.push('KalkiFit hisoblagichlar — oxirgi ' + kun + ' kun (' + (sanalar[0] || '—') + ' … ' + (sanalar[sanalar.length - 1] || '—') + ')', '');
  for (const k of Object.keys(NOM)) {
    const h7 = (j.kunlar || []).filter((x) => son7.includes(x.sana) && (x.hodisa === k || x.hodisa.startsWith(k + '.'))).reduce((a, x) => a + x.son, 0);
    l.push((NOM[k] + ':').padEnd(36) + String(sum(k)).padStart(7) + '   (oxirgi 7 kun: ' + h7 + ')');
    if (k === 'baliq_buyurtma_bosildi') Object.keys(jami).filter((x) => x.startsWith(k + '.')).sort().forEach((x) => l.push('    ' + x.slice(k.length + 1).padEnd(32) + String(jami[x]).padStart(7)));
  }
  l.push('', "O'rniga: ko'rsatildi → tanlandi:        " + pct(sum('orinbosar_tanlandi'), sum('orinbosar_korsatildi')), 'Bugun nima yeymiz?: ochildi → tanlandi: ' + pct(sum('yeymiz_tanlandi'), sum('yeymiz_ochildi')), 'Baliq kuni: oyna → buyurtma bosildi:    ' + pct(sum('baliq_buyurtma_bosildi'), sum('baliq_oyna_ochildi')));
  return l.join('\n');
}
async function main(argv) {
  const arg = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; }, muhit = arg('--muhit', 'production'), kun = parseInt(arg('--kun', '30'), 10) || 30, host = arg('--host', HOST[muhit]);
  let pw = process.env.KALKIFIT_ADMIN_PASSWORD; if (!pw) pw = fs.readFileSync(path.join(os.homedir(), '.kalkifit-admin-pass'), 'utf8').trim();
  const r = await fetch(host + '/api/hisob?kun=' + kun, { headers: { 'X-Admin-Password': pw } });
  if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); console.log(hisobot(j, kun)); return j;
}
if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error('XATO:', e.message); process.exit(1); });
module.exports = { hisobot, NOM };
