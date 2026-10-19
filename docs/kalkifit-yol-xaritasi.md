# KalkiFit — yo'l xaritasi (2026-10)

> Holatlar: **bor** (ilovada ishlaydi) · **bu ishda** (`yeymiz` branch'i) · **keyin** (reja, kod yo'q) · **hozir qilinmaydi** (sababi bilan).
> Bu hujjat qaror hujjati: yangi funksiya qo'shishdan oldin shu yerga qaraladi.

## 1. Pozitsiya

**«O'zingiz yoqtirgan ovqatlar bilan yaxshiroq ovqatlaning.»**

KalkiFit — odamning o'z dasturxoniga yordamchi: osh, somsa, kabob — va ularning *yaxshiroq varianti*. Ilova «nima yeyish kerak» deb o'rgatmaydi, parhez ham yozmaydi: odam allaqachon yeydigan taomdan boshlaydi, ilova esa shunga yaqin, oqsili ko'proq yoki kaloriyasi kamroq, lekin tanish ta'mli muqobil ko'rsatadi. Taklif — taklifligicha qoladi: baholash, ayblash, «zararli» demaslik, vazn/tana haqida gap yo'q.

Mahalliy haqiqat: O'zbekistonda baliqni ko'pchilik uyda pishirmaydi — kafe, choyxona, restoranda yeydi yoki yetkazib berish orqali buyurtma qiladi. Shashlik/kabob ham ko'pincha choyxonada. Shuning uchun tavsiya tartibi: **avval «qayerda yeyish / buyurtma qilish», keyin «uyda pishirish»**.

## 2. Ikki kirish nuqtasi qoidasi

Ilovada yangi imkoniyatlar uchun FAQAT IKKI kirish nuqtasi bor; yangi menyu, tab, doimiy karta qo'shilmaydi:

- **A) Taom yonida «Boshqa variantlar»** — porsiya oynasidagi mavjud «O'rniga» kartasining kengaytmasi.
- **B) Bugun ekranida «Bugun nima yeymiz?»** — bitta ixcham karta/tugma, «Ovqat qo'shish» tugmasidan pastroqda; asosiy yo'lni (qidir → porsiya → qo'sh) sekinlashtirmaydi.

Qolgan hamma narsa (baliq kuni oqimi, «Yemaydiganlarim» natijasi, retseptlar) shu ikkisining ichida, kerakli paytda ochiladi. Yangi funksiya bu qoidaga sig'masa — qo'shilmaydi.

## 3. Funksiyalar

| № | Funksiya | Holat | Sababi / izoh |
|---|---|---|---|
| 1 | **Boshqa variantlar** — «O'rniga» kengaytmasi: rasmli ro'yxat; filtrlar «Oqsili ko'proq · Kaloriyasi kamroq · Boshqa ta'm». Shashlik/kabob uchun choyxona porsiyali tovuq shashlik birinchi. | **bor (O'rniga) / bu ishda (kengaytma)** | «O'rniga» kartasi main'da (qoida: oqsil ≥ asl×0,90, yog'/kkal ≤ ×0,85, farq sezilarli). Kengaytma — A kirish nuqtasi. **«Hamyonbop» filtri YO'Q** — narx bazasi bo'lmaguncha (5-band). |
| 2 | **Retseptimni moslashtir** — oila retsepti → xilma-xil / oqsilini oshirish varianti. AI matnni tushunadi, raqamlarni baza hisoblaydi (AI hech qachon kkal «o'ylab topmaydi»). | **keyin** | Avval retsept bazasi va «chiqish og'irligi» ma'lumoti mustahkamlanishi kerak (4-bo'lim). A kirish nuqtasiga qo'shiladi. |
| 3 | **«Bugun nimaga ishtahangiz bor?»** — Kabob · Suyuq ovqat · Tandir · Tez tayyor · Baliq. Tanlansa 3 ta taklif: kunlik qolgan kaloriyaga sig'adigan, cheklovlarga mos, oqsil sifati yuqori. Baliq chipi → baliq kuni oynasi. | **bu ishda** | B kirish nuqtasining ichi. |
| 4 | **Baliq kuni → qayerda yeyish / buyurtma / uyda** — bitta oyna, uch bo'lim tartibda: (1) yetkazish xizmatlari, (2) kafe va choyxonada (kafe porsiyali baliq taomlari, bir bosishda yozish), (3) uyda pishirish (3 retsept → necha kishiga → masalliqlar → qadamlar → xarid ro'yxati). | **bu ishda** | Push, payshanba banneri va «Baliq» chipi shu oynani ochadi. Push (Web Push) va banner main'da. |
| 5 | **«Shu pulga nima tayyorlayman»** | **hozir qilinmaydi** | Ishonchli narx manbasi yo'q (bozor narxlari tez o'zgaradi, hududga qarab farq qiladi, rasmiy ochiq API yo'q). Noto'g'ri narx bitta kunda ishonchni buzadi; bunday xato hisob xatosidan qimmatroq. Manba paydo bo'lsa (hamkor yoki tekshiriladigan jadval) qayta ko'riladi. |
| 6 | **«Uyda boridan»** (muzlatgichdagi masalliqdan taom) | **keyin** | Retseptlar bazasi kengaygach (hozir ~60 retsept; qamrov kam bo'lsa taklif «hech narsa topilmadi» bo'lib qoladi). |
| 7 | **«Taom qoladi, yoniga mosini qo'sh»** (masalan oshga achichuk/qatiq) | **keyin** | Juftlik qoidalari (taom ↔ mos qo'shimcha) alohida ma'lumot ishi; A kirish nuqtasiga qo'shiladi. |
| 8 | **«Oilamizga yoqdi» xotirasi** — «Yana tayyorlaysizmi? Ha / Biroz o'zgartirib / Yo'q» + sabab. | **keyin** | Avval 2- va 4-band natijalari o'lchanadi; sabab javoblari qaysi muqobil ishlayotganini ko'rsatadi. Shaxsiy ma'lumot serverga ketmaydi (qurilmada). |
| 9 | **«Yemaydiganlarim»** — baliq/dengiz mahsuloti, tuxum, sut, yong'oq, glyuten, cho'chqa go'shti. | **bu ishda** | Hamma tavsiya (O'rniga, Boshqa variantlar, Bugun nima yeymiz, Baliq kuni) shu cheklovlarni hurmat qiladi. Standart: **halol** — cho'chqa go'shti hech qachon taklif qilinmaydi. Baliq yemaydiganga baliq kuni banneri ham, push ham yuborilmaydi (server obunada «baliqsiz» belgisi). |
| 10 | **Anonim hisoblagichlar** (shaxsiy ma'lumotsiz kunlik sonlar) | **bu ishda** | 6-bo'lim. |

## 4. Hisobning ishonchliligi

KalkiFit hisobi «chiroyli raqam» emas — tekshiriladigan usul. Tamoyil retsept hisoblashning umumiy usuli (FAO/INFOODS retsept hisoblash yo'riqnomalari va USDA tutilish/yield koeffitsientlari jadvallari): **masalliqlar xom vazni bo'yicha ozuqa moddalari yig'iladi, pishgandan keyingi jami vaznga (chiqish og'irligi, yield) bo'linadi.**

- **Xom / pishgan vazn.** Har masalliq xom yoki pishgan qiymat bilan alohida. USDA da juft yozuv bo'lsa (masalan guruch xom 168877 ↔ pishgan 168878), yield koeffitsienti avtomatik (xom/pishgan); bo'lmasa taxminiy (`taxmin`) deb belgilanadi va uyda tarozida tekshiriladi.
- **Suyak / teri.** Baliq, tovuq soni/qanot, qovurilgan sazan: qiymat *yeyiladigan* qism uchun. Teri qoldirilsa yog' qo'shiladi; suyak vazni porsiyaga kirmaydi (kafe porsiyasida «suyaklari bilan» emas, «yeyiladigan qismi» yoziladi).
- **Qo'shilgan yog'.** Qovurish/qozonda pishirishda yutilgan yog' alohida satr (retseptda `yog`), «yog' kam / odatiy / ko'p» omili sifatida; kafe va choyxona taomlarida odatiy yog' miqdori taxmin qilinadi va shunday belgilanadi.
- **Chiqish og'irligi.** Suvli taomlarda (sho'rva, osh) bug'lanish hisobga olinadi (`suv` satri `y` koeffitsienti bilan).
- **Aniqlik maqsadi ±15%.** Qoidalar va manbalar: `docs/baza-v2-reja.md`, `docs/baza-v2-natija.md`, `docs/baza-v2-tekshiruv.md`, hisob kodi `tools/baza-hisob.js`, retseptlar `data/baza-retseptlar.json`, masalliqlar `data/baza-masalliq.json` (USDA fdc_id + Скурихин).
- **Kafe/choyxona porsiyasi** — alohida turkum, doim «taxminiy, joyga qarab farq qiladi» izohi bilan (ⓘ Manba ichida, karta yuzida kichik «kafe» belgisi).

## 5. Narx haqida

Narx bazasi yo'q. Shuning uchun «hamyonbop», «arzon», «shu pulga» va'dalari hozircha **ilovada yo'q**; filtrlar faqat ozuqa qiymatiga asoslanadi (oqsil, kaloriya, ta'm yaqinligi).

## 6. Anonim hisoblagichlar va o'lchanadigan natijalar

Maqsad — funksiya ishlayaptimi yoki yo'qmi, shuni bilish; kimligini emas. Faqat kunlik sonlar (D1 `hisob_kun`: sana, hodisa, son); foydalanuvchi ID, IP, qurilma yozilmaydi.

Hodisalar: `orinbosar_korsatildi`, `orinbosar_tanlandi`, `baliq_oyna_ochildi`, `baliq_buyurtma_bosildi` (xizmat nomi bilan), `baliq_kafe_yozildi`, `baliq_uyda_ochildi`, `yeymiz_ochildi`, `yeymiz_tanlandi`.

**Biz nima va'da QILMAYMIZ:** «bozor narxiga ta'sir», «odamlar sog'lomroq bo'ldi», «baliq iste'moli oshdi» — buni ilova o'lchay olmaydi.
**Nimani o'lchaymiz:** muqobil ko'rsatildi → tanlandi (ulush), baliq kuni bosildi (push/banner/chip orqali), qaysi yo'l tanlandi (buyurtma / kafe / uyda), «Bugun nima yeymiz?» ochildi → taklif tanlandi. Natija oddiy matnli hisobot bilan (`tools/hisob-hisobot.js`): «O'rniga taklifi N marta ko'rsatildi, X% tanlandi».

## 7. Bosqichlar (bu ish)

0. Shu hujjat (kod yo'q).
1. Ma'lumot: «Yemaydiganlarim» teglari, kafe/choyxona porsiyali taomlar (baza-v2 qoidalari, manba, ±15%), yetkazish havolalari (`data/yetkazish.json`, haqiqatan ishlashi tekshirilgan), uyda 3 ta baliq retsepti (necha kishiga qayta hisob, xarid ro'yxati).
2. Interfeys va hisoblagichlar: «Yemaydiganlarim» (Profil + onboarding), baliq kuni oqimi, «Bugun nima yeymiz?», «Boshqa variantlar», anonim hisoblagichlar, maxfiylik bandi, `/api/hisob`.

Har bosqich oxirida hisobot va tasdiq; main'ga chiqarish faqat so'ralganda; yangiliklar yozuvi main'ga chiqqanda.
