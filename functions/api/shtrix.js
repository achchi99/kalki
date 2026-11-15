/* kalki.uz — KalkiFit v79: SHTRIX-KOD skaneri serveri.   GET /api/shtrix?kod=<8|12|13 raqam>[&til=uz|ru|kirill]
 * ZANJIR: a) o'z D1 jadvalimiz shtrix_mahsulot (migrations/shtrix.sql) → b) KV kesh (alohida, manba='off') → c) Open Food Facts API v2 (faqat kerakli fields) → d) topilmadi.
 * OFF QOIDALARI (docs/shtrix-skaner.md): 1 so'rov = 1 HAQIQIY foydalanuvchi skaneri (qidiruv/yozishda OFF'ga so'rov yuborilmaydi, bazani ko'chirish yo'q); User-Agent'da ilova nomi va saytning
 *   aloqa sahifasi (shaxsiy email EMAS); natija KV'da keshlanadi (musbat 30 kun, topilmadi 3 kun); yaroqsiz javob (kkal yo'q/mantiqsiz, 4/9/4 ±20 %) — «topilmadi».
 * LITSENZIYA: OFF ma'lumoti (ODbL) bizning tekshirilgan bazaga ARALASHTIRILMAYDI: faqat alohida KV kesh va mijozda foydalanuvchining shaxsiy «Mening taomlarim»ida, manba='off' belgisi bilan.
 * Limit: AI ISHLATMAYDI — rasm limitidan sarflanmaydi (alohida 'sh' hisobi: IP bo'yicha kuniga 200, OFF'ga jonli so'rovlar butun sayt bo'yicha kuniga 5000). */
import { originOk, json, num } from './ariza.js';
import { takeKfQuota } from './kalkifit-quota.js';

export const OFF_URL = 'https://world.openfoodfacts.org/api/v2/product/', OFF_UA = 'KalkiFit/1.0 (+https://kalki.uz/biz-haqimizda)';
export const OFF_FIELDS = 'code,product_name,product_name_ru,product_name_uz,generic_name,brands,quantity,product_quantity,product_quantity_unit,serving_size,serving_quantity,nutriments';
const TTL_BOR = 30 * 86400, TTL_YOQ = 3 * 86400, OFF_TIMEOUT = 4500;
const r1 = (x) => Math.round(x * 10) / 10;
/* shtrix-kod: 8 (EAN-8), 12 (UPC-A → oldiga 0), 13 (EAN-13); GS1 nazorat raqami to'g'ri bo'lishi shart. Yaroqsiz — null */
export function normKod(s) {
  let k = String(s == null ? '' : s).trim(); if (!/^\d{8}$|^\d{12,13}$/.test(k)) return null;
  if (k.length === 12) k = '0' + k;
  let sum = 0; for (let i = 0; i < k.length - 1; i++) sum += +k[k.length - 2 - i] * (i % 2 === 0 ? 3 : 1);
  return (10 - (sum % 10)) % 10 === +k[k.length - 1] ? k : null;
}
const nm = (s) => String(s == null ? '' : s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
const fin = (x) => { const v = typeof x === 'string' ? parseFloat(x.replace(',', '.')) : x; return typeof v === 'number' && isFinite(v) ? v : null; };
/* 100 g uchun qiymatlar mantiqiymi: kkal 0–900, makro 0–100 (yig'indisi ≤ 105), 4/9/4 ±20 % (kichik qiymatda ±15 kkal). Qaytaradi {k,p,f,c} yoki null */
export function sanityMakro(k, p, f, c) {
  k = fin(k); p = fin(p); f = fin(f); c = fin(c);
  if ([k, p, f, c].some((x) => x == null) || k < 0 || k > 900 || [p, f, c].some((x) => x < 0 || x > 100) || p + f + c > 105) return null;
  const atw = 4 * p + 9 * f + 4 * c; if (Math.abs(atw - k) > Math.max(15, k * 0.2)) return null;
  return { k: Math.round(k), p: r1(p), f: r1(f), c: r1(c) };
}
/* OFF javobi → bizning shakl yoki null (topilmadi). Faqat 100 g (ml) uchun qiymatlar; nom majburiy */
export function offDan(j, kod) {
  if (!j || j.status !== 1 || !j.product || typeof j.product !== 'object') return null;
  const p = j.product, n = p.nutriments || {};
  let kcal = fin(n['energy-kcal_100g']); if (kcal == null) { const kj = fin(n['energy_100g']); if (kj != null) kcal = kj / 4.184; }
  const q = sanityMakro(kcal, n.proteins_100g, n.fat_100g, n.carbohydrates_100g); if (!q) return null;
  const names = { n: nm(p.product_name || p.generic_name), ru: nm(p.product_name_ru), uz: nm(p.product_name_uz) }; if (names.n.length < 2 && names.ru.length < 2 && names.uz.length < 2) return null;
  let qty = fin(p.product_quantity), unit = String(p.product_quantity_unit || '').toLowerCase();
  if (!(qty > 0)) { const m = /(\d+(?:[.,]\d+)?)\s*(kg|кг|g|gr|г|гр|ml|мл|cl|сл|l|л)\b/i.exec(String(p.quantity || '')); if (m) { const v = parseFloat(m[1].replace(',', '.')), u = m[2].toLowerCase(); unit = /^(ml|мл|cl|сл|l|л)$/.test(u) ? 'ml' : 'g'; qty = /^(kg|кг|l|л)$/.test(u) ? v * 1000 : (/^(cl|сл)$/.test(u) ? v * 10 : v); } }
  const birlik = unit === 'ml' || unit === 'l' || unit === 'cl' ? 'ml' : 'g', qadoq = qty > 0 && qty <= 5000 ? Math.round(qty) : 0;
  const sv = fin(p.serving_quantity), porsiya = sv > 0 && sv <= 1000 ? Math.round(sv) : 0;
  return { kod, nom: names.n, nom_ru: names.ru, nom_uz: names.uz, brend: nm(String(p.brands || '').split(',')[0]), k: q.k, p: q.p, f: q.f, c: q.c, qadoq, porsiya, birlik };
}
const pick = (m, til) => (til === 'ru' && m.nom_ru) || (til !== 'ru' && m.nom_uz) || m.nom || m.nom_ru || m.nom_uz;
const outOf = (m, til, manba, tasdiq) => ({ kod: m.kod, nom: pick(m, til), brend: m.brend || '', k: m.k, p: m.p, f: m.f, c: m.c, qadoq: m.qadoq || 0, porsiya: m.porsiya || 0, birlik: m.birlik === 'ml' ? 'ml' : 'g', manba, tasdiqlangan: !!tasdiq });
const fromRow = (r) => ({ kod: r.kod, nom: r.nom, brend: r.brend, k: Math.round(r.kcal), p: r.oqsil, f: r.yog, c: r.uglevod, qadoq: r.qadoq, porsiya: r.porsiya, birlik: r.birlik });
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
const E = { 400: "Shtrix-kod noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'GET.', 429: 'Limit tugadi.' };
const noStore = { 'Cache-Control': 'no-store' };

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json(405, { xato: E[405] }, { Allow: 'GET' });
  const origin = request.headers.get('Origin'); if (origin && !originOk(origin, env)) return json(403, { xato: E[403] });
  const url = new URL(request.url), kod = normKod(url.searchParams.get('kod')), til = ['ru', 'kirill', 'uz'].includes(url.searchParams.get('til')) ? url.searchParams.get('til') : 'uz';
  if (!kod) return json(400, { xato: E[400] }, noStore);
  const db = env.KALKIFIT_DB, kv = env.KALKI_AI_KV;
  /* a) o'z jadvalimiz */
  if (db) { try { const r = await db.prepare('SELECT * FROM shtrix_mahsulot WHERE kod = ?').bind(kod).first(); if (r) return json(200, { ok: true, manba: 'oz', kod, mahsulot: outOf(fromRow(r), til, 'oz', r.tasdiqlangan) }, noStore); } catch (e) { /* jadval yo'q — keyingi qadam */ } }
  /* b) OFF keshi (alohida kalit — bizning bazadan ajratilgan) */
  const ck = 'shtrix:off:' + kod; let cached = null;
  if (kv) { try { const t = await kv.get(ck); if (t) cached = JSON.parse(t); } catch (e) { cached = null; } }
  if (cached) { if (cached.d) return json(200, { ok: true, manba: 'off', kod, mahsulot: outOf(cached.d, til, 'off', false), kesh: true }, noStore); return await topilmadi(db, kod); }
  /* c) Open Food Facts: faqat haqiqiy skaner so'rovi; limitlar (AI emas) */
  if (kv) {
    let sabab; try { sabab = await takeKfQuota(env, request, '', { ns: 'sh', site: num(env.SHTRIX_SITE_LIMIT, 20000), client: num(env.SHTRIX_LIMIT, 200), ip: num(env.SHTRIX_LIMIT, 200) }); } catch (e) { sabab = null; }
    if (sabab) return json(429, { xato: E[429] }, noStore);
    let off = null; try { off = await takeKfQuota(env, request, '', { ns: 'shof', uns: 'shof', site: num(env.SHTRIX_OFF_LIMIT, 5000), client: 1e9, ip: 1e9 }); } catch (e) { off = null; }
    if (off) return json(200, { ok: true, topilmadi: true, kod, vaqtincha: true }, noStore);
  }
  let j = null, tarmoq = false;
  try { const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), OFF_TIMEOUT); const r = await fetch(OFF_URL + kod + '?fields=' + OFF_FIELDS, { headers: { 'User-Agent': OFF_UA, Accept: 'application/json' }, signal: ctl.signal }); clearTimeout(tm); if (r.status === 404) j = { status: 0 }; else if (!r.ok) tarmoq = true; else j = await r.json(); } catch (e) { tarmoq = true; }
  if (tarmoq) return json(200, { ok: true, topilmadi: true, kod, vaqtincha: true }, noStore);          // OFF javob bermadi: keshlanmaydi va «topilmadi» ro'yxatiga yozilmaydi
  const d = offDan(j, kod);
  if (kv) { try { await kv.put(ck, JSON.stringify({ t: Date.now(), d }), { expirationTtl: d ? TTL_BOR : TTL_YOQ }); } catch (e) { /* kesh yozilmasa ham javob qaytadi */ } }
  if (d) return json(200, { ok: true, manba: 'off', kod, mahsulot: outOf(d, til, 'off', false) }, noStore);
  return await topilmadi(db, kod);
}
async function topilmadi(db, kod) {
  if (db) { const kun = tashkentDay(); try { await db.prepare('INSERT OR IGNORE INTO shtrix_topilmadi (kod, soni, birinchi, oxirgi) VALUES (?, 0, ?, ?)').bind(kod, kun, kun).run(); await db.prepare('UPDATE shtrix_topilmadi SET soni = soni + 1, oxirgi = ? WHERE kod = ?').bind(kun, kod).run(); } catch (e) { /* jadval yo'q */ } }
  return json(200, { ok: true, topilmadi: true, kod }, noStore);
}
