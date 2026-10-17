// Offline-Cache: immer zuerst das Netz (damit neue Versionen sofort ankommen), ohne Netz die zuletzt geladene Fassung
const CACHE = 'mio-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/')) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(r => {   // no-cache: Browser-Zwischenspeicher immer beim Server nachfragen lassen
    if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: !u.pathname.endsWith('.mp3') }).then(r => r || caches.match('./'))));
});
