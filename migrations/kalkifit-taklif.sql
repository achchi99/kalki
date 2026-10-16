-- KalkiFit: umumiy ovqatlar bazasi navbati (Cloudflare D1, binding: KALKIFIT_DB).
-- Yaratish:  npx wrangler d1 create kalkifit-taklif   →  Pages loyihasi Settings → Functions → D1 bindings: KALKIFIT_DB
-- Qo'llash:  npx wrangler d1 execute kalkifit-taklif --remote --file=migrations/kalkifit-taklif.sql
-- Admin parol (secret):  npx wrangler pages secret put KALKIFIT_ADMIN_PASSWORD
-- Shaxsiy ma'lumot YO'Q: faqat ovqat nomi, porsiya matni, kkal/makro, til, sanalar.
CREATE TABLE IF NOT EXISTS taklif (
  h        TEXT PRIMARY KEY,           -- normalizatsiya qilingan nomning SHA-256 xeshi (16 belgi)
  nom      TEXT NOT NULL,              -- birinchi kelgan nom
  til      TEXT NOT NULL DEFAULT 'uz', -- uz | ru | kirill
  porsiya  TEXT NOT NULL DEFAULT '',
  jami     INTEGER NOT NULL DEFAULT 0, -- jami necha marta yuborilgan
  kunlar   INTEGER NOT NULL DEFAULT 0, -- necha TURLI kunda
  kcal_sum REAL NOT NULL DEFAULT 0,    -- o'rtacha = sum / jami
  o_sum    REAL NOT NULL DEFAULT 0,
  y_sum    REAL NOT NULL DEFAULT 0,
  u_sum    REAL NOT NULL DEFAULT 0,
  holat    TEXT NOT NULL DEFAULT 'yangi',  -- yangi | tasdiqlangan (3 kun) | maqullangan | rad
  g        REAL,                       -- admin: porsiya og'irligi (g), ma'qullashda majburiy
  kat      TEXT,                       -- admin: toifa (o,n,s,m,g,v,f,d,i,q,h,x)
  nom_uz   TEXT, nom_ru TEXT,          -- admin: yakuniy nomlar
  birinchi TEXT, oxirgi TEXT
);
CREATE TABLE IF NOT EXISTS taklif_kun (
  h TEXT NOT NULL, kun TEXT NOT NULL, PRIMARY KEY (h, kun)
);
CREATE INDEX IF NOT EXISTS taklif_holat ON taklif (holat, kunlar);
