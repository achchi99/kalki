/* kalki.uz — admin kirishi (KalkiFit statistika, takliflar, hisob, qidiruv, push holati): BITTA joy.
 *   Parol: Cloudflare secret KALKIFIT_ADMIN_PASSWORD (repoda/logda yo'q). Brauzer: POST /api/admin/kirish → HttpOnly cookie (12 soat, imzo — paroldan HMAC: parol almashsa eski sessiyalar darhol bekor).
 *   CLI (tools/*-hisobot.js): X-Admin-Password sarlavhasi — xuddi shu cheklov bilan.
 *   Cheklov: bir manzildan 5 ta noto'g'ri urinish → 15 daqiqa blok (KV, kalit — IP'ning tuzli xeshi; IP o'zi saqlanmaydi).
 *   Jurnal: admin_kirish (vaqt, muvaffaqiyat, usul, IP faqat qisqartirilgan: 185.213.x.x / 2a02:4780:x). Xato urinishlar va brauzer kirishlari yoziladi. */
export const SESS_MS = 12 * 3600000, LOCK_N = 5, LOCK_S = 900, COOKIE = 'kf_adm';
const enc = new TextEncoder();
const hex = (buf) => Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
async function sha(s) { return hex(await crypto.subtle.digest('SHA-256', enc.encode(s))); }
async function hmac(key, msg) { const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg))); }
export async function same(a, b) { const x = await sha('adm|' + a), y = await sha('adm|' + b); let r = 0; for (let i = 0; i < x.length; i++) r |= x.charCodeAt(i) ^ y.charCodeAt(i); return r === 0; }
const ip = (request) => request.headers.get('CF-Connecting-IP') || '';
export function ipQisqa(addr) {                       // jurnal uchun: 185.213.44.7 → 185.213.x.x; 2a02:4780:12::5 → 2a02:4780:x
  addr = String(addr || ''); if (/^\d{1,3}(\.\d{1,3}){3}$/.test(addr)) return addr.split('.').slice(0, 2).join('.') + '.x.x';
  if (addr.indexOf(':') > -1) return addr.split(':').slice(0, 2).join(':') + ':x'; return '';
}
const lockKey = async (request, env) => 'admlk:' + (await sha((env.IP_HASH_SALT || 'kalki') + '|admin|' + ip(request))).slice(0, 20);
export async function locked(request, env) { const kv = env.KALKI_AI_KV; if (!kv) return false; return (parseInt(await kv.get(await lockKey(request, env)), 10) || 0) >= LOCK_N; }
async function failNote(request, env) { const kv = env.KALKI_AI_KV; if (!kv) return; const k = await lockKey(request, env); await kv.put(k, String((parseInt(await kv.get(k), 10) || 0) + 1), { expirationTtl: LOCK_S }); }      // har xatoda 15 daqiqa yangilanadi: 5-xatodan keyin 15 daqiqa
async function failClear(request, env) { const kv = env.KALKI_AI_KV; if (kv) try { await kv.delete(await lockKey(request, env)); } catch (e) {} }
export async function jurnal(env, request, ok, usul, now) { const db = env.KALKIFIT_DB; if (!db) return; try { await db.prepare('INSERT INTO admin_kirish (vaqt, ok, usul, ip) VALUES (?, ?, ?, ?)').bind(now, ok ? 1 : 0, usul, ipQisqa(ip(request))).run(); } catch (e) {} }
export async function tokenMake(pw, now) { const exp = now + SESS_MS; return 'v1.' + exp + '.' + (await hmac(pw, 'kfadm|v1|' + exp)); }
export async function tokenOk(pw, tok, now) {
  const m = /^v1\.(\d{13})\.([0-9a-f]{64})$/.exec(String(tok || '')); if (!m || +m[1] <= now || +m[1] > now + SESS_MS + 60000) return false;
  return same(m[2], await hmac(pw, 'kfadm|v1|' + m[1]));
}
export function cookieOf(request) { const c = request.headers.get('Cookie') || '', m = new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)').exec(c); return m ? decodeURIComponent(m[1]) : ''; }
export const cookieSet = (tok) => COOKIE + '=' + encodeURIComponent(tok) + '; Path=/; Max-Age=' + SESS_MS / 1000 + '; HttpOnly; Secure; SameSite=Strict';
export const cookieClear = () => COOKIE + '=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict';
const NC = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
export const ajson = (s, o, h) => new Response(JSON.stringify(o), { status: s, headers: Object.assign({}, NC, h || {}) });
/* himoyalangan endpoint uchun: null — ruxsat; aks holda tayyor javob (401/429/503). o.pw — boshqa sir (masalan AKKAUNT_ADMIN_PASSWORD) */
export async function adminAuth(request, env, o) {
  o = o || {}; const pw = o.pw || env.KALKIFIT_ADMIN_PASSWORD, now = o.now || Date.now(); if (!pw) return ajson(503, { xato: 'Sozlanmagan.' });
  if (await tokenOk(pw, cookieOf(request), now)) return null;
  const hp = request.headers.get('X-Admin-Password'); if (!hp) return ajson(401, { xato: 'Kirish kerak.' });
  if (await locked(request, env)) return ajson(429, { xato: "Juda ko'p xato urinish. 15 daqiqadan keyin." });
  if (await same(hp, pw)) return null;
  await failNote(request, env); await jurnal(env, request, false, 'sarlavha', now); return ajson(401, { xato: "Parol noto'g'ri." });
}
/* POST /api/admin/kirish { parol } → cookie; xato — hisoblanadi va jurnalga yoziladi */
export async function kirish(request, env, now) {
  const pw = env.KALKIFIT_ADMIN_PASSWORD; if (!pw) return ajson(503, { xato: 'Sozlanmagan.' });
  if (await locked(request, env)) { await jurnal(env, request, false, 'blok', now); return ajson(429, { xato: "Juda ko'p xato urinish. 15 daqiqadan keyin." }); }
  let b; try { const raw = await request.text(); if (raw.length > 400) return ajson(400, { xato: "So'rov noto'g'ri." }); b = JSON.parse(raw); } catch (e) { return ajson(400, { xato: "So'rov noto'g'ri." }); }
  const p = b && typeof b.parol === 'string' ? b.parol : '';
  if (!p || !(await same(p, pw))) { await failNote(request, env); await jurnal(env, request, false, 'brauzer', now); return ajson(401, { xato: "Parol noto'g'ri." }); }
  await failClear(request, env); await jurnal(env, request, true, 'brauzer', now);
  return ajson(200, { ok: true, muddat: now + SESS_MS }, { 'Set-Cookie': cookieSet(await tokenMake(pw, now)) });
}
