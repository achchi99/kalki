-- KalkiFit anonim statistika v61: MANBA (qayerdan keldi) va onboarding tugadimi. MAVJUD baza uchun: ALTER TABLE bir marta yurgiziladi (SQLite'da IF NOT EXISTS yo'q; ikkinchi marta «duplicate column» — zararsiz).
-- Yurgizish: npx wrangler d1 execute kalkifit --remote --file migrations/manba.sql  (AVVAL zaxira: npx wrangler d1 export kalkifit --remote --output ~/backups/...). Kod deploy'idan OLDIN
-- (yurgizilmagan bo'lsa ham statistika to'xtamaydi — functions/api/stat.js eski INSERT'ga qaytadi, lekin «Manbalar» jadvali bo'sh qoladi).
-- SHAXSIY MA'LUMOT YO'Q: manba — faqat qisqa kod (x | tg | ig | yt | google | fb | sayt | dir | boshqa); to'liq URL, domen yo'li, utm matni saqlanmaydi.
ALTER TABLE stat_qurilma ADD COLUMN manba TEXT NOT NULL DEFAULT '';         -- «yangi_foydalanuvchi» yuborgan qurilma qatorida: manba kodi (boshqa qatorlarda bo'sh)
ALTER TABLE stat_qurilma ADD COLUMN ob INTEGER NOT NULL DEFAULT 0;          -- shu kuni «onboarding_tugadi» yuborgan (1) yoki «Keyinroq» (0)
CREATE INDEX IF NOT EXISTS stat_qurilma_manba ON stat_qurilma (manba, kun);
