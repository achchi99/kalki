# Aliment kalkulyatori — Asror tasdiqlashi kerak bo'lgan savollar

## Holat belgilari

- ✅ — tasdiqlangan, ochiq savol yo'q
- (belgisiz) — hali tasdiqlanmagan, kalkulyatorda ishlatilmaydi yoki matnga qo'shilmagan

## Tasdiqlangan va allaqachon kalkulyatorda ishlatilayotgan konstantalar (2026-09-27 audit)

`data/legal-constants.json`dagi quyidagi 7 ta `aliment_*` konstanta barchasi `holat: TASDIQLANGAN`
va kalkulyator ularni haqiqatda o'qib, hisoblashda ishlatadi (matn emas — real formula):

| Konstanta | Qiymat | Manba | Kalkulyatorda ishlatilishi |
|---|---|---|---|
| `aliment_foiz_1bola` | 25% (1/4) | Oila kodeksi 99-modda | A/B/C rejimlar |
| `aliment_foiz_2bola` | 33,33% (1/3) | Oila kodeksi 99-modda | A/B/C rejimlar |
| `aliment_foiz_3plus` | 50% (1/2) | Oila kodeksi 99-modda | A/B/C rejimlar |
| `aliment_min_foiz_mhtekm` | 26,5% (MHTEKM'dan) | Oila kodeksi 99-modda | Minimal chegara |
| `aliment_ushlab_qolish_odatiy` | 50% | Mehnat kodeksi 269-modda 2-qism | C rejim (qo'lga tegadigan) |
| `aliment_ushlab_qolish_qarzdorlikda` | 70% | Mehnat kodeksi 269-modda 2-qism | (hozircha UI matnida alohida ko'rsatilmagan) |
| `aliment_penya_kunlik` | 0,1%/kun | Oila kodeksi 142-modda | B rejim (qarzdorlik) |

**2026-09-27 tuzatildi:** sahifaning FAQ/SEO matni ("rasmiy manba tasdiqlangach...") shu
tasdiqlangan qiymatlarga zid, eskirgan matn edi — kalkulyator o'zi allaqachon real foizlar
bilan hisoblab turgan, faqat matn buni aks ettirmagan. Bu KOD BUGI emas, TAQDIMOT (matn)
kamchiligi edi — tuzatildi, formula o'zgarmadi.

## Ochiq savol

**1. Aliment hisobiga kiritiladigan daromad turlari ro'yxati** — sahifadagi FAQ
("Aliment kimning daromadidan hisoblanadi?") "Hisobga kiritiladigan aniq daromad turlari
ro'yxati qonunchilikda belgilangan" deb umumiy aytadi, lekin `legal-constants.json`da bu
ro'yxat uchun konstanta YO'Q — kod ham bunday ro'yxatni ishlatmaydi (foydalanuvchi faqat
"asosiy ish joyidagi daromad" deb umumiy kiritadi). Bu **o'ylab topilmadi**, chunki aniq
ro'yxat (masalan qaysi mukofot/nafaqa turlari kiritiladi, qaysilari kiritilmaydi) hali
tekshirilmagan.

- **Qanday tekshiriladi:** Vazirlar Mahkamasining aliment ushlab qolinadigan daromad turlari
  ro'yxatini belgilaydigan qarori (odatda alohida ilova sifatida chiqadi — "Ish haqi va
  boshqa daromadlardan aliment ushlab qolish tartibi to'g'risida"gi Nizom kabi nomlanadi),
  yoki Oila kodeksining tegishli moddasi.
- **Javob:** — (hali yo'q)

Agar kelajakda bu ro'yxat tasdiqlansa, `aliment_daromad_turlari` (tur: `royxat`) nomli yangi
konstanta qo'shilishi va shu savol yopilishi tavsiya etiladi.
