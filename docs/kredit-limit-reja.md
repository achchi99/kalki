# Kredit limit + Ipoteka/ijara — FAZA 0 reja

> Kod yozilmagan. Bu hujjat — huquqiy konstantalar holati, sahifa
> arxitekturasi qarori va hisob formulalari (kod emas, formula).

## 1. Huquqiy konstantalar — ikkalasi ham TASDIQLANGAN, birlamchi manbadan

Uchala qiymat ham **lex.uz'dagi rasmiy PDF hujjatlardan to'g'ridan-to'g'ri
o'qib tasdiqlandi** (WebFetch'ning HTML-qayta ishlash vositasi uzun huquqiy
matnni to'liq chiqara olmadi — PDF'ni yuklab, `pypdf` bilan matnga
aylantirib, band raqamigacha tekshirdim).

### 1.1 `dsti_maksimal` — 0.50 (50%)

- **Manba:** MB Boshqaruvining 2025-yil 8-apreldagi 7/3-son qarori
  (Adliya vazirligida ro'yxat raqami 3618, 2025-yil 22-aprel; QMMB
  10/25/3618/0378-son, 23.04.2025)
- **Modda:** 2-bob, 1-§, 3-band
- **Aynan matni:** «Bank tomonidan qarz oluvchiga (birgalikda qarz
  oluvchilarga) kredit (mikroqarz) berilishida uning (ularning) qarz
  yuki ko'rsatkichi 50 foizdan oshmasligi lozim»
- **Istisno (izoh sifatida saqlanadi, hisobga kiritilmaydi):** bank
  portfelining eng ko'pi 15%ida DSTI 100%gacha ruxsat etiladi; yangi
  (6 oydan kam) o'zini band qilgan shaxslar uchun DSTI hisobga
  olinmasligi mumkin.
- **Amal qiladi:** 2025-07-24 (qaror e'lon qilingandan 3 oy o'tib —
  hujjatning o'zida "uch oydan keyin kuchga kiradi" deyilgan, 23.04.2025 + 3 oy)
- **manba_url:** `https://lex.uz/docs/-7491592`

### 1.2 `qarz_daromad_nisbati_rasmiy` — 8

### 1.3 `qarz_daromad_nisbati_norasmiy` — 5

- **Manba:** MB Boshqaruvining 2025-yil 5-dekabrdagi 31/9-son qarori
  (Adliya vazirligida ro'yxat raqami **3618-1**, 2025-yil 18-dekabr) —
  yuqoridagi asosiy Nizomga qo'shimcha, yangi **21-bob** kiritadi.
- **Modda:** 21-bob, **244-band**
- **Aynan matni:** «2026-yil 1-martdan boshlab ... qarz oluvchining
  ... o'rtacha oylik daromadlarini aniqlash imkoniyati: mavjud bo'lsa,
  qarzning daromadga nisbati ko'rsatkichi 8 barobardan; mavjud
  bo'lmasa, ... 5 barobardan oshmasligi lozim, **bundan o'zini o'zi
  band qilgan shaxs bo'lgan qarz oluvchilar mustasno**.»
- **⚠️ Muhim nuance — 245-band:** o'zini o'zi band qilgan shaxslar
  (jismoniy shaxs tadbirkorlar emas, "o'z-o'zini band qilgan" maqomi)
  daromad hujjat bilan tasdiqlanган-tasdiqlanmaganidan qat'i nazar
  **har doim 8 barobar** oladi (244-banddagi shart ularga tegishli
  emas). FAZA 1'ning kirish maydonlarida faqat "rasmiy/norasmiy" ikki
  variant bor — bu uchinchi holat (o'zini band qilgan shaxs) hozircha
  modellashtirilmagan. **Tavsiya: MVP uchun e'tiborsiz qoldirish
  mumkin** (ikki toifa bilan boshlash, keyinroq uchinchi variant
  qo'shish mumkin) — lekin bu ataylab qoldirilgani hisobotda
  aytilishi kerak, "unutilgan" emas.
- **246-band — istisnolar:** YaTT (yakka tartibdagi tadbirkor)
  kreditlari va ta'lim kreditlariga bu talab umuman tatbiq etilmaydi.
- **Amal qiladi:** 2026-03-01 (band ichida aniq yozilgan)
- **manba_url:** `https://cbu.uz/uz/financial-stability/macroprudential-policy-tools/debt-to-income/`
  (CBU'ning o'z rasmiy sahifasi, xuddi shu qarorga havola qiladi)

**`data/legal-constants.json`ga kiritildi** — commit shu hujjat bilan
birga.

## 2. Sahifa arxitekturasi — taklif tasdiqlanadi, bitta qo'shimcha bilan

Sizning taklifingiz to'g'ri, o'zgartirishsiz qabul qilinadi:

- **`kredit-limit-kalkulyator.html`** — yangi sahifa, `kredit-kalkulyator`
  bilan ikki tomonlama bog'lanadi
- **`ipoteka-yoki-ijara-kalkulyator.html`** — yangi sahifa (nom
  "ipoteka-yoki-ijara" o'rniga "-kalkulyator" qo'shimchasi bilan —
  saytdagi barcha kalkulyator sahifalari shu naqshga amal qiladi,
  masalan `oylik-soliq-kalkulyator`, `yhxx-jarima-kalkulyator`), 
  `ipoteka-kalkulyator` bilan bog'lanadi

**Texnik tasdiq:** yangi `.html` fayl repo ildiziga qo'yilsa,
`tools/render.js`dagi `sitePages()` (fs.readdirSync asosida) uni
avtomatik oladi — sitemap, prerender, verify-all hech qanday qo'lda
ro'yxatga kiritishni talab qilmaydi. Faqat RU versiya kerak bo'lgani
uchun ikkala sahifa nomi `tools/prerender.js`dagi `RU_PAGES` massiviga
qo'shiladi (oddiy massiv, `.push()` qadar oddiy).

**Ichki bog'lanish naqshi (mavjud, takrorlanadi):** `#related`
blokidagi grid-karta (🧮 emoji + `data-rel-uz`/`data-rel-ru`) va
`#xnav` pill-ro'yxatiga qo'shiladi — `kredit-kalkulyator.html` va
`ipoteka-kalkulyator.html`ning mavjud `#related` bloklariga yangi
karta qo'shish, ularning o'zlarida esa yangi sahifalarga qaytish
kartasi.

## 3. FAZA 1 formulasi — "Bank menga qancha beradi?"

**Qayta ishlatiladigan formula:** `kredit-kalkulyator.html:603`dagi
annuitet formulasi (`ipoteka-kalkulyator.html:444`da ham aynan bir
xil) — bu ikkalasi allaqachon bir xil formulaga tayanadi, yangisi ham
shunga mos bo'ladi, farq yo'q:
```
i = yillik_stavka / 100 / 12        (oylik ulush)
n = muddat_oy
oylik_tolov = P × i × (1+i)^n / ((1+i)^n − 1)
```

**Cheklov A (qarz/daromad):**
```
maksimal_kredit_A = daromad × (rasmiy ? 8 : 5)
```

**Cheklov B (DSTI, formula TESKARI yo'nalishda):**
```
ruxsat_etilgan_oylik = daromad × 0.50 − mavjud_tolovlar
                                          (agar manfiy bo'lsa — 0, kredit imkoni yo'q)
maksimal_kredit_B = ruxsat_etilgan_oylik × ((1+i)^n − 1) / (i × (1+i)^n)
```
Chegara holat: `stavka == 0` bo'lsa (i=0) — formula 0/0 bo'ladi,
alohida ishlov kerak: `maksimal_kredit_B = ruxsat_etilgan_oylik × n`
(foizsiz holat — oddiy bo'lish).

**Natija:** `min(maksimal_kredit_A, maksimal_kredit_B)`, qaysi
cheklov ishlaganini taqqoslab ko'rsatish.

**Standart qiymatlar** (mavjud `kredit-kalkulyator.html`dan
izchillik uchun qayta ishlatiladi): stavka — 23%, muddat — 36 oy.

## 4. FAZA 2 uchun ochiq savol — standart taxmin qiymatlari manbasi

`data/legal-constants.json`da stavka/inflyatsiya/depozit turkumidagi
hech qanday konstanta yo'q (tekshirildi — faqat mehnat-huquqiy
konstantalar bor). "Ipoteka yoki ijara" uchun uchta taxmin kerak:
ijara o'sishi (inflyatsiya atrofida), uy narxi o'sishi (konservativ),
omonat daromadi (joriy depozit stavkasi atrofida).

Bular **huquqiy konstanta emas** (bashorat, fakt emas — 0.2.2-band
o'zi buni ochiq belgilaydi), shuning uchun `legal-constants.json`ning
"TASDIQLANGAN qonun" formatiga to'g'ridan-to'g'ri sig'maydi. Tavsiya:
alohida `data/taxmin-konstantalar.json` fayl yaratish — bir xil
tuzilma (`id`, `qiymat`, `manba_nomi`, `manba_url`), lekin `holat`
maydoni o'rniga `"tur": "taxmin"` belgisi bilan, va sahifada har doim
"bu taxmin, fakt emas" izohi bilan chiqadigan qilib belgilanadi. Bu
FAZA 2 boshlanishidan oldin CBU joriy statistikasidan (inflyatsiya
darajasi, o'rtacha depozit stavkasi) qisqa qo'shimcha tekshiruv talab
qiladi — FAZA 1 dan keyin, alohida qadam sifatida bajaraman.

## Xulosa — ochiq savollar (tasdiq kutilmoqda)

1. 245-band nuance (o'zini band qilgan shaxs — doim 8x) MVP'da
   e'tiborsiz qoldirilsinmi (tavsiyam: ha), yoki uchinchi variant
   sifatida qo'shilsinmi?
2. Sahifa nomi: `ipoteka-yoki-ijara-kalkulyator` (saytdagi naqshga mos)
   — tasdiqlanadimi?
3. FAZA 2 taxmin qiymatlari uchun alohida `data/taxmin-konstantalar.json`
   yondashuvi ma'qulmi?
