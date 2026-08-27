# Huquqiy konstantalar auditi — FAZA 0 (diagnostika)

Ushbu hisobot FAZA 0 doirasida tayyorlandi: **bironta kod fayli yoki
`data/legal-constants.json` o'zgartirilmagan**, faqat mavjud holat
tekshirilgan. Maqsad: 6 ta huquqiy kalkulyator (FAZA 3'da qurilgan)
qaysi qonun modeliga asoslanganini aniqlash, va agar model eskirgan yoki
to'liqsiz bo'lsa — buni raqamlarni to'ldirishdan OLDIN qayd etish.

Manba: har bir kalkulyatorning `compute()` funksiyasi to'g'ridan-to'g'ri
o'qildi (fayl:qator ko'rsatilgan), `data/legal-constants.json` to'liq
o'qildi.

---

## 0.A — Kasallik va dekret kalkulyatorlari qaysi modelga qurilgan?

### `kasallik-varaqasi-kalkulyator.html`

| Band | Holat | Izoh |
|---|---|---|
| Staj koeffitsienti (60%/80%, qat'iy foiz emas) | **QISMAN** | `resolvePercent()` (`kasallik-varaqasi-kalkulyator.html:258-270`) generic N-bosqichli jadval sifatida yozilgan (`kasallik_foiz_jadvali.qiymat` — `[{min_yil, foiz}, ...]` massiv kutiladi). Tuzilma to'g'ri, lekin hozircha `qiymat:null` bo'lgani uchun bosqichlar hali mavjud emas. |
| Minimal 6 oylik sug'urta staji sharti | **YO'Q** | `compute()`da (`:281-309`) bunday tekshiruv umuman yo'q. `staj` maydoni yillarda (`id="staj"`, "Umumiy ish staji (yil)"), oylarda emas — minimal-oy shartini ifodalash uchun ham mos emas. |
| 5 kun ish beruvchi / 6-kundan jamg'arma ajratmasi | **YO'Q** | `days` bitta yaxlit son sifatida ishlatiladi: `payout=avgDaily*(pct/100)*days`. Kunlarni ikkiga bo'lish (ish beruvchi/jamg'arma) kodda yo'q. |
| Yillik 182 kun chegarasi | **YO'Q** | `days` inputiga faqat `min=0` bor, yuqori chegara yo'q. |
| 77 kundan oshganda −10% band | **YO'Q** | `resolvePercent()` faqat `stajYears`ga bog'liq, `days` foizga ta'sir qilmaydi. |
| Imtiyozli toifa uchun +20% band | **YO'Q** | Nogironlik guruhi, farzandlar soni kabi maydonlar umuman yo'q. |
| O'rtacha ish haqi chegarasi 10×MHTEKM | **NOTO'G'RI MODELLASHTIRILGAN** | Chegara `kasallik_bhm_chegara` nomi bilan **BHM birligida** ("Kasallik varaqasi to'lovining yuqori chegarasi (BHM birligida)") saqlanadi va `payout>cap` bo'lsa flat qiymat sifatida qo'llaniladi (`:305`). Loyihada `MHTEKM` konstantasi umuman yo'q. Bu aynan foydalanuvchi audit so'rovida ko'rsatgan nom xatosi bilan mos keladi (FAZA 1.1: `kasallik_bhm_chegara` → `kasallik_mhtekm_chegara`). |

**Qayta qurish hajmi:** staj-jadval tuzilmasi va gate-logika (`isGated`/`pending`) allaqachon to'g'ri yozilgan — bu qism qayta qurishga muhtoj emas. Yo'q bo'lgan 4 band (min. staj, 5+jamg'arma bo'linishi, yillik limit, −10%/+20% tuzatishlar) uchun taxminan 20-30 qator yangi hisoblash mantig'i kerak bo'ladi, ortiqcha 2-3 ta yangi input maydoni (masalan imtiyozli toifa checkbox'lari) bilan birga.

### `dekret-puli-kalkulyator.html`

| Band | Holat | Izoh |
|---|---|---|
| Staj jadvali (75%/85%/100%, bitta foiz emas) | **YO'Q — FLAT FOIZ** | `compute()`da (`dekret-puli-kalkulyator.html:274-292`) `pct=fc.qiymat` to'g'ridan-to'g'ri bitta skalyar sifatida ishlatiladi, jadval-lookup funksiyasi yo'q. `stajYears` UI'dan olinadi, lekin hisobga **umuman kiritilmaydi** — maydonning o'z izohi ham buni tan oladi: "Hozircha faqat ma'lumot uchun — hisob-kitobga ta'sir qilmaydi." |
| Minimal 10 oylik sug'urta staji sharti | **YO'Q** | Hech qanday minimal-staj tekshiruvi yo'q. |
| 126 kun (asosiy) / 140 kun (qiyin/2+ bola) | **QISMAN — TUZILMA TAYYOR, QIYMAT YO'Q** | `birthType` segment-tugmasi ("Oddiy"/"Murakkab yoki ko'p qorinli") allaqachon mavjud va `dekret_kunlar.qiymat={oddiy:...,murakkab:...}` obyekt shaklini kutadi (`:288`). Demak dizayn to'g'ri yo'nalishda, lekin `qiymat:null` bo'lgani uchun hali ishlamaydi. |
| Nafaqa JShDS/ijtimoiy soliqqa tortilmasligi | **YO'Q** | FAQ (8 ta savol-javob) va sahifa matnida soliq mavzusi umuman ko'tarilmagan. |

**Qayta qurish hajmi:** kunlar tuzilmasi (`oddiy`/`murakkab`) va gate-logika tayyor. Kerak bo'ladigan: (1) `pct=fc.qiymat` o'rniga staj-jadval lookup funksiyasi (kasallik sahifasidagi `resolvePercent()` naqshini takrorlash, ~15 qator), (2) minimal-staj gate, (3) soliqdan ozod ekanini natija blokida bitta qatorli izoh sifatida qo'shish (kod emas, faqat matn).

---

## 0.B — Qolgan 4 kalkulyatorning formulasi to'g'rimi?

### `tatil-puli-kalkulyator.html`

Formula (`:245-272`):
```js
dailyRate = wage / koeff;   // koeff = LEGAL.tatil_kunlik_koeff.qiymat (JSON'dan o'qiladi, hardcode emas)
total = dailyRate * days;
```
- Koeffitsient **hardcode qilinmagan** — `data/legal-constants.json`dan dinamik o'qiladi. Bu to'g'ri arxitektura: `25,3` FAZA 2'da kiritilganda kod o'zgarishi shart emas.
- **Ammo**: sahifa faqat BITTA natija chiqaradi. Foydalanuvchi so'ragan "kalendar kun bo'yicha" va "ish kuni bo'yicha" ikkala natija — yo'q. Bitta `total` qiymati bor, ikkinchi variant modellashtirilmagan.
- `tatil_minimal_kunlar` konstantasi JSON faylida bor, lekin bu sahifaning JS kodida **hech qayerda o'qilmaydi** (faqat izoh sifatida rejalashtirilgan, lekin ulanmagan).
- Gating to'g'ri ishlaydi: `isGated()` → `qiymat==null` bo'lsa natija ko'rsatilmaydi.

**Xulosa:** formula tuzilishi to'g'ri va moslashuvchan, lekin "ikkilik" (kalendar/ish kuni) FAZA 2'da alohida qo'shilishi kerak — bu yangi UI elementi (ikkinchi natija qatori) talab qiladi.

### `ishdan-boshatish-kompensatsiyasi-kalkulyator.html`

Formula (`:250-405`):
```js
amount = wage * LC.boshatish_oylik_soni.qiymat;
if (LC.boshatish_bhm_minimal.qiymat != null) amount = Math.max(amount, bhmFloor);
```
- **Staj bo'yicha foiz jadvali (50/75/100/150/200%) sifatida modellashtirilmagan** — bitta flat "oylik soni" ko'paytiruvchisi sifatida qurilgan. Bu foydalanuvchi ko'rsatgan to'g'ri modeldan (MK 173-modda, 5 bosqichli jadval) tubdan farq qiladi.
- `staj` maydoni yig'iladi, lekin hisobda **umuman ishlatilmaydi** (o'lik input) — demak jadval bo'lganda ham staj asosida farqlash hozircha imkonsiz.
- Maydon nomi noaniq: `"Ish staji (yil)"` — "shu ish beruvchidagi" yoki "umumiy" ekani ko'rsatilmagan.
- **`boshatish_bhm_minimal` konstantasi FAOL ISHLATILADI** (`Math.max(amount,bhmFloor)`) — lekin FAZA 1.3 aynan shu konstantani "bunday huquqiy norma mavjud emas" deb o'chirishni buyuradi. Bu FAZA 1'da nafaqat JSON'dan yozuvni o'chirish, balki **shu koddagi `Math.max` qatorini ham olib tashlashni** talab qiladi — aks holda kod mavjud bo'lmagan yozuvga murojaat qilib xato beradi.

**Qayta qurish hajmi:** eng katta qayta qurish shu sahifada kerak — flat ko'paytiruvchi o'rniga 5-bosqichli staj-jadval (`resolvePercent()`-uslubidagi funksiya, ~20 qator), maydon nomini "shu ish beruvchidagi staj"ga aniqlashtirish, va `boshatish_bhm_minimal`/`Math.max` qatorini olib tashlash.

### `aliment-kalkulyator.html`

Formula (`:293-302`):
```js
amount = income * pct / 100;   // pct = aliment_foiz_1bola / 2bola / 3plus
```
- Konstanta id'lari (`aliment_foiz_1bola`, `aliment_foiz_2bola`, `aliment_foiz_3plus`) kod va JSON faylida **bayt-baytga bir xil** — nomlanish muammosi yo'q.
- **Minimal chegara (MHTEKMning 26,5%) tekshiruvi umuman yo'q** — na kodda, na konstantalar ro'yxatida (`aliment_min_foiz_mhtekm` FAZA 1.4'da yangi qo'shiladigan yozuv sifatida ko'rsatilgan, hali mavjud emas). Formula sof foiz-hisobi, floor yo'q.

**Qayta qurish hajmi:** kichik — `Math.max(amount, minFloor)` qatorini qo'shish va `aliment_min_foiz_mhtekm` + `mhtekm_qiymati` konstantalarini o'qish, ~5-8 qator.

### `yhxx-jarima-kalkulyator.html`

Formula (`:249-264`):
```js
amount = coeff * bhm;   // coeff = yhxx_jarima_* (BHM ko'paytmasi), bhm = bhm_qiymati
```
- Jarimalar **BHM ko'paytmasi sifatida** saqlanadi (hardcode so'm emas) — to'g'ri arxitektura, foydalanuvchi so'ragan shartga mos.
- 6 ta qoidabuzarlik turi va ularning `legal-constants.json` id'lari **bayt-baytga mos**: `tezlik`, `kamar`, `telefon`, `mast`, `guvohnoma`, `svetofor`.
- **15 kunlik 50% chegirma logikasi kodda yo'q** — faqat FAQ matnida umumiy jumla bor ("ba'zi hollarda chegirma bo'lishi mumkin"), funksional emas.

**Qayta qurish hajmi:** chegirma logikasi hozircha kod ichida yo'q, lekin bu band **FAZA 2.7 bo'yicha bloklangan** (asosiy jarima summalari tasdiqlanmaguncha chegirma ham ma'nosiz) — shuning uchun FAZA 1/2'da faqat `yhxx_chegirma_kun`/`yhxx_chegirma_foiz`/`yhxx_radar_dopusk_kmh` konstantalarini qo'shish yetarli, chegirma UI'si keyingi bosqichga qoldirilishi mumkin.

---

## 0.C — `data/legal-constants.json` hozirgi holati

Fayl **18 ta yozuvdan** iborat (FAZA 3'da men tomonimdan yaratilgan). Har biri **bir xil 5 maydon**dan iborat: `id`, `sahifa`, `izoh`, `qiymat` (hammasi `null`), `holat` (hammasi `"TASDIQLASH KERAK"`), `manba_url` (hammasi `null`). `amal_qiladi`, `izoh_uz`/`izoh_ru`, `tur`/`bandlar` kabi FAZA 1'da talab qilinadigan maydonlar hali yo'q.

| # | `id` | Sahifa | Hozirgi tuzilishi |
|---|---|---|---|
| 1 | `tatil_kunlik_koeff` | tatil-puli-kalkulyator | bitta son (to'g'ri — haqiqatan ham bitta koeffitsient) |
| 2 | `tatil_minimal_kunlar` | tatil-puli-kalkulyator | bitta son; **kodda o'qilmaydi** (ulanmagan) |
| 3 | `kasallik_foiz_jadvali` | kasallik-varaqasi-kalkulyator | kod jadval (massiv) kutadi — nomi to'g'ri, JSON tuzilishi hali belgilanmagan |
| 4 | `kasallik_bhm_chegara` | kasallik-varaqasi-kalkulyator | bitta son; **nomi noto'g'ri** — FAZA 1.1 bo'yicha `kasallik_mhtekm_chegara`ga o'zgarishi kerak |
| 5 | `dekret_foiz` | dekret-puli-kalkulyator | bitta son sifatida ishlatiladi; **aslida jadval bo'lishi kerak** (FAZA 1.2) |
| 6 | `dekret_kunlar` | dekret-puli-kalkulyator | kod `{oddiy,murakkab}` obyekt kutadi — tuzilma tayyor |
| 7 | `boshatish_oylik_soni` | ishdan-boshatish-kompensatsiyasi-kalkulyator | bitta son sifatida ishlatiladi; **aslida jadval bo'lishi kerak** (FAZA 1.2, `boshatish_foiz_jadvali`ga aylanadi) |
| 8 | `boshatish_bhm_minimal` | ishdan-boshatish-kompensatsiyasi-kalkulyator | **FAZA 1.3 bo'yicha o'chiriladi**, kodda faol ishlatiladi (yuqorida ko'rsatildi) |
| 9 | `aliment_foiz_1bola` | aliment-kalkulyator | bitta son, kodga bayt-baytga mos |
| 10 | `aliment_foiz_2bola` | aliment-kalkulyator | bitta son, kodga bayt-baytga mos |
| 11 | `aliment_foiz_3plus` | aliment-kalkulyator | bitta son, kodga bayt-baytga mos |
| 12 | `bhm_qiymati` | umumiy | bitta son, yhxx-jarima-kalkulyator tomonidan o'qiladi |
| 13 | `yhxx_jarima_tezlik` | yhxx-jarima-kalkulyator | bitta son (BHM ko'paytmasi), kodga mos |
| 14 | `yhxx_jarima_kamar` | yhxx-jarima-kalkulyator | bitta son (BHM ko'paytmasi), kodga mos |
| 15 | `yhxx_jarima_telefon` | yhxx-jarima-kalkulyator | bitta son (BHM ko'paytmasi), kodga mos |
| 16 | `yhxx_jarima_mast` | yhxx-jarima-kalkulyator | bitta son (BHM ko'paytmasi), kodga mos |
| 17 | `yhxx_jarima_guvohnoma` | yhxx-jarima-kalkulyator | bitta son (BHM ko'paytmasi), kodga mos |
| 18 | `yhxx_jarima_svetofor` | yhxx-jarima-kalkulyator | bitta son (BHM ko'paytmasi), kodga mos |

**Muhim struktura eslatmasi:** har bir kalkulyator sahifa `data/legal-constants.json`ni o'zi **o'qimaydi** — har biri o'z ichiga o'rnatilgan (`<script id="legalconst-data">`) nusxasini oladi (kasallik/ishdan-boshatish/aliment/yhxx sahifalarida **obyekt** shaklida, `id`ga qarab kalitlangan; dekret/tatil sahifalarida esa **massiv** shaklida). Hozircha ikkala nusxa (markaziy fayl va sahifa ichidagi nusxa) mazmunan bir xil, lekin FAZA 1/2'da qiymatlar to'ldirilganda **ikkala joyni ham** yangilash kerak bo'ladi — yagona manba emas. Bu FAZA 1'da hal qilinishi tavsiya etiladigan qo'shimcha topilma (foydalanuvchi so'rovida yo'q edi, lekin FAZA 1 doirasiga tabiiy ravishda kiradi: "struktura to'g'irlanadi va kod unga moslanadi").

---

## Umumiy xulosa

- **Ikkala kalkulyator (kasallik, dekret) eskirgan/soddalashtirilgan modelga qurilgan** — foydalanuvchi taxmin qilganidek. Ikkalasida ham staj-jadval o'rniga flat yoki yarim tayyor tuzilma bor, va bir nechta huquqiy shart (minimal staj, yillik limit, imtiyozlar, soliqdan ozodlik) umuman yo'q.
- **`ishdan-boshatish-kompensatsiyasi-kalkulyator` eng katta qayta qurishga muhtoj**: model butunlay noto'g'ri (flat ko'paytiruvchi, staj-jadval emas) VA huquqiy asosi yo'q `boshatish_bhm_minimal` konstantasiga faol bog'liq.
- **`tatil-puli`, `aliment`, `yhxx` formulalari to'g'ri yo'nalishda** — arxitektura (dinamik konstanta o'qish, gate-logika) sog'lom, faqat qo'shimcha elementlar (ikkinchi natija, minimal floor, chegirma) yetishmaydi.
- Barcha 6 sahifada **null-gate mexanizmi mustahkam ishlaydi** — hech biri `qiymat:null` holatida raqam ko'rsatmaydi yoki PDF/ulashishga ruxsat bermaydi (bu FAZA 3'da alohida tekshirilgan va tasdiqlangan).
- `data/legal-constants.json` markaziy fayl va har sahifaning o'z ichidagi nusxasi hozircha bir xil, lekin ikkita alohida joy — FAZA 1/2'da ikkalasini ham yangilash unutilmasligi kerak.

**Hech qanday kod yoki konstanta bu faza davomida o'zgartirilmadi.** Keyingi qadam — FAZA 1 (struktura): yuqoridagi audit asosida `data/legal-constants.json`ga jadval-tuzilma, yangi maydonlar (`amal_qiladi`, `izoh_uz/ru`) qo'shish va kalkulyator kodini shu strukturaga moslashtirish — hali qiymatsiz.
