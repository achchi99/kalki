/* kalki.uz — KalkiFit anonim hisoblagichlar (D1 hisob_kun). Faqat yig'indi: kun + hodisa + son. Foydalanuvchi id, IP, qurilma, cookie — YO'Q.
 *   POST /api/hisob  { k: [ { s: 'YYYY-MM-DD', h: 'hodisa', n: 1 }, ... ] }  → 204 (jim; xatoda ham ilova hech narsa ko'rsatmaydi)
 *   GET  /api/hisob?kun=30 (X-Admin-Password) → { kunlar: [ { sana, hodisa, son } ], jami: { hodisa: son } }
 * Himoya: Origin tekshiruvi, hodisa nomi QAT'IY ro'yxatdan (ixtiyoriy matn qabul qilinmaydi), n ≤ 20, ≤ 40 qator, sana ± 3 kun. Migratsiya: migrations/hisob.sql. */
import { originOk, json } from './ariza.js';

export const HODISA = ['orinbosar_korsatildi', 'orinbosar_tanlandi', 'baliq_oyna_ochildi', 'baliq_buyurtma_bosildi', 'baliq_kafe_yozildi', 'baliq_uyda_ochildi', 'yeymiz_ochildi', 'yeymiz_tanlandi'];
export const XIZMAT = ['uzum-tezkor', 'yandex-eda'];                      // baliq_buyurtma_bosildi.<xizmat> — faqat shu nomlar
const KEY = new RegExp('^(?:' + HODISA.filter((h) => h !== 'baliq_buyurtma_bosildi').join('|') + '|baliq_buyurtma_bosildi(?:\\.(?:' + XIZMAT.join('|') + '))?)$');      // xizmat qo'shimchasi FAQAT buyurtma hodisasida
const NC = { 'Cache-Control': 'no-store' };
const E = { 400: "So'rov noto'g'ri.", 401: "Parol noto'g'ri.", 403: "Ruxsat yo'q.", 405: "Usul noto'g'ri.", 415: 'JSON yuboring.', 429: "Juda ko'p urinish. Keyinroq.", 503: 'Sozlanmagan.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' }, NC);
async function sha(s) { return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))); }
async function same(a, b) { const x = await sha('hs|' + a), y = await sha('hs|' + b); let r = 0; for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i]; return r === 0; }
const tosh = (now) => new Date(now + 5 * 3600000).toISOString().slice(0, 10);       // Toshkent = UTC+5
/* so'rov tanasini tozalaydi: faqat ruxsat etilgan qatorlar qoladi → [{ sana, hodisa, n }] */
export function tozala(b, now) {
  if (!b || typeof b !== 'object' || !Array.isArray(b.k) || b.k.length > 40) return null;
  const t = Date.parse(tosh(now || Date.now())), out = [];
  for (const q of b.k) {
    if (!q || typeof q !== 'object' || typeof q.s !== 'string' || typeof q.h !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(q.s) || !KEY.test(q.h)) continue;
    const d = Date.parse(q.s); if (!(Math.abs(d - t) <= 3 * 86400000)) continue;
    const n = Math.round(Number(q.n)); if (!(n >= 1 && n <= 20)) continue; out.push({ sana: q.s, hodisa: q.h, n });
  }
  return out;
}
export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') return json(405, { xato: E[405] }, Object.assign({ Allow: 'GET, POST' }, NC));
  const db = env.KALKIFIT_DB; if (!db) return fail(503);
  if (request.method === 'GET') {
    if (!env.KALKIFIT_ADMIN_PASSWORD) return fail(503);
    const kv = env.KALKI_AI_KV, ip = 'hs:' + Array.from((await sha('hs' + (request.headers.get('CF-Connecting-IP') || '?'))).slice(0, 8)).map((b) => b.toString(16).padStart(2, '0')).join('');
    if (kv && (parseInt(await kv.get(ip), 10) || 0) >= 10) return fail(429);
    const pw = request.headers.get('X-Admin-Password') || '';
    if (!pw || !(await same(pw, env.KALKIFIT_ADMIN_PASSWORD))) { if (kv) await kv.put(ip, String((parseInt(await kv.get(ip), 10) || 0) + 1), { expirationTtl: 3600 }); return fail(401); }
    const kun = Math.max(1, Math.min(365, parseInt(new URL(request.url).searchParams.get('kun'), 10) || 30)), dan = tosh(Date.now() - (kun - 1) * 86400000);
    let r; try { r = await db.prepare('SELECT sana, hodisa, son FROM hisob_kun WHERE sana >= ? ORDER BY sana, hodisa').bind(dan).all(); } catch (e) { return fail(503); }
    const kunlar = r.results || [], jami = {}; kunlar.forEach((x) => { jami[x.hodisa] = (jami[x.hodisa] || 0) + x.son; });
    return json(200, { kunlar, jami }, NC);
  }
  const origin = request.headers.get('Origin'); if (!origin || !originOk(origin, env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let b; try { const raw = await request.text(); if (raw.length > 4000) return fail(400); b = JSON.parse(raw); } catch (e) { return fail(400); }
  const q = tozala(b, Date.now()); if (!q) return fail(400);
  if (q.length) {
    try { await db.batch(q.map((x) => db.prepare('INSERT INTO hisob_kun (sana, hodisa, son) VALUES (?, ?, ?) ON CONFLICT(sana, hodisa) DO UPDATE SET son = son + excluded.son').bind(x.sana, x.hodisa, x.n))); }
    catch (e) { return fail(503); }
  }
  return new Response(null, { status: 204, headers: NC });
}
