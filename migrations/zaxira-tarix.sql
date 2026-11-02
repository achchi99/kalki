-- KalkiFit v70: bulut zaxira VERSIYALAR TARIXI (tiklash uchun). Har yangilashda oldingi versiya shu jadvalga tushadi; oxirgi 20 versiya + oxirgi 30 kun uchun har kunning oxirgi versiyasi saqlanadi.
-- Qo'llash (AVVAL production zaxirasi ~/backups/ ga):  npx wrangler d1 execute kalkifit --remote --file migrations/zaxira-tarix.sql   (kod deploy'idan OLDIN yoki keyin — kod jadval yo'q bo'lsa tarixsiz ishlayveradi)
CREATE TABLE IF NOT EXISTS zaxira_tarix (id TEXT NOT NULL, versiya INTEGER NOT NULL, blob TEXT NOT NULL, yangilangan INTEGER NOT NULL, PRIMARY KEY (id, versiya));
CREATE INDEX IF NOT EXISTS zaxira_tarix_vaqt ON zaxira_tarix (yangilangan);
