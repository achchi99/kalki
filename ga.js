// Google Analytics 4 — kalki.uz
// GA hisobini oching: analytics.google.com -> Admin -> Create Property -> Web -> kalki.uz
// "Measurement ID" (G- bilan boshlanadi) ni oling va shu yerga qo'ying:
var GA_ID = 'G-J4CG1EZTEW';

// Idempotentlik guard'i: prerender skriptlarni qayta ishga tushiradi, guard bo'lmasa
// har prerenderda yangi <script> qo'shilib, sahifada 3-6 tadan GA tegi to'planib qolardi.
// Element allaqachon bo'lsa qayta yaratmaymiz.
if (GA_ID.indexOf('XXXX') === -1 && !document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', GA_ID);
}
