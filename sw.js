const CACHE='kalki-v15';
const ASSETS=[
  '/',
  '/favicon.svg',
  '/manifest.json',
  '/ga.js',
  '/alkogol-kalkulyator',
  '/beton-kalkulyator',
  '/bojxona-kalkulyator',
  '/bola-puli-kalkulyator',
  '/chorva-kalkulyator',
  '/dtm-kalkulyator',
  '/gisht-kalkulyator',
  '/homiladorlik-kalkulyator',
  '/ipoteka-kalkulyator',
  '/kaloriya-kalkulyator',
  '/konditsioner-kalkulyator',
  '/kredit-kalkulyator',
  '/maxfiylik',
  '/oila-byudjet-kalkulyator',
  '/omonat-kalkulyator',
  '/oylik-soliq-kalkulyator',
  '/pensiya-kalkulyator',
  '/qqs-kalkulyator',
  '/remont-kalkulyator',
  '/shablonlar',
  '/shartlar',
  '/tom-kalkulyator',
  '/toy-kalkulyator',
  '/yer-konvertor',
  '/yoqilgi-kalkulyator',
  '/zakot-qurbonlik-kalkulyator'
];
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(u=>c.add(u)))).then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
function cacheable(r){return r && r.ok && !r.redirected}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).then(r=>{
        if(cacheable(r)){const cl=r.clone();caches.open(CACHE).then(c=>c.put(url.pathname,cl))}
        return r;
      }).catch(()=>caches.match(url.pathname).then(m=>m||caches.match('/')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const net=fetch(e.request).then(r=>{
        if(cacheable(r)){const cl=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cl))}
        return r;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});