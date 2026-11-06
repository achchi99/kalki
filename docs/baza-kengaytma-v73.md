# Baza kengaytirish v73 (2026-11-06)

**Manba:** D1 `qidiruv_topilmadi` (oxirgi 30 kun), `taklif`, `yorliq_taklif`.

## Hisobot (o'zgartirishdan oldin)
- Topilmagan: 97 ta alohida so'z / 99 marta (30 kun). Muvaffaqiyatli qidiruv-qo'shishlar: 662. Qidiruvlarning umumiy soni hisoblanmaydi → topilmagan ulushi ≈ 83/(662+83) ≈ 11%. (Top-150 chiqmaydi: faqat 97 so'z bor.)
- Eski bazada 97 so'zdan 49 tasi allaqachon topilardi (a — boshqacha yozilgan), qolgan 50: ko'pi ko'p taomli gaplar va keraksiz so'zlar (d), haqiqiy bo'shliqlar (b): sosiskali bulochka, xotdog imlolari, mayonezli salat, kimchi, ovsyankali pancake…
- Tarmoq qidiruvi: faqat `evos` ×1. Yorliq taklifi: 2 ta.

## Natija
- 39 ta yangi taom (`tools/ovqatlar-kengaytma6.js`): osh turlari, kuksi, somsa/shashlik turlari, chuchvara, chapati, nishalda, pishmaniye, xalvaytar, gazli suv/limonad, mohito, mokka, ryajenka, prostokvasha, aktimel, sushi/roll, kimchi, bibimbap, tokpokki, funchoza, yunon salat, shakshuka, selyodka, udon, vok, bruschetta… Baza 977 → 1016.
- ~210 yangi sinonim (`tools/ovqatlar-alias.json`; endi baza-v2 taomlariga ham qo'llanadi).
- Qidiruv: `-li/-lik` qo'shimchasi; qidiruv oynasida ko'p so'zli yozuvda har so'zning eng yaqin taomi (hamma so'z topilsa).
- Topilmadi holati: «AI bilan baholash» (matn ekrani + tasdiq) va yorliq tugmasi.
- Admin: «Haftaning topilmagan top-20» + «Nima qilish» ustuni.
- Eski 99 so'rovni qayta yurgizish: parseText bilan to'liq tanilgan 69 → 77.
