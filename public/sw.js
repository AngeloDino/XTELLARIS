// Service worker mínimo de Xtellaris: hace la app instalable y cachea los
// estáticos. Las páginas van siempre a la red (los datos de inventario deben
// estar frescos); si no hay conexión se muestra un aviso simple.
const CACHE = "xtellaris-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // Estáticos con hash: cache-first.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  // Navegación: red primero, aviso amable si no hay conexión.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response(
            "<!doctype html><html lang='es'><body style='font-family:sans-serif;text-align:center;padding:3rem'>" +
              "<h1>Sin conexión</h1><p>Xtellaris necesita internet para mostrar su inventario. " +
              "Revise su conexión e intente de nuevo.</p></body></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          )
      )
    );
  }
});
