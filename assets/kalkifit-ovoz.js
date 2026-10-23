/* kalki.uz — KalkiFit: ovozli kiritish («bir piyola osh, ikki tilim non va choy» → matn). Matn ilovaning odatiy matn oqimiga beriladi (kkal bazadan).
   Yo'llar (birinchi mosi): 1) APK — native «Ovoz» plagini (SpeechRecognizer);
   2) server — MediaRecorder (iOS: audio/mp4, Android/desktop: audio/webm;opus) → POST /api/ovoz (OpenAI gpt-4o-mini-transcribe) — faqat serverda kalit bo'lsa (o.server() === true);
   3) Web Speech API — FAQAT ishonchli joyda (Android/desktop Chrome, Edge); iOS'da (Safari/PWA, iOS Chrome ham WebKit) kalitsiz tugma KO'RINMAYDI.
   Ovoz saqlanmaydi: server yo'lida audio faqat tanish uchun uzatiladi; Web Speech / native — telefon (yoki brauzer) nutq xizmati.
   create({ lang, server, post }) → { kind(), ok(), start(h), finish(), cancel() }
     h: { onPart(t), onText(t, tok), onErr(kod, n), onRec() }; xato kodlari: ruxsat | jim | tarmoq | yoq | vaqt | limit | xato
     cancel() — DARHOL to'xtatadi (recognition.abort, mikrofon oqimi yopiladi, taymerlar, so'rov bekor) va hech qanday natija/xato qaytarmaydi. */
(function (root) {
  'use strict';
  var BCP = { uz: 'uz-UZ', ru: 'ru-RU' }, WAIT = 10000, MAXREC = 15000;
  function webSR() { return root.SpeechRecognition || root.webkitSpeechRecognition || null; }
  function nat() { var N = root.KalkiNative; try { return N && N.isApp && N.isApp() && N.has && N.has('Ovoz') ? N : null; } catch (e) { return null; } }
  function nav() { return root.navigator || {}; }
  function isIOS(ua, n) { ua = ua || nav().userAgent || ''; n = n || nav(); return /iPad|iPhone|iPod/.test(ua) || (n.platform === 'MacIntel' && n.maxTouchPoints > 1); }
  function webOk(ua) { ua = ua || nav().userAgent || ''; if (isIOS(ua)) return false; return /Chrome\/\d|Edg\/\d|CriOS/.test(ua) && !/Firefox|FxiOS|OPR\//.test(ua); }          // Web Speech ishonchli: Chrome/Edge (Android, desktop)
  function recOk() { var n = nav(); return !!(root.MediaRecorder && n.mediaDevices && n.mediaDevices.getUserMedia); }
  function mimeOf() {
    var M = root.MediaRecorder, list = isIOS() ? ['audio/mp4', 'audio/aac', 'audio/webm;codecs=opus', 'audio/webm'] : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    if (!M || typeof M.isTypeSupported !== 'function') return ''; for (var i = 0; i < list.length; i++) { try { if (M.isTypeSupported(list[i])) return list[i]; } catch (e) {} } return '';
  }
  function code(e) { e = String(e || ''); if (/not-allowed|service-not-allowed|permission|denied|NotAllowed|ruxsat/i.test(e)) return 'ruxsat'; if (/no-speech|no_match|speech_timeout|jim/i.test(e)) return 'jim'; if (/network|tarmoq|Failed to fetch/i.test(e)) return 'tarmoq'; if (/audio-capture|NotFound|language|yoq/i.test(e)) return 'yoq'; if (/vaqt|timeout/i.test(e)) return 'vaqt'; if (/limit/.test(e)) return 'limit'; return 'xato'; }
  function create(o) {
    o = o || {}; var lang = function () { return BCP[(o.lang && o.lang()) === 'ru' ? 'ru' : 'uz']; }, cur = null;
    function kind() { if (nat()) return 'native'; if (o.server && o.server() && recOk() && o.post) return 'server'; if (webSR() && webOk()) return 'web'; return null; }
    function start(h) {
      h = h || {}; if (cur) cur.cancel(); var k = kind(), off = false, tm = null, c = { kind: k };
      var end = function () { off = true; clearTimeout(tm); if (cur === c) cur = null; };
      var text = function (t, tok) { if (off) return; end(); if (h.onText) h.onText(t, tok); }, err = function (x, n) { if (off) return; end(); if (h.onErr) h.onErr(x, n); };
      var arm = function (ms) { clearTimeout(tm); tm = setTimeout(function () { c.cancel(); if (h.onErr) h.onErr('vaqt'); }, ms); };
      cur = c;
      if (k === 'native') {
        var N = nat(), lsn = null; try { var cp = root.Capacitor; if (cp && cp.addListener) lsn = cp.addListener('Ovoz', 'qism', function (e) { if (!off && h.onPart && e && e.text) { h.onPart(String(e.text)); arm(WAIT); } }); } catch (e) {}
        var un = function () { try { if (lsn && lsn.remove) lsn.remove(); } catch (e) {} };
        c.cancel = function () { if (off) return; end(); un(); N.call('Ovoz', 'stop', {}).catch(function () {}); }; c.finish = function () { N.call('Ovoz', 'stop', {}).catch(function () {}); };
        arm(WAIT);
        N.call('Ovoz', 'tingla', { til: lang() }).then(function (r) { un(); var t = r && r.text ? String(r.text).trim() : ''; if (t) text(t); else err('jim'); }, function (e) { un(); err(code(e && (e.code || e.message))); });
        return c;
      }
      if (k === 'server') {
        var stream = null, mr = null, chunks = [], ctl = null, mime = mimeOf(), sent = false;
        var tracks = function () { try { if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} stream = null; };
        c.cancel = function () { if (off) return; end(); try { if (ctl) ctl.abort(); } catch (e) {} try { if (mr && mr.state !== 'inactive') { mr.ondataavailable = null; mr.onstop = null; mr.stop(); } } catch (e) {} tracks(); };
        var send = function () {
          if (off || sent) return; sent = true; tracks(); var blob = new Blob(chunks, { type: (mime || 'audio/webm').split(';')[0] }); chunks = [];
          if (blob.size < 800) { err('jim'); return; }
          ctl = root.AbortController ? new AbortController() : null; arm(WAIT);
          o.post(blob, blob.type, lang().slice(0, 2), ctl && ctl.signal).then(function (r) { if (r && r.text) text(String(r.text).trim(), r.tok); else if (r && r.err) err(r.err, r.n); else err('jim'); }, function (e) { if (e && e.name === 'AbortError') return; err(code(e && (e.code || e.message))); });
        };
        c.finish = function () { if (off || !mr) return; clearTimeout(tm); try { if (mr.state !== 'inactive') mr.stop(); else send(); } catch (e) { send(); } };
        nav().mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(function (s) {
          if (off) { s.getTracks().forEach(function (t) { t.stop(); }); return; } stream = s;
          try { mr = mime ? new root.MediaRecorder(s, { mimeType: mime }) : new root.MediaRecorder(s); } catch (e) { tracks(); err('yoq'); return; }
          if (!mime) mime = mr.mimeType || ''; mr.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); }; mr.onstop = send;
          mr.start(); clearTimeout(tm); tm = setTimeout(function () { c.finish(); }, MAXREC); if (h.onRec) h.onRec();          // ko'pi bilan 15 soniya — keyin o'zi yuboriladi
        }, function (e) { err(code(e && (e.name || e.message))); });
        return c;
      }
      var SR = webSR(); if (!SR || !k) { err('yoq'); return c; }
      var r = new SR(), best = ''; r.lang = lang(); r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
      c.cancel = function () { if (off) return; end(); r.onresult = r.onerror = r.onend = null; try { r.abort(); } catch (e) { try { r.stop(); } catch (e2) {} } };
      c.finish = function () { try { r.stop(); } catch (e) {} };
      r.onresult = function (ev) { var part = '', fl = ''; for (var i = 0; i < ev.results.length; i++) { var x = ev.results[i][0] ? ev.results[i][0].transcript : ''; if (ev.results[i].isFinal) fl += ' ' + x; else part += ' ' + x; } best = fl.replace(/\s+/g, ' ').trim(); if (!off) arm(WAIT); if (h.onPart && !off) h.onPart((fl + part).replace(/\s+/g, ' ').trim()); };
      r.onerror = function (ev) { var c0 = code(ev && ev.error); if (c0 === 'jim' && best) return; err(c0); };
      r.onend = function () { if (best) text(best); else err('jim'); };
      arm(WAIT);
      try { r.start(); } catch (e) { err('xato'); }
      return c;
    }
    return { kind: kind, ok: function () { return !!kind(); }, start: start, finish: function () { if (cur && cur.finish) cur.finish(); }, cancel: function () { if (cur && cur.cancel) cur.cancel(); }, busy: function () { return !!cur; } };
  }
  var api = { create: create, code: code, BCP: BCP, webOk: webOk, isIOS: isIOS, WAIT: WAIT, MAXREC: MAXREC };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.KalkiOvoz = api;
})(typeof window !== 'undefined' ? window : this);
