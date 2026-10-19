#!/usr/bin/env node
/* kalki.uz — «Baliq kuni» eslatmasini yuboruvchi (Hetzner cron). Haftada BITTA push (payshanba 11:00 Toshkent = 06:00 UTC), boshqa push YO'Q.
 * Obunalar Cloudflare D1 (push_obuna) dan REST API orqali o'qiladi; kalitlar fayllarda (repoda emas): ~/.kalkifit-vapid (VAPID), ~/.cf-token (Cloudflare).
 *   node tools/push-yubor.js [--muhit production|preview] [--dry]          — haftalik yuborish (payshanba bo'lmasa chiqib ketadi; --kuch bilan majburan)
 *   node tools/push-yubor.js --muhit preview --test <email>                — FAQAT shu akkauntga ulangan obunaga (haftalik hisobga tegmaydi, kun tekshirilmaydi)
 * Cron (server vaqti UTC):  0 6 * * 4  cd ~/projects/kalki && node tools/push-yubor.js >> ~/.kalkifit-push.log 2>&1
 * Har obuna uchun haftada 1 marta (oxirgi_hafta), o'lik obuna (404/410) o'chadi, 5 ketma-ket xato — o'chadi. Natija push_holat('oxirgi') ga yoziladi (admin: GET /api/push/holat). */
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const W = require('./webpush.js'), TR = require('./translit.js');
const ACC = 'bf90d092fb22440ba355ad117ed4291a', DB = { production: '8da68cf2-2f3a-4dd7-bb81-bccc3f8f13bf', preview: 'a96a0cb6-25b7-4323-afd8-773285d15201' };
const HOST = { production: 'https://kalki.uz', preview: 'https://oqsil.kalki-10y.pages.dev' };
const TEXTS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'baliq-kuni.json'), 'utf8'));
const TZ_MS = 5 * 3600000;                                  // Toshkent = UTC+5 (yozgi vaqt yo'q)
/* Toshkent sanasi bo'yicha ISO hafta: { id: 'YYYY-Www', kun: 0=dushanba..6 } */
function hafta(now) {
  const d = new Date((now || Date.now()) + TZ_MS), kun = (d.getUTCDay() + 6) % 7, t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  t.setUTCDate(t.getUTCDate() + 3 - kun); const y = t.getUTCFullYear(), w1 = new Date(Date.UTC(y, 0, 4)), n = 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getUTCDay() + 6) % 7)) / 7);
  return { id: y + '-W' + String(n).padStart(2, '0'), n: n, kun: kun };
}
function matn(til, n) {                                      // 5 ta variant hafta raqami bo'yicha aylanadi; ЎЗ — uz matnining translit'i
  const L = til === 'ru' ? 'ru' : 'uz', list = TEXTS.matn[L], t = list[n % list.length];
  return { t: TEXTS.sarlavha[L], b: til === 'cyr' ? TR.translit(t.replace(/[‘’ʻ`´]/g, "'")) : t };
}
const payload = (til, n, muhit) => { const m = matn(til, n); return { t: m.t, b: m.b, u: (til === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?baliq=1', tag: 'baliq-kuni' }; };
function vapid() { const f = path.join(os.homedir(), '.kalkifit-vapid'); return JSON.parse(fs.readFileSync(f, 'utf8')); }
function d1(muhit) {
  const tok = fs.readFileSync(path.join(os.homedir(), '.cf-token'), 'utf8').trim(), url = 'https://api.cloudflare.com/client/v4/accounts/' + ACC + '/d1/database/' + DB[muhit] + '/query';
  return async (sql, params) => {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql: sql, params: params || [] }) }), j = await r.json();
    if (!j.success) throw new Error('D1: ' + JSON.stringify(j.errors || j).slice(0, 300)); return (j.result && j.result[0] && j.result[0].results) || [];
  };
}
async function main(argv, deps) {
  deps = deps || {};
  const arg = (k) => { const i = argv.indexOf(k); return i < 0 ? null : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
  const muhit = arg('--muhit') || 'production', test = arg('--test'), dry = !!arg('--dry'), kuch = !!arg('--kuch'), now = deps.now || Date.now(), hf = hafta(now);
  if (!DB[muhit]) throw new Error('--muhit production|preview'); if (test === true) throw new Error('--test <email>');
  if (!test && !kuch && hf.kun !== 3) { console.log(new Date(now).toISOString(), 'payshanba emas (Toshkent) — yuborilmadi'); return { yuborildi: 0 }; }
  const q = deps.q || d1(muhit), vp = deps.vapid || vapid(), send = deps.send || W.yubor; let rows;
  try {
    if (test) { const e = String(test).trim().toLowerCase(), a = await q('SELECT id FROM akkaunt WHERE email = ?', [e]); if (!a.length) { console.log('akkaunt topilmadi'); return { yuborildi: 0 }; } rows = await q('SELECT * FROM push_obuna WHERE akkaunt_id = ?', [a[0].id]); }
    else rows = await q('SELECT * FROM push_obuna WHERE oxirgi_hafta IS NULL OR oxirgi_hafta <> ?', [hf.id]);
  } catch (e) { console.log('jadval yo\'q yoki xato:', e.message); return { yuborildi: 0, xato: 1 }; }
  console.log(new Date(now).toISOString(), muhit, test ? 'TEST' : 'haftalik', hf.id, 'obuna:', rows.length, dry ? '(dry)' : '');
  let ok = 0, xato = 0, ochirildi = 0;
  for (const r of rows) {
    const p = payload(r.til, hf.n, muhit);
    if (dry) { console.log(' ', r.til, p.b); continue; }
    try {
      const res = await send({ endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth }, p, vp);
      if (res.ok) { ok++; if (!test) await q('UPDATE push_obuna SET oxirgi_hafta = ?, xato = 0 WHERE id = ?', [hf.id, r.id]); }
      else if (res.gone || (r.xato || 0) + 1 >= 5) { ochirildi++; await q('DELETE FROM push_obuna WHERE id = ?', [r.id]); }
      else { xato++; await q('UPDATE push_obuna SET xato = xato + 1 WHERE id = ?', [r.id]); console.log(' xato', res.status); }
    } catch (e) { xato++; console.log(' istisno', String(e.message).slice(0, 120)); }
  }
  const natija = { vaqt: new Date(now).toISOString(), hafta: hf.id, yuborildi: ok, xato: xato, ochirildi: ochirildi, test: !!test };
  if (!dry) { try { await q("INSERT INTO push_holat (kalit, qiymat, yangilangan) VALUES ('oxirgi', ?, ?) ON CONFLICT(kalit) DO UPDATE SET qiymat = excluded.qiymat, yangilangan = excluded.yangilangan", [JSON.stringify(natija), now]); } catch (e) { console.log('holat yozilmadi'); } }
  console.log(JSON.stringify(natija)); return natija;
}
if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error('XATO:', e.message); process.exit(1); });
module.exports = { hafta, matn, payload, main, HOST };
