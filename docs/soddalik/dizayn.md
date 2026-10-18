# KalkiFit vizual dizaynini to'liq yangilash (branch `soddalik`, main'ga chiqarilmagan)

Faqat ko'rinish: mantiq va ma'lumot formati o'zgarmadi. Maket (`Main/Qoshish/Porsiya`) bo'yicha ranglar, o'lchamlar, SVG to'lqin yo'li (`mk()`), clipPath'li ikki qatlamli matn va animatsiya vaqtlari aynan ko'chirildi — `test-kalkifit-soddalik` (guruh 10b) ularni hisoblab solishtiradi.

Skrinshotlar (360 px): `dizayn/dark.png`, `dizayn/light.png` (Bugun ×3 qism, Qo'shish, Porsiya yopiq/ochiq, Kundalik, Natijalar, Profil), `dizayn/idish-animatsiya.png` (idish: 0 s · 0,9 s · 1,8 s, ikkala mavzu).

## Taom rasmlari → `assets/ovqat/<nom>-128.webp`, `-256.webp` (42 × 2, sarlavha o'lchami testda tekshiriladi)
| Rasm | Bazadagi id | Izoh |
|---|---|---|
| anor, ayron, banan, burger, chuchvara, dimlama, guruch, kartoshka-fri, lagmon, manti, mastava, moshxorda, navvot, norin, olivye, olma, osh, patir, pitsa, qatiq, qatlama, qovun, qovurdoq, qozon-kabob, shashlik, suzma, tarvuz, tuxum, uzum, xurmo | xuddi shu id | 30 ta aniq moslik |
| somsa-gosht / somsa-qovoq | `somsa` (oila), `somsa-qovoq`, `somsa-qat` | ichi «qovoq» bo'lsa qovoqli, qolgani go'shtli rasm |
| obi-non | `non` (obi), `patir`/`qatlama` o'z rasmlari | buxanka va qora non — rasmsiz (harfli tile) |
| qora-choy | `choy`, `choy-shakar`, `choy-sut` | |
| kok-choy | `yashil-choy` | |
| shorva | `shurva`, `tovuq-shurva` | |
| lavash | `lavash-tovuq`, `lavash-mol`, `lavash-roll` | rasm — shaurma; yupqa non (`lavash-non`) rasmsiz |
| hot-dog / chak-chak / achchiq-chuchuk | `hotdog` / `chakchak` / `achichuk` | |
| tovuq | `tovuq-son`, `tovuq-qov` | rasm — tovuq oyog'i; ko'krak/qanot/jigar rasmsiz |
| **holva** | **mos kelmadi** | bazada xolva/halva taomi yo'q — fayl qo'shildi, lekin hech qaysi id'ga ulanmagan |

Rasmi yo'q taomga — nomining bosh harfi bilan rangli tile (mapping: `IMGS`/`imgFile()` — `assets/kalkifit-app.js`).

## Maketdan farqlar (sababi bilan)
- **Matn ≥14 px** (maket 12–13 px): repoda doimiy qoida (`test-qadam`) va AA; «Qoldi» yorlig'i 14 px.
- **Tugmalar ≥44 px**: avatar 44 (maket 40), ovqat vaqti segmenti 44 (36), «+ 250 ml» 44 (40), chiplar 44 (36).
- **Och mavzuda accent matn rangi** `#B93A0A` (AA: #FF6B4A oq fonda 2,8:1); to'ldirilgan tugma/FAB/idish — maketdagi `#FF6B4A` + `#1A0A05`.
- **Yuqori panel** (Kalki.uz va til tugmasi) saqlandi — maket sarlavhasi uning ostida; sayt/PWA tuzilmasi (`test-ilovalar-ui`) shuni talab qiladi.
- **Avatar** harfi — «K» (ma'lumotda ism yo'q); bosilsa Profil ochiladi.
- **Yedingiz · Maqsad · Yoqildi**: Maqsad — asosiy me'yor, Yoqildi — qadamdan sof qo'shimcha (yashirin bo'lishi mumkin), «Qoldi» = Maqsad + Yoqildi − Yedingiz (maketdagi 1 033 raqami bu hisobga mos emas edi).
- «Gazak» → **«Tamaddi»** (maket nomi).
- Bo'limda ☆ Saqlash va «+» ikonka tugmalari (maketda yo'q; funksiyalar saqlanishi uchun), qadam kartasi bosilsa qadam kiritiladi (tushuntirish — Natijalar'da).
- Oxirgilar `[+]` oynani yopmaydi (maketdagidek ✓ bo'ladi, 3 s «Bekor qilish»).
- Ovqat vaqti qo'shish oynasi tepasida segment; porsiya oynasida o'zgartirish — «Turi va hajmi» ichida.
- Manrope allaqachon sahifada (Google Fonts, `display=swap`); endi `sw.js` shrift CSS/fayllarini ham keshlaydi, 128 px rasmlar oldindan keshlanadi.

## Tekshiruv
`npm run test:tez` (sw.js o'zgargani uchun to'liq to'plam, 41,3 daqiqa) — hammasi o'tdi, qayta yurgizish kerak bo'lmadi. Moslashtirilgan: kalkifit, qidiruv, porsiya, odatdagi, baza, idish, yangilik, zaxira, install, migrate, ilovalar-ui, soddalik (yangi guruhlar: maketga moslik, taom rasmlari). axe (kontrast/tugma nomi/yorliq) 0 xato — 4 ekran + oynalar × (Avto-och, Avto-qorong'i, Och, Qorong'i); 360 px, katta shrift va klaviatura ochiq holat; RU/ЎЗ'da lotincha so'z yo'q.
