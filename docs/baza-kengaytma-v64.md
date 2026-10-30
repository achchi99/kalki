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

## 2-bosqich natijasi (v65)
- **54 ta yangi mahsulot** (`tools/ovqatlar-kengaytma3.js`): brend 47 (hammasi Open Food Facts shtrix-kodli yorliq bilan, `data/manba/yorliq.json`) · fast-food 5 + sous 2 (USDA tayyor taomi / aralashma — «taxminiy»).
- Toifalar: shokolad/konfet 17 (Raffaello, Ferrero Rocher, Merci, Toffifee, Toblerone, Lion, Haribo, Chupa Chups, Roshen ×2, «Мишка косолапый», Grilyazh, Alpen Gold ×2, Milka funduqli, Snickers oq/Krisper), gazak 4 (TUC, Belvita, Cheetos, Kirieshki), ichimlik 7 (Mirinda, Lipton Ice Tea, Rich, J7, Flash Up, Gorilla, Burn), sut 13 (Activia, Danissimo, Chudo, Agusha, Ehrmann ×3, President ×3, Valio ×2, «Домик в деревне»), muzqaymoq 1 (Inmarko), sport 5 (Protein Rex ×2, Fit Kit, Optimum Nutrition whey, Nesquik), fast-food 7.
- **O'zbekiston bozori:** OFF'da «Uzbekistan» belgili 440 mahsulot bor, lekin faqat 35 tasida kkal yozilgan; mahalliy brendlar (Danon Berkut, Montella, Krember, Tanho, N'medov, Chipsella, Ittfoq, Flash) — OFF'da yorlig'i yo'q, qo'shilmadi. Import brendlar — Rossiya/Qozog'iston/Yevropa bozoridagi bir xil formula yorlig'i.
- **Fast-food tarmoqlari** (Evos, Max Way, Oqtepa Lavash, Bellissimo, KFC Uzbekistan) — rasmiy kkal/BJU e'lon qilmagan (evos.uz da yo'q, kfc.com.uz yopiq) → brend nomi ishlatilmadi, faqat umumiy nom.
- Takror yaratilmadi: Bounty (mavjud «Bounty turi»), stripslar (mavjud «Tovuq bo'laklari»), chikenburger (mavjud «Tovuqli sendvich») — sinonim. Suv brendlari (Bonaqua, Hydrolife, Nestle Pure Life, Montella) — «Suv» sinonimi.
- «pamil» — tekshirildi (choy brendi/navi topilmadi), sinonim qilinmadi.
- **Ikonka vositasi** (`tools/ikonka-toplam.js`) qayta yozildi: holat hozirgi ilova xaritasidan, yashirin taomlar xato emas, rasmi bor to'plam fayllari o'zgarmaydi; `--tekshir` (test uchun). Natija: generic **172** taom → **152** yangi ikonka, 4 to'plam: `docs/ikonka-toplam-8…11.txt` (42+42+42+26; oxirgisi 6×5), jadval — `docs/ikonka-jadval.md`.
- Test: `tools/dizayn/test-baza2.mjs` (`--only baza2`).

## 3-bosqich natijasi (v66)
- **33 ta yangi taom** (`tools/ovqatlar-kengaytma4.js`): USDA 32 + 1 yaqin analog (jusay — USDA «chives», «taxminiy»). Meva 3 (laym, liči, marakuya), quruq meva va urug' 7 (qoq xurmo, olcha qoqi, quritilgan mango, sariq mayiz, qovurilgan kungaboqar/qovoq urug'i/kunjut), sabzavot va ko'kat 17 (sholg'om xom/qaynatilgan, rovoch, qoqi, jusay, rayhon, yalpiz, topinambur, qizil/pekin/pak-choy/bryussel karam, patisson, artishok, selderey ildizi, ko'k pomidor, mosh nihollari), dukkak va makaron 6 (soya, pallali no'xat, oq loviya, butun donli makaron xom/pishgan, tuxumli lapsha xom).
- **Sinonim (takror emas):** alcha → olxo'ri; turshak, qaysi, urük → quruq o'rik; devzira, lazer, alanga → xom guruch; torlama, ich-kizil, shakarpalak, bo'rikalla, gulobi, handalak → qovun; karpuz → tarvuz; soyaki mayiz → mayiz. Qovun turlari alohida qiymat bilan qo'shilmadi (USDA'da navlar bo'yicha ajratilmagan).
- Qo'shilmadi: jiyda, do'lana, zarang (manba yo'q).
- Yangi birliklar: bog' (пучок), barg (лист).
- Ikonka: generic 202 → rejada 174 yangi ikonka, 4 to'plam (`docs/ikonka-toplam-8…11.txt`: 42 + 42 + 42 + 48 (6×8)).
- Test: `tools/dizayn/test-baza3.mjs` (`--only baza3`); laym — USDA sitrus Atwater omillari (istisno, testda izohli).
