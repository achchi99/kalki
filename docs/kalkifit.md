# KalkiFit — kaloriya, ovqat va qadam ilovasi (MVP) — reja

URL: `/kalkifit`, `/ru/kalkifit` (ЎЗ — shu sahifaning o'zi `?lang=cyr`). Nom: KalkiFit / KalkiFit. Kategoriya: Kundalik hayot.
Hech narsa serverga yuborilmaydi (faqat AI orqali ovqat matni — foydalanuvchi bosganda). Reklama yo'q.

## Ro'zg'or saboqlari (takrorlanmaydi)
- Tizim `date`/`select` yo'q: sana — kit'dagi o'z tanlagichi; til sahifa tilida (UZ da kirill, RU/ЎЗ da lotincha yo'q — test).
- Ilova 100dvh, pastki menyu mahkam (safe-area). SEO matni sahifa HTML'ida, ilovada «Ilova haqida» qatlamida.
- Har asosiy raqam bosilsa — oddiy tilda tushuntirish paneli. 3 ta birinchi ko'rsatma (Sozlamalardan qayta).
- Animatsiya 150–450 ms, transform/opacity (halqa — SVG stroke), `prefers-reduced-motion`da o'chadi, kutubxona yo'q.

## Fayllar
| Fayl | Vazifa |
|---|---|
| `assets/app-kit.js` | UMUMIY (Ro'zg'or + KalkiFit): sheet (prujina, swipe), toast, count-up, raqam klaviaturasi, sana tanlagich, yo'l-yo'riq, ikonkalar, sana/raqam formatlari |
| `assets/css/appkit.css` | UMUMIY uslub (layout, menyu, sheet, toast, tugma, tanlagich, onboarding, "haqida" qatlami, animatsiya) |
| `assets/kalkifit-core.js` | sof hisob (DOM yo'q): BMR/TDEE/maqsad/xavfsizlik/makro/suv/qadam/balans/vazn/migratsiya/parser/qidiruv |
| `assets/kalkifit-app.js` + `assets/css/kalkifit.css` | ilova |
| `data/ovqatlar.json` | ≥250 mahsulot (lazy, sw keshida) |
| `functions/api/kalkifit.js` | AI: matn → ovqat ro'yxati (ariza.js infratuzilmasi: Origin, kunlik limit) |
| `kalkifit.webmanifest`, `assets/icons/kalkifit-*.png` | alohida PWA nomi va ikonkasi |
| `tools/dizayn/test-kalkifit-core.mjs`, `test-kalkifit.mjs`, `tools/test-kalkifit-api.js` | testlar |

## Ma'lumot modeli (`localStorage kalki_fit`, v1)
```
{ v:1, setup, created, seq,
  profile:{ sex:'m'|'f', preg:bool, age, height(sm), weight(kg), act:1..5, goal:'keep'|'slow'|'lose'|'gain', goalWeight|null },
  days:{ 'YYYY-MM-DD':{ food:[{id, fid|null, name|null, meal:'b'|'l'|'d'|'s', unit, qty, g, kcal,p,f,c, est, ts}], water(stakan), steps } },
  weights:[{d, kg}], customFoods:[{id,name,kcal,p,f,c,g}], recents:[fid], favs:[fid],
  stepGoal, prefs:{tipsDone, ...}, lastBackup }
```
Ovqat yozuvi kcal/makroni O'ZI saqlaydi (baza keyin o'zgarsa tarix o'zgarmaydi). Sana — mahalliy kalendar (Toshkent va boshqa zonalar uchun test).

## Formulalar
- **BMR (Mifflin–St Jeor):** erkak `10·vazn + 6,25·bo'y − 5·yosh + 5`; ayol `… − 161`.
  Misol: 30 yosh erkak, 175 sm, 80 kg → 800 + 1093,75 − 150 + 5 = **1 748,75 ≈ 1 749** (buyurtmadagi "1 755" shu formula bilan chiqmaydi — hisobotda yozilgan).
- **TDEE = BMR × faollik:** 1,2 (ko'proq o'tiraman) · 1,375 (yengil: haftada 1–2 mashq) · 1,55 (o'rtacha: 3–5 mashq) · 1,725 (juda faol) · 1,9 (og'ir jismoniy mehnat). TDEE butun songa yaxlitlanadi.
- **Maqsad:** saqlash 0 · sekin kamaytirish −0,25 kg/hafta = −275 kcal · kamaytirish −0,5 kg/hafta = −550 kcal · ko'paytirish +0,25 kg/hafta = +275 kcal (7 700 kcal ≈ 1 kg). Kunlik = TDEE + farq.
- **Xavfsizlik:** kunlik maqsad pastki chegara: ayol 1 200, erkak 1 500 kcal — tushsa chegaralanadi va sabab yoziladi (haqiqiy tezlik qayta hisoblanadi). Haftasiga 1 kg'dan tez taklif qilinmaydi (eng ko'pi 0,5). Yosh < 18, homilador/emizikli, BMI < 18,5: faqat saqlash rejimi + «shifokor bilan maslahatlashing». «Taxminiy hisob, tibbiy maslahat emas» doim ko'rinadi.
- **Makro:** oqsil g/kg: saqlash 1,6 · sekin 1,8 · kamaytirish 2,0 · ko'paytirish 1,8 (kcal'ning 35% idan oshmaydi); yog' = kcal'ning 27,5% (25–30%) / 9; uglevod = qolgani / 4. Yig'indi maqsad bilan ±2 kcal.
- **Suv:** 33 ml/kg (30–35), stakan 250 ml.
- **Qadam:** qadam uzunligi = bo'y × 0,414; masofa = qadam × uzunlik; kaloriya = MET 3,5 × vazn × (masofa/5 soat). Balansga kaloriyaning **50%** i qo'shiladi (taxminiy hisob va ikki marta hisoblab yuborishni oldini oladi).
- **Kun balansi** = maqsad − yeyilgan + 0,5 × qadam kaloriyasi.
- **Vazn:** kunlik yozuvlar; 7 kunlik o'rtacha (oxirgi 7 kalendar kundagi yozuvlar o'rtachasi) chiziq; bir kunlik tebranishga e'tibor berilmaydi.

## Ekranlar
Pastki menyu: **Bugun · Ovqat · Qadam · Men**, markazda «+» (ovqat qo'shish).
A onboarding (6 ekran: jins → yosh → bo'y → vazn → faollik → maqsad → natija) · B Bugun (halqa, makro, suv, qadam, ovqatlar) · C ovqat qo'shish (qidiruv → porsiya → bo'lim → saqlash; matn bilan qo'shish) · D Qadam (kiritish, qayerdan olish, 7 kun diagramma, masofa taqqoslash, oylik) · E Men (profil, vazn grafigi, maqsad progress, ulashish kartasi, eksport/import, haqida) · F dushanba haftalik xulosa (faqat faktlar).

## Ovqatlar bazasi
Qiymatlar 100 g uchun: USDA FoodData Central va ochiq jadvallar asosida **taxminiy**; retsept taomlar — o'rtacha uy retsepti (belgi: «taxminiy»). Porsiya variantlari oddiy tilda (kosa, dona, bo'lak…). Qidiruv: lotin/kirill/rus + xato yozuv (translit + takror harf + Levenshtein ≤1), oxirgi va sevimlilar tepada, o'z taomini qo'shish.

## AI
Avval lokal parser («2 somsa», «1 kosa osh») baza bilan moslashtiradi; topilmaganini AI taxmin qiladi (`est:true`). Yuboriladi faqat shu matn bo'lagi (profil/tarix/vazn emas). Foydalanuvchi ko'rib «N ta ovqatni saqlash»ni bosadi; AI o'zi hech narsa saqlamaydi. Internet yo'q bo'lsa lokal rejim ishlaydi. Haftalik AI izoh va rasm — keyingi bosqich.

## Bosqichlar (feat: commit'lar)
1 kit ajratish (Ro'zg'or shuni ishlatadi, testlar yashil) → 2 kalkifit-core + test → 3 ovqatlar bazasi → 4 ilova + sahifa → 5 AI + kaloriya-kalkulyator ko'prigi → 6 integratsiya (katalog, menyu, sitemap, sw, manifest, OG) → 7 testlar, runner.
