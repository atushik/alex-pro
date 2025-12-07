const CACHE_NAME = 'alex-pro-v1';
const urlsToCache = [
  './',
  './index.html',
  './dashboard-coursiers.html',
  './devenir-coursiers.html',
  './manifest-pro.json',
  './logo-pro.jpg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
}); 
