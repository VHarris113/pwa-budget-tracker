const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.json",
    "/style.css",
    "/icons/icon-192x192.png",
    "icons/icon-512x512.png"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", evt => {
    evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
        })
    );
});
  

self.addEventListener("fetch", evt => {
    if (evt.request.url.includes("/api/")) {
        console.log('[Server Worker] Fetch(data)', evt.request.url);

    evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(async cache => {
          try {
                const response = await fetch(evt.request);
                if (response.status === 200) {
                    cache.put(evt.request.url, response.clone());
                }
                return response;
            } catch (err) {
                return await cache.match(evt.request);
            }
        })
    )
    return;
    }
  
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
  });
  