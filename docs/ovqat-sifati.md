# KalkiFit — «Ovqatlanish sifati» (v103)

Kaloriya — qancha yeganingiz; sifat — **nima bilan** to'ldirganingiz. Kod: `assets/kalkifit-sifat.js` (sof funksiyalar), ilova: `assets/kalkifit-app.js` (`sqIn`, `openSifat`, `tlSqHtml`, `swLines`, `fixPlan`), matnlar: `data/maslahatchi-matn.json` (`ef_*`, `fx_*`, `sw_*`, `pt_*`, `rep_dish`). Testlar: `tools/test-sifat.js`, `tools/dizayn/test-sifat-ui.mjs`.

## Ilmiy chegara (majburiy)
Bir xil kaloriyada makro tarkibi **tarozidagi vazn yo'qotishni deyarli o'zgartirmaydi** (Hall & Guo 2017; Hall va boshq. 2015). Shuning uchun ilova hech qachon «yog' tufayli X kg kam ozdingiz» kabi raqam chiqarmaydi — `tools/test-sifat.js` barcha matnlarni taqiqlangan iboralarga tekshiradi.
Ko'rsatiladigan oqibatlar (hammasi «taxminan / ehtimol» ohangida, diagnoz emas):
1. **Yo'qotilgan vazn tarkibi** — kaloriya tanqisligida oqsil yetarli bo'lmasa, yo'qotilgan vaznning ko'proq qismi mushak (yog'siz massa) bo'lishi mumkin.
2. **To'qlik/ochlik** — oqsil va kletchatka to'qlik beradi; yog' va shakar ko'p bo'lsa to'qlik tez o'tadi, kechqurun yoki ertasi kuni ortiqcha yeyish ehtimoli oshadi.
3. **Energiya/kuch** — oqsil kam, tez uglevod ko'p kunlarda energiya tebranishi.
4. **Uzoq muddatli salomatlik** — to'yingan yog' ulushi, kletchatka.

## Kunlik bal (0–100)
| Komponent | Ochko | Qoida |
|---|---|---|
| Oqsil | 30 | 30 × min(1, oqsil / maqsad). Maqsaddan oshish jarima emas |
| Yog' | 20 | ≤ 115 % maqsad — 20; 115–160 % — 20 → 0 chiziqli; 160 %+ — 0; < 50 % maqsad — 20 × ulush / 0,5 |
| Kletchatka | 20 | 20 × min(1, g / me'yor), me'yor = max(25 g, 14 g / 1000 kkal). Taomlarning yarmidan ko'pida ma'lumot yo'q bo'lsa — hisobga olinmaydi, qolganlari 100 ga keltiriladi |
| Kaloriya rejasi | 20 | \|yeyilgan − reja\| / reja ≤ 10 % — 20; ≥ 35 % — 0; orasi chiziqli. Xavfsiz minimumdan kam — ko'pi bilan 5 |
| Muntazamlik | 10 | Ovqat vaqtlari (nonushta, tushlik, kechki, tamaddi): 3+ — 10, 2 — 6, 1 — 3 |

«To'liq kun» — kamida 2 yozuv va reja kaloriyasining ≥ 50 %. Haftalik bal — to'liq kunlar o'rtachasi. «i» oynasida har komponentning ochkosi ko'rinadi.

## Haftalik xulosa
- Kaloriya: reja ichida (xavfsiz minimum … reja + 10 %), ortiq (> reja + 10 %), juda kam (< xavfsiz minimum) kunlar soni.
- Tarkib: oqsil < 90 % maqsad kunlar, yog' ≥ 115 % maqsad kunlar.
- Vazn (v104): **trend**, haftalik farq emas — tarozi bir haftada suv, tuz va ichakdagi ovqat hisobiga ±1 kg tebranadi. Oxirgi 28 kun ichidagi yozuvlar (bir kunda bir nechta — oxirgisi), kamida **4 ta** va birinchi–oxirgi orasi **≥ 14 kun** bo'lsa — chiziqli regressiya (eng kichik kvadratlar); o'zgarish = qiyalik × oraliq. Kam bo'lsa — `sw_kam` (nima kerakligi), yozuv yo'q — `sw_now`. Vazn qatori bilan birga doim `sw_suv` izohi («±1 kg suv, shuning uchun 2+ hafta trendi»).
- Mushak ulushi — faqat trend bo'yicha yo'qotish **≥ 0,5 kg** bo'lsa (aks holda `sw_flat` — umumiy tushuntirish). Oqsil kam kunlar (< 90 % maqsad) ulushi **shu trend davri** bo'yicha (bitta hafta emas): yarmi yoki ko'pi — **≈ 25–30 %** (`sw_mus`, me'yordagi oqsil bilan solishtiruv), aks holda **≈ 10–15 %** (`sw_mus_ok`). Raqamlar 0,1 kg ga yaxlitlanadi: ikkalasi 0,1 dan kam — «juda oz» / «совсем немного»; pastkisi 0,1 dan kam — «0,1 kg gacha»; bir xil — «~0,3 kg». Umumiy vazn o'zgarishi haqida «oqsil tufayli ko'proq ozardingiz» degan gap yo'q.

## Shaxsiy naqshlar (kamida 14 to'liq kun)
- «Yog' ko'p kundan keyin kaloriya oshishi»: yog' ≥ 115 % bo'lgan kunlardan keyingi kun > reja + 10 % holatlari. Ko'rsatiladi, agar n ≥ 4, ulush ≥ 60 % va boshqa kunlardan keyingi ulushdan ≥ 25 punkt yuqori.
- «Oqsil yetarli kunlari kechki ovqat kichikroq»: oqsil ≥ maqsad va < 90 % kunlarning kechki ovqat kaloriyasi o'rtachalari farqi ≥ 150 kkal, har guruhda ≥ 4 kun.
Kam ma'lumotda chiqarilmaydi; matnda «sizning ma'lumotingiz bo'yicha».

## Takroriy taom
Oxirgi 7 kunda bitta taom ≥ 3 marta va yog' oshgan kunlarning ≥ 2 tasida yog'ning asosiy manbai (≥ 40 %) bo'lsa — yumshoq izoh va bazadan 2–3 muqobil: shu guruh va tur, yog'i ≥ 30 % kam, o'zbek taomlari birinchi. Taqiqlanmaydi, ayblanmaydi.

## Darhol tushuntirish (maslahatchi kartasi)
Yog' oshdi (`a`), uglevod ko'p/oqsil kam (`b`), kechqurun oqsil kam (`c`), yog' ulushi > 45 % (`d`): 1-jumla — nimaga ta'sir qiladi (`ef_*`), 2-jumla — kunning qolganini qanday to'g'irlash (`fx_*`, bazadagi aniq taom va gramm: oqsil misoli `protEx` + 150 g sabzavot).

## Manbalar
- Hall KD, Guo J. Obesity energetics: body weight regulation and the effects of diet composition. *Gastroenterology*. 2017;152(7):1718–1727.
- Hall KD va boshq. Calorie for calorie, dietary fat restriction results in more body fat loss than carbohydrate restriction in people with obesity. *Cell Metab*. 2015;22(3):427–436.
- Weinheimer EM, Sands LP, Campbell WW. A systematic review of the separate and combined effects of energy restriction and exercise on fat-free mass in middle-aged and older adults. *Nutr Rev*. 2010;68(7):375–388 (faqat parhezda yo'qotilgan vaznning ≈ 24 % i — yog'siz massa).
- Krieger JW va boshq. Effects of variation in protein and carbohydrate intake on body mass and composition during energy restriction: a meta-regression. *Am J Clin Nutr*. 2006;83(2):260–274.
- Pasiakos SM va boshq. Effects of high-protein diets on fat-free mass and muscle protein synthesis following weight loss. *FASEB J*. 2013;27(9):3837–3847.
- Longland TM va boshq. Higher compared with lower dietary protein during an energy deficit combined with intense exercise promotes greater lean mass gain and fat mass loss. *Am J Clin Nutr*. 2016;103(3):738–746.
- Leidy HJ va boshq. The role of protein in weight loss and maintenance. *Am J Clin Nutr*. 2015;101(6):1320S–1329S.
- Slavin JL. Dietary fiber and body weight. *Nutrition*. 2005;21(3):411–418.
- Reynolds A va boshq. Carbohydrate quality and human health: a series of systematic reviews and meta-analyses. *Lancet*. 2019;393(10170):434–445.
- WHO. Saturated fatty acid and trans-fatty acid intake for adults and children: WHO guideline. 2023 (to'yingan yog' < 10 % energiya).
- Institute of Medicine. Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids. 2005 (kletchatka 14 g / 1000 kkal).
