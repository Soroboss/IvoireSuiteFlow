"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, LayoutGrid, List, Plus } from "lucide-react";
import { RoomCard } from "@/components/rooms/RoomCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchInput } from "@/components/shared/SearchInput";
import { ROOM_STATUSES } from "@/lib/constants";
import type { RoomStatus, RoomWithRelations } from "@/types/room";

type ViewMode = "grid" | "list" | "calendar";
type StatusFilter = "all" | RoomStatus;

type Props = {
  rooms: RoomWithRelations[];
  counts: Record<"all" | RoomStatus, number>;
  onStatusChange: (roomId: string, status: RoomStatus) => void;
};

export function RoomGrid({ rooms, counts, onStatusChange }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<ViewMode>("grid");

  const roomTypes = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.room_type?.name).filter(Boolean) as string[])),
    [rooms]
  );
  const floors = useMemo(
    () => Array.from(new Set(rooms.map((room) => room.floor).filter(Boolean) as string[])),
    [rooms]
  );

  const filtered = useMemo(() => {
    return rooms.filter((room) => {
      const matchesStatus = statusFilter === "all" || room.status === statusFilter;
      const matchesType = typeFilter === "all" || room.room_type?.name === typeFilter;
      const matchesFloor = floorFilter === "all" || room.floor === floorFilter;
      const matchesSearch = room.room_number.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesType && matchesFloor && matchesSearch;
    });
  }, [floorFilter, rooms, search, statusFilter, typeFilter]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-isf-border bg-isf-bgCard p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3 py-1 text-xs ${statusFilter === "all" ? "bg-isf-gold text-black" : "bg-white/5 text-isf-textSecondary"}`}
          >
            Tous {counts.all}
          </button>
          {ROOM_STATUSES.filter((status) => status.value !== "out_of_service").map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={`rounded-full px-3 py-1 text-xs ${statusFilter === status.value ? "bg-isf-gold text-black" : status.color}`}
            >
              {status.label} {counts[status.value]}
            </button>
          ))}
        </div>

        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
            <option value="all">Tous les types</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} className="h-10 rounded-md border border-isf-border bg-isf-bgElevated px-3 text-sm">
            <option value="all">Tous les étages</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par numéro" />
          <div className="flex items-center gap-2 rounded-md border border-isf-border bg-isf-bgElevated p-1">
            <button onClick={() => setView("grid")} className={`rounded-md px-2 py-1 text-xs ${view === "grid" ? "bg-isf-gold text-black" : ""}`}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={`rounded-md px-2 py-1 text-xs ${view === "list" ? "bg-isf-gold text-black" : ""}`}><List className="h-4 w-4" /></button>
            <Link href="/rooms/calendar" className={`rounded-md px-2 py-1 text-xs ${view === "calendar" ? "bg-isf-gold text-black" : ""}`} onClick={() => setView("calendar")}><CalendarRange className="h-4 w-4" /></Link>
          </div>
          <Link href="/rooms/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-isf-gold px-3 text-sm font-medium text-black">
            <Plus className="h-4 w-4" />
            Ajouter un logement
          </Link>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-2">
          {filtered.map((room) => (
            <div key={room.id} className="flex items-center justify-between rounded-xl border border-isf-border bg-isf-bgCard p-3">
              <div>
                <p className="font-serif text-lg">{room.room_number}</p>
                <p className="text-xs text-isf-textSecondary">{room.room_type?.name} · Étage {room.floor ?? "-"}</p>
              </div>
              <StatusBadge label={room.status} className="bg-white/5 text-isf-textSecondary" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((room) => (
            <div key={room.id} className="transition-all duration-300">
              <RoomCard room={room} onStatusChange={onStatusChange} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
