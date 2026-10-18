/* kalki.uz — Akkaunt xatlarini YUBORISH QATLAMI (adapter). Provayderni almashtirish = faqat shu fayl (docs/akkaunt-kochirish.md).
 *   rejim(env, request)  → 'dev' | 'resend' | null     (null = xat yuborib bo'lmaydi → kirish tugmasi ko'rinmaydi)
 *   yubor(env, rejim, { to, subject, text, kod, maqsad }) → true | xato tashlaydi
 *   devOl(env, to)       → { kod, maqsad, vaqt } | null   (faqat 'dev' rejimda yozilgan; admin endpoint orqali o'qiladi)
 *
 * DEV rejim — faqat PREVIEW'da test uchun: kod xat bilan ketmaydi, vaqtincha (10 daqiqa) KV'ga yoziladi va admin endpoint orqali ko'riladi.
 * PRODUCTION'DA HECH QACHON: dev uchun ikkita shart BIRGA kerak — (1) env AKKAUNT_DEV=1 (faqat Cloudflare'ning "Preview" muhitida qo'yiladi),
 * (2) so'rov manzili preview domen (<branch>.kalki-10y.pages.dev yoki ALLOW_LOCAL_ORIGIN=1 bilan localhost) va kalki.uz / www.kalki.uz / kalki-10y.pages.dev EMAS.
 * Resend: env AKKAUNT_EMAIL_API_KEY (secret) + ixtiyoriy AKKAUNT_EMAIL_FROM (standart: «Kalki.uz <kod@mail.kalki.uz>»). Kalit yo'q bo'lsa production'da rejim = null. */
const PROD_HOSTS = ['kalki.uz', 'www.kalki.uz', 'kalki-10y.pages.dev'];
export function devRuxsat(env, request) {
  if (!env || env.AKKAUNT_DEV !== '1') return false;
  let h; try { h = new URL(request.url).hostname; } catch (e) { return false; }
  if (PROD_HOSTS.indexOf(h) > -1) return false;
  if (/^([a-z0-9-]+\.)+kalki-10y\.pages\.dev$/.test(h)) return true;
  return env.ALLOW_LOCAL_ORIGIN === '1' && (h === 'localhost' || h === '127.0.0.1');
}
export function rejim(env, request) {
  if (devRuxsat(env, request)) return 'dev';
  if (env && typeof env.AKKAUNT_EMAIL_API_KEY === 'string' && env.AKKAUNT_EMAIL_API_KEY.length >= 10) return 'resend';
  return null;
}
async function h12(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('akk-dev|' + s)); return Array.from(new Uint8Array(d)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join(''); }
export async function yubor(env, r, m) {
  if (r === 'dev') {
    const kv = env.KALKI_AI_KV;
    if (kv) await kv.put('akk:dev:' + await h12(m.to), JSON.stringify({ kod: m.kod, maqsad: m.maqsad, vaqt: Date.now() }), { expirationTtl: 600 });
    return true;
  }
  if (r === 'resend') {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: 'Bearer ' + env.AKKAUNT_EMAIL_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.AKKAUNT_EMAIL_FROM || 'Kalki.uz <kod@mail.kalki.uz>', to: [m.to], subject: m.subject, text: m.text })
    });
    if (!res.ok) throw new Error('resend ' + res.status);
    return true;
  }
  throw new Error('email rejimi yoq');
}
export async function devOl(env, to) {
  const kv = env.KALKI_AI_KV; if (!kv) return null;
  try { return JSON.parse(await kv.get('akk:dev:' + await h12(to)) || 'null'); } catch (e) { return null; }
}
