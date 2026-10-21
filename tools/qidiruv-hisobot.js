#!/usr/bin/env node
/* kalki.uz — KalkiFit: qidiruvda topilmagan so'zlar hisoboti (GET /api/qidiruv, admin paroli).
 *   node tools/qidiruv-hisobot.js [--muhit production|preview] [--kun 30] [--host https://...] [--top 100]
 * Parol: ~/.kalkifit-admin-pass (yoki KALKIFIT_ADMIN_PASSWORD) — ekranga chiqarilmaydi. Natija: so'z · necha marta · necha kun. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const HOST = { production: 'https://kalki.uz', preview: 'https://v20.kalki-10y.pages.dev' };
function hisobot(j, kun, top) {
  const l = ['KalkiFit — qidiruvda topilmagan so\'zlar (oxirgi ' + kun + ' kun)', ''], s = (j.sozlar || []).slice(0, top);
  if (!s.length) l.push('(hali yo\'q)');
  s.forEach((x, i) => l.push(String(i + 1).padStart(3) + '. ' + String(x.soz).padEnd(32) + String(x.son).padStart(6) + '   (' + x.kun + ' kun)'));
  return l.join('\n');
}
async function main(argv) {
  const arg = (k, d) => { const i = argv.indexOf(k); return i < 0 ? d : argv[i + 1]; }, muhit = arg('--muhit', 'production'), kun = parseInt(arg('--kun', '30'), 10) || 30, top = parseInt(arg('--top', '100'), 10) || 100, host = arg('--host', HOST[muhit]);
  let pw = process.env.KALKIFIT_ADMIN_PASSWORD; if (!pw) pw = fs.readFileSync(path.join(os.homedir(), '.kalkifit-admin-pass'), 'utf8').trim();
  const r = await fetch(host + '/api/qidiruv?kun=' + kun, { headers: { 'X-Admin-Password': pw } });
  if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); console.log(hisobot(j, kun, top)); return j;
}
if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error('XATO:', e.message); process.exit(1); });
module.exports = { hisobot };
