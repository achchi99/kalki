# Testlar: tezlik (tools/testlar.js)

## Ish tartibi (CLAUDE.md «Ish tartibi»)
- Preview tarmog'ida: faqat tegishli testlar `node tools/testlar.js tez --only <id>` + `npm run check:sw`. To'liq `test:tez` YO'Q.
- To'liq `test:tez` — faqat `main`'ga merge qilishdan oldin, bir marta (reliz darvozasi); yiqilganlar tuzatilib, faqat ular qayta yuritiladi.
- Yurish vaqtida repo fayllarini O'ZGARTIRMANG (CLAUDE.md ham): `verify-all` 24-band butun repo barmoq izini solishtiradi va yiqiladi.

## Nima o'zgardi
1. **Bo'laklash (shard).** `pages`, `kontrast`, `kontrast-katta`, `katta`, `golden`, `qadam` slug bo'yicha mustaqil jarayonlarga bo'linadi (interleaved).
   Natija jadvalida bitta test sifatida chiqadi; `--only kontrast` avvalgidek ishlaydi. Oldin `kontrast` (~23 daqiqa) butun yurishning eng uzun zanjiri edi.
2. **Yukga qarab parallel.** Kamida 3 (`TEST_JOBS`), ko'pi bilan 5 (`TEST_JOBS_MAX`) jarayon. Yangisi faqat bo'sh CPU ≥ 20 % (`TEST_IDLE_MIN`) va bo'sh xotira ≥ 1500 MB (`TEST_MEM_MIN`) bo'lsa, oldingisidan 4 s keyin qo'shiladi.
   Bir-biriga bog'liq testlar (`mutex: 'repo'` — repo fayllariga yozadigan `sticky`, `v2`, `pwa` va repo barmoq izini tekshiradigan `verify-all`) hech qachon birga yurmaydi.
3. **Kontrast: bitta yuklash.** Ilgari «boshlang'ich» va «hisoblangan» holat uchun sahifa ikki marta yuklanardi; endi bitta yuklashda ketma-ket (natija bir xil). Sahifa yuklashlari 4 → 2 (`kontrast`, `kontrast-katta`); 4 ta sahifada o'lchov: 20,8 s → 13,7 s, CPU 7,2 s → 4,7 s.
4. **Tartib haqiqiy vaqt bo'yicha.** `tools/testlar-vaqt.json` — oxirgi to'liq yurish vaqtlari (eng uzun test birinchi). Yangilash: `node tools/testlar.js toliq --yangila-vaqt`.
5. **O'lchov.** Har testning vaqti va CPU'si jadvalda; `node tools/testlar.js sekin` — oxirgi yurishdagi eng sekin 10 ta.
6. Umumiy server/brauzer: o'lchandi — `chromium.launch()` ≈ 0,2 s, kontekst+sahifa ≈ 0,1 s, yopish 0,05 s; statik server ≈ 0 s. Ya'ni testga ~0,4 s: umumiylashtirish qamrovni xavf ostiga qo'yadi, foydasi ~1 daqiqa. Shuningdek umumiy kontekst va rasm/shrift bloklash ham sinab ko'rildi — farq o'lchov xatosi ichida (24 yuklash: 28,4 s / 27,8 s / 28,0 s). Shuning uchun qilinmadi.

## Eng sekin 10 ta (to'liq yurish, bo'laklashdan oldingi/keyingi yig'indi vaqt)
| # | test | yig'indi | sabab |
|---|------|---------:|-------|
| 1 | kontrast-katta | 961 s (oldin 1372 s, bir jarayon) | 83 sahifa × UZ/RU × 390/1280 — axe-core `color-contrast` (og'ir) ikki holatda; endi 4 bo'lak |
| 2 | kontrast | 835 s (oldin 1379 s) | xuddi shu, oddiy shrift |
| 3 | kalkifit | 729 s | ~170 ta qo'lda kutish (`waitForTimeout` ≈ 93 s), 8 kontekst, bitta jarayonda ketma-ket; CPU kam (60 s) — kutish tufayli |
| 4 | verify-all | 545 s (CPU 234 s) | prerender barqarorligi (ikki marta qurish), `git ls-files` skanlari, bitta sinxron jarayon; `mutex: repo` |
| 5 | golden | 387 s | har slug uchun kalkulyatorlar to'ldirilib hujjat matni solishtiriladi; endi 3 bo'lak |
| 6 | pages | 338 s | 83 × 2 × 4 o'lcham yuklash (320/390/768/1280) + emoji/til tekshiruvi; 4 bo'lak |
| 7 | kalkifit-soddalik | 283 s | 69 kutish (29 s), 6 kontekst, 360/katta shrift/klaviatura kombinatsiyalari |
| 8 | prognoz | 266 s | 460 qatorli sinov, 4 kontekst, hisoblash qadamlari |
| 9 | zaxira | 266 s | 58 kutish (42 s): zaxira nusxa/tiklash oqimlari |
| 10 | rozgor | 243 s | 73 kutish (40 s), 6 kontekst |

## Natija
(Quyida to'liq yurish vaqtlari — «Natija» bo'limi yurishdan keyin to'ldirilgan.)
