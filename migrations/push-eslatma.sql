-- kalki.uz v88 — «Ovqat eslatmalari» (veb-push). Obuna (push_obuna) bilan 1:1 (id = SHA-256(endpoint)). Server ovqat tarkibini BILMAYDI:
-- faqat eslatma vaqtlari, vaqt mintaqasi va bugun qaysi ovqat yozilgani (bitmask: b=1 l=2 s=4 d=8).
-- Yurgizish (avval zaxira: npx wrangler d1 export kalkifit --remote --output ~/backups/...): npx wrangler d1 execute kalkifit --remote --file migrations/push-eslatma.sql
CREATE TABLE IF NOT EXISTS push_eslatma (
  id TEXT PRIMARY KEY,                 -- push_obuna.id
  tz INTEGER NOT NULL DEFAULT 300,     -- foydalanuvchi vaqt mintaqasi: UTC dan daqiqa (Toshkent +300)
  jadval TEXT NOT NULL,                -- {"b":510,"l":810,"s":null,"d":1170} — daqiqa, null — o'chiq
  siyrak INTEGER NOT NULL DEFAULT 0,   -- 1: 3 kun bosilmadi → faqat kechki
  kun TEXT,                            -- quyidagi hisoblagichlar qaysi mahalliy kunga tegishli
  yozildi INTEGER NOT NULL DEFAULT 0,  -- bugun yozilgan ovqatlar (bitmask)
  ishlangan INTEGER NOT NULL DEFAULT 0,-- bugun ko'rib chiqilgan (yuborilgan / o'tkazilgan)
  yuborildi INTEGER NOT NULL DEFAULT 0,-- bugun yuborilgan soni (≤ 3)
  bosildi INTEGER NOT NULL DEFAULT 0,  -- bugun birortasi bosildimi
  bosilmagan INTEGER NOT NULL DEFAULT 0, -- ketma-ket bosilmagan kunlar
  yangilangan INTEGER NOT NULL
);
