const CACHE_NAME = 'najupoultry-v2.0.1';
const STATIC_CACHE = 'najupoultry-static-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/products.html',
  '/delivery.html',
  '/about.html',
  '/contact.html',
  '/manifest.json',
  '/offline.html',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Naju Poultry: SW - Caching static assets');
        return cache.addAll(urlsToCache).catch(err => {
          console.error('Naju Poultry: SW - Failed to cache some assets:', err);
        });
      })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('Naju Poultry: SW - Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      clients.claim()
    ])
  );
});

// Network-first strategy for HTML pages and API calls
// Cache-first for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // For navigation requests (HTML pages) - network first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // For Supabase API calls - network only, don't cache
  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(request));
    return;
  }

  // For CDN assets - cache first
  if (
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // For same-origin assets - cache first
  if (url.origin === self.location.origin) {
    if (url.pathname.match(/\.(js|css|json|png|jpg|svg|ico)$/)) {
      event.respondWith(cacheFirst(request));
    } else {
      event.respondWith(networkFirstWithFallback(request));
    }
    return;
  }

  // Everything else: network first
  event.respondWith(networkFirstWithFallback(request));
});

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // If it's a navigation request, show offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

// Background sync for offline orders
self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(
      console.log('Naju Poultry: SW - Background sync triggered')
    );
  }
});

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Naju Poultry',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiM4QjQ1MTMiLz4KPGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iMzIiIGZpbGw9IiNGNEE0NjAiLz4KPHBhdGggZD0iTTk2IDY0TDk2IDk2TDExMiA5NkwxMjggNjRBMzIgMzIgMCAwIDEgOTYgNjRaIiBmaWxsPSIjOEI0NTEzIi8+Cjwvc3ZnPgo=',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: 'explore', title: 'View Products' },
      { action: 'contact', title: 'Contact Us' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Naju Poultry', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.action === 'explore' ? '/products.html' :
              event.action === 'contact' ? '/contact.html' : '/';
  event.waitUntil(clients.openWindow(url));
});
