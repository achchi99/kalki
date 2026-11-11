# Baza mantiqiy tekshiruvi — 2026-11-11

Sabab: telefonda «кофе» qidirilganda «Кофе — 1 пиала · 60 ккал», «Кофе чёрный с сахаром — 1 пиала · 20 ккал» chiqdi (shakarli shakarsizdan kam, qahvada «пиала»).
Ildizi: `kofe` oilasi variantlari asosiy birlikni (piyola 150 g) meros qilib olgan (kapuchino 40 kkal/100 g × 150 g = 60), `qahva-shakar` 150 g qahvaga 5 g shakar (20 kkal/piyola).

Doimiy tekshiruv: `tools/baza-mantiq.js` (qoidalar a–e) + `tools/dizayn/test-baza-mantiq.mjs` (`npm run test:tez` ichida har doim). Istisnolar sababi bilan `tools/baza-mantiq-istisno.js` da.
Foydalanuvchining eski yozuvlari (tarix) O'ZGARTIRILMAGAN: faqat baza qiymatlari; eski `piyola` kaliti lug'atda qoladi.

## Manba
USDA FoodData Central (SR Legacy): 171890 qaynatilgan qahva (1 kkal/100 g), 171891 espresso (9), 171265 butun sut 3,25 % (61), 171255 half-and-half (131), 169655 shakar (387).
1 choy qoshiq shakar ≈ 5 g ≈ 20 kkal (USDA 4,2 g/choy qoshiq — to'la qoshiq 5 g qabul qilindi); 2 choy qoshiq = 10 g ≈ 39 kkal. «3 in 1» — paket yorlig'i (~18–20 g, 200 ml ga ≈ 74 kkal), taxminiy.

## Qahva oilasi (yangi birlik: **chashka** = 200 ml; «piyola» faqat choyga)
| Taom | Birlik | Kkal/birlik | Qanday hisoblangan | Oldin |
|---|---|---|---|---|
| Qahva (qora, shakarsiz) `kofe` | 1 chashka 200 g · stakan 250 | **2** · 3 | USDA 171890 | 1 piyola(150) = 3 (60 — kapuchino variantidan) |
| Qahva (qora, 2 ch.q shakar) `qahva-shakar` | 1 chashka 210 g | **41** | 200 g qahva + 10 g shakar | 20 (13/100 g × 155) |
| Qahva (sut bilan, shakarsiz) `qahva-sutli` | 1 chashka 200 g | 32 | 150 g qahva + 50 g sut | stakan 200 (32) |
| Qahva (sut va 2 ch.q shakar) `qahva-sutli-shakar` | 1 chashka 210 g | 72 | + 10 g shakar (oldin 5 g) | 51 (stakan 205) |
| Kofe 3 in 1 (paketli, shakarli) `kofe-3in1` | 1 chashka 200 g | 74 | yorliq | stakan 200 = 74 (nom «Kofe (3 in 1)») |
| Amerikano `amerikano` (yangi) | 1 chashka 200 g | 7 | 60 g espresso + 140 g qahva | — |
| Espresso `espresso` | 1 porsiya 30 ml | 3 | USDA 171891 | o'zgarishsiz (nom aniqlashtirildi) |
| Kapuchino `kapuchino` | 1 chashka 180 g · stakan 250 | 72 · 100 | 40 kkal/100 g (qiymat o'zgarmadi — eski id migratsiyasi testi), birlik aniqlashtirildi | stakan 200 = 80, piyola 150 → 60 |
| Latte `latte` | 1 chashka 200 g · stakan 250 | 90 · 112 | 45 kkal/100 g (o'zgarmadi), chashka qo'shildi | stakan 250 = 112 |
| Raf `raf` | 1 chashka 200 g · stakan 250 | 234 · 293 | USDA 171891 + 171255 + shakar | stakan 250 |
| Mokka `mokka` | 1 chashka 200 · stakan 250 | 156 · 195 | o'zgarmadi (piyola → chashka) | piyola 200 |
| Turk qahvasi `tr-qahva` / `tr-qahva-shakar` | 1 chashka 60 / 66 g | 1 / 24 | o'zgarmadi | piyola |

Qidiruv: «кофе / Кофе / kofe / Kofe / qahva / coffee» → birinchi **shakarsiz qora qahva**; «кофе с сахаром», «кофе чёрный с сахаром» → `qahva-shakar`; «кофе 3 в 1» → oilaning 3in1 varianti (alohida aniq nom).
`chashka` birligi: ilova lug'ati (UZ «chashka», RU «чашка», ЎЗ translit), `UNITW`/`PT_RE` (yozuvdan: «2 chashka kofe» = 400 g), server lug'ati (`functions/api/kalkifit.js`).

## Butun baza bo'yicha qoidalar (natija)
| Qoida | Topilgan (xom) | Haqiqiy xato → tuzatildi | Istisno (sababi bilan) |
|---|---|---|---|
| a) qo'shimchali ≥ asosiy | 8 | 1 (`grechka-sutli`) | 5 + 2 soxta (xom grechka, navvot) |
| b) ichimlikda «piyola» faqat choy | 8 | 8 | 0 |
| c) makro ±15 % | 7 | 0 | 7 (USDA: kletchatka/sirka kislotasi) |
| d) shubhali kkal | 23 | 0 (1 l / 1,5 l shisha, kokos suvi, navvotli choy — soxta) | 0 |
| e) bir xil nom | 114 xom → 2 haqiqiy | 2 | 0 |

### a) Tuzatildi
- `grechka-sutli` (Grechka sut bilan): 1 lagan 250 g = 200 kkal, oddiy grechka 1 lagan 250 g = 230 kkal edi (sut ustiga quyilmay, aralashma 250 g ga «suyultirilgan»). Endi sut ustiga qo'shiladi: 250 g grechka + 80 g sut = lagan 330 g = **277 kkal** (kosa 260 g). Manba: USDA 170686 + 171265.
### a) Istisno (qo'shimcha emas — boshqa mahsulot)
`milka>milka-funduk` (nomdagi «sutli» — sut shokoladi), `shokolad-shirin` (qora shokolad turi), `shokolad-bodom` (USDA 168754, farq 1,7 %), `qalampir-qizil` («sladkiy» — navi), `tvorog-donador` (USDA 172179 donador tvorog).
### b) Tuzatildi (piyola → chashka, kerak bo'lsa stakan)
`kofe`, `kakao` (chashka 200, stakan 250), `qahva-sutli`, `qahva-shakar`, `tr-qahva`, `tr-qahva-shakar`, `mokka`, `sariyogli-sut` (stakan 250 · chashka 200 · kosa 250).
### c) Istisno (qo'lda ko'rib chiqildi)
`makkajoxori`, `makkajoxori-konserva`, `limon`, `laym`, `kepak`, `kakao-kukun`, `olma-sirka` — USDA kkal rasmiy; farq kletchatka (hazm bo'lmaydi) va organik kislotadan (Atwater formulasi ularni ushlamaydi).
### d) Ko'rib chiqildi
`kokos-suvi` 18 kkal/100 g (tabiiy, USDA 174831), `choy-navvot` 16 (navvot = shakar, choy emas), 1 l/1,5 l shisha va vino shisha 750 ml — bir marta ichilmaydigan o'lcham. Qolgan ichimliklar bir o'lchovda ≤ 400 kkal.
### e) Dublikat nomlar → nom aniqlashtirildi (id'lar saqlandi — foydalanuvchi tarixi uchun)
- `tovuq-qanot-qov`: «Tovuq qanoti (**panirovkada**, qovurilgan)» / «Куриные крылья **в панировке** (жареные)» (USDA 173628); `tovuq-qanot` — oddiy qovurilgan qanotcha, 150 g porsiya.
- `sendvich-tovuq`: «Tovuqli sendvich (**fast-food, kotletli**)» / «Сэндвич с куриной **котлетой (фастфуд)**» (USDA 170295); `sendvich` — uy sendvichi.

## Qo'lda qaror uchun qoldi
- Hech narsa bloklangan emas. Ixtiyoriy: `sendvich` va `sendvich-tovuq`, `tovuq-qanot` va `tovuq-qanot-qov` ni bitta taomga birlashtirish (id'lar tarixda uchraydi — migratsiya kerak, hozir nom bilan ajratilgan).
