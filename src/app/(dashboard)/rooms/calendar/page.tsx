"use client";

import { useEffect, useState } from "react";
import { RoomCalendar } from "@/components/rooms/RoomCalendar";
import { createClient } from "@/lib/insforge/client";

const ESTABLISHMENT_ID = "22222222-2222-2222-2222-222222222221";

type CalendarReservation = {
  id: string;
  room_id: string;
  room_number: string;
  room_type_name: string;
  client_name: string | null;
  booking_mode: "hourly" | "nightly" | "stay" | "pass";
  check_in_at: string;
  check_out_at: string;
  pass_type?: string | null;
};

export default function RoomsCalendarPage() {
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_INSFORGE_BASE_URL) {
      return;
    }
    const run = async () => {
      const insforge = createClient();
      const { data } = await insforge.database
        .from("reservations")
        .select(
          `
          id, room_id, booking_mode, check_in_at, check_out_at, pass_type,
          rooms:room_id(room_number, room_types:room_type_id(name)),
          clients:client_id(full_name)
        `
        )
        .eq("establishment_id", ESTABLISHMENT_ID)
        .in("status", ["confirmed", "checked_in", "checked_out"])
        .order("check_in_at", { ascending: true });

      const mapped = (data ?? []).map((row: any) => ({
        id: row.id,
        room_id: row.room_id,
        room_number: row.rooms?.room_number ?? "-",
        room_type_name: row.rooms?.room_types?.name ?? "Autres",
        client_name: row.clients?.full_name ?? null,
        booking_mode: row.booking_mode,
        check_in_at: row.check_in_at,
        check_out_at: row.check_out_at,
        pass_type: row.pass_type
      }));

      setReservations(mapped);
    };
    run();
  }, []);

  return <RoomCalendar reservations={reservations} />;
}
