// Service Worker for AlexLivraison Pro Courier App
const CACHE_NAME = 'alex-pro-v2';
const urlsToCache = [
    '/',
    '/dashboard-coursiers.html',
    '/index.html',
    '/logo-pro.jpg'
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache).catch(e => console.log('Cache error:', e));
        })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone and cache new responses
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Push notification event
self.addEventListener('push', event => {
    console.log('Push received:', event);
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || 'Nouvelle Course!';
    const options = {
        body: data.body || 'Une nouvelle livraison est disponible',
        icon: 'logo-pro.jpg',
        badge: 'logo-pro.jpg',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'new-order',
        renotify: true,
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'Voir' },
            { action: 'close', title: 'Fermer' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event.action);
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clientList => {
                    // Focus existing window or open new
                    for (const client of clientList) {
                        if (client.url.includes('dashboard-coursiers') && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    return clients.openWindow('/dashboard-coursiers.html');
                })
        );
    }
});

// Background sync for offline orders
self.addEventListener('sync', event => {
    if (event.tag === 'sync-orders') {
        console.log('Background sync triggered');
    }
});