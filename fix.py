import glob, re

pages = glob.glob('*.html')
stems = [f[:-5] for f in pages if f != 'index.html']

# 1) Ichki havolalar: .html -> kengaytmasiz
for f in pages:
    s = open(f, encoding='utf-8').read()
    for st in stems:
        s = s.replace(f'href="{st}.html"', f'href="{st}"')
        s = s.replace(f"href:'{st}.html'", f"href:'{st}'")
    open(f, 'w', encoding='utf-8').write(s)

# 2) sitemap.xml: kengaytmasiz manzillar
urls = ['https://kalki.uz/'] + ['https://kalki.uz/' + st for st in sorted(stems)]
xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for u in urls:
    xml += f'  <url><loc>{u}</loc><changefreq>monthly</changefreq></url>\n'
open('sitemap.xml', 'w', encoding='utf-8').write(xml + '</urlset>\n')

# 3) sw.js v3: redirect-xavfsiz service worker
assets = ['/', '/favicon.svg', '/manifest.json'] + ['/' + st for st in sorted(stems)]
alist = ',\n  '.join(f"'{a}'" for a in assets)
sw = """const CACHE='kalki-v3';
const ASSETS=[
  %s
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(ASSETS.map(u=>c.add(u)))).then(()=>self.skipWaiting()));
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
});""" % alist
open('sw.js', 'w', encoding='utf-8').write(sw)
print('Tayyor: havolalar tuzatildi, sitemap va sw.js yangilandi')
