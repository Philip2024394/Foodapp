const CACHE_NAME = 'indastreet-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  // NOTE: In a real build process, all generated JS/CSS assets would be added here.
  // For this setup, we cache the essentials.
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});