# KalkiFit — bazani kengaytirish (v20, 2026-10)

- **Manba fayli:** `tools/ovqatlar-kengaytma.js` — har qator: id · nom (UZ) · nom (RU) · sinonimlar · tur · porsiyalar · **manba**. Qiymat qo'lda yozilmaydi:
  - `u:<fdc_id>` — USDA FoodData Central SR Legacy (`data/manba/usda-sr-legacy.json`, `meta.qoshimcha["2026-10-21b"]`), go'sht — pishgan (cooked) yozuv;
  - `y:<kalit>` — ishlab chiqaruvchi yorlig'i: `data/manba/yorliq.json` (Open Food Facts, shtrix-kod bilan; mahsulot nomi va brendi saqlanadi);
  - `m:` — aralashma (choy + shakar, sutli qahva, latte…): komponentlar grammidan hisob → «taxminiy».
- **Milliy taomlar** (tuxum barak, hasip, kesma, unash, jigar qovurma, mampar, shivit oshi, ko'k chuchvara, yupqa, go'shtli non, kartoshkali qovurdoq) — `data/baza-retseptlar.json` (masalliq USDA'dan, `tools/baza-hisob.js`), «taxminiy».
- **Yasash:** `node tools/ovqatlar-build.js` → `node tools/cheklov-teglar.js --yoz` → `node tools/oqsil-teglar.js --yoz`. Manbasi topilmagan qator (yorliq yo'q) bazaga KIRMAYDI (ogohlantirish).
- **«Yemaydiganlarim» / oqsil teglari:** `ovqatlar-kengaytma.js` dagi `TEG` va `OQSIL` (shubhali — teg qo'yiladi).
- **Birliklar:** `shisha05/1/15` (0,5/1/1,5 l), `banka`, `shar` (muzqaymoq 60 g), `paket`, `plitka`; ichimliklarda 100 ml ≈ 100 g.
- **Test:** `tools/dizayn/test-baza-kengaytma.mjs` — manba, qiymat = manba, Atwater ±15%, nomlar, qidiruv (мороженое, курут, печень, кола, протеиновый батончик…).
- **Qidiruvda topilmagan so'zlar:** `functions/api/qidiruv.js` + `migrations/qidiruv.sql` (faqat kun + so'z + son), hisobot: `node tools/qidiruv-hisobot.js --kun 30`.
- Atwater ±15% ga tushmaydigan (tola/sirka ko'p) USDA yozuvlari qo'shilmadi (kakao kukuni, sirka, tomat pastasi, laym).
