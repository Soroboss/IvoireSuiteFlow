"use client";

import { useMemo } from "react";
import { RoomGrid } from "@/components/rooms/RoomGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useRealtimeRooms } from "@/hooks/useRealtime";
import { useRooms } from "@/hooks/useRooms";

export default function RoomsPage() {
  const { rooms, counts, loading, establishmentId, refreshRooms, updateRoomStatus } = useRooms();
  useRealtimeRooms(establishmentId, refreshRooms);

  const hasRooms = useMemo(() => rooms.length > 0, [rooms.length]);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl text-isf-cream">Logements</h1>
        <p className="text-sm text-isf-textSecondary">Suivi en temps réel des statuts, occupation et actions rapides.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-isf-border bg-isf-bgCard p-8">
          <LoadingSpinner />
        </div>
      ) : hasRooms ? (
        <RoomGrid rooms={rooms} counts={counts} onStatusChange={updateRoomStatus} />
      ) : (
        <EmptyState title="Aucun logement trouvé" description="Ajoute des logements pour démarrer la gestion des réservations." />
      )}
    </section>
  );
}
