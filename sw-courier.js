// Service Worker for AlexLivraison Pro - v3
const CACHE_VERSION = 'alex-pro-v3-' + Date.now();

// Install - skip waiting immediately
self.addEventListener('install', event => {
    console.log('SW: Installing new version...');
    self.skipWaiting();
});

// Activate - claim all clients and clear old caches
self.addEventListener('activate', event => {
    console.log('SW: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    console.log('SW: Deleting old cache:', cache);
                    return caches.delete(cache);
                })
            );
        }).then(() => {
            console.log('SW: Claiming clients...');
            return self.clients.claim();
        }).then(() => {
            // Force reload all open pages
            return self.clients.matchAll({ type: 'window' }).then(clients => {
                clients.forEach(client => {
                    client.postMessage({ type: 'RELOAD' });
                });
            });
        })
    );
});

// Fetch - ALWAYS network first, no cache for HTML
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Always fetch HTML from network
    if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }
    
    // For other resources, network first
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});

// Push notification
self.addEventListener('push', event => {
    console.log('SW: Push received');
    const data = event.data ? event.data.json() : {};
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Nouvelle Course!', {
            body: data.body || 'Une nouvelle livraison disponible',
            icon: 'logo-pro.jpg',
            badge: 'logo-pro.jpg',
            vibrate: [200, 100, 200, 100, 200],
            tag: 'new-order',
            renotify: true,
            requireInteraction: true
        })
    );
});

// Notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/dashboard-coursiers.html')
    );
});