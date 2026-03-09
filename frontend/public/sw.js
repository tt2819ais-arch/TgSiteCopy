const CACHE_NAME = 'nyxgram-v1';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.svg',
  '/manifest.json',
];

// Установка
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активация
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API запросы — network only
  if (request.url.includes('/api/') || request.url.includes('/ws')) {
    event.respondWith(fetch(request));
    return;
  }

  // Статика — cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok && request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Офлайн', { status: 503 });
        });
    })
  );
});

// Background sync (подготовка)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    // Синхронизация очереди сообщений
    console.log('[SW] Синхронизация сообщений');
  }
});
