-- KalkiFit v71.1: zaxira.yozuv — oxirgi yozilgan nusxadagi yozuvlar soni (mijoz da'vosi). Server yozuv soni kamayadigan PUT'ni (aniq o'chirishlardan tashqari) rad etadi (422).
-- Qo'llash (AVVAL production zaxirasi ~/backups/ ga):  npx wrangler d1 execute kalkifit --remote --file migrations/zaxira-yozuv.sql   (kod jadval ustuni yo'q bo'lsa ham ishlayveradi)
ALTER TABLE zaxira ADD COLUMN yozuv INTEGER;
