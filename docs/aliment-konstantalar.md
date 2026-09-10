# Aliment kalkulyatori — FAZA 0 konstantalar tekshiruvi

Sana: 2026-09-10. Manba: lex.uz (WebSearch/WebFetch orqali), Mehnat
kodeksi (28.10.2022, https://lex.uz/docs/-6257288) va Oila kodeksi
(30.04.1998, https://lex.uz/docs/104723).

---

## Tasdiqlangan (yangi, `data/legal-constants.json`ga qo'shildi)

### 1. Ushlab qolish chegarasi — odatiy: **50%**

- **Manba:** Mehnat kodeksi (28.10.2022), 269-modda 2-qism
- **Matn:** "Har bir to'lov chog'ida ushlab qolinadigan mablag'lar
  xodimga haqiqatda hisoblangan ish haqining 50%idan oshmasligi kerak."
- **Tekshiruv:** to'g'ridan-to'g'ri lex.uz (https://lex.uz/docs/-6257288)
  dan WebFetch orqali olindi, ikki mustaqil WebSearch natijasi bilan
  mos keldi (bir xil raqam, bir xil modda).
- `id`: `aliment_ushlab_qolish_odatiy`, `holat`: `TASDIQLANGAN`

### 2. Ushlab qolish chegarasi — aliment qarzdorligida: **70%**

- **Manba:** xuddi shu modda, 269-modda 2-qism
- **So'zma-so'z:** "Aliment majburiyatlari bo'yicha qarzdorlikni
  ushlab qolish miqdori xodimga haqiqatda hisoblangan ish haqining
  yetmish foizidan oshishi mumkin emas."
- **Muhim nuans:** bu 70% chegara aynan **QARZDORLIKNI** undirishga
  tegishli, joriy (odatiy) alimentga emas — shuning uchun ID'da
  "qarzdorlikda" so'zi bor, C rejimida (to'lovchi, joriy oy) 50%
  qo'llanishi kerak, B rejimida (qarzdorlik undirilayotganda) 70%.
- `id`: `aliment_ushlab_qolish_qarzdorlikda`, `holat`: `TASDIQLANGAN`

---

## Tasdiqlanmagan — `TASDIQLASH KERAK`, sizning tekshiruvingiz kerak

### 3. Penya (kechiktirilgan aliment uchun kunlik jarima)

- **Nima topildi:** Oila kodeksi **142-modda** — "Alimentni o'z vaqtida
  to'lamaganlik uchun javobgarlik" nomli modda mavjudligi bir nechta
  ikkilamchi manbada (advice.uz, huquqiyportal.uz) tasdiqlandi. Bu
  javobgarlik **sud qarori asosida undirilayotgan alimentga** nisbatan
  qo'llanadi (kelishuv/notarial shartnoma asosida emas).
- **Nima topilmadi:** kunlik foiz stavkasining **aniq raqami** (masalan
  0,1% kabi). Bir nechta qidiruv va WebFetch urinishi (lex.uz'ning o'zi
  ham) faqat moddaning nomini qaytardi, sonli qiymatni bermadi —
  lex.uz'ning to'liq matn render qilish usuli qidiruv vositalarim orqali
  to'liq o'qib bo'lmadi.
- **Qiladigan ish:** shu aniqlangunga qadar B rejim (qarzdorlik)
  **penyasiz** ishlaydi — faqat asosiy qarz ko'rsatiladi, va natija
  ostida ochiq yoziladi: "Bu hisobda penya (kechiktirilganlik uchun
  jarima) hisobga olinmagan."
- `id`: `aliment_penya_kunlik_foiz`, `qiymat`: `null`, `holat`:
  `TASDIQLASH KERAK`

### 4. Ishlamagan/hujjatsiz davr uchun qarz hisoblash bazasi

- **Nima topildi (ikkilamchi manbadan, advice.uz):** agar to'lovchi
  davr ichida ishlamagan yoki daromadini tasdiqlovchi hujjat taqdim
  etmagan bo'lsa, qarz **"respublika bo'yicha o'rtacha oylik ish
  haqi"** asosida hisoblanadi (qarz undirilayotgan vaqtdagi qiymati
  bo'yicha) — bu **MHTEKM emas**, alohida, davriy yangilanadigan
  statistik ko'rsatkich (stat.uz).
- **Nima topilmadi:** (a) aniq modda raqami (Oila kodeksi yoki Fuqarolik
  protsessual kodeksi — qaysi hujjatda ekani aniqlanmadi), (b) shu
  "respublika bo'yicha o'rtacha oylik ish haqi"ning joriy rasmiy
  qiymati (bu — alohida topilishi va yangilanib turishi kerak bo'lgan
  raqam, MHTEKM kabi bitta joyda saqlanadigan konstanta emas).
- **Bonus topilma (B rejimga tegishli, alohida tasdiqlash kerak):**
  bir manba aliment qarzi odatda **3 yildan ortiq muddatga undirilmaydi**
  (ijro hujjati taqdim etilgan sanadan), **lekin** agar qarz to'lovchining
  aybi bilan yuzaga kelgan bo'lsa, butun to'lanmagan davr uchun
  undiriladi (3 yil chegarasi qo'llanmaydi). Bu FAZA 2 (B rejim)
  qurilishida hisobga olinishi mumkin bo'lgan qo'shimcha nuans — hozircha
  alohida konstanta sifatida qo'shilmadi, faqat shu yerda qayd etildi.
- **Qiladigan ish:** shu aniqlangunga qadar B rejimida "to'lovchi
  ishlagan/ishlamagan" farqi qo'shilmaydi — barcha oylar uchun
  foydalanuvchi kiritgan bitta daromad qiymati ishlatiladi, va bu
  cheklov sahifada ochiq ko'rsatiladi.
- `id`: `aliment_ishlamagan_davr_baza`, `qiymat`: `null`, `holat`:
  `TASDIQLASH KERAK`

---

## Sizdan kerak bo'ladigan tekshiruv (lex.uz'dan qo'lda)

1. Oila kodeksi 142-modda — to'liq matnini oching, kunlik penya foizini
   toping (masalan https://lex.uz/docs/104723 orqali, modda raqamini
   qidirib).
2. "Respublika bo'yicha o'rtacha oylik ish haqi" iborasi qaysi modda
   (Oila kodeksi yoki Fuqarolik protsessual kodeksi, ijro ishlari
   bo'limi) ichida ekanini aniqlang, va joriy rasmiy qiymatini
   (stat.uz yoki tegishli idora) toping.

Bu ikkalasi tasdiqlangach, menga ayting — `legal-constants.json`ni
yangilayman va B rejimidagi tegishli cheklovlarni olib tashlayman.
