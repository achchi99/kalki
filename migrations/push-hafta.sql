-- kalki.uz — «Haftalik xulosa» eslatmasi (yakshanba 19:00 Toshkent; tools/push-yubor.js --xulosa). Obuna egasi Profilda o'chirsa — hafta = 0.
-- Yurgizish: npx wrangler d1 execute kalkifit --remote --file migrations/push-hafta.sql  (avval zaxira: ~/backups/)
ALTER TABLE push_obuna ADD COLUMN hafta INTEGER NOT NULL DEFAULT 1;
ALTER TABLE push_obuna ADD COLUMN oxirgi_xulosa TEXT;
