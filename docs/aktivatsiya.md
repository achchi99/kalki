# Aktivatsiya o'lchovi (yashirin — foydalanuvchiga ko'rinmaydi)

Savol: yangi foydalanuvchi qaysi bosqichda yo'qolyapti? Anonim: faqat belgilar (ovqat nomi, matn, vazn, yosh yuborilmaydi).

## Hodisalar (mijoz → `/api/stat`, `functions/api/stat.js` whitelist)
- `ilk_ochilish` — qurilma ilovani ilk marta ochganda (holat yo'q edi), BIR marta. Flag `kalki_stat_ilk`: `1` — kogorta, `0` — eski qurilma (o'lchanmaydi).
- `birinchi_ovqat` `<usul>.<guruh>` — kogorta qurilmasining birinchi ovqati, BIR marta (flag `kalki_stat_bo`). Usul: qidiruv · oxirgilar (Yaqinda) · rasm · matn · ovoz · menyu · odatdagi · kechagidek · retsept · tavsiya · boshqa. Guruh — onboarding tugashidan: `d5` 0–5 daq · `d30` 5–30 · `d120` 30–120 · `dx` 2 soat+ · `dn` vaqt noma'lum. Onboarding vaqti faqat qurilmada (`kalki_stat_obt`), yuborilmaydi.
- paketdagi `i` (0|1) — bosh ekranga qo'shilgan (standalone) yoki Android ilova.

## `stat_qurilma` ustunlari (`migrations/aktivatsiya.sql`)
`ilk` (0/1) · `bk_ovqat` (ilk kundagi ovqat soni 0,1,2,3+) · `birinchi_usul` · `ob_ovqat_vaqt` · `pwa_ornatilgan` (1/0). NULL = o'lchanmagan. Migratsiyadan oldingi qatorlar va ilk bo'lmagan qurilmalar NULL — admin'da «o'lchanmagan» (0 emas). Migratsiya yurgizilmasa server oldingi INSERT'ga tushadi, hisobot `null`.

## Admin: «Aktivatsiya voronkasi» (`/admin/kalkifit-statistika`)
Ilk ochilish → onboarding tugadi → ilk kunda ≥1 ovqat → ≥3 ovqat → D1 → D3 → D7 (veb / Android / PWA / jami; `n / N · %`, D — faqat yetilgan kogorta). Taqqoslash: (a) ilk kunda ovqat kiritgan va kiritmagan D1; (b) bosh ekranga (ilk kunda) qo'shgan va qo'shmagan D1/D7. Birinchi ovqat usuli va vaqt guruhlari ulushi. Ostida «O'lchov boshlangan» sana va undan oldingi (o'lchanmagan) qurilmalar soni.

## Eslatma
`yangi_foydalanuvchi` va `onboarding_tugadi` onboarding TUGAGANDA yuboriladi — shuning uchun ular o'zaro deyarli teng (ilgari «onboarding 94%» deb o'qilgan raqam haqiqiy tugatish foizi emas edi). Haqiqiy voronka tepasi — `ilk_ochilish`.
Testlar: `aktivatsiya` (server), `aktivatsiya-ui` (mijoz + admin).
