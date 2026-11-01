#!/usr/bin/env node
/* kalki.uz — dizayn skrinshotlarini admin sahifasiga (admin/dizayn-ekranlar.html) yuklash: D1 jadval dizayn_ekran.
 *   node tools/dizayn-ekran-yukla.js <papka> [--muhit production|preview] [--tozala]
 * Papkadagi <oldin|keyin>-<guruh>-<light|dark>.png fayllari (masalan keyin-1-bugun-dark.png) base64 bo'lib yoziladi.
 * Kalit ~/.cf-token — repoda yo'q, chiqarilmaydi. Skrinshotlar repoga qo'shilmaydi. */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const ACC = 'bf90d092fb22440ba355ad117ed4291a', DB = { production: '8da68cf2-2f3a-4dd7-bb81-bccc3f8f13bf', preview: 'a96a0cb6-25b7-4323-afd8-773285d15201' };
const NOM = { '1-bugun': 'Bugun (yuqori)', '1b-bugun-past': 'Bugun (pastki qism)', '2-imkoniyatlar': 'Imkoniyatlar paneli', '2b-imkoniyatlar-yozish': 'Imkoniyatlar → Ovqat yozish', '3-profil': 'Profil (yuqori)', '3b-profil-past': 'Profil (pastki qism)',
  '4-tarix': 'Tarix', '4b-tarix-orta': 'Tarix (o\'rta)', '4c-tarix-past': 'Tarix (past)', '5-qosh': 'Ovqat qo\'shish', '5b-qosh-natija': 'Ovqat qo\'shish — natijalar', '6-porsiya': 'Porsiya', '6b-porsiya-past': 'Porsiya (past)', '7-yeyman': 'Imkoniyatlar → Nima yeyman?', '7b-yeymiz': 'Nima yesam ekan?', '8-mashq': 'Mashg\'ulot', '8b-qadam': 'Qadam kiritish', '9-chip-hafta': 'Kontekstli chip («Haftangiz tayyor»)', '10-bugun-bosh': 'Bugun — ovqat yo\'q', '11-bugun-toldi': 'Bugun — to\'ldirilgan', '12-profil-bosh': 'Profil — bo\'sh', '13-profil-toldi': 'Profil — to\'ldirilgan', '14-matn': 'Matn oynasi («Nima yedingiz?»)' };
async function main(argv) {
  const dir = argv[0], mi = argv.indexOf('--muhit'), muhit = mi > -1 ? argv[mi + 1] : 'production';
  if (!dir || !DB[muhit]) { console.error('node tools/dizayn-ekran-yukla.js <papka> [--muhit production|preview] [--tozala]'); return 1; }
  const tok = fs.readFileSync(path.join(os.homedir(), '.cf-token'), 'utf8').trim(), url = 'https://api.cloudflare.com/client/v4/accounts/' + ACC + '/d1/database/' + DB[muhit] + '/query';
  const q = async (sql, params) => { const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql, params }) }), j = await r.json(); if (!j.success) throw new Error('D1: ' + JSON.stringify(j.errors || []).slice(0, 200)); return j; };
  if (argv.includes('--tozala')) await q('DELETE FROM dizayn_ekran', []);
  const fl = fs.readdirSync(dir).filter((f) => /^(oldin|keyin)-.+-(light|dark)\.png$/.test(f)).sort(); let n = 0;
  for (const f of fl) {
    const m = /^(oldin|keyin)-(.+)-(light|dark)\.png$/.exec(f), guruh = m[2], buf = fs.readFileSync(path.join(dir, f));
    await q('INSERT OR REPLACE INTO dizayn_ekran (id, guruh, holat, tema, nom, tartib, rasm, yangilandi) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [f.slice(0, -4), guruh, m[1], m[3], NOM[guruh] || guruh, parseInt(guruh, 10) || 0, 'data:image/png;base64,' + buf.toString('base64'), Date.now()]); n++;
  }
  console.log(muhit + ': ' + n + ' skrinshot yuklandi'); return 0;
}
if (require.main === module) main(process.argv.slice(2)).then((c) => process.exit(c), (e) => { console.error(e.message); process.exit(1); });
module.exports = { main };
