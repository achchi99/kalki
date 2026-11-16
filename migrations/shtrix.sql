-- KalkiFit v79: SHTRIX-KOD skaneri (Cloudflare D1, binding: KALKIFIT_DB).
-- Qo'llash (avval production zaxirasi ~/backups/ ga):  npx wrangler d1 execute kalkifit --remote --file=migrations/shtrix.sql
--   keyin (bir marta):  ALTER TABLE yorliq_taklif ADD COLUMN kod TEXT;   — migrations/shtrix-yorliq-kod.sql (takroriy ishga tushirilsa «duplicate column» — zararsiz)
-- OFF (Open Food Facts) ma'lumoti BU JADVALGA YOZILMAYDI (ODbL share-alike: docs/shtrix-skaner.md) — u faqat alohida KV keshda. Bu jadval: o'zimiz tasdiqlagan / foydalanuvchilar yorlig'idan (≥2 bir xil taklif) / admin qo'shgan mahsulotlar.
CREATE TABLE IF NOT EXISTS shtrix_mahsulot (
  kod          TEXT PRIMARY KEY,           -- EAN-13 (UPC-A oldiga 0 qo'shilgan) yoki EAN-8
  nom          TEXT NOT NULL,
  brend        TEXT NOT NULL DEFAULT '',
  kcal         REAL NOT NULL,              -- 100 g (ml) uchun
  oqsil        REAL NOT NULL DEFAULT 0,
  yog          REAL NOT NULL DEFAULT 0,
  uglevod      REAL NOT NULL DEFAULT 0,
  qadoq        INTEGER NOT NULL DEFAULT 0, -- qadoq og'irligi (g yoki ml), 0 — noma'lum
  porsiya      INTEGER NOT NULL DEFAULT 0,
  birlik       TEXT NOT NULL DEFAULT 'g',  -- g | ml
  manba        TEXT NOT NULL DEFAULT 'admin',  -- admin | yorliq (≥2 bir xil foydalanuvchi taklifi) | oz
  tasdiqlangan INTEGER NOT NULL DEFAULT 0, -- 1 — admin tasdiqlagan
  yaratildi    TEXT, yangilandi TEXT
);
-- topilmagan kodlar (faqat raqam + sanagich; shaxsiy ma'lumot yo'q) — admin «Shtrix-kod» kartasi: eng ko'p topilmaganlar
CREATE TABLE IF NOT EXISTS shtrix_topilmadi (
  kod TEXT PRIMARY KEY, soni INTEGER NOT NULL DEFAULT 0, birinchi TEXT, oxirgi TEXT
);
CREATE INDEX IF NOT EXISTS shtrix_topilmadi_soni ON shtrix_topilmadi (soni);

-- v79: taklif ovozlari — mahsulot hamma uchun FAQAT ≥ 2 HAR XIL Google akkauntdan bir xil (kod + nom + kkal) taklif kelganda o'tadi. Mehmon takliflari bu jadvalga yozilmaydi (faqat admin navbati).
-- Shaxsiy ma'lumot: faqat tasodifiy akkaunt id (email emas); akkaunt o'chirilsa qatorlar ham o'chadi (akkaunt-store).
CREATE TABLE IF NOT EXISTS shtrix_taklif_akk (
  h TEXT NOT NULL, akkaunt_id TEXT NOT NULL, kun TEXT,
  PRIMARY KEY (h, akkaunt_id)
);
