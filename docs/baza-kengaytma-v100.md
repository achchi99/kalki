# KalkiFit v100 — baza bo'shliqlari, xatoga chidamli qidiruv (2026-11-24)

Manba: admin «topilmagan» (7 kun, 22/752 = 2,9 %), foydalanuvchi so'rovi — yog'lilik/variant bo'shliqlari.

## A. Topilmaganlar → endi nima topadi
| So'rov | Endi | Qanday |
|---|---|---|
| afisyanka, afisyanka kasha | Suli bo'tqasi (suvda) | sinonim + fonetik moslik (a/o, f/v) |
| gushtliy perok | Pirojki (duxovkada, go'shtli) va Gumma (qovurilgan) | sinonim: pishirilgan va qovurilgan — ikkalasi |
| ismaloq uy pichagi | Ismaloqli pirog (uyda) — YANGI | retsept hisobi (USDA), taxminiy |
| kari | Tovuqli karri (sousli) — YANGI | USDA aralashma, taxminiy |
| labne | Labne — YANGI | yorliq: Go Baladi Labneh (OFF 5287001015409) |
| padlifkali lagmon | Lag'mon | sinonim (podlivka) |
| san sebastian | San-Sebastyan chizkeyki — YANGI | USDA aralashma, taxminiy |
| shurva bir bulak patir | Sho'rva + Patir (2 taom) | «bulak/bo'lak» miqdor so'zi |
| suvak sho'rva | Sho'rva — qaynatma (bulyon) varianti | oila sinonimi |
| turub | Turp | sinonim + fonetik moslik |
| tuxum qovurilgan kichikbulak | Tuxum (qovurilgan), 0,3 dona | «kichik bo'lak» = asosiy birlikning 0,3 qismi |
| xrus | Guruch xlebtsi (xrustyashiy), Chips | prefiks sinonimi |
| zaf | Zefir — «Balki: …» | fonetik prefiks (faqat taklif) |

## B. Xatoga chidamli qidiruv (`assets/kalkifit-core.js`)
Faqat aniq moslik va oddiy fuzzy hech narsa bermaganda ishlaydi (`search(..., {ph:false})` — o'chirish). Natija massivida `.fuzzy = true` — ilova «Balki: …» deb ko'rsatadi, admin «Endi» ustunida «≈ balki».
- Skelet: -li/-liy/-lik/-lar tushadi; sh, ch bitta harf; unlilar (a e i o u y) tushadi, unlilar orasidagi v/w/y ham; v w f · k q g · x h · b p · d t · z s birlashadi.
- 3–4 harfli so'zda faqat so'z boshi (kefr ≠ kefir; zaf → zefir); aniq tenglik 5+ harfda; so'zning o'zi ham yaqin bo'lishi shart (zaf ≠ suv, labne ≠ alpen).
- AI matn yo'li (parseText): faqat aniq skelet tengligi va ≤2 harf farq (xato taomni jimgina tanlamaslik uchun).
- Miqdor so'zlari: bulak/bolak/bo'lak/bulagi (+ «kichikbulak» yopishgan), «bir bo'lak X», «X kichik bo'lak»; bo'lak birligi yo'q taomda: kichik 0,3 · odatiy 0,5 · katta 0,7 dona.
- Raqam bilan: «tvorog 1», «kefir 2.5», «smetana 10» — yog'lilik (oiladagi aynan sinonim bo'lsa), miqdor emas; «2 sut», «sut 200 ml», «tvorog 2 piyola» o'zgarmagan.
- Regressiya: 8367 nom/sinonim so'rovi bo'yicha 1-natija o'zgargani — 4 ta (hammasi yangi aniq taom: qaymoq 20 %, питьевой йогурт).

## C. Yog'lilik/variant bo'shliqlari
`node tools/baza-bitta-variant.js [--root <papka>] [--md]` — 18 guruh, 113 slot ilovaning o'z qidiruvi bilan so'raladi (oldin/keyin: git worktree bilan `--root`).

Oldin (v99):

| Guruh | To'ldirilgan | Bo'sh slotlar |
|---|---|---|
| tvorog | 4 / 6 | tvorog 1, tvorog 2 |
| sut | 7 / 7 | — |
| kefir | 3 / 3 | — |
| smetana | 4 / 4 | — |
| qatiq | 1 / 4 (BITTA variant) | qatiq 1.5, qatiq 2.5, qatiq 3.2 |
| ryajenka | 0 / 3 (BITTA variant) | ryajenka 2.5, ryajenka 3.2, ryajenka 4 |
| yogurt | 3 / 6 | yogurt 1.5, yunon yogurti 5, yogurt ichimlik |
| qaymoq | 3 / 3 | — |
| sariyog | 0 / 2 (BITTA variant) | sariyog 72.5, sariyog 82.5 |
| pishloq | 6 / 10 | mozzarella kam yog'li, adigey pishlog'i, pishloq 45, pishloq 50 |
| qiyma | 2 / 7 | qiyma 5, qiyma 10, qiyma 15, qiyma 20, tovuq qiymasi |
| mol go'shti qismlari | 1 / 5 (BITTA variant) | mol file, antrekot, mol yelka, mol son |
| qo'y go'shti qismlari | 1 / 4 (BITTA variant) | qo'y yelka, qo'y bel, qo'y boldir |
| tovuq qismlari | 7 / 7 | — |
| kolbasa/sosiska | 4 / 7 | kolbasa kam yog'li, kurka sosiska, pastrami |
| yorma (xom/pishgan) | 10 / 10 | — |
| non | 8 / 9 | butun donli non |
| ichimliklar | 16 / 16 | — |

Keyin (v100):

| Guruh | To'ldirilgan | Bo'sh slotlar |
|---|---|---|
| tvorog | 6 / 6 | — |
| sut | 7 / 7 | — |
| kefir | 3 / 3 | — |
| smetana | 4 / 4 | — |
| qatiq | 4 / 4 | — |
| ryajenka | 3 / 3 | — |
| yogurt | 6 / 6 | — |
| qaymoq | 3 / 3 | — |
| sariyog | 2 / 2 | — |
| pishloq | 10 / 10 | — |
| qiyma | 7 / 7 | — |
| mol go'shti qismlari | 5 / 5 | — |
| qo'y go'shti qismlari | 4 / 4 | — |
| tovuq qismlari | 7 / 7 | — |
| kolbasa/sosiska | 7 / 7 | — |
| yorma (xom/pishgan) | 10 / 10 | — |
| non | 9 / 9 | — |
| ichimliklar | 16 / 16 | — |

### Qo'shilgan mahsulotlar (guruhlar bo'yicha)
| Guruh | Soni | Nimalar | Manba |
|---|---|---|---|
| Tvorog (oila variantlari) | +2 | 1 %, 2 % | hisob: tvorog 0 % (88 kkal) + yog' farqi × 9 kkal/g → 92 va 101 kkal (0 → 1 → 2 → 5 → 9 → 18 % izchil) |
| Qatiq (oila variantlari) | +2 | 1,5 %, 2,5 % (3,2 % va yog'siz bor edi) | USDA 171284 (yogurt 3,25 %) + 173432 (yog'siz sut) aralashmasi |
| Yogurt | +4 | kam yog'li 1,5 %, yog'siz, yunon 5 %, ichimlik | USDA: sut tarkibi (1,5 % — 173441+172205, yog'siz — 173432), 171304, 170886 |
| Ryajenka | +2 | 2,5 %, 4 % | yorliq (OFF) |
| Qaymoq | +1 | 20 % | USDA 170857 |
| Sariyog' | +2 | 72,5 %, 82,5 % | USDA sariyog' 173410 + sut 171265 (72,5 %) / sut yog'i 173412 (82,5 %) — bitta manba |
| Pishloq | +4 | Edam (45 %), Rossiya (≈50 %), Adigey, Mozzarella kam yog'li | yorliq (OFF), USDA 170847 |
| Mol go'shti | +8 | file, antrekot, yelka, son, to'sh (xom); qiyma 5/10/20 % | USDA |
| Qo'y go'shti | +4 | son, yelka, bel, boldir (xom) | USDA |
| Tovuq / kurka | +8 | qanot, boldir, jigar, yurak, oshqozon, ko'krak (terili), qiyma (xom); kurka qiyma | USDA |
| Kolbasa / sosiska | +4 | mol kolbasa va sosiska (kam yog'li), kurka sosiska, kurka pastrami | USDA (cho'chqasiz) |
| Taomlar (A) | +4 | ismaloqli pirog, tovuqli karri, San-Sebastyan chizkeyki, labne | USDA aralashma / yorliq |
| **Jami** | **+41 taom, +4 oila varianti** | baza 1296 → 1337 taom | |

Yorma va non: bo'sh slot yo'q (xom/pishgan juftliklar bor edi); «butun donli», «javdar» non — sinonim. Ichimliklar: bo'sh slot yo'q (fanta, kapuchino, latte oila/sinonim orqali topiladi).

### Noaniq qolganlar
- **Adigey pishlog'i** — bitta do'kon yorlig'i (Vkusvil, 228 kkal); ishlab chiqaruvchiga qarab 210–265 kkal. **Ryajenka 1 %/6 %** — real yorliq topilmadi (qo'shilmadi). **Edam / Rossiya** — yorliq qiymati (brendga ±10 %).
- **Kari, ismaloqli pirog, San-Sebastyan** — retsept hisobi (taxminiy, ±15 %; pishirish yo'qotishi hisobga olinmagan).
- **«kichik bo'lak»** (0,3 dona) — kelishilgan taxmin; porsiya oynasida o'zgartiriladi.
- **«ismaloq uy pichagi»** — ma'nosi «ismaloqli uy pirogi» deb olindi (ko'k somsa alohida: somsa oilasi, «kokat» varianti).
- «zaf», «xrus» — chala so'zlar: faqat taklif (Balki / prefiks), AI matn yo'lida avtomatik tanlanmaydi (zaf).

### Fayllar
`assets/kalkifit-core.js` (qidiruv, parseText), `assets/kalkifit-app.js` («Balki», tvorog yog'lilik qatorlari), `tools/ovqatlar-kengaytma6.js` (yangi taomlar), `tools/ovqatlar-alias.json` (sinonimlar), `data/baza-oilalar.json|baza-retseptlar.json|baza-masalliq.json` (oila variantlari), `data/manba/yorliq.json` (+8 yorliq), `data/manba/usda-sr-legacy.json` (+25 USDA id; `tools/usda-qoshimcha.py` endi baza-masalliq.json ni ham o'qiydi), `tools/baza-bitta-variant.js`, `tools/test-qidiruv-xato.js`, `admin/kalkifit-statistika.html` («Endi» ustuni).

## Yog'lilik bo'yicha monotonlik (tuzatish)
Barcha yog'lilik qatorlarida kkal va yog' qat'iy o'sadi (Δkkal ≥ 3·Δyog', ≤ 11·Δyog' + 10): `tools/test-yoglilik-monoton.js` (barcha «yogliligi» oilalari + taomlar qatorlari + nomdagi «N %» guruhlari).
Tuzatilganlar: tvorog 1 % (86→92) va 2 % (87→101) — 0 % dan yog' farqi × 9 kkal/g; qatiq 1,5/2,5 % (63/62→47/54) va yogurt kam yog'li (63→46) — USDA sut/yogurt aralashmasi (yog' bo'yicha izchil); sariyog' 72,5 va 82,5 % (662/748 → 644/729) — bitta USDA manbasi.

## Onigiri (+4 taom)
| Taom | kkal/100 g | kkal/dona | Manba |
|---|---|---|---|
| Onigiri (tunets-mayonez bilan) | 226 | 249 (110 g) | Lawson yorlig'i (OFF 2303957952452) |
| Onigiri (losos bilan) | 195 | 215 (110 g) | Mitsuwa yorlig'i (OFF 0410050000019) |
| Onigiri (tovuq, teriyaki) | 162 | 178 (110 g) | Kizvna yorlig'i (OFF 8588008627051) |
| Onigiri (oddiy, guruch va nori) | 126 | 126 (100 g) | retsept hisobi: USDA 168882 (qisqa donli guruch, pishgan) 96 g + nori 168458 4 g |

Sinonimlar: onigiri, onigri, anigiri, omusubi, онигири, рисовый шарик, «онигири с тунцом/лососем/курицей». Guruh: guruch (+ baliq / tovuq). Qidiruvda tartib: tunets-mayonez → losos → tovuq → oddiy (`POP`).
