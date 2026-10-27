# Kunlik kaloriya me'yori (KalkiFit, v51 → v56: mashg'ulot, qo'lda qadam, «hozirgacha» balans)

Bitta model, bitta funksiya: `S.dayPlan(st, d)` (`assets/kalkifit-core.js`). Halqa, ovqat budjetlari, «Nima yesam ekan?», (i) tushuntirish, plato tahlili, «Haftangiz» — hammasi shundan oladi (`S.dayBalance`, `S.dayLimit`, `S.planSt` uning ustida). Konstantalar bitta joyda — `LIM` (core) va `AD` (`assets/kalkifit-plato.js`).

## Formula

```
limit = BMR × k  +  qadam_krediti  +  corr  ±  maqsad      (ozishda pastki chegaradan past emas)
```

| Qism | Qiymat |
|---|---|
| BMR | Mifflin–St Jeor |
| k — Android, qadam yoqilgan, ish turi tasdiqlangan | o'tirib ishlayman 1,40 · tik turib / yurib 1,60 · og'ir jismoniy 1,85 |
| k — iPhone, veb, qadam ruxsati yo'q yoki ish turi tasdiqlanmagan | avvalgi umumiy faollik `ACT` (1,2 / 1,375 / 1,55 / 1,725 / 1,9), kredit 0 |
| Baza qadam (ish turi ichida) | 5 000 / 7 500 / 10 000 |
| Qadam krediti | `max(0, qadam − baza) × bo'y × 0,415 (qadam uzunligi) × vazn × 0,5 kkal/kg/km × 0,7`, kuniga ≤ 500 |
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

- Shartlar: ilovadan ≥ 21 kun, oxirgi 28 kunning ≥ 80% i to'liq yozilgan kun, shu oynada ≥ 4 tortilish.
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
- `node tools/test-mashq.js` (`--only mashq`): MET NET, yugurish + qadam ikki marta emas (Android va qo'lda), 0,7 va 800, iPhone tasdiq/rad, balans va tafsilot yig'indisi, v56 «hozirgacha» balans (08:00 / 14:00 / 23:59 / 00:00, o'tgan kun — to'liq, holat chegaralari), matndan mashg'ulot, migratsiya, plato 5-sabab.
- `node tools/dizayn/test-mashq.mjs` (`--only mashq-ui`): qo'lda qadam → ish turi → kredit, mashg'ulot oynasi, tahrir/surib o'chirish, ogohlantirishlar, kartalar (bo'sh / to'lgan, «+» 34/44 px, bitta mashg'ulot — tur ikonkasi), balans «Ikki chiziq» + ikki ustunli tafsilot, bir xil limit, ovoz/matn, Android, RU 360 × 115%.
- `node tools/dizayn/test-tahrir.mjs` (`--only tahrir`): ovqatni tahrirlash oynasi (maket 3) — 42 px tugmalar, 4 plitka, segment porsiya, qatorlar, «Saqlash · N kkal» jonli, saqlash, 🗑 + qaytarish, 360 × 115% UZ/RU bir qatorda, panel kontentni yopmaydi; qo'shish oqimi — o'sha komponent.
- `node tools/test-limit-v51.js` (`--only limit-v51`): (a) Android kredit, (b) iPhone/tasdiqlanmagan → 0, (c) Android ↔ iPhone ±10%, (f) (i) yig'indisi = limit, (d) adaptiv (shartlar, ±10%, 14 kun, chegara, tez ozish), (e) migratsiya.
- `node tools/dizayn/test-limit-v51.mjs` (`--only limit-v51-ui`): (g) halqa / «Nima yesam» / Haftangiz / (i) bitta limit; migratsiya kartasi; onboarding; adaptiv Ha / Hozir emas / Profil qaytarish; RU 360 px.
