/* kalki.uz — «Baliq kuni» eslatmasi: Web Push obunalari (D1 push_obuna). Yuborish bu yerda EMAS — Hetzner cron (tools/push-yubor.js).
 *   GET  /api/push/kalit               → { yoqilgan, kalit? }   (VAPID ochiq kalit; jadval yoki kalit yo'q bo'lsa yoqilgan:false — ilova taklif ko'rsatmaydi)
 *   POST /api/push/obuna  { obuna: PushSubscription.toJSON(), til }  → { ok, akkaunt }   (akkaunt: sessiya cookie'si bo'lsa unga ulanadi — ixtiyoriy)
 *   POST /api/push/ochir  { endpoint } → { ok }
 *   GET  /api/push/holat (X-Admin-Password) → { obunalar, akkaunt_bilan, til: {uz,cyr,ru}, oxirgi }   (admin: obuna soni va oxirgi yuborish natijasi)
 * Xavfsizlik: POST faqat Origin tekshiruvi + application/json; endpoint faqat ma'lum push xizmatlari (SSRF yo'q); IP boshiga soatiga 20 ta obuna (KV). Secret'lar: VAPID_PUBLIC_KEY (ochiq),
 * VAPID_PRIVATE_KEY/VAPID_SUBJECT (shu yerda ishlatilmaydi), KALKIFIT_ADMIN_PASSWORD. Migratsiya: migrations/push.sql. */
import { originOk, json } from '../ariza.js';

const METOD = { kalit: 'GET', obuna: 'POST', ochir: 'POST', holat: 'GET' };
const E = { 400: "So'rov noto'g'ri.", 401: "Parol noto'g'ri.", 403: "Ruxsat yo'q.", 404: 'Topilmadi.', 405: "Usul noto'g'ri.", 415: 'JSON yuboring.', 429: "Juda ko'p urinish. Keyinroq.", 503: 'Sozlanmagan.' };
const NC = { 'Cache-Control': 'no-store' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' }, NC);
const ENDPOINT_RE = /^https:\/\/(?:[a-z0-9-]+\.)*(?:googleapis\.com|mozilla\.com|push\.apple\.com|notify\.windows\.com)\/[\x21-\x7e]{8,480}$/;
const B64U = /^[A-Za-z0-9_-]+$/;
const enc = (s) => new TextEncoder().encode(s);
const hex = (u8) => Array.from(u8).map((b) => b.toString(16).padStart(2, '0')).join('');
async function sha(s) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc(s)))); }
const byteLen = (s) => (typeof s === 'string' && B64U.test(s) ? Math.floor(s.length * 3 / 4) : -1);
export function obunaTekshir(o, til) {                // → { endpoint, p256dh, auth, til } | null
  if (!o || typeof o !== 'object' || typeof o.endpoint !== 'string' || !ENDPOINT_RE.test(o.endpoint)) return null;
  const k = o.keys || {}; if (byteLen(k.p256dh) !== 65 || byteLen(k.auth) !== 16) return null;
  return { endpoint: o.endpoint, p256dh: k.p256dh, auth: k.auth, til: til === 'ru' || til === 'cyr' ? til : 'uz' };
}
function cookieOf(request) { const m = /(?:^|;\s*)(?:__Host-)?kalki_s=([A-Za-z0-9_-]{43})(?:;|$)/.exec(request.headers.get('Cookie') || ''); return m ? m[1] : null; }
async function same(a, b) { const x = await sha('push|' + a), y = await sha('push|' + b); return x === y; }

export async function onRequest({ request, env, params }) {
  const amal = params && (Array.isArray(params.amal) ? params.amal[0] : params.amal);
  if (!METOD[amal]) return fail(404);
  if (request.method !== METOD[amal]) return json(405, { xato: E[405] }, Object.assign({ Allow: METOD[amal] }, NC));
  const db = env.KALKIFIT_DB, pub = env.VAPID_PUBLIC_KEY;
  if (amal === 'kalit') {
    if (!db || !pub || byteLen(pub) !== 65) return json(200, { yoqilgan: false }, NC);
    try { await db.prepare('SELECT 1 FROM push_obuna LIMIT 1').first(); } catch (e) { return json(200, { yoqilgan: false }, NC); }      // migratsiya yurgizilmagan → taklif ko'rinmaydi
    return json(200, { yoqilgan: true, kalit: pub }, NC);
  }
  if (!db) return fail(503);
  if (amal === 'holat') {
    if (!env.KALKIFIT_ADMIN_PASSWORD) return fail(503);
    const pw = request.headers.get('X-Admin-Password') || ''; if (!pw || !(await same(pw, env.KALKIFIT_ADMIN_PASSWORD))) return fail(401);
    const c = await db.prepare("SELECT COUNT(*) AS n, SUM(CASE WHEN akkaunt_id IS NOT NULL THEN 1 ELSE 0 END) AS a, SUM(CASE WHEN til = 'uz' THEN 1 ELSE 0 END) AS uz, SUM(CASE WHEN til = 'cyr' THEN 1 ELSE 0 END) AS cyr, SUM(CASE WHEN til = 'ru' THEN 1 ELSE 0 END) AS ru FROM push_obuna").first();
    const h = await db.prepare("SELECT qiymat, yangilangan FROM push_holat WHERE kalit = 'oxirgi'").first(); let oxirgi = null; try { oxirgi = h ? JSON.parse(h.qiymat) : null; } catch (e) { oxirgi = null; }
    return json(200, { obunalar: (c && c.n) || 0, akkaunt_bilan: (c && c.a) || 0, til: { uz: (c && c.uz) || 0, cyr: (c && c.cyr) || 0, ru: (c && c.ru) || 0 }, oxirgi }, NC);
  }
  const origin = request.headers.get('Origin'); if (!origin || !originOk(origin, env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let b; try { const raw = await request.text(); if (raw.length > 3000) return fail(400); b = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!b || typeof b !== 'object') return fail(400);
  const kv = env.KALKI_AI_KV;
  if (amal === 'obuna') {
    const o = obunaTekshir(b.obuna, b.til); if (!o) return fail(400);
    if (kv) { const k = 'push:' + (await sha((env.IP_HASH_SALT || '') + '|' + (request.headers.get('CF-Connecting-IP') || '?'))).slice(0, 20), c = parseInt(await kv.get(k), 10) || 0; if (c >= 20) return fail(429); await kv.put(k, String(c + 1), { expirationTtl: 3600 }); }
    let akk = null; const tok = cookieOf(request);
    if (tok) { try { const s = await db.prepare('SELECT akkaunt_id, muddat_abs FROM sessiya WHERE id = ?').bind(await sha(tok)).first(); if (s && s.muddat_abs > Date.now()) akk = s.akkaunt_id; } catch (e) { akk = null; } }
    const id = await sha(o.endpoint), now = Date.now();
    try {
      await db.prepare('INSERT INTO push_obuna (id, endpoint, p256dh, auth, til, akkaunt_id, yaratilgan) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, til = excluded.til, akkaunt_id = COALESCE(excluded.akkaunt_id, push_obuna.akkaunt_id), xato = 0')
        .bind(id, o.endpoint, o.p256dh, o.auth, o.til, akk, now).run();
    } catch (e) { return fail(503); }
    return json(200, { ok: true, akkaunt: !!akk }, NC);
  }
  /* ochir */
  if (typeof b.endpoint !== 'string' || !ENDPOINT_RE.test(b.endpoint)) return fail(400);
  try { await db.prepare('DELETE FROM push_obuna WHERE id = ?').bind(await sha(b.endpoint)).run(); } catch (e) { return fail(503); }
  return json(200, { ok: true }, NC);
}
