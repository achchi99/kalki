/* kalki.uz — «Cheksiz AI» akkaunt belgisi (D1 akkaunt.ai_cheksiz; admin yoqadi). Tekshiruv FAQAT serverda: HttpOnly sessiya cookie → sessiya → akkaunt → belgi.
 * Mijoz yuborgan hech narsaga (mijoz_id, sarlavha, tana) ishonilmaydi; email kodda yo'q. Belgili akkaunt uchun mijoz/IP kunlik AI limitlari qo'llanmaydi,
 * lekin xavfsizlik uchun KUNLIK_CHEGARA (barcha AI xizmatlari jami) va butun sayt chegarasi qoladi. Migratsiya: migrations/ai-cheksiz.sql. */
export const KUNLIK_CHEGARA = 150, NARX_TAXMINIY = 0.004;          // NARX_TAXMINIY — bitta AI so'rovining taxminiy narxi (USD), faqat admin hisobi uchun
export const CHEKSIZ_QOLDI = 9999;          // mijozga: «qoldi» o'rniga (ilova «Cheksiz» ko'rsatadi)
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join(''); }
function cookieOf(request) { const m = /(?:^|;\s*)(?:__Host-)?kalki_s=([A-Za-z0-9_-]{43})(?:;|$)/.exec(request.headers.get('Cookie') || ''); return m ? m[1] : null; }
const SES_SLIDING = 30 * 86400000;
/* → akkaunt id (belgisi bor va sessiyasi amalda) | null. Xato/baza yo'q/ustun yo'q — null (cheklov qo'llanadi: xavfsiz tomon). */
export async function cheksizAkkaunt(env, request) {
  const db = env && env.KALKIFIT_DB, tok = cookieOf(request); if (!db || !tok) return null;
  try {
    const now = Date.now(), r = await db.prepare('SELECT a.id AS id, a.ai_cheksiz AS c FROM sessiya s JOIN akkaunt a ON a.id = s.akkaunt_id WHERE s.id = ? AND s.muddat_abs > ? AND s.oxirgi > ?').bind(await sha(tok), now, now - SES_SLIDING).first();
    return r && r.c === 1 ? r.id : null;
  } catch (e) { return null; }
}
const COUNTED = (ns) => ns !== 'tk' && ns !== 'yq';          // taklif / yorliq yuborish — AI so'rovi emas
export const cheksizNs = COUNTED;
/* Belgili akkaunt uchun bitta so'rovni hisoblash: butun sayt chegarasi (KV) + akkaunt kunlik chegarasi (D1). null = ruxsat; 'sayt' | 'cheksiz' = rad. */
export async function takeCheksiz(env, akkauntId, o, siteKey) {
  const kv = env.KALKI_AI_KV, db = env.KALKIFIT_DB, day = tashkentDay();
  if (siteKey && kv) { const c = parseInt(await kv.get(siteKey), 10) || 0; if (c >= o.site) { if (o.out) o.out.qoldi = 0; return 'sayt'; } }
  const jami = await db.prepare('SELECT COALESCE(SUM(son), 0) AS n FROM ai_cheksiz_kun WHERE kun = ? AND akkaunt_id = ? AND ns != ?').bind(day, akkauntId, '!chegara').first();
  if (((jami && jami.n) || 0) >= KUNLIK_CHEGARA) {
    try { await db.prepare("INSERT INTO ai_cheksiz_kun (kun, akkaunt_id, ns, son) VALUES (?, ?, '!chegara', 1) ON CONFLICT(kun, akkaunt_id, ns) DO UPDATE SET son = son + 1").bind(day, akkauntId).run(); } catch (e) { /* belgi */ }
    if (o.out) o.out.qoldi = 0; return 'cheksiz';
  }
  await db.prepare('INSERT INTO ai_cheksiz_kun (kun, akkaunt_id, ns, son) VALUES (?, ?, ?, 1) ON CONFLICT(kun, akkaunt_id, ns) DO UPDATE SET son = son + 1').bind(day, akkauntId, o.ns).run();
  if (siteKey && kv) { const c = parseInt(await kv.get(siteKey), 10) || 0; await kv.put(siteKey, String(c + 1), { expirationTtl: 172800 }); }
  if (o.out) o.out.qoldi = CHEKSIZ_QOLDI;
  return null;
}
