/* kalki.uz — KalkiFit: ovqat SURATI → taomlar ro'yxati, porsiya taxmini, kkal va makro (taxminiy ±30%).
 * Rasm mijozda 1024 px ga kichraytirilgan JPEG (sifat 0,8) sifatida keladi. Rasm SAQLANMAYDI va LOGLANMAYDI: faqat model so'roviga uzatiladi, javobdan keyin tashlanadi.
 * AI FAQAT nom (2–3 variant, ehtimol bo'yicha) va porsiya og'irligini aniqlaydi; ilova kaloriyani iloji bo'lsa BAZADAN oladi (bazada yo'q bo'lsa AI qiymati «taxminiy ±30%»).
 * Limit: retsept bilan UMUMIY kunlik AI hisobi (kalkifit-quota.js AI_LIMIT: Android ilovasi 2, veb 5; mijoz_id + IP), sayt tavani alohida. Origin — ariza.js kabi.
 * v67: tur: 'yorliq' — QADOQ YORLIG'I (ozuqaviy qiymat jadvali): AI FAQAT raqamlarni o'qiydi (100 g uchun kkal, oqsil, yog', uglevod; ixtiyoriy — qadoq og'irligi va nomi). Limit — shu rasm limitidan (umumiy AI hisobi).
 *   → { yorliq: { nom, kcal, o, y, u, qadoq, birlik: 'g'|'ml' } | null (yorliq o'qilmadi), limit, qoldi }. Rasm bu rejimda ham SAQLANMAYDI.
 * POST { img: <base64 JPEG yoki data URL>, til: 'uz'|'ru'|'kirill', mijoz_id, platforma?, tur? } →
 *   { ovqatlar: [{ nom, ehtimol, boshqa: [{ nom, ehtimol }], porsiya, g, kcal, o, y, u }], aniqlik: '±30%', limit, qoldi } | { xato, sabab?, limit?, qoldi? } */
import { originOk, json, num, UUID_RE } from './ariza.js';
import { rasmStat } from '../_lib/rasm-stat.js';
import { takeKfQuota, refundKfQuota, aiLimits, aiLimitMsg, RASM_SAYT_TAVAN } from './kalkifit-quota.js';

const MODEL = 'claude-haiku-5-5', TIMEOUT_MS = 18000, TOTAL_MS = 42000, MAX_TOKENS = 1800, MAX_ATTEMPTS = 3, RETRY_WAIT = { band: 1500, default: 700 }, MAX_B64 = 1000000, MAX_BYTES = 700000, DEFAULT_SITE = RASM_SAYT_TAVAN;   // sayt tavani: kuniga 500 (KALKIFIT_IMG_SITE_LIMIT); foydalanuvchi limiti — umumiy AI hisobi
const SYSTEM = `Sen ovqat suratidagi taomlarni ANIQLOVCHI yordamchisan (O'zbekiston va Markaziy Osiyo oshxonasi + kundalik ovqatlar). Vazifang: taom NOMI va porsiya og'irligi; kaloriya faqat zaxira uchun (ilova bazadan oladi).
Faqat JSON massiv qaytar, boshqa hech narsa yozma. Har taom uchun BITTA element:
{"variantlar": [{"nom": eng ehtimolli nom, "ehtimol": 0..1}, {"nom": ikkinchi variant, "ehtimol": ...}, {"nom": uchinchi (ixtiyoriy), "ehtimol": ...}], "porsiya": oddiy so'zlarda ("1 lagan", "2 dona"), "g": taxminiy og'irlik gramm (butun son), "kcal": butun porsiya kkal, "o": oqsil g, "y": yog' g, "u": uglevod g}.
Nomlar foydalanuvchi tilida, qisqa va oddiy (bazada qidirsa topiladigan): masalan «Qovurilgan jigar», «Jigar kabob», «Mol go'shti qovurma», «Osh», «Somsa», «Lag'mon», «Manti», «Chuchvara», «Shashlik (qo'y go'shti)», «Lyulya kabob», «Tovuq kabob», «Norin», «Dimlama», «Qozon kabob», «Mastava», «Sho'rva», «Qovurdoq», «Tuxum barak», «Ko'k somsa», «Non».
Bilish kerak:
- Ichki a'zolar: jigar (to'q qizg'ish-jigarrang, silliq, tolasiz, kesigi bir xil; ko'pincha piyoz bilan qovuriladi), buyrak, yurak, til, qorin (requha), o'pka — ularni oddiy «go'sht» deb yozma, mos variantni ber.
- Kabob turlari: bo'lakli go'sht kabob, jigar kabob (ko'pincha dumba bilan navbatma-navbat), lyulya/qiyma kabob, tovuq kabob, baliq kabob.
- Go'sht turini (mol, qo'y, tovuq, ot) aniq ajrata olmasang — nomni «Go'sht (aniq emas)» deb yoz va variantlarda ehtimolli turlarni ber; kartoshka yoki piyoz suratda AYNAN ko'rinmasa ularni qo'shma.
- Variantlar ehtimol bo'yicha kamayib borsin (yig'indisi ≈ 1); ikkilansang uchinchi variantni ham ber.
Qoidalar: eng ko'pi 6 taom; qiymatlar suratdagi ANIQ porsiya uchun (100 g uchun emas); suratda ovqat bo'lmasa bo'sh massiv [] qaytar; odamlar, matn yoki boshqa narsalar haqida yozma; tibbiy maslahat berma.`;

const SYSTEM_YORLIQ = `Sen oziq-ovqat QADOG'IDAGI ozuqaviy qiymat jadvalini (Пищевая ценность / Nutrition facts / Ozuqaviy qiymati) O'QIYDIGAN yordamchisan. Faqat suratda YOZILGAN raqamlarni ko'chir — o'zingdan taxmin qilma, to'ldirma.
Faqat JSON obyekt qaytar, boshqa hech narsa yozma:
{"yorliq": true|false, "nom": qadoqdagi mahsulot nomi (brend + nom, qisqa; ko'rinmasa ""), "kcal": 100 g (yoki 100 ml) uchun kkal, "oqsil": g, "yog": g, "uglevod": g, "asos": "100" yoki "porsiya", "porsiya_g": porsiya og'irligi (asos "porsiya" bo'lsa), "qadoq": qadoqdagi sof og'irlik/hajm soni (yozilmagan bo'lsa 0), "birlik": "g" yoki "ml"}
Qoidalar: jadvalda 100 g uchun ustun bo'lsa — FAQAT o'shani ol; faqat porsiya uchun berilgan bo'lsa asos "porsiya" va porsiya_g ni yoz. Faqat kJ yozilgan bo'lsa kkal = kJ / 4,184. Yozilmagan makro — null. Vergul — o'nli kasr (12,5 → 12.5).
Suratda ozuqaviy qiymat jadvali bo'lmasa yoki raqamlar o'qilmasa {"yorliq": false} qaytar. Odamlar, boshqa matn haqida yozma; tibbiy maslahat berma.`;
export function extractObj(text) { const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('{'), j = t.lastIndexOf('}'); if (i < 0 || j < i) return null; try { const a = JSON.parse(t.slice(i, j + 1)); return a && typeof a === 'object' && !Array.isArray(a) ? a : null; } catch (e) { return null; } }
/* yorliq javobi → 100 g uchun qiymatlar (yoki null). Mantiqsiz raqam (100 g da > 900 kkal, makro > 100 g) — o'qilmagan deb hisoblanadi; 4/9/4 mosligi bu yerda TUZATILMAYDI — ilova foydalanuvchiga ogohlantiradi */
export function sanitizeLabel(a) {
  if (!a || a.yorliq === false) return null;
  const n = (x) => (x == null || x === '' ? NaN : Number(String(x).replace(',', '.')));
  let k = n(a.kcal), o = n(a.oqsil), y = n(a.yog), u = n(a.uglevod);
  if (a.asos === 'porsiya') { const pg = n(a.porsiya_g); if (!(pg >= 5 && pg <= 2000)) return null; const m = 100 / pg; k *= m; o *= m; y *= m; u *= m; }
  if (!(k >= 0 && k <= 900)) return null;
  const r1 = (x) => (isFinite(x) && x >= 0 && x <= 100 ? Math.round(x * 10) / 10 : null);
  o = r1(o); y = r1(y); u = r1(u); if ((o || 0) + (y || 0) + (u || 0) > 105) return null;
  const q = n(a.qadoq);
  return { nom: cleanNom(a.nom), kcal: Math.round(k), o, y, u, qadoq: q >= 1 && q <= 5000 ? Math.round(q) : 0, birlik: a.birlik === 'ml' ? 'ml' : 'g' };
}
/* v77: javob max_tokens ga urilib kesilib qolsa (5–6 taomli dasturxon) — to'liq tugagan obyektlar saqlab olinadi (kesilgan oxirgisi tashlanadi) */
function salvageArray(t) {
  const i = t.indexOf('['); if (i < 0) return null; const out = []; let depth = 0, st = -1, str = false, esc = false;
  for (let k = i + 1; k < t.length; k++) {
    const c = t[k];
    if (str) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') str = false; continue; }
    if (c === '"') str = true; else if (c === '{') { if (depth === 0) st = k; depth++; } else if (c === '}') { depth--; if (depth === 0 && st >= 0) { try { out.push(JSON.parse(t.slice(st, k + 1))); } catch (e) { /* o'tkazib yuboriladi */ } st = -1; } }
  }
  return out.length ? out : null;
}
export function extractJson(text) { const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('['), j = t.lastIndexOf(']'); if (i < 0) return null; if (j > i) { try { const a = JSON.parse(t.slice(i, j + 1)); if (Array.isArray(a)) return a; } catch (e) { /* kesilgan bo'lishi mumkin */ } } return salvageArray(t); }
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const cleanNom = (x) => String(x == null ? '' : x).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
export function sanitize(list) {
  const out = [];
  for (const it of (list || []).slice(0, 6)) {
    if (!it || typeof it !== 'object') continue;
    let vs = Array.isArray(it.variantlar) ? it.variantlar : [];
    if (!vs.length && it.nom) vs = [{ nom: it.nom, ehtimol: 1 }];                 // eski format (bitta nom) ham qabul qilinadi
    const seen = new Set(); vs = vs.map((v) => ({ nom: cleanNom(v && typeof v === 'object' ? v.nom : v), ehtimol: clamp(Math.round(Number(v && v.ehtimol) * 100) / 100 || 0, 0, 1) }))
      .filter((v) => v.nom && !seen.has(v.nom.toLowerCase()) && seen.add(v.nom.toLowerCase())).sort((a, b) => b.ehtimol - a.ehtimol).slice(0, 3);
    if (!vs.length) continue;
    let kcal = Math.round(Number(it.kcal)); if (!isFinite(kcal)) continue;
    const o = clamp(Math.round(Number(it.o) * 10) / 10 || 0, 0, 300), y = clamp(Math.round(Number(it.y) * 10) / 10 || 0, 0, 300), u = clamp(Math.round(Number(it.u) * 10) / 10 || 0, 0, 500);
    const atw = Math.round(4 * o + 9 * y + 4 * u); if (atw > 0 && Math.abs(atw - kcal) > Math.max(80, kcal * 0.35)) kcal = atw;
    out.push({ nom: vs[0].nom, ehtimol: vs[0].ehtimol, boshqa: vs.slice(1), porsiya: cleanNom(it.porsiya).slice(0, 40), g: clamp(Math.round(Number(it.g)) || 0, 0, 3000), kcal: clamp(kcal, 0, 3500), o, y, u });
  }
  return out;
}
export function jpegBytes(b64, lim) {                    // lim — { b64, bytes } (menyu rasmi kattaroq); standart: rasm uchun MAX_B64 / MAX_BYTES
  const MB64 = (lim && lim.b64) || MAX_B64, MBY = (lim && lim.bytes) || MAX_BYTES;                    // base64 → JPEG ekanini (FF D8 FF) va taxminiy hajmini tekshirish
  const clean = String(b64 || '').replace(/^data:image\/jpe?g;base64,/i, '').replace(/\s+/g, '');
  if (clean.length < 100 || clean.length > MB64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(clean)) return null;
  const bytes = Math.floor(clean.length * 3 / 4); if (bytes > MBY) return { err: 413 };
  let head; try { head = atob(clean.slice(0, 8)); } catch (e) { return null; }
  if (head.charCodeAt(0) !== 0xFF || head.charCodeAt(1) !== 0xD8 || head.charCodeAt(2) !== 0xFF) return null;
  return { b64: clean, bytes };
}
/* → { text } | { err: 'band'|'provayder'|'vaqt'|'format'|'ichki', status?, qayta: bool }  (qayta — vaqtinchalik xato: qayta urinish mantiqli) */
async function askVision(env, b64, til, yorliq, ms) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), ms || TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: ctl.signal, headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, thinking: { type: 'disabled' }, system: yorliq ? SYSTEM_YORLIQ : SYSTEM, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }, { type: 'text', text: yorliq ? "Qadoq yorlig'idagi ozuqaviy qiymatni o'qi." : (til === 'ru' ? 'Определи блюда на фото. Названия — на русском.' : "Suratdagi taomlarni aniqla. Nomlarni o'zbek tilida yoz.") }] }] }) });
    if (!res.ok) {
      console.error('rasm: model status', res.status);
      if (res.status === 429 || res.status === 529) return { err: 'band', status: res.status, qayta: true, wait: Math.min(2000, (parseInt(res.headers.get('retry-after'), 10) || 0) * 1000) };
      if (res.status >= 500) return { err: 'provayder', status: res.status, qayta: true };
      if (res.status === 400 || res.status === 413) return { err: 'format', status: res.status, qayta: false };            // rasm provayderga yaramadi (hajm/format)
      return { err: 'ichki', status: res.status, qayta: false };                                                      // 401/403/404 — kalit yoki model sozlamasi: foydalanuvchi aybi emas
    }
    const j = await res.json(); return { text: (j.content || []).map((c) => c.text || '').join(''), stop: j.stop_reason };
  } catch (e) { const t = e && e.name === 'AbortError'; console.error('rasm: model xato', t ? 'vaqt' : 'tarmoq'); return { err: t ? 'vaqt' : 'provayder', qayta: true }; } finally { clearTimeout(timer); }
}
export const _test = { extractJson, sanitize, jpegBytes, SYSTEM, extractObj, sanitizeLabel, SYSTEM_YORLIQ };

/* Xato sabablari (v77): har biri alohida kod — mijoz sabab bo'yicha aniq matn ko'rsatadi (uz/ЎЗ/ru), admin statistikada ajratib ko'rinadi.
 *   provayder — AI xizmati 5xx/tarmoq xatosi · band — 429/529 (AI band) · vaqt — javob kechikdi · hajm — rasm juda katta · format — rasm o'qilmadi/JPEG emas · ichki — bizning xato (kalit/model sozlamasi, KV/kvota); AI javobi o'qilmasa — provayder */
const SABAB_HTTP = { provayder: 502, band: 503, vaqt: 504, hajm: 413, format: 400, ichki: 503 };
const SABAB_MSG = { provayder: "AI hozir javob bermadi. Qidiruv orqali qo'shing.", band: "AI hozir band, 1 daqiqadan keyin urinib ko'ring.", vaqt: "Javob kechikdi. Qayta urinib ko'ring yoki qidiruv orqali qo'shing.", hajm: 'Rasm juda katta.', format: "Rasm o'qilmadi. Boshqa rasm tanlang.", ichki: "Xizmat vaqtincha ishlamayapti. Qidiruv orqali qo'shing." };
const E = { 400: "Rasm noto'g'ri. JPEG yuboring.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 413: 'Rasm juda katta.', 415: 'JSON yuboring.', 4291: "Rasm tahlili bugun juda band — ovqatni matn yoki qidiruv bilan qo'shing. Ertaga yana ishlaydi.", 502: "AI hozir javob bermadi. Qo'lda qo'shing.", 503: 'Xizmat vaqtincha ishlamayapti.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });
const failS = (sabab, extra) => json(SABAB_HTTP[sabab] || 500, Object.assign({ xato: SABAB_MSG[sabab] || 'Xato.', sabab, qidiruv: sabab !== 'hajm' && sabab !== 'format' }, extra || {}), sabab === 'band' ? { 'Retry-After': '60' } : undefined);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'POST' });
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return fail(415);
  const len = parseInt(request.headers.get('Content-Length') || '0', 10); if (len > MAX_B64 + 2000) { await rasmStat(env, 'hajm'); return failS('hajm'); }
  let body; try { const raw = await request.text(); if (raw.length > MAX_B64 + 2000) { await rasmStat(env, 'hajm'); return failS('hajm'); } body = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!body || typeof body !== 'object' || typeof body.img !== 'string') return fail(400);
  const img = jpegBytes(body.img); if (!img) { await rasmStat(env, 'format'); return failS('format'); } if (img.err) { await rasmStat(env, 'hajm'); return failS('hajm'); }
  if (!env.ANTHROPIC_API_KEY || !env.KALKI_AI_KV) { await rasmStat(env, 'ichki'); return failS('ichki'); }
  const cid = typeof body.mijoz_id === 'string' && UUID_RE.test(body.mijoz_id) ? body.mijoz_id : '';
  const lim = aiLimits(env, body), out = {}, qo = { ns: 'img', uns: 'ai', ai: true, platforma: body.platforma, site: num(env.KALKIFIT_IMG_SITE_LIMIT, DEFAULT_SITE), client: lim.client, ip: lim.ip, out };
  let sabab; try { sabab = await takeKfQuota(env, request, cid, qo); } catch (e) { console.error('rasm: kvota xato'); await rasmStat(env, 'ichki'); return failS('ichki'); }
  if (sabab) return json(429, { xato: sabab === 'sayt' ? E[4291] : aiLimitMsg(out.limit || lim.client), sabab, limit: out.limit || lim.client, qoldi: 0, akkaunt: !!out.akkaunt });
  const yorliq = body.tur === 'yorliq', til = body.til === 'ru' ? 'ru' : 'uz', t0 = Date.now();
  let last = 'ichki';
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const left = TOTAL_MS - (Date.now() - t0); if (attempt > 0 && left < 6000) break;
    const r = await askVision(env, img.b64, til, yorliq, Math.min(TIMEOUT_MS, left));
    if (r.err) { last = r.err; if (!r.qayta) break; await sleep(Math.max(r.wait || 0, r.err === 'band' ? RETRY_WAIT.band : RETRY_WAIT.default)); continue; }
    if (yorliq) { const a = extractObj(r.text); if (a) { await rasmStat(env, 'ok'); return json(200, { yorliq: sanitizeLabel(a), limit: out.limit || lim.client, qoldi: out.qoldi, akkaunt: !!out.akkaunt }); } last = 'provayder'; await sleep(RETRY_WAIT.default); continue; }
    const list = extractJson(r.text); if (list) { await rasmStat(env, 'ok'); return json(200, { ovqatlar: sanitize(list), aniqlik: '±30%', limit: out.limit || lim.client, qoldi: out.qoldi, akkaunt: !!out.akkaunt }); }
    if (/^\s*(```(?:json)?)?\s*\[\s*\]/.test(String(r.text || ''))) { await rasmStat(env, 'ok'); return json(200, { ovqatlar: [], aniqlik: '±30%', limit: out.limit || lim.client, qoldi: out.qoldi, akkaunt: !!out.akkaunt }); }          // ovqat yo'q: bo'sh massiv — xato emas
    last = 'provayder'; console.error('rasm: javob o\'qilmadi', r.stop || ''); await sleep(RETRY_WAIT.default);
  }
  await refundKfQuota(env, request, cid, qo);                       // muvaffaqiyatsiz so'rov foydalanuvchi hisobiga yozilmaydi
  await rasmStat(env, last);
  return failS(last, { limit: out.limit || lim.client, akkaunt: !!out.akkaunt });
}
