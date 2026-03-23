"use client";

import { useMemo } from "react";
import { RoomTypeManager } from "@/components/rooms/RoomTypeManager";
import { createClient } from "@/lib/supabase/client";
import { useRooms } from "@/hooks/useRooms";
import type { RoomTypeRow } from "@/types/room";

export default function RoomTypesPage() {
  const { roomTypes, establishmentId } = useRooms();
  const canUseSupabase = typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const sorted = useMemo(() => [...roomTypes].sort((a, b) => a.sort_order - b.sort_order), [roomTypes]);

  const handleCreate = async (payload: Partial<RoomTypeRow>) => {
    if (!canUseSupabase) return;
    const supabase = createClient();
    await supabase.from("room_types").insert({
      establishment_id: establishmentId,
      organization_id: "11111111-1111-1111-1111-111111111111",
      name: payload.name,
      description: payload.description ?? null,
      base_price_hour: payload.base_price_hour ?? 0,
      base_price_night: payload.base_price_night ?? 0,
      weekend_price_night: payload.weekend_price_night ?? 0,
      high_season_price_night: payload.high_season_price_night ?? 0,
      holiday_price_night: payload.holiday_price_night ?? 0,
      base_price_week: payload.base_price_week ?? 0,
      base_price_month: payload.base_price_month ?? 0,
      base_price_day_pass: payload.base_price_day_pass ?? 0,
      deposit_amount: payload.deposit_amount ?? 0,
      capacity_adults: payload.capacity_adults ?? 2,
      capacity_children: payload.capacity_children ?? 0,
      amenities: payload.amenities ?? [],
      sort_order: payload.sort_order ?? 0,
      is_active: payload.is_active ?? true
    });
  };

  const handleUpdate = async (id: string, payload: Partial<RoomTypeRow>) => {
    if (!canUseSupabase) return;
    const supabase = createClient();
    await supabase.from("room_types").update(payload).eq("id", id);
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl text-isf-cream">Types de logements</h1>
        <p className="text-sm text-isf-textSecondary">Gère les tarifs, capacités, équipements et photos par type.</p>
      </div>
      <RoomTypeManager types={sorted} onCreate={handleCreate} onUpdate={handleUpdate} />
    </section>
  );
}
