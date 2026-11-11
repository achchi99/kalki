/* kalki.uz — KalkiFit AI uchun kunlik limitlar (KV): foydalanuvchi (mijoz/IP) limitidan TASHQARI umumiy kunlik chegara (xarajatdan himoya).
 * Har xizmat o'z hisobiga ega (ns: 'tx' matn, 'img' rasm, 'tk' taklif) — ariza.js dagi umumiy 'site:' hisobi bilan aralashmaydi.
 * Qaytaradi: null (ruxsat) yoki 'sayt' | 'mijoz' | 'ip' (qaysi chegara to'ldi). Sanoq faqat ruxsat berilganda oshadi.
 * o.uns — foydalanuvchi (mijoz/IP) hisobi uchun alohida nom (masalan 'ai': retsept va rasm AI UMUMIY kunlik hisob); sayt tavani o.ns bo'yicha alohida qoladi. */
/* «Retseptimni moslashtir» + «Rasm orqali qo'shish» AI: BITTA umumiy kunlik hisob (mijoz_id + IP): Android ilovasi 2, veb 5. */
export const AI_LIMIT = { veb: 5, android: 2 };          // ESKI limit: umumiy chegara (RASM_UMUMIY_CHEGARA) oshganda hamma uchun shu qaytadi
/* v75: rasm AI (rasm + menyu rasmi + retsept — bitta umumiy hisob 'ai'): mehmon (akkauntsiz) 8, akkaunt bilan kirgan 15; Cheksiz AI akkaunti — o'zgarishsiz (kuniga 150).
 * RASM_UMUMIY_CHEGARA — butun saytda kuniga rasm so'rovlari (~$4): oshsa, qolgan kun hamma ESKI limitga (AI_LIMIT) qaytadi va admin statistikada ogohlantirish chiqadi. */
export const RASM_LIMIT = { mehmon: 8, akkaunt: 15 }, RASM_UMUMIY_CHEGARA = 1000, RASM_SAYT_TAVAN = 2000, AI_IP = { yangi: 60, eski: 10 };
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
import { sessiyaAkkaunt, takeCheksiz, refundCheksiz, cheksizNs, CHEKSIZ_QOLDI } from '../_lib/ai-cheksiz.js';
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
/* v75: «ai» hisobi (o.ai) — limit serverda hal qilinadi: mehmon 8 / akkaunt 15; butun saytda rasm so'rovlari RASM_UMUMIY_CHEGARA dan oshsa — eski limit (Android 2, veb 5, IP 10).
 * o.out ga: limit, akkaunt (bool), umumiy (bool). Sana — Toshkent (tashkentDay), shuning uchun hisob har kuni 00:00 (UTC+5) da yangilanadi. */
async function aiResolve(env, o, sess) {
  const day = tashkentDay(), kv = env.KALKI_AI_KV, ak = !!sess; let umumiy = false;
  try { umumiy = (parseInt(await kv.get('img:site:' + day), 10) || 0) >= RASM_UMUMIY_CHEGARA; } catch (e) { umumiy = false; }
  const old = aiLimits(env, { platforma: o.platforma });
  const ov = parseInt(env.KALKIFIT_AI_LIMIT || env.RETSEPT_CLIENT_LIMIT, 10);          // operatsion o'zgartirish (env): berilsa — mehmon va akkaunt uchun bir xil
  o.client = umumiy ? old.client : (ov > 0 ? ov : (ak ? RASM_LIMIT.akkaunt : RASM_LIMIT.mehmon)); o.ip = umumiy ? old.ip : (ov > 0 ? ov * 2 : AI_IP.yangi);
  if (o.out) { o.out.limit = o.client; o.out.akkaunt = ak; o.out.umumiy = umumiy; }
  if (umumiy) await umumiyBelgi(env, day);
}
async function umumiyBelgi(env, day) {                       // kuniga bir marta: admin ogohlantirishi (stat_kun: rasm_umumiy_chegara)
  try {
    const kv = env.KALKI_AI_KV, k = 'rasm:umumiy:' + day; if (await kv.get(k)) return; await kv.put(k, '1', { expirationTtl: 172800 });
    if (env.KALKIFIT_DB) await env.KALKIFIT_DB.prepare("INSERT INTO stat_kun (kun, hodisa, kalit, platforma, son) VALUES (?, 'rasm_umumiy_chegara', '', 'server', 1) ON CONFLICT(kun, hodisa, kalit, platforma) DO UPDATE SET son = son").bind(day).run();
  } catch (e) { /* ogohlantirish yozilmadi — limit baribir eski */ }
}
export async function takeKfQuota(env, request, cid, o) {         // o: { ns, site, client, ip, out? }
  const sess = await sessiyaAkkaunt(env, request);          // v74: sessiya → akkaunt (mehmon — null); belgi FAQAT server sessiyasi orqali
  if (cheksizNs(o.ns) && sess && sess.c === 1) { if (o.out) o.out.akkaunt = true; return takeCheksiz(env, sess.id, o, o.ns + ':site:' + tashkentDay()); }
  if (o.ai) await aiResolve(env, o, sess);
  const kv = env.KALKI_AI_KV, keys = await quotaKeys(request, env, cid, o);
  const counts = await Promise.all(keys.map((x) => kv.get(x.k)));
  for (let i = 0; i < keys.length; i++) if ((parseInt(counts[i], 10) || 0) >= keys[i].lim) { if (o.out) o.out.qoldi = 0; return keys[i].s; }
  await Promise.all(keys.map((x, i) => kv.put(x.k, String((parseInt(counts[i], 10) || 0) + 1), { expirationTtl: KV_TTL })));
  if (o.out) o.out.qoldi = leftOf(keys, counts, 1);
  return null;
}
/* v77: MUVAFFAQIYATSIZ so'rov (AI xatosi) hisobdan qaytariladi: takeKfQuota ning aksi — bir ta kamaytiradi (0 dan pastga tushmaydi). Xato yutiladi (qaytarilmasa — kam zarar). */
export async function refundKfQuota(env, request, cid, o) {
  try {
    const sess = await sessiyaAkkaunt(env, request);
    if (cheksizNs(o.ns) && sess && sess.c === 1) return await refundCheksiz(env, sess.id, o, o.ns + ':site:' + tashkentDay());
    const kv = env.KALKI_AI_KV, keys = await quotaKeys(request, env, cid, o), counts = await Promise.all(keys.map((x) => kv.get(x.k)));
    await Promise.all(keys.map((x, i) => { const c = parseInt(counts[i], 10) || 0; return c > 0 ? kv.put(x.k, String(c - 1), { expirationTtl: KV_TTL }) : null; }));
  } catch (e) { console.error('kvota qaytarilmadi'); }
}
/* sanamasdan: bugun qancha qoldi (hisoblagich uchun) */
export async function peekKfQuota(env, request, cid, o) {
  const sess = await sessiyaAkkaunt(env, request); if (cheksizNs(o.ns) && sess && sess.c === 1) { if (o.out) o.out.akkaunt = true; return CHEKSIZ_QOLDI; }
  if (o.ai) await aiResolve(env, o, sess);
  const kv = env.KALKI_AI_KV, keys = await quotaKeys(request, env, cid, o);
  return leftOf(keys, await Promise.all(keys.map((x) => kv.get(x.k))), 0);
}
