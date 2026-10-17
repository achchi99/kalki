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
