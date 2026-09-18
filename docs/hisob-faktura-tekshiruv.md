# Hisob-faktura — majburiy rekvizitlar va EHF tekshiruvi

**Sana:** 2026-09-18
**Maqsad:** FAZA 1-B — interaktiv "hisob-faktura" generatori qurishdan oldin, rasmiy manbalardan majburiy rekvizitlar va QQS to'lovchi/to'lovchi emas farqini tasdiqlash.

---

## Natija qisqacha: **TOPILDI, lekin loyiha rejasini o'zgartiradigan muhim topilma bilan**

Qidiruv "hisob-faktura veb-generatori foydali bo'ladimi" degan asl savolni ham qamrab oldi — va javob, kutilganidek "ha, shunchaki forma qur" emas chiqdi.

---

## 1. Huquqiy asos — TASDIQLANGAN (manba darajasida), band-bandigacha TASDIQLASH KERAK

- **Soliq kodeksi, 47-modda** ("Hisobvaraq-faktura") — https://lex.uz/docs/-4674902
- **Vazirlar Mahkamasi qarori 489-son, 14.08.2020, 2-ilova** — "Hisobvaraq-fakturalarning shakllari hamda ularni to'ldirish, taqdim etish va qabul qilish tartibi to'g'risida NIZOM" — https://lex.uz/docs/-4948595

Ikkala hujjat ham mavjud va manba sifatida aniq (modda/qaror raqami tasdiqlangan). Lekin **2-ilovaning to'liq, band-bandigacha rekvizitlar ro'yxati** WebFetch orqali to'liq o'qib bo'linmadi (sahifa hajmi katta, kontent kesilib qaytdi) — bu qism `TASDIQLASH KERAK` deb qoldiriladi, lex.uz'ni qo'lda ochib tekshirish kerak.

## 2. QQS to'lovchi vs QQS to'lovchi bo'lmagan farqi — `TASDIQLASH KERAK`

Hisob-faktura QQS hisobga olishning asosiy vositasi ekanligi tasdiqlangan ("xaridor faqat elektron hisobvaraq-fakturada aks etgan QQS summasini hisobga olishga haqli"), lekin QQS to'lovchi BO'LMAGAN shaxs uchun hisob-faktura umuman talab qilinadimi — aniq modda topilmadi. `soliq.uz`ning FAQ bo'limlari (`?c=9`, `?c=10`) ko'rsatildi, lekin to'liq o'qilmadi.

## 3. **MUHIM TOPILMA — Elektron hisob-faktura (EHF) tizimi, 2020-yildan majburiy**

**TASDIQLANGAN**: Vazirlar Mahkamasi qarori 522-son (25.06.2019) — https://lex.uz/docs/-4386769

- **2020-yil 1-yanvardan boshlab barcha xo'jalik yurituvchi subyektlar uchun hisob-faktura FAQAT davlat EHF tizimi (soliq.uz platformasi) orqali elektron shaklda rasmiylashtiriladi.**
- QQS hisobga olish huquqi FAQAT shu tizim orqali qabul qilingan elektron hisob-fakturalar bo'yicha beriladi.
- Qog'oz shakl faqat ikkita istisno holatda ruxsat etiladi: (a) davlat siriga oid operatsiyalar, (b) EHF tizimida texnik nosozlik bo'lganda (keyin 5 kun ichida tizimga kiritish sharti bilan).

### Bu nimani anglatadi hujjatlar.html loyihasi uchun

Agar biz asl rejadagidek — **"forma to'ldirdi → Word/PDF hisob-faktura oldi"** — degan generatorni qursak, natijaviy hujjat **rasmiy QQS hisob-fakturasi sifatida hech qanday huquqiy kuchga ega bo'lmaydi**. Xaridor bu asosda QQS hisobga ololmaydi — chunki qonun buni faqat davlat EHF tizimi orqaligina tan oladi.

Bu — saytdagi boshqa barcha `*-namunasi.html` generatorlaridan (mehnat shartnomasi, ijara shartnomasi va h.k.) **tubdan farqli holat**: ular — ikki tomon o'rtasidagi erkin shartnoma/ariza matnlari, hech qanday davlat tizimiga bog'liq emas, PDF/Word chiqishi to'liq yetarli va qonuniy. Hisob-faktura esa alohida, davlat monopoliyasidagi rasmiylashtirish jarayoniga ega.

---

## Xulosa va tavsiya

**Asl reja bo'yicha to'liq "rasmiy hisob-faktura generatori" qurish — noto'g'ri yo'nalish bo'lar edi.** Bu — soxta xavfsizlik hissi beradigan mahsulot: foydalanuvchi "hisob-faktura yasadim" deb o'ylaydi, aslida QQS uchun yaroqsiz qog'oz oladi.

**Ikkita real yo'l bor:**

1. **Kartani olib tashlash / boshqa nomga o'zgartirish** — "Hisob-faktura" o'rniga masalan "To'lov uchun hisob" (invoice, QQS'ga aloqasi yo'q, norasmiy hujjat — mijozga "shuncha pul to'lang" deb yuboriladigan oddiy hisob varag'i) qilib qayta nomlash. Bu — ko'plab kichik tadbirkorlar amalda ishlatadigan, huquqiy da'vosi bo'lmagan, foydali shablon. Forma+preview+Word/PDF arxitekturasi to'liq mos keladi, faqat sahifada aniq ogohlantirish kerak: "Bu — rasmiy QQS hisob-fakturasi emas, EHF tizimi o'rnini bosmaydi."
2. **"Hisob-faktura" nomini saqlab qolish, lekin sahifada aniq cheklov bilan** — forma EHF tizimiga kiritish uchun "tayyorgarlik" vositasi sifatida joylashtiriladi (qiymatlarni oldindan hisoblab, keyin soliq.uz'ga qo'lda kiritish uchun). Bu murakkabroq va tushuntirish talab qiladi, ehtimol foydalanuvchini chalkashtiradi.

**Tavsiya: 1-variant** — "To'lov uchun hisob" (invoice/hisob varaqasi) sifatida qayta pozitsiyalash, QQS'siz oddiy holatlar uchun. Bu — mavjud `shablon-hisob-faktura.xlsx` (statik QQS shablon, `shablonlar.html`da) bilan ham to'qnashmaydi, chunki u alohida, QQS hisoblovchi Excel format.

## TASDIQLASH KERAK bo'lib qolgan qismlar

1. PQ-489, 2-ilovaning to'liq rekvizitlar ro'yxati (https://lex.uz/docs/-4948595) — qo'lda o'qish kerak.
2. QQS to'lovchi bo'lmagan shaxslar uchun hisob-faktura talabi bor-yo'qligi (soliq.uz FAQ: `?c=9`, `?c=10`).
3. Soliq kodeksi 47-moddaning to'liq matni (https://lex.uz/docs/-4674902).

Bular hal qilinmaguncha, hatto "To'lov uchun hisob" (1-variant) sahifasi ham forma maydonlarini soliq.uz's rasmiy talablariga to'liq moslashtirib bo'lmaydi — lekin bu variant QQS hujjati bo'lmagani uchun bu cheklov unchalik kritik emas (erkin format hisob varag'i).

---

## Keyingi qadam — sizning qaroringiz kerak

Ikkala variant orasida qaysi birini tanlaysiz (yoki boshqa yo'l)?
- **A**: "To'lov uchun hisob" (invoice) sifatida qayta nomlab, ogohlantirish bilan qurish — tez, kichik xavf.
- **B**: Kartani hozircha `soon-hidden` qilib berkitib qo'yish, chunki asl va'da (rasmiy hisob-faktura) amalga oshirib bo'lmaydigan holat.
- **C**: Boshqa yo'l — aytib bering.

Yuqoridagi 3 ta `TASDIQLASH KERAK` bandini o'zingiz lex.uz/soliq.uz'dan tasdiqlab bersangiz, tanlangan variant (ayniqsa B bo'lsa) yanada aniqroq bo'ladi.
