#!/usr/bin/env node
/* kalki.uz — «Retseptimni yengillashtir» hisob yadrosi testi (assets/retsept-core.js): 6 haqiqiy uy retsepti (osh, mastava, manti, somsa, sho'rva, olivye) × UZ va RU:
 * parser (masalliq, miqdor, birlik, kishi, taom turi), kkal (faqat jadvaldan), qoidalar (taomga mos), mantiqiylik (diapazonlar), Yemaydiganlarim, cho'chqa, tanilmagan masalliq.
 *   node tools/test-retsept-core.js [--jadval]   (--jadval: hisobot jadvalini chiqaradi) */
'use strict';
const assert = require('assert'), fs = require('fs'), path = require('path');
const R = require('../assets/retsept-core.js'); R.init(JSON.parse(fs.readFileSync(path.join(__dirname, '../data/retsept-masalliq.json'), 'utf8')));
const TXT = {
  osh: { uz: "Onamning oshi (8 kishi): 1 kg guruch, 850 g qo'y go'shti, 150 g dumba, 250 ml o'simlik yog'i, 1 kg sabzi, 2 ta piyoz, 1 bosh sarimsoq, zira, tuz", ru: 'Мамин плов (на 8 человек): 1 кг риса, 850 г баранины, 150 г курдюка, 250 мл растительного масла, 1 кг моркови, 2 луковицы, 1 головка чеснока, зира, соль', rules: ['dumba', 'yog', 'gosht'], kcal: [1000, 1350], n: 8, dish: 'osh' },
  mastava: { uz: "Mastava (6 kishi): 500 g mol go'shti, 200 g guruch, 450 g kartoshka, 200 g sabzi, 2 ta piyoz, 3 ta pomidor, 70 ml o'simlik yog'i, 150 g qaymoq, ko'kat, tuz", ru: 'Мастава (на 6 человек): 500 г говядины, 200 г риса, 450 г картофеля, 200 г моркови, 2 луковицы, 3 помидора, 70 мл растительного масла, 150 г сметаны, зелень, соль', rules: ['yog', 'gosht', 'qatiq'], kcal: [420, 700], n: 6, dish: 'mastava' },
  manti: { uz: "Manti (6 kishi): 500 g un, 500 g qo'y go'shti, 100 g dumba, 600 g piyoz, 1 choy qoshiq tuz, 1 choy qoshiq qora murch, tortishga 120 g qaymoq", ru: 'Манты (на 6 человек): 500 г муки, 500 г баранины, 100 г курдюка, 600 г лука, 1 ч. л. соли, 1 ч. л. чёрного перца, к подаче 120 г сметаны', rules: ['dumba', 'gosht', 'qatiq'], kcal: [600, 900], n: 6, dish: 'manti' },
  somsa: { uz: "Somsa (8 kishi): 600 g un, 200 g sariyog', 1 stakan suv, 700 g qo'y go'shti, 200 g dumba, 500 g piyoz, 1 ta tuxum, zira, tuz", ru: 'Самса (на 8 человек): 600 г муки, 200 г сливочного масла, 1 стакан воды, 700 г баранины, 200 г курдюка, 500 г лука, 1 яйцо, зира, соль', rules: ['dumba', 'yog', 'gosht'], kcal: [650, 1100], n: 8, dish: 'somsa' },
  shorva: { uz: "Sho'rva (6 kishi): 800 g qo'y go'shti, 500 g kartoshka, 300 g sabzi, 2 ta piyoz, 3 ta pomidor, 1 ta bulg'or qalampiri, 4 osh qoshiq o'simlik yog'i, ko'kat, tuz", ru: 'Шурпа (на 6 человек): 800 г баранины, 500 г картофеля, 300 г моркови, 2 луковицы, 3 помидора, 1 болгарский перец, 4 ст. ложки растительного масла, зелень, соль', rules: ['yog', 'gosht'], kcal: [400, 780], n: 6, dish: 'shorva' },
  olivye: { uz: "Olivye (6 kishi): 4 ta kartoshka, 2 ta sabzi, 5 ta tuxum, 4 ta tuzlangan bodring, 300 g kolbasa, 200 g yashil no'xat, 1 ta piyoz, 200 g mayonez", ru: 'Оливье (на 6 человек): 4 картофелины, 2 моркови, 5 яиц, 4 соленых огурца, 300 г колбасы, 200 г зеленого горошка, 1 луковица, 200 г майонеза', rules: ['qatiq'], kcal: [330, 560], n: 6, dish: 'olivye' }
};
const rows = [];
for (const k of Object.keys(TXT)) {
  const E = TXT[k], res = {};
  for (const l of ['uz', 'ru']) {
    const p = R.parse(E[l]); const unres = p.items.filter((i) => !i.id || i.g == null);
    assert.deepStrictEqual(unres.map((i) => i.line), [], k + '/' + l + ': tanilmagan/miqdorsiz: ' + unres.map((i) => i.line + ' → ' + i.id + ',' + i.g));
    assert.strictEqual(p.kishi, E.n, k + '/' + l + ': kishi'); assert.strictEqual(p.dish, E.dish, k + '/' + l + ': taom turi ' + p.dish); assert.ok(p.nom.length > 2, k + ': nom');
    const base = R.totals(p.items, p.kishi), rules = R.suggest(p.items, { kishi: p.kishi, dish: p.dish, nom: p.nom }), after = R.totals(R.applyRules(p.items, rules), p.kishi);
    assert.ok(base.k >= E.kcal[0] && base.k <= E.kcal[1], k + '/' + l + ': porsiya kkal mantiqsiz ' + base.k); assert.ok(rules.length >= 1 && rules.length <= 4, k + ': qoidalar soni ' + rules.length);
    for (const need of E.rules) assert.ok(rules.some((r) => r.id === need), k + '/' + l + ': kutilgan qoida yo\'q: ' + need + ' (bor: ' + rules.map((r) => r.id).join(',') + ')');
    for (const r of rules) { assert.ok(['yog', 'dumba', 'gosht', 'qatiq', 'shakar', 'sabzavot'].includes(r.id)); assert.ok(r.taste >= 0 && r.taste <= 2); }
    if (k === 'olivye') for (const bad of ['yog', 'dumba', 'gosht']) assert.ok(!rules.some((r) => r.id === bad), 'olivye: ' + bad + ' mos emas');
    const ids = (L) => L.filter((i) => i.g > 0).map((i) => i.id), after2 = R.applyRules(p.items, rules);
    for (const must of ['guruch', 'un']) if (ids(p.items).includes(must)) assert.ok(ids(after2).includes(must) && after2.filter((i) => i.id === must).reduce((s, i) => s + i.g, 0) === p.items.filter((i) => i.id === must).reduce((s, i) => s + i.g, 0), k + ': asosiy masalliq (' + must + ') tegilmaydi');
    assert.ok(after.k < base.k && after.k >= base.k * 0.55, k + '/' + l + ': keyin ' + after.k + ' (oldin ' + base.k + ')'); assert.ok(after.p >= base.p * 0.9, k + '/' + l + ': oqsil kamaymasin ' + base.p + ' → ' + after.p);
    res[l] = { base, after, rules: rules.map((r) => r.id + (r.benefit < 0 ? '(' + r.benefit + ')' : '')), p };
  }
  assert.deepStrictEqual([res.uz.base.k, res.uz.after.k], [res.ru.base.k, res.ru.after.k], k + ': UZ va RU natijasi bir xil bo\'lsin'); assert.deepStrictEqual(res.uz.rules, res.ru.rules);
  rows.push([k, E.n, res.uz.base.k, res.uz.after.k, Math.round((res.uz.after.k - res.uz.base.k) / res.uz.base.k * 100) + '%', res.uz.base.p + '→' + res.uz.after.p, res.uz.base.f + '→' + res.uz.after.f, res.uz.rules.join(', ')]);
}
console.log('OK   6 retsept × UZ/RU: parser (masalliq, miqdor, birlik, kishi, taom turi), kkal mantiqiy, qoidalar taomga mos, asosiy masalliq (guruch/un) tegilmaydi, oqsil saqlanadi, UZ = RU');
/* Yemaydiganlarim: sut → qatiq qoidasi chiqmaydi */
{ const p = R.parse(TXT.mastava.uz), r = R.suggest(p.items, { kishi: 6, dish: 'mastava', yemay: ['sut'] }); assert.ok(!r.some((x) => x.id === 'qatiq'), 'Yemaydiganlarim: sut'); const r2 = R.suggest(p.items, { kishi: 6, dish: 'mastava', yemay: [] }); assert.ok(r2.some((x) => x.id === 'qatiq')); console.log('OK   Yemaydiganlarim (sut) — qatiq taklif qilinmaydi'); }
/* cho'chqa */
{ const p = R.parse("Palov (4 kishi): 500 g guruch, 300 g cho'chqa go'shti, 300 g sabzi, 100 ml yog'"); assert.ok(p.pork); assert.ok(!p.items.some((i) => /cho'chqa/.test(i.nom)), 'cho\'chqa qo\'shilmaydi'); const q = R.parse('Плов: 500 г риса, 300 г свинины, 300 г моркови'); assert.ok(q.pork); console.log('OK   cho\'chqa go\'shti — qo\'shilmaydi, ogohlantirish bayrog\'i'); }
/* tanilmagan va noaniq */
{ const p = R.parse("Taom: 2 ta kakku, 300 g go'sht, 100 g guruch, 3 osh qoshiq nimadir"); const m = Object.fromEntries(p.items.map((i) => [i.nom, i])); assert.strictEqual(p.items.filter((i) => !i.id).length, 3); const g = p.items.find((i) => /go'sht/.test(i.nom)); assert.deepStrictEqual(g.cands, ['qoy', 'mol', 'tovuq_son']); assert.strictEqual(g.g, null); console.log('OK   tanilmagan masalliq (id=null, sariq belgi), «go\'sht» — nomzodlar (qo\'y/mol/tovuq)'); }
/* birliklar */
{ const T = (id, q, b) => R.toGrams(id, q, b); assert.strictEqual(T('guruch', 1, 'kg'), 1000); assert.strictEqual(Math.round(T('yog', 250, 'ml')), 230); assert.strictEqual(T('piyoz', 2, 'dona'), 220); assert.strictEqual(T('sarimsoq', 1, 'bosh'), 40); assert.strictEqual(T('yog', 4, 'osh'), 56); assert.strictEqual(T('guruch', 1, 'ml'), null); assert.strictEqual(R.parse('1,5 kg kartoshka, 0,5 l sut, yarim stakan shakar, 1-2 kg sabzi').items.map((i) => i.g).join(','), '1500,515,100,1500'); console.log('OK   birliklar: kg/g/ml/l/dona/bosh/osh qoshiq/stakan, «1,5», «yarim», «1-2» diapazon; aylantirib bo\'lmasa — null (odam kiritadi)'); }
if (process.argv.includes('--jadval')) { console.log('\ntaom | kishi | oldin kkal | keyin kkal | o\'zgarish | oqsil | yog\' | qoidalar'); rows.forEach((r) => console.log(r.join(' | '))); }
