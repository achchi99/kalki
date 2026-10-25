/* kalki.uz — anonim statistika uchun qurilma TURI (User-Agent + ilova versiyasi + ekran kengligi). Faqat umumiy turlar:
 *   tur: android-ilova | android-brauzer | iphone-safari | iphone-pwa | iphone-boshqa | ipad | kompyuter | boshqa
 *   os ("Android 14", "iOS 18.1", "Windows", "macOS", "Linux", "ChromeOS"), br ("Chrome 130", "Safari 18", "Samsung Internet 26", "Telegram", "Ilova (WebView)" …),
 *   model — UA bergan bo'lsa (Android: "SM-A546B" → "Samsung Galaxy A54"; Chrome «K» — yashirilgan → bo'sh), ekran — kenglik guruhi, ver — APK versiyasi.
 *   IP, aniq model raqami bo'lmagan qurilma izi, joylashuv — YO'Q. */
const S = (v, n) => String(v || '').replace(/[^\w .,+()\-]/g, '').trim().slice(0, n || 32);
const SAMSUNG = { A05: 'A05', A05S: 'A05s', A06: 'A06', A12: 'A12', A13: 'A13', A14: 'A14', A15: 'A15', A16: 'A16', A22: 'A22', A23: 'A23', A24: 'A24', A25: 'A25', A26: 'A26', A32: 'A32', A33: 'A33', A34: 'A34', A35: 'A35', A36: 'A36', A51: 'A51', A52: 'A52', A53: 'A53', A54: 'A54', A55: 'A55', A56: 'A56', A72: 'A72', A73: 'A73', M14: 'M14', M34: 'M34', M54: 'M54', S21: 'S21', S22: 'S22', S23: 'S23', S24: 'S24', S25: 'S25' };
const SMCODE = { 'A055': 'A05', 'A057': 'A05s', 'A065': 'A06', 'A125': 'A12', 'A135': 'A13', 'A137': 'A13', 'A145': 'A14', 'A146': 'A14 5G', 'A155': 'A15', 'A156': 'A15 5G', 'A165': 'A16', 'A166': 'A16 5G', 'A225': 'A22', 'A235': 'A23', 'A245': 'A24', 'A255': 'A25', 'A256': 'A25', 'A265': 'A26', 'A325': 'A32', 'A336': 'A33', 'A346': 'A34', 'A356': 'A35', 'A366': 'A36', 'A515': 'A51', 'A525': 'A52', 'A528': 'A52s', 'A536': 'A53', 'A546': 'A54', 'A556': 'A55', 'A566': 'A56', 'A725': 'A72', 'A736': 'A73', 'M146': 'M14', 'M346': 'M34', 'M546': 'M54', 'G991': 'S21', 'G996': 'S21+', 'G998': 'S21 Ultra', 'G990': 'S21 FE', 'S901': 'S22', 'S906': 'S22+', 'S908': 'S22 Ultra', 'S911': 'S23', 'S916': 'S23+', 'S918': 'S23 Ultra', 'S711': 'S23 FE', 'S921': 'S24', 'S926': 'S24+', 'S928': 'S24 Ultra', 'S721': 'S24 FE', 'S931': 'S25', 'S936': 'S25+', 'S938': 'S25 Ultra', 'F731': 'Z Flip5', 'F946': 'Z Fold5', 'F741': 'Z Flip6', 'F956': 'Z Fold6' };
export function modelOf(ua) {
  const m = /Android [\d.]+;\s*(?:[a-z]{2}[-_][a-z]{2};\s*)?([^;)]+)/i.exec(ua); if (!m) return '';
  let c = m[1].replace(/\s+Build\/.*$/i, '').replace(/^SAMSUNG\s+/i, '').trim(); if (!c || /^K$|^wv$|^Linux$|^Mobile$|^U$/i.test(c)) return '';      // Chrome UA qisqartirish («K») — model yo'q
  const sm = /^SM-([A-Z]\d{3})/i.exec(c); if (sm && SMCODE[sm[1].toUpperCase()]) return 'Samsung Galaxy ' + SMCODE[sm[1].toUpperCase()];
  if (/^SM-/i.test(c)) return 'Samsung ' + S(c, 12);
  const gal = /^Galaxy\s+([A-Z]\d{2}s?)/i.exec(c); if (gal && SAMSUNG[gal[1].toUpperCase()]) return 'Samsung Galaxy ' + SAMSUNG[gal[1].toUpperCase()];
  if (/^(Redmi|POCO|Mi |Xiaomi|Infinix|TECNO|realme|OPPO|vivo|HONOR|Pixel|Nokia|moto|Motorola|OnePlus|HUAWEI|itel|ZTE)/i.test(c)) return S(c, 28);
  return /^[A-Za-z0-9 _-]{3,24}$/.test(c) ? S(c, 24) : '';
}
const ver = (re, ua, n) => { const m = re.exec(ua); return m ? m[1].split(/[._]/).slice(0, n || 1).join('.') : ''; };
export function turOf(ua, platforma, apkVer) {
  ua = String(ua || ''); const ios = /iPhone|iPod/.test(ua), ipad = /iPad/.test(ua) || (/Macintosh/.test(ua) && /Mobile\//.test(ua)), andr = /Android/.test(ua);
  let tur, os = '', br = '', model = '';
  if (platforma === 'android') { tur = 'android-ilova'; os = andr ? 'Android ' + ver(/Android (\d+(?:\.\d+)?)/, ua, 1) : 'Android'; br = 'Ilova (WebView)'; model = modelOf(ua); }
  else if (ios || ipad) {
    os = (ipad ? 'iPadOS ' : 'iOS ') + ver(/OS (\d+[_.]\d+)/, ua, 2).replace('_', '.');
    const inapp = /Telegram/i.test(ua) ? 'Telegram' : /Instagram/.test(ua) ? 'Instagram' : /FBAN|FBAV/.test(ua) ? 'Facebook' : '';
    br = inapp || (/CriOS\/(\d+)/.test(ua) ? 'Chrome ' + ver(/CriOS\/(\d+)/, ua) : /FxiOS\/(\d+)/.test(ua) ? 'Firefox ' + ver(/FxiOS\/(\d+)/, ua) : /EdgiOS\//.test(ua) ? 'Edge' : /YaBrowser\/(\d+)/.test(ua) ? 'Yandex ' + ver(/YaBrowser\/(\d+)/, ua) : 'Safari ' + ver(/Version\/(\d+)/, ua));
    tur = ipad ? 'ipad' : platforma === 'ios-pwa' ? 'iphone-pwa' : /^Safari/.test(br) ? 'iphone-safari' : 'iphone-boshqa';
    if (platforma === 'ios-pwa') br = 'PWA (Safari)';
  } else if (andr) {
    tur = 'android-brauzer'; os = 'Android ' + ver(/Android (\d+(?:\.\d+)?)/, ua, 1); model = modelOf(ua);
    br = /Telegram/i.test(ua) ? 'Telegram' : /Instagram/.test(ua) ? 'Instagram' : /SamsungBrowser\/(\d+)/.test(ua) ? 'Samsung Internet ' + ver(/SamsungBrowser\/(\d+)/, ua) : /YaBrowser\/(\d+)/.test(ua) ? 'Yandex ' + ver(/YaBrowser\/(\d+)/, ua) : /OPR\/(\d+)/.test(ua) ? 'Opera ' + ver(/OPR\/(\d+)/, ua) : /Firefox\/(\d+)/.test(ua) ? 'Firefox ' + ver(/Firefox\/(\d+)/, ua) : /EdgA\/(\d+)/.test(ua) ? 'Edge ' + ver(/EdgA\/(\d+)/, ua) : /; wv\)/.test(ua) ? 'WebView' : /Chrome\/(\d+)/.test(ua) ? 'Chrome ' + ver(/Chrome\/(\d+)/, ua) : '';
  } else if (/Windows|Macintosh|Mac OS X|CrOS|Linux|X11/.test(ua)) {
    tur = 'kompyuter'; os = /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'ChromeOS' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : 'Linux';
    br = /Edg\/(\d+)/.test(ua) ? 'Edge ' + ver(/Edg\/(\d+)/, ua) : /OPR\/(\d+)/.test(ua) ? 'Opera ' + ver(/OPR\/(\d+)/, ua) : /YaBrowser\/(\d+)/.test(ua) ? 'Yandex ' + ver(/YaBrowser\/(\d+)/, ua) : /Firefox\/(\d+)/.test(ua) ? 'Firefox ' + ver(/Firefox\/(\d+)/, ua) : /Chrome\/(\d+)/.test(ua) ? 'Chrome ' + ver(/Chrome\/(\d+)/, ua) : /Safari\//.test(ua) ? 'Safari ' + ver(/Version\/(\d+)/, ua) : '';
  } else tur = 'boshqa';
  return { tur, os: S(os.trim(), 20), br: S(br.trim(), 24), model: S(model, 32), ver: platforma === 'android' && /^\d{1,2}\.\d{1,2}\.\d{1,3}$/.test(String(apkVer || '')) ? String(apkVer) : '' };
}
export function ekranOf(w) { w = Math.round(Number(w)); if (!(w >= 200 && w <= 8000)) return ''; return w < 360 ? '<360' : w < 390 ? '360–389' : w < 430 ? '390–429' : w < 768 ? '430–767' : w < 1024 ? '768–1023' : w < 1440 ? '1024–1439' : '1440+'; }
