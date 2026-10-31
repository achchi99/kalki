-- KalkiFit v66+ «Aktivatsiya voronkasi» o'lchovi (anonim; faqat belgilar — ovqat nomi, matn, vazn, yosh YO'Q). Cloudflare D1, binding: KALKIFIT_DB.
-- Qo'llash (avval production zaxirasi ~/backups/ ga):  npx wrangler d1 export kalkifit --remote --output ~/backups/kalkifit-<sana>-aktivatsiya-oldin.sql
--                                                        npx wrangler d1 execute kalkifit --remote --file migrations/aktivatsiya.sql
-- Yangi ustunlar NULL (yoki 0) bo'lib boshlanadi: «NULL» = o'lchanmagan (migratsiyadan oldingi qurilma qatorlari). 0 EMAS — admin'da «o'lchanmagan» deb chiqadi.
-- Qator = qurilma × kun (stat.sql). Ustunlar faqat qurilmaning ILK OCHILISH kunidagi qatorda (ilk = 1) to'ladi.
ALTER TABLE stat_qurilma ADD COLUMN ilk INTEGER NOT NULL DEFAULT 0;      -- 1: shu kuni «ilk_ochilish» hodisasi keldi (yangi qurilma: ilovada hali holat yo'q edi). Voronka kogortasi = ilk = 1 qatorlar
ALTER TABLE stat_qurilma ADD COLUMN bk_ovqat INTEGER;                    -- ilk kundagi ovqat kiritish soni: 0, 1, 2, 3 (3 = 3 va undan ko'p). NULL — o'lchanmagan / ilk kun emas
ALTER TABLE stat_qurilma ADD COLUMN birinchi_usul TEXT;                  -- birinchi ovqat qanday kiritilgan: qidiruv | oxirgilar (Yaqinda) | rasm | matn | ovoz | menyu | odatdagi | kechagidek | retsept | tavsiya | boshqa. NULL — hali kiritilmagan / o'lchanmagan
ALTER TABLE stat_qurilma ADD COLUMN ob_ovqat_vaqt TEXT;                  -- onboarding tugashidan birinchi ovqatgacha: d5 (0–5 daq) | d30 (5–30) | d120 (30–120) | dx (2 soat+) | dn (onboarding vaqti noma'lum). «Birinchi kuni yo'q» — bk_ovqat = 0 (kun o'tgach), ustun NULL
ALTER TABLE stat_qurilma ADD COLUMN pwa_ornatilgan INTEGER;              -- bosh ekranga qo'shilgan (standalone) yoki Android ilova: 1 | 0; NULL — o'lchanmagan (eski mijoz kodi)
CREATE INDEX IF NOT EXISTS stat_qurilma_ilk ON stat_qurilma (ilk, kun);
