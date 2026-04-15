// Service Worker personalizado — Appicultor Pro
// Este archivo se fusiona con el SW generado por next-pwa (Workbox)

// ── Cache de rutas del dashboard ──────────────────────────────
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// ── Offline fallback ─────────────────────────────────────────
// Muestra una página offline cuando no hay conexión y el recurso no está cacheado
const OFFLINE_URL = '/_offline'

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL).then((r) => r ?? Response.error())
      )
    )
  }
})
