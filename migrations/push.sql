-- KalkiFit «Baliq kuni» eslatmasi (Web Push). D1 binding: KALKIFIT_DB. Shu fayl qayta yurgizilsa xavfsiz (IF NOT EXISTS).
-- Obuna: brauzer bergan endpoint + ochiq kalitlar (parol emas). Ixtiyoriy: akkaunt_id (sessiya bo'lsa) — faqat «--test <email>» va o'chirish uchun.
CREATE TABLE IF NOT EXISTS push_obuna (
  id TEXT PRIMARY KEY,                           -- SHA-256(endpoint), hex
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  til TEXT NOT NULL DEFAULT 'uz',                -- 'uz' | 'cyr' | 'ru'
  akkaunt_id TEXT,                               -- ixtiyoriy (kirgan foydalanuvchi)
  yaratilgan INTEGER NOT NULL,
  oxirgi_hafta TEXT,                             -- eng oxirgi yuborilgan hafta (YYYY-Www): haftada 1 tadan ko'p yuborilmaydi
  xato INTEGER NOT NULL DEFAULT 0                -- ketma-ket muvaffaqiyatsiz urinishlar
);
CREATE INDEX IF NOT EXISTS push_obuna_akkaunt ON push_obuna (akkaunt_id);
-- Oxirgi yuborish natijasi (admin ko'radi): kalit 'oxirgi' → JSON { vaqt, hafta, yuborildi, xato, ochirildi, test }
CREATE TABLE IF NOT EXISTS push_holat (kalit TEXT PRIMARY KEY, qiymat TEXT NOT NULL, yangilangan INTEGER NOT NULL);
