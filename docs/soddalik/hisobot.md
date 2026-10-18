# KalkiFit soddalashtirish — hisobot (branch `soddalik`, main'ga chiqarilmagan)

Asosiy yo'l: **QIDIR → PORSIYA → QO'SH**. Yangi funksiya yo'q, hech narsa o'chirilmadi, ma'lumot formati o'zgarmadi.

Oldin/keyin (360 px): `oldin-keyin-light.png`, `oldin-keyin-dark.png` (yuqori qator — oldin, pastki — keyin).

## Qabul mezoni (avtomatik: `tools/dizayn/test-kalkifit-soddalik.mjs`)
- Yangi foydalanuvchi «tushlikka 1 kosa chuchvara»: Bugun → `+ Ovqat qo'shish` → natija → «Tushlik» → «Qo'shish» = **4 bosish** (bo'limdagi «+» orqali **3**).
- Tajribali foydalanuvchi oxirgi yegan taomi: `+ Ovqat qo'shish` → Oxirgilar `[+]` = **2 bosish**.

## Eski funksiya → hozirgi joyi
| Eski funksiya | Hozir qayerda |
|---|---|
| Katta halqa, «Yana yeyish mumkin» | Bugun: «Yedingiz · Maqsad · Qoldi» + ingichka chiziq; ustiga bosilsa hisob tushuntirishi (ⓘ) |
| «Bu raqam qanday hisoblanadi» | Bugun → raqamlar qatoriga bosish |
| Ovqat qo'shish (+) | Bugun → katta «+ Ovqat qo'shish»; pastki o'rta «Qo'shish» → Ovqat; bo'limdagi «+» |
| Matn bilan qo'shish | Alohida tugma yo'q: qidiruvga jumla yoziladi → «✨ AI bilan aniqlash: «…»» qatori |
| Rasm bilan qo'shish | Qidiruv yonidagi 📷 |
| Oxirgi/mashhur taomlar | Qo'shish oynasi → Oxirgilar (oxirgi porsiya bilan, `[+]` = 1 bosish) |
| Kechagidek, Odatdagi ovqatlarim, sevimlilar | Qo'shish oynasi → Saqlanganlar; boshqarish: Profil → Odatdagi ovqatlarim |
| O'z taomim, Retsept, Bazaga taklif, Kategoriyalar | Qo'shish oynasi → Boshqa usullar ▾ (topilmasa: «O'z taomim sifatida» ham chiqadi) |
| «Buni yesam-chi?» | Qo'shish oynasi → Boshqa usullar ▾ |
| Mening retseptlarim (ro'yxat/tahrir) | Profil → Mening taomlarim |
| Porsiya: xamir/ichi/o'lcham/tarkibi, ½·1·1½·2, taomni almashtirish | Porsiya oynasi → «Turi va hajmini aniqlashtirish ▾» |
| Birlik (dona/kosa/gramm), Mening idishim | Porsiya oynasi (birlik qatori) |
| kkal/100 g, «odatiy tanlov», manba | Porsiya oynasi → ⓘ Manba |
| Ovqat bo'limlari, tahrir, ☆ Saqlash, Kechagidek | Bugun va Kundalik (bo'lim sarlavhasi/qatori) |
| Kunni yakunlash | Bugun: ovqatlar ro'yxati oxirida kichik matnli tugma |
| Kun holati yorlig'i («To'liq», «Qisman»…) | Kundalik; Bugun'da — kichik izoh «Kiritilgan ovqatlar bo'yicha» |
| Oylik taqvim, seriya | Kundalik (sana tanlash, kun tahriri); qoidalar izohi — taqvimdagi ⓘ |
| Suv (stakanlar, +) | Bugun: kichik «Suv» kartasi `[+250]`, bosilsa stakanlar; «Qo'shish» → Suv |
| Qadam (kiritish, hisob) | Bugun: kichik «Qadam» kartasi `[Kiritish]`; «Qo'shish» → Qadam; tarix — Natijalar |
| Qadam tarixi, oy, maqsad, «qayerdan olish» | Natijalar |
| Vazn (yozish, grafik, trend) | Natijalar; «Qo'shish» → Vazn |
| Hafta xulosasi (dushanba kartasi) | Natijalar → «Hafta xulosasi» (har kuni, to'liq kunlar bo'yicha) |
| Ulashish kartasi | Natijalar |
| Profil tahriri, me'yor | Profil (yuqori karta) |
| Mening idishlarim | Profil |
| Vitaminlar va qo'shimchalar | Profil |
| Zaxira (Telegram/bulut/JSON), eksport/import/o'chirish | Profil → Zaxira va ma'lumot |
| Til, shrift | Profil (UZ · ЎЗ · RU) |
| **Mavzu (yangi tanlov)** | Profil → Mavzu: Avto / Och / Qorong'i |
| Hazil yoqish/o'chirish, shahar | Profil → Hazillar; hazil kartasi Bugun'da yo'q — ovqat/suv qo'shilgach bir qatorli gap, kuniga ≤2 |
| «🎉 Yangilandi» katta oyna | Bir qatorli tepa banner «Yangi: … [Ko'rish] ✕»; ro'yxat — Profil → Yangiliklar (aniq nomli [Ko'rsat] tugmalari) |
| Yo'l-yo'riq | Profil → Yo'l-yo'riq |
| Eski manzillar | `#ovqat`/`#food` → Kundalik, `#qadam`/`#steps` → Natijalar, `#men`/`#me` → Profil, `#bugun`, `#qoshish` → qo'shish oynasi |

## Vizual tizim
- Dizayn tokenlari bitta joyda (`assets/css/kalkifit.css`, «dizayn tokenlari» bo'limi): fon/karta/matn/chiziq/yumshoq fon/accent/xavf; och va qorong'i.
- Mavzu: Avto (tizim) / Och / Qorong'i (`html[data-theme]`, Profil → Mavzu, saqlanadi).
- To'ldirilgan (accent) tugma — faqat asosiy amal (ekranda ≤1; test tekshiradi); yordamchi — kulrang yoki matn; belgilangan chip — och accent fon + ramka.
- WCAG AA: axe `color-contrast` 4 ekran + qo'shish/porsiya/+ oynalari × 4 holat (Avto-och, Avto-qorong'i, Och, Qorong'i) — 0 xato.

## Testlar
`npm run test:tez` (umumiy fayl o'zgargani uchun to'liq to'plam, 42,9 daqiqa): hamma o'tdi, 4 ta test uchun tuzatish va `--only` bilan qayta yurgizish (qadam, rozgor, kalkifit-idish, migrate) — o'tdi. Yangi test: `kalkifit-soddalik`. Moslashtirilgan: kalkifit, qidiruv, porsiya, odatdagi, baza, idish, yangilik, zaxira, install, ilovalar-ui, migrate.
