# tools/ — qoida va jadval

## Asosiy qoida

**Bayroqsiz chaqirilgan har qanday `tools/` skripti hech narsa yozmaydi.**
U faqat o'qiydi, hisobot beradi va muammo topilsa chiqish kodi `1` qaytaradi.
Yozish faqat `--write` bilan bo'ladi.

Nega: ilgari `verify-all` 6-band yiqilgach 7-bandda `sw-version.js` ni yozish
rejimida chaqirib faylni tuzatib qo'ygan va ikkinchi yugurishda "hammasi OK"
chiqargan. O'z natijasini yashiradigan tekshiruv — tekshiruv emas, u yolg'on
xotirjamlik beradi. Shu qoida `verify-all` ning 18-bandi bilan har yugurishda
haqiqatan sinaladi: barcha vositalar chaqirilgan oynada repo fayllarining
sha1 barmoq izi solishtiriladi.

Yozuvchi rejimlar **faqat bitta joyda** chaqiriladi: `npm run ship`.

## Buyruqlar

| Buyruq | Nima qiladi | Yozadimi |
|---|---|---|
| `npm run check` | To'liq tekshiruv (21 band) | yo'q |
| `npm run check:fast` | O'shaning prerender bandlarisiz varianti | yo'q |
| `npm run check:sw` | Faqat `sw.js` statik tahlili | yo'q |
| `npm run check:partners` | Hamkor havolalari va qoidalari (tarmoq bilan) | yo'q |
| `npm run check:prerender` | Prerender barqarorligi | yo'q |
| `npm run ship` | Rasm → teg → versiya → prerender → tekshiruv | **ha** |

## Skriptlar

| Skript | Bayroqsiz | `--write` bilan | Boshqa bayroqlar |
|---|---|---|---|
| `verify-all.js` | 21 bandni tekshiradi | — | `--fast` (prerender bandlarisiz) |
| `verify-sw.js` | `sw.js` naqshlarini tekshiradi | — | — |
| `check-partners.js` | `partners.json` qoidalari va havolalar | — | `--no-net` (tarmoqsiz) |
| `prerender.js` | Natijani diskdagi fayl bilan solishtiradi | HTML yozadi | `--all`, `<fayl.html>` |
| `prerender-twice.js` | Natijani ikki marta hisoblab solishtiradi | — | `--all` |
| `sw-version.js` | Versiya `assets/` hash'iga mosligini aytadi | `sw.js` ga versiya yozadi | — |
| `og-images.js` | Qaysi rasm eskirganini aytadi | PNG va manifest yozadi | `--force` |
| `og-tags.js` | Qaysi sahifada teg eskirganini aytadi | HTML ga teg yozadi | — |
| `site-chrome.js` | Sarlavha (`#topmenu`, `#sitebar`) va footer (`#legal-links`, mualliflik qatori) kanonik variant bilan bir xilligini aytadi | HTML ga yozadi | — |
| `render.js` | Modul (CLI emas) — jsdom harness | — | — |
| `visual-check.js` | Real brauzerda (Playwright/Chromium) overflow, landmark overlap, konsol xatosi tekshiradi | `docs/screenshots/` ga PNG yozadi | `--lang`, `--viewport` |

`--check` eski nom sifatida hamma joyda qabul qilinadi va standart holat
bilan bir xil ishlaydi.

## visual-check.js

`verify-all.js` jsdom bilan ishlaydi — DOM va matnni ko'radi, lekin real
CSS layout'ni (overlap, overflow) ko'rmaydi. Ayni shu turdagi buglar
(vizual overlap, RU `lang` xatosi) faqat real brauzerda topilgan edi.
`visual-check.js` shu tekshiruvni Playwright/Chromium orqali
avtomatlashtiradi.

**Diqqat: `verify-all`/`ship` ga QO'SHILMAGAN** — brauzer testlari sekin,
va bu vositani har `ship`ga qo'shish pipeline'ni og'irlashtiradi. Faqat
qo'lda ishga tushiriladi.

Talab: `npm i` (Playwright'ni o'zi Chromium'ni yuklab oladi) va tizimda
Chromium'ning kutubxonalari (`npx playwright install-deps chromium`,
sudo talab qiladi).

Buyruq:
```
node tools/visual-check.js <sahifa> [<sahifa2> ...] [--lang=uz,ru] [--viewport=desktop,mobile]
```
Masalan: `node tools/visual-check.js kredit-kalkulyator --lang=uz,ru --viewport=desktop,mobile`

Har bir `<sahifa>-<lang>-<viewport>` kombinatsiyasi uchun: lokal HTTP
server orqali (fayl:// emas — `ru/` sahifalarining ildiz-nisbiy yo'llari
uchun kerak) sahifa ochiladi, `document.documentElement.scrollWidth`
orqali gorizontal overflow, landmark elementlar
(`header/nav/main/footer/.answerbox/.form-card/.premium-badge`) orasidagi
overlap va konsol xatolari tekshiriladi, skrinshot
`docs/screenshots/<sahifa>-<lang>-<viewport>.png` ga saqlanadi. Natija —
strukturalangan JSON stdout'ga.

`docs/screenshots/` git'ga tushmaydi (`.gitignore`) — faqat lokal
tekshiruv uchun.

## SPECIAL_PAGES

`tools/render.js` da oddiy sayt sahifasi bo'lmagan HTML fayllar sanab
o'tilgan (`yandex_...`, `offline.html`). Ular sitemap'ga kirmaydi,
prerender qilinmaydi, og:image olmaydi va footer talab qilinmaydi —
lekin matn tozaligi tekshiruvidan o'tadi.

Ro'yxat aynan shu yerda turishi muhim: `verify-sw.js` sitemap va precache
qamrovini XATO darajasida tekshiradi, ya'ni "unutildi" bilan "ataylab"
faqat shu ro'yxat orqali farqlanadi.

## Diqqat

- `prerender-twice.js` **diskka umuman tegmaydi**: ikkinchi yugurish
  birinchisining natijasi ustida, xotirada bajariladi. Ilgari u
  `prerender.js` ni ikki marta chaqirib faylni haqiqatan qayta yozardi.
- `verify-all.js` ning METRICS bandi ham `hamkorlik.html` ni endi
  vaqtincha qayta yozmaydi — holatlar xotirada render qilinadi
  (`render.js` dagi `loadHtml`). Ilgari jarayon yarim yo'lda uzilsa fayl
  o'zgargan holda qolib ketardi.
- `og-images.js` uchun `tools/fonts/` da lotin va kirill qo'llab-quvvatlaydigan
  `.ttf` bo'lishi kerak; topilmasa skript to'xtaydi (kod `2`).
- **RU'ni jsdom'da `langRu` tugmasini `.click()` bilan sinamang — noto'g'ri
  natija beradi, xato yashiringan holda "yashil" chiqadi.** `assets/lang.js`da
  capture-phase listener bor (`data-ru-page` bo'lgan sahifalarda): bosilganda
  ichki matnni qayta chizish o'rniga **haqiqiy navigatsiya** qiladi
  (`location.href = /ru/...`) va `stopImmediatePropagation()` bilan sahifaning
  o'z `applyLang()`ini ishga tushirishga yo'l qo'ymaydi. Real brauzerda bu
  to'g'ri ishlaydi (yangi `/ru/...` fayl yuklanadi), lekin jsdom navigatsiyani
  bajara olmaydi — natijada `.click()`dan keyin DOM hamon UZ holatida qoladi,
  konsolda faqat "Not implemented: navigation to another Document" ogohlantirishi
  chiqadi, va xato tashlanmagani uchun tekshiruv "muvaffaqiyatli" ko'rinadi,
  aslida hech narsa tekshirilmagan bo'ladi.

  **To'g'ri usul:** `tools/prerender.js`dan `renderOneRu(name)`ni chaqiring —
  bu aynan `prerender.js --write` qanday RU faylni hosil qilsa, xuddi
  shundan render qiladi:
  ```js
  const { renderOneRu } = require('./tools/prerender.js');
  const r = await renderOneRu('sahifa.html');
  // r.out — haqiqiy RU HTML, r.errors — jsdom xatolari
  ```
  Yoki `npm run ship`dan keyin diskdagi `ru/sahifa.html`ni to'g'ridan-to'g'ri
  tekshiring. (Bu saboq 2026-09 SEO/CTR sessiyasida ikkinchi marta
  chiqdi — birinchisi jonli production'dan noto'g'ri xulosaga olib kelgan
  edi, shuning uchun bu yerga yozilmoqda.)

- **Band 25 ("RU sahifada UZ matn qoldig'i yo'q") qamrovi to'liq emas —
  kelajakdagi ish.** 2026-09'da `ipoteka-yoki-ijara-kalkulyator.html`ni
  tekshirishda topildi: har bir RU sahifaning inline `<script>`ida til
  almashtirish uchun **ikkala** lug'at ham saqlanadi — `I={uz:{...},
  ru:{...}}`. Bu ataylab shunday (mijoz tomonida til tugmasi bosilganda
  qayta render qilish uchun kerak) va sayt bo'ylab barcha RU sahifalarda
  bir xil — `ru/ipoteka-kalkulyator.html`, `ru/kredit-limit-kalkulyator.html`
  va h.k. da ham xuddi shunday `uz:{...}` bloki bor. Xuddi shunday,
  `#topmenu` navigatsiyasidagi `data-tm-uz="..."` atributlari ham har bir
  RU sahifada bor (ko'rinadigan matn emas, faqat JS uchun manba qiymati).

  Band 25 hozircha faqat title/meta/JSON-LD/seoBlock/faqBlock/related/
  articleLink'ni tekshiradi — bular render qilingan/ko'rinadigan joylar.
  JS manba kodidagi `uz:{...}` obyekt literali va `data-*-uz` atributlari
  band 25 tomonidan UMUMAN tekshirilmaydi (va tekshirilishi ham shart
  emas — ular foydalanuvchiga ko'rinmaydi, faqat kod darajasida mavjud).

  Bu — xato emas, lekin band 25'ning "UZ matn qoldig'i yo'qligini"
  TO'LIQ tasdiqlamasligini bildiradi: agar kimdir kelajakda haqiqatan
  ko'rinadigan biror joyni (masalan yangi qo'shilgan `data-i`/`data-i-html`
  elementini) RU tarjimasiz qoldirsa-yu, u seoBlock/faqBlock/related/
  articleLink/meta/JSON-LD doirasidan tashqarida bo'lsa, band 25 buni
  ushlamaydi (band 20/22 asosiy kontent/footer'ni tekshiradi, lekin har
  bir maxsus blokni emas). Kelajakda band 25'ni kengaytirish kerak bo'lsa:
  butun `<body>`ni (ichidagi `<script>` teglarisiz) skanerlab, faqat
  ko'rinadigan (visibility/display bekor qilinmagan) elementlar matnini
  tekshirish — bu hozirgi ro'yxat-asosidan ko'ra ancha kengroq qamrov
  beradi, lekin false-positive xavfi ham oshadi (masalan `alt`/`title`
  atributlari, izohlar).

- **Fon jarayonida `npm run ship` tugashini kutish uchun
  `pgrep -f "npm run ship"` ISHLATILMASIN.** 2026-09'da 4 ta abadiy
  osilib qolgan kutish-tsikli topildi (soatlab CPU'da bekorga aylanib
  turgan), garchi haqiqiy `ship` allaqachon tugagan bo'lsa ham. Sabab:
  `until ! pgrep -f "npm run ship" > /dev/null; do sleep N; done` —
  bu tsiklning O'ZINING buyruq qatorida ham so'zma-so'z `"npm run ship"`
  matni bor (pgrep argumenti sifatida). `pgrep -f` esa BARCHA jarayonlar
  orasidan shu matnga mos keladiganini qidiradi — shu jumladan o'zini va
  bir-birini. Natijada tsikl hech qachon "ship tugadi" holatiga
  o'tolmaydi, chunki har safar o'zini "hali ishlab turgan ship" deb
  aniqlaydi.

  **To'g'ri usul:** jarayonni ishga tushirishda PID'ni saqlang (`$!`),
  keyin aynan shu PID'ni tekshiring:
  ```bash
  npm run ship > /tmp/ship.log 2>&1 &
  SHIP_PID=$!
  while kill -0 "$SHIP_PID" 2>/dev/null; do sleep 15; done
  echo "ship finished"; tail -50 /tmp/ship.log
  ```
  `kill -0 $PID` faqat shu aniq PID hali tirikligini tekshiradi — matn
  qidirmaydi, shuning uchun o'z-o'ziga mos kelish xavfi yo'q.
