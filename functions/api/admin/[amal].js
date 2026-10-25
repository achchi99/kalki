/* kalki.uz — admin: kirish va akkaunt ochganlar ro'yxati (KalkiFit statistika sahifasi: admin/kalkifit-statistika.html).
 *   POST /api/admin/kirish   { parol }  → { ok, muddat } + HttpOnly cookie (12 soat). 5 xato → 15 daqiqa blok. Jurnalga yoziladi (IP qisqartirilgan).
 *   POST /api/admin/chiqish             → cookie o'chadi
 *   GET  /api/admin/holat               → { kirgan }
 *   GET  /api/admin/jurnal              → { kirishlar: [{ vaqt, ok, usul, ip }] }  (oxirgi 100)
 *   GET  /api/admin/foydalanuvchilar    → { foydalanuvchilar: [...] }   ?id= → bitta akkaunt tafsiloti (30 kunlik akkaunt hodisalari, qurilmalar, ilovalar)
 * MA'LUMOT FAQAT mavjud akkaunt jadvallaridan (akkaunt, sessiya, akkaunt_ilova, zaxira.yangilangan, audit) — yangi kuzatuv yo'q.
 *   Ovqat soni, AI/ovoz, til va profil akkauntga BOG'LANMAGAN (statistika anonim, zaxira uchidan-uchiga shifrlangan — server ochmaydi): bu ustunlar qaytarilmaydi. Vazn hech qachon. */
import { adminAuth, kirish, ajson, cookieClear, tokenOk, cookieOf } from '../../_lib/admin-auth.js';

const DAY = 86400000, TZ = 5 * 3600000;
const kunOf = (ms) => new Date(ms + TZ).toISOString().slice(0, 10);
const all = async (db, sql, ...a) => ((await db.prepare(sql).bind(...a).all()).results || []);

export async function royxat(db, now) {
  const d30 = now - 30 * DAY;
  const r = await all(db, `SELECT a.id, a.email, a.ism, a.usul, a.yaratilgan, a.oxirgi_kirish, a.marketing,
      (SELECT COUNT(*) FROM sessiya s WHERE s.akkaunt_id = a.id) AS sessiyalar,
      (SELECT MAX(s.oxirgi) FROM sessiya s WHERE s.akkaunt_id = a.id) AS sessiya_oxirgi,
      (SELECT GROUP_CONCAT(DISTINCT s.qurilma) FROM sessiya s WHERE s.akkaunt_id = a.id AND s.qurilma != '') AS qurilmalar,
      (SELECT GROUP_CONCAT(i.ilova) FROM akkaunt_ilova i WHERE i.akkaunt_id = a.id) AS ilovalar,
      (SELECT MAX(z.yangilangan) FROM akkaunt_ilova i JOIN zaxira z ON z.id = i.zaxira_id WHERE i.akkaunt_id = a.id) AS zaxira_oxirgi
    FROM akkaunt a ORDER BY a.oxirgi_kirish DESC LIMIT 5000`);
  const fk = {}, add = (id, ms) => { (fk[id] || (fk[id] = {}))[kunOf(ms)] = 1; };          // faol kunlar (30): akkaunt hodisalari + sessiya oxirgi faolligi kunlari (tafsilot grafigi bilan bir xil qoida)
  (await all(db, 'SELECT akkaunt_id, vaqt FROM audit WHERE akkaunt_id IS NOT NULL AND vaqt >= ?', d30)).forEach((e) => add(e.akkaunt_id, e.vaqt));
  (await all(db, 'SELECT akkaunt_id, oxirgi FROM sessiya WHERE oxirgi >= ?', d30)).forEach((e) => add(e.akkaunt_id, e.oxirgi));
  return r.map((x) => ({ id: x.id, email: x.email, ism: x.ism || '', usul: x.usul, yaratilgan: x.yaratilgan, oxirgi: Math.max(x.oxirgi_kirish || 0, x.sessiya_oxirgi || 0, x.zaxira_oxirgi || 0), oxirgi_kirish: x.oxirgi_kirish,
    sessiyalar: x.sessiyalar || 0, qurilmalar: x.qurilmalar ? String(x.qurilmalar).split(',').filter(Boolean) : [], ilovalar: x.ilovalar ? String(x.ilovalar).split(',').filter(Boolean) : [], zaxira_oxirgi: x.zaxira_oxirgi || null, faol_kun30: fk[x.id] ? Object.keys(fk[x.id]).length : 0, marketing: x.marketing ? 1 : 0 }));
}
export async function tafsilot(db, id, now) {
  const a = await db.prepare('SELECT id, email, ism, usul, yaratilgan, oxirgi_kirish, marketing FROM akkaunt WHERE id = ?').bind(id).first(); if (!a) return null;
  const sess = await all(db, 'SELECT qurilma, yaratilgan, oxirgi FROM sessiya WHERE akkaunt_id = ? ORDER BY oxirgi DESC', id);
  const il = await all(db, 'SELECT ilova, rejim, ulangan, zaxira_id FROM akkaunt_ilova WHERE akkaunt_id = ?', id);
  for (const x of il) { x.zaxira = null; if (x.zaxira_id) { try { const z = await db.prepare('SELECT yangilangan FROM zaxira WHERE id = ?').bind(x.zaxira_id).first(); x.zaxira = z ? z.yangilangan : null; } catch (e) {} } delete x.zaxira_id; }
  const ev = await all(db, 'SELECT vaqt, hodisa FROM audit WHERE akkaunt_id = ? AND vaqt >= ? ORDER BY vaqt', id, now - 30 * DAY), kun = {};
  for (let i = 29; i >= 0; i--) kun[kunOf(now - i * DAY)] = 0; ev.forEach((e) => { const k = kunOf(e.vaqt); if (k in kun) kun[k]++; });
  sess.forEach((s) => { const k = kunOf(s.oxirgi); if (k in kun && !kun[k]) kun[k] = 1; });          // sessiya oxirgi faolligi ham shu kunni «faol» qiladi (ro'yxatdagi «faol kunlar» bilan bir qoida)
  return { akkaunt: { id: a.id, email: a.email, ism: a.ism || '', usul: a.usul, yaratilgan: a.yaratilgan, oxirgi_kirish: a.oxirgi_kirish, marketing: a.marketing ? 1 : 0 }, qurilmalar: sess, ilovalar: il,
    faollik: Object.keys(kun).map((k) => ({ kun: k, n: kun[k] })), hodisalar: ev.slice(-50).reverse(), profil: null };          // profil — shifrlangan zaxirada; server ochmaydi
}

export async function onRequest({ request, env, params }) {
  const amal = String(params.amal || ''), now = Date.now(), m = request.method;
  if (amal === 'kirish') return m === 'POST' ? kirish(request, env, now) : ajson(405, { xato: 'POST.' });
  if (amal === 'chiqish') return m === 'POST' ? ajson(200, { ok: true }, { 'Set-Cookie': cookieClear() }) : ajson(405, { xato: 'POST.' });
  if (amal === 'holat') { const pw = env.KALKIFIT_ADMIN_PASSWORD; return ajson(200, { kirgan: !!(pw && await tokenOk(pw, cookieOf(request), now)) }); }
  if (m !== 'GET') return ajson(405, { xato: 'GET.' });
  if (amal !== 'jurnal' && amal !== 'foydalanuvchilar') return ajson(404, { xato: 'Topilmadi.' });
  const deny = await adminAuth(request, env, { now }); if (deny) return deny;
  const db = env.KALKIFIT_DB; if (!db) return ajson(503, { xato: 'Sozlanmagan.' });
  try {
    if (amal === 'jurnal') return ajson(200, { kirishlar: await all(db, 'SELECT vaqt, ok, usul, ip FROM admin_kirish ORDER BY vaqt DESC LIMIT 100') });
    const id = new URL(request.url).searchParams.get('id');
    if (id) { if (!/^[0-9a-f]{8,64}$/.test(id)) return ajson(400, { xato: "So'rov noto'g'ri." }); const t = await tafsilot(db, id, now); return t ? ajson(200, t) : ajson(404, { xato: 'Topilmadi.' }); }
    return ajson(200, { foydalanuvchilar: await royxat(db, now) });
  } catch (e) { return ajson(503, { xato: "Jadval yo'q (migrations/akkaunt.sql, admin-stat.sql)." }); }
}
