const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.json",
    "/style.css",
    "/icons/icon-192x192.png",
    "icons/icon-512x512.png"
];

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
        caches.open(DATA_CACHE_NAME).then(cache => {
            return fetch(evt.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );
        return;
    }
    evt.respondWith(
        fetch(evt.request).catch(() => {
            return caches.match(evt.request).then((response) => {
                if (response) {
                    return response;
                } else if (evt.request.headers.get("accept").includes("text/html")) {
                    return caches.match("/");
                }
            });
        })
    );
});
  