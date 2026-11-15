/* kalki.uz — KalkiFit v78: «Xato topdingizmi?» — taom kartasidan ANONIM xato xabari (Cloudflare D1: migrations/kalkifit-xato.sql).
 * FAQAT: taom id'si (+ oila varianti), nima noto'g'ri (k — kkal, p — porsiya, n — nom), ixtiyoriy qisqa izoh, til. mijoz_id/IP/rasm saqlanmaydi (IP — faqat kunlik limit uchun xesh bilan KV da).
 * Admin (/admin/kalkifit-takliflar?tur=xato) shu xabarlarni ko'radi (GET /api/kalkifit-admin?xato=yangi|korildi|hammasi).
 *   POST { id, vr?, turi: 'k,p,n' dan, izoh?, til } → { ok: true } | { xato } */
import { originOk, json, num } from './ariza.js';
import { takeKfQuota } from './kalkifit-quota.js';

const DEFAULT_SITE_LIMIT = 3000, DEFAULT_IP_LIMIT = 30;          // KALKIFIT_XATO_SITE_LIMIT, KALKIFIT_XATO_LIMIT (bir IP/kun)
const TURI = ['k', 'p', 'n'];
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16); }
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
/* kirish tekshiruvi (sof funksiya — test uchun) */
export function validate(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return null;
  const id = typeof b.id === 'string' ? b.id.trim() : '';
  if (!/^[a-z0-9][a-z0-9._-]{0,59}$/i.test(id)) return null;
  const vr = typeof b.vr === 'string' && /^[a-z0-9._-]{0,60}$/i.test(b.vr) ? b.vr : '';
  const turi = Array.from(new Set(String(b.turi || '').split(',').map((x) => x.trim()).filter((x) => TURI.includes(x)))).sort().join(',');
  if (!turi) return null;
  const izoh = typeof b.izoh === 'string' ? b.izoh.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) : '';
  return { id, vr, turi, izoh, til: b.til === 'ru' ? 'ru' : (b.til === 'kirill' ? 'kirill' : 'uz') };
}
const E = { 400: "Ma'lumot noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'POST.', 415: 'JSON yuboring.', 429: 'Limit tugadi.', 503: 'Xizmat vaqtincha ishlamayapti.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let body; try { const raw = await request.text(); if (raw.length > 800) return fail(400); body = JSON.parse(raw); } catch (e) { return fail(400); }
  const v = validate(body); if (!v) return fail(400);
  if (!env.KALKIFIT_DB || !env.KALKI_AI_KV) return fail(503);
  const ipl = num(env.KALKIFIT_XATO_LIMIT, DEFAULT_IP_LIMIT);
  let sabab; try { sabab = await takeKfQuota(env, request, '', { ns: 'xt', site: num(env.KALKIFIT_XATO_SITE_LIMIT, DEFAULT_SITE_LIMIT), client: ipl, ip: ipl }); } catch (e) { return fail(503); }
  if (sabab) return fail(429);
  const h = await sha(v.id + '|' + v.vr + '|' + v.turi), kun = tashkentDay(), db = env.KALKIFIT_DB;
  try {
    await db.prepare("INSERT OR IGNORE INTO xato_xabar (h, taom, vr, turi, izoh, til, holat, birinchi, oxirgi) VALUES (?, ?, ?, ?, '', ?, 'yangi', ?, ?)").bind(h, v.id, v.vr, v.turi, v.til, kun, kun).run();
    await db.prepare("UPDATE xato_xabar SET jami = jami + 1, izoh = CASE WHEN ? <> '' THEN ? ELSE izoh END, til = ?, holat = 'yangi', oxirgi = ? WHERE h = ?").bind(v.izoh, v.izoh, v.til, kun, h).run();
  } catch (e) { console.error('xato db xato'); return fail(503); }
  return json(200, { ok: true });
}
