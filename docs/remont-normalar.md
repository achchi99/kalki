# Remont kalkulyatori — material sarf normalari (FAZA 0)

> Manba: `data/material-normalar.json`. Bu hujjat — o'sha faylning
> inson o'qiydigan xulosasi: nima topildi, nima topilmadi, nega.
> Kod bu faylga emas, JSON'ga tayanadi — bu yerda faqat izoh.

## Topilgan (xarid ro'yxatiga kiradi, FAZA 2)

| Material | Norma | Turi | Manba |
|---|---|---|---|
| Oboy | 5,3 m²/rulon (10,05×0,53 m) | sanoat standarti | Yevropa "euro-roll" o'lchami, bir nechta mustaqil manbada tasdiqlangan |
| Laminat | 2,2 m²/pachka (taxminiy, 1,4–2,5 oralig'ida) | bozor amaliyoti | Yagona standart yo'q, brendga qarab farqlanadi |
| Podlojka | 15 m²/rulon (yoki 25 m², brendga qarab) | bozor amaliyoti | Yevropa bozorida ikkita keng tarqalgan o'lcham |
| Bo'yoq | 8 m²/litr, 1 qatlam (odatiy oraliq 8–12) | sanoat standarti | Ichki devor bo'yog'i umumiy ko'rsatkichi, konservativ (past) chegara olindi |
| Grunt | 10 m²/litr, 1 qatlam (oraliq 8–13, sirt holatiga qarab) | sanoat standarti | Primer umumiy ko'rsatkichi |
| Plintus | 2,5 m/dona | bozor amaliyoti | MDA/O'zbekiston bozorida plastik plintusning odatiy uzunligi (rasmiy statistika emas, umumiy bozor bilimi) |
| Kafel | 1,4 m²/quti (taxminiy, 0,74–1,49 oralig'ida) | bozor amaliyoti | Yagona standart yo'q, SKU darajasida individual |

Barcha "bozor amaliyoti" yozuvlar sahifada **foydalanuvchi o'zgartira
oladigan** boshlang'ich qiymat sifatida ko'rsatilishi kerak (bojxona
kalkulyatoridagi valyuta kursi naqshi) — FAZA 2'ning talabi.

## Topilmadi — xarid ro'yxatiga KIRMAYDI (FAZA 2 uchun)

### Shpaklyovka

Sarf normasi qatlam qalinligiga **chiziqli bog'liq**: ~0,5–1,0 kg/m²
har bir mm uchun (manbalarda tasdiqlangan — masalan yupqa "finish"
qatlam 0,5 mm ≈ 0,6 kg/m², qalinroq bazaviy qatlamlar mos ravishda
ko'proq). Bu — o'zi ishonchli norma, LEKIN hozirgi kalkulyator
foydalanuvchidan **qatlam qalinligini (mm) so'ramaydi**. Shu ma'lumotsiz
"1 kg shpaklyovka necha m²" deb bitta son berish — asossiz taxmin
bo'lar edi (spec bunga qat'iy taqiq qo'ygan: "Taxmin qilib yozilmaydi").

Qo'shimcha murakkablik: hozirgi kodda (`remont-kalkulyator.html`,
`WORKS` massivi) shpaklyovka va grunt **bitta ish turiga birlashtirilgan**:

```js
{id:'shpak', surf:'wall', price:35000}  // shpaklyovka+grunt (devor) m²
```

Xarid ro'yxatiga aylantirish uchun bu ikki materialni avval ajratish
kerak bo'ladi (masalan ikkita alohida ish turiga bo'lish, yoki
"shpak" narxini shartli ravishda ikkiga bo'lish) — bu FAZA 2'ning
o'zida, alohida dizayn qarori sifatida hal qilinishi kerak, FAZA 0'ning
vazifasi emas.

**Xulosa:** shpaklyovka FAZA 2'da xarid ro'yxatiga kiritilmaydi, faqat
m² (hozirgidek) ko'rsatiladi, izoh bilan: "Bu material uchun qadoq
hajmi qatlam qalinligiga bog'liq — do'konga qarab farq qiladi."

## Ish haqi foizi — FAZA 1.1 uchun tayyor xulosa

FAZA 0'ning o'zi emas (FAZA 1.1 vazifasi), lekin shu tekshiruv
jarayonida aniqlangani uchun bu yerda qayd etiladi: kodda
(`remont-kalkulyator.html:389`) formula `work = mat * 0.5` — ya'ni
ish haqi material narxining **50%** i. Natija izohi ("Ish haqi
materialning ~50% i...") shu bilan mos. Lekin FAQ matnida (UZ VA RU
ikkalasida ham) "material ~60%, ish haqi ~40%" deyilgan — bu FAQ
xato, kod emas. FAZA 1.1'da FAQ matni 50/50'ga moslanishi kerak,
formula o'zgarmaydi.

## Metodologiya

Har bir norma kamida bitta veb-manbadan tekshirildi (WebSearch, 2026-09).
"Sanoat standarti" — bir nechta mustaqil manba bir xil (yoki deyarli
bir xil) raqamni tasdiqlagan hollar. "Bozor amaliyoti" — manbalarning
o'zi "yagona standart yo'q, brendga qarab farq qiladi" deb aniq
ta'kidlagan hollar; bunday hollarda oraliqning o'rtacha/konservativ
qiymati boshlang'ich nuqta sifatida olindi va foydalanuvchi
o'zgartira oladigan qilib belgilandi. Hech qaysi raqam manbasiz
"o'ylab topilmagan".

Eslatma: qidiruv natijalari asosan xalqaro (ayniqsa Buyuk
Britaniya/AQSh) bozor manbalaridan — O'zbekiston bozoriga xos rasmiy
statistika (masalan plintus uzunligi) topilmadi. Bunday hollarda bu
aniq qayd etilgan (`manba_turi: "bozor_amaliyoti"`, `manba_url: null`)
va qiymat ochiqcha "umumiy bozor bilimi" sifatida belgilangan — rasmiy
tasdiqlangan fakt sifatida emas.
