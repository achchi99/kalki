/* kalki.uz — KalkiFit bazasi: v78 «Baza tekshirildi» tuzatishlari (tools/ovqatlar-build.js chaqiradi).
 * pre(out)  — baza-v2 DAN OLDIN: nomlar («A / B» birlashtirilganlar ajratildi), birliklar (bir toifada bir xil), eski id'larni yashirish (id'lar tarix uchun saqlanadi).
 * post(foods) — baza-v2 DAN KEYIN: ustuvor ro'yxat (data/baza-ustuvor.json) bo'yicha «tekshirilgan: true» va «manba» (qisqa) belgilari — FAQAT avtomatik tekshiruvdan o'tganlarga.
 * Foydalanuvchining eski yozuvlariga TEGILMAYDI (id'lar va birlik kalitlari lug'atda qoladi). Hisob va natija: docs/baza-tekshiruv-v78.md */
'use strict';
const fs = require('fs'), path = require('path');
const R = (p) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', p), 'utf8'));

/* qidiruvdan yashiriladigan eski/birlashtirilgan pozitsiyalar (id saqlanadi: foydalanuvchi tarixi) */
const YASHIR = ['tm-evos-lavash-yengil', 'lapsha-udon'];
/* nomlar: id → [UZ, RU] */
const NOM = {
  'aminokislota': ['BCAA (aminokislotalar)', 'BCAA (аминокислоты)'],
  'tm-bellissimo-pitsa-gosht': ["Bellissimo — Go'shtli pitsa (kombo, o'rta, 30 sm)", 'Bellissimo — Пицца мясная (комбо, средняя)'],
  'chapati': ['Chapati (yupqa lepyoshka)', 'Чапати (тонкая лепёшка)'],
  'funchoza': ['Funchoza salat (chapche)', 'Фунчоза (салат чапче)'],
  'qurt': ['Qurt (kurut)', 'Курт'],
  'kafe-chuchvara-shorva': ["Chuchvara sho'rva (kafe)", 'Чучвара в бульоне (кафе)'],
  'chuchvara-sho': ["Chuchvara (sho'rvada, eski)", 'Чучвара в бульоне'],
  'chuchvara-qovurma': ['Qovurilgan chuchvara', 'Жареная чучвара'],
  'chuchvara-qatiq': ['Chuchvara (qatiq bilan)', 'Чучвара с катыком'],
  'pelmeni': ['Pelmeni (rus pelmenisi)', 'Пельмени (русские)'],
  'kok-chuchvara': ["Ko'k chuchvara (ko'katli)", 'Кук-чучвара (с зеленью)'],
  'tr-kofte': ['Kofte (turk go\'shtli kotletchalari)', 'Кёфте (турецкие котлетки)'],
  'qozon-kabob': ['Qozon kabob', 'Казан-кабоб'],
  'tandir-gosht': ["Tandir go'sht", 'Тандыр-гушт (мясо из тандыра)'],
  'qovurdoq': ['Qovurdoq', 'Ковурдак (жаркое)'],
  'xonim': ['Xonim (xanum)', 'Ханум'],
  'norin': ['Norin', 'Нарын'],
  'non-oq': ['Oq non (buxanka)', 'Булка (белый хлеб)'],
  'somsa-qat': ['Somsa (qatlamali, parmuda)', 'Самса слоёная (пармуда)'],
};
/* qiymat/manba tuzatishlari: id → { k,p,f,c, m, ms:{u,r} } (baza-v2 `ms` ni o'zgartirmaydi) */
const QIYMAT = {
  qurt: { k: 355, p: 42, f: 12, c: 20, m: 'Quritish modeli: USDA 172182 (tvorog) suvi ~8 % gacha, tuz ~6 %',
    ms: { u: "Qurt (kurut) — qatiqdan suzilgan, tuzlangan va quritilgan shar. Hisob: USDA FDC 172182 (tvorog, 81 kkal/100 g, suv ~81 %) suvi ~8 % gacha quritilsa ≈ 395 kkal, tuz ~6 % qo'shilsa ≈ 355 kkal/100 g. Ishlab chiqaruvchiga qarab ±15–20 % farq qiladi (yog'li/yog'siz qatiq). 1 kichik dona ≈ 12 g (~43 kkal), 1 katta dona ≈ 25 g (~89 kkal). Tarozida tekshirilmagan.", r: 'Курт (курут) — отжатый из катыка, посоленный и высушенный шарик. Расчёт: USDA FDC 172182 (творог, 81 ккал/100 г, вода ~81 %) при сушке до ~8 % воды ≈ 395 ккал, с солью ~6 % ≈ 355 ккал/100 г. Зависит от производителя (жирный/нежирный катык), ±15–20 %. 1 маленький шарик ≈ 12 г (~43 ккал), 1 большой ≈ 25 г (~89 ккал). На весах не проверялось.' } },
};
/* birliklar: id → [[kalit, gramm], ...] (g100 avtomatik qo'shiladi). Standart porsiya — real grammlar */
const BIRLIK = {
  'qurt': [['dona_s', 12], ['dona_l', 25]],                            // kichik ~10–15 g, katta ~25 g
  'non': [['dona', 350], ['bolak', 88]],                               // 1 obi non ≈ 350 g, chorak ≈ 88 g (yarim — porsiya oynasida «Yarim»)
  'shashlik': [['six', 80], ['porsiya', 200]],                         // 1 six ≈ 80 g pishgan go'sht (4–5 bo'lak)
  'shashlik-tovuq': [['six', 70], ['porsiya', 200]],
  'jigar-kabob': [['six', 60], ['porsiya', 150]],
  'lyulya': [['six', 90], ['porsiya', 200]],
  'shashlik-dumba': [['six', 40]], 'shashlik-yurak': [['six', 40]],
  'mastava': [['kosa', 350]],
  'chuchvara': [['kosa', 400], ['dona', 12]],          // standart — sho'rvada (1 kosa 400 g); suvsiz/qovurma uv da
};
/* toifa bo'yicha yagona birlik */
const SHORVA_RE = /sho'rva|shurva|mastava|moshxo'rda|moshkichiri|kuksi|chalop|kesma|unash|mampar|okroshka|solyanka|borsh|uxa|buloni|krem-sup/i;
const SHORVA_ID = /^(shurva|mastava|moshxorda|moshkichiri|kuksi|chalop|kesma|unash|mampar|okroshka|solyanka|borsch|qaynatma-baliq|tovuq-bulon|sut-oshi|guruch-shurva|besh-don|yasmiq|loviya-shurva|baliq-shurva|kafe-.*(shurva|mastava|moshxorda)|uy-tovuq-shurva|shurva-|tr-(mercimek|ezogelin)|togramach|noxat-shurva|kafe-chuchvara-shorva)/;
const QAHVA_ID = /^(kofe|qahva|amerikano|raf|mokka|tr-qahva|kakao|latte|kapuchino|espresso)/;
const CHOY_ID = /^(choy|yashil-choy|kok-choy|otli-choy|choy-|tr-choy|shirchoy)/;
const nm = (f) => f.n + ' ' + f.r;
/* USDA hisobi (baza-manba-v78.js): ±15 % ichida bo'lsa qiymat o'zgarmaydi, aks holda hisob qiymati olinadi. O'zgarishlar OZGARISH ga yoziladi */
const OZGARISH = [];
function manbaHisob(out) {
  const usda = R('data/manba/usda-sr-legacy.json').foods, SRC = require('./baza-manba-v78.js'), idx = Object.fromEntries(out.map((f) => [f.i, f]));
  const r1 = (x) => Math.round(x * 10) / 10;
  for (const [id, expr] of Object.entries(SRC)) {
    if (id === 'QOLDA') continue; const f = idx[id]; if (!f) throw new Error('baza-manba-v78: bazada yo\'q ' + id);
    const ps = expr.split('+').map((x) => { const i = x.lastIndexOf('*'), tok = x.slice(0, i), g = +x.slice(i + 1); return { tok, g, U: tok === 'suv' ? null : usda[tok.replace(/^u:/, '')] }; });
    ps.forEach((x) => { if (x.tok !== 'suv' && !x.U) throw new Error('baza-manba-v78: USDA yo\'q ' + x.tok + ' (' + id + ')'); });
    const G = ps.reduce((a, x) => a + x.g, 0), sum = (k) => ps.reduce((a, x) => a + (x.U ? x.U[k] * x.g : 0), 0) / G;
    const h = { k: Math.round(sum('kcal')), p: r1(sum('p')), f: r1(sum('f')), c: r1(sum('c')) }, farq = (f.k - h.k) / Math.max(1, h.k), tashqari = Math.abs(farq) > 0.15;
    const fdc = ps.filter((x) => x.U).map((x) => x.tok.replace(/^u:/, '')).join(', ');
    if (tashqari) { OZGARISH.push({ id, n: f.n, eski: f.k, yangi: h.k, sabab: 'USDA hisobi (FDC ' + fdc + ') ' + h.k + ' kkal/100 g; avvalgi qiymat manbasiz edi, ' + Math.round(farq * 100) + ' % farq' }); f.k = h.k; f.p = h.p; f.f = h.f; f.c = h.c; }
    const single = ps.length === 1 && ps[0].U;
    f.m = single ? 'USDA FDC ' + fdc + ', tekshirilgan 2026-11-15' : 'Hisob: ' + ps.map((x) => x.g + ' g ' + x.tok).join(' + ');
    f.ms = { u: single ? 'USDA FoodData Central, fdc_id ' + fdc + ' («' + ps[0].U.d + '»), 100 g uchun: ' + ps[0].U.kcal + ' kkal. Bazadagi qiymat ' + (tashqari ? 'USDA ga moslab yangilandi' : 'USDA bilan ±15 % ichida (' + f.k + ' kkal)') + '.' : 'Standart retsept hisobi (tayyor taomning 100 g ida): ' + ps.map((x) => x.g + ' g — ' + (x.U ? x.U.d : 'suv')).join('; ') + '. USDA FDC id: ' + fdc + '. Hisob ' + h.k + ' kkal/100 g; bazadagi qiymat ' + (tashqari ? 'hisobga moslab yangilandi' : '(' + f.k + ') hisob bilan ±15 % ichida') + '. Uy retseptiga qarab ±15 % farq bo\'lishi mumkin.',
      r: single ? 'USDA FoodData Central, fdc_id ' + fdc + ', на 100 г: ' + ps[0].U.kcal + ' ккал. Значение в базе ' + (tashqari ? 'обновлено по USDA' : 'в пределах ±15 % от USDA (' + f.k + ' ккал)') + '.' : 'Расчёт по стандартному рецепту (на 100 г готового блюда): ' + ps.map((x) => x.g + ' г').join(' + ') + ', данные USDA FDC (fdc_id ' + fdc + '). Расчёт ' + h.k + ' ккал/100 г; значение в базе ' + (tashqari ? 'обновлено по расчёту' : '(' + f.k + ') в пределах ±15 %') + '. В зависимости от домашнего рецепта возможно отклонение ±15 %.' };
    f.e = single ? 0 : 1;
  }
}
function pre(out) {
  manbaHisob(out);
  const idx = Object.fromEntries(out.map((f) => [f.i, f]));
  YASHIR.forEach((id) => { if (idx[id]) idx[id].h = 1; });
  for (const [id, [n, r]] of Object.entries(NOM)) if (idx[id]) { idx[id].n = n; idx[id].r = r; }
  const al = { qurt: ['kurt', 'курт', 'курут', 'qurut', 'kurut', 'qurt sut', 'shor qurt', 'qatiq qurt', 'qurut shor'], 'tm-evos-lavash-yengil': [] };
  for (const [id, a] of Object.entries(al)) if (idx[id]) idx[id].a = Array.from(new Set((a.length ? a : [])));
  if (idx['tm-evos-lavash-yengil']) idx['tm-evos-lavash-yengil'].a = [];
  ['tm-evos-lavash-lavashello', 'tm-evos-lavash-fitter'].forEach((id) => { if (idx[id]) idx[id].pp = 2; });          // «evos lavash» qidiruvida asosiy o'lcham (M) birinchi qoladi
  for (const [id, q] of Object.entries(QIYMAT)) if (idx[id]) Object.assign(idx[id], q, { e: 1 });
  for (const [id, u] of Object.entries(BIRLIK)) if (idx[id]) idx[id].u = u.concat([['g100', 100]]);
  out.forEach((f) => {
    const u = f.u; const keep = (fn) => { const nu = u.filter(fn); if (nu.length > 1) f.u = nu; };
    if (QAHVA_ID.test(f.i) && f.t === 'i') keep((x) => x[0] !== 'stakan' && x[0] !== 'piyola');           // qahva/kakao — faqat chashka
    else if (CHOY_ID.test(f.i) && f.t === 'i' && !/sovuq|ice|lipton|fuze/.test(f.i)) keep((x) => x[0] !== 'stakan' && x[0] !== 'chashka');      // issiq choy — faqat piyola
    else if (f.t === 'o' && !f.h && (SHORVA_ID.test(f.i) || (SHORVA_RE.test(f.n) && !/lag'mon|chuchvara|qovurma/i.test(f.n)))) keep((x) => x[0] === 'kosa' || x[0] === 'g100' || x[0] === 'qoshiq');      // sho'rva — faqat kosa
  });
  return out;
}
/* baza-v2 DAN KEYIN: yagona nomlar (yangi taomlar uchun) va ishonch belgilari */
function post(foods) {
  const A = require('./baza-audit.js'), U = R('data/baza-ustuvor.json').ids, set = new Set(U), idx = Object.fromEntries(foods.map((f) => [f.i, f]));
  for (const [id, [n, r]] of Object.entries(NOM)) if (idx[id]) { idx[id].n = n; idx[id].r = r; }
  const out = { tekshirilgan: 0, yiqilgan: [] };
  for (const f of foods) {          // baza-v2 da qo'shilgan taomlar uchun ham: bir toifada bir xil birlik
    let ok = null;
    if (f.t === 'o' && !f.h && (SHORVA_ID.test(f.i) || (SHORVA_RE.test(f.n) && !/lag'mon|chuchvara|qovurma/i.test(f.n)))) ok = (k) => k === 'kosa' || k === 'g100' || k === 'qoshiq';
    if (ok) { const nu = f.u.filter((x) => ok(x[0])); if (nu.length > 1 && nu.length < f.u.length) { f.u = nu; f.b = (f.b || []).filter((b) => ok(b.k)); } }
  }
  for (const f of foods) {
    delete f.tekshirilgan; delete f.manba;
    if (!set.has(f.i)) continue;
    const bad = A.gate(f); if (bad.length) { out.yiqilgan.push({ id: f.i, sabab: bad }); continue; }
    f.tekshirilgan = true; f.manba = A.manbaOf(f); out.tekshirilgan++;
  }
  return out;
}
module.exports = { OZGARISH, post, pre, YASHIR, NOM, BIRLIK, SHORVA_RE, SHORVA_ID, QAHVA_ID, CHOY_ID };
