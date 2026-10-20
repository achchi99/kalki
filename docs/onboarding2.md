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
**«Keyinroq»:** jins tanlangach ko'rinadi; o'rtacha qiymatlar + faollik 2 + «saqlash» bilan me'yor; `prefs.taxminiy = { t, n }` → Bugun va Profil tepasida karta; yopilsa 7 kundan keyin bir marta (`n`: 0 → 1 → 2), so'ng chiqmaydi.
**Mavjud foydalanuvchi:** onboarding yo'q; `prefs.yemayK`/`prefs.yemay` bo'lmasa — Bugun'da bir martalik «Yemaydigan narsangiz bormi?» kartasi.
**Hisoblagichlar** (`hisob_kun`, faqat son): `onboarding_boshlandi`, `onboarding_tugadi`, `onboarding_keyinroq`, `yemaydi_hammasi`, `yemaydi_tanlandi`. Qiymatlar yuborilmaydi. Production'da server ro'yxati (`functions/api/hisob.js`) deploy bilan yangilanadi; D1 sxemasi o'zgarmagan.
**Halollik:** ilova «allergiyadan xavfsiz» deb va'da bermaydi; izoh: «Kafe taomlari tarkibi joyga qarab farq qiladi — allergiyangiz bo'lsa, buyurtmada so'rang.»
