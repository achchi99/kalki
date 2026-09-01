# GSC tahlili — 2026-08 (FAZA 4.1: diagnostika)

Ushbu hisobot FAZA 4.1 doirasida tayyorlandi: **bironta kod fayli o'zgartirilmagan**. Kirish ma'lumoti — foydalanuvchi taqdim etgan GSC saytga xos xulosalar (29.08.2026 holati) va saytning joriy kodini statik tekshirish.

---

## 1.1 — Pozitsiya tushishi sababini tasdiqlash

**Holat: TO'LIQ — foydalanuvchi taqdim etgan `Страницы.csv` (63 sahifa, sahifa-darajasidagi pozitsiya/impressiya/CTR, ikkala davr) asosida.**

Metodika: har sahifa uch guruhga bo'lindi — **ESKI** (RU va huquqiy klasterdan tashqari, oldin ham mavjud bo'lgan 42 sahifa), **HUQUQIY** (yangi klaster: `aliment-kalkulyator`, `ishdan-boshatish-kompensatsiyasi-kalkulyator`, `dekret-puli-kalkulyator` — CSV'da faqat 3 tasi ko'rindi, 20 impressiya), **RU** (`/ru/` prefiksli 17 sahifa, 79 impressiya). Har guruh uchun impressiya-og'irlikli o'rtacha pozitsiya hisoblandi (GSC'ning o'zi ham shu usulda hisoblaydi).

| Guruh | Impressiya (hozir) | Pozitsiya (hozir) | Pozitsiya (oldin) |
|---|---|---|---|
| ESKI (42 sahifa) | 1504 | **6.84** | **6.07** |
| HUQUQIY (3 sahifa) | 20 | 5.85 | yo'q (yangi) |
| RU (17 sahifa) | 79 | 17.29 | yo'q (yangi) |

**Xulosa — foydalanuvchi promptidagi 3-gipoteza QISMAN NOTO'G'RI chiqdi.** "Eski sahifalar pozitsiyasini yo'qotmagan" degan taxmin faqat qisman tasdiqlandi: RU sahifalarining past pozitsiyada (17.29) kirishi umumiy o'rtachani pastga tortadi — bu rost. Lekin **ESKI sahifalarning o'zi ham real ravishda pastlagan** — 6.07'dan 6.84'ga, ya'ni 0.77 ball, RU/huquqiy ta'siridan mustaqil. Ikkala effekt taxminan teng og'irlikda: RU/huquqiy debyuti umumiy o'rtachaga ≈+0.5 ball, eski sahifalarning o'z pasayishi ≈+0.77 ball qo'shadi (7.5 ≈ 1504×6.84 + 79×17.29 + 20×5.85, jami / 1603 ≈ 7.34, hisobotdagi 7.5'ga yaqin, farq CSV'ning yuqori-impressiya sahifalar bilan cheklanganidan).

**Eski sahifalar ichida eng ko'p pastlagan (kamida 10 impr):**
- `kredit-kalkulyator`: 10.67 → 16.22 (+5.55, eng katta pasayish, 129 impressiya — katta hajm)
- `omonat-kalkulyator`: 6.95 → 12.12 (+5.17, 25 impressiya)
- `pensiya-kalkulyator`: 4.80 → 7.20 (+2.40)
- `toy-byudjeti-2026`: 3.36 → 4.96 (+1.60)
- `remont-kalkulyator`: 5.58 → 6.85 (+1.27)

**Eski sahifalar ichida eng ko'p yaxshilangan:**
- `maktab-kalkulyator`: 9.50 → 4.56 (−4.94)
- `bojxona-kalkulyator`: 7.82 → 5.12 (−2.70)
- `talabnoma-namunasi`: 8.11 → 5.77 (−2.34)
- `staj-kalkulyator`: 7.50 → 5.46 (−2.04)
- bosh sahifa (`/`): 5.07 → 3.95 (−1.12)

**Amaliy xulosa:** FAZA 4 rejasining umumiy yo'nalishi (CTR optimizatsiyasi, ichki bog'lanish, RU tezlashtirish) o'zgarmaydi — bu tavsiyalar RU/huquqiy sabab bo'lsa ham, eski-sahifa pasayishi bo'lsa ham baravar foydali. Lekin **"pozitsiya 7,5'ni muammo deb hal qilishga urinmaslik" qoidasi endi to'liq to'g'ri emas** — `kredit-kalkulyator` va `omonat-kalkulyator`dagi keskin pasayish (ayniqsa `kredit-kalkulyator`ning 129 impressiyalik hajmi bilan) alohida e'tiborga loyiq, garchi bu FAZA 4'ning joriy qamroviga (CTR/ariza klasteri/RU) kirmasa ham — kelajakda alohida tekshirilishi tavsiya etiladi (nima o'zgargan: raqobat, algoritm, sahifa kontenti — buni aniqlash uchun qo'shimcha GSC tarixi kerak, hozirgi 2 haftalik oyna yetarli emas).

## 1.2 — CTR bo'yicha eng katta imkoniyat sahifalari

**Holat: TO'LIQ — `Страницы.csv` asosida.**

Barcha sahifalar (impressiya ≥ 15) CTR bo'yicha o'sish tartibida:

| Sahifa | Impr | Klik | CTR | Pozitsiya |
|---|---|---|---|---|
| `oylik-soliq-kalkulyator` | 75 | 0 | **0.00%** | 4.59 |
| `alkogol-kalkulyator` | 33 | 0 | **0.00%** | 4.21 |
| `tom-kalkulyator` | 28 | 0 | **0.00%** | 3.75 |
| `yer-konvertor` | 28 | 0 | **0.00%** | 5.07 |
| `kredit-kalkulyator` | 129 | 1 | 0.78% | 16.22 |
| `beton-kalkulyator` | 76 | 1 | 1.32% | 4.51 |
| **`ariza-namunasi`** | **418** | 8 | **1.91%** | 8.12 |
| `uy-qurish-kalkulyator` | 99 | 2 | 2.02% | 4.79 |
| `quyosh-panel-kalkulyator` | 47 | 1 | 2.13% | 4.15 |

**Ustuvorlik №1 — `ariza-namunasi`.** 418 impressiya — sayt bo'ylab eng katta hajm — va CTR atigi 1.91%. Bu FAZA 4.1.3'dagi gipotezani **to'liq tasdiqlaydi**: so'rovlar (`ariza yozish namunasi` — 35 impr, `ariza shablon` — 30, `ariza qanday yoziladi` — 9, va yana o'nlab "ariza yozish/namuna/matni" turidagi so'rovlar) shu sahifaga tushadi, lekin sarlavha ularga mos emas. **Diqqatga molik qo'shimcha signal:** impressiya oldingi davrga nisbatan deyarli 3 barobar oshgan (141→418), lekin kliklar deyarli o'zgarmagan (9→8) — demak sahifa ko'proq so'rov uchun ko'rina boshladi, lekin yangi ko'rinishlarning aksariyati bosilmayapti. Bu — FAZA 4.2'ning eng katta yakka imkoniyati.

**Ustuvorlik №2 — `kredit-kalkulyator`.** 129 impressiya, CTR 0.78% — saytdagi eng yomon CTR (katta hajmli sahifalar orasida). Pozitsiya ham yomonlashgan (1.1'ga qarang) — ikkala muammo birga hal qilinishi kerak bo'lishi mumkin, lekin CTR (title/description) tezroq va arzonroq tuzatiladi.

**Diqqatga molik anomaliya — 0% CTR guruhi.** To'rtta sahifa (`oylik-soliq-kalkulyator`, `alkogol-kalkulyator`, `tom-kalkulyator`, `yer-konvertor`) YAXSHI pozitsiyada (3.75–5.07, ya'ni birinchi sahifaning yuqori qismi) turibdi, lekin **bitta ham klik olmagan**. Bu odatiy "pozitsiya past — CTR past" holatidan farq qiladi: yaxshi pozitsiyada 0% CTR odatda title/snippet foydalanuvchi kutgan natijaga mutlaqo mos kelmasligini yoki raqobatchilarning sarlavhasi ancha jozibali ekanini bildiradi. Ayniqsa `oylik-soliq-kalkulyator` (75 impressiya, pozitsiya 4.59, 0 klik) FAZA 4.2'da alohida e'tibor talab qiladi.

**Qo'shimcha topilma — rich result ko'rinishi yo'q.** `Вид в поиске.csv` (Search Appearance) **bo'sh** — hech qanday maxsus SERP ko'rinishi (FAQ rich result va h.k.) hozircha qayd etilmagan, garchi ko'p sahifada `FAQPage` JSON-LD mavjud bo'lsa ham. Bu FAZA 4.2.3 (FAQ schema kengaytirish)ning CTR'ga tezkor ta'sirini pasaytirishi mumkin — Google hali bu sahifalar uchun rich result ko'rsatmayotganini bildiradi. 2.3 baribir bajarilishi kerak (uzoq muddatli SEO gigiyenasi uchun), lekin uni "tezkor CTR yechimi" emas, "asos qo'yish" sifatida kutish tavsiya etiladi.

## 1.3 — "Ariza" klasteri auditi

**Holat: TO'LIQ — kod o'zgartirilmagan, faqat mavjud holat tekshirildi.**

### Hozirgi tuzilma

Saytda ariza mavzusida ikki turdagi sahifa bor:

1. **`ariza-namunasi.html`** — umumiy/universal generator. `atype` tanlovida **8 ta** variant bor: ma'lumotnoma so'rovi, hujjat nusxasi so'rovi, ruxsat so'rash, moddiy yordam so'rash, bolani bog'cha/maktabga qabul, qarorni qayta ko'rib chiqish, shikoyat/murojaat, erkin matn.
2. **`ishdan-boshash-arizasi-namunasi.html`** — ishdan bo'shash arizasiga bag'ishlangan **alohida, chuqur** sahifa: 6 ta H2 bo'lim (nima uchun kerak, qaysi asosda, ogohlantirish muddati, qanday topshirish, nimalar olish kerak, qaytarib olish mumkinmi), 7 ta FAQ, `HowTo`+`FAQPage`+`BreadcrumbList`+`WebApplication` JSON-LD, 1567 so'z noyob kontent (`docs/seo-audit-2026-08.md`, 0.C jadvali). Bu — FAZA 4.3 uchun **tayyor namunaviy shablon** (yangi sahifa yozishda ishlatilishi kerak).

### Topilma 1 — sonlar mos kelmaydi

`ariza-namunasi.html`ning `answerbox-data` va `app-ld` JSON-LD matnlarida **"12 dan ortiq ariza turi"** deyilgan, lekin `atype` selectida haqiqatda **8 ta** variant bor (7 ta konkret tur + "erkin matn"). Bu — sonning eskirgan/oshirib yuborilgan holati, kalki.uz build-qoidalariga zid emas (bu narx emas, lekin "raqam haqiqiy sanashga mos kelishi kerak" umumiy tamoyiliga zid). **FAZA 4.2/4.3 implementatsiyasida tuzatilishi kerak** — yo son 8'ga tushiriladi, yo yangi turlar qo'shilib 12+ haqiqiy bo'ladi.

### Topilma 2 — uchta GSC-niyat bitta sahifaga tushadi, lekin sarlavha mos emas

GSC so'rovlari — `ariza shablon`, `ariza yozish namunasi`, `ariza qanday yoziladi` — barchasi bitta umumiy niyatni ifodalaydi ("men ariza qanday yozishni bilmayman, namunasi kerak") va eng ehtimolli holda bittasi — `ariza-namunasi.html`ga tushadi (2-band gipotezasiga qarang, tasdiqlanmagan). Sahifaning joriy sarlavhasida "namunasi" bor, lekin "yozish" va "qanday" so'zlari yo'q — bu so'rov-sarlavha mosligini pasaytiradi.

### Topilma 3 — ichki bog'lanish assimetrik (FAZA 4.4 uchun ham tegishli)

`ishdan-boshash-arizasi-namunasi.html` sahifasi `ariza-namunasi.html`ga havola beradi ("Umumiy ariza" nomi bilan, `#articleLink` blokida), lekin **teskarisi yo'q** — `ariza-namunasi.html` `ishdan-boshash-arizasi-namunasi.html`ga havola BERMAYDI. Bu — bir tomonlama bog'lanish, xuddi FAZA 4.5'dagi hreflang xavotiriga o'xshash muammo turi (agar foydalanuvchi umumiy ariza sahifasida turib "ishdan bo'shash arizasi" turini qidirsa, uni topa olmaydi).

### Klaster kengaytirish taklifi (FAZA 4.3 uchun, kod yozilmagan)

Foydalanuvchi promptida sanab o'tilgan turlardan, mavjud generator/kalkulyator infratuzilmasiga qarab ustuvorlik:

| Yangi sahifa (taklif) | Asos | Eslatma |
|---|---|---|
| `tatil-arizasi-namunasi.html` | Mavjud `tatil-puli-kalkulyator.html` bilan tabiiy juftlik — kalkulyatordan arizaga, arizadan kalkulyatorga cross-link mumkin | Yangi, `ishdan-boshash-arizasi-namunasi.html` shabloni asosida |
| `ish-haqi-oshirish-arizasi-namunasi.html` | GSC'da to'g'ridan-to'g'ri so'rov ko'rinmagan, lekin foydalanuvchi so'ragan — tekshirilishi kerak (1.2 GSC eksporti kelgach so'rov hajmini baholash mumkin) | Ustuvorligi past, dalil yetarli emas |
| `oquv-tatili-arizasi-namunasi.html` | Xuddi shu | Ustuvorligi past |

**Muhim eslatma (foydalanuvchi promptidagi ogohlantirishga muvofiq):** bular — taklif, GSC so'rov hajmi bilan tasdiqlanmagan (1.2 blokirovkasi tufayli). Real ustuvorlik GSC eksporti kelgach aniqlanadi — ehtimol `tatil-arizasi` emas, boshqa tur ko'proq so'raladi.

---

## Xulosa — FAZA 4.1 to'liq tugadi

1.1, 1.2, 1.3 — uchalasi ham bajarildi, `Страницы.csv`, `Запросы.csv`, `Устройства.csv`, `Страны.csv`, `Вид в поиске.csv` fayllari (29.08.2026 eksporti) asosida.

**FAZA 4.2 uchun ustuvorlik ro'yxati (aniqlangan, taxmin emas):**
1. `ariza-namunasi` — title/description'ni "ariza yozish namunasi" so'rovlariga moslashtirish (eng katta hajm, 418 impr, CTR 1.91%)
2. `kredit-kalkulyator` — title/description qayta ko'rib chiqish (CTR 0.78%, pozitsiya ham yomonlashgan)
3. 0% CTR guruhi (`oylik-soliq-kalkulyator`, `alkogol-kalkulyator`, `tom-kalkulyator`, `yer-konvertor`) — snippet/title butunlay ishlamayapti, tekshirilishi shart
4. `beton-kalkulyator`, `uy-qurish-kalkulyator`, `quyosh-panel-kalkulyator` — o'rta ustuvorlik

FAQ schema kengaytirish (2.3) foydali, lekin tezkor CTR ta'siri kutilmasin — hozircha rich result ko'rinishi yo'q.

**1.1'dan qo'shimcha topilma:** `kredit-kalkulyator` va `omonat-kalkulyator`dagi keskin pozitsiya pasayishi FAZA 4 qamroviga kirmaydi, lekin alohida qayd etildi — kelajakda tekshirilishi tavsiya etiladi.

---

## FAZA 4.2 — 0%-CTR guruhi diagnostikasi (`alkogol`, `tom`, `yer-konvertor`)

`oylik-soliq-kalkulyator`da qo'llangan diagnostika naqshi (title/description'ni buzuq fragment yoki asosiy kalit so'z yo'qligiga tekshirish) bu uchta sahifaga ham qo'llanildi. **Natija — boshqacha:**

| Sahifa | Title/description holati |
|---|---|
| `alkogol-kalkulyator` | Toza. Title'da hatto tabiiy "haydash mumkinmi?" savoli bor — bu odatda CTR'ni oshiruvchi naqsh. |
| `tom-kalkulyator` | Toza. Aniq, mahsulot nomlari (profnastil, cherepitsa) ko'rsatilgan. |
| `yer-konvertor` | Toza. Birlik nomlari sanab o'tilgan, aniq. |

**Uchalasida ham oylik-soliq-kalkulyatordagi kabi buzuq fragment yoki kalit so'z yo'qligi topilmadi.** Bu — muhim farq: bu safar diagnostika "tuzatish kerak bo'lgan aniq nuqson"ni emas, "nuqson yo'qligi"ni tasdiqladi.

**Statistik izoh:** bu uchta sahifaning impressiya hajmi past (28-33) — `ariza-namunasi` (418) yoki `oylik-soliq-kalkulyator` (75) bilan solishtirganda ancha kichik. Agar bu sahifalar odatiy 8-12% CTR kutilsa (pozitsiya 3.75-5.07 uchun tipik), 28-33 impressiyada 0 klik kuzatish ehtimoli past, lekin imkonsiz emas (Puasson taqsimotida ~5% ehtimol) — ya'ni **bu balki shunchaki tasodifiy noise, tuzatilishi kerak bo'lgan real nuqson emas**.

**Tavsiya:** ushbu uchta sahifada title/description'ni **o'zgartirmaslik** — chunki hech qanday aniq nuqson topilmadi va o'zgartirish spekulyativ bo'lardi (Batch 3'da rad etilgan "ehtimol to'g'ri, lekin ehtimol yetarli emas" mantig'iga o'xshaydi). Buning o'rniga: keyingi GSC eksportida (masalan 1-2 hafta keyin, impressiya hajmi oshgach) bu uchta sahifani qayta tekshirish — agar o'sha paytda ham 0% CTR davom etsa, bu haqiqiy signal bo'ladi va harakat qilinadi.

---

## FAZA 4.4 — ichki bog'lanish tizimi

### 1. Bir tomonlama havola (4.1.3 topilmasi) — TUZATILDI

`ariza-namunasi.html`ga `ishdan-boshash-arizasi-namunasi.html`ga havola qo'shildi (`#articleLink` bloki). Endi ikki tomonlama.

### 2. Huquqiy klaster va hisob-siyosati bog'lanishi — TUZATILDI

Tekshiruv shuni ko'rsatdi: 6 ta huquqiy klaster sahifasi (`aliment-kalkulyator` va h.k.) allaqachon `tools/site-chrome.js`ning umumiy `#xnav` footer bloki orqali har biri **56 sahifadan** havola olar edi — bu qism qo'shimcha ishlov talab qilmadi.

Lekin `hisob-siyosati-generatori.html` shu ro'yxatda **yo'q edi** — u faqat `hujjatlar.html`dan (1 ta sahifadan) havola olardi. Sabab: bu hujjat-generator turi, `XNAV_LINKS` esa asosan kalkulyatorlar uchun tuzilgan, yangi generator qo'shilganda uni bu ro'yxatga kiritish unutilgan (xuddi shu faylning o'z izohida ogohlantirilgan aynan shunday xato turi: "yangi staj-kalkulyator.html qo'shilganda uni HAMMA joyga qo'lda qo'shish unutilgan edi").

Tuzatildi: `XNAV_LINKS`ga qo'shildi (56 sahifadan havola oladigan bo'ldi) + 3 ta mavzuan yaqin sahifaga (`oylik-soliq-kalkulyator`, `qqs-kalkulyator`, `mehnat-shartnomasi-namunasi`) maqsadli `#related` havolasi qo'shildi + o'zining `#related` bloki yaratildi (avval sahifada birorta ham chiquvchi ichki havola yo'q edi).

**Yon topilma:** `hisob-siyosati-generatori.html`ning `applyLang()`i `data-rel-uz/ru` juftligini almashtirmas edi (bu boshqa sahifalarda alohida `<script id="artlang">` moduli orqali ishlaydi, lekin bu sahifada u yo'q edi — chunki avval `#related` bloki umuman bo'lmagan). Shu skript qo'shildi.

### 3. RU sahifalar RU sahifalarga bog'lanishi — TEKSHIRILDI, MUAMMO TOPILMADI

Foydalanuvchining gipotezasi: bu — pozitsiya 28,4'ning sabablaridan biri bo'lishi mumkin. **Natija — gipoteza tasdiqlanmadi.**

Barcha 64 ta `ru/*.html` sahifa jsdom orqali dasturiy tekshirildi: har sahifadagi barcha ichki (`kalki.uz` domenidagi) havolalar yig'ildi va ularning `resolved` (brauzer hisoblagan to'liq) URL manzili `/ru/` prefiksini o'z ichiga oladimi tekshirildi. **Natija: 0 ta xato havola.** Sabab — havolalar nisbiy (`href="kredit-kalkulyator"`, mutlaq yo'l emas) va HTML nisbiy-URL qoidasiga ko'ra `/ru/ariza-namunasi`dan chiqqan nisbiy havola avtomatik `/ru/kredit-kalkulyator`ga aylanadi, UZ'ga emas. Bu — 4 xil sahifa turida (`ariza-namunasi`, `aliment-kalkulyator`, `hisob-siyosati-generatori`, `hujjatlar`) real brauzerda ham qo'lda tasdiqlangan, keyin barcha 64 sahifa dasturiy tekshirildi.

**Xulosa:** pozitsiya 28,4'ning sababi RU→RU ichki bog'lanish emas. Ehtimoliy sabablar: RU sahifalar hali yosh (bir hafta oldin 0/0 edi — Google hali indekslash/baholash bosqichida) yoki boshqa omil (hreflang, kontent hajmi — bular FAZA 4.5 qamrovida).

**Yon topilma (bu ishga aloqasi yo'q, alohida qayd etildi):** `qqs-kalkulyator.html`da `document.documentElement.lang==='ru'` bo'lgan holatda ham `<title>` UZ holicha qolib ketishi kuzatildi — sahifaning applyLang() bu holatda title'ni yangilamayapti. Bu FAZA 4.5'da (RU title/description ko'rib chiqilganda) tekshirilishi tavsiya etiladi.

---

## FAZA 4.5 — RU sahifalarni tezlashtirish

### 1. Aralash til qoldig'i (4.4'dagi ikkita yon topilmaning tizimli davomi)

Barcha 64 RU sahifa dasturiy skanerlandi — title, meta (description/og/twitter), JSON-LD (app-ld, faq-ld, bc-ld, coll-ld), statik bloklar (seoBlock, faqBlock, related, articleLink). **64/64 sahifada kamida bitta muammo topildi**, eng katta topilma:

- **og:title/twitter:title (63/64 sahifa)** — deyarli universal bug. `applyLang()` description'ni yangilardi, title metateglarini yo'q. `assets/docgen.js` (umumiy dvigatel) + ~44 mustaqil sahifa + 5 ta statik sahifa (`biz-haqimizda`, `blog`, `maxfiylik`, `shablonlar`, `shartlar`, boshqa naqsh bilan) — bulk-skriptlar bilan tuzatildi.
- **To'liq title/desc almashtirish yo'q edi** (6 sahifa: `dtm-`, `grant-ololmadim`, `oila-byudjet-`, `universitet-kontrakt-`, `yoqilgi-`, `qqs-kalkulyator`) — eski, soddaroq shablon. Har biriga real UZ/RU matn yozildi.
- **`descriptions` konfiguratsiyasi berilmagan** (3 "namunasi" sahifa) — qo'shildi.
- **`hisob-siyosati-generatori.html`** — eng chuqur topilma: `$('seoBlock');` no-op qator edi (hech narsa qilmasdi), faq-ld/app-ld.name/bc-ld hech qachon yangilanmasdi. To'liq RU tarjima (5 bo'lim) yozildi, dinamik JSON-LD qayta qurish qo'shildi.
- **`maktab-kalkulyator.html`** — `#artlang` moduli `data-rel-uz/ru` juftini o'tkazib yuborgan.
- **`hujjatlar.html`** — description va `coll-ld` (CollectionPage) yangilanmasdi.

Barcha tuzatishlardan keyin qayta skanerlash: **64/64 sahifa toza**. `tools/verify-all.js`ga **25-band** qo'shildi — bu regressiya sinfi endi doimiy nazoratda.

### 2. hreflang ikki tomonlamaligi — TEKSHIRILDI, MUAMMO YO'Q

Band 21 allaqachon hreflang teglari mavjudligini tekshirar edi, lekin `href` qiymatlarining TO'G'RI juftga ishora qilishini alohida tasdiqlash kerak edi. Dasturiy tekshiruv: 64/64 sahifada UZ sahifaning `hreflang="ru"` havolasi aynan mos RU sahifaga, RU sahifaning `hreflang="uz"` havolasi aynan mos UZ sahifaga ishora qiladi. **Muammo topilmadi.**

### 3. RU sitemap to'liqligi — MUAMMO TOPILDI VA TUZATILDI

**14 ta RU sahifa sitemap.xml'da umuman yo'q edi** — asosan yangiroq "namunasi" hujjatlari (`avto-oldi-sotdi-shartnomasi-namunasi`, `davo-arizasi-namunasi`, `kafolat-xati-namunasi`, `qurilish-pudrat-shartnomasi-namunasi`, `tavsifnoma-namunasi`, `topshirish-qabul-dalolatnomasi-namunasi`, `uy-oldi-sotdi-shartnomasi`, `xizmat-korsatish-shartnomasi-namunasi`) va statik sahifalar (`biz-haqimizda`, `blog`, `hamkorlik`, `maxfiylik`, `shablonlar`, `shartlar`). Bu — **Google RU sahifalarni sitemap orqali kashf qila olmagan** degani, GSC'dagi "RU sahifalar hali yosh" hodisasining ehtimoliy sababi.

Qo'shildi (120 → 134 URL), shu jarayonda **sw.js precache ro'yxatida ham xuddi shu 14 sahifa yo'qligi** ochildi — u ham tuzatildi. `tools/verify-all.js`ga **26-band** qo'shildi (sitemap to'liqligi, doimiy nazorat).

### 4. RU title/description'ni RU so'rovlariga moslashtirish — MA'LUMOT YETARLI EMAS

RU sahifalar bo'yicha sahifa-maxsus so'rov statistikasi (GSC "Sahifalar" filtri bilan "Запросы") hozircha yo'q — mavjud `Запросы.csv` sayt bo'ylab umumiy, deyarli to'liq UZ so'rovlar bilan to'la (RU sahifalar atigi 79 ta umumiy impressiyaga ega, ko'pi 1 tadan). Bu bandni bajarish uchun taxmin qilinmadi — RU trafik hajmi oshgach (masalan sitemap tuzatilgandan keyin, Google RU sahifalarni ko'proq kashf qilgach), qayta ko'rib chiqilishi tavsiya etiladi.

### 5. RU kontent hajmi UZ bilan solishtiruv — TEKSHIRILDI, MUAMMO YO'Q

Barcha 64 sahifada noyob so'z soni (boilerplate: menyu/footer/related va h.k. chiqarib tashlangan holda) hisoblandi. **Eng past nisbat — 98%** (`ijara-shartnomasi-namunasi`, `maxfiylik`, `shartlar`), ko'pchilik 99-100%. Tarjima qisqartirilmagan — **muammo topilmadi**.

## FAZA 4.5 yakuniy xulosa

5 tekshiruv bandidan 3 tasida haqiqiy nuqson topildi va tuzatildi (aralash til, sitemap/precache), 2 tasida esa (hreflang, kontent hajmi) tekshiruv "muammo yo'q" natijasini berdi — bu ham qimmatli, chunki FAZA 4.4'dagi RU→RU bog'lanish kabi noto'g'ri gipotezalarni rad etadi. RU title/description so'rov-moslashtirish yetarli ma'lumot yo'qligi sababli ochiq qoldirildi.

**Eng katta kutilayotgan ta'sir:** sitemap tuzatilishi — bu Google'ga 14 ta yangi RU URL'ni topish imkonini beradi va umuman RU domenning kashf etilishini tezlashtirishi mumkin, bu esa pozitsiya 28,4'ga eng to'g'ridan-to'g'ri ta'sir qiladigan tuzatish edi.
