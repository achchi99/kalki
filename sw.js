const CACHE='kalki-v2';
const ASSETS=[
  './',
  'favicon.svg',
  'manifest.json',
  'alkogol-kalkulyator.html',
  'beton-kalkulyator.html',
  'bojxona-kalkulyator.html',
  'dtm-kalkulyator.html',
  'gisht-kalkulyator.html',
  'homiladorlik-kalkulyator.html',
  'index.html',
  'ipoteka-kalkulyator.html',
  'kaloriya-kalkulyator.html',
  'konditsioner-kalkulyator.html',
  'kredit-kalkulyator.html',
  'omonat-kalkulyator.html',
  'oylik-soliq-kalkulyator.html',
  'pensiya-kalkulyator.html',
  'qqs-kalkulyator.html',
  'shablonlar.html',
  'toy-kalkulyator.html',
  'yer-konvertor.html',
  'yoqilgi-kalkulyator.html',
  'zakot-qurbonlik-kalkulyator.html'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const net=fetch(e.request).then(r=>{
        if(r&&r.ok&&e.request.url.startsWith(self.location.origin)){
          const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));
        }
        return r;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});