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

## Yopilgan savollar

**✅ Aliment hisobiga kiritiladigan daromadlar — HAL BO'LDI (2026-09-27).** Oila kodeksi,
104-modda: aliment O'zbekiston hududida va tashqarisida, pul yoki natura tarzida olingan
barcha turdagi daromaddan ushlab qolinadi — aniq ro'yxat yo'q, istisno yo'q. Chet el
valyutasidagi daromad undirish kunidagi MB rasmiy kursi bo'yicha so'mga aylantiriladi.
Manba: https://lex.uz/uz/docs/104720#159234

Konstanta sifatida qo'shildi: `aliment_daromad_qamrovi` (`data/legal-constants.json`,
`holat: TASDIQLANGAN`).
