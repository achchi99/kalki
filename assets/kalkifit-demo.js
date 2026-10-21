/* kalki.uz — KalkiFit TAQDIMOT rejimi: ?demo=1 (namunaviy profil + bugungi 3 ovqat), ?demo=1&intro=1 (+ «Qanday ishlaydi?» slaydlari).
 * Haqiqiy ma'lumotga TEGMAYDI: barcha «kalki_*» kalitlari localStorage'da «kalkidemo_*» ga yo'naltiriladi (Storage.prototype orqali — Safari'da ham ishlaydi),
 * har yuklashda namuna qaytadan yoziladi (taqdimot har safar bir xil boshlanadi). /api/* so'rovlari tarmoqqa chiqmaydi (hisoblagich, push, akkaunt, AI — jim).
 * kalkifit-app.js dan OLDIN (kalkifit-core.js dan KEYIN) yuklanadi; window.KalkiDemo = { on, intro, mark }. */
(function () {
  'use strict';
  var q = {}; try { location.search.replace(/^\?/, '').split('&').forEach(function (p) { if (!p) return; var a = p.split('='); q[a[0]] = decodeURIComponent(a[1] || ''); }); } catch (e) {}
  var on = q.demo === '1', S = window.KalkiFit, API = { on: false, intro: q.intro === '1', mark: function () {} };
  window.KalkiDemo = API;
  /* ?bugun=YYYY-MM-DD — «bugun»ni almashtirish (baliq kuni va sana bilan bog'liq ko'rinishni sinash uchun): FAQAT preview/lokal yoki ?demo=1 da; production'da e'tiborsiz */
  if (S && S.dates && /^\d{4}-\d{2}-\d{2}$/.test(q.bugun || '') && (on || !/(^|\.)kalki\.uz$/.test(location.hostname))) { var fx = q.bugun; S.dates.today = function () { return fx; }; }
  if (!on || !S || !window.Storage) return;
  var P = 'kalkidemo_', SP = Storage.prototype, oGet = SP.getItem, oSet = SP.setItem, oRem = SP.removeItem, oKey = SP.key;
  var map = function (k) { return typeof k === 'string' && /^kalki_/.test(k) ? P + k : k; };
  SP.getItem = function (k) { return oGet.call(this, this === window.localStorage ? map(k) : k); };
  SP.setItem = function (k, v) { return oSet.call(this, this === window.localStorage ? map(k) : k, v); };
  SP.removeItem = function (k) { return oRem.call(this, this === window.localStorage ? map(k) : k); };
  /* oldingi namunani tozalash */
  try { var ls = window.localStorage, del = []; for (var i = 0; i < ls.length; i++) { var k = oKey.call(ls, i); if (k && k.indexOf(P) === 0) del.push(k); } del.forEach(function (k) { oRem.call(ls, k); }); } catch (e) {}
  /* namuna: ayol, 32 yosh, 165 sm, 66 kg; bugun 3 ovqat (aylana ~yarim to'la) */
  var D = S.dates, today = D.today(), st = S.emptyState();
  st.setup = true; st.created = Date.now() - 20 * 86400000; st.trackStart = D.addDays(today, -14); st.profile = { sex: 'f', age: 32, height: 165, weight: 66, act: 2, goal: 'keep' };
  st.prefs = { tipsDone: true, yemayK: 1, introDone: !API.intro, demo: true };
  S.addWeight(st, D.addDays(today, -14), 67); S.addWeight(st, today, 66);
  [{ fid: 'tuxum', meal: 'b', unit: 'dona', qty: 2, g: 100, kcal: 155, p: 12.6, f: 10.6, c: 1.1 }, { fid: 'non', meal: 'b', unit: 'bolak', qty: 1, g: 50, kcal: 146, p: 4.5, f: 0.6, c: 30 },
   { fid: 'osh', meal: 'l', unit: 'kosa', qty: 1, g: 250, kcal: 475, p: 12, f: 21, c: 58 }, { fid: 'olma', meal: 's', unit: 'dona', qty: 1, g: 180, kcal: 94, p: 0.5, f: 0.3, c: 25 }].forEach(function (e) { S.addFood(st, today, e); });
  try { window.localStorage.setItem('kalki_fit', JSON.stringify(st)); window.localStorage.setItem('kalki_news_kalkifit', '{"shown":999,"read":999}'); } catch (e) {}
  /* tarmoq: /api/* — jim */
  var oFetch = window.fetch;
  if (oFetch) window.fetch = function (u, o) {
    var url = typeof u === 'string' ? u : (u && u.url) || '';
    if (/^(https?:\/\/[^/]+)?\/api\//.test(url)) return Promise.resolve(new Response(o && o.method && o.method !== 'GET' ? null : '{}', { status: o && o.method && o.method !== 'GET' ? 204 : 200, headers: { 'Content-Type': 'application/json' } }));
    return oFetch.apply(this, arguments);
  };
  if (navigator.sendBeacon) try { navigator.sendBeacon = function () { return true; }; } catch (e) {}
  API.on = true;
  var LBL = { uz: 'Namuna', ru: 'Образец' };
  API.mark = function (lang) {                         // sarlavha yoniga «Namuna» belgisi (har render'da, bir marta qo'shiladi)
    var t = document.getElementById('rzTitle'); if (!t || !t.parentNode) return; var b = t.parentNode.querySelector('.rz-demo');
    if (!b) { b = document.createElement('span'); b.className = 'rz-demo'; t.parentNode.insertBefore(b, t.nextSibling); } b.textContent = LBL[lang === 'ru' ? 'ru' : 'uz'];
  };
})();
