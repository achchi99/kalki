# Hujjat paketlari — umumiy ma'lumot uzatish (FAZA 0)

Sana: 2026-09-21. Kod o'zgartirilmadi — faqat tekshiruv va reja.

## 0.A — Uch juftlik, mavjudlik tekshiruvi

21 ta `docgen.js`/`KD` asosidagi generator (`grep -l "var CFG={" *.html`)
orasidan tekshirildi:

| Juftlik | Hujjat 1 | Hujjat 2 | Holat |
|---|---|---|---|
| Uyni ijaraga berish | `ijara-shartnomasi-namunasi.html` ✅ | `topshirish-qabul-dalolatnomasi-namunasi.html` ✅ | **Ikkalasi ham bor** |
| Xizmat ko'rsatish | `xizmat-korsatish-shartnomasi-namunasi.html` ✅ | `tolov-hisobi-namunasi.html` ✅ | **Ikkalasi ham bor** |
| Qarz berish | `tilxat-namunasi.html` ✅ | "qaytarish jadvali" generatori | ❌ **yo'q** — alohida "qaytarish jadvali" turidagi generator saytda mavjud emas |

Uchinchi juftlik shu sababli **chetda qoladi** (yangi hujjat yaratish bu
promptga kirmaydi, spec 3-bo'lim).

## 0.B — Umumiy maydonlar xaritasi (qo'lda solishtirilgan)

### Juftlik 1 — Ijara shartnomasi ↔ Topshirish-qabul dalolatnomasi

Ikkala generator ham **bir xil `partyFields(pre)` yordamchi funksiyasidan**
foydalanadi (ikkalasida alohida-alohida yozilgan, lekin deyarli bir xil
maydon to'plami beradi) — bu tasodifiy emas, ikkalasi ham "tomon" (shaxs)
ma'lumotini bir xil naqshda so'raydi:

| Ijara (`ll`=ijaraga beruvchi, `tn`=ijarachi) | Dalolatnoma (`gv`=topshiruvchi, `tk`=qabul qiluvchi) | Izoh |
|---|---|---|
| `llType`/`tnType` | `gvType`/`tkType` | to'g'ridan-to'g'ri mos (jismoniy/yuridik) |
| `llFio`/`tnFio` | `gvFio`/`tkFio` | mos |
| `llPasSer`/`tnPasSer` | `gvPasSer`/`tkPasSer` | mos |
| `llPasNum`/`tnPasNum` | `gvPasNum`/`tkPasNum` | mos |
| `llPasBy`/`tnPasBy`, `llPasDate`/`tnPasDate` | — | **dalolatnomada yo'q** — ijaraning bu 2 maydoni hech qayerga bormaydi, tashlab yuboriladi |
| `llJshshir`/`tnJshshir` | `gvJshshir`/`tkJshshir` | mos |
| `llOrg`/`tnOrg` | `gvOrg`/`tkOrg` | mos |
| `llStir`/`tnStir` | `gvStir`/`tkStir` | mos |
| `llMfo`/`tnMfo` | `gvMfo`/`tkMfo` | mos |
| `llBank`/`tnBank` | `gvBank`/`tkBank` | mos |
| `llAcc`/`tnAcc` | `gvAcc`/`tkAcc` | mos |
| `llDir`/`tnDir` | `gvDir`/`tkDir` | mos |
| `llAddr`/`tnAddr` | `gvAddr`/`tkAddr` | mos |
| `llPhone`/`tnPhone` | `gvPhone`/`tkPhone` | mos |
| `city` | `city` | maydon ID'si ham bir xil |
| `num` (shartnoma raqami) | `ctrNum` (faqat `hasContract='ha'` bo'lganda ko'rinadi) | mos — ijaradan kelinganda `hasContract` ham `'ha'`ga o'rnatiladi |
| `signDate` (tuzilgan sana) | `ctrDate` (faqat `hasContract='ha'`) | mos — shartnomaning o'zi haqidagi sana |
| `objAddr` (turar joy manzili) | `rentAddr` (faqat `subject='ijara'` tanlanganda ko'rinadi) | mos — ijaradan kelinganda `subject` ham `'ijara'`ga o'rnatiladi |

**Semantik yo'nalish:** "Ijaraga beruvchi" kalitni/xonadonni topshiradi →
"Topshiruvchi" (`ll*`→`gv*`). "Ijarachi" qabul qiladi → "Qabul qiluvchi"
(`tn*`→`tk*`). Bu amaliyotdagi real oqimga mos: avval shartnoma tuziladi,
keyin xonadon topshirilganda dalolatnoma imzolanadi.

**Ataylab ULASHILMAYDI:** `actDate` (dalolatnoma tuzilgan/topshirilgan
sana). Bu — YANGI voqea sanasi (topshirish kuni shartnoma tuzilgan kundan
farq qilishi tabiiy), ijara ma'lumotidan xulosa chiqarib bo'lmaydi.
Generatorning o'zida allaqachon `def:today()` bor — bo'sh qolmaydi, faqat
avvalgi hujjatdan taxmin qilinmaydi.

**Bitta texnik nuance:** `rentAddr` maydoni faqat dalolatnomada
`subject==='ijara'` tanlanganda ko'rinadi (standart qiymat — `'mulk'`).
Demak ijaradan kelinganda prefill mexanizmi `subject`ni ham `'ijara'`ga
o'rnatishi kerak — aks holda `objAddr` qiymati borsa ham, uni qo'yadigan
maydon ko'rinmay qoladi. Xuddi shunday `hasContract` ham `'ha'`ga
o'rnatilishi kerak — `num`/`signDate` uchun ham xuddi shu holat.

**Noaniqlik darajasi: PAST.** Deyarli barcha maydon to'g'ridan-to'g'ri
1:1 mos keladi, hech qanday qiymatlarni birlashtirish yoki taxmin qilish
shart emas — faqat ikkita "rejim" maydonini (`subject`, `hasContract`)
oldindan to'g'ri holatga o'rnatish kerak.

### Juftlik 2 — Xizmat ko'rsatish shartnomasi ↔ To'lov uchun hisob

| Xizmat shartnomasi (`cs`=buyurtmachi, `ex`=ijrochi) | To'lov hisobi | Izoh |
|---|---|---|
| `exOrg` YOKI `exFio` (turi `exType`ga bog'liq) | `sellerName` (bitta erkin matn maydoni) | **birlashtirish talab qiladi** — qaysi qiymatni olish kerakligini aniqlash uchun shart (`exType==='yuridik' ? exOrg : exFio`) |
| `exAddr` + `exPhone` (ikkita alohida maydon) | `sellerAddr` ("Manzil / telefon", bitta maydon) | **ikkita qiymatni birlashtirish** kerak |
| `exStir` | `sellerReq` ("STIR yoki boshqa rekvizit") | nomi boshqa, ma'nosi yaqin — lekin faqat yuridik shaxs uchun mavjud, jismoniy shaxsda `exStir` umuman yo'q |
| `csOrg`/`csFio` | `buyerName` | xuddi shu birlashtirish muammosi |
| `csAddr`+`csPhone` | `buyerAddr` | xuddi shu birlashtirish muammosi |
| `ctrDate` | `invDate` | mos |
| `city` | — | to'lov hisobida yo'q |
| `srvName`/`srvDesc`/`total` | `items` (jadval, massiv) | **struktura butunlay boshqa** — skalyar maydonlardan jadval qatoriga o'tkazish kerak bo'ladi |

**Noaniqlik darajasi: YUQORI.** To'g'ridan-to'g'ri mos keladigan atigi
bitta maydon bor (`ctrDate`→`invDate`). Qolganlari — yoki qaysi qiymatni
tanlash haqida qaror qabul qilishni (Org yoki Fio), yoki ikkita maydonni
birlashtirishni (Addr+Phone), yoki tuzilmani butunlay o'zgartirishni
(skalyar → jadval qatori) talab qiladi. Bu — "taxmin qilinmaydi" qoidasiga
zid ketadigan ko'p sonli kichik qarorlar zanjiri.

## 0.C — Pilot tanlovi

**Tanlangan: Juftlik 1 — Ijara shartnomasi ↔ Topshirish-qabul
dalolatnomasi.**

Sabab: 26 ta umumiy maydon juftligi (13+13 tomon maydoni + 3 ta
metama'lumot: raqam/sana/manzil), deyarli barchasi **to'g'ridan-to'g'ri
1:1 mos** — hech qanday qiymatlarni birlashtirish yoki "qaysi birini
olish kerak" degan qarorlar zanjiri yo'q. Yagona texnik nuance (ikkita
rejim-maydonini oldindan to'g'ri holatga o'rnatish) aniq va mexanik,
noaniqlik emas.

Juftlik 2 (Xizmat shartnomasi ↔ To'lov hisobi) keyingi safarga
qoldiriladi — uni amalga oshirish uchun avval alohida qarorlar kerak
(masalan: "Org yoki Fio, qaysi birini ustuvor deb hisoblaymiz",
"Addr+Phone qanday formatda birlashtiriladi") — bular hozircha
tasdiqlanmagan taxminlar bo'lardi.

## Keyingi qadam

FAZA 1 — foydalanuvchi tasdiqlagandan keyin boshlanadi.
