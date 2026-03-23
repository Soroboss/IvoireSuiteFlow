"use client";

import { useMemo, useState } from "react";
import { addDays, format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import type { BookingMode } from "@/types/room";

type CalendarReservation = {
  id: string;
  room_id: string;
  room_number: string;
  room_type_name: string;
  client_name: string | null;
  booking_mode: BookingMode;
  check_in_at: string;
  check_out_at: string;
  pass_type?: string | null;
};

const modeColors: Record<BookingMode, string> = {
  hourly: "bg-isf-warning/85",
  nightly: "bg-isf-gold/85",
  stay: "bg-isf-info/85",
  pass: "bg-isf-purple/85"
};

export function RoomCalendar({ reservations }: { reservations: CalendarReservation[] }) {
  const [rangeDays, setRangeDays] = useState<14 | 30>(14);
  const [selected, setSelected] = useState<CalendarReservation | null>(null);
  const [newBookingHint, setNewBookingHint] = useState<string | null>(null);

  const start = startOfDay(new Date());
  const days = useMemo(
    () => Array.from({ length: rangeDays }, (_, i) => addDays(start, i)),
    [rangeDays, start]
  );

  const grouped = useMemo(() => {
    return reservations.reduce(
      (acc, reservation) => {
        const key = reservation.room_type_name || "Autres";
        if (!acc[key]) acc[key] = [];
        acc[key].push(reservation);
        return acc;
      },
      {} as Record<string, CalendarReservation[]>
    );
  }, [reservations]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-isf-cream">Planning d'occupation</h2>
        <div className="rounded-md border border-isf-border bg-isf-bgCard p-1">
          <button onClick={() => setRangeDays(14)} className={`rounded-md px-3 py-1 text-sm ${rangeDays === 14 ? "bg-isf-gold text-black" : "text-isf-textSecondary"}`}>14 jours</button>
          <button onClick={() => setRangeDays(30)} className={`rounded-md px-3 py-1 text-sm ${rangeDays === 30 ? "bg-isf-gold text-black" : "text-isf-textSecondary"}`}>30 jours</button>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-isf-border bg-isf-bgCard">
        <div className="min-w-[950px]">
          <div className="sticky top-0 z-20 grid grid-cols-[200px_repeat(30,minmax(48px,1fr))] border-b border-isf-border bg-isf-bgElevated">
            <div className="sticky left-0 z-30 border-r border-isf-border bg-isf-bgElevated p-2 text-xs text-isf-textMuted">Logements</div>
            {days.map((day, index) => (
              <div
                key={index}
                className={`border-r border-isf-border p-2 text-center text-xs text-isf-textSecondary ${
                  index === 0 ? "border-l-2 border-l-isf-error" : ""
                }`}
              >
                {format(day, "dd/MM", { locale: fr })}
              </div>
            ))}
          </div>

          {Object.entries(grouped).map(([typeName, items]) => (
            <div key={typeName}>
              <div className="sticky left-0 z-10 border-b border-isf-border bg-isf-bgDeep px-2 py-1 text-xs font-semibold uppercase tracking-wide text-isf-textMuted">
                {typeName}
              </div>
              {items.map((reservation) => {
                const startIndex = Math.max(
                  0,
                  Math.floor((new Date(reservation.check_in_at).getTime() - start.getTime()) / 86400000)
                );
                const endIndex = Math.max(
                  startIndex + 1,
                  Math.ceil((new Date(reservation.check_out_at).getTime() - start.getTime()) / 86400000)
                );
                const span = Math.max(1, endIndex - startIndex);
                return (
                  <div key={reservation.id} className="grid grid-cols-[200px_repeat(30,minmax(48px,1fr))] border-b border-isf-border">
                    <button className="sticky left-0 border-r border-isf-border bg-isf-bgCard p-2 text-left text-xs text-isf-cream">
                      {reservation.room_number}
                    </button>
                    {days.map((_, col) => {
                      const isStart = col === startIndex;
                      const inside = col >= startIndex && col < endIndex;
                      if (isStart) {
                        return (
                          <button
                            key={col}
                            onClick={() => setSelected(reservation)}
                            style={{ gridColumn: `${col + 1} / span ${span}` }}
                            className={`relative z-10 m-1 rounded-md px-2 py-1 text-left text-[11px] text-black ${modeColors[reservation.booking_mode]}`}
                          >
                            {reservation.booking_mode === "hourly"
                              ? "Horaire"
                              : reservation.booking_mode === "pass"
                                ? `Pass ${reservation.pass_type ?? ""}`
                                : reservation.client_name ?? "Réservation"}
                          </button>
                        );
                      }
                      return (
                        <button
                          key={col}
                          className={`${inside ? "bg-transparent" : "border-r border-isf-border/50 hover:bg-isf-gold/10"} min-h-8`}
                          onClick={() =>
                            !inside &&
                            setNewBookingHint(
                              `Nouvelle réservation pour Chambre ${reservation.room_number} le ${format(days[col], "dd/MM", {
                                locale: fr
                              })}`
                            )
                          }
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <p className="font-serif text-lg text-isf-cream">Réservation {selected.id.slice(0, 8)}</p>
          <p className="text-sm text-isf-textSecondary">
            Chambre {selected.room_number} · {selected.client_name ?? "Client walk-in"} · {selected.booking_mode}
          </p>
        </div>
      ) : null}
      {newBookingHint ? (
        <div className="rounded-xl border border-isf-gold/40 bg-isf-gold/10 p-3 text-sm text-isf-gold">{newBookingHint}</div>
      ) : null}
    </div>
  );
}
