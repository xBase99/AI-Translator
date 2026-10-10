const CACHE_NAME = 'translator-v2.13f';
const STATIC_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => key === CACHE_NAME ? null : caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.url.includes('translate.googleapis.com')) return;
  if (request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(fetch(request).then(response => {
      const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)); return response;
    }).catch(()=>caches.match(request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if(response && response.status===200){ const copy=response.clone(); caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)); }
    return response;
  })));
});
