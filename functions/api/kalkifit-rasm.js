/* kalki.uz — KalkiFit: ovqat SURATI → taomlar ro'yxati, porsiya taxmini, kkal va makro (taxminiy ±30%).
 * Rasm mijozda 1024 px ga kichraytirilgan JPEG (sifat 0,8) sifatida keladi. Rasm SAQLANMAYDI va LOGLANMAYDI: faqat model so'roviga uzatiladi, javobdan keyin tashlanadi.
 * AI FAQAT nom (2–3 variant, ehtimol bo'yicha) va porsiya og'irligini aniqlaydi; ilova kaloriyani iloji bo'lsa BAZADAN oladi (bazada yo'q bo'lsa AI qiymati «taxminiy ±30%»).
 * Limit: retsept bilan UMUMIY kunlik AI hisobi (kalkifit-quota.js AI_LIMIT: Android ilovasi 2, veb 5; mijoz_id + IP), sayt tavani alohida. Origin — ariza.js kabi.
 * POST { img: <base64 JPEG yoki data URL>, til: 'uz'|'ru'|'kirill', mijoz_id, platforma? } →
 *   { ovqatlar: [{ nom, ehtimol, boshqa: [{ nom, ehtimol }], porsiya, g, kcal, o, y, u }], aniqlik: '±30%', limit, qoldi } | { xato, sabab?, limit?, qoldi? } */
import { originOk, json, num, UUID_RE } from './ariza.js';
import { takeKfQuota, aiLimits, aiLimitMsg } from './kalkifit-quota.js';

const MODEL = 'claude-haiku-5-5', TIMEOUT_MS = 25000, MAX_B64 = 1000000, MAX_BYTES = 700000, DEFAULT_SITE = 500;   // sayt tavani: kuniga 500 (KALKIFIT_IMG_SITE_LIMIT); foydalanuvchi limiti — umumiy AI hisobi
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

export function extractJson(text) { const t = String(text || '').replace(/```(?:json)?/gi, '').trim(), i = t.indexOf('['), j = t.lastIndexOf(']'); if (i < 0 || j < i) return null; try { const a = JSON.parse(t.slice(i, j + 1)); return Array.isArray(a) ? a : null; } catch (e) { return null; } }
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
export function jpegBytes(b64) {                    // base64 → JPEG ekanini (FF D8 FF) va taxminiy hajmini tekshirish
  const clean = String(b64 || '').replace(/^data:image\/jpe?g;base64,/i, '').replace(/\s+/g, '');
  if (clean.length < 100 || clean.length > MAX_B64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(clean)) return null;
  const bytes = Math.floor(clean.length * 3 / 4); if (bytes > MAX_BYTES) return { err: 413 };
  let head; try { head = atob(clean.slice(0, 8)); } catch (e) { return null; }
  if (head.charCodeAt(0) !== 0xFF || head.charCodeAt(1) !== 0xD8 || head.charCodeAt(2) !== 0xFF) return null;
  return { b64: clean, bytes };
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

const E = { 400: "Rasm noto'g'ri. JPEG yuboring.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 413: 'Rasm juda katta.', 415: 'JSON yuboring.', 4291: "Rasm tahlili bugun juda band — ovqatni matn yoki qidiruv bilan qo'shing. Ertaga yana ishlaydi.", 502: "AI hozir javob bermadi. Qo'lda qo'shing.", 503: 'Xizmat vaqtincha ishlamayapti.' };
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
  const lim = aiLimits(env, body), out = {};
  let sabab; try { sabab = await takeKfQuota(env, request, cid, { ns: 'img', uns: 'ai', site: num(env.KALKIFIT_IMG_SITE_LIMIT, DEFAULT_SITE), client: lim.client, ip: lim.ip, out }); } catch (e) { return fail(503); }
  if (sabab) return json(429, { xato: sabab === 'sayt' ? E[4291] : aiLimitMsg(lim.client), sabab, limit: lim.client, qoldi: 0 });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await askVision(env, img.b64, body.til === 'ru' ? 'ru' : 'uz'); if (r.err) continue;
    const list = extractJson(r.text); if (list) return json(200, { ovqatlar: sanitize(list), aniqlik: '±30%', limit: lim.client, qoldi: out.qoldi });
  }
  return fail(502);
}
