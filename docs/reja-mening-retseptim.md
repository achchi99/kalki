# "Mening retseptim" — reja (kod yo'q)

> Bu hujjat — mavjud `kaloriya-kalkulyator.html` bazasini tekshirish va
> yangi oqim taklifi. Kod yozilmagan. Qaror Asrorda: kaloriya sahifasiga
> qaytish GA'da ko'ringandan keyin (foydalanuvchilar kunlik ro'yxatga
> qaytib kirayaptimi, shuni ko'rsatadigan signal).

## 1. Taklif qilingan oqim

1. **Taom tanlash** — foydalanuvchi retsept nomini kiritadi (masalan
   "Uy oshi").
2. **Masalliqlar va miqdor** — bazadan masalliq tanlanadi (masalan
   "Guruch, xom"), miqdori kiritiladi (gramm). Bir nechta masalliq
   qo'shiladi.
3. **Tayyor taom vazni YOKI porsiyalar soni** — ikkalasidan biri
   kiritiladi (ikkalasi emas — pastga qarang, 2-band).
4. **Jami / 100 g / mening porsiyam** — uchta raqam ko'rsatiladi:
   - Jami kaloriya (barcha masalliqlar xom holatdagi kaloriyasi
     yig'indisi — pishirish energiya qo'shmaydi/olib tashlamaydi,
     faqat suv bug'lanishi vaznni o'zgartiradi, kaloriyani emas).
   - 100 g tayyor taomga to'g'ri keladigan kaloriya (jami ÷ tayyor
     vazn × 100) — FAQAT tayyor vazn kiritilgan bo'lsa hisoblanadi.
   - "Mening porsiyam" — agar porsiyalar soni kiritilgan bo'lsa, jami ÷
     porsiyalar soni.
5. **Saqlash** — retsept nomi bilan localStorage'ga yoziladi (mavjud
   ovqat ro'yxati kaliti bilan bir xil naqshda, 1.8-band — FAZA
   1'dagi `kalki_kaloriya_<sana>` kaliti EMAS, alohida
   `kalki_retsept_<nom>` kaliti, chunki retsept KUNGA emas, TAOMGA
   bog'liq va qayta-qayta ishlatiladi).
6. **Bugungi ro'yxatga qo'shish** — mavjud "ovqat qo'shish" oqimiga
   (FAZA 1, `renderFoods()`) xuddi shu tarzda qo'shiladi: saqlangan
   retseptdan "1 porsiya" yoki "N gramm" tanlab, `eaten` massiviga
   `{id, g, kcal}` shaklida push qilinadi — mavjud kod o'zgarmaydi,
   faqat retsept "sun'iy taom" sifatida `FOODS`ga o'xshash obyekt
   yaratib beradi.

## 2. Xom va pishgan vaznni aralashtirmaslik qoidasi

Bu — eng ko'p xato qilinadigan joy, shuning uchun aniq qoida:

- **Masalliqlar bazasidagi har bir yozuv aniq bitta holatga tegishli**
  (xom YOKI pishgan, ikkalasi emas) — masalliq nomi holatni ko'rsatishi
  kerak (masalan "Guruch, xom" va "Guruch, pishgan" — IKKITA alohida
  yozuv, bir xil nom ostida ikkita qiymat emas).
- **Jami kaloriya faqat XOM masalliqlar yig'indisidan hisoblanadi**
  (yoki foydalanuvchi ataylab "pishgan" holatidagi masalliqni tanlasa,
  o'sha holatidan) — pishirish jarayonining o'zi (issiqlik) kaloriya
  qo'shmaydi, faqat suv/moy kabi tarkibiy qismlar o'zgaradi. Demak
  "jami kaloriya" — masalliqlarning XOM holatdagi yig'indisi, "tayyor
  taom vazni" esa PISHGANDAN KEYINGI vazn (suv bug'langani uchun odatda
  kamroq yoki moy qo'shilgani uchun ko'proq bo'lishi mumkin).
- **100 g hisobi shu ikki sonni albatta TO'G'RI mos qo'yishi kerak**:
  jami kaloriya (xom asosida) ÷ tayyor vazn (pishgan, gramm) × 100 —
  aralashtirilsa (masalan xom vaznga bo'linsa) natija noto'g'ri chiqadi.
  Generatorda bu ikki maydon aniq nomlanishi shart: "Masalliqlar vazni
  (xom)" va "Tayyor taom vazni (pishirilgandan keyin)".

## 3. "Teng porsiya taxmini" — faqat porsiya soni ma'lum bo'lganda

Agar foydalanuvchi tayyor taom vaznini KIRITMAGAN, faqat porsiyalar
sonini kiritgan bo'lsa — "mening porsiyam" kaloriyasi hisoblanadi
(jami ÷ son), lekin **100 g qiymati ko'rsatilMAYDI** (vazn noma'lum,
hisoblab bo'lmaydi) va "mening porsiyam" natijasi yonida aniq belgi
qo'yiladi: *"taxminiy — porsiyalar teng deb hisoblangan"* — chunki
haqiqatda porsiyalar deyarli hech qachon mutlaqo teng bo'lmaydi (masalan
suyuq taomda birinchi quyilgan porsiya ko'proq bo'lishi mumkin). Bu
FAZA 1'dagi "hech narsani o'ylab topma" qoidasining davomi: taxminiy
raqamni HAQIQIY deb ko'rsatmaslik, aniq belgilab qo'yish.

## 4. Masalliqlar bazasi — talablar

Har bir yozuv:

| Maydon | Izoh |
|---|---|
| `holat` | `'xom'` yoki `'pishgan'` — majburiy, aniq |
| `kkal100` | 100 g uchun kaloriya |
| `oqsil100`, `yog100`, `uglevod100` | 100 g uchun BJU (gramm) — **yo'q bo'lsa `null`, "ma'lumot yo'q" ko'rsatiladi, 0 yozilmaydi** (FAZA 1, 1.1-band'dagi "kiritilmagan qiymat 0 emas" qoidasi bilan bir xil mantiq) |
| `porsiyaVazni` | standart bitta porsiya og'irligi, gramm (ixtiyoriy) |
| `manba` | qiymat qayerdan olingani |

**Manba nomzodi: USDA FoodData Central** (`fdc.nal.usda.gov`) —
yuklab olinadigan CSV/JSON to'plamlari orqali, API kaliti/tarmoq
so'rovi orqali EMAS (loyihaning "serverga hech narsa yuborilmaydi"
tamoyiliga mos, va API chegaralari/kalit boshqaruvidan qochish uchun).
Bu ham chet el (AQSh) bazasi bo'lgani uchun o'zbek milliy taomlari
tarkibidagi masalliqlar (masalan "qatiq", "jiydama go'sht kesimi")
uchun to'g'ridan-to'g'ri mos yozuv topilmasligi mumkin — bunday
holatlarda ham `null`/"ma'lumot yo'q", o'ylab topilmaydi.

## 5. Hozirgi bazada BJU yo'qligi — audit natijasi

`kaloriya-kalkulyator.html`dagi `FOODS` massivi (16 ta yozuv, FAZA 1'dan
keyingi holat) hech birida BJU (oqsil/yog'/uglevod) maydoni **umuman
yo'q** — faqat `k` (100 g uchun kkal) bor. Ya'ni **16 taomning 16
tasi** (100%) uchun BJU "ma'lumot yo'q" bo'lib qoladi, agar "Mening
retseptim" shu bazadan ham foydalanmoqchi bo'lsa:

osh, lag'mon, manti, somsa, shashlik, sho'rva, mastava, chuchvara,
dimlama, norin, non, patir, qazi, achichuq, halva, choy.

Demak "Mening retseptim" FAZA 1'da alohida, YANGI masalliqlar bazasi
bilan boshlanishi kerak (yuqoridagi `FOODS` — tayyor TAOMLAR bazasi,
"retsept" esa XOM MASALLIQLAR bazasini talab qiladi — ikkalasi
tuzilishi boshqa, birlashtirib bo'lmaydi).

## 6. Keyingi qadam

Asror GA'da kaloriya sahifasiga qaytib kirish ko'rsatkichini
tekshirgach: (a) masalliqlar bazasi manbasi va boshlang'ich ro'yxati
(taxminan 20-30 ta eng ko'p ishlatiladigan xom masalliq) tasdiqlanadi,
(b) shundan keyin FAZA 1 (oqim + saqlash) qurila boshlaydi.
