/* kalki.uz — Zaxira (bulutga saqlash) SAQLASH QATLAMI. D1'ga bog'liq BARCHA kod faqat shu faylda.
 * Boshqa bazaga (Postgres va h.k.) o'tish = faqat shu faylni almashtirish: quyidagi 4 funksiya (get, put, del, count) va bir xil qaytish shakli yetarli.
 * Jadval: zaxira (id TEXT PK, ilova, blob, versiya, yangilangan) — migrations/zaxira.sql; zaxira_tarix — migrations/zaxira-tarix.sql. Server FAQAT shifrlangan blob va id'ni ko'radi.
 *
 * Shartnoma (api/zaxira.js shunga tayanadi):
 *   get(id)                                  → { id, ilova, blob, versiya, yangilangan } | null
 *   put(id, ilova, blob, kutilgan, now, majbur) → { ok: true, versiya } | { ok: false, versiya } | { ok: false, himoya: true, versiya } (bo'sh/kichik nusxa mazmunli nusxa ustiga yozilmaydi; majbur=true — foydalanuvchi tasdiqlagan)   (kutilgan = mijoz bilgan versiya, yangi yozuv uchun 0; mos kelmasa — ok:false, hech narsa yozilmaydi)
 *   del(id)                                  → true | false (o'chirildi / topilmadi)
 *   count()                                  → yozuvlar soni (monitoring uchun)
 *   holat(id, now)                           → { ogoh, yangilangan } | null — blobsiz, oxirgi sinxronni yangilaydi va muddat ogohlantirishini bekor qiladi (ogoh — avvalgi qiymat: ilova bir martalik xabar ko'rsatadi)
 *   muddat(now)                              → { ogoh, ochirildi } — 12 oy sinxronsiz → ogoh; ogohdan 30 kun keyin ham sinxronsiz → o'chadi (zaxira-muddat.js; kunlik cron)
 *   delAkkaunt(akkauntId)                    → o'chirilgan zaxira soni — akkaunt o'chirilganda unga bog'langan (konvert rejimi) zaxira darhol o'chadi */
import { muddat as muddatQoida } from './zaxira-muddat.js';
export function makeStore(env) {
  const db = env && env.KALKIFIT_DB;
  if (!db) return null;
  const changes = (r) => (r && r.meta && r.meta.changes) || 0;
  async function get(id) { return (await db.prepare('SELECT id, ilova, blob, versiya, yangilangan FROM zaxira WHERE id = ?').bind(id).first()) || null; }
  /* HIMOYA (2026-11-02): bulutdagi nusxa mazmunli (≥ SHRINK_MIN bayt), yangisi esa bo'sh/juda kichik (< SHRINK_EMPTY bayt yoki eskisining yarmidan kam) bo'lsa — ustidan YOZILMAYDI ({ ok:false, himoya:true });
     mijoz foydalanuvchidan so'raydi va aniq tasdiqlasa `majbur` bilan qayta yuboradi. Server mazmunni ko'rmaydi (shifrlangan) — o'lcham (siqilgan blob) taxminiy, lekin bo'sh holatni (~330 bayt) aniq ushlaydi. */
  const SHRINK_MIN = 900, SHRINK_EMPTY = 400;
  async function put(id, ilova, blob, kutilgan, now, majbur, da) {          // da — mijoz da'vosi { n: yozuvlar soni, d: aniq o'chirilganlar soni } (ixtiyoriy)
    if (kutilgan > 0 && !majbur) {
      let cur0; try { cur0 = await db.prepare('SELECT versiya, LENGTH(blob) AS n, yozuv FROM zaxira WHERE id = ? AND ilova = ?').bind(id, ilova).first(); } catch (e) { cur0 = await db.prepare('SELECT versiya, LENGTH(blob) AS n FROM zaxira WHERE id = ? AND ilova = ?').bind(id, ilova).first(); }
      if (cur0 && cur0.versiya === kutilgan) {
        if (cur0.n >= SHRINK_MIN && (blob.length < SHRINK_EMPTY || blob.length * 2 < cur0.n)) return { ok: false, himoya: true, versiya: cur0.versiya };
        if (da && Number.isInteger(da.n) && cur0.yozuv != null && da.n + Math.max(0, da.d || 0) < cur0.yozuv) return { ok: false, himoya: true, versiya: cur0.versiya, sabab: 'yozuv' };          // YOZUV SONI INVARIANTI: kamroq yozuv (aniq o'chirishlardan tashqari) yozilmaydi
      }
    }
    if (kutilgan === 0) {                                       // yangi yozuv: faqat yo'q bo'lsa
      let r; try { r = await db.prepare('INSERT OR IGNORE INTO zaxira (id, ilova, blob, versiya, yangilangan, oxirgi) VALUES (?, ?, ?, 1, ?, ?)').bind(id, ilova, blob, now, now).run(); }
      catch (e) { r = await db.prepare('INSERT OR IGNORE INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (?, ?, ?, 1, ?)').bind(id, ilova, blob, now).run(); }          // muddat ustunlari (zaxira-muddat.sql) hali yo'q — eski yozuv
      if (changes(r) === 1) { if (da && Number.isInteger(da.n)) { try { await db.prepare('UPDATE zaxira SET yozuv = ? WHERE id = ?').bind(da.n, id).run(); } catch (e) { /* ustun yo'q */ } } return { ok: true, versiya: 1 }; }
    } else {                                                    // yangilash: versiya hali o'sha bo'lsa (boshqa qurilma yozib ulgurmagan)
      await tarixga(id, kutilgan, ilova);                       // oldingi versiya TARIXGA (tiklash uchun); jadval yo'q bo'lsa — tarixsiz davom etadi
      let r; try { r = await db.prepare('UPDATE zaxira SET blob = ?, versiya = versiya + 1, yangilangan = ?, oxirgi = ?, ogoh = NULL WHERE id = ? AND ilova = ? AND versiya = ?').bind(blob, now, now, id, ilova, kutilgan).run(); }
      catch (e) { r = await db.prepare('UPDATE zaxira SET blob = ?, versiya = versiya + 1, yangilangan = ? WHERE id = ? AND ilova = ? AND versiya = ?').bind(blob, now, id, ilova, kutilgan).run(); }
      if (changes(r) === 1) { if (da && Number.isInteger(da.n)) { try { await db.prepare('UPDATE zaxira SET yozuv = ? WHERE id = ?').bind(da.n, id).run(); } catch (e) { /* ustun yo'q */ } } if ((kutilgan + 1) % 5 === 0) await tarixTozala(id, now); return { ok: true, versiya: kutilgan + 1 }; }
    }
    const cur = await get(id); return { ok: false, versiya: cur ? cur.versiya : 0 };
  }
  async function del(id) { try { await db.prepare('DELETE FROM zaxira_tarix WHERE id = ?').bind(id).run(); } catch (e) { /* tarix jadvali yo'q */ } return changes(await db.prepare('DELETE FROM zaxira WHERE id = ?').bind(id).run()) > 0; }
  async function count() { const r = await db.prepare('SELECT COUNT(*) AS c FROM zaxira').first(); return r ? r.c : 0; }
  async function holat(id, now) {
    let r; try { r = await db.prepare('SELECT yangilangan, ogoh, versiya FROM zaxira WHERE id = ?').bind(id).first(); } catch (e) { r = await db.prepare('SELECT yangilangan, versiya FROM zaxira WHERE id = ?').bind(id).first(); }
    if (!r) return null; try { await db.prepare('UPDATE zaxira SET oxirgi = ?, ogoh = NULL WHERE id = ?').bind(now, id).run(); } catch (e) {}
    return { yangilangan: r.yangilangan, ogoh: r.ogoh || 0, versiya: r.versiya };
  }
  const muddat = (now, quruq) => muddatQoida(db, now, quruq);
  /* ---- versiyalar tarixi (migrations/zaxira-tarix.sql): oxirgi 20 versiya + oxirgi 30 kun uchun har kunning oxirgi versiyasi ---- */
  const KEEP_N = 20, KEEP_DAYS = 30, DAY = 86400000, TZ = 5 * 3600000;
  async function tarixga(id, versiya, ilova) { try { await db.prepare('INSERT OR REPLACE INTO zaxira_tarix (id, versiya, blob, yangilangan) SELECT id, versiya, blob, yangilangan FROM zaxira WHERE id = ? AND ilova = ? AND versiya = ?').bind(id, ilova, versiya).run(); } catch (e) { /* jadval yo'q */ } }
  async function tarixTozala(id, now) {
    try {
      const rows = (await db.prepare('SELECT versiya, yangilangan FROM zaxira_tarix WHERE id = ? ORDER BY versiya DESC').bind(id).all()).results || [], keep = new Set(), days = new Set();
      rows.forEach((r, i) => { if (i < KEEP_N) keep.add(r.versiya); const d = Math.floor((r.yangilangan + TZ) / DAY); if (now - r.yangilangan <= KEEP_DAYS * DAY && !days.has(d)) { days.add(d); keep.add(r.versiya); } });
      for (const r of rows) if (!keep.has(r.versiya)) await db.prepare('DELETE FROM zaxira_tarix WHERE id = ? AND versiya = ?').bind(id, r.versiya).run();
    } catch (e) { /* jadval yo'q */ }
  }
  async function tarix(id) {                                  // → [{ versiya, yangilangan, bayt, joriy }] (yangidan eskiga); joriy versiya ham ro'yxatda
    const cur = await db.prepare('SELECT versiya, yangilangan, LENGTH(blob) AS bayt FROM zaxira WHERE id = ?').bind(id).first(); const out = cur ? [{ versiya: cur.versiya, yangilangan: cur.yangilangan, bayt: cur.bayt, joriy: true }] : [];
    try { ((await db.prepare('SELECT versiya, yangilangan, LENGTH(blob) AS bayt FROM zaxira_tarix WHERE id = ? ORDER BY versiya DESC').bind(id).all()).results || []).forEach((r) => out.push({ versiya: r.versiya, yangilangan: r.yangilangan, bayt: r.bayt, joriy: false })); } catch (e) { /* jadval yo'q */ }
    return out;
  }
  /* tanlangan versiyadan tiklash: joriy holat AVVAL tarixga tushadi (yo'qolmaydi), keyin tanlangan nusxa YANGI versiya sifatida yoziladi → mijoz birlashtirib oladi */
  async function tiklash(id, versiya, now) {
    const cur = await db.prepare('SELECT ilova, versiya FROM zaxira WHERE id = ?').bind(id).first(); if (!cur) return { ok: false, xato: 'zaxira yo\'q' };
    const old = cur.versiya === versiya ? null : await db.prepare('SELECT blob FROM zaxira_tarix WHERE id = ? AND versiya = ?').bind(id, versiya).first(); if (cur.versiya === versiya || !old) return { ok: false, xato: cur.versiya === versiya ? 'bu joriy versiya' : 'versiya topilmadi' };
    await tarixga(id, cur.versiya, cur.ilova);
    let r; try { r = await db.prepare('UPDATE zaxira SET blob = ?, versiya = versiya + 1, yangilangan = ?, oxirgi = ?, ogoh = NULL WHERE id = ? AND versiya = ?').bind(old.blob, now, now, id, cur.versiya).run(); }
    catch (e) { r = await db.prepare('UPDATE zaxira SET blob = ?, versiya = versiya + 1, yangilangan = ? WHERE id = ? AND versiya = ?').bind(old.blob, now, id, cur.versiya).run(); }          // muddat ustunlari (zaxira-muddat.sql) hali yo'q
    return changes(r) === 1 ? { ok: true, versiya: cur.versiya + 1 } : { ok: false, xato: 'parallel yozuv — qayta urining' };
  }
  async function delAkkaunt(akkauntId) {                             // konvert rejimi: akkaunt_ilova.zaxira_id → zaxira darhol o'chadi (qat'iy rejimda bog'lanish yo'q — mijoz o'zi o'chiradi)
    let n = 0; const rows = (await db.prepare('SELECT zaxira_id FROM akkaunt_ilova WHERE akkaunt_id = ? AND zaxira_id IS NOT NULL').bind(akkauntId).all()).results || [];
    for (const x of rows) { try { await db.prepare('DELETE FROM zaxira_tarix WHERE id = ?').bind(x.zaxira_id).run(); } catch (e) { /* tarix jadvali yo'q */ } n += changes(await db.prepare('DELETE FROM zaxira WHERE id = ?').bind(x.zaxira_id).run()); } return n;
  }
  return { get, put, del, count, holat, muddat, delAkkaunt, tarix, tiklash };
}
