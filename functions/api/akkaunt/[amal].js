/* kalki.uz — Akkaunt API (IXTIYORIY kirish: email + bir martalik kod, parolsiz). Saqlash: ../../_lib/akkaunt-store.js, xat: ../../_lib/akkaunt-email.js (D1 va provayder shu yerda emas).
 *   GET  /api/akkaunt/sessiya    → { yoqilgan, dev?, kirgan, email?, marketing?, yaratilgan?, qurilmalar? }   (yoqilgan:false → ilova kirish blokini ko'rsatmaydi)
 *   POST /api/akkaunt/kod        { email, til?, maqsad? }  → { ok, kut }          (har qanday to'g'ri email uchun bir xil javob — email bor-yo'qligi oshkor bo'lmaydi)
 *   POST /api/akkaunt/kirish     { email, kod }            → { ok, yangi, email, marketing } + cookie
 *   POST /api/akkaunt/google     { credential }            → { ok, yangi, email, marketing } + cookie   (Google ID token: imzo, aud = GOOGLE_WEB_CLIENT_ID, email_verified; o'sha email akkauntiga kiradi yoki yaratadi)
 *   POST /api/akkaunt/chiqish    { hammasi? }              → { ok }  (cookie o'chadi; hammasi:true — barcha qurilmalardan)
 *   GET  /api/akkaunt/qurilmalar                           → { qurilmalar: [{ qurilma, yaratilgan, oxirgi, joriy }] }
 *   POST /api/akkaunt/marketing  { rozi: true|false }      → { ok, marketing }    (alohida rozilik, odatiy O'CHIQ)
 *   POST /api/akkaunt/yuklab                               → ma'lumot nusxasi (JSON)
 *   POST /api/akkaunt/kod { maqsad: 'ochirish' } + POST /api/akkaunt/ochirish { kod } → akkaunt butunlay o'chadi
 *   POST /api/akkaunt/ulash      { ilova, rejim:'konvert'|'qatiy', kod?, almashtir? } → { ok, rejim }   (B: tiklash kodi server kaliti bilan o'ralib akkauntga ulanadi; 'qatiy' — konvertsiz)
 *   GET  /api/akkaunt/tiklash?ilova=  → { rejim:'konvert', kod } | { rejim:'qatiy' } | { yoq:true }        (B: yangi qurilmada tiklash kodini qaytaradi)
 *   POST /api/akkaunt/qayta-ora  (X-Admin-Password) → kalit almashtirgach eski konvertlarni joriy kalit bilan qayta o'raydi
 *   GET  /api/akkaunt/dev-kod?email=  (X-Admin-Password)   → FAQAT preview dev rejimida: oxirgi yuborilgan kod
 * Xavfsizlik: 6 raqamli kod (CSPRNG), 10 daqiqa, 5 urinish, HMAC-SHA256 xesh (AKKAUNT_OTP_PEPPER); kodni yuborish — email boshiga 1/60 s, 8/soat, 20/kun va IP boshiga 20/soat;
 * tekshirish — IP boshiga 30/soat. Sessiya: tasodifiy 256-bit token cookie'da (HttpOnly; Secure; SameSite=Lax; __Host-), bazada faqat SHA-256. Sliding 30 kun, mutlaq 180 kun.
 * CSRF: POST faqat Origin tekshiruvi + application/json. Hamma javob Cache-Control: no-store. Secret'lar: AKKAUNT_OTP_PEPPER, AKKAUNT_EMAIL_API_KEY, AKKAUNT_ADMIN_PASSWORD (docs/akkaunt-kalit.md). */
import { originOk, json, num, toCyrillic } from '../ariza.js';
import { makeStore } from '../../_lib/akkaunt-store.js';
import { rejim, yubor } from '../../_lib/akkaunt-email.js';
import { kalitlar } from '../../_lib/akkaunt-kalit.js';
import { kodTahlil, zaxiraId, konvertYop, konvertOch, ILOVALAR } from '../../_lib/akkaunt-konvert.js';
import { googleTekshir, cidOk } from '../../_lib/google-id.js';

export const KOD_MUDDAT = 10 * 60 * 1000, MAX_URINISH = 5, SES_SLIDING = 30 * 86400000, SES_ABS = 180 * 86400000, MAX_SESSIYA = 20, MARKETING_MATN_V = 'm1';
const METOD = { sessiya: 'GET', kod: 'POST', kirish: 'POST', google: 'POST', chiqish: 'POST', qurilmalar: 'GET', marketing: 'POST', yuklab: 'POST', ochirish: 'POST', ulash: 'POST', tiklash: 'GET', 'qayta-ora': 'POST', 'dev-kod': 'GET' };
const E = { 400: "So'rov noto'g'ri.", 401: 'Kirilmagan.', 403: "Ruxsat yo'q.", 404: 'Topilmadi.', 405: "Usul noto'g'ri.", 415: 'JSON yuboring.', 429: "Juda ko'p urinish. Keyinroq urinib ko'ring.", 502: "Xatni yuborib bo'lmadi.", 503: 'Xizmat sozlanmagan.' };
const fail = (s, e, extra, h) => json(s, Object.assign({ xato: E[s] || 'Xato.', e: e || '' }, extra || {}), h);
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
export const normEmail = (s) => { const e = String(s == null ? '' : s).trim().toLowerCase(); return e.length >= 5 && e.length <= 254 && EMAIL_RE.test(e) && e.split('@')[0].length <= 64 ? e : null; };
const hex = (u8) => Array.from(u8).map((b) => b.toString(16).padStart(2, '0')).join('');
const enc = (s) => new TextEncoder().encode(s);
async function sha(s) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc(s)))); }
async function hmac(key, msg) { const k = await crypto.subtle.importKey('raw', enc(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return hex(new Uint8Array(await crypto.subtle.sign('HMAC', k, enc(msg)))); }
const rnd = (n) => crypto.getRandomValues(new Uint8Array(n));
const b64u = (u8) => btoa(String.fromCharCode.apply(null, u8)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function kod6() { const a = new Uint32Array(1); do { crypto.getRandomValues(a); } while (a[0] >= 4294000000); return String(a[0] % 1000000).padStart(6, '0'); }   // tekis taqsimot (rejection sampling)
function qurilma(ua) {
  ua = String(ua || ''); const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /Chrome|CriOS/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : '';
  return [br, os].filter(Boolean).join(' · ').slice(0, 40);
}
function cookieOf(request) { const m = /(?:^|;\s*)(?:__Host-)?kalki_s=([A-Za-z0-9_-]{43})(?:;|$)/.exec(request.headers.get('Cookie') || ''); return m ? m[1] : null; }
function setCookie(request, token) {
  const https = new URL(request.url).protocol === 'https:', name = https ? '__Host-kalki_s' : 'kalki_s';
  return name + '=' + (token || '') + '; Path=/; Max-Age=' + (token ? Math.floor(SES_ABS / 1000) : 0) + '; HttpOnly; SameSite=Lax' + (https ? '; Secure' : '');
}
async function bodyOf(request) {
  if (!/^application\/json\b/i.test(request.headers.get('Content-Type') || '')) return { err: fail(415) };
  try { const raw = await request.text(); if (raw.length > 2000) return { err: fail(400) }; const b = raw ? JSON.parse(raw) : {}; return b && typeof b === 'object' && !Array.isArray(b) ? { b } : { err: fail(400) }; } catch (e) { return { err: fail(400) }; }
}
const same = async (a, b) => (await sha('akk|' + a)) === (await sha('akk|' + b));
function xat(til, kod, maqsad) {
  const T = {
    uz: { k: ['Kalki.uz kirish kodi: ', "Kirish kodingiz: ", 'Kod 10 daqiqa amal qiladi. Uni hech kimga bermang.', "Agar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring."], o: ["Kalki.uz akkauntni o'chirish kodi: ", "Akkauntni o'chirish kodi: ", 'Kod 10 daqiqa amal qiladi. Uni faqat akkauntni o\'chirmoqchi bo\'lsangiz kiriting.', "Agar siz so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring — akkauntingiz o'chmaydi."] },
    ru: { k: ['Код входа Kalki.uz: ', 'Ваш код входа: ', 'Код действует 10 минут. Никому его не сообщайте.', 'Если вы не запрашивали код, просто проигнорируйте это письмо.'], o: ['Код удаления аккаунта Kalki.uz: ', 'Код удаления аккаунта: ', 'Код действует 10 минут. Вводите его только если хотите удалить аккаунт.', 'Если вы не запрашивали код, проигнорируйте это письмо — аккаунт не будет удалён.'] }
  };
  const x = T[til === 'ru' ? 'ru' : 'uz'][maqsad === 'ochirish' ? 'o' : 'k'], cyr = til === 'cyr' ? toCyrillic : (s) => s;
  return { subject: cyr(x[0] + kod), text: cyr(x[1] + kod + '\n\n' + x[2] + '\n' + x[3] + '\n\nKalki.uz') };
}

export async function onRequest(ctx) {
  const { request, env } = ctx, amal = ctx.params && (Array.isArray(ctx.params.amal) ? ctx.params.amal[0] : ctx.params.amal);
  if (!METOD[amal]) return fail(404);
  if (request.method !== METOD[amal]) return json(405, { xato: E[405], e: '' }, { Allow: METOD[amal] });
  const origin = request.headers.get('Origin');
  if (origin ? !originOk(origin, env) : request.method !== 'GET') return fail(403);
  const store = makeStore(env), rj = rejim(env, request), pepper = env.AKKAUNT_OTP_PEPPER;
  const tayyor = !!(store && rj && typeof pepper === 'string' && pepper.length >= 32 && kalitlar(env));   // gibrid rejim uchun server kaliti ham shart
  if (!tayyor) return amal === 'sessiya' ? json(200, { yoqilgan: false }) : fail(503);
  const now = Date.now(), salt = env.IP_HASH_SALT || '';
  const ipH = async (t) => t + ':' + (await sha(salt + '|' + (request.headers.get('CF-Connecting-IP') || '?'))).slice(0, 24);
  const emH = async (t, email) => t + ':' + (await sha(salt + '|' + email)).slice(0, 24);
  const lim = async (kalit, oyna, max) => store.limit(kalit, oyna, max, now);
  try {
    if (amal === 'sessiya') { try { await store.ping(); } catch (e) { return json(200, { yoqilgan: false }); } }   // migratsiya yurgizilmagan → blok ko'rinmaydi

    /* ---- sessiya aniqlash (kirish/kod 'kirish' dan tashqari hammasida) ---- */
    let ses = null, ak = null, tok = cookieOf(request), sesH = null;
    if (tok) {
      sesH = await sha(tok); ses = await store.sessiyaOl(sesH);
      if (ses && (ses.muddat_abs <= now || ses.oxirgi + SES_SLIDING <= now)) { await store.sessiyaOchir(sesH); ses = null; }
      ak = ses ? await store.akkauntId(ses.akkaunt_id) : null; if (!ak) ses = null;
      if (ses && now - ses.oxirgi > 3600000) await store.sessiyaYangila(sesH, now);
    }
    const yoqCookie = tok && !ses ? { 'Set-Cookie': setCookie(request, '') } : undefined;
    if (Math.random() < 0.02) { const p = store.tozala(now).catch(() => {}); if (ctx.waitUntil) ctx.waitUntil(p); }

    if (amal === 'sessiya') {
      const gid = cidOk(env.GOOGLE_WEB_CLIENT_ID) ? env.GOOGLE_WEB_CLIENT_ID : '';          // public: «Google bilan kirish» tugmasi faqat shu bo'lsa ko'rinadi
      if (!ses) return json(200, { yoqilgan: true, dev: rj === 'dev', kirgan: false, google: gid }, yoqCookie);
      const q = await store.sessiyalar(ak.id);
      const il = {}; for (const x of await store.ilovalar(ak.id)) il[x.ilova] = x.rejim;
      return json(200, { yoqilgan: true, dev: rj === 'dev', kirgan: true, email: ak.email, marketing: ak.marketing ? 1 : 0, yaratilgan: ak.yaratilgan, qurilmalar: q.length, ilovalar: il, google: gid });
    }
    if (amal === 'dev-kod') {
      if (rj !== 'dev') return fail(404);
      const ip = await lim(await ipH('adm'), 3600000, 60); if (!ip.ok) return fail(429, 'limit');
      const pw = env.AKKAUNT_ADMIN_PASSWORD || env.KALKIFIT_ADMIN_PASSWORD; if (!pw) return fail(503);
      if (!(await same(request.headers.get('X-Admin-Password') || '', pw))) return fail(401);
      const email = normEmail(new URL(request.url).searchParams.get('email')); if (!email) return fail(400, 'email');
      const d = await store.devOl(email, now); return d ? json(200, d) : fail(404);
    }

    if (amal === 'qayta-ora') {                                  // kalit almashtirish: eski versiya bilan o'ralgan konvertlarni joriy kalit bilan qayta o'raydi (X-Admin-Password; takror chaqirib tugatiladi)
      const ip = await lim(await ipH('adm'), 3600000, 60); if (!ip.ok) return fail(429, 'limit');
      const pw = env.AKKAUNT_ADMIN_PASSWORD || env.KALKIFIT_ADMIN_PASSWORD; if (!pw) return fail(503);
      if (!(await same(request.headers.get('X-Admin-Password') || '', pw))) return fail(401);
      const K = kalitlar(env), { qatorlar } = await store.eskiKonvertlar(K.joriy.v, 200); let ora = 0, xato = 0;
      for (const q of qatorlar) { const o = await konvertOch(env, q.akkaunt_id, q.ilova, q.kod_konvert); if (o.xato) { xato++; continue; } const y = await konvertYop(env, q.akkaunt_id, q.ilova, o.kod); if (y && await store.ilovaKonvert(q.akkaunt_id, q.ilova, y.konvert, y.v)) ora++; else xato++; }
      const left = await store.eskiKonvertlar(K.joriy.v, 1); return json(200, { ok: true, ora, xato, qoldi: left.qoldi, joriy: K.joriy.v });
    }
    if (amal === 'kod') {
      const { b, err } = await bodyOf(request); if (err) return err;
      const maqsad = b.maqsad === 'ochirish' ? 'ochirish' : 'kirish';
      let email; if (maqsad === 'ochirish') { if (!ses) return fail(401, 'sessiya'); email = ak.email; } else { email = normEmail(b.email); if (!email) return fail(400, 'email'); }
      const til = b.til === 'ru' || b.til === 'cyr' ? b.til : 'uz';
      const ip = await lim(await ipH('ipkod'), 3600000, num(env.AKKAUNT_IP_KOD_LIMIT, 20)); if (!ip.ok) return fail(429, 'limit', { kut: Math.ceil(ip.qayta / 1000) });
      const c = await lim(await emH('em60', email), 60000, 1); if (!c.ok) return fail(429, 'kut', { kut: Math.max(1, Math.ceil(c.qayta / 1000)) });
      const h = await lim(await emH('emh', email), 3600000, num(env.AKKAUNT_EMAIL_SOAT_LIMIT, 8)); if (!h.ok) return fail(429, 'limit', { kut: Math.ceil(h.qayta / 1000) });
      const d = await lim(await emH('emd', email), 86400000, num(env.AKKAUNT_EMAIL_KUN_LIMIT, 20)); if (!d.ok) return fail(429, 'limit', { kut: Math.ceil(d.qayta / 1000) });
      const kod = kod6();
      await store.kodYoz({ email, maqsad, hash: await hmac(pepper, 'kod|' + email + '|' + maqsad + '|' + kod), now, muddat: now + KOD_MUDDAT });
      try { const m = xat(til, kod, maqsad); await yubor(env, rj, { to: email, subject: m.subject, text: m.text, kod, maqsad }); if (rj === 'dev') await store.devYoz(email, kod, maqsad, now); } catch (e) { console.error('akkaunt xat xato'); return fail(502, 'xat'); }
      return json(200, { ok: true, kut: 60, dev: rj === 'dev' });
    }

    async function kir(email, usul) {                            // akkaunt (bor bo'lsa — o'sha, yo'q bo'lsa — yangi) + yangi sessiya cookie
      let a = await store.akkauntEmail(email), yangi = false;
      if (!a) { const id = hex(rnd(12)); yangi = await store.akkauntYarat({ id, email, usul, now }); a = await store.akkauntEmail(email); }
      if (!a) return fail(503);
      if (!yangi) await store.kirishBelgila(a.id, now);
      const token = b64u(rnd(32)), id = await sha(token);
      await store.sessiyaYarat({ id, akkauntId: a.id, now, muddatAbs: now + SES_ABS, qurilma: qurilma(request.headers.get('User-Agent')) });
      const all = await store.sessiyalar(a.id); for (const s of all.slice(MAX_SESSIYA)) await store.sessiyaOchir(s.id);   // eng eskilari chiqarib yuboriladi
      await store.audit(a.id, yangi ? 'yaratildi' : (usul === 'google' ? 'kirish_google' : 'kirish'), now);
      return json(200, { ok: true, yangi, email: a.email, marketing: a.marketing ? 1 : 0 }, { 'Set-Cookie': setCookie(request, token) });
    }
    if (amal === 'kirish' || amal === 'ochirish') {
      const { b, err } = await bodyOf(request); if (err) return err;
      const maqsad = amal === 'ochirish' ? 'ochirish' : 'kirish';
      let email; if (maqsad === 'ochirish') { if (!ses) return fail(401, 'sessiya'); email = ak.email; } else { email = normEmail(b.email); if (!email) return fail(400, 'email'); }
      const kod = String(b.kod == null ? '' : b.kod).replace(/\s+/g, ''); if (!/^\d{6}$/.test(kod)) return fail(400, 'kod_xato');
      const ip = await lim(await ipH('ipkir'), 3600000, num(env.AKKAUNT_IP_TEKSHIR_LIMIT, 30)); if (!ip.ok) return fail(429, 'limit', { kut: Math.ceil(ip.qayta / 1000) });
      const r = await store.kodTekshir({ email, maqsad, hash: await hmac(pepper, 'kod|' + email + '|' + maqsad + '|' + kod), now, maxUrinish: MAX_URINISH });
      if (r === 'yoq') return fail(400, 'kod_yoq', { xato: 'Kod eskirgan yoki yuborilmagan. Yangi kod so\'rang.' });
      if (r === 'qulf') return fail(400, 'kod_qulf', { xato: "Juda ko'p noto'g'ri urinish. Yangi kod so'rang." });
      if (r === 'xato') return fail(400, 'kod_xato', { xato: "Kod noto'g'ri." });
      if (maqsad === 'ochirish') {
        await store.akkauntOchir(ak.id, ak.email); await store.audit(null, 'ochirildi', now);
        return json(200, { ok: true }, { 'Set-Cookie': setCookie(request, '') });
      }
      return kir(email, 'email');
    }
    if (amal === 'google') {                                     // Google bilan kirish: tasdiqlangan email bo'yicha o'sha akkaunt (email bilan ochilgan bo'lsa — o'sha), yo'q bo'lsa — yangi
      const gid = env.GOOGLE_WEB_CLIENT_ID; if (!cidOk(gid)) return fail(503, 'google_yoq');
      const { b, err } = await bodyOf(request); if (err) return err;
      const ip = await lim(await ipH('ipkir'), 3600000, num(env.AKKAUNT_IP_TEKSHIR_LIMIT, 30)); if (!ip.ok) return fail(429, 'limit', { kut: Math.ceil(ip.qayta / 1000) });
      const g = await googleTekshir(b.credential, gid, { now, jwks: env.__GOOGLE_JWKS }); if (g.xato) return fail(400, 'google', { sabab: g.xato });
      const email = normEmail(g.email); if (!email) return fail(400, 'google', { sabab: 'email' });
      return kir(email, 'google');
    }

    /* ---- quyidagilar uchun kirilgan bo'lishi shart ---- */
    if (amal === 'chiqish') {
      const { b, err } = await bodyOf(request); if (err) return err;
      if (ses) { if (b.hammasi === true) await store.sessiyaOchirHammasi(ak.id); else await store.sessiyaOchir(sesH); await store.audit(ak.id, b.hammasi === true ? 'chiqish_hammasi' : 'chiqish', now); }
      return json(200, { ok: true }, { 'Set-Cookie': setCookie(request, '') });
    }
    if (!ses) return fail(401, 'sessiya', null, yoqCookie);
    if (amal === 'qurilmalar') {
      const q = await store.sessiyalar(ak.id);
      return json(200, { qurilmalar: q.map((s) => ({ qurilma: s.qurilma, yaratilgan: s.yaratilgan, oxirgi: s.oxirgi, joriy: s.id === sesH })) });
    }
    if (amal === 'marketing') {
      const { b, err } = await bodyOf(request); if (err) return err; if (typeof b.rozi !== 'boolean') return fail(400);
      await store.marketingYoz(ak.id, b.rozi, now, MARKETING_MATN_V); await store.audit(ak.id, b.rozi ? 'marketing_ha' : 'marketing_yoq', now);
      return json(200, { ok: true, marketing: b.rozi ? 1 : 0 });
    }
    if (amal === 'ulash') {                                      // akkauntni ilovaning zaxirasiga ulash (qayta yuklamasdan): server kodni faqat o'raydi
      const { b, err } = await bodyOf(request); if (err) return err;
      if (ILOVALAR.indexOf(b.ilova) < 0 || (b.rejim !== 'konvert' && b.rejim !== 'qatiy')) return fail(400);
      const rl = await lim('ul:' + ak.id, 3600000, 60); if (!rl.ok) return fail(429, 'limit', { kut: Math.ceil(rl.qayta / 1000) });
      if (b.rejim === 'qatiy') { await store.ilovaYoz({ akkauntId: ak.id, ilova: b.ilova, zaxiraId: null, konvert: null, rejim: 'qatiy', masterV: null, now }); await store.audit(ak.id, 'qatiy_' + b.ilova, now); return json(200, { ok: true, rejim: 'qatiy' }); }
      const t = kodTahlil(b.ilova, b.kod); if (!t.ok) return fail(400, 'kod_format', { xato: "Tiklash kodi noto'g'ri yozilgan." });
      const zid = await zaxiraId(b.ilova, t.body), cur = await store.ilovaOl(ak.id, b.ilova);
      if (cur && cur.rejim === 'konvert' && cur.zaxira_id && cur.zaxira_id !== zid && b.almashtir !== true) return fail(409, 'boshqa', { xato: "Akkauntga boshqa zaxira ulangan." });
      const y = await konvertYop(env, ak.id, b.ilova, t.kod); if (!y) return fail(503, 'kalit');
      const r = await store.ilovaYoz({ akkauntId: ak.id, ilova: b.ilova, zaxiraId: zid, konvert: y.konvert, rejim: 'konvert', masterV: y.v, now });
      if (r !== 'ok') return fail(409, 'band', { xato: 'Bu zaxira boshqa akkauntga ulangan.' });
      await store.audit(ak.id, 'ulandi_' + b.ilova, now); return json(200, { ok: true, rejim: 'konvert' });
    }
    if (amal === 'tiklash') {                                    // kirgan foydalanuvchiga o'z tiklash kodini qaytaradi (ilova odatdagi tiklashni bajaradi)
      const ilova = new URL(request.url).searchParams.get('ilova'); if (ILOVALAR.indexOf(ilova) < 0) return fail(400);
      const rl = await lim('tk:' + ak.id, 3600000, 30); if (!rl.ok) return fail(429, 'limit', { kut: Math.ceil(rl.qayta / 1000) });
      const row = await store.ilovaOl(ak.id, ilova); if (!row) return json(200, { yoq: true });
      if (row.rejim === 'qatiy' || !row.kod_konvert) return json(200, { rejim: 'qatiy' });
      const o = await konvertOch(env, ak.id, ilova, row.kod_konvert); if (o.xato) return fail(503, o.xato === 'kalit' ? 'kalit' : 'konvert', { xato: o.xato === 'kalit' ? 'Server kaliti topilmadi.' : 'Konvert buzilgan.' });
      if (!o.joriy) { const y = await konvertYop(env, ak.id, ilova, o.kod); if (y) await store.ilovaKonvert(ak.id, ilova, y.konvert, y.v); }   // sust almashtirish: ochilgan zahoti joriy kalit bilan qayta o'raladi
      await store.audit(ak.id, 'tiklash_' + ilova, now); return json(200, { rejim: 'konvert', kod: o.kod });
    }
    if (amal === 'yuklab') {
      const y = await store.yuklab(ak.id), a = y.akkaunt;
      return json(200, { v: 1, eksport: new Date(now).toISOString(), akkaunt: { id: a.id, email: a.email, usul: a.usul, yaratilgan: a.yaratilgan, oxirgi_kirish: a.oxirgi_kirish, marketing: a.marketing ? 1 : 0, marketing_vaqt: a.marketing_vaqt, marketing_matn_v: a.marketing_matn_v }, qurilmalar: y.sessiyalar.map((s) => ({ qurilma: s.qurilma, yaratilgan: s.yaratilgan, oxirgi: s.oxirgi })), ilovalar: y.ilovalar.map((x) => ({ ilova: x.ilova, rejim: x.rejim, ulangan: x.ulangan })) });
    }
    return fail(404);
  } catch (e) { console.error('akkaunt xato'); return fail(503); }
}
