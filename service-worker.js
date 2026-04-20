// Simple cache-first service worker. Caches static assets; network-only for
// Lambda URL (which handles AI features). Version-bust via CACHE_NAME.

const CACHE_NAME = 'lsatprep-static-v1-2026-04-19-placeholder';
const STATIC_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './questions.json',
  './taxonomy.json',
  './prompts.json',
  './styles/main.css',
  './modules/router.js',
  './modules/store.js',
  './modules/bank.js',
  './modules/selector.js',
  './modules/theme.js',
  './modules/api.js',
  './modules/config.js',
  './modules/score.js',
  './modules/lg-solver.js',
  './modules/components/nav.js',
  './modules/components/question-card.js',
  './modules/components/feedback.js',
  './modules/components/toast.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Never cache Lambda calls.
  if (url.hostname.endsWith('.on.aws')) return;
  // Same-origin static assets: cache-first.
  if (event.request.method === 'GET' && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(hit => hit || fetch(event.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match('./')))
    );
  }
});
