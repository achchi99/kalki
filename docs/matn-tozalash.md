# Matn tozaligi (2026-10-12)

Skaner: `node tools/matn-skaner.mjs` (`--json`, `--all` — istisnolarni ham ko'rsatadi). Istisnolar: `tools/matn-istisno.json`. verify-all band 34 — OGOHLANTIRISH (chiqish kodiga ta'sir qilmaydi).

Qoidalar: (1) bitta so'z ichida lotin+kirill; (2) UZ lotin matn ichida alohida kirill so'z (ko'rinadigan matn, title/meta, JSON-LD, skript satrlari; ruscha satrlar va brend/format nomlari orasidagi "Word или PDF" kabilar hisobga olinmaydi); (3) /cyr/: kirill matn ichida qolgan lotin so'z va translit izlari (ёъ, оъ, гъ, qolgan apostrof).

## Tuzatilgan (aniq xato)
| sahifa | topilgan | tuzatildi |
|---|---|---|
| ipoteka-2026 | «daromadingizning 40% идан oshmasligini» (UZ matn, 2 joyda) | «40%idan» |
| uy-qurish-kalkulyator (UZ + RU sahifadagi UZ lug'at) | «Kalitli» — материал + ish | «Kalitli» — material + ish |

## Shubhali (TUZATILMADI, tools/matn-istisno.json da)
- bolalar-nafaqasi-2026, ipoteka-kalkulyator: meta description oxirida ruscha qidiruv iborasi («Детское пособие 2026», «Ипотечный калькулятор онлайн») — SEO uchun atayin bo'lishi mumkin.
- tatil-arizasi-namunasi: «(график отпусков)» — qavs ichida ruscha kasbiy atama.
- /cyr/: MHTEKM, QQS, DTM, YHXX, PDF, Word, Excel, Kalki.uz lotincha qoladi (tools/translit.js DEFAULT_ABBR — atayin).
- /cyr/aliment: «MHTEKMнинг» — qisqartma + kirill qo'shimcha aralash so'z. tools/translit-test.js da shu natija hujjatlashtirilgan qaror; o'zgartirish translit.js da qisqartmani himoya qilishni qo'shimcha oldidan olib tashlashni (МҲТЕКМнинг, ПДФга) talab qiladi.

## "Yangilangan" sanasi o'zgarmasligi
tools/prerender.js `CASCADE_COMMIT_RE` ga `matn:` prefiksi qo'shildi: bunday commit'lar sana hisobida e'tiborga olinmaydi (design: kabi). Tuzatish commit'i `matn:` bilan boshlanadi; faqat 2 ta sahifa (+RU nusxa) qayta prerender qilindi, diff'da sana qatorlari yo'q.
