/* kalki.uz — KalkiFit «Menyudan tanlash»: kafe MENYUSI surati → taom nomlari va narxlari (kkal YO'Q: ilova bazadan oladi, assets/kalkifit-menyu.js).
 * Rasm SAQLANMAYDI va LOGLANMAYDI: faqat model so'roviga uzatiladi. Limit: rasm/retsept/ovoz bilan UMUMIY kunlik AI hisobi (kalkifit-quota.js: Android 2, veb 5); sayt tavani alohida ('mn').
 * POST { img: <base64 JPEG>, til: 'uz'|'ru'|'kirill', mijoz_id, platforma? } → { taomlar: [{ nom, asl, narx }], limit, qoldi } | { xato, sabab?, limit?, qoldi? } */
import { originOk, json, num, UUID_RE } from './ariza.js';
import { takeKfQuota, aiLimits, aiLimitMsg } from './kalkifit-quota.js';
import { jpegBytes } from './kalkifit-rasm.js';

const MODEL = 'claude-haiku-5-5', TIMEOUT_MS = 26000, BUDGET_MS = 42000, MAX_B64 = 1400000, MAX_BYTES = 1000000, DEFAULT_SITE = 300;          // menyu rasmi kattaroq (matn o'qiladi): 1600 px gacha, ≤ ~1 MB
import M from '../../assets/kalkifit-menyu.js';
const KEYS = Object.keys(M.KOMP), BOL = M.BOLIM, VALS = ['UZS', 'RUB', 'USD', 'EUR', 'KZT'];
export const SYSTEM = `Sen kafe/restoran MENYUSI suratini o'qiydigan yordamchisan (O'zbekiston va boshqa davlatlar, menyu o'zbek, rus yoki ingliz tilida bo'lishi mumkin). Vazifang — faqat AJRATIB OLISH. Kaloriya va gramm YOZMA.
Faqat JSON massiv qaytar, boshqa hech narsa yozma. Har taom uchun BITTA element:
{"asl": menyuda yozilgan nomi aynan (tavsifsiz, qisqa, asl tilida), "nom": o'zbekcha oddiy umumiy nom (masalan «Grek salati», «Mol go'shti tartari», «Mol go'shti fileti, kartoshka pyuresi bilan», «Osh», «Lag'mon», «Shashlik (qo'y go'shti)»), "bolim": ${BOL.map((b) => '"' + b + '"').join(' | ')}, "tarkib": [asosiy tarkibiy qismlar, FAQAT shu ro'yxatdan: ${KEYS.join(', ')}], "narx": son yoki null, "valyuta": ${VALS.map((v) => '"' + v + '"').join(' | ')} yoki null}.
Bo'lim — menyudagi sarlavha bo'yicha (Салаты → salat, Супы → shorva, Закуски/Холодные закуски → zakuska, Горячие блюда/Основные → issiq, Гарниры → garnir, Десерты → desert, Напитки → ichimlik, Соусы → sous, Хлеб → non); sarlavha bo'lmasa — taomning o'zidan. Masalan «Греческий» salatlar ichida bo'lsa — Grek salati (bolim: salat, tarkib: pomidor, bodring, qalampir, piyoz, feta, zaytun, zaytun_yogi); «Тартар из говядины» — zakuska, tarkib: mol_gosht_xom, mayonez (aioli bo'lsa), …; «Филе говядины с картофельным пюре и соусом» — issiq, tarkib: mol_gosht, kartoshka_pyure, qaymoq yoki qoziqorin (sous turiga qarab).
Valyuta — menyudagi belgidan: ₽/руб → RUB, $ → USD, € → EUR, so'm/сум/UZS → UZS, ₸ → KZT; belgi yo'q bo'lsa va narxlar minglab (45 000) bo'lsa — UZS; aniq bo'lmasa — null. Narx: «45 000» yoki «45.000» — 45000; «560» — 560; «12,50» — 12.5.
Qoidalar: eng ko'pi 25 taom; tarkibga ro'yxatda YO'Q narsani yozma (umuman mos kalit bo'lmasa — []); bir xil taomni takrorlama. Suratda menyu bo'lmasa bo'sh massiv [] qaytar. Odamlar, telefon raqamlari, manzil haqida yozma.`;
const clean = (x, n) => String(x == null ? '' : x).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
/* javob kesilgan bo'lsa ham (max_tokens) tugallangan taomlar saqlanadi: '[' dan oxirgi to'liq '}' gacha */
export function extractMenu(text) {
  const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('['); if (i < 0) return null;
  const j = t.lastIndexOf(']'); if (j > i) { try { const a = JSON.parse(t.slice(i, j + 1)); if (Array.isArray(a)) return a; } catch (e) { /* kesilgan — quyida */ } }
  const k = t.lastIndexOf('}'); if (k <= i) return null; try { const a = JSON.parse(t.slice(i, k + 1) + ']'); return Array.isArray(a) ? a : null; } catch (e) { return null; }
}
export function sanitize(list) {
  const out = [], seen = new Set();
  for (const it of (list || []).slice(0, 40)) {
    if (!it || typeof it !== 'object') continue; const asl = clean(it.asl, 80), nom = clean(it.nom, 80) || asl; if (!nom || seen.has((asl || nom).toLowerCase())) continue; seen.add((asl || nom).toLowerCase());
    const bolim = BOL.includes(it.bolim) ? it.bolim : 'boshqa', tarkib = (Array.isArray(it.tarkib) ? it.tarkib : []).filter((k) => typeof k === 'string' && KEYS.includes(k)).filter((k, i, a) => a.indexOf(k) === i).slice(0, 10);
    let valyuta = VALS.includes(it.valyuta) ? it.valyuta : null, narx = Number(it.narx);
    if (!(narx > 0) || !valyuta) { narx = null; valyuta = null; }
    else if (valyuta === 'UZS') { narx = Math.round(narx); if (!(narx >= 100 && narx <= 10000000)) { narx = null; valyuta = null; } }
    else { narx = Math.round(narx * 100) / 100; if (!(narx <= 1000000)) { narx = null; valyuta = null; } }
    out.push({ asl: asl || nom, nom, bolim, tarkib, narx, valyuta }); if (out.length >= 30) break;
  }
  return out;
}
async function askVision(env, b64, til, ms) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms || TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: ctl.signal, headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 4000, thinking: { type: 'disabled' }, system: SYSTEM, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }, { type: 'text', text: til === 'ru' ? 'Прочитай меню. Названия — на русском.' : "Menyuni o'qi. Nomlarni o'zbek tilida yoz." }] }] }) });
    if (!res.ok) { console.error('menyu: model status', res.status); return { err: true }; }
    const j = await res.json(); return { text: (j.content || []).map((c) => c.text || '').join('') };
  } catch (e) { console.error('menyu: model xato'); return { err: true }; } finally { clearTimeout(timer); }
}
export const _test = { sanitize, extractMenu, SYSTEM };
const E = { 400: "Rasm noto'g'ri. JPEG yuboring.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 413: 'Rasm juda katta.', 415: 'JSON yuboring.', 4291: 'Menyu tahlili bugun juda band. Ertaga yana ishlaydi.', 502: 'AI hozir javob bermadi.', 503: 'Xizmat vaqtincha ishlamayapti.' };
/* sabab — mijoz aniq matn ko'rsatishi uchun: format | hajm | ai (model xatosi/kechikish) | parse (javob o'qilmadi) | sozlanmagan */
const fail = (s, sabab) => json(s, { xato: E[s] || 'Xato.', sabab: sabab || '' });

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  const len = parseInt(request.headers.get('Content-Length') || '0', 10); if (len > MAX_B64 + 2000) return fail(413, 'hajm');
  let body; try { const raw = await request.text(); if (raw.length > MAX_B64 + 2000) return fail(413, 'hajm'); body = JSON.parse(raw); } catch (e) { return fail(400, 'format'); }
  if (!body || typeof body !== 'object' || typeof body.img !== 'string') return fail(400, 'format');
  const img = jpegBytes(body.img, { b64: MAX_B64, bytes: MAX_BYTES }); if (!img) return fail(400, 'format'); if (img.err) return fail(img.err, 'hajm');
  if (!env.ANTHROPIC_API_KEY || !env.KALKI_AI_KV) return fail(503, 'sozlanmagan');
  const cid = typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '';
  const lim = aiLimits(env, body), out = {};
  let sabab; try { sabab = await takeKfQuota(env, request, cid, { ns: 'mn', uns: 'ai', site: num(env.KALKIFIT_MENYU_SITE_LIMIT, DEFAULT_SITE), client: lim.client, ip: lim.ip, out }); } catch (e) { return fail(503); }
  if (sabab) return json(429, { xato: sabab === 'sayt' ? E[4291] : aiLimitMsg(lim.client), sabab, limit: lim.client, qoldi: 0 });
  const t0 = Date.now(); let sabab2 = 'ai';          // 1–2 urinish, jami ≤ BUDGET_MS (mijoz 50 s kutadi)
  for (let attempt = 0; attempt < 2; attempt++) {
    const left = BUDGET_MS - (Date.now() - t0); if (attempt && left < 12000) break;
    const r = await askVision(env, img.b64, body.til === 'ru' ? 'ru' : 'uz', Math.min(TIMEOUT_MS, left)); if (r.err) { sabab2 = 'ai'; continue; }
    const list = extractMenu(r.text); if (list) return json(200, { taomlar: sanitize(list), limit: lim.client, qoldi: out.qoldi });
    sabab2 = 'parse';
  }
  return fail(502, sabab2);
}
