var CACHE_NAME = "toroapp-transfar-v2";
var CACHE_PREFIX = "toroapp-transfar-";
var urlsToCache = [
  "./",
  "./sheet.css",
  "./config.js",
  "./script.js",
  "./manifest.json",
  "./images/location.png",
  "./images/app-icon-192.png",
  "./images/app-icon-512x512.png"
];
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.filter(function(name) {
        return name.indexOf(CACHE_PREFIX) === 0 && name !== CACHE_NAME;
      }).map(function(name) {
        return caches.delete(name);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});
self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response.ok && response.type === "basic") {
        var copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
          return cache.put(event.request, copy);
        }));
      }
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});
