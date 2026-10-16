/* kalki.uz — "KalkiFit" ilovasi uchun AI: erkin matn ("1 kosa osh, 2 somsa") → ovqat ro'yxati (taxminiy kkal va makro).
 * ariza.js infratuzilmasi: Origin tekshiruvi, kunlik limit (KV), model so'rovi. Ilova avval LOKAL baza bilan moslashtiradi — bu endpoint faqat topilmaganini taxmin qiladi.
 * Yuboriladigan narsa FAQAT ovqat matni (profil, vazn, tarix YO'Q); hech narsa saqlanmaydi — natijani foydalanuvchi ko'rib o'zi tasdiqlaydi.
 * POST { matn, til: 'uz'|'ru'|'kirill', mijoz_id } → { ovqatlar: [{ nom, porsiya, kcal, o, y, u }] } | { xato } */
import { originOk, maskPII, takeQuota, askModel, json, num, UUID_RE } from './ariza.js';

const DEFAULT_CLIENT_LIMIT = 30;
const SYSTEM = `Sen ovqat va ichimliklarning kaloriyasini TAXMINIY baholovchi yordamchisan. Foydalanuvchi nima yeganini yozadi (o'zbek, rus yoki kirill yozuvida).
Faqat JSON massiv qaytar, boshqa hech narsa yozma. Har element: {"nom": qisqa nom (foydalanuvchi tilida), "porsiya": porsiya oddiy so'zlarda (masalan "1 kosa", "2 dona"), "kcal": butun son, "o": oqsil gramm, "y": yog' gramm, "u": uglevod gramm}.
Qoidalar: eng ko'pi 8 ta element; qiymatlar butun porsiya uchun (100 g uchun emas); o'zbek oshxonasidagi odatiy porsiya va o'rtacha uy retseptini ol; matnda ovqat bo'lmasa bo'sh massiv [] qaytar; tibbiy maslahat, izoh yoki dieta tavsiyasi yozma.`;

export function extractJson(text) {
  const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('['), j = t.lastIndexOf(']');
  if (i < 0 || j < i) return null;
  try { const a = JSON.parse(t.slice(i, j + 1)); return Array.isArray(a) ? a : null; } catch (e) { return null; }
}
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export function sanitize(list) {
  const out = [];
  for (const it of (list || []).slice(0, 8)) {
    if (!it || typeof it !== 'object') continue;
    const nom = String(it.nom == null ? '' : it.nom).replace(/[<>]/g, '').trim().slice(0, 60); if (!nom) continue;
    let kcal = Math.round(Number(it.kcal)); if (!isFinite(kcal)) continue;
    const o = clamp(Math.round(Number(it.o) * 10) / 10 || 0, 0, 300), y = clamp(Math.round(Number(it.y) * 10) / 10 || 0, 0, 300), u = clamp(Math.round(Number(it.u) * 10) / 10 || 0, 0, 500);
    const atw = Math.round(4 * o + 9 * y + 4 * u);
    if (atw > 0 && Math.abs(atw - kcal) > Math.max(80, kcal * 0.35)) kcal = atw;           // kkal va makro mos kelmasa — makrodan
    kcal = clamp(kcal, 0, 3000);
    out.push({ nom, porsiya: String(it.porsiya == null ? '' : it.porsiya).replace(/[<>]/g, '').trim().slice(0, 40), kcal, o, y, u });
  }
  return out;
}
export const _test = { extractJson, sanitize, SYSTEM };

const E = { 400: "Matn noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 415: 'JSON yuboring.', 429: "Bugungi limit tugadi. Ertaga urinib ko'ring.", 502: "AI hozir javob bermadi. Qo'lda qo'shing.", 503: 'Xizmat vaqtincha ishlamayapti.' };
const fail = (status) => json(status, { xato: E[status] || 'Xato.' });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let body;
  try { const raw = await request.text(); if (raw.length > 2000) return fail(400); body = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.matn !== 'string') return fail(400);
  const matn = body.matn.trim();
  if (matn.length < 2 || matn.length > 300) return fail(400);
  if (!env.ANTHROPIC_API_KEY || !env.KALKI_AI_KV) return fail(503);
  const clientId = typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '';
  const lim = Object.assign({}, env, { AI_CLIENT_LIMIT: String(num(env.KALKIFIT_CLIENT_LIMIT, DEFAULT_CLIENT_LIMIT)) });
  let sabab; try { sabab = await takeQuota(lim, request, clientId); } catch (e) { return fail(503); }
  if (sabab) return json(429, { xato: E[429], sabab });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await askModel(env, maskPII(matn), SYSTEM + (body.til === 'ru' ? '\nНазвания блюд пиши по-русски (поле "nom" и "porsiya").' : '\nNomlarni o\'zbek tilida (lotin yozuvida) yoz.'), 700);
    if (r.err) continue;
    const list = extractJson(r.text); if (list) return json(200, { ovqatlar: sanitize(list) });
  }
  return fail(502);
}
