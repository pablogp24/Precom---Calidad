/* FLECAP · service worker.
   Red primero para todo lo crítico: la aplicación nunca se sirve desde la caché
   mientras hay red, así que no se entrega una versión anterior. La caché sólo
   entra cuando la red no responde. */
const CACHE = 'flecap-matriz-unica-20261001-r6';
const STATIC = [
  './manifest.webmanifest',
  './portal-nuevo.html',
  './online-config.js',
  './proyectos/app/index.html',
  './'
];
const APP_DOC = './proyectos/app/index.html';
const MAX_RUNTIME = 60;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => Promise.all(STATIC.map(u => c.add(u).catch(()=>null)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('message', event => { if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting(); });

/* Acota la caché de recursos servidos en caliente: sin tope crecía sin
   límite y una entrada vieja podía volver a aparecer días después. */
async function trim(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length <= MAX_RUNTIME) return;
    for (const k of keys.slice(0, keys.length - MAX_RUNTIME)) await cache.delete(k);
  } catch (e) {}
}

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isCritical = event.request.mode === 'navigate' || /\/(index\.html|online-config\.js|portal-nuevo\.html)$/.test(url.pathname);
  if(isCritical){
    // Red primero (sin caché) para recibir actualizaciones; sin red, la copia precacheada.
    // El respaldo pedía './index.html' (el portal de la raíz) para una URL de la
    // obra: si esa copia no estaba, respondía vacío y la aplicación quedaba en
    // blanco para siempre. Ahora se encadena la misma solicitud, luego el
    // documento de la app y por último la portada.
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(async()=>{
      const own = await caches.match(event.request,{ignoreSearch:true});
      if (own) return own;
      const app = await caches.match(APP_DOC,{ignoreSearch:true});
      if (app) return app;
      const root = await caches.match('./',{ignoreSearch:true});
      if (root) return root;
      return new Response('FLECAP está sin conexión y esta pantalla no está guardada todavía. Recargá al volver la red.', {
        status: 503, headers: {'Content-Type':'text/plain; charset=utf-8'}
      });
    }));
    return;
  }
  event.respondWith(fetch(event.request).then(r=>{
    if(r && r.ok && url.origin===location.origin){
      const copy=r.clone();
      caches.open(CACHE).then(c=>c.put(event.request,copy).then(()=>trim(c))).catch(()=>null);
    }
    return r;
  }).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(r=>r||new Response('',{status:504,statusText:'offline'}))));
});
