// Service Worker — Guide de Prière Ṣalāh
// Met en cache les ressources essentielles pour un usage hors ligne

const CACHE = "salah-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/images/Takbir.png",
  "/images/Quiyam.png",
  "/images/Ruku.png",
  "/images/Itidal.png",
  "/images/Sujud.png",
  "/images/Jalsa.png",
  "/images/Tashahud.png",
  "/images/Taslim.png",
];

// Installation — mise en cache des ressources
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation — suppression des anciens caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first pour les assets, network first pour l'API
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // API Aladhan et mp3quran → toujours réseau
  if (url.hostname.includes("aladhan") || url.hostname.includes("mp3quran") || url.hostname.includes("fonts")) {
    e.respondWith(fetch(e.request).catch(() => new Response("", {status: 503})));
    return;
  }

  // Assets locaux → cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});

// Notifications push (pour les horaires de prière)
self.addEventListener("push", e => {
  const data = e.data ? e.data.json() : {};
  self.registration.showNotification(data.title || "🕌 Rappel de prière", {
    body: data.body || "Il est temps de se préparer pour la prière.",
    icon: "/images/Takbir.png",
    badge: "/images/Takbir.png",
    vibrate: [200, 100, 200],
  });
});
