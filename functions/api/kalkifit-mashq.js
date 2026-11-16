/* kalki.uz — KalkiFit: SOAT ILOVASI SKRINSHOTIDAN mashg'ulot (v82). Foydalanuvchi Huawei Health / Samsung Health / Mi Fitness / Apple Fitness / Garmin / Strava natija ekranini yuboradi (1–3 rasm: bitta mashg'ulotning turli tablari).
 * AI FAQAT skrinshotdagi raqamlarni o'qiydi (tur, davomiylik, kkal va uning turi, puls, masofa, qadam, sana-vaqt, manba ilova) — o'zidan taxmin qilmaydi. Kkal hisobi (tinch holatni ayirish, puls formulasi, MET) mijozda: assets/kalkifit-core.js shotKcal.
 * Rasm mijozda kichraytirilgan JPEG sifatida keladi. Rasm SAQLANMAYDI va LOGLANMAYDI: faqat model so'roviga uzatiladi, javobdan keyin tashlanadi.
 * Limit: taom rasmi / retsept bilan UMUMIY kunlik AI hisobi (mehmon 8 / akkaunt 15 / Cheksiz AI) — kalkifit-quota.js. Xato yoki «mashg'ulot emas» natijasida limit QAYTARILADI (refundKfQuota).
 * POST { imgs: [<base64 JPEG yoki data URL>] (1–3), til: 'uz'|'ru'|'kirill', mijoz_id, platforma? } →
 *   { mashq: { tur, nom, daq, kkal, kkal_turi: 'faol'|'umumiy'|'nomalum', puls, pulsMax, masofa, qadam, sana, vaqt, manba } | null (mashg'ulot emas), limit, qoldi, akkaunt } | { xato, sabab?, limit?, qoldi? } */
import { originOk, json, num, UUID_RE } from './ariza.js';
import { rasmStat } from '../_lib/rasm-stat.js';
import { takeKfQuota, refundKfQuota, aiLimits, aiLimitMsg, RASM_SAYT_TAVAN } from './kalkifit-quota.js';
import { jpegBytes } from './kalkifit-rasm.js';

const MODEL = 'claude-haiku-5-5', TIMEOUT_MS = 22000, TOTAL_MS = 44000, MAX_TOKENS = 700, MAX_ATTEMPTS = 2, MAX_IMGS = 3, LIM_IMG = { b64: 1000000, bytes: 740000 }, MAX_BODY = MAX_IMGS * LIM_IMG.b64 + 4000;
export const TURLAR = ['yugurish', 'yurish', 'zal', 'velosiped', 'futbol', 'suzish', 'uyda', 'hiit', 'raqs', 'yoga', 'kurash', 'voleybol', 'boshqa'];
export const MANBALAR = ['Huawei Health', 'Samsung Health', 'Mi Fitness', 'Zepp', 'Apple Fitness', 'Garmin Connect', 'Strava', 'Google Fit', 'Fitbit', 'Polar Flow', 'Amazfit'];
const SYSTEM = `Sen smart-soat / fitnes ilovasidagi MASHG'ULOT NATIJASI skrinshotini O'QIYDIGAN yordamchisan (Huawei Health, Samsung Health, Mi Fitness / Zepp, Apple Fitness, Garmin Connect, Strava, Google Fit, Fitbit, Polar). Ekran ruscha, o'zbekcha yoki inglizcha bo'lishi mumkin.
Faqat skrinshotda YOZILGAN raqamlarni ko'chir — o'zingdan taxmin qilma, to'ldirma, hisoblama. Bir necha rasm bo'lsa — ular BITTA mashg'ulotning turli ekranlari (umumiy, puls, kkal, masofa): hammasidan bitta natija yig'.
Faqat JSON obyekt qaytar, boshqa hech narsa yozma:
{"mashq": true|false, "tur": ${TURLAR.map((t) => '"' + t + '"').join('|')}, "nom": soatdagi asl nom (masalan «ВИИТ», «Бег на улице», «Traditional strength training»), "daq": davomiylik daqiqada (butun son; soat:daqiqa:soniya bo'lsa daqiqaga aylantir), "kkal": kilokaloriya (butun son yoki null), "kkal_turi": "faol"|"umumiy"|"nomalum", "puls_o": o'rtacha puls (null bo'lishi mumkin), "puls_max": maksimal puls (null), "masofa_km": kilometr (null), "qadam": qadamlar soni (null), "sana": "YYYY-MM-DD" yoki null, "vaqt": boshlanish "HH:MM" yoki null, "manba": ilova nomi yoki ""}
Qoidalar:
- Skrinshot mashg'ulot natijasi bo'lmasa (ovqat, selfi, chat, oddiy ekran, kundalik faollik umumiy xulosasi) — {"mashq": false} qaytar.
- tur: yugurish (yugurish, beg, run), yurish (yurish, ходьба, walk, prогулка), zal (kuch mashqlari, trenajyor, strength), velosiped, futbol, suzish (basseyn, ochiq suv), uyda (uyda mashq, kardio, aerobika, kross-trening), hiit (ВИИТ, HIIT, interval trening, tabata), raqs, yoga (yoga, pilates, cho'zilish), kurash (boks, kurash, jang san'ati), voleybol (voleybol, basketbol, tennis, jamoaviy to'p o'yini), boshqa — mos kelmasa. «nom» ga soatdagi asl nomni yoz.
- kkal_turi: ekranda «Faol kkal / Active calories / Активные ккал / Faol energiya» yozilgan bo'lsa "faol"; «Jami / Total / Общие / Umumiy» yoki shunchaki «ккал / kcal / Calories» (faolligi aytilmagan) bo'lsa — "umumiy" agar jami ekani aniq bo'lsa, aniq bo'lmasa "nomalum". Kkal ekranlarning birida ko'rinmasa (masalan faqat puls zonalari) — null.
- Puls zonalari, grafik yoki kuchli-zaif ko'rsatkichlarni kkal deb o'qima. O'rtacha puls — «O'rt. puls / Avg HR / Ср. пульс»; maksimal — «Maks / Max».
- Davomiylik ko'rinmasa — null. Sana ko'rinmasa — null (o'ylab topma). Tibbiy maslahat berma.`;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const clean = (x, L) => String(x == null ? '' : x).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, L);
function n0(x, lo, hi, dp) { if (x == null || x === '') return null; const v = Number(String(x).replace(',', '.')); if (!isFinite(v) || v < lo || v > hi) return null; const m = dp ? Math.pow(10, dp) : 1; return Math.round(v * m) / m; }
export function extractObj(text) { const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('{'), j = t.lastIndexOf('}'); if (i < 0 || j < i) return null; try { const a = JSON.parse(t.slice(i, j + 1)); return a && typeof a === 'object' && !Array.isArray(a) ? a : null; } catch (e) { return null; } }
/* AI javobi → toza obyekt yoki null («mashg'ulot emas»: mashq === false yoki na davomiylik, na kkal, na puls o'qilgan). Mantiqsiz qiymat (puls 300, kkal 90 000, davomiylik 24 soatdan ko'p) — null maydon. */
export function sanitizeShot(a, today) {
  if (!a || a.mashq === false) return null;
  const tur = TURLAR.includes(a.tur) ? a.tur : 'boshqa', daq = n0(a.daq, 1, 600), kkal = n0(a.kkal, 1, 5000), puls = n0(a.puls_o, 40, 220);
  let pm = n0(a.puls_max, 60, 250); if (pm != null && puls != null && pm < puls) pm = null;
  if (daq == null && kkal == null && puls == null) return null;
  const sana = typeof a.sana === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a.sana) && !isNaN(Date.parse(a.sana)) && (!today || a.sana <= today) ? a.sana : null, vaqt = typeof a.vaqt === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(a.vaqt) ? a.vaqt : null;
  const mn = clean(a.manba, 24).toLowerCase(), manba = MANBALAR.find((m) => m.toLowerCase() === mn) || MANBALAR.find((m) => mn && (mn.includes(m.toLowerCase().split(' ')[0]) || m.toLowerCase().includes(mn))) || (mn ? clean(a.manba, 24) : '');
  return { tur, nom: clean(a.nom, 40), daq, kkal, kkal_turi: kkal == null ? null : (a.kkal_turi === 'faol' || a.kkal_turi === 'umumiy' ? a.kkal_turi : 'nomalum'), puls: puls, pulsMax: pm, masofa: n0(a.masofa_km, 0.01, 500, 2), qadam: n0(a.qadam, 1, 80000), sana, vaqt: sana ? vaqt : null, manba };
}
export const _test = { SYSTEM, sanitizeShot, extractObj };

async function askVision(env, imgs, til, ms) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms || TIMEOUT_MS);
  try {
    const content = imgs.map((b64) => ({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }));
    content.push({ type: 'text', text: (til === 'ru' ? 'Прочитай результат тренировки со скриншота (скриншотов).' : "Skrinshotdagi mashg'ulot natijasini o'qi.") + ' JSON.' });
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: ctl.signal, headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, thinking: { type: 'disabled' }, system: SYSTEM, messages: [{ role: 'user', content }] }) });
    if (!res.ok) {
      console.error('mashq: model status', res.status);
      if (res.status === 429 || res.status === 529) return { err: 'band', qayta: true, wait: Math.min(2000, (parseInt(res.headers.get('retry-after'), 10) || 0) * 1000) };
      if (res.status >= 500) return { err: 'provayder', qayta: true };
      if (res.status === 400 || res.status === 413) return { err: 'format', qayta: false };
      return { err: 'ichki', qayta: false };
    }
    const j = await res.json(); return { text: (j.content || []).map((c) => c.text || '').join('') };
  } catch (e) { const t = e && e.name === 'AbortError'; console.error('mashq: model xato', t ? 'vaqt' : 'tarmoq'); return { err: t ? 'vaqt' : 'provayder', qayta: true }; } finally { clearTimeout(timer); }
}
const SABAB_HTTP = { provayder: 502, band: 503, vaqt: 504, hajm: 413, format: 400, ichki: 503 };
const SABAB_MSG = { provayder: "AI hozir javob bermadi. Qo'lda kiriting.", band: "AI hozir band, 1 daqiqadan keyin urinib ko'ring.", vaqt: "Javob kechikdi. Qayta urinib ko'ring yoki qo'lda kiriting.", hajm: 'Rasm juda katta.', format: "Rasm o'qilmadi. Boshqa skrinshot tanlang.", ichki: "Xizmat vaqtincha ishlamayapti. Qo'lda kiriting." };
const E = { 400: "So'rov noto'g'ri.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 413: 'Rasm juda katta.', 415: 'JSON yuboring.', 4291: "Rasm tahlili bugun juda band — mashg'ulotni qo'lda kiriting. Ertaga yana ishlaydi." };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });
const failS = (sabab, extra) => json(SABAB_HTTP[sabab] || 500, Object.assign({ xato: SABAB_MSG[sabab] || 'Xato.', sabab }, extra || {}), sabab === 'band' ? { 'Retry-After': '60' } : undefined);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  const len = parseInt(request.headers.get('Content-Length') || '0', 10); if (len > MAX_BODY) { await rasmStat(env, 'hajm'); return failS('hajm'); }
  let body; try { const raw = await request.text(); if (raw.length > MAX_BODY) { await rasmStat(env, 'hajm'); return failS('hajm'); } body = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!body || typeof body !== 'object' || !Array.isArray(body.imgs) || body.imgs.length < 1 || body.imgs.length > MAX_IMGS) return fail(400);
  const imgs = []; for (const s of body.imgs) { if (typeof s !== 'string') return fail(400); const r = jpegBytes(s, LIM_IMG); if (!r) { await rasmStat(env, 'format'); return failS('format'); } if (r.err) { await rasmStat(env, 'hajm'); return failS('hajm'); } imgs.push(r.b64); }
  if (!env.ANTHROPIC_API_KEY || !env.KALKI_AI_KV) { await rasmStat(env, 'ichki'); return failS('ichki'); }
  const cid = typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '';
  const lim = aiLimits(env, body), out = {}, qo = { ns: 'img', uns: 'ai', ai: true, platforma: body.platforma, site: num(env.KALKIFIT_IMG_SITE_LIMIT, RASM_SAYT_TAVAN), client: lim.client, ip: lim.ip, out };
  let sabab; try { sabab = await takeKfQuota(env, request, cid, qo); } catch (e) { console.error('mashq: kvota xato'); await rasmStat(env, 'ichki'); return failS('ichki'); }
  if (sabab) return json(429, { xato: sabab === 'sayt' ? E[4291] : aiLimitMsg(out.limit || lim.client), sabab, limit: out.limit || lim.client, qoldi: 0, akkaunt: !!out.akkaunt });
  const til = body.til === 'ru' ? 'ru' : 'uz', t0 = Date.now(), today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
  let last = 'ichki';
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const left = TOTAL_MS - (Date.now() - t0); if (attempt > 0 && left < 8000) break;
    const r = await askVision(env, imgs, til, Math.min(TIMEOUT_MS, left));
    if (r.err) { last = r.err; if (!r.qayta) break; await sleep(Math.max(r.wait || 0, r.err === 'band' ? 1500 : 700)); continue; }
    const a = extractObj(r.text);
    if (a) {
      const m = sanitizeShot(a, today);
      if (!m) { await refundKfQuota(env, request, cid, qo); await rasmStat(env, 'ok'); return json(200, { mashq: null, limit: out.limit || lim.client, qoldi: out.qoldi >= 9000 ? out.qoldi : (out.qoldi || 0) + 1, akkaunt: !!out.akkaunt }); }          // «mashg'ulot emas» — limit sarflanmaydi
      await rasmStat(env, 'ok'); return json(200, { mashq: m, limit: out.limit || lim.client, qoldi: out.qoldi, akkaunt: !!out.akkaunt });
    }
    last = 'provayder'; console.error("mashq: javob o'qilmadi"); await sleep(700);
  }
  await refundKfQuota(env, request, cid, qo);                       // muvaffaqiyatsiz so'rov foydalanuvchi hisobiga yozilmaydi
  await rasmStat(env, last);
  return failS(last, { limit: out.limit || lim.client, akkaunt: !!out.akkaunt });
}
