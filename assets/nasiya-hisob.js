/* kalki.uz — "Naqd, nasiya yoki kredit" hisob moduli. DOM'siz, sof funksiyalar (brauzerda window.KalkiNasiya, Node'da require()).
 *
 * Qoidalar (sahifadagi tushuntirish bilan bir xil):
 *  - moliyalashtirilgan summa = naqd narx − boshlang'ich to'lov (financed);
 *  - nasiya, "oylik to'lov ma'lum": to'lovlar = oylik × oylar; "ustama ma'lum": ustama butun muddatga (yillik emas):
 *    jami = financed × (1 + ustama%), oylik = jami / oylar;
 *  - kredit: annuitet yoki differensial, foiz = yillik / 12 (oddiy oylik foiz, kredit-kalkulyator bilan bir xil formula);
 *    bir martalik komissiya (foiz — financed'dan, yoki so'm) boshida to'lanadi va jami narxga qo'shiladi;
 *  - haqiqiy stavka (IRR): oylik r — shunday sonki, Σ to'lov_k / (1+r)^k = financed − komissiya (bisection, aniqlik 1e-12);
 *    nominal yillik = 12·r, effektiv yillik = (1+r)^12 − 1;
 *  - ichki hisob to'liq aniqlikda, yaxlitlashni faqat ekran qiladi.
 * Xato kodlari: {error:'price'|'down'|'n'|'monthly'|'markup'|'rate'|'comm'|'low', ...} — matnni sahifa tanlaydi. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiNasiya = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MAX_N = 360;

  function isNum(x) { return typeof x === 'number' && isFinite(x); }

  /* Σ pays[k-1]/(1+r)^k − financed (r ortsa kamayadi) */
  function npv(r, financed, pays) {
    var s = -financed, f = 1, q = 1 + r;
    for (var k = 0; k < pays.length; k++) { f *= q; s += pays[k] / f; }
    return s;
  }

  /* Oylik haqiqiy stavka. financed — qo'lga tegan sof summa (komissiyasiz), pays — to'lovlar oqimi (1..n oy).
     Qaytaradi {r} yoki {error:'low'} (Σ to'lov < financed: musbat stavka yo'q). Σ to'lov = financed → r = 0. */
  function monthlyRate(financed, pays) {
    var total = 0, k;
    for (k = 0; k < pays.length; k++) total += pays[k];
    if (!(financed > 0) || !pays.length) return { error: 'low' };
    var tol = 1e-9 * Math.max(1, financed);
    if (total < financed - tol) return { error: 'low' };
    if (Math.abs(total - financed) <= tol) return { r: 0 };
    var lo = 0, hi = 1, g = 0;
    while (npv(hi, financed, pays) > 0 && g++ < 200) hi *= 2;
    for (var it = 0; it < 300; it++) {
      var mid = (lo + hi) / 2, v = npv(mid, financed, pays);
      if (v > 0) lo = mid; else hi = mid;
      if (hi - lo < 1e-14) break;
    }
    return { r: (lo + hi) / 2 };
  }

  function rates(r) { return { r: r, nominal: 12 * r, effective: Math.pow(1 + r, 12) - 1 }; }

  /* Annuitet to'lovi: P·i·(1+i)^n / ((1+i)^n − 1); i = 0 → P/n */
  function annuity(P, i, n) {
    if (i === 0) return P / n;
    var f = Math.pow(1 + i, n);
    return P * i * f / (f - 1);
  }

  /* Qarz jadvali: P summa, i oylik foiz (kasr), n oy, type 'ann' | 'diff'. */
  function schedule(P, i, n, type) {
    var rows = [], bal = P, total = 0, interest = 0, k, pay, pr, fo;
    var fixed = type === 'diff' ? P / n : 0, ann = type === 'diff' ? 0 : annuity(P, i, n);
    for (k = 1; k <= n; k++) {
      fo = bal * i;
      pr = type === 'diff' ? fixed : ann - fo;
      pay = pr + fo;
      bal = k === n ? 0 : Math.max(0, bal - pr);
      rows.push({ k: k, pay: pay, principal: pr, interest: fo, balance: bal });
      total += pay; interest += fo;
    }
    return { rows: rows, total: total, interest: interest, first: rows[0].pay, last: rows[n - 1].pay };
  }

  function checkCommon(o) {
    if (!isNum(o.price) || !(o.price > 0)) return { error: 'price' };
    var down = o.down == null || o.down === '' ? 0 : o.down;
    if (!isNum(down) || down < 0 || down >= o.price) return { error: 'down' };
    if (!isNum(o.n) || o.n < 1 || o.n > MAX_N || Math.floor(o.n) !== o.n) return { error: 'n' };
    return null;
  }

  /* Nasiya. o: {price, down, n, mode:'pay'|'markup', monthly (pay), markupPct (markup)} */
  function nasiya(o) {
    var e = checkCommon(o); if (e) return e;
    var down = o.down || 0, n = o.n, financed = o.price - down, monthly, markupPct;
    if (o.mode === 'markup') {
      if (!isNum(o.markupPct) || o.markupPct < 0) return { error: 'markup' };
      markupPct = o.markupPct;
      monthly = financed * (1 + markupPct / 100) / n;
    } else {
      if (!isNum(o.monthly) || !(o.monthly > 0)) return { error: 'monthly' };
      monthly = o.monthly;
      if (monthly * n < financed - 1e-9 * Math.max(1, financed)) return { error: 'low', financed: financed, minMonthly: financed / n };
      markupPct = (monthly * n - financed) / financed * 100;
    }
    var pays = []; for (var k = 0; k < n; k++) pays.push(monthly);
    var m = monthlyRate(financed, pays); if (m.error) return { error: 'low', financed: financed, minMonthly: financed / n };
    var R = rates(m.r), rows = [], bal = financed, interest = 0, k2, fo, pr;
    for (k2 = 1; k2 <= n; k2++) {
      fo = bal * m.r; pr = monthly - fo; bal = k2 === n ? 0 : Math.max(0, bal - pr);
      rows.push({ k: k2, pay: monthly, principal: pr, interest: fo, balance: bal }); interest += fo;
    }
    var paid = monthly * n;
    return { kind: 'nasiya', price: o.price, down: down, n: n, financed: financed, monthly: monthly, markupPct: markupPct,
      paid: paid, total: down + paid, over: down + paid - o.price, r: R.r, nominal: R.nominal, effective: R.effective, rows: rows, interest: interest };
  }

  /* Kredit. o: {price, down, n, ratePct, type:'ann'|'diff', commKind:'pct'|'sum'|null, commValue} */
  function kredit(o) {
    var e = checkCommon(o); if (e) return e;
    var down = o.down || 0, n = o.n, financed = o.price - down;
    if (!isNum(o.ratePct) || o.ratePct < 0) return { error: 'rate' };
    var comm = 0, cv = o.commValue == null || o.commValue === '' ? 0 : o.commValue;
    if (o.commKind === 'pct' || o.commKind === 'sum') {
      if (!isNum(cv) || cv < 0) return { error: 'comm' };
      comm = o.commKind === 'pct' ? financed * cv / 100 : cv;
      if (comm >= financed) return { error: 'comm' };
    }
    var type = o.type === 'diff' ? 'diff' : 'ann', i = o.ratePct / 1200;
    var S = schedule(financed, i, n, type);
    var pays = S.rows.map(function (r) { return r.pay; });
    var m = monthlyRate(financed - comm, pays); if (m.error) return { error: 'low' };
    var R = rates(m.r);
    return { kind: 'kredit', price: o.price, down: down, n: n, financed: financed, type: type, ratePct: o.ratePct, comm: comm,
      monthly: type === 'ann' ? S.first : null, first: S.first, last: S.last, paid: S.total, interest: S.interest, rows: S.rows,
      total: down + comm + S.total, over: down + comm + S.total - o.price, r: R.r, nominal: R.nominal, effective: R.effective };
  }

  /* Uchala variantni solishtirish. naqd — price; nas, kre — nasiya()/kredit() natijalari (xato bo'lmagan). */
  function compare(price, nas, kre) {
    var items = [{ id: 'naqd', total: price, diff: 0 }];
    if (nas && !nas.error) items.push({ id: 'nasiya', total: nas.total, diff: nas.total - price });
    if (kre && !kre.error) items.push({ id: 'kredit', total: kre.total, diff: kre.total - price });
    var cheapest = items[0];
    for (var k = 1; k < items.length; k++) if (items[k].total < cheapest.total - 1e-9) cheapest = items[k];
    var out = { items: items, cheapest: cheapest.id };
    if (nas && !nas.error && kre && !kre.error) out.nasiyaMinusKredit = nas.total - kre.total;
    return out;
  }

  return { monthlyRate: monthlyRate, annuity: annuity, schedule: schedule, nasiya: nasiya, kredit: kredit, compare: compare, npv: npv, MAX_N: MAX_N };
});
