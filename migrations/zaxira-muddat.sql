-- KalkiFit v68+: bulut zaxira SAQLASH MUDDATI. 12 oy davomida hech qanday sinxron (PUT yoki «holat» so'rovi) bo'lmasa → ogoh (ogohlantirish vaqti) qo'yiladi;
-- ilova ochilsa ogoh bir martalik ko'rsatiladi va bekor bo'ladi; ogohlantirishdan 30 kun o'tib ham sinxron bo'lmasa — zaxira O'CHADI (tools/zaxira-muddat.js, kunlik cron).
-- Qo'llash (avval production zaxirasi ~/backups/ ga):  npx wrangler d1 execute kalkifit --remote --file migrations/zaxira-muddat.sql
-- NULL = o'lchanmagan: eski qatorlar uchun «oxirgi» o'rniga «yangilangan» ishlatiladi (COALESCE).
ALTER TABLE zaxira ADD COLUMN oxirgi INTEGER;          -- oxirgi sinxron (PUT yoki holat so'rovi), ms
ALTER TABLE zaxira ADD COLUMN ogoh INTEGER;            -- muddat ogohlantirishi qo'yilgan vaqt, ms (NULL — yo'q)
CREATE INDEX IF NOT EXISTS zaxira_ogoh ON zaxira (ogoh);
