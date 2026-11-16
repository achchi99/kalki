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

## v84 — «Soatdan qadam olish» (Health Connect birlamchi; APK 1.0.12 kodi, yig'ish — egasi)

- **Tashxis (kod o'zgarmasdan oldin):** Health Connect o'qish 1.0.2 dan beri bor. `HcManba.kunlar()` — `aggregateGroupByPeriod(StepsRecord.COUNT_TOTAL)` (yozuvlar qo'lda qo'shilmaydi; telefon va soat takrorini Health Connect o'zi ustuvorlik bo'yicha olib tashlaydi). `QadamOmbor.natija()` har kun uchun `max(sensor, Health Connect)` oladi (ikki marta qo'shilmaydi). Ruxsat: faqat `READ_STEPS` (+ ixtiyoriy `READ_TOTAL_/ACTIVE_CALORIES_BURNED`), yozish yo'q.
  Demak «5 000 / 10 000» farqining sabablari kod emas, ma'lumot yo'lida: (1) soat ilovasi Health Connect'ga yozmayapti (Honor Health'da sinxronlash alohida yoqiladi; Huawei Health umuman yozmasligi mumkin); (2) soat ilovasi qo'lda sinxronlanadi (batareyani tejash); (3) Health Connect ustuvorligi: aggregate bir vaqt oralig'ida faqat eng yuqori ustuvorli ilovani oladi — telefon ilovasi soatdan yuqori tursa, soat qadamlari yo'qoladi (Health Connect → Ma'lumot manbalari va ustuvorlik).
- **Nima qo'shildi (kod):** Profil → «Soatdan qadam olish» (faqat ilovada) → oyna: holat (ulangan / ruxsat yo'q / o'rnatilmagan / bu telefonda yo'q / bugun bo'sh), qadam yozayotgan ilovalar (`hcManbalar`, 1.0.12 dan; eski APK'da ro'yxat bo'sh), «Bugun: Health Connect N · telefon M», telefon ≥1,3× ko'p bo'lsa sabab maslahati, ko'rsatma (Honor Health: Sozlamalar → Health Connect, Huawei izohi, ustuvorlik), tugmalar (ulash / o'rnatish / ochish). Qadam kartasida manba: «Manba: soat (Health Connect)» / «Manba: telefon» / «Qo'lda».
- **Qoida o'zgarmadi:** har kun `max(telefon, Health Connect)` (Health Connect soat sinxronlanmaguncha past tursa, jim kamaytirmaslik uchun); qo'lda kiritilgani `day.steps − day.sa` alohida saqlanadi va avtomatik qiymat bilan almashtirilmaydi; `sa` kamaymaydi.
- **Masofa (`READ_DISTANCE`) o'qilmaydi** — kilometr qadamdan hisoblanadi; yangi ruxsat qo'shilmadi, shuning uchun Play deklaratsiyasi o'zgarmaydi.
- **Test:** `tools/dizayn/test-qadam-soat.mjs` (10 guruh, plagin mock); eski testlarda manba yozuvi yangilandi.

### Play Console (Health Connect) — to'ldiriladigan joylar
Manifest'dagi sog'liq ruxsatlari: `READ_STEPS`, `READ_TOTAL_CALORIES_BURNED`, `READ_ACTIVE_CALORIES_BURNED` (yozish ruxsati yo'q); qo'shimcha: `ACTIVITY_RECOGNITION` (telefon sensori). Maxfiylik ekrani: `HcRationaleActivity` (`androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE`) va `ViewPermissionUsageActivity` alias (`VIEW_PERMISSION_USAGE` + `HEALTH_PERMISSIONS`) — ikkalasi `/maxfiylik#qadam` ni ochadi.
1. **App content → Health apps / Health Connect deklaratsiyasi:** har ruxsat uchun foydalanish sababi: qadam — «kunlik qadam, kaloriya va maqsad hisobi»; jami/faol kaloriya — «soat sarfini kunlik me'yor bilan solishtirish (ixtiyoriy)». Yozish ruxsati so'ralmaydi — shuni yozing.
2. **Privacy policy URL:** `https://kalki.uz/maxfiylik` (7-bo'lim «Qadamlar», `#qadam`) — Health Connect ma'lumoti qanday ishlatilishi, serverga yuborilmasligi, reklamaga/uchinchi shaxsga berilmasligi yozilgan (bu yangilanishda qaysi ilova yozganini ko'rsatish haqida jumla qo'shildi).
3. **Data safety:** Health and fitness → Health info / Fitness info (qadam, kaloriya): qurilmada qayta ishlanadi; faqat foydalanuvchi bulutga saqlashni yoqsa shifrlangan zaxira tarkibida ketadi (ixtiyoriy) — shuni belgilang; reklama/sotish yo'q.
4. Play ba'zan Health Connect ruxsati uchun foydalanish videosi/skrinshotini so'raydi — oyna: Profil → «Soatdan qadam olish» → «Health Connect'ni ulash».
(Forma maydonlari Play tomonidan o'zgarib turadi — Console'dagi joriy savollar bo'yicha tekshiring.)
