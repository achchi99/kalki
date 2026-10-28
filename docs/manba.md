# v61: manba (foydalanuvchi qayerdan keldi) — anonim

**Maxfiylik:** faqat qisqa manba KODI saqlanadi: `x | tg | ig | yt | google | fb | sayt | dir | boshqa`. To'liq URL, yo'l, so'rov matni, erkin `utm_source` matni — saqlanmaydi va yuborilmaydi
(noma'lum yoki g'alati `utm_source` → `boshqa`). Shaxsiy ma'lumot yo'q; qurilma avvalgidek faqat tuzli xesh.

## Mijoz (`assets/stat-kun.js`, `assets/kalkifit-app.js`)
- KalkiFit **birinchi ochilganda** (onboarding'dan OLDIN) `KalkiStat.manba()`: `utm_source` (yoki `ref`), bo'lmasa `document.referrer` DOMENI → kod.
  `t.co` / `x.com` / `twitter.com` → `x`; `t.me` / `telegram.*` / Telegram ilovasi → `tg`; `google.*` → `google`; `instagram.com` → `ig`; `youtube.com` / `youtu.be` → `yt`; `facebook.com` → `fb`; `kalki.uz` ichidan → `sayt`; referrer yo'q → `dir` («Toʻgʻridan»); boshqasi → `boshqa`.
- `utm_source` referrer'dan USTUN. Natija `localStorage.kalki_manba` ga BIR MARTA yoziladi (keyin o'zgarmaydi). `?demo=1`, `*.pages.dev`, bot — hech narsa.
- Onboarding tugagach `yangi_foydalanuvchi` hodisasining kaliti = shu kod.
- Cheklov: iPhone «Bosh ekran»dagi ilova alohida xotira ishlatadi — manba Safari'da aniqlangan bo'lsa, PWA'da qayta aniqlanadi (odatda `dir`).

## Server (`functions/api/stat.js`, `migrations/manba.sql`)
- `yangi_foydalanuvchi` kaliti qat'iy ro'yxatdan (`MANBA`); URL / matn / registr rad etiladi.
- Qurilma qatoriga `manba` va `ob` (onboarding'ni tugatdi — «Keyinroq» emas) yoziladi (yangi qurilma qatori).
- `manbalar()`: manba bo'yicha **yangi qurilmalar**, **D1 / D7** (faqat yetilgan kogorta, qavsda hajmi), **onboarding %**.
  Davr aralashuvi qoidasi (v60): o'lchov boshlangan kun = manbasi bor birinchi yangi qurilma kuni; hamma ustun faqat shu kundan keyin. Manbasiz (eski ilova) yangi qurilmalar — «Noma'lum (eski ilova)» qatori.
- **Migratsiya** (kod deploy'idan OLDIN): zaxira `npx wrangler d1 export kalkifit --remote --output ~/backups/kalkifit-<sana>.sql`, so'ng `npx wrangler d1 execute kalkifit --remote --file migrations/manba.sql`.
  Yurgizilmagan bo'lsa ham statistika to'xtamaydi (eski INSERT'ga qaytadi), «Manbalar» jadvali esa «migrations/manba.sql yurgizilmagan» deb ko'rsatadi.

## Admin («Manbalar»)
Jadval: Manba | Yangi | D1 | D7 | Onb. % (360 px da har manba 4 ustunli kartaga aylanadi, siljish yo'q). Ostida «O'lchov boshlangan: <sana>».
**Tayyor havolalar** (nusxalash tugmasi bilan): `https://kalki.uz/kalkifit?utm_source=x | tg | ig | yt`.

## Testlar
`stat` (mijoz: manbaOf, bir marta saqlash; server: kod qat'iyligi, jadval, D1/D7 yetilgan kogorta, o'lchov boshlanishi, migratsiyasiz baza), `stat-ui` (birinchi ochilishda saqlash, hodisa kaliti, URL yuborilmasligi), `admin-ui` (jadval, havolalar, nusxalash, 360 px).
