/**
 * CHRONOVA Service Worker
 * Premium Interactive Digital Clock & Dynamic Wallpaper
 * Created By Shiv Yogi
 */

const CACHE_NAME = 'chronova-cache-v1.0.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './assets/fonts/fonts.css',
  './css/main.css',
  './css/glass.css',
  './css/animations.css',
  './css/themes.css',
  './css/mobile.css',
  './css/desktop.css',
  './js/storage-engine.js',
  './js/color-engine.js',
  './js/animation-engine.js',
  './js/wallpaper-engine.js',
  './js/clock-engine.js',
  './js/widget-engine.js',
  './js/gesture-engine.js',
  './js/fullscreen-engine.js',
  './js/settings-engine.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[ServiceWorker] Pre-caching non-fatal warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never cache external API weather requests or non-GET requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Network-first for live weather, Cache-first for local static assets
  if (url.hostname.includes('open-meteo.com') || url.hostname.includes('api.')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
