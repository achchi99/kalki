# Baza v2 — haqiqiy ma'lumot bilan tekshiruv (2-bosqichdan oldin)

Sana: 2026-10-17 · Holat: **hisob-kitob, bazaga hech narsa yozilmagan.** `tools/baza-hisob.js --yoz` o'chirilgan; `data/ovqatlar.json` o'zgarmagan.

## 1. Nima o'zgardi (xotiradan → haqiqiy ma'lumot)

- **Masalliq qiymatlari endi USDA FoodData Central'dan** (SR Legacy 2018-04, rasmiy CSV arxiv; API'ning DEMO_KEY limiti — soatiga 30 so'rov — yetmasligi uchun arxiv yuklandi, sha256 yozilgan). Faqat ishlatilgan 31 ta fdc_id `data/manba/usda-sr-legacy.json` ga ko'chirildi (qiymat, tavsif, uy o'lchovlari, yuklangan sana `2026-10-17`).
- **Ikkinchi mustaqil manba — Скурихин jadvali** (nashr qilingan «Химический состав пищевых продуктов»; qiymatlar `health-diet.ru` sahifalaridan, har yozuvda url): 10 ta masalliq (`data/manba/skurikhin.json`). Skurikhin'da pishgan juft yo'q — yield'ning bir qismi ikkala hisobda umumiy (quyida «cheklov»).
- **Yield (pishgandagi vazn)** guruch, go'sht, kartoshka, mosh, no'xat uchun USDA'ning xom/pishgan **juftidan avtomatik** (oqsil yoki kkal nisbati). Sabzavot, piyoz, qovoq, ko'kat va qovurish/pishirish yo'qotishlari — USDA'da juft yo'q → **taxmin**, hisobotda alohida belgilanadi.
- Dumba (qo'y dumba yog'i) USDA'da yo'q: USDA «lamb, separable fat» (665 kkal) ishlatildi; Скурихин «Жир бараний» 897 kkal. Ot go'shti (norin) USDA'da yo'q: USDA hisobida mol go'shti o'rniga qo'yildi (taxmin), Скурихин hisobida «Конина 1 кат.» (167 kkal).
- Qurilma: `tools/baza-manba-yukla.py` (USDA → data/manba), `data/baza-masalliq.json`, `data/baza-retseptlar.json` (39 retsept), `tools/baza-hisob.js`.

## 2. Natija: hozirgi qiymatdan farq

Retsept = **o'rtacha uy retsepti** (xom vazn, g — `data/baza-retseptlar.json`). Qiymat — 100 g pishgan taom, kkal. «Yangi» = USDA hisobi; «taxminiy» (norin, sho'rva, qovurdoq) uchun USDA va Скурихин hisobining **o'rtachasi**.

| Retsept | Eski | USDA | Скурихин | Yangi | Farq | Belgi |
|---|---|---|---|---|---|---|
| Osh: go'sht kam, yog' kam | 200 | 158 | — | 158 | -21.0% | **>15%** |
| Osh: go'sht kam, yog' odatiy | 200 | 170 | — | 170 | -15.0% |  |
| Osh: go'sht kam, yog' kop | 200 | 186 | — | 186 | -7.0% |  |
| Osh: go'sht orta, yog' kam | 200 | 169 | — | 169 | -15.5% | **>15%** |
| Osh: go'sht orta, yog' odatiy | 200 | 180 | — | 180 | -10.0% |  |
| Osh: go'sht orta, yog' kop | 200 | 195 | — | 195 | -2.5% |  |
| Osh: go'sht kop, yog' kam | 200 | 181 | — | 181 | -9.5% |  |
| Osh: go'sht kop, yog' odatiy | 200 | 191 | — | 191 | -4.5% |  |
| Osh: go'sht kop, yog' kop | 200 | 205 | — | 205 | +2.5% |  |
| Somsa: xamir oddiy, ichi yogli | 290 | 296 | — | 296 | +2.1% |  |
| Somsa: xamir oddiy, ichi qovoq | 230 | 197 | — | 197 | -14.3% |  |
| Somsa: xamir qatlama, ichi yogli | 330 | 345 | — | 345 | +4.5% |  |
| Manti (go'shtli) | 210 | 226 | — | 226 | +7.6% |  |
| Chuchvara (qaynatma) | 200 | 254 | — | 254 | +27.0% | **>15%** |
| Lag'mon (sho'rvali) | 120 | 118 | — | 118 | -1.7% |  |
| Sho'rva (qo'y, sabzavotli quyuq) | 75 | 57 | 48 | 53 (taxminiy) | -29.3% | **>15%** |
| Mastava | 80 | 83 | — | 83 | +3.8% |  |
| Moshxo'rda | 85 | 80 | — | 80 | -5.9% |  |
| Moshkichiri | 125 | 110 | — | 110 | -12.0% |  |
| Qozon kabob | 250 | 235 | — | 235 | -6.0% |  |
| Qovurdoq | 250 | 195 | 175 | 185 (taxminiy) | -26.0% | **>15%** |
| Dimlama | 100 | 121 | — | 121 | +21.0% | **>15%** |
| Norin (xamir + qaynatma go'sht) | 190 | 307 | 249 | 278 (taxminiy) | +46.3% | **>30% — O'ZGARTIRILMAYDI** |
| Kartoshka (qovurma) | 160 | 146 | — | 146 | -8.8% |  |
| Do'lma (karam bargida) | 150 | 139 | — | 139 | -7.3% |  |
| Jarkop | 230 | 196 | — | 196 | -14.8% |  |
| Obi non (tandir) | 270 | 292 | — | 292 | +8.1% |  |
| Patir | 300 | 318 | — | 318 | +6.0% |  |
| Qatlama (non) | 380 | 399 | — | 399 | +5.0% |  |

### 2.1 15% dan ko'p farq qilganlar (haqiqiy ma'lumot bilan qayta hisoblangan)

| Taom | Eski | Yangi | Farq | Qaror |
|---|---|---|---|---|
| Osh: go'sht kam, yog' kam | 200 | 158 | -21.0% | tasdiqlansa yangilanadi |
| Osh: go'sht orta, yog' kam | 200 | 169 | -15.5% | tasdiqlansa yangilanadi |
| Chuchvara (qaynatma) | 200 | 254 | +27.0% | tasdiqlansa yangilanadi |
| Sho'rva (qo'y, sabzavotli quyuq) | 75 | 53 | -29.3% | tasdiqlansa yangilanadi; «taxminiy» belgisi bilan |
| Qovurdoq | 250 | 185 | -26.0% | tasdiqlansa yangilanadi; «taxminiy» belgisi bilan |
| Dimlama | 100 | 121 | +21.0% | tasdiqlansa yangilanadi |
| Norin (xamir + qaynatma go'sht) | 190 | 278 | +46.3% | o'zgartirmayman — sizning qaroringiz |

**Chegarada (|farq| 10–15%):** Moshkichiri -12.0%; Jarkop -14.8%.
**Oshning standart kombinatsiyasi** (go'sht o'rta × yog' odatiy): 200 → **180** (−10%); omillar bilan 158–205 oralig'i.

### 2.2 Eski «xotiradan» jadvaldan farq

Oldingi (1-bosqich) jadval xotiradagi qiymatlar bilan edi: osh 183 → 180, somsa 311 → 296, manti 234 → 226, **chuchvara 226 → 254**, sho'rva 53 → 57 (USDA) / 48 (Скурихин), qovurdoq 189 → 195 / 175, norin 288 → 307 / 249, dimlama 116 → 121, jarkop 191 → 196. Yo'nalish bir xil; ulushlar 10% ichida o'zgardi, faqat chuchvara (yield taxmini o'zgargani sabab).

## 3. Cheklovlar (halol)

1. **Retsept miqdorlari** (masalan «somsa: 300 g un, 220 g qo'y go'shti, 70 g dumba…») — **mening o'rtacha uy retseptim**, nashr qilingan manbadan emas: Сборник рецептur'lar internetda ochiq topilmadi (qidiruv natijalari — foydalanuvchi kalkulyatorlari, «Источник: Интернет»; ularni manba sifatida qabul qilmadim). Shuning uchun aniq raqam emas, **yo'nalish** ishonchli. Tasdiqlash yo'li: sizning 5 ta uy taomingiz (tarozida).
2. **Yield taxminlari** retsept bo'yicha farq qiladi. «Taxmin ulushi» = pishgan vazn massasining qancha qismi USDA'da juft bo'lmagan, taxminiy koeffitsientdan kelgani: **manti/chuchvara 87%** (xamir ichidagi go'sht ×0,85 — taxmin), **somsa 36–81%**, **non 54–63%** (tandirda pishish yo'qotishi), **dimlama 54%**, do'lma 44%, norin 40%, qovurdoq 28%, lag'mon 26%, jarkop 19%, sho'rva 14%, osh/mastava/moshxo'rda/qozon kabob/qovurma ≤10%. Ya'ni **osh, sho'rva, qozon kabob** raqamlari yield'ga kam bog'liq (ishonchliroq); **somsa, manti, chuchvara, non** — ko'proq (tarozida tekshirish shu birliklarga qaratiladi).
3. Skurikhin va USDA hisoblari **masalliq qiymatida mustaqil**, lekin yield va retsept miqdori umumiy → ikki hisob orasidagi kichik farq «ishonchli» degani emas, faqat masalliq jadvali farqini ko'rsatadi.
4. USDA'da uy sharoitidagi o'zbek masalliqlari (dumba, ot go'shti, qazi, qurt) yo'q — ular Скурихин yoki taxmin bilan.

## 4. 30% dan oshganlar — o'zgartirmadim


- **Norin (xamir + qaynatma go'sht)**: 190 → 278 (+46.3%; USDA 307, Скурихин 249). Eski qiymat go'sht ulushini juda kam olgan ko'rinadi, lekin retsept miqdori taxmin — sizning qaroringiz kerak.

## 5. Keyingi qadam

Jadvalni ko'rib chiqing: (1) shu usul qabul qilinsa 2-bosqichga o'tamiz (`baza-hisob.js --yoz` yoqiladi, `x: taxminiy` belgilari bilan); (2) norin (+46%) bo'yicha qaror; (3) 5 ta uy taomi natijalari kelsa retseptlar o'sha qiymatlar bilan kalibrlanadi.

## 6. Oldin «tuzatilgan» osh (≈200) va sho'rva (75) qiymatlari — yangi retsept bilan izoh

Eski qiymatlar uchun yagona asos — `tools/ovqatlar-manba.json` dagi tarkib izohi. Shu izohni **haqiqiy USDA/Скурихин qiymatlari bilan** qayta hisobladim va yangi retsept bilan solishtirdim. **Bazaga tegmadim** — farqlar quyida, qaror sizda.

### Osh (bazada 200 kkal/100 g)

| | 100 g pishgan oshda (g) | Kkal/100 g |
|---|---|---|
| Eski izoh: «guruch 26, sabzi 26, go'sht 18, yog' 5 g/100 g» (xom deb olinsa) | guruch 26 · sabzi 26 · go'sht 18 · yog' 5 | **196** (USDA) · **187** (Скурихин qiymatlari) |
| Yangi retsept (1 kg guruch, 1 kg sabzi, 250 g piyoz, 800 g go'sht, 220 g yog'), yield 4544 g | guruch 22.0 · sabzi 22.0 · piyoz 5.5 · go'sht 17.6 · yog' 4.8 | **180** |

- **Eski 200 o'z izohiga mos** (196 USDA, 187 Скурихин) — bu yerda «tuzatish» to'g'ri bo'lgan.
- Yangi retsept 180 beradi (**−10%**). Sabab bitta: **guruchning pishgandagi vazni.** Eski izoh guruchni 26% olgan (pishgan oshning yield'i ≈ 3,8 kg/kg guruch → guruch ×2,0); yangi hisobda yield USDA juftidan avtomatik (guruch xom 365 → pishgan 130 kkal = **×2,81**, ya'ni 22%). Oshda guruch qaynatmadagidan kamroq suv shimadi (zirvak quyuq), shuning uchun real koeffitsient 2,0–2,8 oralig'ida — **bu aynan tarozida o'lchanadigan narsa** (uy oshi: guruch xom/pishgan).
- Natija: osh 180–200 oralig'ida (|farq| ≤10%) — **±15% maqsadi ichida**; qaysi biri to'g'ri ekani yield o'lchovi bilan hal bo'ladi.
- Agar eski izohdagi 26 g guruch **pishgan** guruch bo'lsa, tarkib 135 kkal beradi — izoh bunday emas deb tushundim (200 bilan mos kelmaydi).

### Sho'rva (bazada 75 kkal/100 g)

| | 100 g sho'rvada (g) | Kkal/100 g |
|---|---|---|
| Eski izoh: «qo'y go'shti 16, kartoshka 16, sabzi 6, suv 70 g/100 g» | qo'y 16 · kartoshka 16 · sabzi 6 · suv 70 | **58** (USDA) · **48** (Скурихин) |
| Yangi retsept (400 g qo'y, 400 g kartoshka, 200 g sabzi, 150 g piyoz, 100 g pomidor, 50 g qalampir, 2 l suv), yield 2722 g | qo'y 14.7 · kartoshka 14.7 · sabzi 7.3 · piyoz 5.5 | **57** (USDA) · **48** (Скурихин) · o'rtacha **53** |

- ⚠ **Bazadagi 75 o'z izohiga ham mos emas**: izohdagi tarkib 58 (USDA) / 48 (Скурихин) kkal beradi, ya'ni 75 u dan **+29% / +56%** yuqori. Izohning o'zi «ru-jadvaldan past» deb yozgan edi — demak 75 ning asosi izohda ko'rsatilmagan (qo'shimcha yog'/sho'rvaning yog' qatlami hisobga olingan bo'lishi mumkin).
- Yangi retsept eski **izohga** mos (57 / 48) va 53 ga olib keladi (**−29% bazadagi 75 dan**). Ya'ni farq retseptdan emas, 75 raqamining o'zidan.
- **Sho'rvaning bir narsaga sezgirligi:** yog' qatlami. Go'shtli quyuq sho'rvada suzib yurgan yog' bo'lsa 70–80 ga ko'tariladi, qaynatma/yog'siz bo'lsa 35–45 ga tushadi. Shuning uchun sho'rva uchun omil («tarkibi») majburiy chip bo'ladi va qiymat «taxminiy» belgisi bilan chiqadi.
- **Qaror sizda:** 75 ni saqlash (eski), 53 ga o'tkazish (izohga mos) yoki sho'rvani 3 ta omil kombinatsiyasi qilib (qaynatma ~40 / sabzavotli ~53 / yog'li quyuq ~75) — **men hech narsani o'zgartirmadim**.
