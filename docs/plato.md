# «Vazn trendi» va «Nega sekin ozyapman?» (KalkiFit, v46)

Maqsad: odam «ozmayapman» deb ilovani tashlab ketmasin. Ilova uning **o'z ma'lumotidan** sababni topadi va 2–3 aniq ish taklif qiladi.
AI yo'q. Hisob qurilmada (`assets/kalkifit-plato.js`, sof funksiyalar) bajariladi. Trend formulasi v47 da almashgan. Akkaunt ulangan bo'lsa ham shu ma'lumot bilan ishlaydi: server faqat shifrlangan zaxirani saqlaydi va uni o'qiy olmaydi, qurilmadagi holat esa o'sha zaxiradan tiklanadi.

Maket: `~/plato-maket.html` (repoda emas). Yonma-yon skrinshot: `OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs` → `plato-maket-1|2-<tema>.png`.

## Ma'lumot manbalari (ilovada)
| Nima | Qayerda |
|---|---|
| Vazn | `st.weights = [{d, kg}]` (Tarix → «Vazn qo'shish») |
| Maqsad, bo'y, yosh, jins, faollik | `st.profile` (`goal`: `lose`/`slow` — ozish, `keep`, `gain`) |
| Kunlik limit | `S.plan()`: Mifflin–St Jeor × faollik (TDEE) + maqsad deltasi (−550 / −275 / 0 / +275). Pastki chegara: `S.FLOOR` (erkak 1500, ayol 1200) |
| Qadam | `st.days[d].steps` — har kun saqlanadi (Android: sensor / Health Connect; iPhone veb'da yo'q) |
| Ovqat | `st.days[d].food[]` — `meal` (b/l/d/s), `kcal`, `p`, `f`, `c` |
| Mashg'ulot | **yozuvi yo'q** — 5-sabab (mashg'ulot kunlari) hozircha hisoblanmaydi |

## Formulalar
- **Trend (v47).** Holt ikki parametrli silliqlash: daraja L + tezlik T (kg/kun). Oraliq dt kun bo'lsa: `A = 1 − 0,8^dt`, `B = 1 − 0,92^dt`, bashorat `L + T·dt`.
  - Yolg'iz sakrash: bashoratdan farq > 2σ bo'lsa va keyingi o'lchov shu tomonda tasdiqlamasa, farq ±0,3σ gacha cheklanadi. Tasdiqlansa (haqiqiy o'zgarish) ±3σ gacha qabul qilinadi.
  - σ — so'nggi 12 bashorat xatosining robust bahosi (1,48 × mediana), kamida 0,3 kg.
  - Trend har ochilishda butun qatordan qayta hisoblanadi, shuning uchun «keyingi o'lchov» bilan tekshirish mumkin.
  - **Nega Holt:** v46 dagi EMA (alfa 0,1) doimiy ozishda 0,6–0,7 kg orqada qolardi. Natijada katta raqam tarozidagidan yuqori chiqardi.
  - 14–21 kunlik og'irlikli chiziqli regressiya ham sinaldi. U ham orqada qolmaydi, lekin oxirgi nuqtaning ta'siri juda katta: bitta +1,5 kg sakrash trendni 0,3–1,2 kg ko'tardi (robust og'irlik bilan ham). Shuning uchun Holt tanlandi.
  - Sinov qatori: 70 kun, haftasiga −0,56 kg, ±0,5 kg shovqin, 30 tasodifiy qator. Natijalar:

    | Tortish | O'rtacha og'ish (EMA) | +1,5 kg sakrash: o'rtacha (eng yomoni) | Plato xatosi |
    |---|---|---|---|
    | Har kuni | 0,03 (0,69) | 0,03 (0,30) | 0,12 kg |
    | 2 kunda | 0,02 (0,65) | 0,07 (0,54) | 0,14 kg |
    | 3 kunda | 0,04 (0,62) | 0,16 (0,74) | 0,15 kg |

  - Shovqinsiz qatorda trend tarozi bilan teng (≤ 0,1 kg). Oxirgi o'lchov sakrash bo'lsa trend ≤ 0,3 kg ko'tariladi. Tasdiqlangan −2 kg o'zgarish qabul qilinadi.
- **Davr sarlavhasi.** O'zgarish = trend(oxiri) − trend(davr boshi). Haftalik tezlik = o'zgarish ÷ kunlar × 7.
- **«1-hafta: suv».** Kamida 14 kunlik tarix bo'lishi kerak. Birinchi 10 kunda xom vazn ≥ 1 kg tushgan va bu tezlik keyingi trend tezligidan ≥ 1,5 barobar katta bo'lsa belgilanadi. Izoh bir marta chiqadi (`prefs.plato.water`).
- **Shart.** Faqat ozish maqsadida ishlaydi. Kerak: ≥ 21 kun foydalanish, so'nggi 28 kunda ≥ 3 vazn yozuvi (oraliq ≥ 14 kun) va ≥ 10 kun ovqat yozuvi. Yetmasa, aniq nima yetishmasligi aytiladi.
- **Kutilgan.** Yozilgan kunlardagi `Σ(TDEE + ortiqcha qadam krediti − yozilgan kkal)` ning o'rtachasi × davrdagi kunlar ÷ 7 700. Bu hisob limit hisobi bilan bir xil (`S.plan().tdee`, `S.stepCredit`).
- **Haqiqiy.** Trend o'zgarishi (Holt). Haftalik tezlik ham shu trenddan olinadi. Farq kkal/kun ko'rinishida beriladi: `(haqiqiy − kutilgan) × 7 700 ÷ kunlar`.
- **Sabablar** kkal/kun ta'siri bo'yicha saralanadi, ko'pi bilan 3 tasi ko'rsatiladi. Oqsil va defitsit kkal emas, shuning uchun ular oxirida turadi.
  1. **Qadam kamaydi.** Faqat qadam ma'lumoti bo'lsa (har yarimda ≥ 5 kun). Birinchi 14 kun o'rtachasi so'nggi 14 kundan ≥ 1 000 ko'p bo'lsa. Ta'sir: `Δqadam × bo'y × 0,415 ÷ 1000 × vazn × 0,5` kkal.
  2. **Yozilmagan ovqatlar.** Odatda yeyiladigan (≥ 50% kunda) ovqat vaqti yozilmagan kunlar (≥ 3), ustiga kun jami limitning 60% idan past bo'lgan kunlar qo'shiladi. Ta'sir: `kunlar × shaxsiy o'rtacha ÷ 28` (past kunlarda: to'liq kun o'rtachasigacha bo'lgan farq).
  3. **Dam olish kunlari.** Shanba–yakshanba o'rtachasi ish kunlaridan ≥ 300 kkal ko'p bo'lsa. Ta'sir: `farq × 2 ÷ 7`.
  4. **Oqsil kam.** O'rtacha < 1,2 g/kg. Hisob vazni: maqsad vazni; u bo'lmasa va BMI > 25 bo'lsa — BMI 25 dagi vazn; aks holda joriy vazn. «58 / 100 g» ko'rinishida beriladi.
  6. **Rejadagi defitsit < 250 kkal.** Maqsadni ko'rib chiqish taklif qilinadi. Limit pastki chegarada bo'lsa: «kamaytirmaymiz».
  - **Porsiya taxminiy.** Bu qo'shimcha sabab. Tushuntirilmagan farq ≥ 200 kkal/kun bo'lsa qo'shiladi: chamalangan porsiya, yog', ichimlik. Matn ayblovsiz.
  - Hech narsa topilmasa: «Hammasi to'g'ri ketyapti… sabr qiling».
- **Xavfsizlik.**
  - So'nggi 3 haftada trend haftasiga vaznning > 1% idan tez tushsa yoki yozilgan kunlarning ≥ 70% ida iste'mol < pastki chegara × 0,8 bo'lsa: tahlil o'rniga yumshoq ogohlantirish va «Limitni oshirish» (Profil → maqsad).
  - Hech qachon kaloriyani kamaytirish taklif qilinmaydi.
  - Limit pastki chegaradan past tavsiya qilinmaydi (`tools/test-plato-core.js` 5-guruh).
- **«Shu hafta sinab ko'ring».**
  - Ish sababga qarab tanlanadi: qadam → yurish, yozilmagan → shu ovqatni ovoz bilan yozish, dam olish → reja, oqsil → nonushtaga tvorog/tuxum, defitsit → maqsad, porsiya → tarozida tortish.
  - Ro'yxat ≤ 3 gacha to'ldiriladi: yurish, tortish, uyqu.
  - Belgilar hafta bo'yicha saqlanadi (`prefs.plato.c`, `wk`).
- **«Eslatib turilsin».** Android ilovada haftalik lokal bildirishnoma beriladi (`id 7003`, ertangi kun soat 12:00, `?plato=1`). Aks holda ilova ochilganda kuniga bir marta «Bu hafta: …» xabari chiqadi. Push yuborilmaydi.
- **«Haftangiz».** Oxirgi slaydda bir marta eslatma chiqadi (`prefs.plato.hk`). Shart: holat «sekin», davr ≥ 14 kun va haftasiga < 0,1 kg yoki kutilganning yarmidan kam.
- **Statistika (anonim).** `plato_ochildi` (holat), `plato_sabab` (sabab turi), `plato_belgi` (ish turi). Vazn va kkal yuborilmaydi.

## Manbalar (raqamlar tekshirildi)
- **7 700 kkal/kg.** Hall K. D. *What is the required energy deficit per unit weight loss?* Int J Obes 2008;32:573–576.
  - Qoida (3 500 kkal/funt) ortiqcha vaznli odamda o'rtacha to'g'ri. Kam yog'li odamda kerakli defitsitni oshirib ko'rsatadi, shuning uchun «taxminiy» deb yozilgan.
  - https://pubmed.ncbi.nlm.nih.gov/17848938/
- **Yurish ≈ 0,5 kkal/kg/km (sof sarf).** ACSM yurish tenglamasi: gorizontal komponent 0,1 ml O₂/kg/m. 1 km uchun bu 100 ml/kg ni beradi; 1 l O₂ ≈ 5 kkal bo'lgani uchun ≈ 0,5 kkal/kg/km chiqadi. Ilovaning mavjud qadam krediti (`MET_NET 2,5 × vazn × km/5`) ham xuddi shu qiymatni beradi.
  - https://www.depts.ttu.edu/ksm/_documents/grad/acsm_comps/6c-23-2013_HFI_Metabolic_Calculations.pdf
- **Qadam uzunligi ≈ bo'y × 0,415** (ayolda 0,413). Pedometrlarda keng qo'llanadigan baho, rasmiy standart emas.
  - https://steps.app/support/pedometer/android/health-metrics-and-goals/how-does-stepsapp-calculate-my-distance
- **Oqsil 1,2–1,6 g/kg.**
  - Morton R. W. va boshq. Br J Sports Med 2018;52:376: > ~1,6 g/kg dan ortig'i mushakka qo'shimcha foyda bermaydi. https://bjsm.bmj.com/content/52/6/376
  - Hector A. J., Phillips S. M. IJSNEM 2018;28:170–177: kaloriya kam paytida sportchilarga 1,6–2,4 g/kg.
  - Biz pastki chegara sifatida 1,2 g/kg ni olamiz.
- **Dietada harakat (NEAT) kamayadi.**
  - Rosenbaum M., Leibel R. L. *Adaptive thermogenesis in humans.* Int J Obes 2010;34(S1):S47–S55.
  - Kalamushlarda ham shu ko'rinadi: Almundarij va boshq., Physiol Rep 2017. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5328781/
  - Odamda qadamni bevosita o'lchagan tadqiqot topilmadi, shuning uchun matnda «ko'p uchraydigan sabab» deb yozilgan (aniq ulush aytilmaydi).
- **Dam olish kunlari ko'proq yeyiladi.** Racette S. B. va boshq. Obesity 2008: shanba kuni o'rtacha 2 257 kkal, ish kunlari 2 021 kkal; kaloriya cheklash guruhida dam olish kunlari ozish to'xtagan. https://source.washu.edu/2008/07/weekend-eating-slows-weight-loss-researchers-find/
- **O'zi yozganda ovqat kam yoziladi.** Ravelli M. N., Schoeller D. A. Front Nutr 2020;7:90. https://www.frontiersin.org/journals/nutrition/articles/10.3389/fnut.2020.00090/pdf

## Testlar
- `node tools/test-plato-core.js` (`--only plato-core`): trend, suv, har sabab uchun sintetik foydalanuvchi, holatlar, xavfsizlik, qadamsiz holat, maqsadlar.
- `node tools/dizayn/test-plato.mjs` (`--only plato`): Tarix kartasi, oyna, checklist va eslatma, tortib yopish, holatlar, Imkoniyatlar, «Haftangiz», 360 px × 115% × RU/ЎЗ × tungi.
- Sintetik foydalanuvchilar: `tools/dizayn/plato-demo.cjs`. Ular energiya balansidan yasalgan, «yashirin» iste'mol ham hisobga olingan.
