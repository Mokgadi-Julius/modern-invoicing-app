// Service Worker for cache busting and offline support
const CACHE_VERSION = 'v2.1.0';
const CACHE_NAME = `invoice-app-${CACHE_VERSION}`;

// Install event - cache essential files
self.addEventListener('install', event => {
  // Skip waiting to activate new service worker immediately
  self.skipWaiting();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Don't cache requests to external domains or dynamic content
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Don't cache Firebase or API requests
  if (url.pathname.startsWith('/__/') || 
      url.pathname.includes('firebase') ||
      url.pathname.includes('api')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then(fetchResponse => {
          // Cache the response for future use
          return caches.open(CACHE_NAME).then(cache => {
            // Only cache successful responses
            if (fetchResponse.status === 200) {
              cache.put(event.request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // Return a fallback for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim clients to activate immediately
  return self.clients.claim();
});

// Message event - handle cache invalidation requests
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
});