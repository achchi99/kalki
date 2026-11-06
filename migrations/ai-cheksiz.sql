-- KalkiFit: akkaunt belgisi «Cheksiz AI» (admin yoqadi/o'chiradi) va kunlik hisob. MAVJUD baza uchun.
-- DIQQAT: ALTER TABLE ... ADD COLUMN bir marta yurgiziladi; ikkinchi marta "duplicate column" xatosi — zararsiz.
-- Yurgizish: npx wrangler d1 execute kalkifit --remote --file migrations/ai-cheksiz.sql  (avval zaxira: ~/backups/). Kod deploy'idan OLDIN.
ALTER TABLE akkaunt ADD COLUMN ai_cheksiz INTEGER NOT NULL DEFAULT 0;
-- kun (Toshkent), akkaunt, xizmat (tx matn, img rasm/yorliq, mn menyu, ov ovoz, rs retsept), son. ns='!chegara' — kunlik chegaraga yetgan belgi.
CREATE TABLE IF NOT EXISTS ai_cheksiz_kun (kun TEXT NOT NULL, akkaunt_id TEXT NOT NULL, ns TEXT NOT NULL, son INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (kun, akkaunt_id, ns));
