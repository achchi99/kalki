# Dizayn auditi — 2026-10 (1-bosqich, faqat o'qish natijasi)

Maqsad: "oddiy, professional emas, matnlar kichik, menyu kulgili" degan fikrlarning sabablarini topish. Ranglar palitrasi (to'q yashil + oltin-sariq + och fon) o'zgarmaydi. Skrinshotlar: `docs/dizayn-skrinshot/oldin-*.jpg` (390 va 1280px, to'liq sahifa). O'lchovlar: `tools/dizayn/metrics.mjs`, skrinshotlar: `tools/dizayn/shot.mjs`.

## 1. CSS va chrome tuzilishi (hozirgi holat)
- **Umumiy stylesheet YO'Q.** Har sahifada 4–7 ta inline `<style>` bloki: `index` 9 KB, `shablonlar` 6 KB, `gisht-kalkulyator` 11 KB, `kredit-kalkulyator` 17 KB. Har sahifa o'z `:root` ini qayta e'lon qiladi (18–32 o'zgaruvchi) va qiymatlar sahifadan sahifaga biroz farq qiladi (`--paper` #F5F7F5 / #F7F8F6, `--radius` 14/16px, `--wrap-max` 1120 / 720 / 560px).
- **Inline `style="…"` atributlari ko'p:** `index` 64 ta, `shablonlar` 29, `gisht-kalkulyator` 116 (xnav pill'lari, legal-links, `#fbcall`, `#genbanner`, maqola/«tegishli» bloklari). Tema o'zgartirishni qiyinlashtiradi (CSS bilan ustidan yozib bo'lmaydi, `!important` kerak).
- **Sarlavha va footer manbasi:** `tools/site-chrome.js` — `#topmenu` (menyu), `#sitebar` (logo + til), `#legal-links`, `#copyline`, `#xnav` (65 sahifada) bitta joydan HAMMA 79 sahifaga yoziladi; kanonik CSS (`CHROME_CSS`, ~2,4 KB) har sahifada qayta inline qilinadi. `verify-all` (12-band) shu bilan bir xillikni tekshiradi → sarlavhani faqat shu generator orqali o'zgartirish mumkin.
- **Prerender:** `tools/prerender.js` JS render qilgan DOM'ni statik HTML'ga yozadi (katalog kartalari, shablonlar ro'yxati). Ya'ni sahifaning "manba" HTML'i ham render natijasi; RU/CYR nusxalar UZ manbadan yasaladi (`ru/…`, `cyr/…`).
- **Shrift:** Manrope (Google Fonts), 5 vazn (400–800), har sahifada `<link>`; zaxira tizim shrifti.
- **Menyu tarjimasi:** har sahifaning o'z inline skripti `#topmenu a[data-tm-uz]` matnini almashtiradi; footer — `assets/footer-lang.js`.

## 2. Takrorlanadigan komponentlar (79 ildiz sahifa)
| komponent | sahifalar | izoh |
|---|---|---|
| `#topmenu` + `#sitebar` (sarlavha) | 79 | 2 qavat: qora menyu qatori + qora logo qatori; generator yozadi |
| `.wrap` konteyner | 79 | kengligi sahifaga qarab 560/720/1120px |
| `:root` o'zgaruvchilar | 79 | har sahifada alohida |
| `lang-seg` (til almashtirgich) | 79 | ichki matn skripti bilan |
| breadcrumb | 78 | 12.5px |
| `.seo` matn bloki | 67 | 15px |
| `answerbox` | 66 | 14.5px |
| `#xnav` («Boshqa kalkulyatorlar») | 65 | ~50 ta pill, inline uslub, 3 ta emoji |
| `#legal-links` + `#copyline` | 79 | kulrang pill'lar, 12px mualliflik qatori |
| hero/kartalar/forma/natija («chek») | bosh sahifa / kalkulyatorlar | har sahifaning o'z CSS'ida |

## 3. O'lchovlar — "oldin" (Playwright, matn belgilari bo'yicha hisoblangan shrift)
| sahifa | ko'rinish | asosiy matn (mod) | matnning <14px ulushi | <15px ulushi | menyu shrifti | sarlavha balandligi | sahifa balandligi |
|---|---|---|---|---|---|---|---|
| `/` | 390 | **13px** | **51%** | 58% | **11px** | 126px (2 qator) | 7351px |
| `/` | 1280 | 13px | 51% | 58% | 13px | 116px | 3765px |
| `/shablonlar` | 390 | 15px | 18% | 21% | 11px | 126px | 6202px |
| `/shablonlar` | 1280 | 15px | 18% | 21% | 13px | 116px | 4274px |
| `/gisht-kalkulyator` | 390 | **13px** | **62%** | **79%** | 11px | 126px | 5704px |
| `/gisht-kalkulyator` | 1280 | 13px | 62% | 79% | 13px | 116px | 4616px |

GSC (`docs/gsc`): trafikning ~68% mobil (363 / 532 klik); eng ko'p klik olgan kalkulyator — `gisht-kalkulyator` (34 klik) → uchinchi namuna sahifa shu.

## 4. Aniqlangan muammolar
**Foydalanuvchi ko'rsatganlari (tasdiqlandi):**
1. **Menyu.** 9 ta band (4 tasida emoji: 🏠 📝 📄 📰), mobilda 11–12px, ikki qavatli (qora menyu qatori tepada, logo pastda alohida qatorda), yopishqoq EMAS (mobilda 126px tepada qolib ketadi, scroll qilinganda yo'qoladi), yo'nalish bandlari ("Moliya", "Qurilish"…) bosh sahifa bo'limlariga ankor, asosiy bo'limlar (hujjatlar, shablonlar, maqolalar) kategoriyalar bilan bir qatorda.
2. **Matn kichik.** Bosh sahifada matnning yarmi <14px (kartalar tavsifi 13px, "Kalki.uz nima?" 15px, statistika 13px); kalkulyatorda label 13px, hint 12.5px, qator 14.5px, breadcrumb 12.5px, datanote 12px. Kontrast: `#8A968F` (copyline, datanote) 2.88:1, blog sanasi 2.33:1 — AA (4.5:1) dan past.
3. **Bosh sahifa "boshlang'ich sayt".** "O'ZBEKISTON UCHUN" nishoni (12px, katta harf), hero'dagi "40+ / 2 / 100%" (uchtadan "2 til" haqiqiy ko'rsatkich emas), 3 qatlamli radial gradient fon, `min-height:340px`, undan keyin qizil-binafsha gradientli "Hujjat generatorlari" bloki; 42 ta kalkulyator bir xil og'irlikdagi 3 ustunli kartalar ro'yxati (390px da sahifa 7351px), ierarxiya yo'q ("eng ko'p ishlatiladigan" yo'q).
4. **/shablonlar.** Rangli (#1A2B24) sarlavha bandi, keyin 720px tor ustun, birinchi bo'lib katta yashil-ko'k gradientli "Generatorlar" banneri (asosiy kontentdan oldin), so'ng h2 + izoh, keyin bitta ustunli ro'yxat; SEO matni 7 ta h2 bilan eng uzun qism.
5. **Umumiy.** Emoji ikonkalar hamma joyda (menyu, 42 + 17 karta, xnav pill'lari, Telegram tugmalari), gradientlar (binafsha #452B4B — palitradan tashqari rang), kategoriya uchun 5 xil chap chiziq rangi (g'isht-qizil, ko'k, binafsha…) — vizual shovqin; tugma/karta/radius/soya bir tizimda emas.

**Qo'shimcha (o'zim ko'rganlar):**
6. **Kalkulyator sahifasi.** Desktop (1280px) da ham 560px tor "mobil" ustun: forma va natija ketma-ket, natija birinchi ekrandan pastda (~y=1500px); natija "chek" shaklida (tishsimon chekka) — dekorativ, o'qish uchun foydasiz; sarlavha kategoriya rangida to'liq to'ldirilgan band (g'isht-qizil) — saytning yashil brendidan farq qiladi.
7. **Ichki sahifa sarlavhasi tartibi.** H1 dan keyin breadcrumb (odatda aksincha).
8. **Footer.** Mualliflik 12px, huquqiy havolalar kulrang tabletkalar, `xnav` ~50 ta pill (emoji bilan) — mazmunli, lekin zich; 3 ustun tuzilishi yo'q.
9. **Hit-target.** `lang-seg` tugmalari ~28–32px balandlik; mobil menyu bandlari 24–26px (44px dan past).
10. **Rang tizimi.** Har sahifada alohida `--cat`, `--cat-soft`… ; tugma rangi kategoriyaga qarab o'zgaradi (qizil "Hisoblash"), bosh CTA rangi yagona emas.

## 5. Xulosa
Asosiy sabablar: (a) umumiy dizayn tizimi yo'q — har sahifa o'z inline CSS'i bilan, (b) kichik tipografika va past kontrast, (c) emoji va gradientlar, (d) ikki qavatli, yopishqoq bo'lmagan sarlavha, (e) ierarxiyasiz katalog va "mobil ustun" kalkulyator maketi. Yo'nalish: `docs/dizayn-yonalish.md`.
