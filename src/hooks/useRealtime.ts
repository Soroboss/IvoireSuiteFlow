"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeRooms(establishmentId: string, onChange: () => void) {
  useEffect(() => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }
    const supabase = createClient();
    const channel = supabase
      .channel(`isf-rooms-${establishmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `establishment_id=eq.${establishmentId}`
        },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [establishmentId, onChange]);
}
