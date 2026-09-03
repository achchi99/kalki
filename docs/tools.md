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
