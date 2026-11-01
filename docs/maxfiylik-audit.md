# KalkiFit — qurilmadan tashqariga chiqadigan ma'lumotlar (audit, 2026-10-31; 4 band 2026-11-01 da tuzatildi — pastga qarang)

Kod bo'yicha tekshirildi (faqat o'qish). AI modeli: Anthropic `claude-haiku-5-5`. Barcha AI so'rovlarida limit hisoblagichlari KV'da (mijoz_id va IP — tuzlangan xesh, 2 kun TTL). `mijoz_id` — qurilmadagi tasodifiy UUID (`kalki_fit_cid`).

| # | Qachon | Nima yuboriladi | Qayerga (xizmat) | Serverda saqlanadimi, qancha | Shaxsga bog'liqligi |
|---|---|---|---|---|---|
| 1 | Matn bilan aniqlash («AI bilan aniqlash», ovozdan keyin ham) | bazada topilmagan so'zlar (≤300 belgi), til, mijoz_id | `/api/kalkifit` → `maskPII` → **Anthropic** | **Yo'q** (faqat limit hisoblagichi, 2 kun) | anonim (xesh) |
| 2 | Taom rasmi | 1024 px JPEG | `/api/kalkifit-rasm` → **Anthropic** | **Yo'q** — rasm saqlanmaydi va loglanmaydi | anonim |
| 3 | Qadoq yorlig'i rasmi | 1280 px JPEG, `tur: 'yorliq'` | `/api/kalkifit-rasm` → **Anthropic** | **Yo'q** | anonim |
| 4 | Kafe menyusi rasmi | JPEG | `/api/kalkifit-menyu` → **Anthropic** | **Yo'q** | anonim |
| 5 | Ovozli kiritish (server yo'li — yoqilgan bo'lsa birinchi) | audio ≤30 s, ≤1 MB, til, mijoz_id | `/api/ovoz` → **OpenAI gpt-4o-mini-transcribe** | **Yo'q** (15 daq bir martalik tok, limit) | anonim |
| 5b | Ovoz (server yo'li yo'q) | audio | brauzer/telefon nutq xizmati (Chrome — **Google**) | bizda yo'q | provayder shartlari |
| 6 | Retseptni yengillashtirish | tanilmagan qatorlar (≤700), til, mijoz_id | `/api/retsept` → `maskPII` → **Anthropic** | **Qisman:** tahlil natijasi (masalliqlar ro'yxati) KV keshda **30 kun**, kalit — matn xeshi; matnning o'zi yo'q | anonim |
| 7 | AI baholagan ovqatni saqlash (taklif) — saqlash bilan avtomatik | nom, porsiya, kkal/O/Y/U, til (mijoz_id faqat limit uchun) | `/api/kalkifit-taklif` | **Ha**, D1 `taklif`, `taklif_kun` — **muddatsiz** | anonim |
| 8 | Yorliq taklifi (rozilik bilan, bir marta so'raladi) | nom, 100 g raqamlari, qadoq og'irligi, birlik, manba, til — **rasmsiz** | `/api/kalkifit-yorliq` | **Ha**, D1 `yorliq_taklif` — muddatsiz | anonim |
| 9 | Qidiruvda topilmagan so'z (kuniga bir marta) | sana, so'z (telefon/email/URL olib tashlanadi), son | `/api/qidiruv` | **Ha**, D1 `qidiruv_topilmadi` — muddatsiz | anonim |
| 10 | Anonim statistika (avtomatik; DNT/GPC yoqilgan bo'lsa — umuman yuborilmaydi) | mijoz_id, platforma, til, hodisa nomlari, ekran kengligi, APK versiyasi, bosh ekran belgisi; server UA'dan qurilma turini oladi | `/api/stat` | **Ha**, D1 `stat_qurilma` (tuzlangan xesh) **100 kun**, keyin faqat yig'ma sonlar; `stat_kun` (yig'ma) muddatsiz | taxallusli (tuzlangan xesh, 100 kun), IP saqlanmaydi |
| 11 | «Hisob» hisoblagichlari (Yeymiz, baliq kuni…) — DNT hisobga olinadi | sana, hodisa, son (`credentials: omit`) | `/api/hisob` | **Ha**, D1 `hisob_kun` | to'liq anonim |
| 12 | Email kod bilan kirish | email, til; keyin email + kod | `/api/akkaunt` → **Resend** (kod xati) | **Ha**: `akkaunt` (email, ism, sanalar, marketing roziligi), kod — HMAC xesh 10 daq, sessiya — xesh (30 kun faolsiz / 180 kun), audit — akkaunt o'chguncha | email |
| 12b | Google bilan kirish | ID token (veb: Google GSI skripti faqat tugma bosilgach yuklanadi) | **Google** → `/api/akkaunt/google` | email va ism `akkaunt`da | email |
| 13 | Bulut zaxira (tiklash kodi bilan; kirgach avtomatik yoqiladi) | AES-GCM bilan shifrlangan butun holat (profil, ovqat, vazn, qadam); kuniga bir marta blobsiz «holat» so'rovi | `/api/zaxira` | **Ha**, D1 `zaxira` — 12 oy sinxronsiz bo'lsa ogohlantirish, +30 kun o'tib o'chadi; «Bulutdan o'chirish» yoki akkaunt o'chirilganda darhol. Akkaunt odatiy (konvert) rejimida tiklash kodi server kaliti bilan saqlanadi → server **texnik jihatdan ochishi mumkin**; «Qat'iy rejim»da yo'q | kodsiz — anonim; kirgan bo'lsa akkauntga bog'langan |
| 14 | Eslatma obunasi (Baliq kuni, haftalik) | push endpoint + kalitlar, til, baliqsiz, kun, hafta | `/api/push` → Web Push (FCM, Mozilla, Apple, WNS) | **Ha**, D1 `push_obuna` (kirgan bo'lsa `akkaunt_id` bilan); o'chirilganda / 404 / 5 xatoda / **akkaunt o'chirilganda** o'chadi | kirgan bo'lsa akkaunt |
| 15 | Ilova ochilishi | GET `/api/kalkifit-yorliq`, `/data/*.json`, `/api/akkaunt/sessiya`, `/api/push/kalit` | bizning server | foydalanuvchi ma'lumoti yo'q | — |
| 16 | **Google Analytics 4** (har sahifa, 3,5 s dan keyin) | sahifa ko'rish, referrer, qurilma; `_ga` cookie; Google IP'ni ko'radi | **Google** | Google'da | GA mijoz id |
| 17 | Shriftlar (Manrope) | so'rov (IP, UA) | **Google Fonts** | Google'da | IP |
| — | AdSense | KalkiFit sahifasida **yuklanmaydi** | — | — | — |

**Faqat qurilmada:** `kalki_fit` (butun holat), `kalki_fit_cid`, `kalki_zaxira_*`, `kalki_akk`, statistika navbatlari (`kalki_stat_*`, `kalki_manba`, `kalki_fit_hisob`), `kalki_fit_qt`, `kalki_fit_yq`, sozlamalar. Health Connect qadam/kaloriyasi qurilmadan chiqmaydi (faqat shifrlangan zaxira ichida). Ilova akkauntsiz to'liq ishlaydi.

## Matnlar moslandi (v68)
- Ilova pastki matni: akkauntsiz — «Yozuvlaringiz shu qurilmada saqlanadi. AI (matn, rasm, ovoz) uchun yuborilgani saqlanmaydi.»; bulut zaxirasi yoqilgan — «…shu qurilmada va tiklash kodi bilan shifrlangan bulut zaxirasida…»; akkaunt — «…hisobingizga shifrlangan zaxira bilan sinxronlanadi…»; + havola «Maxfiylik: nima yuboriladi» (`/maxfiylik#kalkifit-ai`).
- Ovqat taklifi (`tkNote`): nom, porsiya, kkal/O/Y/U yuborilishi va **saqlanishi** aytiladi.
- Ovoz (`vPriv`): «telefon yoki brauzerning nutq xizmati (odatda Google)».
- Menyu rasmi, yorliq rasmi, retsept AI: «AI tahliliga yuboriladi va saqlanmaydi» / «retsept matni saqlanmaydi».
- Zaxira kodi: «akkauntga ulanmagan bo'lsa, hech kim, biz ham ocha olmaydi».
- `kalkifit.html` (UZ/RU) FAQ va JSON-LD: «serverga yuborilmaydi» o'rniga haqiqiy holat.
- `maxfiylik.html` (UZ/RU): KalkiFit bo'limi to'liq ro'yxat (matn AI, rasm/menyu/yorliq, ovoz — OpenAI, 30 s, retsept keshi 30 kun, takliflar, topilmagan so'zlar, eslatmalar); statistika — «tuzlangan xesh»; akkaunt odatiy rejimida server texnik jihatdan ocha olishi; uchinchi tomonlar — Anthropic (KalkiFit ham), OpenAI, Resend.

## Tuzatildi (v68+, «tuzatish:»)
1. **Akkaunt o'chirilganda** — eslatma (push) obunalari (`push_obuna.akkaunt_id`) va akkauntga bog'langan bulut zaxira (konvert rejimi: `akkaunt_ilova.zaxira_id`) DARHOL o'chadi. Qat'iy rejimda serverda bog'lanish yo'q — ilova o'zi o'chiradi (`bk.delCloudQuiet`, o'chirish muvaffaqiyatli bo'lgach).
2. **Do Not Track / Global Privacy Control** — mijoz (`stat-kun.js`, test belgisi ham aylanib o'tmaydi) va server (`DNT: 1` / `Sec-GPC: 1` sarlavhasi) `/api/stat` ga hech narsa yuborilmaydi/yozilmaydi. «Hisob» hisoblagichlari (to'liq anonim) DNT'ni ilgari ham, endi GPC'ni ham hisobga oladi; qidiruvda topilmagan so'z — ikkalasini.
3. **Google skripti** (`accounts.google.com/gsi/client`) faqat «Google bilan kirish» bosilgandan keyin yuklanadi (Profil ochilganda emas): o'zimizning tugma → bosilganda skript → bir bosishli oyna; chiqmasa — Google tugmasi shu joyda.
4. **Bulut zaxira saqlash muddati**: 12 oy hech qanday sinxron (PUT yoki ilova ochilganda kuniga bir «holat» so'rovi) bo'lmasa → `zaxira.ogoh` qo'yiladi; ilova ochilsa bir martalik xabar chiqadi va zaxira saqlanadi (ochish sinxron hisoblanadi); ogohdan 30 kun o'tib ham sinxron bo'lmasa — zaxira (va unga bog'langan akkaunt konverti) o'chadi. Qoida — `functions/_lib/zaxira-muddat.js`; kunlik cron — `tools/zaxira-muddat.js` (`--quruq`: faqat sonlar). Migratsiya: `migrations/zaxira-muddat.sql` (`oxirgi`, `ogoh`).

Yangi so'rov: ilova bulut zaxira yoqilgan bo'lsa kuniga bir marta `GET /api/zaxira?id=…&holat=1` (blobsiz) yuboradi.

## Hali tuzatilmagan (alohida qaror kerak)
1. AI ovqat taklifi saqlash bilan avtomatik yuboriladi — alohida o'chirish imkoni yo'q.
2. Muddat ogohlantirishi faqat ilova ochilganda ko'rinadi (ilovani umuman ochmaydigan akkaunt egalariga email yuborilmaydi).
