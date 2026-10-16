/* kalki.uz — "Ro'zg'or" ilovasi hisob moduli. DOM'siz, sof funksiyalar (brauzerda window.KalkiRozgor, Node'da require()).
 * Barcha summa BUTUN so'mda; sana — kalendar "YYYY-MM-DD" (mahalliy, UTC'siz: soat mintaqasi/yozgi vaqt xatosi bo'lmaydi).
 * Formulalar va qoidalar: docs/rozgor.md. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KalkiRozgor = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = 1;
  var CATS = ['oziq', 'transport', 'uy', 'bolalar', 'soglik', 'xarid', 'dam', 'boshqa'];   // tanlanadigan 8 toifa; 'tolov' — majburiy to'lov yozuvi (faqat tarixda)

  /* ---------- sana (kalendar arifmetikasi, Date/UTC ishlatilmaydi) ---------- */
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function dim(y, m) { return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]; }
  function ymd(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3];
    if (mo < 1 || mo > 12 || d < 1 || d > dim(y, mo)) return null;
    return { y: y, m: mo, d: d };
  }
  function toDays(y, m, d) {                       // 1970-01-01 dan kunlar (Howard Hinnant algoritmi)
    y -= m <= 2 ? 1 : 0;
    var era = Math.floor(y / 400), yoe = y - era * 400;
    var doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
    var doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
    return era * 146097 + doe - 719468;
  }
  function fromDays(z) {
    z += 719468;
    var era = Math.floor(z / 146097), doe = z - era * 146097;
    var yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
    var y = yoe + era * 400, doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
    var mp = Math.floor((5 * doy + 2) / 153), d = doy - Math.floor((153 * mp + 2) / 5) + 1, m = mp + (mp < 10 ? 3 : -9);
    return ymd(y + (m <= 2 ? 1 : 0), m, d);
  }
  function dayNum(s) { var p = parse(s); return p ? toDays(p.y, p.m, p.d) : NaN; }
  function daysBetween(a, b) { return dayNum(b) - dayNum(a); }
  function addDays(s, n) { return fromDays(dayNum(s) + n); }
  function today(d) { d = d || new Date(); return ymd(d.getFullYear(), d.getMonth() + 1, d.getDate()); }
  function monthOf(s) { return String(s).slice(0, 7); }
  function firstOfNextMonth(s) { var p = parse(s); return p.m === 12 ? ymd(p.y + 1, 1, 1) : ymd(p.y, p.m + 1, 1); }
  function addMonthsDom(s, n, dom) {               // n oy keyin, oy kuni `dom` (oy qisqa bo'lsa — oxirgi kun)
    var p = parse(s), idx = p.y * 12 + (p.m - 1) + n, y = Math.floor(idx / 12), m = idx - y * 12 + 1;
    return ymd(y, m, Math.min(dom || p.d, dim(y, m)));
  }

  /* ---------- butun son ---------- */
  function toInt(x) {
    if (typeof x === 'string') x = x.replace(/[\s ]/g, '');
    var n = Number(x);
    return isFinite(n) ? Math.round(n) : 0;
  }
  function posInt(x) { var n = toInt(x); return n > 0 ? n : 0; }

  /* ---------- holat ---------- */
  function emptyState() { return { v: VERSION, base: 0, reserve: 0, income: { date: null, amount: null }, bills: [], tx: [], seq: 1, setup: false, lastBackup: null, created: null }; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function nid(st) { return st.seq++; }

  function balance(st) {
    var b = toInt(st.base), i;
    for (i = 0; i < st.tx.length; i++) {
      var t = st.tx[i];
      if (t.type === 'exp') b -= t.amount; else b += t.amount;       // inc: +, adj: ishorali
    }
    return b;
  }
  function horizon(st, t) {
    var d = st.income && st.income.date;
    if (d && parse(d)) return { date: d, mode: 'income' };
    return { date: firstOfNextMonth(t), mode: 'month' };           // oy oxirigacha (keyingi oyning 1-kuni — kirmaydi)
  }
  function nextDue(b, d) { return addMonthsDom(d, 1, b.dom || parse(d).d); }
  function billOccurrences(b, hDate) {             // ufqdan oldingi to'lov sanalari (takroriy bo'lsa — bir nechta)
    var out = [], d = b.due, guard = 0;
    if (!parse(d)) return out;
    while (d < hDate && guard++ < 60) { out.push(d); if (!b.recurring) break; d = nextDue(b, d); }
    return out;
  }
  function dueTotal(st, t) {
    var h = horizon(st, t).date, s = 0;
    st.bills.forEach(function (b) { s += b.amount * billOccurrences(b, h).length; });
    return s;
  }
  function spentToday(st, t) {                     // to'lov belgisi (bill) bo'lganlar — majburiy ro'yxatdan chiqqan: bugungi sarfga kirmaydi
    var s = 0;
    st.tx.forEach(function (x) { if (x.type === 'exp' && x.date === t && !x.bill) s += x.amount; });
    return s;
  }

  /* Bugungi holat. norm — kun boshidagi bo'sh pul / qolgan kunlar; kun davomida o'zgarmaydi. */
  function summary(st, t) {
    var bal = balance(st), h = horizon(st, t), days = Math.max(1, daysBetween(t, h.date));
    var due = dueTotal(st, t), reserve = posInt(st.reserve), free = bal - due - reserve, spent = spentToday(st, t);
    var freeStart = free + spent, norm = freeStart > 0 ? Math.floor(freeStart / days) : 0;
    var can = norm - spent;
    return { balance: bal, reserve: reserve, due: due, free: free, days: days, horizon: h.date, mode: h.mode, spent: spent, norm: norm, can: can,
      over: can < 0 ? -can : 0, short: free < 0 ? -free : 0, tomorrow: days > 1 ? (free > 0 ? Math.floor(free / (days - 1)) : 0) : null };
  }
  function upcoming(st, t, limit) {                // yaqin to'lovlar (sana bo'yicha; takroriyning faqat birinchi kelgusi sanasi)
    var list = st.bills.filter(function (b) { return parse(b.due); }).map(function (b) { return { id: b.id, name: b.name, amount: b.amount, due: b.due, recurring: !!b.recurring, overdue: b.due < t, inDays: daysBetween(t, b.due) }; });
    list.sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : a.id - b.id; });
    return limit ? list.slice(0, limit) : list;
  }

  /* "Shuni sotib olsam-chi?" — hech narsa saqlanmaydi, holat o'zgarmaydi. */
  function whatIf(st, t, amount) {
    amount = posInt(amount);
    var s = summary(st, t), free2 = s.free - amount, h = horizon(st, t).date;
    var avail = s.balance - amount - s.reserve, list = [];
    st.bills.forEach(function (b) { billOccurrences(b, h).forEach(function (d) { list.push({ id: b.id, name: b.name, amount: b.amount, due: d }); }); });
    list.sort(function (a, b) { return a.due < b.due ? -1 : a.due > b.due ? 1 : a.id - b.id; });
    var cum = 0; list.forEach(function (x) { cum += x.amount; x.ok = avail - cum >= 0; });
    return { amount: amount, free2: free2, days: s.days, tomorrow2: s.days > 1 ? (free2 > 0 ? Math.floor(free2 / (s.days - 1)) : 0) : null,
      norm2: free2 > 0 ? Math.floor((free2 + s.spent + amount) / s.days) : 0, can2: s.can - amount, short2: free2 < 0 ? -free2 : 0, coversAll: list.every(function (x) { return x.ok; }), bills: list };
  }

  /* ---------- yozuvlar ---------- */
  function addTx(st, o) {
    var type = o.type === 'inc' || o.type === 'adj' ? o.type : 'exp';
    var amount = type === 'adj' ? toInt(o.amount) : posInt(o.amount);
    if (!amount) return null;
    var date = parse(o.date) ? o.date : null;
    if (!date) return null;
    var cat = type === 'exp' ? (CATS.indexOf(o.cat) > -1 || o.cat === 'tolov' ? o.cat : 'boshqa') : (o.cat || type);
    var tx = { id: nid(st), type: type, amount: amount, cat: cat, date: date, ts: toInt(o.ts) || 0, note: String(o.note || '').slice(0, 120) };
    if (o.bill != null) tx.bill = o.bill;
    st.tx.push(tx); return tx;
  }
  function removeTx(st, id) {
    for (var i = 0; i < st.tx.length; i++) if (st.tx[i].id === id) return st.tx.splice(i, 1)[0];
    return null;
  }
  function restoreTx(st, tx) { if (tx && !st.tx.some(function (x) { return x.id === tx.id; })) st.tx.push(tx); return tx; }
  function updateTx(st, id, patch) {
    var t = st.tx.filter(function (x) { return x.id === id; })[0];
    if (!t) return null;
    if (patch.amount != null) { var a = t.type === 'adj' ? toInt(patch.amount) : posInt(patch.amount); if (a) t.amount = a; }
    if (patch.cat != null && t.type === 'exp') t.cat = CATS.indexOf(patch.cat) > -1 || patch.cat === 'tolov' ? patch.cat : t.cat;
    if (patch.date != null && parse(patch.date)) t.date = patch.date;
    if (patch.note != null) t.note = String(patch.note).slice(0, 120);
    return t;
  }
  function addIncome(st, amount, t, nextDate, nextAmount, ts) {
    var tx = addTx(st, { type: 'inc', amount: amount, date: t, cat: 'inc', ts: ts });
    st.income = { date: parse(nextDate) ? nextDate : null, amount: nextAmount ? posInt(nextAmount) : null };
    return tx;
  }
  function setIncomeDate(st, date, amount) { st.income = { date: parse(date) ? date : null, amount: amount ? posInt(amount) : null }; }
  function reconcile(st, actual, t, ts) {          // hisobni tekshirish: farq — alohida "kiritilmagan" yozuv
    var diff = toInt(actual) - balance(st);
    if (!diff) return null;
    return addTx(st, { type: 'adj', amount: diff, date: t, cat: 'adj', note: diff < 0 ? 'unrec_exp' : 'unrec_inc', ts: ts });
  }

  /* ---------- majburiy to'lovlar ---------- */
  function addBill(st, o) {
    var amount = posInt(o.amount), due = parse(o.due) ? o.due : null;
    if (!amount || !due) return null;
    var b = { id: nid(st), name: String(o.name || '').slice(0, 60) || '—', amount: amount, due: due, dom: parse(due).d, recurring: !!o.recurring };
    st.bills.push(b); return b;
  }
  function updateBill(st, id, patch) {
    var b = st.bills.filter(function (x) { return x.id === id; })[0];
    if (!b) return null;
    if (patch.name != null) b.name = String(patch.name).slice(0, 60) || b.name;
    if (patch.amount != null && posInt(patch.amount)) b.amount = posInt(patch.amount);
    if (patch.due != null && parse(patch.due)) { b.due = patch.due; b.dom = parse(patch.due).d; }
    if (patch.recurring != null) b.recurring = !!patch.recurring;
    return b;
  }
  function removeBill(st, id) { for (var i = 0; i < st.bills.length; i++) if (st.bills[i].id === id) return st.bills.splice(i, 1)[0]; return null; }
  /* To'landi: avtomatik xarajat yozuvi, balans kamayadi, to'lov ro'yxatdan chiqadi (takroriy — keyingi oyga). Ikki marta ayirilmaydi. */
  function payBill(st, id, t, ts) {
    var b = st.bills.filter(function (x) { return x.id === id; })[0];
    if (!b) return null;
    var prev = clone(b);
    var tx = addTx(st, { type: 'exp', amount: b.amount, cat: 'tolov', date: t, note: b.name, bill: b.id, ts: ts });
    if (b.recurring) b.due = nextDue(b, b.due); else removeBill(st, id);
    return { tx: tx, prev: prev };
  }
  function undoPayBill(st, token) {
    if (!token) return;
    removeTx(st, token.tx.id);
    var cur = st.bills.filter(function (x) { return x.id === token.prev.id; })[0];
    if (cur) { cur.due = token.prev.due; } else st.bills.push(clone(token.prev));
  }

  /* ---------- statistika ---------- */
  function monthByCat(st, month) {
    var by = {}, tot = 0;
    st.tx.forEach(function (x) { if (x.type === 'exp' && monthOf(x.date) === month) { by[x.cat] = (by[x.cat] || 0) + x.amount; tot += x.amount; } });
    var arr = Object.keys(by).map(function (c) { return { cat: c, amount: by[c], share: tot ? Math.round(by[c] / tot * 100) : 0 }; });
    arr.sort(function (a, b) { return b.amount - a.amount; });
    return { total: tot, cats: arr };
  }
  function dayGroups(st) {
    var map = {};
    st.tx.forEach(function (x) { (map[x.date] = map[x.date] || []).push(x); });
    return Object.keys(map).sort().reverse().map(function (d) {
      var items = map[d].slice().sort(function (a, b) { return (b.ts - a.ts) || (b.id - a.id); }), spent = 0;
      items.forEach(function (x) { if (x.type === 'exp') spent += x.amount; });
      return { date: d, items: items, spent: spent };
    });
  }
  function recentCats(st) {                        // oxirgi ishlatilganlar birinchi
    var last = {};
    st.tx.forEach(function (x) { if (x.type === 'exp' && CATS.indexOf(x.cat) > -1) last[x.cat] = Math.max(last[x.cat] || 0, (x.ts || 0) * 1000 + x.id); });
    return CATS.slice().sort(function (a, b) { return (last[b] || -1) - (last[a] || -1) || CATS.indexOf(a) - CATS.indexOf(b); });
  }
  function lastTxDate(st) { var d = null; st.tx.forEach(function (x) { if (x.type === 'exp' && (!d || x.date > d)) d = x.date; }); return d; }

  /* ---------- eksport / import / migratsiya ---------- */
  function migrate(o) {
    if (!o || typeof o !== 'object') return null;
    var st = emptyState();
    if (o.v === VERSION) { st = clone(o); }
    else {                                       // v0: `balance` — oxirgi balans (yozuvlar ichida)
      var tx0 = Array.isArray(o.tx) ? o.tx : [];
      st.tx = tx0.map(function (x) { return { id: x.id, type: x.type === 'inc' ? 'inc' : 'exp', amount: posInt(x.amount), cat: x.cat, date: x.date, ts: toInt(x.ts), note: x.note || '' }; });
      st.base = 0; st.seq = 1; st.tx.forEach(function (x) { if (!(x.id >= 1)) x.id = st.seq; st.seq = Math.max(st.seq, x.id + 1); });
      st.base = toInt(o.balance) - balance(st);  // balans(st) = base + Σ  =>  base = balance − Σ
      st.reserve = posInt(o.reserve); st.income = { date: parse(o.nextIncome) ? o.nextIncome : null, amount: null };
      st.bills = (Array.isArray(o.bills) ? o.bills : []).map(function (b) { return { id: nid(st), name: String(b.name || '—'), amount: posInt(b.amount), due: b.due, dom: parse(b.due) ? parse(b.due).d : 1, recurring: !!b.recurring }; }).filter(function (b) { return b.amount && parse(b.due); });
      st.setup = true;
    }
    st.v = VERSION; st.base = toInt(st.base); st.reserve = posInt(st.reserve);
    st.income = st.income && typeof st.income === 'object' ? { date: parse(st.income.date) ? st.income.date : null, amount: st.income.amount ? posInt(st.income.amount) : null } : { date: null, amount: null };
    st.tx = (Array.isArray(st.tx) ? st.tx : []).filter(function (x) { return x && parse(x.date) && toInt(x.amount); });
    st.bills = (Array.isArray(st.bills) ? st.bills : []).filter(function (b) { return b && posInt(b.amount) && parse(b.due); });
    var mx = 0; st.tx.concat(st.bills).forEach(function (x) { if (x.id > mx) mx = x.id; });
    st.seq = Math.max(toInt(st.seq) || 1, mx + 1);
    return st;
  }
  function exportState(st) { return JSON.stringify({ app: 'kalki-rozgor', v: VERSION, exportedAt: 0, state: st }, null, 1); }
  function importState(text) {
    var o; try { o = JSON.parse(text); } catch (e) { return { ok: false, error: 'json' }; }
    if (!o || o.app !== 'kalki-rozgor' || !o.state) return { ok: false, error: 'format' };
    var rs = o.state; if (typeof rs !== 'object' || Array.isArray(rs) || !(Array.isArray(rs.tx) || rs.base !== undefined || rs.balance !== undefined)) return { ok: false, error: 'state' };   // begona/bo'sh tuzilma holat bo'lib qolmasin
    var st = migrate(o.state); if (!st) return { ok: false, error: 'state' };
    return { ok: true, state: st };
  }

  return { VERSION: VERSION, CATS: CATS, parse: parse, ymd: ymd, today: today, daysBetween: daysBetween, addDays: addDays, addMonthsDom: addMonthsDom, firstOfNextMonth: firstOfNextMonth, monthOf: monthOf, dim: dim, isLeap: isLeap,
    toInt: toInt, posInt: posInt, emptyState: emptyState, balance: balance, horizon: horizon, billOccurrences: billOccurrences, dueTotal: dueTotal, spentToday: spentToday, summary: summary, upcoming: upcoming, whatIf: whatIf,
    addTx: addTx, removeTx: removeTx, restoreTx: restoreTx, updateTx: updateTx, addIncome: addIncome, setIncomeDate: setIncomeDate, reconcile: reconcile,
    addBill: addBill, updateBill: updateBill, removeBill: removeBill, payBill: payBill, undoPayBill: undoPayBill,
    monthByCat: monthByCat, dayGroups: dayGroups, recentCats: recentCats, lastTxDate: lastTxDate, migrate: migrate, exportState: exportState, importState: importState };
});
