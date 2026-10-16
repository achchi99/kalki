/* kalki.uz — Zaxira (bulutga saqlash) SAQLASH QATLAMI. D1'ga bog'liq BARCHA kod faqat shu faylda.
 * Boshqa bazaga (Postgres va h.k.) o'tish = faqat shu faylni almashtirish: quyidagi 4 funksiya (get, put, del, count) va bir xil qaytish shakli yetarli.
 * Jadval: zaxira (id TEXT PK, ilova, blob, versiya, yangilangan) — migrations/zaxira.sql. Server FAQAT shifrlangan blob va id'ni ko'radi.
 *
 * Shartnoma (api/zaxira.js shunga tayanadi):
 *   get(id)                                  → { id, ilova, blob, versiya, yangilangan } | null
 *   put(id, ilova, blob, kutilgan, now)      → { ok: true, versiya } | { ok: false, versiya }   (kutilgan = mijoz bilgan versiya, yangi yozuv uchun 0; mos kelmasa — ok:false, hech narsa yozilmaydi)
 *   del(id)                                  → true | false (o'chirildi / topilmadi)
 *   count()                                  → yozuvlar soni (monitoring uchun) */
export function makeStore(env) {
  const db = env && env.KALKIFIT_DB;
  if (!db) return null;
  const changes = (r) => (r && r.meta && r.meta.changes) || 0;
  async function get(id) { return (await db.prepare('SELECT id, ilova, blob, versiya, yangilangan FROM zaxira WHERE id = ?').bind(id).first()) || null; }
  async function put(id, ilova, blob, kutilgan, now) {
    if (kutilgan === 0) {                                       // yangi yozuv: faqat yo'q bo'lsa
      const r = await db.prepare('INSERT OR IGNORE INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES (?, ?, ?, 1, ?)').bind(id, ilova, blob, now).run();
      if (changes(r) === 1) return { ok: true, versiya: 1 };
    } else {                                                    // yangilash: versiya hali o'sha bo'lsa (boshqa qurilma yozib ulgurmagan)
      const r = await db.prepare('UPDATE zaxira SET blob = ?, versiya = versiya + 1, yangilangan = ? WHERE id = ? AND ilova = ? AND versiya = ?').bind(blob, now, id, ilova, kutilgan).run();
      if (changes(r) === 1) return { ok: true, versiya: kutilgan + 1 };
    }
    const cur = await get(id); return { ok: false, versiya: cur ? cur.versiya : 0 };
  }
  async function del(id) { return changes(await db.prepare('DELETE FROM zaxira WHERE id = ?').bind(id).run()) > 0; }
  async function count() { const r = await db.prepare('SELECT COUNT(*) AS c FROM zaxira').first(); return r ? r.c : 0; }
  return { get, put, del, count };
}
