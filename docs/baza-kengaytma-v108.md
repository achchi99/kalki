# KalkiFit v108 — sushi, kimbap, beze (2026-11-28)

So'rov: «bazada yo'q: sushi, kimbap, beze». Tekshiruv natijasi: sushi **qisman bor edi** (nigiri-losos, Filadelfiya, Kaliforniya, tempura, maki-bodring, soya sousi, zefir). Mavjud qatorlar (id, kkal) **o'zgartirilmadi** —
eski yozuvlar buzilmasin; yetishmayotganlari qo'shildi, mavjudlariga «set» birligi va sinonimlar berildi.

## Qo'shilgan taomlar (12)

Qiymat — USDA FDC SR Legacy komponentlari bo'yicha standart retsept («Retsept hisobi», `tools/retsept-v108.js`), qo'lda raqam yo'q. Hamma qatorda ✓ «taxminiy» belgisi (±15 %).

| Taom (id) | kkal/100 g | Birliklar | kkal / birlik |
|---|---|---|---|
| Maki roll, losos (`roll-maki-losos`) | 145 | dona 25 g · set 200 g · porsiya 150 g | 36 · 290 · 218 |
| Roll Ugor/unagi (`roll-ugor`) | 147 | dona 30 g · set 240 g | 44 · 353 |
| Pishirilgan (zapechonniy) roll (`roll-pishirilgan`) | 227 | dona 30 g · set 240 g | 68 · 545 |
| Nigiri, tunets (`nigiri-tunets`) | 134 | dona 30 g · set 240 g · porsiya 150 g | 40 · 322 · 201 |
| Nigiri, ugor (`nigiri-ugor`) | 157 | dona 30 g · set 240 g · porsiya 150 g | 47 · 377 · 236 |
| Sashimi, losos (`sashimi-losos`) | 208 | gramm | 100 g = 208 |
| Imbir marinadi/gari (`imbir-marinad`) | 73 | osh qoshiq 15 g | 11 |
| Vasabi (`vasabi`, USDA «Wasabi, root, raw») | 109 | choy qoshiq 5 g | 5 |
| Kimbap klassik (`kimbap-klassik`) | 147 | bo'lak 20 g · rulet 180 g | 29 · 265 |
| Kimbap tunets-mayonez (`kimbap-tunets`) | 174 | bo'lak 20 g · rulet 180 g | 35 · 313 |
| Kimbap bulgogi (`kimbap-bulgogi`) | 157 | bo'lak 20 g · rulet 180 g | 31 · 283 |
| Beze (`beze`) | 386 | dona 10 g · kichik 5 g · katta 15 g | 39 · 19 · 58 |

Mavjud (o'zgartirilmagan qiymat, «set» qo'shildi): Nigiri losos 153 (dona 30 · set 240), Filadelfiya 178 (30 · 240), Kaliforniya 182 (30 · 240), Tempura roll 213 (35 · 280), Maki bodring 115 (25 · 200).
Soya sousi (`soya-sous`, 1 osh qoshiq = 15 g, 8 kkal) — mavjud edi, sinonimlar qo'shildi.

**«set» = 8 dona** (dona og'irligi × 8). Yangi birlik kalitlari: `set` («set (8 dona)» / «сет (8 шт.)»), `rulet` («butun rulet» / «целый ролл»); matnda: «sushi set», «2 сета филадельфия», «3 кусочка кимбап».

## Hisob

- **Sushi guruchi:** pishgan guruch (USDA 168878) + sirka (172237) + shakar (169655): 100 g guruchga ≈ 2,5 g shakar, 4 g sirka (mavjud rollar bilan bir xil).
- **Pishirilgan roll:** guruch 48 · losos 15 · krem-pishloq 9 · motsarella 6 · mayonez 8 · bodring 8 · nori 2 (g) → pishirishda ≈ 9 % namlik yo'qotish (chiqish 91 g).
- **Tempura va pishirilgan roll** oddiy rollardan kaloriyali: tempura — qovurilgan xamir va mayonez, pishirilgan — krem-pishloq, motsarella, mayonez. Mantiq testi (`tools/test-sushi.js`): har ikkisi 100 g, 1 dona va 1 set bo'yicha oddiy rollar (Filadelfiya, Kaliforniya, maki, ugor) dan ko'p, yog'i ham ko'p.
- **Kimbap:** guruch + tuxum omleti, kolbasa (USDA «Bologna, turkey»), sabzi, ismaloq, sarg'ish turp (danmuji), bodring, nori, kunjut moyi. Tunets-mayonez — konserva tunets + mayonez; bulgogi — soya sousi, shakar va kunjut moyida marinadlangan mol go'shti.
- **Beze:** klassik nisbat — 100 g tuxum oqi + 200 g shakar; quruq modda 212,4 g, tayyor namlik ≈ 1 % → 214 g → **386 kkal/100 g**. So'rovdagi ~390–400 dan sal past: USDA komponentlaridan nazariy yuqori chegara (namliksiz) ≈ 389 kkal. Namlik 0 → 389, 3 % → 377.
- **Imbir marinadi:** imbir 65 · shakar 5 · sirka 10 · suv 20 (g); marinadlashda shakar/suv almashinuvi hisobga olinmagan — haqiqiy qiymat past bo'lishi mumkin.
- **Vasabi:** USDA «Wasabi, root, raw»; do'kon pastalari ko'pincha xren asosida — taxminiy.

## Qidiruv

Har sinonim to'g'ri taomni BIRINCHI topadi (`tools/test-sushi.js`, 90 ta so'rov):
- суши, sushi, nigiri, нигири → Nigiri (losos); роллы, ролл, roll, rol, rull, калифорния → Kaliforniya (popularlik tartibi: lavash-roll «ролл» da endi ikkinchi; «lavash roll», «лаваш ролл» — o'zgarmagan);
- филадельфия → Filadelfiya; запечённый/запеченный ролл, pishirilgan roll, zapechenniy → Pishirilgan roll (avval Tempura sinonimida edi); maki, маки → Maki roll (losos); tempura → Tempura roll;
- ugor, unagi, угорь, ilonbaliq → Roll Ugor; nigiri tunets/ugor, sashimi, сашими; васаби, vasabi; имбирь маринованный, imbir marinadi, gari; соевый соус, soya sousi, shoyu;
- кимбап, кимпаб, gimbap, kimbab, kimpab → Kimbap klassik; «кимбап с тунцом», «bulgogi kimbap» → tegishli turi;
- безе, меренга, meringue, beze, merenga → Beze.

**Zefir va beze.** «зефир»/«zefir» natijasi o'zgarmagan (zefir, choko-pie). «безе» → faqat beze, ostida «Balki: shularni nazarda tutdingizmi?» va **Zefir** qatori. Mexanizm: taomda `bl: ['zefir']` (yaqin taom id'lari, `tools/ovqatlar-build.js` `BL`); ilova (`resultsHtml`) birinchi natijada `bl` bo'lsa, ro'yxat oxiriga taklif qo'shadi. Teskarisi (zefir → beze) yo'q.

Matn/ovoz/AI (`parseText`): «sushi set» → 1 set nigiri (240 g); «kichik/katta beze» → 5/15 g; «кусочка/кусочек» → bo'lak. «set» faqat «set» birligi bor taomda birlik bo'ladi.

## Teglar, guruh, kletchatka

- Yemaydiganlarim (ehtiyotkor): baliq (losos, tunets, ugor, kimbap-tunets), tuxum (beze, pishirilgan roll, kimbap), sut (pishirilgan roll), glyuten (ugor — teriyaki sousi, kimbap-bulgogi — soya sousi). **Cho'chqa tegi yo'q** (qoida: faqat bekon va pepperoni); matnlarda cho'chqa/«halol» yo'q.
- Oqsil manbasi: baliq / aralash / qizil / tuxum — retsept oqsilidan (`tools/oqsil-teglar.js` qoidasi).
- Guruh (bir xillik maslahati): sushi — guruch+baliq, sashimi — baliq, kimbap — guruch + (tuxum | baliq | qizil go'sht), beze — shirinlik, imbir/vasabi — boshqa.
- Kletchatka: hamma yangi taomda manbali (USDA `fib`); kimbap uchun guruch 168878 (168882 da kletchatka yo'q).
- USDA: `data/manba/usda-sr-legacy.json` ga 6 ta id qo'shildi (170846 motsarella, 174194 ilonbaliq, 173706 tunets, 168583 vasabi ildizi, 173423 qovurilgan tuxum, 168710 mol go'shti).
- Ikonka: `data/ikonka-reja.txt` (`v108-*`, 12 ta) → `docs/ikonka-toplam-19.txt` (to'plam 16–18 yangilandi: v107 da alias bo'lgan taomlar rejadan chiqdi).

## Testlar

`tools/test-sushi.js` (manba, birliklar, mantiq, teglar, 90 qidiruv, matn), `tools/dizayn/test-sushi-ui.mjs` (set/rulet/kichik-katta chiplari, «Balki» taklifi, 320 px matn 130 %). Eski testlar yangilandi: bazadagi taom/oila soni.
