# «Retseptimni moslashtir» — reja (maketdan keyingi bosqich)

Hozirgi holat: **MAKET** (`retsept` tarmog'i, `assets/kalkifit-retsept.js`). AI yo'q. 3 ta soxta misol bor: osh, mastava, manti.
Hisob maketda ham haqiqiy: gramm × 100 g dagi qiymat, o'zgarish yoqilsa qayta hisoblanadi.
Test: `tools/dizayn/test-retsept-maket.mjs` (`--only retsept-maket`).

## Maketdagi soxta ma'lumot (1 porsiya)
| taom | kishi | oldin | keyin | o'zgarishlar (porsiyaga) |
|---|---:|---:|---:|---|
| Osh | 6 | 827 kkal | 613 (−26 %), oqsil 22 → 23 g, yog' 46 → 24 g | yog' 130 → 70 g (−90) · dumbasiz (−76) · go'shtning 1/3 qismi tovuq filesi (−32) · sabzi +200 g, guruch −50 g (−15) |
| Mastava | 4 | 551 | 385 (−30 %) | yog' 60 → 30 g (−67) · yog'siz mol go'shti (−61) · qaymoq → qatiq (−38) |
| Manti | 5 | 880 | 613 (−30 %) | dumba 100 → 30 g (−107) · go'shtning yarmi yog'siz mol (−57) · hamir yupqaroq, un −16 % (−58) · qaymoq → qatiq (−46) |

Osh miqdorlari 6 porsiya ≈ 820 kkal bo'ladigan qilib tanlangan. Topshiriqdagi «yog' 300 → 180 g» bilan 6 kishiga porsiya ~1100+ kkal chiqardi, shuning uchun yog' o'zgarishi 130 → 70 g (−90 kkal ≈ topshiriqdagi −95) bo'ldi.

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
