# «Retseptingizni yengillashtiring» (KalkiFit)

Bugun ekranidagi eshik karta → 4 ekran: Kirish → Tahlil → Natija → Ulashish kartochkasi. Mahalliy hisob + deterministik qoidalar; AI FAQAT masalliqni ajratadi.

## Arxitektura
| qism | fayl | vazifa |
|---|---|---|
| Hisob yadrosi | `assets/retsept-core.js` (UMD: brauzer, Pages Function, node) | matn → masalliq (alias, miqdor + birlik → gramm), kkal/oqsil/yog'/uglevod, taom turi, qoidalar |
| Baza | `data/retsept-masalliq.json` (`tools/retsept-yasa.js` yasaydi, `--tekshir`) | 48 masalliq, 100 g dagi qiymat — USDA SR Legacy (`baza-masalliq.json` + `manba/usda-sr-legacy.json`; 6 tasi qo'shimcha: sarimsoq, mayiz, qaymoq, mayonez, yashil no'xat, ziravor) |
| Interfeys | `assets/kalkifit-retsept.js` | ekranlar, tanlagich, saqlash, ulashish (canvas 1080×1350) |
| AI endpoint | `functions/api/retsept.js` | mahalliy parser TANIMAGAN qatorlar → masalliq id + miqdor + birlik |
| Hisoblagichlar | `functions/api/hisob.js` | `retsept_ochildi · retsept_ai · retsept_natija · retsept_saqlandi · retsept_ulashildi · retsept_xato` |

**Kkal/oqsil/yog'/uglevod hech qachon AI'dan olinmaydi.** AI javobi sxema bilan tozalanadi: id faqat jadvaldan, miqdor/birlik tekshiriladi, gramm serverda hisoblanadi. AI aniqlagan masalliq ekranda «AI: «nomi» → bazadagi nomi (tekshiring)» deb ko'rsatiladi.

## Oqim
1. Matn (yoki misol: Osh/Mastava/Manti — AI'siz) → mahalliy parser → tanilmagan qatorlar bo'lsa AI (faqat o'sha qatorlar).
2. Tahlil: har masalliq −/+ bilan to'g'rilanadi (yog' — ml); sariq belgi = tanilmagan («tanlang») yoki miqdori noaniq («gramm kiriting») — tanlanmaguncha «Davom» o'tmaydi; qo'lda masalliq qo'shish (qidiruv); necha kishiga (1–12).
3. Natija: katta raqam (odometr), Oldin/Keyin (kkal, oqsil, yog'), eng foydali 3–4 qoida (toggle jonli), halol izoh. «Saqlash» → «Mening taomlarim» (`S.saveRecipe`, porsiya kkal bilan) → «Bugunga yozish» (bir bosishda porsiya oynasi).
4. Ulashish: PNG, Web Share (fayl bilan), bo'lmasa yuklab olish.

## Qoidalar (deterministik; retsept raqamga MOSLANMAYDI)
| qoida | nima | ta'm | qachon |
|---|---|:-:|---|
| `yog` | yog'/sariyog' ×0,6 (−40%) | 0 | yog' ≥ 20 g; olivyega yo'q |
| `dumba` | osh/sho'rva/mastava: olib tashlash; manti/somsa: ×0,3 | 1 | dumba ≥ 20 g |
| `gosht` | qo'y: 1/3 → tovuq filesi (manti/somsa: 1/2 → yog'siz mol); mol: 1/2 → yog'siz mol; tovuq soni → ko'krak | 0–1 | go'sht ≥ 100 g |
| `qatiq` | qaymoq → qatiq; mayonezning yarmi → qatiq | 1 | qaymoq/mayonez ≥ 20 g; sut yemaydiganlarda yo'q |
| `shakar` | ×0,7 (−30%) | 0 | shakar ≥ 20 g |
| `sabzavot` | sabzi +30% (≥100 g) — kkal OSHISHI mumkin, halol ko'rsatiladi | 0 | osh/sho'rva/mastava |
Guruch/un tegilmaydi (guruchsiz osh yo'q). Eng foydali 3–4 tasi tanlanadi (foyda ≥ 8 kkal). Cho'chqa go'shti — qo'shilmaydi (ogohlantirish). Yemaydiganlarim — taklif qilinadigan masalliq cheklangan bo'lsa, qoida chiqmaydi.

## Limit va xavfsizlik
Qurilmaga kuniga 5 AI so'rovi (`RETSEPT_CLIENT_LIMIT`), IP — 10, sayt — 800/kun (`RETSEPT_SITE_LIMIT`); KV (`ns: rt`). Bir xil matn — KV keshi (30 kun, limitga sanalmaydi). Modelga FAQAT masalliq matni ketadi (profil, vazn yo'q), telefon raqami yashiriladi. AI xato/limit/tarmoq yo'q → tushunarli xabar + qo'lda masalliq (soxta natija YO'Q). «Rasmga olish» — «Tez orada».

## 6 haqiqiy retsept (UZ = RU natijasi bir xil; `node tools/test-retsept-core.js --jadval`)
| taom | kishi | oldin → keyin (1 porsiya, kkal) | oqsil | yog' | qoidalar (foyda kkal/porsiya) |
|---|---:|---|---|---|---|
| Osh | 8 | 1188 → 927 (−22%) | 30→31 | 66→35 | dumba −124 · yog' −99 · go'sht −52 · sabzavot +16 |
| Mastava | 6 | 571 → 458 (−20%) | 22→23 | 32→18 | go'sht −50 · yog' −36 · qatiq −35 · sabzavot +6 |
| Manti | 6 | 716 → 554 (−23%) | 25→26 | 35→16 | dumba −77 · go'sht −57 · qatiq −27 |
| Somsa | 8 | 886 → 638 (−28%) | 26→26 | 58→30 | dumba −116 · yog' −72 · go'sht −60 |
| Sho'rva | 6 | 553 → 464 (−16%) | 26→28 | 39→27 | go'sht −65 · yog' −31 · sabzavot +7 |
| Olivye | 6 | 558 → 455 (−18%) | 15→16 | 42→30 | qatiq −103 (mayonezning yarmi) |

## Testlar
`retsept-core` (parser + 6 retsept × UZ/RU, qoidalar, Yemaydiganlarim, cho'chqa), `retsept-api` (Origin, limit, kesh, tozalash, xato), `retsept` (brauzer: eshik, 4 ekran, AI soxta, xato yo'llari, saqlash, ulashish, hisoblagichlar, 360/katta shrift/dark/RU/ЎЗ/reduced-motion). Brauzer testlarida avtomatik slayd/splash/animatsiya `localStorage.kalki_no_intro='1'` bilan o'chiriladi.

## Qaytarish
Eshik kartani yashirish: `kalkifit-app.js` dagi `R.door()` chaqiruvini olib tashlash (Bugun `sl-doors`); to'liq qaytarish — `git revert <merge commit>` (migratsiya yo'q, KV kalitlari o'zi tugaydi).
