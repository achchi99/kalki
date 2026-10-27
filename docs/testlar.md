# Testlar: tezlik (tools/testlar.js, kalkifit-ekranlar.mjs)

## Ish tartibi (CLAUDE.md «Ish tartibi»)
- **Iteratsiya:** `node tools/testlar.js tez --only <id>` + `npm run check:sw` + `OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs --faqat`.
- **Ish oxirida bir marta:** to'liq skrinshot + reliz darvozasi (`npm run test:tez`) → merge → production. Yiqilganlar — faqat `--only` bilan qayta.
- Fonda yurayotgan test/skrinshot kod o'zgarsa o'zi to'xtaydi (chiqish kodi 3) — eski kod natijasini kutmang, qayta boshlang.
- Bir nechta kamchilik — hammasini birga tuzating, keyin bir marta qayta tekshiring.

## O'lchov (2026-10-27, server 4 vCPU, 7,6 GB; bot xizmatlari endi CPU yemaydi)

### Asosiy topilma: darvoza CPU'ga tiralgan
To'liq to'plam haqiqiy CPU'si (Chromium bolalari bilan, cgroup orqali) **125 CPU-daqiqa**; 39 daqiqalik yurishda bo'sh CPU o'rtacha 10–15 %.
Ya'ni parallellikni oshirish o'zi tezlatmaydi — **ishni kamaytirish** yoki **keraksiz ishni yurgizmaslik** kerak.
(Avvalgi o'lchovlar `/usr/bin/time` bilan edi: Chromium jarayonlari unga ko'rinmaydi — CPU 41 daqiqa ko'ringan, haqiqatda 3 baravar ko'p.)

### Eng ko'p CPU (to'liq to'plam, keyin)
| test | haqiqiy CPU | yig'indi vaqt | eng uzun bo'lak | nima |
|---|---:|---:|---:|---|
| kontrast | 881 s | 521 s | 168 s | 83 sahifa × UZ/RU × 390/1280 × 2 holat; axe |
| kontrast-katta | 879 s | 604 s | 167 s | xuddi shu, katta shrift |
| golden | 416 s | 293 s | 120 s | kalkulyatorlar to'ldirilib hujjat matni |
| pages | 353 s | 258 s | 73 s | 83 × 2 × 4 o'lcham yuklash |
| kalkifit | 279 s | 565 s | 190 s | 31 bo'lim, endi 4 bo'lak |
| katta | 262 s | 187 s | 64 s | |
| verify-all | 256 s | 394 s | 186 s | render (183 s) + prerender ikki marta (150 s); endi 3 bo'lak |
| sticky | 232 s | 149 s | — | |
| kalkifit-soddalik | 204 s | 277 s | — | |

Sahifa sweep'lari (kontrast, kontrast-katta, golden, pages, katta, qadam, sticky, mobil) ≈ **55 CPU-daqiqa** — butun to'plamning yarmidan ko'pi.

### Kontrast bitta (sahifa, o'lcham) uchun (CPU soniya)
yuklash 0,82 · axe kiritish 0,28 · axe 2 holat 1,27 (`resultTypes: violations` bilan; to'liq natija bilan 3,4) · hisoblash 0,38.
Kontekstni qayta ishlatish sinaldi: −17 % CPU, lekin localStorage/kesh holati sahifalar orasida o'tadi — qilinmadi.

### Ochiq KalkiFit sahifasi bo'sh turganda
4 sahifa 10 s: **151 % CPU** (1,5 yadro). Sabab — idishdagi cheksiz SMIL to'lqin (`animateTransform` clipPath ichida, har kadr SVG qayta chiziladi).
SMIL to'xtatilsa — 17 %. CSS animatsiyalar arzon (sinab ko'rildi). Chromium bayroqlari (--disable-gpu, headless-shell/full) — farq yo'q.
Real testlarda foydasi kichik (sahifalar tez yopiladi): kalkifit-soddalik CPU 263 → 242 s (−8 %).

## Nima o'zgardi
1. **Haqiqiy CPU o'lchovi.** Har ish `systemd-run --user --scope` ichida — CPU Chromium bilan birga (`@@CG`). `TEST_CGROUP=0` — o'chirish.
2. **Ishchilar:** kafolatlangan `TEST_JOBS` = yadrolar − 1 (3); yuk ruxsat bersa `TEST_JOBS_MAX` = 3 × ishchi (9) gacha. Yangi jarayon faqat oxirgi ~6 s ning ENG kam bo'sh CPU'si ≥ 20 % va bo'sh xotira ≥ 1,5 GB bo'lsa (bir namunaga aldanib CPU haddan oshirilmasin). Amalda o'rtacha 4–5 jarayon.
3. **Izolyatsiya:** har ishga o'z `TMPDIR` va `SKRINSHOT_DIR` (runner yaratadi, oxirida o'chiradi), `TEST_ID`, `TEST_ISH`. `sticky`, `v2`, `pwa` endi `docs/dizayn-skrinshot` ga emas, `SKRINSHOT_DIR` ga yozadi; `v2` qat'iy port 8794 o'rniga bo'sh port. Shu tufayli **«ketma-ket» guruh bo'shadi**: `mutex: 'repo'` (verify-all barmoq izi ↔ repoga yozuvchi testlar) endi kerak emas.
4. **Bo'lim bo'yicha bo'laklash** (`bolak: N`, `tools/bolak.cjs`, `TEST_BOLAK=i/n`): `kalkifit` — 31 bo'lim, 4 bo'lak (oldin 9–10 daqiqa bitta jarayon → eng uzun bo'lak ~3 daqiqa); `verify-all` — bandlar, 3 bo'lak (6,8 → ~3,2 daqiqa). Taqsimot o'lchangan bo'lim vaqti bo'yicha (LPT), vaqtlar `tools/testlar-vaqt.json` «bolim» (`--yangila-vaqt` yozadi). verify-all'ning «24. tools/ hech nima yozmadi» bandi HAR bo'lakda yuradi. Eng uzunlar birinchi boshlanadi (bo'lak vaqti to'g'ri hisoblanadi).
5. **Qayta urinish:** yiqilgan test bir marta qayta yuriladi (`golden`, `verify-all` — yo'q, deterministik). O'tsa jadvalda **OK*** va «qayta urinib o'tdi … sababini tekshiring: <birinchi xato>» qatori. Ikkinchi marta ham yiqilsa — haqiqiy xato. `TEST_RETRY=0` — o'chirish.
6. **Shartli kutish** (`tools/dizayn/kut.mjs`: `kut()`, `barqaror()`): yuk ostida yiqilgan joylar — `til-ekran` (til tanlangach holat), `yemaydi` (tugma matni, ogohlantirish), `google` (so'rov va ism yangilanishi), `onboarding2` (yo'l-ko'rsatkich, joylashuv barqarorligi), `mashq-ui` (daqiqa almashishi ±3 kkal).
7. **axe `resultTypes: ['violations']`** — 11 chaqiruvda; o'tgan elementlar uchun selektor/tafsilot yasalmaydi. Natija aynan bir xil (16 yuklashda farq 0), axe CPU −60 %.
8. **sw.js versiyasi umumiy emas.** Har relizda `tools/sw-version.js` faqat `SW_VERSION` qatorini o'zgartiradi — ilgari bu har KalkiFit relizini to'liq to'plamga (83 sahifali sweep'lar bilan) o'tkazardi. Endi faqat shu qator o'zgarsa — `sw`, `pwa` testlari (mosligini `check:sw` va verify-all 7-band tekshiradi); sw.js'ning boshqa har qanday o'zgarishi — avvalgidek to'liq to'plam.
9. **«Tinch» preload** (`tools/test-tinch.cjs`, faqat `*.mjs` brauzer testlariga `NODE_OPTIONS`): SVG paydo bo'lgandan 1,6 s keyin (ko'tarilish tugagach) SMIL bezak to'lqinini to'xtatadi. DOM/atributlar o'zgarmaydi. Skrinshot asbobida yo'q. `TEST_TINCH=0` — o'chirish.
10. **Kod o'zgarsa to'xtash** (`tools/kod-kuzat.cjs`): har 5 s HEAD + o'zgargan/kuzatilmagan fayllar mazmuni; farq bo'lsa runner bola jarayonlar guruhini o'ldiradi, `! Kod o'zgardi (<fayl>)` va chiqish kodi 3. Ctrl+C / SIGTERM ham butun guruhni (Chromium bilan) yopadi.

## Skrinshot asbobi (kalkifit-ekranlar.mjs)
- Ekranlar **bo'limlarga** bo'lindi (tanishtiruv, bosh, asosiy, plato, android, v50, tartib, v56, afsona, v51) — har biri o'z konteksti, mustaqil.
- **To'liq rejim:** 14 kombinatsiya × bo'lim = 140 birlik, `EKRAN_PAR=4` sahifa baravar (bitta brauzer).
- **`--faqat`:** o'zgargan fayllar (`FAYL_BOLIM`) va umumiy fayl diff'idagi kalit so'zlar (`KALIT`) bo'yicha bo'limlar; 2 kombinatsiya (390 uz tungi + 360 ru yorug'). `--faqat v56,asosiy` — qo'lda; `--list` — tanlovni ko'rsatadi.
- Kod o'zgarsa to'xtaydi (chiqish kodi 3). Buzilgan belgi tekshiruvi (□ ₀ ⁰ �) — o'zgarmagan.

## Natija: oldin / keyin
| | oldin | keyin |
|---|---:|---:|
| **Odatiy reliz darvozasi** (v56: KalkiFit app/css/core + sw versiyasi) | 37,8 daq (sw.js → to'liq to'plam, 118 test) | **17,0 / 16,9 daq** (69 test, 2 yurish ketma-ket, ikkalasi yashil, qayta urinish 0) |
| To'liq to'plam (`test:toliq`, 118 test) | 39,1 daq | 37,6 daq (CPU 122 daq — CPU chegarasi) |
| Eng uzun yagona zanjir | kalkifit ~9–10 daq | kalkifit bo'lagi ~3 daq, verify-all bo'lagi ~3 daq |
| Skrinshot, to'liq (686 ekran) | 24,5 daq | **6,8 daq** (muammo 0, ikkalasida) |
| Skrinshot, iteratsiya | to'liq rejim 3–4 marta (~75–100 daq) | `--faqat`: 98 ekran **1,1 daq** |

Odatiy ish (darvoza + 1 to'liq skrinshot + iteratsiyada 3–4 `--faqat`): ~38 + 4 × 25 ≈ **140 daqiqa → ~28 daqiqa**.

**15 daqiqa maqsadi:** odatiy reliz darvozasi 17 daqiqa — 2 daqiqa ortiq. Sabab o'lchangan: tanlov 51–52 CPU-daqiqa ish, 4 yadroda (o'rtacha 12 % bo'sh) ≈ 15–16 daqiqa pastki chegara. To'liq to'plam (125 CPU-daqiqa) 4 yadroda 30 daqiqadan tez bo'lolmaydi — qamrovni kamaytirmasdan faqat ko'proq yadro yoki sweep'larni birlashtirish (quyida) tezlatadi.

## Ketma-ket / alohida qolganlar va nega
- `verify-all` 24-band — har bo'lakda alohida (o'z bo'lagidagi tool chaqiruvlari repoga yozmaganini tekshiradi). Testlar repoga yozmasligi shart (aks holda bu band yiqiladi — bu to'g'ri xato).
- `verify-all` «render» bo'limi (3/13/22-bandlar, umumiy render keshi) — bitta bo'lim: ajratilsa har bo'lak sahifalarni qayta render qiladi (CPU ikki baravar).
- `golden`, `verify-all` — qayta urinilmaydi (deterministik; qayta urinish faqat vaqt yeydi).
- Bitta `wrangler pages dev` qoidasi o'zgarmadi (testlar wrangler ishlatmaydi).

## Keyingi imkoniyatlar (qilinmadi)
- Sahifa sweep'larini (`pages`, `kontrast`, `kontrast-katta`, `katta`) bitta yuklashga birlashtirish: ~9 → 5 yuklash/sahifa (≈ −15 CPU-daqiqa to'liq to'plamda). Test id'lari va `--only` mantig'ini o'zgartiradi.
- `kalkifit` 12-bo'limi (til aralashuvi, 3 daqiqa) — ichida tillar bo'yicha bo'lish.
