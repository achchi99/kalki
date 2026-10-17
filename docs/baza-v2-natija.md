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

## Oddiy mahsulotlar: USDA / Скурихин bilan solishtirish — tuzatilgan (2026-10-17)

Oldingi 5 ta «farq» noto'g'ri yozuvlarga bog'langan edi (holat/qism nomga mos emas). Endi yozuv nomdagi holatga (xom/pishgan), go'sht qismi va yog'lilikka qarab tanlandi:

| Taom (bazadagi nom) | fdc_id / manba | USDA yozuvi | Bazada eski | Yangi | Qaror |
|---|---|---|---|---|---|
| noxat — No'xat (pishgan) | **173757** | Chickpeas, mature seeds, cooked, boiled, without salt | 125 | **164** | yangilandi |
| krem-pishloq — Qaymoqli pishloq | **173418** | Cheese, cream | 250 | **350** | yangilandi |
| mol-gosht — Mol go'shti (pishgan) | **169484** | Beef, composite of trimmed retail cuts, separable lean and fat, trimmed to 1/8" fat, all grades, cooked (o'rtacha yog'li, 259 kkal; avvalgi tanlov 171203 «chuck for stew» yog'siz bo'lak edi — 191) | 215 | **259** | yangilandi (+20%) |
| qoy-gosht — Qo'y go'shti (pishgan) | **172480** | Lamb, composite of trimmed retail cuts, separable lean and fat, trimmed to 1/4" fat, choice, cooked (294; avvalgi tanlov 172497 bitta yog'li bo'lak — 344) | 290 | 290 | USDA bilan ±10% ichida — o'zgarmadi, tekshirilgan |
| non-qora — Qora non | **Скурихин** — «Хлеб ржано-пшеничный бородинский», health-diet.ru/base_of_food/sostav/418 | 201 kkal (O 6,8 · Y 1,3 · U 39,8); USDA «Bread, rye» (259) bizning qora nonimiz emas | 210 | 210 | qiymat qoldi (Скурихин bilan −4%), manba Скурихин |
| mol-qiyma — Qiyma (mol, pishgan) | **174034** | Beef, ground, 85% lean / 15% fat, crumbles, cooked, pan-browned (256) — oldin xom yozuv bilan solishtirilgan edi | 250 | 250 | ±10% ichida, tekshirilgan |
| losos — Losos (pishgan) | **175168** | Fish, salmon, Atlantic, farmed, cooked, dry heat (206) — oldin xom yozuv bilan solishtirilgan edi | 205 | 205 | ±10% ichida, tekshirilgan |

Hammasi: `data/baza-oddiy.json` (har yozuvda sabab), qiymatlar `data/manba/usda-sr-legacy.json` (fdc_id bilan) va `data/manba/skurikhin.json` dan. Eski noto'g'ri bog'lanish olib tashlandi (non — «Bread, pita» ham olib tashlandi: non endi retseptdan).

## Qanday kalibrlanadi

`docs/tarozida-tekshirish.md` 0-bo'lim (osh, manti, sho'rva) → `data/baza-olchovlar.json` → `node tools/baza-hisob.js --olchov` (hisobot) → `--kalibr` → `node tools/baza-hisob.js --yoz` (baza qayta yasaladi, kalibrlangan retsept «taxminiy» belgisisiz).
