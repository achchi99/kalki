/* kalki.uz — KalkiFit admin API (taklif navbati): ro'yxat, ma'qullash/rad etish, ma'qullanganlarni eksport.
 * Himoya: functions/_lib/admin-auth.js — admin sessiyasi (cookie, 12 soat) yoki X-Admin-Password; 5 xato → 15 daqiqa blok.
 * GET  ?holat=yangi|tasdiqlangan|maqullangan|rad|hammasi  → { takliflar: [...] }
 * GET  ?eksport=1                                           → { v:1, taomlar: [ ma'qullangan, bazaga tayyor ] }
 * POST { h, amal: 'maqullash'|'rad'|'qaytarish'|'ochirish', g, kat, nom_uz, nom_ru }   ('ochirish' — taklifni butunlay o'chiradi)
 * v78 «Xato xabarlari» (xato_xabar): GET ?xato=yangi|korildi|hammasi → { xatolar: [...] }; POST { tur: 'xato', h, amal: 'korildi'|'qaytarish'|'ochirish' }
 * v67 «Yorliq takliflari» (yorliq_taklif): GET ?yorliq=yangi|qoshildi|rad|hammasi → { yorliqlar: [...] } (har qatorda nom_son — shu nom necha xil qiymat bilan kelgan)
 *   POST { tur: 'yorliq', h, amal: 'qoshish'|'rad'|'qaytarish'|'ochirish', kat, nom_uz, nom_ru } — 'qoshish' BITTA bosishda umumiy bazaga (GET /api/kalkifit-yorliq, manba «yorliq (foydalanuvchi)») */
import { originOk, json, num } from './ariza.js';
import { adminAuth } from '../_lib/admin-auth.js';
import { asFood } from './kalkifit-yorliq.js';

const YHOLAT = ['yangi', 'qoshildi', 'rad'], HOLAT = ['yangi', 'tasdiqlangan', 'maqullangan', 'rad'], KAT = ['o', 'n', 's', 'm', 'g', 'v', 'f', 'd', 'i', 'q', 'h', 'x'];
const row = (r) => ({ h: r.h, nom: r.nom, til: r.til, porsiya: r.porsiya, jami: r.jami, kunlar: r.kunlar, kcal: r.jami ? Math.round(r.kcal_sum / r.jami) : 0, o: r.jami ? Math.round(r.o_sum / r.jami * 10) / 10 : 0, y: r.jami ? Math.round(r.y_sum / r.jami * 10) / 10 : 0, u: r.jami ? Math.round(r.u_sum / r.jami * 10) / 10 : 0, holat: r.holat, g: r.g, kat: r.kat, nom_uz: r.nom_uz, nom_ru: r.nom_ru, birinchi: r.birinchi, oxirgi: r.oxirgi });
const E = { 400: "So'rov noto'g'ri.", 401: "Parol noto'g'ri.", 403: "Ruxsat yo'q.", 404: 'Topilmadi.', 405: 'GET yoki POST.', 429: "Juda ko'p urinish. Keyinroq.", 503: 'Sozlanmagan.' };
const fail = (s) => json(s, { xato: E[s] || 'Xato.' });

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'POST') return json(405, { xato: E[405] }, { Allow: 'GET, POST' });
  const origin = request.headers.get('Origin'); if (origin && !originOk(origin, env)) return fail(403);
  if (!env.KALKIFIT_ADMIN_PASSWORD || !env.KALKIFIT_DB) return fail(503);
  const deny = await adminAuth(request, env); if (deny) return deny;          // admin sessiyasi yoki X-Admin-Password (5 xato → 15 daqiqa blok)
  const db = env.KALKIFIT_DB, url = new URL(request.url);
  if (request.method === 'GET' && url.searchParams.get('yorliq')) {
    const hl = url.searchParams.get('yorliq'), q = 'SELECT t.*, (SELECT COUNT(*) FROM yorliq_taklif x WHERE x.kalit = t.kalit) AS nom_son FROM yorliq_taklif t';
    const r = hl === 'hammasi' ? await db.prepare(q + ' ORDER BY t.jami DESC, t.oxirgi DESC LIMIT 500').all() : (YHOLAT.includes(hl) ? await db.prepare(q + ' WHERE t.holat = ? ORDER BY t.jami DESC, t.oxirgi DESC LIMIT 500').bind(hl).all() : null);
    if (!r) return fail(400);
    return json(200, { yorliqlar: (r.results || []).map((x) => { const f = asFood(x); return { h: x.h, nom: x.nom, til: x.til, kcal: f.k, o: f.p, y: f.f, u: f.c, g: x.g, birlik: x.birlik, jami: x.jami, rasm: x.rasm, kod: x.kod || '', nom_son: x.nom_son, holat: x.holat, kat: x.kat, nom_uz: x.nom_uz, nom_ru: x.nom_ru, birinchi: x.birinchi, oxirgi: x.oxirgi }; }) });
  }
  if (request.method === 'GET' && url.searchParams.get('xato')) {          // v78: «Xato topdingizmi?» xabarlari (xato_xabar)
    const hl = url.searchParams.get('xato'), q = 'SELECT * FROM xato_xabar';
    let r; try { r = hl === 'hammasi' ? await db.prepare(q + ' ORDER BY oxirgi DESC, jami DESC LIMIT 500').all() : (['yangi', 'korildi'].includes(hl) ? await db.prepare(q + ' WHERE holat = ? ORDER BY jami DESC, oxirgi DESC LIMIT 500').bind(hl).all() : null); } catch (e) { return json(200, { xatolar: [] }); }
    if (!r) return fail(400);
    return json(200, { xatolar: (r.results || []).map((x) => ({ h: x.h, taom: x.taom, vr: x.vr, turi: x.turi, izoh: x.izoh, til: x.til, jami: x.jami, holat: x.holat, birinchi: x.birinchi, oxirgi: x.oxirgi })) });
  }
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
  if (b.tur === 'xato') {
    if (b.amal === 'ochirish') await db.prepare('DELETE FROM xato_xabar WHERE h = ?').bind(b.h).run();
    else if (b.amal === 'korildi') await db.prepare("UPDATE xato_xabar SET holat = 'korildi' WHERE h = ?").bind(b.h).run();
    else if (b.amal === 'qaytarish') await db.prepare("UPDATE xato_xabar SET holat = 'yangi' WHERE h = ?").bind(b.h).run();
    else return fail(400);
    return json(200, { ok: true });
  }
  if (b.tur === 'yorliq') {
    const y = await db.prepare('SELECT * FROM yorliq_taklif WHERE h = ?').bind(b.h).first(); if (!y) return fail(404);
    if (b.amal === 'ochirish') await db.prepare('DELETE FROM yorliq_taklif WHERE h = ?').bind(b.h).run();
    else if (b.amal === 'rad') await db.prepare("UPDATE yorliq_taklif SET holat = 'rad' WHERE h = ?").bind(b.h).run();
    else if (b.amal === 'qaytarish') await db.prepare("UPDATE yorliq_taklif SET holat = 'yangi' WHERE h = ?").bind(b.h).run();
    else if (b.amal === 'qoshish') {
      const kat = KAT.includes(b.kat) ? b.kat : 'x', nu = String(b.nom_uz || y.nom).replace(/[<>]/g, '').trim().slice(0, 60), nr = String(b.nom_ru || '').replace(/[<>]/g, '').trim().slice(0, 60);
      if (nu.length < 2) return fail(400);
      await db.prepare("UPDATE yorliq_taklif SET holat = 'qoshildi', kat = ?, nom_uz = ?, nom_ru = ? WHERE h = ?").bind(kat, nu, nr || null, b.h).run();
      if (y.kod) { try { const f = asFood(y), j = y.jami || 1, r1 = (x) => Math.round(x * 10) / 10; await db.prepare("INSERT OR REPLACE INTO shtrix_mahsulot (kod, nom, brend, kcal, oqsil, yog, uglevod, qadoq, porsiya, birlik, manba, tasdiqlangan, yaratildi, yangilandi) VALUES (?, ?, '', ?, ?, ?, ?, ?, 0, ?, 'yorliq', 1, ?, ?)").bind(y.kod, nu, y.kcal, r1(y.o_sum / j), r1(y.y_sum / j), r1(y.u_sum / j), y.g || 0, y.birlik === 'ml' ? 'ml' : 'g', new Date().toISOString().slice(0, 10), new Date().toISOString().slice(0, 10)).run(); } catch (e) { /* shtrix jadvali yo'q */ } }          // v79: shtrix-kodli taklif — tasdiqlangach hamma uchun skanerda
    } else return fail(400);
    return json(200, { ok: true });
  }
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
