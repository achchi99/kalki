-- KalkiFit: Bahroma «Medovik» (plombir, yong'oqli, pinta 320 g) shtrix-kodi → o'z jadvalimizga (do'kon sahifasidagi qadoq yorlig'i: p24.by / Perekrestok).
-- Yorliq (100 g): 280 kkal, oqsil 4,3, yog' 15,3, uglevod 31 — data/manba/yorliq.json «bahroma-medovik-pinta» (Atwater 279 kkal). Open Food Facts qiymati (310/4,7/17,8/30,5 — foydalanuvchi kiritgan) ISHLATILMAYDI.
-- Qo'llash (avval ~/backups ga zaxira):  npx wrangler d1 execute kalkifit --remote --file=migrations/shtrix-bahroma-medovik.sql
INSERT OR REPLACE INTO shtrix_mahsulot (kod, nom, brend, kcal, oqsil, yog, uglevod, qadoq, porsiya, birlik, manba, tasdiqlangan, yaratildi, yangilandi)
VALUES ('4870233467477', 'Bahroma Medovik (plombir, yong''oqli, pinta)', 'Bahroma', 280, 4.3, 15.3, 31, 320, 0, 'g', 'admin', 1, datetime('now'), datetime('now'));
