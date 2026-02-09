// CBAM Guard Service Worker for PWA
// CACHE_VERSION - her değişiklikte güncelle!
const CACHE_VERSION = 'v2-' + Date.now();
const CACHE_NAME = 'cbam-guard-' + CACHE_VERSION;

// Sadece statik dosyaları cache'le - CSS/JS DEĞİL!
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
];

// Geliştirme modunda cache'leme
const IS_DEV = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing new version:', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching minimal assets');
            return Promise.allSettled(
                ASSETS_TO_CACHE.map(url =>
                    cache.add(url).catch(err => console.log(`Failed to cache ${url}:`, err))
                )
            );
        })
    );
    // Immediately activate new SW
    self.skipWaiting();
});

// Activate event - clean ALL old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new version, cleaning old caches');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('cbam-guard-') && name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - NETWORK-FIRST for development!
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests
    if (event.request.url.includes('/api/')) return;
    if (event.request.url.includes(':8000')) return;

    // Skip chrome-extension and other non-http schemes
    if (!event.request.url.startsWith('http')) return;

    // DEVELOPMENT: Always use network-first for CSS/JS
    if (IS_DEV || event.request.url.match(/\.(js|css|jsx|tsx)(\?.*)?$/)) {
        event.respondWith(
            fetch(event.request)
                .then(response => response)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Production: Cache-first for other assets
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            return fetch(event.request).then((networkResponse) => {
                // Only cache images and fonts
                const shouldCache = event.request.url.match(/\.(png|jpg|jpeg|gif|ico|woff|woff2|ttf)$/);

                if (shouldCache && networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {
        title: 'CBAM Guard',
        body: 'Yeni bir bildiriminiz var',
        icon: '/icon-192.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            data: data.url || '/'
        })
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.openWindow(event.notification.data || '/')
    );
});
