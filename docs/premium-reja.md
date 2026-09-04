# Premium to'lov qatlami — FAZA 0 reja

> Kod yozilmagan. Bu hujjat — mavjud kodni tekshirish va FAZA 1/2 uchun
> tavsiyalar. Qaror Asrorda: 3.3 va 3-band (kod strategiyasi) tasdiqlanishi
> kerak, qolgani to'g'ridan-to'g'ri amalga oshirish uchun tayyor.

## 1. `PREMIUM` obyekti — hozirgi holat va ta'sir nuqtalari

`assets/hisobsiyosati.js:18-22`:
```js
var PREMIUM = { yoqilgan: false, ochish: function () { return false; } };
HS.PREMIUM = PREMIUM;
```
Butun kod bazasida `PREMIUM` shu 3 qatordan tashqari **hech qayerda
ishlatilmaydi** (`grep -rn PREMIUM` — faqat shu fayl). Ya'ni obyekt hozircha
sof deklaratsiya, hech qanday filtrlashga ulanmagan.

**U qayerga ulanishi kerak edi (FAZA 1'da qo'shiladigan joylar):**

| Joy | Fayl:qator | Hozir | Kerak |
|---|---|---|---|
| Jonli preview | `hisob-siyosati-generatori.html:377` `renderPreviewHtml()` | Har bandni to'liq chizadi | `b.pullik && !unlocked` bo'lsa — sarlavha ko'rinadi, matn/variant o'rniga qulf belgisi |
| Word eksport | `hisob-siyosati-generatori.html:568` `exportWord()` → `HS.buildDocBlocks()` | Barcha bandlarni kiritadi | Qulflanган holatda pullik bandlar chiqarib tashlanadi + upgrade sahifasi qo'shiladi |
| Badge | `hisob-siyosati-generatori.html:182` `.premium-badge` | Faqat vizual — "⭐ Premium hujjat" | O'zgarmaydi (foydalanuvchi talabi), lekin endi narx bilan bog'lanadi |
| JSON-LD | `hisob-siyosati-generatori.html` `app-ld` skripti | `"isAccessibleForFree":true`, `"offers":{"price":"0"}` | FAZA 1'da `price` → `PREMIUM.narx`, `isAccessibleForFree` → `false` (yoki `"hasPart"` bilan qisman bepul belgilanadi) |
| FAQ matni | Sahifadagi `faq-ld` va `#faqBlock` — "Bu hujjatlar bepulmi? Ha, hozircha to'liq bepul" | Eskirgan bo'ladi | FAZA 1'da matn yangilanadi, ikkala tilda |

## 2. Bepul/pullik chegarasi — band darajasida flag tavsiya etiladi

**Tavsiya: `data/hisob-siyosati.json`dagi har bir band obyektiga
`"pullik": true` maydoni qo'shilsin** (yo'q bo'lsa — bepul, ya'ni faqat
pullik bandlarga aniq belgi qo'yiladi, qolgani implicit `false`).

**Nega bo'lim darajasida emas, band darajasida:**
- `HS.bandsFor`/`HS.byBolim` allaqachon band granulyatsiyasida ishlaydi
  (`hisobsiyosati.js:37-41`) — filtr shu darajada tabiiy qo'shiladi, yangi
  qatlam kerak emas.
- Bo'lim nomi bo'yicha filtrlash (`bolim_uz` matni bilan solishtirish)
  til/nomlanish o'zgarganda sinadigan qattiq bog'lanish yaratadi.
- Kelajakda bitta bo'lim ichida aralash bepul/pullik band chiqishi mumkin
  (masalan bo'lim yangi bandlar bilan kengaysa) — band-flag bunga tayyor,
  bo'lim-flag emas.

**Amaldagi ma'lumot bilan solishtirish — 0.3-jadval to'liq emas:**

Haqiqiy `data/hisob-siyosati.json`da BUP'da **5 ta** bo'lim bor (I–V), NUP'da
**6 ta** (I–VI). Sizning jadvalingiz BUP uchun I/III/V (bepul) va II (pullik)
ni aytdi, lekin **BUP IV. "Ish schyotlari rejasi"** jadvalda yo'q.

> ⚠️ **Asror hal qilishi kerak:** IV-bo'lim (1 ta band, `hujjat===BUP`)
> bepulmi yoki pullikmi? Tavsiyam: **bepul** — bu tashkiliy/tuzilma
> ma'lumoti (usul tanlovi emas), II-bo'lim mantig'iga ("usuliy qism —
> qimmatli tanlov") to'g'ri kelmaydi. Lekin buni siz tasdiqlashingiz kerak.

NUP uchun jadval "to'liq — Pullik" deydi — bu I–VI barcha bo'limlarni
qamrab oladi deb talqin qildim (jumladan I. Umumiy qoidalar ham, garchi u
BUP'da bepul bo'lsa ham). Bu ham tasdiqlanishi kerak — yoki NUP'ning I-bo'
limi ham (umumiy, tanlov yo'q qismi) bepul qoldirilsinmi?

**Yakuniy jadval (Asror tasdig'i bilan to'ldiriladi):**

| Hujjat | Bo'lim | Holat |
|---|---|---|
| BUP | I. Umumiy qoidalar | Bepul |
| BUP | II. Usuliy qism | **Pullik** |
| BUP | III. Tashkiliy qism | Bepul |
| BUP | IV. Ish schyotlari rejasi | ⚠️ tasdiqlanmagan (tavsiya: bepul) |
| BUP | V. Yakuniy qoidalar | Bepul |
| NUP | I–VI (barchasi) | ⚠️ tasdiqlanmagan (tavsiya: barchasi pullik, jadvaldagi "to'liq") |

## 3. Qulf kodi mexanizmi — variantlar

Uchtasi ham client-side tekshiriladi (1.2-band bo'yicha, chetlab o'tish
mumkinligi ochiq e'tirof etiladi) — farq **operatsion yuk** va **sizib
chiqish ta'siri**da.

### B1 — Oylik yagona kod (tavsiya etiladi)
Bir kod butun oy uchun amal qiladi (`data/unlock.json` yoki
`assets/hisobsiyosati.js` ichida konstanta), oy boshida qo'lda/`ship`
jarayoni bilan yangilanadi. Bot buyurtma tasdiqlangach shu oyning kodini
yuboradi.
- ➕ Sayt **statik** — yangi kod uchun faqat oyiga bir marta deploy kerak.
- ➕ Bot tomoni juda oddiy: "joriy kodni yubor", holat saqlash shart emas.
- ➖ Bitta mijoz kodni ijtimoiy tarmoqqa tarqatsa, shu oy davomida hamma
  bepul ochadi — lekin bu 1.2-bandda tan olingan xavf toifasiga kiradi
  (past narx, texnik auditoriya emas).

### B2 — Har buyurtma uchun ro'yxatdan noyob kod
Bot SQLite'da oldindan tayyorlangan kodlar ro'yxatidan navbatma-navbat
beradi. **Amalda mos kelmaydi**: sayt statik bo'lgani uchun yangi
chiqarilgan har bir kodni saytga yetkazish uchun **har safar deploy**
kerak bo'ladi — buyurtma tez-tez kelsa, bu operatsion jihatdan og'ir.
Faqat "ishlatilgan" holatini saqlab bo'lmaydi (backend yo'q), demak
xavfsizlik foydasi ham amalda B1'dan katta farq qilmaydi.

### B3 — Sana + maxfiy so'zdan formula (hash)
Kod `hash(YYYY-MM + SECRET)` kabi formula bilan **client-side** hisoblanadi.
**B1'dan yomonroq**: formula va SECRET brauzer JS'da ochiq turadi — kimdir
buni o'qib, nafaqat joriy, balki **kelajakdagi oylar** uchun ham kodni
oldindan hisoblab chiqarishi mumkin. B1'da bunday oldindan-hisoblash
imkoni yo'q (kod hali "chiqarilmagan").

**Tavsiya: B1.** Bu aynan 1.2-bandda tilga olingan "oyiga bir marta
almashtiriladigan ro'yxat" varianti — murakkab kriptografiyasiz, statik
sayt arxitekturasiga mos, operatsion yuki eng past.

## 4. `blocksToDocx()` — o'zgartirish kerakmi?

**Yo'q, `assets/docgen.js`ga tegilmaydi.** `blocksToDocx`/`blocksToHtml`
(`docgen.js:521,560`) formatga bog'liq emas — ular tayyor, tekis `blocks[]`
massivini oladi va uni Word/HTML'ga aylantiradi, band/pullik haqida hech
narsa bilmaydi (bilishi ham shart emas).

Filtrlash **yuqori qatlamda**, `hisobsiyosati.js`da bo'lishi kerak:

- `HS.bandsFor(data, hujjat, profil)` ga 4-parametr qo'shiladi:
  `HS.bandsFor(data, hujjat, profil, unlocked)`. `unlocked=false` bo'lsa
  `b.pullik` bandlar natijadan chiqariladi.
- Yangi funksiya: `HS.buildUpgradeBlocks(lockedBands, lang)` — chiqarib
  tashlangan bandlar sarlavhalari ro'yxati + narx (`PREMIUM.narx`) +
  havola bilan bitta qo'shimcha sahifa (0.4-band talabi: bepul `.docx`
  oxirida).
- `exportWord()` (`hisob-siyosati-generatori.html:561`) `unlocked`
  holatini (sessionStorage'dagi kod tasdig'idan) `buildDocBlocks`ga
  uzatadi; qulflangan bo'lsa, oxiriga `buildUpgradeBlocks` qo'shiladi.
- `renderPreviewHtml()` (`hisob-siyosati-generatori.html:377`) — bu yerda
  bandlar **chiqarib tashlanmaydi**, chunki foydalanuvchi ularning
  borligini ko'rishi kerak (0.3: "ko'rinadi, lekin matni yopiq"). Shuning
  uchun bu funksiya alohida: har bandda `b.pullik && !unlocked` tekshiradi
  va variant-select/tushuntirish/matn o'rniga qulf-xabarini chizadi.

## 5. Modal dizayni — mavjud tokenlarga mos taklif

Saytda alohida `.modal` naqshi yo'q (tekshirdim — hech qayerda yo'q), lekin
"muhim/pullik" ranglar allaqachon belgilangan:
- `.premium-badge` (`hisob-siyosati-generatori.html:50`): gradient
  `#D99A2B → #B9791F`, matn `#2A1E05` — "pullik" degan ma'noni allaqachon
  tashiydi.
- `.warn` (qator 102): fon `#FBF3E6`, chegara `#EFDCBB`, chap chegara
  `#D99A2B` — ogohlantirish/muhim eslatma uslubi.
- Asosiy CTA tugma uslubi allaqachon sahifa oxirida bor (`#fbcall`
  bo'limidagi "✈️ Telegram" tugmasi): fon `#D99A2B`, matn `#16211C`,
  `border-radius:10px`, `font-weight:800`.

**Taklif:** modal konteyner — `--card`(#FFFFFF) fon, `--radius`(14px),
`--line`(#DDE5E0) chegara, yarim shaffof qora overlay orqasida markazda.
Ichida yuqoridan pastga: QR rasm (markazda, ~220px), narx katta va aniq
(masalan 26-28px, bold, `--ink`), 3-4 qadamli qisqa yo'riqnoma
(`--muted` #5C6B63, kichikroq shrift), "Telegram botga o'tish" tugmasi
(mavjud CTA uslubi bilan bir xil), pastda ajratilgan qatorda kod kiritish
maydoni + "Ochish" tugmasi. Ranglar yangi token kiritmaydi — mavjud
`:root` o'zgaruvchilari va premium-badge gradienti qayta ishlatiladi.

## Xulosa — FAZA 1 boshlashdan oldin ochiq savollar

1. ~~BUP IV-bo'lim (Ish schyotlari rejasi) — bepul deb qabul qilinsinmi?~~ ✅ Bepul (Asror tasdiqladi)
2. ~~NUP'ning barcha bo'limlari (jumladan I. Umumiy qoidalar) pullikmi?~~ ✅ NUP I bepul, II–VI pullik
3. ~~B1 (oylik yagona kod) tasdiqlanadimi?~~ ✅ Tasdiqlandi

FAZA 1 (sayt tomoni) va FAZA 2 (bot) yakunlandi. Bot ↔ sayt kod
sinxronizatsiyasi uchun [docs/premium-bot-sync.md](premium-bot-sync.md)ga
qarang.
