/* kalki.uz — hujjatlar zanjiri: bir martalik ma'lumot uzatish.
 *
 * URL orqali EMAS (0-bo'lim 4-band, loyiha qoidasi): shaxsiy ma'lumot
 * hech qachon havolaga tushmaydi. localStorage'dagi bitta kalitda,
 * qisqa amal muddati bilan (30 daqiqa) saqlanadi — bitta sahifadan
 * ikkinchisiga o'tishda brauzer tab'lari orasida ishlaydi, lekin
 * havolada yoki serverda hech narsa qoldirmaydi.
 *
 * Ishlatilishi:
 *   KalkiHandoff.save('xizmat', {...})     — jo'natuvchi sahifa
 *   var d = KalkiHandoff.read('xizmat')    — qabul qiluvchi sahifa,
 *                                              o'qigach kalitni o'chiradi
 *   KalkiHandoff.clear()                   — banner'dagi "Tozalash"
 */
(function (root) {
  'use strict';
  var KEY = 'kalki_handoff';
  var TTL_MS = 30 * 60 * 1000; // 30 daqiqa

  var H = {};

  H.save = function (fromType, data) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ from: fromType, data: data, exp: Date.now() + TTL_MS }));
      return true;
    } catch (e) { return false; }
  };

  // expectedFrom berilsa, faqat o'sha turdan kelgan ma'lumot qaytariladi
  // (masalan hisob sahifasi faqat 'xizmat'dan kelgan paketni kutadi).
  H.read = function (expectedFrom) {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.data || !obj.exp) { localStorage.removeItem(KEY); return null; }
      if (Date.now() > obj.exp) { localStorage.removeItem(KEY); return null; } // muddati o'tgan
      if (expectedFrom && obj.from !== expectedFrom) return null; // boshqa zanjirdan — teginmaymiz
      localStorage.removeItem(KEY); // bir martalik — o'qilgach o'chadi
      return obj.data;
    } catch (e) { return null; }
  };

  H.clear = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
  };

  /* ---------- format tanlovi, huquqiy emas (docs/hujjat-paketlari-reja.md) ----------
   * Ikkita sof funksiya — xizmat-korsatish-shartnomasi'dagi tuzilgan
   * "Type/Org/Fio" va "Addr/Phone" maydonlarini boshqa hujjatning bitta
   * erkin matn maydoniga (masalan tolov-hisobi'dagi sellerName/sellerAddr)
   * moslashda ishlatiladi. Bu YURIDIK yoki FAKTIK qaror emas — faqat
   * qaysi matnni qanday formatda ko'rsatish haqidagi taqdimot tanlovi:
   * qaysi shaxs turi ekanligi (yuridik/jismoniy) foydalanuvchining o'zi
   * xizmat-shartnomada tanlagan, bu yerda faqat SHU tanlovga mos nomi
   * o'qiladi, hech narsa taxmin qilinmaydi. Tur aniqlanmagan (yoki
   * noma'lum qiymat) bo'lsa — bo'sh qaytariladi, standart Org olinmaydi.
   */
  H.partyName = function (type, org, fio) {
    if (type === 'yuridik') return org || '';
    if (type === 'jismoniy') return fio || '';
    return '';
  };

  H.combineAddrPhone = function (addr, phone) {
    addr = (addr || '').trim();
    phone = (phone || '').trim();
    if (addr && phone) return addr + ', tel: ' + phone;
    return addr || phone || '';
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = H;
  if (typeof window !== 'undefined') window.KalkiHandoff = H;
})(typeof window !== 'undefined' ? window : this);
