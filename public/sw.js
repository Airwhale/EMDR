// Service Worker for EMDR / ART Self-Administered Experience
const CACHE_NAME = "emdr-v2";

// Minimal app shell to precache on install.
// Audio files are cached on-demand (there are 140+), not at install time.
const APP_SHELL = [
  "/",
  "/favicon.ico",
];

// --- Install: precache the app shell ---
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
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
          .filter((key) => key !== CACHE_NAME)
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
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // All same-origin requests: network-first with cache fallback
  event.respondWith(networkFirst(request));
});

// --- Strategy: network-first with cache fallback ---
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
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
