/* kalki.uz — KalkiFit: ovozli kiritish («bir piyola osh, ikki tilim non va choy» → matn). Ovoz QURILMADA (brauzer/telefonning nutq xizmati) matnga aylanadi;
   KalkiFit ovozni olmaydi va saqlamaydi — faqat tayyor matn ilovaning odatiy matn oqimiga (bazadan kkal, topilmagani — AI «taxminiy») beriladi.
   Veb: Web Speech API (SpeechRecognition); Android ilovasi (1.0.4+): native «Ovoz» plagini (SpeechRecognizer, RECORD_AUDIO). Yo'q bo'lsa — tugma ko'rinmaydi.
   create({ lang: () => 'uz'|'ru' }) → { kind, ok(), start({ onPart, onText, onErr, onEnd }), stop() }   xato kodlari: 'ruxsat' | 'jim' | 'tarmoq' | 'yoq' | 'xato' */
(function (root) {
  'use strict';
  var BCP = { uz: 'uz-UZ', ru: 'ru-RU' };
  function webSR() { return root.SpeechRecognition || root.webkitSpeechRecognition || null; }
  function nat() { var N = root.KalkiNative; try { return N && N.isApp && N.isApp() && N.has && N.has('Ovoz') ? N : null; } catch (e) { return null; } }
  function code(e) { e = String(e || ''); if (/not-allowed|service-not-allowed|permission|denied|ruxsat/i.test(e)) return 'ruxsat'; if (/no-speech|no_match|speech_timeout|aborted|jim/i.test(e)) return 'jim'; if (/network|tarmoq/i.test(e)) return 'tarmoq'; if (/audio-capture|language|yoq/i.test(e)) return 'yoq'; return 'xato'; }          // native plagin o'zi 'ruxsat' | 'jim' | 'tarmoq' | 'yoq' qaytaradi
  function create(o) {
    o = o || {}; var lang = function () { return BCP[(o.lang && o.lang()) === 'ru' ? 'ru' : 'uz']; }, cur = null;
    var kind = nat() ? 'native' : (webSR() ? 'web' : null);
    function start(h) {
      h = h || {}; var done = false, fin = function () { if (done) return; done = true; cur = null; if (h.onEnd) h.onEnd(); };
      if (kind === 'native') {
        var N = nat(), lsn = null; try { var c = root.Capacitor; if (c && c.addListener) lsn = c.addListener('Ovoz', 'qism', function (e) { if (h.onPart && e && e.text) h.onPart(String(e.text)); }); } catch (e) {}
        cur = { stop: function () { N.call('Ovoz', 'stop', {}).catch(function () {}); } };
        N.call('Ovoz', 'tingla', { til: lang() }).then(function (r) { var t = r && r.text ? String(r.text).trim() : ''; if (t) { if (h.onText) h.onText(t); } else if (h.onErr) h.onErr('jim'); }, function (e) { if (h.onErr) h.onErr(code(e && (e.code || e.message))); })
          .then(function () { try { if (lsn && lsn.remove) lsn.remove(); } catch (e) {} fin(); });
        return true;
      }
      var SR = webSR(); if (!SR) { if (h.onErr) h.onErr('yoq'); fin(); return false; }
      var r = new SR(), best = ''; r.lang = lang(); r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
      r.onresult = function (ev) { var part = '', fl = ''; for (var i = 0; i < ev.results.length; i++) { var x = ev.results[i][0] ? ev.results[i][0].transcript : ''; if (ev.results[i].isFinal) fl += ' ' + x; else part += ' ' + x; } best = fl.replace(/\s+/g, ' ').trim(); if (h.onPart) h.onPart((fl + part).replace(/\s+/g, ' ').trim()); };          // ev.results — shu seansdagi BARCHA natijalar
      r.onerror = function (ev) { var c0 = code(ev && ev.error); if (c0 === 'jim' && best) return; if (h.onErr) h.onErr(c0); best = ''; };
      r.onend = function () { if (best && h.onText) h.onText(best); fin(); };
      cur = { stop: function () { try { r.stop(); } catch (e) {} } };
      try { r.start(); } catch (e) { if (h.onErr) h.onErr('xato'); fin(); return false; }
      return true;
    }
    return { kind: kind, ok: function () { return !!kind; }, start: start, stop: function () { if (cur) cur.stop(); } };
  }
  var api = { create: create, code: code, BCP: BCP };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiOvoz = api;
})(typeof window !== 'undefined' ? window : this);
