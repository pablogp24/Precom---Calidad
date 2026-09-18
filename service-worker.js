const CACHE = 'flecap-core-20260918-v1';
const STATIC = ['./manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => Promise.all(STATIC.map(u => c.add(u).catch(()=>null)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message', event => { if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isCritical = event.request.mode === 'navigate' || /\/(index\.html|online-config\.js)$/.test(url.pathname);
  if(isCritical){
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(fetch(event.request).then(r=>{
    if(r && r.ok && url.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
    return r;
  }).catch(()=>caches.match(event.request)));
});
