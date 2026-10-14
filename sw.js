const CACHE = 'gramy-v1';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// Stránka: sieť najprv (aby prišli aktualizácie), cache ako záloha offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  e.respondWith(
    isPage
      ? fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
          .catch(() => caches.match('./index.html'))
      : caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
          const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r;
        }))
  );
});
