"use client";

import Link from "next/link";
import { BedDouble, Building2, Clock3, UserRound } from "lucide-react";
import { BookingModeBadge } from "@/components/shared/BookingModeBadge";
import { RoomStatusBadge } from "@/components/rooms/RoomStatusBadge";
import { HourlyTimer } from "@/components/rooms/HourlyTimer";
import { RoomQuickActions } from "@/components/rooms/RoomQuickActions";
import { useTimer } from "@/hooks/useTimer";
import { formatDate, formatFCFA } from "@/lib/utils";
import type { RoomStatus, RoomWithRelations } from "@/types/room";

type RoomCardProps = {
  room: RoomWithRelations;
  onStatusChange: (roomId: string, status: RoomStatus) => void;
};

export function RoomCard({ room, onStatusChange }: RoomCardProps) {
  const current = room.current_reservation;
  const { isExpired } = useTimer(
    room.status === "occupied" && current?.booking_mode === "hourly" ? current.timer_expires_at : null
  );

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border bg-isf-bgCard p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-isf-borderLight ${
        isExpired ? "border-isf-error animate-pulse" : "border-isf-border"
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="font-serif text-[22px] font-bold leading-none text-isf-cream">{room.room_number}</h3>
          <p className="mt-1 text-xs text-isf-textSecondary">{room.room_type?.name ?? "Type non défini"}</p>
        </div>
        <RoomStatusBadge status={room.status} />
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs text-isf-textMuted">
        <Building2 className="h-3.5 w-3.5" />
        <span>Étage: {room.floor ?? "-"}</span>
      </div>

      {room.status === "occupied" && current?.booking_mode === "hourly" ? (
        <div className="mb-3">
          <HourlyTimer timerExpiresAt={current.timer_expires_at} />
        </div>
      ) : null}

      {room.status === "occupied" && current ? (
        <div className="mb-3 rounded-lg border border-isf-border bg-isf-bgElevated p-2.5">
          <div className="flex items-center gap-2 text-xs text-isf-textSecondary">
            <UserRound className="h-3.5 w-3.5" />
            <span>{current.client_name ?? "Client walk-in"}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <BookingModeBadge mode={current.booking_mode} />
            <span className="flex items-center gap-1 text-xs text-isf-textMuted">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDate(current.check_out_at, "HH:mm")}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-isf-textMuted">À partir de</span>
        <span className="text-sm font-semibold text-isf-gold">
          {formatFCFA(room.room_type?.base_price_night ?? 0)}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(room.room_type?.amenities ?? []).slice(0, 4).map((amenity) => (
          <span key={amenity} className="rounded-md bg-white/5 px-2 py-1 text-[11px] text-isf-textSecondary">
            {amenity.replaceAll("_", " ")}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Link href={`/rooms/${room.id}`} className="inline-flex items-center gap-1 text-xs text-isf-textSecondary hover:text-isf-cream">
          <BedDouble className="h-3.5 w-3.5" />
          Détails
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full border-t border-isf-border bg-isf-bgElevated/95 p-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <RoomQuickActions
          roomId={room.id}
          status={room.status}
          currentReservationId={current?.id}
          onStatusChange={(status) => onStatusChange(room.id, status)}
        />
      </div>
    </article>
  );
}
