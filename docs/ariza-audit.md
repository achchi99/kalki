# Ariza generatori — FAZA 0 diagnostika

Sana: 2026-09-21. Kod o'zgartirilmadi — faqat tekshiruv.

## 0.A — Tayyorlik tekshiruvi

**Qayerda yashaydi:** umumiy, `assets/docgen.js:704-724` (`renderPreview()`). Barcha
hujjat generatorlari shu bitta funksiyani ishlatadi.

**Qanday ishlaydi:** `docBody`ga chizilgan hujjat matnini emas, balki
`currentBlocks()` orqali qaytgan struktura bloklarini aylanadi va har bir
matn qismida `KD.hasBlanks(text)` chaqiradi. `KD.hasBlanks` faqat
`{{_N}}` tokenini qidiradi (`assets/docgen.js:225,241`) — bu token
`KD.v(val, width)` funksiyasi orqali hosil bo'ladi: qiymat bo'sh bo'lsa
`KD.blank(width)` qaytadi, aks holda qiymatning o'zi. Ya'ni mexanizm
**maydonlarni emas — `KD.v()` orqali o'tgan qiymatlarni** kuzatadi.
Bu o'z-o'zidan noto'g'ri emas: imzo chizig'idagi qo'lda yozilgan
`_______________` kabi literal chiziqlar token emas, shuning uchun
tekshiruvga aralashmaydi (loyihaning o'zi shunga mo'ljallab qurilgan).

**Xato qayerda:** `ariza-namunasi.html:277-307` dagi `TPL` ob'ekti.
Ariza turi tanlanganda (`atype` select, `onSet:` — 387-qator)
`state.body`ga **tayyor matn** yoziladi — bu matn `KD.v()` orqali
o'tmaydi, ichida literal `______________________` chiziqlari bor
(masalan `yordam` turi: "Ahvolimning sababi: ______________________.
Oilamda ______ nafar shaxs bor."). `doc()` funksiyasida (427-433-qator)
bu matn to'g'ridan-to'g'ri paragraflarga bo'linib qo'yiladi — `KD.v()`
chaqirilmaydi, faqat matn butunlay bo'sh bo'lgandagina `B(60)` (haqiqiy
blank token) qo'yiladi. Natija: foydalanuvchi shablonni tanlab, faqat
bir qismini to'ldirsa (yoki umuman tahrirlamasa-da, matn bo'sh emas),
`hasBlanks` hech narsa topmaydi va "Hamma joy to'ldirilgan" ko'rsatiladi
— **haqiqatan xato, tasdiqlangan.**

**Qamrov — real tekshiruv, 20 ta hujjat-generator sahifasi:** har birida
`TPL`/shablon+`onSet`+erkin-matn-`area` kombinatsiyasi qidirildi.
Faqat **`ariza-namunasi.html`da** bor. Solishtirish uchun
`moddiy-yordam-arizasi-namunasi.html` (xuddi shu "moddiy yordam" mavzusi)
tekshirildi — u yerda "sabab" **alohida maydon** (`reasonTxt`,
`t:'area'`, majburiy, shablon bilan oldindan to'ldirilmaydi) —
to'g'ri arxitektura, xato yo'q.

**Xulosa (0.A qamrovi): bitta sahifa** — `ariza-namunasi.html`. `docgen.js`ning
o'zida (umumiy mexanizmda) xato yo'q; muammo shu sahifaning o'ziga xos
dizayn qarori — bitta erkin matn maydonini oldindan shablon bilan
to'ldirish, blank-token orqali emas.

## 0.B — Huquqiy da'volar

`ariza-namunasi.html`dagi barcha huquqiy/protsessual da'volar ro'yxati
va lex.uz #2509996 ("Jismoniy va yuridik shaxslarning murojaatlari
to'g'risida"gi qonun, amaldagi tahrir) bilan solishtiruvi. Manba —
WebSearch + WebFetch orqali lex.uz'dan olingan, modda raqamlari va
qisqa iqtiboslar bilan; bu birlamchi manbaning avtomatik o'qilishi —
qat'iy yuridik xulosa uchun yakuniy tasdiqni yurist yoki qo'lda
o'qish bilan qo'shimcha tekshirish tavsiya etiladi.

| # | Da'vo (qayerda) | Holat | Asos |
|---|---|---|---|
| 1 | "Og'zaki so'rov qabul qilinishi mumkin, lekin uning topshirilgani hech qayerda qayd etilmaydi va javob berish muddati ham boshlanmaydi." — `whatIsText` (327-q.), statik `whatIsSection` (259-q.), `seo` bloki intro (331-q.), RU tarjimalari | ✅ TO'G'RI | 19-modda faqat "ariza yoki shikoyat" (yozma shakl) uchun muddat belgilaydi ("...davlat organiga kelib tushgan kundan e'tiboran o'n besh kun ichida..."). Og'zaki murojaatni ro'yxatga olish haqida alohida norma yo'q (8-modda faqat shaxsni tasdiqlovchi hujjat talabini beradi). |
| 2 | "Kimdan" qismida ... telefon raqami ko'rsatiladi. Telefon muhim..." + "Majburiy bandlar" jadvali: "Kimdan → F.I.Sh., manzili, **telefon raqami**" + "Tipik xatolar": "telefon raqamini yozmaslik" xato sifatida sanaladi — `seo` bloki (331-q.) | ❌ NOTO'G'RI | 6-modda yozma murojaatning majburiy rekvizitlarini sanaydi: F.I.Sh., yashash joyi (manzil), murojaat mazmuni, imzo. **Telefon raqami ro'yxatda yo'q** — majburiy emas. Sahifa buni "majburiy band" va "xato" sifatida taqdim etadi — bu haddan tashqari qat'iy, noto'g'ri. |
| 3 | "...bu nusxa arizangiz topshirilganini isbotlaydigan **yagona dalil**/**yagona hujjat**" — `tipTxt` (321-q.), FAQ Q1 javobi (457-q.), `seo` bloki "Arizani qanday topshirish kerak?" (331-q.) | ⚠️ QISMAN | Qonunda bunday "yagona dalil" formulasi yo'q — bu amaliy tavsiya, huquqiy norma emas. Matnning o'zi ham o'ziga zid: bir necha qatordan keyin pochta xabarnomasi va elektron murojaat raqami ham "dalil" sifatida tilga olinadi. "Yagona" so'zi haddan tashqari qat'iy — amaliy tavsiya sifatida yumshatish kerak. |

Boshqa joylardagi umumiy gaplar (FAQ'dagi "Javob qancha vaqtda keladi",
"warnTxt" — "yuridik maslahat emas" izohi) aniq muddat yoki majburiy
rekvizit da'vo qilmaydi, faqat "tashkilotdan/rasmiy manbadan aniqlang"
deydi — bular xavfsiz, o'zgartirish shart emas.

**Xulosa (0.B qamrovi): bitta sahifa** — faqat `ariza-namunasi.html`
tekshirildi (vazifa qamrovi shunday belgilangan). Bu sahifa **faqat
"ish beruvchiga ariza"** emas — generator 8 xil ariza turini qamraydi,
ulardan ba'zilari (masalan "Qarorni qayta ko'rib chiqish so'rovi",
"Shikoyat/murojaat") davlat organiga murojaatga ham tegishli bo'lishi
mumkin. Hozirgi matnda "davlat organiga murojaat" va "ish beruvchiga
ariza" farqlanmaydi — FAZA 1'da bu ham hisobga olinishi kerak (foydalanuvchi
spetsifikatsiyasi 1.2'da aytilganidek).

## 0.C — "Havola" maxfiyligi

**Mexanizm:** `assets/docgen.js:812-830` (`shareBtn.onclick`) — umumiy,
barcha hujjat generatorlari va kalkulyatorlar shu bitta funksiyani
ishlatadi. `url = location.origin + location.pathname + '?p=' +
b64encode(ctx.state)` — **butun `ctx.state` ob'ekti** (formadagi HAR
BIR maydon, ko'rinadigan-ko'rinmasidan qat'iy nazar) base64'ga
kodlanadi. Bu oddiy base64 (`btoa`/`atob`), shifrlash emas — har kim
URL'ni ko'rsa, bir soniyada dekodlay oladi.

**Muhim topilma — ogohlantirish allaqachon bor:** tugma bosilganda
`confirm()` chiqadi: *"Havolada siz kiritgan ma'lumotlar (F.I.Sh.,
pasport, summalar) bo'ladi. Faqat ishonchli odamga yuboring. Davom
etamizmi?"* (818-q.). Ya'ni dasturchilar xavfni bilishgan va
ogohlantirishgan — bu **butunlay yashirin sizib chiqish emas**. Lekin
xavf baribir qoladi: havola Telegram/SMS tarixida, brauzer tarixida,
server (proxy/analytics) loglarida saqlanib qoladi — "ishonchli odam"ga
yuborilgan bo'lsa ham, kanal butunlay xavfsiz emas.

**Amaliy tasdiq** — `ariza-namunasi` uchun namuna holat qo'lda
kodlanib, dekodlandi:

```
Kirish: F.I.Sh.=Karimov Bobur Sobirovich, manzil, telefon, JSHSHIR,
"body" (erkin matn: "...xotinim og'ir kasal...")

Hosil bo'lgan havola:
https://kalki.uz/ariza-namunasi?p=eyJ0b09yZyI6...(415 belgi)

Dekodlangandan keyin (?p= ichida — 1 soniyada, shifrlashsiz):
{ "toOrg", "toPost", "toFio", "frFio": "Karimov Bobur Sobirovich",
  "frAddr": "Toshkent sh., ...", "frPhone": "+998901234567",
  "frJshshir": "52807881234567", "atype", "body": "...",
  "attach", "signDate" }
```

F.I.Sh., manzil, telefon, JSHSHIR va erkin matn — **hammasi bor**,
filtrlash yo'q.

**Qamrov — sitewide:** `shareBtn` 61 ta sahifada ishlatiladi (barcha
kalkulyatorlar + barcha hujjat generatorlari), chunki mexanizm
`docgen.js`da umumiy. Shaxsiy ma'lumot **faqat** hujjat generatorlarida
xavfli — kalkulyatorlarning maydonlari (tekshirilgan namuna:
`kredit-kalkulyator.html`, `oylik-soliq-kalkulyator.html`) faqat raqam/tanlov,
`text`/`tel` turdagi maydon yo'q. Shaxsiy ma'lumot xavfi ostidagi **20 ta
hujjat-generator sahifasi** (barchasi bir xil `b64encode(ctx.state)`
mexanizmini ishlatadi):

```
ariza-namunasi, avto-oldi-sotdi-shartnomasi-namunasi,
davo-arizasi-namunasi, ishdan-boshash-arizasi-namunasi,
ish-haqi-malumotnomasi-namunasi, kadr-buyruqlari-namunasi,
mehnat-shartnomasi-namunasi, kafolat-xati-namunasi,
ijara-shartnomasi-namunasi, tatil-arizasi-namunasi,
tolov-hisobi-namunasi, tavsifnoma-namunasi, ishonchnoma-namunasi,
topshirish-qabul-dalolatnomasi-namunasi, uy-oldi-sotdi-shartnomasi,
moddiy-yordam-arizasi-namunasi, xizmat-korsatish-shartnomasi-namunasi,
qurilish-pudrat-shartnomasi-namunasi, oquv-tatili-arizasi-namunasi,
talabnoma-namunasi, tilxat-namunasi
```

**Xulosa (0.C qamrovi): butun sayt** (docgen.js darajasida) — bitta
sahifada tuzatib bo'lmaydi, chunki mexanizm barcha 20 generator uchun
umumiy. Tuzatish `docgen.js`da (masalan har bir field'ga `share:false`
belgisi qo'shib, shareBtn shu belgili maydonlarni chiqarib tashlashi)
qilinishi kerak — FAZA 1.3 shu tarzda rejalashtirilsin.

## Uch masalaning qamrovi — qisqa xulosa

| Masala | Qamrov | Tuzatish qayerda |
|---|---|---|
| 0.A Tayyorlik tekshiruvi | **1 sahifa** (ariza-namunasi.html) | Shu sahifaning `TPL`/`doc()` qismi |
| 0.B Huquqiy da'volar | **1 sahifa** (vazifa shunday belgilagan) | Shu sahifaning matn/JSON-LD qismlari |
| 0.C Havola maxfiyligi | **Butun sayt**, 20 ta generator | `assets/docgen.js` (umumiy mexanizm) |

FAZA 1 — tasdiqdan keyin boshlanadi.
