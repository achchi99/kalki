# Ariza generatori — savol-javobli rejim (FAZA 0)

Sana: 2026-09-21. Kod o'zgartirilmadi — faqat tekshiruv va reja.

## 0.A — Tanlangan tur: faqat "moddiy yordam" (`atype='yordam'`)

Boshlang'ich taxmin "2-3 tur" edi — tekshiruv shuni ko'rsatdiki, ishonchli
signal faqat BITTA tur uchun bor. Foydalanuvchi bilan kelishilgan qaror:
qamrovni sun'iy kengaytirmasdan, faqat shu tur bilan davom etish.

**To'rt mustaqil signal "moddiy yordam"ga to'planadi:**
1. GSC `Запросы.csv`da (416 ta top-so'rov) 8 turdan **faqat shu biri**
   uchun mos so'rov bor: "moddiy yordam ariza namunasi" (6 ko'rsatilish).
   Qolgan 7 turning birortasi uchun so'rov topilmadi.
2. Bu turning **o'zining alohida to'liq generatori** allaqachon bor
   (`moddiy-yordam-arizasi-namunasi.html`) — ilgari qilingan mahsulot
   qarori, talab borligidan dalolat.
3. `ariza-namunasi.html`ning o'z "Tayyor ariza matnlari" tezkor-nusxa
   blokida ham bor (3 ta karta ichida).
4. `doc_request` yoki shunga o'xshash atype-darajasidagi GA hodisasi
   **yo'q** — bu FAZA'ga kiritilmaydi (pastga qarang).

Qolgan 7 tur (`malumotnoma`, `nusxa`, `ruxsat`, `qabul`, `qayta`,
`shikoyat`, `erkin`) — signalsiz, hozirgi forma rejimida qoladi,
o'zgartirilmaydi.

## 0.B — Savol qatorlari

| # | Savol (UZ) | Savол (RU) | Javob turi | Majburiymi | Variantlar |
|---|---|---|---|---|---|
| 1 | Yordamga ehtiyoj sababi nima? | В связи с чем нужна помощь? | tanlov (radio/seg) | ha | Sog'liq holati / Oilaviy vaziyat / Boshqa sabab — "Boshqa" tanlansa qisqa erkin matn maydoni ochiladi (majburiy) |
| 2 | Oilangizda necha kishi bor? | Сколько человек в семье? | raqam | yo'q (ixtiyoriy) | — |

Savol tartibi: avval sabab (asosiy da'vo — nima uchun ariza yozilyapti),
keyin tafsilot (oila soni) — FAZA 1'dagi "nima uchun → tafsilot" mantiqi
bilan bir xil.

## 0.C — Matn yig'ish qolipi

```
sabab="sogliq"           → "sog'liq holatim yomonlashgani sababli"
                            "в связи с ухудшением состояния здоровья"
sabab="oilaviy"           → "oilaviy vaziyatim sababli"
                            "в связи с семейными обстоятельствами"
sabab="boshqa" + matn     → "{matn} sababli"
                            "в связи с {matn}"

oila soni kiritilgan bo'lsa → ", oilamda {N} kishi bor" qo'shiladi
                              ", в семье {N} человек/человека" (RU sonlarga qarab
                              to'g'ri turlanadi — mavjud KD.ruPlural orqali)
oila soni bo'sh bo'lsa       → bu qism umuman tushib qoladi (ilova/telefon
                              kabi shartli bandlar naqshida)

Yakuniy jumla:
UZ: "Menga moddiy yordam ko'rsatishingizni so'rayman — {sabab_band}{oila_band}."
RU: "Прошу оказать мне материальную помощь — {sabab_band}{oila_band}."
```

**⚠️ Sifat bahosi qo'shilmaydi.** Hozirgi shablonda hali ham "Og'ir
moddiy ahvolim sababli..." degan qattiq old-hukm bor (bu — audit
hujjatining eng birinchi topilmasi, 0.1-band, FAZA 1'da tegilmagan
qolgan edi — faqat bo'sh joylar alohida maydonlarga bo'lingan edi,
matnning o'zi o'zgartirilmagan). Ushbu FAZA aynan shu so'zni butunlay
olib tashlaydi: yangi jumla faqat foydalanuvchi tanlagan/yozgan
faktdan tuziladi, "og'ir"/"murakkab"/"mushkul" kabi baho so'zlari
hech qanday qolipda ishlatilmaydi.

## Kelajak uchun eslatma — `doc_request` hodisasi

Ariza turi (`atype`) tanlovini alohida trek qiluvchi GA hodisasi hali
yo'q va **bu FAZA'ga kiritilmaydi**. Agar kelajakda ikkinchi yoki
uchinchi turni savol-javob rejimiga o'tkazish kerak bo'lib qolsa:

1. Avval shu hodisa (`doc_request` yoki shunga o'xshash, `atype`
   qiymati bilan) qo'shilsin.
2. 3–4 hafta kuzatilsin.
3. Shundan keyingina qaysi tur ko'proq tanlanayotgani asosida qaror
   qilinsin.

Bu — CTR tuzatish va kirill pilot loyihalarida qo'llanilgan "avval
kuzatish, keyin kengaytirish" naqshining o'zi. Signalsiz kengaytirish
— mol-mulk solig'i / 1C↔portal loyihalaridagi xatoning teskarisi
bo'ladi, undan ataylab saqlanilmoqda.
