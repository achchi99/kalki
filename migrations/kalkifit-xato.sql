-- KalkiFit v78: «Xato topdingizmi?» — taom kartasidan kelgan ANONIM xato xabarlari (Cloudflare D1, binding: KALKIFIT_DB).
-- Qo'llash (avval production zaxirasi ~/backups/ ga):  npx wrangler d1 execute kalkifit --remote --file=migrations/kalkifit-xato.sql
-- Shaxsiy ma'lumot YO'Q: faqat taom id'si, nima noto'g'ri (kkal/porsiya/nom), ixtiyoriy qisqa izoh, til, sanalar. mijoz_id/IP saqlanmaydi.
CREATE TABLE IF NOT EXISTS xato_xabar (
  h        TEXT PRIMARY KEY,           -- SHA-256(taom id | variant | turi) ning 16 belgisi: bir xil taom va turdagi xabarlar bitta qatorda yig'iladi
  taom     TEXT NOT NULL,              -- baza id (masalan: kofe, qurt)
  vr       TEXT NOT NULL DEFAULT '',   -- oila varianti (bo'lsa)
  turi     TEXT NOT NULL,              -- k (kkal) | p (porsiya) | n (nom) — vergul bilan
  izoh     TEXT NOT NULL DEFAULT '',   -- oxirgi izoh (≤ 200 belgi, ixtiyoriy)
  til      TEXT NOT NULL DEFAULT 'uz',
  jami     INTEGER NOT NULL DEFAULT 0,
  holat    TEXT NOT NULL DEFAULT 'yangi',  -- yangi | korildi
  birinchi TEXT, oxirgi TEXT
);
CREATE INDEX IF NOT EXISTS xato_holat ON xato_xabar (holat, jami);
