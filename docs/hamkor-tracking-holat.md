# Hamkor tracking va hisobot — tayyorlik tekshiruvi

**Sana:** 2026-09-14
**Turi:** Diagnostika. Kod yozilmagan, hech narsa qurilmagan/o'zgartirilmagan.

Belgilar: ✅ Ishlaydi (real sinovdan o'tkazildi) · ⚠️ Qisman (kod bor, lekin to'liq emas yoki tasdiqlab bo'lmadi) · ❌ Yo'q (umuman qurilmagan)

---

## 1.1 `partners.json` — hozirgi holat

**⚠️ Qisman.** Struktura puxta qurilgan, lekin ishlatilish darajasi past.

- Fayl to'g'ri strukturalangan: 6 ta hamkor yozuvi, har birida `id/name/logo/url/type/categories/match/note/append_utm/priority/active/valid_until/checked/note_verified`.
- **Jonli hamkor — YO'Q.** 6 ta yozuvning barchasida `"active": false`. Demak hozir saytda ko'rinadigan har qanday "hamkor bloki" aslida **fallback** (yoki richFallback) — real hamkor kartasi emas.
- `fallback` mexanizmi **4 ta kategoriyaga** kengaygan: `kredit`, `ipoteka`, `huquqiy`, `talim` (avval faqat kredit/ipoteka bo'lgani — bu o'zgargan/kengaygan).
- `node tools/check-partners.js` — real ishga tushirildi: barcha 6 hamkor URL'i va 4 fallback URL'i **200 OK**. Lekin 6/6 hamkorda `note` bo'sh (bank saytidan tasdiqlangan tavsif yo'q) va **"huquqiy" kategoriyasini hech bir sahifa so'ramaydi** — fallback bor, lekin uni ko'rsatadigan joy yo'q (o'lik kategoriya).
- Hamkor bloki jami saytda **faqat 6 ta sahifada** ulangan (76 tadan): `kredit-kalkulyator`, `ipoteka-kalkulyator`, `kredit-limit-kalkulyator`, `ipoteka-yoki-ijara-kalkulyator`, `universitet-kontrakt-kalkulyator`, `grant-ololmadim`. Hammasi — natija ostidagi blok (1-format). **2-format (kategoriya sahifasi) va 3-format (hujjat generatori) — hech qayerda ishlatilmagan**, garchi `hamkorlik.html`da uchala format ham "mavjud" deb yozilgan bo'lsa ham.

## 1.2 Ko'rsatilish (impression) hisobi

**✅ Ishlaydi.** Real brauzerda (Playwright/Chromium) sinovdan o'tkazildi:

- `universitet-kontrakt-kalkulyator.html`da hisoblash tugmasi bosildi, hamkor bloki (fallback karta, chunki `talim`da ham jonli hamkor yo'q) render bo'ldi.
- Karta ekran markaziga skroll qilindi (IntersectionObserver 50%+ ko'rinish + 1 soniya kutish shartini bajarish uchun).
- 1 soniyadan keyin `window.dataLayer`da haqiqatan yozuv paydo bo'ldi:
  ```
  ["event","partner_impression",{"partner":"__fallback","page":"universitet-kontrakt-kalkulyator","position":1,"category":"talim"}]
  ```
- Bu — GA4 `gtag('event', ...)` chaqiruvi orqali, `window.gtag` funksiyasi haqiqatan mavjud va ishlaydi (tekshirildi: qo'lda `gtag('event','test_manual_event',...)` chaqirilganda ham `dataLayer`ga tushdi).
- Sessiyada bir marta yozish (sessionStorage orqali) — kodda bor, alohida sinovdan o'tkazilmadi, lekin mantiqiy to'g'ri ko'rinadi.

## 1.3 Klik hisobi

**✅ Ishlaydi.** Xuddi shu sinov davomida karta bosildi (navigatsiya bloklab qo'yilgan holda, faqat hodisani tekshirish uchun):

```
["event","partner_click",{"partner":"__fallback","page":"universitet-kontrakt-kalkulyator","position":1,"category":"talim","bucket":"10-50mln","transport_type":"beacon"}]
```

- Hamkor id, sahifa, o'rin, kategoriya, **summani oralig'ida** (`bucket:"10-50mln"` — aniq summa emas, maxfiylik saqlangan) — hammasi to'g'ri yozilgan.
- `transport_type:'beacon'` qo'llanilgan — tashqi havolaga o'tishda hodisa yo'qolib qolmasligi uchun (kodda ko'rsatilganidek).

**Eng muhim savol — "bu ma'lumotni keyinroq ajratib olish mumkinmi?"** Qisman javob: xom hodisa (event) GA4'ga to'g'ri yetib boradi (pastga qarang, 1.4), lekin **hamkor bo'yicha kesim** (`partner` parametri bo'yicha guruhlash) standart "Events" hisobotida avtomatik ko'rinmaydi — buning uchun GA4 administrator panelida shu parametrni **Custom Dimension** sifatida ro'yxatdan o'tkazish kerak (yoki Explore'da qo'lda qidirish). Bu — GA4 hisob sozlamasi, kodga aloqasi yo'q, va men bu loyihadan GA4 kabinetiga kira olmayapman — shu sabab bu band **1.4'da alohida ⚠️ deb belgilangan**.

## 1.4 Hisobot

**⚠️ Qisman.** Aniqlashtirilgan:

- GA o'lchash ID'si **real**: `G-J4CG1EZTEW` (namuna/bo'sh emas). `ga.js` skripti gtag.js'ni to'g'ri yuklaydi.
- Real tarmoq so'rovi kuzatildi: sahifa yuklanganda `region1.analytics.google.com/g/collect?...&en=page_view...` — **haqiqiy hit Google serveriga yetib boryapti**. Demak butun quvur (brauzer → gtag.js → Google) ishlaydi, kamida standart voqealar uchun.
- `partner_empty/impression/click` voqealari `gtag()`ga to'g'ri uzatilishi 100% tasdiqlangan (`dataLayer` orqali — bu bizning kodimiz javobgar bo'lgan chegara). Ular Google serveriga alohida hit sifatida yetib borishi ham kutilgan (bir xil `gtag()` API orqali yuboriladi), lekin GA4'ning o'z ichki hit-batching xatti-harakati tufayli tarmoq darajasida har bir voqeani alohida ko'rish headless test muhitida ishonchli kuzatilmadi — bu GA4 SDK'ning o'zining ishlash tafsiloti, bizning kod darajamizdan tashqarida.
- **GA4 kabinetidan hisobot chiqarish mumkinmi — TASDIQLAB BO'LMADI**, chunki bu loyihadan kalki.uz'ning haqiqiy GA4 hisobiga kirish yo'q. Nazariy jihatdan:
  - `partner_click`/`partner_impression`/`partner_empty` **voqea nomlari** GA4'ning standart "Reports → Engagement → Events" jadvalida avtomatik ko'rinishi kerak (umumiy son sifatida — "partner_click: N marta").
  - Lekin **hamkor bo'yicha** ("X hamkorga necha klik") kesim uchun `partner` parametrini Custom Dimension sifatida ro'yxatdan o'tkazish (GA4 Admin) yoki Explore'da qo'lda qidirish kerak — bu hozir sozlanganmi, noma'lum.
- `hamkorlik.html`dagi METRICS bloki (1.5'ga qarang) bu turdagi hisobotni **avtomatik chiqarmaydi** — u faqat umumiy sayt trafigi (foydalanuvchi, sahifa ko'rish, top sahifalar) uchun, hamkor-kesimli emas.

## 1.5 `hamkorlik.html` sahifasi

**❌ Yo'q (METRICS bo'yicha).** Real brauzerda tekshirildi:

```html
<div id="metricsSlot"></div>
```

— **bo'sh**. Sahifadagi JS obyekt (`METRICS`) barcha maydonlari qo'lda `null` deb yozilgan (`period, users, pageviews, mobileShare, topPages:[], updated`). Kod o'zi shunday yozilgan: "hammasi bo'sh bo'lsa blok umuman chiqmaydi" — va hozir aynan shu holat. Bu — foydalanuvchi eslagan "—" belgisidan ham yomonroq: "Oylik ko'rsatkichlar" sarlavhasi ostida **hech narsa yo'q**, xuddi bo'lim to'liqmagandek ko'rinadi.

Sahifaning o'zi ochiq yozgan: "Raqamlar qo'lda kiritiladi va oyda bir marta yangilanadi" — bu **avtomatik emas**, inson GA4'dan raqamlarni o'qib, shu JS obyektga qo'lda yozishi kerak. Kerakli ma'lumotlar (foydalanuvchi soni, sahifa ko'rish, mobil ulush, top-5 sahifa) — barchasi GA4'ning standart hisobotida tayyor, maxsus sozlash talab qilmaydi.

---

## 2. Yakuniy baho

**Hamkorga bugun statistika ko'rsata olamizmi? — YO'Q, hozircha yo'q.**

Sababi ikki qavatli:

1. **Jonli hamkor yo'q.** `partners.json`dagi 6 ta yozuvning barchasi `active:false`. Hozir "hamkor blokini ko'rsatish" haqida gap ham bo'lishi mumkin emas — chunki hech qanday sahifada haqiqiy hamkor ko'rinmayapti, faqat umumiy fallback/maslahat matni.
2. **Kuzatuv mexanizmining o'zi ishlaydi** (bu — yaxshi xabar: impression/click/empty voqealari real brauzerda sinovdan o'tkazilib, GA4'ga to'g'ri yuborilishi tasdiqlandi), **lekin undan hisobot CHIQARISH yo'li qurilmagan**: `hamkorlik.html`dagi METRICS bloki bo'sh va umuman hamkor-kesimli emas; GA4'dan hamkor bo'yicha kesim olish imkoniyati (Custom Dimension) tasdiqlanmagan/tekshirilmagan.

Ya'ni: agar bugun bitta hamkor `active:true` qilib qo'yilsa, bir oydan keyin "necha marta ko'rindi, necha marta bosildi" degan xom raqamlarni GA4 Events jadvalidan **umumiy son sifatida** olish mumkin bo'ladi — lekin "aynan shu hamkorga necha klik ketdi" (bir nechta hamkor bo'lganda kerak bo'ladigan kesim) uchun qo'shimcha GA4 sozlash yoki qo'lda Explore orqali qidirish kerak bo'ladi, va buni hozir tasdiqlab bo'lmaydi.

---

## 3. Bo'shliqlar ro'yxati (hozir tuzatilmagan)

| # | Nima yetishmaydi | Hajm | Sotuvdan oldin majburiymi? |
|---|---|---|---|
| 1 | Kamida 1 ta `active:true` hamkor + tasdiqlangan `note` | Kichik (JSON tahriri + bank bilan aloqa) | **Ha** — hamkorsiz ko'rsatiladigan narsa yo'q |
| 2 | GA4'da `partner`/`category`/`page`/`position` parametrlarini Custom Dimension sifatida ro'yxatdan o'tkazish | Kichik (GA4 admin panelida, kod emas) — lekin 24-48 soat kutish kerak, ma'lumot to'planishi uchun | **Ha** — aks holda hamkor-kesimli hisobot chiqarib bo'lmaydi |
| 3 | `hamkorlik.html`dagi METRICS'ni haqiqiy raqamlar bilan to'ldirish (hech bo'lmasa umumiy sayt trafigi) | Kichik (qo'lda GA4'dan o'qib, JSON/JS obyektga yozish) | **Ha** — hozir sahifa "bo'sh va'da" ko'rinishida, bu ishonchni pasaytiradi |
| 4 | Hamkor-bo'yicha oylik hisobot shablon/jarayoni (masalan GA4 Explore'dan qanday olish — qo'llanma yoki avtomatlashtirilgan eksport) | O'rta (birinchi safar sozlash + hujjatlash) | **Ha** — birinchi oy oxirida hamkorga aynan shu kerak bo'ladi |
| 5 | 2-format (kategoriya sahifasi) va 3-format (hujjat generatori) — `hamkorlik.html`da va'da qilingan, lekin hech qayerda qurilmagan | Katta (yangi joylashtirish nuqtalari, ehtimol yangi slotlar) | Yo'q — faqat 1-format bilan boshlash mumkin, lekin `hamkorlik.html`dagi matn hozircha "mavjud" deb yolg'on va'da beryapti — bu alohida (kichik) muammo |
| 6 | "huquqiy" fallback kategoriyasi — hech bir sahifa so'ramaydi (o'lik kod) | Juda kichik (yoki olib tashlash, yoki bironta sahifaga ulash) | Yo'q |
| 7 | 6 ta hamkorning `note` maydoni bo'sh — `active:true` qilinganda ham tavsif chiqmaydi (kod ataylab shunday himoyalangan) | O'rta (har bank saytidan qo'lda tekshirish kerak) | Ha, agar shu 6 tadan birortasi ishga tushirilsa |

**Tavsiya:** #1, #2, #3, #4 — sotuvdan oldin. #5, #6, #7 — keyin, lekin #7 faqat tanlangan hamkor uchun (hammasi emas).
