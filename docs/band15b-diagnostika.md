# Band 15b — prerender eskiligi diagnostikasi (FAZA 0)

Sana: 2026-09-21. Kod o'zgartirilmadi — faqat tekshiruv.

## Muhim topilma — 122 faylli holat ushbu ish nusxasida QAYTA TOPILMADI

Diagnostikani boshlashdan oldin joriy holatni tekshirdim:

```
$ npm run check   -> ... OK   15b. diskdagi HTML prerender natijasiga mos
$ node tools/prerender.js --all   -> barcha 150+ fayl "OK", bitta ham "ESKI" yo'q
```

`git stash list`, `git reflog` (oxirgi 20 yozuv) va `git branch -a` — bu
ish nusxasida 122 fayl eskirgan bo'lgan biror holat izi yo'q. Bu
ish nusxasidagi so'nggi bir necha soat davomida (bugungi barcha
FAZA'lar: 0.C, savol-javob rejimi, UX bandlari, joyni bosib tuzatish,
hujjat paketlari) har bir kod o'zgarishidan keyin `npm run ship`
ishlatilgan — shu bois band 15/15b doim yashil bo'lib qoldi.

**Xulosa: tasvirlangan "122 fayl, fon vazifa sifatida ajratilgan"
holati ushbu (mening kirish huquqim bor) ish nusxasida hozir mavjud
emas** va uni qayta hosil qila olmadim. Bu — boshqa parallel
sessiya/ish nusxasida yuz bergan bo'lishi yoki `npm run ship`ning
keyingi bir bosqichida (masalan mening ushbu sessiyamdagi keyingi
ship yugurishlaridan birida, ataylab emas, tasodifan) allaqachon hal
bo'lgan bo'lishi mumkin — buni tasdiqlovchi/rad etuvchi dalil yo'q.

## 0.C — Parallelizatsiya bilan bog'liqlik (mavjud dalillar asosida)

`tools/chunked.js` va `docs/tools.md`dagi hujjatlashtirilgan tarix:

- **2026-09**: parallel prerender paytida haqiqiy race topilgan —
  bir nechta mustaqil skript (`bc-ld`, `faq-ld`, `app-ld`, ba'zi
  maqola-sahifalarda `art-ld`) bir xil `setTimeout` kechikishida
  `head.appendChild()` orqali raqobatlashib, ikkita mustaqil render
  orasida `<head>` skript **tartibi** (mazmuni emas) farq qilardi.
- **69 sahifada** shu naqsh topilib, **allaqachon tuzatilgan**:
  `insertBefore` + saqlangan pozitsiya (4 bosqichli commit: 16+16+16
  sahifa, keyin 15+6 ta "o'tkazib yuborilgan" sahifa — jami 69).
- Tuzatishdan keyin **3 marta butun sayt bo'yicha** (77 sahifa × 3
  tur) parallel-barqarorlik testidan o'tkazilgan, **0 ta beqarorlik**
  qayd etilgan (`tools/chunked.js` boshidagi izoh).

**Xulosa:** parallelizatsiyaga bog'liq HAQIQIY sinf (script-tartib
race) allaqachon tuzatilgan va stress-testdan o'tgan — bu, agar 122
faylli holat rost bo'lsa, uning sababi **bo'lishi ehtimoli past**
(chunki aynan shu sinf muammo maxsus qidirilib, tuzatilgan va qayta
tekshirilgan). Lekin buni **100% rad etib bo'lmaydi** — men faylning
o'zini ko'rmaganim uchun.

## Tarixiy naqsh — ikki sinf, misollar bilan

Ushbu loyihada band 15b avval necha marta muvaffaqiyatsiz bo'lgan,
ikkala sinfga ham aniq misol bor:

1. **Sana-drift (zararsiz, kutilgan)** — repo tarixida ko'plab
   `chore: npm run ship — sana-drift (...)` commitlari bor (masalan
   `cfc4043`, `1c1a50c`, `033e466`). Sabab — `pdfdate`, "Yangilangan"
   kabi joriy sanaga bog'liq maydonlar, oxirgi ship'dan beri kun
   o'tgani sababli farq qiladi. Oddiy `npm run ship` bilan hal
   bo'ladi, mazmuniy xavf yo'q.

2. **Haqiqiy bug (kamdan-kam, lekin bo'lgan)** — `21dadb6` misoli:
   `oila-byudjet-kalkulyator.html`dagi `animateHero()` funksiyasi RU
   render paytida ikkinchi marta chaqirilib, `requestAnimationFrame`
   orqali 650ms animatsiya boshlagan, lekin eski kod faqat 350ms
   kutgan — natija animatsiya O'RTASIDA "muzlatilgan", har safar
   boshqacha sonni ushlab qolgan. Bu — **vaqtga bog'liq JS mexanizmi**
   sabab bo'lgan haqiqiy nomuvofiqlik, oddiy ship bilan hal bo'lmaydi,
   kutish vaqtini yoki animatsiya mantig'ini tuzatish kerak bo'lgan.

## Tavsiya

Joriy holatda (band 15/15b 100% yashil, 0 ta ESKI fayl) qo'shimcha
tuzatish kerak emas — FAZA 1 shart emas.

Agar 122 faylli holat boshqa sessiya/ish nusxasida hali ham mavjud
bo'lsa, quyidagilar tavsiya etiladi:

1. O'sha muhitda `node tools/prerender.js --all` (yozmasdan) ishga
   tushirilib, aniq "ESKI ..." ro'yxati olinsin.
2. Ro'yxatdagi 10-15 ta fayl **shu diagnostika naqshida** (haqiqiy
   render bilan diskni solishtirib) qo'lda tekshirilsin — agar farq
   faqat sana/vaqt maydonlarida bo'lsa, oddiy `npm run ship` yetarli;
   agar boshqa turdagi farq (tuzilma, tartib, mazmun) topilsa, aynan
   o'sha sahifaning o'ziga xos sababi (21dadb6 kabi) qidirilishi
   kerak — umumiy "ship qayta yugurtirish" bilan yashirilmasin.
3. Menga aniq fayl nomlari yoki `npm run check` to'liq chiqishi
   berilsa, tahlilni davom ettiraman.
