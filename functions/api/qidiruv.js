/* kalki.uz — KalkiFit: qidiruvda topilmagan so'zlar (anonim, D1 qidiruv_topilmadi). Bazani to'ldirish uchun: odamlar nimani qidirib topolmayapti.
 *   POST /api/qidiruv { k: [ { s: 'YYYY-MM-DD', q: 'so\'z', n: 1 } ] } → 204 (jim)
 *   GET  /api/qidiruv?kun=30 (X-Admin-Password) → { sozlar: [ { soz, son, kun } ] }   (hisobot: tools/qidiruv-hisobot.js)
 * Saqlanadi FAQAT: kun + tozalangan so'z + son. Foydalanuvchi id, IP, qurilma — YO'Q. So'z qat'iy tozalanadi (telefon/email/havola kabi matn rad etiladi).
 * Migratsiya: migrations/qidiruv.sql. Uslub — functions/api/hisob.js. */
import { originOk, json } from './ariza.js';

const NC = { 'Cache-Control': 'no-store' };
const E = { 400: "So'rov noto'g'ri.", 401: "Parol noto'g'ri.", 403: "Ruxsat yo'q.", 405: "Usul noto'g'ri.", 415: 'JSON yuboring.', 429: "Juda ko'p urinish. Keyinroq.", 503: 'Sozlanmagan.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' }, NC);
async function sha(s) { return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))); }
async function same(a, b) { const x = await sha('qt|' + a), y = await sha('qt|' + b); let r = 0; for (let i = 0; i < x.length; i++) r |= x[i] ^ y[i]; return r === 0; }
const tosh = (now) => new Date(now + 5 * 3600000).toISOString().slice(0, 10);
/* qidiruv matnini tozalash (mijoz bilan bir xil qoida: assets/kalkifit-app.js qtNorm) */
export function sozTozala(q) {
  let s = String(q == null ? '' : q).toLowerCase().normalize('NFC').replace(/[’‘ʻʼ`´]/g, "'").replace(/\s+/g, ' ').trim();
  if (s.length < 2 || s.length > 40) return '';
  if (/[@/\\<>{}[\]|=:;#$%^&*_~+]|https?|www\./.test(s)) return '';
  if ((s.match(/\d/g) || []).length > 4) return '';
  if (!/[a-zа-яёўқғҳ]/i.test(s)) return '';
  if (!/^[a-z0-9а-яёўқғҳ' ,.()%-]+$/i.test(s)) return '';
  return s;
}
export function tozala(b, now) {
  if (!b || typeof b !== 'object' || !Array.isArray(b.k) || b.k.length > 20) return null;
  const t = Date.parse(tosh(now || Date.now())), out = [];
  for (const x of b.k) {
    if (!x || typeof x !== 'object' || typeof x.s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x.s)) continue;
    if (!(Math.abs(Date.parse(x.s) - t) <= 3 * 86400000)) continue;
    const soz = sozTozala(x.q), n = Math.round(Number(x.n)); if (!soz || !(n >= 1 && n <= 5)) continue;
    out.push({ sana: x.s, soz, n });
  }
  return out;
}
export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') return json(405, { xato: E[405] }, Object.assign({ Allow: 'GET, POST' }, NC));
  const db = env.KALKIFIT_DB; if (!db) return fail(503);
  if (request.method === 'GET') {
    if (!env.KALKIFIT_ADMIN_PASSWORD) return fail(503);
    const kv = env.KALKI_AI_KV, ip = 'qt:' + Array.from((await sha('qt' + (request.headers.get('CF-Connecting-IP') || '?'))).slice(0, 8)).map((x) => x.toString(16).padStart(2, '0')).join('');
    if (kv && (parseInt(await kv.get(ip), 10) || 0) >= 10) return fail(429);
    const pw = request.headers.get('X-Admin-Password') || '';
    if (!pw || !(await same(pw, env.KALKIFIT_ADMIN_PASSWORD))) { if (kv) await kv.put(ip, String((parseInt(await kv.get(ip), 10) || 0) + 1), { expirationTtl: 3600 }); return fail(401); }
    const kun = Math.max(1, Math.min(365, parseInt(new URL(request.url).searchParams.get('kun'), 10) || 30)), dan = tosh(Date.now() - (kun - 1) * 86400000);
    let r; try { r = await db.prepare('SELECT soz, SUM(son) AS son, COUNT(*) AS kun FROM qidiruv_topilmadi WHERE sana >= ? GROUP BY soz ORDER BY son DESC, soz LIMIT 500').bind(dan).all(); } catch (e) { return fail(503); }
    return json(200, { sozlar: r.results || [] }, NC);
  }
  const origin = request.headers.get('Origin'); if (!origin || !originOk(origin, env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let b; try { const raw = await request.text(); if (raw.length > 3000) return fail(400); b = JSON.parse(raw); } catch (e) { return fail(400); }
  const q = tozala(b, Date.now()); if (!q) return fail(400);
  if (q.length) {
    try { await db.batch(q.map((x) => db.prepare('INSERT INTO qidiruv_topilmadi (sana, soz, son) VALUES (?, ?, ?) ON CONFLICT(sana, soz) DO UPDATE SET son = son + excluded.son').bind(x.sana, x.soz, x.n))); }
    catch (e) { return fail(503); }
  }
  return new Response(null, { status: 204, headers: NC });
}
