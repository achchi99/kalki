/* kalki.uz — KalkiFit ANONIM statistika (D1: stat_qurilma, stat_kun, stat_yig — migrations/stat.sql). Admin: admin/kalkifit-statistika.html.
 *   POST /api/stat  { q: mijoz_id (uuid), p: 'veb'|'android'|'ios-pwa', t: 'uz'|'cyr'|'ru', h: [[hodisa, kalit, n], ...] }  → 204 (har doim jim)
 *   GET  /api/stat?davr=1|7|30|0  (X-Admin-Password) → hisobot JSON (KPI + avvalgi davr, 30 kunlik seriya, platforma/til, funksiyalar, push, topilmagan so'zlar)
 * MAXFIYLIK: ism/email/IP/ovqat/vazn/yosh saqlanmaydi. Qurilma = SHA-256(sirli tuz + mijoz_id) ning 16 belgisi (xom mijoz_id saqlanmaydi).
 *   Kunlik qurilma qatorlari 35 kundan keyin o'chadi (oldin stat_yig ga yig'iladi — faqat sonlar). Hisoblanmaydi: preview (*.pages.dev), bot/headless, Origin kalki.uz bo'lmasa.
 * Hodisalar va qo'shimcha kalitlar QAT'IY ro'yxatdan (erkin matn qabul qilinmaydi). Chegara: bir so'rovda ≤ 30 qator, n ≤ 20; qurilma kuniga ≤ 400 hodisa. */
import { json } from './ariza.js';

const ANY = /^$/, USUL = /^(qidiruv|rasm|retsept|oxirgilar|tavsiya|ovoz|menyu|matn|odatdagi|boshqa)$/, LANG = /^(uz|cyr|ru)$/;
export const HODISA = {
  faol: ANY, yangi_foydalanuvchi: ANY, til_tanlandi: LANG, onboarding_tugadi: ANY, onboarding_keyinroq: ANY,
  ovqat_qoshildi: USUL, qidiruv_topilmadi: ANY, yeymiz_chip: /^(kabob|suyuq|tandir|tez|baliq|uyda|boshqa)$/, yeymiz_segment: /^(kafe|buyurtma|uyda)$/, buyurtma_hamkor: /^(uzum|yandex)$/,
  ai_sorov: /^(matn|rasm|retsept|ovoz|menyu)\.(ok|limit|xato|format|tarmoq|vaqt|hajm|server|bosh)$/, suv_qoshildi: ANY, qadam_ulandi: /^(hc|sensor)$/, baliq_kuni_obuna: ANY, baliq_kuni_bekor: ANY,
  push_bosildi: ANY, apk_yuklandi: ANY, ilova_yangilandi: /^\d{1,2}\.\d{1,2}\.\d{1,3}$/, kun_kartochka_ulashildi: ANY, hazil_yopildi: ANY, haftalik_ochildi: ANY
};
export const SERVER_HODISA = ['push_yuborildi'];          // faqat server (tools/push-yubor.js D1 REST orqali) yozadi — mijozdan qabul qilinmaydi
const PLAT = /^(veb|android|ios-pwa)$/, UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BOT = /bot\b|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|telegrambot|whatsapp|curl|wget|python-requests|axios|node-fetch|phantom|puppeteer|playwright/i;
export const KEEP_DAYS = 35, DEV_CAP = 400;
const NC = { 'Cache-Control': 'no-store' };
const quiet = () => new Response(null, { status: 204, headers: NC });
export const tosh = (ms) => new Date(ms + 5 * 3600000).toISOString().slice(0, 10);
const addD = (d, n) => tosh(Date.parse(d + 'T00:00:00Z') - 5 * 3600000 + n * 86400000 + 12 * 3600000);
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join(''); }
export async function qurilma(env, mijoz) { return (await sha((env.STAT_SALT || env.IP_HASH_SALT || 'kalki-stat') + '|stat|' + String(mijoz).toLowerCase())).slice(0, 16); }

/* so'rov tanasini qat'iy tozalash → { p, t, h: [{ h, k, n }] } yoki null */
export function tozala(b) {
  if (!b || typeof b !== 'object' || typeof b.q !== 'string' || !UUID.test(b.q) || !PLAT.test(String(b.p || '')) || !LANG.test(String(b.t || '')) || !Array.isArray(b.h) || b.h.length > 30) return null;
  const out = [];
  for (const r of b.h) {
    if (!Array.isArray(r)) return null; const h = String(r[0] || ''), k = r[1] == null ? '' : String(r[1]), n = Math.round(Number(r[2] == null ? 1 : r[2]));
    if (!Object.prototype.hasOwnProperty.call(HODISA, h) || !HODISA[h].test(k) || !(n >= 1 && n <= 20)) return null;
    out.push({ h, k, n });
  }
  return { q: b.q, p: b.p, t: b.t, h: out };
}
function originOk(request, env) {
  const o = request.headers.get('Origin') || '', u = request.headers.get('Referer') || '', host = (() => { try { return new URL(o || u).host; } catch (e) { return ''; } })();
  if (host === 'kalki.uz' || host === 'www.kalki.uz') return true;
  return env.STAT_ALLOW_LOCAL === '1' && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);          // faqat lokal sinov
}
/* 35 kundan eski qurilma qatorlari: avval stat_yig ga (kun, platforma, til → dau, yangi), keyin o'chiriladi */
export async function tozalash(db, now) {
  const chek = addD(tosh(now), -KEEP_DAYS);
  await db.batch([
    db.prepare('INSERT INTO stat_yig (kun, platforma, til, dau, yangi) SELECT kun, platforma, til, COUNT(*), SUM(yangi) FROM stat_qurilma WHERE kun < ? GROUP BY kun, platforma, til ON CONFLICT(kun, platforma, til) DO UPDATE SET dau = excluded.dau, yangi = excluded.yangi').bind(chek),
    db.prepare('DELETE FROM stat_qurilma WHERE kun < ?').bind(chek)
  ]);
  return chek;
}

export async function qabul(request, env, now) {
  const db = env.KALKIFIT_DB; if (!db) return quiet();
  if (BOT.test(request.headers.get('User-Agent') || '') || !originOk(request, env)) return quiet();
  let b; try { const raw = await request.text(); if (raw.length > 6000) return quiet(); b = JSON.parse(raw); } catch (e) { return quiet(); }
  const c = tozala(b); if (!c || !c.h.length) return quiet();
  const kun = tosh(now), q = await qurilma(env, c.q), jami = c.h.reduce((a, x) => a + x.n, 0), yangi = c.h.some((x) => x.h === 'yangi_foydalanuvchi') ? 1 : 0;
  try {
    const row = await db.prepare('INSERT INTO stat_qurilma (kun, q, platforma, til, yangi, n) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(kun, q) DO UPDATE SET n = n + excluded.n, yangi = MAX(yangi, excluded.yangi), til = excluded.til RETURNING n').bind(kun, q, c.p, c.t, yangi, jami).first();
    if (row && row.n > DEV_CAP) return quiet();                                       // qurilma kuniga ≤ 400 hodisa (rate-limit)
    await db.batch(c.h.filter((x) => x.h !== 'faol').map((x) => db.prepare('INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, ?, ?, ?, ?) ON CONFLICT(kun, hodisa, kalit, platforma) DO UPDATE SET son = son + excluded.son').bind(kun, x.h, x.k, c.p, x.n)));
    if (Math.random() < (env.STAT_PRUNE_P ? Number(env.STAT_PRUNE_P) : 0.02)) await tozalash(db, now);
  } catch (e) {}
  return quiet();
}

/* ---------- admin hisobot ---------- */
async function same(a, b) { const x = await sha('st|' + a), y = await sha('st|' + b); let r = 0; for (let i = 0; i < x.length; i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i); return r === 0 && x.length === y.length; }
const all = async (db, sql, ...a) => ((await db.prepare(sql).bind(...a).all()).results || []);
const one = async (db, sql, ...a) => (await db.prepare(sql).bind(...a).first()) || {};
async function devCount(db, dan, gacha) { return (await one(db, 'SELECT COUNT(DISTINCT q) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ?', dan, gacha)).n || 0; }
async function evSum(db, h, dan, gacha) { return (await one(db, 'SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = ? AND kun >= ? AND kun <= ?', h, dan, gacha)).n || 0; }
async function dauAvg(db, dan, gacha) {
  const r = await all(db, 'SELECT kun, COUNT(*) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ? GROUP BY kun', dan, gacha), y = await all(db, 'SELECT kun, SUM(dau) AS n FROM stat_yig WHERE kun >= ? AND kun <= ? GROUP BY kun', dan, gacha), m = {};
  y.forEach((x) => { m[x.kun] = x.n; }); r.forEach((x) => { m[x.kun] = x.n; }); const v = Object.values(m); return v.length ? Math.round(v.reduce((a, x) => a + x, 0) / v.length * 10) / 10 : 0;
}
async function yangiSum(db, dan, gacha) { const a = (await one(db, 'SELECT SUM(yangi) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ?', dan, gacha)).n || 0, b = (await one(db, 'SELECT SUM(yangi) AS n FROM stat_yig WHERE kun >= ? AND kun <= ? AND kun NOT IN (SELECT DISTINCT kun FROM stat_qurilma)', dan, gacha)).n || 0; return a + b; }
/* retention: shu davrda yangi bo'lgan qurilmalardan N kundan keyin qaytganlar ulushi (faqat N kun o'tgan kogortalar) */
export async function retention(db, dan, gacha, n, bugun) {
  const lim = addD(bugun, -n), g2 = gacha < lim ? gacha : lim; if (g2 < dan) return null;
  const r = await one(db, 'SELECT COUNT(*) AS jami, SUM(CASE WHEN EXISTS (SELECT 1 FROM stat_qurilma b WHERE b.q = a.q AND b.kun = date(a.kun, ?)) THEN 1 ELSE 0 END) AS qaytdi FROM stat_qurilma a WHERE a.yangi = 1 AND a.kun >= ? AND a.kun <= ?', '+' + n + ' day', dan, g2);
  return r.jami ? Math.round((r.qaytdi || 0) / r.jami * 1000) / 10 : null;
}
export async function kpi(db, dan, gacha, bugun) {
  const yangi = await yangiSum(db, dan, gacha), ob = await evSum(db, 'onboarding_tugadi', dan, gacha), obNew = await evSum(db, 'yangi_foydalanuvchi', dan, gacha) || yangi;
  return { dau: await dauAvg(db, dan, gacha), wau: await devCount(db, addD(gacha, -6), gacha), mau: await devCount(db, addD(gacha, -29), gacha), yangi, onboarding: obNew ? Math.round(Math.min(1, ob / obNew) * 1000) / 10 : null,
    ret1: await retention(db, dan, gacha, 1, bugun), ret7: await retention(db, dan, gacha, 7, bugun), apk: await evSum(db, 'apk_yuklandi', dan, gacha),
    ai: (await one(db, "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ai_sorov' AND kun >= ? AND kun <= ?", dan, gacha)).n || 0 };
}
export async function hisobot(db, davr, now) {
  const bugun = tosh(now), d = [1, 7, 30].includes(davr) ? davr : 0, dan = d ? addD(bugun, -(d - 1)) : '2000-01-01', gacha = bugun;
  const cur = await kpi(db, dan, gacha, bugun), prev = d ? await kpi(db, addD(dan, -d), addD(dan, -1), bugun) : null;
  let baliq = 0; try { baliq = (await one(db, 'SELECT COUNT(*) AS n FROM push_obuna')).n || 0; } catch (e) {}
  const s0 = addD(bugun, -29), seriya = []; const qd = await all(db, 'SELECT kun, COUNT(*) AS dau, SUM(yangi) AS yangi FROM stat_qurilma WHERE kun >= ? GROUP BY kun', s0), yg = await all(db, 'SELECT kun, SUM(dau) AS dau, SUM(yangi) AS yangi FROM stat_yig WHERE kun >= ? GROUP BY kun', s0), m = {};
  yg.forEach((x) => { m[x.kun] = x; }); qd.forEach((x) => { m[x.kun] = x; }); for (let i = 0; i < 30; i++) { const k = addD(s0, i), x = m[k] || {}; seriya.push({ kun: k, dau: x.dau || 0, yangi: x.yangi || 0 }); }
  const ulush = async (col) => { let r = await all(db, 'SELECT ' + col + ' AS k, COUNT(DISTINCT q) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ? GROUP BY ' + col, dan, gacha); if (!r.length) r = await all(db, 'SELECT ' + col + ' AS k, SUM(dau) AS n FROM stat_yig WHERE kun >= ? AND kun <= ? GROUP BY ' + col, dan, gacha); return r; };
  const funk = await all(db, 'SELECT hodisa, kalit, SUM(son) AS son FROM stat_kun WHERE kun >= ? AND kun <= ? GROUP BY hodisa, kalit ORDER BY son DESC', dan, gacha);
  const pushY = await evSum(db, 'push_yuborildi', dan, gacha), pushB = await evSum(db, 'push_bosildi', dan, gacha);
  let topilmadi = []; try { topilmadi = await all(db, 'SELECT soz, SUM(son) AS son FROM qidiruv_topilmadi WHERE sana >= ? AND sana <= ? GROUP BY soz ORDER BY son DESC LIMIT 20', dan, gacha); } catch (e) {}
  return { davr: d, dan, gacha, kpi: Object.assign(cur, { baliq }), oldingi: prev, seriya, platforma: await ulush('platforma'), til: await ulush('til'), funksiyalar: funk, push: { yuborildi: pushY, bosildi: pushB, foiz: pushY ? Math.round(pushB / pushY * 1000) / 10 : null }, topilmadi };
}

export async function onRequest({ request, env }) {
  const now = Date.now();
  if (request.method === 'POST') return qabul(request, env, now);
  if (request.method !== 'GET') return json(405, { xato: 'GET yoki POST.' }, Object.assign({ Allow: 'GET, POST' }, NC));
  const db = env.KALKIFIT_DB; if (!db || !env.KALKIFIT_ADMIN_PASSWORD) return json(503, { xato: 'Sozlanmagan.' }, NC);
  const kv = env.KALKI_AI_KV, ik = 'st:' + (await sha('st' + (request.headers.get('CF-Connecting-IP') || '?'))).slice(0, 16);
  if (kv && (parseInt(await kv.get(ik), 10) || 0) >= 10) return json(429, { xato: "Juda ko'p urinish. Keyinroq." }, NC);
  const pw = request.headers.get('X-Admin-Password') || '';
  if (!pw || !(await same(pw, env.KALKIFIT_ADMIN_PASSWORD))) { if (kv) await kv.put(ik, String((parseInt(await kv.get(ik), 10) || 0) + 1), { expirationTtl: 3600 }); return json(401, { xato: "Parol noto'g'ri." }, NC); }
  try { await tozalash(db, now); return json(200, await hisobot(db, parseInt(new URL(request.url).searchParams.get('davr'), 10) || 0, now), NC); } catch (e) { return json(503, { xato: 'Jadval yo\'q (migrations/stat.sql).' }, NC); }
}
