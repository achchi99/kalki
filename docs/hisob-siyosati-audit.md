# Hisob siyosati generatori — FAZA 0 audit

**Sana:** 2026-08-28. Kod o'zgartirilmadi — faqat mavjud holat tekshirildi
va yangi `data/hisob-siyosati.json` skeleti yaratildi (bandlar strukturasi,
matnsiz).

## 1. `docgen.js` / `KD.page()` naqshi — moslikmi yoki kengaytirish kerakmi?

`assets/docgen.js` (927 qator) to'liq o'qildi. Xulosa: **asosiy mexanizm
(forma, saqlash, preview, docx eksport) to'g'ridan-to'g'ri mos keladi,
lekin ikkita joyda kengaytirish kerak bo'ladi:**

### 1.1 Mos keladigan qismlar (o'zgarishsiz ishlatiladi)
- `KD.init(cfg)` — forma render, localStorage saqlash, URL orqali ulashish
  (`?p=`), qayta chizish mantiqi — hech qanday o'zgarishsiz ishlaydi.
- `KD.fmtNum`, `KD.money`, `KD.num2words`, `KD.fmtDate`, `KD.blank`/`KD.v`
  — rekvizit maydonlari va sanalarni formatlash uchun to'g'ridan-to'g'ri
  ishlatiladi.
- `blocksToDocx()` / `buildDocx()` / `loadDocx()` — **1.6-bandning javobi
  shu yerda allaqachon bor**: sayt `docx` npm kutubxonasini (bundled,
  `assets/docx.umd.min.js`, lazy-load qilinadi) ishlatadi. Bu variantni
  qayta ko'rib chiqishga hojat yo'q — sayt bo'ylab izchillik uchun ham,
  texnik sifat uchun ham eng to'g'ri tanlov. **Tavsiya: xuddi shu
  mexanizmdan foydalanish, yangi kutubxona kiritilmaydi.**
- `KD.page({I, FAQ, CFG, titles, descriptions})` — sahifa darajasidagi
  til almashtirish, SEO, FAQ blok — o'zgarishsiz.

### 1.2 Kengaytirish kerak bo'ladigan qismlar (FAZA 1 uchun eslatma)
1. **Ikkita hujjat, bitta forma.** Hozirgi `cfg.doc(v,c,lang)` FAQAT bitta
   blok ro'yxati qaytaradi → bitta `wordBtn` → bitta `.docx`. Hisob
   siyosati uchun BUP va NUP alohida fayl bo'lishi kerak (0.A). Eng kichik
   o'zgarish: `cfg.doc` o'rniga `cfg.docs = {BUP: fn, NUP: fn}` qabul
   qiladigan variant, va ikkita alohida "Word" tugmasi (`wordBtnBup`,
   `wordBtnNup`) — `KD.init()`ga oz sonli, orqaga mos (backward-compatible)
   o'zgartirish kifoya, chunki `cfg.doc` mavjud bo'lganda eski yo'l
   ishlashda davom etadi.
2. **Profil + band kutubxonasi bo'yicha matn tanlash — docgen.js'da
   umuman yo'q mexanizm.** Mavjud generatorlarda har band matni bitta
   (foydalanuvchi maydonlari bilan to'ldiriladi), tanlov yo'q. Hisob
   siyosatida esa har band uchun (a) `tanlov_erkinligi` bo'yicha
   ko'rsatish/yashirish, (b) `profillar` bo'yicha filtrlash, (c)
   `holat:"TASDIQLASH KERAK"` bo'lsa placeholder chiqarish kerak. Bu —
   **legal-constants.json'ni o'qish naqshining** (kalkulyatorlarda
   ishlatilgan) hujjat-generatsiya versiyasi. Yangi, alohida modul
   (`assets/hisobsiyosati.js`) sifatida qurilishi kerak — `docgen.js`ning
   o'zi o'zgartirilmaydi, faqat undan `KD.*` yordamchi funksiyalari
   import qilinadi (xuddi kalkulyator sahifalari `assets/lang.js`dan
   foydalanib, o'z compute() mantig'ini alohida yozgani kabi).

**Xulosa:** mavjud naqsh **buzilmaydi, kengaytiriladi**. Yangi arxitektura
ixtiro qilinmaydi (talabga mos).

## 2. `data/hisob-siyosati.json` skeleti

Yaratildi — **26 band** (BUP: 16, NUP: 10), **39 variant**, barchasi
`matn_uz`/`matn_ru`: `null`, `holat`: `"TASDIQLASH KERAK"`.

`tanlov_erkinligi` taqsimoti: `erkin` — 16, `shartli` — 8, `qatiy` — 2
(ikkalasi ham NUP amortizatsiya bandlari — 0.C ga qarang).

### 2.1 Muhim chegara qarori: bandlar vs forma maydonlari

1.4-bo'limda "I. Umumiy qoidalar" ostida "rekvizitlar, moliyaviy yil,
dastur" ham sanab o'tilgan. Bularni **band kutubxonasiga kiritmadim** —
sabab: bular huquqiy tanlov emas, foydalanuvchi ma'lumoti (tashkilot
nomi, STIR va h.k.). Ular mavjud `docgen.js` naqshidagi oddiy forma
maydonlari (`cfg.sections[].fields`) orqali to'ldiriladi, xuddi boshqa
hujjat generatorlaridagi F.I.Sh./manzil maydonlari kabi — `asos_nomi`
kerak emas, chunki "tashkilot nomi"ning huquqiy asosi yo'q.

Faqat **haqiqiy metodologik tanlov** talab qiladigan narsalar (masalan
"buxgalteriya hisobini yuritish shakli") band sifatida kiritildi. Bu
chegara FAZA 1'da sahifa qurilishida qayta ko'rib chiqilishi mumkin —
agar noto'g'ri chizilgan bo'lsa, aytib bering.

### 2.2 Har bandga `asos_nomi`

Barcha 26 bandda `asos_nomi` to'ldirilgan. **Eski NSBU №1 (МЮ 474,
1998)ga bitta marta ham havola qilinmadi** — tekshirildi (`grep -c "474"
data/hisob-siyosati.json` → 0). Yangi NSBU №1 (buyruq №130, 14.06.2024,
MYU 3544) faqat tegishli bandlarda (kuchga kirish sanasi, o'zgartirish
tartibi) ishlatilgan.

**Ochiq qoldirilgan 3 ta band** — aniq NSBU raqami bilinmagani uchun
`asos_nomi`da "FAZA 3'da aniq raqami tasdiqlanishi shart" deb belgilab
qo'ydim (buxgalter/huquqshunos tomonidan tasdiqlanishi kerak):
- `bup_nomoddiy_aktivlar_amortizatsiya` — nomoddiy aktivlar bo'yicha NSBU
- `bup_daromadni_tan_olish` — daromadlar bo'yicha NSBU
- `bup_zaxiralar` — majburiyatlar/zaxiralar bo'yicha NSBU
- `bup_valyuta_kurs_farqlari` — valyuta kurs farqlari bo'yicha NSBU

Bu — legal-constants'dagi "aniq manba topilmaguncha `TASDIQLASH KERAK`
qoldirish" qoidasining aynan o'zi, endi `asos_nomi` darajasida ham
qo'llanildi: noaniq manbani "ehtimol shu" deb yozib qo'yish o'rniga,
ochiq "aniqlashtirish kerak" deb belgiladim.

### 2.3 NUP amortizatsiyasi — 0.C tuzog'i strukturada qanday hisobga olindi

`nup_foyda_soligi_amortizatsiya` va `nup_amortizatsiya_meyorlari_guruhlar`
bandlari `tanlov_erkinligi: "qatiy"` bilan belgilandi — FAZA 1'da sahifa
qurilishida bu ikkalasiga **hech qanday tanlov UI ko'rsatilmaydi**,
tayyor (yagona) variant to'g'ridan-to'g'ri chiqadi. Bu — 0.C'dagi eng
xavfli xato ("foydalanuvchiga soxta tanlov berish") arxitektura
darajasida oldindan yopilgan.

## 3. `.docx` eksport — taqqoslash va tavsiya

| Variant | Xulosa |
|---|---|
| `docx` npm kutubxonasi (bundled) | **✅ Tavsiya — allaqachon ishlatilyapti.** Sayt bo'ylab barcha hujjat generatorlari shu yo'l bilan ishlaydi (`assets/docx.umd.min.js`, lazy-load, CDN emas). Haqiqiy `.docx` fayl, Word to'g'ridan-to'g'ri ochadi, jadval/imzo joylari to'g'ri chiqadi. Yangi kutubxona qo'shish shart emas. |
| HTML → `.doc` saqlash | Rad etildi — Word ochadi, lekin haqiqiy `.docx` emas (eski binary-uyoq format simulyatsiyasi), formatlash cheklangan, saytning qolgan qismidan uzilib qoladi. |
| Server tomonda generatsiya | Talabda aniq rad etilgan — statik arxitekturani buzadi. |

**Yakuniy tavsiya:** yangi tanlov kerak emas — mavjud `docx`
kutubxonasidan, ikkita alohida chaqiruv orqali (BUP uchun bitta
`Document`, NUP uchun bitta `Document`) foydalaniladi.

## 4. Bajarilmagan/qamrovdan chiqarilgan

- Sahifa (`hisob-siyosati-generatori.html`) hali yaratilmadi — FAZA 1.
- `assets/hisobsiyosati.js` (yig'ish mantiqi) hali yozilmadi — FAZA 1.
- Bandlar matni — barchasi `TASDIQLASH KERAK`, FAZA 2 (universal
  bandlar) va FAZA 3 (usuliy bandlar, bloklangan) uchun qoldirilgan.
- 4 ta bandning `asos_nomi`si to'liq aniq emas (2.2-bandga qarang) —
  FAZA 3'dan oldin buxgalter/huquqshunos tomonidan tasdiqlanishi shart.

## 5. Keyingi faza tavsiyasi

FAZA 1'ga o'tishga tayyor: sahifa qurish + yig'ish mantig'i. Ikkita
texnik qaror allaqachon FAZA 0'da hal qilindi (docx kutubxonasi,
bandlar/forma-maydonlari chegarasi) — FAZA 1 shu asosda davom etishi
mumkin, qo'shimcha tadqiqot kerak emas.
