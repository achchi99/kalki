/* kalki.uz — "Qisqacha javob" bloki (FAZA 1.1, pilot).
 *
 * MAQSAD. Google featured snippet — savolga to'g'ridan-to'g'ri, qisqa
 * javobni sahifa boshida beradi. H1'dan keyin, forma ichidan OLDIN
 * joylashadi (crosslink.js'dagi banner bilan bir xil o'rin: main.wrap
 * ichidagi birinchi element).
 *
 * MATN MANBAI. Har sahifa o'zining <script type="application/json"
 * id="answerbox-data"> blokida uz/ru matnini beradi — bu fayl faqat
 * o'qiydi va chizadi, matnni o'zi o'ylab topmaydi.
 *
 * "Yangilangan" sanasi build vaqtida (tools/prerender.js) shu JSON'ga
 * "updated" maydoni sifatida yoziladi — faylning oxirgi git commit
 * sanasidan.
 */
(function (w, d) {
  'use strict';

  var CSS = '.answerbox{margin:0 0 18px;padding:14px 16px;background:#F1F7F3;'
    + 'border:1.5px solid #C9DDD1;border-left:4px solid #0E3B2E;border-radius:10px;'
    + 'max-width:100%;box-sizing:border-box}'
    + '.answerbox .ab-text{font-size:14.5px;line-height:1.55;color:#16211C;font-weight:600;'
    + 'margin:0;word-wrap:break-word}'
    + '.answerbox .ab-meta{margin-top:8px;font-size:12px;color:#5C6B63;font-weight:600}'
    + '.answerbox .ab-sources{margin-top:3px;font-size:12px;color:#5C6B63;word-wrap:break-word}'
    + '.answerbox .ab-sources a{color:#155E63;text-decoration:underline}'
    + '@media print{.answerbox{display:none}}';

  // Guard faqat <style> elementini yaratishni o'tkazib yuboradi.
  function ensureCss() {
    if (d.getElementById('answerboxcss')) return;
    var st = d.createElement('style');
    st.id = 'answerboxcss';
    st.textContent = CSS;
    d.head.appendChild(st);
  }

  function curLang() { return d.documentElement.lang === 'ru' ? 'ru' : 'uz'; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var box = null;
  var boxData = null;

  function render() {
    if (!box || !boxData) return;
    var l = curLang();
    var t = boxData[l] || boxData.uz;
    if (!t) return;
    var html = '<p class="ab-text">' + esc(t.text) + '</p>';
    if (boxData.updated) {
      html += '<div class="ab-meta">' + (l === 'ru' ? 'Обновлено: ' : 'Yangilangan: ') + esc(boxData.updated) + '</div>';
    }
    if (t.sources && t.sources.length) {
      var links = t.sources.map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + '</a>';
      }).join(', ');
      html += '<div class="ab-sources">' + (l === 'ru' ? 'Источник: ' : 'Manba: ') + links + '</div>';
    }
    box.innerHTML = html;
  }

  // Guard faqat DOM elementini (va matn ma'lumotini) yaratishni o'tkazib
  // yuboradi — hodisa bog'lash (bindLangListeners) bundan mustaqil.
  function ensureBox() {
    var existing = d.getElementById('answerbox');
    if (existing) { box = existing; return true; }
    var dataEl = d.getElementById('answerbox-data');
    if (!dataEl) return false;
    try { boxData = JSON.parse(dataEl.textContent); } catch (e) { return false; }
    var h1 = d.querySelector('h1');
    var host = d.querySelector('main.wrap');
    if (!h1 || !host) return false;
    ensureCss();
    box = d.createElement('div');
    box.className = 'answerbox noprint';
    box.id = 'answerbox';
    host.insertBefore(box, host.firstChild);
    return true;
  }

  // Til tugmasi bosilganda qayta chizish — element mavjud bo'lsa ham,
  // yo'q bo'lsa ham, bu bog'lanish HAR DOIM sodir bo'lishi kerak.
  function bindLangListeners() {
    if (w.__answerboxBound) return;
    w.__answerboxBound = true;
    ['langUz', 'langRu'].forEach(function (id) {
      var b = d.getElementById(id);
      if (b) b.addEventListener('click', function () { w.setTimeout(render, 160); });
    });
  }

  function init() {
    if (ensureBox()) render();
    bindLangListeners();
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})(window, document);
