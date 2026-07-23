const CACHE_NAME = 'najupoultry-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Naju Poultry: Service Worker - Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Naju Poultry: Service Worker - Failed to cache resources:', err))
  );
});

// Fetch and cache strategies
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          if (event.request.url.startsWith(self.location.origin) || 
              event.request.url.includes('cdn.tailwindcss.com') ||
              event.request.url.includes('cdnjs.cloudflare.com') ||
              event.request.url.includes('gstatic.com')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.error('Naju Poultry: Service Worker - Failed to cache response:', err));
          }

          return response;
        }).catch(() => {
          // Return cached version if network fails
          return caches.match(event.request);
        });
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Naju Poultry: Service Worker - Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline orders
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(
      console.log('Naju Poultry: Service Worker - Background sync for orders')
    );
  }
});

// Push notifications for order updates
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Naju Poultry',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiM4QjQ1MTMiLz4KPGNpcmNsZSBjeD0iOTYiIGN5PSI5NiIgcj0iMzIiIGZpbGw9IiNGNEE0NjAiLz4KPHBhdGggZD0iTTk2IDY0TDk2IDk2TDExMiA5NkwxMjggNjRBMzIgMzIgMCAwIDEgOTYgNjRaIiBmaWxsPSIjOEI0NTEzIi8+Cjwvc3ZnPgo=',
    badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM4QjQ1MTMiLz4KPC9zdmc+Cg==',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Products',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=='
      },
      {
        action: 'contact',
        title: 'Contact Us',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM4QjQ1MTMiLz4KPC9zdmc+Cg=='
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Naju Poultry', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/products.html')
    );
  } else if (event.action === 'contact') {
    event.waitUntil(
      clients.openWindow('/contact.html')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for product updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'product-updates') {
    event.waitUntil(
      console.log('Naju Poultry: Service Worker - Periodic sync for product updates')
    );
  }
});
