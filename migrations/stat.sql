-- KalkiFit anonim statistika (D1 binding: KALKIFIT_DB). Qayta yurgizish xavfsiz (IF NOT EXISTS). API: functions/api/stat.js, admin: admin/kalkifit-statistika.html.
-- SHAXSIY MA'LUMOT YO'Q: ism, email, IP, ovqat yozuvlari, vazn, yosh — saqlanmaydi. Qurilma = SHA-256(server sirli tuz + mijoz_id) ning 16 belgisi (xom mijoz_id saqlanmaydi).
-- Kunlik qurilma qatorlari (stat_qurilma) 35 kundan keyin o'chadi; undan oldin yig'ma (stat_yig) ga ko'chiriladi — faqat sonlar qoladi.
CREATE TABLE IF NOT EXISTS stat_qurilma (
  kun TEXT NOT NULL,             -- YYYY-MM-DD (Toshkent)
  q TEXT NOT NULL,               -- qurilma xeshi (16 hex)
  platforma TEXT NOT NULL,       -- veb | android | ios-pwa
  til TEXT NOT NULL,             -- uz | cyr | ru
  yangi INTEGER NOT NULL DEFAULT 0,   -- shu kuni «yangi_foydalanuvchi» yuborgan
  n INTEGER NOT NULL DEFAULT 0,       -- shu kungi hodisalar soni (rate-limit: kuniga ≤ 400)
  PRIMARY KEY (kun, q)
);
CREATE INDEX IF NOT EXISTS stat_qurilma_q ON stat_qurilma (q);
CREATE TABLE IF NOT EXISTS stat_kun (      -- hodisalar yig'indisi (doimiy): kun + hodisa + qo'shimcha kalit (usul/manba/tur/hamkor/natija) + platforma
  kun TEXT NOT NULL, hodisa TEXT NOT NULL, kalit TEXT NOT NULL DEFAULT '', platforma TEXT NOT NULL DEFAULT '', son INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kun, hodisa, kalit, platforma)
);
CREATE TABLE IF NOT EXISTS stat_yig (      -- 35 kundan eski kunlar uchun qurilma sonlari (DAU, yangi) — qurilma qatorlari o'chirilgandan keyin ham qoladi
  kun TEXT NOT NULL, platforma TEXT NOT NULL, til TEXT NOT NULL, dau INTEGER NOT NULL DEFAULT 0, yangi INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (kun, platforma, til)
);
