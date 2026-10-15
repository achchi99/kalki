# kalki.uz — loyiha qoidalari

## Testlar va jarayonlar (server xotirasi tanqis)

Bu mashinada boshqa servislar ham ishlaydi (xotira ~7.6 GB, swap band). Qolib ketgan Chromium/wrangler
tekshiruvlarni sekinlashtiradi va xotirani to'ldiradi.

1. **Test o'zi ochgan jarayonni o'zi yopsin** — assert yiqilsa, xato bo'lsa, `timeout` yoki Ctrl+C bilan
   o'ldirilsa ham. Chromium (`chromium.launch`), `wrangler pages dev` va boshqa bola jarayonlar
   `track(...)` bilan ro'yxatga olinadi (`tools/test-cleanup.cjs`):
   ```js
   import { track } from '../test-cleanup.cjs';        // CommonJS: require('./test-cleanup.cjs')
   const browser = track(await chromium.launch());
   const wr = track(spawn('npx', ['wrangler', 'pages', 'dev', ...]));   // ChildProcess -> SIGKILL
   ```
   Yangi test yozsangiz, shu naqshni ishlating. Oddiy oxirdagi `browser.close()` qoladi (zaxira — `track`).
2. **Bir vaqtda faqat BITTA `wrangler pages dev`** ishlasin.
3. **Test boshlashdan oldin** eskisi qolmaganini tekshiring, bo'lsa to'xtating:
   ```bash
   pgrep -fa "[w]rangler|[w]orkerd"      # [w] — pgrep o'z shell'ini ushlamasligi uchun
   pkill -f "[w]rangler|[w]orkerd"       # bo'lsa
   ```
4. **Parallel Chromium ko'p ochmang.** Tekshiruvlarni ketma-ket ishga tushiring, har biriga `timeout 300`.
   To'liq `npm run check` bitta yirik qadam sifatida emas, bo'laklarga bo'lib.
5. `pkill -f "node tools/"` kabi buyruq o'z shell'ining buyruq matniga ham tushadi (exit 144) —
   `pgrep` + `kill <pid>` yoki `[x]` hiylasini ishlating.

## Prerender va "Yangilangan" sanasi

`tools/prerender.js` "Yangilangan" sanasini faylning oxirgi **mazmuniy** git commit'idan oladi.
Faqat ko'rinish/imlo o'zgartirsangiz commit nomi `design:` yoki `matn:` bilan boshlansin
(aks holda barcha tegilgan sahifalarda sana bugunga siljiydi).

## Til tizimi

- UZ (lotin) va RU: `assets/lang.js`; ЎЗ (kirill) — shu sahifaning o'zi `?lang=cyr` bilan, matn brauzerda
  `assets/translit.js` + `assets/cyr.js` orqali o'giriladi. Yangi sahifa YARATILMAYDI.
- Rus tilidan o'zlashgan "ц" so'zlar — `assets/translit.js` dagi `TS_DICT` lug'ati (qoida bilan emas).
- Brend/format lotincha qoladi: `DEFAULT_ABBR` (Kalki.uz, Telegram, PDF, CSV, Word, Excel, AI).
- Til tugmalari `data-cyr="skip"`: har doim "UZ | ЎЗ | RU".

## Testlar: ikki rejim (tezlik)

To'liq to'plam avval ~5 soat olardi. Endi ikki rejim (`tools/testlar.js`; parallel, 3 jarayon; natija jadvali + vaqt chiqadi):

- `npm run test:tez` — o'zgargan fayllarga qarab tanlaydi (maqsad < 15 daqiqa): har doim `verify-all` + `test-cyr`;
  o'zgargan sahifalar uchun `golden`, `test-pages`, kontrast, Katta, qadamlar (faqat o'sha sahifalar);
  `assets/<modul>.js` o'zgarsa — shu modulning testi (`test-<nom>.mjs`). Ko'rish: `node tools/testlar.js tez --list`.
- `npm run test:toliq` — hamma testlar (maqsad < 1 soat).

**Qaysi biri:**
- `matn:`, kichik `design:`, yangi sahifa, bitta kalkulyator/generator → `test:tez`.
- `tools/site-chrome.js`, `assets/css/typo.css` (va boshqa `assets/css/*`), `sw.js`, `tools/prerender.js`, `assets/tarif-core.js`,
  `nav.js`/`lang.js`/`footer-lang.js`/`calc-v2.js` yoki boshqa umumiy modul → `test:toliq` (`test:tez` o'zi ham shunga o'tadi).

**Qoidalar:**
- Bitta test yiqilsa: tuzat va **FAQAT o'sha testni** qayta yurgiz: `node tools/testlar.js tez --only <id>[,<id>]`
  (yoki testning o'zini). To'liq to'plamni qayta boshlash TAQIQLANADI.
- Golden farqi faqat qadam matni yoki bugungi sanaga bog'liq bo'lsa (kechikish kunlari, staj, oy nomi) — bu xato emas:
  runner "ogohlantirish" deb belgilaydi; kerak bo'lsa `node tools/dizayn/oltin.mjs record . <slug>` bilan qayta yozib davom et.
- 15b (prerender: `ru/oila-byudjet-kalkulyator.html` random demo soni) flaky — e'tiborsiz (runner ham o'tkazib yuboradi).
- Test oldidan osilib qolgan jarayonlarni tekshir: `ps -eo pid,etimes,args | grep -E "[c]hrom|[w]orkerd|[w]rangler|[e]sbuild"` — runner ham ogohlantiradi.
- Yangi brauzer testi yozsangiz: BITTA brauzer, sahifalarni `tools/dizayn/parallel.mjs` dagi `pool()` bilan 3–4 tadan baravar kuting
  (har vazifa o'z konteksti — `localStorage` tilni aralashtirmasin); `track(...)` bilan yopilsin.
- Natija yig'ilmaguncha "kutyapman" kabi bo'sh xabar yozma — hisobotda faqat natijani yoz.
