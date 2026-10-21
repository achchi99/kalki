-- KalkiFit: qidiruvda TOPILMAGAN so'zlar (D1 binding: KALKIFIT_DB). Qayta yurgizish xavfsiz (IF NOT EXISTS).
-- FAQAT yig'indi: kun + so'z (qidiruv matni, tozalangan) + son. Foydalanuvchi id, IP, qurilma, cookie — YO'Q.
CREATE TABLE IF NOT EXISTS qidiruv_topilmadi (
  sana TEXT NOT NULL,            -- YYYY-MM-DD (Toshkent kuni)
  soz TEXT NOT NULL,             -- functions/api/qidiruv.js tozalagan matn (2–40 belgi, harf bor, raqam ≤ 4, @ / URL yo'q)
  son INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (sana, soz)
);
