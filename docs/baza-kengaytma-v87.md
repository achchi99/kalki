# KalkiFit v87 — baza kengaytmasi, «tarelka», yangiliklar oynasi, bir xillik maslahati (2026-11-17)

## A. Baza: 1025 → 1289 yozuv (+264)
Qiymatlar FAQAT USDA FDC SR Legacy komponentlaridan (`u:` / `m:` retsept), qo'lda raqam yozilmagan. Yangi USDA id'lar: `python3 tools/usda-qoshimcha.py <SR Legacy zip>` (106 ta).
Tekshiruv: `node tools/kengaytma-tekshir.js tools/ovqatlar-kengaytma8a.js --usda <index.tsv>` (bazani yasamasdan: takror nom, birlik, makro, porsiya oralig'i).

| Fayl | Soni | Toifalar |
|---|---|---|
| `tools/ovqatlar-kengaytma8a.js` | 81 | issiq choy 18 (faqat piyola), matcha latte 2, sovuq choy 5, qahva/kakao/issiq shokolad 25 (kichik 250 / o'rta 350 / katta 450 ml), kafe limonadi 10 (0,3/0,4/0,5 l), smuzi 5, milksheyk 5, yangi siqilgan sharbat 5, kompot 2, ayron 1, energetik 2 |
| `tools/ovqatlar-kengaytma8b.js` | 49 | suyuq ovqatlar (faqat kosa, 300–450 g): sho'rva turlari, mastava/moshxo'rda variantlari, mosh sho'rva, umoch, go'ja, atala, borsh, shchi, rassolnik, solyanka, xarcho, okroshka (kvas), uxa, krem-sho'rvalar, tom yam, ramen, fo… |
| `tools/ovqatlar-kengaytma8c.js` | 134 | non/xamir 13, sut 9, go'sht/baliq 32, salat 18, garnir 7, sabzavot/meva/yong'oq 16, shirinlik 21, kafe/fast-fud 18 |

Dublikat sifatida olib tashlangan (mavjud taomga sinonim bo'ldi): ko'k choy → `yashil-choy`, qora choy va Earl Grey → `choy`, tog' choyi → `otli-choy`, doppio → `espresso`, yangi siqilgan sabzi sharbati → `sabzi-sharbat`.
Manba: admin «topilmagan» (90 kun, 109 so'z) va «AI bilan baholangan» takliflar (96 ta) — mavjudlari sinonimga, yo'qlari yangi taomga. Sinonimlar: `tools/ovqatlar-alias.json` (+13 taom).
Yaqin o'rinbosarlar (USDA'da aniq yo'q): kvas → solod ichimligi, shovul → ismaloq, tkemali → olxo'ri, jo'xori → sorgo, matcha → eriydigan choy kukuni, energetik → umumiy energetik qiymati, ba'zi «yangi siqilgan» sharbatlar → qadoqlangan sharbat.
Cho'chqa: komponentlarda cho'chqa yo'q (sho'rvalardagi «pork and beef» kolbasa → mol kolbasasi 170606); `choshqa` tegi to'plami o'zgarmagan.
«Yemaydiganlarim» teglari: 8c — qo'lda; 8a/8b — USDA komponent tavsifidan avtomatik (`tools/kengaytma-teg.js`, ehtiyotkor tomon).

### Qo'lda qarorga qolganlar
- **do'lana, qizilcha (kizil), shakarsiz vafli, suluguni** — USDA'da manba yo'q, qo'shilmadi.
- **Tomat pastasi, balzamik sirka** — USDA makrosi kkal bilan mos kelmaydi (organik kislota), alohida qator qilinmadi.
- **baza-mantiq «a» istisnolari (12)** — har xil taomlar nomi o'xshash (masalan, shakarli draje bodom yog'i kam → 100 g da xom bodomdan kam). Sababi `tools/baza-mantiq-istisno.js` da.
- **«d» istisnolari** — `raf-vanil`, `issiq-shokolad-kafe` (katta 450 ml > 400 kkal — kafe qiymati) va `shirchoy-tuzli` (sutli choy). Milksheyk «sut kokteyli» sifatida qoidadan chiqarildi.
- **Ikonka tavsiflari (264)** — nomlardan avtomatik yozilgan. Rasm chizishdan oldin ko'rib chiqing: `data/ikonka-reja.txt`, 9-guruh.

## A1. «lagan» → «tarelka»
Birlik kaliti (`likop`, idish turi `lagan`) va eski yozuvlar O'ZGARMAGAN — faqat ko'rinadigan matn. Foydalanuvchiga ko'rinadigan 20 ta matn almashdi:
- **Ilova (UZ, 8 ta):** birlik nomi, idish nomlari, «Mening idishlarim» izohlari.
- **Ilova (RU, 7 ta):** «Тарелка», «Моя тарелка», «Ваши косы и тарелки» va boshqalar.
- **Server birlik lug'ati:** 1 ta.
- **Rasm AI prompti:** 1 ta («1 tarelka»).
- **Bazada:** «Choyxona oshi (1 tarelka)» va retsept izohi, 3 ta.

Eski yozuvdagi AI porsiya matni («1 lagan») va eski idish nomi ko'rsatishda «tarelka» bo'ladi (`noLagan()`), saqlangani o'zgarmaydi. Parser «tarelkam/tarelkada» ni ham taniydi. baza-mantiq yangi «i» qoidasi: birlik kaliti, nom, oila/manba matnida «lagan/лаган» yo'q (sinonimlarda qolishi mumkin).

## A2. Qo'shimchalar (choy/qahva)
`S.adOk/adClean/adCalc/adText` (`assets/kalkifit-core.js`). Porsiya oynasida «Qo'shimcha · 1 piyolaga» qatori bor: shakar 0/1/2/3 choy qoshiq, asal, navvot, sut, limon, murabbo. Bir bosishda tanlanadi, kkal darhol yangilanadi.

| Qo'shimcha | Miqdor | USDA | Kkal |
|---|---|---|---|
| Shakar | 1 ch.q. = 4,2 g | 169655 | 16 |
| Asal | 7 g | 169640 | 21 |
| Navvot | 5 g | — | 19 |
| Sut | 30 ml | 171265 | 18 |
| Limon | 10 g | 167746 | 3 |
| Murabbo | 7 g | 169641 | 19 |

- **Hisob:** porsiya birligi boshiga, grammda bir marta.
- **Yozuv:** `e.ad = { sh: 2, su: 1 }`. Kkal yozuvga qo'shiladi, gramm esa faqat ichimlikniki. Nomi «Choy + 2 q. shakar, sut» ko'rinadi.
- **Tahrir, takrorlash, «[+] oxirgidek»:** qo'shimchalar saqlanadi.
- **Birlashtirish:** `mergeStates` yozuvni butunligicha ko'chiradi; test bor.

## A4. O'lchamlar
Yangi birliklar:
- **Qahva:** `hajm_s/m/l` — kichik 250, o'rta 350, katta 450 ml.
- **Limonad va smuzi:** `l03/l04/l05` — 0,3, 0,4, 0,5 l.

Miqdor oynasidagi tez tanlovda «Kichik / O'rta / Katta» chiqadi, har birida kkal ko'rsatiladi.

## A6. Guruh teglari
`tools/ovqat-guruh.js` (build oxirida `o.gr`). Guruhlar: kartoshka, guruch (va yormalar), xamir, qizil go'sht, tovuq, baliq, tuxum, dukkakli, sabzavot, meva, sut, shirinlik, fast-fud, ichimlik. Yog', sous va protein kukuni uchun qo'shimcha «boshqa» guruhi bor, u maslahatda ishlatilmaydi. Aralash taomda asosiy 1–2 guruh qo'yiladi; noto'g'ri tushganlar `QOLDA` ro'yxatida tuzatiladi. Test: har ko'rinadigan taomda guruh bor.

## B. Yangiliklar oynasi
`assets/app-yangilik.js` umumiy modul, shuning uchun KalkiFit va Ro'zg'or ikkalasiga tegishli.
- **Ko'rsatish:** oynada faqat oxirgi 3 yozuv. Eng yangisi «Yangi» belgisi va sana bilan alohida fonda, qolgan ikkitasi xiraroq.
- **Har yozuv:** sarlavha (`bn`) va 1–2 jumla.
- **O'tkazib yuborgan foydalanuvchi:** banner yoki oynada ham faqat oxirgi 3 yozuv bandlarini ko'radi.
- **JSON:** eski yozuvlar o'chirilmagan.

## C. Bir xillik maslahati
`S.bixil` (hisob qurilmada; serverga faqat anonim hodisa ketadi).
- **1-qoida:** oxirgi 6 kunning kamida 5 tasida bir guruh yozilgan va bugun yana shu guruhdan taom qo'shildi.
- **2-qoida:** oldingi 5 kun ketma-ket oqsil maqsadning 70 % idan kam.
- **Istisnolar:** sabzavot, meva, «boshqa» guruhlari uchun karta chiqmaydi. Ichimlik guruhida faqat ≥ 40 kkal yozuv sanaladi.
- **Matnlar:** har guruhga 4 xil matn (uz/ru, ЎЗ — translit), navbat bilan. Tibbiy da'vo yo'q.
- **Joylashuv:** karta Bugun'dagi yagona karta o'rnida chiqadi va boshqa kartalar hamda kontekst chiplar bilan almashadi; shu safar hazil pufagi ham chiqmaydi.
- **Muqobil chiplar:** baliq/tovuq/dukkakli/tuxum (oqsil qoidasida — tovuq/baliq/tuxum/dukkakli). Chip bosilsa, qidiruv oynasi shu guruhning kunlik qoldiqqa sig'adigan taomlari bilan ochiladi.
- **Cheklovlar:** haftada ko'pi bilan 1 marta (`prefs.bx.last`). Birinchi 7 kunlik foydalanuvchiga chiqmaydi. «Bunday maslahat kerak emas» → `prefs.bx.off`; Profil → Eslatmalar → «Bir xillik maslahati» kalitida qayta yoqiladi.
- **Statistika:** `bixil.korsatildi.<guruh>`, `chip_bosildi`, `yopildi`, `ochirildi`, `yoqildi`. Admin → Harakat bo'limida `#bxRow` qatori.

## Testlar
`test-baza-mantiq` (a–i, guruh, qidiruv, qo'shimcha hisobi), `test-kalkifit-v87` (8 guruh), `test-yangilik` (oxirgi 3), `test-stat` (bixil).
