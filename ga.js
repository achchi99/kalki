// Google Analytics 4 — ID'ni pastdagi qatorga yozing va push qiling.
// GA hisobini oching: analytics.google.com -> Admin -> Create Property -> Web -> kalki.uz
// "Measurement ID" (G- bilan boshlanadi) ni oling va shu yerga qo'ying:
var GA_ID = 'G-XXXXXXXXXX';

if (GA_ID.indexOf('XXXX') === -1) {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_ID);
}
