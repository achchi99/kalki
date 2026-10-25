# «Bugun nima yeymiz?», Baliq kuni, Yemaydiganlarim (2-bosqich)

Kirish nuqtalari faqat IKKITA (yangi menyu/tab yo'q): **«Boshqa variantlar»** («O'rniga» kartasida) va **«Bugun nima yeymiz?»** kartasi (Bugun, «Ovqat qo'shish» ostida, bitta qatorli chiplar). Qolgan hammasi shu ikkisining ichida.

| Qism | Qayerda |
|---|---|
| Cheklov filtri (cho'chqa hech qachon) | `assets/cheklov-core.js`, `data/cheklov-teglar.json` (`tools/cheklov-teglar.js --yoz`) |
| Takliflar (toifa tegi, segment, tartib, belgilar), Boshqa variantlar | `assets/yeymiz-core.js`, `data/yeymiz.json` (qo'lda; taomlar: `docs/yeymiz-taomlar.md`) |
| «Uyda» retseptlari (har toifada 2–3 ta), kishi soni, xarid ro'yxati (xom vazn) | `data/uyda.json` (`tools/uyda-yasa.js --yoz`), `assets/uyda-core.js` |
| Interfeys (karta, oynalar, Profil, onboarding) | `assets/kalkifit-yeymiz.js` (+ ulash: `kalkifit-app.js` `Y.*`), `assets/css/kalkifit.css` oxiri |
| Yetkazish havolalari | `assets/partners.json` (kategoriya `yetkazish`; Uzum Tezkor, Yandex Eda faol; Express24 — Yandex Eda'ga qo'shilgan, nofaol) |
| Anonim hisoblagichlar | `assets/hisob-kun.js` (navbat), `functions/api/hisob.js`, `migrations/hisob.sql`, `tools/hisob-hisobot.js` |
| Push: «Baliq yoqtirmayman», «Boshqa kun» | `functions/api/push/[amal].js` (`baliqsiz`, `kun`), `migrations/push-yeymiz.sql`, `tools/push-yubor.js` |

## Qoidalar
- Taklif avval cheklovdan o'tadi (tanlangan teglar + cho'chqa), keyin qolgan kkal sig'imi, keyin oqsil «sifati»; bir oqsil manbasidan ≤2. Taklif = ko'rsatma emas: hech narsa avtomatik yozilmaydi.
- Baliq yemaydiganga: Baliq chipi, Baliq guruhi, eslatma-banner, push, O'rniga/Boshqa variantlar/Bugun nima yeymiz? — hammasida baliq yo'q. Qidiruvda foydalanuvchi o'zi yozsa chiqadi (tanlov — uniki).
- Tashqi havolalar `target="_blank" rel="noopener"`; APK (Capacitor/Cordova) da `Browser.open` / `_system` orqali tashqi brauzerda.
- UTM/hamkor maydoni hozircha bo'sh (`append_utm: false`).

## Hisoblagichlar (anonim)
Faqat `kun + hodisa + son` (D1 `hisob_kun`). Hodisalar: `orinbosar_korsatildi`, `orinbosar_tanlandi`, `baliq_oyna_ochildi`, `baliq_buyurtma_bosildi[.xizmat]`, `baliq_kafe_yozildi`, `baliq_uyda_ochildi`, `yeymiz_ochildi`, `yeymiz_tanlandi`, `yeymiz_buyurtma_bosildi[.xizmat]`, `yeymiz_uyda_ochildi` (2.1). Foydalanuvchi id, IP, qurilma, taom nomi, kkal, cookie YO'Q; Do Not Track'da hisoblanmaydi; xatoda jim. Hisobot: `node tools/hisob-hisobot.js --muhit preview|production [--kun 30]` (parol `~/.kalkifit-admin-pass`).

## Production'ga chiqarishda (bir marta)
1. D1 (production `kalkifit`): `migrations/hisob.sql` va `migrations/push-yeymiz.sql` (ikkinchisi bir marta). Preview'da bajarilgan.
2. Hetzner cron: `0 6 * * 4` → `0 6 * * *` (har kuni; `tools/push-yubor.js` o'zi faqat bugungi kuni bo'lgan va baliqsiz bo'lmaganlarga yuboradi).
3. `data/yangiliklar-kalkifit.json` ga yangi yozuv (ko'rinadigan reliz).

## 2.1: umumiy oyna
Har chip (Kabob, Suyuq ovqat, Tandir, Tez tayyor, Baliq) bitta oynani ochadi: 3 segment — **Kafe va choyxonada · Buyurtma · Uyda**. Birlamchi segment: 18:00 dan keyin yoki shanba/yakshanba — Kafe; boshqa paytda oxirgi tanlangani (`localStorage kalki_fit_yseg`, try/catch). Buyurtma: tugma bosilganda qidiruv so'zi (`shashlik`, `sho'rva`, `somsa`, `lavash`, `baliq`) buferga nusxalanadi. Birinchi 5 ta + «Yana ko'rsatish». «Qo'shish» joriy vaqtga qarab ovqat vaqtini tanlaydi va toast'da ko'rsatadi. «Baliq yoqtirmayman» / «Boshqa kun» faqat Baliq chipida. `yeymiz_toifa` — `data/yeymiz.json` `taom[*].t` (tegsiz taom hech qaysi chipga tushmaydi).

## 2.2: «Uyda» — tez va sog'lom (PP) retseptlar (v42)
«Bugun nima yeymiz?» oynasida segmentlar: **Uyda · Kafe va choyxonada · Buyurtma**; birlamchi HAR DOIM Uyda. Kafe/Buyurtma o'zgarmagan (toifa chiplari faqat shu ikkisida va Baliq kunida).

| Qism | Qayerda |
|---|---|
| Retseptlar manbasi (67 ta: tayyorsiz 0–5 daq · tez 10–15 · pishirsa 25–45; har biri id, daqiqa, ovqat turlari b/l/d/s, nom UZ/RU, tarkib `baza id:gramm[:dona[:variant]]`, 3–4 qadam UZ/RU) | `tools/uyda-pp-manba.js` → `node tools/uyda-pp-yasa.js --yoz` → `data/uyda-pp.json` (qo'lda tahrir qilinmaydi; yasovchi bazada ID borligini, guruhga bog'langanini, vaqt oralig'ini, qadamlar tengligini, cho'chqa tegi yo'qligini tekshiradi) |
| Kkal/BJU | QO'LDA YOZILMAYDI: `assets/uyda-pp-core.js` `calc` — tarkib grammi × bazadagi qiymat (oilada variant); ilovada har doim «taxminiy» |
| Tanlash | `uyda-pp-core.js` `pick`: cheklov (Yemaydiganlarim, cho'chqa hech qachon) → vaqt filtri (0–5 / 10–15 / 30+) va ovqat turi → «Uyda nima bor?» (19 mahsulot chipi, `prefs.ppHave`) → saralash: ovqat vaqtiga mosligi, qolgan kkalga sig'ishi, oqsil hissasi, tezlik; bugun/kecha yeganlari tepada takrorlanmaydi (`prefs.ppAte`, 3 kun); tepada 3 ta (bitta guruhdan ≤2) |
| Interfeys | `assets/kalkifit-yeymiz.js` (PP bloki: lead «Sizga X kkal va Y g oqsil qoldi», 3 eng mos, filtrlar, «Uyda nima bor?», karta: ⏱, kkal, oqsil, tarkib, qadamlar (yig'ilgan), porsiya ½/1/1½/2, «Yedim», «Odatdagiga saqlash»); stil — `assets/css/kalkifit.css` oxiri |
| «Yedim» | `kalkifit-app.js` `ppLog`: kundalikka bitta yozuv (nom, porsiya, kkal/BJU/gramm, `est`, ikonka = asosiy mahsulot); oyna yopiladi (hazil pufagi shundan keyin ko'rinadi) |

Eski toifa bo'yicha «Uyda» retseptlari (`data/uyda.json`: kishi soni, xarid ro'yxati) saqlandi: Baliq kuni va Uyda oxiridagi «Boshqa uyda taomlar» havolasi orqali.
Bazaga qo'shilganlar (USDA SR Legacy, `data/manba/usda-sr-legacy.json` da bor edi): `un` (168894), `tunets-suv` (171986). Protein kokteyl — bazadagi «Protein kukuni (whey)» (yorliq o'rtachasi, 30 g). Test: `tools/dizayn/test-uyda-pp.mjs`.
