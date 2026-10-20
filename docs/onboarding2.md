# Onboarding2 — klaviaturasiz birinchi kirish

Hisob formulasi (`S.plan`) va saqlash formati (`profile: { sex, preg, age, height, weight, act, goal, goalWeight }`) O'ZGARMAGAN — faqat kiritish usuli va ekranlar.

**Qadamlar (7 + natija):** 1 jins (+ homiladorlik, «Keyinroq») · 2 yosh · 3 bo'y · 4 vazn · 5 faollik · 6 maqsad · 7 «Yemaydigan narsangiz bormi?» (ixtiyoriy) · natija. Bitta ekran — bitta savol; pastda tugma, «Orqaga», progress nuqtalari.

| Qism | Qayerda |
|---|---|
| Slayder (scroll-snap lineyka, −/+, ushlab turish, qiymatni bosib yozish, aria, haptic) | `assets/num-slider.js`, CSS: `kalkifit.css` oxiri (`.sld*`, `.sl-ob*`) |
| Onboarding oqimi, «Keyinroq», aniqlashtirish (refine), taxminiy karta | `assets/kalkifit-app.js` (`showOnb`, `obLater`, `taxOpen`, `taxCardHtml`) |
| «Yemaydigan» ekrani va mavjud foydalanuvchi kartasi | `assets/kalkifit-yeymiz.js` (`yemayCard`, `chipsHtml`) |
| Test yordamchisi | `tools/dizayn/ob-yordam.mjs`; testlar: `test-onboarding2.mjs` |

**Qoidalar:** bo'y 120–220, vazn 35–200 (0,5 qadam), yosh 14–90; boshlang'ich erkak 175/75/30, ayol 162/62/30. Profil tahririda chegara mavjud qiymatni o'z ichiga oladi (eski qiymat o'zgarib ketmaydi). APK'da (`KalkiNative.isApp`) Capacitor Haptics bo'lsa — yengil haptic, aks holda jim.
**«Keyinroq»:** jins tanlangach asosiy tugma ostida to'liq kenglikdagi ikkinchi darajali tugma («Keyinroq — o'rtacha me'yor bilan boshlash»); o'rtacha qiymatlar + faollik 2 bilan me'yor; `prefs.taxminiy` bor ekan — Bugun'da aylana ostida kichik chip «Taxminiy · Aniqlashtirish ›» (joylashuvni siljitmaydi, ≤40 px) va Profil tepasida ixcham qator; aniqlashtirilgach (refine) yo'qoladi. Bir martalik kartalar (yemaydigan) yo'l-ko'rsatkich bilan bir vaqtda chiqmaydi — keyingi ochilishda.
**Mavjud foydalanuvchi:** onboarding yo'q; `prefs.yemayK`/`prefs.yemay` bo'lmasa — Bugun'da bir martalik «Yemaydigan narsangiz bormi?» kartasi.
**Hisoblagichlar** (`hisob_kun`, faqat son): `onboarding_boshlandi`, `onboarding_tugadi`, `onboarding_keyinroq`, `yemaydi_hammasi`, `yemaydi_tanlandi`. Qiymatlar yuborilmaydi. Production'da server ro'yxati (`functions/api/hisob.js`) deploy bilan yangilanadi; D1 sxemasi o'zgarmagan.
**Halollik:** ilova «allergiyadan xavfsiz» deb va'da bermaydi; izoh: «Kafe taomlari tarkibi joyga qarab farq qiladi — allergiyangiz bo'lsa, buyurtmada so'rang.»

## Yemaydiganlarim — ovqat qo'shish ro'yxatlarida (onboarding2.1)
Yagona qoida (`Y.rinfo`, `kalkifit-yeymiz.js`): **cho'chqa** — hech qayerda (ro'yxat, qidiruv, Oxirgilar; pitsa oilasida cho'chqali variantlar tanlanmaydi, standart «4 pishloq»). **Tanlangan teglar:** guruh/ro'yxatlarda yashiriladi + «N ta taom yashirildi (yemaydiganlaringiz) · Ko'rsatish» (xira); butun guruh cheklangan bo'lsa tabning o'zi yo'q; qidiruvda chiqadi — «Yemaydiganlaringizda» belgisi; porsiya oynasida tepada yumshoq ogohlantirish va «Baribir qo'shish» (bloklamaydi). Cheklovsiz foydalanuvchida hech narsa o'zgarmaydi (cho'chqadan tashqari). Test: `test-yemaydi.mjs`.
