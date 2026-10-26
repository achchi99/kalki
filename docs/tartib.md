# «Mening tartibim» va «Oqsil maqsadi» (KalkiFit, v48)

Maket: `~/tartib-maket.html` (repoda emas). Yonma-yon skrinshot: `OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs` → `tartib-maket-1|2-<tema>.png`.

## Nima va nega
Ozishni **kunlik jami kaloriya** hal qiladi. Ovqat vaqti va soni (nonushta qilish yoki qilmaslik, kechki ovqat) teng kaloriya va oqsilda natijani deyarli o'zgartirmaydi. Eng muhim omil — rejaga amal qila olish. Shuning uchun odam o'ziga qulay tartibni tanlaydi, ilova esa faqat **o'sha limitni** ovqatlarga bo'lib beradi.

Ko'p odam kechqurun ko'proq och bo'ladi va ko'proq yeydi. Bu tabiiy. Uni taqiqlash o'rniga, budjetni oldindan kechqurunga qoldirgan yaxshiroq («Kechqurun ko'p yeyman»).

## Variantlar (nonushta / tushlik / kechki / tamaddi)
| Kalit | Nomi | Ulush |
|---|---|---|
| `std` (standart) | 3 mahal | 30 / 35 / 25 / 10 |
| `kech` | Kechqurun ko'p yeyman | 15 / 30 / 45 / 10 |
| `nobf` | Nonushta qilmayman | 0 / 40 / 45 / 15 |
| `erkin` | Erkin | taqsimot yo'q, faqat kunlik jami (avvalgi xatti-harakat) |

Saqlanadigan joy: `st.profile.tartib` (akkaunt zaxirasiga profil bilan birga tushadi). `S.migrate` noto'g'ri qiymatni tashlaydi. Eski foydalanuvchida maydon bo'lmasa — `std`.

Kirish nuqtalari:
- onboarding natijasidan keyingi ixtiyoriy 9-ekran («O'tkazib yuborish» = `std`);
- mavjud foydalanuvchiga Bugun'da bir marta karta (`prefs.ttAsked`; yopsa qaytmaydi; halqa ostidagi yagona joyda «Yemaydigan narsangiz bormi?» dan keyin);
- Profil → «Mening tartibim»;
- Imkoniyatlar → «Mening».

## Ovqat budjetlari (`S.mealBudgets`)
- **Limit.** Halqadagi bilan bir xil: me'yor + ortiqcha qadam krediti. Taqsimot butun sonlarda, yig'indisi aynan limitga teng (eng katta qoldiq usuli).
- **Vaqt chegaralari** (`S.MEAL_END`): nonushta 10:30 gacha, tushlik 15:30 gacha, kechki ovqat 23:00 gacha. Tamaddi butun kun bo'ladi, faqat 23:00 dan keyin «hozir» bo'ladi.
  - «Hozir» degan ovqat vaqti `S.mealByHour` dan olinadi (sozlanmaydi): 05:00–10:30 nonushta, 10:30–15:30 tushlik, 15:30–18:00 tamaddi, 18:00–23:00 kechki ovqat.
- **Qoldiq o'tkazish:**
  - O'tib ketgan ovqat vaqtidagi farq (tejalgan +, oshgan −) hali o'tmagan keyingi ovqatlarga ulushiga qarab o'tadi. Hozirgi yoki keyingi ovqatda budjet oshsa, ortig'i darhol keyingilardan olinadi. Budjet hech qachon 0 dan past bo'lmaydi.
  - Ulushi 0 bo'lgan ovqat (nonushtasiz tartibda nonushta) yozilsa, farq avval **tushlikdan** olinadi.
  - Izoh «Nonushta va tushlikdan tejalgan N kkal kechki ovqatga o'tdi» faqat hozirgi ovqatga ≥ 50 kkal kelganda chiqadi.
- **Ko'rinish:**
  - «280 / 330 kkal» va ingichka chiziq;
  - hozirgi ovqat — «hozir» belgisi va «Sizga N kkal qoldirilgan»;
  - budjetdan oshganda yumshoq «+N kkal kechki ovqatdan olindi» (qizil rang yo'q);
  - kunlik jami oshsa, budjetlar ko'rsatilmaydi (avvalgidek).
- «Nonushta qilmayman»da bo'sh nonushta kartasi umuman chiqmaydi. «Erkin»da hammasi avvalgidek.

## Oqsil maqsadi (`S.protein`)
- 1,6 g/kg (ozish, sekin ozish, vazn olish), 1,2 g/kg (saqlash; 18 yoshgacha, homiladorlik va kam BMI da ham saqlash rejimi).
- Kg: BMI > 27 bo'lsa bo'ydan hisoblangan tavsiya vazni (BMI 25), aks holda joriy trend vazni (`KalkiPlato.summary`).
- Yuqori chegara 2,2 g/kg. 10 g ga yaxlitlanadi. Profil'da qo'lda 60–250 g (`profile.protG`, 10 g qadam), «Avtomatik» bilan qaytariladi.
- Plato tahlili («Nega sekin ozyapman?») **shu funksiyadan** foydalanadi. O'rtacha oqsil maqsadning 85% idan past bo'lsa, sabab chiqadi. «Nonushta qilmayman» tanlanganda «nonushta yozilmagan» sababi chiqmaydi.
- `S.plan().macros`: oqsil shu maqsad, yog' 27,5% (≥ 20% shartiga mos), uglevod qolgani.
- **Bugun kartasi** (oldingi BJU qatori shu kartaga birlashdi):
  - «Oqsil 62 / 110 g» va ko'k chiziq;
  - maslahat: qolgan oqsil hozirgi yoki keyingi ovqat vaqtiga kkal budjeti ulushida taqsimlanadi, misol bazadan olinadi va gramm hisoblanadi (50–250 g). Misol kunga qarab almashadi, «Yemaydiganlarim» hisobga olinadi;
  - yog' plitkasi: kaloriyaning ≥ 20% bo'lsa ✓, aks holda yumshoq eslatma;
  - uglevod plitkasi: «erkin».
- «Haftangiz» oxirgi slaydida: «Bu hafta N kun oqsil maqsadiga yetdingiz».
- «Nima yesam ekan?»: holat qatori va saralash hozirgi ovqat vaqtining **qolgan budjeti** va unga tushgan oqsil ulushi bo'yicha («Kechki ovqatga 1 022 kkal va 75 g oqsil qoldi»). Kafe va menyu ro'yxati ham shu budjetdan.

## Statistika (anonim)
- `tartib_tanlandi` — tanlangan kalit.
- `tartib_kun` — faol kundagi tartib.
- `oqsil_kun` — ha/yoq: kecha oqsil maqsadiga yetildimi, kuniga bitta, faqat ≥ 2 yozuvli kunda.
- Vazn, gramm va kkal yuborilmaydi.

## Manbalar
- **Nonushta.** Sievert K. va boshq. *Effect of breakfast on weight and energy intake: systematic review and meta-analysis of RCTs.* BMJ 2019;364:l42.
  - 13 ta RCT: nonushta qiluvchilar kuniga ~260 kkal ko'p yegan; vazn farqi 0,44 kg (nonushtasizlar foydasiga). Mualliflar sifat pastligi sababli ehtiyotkorlikni tavsiya qiladi.
  - https://www.bmj.com/content/364/bmj.l42
- **Ovqat vaqti oynasi.** Liu D. va boshq. *Calorie Restriction with or without Time-Restricted Eating in Weight Loss.* NEJM 2022;386:1495–1504.
  - 12 oy, 139 kishi, kaloriya teng bo'lganda vaqt cheklovi qo'shimcha foyda bermadi (−8,0 va −6,3 kg, farq ahamiyatsiz).
  - https://pubmed.ncbi.nlm.nih.gov/35443107/
- **Kechqurun ochlik.** Scheer F. A., Morris C. J., Shea S. A. *The internal circadian clock increases hunger and appetite in the evening independent of food intake and other behaviors.* Obesity 2013;21:421–423.
  - Ochlik ertalab (~08:00) eng past, kechqurun (~20:00) eng yuqori. Kichik tadqiqot (12 kishi).
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC3655529/
- **Oqsil.**
  - Leidy H. J. va boshq. *The role of protein in weight loss and maintenance.* Am J Clin Nutr 2015;101:1320S–1329S. Kaloriya kam paytida oqsilga boy dieta vazn va yog'ni ko'proq kamaytiradi, mushakni saqlaydi, to'q tutadi. https://pubmed.ncbi.nlm.nih.gov/25926512/
    - Abstraktdagi «~1,2–1,6 g/kg» oralig'ini qidiruvda to'liq tasdiqlay olmadim, shuning uchun bu raqam ilovada Leidy nomi bilan yozilmagan.
  - Morton R. W. va boshq. Br J Sports Med 2018;52:376–384: ~1,6 g/kg dan keyin qo'shimcha foyda yo'q. Biz shu nuqtani maqsad, 2,2 g/kg ni esa yuqori chegara sifatida oldik. https://bjsm.bmj.com/content/52/6/376
- **Hazm energiyasi.** Westerterp K. R. *Diet induced thermogenesis.* Nutr Metab 2004;1:5. Oqsilni hazm qilishga eng ko'p energiya ketadi (alkogoldan keyin), yog'ga eng kam. https://pmc.ncbi.nlm.nih.gov/articles/PMC524030/
  - Aniq foizlarni manbadan tasdiqlamadim, shuning uchun ilovada foiz yozilmagan.
- **Yog' ≥ 20%.** Institute of Medicine, *Dietary Reference Intakes* (2002/2005), AMDR: kattalarda yog' 20–35%, uglevod 45–65%, oqsil 10–35%. https://www.nationalacademies.org/news/2002/09/report-offers-new-eating-and-physical-activity-targets-to-reduce-chronic-disease-risk

## Testlar
- `node tools/test-tartib-core.js` (`--only tartib-core`): taqsimot = limit, qoldiq o'tkazish (tejash, oshish, kun oxiri, nonushtasiz yozuv), oqsil (maqsadlar, BMI > 27, chegaralar, qo'lda), plato (nonushtasiz tartibda nonushta sababi yo'q), migratsiya.
- `node tools/dizayn/test-tartib.mjs` (`--only tartib`): onboarding (o'tkazib yuborish → 3 mahal), bir martalik karta, Profil, Imkoniyatlar, Bugun budjetlari va izoh, nonushtasiz, erkin, oqsil kartasi, «Nima yesam ekan?», qo'lda oqsil, «Haftangiz», 360 px × 115% × RU/ЎЗ × tungi.
