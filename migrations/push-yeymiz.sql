-- «Baliq kuni» eslatmasi: «Baliq yoqtirmayman» (baliqsiz=1 — eslatma yuborilmaydi) va «Boshqa kun» (kun: 0=dushanba … 6=yakshanba, standart 3=payshanba).
-- DIQQAT: ALTER TABLE ... ADD COLUMN bir marta yurgiziladi (SQLite'da IF NOT EXISTS yo'q); ikkinchi marta "duplicate column" xatosi — zararsiz.
ALTER TABLE push_obuna ADD COLUMN baliqsiz INTEGER NOT NULL DEFAULT 0;
ALTER TABLE push_obuna ADD COLUMN kun INTEGER NOT NULL DEFAULT 3;
