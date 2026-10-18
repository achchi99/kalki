# Server kaliti: yaratish, saqlash va zaxiralash (oddiy yo'riqnoma)

**Bu nima?** Akkaunt tizimining «gibrid» rejimida (B bosqich) foydalanuvchining tiklash kodi (KF-/RZ-) bazada **server kaliti bilan shifrlangan holda** turadi — shu tufayli yangi telefonda faqat email/Google yetarli bo'ladi. Kalit bazada **emas**, faqat Cloudflare'ning yashirin sozlamasida (secret) turadi. Baza o'g'irlansa ham, kalitsiz u ochilmaydi.

> ⚠ B bosqichdan boshlab kalit **ishlatiladi**: production'da `AKKAUNT_MASTER_KEYS` bo'lmasa (yoki noto'g'ri formatda bo'lsa) «Email bilan kirish» umuman ko'rinmaydi. Kalitni 2–3-qadamlardagidek saqlamasdan Cloudflare'ga qo'ymang. Kalit yo'qolsa nima bo'lishi pastda. (Preview'da alohida sinov kaliti bor — uni saqlash shart emas.)

**Secret nomi:** `AKKAUNT_MASTER_KEYS`  ·  **Qiymat shakli:** `1:<64 ta tasodifiy harf-raqam>` (almashtirganda: `2:<yangi>,1:<eski>` — birinchisi joriy).

## 6 qadam

**1. Kalitni yarating.** Ikki yo'ldan biri:
- *Kompyuterda* (loyiha papkasida): `node tools/akkaunt-kalit.js yarat 1` — ekranga `1:...` va **barmoq izi** (8 ta harf-raqam) chiqadi. Hech qayerga yozilmaydi.
- *Telefonda*: parol menejeri (Bitwarden, 1Password, iCloud Parollari, Google Parol menejeri) → «Parol yaratish» → uzunligi **64**, faqat harf va raqam → natija oldiga `1:` qo'shing (masalan `1:Xk3...`). Barmoq izi keyinroq kompyuterda `node tools/akkaunt-kalit.js izi "<kalit>"` bilan olinadi (shart emas).
Kalitni **chatga, emailga, skrinshotga, repoga YOZMANG.**

**2. Birinchi joyga saqlang — parol menejeri.** Yangi yozuv: nomi «Kalki AKKAUNT_MASTER_KEYS», parol maydoniga to'liq `1:...` qiymatini qo'ying; izohga yozing: «Cloudflare Pages → kalki-10y → Production secret; barmoq izi: XXXXXXXX».

**3. Ikkinchi joyga saqlang — parol menejeridan BOSHQA joy.** Masalan qog'ozga yozib (qo'lda, 64 belgini aniq) seyf/uy hujjatlari orasiga; yoki boshqa parol menejerining yopiq yozuviga; yoki shifrlangan fayl (flesh-xotirada). Maqsad: bitta qurilma/akkaunt yo'qolsa ham kalit qolsin. **Uch nusxa** ideal: (1) parol menejeri, (2) qog'oz/seyf, (3) ishonchli odamdagi yopiq konvert yoki boshqa shifrlangan joy.

**4. Cloudflare'ga qo'ying.** dash.cloudflare.com → Workers & Pages → `kalki-10y` → Settings → Variables and Secrets → **Add** → Type: **Secret** → nomi `AKKAUNT_MASTER_KEYS` → qiymati `1:...` → **Production** uchun. (Preview uchun ALOHIDA, boshqa kalit yarating — sinov ma'lumoti production kaliti bilan aralashmasin.) Saqlagach, sahifa qiymatni boshqa ko'rsatmaydi — shuning uchun 2–3-qadamlar avval bajarilgan bo'lishi shart.
Kompyuterdan: `printf '%s' '1:...' | npx wrangler pages secret put AKKAUNT_MASTER_KEYS --project-name kalki-10y`.

**5. Tekshiring.** Kompyuterda: `AKKAUNT_MASTER_KEYS='1:...' node tools/akkaunt-kalit.js tekshir` — «OK», versiya va barmoq izi chiqadi. Barmoq izi parol menejeridagi izoh va qog'ozdagi nusxa bilan **bir xil** bo'lsin (kalit to'g'ri ko'chirilganini shu isbotlaydi). Qog'ozdagi nusxani ham yiliga bir marta shu usulda tekshiring (`izi "<qo'lda yozilgan kalit>"`).

**6. Yiliga bir marta (yoki kalit sizib chiqsa darhol) almashtiring.** Yangi kalit yarating (`yarat 2`), Cloudflare'dagi qiymatni `2:<yangi>,1:<eski>` ga o'zgartiring (eskisini O'CHIRMANG). Yangi shifrlashlar `2` bilan bo'ladi, eski konvertlar `1` bilan ochiladi. Konvertlar ikki yo'l bilan yangi kalitga o'tadi: (a) foydalanuvchi tiklash so'raganda o'zi (sust, avtomatik); (b) hammasini bir yo'la: `curl -s -X POST https://kalki.uz/api/akkaunt/qayta-ora -H 'Origin: https://kalki.uz' -H 'Content-Type: application/json' -H "X-Admin-Password: $KALKIFIT_ADMIN_PASSWORD" -d '{}'` — javobdagi `qoldi` 0 bo'lguncha takrorlang (har chaqiruvda 200 tagacha). `qoldi:0` va `xato:0` bo'lgach eskisini (`,1:…`) olib tashlang. Ikkala kalitni ham 2–3-qadamlardagidek saqlang.

## Boshqa secret'lar (kalit emas, lekin ular ham repoda bo'lmaydi)

| Nomi | Nima uchun | Qayerga |
|---|---|---|
| `AKKAUNT_OTP_PEPPER` | emailga yuboriladigan kodlarni xeshlash (≥ 32 tasodifiy belgi). Almashtirsangiz faqat shu zahoti kutilayotgan kodlar bekor bo'ladi — xavfsiz | Production va Preview (alohida qiymatlar) |
| `AKKAUNT_EMAIL_API_KEY` | Resend API kaliti. **Bu qo'yilmaguncha production'da «Kirish» ko'rinmaydi** | faqat Production (Preview'da kerak emas) |
| `AKKAUNT_EMAIL_FROM` | ixtiyoriy: `Kalki.uz <kod@mail.kalki.uz>` (standart shu) | Production |
| `AKKAUNT_DEV` = `1` | **FAQAT Preview**: kodni emailsiz test uchun ko'rsatadi. Production'ga HECH QACHON qo'ymang (kod baribir ishlamaydi — host tekshiriladi — lekin qo'ymang) | faqat Preview |
| `AKKAUNT_ADMIN_PASSWORD` | Preview'da test kodini olish paroli (yo'q bo'lsa `KALKIFIT_ADMIN_PASSWORD` ishlatiladi) | Preview |

## Kalit yo'qolsa nima bo'ladi?

Kalit **faqat tiklash kodlarini o'rab turuvchi konvertni** ochadi; foydalanuvchining bulutdagi ma'lumoti (blob) tiklash kodining o'zi bilan shifrlangan va kalitga **bog'liq emas**.

| Holat | Oqibat |
|---|---|
| Kalit yo'qoldi, lekin 2–3-qadamdagi nusxa bor | Hech narsa bo'lmaydi. Nusxani Cloudflare'ga qayta kiriting |
| Hamma nusxa yo'qoldi | Eski konvertlarni **hech kim ocha olmaydi**. Yangi kalit yaratiladi (`2:…`). Akkauntlar, kirish va marketing roziligi saqlanib qoladi. Telefonida ilova ochiq/kirgan foydalanuvchilarning ilovasi tiklash kodini qayta yuboradi (yangi kalit bilan qayta o'raladi) — ular sezmaydi. **Xavf:** telefoni ham yo'qolgan VA tiklash kodini yozib qo'ymagan foydalanuvchi bulutdagi ma'lumotini ocha olmaydi. «Qat'iy rejim»dagilar bundan ta'sirlanmaydi (ularda konvert yo'q) |
| Kalit boshqaga ko'rinib qoldi / sizib chiqdi | Darhol 6-qadamdagidek yangi versiyaga o'ting, eski konvertlarni qayta o'rang va eskisini olib tashlang. Baza ham sizmagan bo'lsa, xavf kam (ikkalasi birga kerak) |
| Cloudflare akkaunti buzildi | Kalitni almashtiring + Cloudflare parolini/2FA ni yangilang + `AKKAUNT_OTP_PEPPER`, email kaliti, admin parollarni almashtiring |

**Qoida:** kalit foydalanuvchi ma'lumotining ustidagi «qulf» emas, «zaxira eshigi». Eng xavfsiz foydalanuvchilar uchun «qat'iy rejim» (konvertsiz) mavjud bo'ladi.
