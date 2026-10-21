/* kalki.uz — KalkiFit AI uchun kunlik limitlar (KV): foydalanuvchi (mijoz/IP) limitidan TASHQARI umumiy kunlik chegara (xarajatdan himoya).
 * Har xizmat o'z hisobiga ega (ns: 'tx' matn, 'img' rasm, 'tk' taklif) — ariza.js dagi umumiy 'site:' hisobi bilan aralashmaydi.
 * Qaytaradi: null (ruxsat) yoki 'sayt' | 'mijoz' | 'ip' (qaysi chegara to'ldi). Sanoq faqat ruxsat berilganda oshadi. */
const KV_TTL = 172800;
async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24); }
const tashkentDay = () => new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
async function quotaKeys(request, env, cid, o) {
  const day = tashkentDay(), salt = env.IP_HASH_SALT || '', ip = request.headers.get('CF-Connecting-IP') || '?';
  const keys = [{ k: o.ns + ':site:' + day, lim: o.site, s: 'sayt' }, { k: o.ns + ':ip:' + day + ':' + await sha(salt + ip), lim: o.ip, s: 'ip' }];
  if (cid) keys.splice(1, 0, { k: o.ns + ':cid:' + day + ':' + await sha(salt + 'c:' + cid.toLowerCase()), lim: o.client, s: 'mijoz' });
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
