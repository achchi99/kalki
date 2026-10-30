# v67: «Yorliqdan qo'shish», fast-food tarmoqlari, muzqaymoq turlari

Foydalanuvchi fikri: «Evos'dan qo'shsam ham mos taom yo'q… Mevali kam kaloriyali muzqaymoqlar yo'q… Baza hali kam».

## Fast-food tarmoqlari (`tools/ovqatlar-kengaytma5.js`, 79 ta)
- Qoida (foydalanuvchi o'zgartirdi): tarmoq nomi bilan, lekin har yozuvda belgi — «Taxminiy — tarmoq rasmiy qiymat e'lon qilmagan» (qator, porsiya kartasi, ⓘ Manba). Build: 8-ustun `tm` → `e=1`, `tm`, Manba matni.
- Hech bir tarmoq kkal/BJU e'lon qilmaydi (2026-10-30 tekshirildi: evos.uz, maxway.uz, oqtepalavash.uz, feedup.uz, lesailes.uz, choparpizza.uz, Wolt va Yandex menyulari; bellissimo.uz, kfc.com.uz — 403).
- Qiymat — menyudagi tarkib bo'yicha USDA SR Legacy komponentlari (lavash: tortilya + donar go'shti + pomidor + chips + ketchup + mayonez + piyoz; burger/hot-dog/fri/naggets/strips/qanot/pitsa — USDA fast-food yozuvlari).
- Og'irlik: Feed Up — feedup.uz (rasmiy, lavash 351 g, mini 170 g, burgerlar 248–352 g…); Oqtepa Tandir lavash — kursiv.media sharhi (365 g); Max Way fri — kombo tavsifi (100 g); KFC bayts — kombo tavsifi (60–67 g). Qolganlari — shu turdagi o'rtacha porsiya (izohda aytiladi).
- Wolt O'zbekistonda 2026-03-04 dan ishlamaydi; uning menyu tasmasi faqat tarkib uchun ishlatildi.
- Qidiruv: «evos/эвос/max way/maxway/oqtepa…» → shu tarmoq menyusi (asosiy taomlar — `pp` ommaboplik); «evos lavash» → Evos lavash M.
- Ikonka: id `tm-<tarmoq>-<tur>-…`, `kalkifit-app.js` `TM_ICO`.

## Muzqaymoq turlari
Ko'rinadigan bo'ldi: mevali muz (USDA 168813), mevali muzqaymoq (169632), sorbet (167577), sutli (167572), qaymoqli (167575), plombir (167573); yangi: eskimo (173466), plombir stakanchada, rojok, vafli briket (plombir + vafli, hisob), sendvich (172226). Mahalliy brend yorlig'i topilmadi — ular «Yorliqdan qo'shish» orqali.

## «Yorliqdan qo'shish»
- Kirish: topilmadi kartasi, bo'sh qidiruvdagi havola, Profil/panel → Imkoniyatlar → «Yorliqdan qo'shish», «Mening taomlarim» varag'i; birinchi «topilmadi»da bir martalik maslahat.
- AI: `/api/kalkifit-rasm` `tur: 'yorliq'` — faqat jadvaldagi raqamlar (100 g ga keltiriladi); limit — taom rasmi bilan umumiy. Rasm saqlanmaydi.
- Varaq: nom, «100 g uchun / 1 porsiya uchun», kkal/oqsil/yog'/uglevod, qadoq og'irligi; 4/9/4 ±15% — ogohlantirish.
- Anonim taklif: ruxsat bir marta (`prefs.lbShare`), faqat nom + 100 g raqamlari → `/api/kalkifit-yorliq` (D1 `yorliq_taklif`, `migrations/yorliq.sql`).
- Admin: `/admin/kalkifit-takliflar?tur=yorliq` — 2+ marta kelgani ajratiladi; «Bazaga qo'shish» → GET `/api/kalkifit-yorliq` (ilova umumiy bazaga qo'shadi, kesh 10 daqiqa).
- Statistika: `yorliq` (rasm/qolda/taklif), `tarmoq_qidiruv`, `ai_sorov` `yorliq.*`.
- Testlar: `test-yorliq`, `test-yorliq-api`, `test-tarmoq`.
