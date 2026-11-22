#!/usr/bin/env node
/* kalki.uz — «Baliq kuni» eslatmasini yuboruvchi (Hetzner cron). Haftada BITTA push (standart payshanba, foydalanuvchi «Boshqa kun» tanlasa — o'sha kun; 11:00 Toshkent = 06:00 UTC), boshqa push YO'Q. «Baliq yoqtirmayman» (baliqsiz=1) obunaga HECH QACHON yuborilmaydi.
 * Obunalar Cloudflare D1 (push_obuna) dan REST API orqali o'qiladi; kalitlar fayllarda (repoda emas): ~/.kalkifit-vapid (VAPID), ~/.cf-token (Cloudflare).
 *   node tools/push-yubor.js [--muhit production|preview] [--dry]          — haftalik yuborish (payshanba bo'lmasa chiqib ketadi; --kuch bilan majburan)
 *   node tools/push-yubor.js --muhit preview --test <email>                — FAQAT shu akkauntga ulangan obunaga (haftalik hisobga tegmaydi, kun tekshirilmaydi)
 *   node tools/push-yubor.js --muhit preview --obuna <id-boshi>            — FAQAT id (SHA-256(endpoint)) shu harflardan boshlanadigan obunaga (akkauntsiz sinov; ro'yxat: --royxat)
 *   node tools/push-yubor.js --xulosa [--muhit …] [--dry] [--kuch]           — «Haftangiz xulosasi tayyor» (yakshanba; hafta = 1 obunalar; matn umumiy — xulosa qurilmada hisoblanadi)
 *   node tools/push-yubor.js --eslatma [--muhit …] [--dry]                    — v88 «Ovqat eslatmalari» (har 5 daqiqa): push_eslatma jadvali, qoidalar — functions/_lib/eslatma-qoida.js
 *     cron: har 5 daqiqa (*\/5) — cd ~/projects/kalki && node tools/push-yubor.js --eslatma >> ~/.kalkifit-eslatma.log 2>&1
 * Cron (server vaqti UTC):  0 6 * * *  cd ~/projects/kalki && node tools/push-yubor.js >> ~/.kalkifit-push.log 2>&1
 *                           0 14 * * 0 cd ~/projects/kalki && node tools/push-yubor.js --xulosa >> ~/.kalkifit-push.log 2>&1   (yakshanba 19:00 Toshkent)
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
const XULOSA = { uz: 'Haftangiz xulosasi tayyor', ru: 'Итоги вашей недели готовы' };
const payloadX = (til) => ({ t: 'KalkiFit', b: til === 'ru' ? XULOSA.ru : (til === 'cyr' ? TR.translit(XULOSA.uz) : XULOSA.uz), u: (til === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?hafta=1', tag: 'hafta' });
const payload = (til, n, muhit) => { const m = matn(til, n); return { t: m.t, b: m.b, u: (til === 'ru' ? '/ru/kalkifit' : '/kalkifit') + '?baliq=1', tag: 'baliq-kuni' }; };
function vapid() { const f = path.join(os.homedir(), '.kalkifit-vapid'); return JSON.parse(fs.readFileSync(f, 'utf8')); }
function d1(muhit) {
  const tok = fs.readFileSync(path.join(os.homedir(), '.cf-token'), 'utf8').trim(), url = 'https://api.cloudflare.com/client/v4/accounts/' + ACC + '/d1/database/' + DB[muhit] + '/query';
  return async (sql, params) => {
    const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: JSON.stringify({ sql: sql, params: params || [] }) }), j = await r.json();
    if (!j.success) throw new Error('D1: ' + JSON.stringify(j.errors || j).slice(0, 300)); return (j.result && j.result[0] && j.result[0].results) || [];
  };
}
/* v88: ovqat eslatmalari — har 5 daqiqada: vaqti kelgan (≤ 45 daqiqa oynasi), yozilmagan ovqatga BITTA push; yozilganiga — o'tkaziladi; kun almashsa siyraklashish tekshiriladi */
async function eslatmaYubor(q, vp, send, now, dry, deps) {
  const Q = deps.qoida || await import(path.join(__dirname, '..', 'functions', '_lib', 'eslatma-qoida.js'));
  const TX = deps.tx || JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'eslatmalar.json'), 'utf8'));
  let rows; try { rows = await q('SELECT e.*, o.endpoint, o.p256dh, o.auth, o.til, o.xato AS oxato FROM push_eslatma e JOIN push_obuna o ON o.id = e.id', []); } catch (e) { console.log('push_eslatma yo\'q:', e.message); return { yuborildi: 0 }; }
  const stat = {}, add = (k, n) => { stat[k] = (stat[k] || 0) + (n || 1); };
  let ok = 0, xato = 0;
  for (const r0 of rows) {
    const L = Q.mahalliy(now, r0.tz), y = Q.yangiKun(r0, L.kun), r = y.row; y.ev.forEach((e) => add(e[1]));
    const acts = Q.tanla(r, now); let sent = false;
    for (const a of acts) {
      r.ishlangan |= Q.BIT[a.meal];
      if (a.amal === 'otkaz') add('otkazildi'); if (a.amal !== 'yubor' || sent) continue;
      const n = Q.MEALS.indexOf(a.meal) + Math.round(Date.parse(L.kun + 'T00:00:00Z') / 86400000), m = Q.matn(TX, r.til, a, n, TR.translit, Q.uslubOf ? Q.uslubOf(r) : 'jiddiy'), p = { t: m.t, b: m.b, u: Q.url(r.til, a, L.kun), tag: 'eslatma-' + a.meal };
      if (dry) { console.log(' ', r.id.slice(0, 8), L.kun, a.meal, a.kind, p.b); sent = true; r.yuborildi++; continue; }
      try { const res = await send({ endpoint: r0.endpoint, p256dh: r0.p256dh, auth: r0.auth }, p, vp);
        if (res.ok) { ok++; sent = true; r.yuborildi++; add('yuborildi.' + a.meal); }
        else { xato++; if (res.gone) { await q('DELETE FROM push_eslatma WHERE id = ?', [r.id]); await q('DELETE FROM push_obuna WHERE id = ?', [r.id]); } }
      } catch (e) { xato++; }
    }
    if (!dry && (y.ev.length || acts.length || r.kun !== r0.kun)) await q('UPDATE push_eslatma SET kun = ?, yozildi = ?, ishlangan = ?, yuborildi = ?, bosildi = ?, bosilmagan = ?, siyrak = ? WHERE id = ?', [r.kun, r.yozildi, r.ishlangan, r.yuborildi, r.bosildi, r.bosilmagan, r.siyrak, r.id]);
  }
  if (!dry) for (const k of Object.keys(stat)) { try { await q("INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, 'eslatma', ?, 'veb', ?) ON CONFLICT(kun, hodisa, kalit, platforma) DO UPDATE SET son = son + excluded.son", [new Date(now + TZ_MS).toISOString().slice(0, 10), k, stat[k]]); } catch (e) {} }          // anonim: faqat son
  if (ok || xato || Object.keys(stat).length) console.log(new Date(now).toISOString(), 'eslatma', JSON.stringify({ obuna: rows.length, yuborildi: ok, xato, stat }));
  return { yuborildi: ok, xato, stat };
}
async function main(argv, deps) {
  deps = deps || {};
  const arg = (k) => { const i = argv.indexOf(k); return i < 0 ? null : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
  const muhit = arg('--muhit') || 'production', test = arg('--test'), dry = !!arg('--dry'), kuch = !!arg('--kuch'), now = deps.now || Date.now(), hf = hafta(now);
  if (!DB[muhit]) throw new Error('--muhit production|preview'); if (test === true) throw new Error('--test <email>');
  const one = arg('--obuna'), roy = !!arg('--royxat'), xul = !!arg('--xulosa');
  if (arg('--eslatma')) return eslatmaYubor(deps.q || d1(muhit), deps.vapid || vapid(), deps.send || W.yubor, now, dry, deps);
  if (roy) { const r0 = await (deps.q || d1(muhit))('SELECT id, til, akkaunt_id IS NOT NULL AS akk, yaratilgan FROM push_obuna ORDER BY yaratilgan DESC LIMIT 20'); r0.forEach((r) => console.log(r.id.slice(0, 10), r.til, r.akk ? 'akkaunt' : '-', new Date(r.yaratilgan).toISOString())); return { yuborildi: 0 }; }
  const q = deps.q || d1(muhit), vp = deps.vapid || vapid(), send = deps.send || W.yubor; let rows;
  try {
    if (one && one !== true) rows = (await q('SELECT * FROM push_obuna WHERE id LIKE ?', [String(one).replace(/[^0-9a-f]/g, '') + '%'])).slice(0, 1);
    else if (test) { const e = String(test).trim().toLowerCase(), a = await q('SELECT id FROM akkaunt WHERE email = ?', [e]); if (!a.length) { console.log('akkaunt topilmadi'); return { yuborildi: 0 }; } rows = await q('SELECT * FROM push_obuna WHERE akkaunt_id = ?', [a[0].id]); }
    else if (xul) {                              // yakshanba 14:00 UTC (19:00 Toshkent): «Haftalik xulosa» yoqilgan obunalarga, haftada 1 marta
      if (!kuch && hf.kun !== 6) { console.log(new Date(now).toISOString(), 'yakshanba emas (Toshkent) — xulosa yuborilmadi'); return { yuborildi: 0 }; }
      rows = await q('SELECT * FROM push_obuna WHERE hafta = 1 AND (oxirgi_xulosa IS NULL OR oxirgi_xulosa <> ?)', [hf.id]);
    }
    else {                                       // har kuni 06:00 UTC: faqat BUGUN o'z kuni bo'lgan (standart payshanba) va «Baliq yoqtirmayman» demagan obunalarga; --kuch — kun tekshirilmaydi
      try { rows = await q('SELECT * FROM push_obuna WHERE (oxirgi_hafta IS NULL OR oxirgi_hafta <> ?) AND baliqsiz = 0' + (kuch ? '' : ' AND kun = ?'), kuch ? [hf.id] : [hf.id, hf.kun]); }
      catch (e) { if (!kuch && hf.kun !== 3) { console.log(new Date(now).toISOString(), 'payshanba emas (Toshkent) — yuborilmadi'); return { yuborildi: 0 }; } rows = await q('SELECT * FROM push_obuna WHERE oxirgi_hafta IS NULL OR oxirgi_hafta <> ?', [hf.id]); }      // yangi ustunlar yo'q (migratsiya yurgizilmagan) — eski xatti-harakat
    }
  } catch (e) { console.log('jadval yo\'q yoki xato:', e.message); return { yuborildi: 0, xato: 1 }; }
  console.log(new Date(now).toISOString(), muhit, test || one ? 'TEST' : (xul ? 'xulosa' : 'haftalik'), hf.id, 'obuna:', rows.length, dry ? '(dry)' : '');
  let ok = 0, xato = 0, ochirildi = 0;
  for (const r of rows) {
    const p = xul ? payloadX(r.til) : payload(r.til, hf.n, muhit);
    if (dry) { console.log(' ', r.til, p.b); continue; }
    try {
      const res = await send({ endpoint: r.endpoint, p256dh: r.p256dh, auth: r.auth }, p, vp);
      if (res.ok) { ok++; if (!test && !one) await q('UPDATE push_obuna SET ' + (xul ? 'oxirgi_xulosa' : 'oxirgi_hafta') + ' = ?, xato = 0 WHERE id = ?', [hf.id, r.id]); }
      else if (res.gone || (r.xato || 0) + 1 >= 5) { ochirildi++; await q('DELETE FROM push_obuna WHERE id = ?', [r.id]); }
      else { xato++; await q('UPDATE push_obuna SET xato = xato + 1 WHERE id = ?', [r.id]); console.log(' xato', res.status); }
    } catch (e) { xato++; console.log(' istisno', String(e.message).slice(0, 120)); }
  }
  const natija = { vaqt: new Date(now).toISOString(), hafta: hf.id, tur: xul ? 'xulosa' : 'baliq', yuborildi: ok, xato: xato, ochirildi: ochirildi, test: !!(test || one) };
  if (!dry && ok > 0 && !(test || one)) { try { await q("INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, 'push_yuborildi', ?, 'veb', ?) ON CONFLICT(kun, hodisa, kalit, platforma) DO UPDATE SET son = son + excluded.son", [new Date(now + TZ_MS).toISOString().slice(0, 10), xul ? 'hafta' : '', ok]); } catch (e) {} }          // anonim statistika (admin «Statistika»): faqat son
  if (!dry) { try { await q("INSERT INTO push_holat (kalit, qiymat, yangilangan) VALUES ('" + (xul ? 'oxirgi_xulosa' : 'oxirgi') + "', ?, ?) ON CONFLICT(kalit) DO UPDATE SET qiymat = excluded.qiymat, yangilangan = excluded.yangilangan", [JSON.stringify(natija), now]); } catch (e) { console.log('holat yozilmadi'); } }
  console.log(JSON.stringify(natija)); return natija;
}
if (require.main === module) main(process.argv.slice(2)).catch((e) => { console.error('XATO:', e.message); process.exit(1); });
module.exports = { hafta, matn, payload, payloadX, main, HOST, eslatmaYubor };
