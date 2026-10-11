/* kalki.uz — "Yangi: AI ariza" e'lon kartasi (bosh sahifa va hujjatlar ro'yxati).
 *
 * Faqat UZ (lang="uz") va faqat brauzerda yaratiladi (prerender/RU/CYR HTML'ga tushmaydi).
 * Ichki havola: /ariza-namunasi#ai. O'chirish: AI_PROMO_YOQILGAN = false yoki <script> tegini olib tashlash.
 */
(function () {
  'use strict';
  var AI_PROMO_YOQILGAN = true;
  if (!AI_PROMO_YOQILGAN) return;
  if (/jsdom/i.test(navigator.userAgent || '')) return;
  if (document.documentElement.lang !== 'uz') return;

  function init() {
    if (document.getElementById('aiPromo')) return;
    var anchor, place;
    var cta = document.getElementById('docs-cta') || document.getElementById('docs');
    var cat = document.getElementById('dcat-ariza');
    if (cta) { anchor = cta.querySelector('.dgrid') || cta.querySelector('.dc-grid'); place = 'cta'; }
    else if (cat) { anchor = cat.querySelector('.dcat-head'); place = 'cat'; }
    if (!anchor) return;

    var st = document.createElement('style');
    st.id = 'aipcss';
    st.textContent = '.aip{display:flex;align-items:center;gap:10px;min-width:0;text-decoration:none;font-weight:700;font-size:14px;line-height:1.35;border-radius:11px;padding:11px 14px;margin:10px 0 0}' +
      '.aip-t{flex:1;min-width:0;overflow-wrap:anywhere}.aip-t b{font-weight:800}.aip-go{flex:none;font-weight:800}' +
      '.aip-n{flex:none;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:#D99A2B;color:#2A1D00;border-radius:99px;padding:2px 8px}' +
      '#docs-cta .aip{background:rgba(217,154,43,.16);border:1px solid rgba(217,154,43,.55);color:#fff}' +
      'body.v2 .aip{background:var(--surface);border:1px solid var(--line);border-left:4px solid var(--gold);color:var(--text);margin:var(--s2) 0 0;font-size:16px;padding:14px 18px;border-radius:var(--r)}body.v2 .aip:hover{box-shadow:var(--shadow-hover)}body.v2 .aip .aip-i{width:20px;height:20px;flex:none;fill:none;stroke:var(--gold);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;color:var(--gold)}body.v2 .aip-n{background:var(--gold-soft);color:#7A4F05}' +
      '#dcat-ariza .aip{background:#FFF7E3;border:1.5px solid #E6C275;color:#4A3305;margin:0 0 14px}';
    document.head.appendChild(st);

    var a = document.createElement('a');
    a.id = 'aiPromo';
    a.className = 'aip';
    a.href = 'ariza-namunasi#ai';
    a.innerHTML = '<span class="aip-n">Yangi</span><svg class="aip-i" aria-hidden="true" width="20" height="20"><use href="/assets/icons.svg#i-sparkles"></use></svg><span class="aip-t"><b>AI ariza matnini yozib beradi</b> — vaziyatingizni yozing, tayyor matn oling</span><span class="aip-go">→</span>';
    if (place === 'cta') anchor.parentNode.insertBefore(a, anchor.nextSibling);
    else anchor.parentNode.insertBefore(a, anchor.nextSibling);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
