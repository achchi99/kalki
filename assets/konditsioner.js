/* kalki.uz — konditsioner sinfini tanlash (konditsioner-kalkulyator).
 *
 * recommend(needKw) — kerakli sovutish quvvatiga (kW) mos konditsioner(lar):
 *   1) bitta sinf yetarli bo'lsa: eng KICHIK yetarli sinf (tavsiya hech qachon kerakli quvvatdan kichik emas);
 *   2) eng katta sinfdan (24 = 7,0 kW) oshsa: eng kam sonli birliklar kombinatsiyasi (n = ceil(kerakli / 7,0)),
 *      yig'indi quvvat kerakli quvvatdan KAM bo'lmasligi va (shu sondagi birliklar orasida) eng kichik bo'lishi shart
 *      (masalan 11,1 kW -> 24 + 18 = 12,2 kW; 15 kW -> 18 + 18 + 18 = 15,6 kW).
 *
 * Hisob butun "kW/10" birliklarida (11,1 kW = 111): suzuvchi nuqta xatosi tavsiyani buzmasin.
 * Brauzerda window.KalkiKonditsioner, Node'da require() — bir xil. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiKonditsioner = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // name — ming BTU/soat ("9-lik"), kw — sovutish quvvati (kW)
  var CLASSES = [
    { name: '7',  kw: 2.1 },
    { name: '9',  kw: 2.6 },
    { name: '12', kw: 3.5 },
    { name: '18', kw: 5.2 },
    { name: '24', kw: 7.0 }
  ];
  var MAX_UNITS = 40;   // amalda 40 dan ko'p birlik chiqmaydi; undan oshsa — eng katta sinfdan n ta

  var tenths = function (kw) { return Math.round(kw * 10); };

  function pack(units, need) {
    units = units.slice().sort(function (a, b) { return b.kw - a.kw; });
    var sumT = 0;
    for (var i = 0; i < units.length; i++) sumT += tenths(units[i].kw);
    return { units: units, count: units.length, multi: units.length > 1, totalKw: sumT / 10, needKw: need };
  }

  function recommend(needKw) {
    var need = Number(needKw);
    if (!(need > 0)) need = 0;
    var needT = Math.ceil(need * 10 - 1e-9);               // 11,1 kW -> 111
    var i;
    for (i = 0; i < CLASSES.length; i++) {                  // 1) bitta sinf
      if (tenths(CLASSES[i].kw) >= needT) return pack([CLASSES[i]], need);
    }
    var big = CLASSES[CLASSES.length - 1], bigT = tenths(big.kw);
    var n = Math.ceil(needT / bigT);                        // 2) eng kam birlik soni
    var k;
    if (n > MAX_UNITS) { var many = []; for (k = 0; k < n; k++) many.push(big); return pack(many, need); }

    // n ta birlik orasida yig'indisi >= kerakli va eng kichigi (teng bo'lsa — kattaroq sinflar afzal)
    var bestSum = Infinity, best = null, picked = [];
    (function rec(idx, left, sumT) {
      if (left === 0) {
        if (sumT >= needT && sumT < bestSum) { bestSum = sumT; best = picked.slice(); }
        return;
      }
      if (idx < 0) return;
      if (sumT + left * bigT < needT) return;               // qolganlar hammasi eng katta bo'lsa ham yetmaydi
      for (var c = left; c >= 0; c--) {                     // idx-sinfdan c ta (kattadan kichikka)
        for (var j = 0; j < c; j++) picked.push(CLASSES[idx]);
        rec(idx - 1, left - c, sumT + c * tenths(CLASSES[idx].kw));
        for (var q = 0; q < c; q++) picked.pop();
      }
    })(CLASSES.length - 1, n, 0);
    return pack(best || (function () { var a = []; for (var z = 0; z < n; z++) a.push(big); return a; })(), need);
  }

  /* "24 + 18" (har xil) yoki "2 × 24" (bir xil) */
  function describe(units) {
    var names = units.map(function (u) { return u.name; });
    var same = names.every(function (x) { return x === names[0]; });
    return same && names.length > 1 ? names.length + ' × ' + names[0] : names.join(' + ');
  }

  return { classes: CLASSES, recommend: recommend, describe: describe };
});
