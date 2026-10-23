-- KalkiFit Profil: foydalanuvchi ismi (Google ismi yoki o'zi yozgan). MAVJUD baza uchun (yangi bazada ustunlar akkaunt.sql da bor).
-- DIQQAT: ALTER TABLE ... ADD COLUMN bir marta yurgiziladi (SQLite'da IF NOT EXISTS yo'q); ikkinchi marta "duplicate column" xatosi — zararsiz.
-- Yurgizish: npx wrangler d1 execute kalkifit --remote --file migrations/akkaunt-ism.sql  (avval zaxira: ~/backups/). Kod deploy'idan OLDIN.
ALTER TABLE akkaunt ADD COLUMN ism TEXT;
ALTER TABLE akkaunt ADD COLUMN ism_qolda INTEGER NOT NULL DEFAULT 0;
