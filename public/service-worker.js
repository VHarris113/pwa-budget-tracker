const FILES_TO_CACHE = [
    "/",
    "/public/index.html",
    "/public/icons/icon-192x192.png",
    "/public/icons/icon-512x512.png",
    "/public/db.js",
    "/public/index.js",
    "/public/manifest.webmanifest",
    "/public/style.css",
    "/public/favicon.ico",
    "/public/service-worker.js"
];

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE)
        })
    )
    .catch((err) => {
        console.log("Add all error", err);
    })
        .catch((err) => {
            console.log(err);
        });

    self.skipWaiting();
});

self.addEventListener("activate", function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
});
  
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
            return fetch(evt.request)
            .then(response => {
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
                return response;
              })
              .catch(() => {
                return cache.match(evt.request);
              });
          })
          .catch(err => console.log(err))
        );
        return;
        }

        evt.respondWith(
            caches.match(evt.request).then((response) => {
                return response || fetch(evt.request);
        })
    );
});