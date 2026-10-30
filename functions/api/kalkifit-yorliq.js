/* kalki.uz — KalkiFit v67: «Yorliqdan qo'shish» TAKLIFLARI (Cloudflare D1: migrations/yorliq.sql).
 * Foydalanuvchi qadoq yorlig'idan (AI o'qigan yoki qo'lda yozgan) saqlagan mahsulotni — bir marta ruxsat bergan bo'lsa — ANONIM taklif sifatida yuboradi:
 * FAQAT nom va 100 g uchun kkal/oqsil/yog'/uglevod (+ ixtiyoriy qadoq og'irligi), til, manba turi. RASM YUBORILMAYDI va SAQLANMAYDI; mijoz_id/IP saqlanmaydi (IP — faqat kunlik limit uchun xesh bilan KV da).
 * Admin (/admin/kalkifit-takliflar → «Yorliq takliflari») bitta bosishda umumiy bazaga qo'shadi (holat 'qoshildi', manba «yorliq (foydalanuvchi)») yoki rad etadi.
 *   POST { nom, kcal, o, y, u, g?, birlik?, manba: 'rasm'|'qolda', til, mijoz_id? } → { ok: true } | { xato }
 *   GET  → { v: 1, taomlar: [...] } — admin qo'shgan yorliqlar, baza formatida (ilova qidiruvi umumiy bazaga qo'shadi; kesh 10 daqiqa) */
import { originOk, json, num, UUID_RE } from './ariza.js';
import { takeKfQuota } from './kalkifit-quota.js';
import { normNom } from './kalkifit-taklif.js';

const DEFAULT_CLIENT_LIMIT = 20, DEFAULT_SITE_LIMIT = 2000;          // KALKIFIT_YORLIQ_LIMIT, KALKIFIT_YORLIQ_SITE_LIMIT
export const KAT = ['o', 'n', 's', 'm', 'g', 'v', 'f', 'd', 'i', 'q', 'h', 'x'];
export const MANBA_YQ = { u: "Qadoq yorlig'i (foydalanuvchi yuborgan, admin tekshirgan)", r: 'Этикетка упаковки (прислал пользователь, проверено администратором)' };
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16); }
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);

/* 100 g uchun yorliq: kkal 0–900, makro 0–100 (yig'indisi ≤ 105), 4/9/4 mosligi ±20% (ilova ±15% da ogohlantiradi; navbatga faqat mantiqli yorliq tushadi) */
export function validate(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b) || b.img != null || b.rasm != null) return null;          // rasm maydoni bo'lsa — rad (rasm hech qachon qabul qilinmaydi)
  const nom = typeof b.nom === 'string' ? b.nom.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim() : '';
  if (nom.length < 2 || nom.length > 60) return null;
  const k = Number(b.kcal), o = Number(b.o), y = Number(b.y), u = Number(b.u);
  if (![k, o, y, u].every(isFinite) || k < 1 || k > 900 || [o, y, u].some((x) => x < 0 || x > 100) || o + y + u > 105) return null;
  const atw = 4 * o + 9 * y + 4 * u; if (Math.abs(atw - k) > Math.max(15, k * 0.2)) return null;
  const key = normNom(nom); if (key.length < 2) return null;
  const g = Math.round(Number(b.g) || 0);
  return { nom, key, kcal: Math.round(k), o: Math.round(o * 10) / 10, y: Math.round(y * 10) / 10, u: Math.round(u * 10) / 10, g: g >= 1 && g <= 5000 ? g : 0, birlik: b.birlik === 'ml' ? 'ml' : 'g',
    rasm: b.manba === 'rasm' ? 1 : 0, til: b.til === 'ru' ? 'ru' : (b.til === 'kirill' ? 'kirill' : 'uz') };
}
/* D1 qatori → baza yozuvi (ilova: S.normFoods). id — 'yq-' + xesh (barqaror) */
export function asFood(r) {
  const j = r.jami || 1, r1 = (x) => Math.round(x * 10) / 10, nu = r.nom_uz || r.nom, nr = r.nom_ru || nu;
  const u = r.g > 0 ? [['qadoq', r.g], ['g100', 100]] : [['g100', 100]];
  return { i: 'yq-' + r.h.slice(0, 10), n: nu, r: nr, a: [], k: r.kcal, p: r1(r.o_sum / j), f: r1(r.y_sum / j), c: r1(r.u_sum / j), t: KAT.includes(r.kat) ? r.kat : 'x', e: 0, u, m: "Qadoq yorlig'i", ms: MANBA_YQ, yq: 1 };
}

const E = { 400: "Ma'lumot noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'GET yoki POST.', 415: 'JSON yuboring.', 429: 'Limit tugadi.', 503: 'Xizmat vaqtincha ishlamayapti.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });

export async function onRequest({ request, env }) {
  if (request.method === 'GET') {
    if (!env.KALKIFIT_DB) return json(200, { v: 1, taomlar: [] });
    let r; try { r = await env.KALKIFIT_DB.prepare("SELECT * FROM yorliq_taklif WHERE holat = 'qoshildi' ORDER BY nom LIMIT 2000").all(); } catch (e) { return json(200, { v: 1, taomlar: [] }); }
    return json(200, { v: 1, taomlar: (r.results || []).map(asFood) }, { 'Cache-Control': 'public, max-age=600' });
  }
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'GET, POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  let body; try { const raw = await request.text(); if (raw.length > 600) return fail(400); body = JSON.parse(raw); } catch (e) { return fail(400); }
  const v = validate(body); if (!v) return fail(400);
  if (!env.KALKIFIT_DB || !env.KALKI_AI_KV) return fail(503);
  const cl = num(env.KALKIFIT_YORLIQ_LIMIT, DEFAULT_CLIENT_LIMIT);
  let sabab; try { sabab = await takeKfQuota(env, request, typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '', { ns: 'yq', site: num(env.KALKIFIT_YORLIQ_SITE_LIMIT, DEFAULT_SITE_LIMIT), client: cl, ip: cl * 2 }); } catch (e) { return fail(503); }
  if (sabab) return fail(429);
  const h = await sha(v.key + '|' + v.kcal), kun = tashkentDay(), db = env.KALKIFIT_DB;
  try {
    await db.prepare("INSERT OR IGNORE INTO yorliq_taklif (h, kalit, nom, til, kcal, birlik, holat, birinchi, oxirgi) VALUES (?, ?, ?, ?, ?, ?, 'yangi', ?, ?)").bind(h, v.key, v.nom, v.til, v.kcal, v.birlik, kun, kun).run();
    await db.prepare('UPDATE yorliq_taklif SET jami = jami + 1, rasm = rasm + ?, o_sum = o_sum + ?, y_sum = y_sum + ?, u_sum = u_sum + ?, g = CASE WHEN ? > 0 THEN ? ELSE g END, oxirgi = ? WHERE h = ?').bind(v.rasm, v.o, v.y, v.u, v.g, v.g, kun, h).run();
  } catch (e) { console.error('yorliq db xato'); return fail(503); }
  return json(200, { ok: true });
}
