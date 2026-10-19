# «Baliq kuni» eslatmasi (Web Push)

Haftada **bitta** push — standart payshanba, foydalanuvchi «Boshqa kun» tanlasa o'sha kun; 11:00 Toshkent (06:00 UTC). «Baliq yoqtirmayman» deganga yuborilmaydi. Boshqa push yo'q. Bosilganda «Baliq kuni» oynasi ochiladi (buyurtma · kafe · uyda) — qarang: `docs/yeymiz.md`.

## Qismlar
| Qism | Qayerda |
|---|---|
| Obunalar (D1 `push_obuna`, natija `push_holat`) | `migrations/push.sql` |
| API: kalit, obuna, o'chirish, admin | `functions/api/push/[amal].js` |
| Shifrlash + VAPID (tashqi paketsiz) | `tools/webpush.js` (RFC 8291/8292) |
| Yuboruvchi (cron) | `tools/push-yubor.js` |
| Matnlar (5 variant, UZ/RU; ЎЗ — translit) | `data/baliq-kuni.json` |
| Bildirishnoma ko'rsatish/bosish | `sw.js` (`push`, `notificationclick`) |
| Ilova: Profil qatori, Kun yakuni taklifi, payshanba banneri, Baliq guruhi | `assets/kalkifit-app.js` |

## Nega Hetzner cron (Cloudflare Worker emas)
Pages'da cron yo'q; alohida Worker = yana bir deploy/secret/D1 binding. Hetzner'da Node bor, `~/.cf-token` va `~/.kalkifit-vapid` shu yerda, skript 100 qator. Kamchilik: server o'chsa eslatma ketmaydi — admin sahifada «oxirgi yuborish» sanasi buni ko'rsatadi.

Cron (server vaqti UTC):
```
0 6 * * *  cd ~/projects/kalki && node tools/push-yubor.js >> ~/.kalkifit-push.log 2>&1
```
Production'da `push_obuna` jadvali yo'q bo'lsa (kod main'ga chiqmaguncha) skript «jadval yo'q» deb chiqib ketadi.

## Kalitlar
`~/.kalkifit-vapid` (chmod 600, JSON: `publicKey`, `privateKey`, `subject`) — **zaxiralang** (yo'qolsa hamma obuna eskiradi, foydalanuvchilar qayta yoqishi kerak). Cloudflare secret'lari: `VAPID_PUBLIC_KEY` (API ochiq kalitni beradi), `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

## Sinash (faqat o'z obunangizga)
1. Preview'da (telefon, Chrome/Android yoki Bosh ekranga qo'shilgan iPhone) `…/kalkifit?pushtest=1` → Profil → «Baliq kuni eslatmasi» → Yoqish → ruxsat bering.
2. `node tools/push-yubor.js --muhit preview --royxat` → obuna id'lari; `node tools/push-yubor.js --muhit preview --obuna <id-boshi>` yoki akkauntga ulangan bo'lsa `--test <email>`.
3. Admin: `GET /api/push/holat` (sarlavha `X-Admin-Password`) → `{ obunalar, akkaunt_bilan, til, oxirgi }`.

## Release'da (main'ga chiqarilganda)
1. `migrations/push.sql` ni production D1'ga yurgizing.
2. Yangilik yozuvi (`data/yangiliklar-kalkifit.json`): «Baliq kuni eslatmasi».
3. Cron allaqachon turibdi.
