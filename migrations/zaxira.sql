-- KalkiFit va Ro'zg'or: bulutga zaxira (tiklash kodi bilan, uchidan-uchiga shifrlangan). D1 binding: KALKIFIT_DB (taklif jadvali bilan bir baza).
-- Server faqat id (kodning SHA-256 hosilasi) va SHIFRLANGAN blob'ni saqlaydi; kod va ochiq ma'lumot serverga bormaydi.
CREATE TABLE IF NOT EXISTS zaxira (id TEXT PRIMARY KEY, ilova TEXT NOT NULL, blob TEXT NOT NULL, versiya INTEGER NOT NULL DEFAULT 1, yangilangan INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS zaxira_yangilangan ON zaxira (yangilangan);
