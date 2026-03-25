"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { BedDouble, Hammer, History, TrendingUp } from "lucide-react";
import { BookingModeBadge } from "@/components/shared/BookingModeBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { FCFADisplay } from "@/components/shared/FCFADisplay";
import { RoomStatusBadge } from "@/components/rooms/RoomStatusBadge";
import { HourlyTimer } from "@/components/rooms/HourlyTimer";
import { createClient } from "@/lib/insforge/client";
import { formatDate } from "@/lib/utils";
import type { RoomWithRelations } from "@/types/room";

type HistoryItem = {
  id: string;
  booking_mode: "hourly" | "nightly" | "stay" | "pass";
  check_in_at: string;
  check_out_at: string;
  total_amount: number;
};

type MaintenanceItem = {
  id: string;
  issue: string;
  status: string;
  created_at: string;
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();

  const [room, setRoom] = useState<RoomWithRelations | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [tab, setTab] = useState<"history" | "revenues" | "maintenance">("history");

  useEffect(() => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_INSFORGE_BASE_URL) {
      return;
    }
    const run = async () => {
      const insforge = createClient();
      const { data: roomData } = await insforge.database
        .from("rooms")
        .select(
          `
          id, room_number, floor, status, is_active,
          room_types:room_type_id(id,name,amenities,base_price_night),
          reservations!rooms_current_reservation_fk(
            id, booking_mode, check_out_at, timer_expires_at, total_amount,
            clients:client_id(full_name)
          )
        `
        )
        .eq("id", params.id)
        .maybeSingle();

      if (roomData) {
        const roomType = Array.isArray(roomData.room_types) ? roomData.room_types[0] : roomData.room_types;
        const reservation = Array.isArray(roomData.reservations) ? roomData.reservations[0] : roomData.reservations;
        const client = reservation
          ? Array.isArray(reservation.clients)
            ? reservation.clients[0]
            : reservation.clients
          : null;
        setRoom({
          id: roomData.id,
          room_number: roomData.room_number,
          floor: roomData.floor,
          status: roomData.status,
          is_active: roomData.is_active,
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
        });
      }

      const { data: historyData } = await insforge.database
        .from("reservations")
        .select("id, booking_mode, check_in_at, check_out_at, total_amount")
        .eq("room_id", params.id)
        .order("check_in_at", { ascending: false })
        .limit(20);
      setHistory((historyData as HistoryItem[]) ?? []);

      const { data: maintenanceData } = await insforge.database
        .from("maintenance_requests")
        .select("id, issue, status, created_at")
        .eq("room_id", params.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setMaintenance((maintenanceData as MaintenanceItem[]) ?? []);
    };
    run();
  }, [params.id]);

  const stats = useMemo(() => {
    const totalRevenue = history.reduce((acc, item) => acc + Number(item.total_amount ?? 0), 0);
    const byMode = history.reduce(
      (acc, item) => {
        acc[item.booking_mode] += Number(item.total_amount ?? 0);
        return acc;
      },
      { hourly: 0, nightly: 0, stay: 0, pass: 0 }
    );

    return {
      totalRevenue,
      avgRevenue: history.length ? Math.round(totalRevenue / history.length) : 0,
      byMode
    };
  }, [history]);

  if (!room) {
    return <EmptyState title="Logement introuvable" description="Vérifie l'identifiant ou recharge la page." />;
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-serif text-3xl text-isf-cream">{room.room_number}</h1>
            <p className="text-sm text-isf-textSecondary">{room.room_type?.name} · Étage {room.floor ?? "-"}</p>
          </div>
          <RoomStatusBadge status={room.status} />
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h2 className="mb-2 font-serif text-xl">Galerie</h2>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="aspect-video rounded-lg border border-isf-border bg-isf-bgElevated grid place-items-center text-xs text-isf-textMuted">
                Photo {n}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-isf-textSecondary">Équipements</h3>
            <div className="flex flex-wrap gap-2">
              {(room.room_type?.amenities ?? []).map((a) => (
                <span key={a} className="rounded-md bg-white/5 px-2 py-1 text-xs text-isf-textSecondary">{a.replaceAll("_", " ")}</span>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
          <h2 className="mb-2 font-serif text-xl">Occupation en cours</h2>
          {room.current_reservation ? (
            <div className="space-y-2">
              <p className="text-sm text-isf-textSecondary">Client: {room.current_reservation.client_name ?? "Walk-in"}</p>
              <BookingModeBadge mode={room.current_reservation.booking_mode} />
              {room.current_reservation.booking_mode === "hourly" ? <HourlyTimer timerExpiresAt={room.current_reservation.timer_expires_at} /> : null}
              <p className="text-sm text-isf-textMuted">Fin prévue: {formatDate(room.current_reservation.check_out_at)}</p>
            </div>
          ) : (
            <p className="text-sm text-isf-textSecondary">Aucune réservation active.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-md bg-isf-gold px-3 py-2 text-sm font-medium text-black">Check-in rapide</button>
            <button className="rounded-md border border-isf-border px-3 py-2 text-sm">Check-out</button>
            <button className="rounded-md border border-isf-border px-3 py-2 text-sm">Modifier</button>
            <button className="rounded-md border border-isf-error/40 px-3 py-2 text-sm text-isf-error">Désactiver</button>
          </div>
        </article>
      </div>

      <section className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <div className="mb-3 flex items-center gap-2">
          <button onClick={() => setTab("history")} className={`rounded-md px-3 py-1.5 text-sm ${tab === "history" ? "bg-isf-gold text-black" : "bg-isf-bgElevated text-isf-textSecondary"}`}><History className="mr-1 inline h-4 w-4" />Historique</button>
          <button onClick={() => setTab("revenues")} className={`rounded-md px-3 py-1.5 text-sm ${tab === "revenues" ? "bg-isf-gold text-black" : "bg-isf-bgElevated text-isf-textSecondary"}`}><TrendingUp className="mr-1 inline h-4 w-4" />Revenus</button>
          <button onClick={() => setTab("maintenance")} className={`rounded-md px-3 py-1.5 text-sm ${tab === "maintenance" ? "bg-isf-gold text-black" : "bg-isf-bgElevated text-isf-textSecondary"}`}><Hammer className="mr-1 inline h-4 w-4" />Maintenance</button>
        </div>

        {tab === "history" ? (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-isf-border bg-isf-bgElevated p-2">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-isf-textMuted" />
                  <BookingModeBadge mode={item.booking_mode} />
                  <span className="text-xs text-isf-textSecondary">{formatDate(item.check_in_at, "dd/MM")} - {formatDate(item.check_out_at, "dd/MM")}</span>
                </div>
                <FCFADisplay value={Number(item.total_amount ?? 0)} />
              </div>
            ))}
          </div>
        ) : null}

        {tab === "revenues" ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-isf-border bg-isf-bgElevated p-3"><p className="text-xs text-isf-textMuted">CA total</p><p className="font-serif text-2xl text-isf-gold"><FCFADisplay value={stats.totalRevenue} /></p></div>
            <div className="rounded-lg border border-isf-border bg-isf-bgElevated p-3"><p className="text-xs text-isf-textMuted">CA moyen</p><p className="font-serif text-2xl text-isf-cream"><FCFADisplay value={stats.avgRevenue} /></p></div>
            <div className="rounded-lg border border-isf-border bg-isf-bgElevated p-3"><p className="text-xs text-isf-textMuted">CA horaire</p><p className="text-sm text-isf-warning"><FCFADisplay value={stats.byMode.hourly} /></p></div>
            <div className="rounded-lg border border-isf-border bg-isf-bgElevated p-3"><p className="text-xs text-isf-textMuted">CA nuitée</p><p className="text-sm text-isf-gold"><FCFADisplay value={stats.byMode.nightly} /></p></div>
          </div>
        ) : null}

        {tab === "maintenance" ? (
          <div className="space-y-2">
            {maintenance.map((item) => (
              <div key={item.id} className="rounded-lg border border-isf-border bg-isf-bgElevated p-3">
                <p className="text-sm text-isf-cream">{item.issue}</p>
                <p className="text-xs text-isf-textMuted">{item.status} · {formatDate(item.created_at, "dd/MM/yyyy")}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
