const CACHE = 'ayfa-pedidos-v1';
const SHELL = ['./index.html', './config.js', './manifest.json', './icon-192.png', './icon-512.png', './logo-header.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Nunca cachear llamadas a la API (siempre datos frescos)
  if (e.request.url.indexOf('script.google.com') !== -1) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
