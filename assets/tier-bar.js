/* kalki.uz — pog'ona chizig'i (UMUMIY komponent): har bir pog'ona alohida rang (yashildan qizilgacha),
 * foydalanuvchi sarfi strelka bilan ko'rsatiladi. Gaz kalkulyatorida ishlaydi; elektr va boshqa pog'onali tariflarga ham
 * shu komponent qo'yiladi — tarif raqamlari komponentda YO'Q, ular chaqiruvchidan keladi (gaz-tarif.js / elektr-tarif.js).
 *
 *   KalkiTierBar.render(el, {
 *     tiers:   [{ from, to, price }],      // to: Infinity — oxirgi pog'ona (assets/tarif-core.js limits/prices dan)
 *     value:   300,                        // foydalanuvchi sarfi (0 yoki bo'sh — strelka chizilmaydi)
 *     valueLabel: '300 m³',                // strelka ustidagi yozuv
 *     priceFmt: fn(price) -> string,       // pog'ona ichidagi narx yozuvi (sukut: raqam)
 *     tickFmt:  fn(limit) -> string,       // pog'ona chegarasi yozuvi (sukut: raqam)
 *     caption: "Pog'ona narxi, so'm/m³ …", // chiziq ostidagi izoh
 *     ariaLabel: "…"                       // skrinridlar uchun to'liq tavsif
 *   });
 *
 * Joylashuv: pog'onalar teng kenglikda (chegaralar 10× farq qilsa ham 320 px da o'qiladi); strelka — o'z pog'onasi
 * ichidagi o'rniga qarab: x = (pog'ona raqami + pog'ona ichidagi ulush) / pog'onalar soni. Oxirgi ("va undan yuqori")
 * pog'onada ulush 0,5 deb olinadi. Yozuv chetga chiqib ketmasligi uchun CSS clamp() ishlatilgan.
 * Kontrast: pog'ona ichidagi oq yozuv >= 4,5:1; chiziq oq "plastina" ustida (qorong'i natija kartasida ham o'qiladi). */
(function (root) {
  'use strict';

  // Oq yozuv bilan kontrast: 5,26 / 4,80 / 5,33 / 5,43 / 6,54 / 8,85 (WCAG AA >= 4,5)
  var PALETTE = ['#1E7B4B', '#4F7F12', '#8A6500', '#B5470A', '#B3261E', '#8E1B3C'];
  var BY_N = { 1: [0], 2: [0, 4], 3: [0, 2, 4], 4: [0, 2, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5] };

  var CSS = '.tb{background:#fff;color:#16211C;border-radius:12px;padding:10px 12px 9px;margin:0 0 14px;overflow:hidden}'
    + '.tb-top{position:relative;height:38px}'
    + '.tb-flag{position:absolute;top:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;pointer-events:none}'
    + '.tb-val{font-size:12px;font-weight:800;line-height:1;white-space:nowrap;background:#16211C;color:#fff;border-radius:6px;padding:5px 8px}'
    + '.tb-arrow{width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #16211C;margin-top:-1px}'
    + '.tb-bar{display:flex;gap:2px}'
    + '.tb-seg{flex:1 1 0;min-width:0;height:30px;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;color:#fff;border-radius:5px;white-space:nowrap}'
    + '.tb-seg:first-child{border-radius:9px 5px 5px 9px}.tb-seg:last-child{border-radius:5px 9px 9px 5px}'
    + '.tb-seg.on{box-shadow:0 0 0 2px #fff,0 0 0 4px #16211C}'
    + '.tb-ticks{position:relative;height:17px;margin-top:5px}'
    + '.tb-tick{position:absolute;top:0;transform:translateX(-50%);font-size:10.5px;font-weight:700;color:#5C6B63;white-space:nowrap}'
    + '.tb-tick:first-child{transform:none}'
    + '.tb-cap{margin:4px 0 0;font-size:11px;line-height:1.35;color:#5C6B63}';

  function addCss() {
    if (!root.document || root.document.getElementById('tierbarcss')) return;
    var s = root.document.createElement('style'); s.id = 'tierbarcss'; s.textContent = CSS;
    root.document.head.appendChild(s);
  }
  function esc(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var def = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };

  /* Strelka o'rni (0–100, %) va qaysi pog'onada: sof hisob — testda ham ishlatiladi. */
  function position(tiers, value) {
    var v = Number(value);
    if (!(v > 0) || !tiers.length) return null;
    var n = tiers.length, i = 0;
    while (i < n - 1 && v > tiers[i].to) i++;
    var prev = i ? tiers[i - 1].to : 0, f;
    if (tiers[i].to === Infinity) f = 0.5;
    else f = Math.min(1, Math.max(0, (v - prev) / (tiers[i].to - prev)));
    var x = (i + f) / n * 100;
    return { idx: i, x: Math.min(99, Math.max(1, Math.round(x * 100) / 100)) };
  }

  function render(el, o) {
    if (!el) return;
    addCss();
    var tiers = o.tiers || [], n = tiers.length;
    if (!n) { el.innerHTML = ''; return; }
    var pf = o.priceFmt || def, tf = o.tickFmt || def, pos = position(tiers, o.value), pal = BY_N[Math.min(Math.max(n, 1), 6)] || BY_N[6];
    var segs = '', ticks = '<span class="tb-tick" style="left:0">0</span>';
    for (var i = 0; i < n; i++) {
      segs += '<div class="tb-seg' + (pos && pos.idx === i ? ' on' : '') + '" style="background:' + PALETTE[pal[i]] + '" data-tier="' + (i + 1) + '">' + esc(pf(tiers[i].price)) + '</div>';
      if (i < n - 1) ticks += '<span class="tb-tick" style="left:' + ((i + 1) / n * 100) + '%">' + esc(tf(tiers[i].to)) + '</span>';
    }
    // strelka uchi aniq x% da, yozuv esa chetga chiqmasligi uchun clamp() bilan suriladi
    var arrow = pos ? '<div class="tb-pt" style="position:absolute;left:' + pos.x + '%;bottom:0;transform:translateX(-50%)"><div class="tb-arrow" data-x="' + pos.x + '"></div></div>' : '';
    var label = pos ? '<div class="tb-flag" style="left:clamp(34px,' + pos.x + '%,calc(100% - 34px));top:0"><span class="tb-val">' + esc(o.valueLabel || '') + '</span></div>' : '';
    el.innerHTML = '<div class="tb" role="img" aria-label="' + esc(o.ariaLabel || '') + '"' + (pos ? ' data-x="' + pos.x + '" data-tier="' + (pos.idx + 1) + '"' : '') + '>'
      + '<div class="tb-top" aria-hidden="true">' + label + arrow + '</div>'
      + '<div class="tb-bar" aria-hidden="true">' + segs + '</div>'
      + '<div class="tb-ticks" aria-hidden="true">' + ticks + '</div>'
      + (o.caption ? '<p class="tb-cap">' + esc(o.caption) + '</p>' : '') + '</div>';
  }

  root.KalkiTierBar = { render: render, position: position, palette: PALETTE };
  if (typeof module === 'object' && module.exports) module.exports = root.KalkiTierBar;
})(typeof self !== 'undefined' ? self : this);
