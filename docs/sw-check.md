# Service worker — qo'lda tekshirish ro'yxati

Service worker jsdom'da ishlamaydi. `tools/verify-sw.js` faqat kod naqshlarini
tekshiradi — haqiqiy xatti-harakatni Chrome'da ko'rish kerak.

**Nega bu muhim:** SW noto'g'ri sozlangan bo'lsa, u eski JS va HTML'ni
foydalanuvchi brauzerida muzlatib qo'yadi. Siz bugni tuzatasiz, deploy
qilasiz, o'z brauzeringizda "tuzaldi" deb ko'rasiz — qaytib keluvchi
foydalanuvchi esa eski buzuq versiyani ko'rib yuraveradi. Bu GSC'da ham,
GA'da ham ko'rinmaydi.

Har deploy'dan keyin emas, **oyiga bir marta** yoki `sw.js` o'zgargan har
safar bajaring.

---

## 1. Joriy versiyani ko'rish

1. `https://kalki.uz` ni oching.
2. DevTools (F12) → **Application** → **Service Workers**.
3. Ko'rish kerak: bitta faol worker, holati **activated and is running**.
4. **Update on reload** belgisi **o'chiq** bo'lsin — aks holda quyidagi
   tekshiruvlar haqiqiy foydalanuvchi holatini ko'rsatmaydi.

Kutilgan: «waiting to activate» holatida turgan ikkinchi worker bo'lmasligi
kerak. Agar tursa — `skipWaiting` ishlamayapti.

---

## 2. Yangi kontent oddiy yangilashda keladimi (eng muhim tekshiruv)

1. Biror sahifadagi ko'rinadigan matnni o'zgartiring (masalan
   `biz-haqimizda.html` dagi sarlavha) va deploy qiling.
2. O'sha sahifani **oddiy Ctrl+R** bilan yangilang (hard reload EMAS,
   inkognito EMAS).
3. Yangi matn **darhol** ko'rinishi kerak.

Ko'rinmasa: navigatsiya network-first emas. `tools/verify-sw.js` 6-bandi.

---

## 3. Tuzatilgan JS qaytib keluvchi foydalanuvchiga yetadimi

1. `assets/lang.js` ga vaqtincha `console.log('SW-TEST-1')` qo'shing, deploy qiling.
2. Sahifani Ctrl+R bilan yangilang → Console'da yozuv **hali chiqmasligi
   mumkin** (assets stale-while-revalidate: birinchi ochishda eski nusxa).
3. **Yana bir marta** Ctrl+R → yozuv chiqishi **shart**.

Ikkinchi yangilashda ham chiqmasa: assets cache-first bo'lib qolgan.
Sinovdan keyin `console.log` ni olib tashlashni unutmang.

---

## 4. Kesh nomlari va eskilarining tozalanishi

1. Application → **Cache Storage**.
2. Ko'rish kerak: aynan ikkita kesh — `kalki-static-<hash>` va
   `kalki-runtime-<hash>`, ikkalasida **bir xil hash**.
3. Eski hash bilan qolgan kesh **bo'lmasligi** kerak.

Uch va undan ortiq kesh ko'rinsa: `activate` da tozalash ishlamayapti yoki
eski worker hali faol.

---

## 5. Oflayn rejim

1. Network → **Offline** belgilang.
2. Avval ochilgan sahifani yangilang → keshdan ochilishi kerak.
3. Hech qachon ochilmagan sahifaga o'ting → bosh sahifa ko'rsatiladi.
4. Rasm va og PNG'lar ham ko'rinishi kerak (cache-first).

Oq ekran yoki brauzerning «No internet» sahifasi chiqsa — zaxira ishlamayapti.

---

## 6. partners.json darhol yangilanadimi

1. `assets/partners.json` da biror hamkorning `active` ni `false` qiling
   va deploy qiling.
2. `kredit-kalkulyator` sahifasini oching, hisobni bajaring.
3. O'sha hamkor **darhol** yo'qolishi kerak — ikkinchi yangilash kutilmaydi.
4. Network panelida `partners.json` so'rovi **`(disk cache)` emas**, haqiqiy
   tarmoq so'rovi bo'lishi kerak.

Yo'qolmasa: network-first buzilgan.

---

## 7. Yangi worker ochiq sahifani egallaganda

1. Sahifani ochiq qoldiring.
2. Boshqa oynadan deploy qiling (`sw.js` versiyasi o'zgaradi).
3. Ochiq sahifa **bir marta o'zi qayta yuklanishi** kerak.

Qayta yuklanmasa — eski HTML yangi JS bilan ishlab qolishi mumkin.
Ikki va undan ko'p marta qayta yuklansa — `__swReloaded` bayrog'i ishlamayapti,
bu cheksiz sikl demak, darhol tuzatish kerak.

---

## Nosozlikda tozalash

Application → Storage → **Clear site data** → sahifani yangilang.
Bu foydalanuvchi holatini emulyatsiya qilmaydi, faqat o'z brauzeringizni
tozalaydi — shundan keyin 2-bandni qaytadan bajaring.
