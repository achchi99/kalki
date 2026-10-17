# KalkiFit o'zbek taomlar bazasi v2 — reja (1-bosqich)

> **ANIQLIK MAQSADI: ±15%.** Foydalanuvchi o'z likopidagi taomni tarozida tortgan kaloriyadan ko'pi bilan ±15% farq qiladigan natija ko'rishi kerak.
> Hamma qaror shunga moslanadi: baza kattalashmaydi — ~150 ta taom **mukammallashtiriladi**; mahalliy nomlar alohida taom bo'lmaydi, **omillar** (xamir, ichi, o'lcham, yog'…) bilan qamrab olinadi;
> aniqlikka ta'sir qilmaydigan narsaga (hududiy nom, ikkinchi darajali variant) kod va jadval qo'shilmaydi.
>
> **YANGILANISH (2026-10-17):** masalliq qiymatlari endi xotiradan emas — USDA FDC + Скурихин bilan qayta hisoblandi; natija va 15%+ jadval: **`docs/baza-v2-tekshiruv.md`** (quyidagi 5.2 va osh/somsa jadvallari **eskirgan**, xotiradan edi).
>
> Holat: **reja, kodga tegilmagan.** Raqamlar «dastlabki hisob» — masalliq qiymatlari USDA FoodData Central (SR Legacy) bo'yicha xotiradan olingan, FDC id'lari va qiymatlar 2-bosqichda `data/baza-retseptlar.json` ga
> manba bilan kiritilib, tekshiriladi. Pishgandagi vazn (yield) koeffitsientlari taxminiy, uyda tarozida tekshiriladi (`docs/tarozida-tekshirish.md`).

## 0. Qisqa xulosa

- **Hozir:** 268 ta yassi taom, 100 g uchun bitta raqam; 123 tasi «taxminiy» (`e=1`); manba yozuvi faqat 34 tasida (25 USDA, 9 retsept), qolgani umumiy izoh. Somsa uchun 3 ta alohida yozuv, osh uchun 2 ta — variantlar bo'lingan, lekin o'lcham/yog'/go'sht omili yo'q.
- **Reja:** 150 ta taom (123 ta oddiy + **23 ta oila** + 4 ta yangi). 23 ta oila 59 ta eski yozuvni o'z ichiga oladi; 91 ta eski yozuv («tanlangan 150» ga kirmagan) bazada qoladi — qidiruv topadi, lekin e'tibor va tekshiruv 150 taga qaratiladi.
- **Omillar modeli:** oila = 1–3 ta omil (chiplar). Kaloriyani o'zgartiradigan omillar (xamir × ichi, go'sht × yog') uchun 100 g qiymat jadvali oldindan hisoblanadi; o'lcham omili faqat grammni o'zgartiradi.
- **Eski yozuvlar buzilmaydi:** yozuvda kkal/makro/gramm saqlangan (snapshot); eski `fid` lar abadiy «alias» sifatida qoladi (3-bo'lim d).
- **Talab ma'lumoti (D1):** menda D1 ga kirish yo'q — 1.2-bo'limga qarang, sizdan eksport kerak.

## 1. O'rganish natijalari

### 1.1 Bugungi tuzilma (kodni o'qib chiqdim)

| Qism | Qanday ishlaydi | v2 uchun oqibat |
|---|---|---|
| `data/ovqatlar.json` | `{v, note, foods:[{i, n, r, a[], k, p, f, c, t, e, u[[kalit,gramm]…], m}]}`; hamma qiymat 100 g uchun; `u` — porsiya birliklari (`g100` har doim); `e=1` — «taxminiy»; `a` — sinonimlar (qidiruvda indekslanadi); `m` — manba izohi. Yasovchi: `tools/ovqatlar-build.js` (qator-matn + `ovqatlar-alias.json` + `ovqatlar-manba.json` + `ovqatlar-extra.json`). | yangi maydonlar (`fam`, omillar jadvali) qo'shiladi; eski maydonlar o'zgarmaydi |
| Foydalanuvchi yozuvi | `{id, fid, name, meal, unit, qty, g, kcal, p, f, c, est, ts}` — **fid** (taom id) + **unit/qty** + **snapshot** (g, kkal, makro). Hisob kunlik jami faqat snapshot dan olinadi. | baza o'zgarsa ham eski kunlar jami o'zgarmaydi; faqat «tahrirlash» oynasi bazadan qayta hisoblaydi |
| Tahrirlash/porsiya oynasi | `fid` bo'yicha taomni topadi; `unit` taomda bo'lsa `qty × unitGrams` bilan qayta hisoblaydi, bo'lmasa (taom/birlik yo'q) yozuvning o'z qiymatini asos qiladi (×porsiya). | birlik grammi o'zgarsa eski yozuv tahrirda siljiydi → 3-bo'lim d chorasi |
| Qidiruv | oflayn, indeks; nom, ruscha nom va `a` sinonimlar bo'yicha; xatoga chidamli. | hududiy nomlar `a` ga (yoki oila sinonimiga) tushadi — yangi mexanizm shart emas, faqat «oila + oldindan tanlangan omillar» ga yo'naltirish qo'shiladi |
| «Odatdagi ovqatlarim», «Kechagidek» | shablon elementi `{fid, n, unit, qty, g, kcal, p, f, c, est}` — fid bazada bo'lmasa yoki birlik yo'q bo'lsa snapshot asos bo'ladi. | alias bilan ishlaydi; sinov bor |
| Zaxira / bulut / iPhone kodi | holat formati bir xil (`S.exportState`); `v:1`. | yangi maydon (`vr`) ixtiyoriy; eski fayl tiklanadi |
| AI (`functions/api/kalkifit.js`, rasm — `kalkifit-rasm.js`) | **bazadan foydalanmaydi**: faqat topilmagan matn bo'lagini modelga yuboradi, natija `fid=null` + «taxminiy» sifatida qo'shiladi. (Siz `salomat.js` deb yozgansiz — fayl hozir shu nomda.) | v2 da AI natijasini eng yaqin oila+omillarga moslash (ixtiyoriy, 2-bosqich) |
| Taklif navbati | D1 `taklif` (nom, porsiya matni, o'rtacha kkal/makro, **kunlar** = nechta turli kun, holat), `taklif_kun`; admin sahifa `admin/kalkifit-takliflar.html`; `tools/ovqatlar-merge.js` ma'qullanganlarni bazaga qo'shadi. | talab bo'yicha qo'shiladigan taomlar shu yerdan |

### 1.2 Talab ma'lumoti (top-30 taklif) — D1 ga kirish yo'q

Bu muhitda Cloudflare hisobi/D1 ga kirish yo'q (token ham, `wrangler` login ham yo'q). Iltimos, admin sahifadan quyidagini oling:

1. `https://kalki.uz/admin/kalkifit-takliflar` → parol bilan kiring → holat filtri **«hammasi»** (yoki ketma-ket «yangi», «tasdiqlangan», «ma'qullangan», «rad»).
2. **Kunlar** ustuni bo'yicha tartiblangan birinchi 30–50 qator: *nom, porsiya, kunlar, jami, kkal, o, y, u* — matn/skrinshot/JSON (admin API `?holat=hammasi` javobi) yetadi. Shaxsiy ma'lumot yo'q, faqat ovqat nomlari.
3. Bo'lsa — nechta turli kun/qurilmadan kelgani (jami `kunlar` yig'indisi) ham foydali.

Shu kelguncha top-150 dagi **4 ta yangi taom** (shovla, shirguruch, ugra osh, chalop) mening taxminim — D1 ro'yxati bilan almashtiriladi/to'ldiriladi (reja: eng ko'pi ~10 ta almashtirish).

## 2. Omillar modeli

### 2.1 Tamoyil

- **Oila (ota-taom)** = bitta taom nomi + 1–3 omil. Taom tanlanganda porsiya oynasida bitta ekranda chiplar: «Ichi: [go'sht yog'li ✓] [yog'siz] [tovuq] [qovoq] [ko'kat] [kartoshka]», «O'lcham: [kichik] [o'rta ✓] [katta]». Standart tanlov — eng keng tarqalgani.
- Omillar ikki turga bo'linadi:
  - **kaloriyani o'zgartiradigan** (kkal/100 g): xamir, ichi, go'sht miqdori, yog' miqdori, tayyorlash usuli, yog'lilik. Har kombinatsiya uchun 100 g qiymat **retseptdan oldindan hisoblanadi** (kombinatsiyalar soni oila uchun 3–36).
  - **o'lchamni o'zgartiradigan** (gramm): kichik/o'rta/katta, yarim/butun. Qiymat o'zgarmaydi, birlik grammi nisbat bilan o'zgaradi (kichik 0,6× · o'rta 1× · katta 1,5× — tarozida tekshiriladi).
- **Hududiy/mahalliy nomlar** (Qarshi/Buxoro/Samarqand/Toshkent somsasi, «to'y oshi», «choyxona oshi», «Samarqand non»…) — faqat **sinonim**: qidiruvda topiladi va «eng yaqin omil birikmasi» oldindan tanlanadi (masalan «qarshi somsa» → xamir: oddiy, ichi: yog'li go'sht, o'lcham: katta). Alohida yozuv ochilmaydi.
- **Bazada yo'q nom** (yozuvda yoki AI natijasida): nomga eng yaqin oila + omil birikmasi topiladi → «taxminiy» belgisi bilan qo'shiladi. Mos oila bo'lmasa — hozirgidek AI/«o'z taomim».
- Aniqlik: oila ichidagi eng uzoq kombinatsiyalar orasidagi farq 15% dan oshsa (masalan somsa qatlama-yog'li 363 ↔ qovoqli 181 kkal/100 g), omil **majburiy chip** bo'ladi (yashirilmaydi); farq <15% bo'lsa omil ko'rsatilmaydi (keraksiz tanlov yo'q).

### 2.2 Oilalar (23 ta) va omillari

| Oila | Omil 1 | Omil 2 | Omil 3 | Standart | 100 g qiymat omilga bog'liq? |
|---|---|---|---|---|---|
| Osh | go'sht: kam / o'rta / ko'p (1 kg guruchga 500 / 800 / 1200 g) | yog': kam / odatiy / ko'p (150 / 220 / 320 g) | — | o'rta × odatiy | ha (9 kombinatsiya) |
| Somsa | xamir: oddiy / qatlama | ichi: yog'li go'sht / yog'siz go'sht / tovuq / qovoq / ko'kat / kartoshka | o'lcham: kichik / o'rta / katta | oddiy × yog'li × o'rta | xamir×ichi: ha (12); o'lcham: gramm |
| Manti | ichi: go'sht / qovoq / kartoshka | o'lcham: kichik / o'rta / katta | — | go'sht × o'rta | ichi: ha; o'lcham: gramm |
| Chuchvara | ichi: go'sht / tovuq | berilishi: qaynatma / sho'rvada / qovurma | — | go'sht × qaynatma | ha (6) |
| Lag'mon | ko'rinishi: sho'rvali / qovurma | go'sht: mol / qo'y / tovuq | — | sho'rvali × mol | ha (6) |
| Sho'rva | go'sht: qo'y / mol / tovuq | tarkibi: qaynatma / sabzavotli / quyuq go'shtli | — | qo'y × sabzavotli | ha (9) |
| Do'lma | o'rami: karam / uzum bargi | — | — | karam | ha (2) |
| Kabob / shashlik | go'sht: mol / qo'y / tovuq | shish o'lchami: kichik / o'rta / katta | — | qo'y × o'rta | go'sht: ha; o'lcham: gramm |
| Kartoshka | usul: qaynatma / pyure / qovurma / fri | — | — | qaynatma | ha (4) |
| Tuxum | tayyorlash: qaynatilgan / qovurilgan / omlet | — | — | qaynatilgan | ha (3) |
| Non | turi: obi non / tandir non / lochira / kulcha / buxanka / shirmoy | o'lcham: bo'lak / 1/4 / yarim / butun | — | obi non × butun | turi: ha; o'lcham: gramm |
| Sut | yog'liligi: yog'siz / 2,5% / 3,2% / uy suti | — | — | 2,5% | ha (4) |
| Qatiq | yog'liligi: yog'siz / odatiy / uy qatig'i | — | — | odatiy | ha (3) |
| Tvorog | yog'liligi: 5% / 9% | — | — | 5% | ha (2) |
| Yogurt | tabiiy / mevali | — | — | tabiiy | ha (2) |
| Choy | turi: qora / ko'k | qo'shimcha: shakarsiz / 1 qoshiq shakar / 2 qoshiq / sutli | — | qora × shakarsiz | ha |
| Qahva | qo'shimcha: qora / sutli / 3-in-1 / latte / kapuchino | — | — | qora | ha (5) |
| Sharbat | mevasi: olma / apelsin / anor / uzum / pomidor | — | — | olma | ha (5) |
| Shokolad | sutli / qora | — | — | sutli | ha (2) |
| Tort | turi: napoleon / medovik / chizkeyk / oddiy | — | — | napoleon | ha (4) |
| Lavash / shaurma | go'sht: tovuq / mol | o'lcham: kichik / o'rta / katta | — | tovuq × o'rta | go'sht: ha; o'lcham: gramm |
| Burger | oddiy / katta | — | — | oddiy | ha (2) |
| Pitsa | turi: margarita / pepperoni / 4 pishloq | — | — | margarita | ha (3) |

> Ro'zg'or ilovasiga ta'sir yo'q. Hajm: 23 oila × o'rtacha ~7 kombinatsiya ≈ 160 ta hisoblangan qator (yassi 100 g jadval); bazaning umumiy hajmi ~+25 KB.

### 2.3 Texnik shakl (taklif)

- `data/ovqatlar.json` ga ixtiyoriy maydonlar: oila yozuvida `fam: { axes:[{id,n,r,opts:[{id,n,r,d?}]}], grid:{"qat.yogli":{k,p,f,c}}, size:{kichik:.6,orta:1,katta:1.5}, syn:[{q:"qarshi somsa", pick:{xamir:"oddiy", ichi:"yogli", olcham:"katta"}}] }`. Kaloriya o'zgartirmaydigan omil (`olcham`) `grid` kalitiga kirmaydi.
- Yozuvga ixtiyoriy `vr` (variant kaliti: `"oddiy.yogli"`) va `sz` (o'lcham). `fid` = oila id. Eski yozuvlarda `vr` yo'q → standart kombinatsiya (yoki eski id ning alias xaritasi).
- `data/baza-retseptlar.json` → `tools/baza-hisob.js` → `ovqatlar.json` (qo'lda raqam yo'q).
- Qidiruv: oila nomi/sinonimlari oldingidek indekslanadi; natijada oila chiqadi, `syn.pick` oldindan tanlanadi.

## 3. TOP-150 ro'yxati va variantlar

Belgilar: **E** — oddiy taom (mavjud id, qiymati qayta tekshiriladi), **F** — oila (ota-taom + omillar; «eski:» — shu oilaga tushadigan hozirgi id'lar), **N** — yangi.


### 1. Milliy taomlar — 24 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Osh (palov) | F | go'sht × yog' · eski: osh, yengil-osh (tovuqli) | 200 |
| 2 | Somsa | F | xamir × ichi × o'lcham · eski: somsa, somsa-qat, somsa-qovoq | 290 |
| 3 | Manti | F | ichi × o'lcham · eski: manti | 210 |
| 4 | Chuchvara | F | ichi × berilishi · eski: chuchvara, chuchvara-sho | 200 |
| 5 | Lag'mon | F | ko'rinishi × go'sht · eski: lagmon, lagmon-qov | 120 |
| 6 | Mastava | E |  | 80 |
| 7 | Sho'rva | F | go'sht × tarkibi · eski: shurva, tovuq-shurva | 75 |
| 8 | Moshxo'rda | E |  | 85 |
| 9 | Moshkichiri | E |  | 125 |
| 10 | Norin | E | kaloriya qayta hisoblanadi | 190 |
| 11 | Dimlama | E |  | 100 |
| 12 | Qozon kabob | E |  | 250 |
| 13 | Qovurdoq | E | kaloriya qayta hisoblanadi | 250 |
| 14 | Do'lma | F | o'rami: karam / uzum bargi · eski: dolma, dolma-uzum | 150 |
| 15 | Halim | E |  | 210 |
| 16 | Xonim | E |  | 200 |
| 17 | Sumalak | E |  | 130 |
| 18 | Jiz | E |  | 270 |
| 19 | Beshbarmoq | E |  | 180 |
| 20 | Jarkop | E | kaloriya qayta hisoblanadi | 230 |
| 21 | Shovla (Xorazm) | N | guruch + go'sht, yarim suyuq | — |
| 22 | Shirguruch | N | sutli guruch bo'tqasi | — |
| 23 | Ugra osh | N | sho'rvali lag'mon turi | — |
| 24 | Chalop | N | qatiqli sovuq sho'rva | — |

### 2. Choyxona va oshxona taomlari — 24 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Kabob / shashlik | F | go'sht (mol, qo'y, tovuq) × shish o'lchami · eski: shashlik, shashlik-tovuq | 240 |
| 2 | Jigar kabob | E |  | 190 |
| 3 | Lyulya kabob | E |  | 250 |
| 4 | Tandir go'sht | E |  | 260 |
| 5 | Qazi | E |  | 360 |
| 6 | Kartoshka | F | usul: qaynatma / pyure / qovurma / fri · eski: kartoshka, kartoshka-qov, kartoshka-pyure, kartoshka-fri | 160 |
| 7 | Tuxum | F | tayyorlash: qaynatilgan / qovurilgan / omlet · eski: tuxum, tuxum-qov, omlet | 190 |
| 8 | Achichuk | E |  | 25 |
| 9 | Sabzavot salati | E |  | 50 |
| 10 | Olivye | E |  | 190 |
| 11 | Vinegret | E |  | 90 |
| 12 | Koreys sabzi | E |  | 115 |
| 13 | Borsch | E |  | 55 |
| 14 | Sabzavot ragu | E |  | 70 |
| 15 | Qaynatma baliq | E |  | 40 |
| 16 | Kotlet | E |  | 230 |
| 17 | Tovuq qovurma | E |  | 260 |
| 18 | Guruch (qaynatilgan) | E |  | 130 |
| 19 | Grechka | E |  | 92 |
| 20 | Makaron | E |  | 150 |
| 21 | Suli bo'tqa | E |  | 70 |
| 22 | Manka | E |  | 100 |
| 23 | Mosh (qaynatilgan) | E |  | 105 |
| 24 | No'xat (qaynatilgan) | E |  | 125 |

### 3. Non va xamir — 12 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Non | F | turi: obi non, tandir non, lochira, kulcha, buxanka, shirmoy × o'lcham · eski: non | 270 |
| 2 | Patir | E |  | 300 |
| 3 | Qatlama | E |  | 380 |
| 4 | Oq non (buxanka, baton) | E |  | 265 |
| 5 | Qora non | E |  | 210 |
| 6 | Lavash non | E |  | 275 |
| 7 | Baget | E |  | 270 |
| 8 | Bulochka | E |  | 300 |
| 9 | Pirojki | E |  | 290 |
| 10 | Suxari | E |  | 390 |
| 11 | Tost | E |  | 265 |
| 12 | Blin | E |  | 230 |

### 4. Sut va qatiq — 14 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Sut | F | yog'liligi: yog'siz / 2,5% / 3,2% / uy suti · eski: sut, sut-yogsiz | 60 |
| 2 | Qatiq | F | yog'liligi · eski: qatiq, qatiq-yogsiz | 60 |
| 3 | Ayron | E |  | 30 |
| 4 | Suzma | E |  | 150 |
| 5 | Qurt | E |  | 320 |
| 6 | Kefir | E |  | 53 |
| 7 | Qaymoq | E |  | 330 |
| 8 | Smetana | E |  | 205 |
| 9 | Pishloq | E |  | 350 |
| 10 | Tvorog | F | yog'liligi 5% / 9% · eski: tvorog5, tvorog9 | 121 |
| 11 | Sariyog' | E |  | 717 |
| 12 | Yogurt | F | tabiiy / mevali · eski: yogurt-tabiiy, yogurt-meva | 60 |
| 13 | Muzqaymoq | E |  | 200 |
| 14 | Krem-pishloq | E |  | 250 |

### 5. Go'sht, tuxum, baliq — 14 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Mol go'shti | E |  | 215 |
| 2 | Mol qiymasi | E |  | 250 |
| 3 | Qo'y go'shti | E |  | 290 |
| 4 | Tovuq ko'kragi | E |  | 150 |
| 5 | Tovuq soni | E |  | 210 |
| 6 | Tovuq qanoti | E |  | 290 |
| 7 | Ot go'shti | E |  | 190 |
| 8 | Jigar | E |  | 175 |
| 9 | Kolbasa | E |  | 260 |
| 10 | Sosiska | E |  | 270 |
| 11 | Losos | E |  | 205 |
| 12 | Baliq (qovurma) | E |  | 200 |
| 13 | Tushonka | E |  | 220 |
| 14 | Tuna | E |  | 115 |

### 6. Sabzavot, meva, quruq meva — 28 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Pomidor | E |  | 18 |
| 2 | Tuzlangan bodring | E |  | 12 |
| 3 | O'rik | E |  | 48 |
| 4 | Bodring | E |  | 15 |
| 5 | Sabzi | E |  | 41 |
| 6 | Piyoz | E |  | 40 |
| 7 | Karam | E |  | 25 |
| 8 | Qovoq | E |  | 26 |
| 9 | Baqlajon | E |  | 25 |
| 10 | Bolgar qalampiri | E |  | 27 |
| 11 | Lavlagi | E |  | 43 |
| 12 | Ko'kat | E |  | 25 |
| 13 | Olma | E |  | 52 |
| 14 | Nok | E |  | 57 |
| 15 | Banan | E |  | 89 |
| 16 | Apelsin | E |  | 47 |
| 17 | Mandarin | E |  | 53 |
| 18 | Uzum | E |  | 69 |
| 19 | Qovun | E |  | 34 |
| 20 | Tarvuz | E |  | 30 |
| 21 | Shaftoli | E |  | 39 |
| 22 | Anor | E |  | 83 |
| 23 | Xurmo | E |  | 70 |
| 24 | Mayiz | E |  | 299 |
| 25 | Quruq o'rik | E |  | 241 |
| 26 | Yong'oq | E |  | 654 |
| 27 | Bodom | E |  | 579 |
| 28 | Asal | E |  | 304 |

### 7. Ichimliklar — 12 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Choy | F | turi (qora/ko'k) × qo'shimcha (shakarsiz / 1–2 qoshiq shakar / sutli) · eski: choy, choy-shakar, choy-sut, yashil-choy | 1 |
| 2 | Qahva | F | qo'shimcha · eski: kofe, kofe-3in1, latte, kapuchino | 2 |
| 3 | Kola | E |  | 42 |
| 4 | Limonad | E |  | 40 |
| 5 | Sharbat | F | mevasi: olma, apelsin, anor, uzum, pomidor · eski: sharbat-* | 46 |
| 6 | Kompot | E |  | 55 |
| 7 | Kakao | E |  | 80 |
| 8 | Suv | E |  | 0 |
| 9 | Kvas | E |  | 27 |
| 10 | Smuzi | E |  | 60 |
| 11 | Energetik | E |  | 45 |
| 12 | Sovuq choy | E |  | 25 |

### 8. Shirinliklar — 12 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Bo'g'irsoq | E |  | 380 |
| 2 | Murabbo | E |  | 260 |
| 3 | Pechenye | E |  | 450 |
| 4 | Shokolad | F | sutli / qora · eski: shokolad-sut, shokolad-qora | 535 |
| 5 | Konfet | E |  | 450 |
| 6 | Xalva | E |  | 520 |
| 7 | Navvot | E |  | 390 |
| 8 | Tort | F | turi: napoleon, medovik, tort, chizkeyk · eski: tort, napoleon, medovik, chizkeyk | 350 |
| 9 | Chakchak | E |  | 450 |
| 10 | Paxlava | E |  | 450 |
| 11 | Shakar | E |  | 387 |
| 12 | Quyultirilgan sut | E |  | 320 |

### 9. Fast-food — 10 ta

| # | Taom | Tur | Omillar / izoh | Hozirgi kkal/100 g |
|---|---|---|---|---|
| 1 | Lavash / shaurma | F | go'sht (tovuq, mol) × o'lcham · eski: lavash-tovuq, lavash-mol, lavash-roll | 200 |
| 2 | Doner | E |  | 215 |
| 3 | Hot-dog | E |  | 250 |
| 4 | Burger | F | oddiy / katta · eski: burger, burger-katta | 265 |
| 5 | Pitsa | F | turi · eski: pitsa, pitsa-pepperoni, pitsa-4 | 250 |
| 6 | Kartoshka fri | E | kartoshka oilasiga | 310 |
| 7 | Naggets | E |  | 250 |
| 8 | Chebureki | E |  | 300 |
| 9 | Belyashi | E |  | 290 |
| 10 | Sendvich | E |  | 220 |

**Guruhlar bo'yicha son:** Milliy taomlar 24 · Choyxona va oshxona taomlari 24 · Non va xamir 12 · Sut va qatiq 14 · Go'sht, tuxum, baliq 14 · Sabzavot, meva, quruq meva 28 · Ichimliklar 12 · Shirinliklar 12 · Fast-food 10 = **150**  (E 123 · F 23 · N 4).

**Taklif jadvalidan qo'shiladiganlar:** D1 ro'yxati kelgach (1.2) N qatorlari yangilanadi. Hozircha N — mening taxminim (Xorazm shovla, sutli guruch bo'tqasi, ugra osh, chalop).

### 3.1 Variantlar (ota-taom + variantlar)

| Ota-taom | Variantlar (kombinatsiyalar) | Eski id → yangi |
|---|---|---|
| **Osh** | uy oshi (o'rta × odatiy) · to'y oshi (ko'p yog' + o'rta go'sht) · go'shti ko'p (ko'p × odatiy) · choyxona oshi (o'rta × ko'p) · yengil (tovuqli, yog' kam) | `osh` → osh(o'rta,odatiy); `yengil-osh` → osh(go'sht: kam/tovuq, yog': kam) |
| **Non** | obi non · tandir non · lochira · kulcha · buxanka · shirmoy (+ patir, qatlama alohida E) | `non` → non(obi); `non-oq` — buxanka/baton (E); `patir`, `qatlama` E sifatida qoladi |
| **Somsa** | tandir (yog'li go'shtli) · yog'siz go'shtli · tovuqli · qovoqli · ko'katli · kartoshkali · qatlama · sanoat (pishirilgan, kichik) | `somsa` → (oddiy, yog'li); `somsa-qat` → (qatlama, yog'li); `somsa-qovoq` → (oddiy, qovoq) |
| **Sho'rva** | go'shtli (quyuq) · qaynatma · kartoshkali/sabzavotli · tovuq | `shurva` → (qo'y, sabzavotli); `tovuq-shurva` → (tovuq, qaynatma) |
| **Manti** | go'shtli · qovoqli · kartoshkali | `manti` → (go'sht) |
| **Chuchvara** | qaynatma · sho'rvada · qovurma | `chuchvara` → (go'sht, qaynatma); `chuchvara-sho` → (go'sht, sho'rvada) |
| **Lag'mon** | sho'rvali · qovurma (mol/qo'y/tovuq) | `lagmon`, `lagmon-qov` |
| **Kabob** | mol · qo'y · tovuq (jigar, lyulya, tandir go'sht E) | `shashlik`, `shashlik-tovuq` |

## 4. PORSIYA BIRLIKLARI

Qoida: har taomda **2–4 tabiiy birlik**, har birining grammi manbasi bilan. Birlik kalitlari (`kosa`, `likop`, `piyola`, `stakan`, `dona`, `bolak`, `qoshiq`, `choyq`, `hovuch`, `porsiya`) saqlanadi — yozuvlar buzilmasligi uchun; «likop» ko'rsatiladigan nomi «lagan (bir kishilik)» ga o'zgartiriladi (kalit o'zgarmaydi).

**Universal o'lchovlar (tarozida o'zim tekshiraman, ko'pi bilan 8 ta):** kosa · piyola · bir kishilik lagan · obi non · o'rtacha somsa (kichik/katta undan nisbat bilan) · osh qoshiq · choy qoshiq · stakan. Qolgani retsept va manbadan hisoblanadi.

| Birlik | Hozirgi bazada | Taklif / manba | Holat |
|---|---|---|---|
| stakan (sut, qatiq, sharbat) | 250 g | 1 stakan = 250 ml; sut 244–258 g (USDA «1 cup» sut = 244 g) — hajm × zichlik | manbali, tarozi shart emas |
| osh qoshiq (suyuqlik/yog') | yog' 14 g, sariyog' 12 g | USDA «1 tbsp»: yog' 13,6 g, sariyog' 14,2 g | manbali |
| choy qoshiq | shakar 5 g | USDA «1 tsp»: shakar 4,2 g, yog' 4,5 g | manbali (yaxlitlash) |
| piyola (choy) | 200 g | 200 ml — uy piyolasi 150–250 ml | **tarozi: o'zim** |
| kosa (sho'rva/mastava/lag'mon) | 350–400 g | haqiqiy uy kosasi 350–550 g | **tarozi: o'zim** (eng muhim) |
| bir kishilik lagan (osh) | 350 g («likop»), «porsiya» 300 g | choyxonada 400–500 g bo'lishi mumkin | **tarozi: o'zim** |
| obi non (butun) | 300 g | 300–350 g | **tarozi: o'zim** |
| o'rtacha somsa (tandir) | 120 g | 100–150 g | **tarozi: o'zim** |
| dona (olma/banan/tuxum/pomidor…) | olma 180 · banan 120 · tuxum 50 | USDA «medium»: olma 182, banan 118, tuxum (katta) 50, pomidor 123 | manbali |
| dona (apelsin) | 150 | USDA «medium» ~131 g | farq ~13% — tekshiriladi |
| hovuch (yong'oq, mayiz, uzum…) | 30 g (uzum/qulupnay 100 g) | «1 oz» = 28 g yong'oq/quruq meva; mayda meva hovuchi ~ 80–100 g | taxminiy, ko'rsatiladi |
| bo'lak (non, go'sht, tort) | non 50 g, tort 100 g… | «1 bo'lak» — o'lchovga bog'liq → omil «o'lcham» bilan | tarozi: o'zim (non) |

Boshqa taomlar (manti dona 60, chuchvara dona 12, do'lma dona 50, kabob shish 80, lag'mon likop 450 …) — hozirgi qiymat **manbasiz**; 2-bosqichda retsept (porsiyadagi xom vazn va yield) yoki tarozi bilan almashtiriladi.

> USDA «household measure» qiymatlari xotiradan; 2-bosqichda FDC `portion` yozuvlari bilan tekshiriladi.

## 5. MANBA USULI

### 5.1 Retsept usuli

1. **Faqat 2 xil manbali raqam:** (a) oddiy mahsulot — USDA FDC id (SR Legacy) yoki Скурихин jadvali (id/bet bilan); (b) murakkab taom — **retsept**: har masalliqning xom vazni (g) va pishgandagi jami vazn (yield, g) → `data/baza-retseptlar.json`.
2. `tools/baza-hisob.js`: 100 g qiymat = Σ(masalliq xom vazn × masalliq 100 g qiymati) ÷ yield × 100. Qo'lda raqam yozilmaydi.
3. **Yield** (pishgandagi vazn) — eng katta xato manbai: guruch ×2,6 (suv shimadi), go'sht ×0,70, sabzavot ×0,80, piyoz ×0,75, yog' ×1,0, xamir pishirilganda −10% (somsa/non −15–22%). Koeffitsientlar 2 ta mustaqil manbadan va **tarozida o'zim tekshirib** tasdiqlanadi.
4. **Tekshiruv:** natija (a) Atwater qoidasi (4·O+9·Y+4·U ≈ kkal ±10%), (b) mustaqil proksi (ru-jadvallar/calorizator) bilan solishtiriladi; ±15% dan oshsa — qaror sababi bilan yoziladi.
5. Har taomda `m` (manba) maydoni: masalliq manbalari, yield manbai, sana.

Mavjud manba holati: 34 taomda yozuv bor (25 USDA id, 9 retsept); 234 taomda faqat umumiy izoh.

### 5.2 Hozirgi qiymatdan ±15% dan ko'p farq qiladiganlar (dastlabki hisob)

Retsept (1-hisob, taxminiy yield bilan) hozirgi qiymatdan **>15%** farq qilgan taomlar:

| Taom | Eski (kkal/100 g) | Yangi (dastlabki) | Farq | Sabab |
|---|---|---|---|---|
| Norin | 190 | ≈ 288 | **+52%** | norin = xamir + ko'p go'sht (qazi/ot go'shti); eski qiymat go'shtni juda kam olgan ko'rinadi. Ot go'shti/qazi USDA'da yo'q — Скурихин/ru-jadval bilan tasdiqlanadi |
| Sho'rva (qo'y go'shtli, quyuq) | 75 | ≈ 53 | **−29%** | eski izoh o'zi «ru-jadvaldan past» deydi, lekin retseptda go'sht ulushi 14–16% da ham 55–70 oralig'i chiqadi; sho'rvada yog' qatlami va kartoshka miqdori aniqlanadi (omil «tarkibi» shu uchun) |
| Qovurdoq | 250 | ≈ 189 | **−24%** | eski qiymat go'sht+yog' ulushini juda yuqori olgan; retseptda kartoshka ulushi ~46% |
| Jarkop | 230 | ≈ 191 | **−17%** | kartoshka ko'p, yog' 5–6% |
| Dimlama | 100 | ≈ 116 | **+16%** | go'sht ulushi (24%) eskisidan baland |

**Chegarada (10–15%)** — 2-bosqichda aniqlanadi: moshxo'rda 85 → 73 (−14%) · qozon kabob 250 → 220 (−12%) · chuchvara 200 → 226 (+13%) · manti 210 → 234 (+11%).

**Tashqarida (<10%):** osh 200 → 183 (−9%, standart o'rta × odatiy; omillar bilan 163–206 oralig'i) · somsa 290 → 311 (+7%) · qatlama somsa 330 → 363 (+10%) · patir 300 → 325 (+8%) · qatlama non 380 → 413 (+9%) · mastava 80 → 77 · lag'mon 120 → 114 · kartoshka qovurma 160 → 160 · obi non 270 → 281 · do'lma 150 → 137 (−9%).

> ⚠ Bu jadval **hisoblangan taxmin**, haqiqat emas: masalliq qiymatlari xotiradan, yield taxminiy. Men uni «qaysi taomlarga e'tibor berish kerak» deb ko'raman, yakuniy raqam sifatida emas. Sho'rva va norin ayniqsa o'lchovga muhtoj.

**Osh omillari bo'yicha dastlabki qiymat (kkal/100 g, pishgan):**

| Go'sht \ Yog' | kam (150 g) | odatiy (220 g) | ko'p (320 g) |
|---|---|---|---|
| kam (500 g) | 163 | 175 | 192 |
| o'rta (800 g) | 171 | **183** | 198 |
| ko'p (1200 g) | 181 | 192 | 206 |

(1 kg guruchga; oq guruch xom, sabzi 1 kg, piyoz 250 g; go'sht — qo'y+mol yarim-yarim.) Farq eng past ↔ eng yuqori = 26% — shuning uchun osh omillari **majburiy chip**.

**Somsa (kkal/100 g):**

| Xamir \ Ichi | yog'li go'sht | yog'siz go'sht | tovuq | qovoq | ko'kat | kartoshka |
|---|---|---|---|---|---|---|
| oddiy | **311** | 240 | 229 | 181 | 178 | 189 |
| qatlama | 363 | 299 | 302 | 252 | 249 | 257 |

(Farq 181 ↔ 363 — 2 baravar: shuning uchun «ichi» va «xamir» majburiy chip. Eski `somsa-qovoq` 230 shu jadvalning o'rtasida — qatlama/oddiy xamirga qarab.)

## 6. MIGRATSIYA (eski yozuvlar va «Odatdagi ovqatlarim» buzilmasligi)

Prinsiplar: **hech bir `fid` o'chirilmaydi**; **hech bir saqlangan kkal o'zgartirilmaydi**; eski zaxira fayllari tiklanadi.

1. **Alias xaritasi.** Oilaga qo'shilgan har eski id (`somsa-qat`, `somsa-qovoq`, `yengil-osh`, `chuchvara-sho`, …) `ovqatlar.json` da `alias:{fam, vr}` bilan qoladi (qidiruvda ko'rinmaydi, lekin `foodById` topadi). Eski yozuv tahrirlanganda oila oynasi **shu omillar oldindan tanlangan** holda ochiladi.
2. **Snapshot o'zgarmaydi.** Kunlik jami, haftalik xulosa, taqvim — yozuvdagi `kcal/p/f/c/g` dan hisoblanadi; baza o'zgarishi eski kunlarga tegmaydi.
3. **Birlik grammi o'zgarsa** (masalan lagan 350 → 420 g): tahrirlash oynasi yozuvning **saqlangan grammini** asos qiladi — `qty = g / yangi birlik grammi` (kkal o'zgarmaydi, qty yangi gramm bo'yicha ko'rsatiladi), foydalanuvchi o'zi o'zgartirganda qayta hisoblanadi. Sinov: eski yozuv ochilib «Saqlash» bosilsa kkal o'zgarmaydi.
4. **Odatdagi ovqatlarim va Kechagidek.** Shablon elementi `fid` + `unit/qty` + snapshot. `fid` alias orqali topiladi; topilmasa (hech qachon bo'lmasligi kerak) hozirgi zaxira mexanizmi — snapshot asosida «taxminiy». Qo'shishda oila uchun `vr` shablondan olinadi (bo'lmasa alias/standart).
5. **Sevimlilar / oxirgilar** (`favs`, `recents`) id bo'yicha — alias bilan saqlanadi; qidiruvdagi «sevimli/ko'p yeyilgan» yuqorilashi oilaga o'tkaziladi (alias → oila).
6. **Zaxira, bulut, iPhone kodi:** holat formati `v:1` o'zgarmaydi; `vr`/`sz` ixtiyoriy; eski faylda yo'q — standart. Yangi faylni eski ilova o'qiy olishi (orqaga moslik) — `vr` e'tiborsiz qoladi, kkal snapshotdan.
7. **Yangi foydalanuvchi uchun** AI/matn: «2 somsa» → oila + standart omil, «taxminiy» belgisi bilan.
8. **Sinovlar:** (a) eski holat (alias id lar bilan) tahrir/saqlash kkal o'zgartirmaydi; (b) shablon eski `fid` bilan qo'shiladi; (c) eski zaxira tiklanadi; (d) birlik grammi o'zgargan holat; (e) har 268 eski id `foodById` da topiladi; (f) kunlik jami eski kunlarda bir xil.

## 7. Savollar (tasdiqlashdan oldin)

1. **D1 ma'lumoti** (1.2): admin sahifadan top-30–50 ni yuboring (nom, kunlar, jami, kkal). Yo'q bo'lsa 4 ta «N» taom taxminimcha qoladi — mayliymi?
2. **`tarozida-tekshirish.md`:** ko'rsatmangizda «ko'pi bilan 8 ta universal o'lchov» va «20 ta eng muhim birlik» ikkalasi bor. Men 20 qatorli jadval qildim: **1–8 universal o'lchovlar** (kosa, piyola, lagan, obi non, o'rtacha somsa, osh qoshiq, choy qoshiq, stakan) + **9–20 taom-maxsus tekshiruvlar** (eng ko'p xato beradiganlar). Qisqartirib faqat 8 qoldiray?
3. **Aniqlik:** ±15% — «tarozida tortgan haqiqiy kaloriyaga nisbatan» deb tushundim (manba qiymatiga emas). Shundaymi? Tarozida tortilgan 5–10 ta uy taomi bilan v2 ni sinab ko'rishga rozimisiz (men sinov jadvali tayyorlayman)?
4. **Spirtli ichimliklar** (pivo, vino) top-150 da yo'q; bazada qoladi, lekin «tanlangan» qatoriga kirmaydi — mayli?
5. **O'lcham nomlari:** kichik / o'rta / katta (somsa 0,6× / 1× / 1,5×). «1 dona» o'rniga foydalanuvchi o'z somsasini gramm bilan kiritishi mumkin — shu yetadimi?
6. **Osh «turi»** (to'y/uy/choyxona) alohida chip emas, faqat sinonim → omil birikmasi (to'y oshi → yog' ko'p) bo'lsin. Mayli?
7. **Eski id lar:** alias sifatida abadiy qoladi (fayl hajmi +~6 KB). Qidiruvda ularni yashiramiz (oila chiqadi). Mayli?
8. **Sho'rva, norin, qovurdoq** — kaloriyasi eng shubhali; avval tarozida/retseptda tasdiqlansinmi, yoki dastlabki hisob bilan chiqarib, «taxminiy» qoldiramizmi?
9. **2-bosqich A)** gacha olganim: «RETSEPT USULI» (baza-retseptlar.json, tools/baza-hisob.js). Xabaringiz shu yerda uzilgan ko'rinadi (B, C… bo'limlari yo'q) — davomi bormi?

## 8. 2-bosqich rejasi (tasdiqdan keyin)

A) retsept usuli: `data/baza-retseptlar.json` + `tools/baza-hisob.js` + manbalar (USDA id / Скурихин) → `ovqatlar.json` · B) oilalar va omillar (core: oila/variant hisobi, alias; app: chiplar porsiya oynasida; qidiruv sinonimi → omil) · C) porsiya birliklari (tarozi natijalari bilan) · D) migratsiya sinovlari · E) yangiliklar (`data/yangiliklar-kalkifit.json`), UZ/RU/ЎЗ, 360 px/katta shrift, `test:tez`.

## 9. Tasdiqlangan qarorlar (foydalanuvchi javoblari, 2026-10-17)

1. D1 ro'yxati keyinroq; 4 ta yangi taom (shovla, shirguruch, ugra osh, chalop) **«taxminiy»** belgisi bilan qoladi.
2. `tarozida-tekshirish.md`: 1–8 universal o'lchovlar **majburiy**, 9–20 «ixtiyoriy, vaqt bo'lsa».
3. ±15% — tarozida tortilgan haqiqatga nisbatan. 5 ta uy taomi bilan sinaymiz (oddiy ro'yxat: taom + nima tortiladi).
4. Pivo/vino bazada qoladi, top-150 ga kirmaydi. 5. O'lcham 0,6 / 1 / 1,5; gramm bilan kiritish qoladi. 6. «To'y oshi / choyxona oshi» — faqat sinonim + oldindan tanlangan omil. 7. Eski id'lar abadiy alias.
8. Tarozini kutmaymiz, lekin **xotiradan raqam qabul qilinmaydi**: masalliq qiymatlari USDA FDC (fdc_id + sana) → `data/manba/`; `tools/baza-hisob.js` faqat shulardan hisoblaydi. Norin, sho'rva, qovurdoq — ikki mustaqil manba (USDA asosidagi retsept + Скурихин) o'rtachasi, «taxminiy». Farqi 30% dan oshganlar o'zgartirilmaydi (norin +46%: qaror sizda).
9. 2-bosqich rejasi (A–E) foydalanuvchi xabarida: retsept usuli, ma'lumot tuzilmasi (`b` birliklar, oila/omillar, `m`, `r`, `t`, `x`, `top`), interfeys (tabiiy birlik birinchi, omil chiplari, «Somsa · 6 xil», ⓘ Manba), AI parse (lokal avval), testlar. **Jadval tasdiqlangandan keyin boshlanadi.**
