/* kalki.uz — assets/doc-handoff.js: format tanlovi funksiyalari testi.
 * node tools/test-doc-handoff.js
 */
'use strict';
const H = require('../assets/doc-handoff.js');

let ok = 0, bad = 0;
function check(name, cond, extra) {
  if (cond) { ok++; }
  else { bad++; console.log('FAIL', name, extra || ''); }
}

/* ---------- partyName: yuridik / jismoniy / tur yo'q ---------- */
check('1) yuridik -> Org qaytadi', H.partyName('yuridik', '"Nur Savdo" MChJ', 'Aliyev Vali') === '"Nur Savdo" MChJ');
check('2) jismoniy -> Fio qaytadi', H.partyName('jismoniy', '"Nur Savdo" MChJ', 'Aliyev Vali') === 'Aliyev Vali');
check('3) tur noma\'lum -> bo\'sh (Org\'ga standart qilinmaydi)', H.partyName('', '"Nur Savdo" MChJ', 'Aliyev Vali') === '');
check('4) tur noma\'lum (undefined) -> bo\'sh', H.partyName(undefined, 'X', 'Y') === '');
check('5) yuridik lekin Org bo\'sh -> bo\'sh (taxmin qilinmaydi)', H.partyName('yuridik', '', 'Aliyev Vali') === '');
check('6) jismoniy lekin Fio bo\'sh -> bo\'sh', H.partyName('jismoniy', '"Nur Savdo" MChJ', '') === '');

/* ---------- combineAddrPhone ---------- */
check('7) ikkalasi ham bor -> "Addr, tel: Phone"', H.combineAddrPhone('Toshkent sh.', '+998901234567') === 'Toshkent sh., tel: +998901234567');
check('8) faqat addr -> addr', H.combineAddrPhone('Toshkent sh.', '') === 'Toshkent sh.');
check('9) faqat phone -> phone', H.combineAddrPhone('', '+998901234567') === '+998901234567');
check('10) ikkalasi ham yo\'q -> bo\'sh', H.combineAddrPhone('', '') === '');
check('11) bo\'sh joylar trim qilinadi', H.combineAddrPhone('  Toshkent sh.  ', '  ') === 'Toshkent sh.');

console.log(ok + ' ta o\'tdi, ' + bad + ' ta yiqildi (jami ' + (ok + bad) + ')');
process.exit(bad ? 1 : 0);
