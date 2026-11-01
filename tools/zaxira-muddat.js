#!/usr/bin/env node
/* kalki.uz — bulut zaxira SAQLASH MUDDATI (kunlik cron, Hetzner). Qoida — functions/_lib/zaxira-muddat.js (12 oy sinxronsiz → ogoh; ogohdan 30 kun keyin ham sinxronsiz → o'chadi).
 *   node tools/zaxira-muddat.js [--muhit production|preview] [--quruq]      (--quruq: faqat sonlarni ko'rsatadi, hech narsa o'zgarmaydi)
 * Cloudflare D1 REST (kalit ~/.cf-token — repoda yo'q, chiqarilmaydi). Natija stdout'ga: «ogoh N, o'chirildi M».
 * Cron (server vaqti UTC):  30 5 * * * cd ~/projects/kalki && node tools/zaxira-muddat.js >> ~/.kalkifit-zaxira-muddat.log 2>&1 */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const ACC = 'bf90d092fb22440ba355ad117ed4291a', DB = { production: '8da68cf2-2f3a-4dd7-bb81-bccc3f8f13bf', preview: 'a96a0cb6-25b7-4323-afd8-773285d15201' };
function d1(muhit) {                                            // D1 binding'ga o'xshash: prepare(sql).bind(...).first/all/run
  const tok = fs.readFileSync(path.join(os.homedir(), '.cf-token'), 'utf8').trim(), url = 'https://api.cloudflare.com/client/v4/accounts/' + ACC + '/d1/database/' + DB[muhit] + '/query';
  const q = async (sql, params) => { const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql, params }) }), j = await r.json(); if (!j.success) throw new Error('D1: ' + JSON.stringify(j.errors || j).slice(0, 300)); return j.result && j.result[0]; };
  const st = (sql, params) => ({ bind: (...a) => st(sql, a), first: async () => (((await q(sql, params)) || {}).results || [])[0] || null, all: async () => ({ results: ((await q(sql, params)) || {}).results || [] }), run: async () => ({ meta: { changes: (((await q(sql, params)) || {}).meta || {}).changes || 0 } }) });
  return { prepare: (sql) => st(sql, []) };
}
async function main(argv) {
  const mi = argv.indexOf('--muhit'), muhit = mi > -1 ? argv[mi + 1] : 'production', quruq = argv.includes('--quruq');
  if (!DB[muhit]) { console.error('muhit: production | preview'); return 1; }
  const { muddat } = await import(path.join(__dirname, '..', 'functions', '_lib', 'zaxira-muddat.js'));
  const r = await muddat(d1(muhit), Date.now(), quruq);
  console.log(new Date().toISOString() + ' ' + muhit + (quruq ? ' (quruq)' : '') + ': ogoh ' + r.ogoh + ", o'chirildi " + r.ochirildi); return 0;
}
if (require.main === module) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message); process.exit(1); });
module.exports = { main };
