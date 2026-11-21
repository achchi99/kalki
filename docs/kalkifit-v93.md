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

## Topilgan qo'shimcha muammolar (v93 tekshiruvida)
Hisobotda — `docs/kalkifit-v93.md` oxiriga qarang.
