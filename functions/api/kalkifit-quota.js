/* kalki.uz — KalkiFit AI uchun kunlik limitlar (KV): foydalanuvchi (mijoz/IP) limitidan TASHQARI umumiy kunlik chegara (xarajatdan himoya).
 * Har xizmat o'z hisobiga ega (ns: 'tx' matn, 'img' rasm, 'tk' taklif) — ariza.js dagi umumiy 'site:' hisobi bilan aralashmaydi.
 * Qaytaradi: null (ruxsat) yoki 'sayt' | 'mijoz' | 'ip' (qaysi chegara to'ldi). Sanoq faqat ruxsat berilganda oshadi.
 * o.uns — foydalanuvchi (mijoz/IP) hisobi uchun alohida nom (masalan 'ai': retsept va rasm AI UMUMIY kunlik hisob); sayt tavani o.ns bo'yicha alohida qoladi. */
/* «Retseptimni moslashtir» + «Rasm orqali qo'shish» AI: BITTA umumiy kunlik hisob (mijoz_id + IP): Android ilovasi 2, veb 5. */
export const AI_LIMIT = { veb: 5, android: 2 };
export function aiLimits(env, body) {
  const veb = parseInt(env.KALKIFIT_AI_LIMIT || env.RETSEPT_CLIENT_LIMIT, 10) > 0 ? parseInt(env.KALKIFIT_AI_LIMIT || env.RETSEPT_CLIENT_LIMIT, 10) : AI_LIMIT.veb;
  return { client: body && body.platforma === 'android' ? AI_LIMIT.android : veb, ip: veb * 2 };
}
/* OVOZLI kiritish: AI hisobidan ALOHIDA ('ov'): qurilmaga 15, IP bo'yicha 30, butun sayt bo'yicha kuniga 1500. Ovozdan keyingi taom ajratish (manba=ovoz) ham shu hisobdan (server ovozi bo'lsa — bir martalik tok bilan qayta sanalmaydi). */
export const OVOZ_LIMIT = { client: 15, ip: 30, site: 1500 };
const pint = (v, d) => (parseInt(v, 10) > 0 ? parseInt(v, 10) : d);
export function ovozLimits(env) { return { client: pint(env.KALKIFIT_OVOZ_LIMIT, OVOZ_LIMIT.client), ip: pint(env.KALKIFIT_OVOZ_IP_LIMIT, OVOZ_LIMIT.ip), site: pint(env.KALKIFIT_OVOZ_SITE_LIMIT, OVOZ_LIMIT.site) }; }
export const ovozLimitMsg = () => "Bugungi ovozli kiritish tugadi, yozib qo'shing";
export const ovozQuota = (env, o) => { const l = ovozLimits(env); return Object.assign({ ns: 'ov', uns: 'ov', site: l.site, client: l.client, ip: l.ip }, o || {}); };
export const aiLimitMsg = (n) => `Bugungi ${n} ta AI so'rov ishlatildi. Ertaga yana urinib ko'ring.`;
const KV_TTL = 172800;
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24); }
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
async function quotaKeys(request, env, cid, o) {
  const day = tashkentDay(), salt = env.IP_HASH_SALT || '', ip = request.headers.get('CF-Connecting-IP') || '?';
  const u = o.uns || o.ns, keys = [{ k: o.ns + ':site:' + day, lim: o.site, s: 'sayt' }, { k: u + ':ip:' + day + ':' + await sha(salt + ip), lim: o.ip, s: 'ip' }];
  if (cid) keys.splice(1, 0, { k: u + ':cid:' + day + ':' + await sha(salt + 'c:' + cid.toLowerCase()), lim: o.client, s: 'mijoz' });
  return keys;
}
/* foydalanuvchi uchun qolgan so'rov: min(mijoz, IP) chegarasi; o.out berilsa takeKfQuota ham shu qiymatni (sanoqdan keyin) yozadi */
function leftOf(keys, counts, plus) {
  let q = Infinity; keys.forEach((x, i) => { if (x.s !== 'sayt') q = Math.min(q, x.lim - (parseInt(counts[i], 10) || 0) - plus); });
  return Math.max(0, q === Infinity ? 0 : q);
}
export async function takeKfQuota(env, request, cid, o) {         // o: { ns, site, client, ip, out? }
  const kv = env.KALKI_AI_KV, keys = await quotaKeys(request, env, cid, o);
  const counts = await Promise.all(keys.map((x) => kv.get(x.k)));
  for (let i = 0; i < keys.length; i++) if ((parseInt(counts[i], 10) || 0) >= keys[i].lim) { if (o.out) o.out.qoldi = 0; return keys[i].s; }
  await Promise.all(keys.map((x, i) => kv.put(x.k, String((parseInt(counts[i], 10) || 0) + 1), { expirationTtl: KV_TTL })));
  if (o.out) o.out.qoldi = leftOf(keys, counts, 1);
  return null;
}
/* sanamasdan: bugun qancha qoldi (hisoblagich uchun) */
export async function peekKfQuota(env, request, cid, o) {
  const kv = env.KALKI_AI_KV, keys = await quotaKeys(request, env, cid, o);
  return leftOf(keys, await Promise.all(keys.map((x) => kv.get(x.k))), 0);
}
