/* kalki.uz — «Retseptimni yengillashtir»: AI FAQAT masalliqlarni ajratadi (matn → baza id + miqdor + birlik). Kkal/oqsil/yog'/uglevod AI'dan OLINMAYDI (baza hisoblaydi: assets/retsept-core.js + data/retsept-masalliq.json),
 * yengillashtirish qoidalari ham AI emas (deterministik, retsept-core.js). Bu endpoint faqat ilova mahalliy parser tanimagan qatorlarni yuboradi.
 * Infratuzilma: ariza.js (Origin, model so'rovi, PII yashirish) + kalkifit-quota.js (kunlik limit, KV, ns 'rt'). Yuboriladigan narsa FAQAT masalliq matni (profil/vazn/tarix YO'Q); hech narsa saqlanmaydi (faqat natija keshi).
 * POST { matn, til: 'uz'|'ru'|'kirill', mijoz_id } → { masalliqlar: [{ nom, id|null, q, b, g|null }], kesh?: true } | { xato, sabab? }
 * Limit: qurilmaga kuniga RETSEPT_CLIENT_LIMIT (standart 5), IP — 2×, sayt — RETSEPT_SITE_LIMIT (standart 800). Bir xil matn — KV keshi (30 kun, limitga sanalmaydi). */
import { originOk, maskPII, askModel, json, num, UUID_RE } from './ariza.js';
import { takeKfQuota } from './kalkifit-quota.js';
import R from '../../assets/retsept-core.js';

let TABLE = null, CATALOG = '', SYS = '';
function setTable(t) { TABLE = t; R.init(t); CATALOG = Object.keys(t.masalliq).map((id) => id + '=' + t.masalliq[id].uz + '/' + t.masalliq[id].ru).join('; '); SYS = system(); }
async function loadTable(env, request) {                // jadval statik fayldan (Pages: ASSETS), bir marta
  if (TABLE) return true; if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') return false;
  try { const r = await env.ASSETS.fetch(new URL('/data/retsept-masalliq.json', request.url)); if (!r.ok) return false; setTable(await r.json()); return true; } catch (e) { return false; }
}
const DEFAULT_CLIENT_LIMIT = 5, DEFAULT_SITE_LIMIT = 800, CACHE_TTL = 30 * 86400, MAX_LEN = 700, MAX_ITEMS = 25;
const BIRLIK = { g: 'g', kg: 'kg', ml: 'ml', l: 'l', dona: 'dona', bosh: 'bosh', osh_qoshiq: 'osh', choy_qoshiq: 'choy', stakan: 'stakan' };
const system = () => `Sen retsept matnidan MASALLIQLARNI ajratuvchi yordamchisan. Foydalanuvchi retsept qatorlarini yozadi (o'zbek lotin, kirill yoki rus tilida).
Faqat JSON massiv qaytar, boshqa hech narsa yozma. Har masalliq uchun BITTA element: {"nom": matndagi nomi (qisqa), "id": quyidagi ro'yxatdan eng mos id yoki null, "miqdor": son yoki null, "birlik": "g"|"kg"|"ml"|"l"|"dona"|"bosh"|"osh_qoshiq"|"choy_qoshiq"|"stakan"|null}.
Qoidalar: miqdorni FAQAT matnda yozilgan bo'yicha ber, o'zing o'ylab topma (yozilmagan bo'lsa null); "id" faqat ro'yxatdagi AYNAN o'sha masalliq (yoki uning oddiy turi, masalan «devzira» = guruch) uchun; masalliqning boshqa qismi yoki boshqa mahsulot bo'lsa (tuxum sarig'i/oqi, pomidor pastasi, limon, lavlagi) yoki shubha bo'lsa — null; kaloriya yoki ozuqa qiymatini YOZMA; eng ko'pi ${MAX_ITEMS} ta element.
Ro'yxat (id=o'zbekcha/ruscha): ${CATALOG}.`;

export function extractJson(text) {
  const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('['), j = t.lastIndexOf(']');
  if (i < 0 || j < i) return null;
  try { const a = JSON.parse(t.slice(i, j + 1)); return Array.isArray(a) ? a : null; } catch (e) { return null; }
}
export function sanitize(list) {
  const out = [];
  for (const it of (list || []).slice(0, MAX_ITEMS)) {
    if (!it || typeof it !== 'object') continue;
    const nom = String(it.nom == null ? '' : it.nom).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60); if (!nom) continue;
    const id = typeof it.id === 'string' && Object.prototype.hasOwnProperty.call(TABLE.masalliq, it.id) ? it.id : null;
    let q = it.miqdor == null || it.miqdor === '' ? null : Number(it.miqdor); if (q != null && (!isFinite(q) || q < 0 || q > 20000)) q = null;
    const b = typeof it.birlik === 'string' && BIRLIK[it.birlik] ? BIRLIK[it.birlik] : null;
    let g = null; if (id && q != null) { const x = R.toGrams(id, q, b || (TABLE.masalliq[id].u && TABLE.masalliq[id].u.dona && q <= 20 ? 'dona' : 'g')); g = x == null || x > 20000 ? null : Math.round(x); }
    out.push({ nom, id, q, b, g });
  }
  return out;
}
const sha = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map((x) => x.toString(16).padStart(2, '0')).join('');
const E = { 400: "Matn noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 415: 'JSON yuboring.', 429: "Bugungi retsept limiti tugadi (kuniga 5 ta). Masalliqlarni qo'lda qo'shing yoki ertaga urinib ko'ring.", 4291: "AI bugun juda band — masalliqlarni qo'lda qo'shing. Ertaga AI yana ishlaydi.", 502: "AI hozir javob bermadi. Masalliqlarni qo'lda qo'shing.", 503: 'Xizmat vaqtincha ishlamayapti. Masalliqlarni qo\'lda qo\'shing.' };
const fail = (status) => json(status, { xato: E[status] || 'Xato.' });
export const _test = { extractJson, sanitize, init: setTable, system: () => SYS };

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let body;
  try { const raw = await request.text(); if (raw.length > 3000) return fail(400); body = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.matn !== 'string') return fail(400);
  const matn = body.matn.trim(); if (matn.length < 2 || matn.length > MAX_LEN) return fail(400);
  if (!env.ANTHROPIC_API_KEY || !env.KALKI_AI_KV || !(await loadTable(env, request))) return fail(503);
  const key = 'rt:c:' + (await sha(R.norm(matn)));
  try { const hit = await env.KALKI_AI_KV.get(key); if (hit) { const j = JSON.parse(hit); if (j && Array.isArray(j.masalliqlar)) return json(200, { masalliqlar: j.masalliqlar, kesh: true }); } } catch (e) { /* kesh o'qilmadi — davom */ }
  const clientId = typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '', cl = num(env.RETSEPT_CLIENT_LIMIT, DEFAULT_CLIENT_LIMIT);
  let sabab; try { sabab = await takeKfQuota(env, request, clientId, { ns: 'rt', site: num(env.RETSEPT_SITE_LIMIT, DEFAULT_SITE_LIMIT), client: cl, ip: cl * 2 }); } catch (e) { return fail(503); }
  if (sabab) return json(429, { xato: sabab === 'sayt' ? E[4291] : E[429], sabab });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await askModel(env, maskPII(matn), SYS + (body.til === 'ru' ? '\nMatn ruscha bo\'lishi mumkin: ruscha masalliqlarni ham ro\'yxatdagi id bilan moslashtir.' : ''), 1100);
    if (r.err) continue;
    const list = extractJson(r.text);
    if (list) { const masalliqlar = sanitize(list); try { await env.KALKI_AI_KV.put(key, JSON.stringify({ masalliqlar }), { expirationTtl: CACHE_TTL }); } catch (e) { /* keshga yozilmadi */ } return json(200, { masalliqlar }); }
  }
  return fail(502);
}
