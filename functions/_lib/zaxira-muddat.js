/* kalki.uz — bulut zaxira SAQLASH MUDDATI qoidasi (BITTA joy; zaxira-store.js va tools/zaxira-muddat.js shuni ishlatadi).
 *   12 oy (YIL_MS) hech qanday sinxron bo'lmasa → ogoh = hozir (ilova ochilganda bir martalik ogohlantirish chiqadi va u sinxron hisoblanadi → ogoh bekor);
 *   ogohlantirishdan 30 kun (OGOH_MS) o'tib ham sinxron bo'lmasa → zaxira (va unga bog'langan akkaunt konverti) O'CHADI.
 * run(sql, params) → qatorlar massivi (SELECT) yoki o'zgargan qatorlar soni bilan { changes } — chaqiruvchi beradi (D1 binding yoki REST). */
export const YIL_MS = 365 * 86400000, OGOH_MS = 30 * 86400000;
export async function muddat(db, now, quruq) {
  const out = { ogoh: 0, ochirildi: 0 }, ch = (r) => (r && r.meta && r.meta.changes) || 0;
  const eski = await db.prepare('SELECT COUNT(*) AS c FROM zaxira WHERE ogoh IS NULL AND COALESCE(oxirgi, yangilangan) < ?').bind(now - YIL_MS).first();
  const ochadi = await db.prepare('SELECT id FROM zaxira WHERE ogoh IS NOT NULL AND ogoh < ? AND COALESCE(oxirgi, yangilangan) < ogoh').bind(now - OGOH_MS).all();
  const ids = (ochadi.results || []).map((r) => r.id);
  if (quruq) return { ogoh: (eski && eski.c) || 0, ochirildi: ids.length, quruq: true };
  out.ochirildi = 0;
  for (const id of ids) {                                   // avval bog'langan akkaunt konverti (jadval bo'lmasa — o'tkazib yuboriladi), keyin zaxira
    try { await db.prepare('DELETE FROM akkaunt_ilova WHERE zaxira_id = ?').bind(id).run(); } catch (e) {}
    out.ochirildi += ch(await db.prepare('DELETE FROM zaxira WHERE id = ?').bind(id).run());
  }
  out.ogoh = ch(await db.prepare('UPDATE zaxira SET ogoh = ? WHERE ogoh IS NULL AND COALESCE(oxirgi, yangilangan) < ?').bind(now, now - YIL_MS).run());
  return out;
}
