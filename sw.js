const CACHE_NAME = 'shipmate-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/fleet.html',
  '/contact.html',
  '/css/style.css',
  '/js/main.js',
  '/content.json',
  '/assets/images/logos/mainlogo.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
