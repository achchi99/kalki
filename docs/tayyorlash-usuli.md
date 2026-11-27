# Tayyorlash usuli (v107)

Bitta taomning kaloriyasi pishirish usuliga qarab ancha farq qiladi: masalan, tovuq kotleti tovada 211 kkal, aerogrilda 145 kkal (100 g uchun).
v107 dan boshlab usulga bog'liq taomlarda porsiya oynasida **«Tayyorlash usuli»** chiplari chiqadi. Chiplar faqat shu taomga mos usullardan iborat va o'raladi (320 px da ham sig'adi).
Usul tanlansa, kkal va BJU darhol qayta hisoblanadi. Tanlangan usul yozuvda saqlanadi (`vr`) va ro'yxatda ko'rinadi: «Tovuq kotleti · aerogril».
Shu taom keyingi safar ochilganda oxirgi tanlangan usul qo'yiladi. Avval tanlanmagan bo'lsa, eng ko'p ishlatiladigan usul (`d`) qo'yiladi.

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `data/baza-usul.json` | Usullar (nom, chip, ro'yxat yorlig'i, uz/ru/en sinonimlari), tartib, mahsulot sinflari (Y/A/FR) va qaysi taomga qaysi usullar berilishi |
| `tools/usul-yasa.js` | Build bosqichi (`tools/ovqatlar-build.js` ichida): usulli oilalarni yaratadi, kataklarni hisoblaydi, tartibni tekshiradi (buzilsa build yiqiladi) |
| `data/ovqatlar.json` | Natija: `fam.ax` dagi `usul` o'qi (`m:1`, har variantda `u`), `g[...]` dagi `us` (hisob manbasi usuli), `us` — qidiruv lug'ati |
| `assets/kalkifit-core.js` | `usulQ` (iboradan usul so'zini ajratadi), `usulPick`, `usulAx`, `parseText` (matn, ovoz, AI) |
| `assets/kalkifit-app.js` | `usulChips` (chiplar), `usulFirst`/`pickU` (qidiruv), `pwApplyLast` (eslab qolish) |
| `tools/test-usul.js`, `tools/dizayn/test-usul-ui.mjs` | Testlar: tartib, model, qamrov, qidiruv; UI, eslab qolish, 320 px |

## Hisob qoidasi

Har taomda bitta **langar** katak bor. Bu — bazadagi mavjud qiymat (yorliq, USDA yoki avvalgi alohida taom, masalan `tovuq-kokrak-qov` 187 kkal). Langar qiymati o'zgarmaydi.
Boshqa usullar langardan quyidagicha hisoblanadi: avval xom holatga qaytariladi, keyin maqsad usuli qo'llanadi.

Belgilar: `Y` — pishgandan keyingi og'irlik ulushi (yield, xomdan), `A` — 100 g tayyor taomga shimiladigan yog' (g), `FR` — mahsulotning o'z yog'idan qolgan ulush.

```
A0   = min(A[m0], f0 × ulush)            // langarda shimilgan yog' (xamir/qiyma sinflarida ko'pi bilan 60 %)
fXom = (f0 − A0) × Y[m0] / FR[m0]        // 100 g xom mahsulotning o'z yog'i
nf   = (k0 − 9·f0) × Y[m0]               // yog'siz energiya (oqsil + uglevod), xom holatda
f    = fXom × FR[m] / Y[m] + A[m] × A0/A[m0]
k    = nf / Y[m] + 9·f
p, c, kletchatka — × Y[m0] / Y[m]  (suv bug'lanishi yoki shimilishi bo'yicha konsentratsiya)
```

Yog' shimilishi (`A`, g/100 g tayyor taom), mahsulot sinfiga qarab:

| Usul | Talab qilingan oraliq | Sinflarda |
|---|---|---|
| Chuqur yog'da (fri) | 10–15 | 12–13 (panirovka 12) |
| Tovada qovurilgan | 5–10 (panirovka/kotlet ko'proq) | 5–9 (kotlet 8, xamir/chuchvara 9) |
| Duxovkada | 1–3 | 1–3 |
| Aerogrilda | 0–2 | 0,5–2 |
| Bug'da / qaynatilgan | 0 | 0 |
| Grilda / mangalda | — | 0–1,5 (yog' oqib ketadi) |

Sinflar: parranda, kotlet, qiyma (go'shtli patti: yog' erib chiqadi), baliq (file), kartoshka, xamir (somsa, pirojki), chuchvara (chuchvara, manti), sabzavot, panirovka (naggets), sirniki, kabob. Har sinfning `Y`, `A`, `FR` qiymatlari `data/baza-usul.json` → `sinf` da.

**Mantiq testi** (build va `test-usul`): har usulli taomning har kombinatsiyasida kkal tartibi
`chuqur yog' > tova > duxovka ≥ aerogril ≥ bug'/qaynatish` bo'ladi (birinchi ikki solishtirish qat'iy).
Build vaqtida 30 ta taomda 45 ta kombinatsiya tekshiriladi.

## Qamrov (v107)

30 ta taom yoki oila. Qalin — standart usul. Qiymatlar kkal/100 g.

| Guruh | Taomlar |
|---|---|
| Kotletlar (5) | Tovuq kotleti, kurka kotleti, aralash qiymali kotlet, mol go'shti kotleti, baliq kotleti |
| Tovuq qismlari (5) | Ko'krak, son, qanotchalar, boldir; kurka ko'kragi |
| Baliq filesi (5) | Losos, forel, treska, mintay, xek |
| Kartoshka (1) | Qaynatilgan · pyure · tovada · fri · duxovka · aerogril |
| Xamir (3) | Somsa (tandir · duxovka · tova), pirojki (tova · fri · duxovka · aerogril), sirniki (tova · duxovka · aerogril) |
| Chuchvara (2) | Chuchvara (qaynatma · sho'rvada · qovurma · bug'da), manti (bug'da · qaynatilgan · tova) |
| Tuxum (1) | Qaynatilgan · tova · omlet · yog'siz tova (mavjud oila bog'landi) |
| Sabzavot (4) | Brokkoli, gulkaram, qovoqcha, baqlajon (qaynatilgan · bug'da · grilda · duxovka · aerogril · tova) |
| Fastfud (1) | Naggets (fri · tova · duxovka · aerogril) |
| Kabob (3) | Shashlik (mangal · duxovka · aerogril · tova), lyulya, jigar kabob |

| Taom | Usullar |
|---|---|
| Tovuq kotleti | **tovada 211** · duxovka 155 · aerogril 145 · bug'da 129 |
| Kurka kotleti | **tovada 216** · duxovka 166 · aerogril 158 · bug'da 141 |
| Kotlet (aralash qiyma) | **tovada 230** · duxovka 171 · aerogril 161 · bug'da 144 |
| Mol go'shti kotleti | **gril 250** · tovada 302 · duxovka 262 · aerogril 253 · bug'da 244 |
| Baliq kotleti | **tovada 164** · duxovka 137 · aerogril 132 · bug'da 120 |
| Tovuq ko'kragi | **qaynatilgan 150** · bug'da 145 · duxovka 165 · aerogril 156 · gril 154 · tovada 187 |
| Tovuq soni (terili) | **duxovka 210** · aerogril 198 · gril 193 · tovada 250 · qaynatilgan 184 |
| Tovuq qanotchalari | **tovada 290** · duxovka 254 · aerogril 241 · gril 233 · qaynatilgan 227 |
| Tovuq boldiri (terili) | **duxovka 191** · aerogril 180 · gril 174 · tovada 268 · qaynatilgan 166 |
| Kurka ko'kragi | **duxovka 147** · aerogril 138 · gril 137 · tovada 183 · qaynatilgan 124 · bug'da 119 |
| Losos | **duxovka 205** · aerogril 194 · gril 191 · tovada 246 · bug'da 175 · qaynatilgan 178 |
| Forel | **duxovka 168** · aerogril 158 · gril 156 · tovada 207 · bug'da 139 · qaynatilgan 142 |
| Treska | **duxovka 105** · aerogril 101 · tovada 123 · bug'da 88 · qaynatilgan 90 |
| Mintay | **duxovka 111** · aerogril 106 · tovada 133 · bug'da 92 · qaynatilgan 94 |
| Xek | **duxovka 116** · aerogril 108 · tovada 147 · bug'da 93 · qaynatilgan 95 |
| Kartoshka | **qaynatilgan 85** · pyure 110 · tovada 146 · fri 310 · duxovka 136 · aerogril 127 |
| Naggets | **fri 250** · tovada 216 · duxovka 193 · aerogril 186 |
| Sirniki | **tovada 220** · duxovka 187 · aerogril 181 |
| Pirojki | **tovada 290** · fri 324 · duxovka 236 · aerogril 228 |
| Somsa (go'shtli) | **tandir 296** · duxovka 305 · tova 362 |
| Manti | **bug'da 226** · qaynatilgan 217 · tova 342 |
| Chuchvara | qaynatma 254 · **sho'rvada 104** · qovurma 301 · bug'da 264 |
| Tuxum | **qaynatilgan 155** · tovada 190 · omlet 185 · yog'siz 143 |
| Shashlik | **mangal 240** · duxovka 259 · aerogril 246 · tova 299 |
| Lyulya kabob | **mangal 250** · duxovka 270 · aerogril 257 · tovada 312 |
| Jigar kabob | **mangal 190** · duxovka 206 · tovada 242 |
| Brokkoli | **qaynatilgan 35** · bug'da 35 · duxovka 71 · aerogril 58 · gril 55 · tovada 114 |
| Gulkaram | **qaynatilgan 23** · bug'da 23 · duxovka 56 · aerogril 43 · gril 41 · tovada 99 |
| Qovoqcha | **qaynatilgan 15** · bug'da 15 · gril 31 · duxovka 46 · aerogril 33 · tovada 125 |
| Baqlajon | **qaynatilgan 35** · bug'da 35 · gril 55 · duxovka 71 · aerogril 58 · tovada 170 |

Avvalgi alohida taomlar endi oila varianti (alias, qidiruvda yashirin). Ular bilan yozilgan eski yozuvlar o'sha qiymat bilan ochiladi:
`tovuq-kokrak-qov`, `tovuq-kokrak-duxovka`, `tovuq-qanot-duxovka`, `tovuq-boldir-qov`, `qovoqcha-qovurilgan`, `baqlajon-qovurilgan`, `tuxum-qov-yogsiz`.

Avtomatik qidiruv: build nomi yoki sinonimida usul so'zi bor taomlarni (qovurilgan, duxovka, bug'da, fri, grill…) va usulsiz «egizagi» bor taomlarni topadi.
Topilganlardan alohida retsept bo'lganlari (masalan, «Qovurilgan sazan», «Tovuq qanoti grilda (choyxona)») alohida qoldirildi: qidiruvda nomi aynan yozilsa, o'sha taom tanlanadi.
Yangi taom qo'shish: `data/baza-usul.json` → `guruhlar` ga `{id, g, sinf, d, usul:[…], langar?:{usul: id}}` qo'shing, keyin `node tools/ovqatlar-build.js`.

## Qidiruv

Usul so'zi iboradan ajratib olinadi (`usulQ`, butun so'z, eng uzun sinonim). Taom usul so'zisiz qidiriladi va topilgan oilada shu usul bo'lsa, u tanlanadi.
- uz: aerogril/aerogrilda, duxovka/duxovkada/pishirilgan, bug'da, qaynatilgan/qaynatma, qovurilgan/tovada, fri, grilda, mangalda, tandirda;
- ru: аэрогриль/в аэрогриле, аэрофритюрница, в духовке/запечённый, на пару, отварной/варёный, жареный/на сковороде, во фритюре, на гриле, на мангале;
- en: air fryer/airfryer, baked, steamed, boiled, fried, grilled.

«tovuq kotlet aerogril» → Tovuq kotleti, aerogril. AI (rasm, matn) ga usulni qavsda yozish so'ralgan: «Tovuq kotleti (aerogrilda)» — xuddi shu yo'l bilan tanlanadi. Ovozli kiritish ham `parseText` dan o'tadi.

## Manbalar

- USDA ARS. *USDA Table of Cooking Yields for Meat and Poultry*, Release 2 (2014) — `Y` (go'sht, parranda, kotlet, kabob).
- USDA ARS. *USDA Table of Nutrient Retention Factors*, Release 6 (2007) — oqsil/yog' saqlanishi, `FR`.
- Bognár A. *Tables on weight yield of food and retention factors of food constituents for the calculation of nutrient composition of cooked foods (dishes)*. BFE-R-02-03, Bundesforschungsanstalt für Ernährung, Karlsruhe (2002) — usullar bo'yicha `Y` va yog' shimilishi (qovurish, fri, duxovka, bug').
- Teruel M.R. et al. *Kinetics of oil uptake and moisture loss during air frying of French fries*. J Food Sci 80(2):E349–E358 (2015) — aerogril va chuqur yog'da qovurishdagi yog' farqi.
- Reinivuo H., Laitinen K. *Proposal for the harmonisation of recipe calculation procedures*. EuroFIR (2007) — retsept hisoblash usuli (yield + retention, yog' shimilishi).
- Bazadagi langar qiymatlari: USDA FoodData Central (SR Legacy / FNDDS) va mahsulot yorliqlari (`f.ms`).
