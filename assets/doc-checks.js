/* kalki.uz — hujjatlar zanjiri: qoidaga asoslangan (AI'siz) ziddiyat
 * tekshiruvi. Sof funksiyalar — DOM'ga tegmaydi, node'da ham, brauzerda
 * ham bir xil ishlaydi. tools/test-doc-checks.js'da sinaladi va
 * assets/doc-checks.js sifatida sahifalarga ham ulanadi (bir xil fayl,
 * ikki joyda ishlatiladi — build qadam yo'q).
 *
 * Har bir tekshiruv funksiyasi topilmalar massivini qaytaradi:
 *   {field: '<forma maydon id>', code: '<qisqa kod>', msg: {uz, ru}}
 * Bo'sh massiv — muammo yo'q. Eksportni HECH QACHON bloklamaydi —
 * faqat ogohlantiradi (spetsifikatsiya talabi).
 */
(function (root) {
  'use strict';
  var DC = {};

  /* ---------- 1. Xizmat ko'rsatish shartnomasi ---------- */
  // c: {payMode, stageSum, stageCount, grand, prepay, startDate, endDate}
  DC.checkContract = function (c) {
    var issues = [];
    if (c.payMode === 'stages' && c.stageCount > 0 && c.grand > 0 && Math.abs(c.stageSum - c.grand) > 0.5) {
      issues.push({
        field: 'stages', code: 'stage_sum_mismatch',
        msg: { uz: "Bosqichlar yig'indisi jami summaga to'g'ri kelmaydi.", ru: 'Сумма этапов не совпадает с общей суммой.' }
      });
    }
    if (c.payMode === 'prepay' && c.grand > 0 && c.prepay > c.grand) {
      issues.push({
        field: 'prepayPct', code: 'prepay_exceeds_total',
        msg: { uz: "Oldindan to'lov jami summadan katta bo'lishi mumkin emas.", ru: 'Аванс не может превышать общую сумму.' }
      });
    }
    if (c.startDate && c.endDate && String(c.endDate) < String(c.startDate)) {
      issues.push({
        field: 'endDate', code: 'end_before_start',
        msg: { uz: 'Tugash sanasi boshlanish sanasidan oldin bo\'lishi mumkin emas.', ru: 'Дата окончания не может быть раньше даты начала.' }
      });
    }
    return issues;
  };

  /* ---------- 2. To'lov hisobi ---------- */
  // inv: {total, vatMode}, ref: {grand, vatMode} | null (shartnomadan olingan ma'lumot)
  DC.checkInvoice = function (inv, ref) {
    var issues = [];
    if (ref && ref.grand > 0 && Math.abs((inv.total || 0) - ref.grand) > 0.5) {
      issues.push({
        field: 'total', code: 'total_mismatch_contract',
        msg: { uz: "Hisob summasi shartnomadagi summaga mos kelmaydi.", ru: 'Сумма счёта не совпадает с суммой в договоре.' }
      });
    }
    if (ref && ref.vatMode && inv.vatMode && ref.vatMode !== inv.vatMode) {
      issues.push({
        field: 'vat', code: 'vat_mode_mismatch',
        msg: { uz: "QQS rejimi shartnomadagidan farq qiladi.", ru: 'Режим НДС отличается от указанного в договоре.' }
      });
    }
    return issues;
  };

  /* ---------- 3. Topshirish-qabul dalolatnomasi ---------- */
  // a: {defect, defectTxt, items: [{done}] | null}
  DC.checkAct = function (a) {
    var issues = [];
    var hasTxt = !!String(a.defectTxt || '').trim();
    if (a.defect === 'nuqsonsiz' && hasTxt) {
      issues.push({
        field: 'defectTxt', code: 'defect_text_but_no_defect',
        msg: { uz: "«Nuqsonsiz qabul qilindi» tanlangan, lekin e'tirozlar maydoni to'ldirilgan.", ru: 'Выбрано «Принято без недостатков», но поле возражений заполнено.' }
      });
    }
    if ((a.defect === 'qisman' || a.defect === 'etiroz') && !hasTxt) {
      issues.push({
        field: 'defectTxt', code: 'defect_selected_no_text',
        msg: { uz: "Holat tanlangan, lekin e'tirozlar maydoni bo'sh.", ru: 'Ситуация выбрана, но поле возражений пустое.' }
      });
    }
    if (!a.defect) {
      issues.push({
        field: 'defect', code: 'defect_not_selected',
        msg: { uz: "Qabul holati tanlanmagan.", ru: 'Результат осмотра не выбран.' }
      });
    }
    if (Array.isArray(a.items) && a.items.length && !a.items.some(function (it) { return it && it.done; })) {
      issues.push({
        field: 'items', code: 'no_items_done',
        msg: { uz: "Hech bir xizmat bajarildi deb belgilanmagan.", ru: 'Ни одна услуга не отмечена как выполненная.' }
      });
    }
    return issues;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = DC;
  if (typeof window !== 'undefined') window.KalkiDocChecks = DC;
})(typeof window !== 'undefined' ? window : this);
