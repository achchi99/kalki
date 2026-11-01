-- KalkiFit dizayn ekranlari (admin «Dizayn ekranlari» sahifasi): oldin/keyin skrinshotlar. Faqat admin ko'radi (/api/admin/dizayn-ekranlar).
-- Qo'shimcha jadval — mavjud ma'lumotga tegmaydi. Ishlatish: npx wrangler d1 execute kalkifit --remote --file migrations/dizayn-ekranlar.sql
CREATE TABLE IF NOT EXISTS dizayn_ekran (
  id TEXT PRIMARY KEY,          -- masalan 'keyin-1-bugun-dark'
  guruh TEXT NOT NULL,          -- '1-bugun' (oldin/keyin juftligi)
  holat TEXT NOT NULL,          -- 'oldin' | 'keyin'
  tema TEXT NOT NULL,           -- 'light' | 'dark'
  nom TEXT NOT NULL,            -- ko'rinadigan nom
  tartib INTEGER NOT NULL DEFAULT 0,
  rasm TEXT NOT NULL,           -- data:image/png;base64,...
  yangilandi INTEGER NOT NULL
);
