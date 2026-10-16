/* kalki.uz — KalkiFit: ovqat SURATI → taomlar ro'yxati, porsiya taxmini, kkal va makro (taxminiy ±30%).
 * Rasm mijozda 1024 px ga kichraytirilgan JPEG (sifat 0,8) sifatida keladi. Rasm SAQLANMAYDI va LOGLANMAYDI: faqat model so'roviga uzatiladi, javobdan keyin tashlanadi.
 * Limit: kuniga 10 rasm (mijoz va IP bo'yicha, KV), sayt bo'yicha umumiy tavan. Origin — ariza.js kabi.
 * POST { img: <base64 JPEG yoki data URL>, til: 'uz'|'ru'|'kirill', mijoz_id } → { ovqatlar: [{ nom, porsiya, g, kcal, o, y, u }], aniqlik: '±30%' } | { xato } */
import { originOk, json, num, UUID_RE } from './ariza.js';

const MODEL = 'claude-haiku-5-5', TIMEOUT_MS = 25000, MAX_B64 = 1000000, MAX_BYTES = 700000, DEFAULT_LIMIT = 10, DEFAULT_SITE = 300, KV_TTL = 172800;
const SYSTEM = `Sen ovqat suratidagi taomlarni aniqlab, porsiya og'irligini va kaloriyasini TAXMINIY baholovchi yordamchisan. Suratda o'zbek taomlari (osh, somsa, lag'mon, manti, shurva, non, qatiq...) va kundalik ovqatlar bo'lishi mumkin.
Faqat JSON massiv qaytar, boshqa hech narsa yozma. Har element: {"nom": qisqa nom (foydalanuvchi tilida), "porsiya": oddiy so'zlarda ("1 kosa", "2 dona"), "g": taxminiy og'irlik gramm (butun son), "kcal": butun porsiya uchun kkal, "o": oqsil g, "y": yog' g, "u": uglevod g}.
Qoidalar: eng ko'pi 6 element; qiymatlar suratdagi ANIQ porsiya uchun (100 g uchun emas); ishonching komil bo'lmasa o'rtacha uy retseptini ol; suratda ovqat bo'lmasa bo'sh massiv [] qaytar; odamlar, matn yoki boshqa narsalar haqida yozma; tibbiy maslahat berma.`;

export function extractJson(text) { const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('['), j = t.lastIndexOf(']'); if (i < 0 || j < i) return null; try { const a = JSON.parse(t.slice(i, j + 1)); return Array.isArray(a) ? a : null; } catch (e) { return null; } }
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
export function sanitize(list) {
  const out = [];
  for (const it of (list || []).slice(0, 6)) {
    if (!it || typeof it !== 'object') continue;
    const nom = String(it.nom == null ? '' : it.nom).replace(/[<>]/g, '').trim().slice(0, 60); if (!nom) continue;
    let kcal = Math.round(Number(it.kcal)); if (!isFinite(kcal)) continue;
    const o = clamp(Math.round(Number(it.o) * 10) / 10 || 0, 0, 300), y = clamp(Math.round(Number(it.y) * 10) / 10 || 0, 0, 300), u = clamp(Math.round(Number(it.u) * 10) / 10 || 0, 0, 500);
    const atw = Math.round(4 * o + 9 * y + 4 * u); if (atw > 0 && Math.abs(atw - kcal) > Math.max(80, kcal * 0.35)) kcal = atw;
    out.push({ nom, porsiya: String(it.porsiya == null ? '' : it.porsiya).replace(/[<>]/g, '').trim().slice(0, 40), g: clamp(Math.round(Number(it.g)) || 0, 0, 3000), kcal: clamp(kcal, 0, 3500), o, y, u });
  }
  return out;
}
export function jpegBytes(b64) {                    // base64 → JPEG ekanini (FF D8 FF) va taxminiy hajmini tekshirish
  const clean = String(b64 || '').replace(/^data:image\/jpe?g;base64,/i, '').replace(/\s+/g, '');
  if (clean.length < 100 || clean.length > MAX_B64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(clean)) return null;
  const bytes = Math.floor(clean.length * 3 / 4); if (bytes > MAX_BYTES) return { err: 413 };
  let head; try { head = atob(clean.slice(0, 8)); } catch (e) { return null; }
  if (head.charCodeAt(0) !== 0xFF || head.charCodeAt(1) !== 0xD8 || head.charCodeAt(2) !== 0xFF) return null;
  return { b64: clean, bytes };
}
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24); }
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
async function takeImgQuota(env, request, cid) {  // null = ruxsat; 'mijoz' | 'ip' | 'sayt'
  const kv = env.KALKI_AI_KV, day = tashkentDay(), salt = env.IP_HASH_SALT || '', ip = request.headers.get('CF-Connecting-IP') || '?';
  const keys = [{ k: 'img:site:' + day, lim: num(env.KALKIFIT_IMG_SITE_LIMIT, DEFAULT_SITE), s: 'sayt' }, { k: 'img:ip:' + day + ':' + await sha(salt + ip), lim: num(env.KALKIFIT_IMG_LIMIT, DEFAULT_LIMIT) * 2, s: 'ip' }];
  if (cid) keys.splice(1, 0, { k: 'img:cid:' + day + ':' + await sha(salt + 'c:' + cid.toLowerCase()), lim: num(env.KALKIFIT_IMG_LIMIT, DEFAULT_LIMIT), s: 'mijoz' });
  const counts = await Promise.all(keys.map((x) => kv.get(x.k)));
  for (let i = 0; i < keys.length; i++) if ((parseInt(counts[i], 10) || 0) >= keys[i].lim) return keys[i].s;
  await Promise.all(keys.map((x, i) => kv.put(x.k, String((parseInt(counts[i], 10) || 0) + 1), { expirationTtl: KV_TTL })));
  return null;
}
async function askVision(env, b64, til) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: ctl.signal, headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, thinking: { type: 'disabled' }, system: SYSTEM, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }, { type: 'text', text: til === 'ru' ? 'Определи блюда на фото. Названия — на русском.' : "Suratdagi taomlarni aniqla. Nomlarni o'zbek tilida yoz." }] }] }) });
    if (!res.ok) { console.error('rasm: model status', res.status); return { err: true }; }
    const j = await res.json(); return { text: (j.content || []).map((c) => c.text || '').join('') };
  } catch (e) { console.error('rasm: model xato'); return { err: true }; } finally { clearTimeout(timer); }
}
export const _test = { extractJson, sanitize, jpegBytes, SYSTEM };

const E = { 400: "Rasm noto'g'ri. JPEG yuboring.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 413: 'Rasm juda katta.', 415: 'JSON yuboring.', 429: 'Bugungi rasm limiti tugadi (kuniga 10 ta). Ertaga urinib ko\'ring.', 502: "AI hozir javob bermadi. Qo'lda qo'shing.", 503: 'Xizmat vaqtincha ishlamayapti.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  const len = parseInt(request.headers.get('Content-Length') || '0', 10); if (len > MAX_B64 + 2000) return fail(413);
  let body; try { const raw = await request.text(); if (raw.length > MAX_B64 + 2000) return fail(413); body = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!body || typeof body !== 'object' || typeof body.img !== 'string') return fail(400);
  const img = jpegBytes(body.img); if (!img) return fail(400); if (img.err) return fail(img.err);
  if (!env.ANTHROPIC_API_KEY || !env.KALKI_AI_KV) return fail(503);
  const cid = typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '';
  let sabab; try { sabab = await takeImgQuota(env, request, cid); } catch (e) { return fail(503); }
  if (sabab) return json(429, { xato: E[429], sabab });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await askVision(env, img.b64, body.til === 'ru' ? 'ru' : 'uz'); if (r.err) continue;
    const list = extractJson(r.text); if (list) return json(200, { ovqatlar: sanitize(list), aniqlik: '±30%' });
  }
  return fail(502);
}
