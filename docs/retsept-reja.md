# «Retseptimni moslashtir» — reja (maketdan keyingi bosqich)

Hozirgi holat: **MAKET** (`retsept` tarmog'i, `assets/kalkifit-retsept.js`). AI yo'q. 3 ta soxta misol bor: osh, mastava, manti.
Hisob maketda ham haqiqiy: gramm × 100 g dagi qiymat, o'zgarish yoqilsa qayta hisoblanadi.
Test: `tools/dizayn/test-retsept-maket.mjs` (`--only retsept-maket`).

## Maketdagi ma'lumot (1 porsiya) — odatiy uy retseptlari, raqamga moslanmagan
Qoida: retsept raqamga qarab o'zgartirilmaydi — avval haqiqiy uy retsepti olinadi, natija qancha chiqsa shuni ko'rsatamiz.
Hisob maketda ham haqiqiy: gramm × 100 g dagi qiymat (yog' — ml, zichligi 0,92).

| taom | kishi | masalliqlar | oldin | keyin | o'zgarishlar (porsiyaga) |
|---|---:|---|---:|---:|---|
| Osh | 8 | 1 kg guruch, 850 g qo'y go'shti + 150 g dumba, 1 kg sabzi, 250 ml yog', 300 g piyoz (2 ta), 50 g sarimsoq (1 bosh), ziravor | **1182 kkal** | **905** (−23 %), oqsil 29 → 31 g, yog' 67 → 34 g | yog' 250 → 150 ml (−103) · dumbasiz (−143) · go'shtning 1/3 qismi tovuq filesi (−46) · sabzi +300 g (**+15**, to'yimlilik oshadi) |
| Mastava | 6 | 500 g mol go'shti, 200 g guruch, 450 g kartoshka, 200 g sabzi, 200 g piyoz, 200 g pomidor, 70 ml yog', 150 g qaymoq, ko'kat | **539** | **392** (−27 %) | yog' 70 → 40 ml (−41) · yog'siz mol go'shti (−67) · qaymoq → qatiq (−38) |
| Manti | 6 (30 dona) | 500 g un, 500 g qo'y go'shti, 100 g dumba, 600 g piyoz, 120 g qaymoq, ziravor | **723** | **508** (−30 %) | dumba 100 → 30 g (−89) · go'shtning yarmi yog'siz mol (−47) · hamir yupqaroq (−49) · qaymoq → qatiq (−31) |

Eslatma: osh porsiyasi 1182 kkal — chunki haqiqiy uy retseptida 8 kishiga 1 kg guruch va 250 ml yog' ketadi, yog'ning katta qismi taomda qoladi. Bu — kutilgan natija, maqsadli raqamga moslanmagan.
Sabzi +300 g kaloriyani biroz OSHIRADI (+15); maketda buni yashirmaymiz: kartada «+15 kkal porsiyada, lekin to'yimlilik oshadi» deb ko'rsatiladi.

## 1. AI nima qiladi (faqat ikki ish)
1. **Masalliqlarni bazaga moslash:** matn yoki rasm → `[{ nom, baza_id, gramm, ishonch }]`. `ishonch` past bo'lsa — maketdagi sariq «tanlang» (2–3 nomzod + «Qo'shmaslik»).
2. **Ruxsat etilgan o'zgarishlardan tanlash:** quyidagi ro'yxatdan 3–4 tasi va har birining parametri (masalan yog' koeffitsienti 0,5–0,7).
   AI faqat `{ id, param }` qaytaradi.

**Kkal, oqsil va yog'ni AI hisoblamaydi.** Ularni baza hisoblaydi: `data/ovqatlar.json` / baza-v2 masalliqlari, `kalkifit-core` kabi deterministik funksiya.
AI javobi sxema bilan tekshiriladi: noma'lum `id`, ro'yxatdan tashqari o'zgarish yoki diapazondan chiqqan parametr tashlanadi.

## 2. Ruxsat etilgan o'zgarishlar (ta'mga ta'sir: 0 — deyarli sezilmaydi, 1 — ozgina farq, 2 — boshqacha ta'm)
| id | o'zgarish | parametr | ta'm | qachon |
|---|---|---|:-:|---|
| `yog_kam` | yog'ni kamaytirish | ×0,5–0,7 | 0–1 | qovurma, osh, sho'rva |
| `dumba_yoq` | dumbani olib tashlash / kamaytirish | 0 yoki ×0,3 | 1 | osh, manti, somsa, kabob |
| `gosht_qisman` | go'shtning bir qismini tovuq filesi / yog'siz mol go'shti bilan | 1/3–1/2 | 0–1 | osh, manti, sho'rva, lag'mon |
| `sabzavot_qosh` | sabzavot qo'shish (sabzi, qovoq, karam) | +100–300 g | 0 | osh, sho'rva, dimlama |
| `guruch_qisman` | guruchning bir qismini sabzavot / no'xat bilan | −10–25 % | 1 | osh, mastava |
| `dimlash` | qovurish → dimlash / pishirish | — | 1 | qovurma, kotlet |
| `qatiq` | mayonez / qaymoq → qatiq | 1:1 | 1 | salat, manti, chuchvara |
| `shakar_kam` | shakarni kamaytirish | ×0,5–0,7 | 1 | pishiriq, kompot |
| `hamir_yupqa` | hamir yupqaroq | un ×0,8–0,9 | 0 | manti, chuchvara, somsa |

**Qoidalar.**
- Taomning o'zligini buzadigan taklif yo'q. Masalan: oshdan guruchni olib tashlash, mantini qovurish, sho'rvani suvsiz qilish — yo'q. Har taom turi uchun ruxsat jadvali bo'ladi.
- **Yemaydiganlarim** amal qiladi (`cheklov-core`): masalan sut belgilangan bo'lsa «qatiq» o'zgarishi taklif qilinmaydi, uning o'rniga «yog' kamaytirish».
- **Cho'chqa qoidasi** amal qiladi: cho'chqa go'shti hech qachon taklif qilinmaydi. Masalliqda bo'lsa — yumshoq ogohlantirish, xuddi `rGuess` kabi.

## 3. Infratuzilma
- Mavjud AI endpoint'idan (`functions/api/kalkifit.js` — matn va rasm tahlili) yangi rejim `retsept` sifatida foydalaniladi. Prompt'da baza nomzodlari ro'yxati bo'ladi (top-N qidiruv natijasi).
- Kunlik limit: qurilmaga 5 marta (KV, IP-xesh + qurilma tokeni). Limitdan keyin — «ertaga» va qo'lda masalliq tanlash.
- Kesh: bir xil retsept matni → KV (normallashtirilgan matn xeshi, 30 kun), shunda AI qayta chaqirilmaydi.
- AI xato bersa yoki vaqt tugasa: qo'lda masalliq tanlash ekrani (bazadan qidirish + gramm). O'zgarishlar baza qoidalari bilan baribir taklif qilinadi.
- Saqlash: «Mening taomlarim» (`S.saveRecipe`, `customFoods`) — yengil versiya masalliqlari bilan, `recipe.portions` = kishi soni.
- Anonim hisoblagichlar (`functions/api/hisob.js` whitelist): `retsept_boshlandi`, `retsept_natija`, `retsept_saqlandi`, `retsept_ulashildi`.

## 4. Taxminiy hajm va bosqichlar
| bosqich | ish | hajm |
|---|---|---|
| 0 (bajarildi) | Maket, 4 ekran, soxta ma'lumot | — |
| 1 | Hisob yadrosi `retsept-core.js` (UMD): baza id → kkal/oqsil/yog', o'zgarishlar ro'yxati va ruxsat jadvali, Yemaydiganlarim / cho'chqa; node testlari | 1–1,5 kun |
| 2 | AI rejimi: endpoint, prompt, javob sxemasi, limit, KV kesh, xato → qo'lda tanlash | 1,5–2 kun |
| 3 | UI'ni maketdan haqiqiyga ulash: «tanlang» nomzodlari, saqlash «Mening taomlarim»ga, hisoblagichlar | 1 kun |
| 4 | Ulashish kartochkasi (shrift, ЎЗ/RU), tekshiruv (360 px, katta shrift, klaviatura, dark), yangiliklar yozuvi, reliz | 0,5–1 kun |
