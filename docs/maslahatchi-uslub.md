# Maslahatchi matnlari — uslub standarti (v105)

Bu hujjat KalkiFit maslahatchisi (Lola, Malika, Timur, Sardor, Barsik, Robi yoki foydalanuvchi bergan ism) va «Haftangiz»/hazil pufaklari uchun yoziladigan HAR BIR yangi matnga standart.
Manba: `data/maslahatchi-matn.json` (uz/ru × hazil/jiddiy × kalit → variantlar) → `node tools/maslahat-matn-yasa.js` → `assets/kalkifit-maslahat-matn.js`.
Hazil pufaklari: `data/hazillar.json`. Avtomatik tekshiruv: `tools/maslahat-uslub.cjs` (taqiqlangan iboralar, uzunlik, emoji) — `test-maslahatchi`, `test-kalkifit-hazil` va `node tools/maslahat-uslub.cjs <fayl.json>`.

## Asosiy qoida: o'zbekcha TUG'MA yoziladi

- Matn avval o'zbekcha o'ylanadi va yoziladi. Ruschadan tarjima QILINMAYDI (ru matni ham alohida, tabiiy ruscha yoziladi).
- **Telegram sinovi:** har matnni «o'zbek do'stimga Telegramda shunday yozarmidim?» deb tekshiring. Yo'q bo'lsa — qayta yozing.
- Oddiy so'zlashuv tili. 1–2 qisqa gap (≈ 140 belgigacha; maksimum 200).
- Raqam va aniq taom bilan: «yog' 25 g ortiq», «100 g tovuq ko'kragi», «qozon-kabob».
- Metafora — ko'pi bilan bitta va darhol tushunarli. O'qib «nima demoqchi?» deb o'ylatadigan gap — XATO.
- Kamsitmaydi, aybdor qilmaydi, tana/vazn/tashqi ko'rinish ustidan kulmaydi; tibbiy qo'rqitish yo'q.
- Sarlavhalar ham oddiy: «Yog' me'yordan +25 g», «Oqsilga yana 40 g».

## Hazil va jiddiy

- **Hazil** — hayotiy vaziyat hazili: qozon-kabob, to'y, choyxona, oshxona, ish kuni, marshrutka, bozor, mehmondorchilik. Emoji 0–1 (😄 💪 🙂 👍 🍵 kabilar). Hazil vaziyatga, odatga, taomga — odamga emas.
- **Jiddiy** — qisqa, aniq, do'stona maslahat; emoji yo'q.
- Hazil va jiddiy variantlar bir-biridan sezilarli farq qiladi (so'z o'xshashligi ≤ 50 %).
- Har kalit uchun **3 ta yaxshi variant** yetadi — miqdordan sifat muhim.

## Persona

Maslahatchining ismi `{ism}` sifatida matnga qo'yilishi mumkin; ohang tabiiy qoladi. Masalan, foydalanuvchi maslahatchini «Holms» deb atasa, uning gapi shunday eshitilishi mumkin:
«Iz topildi: yog' bugun 25 g ortiq. Asosiy gumondor — qozon-kabob.» — lekin metafora bitta va darhol tushunarli.
Ruscha matnlarda maslahatchi o'zi haqida o'tgan zamonda gapirsa — jinsga mos shakl `{ayol|erkak}`: `{рада|рад}`, `{сделала|сделал}`.

## Til aralashuvi (QAT'IY)

- uz (lotin) rejimida kirill harfi yo'q; ЎЗ rejimida (sahifa o'zi transliteratsiya qiladi) lotin so'z yo'q; ru rejimida o'zbekcha-lotin so'z yo'q.
- Taom nomi — DOIM joriy tilda (`nameOf()`/`locName()`): uz «anor», ru «гранат».
- Maslahatchi ismi — joriy yozuvda (uz Lola / ЎЗ Лола / ru Лола; foydalanuvchi bergan ism — uz rejimida lotinda, ru/ЎЗ da kirillda ko'rsatiladi, saqlangan qiymat o'zgarmaydi).
- Shahar nomlari: uz «Qarshi — Muborak», ru «Карши — Мубарек».
- Istisno: brendlar va birliklar (`assets/translit.js` `DEFAULT_ABBR`: KalkiFit, AI, Google, Telegram …).
- Tekshiruv: `tools/dizayn/test-til-aralash.mjs` (ekranlar, oynalar, Haftangiz slaydlari, ulashish rasmlari, push, maslahatchi matnlari — uchta rejimda).

## Taqiqlangan sun'iy iboralar (testda)

Ro'yxat — `tools/maslahat-uslub.cjs` (`TAQIQ`). Misollar:
«oqsil rasmi to'liq», «yog' prognozi … issiq», «yog' shovqinidan so'ng sokin musiqa», «eshik qoqishi», «jumboqning so'nggi bo'lagi», «to'qlikka sust xizmat qiladi», «men ham bormanku», «orkestr», «dirijyor», «mergan», «zargar o'lchagandek», «soqchilik», «qalqon», «jomadon», «dars qoldirdi», «xazina», «sahnaga chiqdi»;
ru: «нервно курит», «в лёгком шоке», «помахали рукой», «собрали чемоданы», «прогноз … жарк», «последний кусочек пазла», «оркестр», «дирижёр», «сокровищ».

## Namunalar

| | Matn |
|---|---|
| ❌ YOMON | Yog' bugun «men ham bormanku!» dedi (+25 g); u to'qlikka sust xizmat qiladi, shuning uchun kechki ochlik eshik qoqishi mumkin. |
| ✅ hazil | Yog' bugun 25 g ortiqcha — qozon-kabob o'z ishini qildi 😄 Kechqurun 100 g tovuq ko'kragi va bodring salati — ham to'q, ham yengil. |
| ✅ jiddiy | Yog' me'yordan 25 g oshdi. Kechki ovqatga yog'siz oqsil tanlang: 100 g tovuq ko'kragi va 150 g bodring. |
| ❌ YOMON | Jumboqning so'nggi bo'lagi — anor. Oqsil rasmi to'liq: 161 g. |
| ✅ | Oqsil rejasi bajarildi — 161 g. Barakalla! 💪 |
| ❌ sarlavha | Yog' prognozi: +25 g issiq |
| ✅ sarlavha | Yog' me'yordan +25 g |

## Texnik qoidalar

- Placeholder'lar (`{x}`, `{src}`, `{name}` …) — faqat shu kalitga ilova beradiganlar (`tools/dizayn/test-maslahatchi.mjs` `DATA`). Raqamli kalitda raqam doim matnda bo'ladi.
- `{src}` — kichik harfli taom nomi(lar)i; gap boshida `{Src}`.
- Taqiqlangan so'zlar (`BAN`): semiz, ozg'in, qorin, vazningiz, tanangiz, kilo, «halol», cho'chqa … (test ro'yxati).
- Ruscha sonlar: «{n} дней» yozing — `plRu` o'zi «1 день / 3 дня / 5 дней» qiladi.
