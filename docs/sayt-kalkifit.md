# kalki.uz → KalkiFit (sayt trafigini ilovaga yo'naltirish)

## Joylar va manba kodlari (`utm_source=sayt-<joy>`)

| Joy | Kod | Qayerda | Ko'rsatildi |
|---|---|---|---|
| Kaloriya kalkulyatori | `kaloriya` | natija bannerida (natijadan keyin; 18 yoshgacha yo'q) | blok paydo bo'lganda |
| Alkogol kalkulyatori | `alkogol` | `.res-extras` (faqat «Hisoblash» bosilgandan keyin) | blok paydo bo'lganda |
| Bosh sahifa | `bosh` | «Yangi ilovalar» → KalkiFit kartasi («Ochish») | karta ≥ 50 % ko'rinsa |
| Kalkulyatorlar ro'yxati | `kategoriya` | «Kundalik hayot» → KalkiFit kartasi | karta ≥ 50 % ko'rinsa |
| Yuqori menyu | `menyu` | hamma sahifada (`tools/site-chrome.js` V2_LINKS) | sanalmaydi |
| Maqolalar | `maqola` | kod tayyor; hozir mos maqola yo'q | — |

- HTML'da havola TOZA (`href="kalkifit"`, `data-kf="<joy>"`); utm faqat bosilganda qo'shiladi (`assets/nav.js` → `KFSayt`) — ichki havolalarda utm yo'q (SEO).
- O'lchov: `POST /api/stat {sb: joy, h: 'k'|'b'}` → `stat_kun` (`hodisa = 'sayt_blok'`, `platforma = 'sayt'`). Id, URL, kiritilgan son yuborilmaydi; DNT/GPC, bot, preview, localhost — yuborilmaydi.
- Ilova: manba `sayt-<joy>` (`assets/stat-kun.js`, server `MANBA`). Admin → «kalki.uz → KalkiFit» jadvali: ko'rsatildi → bosildi → onboarding tugadi → birinchi ovqat (`functions/api/stat.js` `saytBloklar`).

## Ma'lumotni qayta so'ramaslik

`assets/kf-blok.js` `KFBlok.go()` qiymatlarni `localStorage.kalki_fit_import` ga yozadi (URL va serverga emas). KalkiFit (`obNew`) uni o'qigan zahoti o'chiradi (bir marta), 2 kundan eskisini e'tiborsiz qoldiradi.
Hammasi bo'lsa — darhol natija ekrani + «Ma'lumotlaringiz kalkulyatordan olindi — tekshiring» + «O'zgartirish»; yetishmasa — faqat yetishmaganlari so'raladi. Til tanlash ekrani ko'rsatilmaydi (til sahifadan).
Mavjud foydalanuvchi (`st.setup`) — import ishlatilmaydi va o'chiriladi.

Test: `tools/dizayn/test-sayt-kalkifit.mjs`.
