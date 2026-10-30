# Bazani kengaytirish (v64) — tahlil va 1-bosqich

Maqsad: o'zbekistonlik foydalanuvchi yozadigan narsalarning 95%+ topilsin. Qoida: har qiymat manbadan (USDA FDC id / ishlab chiqaruvchi yorlig'i — Open Food Facts shtrix-kodi / aralashma hisobi → «taxminiy»), AI kkal o'ylab topmaydi.

## Tahlil (2026-10-30)
- D1 `qidiruv_topilmadi` (22-oktyabrdan): 65 so'z, 67 marta; v63 bazasida 46 tasi topilardi, 1-bosqichdan keyin **57** (qolganlari: «g'ilak», «pamil» — ma'nosi noaniq, «пич» — chala yozilgan, «qatiq zig'ir» — ikki mahsulot bir so'rovda).
- D1 `taklif` (AI tanigan va foydalanuvchi saqlagan, bazada yo'q): 86 nom — choy turlari (navvot, limon), non turlari (tuyur, bozor, yarimta), tuxum sarig'i, ko'k olma, golubika, «ekra», sariyog'li sut, makaron palov, sdoba, Sezar roll, hot-dog.
- Baza: 738 yozuv (697 asosiy + 41 alias); toifalar — shirinlik 123, go'sht/baliq 103, milliy 101 (96 taxminiy retsept), ichimlik 65, sabzavot 55, fast-food 50, meva 42, don 38, sut 36, boshqa 33, yong'oq 32, non 19. Manba: USDA ~65%, retsept/hisob ~21%, yorliq ~5%.
- Generic (tur bo'yicha) ikonka: 149 (sabzavot 54, meva 35, don 26, sous 19…) — ular `data/ikonka-reja.txt` da rejalashtirilgan, rasm to'plami yaratilmagan.

## Reja
1. **1-bosqich (v64):** ma'lumotdagi bo'shliqlar va kundalik dasturxon — choy turlari, non/xamir, uy sho'rvalari va taomlari, salatlar, tuxum qismlari, bedana, xom dukkak/yormalar, sutli bo'tqalar, alkogol (umumiy), mahalliy meva/urug'lar; sinonim va imlo (quruq choy, kurasan, tuyur non, golubika → chernika…).
2. **2-bosqich:** do'kon brendlari (yorliq/OFF: shokolad batonchiklar, pechenye, chips, muzqaymoq, yogurt/tvorog/kefir — mahalliy va import), ichimlik brendlari (energetiklar, sharbatlar), fast-food (brend faqat rasmiy qiymat bilan, aks holda umumiy nom «taxminiy»), sport ovqati.
3. **3-bosqich:** meva/sabzavot/poliz navlari, quruq meva va yong'oqlar, dukkak/makaron qolganlari; ikonka to'plamlari (generic → aniq).

## 1-bosqich natijasi
- **68 ta yangi taom** (`tools/ovqatlar-kengaytma2.js`): USDA 33 · yorliq 3 (Tarxun «Черноголовка», baqlajon ikrasi «Лукашинские», qovoqcha ikrasi «Zajamnae») · aralashma hisobi (taxminiy) 32.
- **Sinonim** (`tools/ovqatlar-alias.json`): choy, non, chernika (golubika), kruassan (kurasan), pankeyk (oladi), jarkop (jarkoe), suv (mineral/gazli), kompot (uzvar), suzma (chakka), shashlik-tovuq (jo'ja), bulochka-darchin (mayizli).
- Yangi birliklar: ryumka, bokal. Yangi USDA id lar: `python3 tools/usda-qoshimcha.py <SR Legacy zip>`; yorliq: `node tools/yorliq-qoshish.js <kalit> <shtrix-kod>`.
- Ikonka: 42 ta yangi taom mos mavjud rasm bilan; 26 tasi rejalashtirilgan — `docs/ikonka-toplam-v64.txt` (30 ikonka, 2-bosqichda 42 taga to'ldiriladi).
- Qo'shilmadi: do'lana, jiyda (USDA/OFF da manba yo'q), «Barkosay», «Abet non», «Barbeliak» (AI uydirgan nomlar), Samarqand noni alohida (manbali qiymat yo'q — «non» sinonimi), kalla-pocha (ishonchli manba yo'q).
- Testlar: `tools/dizayn/test-baza1.mjs` (`--only baza1`) — sxema, manba, Atwater ±15% (alkogol istisno), qidiruv (207 so'rov), «topilmadi» 31 so'rov, regressiya 23 so'rov, takror yo'q, cho'chqa tegi, ikonka.
