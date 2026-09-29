# Shablon havolasi — reja (kod yo'q)

> Bu hujjat — mavjud mexanizmlarni tekshirish va tavsiya. Kod yozilmagan.
> Qaror Asrorda: hisob siyosati premium sinovi natijasidan keyin.

## 1. Maqsad

Bitta umumiy mexanizm, ikki foydalanish holati:

- **(a) Tashkilot → ariza shakli.** Masalan bir maktab yoki tashkilot o'z
  nomi, rahbari F.I.Sh. va tez-tez so'raladigan ariza turini oldindan
  sozlab, xodimlariga/ota-onalarga bitta havola tarqatadi. Havolani
  ochgan odam faqat o'zining F.I.Sh./sababi kabi shaxsiy qismini
  to'ldiradi — "Kimga" bloki va ariza turi allaqachon to'ldirilgan.
- **(b) Do'kon → g'isht kalkulyatori.** Do'kon o'z mahsulot narxlarini
  (g'isht turi, narxi, yetkazib berish) oldindan sozlab havola tarqatadi.
  Xaridor faqat kerakli hajmni kiritadi, narx allaqachon to'g'ri.

## 2. Mavjud mexanizmlar — nimani qayta ishlatish mumkin

| Mexanizm | Qayerda | Nima qiladi | Shablon havolasiga mosmi |
|---|---|---|---|
| `?p=` (holatni ulashish) | `assets/docgen.js` (`shareState`/`b64encode`), kalkulyatorlarda `#urlshare` skripti (masalan `kaloriya-kalkulyator.html`) | Joriy TO'LIQ holatni (shu jumladan foydalanuvchi hozir kiritgan shaxsiy ma'lumotni) base64'da URL'ga yozadi | **Kalkulyatorlar uchun deyarli tayyor** — g'isht kalkulyatorida shaxsiy maydon yo'q, shuning uchun (b) holat uchun bu mexanizmning o'zi YETARLI, yangi kod shart emas. **Hujjat generatorlari uchun mos emas** — `?p=` joriy foydalanuvchining shaxsiy maydonlarini ham o'z ichiga oladi, tashkilot ulashsa o'z ma'lumotini emas, oxirgi to'ldirgan odamning qoralamasini ulashib qo'yishi mumkin. |
| `cfg.share.send/receive/next` | `assets/docgen.js:746-804` | Bitta hujjatdan ikkinchisiga, FAQAT shu brauzer tabida (`sessionStorage`), tab yopilganda o'chadi | Bir martalik, link emas — tashkilot oldindan sozlab, boshqa odamga (boshqa qurilmaga) uzatish uchun ishlamaydi. |
| `KalkiHandoff` (localStorage, 30 daqiqa) | `assets/doc-handoff.js` (4-FAZA, 2026-09-29) | Bitta hujjatdan ikkinchisiga, shu brauzerda, muddatli | Xuddi shu sabab — link emas, faqat shu qurilma/brauzerda ishlaydi. |

**Xulosa:** (b) g'isht kalkulyatori holati uchun ALLAQACHON tayyor —
faqat do'kon o'zi bir marta narxlarni kiritib, "Ulashish" tugmasini
bossa, chiqqan `?p=` havolasini tarqatishi mumkin. Yangi kod shart emas,
faqat foydalanish yo'riqnomasi kerak bo'lishi mumkin (masalan "Havola
olish" tugmasi yonida qisqa tushuntirish).

(a) ariza holati uchun **yangi, ataylab cheklangan** mexanizm kerak —
pastga qarang.

## 3. Yangi mexanizm taklifi — "preset havola" (faqat ariza va shunga
o'xshash hujjat generatorlari uchun)

- Yangi URL parametri: `?tpl=<base64 JSON>` — `?p=`dan ATAYLAB ALOHIDA,
  toqnashmasin va semantikasi aralashmasin.
- JSON faqat OLDINDAN BELGILANGAN, "tashkilot darajasidagi" maydonlarni
  o'z ichiga oladi — masalan ariza-namunasi'da `toOrg`/`toPost` (tashkilot
  nomi, lavozim) va ariza turi. **Shaxsiy maydonlar (F.I.Sh., manzil,
  telefon, pasport) hech qachon shu ro'yxatga kiritilmaydi** — bu oq
  ro'yxat (allowlist), qora ro'yxat emas: yangi maydon standart bo'yicha
  presetga KIRMAYDI, faqat aniq belgilangani kiradi.
- Amalga oshirish: har bir maydon konfiguratsiyasiga (ariza-namunasi'da
  bu `CFG`ga o'xshash tuzilma emas, alohida yozilgan, shuning uchun
  ro'yxat qo'lda saqlanadi) yangi `presetSafe: true` bayrog'i emas, aksincha
  bitta markazlashgan `TPL_ALLOWLIST = ['toOrg','toPost']` massivi — shunda
  yangi maydon qo'shilganda uni preset qatoriga kiritish ATAYLAB, qo'lda
  qaror bo'ladi, tasodifan emas.
- Sahifa ochilganda: agar `?tpl=` bo'lsa, shu maydonlar to'ldiriladi VA
  vizual jihatdan "tashkilot tomonidan oldindan to'ldirilgan" deb
  belgilanadi (masalan kulrang fon + qulf belgisi), lekin foydalanuvchi
  xohlasa o'zgartira oladi (qulflab qo'yish emas — faqat vizual signal).
- Havola muddatsiz (bir martalik emas) — tashkilot bir marta yaratib,
  ko'p marta, ko'p odamga tarqatadi.

## 4. Backendsiz variant va cheklovlari

Barcha sozlamalar HAVOLANING O'ZIDA (query param), server yo'q — bu
loyihaning umumiy "hech narsa serverga yuborilmaydi" tamoyiliga mos.

**Cheklovlar:**
- **Uzunlik.** Base64 JSON URL'ga sig'ishi kerak — brauzerlar odatda
  ~2000 belgigacha URL'ni ishonchli qo'llab-quvvatlaydi. Faqat 2-3 ta
  qisqa maydon (tashkilot nomi, ariza turi) uchun bu muammo emas, lekin
  ro'yxat kengaymasligi kerak (masalan butun shablon matnini
  joylashtirish YARAMAYDI).
- **Soxtalashtirish.** Havola oddiy base64 — hech qanday imzo yoki
  tekshiruv yo'q. Har kim havoladagi `tpl` qiymatini o'zgartirib,
  boshqa tashkilot nomi bilan soxta havola yasashi mumkin. Bu past
  xavfli deb baholanadi (faqat matn maydonlari, moliyaviy yoki huquqiy
  oqibat yo'q), lekin foydalanuvchiga aytilishi kerak: "havola --- faqat
  qulaylik uchun, uni tekshirmasdan ishonmang" kabi ogohlantirish shart
  emas, ammo hujjatlashtirilishi kerak.
- **Versiya mosligi.** Agar kelajakda maydon nomi o'zgarsa (masalan
  `toOrg` → boshqa nom), eski tarqatilgan havolalar buziladi. Shuning
  uchun allowlist'dagi maydon nomlarini o'zgartirish — orqaga qarab mos
  keladigan (backward-compatible) qilib, eski nomni ham o'qish tavsiya
  etiladi.

## 5. Keyingi qadam

FAZA 1 (agar tasdiqlansa): (b) uchun — g'isht-kalkulyator sahifasida
mavjud "Ulashish" oqimini tekshirib, hech narsa qo'shmasdan hujjatlash.
(a) uchun — ariza-namunasi.html'da `?tpl=` o'qish/qo'llash logikasi va
`TPL_ALLOWLIST` massivi (taxminan 20-30 qator JS, yangi tashqi
kutubxona kerak emas).
