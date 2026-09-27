# Avtomobil rasmiylashtirish kalkulyatori — Asror tasdiqlashi kerak bo'lgan savollar

**1- va 4-savolni bitta real YHXX invoysi (ishlatilgan avto, qatorma-qator) hal qiladi;
5, 7, 8-savollarni e-notarius KALKULYATORI (xizmat tavsifi emas) natijalari hal qiladi.**

## 2303-5 topilmasi (2026-09-26)

Aniq manba topildi: 2303-5-son IIV buyrug'i, 31.03.2024 ro'yxatdan o'tgan, 01.04.2024 dan
kuchda (https://lex.uz/docs/6858813). Bu buyruq 2303-son tarif hujjatining 7-bandini qayta
yozadi (endi elektromobil/mototransport/tirkamalarga tegishli, 1,5 BHM) va yangi 7¹-bandni
qo'shadi ("boshqa barcha avtotransport vositalarini ro'yxatdan o'tkazish va qayta ro'yxatdan
o'tkazish uchun — 6,84 BHM"). Qo'shimcha tasdiq: gov.uz rasmiy advice sahifasi
(gov.uz/oz/advice/73/document/152) xuddi shu buyruqni keltiradi.

Natija: **1-savol HAL BO'LDI** — `qoida_egasi_almashganda` holati `NORMATIV_TALQIN`dan
`TASDIQLANGAN`ga o'tkazildi. Lekin yangi nuance ochildi: 7¹-band "ro'yxatdan o'tkazish VA
qayta ro'yxatdan o'tkazish"ni BITTA 6,84 BHM stavkasiga birlashtiradi — bu `avto_qayta_royxat`
(0,1 BHM, egasi o'zgarmaydigan holatlar uchun) konstantasi 2024-yildan buyon eskirgan bo'lishi
mumkinligini anglatadi. Bu hali to'liq tasdiqlanmagan (16-savol) va konstanta hamon UI'da
ishlatilmagani uchun kodga ta'sir qilmaydi.

## 2-FAZA yangilanishi (2026-09-26)

Asror e-notarius rasmiy kalkulyatorida ikkita qo'shimcha sinov o'tkazdi (skrinshotlar:
`notarius-qarindosh-kredit-2026-09-26.jpg`, `notarius-halokat-10-2026-09-26.jpg`) va
Hamkorbankning yozma eskrou tarifini topdi.

**✅ HAL BO'LDI deb belgilanadigan savollar:**
- **7-savol (qarindosh+kredit kombinatsiyasi)** — endi ochiq emas. Sof sinov (qarindosh+kredit,
  halokatsiz) 6 600 so'm chiqardi (3 BHM × 0,05 × 0,10) — imtiyozlar KO'PAYTIRILADI, dvigatel
  (`assets/avto-rasm.js`) endi `qarindosh`/`kredit` mustaqil bayroqlar sifatida qo'llaydi.
- **Halokat/qoldiq foiz formulasi** (yangi, 7-savol bilan bitta sinov turkumida aniqlandi) —
  begona+halokat(qoldiq 10%) = 132 000 so'm (3 BHM × 10%); qarindosh+kredit+halokat(qoldiq 10%)
  = 660 so'm (3 BHM × 0,05 × 0,10 × 10%). Qoldiq foiz omili boshqa imtiyozlarni almashtirmaydi,
  ular bilan birga ko'paytiriladi. Konstantalar: `qoida_notarius_imtiyoz_kombinatsiya`,
  `qoida_notarius_halokat_qoldiq_foiz` (ikkalasi ham TASDIQLANGAN).
- **Eskrou komissiyasi misoli** — Hamkorbankning 2026-yil 11-iyundan amaldagi yozma tarifi
  (12-bo'lim) topildi: eskrou ochish bepul, avto xaridi uchun mablag' kiritish 0,25 BHM
  (110 000 so'm), kassadan olish bepul. `eskrou_komissiya_davlat_bank_max` izohiga qo'shildi —
  bu FAQAT misol, standart qiymat sifatida ishlatilmaydi.
- **4-savol ("ariza — 0,1 BHM")** — **rad etildi, qo'shilmaydi.** Na my.gov 985 portal
  invoysida, na 2303-son buyruq tarifida "ariza" nomli alohida band topilmadi — bu YouTube
  amaliyotchisining shaxsiy tavsifi bo'lishi mumkin, rasmiy manba bilan tasdiqlanmagan holda
  sahifaga kiritilmaydi.

**Hali ochiq qoladigan savollar (o'zgarishsiz yoki aniqlashtirilgan):** 2, 3, 5 (kichik
qismi), 9, 10, 11, 12, 13, 14, 15, 16, 17 — quyidagi jadvalda batafsil (1-savol 2303-5
topilmasi bilan yopildi, qarang yuqoridagi bo'lim). Muhimi: raqam
almashtirish/yo'qolgan/tranzit/saqlash stavkalari (13-savol) hamon ZIDDIYAT holatida —
shuning uchun "Faqat raqam" stsenariysi 2-fazada ham qurilmadi.

| # | Savol | Hozirgi holat | Qanday tekshiriladi | Javob |
|---|---|---|---|---|
| 1 | Egasi almashganda 6,84 BHM qo'llanishi | ✅ **HAL BO'LDI (2026-09-26).** Aniq manba: 2303-5-son IIV buyrug'i, 31.03.2024 ro'yxatdan o'tgan, 01.04.2024 dan kuchda, 7¹-band (https://lex.uz/docs/6858813). Buyruq matni to'g'ridan-to'g'ri o'qildi va tasdiqlandi. Qo'shimcha: gov.uz rasmiy advice sahifasi xuddi shu buyruqni keltiradi (gov.uz/oz/advice/73/document/152) | Real YHXX invoysi (ixtiyoriy, qo'shimcha tasdiq uchun) | `qoida_egasi_almashganda` holati `TASDIQLANGAN`ga o'tkazildi |
| 2 | Davlat raqami 9 BHM ni belgilagan normativ hujjat | ✅ my.gov 985-xizmatida 9 BHM tasdiqlangan. OCHIQ: qaysi hujjat (2303-sonning keyingi tahriri yoki Uzavtomotobelgi tarifi) 2026-yildagi 562-son VMQ'dan keyingi yangi qiymatni belgilagan | lex.uz'da 562-son VMQ yoki uning ijrosidagi tarif hujjatini qidirish | — |
| 3 | Texpasport 1,4 BHM normativ asosi | ✅ my.gov 985-xizmatida tasdiqlangan. OCHIQ: normativ asosi (2303-son eski tahririda 0,7 BHM edi) | lex.uz'da tegishli hujjatni qidirish | — |
| 4 | Videodagi "ariza — 44 000 so'm" (= 0,1 BHM) | ✅ Kun.uz (2025-yil aprel) onlayn ro'yxatdan o'tkazish to'lovlari ichida "texnik ko'rik — 0,1 BHM"ni sanagan; Kursiv hisobida ham 0,1 BHMlik qator bor. my.gov 985 matnida bunday qator yo'q | Real YHXX invoysida bormi, nomi nima? | **Rad etildi (2-FAZA) — qo'shilmaydi.** Na portal invoysida, na 2303-son tarifda "ariza" nomli alohida band topilmadi. |
| 5 | e-notarius kalkulyatori (begona+kredit) natijasi | ✅ Olindi: boj 0,3 BHM, gerb 0,1, loyiha 0,2, tushuntirish 0,15, taqiq 0,15, ijro 0,1, so'rovnoma 0,05 — jami 462 000. OCHIQ (kichik): imtiyozlarning Davlat boji qonunidagi aniq bandi | lex.uz/docs/4680944 ilovasidan band raqamini topish | — |
| 6 | Oldi-sotdi imtiyozi qarindoshlar ro'yxati | ✅ e-notarius 13000-xizmat sahifasidan olindi (`notarius_qarindoshlar_royxati_oldisotdi`) | — | tasdiqlangan |
| 7 | Qarindosh+kredit birga qo'llanadimi | ✅ 2-FAZA sinovlari bilan yopildi: (a) faqat Qarindosh+Kredit → 6 600 so'm (3 BHM × 0,05 × 0,10) — imtiyozlar ko'paytiriladi, tasdiqlandi; (b) Begona+halokat(qoldiq 10%) → 132 000 so'm (3 BHM × 10%) — qoldiq foiz alohida omil sifatida ko'paytiriladi, tasdiqlandi. Ikkalasi ham Davlat boji qonunining o'z matnida so'zma-so'z yozilmagan — rasmiy davlat tizimining amaldagi hisobidan olingan (skrinshotlar bilan) | e-notarius kalkulyatorida ikki alohida hisob | **Hal qilindi — 2-FAZA, `qoida_notarius_imtiyoz_kombinatsiya` / `qoida_notarius_halokat_qoldiq_foiz`.** Dvigatel `qarindosh`/`kredit`/`halokat`+`qoldiq_foiz` mustaqil bayroqlariga o'tkazildi. |
| 8 | Notarius qo'shimchalari | ✅ Kalkulyator bilan yopildi — videodagi 1 628 000 va 374 000 formula bilan so'mma-so'm chiqdi. Qo'shimcha: halokat/yuridik shaxs/idoradan tashqari variantlari (2-faza) | — | tasdiqlangan |
| 9 | Ishonchnoma narxi farqi | Qonun bo'yicha boshqa shaxsga 2 BHM (880 000); videoda "sotish huquqi bilan, bir kishiga, qo'shimcha xizmatlarsiz" 440 000 so'm, uch kishiga 528 000 so'm deyilgan | Farq sababi — real invoys yoki notarius bilan tekshirish | — |
| 10 | my.gov.uz elektron ishonchnoma narxi | Videoda muddatga qarab 79 200 / 396 000 / 792 000 so'm (0,18 / 0,9 / 1,8 BHM) | Birlamchi manba topish | — |
| 11 | Raqamni o'tkazish — yagona oshirilgan tarif jadvali | Ochiq manba hali topilmadi | Uzavtomotobelgi yoki my.gov tarif sahifasi | — |
| 12 | Eskrou — 10 yil qaysi sanadan hisoblanadi | ◐ Normativ asos topildi (3790-son nizom, 01.04.2026; PF-246). OCHIQ: model yili yoki ishlab chiqarilgan aniq sana bo'yicha hisoblanadimi; PF-246 dagi band harfini ("2-band 'j'") lex.uz matnidan tasdiqlash | lex.uz/uz/docs/-7897630 to'liq matnini o'qish | — |
| 13a | Raqam almashtirish (juft/bitta) — ✅ HAL BO'LDI (2026-09-27): 4,5 / 2,25 BHM, my.gov.uz xizmati + 4 mustaqil manba bilan tasdiqlandi | ✅ `avto_raqam_almashtirish_juft`=4,5 BHM, `avto_raqam_almashtirish_bitta`=2,25 BHM — my.gov.uz "Shikast yetgan avtotransport vositasining davlat raqami belgisini tiklash" xizmati (2026-04) + Gazeta.uz/Aniq.uz/Yuz.uz | t.me/s/mygovuz, gazeta.uz, aniq.uz, yuz.uz | Hal qilindi — `holat: TASDIQLANGAN`. Dvigatelga hali kiritilmagan ("Faqat raqam" stsenariysi qurilmagan). |
| 13b | Raqam yo'qolgan/tranzit/saqlash stavkalari | my.gov'dagi tegishli xizmatlar sahifalaridagi amaldagi stavkalar hali kerak (2-faza uchun) | my.gov.uz tegishli xizmat sahifalari | — |
| 14 | Texpasport dublikati stavkasi | Amaldagi stavka hali topilmadi | my.gov.uz | — |
| 15 | Naqd to'lov chegarasi (PF-246, 2-band "d", PF-175 tahriri 27.08.2026) 400 BHM avto oldi-sotdisiga qo'llanadimi | Noaniq — javob kelguncha sahifa 10 yildan eski avtolar uchun naqd/naqdsiz haqida da'vo qilmaydi | lex.uz'da PF-175/PF-246 to'liq matni | — |
| 16 | ⚠️ MUHIM: "Qayta ro'yxatdan o'tkazish" (familiya, manzil, rang o'zgarishi va h.k.) oddiy avtomobil uchun HALI HAM 0,1 BHMmi, yoki 2303-5-son buyruq (7¹-band, "ro'yxatdan o'tkazish VA qayta ro'yxatdan o'tkazish" — ikkalasi 6,84 BHM) buni ham 6,84 BHMga ko'targanmi? 2011–2023 yillarda bu ikkisi (ro'yxat + qayta ro'yxat) bitta bandda, bitta past stavkada (0,1 BHM) edi. 2024-yildagi tuzatish ularni bitta YUQORI stavkaga (6,84 BHM) birlashtirgan ko'rinadi. Bu konstanta (`avto_qayta_royxat`) hozircha kodda ishlatilmagani uchun shoshilinch emas, lekin sahifadagi tushuntirish matnini yozishda e'tiborga olinishi kerak | lex.uz/docs/1918264 sahifasini brauzerda ochib, "Joriy versiya" tugmasini bosib, band 7/7¹ matnini o'qish (avtomatlashtirilgan tekshiruv vositasi sana parametridan qat'i nazar eski keshlangan nusxani qaytardi, shuning uchun bu qo'lda tekshirilishi kerak) | — |
| 17 | Davlat raqami (my.gov.uz'da 9 BHM) va texpasport (my.gov.uz'da 1,4 BHM) — lex.uz'ning oxirgi tekshirilgan versiyalarida (01.11.2023 holatiga ko'ra) band 1 hamon 3,5 BHM, band 8 hamon 0,7 BHM ko'rsatgan — ya'ni portal va lex.uz o'rtasida ikki baravar farq bor (texpasportda aniq 2x, raqamda 2,57x). Bu farq ehtimol 23.12.2024-dagi keyingi tuzatish (2303-7-son) bilan izohlanadi, lekin bu hali TO'LIQ TEKSHIRILMAGAN — avtomatlashtirilgan vosita ushbu sanadagi to'liq matnni ololmadi | lex.uz/docs/1918264, "Joriy versiya", band 1 va band 8 (qo'lda tekshirish) | — |

## Amaliy ma'lumotlar (saytga chiqmaydi)

- Odamlar aytishicha: bitta avtoni rasmiylashtirish ~8 mln so'm; o'z raqamini yangi avtoga
  o'tkazish ~4 mln so'm. Tarkibi noma'lum — saytda ishlatilmaydi.
- Amaliyotchi YouTube videosi (2026-yil sentabr, BHM 440 000, transkripsiya — raqamlar
  nutqdan tanib olingan): yangi benzinli avto, oddiy raqam — raqam 3 960 000, texpasport
  616 000, ro'yxat 3 009 600, ariza 44 000; EV uchun ro'yxat 660 000. Tanlangan raqam
  olinsa, raqamdan tashqari xarajat ~3,8 mln. Notarius oldi-sotdi: begona 1 628 000,
  qarindosh 374 000.
- Video raqamlari my.gov 985 dagi 9 BHM (raqam) va 1,4 BHM (texpasport) bilan mos keldi —
  bu ikkalasi dvigatel tomonidan mustaqil qayta hisoblanganda ham aynan mos chiqdi
  (`tools/test-avto.js`, 1 va 5-fixture).

## Holat belgilari

- ✅ — tasdiqlangan, ochiq savol yo'q
- ◐ — asosiy xulosa tasdiqlangan, kichik/ikkinchi darajali savol qoladi
- (belgisiz) — hali tasdiqlanmagan, kalkulyatorda ishlatilmaydi yoki ehtiyotkorlik bilan ishlatiladi
