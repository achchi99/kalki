/* kalki.uz — KalkiFit admin API (taklif navbati): ro'yxat, ma'qullash/rad etish, ma'qullanganlarni eksport.
 * Himoya: functions/_lib/admin-auth.js — admin sessiyasi (cookie, 12 soat) yoki X-Admin-Password; 5 xato → 15 daqiqa blok.
 * GET  ?holat=yangi|tasdiqlangan|maqullangan|rad|hammasi  → { takliflar: [...] }
 * GET  ?eksport=1                                           → { v:1, taomlar: [ ma'qullangan, bazaga tayyor ] }
 * POST { h, amal: 'maqullash'|'rad'|'qaytarish'|'ochirish', g, kat, nom_uz, nom_ru }   ('ochirish' — taklifni butunlay o'chiradi) */
import { originOk, json, num } from './ariza.js';
import { adminAuth } from '../_lib/admin-auth.js';

const HOLAT = ['yangi', 'tasdiqlangan', 'maqullangan', 'rad'], KAT = ['o', 'n', 's', 'm', 'g', 'v', 'f', 'd', 'i', 'q', 'h', 'x'];
const row = (r) => ({ h: r.h, nom: r.nom, til: r.til, porsiya: r.porsiya, jami: r.jami, kunlar: r.kunlar, kcal: r.jami ? Math.round(r.kcal_sum / r.jami) : 0, o: r.jami ? Math.round(r.o_sum / r.jami * 10) / 10 : 0, y: r.jami ? Math.round(r.y_sum / r.jami * 10) / 10 : 0, u: r.jami ? Math.round(r.u_sum / r.jami * 10) / 10 : 0, holat: r.holat, g: r.g, kat: r.kat, nom_uz: r.nom_uz, nom_ru: r.nom_ru, birinchi: r.birinchi, oxirgi: r.oxirgi });
const E = { 400: "So'rov noto'g'ri.", 401: "Parol noto'g'ri.", 403: "Ruxsat yo'q.", 404: 'Topilmadi.', 405: 'GET yoki POST.', 429: "Juda ko'p urinish. Keyinroq.", 503: 'Sozlanmagan.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'GET, POST' });
  const origin = request.headers.get('Origin'); if (origin && !originOk(origin, env)) return fail(403);
  if (!env.KALKIFIT_ADMIN_PASSWORD || !env.KALKIFIT_DB) return fail(503);
  const deny = await adminAuth(request, env); if (deny) return deny;          // admin sessiyasi yoki X-Admin-Password (5 xato → 15 daqiqa blok)
  const db = env.KALKIFIT_DB, url = new URL(request.url);
  if (request.method === 'GET') {
    if (url.searchParams.get('eksport')) {
      const r = await db.prepare("SELECT * FROM taklif WHERE holat = 'maqullangan' AND g > 0 ORDER BY nom").all();
      return json(200, { v: 1, taomlar: (r.results || []).map((x) => { const q = row(x); return { nom_uz: q.nom_uz || q.nom, nom_ru: q.nom_ru || '', kat: q.kat || 'x', g: q.g, kcal: q.kcal, o: q.o, y: q.y, u: q.u, til: q.til, jami: q.jami, kunlar: q.kunlar }; }) });
    }
    const holat = url.searchParams.get('holat') || 'tasdiqlangan';
    const r = holat === 'hammasi' ? await db.prepare('SELECT * FROM taklif ORDER BY kunlar DESC, jami DESC LIMIT 500').all() : (HOLAT.includes(holat) ? await db.prepare('SELECT * FROM taklif WHERE holat = ? ORDER BY kunlar DESC, jami DESC LIMIT 500').bind(holat).all() : null);
    if (!r) return fail(400);
    return json(200, { takliflar: (r.results || []).map(row) });
  }
  let b; try { const raw = await request.text(); if (raw.length > 2000) return fail(400); b = JSON.parse(raw); } catch (e) { return fail(400); }
  if (!b || typeof b.h !== 'string' || !/^[0-9a-f]{16}$/.test(b.h)) return fail(400);
  const cur = await db.prepare('SELECT * FROM taklif WHERE h = ?').bind(b.h).first(); if (!cur) return fail(404);
  if (b.amal === 'ochirish') { await db.prepare('DELETE FROM taklif_kun WHERE h = ?').bind(b.h).run(); await db.prepare('DELETE FROM taklif WHERE h = ?').bind(b.h).run(); }
  else if (b.amal === 'rad') await db.prepare("UPDATE taklif SET holat = 'rad' WHERE h = ?").bind(b.h).run();
  else if (b.amal === 'qaytarish') await db.prepare("UPDATE taklif SET holat = CASE WHEN kunlar >= 3 THEN 'tasdiqlangan' ELSE 'yangi' END WHERE h = ?").bind(b.h).run();
  else if (b.amal === 'maqullash') {
    const g = num(b.g, 0), kat = KAT.includes(b.kat) ? b.kat : null, nu = String(b.nom_uz || cur.nom).replace(/[<>]/g, '').trim().slice(0, 60), nr = String(b.nom_ru || '').replace(/[<>]/g, '').trim().slice(0, 60);
    if (!(g >= 5 && g <= 2000) || !kat || nu.length < 2) return fail(400);                  // porsiya og'irligi va toifa majburiy — bazaga 100 g uchun yoziladi
    await db.prepare("UPDATE taklif SET holat = 'maqullangan', g = ?, kat = ?, nom_uz = ?, nom_ru = ? WHERE h = ?").bind(g, kat, nu, nr, b.h).run();
  } else return fail(400);
  return json(200, { ok: true });
}
