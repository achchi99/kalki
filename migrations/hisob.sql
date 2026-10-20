-- KalkiFit anonim hisoblagichlar (D1 binding: KALKIFIT_DB). Shu fayl qayta yurgizilsa xavfsiz (IF NOT EXISTS).
-- FAQAT yig'indi: kun + hodisa nomi + son. Foydalanuvchi id, IP, qurilma, taom nomi, kkal — YO'Q.
CREATE TABLE IF NOT EXISTS hisob_kun (
  sana TEXT NOT NULL,            -- YYYY-MM-DD (Toshkent kuni)
  hodisa TEXT NOT NULL,          -- ruxsat etilgan ro'yxatdan (functions/api/hisob.js)
  son INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (sana, hodisa)
);
