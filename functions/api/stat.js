/* kalki.uz — KalkiFit ANONIM statistika (D1: stat_qurilma, stat_kun, stat_yig — migrations/stat.sql). Admin: admin/kalkifit-statistika.html.
 *   POST /api/stat  { q: mijoz_id (uuid), p: 'veb'|'android'|'ios-pwa', t: 'uz'|'cyr'|'ru', h: [[hodisa, kalit, n], ...] }  → 204 (har doim jim)
 *   GET  /api/stat?davr=7|30|90 (yoki 1|0)  (admin sessiyasi yoki X-Admin-Password) → hisobot JSON (KPI + avvalgi davr, seriya, retention va kogortalar, qurilmalar, funksiyalar, AI xarajati, konversiya, push, topilmagan so'zlar)
 * MAXFIYLIK: ism/email/IP/ovqat/vazn/yosh saqlanmaydi. Qurilma = SHA-256(sirli tuz + mijoz_id) ning 16 belgisi (xom mijoz_id saqlanmaydi).
 *   Qurilma TURI (tur/OS/brauzer/model/ekran guruhi/APK versiyasi) — User-Agent va ilova versiyasidan serverda (functions/_lib/qurilma-tur.js); IP va joylashuv saqlanmaydi.
 *   Kunlik qurilma qatorlari 100 kundan keyin o'chadi (oldin stat_yig ga yig'iladi — faqat sonlar). Hisoblanmaydi: preview (*.pages.dev), bot/headless, Origin kalki.uz bo'lmasa.
 * Hodisalar va qo'shimcha kalitlar QAT'IY ro'yxatdan (erkin matn qabul qilinmaydi). Chegara: bir so'rovda ≤ 30 qator, n ≤ 20; qurilma kuniga ≤ 400 hodisa. */
import { json } from './ariza.js';
import { turOf, ekranOf } from '../_lib/qurilma-tur.js';
import { yigMiqdorsiz } from '../_lib/soz-norm.js';
import { adminAuth } from '../_lib/admin-auth.js';

const ANY = /^$/, USUL = /^(qidiruv|rasm|retsept|oxirgilar|tavsiya|ovoz|menyu|matn|odatdagi|boshqa)$/, LANG = /^(uz|cyr|ru)$/;
export const HODISA = {
  faol: ANY, yangi_foydalanuvchi: ANY, til_tanlandi: LANG, onboarding_tugadi: ANY, onboarding_keyinroq: ANY,
  ovqat_qoshildi: USUL, qidiruv_topilmadi: ANY, yeymiz_chip: /^(kabob|suyuq|tandir|tez|baliq|uyda|boshqa)$/, yeymiz_segment: /^(kafe|buyurtma|uyda)$/, buyurtma_hamkor: /^(uzum|yandex)$/,
  ai_sorov: /^(matn|rasm|retsept|ovoz|menyu)\.(ok|limit|xato|format|tarmoq|vaqt|hajm|server|bosh)$/, suv_qoshildi: ANY, qadam_ulandi: /^(hc|sensor)$/, baliq_kuni_obuna: ANY, baliq_kuni_bekor: ANY,
  push_bosildi: ANY, apk_yuklandi: ANY, ilova_yangilandi: /^\d{1,2}\.\d{1,2}\.\d{1,3}$/, kun_kartochka_ulashildi: ANY, hazil_yopildi: ANY, haftalik_ochildi: ANY,
  plato_ochildi: /^(need|slow|fine|fast)$/, plato_sabab: /^(qadam|yozilmagan|damolish|oqsil|defitsit|porsiya|joyida|fast|low)$/, plato_belgi: /^(walk|log|wkend|prot|goal|weigh|sleep|gram)$/,
  tartib_tanlandi: /^(std|kech|nobf|erkin)$/, tartib_kun: /^(std|kech|nobf|erkin)$/, oqsil_kun: /^(ha|yoq)$/          // v48: tartib taqsimoti, kecha oqsil maqsadiga yetildimi (anonim)          // «Nega sekin ozyapman?»: anonim — holat, sabab turi, belgilangan ish
};
export const SERVER_HODISA = ['push_yuborildi'];          // faqat server (tools/push-yubor.js D1 REST orqali) yozadi — mijozdan qabul qilinmaydi
const PLAT = /^(veb|android|ios-pwa)$/, UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const BOT = /bot\b|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|telegrambot|whatsapp|curl|wget|python-requests|axios|node-fetch|phantom|puppeteer|playwright/i;
export const KEEP_DAYS = 100, DEV_CAP = 400;          // 100 kun: 90 kunlik davr va 30-kun retention kogortalari uchun
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
  return { q: b.q, p: b.p, t: b.t, h: out, e: Number(b.e) || 0, v: typeof b.v === 'string' ? b.v.slice(0, 12) : '' };
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
  const kun = tosh(now), q = await qurilma(env, c.q), jami = c.h.reduce((a, x) => a + x.n, 0), yangi = c.h.some((x) => x.h === 'yangi_foydalanuvchi') ? 1 : 0, d = turOf(request.headers.get('User-Agent'), c.p, c.v), ek = ekranOf(c.e);
  try {
    const row = await db.prepare("INSERT INTO stat_qurilma (kun, q, platforma, til, yangi, n, tur, os, br, model, ekran, ver) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(kun, q) DO UPDATE SET n = n + excluded.n, yangi = MAX(yangi, excluded.yangi), til = excluded.til, tur = excluded.tur, os = excluded.os, br = excluded.br, model = CASE WHEN excluded.model != '' THEN excluded.model ELSE model END, ekran = CASE WHEN excluded.ekran != '' THEN excluded.ekran ELSE ekran END, ver = CASE WHEN excluded.ver != '' THEN excluded.ver ELSE ver END RETURNING n").bind(kun, q, c.p, c.t, yangi, jami, d.tur, d.os, d.br, d.model, ek, d.ver).first();
    if (row && row.n > DEV_CAP) return quiet();                                       // qurilma kuniga ≤ 400 hodisa (rate-limit)
    await db.batch(c.h.filter((x) => x.h !== 'faol').map((x) => db.prepare('INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, ?, ?, ?, ?) ON CONFLICT(kun, hodisa, kalit, platforma) DO UPDATE SET son = son + excluded.son').bind(kun, x.h, x.k, c.p, x.n)));
    if (Math.random() < (env.STAT_PRUNE_P ? Number(env.STAT_PRUNE_P) : 0.02)) await tozalash(db, now);
  } catch (e) {}
  return quiet();
}

/* ---------- admin hisobot ---------- */
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
    ai: (await one(db, "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ai_sorov' AND kalit NOT LIKE 'ovoz.%' AND kun >= ? AND kun <= ?", dan, gacha)).n || 0,
    ovoz: (await one(db, "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ai_sorov' AND kalit LIKE 'ovoz.%' AND kun >= ? AND kun <= ?", dan, gacha)).n || 0 };          // AI va ovoz — alohida hisoblar (ovoz: ovoz.ok / ovoz.limit / ovoz.xato)
}
/* AI/ovoz xarajati: muvaffaqiyatli so'rov uchun TAXMINIY dollar narxi (model narxlari va o'rtacha hajmdan; aniq hisob — provayder kabinetida). Yangilansa — shu yerda. */
export const NARX = { matn: 0.0015, rasm: 0.004, menyu: 0.008, retsept: 0.003, ovoz: 0.0015 };
export const FUNK = [['qidiruv', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ovqat_qoshildi' AND kalit = 'qidiruv' AND kun >= ? AND kun <= ?"], ['ovoz', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ai_sorov' AND kalit LIKE 'ovoz.%' AND kun >= ? AND kun <= ?"],
  ['rasm', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ai_sorov' AND kalit LIKE 'rasm.%' AND kun >= ? AND kun <= ?"], ['menyu', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'ai_sorov' AND kalit LIKE 'menyu.%' AND kun >= ? AND kun <= ?"],
  ['yeymiz', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'yeymiz_segment' AND kun >= ? AND kun <= ?"], ['haftangiz', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'haftalik_ochildi' AND kun >= ? AND kun <= ?"], ['ulashish', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'kun_kartochka_ulashildi' AND kun >= ? AND kun <= ?"], ['plato', "SELECT SUM(son) AS n FROM stat_kun WHERE hodisa = 'plato_ochildi' AND kun >= ? AND kun <= ?"]];
/* kogortalar: davr ichidagi 7 kunlik guruhlar (eng yangisi birinchi) — hajm va 1/7/30-kun qaytish ulushi (yetilmaganlari null) */
export async function kogortalar(db, dan, gacha, bugun) {
  const out = []; let end = gacha; const start = dan < addD(gacha, -89) ? addD(gacha, -89) : dan;
  while (end >= start && out.length < 13) {
    const c0 = addD(end, -6) < start ? start : addD(end, -6), row = { dan: c0, gacha: end };
    row.jami = (await one(db, 'SELECT COUNT(*) AS n FROM stat_qurilma WHERE yangi = 1 AND kun >= ? AND kun <= ?', c0, end)).n || 0;
    for (const n of [1, 7, 30]) { const lim = addD(bugun, -n), g2 = end < lim ? end : lim; if (!row.jami || g2 < c0) { row['d' + n] = null; continue; }
      const r = await one(db, 'SELECT COUNT(*) AS jami, SUM(CASE WHEN EXISTS (SELECT 1 FROM stat_qurilma b WHERE b.q = a.q AND b.kun = date(a.kun, ?)) THEN 1 ELSE 0 END) AS qaytdi FROM stat_qurilma a WHERE a.yangi = 1 AND a.kun >= ? AND a.kun <= ?', '+' + n + ' day', c0, g2);
      row['d' + n] = r.jami ? Math.round((r.qaytdi || 0) / r.jami * 1000) / 10 : null; }
    out.push(row); end = addD(c0, -1);
  }
  return out;
}
export async function kengaytma(db, dan, gacha, bugun, now) {
  const kpi = { yangi_bugun: await yangiSum(db, bugun, bugun), yangi_hafta: await yangiSum(db, addD(bugun, -6), bugun), ret30: await retention(db, dan, gacha, 30, bugun) };
  const dauJami = (await all(db, 'SELECT kun, COUNT(*) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ? GROUP BY kun', dan, gacha)).reduce((a, x) => a + x.n, 0), ovq = await evSum(db, 'ovqat_qoshildi', dan, gacha);
  kpi.ovqat_kun = dauJami ? Math.round(ovq / dauJami * 10) / 10 : null;
  const foydalanish = {}; for (const [k, q] of FUNK) foydalanish[k] = (await one(db, q, dan, gacha)).n || 0;
  const ok = await all(db, "SELECT kalit, SUM(son) AS n FROM stat_kun WHERE hodisa = 'ai_sorov' AND kalit LIKE '%.ok' AND kun >= ? AND kun <= ? GROUP BY kalit", dan, gacha), xarajat = { jami: 0, tur: {} };
  let raw = 0; ok.forEach((x) => { const t = x.kalit.split('.')[0], u = (NARX[t] || 0) * x.n; raw += u; xarajat.tur[t] = { soni: x.n, usd: Math.round(u * 10000) / 10000 }; }); xarajat.jami = Math.round(raw * 100) / 100;          // har tur — 4 xona, jami — sent (yaxlitlash xatosi yig'ilmaydi)
  let konversiya = null; try { const t0 = Date.parse(dan + 'T00:00:00Z') - 5 * 3600000, t1 = Date.parse(gacha + 'T00:00:00Z') - 5 * 3600000 + 86400000;
    const a = (await one(db, "SELECT COUNT(DISTINCT akkaunt_id) AS n FROM akkaunt_ilova WHERE ilova = 'kalkifit' AND ulangan >= ? AND ulangan < ?", t0, t1)).n || 0, jami = (await one(db, "SELECT COUNT(DISTINCT akkaunt_id) AS n FROM akkaunt_ilova WHERE ilova = 'kalkifit'")).n || 0;
    konversiya = { akkaunt: a, jami, yangi: kpi.yangi_davr = await yangiSum(db, dan, gacha), foiz: kpi.yangi_davr ? Math.round(Math.min(1, a / kpi.yangi_davr) * 1000) / 10 : null }; } catch (e) {}
  kpi.konversiya = konversiya ? konversiya.foiz : null;
  const guruh = async (col, extra) => all(db, 'SELECT ' + col + " AS k, COUNT(DISTINCT q) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ? AND " + col + " != ''" + (extra || '') + ' GROUP BY ' + col + ' ORDER BY n DESC LIMIT 20', dan, gacha);
  let qurilmalar = null; try { qurilmalar = { tur: await guruh('tur'), versiya: await guruh('ver', " AND tur = 'android-ilova'"), os: await guruh('os'), brauzer: await guruh('br'), model: await guruh('model'), ekran: await guruh('ekran'), til: await guruh('til'), aniqlanmagan: (await one(db, "SELECT COUNT(DISTINCT q) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ? AND tur = ''", dan, gacha)).n || 0 }; } catch (e) {}
  return { kpi, bolim: { kogorta: await kogortalar(db, dan, gacha, bugun), foydalanish, xarajat, narx: NARX, konversiya, qurilmalar } };
}
export async function hisobot(db, davr, now) {
  const bugun = tosh(now), d = [1, 7, 30, 90].includes(davr) ? davr : 0, dan = d ? addD(bugun, -(d - 1)) : '2000-01-01', gacha = bugun;
  const cur = await kpi(db, dan, gacha, bugun), prev = d ? await kpi(db, addD(dan, -d), addD(dan, -1), bugun) : null;
  let baliq = 0; try { baliq = (await one(db, 'SELECT COUNT(*) AS n FROM push_obuna')).n || 0; } catch (e) {}
  const s0 = addD(bugun, -29), seriya = []; const qd = await all(db, 'SELECT kun, COUNT(*) AS dau, SUM(yangi) AS yangi FROM stat_qurilma WHERE kun >= ? GROUP BY kun', s0), yg = await all(db, 'SELECT kun, SUM(dau) AS dau, SUM(yangi) AS yangi FROM stat_yig WHERE kun >= ? GROUP BY kun', s0), m = {};
  yg.forEach((x) => { m[x.kun] = x; }); qd.forEach((x) => { m[x.kun] = x; }); for (let i = 0; i < 30; i++) { const k = addD(s0, i), x = m[k] || {}; seriya.push({ kun: k, dau: x.dau || 0, yangi: x.yangi || 0 }); }
  const ulush = async (col) => { let r = await all(db, 'SELECT ' + col + ' AS k, COUNT(DISTINCT q) AS n FROM stat_qurilma WHERE kun >= ? AND kun <= ? GROUP BY ' + col, dan, gacha); if (!r.length) r = await all(db, 'SELECT ' + col + ' AS k, SUM(dau) AS n FROM stat_yig WHERE kun >= ? AND kun <= ? GROUP BY ' + col, dan, gacha); return r; };
  const funk = await all(db, 'SELECT hodisa, kalit, SUM(son) AS son FROM stat_kun WHERE kun >= ? AND kun <= ? GROUP BY hodisa, kalit ORDER BY son DESC', dan, gacha);
  const pushY = await evSum(db, 'push_yuborildi', dan, gacha), pushB = await evSum(db, 'push_bosildi', dan, gacha);
  let topilmadi = []; try { topilmadi = yigMiqdorsiz(await all(db, 'SELECT soz, SUM(son) AS son FROM qidiruv_topilmadi WHERE sana >= ? AND sana <= ? GROUP BY soz ORDER BY son DESC LIMIT 500', dan, gacha), 20).map((x) => ({ soz: x.soz, son: x.son })); } catch (e) {}          // miqdorsiz yig'iladi: «рис 100 г» + «рис 90 г» = «рис»
  const ext = await kengaytma(db, dan, gacha, bugun, now);
  return Object.assign({ davr: d, dan, gacha, kpi: Object.assign(cur, { baliq }, ext.kpi), oldingi: prev, seriya, platforma: await ulush('platforma'), til: await ulush('til'), funksiyalar: funk, push: { yuborildi: pushY, bosildi: pushB, foiz: pushY ? Math.round(pushB / pushY * 1000) / 10 : null }, topilmadi }, ext.bolim);
}

export async function onRequest({ request, env }) {
  const now = Date.now();
  if (request.method === 'POST') return qabul(request, env, now);
  if (request.method !== 'GET') return json(405, { xato: 'GET yoki POST.' }, Object.assign({ Allow: 'GET, POST' }, NC));
  const db = env.KALKIFIT_DB; if (!db || !env.KALKIFIT_ADMIN_PASSWORD) return json(503, { xato: 'Sozlanmagan.' }, NC);
  const deny = await adminAuth(request, env, { now }); if (deny) return deny;
  try { await tozalash(db, now); return json(200, await hisobot(db, parseInt(new URL(request.url).searchParams.get('davr'), 10) || 0, now), NC); } catch (e) { return json(503, { xato: 'Jadval yo\'q (migrations/stat.sql).' }, NC); }
}
