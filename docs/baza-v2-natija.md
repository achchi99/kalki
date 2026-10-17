# Baza v2 — natija (2-bosqich)

Sana: 2026-10-17 · branch `baza-v2` · 272 ta taom (268 eski + 4 yangi) · top-150: **150** · oilalar: **23** · eski id → alias: **37** · retseptli (top): 20 · USDA bilan tekshirilgan (top): 57 · «taxminiy» (top): 98.

## Qiymati o'zgargan taomlar (kkal/100 g, eski v1 → v2)

Hammasi retseptdan (USDA FDC + Скурихин; tools/baza-hisob.js). Qo'lda raqam yo'q. **Hammasi «taxminiy»** (retsept miqdori va yield taxminiy, uy tarozisida tasdiqlanmagan). Foydalanuvchi qarorlari: norin 278, osh standarti 190, sho'rva «Tarkibi» 37 / 53 / 76.

| id | eski | yangi | farq |
|---|---|---|---|
| norin | 190 | 278 | +46% |
| shurva | 75 | 53 | -29% |
| chuchvara | 200 | 254 | +27% |
| qovurdoq | 250 | 185 | -26% |
| dimlama | 100 | 121 | +21% |
| jarkop | 230 | 196 | -15% |
| moshkichiri | 125 | 110 | -12% |
| non | 270 | 292 | +8% |
| manti | 210 | 226 | +8% |
| dolma | 150 | 139 | -7% |
| qozon-kabob | 250 | 235 | -6% |
| moshxorda | 85 | 80 | -6% |
| osh | 200 | 190 | -5% |
| mastava | 80 | 83 | +4% |
| somsa | 290 | 296 | +2% |
| lagmon | 120 | 118 | -2% |

> Oila ichidagi eski alias yozuvlar (somsa-qat, yengil-osh …) o'z eski qiymatini saqlaydi (yozuvlar buzilmasligi uchun); oilada esa yangi kombinatsiya qiymati ishlatiladi.

## Oddiy mahsulotlarni USDA bilan solishtirish (±10% — «tekshirilgan», aks holda farq sifatida ro'yxatda; qiymat o'zgartirilmagan)

| Taom | Bazada | USDA | Farq | fdc_id | USDA tavsifi |
|---|---|---|---|---|---|
| mol-gosht | 215 | 191 | +13% | 171203 | Beef, chuck for stew, separable lean and fat, cooked, braised |
| qoy-gosht | 290 | 344 | -16% | 172497 | Lamb, shoulder, separable lean and fat, 1/4" fat, cooked, braised |
| non-qora | 210 | 259 | -19% | 172684 | Bread, rye |
| noxat | 125 | 164 | -24% | 173757 | Chickpeas, mature seeds, cooked, boiled |
| krem-pishloq | 250 | 350 | -29% | 173418 | Cheese, cream |

Bu 5 taomda baza qiymati USDA'dan 13–29% farq qiladi (ehtimol boshqa tayyorlash/yog'lilik). **O'zgartirilmadi** — qaror sizda.

## Qanday kalibrlanadi

`docs/tarozida-tekshirish.md` 0-bo'lim (osh, manti, sho'rva) → `data/baza-olchovlar.json` → `node tools/baza-hisob.js --olchov` (hisobot) → `--kalibr` → `node tools/baza-hisob.js --yoz` (baza qayta yasaladi, kalibrlangan retsept «taxminiy» belgisisiz).
