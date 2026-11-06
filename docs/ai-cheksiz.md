# Cheksiz AI (akkaunt belgisi) — v74

- **Belgi:** D1 `akkaunt.ai_cheksiz` (0/1). Migratsiya: `migrations/ai-cheksiz.sql` (ustun + `ai_cheksiz_kun` jadvali). Yurgizishdan oldin `~/backups` ga eksport.
- **Yoqish/o'chirish:** admin → Foydalanuvchilar → qatorni oching → «Cheksiz AI yoqish». `POST /api/admin/ai-cheksiz { akkaunt, yoq }`; jurnal: `audit` (`admin_ai_cheksiz_yoq` / `_ochir`). Email kodda yo'q.
- **Tekshiruv faqat serverda:** `functions/_lib/ai-cheksiz.js` — HttpOnly sessiya cookie → `sessiya` → `akkaunt.ai_cheksiz`. `mijoz_id`, sarlavha, tana (`ai_cheksiz`) e'tiborsiz. Xato/ustun yo'q — oddiy limit (xavfsiz tomon).
- **Qamrov:** `takeKfQuota` (rasm/yorliq `img`, menyu `mn`, matn `tx`, ovoz `ov`, retsept `rt`). Taklif/yorliq yuborish (`tk`, `yq`) AI so'rovi emas — o'zgarmaydi.
- **Chegara:** kuniga 150 ta (barcha xizmatlar jami, `KUNLIK_CHEGARA`); oshsa 429 (sabab `cheksiz`) va admin'da ogohlantirish. Butun sayt kunlik tavani (`site`) saqlanadi.
- **Ilova:** server `qoldi: 9999` qaytaradi → «Bugun yana N ta» o'rniga «Cheksiz» (`T()` da `LEFT_KEYS`).
- **Admin statistika:** Foydalanuvchilar sahifasi tepasida «Cheksiz AI — kunlik hisob» (kun, akkaunt, xizmat bo'yicha son, taxminiy xarajat `NARX_TAXMINIY` × son), `GET /api/admin/ai-cheksiz-stat`.
- **Testlar:** `ai-cheksiz` (server), `kalkifit-topilmadi` («Cheksiz» ko'rinishi).

# Qidiruv hisobi (v74)
`qidiruv_jami` (har xil so'rov, seansda bir marta) va `qidiruv_natijasiz` — anonim hisoblagich, so'zsiz. Admin: «Natijasiz qidiruv: N%» (7 kun).
