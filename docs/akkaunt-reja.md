# Akkaunt tizimi — reja (1-bosqich, kod yo'q)

KalkiFit va Ro'zg'or uchun ixtiyoriy akkaunt: email (bir martalik kod, parolsiz) va Google. Apple — App Store'ga chiqqanda.
Maqsad: (1) yangi telefonda ma'lumotni email/Google bilan oson tiklash; (2) alohida rozilik bilan yangilik/marketing uchun email bazasi.

## 0. Qat'iy shartlar va asosiy qarorlar

- **Kirish ixtiyoriy.** Ilovalar akkauntsiz ishlaydi. Tiklash kodi (`KF-`/`RZ-`) zaxira yo'li sifatida qoladi. Hech kim ma'lumotini yo'qotmaydi.
- **Hozir Cloudflare (Pages Functions + D1), keyin O'zbekiston VPS.** Barcha DB ishi BITTA adapter orqali: `functions/_lib/akkaunt-store.js` (`zaxira-store.js` namunasida). Email yuborish ham adapter: `functions/_lib/email-send.js`. Sirlar faqat env/secret'da.
- **Minimal ma'lumot:** email, akkaunt ID, kirish usuli, yaratilgan/oxirgi kirish vaqti, marketing roziligi (alohida, default O'CHIQ). Ism yo'q, telefon yo'q.
- Mavjud `zaxira` jadvali va `/api/zaxira` O'ZGARMAYDI. Akkaunt faqat `zaxira.id` ga bog'lanadi.
- Yangi ichki yo'llar `_routes.json` va `functions/_middleware.js` GIZLI regex'ida ham ro'yxatga olinadi (verify-all 36-band tekshiradi).

## 1. Shifrlash va tiklash (eng muhim)

Hozir: tiklash kodidan HKDF bilan `id` va AES-GCM kalit chiqadi; server faqat `id` + shifrlangan blobni ko'radi. Muammo: odam kodni yo'qotadi; akkaunt shu muammoni hal qilishi kerak.

| | a) Server tomonida shifrlash | b) To'liq E2E (kod yoki passkey kerak) | c) Gibrid: konvert (escrow) + qat'iy rejim |
|---|---|---|---|
| Mohiyat | Server kalitni biladi, ma'lumotni o'zi shifrlaydi/ochadi | Kalit faqat qurilmada; yangi telefonda kod yoki passkey bir marta kiritiladi | Tiklash kodi server kalitida shifrlanib akkauntga saqlanadi; kirgach avtomatik ochiladi. Xohlovchi "qat'iy" rejimga o'tadi (konvert o'chadi) |
| Qulaylik | Eng yuqori | Past: kod yo'qolsa — akkaunt ham yordam bermaydi | Yuqori (email/Google yetarli) |
| Xavfsizlik | Past: server/admin/ma'lumot sizib chiqishi hammasini ochadi | Eng yuqori | O'rta-yuqori: bazadan o'g'irlash yetmaydi (kalit alohida secret'da); to'liq server buzilishi xavfi bor; qat'iy rejimda = (b) |
| Migratsiya ta'siri | Blob formati o'zgaradi, hamma foydalanuvchini qayta shifrlash | Hech narsa o'zgarmaydi, lekin akkaunt foydasiz | Blob va kalit formati O'ZGARMAYDI; faqat yangi `kod_konvert` ustuni. VPS'ga ko'chganda master secret ham ko'chiriladi |

**Tavsiya: (c).** Konvert: AES-GCM(kalit = HKDF(MASTER_SECRET, akkaunt_id), AAD = `akkaunt_id|ilova`), ichida tiklash kodi. Blob formati, `/api/zaxira`, eski kod oqimi tegilmaydi. Qat'iy rejim (konvertsiz) sozlamada ixtiyoriy, ogohlantirish bilan: "email bilan tiklab bo'lmaydi, faqat kod". Master secret rotatsiyasi: `master_v` ustuni bilan qayta o'rash (blobga tegmaydi).

**Server kaliti (gibrid uchun) — qaror:**
- Secret nomi: `AKKAUNT_MASTER_KEYS`, shakli `versiya:kalit` juftliklari vergul bilan (`2:<yangi>,1:<eski>`); kalit — kamida 43 ta tasodifiy harf-raqam. **Birinchisi joriy** (yangi o'rashlar shu bilan), qolganlari faqat eski konvertlarni ochish uchun. Kodda/repoda YO'Q: faqat Cloudflare secret (keyin VPS env). O'qish/tekshirish: `functions/_lib/akkaunt-kalit.js`; yaratish va tekshirish vositasi: `tools/akkaunt-kalit.js` (kalitni faylga yozmaydi).
- Konvert (B bosqich): `kod_konvert = versiya | iv | AES-GCM(HKDF(kalit_versiya, akkaunt_id), tiklash kodi)`, AAD = `akkaunt_id|ilova`; `akkaunt_ilova.master_v` qaysi versiya bilan o'ralganini saqlaydi.
- **Almashtirish (rotation):** yangi `N+1` juftlikni boshiga qo'shish → «qayta o'rash» vositasi (B) har konvertni ochib yangi versiya bilan qayta yozadi → eski juftlikni olib tashlash. Blob va foydalanuvchi kodlariga tegilmaydi.
- **Kalit yo'qolsa:** blob'lar tiklash kodi bilan shifrlangan, kalitga bog'liq emas → ma'lumot yo'qolmaydi; faqat eski konvertlar ochilmaydi. Kirgan qurilmalar kodni qayta yuboradi (yangi kalit bilan qayta o'raladi); telefoni ham, kodi ham yo'q odam bulutdagi ma'lumotni ocha olmaydi. Batafsil va oddiy 6 qadam: `docs/akkaunt-kalit.md`.
- Qat'iy rejim konvertni umuman yaratmaydi — kalitga bog'liq emas.

## 2. Email yuborish

Talab: Workers'dan HTTPS API (SMTP yo'q), bepul limit, mail.ru/gmail/yandex'ga yetib borish.

| Provayder | Narx / bepul limit | Izoh |
|---|---|---|
| Resend | bepul ~3000/oy (100/kun), keyin ~$20/oy | Oddiy API, DKIM avtomatik, Workers uchun qulay |
| Brevo | bepul ~300/kun | Marketing uchun ham, lekin tranzaksion reputatsiya aralashishi mumkin |
| Amazon SES | ~$0.10/1000 | Eng arzon, sozlash murakkab, sandbox'dan chiqish kerak |

**Tavsiya: Resend**, `mail.kalki.uz` subdomenidan (asosiy domen reputatsiyasini himoyalaydi). Adapter `emailSend({to, subject, text, html})` — keyin provayderni almashtirish bitta fayl. Kodli xat: oddiy matn, havolasiz (spam filtrlari uchun xavfsizroq).
Yetib borish sinovi (qo'lda, bosqich A oxirida): gmail, mail.ru, bk.ru, yandex, inbox.uz — "kirish" papkasi/spam, sarlavhalar (SPF/DKIM/DMARC pass).

**DNS (kalki.uz uchun, foydalanuvchi qiladi):**
1. SPF: `mail.kalki.uz TXT "v=spf1 include:<provayder> ~all"`.
2. DKIM: provayder bergan CNAME/TXT yozuvlari (odatda `resend._domainkey.mail`).
3. DMARC: `_dmarc.kalki.uz TXT "v=DMARC1; p=none; rua=mailto:<kuzatuv-email>"` — 2–4 haftadan keyin `quarantine`.
4. Return-path/MX (provayder ko'rsatsa) — `mail` subdomeni uchun.
5. Provayder panelida domen "Verified" bo'lishini kutish.

## 3. Google bilan kirish

Google Identity Services (GIS) tugmasi → ID token (JWT) → serverga POST → server tekshiradi:
JWKS (`https://www.googleapis.com/oauth2/v3/certs`, keshlanadi) bilan RS256 imzo (WebCrypto), `iss` ∈ {accounts.google.com, https://accounts.google.com}, `aud` = bizning Client ID, `exp`, `email_verified=true`, `nonce` (bir martalik, serverda).
Akkaunt `sub` bo'yicha izlanadi; bo'lmasa email bo'yicha (bir xil email = bitta akkaunt, usullar birlashadi).
**Ehtiyot:** iOS'da o'rnatilgan PWA (standalone) da GIS pop-up/redirect ishlamasligi mumkin → doim "Email kod bilan kirish" zaxirasi ko'rinib turadi.

**Google Cloud Console (foydalanuvchi qadamlari):**
1. console.cloud.google.com → yangi loyiha "kalki".
2. APIs & Services → OAuth consent screen: External, ilova nomi, support email, logotip, `kalki.uz` domeni, maxfiylik sahifasi `https://kalki.uz/maxfiylik`. Scopes: faqat `openid`, `email` (profile KERAK EMAS).
3. Credentials → Create → OAuth client ID → "Web application".
4. Authorized JavaScript origins: `https://kalki.uz`, `https://www.kalki.uz` (va preview uchun vaqtincha `https://<branch>.kalki.pages.dev`).
5. Client ID'ni menga bering (u ochiq, repoda bo'lishi mumkin; client secret kerak EMAS).
6. Publishing status → "In production" (aks holda faqat test foydalanuvchilar kiradi). Faqat email/openid scope bo'lgani uchun odatda tekshiruv talab qilinmaydi.

## 4. Sessiyalar

- Token: 32 bayt tasodifiy, **cookie'da xom, bazada SHA-256**. Cookie: `__Host-kalki_s`, `HttpOnly; Secure; SameSite=Lax; Path=/`.
- Muddat: sliding 30 kun, absolyut 180 kun.
- Ko'p qurilma: har kirish alohida `sessiya` qatori (qurilma yorlig'i: brauzer/OS, oxirgi faollik). Profilda ro'yxat, "Shu qurilmadan chiqish", "Hamma qurilmadan chiqish".
- CSRF: faqat POST + `Content-Type: application/json` + Origin tekshiruvi (`originOk` namunasi).
- Eslatma: www va apex cookie'lari alohida — `_redirects` bo'yicha bitta host'ga majburlash; o'rnatilgan iOS PWA saqlashi Safari'dan alohida (u yerda qayta kirish kerak — aynan shu uchun tiklash oqimi bor).

## 5. Xavfsizlik

- Kod: 6 raqam, `crypto.getRandomValues`, bazada **HMAC-SHA256(OTP_PEPPER, email|kod)**, ochiq saqlanmaydi.
- Amal qilish 10 daqiqa; bir martalik; yangi kod eskisini bekor qiladi.
- Urinish: kod boshiga ≤5 noto'g'ri, keyin kod o'chadi.
- Qayta yuborish: 60 s kutish.
- Limitlar (D1 `limit_hisob`, oyna bo'yicha): email boshiga 5 kod/soat, 10/kun; IP boshiga 20 so'rov/soat; tekshirishda IP boshiga 30/soat.
- Ixtiyoriy: Cloudflare Turnstile (limit oshganda yoqiladi).
- Javoblar bir xil ("agar email to'g'ri bo'lsa kod yuborildi") — email mavjudligi oshkor bo'lmasin.
- Admin parol, MASTER_SECRET, OTP_PEPPER, email API kaliti — faqat `wrangler pages secret`.

## 6. D1 sxema (`migrations/akkaunt.sql`)

```
akkaunt(id TEXT PK, email TEXT UNIQUE, usul TEXT,        -- 'email'|'google'|'ikkalasi'
        google_sub TEXT UNIQUE NULL, yaratilgan INT, oxirgi_kirish INT,
        marketing INT DEFAULT 0, marketing_vaqt INT, marketing_matn_v TEXT, ochirilgan INT NULL)
kirish_kodi(id, email, kod_hash, muddat INT, urinish INT, ishlatilgan INT)
sessiya(id TEXT PK /*sha256*/, akkaunt_id, yaratilgan, oxirgi, muddat_abs, qurilma TEXT)
akkaunt_ilova(akkaunt_id, ilova /*'kalkifit'|'rozgor'*/, zaxira_id TEXT UNIQUE,
              kod_konvert TEXT NULL, rejim TEXT /*'konvert'|'qatiy'*/, master_v INT, ulangan INT,
              PRIMARY KEY(akkaunt_id, ilova))
limit_hisob(kalit TEXT PK, soni INT, oyna_boshi INT)
audit(vaqt, akkaunt_id, hodisa)   -- minimal: kirish, ulanish, o'chirish; IP saqlanmaydi
```
`zaxira_id UNIQUE`: bitta zaxira faqat bitta akkauntga tegishli.

**Mavjud kod foydalanuvchisini ulash:** akkaunt ochgach, ilova qurilmadagi tiklash kodini bir marta serverga yuboradi (HTTPS) → server undan `id` chiqarib `zaxira` da borligini tekshiradi → konvert yasaydi → `akkaunt_ilova` ga yozadi. Ma'lumot qayta yuklanmaydi, blob o'zgarmaydi. Yangi telefonda: kirish → server konvertni ochib kodni qaytaradi → ilova odatdagi tiklashni bajaradi. Zaxirasi yo'q yangi foydalanuvchi: ilova kod yaratadi (hozirgidek), keyin ulanadi.

## 7. Interfeys oqimi

Profil → "Kirish (ixtiyoriy)" bloki (yangi doimiy karta emas, mavjud zaxira kartasi ichida). Asosiy yo'l (qidir → porsiya → qo'sh) tegilmaydi; majburiy kirish yo'q, ochilishda qalqib chiquvchi oyna yo'q.

Ekranlar (eng kami, 3 ta bosqich):
1. Blok: "Telefon almashsa ham ma'lumot saqlansin" + [Google bilan kirish] [Email bilan kirish].
2. Email → kod (6 katak, avto-fokus) → tamom.
3. Birinchi kirishda bitta jumla va belgisiz katak: "Yangilik va maslahatlarni emailga yuborish" (default O'CHIQ).
Kirgandan keyin blok: "✓ email@… ulangan · Chiqish · Qurilmalar · Ma'lumotni yuklab olish · Akkauntni o'chirish". Tiklash kodi kichik "Zaxira kod" havolasida qoladi.
Bo'sh/xato holatlar: kod noto'g'ri, muddat tugadi, limit — har birida "nima qilish kerak" jumlasi.

Matnlar (qoralama; ЎЗ — avtomatik translit):
- UZ: «Kirish (ixtiyoriy)», «Telefon almashsa ham ma'lumotlaringiz saqlanib qoladi», «Email bilan kirish», «Emailingizga 6 xonali kod yubordik», «Kod kelmadimi? Spam papkasini tekshiring yoki 60 soniyadan keyin qayta yuboring».
- RU: «Вход (по желанию)», «Данные сохранятся, даже если вы смените телефон», «Войти по email», «Мы отправили 6-значный код на ваш email», «Код не пришёл? Проверьте «Спам» или повторите через 60 секунд».
Kalkifit/Ro'zg'or qoidalari: 360 px, `fs-big`, klaviatura ochiq; `data/yangiliklar-*.json` ga yozuv (har ikkala ilova).

## 8. Admin

`admin/akkaunt.html` + `functions/api/akkaunt-admin.js` — mavjud admin namunasi (umumiy parol, `X-Admin-Password`, doimiy vaqtli taqqoslash, IP bo'yicha KV limit).
- Ko'rsatkichlar: jami akkaunt, Google/email bo'yicha, ilova bo'yicha, oxirgi 7/30 kun yangilari, marketing roziligi soni.
- CSV: faqat `marketing=1` va o'chirilmaganlar: email, rozilik vaqti, matn versiyasi, usul. Har yuklab olish auditga yoziladi.
- Obuna bekor qilish: har marketing xatida havola (imzolangan token) + profilda katak; bekor qilinsa `marketing=0`.

## 9. Maxfiylik, o'chirish, yuklab olish

- Akkaunt o'chirish: profil → tasdiq (kod bilan) → `akkaunt`, `sessiya`, `akkaunt_ilova` (konvert), `kirish_kodi` o'chadi. Zaxira blobi esa foydalanuvchi tanlovi bilan: "Zaxirani ham o'chirish" yoki "kod bilan saqlab qolish". Audit'dan email olib tashlanadi.
- Ma'lumot yuklab olish: JSON (email, usul, vaqtlar, rozilik, ulangan ilovalar, qurilmalar).
- `maxfiylik.html` 6-bo'lim kengaytiriladi (UZ/RU, ЎЗ translit). Qoralama:
  - UZ: «Akkaunt ochsangiz, biz faqat emailingizni, kirish usulini, ro'yxatdan o'tgan va oxirgi kirgan vaqtni hamda (alohida roziligingiz bilan) yangilik yuborishga rozilikni saqlaymiz. Ism va telefon so'ralmaydi. Ma'lumotlar hozir Cloudflare serverlarida saqlanadi; keyinchalik O'zbekistondagi serverga ko'chiriladi, bu haqda shu sahifada yozamiz. Akkauntni istalgan payt Profil bo'limida o'chirishingiz yoki ma'lumotlaringizni yuklab olishingiz mumkin; o'chirilganda ma'lumotlaringiz bizdagi bazadan o'chadi.»
  - RU: «Если вы создаёте аккаунт, мы храним только ваш email, способ входа, время регистрации и последнего входа, а также (с вашего отдельного согласия) согласие на рассылку новостей. Имя и телефон не запрашиваются. Сейчас данные хранятся на серверах Cloudflare; позже будут перенесены на сервер в Узбекистане — мы сообщим об этом на этой странице. Аккаунт можно удалить или скачать свои данные в любой момент в разделе «Профиль»; при удалении данные стираются из нашей базы.»
- **Huquqiy ehtiyot:** O'zbekiston shaxsiy ma'lumotlar to'g'risidagi qonunchiligi (lokalizatsiya talablari) bo'yicha yurist ko'rigi tavsiya etiladi; bu hujjat huquqiy xulosa emas. Bu VPS'ga ko'chishni ham tezlashtirishi mumkin.

## 10. Ko'chirish (VPS) — `docs/akkaunt-kochirish.md` (A bosqichida yoziladi)

`docs/zaxira-kochirish.md` ga o'xshash: (1) `tools/akkaunt-export.js` — barcha jadvallarni JSONL'ga eksport (sessiyalar ixtiyoriy), `tools/akkaunt-import.js` — Postgres/SQLite'ga import, (2) `akkaunt-store.js` adapteri uchun ikkinchi realizatsiya (Postgres), (3) MASTER_SECRET/OTP_PEPPER/email kaliti ko'chirish (o'zgarmasa konvertlar ochiladi), (4) CORS va bitta qatorli `AKKAUNT_API` almashtirgich, (5) cookie domeni va `Secure` tekshiruvi, (6) ko'chirishdan keyin sessiyalarni bekor qilish yoki saqlash qarori, (7) qayta tiklash sinovi.

## 11. Bosqichlar (har biri alohida branch + preview)

| Bosqich | Ichida | Baho |
|---|---|---|
| A. Email kod + sessiya — **tayyor (branch `akkaunt`)** | `akkaunt.sql`, store/email adapterlari, `/api/akkaunt/*` (kod, kirish, sessiya, chiqish, qurilmalar, marketing, yuklab, o'chirish), Profil «Kirish» qatori, limitlar, testlar, `akkaunt-kochirish.md`, `akkaunt-kalit.md`, eksport/import/kalit vositalari. Qurilmalar ro'yxati UI'da hozircha faqat soni (alohida qurilmadan chiqish — D da) | 4–5 kun |
| B. Zaxira bilan ulash | konvert, mavjud kodni ulash, yangi telefonda tiklash, qat'iy rejim, o'chirish/yuklab olish, maxfiylik matni | 3–4 kun |
| C. Google | GIS tugmasi, ID-token tekshiruvi, email bilan birlashtirish, iOS PWA zaxirasi | 2–3 kun |
| D. Admin/eksport | statistika, marketing CSV, obuna bekor qilish | 1–2 kun |
| (keyin) Apple | App Store bilan birga: Sign in with Apple (App Store qoidasi — Google bo'lsa Apple ham shart) | alohida |
Jami ≈ 10–14 ish kuni + provayder/DNS kutish.

### A bosqichdan B ga o'tkazma eslatmalari
- `assets/app-akkaunt.js` dagi `inP2` matni («hozircha akkaunt faqat kirish uchun…») B da o'chiriladi / almashtiriladi — A da akkaunt ma'lumotni tiklamaydi, shuning uchun matn halol yozilgan.
- **Production'da `AKKAUNT_EMAIL_API_KEY` ni B tayyor bo'lgunicha qo'ymang** — kalit qo'yilishi bilan «Kirish» qatori hammaga ko'rinadi (kalit yo'q → ko'rinmaydi).
- A bosqichda yangilik yozuvi (`data/yangiliklar-*.json`) qo'shilmadi: funksiya production'da yashirin; yozuv B bilan, ko'rinadigan bo'lganda qo'shiladi.

## 12. Foydalanuvchining qo'l vazifalari

1. Resend (yoki tanlangan provayder) akkaunti, `mail.kalki.uz` domenini qo'shish.
2. DNS: SPF, DKIM, DMARC, return-path (2-bo'lim).
3. Google Cloud loyihasi, OAuth ekrani, Web client ID (3-bo'lim); Client ID'ni yuborish.
4. Secret'lar: `wrangler pages secret put` — `MASTER_SECRET`, `OTP_PEPPER`, `EMAIL_API_KEY`, `AKKAUNT_ADMIN_PASSWORD` (preview va production uchun alohida).
5. D1 migratsiyasini ishga tushirish (`migrations/akkaunt.sql`).
6. Marketing roziligi matnini va maxfiylik matnini tasdiqlash; yurist ko'rigi.
7. Yetib borish sinovi uchun gmail/mail.ru/yandex/inbox.uz qutilari.
8. (Ixtiyoriy) Turnstile kalitlari.

## 13. Xavflar

- Konvert rejimida to'liq server buzilishi kodni ochishi mumkin → qat'iy rejim + secret'ni bazadan alohida saqlash.
- Email yetib bormasligi (mail.ru) → sinov, zaxira: Google va eski kod.
- iOS PWA/GIS cheklovi → email kod har doim mavjud.
- Qonuniy lokalizatsiya → yurist, VPS rejasi.
- Akkaunt egallash (email nnazorati yo'qolsa) → qat'iy rejim, qurilmalar ro'yxati, o'chirishda kod tasdig'i.
