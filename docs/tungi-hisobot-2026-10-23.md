# Tungi ish — hisobot (2026-10-22/23)

## (a) Qismlar holati

| Qism | Holat | Izoh |
|---|---|---|
| 0. Suyuqlik (v24) | **production** | `suyuqlik` → main (9a854ed). Darvoza: verify-all bir marta yiqildi (yugurish paytida fayl ko'chirganim tufayli sw-xesh eskirgan) → sw-versiya qayta hisoblandi, faqat verify-all qayta o'tdi. |
| 1. Anonim statistika + admin «Statistika» | **production** | `stat` → `tungi` → main (3210b87). D1: `migrations/stat.sql` (zaxira `~/backups/kalkifit-prod-20261022-1927-stat-oldi.sql`). Commit `yashirin:` — foydalanuvchiga ko'rinmaydi. Sinovda topilgan xato tuzatildi: statistika uchun `CHIPS` nomi qayta e'lon qilinib «Bugun nima yeymiz?» ochilmay qolardi (→ `STCH`). |
| 2. Kun kartasi | **production** | 19:00 dan yoki kun yakunlangach «Kunni ulashish»; PNG 1080×1350, vazn/yosh yo'q; Web Share → yuklab olish → APK (Filesystem+Share, native-bridge). |
| 3. Ovozli kiritish | **production** (veb) + **APK 1.0.4** | Qidiruv maydonidagi 🎤. |
| 4. Haftalik xulosa | **production** | Yakshanba 19:00 dan dushanba oxirigacha Bugun'da eslatma kartasi; APK — lokal bildirishnoma 7002; veb — `push-yubor.js --xulosa` (cron `0 14 * * 0`), D1 `migrations/push-hafta.sql` (zaxira `~/backups/kalkifit-prod-20261022-2039-push-hafta-oldi.sql`). Profil → Eslatmalar → «Haftalik xulosa» (standart yoqilgan, bitta tugma). |
| 5. Menyudan tanlash | **production** | Qo'shish → «Boshqa usullar» va Yeymiz → Kafe. AI faqat nom/narx; kkal bazadan; 2–3 variant; cho'chqa va yemaydiganlar chiqmaydi. |

Hammasi bitta relizda (v25): yangi testlar `stat`, `stat-ui`, `kun-karta`, `haftalik`, `menyu`, `ovoz` (+ mavjudlari yangilandi). To'liq `test:tez` bir marta: 2 ta yiqilish (`kalkifit` — 19:00 dagi yangi tugma, `kalkifit-tuzatish` — 🎤 qidiruv placeholder'ini kesgan) → tuzatildi (🎤 maydon ichiga ko'chdi; Profilda segment o'rniga tugma), faqat ular va bog'liqlari qayta o'tdi.

## (b) Statistika

- Manzil: **https://kalki.uz/admin/kalkifit-statistika** (parol — `KALKIFIT_ADMIN_PASSWORD`, mavjud admin paroli).
- Birinchi soatlar: deploy ~02:10 (Toshkent) — 02:35 gacha **0 qurilma, 0 hodisa** (tun; foydalanuvchilarning brauzeridagi eski service worker yangi versiyani keyingi ochilishda oladi). Quvur production'da tekshirildi: bitta sinov hodisasi yozildi va o'chirildi. Demo (`?demo=1`), `*.pages.dev`, bot/headless — hisoblanmaydi (tekshirildi).

## (c) Ovoz yo'li va nega

Anthropic (Claude) audio qabul qilmaydi, alohida STT xizmati — yangi kalit va xarajat. Shuning uchun:
- **Veb:** brauzerning Web Speech API (`uz-UZ` / `ru-RU`), Chrome/Android'da ishlaydi; qo'llanmasa 🎤 ko'rinmaydi.
- **APK:** WebView'da SpeechRecognition yo'q → native «Ovoz» plagini (Android SpeechRecognizer, RECORD_AUDIO faqat 🎤 bosilganda).
- Matn odatiy «Matn bilan qo'shish» oqimiga tushadi: kkal bazadan; topilmagani bo'lsa — **bitta** AI so'rov (`/api/kalkifit`, `manba: 'ovoz'` → umumiy AI limit: Android 2 / veb 5). Hammasi bazada bo'lsa AI chaqirilmaydi va limit sarflanmaydi. Ovoz ilovaga kelmaydi va saqlanmaydi (maxfiylik sahifasiga band qo'shildi).

## (d) APK

**1.0.4 (versionCode 6)**, imzo SHA-256 `9d35514c…7a9c` (avvalgisi bilan bir xil), fayl SHA-256 `68a242e3…2b46`, 8,2 MB. `/ilova` sahifasi va `versiya.json` yangilandi. Android repo: main 5e633c2 (kalit/parol/APK git'da yo'q).

## (e) Disk

Boshida 11 GB bo'sh, oxirida **9,8 GB bo'sh (73%)**. O'chirildi: `kalkifit-android/dist`, `android/app/build`, scratchpad (skrinshotlar, eski USDA yuklamalari), vaqtinchalik skriptlar, `kalki-stat` worktree.

## (f) Telefonda tekshirish (8 band)

1. kalki.uz/kalkifit ni oching (bir-ikki marta yangilang) — «Yangiliklar»da v25 chiqadimi.
2. «Ovqat qo'shish» → qidiruv maydonidagi 🎤 → «bir piyola osh, ikki tilim non va choy» deng → ro'yxat chiqib, «Hammasini qo'shish» ishlaydimi; suv kartasida choy qo'shildimi.
3. Mikrofon ruxsatini rad eting → tushunarli matn chiqadimi.
4. «Ovqat qo'shish» → «Boshqa usullar» → «Menyudan tanlash» → kafe menyusini suratga oling → 2–3 taklif, narx va «Qo'shish».
5. Kechqurun (19:00 dan) Bugun pastida «Kunni ulashish» → rasm to'g'ri chiqadimi (vazn yo'q), Telegram'ga ulashish.
6. Yakshanba 19:00 dan: «Haftangiz xulosasi tayyor» kartasi va (ruxsat bo'lsa) bildirishnoma; Profil → Eslatmalar → «Haftalik xulosa» tugmasi.
7. /ilova dan APK 1.0.4 ni o'rnating (eski ustidan yangilanadi) → ilovada 🎤 ishlaydimi, kun kartasi ulashiladimi.
8. kalki.uz/admin/kalkifit-statistika — parol bilan kiring, raqamlar va «PR uchun hisobot» ochiladimi.
