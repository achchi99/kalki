# KalkiFit ovqatlar bazasi — 30+ taomni ochiq manbalar bilan solishtirish

Sana: 2026-10-16. «Bizda» ustuni — tekshiruvdan OLDINGI qiymat (kkal/oqsil/yog'/uglevod, 100 g uchun). O'zbek/MDH taomlari uchun USDA mos emas (osh, shurva ancha yog'liroq), shuning uchun rus tilidagi ochiq jadval (calorizator.ru) + o'rtacha uy retseptidan masalliq grammlari bo'yicha hisob ishlatildi; qolganlari uchun USDA FoodData Central (SR Legacy) + calorizator/Open Food Facts. Qarorlar `tools/ovqatlar-build.js` va `tools/ovqatlar-manba.json` (har taomda `m` — manba/hisob usuli) ga kiritilgan. Hisob usuli yozuvlari `data/ovqatlar.json` da `m` maydonida.

# KalkiFit ovqatlar bazasi — 34 taom tekshiruvi (2026-10-16)

Qiymatlar 100 g uchun, format **kkal/oqsil/yog'/uglevod**. Farq % = bizdagi kkal vs manbalar o'rtachasi. Barcha raqamlar shu sessiyada olingan sahifa/yozuvlardan:
USDA — SR Legacy CSV (fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip; API DEMO_KEY 429 berdi), calorizator.ru — sahifadan olingan, Open Food Facts — search.openfoodfacts.org.

| Taom | Bizda | Manba 1 | Manba 2 | Farq | Qaror |
|---|---|---|---|---|---|
| osh | 170/5/7/24 | calorizator: «Плов узбекский по-фергански» 248.7/6.6/14.3/24.5, «Узбекский плов от Мастера» 217.4/6.5/12.6/18.7, «Плов с бараниной 4 сезона» 150/4.2/6/14.9 — o'rtacha: **205.4/5.8/11/19.4** | Retsept hisobi (USDA SR ingredientlar): **202.9/5.6/8.7/25.1** | -16.7% | **YANGI 200/5.5/8.5/25** — Ikkala manba ~203–205 kkal; bizdagi 170 yog'ni kam hisoblagan (1 kg guruchga 200 g yog') |
| shurva | 55/3.5/3/4.5 | calorizator: «Шурпа из баранины» 103.7/5.9/4.5/10.6 va 118.9/5/7.2/8.6, «Шурпа экономная» 34.4/1.7/0.9/5.1 — o'rtacha: **85.7/4.2/4.2/8.1** | Retsept hisobi: **65.9/3.3/3.9/4.4** | -27.4% | **YANGI 75/4/4.3/5.5** — Retsept 66, ru-jadval 86 (qo'y go'shtli retseptlar 104–119); 55 past — 75 ga ko'tarildi |
| lagmon | 120/5.5/5/15 | calorizator: «Лагман» 112.9/6.5/4.2/12.5, «Лагман 4 сезона» 158/4.3/8.9/13.3 — o'rtacha: **135.4/5.4/6.6/12.9** | Retsept hisobi: **107/4.1/4.7/12.1** | -1.0% | qoldirish — Manbalar o'rtachasi 121 — farq 1% |
| manti | 210/9/9/23 | calorizator: «Манты» 205.6/9.4/10.7/18.4 va 180.2/14.4/9.5/9.5 — o'rtacha: **192.9/11.9/10.1/13.9** | Retsept hisobi: **231.8/8.7/11.3/23** | -1.1% | qoldirish — O'rtacha 212 — farq −1% |
| somsa | 290/10/17/24 | calorizator: «Самса с мясом» 231.2/9.5/12/21.6, «Самса с мясом (тандыр)» 223.4/7.1/10.9/25.1 — o'rtacha: **227.3/8.3/11.4/23.4** | Retsept hisobi: **284.2/8.9/15.8/26** | +13.4% | qoldirish — O'rtacha 256 — farq +13% (dumbali tandir somsa ru-retseptlardan yog'liroq) |
| norin | 190/11/8/18 | ru-jadval: manba topilmadi (calorizator qidiruvi va veb-qidiruvda «нарын» yozuvi yo'q; fatsecret.ru ochilmadi) | Retsept hisobi (ot go'shti FDC 175087 + qazi calorizator): **208.8/11.5/7.9/20.6** | -9.0% | qoldirish — Faqat retsept: 209 — farq −9% (qazi kam bo'lsa ~195) |
| dimlama | 100/6/5/8 | calorizator: «Дымляма» 97.7/7.1/4.3/7.6, «Димляма по-московски» 126.4/6.8/8.3/6.6 — o'rtacha: **112.1/6.9/6.3/7.1** | Retsept hisobi: **87.3/3.9/4.3/8.8** | +0.3% | qoldirish — O'rtacha 100 — farq 0% |
| chuchvara | 200/9/7/25 | calorizator: «чучвара» topilmadi; proksi «Пельмени» 275/11.9/12.4/29 (xom, muzlatilgan; qaynatilganda ~÷1,1 → ~250): **250/10.8/11.3/26.4** | Retsept hisobi: **208.4/8.6/8.5/23.4** | -12.7% | qoldirish — O'rtacha 229 — farq −13%; retsept (208) bilan 4% — qoldirildi |
| qozon-kabob | 230/17/15/6 | calorizator proksi 50:50 «Баранина тушеная» 268/20/20.9/0 + «Картофель жареный» 192/2.8/9.5/23.4 (yozuv topilmadi): **230/11.4/15.2/11.7** | Retsept hisobi: **266.5/12.3/19.2/10.8** | -7.4% | **YANGI 250/13/17.5/11** — Kkal deyarli to'g'ri (−7%), lekin kartoshka hisobiga uglevod 6 emas ~11, oqsil 17 emas ~12–13 |
| grechka | 92/3.4/0.6/19.9 | USDA FDC 170686 Buckwheat groats, roasted, cooked: **92/3.4/0.6/19.9** | calorizator «Гречка отварная без масла»: **97/3.9/1/19.2** | -2.6% | qoldirish — Farq −3% |
| guruch | 130/2.7/0.3/28 | USDA FDC 168878 Rice, white, long-grain, regular, enriched, cooked: **130/2.7/0.3/28.2** | calorizator «Рис белый вареный»: **116/2.2/0.5/24.9** | +5.7% | qoldirish —  |
| mol-gosht | 215/27/11/0 | USDA FDC 171203 Beef, chuck for stew, lean+fat, cooked, braised: **191/32.4/6.8/0** | calorizator «Говядина вареная»: **254/25.8/16.8/0** | -3.4% | qoldirish —  |
| qoy-gosht | 290/25/21/0 | USDA FDC 172497 Lamb, shoulder, lean+fat 1/4", cooked, braised: **344/28.7/24.6/0** | calorizator «Баранина вареная»: **291/24.6/21.4/0** | -8.7% | qoldirish —  |
| tovuq-kokrak | 165/31/3.6/0 | USDA FDC 171478 Chicken breast, meat only, cooked, stewed: **151/29/3/0** | calorizator «Куриная грудка вареная»: **137/29.8/1.8/0.5** | +14.6% | **YANGI 150/29.5/3.2/0** — Bizdagi 165 = USDA 171477 (qovurilgan/roasted); nom «qaynatilgan» — stewed qiymat |
| tovuq-son | 210/26/11/0 | USDA FDC 173625 Chicken thigh, meat and skin, cooked, roasted: **232/23.3/14.7/0** | calorizator «Запеченный окорочок»: **175.9/16.2/12.3/0.3** | +3.0% | qoldirish — Terisiz go'sht (USDA 172388) 179; bizdagi 210 terili/terisiz o'rtasi |
| sut | 60/3/3.2/4.8 | USDA FDC 171265 Milk, whole, 3.25%: **61/3.1/3.2/4.8** | calorizator «Молоко 3.2%»: **59/2.9/3.2/4.7** | +0.0% | qoldirish —  |
| qatiq | 60/3/3.2/4 | USDA FDC 171284 Yogurt, plain, whole milk: **61/3.5/3.2/4.7** | calorizator «Катык 3.2%»: **56/2.8/3.2/4.2** | +2.6% | qoldirish —  |
| kefir | 53/3/2.5/4 | Open Food Facts «Кефир 2,5%» 4607045980739: **50/3/2.5/4** | calorizator «Кефир 2.5%»: **50/2.8/2.5/3.9** | +6.0% | qoldirish — USDA da faqat 1% (LIFEWAY 170904: 43 kkal) — mos emas, OFF ishlatildi |
| choy-shakar | 20/0/0/5 | USDA FDC 169655 Sugars, granulated → 5 g shakar/100 ml hisobi: **19.4/0/0/5** | calorizator «Чай чёрный с лимоном и сахаром»: **28/0.2/0.1/7.1** | -15.6% | qoldirish — Shakar miqdoriga bog'liq: bizda piyolaga ~10 g (2 choy qoshiq); calorizator ~14 g |
| kola | 42/0/0/10.6 | USDA FDC 174852 Beverages, carbonated, cola, regular: **42/0/0.2/10.4** | calorizator «Кола»: **42/0/0/10.4** | +0.0% | qoldirish —  |
| lavash-tovuq | 200/11/9/20 | calorizator «Шаурма с курицей» 174.7/9/8.8/14.5 + «Шаурма домашняя с курицей» 143.2/9.8/4.1/16.6: **158.9/9.4/6.5/15.6** | Open Food Facts: 6 ta «Шаурма с курицей» mahsuloti o'rtachasi (189.5, 216, 180, 170, 230.9, 203.1): **198.3/8.1/10.1/19.9** | +12.0% | qoldirish — USDA SR da shaurma yo'q; Toshkent lavashi (mayonez, kartoshka fri) yuqori chegarada |
| burger | 265/13/12/27 | USDA FDC 170320 McDONALD'S, Cheeseburger: **263/13/11.8/27.8** | calorizator «Сэндвич Чизбургер» (McDonalds): **305/16/13/30** | -6.7% | qoldirish —  |
| pitsa | 250/11/10/29 | USDA FDC 173292 Fast Food, Pizza Chain, 14" pizza, cheese topping, regular crust: **266/11.4/9.7/33.3** | calorizator «Пицца Маргарита»: **208/10.5/9/24** | +5.5% | qoldirish —  |
| kartoshka | 85/2/0.1/19 | USDA FDC 170440 Potatoes, boiled, cooked without skin, flesh: **86/1.7/0.1/20** | calorizator «Картофель варёный»: **82/2/0.4/16.7** | +1.2% | qoldirish —  |
| makaron | 150/5.5/1/30 | USDA FDC 169737 Pasta, cooked, enriched, without added salt: **158/5.8/0.9/30.9** | calorizator «Макароны высшего сорта вареные»: **112/3.5/0.4/23.2** | +11.1% | qoldirish — Manbalar orasida (USDA 158, ru 112) |
| suli | 70/2.5/1.5/12 | USDA FDC 171675 Cereals, oats, cooked with water: **71/2.5/1.5/12** | calorizator «Овсяная каша на воде»: **88/3/1.7/15** | -11.9% | qoldirish —  |
| olma | 52/0.3/0.2/14 | USDA FDC 171688 Apples, raw, with skin: **52/0.3/0.2/13.8** | calorizator «Яблоко»: **47/0.4/0.4/9.8** | +5.1% | qoldirish —  |
| banan | 89/1.1/0.3/23 | USDA FDC 173944 Bananas, raw: **89/1.1/0.3/22.8** | calorizator «Банан»: **96/1.5/0.5/21** | -3.8% | qoldirish —  |
| pomidor | 18/0.9/0.2/3.9 | USDA FDC 170457 Tomatoes, red, ripe, raw, year round average: **18/0.9/0.2/3.9** | calorizator «Томат (помидор)»: **24/1.1/0.2/3.8** | -14.3% | qoldirish —  |
| sariyog | 717/0.8/81/0.6 | USDA FDC 173410 Butter, salted: **717/0.8/81.1/0.1** | calorizator «Масло сливочное» (82,5%): **748/0.5/82.5/0.8** | -2.1% | qoldirish —  |
| pishloq | 350/25/27/2 | USDA FDC 171241 Cheese, gouda: **356/24.9/27.4/2.2** | calorizator «Сыр Гауда»: **356/25/27/2** | -1.7% | qoldirish —  |
| shokolad-sut | 535/7/30/59 | USDA FDC 167587 Candies, milk chocolate: **535/7.7/29.7/59.4** | calorizator «Шоколад молочный»: **550/6.9/35.7/54.4** | -1.4% | qoldirish —  |
| tuxum | 155/13/11/1 | USDA FDC 173424 Egg, whole, cooked, hard-boiled: **155/12.6/10.6/1.1** | calorizator «Яйцо куриное (вареное вкрутую)»: **160/12.9/11.6/0.8** | -1.6% | qoldirish —  |
| non | 270/9/1/55 | USDA FDC 174915 Bread, pita, white, enriched (yassi non proksisi): **275/9.1/1.2/55.7** | calorizator «Лепёшка узбекская с кунжутом»: **245/7.9/0.8/50.4** | +3.8% | qoldirish —  |

Manba URL'lari har taom uchun `dbcheck.json` → `sources` da.

## O'zbek taomlari — retsept hisob jadvallari

Ingredient qiymatlari: USDA SR Legacy (FDC id ko'rsatilgan), qazi — calorizator recipe/14071. Dumba uchun USDA'da alohida yozuv yo'q — mol yog'i (suet, FDC 170193, 854 kkal, 94 g yog') proksi. Yog'lar ALOHIDA qatorda. «Tayyor vazn» — suv qo'shilishi/bug'lanishi hisobga olingan taxmin.

### osh — Osh (Toshkent/Farg'ona uy retsepti, 1 kg guruch)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| guruch xom (FDC 168879) | 1000 | 3600 | 66.1 | 5.8 | 793.4 |
| mol go'shti 85/15 xom (FDC 171796) | 400 | 860 | 74.4 | 60.0 | 0.0 |
| qo'y go'shti kurak xom (FDC 172496) | 300 | 792 | 49.7 | 64.3 | 0.0 |
| sabzi (FDC 170393) | 1000 | 410 | 9.3 | 2.4 | 95.8 |
| piyoz (FDC 170000) | 300 | 120 | 3.3 | 0.3 | 28.0 |
| paxta yog'i (FDC 171024) | 200 | 1768 | 0.0 | 200.0 | 0.0 |
| no'xat quruq (FDC 173756) | 50 | 189 | 10.2 | 3.0 | 31.5 |
| sarimsoq (FDC 169230) | 50 | 74 | 3.2 | 0.2 | 16.5 |
| suv | 1300 | 0 | 0 | 0 | 0 |
| **Jami** | 4600 | **7814** | 216 | 336 | 965 |

Tayyor vazn: **3850 g** (suv ~1,3 l to'liq shimiladi; guruch ×2,2; sabzi/go'sht/piyoz ~30-50% suv yo'qotadi; yog'ning ~10% qozonda qoladi (hisobda 100% — yuqori chegara)). → **100 g: 202.9/5.6/8.7/25.1**

### shurva — Qo'y go'shtli shurva (qaynatma)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| qo'y go'shti kurak xom (FDC 172496) | 800 | 2112 | 132.6 | 171.6 | 0.0 |
| kartoshka xom (FDC 170028) | 800 | 552 | 13.4 | 0.8 | 125.7 |
| sabzi (FDC 170393) | 300 | 123 | 2.8 | 0.7 | 28.7 |
| piyoz (FDC 170000) | 200 | 80 | 2.2 | 0.2 | 18.7 |
| pomidor (FDC 170457) | 200 | 36 | 1.8 | 0.4 | 7.8 |
| bulg'or qalampir (FDC 170108) | 100 | 26 | 1.0 | 0.3 | 6.0 |
| no'xat quruq (FDC 173756) | 50 | 189 | 10.2 | 3.0 | 31.5 |
| paxta yog'i (FDC 171024) | 20 | 177 | 0.0 | 20.0 | 0.0 |
| suv | 3500 | 0 | 0 | 0 | 0 |
| **Jami** | 5970 | **3295** | 164 | 197 | 218 |

Tayyor vazn: **5000 g** (3,5 l suv, ~1 l bug'lanadi; suyagi tashlab hisoblangan (go'sht xom vazni — suyaksiz)). → **100 g: 65.9/3.3/3.9/4.4**

### lagmon — Lag'mon (cho'zma, suyuq vaja bilan)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| un (FDC 168894) | 500 | 1820 | 51.6 | 4.9 | 381.6 |
| mol go'shti 85/15 xom (FDC 171796) | 500 | 1075 | 93.0 | 75.0 | 0.0 |
| paxta yog'i (FDC 171024) | 100 | 884 | 0.0 | 100.0 | 0.0 |
| piyoz (FDC 170000) | 200 | 80 | 2.2 | 0.2 | 18.7 |
| bulg'or qalampir (FDC 170108) | 300 | 78 | 3.0 | 0.9 | 18.1 |
| pomidor (FDC 170457) | 300 | 54 | 2.6 | 0.6 | 11.7 |
| sabzi (FDC 170393) | 150 | 62 | 1.4 | 0.4 | 14.4 |
| turp (FDC 169276) | 150 | 24 | 1.0 | 0.1 | 5.1 |
| karam (FDC 169975) | 200 | 50 | 2.6 | 0.2 | 11.6 |
| sarimsoq (FDC 169230) | 30 | 45 | 1.9 | 0.1 | 9.9 |
| suv | 1700 | 0 | 0 | 0 | 0 |
| **Jami** | 4130 | **4171** | 159 | 182 | 471 |

Tayyor vazn: **3900 g** (xamirga 250 g suv; qaynatilgan lag'mon ~1,2 kg; vajaga ~1,2 l suv/sho'rva qoladi). → **100 g: 107/4.1/4.7/12.1**

### manti — Manti (qo'y/mol qiyma, dumba bilan)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| un (FDC 168894) | 500 | 1820 | 51.6 | 4.9 | 381.6 |
| qo'y qiyma xom (FDC 174370) | 300 | 846 | 49.7 | 70.2 | 0.0 |
| mol go'shti 85/15 xom (FDC 171796) | 300 | 645 | 55.8 | 45.0 | 0.0 |
| piyoz (FDC 170000) | 600 | 240 | 6.6 | 0.6 | 56.0 |
| dumba (proksi: suet FDC 170193) | 100 | 854 | 1.5 | 94.0 | 0.0 |
| suv | 220 | 0 | 0 | 0 | 0 |
| **Jami** | 2020 | **4405** | 165 | 215 | 438 |

Tayyor vazn: **1900 g** (bug'da pishishda ~6% (oqib chiqqan sharbat) yo'qotiladi). → **100 g: 231.8/8.7/11.3/23**

### somsa — Tandir somsa (go'shtli)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| un (FDC 168894) | 500 | 1820 | 51.6 | 4.9 | 381.6 |
| sariyog' (FDC 173410) | 80 | 574 | 0.7 | 64.9 | 0.0 |
| qo'y qiyma xom (FDC 174370) | 250 | 705 | 41.4 | 58.5 | 0.0 |
| mol go'shti 85/15 xom (FDC 171796) | 250 | 538 | 46.5 | 37.5 | 0.0 |
| piyoz (FDC 170000) | 500 | 200 | 5.5 | 0.5 | 46.7 |
| dumba (proksi: suet FDC 170193) | 100 | 854 | 1.5 | 94.0 | 0.0 |
| suv | 250 | 0 | 0 | 0 | 0 |
| **Jami** | 1930 | **4690** | 147 | 260 | 428 |

Tayyor vazn: **1650 g** (tandirda ~15% namlik bug'lanadi; qatlamga 80 g sariyog'/yog'). → **100 g: 284.2/8.9/15.8/26**

### norin — Norin (ot go'shti + qazi, qaynatilgan xamir)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| ot go'shti pishgan (FDC 175087) | 200 | 350 | 56.3 | 12.1 | 0.0 |
| qazi (calorizator recipe/14071) | 150 | 632 | 20.2 | 56.1 | 0.3 |
| un (FDC 168894) | 250 | 910 | 25.8 | 2.5 | 190.8 |
| tuxum xom (FDC 171287) | 50 | 72 | 6.3 | 4.8 | 0.4 |
| piyoz (FDC 170000) | 50 | 20 | 0.6 | 0.1 | 4.7 |
| suv | 100 | 0 | 0 | 0 | 0 |
| **Jami** | 800 | **1984** | 109 | 75 | 196 |

Tayyor vazn: **950 g** (go'sht/qazi PISHGAN vaznda; xamir qaynatilib ~550 g; ozroq sho'rva qo'shiladi). → **100 g: 208.8/11.5/7.9/20.6**

### dimlama — Dimlama

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| mol go'shti 85/15 xom (FDC 171796) | 300 | 645 | 55.8 | 45.0 | 0.0 |
| qo'y go'shti kurak xom (FDC 172496) | 300 | 792 | 49.7 | 64.3 | 0.0 |
| kartoshka xom (FDC 170028) | 1000 | 690 | 16.8 | 1.0 | 157.1 |
| sabzi (FDC 170393) | 400 | 164 | 3.7 | 1.0 | 38.3 |
| piyoz (FDC 170000) | 400 | 160 | 4.4 | 0.4 | 37.4 |
| karam (FDC 169975) | 800 | 200 | 10.2 | 0.8 | 46.4 |
| pomidor (FDC 170457) | 400 | 72 | 3.5 | 0.8 | 15.6 |
| bulg'or qalampir (FDC 170108) | 300 | 78 | 3.0 | 0.9 | 18.1 |
| baqlajon (FDC 169228) | 300 | 75 | 2.9 | 0.5 | 17.6 |
| paxta yog'i (FDC 171024) | 50 | 442 | 0.0 | 50.0 | 0.0 |
| sarimsoq (FDC 169230) | 30 | 45 | 1.9 | 0.1 | 9.9 |
| **Jami** | 4280 | **3363** | 152 | 165 | 340 |

Tayyor vazn: **3850 g** (suvsiz, o'z sharbatida; ~10% bug'lanadi). → **100 g: 87.3/3.9/4.3/8.8**

### chuchvara — Chuchvara (qaynatilgan, sho'rvasiz)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| un (FDC 168894) | 500 | 1820 | 51.6 | 4.9 | 381.6 |
| tuxum xom (FDC 171287) | 50 | 72 | 6.3 | 4.8 | 0.4 |
| mol go'shti 85/15 xom (FDC 171796) | 300 | 645 | 55.8 | 45.0 | 0.0 |
| qo'y qiyma xom (FDC 174370) | 200 | 564 | 33.1 | 46.8 | 0.0 |
| piyoz (FDC 170000) | 300 | 120 | 3.3 | 0.3 | 28.0 |
| dumba (proksi: suet FDC 170193) | 50 | 427 | 0.8 | 47.0 | 0.0 |
| suv | 200 | 0 | 0 | 0 | 0 |
| **Jami** | 1600 | **3648** | 151 | 149 | 410 |

Tayyor vazn: **1750 g** (qaynatishda xamir ~+10% suv shimadi). → **100 g: 208.4/8.6/8.5/23.4**

### qozon-kabob — Qozon kabob (go'sht + qovurilgan kartoshka)

| Masalliq (xom) | g | kkal | oqsil | yog' | uglevod |
|---|---|---|---|---|---|
| qo'y go'shti kurak xom (FDC 172496) | 400 | 1056 | 66.3 | 85.8 | 0.0 |
| mol go'shti 85/15 xom (FDC 171796) | 300 | 645 | 55.8 | 45.0 | 0.0 |
| kartoshka xom (FDC 170028) | 700 | 483 | 11.8 | 0.7 | 110.0 |
| piyoz (FDC 170000) | 100 | 40 | 1.1 | 0.1 | 9.3 |
| paxta yog'i (FDC 171024) | 80 | 707 | 0.0 | 80.0 | 0.0 |
| **Jami** | 1580 | **2931** | 135 | 212 | 119 |

Tayyor vazn: **1100 g** (go'sht ~35%, kartoshka ~30% suv yo'qotadi; 200 g yog'dan ~80 g taomga shimiladi). → **100 g: 266.5/12.3/19.2/10.8**

## Xulosa

- ±15% ichida: **31/34** (bizdagi qiymat vs manbalar o'rtachasi).
- ±15% dan tashqarida: osh (-16.7%), shurva (-27.4%), choy-shakar (-15.6%).
- O'zgartiriladi (4):
  - **osh**: 170/5/7/24 → **200/5.5/8.5/25** (Ikkala manba ~203–205 kkal; bizdagi 170 yog'ni kam hisoblagan (1 kg guruchga 200 g yog'))
  - **shurva**: 55/3.5/3/4.5 → **75/4/4.3/5.5** (Retsept 66, ru-jadval 86 (qo'y go'shtli retseptlar 104–119); 55 past — 75 ga ko'tarildi)
  - **qozon-kabob**: 230/17/15/6 → **250/13/17.5/11** (Kkal deyarli to'g'ri (−7%), lekin kartoshka hisobiga uglevod 6 emas ~11, oqsil 17 emas ~12–13)
  - **tovuq-kokrak**: 165/31/3.6/0 → **150/29.5/3.2/0** (Bizdagi 165 = USDA 171477 (qovurilgan/roasted); nom «qaynatilgan» — stewed qiymat)
- choy-shakar −15,6% bo'lsa ham qoldirildi: farq faqat shakar miqdori farazidan (bizda piyolaga ~10 g).
- norin uchun ru-jadvalda yozuv topilmadi; chuchvara va qozon-kabob uchun ham to'g'ridan-to'g'ri yozuv yo'q — proksi (пельмени; баранина тушеная + картофель жареный) ishlatildi.
- calorizator «пользовательский рецепт» yozuvlari retsept muallifiga bog'liq (masalan, suvni vaznga qo'shgan «Плов узбекский из говядины» 104.8 kkal — recipe/4237 — hisobdan chiqarildi).
