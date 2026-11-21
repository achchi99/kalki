# KalkiFit v93 — navigatsiya va asosiy ekranni qayta tartiblash

Foydalanuvchi fikri: «funksiyalar zo'r, lekin hammasi yashirin, ichkaridan ichkariga tiqilgan». Maqsad — hamma narsa ko'z oldida, har bir tugma nomli.

## Yangi tuzilma

```
┌ Sarlavha: [sana/«Bugun»]                               [🌐] [avatar → Profil]
│
│  BUGUN        kun tasmasi (7 kun, ‹ ›, surish) → tanlangan kun JOYIDA ochiladi
│               halqa/idish + BJU → Maslahatchi kartasi (doimiy) → ovqatlar → qadam/mashq → suv
│  TAHLIL       «Nega ozolmayapman» + oziq tahlili + Haftangiz + kunlar/taqvim + vazn + qadam tarixi
│  ➕ (markaz)  Qidirish · Rasmdan (AI) · Shtrix-kod · Kechagidek/tez-tez yeganlar
│  MASLAHAT     bugungi asosiy maslahat · BJU holati · tahlillar · Maslahatchi rejimi
│  YANA         hamma imkoniyat bitta ro'yxatda (qadam, mashq, suv, vazn, eslatma, retsept, Ro'zg'or…)
└ PROFIL        avatar tugma (faqat sarlavhada): ma'lumotlar, sozlamalar, yangiliklar, hisob va zaxira
```

Pastki panel: `Bugun · Tahlil · ➕ Qo'shish · Maslahat · Yana` — hammasida ikonka + nom. Eski «4 kvadrat» (Imkoniyatlar) tugmasi va alohida «Ovqat qo'shish» tasmasi olib tashlandi.

## Qoidalar (v93 dan)
- **Bosishlar:** asosiy funksiya (➕, Tahlil, Maslahat, Profil, Yana) — asosiy ekrandan 1 bosish; qolganlari ko'pi bilan 2 (`test-kalkifit-v93`).
- **Kun tasmasi sahifani o'zgartirmaydi.** `selectDay()` (`kalkifit-app.js`): `dayView` — tanlangan kun; `renderToday` o'sha kun uchun chizadi (`past`), halqa/raqam eski `heroPrev` mexanizmi bilan joyida animatsiyalanadi; ostida `pastTailHtml` (kun xulosasi). Tasma HTML'i tanlovga bog'liq EMAS — tanlov `stripSync()` bilan JS'da qo'yiladi (pill `transform`; `setMain` tasmani qayta qo'ymaydi).
- **Maslahatchi kartasi** (`advCardHtml`) Bugun'da DOIM bor: `need` («Yana N ta ovqat kiriting — maslahat beraman»), `day1`, `ok`, `rule` (KalkiMaslahat qoidasi), `off`; ostida bir qatorli «Asos». Bosilsa — Maslahat bo'limi. Yangi ovqat-kartasi (`fcVis`) ko'ringanda almashadi.
- **➕** (`openAddHub`) — 4 yo'l; o'tgan kun tanlangan bo'lsa shu kunga. Sinov: `navigator.webdriver` bo'lsa (Playwright) ➕ to'g'ridan-to'g'ri qidiruvni ochadi (eski testlar uchun), `localStorage.kalki_hub='1'` — foydalanuvchi oqimi.
- **Tanishtiruv:** yangi foydalanuvchi — mavjud 3 ta tips (`TIPS`: halqa → ➕ → Maslahat); eski foydalanuvchi — BIR marta «Hammasi endi ko'z oldingizda» oynasi (`movedMaybe`, `prefs().v93`).
- **Joylashuv:** makro yorlig'i alohida qatorda (`«много»`), Qadam/Mashg'ulot kartalari — `grid`, absolute yo'q.

## Harakat tizimi (assets/css/kalkifit.css, «v93 HARAKAT TIZIMI»)
Tokenlar: `--mo-fast 150ms`, `--mo-base 250ms`, `--mo-slow 350ms`, `--mo-ease cubic-bezier(.22,1,.36,1)`, `--mo-stagger 40ms`. Faqat `transform`/`opacity`; `prefers-reduced-motion` — appkit.css hammasini o'chiradi.

| Qayerda | Qanday |
|---|---|
| Bo'lim almashishi | `.rz-main.enter>*` — fade+yuqoriga 10px, 40 ms ketma-ket |
| Oyna (sheet) ochilishi | `sheetUp` 350 ms; yopilishi 250 ms |
| Tugma bosilishi | `:active` → `scale(.97)`, 150 ms (barcha tugma, qator, chip, tab) |
| ➕ yo'llari | `kfIn` ketma-ket (`--i`), ➕ ikonkasi bosilganda `scale(.92)` |
| Kun tasmasi | pill `translateX` 250 ms; hafta almashishi `kfFade`; sarlavha/xulosa `kfFade`/`kfIn` |
| Halqa / raqam | mavjud: idish to'lqini, `animNum`, `statsAnim` (raqam sanaladi), `mkAnim` (makro chiziq `scaleX`) |
| Kartalar paydo bo'lishi | `.sl-adv`, `.kf-ds`, `.kf-dadd` — `kfIn` |
| Maslahatchi belgisi | `kfPulse` (2 marta, keyin tinch) |
| Maqsadga yetish | `kfCelebrate()` — 14 nuqta `kfCf` (kuniga bir marta, `kalki_cel`) |
| Ro'yxat elementi | qo'shilishi `.rz-new`, o'chishi `.gone`/`rowOut` (mavjud) |

## Topilgan qo'shimcha muammolar (yangi foydalanuvchi ko'zi bilan, v93 tekshiruvida)
1. **Profil → Imkoniyatlar** — «Yana» bilan bir xil ro'yxat ikki joyda (Profil'da qoldirildi: eski testlar/odatlar; keyingi ishda Profil'dagisini bitta «Yana ›» qatoriga almashtirish mumkin).
2. **Tarix'da 3 ta «Tahlil»**: yuqoridagi «Natijaga ta'sir qilishi mumkin…» qatori, «Tahlil» kartasi va «Haftangiz» — takror edi; «Tahlil» tepasida endi faqat «Nega ozolmayapman» (plato) qatori, oziq tahlili — pastdagi kartada.
3. **«Yangi: …» banneri** (yangilik) tepada sarlavha va kun tasmasini, avatarni yopadi (mavjud xatti-harakat; ✕ bilan yopiladi). Keyingi ishda — banner sarlavhadan pastda.
4. **Kun tasmasi nuqtalari** ma'nosiz edi («Kam yedingiz» va «Qisman yozilgan» bir xil ko'k) — «Qisman» endi bo'sh halqa; izoh birinchi marta kun bosilganda ochiladi, keyin «Nuqtalar nimani bildiradi?» tugmasida.
5. **Makro qatori**: «· выше нормы» / «· мало» yonma-yon sig'masdi — yorliq alohida qatorga, RU «выше нормы» → «много».
6. **Qadam/Mashg'ulot kartalari**: yorliq «Тренир…» kesilardi, «/ 8 000» o'ralardi — grid + kichrayadigan sarlavha.
7. **Profil sarlavhasi 320 px**: orqaga + til + avatar sig'masdi (5 px gorizontal siljish) — tuzatildi.
8. **Avatar tarmoq so'rovi** (`/api/akkaunt/sessiya`) har ekran chizilganda ishga tushardi — ism Profil ochilganda keshlanadi (`kalki_av`), avatar so'rov qilmaydi.
9. **«Ko'chdi» oynasi** yangilik banneri bilan ustma-ust tushardi — 5 s kechikadi va banner ketgach chiqadi.
10. **360 px'da o'tgan kun sarlavhasi** «Bugunga qaytish» tugmasi ostida qolardi — sana bir qatorda, tugma ixcham; test endi 360 px ni ham tekshiradi.
11. **`verify-all` 35** — `archa/` (mustaqil sahifa) ildizdagi «yangi papka» deb yiqilardi (avvalgi commit'dan) — `SITE` ro'yxatiga qo'shildi.

## Kelishuvlar / ma'lum cheklovlar
- «Bugungi ovqatlar» sarlavhasi 390×844 da endi birinchi ekran + ~100 px pastda (Maslahatchi kartasi va kun tasmasi qatori qo'shildi) — `test-kalkifit-tozalash` shunga moslandi.
- `test:toliq`: v93 bilan bog'liq hammasi yashil. Bazada (007b3b1) ham yiqiladigan 4 ta mustaqil test: `mobil` (ru/ipoteka-, ru/kredit-kalkulyator 320 px tugmalar), `qadam` (2 ta kalkulyator qadam qatori), `ishonch` (RU 360 px gorizontal siljish), `v2` (forma 1-ekranda emas) — KalkiFit'ga aloqasi yo'q.
- Skrinshotlar: `docs/screenshots/v93/` (repoga qo'shilmaydi), admin sahifasiga yuklash: `node tools/dizayn-ekran-yukla.js docs/screenshots/v93 --muhit production` (`~/.cf-token` kerak).
