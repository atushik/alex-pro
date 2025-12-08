const CACHE_NAME = 'alex-pro-v-adjust';
const urlsToCache = [
  './',
  './index.html',
  './dashboard-coursiers.html',
  './devenir-coursiers.html',
  './manifest-pro.json?v=ADJUST',
  './logo-pro.jpg?v=ADJUST'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
}); 
