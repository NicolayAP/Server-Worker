const CACHE_NAME = "cache-v1";

const IMAGES = ["./dog.svg", "./cat.svg", "./helicopter.svg", "./fish.svg"];

let currentIndex = 0;

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([...IMAGES, "./offline.html", "./data.json"]);
    }),
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  self.clients.claim();
});

// MENSAJES DESDE EL CLIENTE
self.addEventListener("message", (event) => {
  if (event.data.action === "randomImage") {
    currentIndex = Math.floor(Math.random() * IMAGES.length);
  }
});

// FETCH
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Imagen aleatoria
  if (url.pathname.includes("dog.svg")) {
    event.respondWith(caches.match(IMAGES[currentIndex]));

    return;
  }

  // Network First para data.json
  if (url.pathname.includes("data.json")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request)),
    );

    return;
  }

  // Fallback offline para documentos HTML
  if (event.request.destination === "document") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./offline.html")),
    );

    return;
  }
});
