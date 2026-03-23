"use client";

import type { PublicBookingPayload } from "@/lib/publicBookingServer";

const DB_NAME = "isf-offline";
const STORE_NAME = "bookings";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineBooking(payload: PublicBookingPayload) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({ payload, createdAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function readQueue() {
  const db = await openDb();
  return await new Promise<Array<{ id: number; payload: PublicBookingPayload }>>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as Array<{ id: number; payload: PublicBookingPayload }>);
    req.onerror = () => reject(req.error);
  });
}

async function clearMany(ids: number[]) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    ids.forEach((id) => tx.objectStore(STORE_NAME).delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function syncOfflineBookings() {
  const queued = await readQueue();
  if (!queued.length) return { synced: 0 };

  const response = await fetch("/api/public-bookings/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: queued.map((entry) => entry.payload) })
  });

  if (!response.ok) {
    throw new Error("sync-failed");
  }

  await clearMany(queued.map((entry) => entry.id));
  return { synced: queued.length };
}
