"use client";

import Link from "next/link";
import type { RoomStatus } from "@/types/room";

type Props = {
  roomId: string;
  status: RoomStatus;
  currentReservationId?: string;
  onStatusChange: (status: RoomStatus) => void;
};

export function RoomQuickActions({ roomId, status, currentReservationId, onStatusChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {status === "available" ? (
        <Link href={`/reservations/new?room=${roomId}`} className="rounded-md bg-isf-gold px-2 py-1 text-xs font-medium text-black">
          Réservation rapide
        </Link>
      ) : null}

      {status === "occupied" && currentReservationId ? (
        <>
          <Link href={`/reservations/${currentReservationId}`} className="rounded-md border border-isf-borderLight px-2 py-1 text-xs">
            Voir réservation
          </Link>
          <button onClick={() => onStatusChange("available")} className="rounded-md bg-isf-error/15 px-2 py-1 text-xs text-isf-error">
            Check-out
          </button>
        </>
      ) : null}

      <button onClick={() => onStatusChange("cleaning")} className="rounded-md border border-isf-warning/40 px-2 py-1 text-xs text-isf-warning">
        Nettoyage
      </button>
      <button onClick={() => onStatusChange("maintenance")} className="rounded-md border border-isf-textMuted/40 px-2 py-1 text-xs text-isf-textMuted">
        Maintenance
      </button>
      <button onClick={() => onStatusChange("available")} className="rounded-md border border-isf-success/40 px-2 py-1 text-xs text-isf-success">
        Disponible
      </button>
    </div>
  );
}
