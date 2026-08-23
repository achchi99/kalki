/* kalki.uz — CSV eksport (Excel uchun), tashqi kutubxonasiz.
 *
 * SheetJS kabi .xlsx yozadigan kutubxona og'ir (yuzlab KB) va bu loyihada
 * boshqa og'ir bog'liqliklar (html2canvas, jsPDF) kabi faqat bosilganda
 * yuklanadi. .xlsx o'rniga CSV yetarli — Excel uni to'g'ridan-to'g'ri
 * ochadi, hech qanday bog'liqlik shart emas.
 *
 * Excel'da buzilmasligi uchun uchta shart:
 *  1. UTF-8 BOM (﻿) fayl boshida — bo'lmasa o'zbek/rus harflari
 *     krakozyabra bo'lib chiqadi.
 *  2. Ajratgich ';' — MDT mintaqasidagi Excel ',' ni kutmaydi.
 *  3. Raqamlar formatlanmagan (bo'shliqsiz) — aks holda Excel matn deb
 *     qabul qiladi va formula/yig'indi ishlamaydi.
 */
(function (w, d) {
  'use strict';

  function esc(v) {
    v = String(v == null ? '' : v);
    if (/[;"\n\r]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
    return v;
  }

  /* rows: massivlar massivi — har bir ichki massiv bitta CSV qatori.
     Bo'sh massiv ([]) — bo'sh qator (bo'limlarni ajratish uchun). */
  function download(filename, rows) {
    var csv = rows.map(function (row) { return row.map(esc).join(';'); }).join('\r\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = d.createElement('a');
    a.href = url; a.download = filename;
    d.body.appendChild(a); a.click();
    setTimeout(function () { d.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }

  w.KalkiCSV = { download: download };
})(window, document);
