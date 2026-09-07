const CACHE_NAME = 'vanta-cache-v2';
const ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './jalali.js',
  './manifest.json',
  './vanta-backup.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isDocument = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isDocument) {
    event.respondWith(
      fetch(event.request).then(async (response) => {
        if (!response || response.status !== 200) return response;
        const html = await response.text();
        if (html.includes('vanta-backup.js')) return new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        const injected = html.replace('</body>', '<script src="vanta-backup.js"></script>\n</body>');
        const headers = new Headers(response.headers);
        headers.set('content-type', 'text/html; charset=utf-8');
        headers.delete('content-length');
        return new Response(injected, { status: response.status, statusText: response.statusText, headers });
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
