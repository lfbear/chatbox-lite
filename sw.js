/* Chatbox Lite — optional service worker.
 *
 * Present  → the app installs as a Chrome/Edge app and works offline.
 * Absent   → index.html still runs fine as a plain single-page app
 *            (its registration call in index.html just fails silently).
 *
 * The whole app lives in index.html, so the "app shell" is a single document.
 * We cache it on first online visit and replay it when offline; CDN assets
 * (KaTeX, highlight.js, fonts) are cached opportunistically as they're used.
 *
 * Bump VERSION to force-refresh the cache after shipping a new index.html.
 */
const VERSION = "chatbox-lite-v3";
const APP_SHELL = "./"; // resolves to the directory index = index.html
// Best-effort precache. Each is added individually so one 404 (e.g. icons not
// deployed) doesn't abort the whole install.
const PRECACHE = [APP_SHELL, "manifest.webmanifest", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) =>
      Promise.all(PRECACHE.map((u) => cache.add(u).catch(() => {})))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // App navigations: network-first (so a new index.html shows up), with the
  // cached shell as the offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches
            .match(req, { ignoreSearch: true })
            .then((r) => r || caches.match(APP_SHELL, { ignoreSearch: true }))
        )
    );
    return;
  }

  // Everything else (same-origin icons, cross-origin CDN assets):
  // stale-while-revalidate — fast from cache, refreshed in the background.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          // Cache successful and opaque (no-CORS CDN) responses alike.
          if (res && (res.ok || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
