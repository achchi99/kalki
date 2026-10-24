/* kalki.uz — "KalkiFit" ilovasi uchun AI: erkin matn ("1 kosa osh, 2 somsa") → ovqat ro'yxati (taxminiy kkal va makro).
 * ariza.js infratuzilmasi: Origin tekshiruvi, kunlik limit (KV), model so'rovi. Ilova avval LOKAL baza bilan moslashtiradi — bu endpoint faqat topilmaganini taxmin qiladi.
 * Yuboriladigan narsa FAQAT ovqat matni (profil, vazn, tarix YO'Q); hech narsa saqlanmaydi — natijani foydalanuvchi ko'rib o'zi tasdiqlaydi.
 * POST { matn, til: 'uz'|'ru'|'kirill', mijoz_id, manba?: 'ovoz', platforma? } → { ovqatlar: [{ nom, porsiya, kcal, o, y, u }] } | { xato }   (manba ovoz — ovoz limiti) */
import { originOk, maskPII, askModel, json, num, UUID_RE } from './ariza.js';
import { takeKfQuota, ovozQuota, ovozLimits, ovozLimitMsg } from './kalkifit-quota.js';
import S from '../../assets/kalkifit-core.js';

const DEFAULT_CLIENT_LIMIT = 30, DEFAULT_SITE_LIMIT = 3000;   // KALKIFIT_CLIENT_LIMIT, KALKIFIT_SITE_LIMIT (kuniga) — env bilan sozlanadi
const SYSTEM = `Sen ovqat va ichimliklarning kaloriyasini TAXMINIY baholovchi yordamchisan. Foydalanuvchi nima yeganini yozadi (o'zbek, rus yoki kirill yozuvida).
Faqat JSON massiv qaytar, boshqa hech narsa yozma. Har element: {"nom": qisqa nom (foydalanuvchi tilida), "porsiya": porsiya oddiy so'zlarda (masalan "1 kosa", "2 dona"), "kcal": butun son, "o": oqsil gramm, "y": yog' gramm, "u": uglevod gramm}.
Qoidalar: eng ko'pi 8 ta element; bir xil taom BITTA elementda bo'lsin (soni porsiyada: "2 dona"), kcal va makro shu jami porsiya uchun; qiymatlar butun porsiya uchun (100 g uchun emas); o'zbek oshxonasidagi odatiy porsiya va o'rtacha uy retseptini ol; matnda ovqat bo'lmasa bo'sh massiv [] qaytar; tibbiy maslahat, izoh yoki dieta tavsiyasi yozma.`;

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
/* ---- lokal parse (AI'dan OLDIN): bazada bor taom ("1 kosa mastava", "2 ta qovoqli somsa", "to'y oshidan bir lagan") — fid + birlik + miqdor + omillar; AI faqat topilmaganini oladi ---- */
let FOODS = null;
async function loadFoods(env, request) {
  if (FOODS) return FOODS; if (!env.ASSETS || typeof env.ASSETS.fetch !== 'function') return null;       // Pages: statik baza; boshqa muhitda (test) — lokal parse o'tkazib yuboriladi
  try { const r = await env.ASSETS.fetch(new URL('/data/ovqatlar.json', request.url)); if (!r.ok) return null; const j = await r.json(); FOODS = S.buildIndex(S.normFoods(j.foods)); return FOODS; } catch (e) { return null; }
}
const UN = { uz: { g100: 'g', kosa: 'kosa', likop: 'lagan', dona: 'dona', bolak: "bo'lak", stakan: 'stakan', qoshiq: 'osh qoshiq', choyq: 'choy qoshiq', piyola: 'piyola', porsiya: 'porsiya', hovuch: 'hovuch', tilim: 'tilim', shisha: 'shisha' }, ru: { g100: 'г', kosa: 'миска', likop: 'тарелка', dona: 'шт.', bolak: 'кусок', stakan: 'стакан', qoshiq: 'ст. ложка', choyq: 'ч. ложка', piyola: 'пиала', porsiya: 'порция', hovuch: 'горсть', tilim: 'ломтик', shisha: 'бутылка' } };
export function localItems(matn, foods, til) {
  const ru = til === 'ru', r = S.parseText(matn, foods, {}), out = [];
  for (const x of r.items) {
    const pt = S.portion(x.food, x.g), lb = x.fam ? S.famLabel(x.fam, x.vr, x.szid, ru ? 'ru' : 'uz') : '', nm = (ru && (x.fam || x.food).r ? (x.fam || x.food).r : (x.fam || x.food).n) + (lb ? ' · ' + lb : '');
    out.push({ nom: nm, porsiya: x.unit === 'g100' ? Math.round(x.g) + ' ' + UN[ru ? 'ru' : 'uz'].g100 : String(x.qty).replace('.', ',') + ' ' + UN[ru ? 'ru' : 'uz'][x.unit], kcal: pt.kcal, o: pt.p, y: pt.f, u: pt.c, fid: x.fid, vr: x.vr || undefined, sz: x.sz || undefined, taxminiy: !!x.food.e });
  }
  return { items: out, missing: r.missing };
}
export const _test = { extractJson, sanitize, SYSTEM };

const E = { 400: "Matn noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 415: 'JSON yuboring.', 429: "Bugungi limit tugadi. Ertaga urinib ko'ring.", 4291: "AI bugun juda band — ovqatni qidiruv orqali qo'shing (u internetsiz ham ishlaydi). Ertaga AI yana ishlaydi.", 502: "AI hozir javob bermadi. Qo'lda qo'shing.", 503: 'Xizmat vaqtincha ishlamayapti.' };
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
  let matn2 = matn, lokal = [];
  { const foods = await loadFoods(env, request); if (foods) { const L = localItems(matn, foods, body.til); lokal = L.items; if (lokal.length && !L.missing.length) return json(200, { ovqatlar: lokal.slice(0, 8), lokal: true }); if (lokal.length) matn2 = L.missing.join(', '); } }
  if (!env.ANTHROPIC_API_KEY || !env.KALKI_AI_KV) return fail(503);
  const clientId = typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '';
  const cl = num(env.KALKIFIT_CLIENT_LIMIT, DEFAULT_CLIENT_LIMIT);
  let ovoz = body.manba === 'ovoz', tokOk = false; const out = {};
  if (ovoz && typeof body.ovoz_tok === 'string' && /^[0-9a-f]{32}$/.test(body.ovoz_tok)) { try { const k = 'ovt:' + body.ovoz_tok; if (await env.KALKI_AI_KV.get(k)) { tokOk = true; await env.KALKI_AI_KV.delete(k); } } catch (e) { tokOk = false; } }          // server ovozi allaqachon 1 AI hisobidan o'tgan — bir martalik tok bilan qayta sanalmaydi          // ovozli kiritish: rasm/retsept/menyu bilan UMUMIY kunlik AI hisobi ('ai'; Android 2, veb 5) — faqat AI chaqirilganda (hammasi bazada bo'lsa sanalmaydi)
  let sabab; try { sabab = tokOk ? null : await takeKfQuota(env, request, clientId, ovoz ? ovozQuota(env, { out }) : { ns: 'tx', site: num(env.KALKIFIT_SITE_LIMIT, DEFAULT_SITE_LIMIT), client: cl, ip: cl * 2 }); } catch (e) { return fail(503); }
  if (sabab) return json(429, ovoz ? { xato: sabab === 'sayt' ? E[4291] : ovozLimitMsg(), sabab, limit: ovozLimits(env).client, qoldi: 0 } : { xato: sabab === 'sayt' ? E[4291] : E[429], sabab });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await askModel(env, maskPII(matn2), SYSTEM + (body.til === 'ru' ? '\nНазвания блюд пиши по-русски (поле "nom" и "porsiya").' : '\nNomlarni o\'zbek tilida (lotin yozuvida) yoz.'), 700);
    if (r.err) continue;
    const list = extractJson(r.text); if (list) return json(200, ovoz ? { ovqatlar: lokal.concat(sanitize(list)).slice(0, 8), limit: ovozLimits(env).client, qoldi: out.qoldi } : { ovqatlar: lokal.concat(sanitize(list)).slice(0, 8) });
  }
  return fail(502);
}
