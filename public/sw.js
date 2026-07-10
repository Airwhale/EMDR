// Service Worker for EMDR / ART Self-Administered Experience
const VERSION = "emdr-v3";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

// Minimal app shell to precache on install.
const APP_SHELL = ["/", "/favicon.ico", "/manifest.json"];

// Bound the runtime cache so hashed chunks from successive deploys and
// on-demand pages can't grow storage without limit (matters on phones).
const RUNTIME_MAX_ENTRIES = 80;

// --- Install: precache the app shell ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate immediately instead of waiting for existing tabs to close
  self.skipWaiting();
});

// --- Activate: clean up old cache versions ---
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// --- Fetch: routing strategies ---
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Never intercept media. HTMLMediaElement requests carry Range headers:
  // Cache.put() rejects 206 responses, and serving a cached 200 to a Range
  // request breaks playback on iOS Safari. The browser HTTP cache handles
  // these fine on its own.
  if (request.headers.has("range") || url.pathname.startsWith("/audio/")) return;

  // Hash-named immutable build assets: cache-first. This also keeps an
  // already-cached page working during the deploy window when the CDN has
  // purged the previous deploy's chunks.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(networkFirst(request));
});

// --- Strategy: cache-first (immutable assets) ---
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
    trimCache(cache);
  }
  return response;
}

// --- Strategy: network-first with cache fallback ---
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      trimCache(cache);
      return response;
    }
    // The network answered but with an error (e.g. 404 for a resource from
    // a purged deploy) — prefer a cached copy over breaking the page.
    const cached = await caches.match(request);
    return cached || response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // For navigation requests, try returning the cached root page as a fallback
    if (request.mode === "navigate") {
      const fallback = await caches.match("/");
      if (fallback) return fallback;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// --- Evict oldest entries beyond the cap (fire-and-forget) ---
async function trimCache(cache) {
  try {
    const keys = await cache.keys();
    if (keys.length <= RUNTIME_MAX_ENTRIES) return;
    for (const key of keys.slice(0, keys.length - RUNTIME_MAX_ENTRIES)) {
      await cache.delete(key);
    }
  } catch {
    // Best-effort housekeeping
  }
}
