// Subimos la versión para que el teléfono sepa que tiene que volver a
// guardar todo de cero (si solo cambiás el HTML/JS pero dejás el mismo
// nombre de versión acá, algunos celus se quedan con la copia vieja).
const CACHE = 'ayfa-pedidos-v2';
const SHELL = ['./', './index.html', './config.js', './manifest.json', './icon-192.png', './icon-512.png', './logo-header.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (c) => {
      // IMPORTANTE: guardamos archivo por archivo (no con addAll), porque
      // addAll es "todo o nada" — si UNO solo falla (ej. un nombre de
      // archivo que no existe), no se guarda NINGUNO, y la app queda sin
      // poder abrir offline aunque el resto esté bien. Así, si falta algo,
      // se guarda igual todo lo demás.
      await Promise.all(SHELL.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res.ok) await c.put(url, res);
        } catch (err) { /* ese archivo puntual no se pudo guardar, seguimos con el resto */ }
      }));
    })
  );
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

  // Si es una navegación (abrir la app / escribir la URL / tocar el ícono),
  // mostramos el index.html guardado apenas falle la red, sin importar si
  // la URL exacta tenía o no el "/index.html" al final. Esto es lo que
  // permite que la app ABRA sin conexión, no solo que guarde pedidos.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('./index.html').then((cached) => cached || caches.match('./'))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
