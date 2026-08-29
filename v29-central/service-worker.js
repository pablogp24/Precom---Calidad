const CACHE='flecap-v29-offline-multiuser-v2-admin-fix';
const CORE=['./','./index.html','./manifest.webmanifest','./online-config.js'];

self.addEventListener('install',event=>
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache=>{
        for(const url of CORE){
          try{await cache.add(url)}catch(e){}
        }
      })
      .then(()=>self.skipWaiting())
  )
);

self.addEventListener('activate',event=>
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  )
);

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html').then(r=>r||caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network=fetch(event.request)
        .then(response=>{
          if(response&&response.status<400){
            const copy=response.clone();
            caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          }
          return response;
        })
        .catch(()=>cached);

      return cached||network;
    })
  );
});
