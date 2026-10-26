# v52: AI voronkasi, qidiruv normalizatsiyasi, veb → ilova kartalari, qaytish ko'rsatkichi

## 1. AI natija voronkasi (anonim)
Hodisa `ai_natija`, kalit `<usul>.<bosqich>`. `usul`: `ovoz | rasm | matn | menyu`.

| Bosqich | Qachon |
|---|---|
| `ochildi` | natija ekrani chiqdi (ovoz/matn — `txGo`, rasm — taomlar yuklangach, menyu — `menyu.ok`dan keyin) |
| `tahrir` | kamida bitta qator tahrirlandi («✎», «Bu emasmi?», «Boshqasini qidirish») — seansda bir marta |
| `ochirildi` | kamida bitta qator o'chirildi — seansda bir marta |
| `qoshildi` + `qt10/30/60/180/x` | «Hammasini qo'shish» (yoki shu oynadan porsiya orqali qo'shildi) + ochilgandan necha soniyada |
| `yopildi` + `yt…` | oyna qo'shmasdan yopildi + necha soniyada |
| `bosh` | hech narsa tanilmadi (rasm — bo'sh javob, matn — bo'sh tahlil) |

Admin → «AI tanidi → qo'shildi (voronka)»:
- `foiz = qoshildi / tanidi`;
- `tanidi` — `ai_sorov <usul>.ok`, matnda esa `ochildi`, chunki u lokal tahlil;
- maqsad ≥ 70%.

**O'lchov tuzatilgani:** server ovozida `ovoz.ok` endi faqat transkripsiyada sanaladi. Avval topilmaganlarni AI ajratganda ikkinchi marta sanalardi, shuning uchun eski «ovoz.ok» soni ~2 baravar yuqori ko'rinardi.

### Natija ekranini o'tib ko'rish (iPhone veb / Android, 360/390, 115%) — topilgan to'siqlar
1. **«ikki tilim non» → «Non · obi non 2 dona — 1 752 kkal».** So'ralgan birlik (tilim) standart variantda yo'q edi, shuning uchun 2 ta butun lepyoshka olinardi. Endi o'sha birlikli variant tanlanadi: 2 tilim oq non = 159 kkal (`parseText`).
2. **Ovozdan keyin «Matn bilan qo'shish» sarlavhasi.** Bundan tashqari matn maydoni va ikkinchi to'q sariq «Aniqlash» tugmasi asosiy «Hammasini qo'shish» bilan raqobatlashardi. Endi: «Ovoz bilan qo'shish», «Siz aytdingiz: «…»», kichik «Matnni tuzatish» havolasi. Asosiy tugma bitta.
3. **Rasm natijasi (360×640, 115%) tepasida 3 qator izoh bor edi** (maxfiylik, limit, maslahat), shuning uchun ikkinchi taom «Qo'shish» ostida qolardi. Natija chiqqach maxfiylik va limit qatorlari yashiriladi.
4. «Hammasini qo'shish» hamma holatda ekranda va ustida hech narsa yo'q (360/390 × 115% × iPhone/Android × yorug'/tungi).

## 2. Qidiruv
- **Normalizatsiya** (`S.search`, aniq natija bo'lmasa — v34 tartibi buzilmaydi):
  - `w → sh` («ow», «qowiq»), yolg'iz `c → ch` («coy»);
  - `SPELL` lug'ati: kurasan/kruasan → kruassan, molokoli/malokoli → molochnoye, pecheniya → pechenye, sasiska → sosiska, qaynagan → qaynatilgan.
  - `w`/`c` varianti avval sinaladi, faqat aniq moslik bilan. Inglizcha nomlar (waffle, wings) variantda topilmasa, o'zi qidiriladi.
- **Ko'p taomli qator:**
  - qism boshidagi yolg'iz son ham miqdor hisoblanadi («4 non 2 piyola choy»);
  - yangi birlik so'zlari: `pml` → ml, «qoshiqda», «osh qoshiq»;
  - «kesim/kesma non» — tilim + oq non;
  - oxirida to'liq yozilmagan «… 2 piyola» tashlanadi;
  - «bn» — «bilan».
- **Bazaga qo'shildi:**

  | Taom | Manba | Belgi |
  |---|---|---|
  | kepak non | USDA oq non 85% + bug'doy kepagi 15% | taxminiy |
  | olma sirkasi | USDA 173469 | |
  | Sezar salati | USDA: romaine, tovuq, Caesar sousi, kruton, parmezan | taxminiy |
  | Lotus Biscoff | OFF 5410126006049 | |
  | sutli pechenye («Юбилейное молочное») | OFF 7622210457554 | |
  | Fuse Tea | OFF 8656170005592, 38 kkal/100 ml (yuqoriroq formula) | |

  Fuse Tea yorliqlari mamlakatga qarab 19–38 kkal; 38 ehtiyot uchun olingan.
- **Sinonimlar:** «kesim non», «нарезной» → oq non; «суп из фасоли» → loviya sho'rva; «фри» → kartoshka fri. Uzumga «dona» (5 g, USDA: 10 dona = 49 g) qo'shildi.
- **Regression:** `tools/test-qidiruv-topilmadi.js` — admin ro'yxatidagi 53 so'z. 46 tasi topiladi. 7 tasi `TOPILMAYDI` ro'yxatida, sababi bilan:
  - «g'ilak» — ma'nosi aniqlanmadi;
  - «tovuq file soya»;
  - «суп 5 злаков»;
  - «sariyog'li sut»;
  - перловка'li 3 ta sho'rva.

## 3. Veb → ilova va akkaunt kartalari (Bugun, halqa ostidagi bitta joy)
**Navbat:** … → «veb → ilova» → (eski PWA o'rnatish kartasi — yangisi ko'rilgan bo'lsa chiqmaydi) → «akkaunt» → adaptiv me'yor → …

| Karta | Kimga | Bosilsa |
|---|---|---|
| `ilova` | Android brauzer, 3+ kun ovqat yozilgan, 5+ ovqat | `/ilova?from=kalkifit` (APK) |
| `ekran` | iPhone Safari, xuddi shu shart | 2 qadam + «Ma'lumotlarimni nusxalash» (Safari va bosh ekran xotirasi alohida; ilovada «Ko'chirish» ekrani) |
| `akkaunt` | akkaunt yoqilgan, kirmagan, 5+ kun | akkaunt oynasi (Google) |

- **Saqlanishi:** `prefs.crd[k] = { t, n, ok }`.
- **Takror:** yopilsa 14 kun chiqmaydi, ko'pi bilan 2 marta. `ilova`/`ekran` bosilsa — boshqa chiqmaydi. `akkaunt` bosilsa — 14 kun (kirmasa yana eslatiladi).
- **Hodisa:** `karta <k>.korsatildi | bosildi | yopildi`.

## 4. Admin: qaytish va konversiya
- **«Qaytish (D1/D7/D30) — platforma bo'yicha»** (`retPlat`): davrda yangi qurilma N kundan keyin yana ochdimi; faqat yetilgan kogortalar, qavsda hajm.
- **«Veb → ilova va akkaunt (kunlar)»** (`konvKun`, ≤ 30 kun): veb DAU, kartalar (ko'rsatildi / bosildi), APK yuklandi, yangi Android / iPhone (bosh ekran) qurilmalar, akkaunt ulandi.
- **Muhim:** ilova va bosh ekran — alohida qurilma (alohida `mijoz_id`), shuning uchun bitta odamning o'tishi bevosita ulanmaydi. Konversiya bir kunda «karta bosildi → yangi Android/iPhone qurilma» sifatida o'qiladi.

## Testlar
- `qidiruv-topilmadi` (node);
- `v52-ui` — ovoz/rasm voronkasi, ovoz ekrani, kartalar;
- `stat` — 7-guruh: voronka, qaytish, konversiya;
- `admin-ui` — yangi jadvallar.
