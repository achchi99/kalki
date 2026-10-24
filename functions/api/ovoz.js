/* kalki.uz — KalkiFit ovozli kiritish (server yo'li): audio (≤ 30 s; iOS audio/mp4, Android/desktop audio/webm) → OpenAI gpt-4o-mini-transcribe → matn.
 * Kalit: Cloudflare secret OPENAI_API_KEY. Yo'q bo'lsa — yo'l O'CHIQ (GET → yoqilgan:false; POST → 503), ilova Web Speech'ga (faqat Chrome/Edge) tushadi, iOS'da 🎤 ko'rinmaydi.
 * Audio SAQLANMAYDI va LOGLANMAYDI: faqat tanish uchun uzatiladi. Limit: AI hisobidan ALOHIDA ovoz hisobi (kalkifit-quota.js 'ov'): qurilma 15, IP 30, sayt 1500 / kun.
 * Javobda bir martalik tok (KV, 15 daqiqa): shu ovozdan keyingi taom ajratish (/api/kalkifit, manba=ovoz) AI hisobidan QAYTA sanalmaydi — «1 yozuv = 1 so'rov».
 *   GET  /api/ovoz → { yoqilgan }
 *   POST /api/ovoz?til=uz|ru&mijoz_id=<uuid>&platforma=android   body: audio (Content-Type: audio/*) → { matn, tok, limit, qoldi } | { xato, sabab?, limit? } */
import { originOk, json, UUID_RE } from './ariza.js';
import { takeKfQuota, peekKfQuota, ovozQuota, ovozLimits, ovozLimitMsg } from './kalkifit-quota.js';

const MODEL = 'gpt-4o-mini-transcribe', MAX_BYTES = 1000000, MAX_MS = 31000, TIMEOUT_MS = 20000;          // har yozuv ≤ 30 s: ilova davomiylikni (dav, ms) yuboradi — > 31 s rad; hajm chegarasi (≈ 30 s audio) ikkinchi to'siq
const TYPES = { 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav' };
const NC = { 'Cache-Control': 'no-store' };
const E = { 400: "Ovoz noto'g'ri.", 403: "Ruxsat yo'q.", 405: "Usul noto'g'ri.", 413: 'Ovoz juda uzun (30 soniyagacha).', 415: 'Audio yuboring.', 4291: 'Ovoz tanish bugun juda band. Ertaga yana ishlaydi.', 502: 'Ovozni tanib bo\'lmadi.', 503: 'Ovoz xizmati yoqilmagan.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' }, NC);
const hex = (u8) => Array.from(u8).map((b) => b.toString(16).padStart(2, '0')).join('');
export function typeOf(ct) { const t = String(ct || '').split(';')[0].trim().toLowerCase(); return TYPES[t] ? { t, ext: TYPES[t] } : null; }
export function cleanText(t) { return String(t || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 300); }
async function transcribe(env, buf, ty, til) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const fdt = new FormData(); fdt.append('file', new Blob([buf], { type: ty.t }), 'ovoz.' + ty.ext); fdt.append('model', MODEL); if (til === 'ru') fdt.append('language', 'ru'); fdt.append('response_format', 'json');          // 'uz' kodi modelda yo'q (400) — o'zbekcha prompt orqali
    fdt.append('prompt', til === 'ru' ? 'Еда и напитки: плов, самса, лагман, чай, хлеб, порция, тарелка.' : "O'zbek tilida (Uzbek, lotin yozuvi). Ovqat va ichimliklar: osh, somsa, lag'mon, non, choy, piyola, kosa, likop, tilim, dona.");
    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', signal: ctl.signal, headers: { Authorization: 'Bearer ' + env.OPENAI_API_KEY }, body: fdt });
    if (!r.ok) { console.error('ovoz: model status', r.status); let c = ''; try { const e = await r.json(); c = (e && e.error && (e.error.code || e.error.type)) || ''; } catch (e) {} return { err: true, st: r.status, off: r.status === 401 || r.status === 403 || /insufficient_quota|credit_balance|billing|invalid_api_key/.test(c) }; }
    const j = await r.json(); return { text: cleanText(j.text) };
  } catch (e) { console.error('ovoz: model xato'); return { err: true }; } finally { clearTimeout(timer); }
}
const OFF_KEY = 'ovoz:off:v4', OK_KEY = 'ovoz:ok:v4', OFF_TTL = 600;          // OpenAI hisobi/kaliti ishlamasa (kredit tugagan, kalit bekor) — yo'l 10 daqiqa O'CHIQ (kalitlar versiyali: v2 — eski kesh e'tiborsiz): ilova 🎤 ni ko'rsatmaydi (buzilgan tugma yo'q)
async function off(env) { try { return !!(await env.KALKI_AI_KV.get(OFF_KEY)); } catch (e) { return false; } }
/* GET: yo'l haqiqatan ishlaydimi — kesh (ok 30 daqiqa / off 10 daqiqa; v3); kesh yo'q bo'lsa 0,5 s'lik jim WAV bilan sinov (foydalanuvchi limitiga kirmaydi) */
export function silentWav() { const sr = 8000, n = 4000, b = new Uint8Array(44 + n * 2), v = new DataView(b.buffer), w = (o, t) => { for (let i = 0; i < t.length; i++) b[o + i] = t.charCodeAt(i); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true); return b; }
async function usable(env) {
  if (!env.OPENAI_API_KEY || !env.KALKI_AI_KV) return false; if (await off(env)) return false;
  try { if (await env.KALKI_AI_KV.get(OK_KEY)) return true; } catch (e) { return false; }
  const r = await transcribe(env, silentWav(), { t: 'audio/wav', ext: 'wav' }, 'uz');
  const bad = !!(r.err && r.off), net = !!(r.err && r.st == null);          // faqat kalit/hisob xatosi (401/403, kredit) o'chiradi; jim sinovga 400 — kalit ishlaydi; tarmoq xatosi — keshlanmaydi
  try { if (net) return false; if (!bad) { await env.KALKI_AI_KV.put(OK_KEY, '1', { expirationTtl: 1800 }); return true; } await env.KALKI_AI_KV.put(OFF_KEY, '1', { expirationTtl: OFF_TTL }); } catch (e) {}
  return false;
}
export async function onRequest({ request, env }) {
  if (request.method === 'GET') {          // yoqilgan + (mijoz_id berilsa) bugungi qolgan ovozli kiritish — sanamaydi
    const y = await usable(env), u0 = new URL(request.url), m0 = u0.searchParams.get('mijoz_id') || '', out0 = { yoqilgan: y };
    if (y) { const l = ovozLimits(env); try { out0.limit = l.client; out0.qoldi = await peekKfQuota(env, request, UUID_RE.test(m0) ? m0 : '', ovozQuota(env)); } catch (e) { /* hisoblagich bo'lmasa — yozuv yo'q */ } }
    return json(200, out0, NC);
  }
  if (request.method !== 'POST') return json(405, { xato: E[405] }, Object.assign({ Allow: 'GET, POST' }, NC));
  if (!originOk(request.headers.get('Origin'), env)) return fail(403);
  if (!env.OPENAI_API_KEY || !env.KALKI_AI_KV || await off(env)) return fail(503);
  const ty = typeOf(request.headers.get('Content-Type')); if (!ty) return fail(415);
  const len = parseInt(request.headers.get('Content-Length') || '0', 10); if (len > MAX_BYTES) return fail(413);
  const dav = parseInt(new URL(request.url).searchParams.get('dav') || '0', 10); if (dav > MAX_MS) return fail(413);
  const buf = await request.arrayBuffer(); if (buf.byteLength > MAX_BYTES) return fail(413); if (buf.byteLength < 500) return fail(400);
  const u = new URL(request.url), til = u.searchParams.get('til') === 'ru' ? 'ru' : 'uz', mid = u.searchParams.get('mijoz_id') || '', cid = UUID_RE.test(mid) ? mid : '';
  const lim = ovozLimits(env), out = {};
  let sabab; try { sabab = await takeKfQuota(env, request, cid, ovozQuota(env, { out })); } catch (e) { return fail(503); }
  if (sabab) return json(429, { xato: sabab === 'sayt' ? E[4291] : ovozLimitMsg(), sabab, limit: lim.client, qoldi: 0 }, NC);
  const r = await transcribe(env, buf, ty, til); if (r.err) { if (r.off) { try { await env.KALKI_AI_KV.put(OFF_KEY, '1', { expirationTtl: OFF_TTL }); } catch (e) {} return fail(503); } return fail(502); }
  const tok = hex(crypto.getRandomValues(new Uint8Array(16))); try { await env.KALKI_AI_KV.put('ovt:' + tok, '1', { expirationTtl: 900 }); } catch (e) { /* tok bo'lmasa keyingi ajratish odatdagidek sanaladi */ }
  return json(200, { matn: r.text, tok, limit: lim.client, qoldi: out.qoldi }, NC);
}
