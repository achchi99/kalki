# Dizayn yo'nalishi 2026 (dizayn-2026 branchi, 1-bosqich)

Holat: **3 sahifa namunasi tayyor** — `/` (bosh sahifa), `/shablonlar`, `/gisht-kalkulyator` (GSC bo'yicha eng ko'p klik olgan kalkulyator, 34 klik). Qolgan sahifalar eski dizaynda. main'ga merge qilinmagan. Audit: [dizayn-audit-2026-10.md](dizayn-audit-2026-10.md).

## 1. Tokenlar — `assets/css/tokens.css`
| token | qiymat | ishlatilishi |
|---|---|---|
| `--ink` | #0E3B2E | sarlavhalar, hero/footer foni |
| `--text` | #1A2822 | asosiy matn (14,4:1) |
| `--brand` / `--brand-hover` / `--brand-soft` | #1E6B45 / #17583A / #E8F2EC | birlamchi tugma (oq matn 6,5:1), havola, tanlangan holat |
| `--gold` / `--gold-soft` | #D99A2B / #FBF1DC | faqat urg'u: logodagi "uz", "Yangi" belgisi, kichik aksent (tugma ustida matn #2A1D00, 6,8:1) |
| `--bg` / `--surface` / `--line` | #F6F8F6 / #FFF / #DDE5E0 | fon, karta, nozik chiziq |
| `--muted` | #526459 | ikkinchi darajali matn (fonda 5,9:1, kartada 6,3:1) |
| `--moliya…--huquqiy` (+`-soft`) | mavjud 5 ta | **faqat** ikonka chipi ranglari (chap chiziq rangi va kategoriya bo'yog'i olib tashlandi) |
| tipografika | `--fs-body` 16/17px, `--fs-small` 14px, `--fs-h1` 32/40, `--fs-h2` 24/28, `--fs-h3` 18/20, `--lh` 1.6 | 900px dan keng ekranda katta qiymatlar |
| bo'shliq | 8px shkalasi (`--s1…--s7`), `--sec` 48 / 80px, `--wrap` 1120px, `--gutter` 20px, `--hdr` 64 (mobil 60) | |
| radius / soya | 12 / 10px; hover: `0 8px 24px rgba(14,59,46,.10)` | animatsiya yo'q, faqat 160ms hover/fokus |

Shrift: **Manrope** (kirill bor, avvalgisi) — vazn diapazoni `400..700` (oldin 5 ta statik vazn 400–800). Google CSS faqat ishlatilgan unicode-range bo'laklarini (latin, latin-ext, cyrillic) yuklaydi; `subset` ni API orqali cheklab bo'lmaydi, Vietnamese bo'lagi esa hech qachon yuklanmaydi (matnda yo'q). `display=swap` saqlangan.

## 2. Komponentlar — `assets/css/site.css` (faqat `<body class="v2">`)
- **Sarlavha (bitta qator, 64px, sticky, och fon):** logo (matn, "uz" oltin) · menyu (Kalkulyatorlar ▾ [Moliya, Qurilish, Kommunal, Hayotiy, Huquqiy] · Hujjatlar ▾ [Hujjat generatorlari, Shablonlar] · Maqolalar; 15,5px / 500, ikonkasiz) · til almashtirgich (UZ · RU; kirill sahifalarda "ЎЗ" uchun joy va mavjud mantiq saqlangan). Mobil: logo + til + burger; menyu pastdan emas, sarlavha ostidan to'liq ekranli panel, 18px band, 61px tegish maydoni, ochilmalar akkordeon, Escape yopadi. `assets/nav.js` (1,9 KB).
- **Tugmalar** (`.btn-primary` yashil, `.btn-ghost` chegarali, `.btn-gold` faqat kichik aksent) 44px / 10px radius; **kartalar** (`.k-card`: oq, 1px chiziq, 12px radius, 44px ikonka chipi + nom 17px/700 + tavsif 15px, hover'da soya); **chip**, **grid** (1/2/3/4/5 ustun), **bo'lim sarlavhasi**.
- **Footer** (`#sf2`, to'q): brend + bir qator, 3 ustun (Kategoriyalar · Hujjatlar · Aloqa), pastda huquqiy havolalar (barchasi saqlangan, jumladan Telegram @achchi90) va mualliflik; 15px.
- **Ichki sahifa sarlavhasi** (`.pagehead`): breadcrumb tepada, so'ng kategoriya belgisi, H1 40px, 1 jumla; rangli band yo'q.
- **Kalkulyator maketi** (`.calc-main`): ≥960px da 2 ustun — forma chapda, natija o'ngda 420px yopishqoq kartada (tishsimon "chek" olib tashlandi), natija raqami 34px `tabular-nums`; mobilda forma → natija. Labellar 15px, hint 14px, kirish 19px, tugma 52px yashil (kategoriya rangiga bog'liq emas).
- **Ikonkalar:** `assets/icons.svg` — 52 ta bir xil uslubdagi (24px viewBox, 1,5px chiziq, `currentColor`, Lucide uslubida qo'lda chizilgan) `<symbol>`, `<use href="/assets/icons.svg#i-…">`. 12 KB, bir marta yuklanadi va keshlanadi (har sahifaga inline qilinmadi — inline qilinsa 3 sahifaga ~36 KB qo'shilardi). Sahifada emoji **yo'q** (menyu, kartalar, tugmalar, xnav pill'lari; Telegram tugmalarida ham).

## 3. Sahifalar
- **Bosh sahifa:** "O'ZBEKISTON UCHUN" nishoni va "40+/2/100%" olib tashlandi; tekis `--ink` hero (H1 va 2 jumlali tavsif **aynan hozirgi matn**, 56px qidiruv, 5 kategoriya chipi). Bo'limlar: Kategoriyalar (5 karta) → Eng ko'p ishlatiladigan 8 kalkulyator (kredit, ipoteka, ish haqi, aliment, g'isht, beton, QQS, bojxona — GSC va qidiruv niyati bo'yicha) → Hujjat generatorlari (SVG tile'lar; AI e'loni shu yerda sokin karta: chap tomonda oltin chiziq) → So'nggi maqolalar (3 ta) → **Barcha kalkulyatorlar** (42 ta, `#cat-*` ankorlari va qidiruv saqlangan: ichki havolalar yo'qolmasligi uchun) → "Kalki.uz nima?" → Telegram chaqiruvi (tekis fon) → footer. Qidiruv yozilganda faqat natijalar qoladi.
- **/shablonlar:** sarlavha + 1 jumla, darhol tablar (Hammasi · Word · Excel), 3 ustunli shablon kartalari (Yuklash UZ — yashil, RU — chegarali), "Generatorlar" taklifi grid OXIRIDA kichik karta, so'ng "Tez kunda", SEO matn va FAQ (matn o'zgarmagan, 760px / 17px).
- **/gisht-kalkulyator:** yuqoridagi maket; "Foydali maqolalar" va "Tegishli kalkulyatorlar" — kartalar (SVG); `#xnav` (barcha kalkulyatorlar pill'lari, emojisiz) saqlandi.

## 4. Natijalar: oldin → keyin
| ko'rsatkich | oldin | keyin |
|---|---|---|
| matnning <14px ulushi: `/` · `/shablonlar` · `/gisht` | 51% · 18% · 62% | **2% · 2% · 6%** |
| matnning <15px ulushi: `/` · `/shablonlar` · `/gisht` | 58% · 21% · 79% | **7% · 6% · 17%** |
| asosiy matn (mod) 390px: `/` · `/shablonlar` · `/gisht` | 13 · 15 · 13px | **15 · 16 · 15px** (paragraflar 16/17px) |
| sarlavha | 2 qator, 126px (mobil) / 116px, yopishqoq emas | **1 qator, 60 / 64px, yopishqoq** |
| menyu shrifti (mobil) | 11–12px, bandlar 24–26px | **18px, 61px** (desktop 15,5px) |
| emoji (sahifada) | menyu, 42+17 karta, pill'lar, tugmalar | **0** |
| gradient | hero (3 qatlam), generatorlar bloki, Telegram bloki, banner | **0** |
| kalkulyator (1280): natijaning joyi | forma ostida, ~y=1550px | **forma yonida, yopishqoq (birinchi ekranda)** |
| sahifa balandligi 390px: `/` · `/shablonlar` · `/gisht` | 7351 · 6202 · 5704px | 12338 · 8972 · 8147px (kattaroq shrift, bo'shliq va yangi bo'limlar; to'liq katalog oxirida) |
| ichki sarlavha uslubi | `<style>` 9–11 KB har sahifada | umumiy `tokens.css`+`site.css` 13 KB (keshlanadi) + sahifa CSS 2–5 KB |

Skrinshotlar: `docs/dizayn-skrinshot/oldin-*.jpg` va `yangi-*.jpg` (to'liq sahifa), `yangi-*-ekran.jpg` (birinchi ekran), `yangi-menyu-*.jpg`.

## 5. SEO va funksional kod — o'zgarmagan (dalil)
`node tools/dizayn/seo-diff.mjs` (HEAD bilan solishtirish, 3 UZ + 3 RU sahifa): title, meta description, H1, canonical, hreflang, OG, **barcha JSON-LD** — bir xil; ichki havolalar 67→70, 25→26, 57→58 (hech biri yo'qolmagan, qo'shilganlari maqola/ariza havolalari). URL'lar o'zgarmagan. Kalkulyator mantiqi (`gisht`: 10→20 m → 1 616 → 3 231 dona), generatorlar, AI blok (`ai-ariza.js`) kodi o'zgarmagan.
`npm run check`: 33 band OK, faqat eski 15b. 15b bo'yicha: bu bosqichda yangi eskirgan fayl qo'shilmadi (toza checkout'da 133 ta → hozir 131 ta; `gisht-kalkulyator` UZ/RU yangilandi, `index` va `shablonlar` va ularning RU nusxalari prerender bilan mos); qolgan fayllar avvalgidek eskirgan.

## 6. Muhim texnik qarorlar va kelishuvlar
- **Sarlavha/footer generatori:** `tools/site-chrome.js` ga `V2_PAGES` ro'yxati qo'shildi (`index`, `shablonlar`, `gisht-kalkulyator`); ular yangi sarlavha/footer/`tokens.css`+`site.css`+`nav.js` oladi, qolgan 76 sahifa eski kanonik variantda qoladi. `verify-all` 12-band bu variantni o'zi tekshiradi (o'tadi); idempotent (prerenderdan keyin ham).
- `#topmenu` / `#sitebar` / `#langUz` / `#langRu` identifikatorlari va `data-tm-uz/ru`, `data-lf-uz/ru` atributlari saqlandi — sahifalarning mavjud til skriptlari va `footer-lang.js` o'zgarishsiz ishlaydi.
- Mualliflik va "Barcha hisob-kitoblar ma'lumot uchun" kabi eslatmalar `.foot-note` sifatida saqlandi.
- **Oltin "uz" logodagi kontrast** oq fonda 2,4:1 — bu logotip (WCAG logotiplarga talab qo'ymaydi), brend rangi shartga ko'ra saqlangan; boshqa joyda oltin faqat to'q fonda yoki to'q matn bilan.
- Prerender: faqat shu 3 sahifa (UZ + RU nusxasi) qayta yozildi; boshqa sahifalarga tegilmadi.

## 7. Keyingi bosqich (taklif)
1. Qolgan kalkulyatorlarni `V2_PAGES` ga o'tkazish: `body.v2` + `.pagehead` + `.calc-main` (CSS tayyor, sahifa ichidagi eski sarlavha/hero CSS'ni olib tashlash) — partiyalar bilan (5–8 ta).
2. Kirill (`/cyr/`) sahifalar: sarlavha uchun "ЎЗ" joyi tayyor; sahifalar JS'siz qolishi sharti (28-band) hisobga olinadi.
3. Maqola, hujjat generatorlari (`/hujjatlar`, `ariza-namunasi` va h.k.) va huquqiy sahifalar.
4. Mobil bosh sahifa uzunligini kamaytirish (katalogni kategoriya bo'yicha yig'iladigan qilish) — SEO havolalarini saqlagan holda.
5. Chrome generatorida eski variantni olib tashlash (hamma sahifa o'tgach).
