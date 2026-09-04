# Premium kod sinxronizatsiyasi — bot ↔ sayt

> Bu ikkita mustaqil joyda yashaydi: **bot** (`/home/asror/bots/6_kalki_premium_bot/`,
> serverda, alohida git repo emas) va **sayt** (shu repo,
> `assets/hisobsiyosati.js`, `PREMIUM.kodlar`). Ular orasida avtomatik
> ulanish YO'Q — statik sayt backend'siz, bot esa alohida serverda ishlaydi.
> Kod ikkalasida ham QO'LDA bir xil bo'lishi kerak, aks holda mijoz bottan
> kod olsa ham saytda ochilmaydi (yoki aksincha — eski kod hali ishlayveradi).

## Yagona manba

**Kod har doim botning `.env` faylida tug'iladi**
(`/home/asror/bots/6_kalki_premium_bot/.env`, `UNLOCK_CODE=`). Sayt bu
qiymatni faqat KO'CHIRIB oladi — hech qachon saytda mustaqil o'ylab
topilmaydi. Shu tartib buzilsa (masalan saytda kod o'zgartirilib, botda
eski qolsa), mijoz botdan tasdiq olib ham saytni ocholmaydi.

## Oylik yangilash tartibi (B1 — docs/premium-reja.md, 3-band)

1. Yangi tasodifiy kod o'ylab toping (masalan `KALKI-2026-10-X7QP`
   formatida — taxmin qilib bo'lmaydigan, lekin telefon orqali diktovka
   qilish qulay bo'lishi uchun aralash harf+raqam, 8-12 belgi).
2. **Botda**: `/home/asror/bots/6_kalki_premium_bot/.env` faylida
   `UNLOCK_CODE=<yangi kod>` qiling, so'ng:
   ```
   sudo systemctl restart kalki-premium-bot
   ```
3. **Saytda**: `assets/hisobsiyosati.js`dagi `PREMIUM.kodlar` massiviga
   yangi kodni qo'shing (eskisini olib tashlash shart emas — bir necha
   kunlik o'tish davri uchun ikkalasi ham qolishi mumkin):
   ```js
   kodlar: ['ESKI-KOD', 'KALKI-2026-10-X7QP'],
   ```
4. `npm run ship` ishga tushiring, `npm run check` 26/26 ekanini
   tasdiqlang, commit + push qiling.
5. Eski kodni olib tashlash — keyingi oy yangilashda, 3-bandning o'zi
   (eskisini o'chirib, faqat yangisini qoldirish).

## Tekshirish

Yangilashdan keyin:
- Botga `/start` yuborib javob kelishini tekshiring.
- Saytda "To'liq versiyani olish" oynasiga yangi kodni kiritib, haqiqatan
  ochilishini tekshiring (`sessionStorage`, brauzerni yangilab qayta
  tekshirish shart emas — bir marta ochilsa yetarli).

## Nega bu qo'lda va nima uchun xavfli emas

`docs/premium-reja.md`dagi B1 qaroriga ko'ra: kod client-side tekshiriladi,
avtomatik yetkazib berish (webhook/API) O'zbekiston to'lov tizimlari
cheklovi tufayli qurilmaydi (0.1-band). Bu — vaqtinchalik kamchilik emas,
joriy arxitekturaning ongli tanlovi. Qo'lda sinxronlash xatosi past narx
va tor auditoriya sharoitida (0.3-4-1.2-bandlar) qabul qilingan xavf.
