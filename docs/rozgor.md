# Ro'zg'or — kundalik xarajat ilovasi (MVP) — reja

**Asosiy savol:** "Hozir qancha pulim bor, nimalarga yetishi kerak va BUGUN qancha sarflasam bo'ladi?"
URL: `/rozgor` (UZ, ЎЗ — `?lang=cyr`), `/ru/rozgor`. Ro'yxatdan o'tish yo'q, ma'lumot faqat qurilmada (`localStorage: kalki_rozgor`).

## Fayllar
- `assets/rozgor-core.js` — sof hisob (DOM'siz, butun so'm, sana — kalendar, UTC'siz). Brauzerda `window.KalkiRozgor`, Node'da `require()`.
- `assets/rozgor-app.js` — ilova (vanilla JS): ekranlar, bottom sheet, klaviatura, toast, saqlash, eksport/import, o'rnatish taklifi, UZ/RU matnlari.
- `assets/css/rozgor.css` — ilova uslubi (typo2 tokenlari, tungi rejim, mikro-animatsiya).
- `rozgor.html` (+ `ru/rozgor.html` prerender) — sahifa: tepada ILOVA, pastda SEO matni (H1, tushuntirish, FAQ + schema).
- `tools/dizayn/test-rozgor-core.mjs` (hisob), `tools/dizayn/test-rozgor.mjs` (Playwright). `sw.js`, `manifest` shortcut, sitemap, OG, katalog.

## Ma'lumot modeli (v1)
```
{ v:1, base:int,            // boshlang'ich balans
  reserve:int,              // zaxira (tegilmaydi)
  income:{date|null, amount|null},   // keyingi daromad: balansga QO'SHILMAYDI
  bills:[{id,name,amount,due:'YYYY-MM-DD',dom:int,recurring:bool}],   // majburiy to'lovlar (balansdan hali ayrilmagan)
  tx:[{id,type:'exp'|'inc'|'adj',amount:int,cat,date,ts,note,bill?}], // adj — ishorali (hisobni tekshirish farqi)
  seq:int, setup:bool, lastBackup, created }
```
`balans = base + Σinc − Σexp + Σadj` (hosila: siljish yo'q, o'chirish/tahrir qayta hisoblanadi). Hamma summa BUTUN so'm.

## Formulalar (bugun = `t`, mahalliy kalendar sanasi)
- ufq (exclusive): keyingi daromad sanasi; yo'q bo'lsa — keyingi oyning 1-kuni (oy oxirigacha, ekranda aniq yoziladi).
- qolgan kunlar = max(1, ufq − bugun) (bugun kiradi, daromad kuni kirmaydi).
- majburiy = ufqdan OLDINGI sanali to'lanmagan to'lovlar (muddati o'tgan ham; takroriy to'lov ufqgacha har safar sanaladi).
- bo'sh pul = balans − majburiy − zaxira. Manfiy bo'lsa: "Keyingi daromadgacha X so'm yetishmaydi" (0 bilan yashirilmaydi).
- bugungi sarf = bugungi `exp` (to'lov belgisi `bill` bo'lganlar hisobga olinmaydi — ular majburiy ro'yxatdan chiqqan).
- kunlik mo'ljal = ⌊(bo'sh pul + bugungi sarf) / qolgan kunlar⌋ — kun davomida O'ZGARMAYDI (oddiy xarajat bo'sh pulni va sarfni teng o'zgartiradi).
- bugun yana mumkin = mo'ljal − bugungi sarf (manfiy: "mo'ljaldan X oshdi"; ertangi mo'ljal = ⌊bo'sh pul/(kunlar−1)⌋ ko'rsatiladi).
- To'lov "To'landi": `exp` yozuvi (`bill` belgisi bilan) + to'lov ro'yxatdan chiqadi (takroriy — keyingi oyga, oy kuni `dom` saqlanadi) → ikki marta ayirilmaydi.
- Tushum: `inc` + keyingi daromad sanasi qayta so'raladi. Kartadan naqd yechish xarajat emas (balans bitta).
- Hisobni tekshirish: haqiqiy summa − balans = `adj` yozuvi (tasdiq bilan), toifalarga taqsimlanmaydi.
- "Shuni sotib olsam-chi?": hech narsa saqlanmaydi; oqibat: yangi bo'sh pul, ertangi mo'ljal, yaqin to'lovlarga yetishi.

## Ekranlar
Onboarding (3 qadam: balans → daromad sanasi → to'lovlar+zaxira) · **Bugun** (katta raqam, progress halqa, yaqin to'lovlar, bugungi xarajatlar, kartalar, "sotib olsam-chi") · **Tarix** (kunlar, oy toifalari) · **To'lovlar** (to'lovlar, zaxira, daromad sanasi) · **Sozlamalar** (hisobni tekshirish, tushum, eksport/import, o'chirish, til, shrift) · pastdan chiquvchi panel: xarajat qo'shish (o'z klaviaturasi, 8 toifa), tushum, tekshirish, to'lov, tahrir.
Pastki navigatsiya 4 tab + suzuvchi "+". Tungi rejim (`prefers-color-scheme`), reduced-motion, ≥44px, standalone'da SEO yashirin.

## Integratsiya
`oila-byudjet` natijasi ostida "Shu reja bilan kundalik hisobni boshlash" → `kalki_rozgor_import` (majburiy to'lovlar) → `/rozgor#boshlash`.
