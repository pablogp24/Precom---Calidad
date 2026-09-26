const CACHE = 'flecap-portal-flow-20260926-2';
const STATIC = ['./manifest.webmanifest', './portal-nuevo.html', './online-config.js', './'];
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
  const isCritical = event.request.mode === 'navigate' || /\/(index\.html|online-config\.js|portal-nuevo\.html)$/.test(url.pathname);
  if(isCritical){
    // Red primero (sin caché) para recibir actualizaciones; sin red, responde con la copia precacheada.
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(fetch(event.request).then(r=>{
    if(r && r.ok && url.origin===location.origin){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}
    return r;
  }).catch(()=>caches.match(event.request)));
});
