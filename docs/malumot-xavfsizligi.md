# KalkiFit — «ma'lumot hech qachon yo'qolmasin» (2026-11-02, stig707 voqeasi)

## Voqea va sabab
- stig707@gmail.com: bulut sinxroni 10-28 da «versiya konflikti» (409) olib jimgina to'xtadi (ilova konfliktda yuborishni butunlay to'xtatar, ogohlantirish faqat Profil ichida edi). Ma'lumot telefonda yozilib borgan, keyin telefonda yo'qolgan; bulutda 10-28 holati qolgan.
- Ilova (APK) `server.url = https://kalki.uz/kalkifit` — jonli saytni ochadi; WebView xotirasi (localStorage) Chrome'dan ALOHIDA. Yangilashda paket nomi va imzo bir xil (barcha APK'lar `9d35514c…` bilan imzolangan), shuning uchun yangilash xotirani saqlaydi; eski interfeys — service worker keshi (eski «eskisini ber, fonda yangila» qoidasi) yoki Auto Backup tiklagan eski kesh.

## Qanday saqlanadi
- **Akkauntga kirgan har bir foydalanuvchi:** bulut zaxira AVTOMATIK yoqiladi (alohida tugma yo'q): kirganda `linkLocal` / `reconcile` (assets/app-akkaunt.js). Mavjud akkauntlar — keyingi ochilishda `ak.check()` ulaydi.
- **Triggerlar** (assets/app-backup.js): o'zgarishdan keyin (4 s akkauntda, 30 s qolganda), ilova fonga o'tganda/yopilganda (`visibilitychange`, `pagehide` — keepalive PUT), ilova ochilganda AVVAL bulutdan tortiladi (`pullIfNewer`), 5 daqiqadan keyin qaytilganda yana tortiladi, kuniga bir marta «holat». Oflayn — navbat (`pending`), internet kelganda yuboriladi.
- **Yozuv darajasida birlashtirish** (`assets/kalkifit-core.js`: `stamp`, `mergeStates`): har ovqat yozuvida `u` (barqaror id), `m` (o'zgarish vaqti), `h` (xesh); o'chirilgan yozuv — `st.tomb[u]`; `upd` — holatning oxirgi o'zgarishi. 409 → bulutdagi nusxa olinadi, birlashtiriladi, qayta yoziladi (**sinxron to'xtamaydi**). Qoidalar: yozuvlar birlashmasi (bir yozuvning ikki nusxasi — `m` kattasi; `tomb > m` — o'chirilgan); suv/qadam — kattasi; profil/sozlamalar — `upd` yangisidan; vazn/o'z taomlari/shablon/idish — birlashma; o'z taomi id to'qnashuvi — qayta nomlanadi.
- **Himoya qatlamlari:** (1) mijoz: ochilishda bulutdan tortish; mahalliy holat bo'sh bo'lsa — bulutdan tiklash; (2) server: bulutda mazmunli nusxa (≥900 bayt) bo'lsa, bo'sh/juda kichik yangisi ustidan YOZILMAYDI (422) — «Bulutda ma'lumotingiz bor — tiklaysizmi?» oynasi; (3) `majbur: true` faqat foydalanuvchi aniq tasdiqlaganda.
- **Sog'liq:** Profil'da «Bulutda saqlandi · N daqiqa oldin»; 24 soatdan ko'p yuborilmasa (yoki hal qilish kerak bo'lsa) Bugun'da sariq banner sabab bilan. Akkauntsizlarga: 2+ kun yozuvdan keyin, 7 kunda bir «Ma'lumotingiz faqat shu telefonda…» kartasi; birinchi ochilishda «Oldin ishlatganmisiz? Hisobingizga kiring».
- `navigator.storage.persist()` har saqlashda birinchi marta so'raladi.
- Ro'zg'or hozircha eski (konfliktda tanlov) yo'ldan foydalanadi; birlashtirish `cfg.merge` bergan ilovada yoqiladi.

## Server tarixi va admin tiklash
- Jadval `zaxira_tarix` (migrations/zaxira-tarix.sql): har yangilashda oldingi versiya saqlanadi; oxirgi 20 versiya + oxirgi 30 kun uchun har kunning oxirgi versiyasi qoladi. Zaxira o'chirilsa (yoki muddat/akkaunt o'chirilsa) tarix ham o'chadi.
- Admin (admin/kalkifit-statistika.html → «Foydalanuvchilar» → qatorni oching → «Zaxira versiyalari»): ro'yxat (versiya, vaqt, hajm — mazmun ko'rinmaydi) va «Shu versiyadan tiklash». Tiklashdan oldin JORIY holat tarixga tushadi; tanlangan nusxa YANGI versiya bo'ladi; foydalanuvchi ilovani ochganda u qurilmadagi bilan birlashtiriladi (ustidan yozilmaydi). Jurnal: `audit` → `admin_zaxira_tiklash_vN`.
- Ro'yxatda «Oxirgi muvaffaqiyatli sinxron» ustuni; faol (2 kun ichida), lekin 2+ kun sinxronsiz KalkiFit akkauntlari qizil ⚠ bilan.
- Qo'lda (CLI): `npx wrangler d1 execute kalkifit --remote --command "SELECT versiya, yangilangan, LENGTH(blob) FROM zaxira_tarix WHERE id='<zaxira_id>' ORDER BY versiya DESC"`. Avval `~/backups/` ga nusxa (tools — `wrangler d1 export`).
- **Migratsiya tartibi:** `~/backups` ga D1 nusxasi → `migrations/zaxira-tarix.sql` → kod deploy'i (kod jadval yo'q bo'lsa tarixsiz ishlayveradi).

## Android (APK, `~/projects/kalkifit-android`)
- Ilova jonli saytni ochadi (`capacitor.config.json` → `server.url`); `www/` faqat `offline.html`. Onlayn bo'lsa HAR DOIM eng yangi web; sayt tomonida: sw.js ilova JS/CSS'ni avval tarmoqdan (`freshFirst`), WebView'da yangi SW egallasa — ochilgandan ≤15 s ichida darhol qayta yuklanadi (`assets/sw-boot.js`).
- 1.0.8 (versionCode 10): Auto Backup qoidalari (`backup_rules.xml`, `data_extraction_rules.xml`) — FAQAT localStorage/IndexedDB (+sozlamalar); Service Worker keshi tiklanmaydi (eski interfeys qaytmasin).
- Origin barqaror: har doim `https://kalki.uz`; xotira paket (`uz.kalki.fit`) + imzo (`9D:35:51:4C…`) bilan bog'liq — keystore yo'qolmasin (README).
- Saytdagi havola `ilova/index.html` + `ilova/versiya.json` — so'nggi APK; ilova ichida eskirgan versiya «Yangi versiya bor» kartasini ko'radi (`assets/kalkifit-app.js`).

## Tekshiruv (har o'zgarishda SHART)
`node tools/testlar.js tez --only merge,sinxron,zaxira,zaxira-api,zaxira-himoya,akkaunt-b-ui,akkaunt-ui,admin` (+ `sw`, `pwa`). Qamrov: qayta o'rnatish+akkaunt → tiklanadi; 409/konflikt → birlashadi; ikki qurilma; o'chirilgan qayta tirilmaydi; bo'sh holat yozmaydi; oflayn navbat; versiyalar tarixi va admin tiklash; 24 soat banner; akkauntsiz karta; APK onlayn → yangi web.

## Foydalanuvchiga ko'rsatma (qisqa)
- **Android (UZ):** ilovada Profil → «Ma'lumotlarni saqlash» → «Email bilan kirish» → emailingizni yozing → kodni kiriting. Bugundan boshlab ma'lumot o'zi saqlanadi; telefon almashsangiz — shu email bilan kiring, hammasi qaytadi.
- **Android (RU):** Профиль → «Сохранение данных» → «Вход по email» → введите email и код. С этого момента данные сохраняются сами; на новом телефоне войдите тем же email — всё вернётся.
- **iPhone (UZ/RU):** xuddi shunday (Profil → «Email bilan kirish» / «Вход по email»); Bosh ekranga qo'shilgan ilova va Safari xotirasi alohida — ikkalasida ham shu email bilan kiring, yozuvlar birlashadi.

## Ro'zg'or: qilinishi kerak (hozircha O'ZGARTIRILMAGAN)
Ro'zg'or sinxroni hali eski yo'lda: `cfg.merge` yo'q → 409 da `CS.conflict` o'rnatiladi, sinxron TO'XTAYDI va «Qaysi biri qolsin?» tanlovi (faqat Profil kartasida, `bkkeep` ustidan yozadi). KalkiFit'dagi voqea (jimgina to'xtash) Ro'zg'orda ham mumkin. Server himoyasi (422) va versiyalar tarixi Ro'zg'orga ham amal qiladi; qolganlari yo'q.

Reja (KalkiFit'ning `S.stamp`/`S.mergeStates` shabloni bo'yicha):
1. **Model:** `assets/rozgor-core.js` — har tranzaksiya yozuviga `u` (barqaror id), `m` (o'zgarish vaqti), `h` (mazmun xeshi); o'chirilganlar `st.tomb[u]`; `st.upd`. `stamp(st)` har `save()` da. Birlashtirish qoidalari: tranzaksiyalar — birlashma (`m` kattasi, `tomb > m` — o'chirilgan); `base/reserve/income` kabi skalyarlar — `upd` yangisidan; maqsad/kategoriya ro'yxatlari — id/nom bo'yicha birlashma. Avval maydonlar ro'yxatini (`emptyState`) chiqarib, har biri uchun qoida yozing.
2. **Mijoz:** `rozgor-app.js` da `KalkiBackup.create({ merge })` — `bk.pullMerge/pullIfNewer/adoptMerge/health/banner` allaqachon umumiy (`app-backup.js`), faqat `cfg.merge` va `S.stamp` ulanadi. Bugun'dagi banner (`bkBannerHtml`) va akkauntsiz karta Ro'zg'or ekraniga ko'chiriladi (matnlar ilova nomi bilan).
3. **Akkaunt:** `app-akkaunt.js` `reconcile` allaqachon `bk.canMerge()` bo'lsa avtomatik birlashtiradi — Ro'zg'orda ham o'zi yoqiladi.
4. **Testlar:** `test-kalkifit-merge` / `test-kalkifit-sinxron` namunasida `test-rozgor-merge` va `test-rozgor-sinxron` (qayta o'rnatish+akkaunt, 409, ikki qurilma, o'chirilgan tirilmaydi, bo'sh holat, oflayn); `test-zaxira` va `test-akkaunt-b-ui` dagi Ro'zg'or «tanlov» tarmoqlari olib tashlanadi.
5. **Tartib:** yangilik yozuvi (`data/yangiliklar-rozgor.json`), maxfiylik matni o'zgarmaydi (KalkiFit bilan bir xil bayon). Hajm: ~1 ish kuni; xavf — Ro'zg'or modeli KalkiFit'dan oddiyroq, shuning uchun kichik.
