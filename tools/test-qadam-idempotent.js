/* v52: kunlik qadam — idempotent, kamaymaydi, manbalar yig'ilmaydi (Android: sensor / Health Connect → S.setAutoSteps). node tools/test-qadam-idempotent.js */
'use strict';
const assert = require('assert'); const S = require('../assets/kalkifit-core.js'); const D = S.dates, T = D.today(), Y = D.addDays(T, -1);
const mk = () => { const st = S.emptyState(); st.setup = true; st.profile = { sex: 'm', age: 35, height: 175, weight: 80, act: 2, goal: 'lose', job: 'sit' }; st.prefs = { qa: 'on' }; return st; };
const steps = (st, d) => (st.days[d] || {}).steps || 0; let n = 0; const ok = (m) => { n++; console.log('OK  ', n + '.', m); };
/* 1. takroriy chaqiruv: qayta ochish, fon/oldi, har daqiqalik sinxron — hammasi bir xil */
let st = mk(); for (let i = 0; i < 50; i++) S.setAutoSteps(st, T, 9000); assert.equal(steps(st, T), 9000); assert.equal(S.setAutoSteps(st, T, 9000), false, 'o\'zgarmasa false'); ok('takroriy chaqiruv (50×): 9 000');
/* 2. eski yozuv (qo'lda yoki boshqa qurilmadan, sa yo'q) + sensor — YIG'ILMAYDI */
st = mk(); S.setSteps(st, T, 9000); S.setAutoSteps(st, T, 9000); assert.equal(steps(st, T), 9000); S.setAutoSteps(st, T, 9000); assert.equal(steps(st, T), 9000);
st = mk(); S.setSteps(st, T, 6000); S.setAutoSteps(st, T, 9000); assert.equal(steps(st, T), 9000, 'kattasi'); st = mk(); S.setSteps(st, T, 9000); S.setAutoSteps(st, T, 6000); assert.equal(steps(st, T), 9000, 'kattasi (eskisi)'); S.setAutoSteps(st, T, 9500); assert.equal(steps(st, T), 9500, 'sensor o\'sdi — o\'sadi, qo\'shilmaydi'); ok('eski yozuv + sensor: max (9 000 + 9 000 = 9 000), bir kunda ham, 7 kunlik sinxronda ham');
/* 3. kamaymaydi: kechikkan kichik qiymat / bo'sh javob (APK ma'lumoti tozalangan, HC o'chgan) kattasini bosmaydi */
st = mk(); S.setAutoSteps(st, T, 9000); S.setAutoSteps(st, T, 4000); S.setAutoSteps(st, T, 0); assert.equal(steps(st, T), 9000); ok('kichik/0 qiymat qadamni kamaytirmaydi');
/* 4. ikki manba (HC va sensor): native kattasini beradi; JS ketma-ket 8 000, 9 000, 8 500, 9 000 olsa ham 9 000 */
st = mk(); [8000, 9000, 8500, 9000, 9000].forEach((v) => S.setAutoSteps(st, T, v)); assert.equal(steps(st, T), 9000); ok('ikki manba: 8 000 / 9 000 / 8 500 / 9 000 → 9 000');
/* 5. kun almashuvi: kecha 9 000 qoladi, yangi kun 0 dan */
st = mk(); S.setAutoSteps(st, Y, 9000); assert.equal(steps(st, T), 0); S.setAutoSteps(st, T, 0); assert.equal(st.days[T], undefined, 'bugun 0 — yozuv ochilmaydi'); S.setAutoSteps(st, T, 120); S.setAutoSteps(st, Y, 9000); assert.deepEqual([steps(st, Y), steps(st, T)], [9000, 120]); ok('kun almashuvi: kecha 9 000, bugun 0 dan (120)');
/* 6. qayta yuklash (saqlash → migrate → yana sinxron) */
st = mk(); S.setAutoSteps(st, T, 9000); let re = S.migrate(JSON.parse(JSON.stringify(st))); S.setAutoSteps(re, T, 9000); re = S.migrate(JSON.parse(JSON.stringify(re))); S.setAutoSteps(re, T, 9000); assert.equal(steps(re, T), 9000); ok('saqlash → qayta yuklash → sinxron: 9 000');
/* 7. eski xato yozuvlar: ANIQ ikki barobar (sa + shuncha qo'lda) tuzatiladi; noaniq — tegilmaydi */
let raw = JSON.parse(JSON.stringify(mk())); raw.days = {}; raw.days[T] = { food: [], water: 0, steps: 18000, sa: 9000 }; raw.days[Y] = { food: [], water: 0, steps: 14000, sa: 9000 }; const fx = S.migrate(raw); assert.equal(fx.days[T].steps, 9000, 'aniq ikki barobar tuzatildi'); assert.equal(fx.days[Y].steps, 14000, 'noaniq — tegilmaydi'); assert.equal(S.migrate(JSON.parse(JSON.stringify(fx))).days[T].steps, 9000); ok('migratsiya: 18 000 (sa 9 000) → 9 000; 14 000 (sa 9 000) — noaniq, tegilmaydi');
/* 8. shubhali kun (> 40 000): kredit 0, plato qadam hisobiga kirmaydi */
st = mk(); S.setAutoSteps(st, T, 45000); const dp = S.dayPlan(st, T); assert.equal(dp.credit, 0); assert.equal(dp.suspect, true); st = mk(); S.setAutoSteps(st, T, 12000); assert.ok(S.dayPlan(st, T).credit > 0 && !S.dayPlan(st, T).suspect); ok('40 000+ qadam: kredit 0 (shubhali), 12 000 — kredit bor');
console.log('qadam-idempotent: ' + n + ' guruh OK');
