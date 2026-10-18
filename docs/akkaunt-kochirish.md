# Akkaunt (email + kod bilan ixtiyoriy kirish) — boshqa serverga (O'zbekiston VPS) ko'chirish

Hozir akkaunt Cloudflare Pages Functions + D1 da ishlaydi. Keyin hammasi O'zbekistondagi VPS'ga **birga** ko'chadi (zaxira bilan bir xil yo'l: `docs/zaxira-kochirish.md`).
Ko'chirish shuning uchun oson: D1 va xat yuborish **ikkita alohida qatlam** orqali, sirlar esa faqat env'da.

## Arxitektura (nima qayerda)

| Qatlam | Fayl | Ko'chirishda |
|---|---|---|
| Ilova (brauzer) | `assets/app-akkaunt.js` — `var AKKAUNT_API = '/api/akkaunt';` | **faqat shu bitta qator** o'zgaradi (boshqa domen bo'lsa — pastdagi CORS/cookie) |
| HTTP API | `functions/api/akkaunt/[amal].js` (kod, kirish, sessiya, limitlar, Origin) | yangi serverda xuddi shu mantiq (yoki shu fayl; Node/Hono/Express) |
| Saqlash qatlami | `functions/_lib/akkaunt-store.js` — **D1'ga bog'liq yagona fayl** | Postgres uchun shu faylni almashtirish |
| Xat yuborish | `functions/_lib/akkaunt-email.js` — `rejim` / `yubor` / `devOl` | VPS'dan chiqadigan SMTP yoki boshqa provayder uchun shu faylni almashtirish |
| Server kaliti | `functions/_lib/akkaunt-kalit.js` (env `AKKAUNT_MASTER_KEYS`) | env'ni **aynan shu qiymat** bilan ko'chirish (`docs/akkaunt-kalit.md`) |
| Jadvallar | `migrations/akkaunt.sql` | Postgres uchun `tools/akkaunt-export.js` chiqargan DDL |
| Eksport / import | `tools/akkaunt-export.js`, `tools/akkaunt-import.js` | ko'chirish vositasi |

Saqlash qatlami shartnomasi (`akkaunt-store.js` sarlavhasida ham yozilgan; qaytish shakli o'zgarmasin):

```
ping()                                                   → true | xato
akkauntEmail(email) / akkauntId(id)                      → { id, email, usul, yaratilgan, oxirgi_kirish, marketing, marketing_vaqt, marketing_matn_v } | null
akkauntYarat({ id, email, usul, now })                   → true | false
kirishBelgila(id, now) / marketingYoz(id, rozi, now, matnV)
kodYoz({ email, maqsad, hash, now, muddat })             → eski ishlatilmagan kodlar bekor, yangisi yoziladi
kodTekshir({ email, maqsad, hash, now, maxUrinish })     → 'ok' | 'yoq' | 'qulf' | 'xato'      ← ATOMIK bo'lishi shart (pastga qarang)
sessiyaYarat / sessiyaOl / sessiyaYangila / sessiyaOchir / sessiyalar / sessiyaOchirHammasi
limit(kalit, oynaMs, lim, now)                           → { ok, soni, qayta }                   ← ATOMIK upsert
audit(akkauntId, hodisa, now) / akkauntOchir(id, email) / yuklab(id) / tozala(now) / sanoq()
```

**Atomiklik (xavfsizlik uchun SHART):**
- `kodTekshir`: avval `UPDATE kirish_kodi SET urinish = urinish+1 WHERE id=? AND ishlatilgan=0 AND urinish < max` (0 qator → `'qulf'`), keyin xesh solishtirish, to'g'ri bo'lsa `UPDATE … SET ishlatilgan=1 WHERE id=? AND ishlatilgan=0` (aynan 1 qator o'zgarsa → `'ok'`). Shunda parallel taxminlar ham sanaladi va kod faqat bir marta o'tadi.
- `limit`: bitta `INSERT … ON CONFLICT DO UPDATE … RETURNING` (Postgres'da ham xuddi shunday ishlaydi; oyna tugagan bo'lsa hisoblagich 1 ga qaytadi).

Postgres'da farqlar: vaqt ustunlari `BIGINT` (millisekund), `AUTOINCREMENT` o'rniga `BIGSERIAL`, `?` o'rniga `$1…`. Tayyor DDL: `node tools/akkaunt-export.js … --dialect postgres` chiqargan `.sql` ichida (yoki `--sqlite` bilan bo'sh baza nusxasidan).

## Nimalar ko'chadi, nimalar yo'q

| Ma'lumot | Ko'chadimi |
|---|---|
| `akkaunt` (email, usul, vaqtlar, marketing roziligi + vaqti + matn versiyasi) | **Ha** — asosiy |
| `sessiya` | Ixtiyoriy (`--sessions`). Ko'chirmasangiz hamma bir marta qaytadan kiradi (email kodi bilan) — oddiy va xavfsizroq |
| `audit` | Ixtiyoriy (`--audit`) |
| `kirish_kodi`, `limit_hisob` | **Yo'q** (10 daqiqalik/soatlik vaqtinchalik) |
| Zaxira blob'lari (`zaxira`) | Alohida: `docs/zaxira-kochirish.md` |
| Server kaliti (`AKKAUNT_MASTER_KEYS`), `AKKAUNT_OTP_PEPPER`, email kaliti | Env orqali; **master kalit o'zgarmasa** eski konvertlar ochiladi (B bosqichdan keyin) |

## Qadamlar

1. **Yangi serverni tayyorlang.** Postgres + HTTP xizmat; API mantig'ini (`[amal].js`) ishga tushiring. Env'lar: `AKKAUNT_OTP_PEPPER`, `AKKAUNT_MASTER_KEYS` (B dan keyin), email provayder kaliti/SMTP, `IP_HASH_SALT`, `AKKAUNT_ADMIN_PASSWORD` (preview uchun). Hech qaysi sir repoga tushmasin.
2. **Saqlash va xat qatlamini almashtiring.** `akkaunt-store.js` ni Postgres variantiga, `akkaunt-email.js` ni yangi yuboruvchiga. Qaytish shakllari bir xil bo'lsa, API'ga tegilmaydi.
3. **Eksport (D1 → fayl).** `npx wrangler login` dan keyin:
   ```bash
   node tools/akkaunt-export.js --db kalkifit --out akkaunt-export --format both --dialect postgres
   # sessiyalarni ham ko'chirmoqchi bo'lsangiz: --sessions    (audit uchun: --audit)
   ```
   Fayllar `0600` ruxsat bilan yoziladi. **Ular email manzillarini saqlaydi — maxfiy**: shifrlangan diskda saqlang, ishlatgach o'chiring, repoga/chatga yubormang.
4. **Import.**
   - Postgres: `psql "$DATABASE_URL" -f akkaunt-export.sql` (bir tranzaksiya; qayta yurgizish xavfsiz — `ON CONFLICT`).
   - SQLite/tekshiruv uchun: `node tools/akkaunt-import.js akkaunt-export.json --to sqlite --db yangi.sqlite --tekshir` (qatorlar eksportga aynan mosligini tekshiradi).
   - Boshqa dialekt uchun SQL: `node tools/akkaunt-import.js akkaunt-export.json --to sql --dialect postgres --out yuklash.sql`.
   Tekshiring: `SELECT COUNT(*), SUM(marketing) FROM akkaunt;` — D1 dagi `wrangler d1 execute kalkifit --remote --command "SELECT COUNT(*), SUM(marketing) FROM akkaunt"` bilan bir xil bo'lsin.
5. **CORS va cookie.** Agar API `kalki.uz` bilan **bir domenda** (masalan reverse-proxy orqali `/api/akkaunt/*`) bo'lsa — hech narsa kerak emas, cookie o'z-o'zidan ishlaydi (`__Host-kalki_s`, domen belgilanmaydi). Agar **boshqa domen** bo'lsa (`https://akkaunt.kalki.uz`): `Access-Control-Allow-Origin: https://kalki.uz` (aniq origin, `*` emas), `Access-Control-Allow-Credentials: true`, `Allow-Headers: Content-Type, X-Admin-Password`, OPTIONS javobi; ilovadagi fetch'larga `credentials: 'include'` va cookie'ni `Domain=.kalki.uz; SameSite=None; Secure` ga o'zgartirish kerak (`__Host-` prefiksi bunda ishlamaydi) — shuning uchun **bir domen tavsiya etiladi**.
6. **Almashtirish.** Dastlab trafikni ikkalasiga bo'lmang: (a) yangi serverni sinang (bitta test email bilan kod → kirish → chiqish → o'chirish), (b) `AKKAUNT_API` qatorini (yoki proxy qoidasini) yangi manzilga o'tkazing, (c) eski D1 jadvallarini 30 kun saqlab, keyin o'chiring.
7. **Maxfiylik sahifasi.** `maxfiylik.html` da «Qayerda saqlanadi» (hozir: Cloudflare) O'zbekiston serveriga yangilansin (UZ/RU; ЎЗ avtomatik) va sana o'zgarsin.
8. **Eski D1 ni tozalash.** Ko'chirish tasdiqlangach: `DELETE FROM akkaunt; DELETE FROM sessiya; …` (yoki jadvallarni DROP) — email manzillari ikki joyda qolmasin.

## Sinov ro'yxati (ko'chirishdan keyin)

- Kod so'rash → xat keldi (mail.ru, gmail) → kirish → `sessiya` kirgan:true → chiqish.
- Eski akkaunt (eksportdan) o'z emaili bilan kira oladi; `marketing` qiymati saqlangan.
- 5 noto'g'ri kod → qulf; 60 s kutish; soatlik limit ishlaydi.
- Akkauntni o'chirish → bazadan butunlay yo'qoladi.
- `npm run test:tez` (akkaunt testlari `store` qatlamini shim bilan sinaydi; yangi store uchun shim o'rniga haqiqiy baza bilan shu testlarni qayta yurgizing).
