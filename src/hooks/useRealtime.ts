"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/insforge/client";

export function useRealtimeRooms(establishmentId: string, onChange: () => void) {
  useEffect(() => {
    // InsForge realtime est basé sur du pub/sub WebSocket, pas sur des triggers Postgres "postgres_changes"
    // comme Supabase. Sans setup explicite côté backend (publish lors de changements rooms),
    // on bascule sur un polling léger.
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_INSFORGE_BASE_URL) {
      return;
    }

    // TODO: remplacer par insforge.realtime.subscribe/publish quand on aura un channel backend.
    const interval = window.setInterval(() => onChange(), 8000);

    return () => {
      window.clearInterval(interval);
    };
  }, [establishmentId, onChange]);
}
