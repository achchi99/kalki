// KalkiFit bazasi: MANTIQIY tekshiruv (har deployda) — a–e qoidalari (tools/baza-mantiq.js) + qahva oilasi + qidiruv («кофе», «kofe», «qahva» → shakarsiz qora qahva birinchi).
//   node tools/dizayn/test-baza-mantiq.mjs
import assert from 'node:assert/strict'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const S = require(path.join(ROOT, 'assets/kalkifit-core.js')), M = require(path.join(ROOT, 'tools/baza-mantiq.js'));
const J = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ovqatlar.json'), 'utf8')); const DB = S.normFoods(J.foods); S.buildIndex(DB); const by = Object.fromEntries(DB.map((f) => [f.id, f]));
let n = 0; const log = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. a–e: ro'yxatlar bo'sh (istisnolar sababi bilan) */
const r = M.tekshir(J.foods);
for (const k of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']) assert.equal(r[k].length, 0, k + ' qoidasi buzilgan:\n' + r[k].map((x) => JSON.stringify(x)).join('\n'));
for (const k of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']) for (const key of Object.keys(M.ISTISNO[k])) assert.ok(String(M.ISTISNO[k][key]).length > 10, k + ' istisno sababsiz: ' + key);
log('a–i: ziddiyat yo\'q (istisnolar: ' + ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map((k) => k + '=' + (r['istisno_' + k] || []).length).join(', ') + ')');
/* 2. qoida o'zi ishlaydi: sun'iy ziddiyatlar topiladi */
let _c = 0; const mk = (o) => { _c++; return Object.assign({ i: 'x' + _c, n: 'N' + _c, r: 'R' + _c, k: 10, p: 0, f: 0, c: 2.5, t: 'i', u: [['stakan', 200], ['g100', 100]] }, o); };
const bad = M.tekshir([mk({ i: 'k1', n: 'Kofe', k: 30 }), mk({ i: 'k2', n: 'Kofe (shakar bilan)', r: 'Кофе с сахаром', k: 10 }), mk({ i: 'k3', n: 'Kakao', u: [['piyola', 200], ['g100', 100]] }), mk({ i: 'k4', n: 'Choy (shakarsiz)', r: 'Чай', k: 40 }), mk({ i: 'k5', n: 'Dub', r: 'Дуб', k: 400, p: 0, c: 0 }), mk({ i: 'k6', n: 'Dub', r: 'Дуб2' })]);
assert.equal(bad.a.length, 1, JSON.stringify(bad.a)); assert.equal(bad.b.length, 1, JSON.stringify(bad.b)); assert.ok(bad.c.length >= 1); assert.ok(bad.d.length >= 1); assert.equal(bad.e.length, 1); log('qoidalar sun\'iy ziddiyatni topadi (a–e)');
const bad2 = M.tekshir([mk({ i: 'f1', n: 'Evos — Lavashello / Fitter', r: 'Лавашелло / Фиттер', t: 'q' }), mk({ i: 'f2', n: 'Mastava', r: 'Мастава', t: 'o', u: [['kosa', 350], ['piyola', 300], ['g100', 100]] }), mk({ i: 'kofe-x', n: 'Qahva', r: 'Кофе', t: 'i', u: [['chashka', 200], ['stakan', 250], ['g100', 100]] }), mk({ i: 'f3', n: 'Osh', r: 'Одна миска плова', t: 'o', u: [['kosa', 250], ['g100', 100]] })]);
assert.ok(bad2.f.length >= 2, 'f: «A / B» topilmadi'); assert.ok(bad2.g.length >= 2, 'g: birlik aralashmasi topilmadi: ' + JSON.stringify(bad2.g)); assert.equal(bad2.h.length, 1, 'h: «миска» topilmadi'); log('yangi qoidalar f–h sun\'iy ziddiyatni topadi');
/* 3. qahva oilasi: har birlikda kkal mantiqli, qo'shimcha kamaytirmaydi */
const kk = (f, u) => { const x = f.u.find((q) => q[0] === u); return x ? Math.round(f.k * x[1] / 100 * 10) / 10 : null; };
const kofe = by.kofe; assert.ok(kofe && kofe.fam, 'kofe oilasi'); assert.ok(!kofe.u.some((x) => x[0] === 'piyola'), 'qahvada «piyola» yo\'q');
const vars = {}; for (const v of kofe.fam.ax[0].o) { vars[v.i] = S.famVariant(kofe, { turi: v.i }); assert.ok(!vars[v.i].u.some((x) => x[0] === 'piyola'), v.i + ': piyola yo\'q'); }
assert.ok(kk(vars.qora, 'chashka') <= 5, 'qora qahva 1 chashka ≤ 5 kkal: ' + kk(vars.qora, 'chashka'));
for (const v of Object.keys(vars)) for (const u of ['chashka', 'stakan']) { const a = kk(vars[v], u); if (a == null || v === 'qora') continue; assert.ok(a > kk(vars.qora, u), v + ' ' + u + ' qora qahvadan kam emas'); }
assert.ok(kk(by['qahva-shakar'], 'chashka') >= kk(by.kofe, 'chashka') + 30, 'qora + 2 ch.q shakar ≥ qora + 30 kkal');
assert.ok(kk(by['qahva-shakar'], 'chashka') > 35 && kk(by['qahva-shakar'], 'chashka') < 50, 'qora + 2 ch.q shakar ≈ 41 kkal: ' + kk(by['qahva-shakar'], 'chashka'));
assert.ok(kk(by['qahva-sutli-shakar'], 'chashka') > kk(by['qahva-sutli'], 'chashka') + 30, 'sutli + shakar > sutli');
assert.ok(kk(by['qahva-sutli'], 'chashka') > kk(by.kofe, 'chashka'), 'sutli > qora');
assert.ok(kk(by.amerikano, 'chashka') < 10 && kk(by.espresso, 'dona') < 5, 'amerikano/espresso kam kkal');
assert.ok(kk(vars['3in1'], 'chashka') > 60 && kk(vars['3in1'], 'chashka') < 90, '3 в 1 ≈ 74 kkal/chashka (1 paket)');
for (const id of ['kofe', 'qahva-sutli', 'qahva-shakar', 'qahva-sutli-shakar', 'raf', 'mokka', 'tr-qahva', 'tr-qahva-shakar', 'amerikano', 'kakao']) assert.ok(by[id] && by[id].u.some((x) => x[0] === 'chashka' || x[0] === 'stakan') && !by[id].u.some((x) => x[0] === 'piyola'), id + ': chashka/stakan, piyola emas');
log('qahva oilasi: birliklar va kkal mantiqli (qora ≈ 2, +2 ch.q shakar ≈ 41, 3 в 1 ≈ 74)');
/* 4. qidiruv: «кофе», «kofe», «kofe»/«qahva» → birinchi shakarsiz qora qahva; «3 в 1» alohida aniq nom */
for (const q of ['кофе', 'Кофе', 'kofe', 'Kofe', 'qahva', 'coffee']) { const h = S.search(DB, q, { limit: 5 }); assert.equal(h[0].id, 'kofe', q + ' → ' + h.map((x) => x.id).join(',')); const f = S.famVariant(h[0], S.famDefault(h[0])); assert.ok(kk(f, 'chashka') <= 5, q + ': kkal ' + kk(f, 'chashka')); }
for (const q of ['кофе с сахаром', 'кофе чёрный с сахаром', 'qahva shakar bilan']) { const h = S.search(DB, q, { limit: 3 }); assert.equal(h[0].id, 'qahva-shakar', q + ' → ' + h.map((x) => x.id).join(',')); }
const h31 = S.search(DB, 'кофе 3 в 1', { limit: 3 })[0]; assert.equal(h31.id, 'kofe'); assert.equal(S.famPick(h31, 'кофе 3 в 1').turi, '3in1');
log('qidiruv: «кофе/kofe/qahva» → qora shakarsiz; shakarli → alohida; «3 в 1» → 3in1');
/* 5. chashka birligi: yozuvdan tanib olinadi */
const p = S.parseText('2 chashka kofe', DB, {}); assert.ok(p.items.length === 1 && p.items[0].unit === 'chashka' && p.items[0].g === 400, JSON.stringify(p.items.map((x) => [x.food.id, x.unit, x.g])));
log('«2 chashka kofe» → 400 g');
/* 6. v87 «lagan» → «tarelka»: i qoidasi sun'iy holatni topadi; ilova/server lug'atida birlik nomi «tarelka» */
const bad3 = M.tekshir([mk({ i: 'l1', n: 'Osh (1 lagan)', r: 'Плов', t: 'o' }), mk({ i: 'l2', n: 'Somsa', r: 'Самса', t: 'o', u: [['lagan', 300], ['g100', 100]] })]); assert.equal(bad3.i.length, 2, JSON.stringify(bad3.i));
const APP = fs.readFileSync(path.join(ROOT, 'assets/kalkifit-app.js'), 'utf8'), API = fs.readFileSync(path.join(ROOT, 'functions/api/kalkifit.js'), 'utf8');
for (const [nm, src] of [['app', APP], ['api', API]]) { assert.ok(/likop: 'tarelka'/.test(src), nm + ': likop → tarelka'); assert.ok(!/likop: 'lagan'/.test(src), nm + ': «lagan» birlik nomi yo\'q'); }
assert.ok(!/\b(vk|vn|vs)_lagan: '[^']*[Ll]agan/.test(APP) && !/'[^']*\bлаган/i.test(APP.replace(/noLagan[^\n]*/g, '')), 'idish nomlarida «lagan/лаган» yo\'q');
log('«lagan» birlik sifatida yo\'q (i qoidasi + ilova/server lug\'ati: tarelka / тарелка)');
/* 7. v87 GURUH tegi: har ko'rinadigan taomda 1–2 ta ma'lum guruh */
const G = require(path.join(ROOT, 'tools/ovqat-guruh.js')); const vis = DB.filter((f) => !f.h);
const noG = vis.filter((f) => !Array.isArray(f.gr) || !f.gr.length || f.gr.length > 2 || f.gr.some((g) => !G.GURUH.includes(g))); assert.deepEqual(noG.map((f) => f.id), [], 'guruhsiz taom');
const gOf = (id) => by[id].gr; for (const [id, g] of [['osh', 'guruch'], ['kartoshka', 'kartoshka'], ['somsa', 'xamir'], ['shashlik', 'qizil_gosht'], ['tovuq-kokrak', 'tovuq'], ['losos', 'baliq'], ['tuxum', 'tuxum'], ['mosh', 'dukkakli'], ['pomidor', 'sabzavot'], ['olma', 'meva'], ['qatiq', 'sut'], ['tort', 'shirinlik'], ['burger', 'fastfud'], ['choy', 'ichimlik'], ['mastava', 'guruch'], ['lagmon', 'xamir']]) assert.equal(gOf(id)[0], g, id + ': ' + gOf(id));
const cnt = {}; vis.forEach((f) => { cnt[f.gr[0]] = (cnt[f.gr[0]] || 0) + 1; }); log('guruh: har taomda (' + vis.length + ' ta) — ' + Object.entries(cnt).map(([k, v]) => k + ' ' + v).join(', '));
/* 8. v87 kengaytma: ≥ 250 yangi, ≥ 40 sho'rva, qidiruv so'rovlari */
const K8 = ['8a', '8b', '8c'].flatMap((x) => require(path.join(ROOT, 'tools/ovqatlar-kengaytma' + x + '.js'))); assert.ok(K8.length >= 250, 'yangi taomlar ' + K8.length); assert.ok(K8.every((r) => by[r[0]]), 'hammasi bazada');
assert.ok(require(path.join(ROOT, 'tools/ovqatlar-kengaytma8b.js')).length >= 40, 'suyuq ovqatlar ≥ 40');
const top = (q, k = 3) => S.search(DB, q, { limit: k }).map((f) => f.id);
assert.ok(top('капучино').some((id) => /kapuchino/.test(id)), 'капучино → ' + top('капучино')); assert.ok(top('mango marakuya').some((id) => /mango-marakuya/.test(id)), 'mango marakuya → ' + top('mango marakuya'));
assert.ok(top('мастава').some((id) => /mastava/.test(id)), 'мастава → ' + top('мастава')); assert.ok(top('shirchoy').some((id) => /shirchoy/.test(id)), 'shirchoy → ' + top('shirchoy')); assert.ok(top('malinali limonad').some((id) => /limonad-malina/.test(id)), 'malinali limonad → ' + top('malinali limonad'));
for (const q of ['кофе', 'kofe', 'qahva']) assert.equal(top(q, 1)[0], 'kofe', q + ': qora qahva birinchi (yangi kafe qahvalari ortda)');
for (const id of ['kapuchino-kafe', 'latte-kafe']) if (by[id]) assert.deepEqual(by[id].u.filter((x) => /^hajm_/.test(x[0])).map((x) => x[1]).sort((a, b) => a - b), [250, 350, 450], id + ' o\'lchamlari');
assert.ok(K8.filter((r) => /^limonad-/.test(r[0])).every((r) => /l03:300/.test(r[5]) && /l04:400/.test(r[5]) && /l05:500/.test(r[5])), 'limonad 0,3/0,4/0,5 l');
log('kengaytma: ' + K8.length + ' yangi taom (sho\'rva ' + require(path.join(ROOT, 'tools/ovqatlar-kengaytma8b.js')).length + '), qidiruv: капучино, mango marakuya, мастава, shirchoy, malinali limonad; kafe qahva/limonad o\'lchamlari');
/* 9. v87 qo'shimchalar: shakar/asal/sut hisobi (USDA), tozalash, matn */
assert.equal(Math.round(S.adCalc({ sh: 2 }, 1).kcal), 33); assert.equal(Math.round(S.adCalc({ as: 1 }, 1).kcal), 21); assert.equal(Math.round(S.adCalc({ su: 1 }, 1).kcal), 18); assert.equal(Math.round(S.adCalc({ sh: 1, su: 1 }, 2).kcal), 69, '2 piyola — har biriga');
assert.deepEqual(S.adClean({ sh: 7, as: 1, xx: 1, su: 0 }), { sh: 3, as: 1 }); assert.equal(S.adClean({}), null); assert.equal(S.adText({ sh: 2, su: 1 }, 'uz'), '2 q. shakar, sut'); assert.equal(S.adText({ nv: 1, li: 1, mu: 1 }, 'ru'), 'нават, лимон, варенье');
assert.ok(S.adOk(by.choy) && S.adOk(by.kofe) && S.adOk(by['kapuchino-kafe']) && !S.adOk(by.osh) && !S.adOk(by.kola || by['coca-cola']) && !S.adOk(by['limonad-malina']), 'qo\'shimcha faqat choy/qahvada');
log('qo\'shimchalar: 2 q. shakar +33, asal +21, sut +18 (porsiya boshiga), tozalash va matn; faqat choy/qahva');
/* 11. v87 tuzatish: milliy/MDH taomlar — RETSEPT HISOBI (USDA'da tayyor taom yo'q), noto'g'ri almashtirishlar tuzatilgan, USDA'da yo'qlar — Скурихин/yorliq */
const RA = require(path.join(ROOT, 'tools/retsept-hisob.js')).all(); assert.ok(Object.keys(RA).length >= 90, 'retseptlar: ' + Object.keys(RA).length);
for (const id of Object.keys(RA)) { assert.ok(by[id], id + ' bazada'); assert.match(J.foods.find((f) => f.i === id).m, /^Retsept hisobi: /, id + ': manba belgisi'); }
for (const id of ['mastava-qoy', 'moshxorda-qatiq', 'mosh-shurva', 'umoch-oshi', 'goja-oshi', 'atala', 'kifta-shurva', 'qaynatma-shurva', 'piyova', 'shirchoy-tuzli', 'lagmon-mol-uy', 'borsh-kafe', 'shchi', 'solyanka-kafe', 'rassolnik', 'xarcho', 'okroshka-kvas', 'ayron-yalpiz', 'kompot-olcha']) assert.ok(RA[id], id + ': standart retsept bor');
const MS = (id) => J.foods.find((f) => f.i === id).m; assert.match(MS('okroshka-kvas'), /s:kvas/, 'okroshka: Скурихин kvasi'); assert.doesNotMatch(MS('okroshka-kvas'), /174863/, 'solod ichimligi emas');
for (const id of ['matcha', 'matcha-latte', 'ays-matcha-latte']) assert.match(MS(id), /y:matcha-kukun/, id + ': matcha kukuni yorlig\'i'); assert.doesNotMatch(MS('matcha'), /173230/);
for (const [id, re] of [['fresh-olma', /Сок яблочный/], ['fresh-anor', /Сок гранатовый/], ['fresh-sabzi', /Морковный сок/], ['fresh-apelsin', /USDA FDC 169098/], ['dolana', /Боярышник/], ['qizilcha', /Кизил/], ['suluguni', /Сулугуни/], ['vafli-shakarsiz', /Yorliq: .*8410376059366/]]) assert.match(MS(id), re, id + ': ' + MS(id));
assert.ok(!by['pishloq-yumshoq'].a.some((x) => /sulug/i.test(x)), 'sulugun — alohida taom, brinza sinonimi emas'); assert.ok(!by['sabzi-sharbat'].a.some((x) => /fresh|siqilgan/i.test(x)), 'qadoqlangan sharbatda «yangi siqilgan» yo\'q');
log('v87 tuzatish: ' + Object.keys(RA).length + ' ta standart retsept («Retsept hisobi»), kvas/matcha/fresh manbasi to\'g\'ri, do\'lana/qizilcha/sulugun/vafli — Скурихин va yorliq');
console.log('\nbaza-mantiq: ' + n + ' tekshiruv o\'tdi');
