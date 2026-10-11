# Service worker yangilanishi: eski versiya keshda qolishi (2026-10)

## Muammo
Foydalanuvchining oddiy brauzerida `kalki.uz/ariza-namunasi` da AI blokining ESKI versiyasi ko'rindi (6-bosqichdan oldingi), maxfiy tabda yangisi. Deploy ~1 soat oldin bo'lgan.

## Tekshiruv natijalari
1. **sw.js tuzilishi.** `SW_VERSION` = `assets/` ichidagi `.js/.css/.json` fayllar mazmunining sha1 hash'i (`tools/sw-version.js`; `ai-ariza.js`/`ai-promo.js` hash'ga kiradi, `sw.js` esa har assets o'zgarganda yangilanadi). `install` → `skipWaiting`, `activate` → eski keshlarni o'chiradi + `clients.claim` — **bor edi**. HTML: network-first (oflaynda keshdan); `assets/*.js|css`: stale-while-revalidate; rasm: cache-first; qolgani SWR.
2. **Cloudflare sarlavhalari (tuzatishdan oldin).** `sw.js` va `assets/*.js`: `Cache-Control: public, max-age=14400, must-revalidate` (4 soat!, Pages sukuti); HTML: `max-age=0, must-revalidate`.
3. **Ro'yxatdan o'tkazish.** `assets/sw-boot.js`: `register('/sw.js')`; `controllerchange` da faqat foydalanuvchi maydonga tegmagan va fayl yasalmayotgan bo'lsa avtomatik reload, aks holda "Sayt yangilandi" chizig'i. `reg.update()` aniq chaqirilmagan edi (brauzer navigatsiyada o'zi tekshiradi).
4. **Production SW**: `109cb0ef`, `ai-ariza.js` hash'ga kirgan.

## Aniq sabab
SW ning ichki `fetch()` chaqiruvlari brauzer **HTTP keshi**dan o'tadi. Cloudflare statik fayllarni 4 soatga beradi. Shuning uchun yangi SW o'rnatilib, faollashib, hatto sahifani avtomatik qayta yuklasa ham, `assets/ai-ariza.js` tarmoqqa chiqmay HTTP keshdagi **eski nusxadan** olinib, yangi SW keshiga ham eski nusxa bo'lib tushardi (precache `cache.add(url)` ham HTTP keshdan o'qiydi; SWR fonda yangilash ham). Natija: yangi versiya birinchi navbatda eng ko'pi bilan 4 soatdan keyin (HTTP kesh muddati tugagach). Maxfiy tabda kesh va SW yo'q, shuning uchun yangi versiya ko'rindi.

### Simulyatsiya (tuzatishdan oldin)
`tools/sw-simulyatsiya.mjs`: Cloudflare sarlavhalarini (HTML max-age=0, qolgan statik max-age=14400 + ETag) taqlid qiluvchi lokal server; ESKI build (5-bosqich, `c2743bc`) ro'yxatdan o'tkaziladi, so'ng YANGI build (6-bosqich `main`) xizmat qilinadi, har tashrifda sahifa qayta ochiladi ("Yangi" belgisi = 6-bosqich bloki).

| tashrif (deploy'dan keyin) | SW versiyasi | AI bloki |
|---|---|---|
| 1 (SW almashdi, 1 avto-reload) | yangi | **ESKI** |
| 2, 3, 4, reload | yangi | **ESKI** |
| ... | | HTTP kesh (4 soat) tugaguncha ESKI; server logida `ai-ariza.js` so'rovi umuman yo'q |

## Nima o'zgartirildi (eng kichik tuzatish)
- `sw.js`: precache `cache.add(new Request(u, {cache: 'reload'}))`; `staleWhileRevalidate` va `networkFirst` ichidagi `fetch(req, {cache: 'no-cache'})` (ETag bilan tekshiradi — 304 arzon, HTTP keshdagi eskini bermaydi). `SW_VERSION` assets o'zgargani uchun yangilandi (`004f07b1`). Strategiyalar, ro'yxatlar, oflayn xatti-harakati o'zgarmagan.
- `_headers` (yangi, Cloudflare Pages): `/sw.js` → `Cache-Control: no-cache, max-age=0`.
- `assets/sw-boot.js`: ro'yxatdan o'tgach `reg.update()` va tab/ilovaga qaytganda (`visibilitychange`) `reg.update()` (60 soniyadan tez-tez emas). Mavjud "foydalanuvchi tegsa reload qilma, chiziq ko'rsat" himoyasi o'zgarmagan.
- `tools/sw-simulyatsiya.mjs`: simulyatsiya (qayta ishlatiladi).
- Qilinmadi (ataylab): `assets/*` uchun umumiy `no-cache` sarlavha — SW tuzatishi yetarli, rasm/og keshiga tegmaslik uchun.

## Simulyatsiya natijalari (tuzatishdan keyin; eski SW'li foydalanuvchi → yangi build)
| tashrif | SW | AI bloki | izoh |
|---|---|---|---|
| 1 | yangi | **YANGI** | 1 avto-reload (maydonga tegilmagan bo'lsa) |
| 2, 3, 4, reload | yangi | YANGI | `ai-ariza.js` faqat bir marta shartli (ETag) so'raldi |

Maydonga tegilgan bo'lsa avto-reload bo'lmaydi (mavjud himoya): chiziq chiqadi, keyingi tashrifda yangi versiya ko'rinadi.
Oflayn (`context.setOffline`): avval ochilgan `/ariza-namunasi`, `/kredit-kalkulyator`, `/hujjatlar` tarmoqsiz ochiladi (eski va yangi build'da bir xil).

## Chiqarish va production (2026-10-11, merge `ea53533`)
Push 18:29:34 UTC, production `sw.js` 18:29:57 da `004f07b1` (tuzatishli) ga o'tdi. Production'da AI so'rovisiz tekshiruv: `sw.js` ichida `cache: 'reload'` va `cache: 'no-cache'` bor; `/`, `/ariza-namunasi`, `/kredit-kalkulyator`, `/hujjatlar`, RU va CYR ariza sahifalari 200; AI bloki 390px'da ko'rinadi, 320px'da toshmaydi.

**Topilma (foydalanuvchi qadami talab qilinadi, ixtiyoriy).** `_headers` faqat `*.pages.dev` da qo'llanadi (`sw.js` → `no-cache, max-age=0`). `kalki.uz` (maxsus domen) da esa Cloudflare zonasi statik fayllarning sarlavhasini `max-age=14400` ga qayta yozadi (query bilan sinash ham shunday; HTML bundan mustasno). Ehtimoliy sabab: zona sozlamasi **Caching → Configuration → Browser Cache TTL = 4 hours** (taxminiy menyu nomi). Uni **"Respect Existing Headers"** ga o'zgartirish `_headers` ni `kalki.uz` da ham ishlatadi va `assets/*` uchun ham to'g'ri TTL berish imkonini beradi. Bu SW tuzatishini bekor qilmaydi: brauzer `sw.js` skriptini (`updateViaCache: 'imports'`) HTTP keshga qaramay tarmoqdan tekshiradi — simulyatsiya aynan `max-age=14400` bilan o'tkazilgan (faqat `/sw.js` uchun no-cache bilan ham, bunisiz ham yangilanish topiladi).

## Xavflar
- Tuzatish faqat YANGI `sw.js` o'rnatilgandan keyin ishlaydi. Eski SW'li brauzer (hozirgi telefon) uchun: yangi `sw.js` topiladi (brauzer uni keshsiz tekshiradi), o'rnatiladi, faollashadi va (maydonga tegilmagan bo'lsa) sahifa bir marta o'zi qayta yuklanadi. Hozir telefonda eski `ai-ariza.js` bo'lsa, birinchi tashrifdan keyin yangilanishi kerak (4 soat kutish endi shart emas).
- Maydonga tegilgan bo'lsa avto-reload yo'q (mavjud himoya) — "Yangilash" chizig'i yoki keyingi tashrif.
- `no-cache` bilan SWR har asset uchun shartli (ETag) so'rov yuboradi: 304 arzon, lekin so'rovlar soni bir oz oshadi.
- `cache: 'reload'` precache o'rnatishda ~230 ta URL ni HTTP keshsiz yuklaydi (avval ham yuklanardi, faqat keshdan bo'lishi mumkin edi): o'rnatish trafigi ozgina oshishi mumkin.
