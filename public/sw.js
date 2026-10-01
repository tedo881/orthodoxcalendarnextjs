/* Service worker of the church calendar (PWA).
 * - pages and calendar data are cached, so the calendar also works offline;
 * - icons and Next.js files are served from the cache first;
 * - lives of saints and pictures from R2 are cached once they have been opened.
 * Raise VERSION after a deployment that changes the files in /data.
 */
const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

const SHELL = [
  "/",
  "/year/",
  "/troparia/",
  "/saints/",
  "/glossary/",
  "/about/",
  "/lives/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icons/cross3.png",
  "/icons/fish3.png",
  "/data/calendar_data.json",
  "/data/day_meta.json",
  "/data/icons.json",
  "/data/life_index.json",
  "/data/saints.json",
  "/data/fasting.bin",
  "/data/day_images.bin",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = (await caches.match(request)) || (await caches.match("/"));
    if (cached) return cached;
    throw new Error("offline");
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok || response.type === "opaque") cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // pages: fresh from the network, the cached copy when offline
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
      event.respondWith(cacheFirst(request));
      return;
    }
    if (url.pathname.startsWith("/data/")) {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  // lives of saints and pictures on R2
  if (url.hostname.endsWith(".r2.dev")) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
