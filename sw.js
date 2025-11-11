const cacheName = "sos-app-cache-v1";
const staticAssets = [
  "./",
  "./index.html",
  "./script.js",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", async event => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
