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
- Brend/format lotincha qoladi: `DEFAULT_ABBR` (Kalki.uz, Telegram, email, PDF, CSV, Word, Excel, AI, ID, URL, API, HTML, PWA, USD, OTP, LED, Wi-Fi, Claude, Apple, WhatsApp, cookie). Lotin `w` → `в` (web → веб); bitta so'zda aralash alifbo bo'lmasin — `tools/test-cyr-aralash.js` tekshiradi.
- Til tugmalari `data-cyr="skip"`: har doim "UZ | ЎЗ | RU".

## Ish tartibi: preview tarmog'i va reliz darvozasi (tezlik uchun — QAT'IY)

To'liq `test:tez` ~50 daqiqa edi va har tuzatishdan keyin qayta yurilardi. Endi:

1. **Preview tarmog'ida ishlayotganda** (`main` emas): faqat o'zgarishga tegishli testlar — `node tools/testlar.js tez --only <id>[,<id>]` (qaysilari tanlanishi: `node tools/testlar.js tez --list`) — va `npm run check:sw`.
   To'liq `test:tez` YURGIZILMAYDI. Test yiqilsa — tuzat va FAQAT o'sha testni qayta yurgiz.
2. **Reliz darvozasi:** to'liq `test:tez` (umumiy fayl o'zgargan bo'lsa `test:toliq`) faqat `main`'ga merge qilishdan OLDIN, BIR MARTA yuriladi.
   Unda yiqilganlar tuzatiladi va faqat ular qayta yuritiladi (`--only`). Darvoza yashil bo'lmaguncha `main`'ga merge qilinmaydi.
3. **Skrinshotlar:** faqat o'zgargan ekran, 1–2 holatda (390 dark + 360 light). Barcha kombinatsiyalar (til, tema, shrift, o'lcham) faqat testda, rasmsiz.
4. **Hisobot qisqa:** nima qilindi, preview havolasi, foydalanuvchi nimani sinashi kerak. Uzun tafsilot faqat `docs/` da (hisobotga ko'chirilmaydi).
5. Test tezligi: `docs/testlar.md` (bo'laklash, yukga qarab parallel, eng sekin testlar). Yangi og'ir sahifa testi yozsangiz — slug bo'yicha bo'linadigan qiling (`shard`, `tools/testlar.js`).

## Testlar: ikki rejim (tezlik)

To'liq to'plam avval ~5 soat olardi. Endi ikki rejim (`tools/testlar.js`; slug bo'yicha bo'laklangan, yukga qarab 3–5 jarayon; natija jadvali + vaqt + CPU chiqadi; qachon yurgizilishi — yuqoridagi «Ish tartibi»):

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

## Ilovalarga yangi funksiya qoidasi (KalkiFit, Ro'zg'or)

Har yangi funksiya shu qoidalarga javob berishi shart (relizdan oldin tekshiriladi):

- **Topish oson:** kerakli joydan ko'pi bilan 1–2 bosishda ochiladi. Yangi atama bo'lsa — yonida 1 jumlali izoh. Bo'sh holatda (ma'lumot yo'q) «nima qilish kerak» ko'rsatmasi chiqadi.
- **Asosiy yo'l — qidir → porsiya → qo'sh.** Yangi funksiya bu yo'lga qadam qo'shmaydi; qo'shimcha imkoniyatlar «Boshqa usullar» yoki «▾» ichida.
- **Bosh ekranni uzaytirmaydi:** yangi narsa mavjud kartaga joylashadi yoki bosilganda ochiladi (yangi doimiy karta qo'shilmaydi).
- **Tekshiruv:** 360 px ekranda, katta shriftda (`fs-big`) va klaviatura ochiq holatda tekshiriladi (hech narsa to'silmaydi, sig'adi).
- **Oddiy so'zlar:** texnik bilmaydigan odam birinchi ko'rishda tushunmasa — soddalashtir (UZ, RU; ЎЗ avtomatik translit).
- **Yangiliklar:** har relizda `data/yangiliklar-kalkifit.json` / `data/yangiliklar-rozgor.json` ga yangi yozuv qo'shiladi: `v` (oldingisidan katta butun son), `d` (sana), 1–3 band `{uz, ru, show?}` — bitta qisqa jumla; `show` — [Ko'rsat] tugmasi olib boradigan joy (ilovadagi `targets` ichida bo'lishi shart). Oyna (`assets/app-yangilik.js`) har versiyada faqat bir marta chiqadi, yangi foydalanuvchiga ko'rsatilmaydi.
- **KalkiFit hazillari:** matnlar faqat `data/hazillar-kalkifit.json` da (holat id → uz/ru; ЎЗ — uz'ning translit'i). Qoida: sarkazm vaziyatga/odatga/divanga/shirinlik vasvasasiga qarshi, foydalanuvchining tanasi, vazni, tashqi ko'rinishiga qarshi emas; aybdorlik, ochlik/ortiqcha ovqat, tibbiy ohang, qo'pol so'z, siyosat/din/millat/jins YO'Q; raqamli matnlar hazilsiz; 1–2 jumla; har holatda ≥5 variant. Yangi matn qo'shsangiz `test-kalkifit-hazil` (taqiqlangan so'zlar, uzunlik, 3 til) o'tishi shart. Hazil o'chirilsa neytral matn (`neutral`).
- **KalkiFit ko'rinishi:** dizayn tokenlari bitta joyda — `assets/css/kalkifit.css` boshidagi «dizayn tokenlari» (qorong'i/och, Manrope); taom rasmlari — `assets/ovqat/<nom>-128|256.webp`, id'larga moslash — `kalkifit-app.js` dagi `IMGS`/`imgFile()` (rasmi yo'q taomga rangli bosh harf tile); kaloriya «idishi» — `vesselSvg()`. Ko'rinish testi: `test-kalkifit-soddalik`.
- **Soddalik (docs/soddalik-audit.md):** Bugun'dan har asosiy funksiya ≤1 bosishda; oyna ustiga oyna yo'q (ichki qadam — o'sha oynada, tepada «‹ Orqaga» + «✕»; funksiya oynasi yopilsa Bugun'ga qaytadi); **Profil — faqat sozlamalar** (Mening ma'lumotlarim · Yemaydiganlarim · Eslatmalar · Til va ko'rinish · Ma'lumotni saqlash · Qanday ishlaydi?); funksiyalar «Ovqat qo'shish» tablarida (Qidirish · Taomlarim · Odatdagi · Idishlar); har funksiyaning BITTA kirish nuqtasi; hazil Bugun'da bitta, eng pastda. Yangi funksiya shu tartibga joylashadi. Testlar: `test-soddalik2`; avtomatik «Qanday ishlaydi?» slaydi testda `localStorage.kalki_no_intro='1'` bilan o'chiriladi.
- **Taqdimot rejimi:** `/kalkifit?demo=1` (`&intro=1` — slaydlar bilan) — namunaviy profil va bugungi 3 ovqat, alohida kalit (`kalkidemo_*`), tarmoqsiz; haqiqiy ma'lumotga tegmaydi (`assets/kalkifit-demo.js`).
- **Test majburlaydi:** `test-yangilik-qoida` (`tools/dizayn/test-yangilik-qoida.mjs`, `npm run test:tez` ichida har doim) — ilova kodi (`assets/kalkifit-*.js`, `assets/rozgor-*.js`, ularning CSS'i; umumiy kit bo'lsa kamida bitta JSON) o'zgarib, yangiliklar JSON'iga yozuv qo'shilmasa YIQILADI. Faqat ko'rinish/imlo o'zgargan bo'lsa commit nomi `design:` yoki `matn:` bilan boshlansin — shunda istisno. Production'da foydalanuvchiga HALI ko'rinmaydigan (server bayrog'i/kaliti orqali yopiq) funksiya commit'i `yashirin:` bilan boshlansin — istisno; yangilik yozuvi funksiya ko'rinadigan relizda qo'shiladi.
