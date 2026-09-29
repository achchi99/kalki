/* kalki.uz — assets/doc-checks.js uchun node test.
 * node tools/test-doc-checks.js
 */
'use strict';
const DC = require('../assets/doc-checks.js');

let ok = 0, bad = 0;
function check(name, cond, extra) {
  if (cond) { ok++; }
  else { bad++; console.log('FAIL', name, extra || ''); }
}

/* ---------- Shartnoma ---------- */
(function () {
  const clean = DC.checkContract({ payMode: 'full', stageSum: 0, stageCount: 0, grand: 1000, prepay: 0, startDate: '2026-01-01', endDate: '2026-02-01' });
  check('1) toza shartnoma -> 0 topilma', clean.length === 0, clean);

  const stageMismatch = DC.checkContract({ payMode: 'stages', stageSum: 900, stageCount: 2, grand: 1000, prepay: 0 });
  check('2) bosqichlar yig\'indisi mos emas -> topiladi', stageMismatch.some((i) => i.code === 'stage_sum_mismatch'));

  const prepayTooBig = DC.checkContract({ payMode: 'prepay', grand: 1000, prepay: 1200 });
  check('3) avans jamidan katta -> topiladi', prepayTooBig.some((i) => i.code === 'prepay_exceeds_total'));

  const badDates = DC.checkContract({ payMode: 'full', grand: 1000, startDate: '2026-05-01', endDate: '2026-04-01' });
  check('4) tugash < boshlanish -> topiladi', badDates.some((i) => i.code === 'end_before_start'));
})();

/* ---------- Hisob ---------- */
(function () {
  const clean = DC.checkInvoice({ total: 1000, vatMode: 'siz' }, { grand: 1000, vatMode: 'siz' });
  check('5) hisob shartnomaga mos -> 0 topilma', clean.length === 0, clean);

  const totalMismatch = DC.checkInvoice({ total: 900, vatMode: 'siz' }, { grand: 1000, vatMode: 'siz' });
  check('6) hisob summasi shartnomaga mos emas -> topiladi', totalMismatch.some((i) => i.code === 'total_mismatch_contract'));

  const vatMismatch = DC.checkInvoice({ total: 1000, vatMode: 'ichida' }, { grand: 1000, vatMode: 'ustiga' });
  check('7) QQS rejimi mos emas -> topiladi', vatMismatch.some((i) => i.code === 'vat_mode_mismatch'));

  const noRef = DC.checkInvoice({ total: 500, vatMode: 'siz' }, null);
  check('8) shartnomasiz hisob -> 0 topilma (solishtiradigan narsa yo\'q)', noRef.length === 0, noRef);
})();

/* ---------- Dalolatnoma ---------- */
(function () {
  const clean = DC.checkAct({ defect: 'nuqsonsiz', defectTxt: '', items: [{ done: true }] });
  check('9) toza dalolatnoma -> 0 topilma', clean.length === 0, clean);

  const textButNoDefect = DC.checkAct({ defect: 'nuqsonsiz', defectTxt: 'chizilgan joy bor', items: null });
  check('10) nuqsonsiz + e\'tiroz matni -> topiladi', textButNoDefect.some((i) => i.code === 'defect_text_but_no_defect'));

  const defectNoText = DC.checkAct({ defect: 'qisman', defectTxt: '', items: null });
  check('11) qisman + bo\'sh matn -> topiladi', defectNoText.some((i) => i.code === 'defect_selected_no_text'));

  const notSelected = DC.checkAct({ defect: '', defectTxt: '', items: null });
  check('12) holat tanlanmagan -> topiladi', notSelected.some((i) => i.code === 'defect_not_selected'));

  const noItemsDone = DC.checkAct({ defect: 'nuqsonsiz', defectTxt: '', items: [{ done: false }, { done: false }] });
  check('13) hech bir xizmat belgilanmagan -> topiladi', noItemsDone.some((i) => i.code === 'no_items_done'));

  const someDone = DC.checkAct({ defect: 'nuqsonsiz', defectTxt: '', items: [{ done: false }, { done: true }] });
  check('14) kamida bitta xizmat belgilangan -> 0 topilma', someDone.length === 0, someDone);
})();

console.log(ok + ' ta o\'tdi, ' + bad + ' ta yiqildi (jami ' + (ok + bad) + ')');
process.exit(bad ? 1 : 0);
