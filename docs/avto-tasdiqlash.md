# Avtomobil rasmiylashtirish kalkulyatori — Asror tasdiqlashi kerak bo'lgan savollar

**1- va 4-savolni bitta real YHXX invoysi (ishlatilgan avto, qatorma-qator) hal qiladi;
5, 7, 8-savollarni e-notarius KALKULYATORI (xizmat tavsifi emas) natijalari hal qiladi.**

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

**Hali ochiq qoladigan savollar (o'zgarishsiz yoki aniqlashtirilgan):** 1, 2, 3, 5 (kichik
qismi), 9, 10, 11, 12, 13, 14, 15 — quyidagi jadvalda batafsil. Muhimi: raqam
almashtirish/yo'qolgan/tranzit/saqlash stavkalari (13-savol) hamon ZIDDIYAT holatida —
shuning uchun "Faqat raqam" stsenariysi 2-fazada ham qurilmadi.

| # | Savol | Hozirgi holat | Qanday tekshiriladi | Javob |
|---|---|---|---|---|
| 1 | Egasi almashganda 6,84 BHM qo'llanishi | ◐ Normativ asos (683-son 12 "v" va 50-band; 2303-son 7¹/7²-band) va huquqshunos X. Xudoyberdiyevning mustaqil izohi bir xil xulosada. Ishlab chiqishni TO'XTATMAYDI — `qoida_egasi_almashganda` holati `NORMATIV_TALQIN`, sahifada "talqin" belgisi bilan | Real YHXX invoysi yoki my.gov'dagi ishlatilgan avto xizmati sahifasi | — |
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
| 13 | Raqam almashtirish/yo'qolgan/tranzit/saqlash stavkalari | my.gov'dagi tegishli xizmatlar sahifalaridagi amaldagi stavkalar kerak (2-faza uchun) | my.gov.uz tegishli xizmat sahifalari | — |
| 14 | Texpasport dublikati stavkasi | Amaldagi stavka hali topilmadi | my.gov.uz | — |
| 15 | Naqd to'lov chegarasi (PF-246, 2-band "d", PF-175 tahriri 27.08.2026) 400 BHM avto oldi-sotdisiga qo'llanadimi | Noaniq — javob kelguncha sahifa 10 yildan eski avtolar uchun naqd/naqdsiz haqida da'vo qilmaydi | lex.uz'da PF-175/PF-246 to'liq matni | — |

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
