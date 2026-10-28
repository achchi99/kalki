# Kunlik kaloriya me'yori (KalkiFit, v51 → v62: ehtiyotkorroq me'yor, soat ma'lumoti)

Bitta model, bitta funksiya: `S.dayPlan(st, d)` (`assets/kalkifit-core.js`). Halqa, ovqat budjetlari, «Nima yesam ekan?», (i) tushuntirish, plato tahlili, «Haftangiz» — hammasi shundan oladi (`S.dayBalance`, `S.dayLimit`, `S.planSt` uning ustida). Konstantalar bitta joyda — `LIM` (core) va `AD` (`assets/kalkifit-plato.js`).

## v62: me'yor ortiqcha bo'lish xavfi — tahlil va ehtiyotkor tuzatish

**Sabab (real holat, 28-okt).** iPhone + Huawei soat: Apple Health «Всего» 2 476 kkal (21:34 gacha; aktiv 662, 15 780 qadam, 1:09 kuch mashg'uloti). KalkiFit: me'yor 2 737 (saqlash, o'tirib ishlayman) + qadam krediti 355 = 3 092. Soat + hazm energiyasi (TEF ~10%) bo'yicha kunlik sarf ~2 900–2 950 — KalkiFit 150–400 kkal ko'p berardi.

**Usul** (`node tools/limit-tahlil.js` — jadvalni qayta chiqaradi). Sintetik profillar (E 176 sm / A 163 sm, 35 yosh, vazn 60–110, qadam 3k/8k/15k/20k, «saqlash», mashg'ulotsiz), uchta baho:
1. **IOM 2005 EER** — DLW (ikki marta belgilangan suv) asosidagi tenglamalar (BMI ≥ 25 — ortiqcha vazn tenglamalari). PA toifasi qadamdan: ADL ≈ 2 500 qadam, 1 mil ≈ 2 000 qadam; sedentary < 1,5 mil, low active 1,5–3, active 3–10, very active ≥ 10 (DGA 2005 / IOM ta'riflari, taxminiy xarita).
2. **Soat modeli** — `(BMR + barcha qadamning sof yurish kkal'i) / 0,9` = «resting + active + TEF 10%». O'tirish/turishdagi mayda harakatni sanamaydi — **pastki baho**.
3. Ish turi bor qatorlarda — FAO/WHO/UNU 2004 «faol» (1,70) va «og'ir» (2,00) toifalarining pastki chegarasi.

**Natija (o'tirib ishlovchi, kkal/kun; «−min» = bizning − min(IOM, soat)):**

| Profil | Qadam | Eski (v61) | Yangi (v62) | IOM EER | Soat modeli | Eski −min | Yangi −min |
|---|---:|---:|---:|---:|---:|---:|---:|
| E 60 kg | 3 000 | 2 142 | 2 066 | 2 233 | 1 773 | +369 | +293 |
| E 60 kg | 8 000 | 2 188 | 2 112 | 2 442 | 1 895 | +293 | +217 |
| E 60 kg | 15 000 | 2 295 | 2 206 | 2 709 | 2 065 | +230 | +141 |
| E 60 kg | 20 000 | 2 372 | 2 261 | 2 709 | 2 187 | +185 | +74 |
| E 80 kg | 3 000 | 2 422 | 2 336 | 2 561 | 2 020 | +402 | +316 |
| E 80 kg | 8 000 | 2 483 | 2 397 | 2 780 | 2 182 | +301 | +215 |
| E 80 kg | 15 000 | 2 627 | 2 523 | 3 091 | 2 409 | +218 | +114 |
| E 80 kg | 20 000 | 2 729 | 2 596 | 3 091 | 2 571 | +158 | +25 |
| E 110 kg | 3 000 | 2 842 | 2 741 | 2 972 | 2 389 | +453 | +352 |
| E 110 kg | 8 000 | 2 926 | 2 825 | 3 240 | 2 613 | +313 | +212 |
| E 110 kg | 15 000 | 3 123 | 2 998 | 3 621 | 2 925 | +198 | +73 |
| E 110 kg | 20 000 | 3 264 | 3 099 | 3 621 | 3 148 | +116 | −49 |
| A 60 kg | 3 000 | 1 796 | 1 732 | 1 857 | 1 493 | +303 | +239 |
| A 60 kg | 8 000 | 1 839 | 1 775 | 2 067 | 1 606 | +233 | +169 |
| A 60 kg | 15 000 | 1 938 | 1 862 | 2 328 | 1 764 | +174 | +98 |
| A 60 kg | 20 000 | 2 009 | 1 913 | 2 328 | 1 876 | +133 | +37 |
| A 80 kg | 3 000 | 2 076 | 2 002 | 2 091 | 1 738 | +338 | +264 |
| A 80 kg | 8 000 | 2 133 | 2 059 | 2 398 | 1 888 | +245 | +171 |
| A 80 kg | 15 000 | 2 265 | 2 175 | 2 609 | 2 098 | +167 | +77 |
| A 80 kg | 20 000 | 2 360 | 2 243 | 2 609 | 2 249 | +111 | −6 |
| A 110 kg | 3 000 | 2 496 | 2 407 | 2 433 | 2 105 | +391 | +302 |
| A 110 kg | 8 000 | 2 574 | 2 485 | 2 795 | 2 312 | +262 | +173 |
| A 110 kg | 15 000 | 2 756 | 2 645 | 3 044 | 2 601 | +155 | +44 |
| A 110 kg | 20 000 | 2 887 | 2 738 | 3 044 | 2 808 | +79 | −70 |

Ish turi bor qatorlar (E 70/90 kg, tik turib / og'ir): bizniki FAO pastki chegarasidan 0 … 270 kkal **past** (20 000 qadamda tik turib +20 … +52) — ortiqcha emas. Hamma 64 qatorda: o'rtacha farq min(IOM, soat) dan eski +151, yangi +73 kkal; IOM (DLW) dan esa hamma joyda past.
**Real holat** (taxminiy profil E 100 kg 183 sm 35 y, 15 780 qadam): eski 3 050 → **yangi 2 923** (soat + TEF ≈ 2 900–2 950).

**Xulosa.**
- DLW asosidagi o'rtacha (IOM) bilan solishtirganda formula tizimli ortiqcha bermaydi — aksincha past. Ortiqcha beriladigan joy — **soat bilan o'lchanadigan odam** (pastki baho) va **kam qadamli kun**: 3 000 qadamda ham k = 1,40 berilardi (bazadan kam qadam ayirilmaydi), shu yerda soat modelidan +300 … +450.
- **1,40 va 5 000 qoplanishi:** 1,40 = BMR + TEF (~0,14 × BMR) + uyqu/o'tirish (~0,15) + qolgan ~0,11 × BMR harakat. 100 kg odamda 0,11 × BMR ≈ 200 kkal ≈ 5 000 qadamning sof narxi (1 000 qadam ≈ 38 kkal). Ya'ni 1,40 ichidagi «harakat byudjeti» deyarli to'liq 5 000 qadamga ketadi: qoplanish yo'q, lekin **zaxira ham yo'q** — turish, mayda harakat va telefon cho'ntakda bo'lmagan qadamlar uchun joy qolmagan, 5 000 dan kam yurgan kunda esa ortiqcha beriladi. IOM bo'yicha 1,40 — «sedentary» (1,0–1,39) ning yuqori chegarasi.
- Odamlar orasidagi farq (DLW: ±10% ≈ ±250 kkal) formula xatosidan katta — shuning uchun shaxsiy ma'lumot (soat, adaptiv) asosiy yo'l.

**O'zgarishlar (ehtiyot qoidasi: noaniq bo'lsa — kam).**

| Nima | Eski | Yangi | Nega |
|---|---|---|---|
| O'tirib ishlovchi k | 1,40 | 1,35 | IOM sedentary (1,0–1,39) va soat modeli o'rtasi; kam qadamli kunda ortiqcha berilmasin. iPhone `ACT[2]` = 1,375 (yurish ichida) — Android 1,40 undan katta edi (mantiqsiz) |
| Qadam krediti 12 000 dan ortig'i | × 0,7 | × 0,5 | Careau 2021: faollik energiyasining ~28% i BMR pasayishi bilan qaytadi, yog' ko'p odamda ko'proq; kundalik «qisqa» qadam uzunligi 0,415 × bo'ydan kichik |
| Zal (kuch) MET | 3,5 / 5,0 / 6,0 | 3,0 / 3,5 / 5,0 | Compendium 02054 «8–15 takror, turli og'irlik» = 3,5 (setlar orasida dam bilan); 5,0 — faqat squat/deadlift (02052); 6,0 — «vigorous» powerlifting (02050) |
| Soat (iPhone, qo'lda) | — | «Активная энергия» qadam + mashg'ulot krediti **o'rniga** | pastda |
| Soat (Android, Health Connect) | — | qurilma + TEF ≥ 10% kam bo'lsa — o'sha kun kichigi | pastda |
| Adaptiv me'yor | ≥ 21 kun | ≥ 14 kun | pastda |
| Pastki chegara (1 500 / 1 200), ≤ 500 / ≤ 800, baza 5 000 / 7 500 / 10 000, tik turib / og'ir k | — | o'zgarmadi | |

Mashg'ulot krediti (× 0,7, ≤ 800) va iPhone `ACT` o'zgarmadi.

### Soat ma'lumoti

**iPhone / veb (qo'lda, `x.ae`).** Qadam oynasida ixtiyoriy maydon: «Soatingiz bor bo'lsa — «Активная энергия», kkal». Kiritilsa:
```
bazaviy harakat = BMR × (k × 0,9 − 1)        (k ichidagi harakat; k ning 10% i — TEF)   — o'tirib: 0,215 × BMR
soat krediti    = max(0, aktiv − bazaviy) × 0,7, ≤ 800
qadam krediti = mashg'ulot krediti = 0       (ular soatning aktiv energiyasi ichida — ikki marta emas)
```
Misol (100 kg, aktiv 690): bazaviy 424 → +186 (qadam bo'yicha 258, zal bilan 460 edi).

**Android (Health Connect, 1.0.7, `x.dev`).** Ixtiyoriy alohida ruxsat (Hisob oynasi → «⌚ Soatingiz bormi? Sarfini ulash»): `TotalCaloriesBurned` / `ActiveCaloriesBurned`, oxirgi 7 kun. Faqat **ishonchli manba**: yozuv qurilmasi soat/bilaguzuk/uzuk/ko'krak tasmasi yoki ma'lum wearable ilovasi (Huawei Health, Mi Fitness, Zepp, Garmin, Fitbit, Polar, Suunto, Coros, Withings, Oura, Whoop, Samsung Wear…); Google Fit va telefon taxmini olinmaydi; bir nechta manbadan — eng ko'p qamrovli BITTA paket (`kalkifit-android` `EnergiyaHisob.kt`).
```
qurilma sarfi = jami (soat kun bo'yi ≥ 20 soat taqilgan bo'lsa; bugun — o'tgan vaqtning ≥ 90% + qolgan soatlar BMR) yoki BMR + aktiv
               ÷ 0,9 (TEF), lekin BMR × 1,2 dan past emas (yechib qo'yilgan soat / xato)
qurilma sarfi ≤ formula sarfi × 0,9  →  o'sha kun: sarf = qurilma sarfi, limit = sarf ± maqsad (pastki chegara saqlanadi)
```
Faqat to'liq kun: o'tgan kunlar va bugun 20:00 dan keyin. (i) oynasida «⌚ Soatingiz ma'lumoti bo'yicha −N» qatori, formula qatorida «− N». Qo'lda «Aktiv energiya» kiritilgan kunda Android solishtiruvi yo'q (bitta manba). Soat **ko'p** ko'rsatsa — limit oshirilmaydi.

### Adaptiv (14 kun)
Shartlar o'zgarmadi (oxirgi 28 kunning ≥ 80% i to'liq, ≥ 4 tortilish, farq ≥ 150, ±10%, 14 kunda bir marta) — faqat birinchi taklif 21 emas, **14** kundan. Taklif faqat pasaytirsa ham chiqadi (juda tez ozishda — faqat oshirish, avvalgidek).

### Eski foydalanuvchiga izoh
`S.limShift(st, bugun)` — oxirgi 7 kun (yozuvli kunlar) o'rtacha limiti eski (v61: k 1,40, kamaytirishsiz, eski zal MET) va yangi formula bo'yicha. Farq > 8% bo'lsa Bugun'da bir martalik karta: «Kunlik me'yoringiz yangilandi: A → B kkal» + sabab, [Hisob] [Tushunarli] (`prefs.limV62`, `prefs.limShow`). Oddiy holatda farq ~3–5% — karta chiqmaydi; asosan juda faol (20 000 qadam + og'ir zal) foydalanuvchilarda.

### Qo'shimcha manbalar (v62)
- Institute of Medicine. *Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids* (2005), 5-bob: EER tenglamalari va PA koeffitsientlari (DLW ma'lumotlar bazasi). Dietary Guidelines for Americans 2005 (ilmiy asos): «moderately active» ≈ kundalik hayotga qo'shimcha 1,5–3 mil yurish, «active» ≈ > 3 mil.
- Westerterp K. R. *Physical activity and physical activity induced energy expenditure in humans: measurement, determinants, and effects.* Front Physiol 2013;4:90 — DLW bo'yicha PAL oralig'i va o'tirib yashovchilar.
- Careau V. va boshq. *Energy compensation and adiposity in humans.* Curr Biol 2021;31(20):4659–4666 — 1 754 kishi: faollik energiyasining o'rtacha ~28% i (BMR pasayishi orqali) qoplanadi, yog' ko'p odamda ko'proq.
- Pontzer H. va boshq. *Constrained total energy expenditure and metabolic adaptation to physical activity in adult humans.* Curr Biol 2016;26(3):410–417 — yuqori faollikda umumiy sarf chiziqli o'smaydi.
- Herrmann S. D. va boshq. *2024 Adult Compendium of Physical Activities.* J Sport Health Sci 2024 (pacompendium.com): 02054 = 3,5 MET, 02052 = 5,0, 02050 = 6,0.
- Shcherbina A. va boshq. *Accuracy in wrist-worn, sensor-based measurements of heart rate and energy expenditure in a diverse cohort.* J Pers Med 2017;7(2):3; O'Driscoll R. va boshq. *How well do activity monitors estimate energy expenditure? A systematic review and meta-analysis.* Br J Sports Med 2020;54:332–340 — soat sarfi xatosi katta (±20–30% va undan ko'p): shuning uchun soat faqat **kamaytiradi** (≥ 10% farqda), oshirmaydi; BMR × 1,2 himoyasi.
- Tudor-Locke C. va boshq. *How many steps/day are enough? for adults.* Int J Behav Nutr Phys Act 2011;8:79.

## Formula

```
limit = BMR × k  +  qadam_krediti  +  corr  ±  maqsad      (ozishda pastki chegaradan past emas)
```

| Qism | Qiymat |
|---|---|
| BMR | Mifflin–St Jeor |
| k — Android, qadam yoqilgan, ish turi tasdiqlangan | o'tirib ishlayman **1,35** (v62 gacha 1,40) · tik turib / yurib 1,60 · og'ir jismoniy 1,85 |
| k — iPhone, veb, qadam ruxsati yo'q yoki ish turi tasdiqlanmagan | avvalgi umumiy faollik `ACT` (1,2 / 1,375 / 1,55 / 1,725 / 1,9), kredit 0 |
| Baza qadam (ish turi ichida) | 5 000 / 7 500 / 10 000 |
| Qadam krediti | `max(0, qadam − baza) × bo'y × 0,415 (qadam uzunligi) × vazn × 0,5 kkal/kg/km × 0,7`, **12 000 dan ortig'i × 0,5** (v62), kuniga ≤ 500 |
| corr | shaxsiy tuzatish (adaptiv), ±1 000 gacha |

**Nega ikki marta hisoblanardi (v50 gacha):** `ACT` (masalan «o'rtacha faol» = kundalik yurishni ham o'z ichiga olgan) ustiga yana ACT bazasidan (4 000–13 000) ortiq har qadam uchun kredit qo'shilardi; cheklov va 0,7 yo'q edi. Sintetik holatlarda Android foydalanuvchisiga +116 … +464 kkal/kun ortiqcha. Endi Android'da `k` faqat **ish** (yurishsiz kundalik hayot), yurishni sensor sanaydi; iPhone'da yurish `ACT` ichida, kredit yo'q. O'xshash kunda Android va iPhone limitlari ±10% ichida (`test-limit-v51` 3-guruh: 16 juft, eng katta farq 7,3%).

Ish turi tanlanganda zaxira sifatida `act` ham yoziladi (`JOB_ACT`: 2 / 3 / 5) — qadam o'chsa yoki iPhone'ga o'tsa shu ishlaydi.

## v55: mashg'ulot, iPhone'da qadam, kunlik balans

```
limit = BMR × k + qadam krediti + MASHG'ULOT krediti + shaxsiy tuzatish ± maqsad      (ozishda pastki chegaradan past emas)
sarf  = BMR × k + tuzatish + qadam NET (bazadan ortig'i, to'liq) + mashg'ulot NET (to'liq)
balans = iste'mol − sarf
```

**Mashg'ulot NET kkal** = (MET − 1) × vazn (kg, `S.currentWeight`) × soat. Tinch holat BMR ichida bo'lgani uchun 1 MET ayiriladi.

**MET qiymatlari** — 2024 Adult Compendium of Physical Activities (Herrmann S. D. va boshq., *J Sport Health Sci* 2024;13(1):6–12, PMID 38242596; jadvallar — pacompendium.com, 2026-10-27 da olindi):

| Tur | Yengil | O'rtacha | Og'ir | spm* |
|---|---|---|---|---|
| Yugurish | 6,5 (12028, 4–4,2 mph) | 7,5 (12020, o'z sur'atida) | 9,3 (12050, 6–6,3 mph) | 160 |
| Zal (kuch) | 3,5 (02054) | 5,0 (02052) | 6,0 (02050) | — |
| Velosiped | 4,0 (01010) | 6,8 (01020) | 8,0 (01030) | — |
| Futbol | 3,5 (15615, piyoda futbol) | 7,0 (15610, havaskor) | 9,5 (15605, musobaqa) | 110 |
| Suzish | 5,8 (18240) | 8,0 (18290) | 9,8 (18230) | — |
| Uyda mashq / fitnes | 2,8 (02024) | 3,8 (02022) | 7,5 (02020) | — |
| Raqs | 3,0 (03040) | 5,0 (03033) | 9,8 (03031) | 70 |
| Yoga, cho'zilish | 2,3 (02150) | 2,7 (02185) | 4,0 (02160) | — |
| Kurash, boks | 5,3 (15425) | 7,8 (15120) | 10,3 (15430) | — |
| Voleybol, basketbol | 3,0 (15720) | 6,0 (15050) | 8,0 (15040) | 80 |
| Og'ir jismoniy ish | 3,8 (08245) | 5,0 (08050) | 7,8 (11790) | — |
| Boshqa | 3,0 | 4,5 | 7,0 | — |

«Boshqa» Compendium kodi emas. Uning qiymatlari intensivlik chegaralaridan olingan: o'rtacha 3–5,9 MET, og'ir ≥ 6 MET.

\* **spm** — mashg'ulot vaqtida taxminiy qadam/daqiqa. Bu bizning baho: yugurish kadansi odatda 150–180, sport o'yinlarida harakat uzilib-uzilib bo'ladi. Faqat ikki marta hisoblamaslik uchun ishlatiladi.

«Piyoda yurish» alohida tur emas — u qadam bilan hisoblanadi.

**Ikki marta hisoblamaslik** (`S.dayPlan`):
1. Qadam bazasigacha bo'lgan qadamlar (5 000 / 7 500 / 10 000) k ichida. Kredit faqat bazadan ortig'iga beriladi (v51).
2. Qadam hosil qiladigan mashg'ulot (yugurish, futbol, raqs, voleybol): uning qadami = daqiqa × spm (kunlik qadamdan oshmaydi).
   - Shundan bazadan **ortiq** qismga qadam krediti berilgan bo'lishi mumkin.
   - **Ustma-ust qism** = min(mashg'ulot qadami, max(0, kunlik qadam − baza)).
   - **Mashg'ulot NET** = max(0, mashg'ulot kkal − ustma-ust qadamning sof kkal'i). Ya'ni ehtiyotkor tomon: ortiqcha qadam avval mashg'ulotniki deb olinadi.
3. Kreditlar:
   - qadam — creditOf (× 0,7, ≤ 500);
   - mashg'ulot — NET × 0,7;
   - ikkalasi birga ≤ 800 kkal.

   0,7 — qadam bilan bir xil konservativ koeffitsient: baho xatosi va kompensatsiya, Riou 2015 (*Nutrients*). 800 chegarasi — bizning tanlov, bevosita manba yo'q. U taxminan 1–1,5 soat o'rtacha sport va 15 000+ qadamga to'g'ri keladi.
4. Ish turi modeli bo'lmasa (ACT — umumiy faollik yurish va odatiy sportni o'z ichiga oladi) — kredit 0, sarf = TDEE. Mashg'ulot ro'yxatda ko'rinadi.

**Misol** (erkak 80 kg, 175 sm, o'tirib ishlaydi, baza 5 000; yugurish 25 daq o'rtacha, kuniga 9 000 qadam):
- Yugurish = (7,5 − 1) × 80 × 25/60 = **217 kkal**.
- Bazadan ortiq qadam = 9 000 − 5 000 = 4 000 → qadam krediti 81 kkal. To'liq sof kkal = 116.
- Yugurish qadami = 25 × 160 = 4 000 → ustma-ust qism = min(4 000, 4 000) = 4 000 → 116 kkal.
- Mashg'ulot NET = 217 − 116 = **101 kkal** → kredit 71 kkal.
- Jami kredit = 81 + 71 = **152 kkal**. Faqat yugurish yozilgan, qadamsiz kunda ham **152 kkal** chiqadi: bir xil, ikki marta emas.
- Sarfga qo'shiladigan qism: qadam 116 + mashg'ulot 101 = 217 kkal — yugurishning o'zi.

**Ish turi «Og'ir jismoniy mehnat»** bo'lganda «Og'ir ish» mashg'ulotida ogohlantirish chiqadi: ish vaqtidagi mehnat k ichida, faqat ishdan tashqarisini qo'shing.

**iPhone/veb — qadamni qo'lda kiritish** (bugun yoki kecha; «Salomatlik» ilovasidan). Birinchi kiritishda (yoki birinchi mashg'ulotda) «Ishingiz qanday?» oynasi chiqadi, unda Hozirgi → Yangi me'yor ko'rsatiladi.
- **Tasdiqlansa** (`prefs.qm = 'on'`): k ish turidan olinadi, kredit qadam bazasi bo'yicha. Qadam kiritilmagan kunlarda kredit 0, k esa baribir ish turidan qoladi (eski umumiy darajaga qaytmaydi). Kechqurun yumshoq eslatma chiqadi: «Bugun qadam kiritilmadi»; (i) ham shuni tushuntiradi.
- **Yopilsa** (`qm = 'off'`): qadam faqat ko'rinadi, kredit 0, eski umumiy daraja qoladi. Ish turini keyin Profil'da tanlash mumkin.
- **Android'da** qo'lda kiritish yo'q (avtomatik; v49 / v52 qoidalari o'zgarmaydi).

**Balans ko'rsatish (v56 — «hozirgacha»):**

Ertalab 08:00 da butun kunlik tinch sarfni ayirish noto'g'ri edi (kun boshida har doim «katta minus», nonushtadan keyin «ortiqcha»). Endi balans **hozirgacha** sarf bilan solishtiriladi (`S.dayBal(st, d, eaten, now)`, `S.dayFrac`):

```
f        = (soat + daqiqa/60) / 24          — telefon mahalliy vaqti, 00:00 dan chiziqli (o'tgan kun 1, kelajak 0)
sarfNow  = round((BMR × k + tuzatish) × f) + qadam NET + mashg'ulot NET     — harakat to'liq: u allaqachon bo'lgan
balans   = yedingiz − sarfNow
rejaF    = round(reja × f)                    — reja (−500 / +300) ham shu ulushda
```

Holat (chegara ±100 kkal, `BAL_TOL`):
- ozish/saqlash: balans > +100 → «Hozircha ortiqcha +N»; ozishda balans < rejaF − 100 → «Ozish tomonda · reja −500»; aks holda «Rejaga mos».
- vazn olish: balans < rejaF − 100 → «Hozircha kam»; aks holda «Rejaga mos».

Chiziqli ulush — soddalashtirish: tinch sarf kechasi biroz kam, kunduzi biroz ko'p, lekin farq kichik va tushunarli. 23:59 da sarfNow = kunlik to'liq sarf (test).

- Halqa kartasida: «■ Yedingiz» va «Hozirgacha sarf ■» raqamlari, ostida ikki chiziq (uzunligi kattasiga nisbatan), pastda balans belgisi (↓ yashil / ↑ sariq, qizil yo'q) + holat + «›». Halqadagi «kkal qoldi» o'zgarmaydi (u kunlik limitdan).
- Batafsil: ikki ustun — «Hozirgacha» va «Kun yakunida (taxminan)». Qatorlar: tinch holat, kundalik hayot, tuzatish, qadam, mashg'ulot, jami sarf, yedingiz, balans, reja; ikkala ustunda yig'indi = jami sarf (test). Tarix'dagi o'tgan kunlar — bitta ustun, to'liq kun.
- Sarf to'liq ko'rsatiladi, yeyish limitiga esa harakatning 70% i qo'shiladi.

**Mashg'ulot kartasi doirasi** — kunlik 60 daqiqaga nisbatan (`EX_GOAL`). Bu bizning tanlov: JSST tavsiyasi haftasiga 150–300 daqiqa o'rtacha faollik (kuniga ~20–45), 60 — «to'liq doira» uchun yumaloq, erishsa bo'ladigan maqsad. Qadam doirasi — `st.stepGoal` (8 000 standart).

**Plato 5-sabab** («Mashg'ulot kunlari ko'proq yeyiladi»): mashg'ulot kunlari (≥ 2) va boshqa to'liq kunlar (≥ 3) bor bo'lsa, iste'mol farqidan limitga qo'shilgan o'rtacha mashg'ulot krediti ayiriladi. Natija ≥ 200 kkal bo'lsa, sabab chiqadi.

## O'zini to'g'rilaydigan me'yor (`KalkiPlato.adapt`)

- Shartlar: ilovadan ≥ 14 kun (v62 gacha 21), oxirgi 28 kunning ≥ 80% i to'liq yozilgan kun, shu oynada ≥ 4 tortilish.
- Haqiqiy sarf = o'rtacha iste'mol − (trend vazn o'zgarishi × 7 700 kkal/kg) / kunlar (Holt trendi). Formuladagi sarf bilan farqi ≥ 150 kkal bo'lsa — Bugun'da yumshoq taklif: «Kuzatuvlarga ko'ra kunlik sarfingiz ~N kkal. Me'yorni M kkal ga yangilaymizmi?» [Hozir emas] [Ha].
- Cheklovlar: bir qadamda ±10%, 14 kunda bir marta (rad etilsa ham), pastki chegaradan past emas; juda tez ozayotganda faqat oshiriladi.
- «Ha» → `profile.corr` (zaxiraga profil bilan tushadi). Profil → kunlik me'yor ostida «Shaxsiy tuzatish … · Standart hisobga qaytish».

## Shaffoflik ((i), kaloriya halqasi bosilganda)

Bir qator formula (`1 724 + 689 + 264 − 550 = 2 127 kkal`) va qatorlar: tinch holatda sarf · kundalik hayot (ish turi yoki faollik) · ortiqcha qadam (N qadam, bazangiz B) · shaxsiy tuzatish · maqsad · pastki chegara · kunlik me'yor. Qo'shiluvchilar yig'indisi = limit (test). Ostida bitta jumla: Android — «bazangizdan (B) ortig'i qo'shiladi, kuniga ≤ 500»; iPhone — «qadam alohida qo'shilmaydi, faollik darajangiz ichida»; tasdiqlanmagan Android — «Ish turini tanlasangiz…».

## Migratsiya

- Mavjud Android foydalanuvchisi (qadam yoqilgan, `profile.job` yo'q): kredit **0** (ikki marta hisoblanmaydi). Bugun'da bir martalik karta → ish turi oynasi → «Hozirgi me'yor X → Yangi me'yor Y» → tasdiqlash. Yopsa qaytmaydi (`prefs.jobAsked`); keyin Profil'da tanlash mumkin.
- Yangi Android foydalanuvchisi: onboarding'da faollik o'rniga «Ishingiz qanday? Yurishni ilova o'zi sanaydi».
- iPhone/veb: o'zgarishsiz (`ACT`, kredit 0).
- `S.migrate`: `job` (ma'lum kalit) va `corr` (|corr| ≤ 1 000) saqlanadi, boshqasi tashlanadi; zaxira/tiklash profil bilan.

## Manbalar

- **BMR.** Mifflin M. D., St Jeor S. T. va boshq. *A new predictive equation for resting energy expenditure in healthy individuals.* Am J Clin Nutr 1990;51:241–247. Frankenfield D. va boshq. J Am Diet Assoc 2005;105:775–789 — sog'lom kattalarda eng aniq tenglama.
- **Ish koeffitsientlari.** FAO/WHO/UNU *Human energy requirements* (2004): PAL 1,40–1,69 «o'tirib/yengil», 1,70–1,99 «faol», 2,00–2,40 «og'ir». Bizning 1,40 / 1,60 / 1,85 — yurish **chiqarilgan** holat uchun shu oraliqlarning pastki-o'rta qismi (yurish sensordan alohida qo'shiladi).
- **Baza qadamlar.** Tudor-Locke C., Bassett D. R. *How many steps/day are enough?* Sports Med 2004;34:1–8: < 5 000 — o'tirib, 7 500–9 999 — bir oz faol, ≥ 10 000 — faol. Kasbga qarab aniq baza qadam soni manbada berilmagan — 5 000 / 7 500 / 10 000 shu toifalardan bizning tanlov.
- **Yurish narxi.** ACSM *Guidelines for Exercise Testing and Prescription* metabolik tenglamalari: tekis yurishda sof sarf ~0,5 kkal/kg/km. Qadam uzunligi ≈ bo'y × 0,415 (pedometriya amaliyoti).
- **0,7 koeffitsient.** Riou M.-È. va boshq. *Predictors of energy compensation during exercise interventions: a systematic review.* *Nutrients* 2015;7(5):3677–3704 (PMID 25988763) — mashq sarfining bir qismi kamroq harakat va ko'proq ishtaha bilan qoplanadi. 0,7 — shu kompensatsiyaga ehtiyotkor taxmin (aniq raqam manbadan olinmagan).
- **≤ 500 kkal/kun.** Qadam sensorining xatosi (silkinish, transport) va kompensatsiya sababli cheklov — bizning tanlov.
- **7 700 kkal/kg.** An'anaviy yaqinlashish (Hall K. D. 2008 dinamik modelga ko'ra boshlang'ich bosqichda ehtiyotkor) — adaptiv hisob faqat taklif, ±10% bilan cheklangan.

## Testlar
- `node tools/test-limit-v62.js` (`--only limit-v62`): k 1,35 va 12 000+ × 0,5, real holat, zal MET, «Aktiv energiya» (qadam + mashg'ulot o'rniga, ikki marta emas), Android soat (≥ 10%, 20 soat, 20:00, BMR × 1,2, pastki chegara, migratsiya), adaptiv 14 kun, `limShift`. `tools/dizayn/test-limit-v62.mjs` (`--only limit-v62-ui`): iPhone maydoni va (i) yig'indisi, Android ulash/solishtirish (soxta ko'prik), eski APK, izoh kartasi (360/390, katta shrift, UZ/ЎЗ/RU). Android: `cd kalkifit-android/android && ./gradlew :app:testDebugUnitTest` (`EnergiyaHisobTest`).
- `node tools/test-mashq.js` (`--only mashq`): MET NET, yugurish + qadam ikki marta emas (Android va qo'lda), 0,7 va 800, iPhone tasdiq/rad, balans va tafsilot yig'indisi, v56 «hozirgacha» balans (08:00 / 14:00 / 23:59 / 00:00, o'tgan kun — to'liq, holat chegaralari), matndan mashg'ulot, migratsiya, plato 5-sabab.
- `node tools/dizayn/test-mashq.mjs` (`--only mashq-ui`): qo'lda qadam → ish turi → kredit, mashg'ulot oynasi, tahrir/surib o'chirish, ogohlantirishlar, kartalar (bo'sh / to'lgan, «+» 34/44 px, bitta mashg'ulot — tur ikonkasi), balans «Ikki chiziq» + ikki ustunli tafsilot, bir xil limit, ovoz/matn, Android, RU 360 × 115%.
- `node tools/dizayn/test-tahrir.mjs` (`--only tahrir`): ovqatni tahrirlash oynasi (maket 3) — 42 px tugmalar, 4 plitka, segment porsiya, qatorlar, «Saqlash · N kkal» jonli, saqlash, 🗑 + qaytarish, 360 × 115% UZ/RU bir qatorda, panel kontentni yopmaydi; qo'shish oqimi — o'sha komponent.
- `node tools/test-limit-v51.js` (`--only limit-v51`): (a) Android kredit, (b) iPhone/tasdiqlanmagan → 0, (c) Android ↔ iPhone ±10%, (f) (i) yig'indisi = limit, (d) adaptiv (shartlar, ±10%, 14 kun, chegara, tez ozish), (e) migratsiya.
- `node tools/dizayn/test-limit-v51.mjs` (`--only limit-v51-ui`): (g) halqa / «Nima yesam» / Haftangiz / (i) bitta limit; migratsiya kartasi; onboarding; adaptiv Ha / Hozir emas / Profil qaytarish; RU 360 px.
