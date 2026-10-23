/* kalki.uz — Akkaunt SAQLASH QATLAMI. D1'ga bog'liq BARCHA akkaunt kodi faqat shu faylda (zaxira-store.js namunasida).
 * Boshqa bazaga (Postgres/VPS) o'tish = faqat shu faylni almashtirish: quyidagi funksiyalar va BIR XIL qaytish shakli yetarli. Batafsil: docs/akkaunt-kochirish.md.
 * Jadvallar: migrations/akkaunt.sql. Vaqtlar millisekund. Tasodifiylik (ID, token) bu yerda EMAS — chaqiruvchi beradi, shuning uchun qatlam sof SQL.
 *
 * Shartnoma (api/akkaunt/[amal].js shunga tayanadi):
 *   ping()                                      → true | xato tashlaydi (jadvallar tayyormi)
 *   akkauntEmail(email) / akkauntId(id)         → { id, email, usul, yaratilgan, oxirgi_kirish, marketing, marketing_vaqt, marketing_matn_v, ism, ism_qolda } | null
 *   akkauntYarat({ id, email, usul, now })      → true | false (email band bo'lsa — poyga holati)
 *   kirishBelgila(id, now)                      → oxirgi_kirish yangilanadi
 *   ismYoz(id, ism, qolda)                      → qolda=true: foydalanuvchi yozdi (ism_qolda=1); false: Google ismi — faqat ism_qolda=0 bo'lsa yoziladi
 *   marketingYoz(id, rozi, now, matnV)          → true | false
 *   kodYoz({ email, maqsad, hash, now, muddat })→ eski ishlatilmagan kodlar bekor, yangisi yoziladi
 *   kodTekshir({ email, maqsad, hash, now, maxUrinish }) → 'ok' | 'yoq' (faol kod yo'q/eskirgan/ishlatilgan) | 'qulf' (urinish tugadi) | 'xato' (kod noto'g'ri)
 *   sessiyaYarat({ id, akkauntId, now, muddatAbs, qurilma }) / sessiyaOl(id) → { id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma } | null
 *   sessiyaYangila(id, now) / sessiyaOchir(id) → true|false / sessiyalar(akkauntId) → [..] / sessiyaOchirHammasi(akkauntId, saqla?) → soni
 *   limit(kalit, oynaMs, lim, now)              → { ok, soni, qayta }   (qayta = oyna tugashigacha ms; hisoblagich har chaqiruvda +1)
 *   ilovalar(akkauntId) → [{ ilova, rejim, master_v, ulangan, konvert_bor }]   ilovaOl(akkauntId, ilova) → to'liq qator (kod_konvert bilan) | null
 *   ilovaYoz({ akkauntId, ilova, zaxiraId, konvert, rejim, masterV, now }) → 'ok' | 'band' (zaxira boshqa akkauntga ulangan)   ilovaKonvert(akkauntId, ilova, konvert, masterV) / ilovaOchir(akkauntId, ilova)
 *   eskiKonvertlar(joriyV, limit) → { qatorlar: [{ akkaunt_id, ilova, kod_konvert, master_v }], qoldi }   (kalit almashtirish: qayta o'rash uchun)
 *   devYoz(email, kod, maqsad, now) / devOl(email, now) → FAQAT preview dev rejimi (jadval `dev_kod` shu yerda, birinchi chaqiruvda yaratiladi; production'da hech qachon chaqirilmaydi va jadval ochilmaydi)
 *   audit(akkauntId, hodisa, now)
 *   akkauntOchir(id, email)                     → akkaunt, sessiyalar, kodlar va audit qatorlari BUTUNLAY o'chadi
 *   yuklab(id)                                  → { akkaunt, sessiyalar: [...] }  (foydalanuvchi o'z ma'lumotini yuklab olishi uchun)
 *   tozala(now)                                 → eskirgan kod/sessiya/limit qatorlari o'chadi
 *   sanoq()                                     → { akkaunt, sessiya } (monitoring) */
export function makeStore(env) {
  const db = env && env.KALKIFIT_DB;
  if (!db) return null;
  const changes = (r) => (r && r.meta && r.meta.changes) || 0;
  const AK = 'id, email, usul, yaratilgan, oxirgi_kirish, marketing, marketing_vaqt, marketing_matn_v, ism, ism_qolda';
  const SE = 'id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma';
  const one = async (q, ...a) => (await db.prepare(q).bind(...a).first()) || null;
  const run = (q, ...a) => db.prepare(q).bind(...a).run();
  return {
    async ping() { await db.prepare('SELECT 1 FROM akkaunt_ilova LIMIT 1').first(); await db.prepare('SELECT 1 FROM akkaunt LIMIT 1').first(); await db.prepare('SELECT 1 FROM kirish_kodi LIMIT 1').first(); await db.prepare('SELECT 1 FROM sessiya LIMIT 1').first(); await db.prepare('SELECT 1 FROM limit_hisob LIMIT 1').first(); return true; },
    akkauntEmail: (email) => one('SELECT ' + AK + ' FROM akkaunt WHERE email = ?', email),
    akkauntId: (id) => one('SELECT ' + AK + ' FROM akkaunt WHERE id = ?', id),
    async akkauntYarat(o) { return changes(await run("INSERT OR IGNORE INTO akkaunt (id, email, usul, yaratilgan, oxirgi_kirish, marketing) VALUES (?, ?, ?, ?, ?, 0)", o.id, o.email, o.usul || 'email', o.now, o.now)) === 1; },
    async kirishBelgila(id, now) { await run('UPDATE akkaunt SET oxirgi_kirish = ? WHERE id = ?', now, id); },
    async ismYoz(id, ism, qolda) { return changes(qolda ? await run('UPDATE akkaunt SET ism = ?, ism_qolda = 1 WHERE id = ?', ism, id) : await run('UPDATE akkaunt SET ism = ? WHERE id = ? AND ism_qolda = 0', ism, id)) === 1; },
    async marketingYoz(id, rozi, now, matnV) { return changes(await run('UPDATE akkaunt SET marketing = ?, marketing_vaqt = ?, marketing_matn_v = ? WHERE id = ?', rozi ? 1 : 0, now, matnV || null, id)) === 1; },
    async kodYoz(o) {
      await run('UPDATE kirish_kodi SET ishlatilgan = 1 WHERE email = ? AND maqsad = ? AND ishlatilgan = 0', o.email, o.maqsad);
      await run('INSERT INTO kirish_kodi (email, maqsad, kod_hash, yaratilgan, muddat, urinish, ishlatilgan) VALUES (?, ?, ?, ?, ?, 0, 0)', o.email, o.maqsad, o.hash, o.now, o.muddat);
    },
    async kodTekshir(o) {
      const k = await one('SELECT id, kod_hash, urinish FROM kirish_kodi WHERE email = ? AND maqsad = ? AND ishlatilgan = 0 AND muddat > ? ORDER BY id DESC LIMIT 1', o.email, o.maqsad, o.now);
      if (!k) return 'yoq';
      if (changes(await run('UPDATE kirish_kodi SET urinish = urinish + 1 WHERE id = ? AND ishlatilgan = 0 AND urinish < ?', k.id, o.maxUrinish)) !== 1) return 'qulf';   // urinish AVVAL sanaladi (poyga: parallel taxminlar ham hisobga tushadi)
      if (!eq(k.kod_hash, o.hash)) return (k.urinish + 1 >= o.maxUrinish) ? 'qulf' : 'xato';
      return changes(await run('UPDATE kirish_kodi SET ishlatilgan = 1 WHERE id = ? AND ishlatilgan = 0', k.id)) === 1 ? 'ok' : 'yoq';   // bir martalik: parallel ikkinchi so'rov o'tmaydi
    },
    async sessiyaYarat(o) { await run('INSERT INTO sessiya (id, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma) VALUES (?, ?, ?, ?, ?, ?)', o.id, o.akkauntId, o.now, o.now, o.muddatAbs, o.qurilma || ''); },
    sessiyaOl: (id) => one('SELECT ' + SE + ' FROM sessiya WHERE id = ?', id),
    async sessiyaYangila(id, now) { return changes(await run('UPDATE sessiya SET oxirgi = ? WHERE id = ?', now, id)) === 1; },
    async sessiyaOchir(id) { return changes(await run('DELETE FROM sessiya WHERE id = ?', id)) > 0; },
    async sessiyalar(akkauntId) { return ((await db.prepare('SELECT ' + SE + ' FROM sessiya WHERE akkaunt_id = ? ORDER BY oxirgi DESC').bind(akkauntId).all()).results) || []; },
    async sessiyaOchirHammasi(akkauntId, saqla) { return changes(saqla ? await run('DELETE FROM sessiya WHERE akkaunt_id = ? AND id != ?', akkauntId, saqla) : await run('DELETE FROM sessiya WHERE akkaunt_id = ?', akkauntId)); },
    async limit(kalit, oynaMs, lim, now) {
      const bosh = now - oynaMs;                                // oyna tugagan bo'lsa — hisoblagich 1 dan boshlanadi
      const r = await one('INSERT INTO limit_hisob (kalit, soni, oyna_boshi) VALUES (?, 1, ?) ON CONFLICT(kalit) DO UPDATE SET soni = CASE WHEN oyna_boshi <= ? THEN 1 ELSE soni + 1 END, oyna_boshi = CASE WHEN oyna_boshi <= ? THEN ? ELSE oyna_boshi END RETURNING soni, oyna_boshi', kalit, now, bosh, bosh, now);
      const soni = r ? r.soni : 1, ob = r ? r.oyna_boshi : now;
      return { ok: soni <= lim, soni, qayta: Math.max(0, ob + oynaMs - now) };
    },
    async ilovalar(akkauntId) { return ((await db.prepare('SELECT ilova, rejim, master_v, ulangan, kod_konvert IS NOT NULL AS konvert_bor FROM akkaunt_ilova WHERE akkaunt_id = ? ORDER BY ilova').bind(akkauntId).all()).results) || []; },
    ilovaOl: (akkauntId, ilova) => one('SELECT akkaunt_id, ilova, zaxira_id, kod_konvert, rejim, master_v, ulangan FROM akkaunt_ilova WHERE akkaunt_id = ? AND ilova = ?', akkauntId, ilova),
    async ilovaYoz(o) {
      if (o.zaxiraId) { const b = await one('SELECT akkaunt_id FROM akkaunt_ilova WHERE zaxira_id = ?', o.zaxiraId); if (b && b.akkaunt_id !== o.akkauntId) return 'band'; }
      try {
        await run('INSERT INTO akkaunt_ilova (akkaunt_id, ilova, zaxira_id, kod_konvert, rejim, master_v, ulangan) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(akkaunt_id, ilova) DO UPDATE SET zaxira_id = excluded.zaxira_id, kod_konvert = excluded.kod_konvert, rejim = excluded.rejim, master_v = excluded.master_v, ulangan = excluded.ulangan',
          o.akkauntId, o.ilova, o.zaxiraId || null, o.konvert || null, o.rejim, o.masterV == null ? null : o.masterV, o.now);
      } catch (e) { return 'band'; }                           // UNIQUE(zaxira_id) poygasi
      return 'ok';
    },
    async ilovaKonvert(akkauntId, ilova, konvert, masterV) { return changes(await run('UPDATE akkaunt_ilova SET kod_konvert = ?, master_v = ? WHERE akkaunt_id = ? AND ilova = ? AND rejim = ?', konvert, masterV, akkauntId, ilova, 'konvert')) === 1; },
    async ilovaOchir(akkauntId, ilova) { return changes(await run('DELETE FROM akkaunt_ilova WHERE akkaunt_id = ? AND ilova = ?', akkauntId, ilova)) > 0; },
    async eskiKonvertlar(joriyV, limit) {
      const q = ((await db.prepare('SELECT akkaunt_id, ilova, kod_konvert, master_v FROM akkaunt_ilova WHERE kod_konvert IS NOT NULL AND (master_v IS NULL OR master_v != ?) ORDER BY akkaunt_id, ilova LIMIT ?').bind(joriyV, limit).all()).results) || [];
      const c = await one('SELECT COUNT(*) AS c FROM akkaunt_ilova WHERE kod_konvert IS NOT NULL AND (master_v IS NULL OR master_v != ?)', joriyV);
      return { qatorlar: q, qoldi: c ? c.c : 0 };
    },
    async devYoz(email, kod, maqsad, now) {                    // KV emas, D1: yozuvdan keyin o'qish darhol izchil (KV eventual consistency eskirgan kodni qaytarardi)
      await db.prepare('CREATE TABLE IF NOT EXISTS dev_kod (email TEXT PRIMARY KEY, kod TEXT NOT NULL, maqsad TEXT NOT NULL, vaqt INTEGER NOT NULL)').run();
      await run('INSERT INTO dev_kod (email, kod, maqsad, vaqt) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET kod = excluded.kod, maqsad = excluded.maqsad, vaqt = excluded.vaqt', email, kod, maqsad, now);
    },
    async devOl(email, now) { try { return await one('SELECT kod, maqsad, vaqt FROM dev_kod WHERE email = ? AND vaqt > ?', email, now - 600000); } catch (e) { return null; } },
    async audit(akkauntId, hodisa, now) { await run('INSERT INTO audit (vaqt, akkaunt_id, hodisa) VALUES (?, ?, ?)', now, akkauntId || null, hodisa); },
    async akkauntOchir(id, email) {
      await run('DELETE FROM akkaunt_ilova WHERE akkaunt_id = ?', id); await run('DELETE FROM sessiya WHERE akkaunt_id = ?', id); await run('DELETE FROM kirish_kodi WHERE email = ?', email); await run('DELETE FROM audit WHERE akkaunt_id = ?', id);
      return changes(await run('DELETE FROM akkaunt WHERE id = ?', id)) > 0;
    },
    async yuklab(id) { return { akkaunt: await one('SELECT ' + AK + ' FROM akkaunt WHERE id = ?', id), sessiyalar: await this.sessiyalar(id), ilovalar: await this.ilovalar(id) }; },
    async tozala(now) {
      await run('DELETE FROM kirish_kodi WHERE muddat < ?', now - 86400000); await run('DELETE FROM sessiya WHERE muddat_abs < ?', now);
      await run('DELETE FROM sessiya WHERE oxirgi < ?', now - 30 * 86400000); await run('DELETE FROM limit_hisob WHERE oyna_boshi < ?', now - 2 * 86400000);
    },
    async sanoq() { return { akkaunt: (await one('SELECT COUNT(*) AS c FROM akkaunt')).c, sessiya: (await one('SELECT COUNT(*) AS c FROM sessiya')).c }; }
  };
}
function eq(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }   // doimiy vaqtli taqqoslash
