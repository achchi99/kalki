# Bugungi ovqatlar (vaqt chizig'i) va Tarix — oylik natija (v63)

Maket: `~/tarix-maket.html` (foydalanuvchilarga eski ekranlar «juda sodda» ko'rindi). Hisob faqat ko'rinishga tegadi — ma'lumotlar (`st.days[d].food`) o'zgarmaydi.

## Bugungi ovqatlar (`mealsHtml` — Bugun va Tarix'dagi kun tafsiloti)
- **Vaqt chizig'i:** chapda gradient chiziq (nonushta sariq → tushlik yashil → kechki ko'k → tamaddi binafsha, tokenlar `--fcyei/--fcgri/--fcbli/--fcpui`), har ovqat kartasida rangli nuqta.
- **To'lgan karta:** ikonka (44 px), nom, «08:10 · 4 ta mahsulot» (birinchi yozuv vaqti — faqat shu kunning o'zida yozilgan bo'lsa), mini halqa 52 px (ichida kkal; to'lishi = «Kun tartibi» yoqilgan bo'lsa shu ovqat budjeti, aks holda kunlik limitdan ulush), sarlavhada «+». Ekran ochilganda halqa 0 dan to'ladi (`ringMem`, animatsiya tugamasdan uzilmaydi — `ringPend`).
- **Birlashtirish:** bir ovqat vaqtida bir xil mahsulot (taom id yoki nom + variant + o'lcham) — bitta qator «Olma ×3» (miqdor: bir xil birlik bo'lsa yig'indi, aks holda gramm; kkal yig'indisi). Bosilsa — `mlgrp` oynasi: alohida yozuvlar (tahrir / o'chirish + «Bekor qilish»).
- **> 4 qator (birlashgandan keyin) — yig'ilgan:** ustma-ust 4 ta rasm + «+N» + «Ochish ›»; ochilgach «Yig'ish».
- **Bo'sh ovqat vaqti:** ixcham qator — «~N kkal qoldirilgan» (Kun tartibi bo'lsa) yoki «Hali yo'q», yashil «↺ Kechagidek» chipi (kecha shu vaqtda yozuv bo'lsa), «+». Joy yetmasa chip + «+» ikkinchi qatorga o'tadi.
- Sarlavha yonida «710 / 2 737 kkal» (kunlik limit — halqadagi bilan bir xil).
- Animatsiya: kartalar 65 ms oraliqda (`--mx`, faqat ilova ochilgandagi stagger), reduced-motion'da yo'q.

## Tarix — oylik natija (`calHtml`)
- Kalendar ustida 3 plitka (`S.monthSummary`, `KalkiPlato.monthDelta`): **Yozilgan kun** (yozilgan / kuzatuv boshlanganidan beri), **O'rtacha kkal** (faqat to'liq kunlar), **Vazn** (oy boshidan trend o'zgarishi; yo'q bo'lsa «—»; rang — faqat maqsad tomon bo'lsa yashil, qizil yo'q).
- **Kun halqasi:** to'lishi = iste'mol / limit (≤ 100%); maqsadda yashil, kamroq ko'k, ko'proq sariq; qisman — uzuq-uzuq kulrang; ma'lumotsiz — xira raqam; bugun — to'la aksent doira. Kamida 36 px (360 px'da ~40). Halqalar ekran ochilganda bir marta to'ladi (`@property --cp`, `.cin` 2,6 s; oy almashtirganda qayta emas).
- Izoh — ixcham chiplar («Maqsadda · 2»…), pastda kichik «Kuzatuv boshlangan».
- **Seriya kartasi:** gradient (`--hero1..3`), 🔥 4 marta «nafas», «8 kun ketma-ket», «Rekordingiz — N kun. Davom eting!» (rekord emas: «Rekord: N kun»), o'ngda oxirgi 7 kun (`S.streakWeek`); seriya yo'q — tinch karta. Rekord — `S.bestStreak`.
- Seriya hazillari (`data/hazillar.json`, `streak` / `streak7`) qayta yozildi: tushunarsiz taqqoslar («Eslatmalar endi o'zini ortiqcha his qilmoqda», choynak, hisobchi, muqova) olib tashlandi; RU'da «дн.» + 2-jumla qoidasiga ko'ra son birliksiz («Серия — {days}.»).

## Testlar
`node tools/test-tarix2.js` (`--only tarix2`): rekord, 7 kun, oy xulosasi, vazn trendi, hazil matnlari. `tools/dizayn/test-tarix2.mjs` (`--only tarix2-ui`): vaqt chizig'i, birlashish va ochilishi, yig'ilgan holat, bo'sh qator, animatsiya, plitkalar, halqa ranglari/to'lishi, seriya matni (uz/ЎЗ/ru), 360/390 × 115% × yorug'/tungi AA.
