# Shtrix-kod skaneri (KalkiFit v79)

Maqsad: qadoqlangan mahsulotlar (yogurt, batonchik, muzqaymoq, shirinlik, ichimlik) bazada yetishmaydi → foydalanuvchi shtrix-kodni skanerlaydi, mahsulot kkal/makrosi bilan chiqadi. AI ishlatilmaydi (rasm limitidan sarflanmaydi).

## Oqim
1. **Mijoz** (`assets/kalkifit-shtrix.js`, UI — `kalkifit-app.js` `scOpen`): «Ovqat qo'shish» oynasida «Shtrix-kod skaneri» va Imkoniyatlar → Yozish → «Shtrix-kod». Kamera oynasi + ramka; EAN-13 / EAN-8 / UPC-A (UPC-E — faqat native); nazorat raqami (GS1) mijozda ham tekshiriladi.
2. **Server** `GET /api/shtrix?kod=…&til=uz|ru|kirill`:
   a) o'z D1 jadvalimiz `shtrix_mahsulot` (manba: admin / yorliq ≥2 bir xil taklif) → topilsa shu (`manba: "oz"`);
   b) KV kesh `shtrix:off:<kod>` (musbat 30 kun, «topilmadi» 3 kun) → OFF'ga qayta bormaydi;
   c) **Open Food Facts API v2** `product/{kod}?fields=…` (faqat kerakli maydonlar: nom, brend, miqdor, porsiya, nutriments); `User-Agent: KalkiFit/1.0 (+https://kalki.uz/biz-haqimizda)` — ilova nomi va saytning mavjud aloqa sahifasi (shaxsiy email yo'q);
   d) tekshiruv: 100 g uchun kkal bor, 0–900; oqsil/yog'/uglevod bor, 0–100, yig'indi ≤ 105; 4·O+9·Y+4·U ≈ kkal ±20 % (kichik qiymatda ±15 kkal); nom bor. Yaroqsiz yoki yo'q — «topilmadi» (3 kun keshlanadi, `shtrix_topilmadi` sanagichi);
   e) OFF javob bermasa (tarmoq/vaqt/5xx) — «vaqtincha»: keshlanmaydi, «topilmadi» ro'yxatiga yozilmaydi.
3. **Topilmadi** → «Bu mahsulot hali bazada yo'q. Yorliqni suratga oling — 10 soniya» → mavjud «Yorliqdan qo'shish» oqimi; saqlangan mahsulot shtrix-kod bilan bog'lanadi (`bc`): avval foydalanuvchining «Mening taomlarim»ida (keyingi skaner — tarmoqsiz), ruxsat bo'lsa anonim taklif sifatida (`/api/kalkifit-yorliq`, `kod` maydoni) admin navbatiga. **Admin «Bazaga qo'shish»** yoki **bir xil kod + nom + kkal bilan ≥2 taklif** → `shtrix_mahsulot` (hamma uchun). Bitta qurilma bir kodni takror yubormaydi (kod bo'yicha yagona yozuv).
4. **Natija kartasi** — odatiy porsiya oynasi: nom, brend, «1 dona ≈ 40 g» (qadoq ≤ 300 g — `dona`, aks holda `qadoq`; OFF `serving_quantity` farq qilsa — `porsiya`), kkal, yarim/1/1,5/gramm; OFF bo'lsa pastda «Ma'lumot: Open Food Facts (ODbL)» (havolalar: mahsulot sahifasi va litsenziya); «Xato topdingizmi?» (id `bc-<kod>`). «Ilova haqida» ichida ham atributsiya, maxfiylik siyosatida band.
5. **Oxirgilar:** skanerlangan mahsulot «Mening taomlarim»ga (src `shtrix`, `bc`, OFF bo'lsa `off:1`) tushadi → «Yaqinda yeganlaringiz»da va nom/brend bo'yicha qidiruvda lokal topiladi.

## Kamera usullari
| Qurilma | Usul |
|---|---|
| Android Chrome / Android APK WebView | `BarcodeDetector` (agar bor), aks holda ZBar WASM |
| iPhone Safari / PWA | **ZBar WASM** (`assets/vendor/zbar`, lazy-load — faqat skaner ochilganda; ~255 KB) — Safari'da `BarcodeDetector` yo'q |
| Kamera ruxsati rad / kamera yo'q | tushunarli xabar + qo'lda raqam + «Suratdan o'qish» (surat → ZBar/Detector; APK'da `@capacitor/camera`) |
Android APK: WebView `getUserMedia` uchun Capacitor `VIDEO_CAPTURE → CAMERA` ruxsatini so'raydi, lekin **faqat manifestda e'lon qilingan bo'lsa** (1.0.6 dagi `MODIFY_AUDIO_SETTINGS` bilan bir xil holat; `@capacitor/camera` ham CAMERA e'lon qilmaydi). Shuning uchun APK **1.0.9 (versionCode 11)**: `CAMERA` + `uses-feature camera required=false`. Eski APK'larda (≤ 1.0.8) kamera ochilmaydi → «Suratdan o'qish» (intent orqali) va qo'lda raqam ishlaydi.

## LITSENZIYA QARORI (ODbL)
Open Food Facts bazasi **ODbL 1.0** (share-alike: ma'lumotlar bazasidan olingan ma'lumotni qo'shsak va uni tarqatsak, shu litsenziyada tarqatish va manbani ko'rsatish shart; «Produced Work» alohida). Bizning qaror — **aralashtirmaslik**:
- OFF ma'lumoti `data/ovqatlar.json` (tekshirilgan baza), `shtrix_mahsulot` (o'z jadval), `yorliq_taklif` va hech qaysi umumiy bazaga **YOZILMAYDI** (testda tekshiriladi: `shtrix.js` `shtrix_mahsulot`ga yozmaydi).
- U faqat: (1) alohida KV kesh (`shtrix:off:*`, 30/3 kun, TTL bilan o'chadi — bazani ko'chirish yo'q, faqat haqiqiy skanerlangan kodlar), (2) foydalanuvchining shaxsiy «Mening taomlarim»ida (`off:1`) — manba va litsenziya havolasi bilan, har kartada «Ma'lumot: Open Food Facts (ODbL)».
- Foydalanuvchi o'z yorlig'idan kiritgan ma'lumot OFF'dan alohida (u bizniki / foydalanuvchiniki), shuning uchun share-alike OFF'ga bog'liq emas. OFF'dan olingan qiymatni «yorliq taklifi»ga avtomatik yubormaymiz (`off:1` yozuvlar taklifga ketmaydi).
- So'rov qoidalari: 1 so'rov = 1 haqiqiy skaner (qidiruvda OFF'ga so'rov yo'q), kesh, User-Agent, sutkalik cheklov (IP 200, butun sayt OFF'ga 5000).
- ZBar (WASM, `@undecaf/zbar-wasm` 0.11.0) — **LGPL-2.1+**: o'zgartirilmagan, alohida fayl sifatida (`assets/vendor/zbar/zbar.wasm` + `LICENSE`), manba: github.com/undecaf/zbar-wasm.

## Cheklovlar
- Maxfiylik: serverga faqat shtrix-kod raqami ketadi (IP — kunlik limit uchun xesh bilan KV'da); kamera tasviri qurilmadan chiqmaydi. `shtrix_topilmadi` — faqat raqam + sanagich.
- Limit: `sh` hisobi IP bo'yicha kuniga 200 (`SHTRIX_LIMIT`), OFF'ga jonli so'rovlar sayt bo'yicha 5000 (`SHTRIX_OFF_LIMIT`); AI/rasm hisobi tegilmaydi.
- Statistika (`shtrix.*`): ochildi · topildi.oz · topildi.off · topilmadi · yorliqqa_otdi · qoshildi (+ qolda, ruxsat_rad); admin → Statistika → «Shtrix-kod skaneri» (topilish ulushi, eng ko'p topilmagan kodlar).

## Migratsiya (production, avval `~/backups`)
`migrations/shtrix.sql` (yangi jadvallar) + `migrations/shtrix-yorliq-kod.sql` (`ALTER TABLE yorliq_taklif ADD COLUMN kod TEXT` — bir marta). Migratsiya qo'llanmaguncha ham ilova ishlaydi (kod ustuni bo'lmasa taklif kodsiz saqlanadi; jadvallar bo'lmasa — «topilmadi»).
