# SEO audit — 2026-08 (Faza 0: diagnostika)

Ushbu hisobot Faza 0 doirasida tayyorlandi: **bironta kod fayli o'zgartirilmagan**, faqat mavjud holat tekshirilgan (jsdom orqali diskdagi HTML'ni parse qilish, JS ishga tushirilmagan — chunki prerender natijasi allaqachon yakuniy holat). Maqsad: Google'dan organik trafik nega asosan bosh sahifaga (~65%) tushayotgani va ichki sahifalar nega trafik olmayotganini tushunish.

---

## 0.A — Rus tilidagi kontent Google uchun ko'rinadimi?

### 1. Hozirgi UZ/RU arxitekturasi

Bitta URL, bitta HTML fayl, til **faqat client-side JS toggle** orqali hal qilinadi (`assets/lang.js`):

- Qaror tartibi: `?lang=uz|ru` URL parametri → `localStorage['kalki_lang']` → brauzer tili (`navigator.language`) → standart `uz`.
- Til tanlanganda `document.documentElement.lang` va `data-lang` atributi **runtime'da** yangilanadi (`markHtml()`), keyin sahifaning o'z `#langRu`/`#langUz` tugmasi dasturiy bosiladi (`paint()` → `btn.click()`), bu esa har sahifadagi alohida `applyLang()`/`buildSections()`/`renderResult()` kabi funksiyalarni ishga tushiradi.
- Matn ikkita usulda saqlanadi: (a) `data-i="key"` + alohida i18n lug'at obyekti (kalkulyator natijalari, dinamik matn), (b) `data-tm-uz`/`data-tm-ru`, `data-lf-uz`/`data-lf-ru`, `data-art-uz`/`data-art-ru` kabi juft HTML atributlar (menyu, footer, statik matn) — bularning qiymati JS orqali `.textContent`ga ko'chiriladi.

### 2. Eng muhim savol: prerender qilingan HTML'da RU matn bormi?

**Yo'q — ko'rinadigan matn sifatida yo'q.**

`tools/prerender.js` (49-51-qatorlar) prerender paytida tilni **majburan** `uz`ga o'rnatadi:
```js
doc.documentElement.setAttribute('lang', 'uz');
doc.documentElement.setAttribute('data-lang', 'uz');
doc.documentElement.removeAttribute('data-lang-ready');
```
Ya'ni diskdagi HAR BIR sahifa doim UZ holatida "muzlatilgan" holda saqlanadi.

3 ta belgilangan sahifada tekshirildi (kirill belgilarini sanash orqali):

| Sahifa | Kirill belgi (`<script>` ichida, ya'ni JS ma'lumot) | Kirill belgi (`<script>` TASHQARISIDA) | Shundan nechtasi haqiqiy ko'rinadigan matn (textContent)? |
|---|---|---|---|
| `index.html` | 2645 | 191 | **0** |
| `kredit-kalkulyator.html` | 3126 | 651 | **0** |
| `mehnat-shartnomasi-namunasi.html` | 7796 | 769 | **0** |

`<script>` tashqarisidagi barcha kirill belgilar tekshirildi — ularning 100% i faqat `data-tm-ru="..."`, `data-lf-ru="..."`, `data-art-ru="..."` kabi **HTML atribut qiymatlari** ichida yotibdi (masalan: `<a data-tm-uz="Moliya" data-tm-ru="Финансы">Moliya</a>` — ko'rinadigan matn "Moliya", "Финансы" esa faqat atribut, ekranda chiqmaydi, JS bosilmaguncha).

**Xulosa:** Googlebot sahifani render qilganda (u JS'ni bajaradi, lekin RU tugmasini bosmaydi, `localStorage`da saqlangan tanlovi yo'q va brauzer tili odatda `ru` bo'lib kelmaydi) — u har doim UZ versiyani ko'radi. Rus tilidagi 55+ sahifalik tarjima **Google uchun amalda mavjud emas**. Bu O'zbekistondagi rus tilida qidiruvchi foydalanuvchilar (ular ancha katta segment) uchun butunlay yo'qotilgan trafik degani.

### 3. sitemap.xml va hreflang

- `sitemap.xml`da 63 ta `<url>` yozuvi — barchasi faqat UZ URL (`https://kalki.uz/...`), **birorta ham** `/ru/` yoki `?lang=ru` yozuv yo'q.
- Butun sayt bo'ylab **hreflang tegi umuman yo'q** (`<link rel="alternate" hreflang="...">` — grep bo'yicha 0 ta natija).
- `<html lang>` diskdagi faylda statik `"uz"` — yuqorida aytilganidek, faqat runtime'da o'zgaradi, Google buni ko'rmaydi.

### 4. Canonical

Har sahifada statik, bitta til holatiga bog'liq bo'lmagan canonical bor: masalan `<link rel="canonical" href="https://kalki.uz/kredit-kalkulyator">`. RU uchun alohida canonical yo'q — chunki alohida RU URL umuman yo'q.

---

## 0.B — Uch variantni solishtirish

### Variant A — alohida URL'lar (`/ru/kredit-kalkulyator`)

| | |
|---|---|
| **Fayllar** | ~55-63 ta yangi HTML (yoki bitta shablondan ikkala tilni generatsiya qiluvchi build bosqichi) + `tools/prerender.js`, `tools/og-tags.js`, sitemap generatori, `sw.js` precache ro'yxati |
| **Vaqt** | Eng katta — butun build pipeline "ikki tilli sahifa juftligi" tushunchasini bilishi kerak bo'ladi |
| **Risk** | Eng yuqori — 55+ yangi URL bir vaqtda paydo bo'ladi; `hreflang`/canonical noto'g'ri sozlansa dublikat-kontent xavfi bor; `sw.js`ning navigatsiya network-first siyosati yangi yo'llarni to'g'ri qamrashi kerak |
| **SEO foydasi** | Eng katta — RU URL mustaqil ravishda RU so'rovlar bo'yicha indekslanadi va ranklanadi; `hreflang` orqali Google'ga aniq signal beriladi; Yandex ham (RU foydalanuvchilar O'zbekistonda Yandex'dan ham keladi) buni to'g'ri tushunadi |
| **Prerender barqarorligi** | Saqlanadi — har til alohida, mustaqil ravishda bayt-bayt barqaror prerender qilinadi |

### Variant B — hozirgi toggle qoladi, prerender ikkala tilni bitta HTML'ga chiqaradi (biri `hidden`)

| | |
|---|---|
| **Fayllar** | Asosan `tools/prerender.js` (ikkinchi "soya" render qo'shiladi, natija sahifa ichiga qo'shimcha `hidden` blok sifatida yoziladi); URL, sitemap, canonical, `sw.js` o'zgarmaydi |
| **Vaqt** | O'rtacha — bitta build skriptga tegadi |
| **Risk** | O'rtacha — Google ko'pincha `display:none`/`hidden` matnni kam og'irlik bilan baholaydi (jazolamaydi, lekin ranklashga deyarli ta'sir qilmasligi mumkin); dublikat-domen xavfi yo'q, chunki bitta URL qoladi |
| **SEO foydasi** | **Cheklangan** — bu "yarim yechim": Google RU matnni texnik jihatdan indekslashi mumkin, lekin sahifa RU so'rovlar uchun alohida signal olmaydi (`<html lang>` baribir statik `uz`, alohida URL yo'q). Amalda ko'rinish muammosini "yechadi", lekin ranklashni deyarli yaxshilamaydi |
| **Prerender barqarorligi** | Saqlanadi, lekin sahifa hajmi ikki barobarga yaqin o'sadi (har ikki til matni diskda) |

### Variant C — subdomen `ru.kalki.uz`

| | |
|---|---|
| **Fayllar** | Eng ko'p — deyarli alohida sayt nusxasi; Cloudflare Pages'da alohida deploy yoki routing; `sw.js` origin-scoped bo'lgani uchun subdomen uchun alohida service worker kerak; `partners.json` manzillari domenlararo so'rovga aylanishi mumkin |
| **Vaqt** | Eng katta, va **davomiy** operatsion yuk qo'shiladi (ikki "sayt"ni doim sinxron saqlash) |
| **Risk** | Yuqori — domen authority ikkiga bo'linadi (`kalki.uz` va `ru.kalki.uz` alohida backlink/authority to'playdi); yosh sayt uchun bu narx katta |
| **SEO foydasi** | Nazariy jihatdan mustahkam, lekin loyihaning hozirgi bosqichida (~87 klik/oy) ortiqcha murakkablik — authority bo'linishi foydadan ko'ra ko'proq zarar keltirishi mumkin |
| **Prerender barqarorligi** | Ta'sir qilmaydi, lekin butunlay alohida build/deploy jarayoni kerak bo'ladi |

### Tavsiya

**Variant A** — bitta domen ichida `/ru/...` prefiksli alohida URL'lar, ikki tomonlama `hreflang` va sitemapda ikkala til. Bu sanoat standarti va eng yaxshi uzoq muddatli SEO natija beradi, subdomen (Variant C) authority bo'linish muammosidan xoli.

Bu — **eng katta hajmdagi ish** (build pipeline'ning katta qismini qayta qurish talab qiladi). Agar bosqichma-bosqich borish afzal ko'rilsa: avval eng yuqori trafik salohiyatli 5-10 sahifada (masalan `index`, `kredit-kalkulyator`, `ipoteka-kalkulyator`, `oylik-soliq-kalkulyator`) sinov sifatida amalga oshirib, GSC'da natijani kuzatib, keyin qolgan sahifalarga tarqatish mumkin.

**Bu qarorni Asror tanlaydi — hozircha hech qanday kod o'zgartirilmagan va ish boshlanmagan.**

---

## 0.C — Sayt bo'ylab SEO inventarizatsiyasi

Metodika: har sahifa diskdan jsdom bilan o'qildi (JS ishga tushirilmadi — prerender natijasi allaqachon yakuniy). "So'z soni" ustuni saytning umumiy boilerplate bloklari (`topmenu`, `sitebar`, `breadcrumb`, `articleLink`, `related`, `fbcall`, `xnav`, `copyline`, `legal-links`) olib tashlangandan keyingi **noyob sahifa kontenti**ni ko'rsatadi — bu haqiqiy "yupqa kontent" xavfini aniqroq ko'rsatadi (aks holda har sahifada bir xil ~150-250 so'zlik navigatsiya/footer matni barcha sahifalarni sun'iy ravishda "to'q" ko'rsatib yuborardi).

"Ichki havola (kirish/chiqish)" — kirish: boshqa sahifalardan shu sahifaga qancha ichki havola bor; chiqish: shu sahifadan boshqa ichki sahifalarga qancha noyob havola chiqadi.

| Sahifa | title (belgi) | desc (belgi) | H1 | FAQ | So'z soni | JSON-LD turlari | Ichki havola (kirish/chiqish) | Sana ko'rinadimi |
|---|---|---|---|---|---|---|---|---|
| alkogol-kalkulyator.html | 64 | 131 | 1 | 3 | 263 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| ariza-namunasi.html | 64 | 136 | 1 | 7 | 1185 | BreadcrumbList, FAQPage, WebApplication | 9 / 45 | yo'q |
| avto-bojxona-2026.html | 53 | 142 | 1 | 4 | 306 | Article, BreadcrumbList, FAQPage | 5 / 12 | yo'q |
| avto-oldi-sotdi-shartnomasi-namunasi.html | 61 | 139 | 1 | 7 | 1458 | BreadcrumbList, FAQPage, WebApplication | 7 / 45 | yo'q |
| avto-xarajat-kalkulyator.html | 65 | 154 | 1 | 6 | 360 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| beton-kalkulyator.html | 51 | 121 | 1 | 3 | 196 | BreadcrumbList, FAQPage, WebApplication | 50 / 42 | yo'q |
| biz-haqimizda.html | 48 | 147 | 1 | 0 | 268 | BreadcrumbList | 62 / 8 | yo'q |
| blog.html | 49 | 144 | 1 | 0 | 123 | BreadcrumbList | 62 / 14 | yo'q |
| bojxona-kalkulyator.html | 62 | 146 | 1 | 6 | 359 | BreadcrumbList, FAQPage, WebApplication | 52 / 41 | yo'q |
| bola-puli-kalkulyator.html | 62 | 129 | 1 | 6 | 370 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| bolalar-nafaqasi-2026.html | 56 | 158 | 1 | 4 | 449 | Article, BreadcrumbList, FAQPage | 12 / 12 | yo'q |
| chorva-kalkulyator.html | 54 | 149 | 1 | 3 | 261 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| davo-arizasi-namunasi.html | 60 | 133 | 1 | 7 | 1666 | BreadcrumbList, FAQPage, WebApplication | 3 / 45 | yo'q |
| dtm-2026.html | 57 | 150 | 1 | 4 | 327 | Article, BreadcrumbList, FAQPage | 4 / 12 | yo'q |
| dtm-kalkulyator.html | 52 | 131 | 1 | 6 | 369 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| elektr-xarajat-kalkulyator.html | 55 | 134 | 1 | 5 | 251 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| gisht-kalkulyator.html | 65 | 125 | 1 | 3 | 235 | BreadcrumbList, FAQPage, WebApplication | 50 / 42 | yo'q |
| grant-ololmadim.html | 60 | 138 | 1 | 7 | 1346 | BreadcrumbList, FAQPage, WebApplication | 50 / 39 | yo'q |
| hamkorlik.html | 65 | 154 | 1 | 0 | 292 | BreadcrumbList | 62 / 8 | yo'q |
| homiladorlik-kalkulyator.html | 56 | 131 | 1 | 5 | 259 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| hujjatlar.html | 48 | 142 | 1 | 5 | 548 | BreadcrumbList, CollectionPage, FAQPage | 62 / 59 | yo'q |
| ijara-shartnomasi-namunasi.html | 57 | 123 | 1 | 7 | 1201 | BreadcrumbList, FAQPage, WebApplication | 12 / 45 | yo'q |
| index.html | 71 | 160 | 1 | 0 | 353 | Organization, WebSite | 62 / 57 | yo'q |
| ipoteka-2026.html | 59 | 152 | 1 | 4 | 363 | Article, BreadcrumbList, FAQPage | 21 / 12 | yo'q |
| ipoteka-kalkulyator.html | 54 | 139 | 1 | 6 | 413 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| ish-haqi-malumotnomasi-namunasi.html | 61 | 140 | 1 | 7 | 534 | BreadcrumbList, FAQPage, WebApplication | 4 / 43 | yo'q |
| ishdan-boshash-arizasi-namunasi.html | 61 | 121 | 1 | 7 | 1567 | BreadcrumbList, FAQPage, WebApplication | 4 / 44 | yo'q |
| ishonchnoma-namunasi.html | 58 | 134 | 1 | 7 | 912 | BreadcrumbList, FAQPage, WebApplication | 10 / 44 | yo'q |
| kadr-buyruqlari-namunasi.html | 60 | 149 | 1 | 7 | 541 | BreadcrumbList, FAQPage, WebApplication | 5 / 44 | yo'q |
| kafolat-xati-namunasi.html | 59 | 134 | 1 | 7 | 531 | BreadcrumbList, FAQPage, WebApplication | 4 / 44 | yo'q |
| kaloriya-kalkulyator.html | 49 | 157 | 1 | 3 | 271 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| konditsioner-kalkulyator.html | 59 | 131 | 1 | 4 | 258 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| kredit-kalkulyator.html | 54 | 143 | 1 | 7 | 518 | BreadcrumbList, FAQPage, WebApplication | 55 / 41 | yo'q |
| maktab-kalkulyator.html | 59 | 164 | 1 | 5 | 429 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| marosim-kalkulyator.html | 59 | 133 | 1 | 7 | 460 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| maxfiylik.html | 56 | 123 | 1 | 0 | 196 | BreadcrumbList | 62 / 8 | ha |
| mehnat-shartnomasi-namunasi.html | 56 | 121 | 1 | 7 | 1056 | BreadcrumbList, FAQPage, WebApplication | 15 / 47 | yo'q |
| oila-byudjet-kalkulyator.html | 61 | 138 | 1 | 8 | 1113 | BreadcrumbList, FAQPage, WebApplication | 55 / 42 | yo'q |
| omonat-kalkulyator.html | 47 | 130 | 1 | 3 | 295 | BreadcrumbList, FAQPage, WebApplication | 52 / 41 | yo'q |
| oylik-soliq-kalkulyator.html | 63 | 150 | 1 | 6 | 321 | BreadcrumbList, FAQPage, WebApplication | 52 / 41 | yo'q |
| pensiya-kalkulyator.html | 64 | 131 | 1 | 3 | 200 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| qqs-2026.html | 55 | 146 | 1 | 4 | 345 | Article, BreadcrumbList, FAQPage | 21 / 12 | yo'q |
| qqs-kalkulyator.html | 52 | 133 | 1 | 3 | 166 | BreadcrumbList, FAQPage, WebApplication | 52 / 42 | yo'q |
| qurilish-pudrat-shartnomasi-namunasi.html | 65 | 129 | 1 | 7 | 757 | BreadcrumbList, FAQPage, WebApplication | 8 / 43 | yo'q |
| quyosh-panel-kalkulyator.html | 56 | 126 | 1 | 6 | 339 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| remont-kalkulyator.html | 53 | 147 | 1 | 6 | 281 | BreadcrumbList, FAQPage, WebApplication | 50 / 42 | yo'q |
| shablonlar.html | 48 | 155 | 1 | 7 | 893 | BreadcrumbList, FAQPage | 62 / 25 | yo'q |
| shartlar.html | 32 | 133 | 1 | 0 | 187 | BreadcrumbList | 62 / 8 | ha |
| staj-kalkulyator.html | 58 | 144 | 1 | 8 | 485 | BreadcrumbList, FAQPage, WebApplication | 50 / 39 | yo'q |
| talabnoma-namunasi.html | 56 | 137 | 1 | 7 | 789 | BreadcrumbList, FAQPage, WebApplication | 6 / 44 | yo'q |
| tavsifnoma-namunasi.html | 57 | 125 | 1 | 7 | 1398 | BreadcrumbList, FAQPage, WebApplication | 4 / 43 | yo'q |
| tilxat-namunasi.html | 53 | 132 | 1 | 7 | 1315 | BreadcrumbList, FAQPage, WebApplication | 11 / 46 | yo'q |
| tom-kalkulyator.html | 64 | 147 | 1 | 6 | 331 | BreadcrumbList, FAQPage, WebApplication | 50 / 42 | yo'q |
| topshirish-qabul-dalolatnomasi-namunasi.html | 50 | 129 | 1 | 7 | 1511 | BreadcrumbList, FAQPage, WebApplication | 6 / 44 | yo'q |
| toy-byudjeti-2026.html | 59 | 152 | 1 | 4 | 314 | Article, BreadcrumbList, FAQPage | 8 / 12 | yo'q |
| toy-kalkulyator.html | 57 | 141 | 1 | 3 | 284 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| universitet-kontrakt-kalkulyator.html | 61 | 141 | 1 | 7 | 772 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| uy-oldi-sotdi-shartnomasi.html | 54 | 120 | 1 | 7 | 1384 | BreadcrumbList, FAQPage, WebApplication | 2 / 46 | yo'q |
| uy-qurish-kalkulyator.html | 59 | 120 | 1 | 6 | 377 | BreadcrumbList, FAQPage, WebApplication | 51 / 42 | yo'q |
| xizmat-korsatish-shartnomasi-namunasi.html | 49 | 131 | 1 | 7 | 1903 | BreadcrumbList, FAQPage, WebApplication | 3 / 45 | yo'q |
| yer-konvertor.html | 49 | 139 | 1 | 3 | 239 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |
| yoqilgi-kalkulyator.html | 61 | 140 | 1 | 4 | 268 | BreadcrumbList, FAQPage, WebApplication | 51 / 41 | yo'q |
| zakot-qurbonlik-kalkulyator.html | 51 | 137 | 1 | 4 | 365 | BreadcrumbList, FAQPage, WebApplication | 50 / 41 | yo'q |

### Ro'yxatlar

**`<title>` 60 belgidan uzun yoki 30 dan qisqa (18 sahifa):**
`alkogol-kalkulyator.html` (64), `ariza-namunasi.html` (64), `avto-oldi-sotdi-shartnomasi-namunasi.html` (61), `avto-xarajat-kalkulyator.html` (65), `bojxona-kalkulyator.html` (62), `bola-puli-kalkulyator.html` (62), `gisht-kalkulyator.html` (65), `hamkorlik.html` (65), `index.html` (71 — eng muhimi, bosh sahifa), `ish-haqi-malumotnomasi-namunasi.html` (61), `ishdan-boshash-arizasi-namunasi.html` (61), `oila-byudjet-kalkulyator.html` (61), `oylik-soliq-kalkulyator.html` (63), `pensiya-kalkulyator.html` (64), `qurilish-pudrat-shartnomasi-namunasi.html` (65), `tom-kalkulyator.html` (64), `universitet-kontrakt-kalkulyator.html` (61), `yoqilgi-kalkulyator.html` (61).
Barchasi faqat "60 dan uzun" toifasida (0 ta 30 dan qisqa) — Google odatda 50-60 belgidan keyin kesib tashlaydi, bu ko'p sahifada butun brend/qiymat taklifi qirqilib ko'rinishi mumkin.

**Meta description yo'q yoki 160 dan uzun (1 sahifa):**
`maktab-kalkulyator.html` — 164 belgi (mavjud, faqat 4 belgi ortiqcha).

**300 so'zdan kam noyob kontent — "yupqa kontent" xavfi (20 sahifa, o'sish tartibida):**
`blog.html` (123 — bu ro'yxat sahifasi, tabiiy holat), `qqs-kalkulyator.html` (166), `shartlar.html` (187 — huquqiy sahifa), `beton-kalkulyator.html` (196), `maxfiylik.html` (196 — huquqiy sahifa), `pensiya-kalkulyator.html` (200), `gisht-kalkulyator.html` (235), `yer-konvertor.html` (239), `elektr-xarajat-kalkulyator.html` (251), `konditsioner-kalkulyator.html` (258), `homiladorlik-kalkulyator.html` (259), `chorva-kalkulyator.html` (261), `alkogol-kalkulyator.html` (263), `biz-haqimizda.html` (268), `yoqilgi-kalkulyator.html` (268), `kaloriya-kalkulyator.html` (271), `remont-kalkulyator.html` (281), `toy-kalkulyator.html` (284), `hamkorlik.html` (292), `omonat-kalkulyator.html` (295).
Diqqat: ro'yxatning katta qismi — kalkulyator sahifalari, ularda "kontent" asosan `seoBlock` ichidagi FAQ-uslubidagi paragraflardan iborat; forma/natija UI matn sifatida sanalmaydi. Bu — organik trafik muammosining markazida turishi mumkin: Google "yupqa" deb hisoblagan sahifa yuqori pozitsiyaga chiqolmaydi.

**3 tadan kam FAQ (6 sahifa):**
`biz-haqimizda.html` (0), `blog.html` (0), `hamkorlik.html` (0), `index.html` (0), `maxfiylik.html` (0), `shartlar.html` (0).
Eslatma: bularning barchasi kalkulyator yoki hujjat generatori EMAS — bular indeks, blog ro'yxati va huquqiy sahifalar, FAQ tabiiy ravishda mos kelmaydi. **Diqqat talab qiladigan kalkulyator/generator sahifasi FAQ<3 bilan yo'q** — bu ijobiy natija.

**Boshqa sahifalardan ichki havola olmaydigan (orfan) sahifalar:**
**Yo'q.** Barcha 63 sahifa kamida 2 ta kirish havolasiga ega — sabab: har sahifa pastidagi umumiy "Boshqa kalkulyatorlar" bloki (`#xnav`) deyarli barcha sahifalarga havola beradi. Lekin eng kam kirish havolasiga ega sahifalar diqqatga loyiq (bular asosan hujjat generatori namunalari — ular `#xnav`ga kiritilmagan, faqat `hujjatlar.html`dan havola oladi):
`uy-oldi-sotdi-shartnomasi.html` (2), `davo-arizasi-namunasi.html` (3), `xizmat-korsatish-shartnomasi-namunasi.html` (3), `dtm-2026.html` (4), `ish-haqi-malumotnomasi-namunasi.html` (4), `ishdan-boshash-arizasi-namunasi.html` (4), `kafolat-xati-namunasi.html` (4), `tavsifnoma-namunasi.html` (4).
Bular texnik jihatdan "orfan" emas, lekin 2-4 ta kirish havolasi juda kam — bu Google'ga sahifaning muhimligi haqida zaif signal beradi.

**Oxirgi yangilanish sanasi ko'rinadimi (foydalanuvchiga, sahifa matnida):**
Faqat **2 / 63** sahifada (`maxfiylik.html`, `shartlar.html`) — bu ularning huquqiy matnida "yangilangan:" so'zi borligi sababli, ataylab qo'yilgan sana ko'rsatkichi emas. **61 sahifada** foydalanuvchiga ko'rinadigan "oxirgi yangilanish" belgisi yo'q — faqat `sitemap.xml`dagi `<lastmod>` va ba'zi maqolalarda JSON-LD `datePublished` bor (bular Google uchun signal, lekin foydalanuvchi buni sahifada ko'rmaydi). Bu E-E-A-T (ishonchlilik) nuqtai nazaridan zaif tomon — ayniqsa moliyaviy/huquqiy kalkulyatorlarda foydalanuvchi "bu ma'lumot yangimi?" savolini beradi.

---

## Yakuniy xulosa

Eng katta topilma: **rus tilidagi kontent Google uchun butunlay ko'rinmas holatda** — bu ehtimol bosh sahifadan tashqari trafikning past bo'lishining asosiy sabablaridan biri, chunki O'zbekistonda rus tilida qidiruvchi segment katta. Bundan tashqari, 20 ta sahifada 300 so'zdan kam noyob kontent va 18 ta sahifada 60 belgidan uzun sarlavha bor — bular alohida, kichikroq tuzatishlar.

Ushbu fazada hech qanday kod o'zgartirilmadi. RU arxitekturasi bo'yicha qaror (Variant A/B/C) kutilmoqda.
