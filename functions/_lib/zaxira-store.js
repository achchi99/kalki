/* kalki.uz — Zaxira (bulutga saqlash) SAQLASH QATLAMI. D1'ga bog'liq BARCHA kod faqat shu faylda.
 * Boshqa bazaga (Postgres va h.k.) o'tish = faqat shu faylni almashtirish: quyidagi 4 funksiya (get, put, del, count) va bir xil qaytish shakli yetarli.
 * Jadval: zaxira (id TEXT PK, ilova, blob, versiya, yangilangan) — migrations/zaxira.sql. Server FAQAT shifrlangan blob va id'ni ko'radi.
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
  async function put(id, ilova, blob, kutilgan, now, majbur) {
    if (kutilgan > 0 && !majbur) {
      const cur0 = await db.prepare('SELECT versiya, LENGTH(blob) AS n FROM zaxira WHERE id = ? AND ilova = ?').bind(id, ilova).first();
      if (cur0 && cur0.versiya === kutilgan && cur0.n >= SHRINK_MIN && (blob.length < SHRINK_EMPTY || blob.length * 2 < cur0.n)) return { ok: false, himoya: true, versiya: cur0.versiya };
    }
    if (kutilgan === 0) {                                       // yangi yozuv: faqat yo'q bo'lsa
      let r; try { r = await db.prepare('INSERT OR IGNORE INTO zaxira (id, ilova, blob, versiya, yangilangan, oxirgi) VALUES (?, ?, ?, 1, ?, ?)').bind(id, ilova, blob, now, now).run(); }
      catch (e) { r = await db.prepare('INSERT OR IGNORE INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (?, ?, ?, 1, ?)').bind(id, ilova, blob, now).run(); }          // muddat ustunlari (zaxira-muddat.sql) hali yo'q — eski yozuv
      if (changes(r) === 1) return { ok: true, versiya: 1 };
    } else {                                                    // yangilash: versiya hali o'sha bo'lsa (boshqa qurilma yozib ulgurmagan)
      let r; try { r = await db.prepare('UPDATE zaxira SET blob = ?, versiya = versiya + 1, yangilangan = ?, oxirgi = ?, ogoh = NULL WHERE id = ? AND ilova = ? AND versiya = ?').bind(blob, now, now, id, ilova, kutilgan).run(); }
      catch (e) { r = await db.prepare('UPDATE zaxira SET blob = ?, versiya = versiya + 1, yangilangan = ? WHERE id = ? AND ilova = ? AND versiya = ?').bind(blob, now, id, ilova, kutilgan).run(); }
      if (changes(r) === 1) return { ok: true, versiya: kutilgan + 1 };
    }
    const cur = await get(id); return { ok: false, versiya: cur ? cur.versiya : 0 };
  }
  async function del(id) { return changes(await db.prepare('DELETE FROM zaxira WHERE id = ?').bind(id).run()) > 0; }
  async function count() { const r = await db.prepare('SELECT COUNT(*) AS c FROM zaxira').first(); return r ? r.c : 0; }
  async function holat(id, now) {
    let r; try { r = await db.prepare('SELECT yangilangan, ogoh FROM zaxira WHERE id = ?').bind(id).first(); } catch (e) { r = await db.prepare('SELECT yangilangan FROM zaxira WHERE id = ?').bind(id).first(); }
    if (!r) return null; try { await db.prepare('UPDATE zaxira SET oxirgi = ?, ogoh = NULL WHERE id = ?').bind(now, id).run(); } catch (e) {}
    return { yangilangan: r.yangilangan, ogoh: r.ogoh || 0 };
  }
  const muddat = (now, quruq) => muddatQoida(db, now, quruq);
  async function delAkkaunt(akkauntId) {                             // konvert rejimi: akkaunt_ilova.zaxira_id → zaxira darhol o'chadi (qat'iy rejimda bog'lanish yo'q — mijoz o'zi o'chiradi)
    let n = 0; const rows = (await db.prepare('SELECT zaxira_id FROM akkaunt_ilova WHERE akkaunt_id = ? AND zaxira_id IS NOT NULL').bind(akkauntId).all()).results || [];
    for (const x of rows) n += changes(await db.prepare('DELETE FROM zaxira WHERE id = ?').bind(x.zaxira_id).run()); return n;
  }
  return { get, put, del, count, holat, muddat, delAkkaunt };
}
