-- KalkiFit va Ro'zg'or: IXTIYORIY akkaunt (email + bir martalik kod, parolsiz). D1 binding: KALKIFIT_DB (zaxira va taklif bilan bir baza).
-- Minimal ma'lumot: email, akkaunt ID, kirish usuli, ism (ixtiyoriy, ≤ 40 belgi), yaratilgan/oxirgi kirish vaqti, marketing roziligi. Telefon YO'Q.
-- Vaqtlar — millisekund (Date.now()). Saqlash qatlami: functions/_lib/akkaunt-store.js (D1 faqat shu yerda).
-- B bosqich: akkaunt_ilova — akkauntni ilovadagi zaxira (zaxira.id) bilan bog'laydi. Shu fayl qayta yurgizilsa xavfsiz (IF NOT EXISTS).
CREATE TABLE IF NOT EXISTS akkaunt (
  id TEXT PRIMARY KEY,                           -- tasodifiy 24 hex (email'dan olinmaydi)
  email TEXT NOT NULL UNIQUE,                    -- kichik harfda, bo'shliqsiz
  usul TEXT NOT NULL DEFAULT 'email',            -- 'email' | 'google' | 'ikkalasi'
  google_sub TEXT UNIQUE,                        -- C bosqichda (Google); hozir NULL
  ism TEXT,                                      -- ko'rsatiladigan ism (≤ 40 belgi): Google ismi yoki foydalanuvchi yozgani; faqat egasiga ko'rinadi
  ism_qolda INTEGER NOT NULL DEFAULT 0,          -- 1 — foydalanuvchi o'zi yozgan: keyingi Google kirishlarida ALMASHTIRILMAYDI
  yaratilgan INTEGER NOT NULL,
  oxirgi_kirish INTEGER NOT NULL,
  marketing INTEGER NOT NULL DEFAULT 0,          -- alohida rozilik, odatiy 0 (o'chiq)
  marketing_vaqt INTEGER,                        -- rozilik berilgan/bekor qilingan vaqt
  marketing_matn_v TEXT                          -- rozilik matnining versiyasi
);
-- Bir martalik kodlar: faqat HMAC xeshi saqlanadi (ochiq kod hech qayerda yo'q).
CREATE TABLE IF NOT EXISTS kirish_kodi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  maqsad TEXT NOT NULL,                          -- 'kirish' | 'ochirish'
  kod_hash TEXT NOT NULL,
  yaratilgan INTEGER NOT NULL,
  muddat INTEGER NOT NULL,
  urinish INTEGER NOT NULL DEFAULT 0,
  ishlatilgan INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS kirish_kodi_email ON kirish_kodi (email, maqsad);
CREATE INDEX IF NOT EXISTS kirish_kodi_muddat ON kirish_kodi (muddat);
-- Sessiyalar: id = token'ning SHA-256 xeshi (token faqat cookie'da).
CREATE TABLE IF NOT EXISTS sessiya (
  id TEXT PRIMARY KEY,
  akkaunt_id TEXT NOT NULL,
  yaratilgan INTEGER NOT NULL,
  oxirgi INTEGER NOT NULL,                       -- oxirgi faollik (sliding muddat)
  muddat_abs INTEGER NOT NULL,                   -- mutlaq muddat
  qurilma TEXT NOT NULL DEFAULT ''               -- qisqa yorliq (brauzer/OS)
);
CREATE INDEX IF NOT EXISTS sessiya_akkaunt ON sessiya (akkaunt_id);
-- Tezlik chegaralari (oyna bo'yicha hisoblagich). Kalit xeshlangan (email/IP ochiq emas).
CREATE TABLE IF NOT EXISTS limit_hisob (kalit TEXT PRIMARY KEY, soni INTEGER NOT NULL, oyna_boshi INTEGER NOT NULL);
-- Minimal audit: IP va email YOZILMAYDI.
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY AUTOINCREMENT, vaqt INTEGER NOT NULL, akkaunt_id TEXT, hodisa TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS audit_akkaunt ON audit (akkaunt_id);
-- B bosqich (gibrid rejim): akkaunt ↔ ilova zaxirasi. zaxira.id (kodning hosilasi) bilan bog'lanadi; zaxira jadvaliga TEGILMAYDI.
-- kod_konvert = tiklash kodi, server kaliti (AKKAUNT_MASTER_KEYS, versiya master_v) bilan AES-GCM shifrlangan. 'qatiy' rejimda konvert YO'Q (zaxira_id ham NULL): tiklash faqat kod bilan.
CREATE TABLE IF NOT EXISTS akkaunt_ilova (
  akkaunt_id TEXT NOT NULL,
  ilova TEXT NOT NULL,                           -- 'kalkifit' | 'rozgor'
  zaxira_id TEXT UNIQUE,                         -- bitta zaxira faqat bitta akkauntga tegishli; 'qatiy' da NULL
  kod_konvert TEXT,
  rejim TEXT NOT NULL DEFAULT 'konvert',         -- 'konvert' | 'qatiy'
  master_v INTEGER,
  ulangan INTEGER NOT NULL,
  PRIMARY KEY (akkaunt_id, ilova)
);
