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
4. **Parallel Chromium ko'p ochmang (qo'lda).** Qo'lda yurgizilgan tekshiruvlar ketma-ket, har biriga `timeout 300`. Parallellikni faqat `tools/testlar.js` boshqaradi (yukga qarab: bo'sh CPU ≥ 20 %, bo'sh xotira ≥ 1,5 GB) — ikkita runner yoki runner + to'liq skrinshotni bir vaqtda yurgizmang.
   To'liq `npm run check` bitta yirik qadam sifatida emas, bo'laklarga bo'lib.
5. `pkill -f "node tools/"` kabi buyruq o'z shell'ining buyruq matniga ham tushadi (exit 144) —
   `pgrep` + `kill <pid>` yoki `[x]` hiylasini ishlating.

## Disk (server diski kichik — QAT'IY)

Disk tez to'ladi (journal, Gradle/npm/uv keshlari, docker build cache, test skrinshotlari). Qoida:

1. **Ish oxirida o'zingiz ochgan artefaktlarni o'chiring:** test skrinshotlari/trace/video (`docs/screenshots`, `tools/ai-sinov/out`, `test-results`, scratchpad), vaqtinchalik `_*.mjs` skriptlar, `kalkifit-android/dist` va `android/app/build` (APK `/ilova` ga ko'chirilgach). Skrinshotlarni repoga qo'shmang.
2. Katta ish (APK build, to'liq `test:tez`) oldidan `df -h /` ni tekshiring: **2 GB dan kam bo'lsa** — avval tozalang (quyidagi skript), keyin boshlang. Disk to'lganda yozilayotgan fayl kesilib qolishi mumkin — tozalagach o'zgargan fayllarni `node --check` / JSON parse bilan tekshiring.
3. Haftalik cron (yakshanba 04:30): `tools/disk-tozala.sh` — faqat qayta tiklanadigan narsalar, 7 kundan eskilar (build/test artefaktlari, npm/pip/uv/puccinialin keshlari, docker dangling image va eski build cache, eski VS Code server versiyalari). Qo'lda: `bash tools/disk-tozala.sh [--quruq]`; natija `~/disk-tozala.log`.
4. **Tegilmaydi:** `~/backups`, `~/ikonka-toplamlar`, kalitlar (`~/.kalkifit-*`, `~/.cf-token`), `.env`/`.dev.vars`, ma'lumot bazalari va docker volume, ishlab turgan konteynerlar, git tarixi, `~/.cache/ms-playwright` (testlar kerak).
5. journal (`/var/log/journal`, ~3 GB gacha o'sadi) — sudo kerak: `sudo journalctl --vacuum-size=200M`; doimiy cheklash: `/etc/systemd/journald.conf` da `SystemMaxUse=300M`.

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
- "halol"/"ҳалол" so'zi diniy ma'noda tushuniladi — foydalanuvchiga ko'rinadigan HECH BIR matnda (UZ/ЎЗ, ilova, sahifalar, taqdimot va h.k.) ishlatilmaydi. O'rniga ma'noga mos so'z: "ochiq", "aniq", "to'g'ri", "rostini aytamiz". RU'dagi "честно" mustasno — qolishi mumkin.

## Ish tartibi: preview tarmog'i va reliz darvozasi (tezlik uchun — QAT'IY)

To'liq `test:tez` ~50 daqiqa edi va har tuzatishdan keyin qayta yurilardi. Endi:

1. **Iteratsiya** (preview tarmog'i, `main` emas): faqat o'zgarishga tegishli testlar — `node tools/testlar.js tez --only <id>[,<id>]` (qaysilari tanlanishi: `node tools/testlar.js tez --list`) — va `npm run check:sw`.
   Skrinshot: FAQAT `OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs --faqat` (o'zgargan fayllarga qarab bo'limlar, 2 kombinatsiya; qo'lda: `--faqat v56,asosiy`, ko'rish: `--list`).
   To'liq `test:tez` va to'liq skrinshot YURGIZILMAYDI. Test yiqilsa — tuzat va FAQAT o'sha testni qayta yurgiz.
2. **Kamchiliklarni to'plab tuzat:** tekshiruv bir nechta kamchilik topsa — HAMMASINI birga tuzatib, keyin BIR marta qayta tekshir (har biridan keyin emas).
3. **Fondagi jarayon:** kodni o'zgartirsangiz, fonda yurayotgan test/skrinshot DARHOL to'xtatiladi — eski kod natijasini kutma. `tools/testlar.js` va `kalkifit-ekranlar.mjs` o'zi ham kod o'zgarganini sezib to'xtaydi (chiqish kodi 3, `tools/kod-kuzat.cjs`).
4. **Ish oxirida BIR marta:** to'liq skrinshot (`kalkifit-ekranlar.mjs`, 4 sahifa parallel) + to'liq darvoza (`npm run test:tez`/`test:toliq`, parallel ishchilar) → merge → production.
   Darvozada yiqilganlar tuzatiladi va faqat ular qayta yuritiladi (`--only`). Darvoza yashil bo'lmaguncha `main`'ga merge qilinmaydi.
   «OK*» (qayta urinib o'tdi) — beqarorlik belgisi: sababini qayd et (hisobotda), keyingi ishda tuzat.
5. **Skrinshotlar (foydalanuvchiga):** faqat o'zgargan ekran, 1–2 holatda (390 dark + 360 light). Barcha kombinatsiyalar (til, tema, shrift, o'lcham) faqat testda, rasmsiz.
6. **Hisobot qisqa:** nima qilindi, preview havolasi, foydalanuvchi nimani sinashi kerak. Uzun tafsilot faqat `docs/` da (hisobotga ko'chirilmaydi).
7. Test tezligi: `docs/testlar.md` (ishchilar, bo'laklash, ketma-ket guruh, qayta urinish, eng sekin testlar). Yangi og'ir sahifa testi — slug bo'yicha (`shard`); katta ilova testi — mustaqil bo'limlar bilan (`bolak`, `tools/bolak.cjs`); kutish — `waitForTimeout` emas, shartli (`tools/dizayn/kut.mjs`). Testlar repoga yozmasin: skrinshot — `SKRINSHOT_DIR`/`OUT`, vaqtinchalik fayl — `os.tmpdir()` (runner har ishga alohida beradi).

## Testlar: ikki rejim (tezlik)

To'liq to'plam avval ~5 soat olardi. Endi ikki rejim (`tools/testlar.js`; slug bo'yicha bo'laklangan, yukga qarab 3–5 jarayon; natija jadvali + vaqt + CPU chiqadi; qachon yurgizilishi — yuqoridagi «Ish tartibi»):

- `npm run test:tez` — o'zgargan fayllarga qarab tanlaydi (maqsad < 15 daqiqa): har doim `verify-all` + `test-cyr`;
  o'zgargan sahifalar uchun `golden`, `test-pages`, kontrast, Katta, qadamlar (faqat o'sha sahifalar);
  `assets/<modul>.js` o'zgarsa — shu modulning testi (`test-<nom>.mjs`). Ko'rish: `node tools/testlar.js tez --list`.
- `npm run test:toliq` — hamma testlar (maqsad < 1 soat).

**Qaysi biri:**
- `matn:`, kichik `design:`, yangi sahifa, bitta kalkulyator/generator → `test:tez`.
- `tools/site-chrome.js`, `assets/css/typo.css` (va boshqa `assets/css/*`), `sw.js` (faqat `SW_VERSION` qatori o'zgarsa — umumiy EMAS: `sw`, `pwa` testlari), `tools/prerender.js`, `assets/tarif-core.js`,
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
- **Asosiy yo'l — qidir → porsiya → qo'sh.** Barcha kirish nuqtalari (Bugun «Qo'shish», ovqat vaqti «+», Tarix «+», maslahat kartalari) BITTA oqimni ochadi (maket: `~/qoshish-maket.png`): 1) «Nima yedingiz?» + ovqat vaqti chipi (soatga qarab: 05:00–10:30 nonushta, 10:30–15:30 tushlik, 15:30–18:00 tamaddi, 18:00–23:00 kechki, qolgani tamaddi; ovqat vaqti «+» — o'sha vaqt), qidiruv (ichida mikrofon, klaviatura o'zi chiqmaydi), «Taom rasmi» · «Kafe menyusi», «Yaqinda yeganlaringiz» (odatdagi va o'z taomlari ustun, [+] bir bosishda); 2) yozilganda — faqat natijalar (o'z taomi birinchi «meniki», bir nechta taom — «Hammasini qo'shish»); 3) porsiya (Yarim/1/1,5/Gramm, −/+, «[vaqt]ga qo'shish»; idish — «Turi va hajmi» ichida). Tablar, kategoriya chiplari, plitkalar YO'Q. Yangi funksiya bu yo'lga qadam qo'shmaydi; qo'shimcha imkoniyatlar «▾» yoki Profil → «Imkoniyatlar» ichida (Taomlarim · Odatdagi · Idishlar · Yeymiz · Yesam-chi).
- **Bosh ekranni uzaytirmaydi:** yangi narsa mavjud kartaga joylashadi yoki bosilganda ochiladi (yangi doimiy karta qo'shilmaydi).
- **Tekshiruv:** 360 px ekranda, katta shriftda (`fs-big`) va klaviatura ochiq holatda tekshiriladi (hech narsa to'silmaydi, sig'adi).
- **Oddiy so'zlar:** texnik bilmaydigan odam birinchi ko'rishda tushunmasa — soddalashtir (UZ, RU; ЎЗ avtomatik translit).
- **Yangiliklar:** har relizda `data/yangiliklar-kalkifit.json` / `data/yangiliklar-rozgor.json` ga yangi yozuv qo'shiladi: `v` (oldingisidan katta butun son), `d` (sana), 1–3 band `{uz, ru, show?}` — bitta qisqa jumla; `show` — [Ko'rsat] tugmasi olib boradigan joy (ilovadagi `targets` ichida bo'lishi shart). Oyna (`assets/app-yangilik.js`) har versiyada faqat bir marta chiqadi, yangi foydalanuvchiga ko'rsatilmaydi.
- **KalkiFit hazillari:** matnlar faqat `data/hazillar.json` da (`items`: id, holat, uz, ru; ЎЗ — uz'ning translit'i; RU — tarjima emas, tabiiy yozilgan). Bugun'da doimiy qator YO'Q: faqat ovqat qo'shilgach kaloriya kartasi ustida 4 soniyalik pufak (kuniga ≤4, oralig'i ≥60 s); oxirgi 7 kunda chiqqan hazil qayta chiqmaydi. Qoida: sarkazm vaziyatga/odatga/divanga/shirinlik vasvasasiga qarshi, foydalanuvchining tanasi, vazni, tashqi ko'rinishiga qarshi emas; aybdorlik, ochlik/ortiqcha ovqat, tibbiy ohang, qo'pol so'z, siyosat/din/millat/jins YO'Q; raqamli matnlar hazilsiz; 1–2 qisqa jumla (yangi holatlar ≤ 90 belgi); har holatda ≥6 variant; vazn/tana haqida hazil holati yo'q. Yangi matn qo'shsangiz `test-kalkifit-hazil` (taqiqlangan so'zlar, uzunlik, 3 til) o'tishi shart. Hazil o'chirilsa neytral matn (`neutral`).
- **KalkiFit ko'rinishi:** dizayn tokenlari bitta joyda — `assets/css/kalkifit.css` boshidagi «dizayn tokenlari» (qorong'i/och, Manrope); taom rasmlari — `assets/ovqat/<nom>-128|256.webp`, id'larga moslash — `kalkifit-app.js` dagi `IMGS`/`imgFile()` (rasmi yo'q taomga rangli bosh harf tile); kaloriya «idishi» — `vesselSvg()`. Ko'rinish testi: `test-kalkifit-soddalik`.
- **Soddalik (v32):** Bugun — faqat: sana + hafta chizig'i, kaloriya halqasi (ichida qolgan, ostida iste'mol/maqsad; bosilsa hisob + makrolar), halqa ostida ko'pi bilan BITTA karta (yangilanish › baliq kuni › kun yakunida eslatma taklifi › eslatma › «Yemaydigan narsangiz bormi?» › birinchi hafta maslahati), suv va qadam, bugungi ovqatlar, pastda yopishqoq katta «Qo'shish». Boshqa hamma narsa ikkinchi qavatda: Profil → «Imkoniyatlar» (har funksiya: nom, bir qatorli izoh, «Ochish» — `feat()`), Tarix (vazn, hafta, streak, vitaminlar). Profil tuzilishi (v50): **Hero** (ism, maqsad progressi — trend vaznidan, 4 plitka: jins/yosh/bo'y/vazn, kunlik me'yor kartasi) → **Ovqatlanish** (Kun tartibi · Oqsil maqsadi · Yemaydiganlarim) → Sozlamalar → Imkoniyatlar → Ilova → Hisob va zaxira (eng pastda); «Men» guruh sarlavhasi yo'q (hero o'rnida). Profil testlari: `profil-v50`, `soddalik2`, `qoshish` (tartib). Tanishtiruv: til tanlangach, profil savollaridan OLDIN, 3 ekran (bir marta, `kalki_intro_v2`). Birinchi hafta maslahatlari (`FW` tartibi, kuniga bitta, ishlatilgani o'tkaziladi). Oyna ustiga oyna yo'q. Testlar: `test-kalkifit-qoshish`, `test-kalkifit-tanishtiruv`, `test-soddalik2`; ekranlar: `OUT=<papka> node tools/dizayn/kalkifit-ekranlar.mjs` (360/390 × 115% × UZ/ЎЗ/RU × yorug'/tungi + avtomatik kesishish tekshiruvi). Sinovda avtomatik tanishtiruv `localStorage.kalki_intro_v2='1'` (yoki `kalki_no_intro`) bilan o'chiriladi.
- **Retsept (docs/retsept.md):** kkal/oqsil/yog' FAQAT `data/retsept-masalliq.json` (USDA) dan; AI faqat masalliqni ajratadi (`/api/retsept`, limit 5/kun); yengillashtirish — deterministik qoidalar (`assets/retsept-core.js`), retseptni raqamga moslab o'zgartirmaymiz. Yangi masalliq: `tools/retsept-yasa.js` (alias, birlik, teg) → `node tools/retsept-yasa.js`.
- **Cho'chqa go'shti:** mantiq o'zgarmaydi (takliflarda/guruhlarda hech qachon chiqmaydi, qidiruvda topiladi — `assets/retsept-core.js` PORK, `data/cheklov-teglar.json` "choshqa"), lekin bu haqda foydalanuvchiga ko'rinadigan HECH QANDAY matn yozilmaydi (nega yashirilgani/qo'shilmagani tushuntirilmaydi).
- **Cho'chqa tegi qoidasi (QAT'IY):** `data/cheklov-teglar.json` da «choshqa» tegi FAQAT `bekon` va `pitsa-pepperoni` (`pitsa#pepperoni`) da. Kolbasa, sosiska, pelmeni, hot-dog, lazanya, boloneze, tefteli, burger, sendvich va boshqa go'shtli taomlar — mol/tovuq (teg YO'Q). «Ehtiyot uchun/tarkibi noaniq» deb teg QO'YILMAYDI (boshqa teglarda — sut, tuxum, glyuten — ehtiyot qoidasi qoladi). Yangi taom qo'shilganda cho'chqa tegi to'plami o'zgarmaydi; `yemaydi` testi shu qoidani majburlaydi (to'plam = {bekon, pepperoni}).
- **Ikonka to'plamlari (taom rasmlari):** reja — `data/ikonka-reja.txt` (guruh | slug | tavsif | taom id'lari), to'plamlar — `docs/ikonka-toplam-N.txt` (42 talik, prompt bilan), jadval — `docs/ikonka-jadval.md` (`node tools/ikonka-toplam.js`). To'r rasmi (JPG) `~/toplam-N.jpg` → `node tools/ikonka-kes.js ~/toplam-N.jpg` (kesadi, yozuvni olib tashlaydi, `assets/ovqat/<slug>-128|256.webp` + `kalkifit-app.js` dagi IKONKA-XARITA'ni yozadi, kontakt-varaq `~/ikonka-toplamlar/kontakt-N.png`; avval `--quru` bilan tekshirib, kontakt-varaqni KO'RIB chiqing). Format: opak fon #F3EBE4, kvadrat, uzun tomon 90%. To'r rasmi ishlangach `~/ikonka-toplamlar/` ga ko'chiriladi (repoga qo'shilmaydi). **Test qoidasi:** ikonka to'plami faqat rasm va xarita o'zgarishi — to'liq `test:tez` SHART EMAS: faqat tegishli `--only` (`kalkifit-dizayn2`, `kalkifit-soddalik`, `kalkifit-odatdagi`, `migrate`) + `npm run check:sw`; main'ga to'g'ridan-to'g'ri chiqariladi. Yangiliklar yozuvi — oxirgi to'plamdan keyin bitta; shuning uchun ikonka commit'i `design:` bilan boshlanadi (test-yangilik-qoida istisnosi).
- **Taqdimot rejimi:** `/kalkifit?demo=1` (`&intro=1` — slaydlar bilan) — namunaviy profil va bugungi 3 ovqat, alohida kalit (`kalkidemo_*`), tarmoqsiz; haqiqiy ma'lumotga tegmaydi (`assets/kalkifit-demo.js`).
- **Test majburlaydi:** `test-yangilik-qoida` (`tools/dizayn/test-yangilik-qoida.mjs`, `npm run test:tez` ichida har doim) — ilova kodi (`assets/kalkifit-*.js`, `assets/rozgor-*.js`, ularning CSS'i; umumiy kit bo'lsa kamida bitta JSON) o'zgarib, yangiliklar JSON'iga yozuv qo'shilmasa YIQILADI. Faqat ko'rinish/imlo o'zgargan bo'lsa commit nomi `design:` yoki `matn:` (ichki xato tuzatish — `tuzatish:`) bilan boshlansin — shunda istisno. Production'da foydalanuvchiga HALI ko'rinmaydigan (server bayrog'i/kaliti orqali yopiq) funksiya commit'i `yashirin:` bilan boshlansin — istisno; yangilik yozuvi funksiya ko'rinadigan relizda qo'shiladi. Foydalanuvchiga ko'rinmaydigan ichki xato tuzatish (hisob/saqlash xatosi, ko'rinadigan o'zgarish yo'q) commit'i `tuzatish:` bilan boshlansin — istisno, yangilik yozuvi kerak emas; foydalanuvchi natijani sezadigan tuzatishga (masalan, qadam soni to'g'rilandi) oddiy yangilik yozuvi qo'shiladi. `yashirin:` faqat hali ko'rinmaydigan funksiyalar uchun.
