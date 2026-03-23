"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RoomStatus, RoomTypeRow, RoomWithRelations } from "@/types/room";

const FALLBACK_ESTABLISHMENT_ID = "22222222-2222-2222-2222-222222222221";

export function useRooms(establishmentId?: string) {
  const activeEstablishmentId = establishmentId ?? FALLBACK_ESTABLISHMENT_ID;

  const [rooms, setRooms] = useState<RoomWithRelations[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const canUseSupabase = typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const fetchRooms = useCallback(async () => {
    if (!canUseSupabase) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("rooms")
      .select(
        `
        id,
        room_number,
        floor,
        status,
        is_active,
        room_types:room_type_id(id,name,amenities,base_price_night),
        reservations!rooms_current_reservation_fk(
          id,
          booking_mode,
          check_out_at,
          timer_expires_at,
          clients:client_id(full_name)
        )
      `
      )
      .eq("establishment_id", activeEstablishmentId)
      .eq("is_active", true)
      .order("room_number", { ascending: true });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const mapped: RoomWithRelations[] = data.map((row: any) => {
      const roomType = Array.isArray(row.room_types) ? row.room_types[0] : row.room_types;
      const reservation = Array.isArray(row.reservations) ? row.reservations[0] : row.reservations;
      const client = reservation
        ? Array.isArray(reservation.clients)
          ? reservation.clients[0]
          : reservation.clients
        : null;
      return {
        id: row.id,
        room_number: row.room_number,
        floor: row.floor,
        status: row.status,
        is_active: row.is_active,
        room_type: roomType
          ? {
              id: roomType.id,
              name: roomType.name,
              amenities: roomType.amenities ?? [],
              base_price_night: roomType.base_price_night
            }
          : null,
        current_reservation: reservation
          ? {
              id: reservation.id,
              booking_mode: reservation.booking_mode,
              check_out_at: reservation.check_out_at,
              timer_expires_at: reservation.timer_expires_at,
              client_name: client?.full_name ?? null
            }
          : null
      };
    });

    setRooms(mapped);
    setLoading(false);
  }, [activeEstablishmentId, canUseSupabase]);

  const fetchRoomTypes = useCallback(async () => {
    if (!canUseSupabase) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("room_types")
      .select("*")
      .eq("establishment_id", activeEstablishmentId)
      .order("sort_order", { ascending: true });

    setRoomTypes((data as RoomTypeRow[]) ?? []);
  }, [activeEstablishmentId, canUseSupabase]);

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, [fetchRooms, fetchRoomTypes]);

  const counts = useMemo(() => {
    return rooms.reduce(
      (acc, room) => {
        acc.all += 1;
        acc[room.status] += 1;
        return acc;
      },
      {
        all: 0,
        available: 0,
        occupied: 0,
        cleaning: 0,
        maintenance: 0,
        out_of_service: 0
      } as Record<"all" | RoomStatus, number>
    );
  }, [rooms]);

  const updateRoomStatus = useCallback(
    async (roomId: string, status: RoomStatus) => {
      if (!canUseSupabase) return;
      const supabase = createClient();
      await supabase.from("rooms").update({ status }).eq("id", roomId);
      setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, status } : room)));
    },
    [canUseSupabase]
  );

  return {
    rooms,
    roomTypes,
    loading,
    counts,
    establishmentId: activeEstablishmentId,
    refreshRooms: fetchRooms,
    updateRoomStatus
  };
}
