# KalkiFit v87 — baza kengaytmasi, «tarelka», yangiliklar oynasi, bir xillik maslahati (2026-11-17)

## A. Baza: 1025 → 1296 yozuv (+271)
**Tuzatish (2026-11-18).** Oldingi hisobotdagi «qiymatlar hammasi USDA'dan» noaniq edi. USDA'da o'zbek/MDH taomlari yo'q: bu taomlarning qiymati **retsept hisobi** — masalliqlar grammidan hisoblangan, har masalliq o'z manbasidan. Masalliq manbalari: USDA FDC SR Legacy, Скурихин jadvali (`data/manba/skurikhin.json`, health-diet.ru havolasi bilan) va ishlab chiqaruvchi yorlig'i (`data/manba/yorliq.json`, OFF shtrix-kodi). Qo'lda raqam yozilmagan. Har qatorning manba turi pastdagi «Manba jadvali»da, retseptlar — «Standart retseptlar»da. Bazada manba maydoni (`m`) «Retsept hisobi: …» deb belgilangan.
Yangi USDA id'lar: `python3 tools/usda-qoshimcha.py <SR Legacy zip>`.
Tekshiruv: `node tools/kengaytma-tekshir.js tools/ovqatlar-kengaytma8a.js --usda <index.tsv>` (bazani yasamasdan: takror nom, birlik, makro, porsiya oralig'i).

| Fayl | Soni | Toifalar |
|---|---|---|
| `tools/ovqatlar-kengaytma8a.js` | 81 | issiq choy 18 (faqat piyola), matcha latte 2, sovuq choy 5, qahva/kakao/issiq shokolad 25 (kichik 250 / o'rta 350 / katta 450 ml), kafe limonadi 10 (0,3/0,4/0,5 l), smuzi 5, milksheyk 5, yangi siqilgan sharbat 5, kompot 2, ayron 1, energetik 2 |
| `tools/ovqatlar-kengaytma8b.js` | 49 | suyuq ovqatlar (faqat kosa, 300–450 g): sho'rva turlari, mastava/moshxo'rda variantlari, mosh sho'rva, umoch, go'ja, atala, borsh, shchi, rassolnik, solyanka, xarcho, okroshka (kvas), uxa, krem-sho'rvalar, tom yam, ramen, fo… |
| `tools/ovqatlar-kengaytma8c.js` | 134 | non/xamir 13, sut 9, go'sht/baliq 32, salat 18, garnir 7, sabzavot/meva/yong'oq 16, shirinlik 21, kafe/fast-fud 18 |

Dublikat sifatida olib tashlangan (mavjud taomga sinonim bo'ldi): ko'k choy → `yashil-choy`, qora choy va Earl Grey → `choy`, tog' choyi → `otli-choy`, doppio → `espresso`, yangi siqilgan sabzi sharbati → `sabzi-sharbat`.
Manba: admin «topilmagan» (90 kun, 109 so'z) va «AI bilan baholangan» takliflar (96 ta) — mavjudlari sinonimga, yo'qlari yangi taomga. Sinonimlar: `tools/ovqatlar-alias.json` (+13 taom).
**Almashtirishlar (tuzatishdan keyin):**
- **Kvas:** endi Скурихин «Квас хлебный» (27 kkal), solod ichimligi emas.
- **Matcha:** matcha kukuni yorlig'i (Renée Voltaire, OFF 7340130501200), eriydigan choy emas.
- **Yangi siqilgan sharbatlar:** apelsin va greypfrut — USDA xom sharbat; olma, anor va sabzi — Скурихин «сок натуральный» qiymati, qadoqlangan USDA emas.
- **Qolgan almashtirishlar (ma'qullangan yoki o'zi to'g'ri):** shovul → ismaloq, tkemali → quruq olxo'ri, jo'xori = sorgo (bir xil don).
- **Energetik:** Rockstar qiymati — «USDA — eng yaqin» deb belgilangan.
Cho'chqa: komponentlarda cho'chqa yo'q (sho'rvalardagi «pork and beef» kolbasa → mol kolbasasi 170606); `choshqa` tegi to'plami o'zgarmagan.
«Yemaydiganlarim» teglari: 8c — qo'lda; 8a/8b — USDA komponent tavsifidan avtomatik (`tools/kengaytma-teg.js`, ehtiyotkor tomon).

### Tuzatishda qo'shilganlar va qarorlar
- **do'lana, qizilcha (kizil), sulugun** — Скурихин jadvalidan; **shakarsiz vafli** — Gullón Zero yorlig'i (OFF 8410376059366).
- **Sulugun:** endi alohida taom; brinza sinonimidan olib tashlandi.
- **Tomat pastasi, balzamik sirka** — USDA qiymati bilan qo'shildi. Makro farqi kletchatka va organik kislotadan, shuning uchun `c` istisnosi qo'yildi.
- **Sabzi fresh** — qayta qo'shildi (Скурихин). Qadoqlangan `sabzi-sharbat` dagi «yangi siqilgan» sinonimlari olib tashlandi.
- **Tvorog 9 %:** dangasa vareniki va tvorogli blinchikda Скурихин qiymati olindi, USDA 4 % li tvorog emas.
- **baza-mantiq «a» istisnolari (17)** — har xil taomlar nomi o'xshash (masalan, shakarli draje bodom yog'i kam → 100 g da xom bodomdan kam). Sababi `tools/baza-mantiq-istisno.js` da.
- **«d» istisnolari** — `raf-vanil`, `issiq-shokolad-kafe` (katta 450 ml > 400 kkal — kafe qiymati) va `shirchoy-tuzli` (sutli choy). Milksheyk «sut kokteyli» sifatida qoidadan chiqarildi.
- **Ikonka tavsiflari (264)** — nomlardan avtomatik yozilgan. Rasm chizishdan oldin ko'rib chiqing: `data/ikonka-reja.txt`, 9-guruh.

## A1. «lagan» → «tarelka»
Birlik kaliti (`likop`, idish turi `lagan`) va eski yozuvlar O'ZGARMAGAN — faqat ko'rinadigan matn. Foydalanuvchiga ko'rinadigan 20 ta matn almashdi:
- **Ilova (UZ, 8 ta):** birlik nomi, idish nomlari, «Mening idishlarim» izohlari.
- **Ilova (RU, 7 ta):** «Тарелка», «Моя тарелка», «Ваши косы и тарелки» va boshqalar.
- **Server birlik lug'ati:** 1 ta.
- **Rasm AI prompti:** 1 ta («1 tarelka»).
- **Bazada:** «Choyxona oshi (1 tarelka)» va retsept izohi, 3 ta.

Eski yozuvdagi AI porsiya matni («1 lagan») va eski idish nomi ko'rsatishda «tarelka» bo'ladi (`noLagan()`), saqlangani o'zgarmaydi. Parser «tarelkam/tarelkada» ni ham taniydi. baza-mantiq yangi «i» qoidasi: birlik kaliti, nom, oila/manba matnida «lagan/лаган» yo'q (sinonimlarda qolishi mumkin).

## A2. Qo'shimchalar (choy/qahva)
`S.adOk/adClean/adCalc/adText` (`assets/kalkifit-core.js`). Porsiya oynasida «Qo'shimcha · 1 piyolaga» qatori bor: shakar 0/1/2/3 choy qoshiq, asal, navvot, sut, limon, murabbo. Bir bosishda tanlanadi, kkal darhol yangilanadi.

| Qo'shimcha | Miqdor | USDA | Kkal |
|---|---|---|---|
| Shakar | 1 ch.q. = 4,2 g | 169655 | 16 |
| Asal | 7 g | 169640 | 21 |
| Navvot | 5 g | — | 19 |
| Sut | 30 ml | 171265 | 18 |
| Limon | 10 g | 167746 | 3 |
| Murabbo | 7 g | 169641 | 19 |

- **Hisob:** porsiya birligi boshiga, grammda bir marta.
- **Yozuv:** `e.ad = { sh: 2, su: 1 }`. Kkal yozuvga qo'shiladi, gramm esa faqat ichimlikniki. Nomi «Choy + 2 q. shakar, sut» ko'rinadi.
- **Tahrir, takrorlash, «[+] oxirgidek»:** qo'shimchalar saqlanadi.
- **Birlashtirish:** `mergeStates` yozuvni butunligicha ko'chiradi; test bor.

## A4. O'lchamlar
Yangi birliklar:
- **Qahva:** `hajm_s/m/l` — kichik 250, o'rta 350, katta 450 ml.
- **Limonad va smuzi:** `l03/l04/l05` — 0,3, 0,4, 0,5 l.

Miqdor oynasidagi tez tanlovda «Kichik / O'rta / Katta» chiqadi, har birida kkal ko'rsatiladi.

## A6. Guruh teglari
`tools/ovqat-guruh.js` (build oxirida `o.gr`). Guruhlar: kartoshka, guruch (va yormalar), xamir, qizil go'sht, tovuq, baliq, tuxum, dukkakli, sabzavot, meva, sut, shirinlik, fast-fud, ichimlik. Yog', sous va protein kukuni uchun qo'shimcha «boshqa» guruhi bor, u maslahatda ishlatilmaydi. Aralash taomda asosiy 1–2 guruh qo'yiladi; noto'g'ri tushganlar `QOLDA` ro'yxatida tuzatiladi. Test: har ko'rinadigan taomda guruh bor.

## B. Yangiliklar oynasi
`assets/app-yangilik.js` umumiy modul, shuning uchun KalkiFit va Ro'zg'or ikkalasiga tegishli.
- **Ko'rsatish:** oynada faqat oxirgi 3 yozuv. Eng yangisi «Yangi» belgisi va sana bilan alohida fonda, qolgan ikkitasi xiraroq.
- **Har yozuv:** sarlavha (`bn`) va 1–2 jumla.
- **O'tkazib yuborgan foydalanuvchi:** banner yoki oynada ham faqat oxirgi 3 yozuv bandlarini ko'radi.
- **JSON:** eski yozuvlar o'chirilmagan.

## C. Bir xillik maslahati
`S.bixil` (hisob qurilmada; serverga faqat anonim hodisa ketadi).
- **1-qoida:** oxirgi 6 kunning kamida 5 tasida bir guruh yozilgan va bugun yana shu guruhdan taom qo'shildi.
- **2-qoida:** oldingi 5 kun ketma-ket oqsil maqsadning 70 % idan kam.
- **Istisnolar:** sabzavot, meva, «boshqa» guruhlari uchun karta chiqmaydi. Ichimlik guruhida faqat ≥ 40 kkal yozuv sanaladi.
- **Matnlar:** har guruhga 4 xil matn (uz/ru, ЎЗ — translit), navbat bilan. Tibbiy da'vo yo'q.
- **Joylashuv:** karta Bugun'dagi yagona karta o'rnida chiqadi va boshqa kartalar hamda kontekst chiplar bilan almashadi; shu safar hazil pufagi ham chiqmaydi.
- **Muqobil chiplar:** baliq/tovuq/dukkakli/tuxum (oqsil qoidasida — tovuq/baliq/tuxum/dukkakli). Chip bosilsa, qidiruv oynasi shu guruhning kunlik qoldiqqa sig'adigan taomlari bilan ochiladi.
- **Cheklovlar:** haftada ko'pi bilan 1 marta (`prefs.bx.last`). Birinchi 7 kunlik foydalanuvchiga chiqmaydi. «Bunday maslahat kerak emas» → `prefs.bx.off`; Profil → Eslatmalar → «Bir xillik maslahati» kalitida qayta yoqiladi.
- **Statistika:** `bixil.korsatildi.<guruh>`, `chip_bosildi`, `yopildi`, `ochirildi`, `yoqildi`. Admin → Harakat bo'limida `#bxRow` qatori.

<!-- AVTOMATIK-BOSH (tools/retsept-hujjat.js) -->
## Manba jadvali (v87, 271 qator) — `node tools/retsept-hujjat.js`

- **Retsept hisobi (masalliqlar grammi):** 101
- **USDA — eng yaqin:** 15
- **USDA — aynan:** 48
- **Retsept hisobi (standart retsept):** 100
- **Скурихин (MDH jadvali):** 6
- **Ishlab chiqaruvchi yorlig'i:** 1

«Retsept hisobi» — taom USDA'da yo'q, uning qiymati masalliqlar (har biri o'z manbasidan: USDA / Скурихин / yorliq) grammidan hisoblangan; USDA'dan «tayyor taom» sifatida olinmagan.

| Taom | Fayl | Manba turi | Masalliq / yozuv | kkal/100 g |
|---|---|---|---|---|
| Ko'k choy (limonli, shakarsiz) (`kok-choy-limon`) | 8a | Retsept hisobi (masalliqlar grammi) | 97 g USDA 171917 («Beverages, tea, green, brewed, regular»); 3 g USDA 167747 («Lemon juice, raw») | 2 |
| Ko'k choy (asal bilan) (`kok-choy-asal`) | 8a | Retsept hisobi (masalliqlar grammi) | 95 g USDA 171917 («Beverages, tea, green, brewed, regular»); 5 g USDA 169640 («Honey») | 16 |
| Jasmin choy (ko'k, shakarsiz) (`jasmin-choy`) | 8a | USDA — eng yaqin | USDA 171917 («Beverages, tea, green, brewed, regular») → yashil choy (damlangan) — jasmin xushbo'yligi kkalga ta'sir qilmaydi | 1 |
| Yalpizli choy (qora, shakarsiz) (`yalpizli-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 99 g USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); 1 g USDA 173475 («Spearmint, fresh») | 1 |
| Yalpizli ko'k choy (shakarsiz) (`yalpizli-kok-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 99 g USDA 171917 («Beverages, tea, green, brewed, regular»); 1 g USDA 173475 («Spearmint, fresh») | 1 |
| Zanjabilli choy (shakarsiz) (`zanjabilli-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 97 g USDA 173232 («Beverages, tea, herb, other than chamomile, brewed»); 3 g USDA 169231 («Ginger root, raw») | 3 |
| Zanjabilli choy (limon va asal bilan) (`zanjabil-limon-asal`) | 8a | Retsept hisobi (masalliqlar grammi) | 88 g USDA 173232 («Beverages, tea, herb, other than chamomile, brewed»); 3 g USDA 169231 («Ginger root, raw»); 3 g USDA 167747 («Lemon juice, raw»); 6 g USDA 169640 («Honey») | 22 |
| Zanjabilli ko'k choy (shakarsiz) (`zanjabilli-kok-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 97 g USDA 171917 («Beverages, tea, green, brewed, regular»); 3 g USDA 169231 («Ginger root, raw») | 3 |
| Na'matakli choy (shakarsiz) (`namatakli-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 97 g USDA 173232 («Beverages, tea, herb, other than chamomile, brewed»); 3 g USDA 168998 («Rose Hips, wild (Northern Plains Indians)») | 6 |
| Moychechak choy (romashka, shakarsiz) (`moychechak-choy`) | 8a | USDA — aynan | USDA 174156 («Beverages, tea, herb, brewed, chamomile») | 1 |
| Karkade (gibiskus choyi, shakarsiz) (`karkade`) | 8a | USDA — aynan | USDA 171946 («Beverages, tea, hibiscus, brewed») | 0 |
| Mevali choy (shakarsiz) (`mevali-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 95 g USDA 173232 («Beverages, tea, herb, other than chamomile, brewed»); 5 g USDA 171688 («Apples, raw, with skin») | 4 |
| Dolchinli choy (qora, shakarsiz) (`dolchinli-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 99.5 g USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); 0.5 g USDA 171320 («Spices, cinnamon, ground») | 2 |
| Sutli choy (shakarsiz) (`sutli-choy`) | 8a | Retsept hisobi (standart retsept) | damlangan qora choy — USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); sut 3,2 % — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 13 |
| Shirchoy (tuzli, sariyog'siz) (`shirchoy-tuzli`) | 8a | Retsept hisobi (standart retsept) | damlangan qora choy — USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); sut 3,2 % — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); tuz — USDA 173468 («Salt, table») | 31 |
| Shirchoy (qaymoqli, tuzli) (`shirchoy-qaymoqli`) | 8a | Retsept hisobi (standart retsept) | damlangan qora choy — USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); sut 3,2 % — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); qaymoq (yog'li) — USDA 170859 («Cream, fluid, heavy whipping»); tuz — USDA 173468 («Salt, table») | 48 |
| Masala choy (sutli, shirin) (`masala-choy`) | 8a | Retsept hisobi (masalliqlar grammi) | 55 g USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); 38 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 5 g USDA 169655 («Sugars, granulated»); 0.5 g USDA 170919 («Spices, cardamom»); 0.5 g USDA 170926 («Spices, ginger, ground»); 0.5 g USDA 171320 («Spices, cinnamon, ground»); 0.5 g USDA 170931 («Spices, pepper, black») | 49 |
| Masala choy (sutli, shakarsiz) (`masala-choy-shakarsiz`) | 8a | Retsept hisobi (masalliqlar grammi) | 58 g USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); 40 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 0.5 g USDA 170919 («Spices, cardamom»); 0.5 g USDA 170926 («Spices, ginger, ground»); 0.5 g USDA 171320 («Spices, cinnamon, ground»); 0.5 g USDA 170931 («Spices, pepper, black») | 31 |
| Matcha choy (sof, shakarsiz) (`matcha`) | 8a | Retsept hisobi (masalliqlar grammi) | 1 g yorliq: Matcha Green Tea Powder Grade A (OFF 7340130501200) | 3 |
| Matcha latte (kafe, sutli, shakarsiz) (`matcha-latte`) | 8a | Retsept hisobi (masalliqlar grammi) | 75 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 1.2 g yorliq: Matcha Green Tea Powder Grade A (OFF 7340130501200) | 50 |
| Ays matcha latte (kafe, muzli, shirin) (`ays-matcha-latte`) | 8a | Retsept hisobi (masalliqlar grammi) | 60 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 1.2 g yorliq: Matcha Green Tea Powder Grade A (OFF 7340130501200); 6.5 g USDA 169655 («Sugars, granulated») | 66 |
| Muzli choy (qora, limonli, shishada, shirin) (`muzli-choy-qora`) | 8a | Retsept hisobi (masalliqlar grammi) | 90 g USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); 8 g USDA 169655 («Sugars, granulated»); 2 g USDA 167747 («Lemon juice, raw») | 32 |
| Muzli ko'k choy (shishada, shirin) (`muzli-choy-kok`) | 8a | USDA — aynan | USDA 174128 («Beverages, tea, green, ready-to-drink, sweetened») | 27 |
| Muzli choy (shakarsiz) (`muzli-choy-shakarsiz`) | 8a | USDA — eng yaqin | USDA 174873 («Beverages, tea, instant, unsweetened, prepared with water») → eriydigan choy, suvda — shishadagi shakarsiz sovuq choyga eng yaqin | 1 |
| Ays-ti (kafe, shaftolili) (`ays-ti-shaftoli`) | 8a | Retsept hisobi (masalliqlar grammi) | 75 g USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); 10 g USDA 169928 («Peaches, yellow, raw»); 6 g USDA 169655 («Sugars, granulated») | 28 |
| Ays-ti (kafe, malinali) (`ays-ti-malina`) | 8a | Retsept hisobi (masalliqlar grammi) | 75 g USDA 173227 («Beverages, tea, black, brewed, prepared with tap water»); 10 g USDA 167755 («Raspberries, raw»); 6 g USDA 169655 («Sugars, granulated»); 2 g USDA 167747 («Lemon juice, raw») | 30 |
| Kapuchino (kafe, shakarsiz) (`kapuchino-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 25 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 75 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 48 |
| Kapuchino (kafe, 2 choy qoshiq shakar bilan) (`kapuchino-shakar`) | 8a | Retsept hisobi (masalliqlar grammi) | 24 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 72 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 4 g USDA 169655 («Sugars, granulated») | 62 |
| Kapuchino (bodom sutida, shakarsiz) (`kapuchino-bodom`) | 8a | Retsept hisobi (masalliqlar grammi) | 25 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 75 g USDA 174832 («Beverages, almond milk, unsweetened, shelf stable») | 14 |
| Latte (kafe, shakarsiz) (`latte-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 85 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 53 |
| Latte (kafe, 2 choy qoshiq shakar bilan) (`latte-shakar`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 82 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 3 g USDA 169655 («Sugars, granulated») | 63 |
| Latte (yog'siz sutda, shakarsiz) (`latte-yogsiz`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 85 g USDA 171269 («Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim)») | 30 |
| Latte (bodom sutida, shakarsiz) (`latte-bodom`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 85 g USDA 174832 («Beverages, almond milk, unsweetened, shelf stable») | 14 |
| Latte (soya sutida) (`latte-soya`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 85 g USDA 172446 («Soymilk, original and vanilla, unfortified») | 47 |
| Flet uayt (kafe, shakarsiz) (`flet-uayt`) | 8a | Retsept hisobi (masalliqlar grammi) | 30 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 70 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 45 |
| Amerikano (kafe, shakarsiz) (`amerikano-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 20 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared») | 2 |
| Amerikano (sut bilan, shakarsiz) (`amerikano-sut`) | 8a | Retsept hisobi (masalliqlar grammi) | 20 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 15 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 11 |
| Mokko (kafe, qaymoqli) (`mokko-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 18 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 70 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 2.5 g USDA 169593 («Cocoa, dry powder, unsweetened»); 6 g USDA 169655 («Sugars, granulated»); 3.5 g USDA 170860 («Cream, whipped, cream topping, pressurized») | 82 |
| Raf (kafe, vanilli) (`raf-vanil`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 30 g USDA 170857 («Cream, fluid, light (coffee cream or table cream)»); 48 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 7 g USDA 169655 («Sugars, granulated») | 116 |
| Karamel latte (kafe, sirop bilan) (`karamel-latte`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 77 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 8 g USDA 168841 («Toppings, butterscotch or caramel») | 66 |
| Vanil latte (kafe, sirop bilan) (`vanil-latte`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 78 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 5 g USDA 169655 («Sugars, granulated») | 68 |
| Yong'oqli latte (funduk siropi bilan) (`yongoq-latte`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 78 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 5 g USDA 169655 («Sugars, granulated») | 68 |
| Ays-kapuchino (muzli, shakarsiz) (`ays-kapuchino`) | 8a | Retsept hisobi (masalliqlar grammi) | 20 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 55 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 35 |
| Ays-latte (kafe, muzli, shakarsiz) (`ays-latte`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 55 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 35 |
| Ays-latte (karamelli, muzli) (`ays-karamel-latte`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 50 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 7 g USDA 168841 («Toppings, butterscotch or caramel») | 47 |
| Ays-amerikano (muzli, shakarsiz) (`ays-amerikano`) | 8a | Retsept hisobi (masalliqlar grammi) | 20 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared») | 2 |
| Frappe (kafe, qaymoqli, shirin) (`frappe`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 40 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 8 g USDA 169655 («Sugars, granulated»); 5 g USDA 170860 («Cream, whipped, cream topping, pressurized») | 70 |
| Frappe (karamelli, qaymoqli) (`frappe-karamel`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 171891 («Beverages, coffee, brewed, espresso, restaurant-prepared»); 40 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 10 g USDA 168841 («Toppings, butterscotch or caramel»); 5 g USDA 170860 («Cream, whipped, cream topping, pressurized») | 60 |
| Kakao (kafe, sutli, shirin) (`kakao-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 88 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 3 g USDA 169593 («Cocoa, dry powder, unsweetened»); 6 g USDA 169655 («Sugars, granulated») | 84 |
| Kakao (sutli, shakarsiz) (`kakao-shakarsiz`) | 8a | Retsept hisobi (masalliqlar grammi) | 96 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 4 g USDA 169593 («Cocoa, dry powder, unsweetened») | 68 |
| Issiq shokolad (kafe, qaymoqli) (`issiq-shokolad-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 85 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 4 g USDA 169593 («Cocoa, dry powder, unsweetened»); 7 g USDA 169655 («Sugars, granulated»); 4 g USDA 170860 («Cream, whipped, cream topping, pressurized») | 98 |
| Kafe limonadi (klassik, limonli) (`limonad-kafe-klassik`) | 8a | Retsept hisobi (masalliqlar grammi) | 8 g USDA 167747 («Lemon juice, raw»); 9 g USDA 169655 («Sugars, granulated»); 3 g USDA 167746 («Lemons, raw, without peel») | 37 |
| Kafe limonadi (mango-marakuya) (`limonad-mango-marakuya`) | 8a | Retsept hisobi (masalliqlar grammi) | 20 g USDA 169910 («Mangos, raw»); 8 g USDA 169110 («Passion-fruit juice, yellow, raw»); 7 g USDA 169655 («Sugars, granulated»); 5 g USDA 167747 («Lemon juice, raw») | 45 |
| Kafe limonadi (malinali) (`limonad-malina`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 167755 («Raspberries, raw»); 8 g USDA 169655 («Sugars, granulated»); 5 g USDA 167747 («Lemon juice, raw»); 2 g USDA 167746 («Lemons, raw, without peel») | 40 |
| Kafe limonadi (qulupnayli) (`limonad-qulupnay`) | 8a | Retsept hisobi (masalliqlar grammi) | 17 g USDA 167762 («Strawberries, raw»); 8 g USDA 169655 («Sugars, granulated»); 5 g USDA 167747 («Lemon juice, raw») | 38 |
| Kafe limonadi (shaftolili) (`limonad-shaftoli`) | 8a | Retsept hisobi (masalliqlar grammi) | 20 g USDA 169928 («Peaches, yellow, raw»); 8 g USDA 169655 («Sugars, granulated»); 5 g USDA 167747 («Lemon juice, raw») | 40 |
| Kafe limonadi (tarxunli, uy usulida) (`limonad-tarxun-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 0.5 g USDA 170937 («Spices, tarragon, dried»); 9 g USDA 169655 («Sugars, granulated»); 6 g USDA 167747 («Lemon juice, raw»); 2.5 g USDA 168156 («Lime juice, raw») | 38 |
| Kafe limonadi (moxito, alkogolsiz) (`moxito-kafe`) | 8a | Retsept hisobi (masalliqlar grammi) | 80 g USDA 173206 («Beverages, carbonated, SPRITE, lemon-lime, without caffeine»); 8 g USDA 168156 («Lime juice, raw»); 2 g USDA 173475 («Spearmint, fresh»); 7 g USDA 168155 («Limes, raw»); 3 g USDA 169655 («Sugars, granulated») | 49 |
| Kafe limonadi (kivili) (`limonad-kivi`) | 8a | Retsept hisobi (masalliqlar grammi) | 17 g USDA 168153 («Kiwifruit, green, raw»); 8 g USDA 169655 («Sugars, granulated»); 5 g USDA 167747 («Lemon juice, raw») | 42 |
| Kafe limonadi (apelsinli) (`limonad-apelsin`) | 8a | Retsept hisobi (masalliqlar grammi) | 22 g USDA 169098 («Orange juice, raw»); 8 g USDA 169655 («Sugars, granulated»); 5 g USDA 167747 («Lemon juice, raw») | 42 |
| Kafe limonadi (tarvuzli) (`limonad-tarvuz`) | 8a | Retsept hisobi (masalliqlar grammi) | 32 g USDA 167765 («Watermelon, raw»); 7 g USDA 169655 («Sugars, granulated»); 4 g USDA 167747 («Lemon juice, raw»); 2 g USDA 173475 («Spearmint, fresh») | 38 |
| Smuzi (qulupnay-banan, yogurtli) (`smuzi-qulupnay-banan`) | 8a | Retsept hisobi (masalliqlar grammi) | 40 g USDA 167762 («Strawberries, raw»); 30 g USDA 173944 («Bananas, raw»); 20 g USDA 171284 («Yogurt, plain, whole milk»); 10 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 58 |
| Smuzi (yashil: ismaloq, olma, banan, kivi) (`smuzi-yashil`) | 8a | Retsept hisobi (masalliqlar grammi) | 15 g USDA 168462 («Spinach, raw»); 25 g USDA 171688 («Apples, raw, with skin»); 25 g USDA 173944 («Bananas, raw»); 15 g USDA 168153 («Kiwifruit, green, raw») | 48 |
| Smuzi (mango-banan) (`smuzi-mango-banan`) | 8a | Retsept hisobi (masalliqlar grammi) | 40 g USDA 169910 («Mangos, raw»); 30 g USDA 173944 («Bananas, raw»); 15 g USDA 171284 («Yogurt, plain, whole milk»); 15 g USDA 169098 («Orange juice, raw») | 67 |
| Smuzi (rezavor mevali: malina, qulupnay, chernika) (`smuzi-rezavor`) | 8a | Retsept hisobi (masalliqlar grammi) | 20 g USDA 167755 («Raspberries, raw»); 20 g USDA 167762 («Strawberries, raw»); 20 g USDA 171711 («Blueberries, raw»); 25 g USDA 171284 («Yogurt, plain, whole milk»); 15 g USDA 173944 («Bananas, raw») | 57 |
| Smuzi (banan-suli, sutli) (`smuzi-banan-suli`) | 8a | Retsept hisobi (masalliqlar grammi) | 30 g USDA 173944 («Bananas, raw»); 6 g USDA 169705 («Oats»); 60 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 4 g USDA 169640 («Honey») | 99 |
| Milksheyk (vanilli) (`milksheyk-vanil`) | 8a | USDA — aynan | USDA 170884 («Milk shakes, thick vanilla») | 112 |
| Milksheyk (shokoladli) (`milksheyk-shokolad`) | 8a | USDA — aynan | USDA 170883 («Milk shakes, thick chocolate») | 119 |
| Milksheyk (qulupnayli) (`milksheyk-qulupnay`) | 8a | Retsept hisobi (masalliqlar grammi) | 50 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 42 g USDA 168810 («Ice creams, strawberry»); 8 g USDA 167762 («Strawberries, raw») | 114 |
| Milksheyk (bananli) (`milksheyk-banan`) | 8a | Retsept hisobi (masalliqlar grammi) | 50 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 30 g USDA 167575 («Ice creams, vanilla»); 20 g USDA 173944 («Bananas, raw») | 110 |
| Milksheyk (karamelli) (`milksheyk-karamel`) | 8a | Retsept hisobi (masalliqlar grammi) | 50 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 40 g USDA 167575 («Ice creams, vanilla»); 10 g USDA 168841 («Toppings, butterscotch or caramel») | 135 |
| Apelsin fresh (yangi siqilgan) (`fresh-apelsin`) | 8a | USDA — aynan | USDA 169098 («Orange juice, raw») | 45 |
| Olma fresh (yangi siqilgan) (`fresh-olma`) | 8a | Скурихин (MDH jadvali) | Скурихин: Сок яблочный (https://health-diet.ru/base_of_food/sostav/371.php) | 46 |
| Anor fresh (yangi siqilgan) (`fresh-anor`) | 8a | Скурихин (MDH jadvali) | Скурихин: Сок гранатовый (https://health-diet.ru/base_of_food/sostav/13593.php) | 56 |
| Sabzi fresh (yangi siqilgan) (`fresh-sabzi`) | 8a | Скурихин (MDH jadvali) | Скурихин: Морковный сок (https://health-diet.ru/base_of_food/sostav/13730.php) | 56 |
| Greypfrut fresh (yangi siqilgan) (`fresh-greypfrut`) | 8a | USDA — aynan | USDA 167774 («Grapefruit juice, pink, raw») | 39 |
| Apelsin-sabzi fresh (yangi siqilgan) (`fresh-apelsin-sabzi`) | 8a | Retsept hisobi (masalliqlar grammi) | 50 g USDA 169098 («Orange juice, raw»); 50 g Скурихин: Морковный сок (https://health-diet.ru/base_of_food/sostav/13730.php) | 51 |
| Quruq meva kompoti (shakarsiz) (`kompot-quruq-shakarsiz`) | 8a | Retsept hisobi (standart retsept) · ichida: olxo'ri, olma, o'rik qoqi, mayiz | quruq olma — USDA 171691 («Apples, dried, sulfured, uncooked»); o'rik qoqi — USDA 173941 («Apricots, dried, sulfured, uncooked»); mayiz — USDA 168166 («Raisins, seeded»); quruq olxo'ri (tkemali o'rniga) — USDA 168162 («Plums, dried (prunes), uncooked») | 40 |
| Olcha kompoti (shakarli) (`kompot-olcha`) | 8a | Retsept hisobi (standart retsept) | olcha — USDA 173954 («Cherries, sour, red, raw»); shakar — USDA 169655 («Sugars, granulated») | 47 |
| Ayron (yalpiz va bodring bilan) (`ayron-yalpiz`) | 8a | Retsept hisobi (standart retsept) | qatiq — USDA 171284 («Yogurt, plain, whole milk»); bodring — USDA 168409 («Cucumber, with peel, raw»); yalpiz — USDA 173475 («Spearmint, fresh»); tuz — USDA 173468 («Salt, table») | 31 |
| Energetik (shakarli, banka) (`energetik-shakarli`) | 8a | USDA — eng yaqin | USDA 171937 («Beverages, Energy drink, ROCKSTAR») → Rockstar (brend) — umumiy shakarli energetik o'rniga | 58 |
| Energetik (shakarsiz, zero) (`energetik-shakarsiz`) | 8a | USDA — eng yaqin | USDA 171938 («Beverages, Energy drink, ROCKSTAR, sugar free») → Rockstar sugar free (brend) — umumiy shakarsiz energetik o'rniga | 4 |
| Mol go'shtli sho'rva (uyda) (`shurva-mol-uy`) | 8b | Retsept hisobi (standart retsept) | mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw») | 52 |
| Qovurma sho'rva (qo'y go'shtli) (`qovurma-shurva`) | 8b | Retsept hisobi (standart retsept) | qo'y go'shti (yelka, yog'li, xom) — USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw»); no'xat (quruq) — USDA 173756 («Chickpeas (garbanzo beans, bengal gram), mature seeds, raw») | 74 |
| Qaynatma sho'rva (qo'y go'shtli) (`qaynatma-shurva`) | 8b | Retsept hisobi (standart retsept) | qo'y go'shti (yelka, yog'li, xom) — USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average») | 59 |
| Sho'rva (mol go'shtli, kafe) (`kafe-mol-shurva`) | 8b | Retsept hisobi (standart retsept) | mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); dumba yog'i — USDA 172572 («Lamb, Australian, imported, fresh, separable fat, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw»); no'xat (quruq) — USDA 173756 («Chickpeas (garbanzo beans, bengal gram), mature seeds, raw») | 71 |
| Ko'za sho'rva (qo'y go'shti, no'xatli) (`kuza-shurva`) | 8b | Retsept hisobi (standart retsept) | qo'y go'shti (yelka, yog'li, xom) — USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw»); dumba yog'i — USDA 172572 («Lamb, Australian, imported, fresh, separable fat, raw»); no'xat (quruq) — USDA 173756 («Chickpeas (garbanzo beans, bengal gram), mature seeds, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw») | 93 |
| Kifta sho'rva (qiyma sharchali) (`kifta-shurva`) | 8b | Retsept hisobi (standart retsept) | mol qiymasi (80/20) — USDA 174036 («Beef, ground, 80% lean meat / 20% fat, raw»); guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); piyoz — USDA 170000 («Onions, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw») | 57 |
| Frikadelli sho'rva (`frikadelli-shurva`) | 8b | Retsept hisobi (standart retsept) | mol qiymasi (80/20) — USDA 174036 («Beef, ground, 80% lean meat / 20% fat, raw»); piyoz — USDA 170000 («Onions, raw»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); makaron/lag'mon xamiri (quruq) — USDA 169736 («Pasta, dry, enriched»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); petrushka — USDA 170416 («Parsley, fresh») | 56 |
| Piyova (piyozli sho'rva, qo'y go'shtli) (`piyova`) | 8b | Retsept hisobi (standart retsept) | qo'y go'shti (yelka, yog'li, xom) — USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); piyoz — USDA 170000 («Onions, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); sabzi — USDA 170393 («Carrots, raw») | 65 |
| Mosh sho'rva (go'shtli, kartoshkali) (`mosh-shurva`) | 8b | Retsept hisobi (standart retsept) | mosh (quruq) — USDA 174256 («Mung beans, mature seeds, raw»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average») | 68 |
| Moshxo'rda (qatiq bilan) (`moshxorda-qatiq`) | 8b | Retsept hisobi (standart retsept) | mosh (quruq) — USDA 174256 («Mung beans, mature seeds, raw»); guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); qatiq (suzishda) — USDA 171284 («Yogurt, plain, whole milk») | 77 |
| Moshxo'rda (tovuqli) (`moshxorda-tovuq`) | 8b | Retsept hisobi (standart retsept) | mosh (quruq) — USDA 174256 («Mung beans, mature seeds, raw»); guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); tovuq go'shti (terili, xom) — USDA 171447 («Chicken, broilers or fryers, meat and skin, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average») | 76 |
| Mastava (tovuqli) (`mastava-tovuq`) | 8b | Retsept hisobi (standart retsept) | guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); tovuq go'shti (terili, xom) — USDA 171447 («Chicken, broilers or fryers, meat and skin, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw») | 67 |
| Mastava (qatiq bilan) (`mastava-qatiq`) | 8b | Retsept hisobi (standart retsept) | guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); qatiq (suzishda) — USDA 171284 («Yogurt, plain, whole milk»); petrushka (suzishda) — USDA 170416 («Parsley, fresh») | 67 |
| Mastava (qo'y go'shtli) (`mastava-qoy`) | 8b | Retsept hisobi (standart retsept) | guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); qo'y go'shti (yelka, yog'li, xom) — USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw») | 72 |
| Umoch oshi (`umoch-oshi`) | 8b | Retsept hisobi (standart retsept) | un — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw») | 65 |
| Go'ja oshi (qatiqli, jo'xori) (`goja-oshi`) | 8b | Retsept hisobi (standart retsept) | jo'xori (oqlangan) — USDA 169716 («Sorghum grain»); tuz — USDA 173468 («Salt, table»); qatiq (suzishda) — USDA 171284 («Yogurt, plain, whole milk») | 42 |
| Go'ja sho'rva (go'shtli) (`goja-gosht`) | 8b | Retsept hisobi (standart retsept) | jo'xori (oqlangan) — USDA 169716 («Sorghum grain»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); qatiq (suzishda) — USDA 171284 («Yogurt, plain, whole milk») | 64 |
| Atala (unli suyuq oshi) (`atala`) | 8b | Retsept hisobi (standart retsept) | un — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); piyoz — USDA 170000 («Onions, raw») | 62 |
| Atala (sutli) (`atala-sutli`) | 8b | Retsept hisobi (standart retsept) | un — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sariyog' — USDA 173410 («Butter, salted»); sut 3,2 % — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») | 86 |
| Lag'mon suyuq (mol go'shtli, uyda) (`lagmon-mol-uy`) | 8b | Retsept hisobi (standart retsept) | makaron/lag'mon xamiri (quruq) — USDA 169736 («Pasta, dry, enriched»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); piyoz — USDA 170000 («Onions, raw»); sabzi — USDA 170393 («Carrots, raw»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); sarimsoq — USDA 169230 («Garlic, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw») | 96 |
| Tovuq lapsha sho'rva (uyda) (`tovuq-lapsha-uy`) | 8b | Retsept hisobi (standart retsept) | tovuq go'shti (terili, xom) — USDA 171447 («Chicken, broilers or fryers, meat and skin, raw»); tuxumli lapsha (quruq) — USDA 169731 («Noodles, egg, dry, enriched»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); petrushka — USDA 170416 («Parsley, fresh») | 69 |
| Tovuqli guruch sho'rva (`tovuq-guruch-shurva`) | 8b | Retsept hisobi (standart retsept) | tovuq go'shti (terili, xom) — USDA 171447 («Chicken, broilers or fryers, meat and skin, raw»); guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); petrushka — USDA 170416 («Parsley, fresh») | 61 |
| Borsh (kafe, smetana bilan) (`borsh-kafe`) | 8b | Retsept hisobi (standart retsept) | mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); lavlagi — USDA 169145 («Beets, raw»); karam — USDA 169975 («Cabbage, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); shakar — USDA 169655 («Sugars, granulated»); limon sharbati — USDA 167747 («Lemon juice, raw»); smetana (suzishda) — USDA 171257 («Cream, sour, cultured») | 57 |
| Yashil borsh (shovul, tuxumli) (`yashil-borsh`) | 8b | Retsept hisobi (standart retsept) · ichida: shovul o'rniga ismaloq (ma'qullangan) | ismaloq (shovul o'rniga) — USDA 168462 («Spinach, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); smetana (suzishda) — USDA 171257 («Cream, sour, cultured») | 56 |
| Shchi (yangi karamli) (`shchi`) | 8b | Retsept hisobi (standart retsept) | karam — USDA 169975 («Cabbage, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); smetana (suzishda) — USDA 171257 («Cream, sour, cultured») | 50 |
| Shchi (tuzlangan karamdan) (`shchi-kislye`) | 8b | Retsept hisobi (standart retsept) | tuzlangan karam — USDA 169279 («Sauerkraut, canned, solids and liquids»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); smetana (suzishda) — USDA 171257 («Cream, sour, cultured») | 52 |
| Rassolnik (`rassolnik`) | 8b | Retsept hisobi (standart retsept) | tuzlangan bodring — USDA 168558 («Pickles, cucumber, dill or kosher dill»); perlovka (xom) — USDA 170284 («Barley, pearled, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); smetana (suzishda) — USDA 171257 («Cream, sour, cultured») | 56 |
| Solyanka (kafe, go'shtli assorti) (`solyanka-kafe`) | 8b | Retsept hisobi (standart retsept) | mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); qaynatilgan kolbasa (mol) — USDA 172012 («Bologna, beef»); dudlangan kolbasa (mol) — USDA 170606 («Sausage, beef, cured, cooked, smoked»); tuzlangan bodring — USDA 168558 («Pickles, cucumber, dill or kosher dill»); zaytun — USDA 169094 («Olives, ripe, canned (small-extra large)»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); piyoz — USDA 170000 («Onions, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); limon sharbati — USDA 167747 («Lemon juice, raw»); smetana (suzishda) — USDA 171257 («Cream, sour, cultured») | 85 |
| Solyanka (baliqli) (`solyanka-baliq`) | 8b | Retsept hisobi (standart retsept) | chortan — USDA 173680 («Fish, pike, northern, raw»); losos (xom) — USDA 175167 («Fish, salmon, Atlantic, farmed, raw»); tuzlangan bodring — USDA 168558 («Pickles, cucumber, dill or kosher dill»); zaytun — USDA 169094 («Olives, ripe, canned (small-extra large)»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); piyoz — USDA 170000 («Onions, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); limon sharbati — USDA 167747 («Lemon juice, raw») | 46 |
| Xarcho (gruzincha mol go'shtli sho'rva) (`xarcho`) | 8b | Retsept hisobi (standart retsept) · ichida: tkemali o'rniga quruq olxo'ri | mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); piyoz — USDA 170000 («Onions, raw»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); yong'oq — USDA 170187 («Nuts, walnuts, english»); sarimsoq — USDA 169230 («Garlic, raw»); kashnich — USDA 169997 («Coriander (cilantro) leaves, raw»); quruq olxo'ri (tkemali o'rniga) — USDA 168162 («Plums, dried (prunes), uncooked»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking») | 77 |
| Okroshka (kvasli) (`okroshka-kvas`) | 8b | Retsept hisobi (standart retsept) | non kvasi — Скурихин: Квас хлебный (https://health-diet.ru/base_of_food/sostav/133.php); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); qaynatilgan kolbasa (mol) — USDA 172012 («Bologna, beef»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); bodring — USDA 168409 («Cucumber, with peel, raw»); turp — USDA 169276 («Radishes, raw»); smetana — USDA 171257 («Cream, sour, cultured»); shivit — USDA 172233 («Dill weed, fresh») | 73 |
| Uxa (qizil baliqli) (`uxa-qizil-baliq`) | 8b | Retsept hisobi (standart retsept) | losos (xom) — USDA 175167 («Fish, salmon, Atlantic, farmed, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); petrushka — USDA 170416 («Parsley, fresh») | 44 |
| Qo'ziqorin krem-sho'rva (qaymoqli, kafe) (`qoziqorin-krem-kafe`) | 8b | Retsept hisobi (masalliqlar grammi) | 30 g USDA 169251 («Mushrooms, white, raw»); 10 g USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt»); 6 g USDA 170000 («Onions, raw»); 12 g USDA 170857 («Cream, fluid, light (coffee cream or table cream)»); 2 g USDA 173410 («Butter, salted») | 55 |
| Qovoq krem-sho'rva (`qovoq-krem`) | 8b | Retsept hisobi (masalliqlar grammi) | 40 g USDA 168448 («Pumpkin, raw»); 6 g USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt»); 6 g USDA 170393 («Carrots, raw»); 5 g USDA 170000 («Onions, raw»); 10 g USDA 170857 («Cream, fluid, light (coffee cream or table cream)»); 2 g USDA 173410 («Butter, salted») | 54 |
| Brokkoli krem-sho'rva (`brokkoli-krem`) | 8b | Retsept hisobi (masalliqlar grammi) | 35 g USDA 170379 («Broccoli, raw»); 8 g USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt»); 5 g USDA 170000 («Onions, raw»); 10 g USDA 170857 («Cream, fluid, light (coffee cream or table cream)»); 1 g USDA 173410 («Butter, salted») | 47 |
| Qo'ziqorinli sho'rva (kartoshkali) (`qoziqorin-shurva`) | 8b | Retsept hisobi (standart retsept) | qo'ziqorin (shampinon) — USDA 169251 («Mushrooms, white, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); petrushka — USDA 170416 («Parsley, fresh»); smetana (suzishda) — USDA 171257 («Cream, sour, cultured») | 33 |
| Tom yam (krevetkali, kokos sutida) (`tom-yam`) | 8b | Retsept hisobi (masalliqlar grammi) | 10 g USDA 171971 («Crustaceans, shrimp, mixed species, cooked, moist heat (may contain additives to retain moisture)»); 8 g USDA 169251 («Mushrooms, white, raw»); 12 g USDA 170173 («Nuts, coconut milk, canned (liquid expressed from grated meat and water)»); 5 g USDA 170457 («Tomatoes, red, ripe, raw, year round average»); 2 g USDA 168156 («Lime juice, raw»); 1 g USDA 169231 («Ginger root, raw»); 1 g USDA 170106 («Peppers, hot chili, red, raw»); 2 g USDA 170000 («Onions, raw»); 0.5 g USDA 169997 («Coriander (cilantro) leaves, raw»); 0.5 g USDA 169655 («Sugars, granulated») | 43 |
| Ramen (tovuqli, tuxumli sho'rva) (`ramen-tovuq-shurva`) | 8b | Retsept hisobi (masalliqlar grammi) | 25 g USDA 169737 («Pasta, cooked, enriched, without added salt»); 8 g USDA 172401 («Chicken, stewing, meat and skin, cooked, stewed»); 7 g USDA 171287 («Egg, whole, raw, fresh»); 3 g USDA 169251 («Mushrooms, white, raw»); 2 g USDA 170000 («Onions, raw»); 2 g USDA 174277 («Soy sauce made from soy and wheat (shoyu)»); 2 g USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 92 |
| Fo bo (vyetnamcha mol go'shtli lapsha sho'rva) (`fo-bo`) | 8b | Retsept hisobi (masalliqlar grammi) | 30 g USDA 168914 («Rice noodles, cooked»); 12 g USDA 169442 («Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered»); 3 g USDA 170000 («Onions, raw»); 1 g USDA 169997 («Coriander (cilantro) leaves, raw»); 0.5 g USDA 169231 («Ginger root, raw»); 1 g USDA 168156 («Lime juice, raw»); 1 g USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 62 |
| Gorox sho'rva (pallali no'xat pyure, dudlangan kolbasali) (`gorox-shurva`) | 8b | Retsept hisobi (standart retsept) · ichida: no'xat yormasi — USDA'da faqat pishgani | no'xat yormasi (pishgan) — USDA 172429 («Peas, split, mature seeds, cooked, boiled, without salt»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); dudlangan kolbasa (mol) — USDA 170606 («Sausage, beef, cured, cooked, smoked»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking») | 59 |
| Loviya sho'rva (kafe, go'shtli) (`loviya-shurva-kafe`) | 8b | Retsept hisobi (standart retsept) | loviya (quruq) — USDA 175193 («Beans, kidney, all types, mature seeds, raw»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking») | 67 |
| Kartoshkali sho'rva (uyda) (`kartoshka-shurva-uy`) | 8b | Retsept hisobi (standart retsept) | kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); petrushka — USDA 170416 («Parsley, fresh») | 48 |
| Sabzavotli sho'rva (go'shtsiz) (`sabzavotli-shurva`) | 8b | Retsept hisobi (standart retsept) | kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); karam — USDA 169975 («Cabbage, raw»); qovoqcha — USDA 170487 («Squash, summer, all varieties, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); bulg'or qalampiri — USDA 170108 («Peppers, sweet, red, raw»); yashil loviya — USDA 169961 («Beans, snap, green, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); petrushka — USDA 170416 («Parsley, fresh») | 29 |
| Pomidorli sho'rva (uyda, guruchli) (`pomidor-shurva-uy`) | 8b | Retsept hisobi (standart retsept) | pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); piyoz — USDA 170000 («Onions, raw»); sabzi — USDA 170393 («Carrots, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); guruch (xom) — USDA 168877 («Rice, white, long-grain, regular, raw, enriched»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking»); sarimsoq — USDA 169230 («Garlic, raw») | 43 |
| Yasmiq sho'rva (mol go'shtli) (`yasmiq-mol`) | 8b | Retsept hisobi (standart retsept) | yasmiq (quruq) — USDA 172420 («Lentils, raw»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking») | 70 |
| Grechka sho'rva (go'shtli) (`grechka-shurva`) | 8b | Retsept hisobi (standart retsept) | grechka (quruq) — USDA 170685 («Buckwheat groats, roasted, dry»); kartoshka — USDA 170026 («Potatoes, flesh and skin, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); mol go'shti (kurak, yog'li, xom) — USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw»); paxta yog'i — USDA 171024 («Oil, cottonseed, salad or cooking») | 56 |
| Sutli guruch sho'rva (suyuq) (`sutli-guruch-shurva`) | 8b | Retsept hisobi (standart retsept) | guruch (dumaloq, xom) — USDA 168931 («Rice, white, short-grain, raw, unenriched»); sut 3,2 % — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); sariyog' — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated») | 90 |
| Minestrone (italyancha sabzavotli sho'rva) (`minestrone`) | 8b | Retsept hisobi (masalliqlar grammi) | 6 g USDA 173740 («Beans, kidney, all types, mature seeds, cooked, boiled, without salt»); 6 g USDA 169737 («Pasta, cooked, enriched, without added salt»); 6 g USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt»); 4 g USDA 170393 («Carrots, raw»); 3 g USDA 169988 («Celery, raw»); 4 g USDA 170000 («Onions, raw»); 5 g USDA 168464 («Squash, summer, crookneck and straightneck, raw»); 10 g USDA 170457 («Tomatoes, red, ripe, raw, year round average»); 2 g USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); 1 g USDA 170848 («Cheese, parmesan, hard») | 50 |
| Yayla sho'rva (qatiqli guruch sho'rva) (`yayla-shurva`) | 8b | Retsept hisobi (masalliqlar grammi) | 30 g USDA 171284 («Yogurt, plain, whole milk»); 8 g USDA 168878 («Rice, white, long-grain, regular, enriched, cooked»); 1.5 g USDA 172184 («Egg, yolk, raw, fresh»); 1.5 g USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); 1.5 g USDA 173410 («Butter, salted»); 0.5 g USDA 173475 («Spearmint, fresh») | 50 |
| Shirmoy non (sutli, kunjutli) (`shirmoy-non`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); sariyog' — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); quruq xamirturush — USDA 175043 («Leavening agents, yeast, baker's, active dry»); kunjut — USDA 170150 («Seeds, sesame seeds, whole, dried») | 305 |
| Jizzali non (`jizzali-non`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); jizza (qovurilgan qoldiq) — USDA 172497 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, cooked, braised»); jizza (dumba yog'i) — Скурихин: Жир бараний топленый (https://health-diet.ru/base_of_food/sostav/840.php); piyoz — USDA 170000 («Onions, raw»); quruq xamirturush — USDA 175043 («Leavening agents, yeast, baker's, active dry») | 303 |
| Piyozli non (`piyozli-non`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); quruq xamirturush — USDA 175043 («Leavening agents, yeast, baker's, active dry») | 270 |
| Pirojki (duxovkada, kartoshkali) (`pirojki-duxovka-kartoshka`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); sariyog' — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); xamirturush (presslangan) — USDA 175042 («Leavening agents, yeast, baker's, compressed»); kartoshka (xom, tozalangan; qaynatib ezilgan) — USDA 170027 («Potatoes, russet, flesh and skin, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i (piyoz qovurishga) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); tuxum (ustiga surtish) — USDA 171287 («Egg, whole, raw, fresh») | 239 |
| Pirojki (duxovkada, go'shtli) (`pirojki-duxovka-gosht`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); sariyog' — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); xamirturush (presslangan) — USDA 175042 («Leavening agents, yeast, baker's, compressed»); mol qiymasi (xom, yog'i 10 %) — USDA 174030 («Beef, ground, 90% lean meat / 10% fat, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); tuxum (ustiga surtish) — USDA 171287 («Egg, whole, raw, fresh») | 303 |
| Pirojki (duxovkada, karamli) (`pirojki-duxovka-karam`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); sariyog' — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); xamirturush (presslangan) — USDA 175042 («Leavening agents, yeast, baker's, compressed»); karam — USDA 169975 («Cabbage, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); qaynatilgan tuxum — USDA 173424 («Egg, whole, cooked, hard-boiled»); tuxum (ustiga surtish) — USDA 171287 («Egg, whole, raw, fresh») | 241 |
| Pirojki (duxovkada, olmali) (`pirojki-duxovka-olma`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); sariyog' — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); xamirturush (presslangan) — USDA 175042 («Leavening agents, yeast, baker's, compressed»); olma (po'stsiz) — USDA 171689 («Apples, raw, without skin»); shakar (iching) — USDA 169655 («Sugars, granulated»); tuxum (ustiga surtish) — USDA 171287 («Egg, whole, raw, fresh») | 251 |
| Kruassan (pishloqli) (`kruassan-pishloq`) | 8c | USDA — aynan | USDA 174989 («Croissants, cheese») | 414 |
| Sushki (baranki, quruq halqa non) (`sushki`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); shakar — USDA 169655 («Sugars, granulated»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); xamirturush (presslangan) — USDA 175042 («Leavening agents, yeast, baker's, compressed»); kunjut — USDA 170150 («Seeds, sesame seeds, whole, dried») | 374 |
| Grenki (tuxum-sutga botirib qovurilgan non) (`grenki`) | 8c | USDA — aynan | USDA 174998 («French toast, prepared from recipe, made with low fat (2%) milk») | 229 |
| Bulochka (mak urug'li) (`bulochka-mak`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); shakar (xamirga) — USDA 169655 («Sugars, granulated»); sariyog' — USDA 173410 («Butter, salted»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); xamirturush (presslangan) — USDA 175042 («Leavening agents, yeast, baker's, compressed»); mak (ko'knor urug'i) — USDA 171330 («Spices, poppy seed»); shakar (iching) — USDA 169655 («Sugars, granulated»); tuxum (surtish) — USDA 171287 («Egg, whole, raw, fresh») | 354 |
| Echki suti (`echki-suti`) | 8c | USDA — aynan | USDA 171278 («Milk, goat, fluid, with added vitamin D») | 69 |
| Qatiq (zig'ir urug'i bilan) (`qatiq-zigir`) | 8c | Retsept hisobi (masalliqlar grammi) | 94 g USDA 171284 («Yogurt, plain, whole milk»); 6 g USDA 169414 («Seeds, flaxseed») | 89 |
| Tvorog (smetana bilan) (`tvorog-smetana`) | 8c | Retsept hisobi (masalliqlar grammi) | 80 g USDA 172179 («Cheese, cottage, creamed, large or small curd»); 20 g USDA 171257 («Cream, sour, cultured») | 118 |
| Tvorog (asal bilan) (`tvorog-asal`) | 8c | Retsept hisobi (masalliqlar grammi) | 88 g USDA 172179 («Cheese, cottage, creamed, large or small curd»); 12 g USDA 169640 («Honey») | 123 |
| Tvorogli massa (shirin, mayizli) (`tvorog-massa`) | 8c | Retsept hisobi (masalliqlar grammi) | 67 g USDA 172179 («Cheese, cottage, creamed, large or small curd»); 13 g USDA 169655 («Sugars, granulated»); 12 g USDA 173410 («Butter, salted»); 8 g USDA 168164 («Raisins, golden, seedless») | 226 |
| Yunon yogurti (kam yog'li, 2%) (`yogurt-yunon-2`) | 8c | USDA — aynan | USDA 170903 («Yogurt, Greek, plain, lowfat») | 73 |
| Eritilgan sariyog' (gi) (`sariyog-eritilgan`) | 8c | USDA — aynan | USDA 171314 («Butter, Clarified butter (ghee)») | 900 |
| Pishloq kosichka (chechil) (`pishloq-kosichka`) | 8c | Retsept hisobi (masalliqlar grammi) | 100 g USDA 171244 («Cheese, mozzarella, low moisture, part-skim») | 295 |
| Pishloq (qattiq, kam yog'li) (`pishloq-kam-yogli`) | 8c | USDA — eng yaqin | USDA 171292 («Cheese, cheddar, reduced fat») → kam yog'li cheddar — kam yog'li qattiq pishloqqa eng yaqin | 316 |
| Mol go'shti (xom, yog'siz) (`mol-gosht-xom`) | 8c | USDA — aynan | USDA 171760 («Beef, round, top round roast, boneless, separable lean only, trimmed to 0" fat, all grades, raw») | 121 |
| Mol go'shti (xom, yog'li) (`mol-gosht-xom-yogli`) | 8c | USDA — eng yaqin | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») → chuck (kurak) — yog'li mol go'shtiga eng yaqin kesim | 244 |
| Qiyma (mol, xom) (`mol-qiyma-xom`) | 8c | USDA — aynan | USDA 171796 («Beef, ground, 85% lean meat / 15% fat, raw») | 215 |
| Qo'y go'shti (xom) (`qoy-gosht-xom`) | 8c | USDA — aynan | USDA 174311 («Lamb, leg, whole (shank and sirloin), separable lean and fat, trimmed to 1/4" fat, choice, raw») | 230 |
| Qo'y qiymasi (xom) (`qoy-qiyma-xom`) | 8c | USDA — aynan | USDA 174370 («Lamb, ground, raw») | 282 |
| Tovuq ko'kragi (xom, terisiz) (`tovuq-kokrak-xom`) | 8c | USDA — aynan | USDA 171077 («Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw») | 120 |
| Tovuq soni (xom, terili) (`tovuq-son-xom`) | 8c | USDA — aynan | USDA 172385 («Chicken, broilers or fryers, thigh, meat and skin, raw») | 221 |
| Tovuq go'shti (butun, xom, terili) (`tovuq-butun-xom`) | 8c | USDA — aynan | USDA 171447 («Chicken, broilers or fryers, meat and skin, raw») | 215 |
| Kurka ko'kragi (xom) (`kurka-kokrak-xom`) | 8c | USDA — aynan | USDA 171098 («Turkey, whole, breast, meat only, raw») | 114 |
| Losos (xom) (`losos-xom`) | 8c | USDA — aynan | USDA 175167 («Fish, salmon, Atlantic, farmed, raw») | 208 |
| Mol jigari (xom) (`mol-jigar-xom`) | 8c | USDA — aynan | USDA 169451 («Beef, variety meats and by-products, liver, raw») | 135 |
| Befstroganov (mol go'shti smetana sousida) (`befstroganov`) | 8c | Retsept hisobi (standart retsept) | mol go'shti (son qismi, xom) — USDA 171816 («Beef, round, top round, steak, separable lean only, trimmed to 1/8" fat, all grades, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); smetana — USDA 171257 («Cream, sour, cultured»); tomat pastasi — USDA 170459 («Tomato products, canned, paste, without salt added»); un — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») | 219 |
| Chaxoxbili (tovuq pomidorda dimlangan) (`chaxoxbili`) | 8c | Retsept hisobi (standart retsept) | tovuq go'shti (terisi bilan, xom) — USDA 171447 («Chicken, broilers or fryers, meat and skin, raw»); piyoz — USDA 170000 («Onions, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); shirin qalampir — USDA 170108 («Peppers, sweet, red, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); sarimsoq — USDA 169230 («Garlic, raw»); kashnich — USDA 169997 («Coriander (cilantro) leaves, raw»); achchiq qalampir — USDA 170106 («Peppers, hot chili, red, raw») | 153 |
| Tovuq otbivnoyi (panirovkada qovurilgan file) (`tovuq-otbivnoy`) | 8c | USDA — eng yaqin | USDA 171475 («Chicken, broilers or fryers, breast, meat and skin, cooked, fried, batter») → panirovkada qovurilgan tovuq ko'kragi — otbivnoyga eng yaqin | 260 |
| Mol go'shti otbivnoyi (panirovkada) (`mol-otbivnoy`) | 8c | Retsept hisobi (standart retsept) | mol go'shti (son qismi, xom) — USDA 171816 («Beef, round, top round, steak, separable lean only, trimmed to 1/8" fat, all grades, raw»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); non suxari — USDA 174928 («Bread, crumbs, dry, grated, plain»); un — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); kungaboqar yog'i (yutilgan) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 265 |
| Zrazy (tuxum to'ldirmali go'shtli kotlet) (`zrazy`) | 8c | Retsept hisobi (standart retsept) | mol qiymasi (xom, yog'i 15 %) — USDA 171796 («Beef, ground, 85% lean meat / 15% fat, raw»); oq non — USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); piyoz — USDA 170000 («Onions, raw»); qaynatilgan tuxum (3 dona) — USDA 173424 («Egg, whole, cooked, hard-boiled»); non suxari — USDA 174928 («Bread, crumbs, dry, grated, plain»); kungaboqar yog'i (yutilgan) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 250 |
| Bug'da pishirilgan kotlet (mol go'shti) (`kotlet-bug`) | 8c | Retsept hisobi (standart retsept) | mol qiymasi (xom, yog'i 10 %) — USDA 174030 («Beef, ground, 90% lean meat / 10% fat, raw»); oq non — USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); piyoz — USDA 170000 («Onions, raw») | 189 |
| Kurka kotleti (`kurka-kotlet`) | 8c | Retsept hisobi (standart retsept) | kurka qiymasi (xom, yog'i 7 %) — USDA 172850 («Turkey, ground, 93% lean, 7% fat, raw»); oq non — USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); piyoz — USDA 170000 («Onions, raw»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); non suxari — USDA 174928 («Bread, crumbs, dry, grated, plain»); kungaboqar yog'i (yutilgan) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 216 |
| Tovuq ruleti (pishloq va qo'ziqorinli) (`tovuq-rulet`) | 8c | Retsept hisobi (standart retsept) | tovuq ko'krak (xom) — USDA 171077 («Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw»); qattiq pishloq — USDA 171241 («Cheese, gouda»); qo'ziqorin (shampinon, xom) — USDA 169251 («Mushrooms, white, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 194 |
| Tovuq boldiri (duxovkada, terili) (`tovuq-boldir-duxovka`) | 8c | USDA — aynan | USDA 173612 («Chicken, broilers or fryers, drumstick, meat and skin, cooked, roasted») | 191 |
| Tovuq qanoti (duxovkada, terili) (`tovuq-qanot-duxovka`) | 8c | USDA — aynan | USDA 173630 («Chicken, broilers or fryers, wing, meat and skin, cooked, roasted») | 254 |
| Kurka kolbasasi (qaynatilgan) (`kurka-kolbasa`) | 8c | USDA — eng yaqin | USDA 173857 («Bologna, turkey») → turkey bologna — qaynatilgan kurka kolbasasiga eng yaqin | 209 |
| Tovuq sosiskasi (`tovuq-sosiska`) | 8c | USDA — aynan | USDA 171624 («Frankfurter, chicken») | 223 |
| Kurka vetchinasi (`kurka-vetchina`) | 8c | USDA — eng yaqin | USDA 168092 («Ham, turkey, sliced, extra lean, prepackaged or deli») → turkey ham (deli) — kurka vetchinasi | 134 |
| Jigar pashteti (tovuq jigari) (`jigar-pashtet`) | 8c | USDA — eng yaqin | USDA 172928 («Pate, chicken liver, canned») → konserva tovuq jigari pashteti — uy pashtetiga eng yaqin | 201 |
| Kambala (pishgan) (`kambala`) | 8c | USDA — aynan | USDA 174197 («Fish, flatfish (flounder and sole species), cooked, dry heat») | 86 |
| Sudak (pishgan) (`sudak`) | 8c | USDA — eng yaqin | USDA 171997 («Fish, pike, walleye, cooked, dry heat») → walleye (Sander vitreus) — sudakning (Sander lucioperca) yaqin turi | 119 |
| Sibas (pishgan) (`sibas`) | 8c | USDA — aynan | USDA 173694 («Fish, sea bass, mixed species, cooked, dry heat») | 124 |
| Laqqa baliq (som, pishgan) (`laqqa-baliq`) | 8c | USDA — eng yaqin | USDA 173714 («Fish, catfish, channel, wild, cooked, dry heat») → channel catfish — laqqa (som) ga yaqin tur | 105 |
| Osetr (bakra, pishgan) (`osetr`) | 8c | USDA — aynan | USDA 175148 («Fish, sturgeon, mixed species, cooked, dry heat») | 135 |
| Xek (pishgan) (`xek`) | 8c | Retsept hisobi (masalliqlar grammi) | 100 g USDA 175161 («Fish, whiting, mixed species, cooked, dry heat») | 116 |
| Skumbriya (tuzlangan) (`skumbriya-tuzlangan`) | 8c | USDA — aynan | USDA 168149 («Fish, mackerel, salted») | 305 |
| Guruch garnir (sariyog'li) (`guruch-garnir`) | 8c | Retsept hisobi (masalliqlar grammi) | 96 g USDA 168878 («Rice, white, long-grain, regular, enriched, cooked»); 4 g USDA 173410 («Butter, salted») | 153 |
| Grechka garnir (sariyog'li) (`grechka-garnir`) | 8c | Retsept hisobi (masalliqlar grammi) | 96 g USDA 170686 («Buckwheat groats, roasted, cooked»); 4 g USDA 173410 («Butter, salted») | 117 |
| Makaron garnir (sariyog'li) (`makaron-garnir`) | 8c | Retsept hisobi (masalliqlar grammi) | 96 g USDA 169737 («Pasta, cooked, enriched, without added salt»); 4 g USDA 173410 («Butter, salted») | 180 |
| Makaron (pishloq bilan) (`makaron-pishloq`) | 8c | Retsept hisobi (masalliqlar grammi) | 82 g USDA 169737 («Pasta, cooked, enriched, without added salt»); 12 g USDA 171241 («Cheese, gouda»); 3 g USDA 173410 («Butter, salted») | 194 |
| Yosh kartoshka (sariyog' va shivitli) (`kartoshka-yosh`) | 8c | Retsept hisobi (masalliqlar grammi) | 93 g USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt»); 5 g USDA 173410 («Butter, salted»); 2 g USDA 172233 («Dill weed, fresh») | 117 |
| Kartoshka po-derevenski (duxovkada, bo'laklab) (`kartoshka-derevenski`) | 8c | Retsept hisobi (standart retsept) | kartoshka (po'sti bilan, xom) — USDA 170027 («Potatoes, russet, flesh and skin, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); paprika — USDA 171329 («Spices, paprika»); sarimsoq — USDA 169230 («Garlic, raw») | 162 |
| Suli bo'tqasi (tez tayyor, paketli, quruq) (`suli-paketli`) | 8c | USDA — eng yaqin | USDA 171663 («Cereals, QUAKER, Instant Oatmeal, apples and cinnamon, dry») → Quaker (olma-dolchinli) — paketli tez tayyor suliga eng yaqin | 366 |
| Mimoza salati (baliqli) (`mimoza`) | 8c | Retsept hisobi (standart retsept) | konserva losos (pushti) — USDA 175175 («Fish, salmon, pink, canned, drained solids»); qaynatilgan kartoshka — USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt»); qaynatilgan sabzi — USDA 170394 («Carrots, cooked, boiled, drained, without salt»); qaynatilgan tuxum (5 dona) — USDA 173424 («Egg, whole, cooked, hard-boiled»); piyoz — USDA 170000 («Onions, raw»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 210 |
| Bahor salati (bodring, rediska, tuxum, smetana) (`bahor-salati`) | 8c | Retsept hisobi (standart retsept) | bodring — USDA 168409 («Cucumber, with peel, raw»); rediska — USDA 169276 («Radishes, raw»); qaynatilgan tuxum (3 dona) — USDA 173424 («Egg, whole, cooked, hard-boiled»); ko'k piyoz — USDA 170005 («Onions, spring or scallions (includes tops and bulb), raw»); shivit — USDA 172233 («Dill weed, fresh»); smetana — USDA 171257 («Cream, sour, cultured») | 69 |
| Olivye salati (tovuqli) (`olivye-tovuq`) | 8c | Retsept hisobi (standart retsept) | qaynatilgan tovuq ko'krak — USDA 171478 («Chicken, broilers or fryers, breast, meat only, cooked, stewed»); qaynatilgan kartoshka — USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt»); qaynatilgan sabzi — USDA 170394 («Carrots, cooked, boiled, drained, without salt»); qaynatilgan tuxum (5 dona) — USDA 173424 («Egg, whole, cooked, hard-boiled»); tuzlangan bodring — USDA 168558 («Pickles, cucumber, dill or kosher dill»); konserva no'xat — USDA 170015 («Peas, green, canned, drained solids, rinsed in tap water»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 207 |
| Mujskoy kapriz salati (mol go'shti, pishloq) (`mujskoy-kapriz`) | 8c | Retsept hisobi (standart retsept) | qaynatilgan mol go'shti — USDA 169442 («Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered»); piyoz (sirkada marinadlangan) — USDA 170000 («Onions, raw»); sirka — USDA 172237 («Vinegar, distilled»); qaynatilgan tuxum (4 dona) — USDA 173424 («Egg, whole, cooked, hard-boiled»); qattiq pishloq — USDA 171241 («Cheese, gouda»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 284 |
| Tbilisi salati (loviya, mol go'shti) (`tbilisi-salat`) | 8c | Retsept hisobi (standart retsept) | qizil loviya (konserva) — USDA 174285 («Beans, kidney, red, mature seeds, canned, drained solids»); qaynatilgan mol go'shti — USDA 169442 («Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered»); shirin qizil qalampir — USDA 170108 («Peppers, sweet, red, raw»); qizil piyoz — USDA 170000 («Onions, raw»); yong'oq — USDA 170187 («Nuts, walnuts, english»); kashnich — USDA 169997 («Coriander (cilantro) leaves, raw»); sarimsoq — USDA 169230 («Garlic, raw»); achchiq qalampir — USDA 170106 («Peppers, hot chili, red, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); vino sirkasi — USDA 172240 («Vinegar, red wine») | 171 |
| Objorka salati (mol go'shti, qovurilgan sabzi va piyoz) (`obzhorka`) | 8c | Retsept hisobi (standart retsept) | qaynatilgan mol go'shti — USDA 169442 («Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered»); sabzi (qovurilgan) — USDA 170393 («Carrots, raw»); piyoz (qovurilgan) — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); tuzlangan bodring — USDA 168558 («Pickles, cucumber, dill or kosher dill»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 237 |
| Tovuqli salat (ananas va pishloq bilan) (`ananas-tovuq-salat`) | 8c | Retsept hisobi (standart retsept) | qaynatilgan tovuq ko'krak — USDA 171478 («Chicken, broilers or fryers, breast, meat only, cooked, stewed»); konserva ananas — USDA 169944 («Pineapple, canned, heavy syrup pack, solids and liquids»); qattiq pishloq — USDA 171241 («Cheese, gouda»); konserva makkajo'xori — USDA 169214 («Corn, sweet, yellow, canned, whole kernel, drained solids»); qaynatilgan tuxum (3 dona) — USDA 173424 («Egg, whole, cooked, hard-boiled»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 240 |
| Qo'ziqorinli salat (tovuq, tuxum, mayonez) (`qoziqorin-salat`) | 8c | Retsept hisobi (standart retsept) | qo'ziqorin (shampinon, xom) — USDA 169251 («Mushrooms, white, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); qaynatilgan tovuq ko'krak — USDA 171478 («Chicken, broilers or fryers, breast, meat only, cooked, stewed»); qaynatilgan tuxum (4 dona) — USDA 173424 («Egg, whole, cooked, hard-boiled»); qattiq pishloq — USDA 171241 («Cheese, gouda»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 254 |
| Loviyali salat (suxarik, kolbasa, mayonez) (`loviya-salat`) | 8c | Retsept hisobi (standart retsept) | qizil loviya (konserva) — USDA 174285 («Beans, kidney, red, mature seeds, canned, drained solids»); dudlangan kolbasa (mol+tovuq) — USDA 172953 («Sausage, Polish, beef with chicken, hot»); suxarik (kirieshki) — yorliq: Кириешки салями (OFF 4607010740191); konserva makkajo'xori — USDA 169214 («Corn, sweet, yellow, canned, whole kernel, drained solids»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular»); sarimsoq — USDA 169230 («Garlic, raw») | 240 |
| Sabzi salati (sarimsoq va mayonezli) (`sabzi-sarimsoq-salat`) | 8c | Retsept hisobi (standart retsept) | sabzi (xom, qirg'ichda) — USDA 170393 («Carrots, raw»); sarimsoq — USDA 169230 («Garlic, raw»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 148 |
| Lavlagi salati (olxo'ri qoqi va yong'oqli) (`lavlagi-chernosliv`) | 8c | Retsept hisobi (standart retsept) | qaynatilgan lavlagi — USDA 169146 («Beets, cooked, boiled, drained»); olxo'ri qoqi (chernosliv) — USDA 168162 («Plums, dried (prunes), uncooked»); yong'oq — USDA 170187 («Nuts, walnuts, english»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular»); sarimsoq — USDA 169230 («Garlic, raw») | 207 |
| Sabzavot salati (mayonezli) (`sabzavot-salat-mayonez`) | 8c | Retsept hisobi (standart retsept) | bodring — USDA 168409 («Cucumber, with peel, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); piyoz — USDA 170000 («Onions, raw»); shivit — USDA 172233 («Dill weed, fresh»); mayonez — USDA 171009 («Salad dressing, mayonnaise, regular») | 120 |
| Sabzavot salati (smetanali) (`sabzavot-salat-smetana`) | 8c | Retsept hisobi (standart retsept) | bodring — USDA 168409 («Cucumber, with peel, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); piyoz — USDA 170000 («Onions, raw»); shivit — USDA 172233 («Dill weed, fresh»); smetana — USDA 171257 («Cream, sour, cultured») | 52 |
| Kaprese salati (pomidor, motsarella) (`kaprese`) | 8c | Retsept hisobi (masalliqlar grammi) | 50 g USDA 170457 («Tomatoes, red, ripe, raw, year round average»); 35 g USDA 170845 («Cheese, mozzarella, whole milk»); 3 g USDA 172232 («Basil, fresh»); 7 g USDA 171413 («Oil, olive, salad or cooking»); 5 g USDA 172241 («Vinegar, balsamic») | 181 |
| Sezar salati (krevetkali) (`sezar-krevetka`) | 8c | Retsept hisobi (masalliqlar grammi) | 40 g USDA 169247 («Lettuce, cos or romaine, raw»); 25 g USDA 175180 («Crustaceans, shrimp, cooked»); 10 g USDA 172752 («Croutons, seasoned»); 7 g USDA 171247 («Cheese, parmesan, grated»); 12 g USDA 169055 («Salad dressing, caesar dressing, regular»); 6 g USDA 173424 («Egg, whole, cooked, hard-boiled») | 182 |
| Mevali salat (yogurtli) (`mevali-salat`) | 8c | Retsept hisobi (masalliqlar grammi) | 25 g USDA 171688 («Apples, raw, with skin»); 25 g USDA 173944 («Bananas, raw»); 20 g USDA 169097 («Oranges, raw, all commercial varieties»); 15 g USDA 168153 («Kiwifruit, green, raw»); 15 g USDA 171284 («Yogurt, plain, whole milk») | 63 |
| Xe (koreyscha marinadlangan baliq) (`xe-baliq`) | 8c | Retsept hisobi (standart retsept) | baliq filesi (zog'ora, xom) — USDA 171952 («Fish, carp, raw»); sirka — USDA 172237 («Vinegar, distilled»); piyoz — USDA 170000 («Onions, raw»); sabzi — USDA 170393 («Carrots, raw»); shirin qalampir — USDA 170108 («Peppers, sweet, red, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); qizil qalampir (maydalangan) — USDA 170932 («Spices, pepper, red or cayenne»); sarimsoq — USDA 169230 («Garlic, raw»); soya sousi — USDA 174277 («Soy sauce made from soy and wheat (shoyu)»); shakar — USDA 169655 («Sugars, granulated»); kashnich — USDA 169997 («Coriander (cilantro) leaves, raw») | 136 |
| Koreyscha bodring (`koreyscha-bodring`) | 8c | Retsept hisobi (standart retsept) | bodring — USDA 168409 («Cucumber, with peel, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); sirka — USDA 172237 («Vinegar, distilled»); sarimsoq — USDA 169230 («Garlic, raw»); shakar — USDA 169655 («Sugars, granulated»); soya sousi — USDA 174277 («Soy sauce made from soy and wheat (shoyu)»); qizil qalampir (maydalangan) — USDA 170932 («Spices, pepper, red or cayenne»); kashnich urug'i — USDA 170922 («Spices, coriander seed») | 80 |
| Koreyscha baqlajon (`koreyscha-baqlajon`) | 8c | Retsept hisobi (standart retsept) | baqlajon (xom) — USDA 169228 («Eggplant, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); shirin qizil qalampir — USDA 170108 («Peppers, sweet, red, raw»); sabzi — USDA 170393 («Carrots, raw»); piyoz — USDA 170000 («Onions, raw»); sarimsoq — USDA 169230 («Garlic, raw»); sirka — USDA 172237 («Vinegar, distilled»); soya sousi — USDA 174277 («Soy sauce made from soy and wheat (shoyu)»); shakar — USDA 169655 («Sugars, granulated»); qizil qalampir (maydalangan) — USDA 170932 («Spices, pepper, red or cayenne») | 103 |
| Baqlajon (qovurilgan) (`baqlajon-qovurilgan`) | 8c | Retsept hisobi (standart retsept) | baqlajon (xom) — USDA 169228 («Eggplant, raw»); un (belash) — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); kungaboqar yog'i (yutilgan) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); sarimsoq — USDA 169230 («Garlic, raw») | 170 |
| Qovoqcha (qovurilgan) (`qovoqcha-qovurilgan`) | 8c | Retsept hisobi (standart retsept) | qovoqcha (xom) — USDA 169291 («Squash, summer, zucchini, includes skin, raw»); un (belash) — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); kungaboqar yog'i (yutilgan) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); sarimsoq — USDA 169230 («Garlic, raw») | 125 |
| Lecho (qalampir va pomidor) (`lecho`) | 8c | Retsept hisobi (standart retsept) | shirin qizil qalampir — USDA 170108 («Peppers, sweet, red, raw»); pomidor — USDA 170457 («Tomatoes, red, ripe, raw, year round average»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); shakar — USDA 169655 («Sugars, granulated»); sirka — USDA 172237 («Vinegar, distilled»); sarimsoq — USDA 169230 («Garlic, raw») | 85 |
| Sabzavot aralashmasi (muzlatilgan, qaynatilgan) (`sabzavot-aralash`) | 8c | USDA — aynan | USDA 170472 («Vegetables, mixed, frozen, cooked, boiled, drained, without salt») | 65 |
| Rukkola (`rukkola`) | 8c | USDA — aynan | USDA 169387 («Arugula, raw») | 25 |
| Aysberg salati (`aysberg`) | 8c | USDA — aynan | USDA 169248 («Lettuce, iceberg (includes crisphead types), raw») | 14 |
| Bulg'or qalampiri (yashil) (`qalampir-yashil`) | 8c | USDA — aynan | USDA 170427 («Peppers, sweet, green, raw») | 20 |
| Qo'ziqorin (piyoz bilan qovurilgan) (`qoziqorin-qovurilgan`) | 8c | Retsept hisobi (standart retsept) | qo'ziqorin (shampinon, xom) — USDA 169251 («Mushrooms, white, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); sariyog' — USDA 173410 («Butter, salted») | 113 |
| Qo'ziqorin (marinadlangan, konserva) (`qoziqorin-marinad`) | 8c | USDA — eng yaqin | USDA 169254 («Mushrooms, canned, drained solids») → konserva qo'ziqorin (suyuqligisiz) — marinadlanganga eng yaqin | 25 |
| Olma (duxovkada pishirilgan) (`olma-duxovka`) | 8c | Retsept hisobi (masalliqlar grammi) | 100 g USDA 173929 («Apples, raw, without skin, cooked, microwave») | 56 |
| Olma pyuresi (shakarsiz) (`olma-pyure`) | 8c | USDA — aynan | USDA 171695 («Applesauce, canned, unsweetened, without added ascorbic acid») | 42 |
| Tsukatlar (shakarlangan mevalar) (`tsukat`) | 8c | USDA — eng yaqin | USDA 167781 («Candied fruit») → candied fruit — tsukat aralashmasi | 322 |
| Bodom (shakarli draje) (`bodom-shakarli`) | 8c | USDA — aynan | USDA 170656 («Candies, sugar-coated almonds») | 465 |
| Bodom (asalli qovurilgan) (`bodom-asalli`) | 8c | USDA — aynan | USDA 168592 («Nuts, almonds, honey roasted, unblanched») | 594 |
| Yeryong'oq (shakarli glazurda) (`yeryongoq-shakarli`) | 8c | Retsept hisobi (masalliqlar grammi) | 75 g USDA 173806 («Peanuts, all types, dry-roasted, without salt»); 25 g USDA 169655 («Sugars, granulated») | 537 |
| Yeryong'oq (sutli shokoladda) (`yeryongoq-shokolad`) | 8c | USDA — aynan | USDA 168001 («Candies, milk chocolate coated peanuts») | 519 |
| Tiramisu (`tiramisu`) | 8c | Retsept hisobi (masalliqlar grammi) | 35 g USDA 173418 («Cheese, cream»); 15 g USDA 170859 («Cream, fluid, heavy whipping»); 20 g USDA 172821 («Cookies, ladyfingers, without lemon juice and rind»); 10 g USDA 171287 («Egg, whole, raw, fresh»); 12 g USDA 169655 («Sugars, granulated»); 1 g USDA 169593 («Cocoa, dry powder, unsweetened») | 309 |
| Kartoshka pirojnoe (shokoladli) (`kartoshka-pirojnoe`) | 8c | Retsept hisobi (standart retsept) | biskvit uvog'i — USDA 172707 («Cake, sponge, prepared from recipe»); sariyog' — USDA 173410 («Butter, salted»); quyultirilgan sut — USDA 171275 («Milk, canned, condensed, sweetened»); kakao — USDA 169593 («Cocoa, dry powder, unsweetened»); yong'oq — USDA 170187 («Nuts, walnuts, english») | 395 |
| Muraveynik (yong'oq va sgushenkali tort) (`muraveynik`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sariyog' (xamirga) — USDA 173410 («Butter, salted»); smetana — USDA 171257 («Cream, sour, cultured»); shakar — USDA 169655 («Sugars, granulated»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); quyultirilgan sut — USDA 171275 («Milk, canned, condensed, sweetened»); sariyog' (krem) — USDA 173410 («Butter, salted»); yong'oq — USDA 170187 («Nuts, walnuts, english») | 476 |
| Trubochka (kremli, sloyka) (`trubochka-krem`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sariyog' — USDA 173410 («Butter, salted»); tuxum (surtish) — USDA 171287 («Egg, whole, raw, fresh»); tuxum oqsili — USDA 172183 («Egg, white, raw, fresh»); shakar — USDA 169655 («Sugars, granulated») | 385 |
| Korzinochka (kremli savatcha pirojnoe) (`korzinochka`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sariyog' (xamirga) — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); murabbo — USDA 169641 («Jams and preserves»); sariyog' (krem) — USDA 173410 («Butter, salted»); quyultirilgan sut — USDA 171275 («Milk, canned, condensed, sweetened») | 467 |
| Rogalik (murabboli) (`rogalik`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); sariyog' — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); tuxum — USDA 171287 («Egg, whole, raw, fresh»); xamirturush (presslangan) — USDA 175042 («Leavening agents, yeast, baker's, compressed»); povidlo/murabbo — USDA 169641 («Jams and preserves»); tuxum (surtish) — USDA 171287 («Egg, whole, raw, fresh») | 343 |
| Makarons (fransuzcha bodomli pirojnoe) (`makarons`) | 8c | Retsept hisobi (masalliqlar grammi) | 35 g USDA 170568 («Nuts, almonds, blanched»); 50 g USDA 169655 («Sugars, granulated»); 15 g USDA 172183 («Egg, white, raw, fresh») | 408 |
| Panna kotta (`panna-kotta`) | 8c | Retsept hisobi (masalliqlar grammi) | 60 g USDA 170859 («Cream, fluid, heavy whipping»); 25 g USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); 13 g USDA 169655 («Sugars, granulated») | 270 |
| Puding (vanilli, tayyor) (`puding-vanil`) | 8c | USDA — aynan | USDA 169608 («Puddings, vanilla, ready-to-eat») | 130 |
| Puding (shokoladli, tayyor) (`puding-shokolad`) | 8c | USDA — aynan | USDA 168778 («Puddings, chocolate, ready-to-eat») | 142 |
| Shokoladli fondan (suyuq markazli keks) (`fondan`) | 8c | Retsept hisobi (masalliqlar grammi) | 30 g USDA 167977 («Candies, sweet chocolate»); 25 g USDA 173410 («Butter, salted»); 25 g USDA 171287 («Egg, whole, raw, fresh»); 15 g USDA 169655 («Sugars, granulated»); 5 g USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») | 443 |
| Biskvit rulet (murabboli) (`rulet-biskvit`) | 8c | Retsept hisobi (standart retsept) | tuxum (5 dona) — USDA 171287 («Egg, whole, raw, fresh»); shakar — USDA 169655 («Sugars, granulated»); bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); murabbo/povidlo — USDA 169641 («Jams and preserves») | 304 |
| Pirojnoe (biskvitli, kremli) (`pirojnoe-krem`) | 8c | Retsept hisobi (standart retsept) | tuxum (4 dona) — USDA 171287 («Egg, whole, raw, fresh»); shakar — USDA 169655 («Sugars, granulated»); bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); shakar (qiyom) — USDA 169655 («Sugars, granulated»); sariyog' (krem) — USDA 173410 («Butter, salted»); quyultirilgan sut — USDA 171275 («Milk, canned, condensed, sweetened») | 357 |
| Oreshki (sgushenkali yong'oqcha pechenye) (`oreshki`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sariyog' (xamirga) — USDA 173410 («Butter, salted»); shakar — USDA 169655 («Sugars, granulated»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); quyultirilgan sut (qaynatilgan) — USDA 171275 («Milk, canned, condensed, sweetened»); sariyog' (iching) — USDA 173410 («Butter, salted»); yong'oq — USDA 170187 («Nuts, walnuts, english») | 453 |
| Sharlotka (olmali pirog) (`sharlotka`) | 8c | Retsept hisobi (standart retsept) | tuxum (4 dona) — USDA 171287 («Egg, whole, raw, fresh»); shakar — USDA 169655 («Sugars, granulated»); bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); olma (po'stsiz) — USDA 171689 («Apples, raw, without skin»); sariyog' (qolipga) — USDA 173410 («Butter, salted») | 222 |
| Smetannik (smetanali tort) (`smetannik`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); shakar (xamirga) — USDA 169655 («Sugars, granulated»); smetana (xamirga) — USDA 171257 («Cream, sour, cultured»); tuxum (3 dona) — USDA 171287 («Egg, whole, raw, fresh»); smetana (krem) — USDA 171257 («Cream, sour, cultured»); shakar (krem) — USDA 169655 («Sugars, granulated») | 300 |
| Vafli trubochka (sgushenkali) (`vafli-trubochka`) | 8c | Retsept hisobi (standart retsept) | tuxum (3 dona) — USDA 171287 («Egg, whole, raw, fresh»); shakar — USDA 169655 («Sugars, granulated»); sariyog' — USDA 173410 («Butter, salted»); bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); quyultirilgan sut (qaynatilgan) — USDA 171275 («Milk, canned, condensed, sweetened») | 439 |
| Savoyardi pechenyesi (biskvit tayoqcha) (`savoyardi`) | 8c | USDA — aynan | USDA 172821 («Cookies, ladyfingers, without lemon juice and rind») | 363 |
| Xachapuri (ajarcha, tuxumli) (`xachapuri`) | 8c | Retsept hisobi (standart retsept) | bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); quruq xamirturush — USDA 175043 («Leavening agents, yeast, baker's, active dry»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); shakar — USDA 169655 («Sugars, granulated»); suluguni — Скурихин: Сулугуни, м.д.ж. 46% в сух. в-ве (https://health-diet.ru/base_of_food/sostav/381.php); motsarella (imeruli o'rniga) — USDA 170845 («Cheese, mozzarella, whole milk»); tuxum (4 dona) — USDA 171287 («Egg, whole, raw, fresh»); sariyog' — USDA 173410 («Butter, salted») | 313 |
| Pasta karbonara (qaymoqli) (`pasta-karbonara`) | 8c | Retsept hisobi (masalliqlar grammi) | 65 g USDA 169737 («Pasta, cooked, enriched, without added salt»); 12 g USDA 170859 («Cream, fluid, heavy whipping»); 6 g USDA 171247 («Cheese, parmesan, grated»); 5 g USDA 172184 («Egg, yolk, raw, fresh»); 10 g USDA 172012 («Bologna, beef») | 215 |
| Pasta alfredo (tovuqli) (`pasta-alfredo`) | 8c | Retsept hisobi (masalliqlar grammi) | 60 g USDA 169737 («Pasta, cooked, enriched, without added salt»); 15 g USDA 171477 («Chicken, broilers or fryers, breast, meat only, cooked, roasted»); 15 g USDA 170859 («Cream, fluid, heavy whipping»); 5 g USDA 171247 («Cheese, parmesan, grated»); 3 g USDA 173410 («Butter, salted») | 213 |
| Poke (losos va guruchli) (`poke-losos`) | 8c | Retsept hisobi (masalliqlar grammi) | 45 g USDA 168878 («Rice, white, long-grain, regular, enriched, cooked»); 20 g USDA 175167 («Fish, salmon, Atlantic, farmed, raw»); 10 g USDA 171705 («Avocados, raw, all commercial varieties»); 8 g USDA 168411 («Edamame, frozen, prepared»); 7 g USDA 168409 («Cucumber, with peel, raw»); 3 g USDA 174277 («Soy sauce made from soy and wheat (shoyu)»); 1 g USDA 170150 («Seeds, sesame seeds, whole, dried»); 3 g USDA 171009 («Salad dressing, mayonnaise, regular») | 159 |
| Tovuq teriyaki (guruch bilan) (`tovuq-teriyaki`) | 8c | Retsept hisobi (masalliqlar grammi) | 35 g USDA 172388 («Chicken, broilers or fryers, thigh, meat only, cooked, roasted»); 45 g USDA 168878 («Rice, white, long-grain, regular, enriched, cooked»); 10 g USDA 171167 («Sauce, teriyaki, ready-to-serve»); 3 g USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); 1 g USDA 170150 («Seeds, sesame seeds, whole, dried»); 6 g USDA 170427 («Peppers, sweet, green, raw») | 164 |
| Maki roll (bodringli) (`maki-bodring`) | 8c | Retsept hisobi (masalliqlar grammi) | 78 g USDA 168878 («Rice, white, long-grain, regular, enriched, cooked»); 12 g USDA 168409 («Cucumber, with peel, raw»); 3 g USDA 168458 («Seaweed, laver, raw»); 2 g USDA 169655 («Sugars, granulated»); 3 g USDA 172237 («Vinegar, distilled») | 115 |
| Pishloqli tost (issiq sendvich) (`pishloqli-tost`) | 8c | Retsept hisobi (masalliqlar grammi) | 55 g USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)»); 30 g USDA 171241 («Cheese, gouda»); 5 g USDA 173410 («Butter, salted») | 321 |
| Buterbrod (kolbasali) (`buterbrod-kolbasa`) | 8c | Retsept hisobi (masalliqlar grammi) | 55 g USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)»); 35 g USDA 172012 («Bologna, beef»); 5 g USDA 173410 («Butter, salted») | 302 |
| Buterbrod (sariyog' va pishloqli) (`buterbrod-pishloq`) | 8c | Retsept hisobi (masalliqlar grammi) | 55 g USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)»); 25 g USDA 171241 («Cheese, gouda»); 8 g USDA 173410 («Butter, salted») | 333 |
| Buterbrod (qizil baliqli) (`buterbrod-baliq`) | 8c | Retsept hisobi (masalliqlar grammi) | 50 g USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)»); 35 g USDA 173687 («Fish, salmon, chinook, smoked»); 8 g USDA 173410 («Butter, salted») | 249 |
| Fransuzcha hot-dog (baget ichida) (`hotdog-fransuz`) | 8c | Retsept hisobi (masalliqlar grammi) | 55 g USDA 172675 («Bread, french or vienna (includes sourdough)»); 35 g USDA 174614 («Frankfurter, beef, heated»); 5 g USDA 171009 («Salad dressing, mayonnaise, regular»); 5 g USDA 170459 («Tomato products, canned, paste, without salt added») | 300 |
| Ovsyanoblin (suli va tuxumli quymoq) (`ovsyanoblin`) | 8c | Retsept hisobi (standart retsept) | suli yormasi — USDA 173904 («Cereals, oats, regular and quick, not fortified, dry»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); kungaboqar yog'i — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 214 |
| Lenivie vareniki (tvorogli) (`lenivie-vareniki`) | 8c | Retsept hisobi (standart retsept) | tvorog — Скурихин: Творог 9% жирности (https://health-diet.ru/base_of_food/sostav/392.php); tuxum — USDA 171287 («Egg, whole, raw, fresh»); bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); shakar — USDA 169655 («Sugars, granulated»); sariyog' (ustiga) — USDA 173410 («Butter, salted») | 227 |
| Blinchik (go'shtli) (`blinchik-gosht`) | 8c | Retsept hisobi (standart retsept) | sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); shakar — USDA 169655 («Sugars, granulated»); kungaboqar yog'i (xamirga va tovaga) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); mol qiymasi (xom, yog'i 10 %) — USDA 174030 («Beef, ground, 90% lean meat / 10% fat, raw»); piyoz — USDA 170000 («Onions, raw»); kungaboqar yog'i (qiymaga) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); kungaboqar yog'i (o'ralganini qovurish) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») | 237 |
| Blinchik (tvorogli) (`blinchik-tvorog`) | 8c | Retsept hisobi (standart retsept) | sut — USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D»); tuxum (2 dona) — USDA 171287 («Egg, whole, raw, fresh»); bug'doy uni — USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached»); shakar — USDA 169655 («Sugars, granulated»); kungaboqar yog'i (xamirga va tovaga) — USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); tvorog — Скурихин: Творог 9% жирности (https://health-diet.ru/base_of_food/sostav/392.php); tuxum — USDA 171287 («Egg, whole, raw, fresh»); shakar — USDA 169655 («Sugars, granulated»); sariyog' (qovurish) — USDA 173410 («Butter, salted») | 207 |
| Adjika (achchiq pomidor-qalampir sousi) (`adjika`) | 8c | Retsept hisobi (masalliqlar grammi) | 30 g USDA 170459 («Tomato products, canned, paste, without salt added»); 40 g USDA 170457 («Tomatoes, red, ripe, raw, year round average»); 20 g USDA 170108 («Peppers, sweet, red, raw»); 5 g USDA 169230 («Garlic, raw»); 3 g USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)»); 2 g USDA 169655 («Sugars, granulated») | 79 |
| Mayonez (kam yog'li, 30%) (`mayonez-light`) | 8c | USDA — aynan | USDA 168094 («Mayonnaise, reduced-calorie or diet, cholesterol-free») | 333 |
| Sezar sousi (`sezar-sous`) | 8c | USDA — aynan | USDA 169055 («Salad dressing, caesar dressing, regular») | 542 |
| Teriyaki sousi (`teriyaki-sous`) | 8c | USDA — aynan | USDA 171167 («Sauce, teriyaki, ready-to-serve») | 89 |
| Kunjut yog'i (`kunjut-yogi`) | 8c | USDA — aynan | USDA 171016 («Oil, sesame, salad or cooking») | 884 |
| Kokos yog'i (`kokos-yogi`) | 8c | USDA — aynan | USDA 171412 («Oil, coconut») | 892 |
| Kokos suti (konserva, pishirish uchun) (`kokos-suti`) | 8c | USDA — aynan | USDA 170173 («Nuts, coconut milk, canned (liquid expressed from grated meat and water)») | 197 |
| Do'lana (yangi) (`dolana`) | 8c | Скурихин (MDH jadvali) | Скурихин: Боярышник кроваво-красный (https://health-diet.ru/base_of_food/sostav/46.php) | 62 |
| Qizilcha (kizil, yangi) (`qizilcha`) | 8c | Скурихин (MDH jadvali) | Скурихин: Кизил (https://health-diet.ru/base_of_food/sostav/137.php) | 45 |
| Sulugun pishlog'i (`suluguni`) | 8c | Скурихин (MDH jadvali) | Скурихин: Сулугуни, м.д.ж. 46% в сух. в-ве (https://health-diet.ru/base_of_food/sostav/381.php) | 286 |
| Vafli (shakarsiz, poliollar bilan) (`vafli-shakarsiz`) | 8c | Ishlab chiqaruvchi yorlig'i | yorliq: Gullón Zero wafer vanilla (shakarsiz, poliollar bilan) (OFF 8410376059366) | 432 |
| Tomat pastasi (`tomat-pasta`) | 8c | USDA — aynan | USDA 170459 («Tomato products, canned, paste, without salt added») | 82 |
| Balzamik sirka (`balzamik`) | 8c | USDA — aynan | USDA 172241 («Vinegar, balsamic») | 88 |

## Standart retseptlar (100 ta) — `tools/retsept-v87a.js`, `retsept-v87b.js`, `retsept-v87c.js`

Netto gramm (tozalangan masalliq), butun qozon yoki porsiya uchun; «chiqish» — tayyor taom massasi (bug'lanish, qovurish/pishirish yo'qotishidan keyin). Yog' — odatiy retseptdagi real miqdor. Tarozida tekshirilmagan: ±15 %.

### Mol go'shtli sho'rva (uyda) (`shurva-mol-uy`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol go'shti (kurak, yog'li, xom) | 700 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| kartoshka | 600 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 300 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 250 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 150 | USDA 170108 («Peppers, sweet, red, raw») |
| suv | 3000 | — |

Jami 5200 g → tayyor 4750 g. **100 g: 52 kkal, oqsil 3.3 g, yog' 2.7 g, uglevod 3.6 g.**

### Qovurma sho'rva (qo'y go'shtli) (`qovurma-shurva`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; go'sht paxta yog'ida qovuriladi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qo'y go'shti (yelka, yog'li, xom) | 700 | USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw») |
| paxta yog'i | 80 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 600 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 300 | USDA 170393 («Carrots, raw») |
| piyoz | 250 | USDA 170000 («Onions, raw») |
| pomidor | 250 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 150 | USDA 170108 («Peppers, sweet, red, raw») |
| no'xat (quruq) | 100 | USDA 173756 («Chickpeas (garbanzo beans, bengal gram), mature seeds, raw») |
| suv | 3000 | — |

Jami 5430 g → tayyor 4980 g. **100 g: 74 kkal, oqsil 3.2 g, yog' 4.8 g, uglevod 4.8 g.**

### Qaynatma sho'rva (qo'y go'shtli) (`qaynatma-shurva`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; qovurilmaydi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qo'y go'shti (yelka, yog'li, xom) | 800 | USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw») |
| kartoshka | 600 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 300 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 150 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| suv | 3200 | — |

Jami 5250 g → tayyor 4770 g. **100 g: 59 kkal, oqsil 3.2 g, yog' 3.6 g, uglevod 3.3 g.**

### Sho'rva (mol go'shtli, kafe) (`kafe-mol-shurva`)

*kosa 450 g · kafe porsiyasi nisbati (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol go'shti (kurak, yog'li, xom) | 900 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| dumba yog'i | 50 | USDA 172572 («Lamb, Australian, imported, fresh, separable fat, raw») |
| kartoshka | 700 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 300 | USDA 170393 («Carrots, raw») |
| piyoz | 250 | USDA 170000 («Onions, raw») |
| pomidor | 300 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 150 | USDA 170108 («Peppers, sweet, red, raw») |
| no'xat (quruq) | 100 | USDA 173756 («Chickpeas (garbanzo beans, bengal gram), mature seeds, raw») |
| suv | 3000 | — |

Jami 5750 g → tayyor 5300 g. **100 g: 71 kkal, oqsil 4.2 g, yog' 3.9 g, uglevod 4.9 g.**

### Ko'za sho'rva (qo'y go'shti, no'xatli) (`kuza-shurva`)

*kosa 400 g · bitta ko'za (netto gramm); tandirda sekin, bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qo'y go'shti (yelka, yog'li, xom) | 250 | USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw») |
| dumba yog'i | 15 | USDA 172572 («Lamb, Australian, imported, fresh, separable fat, raw») |
| no'xat (quruq) | 40 | USDA 173756 («Chickpeas (garbanzo beans, bengal gram), mature seeds, raw») |
| kartoshka | 150 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 60 | USDA 170393 («Carrots, raw») |
| piyoz | 60 | USDA 170000 («Onions, raw») |
| pomidor | 60 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 20 | USDA 170108 («Peppers, sweet, red, raw») |
| suv | 600 | — |

Jami 1255 g → tayyor 1165 g. **100 g: 93 kkal, oqsil 4.8 g, yog' 5.7 g, uglevod 5.7 g.**

### Kifta sho'rva (qiyma sharchali) (`kifta-shurva`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; kofta: qiyma + guruch + piyoz + tuxum*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol qiymasi (80/20) | 500 | USDA 174036 («Beef, ground, 80% lean meat / 20% fat, raw») |
| guruch (xom) | 60 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| tuxum | 50 | USDA 171287 («Egg, whole, raw, fresh») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 600 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 300 | USDA 170393 («Carrots, raw») |
| pomidor | 250 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 150 | USDA 170108 («Peppers, sweet, red, raw») |
| suv | 3000 | — |

Jami 5150 g → tayyor 4700 g. **100 g: 57 kkal, oqsil 2.5 g, yog' 3.1 g, uglevod 4.7 g.**

### Frikadelli sho'rva (`frikadelli-shurva`)

*kosa 350 g · odatiy uy retsepti (netto gramm); bug'lanish ≈10 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol qiymasi (80/20) | 300 | USDA 174036 («Beef, ground, 80% lean meat / 20% fat, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| tuxum | 25 | USDA 171287 («Egg, whole, raw, fresh») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| makaron/lag'mon xamiri (quruq) | 60 | USDA 169736 («Pasta, dry, enriched») |
| paxta yog'i | 20 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| petrushka | 10 | USDA 170416 («Parsley, fresh») |
| suv | 2000 | — |

Jami 3015 g → tayyor 2815 g. **100 g: 56 kkal, oqsil 2.6 g, yog' 3.0 g, uglevod 4.8 g.**

### Piyova (piyozli sho'rva, qo'y go'shtli) (`piyova`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; piyoz ko'p, go'sht qovuriladi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qo'y go'shti (yelka, yog'li, xom) | 500 | USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw») |
| paxta yog'i | 80 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| piyoz | 600 | USDA 170000 («Onions, raw») |
| kartoshka | 500 | USDA 170026 («Potatoes, flesh and skin, raw») |
| pomidor | 300 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| suv | 2500 | — |

Jami 4630 g → tayyor 4255 g. **100 g: 65 kkal, oqsil 2.4 g, yog' 4.4 g, uglevod 4.0 g.**

### Mosh sho'rva (go'shtli, kartoshkali) (`mosh-shurva`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mosh (quruq) | 250 | USDA 174256 («Mung beans, mature seeds, raw») |
| mol go'shti (kurak, yog'li, xom) | 400 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 60 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 200 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 200 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| suv | 3000 | — |

Jami 4710 g → tayyor 4260 g. **100 g: 68 kkal, oqsil 3.5 g, yog' 3.2 g, uglevod 6.4 g.**

### Moshxo'rda (qatiq bilan) (`moshxorda-qatiq`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; qatiq suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mosh (quruq) | 200 | USDA 174256 («Mung beans, mature seeds, raw») |
| guruch (xom) | 150 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| mol go'shti (kurak, yog'li, xom) | 400 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 60 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| sabzi | 200 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 200 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| suv | 2800 | — |
| qatiq (suzishda) | 300 | USDA 171284 («Yogurt, plain, whole milk») |

Jami 4510 g → tayyor 4090 g. **100 g: 77 kkal, oqsil 3.7 g, yog' 3.6 g, uglevod 7.5 g.**

### Moshxo'rda (tovuqli) (`moshxorda-tovuq`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mosh (quruq) | 200 | USDA 174256 («Mung beans, mature seeds, raw») |
| guruch (xom) | 150 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| tovuq go'shti (terili, xom) | 500 | USDA 171447 («Chicken, broilers or fryers, meat and skin, raw») |
| paxta yog'i | 50 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| sabzi | 200 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 200 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| suv | 2800 | — |

Jami 4300 g → tayyor 3880 g. **100 g: 76 kkal, oqsil 4.1 g, yog' 3.3 g, uglevod 7.5 g.**

### Mastava (tovuqli) (`mastava-tovuq`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| guruch (xom) | 200 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| tovuq go'shti (terili, xom) | 500 | USDA 171447 («Chicken, broilers or fryers, meat and skin, raw») |
| paxta yog'i | 60 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 200 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 250 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 100 | USDA 170108 («Peppers, sweet, red, raw») |
| suv | 2800 | — |

Jami 4710 g → tayyor 4290 g. **100 g: 67 kkal, oqsil 2.9 g, yog' 3.2 g, uglevod 6.6 g.**

### Mastava (qatiq bilan) (`mastava-qatiq`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; qatiq va ko'kat suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| guruch (xom) | 200 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| mol go'shti (kurak, yog'li, xom) | 400 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 60 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 200 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 250 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| suv | 2800 | — |
| qatiq (suzishda) | 300 | USDA 171284 («Yogurt, plain, whole milk») |
| petrushka (suzishda) | 20 | USDA 170416 («Parsley, fresh») |

Jami 4830 g → tayyor 4410 g. **100 g: 67 kkal, oqsil 2.6 g, yog' 3.3 g, uglevod 6.6 g.**

### Mastava (qo'y go'shtli) (`mastava-qoy`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| guruch (xom) | 200 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| qo'y go'shti (yelka, yog'li, xom) | 450 | USDA 172496 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, raw») |
| paxta yog'i | 70 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 200 | USDA 170393 («Carrots, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| pomidor | 250 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 100 | USDA 170108 («Peppers, sweet, red, raw») |
| suv | 2800 | — |

Jami 4670 g → tayyor 4250 g. **100 g: 72 kkal, oqsil 2.5 g, yog' 4.0 g, uglevod 6.7 g.**

### Umoch oshi (`umoch-oshi`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; umoch — un + oz suv (uvoq)*

| Masalliq | Netto, g | Manba |
|---|---|---|
| un | 200 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| mol go'shti (kurak, yog'li, xom) | 300 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 50 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| pomidor | 200 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 80 | USDA 170108 («Peppers, sweet, red, raw») |
| suv | 2500 | — |

Jami 3930 g → tayyor 3555 g. **100 g: 65 kkal, oqsil 2.5 g, yog' 3.0 g, uglevod 6.9 g.**

### Go'ja oshi (qatiqli, jo'xori) (`goja-oshi`)

*kosa 350 g · odatiy uy retsepti: jo'xori qaynatiladi (bug'lanish ≈20 % suv), sovigach qatiq qo'shiladi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| jo'xori (oqlangan) | 250 | USDA 169716 («Sorghum grain») |
| tuz | 8 | USDA 173468 («Salt, table») |
| suv | 2500 | — |
| qatiq (suzishda) | 600 | USDA 171284 («Yogurt, plain, whole milk») |

Jami 3358 g → tayyor 2858 g. **100 g: 42 kkal, oqsil 1.7 g, yog' 1.0 g, uglevod 7.3 g.**

### Go'ja sho'rva (go'shtli) (`goja-gosht`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; qatiq suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| jo'xori (oqlangan) | 200 | USDA 169716 («Sorghum grain») |
| mol go'shti (kurak, yog'li, xom) | 300 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| kartoshka | 200 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| suv | 2500 | — |
| qatiq (suzishda) | 300 | USDA 171284 («Yogurt, plain, whole milk») |

Jami 3840 g → tayyor 3465 g. **100 g: 64 kkal, oqsil 2.8 g, yog' 3.2 g, uglevod 6.4 g.**

### Atala (unli suyuq oshi) (`atala`)

*kosa 300 g · odatiy uy retsepti: un yog'da qovuriladi, suv bilan qaynatiladi; bug'lanish ≈10 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| un | 120 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| paxta yog'i | 60 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| suv | 1500 | — |

Jami 1780 g → tayyor 1630 g. **100 g: 62 kkal, oqsil 0.8 g, yog' 3.8 g, uglevod 6.2 g.**

### Atala (sutli) (`atala-sutli`)

*kosa 300 g · odatiy uy retsepti: un sariyog'da qovuriladi, sut bilan; bug'lanish ≈10 % suyuqlik*

| Masalliq | Netto, g | Manba |
|---|---|---|
| un | 100 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sariyog' | 30 | USDA 173410 («Butter, salted») |
| sut 3,2 % | 1000 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| suv | 400 | — |

Jami 1530 g → tayyor 1390 g. **100 g: 86 kkal, oqsil 3.0 g, yog' 4.2 g, uglevod 8.9 g.**

### Lag'mon suyuq (mol go'shtli, uyda) (`lagmon-mol-uy`)

*kosa 450 g · odatiy uy retsepti: cho'zma lag'mon (quruq xamir massasi bo'yicha) + suyuq vaja; bug'lanish faqat sho'rva suvidan (2000 g × 15 %)*

| Masalliq | Netto, g | Manba |
|---|---|---|
| makaron/lag'mon xamiri (quruq) | 500 | USDA 169736 («Pasta, dry, enriched») |
| mol go'shti (kurak, yog'li, xom) | 500 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 100 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| bulg'or qalampiri | 200 | USDA 170108 («Peppers, sweet, red, raw») |
| pomidor | 300 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| tomat pastasi | 50 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| sarimsoq | 20 | USDA 169230 («Garlic, raw») |
| kartoshka | 200 | USDA 170026 («Potatoes, flesh and skin, raw») |
| suv | 2700 | — |

Jami 4920 g → tayyor 4620 g. **100 g: 96 kkal, oqsil 3.8 g, yog' 4.3 g, uglevod 10.4 g.**

### Tovuq lapsha sho'rva (uyda) (`tovuq-lapsha-uy`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tovuq go'shti (terili, xom) | 600 | USDA 171447 («Chicken, broilers or fryers, meat and skin, raw») |
| tuxumli lapsha (quruq) | 150 | USDA 169731 («Noodles, egg, dry, enriched») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| paxta yog'i | 20 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| petrushka | 10 | USDA 170416 («Parsley, fresh») |
| suv | 2500 | — |

Jami 3830 g → tayyor 3455 g. **100 g: 69 kkal, oqsil 4.1 g, yog' 3.4 g, uglevod 5.3 g.**

### Tovuqli guruch sho'rva (`tovuq-guruch-shurva`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tovuq go'shti (terili, xom) | 500 | USDA 171447 («Chicken, broilers or fryers, meat and skin, raw») |
| guruch (xom) | 120 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| paxta yog'i | 20 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| petrushka | 10 | USDA 170416 («Parsley, fresh») |
| suv | 2500 | — |

Jami 3700 g → tayyor 3325 g. **100 g: 61 kkal, oqsil 3.3 g, yog' 2.9 g, uglevod 5.2 g.**

### Borsh (kafe, smetana bilan) (`borsh-kafe`)

*kosa 400 g · kafe porsiyasi nisbati (butun qozon, netto gramm); bug'lanish ≈15 % suv; smetana suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol go'shti (kurak, yog'li, xom) | 400 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| lavlagi | 300 | USDA 169145 («Beets, raw») |
| karam | 300 | USDA 169975 («Cabbage, raw») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| tomat pastasi | 40 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| shakar | 10 | USDA 169655 («Sugars, granulated») |
| limon sharbati | 10 | USDA 167747 («Lemon juice, raw») |
| suv | 2500 | — |
| smetana (suzishda) | 150 | USDA 171257 («Cream, sour, cultured») |

Jami 4250 g → tayyor 3875 g. **100 g: 57 kkal, oqsil 2.6 g, yog' 3.7 g, uglevod 3.7 g.**

### Yashil borsh (shovul, tuxumli) (`yashil-borsh`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; smetana suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| ismaloq (shovul o'rniga) | 300 | USDA 168462 («Spinach, raw») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| mol go'shti (kurak, yog'li, xom) | 300 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| tuxum | 150 | USDA 171287 («Egg, whole, raw, fresh») |
| paxta yog'i | 20 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 2000 | — |
| smetana (suzishda) | 100 | USDA 171257 («Cream, sour, cultured») |

Jami 3470 g → tayyor 3170 g. **100 g: 56 kkal, oqsil 3.1 g, yog' 3.5 g, uglevod 3.3 g.**

### Shchi (yangi karamli) (`shchi`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; smetana suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| karam | 500 | USDA 169975 («Cabbage, raw») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| pomidor | 150 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| mol go'shti (kurak, yog'li, xom) | 400 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 30 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 2500 | — |
| smetana (suzishda) | 100 | USDA 171257 («Cream, sour, cultured») |

Jami 4180 g → tayyor 3805 g. **100 g: 50 kkal, oqsil 2.5 g, yog' 3.2 g, uglevod 2.9 g.**

### Shchi (tuzlangan karamdan) (`shchi-kislye`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; smetana suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tuzlangan karam | 500 | USDA 169279 («Sauerkraut, canned, solids and liquids») |
| kartoshka | 200 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| tomat pastasi | 30 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| mol go'shti (kurak, yog'li, xom) | 400 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 2500 | — |
| smetana (suzishda) | 100 | USDA 171257 («Cream, sour, cultured») |

Jami 3970 g → tayyor 3595 g. **100 g: 52 kkal, oqsil 2.5 g, yog' 3.7 g, uglevod 2.4 g.**

### Rassolnik (`rassolnik`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; smetana suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tuzlangan bodring | 250 | USDA 168558 («Pickles, cucumber, dill or kosher dill») |
| perlovka (xom) | 80 | USDA 170284 («Barley, pearled, raw») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| mol go'shti (kurak, yog'li, xom) | 300 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 2500 | — |
| smetana (suzishda) | 100 | USDA 171257 («Cream, sour, cultured») |

Jami 3770 g → tayyor 3395 g. **100 g: 56 kkal, oqsil 2.3 g, yog' 3.4 g, uglevod 4.2 g.**

### Solyanka (kafe, go'shtli assorti) (`solyanka-kafe`)

*kosa 400 g · kafe porsiyasi nisbati (butun qozon, netto gramm); bug'lanish ≈15 % suv; smetana suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol go'shti (kurak, yog'li, xom) | 300 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| qaynatilgan kolbasa (mol) | 150 | USDA 172012 («Bologna, beef») |
| dudlangan kolbasa (mol) | 150 | USDA 170606 («Sausage, beef, cured, cooked, smoked») |
| tuzlangan bodring | 200 | USDA 168558 («Pickles, cucumber, dill or kosher dill») |
| zaytun | 80 | USDA 169094 («Olives, ripe, canned (small-extra large)») |
| tomat pastasi | 60 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| paxta yog'i | 50 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| limon sharbati | 20 | USDA 167747 («Lemon juice, raw») |
| suv | 2000 | — |
| smetana (suzishda) | 100 | USDA 171257 («Cream, sour, cultured») |

Jami 3260 g → tayyor 2960 g. **100 g: 85 kkal, oqsil 3.5 g, yog' 7.2 g, uglevod 1.7 g.**

### Solyanka (baliqli) (`solyanka-baliq`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| chortan | 300 | USDA 173680 («Fish, pike, northern, raw») |
| losos (xom) | 200 | USDA 175167 («Fish, salmon, Atlantic, farmed, raw») |
| tuzlangan bodring | 200 | USDA 168558 («Pickles, cucumber, dill or kosher dill») |
| zaytun | 80 | USDA 169094 («Olives, ripe, canned (small-extra large)») |
| tomat pastasi | 60 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| limon sharbati | 20 | USDA 167747 («Lemon juice, raw») |
| suv | 2000 | — |

Jami 3050 g → tayyor 2750 g. **100 g: 46 kkal, oqsil 3.8 g, yog' 2.9 g, uglevod 1.3 g.**

### Xarcho (gruzincha mol go'shtli sho'rva) (`xarcho`)

*kosa 400 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; tkemali o'rniga quruq olxo'ri*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol go'shti (kurak, yog'li, xom) | 500 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| guruch (xom) | 120 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| tomat pastasi | 60 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| pomidor | 200 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| yong'oq | 60 | USDA 170187 («Nuts, walnuts, english») |
| sarimsoq | 20 | USDA 169230 («Garlic, raw») |
| kashnich | 20 | USDA 169997 («Coriander (cilantro) leaves, raw») |
| quruq olxo'ri (tkemali o'rniga) | 40 | USDA 168162 («Plums, dried (prunes), uncooked») |
| paxta yog'i | 30 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 2500 | — |

Jami 3750 g → tayyor 3375 g. **100 g: 77 kkal, oqsil 3.6 g, yog' 4.8 g, uglevod 5.2 g.**

### Okroshka (kvasli) (`okroshka-kvas`)

*kosa 350 g · odatiy uy retsepti (sovuq sho'rva, bug'lanish yo'q): non kvasi — Скурихин jadvali*

| Masalliq | Netto, g | Manba |
|---|---|---|
| non kvasi | 1000 | Скурихин: Квас хлебный (https://health-diet.ru/base_of_food/sostav/133.php) |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| qaynatilgan kolbasa (mol) | 200 | USDA 172012 («Bologna, beef») |
| tuxum | 150 | USDA 171287 («Egg, whole, raw, fresh») |
| bodring | 300 | USDA 168409 («Cucumber, with peel, raw») |
| turp | 100 | USDA 169276 («Radishes, raw») |
| smetana | 100 | USDA 171257 («Cream, sour, cultured») |
| shivit | 20 | USDA 172233 («Dill weed, fresh») |

Jami 2170 g → tayyor 2170 g. **100 g: 73 kkal, oqsil 2.5 g, yog' 4.0 g, uglevod 6.2 g.**

### Uxa (qizil baliqli) (`uxa-qizil-baliq`)

*kosa 400 g · odatiy uy retsepti (netto gramm); bug'lanish ≈10 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| losos (xom) | 400 | USDA 175167 («Fish, salmon, Atlantic, farmed, raw») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| petrushka | 10 | USDA 170416 («Parsley, fresh») |
| suv | 2000 | — |

Jami 3010 g → tayyor 2810 g. **100 g: 44 kkal, oqsil 3.3 g, yog' 1.9 g, uglevod 3.2 g.**

### Qo'ziqorinli sho'rva (kartoshkali) (`qoziqorin-shurva`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; smetana suzishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qo'ziqorin (shampinon) | 400 | USDA 169251 («Mushrooms, white, raw») |
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| paxta yog'i | 30 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| petrushka | 10 | USDA 170416 («Parsley, fresh») |
| suv | 2000 | — |
| smetana (suzishda) | 100 | USDA 171257 («Cream, sour, cultured») |

Jami 3140 g → tayyor 2840 g. **100 g: 33 kkal, oqsil 0.9 g, yog' 1.8 g, uglevod 3.8 g.**

### Gorox sho'rva (pallali no'xat pyure, dudlangan kolbasali) (`gorox-shurva`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; no'xat yormasi pishgan holda (USDA'da xom yo'q)*

| Masalliq | Netto, g | Manba |
|---|---|---|
| no'xat yormasi (pishgan) | 600 | USDA 172429 («Peas, split, mature seeds, cooked, boiled, without salt») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| dudlangan kolbasa (mol) | 150 | USDA 170606 («Sausage, beef, cured, cooked, smoked») |
| paxta yog'i | 20 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 1800 | — |

Jami 3070 g → tayyor 2800 g. **100 g: 59 kkal, oqsil 2.8 g, yog' 2.3 g, uglevod 7.2 g.**

### Loviya sho'rva (kafe, go'shtli) (`loviya-shurva-kafe`)

*kosa 450 g · kafe porsiyasi nisbati (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| loviya (quruq) | 250 | USDA 175193 («Beans, kidney, all types, mature seeds, raw») |
| mol go'shti (kurak, yog'li, xom) | 400 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| tomat pastasi | 40 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| bulg'or qalampiri | 100 | USDA 170108 («Peppers, sweet, red, raw») |
| paxta yog'i | 50 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 3000 | — |

Jami 4440 g → tayyor 3990 g. **100 g: 67 kkal, oqsil 3.7 g, yog' 3.1 g, uglevod 6.1 g.**

### Kartoshkali sho'rva (uyda) (`kartoshka-shurva-uy`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| kartoshka | 700 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| mol go'shti (kurak, yog'li, xom) | 250 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| petrushka | 10 | USDA 170416 («Parsley, fresh») |
| suv | 2500 | — |

Jami 3800 g → tayyor 3425 g. **100 g: 48 kkal, oqsil 1.9 g, yog' 2.5 g, uglevod 4.4 g.**

### Sabzavotli sho'rva (go'shtsiz) (`sabzavotli-shurva`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv; go'shtsiz*

| Masalliq | Netto, g | Manba |
|---|---|---|
| kartoshka | 400 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| karam | 250 | USDA 169975 («Cabbage, raw») |
| qovoqcha | 200 | USDA 170487 («Squash, summer, all varieties, raw») |
| pomidor | 200 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| bulg'or qalampiri | 100 | USDA 170108 («Peppers, sweet, red, raw») |
| yashil loviya | 100 | USDA 169961 («Beans, snap, green, raw») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| petrushka | 10 | USDA 170416 («Parsley, fresh») |
| suv | 2000 | — |

Jami 3550 g → tayyor 3250 g. **100 g: 29 kkal, oqsil 0.7 g, yog' 1.3 g, uglevod 4.2 g.**

### Pomidorli sho'rva (uyda, guruchli) (`pomidor-shurva-uy`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| pomidor | 1000 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| tomat pastasi | 60 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| kartoshka | 200 | USDA 170026 («Potatoes, flesh and skin, raw») |
| guruch (xom) | 60 | USDA 168877 («Rice, white, long-grain, regular, raw, enriched») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| sarimsoq | 10 | USDA 169230 («Garlic, raw») |
| suv | 1000 | — |

Jami 2620 g → tayyor 2470 g. **100 g: 43 kkal, oqsil 0.9 g, yog' 1.8 g, uglevod 6.5 g.**

### Yasmiq sho'rva (mol go'shtli) (`yasmiq-mol`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| yasmiq (quruq) | 250 | USDA 172420 («Lentils, raw») |
| mol go'shti (kurak, yog'li, xom) | 300 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| tomat pastasi | 40 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| paxta yog'i | 40 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 2500 | — |

Jami 3730 g → tayyor 3355 g. **100 g: 70 kkal, oqsil 3.9 g, yog' 2.9 g, uglevod 7.4 g.**

### Grechka sho'rva (go'shtli) (`grechka-shurva`)

*kosa 350 g · odatiy uy retsepti (butun qozon, netto gramm); bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| grechka (quruq) | 120 | USDA 170685 («Buckwheat groats, roasted, dry») |
| kartoshka | 300 | USDA 170026 («Potatoes, flesh and skin, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| mol go'shti (kurak, yog'li, xom) | 300 | USDA 169491 («Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, all grades, raw») |
| paxta yog'i | 30 | USDA 171024 («Oil, cottonseed, salad or cooking») |
| suv | 2500 | — |

Jami 3450 g → tayyor 3075 g. **100 g: 56 kkal, oqsil 2.6 g, yog' 2.9 g, uglevod 5.2 g.**

### Sutli guruch sho'rva (suyuq) (`sutli-guruch-shurva`)

*kosa 300 g · odatiy uy retsepti: guruch sutda qaynatiladi; bug'lanish ≈10 % suyuqlik*

| Masalliq | Netto, g | Manba |
|---|---|---|
| guruch (dumaloq, xom) | 150 | USDA 168931 («Rice, white, short-grain, raw, unenriched») |
| sut 3,2 % | 1500 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| sariyog' | 30 | USDA 173410 («Butter, salted») |
| shakar | 40 | USDA 169655 («Sugars, granulated») |
| suv | 500 | — |

Jami 2220 g → tayyor 2020 g. **100 g: 90 kkal, oqsil 2.8 g, yog' 3.7 g, uglevod 11.4 g.**

### Sutli choy (shakarsiz) (`sutli-choy`)

*piyola 200 g · choy + sut (4:1), bug'lanish yo'q*

| Masalliq | Netto, g | Manba |
|---|---|---|
| damlangan qora choy | 800 | USDA 173227 («Beverages, tea, black, brewed, prepared with tap water») |
| sut 3,2 % | 200 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |

Jami 1000 g → tayyor 1000 g. **100 g: 13 kkal, oqsil 0.6 g, yog' 0.7 g, uglevod 1.2 g.**

### Shirchoy (tuzli, sariyog'siz) (`shirchoy-tuzli`)

*piyola 200 g · odatiy uy retsepti: choy va sut teng, tuz; sariyog'siz*

| Masalliq | Netto, g | Manba |
|---|---|---|
| damlangan qora choy | 500 | USDA 173227 («Beverages, tea, black, brewed, prepared with tap water») |
| sut 3,2 % | 500 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| tuz | 3 | USDA 173468 («Salt, table») |

Jami 1003 g → tayyor 1003 g. **100 g: 31 kkal, oqsil 1.6 g, yog' 1.6 g, uglevod 2.5 g.**

### Shirchoy (qaymoqli, tuzli) (`shirchoy-qaymoqli`)

*piyola 200 g · odatiy uy retsepti: choy va sut teng, qaymoq, tuz*

| Masalliq | Netto, g | Manba |
|---|---|---|
| damlangan qora choy | 500 | USDA 173227 («Beverages, tea, black, brewed, prepared with tap water») |
| sut 3,2 % | 500 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| qaymoq (yog'li) | 60 | USDA 170859 («Cream, fluid, heavy whipping») |
| tuz | 3 | USDA 173468 («Salt, table») |

Jami 1063 g → tayyor 1063 g. **100 g: 48 kkal, oqsil 1.6 g, yog' 3.6 g, uglevod 2.6 g.**

### Ayron (yalpiz va bodring bilan) (`ayron-yalpiz`)

*stakan 250 g · o'zbekcha ayron: qatiq + suv (1:1), bodring, yalpiz, tuz*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qatiq | 500 | USDA 171284 («Yogurt, plain, whole milk») |
| bodring | 100 | USDA 168409 («Cucumber, with peel, raw») |
| yalpiz | 5 | USDA 173475 («Spearmint, fresh») |
| tuz | 4 | USDA 173468 («Salt, table») |
| suv | 500 | — |

Jami 1109 g → tayyor 1034 g. **100 g: 31 kkal, oqsil 1.8 g, yog' 1.6 g, uglevod 2.6 g.**

### Quruq meva kompoti (shakarsiz) (`kompot-quruq-shakarsiz`)

*stakan 250 g · quruq meva kompoti (stakanda meva bilan); qaynatishda bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| quruq olma | 60 | USDA 171691 («Apples, dried, sulfured, uncooked») |
| o'rik qoqi | 40 | USDA 173941 («Apricots, dried, sulfured, uncooked») |
| mayiz | 30 | USDA 168166 («Raisins, seeded») |
| quruq olxo'ri (tkemali o'rniga) | 30 | USDA 168162 («Plums, dried (prunes), uncooked») |
| suv | 1000 | — |

Jami 1160 g → tayyor 1010 g. **100 g: 40 kkal, oqsil 0.3 g, yog' 0.1 g, uglevod 10.6 g.**

### Olcha kompoti (shakarli) (`kompot-olcha`)

*stakan 250 g · olcha kompoti (meva bilan); qaynatishda bug'lanish ≈15 % suv*

| Masalliq | Netto, g | Manba |
|---|---|---|
| olcha | 320 | USDA 173954 («Cherries, sour, red, raw») |
| shakar | 100 | USDA 169655 («Sugars, granulated») |
| suv | 875 | — |

Jami 1295 g → tayyor 1164 g. **100 g: 47 kkal, oqsil 0.3 g, yog' 0.1 g, uglevod 11.9 g.**

### Shirmoy non (sutli, kunjutli) (`shirmoy-non`)

*dona 300 g · odatiy uy/tandir retsepti, 5 dona; xamir 1705 g → pishirishda ~13 % yo'qotish*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 500 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| sariyog' | 50 | USDA 173410 («Butter, salted») |
| shakar | 30 | USDA 169655 («Sugars, granulated») |
| quruq xamirturush | 10 | USDA 175043 («Leavening agents, yeast, baker's, active dry») |
| kunjut | 15 | USDA 170150 («Seeds, sesame seeds, whole, dried») |
| suv | 100 | — |

Jami 1705 g → tayyor 1490 g. **100 g: 305 kkal, oqsil 8.5 g, yog' 5.0 g, uglevod 55.4 g.**

### Jizzali non (`jizzali-non`)

*dona 300 g · odatiy uy retsepti, ~5 dona; jizza 200 g (≈60 % qovurilgan qo'y go'shti qoldig'i + 40 % dumba yog'i); pishirishda ~14 % yo'qotish*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| suv | 550 | — |
| jizza (qovurilgan qoldiq) | 120 | USDA 172497 («Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/4" fat, choice, cooked, braised») |
| jizza (dumba yog'i) | 80 | Скурихин: Жир бараний топленый (https://health-diet.ru/base_of_food/sostav/840.php) |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| quruq xamirturush | 10 | USDA 175043 («Leavening agents, yeast, baker's, active dry») |

Jami 1860 g → tayyor 1600 g. **100 g: 303 kkal, oqsil 8.9 g, yog' 7.5 g, uglevod 48.5 g.**

### Piyozli non (`piyozli-non`)

*dona 300 g · odatiy uy retsepti, ~5 dona; pishirishda ~16 % yo'qotish (piyoz suvi bilan)*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| suv | 550 | — |
| piyoz | 250 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 50 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| quruq xamirturush | 10 | USDA 175043 («Leavening agents, yeast, baker's, active dry») |

Jami 1860 g → tayyor 1560 g. **100 g: 270 kkal, oqsil 7.1 g, yog' 3.9 g, uglevod 50.7 g.**

### Pirojki (duxovkada, kartoshkali) (`pirojki-duxovka-kartoshka`)

*dona 70 g · odatiy uy retsepti, ~37 dona (xamir 1690 g + kartoshka iching); piyoz qovurishda −50 %, pishirishda ~10 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 400 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| sariyog' | 80 | USDA 173410 («Butter, salted») |
| shakar | 60 | USDA 169655 («Sugars, granulated») |
| xamirturush (presslangan) | 30 | USDA 175042 («Leavening agents, yeast, baker's, compressed») |
| suv | 20 | — |
| kartoshka (xom, tozalangan; qaynatib ezilgan) | 1000 | USDA 170027 («Potatoes, russet, flesh and skin, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i (piyoz qovurishga) | 40 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| tuxum (ustiga surtish) | 50 | USDA 171287 («Egg, whole, raw, fresh») |

Jami 2930 g → tayyor 2570 g. **100 g: 239 kkal, oqsil 6.3 g, yog' 5.6 g, uglevod 40.6 g.**

### Pirojki (duxovkada, go'shtli) (`pirojki-duxovka-gosht`)

*dona 75 g · odatiy uy retsepti, ~29 dona; qiyma (yog'i 10 %) qovurishda −30 %, piyoz −50 %, pishirishda ~10 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 400 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| sariyog' | 80 | USDA 173410 («Butter, salted») |
| shakar | 60 | USDA 169655 («Sugars, granulated») |
| xamirturush (presslangan) | 30 | USDA 175042 («Leavening agents, yeast, baker's, compressed») |
| suv | 20 | — |
| mol qiymasi (xom, yog'i 10 %) | 700 | USDA 174030 («Beef, ground, 90% lean meat / 10% fat, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 30 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| tuxum (ustiga surtish) | 50 | USDA 171287 («Egg, whole, raw, fresh») |

Jami 2670 g → tayyor 2150 g. **100 g: 303 kkal, oqsil 13.0 g, yog' 9.4 g, uglevod 40.4 g.**

### Pirojki (duxovkada, karamli) (`pirojki-duxovka-karam`)

*dona 70 g · odatiy uy retsepti, ~35 dona; karam dimlashda −25 %, pishirishda ~10 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 400 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| sariyog' | 80 | USDA 173410 («Butter, salted») |
| shakar | 60 | USDA 169655 («Sugars, granulated») |
| xamirturush (presslangan) | 30 | USDA 175042 («Leavening agents, yeast, baker's, compressed») |
| suv | 20 | — |
| karam | 1000 | USDA 169975 («Cabbage, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 50 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| qaynatilgan tuxum | 100 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| tuxum (ustiga surtish) | 50 | USDA 171287 («Egg, whole, raw, fresh») |

Jami 2990 g → tayyor 2420 g. **100 g: 241 kkal, oqsil 6.8 g, yog' 6.8 g, uglevod 37.9 g.**

### Pirojki (duxovkada, olmali) (`pirojki-duxovka-olma`)

*dona 70 g · odatiy uy retsepti, ~33 dona; olma (tozalangan) + shakar; pishirishda ~13 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 400 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| sariyog' | 80 | USDA 173410 («Butter, salted») |
| shakar | 60 | USDA 169655 («Sugars, granulated») |
| xamirturush (presslangan) | 30 | USDA 175042 («Leavening agents, yeast, baker's, compressed») |
| suv | 20 | — |
| olma (po'stsiz) | 800 | USDA 171689 («Apples, raw, without skin») |
| shakar (iching) | 120 | USDA 169655 («Sugars, granulated») |
| tuxum (ustiga surtish) | 50 | USDA 171287 («Egg, whole, raw, fresh») |

Jami 2660 g → tayyor 2300 g. **100 g: 251 kkal, oqsil 6.1 g, yog' 4.5 g, uglevod 46.6 g.**

### Sushki (baranki, quruq halqa non) (`sushki`)

*hovuch 50 g · odatiy retsept (qaynatib, quritib pishirilgan halqa); namlik ~10 % gacha quritiladi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| suv | 380 | — |
| shakar | 60 | USDA 169655 («Sugars, granulated») |
| kungaboqar yog'i | 30 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| xamirturush (presslangan) | 15 | USDA 175042 («Leavening agents, yeast, baker's, compressed») |
| kunjut | 20 | USDA 170150 («Seeds, sesame seeds, whole, dried») |

Jami 1505 g → tayyor 1140 g. **100 g: 374 kkal, oqsil 9.5 g, yog' 4.4 g, uglevod 72.9 g.**

### Bulochka (mak urug'li) (`bulochka-mak`)

*dona 80 g · odatiy sdoba retsepti, ~23 dona; mak + shakar iching; pishirishda ~12 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 450 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| shakar (xamirga) | 150 | USDA 169655 («Sugars, granulated») |
| sariyog' | 120 | USDA 173410 («Butter, salted») |
| tuxum | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| xamirturush (presslangan) | 30 | USDA 175042 («Leavening agents, yeast, baker's, compressed») |
| mak (ko'knor urug'i) | 120 | USDA 171330 («Spices, poppy seed») |
| shakar (iching) | 60 | USDA 169655 («Sugars, granulated») |
| tuxum (surtish) | 40 | USDA 171287 («Egg, whole, raw, fresh») |

Jami 2070 g → tayyor 1820 g. **100 g: 354 kkal, oqsil 8.8 g, yog' 10.2 g, uglevod 56.9 g.**

### Rogalik (murabboli) (`rogalik`)

*dona 40 g · odatiy xamirturushli rogalik retsepti, ~47 dona; povidlo 300 g; pishirishda ~12 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 1000 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 400 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| sariyog' | 150 | USDA 173410 («Butter, salted») |
| shakar | 100 | USDA 169655 («Sugars, granulated») |
| tuxum | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| xamirturush (presslangan) | 30 | USDA 175042 («Leavening agents, yeast, baker's, compressed») |
| povidlo/murabbo | 300 | USDA 169641 («Jams and preserves») |
| tuxum (surtish) | 40 | USDA 171287 («Egg, whole, raw, fresh») |

Jami 2120 g → tayyor 1870 g. **100 g: 343 kkal, oqsil 7.4 g, yog' 8.5 g, uglevod 58.6 g.**

### Xachapuri (ajarcha, tuxumli) (`xachapuri`)

*dona 350 g · odatiy ajarcha retsept, 4 dona; suluguni + motsarella, har biriga tuxum va sariyog'; pishirishda ~12 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 500 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sut | 150 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| suv | 150 | — |
| quruq xamirturush | 10 | USDA 175043 («Leavening agents, yeast, baker's, active dry») |
| kungaboqar yog'i | 20 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| shakar | 10 | USDA 169655 («Sugars, granulated») |
| suluguni | 300 | Скурихин: Сулугуни, м.д.ж. 46% в сух. в-ве (https://health-diet.ru/base_of_food/sostav/381.php) |
| motsarella (imeruli o'rniga) | 200 | USDA 170845 («Cheese, mozzarella, whole milk») |
| tuxum (4 dona) | 200 | USDA 171287 («Egg, whole, raw, fresh») |
| sariyog' | 80 | USDA 173410 («Butter, salted») |

Jami 1620 g → tayyor 1430 g. **100 g: 313 kkal, oqsil 13.4 g, yog' 15.7 g, uglevod 28.7 g.**

### Blinchik (go'shtli) (`blinchik-gosht`)

*dona 90 g · odatiy uy retsepti, ~14 dona; blin xamiri 840 g (−14 %), qiyma qovurishda −30 %, piyoz −50 %, o'rab qayta qovurish*

| Masalliq | Netto, g | Manba |
|---|---|---|
| sut | 500 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| bug'doy uni | 200 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| shakar | 20 | USDA 169655 («Sugars, granulated») |
| kungaboqar yog'i (xamirga va tovaga) | 20 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| mol qiymasi (xom, yog'i 10 %) | 600 | USDA 174030 («Beef, ground, 90% lean meat / 10% fat, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i (qiymaga) | 20 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| kungaboqar yog'i (o'ralganini qovurish) | 20 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |

Jami 1630 g → tayyor 1225 g. **100 g: 237 kkal, oqsil 13.9 g, yog' 12.1 g, uglevod 17.3 g.**

### Blinchik (tvorogli) (`blinchik-tvorog`)

*dona 90 g · odatiy uy retsepti, ~16 dona; tvorog 9 % — Скурихин jadvali; sariyog'da qayta qovurish*

| Masalliq | Netto, g | Manba |
|---|---|---|
| sut | 500 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| bug'doy uni | 200 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| shakar | 20 | USDA 169655 («Sugars, granulated») |
| kungaboqar yog'i (xamirga va tovaga) | 20 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| tvorog | 600 | Скурихин: Творог 9% жирности (https://health-diet.ru/base_of_food/sostav/392.php) |
| tuxum | 50 | USDA 171287 («Egg, whole, raw, fresh») |
| shakar | 60 | USDA 169655 («Sugars, granulated») |
| sariyog' (qovurish) | 30 | USDA 173410 («Butter, salted») |

Jami 1580 g → tayyor 1430 g. **100 g: 207 kkal, oqsil 11.4 g, yog' 9.1 g, uglevod 19.3 g.**

### Lenivie vareniki (tvorogli) (`lenivie-vareniki`)

*porsiya 200 g · odatiy uy retsepti; tvorog 9 % — Скурихин jadvali; qaynatishda +4 %, sariyog' bilan*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tvorog | 500 | Скурихин: Творог 9% жирности (https://health-diet.ru/base_of_food/sostav/392.php) |
| tuxum | 50 | USDA 171287 («Egg, whole, raw, fresh») |
| bug'doy uni | 150 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| shakar | 30 | USDA 169655 («Sugars, granulated») |
| sariyog' (ustiga) | 30 | USDA 173410 («Butter, salted») |

Jami 760 g → tayyor 790 g. **100 g: 227 kkal, oqsil 14.2 g, yog' 9.6 g, uglevod 20.2 g.**

### Ovsyanoblin (suli va tuxumli quymoq) (`ovsyanoblin`)

*dona 120 g · odatiy retsept, 1 dona: suli 40 g + 2 tuxum + sut; qovurishda ~8 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| suli yormasi | 40 | USDA 173904 («Cereals, oats, regular and quick, not fortified, dry») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| sut | 40 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| kungaboqar yog'i | 5 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |

Jami 185 g → tayyor 170 g. **100 g: 214 kkal, oqsil 11.2 g, yog' 10.8 g, uglevod 17.5 g.**

### Mimoza salati (baliqli) (`mimoza`)

*tarelka 200 g · odatiy uy retsepti, ~7 porsiya; mayonez ~19 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| konserva losos (pushti) | 250 | USDA 175175 («Fish, salmon, pink, canned, drained solids») |
| qaynatilgan kartoshka | 300 | USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt») |
| qaynatilgan sabzi | 200 | USDA 170394 («Carrots, cooked, boiled, drained, without salt») |
| qaynatilgan tuxum (5 dona) | 250 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| piyoz | 80 | USDA 170000 («Onions, raw») |
| mayonez | 250 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 1330 g → tayyor 1330 g. **100 g: 210 kkal, oqsil 7.5 g, yog' 17.1 g, uglevod 6.6 g.**

### Olivye salati (tovuqli) (`olivye-tovuq`)

*tarelka 200 g · odatiy uy retsepti, ~9 porsiya; mayonez ~20 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qaynatilgan tovuq ko'krak | 300 | USDA 171478 («Chicken, broilers or fryers, breast, meat only, cooked, stewed») |
| qaynatilgan kartoshka | 400 | USDA 170440 («Potatoes, boiled, cooked without skin, flesh, without salt») |
| qaynatilgan sabzi | 150 | USDA 170394 («Carrots, cooked, boiled, drained, without salt») |
| qaynatilgan tuxum (5 dona) | 250 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| tuzlangan bodring | 200 | USDA 168558 («Pickles, cucumber, dill or kosher dill») |
| konserva no'xat | 200 | USDA 170015 («Peas, green, canned, drained solids, rinsed in tap water») |
| mayonez | 360 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 1860 g → tayyor 1860 g. **100 g: 207 kkal, oqsil 7.5 g, yog' 16.6 g, uglevod 6.8 g.**

### Bahor salati (bodring, rediska, tuxum, smetana) (`bahor-salati`)

*tarelka 200 g · odatiy uy retsepti, ~4 porsiya; smetana ~16 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bodring | 300 | USDA 168409 («Cucumber, with peel, raw») |
| rediska | 250 | USDA 169276 («Radishes, raw») |
| qaynatilgan tuxum (3 dona) | 150 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| ko'k piyoz | 50 | USDA 170005 («Onions, spring or scallions (includes tops and bulb), raw») |
| shivit | 20 | USDA 172233 («Dill weed, fresh») |
| smetana | 150 | USDA 171257 («Cream, sour, cultured») |

Jami 920 g → tayyor 920 g. **100 g: 69 kkal, oqsil 3.0 g, yog' 5.0 g, uglevod 3.6 g.**

### Mujskoy kapriz salati (mol go'shti, pishloq) (`mujskoy-kapriz`)

*tarelka 200 g · odatiy uy retsepti, ~5 porsiya; marinadlangan piyoz, mayonez ~20 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qaynatilgan mol go'shti | 300 | USDA 169442 («Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered») |
| piyoz (sirkada marinadlangan) | 150 | USDA 170000 («Onions, raw») |
| sirka | 10 | USDA 172237 («Vinegar, distilled») |
| qaynatilgan tuxum (4 dona) | 200 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| qattiq pishloq | 150 | USDA 171241 («Cheese, gouda») |
| mayonez | 200 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 1010 g → tayyor 1010 g. **100 g: 284 kkal, oqsil 16.6 g, yog' 22.9 g, uglevod 2.1 g.**

### Tbilisi salati (loviya, mol go'shti) (`tbilisi-salat`)

*tarelka 200 g · odatiy retsept, ~6 porsiya; yog'-sirka zapravkasi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qizil loviya (konserva) | 400 | USDA 174285 («Beans, kidney, red, mature seeds, canned, drained solids») |
| qaynatilgan mol go'shti | 250 | USDA 169442 («Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered») |
| shirin qizil qalampir | 250 | USDA 170108 («Peppers, sweet, red, raw») |
| qizil piyoz | 100 | USDA 170000 («Onions, raw») |
| yong'oq | 70 | USDA 170187 («Nuts, walnuts, english») |
| kashnich | 30 | USDA 169997 («Coriander (cilantro) leaves, raw») |
| sarimsoq | 10 | USDA 169230 («Garlic, raw») |
| achchiq qalampir | 10 | USDA 170106 («Peppers, hot chili, red, raw») |
| kungaboqar yog'i | 50 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| vino sirkasi | 20 | USDA 172240 («Vinegar, red wine») |

Jami 1190 g → tayyor 1190 g. **100 g: 171 kkal, oqsil 11.1 g, yog' 9.8 g, uglevod 10.5 g.**

### Objorka salati (mol go'shti, qovurilgan sabzi va piyoz) (`obzhorka`)

*tarelka 200 g · odatiy uy retsepti, ~5 porsiya; sabzi qovurishda −25 %, piyoz −45 %; mayonez ~19 % tayyor massadan*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qaynatilgan mol go'shti | 300 | USDA 169442 («Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, cooked, simmered») |
| sabzi (qovurilgan) | 300 | USDA 170393 («Carrots, raw») |
| piyoz (qovurilgan) | 200 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 40 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| tuzlangan bodring | 200 | USDA 168558 («Pickles, cucumber, dill or kosher dill») |
| mayonez | 200 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 1240 g → tayyor 1075 g. **100 g: 237 kkal, oqsil 10.1 g, yog' 19.6 g, uglevod 5.0 g.**

### Tovuqli salat (ananas va pishloq bilan) (`ananas-tovuq-salat`)

*tarelka 200 g · odatiy uy retsepti, 6 porsiya; mayonez ~17 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qaynatilgan tovuq ko'krak | 300 | USDA 171478 («Chicken, broilers or fryers, breast, meat only, cooked, stewed») |
| konserva ananas | 250 | USDA 169944 («Pineapple, canned, heavy syrup pack, solids and liquids») |
| qattiq pishloq | 150 | USDA 171241 («Cheese, gouda») |
| konserva makkajo'xori | 150 | USDA 169214 («Corn, sweet, yellow, canned, whole kernel, drained solids») |
| qaynatilgan tuxum (3 dona) | 150 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| mayonez | 200 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 1200 g → tayyor 1200 g. **100 g: 240 kkal, oqsil 12.5 g, yog' 18.2 g, uglevod 6.5 g.**

### Qo'ziqorinli salat (tovuq, tuxum, mayonez) (`qoziqorin-salat`)

*tarelka 200 g · odatiy uy retsepti, ~5 porsiya; qo'ziqorin qovurishda −40 %, piyoz −50 %; mayonez ~17 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qo'ziqorin (shampinon, xom) | 400 | USDA 169251 («Mushrooms, white, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 30 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| qaynatilgan tovuq ko'krak | 300 | USDA 171478 («Chicken, broilers or fryers, breast, meat only, cooked, stewed») |
| qaynatilgan tuxum (4 dona) | 200 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| qattiq pishloq | 80 | USDA 171241 («Cheese, gouda») |
| mayonez | 180 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 1290 g → tayyor 1050 g. **100 g: 254 kkal, oqsil 14.0 g, yog' 20.8 g, uglevod 2.6 g.**

### Loviyali salat (suxarik, kolbasa, mayonez) (`loviya-salat`)

*tarelka 200 g · odatiy uy retsepti, ~5 porsiya; mayonez ~14 %, suxarik (kirieshki) dasturxonga tortishda*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qizil loviya (konserva) | 400 | USDA 174285 («Beans, kidney, red, mature seeds, canned, drained solids») |
| dudlangan kolbasa (mol+tovuq) | 200 | USDA 172953 («Sausage, Polish, beef with chicken, hot») |
| suxarik (kirieshki) | 80 | yorliq: Кириешки салями (OFF 4607010740191) |
| konserva makkajo'xori | 200 | USDA 169214 («Corn, sweet, yellow, canned, whole kernel, drained solids») |
| mayonez | 150 | USDA 171009 («Salad dressing, mayonnaise, regular») |
| sarimsoq | 5 | USDA 169230 («Garlic, raw») |

Jami 1035 g → tayyor 1035 g. **100 g: 240 kkal, oqsil 7.9 g, yog' 16.0 g, uglevod 17.0 g.**

### Sabzi salati (sarimsoq va mayonezli) (`sabzi-sarimsoq-salat`)

*likop 150 g · odatiy uy retsepti; xom sabzi, mayonez ~16 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| sabzi (xom, qirg'ichda) | 500 | USDA 170393 («Carrots, raw») |
| sarimsoq | 15 | USDA 169230 («Garlic, raw») |
| mayonez | 100 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 615 g → tayyor 615 g. **100 g: 148 kkal, oqsil 1.1 g, yog' 12.4 g, uglevod 8.7 g.**

### Lavlagi salati (olxo'ri qoqi va yong'oqli) (`lavlagi-chernosliv`)

*likop 150 g · odatiy uy retsepti; qaynatilgan lavlagi, mayonez ~13 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qaynatilgan lavlagi | 500 | USDA 169146 («Beets, cooked, boiled, drained») |
| olxo'ri qoqi (chernosliv) | 100 | USDA 168162 («Plums, dried (prunes), uncooked») |
| yong'oq | 70 | USDA 170187 («Nuts, walnuts, english») |
| mayonez | 100 | USDA 171009 («Salad dressing, mayonnaise, regular») |
| sarimsoq | 10 | USDA 169230 («Garlic, raw») |

Jami 780 g → tayyor 780 g. **100 g: 207 kkal, oqsil 2.9 g, yog' 15.6 g, uglevod 16.3 g.**

### Sabzavot salati (mayonezli) (`sabzavot-salat-mayonez`)

*tarelka 200 g · odatiy uy retsepti; mayonez ~15 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bodring | 300 | USDA 168409 («Cucumber, with peel, raw») |
| pomidor | 300 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| piyoz | 50 | USDA 170000 («Onions, raw») |
| shivit | 15 | USDA 172233 («Dill weed, fresh») |
| mayonez | 120 | USDA 171009 («Salad dressing, mayonnaise, regular») |

Jami 785 g → tayyor 785 g. **100 g: 120 kkal, oqsil 0.9 g, yog' 11.6 g, uglevod 3.7 g.**

### Sabzavot salati (smetanali) (`sabzavot-salat-smetana`)

*tarelka 200 g · odatiy uy retsepti; smetana ~18 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bodring | 300 | USDA 168409 («Cucumber, with peel, raw») |
| pomidor | 300 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| piyoz | 50 | USDA 170000 («Onions, raw») |
| shivit | 15 | USDA 172233 («Dill weed, fresh») |
| smetana | 150 | USDA 171257 («Cream, sour, cultured») |

Jami 815 g → tayyor 815 g. **100 g: 52 kkal, oqsil 1.1 g, yog' 3.7 g, uglevod 4.3 g.**

### Xe (koreyscha marinadlangan baliq) (`xe-baliq`)

*porsiya 150 g · odatiy koreyscha retsept; xom baliq sirkada marinadlanadi, qizdirilgan yog' va ziravor bilan*

| Masalliq | Netto, g | Manba |
|---|---|---|
| baliq filesi (zog'ora, xom) | 500 | USDA 171952 («Fish, carp, raw») |
| sirka | 50 | USDA 172237 («Vinegar, distilled») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| sabzi | 100 | USDA 170393 («Carrots, raw») |
| shirin qalampir | 100 | USDA 170108 («Peppers, sweet, red, raw») |
| kungaboqar yog'i | 60 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| qizil qalampir (maydalangan) | 5 | USDA 170932 («Spices, pepper, red or cayenne») |
| sarimsoq | 15 | USDA 169230 («Garlic, raw») |
| soya sousi | 20 | USDA 174277 («Soy sauce made from soy and wheat (shoyu)») |
| shakar | 10 | USDA 169655 («Sugars, granulated») |
| kashnich | 15 | USDA 169997 («Coriander (cilantro) leaves, raw») |

Jami 1025 g → tayyor 1025 g. **100 g: 136 kkal, oqsil 9.4 g, yog' 8.8 g, uglevod 4.8 g.**

### Koreyscha bodring (`koreyscha-bodring`)

*porsiya 100 g · odatiy koreyscha retsept; tuzlangan bodringdan ~150 g sharbat to'kiladi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bodring | 1000 | USDA 168409 («Cucumber, with peel, raw») |
| kungaboqar yog'i | 60 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| sirka | 30 | USDA 172237 («Vinegar, distilled») |
| sarimsoq | 15 | USDA 169230 («Garlic, raw») |
| shakar | 15 | USDA 169655 («Sugars, granulated») |
| soya sousi | 20 | USDA 174277 («Soy sauce made from soy and wheat (shoyu)») |
| qizil qalampir (maydalangan) | 5 | USDA 170932 («Spices, pepper, red or cayenne») |
| kashnich urug'i | 3 | USDA 170922 («Spices, coriander seed») |

Jami 1148 g → tayyor 1000 g. **100 g: 80 kkal, oqsil 1.0 g, yog' 6.3 g, uglevod 6.2 g.**

### Koreyscha baqlajon (`koreyscha-baqlajon`)

*porsiya 100 g · odatiy koreyscha retsept; baqlajon tuzlab siqiladi va qovuriladi (−30 %), yog' ~7 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| baqlajon (xom) | 1000 | USDA 169228 («Eggplant, raw») |
| kungaboqar yog'i | 100 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| shirin qizil qalampir | 250 | USDA 170108 («Peppers, sweet, red, raw») |
| sabzi | 150 | USDA 170393 («Carrots, raw») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| sarimsoq | 20 | USDA 169230 («Garlic, raw») |
| sirka | 40 | USDA 172237 («Vinegar, distilled») |
| soya sousi | 30 | USDA 174277 («Soy sauce made from soy and wheat (shoyu)») |
| shakar | 20 | USDA 169655 («Sugars, granulated») |
| qizil qalampir (maydalangan) | 5 | USDA 170932 («Spices, pepper, red or cayenne») |

Jami 1715 g → tayyor 1400 g. **100 g: 103 kkal, oqsil 1.4 g, yog' 7.4 g, uglevod 9.2 g.**

### Baqlajon (qovurilgan) (`baqlajon-qovurilgan`)

*porsiya 150 g · odatiy retsept; unga belab qovurilgan, qovurishda ~35 % yo'qotish, yutilgan yog' ~13 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| baqlajon (xom) | 1000 | USDA 169228 («Eggplant, raw») |
| un (belash) | 30 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| kungaboqar yog'i (yutilgan) | 100 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| sarimsoq | 10 | USDA 169230 («Garlic, raw») |

Jami 1140 g → tayyor 740 g. **100 g: 170 kkal, oqsil 1.8 g, yog' 13.8 g, uglevod 11.5 g.**

### Qovoqcha (qovurilgan) (`qovoqcha-qovurilgan`)

*porsiya 150 g · odatiy retsept; unga belab qovurilgan, qovurishda ~30 % yo'qotish*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qovoqcha (xom) | 1000 | USDA 169291 («Squash, summer, zucchini, includes skin, raw») |
| un (belash) | 50 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| kungaboqar yog'i (yutilgan) | 70 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| sarimsoq | 10 | USDA 169230 («Garlic, raw») |

Jami 1130 g → tayyor 790 g. **100 g: 125 kkal, oqsil 2.3 g, yog' 9.3 g, uglevod 9.2 g.**

### Lecho (qalampir va pomidor) (`lecho`)

*porsiya 150 g · odatiy uy retsepti; dimlashda ~20 % bug'lanadi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| shirin qizil qalampir | 1000 | USDA 170108 («Peppers, sweet, red, raw») |
| pomidor | 600 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 80 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| shakar | 40 | USDA 169655 («Sugars, granulated») |
| sirka | 30 | USDA 172237 («Vinegar, distilled») |
| sarimsoq | 15 | USDA 169230 («Garlic, raw») |

Jami 1965 g → tayyor 1570 g. **100 g: 85 kkal, oqsil 1.2 g, yog' 5.4 g, uglevod 9.4 g.**

### Qo'ziqorin (piyoz bilan qovurilgan) (`qoziqorin-qovurilgan`)

*porsiya 150 g · odatiy retsept; shampinon qovurishda −40 %, piyoz −50 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| qo'ziqorin (shampinon, xom) | 1000 | USDA 169251 («Mushrooms, white, raw») |
| piyoz | 200 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 60 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| sariyog' | 20 | USDA 173410 («Butter, salted») |

Jami 1280 g → tayyor 860 g. **100 g: 113 kkal, oqsil 3.9 g, yog' 9.3 g, uglevod 6.0 g.**

### Kartoshka po-derevenski (duxovkada, bo'laklab) (`kartoshka-derevenski`)

*porsiya 150 g · odatiy retsept; po'sti bilan bo'laklab duxovkada pishirilgan, ~27 % yo'qotish*

| Masalliq | Netto, g | Manba |
|---|---|---|
| kartoshka (po'sti bilan, xom) | 1000 | USDA 170027 («Potatoes, russet, flesh and skin, raw») |
| kungaboqar yog'i | 50 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| paprika | 5 | USDA 171329 («Spices, paprika») |
| sarimsoq | 10 | USDA 169230 («Garlic, raw») |

Jami 1065 g → tayyor 780 g. **100 g: 162 kkal, oqsil 2.9 g, yog' 6.6 g, uglevod 23.9 g.**

### Befstroganov (mol go'shti smetana sousida) (`befstroganov`)

*porsiya 200 g · odatiy retsept (СР-normalari bo'yicha yo'qotish), 3–4 porsiya; go'sht qovurishda −35 %, piyoz −50 %, sous −20 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol go'shti (son qismi, xom) | 600 | USDA 171816 («Beef, round, top round, steak, separable lean only, trimmed to 1/8" fat, all grades, raw») |
| piyoz | 150 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 30 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| smetana | 150 | USDA 171257 («Cream, sour, cultured») |
| tomat pastasi | 15 | USDA 170459 («Tomato products, canned, paste, without salt added») |
| un | 10 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| suv | 50 | — |

Jami 1005 g → tayyor 675 g. **100 g: 219 kkal, oqsil 21.4 g, yog' 12.4 g, uglevod 4.7 g.**

### Chaxoxbili (tovuq pomidorda dimlangan) (`chaxoxbili`)

*porsiya 300 g · odatiy gruzincha retsept; tovuq (terisi bilan, suyaksiz netto) dimlashda −30 %, sabzavot −20 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tovuq go'shti (terisi bilan, xom) | 1000 | USDA 171447 («Chicken, broilers or fryers, meat and skin, raw») |
| piyoz | 400 | USDA 170000 («Onions, raw») |
| pomidor | 600 | USDA 170457 («Tomatoes, red, ripe, raw, year round average») |
| shirin qalampir | 200 | USDA 170108 («Peppers, sweet, red, raw») |
| kungaboqar yog'i | 15 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |
| sarimsoq | 15 | USDA 169230 («Garlic, raw») |
| kashnich | 30 | USDA 169997 («Coriander (cilantro) leaves, raw») |
| achchiq qalampir | 5 | USDA 170106 («Peppers, hot chili, red, raw») |

Jami 2265 g → tayyor 1720 g. **100 g: 153 kkal, oqsil 11.6 g, yog' 9.8 g, uglevod 4.6 g.**

### Mol go'shti otbivnoyi (panirovkada) (`mol-otbivnoy`)

*dona 130 g · odatiy retsept, ~4 dona; tuxum + suxari panirovka, go'sht qovurishda −30 %, yutilgan yog' 40 g*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol go'shti (son qismi, xom) | 500 | USDA 171816 («Beef, round, top round, steak, separable lean only, trimmed to 1/8" fat, all grades, raw») |
| tuxum | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| non suxari | 60 | USDA 174928 («Bread, crumbs, dry, grated, plain») |
| un | 20 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| kungaboqar yog'i (yutilgan) | 40 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |

Jami 720 g → tayyor 560 g. **100 g: 265 kkal, oqsil 24.5 g, yog' 13.1 g, uglevod 10.6 g.**

### Zrazy (tuxum to'ldirmali go'shtli kotlet) (`zrazy`)

*dona 110 g · odatiy retsept (СР kotlet massasi: go'sht + sutga ivitilgan non), ~8 dona; iching — tuxum va piyoz; qovurishda ~22 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol qiymasi (xom, yog'i 15 %) | 600 | USDA 171796 («Beef, ground, 85% lean meat / 15% fat, raw») |
| oq non | 100 | USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)») |
| sut | 100 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| piyoz | 100 | USDA 170000 («Onions, raw») |
| qaynatilgan tuxum (3 dona) | 150 | USDA 173424 («Egg, whole, cooked, hard-boiled») |
| non suxari | 50 | USDA 174928 («Bread, crumbs, dry, grated, plain») |
| kungaboqar yog'i (yutilgan) | 30 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |

Jami 1130 g → tayyor 940 g. **100 g: 250 kkal, oqsil 16.0 g, yog' 15.5 g, uglevod 10.8 g.**

### Bug'da pishirilgan kotlet (mol go'shti) (`kotlet-bug`)

*dona 80 g · odatiy retsept (СР bug'da kotlet), ~11 dona; bug'da pishirishda ~16 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| mol qiymasi (xom, yog'i 10 %) | 700 | USDA 174030 («Beef, ground, 90% lean meat / 10% fat, raw») |
| oq non | 150 | USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)») |
| sut | 150 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| piyoz | 50 | USDA 170000 («Onions, raw») |

Jami 1050 g → tayyor 920 g. **100 g: 189 kkal, oqsil 17.2 g, yog' 8.7 g, uglevod 9.3 g.**

### Kurka kotleti (`kurka-kotlet`)

*dona 80 g · odatiy retsept, ~10 dona; qovurishda ~20 %, yutilgan yog' 25 g*

| Masalliq | Netto, g | Manba |
|---|---|---|
| kurka qiymasi (xom, yog'i 7 %) | 700 | USDA 172850 («Turkey, ground, 93% lean, 7% fat, raw») |
| oq non | 100 | USDA 174924 («Bread, white, commercially prepared (includes soft bread crumbs)») |
| sut | 100 | USDA 171265 («Milk, whole, 3.25% milkfat, with added vitamin D») |
| piyoz | 70 | USDA 170000 («Onions, raw») |
| tuxum | 50 | USDA 171287 («Egg, whole, raw, fresh») |
| non suxari | 30 | USDA 174928 («Bread, crumbs, dry, grated, plain») |
| kungaboqar yog'i (yutilgan) | 25 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |

Jami 1075 g → tayyor 840 g. **100 g: 216 kkal, oqsil 18.4 g, yog' 11.5 g, uglevod 9.8 g.**

### Tovuq ruleti (pishloq va qo'ziqorinli) (`tovuq-rulet`)

*bolak 100 g · odatiy retsept; tovuq ko'krak duxovkada −30 %, qo'ziqorin qovurishda −40 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tovuq ko'krak (xom) | 800 | USDA 171077 («Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw») |
| qattiq pishloq | 150 | USDA 171241 («Cheese, gouda») |
| qo'ziqorin (shampinon, xom) | 200 | USDA 169251 («Mushrooms, white, raw») |
| piyoz | 50 | USDA 170000 («Onions, raw») |
| kungaboqar yog'i | 15 | USDA 171025 («Oil, sunflower, linoleic, (approx. 65%)») |

Jami 1215 g → tayyor 870 g. **100 g: 194 kkal, oqsil 25.8 g, yog' 8.9 g, uglevod 1.7 g.**

### Sharlotka (olmali pirog) (`sharlotka`)

*bolak 120 g · odatiy uy retsepti (4 tuxum : 1 stakan shakar : 1 stakan un), olma 500 g; pishirishda ~15 %*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tuxum (4 dona) | 200 | USDA 171287 («Egg, whole, raw, fresh») |
| shakar | 200 | USDA 169655 («Sugars, granulated») |
| bug'doy uni | 200 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| olma (po'stsiz) | 500 | USDA 171689 («Apples, raw, without skin») |
| sariyog' (qolipga) | 10 | USDA 173410 («Butter, salted») |

Jami 1110 g → tayyor 945 g. **100 g: 222 kkal, oqsil 5.0 g, yog' 3.1 g, uglevod 44.2 g.**

### Smetannik (smetanali tort) (`smetannik`)

*bolak 100 g · odatiy uy retsepti; korj 950 g (pishirishda −12 %) + smetana-shakar kremi 700 g*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 400 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| shakar (xamirga) | 200 | USDA 169655 («Sugars, granulated») |
| smetana (xamirga) | 200 | USDA 171257 («Cream, sour, cultured») |
| tuxum (3 dona) | 150 | USDA 171287 («Egg, whole, raw, fresh») |
| smetana (krem) | 500 | USDA 171257 («Cream, sour, cultured») |
| shakar (krem) | 200 | USDA 169655 («Sugars, granulated») |

Jami 1650 g → tayyor 1536 g. **100 g: 300 kkal, oqsil 5.0 g, yog' 10.0 g, uglevod 48.1 g.**

### Muraveynik (yong'oq va sgushenkali tort) (`muraveynik`)

*bolak 100 g · odatiy uy retsepti; xamir 950 g (pishirishda −15 %), krem: quyultirilgan sut 380 g + sariyog' 150 g, yong'oq 100 g*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 500 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sariyog' (xamirga) | 200 | USDA 173410 («Butter, salted») |
| smetana | 100 | USDA 171257 («Cream, sour, cultured») |
| shakar | 100 | USDA 169655 («Sugars, granulated») |
| tuxum | 50 | USDA 171287 («Egg, whole, raw, fresh») |
| quyultirilgan sut | 380 | USDA 171275 («Milk, canned, condensed, sweetened») |
| sariyog' (krem) | 150 | USDA 173410 («Butter, salted») |
| yong'oq | 100 | USDA 170187 («Nuts, walnuts, english») |

Jami 1580 g → tayyor 1440 g. **100 g: 476 kkal, oqsil 7.5 g, yog' 28.6 g, uglevod 49.1 g.**

### Kartoshka pirojnoe (shokoladli) (`kartoshka-pirojnoe`)

*dona 50 g · klassik retsept: biskvit uvog'i + sariyog'-quyultirilgan sut kremi + kakao*

| Masalliq | Netto, g | Manba |
|---|---|---|
| biskvit uvog'i | 300 | USDA 172707 («Cake, sponge, prepared from recipe») |
| sariyog' | 100 | USDA 173410 («Butter, salted») |
| quyultirilgan sut | 100 | USDA 171275 («Milk, canned, condensed, sweetened») |
| kakao | 20 | USDA 169593 («Cocoa, dry powder, unsweetened») |
| yong'oq | 30 | USDA 170187 («Nuts, walnuts, english») |

Jami 550 g → tayyor 550 g. **100 g: 395 kkal, oqsil 7.1 g, yog' 22.7 g, uglevod 44.2 g.**

### Trubochka (kremli, sloyka) (`trubochka-krem`)

*dona 50 g · odatiy retsept, ~19 dona; uy sloyka xamiri (−20 % pishirishda) + oqsil-qiyom kremi (qiyom bug'lanishi ~80 g)*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 250 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sariyog' | 200 | USDA 173410 («Butter, salted») |
| suv | 110 | — |
| tuxum (surtish) | 25 | USDA 171287 («Egg, whole, raw, fresh») |
| tuxum oqsili | 150 | USDA 172183 («Egg, white, raw, fresh») |
| shakar | 300 | USDA 169655 («Sugars, granulated») |
| suv (qiyom) | 100 | — |

Jami 1135 g → tayyor 940 g. **100 g: 385 kkal, oqsil 5.0 g, yog' 17.8 g, uglevod 52.4 g.**

### Korzinochka (kremli savatcha pirojnoe) (`korzinochka`)

*dona 50 g · odatiy retsept; qumli xamir (−10 % pishirishda) + murabbo + sariyog'-quyultirilgan sut kremi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 300 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sariyog' (xamirga) | 180 | USDA 173410 («Butter, salted») |
| shakar | 100 | USDA 169655 («Sugars, granulated») |
| tuxum | 50 | USDA 171287 («Egg, whole, raw, fresh») |
| murabbo | 80 | USDA 169641 («Jams and preserves») |
| sariyog' (krem) | 100 | USDA 173410 («Butter, salted») |
| quyultirilgan sut | 150 | USDA 171275 («Milk, canned, condensed, sweetened») |

Jami 960 g → tayyor 913 g. **100 g: 467 kkal, oqsil 5.7 g, yog' 27.2 g, uglevod 51.1 g.**

### Oreshki (sgushenkali yong'oqcha pechenye) (`oreshki`)

*dona 15 g · odatiy uy retsepti; qobiqlar 800 g xamir (−12 %), iching: qaynatilgan quyultirilgan sut + sariyog' + yong'oq*

| Masalliq | Netto, g | Manba |
|---|---|---|
| bug'doy uni | 400 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| sariyog' (xamirga) | 200 | USDA 173410 («Butter, salted») |
| shakar | 100 | USDA 169655 («Sugars, granulated») |
| tuxum (2 dona) | 100 | USDA 171287 («Egg, whole, raw, fresh») |
| quyultirilgan sut (qaynatilgan) | 380 | USDA 171275 («Milk, canned, condensed, sweetened») |
| sariyog' (iching) | 50 | USDA 173410 («Butter, salted») |
| yong'oq | 70 | USDA 170187 («Nuts, walnuts, english») |

Jami 1300 g → tayyor 1205 g. **100 g: 453 kkal, oqsil 8.0 g, yog' 24.5 g, uglevod 51.7 g.**

### Pirojnoe (biskvitli, kremli) (`pirojnoe-krem`)

*dona 70 g · odatiy retsept; biskvit (−12 % pishirishda) + shakar qiyomi + sariyog'-quyultirilgan sut kremi*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tuxum (4 dona) | 200 | USDA 171287 («Egg, whole, raw, fresh») |
| shakar | 150 | USDA 169655 («Sugars, granulated») |
| bug'doy uni | 150 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| shakar (qiyom) | 50 | USDA 169655 («Sugars, granulated») |
| suv (qiyom) | 100 | — |
| sariyog' (krem) | 150 | USDA 173410 («Butter, salted») |
| quyultirilgan sut | 120 | USDA 171275 («Milk, canned, condensed, sweetened») |

Jami 920 g → tayyor 860 g. **100 g: 357 kkal, oqsil 6.0 g, yog' 17.7 g, uglevod 44.3 g.**

### Biskvit rulet (murabboli) (`rulet-biskvit`)

*bolak 60 g · odatiy uy retsepti; biskvit (−15 % pishirishda) + murabbo 200 g*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tuxum (5 dona) | 250 | USDA 171287 («Egg, whole, raw, fresh») |
| shakar | 150 | USDA 169655 («Sugars, granulated») |
| bug'doy uni | 150 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| murabbo/povidlo | 200 | USDA 169641 («Jams and preserves») |

Jami 750 g → tayyor 670 g. **100 g: 304 kkal, oqsil 7.1 g, yog' 3.8 g, uglevod 60.3 g.**

### Vafli trubochka (sgushenkali) (`vafli-trubochka`)

*dona 20 g · odatiy uy retsepti (vafli temirida); vafli xamiri pishirishda ~25 % yo'qotadi, iching — qaynatilgan quyultirilgan sut*

| Masalliq | Netto, g | Manba |
|---|---|---|
| tuxum (3 dona) | 150 | USDA 171287 («Egg, whole, raw, fresh») |
| shakar | 150 | USDA 169655 («Sugars, granulated») |
| sariyog' | 150 | USDA 173410 («Butter, salted») |
| bug'doy uni | 200 | USDA 168894 («Wheat flour, white, all-purpose, enriched, bleached») |
| quyultirilgan sut (qaynatilgan) | 380 | USDA 171275 («Milk, canned, condensed, sweetened») |

Jami 1030 g → tayyor 870 g. **100 g: 439 kkal, oqsil 8.1 g, yog' 19.6 g, uglevod 58.7 g.**

## Qiymati 15 % dan ko'p o'zgarganlar (32 ta; eski — `HEAD` dagi baza)

| Taom | Eski kkal/100 g | Yangi | Farq | Yangi manba |
|---|---|---|---|---|
| Quruq meva kompoti (shakarsiz) (`kompot-quruq-shakarsiz`) | 20 | 40 | +100 % | Retsept hisobi (standart retsept) |
| Matcha choy (sof, shakarsiz) (`matcha`) | 7 | 3 | -57 % | Retsept hisobi (masalliqlar grammi) |
| Lenivie vareniki (tvorogli) (`lenivie-vareniki`) | 165 | 227 | +38 % | Retsept hisobi (standart retsept) |
| Shirchoy (qaymoqli, tuzli) (`shirchoy-qaymoqli`) | 35 | 48 | +37 % | Retsept hisobi (standart retsept) |
| Tovuq lapsha sho'rva (uyda) (`tovuq-lapsha-uy`) | 52 | 69 | +33 % | Retsept hisobi (standart retsept) |
| Baqlajon (qovurilgan) (`baqlajon-qovurilgan`) | 129 | 170 | +32 % | Retsept hisobi (standart retsept) |
| Tovuqli guruch sho'rva (`tovuq-guruch-shurva`) | 47 | 61 | +30 % | Retsept hisobi (standart retsept) |
| Uxa (qizil baliqli) (`uxa-qizil-baliq`) | 35 | 44 | +26 % | Retsept hisobi (standart retsept) |
| Sutli guruch sho'rva (suyuq) (`sutli-guruch-shurva`) | 72 | 90 | +25 % | Retsept hisobi (standart retsept) |
| Koreyscha bodring (`koreyscha-bodring`) | 64 | 80 | +25 % | Retsept hisobi (standart retsept) |
| Qovoqcha (qovurilgan) (`qovoqcha-qovurilgan`) | 101 | 125 | +24 % | Retsept hisobi (standart retsept) |
| Sabzavotli sho'rva (go'shtsiz) (`sabzavotli-shurva`) | 38 | 29 | -24 % | Retsept hisobi (standart retsept) |
| Mol go'shtli sho'rva (uyda) (`shurva-mol-uy`) | 68 | 52 | -24 % | Retsept hisobi (standart retsept) |
| Qo'ziqorinli sho'rva (kartoshkali) (`qoziqorin-shurva`) | 43 | 33 | -23 % | Retsept hisobi (standart retsept) |
| Atala (sutli) (`atala-sutli`) | 70 | 86 | +23 % | Retsept hisobi (standart retsept) |
| Lag'mon suyuq (mol go'shtli, uyda) (`lagmon-mol-uy`) | 124 | 96 | -23 % | Retsept hisobi (standart retsept) |
| Olivye salati (tovuqli) (`olivye-tovuq`) | 170 | 207 | +22 % | Retsept hisobi (standart retsept) |
| Qo'ziqorin (piyoz bilan qovurilgan) (`qoziqorin-qovurilgan`) | 93 | 113 | +22 % | Retsept hisobi (standart retsept) |
| Moshxo'rda (tovuqli) (`moshxorda-tovuq`) | 63 | 76 | +21 % | Retsept hisobi (standart retsept) |
| Olcha kompoti (shakarli) (`kompot-olcha`) | 39 | 47 | +21 % | Retsept hisobi (standart retsept) |
| Qo'ziqorinli salat (tovuq, tuxum, mayonez) (`qoziqorin-salat`) | 212 | 254 | +20 % | Retsept hisobi (standart retsept) |
| Piyova (piyozli sho'rva, qo'y go'shtli) (`piyova`) | 80 | 65 | -19 % | Retsept hisobi (standart retsept) |
| Apelsin-sabzi fresh (yangi siqilgan) (`fresh-apelsin-sabzi`) | 43 | 51 | +19 % | Retsept hisobi (masalliqlar grammi) |
| Umoch oshi (`umoch-oshi`) | 79 | 65 | -18 % | Retsept hisobi (standart retsept) |
| Go'ja oshi (qatiqli, jo'xori) (`goja-oshi`) | 51 | 42 | -18 % | Retsept hisobi (standart retsept) |
| Ko'za sho'rva (qo'y go'shti, no'xatli) (`kuza-shurva`) | 80 | 93 | +16 % | Retsept hisobi (standart retsept) |
| Mastava (qatiq bilan) (`mastava-qatiq`) | 80 | 67 | -16 % | Retsept hisobi (standart retsept) |
| Kifta sho'rva (qiyma sharchali) (`kifta-shurva`) | 68 | 57 | -16 % | Retsept hisobi (standart retsept) |
| Befstroganov (mol go'shti smetana sousida) (`befstroganov`) | 189 | 219 | +16 % | Retsept hisobi (standart retsept) |
| Go'ja sho'rva (go'shtli) (`goja-gosht`) | 76 | 64 | -16 % | Retsept hisobi (standart retsept) |
| Rassolnik (`rassolnik`) | 66 | 56 | -15 % | Retsept hisobi (standart retsept) |
| Kartoshka pirojnoe (shokoladli) (`kartoshka-pirojnoe`) | 465 | 395 | -15 % | Retsept hisobi (standart retsept) |
<!-- AVTOMATIK-OXIR -->

## Testlar
`test-baza-mantiq` (a–i, guruh, qidiruv, qo'shimcha hisobi), `test-kalkifit-v87` (8 guruh), `test-yangilik` (oxirgi 3), `test-stat` (bixil).
