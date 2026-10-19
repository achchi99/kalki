# «Bugun nima yeymiz?», Baliq kuni, Yemaydiganlarim (2-bosqich)

Kirish nuqtalari faqat IKKITA (yangi menyu/tab yo'q): **«Boshqa variantlar»** («O'rniga» kartasida) va **«Bugun nima yeymiz?»** kartasi (Bugun, «Ovqat qo'shish» ostida, bitta qatorli chiplar). Qolgan hammasi shu ikkisining ichida.

| Qism | Qayerda |
|---|---|
| Cheklov filtri (cho'chqa hech qachon) | `assets/cheklov-core.js`, `data/cheklov-teglar.json` (`tools/cheklov-teglar.js --yoz`) |
| Takliflar, Boshqa variantlar, kafe baliq | `assets/yeymiz-core.js`, `data/yeymiz.json` (guruhlar qo'lda) |
| Uyda baliq retseptlari, kishi soni, xarid ro'yxati | `data/baliq-uy.json` (`tools/baliq-uy-yasa.js --yoz`), `assets/baliq-uy-core.js` |
| Interfeys (karta, oynalar, Profil, onboarding) | `assets/kalkifit-yeymiz.js` (+ ulash: `kalkifit-app.js` `Y.*`), `assets/css/kalkifit.css` oxiri |
| Yetkazish havolalari | `assets/partners.json` (kategoriya `yetkazish`; Uzum Tezkor, Yandex Eda faol; Express24 — Yandex Eda'ga qo'shilgan, nofaol) |
| Anonim hisoblagichlar | `assets/hisob-kun.js` (navbat), `functions/api/hisob.js`, `migrations/hisob.sql`, `tools/hisob-hisobot.js` |
| Push: «Baliq yoqtirmayman», «Boshqa kun» | `functions/api/push/[amal].js` (`baliqsiz`, `kun`), `migrations/push-yeymiz.sql`, `tools/push-yubor.js` |

## Qoidalar
- Taklif avval cheklovdan o'tadi (tanlangan teglar + cho'chqa), keyin qolgan kkal sig'imi, keyin oqsil «sifati»; bir oqsil manbasidan ≤2. Taklif = ko'rsatma emas: hech narsa avtomatik yozilmaydi.
- Baliq yemaydiganga: Baliq chipi, Baliq guruhi, eslatma-banner, push, O'rniga/Boshqa variantlar/Bugun nima yeymiz? — hammasida baliq yo'q. Qidiruvda foydalanuvchi o'zi yozsa chiqadi (tanlov — uniki).
- Tashqi havolalar `target="_blank" rel="noopener"`; APK (Capacitor/Cordova) da `Browser.open` / `_system` orqali tashqi brauzerda.
- UTM/hamkor maydoni hozircha bo'sh (`append_utm: false`).

## Hisoblagichlar (anonim)
Faqat `kun + hodisa + son` (D1 `hisob_kun`). Hodisalar: `orinbosar_korsatildi`, `orinbosar_tanlandi`, `baliq_oyna_ochildi`, `baliq_buyurtma_bosildi[.xizmat]`, `baliq_kafe_yozildi`, `baliq_uyda_ochildi`, `yeymiz_ochildi`, `yeymiz_tanlandi`. Foydalanuvchi id, IP, qurilma, taom nomi, kkal, cookie YO'Q; Do Not Track'da hisoblanmaydi; xatoda jim. Hisobot: `node tools/hisob-hisobot.js --muhit preview|production [--kun 30]` (parol `~/.kalkifit-admin-pass`).

## Production'ga chiqarishda (bir marta)
1. D1 (production `kalkifit`): `migrations/hisob.sql` va `migrations/push-yeymiz.sql` (ikkinchisi bir marta). Preview'da bajarilgan.
2. Hetzner cron: `0 6 * * 4` → `0 6 * * *` (har kuni; `tools/push-yubor.js` o'zi faqat bugungi kuni bo'lgan va baliqsiz bo'lmaganlarga yuboradi).
3. `data/yangiliklar-kalkifit.json` ga yangi yozuv (ko'rinadigan reliz).
