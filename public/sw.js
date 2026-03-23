const STATIC_CACHE = "isf-static-v1";
const DATA_CACHE = "isf-data-v1";
const STATIC_ASSETS = ["/", "/manifest.json", "/icons/isf-192.png", "/icons/isf-512.png"];
const OFFLINE_DB = "isf-offline";
const OFFLINE_STORE = "bookings";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DATA_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isStatic = ["style", "script", "font", "image"].includes(event.request.destination);
  const isData = url.pathname.includes("/api/public-bookings/availability") || url.pathname.includes("/book/");

  if (isStatic) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (isData) {
    event.respondWith(networkFirst(event.request));
  }
});

self.addEventListener("sync", (event) => {
  if (event.tag === "isf-sync-bookings") {
    event.waitUntil(syncQueuedBookings());
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(STATIC_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, message: "hors-ligne" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
        db.createObjectStore(OFFLINE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readQueuedBookings() {
  const db = await openOfflineDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, "readonly");
    const req = tx.objectStore(OFFLINE_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function clearQueuedBookings(ids) {
  const db = await openOfflineDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, "readwrite");
    ids.forEach((id) => tx.objectStore(OFFLINE_STORE).delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function syncQueuedBookings() {
  const queued = await readQueuedBookings();
  if (!queued.length) return;
  const payloads = queued.map((entry) => entry.payload);
  const response = await fetch("/api/public-bookings/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: payloads })
  });
  if (response.ok) {
    await clearQueuedBookings(queued.map((entry) => entry.id));
  }
}
