/* kalki.uz — KalkiFit: umumiy ovqatlar bazasi NAVBATI (Cloudflare D1).
 * AI taxmin qilgan va foydalanuvchi o'zi tasdiqlab saqlagan yangi ovqat "taklif" sifatida yuboriladi: FAQAT nom, porsiya matni, kkal/oqsil/yog'/uglevod va til.
 * Shaxsiy tarix, profil, qurilma ma'lumoti, IP/mijoz identifikatori SAQLANMAYDI (IP faqat kunlik limit uchun xesh bilan KV da).
 * Bir xil taom 3 TURLI kundan kelsa holat "tasdiqlangan"; baza avtomatik O'ZGARMAYDI — admin ma'qullaydi, tools/ovqatlar-merge.js orqali bazaga qo'shiladi.
 * D1 binding: KALKIFIT_DB (schema: migrations/kalkifit-taklif.sql). Limit va Origin — ariza.js bilan bir xil.
 * POST { nom, porsiya, kcal, o, y, u, til } → { ok: true } | { xato } */
import { originOk, takeQuota, json, num, UUID_RE } from './ariza.js';

const DEFAULT_CLIENT_LIMIT = 40;
const CYR = { 'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'x', 'ц': 's', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': 'o', 'қ': 'q', 'ғ': 'g', 'ҳ': 'h' };
const STOP = new Set(['bitta', 'ta', 'dona', 'kosa', 'likop', 'porsiya', 'stakan', 'piyola', 'bolak', 'tilim', 'g', 'gr', 'gramm', 'ml', 'va', 'bilan', 'и', 'с']);

export function normNom(s) {                       // qidiruv/takrorlashga mos normalizatsiya: lotin, kichik harf, apostrofsiz, raqam/birlik so'zlarisiz
  let t = String(s || '').toLowerCase().replace(/[’'`‘ʻʼ]/g, ''), o = '';
  for (const ch of t) o += CYR[ch] != null ? CYR[ch] : ch;
  return o.replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w && !/^\d+$/.test(w) && !STOP.has(w)).join(' ').replace(/([a-z])\1+/g, '$1').trim();
}
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16); }
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);

export function validate(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return null;
  const nom = typeof b.nom === 'string' ? b.nom.replace(/[<>]/g, '').trim() : '';
  if (nom.length < 2 || nom.length > 60) return null;
  const k = Number(b.kcal), o = Number(b.o), y = Number(b.y), u = Number(b.u);
  if (![k, o, y, u].every(isFinite) || k < 0 || k > 3000 || o < 0 || o > 300 || y < 0 || y > 300 || u < 0 || u > 500) return null;
  const atw = 4 * o + 9 * y + 4 * u; if (atw > 0 && Math.abs(atw - k) > Math.max(80, k * 0.4)) return null;     // kkal makroga mos bo'lsin
  const til = b.til === 'ru' ? 'ru' : (b.til === 'kirill' ? 'kirill' : 'uz');
  const key = normNom(nom); if (key.length < 2) return null;
  return { nom, key, porsiya: typeof b.porsiya === 'string' ? b.porsiya.replace(/[<>]/g, '').trim().slice(0, 40) : '', kcal: Math.round(k), o: Math.round(o * 10) / 10, y: Math.round(y * 10) / 10, u: Math.round(u * 10) / 10, til };
}

const E = { 400: "Ma'lumot noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 415: 'JSON yuboring.', 429: 'Limit tugadi.', 503: 'Xizmat vaqtincha ishlamayapti.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let body; try { const raw = await request.text(); if (raw.length > 1000) return fail(400); body = JSON.parse(raw); } catch (e) { return fail(400); }
  const v = validate(body); if (!v) return fail(400);
  if (!env.KALKIFIT_DB || !env.KALKI_AI_KV) return fail(503);
  const lim = Object.assign({}, env, { AI_CLIENT_LIMIT: String(num(env.KALKIFIT_TAKLIF_LIMIT, DEFAULT_CLIENT_LIMIT)) });
  let sabab; try { sabab = await takeQuota(lim, request, typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : ''); } catch (e) { return fail(503); }
  if (sabab) return fail(429);
  const h = await sha(v.key), kun = tashkentDay(), db = env.KALKIFIT_DB;
  try {
    await db.prepare('INSERT OR IGNORE INTO taklif (h, nom, til, porsiya, jami, kunlar, kcal_sum, o_sum, y_sum, u_sum, holat, birinchi, oxirgi) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, 0, \'yangi\', ?, ?)').bind(h, v.nom, v.til, v.porsiya, kun, kun).run();
    const ins = await db.prepare('INSERT OR IGNORE INTO taklif_kun (h, kun) VALUES (?, ?)').bind(h, kun).run();
    const yangiKun = ins && ins.meta && ins.meta.changes ? 1 : 0;
    await db.prepare('UPDATE taklif SET jami = jami + 1, kunlar = kunlar + ?, kcal_sum = kcal_sum + ?, o_sum = o_sum + ?, y_sum = y_sum + ?, u_sum = u_sum + ?, oxirgi = ?, holat = CASE WHEN holat = \'yangi\' AND kunlar + ? >= 3 THEN \'tasdiqlangan\' ELSE holat END WHERE h = ?').bind(yangiKun, v.kcal, v.o, v.y, v.u, kun, yangiKun, h).run();
  } catch (e) { console.error('taklif db xato'); return fail(503); }
  return json(200, { ok: true });
}
