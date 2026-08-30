# GSC tahlili — 2026-08 (FAZA 4.1: diagnostika)

Ushbu hisobot FAZA 4.1 doirasida tayyorlandi: **bironta kod fayli o'zgartirilmagan**. Kirish ma'lumoti — foydalanuvchi taqdim etgan GSC saytga xos xulosalar (29.08.2026 holati) va saytning joriy kodini statik tekshirish.

---

## 1.1 — Pozitsiya tushishi sababini tasdiqlash

**Holat: BLOKLANGAN — GSC eksporti kerak.**

Bu vazifa GSC'ning **Samaradorlik → Sahifalar** bo'limidan, so'nggi 7 kun va oldingi 7 kun solishtiruvi bo'yicha **sahifa darajasidagi** pozitsiya ma'lumotini talab qiladi (har bir URL uchun alohida o'rtacha pozitsiya, ikkala davr uchun). Foydalanuvchi promptida berilgan ma'lumot faqat **sayt darajasidagi umumiy** ko'rsatkichlarni o'z ichiga oladi (kliklar/ko'rsatilishlar/CTR/pozitsiya — bitta yig'indi raqam) — bu daraja bilan "eski sahifalar pozitsiyasini saqlab qoldimi, yoki yangi sahifalar past pozitsiyada kirib umumiy o'rtachani pastga tortdimi" degan savolga **javob berib bo'lmaydi**. Ikkala stsenariy ham bir xil sayt-darajasidagi raqamlarni berishi mumkin.

Kerakli eksport: GSC → Samaradorlik → **Sahifalar** jadvali, "Solishtirish" rejimida (so'nggi 7 kun / oldingi 7 kun), CSV. Har qatorda: URL, joriy davr pozitsiyasi, oldingi davr pozitsiyasi.

**Taxmin yozilmadi** — foydalanuvchining o'zi ta'kidlagan qoidaga muvofiq (0.G/Batch 3 uslubi bu yerga ham qo'llanildi).

## 1.2 — CTR bo'yicha eng katta imkoniyat sahifalari

**Holat: BLOKLANGAN — GSC eksporti kerak.**

Formula (ko'p ko'rsatilish + past CTR + pozitsiya 5-15) sahifa darajasidagi CTR va pozitsiya ma'lumotini talab qiladi. Promptda faqat **so'rov darajasidagi** (query-level) top 7 so'rov berilgan, ular qaysi **sahifaga** tushayotgani (landing page) ko'rsatilmagan — bitta so'rov bir nechta sahifaga tushishi mumkin (masalan "ariza qanday yoziladi" `ariza-namunasi.html`ga ham, potentsial kelajakdagi blog maqolasiga ham tushishi mumkin).

Kerakli eksport: GSC → Samaradorlik → **Sahifalar** jadvali (pozitsiya, taassurotlar, CTR ustunlari bilan), CSV — yoki har bir yuqori-taassurotli sahifa uchun "Sahifalar" filtrini qo'llab, o'sha sahifaga tushgan so'rovlar ro'yxati.

**Taxmin qilingan (past ishonch, faqat yo'l ko'rsatish uchun, TASDIQLANMAGAN):** berilgan so'rovlardan `ariza yozish namunasi` (39 taassurot, CTR 2,6%) ehtimol `ariza-namunasi.html`ga tushmoqda — bu sahifaning joriy sarlavhasi ("Ariza namunasi — onlayn to'ldirib, Word yuklab oling") so'rov iborasidan farq qiladi (so'rovda "yozish", sarlavhada yo'q). Bu — **faqat gipoteza**, GSC eksporti bilan tasdiqlanmaguncha 4.2'da amalga oshirilmasin.

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

## Xulosa va keyingi qadam

1.3 to'liq — klaster tuzilmasi va ikkita aniq topilma (son nomuvofiqligi, bir tomonlama ichki havola) tayyor, FAZA 4.2/4.3/4.4'da ishlatiladi.

1.1 va 1.2 — **ikkalasi ham GSC'ning sahifa-darajasidagi (Samaradorlik → Sahifalar) eksportini talab qiladi**, bu ma'lumot hozircha yo'q. FAZA 4.2'ning "real so'rovlarni title'ga aynan kiritish" qoidasi ham shu eksportsiz bajarilishi mumkin emas — sahifa boshiga qaysi so'rovlar kelayotganini bilmasdan, qaysi iborani title'ga kiritish kerakligini aniqlab bo'lmaydi.
