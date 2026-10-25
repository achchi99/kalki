/* kalki.uz — qidiruvda topilmagan so'zni miqdorsiz yig'ish: «рис вареный 100 г» va «рис вареный 90 г» → «рис вареный».
 *   Mijozdagi qoidaning qisqa nusxasi (assets/kalkifit-core.js splitQty): boshidagi son/so'z (+ birlik) va oxiridagi «son + birlik» olib tashlanadi.
 *   Yolg'iz oxirgi son qoladi («sut 1,5» — yog'liligi). Eski mijozlar miqdor bilan yuborgan yozuvlar ham shu bilan birlashadi. */
const NUMW = "bir|bitta|ikki|ikkita|uch|uchta|tort|to'rt|tortta|to'rtta|besh|beshta|yarim|yarimta|yarimtasi|yarmi|polovina|polovinka|половина|половинка|половину|ярим|яримта|бир|битта|икки|иккита|уч|учта|один|одна|два|две|три";
const UNIT = 'g|gr|gram|gramm|gramma|grammov|г|гр|грамм|грамма|граммов|ml|мл|millilitr|миллилитр|ta|dona|та|дона|шт|штук|штуки|sht|kosa|коса|stakan|стакан|qoshiq|ложка|ложки|piyola|пиала|bolak|кусок|куска|porsiya|порция|порции';
const N = '(?:\\d+(?:[.,]\\d+)?|\\d+/\\d+|' + NUMW + ')', U = '(?:' + UNIT + ')\\.?';
const BOSH = new RegExp('^' + N + '(?:\\s+' + U + ')?\\s+', 'i'), OXIR = new RegExp('\\s+\\d+(?:[.,]\\d+)?\\s*' + U + '$', 'i'), FAQAT_U = new RegExp('^' + U + '$', 'i');
export function miqdorsiz(s) {
  const s0 = String(s == null ? '' : s).trim(), t = s0.replace(/(\d)([a-zа-яёўқғҳ])/gi, '$1 $2').replace(BOSH, '').replace(OXIR, '').replace(/\s+/g, ' ').trim();
  return t.length >= 2 && !FAQAT_U.test(t) ? t : s0;
}
/* [{soz, son, kun?}] → miqdorsiz bo'yicha qayta yig'ilgan, son bo'yicha kamayish tartibida */
export function yigMiqdorsiz(rows, lim) {
  const m = new Map();
  for (const r of rows || []) { const k = miqdorsiz(r.soz), o = m.get(k) || { soz: k, son: 0, kun: 0 }; o.son += Number(r.son) || 0; if (r.kun != null) o.kun = Math.max(o.kun, Number(r.kun) || 0); m.set(k, o); }
  const out = [...m.values()].sort((a, b) => b.son - a.son || (a.soz < b.soz ? -1 : 1)); return lim ? out.slice(0, lim) : out;
}
