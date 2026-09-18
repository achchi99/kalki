# "Tez orada" kartalari — to'liq audit

**Sana:** 2026-09-18
**Turi:** FAZA 0 — diagnostika. Kod yozilmagan.

---

## 0.1 Barcha "TEZ ORADA" kartalari

Butun sayt (76 sahifa) skanerlandi. Faqat **`hujjatlar.html`da** bor — **7 ta karta**, hammasi bitta commitda (`36fc948`, 2026-08-04) kiritilgan, ya'ni **bugungacha 45 kun** o'zgarishsiz turibdi.

| # | data-doc | Nomi (UZ) | Kategoriya | Ekranda ko'rinadimi? |
|---|---|---|---|---|
| 1 | `mehnat-tatili-arizasi` | Mehnat ta'tili arizasi | Mehnat | ✅ Ha |
| 2 | `shtat-jadvali` | Shtat jadvali | Mehnat | ❌ Yo'q (`soon-hidden`) |
| 3 | `noturar-joy-ijarasi` | Noturar joy ijarasi | Ijara va mulk | ❌ Yo'q (`soon-hidden`) |
| 4 | `yetkazib-berish-shartnomasi` | Yetkazib berish shartnomasi | Biznes | ❌ Yo'q (`soon-hidden`) |
| 5 | `nda-maxfiylik-kelishuvi` | Maxfiylik kelishuvi (NDA) | Biznes | ❌ Yo'q (`soon-hidden`) |
| 6 | `hamkorlik-bayonnomasi` | Hamkorlik bayonnomasi | Biznes | ❌ Yo'q (`soon-hidden`) |
| 7 | `hisob-faktura` | Hisob-faktura | Biznes | ✅ Ha |

**Muhim topilma:** 7 tadan faqat **2 tasi** (`mehnat-tatili-arizasi`, `hisob-faktura`) real foydalanuvchiga ko'rinadi — bular aynan foydalanuvchi yuborgan skrinshotlar. Qolgan **5 tasi** `soon-hidden` klassi bilan `display:none` qilib bekitilgan va qidiruv/filtr orqali ham hech qachon ko'rsatilmaydi (`filter()` funksiyasi ularni ataylab o'tkazib yuboradi). Ya'ni bu 5 ta va'da hech kimga ko'rinmaydi — DOM'da yotgan, lekin foydalanuvchiga ta'sir qilmaydigan holat. Ular uchun "va'da buzilgan" degan bosim yo'q, lekin ular ham kod bazasida tugallanmagan holda turibdi.

---

## 0.2 "Menga shu kerak" tugmasi — real sinov

Kod: `hujjatlar.html`, IIFE oxirida (`var cards=document.querySelectorAll(".doc-card.is-soon[data-doc]")`).

**Real brauzerda (Playwright/Chromium) tekshirildi:**

1. `mehnat-tatili-arizasi` kartasidagi "Menga shu kerak" tugmasi bosildi.
2. `window.dataLayer`da darhol paydo bo'ldi:
   ```
   ["event","doc_request",{"doc":"mehnat-tatili-arizasi"}]
   ```
3. `localStorage.kalki_doc_req` = `{"mehnat-tatili-arizasi":1}` — to'g'ri yozildi.
4. Tugma holati to'g'ri o'zgardi: `disabled:true`, matn "Qabul qilindi".

**✅ Ishlaydi** — xuddi hamkor tracking auditida (o'tgan hafta) tasdiqlangan boshqa `gtag()` hodisalari kabi, `doc_request` voqeasi kodning o'zida to'g'ri ishlab chiqarilishi tasdiqlandi. Bu — bizning kod javobgar bo'lgan chegara; GA4'ning o'z serveriga yetkazilishi haqida o'sha auditda ham aytilganidek, bu Google SDK'sining o'z ishi va alohida GA4 kabinetisiz to'liq tasdiqlab bo'lmaydi.

**Hozirgacha nechta bosilgan?** — **Bilib bo'lmadi.** Bu loyihadan kalki.uz'ning haqiqiy GA4 hisobiga kirish yo'q (xuddi o'tgan hamkor-tracking auditida aytilganidek). `doc_request` voqeasi GA4'ning standart "Events" jadvalida `doc` parametri bilan qanchalik aniq ko'rinishi — Custom Dimension ro'yxatdan o'tganiga bog'liq, bu ham tasdiqlanmagan.

---

## 0.3 Dublikat tekshiruvi

### "Mehnat ta'tili arizasi" vs `tatil-arizasi-namunasi.html`

**Natija: deyarli to'liq dublikat — asosiy holat uchun.**

Mavjud `tatil-arizasi-namunasi.html`ning o'zi shakllantiradigan matnni tekshirdim:

> "Menga «13» sentabr 2026 yildan boshlab 15 kalendar kuni davomida **navbatdagi yillik mehnat ta'tilini** berishingizni so'rayman, tasdiqlangan ta'til jadvaliga muvofiq."

Bu — aynan "Mehnat ta'tili arizasi" (yillik mehnat ta'tili) hujjatining o'zi. Forma maydonlari: kimga, kimdan (F.I.Sh., lavozim, bo'lim), boshlanish sanasi, davomiyligi, "Sana turi" (jadvalga muvofiq / jadvaldan tashqari-kelishuv), ta'til pulini oldindan so'rash, erkin qo'shimcha matn. UZ+RU, `RU_PAGES`da, Word/PDF eksport bilan — hammasi ishlaydi.

**Farq bor joyi:** "TEZ ORADA" kartaning tavsifi — "**Yillik yoki qo'shimcha** ta'til so'rovi" — ikkala turni va'da qiladi. Mavjud sahifa esa matnida qat'iy "**yillik** mehnat ta'tili" deb yozadi va alohida "qo'shimcha ta'til" (masalan og'ir/zararli mehnat sharoiti uchun qo'shimcha ta'til, Mehnat kodeksi bo'yicha) rejimi yo'q — foydalanuvchi "erkin qo'shimcha matn" maydoniga o'zi yozib qo'yishi mumkin, lekin tayyor shablon matni buni hisobga olmaydi.

**Tavsiya:** karta mavjud sahifaga bog'lansin, "TEZ ORADA" belgisi olib tashlansin (kichik, tez ish — real foydalanuvchi ehtiyojining katta qismi — yillik ta'til — bugunoq qondiriladi). "Qo'shimcha ta'til" rejimi alohida, kichik kengaytirish sifatida keyinroq qo'shilishi mumkin (FAZA 1 doirasiga kiritish shart emas).

### "Hisob-faktura" vs `shablon-hisob-faktura.xlsx`

**Natija: dublikat EMAS — boshqa format.**

`shablonlar.html`da allaqachon bor:
> "Hisob-faktura (invoys) — Summa, QQS va jami avtomatik. Summa so'z bilan ham yoziladi." — statik `.xlsx` fayl (UZ+RU), yuklab olib Excel'da to'ldiriladi, `qqs-kalkulyator`ga bog'langan.

Bu — **statik shablon** (formulali Excel fayl), `hujjatlar.html`dagi boshqa faol kartalar kabi **interaktiv veb-generator** (forma + jonli ko'rinish + bir tugmada Word/PDF) EMAS. "TEZ ORADA" kartasi aynan shu interaktiv formatni va'da qiladi (`hujjatlar.html`ning o'zi shunday pozitsiyalangan: "Kalkulyator natijasi... generator forma + jonli preview").

**Tavsiya:** bu — haqiqiy bo'shliq, yangi generator qurish kerak bo'ladi (mavjud Excel shabloni ALMASHTIRILMAYDI, ikkalasi baravar turishi mumkin — biri "Excel bilan o'zim to'ldiraman" degan, ikkinchisi "veb-formada to'ldirib olaman" degan foydalanuvchiga). Qurishdan oldin **rasmiy format talablari** (QQS to'lovchi/to'lovchi emas farqi, majburiy rekvizitlar) tekshirilishi kerak — bu FAZA 0'da bajarilmadi (huquqiy tadqiqot, diagnostika doirasidan tashqarida), **FAZA 1 boshida birinchi qadam bo'lishi kerak**.

### Qolgan 5 ta karta — tezkor tekshiruv

| Karta | Tekshirilgan o'xshash sahifa | Xulosa |
|---|---|---|
| `shtat-jadvali` | — (hech narsa topilmadi) | Dublikat emas, genuinely yangi |
| `noturar-joy-ijarasi` | `ijara-shartnomasi-namunasi.html` | Bu — aniq **"TURAR JOY IJARASI SHARTNOMASI"** (turar joy uchun). Noturar (tijorat: ofis/do'kon/ombor) uchun boshqa huquqiy tartib — dublikat emas |
| `yetkazib-berish-shartnomasi` | `xizmat-korsatish-shartnomasi-namunasi.html` | Xizmat ko'rsatish ≠ tovar yetkazib berish (boshqa shartnoma turi, Fuqarolik kodeksining boshqa bobi) — dublikat emas |
| `nda-maxfiylik-kelishuvi` | — | Saytda maxfiylik kelishuvi (NDA) shakli umuman yo'q — dublikat emas |
| `hamkorlik-bayonnomasi` | — | Saytda shunga o'xshash bayonnoma yo'q — dublikat emas |

---

## 1. Yakuniy jadval va tavsiya

| Nomi | Sahifa | Necha kundan beri | Dublikat holati | Tavsiya |
|---|---|---:|---|---|
| Mehnat ta'tili arizasi | `hujjatlar.html` | 45 | Deyarli to'liq (asosiy holat) | **Bog'lash** — `tatil-arizasi-namunasi`ga, belgi olib tashlansin |
| Hisob-faktura | `hujjatlar.html` | 45 | Yo'q (format farqli) | **Yakunlash** — yangi generator, avval rasmiy talablar tekshirilsin |
| Shtat jadvali | `hujjatlar.html` (yashirin) | 45 | Yo'q | Yakunlash yoki olib tashlash — foydalanuvchiga hozircha ko'rinmaydi, shoshilinch emas |
| Noturar joy ijarasi | `hujjatlar.html` (yashirin) | 45 | Yo'q | Yakunlash yoki olib tashlash — shoshilinch emas |
| Yetkazib berish shartnomasi | `hujjatlar.html` (yashirin) | 45 | Yo'q | Yakunlash yoki olib tashlash — shoshilinch emas |
| Maxfiylik kelishuvi (NDA) | `hujjatlar.html` (yashirin) | 45 | Yo'q | Yakunlash yoki olib tashlash — shoshilinch emas |
| Hamkorlik bayonnomasi | `hujjatlar.html` (yashirin) | 45 | Yo'q | Yakunlash yoki olib tashlash — shoshilinch emas |

**Ustuvorlik mantig'i:** faqat 2 ta karta real foydalanuvchiga ko'rinadi va ularga "Menga shu kerak" bosilishi mumkin — shu ikkitasi eng yuqori ustuvorlikda: biri BUGUNOQ bog'lash bilan hal qilinadi (kichik ish), ikkinchisi haqiqiy yangi qurilish talab qiladi (o'rta-katta ish, avval huquqiy/format tekshiruvi kerak). Qolgan 5 tasi hech kimga ko'rinmagani uchun "va'da buzilishi" xavfi yo'q — ularni FAZA 1'dan keyin, alohida navbatda hal qilish mumkin (yakunlash yoki butunlay olib tashlash — bu ham qaror talab qiladigan savol: nega ular boshidanoq yashiringan edi, aniq emas).

**Bonus topilma (so'ralmagan, lekin tegishli):** `shablonlar.html`da ham bitta "Tez kunda" belgili karta bor — "Biznes-reja shabloni" (statik ro'yxat, `SOON` massivida bitta yozuv). Farqi: bu yerda "Menga shu kerak" tugmasi, GA hodisasi yoki so'rov mexanizmi umuman yo'q — sof dekorativ karta. Foydalanuvchi so'ramagani uchun bu FAZA 1 doirasiga kiritilmadi, lekin bir xil "bajarilmagan va'da" turkumiga kiradi.

---

## 2. FAZA 1 uchun ochiq savollar (audit tasdiqlangach hal qilinadi)

1. `mehnat-tatili-arizasi` → bog'lashga roziman deb tasdiqlaysizmi, yoki "qo'shimcha ta'til" rejimini ham hoziroq qo'shaylikmi?
2. `hisob-faktura` — yangi generator qurishni boshlaymizmi? Agar ha, rasmiy rekvizit talablarini qayerdan tasdiqlaymiz (soliq.uz, buxgalteriya normativi)?
3. Qolgan 5 ta yashirin karta — FAZA 1'da ularga tegilmaydi (audit shunday tavsiya qiladi), lekin agar xohlasangiz ulardan birortasini ham shu safar navbatga qo'shishimiz mumkin.
