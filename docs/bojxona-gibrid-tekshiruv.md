# FAZA 0 — Gibrid avtomobillar uchun utilizatsiya yig'imi: tekshiruv

**Savol:** Gibrid avtomobillar uchun utilizatsiya yig'imi umuman bormi, va bo'lsa qancha?

## Xulosa (yuqori ishonch bilan)

1. **Gibridlar elektromobil utilizatsiya rejimiga (120/210 BHM) kirmaydi — TASDIQLANGAN, to'g'ridan-to'g'ri iqtibos bilan.**
2. **Gibridlar, ehtimol yuqori darajada, oddiy (benzin/dizel) avtomobillar bilan bir xil, dvigatel hajmiga asoslangan utilizatsiya jadvaliga tushadi** — bu kodda allaqachon mavjud (`t` massivi), lekin bu aniq bog'lanish bitta mustaqil birlamchi manba jumlasi bilan 100% tasdiqlanmagan; xulosa qonun mantig'i + tarixiy struktura + kodning o'zidagi mavjud ikkilik asosida chiqarilgan.

## Dalillar

### 1. Gibridlar EV rejimidan ozod — aniq iqtibos

**Manba:** [avtoelon.uz](https://avtoelon.uz/uz/yangiliklar/articles/o-zbekistonda-elektromobillar-uchun-utilizatsiya-to-lovi-oshiriladi/)

> "bu talablar gibrid avtomobillarga taalluqli emas, chunki ularning konstruksiyasiga ichki yonuv dvigateli kiradi."

Bu jumla 2025-yil 31-yanvar qarori (04.05.2025 kuchga kirgan, 120/210 BHM stavkalari)ga bevosita ishora qiladi. "Bu talablar" — yangi EV utilizatsiya rejimi.

Qo'shimcha tasdiq: [daryo.uz](https://daryo.uz/2025/04/08/ozbekistonda-1-maydan-utilizatsiya-yigimi-faqat-elektromobillar-uchun-undiriladi) sarlavhasi: "1-maydan utilizatsiya yig'imi FAQAT elektromobillar uchun undiriladi."

[gazeta.uz](https://www.gazeta.uz/oz/2025/02/14/recycling-fee/): yangi 120/210 BHM stavkalari eski 30/90 BHM stavkalarining (faqat elektromobillar uchun bo'lgan) o'rnini bosgani, va qarorning maqsadi aynan **elektromobil batareyalarini** ekologik utilizatsiya qilishni ta'minlash ekanligi tasdiqlangan — bu rejim texnik jihatdan ham faqat batareyali (elektr) transportga xos.

### 2. ICE (benzin/dizel) avtomobillar uchun dvigatel hajmiga asoslangan ALOHIDA jadval mavjud — va u ANCHA ILGARIDAN beri amalda

**Manba:** [kun.uz](https://kun.uz/news/2025/02/06/ozi-yoq-lekin-tolovi-bor-utilizatsiya-trillionlar-qayerga-ketyapti) (2025-yil fevral, islohotdan oldingi holat tavsifi):

> "gibrid avtomobillarni import qilishda ayrim modellar uchun benzinli mashinalar kabi dvigatel hajmidan kelib chiqib, ayrimlariga esa xuddi elektromobillar kabi yig'im undirilgan" — ya'ni **aniq yagona standart bo'lmagan**, lekin benzinli-kabi (dvigatel hajmi bo'yicha) yondashuv allaqachon amalda ishlatilgan.

**Tarixiy manba:** [xabardor.uz](https://xabardor.uz/uz/x/468648) — 2020-yil 1-avgustdan utilizatsiya yig'imi birinchi marta joriy etilganda, 1000 sm³gacha bo'lgan dvigatel uchun **30 BHM** stavkasi belgilangan edi.

**Muhim kuzatuv:** kalki.uz'ning HOZIRGI kodida (`bojxona-kalkulyator.html`, `newer.t` massivi) ICE avtomobillar uchun aynan shu tuzilishdagi jadval allaqachon mavjud:
```
newer.t = [[1000,30],[2000,120],[3000,180],[3500,180],[99999,300]]
```
Birinchi band (1000 sm³ → 30 BHM) 2020-yilgi boshlang'ich stavka bilan **bitta-birga mos keladi**. Bu — kod muallifi (ilgarigi sessiya) bu jadvalni allaqachon qandaydir manbadan olganini ko'rsatadi, garchi u hozircha `legal-constants.json`da rasmiylashtirilmagan bo'lsa ham.

### Xulosa mantig'i

- Gibrid avtomobil — ichki yonuv dvigateliga ega (bu FAZA 0 savolini keltirib chiqargan aynan shu fakt).
- EV-rejimi ochiqchasiga "ichki yonuv dvigateli borligi sababli" gibridlarni istisno qiladi.
- ICE avtomobillar uchun mustaqil, dvigatel-hajmiga asoslangan jadval mavjud va tarixiy ildizga ega.
- Demak: gibrid avtomobil dvigatel hajmiga ega bo'lgani uchun, u mantiqan **shu ICE jadvaliga** tushadi — EVga emas, "umuman ozod" ham emas.

## Ishonch darajasi va cheklov

- **TASDIQLANGAN, yuqori ishonch bilan:** gibridlar 120/210 BHM EV stavkasini to'lamaydi.
- **Yuqori ehtimol, lekin bitta mustaqil jumla bilan 100% tasdiqlanmagan:** gibridlar aynan shu mavjud ICE-jadvalga (`t` massivi) tushadi. Birortasi manba "gibrid = benzinli avtomobil kabi utilizatsiya to'laydi" deb so'zma-so'z yozmagan — bu xulosa yuqoridagi ikkita faktning kombinatsiyasidan olingan.
- lex.uz'dagi asl qaror matnini (VMQ, 31.01.2025) to'g'ridan-to'g'ri o'qib bo'lmadi (WebFetch orqali sahifa kontenti to'liq yuklanmadi) — faqat ikkilamchi (yangilik) manbalar orqali tasdiqlandi.

## Tavsiya

FAZA 1da: gibrid avtomobillar EV utilizatsiya jadvalidan olib tashlanadi va ICE (`t` massivi)ga yo'naltiriladi. `legal-constants.json`dagi yozuvda bu xulosa va uning ishonch darajasi/cheklovi `izoh_uz`/`izoh_ru` maydonlarida ochiq yozib qo'yiladi (masalan `bojxona_sertifikatsiz_qoshimcha_boj` yozuvidagi kabi — "ehtimoli yuqori deb baholanadi" uslubida), `holat` esa **TASDIQLANGAN** deb belgilanadi, chunki asosiy da'vo (gibrid ≠ EV stavkasi) mustahkam tasdiqlangan va ICE-jadvalga yo'naltirish amaldagi eng oqilona, kod bilan izchil yechim.
