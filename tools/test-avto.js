/* kalki.uz -- assets/avto-rasm.js uchun sinovlar.
 *
 * Bu testlar formula ARIFMETIKASINI tekshiradi.
 * Huquqiy talqinning to'g'riligini (masalan, egasi almashganda 6,84 BHM)
 * ISBOTLAMAYDI. Invoys summalari test uchun ixtiyoriy tanlangan, real
 * narx emas.
 *
 * Oddiy node skripti (tashqi test freymvorki yo'q). Ishga tushirish:
 *   node tools/test-avto.js
 * Barcha sinov o'tsa chiqish kodi 0, birortasi yiqilsa 1.
 */
'use strict';
var fs = require('fs');
var path = require('path');
var KalkiAvto = require('../assets/avto-rasm.js');

var ROOT = path.resolve(__dirname, '..');
var legal = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'legal-constants.json'), 'utf8'));
var C = {};
legal.constants.forEach(function (c) { C[c.id] = c; });

var BHM = C.bhm_qiymati.qiymat; // 440000 (joriy) — testlar shu real qiymat bilan ishlaydi

function baza(overrides) {
  var o = {
    stsenariy: 'yangi',
    yoqilgi: 'oddiy',
    raqam: 'oddiy',
    raqam_invoys: null,
    sayyor: null,
    sayyor_masofa_km: null,
    ishlab_chiqarilgan_yil: null,
    qarindosh: false,
    kredit: false,
    halokat: false,
    qoldiq_foiz: null,
    notarius_sorovnoma_soni: 0,
    gerbli_blank: true,
    notarius_boshqa: null,
    bank_komissiya: null,
    bugungi_yil: 2026
  };
  for (var k in overrides) o[k] = overrides[k];
  return o;
}

function ishlatilganBaza(overrides) {
  var o = baza({
    stsenariy: 'ishlatilgan',
    yoqilgi: 'oddiy',
    ishlab_chiqarilgan_yil: 2026 - 15,
    raqam: 'oddiy'
  });
  for (var k in overrides) o[k] = overrides[k];
  return o;
}

function jamiOf(natija) { return natija.jami_hisoblangan; }
function topQator(natija, kalitYokiNomi) {
  for (var i = 0; i < natija.qatorlar.length; i++) {
    if (natija.qatorlar[i].kalit === kalitYokiNomi || natija.qatorlar[i].nomi === kalitYokiNomi) return natija.qatorlar[i];
  }
  return null;
}
function topKiritilmagan(natija, nomiQismi) {
  return natija.kiritilmagan.some(function (k) { return k.nomi.indexOf(nomiQismi) > -1; });
}

var pass = 0, fail = 0;
function check(label, cond, details) {
  if (cond) { pass++; }
  else {
    fail++;
    console.log('FAIL [' + label + ']' + (details ? ' — ' + details : ''));
  }
}

// ---------- 1 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({}), C);
  check('1) yangi/oddiy/raqam=oddiy — jami', jamiOf(n) === 7585600, 'chiqdi ' + jamiOf(n));
  check('1) kiritilmagan bo‘sh', n.kiritilmagan.length === 0);
})();

// ---------- 2 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({ yoqilgi: 'ev_gibrid' }), C);
  check('2) yangi/ev_gibrid — jami', jamiOf(n) === 5236000, 'chiqdi ' + jamiOf(n));
})();

// ---------- 3 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({ raqam: 'tanlangan', raqam_invoys: null }), C);
  check('3) tanlangan/invoys=null — jami', jamiOf(n) === 3625600, 'chiqdi ' + jamiOf(n));
  check('3) kiritilmagan: tanlangan raqam', topKiritilmagan(n, 'Tanlangan raqam'));
  check('3) oddiy raqam qatori yo‘q', !topQator(n, 'avto_raqam_oddiy_juft'));
})();

// ---------- 4 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({ raqam: 'tanlangan', raqam_invoys: 5000000 }), C);
  check('4) tanlangan/invoys=5mln — jami', jamiOf(n) === 8625600, 'chiqdi ' + jamiOf(n));
  var q = topQator(n, 'Tanlangan raqam');
  check('4) qayerga=Uzavtomotobelgi', q && q.qayerga === 'Uzavtomotobelgi');
})();

// ---------- 5 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({}), C);
  check('5) ishlatilgan baza — jami', jamiOf(n) === 9213600, 'chiqdi ' + jamiOf(n));
  var royxatQator = topQator(n, royxatKalitFor('oddiy'));
  check('5) ro‘yxat holati NORMATIV_TALQIN', royxatQator && royxatQator.holat === 'NORMATIV_TALQIN');
  check('5) 0,1 BHM qatori yo‘q', !topQator(n, 'avto_qayta_royxat'));
  check('5) kiritilmagan bo‘sh', n.kiritilmagan.length === 0);
  function royxatKalitFor() { return 'avto_royxat_oddiy'; }
})();

// ---------- 6 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ qarindosh: true }), C);
  var boj = topQator(n, 'notarius_avto_oldisotdi');
  check('6) notarius boji=66000', boj && boj.summa === 66000, 'chiqdi ' + (boj && boj.summa));
  check('6) jami=7959600', jamiOf(n) === 7959600, 'chiqdi ' + jamiOf(n));
})();

// ---------- 7 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ kredit: true }), C);
  var boj = topQator(n, 'notarius_avto_oldisotdi');
  check('7) notarius boji=132000', boj && boj.summa === 132000, 'chiqdi ' + (boj && boj.summa));
  check('7) jami=8025600', jamiOf(n) === 8025600, 'chiqdi ' + jamiOf(n));
})();

// ---------- 8 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ ishlab_chiqarilgan_yil: 2026 - 3, bank_komissiya: null }), C);
  check('8) kiritilmagan: bank komissiyasi', topKiritilmagan(n, 'Bank komissiyasi'));
})();

// ---------- 9 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ ishlab_chiqarilgan_yil: 2026 - 10, bank_komissiya: null }), C);
  check('9) eskrou kerak (10 yil, chegara)', topKiritilmagan(n, 'Bank komissiyasi'));
  check('9) chegara ogohlantirishi', n.ogohlantirishlar.some(function (o) { return o.indexOf('Chegara holat') > -1; }));
})();

// ---------- 10 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ ishlab_chiqarilgan_yil: null }), C);
  check('10) "yilni kiriting" ogohlantirishi', n.ogohlantirishlar.some(function (o) { return o.indexOf('yilni kiriting') > -1; }));
})();

// ---------- 11 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ kredit: true, notarius_sorovnoma_soni: 1 }), C);
  var notariusQismi = 0;
  n.qatorlar.forEach(function (q) {
    if (q.kalit === 'notarius_avto_oldisotdi' || q.guruh === 'notarius_xizmat') notariusQismi += q.summa;
  });
  check('11) notarius qismi = 462000 (e-notarius kalkulyatori)', notariusQismi === 462000, 'chiqdi ' + notariusQismi);
  var kutilganSummalar = [132000, 44000, 88000, 66000, 66000, 44000, 22000].sort();
  var chiqqanSummalar = [];
  n.qatorlar.forEach(function (q) {
    if (q.kalit === 'notarius_avto_oldisotdi' || q.guruh === 'notarius_xizmat') chiqqanSummalar.push(q.summa);
  });
  chiqqanSummalar.sort();
  check('11) qatorlar to‘plami mos', JSON.stringify(kutilganSummalar) === JSON.stringify(chiqqanSummalar),
    'kutilgan ' + JSON.stringify(kutilganSummalar) + ' chiqdi ' + JSON.stringify(chiqqanSummalar));
})();

// ---------- 12 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ raqam: 'otkazish', raqam_invoys: null }), C);
  check('12) jami=5253600', jamiOf(n) === 5253600, 'chiqdi ' + jamiOf(n));
  check('12) kiritilmagan: raqamni o‘tkazish', topKiritilmagan(n, "o'tkazish") || topKiritilmagan(n, '‘tkazish'));
  check('12) malumotda 50% matni bor', n.malumot.some(function (m) { return m.matn.indexOf('50 foizi') > -1; }));
  check('12) malumotda summa (so‘m) yo‘q', !n.malumot.some(function (m) { return /so'm|сум/i.test(m.matn); }));
})();

// ---------- 13 ----------
(function () {
  var C2 = JSON.parse(JSON.stringify(C));
  C2.bhm_qiymati.qiymat = 500000;
  var n = KalkiAvto.hisobla(baza({}), C2);
  check('13) BHM=500000 — jami=8620000', jamiOf(n) === 8620000, 'chiqdi ' + jamiOf(n));
})();

// ---------- 14 ----------
(function () {
  var threw = false;
  try {
    KalkiAvto.readConst(C, 'avto_raqam_yoqolgan');
  } catch (e) {
    threw = true;
  }
  check('14) ZIDDIYAT konstanta o‘qishga urinish xato tashlaydi', threw);

  // hech qaysi fixture natijasida ZIDDIYAT/BLOKLANGAN kalitli qator yo'qligini
  // tekshiramiz (fixture 1-12 orqali)
  var ziddiyatKalitlar = [];
  legal.constants.forEach(function (c) {
    if (c.holat === 'ZIDDIYAT' || c.holat === 'BLOKLANGAN') ziddiyatKalitlar.push(c.id);
  });
  var barchaFixtureNatija = [
    KalkiAvto.hisobla(baza({}), C),
    KalkiAvto.hisobla(ishlatilganBaza({}), C),
    KalkiAvto.hisobla(ishlatilganBaza({ qarindosh: true }), C),
    KalkiAvto.hisobla(ishlatilganBaza({ kredit: true }), C)
  ];
  var topilgan = null;
  barchaFixtureNatija.forEach(function (n) {
    n.qatorlar.forEach(function (q) {
      if (q.kalit && ziddiyatKalitlar.indexOf(q.kalit) > -1) topilgan = q.kalit;
    });
  });
  check('14) fixture qatorlarida ZIDDIYAT/BLOKLANGAN kalit yo‘q', !topilgan, 'topildi: ' + topilgan);
})();

// ---------- 15 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({ sayyor: '1kun', sayyor_masofa_km: 25 }), C);
  check('15) sayyor 1kun+25km — jami=9675600', jamiOf(n) === 9675600, 'chiqdi ' + jamiOf(n));
})();

// ---------- 16 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({ sayyor: '5kun', sayyor_masofa_km: 10 }), C);
  check('16) sayyor 5kun+10km — jami=8465600', jamiOf(n) === 8465600, 'chiqdi ' + jamiOf(n));
  check('16) km qatori yo‘q', !topQator(n, 'avto_sayyor_km'));
})();

// ---------- 17 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({ sayyor: '3kun', sayyor_masofa_km: null }), C);
  check('17) sayyor 3kun+masofa=null — jami=8905600', jamiOf(n) === 8905600, 'chiqdi ' + jamiOf(n));
  check('17) kiritilmagan: masofa', topKiritilmagan(n, 'masofa'));
})();

// ---------- 18 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ sayyor: '1kun' }), C);
  check('18) ishlatilganda sayyor e‘tiborga olinmaydi — jami=9213600', jamiOf(n) === 9213600, 'chiqdi ' + jamiOf(n));
})();

// ---------- 19 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ qarindosh: true }), C);
  var notariusQismi = 0;
  n.qatorlar.forEach(function (q) {
    if (q.kalit === 'notarius_avto_oldisotdi' || q.guruh === 'notarius_xizmat') notariusQismi += q.summa;
  });
  check('19) qarindosh notarius qismi=374000', notariusQismi === 374000, 'chiqdi ' + notariusQismi);
})();

// ---------- 20 ----------
(function () {
  var n = KalkiAvto.hisobla(baza({}), C);
  check('20) yangi avtoda notarius_xizmat guruhi yo‘q', !n.qatorlar.some(function (q) { return q.guruh === 'notarius_xizmat'; }));
})();

// ---------- 21 ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ gerbli_blank: false }), C);
  check('21) gerbli_blank=false — jami=9169600', jamiOf(n) === 9169600, 'chiqdi ' + jamiOf(n));
  check('21) gerb qatori yo‘q', !topQator(n, 'notarius_gerb_yigimi'));
  check('21) kiritilmagan ro‘yxatida gerb yo‘q', !topKiritilmagan(n, 'gerb') && !topKiritilmagan(n, 'Gerb'));
})();

// ---------- A1 (2-FAZA: qarindosh+kredit ko'paytiriladi) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ qarindosh: true, kredit: true }), C);
  var boj = topQator(n, 'notarius_avto_oldisotdi');
  check('A1) qarindosh+kredit — boji=6600', boj && boj.summa === 6600, 'chiqdi ' + (boj && boj.summa));
})();

// ---------- A2 (2-FAZA: begona + halokat qoldiq 10%) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ halokat: true, qoldiq_foiz: 10 }), C);
  var boj = topQator(n, 'notarius_avto_oldisotdi');
  check('A2) begona+halokat(10%) — boji=132000', boj && boj.summa === 132000, 'chiqdi ' + (boj && boj.summa));
})();

// ---------- A3 (2-FAZA: qarindosh+kredit+halokat qoldiq 10%) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ qarindosh: true, kredit: true, halokat: true, qoldiq_foiz: 10 }), C);
  var boj = topQator(n, 'notarius_avto_oldisotdi');
  check('A3) qarindosh+kredit+halokat(10%) — boji=660', boj && boj.summa === 660, 'chiqdi ' + (boj && boj.summa));
})();

// ---------- A4 (2-FAZA: halokat=true, qoldiq_foiz=null -> kiritilmagan) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ halokat: true, qoldiq_foiz: null }), C);
  check('A4) halokat, qoldiq_foiz=null — notarius boji kiritilmagan', topKiritilmagan(n, 'Amal qilish qoldiq foizi'));
  check('A4) notarius boji qatori yo‘q', !topQator(n, 'notarius_avto_oldisotdi'));
})();

// ---------- A5 (2-FAZA: qoldiq_foiz oralig'idan tashqari -> ogohlantirish) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ halokat: true, qoldiq_foiz: 150 }), C);
  check('A5) qoldiq_foiz=150 — ogohlantirish bor', n.ogohlantirishlar.some(function (o) { return o.indexOf('0-100 oralig') > -1; }));
})();

// ---------- A6 (2-FAZA: bayroqsiz — 1-faza fixture 5 bilan bir xil) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ qarindosh: false, kredit: false, halokat: false }), C);
  var boj = topQator(n, 'notarius_avto_oldisotdi');
  check('A6) bayroqsiz — boji=1320000', boj && boj.summa === 1320000, 'chiqdi ' + (boj && boj.summa));
})();

// ---------- R1 (2-FAZA: lang='ru' — summalar bir xil, matn ruscha) ----------
(function () {
  var nUz = KalkiAvto.hisobla(baza({}), C, 'uz');
  var nRu = KalkiAvto.hisobla(baza({}), C, 'ru');
  check('R1) uz/ru jami bir xil', jamiOf(nUz) === jamiOf(nRu), 'uz=' + jamiOf(nUz) + ' ru=' + jamiOf(nRu));
  check('R1) ru qatorida lotin harflari (ozbekcha) yoq', !nRu.qatorlar.some(function (q) { return /[o'g'sh]{3,}/.test(q.nomi) && /Davlat|royxat/i.test(q.nomi); }));
  check('R1) ru qator nomi kutilgan matnni ichiga oladi', nRu.qatorlar.some(function (q) { return q.kalit === 'avto_royxat_oddiy' && /регистрация/i.test(q.nomi); }));
})();

// ---------- R2 (2-FAZA: lang='ru' — qarindosh+kredit omil matni) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ qarindosh: true, kredit: true }), C, 'ru');
  var boj = topQator(n, 'notarius_avto_oldisotdi');
  check('R2) ru — boji=6600', boj && boj.summa === 6600, 'chiqdi ' + (boj && boj.summa));
  check('R2) ru — nomida "родственник" bor', boj && /родственник/i.test(boj.nomi), 'nomi=' + (boj && boj.nomi));
})();

// ---------- R3 (2-FAZA: lang='ru' — halokat, qoldiq_foiz=null kiritilmagan) ----------
(function () {
  var n = KalkiAvto.hisobla(ishlatilganBaza({ halokat: true, qoldiq_foiz: null }), C, 'ru');
  check('R3) ru — kiritilmagan nomi ruscha', n.kiritilmagan.some(function (k) { return /процент/i.test(k.nomi); }));
})();

// ---------- R4 (2-FAZA: lang berilmasa standart 'uz') ----------
(function () {
  var n = KalkiAvto.hisobla(baza({}), C);
  check('R4) lang berilmasa uz standart', n.qatorlar[0].nomi.indexOf("ro'yxatidan") > -1, 'nomi=' + n.qatorlar[0].nomi);
})();

console.log('');
console.log('BHM (joriy, testda ishlatilgan): ' + BHM);
console.log(pass + ' ta o‘tdi, ' + fail + ' ta yiqildi (jami ' + (pass + fail) + ')');
process.exit(fail ? 1 : 0);
