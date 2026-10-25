-- KalkiFit admin statistikasi v2 (D1: KALKIFIT_DB). MAVJUD baza uchun: ALTER TABLE ... ADD COLUMN bir marta yurgiziladi (SQLite'da IF NOT EXISTS yo'q; ikkinchi marta «duplicate column» — zararsiz).
-- Yurgizish: npx wrangler d1 execute kalkifit --remote --file migrations/admin-stat.sql  (avval zaxira: ~/backups/). Kod deploy'idan OLDIN.
-- 1) Anonim qurilma TURI (User-Agent'dan serverda aniqlanadi; functions/_lib/qurilma-tur.js): tur, OS, brauzer, model (UA bergan bo'lsa), ekran kengligi guruhi, APK versiyasi.
--    IP va aniq joylashuv YO'Q; qurilma — avvalgidek tuzli xesh. Qatorlar 100 kundan keyin o'chadi (stat.js KEEP_DAYS).
ALTER TABLE stat_qurilma ADD COLUMN tur TEXT NOT NULL DEFAULT '';
ALTER TABLE stat_qurilma ADD COLUMN os TEXT NOT NULL DEFAULT '';
ALTER TABLE stat_qurilma ADD COLUMN br TEXT NOT NULL DEFAULT '';
ALTER TABLE stat_qurilma ADD COLUMN model TEXT NOT NULL DEFAULT '';
ALTER TABLE stat_qurilma ADD COLUMN ekran TEXT NOT NULL DEFAULT '';
ALTER TABLE stat_qurilma ADD COLUMN ver TEXT NOT NULL DEFAULT '';
-- 2) Admin kirishlar jurnali (functions/_lib/admin-auth.js): vaqt, muvaffaqiyat, usul (brauzer | sarlavha | blok), IP faqat QISQARTIRILGAN (185.213.x.x).
CREATE TABLE IF NOT EXISTS admin_kirish (id INTEGER PRIMARY KEY AUTOINCREMENT, vaqt INTEGER NOT NULL, ok INTEGER NOT NULL, usul TEXT NOT NULL DEFAULT '', ip TEXT NOT NULL DEFAULT '');
CREATE INDEX IF NOT EXISTS admin_kirish_vaqt ON admin_kirish (vaqt);
