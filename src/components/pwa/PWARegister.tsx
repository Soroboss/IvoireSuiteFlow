"use client";

import { useEffect } from "react";
import { syncOfflineBookings } from "@/lib/offline-booking-queue";

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").then(async (registration) => {
      if ("sync" in registration) {
        try {
          await (registration as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync.register("isf-sync-bookings");
        } catch {
          // Fallback handled by online listener.
        }
      }
    }).catch(() => undefined);

    const onOnline = () => {
      syncOfflineBookings().catch(() => undefined);
    };

    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
}
