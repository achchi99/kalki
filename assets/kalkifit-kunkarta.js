/* kalki.uz — KalkiFit: «Kun kartasi» (kun yakuni rasmi, 1080×1350 PNG). Faqat kun natijasi: sana, iste'mol/maqsad halqasi, suv, qadam, eng katta taom ikonkasi, bitta hazil.
   Vazn, yosh va boshqa shaxsiy ma'lumot RASMGA TUSHMAYDI. DOM'siz chizish (canvas 2D) — brauzerda window.KalkiKunKarta, Node'da require() (test: ma'lumot tuzilishi). */
(function (root) {
  'use strict';
  var W = 1080, H = 1350, F = 'Manrope,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
  var THEME = {
    light: { bg0: '#FBF6F1', bg1: '#F3EBE4', card: '#FFFFFF', ink: '#1E1A17', mut: '#6B625B', acc: '#E0603F', ring: '#EADFD6', water: '#2F8FD8', steps: '#2E9E6A', tile: '#F3EBE4' },
    dark: { bg0: '#1B1714', bg1: '#2A221D', card: '#2F2722', ink: '#F7F1EC', mut: '#C9BDB3', acc: '#FF8A66', ring: '#43382F', water: '#6FB8F0', steps: '#5CCB93', tile: '#F3EBE4' }
  };
  /* d: { dark, date (matn), eaten, limit, ml, mlGoal, steps, stepGoal, food (taom nomi), img (Image|null), letter, joke, L: { eaten, goal, water, steps, kcal, ml, top } } */
  function card(d) {
    return { dark: !!d.dark, date: String(d.date || ''), eaten: Math.max(0, Math.round(+d.eaten || 0)), limit: Math.max(1, Math.round(+d.limit || 0)), ml: Math.max(0, Math.round(+d.ml || 0)), mlGoal: Math.max(1, Math.round(+d.mlGoal || 0)),
      steps: Math.max(0, Math.round(+d.steps || 0)), stepGoal: Math.max(1, Math.round(+d.stepGoal || 0)), food: d.food ? String(d.food) : '', img: d.img || null, letter: String(d.letter || '').slice(0, 1).toUpperCase(), joke: d.joke ? String(d.joke) : '', L: d.L || {} };
  }
  function nf(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function wrap(c, text, maxW, maxLines) {
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); var l = lines[maxLines - 1]; while (l && c.measureText(l + '…').width > maxW) l = l.slice(0, -1); lines[maxLines - 1] = l.replace(/\s+$/, '') + '…'; }
    return lines;
  }
  function draw(cv, d0) {
    var d = card(d0), P = THEME[d.dark ? 'dark' : 'light'], L = d.L, c = cv.getContext('2d'); cv.width = W; cv.height = H;
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, P.bg0); g.addColorStop(1, P.bg1); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    c.fillStyle = P.acc; c.font = '800 56px ' + F; c.fillText('KalkiFit', 80, 140);
    c.fillStyle = P.mut; c.font = '600 40px ' + F; c.fillText(d.date, 80, 200);
    /* halqa: iste'mol / maqsad */
    var cx = W / 2, cy = 470, R = 210, lw = 44, ratio = Math.min(1, d.eaten / d.limit), over = d.eaten > d.limit;
    c.lineCap = 'round'; c.lineWidth = lw; c.strokeStyle = P.ring; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    if (ratio > 0) { c.strokeStyle = P.acc; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio); c.stroke(); }
    c.textAlign = 'center'; c.fillStyle = P.ink; c.font = '800 104px ' + F; c.fillText(nf(d.eaten), cx, cy + 18);
    var gl = (L.goal || '') + ' ' + nf(d.limit) + ' ' + (L.kcal || ''), fs = 34; c.font = '600 ' + fs + 'px ' + F; while (fs > 22 && c.measureText(gl).width > 300) { fs -= 2; c.font = '600 ' + fs + 'px ' + F; } c.fillStyle = P.mut; c.fillText(gl, cx, cy + 74);
    if (over) { c.fillStyle = P.acc; c.font = '700 32px ' + F; c.fillText('+' + nf(d.eaten - d.limit), cx, cy - 92); }
    /* suv va qadam — ikki karta */
    var y0 = 760, cw = 440, ch = 170;
    [[80, L.water || '', nf(d.ml) + ' ' + (L.ml || ''), Math.min(1, d.ml / d.mlGoal), P.water], [560, L.steps || '', nf(d.steps), Math.min(1, d.steps / d.stepGoal), P.steps]].forEach(function (b) {
      c.fillStyle = P.card; rr(c, b[0], y0, cw, ch, 36); c.fill();
      c.textAlign = 'left'; c.fillStyle = P.mut; c.font = '600 34px ' + F; c.fillText(b[1], b[0] + 36, y0 + 58);
      c.fillStyle = P.ink; c.font = '800 60px ' + F; c.fillText(b[2], b[0] + 36, y0 + 124);
      c.fillStyle = P.ring; rr(c, b[0] + 36, y0 + 142, cw - 72, 10, 5); c.fill(); if (b[3] > 0) { c.fillStyle = b[4]; rr(c, b[0] + 36, y0 + 142, Math.max(10, (cw - 72) * b[3]), 10, 5); c.fill(); }
    });
    /* eng katta taom */
    var y1 = 970;
    if (d.food) {
      c.fillStyle = P.tile; rr(c, 80, y1, 120, 120, 28); c.fill();
      if (d.img && d.img.width) { try { c.save(); rr(c, 80, y1, 120, 120, 28); c.clip(); c.drawImage(d.img, 80, y1, 120, 120); c.restore(); } catch (e) {} } else { c.fillStyle = P.acc; c.textAlign = 'center'; c.font = '800 60px ' + F; c.fillText(d.letter || '•', 140, y1 + 82); }
      c.textAlign = 'left'; c.fillStyle = P.mut; c.font = '600 32px ' + F; c.fillText(L.top || '', 228, y1 + 46);
      c.fillStyle = P.ink; c.font = '700 44px ' + F; c.fillText(wrap(c, d.food, 770, 1)[0], 228, y1 + 100);
    }
    /* hazil */
    if (d.joke) { c.fillStyle = P.ink; c.font = 'italic 600 38px ' + F; c.textAlign = 'left'; wrap(c, d.joke, W - 160, 2).forEach(function (l, i) { c.fillText(l, 80, 1160 + i * 52); }); }
    c.textAlign = 'center'; c.fillStyle = P.mut; c.font = '700 34px ' + F; c.fillText('KalkiFit · kalki.uz', W / 2, H - 56);
    return cv;
  }
  /* kun natijasiga mos hazil holati (raqamsiz holatlar): aniq maqsadda → on_target; >10% yuqori → dayend_high; qolgani → dayend */
  function jokeState(eaten, limit) { if (limit > 0 && Math.abs(eaten - limit) <= limit * 0.05) return 'on_target'; if (eaten > limit * 1.1) return 'dayend_high'; return 'dayend'; }
  var api = { W: W, H: H, THEME: THEME, card: card, draw: draw, jokeState: jokeState };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiKunKarta = api;
})(typeof window !== 'undefined' ? window : this);
