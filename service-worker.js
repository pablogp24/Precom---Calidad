const CACHE='flecap-stable-core-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./online-config.js','./app-runtime.js','./icons/flecap-192.png','./icons/flecap-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(async cache=>{for(const url of CORE){try{await cache.add(url)}catch(e){}}}).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./'))));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>{
  const network=fetch(event.request).then(response=>{if(response&&response.status<400){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return response}).catch(()=>cached);
  return cached||network;
 }));
});
