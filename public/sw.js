const CACHE_NAME = 'nurhealth-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Network-first strategy for API requests (/api/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the response is good, clone it and put it in cache
          if (response.status === 200) {
             const responseClone = response.clone();
             caches.open(CACHE_NAME).then(cache => {
               cache.put(event.request, responseClone);
             });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Network-First strategy for Navigation requests (e.g. /dashboard)
  // This guarantees that reloads on dynamic client-side routes fetch the latest compiled asset hashes from the server,
  // preventing blank pages when old js files get cleaned up and deleted off the server.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Fallback to cached index.html shell if user is completely offline
          return caches.match('/') || caches.match('/index.html');
        })
    );
    return;
  }

  // 3. Cache-first strategy for Static Assets (bundles, assets, images, styles)
  // Excellent performance, safe since asset filenames have unique compilation hashes.
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        // Cache successful GET requests dynamically
        if (fetchRes.status === 200) {
           const responseClone = fetchRes.clone();
           caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return fetchRes;
      });
    }).catch(() => {
      // General static asset fallback
      return caches.match('/index.html');
    })
  );
});
