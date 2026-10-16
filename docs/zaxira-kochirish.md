# Zaxira (bulutga saqlash) — boshqa serverga (masalan, O'zbekiston) ko'chirish

KalkiFit va Ro'zg'or «Bulutga saqlash» funksiyasi **uchidan-uchiga shifrlangan**: server faqat `id` (kodning SHA-256 hosilasi) va AES-GCM blob'ni biladi. Shu sababli ko'chirishda ma'lumotni **qayta shifrlash shart emas** — `id` va kalit foydalanuvchi kodidan olinadi va yangi serverda ham bir xil chiqadi.

## Arxitektura (nima qayerda)

| Qatlam | Fayl | Ko'chirishda |
|---|---|---|
| Ilova (brauzer) | `assets/app-backup.js` — `var ZAXIRA_API = '/api/zaxira';` | **faqat shu bitta qator** o'zgaradi |
| HTTP API | `functions/api/zaxira.js` (GET/PUT/DELETE, limitlar, Origin) | yangi serverda xuddi shu mantiq (yoki shu fayl) |
| Saqlash qatlami | `functions/_lib/zaxira-store.js` — **D1'ga bog'liq yagona fayl** | Postgres uchun shu faylni almashtirish |
| Jadval | `migrations/zaxira.sql` | Postgres uchun `tools/zaxira-export.js` chiqargan DDL |

Saqlash qatlami shartnomasi (4 funksiya, qaytish shakli o'zgarmasin):

```
get(id)                              → { id, ilova, blob, versiya, yangilangan } | null
put(id, ilova, blob, kutilgan, now)  → { ok: true, versiya } | { ok: false, versiya }   // kutilgan = mijoz bilgan versiya (yangi yozuv uchun 0)
del(id)                              → true | false
count()                              → son
```
`put` **atomik** bo'lishi shart: `kutilgan === 0` → faqat yozuv yo'q bo'lsa qo'shadi; `kutilgan > 0` → `UPDATE … WHERE id=? AND ilova=? AND versiya=?` (mos kelmasa hech narsa yozilmaydi va `ok:false` + joriy versiya qaytadi; shu 409 to'qnashuvini beradi).

Postgres namunasi (`pg` paketi, `makeStore(env)` o'rniga):

```js
export function makeStore(env) {
  const pool = env.PG_POOL; if (!pool) return null;
  return {
    async get(id) { const r = await pool.query('SELECT id, ilova, blob, versiya, yangilangan FROM zaxira WHERE id = $1', [id]); return r.rows[0] || null; },
    async put(id, ilova, blob, kutilgan, now) {
      const r = kutilgan === 0
        ? await pool.query('INSERT INTO zaxira (id, ilova, blob, versiya, yangilangan) VALUES ($1,$2,$3,1,$4) ON CONFLICT (id) DO NOTHING', [id, ilova, blob, now])
        : await pool.query('UPDATE zaxira SET blob=$1, versiya=versiya+1, yangilangan=$2 WHERE id=$3 AND ilova=$4 AND versiya=$5', [blob, now, id, ilova, kutilgan]);
      if (r.rowCount === 1) return { ok: true, versiya: kutilgan === 0 ? 1 : kutilgan + 1 };
      const cur = await this.get(id); return { ok: false, versiya: cur ? cur.versiya : 0 };
    },
    async del(id) { return (await pool.query('DELETE FROM zaxira WHERE id = $1', [id])).rowCount > 0; },
    async count() { return Number((await pool.query('SELECT COUNT(*) AS c FROM zaxira')).rows[0].c); }
  };
}
```
(`yangilangan` — millisekund, shuning uchun Postgres'da `BIGINT`.)

## Qadamlar

1. **Yangi server tayyorlash.** Postgres + HTTP xizmat (Node/Cloudflare Worker emas bo'lsa — Express/Fastify). `api/zaxira.js` dagi mantiq (limitlar, 1 MB, Origin) ni o'sha yerda ishga tushiring; `x-forwarded-for`/IP xeshi uchun `IP_HASH_SALT`, kunlik sanoqlar uchun KV o'rniga Redis yoki jadval.
2. **CORS.** Yangi domen boshqa origin bo'lsa (`https://zaxira.kalki.uz` va h.k.), javoblarda `Access-Control-Allow-Origin: https://kalki.uz`, `Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS`, `Access-Control-Allow-Headers: Content-Type` bo'lsin va `OPTIONS` (preflight) javob bersin. Origin tekshiruvi (`https://kalki.uz`, `https://www.kalki.uz`) saqlansin.
3. **Eksport (D1 → fayl).** `npx wrangler login` dan keyin:
   ```
   node tools/zaxira-export.js --db kalkifit --out zaxira-export --format both --dialect postgres
   ```
   Natija: `zaxira-export.json` (zaxira nusxa/tekshiruv uchun) va `zaxira-export.sql` (`CREATE TABLE` + `INSERT … ON CONFLICT`). Lokal D1 nusxasidan: `--sqlite path/to/db.sqlite`. Fayllar shifrlangan blob'larni o'z ichiga oladi — maxfiy saqlang va ishlatilgach o'chiring.
4. **Import.** `psql "$DATABASE_URL" -f zaxira-export.sql` (bir tranzaksiyada; qayta yurgizish xavfsiz — `ON CONFLICT`). Tekshiring: `SELECT COUNT(*) FROM zaxira;` — D1'dagi `wrangler d1 execute kalkifit --remote --command "SELECT COUNT(*) FROM zaxira"` bilan bir xil bo'lsin.
5. **Dual-write/kesish (kutish oynasi).** Eksportdan keyin ham eski serverga yozuvlar tushishi mumkin. Eng oddiy yo'l: eksport → import → darhol 6-qadam. Qisqa oynada yozilganlar uchun eksport/importni ikkinchi marta yurgizing (idempotent), keyin eski serverda yozishni o'chiring.
6. **Ilovada manzilni almashtirish.** `assets/app-backup.js` da bitta qator:
   ```js
   var ZAXIRA_API = 'https://zaxira.kalki.uz/api/zaxira';   // avval: '/api/zaxira'
   ```
   So'ng `node tools/sw-version.js --write` (service worker keshi yangilansin) va `npm run test:tez`; deploy.
7. **Eski manzilni vaqtincha yo'naltirish.** Eski ilova nusxalari (kesh) hali `/api/zaxira` ga murojaat qiladi. Cloudflare Pages'da env o'zgaruvchisi qo'shing: `ZAXIRA_UPSTREAM = https://zaxira.kalki.uz/api/zaxira` — eski `functions/api/zaxira.js` har bir GET/PUT/DELETE ni shu manzilga uzatadi (D1 ishlatilmaydi). 2–4 hafta o'tgach (hamma mijoz yangilangach) `ZAXIRA_UPSTREAM` ni va `functions/api/zaxira.js` ni olib tashlang.
8. **Tekshirish ro'yxati.** (a) bulutni yoqing → `PUT` yangi serverga boradi; (b) yangi qurilmada tiklash kodi bilan tiklash ishlaydi (eski yozuv ham ochiladi); (c) 409 to'qnashuvi ishlaydi; (d) «Bulutdan o'chirish» yozuvni o'chiradi; (e) `test-zaxira-api.mjs`/`test-zaxira.mjs` ni yangi saqlash qatlami bilan yurgizing (API testlari `makeStore` shartnomasiga tayanadi).
9. **Maxfiylik sahifasi.** `maxfiylik.html` dagi «Zaxira nusxa va bulutga saqlash» bo'limida «Qayerda» bandini yangilang (UZ/RU; ЎЗ avtomatik).
10. **Orqaga qaytish.** `ZAXIRA_API` ni oldingi qiymatga qaytarib, `ZAXIRA_UPSTREAM` ni olib tashlang: D1 yozuvlari o'zgarmagan (eksport faqat o'qiydi).

## Eslatma
Kod yo'qolsa, ma'lumotni hech kim (server egasi ham) tiklay olmaydi — bu dizayn xususiyati. Ko'chirishda foydalanuvchilardan hech narsa so'ralmaydi.
