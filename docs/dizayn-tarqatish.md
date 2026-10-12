# Dizayn tarqatish jarayoni (V2 → butun sayt)

Manba: `tools/dizayn/pages.json` (inventar: tur, kategoriya, GSC kliklari, partiya), `tools/dizayn/v2-pages.json` (V2 ro'yxati), `tools/dizayn/holat.json` (test natijalari). Jadvalni qayta yig'ish: `python3 tools/dizayn/tarqatish-doc.py`.

**Partiyalar:** 0 — tasdiqlangan 3 sahifa; 1 — GSC bo'yicha eng ko'p kiriladigan 10 ta generator/kalkulyator; 2 — qolgan kalkulyatorlar; 3 — qolgan generatorlar; 4 — maqola, hub, huquqiy, boshqa; 5 — `/cyr/` (JS'siz, alohida).

**Tekshiruvlar:** *oltin* — `tools/dizayn/oltin.mjs compare` (kalkulyator natijalari 3 kirish to'plami, generator matni + Word matni + PDF sahifa/hajm, AI blok mock); *SEO* — `tools/dizayn/seo-diff.mjs main` (title, H1, description, canonical, hreflang, OG, JSON-LD, answerbox matni/sanasi/tartibi, ichki havolalar kamaymasligi); *sahifa testi* — `test-pages.mjs` (320/390/768/1280 toshish, konsol, emoji, til tozaligi); *sticky* — `test-sticky.mjs`.

## Jarayon jadvali

| sahifa | tur | kategoriya | partiya | RU | CYR | klik UZ+RU | holat | oltin | SEO | sahifa testi | sticky |
|---|---|---|---|---|---|---|---|---|---|---|---|
| index | hub | — | 0 (tasdiqlangan 1a–1d) | ha | — | 64 | V2 | n/a | OK | OK | n/a |
| gisht-kalkulyator | kalkulyator | Qurilish (--cat-qurilish) | 0 (tasdiqlangan 1a–1d) | ha | — | 34 | V2 | OK | OK | OK | OK |
| shablonlar | hub | — | 0 (tasdiqlangan 1a–1d) | ha | — | 0 | V2 | n/a | OK | OK | n/a |
| ariza-namunasi | generator | Hujjat (brend) | 1 | ha | ha (eski) | 105 | V2 | OK | OK | OK | n/a |
| aliment-kalkulyator | kalkulyator | Huquqiy (--cat-huquqiy) | 1 | ha | ha (eski) | 40 | V2 | OK | OK | OK | OK |
| beton-kalkulyator | kalkulyator | Qurilish (--cat-qurilish) | 1 | ha | ha (eski) | 30 | V2 | OK | OK | OK | OK |
| ishonchnoma-namunasi | generator | Hujjat (brend) | 1 | ha | — | 29 | V2 | OK | OK | OK | n/a |
| ijara-stavkalari | kalkulyator | Moliya (--cat-moliya) | 1 | ha | — | 23 | V2 | OK | OK | OK | grid yo'q |
| kredit-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 1 | ha | ha (eski) | 22 | V2 | OK | OK | OK | OK |
| chorva-kalkulyator | kalkulyator | Qurilish (--cat-qurilish) | 1 | ha | — | 16 | V2 | OK | OK | OK | OK |
| quyosh-panel-kalkulyator | kalkulyator | Kommunal (--cat-kommunal) | 1 | ha | — | 13 | V2 | OK | OK | OK | OK |
| uy-qurish-kalkulyator | kalkulyator | Qurilish (--cat-qurilish) | 1 | ha | — | 13 | V2 | OK | OK | OK | OK |
| omonat-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 1 | ha | — | 12 | V2 | OK | OK | OK | OK |
| alkogol-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 11 | V2 | OK | OK | OK | OK |
| bojxona-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 2 | ha | — | 10 | V2 | OK | OK | OK | OK |
| staj-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 10 | V2 | OK | OK | OK | OK |
| toy-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 10 | V2 | OK | OK | OK | OK |
| pensiya-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 9 | V2 | OK | OK | OK | OK |
| bola-puli-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 8 | V2 | OK | OK | OK | OK |
| konditsioner-kalkulyator | kalkulyator | Kommunal (--cat-kommunal) | 2 | ha | — | 7 | V2 | OK | OK | OK | OK |
| oylik-soliq-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 2 | ha | — | 6 | V2 | OK | OK | OK | OK |
| dekret-puli-kalkulyator | kalkulyator | Huquqiy (--cat-huquqiy) | 2 | ha | — | 5 | V2 | OK | OK | OK | OK |
| remont-kalkulyator | kalkulyator | Qurilish (--cat-qurilish) | 2 | ha | — | 5 | V2 | OK | OK | OK | OK |
| marosim-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 4 | V2 | OK | OK | OK | OK |
| elektr-xarajat-kalkulyator | kalkulyator | Kommunal (--cat-kommunal) | 2 | ha | — | 3 | V2 | OK | OK | OK | OK |
| homiladorlik-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 2 | V2 | OK | OK | OK | OK |
| ipoteka-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 2 | ha | — | 2 | V2 | OK | OK | OK | OK |
| ishdan-boshatish-kompensatsiyasi-kalkulyator | kalkulyator | Huquqiy (--cat-huquqiy) | 2 | ha | — | 2 | V2 | OK | OK | OK | OK |
| tom-kalkulyator | kalkulyator | Qurilish (--cat-qurilish) | 2 | ha | — | 2 | V2 | OK | OK | OK | OK |
| kaloriya-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 1 | V2 | OK | OK | OK | yopishqoq yo'q (natija .receipt emas) |
| universitet-kontrakt-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 1 | V2 | OK | OK | OK | OK |
| yhxx-jarima-kalkulyator | kalkulyator | Huquqiy (--cat-huquqiy) | 2 | ha | — | 1 | V2 | OK | OK | OK | OK |
| zakot-qurbonlik-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 1 | V2 | OK | OK | OK | OK |
| avto-rasmiylashtirish | kalkulyator | Huquqiy (--cat-huquqiy) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| avto-xarajat-kalkulyator | kalkulyator | Kommunal (--cat-kommunal) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| dtm-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 0 | V2 | OK | OK | OK | yopishqoq yo'q (natija .receipt emas) |
| grant-ololmadim | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 0 | V2 | OK | OK | OK | yopishqoq yo'q (natija .receipt emas) |
| ipoteka-yoki-ijara-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| kasallik-varaqasi-kalkulyator | kalkulyator | Huquqiy (--cat-huquqiy) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| kredit-limit-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| maktab-kalkulyator | kalkulyator | Hayotiy (--cat-hayot) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| oila-byudjet-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 2 | ha | — | 0 | V2 | ND (oldingi main ham deterministik emas) | OK | OK | OK |
| qqs-kalkulyator | kalkulyator | Moliya (--cat-moliya) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| tatil-puli-kalkulyator | kalkulyator | Huquqiy (--cat-huquqiy) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| yer-konvertor | kalkulyator | Qurilish (--cat-qurilish) | 2 | ha | — | 0 | V2 | OK | OK | OK | yopishqoq yo'q (natija .receipt emas) |
| yoqilgi-kalkulyator | kalkulyator | Kommunal (--cat-kommunal) | 2 | ha | — | 0 | V2 | OK | OK | OK | OK |
| talabnoma-namunasi | generator | Hujjat (brend) | 3 | ha | — | 9 | V2 | OK | OK | OK | n/a |
| tavsifnoma-namunasi | generator | Hujjat (brend) | 3 | ha | — | 5 | V2 | OK | OK | OK | n/a |
| hisob-siyosati-generatori | generator | Hujjat (brend) | 3 | ha | — | 1 | V2 | OK (test-hisob-siyosati.mjs) | OK | OK | n/a |
| ish-haqi-malumotnomasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 1 | V2 | OK | OK | OK | n/a |
| avto-oldi-sotdi-shartnomasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| davo-arizasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| ijara-shartnomasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| ishdan-boshash-arizasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| kadr-buyruqlari-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| kafolat-xati-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| mehnat-shartnomasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| moddiy-yordam-arizasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| oquv-tatili-arizasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| qurilish-pudrat-shartnomasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| tatil-arizasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| tilxat-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| tolov-hisobi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| topshirish-qabul-dalolatnomasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| tushuntirish-xati-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| uy-oldi-sotdi-shartnomasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| xizmat-korsatish-shartnomasi-namunasi | generator | Hujjat (brend) | 3 | ha | — | 0 | V2 | OK | OK | OK | n/a |
| hujjatlar | hub | — | 4 | ha | — | 9 | eski | — | — | — | — |
| avto-bojxona-2026 | maqola | — | 4 | — | — | 6 | eski | — | — | — | — |
| bolalar-nafaqasi-2026 | maqola | — | 4 | — | — | 5 | eski | — | — | — | — |
| maxfiylik | huquqiy | — | 4 | ha | — | 2 | eski | — | — | — | — |
| toy-byudjeti-2026 | maqola | — | 4 | — | — | 2 | eski | — | — | — | — |
| dtm-2026 | maqola | — | 4 | — | — | 1 | eski | — | — | — | — |
| biz-haqimizda | huquqiy | — | 4 | ha | — | 0 | eski | — | — | — | — |
| blog | hub | — | 4 | ha | — | 0 | eski | — | — | — | — |
| hamkorlik | huquqiy | — | 4 | ha | — | 0 | eski | — | — | — | — |
| ipoteka-2026 | maqola | — | 4 | — | — | 0 | eski | — | — | — | — |
| offline | boshqa | — | 4 | — | — | 0 | eski | — | — | — | — |
| qqs-2026 | maqola | — | 4 | — | — | 0 | eski | — | — | — | — |
| shartlar | huquqiy | — | 4 | ha | — | 0 | eski | — | — | — | — |

Jami: 80 sahifa (UZ), V2: 67, qolgan: 13.


## 1-partiya (hisobot: 2026-10-12)

GSC bo'yicha (UZ+RU kliklari yig'indisi) eng ko'p kiriladigan 10 ta generator/kalkulyator (3 ta tasdiqlangan sahifadan tashqari): `ariza-namunasi`, `aliment-kalkulyator`, `beton-kalkulyator`, `ishonchnoma-namunasi`, `ijara-stavkalari`, `kredit-kalkulyator`, `chorva-kalkulyator`, `uy-qurish-kalkulyator`, `quyosh-panel-kalkulyator`, `omonat-kalkulyator` — hammasi UZ + RU. Preview: `https://dizayn-2026.kalki-10y.pages.dev/<slug>`.

Natijalar: oltin testlar (eski `main` build ustida yozilgan) — **11 sahifa × UZ/RU = 22/22 + AI blok mos**; SEO diff — 26/26 (3+10 sahifa × UZ/RU) o'zgarishsiz; `test-pages` (320/390/768/1280, konsol, emoji, til) — toza; sticky kesishish — 0 (9 kalkulyator × 4 ekran × 10 pozitsiya); `npm run check` — 33 band OK, eski 15b.

### Shablondan chetga chiqqan joylar
1. **aliment** — H1 (va undan olingan breadcrumb/JSON-LD/og:alt) dagi emoji 👨‍👧 **saqlandi** (H1 o'zgarmasligi qoidasi emoji qoidasidan ustun). Qaror kerak: H1'dan emoji olinsinmi?
2. **ijara-stavkalari** — natija (`receipt`) forma kartasi ichida, shuning uchun `calc-grid` qo'llanmadi: sarlavha bandi, tegishli bloklar V2, forma esa to'liq kenglikda (2 ustunsiz). Sticky yo'q.
3. **Natija ko'rsatilmaguncha** (aliment, uy-qurish, chorva, quyosh, omonat) o'ng ustunda CSS joy egasi ("Natija shu yerda ko'rinadi") — yangi UI matni (til `html[lang]` bo'yicha).
4. **Emoji olib tashlandi** (yorliq/holat matnlaridan): chorva (🐂 🐏 🟢 🟡 🔴), uy-qurish/beton (📊 smeta tugmasi), omonat (👪), aliment (⚖️); `crosslink.js` kartasidagi 🔗 emoji CSS bilan SVG'ga almashtirildi; AI blok sarlavhasidagi ✨ → SVG. Bu — foydalanuvchi ko'radigan UI matni o'zgarishi (SEO emas).
5. **"Hisob usuli" meta qatori** faqat gisht'da; boshqa kalkulyatorlarda manba yo'qligi uchun chiqmaydi. `data/legal-constants.json` da tasdiqlangan **sana** maydoni yo'q — "Asos"/sana qatori qo'shilmadi.
6. **Tegishli kalkulyatorlar** — endi shu kategoriyadan (5 tagacha) nomi va tavsifi bilan; eski aralash kategoriya havolalari "Barcha kalkulyatorlar" `<details>` da saqlanadi (havolalar soni kamaymagan, SEO-diff tasdiqlagan).
7. **tgcta** (Telegram tugmasi) kalkulyatorlardan olib tashlandi (`#fbcall` bilan takror).
8. **PDF (generatorlar)**: tasvir kengligi 520→541px (grid ustuni), balandlik va sahifa soni bir xil; Word matni 1:1 mos. Kalkulyator PDF'i — `pdf-light` bilan yorug' holat.
9. **`/cyr/` nusxalar** (aliment, ariza-namunasi, beton, kredit) bu partiyada qayta yozilmadi (eski holatda) — 5-partiya.
10. **`hisob-siyosati-generatori`** — o'z JS'i (docgen emas), oltin test hali yo'q (3-partiyada alohida yoziladi).
11. Asl kontentdagi kirill so'z (uy-qurish UZ sahifasida "материал", `main`'da ham bor) o'zgartirilmadi (kontent o'zgarmaydi qoidasi) — testda istisno.

