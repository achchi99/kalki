-- KalkiFit v67: «Yorliqdan qo'shish» — foydalanuvchi tasdiqlagan QADOQ YORLIG'I takliflari (Cloudflare D1, binding: KALKIFIT_DB).
-- Qo'llash (avval production zaxirasi ~/backups/ ga):  npx wrangler d1 execute kalkifit --remote --file=migrations/yorliq.sql
-- Shaxsiy ma'lumot YO'Q: faqat mahsulot nomi va 100 g uchun raqamlar (rasm hech qachon yuborilmaydi), til, manba turi (rasm/qo'lda), sanalar.
CREATE TABLE IF NOT EXISTS yorliq_taklif (
  h        TEXT PRIMARY KEY,           -- SHA-256(normalizatsiya qilingan nom | kkal) ning 16 belgisi: bir xil nom VA qiymat — bitta qator
  kalit    TEXT NOT NULL,              -- normalizatsiya qilingan nom (bir xil nom, boshqa qiymat — admin sahifasida guruhlanadi)
  nom      TEXT NOT NULL,              -- birinchi kelgan nom
  til      TEXT NOT NULL DEFAULT 'uz',
  kcal     INTEGER NOT NULL,           -- 100 g (ml) uchun
  o_sum    REAL NOT NULL DEFAULT 0,    -- o'rtacha = sum / jami
  y_sum    REAL NOT NULL DEFAULT 0,
  u_sum    REAL NOT NULL DEFAULT 0,
  g        INTEGER NOT NULL DEFAULT 0, -- qadoq yoki porsiya og'irligi (ixtiyoriy, oxirgi kelgani)
  birlik   TEXT NOT NULL DEFAULT 'g',  -- g | ml
  jami     INTEGER NOT NULL DEFAULT 0, -- necha marta yuborilgan
  rasm     INTEGER NOT NULL DEFAULT 0, -- shundan: yorliq suratidan (AI o'qigan, foydalanuvchi tasdiqlagan)
  holat    TEXT NOT NULL DEFAULT 'yangi',  -- yangi | qoshildi (umumiy bazada) | rad
  kat      TEXT, nom_uz TEXT, nom_ru TEXT, -- admin: toifa va yakuniy nomlar (qo'shishda)
  birinchi TEXT, oxirgi TEXT
);
CREATE INDEX IF NOT EXISTS yorliq_holat ON yorliq_taklif (holat, jami);
CREATE INDEX IF NOT EXISTS yorliq_kalit ON yorliq_taklif (kalit);
