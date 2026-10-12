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

---

# 1b-bosqich: o'ziga xoslik, ishonch, sayqal

## 1b — tanqid (1-bosqich natijasi, `docs/dizayn-skrinshot/1a-*.jpg`; har sahifada 5 ta eng zaif joy)
Baholangan majburiy nuqtalar: kategoriya rangi (yo'q edi, hammasi bir xil yashil/oq), natija kartasi (oq, forma bilan teng og'irlikda), hero (tekis, o'ng yarmi bo'sh), ishonch belgilari (yo'q), sahifa pastidagi havola uyumi, fon/karta kontrasti, forma maydonlari.

| # | sahifa | zaif joy (aniq joy → sabab) | holat |
|---|---|---|---|
| 1 | `/` | Hero, 1280px: matn va qidiruv chapda, o'ng yarmi bo'sh tekis yashil → "tayyor shablon" taassuroti, o'ziga xoslik yo'q | **tuzatildi** — nozik girih-panjara (SVG, 7% shaffoflik, chapga so'nadigan maska, ~0,4 KB inline) |
| 2 | `/` | Kategoriya kartalari va 42 ta kalkulyator kartasi bir xil (oq, bir xil yashil ikonka) → 5 bo'limni bir-biridan ajratib bo'lmaydi | **tuzatildi** — 5 sokin rang, kartaning yuqori 3px chizig'i + 44px tint plitka (rang ~11%) |
| 3 | `/` | "Barcha kalkulyatorlar" 42 ta karta ketma-ket → mobilda 12 463px, "mashhur" bilan takrorlanadi | **tuzatildi** — `<details>` (yopiq); mobil 6 779px |
| 4 | `/` | Bo'limlar bir xil ritmda, sarlavhalar yassi → qayerda nima borligi skanerlashda bilinmaydi | **tuzatildi** — kichik oltin overline + H2 (4 bo'lim) |
| 5 | `/` | Fon #F6F8F6 va oq karta deyarli bir xil → kartalar "suzmaydi", butun sahifa yuvilgan | **tuzatildi** — fon #F1F2EE, karta oq + `0 1px 2px` soya, hover'da 2px ko'tarilish |
| 6 | `/shablonlar` | Har kartada 3 ta harakat (to'ldirilgan "UZ", chegarali "RU", havola) + "(UZ)/(RU)" texnik yorliqlar → tiqilinch | **qisman** — "Yuklash:" + "O'zbekcha / Ruscha" (til nomi bilan), lekin 3 harakat saqlandi (funksiya) |
| 7 | `/shablonlar` | "Generatorlar" kartasi 3 ustunli gridda yolg'iz ostki qatorda, "Tez kunda" ham yolg'iz → o'ngda bo'sh joy | **tuzatildi** — Generatorlar kartasi gorizontal, butun kenglikdagi qator |
| 8 | `/shablonlar` | Kartalardan keyin ~2500px SEO matn va FAQ (7 + 9 ta h2) bir xil og'irlikda → "matn devori" | **tuzatilmadi (ataylab)** — SEO matn va FAQ JSON-LD'i o'zgarmasligi shart; yig'ilmadi |
| 9 | `/shablonlar` | Ishonch belgisi yo'q ("bepul", "makrossiz", formula tekshirilgani) kartalar tepasida ko'rinmaydi | **tuzatilmadi** — topshiriqda faqat kalkulyatorlar uchun; keyingi bosqichga |
| 10 | `/shablonlar` | Footer eslatmasida mualliflik takrori ("© 2026 Kalki.uz…" ikki marta), Telegram bloki ikki tilli matn bilan | **tuzatildi** — © olib tashlandi; Telegram bloki faqat joriy tilda (chrome generatori) |
| 11 | `/gisht-kalkulyator` | Natija kartasi oq va forma bilan teng og'irlikda; 34px raqam ko'zga tashlanmaydi | **tuzatildi** — to'q `--ink` karta, 40px `tabular-nums`, nozik qatorlar, Ulashish/PDF kichik tugmalar |
| 12 | `/gisht-kalkulyator` | Pastda 50 ta pill ("Kredit / Кредит" — UZ/RU aralash) + 3 ta maqola + 4 ta "tegishli" + Telegram → havola uyumi | **tuzatildi** — 5 ta tegishli karta (qurilish) + "Barcha kalkulyatorlar" `<details>` (6 guruh, 50 havola) |
| 13 | `/gisht-kalkulyator` | H1 ostida usul/manba yo'q; izoh ("Chok: …") sahifa tagida yolg'iz → ishonch va aniqlik yetishmaydi | **tuzatildi** — "Hisob usuli" qatori; izoh va "Ma'lumot … holatiga ko'ra" "Qanday hisoblandi?" ichida |
| 14 | `/gisht-kalkulyator` | Birlik ("m", "so'm") alohida kulrang katakda, maydon ~48px → forma "jadval" kabi | **tuzatildi** — birlik maydon ichida o'ngda, 56px, fokusda brend halqa |
| 15 | `/gisht-kalkulyator` | Kategoriya (qurilish) ko'rinmaydi: belgi, breadcrumb va kartalar neytral yashil | **tuzatildi** — belgi, breadcrumb'dagi kategoriya va tegishli kartalar terrakota |

**Natija: 15 tadan 12 tasi tuzatildi, 1 tasi qisman (#6), 2 tasi tuzatilmadi (#8 SEO sababli, #9 doiradan tashqari).**

## Qilinganlar (1b)
- **Kategoriya tokenlari** (`tokens.css`): `--cat-moliya #1E6B45` (brend), `--cat-qurilish #B4532E` (terrakota), `--cat-kommunal #45687C` (ko'k-kulrang), `--cat-hayot #9A680A` (oltin), `--cat-huquqiy #5A4E8C` (siyoh-binafsha), `--tint:11%`. Tint `color-mix` bilan. Ishlatilishi: karta yuqori 3px chizig'i, 44px/10px radius plitka (22px ikonka), kalkulyator sahifasida `body[data-cat]` → `--cc`: belgi, breadcrumb'dagi kategoriya, "tegishli" kartalar, `xnav` guruh sarlavhalari.
- **Natija kartasi** (to'q `--ink`): PDF yaratishda sahifa JS'iga **bitta** qo'shimcha — `html2canvas` paytida vaqtincha `pdf-light` sinfi (PDF yorug' qoladi; test: fayl yaratildi, sinf olindi).
- **Hero:** inline SVG naqsh (400 bayt) `::before` da, 7% shaffoflik.
- **Ishonch:** `Hisob usuli` qatori (gisht); `Qanday hisoblandi?` (4 qadam: devor maydoni, 1 m² ga soni, +5% zaxira, narx). SEO bloki (`#seoBlock`, FAQ JSON-LD manbai) **ko'chirilmadi** — ko'chirilsa FAQPage JSON-LD o'zgarar edi; tushuntirish `how` ichida qisqa yangi matn. Footer'da yagona qator: "Hisob-kitoblar ma'lumot uchun. Rasmiy qaror uchun mutaxassisga murojaat qiling." (eski sahifa eslatmalari — "Barcha hisob-kitoblar ma'lumot uchun", "Hisob-kitob ma'lumot uchun" — olib tashlandi).
- **Sana:** `data/legal-constants.json` da tasdiqlangan **sana** maydoni YO'Q (82 yozuv: faqat `manba_nomi`, `holat`; gisht uchun yozuv umuman yo'q) → "Yangilangan: …" qatori o'ylab topilmadi; faqat usul chiqadi. Manbali kalkulyatorlar (qqs, aliment, bojxona, kasallik varaqasi va h.k.) migratsiyasida `manba_nomi` ("Asos: …") ishlatilishi mumkin; sana uchun reestrga `tasdiq_sana` maydoni qo'shish kerak (alohida qaror). `prerender` ning git-sanasi ("Yangilangan: 2026-09-29" answerbox'da) dizayn commit'lari tufayli siljimasin deb `tools/prerender.js` da `design:` prefiksli commit'lar "kaskad" sifatida o'tkazib yuboriladi (SEO'dagi `dateModified` ham o'zgarmaydi).
- **Til tozaligi:** `Kredit / Кредит` ko'rinishidagi aralash yorliqlar V2 sahifalarda yo'q (`xnav`, `fbcall`, "tegishli" — `data-lf-uz/ru`); sinov: UZ sahifada kirill harf yo'q, RU sahifada o'zbekcha so'z yo'q.
- **"Nusxa olish":** natija kartasida bunday funksiya yo'q (faqat "Ulashish" va "PDF") — qo'shilmadi (topshiriq: "mavjud bo'lsa").
- **Forma:** birlik ichkarida, 56px, minglik ajratgich mavjud JS'da qoldi.

## Oldin → keyin (1b)
| ko'rsatkich | 1a (oldin) | 1b (keyin) |
|---|---|---|
| mobil bosh sahifa balandligi | 12 463px | **6 779px** |
| desktop bosh sahifa | 6 166px | 3 797px |
| mobil gisht / desktop gisht | 8 210 / 4 476px | 5 875 / 3 736px |
| matnning <14px ulushi | 2% / 2% / 6% | 1% / 1% / 0% |
| kalkulyator natijasi | oq karta, 34px | to'q karta, 40px |
| kategoriya rangi | yo'q | 5 ta (karta, plitka, belgi, breadcrumb) |

Skrinshotlar: oldin `docs/dizayn-skrinshot/1a-*.jpg`, keyin `1b-*.jpg` (to'liq sahifa), `1b-*-ekran.jpg` (birinchi ekran), `1b-gisht-390-natija.jpg`, `1b-index-390-mashhur.jpg`.
SEO: `node tools/dizayn/seo-diff.mjs main` — title, H1, description, canonical, hreflang, OG, **barcha JSON-LD** (dateModified ham) asl `main` bilan bir xil; ichki havolalar kamaymagan (xnav: 50 → 50).

---

# 1c-bosqich: kalkulyator sahifasi "sahifa boshi" bandi (`/gisht-kalkulyator` + RU)

**Muammo:** forma oldidan 3 ta o'xshash sokin blok (subtitle, "Hisob usuli", och yashil answerbox) ketma-ket; mobilda 3 blok forma oldidan ~290px joy egallaydi (forma sarlavhasi 1b da ~y=650px).

**Yechim:** kategoriya yorlig'i, H1, subtitle, answerbox va meta qatorlari bitta to'liq kenglikdagi bandga birlashtirildi (breadcrumb band ustida).
- **Band:** `header.pagehead.band` — fon kategoriya rangining ~6% tinti (`color-mix(var(--cc) 6%, var(--bg))`, qurilish uchun terrakota), pastida nozik chiziq. Yangi kalkulyator sahifalariga shu sinf bilan o'tadi (kategoriya `body[data-cat]` dan).
- **Desktop (≥960px):** ikki ustun — chapda yorliq/H1/subtitle (subtitle 18px, ikkinchi darajali rang), o'ngda answerbox kartasi. **Mobil:** ketma-ket, ixcham bo'shliqlar.
- **Answerbox kartasi:** oq, 1px chiziq, yengil soya; yuqorida overline "QISQACHA" (RU: "КРАТКО") + `info` ikonka (sprite'ga qo'shildi); matn 17px; pastida nozik chiziq ostida bitta qatorli meta (mobilda o'raladi): [kalendar] "Yangilangan: 2026-09-29" · [hisob] "Hisob usuli: …". Alohida "Hisob usuli" paragrafi olib tashlandi (matn o'zgarmagan, shu qatorga ko'chdi).
- **Texnik:** `answerbox.js` `#answerbox` ichini `innerHTML` bilan qayta yozadi, shuning uchun overline va "Hisob usuli" uning TASHQARISIDA, umumiy `.ab-card` ichida turadi; `#answerbox` esa `display:contents` (matn va `.ab-meta` o'sha JS yaratgani holda kartaga qo'shiladi, ikonkalar CSS mask bilan). `answerbox.js` va uning matni/sanasi o'zgarmagan.
- **DOM:** `#answerbox` endi `<main>` ning birinchi bolasi emas, balki `<header>` ichida (band tarkibida) — hujjat tartibi esa H1 → subtitle → answerbox → forma o'sha-o'sha (SEO-diff `order` tekshiruvi o'tadi). Foydalanuvchi buni "DOM tartibi" deb o'qisa, qaror kerak: muqobil — answerbox'ni `<main>` da qoldirib bandni CSS bilan "tortish" (mo'rt).
- **"Ko'proq" yig'ma kerak bo'lmadi:** matn to'liq sig'di.

**Natija (390×844):** forma birinchi maydonining sarlavhasi **"Material turi" birinchi ekranda** (pastki chegarasi **681px** < 844px) va birinchi material varianti ham ko'rinadi. Halol taqqoslash: 1b da forma allaqachon birinchi ekranda edi (~650px); yangi band undan ~30px pastroq (karta + overline + chiziq hisobiga), lekin 3 ta o'xshash blok o'rniga bitta aniq tuzilgan band bor. Birinchi urinishda 722px edi — mobil ichki bo'shliqlar ixchamlashtirilib 681px ga tushirildi. 320px da toshmaydi. Desktop: forma va natija kartasi ~y=470px dan boshlanadi.

Skrinshotlar: oldin `docs/dizayn-skrinshot/1c-oldin-gisht-390-ekran.jpg`, `1c-oldin-gisht-1280-ekran.jpg`; keyin `1c-gisht-390-ekran.jpg`, `1c-gisht-320-ekran.jpg`, `1c-gisht-1280-ekran.jpg` (+ to'liq sahifa `1c-gisht-390.jpg`, `1c-gisht-1280.jpg`).
**Tekshiruv:** `seo-diff.mjs main` (answerbox matni, sanasi, JSON-LD, tartib qo'shildi) — o'zgarishsiz; g'isht 10→20 m: 1 616 → 3 231 dona; RU: "Кратко", "Обновлено: 2026-09-29", "Метод расчёта:"; `test-v2.mjs` to'liq o'tdi.

---

# 1d-bosqich: natija kartasi — yopishqoqlik va o'lcham (`/gisht-kalkulyator` + RU)

**Muammo (desktop ~1650–1800px):** to'q natija kartasi pastga aylantirganda o'z ustunidan chiqib "Tegishli kalkulyatorlar" kartalari ustiga tushardi; karta ekrandan baland (natija + 5 qator + 2 tugma + "To'liq smeta kerakmi?") — yopishganda pastki qismi ko'rinmay "osilib" qolardi; "Qanday hisoblandi?" karta bilan bir chiziqda emasdi. `#answerbox` `<header>` ichida qoladi (foydalanuvchi qarori).

**Tuzatish**
- **Tuzilma:** `[forma | natija ustuni]` endi alohida `.calc-grid` bo'lim va **shu yerda tugaydi**. "Qanday hisoblandi?", smeta kartasi — grid ichida, forma ustunida; "Foydali maqolalar", "Tegishli kalkulyatorlar", "Barcha kalkulyatorlar", SEO matn, Telegram bloki va izohlar — `<main>` da grid'dan TASHQARIDA, to'liq kenglikda. Natija ustuni (`<aside class="res-col">`) grid qatorlarining (forma + smeta + "Qanday hisoblandi?") BUTUN balandligini egallaydi (`grid-row: 1 / span 3`, stretch), karta uning ichida yopishadi — ustundan chiqolmaydi.
- **Karta ixchamlashdi:** "To'liq smeta kerakmi?" bloki kartadan CHIQARILDI → forma ostida alohida och karta (mobilda natijadan keyin); "Qanday hisoblandi?" — smeta ostida, forma ustuni kengligida. Karta balandligi ~478px (oldin ~670px).
- **Shartli yopishqoqlik** (`assets/calc-v2.js`, 0,9 KB): `.res-col.is-sticky` faqat (a) ≥1024px va (b) karta balandligi ≤ ekran balandligi − 64 − 32 bo'lsa; `ResizeObserver` (natija qatorlari o'zgarganda) + `matchMedia` + `resize` bilan qayta hisoblanadi. `top: 88px`. Aks holda karta oddiy (statik). Mobilda o'zgarish yo'q.
- **Qo'shimcha topilma (1b xatosi, tuzatildi):** chrome generatori Telegram blokini (`#fbcall`) "Qanday hisoblandi?" `<details>` ICHIGA qo'yib yuborgan edi (foot-note shu yerda bo'lgani uchun) — u yopiq blokda yashirin qolgan. Endi foot-note `<details>` ichida bo'lsa, blok `</main>` oldiga qo'yiladi (`tools/site-chrome.js`); sahifada Telegram bloki ko'rinadi.

**Sinov** (`node tools/dizayn/test-sticky.mjs`, avtomatik; har o'lchamda sahifa 10 pozitsiyada aylantiriladi, karta bounding-box'i `#related`, `#xnav`, `#fbcall`, `#articleLink`, `#seoBlock`, "Qanday hisoblandi?" va smeta bloki bilan kesishmasligi hamda o'z ustunidan chiqmasligi tekshiriladi):

| ekran | karta balandligi | holat | 10 pozitsiyada kesishish |
|---|---|---|---|
| 1280×720 | 478px (≤ 624) | sticky | **0** |
| 1440×900 | 478px | sticky | **0** |
| 1650×900 | 478px | sticky | **0** |
| 1920×1080 | 478px | sticky | **0** |
| 1280×520 | 478px > 424px | **sticky EMAS** (statik) | — |
| balandlik 520→900 (resize) | — | sticky yoqiladi | — |
| 1000px kenglik (<1024) | — | sticky emas | — |
| natijaga 6 qator qo'shilsa (720px) | — | sticky'likdan chiqadi (ResizeObserver) | — |
| 390 / 320px | — | statik, toshmaydi, forma → natija → smeta | — |

Skrinshotlar (har o'lchamda tepa/o'rta/past): `docs/dizayn-skrinshot/1d-gisht-{1280x720,1440x900,1650x900,1920x1080}-{tepa,orta,past}.jpg`.
Boshqa tekshiruvlar: g'isht 10→20 m: 1 616 → 3 231; SEO diff (`seo-diff.mjs main`) o'zgarishsiz; `test-v2.mjs` to'liq o'tdi.

---

# 2-bosqich: butun saytga tarqatish — sahifa turi shablonlari

Yangi dizayn ixtiro qilinmadi: tasdiqlangan 1a–1d sahifalaridan umumlashtirildi. O'tkazish vositasi — `tools/dizayn/convert.py` (UZ manbaning markup qobig'ini o'zgartiradi, kontent matni o'zgarmaydi), keyin `site-chrome.js --write` (sarlavha/footer/CSS) va `prerender.js --write` (UZ + RU). V2 ro'yxati — `tools/dizayn/v2-pages.json`; sahifa turi/kategoriya — `tools/dizayn/pages.json`.

## Kalkulyator (`convert.py calc`) — `/gisht-kalkulyator` naqshi
- **Sahifa boshi bandi** (`header.pagehead.band`): kategoriya yorlig'i + H1 + subtitle (chapda) | answerbox kartasi (o'ngda; mobilda ostida): overline "Qisqacha" + `info` ikonka, matn 17px, pastida meta ("Yangilangan: …" — answerbox.js yaratadi). `#answerbox` `<header>` ichida, `display:contents`. **"Hisob usuli" qatori faqat gisht'da** (matni sahifaning o'z SEO matnidan olingan); boshqa kalkulyatorlarga **qo'shilmadi** (manba yo'q — o'ylab topilmaydi). Breadcrumb band ustida.
- **`.calc-grid`**: `[.calc-form | <aside class="res-col">]` — forma bilan birga uning oldidagi hamma narsa (rejim tablari, izohlar, ogohlantirishlar) `.calc-form` ichida, natija kartasi(lar)i aside'da. Karta faqat asosiy natija uchun (to'q `--ink`, 40px raqam); `#smeta-cta` kartadan chiqarilib forma ostida. Grid TUGAGANDAN keyin: jadval, grafik, ssenariy bloklari (`.sched`, `.scen-wrap`, hamkor bloki), `#datanote` — to'liq kenglikda, gorizontal aylanadigan (mobilda `.tbl-wrap`/`.tbl-shell` o'z `overflow`i bilan).
- **Natija hali ko'rsatilmagan** (receipt yashirin): ustun bo'sh qolmasin deb sokin joy egasi ("Natija shu yerda ko'rinadi", CSS `:has` + `html[lang]`); natija chiqqach joy egasi yo'qoladi, joylashuv sakramaydi.
- **Shartli sticky** (`assets/calc-v2.js`): ≥1024px va karta balandligi ≤ ekran − 96px; ustundan chiqmaydi.
- **PDF:** `html2canvas` paytida vaqtincha `pdf-light` sinfi (sahifaning mavjud inline kodiga bitta qo'shimcha — natija PDF'i yorug' qoladi).
- **Pastki qismi:** "Foydali maqolalar" (kartalar, ikonka plitkasi) → "Tegishli kalkulyatorlar" (shu kategoriyadan 5 tagacha karta, `index.html` dagi nomlar/tavsiflar bilan) → "Barcha kalkulyatorlar" `<details>` (`xnav`, 50 havola, 6 guruh) → Telegram bloki → footer. `tgcta` (Telegram tugmasi) olib tashlandi (`#fbcall` bilan takror).
- **Rang:** `body[data-cat]` → `--cc` (karta yuqori chizig'i, ikonka plitkasi, yorliq, breadcrumb'dagi kategoriya).
- **Emoji:** ikonka sifatida yo'q (UI yorliqlari va holat belgilaridan olib tashlandi); **H1 va undan olingan matnlardagi emoji (aliment) SEO uchun o'zgarmadi** — shablondan chetga chiqish.

## Generator (`convert.py gen`) — `/ariza-namunasi`, `/ishonchnoma-namunasi`
- Sahifa boshi bandi (kalkulyatordagi kabi, `ab-card` + `Qisqacha`), `<main class="gen-main">`; qolgani (To'ldirish/Hujjatni ko'rish tablari, `dg-*` forma kartalari, ko'rik `#docPreview`, "Tayyor ariza matnlari", howto, FAQ) o'z tuzilmasida; CSS: `dg-*` kartalar oq/chiziq/soya, label 15px, hint 14px, maydon 52px+, bo'lim sarlavhasi 13px; emoji → SVG plitka (`rc-ic`).
- **`#docPreview` ko'rinishi va hujjat matni (Word/PDF/chop etish) o'zgartirilmadi**: PDF shu elementdan olinadi; faqat grid kengligi tufayli tasvir kengligi 520→541px (balandlik bir xil, sahifa soni bir xil) — mazmun va tartib bir xil.
- **AI blok** (`assets/ai-ariza.js`): dizayn o'zgarmagan; sarlavhadagi `✨` emoji sprite'dagi `sparkles` SVG ga almashtirildi (5-qoida); so'rov formati (`vaziyat`, `yozuv`, `mijoz_id`, `turi`) o'zgarmagan (mock bilan tasdiqlangan).
- Sticky `viewSeg` (mobil tab paneli) sarlavha ostiga (`top: hdr + 8px`).

## Ro'yxat/hub (`/shablonlar`, `/hujjatlar`, `/blog`)
`/shablonlar` naqshi: sarlavha + 1 jumla, darhol tablar/filtr, kartalar gridi (3 ustun, rang chizig'i + plitka), taklif kartalari grid oxirida kichik qator, SEO matn pastda. (`/hujjatlar`, `/blog` — 4-partiyada.)

## Maqola (`*-2026`) — 4-partiya uchun belgilangan
O'qish uchun tor ustun (max ~720px), asosiy matn 18px/1.7, H2/H3 ritmi (H2 28px, H3 20px, yuqori bo'shliq 40/32px), jadval (zebra, gorizontal aylanadi), ro'yxatlar, iqtibos bloki; oxirida "Tegishli kalkulyatorlar" kartalari; sarlavha bandi — kategoriya tinti. Kontent va JSON-LD o'zgarmaydi.

## Huquqiy va boshqa (`maxfiylik`, `shartlar`, `biz-haqimizda`, `hamkorlik`, `offline`) — 4-partiya uchun belgilangan
Maqola uslubidagi sokin matn sahifasi (tor ustun, 17px, bo'sh band: tint o'rniga neytral), kontaktlar/jadvallar mavjud tuzilmada. `offline.html` — SW keshida turadi (yangi CSS precache ro'yxatiga qo'shilishi kerak: `/assets/css/*` va `/assets/icons.svg`).

## Umumiy qoidalar
Faqat `tokens.css` + `site.css` komponentlari; emoji yo'q (sprite ikonkalari); sahifa ichidagi eski rangli sarlavha/hero CSS'i `body.v2` qoidalari bilan ustidan yoziladi (4-qismda — tozalash bosqichida — o'chiriladi). `/cyr/` sahifalar JS'siz qoladi: ular UZ manbadan prerender qilinadi, shuning uchun V2 UZ sahifa o'tkazilganda `cyr/` nusxalar **qayta yozilmaydi** (5-partiyagacha eski holatda).

## 1-partiya tuzatishlari: natija kartasi qoidalari va kontrast testi

- **To'q karta faqat asosiy natija uchun**: asosiy raqam + 3–6 qator + Ulashish/PDF (+ manba qatori). Diagramma, slayder/simulyator, jadval, izoh bloklari kartadan chiqarilib, grid ostidagi alohida oq kartalarga (`.res-extras`) o'tadi (`convert.py refine`).
- **Skelet**: natija yo'q paytda haqiqiy karta ("0 so'm", qatorlar "—", "Ma'lumot kiriting — natija darhol hisoblanadi"), punktir ramka yo'q; `.receipt.show + .res-skel{display:none}`. Skeletdagi elementlarda `id` bo'lmaydi.
- **Ranglar**: asosiy qarz = brend yashil, foiz = `--gold-chart` (oq fonda ≥3:1), o'q yozuvlari `--muted`. To'q fondagi barcha matn ≥4.5:1; to'q qoidalar faqat `.receipt-body` ichida.
- **Majburiy kontrast testi** (har partiyada): `node tools/dizayn/test-kontrast.mjs [slug,...]` — axe-core `color-contrast`, UZ+RU, 390/1280, 2 holat (boshlang'ich / hisoblangan), diagramma seriyalari ≥3:1. Nolta xato bo'lmaguncha partiya topshirilmaydi.
- H1 emoji olib tashlandi (aliment; ishdan-boshatish — o'z partiyasida). `seo-diff.mjs` faqat shu farqni "ruxsat etilgan" deb alohida hisoblaydi.

## 2-partiya (qolgan 33 kalkulyator): qo'shimcha andozalar

- `.norm-banner` natija bannerli sahifalar (dtm, kaloriya): banner `aside.res-col` ga o'tadi, to'q karta sifatida bo'yaladi; yopishqoq faqat `.receipt` uchun.
- Kalkulyator bo'lmagan eski "related" havolalar (generator, .xlsx) yangi kartalar qatorida saqlanadi (SEO: ichki havolalar kamaymaydi).
- Eski per-sahifa palitra (`--accent`, `--cat-text` — to'q sarlavha uchun yorqin) V2 da `body.v2[data-cat]` orqali o'qiladigan qiymatga almashtirilgan.
- Skeletdagi id'siz elementlar `data-skel-src` bilan asl elementdan matn oladi (`calc-v2.js`).
- Testlar uchun umumiy "hisoblash" yordamchisi: `tools/dizayn/hisobla.mjs` (details ochadi, tanlov/sana/son maydonlarni to'ldiradi). Testlarni parallel yurgizsangiz 5–6 tadan oshirmang (ortiq yuklama oltin testda tasodifiy farq beradi).
- grant-ololmadim, yer-konvertor: natija kartasi yo'q (jonli ro'yxat/konvertor) — grid qo'llanmadi, faqat sarlavha/palitra/kontrast.

## Yakuniy bosqich (3–5-partiya, tozalash, yakuniy tekshiruvlar)

- Barcha 79 sahifa (UZ+RU, /cyr/ 4 ta) V2; `tools/site-chrome.js` da eski sarlavha/footer yo'li olib tashlandi (`v2-pages.json` da bo'lmagan sahifa — xato). `tokens.css` dagi eski kategoriya aksentlari o'chirildi.
- Sahifalarning inline `<style>` idagi eski sarlavha/topbar/til-tugmasi qoidalari `tools/dizayn/cleanup-css.py` bilan olib tashlandi (−63 KB); piksel-hash (`shot-hash.mjs`) 158 skrinshotdan 57 tasida faqat til tugmasi (UZ/RU) yonidagi harf oralig'i/fokus ramkasi o'zgardi, qolgani baytma-bayt bir xil.
- /cyr/: JS yo'q, mobil menyu CSS-only (`input.nav-chk`), ochilmalar desktopda :hover/:focus-within, mobilda doim ochiq (`prerender.js` 5b).
- Testlar (har partiyada majburiy): `oltin.mjs compare`, `seo-diff.mjs main`, `test-pages.mjs`, `test-sticky.mjs`, `test-kontrast.mjs`, `test-cyr.mjs`, `test-hisob-siyosati.mjs <main-worktree>`, `test-sw.mjs`, `npm run check`. Parallel yurgizsangiz 5–6 jarayondan oshirmang.
- Lighthouse (mobil, lokal, tashqi shrift/reklama resurslari yo'q muhit): ishlash ko'rsatkichlari main bilan bir xil (index 42 / 42, kredit 40 / 39, qqs-2026 71 / 71, hujjatlar 40 / 37); Accessibility 95 → 100; Best Practices 100, SEO 100.
