# KalkiFit — Android'da avtomatik qadam

- **Faqat Android ilovasi** (1.0.1+): ilovadagi `Qadam` plagini (kalkifit-android: `android/app/src/main/java/uz/kalki/fit/qadam/`, README «Qadam»).
  Sayt: `assets/app-native.js` → `KalkiNative.qadam` (`ok/status/perm/enable/today/days`); veb va iPhone'da `ok()` = false — karta avvalgidek.
- **Ruxsat:** birinchi marta qadam kartasi bosilganda (onboarding'da emas) oyna: «Qadamlaringizni avtomatik sanaymizmi? Telefon o'zi sanaydi, joylashuvingiz olinmaydi.» [Ruxsat berish] [Keyinroq].
  `prefs.qa`: yo'q → so'raladi; `on`; `off` (rad etildi yoki o'chirildi); `later` — qayta so'ralmaydi. Profil → «Mening ma'lumotlarim» → «Qadamni avtomatik sanash» (yoqish/o'chirish). Sensor yo'q telefonda hech narsa ko'rinmaydi.
- **Ma'lumot:** `day.sa` — avtomatik qism, `day.steps = sa + qo'lda qo'shilgan` (`kalkifit-core.js`: `setAutoSteps`, `setManualSteps`, `manualSteps`).
  Maqsad, kaloriya, tarix, ulashish — `day.steps` bilan (o'zgarmagan). Avtomatik yangilanganda qo'lda qo'shilgani saqlanadi; uni «0» kiritib yoki «Qo'shilganini tozalash» bilan nolga tushirish mumkin (avtomatik qism o'zgarmaydi). Oxirgi 7 kun yangilanadi (ilova ochilganda, qaytganda, ekran ochiq bo'lsa har daqiqada).
- **Kun chegarasi taxminiy bo'lishi mumkin:** telefon fon ishini to'xtatsa, o'qishlar orasidagi qadamlar kunlarga vaqt ulushi bilan bo'linadi (jami to'g'ri). Batafsil — kalkifit-android README.
- **Test:** `tools/dizayn/test-qadam-auto.mjs` (plagin soxta), `test-kalkifit-core.mjs` #55; Kotlin: `./gradlew :app:testDebugUnitTest`.
- **Sinov APK:** `/ilova/sinov/` (preview). `main`'ga qo'shishda: `kalkifit-1.0.1.apk` → `/ilova/`, `versiya.json` 1.0.1, `/ilova/sinov/` olib tashlanadi.
