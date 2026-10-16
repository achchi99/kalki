/* kalki.uz — Zaxira API (bulutga saqlash): faqat SHIFRLANGAN blob. Saqlash qatlami: ../_lib/zaxira-store.js (D1 shu yerda emas).
 *   GET    /api/zaxira?id=<64 hex>                          → 200 { ilova, blob, versiya, yangilangan } | 404
 *   PUT    /api/zaxira   { id, ilova, kutilgan, blob }       → 200 { versiya } | 409 { versiya } (boshqa qurilma yangiroq yozgan — eskisi yozib yuborilmaydi) | 400 | 413 | 429
 *   DELETE /api/zaxira?id=<64 hex>                          → 200 { ok: true, topildi }
 *   GET    /api/zaxira?ping=1                               → 200 { tayyor: true } (baza/jadval tayyor) | 503
 * Chegara: blob ≤ 1 MB; kuniga ≤ 50 yozish/id; IP bo'yicha kuniga ≤ 600 so'rov; yangi yozuvlar kuniga ≤ 3000 (sayt). Origin tekshiruvi (PUT/DELETE majburiy).
 * Server kodni ham, ochiq ma'lumotni ham ko'rmaydi: id = SHA-256(HKDF(kod)), blob = AES-GCM(kalit = HKDF(kod)).
 * Boshqa serverga o'tish: env ZAXIRA_UPSTREAM (masalan https://zaxira.example.uz/api/zaxira) qo'yilsa, bu manzil so'rovlarni o'shanga uzatadi (vaqtincha yo'naltirish). */
import { originOk, json, num } from './ariza.js';
import { makeStore } from '../_lib/zaxira-store.js';

export const MAX_BLOB = 1048576, ILOVALAR = ['kalkifit', 'rozgor'], ID_RE = /^[0-9a-f]{64}$/, BLOB_RE = /^[A-Za-z0-9_-]+$/;
const KV_TTL = 172800;
const E = { 400: "So'rov noto'g'ri.", 403: "Ruxsat yo'q.", 404: 'Topilmadi.', 405: 'GET, PUT yoki DELETE.', 409: 'Bulutda yangiroq nusxa bor.', 413: 'Ma\'lumot juda katta.', 415: 'JSON yuboring.', 429: "Limit tugadi. Keyinroq urinib ko'ring.", 502: 'Server javob bermadi.', 503: 'Xizmat sozlanmagan.' };
const fail = (s, extra) => json(s, Object.assign({ xato: E[s] || 'Xato.' }, extra || {}), { 'Cache-Control': 'no-store' });
const ok = (o) => json(200, o, { 'Cache-Control': 'no-store' });
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24); }
async function bump(kv, key, lim, step) {                          // true = ruxsat (sanoq oshdi)
  const c = parseInt(await kv.get(key), 10) || 0; if (c >= lim) return false; await kv.put(key, String(c + (step || 1)), { expirationTtl: KV_TTL }); return true;
}

export async function onRequest({ request, env }) {
  const m = request.method;
  if (m !== 'GET' && m !== 'PUT' && m !== 'DELETE') return json(405, { xato: E[405] }, { Allow: 'GET, PUT, DELETE' });
  if (env.ZAXIRA_UPSTREAM) {                                         // vaqtincha yo'naltirish (yangi server)
    try { const u = new URL(request.url); const r = await fetch(env.ZAXIRA_UPSTREAM + u.search, { method: m, headers: { 'Content-Type': request.headers.get('Content-Type') || 'application/json', Origin: request.headers.get('Origin') || '' }, body: m === 'PUT' ? await request.text() : undefined }); return new Response(r.body, { status: r.status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }); } catch (e) { return fail(502); }
  }
  const origin = request.headers.get('Origin');
  if (origin ? !originOk(origin, env) : m !== 'GET') return fail(403);
  const store = makeStore(env), kv = env.KALKI_AI_KV; if (!store || !kv) return fail(503);
  const day = tashkentDay(), salt = env.IP_HASH_SALT || '', ip = request.headers.get('CF-Connecting-IP') || '?';
  try { if (!(await bump(kv, 'zx:ip:' + day + ':' + await sha(salt + ip), num(env.ZAXIRA_IP_LIMIT, 600)))) return fail(429); } catch (e) { return fail(503); }
  const url = new URL(request.url);
  if (m === 'GET' && url.searchParams.get('ping')) { try { await store.count(); return ok({ tayyor: true }); } catch (e) { return fail(503); } }     // ilova yoqishdan oldin: xizmat (jadval) tayyormi
  if (m === 'GET' || m === 'DELETE') {
    const id = url.searchParams.get('id') || ''; if (!ID_RE.test(id)) return fail(400);
    try {
      if (m === 'GET') { const r = await store.get(id); if (!r) return fail(404); return ok({ ilova: r.ilova, blob: r.blob, versiya: r.versiya, yangilangan: r.yangilangan }); }
      return ok({ ok: true, topildi: await store.del(id) });
    } catch (e) { console.error('zaxira db xato'); return fail(503); }
  }
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  const len = parseInt(request.headers.get('Content-Length') || '0', 10); if (len > MAX_BLOB + 2000) return fail(413);
  let b; try { const raw = await request.text(); if (raw.length > MAX_BLOB + 2000) return fail(413); b = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!b || typeof b !== 'object' || !ID_RE.test(b.id || '') || ILOVALAR.indexOf(b.ilova) < 0 || typeof b.blob !== 'string' || !Number.isInteger(b.kutilgan) || b.kutilgan < 0) return fail(400);
  if (b.blob.length > MAX_BLOB) return fail(413); if (b.blob.length < 20 || !BLOB_RE.test(b.blob)) return fail(400);
  try {
    if (!(await bump(kv, 'zx:w:' + day + ':' + b.id.slice(0, 24), num(env.ZAXIRA_WRITE_LIMIT, 50)))) return fail(429);
    if (b.kutilgan === 0 && !(await bump(kv, 'zx:new:' + day, num(env.ZAXIRA_NEW_LIMIT, 3000)))) return fail(429);
    const r = await store.put(b.id, b.ilova, b.blob, b.kutilgan, Date.now());
    return r.ok ? ok({ versiya: r.versiya }) : fail(409, { versiya: r.versiya });
  } catch (e) { console.error('zaxira db xato'); return fail(503); }
}
