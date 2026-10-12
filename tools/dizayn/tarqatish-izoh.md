
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
