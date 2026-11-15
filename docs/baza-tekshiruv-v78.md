# Baza tekshirildi — v78 (2026-11-15)

Sabab: faol foydalanuvchi: «ba'zi joylarda kkal noto'g'ri yoki g'alati». `baza-mantiq` ziddiyatlarni ushlaydi, lekin qiymatning o'zi to'g'riligini tekshirmaydi.
Bu reliz: (1) foydalanuvchi yuborgan 5 ta aniq misol, (2) ustuvor ro'yxat (323 taom) uchun manba + hisob + izchillik tekshiruvi va «✓ Tekshirilgan» belgisi, (3) «Xato topdingizmi?» formasi, (4) ruscha lug'at (O'zbekiston shakli), (5) baza-mantiq qoidalari f–h.
Foydalanuvchining eski yozuvlari (tarix, o'z taomlari, idishlar) O'ZGARTIRILMAGAN: faqat baza qiymatlari/nomlari; eski id'lar va birlik kalitlari (piyola, stakan, dona…) lug'atda qoladi.

## «Tekshirilgan» nimani anglatadi
`tekshirilgan: true` + `manba` (qisqa) — taom ustuvor ro'yxatda (`data/baza-ustuvor.json`) va 4 darvozadan o'tgan (`tools/baza-audit.js`):
1. qiymat manbasi aniq: USDA FDC `fdc_id`, retsept (`baza-retseptlar.json` + USDA), yorliq (Open Food Facts) yoki menyu tarkibi hisobi;
2. 4·O + 4·U + 9·Y ≈ kkal (±15 %, kichik qiymatda ±10 kkal; USDA kletchatka istisnolari `baza-mantiq-istisno.js` da);
3. har porsiya birligi grammi oqilona oraliqda (kosa 150–600 g, six 30–200 g, chashka 30–360 g…);
4. bir porsiyada ≤ 1500 kkal, nomda «A / B» yo'q.
**Tarozida tortilgan degani EMAS**: retsept taomlar uy retsepti bo'yicha hisob, ±15 % farq bo'lishi mumkin (kartada «taxminiy» belgisi va manba oynasida aytiladi). Tarmoq (fast-food) taomlari — tarmoq kkal e'lon qilmaydi, tarkib bo'yicha hisob, doim «taxminiy».

## 0-band: foydalanuvchi misollari
| № | Muammo | Sabab | Tuzatish |
|---|---|---|---|
| a | «фитт» → «Evos — Лавашелло / Фиттер · 486 ккал» | Bazada IKKI xil taom bitta qatorga birlashtirilgan edi (`tm-evos-lavash-yengil`, 187 kkal/100 g × 260 g) | Ikkiga ajratildi: `tm-evos-lavash-lavashello` (tovuq, chips, sous; 230 g) va `tm-evos-lavash-fitter` (tovuq ko'kragi, sabzavot, yogurtli yengil sous, chipssiz; 260 g). Evos kkal/BJU e'lon qilmaydi (evos.uz, Wolt, Yandex tekshirilgan, WebSearch ham topmadi) → tarkib bo'yicha hisob (USDA), «taxminiy». Eski id yashirin (tarix uchun saqlanadi). |
| a2 | Boshqa «A / B» qatorlar | `shashlik` («Kabob / shashlik»), `lavash-tovuq` («Lavash / shaurma»), `aminokislota`, `tm-bellissimo-pitsa-gosht`, `chapati`, `funchoza`, `lapsha-udon` | Hammasi alohida/aniq nomga o'tdi; Udon va Soba ikki taom (yangi `udon`, `soba`), eski `lapsha-udon` yashirin. Qoida f endi testda. |
| b | «кофе» → «Кофе · 1 чашка · 72 ккал» | Baza to'g'ri (qora qahva = 2 kkal). Qator oxirgi yeyilgan variantni (kapuchino 180 g × 40 = 72) tiklaydi, lekin nomga variant yozilmasdi (`foodRow`: belgi faqat qidiruvda variant aytilganda) | Qator endi variantning TO'LIQ nomini yozadi («Kapuchino (sutli, shakarsiz)»); oila ildizi «Qahva (qora, shakarsiz)» / «Кофе чёрный (без сахара)»; har variantga `fn` nomi (`3 in 1`, `latte`, `kapuchino`). Qahvada `stakan` olib tashlandi — faqat `chashka` (choyda — faqat `piyola`). Test: 8-bo'lim (kapuchino yegandan keyin «kofe» qatori). |
| c | «курт» → «Курут · 64 ккал» | Asosiy nom «Курут», 1 dona = 20 g (noaniq) | Asosiy nom «Курт» (ЎЗ — «Қурт»), «курут/qurut/kurut» sinonim. Birliklar: kichik dona 12 g (~43 kkal), katta dona 25 g (~89 kkal). Qiymat 320 → 355 kkal/100 g (quritish modeli: USDA 172182 tvorog suvi ~8 % gacha + tuz ~6 %); ishlab chiqaruvchiga qarab ±15–20 %. |
| d | «Чучвара · 1 миска · 635 ккал» | Standart variant — suvsiz qaynatma (254 kkal/100 g × 250 g «kosa»); sho'rvadagi chuchvara 800 g suv bilan hisoblangan (135 kkal/100 g) | Standart — sho'rvada (O'zbekistonda eng ko'p): 14 dona (~170 g) + sho'rva, suv 800 → 1300 g, 104 kkal/100 g × 1 kosa 400 g = **416 kkal**. Suvsiz (qaynatma) 1 kosa = 220 g (561 kkal) va qovurilgan 1 kosa = 180 g alohida variant, to'liq nomlari bilan. `Mastava` — bitta «kosa» (350 g; kafe 450 g); sho'rvalarda faqat kosa (qoida g). |
| e | Ruscha lug'at | «миска» ruscha-o'zbekcha emas | Quyida |

## Ruscha lug'at (O'zbekiston shakli)
| Oldin | Keyin | Qayerda |
|---|---|---|
| миска (birlik) | **коса** | ilova lug'ati (birliklar, «Моя коса», «Обычная коса», «Ваши косы и лаганы», «1 коса плова»), server lug'ati, retsept izohlari («типичная коса в кафе»), yangiliklar tarixi |
| «из своей миски», «свою миску» | «из своей посуды (коса, лаган)» | idish takliflari |
| Курут | **Курт** (курут — sinonim) | `qurt` |
| Хлеб/лепёшка | **Лепёшка (нон)**; variantlar: «Лепёшка тандырная (обинон)», «Патыр», «Катлама», «Булка (белый хлеб)» | `non` |
| Пельмени в бульоне (кафе) | **Чучвара в бульоне (кафе)**; «Жареные чучвара» → «Жареная чучвара» | чучвара |
| Казан-кебаб | Казан-кабоб | `qozon-kabob` |
| Шашлык | Шашлык (кебаб) — birlik «шампур» (six) | `shashlik` |
| Пельмени | Пельмени (русские) — чучвара bilan aralashmasin | `pelmeni` |
| — | «маленький / большой» (qurt birliklari: kichik/katta dona) | yangi birliklar `dona_s`, `dona_l` |
Qoldi (to'g'ri o'zbekcha): пиала, самса, лепёшка, нарын, ханум, лагман, шурпа, мастава, мошхурда, катык, сузьма, каймак, наваш/навват, чак-чак. Qoida h: ruscha matnlarda «миска» yo'q (test).
**Qo'lda qaror:** «коса» ruschada «braid/scythe» ma'nosi bilan ham bor; o'zbek ruschasida ishlatiladi (foydalanuvchi talabi). Agar noqulay bo'lsa — «пиала/касa» ga almashtirish bitta qatorli o'zgarish (`units.kosa`).

## Birliklar (bir toifada bir xil)
| Toifa | Qoida | O'zgardi |
|---|---|---|
| Sho'rvalar (sho'rva, mastava, moshxo'rda, kuksi, chalop, kesma, unash, mampar, borsh, uxa, bulon…) | faqat **kosa** | `shurva` (piyola ×), `tovuq-bulon` (piyola ×), `kuksi` (likop ×), `baliq/loviya/yasmiq-shurva` (likop ×), `mastava` |
| Qahva, kakao | faqat **chashka** (200 ml) | `kofe` + 13 variant/taom (stakan ×) |
| Issiq choy | faqat **piyola** | choy va 15 variantdan stakan × (sovuq choy — stakan) |
| Kabob (shashlik, jigar, lyulya, dumba, yurak) | **six** | dona → six; `shashlik` 1 six = 80 g (192 kkal), tovuq 70 g, jigar 60 g, lyulya 90 g |
| Non | `dona` obi non **350 g** (300 edi), `bolak` = chorak **88 g**; yarim — porsiya oynasidagi «Yarim» | `non` |
| Qurt | kichik 12 g / katta 25 g | `qurt` |
Birlik nomlari (kosa, lagan, piyola, dona, six, bo'lak, osh qoshiq, choy qoshiq) — ilova lug'atida.

## >15 % o'zgargan qiymatlar (oldin → keyin)
| Taom | Oldin | Keyin (kkal/100 g) | Sabab |
|---|---|---|---|
| `chuchvara` (standart variant) | 254 | 104 | standart — sho'rvada (1 kosa 635 → 416 kkal). Suvsiz variant 254 qoldi, `qaynatma` kosa 250 → 220 g |
| `kafe-chuchvara-shorva` | 135 | 104 | sho'rva suvi 800 → 1300 g (14 dona + sho'rva = 400 g kosa) |
| `qurt` | 320 | 355 (+11 %) | ≤ 15 %, lekin manba bilan (alohida ko'rsatildi) |
Boshqa hamma qiymat o'zgarmadi: 52 ta manbasiz taomga USDA hisobi qo'yildi (`tools/baza-manba-v78.js`) va hammasi mavjud qiymatdan ±15 % ichida chiqdi (qiymat qoldi, manba tasdiqlandi).

## Yangi taomlar
`togramach` (to'g'ramach), `noxat-shurva` (nohat sho'rva), `lochira`, `shirchoy`, `udon`, `soba`, `tm-evos-lavash-lavashello`, `tm-evos-lavash-fitter` — jami 8 (baza 954 → 962 yozuv). Ikonkasi yo'qlari: `togramach noxat-shurva lochira shirchoy udon soba` → `data/ikonka-reja.txt` (8-guruh) → `docs/ikonka-toplam-12.txt`.
Qidiruv bo'yicha mavjud (qo'shilmadi): obi non/patir/lochira/qatlama/buxanka (`non` oilasi), parmuda (`somsa-qat`), pashmak (`pishmaniye`), qozon osh (`osh`).

## Qo'lda qarorga qoldi
- **Ustuvor ro'yxatdan chiqarilgan (manba topilmadi, «tekshirilgan» belgisi yo'q):** `sumalak` (retsept juda farq qiladi), `halim`, `suzma` (yog'liligi/quruqligi), `tvorog5` (rus tvorogi USDA da yo'q), `grechka-xom`, `makaron-xom`, `limon`, `olcha`, `behi`, `kvas` (USDA ro'yxatida yo'q). Ularga tarozi/yorliq yoki USDA id kerak.
- **Evos Lavashello va Fitter:** tarkib/og'irlik Evos'dan olinmadi (e'lon qilmaydi): Lavashello 230 g (~561 kkal), Fitter 260 g (~333 kkal) — faraz; Evos'ning o'zidan tasdiq (yorliq/xodim) kerak.
- **Qazi:** ot go'shti USDA da yo'q — yog'li qo'y qovurg'asi (USDA 174323) proksi sifatida.
- **Qurt:** yorliqli mahsulot (Open Food Facts) topilsa — qiymatni almashtirish.
- **Somsa:** tandir va duxovka farqi alohida variant qilinmadi (`xamir: oddiy/qatlama` bor); ikkala usul 120 g. Kerak bo'lsa yangi omil.
- **Patir:** 150 g (non oilasi) — real patir ko'pincha 200–250 g; tarozi bilan tekshirilishi kerak.
- `sendvich`/`sendvich-tovuq`, `tovuq-qanot`/`tovuq-qanot-qov` birlashtirish — oldingi hisobotdan qolgan (migratsiya kerak).

## Hisob (qisqa; to'liq retseptlar — `tools/baza-manba-v78.js`, `data/baza-retseptlar.json`)
- Chuchvara (sho'rvada): un 300 + suv 110 + mol 200 + qo'y 150 + piyoz 150 + dumba 20 g, sho'rva suvi 1300 g (yield 0,95) → 104 kkal/100 g; kosa 400 g.
- Qurt: USDA 172182 (81 kkal, suv 81 %) → suvi 8 % gacha: 81 × (92/18,8) ≈ 396; tuz 6 % → ≈ 355.
- Shashlik: qo'y go'shti pishgan (USDA 174308 yog'siz 60 % + 172544 yog'li 40 %) = 237 kkal/100 g (baza 240).
- Qolganlari — `tools/baza-manba-v78.js` da gram-ma-gram.

## Xato topdingizmi? (anonim)
Taom kartasidagi havola → forma (kkal / porsiya / nom + izoh ≤ 200 belgi) → `POST /api/kalkifit-xato` → D1 `xato_xabar` (`migrations/kalkifit-xato.sql`). Faqat taom id'si, variant, tur, izoh, til; mijoz_id/IP saqlanmaydi (IP — faqat kunlik limit uchun xesh bilan KV da: bir IP kuniga 30, sayt bo'yicha 3000). Admin: `/admin/kalkifit-takliflar?tur=xato`.
