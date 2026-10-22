/* kalki.uz — KalkiFit «Menyudan tanlash»: kafe MENYUSI surati → taom nomlari va narxlari (kkal YO'Q: ilova bazadan oladi, assets/kalkifit-menyu.js).
 * Rasm SAQLANMAYDI va LOGLANMAYDI: faqat model so'roviga uzatiladi. Limit: rasm/retsept/ovoz bilan UMUMIY kunlik AI hisobi (kalkifit-quota.js: Android 2, veb 5); sayt tavani alohida ('mn').
 * POST { img: <base64 JPEG>, til: 'uz'|'ru'|'kirill', mijoz_id, platforma? } → { taomlar: [{ nom, asl, narx }], limit, qoldi } | { xato, sabab?, limit?, qoldi? } */
import { originOk, json, num, UUID_RE } from './ariza.js';
import { takeKfQuota, aiLimits, aiLimitMsg } from './kalkifit-quota.js';
import { jpegBytes, extractJson } from './kalkifit-rasm.js';

const MODEL = 'claude-haiku-5-5', TIMEOUT_MS = 25000, MAX_B64 = 1000000, DEFAULT_SITE = 300;
const SYSTEM = `Sen kafe/restoran MENYUSI suratini o'qiydigan yordamchisan (O'zbekiston). Vazifang: menyudagi TAOMLAR nomi va narxi. Kaloriya YOZMA.
Faqat JSON massiv qaytar, boshqa hech narsa yozma. Har taom uchun: {"nom": oddiy umumiy nom (bazada qidirsa topiladigan, masalan «Osh», «Lag'mon», «Shashlik (qo'y go'shti)», «Tovuq kabob», «Sezar salat», «Mastava», «Somsa», «Manti», «Lavash», «Burger», «Pitsa»), "asl": menyuda yozilgani (qisqa), "narx": narx so'mda butun son yoki null}.
Qoidalar: eng ko'pi 30 taom; ichimliklar, souslar, non va qo'shimchalarni ham yoz; bir xil taomni takrorlama; narx «45 000» yoki «45.000» bo'lsa — 45000; «45» va menyu ming so'mda ekani aniq bo'lsa — 45000; aniq bo'lmasa null.
Suratda menyu bo'lmasa bo'sh massiv [] qaytar. Odamlar, telefon raqamlari, manzil haqida yozma.`;
const clean = (x, n) => String(x == null ? '' : x).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
export function sanitize(list) {
  const out = [], seen = new Set();
  for (const it of (list || []).slice(0, 40)) {
    if (!it || typeof it !== 'object') continue; const nom = clean(it.nom, 60); if (!nom || seen.has(nom.toLowerCase())) continue; seen.add(nom.toLowerCase());
    let narx = Math.round(Number(it.narx)); if (!(narx >= 500 && narx <= 5000000)) narx = null;
    out.push({ nom, asl: clean(it.asl, 60) || nom, narx }); if (out.length >= 30) break;
  }
  return out;
}
async function askVision(env, b64, til) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: ctl.signal, headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1200, thinking: { type: 'disabled' }, system: SYSTEM, messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: b64 } }, { type: 'text', text: til === 'ru' ? 'Прочитай меню. Названия — на русском.' : "Menyuni o'qi. Nomlarni o'zbek tilida yoz." }] }] }) });
    if (!res.ok) { console.error('menyu: model status', res.status); return { err: true }; }
    const j = await res.json(); return { text: (j.content || []).map((c) => c.text || '').join('') };
  } catch (e) { console.error('menyu: model xato'); return { err: true }; } finally { clearTimeout(timer); }
}
export const _test = { sanitize, SYSTEM };
const E = { 400: "Rasm noto'g'ri. JPEG yuboring.", 403: "Ruxsat yo'q.", 405: 'Faqat POST.', 413: 'Rasm juda katta.', 415: 'JSON yuboring.', 4291: 'Menyu tahlili bugun juda band. Ertaga yana ishlaydi.', 502: 'AI hozir javob bermadi.', 503: 'Xizmat vaqtincha ishlamayapti.' };
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
  let sabab; try { sabab = await takeKfQuota(env, request, cid, { ns: 'mn', uns: 'ai', site: num(env.KALKIFIT_MENYU_SITE_LIMIT, DEFAULT_SITE), client: lim.client, ip: lim.ip, out }); } catch (e) { return fail(503); }
  if (sabab) return json(429, { xato: sabab === 'sayt' ? E[4291] : aiLimitMsg(lim.client), sabab, limit: lim.client, qoldi: 0 });
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await askVision(env, img.b64, body.til === 'ru' ? 'ru' : 'uz'); if (r.err) continue;
    const list = extractJson(r.text); if (list) return json(200, { taomlar: sanitize(list), limit: lim.client, qoldi: out.qoldi });
  }
  return fail(502);
}
