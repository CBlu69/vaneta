const CACHE_NAME = 'vanta-cache-v3';
const ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './jalali.js',
  './manifest.json',
  './vanta-backup.js',
  './tasks-recurring.js',
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

  const url = new URL(event.request.url);
  const isAppJs = url.pathname.endsWith('/app.js');

  // Keep the original app.js intact in Git, but enhance its response with
  // the recurring-task module at runtime. This lets the feature work offline
  // without risking the core application file.
  if (isAppJs) {
    event.respondWith((async () => {
      try {
        const [appResponse, extensionResponse] = await Promise.all([
          fetch(event.request),
          fetch(new URL('./tasks-recurring.js', self.location.origin))
        ]);
        if (!appResponse.ok || !extensionResponse.ok) throw new Error('recurring module unavailable');

        const appCode = await appResponse.text();
        const extensionCode = await extensionResponse.text();
        const combined = `${appCode}\n\n/* VANTA recurring tasks */\n${extensionCode}`;
        const headers = new Headers(appResponse.headers);
        headers.set('content-type', 'application/javascript; charset=utf-8');
        headers.delete('content-length');
        const response = new Response(combined, {
          status: appResponse.status,
          statusText: appResponse.statusText,
          headers
        });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        return caches.match(event.request);
      }
    })());
    return;
  }

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
