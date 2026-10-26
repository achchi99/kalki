# Kunlik kaloriya me'yori (KalkiFit, v51)

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
- **0,7 koeffitsient.** Riou M.-È. va boshq. *Predictors of energy compensation during exercise interventions.* PLoS One 2015;10:e0136392 — mashq sarfining bir qismi kamroq harakat va ko'proq ishtaha bilan qoplanadi. 0,7 — shu kompensatsiyaga ehtiyotkor taxmin (aniq raqam manbadan olinmagan).
- **≤ 500 kkal/kun.** Qadam sensorining xatosi (silkinish, transport) va kompensatsiya sababli cheklov — bizning tanlov.
- **7 700 kkal/kg.** An'anaviy yaqinlashish (Hall K. D. 2008 dinamik modelga ko'ra boshlang'ich bosqichda ehtiyotkor) — adaptiv hisob faqat taklif, ±10% bilan cheklangan.

## Testlar
- `node tools/test-limit-v51.js` (`--only limit-v51`): (a) Android kredit, (b) iPhone/tasdiqlanmagan → 0, (c) Android ↔ iPhone ±10%, (f) (i) yig'indisi = limit, (d) adaptiv (shartlar, ±10%, 14 kun, chegara, tez ozish), (e) migratsiya.
- `node tools/dizayn/test-limit-v51.mjs` (`--only limit-v51-ui`): (g) halqa / «Nima yesam» / Haftangiz / (i) bitta limit; migratsiya kartasi; onboarding; adaptiv Ha / Hozir emas / Profil qaytarish; RU 360 px.
